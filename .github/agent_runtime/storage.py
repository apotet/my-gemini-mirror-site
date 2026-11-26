"""Durable Git checkpoints with atomic ref creation and fast-forward CAS.

State refs contain only agent records, not a copy of a contributor's source tree.
They never overwrite main or another agent's/contributor's branch.
"""
import base64
import json
import os
from pathlib import Path
import re
import subprocess
import urllib.error
import urllib.request

REPOSITORY = 'apotet/my-gemini-mirror-site'


class APIError(RuntimeError):
    def __init__(self,status,method,endpoint,reason='github_api_error'):
        self.status,self.method,self.endpoint,self.reason=status,method,endpoint.split('?')[0],reason
        super().__init__(f'HTTP {status}: {method} {self.endpoint} ({reason})')


class GitHub:
    def request(self,method,endpoint,data=None):
        req=urllib.request.Request('https://api.github.com/repos/'+REPOSITORY+endpoint,method=method,
            data=None if data is None else json.dumps(data).encode(),headers={
                'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json','Content-Type':'application/json'})
        try:
            with urllib.request.urlopen(req,timeout=60) as response:
                return None if response.status==204 else json.load(response)
        except urllib.error.HTTPError as exc:
            try: message=json.loads(exc.read(4096)).get('message')
            except (ValueError,AttributeError): message=None
            reason='actions_pr_creation_disabled' if message=='GitHub Actions is not permitted to create or approve pull requests.' else 'github_api_error'
            raise APIError(exc.code,method,endpoint,reason) from None

    def ref(self,name):
        try: return self.request('GET','/git/ref/heads/'+name)['object']['sha']
        except APIError as exc:
            if exc.status==404:return None
            raise

    def blob(self,data):
        return self.request('POST','/git/blobs',{'content':base64.b64encode(data).decode(),'encoding':'base64'})['sha']

    def comments(self,number):
        page=1
        while True:
            items=self.request('GET',f'/issues/{number}/comments?per_page=100&page={page}')
            yield from items
            if len(items)<100:break
            page+=1


class Ledger:
    def __init__(self,api,provider,key):
        if provider not in ('zai','kimi','gemini') or not re.fullmatch(r'(issue-[0-9]+|manual-[a-f0-9]{24})',key):
            raise ValueError('Invalid task identity')
        self.api,self.provider,self.key=api,provider,key
        self.branch=f'agents/state/{provider}-{key}'
        self.head=None

    def load(self):
        self.head=self.api.ref(self.branch)
        if self.head is None:return None
        commit=self.api.request('GET','/git/commits/'+self.head)
        entries=self.api.request('GET','/git/trees/'+commit['tree']['sha'])['tree']
        entry=next(e for e in entries if e['path']=='state.json')
        blob=self.api.request('GET','/git/blobs/'+entry['sha'])
        state=json.loads(base64.b64decode(blob['content']))
        if state.get('kind')!='netops-agent-v2' or state['provider']!=self.provider or state['key']!=self.key:
            raise ValueError('State branch is not owned by this task')
        return state

    def save(self,state):
        # Check expected head before creating a child; Git's non-force ref update
        # rejects sibling commits if another writer wins after this read.
        if self.api.ref(self.branch)!=self.head:
            raise ValueError('Checkpoint moved; do not overwrite or spend')
        # Deduplicate raw streams without losing bytes. Large streams are stored as
        # ordered Git blobs; no 2MB response cap or quadratic copies of old requests.
        sidecars=state.setdefault('sidecars',{})
        for call in state.get('calls',[]):
            response=call.get('response',{})
            raw=response.pop('raw',None)
            response.pop('chunks',None) # raw stream already retains every original chunk
            partial=call.pop('raw_partial_base64',None)
            for label,data in [('response',None if raw is None else raw.encode('utf-8')),
                               ('partial',None if partial is None else base64.b64decode(partial))]:
                if data is None:continue
                pieces=[]
                for i in range(0,max(1,len(data)),8*1024*1024):
                    path=f'calls/{call["id"]}/{label}-{i//(8*1024*1024):05d}.sse'
                    digest=self.api.blob(data[i:i+8*1024*1024]);sidecars[path]=digest;pieces.append(path)
                call[label+'_artifacts']=pieces
        blob=self.api.blob(json.dumps(state,ensure_ascii=False).encode())
        tree=self.api.request('POST','/git/trees',{'tree':[{'path':'state.json','mode':'100644','type':'blob','sha':blob},
            *[{'path':p,'mode':'100644','type':'blob','sha':s} for p,s in sorted(sidecars.items())]]})['sha']
        commit=self.api.request('POST','/git/commits',{'message':f'agent checkpoint: {self.provider}/{self.key} {state["status"]}',
            'tree':tree,'parents':[] if self.head is None else [self.head]})['sha']
        if self.head is None:
            self.api.request('POST','/git/refs',{'ref':'refs/heads/'+self.branch,'sha':commit})
        else:
            self.api.request('PATCH','/git/refs/heads/'+self.branch,{'sha':commit,'force':False})
        self.head=commit
        return commit

    def materialize(self,state,directory):
        for name,sha in state.get('sidecars',{}).items():
            if not re.fullmatch(r'calls/[0-9]+/(response|partial)-[0-9]{5}\.sse',name):
                raise ValueError('Invalid sidecar path')
            target=Path(directory)/'ledger-artifacts'/name
            if not target.exists():
                blob=self.api.request('GET','/git/blobs/'+sha)
                target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(base64.b64decode(blob['content']))



class Repository:
    def __init__(self,root,source):
        self.root=Path(root)
        if not re.fullmatch('[a-f0-9]{40}',source):raise ValueError('Expected immutable source SHA')
        self.source=source
        raw=self.git('ls-tree','-rz',source)
        self.entries={}
        for entry in raw.split(b'\0'):
            if not entry:continue
            meta,name=entry.split(b'\t',1)
            mode,kind,sha=meta.decode().split()
            if kind=='blob' and mode in ('100644','100755'):
                self.entries[name.decode()]={'sha':sha,'mode':mode}

    def git(self,*args):
        return subprocess.check_output(['git',*args],cwd=self.root,env={'PATH':os.environ.get('PATH',os.defpath),'LANG':'C.UTF-8'})

    def read(self,name):
        if name not in self.entries:raise ValueError('Missing file or symlink (never followed)')
        return self.git('cat-file','blob',self.entries[name]['sha'])

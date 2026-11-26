"""No model/network calls. Real Git snapshots, fake remote CAS and provider streams."""
import base64
import copy
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.github'))
from agent_runtime import budget, core, policy, providers, cli, sandbox
from agent_runtime.storage import Ledger, Repository, APIError


class FakeAPI:
    def __init__(self):
        self.refs={};self.blobs={};self.trees={};self.commits={};self.prs=[];self.notes=[];self.calls=[];self.counter=0
    def _sha(self,data):
        self.counter+=1;return hashlib.sha1((str(self.counter)+json.dumps(data,sort_keys=True)).encode()).hexdigest()
    def ref(self,name):return self.refs.get(name)
    def blob(self,data):
        sha=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest();self.blobs[sha]=data;return sha
    def comments(self,number):return iter(self.notes)
    def request(self,method,endpoint,data=None):
        self.calls.append((method,endpoint,copy.deepcopy(data)))
        if method=='POST' and endpoint=='/git/trees':
            entries=copy.deepcopy(self.trees.get(data.get('base_tree'),[]))
            indexed={e['path']:e for e in entries}
            for e in data['tree']:
                if e['sha'] is None:indexed.pop(e['path'],None)
                else:indexed[e['path']]=e
            entries=sorted(indexed.values(),key=lambda x:x['path']);sha=hashlib.sha1(json.dumps(entries,sort_keys=True).encode()).hexdigest();self.trees[sha]=entries;return {'sha':sha}
        if method=='POST' and endpoint=='/git/commits':
            sha=self._sha(data);self.commits[sha]={'tree':{'sha':data['tree']},'parents':[{'sha':x} for x in data['parents']]};return {'sha':sha}
        if method=='POST' and endpoint=='/git/refs':
            name=data['ref'].removeprefix('refs/heads/')
            if name in self.refs:raise APIError(422,method,endpoint)
            self.refs[name]=data['sha'];return data
        if method=='PATCH' and endpoint.startswith('/git/refs/heads/'):
            name=endpoint.removeprefix('/git/refs/heads/')
            if data['force'] or self.refs[name] not in [p['sha'] for p in self.commits[data['sha']]['parents']]:raise APIError(422,method,endpoint)
            self.refs[name]=data['sha'];return data
        if method=='GET' and endpoint.startswith('/commits/'):
            sha=endpoint.rsplit('/',1)[1]
            if sha not in self.commits:raise APIError(404,method,endpoint)
            return {'sha':sha}
        if method=='GET' and endpoint.startswith('/git/commits/'):return self.commits[endpoint.rsplit('/',1)[1]]
        if method=='GET' and endpoint.startswith('/git/trees/'):return {'tree':self.trees[endpoint.rsplit('/',1)[1]]}
        if method=='GET' and endpoint.startswith('/git/blobs/'):return {'content':base64.b64encode(self.blobs[endpoint.rsplit('/',1)[1]]).decode()}
        if method=='GET' and endpoint.startswith('/actions/runs/'):return {'status':'completed'}
        if method=='GET' and endpoint.startswith('/pulls?'):return copy.deepcopy(self.prs)
        if method=='GET' and endpoint.startswith('/pulls/'):return copy.deepcopy(next(p for p in self.prs if str(p['number'])==endpoint.rsplit('/',1)[1]))
        if method=='POST' and endpoint=='/pulls':
            repo={'full_name':'apotet/my-gemini-mirror-site'}
            p={'number':len(self.prs)+1,'draft':data['draft'],'state':'open','html_url':'https://example/pr/1',
               'head':{'sha':self.refs[data['head']],'ref':data['head'],'repo':repo},
               'base':{'ref':'main','repo':repo}}
            self.prs.append(p);return copy.deepcopy(p)
        if method=='POST' and '/comments' in endpoint:
            note={**data,'id':len(self.notes)+1};self.notes.append(note);return note
        raise AssertionError((method,endpoint,data))


def response(envelope,finish='stop'):
    text=envelope if isinstance(envelope,str) else json.dumps(envelope,ensure_ascii=False)
    return {'content':text,'reasoning_content':'retained reasoning','finish_reason':finish,
            'usage':{'prompt_tokens':1000,'completion_tokens':200,'prompt_tokens_details':{'cached_tokens':0,'cache_write_tokens':0}},'billing':{}}


class Runtime(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name);old=os.getcwd();os.chdir(self.root);self.addCleanup(os.chdir,old)
        fixtures={'src/a.ts':'export const x = 1;\n','src/data/questions.json':'[]','src/data/lessons/index.ts':'export const lessons = [];\n',
                  'docs/standard.md':'Full standard','docs/STATE.md':'Current state',
                  'docs/LEARNING_CONTENT_STANDARD.md':'Full mandatory learning standard',
                  'docs/DEVELOPMENT_WORKFLOW.md':'Full mandatory workflow standard','package.json':'{}','package-lock.json':'{"packages":{}}',
                  '.env':'TOP SECRET','.github/workflows/deploy.yml':'secret control plane','public/image.png':b'\x89PNG\0data'}
        for name,data in fixtures.items():
            p=self.root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data.encode() if isinstance(data,str) else data)
        for args in [('init','-q'),('add','.'),('-c','user.name=test','-c','user.email=test@example.invalid','commit','-qm','base')]:
            subprocess.run(['git',*args],check=True,capture_output=True)
        self.source=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
        self.repo=Repository(self.root,self.source);self.api=FakeAPI()
        self.api.commits[self.source]={'tree':{'sha':'base-tree'},'parents':[]};self.api.trees['base-tree']=[]
        self.event={'action':'created','issue':{'number':9,'title':'[KIMI] Task','body':json.dumps({'task':'Implement a feature','mode':'edit','write_paths':['src/','public/','tests/']}),'user':{'login':'apotet','type':'User'}},'sender':{'login':'apotet','type':'User'},
                    'comment':{'id':100,'body':'/agent start confirm-paid-api','user':{'login':'apotet','type':'User'}}}
        self.event_file=self.root/'event.json';self.write_event()
        env={'GITHUB_REPOSITORY':'apotet/my-gemini-mirror-site','GITHUB_ACTOR':'apotet','GITHUB_REF':'refs/heads/main',
             'GITHUB_RUN_ATTEMPT':'1','GITHUB_EVENT_NAME':'issue_comment','GITHUB_EVENT_PATH':str(self.event_file),
             'GITHUB_SHA':self.source,'GITHUB_RUN_ID':'100','PROVIDER_API_KEY':'fake-not-sent'}
        p=patch.dict(os.environ,env);p.start();self.addCleanup(p.stop)
        p=patch.object(cli,'OUT',self.root/'private-output');p.start();self.addCleanup(p.stop)
        self.out=cli.OUT
    def write_event(self):self.event_file.write_text(json.dumps(self.event))
    def task(self,**fields):return core.normalize({'task':'Do the task','mode':'edit','write_paths':['src/','public/','tests/'],**fields},'kimi')
    def state(self,**fields):return core.initial(self.task(**fields),self.repo,'kimi','issue-9',9)
    def prepare(self):cli.prepare('kimi',self.api)
    def state_after(self):return Ledger(self.api,'kimi','issue-9').load()
    def loop(self,replies,validator=lambda r,s:{'passed':True,'logs':[]}):
        seen=[]
        def infer(task,messages,out,timeout):
            ledger=Ledger(self.api,'kimi','issue-9');saved=ledger.load()
            self.assertEqual(saved['calls'][-1]['status'],'reserved')
            seen.append((task,copy.deepcopy(messages)))
            reply=replies.pop(0)
            if isinstance(reply,Exception):raise reply
            return reply
        cli.run_loop('kimi',self.api,infer=infer,validator=validator)
        return seen

    def test_mandatory_standards_for_explicit_files_and_new_lessons(self):
        for provider in ['kimi','zai']:
            tasks=[core.normalize({'task':'Audit explicit source','files':['src/a.ts','docs/']},provider),
                   core.normalize({'task':'Create a lesson','mode':'edit','target_files':['src/data/lessons/new.ts']},provider)]
            for task in tasks:
                with self.subTest(provider=provider,task=task['task']):
                    state=core.initial(task,self.repo,provider,'issue-9',9)
                    files=json.loads(state['messages'][-1]['content'])['files']
                    names=[f['path'] for f in files]
                    self.assertEqual(len(names),len(set(names)))
                    self.assertEqual(names[0],'docs/STATE.md')
                    for name in core.MANDATORY_CONTEXT:
                        self.assertEqual(next(f['content'] for f in files if f['path']==name),self.repo.read(name).decode())
                    self.assertNotIn('docs/ROADMAP.md',names)
    def test_missing_mandatory_standard_blocks_before_claim(self):
        self.repo.entries.pop('docs/LEARNING_CONTENT_STANDARD.md')
        with patch.object(cli,'source_repo',return_value=self.repo),self.assertRaises(ValueError):self.prepare()
        self.assertFalse(self.api.refs);self.assertFalse(self.api.notes)
    def test_partial_sse_transport_discards_unverified_bytes_without_repeat(self):
        self.prepare();raw=b'data: {"choices":[{"delta":{"content":"fake-not-sent"}}]}\n'
        original_run=subprocess.run;attempts=[]
        def transport(argv,**kwargs):
            if argv[0]!='curl':return original_run(argv,**kwargs)
            saved=self.state_after();self.assertEqual(saved['calls'][-1]['status'],'reserved')
            attempts.append(argv);Path(argv[argv.index('--output')+1]).write_bytes(raw)
            Path(argv[argv.index('--dump-header')+1]).write_text('HTTP/2 200\n')
            return subprocess.CompletedProcess(argv,28,'200','timeout after partial stream')
        with patch.object(providers.subprocess,'run',side_effect=transport):
            cli.run_loop('kimi',self.api,infer=providers.infer)
            cli.run_loop('kimi',self.api,infer=providers.infer)
        state=self.state_after();self.assertEqual(len(attempts),1)
        self.assertEqual(state['status'],'uncertain');self.assertEqual(len(state['calls']),1)
        self.assertEqual(state['calls'][0]['problem'],'ValueError')
        ledger=Ledger(self.api,'kimi','issue-9');ledger.load();ledger.materialize(state,self.out)
        self.assertNotIn('partial_artifacts',state['calls'][0])
        self.assertNotIn(raw,b''.join(self.api.blobs.values()))
        with self.assertRaises(ValueError):core.continue_task(state,ledger.head,ledger.head,'new',1)
    def test_base64_text_and_assembled_chunks_cannot_bypass_credential_guard(self):
        secret='ghp_'+('abc123'*6)
        for encoding in ['utf-8','base64']:
            with self.subTest(encoding=encoding):
                state=self.state()
                encoded=secret if encoding=='utf-8' else base64.b64encode(secret.encode()).decode()
                with self.assertRaises(ValueError):policy.apply_files(state,[{'path':'src/new.ts','encoding':encoding,'content':encoded}])
                self.assertNotIn('src/new.ts',state['overlay'])
                prefix,suffix=secret[:20],secret[20:]
                policy.apply_files(state,[{'path':'src/new.ts','content':prefix,'complete':False}])
                encoded=suffix if encoding=='utf-8' else base64.b64encode(suffix.encode()).decode()
                with self.assertRaises(ValueError):policy.apply_files(state,[{'path':'src/new.ts','action':'append','encoding':encoding,
                    'content':encoded,'complete':True,'expected_sha256':policy.digest(prefix.encode())}])
                self.assertEqual(base64.b64decode(state['overlay']['src/new.ts']),prefix.encode())
                self.assertIn('src/new.ts',state['incomplete_files'])
    def test_unsafe_checkpoint_rejected_before_validation_or_publication(self):
        state=self.state();state['overlay']['src/a.ts']=base64.b64encode(('ghp_'+('abc123'*6)).encode()).decode()
        with patch.object(sandbox.subprocess,'run') as run:
            with self.assertRaises(ValueError):sandbox.validate(self.repo,state,self.root/'tools')
            run.assert_not_called()
        state.update(status='ready_for_review',validations=[{'passed':True,'logs':[]}])
        with self.assertRaises(ValueError):core.publish_candidate(self.api,Ledger(self.api,'kimi','issue-9'),state)
        self.assertFalse(self.api.calls)
    def test_gemini_and_agent_instructions_protected_under_broad_scopes(self):
        task=self.task(write_paths=['scripts/','docs/'])
        protected=['scripts/gemini-issue-agent.py','scripts/gemini-issue-agent.test.py','scripts/gemini-list-models.py',
                   'scripts/gemini-l3-issue.py','scripts/validate-questions.mjs','scripts/load-bank.mjs',
                   'scripts/data-entry.ts','docs/AGENT_RUNTIME.md','docs/GEMINI_ISSUE_AGENT.md','docs/GEMINI_DEV_AGENT.md','docs/KIMI_ISSUE_AGENT.md',
                   'docs/ZAI_ISSUE_AGENT.md','docs/STATE.md','docs/DEVELOPMENT_WORKFLOW.md','docs/LEARNING_CONTENT_STANDARD.md']
        for name in protected:
            with self.subTest(name=name):
                policy.path(name) # readable, never writable
                with self.assertRaises(ValueError):policy.apply_files(self.state(write_paths=task['write_paths']),[{'path':name,'content':'rewrite'}])

    def source_snapshot(self):
        for name,text in {'src/a.ts':'export const x = 377;\n','docs/LEARNING_CONTENT_STANDARD.md':'UNTRUSTED learning',
                          'docs/DEVELOPMENT_WORKFLOW.md':'UNTRUSTED workflow','docs/STATE.md':'UNTRUSTED state',
                          'scripts/never-execute.py':'raise RuntimeError("source code must never execute")'}.items():
            p=self.root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
        subprocess.run(['git','add','.'],check=True,capture_output=True)
        subprocess.run(['git','-c','user.name=test','-c','user.email=test@example.invalid','commit','-qm','source snapshot'],check=True,capture_output=True)
        sha=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
        subprocess.run(['git','checkout','-q',self.source],check=True,capture_output=True)
        self.api.commits[sha]={'tree':{'sha':'source-tree'},'parents':[{'sha':self.source}]}
        return sha
    def test_source_sha_is_audit_only_and_immutable(self):
        for mode,sha in [('edit','a'*40),('audit-only','main'),('audit-only','../x'),('audit-only','https://example/x'),
                         ('audit-only','abc123'),('audit-only',None),('audit-only','A'*40)]:
            with self.subTest(mode=mode,sha=sha),self.assertRaises(ValueError):
                self.task(mode=mode,write_paths=[] if mode=='audit-only' else ['src/'],source_sha=sha)
        self.assertEqual(self.task(mode='audit-only',write_paths=[],source_sha='a'*40)['source_sha'],'a'*40)
    def test_audit_pinned_snapshot_uses_trusted_main_standards_without_checkout(self):
        sha=self.source_snapshot()
        self.event['issue']['body']=json.dumps({'task':'Audit source','mode':'audit-only','source_sha':sha,'files':['src/a.ts','docs/']})
        self.write_event();self.prepare();state=self.state_after()
        self.assertEqual(state['sourceSHA'],sha);self.assertEqual(state['trustedSHA'],self.source)
        self.assertEqual(json.loads(state['messages'][1]['content'])['trustedSHA'],self.source)
        files={f['path']:f['content'] for f in json.loads(state['messages'][-1]['content'])['files']}
        self.assertEqual(files['src/a.ts'],'export const x = 377;\n')
        for name in core.MANDATORY_CONTEXT:self.assertEqual(files[name],self.repo.read(name).decode())
        self.assertEqual(subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),self.source)
        self.assertFalse((self.root/'scripts/never-execute.py').exists())
        self.loop([response({'status':'continue','read_files':['docs/DEVELOPMENT_WORKFLOW.md']}),
                   response({'status':'complete','report':'audit done'})])
        state=self.state_after();self.assertEqual(state['status'],'completed');self.assertEqual(state['overlay'],{})
        self.assertIn('Full mandatory workflow standard',state['messages'][-2]['content'])
        self.assertNotIn('UNTRUSTED workflow',state['messages'][-2]['content'])
        cli.publish('kimi',self.api);self.assertFalse(self.api.prs)
        self.assertFalse(any(c[1]=='/git/refs' and c[2]['ref'].startswith('refs/heads/agents/work/') for c in self.api.calls))
    def test_unknown_source_commit_blocks_before_claim(self):
        self.event['issue']['body']=json.dumps({'task':'Audit','mode':'audit-only','source_sha':'a'*40})
        self.write_event()
        with self.assertRaises(APIError):self.prepare()
        self.assertFalse(self.api.refs);self.assertFalse(self.api.notes)
    def test_source_commit_membership_checked_before_local_read(self):
        self.event['issue']['body']=json.dumps({'task':'Audit','mode':'audit-only','source_sha':'a'*40})
        self.write_event();original=self.api.request
        def request(method,endpoint,data=None):
            if endpoint.startswith('/commits/'):return {'sha':'b'*40}
            return original(method,endpoint,data)
        with patch.object(self.api,'request',side_effect=request),self.assertRaises(ValueError):self.prepare()
        self.assertFalse(self.api.refs)
    def test_later_audit_reads_retain_original_pins_after_main_changes(self):
        sha=self.source_snapshot()
        self.event['issue']['body']=json.dumps({'task':'Audit','mode':'audit-only','source_sha':sha,'max_calls':1})
        self.write_event();self.prepare();self.loop([response({'status':'continue','read_files':['src/a.ts']})])
        state=self.state_after();self.assertEqual(state['status'],'paused')
        self.assertEqual(state['sourceSHA'],sha);self.assertEqual(state['trustedSHA'],self.source)
        self.event['issue']['body']='{"task":"changed issue must not replace source"}'
        self.event['action']='created';self.event['comment']={'id':377,'body':'/agent continue '+json.dumps({'checkpoint':self.api.ref('agents/state/kimi-issue-9'),'calls':1}),
            'user':{'login':'apotet','type':'User'}}
        self.write_event()
        with patch.dict(os.environ,{'GITHUB_EVENT_NAME':'issue_comment','GITHUB_SHA':'c'*40}),patch.object(cli,'source_repo',return_value=self.repo):self.prepare()
        with patch.dict(os.environ,{'GITHUB_EVENT_NAME':'issue_comment'}):
            self.loop([response({'status':'complete','report':'done'})])
        self.assertEqual(self.state_after()['sourceSHA'],sha);self.assertEqual(self.state_after()['trustedSHA'],self.source)

    def test_kimi_limits_and_zai_native_limits(self):
        default=self.task()
        self.assertEqual((default['max_calls'],default['max_total_calls']), (8,24))
        self.assertEqual((default['max_input_tokens'],default['max_output_tokens']), (120000,16384))
        self.assertEqual(default['budget_usd'],'0.75')
        t=self.task(max_output_tokens=65536)
        self.assertEqual(providers.payload(t,[])['max_completion_tokens'],65536)
        z=core.normalize({'task':'audit','model':'glm-5.3','max_output_tokens':131072},'zai')
        self.assertEqual(providers.payload(z,[])['max_tokens'],131072)
        with self.assertRaises(ValueError):self.task(max_output_tokens=65537)

    def test_gemini_payload_and_response_preserve_full_history_and_usage(self):
        task=core.normalize({'task':'Implement','mode':'edit','write_paths':['src/']},'gemini')
        messages=[{'role':'system','content':'system instructions'},
                  {'role':'user','content':'first message'},
                  {'role':'assistant','content':'previous response','reasoning_content':'private reasoning'},
                  {'role':'user','content':'continue'}]
        payload=providers.payload(task,messages)
        history=json.loads(payload['contents'][0]['parts'][0]['text'])
        self.assertEqual([m['content'] for m in history],['first message','previous response','continue'])
        self.assertEqual(payload['systemInstruction']['parts'][0]['text'],'system instructions')
        self.assertEqual(payload['generationConfig']['maxOutputTokens'],16384)
        self.assertNotIn('private reasoning',json.dumps(payload))
        raw={'candidates':[{'finishReason':'MAX_TOKENS','content':{'parts':[
            {'text':'reasoning','thought':True},{'text':'{"status":'}]}}],
             'usageMetadata':{'promptTokenCount':100,'candidatesTokenCount':20,'thoughtsTokenCount':5}}
        parsed=providers.parse_gemini(json.dumps(raw))
        self.assertEqual((parsed['finish_reason'],parsed['content']),('length','{"status":'))
        self.assertEqual(parsed['usage']['completion_tokens'],25)
        self.assertIsNone(providers.cost(task['model'],parsed['usage'],{})['range_usd'])
        raw['candidates'][0]['finishReason']='SAFETY'
        with self.assertRaises(ValueError):providers.parse_gemini(json.dumps(raw))
        with self.assertRaises(ValueError):core.normalize({'task':'x','max_output_tokens':16385},'gemini')

    def test_gemini_explicit_start_continuation_and_draft(self):
        self.event['issue']['title']='[GEMINI DEV] Task'
        self.event['issue']['body']=json.dumps({'task':'work','mode':'edit','write_paths':['src/'],'max_calls':1})
        self.write_event()
        with patch.dict(os.environ,{'GITHUB_EVENT_NAME':'issues'}),self.assertRaises(ValueError):
            cli.prepare('gemini',self.api)
        self.assertFalse(self.api.refs)
        cli.prepare('gemini',self.api)
        def partial(task,messages,out,timeout):
            return response('{"status":','length')
        cli.run_loop('gemini',self.api,infer=partial)
        ledger=Ledger(self.api,'gemini','issue-9');state=ledger.load()
        self.assertEqual(state['status'],'uncertain')
        self.assertEqual(state['pending_text'],'')
        self.assertEqual(core.work_branch(state),'gemini/issue-9')
        self.event['comment']={'id':222,'user':{'login':'apotet','type':'User'},
            'body':'/agent continue '+json.dumps({'checkpoint':ledger.head,'calls':1,'acknowledge_uncertain':True})}
        self.write_event();cli.prepare('gemini',self.api)
        def finish(task,messages,out,timeout):
            return response({'status':'complete','files':[{'path':'src/a.ts','content':'new'}]})
        cli.run_loop('gemini',self.api,infer=finish,validator=lambda r,s:{'passed':True,'logs':[]})
        state=ledger.load()
        self.assertEqual(state['status'],'ready_for_review')
        core.publish_candidate(self.api,ledger,state)
        self.assertEqual(state['status'],'published_draft')
        self.assertTrue(self.api.prs[0]['draft'])
        self.assertEqual(self.api.prs[0]['head']['sha'],self.api.ref('gemini/issue-9'))

    def test_gemini_zero_call_continuation_replaces_unused_grant(self):
        self.event['issue']['title']='[GEMINI DEV] Task';self.write_event()
        cli.prepare('gemini',self.api)
        ledger=Ledger(self.api,'gemini','issue-9');ledger.load()
        self.event['comment']={'id':223,'user':{'login':'apotet','type':'User'},
            'body':'/agent continue '+json.dumps({'checkpoint':ledger.head,'calls':0})}
        self.write_event();cli.prepare('gemini',self.api)
        cli.run_loop('gemini',self.api,infer=lambda *args: self.fail('unexpected API call'))
        self.assertEqual(ledger.load()['calls'],[])

    def test_gemini_quota_error_preserves_checkpoint_without_retry(self):
        self.event['issue']['title']='[GEMINI DEV] Task';self.write_event()
        cli.prepare('gemini',self.api)
        original_run=subprocess.run;attempts=[]
        def transport(argv,**kwargs):
            if argv[0]!='curl':return original_run(argv,**kwargs)
            saved=Ledger(self.api,'gemini','issue-9').load()
            self.assertEqual(saved['calls'][-1]['status'],'reserved')
            self.assertEqual(argv[argv.index('--retry')+1],'0')
            self.assertIn('x-goog-api-key: fake-not-sent',argv)
            attempts.append(argv)
            Path(argv[argv.index('--output')+1]).write_text('{"error":"quota"}')
            Path(argv[argv.index('--dump-header')+1]).write_text('HTTP/2 429\n')
            return subprocess.CompletedProcess(argv,0,'429','')
        with patch.object(providers.subprocess,'run',side_effect=transport):
            cli.run_loop('gemini',self.api,infer=providers.infer)
            cli.run_loop('gemini',self.api,infer=providers.infer)
        state=Ledger(self.api,'gemini','issue-9').load()
        self.assertEqual(len(attempts),1)
        self.assertEqual(state['status'],'uncertain')
        self.assertEqual(len(state['calls']),1)
        self.assertEqual(state['calls'][0]['http_status'],429)
        ledger=Ledger(self.api,'gemini','issue-9')
        ledger.materialize(state,self.out)
        self.assertNotIn('partial_artifacts',state['calls'][0])
        self.assertNotIn(b'{"error":"quota"}',b''.join(self.api.blobs.values()))
        self.assertIsNone(core.totals(state)['exact_cost_usd'])
        cli.report('gemini',self.api)
        self.assertIn('Gemini HTTP 429 (quota or rate limit). No automatic retry.',self.api.notes[-1]['body'])
        with self.assertRaises(ValueError):core.continue_task(state,'head','head','fresh',1)
        ledger.load()
        self.event['comment']={'id':224,'user':{'login':'apotet','type':'User'},
            'body':'/agent continue '+json.dumps({'checkpoint':ledger.head,'calls':1,'acknowledge_uncertain':True})}
        self.write_event();cli.prepare('gemini',self.api)
        cli.run_loop('gemini',self.api,infer=lambda *args: response({'status':'complete'}))
        resumed=ledger.load()
        self.assertEqual([c['status'] for c in resumed['calls']],['uncertain_acknowledged','answered'])
        self.assertEqual(resumed['calls'][0]['http_status'],429)

    def test_gemini_requires_owner_event_and_does_not_accept_resume_in_issue_body(self):
        self.event['issue']['title']='[GEMINI DEV] Task';self.write_event()
        for changes in ({'GITHUB_ACTOR':'other'}, {'GITHUB_RUN_ATTEMPT':'2'},
                        {'GITHUB_EVENT_NAME':'workflow_dispatch'}, {'GITHUB_REF':'refs/heads/untrusted'},
                        {'GITHUB_REPOSITORY':'other/repo'}):
            with self.subTest(changes=changes), patch.dict(os.environ,changes),self.assertRaises(ValueError):
                cli.prepare('gemini',self.api)
        for field in ('issue','sender','comment'):
            legitimate=copy.deepcopy(self.event[field])
            if field=='issue':self.event[field]['pull_request']={'url':'https://example/pr'}
            elif field=='sender':self.event[field]['type']='Bot'
            if field=='comment':self.event[field]['user']['login']='other'
            self.write_event()
            with self.subTest(field=field), self.assertRaises(ValueError):cli.prepare('gemini',self.api)
            self.event[field]=legitimate
        self.event['issue']['body']=json.dumps({'resume':{'task_id':'issue-9','calls':1}})
        self.write_event()
        with self.assertRaisesRegex(ValueError,'Issue continuations require'):cli.prepare('gemini',self.api)
        self.assertFalse(self.api.refs)

    def test_gemini_validate_only_cannot_publish_then_explicit_publish_is_idempotent(self):
        self.event['issue']['title']='[GEMINI DEV] Task';self.write_event()
        cli.prepare('gemini',self.api)
        cli.run_loop('gemini',self.api,
                     infer=lambda *args: response({'status':'complete','files':[{'path':'src/a.ts','content':'new'}]}),
                     validator=lambda r,s:{'passed':True,'logs':[]})
        ledger=Ledger(self.api,'gemini','issue-9');ledger.load()
        self.event['comment'].update(id=225,
            body='/agent validate '+json.dumps({'checkpoint':ledger.head,'calls':0}))
        self.write_event();cli.prepare('gemini',self.api)
        with patch.dict(os.environ,{'PROVIDER_API_KEY':''}), patch.object(sandbox,'validate',return_value={'passed':True,'logs':[]}):
            cli.validate_only('gemini',self.api)
            with self.assertRaisesRegex(ValueError,'validation-only activation'):cli.publish('gemini',self.api)
        self.assertFalse(self.api.prs)
        self.assertIsNone(self.api.ref('gemini/issue-9'))
        for grant_id in (226,227):
            ledger.load()
            self.event['comment'].update(id=grant_id,
                body='/agent publish '+json.dumps({'checkpoint':ledger.head,'calls':0}))
            self.write_event();cli.prepare('gemini',self.api)
            with patch.dict(os.environ,{'PROVIDER_API_KEY':''}):cli.publish('gemini',self.api)
        self.assertEqual(len(self.api.prs),1)
        self.assertTrue(self.api.prs[0]['draft'])
        self.assertEqual(ledger.load()['status'],'published_draft')
        self.assertEqual(len(ledger.load()['calls']),1)

    def test_gemini_validate_cannot_promote_an_unfinished_response(self):
        self.event['issue']['title']='[GEMINI DEV] Task'
        self.event['issue']['body']=json.dumps({'task':'work','mode':'edit','write_paths':['src/'],'max_calls':1})
        self.write_event();cli.prepare('gemini',self.api)
        cli.run_loop('gemini',self.api,
                     infer=lambda *args: response({'status':'continue','files':[{'path':'src/a.ts','content':'interim'}]}))
        ledger=Ledger(self.api,'gemini','issue-9')
        self.assertTrue(ledger.load()['overlay'])
        self.event['comment'].update(id=228,
            body='/agent validate '+json.dumps({'checkpoint':ledger.head,'calls':0}))
        self.write_event();cli.prepare('gemini',self.api)
        with patch.object(sandbox,'validate') as validate, self.assertRaisesRegex(ValueError,'complete response'):
            cli.validate_only('gemini',self.api)
        validate.assert_not_called()
        self.assertFalse(self.api.prs)

    def test_google_api_key_is_blocked_in_context_and_candidate_files(self):
        key='AIza'+'a1_'*11+'a1'
        with self.assertRaisesRegex(ValueError,'Google API credential'):policy.safe_text(key)
        state=self.state()
        with self.assertRaisesRegex(ValueError,'Google API credential'):
            policy.apply_files(state,[{'path':'src/a.ts','encoding':'base64',
                                       'content':base64.b64encode(key.encode()).decode()}])
        self.assertFalse(state['overlay'])

    def test_binary_context_is_checked_before_encoding_for_all_providers(self):
        secret='ghp_'+('abc123'*6)
        read=self.repo.read
        with patch.object(self.repo,'read',side_effect=lambda name:
                          b'\xffA'+secret.encode()+b'Z\x80' if name=='public/image.png' else read(name)):
            for provider in ('kimi','gemini'):
                task=core.normalize({'task':'Inspect image','context_files':['public/image.png']},provider)
                with self.subTest(provider=provider),self.assertRaises(ValueError):
                    core.initial(task,self.repo,provider,'issue-9',9)
        self.assertFalse(self.api.refs)

    def test_unsafe_responses_are_discarded_before_checkpoint_and_artifact(self):
        secret='ghp_'+('abc123'*6)
        answers=[
            response({'status':'complete','report':secret}),
            {**response({'status':'complete','report':'ok'}),'reasoning_content':secret},
            response({'status':'complete','files':[{'path':'src/a.ts','encoding':'base64',
                     'content':base64.b64encode(secret.encode()).decode()}]}),
            response('{"status":"complete","report":"\\u0067hp_'+('abc123'*6)+'"}'),
            response({'status':'complete','report':'fake-not-sent'}),
            response({'status':'complete','report':base64.b64encode(b'fake-not-sent').decode()}),
            response('{"status":"complete","report":"\\u0067hp_'+('abc123'*6)+'","report":"ok"}'),
        ]
        for answer in answers:
            with self.subTest(answer_type=answers.index(answer)):
                self.api=FakeAPI()
                self.api.commits[self.source]={'tree':{'sha':'base-tree'},'parents':[]}
                self.api.trees['base-tree']=[]
                self.prepare()
                def infer(task,messages,out,timeout):
                    (out/'response.sse').write_text(secret)
                    return answer
                cli.run_loop('kimi',self.api,infer=infer)
                state=self.state_after()
                self.assertEqual(state['status'],'uncertain')
                self.assertNotIn('response',state['calls'][-1])
                self.assertNotIn(secret.encode(),b''.join(self.api.blobs.values()))
                for path in self.out.rglob('*'):
                    if path.is_file():self.assertNotIn(secret.encode(),path.read_bytes())

    def test_streamed_split_secret_is_rejected_before_sidecar_or_export(self):
        secret='ghp_'+('abc123'*6)
        full=json.dumps({'status':'complete','report':secret})
        split=full.index(secret)+12
        chunks=[{'choices':[{'delta':{'content':part},'finish_reason':finish}]}
                for part,finish in ((full[:split],None),(full[split:],'stop'))]
        raw=''.join('data: '+json.dumps(chunk)+'\n\n' for chunk in chunks)+'data: [DONE]\n'
        self.prepare()
        original_run=subprocess.run
        def transport(argv,**kwargs):
            if argv[0]!='curl':return original_run(argv,**kwargs)
            Path(argv[argv.index('--output')+1]).write_text(raw)
            return subprocess.CompletedProcess(argv,0,'200','')
        with patch.object(providers.subprocess,'run',side_effect=transport):
            cli.run_loop('kimi',self.api,infer=providers.infer)
        state=self.state_after()
        self.assertEqual(state['status'],'uncertain')
        self.assertNotIn('response',state['calls'][0])
        self.assertNotIn(secret.encode(),b''.join(self.api.blobs.values()))
        self.assertFalse((self.out/'ledger-artifacts').exists())

    def test_ledger_rejects_sensitive_state_before_creating_any_blob(self):
        state=self.state()
        state['overlay']['src/a.ts']=base64.b64encode(('ghp_'+('abc123'*6)).encode()).decode()
        with self.assertRaises(ValueError):Ledger(self.api,'kimi','issue-9').save(state)
        self.assertFalse(self.api.blobs)
        self.assertFalse(self.api.refs)

    def test_gemini_pilot_caps_attempts_and_tokens_across_continuations(self):
        task=core.normalize({'task':'pilot','max_calls':1,'max_total_calls':1,'max_output_tokens':2048},'gemini')
        self.assertEqual(providers.payload(task,[])['generationConfig']['maxOutputTokens'],2048)
        state=core.initial(task,self.repo,'gemini','issue-9',9)
        core.reserve(state)
        with self.assertRaises(ValueError):
            core.continue_task(state,'head','head','grant',1,acknowledge_uncertain=True)
        state['remaining_calls']=1
        state['calls'][-1]['status']='uncertain_acknowledged'
        with self.assertRaises(ValueError):core.reserve(state)
        for fields in ({'max_total_calls':9},{'max_total_calls':1,'max_calls':2},
                       {'max_output_tokens':16385},{'max_total_calls':True}):
            with self.subTest(fields=fields),self.assertRaises(ValueError):
                core.normalize({'task':'pilot',**fields},'gemini')
        state['task'].pop('max_total_calls')
        with self.assertRaises(ValueError):core.reserve(state)

    def test_gemini_dev_workflow_is_owner_only_and_never_merges(self):
        text=(ROOT/'.github/workflows/gemini-dev-issue.yml').read_text()
        for needle in ("github.actor == 'apotet'","github.event.issue.user.login == 'apotet'","github.event.comment.user.login == 'apotet'",
                       "!github.event.issue.pull_request","startsWith(github.event.issue.title, '[GEMINI DEV] ')","github.run_attempt == 1",
                       "== '/agent start confirm-paid-api'"):
            self.assertIn(needle,text)
        self.assertNotIn('issues:',text.split('jobs:')[0].split('on:')[1].split('permissions:')[0])
        for bad in ('merge','deploy','workflow_dispatch','ready_for_review'):
            self.assertNotIn(bad,text.lower())

    def test_gemini_successful_transport_parses_response(self):
        task=core.normalize({'task':'audit'},'gemini')
        raw={'candidates':[{'finishReason':'STOP','content':{'parts':[{'text':'{"status":"complete"}'}]}}],
             'usageMetadata':{'promptTokenCount':12,'candidatesTokenCount':5}}
        def transport(argv,**kwargs):
            self.assertEqual(argv[argv.index('--retry')+1],'0')
            self.assertIn('x-goog-api-key: fake-not-sent',argv)
            self.assertEqual(argv[argv.index('--write-out')+2],providers.MODELS[task['model']].endpoint)
            Path(argv[argv.index('--output')+1]).write_text(json.dumps(raw))
            Path(argv[argv.index('--dump-header')+1]).write_text('HTTP/2 200\n')
            return subprocess.CompletedProcess(argv,0,'200','')
        with patch.object(providers.subprocess,'run',side_effect=transport) as run:
            answer=providers.infer(task,[{'role':'user','content':'hello'}],self.out,30)
        self.assertEqual(run.call_count,1)
        self.assertEqual(answer['finish_reason'],'stop')
        self.assertEqual(answer['usage']['prompt_tokens'],12)
    def test_model_endpoint_is_not_task_controlled(self):
        for bad in [{'endpoint':'https://evil'},{'branch':'someone'},{'token':'secret'},{'model':'gemini-unknown'}]:
            with self.subTest(bad=bad),self.assertRaises(ValueError):self.task(**bad)
    def test_full_context_not_excerpts(self):
        state=self.state(context_files=['src/a.ts','docs/standard.md'])
        content=json.loads(state['messages'][-1]['content'])
        files={f['path']:f['content'] for f in content['files']}
        self.assertEqual(files['src/a.ts'],self.repo.read('src/a.ts').decode())
        self.assertEqual(files['docs/standard.md'],'Full standard')
    def test_native_images_and_text_only_visibility(self):
        k=self.state(context_files=['public/image.png'])
        self.assertEqual(k['messages'][-1]['content'][1]['type'],'image_url')
        z=core.normalize({'task':'audit','files':['public/image.png']},'zai')
        state=core.initial(z,self.repo,'zai','issue-9',9)
        self.assertIn(base64.b64encode(b'\x89PNG\0data').decode(),state['messages'][-1]['content'])
    def test_secret_paths_and_control_plane(self):
        for p in ['.env','src/.env.local','../a','/etc/passwd','.github/workflows/a.yml','scripts/zai-agent.py','src/a/../../x','src\\x']:
            with self.subTest(path=p),self.assertRaises(ValueError):policy.path(p,write=True)
        with self.assertRaises(ValueError):policy.safe_text('-----BEGIN '+'PRIVATE KEY-----')
    def test_new_questions_lessons_registry_svg_glossary_tests_code_allowed(self):
        state=self.state()
        changes=['src/data/questions.json','src/data/lessons/new.ts','src/data/lessons/index.ts','src/data/glossary.ts','src/components/New.tsx','public/new.svg','tests/new.test.mjs']
        policy.apply_files(state,[{'path':p,'content':'new content'} for p in changes])
        self.assertEqual(set(state['overlay']),set(changes))
    def test_real_code_and_ids_are_not_text_literal_restricted(self):
        state=self.state();policy.apply_files(state,[{'path':'src/a.ts','content':'export function newFeature(){ return {id:"new-id"}; }'}])
        self.assertIn('function',base64.b64decode(state['overlay']['src/a.ts']).decode())
    def test_scope_and_symlink_modes_rejected(self):
        for op in [{'path':'docs/other.md','content':'x'},{'path':'src/a.ts','content':'x','mode':'120000'}]:
            with self.assertRaises(ValueError):policy.apply_files(self.state(),[op])
    def test_file_chunks_are_exact_and_cannot_publish_partial(self):
        state=self.state();policy.apply_files(state,[{'path':'src/new.ts','content':'part1','complete':False}])
        policy.apply_files(state,[{'path':'src/new.ts','action':'append','content':'part2','complete':True,'expected_sha256':policy.digest(b'part1')}])
        self.assertEqual(base64.b64decode(state['overlay']['src/new.ts']),b'part1part2');self.assertFalse(state['incomplete_files'])
        with self.assertRaises(ValueError):policy.apply_files(state,[{'path':'src/new.ts','action':'append','content':'x','expected_sha256':'bad'}])
    def test_delete_and_binary_assets(self):
        state=self.state();policy.apply_files(state,[{'path':'src/a.ts','action':'delete'},{'path':'public/new.png','encoding':'base64','content':'AAEC'}])
        self.assertIsNone(state['overlay']['src/a.ts']);self.assertEqual(base64.b64decode(state['overlay']['public/new.png']),b'\0\1\2')
    def test_audit_rejects_any_edit(self):
        state=self.state(mode='audit-only',write_paths=[])
        with self.assertRaises(ValueError):policy.apply_files(state,[{'path':'src/a.ts','content':'x'}])
    def test_authority_and_random_rerun_rejected(self):
        for env in [{'GITHUB_RUN_ATTEMPT':'2'},{'GITHUB_ACTOR':'bot'},{'GITHUB_REF':'refs/heads/foreign'}]:
            with patch.dict(os.environ,env),self.assertRaises(ValueError):cli.authorize('kimi')
        self.event['action']='edited';self.write_event()
        with self.assertRaises(ValueError):cli.authorize('kimi')
    def test_durable_claim_and_duplicate_initialization(self):
        self.prepare();state=self.state_after();self.assertEqual(state['status'],'working')
        self.assertIn(core.MARKER,self.api.notes[0]['body'])
        before=len(self.api.calls)
        with self.assertRaises(ValueError):self.prepare()
        self.assertFalse(any(c[0]=='POST' for c in self.api.calls[before:]))
    def test_legacy_claim_blocks_new_charge(self):
        self.api.notes=[{'body':core.LEGACY_MARKERS[0]}]
        with self.assertRaises(ValueError):self.prepare()
        self.assertFalse(self.api.refs)
    def test_atomic_creation_and_cas_prevent_two_writers(self):
        state=self.state();a=Ledger(self.api,'kimi','issue-9');b=Ledger(self.api,'kimi','issue-9')
        a.save(state)
        with self.assertRaises(ValueError):b.save(state)
        a.load();b.load();a.save(state)
        with self.assertRaises(ValueError):b.save(state)
    def test_reservation_precedes_every_network_attempt(self):
        self.prepare();seen=self.loop([response({'status':'complete','files':[{'path':'src/a.ts','content':'new code'}]})])
        self.assertEqual(len(seen),1);self.assertEqual(self.state_after()['status'],'ready_for_review')
    def test_multiple_distinct_calls_complete_one_task(self):
        self.prepare()
        seen=self.loop([response({'status':'continue','read_files':['src/a.ts']}),response({'status':'complete','files':[{'path':'src/a.ts','content':'function feature() {}'}]})])
        state=self.state_after();self.assertEqual(len(seen),2);self.assertEqual(len(state['calls']),2)
        self.assertEqual(state['status'],'ready_for_review');self.assertIn('export const x',seen[1][1][-1]['content'])
    def test_grant_exhaustion_checkpoints_not_loop(self):
        self.event['issue']['body']=json.dumps({'task':'work','mode':'edit','write_paths':['src/'],'max_calls':1});self.write_event();self.prepare()
        self.loop([response({'status':'continue','report':'plan retained'})])
        state=self.state_after();self.assertEqual(state['status'],'paused');self.assertEqual(state['reports'],['plan retained'])
    def test_incomplete_output_is_discarded_and_stops(self):
        self.prepare();full=json.dumps({'status':'complete','files':[{'path':'src/a.ts','content':'FULL NEW SOURCE'}]})
        self.loop([response(full[:30],'length'),response(full[30:])])
        state=self.state_after();self.assertEqual(state['status'],'uncertain')
        self.assertEqual(len(state['calls']),1)
        self.assertNotIn('response',state['calls'][0])

    def test_owner_can_extend_kimi_limits_after_discarded_partial_response(self):
        self.event['issue']['body']=json.dumps({'task':'work','mode':'edit','write_paths':['src/'],
                                                'max_calls':1,'max_total_calls':1,'budget_usd':'0.25',
                                                'max_output_tokens':5120})
        self.write_event()
        self.prepare()
        full=json.dumps({'status':'complete','files':[{'path':'src/a.ts','content':'FULL NEW SOURCE'}]})
        self.loop([response(full[:30],'length')])
        before=self.state_after()
        self.assertEqual(before['status'],'uncertain')
        self.assertEqual(before['pending_text'],'')
        ledger=Ledger(self.api,'kimi','issue-9');ledger.load()
        self.event['comment']={'id':789,'user':{'login':'apotet','type':'User'},
            'body':'/agent continue '+json.dumps({'checkpoint':ledger.head,'calls':1,'acknowledge_uncertain':True,
                  'limits':{'max_total_calls':2,'max_output_tokens':16384,'budget_usd':'0.75'}})}
        self.write_event()
        self.prepare()
        resumed=self.state_after()
        self.assertEqual(resumed['pending_text'],'')
        self.assertEqual(resumed['task']['max_total_calls'],2)
        self.assertEqual(resumed['task']['budget_usd'],'0.75')
        self.assertEqual(resumed['limit_changes'][-1]['grant_id'],'789')
        seen=self.loop([response(full)])
        self.assertEqual(len(seen),1)
        self.assertEqual(seen[0][0]['max_output_tokens'],16384)
        after=self.state_after()
        self.assertEqual(after['status'],'ready_for_review')
        self.assertNotIn('response',after['calls'][0])
        self.assertEqual(after['calls'][1]['response']['content'],full)

    def test_continuation_limit_updates_require_owner_and_valid_checkpoint(self):
        self.prepare()
        ledger=Ledger(self.api,'kimi','issue-9');ledger.load()
        original=ledger.head
        command={'checkpoint':original,'calls':0,'limits':{'budget_usd':'1.00','max_total_calls':32}}
        self.event['comment']={'id':101,'user':{'login':'other','type':'User'},
                               'body':'/agent continue '+json.dumps(command)}
        self.write_event()
        with self.assertRaises(ValueError):self.prepare()
        self.assertEqual(self.api.ref('agents/state/kimi-issue-9'),original)
        self.event['comment']['user']['login']='apotet'
        for limits in [{'budget_usd':'2.01'},{'max_total_calls':33},
                       {'max_output_tokens':65537},{'write_paths':['src/']}]:
            command['limits']=limits
            self.event['comment']['body']='/agent continue '+json.dumps(command)
            self.write_event()
            with self.subTest(limits=limits),self.assertRaises(ValueError):self.prepare()
            self.assertEqual(self.api.ref('agents/state/kimi-issue-9'),original)
        command['limits']={'budget_usd':'1.00','max_total_calls':32}
        command['checkpoint']='0'*40
        self.event['comment']['body']='/agent continue '+json.dumps(command)
        self.write_event()
        with self.assertRaises(ValueError):self.prepare()
        self.assertEqual(self.api.ref('agents/state/kimi-issue-9'),original)

    def test_limit_update_with_zero_call_grant_never_calls_model(self):
        self.prepare()
        ledger=Ledger(self.api,'kimi','issue-9');ledger.load()
        self.event['comment']={'id':999,'user':{'login':'apotet','type':'User'},
            'body':'/agent continue '+json.dumps({'checkpoint':ledger.head,'calls':0,
                                                  'limits':{'max_total_calls':32}})}
        self.write_event()
        self.prepare()
        self.assertEqual(self.loop([]),[])
        self.assertEqual(self.state_after()['task']['max_total_calls'],32)
        self.assertEqual(self.state_after()['task']['budget_usd'],'0.75')
        self.assertEqual(self.state_after()['calls'],[])
        ledger.load()
        self.event['comment']['body']='/agent continue '+json.dumps({'checkpoint':ledger.head,'calls':0,
                                                                      'limits':{'budget_usd':'2.00'}})
        self.write_event()
        with self.assertRaises(ValueError):self.prepare()
        self.assertEqual(self.state_after()['task']['budget_usd'],'0.75')

    def test_limit_update_does_not_bypass_task_budget(self):
        self.event['issue']['body']=json.dumps({'task':'work','mode':'edit','write_paths':['src/'],
                                                'budget_usd':'0.01','max_calls':1})
        self.write_event();self.prepare()
        self.assertEqual(self.loop([]),[])
        ledger=Ledger(self.api,'kimi','issue-9');ledger.load()
        self.event['comment']={'id':900,'user':{'login':'apotet','type':'User'},
            'body':'/agent continue '+json.dumps({'checkpoint':ledger.head,'calls':1,
                                                  'limits':{'max_total_calls':32}})}
        self.write_event();self.prepare()
        self.assertEqual(self.loop([]),[])
        self.assertEqual(self.state_after()['status'],'paused_budget')
        self.assertEqual(self.state_after()['task']['budget_usd'],'0.01')
        self.assertEqual(self.state_after()['calls'],[])

    def test_limit_update_does_not_acknowledge_uncertain_request(self):
        self.prepare();self.loop([TimeoutError('not printed')])
        ledger=Ledger(self.api,'kimi','issue-9');ledger.load();original=ledger.head
        self.event['comment']={'id':901,'user':{'login':'apotet','type':'User'},
            'body':'/agent continue '+json.dumps({'checkpoint':original,'calls':1,
                                                  'limits':{'budget_usd':'1.00'}})}
        self.write_event()
        with self.assertRaises(ValueError):self.prepare()
        self.assertEqual(self.api.ref('agents/state/kimi-issue-9'),original)
        self.assertEqual(self.state_after()['task']['budget_usd'],'0.75')
    def test_uncertain_failure_never_retried_automatically(self):
        self.prepare();seen=self.loop([TimeoutError('not printed')])
        self.assertEqual(len(seen),1);state=self.state_after();self.assertEqual(state['status'],'uncertain')
        with self.assertRaises(ValueError):core.continue_task(state,'a','a','1',1)
        core.continue_task(state,'a','a','1',1,True)
        self.assertEqual(state['calls'][0]['status'],'uncertain_acknowledged')
    def test_stale_or_replayed_grant_is_rejected(self):
        state=self.state()
        with self.assertRaises(ValueError):core.continue_task(state,'old','new','x',1)
        core.continue_task(state,'same','same','x',2)
        with self.assertRaises(ValueError):core.continue_task(state,'same','same','x',2)
    def test_only_owner_comment_can_grant_continuation(self):
        self.prepare();ledger=Ledger(self.api,'kimi','issue-9');ledger.load()
        self.event.update(action='created',comment={'id':123,'user':{'login':'other','type':'User'},'body':'/agent continue '+json.dumps({'checkpoint':ledger.head,'calls':3})})
        self.write_event()
        with patch.dict(os.environ,{'GITHUB_EVENT_NAME':'issue_comment'}),self.assertRaises(ValueError):cli.prepare('kimi',self.api)
    def test_owner_continuation_consumed_once(self):
        self.prepare();ledger=Ledger(self.api,'kimi','issue-9');ledger.load()
        self.event.update(action='created',comment={'id':123,'user':{'login':'apotet','type':'User'},'body':'/agent continue '+json.dumps({'checkpoint':ledger.head,'calls':2})});self.write_event()
        with patch.dict(os.environ,{'GITHUB_EVENT_NAME':'issue_comment'}):
            cli.prepare('kimi',self.api)
            with self.assertRaises(ValueError):cli.prepare('kimi',self.api)
        self.assertEqual(self.state_after()['remaining_calls'],2)

    def test_kimi_requires_explicit_owner_start_or_dispatch_confirmation(self):
        self.event.update(action='opened')
        self.write_event()
        with patch.dict(os.environ, {'GITHUB_EVENT_NAME':'issues'}), self.assertRaises(ValueError):
            self.prepare()
        self.assertFalse(self.api.refs)
        self.event.update(action='created')
        self.event['comment']['body']='/agent start'
        self.write_event()
        with self.assertRaises(ValueError):
            self.prepare()
        self.assertFalse(self.api.refs)
        self.event['inputs']={'confirm_paid_api':'false'}
        self.write_event()
        with patch.dict(os.environ, {'GITHUB_EVENT_NAME':'workflow_dispatch'}), self.assertRaises(ValueError):
            cli.authorize('kimi')
        self.event['inputs']['confirm_paid_api']='true'
        self.write_event()
        with patch.dict(os.environ, {'GITHUB_EVENT_NAME':'workflow_dispatch'}):
            cli.authorize('kimi')

    def test_kimi_budget_and_token_limits_block_before_model_request(self):
        for invalid in [0, -1, 2.01, 'NaN', '0.001']:
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                self.task(budget_usd=invalid)
        for invalid in [{'max_total_calls':33}, {'max_input_tokens':250001},
                        {'max_output_tokens':65537}, {'max_calls':2,'max_total_calls':1}]:
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                self.task(**invalid)
        self.event['issue']['body']=json.dumps({'task':'work','mode':'edit','write_paths':['src/'],
                                                'budget_usd':'0.01','max_calls':1})
        self.write_event()
        self.prepare()
        self.assertEqual(self.loop([]), [])
        state=self.state_after()
        self.assertEqual(state['status'],'paused_budget')
        self.assertIn('task budget',state['budget_problem'])
        self.assertEqual(state['calls'],[])
        self.assertFalse(any(name.startswith('agents/budgets/') for name in self.api.refs))

    def test_kimi_shared_daily_reservations_cas_and_unknown_cost(self):
        from datetime import datetime, timezone
        now=datetime(2026,11,26,tzinfo=timezone.utc)
        state=self.state(budget_usd='2.00')
        estimate=budget.estimate(state)
        reservation=budget.reserve_daily(self.api,state,estimate,now)
        daily=budget.DailyLedger(self.api,'2026-11-26')
        self.assertEqual(daily.data['reservations'][reservation['key']]['status'],'reserved')
        with self.assertRaises(budget.BudgetExceeded):
            budget.reserve_daily(self.api,state,estimate,now)
        stale=budget.DailyLedger(self.api,'2026-11-26')
        budget.settle_daily(self.api,reservation,{'range_usd':None})
        with self.assertRaises(budget.BudgetExceeded):
            stale.save()
        daily=budget.DailyLedger(self.api,'2026-11-26')
        self.assertEqual(daily.data['reservations'][reservation['key']]['held_micro'],estimate['reserved_micro'])
        self.assertEqual(daily.data['reservations'][reservation['key']]['status'],'usage_unknown')
        daily.data['reservations']['another-task']={'held_micro':budget.DAILY_MICRO,'status':'reserved'}
        daily.save()
        state['key']='issue-10'
        with self.assertRaises(budget.BudgetExceeded):
            budget.reserve_daily(self.api,state,estimate,now)

    def test_kimi_daily_and_task_charge_use_known_upper_bound(self):
        from datetime import datetime, timezone
        now=datetime(2026,11,26,tzinfo=timezone.utc)
        state=self.state(budget_usd='0.25',max_calls=1)
        estimate=budget.estimate(state)
        reservation=budget.reserve_daily(self.api,state,estimate,now)
        self.assertEqual(budget.daily_status(self.api,now)['unsettled_or_unknown'],1)
        budget.settle_daily(self.api,reservation,{'range_usd':{'min':0.02,'max':0.03}})
        status=budget.daily_status(self.api,now)
        self.assertEqual(status['held_or_known_upper_usd'],0.03)
        self.assertEqual(status['unsettled_or_unknown'],0)
        state['calls'].append({'budget_reservation':reservation,'cost':{'range_usd':{'min':0.02,'max':0.03}}})
        self.assertEqual(budget.estimate(state)['task_used_micro'],30000)
        state['task']['budget_usd']='0.01'
        with self.assertRaises(budget.BudgetExceeded):
            budget.estimate(state)

    def test_kimi_input_limit_and_missing_budget_fail_closed(self):
        state=self.state(max_input_tokens=1)
        with self.assertRaises(budget.BudgetExceeded):
            budget.estimate(state)
        state=self.state()
        del state['task']['budget_usd']
        with self.assertRaises(budget.BudgetExceeded):
            budget.estimate(state)

    def test_kimi_total_calls_remain_bounded_across_continuations(self):
        state=self.state(max_calls=1,max_total_calls=1)
        core.reserve(state)
        with self.assertRaises(ValueError):
            core.continue_task(state,'same','same','new-grant',1)
    def test_invalid_json_is_discarded_and_does_not_spend_again(self):
        self.prepare();self.loop([response('{bad json')])
        state=self.state_after();self.assertEqual(len(state['calls']),1)
        self.assertNotIn('response',state['calls'][0]);self.assertEqual(state['status'],'uncertain')
    def test_validation_errors_feed_next_call_and_are_saved(self):
        self.prepare();results=[{'passed':False,'logs':['full failure log']},{'passed':True,'logs':['pass']}]
        seen=self.loop([response({'status':'complete','files':[{'path':'src/a.ts','content':'bad'}]}),response({'status':'complete','files':[{'path':'src/a.ts','content':'fixed'}]})],lambda r,s:results.pop(0))
        self.assertIn('full failure log',seen[1][1][-1]['content']);self.assertEqual(self.state_after()['status'],'ready_for_review')
    def test_partial_file_cannot_be_marked_complete(self):
        self.prepare();self.loop([response({'status':'complete','files':[{'path':'src/new.ts','content':'part','complete':False}]})])
        self.assertNotEqual(self.state_after()['status'],'ready_for_review')
    def test_pending_answer_can_process_without_another_request(self):
        self.prepare();plan,ledger,state=cli.load_activation(self.api)
        core.reserve(state);cli.persist(ledger,state,plan)
        core.answered(state,response({'status':'complete','files':[{'path':'src/a.ts','content':'saved'}]}));cli.persist(ledger,state,plan)
        self.loop([]);self.assertEqual(len(self.state_after()['calls']),1)
    def test_no_financial_ceiling_and_unknown_cost_not_zero(self):
        state=self.state();core.reserve(state)
        core.answered(state,response({'status':'continue'}));state['calls'][0]['cost']=providers.cost('kimi-k3.1-pro',{'prompt_tokens':1000000,'completion_tokens':1000000},{})
        self.assertGreater(core.totals(state)['cost_range_usd']['max'],.25)
        state['calls'][0].pop('cost');self.assertEqual(core.totals(state)['cost_unknown_calls'],1);self.assertIsNone(core.totals(state)['exact_cost_usd'])
    def test_observed_cache_range_without_invented_exact_sum(self):
        price=providers.cost('kimi-k3.1-pro',{'prompt_tokens':5349,'completion_tokens':4076,'prompt_tokens_details':{'cache_write_tokens':5120}},
                             {'msh-usage-cache-write-tokens-5m':5120,'msh-usage-cache-write-tokens-1h':0})
        self.assertIsNone(price['exact_usd']);self.assertEqual(price['range_usd'],{'min':.0510458,'max':.051458})
    def test_inconsistent_cache_is_not_exact(self):
        price=providers.cost('kimi-k3.1-pro',{'prompt_tokens':100,'completion_tokens':5,'prompt_tokens_details':{'cached_tokens':0,'cache_write_tokens':0}},
                             {'msh-usage-cache-write-tokens-5m':10,'msh-usage-cache-write-tokens-1h':0})
        self.assertIsNone(price['exact_usd']);self.assertTrue(price['inconsistent_cache'])
    def test_sse_retains_reasoning_usage_and_length(self):
        stream='data: '+json.dumps({'choices':[{'delta':{'content':'full','reasoning_content':'thinking'},'finish_reason':'length'}],'usage':{'prompt_tokens':1,'completion_tokens':2}})+'\n\ndata: [DONE]\n'
        result=providers.parse_stream(stream);self.assertEqual(result['content'],'full');self.assertEqual(result['reasoning_content'],'thinking');self.assertEqual(result['finish_reason'],'length')
        with self.assertRaises(ValueError):providers.parse_stream(stream+'data: {}\n')
        with self.assertRaises(ValueError):providers.parse_stream('data: broken\n')
    def test_publisher_only_own_branch_and_draft(self):
        self.prepare();self.loop([response({'status':'complete','files':[{'path':'src/a.ts','content':'new'}]})]);cli.publish('kimi',self.api)
        state=self.state_after();self.assertEqual(state['status'],'published_draft');self.assertTrue(self.api.prs[0]['draft'])
        refs=[c[2]['ref'] for c in self.api.calls if c[0]=='POST' and c[1]=='/git/refs']
        self.assertTrue(all(r.startswith(('refs/heads/agents/state/','refs/heads/agents/budgets/','refs/heads/kimi/')) for r in refs))
        self.assertFalse(any('/merge' in c[1] or '/deploy' in c[1] for c in self.api.calls))
    def test_metadata_publish_is_idempotent(self):
        self.prepare();self.loop([response({'status':'complete','files':[{'path':'src/a.ts','content':'new'}]})]);cli.publish('kimi',self.api)
        plan,ledger,state=cli.load_activation(self.api);state['status']='ready_for_review';cli.persist(ledger,state,plan)
        count=len(self.api.prs);head=state['published_head'];cli.publish('kimi',self.api)
        self.assertEqual(len(self.api.prs),count);self.assertEqual(self.state_after()['published_head'],head)
    def test_owner_changes_branch_or_pr_state_are_respected(self):
        self.prepare();self.loop([response({'status':'complete','files':[{'path':'src/a.ts','content':'new'}]})]);cli.publish('kimi',self.api)
        state=self.state_after();self.api.prs[0]['draft']=False
        with self.assertRaises(ValueError):cli.owned_pr(self.api,state)
        self.api.prs[0]['draft']=True;self.api.refs['kimi/issue-9']='human-commit'
        with self.assertRaises(ValueError):cli.owned_pr(self.api,state)
    def test_publication_recovers_after_pr_creation_checkpoint_failure(self):
        self.prepare()
        self.loop([response({'status':'complete','files':[{'path':'src/a.ts','content':'new'}]})])
        _,ledger,state=cli.load_activation(self.api)
        original_save=ledger.save
        count=0
        def save(candidate):
            nonlocal count
            count+=1
            if count==2:raise RuntimeError('simulated checkpoint failure')
            return original_save(candidate)
        with patch.object(ledger,'save',side_effect=save),self.assertRaises(RuntimeError):
            core.publish_candidate(self.api,ledger,state)
        self.assertEqual(len(self.api.prs),1)
        saved=ledger.load()
        self.assertNotIn('pr_number',saved)
        head=self.api.ref('kimi/issue-9')
        core.publish_candidate(self.api,ledger,saved)
        self.assertEqual(saved['status'],'published_draft')
        self.assertEqual(len(self.api.prs),1)
        self.assertEqual(self.api.ref('kimi/issue-9'),head)

    def test_publication_recovers_after_ref_creation_checkpoint_failure(self):
        self.prepare()
        self.loop([response({'status':'complete','files':[{'path':'src/a.ts','content':'new'}]})])
        _,ledger,state=cli.load_activation(self.api)
        with patch.object(ledger,'save',side_effect=RuntimeError('simulated failure')),self.assertRaises(RuntimeError):
            core.publish_candidate(self.api,ledger,state)
        head=self.api.ref('kimi/issue-9')
        self.assertIsNotNone(head)
        saved=ledger.load()
        self.assertIsNone(saved['published_head'])
        core.publish_candidate(self.api,ledger,saved)
        self.assertEqual(self.api.ref('kimi/issue-9'),head)
        self.assertEqual(saved['status'],'published_draft')

    def test_existing_or_concurrently_ready_pr_never_has_branch_changed(self):
        self.prepare()
        self.loop([response({'status':'complete','files':[{'path':'src/a.ts','content':'new'}]})])
        cli.publish('kimi',self.api)
        state=self.state_after();head=state['published_head']
        state['status']='ready_for_review'
        state.pop('pr_number')
        state['overlay']['src/a.ts']=base64.b64encode(b'different candidate').decode()
        ledger=Ledger(self.api,'kimi','issue-9');ledger.load()
        for draft in (True,False):
            self.api.prs[0]['draft']=draft
            with self.subTest(draft=draft),self.assertRaises(ValueError):
                core.publish_candidate(self.api,ledger,state)
            self.assertEqual(self.api.ref('kimi/issue-9'),head)
        self.assertFalse(any(method=='PATCH' and endpoint=='/git/refs/heads/kimi/issue-9'
                             for method,endpoint,_ in self.api.calls))

    def test_draft_change_during_recovery_never_mutates_branch(self):
        self.prepare()
        self.loop([response({'status':'complete','files':[{'path':'src/a.ts','content':'new'}]})])
        cli.publish('kimi',self.api)
        state=self.state_after();state['status']='ready_for_review'
        state.pop('pr_number');head=state['published_head']
        ledger=Ledger(self.api,'kimi','issue-9');ledger.load()
        original=self.api.request
        def request(method,endpoint,data=None):
            if method=='GET' and endpoint.startswith('/pulls/'):
                self.api.prs[0]['draft']=False
            return original(method,endpoint,data)
        with patch.object(self.api,'request',side_effect=request),self.assertRaises(ValueError):
            core.publish_candidate(self.api,ledger,state)
        self.assertEqual(self.api.ref('kimi/issue-9'),head)
        self.assertFalse(any(method=='PATCH' and endpoint=='/git/refs/heads/kimi/issue-9'
                             for method,endpoint,_ in self.api.calls))
    def test_draft_change_after_preflight_is_detected_without_branch_update(self):
        self.prepare()
        self.loop([response({'status':'complete','files':[{'path':'src/a.ts','content':'new'}]})])
        cli.publish('kimi',self.api)
        state=self.state_after();state['status']='ready_for_review'
        head=state['published_head']
        ledger=Ledger(self.api,'kimi','issue-9');ledger.load()
        original=self.api.request;reads=0
        def request(method,endpoint,data=None):
            nonlocal reads
            if method=='GET' and endpoint.startswith('/pulls/'):
                reads+=1
                if reads==2:self.api.prs[0]['draft']=False
            return original(method,endpoint,data)
        with patch.object(self.api,'request',side_effect=request),self.assertRaises(ValueError):
            core.publish_candidate(self.api,ledger,state)
        self.assertEqual(reads,2)
        self.assertEqual(self.api.ref('kimi/issue-9'),head)
        self.assertFalse(any(method=='PATCH' and endpoint=='/git/refs/heads/kimi/issue-9'
                             for method,endpoint,_ in self.api.calls))
    def test_publish_requires_checks_not_model_claim(self):
        state=self.state();state['status']='ready_for_review'
        with self.assertRaises(ValueError):core.publish_candidate(self.api,Ledger(self.api,'kimi','issue-9'),state)
    def test_docker_boundary_has_no_credentials_network_or_host_control_mount(self):
        args=sandbox.docker_args('/private/work','/trusted/tools',['node','tests/new.test.mjs'])
        self.assertIn('type=bind,src=/trusted/tools,dst=/tools/node_modules,readonly',args)
        self.assertEqual(args[args.index('--network')+1],'none');self.assertIn('--read-only',args)
        self.assertIn('ALL',args);self.assertNotIn('0:0',args)
        rendered=' '.join(args)
        for value in ['GH_TOKEN','PROVIDER_API_KEY','docker.sock','--privileged','--pid=host']:
            self.assertNotIn(value,rendered)
    def test_new_dependency_sources_cannot_read_host_files(self):
        work=self.root/'deps';work.mkdir();(work/'package-lock.json').write_text(json.dumps({'packages':{'x':{'resolved':'file:/etc/passwd'}}}))
        with self.assertRaises(ValueError):sandbox.check_lock(work)
    def test_sandbox_mandatory_checks_and_extra_tests(self):
        state=self.state(checks=['tests/feature.test.mjs']);policy.apply_files(state,[{'path':'src/a.ts','content':'new'}])
        calls=[]
        def runner(args,**kwargs):
            calls.append((args,kwargs));self.assertNotIn('PROVIDER_API_KEY',kwargs.get('env',{}))
            return subprocess.CompletedProcess(args,0,'full stdout','full stderr')
        result=sandbox.validate(self.repo,state,self.root/'trusted-tools',runner)
        self.assertTrue(result['passed']);self.assertEqual([x['check'] for x in result['logs']],['dependencies','typecheck','build','questions','tests/feature.test.mjs'])
        runs=[a for a,_ in calls if a[0]=='docker'];self.assertEqual(runs[0][runs[0].index('--network')+1],'bridge')
        self.assertIn('--ignore-scripts',runs[0]);self.assertTrue(all(a[a.index('--network')+1]=='none' for a in runs[1:]))
    def test_report_links_full_outputs_instead_of_slicing(self):
        self.prepare();self.loop([response({'status':'complete','files':[{'path':'src/a.ts','content':'new'}],'report':'r'*100000})]);cli.report('kimi',self.api)
        self.assertEqual((self.out/'report.md').read_text(),'r'*100000)
        self.assertIn('Checked report',self.api.notes[-1]['body'])
    def test_documented_credential_placeholder_is_not_a_real_key(self):
        policy.safe_text('placeholder="ghp_'+('x'*36)+'"')
        with self.assertRaises(ValueError):policy.safe_text('ghp_'+('abc123'*6))

    def test_raw_stream_sidecars_preserve_full_bytes_across_checkpoints(self):
        state=self.state();ledger=Ledger(self.api,'kimi','issue-9')
        core.reserve(state)
        reply=response({'status':'complete','report':'ok'})
        raw='data: '+json.dumps({'padding':'полный поток '*800000,
            'choices':[{'delta':{'content':reply['content'],'reasoning_content':reply['reasoning_content']},
                        'finish_reason':'stop'}]},ensure_ascii=False)+'\n\ndata: [DONE]\n'
        reply['raw']=raw
        core.answered(state,reply);ledger.save(state)
        saved=ledger.load();self.assertNotIn('raw',saved['calls'][0]['response'])
        paths=saved['calls'][0]['response_artifacts'];self.assertGreater(len(paths),1)
        ledger.save(saved);ledger.materialize(ledger.load(),self.out)
        restored=b''.join((self.out/'ledger-artifacts'/p).read_bytes() for p in paths)
        self.assertEqual(restored,raw.encode())
        self.assertEqual(saved['messages'][-1]['content'],reply['content'])
    def test_transport_single_attempt_rejects_key_without_output_artifacts(self):
        raw='data: '+json.dumps({'choices':[{'delta':{'content':'fake-not-sent'},'finish_reason':'stop'}]})+'\ndata: [DONE]\n'
        def transport(argv,**kw):
            self.assertEqual(argv[argv.index('--retry')+1],'0');self.assertNotIn('--max-filesize',argv)
            Path(argv[argv.index('--output')+1]).write_text(raw)
            Path(argv[argv.index('--dump-header')+1]).write_text('Authorization: fake-not-sent\r\nmsh-usage-cache-write-tokens-5m: 12\r\n')
            return subprocess.CompletedProcess(argv,0,'200','')
        with patch.object(providers.subprocess,'run',side_effect=transport) as run:
            with self.assertRaises(ValueError):providers.infer(self.task(),[],self.out,30)
        self.assertEqual(run.call_count,1)
        self.assertFalse(self.out.exists())

    def test_active_routes_use_one_engine_and_do_not_load_old_caps(self):
        for name in ['zai','kimi']:
            text=(ROOT/f'.github/workflows/{name}-issue.yml').read_text();self.assertIn('uses: ./.github/workflows/agent-task.yml',text)
        self.assertFalse((ROOT/'.github/zai-agent-limits.json').exists())
        self.assertFalse((ROOT/'.github/scripts/kimi_issue_text_guard.mjs').exists())
        workflow=(ROOT/'.github/workflows/agent-task.yml').read_text();self.assertIn('PROVIDER_API_KEY',workflow);self.assertNotIn('merge_pull_request',workflow)


if __name__=='__main__':unittest.main(verbosity=2)

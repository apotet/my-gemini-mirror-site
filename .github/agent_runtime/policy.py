"""Limit dangerous effects, not model intelligence. No secret/control-plane writes."""
import base64
import binascii
import hashlib
import json
import os
from pathlib import PurePosixPath
import re

ROOTS = ('src/','public/','assets/','docs/','tests/','scripts/')
CONFIG = {'package.json','package-lock.json','tsconfig.json','vite.config.ts','index.html','index.dev.html','README.md'}
CONTROL = ('scripts/zai','scripts/agent','scripts/gemini','scripts/telegram-notify.py','tests/test_agent_runtime',
           'scripts/validate-questions.mjs','scripts/load-bank.mjs','scripts/data-entry.ts',
           'docs/AGENT_RUNTIME.md','docs/KIMI_ISSUE_AGENT.md','docs/ZAI_ISSUE_AGENT.md','docs/GEMINI_ISSUE_AGENT.md','docs/GEMINI_DEV_AGENT.md',
           'docs/STATE.md','docs/DEVELOPMENT_WORKFLOW.md','docs/LEARNING_CONTENT_STANDARD.md')
SECRET_NAMES = {'.env','.npmrc','.pypirc','.netrc','credentials','id_rsa','id_ed25519','authorized_keys'}


def path(value, write=False, directory=False):
    if not isinstance(value,str) or not value or any(ord(c)<32 for c in value) or '\\' in value:
        raise ValueError('Invalid project path')
    p = PurePosixPath(value.rstrip('/') if directory else value)
    if (not directory and value.endswith('/')) or p.is_absolute() or '..' in p.parts or '.' in p.parts or str(p)!=value.rstrip('/'):
        raise ValueError('Noncanonical/traversing path')
    if any(part in SECRET_NAMES or part.startswith('.env.') or part in ('.git','.aws','.codex','.agents') or part.endswith(('.pem','.key')) for part in p.parts):
        raise ValueError('Secret path forbidden')
    allowed = value in CONFIG or value.startswith(ROOTS)
    if not write and (value=='AGENT.md' or value.startswith(('.github/agent-tasks/','.github/agent/context/'))): allowed=True
    if not allowed or (write and value.startswith(CONTROL)):
        raise ValueError('Outside project data/code scope or protected runtime')
    return value


def scoped(value, scopes):
    path(value,write=True)
    if not any(value==s or (s.endswith('/') and value.startswith(s)) for s in scopes):
        raise ValueError('Outside coordinator write scope')


def safe_text(text):
    for name in ('PROVIDER_API_KEY','GH_TOKEN','GITHUB_TOKEN'):
        secret=os.environ.get(name,'').strip()
        if secret:
            encoded=base64.b64encode(secret.encode()).decode()
            urlencoded=base64.urlsafe_b64encode(secret.encode()).decode()
            if any(value in text for value in (secret,encoded,encoded.rstrip('='),urlencoded, urlencoded.rstrip('='))):
                raise ValueError('Credential material detected; do not disclose')
    if re.search(r'-----BEGIN (?:[A-Z ]*PRIVATE KEY|OPENSSH PRIVATE KEY)-----',text):
        raise ValueError('Private credential material in source; do not send to a model')
    if re.search(r'(?<![A-Za-z0-9_-])AIza[A-Za-z0-9_-]{35}(?![A-Za-z0-9_-])',text):
        raise ValueError('Possible Google API credential in source; do not disclose')
    if re.search(r'(?<![A-Za-z0-9])AKIA[0-9A-Z]{16}(?![A-Za-z0-9])',text):
        raise ValueError('Possible AWS credential in source; do not disclose')
    candidates=re.finditer(r'(?<![A-Za-z0-9_-])(?:sk-proj-|sk-ant-|sk-|ghp_|ghs_|gho_|ghu_|ghr_|github_pat_)([A-Za-z0-9_-]{24,})',text)
    if any(set(match.group(1)) not in ({'x'},{'X'}) for match in candidates):
        raise ValueError('Possible credential in source; do not disclose')
    return text


def safe_bytes(data):
    # Binary data can place ASCII identifier characters directly beside a key.
    if re.search(rb'AIza[A-Za-z0-9_-]{35}',data):
        raise ValueError('Possible Google API credential in bytes; do not disclose')
    if re.search(rb'AKIA[0-9A-Z]{16}',data):
        raise ValueError('Possible AWS credential in bytes; do not disclose')
    candidates=re.finditer(rb'(?:sk-proj-|sk-ant-|sk-|ghp_|ghs_|gho_|ghu_|ghr_|github_pat_)([A-Za-z0-9_-]{24,})',data)
    if any(set(match.group(1)) not in ({ord('x')},{ord('X')}) for match in candidates):
        raise ValueError('Possible credential in bytes; do not disclose')
    safe_text(data.decode('utf-8',errors='replace'))


def checked_text_bytes(data):
    try:text=data.decode('utf-8')
    except UnicodeDecodeError:
        raise ValueError('Opaque binary is not accepted by the shared agent runtime') from None
    if any(ord(c)<32 and c not in '\t\r\n' or 127<=ord(c)<=159 for c in text):
        raise ValueError('Opaque binary control bytes are not accepted by the shared agent runtime')
    safe_bytes(data)
    return text


def safe_value(value):
    if isinstance(value,str):
        safe_text(value)
        # Inspect encoded tokens as well as ordinary text, including JSON file content.
        for match in re.finditer(r'(?<![A-Za-z0-9_+/=-])[A-Za-z0-9_+/-]{32,}={0,2}(?![A-Za-z0-9_+/=-])',value):
            encoded=match.group()
            try:decoded=base64.b64decode(encoded+'='*(-len(encoded)%4),altchars=b'-_',validate=True)
            except (binascii.Error,ValueError):continue
            safe_bytes(decoded)
    elif isinstance(value,dict):
        if value.get('encoding')=='base64' and isinstance(value.get('content'),str):
            checked_text_bytes(base64.b64decode(value['content'],validate=True))
        for key,item in value.items():
            safe_value(key);safe_value(item)
    elif isinstance(value,(list,tuple)):
        for item in value:safe_value(item)


def decoder():
    def pairs(items):
        result={}
        for key,value in items:
            if key in result:raise ValueError('Duplicate JSON key')
            result[key]=value
        return result
    def nonfinite(_):
        raise ValueError('Nonfinite JSON')
    return json.JSONDecoder(object_pairs_hook=pairs,parse_constant=nonfinite)


def strict_json(text):
    return decoder().decode(text.lstrip(' \t\r\n'))


ENVELOPE_FIELDS={'status','summary','report','read_files','files'}


def checked_envelope(text,finish):
    """Inspect complete JSON or a MAX_TOKENS prefix ending at a checkable field boundary."""
    if finish not in ('stop','length'):
        raise ValueError('Incomplete transport response cannot be checked safely')
    try:envelope=strict_json(text)
    except json.JSONDecodeError:
        if finish!='length':raise
    else:
        if not isinstance(envelope,dict) or set(envelope)-ENVELOPE_FIELDS:
            raise ValueError('Invalid response envelope')
        safe_value(envelope)
        return envelope,True
    dec=decoder()
    text=text.strip(' \t\r\n')
    envelope={};seen=set()
    if not text.startswith('{'):raise ValueError('Unverified response prefix')
    index=1
    def skip(pos):
        while pos<len(text) and text[pos] in ' \t\r\n':pos+=1
        return pos
    try:
        while (index:=skip(index))<len(text):
            key,end=dec.raw_decode(text,index)
            if not isinstance(key,str) or key not in ENVELOPE_FIELDS or key in seen:
                raise ValueError('Unexpected or repeated response field')
            seen.add(key)
            index=skip(end)
            if index==len(text):break
            if text[index]!=':':raise ValueError('Invalid response prefix')
            index=skip(index+1)
            if index==len(text):break
            value,end=dec.raw_decode(text,index)
            envelope[key]=value
            index=skip(end)
            if index==len(text):
                # A number can have been split before more digits or an exponent.
                if type(value) in (int,float):raise ValueError('Unverified partial value')
                break
            if text[index]!=',':raise ValueError('Invalid response prefix')
            index+=1
    except json.JSONDecodeError:
        raise ValueError('Unverified partial value cannot be saved') from None
    safe_value(envelope)
    return envelope,False


def check_state(state):
    safe_value(state)
    for message in state.get('messages',[]):
        if message.get('role')!='user':continue
        content=message.get('content')
        if not isinstance(content,str):
            raise ValueError('Opaque inline attachments cannot be checkpointed')
        try:envelope=strict_json(content)
        except ValueError:continue  # ordinary user instructions are not JSON
        if isinstance(envelope,dict) and isinstance(envelope.get('files'),list):
            safe_value(envelope['files'])
    for encoded in state.get('overlay',{}).values():
        if encoded is not None:checked_text_bytes(base64.b64decode(encoded,validate=True))
    check_response_history(state)


RESET_NOTES=frozenset({
    'Coordinator explicitly requests a fresh JSON envelope after the previous invalid/partial response.',
    'Coordinator explicitly requests a fresh JSON envelope after the previous invalid/partial response. Full raw responses remain in the history.',
})
CHECKPOINT_REVIEW='Checkpoint needs offline operator review; leave its ref intact and do not retry an old attempt'


def needs_legacy_response_check(state):
    return any(call.get('response') and 'response_starts_envelope' not in call for call in state.get('calls',[]))


def check_response_history(state):
    messages=state.get('messages',[])
    calls=state.get('calls',[])
    legacy_history=needs_legacy_response_check(state)
    assistant_index=-1
    last_response_index=-1
    parts=[]
    before_latest=''
    for call in calls:
        if call.get('raw_partial_base64'):
            raise ValueError('Unverified partial response cannot be saved')
        response=call.get('response')
        if not response:continue
        marker=call.get('response_starts_envelope')
        if type(call.get('message_count')) is int:last_response_index=call['message_count']
        reset=False
        if legacy_history:
            # v2 recorded the outbound message count immediately before inference;
            # the durable assistant message was then appended at that same index.
            index=call.get('message_count')
            if type(index) is not int or not assistant_index<index<len(messages):
                raise ValueError(CHECKPOINT_REVIEW+' (legacy response order cannot be established)')
            row=messages[index]
            if (row.get('role')!='assistant' or row.get('content')!=response['content'] or
                row.get('reasoning_content','')!=response.get('reasoning_content','')):
                raise ValueError(CHECKPOINT_REVIEW+' (legacy response archive and assistant history disagree)')
            gap=messages[assistant_index+1:index]
            if any(message.get('role')=='assistant' for message in gap):
                raise ValueError(CHECKPOINT_REVIEW+' (unmatched legacy assistant message)')
            reset=any(m.get('role')=='user' and m.get('content') in RESET_NOTES for m in gap)
            assistant_index=index
        if marker is not None and type(marker) is not bool:
            raise ValueError('Invalid response envelope boundary')
        starts=marker if marker is not None else not parts or reset
        if starts and parts:
            try:checked_envelope(''.join(parts),'length')
            except ValueError:
                # A reset is not permission to retain bytes that cannot be inspected.
                raise ValueError(CHECKPOINT_REVIEW+' (reset left an uncheckable original prefix)') from None
            parts=[]
        if not starts and not parts:
            raise ValueError(CHECKPOINT_REVIEW+' (missing prior response segment)')
        before_latest=''.join(parts) if call is calls[-1] else ''
        parts.append(response['content'])
        finish=response['finish_reason']
        try:
            if finish=='stop' or marker is not None:
                _,complete=checked_envelope(''.join(parts),finish)
                if complete:parts=[]
            elif finish!='length':
                raise ValueError('Legacy transport response has no verified terminator')
        except ValueError:
            if legacy_history:raise ValueError(CHECKPOINT_REVIEW+' (legacy envelope cannot be verified)') from None
            raise
        if response.get('raw'):
            check_raw_response(state['provider'],response,response['raw'])
    if legacy_history and any(m.get('role')=='assistant' for m in messages[assistant_index+1:]):
        raise ValueError(CHECKPOINT_REVIEW+' (unmatched legacy assistant message)')
    pending=state.get('pending_text','')
    last=(calls or [{}])[-1]
    tail=''.join(parts)
    if tail:
        try:checked_envelope(tail,'length')
        except ValueError:
            if legacy_history:raise ValueError(CHECKPOINT_REVIEW+' (legacy prefix ends in an uncheckable value)') from None
            raise
    if last.get('response') and not last.get('processed'):
        expected=before_latest
    else:
        expected=tail
        # With no later response, a completed owner reset can legitimately leave
        # a checked, abandoned prefix in history and no pending payload at all.
        trailing_reset=any(m.get('role')=='user' and m.get('content') in RESET_NOTES
                           for m in messages[assistant_index+1:]) if legacy_history else False
        if trailing_reset:expected=''
        elif not legacy_history and not pending and tail:
            if last_response_index>=0 and any(m.get('role')=='user' and m.get('content') in RESET_NOTES for m in messages[last_response_index+1:]):
                expected=''
    if pending!=expected:
        raise ValueError(CHECKPOINT_REVIEW+' (pending response does not match the checked history)')


def check_raw_response(provider,response,raw):
    from . import providers
    safe_value(raw)
    if provider=='gemini':
        safe_value(strict_json(raw))
        parsed=providers.parse_gemini(raw)
    else:
        for line in raw.splitlines():
            if line.startswith('data:') and line[5:].strip() not in ('','[DONE]'):
                safe_value(strict_json(line[5:].strip()))
        parsed=providers.parse_stream(raw)
    safe_value(parsed)
    for key in ('content','reasoning_content','finish_reason'):
        if parsed.get(key,'')!=response.get(key,''):
            raise ValueError('Raw response does not match parsed response')


def check_response(state,response):
    safe_value(response)
    envelope,_=checked_envelope(state.get('pending_text','')+response['content'],response['finish_reason'])
    if response.get('raw'):check_raw_response(state['provider'],response,response['raw'])
    # Check decoded and assembled file chunks before the response is persisted.
    candidate={'task':state['task'],'overlay':dict(state['overlay']),
               'incomplete_files':list(state['incomplete_files']),
               'file_modes':dict(state.get('file_modes',{})),'source_files':state['source_files']}
    files=envelope.get('files',[])
    if not isinstance(files,list):raise ValueError('Invalid response files')
    apply_files(candidate,files)


def check_overlay(state):
    for name,encoded in state['overlay'].items():
        scoped(name,state['task']['write_paths'])
        if encoded is not None:checked_text_bytes(base64.b64decode(encoded,validate=True))


def digest(data): return hashlib.sha256(data).hexdigest()


def apply_files(state, files):
    if state['task']['mode']=='audit-only' and files:
        raise ValueError('Audit mode cannot edit')
    overlay = dict(state['overlay'])
    incomplete = set(state.get('incomplete_files',[]))
    for item in files:
        if not isinstance(item,dict) or set(item)-{'path','action','content','encoding','complete','expected_sha256','mode'}:
            raise ValueError('Invalid file operation')
        target = item['path'];scoped(target,state['task']['write_paths'])
        mode=item.get('mode',state.get('file_modes',{}).get(target,'100644'))
        if mode not in ('100644','100755'):raise ValueError('Symlink/special file modes forbidden')
        state.setdefault('file_modes',{})[target]=mode
        action = item.get('action','write')
        previous = overlay.get(target)
        if action=='delete':
            if target not in state['source_files'] and previous is None: raise ValueError('Deleting absent file')
            overlay[target]=None;incomplete.discard(target);continue
        encoding = item.get('encoding','utf-8')
        if encoding not in ('utf-8','base64') or not isinstance(item.get('content'),str): raise ValueError('Invalid file content')
        data = item['content'].encode() if encoding=='utf-8' else base64.b64decode(item['content'],validate=True)
        if action=='append':
            if target not in incomplete or previous is None: raise ValueError('Append requires a checkpointed partial file')
            before=base64.b64decode(previous)
            if item.get('expected_sha256')!=digest(before): raise ValueError('Append checkpoint hash mismatch')
            data=before+data
        elif action!='write': raise ValueError('Unknown file action')
        checked_text_bytes(data)
        complete=item.get('complete',True)
        if type(complete) is not bool: raise ValueError('complete must be boolean')
        overlay[target]=base64.b64encode(data).decode()
        if complete: incomplete.discard(target)
        else: incomplete.add(target)
    state['overlay'],state['incomplete_files']=overlay,sorted(incomplete)

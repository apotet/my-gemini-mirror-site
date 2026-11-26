"""Limit dangerous effects, not model intelligence. No secret/control-plane writes."""
import base64
import hashlib
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
    if re.search(r'-----BEGIN (?:[A-Z ]*PRIVATE KEY|OPENSSH PRIVATE KEY)-----',text):
        raise ValueError('Private credential material in source; do not send to a model')
    if re.search(r'(?<![A-Za-z0-9_-])AIza[A-Za-z0-9_-]{35}(?![A-Za-z0-9_-])',text):
        raise ValueError('Possible Google API credential in source; do not disclose')
    candidates=re.finditer(r'(?<![A-Za-z0-9_-])(?:sk-proj-|sk-ant-|sk-|ghp_|ghs_)([A-Za-z0-9_-]{24,})',text)
    if any(set(match.group(1)) not in ({'x'},{'X'}) for match in candidates):
        raise ValueError('Possible credential in source; do not disclose')
    return text


def safe_bytes(data):
    # Inspect the assembled bytes, regardless of transport encoding or chunk cuts.
    # Replacement decoding preserves binary files and still detects ASCII credentials.
    safe_text(data.decode('utf-8',errors='replace'))


def check_overlay(state):
    for name,encoded in state['overlay'].items():
        scoped(name,state['task']['write_paths'])
        if encoded is not None:safe_bytes(base64.b64decode(encoded,validate=True))


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
        safe_bytes(data)
        complete=item.get('complete',True)
        if type(complete) is not bool: raise ValueError('complete must be boolean')
        overlay[target]=base64.b64encode(data).decode()
        if complete: incomplete.discard(target)
        else: incomplete.add(target)
    state['overlay'],state['incomplete_files']=overlay,sorted(incomplete)

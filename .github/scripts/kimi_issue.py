"""Owner-only, single-call Issue adapter for the existing Kimi Agent tools."""
import difflib
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import urllib.request
from decimal import Decimal

from validate_inputs import validate_path

OUT = Path('out')
MODEL = 'kimi-k3.1-pro'
MARKER = '<!-- kimi-agent:claimed:v1 -->'
MAX_BYTES, MAX_OUTPUT = 39000, 8192
CAP = Decimal('0.25')
# Published 2026-11-25: input $2 + default 5m cache write $2; hit $.20; output $10.
# Use $4/input-MTok as a conservative bound, also covering 1h writes
# under a previously locked cache prefix. No cache savings assumed.
RATES = {'input': 2, 'cache_write': 2, 'cache_hit': .2, 'output': 10}
PRICING = 'https://platform.kimi.ai/docs/pricing/chat'
SCRIPTS = Path(__file__).resolve().parent


def save(name, value):
    OUT.mkdir(exist_ok=True)
    (OUT/name).write_text(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')


def load(name):
    return json.loads((OUT/name).read_text(encoding='utf-8'))


def sha(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def command(*args, env=None):
    # No secrets inherited by protocol tools, compilers or model-controlled tests.
    clean = {k:v for k,v in os.environ.items() if k not in {'GH_TOKEN', 'GITHUB_TOKEN', 'MOONSHOT_API_KEY'}}
    return subprocess.run(list(args), check=True, env={**clean, **(env or {})}, capture_output=True, text=True)


def git(*args):
    return command('git', *args).stdout.strip()


def github(method, endpoint, data=None):
    request = urllib.request.Request('https://api.github.com/repos/apotet/my-gemini-mirror-site'+endpoint,
        method=method, data=None if data is None else json.dumps(data).encode(),
        headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'], 'Accept':'application/vnd.github+json', 'Content-Type':'application/json'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def event():
    e = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    issue = e['issue']
    if (e.get('action') != 'opened' or issue.get('pull_request') or
        issue['user']['login'] != 'apotet' or issue['user'].get('type') != 'User' or
        e['sender']['login'] != 'apotet' or e['sender'].get('type') != 'User' or
        os.environ.get('GITHUB_ACTOR') != 'apotet' or
        os.environ.get('GITHUB_REPOSITORY') != 'apotet/my-gemini-mirror-site' or
        os.environ.get('GITHUB_REF') != 'refs/heads/main' or
        os.environ.get('GITHUB_RUN_ATTEMPT') != '1' or not issue['title'].startswith('[KIMI] ')):
        raise ValueError('Unauthorized event or repeat run')
    return issue


def unique_fields(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate JSON field')
        result[key] = value
    return result


def task_for(issue):
    task = json.loads(issue['body'], object_pairs_hook=unique_fields)
    allowed = {'task', 'target_files', 'mode', 'verification', 'max_tokens', 'model'}
    if not isinstance(task, dict) or set(task)-allowed:
        raise ValueError('Unknown task fields')
    task = {'mode':'audit-only', 'verification':'structure', 'max_tokens':MAX_OUTPUT, 'model':MODEL, **task}
    if task['mode'] not in ('audit-only', 'edit') or task['model'] != MODEL:
        raise ValueError('Unsupported mode/model')
    if not isinstance(task.get('task'), str) or not 1 <= len(task['task']) <= 12000:
        raise ValueError('Task must contain 1..12000 characters')
    targets = task.get('target_files')
    if not isinstance(targets, list) or not 1 <= len(targets) <= 4 or not all(isinstance(t,str) for t in targets) or len(set(targets)) != len(targets):
        raise ValueError('Expected 1..4 unique target files')
    for target in targets:
        validate_path(target, 'src/data/lessons/', '.ts')
        if target.rsplit('/',1)[1] in {'index.ts', 'types.ts', 'reviewStatus.ts', 'lessonSectionLinks.ts', 'existingUnderstandingHeadings.ts'}:
            raise ValueError('Target must be a lesson, not infrastructure')
    if task['verification'] not in ('structure', 'poe-full'):
        raise ValueError('AST verification cannot be disabled')
    if task['verification'] == 'poe-full' and targets != ['src/data/lessons/l1-poe-injectors-splitters.ts']:
        raise ValueError('poe-full requires the PoE injector lesson only')
    if type(task['max_tokens']) is not int or not 1024 <= task['max_tokens'] <= MAX_OUTPUT:
        raise ValueError('Output budget must be 1024..8192')
    return task


def budget(payload):
    if (payload['model'] != MODEL or payload['reasoning_effort'] != 'high' or
        payload['stream'] is not True or payload['stream_options'] != {'include_usage':True} or
        set(payload) != {'model','reasoning_effort','max_completion_tokens','stream','stream_options','messages'}):
        raise ValueError('Unexpected API parameters')
    tokens = payload['max_completion_tokens']
    if type(tokens) is not int or not 1024 <= tokens <= MAX_OUTPUT:
        raise ValueError('Invalid output budget')
    size = sum(len(m['content'].encode()) for m in payload['messages'])
    worst = (Decimal(size+2048)*4 + Decimal(tokens)*10)/1000000
    if size > MAX_BYTES or worst > CAP:
        raise ValueError('Context/cost bound exceeded; no truncation')
    return {'api_calls':0, 'input_utf8_bytes':size, 'max_cost_usd':float(worst), 'cost_limit_usd':float(CAP),
            'rates_per_million':RATES, 'pricing_verified':'2026-11-25', 'pricing_source':PRICING,
            'cost_basis':'conservative $4/input-MTok upper bound including cache writes; no discount', 'cost_usd':None}


def state_for(issue):
    state = load('state.json')
    if state['issue'] != issue['number'] or state['sourceSHA'] != os.environ['GITHUB_SHA'] or git('rev-parse','HEAD') != state['sourceSHA']:
        raise ValueError('Source/Issue changed')
    if state['task'] != task_for(issue):
        raise ValueError('Task state changed')
    return state


def prepare():
    issue = event()
    task = task_for(issue)
    OUT.mkdir(exist_ok=True)
    save('task.md',task['task'])
    save('targets.txt','\n'.join(task['target_files'])+'\n')
    for target in task['target_files']:
        dest = OUT/'originals'/target
        dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(target,dest)
    command(sys.executable,str(SCRIPTS/'build_payload.py'),MODEL,'high',str(task['max_tokens']),
        str(SCRIPTS.parent/'agent/system-prompt.md'),str(OUT/'task.md'),str(OUT/'payload.json'),*task['target_files'],env={'MODE':task['mode']})
    payload = load('payload.json')
    account = budget(payload)  # before claim or any model call
    source = git('rev-parse','HEAD')
    if source != os.environ['GITHUB_SHA']:
        raise ValueError('Unexpected checkout SHA')
    save('state.json',{'issue':issue['number'],'sourceSHA':source,'task':task,'payloadSHA':sha((OUT/'payload.json').read_text())})
    save('accounting.json',account)


def claim():
    issue = event()
    state = state_for(issue)
    budget(load('payload.json'))
    if state['task']['mode'] == 'edit':
        for i,target in enumerate(state['task']['target_files']):
            command('node',str(SCRIPTS/'structure_check.mjs'),target,target,str(OUT/f'baseline-{i}.txt'))
    endpoint = f"/issues/{issue['number']}/comments"
    page = 1
    while True:
        comments = github('GET',endpoint+f'?per_page=100&page={page}')
        if any(MARKER in c.get('body','') for c in comments):
            raise ValueError('Issue already claimed; no repeat request')
        if len(comments) < 100:
            break
        page += 1
    result = github('POST',endpoint,{'body':MARKER+'\nХимик принял задание: один запрос, без повторов. Потолок $0.25.'})
    save('claim.json',{'comment_id':result['id'],'issue':issue['number']})


def run():
    issue = event()
    state = state_for(issue)
    account = load('accounting.json')
    if account['api_calls'] != 0 or load('claim.json')['issue'] != issue['number']:
        raise ValueError('Missing claim or request already attempted')
    if state['payloadSHA'] != sha((OUT/'payload.json').read_text()):
        raise ValueError('Payload changed after preflight')
    budget(load('payload.json'))
    key = os.environ.get('MOONSHOT_API_KEY','').strip()
    if not key:
        raise ValueError('Missing MOONSHOT_API_KEY')
    account.update(api_calls=1,status='attempted; usage/cost unknown until response')
    save('accounting.json',account)  # any timeout/failure remains a spent attempt
    try:
        # -q ignores user curl config; no redirects, no SDK, explicit zero retries.
        result = subprocess.run(['curl','-q','--silent','--show-error','--no-buffer','--retry','0',
            '--max-time','600','--max-filesize','2000000','--proto','=https',
            '--dump-header',str(OUT/'response-headers.tmp'),
            '--output',str(OUT/'sse.log'),'--write-out','%{http_code}',
            'https://api.moonshot.ai/v1/chat/completions','--header','Authorization: Bearer '+key,
            '--header','Content-Type: application/json','--data-binary','@'+str(OUT/'payload.json')],
            capture_output=True,text=True,timeout=610)
        if result.returncode or result.stdout != '200':
            raise ValueError('Kimi request failed; no retry; usage/cost may be unknown')
    finally:
        headers = OUT/'response-headers.tmp'
        if headers.exists():
            counters = {}
            for line in headers.read_text(errors='replace').splitlines():
                name, _, value = line.partition(':')
                if name.lower() in {'msh-usage-cache-write-tokens-5m','msh-usage-cache-write-tokens-1h'} and value.strip().isdecimal():
                    counters[name.lower()] = int(value.strip())
            save('billing-headers.json',counters)
            headers.unlink()  # only allowlisted numeric billing metadata is retained
        if (OUT/'sse.log').exists():
            data = (OUT/'sse.log').read_bytes().replace(key.encode(),b'[REDACTED]')
            (OUT/'sse.log').write_bytes(data)


def accounting():
    account = load('accounting.json')
    if not (OUT/'meta.json').exists():
        return
    usage = load('meta.json').get('usage')
    account['cost_usd'] = None
    account['usage'] = usage
    account['status'] = 'response received; protocol/verification may still fail'
    if isinstance(usage,dict):
        inp, output = usage.get('prompt_tokens'), usage.get('completion_tokens')
        if all(type(n) is int and n >= 0 for n in [inp,output]):
            account['usage_cost_upper_bound_usd'] = float((Decimal(inp)*4+Decimal(output)*10)/1000000)
            account['cost_basis'] = 'conservative usage upper bound; exact cache TTL breakdown unavailable'
            details = usage.get('prompt_tokens_details') or {}
            cached, written = details.get('cached_tokens'), details.get('cache_write_tokens')
            headers = load('billing-headers.json') if (OUT/'billing-headers.json').exists() else {}
            w5 = headers.get('msh-usage-cache-write-tokens-5m')
            w1 = headers.get('msh-usage-cache-write-tokens-1h')
            if all(type(n) is int and n >= 0 for n in [cached,written]) and cached+written <= inp:
                if written == 0:
                    w5, w1 = 0, 0
                if all(type(n) is int and n >= 0 for n in [w5,w1]) and w5+w1 == written:
                    # Read/write/miss counts partition total input (official API contract).
                    cost = (Decimal(inp-cached-written)*2 + Decimal(cached)*Decimal('.2') + Decimal(w5)*2 + Decimal(w1)*4 + Decimal(output)*10)/1000000
                    account['cost_usd'] = float(cost)
                    account['cost_basis'] = 'returned usage and 5m/1h billing headers; published rates, before tax'
                    account['cache_write_5m_tokens'], account['cache_write_1h_tokens'] = w5, w1
    save('accounting.json',account)


def structures(task):
    for i,target in enumerate(task['target_files']):
        original, candidate = OUT/'originals'/target, OUT/'candidates'/target
        validate_path(target,'src/data/lessons/','.ts')
        if candidate.is_symlink() or not candidate.is_file() or any(p.is_symlink() for p in candidate.parents):
            raise ValueError('Missing candidate or symlink')
        if original.read_bytes() != Path(target).read_bytes() or original.read_bytes() == candidate.read_bytes():
            raise ValueError('Original changed or identical candidate')
        save(f'diff-{i}.patch',''.join(difflib.unified_diff(original.read_text().splitlines(True),candidate.read_text().splitlines(True),fromfile=target,tofile=target)))
        command('node',str(SCRIPTS/'kimi_issue_text_guard.mjs'),str(original),str(candidate))
        command('node',str(SCRIPTS/'structure_check.mjs'),str(original),str(candidate),str(OUT/f'structure-{i}.txt'))


def verify():
    issue = event()
    state = state_for(issue)
    task = state['task']
    try:
        command(sys.executable,str(SCRIPTS/'parse_sse.py'),str(OUT/'sse.log'),str(OUT),task['target_files'][0],env={'MODE':task['mode']})
    finally:
        accounting()  # keep usage even when protocol or candidate gates fail
    account = load('accounting.json')
    if 'usage_cost_upper_bound_usd' not in account:
        raise ValueError('Usage lacks valid input/output counters')
    if Decimal(str(account['usage_cost_upper_bound_usd'])) > CAP:
        raise ValueError('Returned usage exceeds agreed cost ceiling; no retry')
    if task['mode'] == 'audit-only':
        command('git','diff','--exit-code')
        return
    command(sys.executable,str(SCRIPTS/'extract_candidates.py'),str(OUT/'response.txt'),str(OUT),*task['target_files'])
    structures(task)
    for target in task['target_files']:
        shutil.copyfile(OUT/'candidates'/target,target)
    # Originals/candidates must not enter the project's tsc glob (same manual gate).
    import tempfile
    with tempfile.TemporaryDirectory() as temp:
        moved = Path(temp)/'output'
        shutil.move(str(OUT),moved)
        try:
            command('npx','--no-install','tsc','--noEmit')
            if task['verification']=='poe-full':
                command('node','scripts/poe-injectors-lesson.test.mjs')
        finally:
            shutil.move(str(moved),OUT)
    changed = set(git('diff','--name-only').splitlines())
    if changed != set(task['target_files']):
        raise ValueError('Unexpected changed paths or unchanged target')
    command('git','diff','--exit-code','--','.github','scripts','tests','package.json','package-lock.json')
    save('edit-ready.json',{'sha':state['sourceSHA'],'candidates':{t:sha((OUT/'candidates'/t).read_text()) for t in task['target_files']}})
    with open(os.environ['GITHUB_OUTPUT'],'a') as f:
        f.write('edit_ready=true\n')


def deliver_edit():
    # Separate fresh job: no model-generated code is executed with a write token.
    issue = event()
    state = state_for(issue)
    task = state['task']
    ready = load('edit-ready.json')
    if task['mode']!='edit' or ready['sha']!=state['sourceSHA'] or set(ready['candidates'])!=set(task['target_files']):
        raise ValueError('No verified edit')
    for target in task['target_files']:
        if sha((OUT/'candidates'/target).read_text()) != ready['candidates'][target]:
            raise ValueError('Candidate changed after verification')
    structures(task)  # independent AST recheck in the clean checkout
    main = github('GET','/git/ref/heads/main')['object']['sha']
    if main != state['sourceSHA']:
        raise ValueError('main moved; do not publish stale edit or retry model')
    tree = github('GET','/git/commits/'+main)['tree']['sha']
    entries = []
    for target in task['target_files']:
        blob = github('POST','/git/blobs',{'content':(OUT/'candidates'/target).read_text(),'encoding':'utf-8'})['sha']
        entries.append({'path':target,'mode':'100644','type':'blob','sha':blob})
    new_tree = github('POST','/git/trees',{'base_tree':tree,'tree':entries})['sha']
    commit = github('POST','/git/commits',{'message':f"Kimi Issue #{issue['number']}: verified edit",'tree':new_tree,'parents':[main]})['sha']
    branch = f"kimi/agent-run-issue-{issue['number']}-{os.environ['GITHUB_RUN_ID']}"
    github('POST','/git/refs',{'ref':'refs/heads/'+branch,'sha':commit})
    pr = github('POST','/pulls',{'title':f"Kimi: Issue #{issue['number']}",'head':branch,'base':'main','draft':True,
        'body':f"Audit trail: #{issue['number']}. Source `{main}`. SSE, usage, AST and compilation gates passed.\n\n"+(OUT/'changes.md').read_text()[:15000]})
    save('pull-request.json',{'url':pr['html_url'],'sha':commit,'branch':branch})


def publish():
    issue = event()
    account = load('accounting.json') if (OUT/'accounting.json').exists() else {'api_calls':1 if os.environ.get('PAID_STATUS') == 'success' else (0 if os.environ.get('PAID_STATUS') == 'skipped' else None), 'cost_usd':None}
    run_url = 'https://github.com/apotet/my-gemini-mirror-site/actions/runs/'+os.environ['GITHUB_RUN_ID']
    artifact = os.environ.get('ARTIFACT_URL') or run_url+'#artifacts'
    report = next(((OUT/p).read_text() for p in ['report.md','changes.md'] if (OUT/p).exists()),'Отчёт не получен. Повторный платный запуск запрещён.')
    pr = load('pull-request.json')['url'] if (OUT/'pull-request.json').exists() else 'не создан (audit-only или проверки/публикация не прошли)'
    # This is a display excerpt only; full report is always in artifacts.
    excerpt = report if len(report)<22000 else report[:22000]+'\n\nОтрывок; полный результат в артефакте.'
    body = f"## Химик — {os.environ.get('WORK_STATUS','unknown')}\n\n{excerpt}\n\nDraft PR: {pr}\n\n[Артефакты]({artifact}) · [Run]({run_url})\n\nUsage/стоимость: `{json.dumps(account,ensure_ascii=False)}`\n\ncost_usd вычисляется только при полной детализации usage/cache TTL; иначе null. usage_cost_upper_bound_usd — консервативная верхняя оценка, не фактическое списание. Повторов нет."
    github('POST',f"/issues/{issue['number']}/comments",{'body':body})
    save('summary.md',body)


if __name__=='__main__':
    phase = sys.argv[1]
    try:
        {'prepare':prepare,'claim':claim,'run':run,'verify':verify,'deliver-edit':deliver_edit,'publish':publish}[phase]()
    except Exception as exc:
        # Do not print provider content, candidate text, request headers or secrets.
        save('failure-'+phase+'.json',{'phase':phase,'error_type':type(exc).__name__})
        print('Kimi phase failed:',phase,type(exc).__name__,'no retry')
        sys.exit(1)

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
import urllib.error
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


class GitHubAPIError(RuntimeError):
    """Safe diagnostics: never retain request headers or arbitrary remote bodies."""
    def __init__(self, method, endpoint, status, message, request_id=None):
        self.method, self.endpoint, self.status = method, endpoint.split('?',1)[0], status
        known = {
            'GitHub Actions is not permitted to create or approve pull requests.': 'actions_pr_creation_disabled',
            'Resource not accessible by integration': 'integration_permission_denied',
            'Validation Failed': 'validation_failed',
            'Not Found': 'not_found',
        }
        message = message if isinstance(message,str) else None
        self.reason = known.get(message, 'github_api_error')
        self.message = message if message in known else 'GitHub API rejected request (remote details omitted)'
        self.request_id = request_id if request_id and re.fullmatch(r'[A-Za-z0-9:-]{1,128}',request_id) else None
        super().__init__(f'{self.method} {self.endpoint}: HTTP {status} ({self.reason})')

    def details(self):
        return {'method':self.method,'endpoint':self.endpoint,'http_status':self.status,
                'reason':self.reason,'message':self.message,'request_id':self.request_id}


def github(method, endpoint, data=None):
    request = urllib.request.Request('https://api.github.com/repos/apotet/my-gemini-mirror-site'+endpoint,
        method=method, data=None if data is None else json.dumps(data).encode(),
        headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'], 'Accept':'application/vnd.github+json', 'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        try:
            message = json.loads(exc.read(4096)).get('message')
        except (ValueError, AttributeError):
            message = None
        raise GitHubAPIError(method,endpoint,exc.code,message,(exc.headers or {}).get('X-GitHub-Request-Id')) from None


def event(allow_metadata_retry=False):
    e = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    issue = e['issue']
    if (e.get('action') != 'opened' or issue.get('pull_request') or
        issue['user']['login'] != 'apotet' or issue['user'].get('type') != 'User' or
        e['sender']['login'] != 'apotet' or e['sender'].get('type') != 'User' or
        os.environ.get('GITHUB_ACTOR') != 'apotet' or
        os.environ.get('GITHUB_REPOSITORY') != 'apotet/my-gemini-mirror-site' or
        os.environ.get('GITHUB_REF') != 'refs/heads/main' or
        (os.environ.get('GITHUB_RUN_ATTEMPT') != '1' and not (allow_metadata_retry and os.environ.get('GITHUB_RUN_ATTEMPT','').isdecimal() and int(os.environ['GITHUB_RUN_ATTEMPT']) >= 1)) or not issue['title'].startswith('[KIMI] ')):
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


def usage_cost(usage, headers):
    """Bound all missing cache read/write/TTL counts; never default missing reads to 0."""
    if not isinstance(usage,dict):
        return {}
    inp, output = usage.get('prompt_tokens'), usage.get('completion_tokens')
    valid = lambda n: type(n) is int and n >= 0
    if not all(valid(n) for n in [inp,output]):
        return {}
    broad = (Decimal(inp)*4+Decimal(output)*10)/1000000
    result = {'usage_cost_upper_bound_usd':float(broad), 'cost_usd':None}
    details = usage.get('prompt_tokens_details') or {}
    if not isinstance(details,dict):
        return {**result,'cost_basis':'invalid cache details; exact cost unavailable'}
    cached, written = details.get('cached_tokens'), details.get('cache_write_tokens')
    w5, w1 = headers.get('msh-usage-cache-write-tokens-5m'), headers.get('msh-usage-cache-write-tokens-1h')
    if any(n is not None and not valid(n) for n in [cached,written,w5,w1]):
        return {**result,'cost_basis':'invalid cache counters; exact cost unavailable'}
    if written is None and w5 is not None and w1 is not None:
        written = w5+w1
    if written is not None:
        if written > inp or (cached is not None and cached+written > inp):
            return {**result,'cost_basis':'inconsistent cache counters; exact cost unavailable'}
        if w5 is not None and w1 is None:
            w1 = written-w5
        if w1 is not None and w5 is None:
            w5 = written-w1
        if written == 0:
            w5 = 0 if w5 is None else w5
            w1 = 0 if w1 is None else w1
        if any(n is not None and n < 0 for n in [w5,w1]) or (w5 is not None and w1 is not None and w5+w1 != written):
            return {**result,'cost_basis':'inconsistent cache TTL counters; exact cost unavailable'}
        remainder = inp-written
        if w5 is not None and w1 is not None:
            write_min = write_max = Decimal(w5)*2+Decimal(w1)*4
        else:
            write_min, write_max = Decimal(written)*2, Decimal(written)*4
        if cached is None:
            read_min, read_max = Decimal(remainder)*Decimal('.2'), Decimal(remainder)*2
        else:
            read_min = read_max = Decimal(cached)*Decimal('.2')+Decimal(remainder-cached)*2
    elif cached is not None:
        if cached > inp:
            return {**result,'cost_basis':'inconsistent cache counters; exact cost unavailable'}
        write_min, write_max = Decimal(inp-cached)*2, Decimal(inp-cached)*4
        read_min = read_max = Decimal(cached)*Decimal('.2')
    else:
        write_min, write_max = Decimal(0), Decimal(0)
        read_min, read_max = Decimal(inp)*Decimal('.2'), Decimal(inp)*4
    minimum = (write_min+read_min+Decimal(output)*10)/1000000
    maximum = (write_max+read_max+Decimal(output)*10)/1000000
    result['cost_range_usd'] = {'min':float(minimum),'max':float(maximum),'before_tax':True}
    result['cost_basis'] = 'published rates; missing cache counters bounded, not assumed zero'
    # Even a collapsed interval is displayed as a range when cached_tokens is absent.
    if cached is not None and written is not None and w5 is not None and w1 is not None:
        result.update(cost_usd=float(minimum), cost_basis='complete usage/cache TTL breakdown; published rates, before tax',
                      cache_write_5m_tokens=w5, cache_write_1h_tokens=w1)
    return result


def cost_summary(account):
    if account.get('cost_usd') is not None:
        return f"Расчёт по полному usage: ${account['cost_usd']:.8f} до налогов."
    interval = account.get('cost_range_usd')
    if interval:
        return f"Расчётный диапазон стоимости: ${interval['min']:.8f}–${interval['max']:.8f} до налогов. Точная сумма не подтверждена."
    return 'Стоимость неизвестна: полного usage нет. Это не нулевое списание.'


def accounting():
    account = load('accounting.json')
    if not (OUT/'meta.json').exists():
        return
    usage = load('meta.json').get('usage')
    for field in ['cost_usd','cost_range_usd','usage_cost_upper_bound_usd','cache_write_5m_tokens','cache_write_1h_tokens']:
        account.pop(field,None)
    account.update(cost_usd=None,usage=usage,status='response received; protocol/verification may still fail')
    headers = load('billing-headers.json') if (OUT/'billing-headers.json').exists() else {}
    account.update(usage_cost(usage,headers))
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


def ensure_draft_pr(branch, commit, source, issue_number, changes):
    """Idempotent metadata publication: never duplicate, update or ready an existing PR."""
    from urllib.parse import urlencode
    query = urlencode({'state':'all','head':'apotet:'+branch,'base':'main','per_page':100})
    existing = github('GET','/pulls?'+query)
    if existing:
        if len(existing)!=1:
            raise ValueError('Ambiguous existing PR; do not publish')
        pr = existing[0]
        if (pr['state']!='open' or not pr['draft'] or pr.get('merged_at') or
            pr['head']['sha']!=commit or pr['head']['ref']!=branch or pr['base']['ref']!='main' or
            pr['head']['repo']['full_name']!='apotet/my-gemini-mirror-site'):
            raise ValueError('Existing PR state/head changed; do not alter it')
        return pr
    return github('POST','/pulls',{'title':f'Kimi: Issue #{issue_number}','head':branch,'base':'main','draft':True,
        'body':f'Audit trail: #{issue_number}. Source `{source}`. SSE, usage, AST and compilation gates passed.\n\n'+changes[:15000]})


def verified_branch(branch, source, targets):
    """Recover only an immutable, direct child with exactly the verified blobs/modes."""
    try:
        ref = github('GET','/git/ref/heads/'+branch)
    except GitHubAPIError as exc:
        if exc.status==404:
            return None
        raise
    commit = ref['object']['sha']
    obj = github('GET','/git/commits/'+commit)
    if [p['sha'] for p in obj['parents']] != [source]:
        raise ValueError('Existing publication branch has unexpected parent')
    comparison = github('GET',f'/compare/{source}...{commit}')
    files = comparison.get('files',[])
    if comparison.get('total_commits')!=1 or len(files)!=len(targets) or {f['filename'] for f in files}!=set(targets) or any(f['status']!='modified' for f in files):
        raise ValueError('Existing publication branch has unexpected changes')
    tree = github('GET','/git/trees/'+obj['tree']['sha']+'?recursive=1')
    if tree.get('truncated'):
        raise ValueError('Incomplete publication tree')
    entries = {entry['path']:entry for entry in tree['tree']}
    for target in targets:
        content = (OUT/'candidates'/target).read_text().encode('utf-8')
        blob = hashlib.sha1(b'blob '+str(len(content)).encode()+b'\0'+content).hexdigest()
        entry = entries.get(target,{})
        if entry.get('mode')!='100644' or entry.get('type')!='blob' or entry.get('sha')!=blob:
            raise ValueError('Existing publication branch differs from verified candidate')
    return commit


def deliver_edit():
    # Metadata-only retries may recover verified artifacts; run()/claim() still reject retries.
    issue = event(allow_metadata_retry=True)
    state = state_for(issue)
    task = state['task']
    ready = load('edit-ready.json')
    if task['mode']!='edit' or ready['sha']!=state['sourceSHA'] or set(ready['candidates'])!=set(task['target_files']):
        raise ValueError('No verified edit')
    for target in task['target_files']:
        if sha((OUT/'candidates'/target).read_text()) != ready['candidates'][target]:
            raise ValueError('Candidate changed after verification')
    structures(task)  # independent AST recheck in the clean checkout
    branch = f"kimi/agent-run-issue-{issue['number']}-{os.environ['GITHUB_RUN_ID']}"
    main = state['sourceSHA']
    commit = verified_branch(branch,main,task['target_files'])
    if commit is None:
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
        github('POST','/git/refs',{'ref':'refs/heads/'+branch,'sha':commit})
    save('publication.json',{'issue':issue['number'],'sourceSHA':main,'candidateSHA':commit,'branch':branch})
    pr = ensure_draft_pr(branch,commit,main,issue['number'],(OUT/'changes.md').read_text())
    save('pull-request.json',{'url':pr['html_url'],'sha':commit,'branch':branch})


def publish():
    issue = event(allow_metadata_retry=True)
    account = load('accounting.json') if (OUT/'accounting.json').exists() else {'api_calls':1 if os.environ.get('PAID_STATUS') == 'success' else (0 if os.environ.get('PAID_STATUS') == 'skipped' else None), 'cost_usd':None}
    run_url = 'https://github.com/apotet/my-gemini-mirror-site/actions/runs/'+os.environ['GITHUB_RUN_ID']
    artifact = os.environ.get('ARTIFACT_URL') or run_url+'#artifacts'
    report = next(((OUT/p).read_text() for p in ['report.md','changes.md'] if (OUT/p).exists()),'Отчёт не получен. Повторный платный запуск запрещён.')
    pr = load('pull-request.json')['url'] if (OUT/'pull-request.json').exists() else 'не создан (audit-only или проверки/публикация не прошли)'
    # This is a display excerpt only; full report is always in artifacts.
    excerpt = report if len(report)<22000 else report[:22000]+'\n\nОтрывок; полный результат в артефакте.'
    diagnostics = []
    for path in sorted(OUT.glob('failure-*.json')):
        failure = json.loads(path.read_text())
        if failure.get('github'):
            error = failure['github']
            diagnostics.append(f"{error['method']} {error['endpoint']}: HTTP {error['http_status']} — {error['message']}")
    failure_note = '\n'.join(diagnostics)
    if any('GitHub Actions is not permitted' in d for d in diagnostics):
        failure_note += '\nНужно разрешение Settings → Actions → General → Allow GitHub Actions to create and approve pull requests. Модель повторно не вызывать.'
    body = f"## Химик — {os.environ.get('WORK_STATUS','unknown')}\n\n{excerpt}\n\nDraft PR: {pr}\n\n{failure_note}\n\n{cost_summary(account)}\n\n[Артефакты]({artifact}) · [Run]({run_url})\n\nUsage/стоимость: `{json.dumps(account,ensure_ascii=False)}`\n\ncost_usd вычисляется только при полной детализации usage/cache TTL; иначе null. cost_range_usd — расчётный диапазон; usage_cost_upper_bound_usd — общая консервативная граница. Это не подтверждение списания. Повторов нет."
    github('POST',f"/issues/{issue['number']}/comments",{'body':body})
    save('summary.md',body)


if __name__=='__main__':
    phase = sys.argv[1]
    try:
        {'prepare':prepare,'claim':claim,'run':run,'verify':verify,'deliver-edit':deliver_edit,'publish':publish}[phase]()
    except Exception as exc:
        # Do not print provider content, candidate text, request headers or secrets.
        save('failure-'+phase+'.json',{'phase':phase,'error_type':type(exc).__name__,
            **({'github':exc.details()} if isinstance(exc,GitHubAPIError) else {})})
        print('Kimi phase failed:',phase,type(exc).__name__,'no retry')
        if isinstance(exc,GitHubAPIError):
            print(json.dumps(exc.details(),ensure_ascii=False))
        sys.exit(1)

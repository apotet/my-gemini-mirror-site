#!/usr/bin/env python3
"""Bounded Gemini Issue agent. One paid call after durable claim. Standard library only.
Edit mode is disabled until integration with the unified runtime (#365)."""
import json
import os
import random
import time
from email.utils import parsedate_to_datetime
from pathlib import Path
import subprocess
import sys
import urllib.error
import urllib.request

OUT = Path('gemini-issue-output')
MARKER = '<!-- gemini-issue-agent:claimed:v1 -->'
MODEL = 'gemini-4-hydrogen'  # default / alternative
ALLOWED_MODELS = {'gemini-4-hydrogen', 'gemini-3.8-flash'}
FLASH = 'gemini-3.8-flash'
MAX_ATTEMPTS = 4
BACKOFF_BASE = 2.0
BACKOFF_CAP = 60.0
ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions'

def git(*args):
    return subprocess.check_output(['git', *args], text=True).strip()

def gh(*args):
    return subprocess.check_output(['gh', *args], text=True)

def save(name, data):
    OUT.mkdir(exist_ok=True)
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) if not isinstance(data, str) else data)

def api_pages(path):
    """Fetch all pages of a GitHub list endpoint."""
    items = []
    page = 1
    while True:
        chunk = json.loads(gh('api', f'{path}?per_page=100&page={page}'))
        if not isinstance(chunk, list):
            return chunk
        items.extend(chunk)
        if len(chunk) < 100:
            break
        page += 1
    return items

def tracked_files():
    out = git('ls-files')
    return set(out.splitlines()) if out else set()

def is_safe_file(path_str, tracked):
    p = Path(path_str)
    if p.is_absolute() or '..' in p.parts:
        return False
    if path_str not in tracked:
        return False
    try:
        resolved = p.resolve()
        checkout = Path('.').resolve()
        resolved.relative_to(checkout)
    except (ValueError, OSError):
        return False
    if p.is_symlink() or resolved.is_symlink():
        return False
    parts_lower = [x.lower() for x in p.parts]
    if any(x.startswith('.') or x in ('node_modules', '__pycache__', '.git') for x in parts_lower):
        return False
    name = p.name.lower()
    if name.endswith(('.pem', '.key', '.env')):
        return False
    return p.is_file()

def prepare():
    repo = os.environ['GITHUB_REPOSITORY']
    assert repo == 'apotet/my-gemini-mirror-site', 'Wrong repository'
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    assert event['issue']['user']['login'] == 'apotet'
    assert event['sender']['login'] == 'apotet'
    assert event['sender']['type'] == 'User'
    assert os.environ.get('GITHUB_RUN_ATTEMPT') == '1', 'Rerun forbidden'
    title = event['issue']['title']
    assert title.startswith('[GEMINI] '), 'Title must start with [GEMINI] '
    assert not event['issue'].get('pull_request'), 'PRs do not trigger'
    body = event['issue'].get('body') or ''
    try:
        task = json.loads(body)
    except json.JSONDecodeError as e:
        raise ValueError(f'Issue body must be JSON object: {e}')
    if not isinstance(task, dict):
        raise ValueError('Issue body must be a JSON object')
    allowed = {'task', 'model', 'mode', 'files'}
    extra = set(task) - allowed
    if extra:
        raise ValueError(f'Unknown keys: {extra}')
    if 'task' not in task or not isinstance(task['task'], str) or not (1 <= len(task['task']) <= 12000):
        raise ValueError('task must be a string 1..12000 chars')
    model = task.get('model', MODEL)
    if model not in ALLOWED_MODELS:
        raise ValueError(f'Model must be one of {sorted(ALLOWED_MODELS)}')
    mode = task.get('mode', 'audit-only')
    if mode == 'edit':
        raise ValueError('edit mode is disabled until integration with unified runtime (#365); use audit-only')
    if mode != 'audit-only':
        raise ValueError('mode must be audit-only')
    files = task.get('files', [])
    if not isinstance(files, list) or len(files) > 8:
        raise ValueError('files must be a list of at most 8 paths')
    tracked = tracked_files()
    for f in files:
        if not isinstance(f, str) or not is_safe_file(f, tracked):
            raise ValueError(f'Unsafe or untracked file: {f}')
    # Mandatory standards must exist before claim
    for std in ('docs/LEARNING_CONTENT_STANDARD.md', 'docs/DEVELOPMENT_WORKFLOW.md'):
        if not Path(std).is_file():
            raise ValueError(f'Mandatory standard missing: {std}')
    # Claim across all comment pages
    issue = event['issue']['number']
    base = f'repos/{repo}/issues/{issue}'
    comments = api_pages(base + '/comments')
    if any(MARKER in (c.get('body') or '') for c in comments):
        raise ValueError('Issue already claimed; no repeat request')
    sha = git('rev-parse', 'HEAD')
    snapshot = {'sha': sha, 'model': model, 'mode': mode, 'files': files, 'task_len': len(task['task'])}
    save('task.json', task)
    save('snapshot.json', snapshot)
    gh('api', base + '/comments', '-f', f'body={MARKER}\nГеннадий принял задание. Явные 503/429 — до 4 попыток с backoff; после двух 503 на Hydrogen переход на Flash. SHA {sha}.')
    print('claimed', issue, sha)

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise urllib.error.HTTPError(req.full_url, code, f'Redirect forbidden: {msg}', headers, fp)

def retry_after_seconds(exc):
    """Parse Retry-After (delta-seconds or HTTP-date). None if absent."""
    headers = getattr(exc, 'headers', None)
    if not headers:
        return None
    raw = headers.get('Retry-After')
    if not raw:
        return None
    raw = raw.strip()
    try:
        return max(0.0, float(raw))
    except ValueError:
        pass
    try:
        dt = parsedate_to_datetime(raw)
        return max(0.0, dt.timestamp() - time.time())
    except Exception:
        return None

def backoff_seconds(attempt, retry_after):
    """Exponential backoff with jitter, honoring Retry-After, capped."""
    exp = min(BACKOFF_CAP, BACKOFF_BASE * (2 ** max(0, attempt - 1)))
    jitter = random.uniform(0, 1)
    delay = exp + jitter
    if retry_after is not None:
        delay = max(delay, retry_after)
    return min(BACKOFF_CAP, delay)

def parse_interaction(data):
    istatus = (data.get('status') or '').lower()
    texts = []
    for step in data.get('steps') or []:
        if not isinstance(step, dict) or step.get('type') != 'model_output':
            continue
        for part in step.get('content') or []:
            if isinstance(part, dict) and part.get('type') == 'text' and part.get('text'):
                texts.append(part['text'])
    return istatus, ''.join(texts).strip()

def run():
    key = os.environ.get('GEMINI_API_KEY', '')
    if not key:
        raise RuntimeError('GEMINI_API_KEY not set')
    task = json.loads((OUT / 'task.json').read_text())
    snapshot = json.loads((OUT / 'snapshot.json').read_text())
    standards = []
    for std in ('docs/LEARNING_CONTENT_STANDARD.md', 'docs/DEVELOPMENT_WORKFLOW.md'):
        if Path(std).is_file():
            standards.append(f'\n\n--- STANDARD: {std} ---\n' + Path(std).read_text(encoding='utf-8', errors='replace'))
    state_note = ''
    if Path('docs/STATE.md').is_file():
        state_note = '\n\n--- STATE (operational snapshot; verify against main) ---\n' + Path('docs/STATE.md').read_text(encoding='utf-8', errors='replace')
    parts = [{'text': task['task'] + ''.join(standards) + state_note}]
    for f in snapshot.get('files', []):
        content = Path(f).read_text(encoding='utf-8', errors='replace')
        parts.append({'text': f'\n\n--- FILE: {f} ---\n{content}'})
    user_text = ''.join(part['text'] for part in parts)
    model = snapshot['model']
    hydrogen_503 = 0
    attempts = []
    accounting = {'api_calls': 0, 'model': model, 'status': 'calling', 'attempts': attempts}
    opener = urllib.request.build_opener(NoRedirect)
    last_exc = None
    for n in range(1, MAX_ATTEMPTS + 1):
        if model == 'gemini-4-hydrogen' and hydrogen_503 >= 2:
            model = FLASH
        payload = {'model': model, 'input': user_text, 'store': False}
        req = urllib.request.Request(
            ENDPOINT,
            data=json.dumps(payload).encode(),
            headers={'Content-Type': 'application/json', 'x-goog-api-key': key},
            method='POST',
        )
        accounting['api_calls'] = n
        accounting['model'] = model
        record = {'n': n, 'model': model}
        try:
            with opener.open(req, timeout=180) as resp:
                data = json.loads(resp.read().decode())
            record['http'] = 200
            attempts.append(record)
            accounting['status'] = 'response received'
            accounting['raw_keys'] = list(data.keys())
            if 'usage' in data:
                accounting['usage'] = data['usage']
            istatus, text_out = parse_interaction(data)
            accounting['interactionStatus'] = istatus or None
            save('report.md', text_out or '(empty)')
            if istatus == 'completed' and text_out:
                accounting['status'] = 'complete'
                save('accounting.json', accounting)
                return
            # Incomplete / empty is an uncertain generation result: do not retry.
            accounting['status'] = 'incomplete'
            raise RuntimeError(f'Incomplete response: status={istatus!r} text_len={len(text_out)}')
        except urllib.error.HTTPError as exc:
            last_exc = exc
            code = exc.code
            record['http'] = code
            body = ''
            if hasattr(exc, 'read'):
                try:
                    body = exc.read(4000).decode(errors='replace').replace(key, '[REDACTED]')
                except Exception:
                    body = ''
            record['error'] = str(exc).replace(key, '[REDACTED]')[:200]
            attempts.append(record)
            accounting['httpStatus'] = code
            accounting['httpErrorBody'] = body[:2000]
            accounting['errorType'] = type(exc).__name__
            accounting['error'] = record['error']
            retryable = code in (503, 429)
            if code == 503 and model == 'gemini-4-hydrogen':
                hydrogen_503 += 1
            if not retryable or n == MAX_ATTEMPTS:
                accounting['status'] = 'error'
                save('accounting.json', accounting)
                raise
            delay = backoff_seconds(n, retry_after_seconds(exc))
            record['sleep'] = round(delay, 2)
            time.sleep(delay)
        except Exception as exc:
            # Timeout, connection error, incomplete body: uncertain. Do not retry.
            last_exc = exc
            record['error'] = str(exc).replace(key, '[REDACTED]')[:200]
            attempts.append(record)
            accounting['errorType'] = type(exc).__name__
            accounting['error'] = record['error']
            accounting['status'] = 'incomplete' if isinstance(exc, RuntimeError) else 'error'
            save('accounting.json', accounting)
            raise
    accounting['status'] = 'error'
    save('accounting.json', accounting)
    if last_exc:
        raise last_exc
    raise RuntimeError('Gemini request failed')

def publish():
    repo = os.environ['GITHUB_REPOSITORY']
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    issue = event['issue']['number']
    base = f'repos/{repo}/issues/{issue}'
    url = f'https://github.com/{repo}/actions/runs/{os.environ["GITHUB_RUN_ID"]}'
    acc = json.loads((OUT / 'accounting.json').read_text()) if (OUT / 'accounting.json').exists() else {'status': 'NOT_CALLED'}
    report = (OUT / 'report.md').read_text() if (OUT / 'report.md').exists() else '(no report)'
    text = f'## Gemini Issue agent: {acc.get("status")}\n\n{url}\n\n```json\n{json.dumps(acc, ensure_ascii=False, indent=2)}\n```\n\n'
    gh('api', base + '/comments', '-f', 'body=' + text)
    for i in range(0, len(report), 24000):
        gh('api', base + '/comments', '-f', 'body=' + report[i:i + 24000])
    print('published', issue)

if __name__ == '__main__':
    {'prepare': prepare, 'run': run, 'publish': publish}[sys.argv[1]]()

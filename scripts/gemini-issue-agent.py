#!/usr/bin/env python3
"""Bounded Gemini Issue agent. One paid call after durable claim. Standard library only.
Edit mode is disabled until integration with the unified runtime (#365)."""
import json
import os
from pathlib import Path
import subprocess
import sys
import urllib.request

OUT = Path('gemini-issue-output')
MARKER = '<!-- gemini-issue-agent:claimed:v1 -->'
MODEL = 'gemini-2.5-pro'
ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
# Technical bound from Gemini API docs for generateContent maxOutputTokens on 2.5 Pro.
# Truncation (finishReason=MAX_TOKENS) is treated as incomplete, not success.
MAX_OUTPUT_TOKENS = 65536

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
    if p.is_symlink():
        return False
    # exclude service / secret-like
    name = p.name.lower()
    if name.startswith('.') or name.endswith(('.pem', '.key', '.env')):
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
    if model != MODEL:
        raise ValueError(f'Only {MODEL} is allowed')
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
    gh('api', base + '/comments', '-f', f'body={MARKER}\nГеннадий принял задание. Один запрос, без повторов. SHA {sha}.')
    print('claimed', issue, sha)

def run():
    key = os.environ.get('GEMINI_API_KEY', '')
    if not key:
        raise RuntimeError('GEMINI_API_KEY not set')
    task = json.loads((OUT / 'task.json').read_text())
    snapshot = json.loads((OUT / 'snapshot.json').read_text())
    # Mandatory standards passed explicitly
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
    payload = {
        'contents': [{'role': 'user', 'parts': parts}],
        'generationConfig': {'temperature': 0.2, 'maxOutputTokens': MAX_OUTPUT_TOKENS},
    }
    url = ENDPOINT.format(model=snapshot['model'])
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json', 'x-goog-api-key': key},
        method='POST',
    )
    # Forbid redirects
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            raise urllib.error.HTTPError(req.full_url, code, f'Redirect forbidden: {msg}', headers, fp)
    opener = urllib.request.build_opener(NoRedirect)
    accounting = {'api_calls': 1, 'model': snapshot['model'], 'status': 'calling'}
    try:
        with opener.open(req, timeout=180) as resp:
            data = json.loads(resp.read().decode())
        accounting['status'] = 'response received'
        candidates = data.get('candidates') or []
        if not candidates:
            accounting['status'] = 'incomplete'
            raise RuntimeError('No candidates')
        finish = candidates[0].get('finishReason')
        accounting['finishReason'] = finish
        text = ''.join(p.get('text', '') for p in candidates[0].get('content', {}).get('parts', []) if not p.get('thought'))
        if finish == 'MAX_TOKENS' or not text.strip():
            accounting['status'] = 'incomplete'
            save('report.md', text or '(empty)')
            raise RuntimeError(f'Incomplete response: finishReason={finish}')
        save('report.md', text)
        if 'usageMetadata' in data:
            accounting['usage'] = data['usageMetadata']
        accounting['status'] = 'complete'
    except Exception as exc:
        accounting['errorType'] = type(exc).__name__
        accounting['error'] = str(exc).replace(key, '[REDACTED]')[:800]
        if hasattr(exc, 'code'):
            accounting['httpStatus'] = exc.code
        if accounting.get('status') == 'calling':
            accounting['status'] = 'error'
        raise
    finally:
        save('accounting.json', accounting)

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

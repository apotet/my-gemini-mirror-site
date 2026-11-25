#!/usr/bin/env python3
"""Bounded Gemini Issue agent. One paid call after durable claim. Standard library only."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import urllib.request

OUT = Path('gemini-issue-output')
OUT.mkdir(exist_ok=True)
MARKER = '<!-- gemini-issue-agent:claimed:v1 -->'
MODEL = 'gemini-2.5-pro'
ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'

def git(*args):
    return subprocess.check_output(['git', *args], text=True).strip()

def gh(*args):
    return subprocess.check_output(['gh', *args], text=True)

def save(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) if not isinstance(data, str) else data)

def api(path):
    return json.loads(gh('api', path))

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
        raise ValueError(f'Issue body must be JSON: {e}')
    allowed = {'task', 'model', 'mode', 'files'}
    assert set(task) <= allowed, f'Unknown keys: {set(task) - allowed}'
    assert 'task' in task and isinstance(task['task'], str) and 1 <= len(task['task']) <= 12000
    model = task.get('model', MODEL)
    assert model == MODEL, f'Only {MODEL} is allowed in this agent'
    mode = task.get('mode', 'audit-only')
    assert mode in ('audit-only', 'edit'), 'mode must be audit-only or edit'
    files = task.get('files', [])
    assert isinstance(files, list) and len(files) <= 8
    for f in files:
        assert isinstance(f, str) and not f.startswith('/') and '..' not in f
        assert Path(f).is_file(), f'Missing file: {f}'
    # Claim before any paid call
    issue = event['issue']['number']
    base = f'repos/{repo}/issues/{issue}'
    comments = api(base + '/comments')
    if any(MARKER in (c.get('body') or '') for c in comments):
        raise ValueError('Issue already claimed; no repeat request')
    sha = git('rev-parse', 'HEAD')
    snapshot = {
        'sha': sha,
        'model': model,
        'mode': mode,
        'files': files,
        'task_len': len(task['task']),
    }
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
    parts = [{'text': task['task']}]
    for f in snapshot.get('files', []):
        content = Path(f).read_text(encoding='utf-8', errors='replace')
        parts.append({'text': f'\n\n--- FILE: {f} ---\n{content}'})
    payload = {
        'contents': [{'role': 'user', 'parts': parts}],
        'generationConfig': {'temperature': 0.2, 'maxOutputTokens': 8192},
    }
    url = ENDPOINT.format(model=snapshot['model']) + f'?key={key}'
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
    accounting = {'api_calls': 1, 'model': snapshot['model'], 'status': 'calling'}
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            data = json.loads(resp.read().decode())
        accounting['status'] = 'response received'
        accounting['raw_keys'] = list(data.keys())
        candidates = data.get('candidates') or []
        assert candidates, 'No candidates'
        text = ''.join(p.get('text', '') for p in candidates[0].get('content', {}).get('parts', []) if not p.get('thought'))
        assert text.strip(), 'Empty response'
        save('report.md', text)
        accounting['finishReason'] = candidates[0].get('finishReason')
        if 'usageMetadata' in data:
            accounting['usage'] = data['usageMetadata']
    except Exception as exc:
        accounting['errorType'] = type(exc).__name__
        accounting['error'] = str(exc).replace(key, '[REDACTED]')[:800]
        if hasattr(exc, 'code'):
            accounting['httpStatus'] = exc.code
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

#!/usr/bin/env python3
"""List Gemini models available to the existing key. No generation. Key never printed."""
import json
import os
import urllib.request
from pathlib import Path

key = os.environ.get('GEMINI_API_KEY', '')
if not key:
    raise SystemExit('GEMINI_API_KEY not set')

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise urllib.error.HTTPError(req.full_url, code, f'Redirect forbidden: {msg}', headers, fp)

opener = urllib.request.build_opener(NoRedirect)
models = []
page_token = None
pages = 0
while True:
    url = 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=50'
    if page_token:
        url += '&pageToken=' + page_token
    req = urllib.request.Request(url, headers={'x-goog-api-key': key})
    with opener.open(req, timeout=60) as resp:
        data = json.loads(resp.read().decode())
    pages += 1
    for m in data.get('models', []):
        methods = m.get('supportedGenerationMethods', [])
        models.append({
            'name': m.get('name', ''),
            'displayName': m.get('displayName'),
            'supportedGenerationMethods': methods,
            'generateContent': 'generateContent' in methods,
        })
    page_token = data.get('nextPageToken')
    if not page_token or pages > 20:
        break

out = Path('gemini-models.json')
out.write_text(json.dumps({'count': len(models), 'pages': pages, 'models': models}, indent=2))
print(f'listed {len(models)} models in {pages} page(s)')
for m in models:
    if m['generateContent']:
        print(' ', m['name'])

#!/usr/bin/env python3
"""List Gemini models available to the existing key. No generation. Key never printed."""
import json
import os
import urllib.request
from pathlib import Path

key = os.environ.get('GEMINI_API_KEY', '')
if not key:
    raise SystemExit('GEMINI_API_KEY not set')

url = 'https://generativelanguage.googleapis.com/v1beta/models'
req = urllib.request.Request(url, headers={'x-goog-api-key': key})
with urllib.request.urlopen(req, timeout=60) as resp:
    data = json.loads(resp.read().decode())

models = []
for m in data.get('models', []):
    name = m.get('name', '')
    methods = m.get('supportedGenerationMethods', [])
    models.append({
        'name': name,
        'displayName': m.get('displayName'),
        'supportedGenerationMethods': methods,
        'generateContent': 'generateContent' in methods,
    })

out = Path('gemini-models.json')
out.write_text(json.dumps({'count': len(models), 'models': models}, indent=2))
print(f'listed {len(models)} models')
for m in models:
    if m['generateContent']:
        print(' ', m['name'])

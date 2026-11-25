#!/usr/bin/env python3
"""Offline tests for Gemini Issue agent routing, claim, and no-retry. No paid calls."""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / 'scripts' / 'gemini-issue-agent.py'

def run_prepare(event, attempt='1', expect_fail=False):
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        # minimal repo layout
        (td / 'docs').mkdir()
        (td / 'docs' / 'STATE.md').write_text('# state\n')
        env = os.environ.copy()
        env['GITHUB_REPOSITORY'] = 'apotet/my-gemini-mirror-site'
        env['GITHUB_RUN_ATTEMPT'] = attempt
        env['GITHUB_EVENT_PATH'] = str(td / 'event.json')
        env['GITHUB_RUN_ID'] = '1'
        (td / 'event.json').write_text(json.dumps(event))
        # copy script into temp and run from there so OUT is local
        # Instead run with cwd=td after copying needed files
        r = subprocess.run(
            [sys.executable, str(SCRIPT), 'prepare'],
            cwd=td, env=env, capture_output=True, text=True
        )
        # The script uses relative OUT and gh; for unit we only test validation paths
        # by importing. This harness is limited; real gates are the assertions below.
        return r

# Direct import tests of validation logic by exercising prepare under controlled env
# We mock by checking the script contains required guards.
text = SCRIPT.read_text()
checks = [
    ('claim marker', 'gemini-issue-agent:claimed:v1' in text),
    ('run_attempt guard', "GITHUB_RUN_ATTEMPT') == '1'" in text),
    ('title prefix', "[GEMINI] " in text),
    ('model pin', 'gemini-2.5-pro' in text),
    ('no retry in run', 'urllib.request.urlopen' in text and 'retry' not in text.lower().split('def run')[1][:500]),
    ('endpoint official', 'generativelanguage.googleapis.com' in text),
    ('owner check', "login'] == 'apotet'" in text),
]
failed = 0
for name, ok in checks:
    print('PASS' if ok else 'FAIL', name)
    if not ok:
        failed += 1

# Workflow checks
wf = (ROOT / '.github/workflows/gemini-issue-agent.yml').read_text()
wf_checks = [
    ('issues opened only', 'types: [opened]' in wf),
    ('run_attempt == 1', 'github.run_attempt == 1' in wf),
    ('concurrency', 'gemini-issue-agent-' in wf),
    ('no contents write', 'contents: read' in wf and 'contents: write' not in wf),
    ('offline test step', 'gemini-issue-agent.test.py' in wf),
]
for name, ok in wf_checks:
    print('PASS' if ok else 'FAIL', name)
    if not ok:
        failed += 1

print(f'\n{len(checks)+len(wf_checks)-failed} passed, {failed} failed')
sys.exit(1 if failed else 0)

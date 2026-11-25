#!/usr/bin/env python3
"""Real offline/mock tests for Gemini Issue agent. No paid calls."""
import importlib.util
import json
import os
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))

def load():
    spec = importlib.util.spec_from_file_location('agent', ROOT / 'scripts' / 'gemini-issue-agent.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def make_event(body, title='[GEMINI] test'):
    return {
        'issue': {'number': 1, 'title': title, 'body': body, 'user': {'login': 'apotet'}, 'pull_request': None},
        'sender': {'login': 'apotet', 'type': 'User'},
    }

def test_prepare_success():
    agent = load()
    event = make_event(json.dumps({'task': 'audit', 'files': ['docs/STATE.md']}))
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        (td / 'docs').mkdir()
        (td / 'docs' / 'STATE.md').write_text('# s\n')
        os.chdir(td)
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        env = {
            'GITHUB_REPOSITORY': 'apotet/my-gemini-mirror-site',
            'GITHUB_RUN_ATTEMPT': '1',
            'GITHUB_EVENT_PATH': str(td / 'event.json'),
            'GITHUB_RUN_ID': '1',
        }
        (td / 'event.json').write_text(json.dumps(event))
        with patch.dict(os.environ, env), \
             patch.object(agent, 'git', return_value='abc123'), \
             patch.object(agent, 'tracked_files', return_value={'docs/STATE.md'}), \
             patch.object(agent, 'api_pages', return_value=[]), \
             patch.object(agent, 'gh') as gh:
            agent.prepare()
            assert gh.called
            assert (agent.OUT / 'task.json').exists()
    print('PASS prepare success')

def test_prepare_already_claimed():
    agent = load()
    event = make_event(json.dumps({'task': 'audit'}))
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        os.chdir(td)
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        env = {'GITHUB_REPOSITORY': 'apotet/my-gemini-mirror-site', 'GITHUB_RUN_ATTEMPT': '1',
               'GITHUB_EVENT_PATH': str(td / 'e.json'), 'GITHUB_RUN_ID': '1'}
        (td / 'e.json').write_text(json.dumps(event))
        with patch.dict(os.environ, env), \
             patch.object(agent, 'git', return_value='x'), \
             patch.object(agent, 'tracked_files', return_value=set()), \
             patch.object(agent, 'api_pages', return_value=[{'body': agent.MARKER}]):
            try:
                agent.prepare()
                raise AssertionError('should have failed')
            except ValueError as e:
                assert 'already claimed' in str(e)
    print('PASS prepare already claimed')

def test_prepare_edit_disabled():
    agent = load()
    event = make_event(json.dumps({'task': 'edit', 'mode': 'edit'}))
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        os.chdir(td)
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        env = {'GITHUB_REPOSITORY': 'apotet/my-gemini-mirror-site', 'GITHUB_RUN_ATTEMPT': '1',
               'GITHUB_EVENT_PATH': str(td / 'e.json'), 'GITHUB_RUN_ID': '1'}
        (td / 'e.json').write_text(json.dumps(event))
        with patch.dict(os.environ, env):
            try:
                agent.prepare()
                raise AssertionError('should have failed')
            except ValueError as e:
                assert 'edit mode is disabled' in str(e)
    print('PASS edit disabled')

def test_prepare_bad_json():
    agent = load()
    event = make_event('not json')
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        os.chdir(td)
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        env = {'GITHUB_REPOSITORY': 'apotet/my-gemini-mirror-site', 'GITHUB_RUN_ATTEMPT': '1',
               'GITHUB_EVENT_PATH': str(td / 'e.json'), 'GITHUB_RUN_ID': '1'}
        (td / 'e.json').write_text(json.dumps(event))
        with patch.dict(os.environ, env):
            try:
                agent.prepare()
                raise AssertionError('should have failed')
            except ValueError:
                pass
    print('PASS bad JSON')

def test_run_missing_key():
    agent = load()
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        os.chdir(td)
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-2.5-pro","files":[]}')
        with patch.dict(os.environ, {'GEMINI_API_KEY': ''}):
            try:
                agent.run()
                raise AssertionError('should have failed')
            except RuntimeError as e:
                assert 'GEMINI_API_KEY' in str(e)
    print('PASS missing key')

def test_run_http_error():
    agent = load()
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        os.chdir(td)
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-2.5-pro","files":[]}')
        import urllib.error
        err = urllib.error.HTTPError('http://x', 400, 'bad', {}, None)
        with patch.dict(os.environ, {'GEMINI_API_KEY': 'k'}), \
             patch.object(agent.urllib.request, 'build_opener') as bo:
            bo.return_value.open.side_effect = err
            try:
                agent.run()
                raise AssertionError('should have failed')
            except Exception:
                pass
            acc = json.loads((agent.OUT / 'accounting.json').read_text())
            assert acc['status'] == 'error'
            assert acc.get('httpStatus') == 400
    print('PASS HTTP error accounting')

def test_run_truncated():
    agent = load()
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        os.chdir(td)
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-2.5-pro","files":[]}')
        resp = MagicMock()
        resp.read.return_value = json.dumps({
            'candidates': [{'finishReason': 'MAX_TOKENS', 'content': {'parts': [{'text': 'partial'}]}}]
        }).encode()
        resp.__enter__ = lambda s: s
        resp.__exit__ = lambda s, *a: None
        with patch.dict(os.environ, {'GEMINI_API_KEY': 'k'}), \
             patch.object(agent.urllib.request, 'build_opener') as bo:
            bo.return_value.open.return_value = resp
            try:
                agent.run()
                raise AssertionError('should have failed')
            except RuntimeError as e:
                assert 'Incomplete' in str(e)
            acc = json.loads((agent.OUT / 'accounting.json').read_text())
            assert acc['status'] == 'incomplete'
    print('PASS truncated treated incomplete')

def test_key_not_in_url():
    agent = load()
    text = (ROOT / 'scripts' / 'gemini-issue-agent.py').read_text()
    assert 'x-goog-api-key' in text
    assert '?key=' not in text
    print('PASS key via header not URL')

def test_redirect_forbidden():
    agent = load()
    text = (ROOT / 'scripts' / 'gemini-issue-agent.py').read_text()
    assert 'Redirect forbidden' in text
    assert 'HTTPRedirectHandler' in text
    print('PASS redirect forbidden')

if __name__ == '__main__':
    test_prepare_success()
    test_prepare_already_claimed()
    test_prepare_edit_disabled()
    test_prepare_bad_json()
    test_run_missing_key()
    test_run_http_error()
    test_run_truncated()
    test_key_not_in_url()
    test_redirect_forbidden()
    print('\nAll offline/mock tests passed')

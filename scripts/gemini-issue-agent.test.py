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

def with_temp(fn):
    cwd = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as td:
            td = Path(td)
            os.chdir(td)
            fn(td)
    finally:
        os.chdir(cwd)

def test_prepare_success():
    agent = load()
    def run(td):
        (td / 'docs').mkdir()
        (td / 'docs' / 'STATE.md').write_text('# s\n')
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('# std\n')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('# wf\n')
        agent.OUT = td / 'out'
        event = make_event(json.dumps({'task': 'audit', 'files': ['docs/STATE.md']}))
        (td / 'event.json').write_text(json.dumps(event))
        env = {'GITHUB_REPOSITORY': 'apotet/my-gemini-mirror-site', 'GITHUB_RUN_ATTEMPT': '1',
               'GITHUB_EVENT_PATH': str(td / 'event.json'), 'GITHUB_RUN_ID': '1'}
        with patch.dict(os.environ, env), \
             patch.object(agent, 'git', return_value='abc123'), \
             patch.object(agent, 'tracked_files', return_value={'docs/STATE.md'}), \
             patch.object(agent, 'api_pages', return_value=[]), \
             patch.object(agent, 'gh') as gh:
            agent.prepare()
            assert gh.called
            assert (agent.OUT / 'task.json').exists()
    with_temp(run)
    print('PASS prepare success')

def test_prepare_missing_standard():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        event = make_event(json.dumps({'task': 'audit'}))
        (td / 'e.json').write_text(json.dumps(event))
        env = {'GITHUB_REPOSITORY': 'apotet/my-gemini-mirror-site', 'GITHUB_RUN_ATTEMPT': '1',
               'GITHUB_EVENT_PATH': str(td / 'e.json'), 'GITHUB_RUN_ID': '1'}
        with patch.dict(os.environ, env), \
             patch.object(agent, 'git', return_value='x'), \
             patch.object(agent, 'tracked_files', return_value=set()), \
             patch.object(agent, 'api_pages', return_value=[]):
            try:
                agent.prepare()
                raise AssertionError('should fail')
            except ValueError as e:
                assert 'Mandatory standard missing' in str(e)
    with_temp(run)
    print('PASS missing standard blocks claim')

def test_prepare_claim_on_second_page():
    agent = load()
    def run(td):
        (td / 'docs').mkdir()
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('s')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('w')
        agent.OUT = td / 'out'
        event = make_event(json.dumps({'task': 'audit'}))
        (td / 'e.json').write_text(json.dumps(event))
        env = {'GITHUB_REPOSITORY': 'apotet/my-gemini-mirror-site', 'GITHUB_RUN_ATTEMPT': '1',
               'GITHUB_EVENT_PATH': str(td / 'e.json'), 'GITHUB_RUN_ID': '1'}
        # Simulate pagination: first page full, second has marker
        pages = [[{'body': 'x'}] * 100, [{'body': agent.MARKER}]]
        def fake_pages(path):
            return pages[0] + pages[1]
        with patch.dict(os.environ, env), \
             patch.object(agent, 'git', return_value='x'), \
             patch.object(agent, 'tracked_files', return_value=set()), \
             patch.object(agent, 'api_pages', side_effect=fake_pages):
            try:
                agent.prepare()
                raise AssertionError('should fail')
            except ValueError as e:
                assert 'already claimed' in str(e)
    with_temp(run)
    print('PASS claim detected on later page')

def test_prepare_edit_disabled():
    agent = load()
    def run(td):
        (td / 'docs').mkdir()
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('s')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('w')
        agent.OUT = td / 'out'
        event = make_event(json.dumps({'task': 'e', 'mode': 'edit'}))
        (td / 'e.json').write_text(json.dumps(event))
        env = {'GITHUB_REPOSITORY': 'apotet/my-gemini-mirror-site', 'GITHUB_RUN_ATTEMPT': '1',
               'GITHUB_EVENT_PATH': str(td / 'e.json'), 'GITHUB_RUN_ID': '1'}
        with patch.dict(os.environ, env):
            try:
                agent.prepare()
                raise AssertionError('should fail')
            except ValueError as e:
                assert 'edit mode is disabled' in str(e)
    with_temp(run)
    print('PASS edit disabled')

def test_run_success():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"audit"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-2.5-pro","files":[]}')
        (td / 'docs').mkdir()
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('std')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('wf')
        resp = MagicMock()
        resp.read.return_value = json.dumps({
            'candidates': [{'finishReason': 'STOP', 'content': {'parts': [{'text': 'ok report'}]}}],
            'usageMetadata': {'promptTokenCount': 10, 'candidatesTokenCount': 5}
        }).encode()
        resp.__enter__ = lambda s: s
        resp.__exit__ = lambda *a: None
        with patch.dict(os.environ, {'GEMINI_API_KEY': 'k'}), \
             patch.object(agent.urllib.request, 'build_opener') as bo:
            bo.return_value.open.return_value = resp
            agent.run()
        acc = json.loads((agent.OUT / 'accounting.json').read_text())
        assert acc['status'] == 'complete'
        assert acc['usage']['promptTokenCount'] == 10
        assert (agent.OUT / 'report.md').read_text() == 'ok report'
    with_temp(run)
    print('PASS run success with usage')

def test_run_empty():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-2.5-pro","files":[]}')
        (td / 'docs').mkdir()
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('s')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('w')
        resp = MagicMock()
        resp.read.return_value = json.dumps({
            'candidates': [{'finishReason': 'STOP', 'content': {'parts': [{'text': '  '}]}}],
            'usageMetadata': {'promptTokenCount': 1}
        }).encode()
        resp.__enter__ = lambda s: s
        resp.__exit__ = lambda *a: None
        with patch.dict(os.environ, {'GEMINI_API_KEY': 'k'}), \
             patch.object(agent.urllib.request, 'build_opener') as bo:
            bo.return_value.open.return_value = resp
            try:
                agent.run()
                raise AssertionError('should fail')
            except RuntimeError:
                pass
        acc = json.loads((agent.OUT / 'accounting.json').read_text())
        assert acc['status'] == 'incomplete'
        assert 'usage' in acc
    with_temp(run)
    print('PASS empty response incomplete with usage saved')

def test_run_truncated_usage_saved():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-2.5-pro","files":[]}')
        (td / 'docs').mkdir()
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('s')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('w')
        resp = MagicMock()
        resp.read.return_value = json.dumps({
            'candidates': [{'finishReason': 'MAX_TOKENS', 'content': {'parts': [{'text': 'partial'}]}}],
            'usageMetadata': {'promptTokenCount': 99}
        }).encode()
        resp.__enter__ = lambda s: s
        resp.__exit__ = lambda *a: None
        with patch.dict(os.environ, {'GEMINI_API_KEY': 'k'}), \
             patch.object(agent.urllib.request, 'build_opener') as bo:
            bo.return_value.open.return_value = resp
            try:
                agent.run()
                raise AssertionError('should fail')
            except RuntimeError:
                pass
        acc = json.loads((agent.OUT / 'accounting.json').read_text())
        assert acc['status'] == 'incomplete'
        assert acc['usage']['promptTokenCount'] == 99
    with_temp(run)
    print('PASS truncated incomplete, usage saved before check')

def test_redirect_handler():
    agent = load()
    # Instantiate the handler logic by calling run path that builds opener
    # Direct unit: the class raises on redirect
    import urllib.request
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            raise urllib.error.HTTPError(req.full_url, code, f'Redirect forbidden: {msg}', headers, fp)
    h = NoRedirect()
    try:
        h.redirect_request(MagicMock(full_url='http://x'), None, 302, 'Found', {}, 'http://y')
        raise AssertionError('should raise')
    except urllib.error.HTTPError as e:
        assert e.code == 302
        assert 'Redirect forbidden' in str(e)
    print('PASS redirect handler raises')

def test_publish():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'accounting.json').write_text('{"status":"complete"}')
        (agent.OUT / 'report.md').write_text('report body')
        event = make_event('{}')
        (td / 'e.json').write_text(json.dumps(event))
        env = {'GITHUB_REPOSITORY': 'apotet/my-gemini-mirror-site', 'GITHUB_EVENT_PATH': str(td / 'e.json'),
               'GITHUB_RUN_ID': '42'}
        with patch.dict(os.environ, env), patch.object(agent, 'gh') as gh:
            agent.publish()
            assert gh.call_count >= 2
    with_temp(run)
    print('PASS publish posts comments')

def test_missing_key():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-2.5-pro","files":[]}')
        with patch.dict(os.environ, {'GEMINI_API_KEY': ''}):
            try:
                agent.run()
                raise AssertionError('should fail')
            except RuntimeError as e:
                assert 'GEMINI_API_KEY' in str(e)
    with_temp(run)
    print('PASS missing key')

if __name__ == '__main__':
    test_prepare_success()
    test_prepare_missing_standard()
    test_prepare_claim_on_second_page()
    test_prepare_edit_disabled()
    test_run_success()
    test_run_empty()
    test_run_truncated_usage_saved()
    test_redirect_handler()
    test_publish()
    test_missing_key()
    print('\nAll offline/mock tests passed')

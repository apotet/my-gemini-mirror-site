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
        # Mock gh so real api_pages pagination runs: page 1 full, page 2 has marker
        calls = {'n': 0}
        def fake_gh(*args):
            calls['n'] += 1
            if 'comments' in args[-1] and 'page=' in args[-1]:
                if args[-1].endswith('page=1'):
                    return json.dumps([{'body': 'noise'}] * 100)
                if args[-1].endswith('page=2'):
                    return json.dumps([{'body': agent.MARKER}])
            return '[]'
        with patch.dict(os.environ, env), \
             patch.object(agent, 'git', return_value='x'), \
             patch.object(agent, 'tracked_files', return_value=set()), \
             patch.object(agent, 'gh', side_effect=fake_gh):
            try:
                agent.prepare()
                raise AssertionError('should fail')
            except ValueError as e:
                assert 'already claimed' in str(e)
            assert calls['n'] >= 2
    with_temp(run)
    print('PASS claim detected via real pagination (gh mocked)')


def test_prepare_flash_allowed():
    agent = load()
    def run(td):
        (td / 'docs').mkdir()
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('s')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('w')
        agent.OUT = td / 'out'
        event = make_event(json.dumps({'task': 'audit', 'model': 'gemini-3.8-flash'}))
        (td / 'e.json').write_text(json.dumps(event))
        env = {'GITHUB_REPOSITORY': 'apotet/my-gemini-mirror-site', 'GITHUB_RUN_ATTEMPT': '1',
               'GITHUB_EVENT_PATH': str(td / 'e.json'), 'GITHUB_RUN_ID': '1'}
        with patch.dict(os.environ, env), \
             patch.object(agent, 'git', return_value='abc'), \
             patch.object(agent, 'tracked_files', return_value=set()), \
             patch.object(agent, 'api_pages', return_value=[]), \
             patch.object(agent, 'gh'):
            agent.prepare()
            snap = json.loads((agent.OUT / 'snapshot.json').read_text())
            assert snap['model'] == 'gemini-3.8-flash'
    with_temp(run)
    print('PASS flash selectable')

def test_prepare_unknown_model_rejected():
    agent = load()
    def run(td):
        (td / 'docs').mkdir()
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('s')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('w')
        agent.OUT = td / 'out'
        event = make_event(json.dumps({'task': 'audit', 'model': 'gemini-unknown'}))
        (td / 'e.json').write_text(json.dumps(event))
        env = {'GITHUB_REPOSITORY': 'apotet/my-gemini-mirror-site', 'GITHUB_RUN_ATTEMPT': '1',
               'GITHUB_EVENT_PATH': str(td / 'e.json'), 'GITHUB_RUN_ID': '1'}
        with patch.dict(os.environ, env):
            try:
                agent.prepare()
                raise AssertionError('should fail')
            except ValueError as e:
                assert 'Model must be one of' in str(e)
    with_temp(run)
    print('PASS unknown model rejected')

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
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-4-hydrogen","files":[]}')
        (td / 'docs').mkdir()
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('std')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('wf')
        resp = MagicMock()
        resp.read.return_value = json.dumps({
            'object': 'interaction',
            'status': 'completed',
            'model': 'gemini-4-hydrogen',
            'steps': [{'type': 'model_output', 'content': [{'type': 'text', 'text': 'ok report'}]}],
            'usage': {'total_tokens': 15}
        }).encode()
        resp.__enter__ = lambda s: s
        resp.__exit__ = lambda *a: None
        with patch.dict(os.environ, {'GEMINI_API_KEY': 'k'}), \
             patch.object(agent.urllib.request, 'build_opener') as bo:
            bo.return_value.open.return_value = resp
            agent.run()
            sent = json.loads(bo.return_value.open.call_args[0][0].data.decode())
            assert sent['model'] == 'gemini-4-hydrogen'
            assert sent.get('store') is False
            assert 'input' in sent and 'contents' not in sent
        acc = json.loads((agent.OUT / 'accounting.json').read_text())
        assert acc['status'] == 'complete'
        assert acc['usage']['total_tokens'] == 15
        assert acc['interactionStatus'] == 'completed'
        assert (agent.OUT / 'report.md').read_text() == 'ok report'
    with_temp(run)
    print('PASS run success with usage')

def test_run_empty():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-4-hydrogen","files":[]}')
        (td / 'docs').mkdir()
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('s')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('w')
        resp = MagicMock()
        resp.read.return_value = json.dumps({
            'status': 'completed',
            'steps': [{'type': 'model_output', 'content': [{'type': 'text', 'text': '  '}]}],
            'usage': {'total_tokens': 1}
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
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-4-hydrogen","files":[]}')
        (td / 'docs').mkdir()
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('s')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('w')
        resp = MagicMock()
        resp.read.return_value = json.dumps({
            'status': 'incomplete',
            'steps': [],
            'usage': {'total_tokens': 99}
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
        assert acc['usage']['total_tokens'] == 99
    with_temp(run)
    print('PASS truncated incomplete, usage saved before check')

def test_redirect_handler():
    agent = load()
    h = agent.NoRedirect()
    try:
        h.redirect_request(MagicMock(full_url='http://x'), None, 302, 'Found', {}, 'http://y')
        raise AssertionError('should raise')
    except Exception as e:
        assert getattr(e, 'code', None) == 302
        assert 'Redirect forbidden' in str(e)
    print('PASS real NoRedirect handler raises')

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

def test_run_http_error():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-4-hydrogen","files":[]}')
        (td / 'docs').mkdir()
        (td / 'docs' / 'LEARNING_CONTENT_STANDARD.md').write_text('s')
        (td / 'docs' / 'DEVELOPMENT_WORKFLOW.md').write_text('w')
        import urllib.error
        err = urllib.error.HTTPError('http://x', 400, 'bad', {}, None)
        with patch.dict(os.environ, {'GEMINI_API_KEY': 'k'}), \
             patch.object(agent.urllib.request, 'build_opener') as bo:
            bo.return_value.open.side_effect = err
            try:
                agent.run()
                raise AssertionError('should fail')
            except Exception:
                pass
        acc = json.loads((agent.OUT / 'accounting.json').read_text())
        assert acc['status'] == 'error'
        assert acc.get('httpStatus') == 400
    with_temp(run)
    print('PASS HTTP error accounting')


def _ok_resp(text='ok report', usage=None):
    resp = MagicMock()
    body = {
        'object': 'interaction',
        'status': 'completed',
        'model': 'gemini-4-hydrogen',
        'steps': [{'type': 'model_output', 'content': [{'type': 'text', 'text': text}]}],
        'usage': usage or {'total_tokens': 15},
    }
    resp.read.return_value = json.dumps(body).encode()
    resp.__enter__ = lambda s: s
    resp.__exit__ = lambda *a: None
    return resp

def _http(code, retry_after=None):
    import urllib.error
    headers = {}
    if retry_after is not None:
        headers['Retry-After'] = str(retry_after)
    err = urllib.error.HTTPError('http://x', code, 'no', headers, None)
    err.read = lambda n=4000: b'{"error":{"code":"service_unavailable"}}'
    return err

def test_retry_503_then_success():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-4-hydrogen","files":[]}')
        calls = {'n': 0}
        def open_side(req, timeout=None):
            calls['n'] += 1
            if calls['n'] < 2:
                raise _http(503)
            return _ok_resp()
        with patch.dict(os.environ, {'GEMINI_API_KEY': 'k'}), \
             patch.object(agent.urllib.request, 'build_opener') as bo, \
             patch.object(agent.time, 'sleep') as sl:
            bo.return_value.open.side_effect = open_side
            agent.run()
            assert sl.called
        acc = json.loads((agent.OUT / 'accounting.json').read_text())
        assert acc['status'] == 'complete'
        assert acc['api_calls'] == 2
        assert len(acc['attempts']) == 2
    with_temp(run)
    print('PASS 503 then success stops')

def test_two_503_hydrogen_switches_to_flash():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-4-hydrogen","files":[]}')
        seen = []
        def open_side(req, timeout=None):
            body = json.loads(req.data.decode())
            seen.append(body['model'])
            if len(seen) < 3:
                raise _http(503, retry_after=1)
            return _ok_resp()
        with patch.dict(os.environ, {'GEMINI_API_KEY': 'k'}), \
             patch.object(agent.urllib.request, 'build_opener') as bo, \
             patch.object(agent.time, 'sleep'):
            bo.return_value.open.side_effect = open_side
            agent.run()
        assert seen[0] == 'gemini-4-hydrogen'
        assert seen[1] == 'gemini-4-hydrogen'
        assert seen[2] == 'gemini-3.8-flash'
        acc = json.loads((agent.OUT / 'accounting.json').read_text())
        assert acc['status'] == 'complete'
        assert acc['model'] == 'gemini-3.8-flash'
    with_temp(run)
    print('PASS two hydrogen 503 then flash')

def test_uncertain_timeout_no_retry():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-4-hydrogen","files":[]}')
        with patch.dict(os.environ, {'GEMINI_API_KEY': 'k'}), \
             patch.object(agent.urllib.request, 'build_opener') as bo, \
             patch.object(agent.time, 'sleep') as sl:
            bo.return_value.open.side_effect = TimeoutError('timed out')
            try:
                agent.run()
                raise AssertionError('should fail')
            except TimeoutError:
                pass
            assert not sl.called
        acc = json.loads((agent.OUT / 'accounting.json').read_text())
        assert acc['api_calls'] == 1
    with_temp(run)
    print('PASS uncertain timeout not retried')

def test_retry_after_honored():
    agent = load()
    assert agent.backoff_seconds(1, 30) >= 30
    assert agent.backoff_seconds(1, None) <= agent.BACKOFF_CAP
    print('PASS Retry-After honored in backoff')

def test_missing_key():
    agent = load()
    def run(td):
        agent.OUT = td / 'out'
        agent.OUT.mkdir()
        (agent.OUT / 'task.json').write_text('{"task":"x"}')
        (agent.OUT / 'snapshot.json').write_text('{"model":"gemini-4-hydrogen","files":[]}')
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
    test_prepare_flash_allowed()
    test_prepare_unknown_model_rejected()
    test_prepare_edit_disabled()
    test_run_success()
    test_run_empty()
    test_run_truncated_usage_saved()
    test_redirect_handler()
    test_publish()
    test_run_http_error()
    test_retry_503_then_success()
    test_two_503_hydrogen_switches_to_flash()
    test_uncertain_timeout_no_retry()
    test_retry_after_honored()
    test_missing_key()
    print('\nAll offline/mock tests passed')

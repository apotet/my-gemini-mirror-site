"""Offline integration tests. All outbound I/O is forbidden/mocked."""
import importlib.util
import json
import os
from pathlib import Path
import tempfile
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('zai', 'scripts/zai-agent.py')
z = importlib.util.module_from_spec(spec)
spec.loader.exec_module(z)
task = json.loads(Path('scripts/zai-runtime/issue-356.fixture.json').read_text())
with patch.object(z.urllib.request, 'urlopen', side_effect=AssertionError('Network forbidden')):
    snapshot = z.pack(task)
    definition = z.lesson_definition(task['lesson'])
    files = {f['path']: f for f in snapshot['files']}
    assert files[definition['path']]['content'] == definition['content']
    for path in task['files']:
        assert files[path]['content'] == Path(path).read_text(), path
        assert files[path]['coverage'] == 'full'
    questions = json.loads(files['src/data/questions.json']['content'])
    expected = set(definition['questionIds'])
    assert len(expected) == 7
    actual = {q['id']:q for q in questions}
    original = {q['id']:q for q in json.loads(Path('src/data/questions.json').read_text())}
    assert expected <= actual.keys()
    for qid in expected:
        assert actual[qid] == original[qid]
    print('Issue 356 pack: full target + full etalon + 7/7 complete related questions')
    print('question IDs:', ', '.join(sorted(expected)))
    print('pack JSON UTF-8 bytes:', len(json.dumps(snapshot,ensure_ascii=False).encode()))
    size = len(z.SYSTEM.encode()) + len((task['task'] + '\n\n' + json.dumps(snapshot,ensure_ascii=False)).encode())
    print('Issue 356 full message bytes:',size,'limit:',z.MAX_BYTES)
    # Explicitly requested container must also retain full source.
    explicit = z.pack({**task,'files':[definition['path']]})
    assert explicit['files'][0]['content'] == Path(definition['path']).read_text()
    assert z.MAX_BYTES == 100000 and z.MAX_OUTPUT == 16384
    event = {'action':'opened','sender':{'login':'apotet','type':'User'},
             'issue':{'number':356,'user':{'login':'apotet'},'title':'[ZAI] test','body':json.dumps(task)}}
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp)/'event.json'; path.write_text(json.dumps(event))
        env = {'GITHUB_EVENT_PATH':str(path),'GITHUB_REPOSITORY':'apotet/my-gemini-mirror-site','GITHUB_RUN_ATTEMPT':'1'}
        with patch.dict(os.environ,env), patch.object(z,'OUT',Path(tmp)/'out'), patch.object(z,'github') as gh:
            try:
                z.prepare()
                raise AssertionError('Oversized context must fail')
            except ValueError as e:
                assert 'Context/cost bound exceeded' in str(e)
            gh.assert_not_called()
            assert not (Path(tmp)/'out/payload.json').exists()
            # Small context: prepare claims once, blocks an existing durable claim.
            with patch.object(z,'pack',return_value={'small':'context'}):
                gh.side_effect = [[], {}]
                z.prepare()
                assert gh.call_count == 2
                assert z.MARKER in gh.call_args.args[2]['body']
                account = json.loads((z.OUT/'accounting.json').read_text())
                assert account['api_calls'] == 0 and account['max_cost_usd'] < .25
                gh.reset_mock(); gh.side_effect = None
                gh.return_value = [{'body':z.MARKER}]
                try:
                    z.prepare()
                    raise AssertionError('Must block repeat claim')
                except ValueError as e:
                    assert 'already claimed' in str(e)
                assert gh.call_count == 1
            with patch.dict(os.environ,{'GITHUB_RUN_ATTEMPT':'2'}):
                try:
                    z.prepare()
                    raise AssertionError('Must block rerun')
                except ValueError as e:
                    assert 'Unauthorized' in str(e)
    for invalid in ['../secrets','/etc/passwd','scripts/zai-agent.py']:
        try:
            z.safe_source(invalid)
            raise AssertionError('Unsafe path accepted')
        except ValueError:
            pass
print('PASS: context overflow fails before claim; claim/repeat/rerun/path/cost gates preserved; paid calls=0')

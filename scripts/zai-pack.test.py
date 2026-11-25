"""Offline integration tests. All outbound I/O is forbidden/mocked."""
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest
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
    print('Issue 356 full message bytes:',size,'limit:',z.lesson_limits('glm-5.3')[0])
    # Explicitly requested container must also retain full source.
    explicit = z.pack({**task,'files':[definition['path']]})
    assert explicit['files'][0]['content'] == Path(definition['path']).read_text()
    assert z.MAX_BYTES == 100000 and z.MAX_OUTPUT == 16384


class PreparationBudget(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.event = {'action':'opened','sender':{'login':'apotet','type':'User'},
                      'issue':{'number':356,'user':{'login':'apotet'},'title':'[ZAI] test','body':json.dumps(task)}}
        self.path = self.root/'event.json'
        self.write_event()
        patches = [patch.dict(os.environ, {'GITHUB_EVENT_PATH':str(self.path),
                   'GITHUB_REPOSITORY':'apotet/my-gemini-mirror-site','GITHUB_RUN_ATTEMPT':'1'}),
                   patch.object(z,'OUT',self.root/'out'),
                   patch.object(z.urllib.request,'urlopen',side_effect=AssertionError('Network forbidden')),
                   patch.object(z.urllib.request,'build_opener',side_effect=AssertionError('Paid call forbidden'))]
        for p in patches:
            p.start(); self.addCleanup(p.stop)
        p = patch.object(z,'github',side_effect=[[],{}])
        self.gh = p.start(); self.addCleanup(p.stop)

    def write_event(self):
        self.path.write_text(json.dumps(self.event))

    def blocked(self, message):
        with self.assertRaisesRegex(ValueError,message):
            z.prepare()
        self.gh.assert_not_called()
        self.assertFalse((z.OUT/'payload.json').exists())

    def test_356_prepares_full_context_and_claims_once(self):
        z.prepare()
        self.assertEqual(self.gh.call_count,2)
        self.assertEqual(self.gh.call_args.args[0],'POST')
        self.assertIn(z.MARKER,self.gh.call_args.args[2]['body'])
        payload = json.loads((z.OUT/'payload.json').read_text())
        account = json.loads((z.OUT/'accounting.json').read_text())
        saved = json.loads((z.OUT/'source-pack.json').read_text())
        self.assertEqual(saved,snapshot)
        self.assertEqual(payload['messages'][1]['content'], task['task']+'\n\n'+json.dumps(snapshot,ensure_ascii=False))
        self.assertEqual(payload['max_tokens'],10000)
        self.assertEqual(payload['reasoning_effort'],'high')
        self.assertEqual(account['api_calls'],0)
        self.assertEqual(account['input_utf8_bytes'],144846)
        self.assertEqual(account['input_limit_bytes'],200000)
        self.assertEqual(account['max_cost_usd'],0.2496516)
        self.assertEqual(account['cost_limit_usd'],0.25)
        print('Issue 356 prepare PASS; messages=144846 bytes; output<=10000 tokens including reasoning; maximum=$0.2496516; paid calls=0')

    def test_context_overflow_before_claim(self):
        with patch.object(z,'pack',return_value={'context':'x'*200001}):
            self.blocked('Context bound exceeded')

    def test_financial_overflow_within_context_limit_before_claim(self):
        # Less than 200k bytes, but too costly even with the 10k output cap.
        with patch.object(z,'pack',return_value={'context':'x'*170000}):
            self.blocked('Cost bound exceeded')

    def test_trusted_lower_context_limit_is_enforced(self):
        config = self.root/'trusted.json'
        config.write_text(json.dumps({'glm-5.3':{'max_input_bytes':100000,'max_output_tokens':10000}}))
        with patch.object(z,'LIMITS_PATH',config):
            self.blocked('Context bound exceeded')

    def test_issue_cannot_override_limits(self):
        for field in ['max_input_bytes','max_output_tokens','max_cost_usd','limits_path']:
            with self.subTest(field=field):
                self.event['issue']['body'] = json.dumps({**task,field:999999})
                self.write_event()
                self.blocked('documented JSON task fields')

    def test_invalid_trusted_configuration_fails_closed(self):
        config = self.root/'trusted.json'
        for bad in [None, {}, {'max_input_bytes':True,'max_output_tokens':10000},
                    {'max_input_bytes':200001,'max_output_tokens':10000},
                    {'max_input_bytes':200000,'max_output_tokens':16385}]:
            config.write_text(json.dumps({'glm-5.3':bad}))
            with self.subTest(config=bad), patch.object(z,'LIMITS_PATH',config):
                self.blocked('Invalid trusted lesson')

    def test_repeat_claim_blocks_post(self):
        self.gh.side_effect = None
        self.gh.return_value = [{'body':z.MARKER}]
        with self.assertRaisesRegex(ValueError,'already claimed'):
            z.prepare()
        self.assertEqual(self.gh.call_count,1)
        self.assertEqual(self.gh.call_args.args[0],'GET')

    def test_rerun_blocks_before_claim(self):
        with patch.dict(os.environ,{'GITHUB_RUN_ATTEMPT':'2'}):
            self.blocked('Unauthorized')

    def test_exact_financial_boundary(self):
        payload = {'model':'glm-5.3','max_tokens':10000,'messages':[{'content':'x'*145094}]}
        self.assertEqual(z.check_budget(payload,200000),(145094,0.2499988))
        payload['messages'][0]['content'] += 'x'
        with self.assertRaisesRegex(ValueError,'Cost bound exceeded'):
            z.check_budget(payload,200000)

    def test_l3_limits_remain_independent_of_lesson_config(self):
        l3 = {'branch':'work/applied-l3-test','sha':'a'*40,'ids':['test-id'],'model':'glm-5.3'}
        self.event['issue']['body'] = json.dumps(l3); self.write_event()
        with patch.object(z,'pack_l3',return_value={'small':'context'}), patch.object(z,'lesson_limits',side_effect=AssertionError('L3 must not load lesson limits')):
            z.prepare()
        self.assertEqual(json.loads((z.OUT/'payload.json').read_text())['max_tokens'],16384)
        self.assertEqual(json.loads((z.OUT/'accounting.json').read_text())['input_limit_bytes'],115000)

    def test_flash_limits_unchanged(self):
        self.assertEqual(z.lesson_limits('glm-5.3-flash'),(100000,16384))


if __name__ == '__main__':
    unittest.main(verbosity=2)

import importlib.util
import json
import unittest
from unittest.mock import patch
spec = importlib.util.spec_from_file_location('zai', 'scripts/zai-agent.py')
z = importlib.util.module_from_spec(spec)
spec.loader.exec_module(z)

class Safety(unittest.TestCase):
    def test_selectors_and_complete_source(self):
        for selector in ['l2-hsr-redundancy', 'src/data/lessons/l2-hsr-redundancy.ts', 'HSR: кольцо с безударным резервированием']:
            task = z.parse_task(json.dumps({'lesson': selector, 'task': 'audit'}))
            pack = z.pack(task)
            self.assertEqual(pack['lesson'], 'src/data/lessons/l2-hsr-redundancy.ts')
            self.assertEqual(pack['files'][0]['content'], z.Path(pack['lesson']).read_text())
    def test_invalid_tasks(self):
        for change in [{'model': 'other'}, {'mode': 'edit'}, {'task': ''}, {'files': 'shell'}]:
            with self.assertRaises(ValueError):
                z.parse_task(json.dumps({'lesson':'hsr', 'task':'audit', **change}))
    def test_l3_task_and_pack(self):
        import subprocess
        task = {'branch':'work/applied-l3-20261124', 'sha':subprocess.check_output(['git','rev-parse','HEAD'], text=True).strip(),
                'ids':['gen-port-13','gen-port-6','gen-port-7','gen-port-8'], 'model':'glm-5.3'}
        self.assertEqual(z.parse_task(json.dumps(task)), task)
        for change in [{'ids':[]}, {'ids':['x','x']}, {'sha':'main'}, {'model':'glm-5.3-flash'}]:
            with self.assertRaises(ValueError): z.parse_task(json.dumps({**task, **change}))
    def test_l3_complete_text_and_budget(self):
        fixture = json.loads(z.Path('docs/audits/applied-l3-20261124/batch-01-source.json').read_text())
        ids = ['gen-port-13','gen-port-6','gen-port-7','gen-port-8']
        task = {'branch':'work/applied-l3-20261124','sha':'a'*40,'ids':ids,'model':'glm-5.3'}
        def read(args, **kwargs):
            return json.dumps(fixture) if args[1] == 'show' else ''
        with patch.object(z, 'github', return_value={'object':{'sha':task['sha']}}), patch.object(z.subprocess, 'run'), patch.object(z.subprocess, 'check_output', side_effect=read):
            pack = z.pack_l3(task)
        self.assertEqual([q['id'] for q in pack['questions']], ids)
        for q in pack['questions']:
            original = next(x for x in fixture['questions'] if x['id']==q['id'])
            for field in ['question','plain','pro','lesson','practice']:
                self.assertEqual(q[field], original[field])
        for lesson in pack['lessons']:
            original = next(x for x in fixture['lessons'] if x['id']==lesson['id'])
            self.assertEqual(lesson['resolvedBlocks'], original['resolvedBlocks'])
        size = len((z.L3_SYSTEM + json.dumps(pack, ensure_ascii=False)).encode())
        self.assertLess(size, 115000)
        self.assertLess(((size+2048)*1.4+z.MAX_OUTPUT*4.4)/1e6, .25)

    def test_paths(self):
        for path in ['../secret', '/etc/passwd', '.env', '.github/workflows/ci.yml']:
            with self.assertRaises(ValueError):
                z.safe_source(path)
    def test_no_redirect(self):
        self.assertIsNone(z.NoRedirect().redirect_request(None, None, None, None))
    def test_missing_key_no_network(self):
        with patch.dict(z.os.environ, {}, clear=True), patch('urllib.request.build_opener') as request:
            with self.assertRaises(ValueError): z.run()
            request.assert_not_called()

unittest.main()

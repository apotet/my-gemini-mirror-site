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

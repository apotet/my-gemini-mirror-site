import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('audit', Path(__file__).parents[1] / 'scripts/opencode_audit.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class AuditTests(unittest.TestCase):
    def test_dry_run_never_invokes_cli(self):
        for model in audit.MODELS:
            with tempfile.TemporaryDirectory() as tmp, patch.object(sys, 'argv', ['audit', '--model', model, '--output', tmp]), patch.object(audit.subprocess, 'run', side_effect=AssertionError('CLI invoked')), patch.dict(os.environ, {}, clear=True):
                audit.main()
                cfg = json.loads((Path(tmp) / 'config.json').read_text())
                self.assertEqual(cfg['model'], f'zai-coding-plan/{model}')
                for tool in ('read', 'glob', 'grep', 'list'):
                    self.assertEqual(cfg['permission'][tool], 'allow')
                for tool in ('*', 'edit', 'bash', 'task', 'external_directory'):
                    self.assertEqual(cfg['permission'][tool], 'deny')
                self.assertIn('no CLI, secret or model access', (Path(tmp) / 'report.md').read_text())

    def test_unknown_model_rejected(self):
        with self.assertRaises(ValueError):
            audit.config('other/free')

    def test_paid_isolated_and_redacted(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / 'repo'
            repo.mkdir()
            (repo / '.git').mkdir()
            (repo / 'source.txt').write_text('repository evidence')
            prompt = Path(tmp) / 'prompt.txt'
            prompt.write_text('Audit this supplied code')
            def cli(command, **kw):
                self.assertEqual(command[:2], ['opencode', 'run'])
                self.assertNotIn('GITHUB_TOKEN', kw['env'])
                self.assertEqual(kw['env']['ZHIPU_API_KEY'], 'test-secret')
                self.assertEqual(kw['cwd'], str(repo))
                self.assertEqual((Path(kw['cwd']) / 'source.txt').read_text(), 'repository evidence')
                cfg = json.loads(Path(kw['env']['OPENCODE_CONFIG']).read_text())
                self.assertEqual(json.loads(kw['env']['OPENCODE_PERMISSION']), cfg['permission'])
                self.assertEqual(cfg['permission']['edit'], 'deny')
                self.assertNotEqual(kw['env']['HOME'], str(repo))
                return subprocess.CompletedProcess(command, 0, 'test-secret usage', '')
            with patch.object(sys, 'argv', ['audit', '--repo', str(repo), '--paid', '--prompt', str(prompt), '--output', tmp]), patch.dict(os.environ, {'ZHIPU_API_KEY': 'test-secret', 'GITHUB_TOKEN': 'must-not-leak'}), patch.object(audit.subprocess, 'run', side_effect=cli) as run:
                audit.main()
                self.assertEqual(run.call_count, 1)
                self.assertEqual((Path(tmp) / 'events.jsonl').read_text(), '[REDACTED] usage')

    def test_timeout_not_retried(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / 'repo'
            repo.mkdir()
            (repo / '.git').mkdir()
            (repo / 'source.txt').write_text('repository evidence')
            prompt = Path(tmp) / 'prompt.txt'
            prompt.write_text('audit')
            with patch.object(sys, 'argv', ['audit', '--repo', str(repo), '--paid', '--prompt', str(prompt), '--output', tmp]), patch.dict(os.environ, {'ZHIPU_API_KEY': 'test-secret'}), patch.object(audit.subprocess, 'run', side_effect=subprocess.TimeoutExpired('opencode', 600)) as run:
                with self.assertRaisesRegex(RuntimeError, 'uncertain'):
                    audit.main()
                self.assertEqual(run.call_count, 1)
                self.assertIn('uncertain', (Path(tmp) / 'report.md').read_text())

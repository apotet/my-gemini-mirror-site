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
                self.assertEqual(cfg['permission'], {'*': 'deny'})
                self.assertIn('no CLI, secret or model access', (Path(tmp) / 'report.md').read_text())

    def test_unknown_model_rejected(self):
        with self.assertRaises(ValueError):
            audit.config('other/free')

    def test_paid_isolated_and_redacted(self):
        with tempfile.TemporaryDirectory() as tmp:
            prompt = Path(tmp) / 'prompt.txt'
            prompt.write_text('Audit this supplied code')
            def cli(command, **kw):
                self.assertEqual(command[:2], ['opencode', 'run'])
                self.assertNotIn('GITHUB_TOKEN', kw['env'])
                self.assertEqual(kw['env']['ZHIPU_API_KEY'], 'test-secret')
                self.assertNotEqual(kw['cwd'], str(Path.cwd()))
                return subprocess.CompletedProcess(command, 0, 'test-secret usage', '')
            with patch.object(sys, 'argv', ['audit', '--paid', '--prompt', str(prompt), '--output', tmp]), patch.dict(os.environ, {'ZHIPU_API_KEY': 'test-secret', 'GITHUB_TOKEN': 'must-not-leak'}), patch.object(audit.subprocess, 'run', side_effect=cli) as run:
                audit.main()
                self.assertEqual(run.call_count, 1)
                self.assertEqual((Path(tmp) / 'events.jsonl').read_text(), '[REDACTED] usage')

    def test_timeout_not_retried(self):
        with tempfile.TemporaryDirectory() as tmp:
            prompt = Path(tmp) / 'prompt.txt'
            prompt.write_text('audit')
            with patch.object(sys, 'argv', ['audit', '--paid', '--prompt', str(prompt), '--output', tmp]), patch.dict(os.environ, {'ZHIPU_API_KEY': 'test-secret'}), patch.object(audit.subprocess, 'run', side_effect=subprocess.TimeoutExpired('opencode', 600)) as run:
                with self.assertRaisesRegex(RuntimeError, 'uncertain'):
                    audit.main()
                self.assertEqual(run.call_count, 1)
                self.assertIn('uncertain', (Path(tmp) / 'report.md').read_text())

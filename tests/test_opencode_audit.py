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

    def test_api_models_and_dry_run(self):
        cfg = audit.config('glm-5.3', 'zai')
        self.assertEqual(cfg['model'], 'zai/glm-5.3')
        self.assertEqual(cfg['agent']['audit']['steps'], 3)
        self.assertEqual(cfg['enabled_providers'], ['zai'])
        with self.assertRaises(ValueError):
            audit.config('glm-5.4', 'zai')
        with tempfile.TemporaryDirectory() as tmp, patch.object(sys, 'argv', ['audit', '--provider', 'zai', '--model', 'glm-5.3', '--output', tmp]), patch.object(audit.subprocess, 'run', side_effect=AssertionError('CLI invoked')), patch.dict(os.environ, {}, clear=True):
            audit.main()

    def test_api_budget_risk_acceptance_before_credential_or_cli(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(sys, 'argv', ['audit', '--paid', '--provider', 'zai', '--model', 'glm-5.3', '--output', tmp]), patch.object(audit.subprocess, 'run', side_effect=AssertionError('CLI invoked')), patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(RuntimeError, 'budget'):
                audit.main()

    def test_accounting_step_deltas_without_duplicate_message(self):
        part = {'cost': 0.11, 'tokens': {'input': 100, 'output': 20, 'reasoning': 5, 'cache': {'read': 10, 'write': 0}}}
        events = '\n'.join(json.dumps(e) for e in [
            {'type': 'step_finish', 'part': part},
            {'type': 'text', 'part': part},
            {'type': 'step_finish', 'part': part}])
        usage = audit.accounting(events, 'zai')
        self.assertEqual(usage['tokens']['input'], 200)
        self.assertEqual(usage['tokens']['cache_read'], 20)
        self.assertAlmostEqual(usage['opencode_cost_usd'], 0.22)
        self.assertTrue(usage['target_exceeded'])
        self.assertFalse(usage['budget_exceeded'])
        self.assertFalse(usage['budget_is_hard_cap'])
        self.assertIsNone(audit.accounting(events, 'zai-coding-plan')['opencode_cost_usd'])

    def test_absent_usage_is_unknown(self):
        for events in ('', 'not-json', '{"type":"step_finish","part":{}}'):
            usage = audit.accounting(events, 'zai')
            self.assertIsNone(usage['tokens'])
            self.assertIsNone(usage['opencode_cost_usd'])

    def test_api_runner_selects_native_agent_and_reports_cost(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / 'repo'
            repo.mkdir()
            (repo / '.git').mkdir()
            prompt = Path(tmp) / 'prompt.txt'
            prompt.write_text('audit')
            event = json.dumps({'type': 'step_finish', 'part': {'cost': 0.08, 'tokens': {'input': 100, 'output': 20, 'reasoning': 0, 'cache': {'read': 0, 'write': 0}}}})
            def cli(command, **kw):
                self.assertIn('zai/glm-5.3', command)
                self.assertEqual(command[command.index('--agent') + 1], 'audit')
                cfg = json.loads(Path(kw['env']['OPENCODE_CONFIG']).read_text())
                self.assertEqual(cfg['enabled_providers'], ['zai'])
                return subprocess.CompletedProcess(command, 0, event, '')
            with patch.object(sys, 'argv', ['audit', '--paid', '--accept-api-budget-risk', '--provider', 'zai', '--model', 'glm-5.3', '--repo', str(repo), '--prompt', str(prompt), '--output', tmp]), patch.dict(os.environ, {'ZHIPU_API_KEY': 'test-secret'}), patch.object(audit.subprocess, 'run', side_effect=cli) as run:
                audit.main()
                self.assertEqual(run.call_count, 1)
                usage = json.loads((Path(tmp) / 'usage.json').read_text())
                self.assertEqual(usage['opencode_cost_usd'], 0.08)

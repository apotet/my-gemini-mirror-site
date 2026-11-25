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
                events = '\n'.join(json.dumps(e) for e in [
                    {'type': 'text', 'part': {'text': 'test-secret usage\nAUDIT_STATUS: COMPLETE'}},
                    {'type': 'step_finish', 'part': {'reason': 'stop'}}])
                return subprocess.CompletedProcess(command, 0, events, '')
            with patch.object(sys, 'argv', ['audit', '--repo', str(repo), '--paid', '--prompt', str(prompt), '--output', tmp]), patch.dict(os.environ, {'ZHIPU_API_KEY': 'test-secret', 'GITHUB_TOKEN': 'must-not-leak'}), patch.object(audit.subprocess, 'run', side_effect=cli) as run:
                audit.main()
                self.assertEqual(run.call_count, 1)
                self.assertNotIn('test-secret', (Path(tmp) / 'events.jsonl').read_text())
                result = json.loads((Path(tmp) / 'result.json').read_text())
                self.assertEqual(result['status'], 'completed')
                self.assertIn('[REDACTED]', result['summary'])
                self.assertNotIn('test-secret', (Path(tmp) / 'report.md').read_text())

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
        self.assertNotIn('steps', cfg['agent']['audit'])
        self.assertNotIn('maxSteps', cfg['agent']['audit'])
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
            event = json.dumps({'type': 'step_finish', 'part': {'reason': 'stop', 'cost': 0.08, 'tokens': {'input': 100, 'output': 20, 'reasoning': 0, 'cache': {'read': 0, 'write': 0}}}})
            def cli(command, **kw):
                self.assertIn('zai/glm-5.3', command)
                self.assertEqual(command[command.index('--agent') + 1], 'audit')
                cfg = json.loads(Path(kw['env']['OPENCODE_CONFIG']).read_text())
                self.assertEqual(cfg['enabled_providers'], ['zai'])
                text = json.dumps({'type': 'text', 'part': {'text': 'Scope inspected.\nAUDIT_STATUS: COMPLETE'}})
                return subprocess.CompletedProcess(command, 0, text + '\n' + event, '')
            with patch.object(sys, 'argv', ['audit', '--paid', '--accept-api-budget-risk', '--provider', 'zai', '--model', 'glm-5.3', '--repo', str(repo), '--prompt', str(prompt), '--output', tmp]), patch.dict(os.environ, {'ZHIPU_API_KEY': 'test-secret'}), patch.object(audit.subprocess, 'run', side_effect=cli) as run:
                audit.main()
                self.assertEqual(run.call_count, 1)
                usage = json.loads((Path(tmp) / 'usage.json').read_text())
                self.assertEqual(usage['opencode_cost_usd'], 0.08)

    def test_no_arbitrary_step_limit_for_either_provider(self):
        for provider, model in [('zai', 'glm-5.3'), ('zai-coding-plan', 'glm-5.3'), ('zai-coding-plan', 'glm-5.4')]:
            cfg = audit.config(model, provider)
            self.assertNotIn('steps', cfg['agent']['audit'])
            self.assertNotIn('maxSteps', cfg['agent']['audit'])
            self.assertEqual(cfg['permission']['edit'], 'deny')

    def test_completion_requires_final_stop_and_explicit_scope_declaration(self):
        def events(text, reason):
            return '\n'.join(json.dumps(e) for e in [
                {'type': 'text', 'part': {'text': text}},
                {'type': 'step_finish', 'part': {'reason': reason}}])
        complete = events('Findings with evidence.\nAUDIT_STATUS: COMPLETE', 'stop')
        self.assertEqual(audit.audit_result(complete)['status'], 'completed')
        for data in ['', events('Partial findings', 'stop'), events('Pending.\nAUDIT_STATUS: INCOMPLETE', 'stop'),
                     events('Truncated.\nAUDIT_STATUS: COMPLETE', 'length'),
                     events('Tool pending.\nAUDIT_STATUS: COMPLETE', 'tool-calls'),
                     events('AUDIT_STATUS: COMPLETE', 'stop'), complete + '\nnot-json']:
            self.assertEqual(audit.audit_result(data)['status'], 'incomplete')
        self.assertEqual(audit.audit_result(complete, returncode=1)['status'], 'failed')
        self.assertEqual(audit.audit_result(complete, timed_out=True)['status'], 'interrupted')
        self.assertEqual(audit.audit_result(complete + '\n{"type":"error"}')['status'], 'failed')

    def test_more_than_three_steps_and_only_final_step_summary(self):
        parts = []
        for i in range(5):
            parts.extend([{'type': 'step_start'}, {'type': 'text', 'part': {'text': f'Inspecting file {i}'}},
                          {'type': 'step_finish', 'part': {'reason': 'tool-calls'}}])
        parts.extend([{'type': 'step_start'}, {'type': 'text', 'part': {'text': 'Final scope findings.\nAUDIT_STATUS: COMPLETE'}},
                      {'type': 'step_finish', 'part': {'reason': 'stop'}}])
        result = audit.audit_result('\n'.join(json.dumps(e) for e in parts))
        self.assertEqual(result['status'], 'completed')
        self.assertEqual(result['summary'], 'Final scope findings.')

    def test_timeout_persists_redacted_partial_result_and_usage_without_retry(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / 'repo'
            repo.mkdir(); (repo / '.git').mkdir()
            prompt = Path(tmp) / 'prompt.txt'; prompt.write_text('audit')
            partial = json.dumps({'type': 'text', 'part': {'text': 'test-secret partial findings'}}).encode()
            error = subprocess.TimeoutExpired('opencode', 600, output=partial)
            with patch.object(sys, 'argv', ['audit', '--paid', '--repo', str(repo), '--prompt', str(prompt), '--output', tmp]), patch.dict(os.environ, {'ZHIPU_API_KEY': 'test-secret'}), patch.object(audit.subprocess, 'run', side_effect=error) as run:
                with self.assertRaisesRegex(RuntimeError, 'uncertain'):
                    audit.main()
                self.assertEqual(run.call_count, 1)
                result = json.loads((Path(tmp) / 'result.json').read_text())
                self.assertEqual(result['status'], 'interrupted')
                self.assertNotIn('test-secret', json.dumps(result))
                self.assertIsNone(json.loads((Path(tmp) / 'usage.json').read_text())['opencode_cost_usd'])

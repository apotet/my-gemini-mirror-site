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

    def test_packet_boundaries_and_registry_integrity(self):
        import copy
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / 'inventory.json'
            path = root / 'packet.json'
            sha = 'a' * 40
            rows = [
                dict(id=str(i), question=dict(text='Question', answers=['A', 'B'], correct=1,
                                             explanation='Explanation'),
                     plain='Plain', pro=None, deepDive=dict(practicalTip='Tip', commonTrap='Trap'),
                     lesson=None)
                for i in range(31)
            ]
            source.write_text(json.dumps(dict(sourceSHA='b' * 40, rows=rows)))
            entries = [
                dict(id=row['id'], text='Question', options=['A', 'B'], correct_index=1,
                     explanation='Explanation', plain='Plain', pro=None, practicalTip='Tip',
                     commonTrap='Trap', lesson=None)
                for row in rows
            ]
            packet = dict(checkout_sha=sha, source=source.name, snapshot_source_sha='b' * 40,
                          questions=entries[-30:])
            def validate(value, size=None):
                raw = json.dumps(value).encode()
                if size is not None:
                    raw = raw.ljust(size, b' ')
                path.write_bytes(raw)
                return audit.validate_packet(path, root, sha, source.name)

            self.assertEqual(len(json.loads(validate(packet, 150_000))['questions']), 30)
            self.assertEqual(len(json.loads(validate(dict(packet, questions=entries[-1:])))['questions']), 1)
            for bad in ([], entries, [entries[0], entries[0]], [dict(entries[0], id='missing')],
                        [dict(entries[0], pro='Invented')], [dict(entries[0], correct_index=0)],
                        [dict(entries[0], lesson={'id': 'invented'})]):
                with self.assertRaises(RuntimeError):
                    validate(dict(packet, questions=bad))
            incomplete = copy.deepcopy(packet)
            del incomplete['questions'][0]['commonTrap']
            with self.assertRaisesRegex(RuntimeError, 'commonTrap'):
                validate(incomplete)
            with self.assertRaisesRegex(RuntimeError, 'pinned source'):
                validate(dict(packet, snapshot_source_sha='c' * 40))
            with self.assertRaisesRegex(RuntimeError, 'too large'):
                validate(packet, 150_001)

    def test_packet_report_requires_all_twenty_rows_in_order(self):
        ids = [f'question-{i}' for i in range(20)]
        rows = [dict(id=qid, status='PASS', reason='Key checked', recommendation='No changes')
                for qid in ids]
        def result(payload, finish='stop'):
            return audit.audit_result('\n'.join([
                json.dumps({'type': 'text', 'part': {'text': payload}}),
                json.dumps({'type': 'step_finish', 'part': {'reason': finish}})
            ]), expected_ids=ids)
        answer = json.dumps({'results': rows})
        self.assertEqual(result(answer)['results'], rows)
        self.assertEqual(result(answer)['status'], 'completed')
        self.assertEqual(result(answer, finish='length')['status'], 'incomplete')
        self.assertEqual(result(answer[:-10])['status'], 'incomplete')
        self.assertEqual(result('AUDIT_STATUS: COMPLETE')['status'], 'incomplete')
        for invalid in (rows[:-1], list(reversed(rows)), [rows[1], *rows[1:]],
                        [dict(rows[0], reason=''), *rows[1:]]):
            self.assertEqual(result(json.dumps({'results': invalid}))['status'], 'incomplete')

    def test_paid_runner_checks_catalog_in_same_environment_and_redacts_logs(self):
        import hashlib
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / '.git').mkdir()
            catalog = root / 'models.json'
            catalog.write_text(json.dumps({'zai-coding-plan': {
                'api': 'https://api.z.ai/api/coding/paas/v4',
                'npm': '@ai-sdk/openai-compatible', 'models': {'glm-5.4': {}},
            }}))
            digest = hashlib.sha256(catalog.read_bytes()).hexdigest()
            prompt = root / 'prompt.txt'
            prompt.write_text('fixture')
            args = ['audit', '--paid', '--repo', tmp, '--prompt', str(prompt),
                    '--output', tmp, '--catalog', str(catalog), '--catalog-sha256', digest]
            calls = []
            def cli(command, **kw):
                calls.append((command, kw))
                self.assertEqual(kw['env']['OPENCODE_MODELS_PATH'], str(catalog))
                self.assertEqual(kw['env']['OPENCODE_DISABLE_MODELS_FETCH'], 'true')
                if command[1] == 'models':
                    self.assertNotEqual(kw['env']['ZHIPU_API_KEY'], 'fixture-key')
                    return subprocess.CompletedProcess(command, 0, 'zai-coding-plan/glm-5.4\n', '')
                self.assertIn('--print-logs', command)
                self.assertEqual(kw['env']['ZHIPU_API_KEY'], 'fixture-key')
                self.assertEqual(kw['cwd'], calls[0][1]['cwd'])
                return subprocess.CompletedProcess(command, 1, '', 'failure fixture-key Bearer other-secret')
            with patch.object(sys, 'argv', args), patch.dict(os.environ, {'ZHIPU_API_KEY': 'fixture-key'}):
                with patch.object(audit.subprocess, 'run', side_effect=cli):
                    with self.assertRaisesRegex(RuntimeError, 'audit failed'):
                        audit.main()
                self.assertEqual(len(calls), 2)
                self.assertEqual(json.loads((root / 'catalog.json').read_text())['sha256'], digest)
                diagnostics = (root / 'opencode-stderr.log').read_text()
                self.assertIn('failure [REDACTED]', diagnostics)
                self.assertNotIn('fixture-key', diagnostics)
                self.assertNotIn('other-secret', diagnostics)

                with patch.object(audit.subprocess, 'run',
                                  return_value=subprocess.CompletedProcess([], 0, 'zai-coding-plan/glm-5.3', '')) as run:
                    with self.assertRaisesRegex(RuntimeError, 'unavailable'):
                        audit.main()
                    self.assertEqual(run.call_count, 1)
                    self.assertEqual(run.call_args.args[0][1], 'models')

                catalog.write_text(catalog.read_text() + ' ')
                with patch.object(audit.subprocess, 'run') as run:
                    with self.assertRaisesRegex(RuntimeError, 'SHA-256 mismatch'):
                        audit.main()
                    run.assert_not_called()

    def test_packet_report_extracts_one_object_and_preserves_original_response(self):
        row = dict(id='q1', status='PASS', reason='Valid {evidence}', recommendation='No changes')
        raw = json.dumps({'results': [row]})
        examples = (raw, f'\n  {raw}\n', f'```json\n{raw}\n```',
                    f'Готовый результат.\n\n{raw}', f'Готовый результат.\n~~~JSON\n{raw}\n~~~')
        for answer in examples:
            events = '\n'.join([
                json.dumps({'type': 'text', 'part': {'text': answer}}),
                json.dumps({'type': 'step_finish', 'part': {'reason': 'stop'}}),
            ])
            with self.subTest(answer=answer):
                result = audit.audit_result(events, expected_ids=['q1'])
                self.assertEqual(result['status'], 'completed')
                self.assertEqual(result['results'], [row])
                self.assertEqual(result['final_response'], answer)

    def test_packet_report_rejects_bad_boundaries_and_duplicate_keys(self):
        row = dict(id='q1', status='PASS', reason='Valid', recommendation='No changes')
        raw = json.dumps({'results': [row]})
        for answer in (raw[:-1], f'{raw}\n{raw}', f'{raw}\nИтог', f'{{broken\n{raw}',
                       f'[{raw}]', f'```json\n{raw}', f'```text\n{raw}\n```',
                       f'```json\n{raw}\n```\n```json\n{raw}\n```',
                       raw.replace('"id": "q1"', '"id": "q0", "id": "q1"')):
            with self.subTest(answer=answer):
                self.assertIsNone(audit.packet_results(answer, ['q1']))
        self.assertIsNone(audit.packet_results(json.dumps({'results': [row, row]}), ['q1', 'q1']))

"""Offline designer contracts: real PNG intake, fake CAS and provider only."""
import base64
from dataclasses import replace
from datetime import datetime, timezone
import io
import json
import os
from tempfile import TemporaryDirectory
from pathlib import Path
import unittest
from unittest.mock import patch

from test_agent_runtime import FakeAPI
from agent_runtime import budget, designer as d
from agent_runtime.designer_intake import load_package
try:
    from PIL import Image
except ImportError:
    Image = None


@unittest.skipIf(Image is None, "Pillow is required for actual PNG/JPEG fixtures")
class Designer(unittest.TestCase):
    def setUp(self):
        temp = TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.path = Path(temp.name)
        source = 'e' * 40
        self.now = datetime(2026, 11, 28, 23, 59, tzinfo=timezone.utc)
        self.api = FakeAPI()
        self.calls = []
        self.p = {**dict.fromkeys(d.EVIDENCE, 'a'*64), 'kind': d.MODE, 'model': 'gemini-example',
            'expires_utc': '2026-12-02T00:00:00Z', 'native_input_tokens': 100000,
            'native_output_tokens': 32768, 'round_output_tokens': 24000, 'max_billed_thought_tokens': 8192,
            'task_micro_usd': 1_000_000, 'daily_micro_usd': 2_000_000, 'max_request_bytes': 8_000_000,
            'max_raw_file_bytes': 2_000_000, 'max_image_pixels': 10_000_000,
            'timeout_seconds': 240, 'input_margin_bps': 11000, 'count_request_max_micro': 5,
            d.RATES[0]: '1.25', d.RATES[1]: '8.0'}
        profile = d.data_json(self.p)
        (self.path/'profile.json').write_bytes(profile)
        self.profile_sha = d.digest(profile)
        self.assertEqual(d.load_profile(self.path/'profile.json', self.profile_sha, self.now), self.p)
        images = []
        for label, fmt, mime in [('wide', 'PNG', 'image/png'), ('touch', 'JPEG', 'image/jpeg')]:
            path = label + '.' + fmt.lower()
            im = io.BytesIO()
            Image.new('RGB', (4, 5), (17, 155, 200)).save(im, format=fmt)
            (self.path/path).write_bytes(im.getvalue())
            images.append(dict(label=label, path=path, mime_type=mime, source_sha=source, sha256=d.digest(im.getvalue())))
        brief = b'Make section headings easier to scan.'
        manifest = d.data_json(dict(version=1, task_id='sample', round_id='round-1', source_sha=source,
            context=[], images=images, brief=brief.decode()))
        (self.path/'manifest.json').write_bytes(manifest)
        self.pkg = load_package(self.path, d.digest(manifest), 2_000_000, 10_000_000, 8_000_000)
        self.report = dict(image_observations=[dict(label=x, observation='Headings need contrast.') for x in ('wide','touch')],
            proposals=[dict(title='Spacing', change='Group key facts.', rationale='Clear reading order.', how_to_verify='Check mobile.')],
            next_iteration='Review contrasting layouts.')
        self.generation = dict(candidates=[dict(finishReason='STOP', content={'parts':[
            {'text':'Private draft thoughts', 'thought':True}, {'text':d.data_json(self.report).decode()}]})],
            usageMetadata=dict(promptTokenCount=3078, candidatesTokenCount=900, thoughtsTokenCount=200, totalTokenCount=4178))
        self.error = None
        self.count_body = b'{"totalTokens":3072}'

    def post(self, model, method, raw, timeout, limit):
        self.calls.append((method, json.loads(raw)))
        is_count = method == 'countTokens'
        ledger = d.DesignerLedger(self.api)
        reserved, = [row for row in ledger.entries.values() if row['status']=='reserved']
        self.assertEqual(reserved['method'], method)
        self.assertEqual(d.digest(raw), reserved['count_request_sha256' if is_count else 'request_sha256'])
        self.assertTrue(reserved['held_micro'] > 0)
        if not is_count and self.error:
            raise self.error
        return self.count_body if is_count else d.data_json(self.generation)

    def run_current(self, clock=None, pkg=None, credentials=()):
        return d.run_round(pkg or self.pkg, self.p, self.profile_sha, self.api, self, clock or (lambda:self.now), credentials)

    def test_same_pinned_media_and_large_config_with_preexisting_holds(self):
        result = self.run_current()
        counted, generated = [call[1] for call in self.calls]
        self.assertEqual(counted, {'generateContentRequest':{'model':'models/gemini-example', **generated}})
        self.assertEqual(generated['generationConfig']['maxOutputTokens'], 24000)
        self.assertNotIn('tools', generated)
        sent = [p['inlineData'] for p in generated['contents'][0]['parts'] if 'inlineData' in p]
        self.assertEqual([base64.b64decode(p['data']) for p in sent], [a.data for a in self.pkg.images])
        self.assertTrue(all(p['mimeType']=='image/png' for p in sent))
        self.assertEqual(result['report'], self.report)
        self.assertNotIn('Private draft thoughts', str(result))
        rows = list(d.DesignerLedger(self.api).entries.values())
        self.assertEqual([r['status'] for r in rows], ['answered','answered'])
        self.assertGreater(rows[1]['reserved_micro'], rows[1]['held_micro'])
        self.assertNotIn('Make section headings', str(rows))
        self.assertNotIn(sent[0]['data'], str(rows))
        self.assertEqual(len(self.calls), 2)
        self.assertEqual(self.run_current(pkg=replace(self.pkg, round_id='round-2'))['report'], self.report)
        self.assertEqual(len(self.calls), 4)
        self.assertEqual(budget.DailyLedger(self.api,'2026-11-28').branch, 'agents/budgets/kimi-2026-11-28')
        self.assertEqual(budget.DailyLedger(self.api,'2026-11-28').data['kind'], 'kimi-daily-budget-v1')

    def test_quota_prevents_send_and_never_spends_twice(self):
        self.p['task_micro_usd'] = 4
        with self.assertRaisesRegex(d.DesignerError, 'budget_exhausted'):
            self.run_current()
        self.assertEqual(self.calls, [])
        self.p['task_micro_usd'] = 10
        with self.assertRaisesRegex(d.DesignerError, 'budget_exhausted'):
            self.run_current()
        self.assertEqual(len(self.calls), 1)
        with self.assertRaisesRegex(d.DesignerError, 'no_automatic_retry'):
            self.run_current()
        self.assertEqual(len(self.calls), 1)

    def test_http_uncertainty_keeps_hold_and_blocks_new_round(self):
        self.error = d.DesignerError('provider_http_failure', 503)
        with self.assertRaisesRegex(d.DesignerError, 'HTTP 503'):
            self.run_current()
        row = list(d.DesignerLedger(self.api).entries.values())[1]
        self.assertEqual((row['status'],row['held_micro'],row['http_status']), ('uncertain',row['reserved_micro'],503))
        with self.assertRaisesRegex(d.DesignerError, 'manual_review_required'):
            self.run_current(pkg=replace(self.pkg, round_id='round-2'))
        self.assertEqual(len(self.calls), 2)

    def test_response_shape_or_credential_never_released(self):
        self.report['next_iteration']='SyntheticCredentialMarkerUsedOnlyByTests'
        self.generation['candidates'][0]['content']['parts'][1]['text'] = d.data_json(self.report).decode()
        with self.assertRaisesRegex(d.DesignerError, 'credential_material_rejected') as exc:
            self.run_current(credentials=(self.report['next_iteration'],))
        self.assertNotIn(self.report['next_iteration'], str(exc.exception))
        self.assertNotIn(self.report['next_iteration'], str(d.DesignerLedger(self.api).entries))
        bad = d.data_json({'candidates':[{'finishReason':'STOP','content':{'parts':[{'functionCall':{'name':'unsafe'}}]}}]})
        with self.assertRaisesRegex(d.DesignerError, 'non_text_or_tool_response_rejected'):
            d.report_json(bad, ['wide','touch'], ())

    def test_metadata_credentials_fail_before_any_ledger_access_or_send(self):
        credential = 'SyntheticLedgerMarkerWithoutProviderPrefix'
        encoded = base64.urlsafe_b64encode(credential.encode()).decode().rstrip('=')
        self.assertNotEqual(credential, encoded)
        cases = [
            (replace(self.pkg, task_id=credential), self.profile_sha),
            (replace(self.pkg, round_id=encoded), self.profile_sha),
            (self.pkg, 'e' * 64),  # Valid digest shape, but exact credential.
        ]
        for (pkg, profile_sha), secret in zip(cases, (credential, credential, 'e' * 64)):
            with self.subTest(field=pkg is self.pkg, encoded=pkg.round_id == encoded):
                with self.assertRaisesRegex(d.DesignerError, '^credential_material_rejected$') as exc:
                    d.run_round(pkg, self.p, profile_sha, self.api, self, lambda: self.now, (secret,))
                self.assertNotIn(secret, str(exc.exception))
                self.assertEqual(self.api.calls, [])
                self.assertEqual(self.api.blobs, {})
                self.assertEqual(self.calls, [])

    def test_full_cli_release_gate_and_positive_round_with_mock_network(self):
        key = 'MockGeminiProtectedCLIKeyNotReal'
        release_data = d.data_json(dict(kind=d.designer_release.KIND, main_sha='1'*40,
            source_sha=self.pkg.source_sha, project_binding=self.p['project_binding'],
            profile_sha256=self.profile_sha, manifest_sha256=self.pkg.metadata.manifest_sha256,
            provider_key_sha256=d.digest(key.encode()), expires_utc='2026-12-01T00:00:00Z'))
        release_path = self.path/'approval.json'
        release_path.write_bytes(release_data)
        release_path.chmod(0o600)
        args = ['--package', str(self.path), '--profile', str(self.path/'profile.json'),
                '--report', str(self.path/'private.json'), '--manifest-sha256', self.pkg.metadata.manifest_sha256,
                '--release', str(release_path)]
        env = {'NETOPS_GEMINI_DESIGNER_ENABLED':'true',
               'NETOPS_GEMINI_DESIGNER_RELEASE_SHA256':d.digest(release_data),
               'GH_TOKEN':'MockScopedLedgerCredential'}
        run_round = d.run_round
        load_profile = d.load_profile
        load_release = d.designer_release.load_release
        with patch.dict(os.environ, env), patch.object(d, 'DESIGNER_TRANSPORT_RELEASED', True), \
             patch.object(d, 'load_profile', side_effect=lambda *a: load_profile(*a, now=self.now)), \
             patch.object(d.designer_release, 'load_release', side_effect=lambda *a: load_release(*a, now=self.now)), \
             patch.object(d.designer_release, 'verify_checkout') as verify, \
             patch.object(d.designer_release, 'LedgerGitHub', return_value=self.api) as ledger, \
             patch.object(d, 'Transport', return_value=self) as transport, \
             patch.object(d, 'run_round', side_effect=lambda *a, **kw: run_round(*a, clock=lambda:self.now, **kw)), \
             patch('sys.stdout', new_callable=io.StringIO) as output:
            with patch.dict(os.environ, {'GEMINI_API_KEY':'wrong-key'}):
                self.assertEqual(d.main(args), 1)
            self.assertEqual(output.getvalue(), 'release_profile_project_key_or_media_mismatch\n')
            verify.assert_not_called()
            ledger.assert_not_called()
            transport.assert_not_called()
            self.assertEqual(self.calls, [])
            with patch.dict(os.environ, {'GEMINI_API_KEY':key}), \
                 patch.object(d.designer_release, 'verify_checkout', side_effect=d.designer_release.ReleaseError(
                     'trusted_main_checkout_mismatch')):
                self.assertEqual(d.main(args), 1)
            ledger.assert_not_called()
            transport.assert_not_called()
            with patch.dict(os.environ, {'GEMINI_API_KEY':key}):
                self.assertEqual(d.main(args), 0)
            verify.assert_called_once()
            self.assertEqual(verify.call_args.args[1], '1'*40)
            ledger.assert_called_once_with(env['GH_TOKEN'])
            transport.assert_called_once_with(key)
        self.assertEqual([x[0] for x in self.calls], list(d.METHODS))
        saved = self.path/'private.json'
        self.assertEqual(saved.stat().st_mode & 0o777, 0o600)
        self.assertEqual(json.loads(saved.read_bytes())['report'], self.report)
        self.assertNotIn(key, saved.read_text())

    def test_entry_screens_both_credentials_before_recording(self):
        package_id = 'SyntheticAdministrativeCredentialForStorage'
        args = ['--package', str(self.path), '--profile', str(self.path/'profile.json'),
                '--report', str(self.path/'private.json'), '--manifest-sha256', self.pkg.metadata.manifest_sha256,
                '--release', str(self.path/'approved.json')]
        env = {'NETOPS_GEMINI_DESIGNER_ENABLED':'true',
               'GEMINI_API_KEY':'DifferentSyntheticKeyForProvider', 'GH_TOKEN':package_id}
        release = {'profile_sha256':self.profile_sha,'manifest_sha256':self.pkg.metadata.manifest_sha256,
                   'main_sha':'1'*40}
        with patch.dict(os.environ, env), patch.object(d, 'DESIGNER_TRANSPORT_RELEASED', True), \
             patch.object(d.designer_release, 'load_release', return_value=release), \
             patch.object(d.designer_release, 'verify_round'), \
             patch.object(d.designer_release, 'verify_checkout'), \
             patch.object(d, 'load_profile', return_value=self.p), \
             patch.object(d, 'load_package', return_value=replace(self.pkg, task_id=package_id)), \
             patch.object(d.designer_release, 'LedgerGitHub', return_value=self.api), \
             patch.object(d, 'Transport', return_value=self), \
             patch('sys.stdout', new_callable=io.StringIO) as output:
            # Patch run_round's clock argument here; its default function was bound at import.
            run = d.run_round
            with patch.object(d, 'run_round', side_effect=lambda *a, **kw: run(*a, clock=lambda: self.now, **kw)):
                self.assertEqual(d.main(args), 1)
        self.assertEqual(output.getvalue(), 'credential_material_rejected\n')
        self.assertEqual(self.api.calls, [])
        self.assertEqual(self.api.blobs, {})
        self.assertEqual(self.calls, [])
        self.assertFalse((self.path/'private.json').exists())

    def test_individual_metering_mismatch_blocks_project(self):
        self.generation['usageMetadata'].update(thoughtsTokenCount=10000, totalTokenCount=13978)
        with self.assertRaisesRegex(d.DesignerError, 'provider_usage_outside_verified_profile'):
            self.run_current()
        row = list(d.DesignerLedger(self.api).entries.values())[1]
        self.assertTrue(row['metering_mismatch'])
        with self.assertRaisesRegex(d.DesignerError, 'project_metering_mismatch'):
            self.run_current(pkg=replace(self.pkg, task_id='another'))

    def test_two_dates_and_private_non_overwriting_report(self):
        timestamps = iter([self.now, self.now.replace(day=29, hour=0, minute=1)])
        result = self.run_current(clock=lambda:next(timestamps))
        self.assertEqual([r['utc_day'] for r in d.DesignerLedger(self.api).entries.values()], ['2026-11-28','2026-11-29'])
        output = self.path/'private.json'
        d.write_private_report(output, result)
        self.assertEqual(output.stat().st_mode & 0o777, 0o600)
        frozen = output.read_bytes()
        with self.assertRaisesRegex(d.DesignerError, 'do_not_rerun'):
            d.write_private_report(output, {'other': True})
        self.assertEqual(output.read_bytes(), frozen)

    def test_disabled_before_even_reading_profile_or_creating_transport(self):
        with patch.object(d, 'load_profile') as read_profile, patch.object(d, 'Transport') as transport:
            with patch.dict(os.environ, {'NETOPS_GEMINI_DESIGNER_ENABLED': 'true'}):
                self.assertEqual(d.main(['--package','.', '--profile','missing', '--report','fake', '--manifest-sha256','a'*64]),1)
        read_profile.assert_not_called()
        transport.assert_not_called()

import json
from pathlib import Path
from datetime import datetime, timezone
import subprocess
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch, MagicMock
from agent_runtime import designer_release as r

NOW = datetime(2026, 11, 28, tzinfo=timezone.utc)
MODEL_KEY = 'MockGeminiCredentialNotForLiveUse'
APPROVAL = dict(kind=r.KIND, main_sha='1'*40, source_sha='2'*40,
                profile_sha256='a'*64, manifest_sha256='b'*64, project_binding='c'*64,
                provider_key_sha256=r.digest(MODEL_KEY.encode()), expires_utc='2026-11-29T00:00:00Z')


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.path = self.root/'approval.json'

    def record(self, raw=None):
        if raw is None:
            raw = json.dumps(APPROVAL).encode()
        self.path.write_bytes(raw)
        self.path.chmod(0o600)
        return r.digest(raw)

    def test_exact_private_expiring_record(self):
        digest = self.record()
        self.assertEqual(r.load_release(self.path, digest, NOW), APPROVAL)
        for value, now in [('d'*64, NOW), (digest, datetime(2026, 11, 29, tzinfo=timezone.utc))]:
            with self.assertRaisesRegex(r.ReleaseError, 'private_release_invalid_or_expired'):
                r.load_release(self.path, value, now)

    def test_duplicate_public_symlink_and_non_file_rejected(self):
        raw = json.dumps(APPROVAL).encode().replace(b'{',b'{"kind":"duplicate",',1)
        with self.assertRaises(r.ReleaseError):
            r.load_release(self.path, self.record(raw), NOW)
        h = self.record()
        self.path.chmod(0o644)
        with self.assertRaises(r.ReleaseError):
            r.load_release(self.path, h, NOW)
        self.path.chmod(0o600)
        link = self.root/'link'
        link.symlink_to(self.path)
        for p in (link,self.root):
            with self.assertRaises(r.ReleaseError):
                r.load_release(p, h, NOW)

    def test_project_key_profile_and_exact_image_package(self):
        p = {'project_binding': APPROVAL['project_binding']}
        m = SimpleNamespace(source_sha=APPROVAL['source_sha'],
                            metadata=SimpleNamespace(manifest_sha256=APPROVAL['manifest_sha256']))
        values = (APPROVAL, p, m, APPROVAL['profile_sha256'], APPROVAL['manifest_sha256'], MODEL_KEY)
        r.verify_round(*values)
        bad_values = {1:{'project_binding':'d'*64},2:SimpleNamespace(source_sha='3'*40,metadata=m.metadata),
                      3:'d'*64,4:'e'*64,5:'WrongMockProviderCredential'}
        for i, substitute in bad_values.items():
            with self.subTest(index=i):
                corrupted = list(values)
                corrupted[i] = substitute
                with self.assertRaisesRegex(r.ReleaseError, '^release_profile_project_key_or_media_mismatch$') as exc:
                    r.verify_round(*corrupted)
                self.assertNotIn(MODEL_KEY, str(exc.exception))

    def repo(self):
        subprocess.check_call(['git','init','-q',str(self.root)])
        runtime = self.root/r.RUNTIME
        runtime.mkdir(parents=True)
        for stem in ('designer','designer_release','budget'):
            (runtime/(stem+'.py')).write_text('value = 42\n')
        def git(*args):
            return subprocess.check_output(['git','-C',str(self.root),*args])
        git('add','.')
        git('-c','user.name=Fixture','-c','user.email=fixture@example.test','commit','-qm','test fixture')
        return runtime, git('rev-parse','HEAD').decode().strip()

    def test_exact_runtime_and_anonymous_main_attestation(self):
        runtime, sha = self.repo()
        probe = MagicMock(return_value=sha)
        r.verify_checkout(self.root, sha, probe)
        probe.assert_called_once_with()
        for p in (lambda: (runtime/'budget.py').write_text('changed\n'),
                  lambda: (runtime/'unexpected.py').write_text('untracked\n'),
                  lambda: (runtime/'shadow.py').symlink_to(runtime/'budget.py'),
                  lambda: (runtime/'__pycache__').mkdir()):
            p()
            probe.reset_mock()
            with self.assertRaisesRegex(r.ReleaseError, '^trusted_main_checkout_mismatch$'):
                r.verify_checkout(self.root, sha, probe)
            probe.assert_not_called()
            for name in ('unexpected.py','shadow.py'):
                (runtime/name).unlink(missing_ok=True)
            if (runtime/'__pycache__').exists():
                (runtime/'__pycache__').rmdir()
            (runtime/'budget.py').write_text('value = 42\n')
        with self.assertRaises(r.ReleaseError):
            r.verify_checkout(self.root, sha, lambda:'a'*40)
        with self.assertRaises(r.ReleaseError):
            r.verify_checkout(self.root, 'b'*40, lambda:sha)

    def test_fixed_tls_origin_and_no_authorization_header(self):
        doc = json.dumps({'ref':'refs/heads/main','object':{'type':'commit','sha':'b'*40}}).encode()
        opener = MagicMock()
        response = opener.open.return_value.__enter__.return_value
        response.read.return_value = doc
        response.status = 200
        with patch.object(r.urllib.request, 'build_opener', return_value=opener) as builder:
            self.assertEqual(r.remote_main(), 'b'*40)
            handlers = builder.call_args.args
            self.assertEqual(handlers[0].proxies, {})
            self.assertIsInstance(handlers[1],r.NoRedirect)
        req = opener.open.call_args.args[0]
        self.assertEqual(req.full_url,r.MAIN_URL)
        self.assertEqual(dict(req.header_items()),{'Accept':'application/vnd.github+json'})
        with self.assertRaisesRegex(r.ReleaseError, '^trusted_main_unavailable$'):
            r.NoRedirect().redirect_request(None, None, 307, None, None, 'https://example.test')

    def test_only_private_report_directory(self):
        self.root.chmod(0o700)
        r.private_directory(self.root)
        alias = self.root/'alias'
        alias.symlink_to(self.root)
        with self.assertRaises(r.ReleaseError):
            r.private_directory(alias)
        self.root.chmod(0o755)
        with self.assertRaises(r.ReleaseError):
            r.private_directory(self.root)
        self.root.chmod(0o700)

    def test_ledger_never_writes_main_or_uses_redirect_or_proxy(self):
        with patch.object(r.urllib.request,'build_opener') as builder:
            opener = builder.return_value
            response = opener.open.return_value.__enter__.return_value
            response.status = 200
            response.read.return_value = b'{"sha":"dummy"}'
            ledger = r.LedgerGitHub('fake-gh-token')
        for method, endpoint, body in (
            ('PATCH','/git/refs/heads/main',{'force':False}),
            ('PATCH','/git/refs/heads/'+r.LEDGER_REF,{'force':True}),
            ('POST','/git/refs',{'ref':'refs/heads/main'}),
            ('GET','/issues/589',None),
        ):
            with self.assertRaisesRegex(r.ReleaseError, '^ledger_endpoint_not_allowed$'):
                ledger.request(method, endpoint, body)
        opener.open.assert_not_called()
        ledger.request('PATCH','/git/refs/heads/'+r.LEDGER_REF,{'sha':'a'*40,'force':False})
        req = opener.open.call_args.args[0]
        self.assertEqual(req.full_url,r.GITHUB_ROOT+'/git/refs/heads/'+r.LEDGER_REF)
        self.assertEqual(req.get_header('Authorization'),'Bearer fake-gh-token')
        self.assertEqual(builder.call_args.args[0].proxies,{})
        self.assertIsInstance(builder.call_args.args[1],r.NoRedirect)

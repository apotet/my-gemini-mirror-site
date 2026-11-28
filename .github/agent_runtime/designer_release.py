"""Private launch approval and trusted-main verification for Gemini Designer."""
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import urllib.error
import urllib.request
from datetime import datetime, timezone
from . import storage

GITHUB_ROOT = 'https://api.github.com/repos/apotet/my-gemini-mirror-site'
MAIN_URL = GITHUB_ROOT + '/git/ref/heads/main'
LEDGER_REF = 'agents/budgets/gemini-designer-global'
HEX40 = re.compile(r'[0-9a-f]{40}\Z')
HEX64 = re.compile(r'[0-9a-f]{64}\Z')
PINS = ('profile_sha256', 'manifest_sha256', 'project_binding', 'provider_key_sha256')
FIELDS = set(PINS + ('kind', 'main_sha', 'source_sha', 'expires_utc'))
KIND = 'netops-gemini-designer-release-v1'
RUNTIME = '.github/agent_runtime'


class ReleaseError(ValueError):
    """Fixed diagnostic. Never includes file paths, JSON content or credentials."""


def digest(data):
    return hashlib.sha256(data).hexdigest()


def unique_object(pairs):
    result = {}
    for k, v in pairs:
        if k in result:
            raise ValueError
        result[k] = v
    return result


def load_release(path, expected_sha, now=None):
    try:
        if not HEX64.fullmatch(expected_sha):
            raise ValueError
        fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
        with os.fdopen(fd, 'rb') as f:
            info = os.fstat(f.fileno())
            if not stat.S_ISREG(info.st_mode) or info.st_mode & 0o077 or info.st_uid != os.getuid():
                raise ValueError
            raw = f.read(8193)
        if len(raw) > 8192 or not hmac.compare_digest(digest(raw), expected_sha):
            raise ValueError
        p = json.loads(raw.decode('utf-8'), object_pairs_hook=unique_object)
        if not isinstance(p, dict) or set(p) != FIELDS or p['kind'] != KIND:
            raise ValueError
        if not all(HEX64.fullmatch(p[x]) for x in PINS):
            raise ValueError
        if not all(HEX40.fullmatch(p[x]) for x in ('main_sha','source_sha')):
            raise ValueError
        until = datetime.strptime(p['expires_utc'], '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
        if (now or datetime.now(timezone.utc)) >= until:
            raise ValueError
        return p
    except (OSError, ValueError, TypeError, KeyError, RecursionError, AttributeError):
        raise ReleaseError('private_release_invalid_or_expired') from None


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        raise ReleaseError('trusted_main_unavailable')


def private_directory(path):
    try:
        info = Path(path).lstat()
        if not stat.S_ISDIR(info.st_mode) or info.st_mode & 0o077 or info.st_uid != os.getuid():
            raise ValueError
    except (OSError, ValueError):
        raise ReleaseError('report_directory_not_private') from None


class LedgerGitHub(storage.GitHub):
    """Fixed Git Data operations only; neither credential follows a redirect."""
    def __init__(self, credential):
        self._credential = credential
        self._opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())

    def request(self, method, endpoint, data=None):
        read = (endpoint == '/git/ref/heads/' + LEDGER_REF or
                re.fullmatch(r'/git/(?:commits|trees|blobs)/[a-f0-9]{40}', endpoint))
        create = (endpoint in ('/git/blobs', '/git/trees', '/git/commits') or
                  (endpoint == '/git/refs' and data and data.get('ref') == 'refs/heads/' + LEDGER_REF))
        update = endpoint == '/git/refs/heads/' + LEDGER_REF and data and data.get('force') is False
        if not ((method == 'GET' and read and data is None) or (method == 'POST' and create)
                or (method == 'PATCH' and update)):
            raise ReleaseError('ledger_endpoint_not_allowed')
        try:
            req = urllib.request.Request(GITHUB_ROOT + endpoint, method=method,
                data=None if data is None else json.dumps(data).encode('utf-8'),
                headers={'Authorization':'Bearer '+self._credential,
                         'Accept':'application/vnd.github+json', 'Content-Type':'application/json'})
            with self._opener.open(req, timeout=20) as response:
                if response.status == 204:
                    return None
                raw = response.read(10_000_001)
                if len(raw) > 10_000_000:
                    raise ValueError
                return json.loads(raw.decode('utf-8'), object_pairs_hook=unique_object)
        except urllib.error.HTTPError as exc:
            exc.close()
            raise storage.APIError(exc.code,method,endpoint) from None
        except (OSError, ValueError):
            raise ReleaseError('ledger_transport_unavailable') from None


def remote_main():
    try:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
        req = urllib.request.Request(MAIN_URL, headers={'Accept': 'application/vnd.github+json'})
        with opener.open(req, timeout=10) as response:
            if response.status != 200:
                raise ValueError
            raw = response.read(8193)
        doc = json.loads(raw.decode('utf-8'), object_pairs_hook=unique_object)
        if len(raw) > 8192 or doc['ref'] != 'refs/heads/main' or doc['object']['type'] != 'commit':
            raise ValueError
        sha = doc['object']['sha']
        if not HEX40.fullmatch(sha):
            raise ValueError
        return sha
    except (OSError, ValueError, TypeError, KeyError, AttributeError):
        raise ReleaseError('trusted_main_unavailable') from None


def verify_checkout(root, expected, get_main=remote_main):
    """Pin exact committed runtime bytes and the actual main branch via HTTPS."""
    try:
        if not HEX40.fullmatch(expected):
            raise ValueError
        root = Path(root).resolve(strict=True)
        # No credentials, GIT_* controls or inherited operator shell config for git.
        env = {'PATH': '/usr/bin:/bin', 'HOME': '/nonexistent',
               'GIT_CONFIG_NOSYSTEM': '1', 'GIT_CONFIG_GLOBAL': '/dev/null'}
        def git(*args):
            return subprocess.check_output(['/usr/bin/git', '--no-replace-objects', '-C', str(root), *args],
                                           env=env, stderr=subprocess.DEVNULL, timeout=10)
        if git('rev-parse', '--show-toplevel').decode().strip() != str(root):
            raise ValueError
        if git('rev-parse', 'HEAD').decode().strip() != expected:
            raise ValueError
        records = git('ls-tree', '-r', '-z', expected, '--', RUNTIME).split(b'\0')
        tracked = {}
        for record in filter(None, records):
            meta, raw_path = record.split(b'\t', 1)
            path = raw_path.decode()
            if not path.endswith('.py'):
                continue
            mode, kind, blob = meta.decode().split()
            if kind != 'blob' or mode not in ('100644','100755') or not HEX40.fullmatch(blob):
                raise ValueError
            tracked[path] = blob
        if not {RUNTIME + '/designer.py', RUNTIME + '/designer_release.py'} <= tracked.keys():
            raise ValueError
        directory = root / RUNTIME
        if directory.is_symlink() or directory.parent.is_symlink():
            raise ValueError
        actual = set()
        for file in directory.rglob('*'):
            if file.is_symlink() or file.suffix == '.pyc' or file.name == '__pycache__':
                raise ValueError
            if file.suffix != '.py':
                continue
            rel = file.relative_to(root).as_posix()
            if not file.is_file() or rel not in tracked or file.read_bytes() != git('cat-file', 'blob', tracked[rel]):
                raise ValueError
            actual.add(rel)
        if actual != tracked.keys() or get_main() != expected:
            raise ValueError
    except ReleaseError:
        raise
    except (OSError, subprocess.SubprocessError, ValueError, TypeError, AttributeError):
        raise ReleaseError('trusted_main_checkout_mismatch') from None


def verify_round(release, profile, package, profile_sha, manifest_sha, provider_key):
    if (not provider_key
        or release['project_binding'] != profile['project_binding']
        or release['profile_sha256'] != profile_sha
        or release['manifest_sha256'] != manifest_sha
        or release['manifest_sha256'] != package.metadata.manifest_sha256
        or release['source_sha'] != package.source_sha
        or not hmac.compare_digest(release['provider_key_sha256'], digest(provider_key.encode('utf-8')))):
        raise ReleaseError('release_profile_project_key_or_media_mismatch')

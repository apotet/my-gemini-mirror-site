"""Single-use, synthetic-only Gemini developer pilot; separate from DEV transport."""
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass

from . import core, policy, providers, sandbox
from .storage import GitHub, Ledger, Repository, REPOSITORY

KEY = 'manual-4e45544f505350494c4f5431'
TARGET = 'docs/gemini-dev-pilot.md'
PROMPT = ('Fictional example: a small observatory has two imaginary switches, A and B. '
          'Write a short Markdown note about checking their connection. Return ONLY a JSON object '
          'with status "complete" and files containing exactly one write operation: '
          '{"path":"docs/gemini-dev-pilot.md","content":"<Markdown>"}; no other fields.')
TIMEOUT = 60
MAX_REQUEST_BYTES = 4096
MAX_RESPONSE_BYTES = 65536
MAX_OUTPUT_TOKENS = 2048


@dataclass(frozen=True)
class Pilot:
    key: str
    target: str
    prompt: str
    provider: str
    model: str
    branch: str
    enabled: str
    verified: str
    confirmation: str


FLASH = Pilot(KEY, TARGET, PROMPT, 'gemini', 'gemini-3.8-flash', 'gemini/synthetic-pilot',
              'NETOPS_GEMINI_PILOT_ENABLED', 'NETOPS_GEMINI_DEV_PROVIDER_VERIFIED',
              'one-synthetic-request')
HYDROGEN_TARGET = 'docs/hydrogen-dev-pilot.md'
HYDROGEN = Pilot(
    'manual-485944524f47454e50494c31', HYDROGEN_TARGET,
    ('Fictional example: a small observatory has two imaginary switches, A and B. '
     'Write a short Markdown note about checking their connection. Return ONLY a JSON object '
     'with status "complete" and files containing exactly one write operation: '
     '{"path":"docs/hydrogen-dev-pilot.md","content":"<Markdown>"}; no other fields.'),
    'hydrogen', 'gemini-4-hydrogen', 'hydrogen/synthetic-pilot',
    'NETOPS_HYDROGEN_PILOT_ENABLED', 'NETOPS_HYDROGEN_PROVIDER_VERIFIED',
    'one-hydrogen-synthetic-request')


def authorize(profile=FLASH):
    if profile is not FLASH and profile is not HYDROGEN:
        raise ValueError('Unknown pilot profile')
    if (os.environ.get('GITHUB_REPOSITORY') != REPOSITORY or
        os.environ.get('GITHUB_ACTOR') != 'apotet' or
        os.environ.get('GITHUB_REF') != 'refs/heads/main' or
        os.environ.get('GITHUB_RUN_ATTEMPT') != '1' or
        os.environ.get('GITHUB_EVENT_NAME') != 'workflow_dispatch' or
        os.environ.get(profile.enabled) != 'true' or
        os.environ.get(profile.verified) != 'true'):
        raise ValueError('Pilot not authorized or provider terms not verified')
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    if event.get('inputs', {}).get('confirmation') != profile.confirmation:
        raise ValueError('Explicit pilot confirmation required')


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise urllib.error.HTTPError(req.full_url, code, 'Redirect forbidden', headers, fp)


def transport_timeout(signum, frame):
    raise TimeoutError('Pilot total request deadline exceeded')


def transport(request, profile=FLASH):
    authorize(profile)
    expected = providers.payload(
        {'model': profile.model, 'max_output_tokens': MAX_OUTPUT_TOKENS},
        [{'role': 'user', 'content': profile.prompt}])
    if request != expected:
        raise ValueError('Pilot transport accepts only the fixed synthetic request')
    key = os.environ.get('PROVIDER_API_KEY', '')
    if not key:
        raise ValueError('Provider credential unavailable')
    data = providers.request_bytes(request)
    if len(data) > MAX_REQUEST_BYTES:
        raise ValueError('Pilot request exceeds byte limit')
    req = urllib.request.Request(providers.MODELS[profile.model].endpoint,
        data=data, headers={'Content-Type': 'application/json', 'x-goog-api-key': key},
        method='POST')
    if signal.getitimer(signal.ITIMER_REAL)[0]:
        raise ValueError('Existing request timer prevents pilot')
    previous = signal.signal(signal.SIGALRM, transport_timeout)
    try:
        signal.setitimer(signal.ITIMER_REAL, TIMEOUT)
        with urllib.request.build_opener(NoRedirect).open(req, timeout=TIMEOUT) as result:
            raw = result.read(MAX_RESPONSE_BYTES + 1)
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, previous)
    if len(raw) > MAX_RESPONSE_BYTES:
        raise ValueError('Pilot response exceeds byte limit')
    policy.safe_bytes(raw)
    result = providers.parse_gemini(raw.decode('utf-8'))
    policy.safe_value(result)
    return result


def run(api, repo, infer=None, validator=None, profile=FLASH):
    authorize(profile)
    if not os.environ.get('PROVIDER_API_KEY'):
        raise ValueError('Provider credential unavailable')
    if profile.target in repo.entries:
        raise ValueError('Pilot target already exists')
    ledger = Ledger(api, profile.provider, profile.key)
    if ledger.load() is not None:
        raise ValueError('Pilot already reserved; no repeat permitted')
    task = core.normalize({'task': profile.prompt, 'mode': 'edit',
                           'model': profile.model, 'write_paths': [profile.target],
                           'max_calls': 1, 'max_total_calls': 1,
                           'max_output_tokens': MAX_OUTPUT_TOKENS}, profile.provider)
    messages = [{'role': 'user', 'content': profile.prompt}]
    request = providers.payload(task, messages)
    request_bytes = providers.request_bytes(request)
    if len(request_bytes) > MAX_REQUEST_BYTES:
        raise ValueError('Pilot request exceeds byte limit')
    policy.safe_value(request)
    state = {'kind': 'netops-agent-v2', 'version': 2, 'provider': profile.provider,
             'key': profile.key, 'issue': None, 'task': task, 'sourceSHA': repo.source,
             'trustedSHA': repo.source, 'source_files': core.source_manifest(repo),
             'file_modes': {}, 'status': 'request_reserved', 'remaining_calls': 0,
             'calls': [{'id': 1, 'status': 'reserved', 'request_bytes': len(request_bytes),
                        'request_sha256': policy.digest(request_bytes), 'message_count': 1}],
             'messages': messages, 'overlay': {}, 'incomplete_files': [],
             'pending_text': '', 'reports': [], 'summaries': [], 'consumed_grants': [],
             'published_head': None, 'independent_acceptance': 'pending',
             'work_branch': profile.branch}
    ledger.save(state)
    try:
        response = infer(request) if infer is not None else transport(request, profile)
        if response.get('finish_reason') != 'stop':
            raise ValueError('Pilot response incomplete')
        envelope = core.strict_json(response['content'])
        if (not isinstance(envelope, dict) or set(envelope) != {'status', 'files'} or
            envelope['status'] != 'complete' or not isinstance(envelope['files'], list) or
            len(envelope['files']) != 1):
            raise ValueError('Invalid pilot response')
        item = envelope['files'][0]
        if (not isinstance(item, dict) or set(item) != {'path', 'content'} or
            item['path'] != profile.target or not isinstance(item['content'], str) or
            not item['content'].startswith('# ') or
            not 1 <= len(item['content'].encode('utf-8')) <= 4096):
            raise ValueError('Invalid pilot file')
        policy.check_response(state, response)
    except Exception as exc:
        state['status'] = 'uncertain'
        state['calls'][0]['problem'] = type(exc).__name__
        if isinstance(exc, urllib.error.HTTPError):
            state['calls'][0]['http_status'] = exc.code
        ledger.save(state)
        raise ValueError('Pilot request failed or response rejected; no retry') from None
    core.answered(state, response)
    ledger.save(state)
    validator = validator or (lambda r, s: sandbox.validate(r, s, Path.cwd() / 'node_modules'))
    core.process(state, repo, validator)
    ledger.save(state)
    if state['status'] != 'ready_for_review':
        raise ValueError('Pilot validation failed; no publication')
    core.publish_candidate(api, ledger, state)
    return state, ledger.head


def main():
    if sys.argv[1:] == []:
        profile = FLASH
    elif sys.argv[1:] == ['hydrogen']:
        profile = HYDROGEN
    else:
        raise SystemExit('Unknown pilot profile')
    try:
        authorize(profile)
        sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
        if sha != os.environ.get('GITHUB_SHA'):
            raise ValueError('Checkout does not match workflow source')
        state, head = run(GitHub(), Repository('.', sha), profile=profile)
        print(json.dumps({'source_sha': sha, 'checkpoint': head, 'status': state['status'],
                          'calls': len(state['calls']), 'usage': core.totals(state),
                          'pr_url': state['pr_url']}))
    except Exception as exc:
        print('Pilot failed:', type(exc).__name__)
        try:
            ledger = Ledger(GitHub(), profile.provider, profile.key)
            state = ledger.load()
            if state is not None:
                print(json.dumps({'checkpoint': ledger.head, 'status': state['status'],
                                  'calls': len(state['calls']),
                                  'http_status': state['calls'][-1].get('http_status'),
                                  'problem': state['calls'][-1].get('problem'),
                                  'validation_passed': (state.get('validations') or [{}])[-1].get('passed'),
                                  'usage': core.totals(state)}))
        except Exception:
            print('Pilot checkpoint unavailable')
        raise SystemExit(1) from None


if __name__ == '__main__':
    main()

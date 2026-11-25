"""Isolated OpenCode audit runner. Default path never starts a CLI or reads a key."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import tempfile

VERSION = '1.19.6'
MODELS = ('glm-5.4', 'glm-5.3')
PROVIDERS = ('zai-coding-plan', 'zai')
BUDGET_USD = 1.0
TARGET_USD = 0.20


def config(model, provider=PROVIDERS[0]):
    if provider not in PROVIDERS or model not in MODELS or (provider == 'zai' and model != 'glm-5.3'):
        raise ValueError('Unsupported model')
    cfg = {
        '$schema': 'https://opencode.ai/config.json',
        'model': f'{provider}/{model}',
        'small_model': f'{provider}/{model}',
        'enabled_providers': [provider],
        'share': 'disabled', 'autoupdate': False,
        'permission': {
            '*': 'deny',
            'read': 'allow', 'glob': 'allow', 'grep': 'allow', 'list': 'allow',
            'edit': 'deny', 'bash': 'deny', 'task': 'deny',
            'external_directory': 'deny',
        },
        'snapshot': False,
    }
    # Native OpenCode agent controls for both providers, not a billing guarantee.
    cfg['agent'] = {'audit': {'mode': 'primary', 'steps': 3}}
    return cfg


def accounting(stdout, provider):
    steps = []
    malformed = False
    for line in stdout.splitlines():
        try:
            event = json.loads(line)
        except (ValueError, TypeError):
            malformed = True
            continue
        if not isinstance(event, dict):
            malformed = True
            continue
        if event.get('type') == 'step_finish':
            part = event.get('part', {})
            steps.append(part if isinstance(part, dict) else {})
    # step_finish contains per-step deltas; do not add text/message snapshots again.
    tokens = None
    cost = None
    if steps and all(isinstance(s.get('tokens'), dict) and
                     all(isinstance(s['tokens'].get(k), (int, float)) for k in ('input', 'output', 'reasoning')) and
                     isinstance(s['tokens'].get('cache'), dict)
                     for s in steps):
        tokens = {k: sum(s['tokens'].get(k, 0) for s in steps)
                  for k in ('input', 'output', 'reasoning')}
        tokens['cache_read'] = sum(s['tokens'].get('cache', {}).get('read', 0) for s in steps)
        tokens['cache_write'] = sum(s['tokens'].get('cache', {}).get('write', 0) for s in steps)
    if steps and all(isinstance(s.get('cost'), (float, int)) for s in steps):
        cost = sum(s['cost'] for s in steps)
    return {'provider': provider, 'steps': len(steps), 'tokens': tokens,
            'opencode_cost_usd': cost if provider == 'zai' else None,
            'budget_usd': BUDGET_USD if provider == 'zai' else None,
            'budget_is_hard_cap': False,
            'target_usd': TARGET_USD if provider == 'zai' else None,
            'target_exceeded': cost > TARGET_USD if provider == 'zai' and cost is not None else None,
            'budget_exceeded': cost > BUDGET_USD if provider == 'zai' and cost is not None else None,
            'malformed_events': malformed,
            'billing_note': 'OpenCode estimate; reconcile provider bill. Missing/partial usage is unknown, never zero. Coding Plan uses quota.'}


def save_accounting(out, report, stdout, provider):
    usage = accounting(stdout, provider)
    (out / 'usage.json').write_text(json.dumps(usage, indent=2) + '\n')
    summary = '\n## Usage and cost\n\n```json\n' + json.dumps(usage, indent=2) + '\n```\n'
    report.write_text(report.read_text() + summary)
    # Only the numeric/structured accounting summary is sent to the Actions summary.
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as f:
            f.write(summary)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--model', choices=MODELS, default=MODELS[0])
    p.add_argument('--provider', choices=PROVIDERS, default=PROVIDERS[0])
    p.add_argument('--accept-api-budget-risk', action='store_true')
    p.add_argument('--paid', action='store_true')
    p.add_argument('--repo', default='.', help='Working repository checkout')
    p.add_argument('--prompt', default='opencode-prompt.txt')
    p.add_argument('--output', default='opencode-report')
    args = p.parse_args()
    out = Path(args.output).resolve()
    out.mkdir(parents=True, exist_ok=True)
    cfg = config(args.model, args.provider)
    (out / 'config.json').write_text(json.dumps(cfg, indent=2) + '\n')
    report = out / 'report.md'
    report.write_text(f'# OpenCode audit\n\nCLI: {VERSION}\nModel: {cfg["model"]}\n'
                      f'Mode: {"paid; outcome pending" if args.paid else "dry-run; no CLI, secret or model access"}\n')
    if not args.paid:
        return
    if args.provider == 'zai' and not args.accept_api_budget_risk:
        raise RuntimeError('Owner must accept API budget overrun risk; $1 is not a guaranteed cap')
    key = os.environ.get('ZHIPU_API_KEY')
    if not key:
        raise RuntimeError('Missing OpenCode credential')
    # Run native read/search tools in the checkout; isolate credentials and CLI state.
    repo = Path(args.repo).resolve()
    if not (repo / ".git").exists():
        raise RuntimeError("Repository checkout required")
    prompt = Path(args.prompt).read_text()
    if args.provider == 'zai':
        prompt += '\nFirst API test: planning budget $1 (not a guaranteed cap), aim below $0.20. Keep scope narrow, read only relevant files, return a concise audit. Do not assume these instructions enforce a dollar cap.'
    with tempfile.TemporaryDirectory(prefix='opencode-audit-') as temp:
        root = Path(temp)
        (root / 'opencode.json').write_text(json.dumps(cfg))
        env = {k: os.environ[k] for k in ('PATH', 'LANG') if k in os.environ}
        env.update(HOME=temp, XDG_CONFIG_HOME=f'{temp}/config',
                   XDG_DATA_HOME=f'{temp}/data', XDG_CACHE_HOME=f'{temp}/cache',
                   ZHIPU_API_KEY=key, OPENCODE_DISABLE_AUTOUPDATE='true',
                   OPENCODE_CONFIG=str(root / 'opencode.json'),
                   OPENCODE_PERMISSION=json.dumps(cfg['permission']))
        try:
            result = subprocess.run(['opencode', 'run', '--model', cfg['model'],
                                     '--format', 'json',
                                     '--agent', 'audit', prompt], cwd=str(repo), env=env,
                                    capture_output=True, text=True, timeout=600)
            # Never stream CLI diagnostics; redact before publishing the sole output.
            (out / 'events.jsonl').write_text(result.stdout.replace(key, '[REDACTED]'))
            report.write_text(report.read_text() + f'\nCLI exit: {result.returncode}. '
                              'No automatic retry. See events.jsonl and usage.json; OpenCode cost is an estimate, not the provider bill.\n')
            save_accounting(out, report, result.stdout.replace(key, '[REDACTED]'), args.provider)
            if result.returncode:
                raise RuntimeError('OpenCode failed; inspect artifact, do not retry automatically')
        except subprocess.TimeoutExpired as exc:
            report.write_text(report.read_text() + '\nTimeout: outcome uncertain. Do not retry.\n')
            partial = exc.stdout or ''
            if isinstance(partial, bytes):
                partial = partial.decode(errors='replace')
            partial = partial.replace(key, '[REDACTED]')
            (out / 'events.jsonl').write_text(partial)
            save_accounting(out, report, partial, args.provider)
            raise RuntimeError('OpenCode timeout; outcome uncertain') from None


if __name__ == '__main__':
    main()

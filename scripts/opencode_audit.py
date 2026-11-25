"""Isolated OpenCode audit runner. Default path never starts a CLI or reads a key."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import tempfile

VERSION = '1.19.6'
MODELS = ('glm-5.4', 'glm-5.3')


def config(model):
    if model not in MODELS:
        raise ValueError('Unsupported model')
    return {
        '$schema': 'https://opencode.ai/config.json',
        'model': f'zai-coding-plan/{model}',
        'small_model': f'zai-coding-plan/{model}',
        'enabled_providers': ['zai-coding-plan'],
        'share': 'disabled', 'autoupdate': False,
        'permission': {'*': 'deny'},
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--model', choices=MODELS, default=MODELS[0])
    p.add_argument('--paid', action='store_true')
    p.add_argument('--prompt', default='opencode-prompt.txt')
    p.add_argument('--output', default='opencode-report')
    args = p.parse_args()
    out = Path(args.output).resolve()
    out.mkdir(parents=True, exist_ok=True)
    cfg = config(args.model)
    (out / 'config.json').write_text(json.dumps(cfg, indent=2) + '\n')
    report = out / 'report.md'
    report.write_text(f'# OpenCode audit\n\nCLI: {VERSION}\nModel: {cfg["model"]}\n'
                      f'Mode: {"paid; outcome pending" if args.paid else "dry-run; no CLI, secret or model access"}\n')
    if not args.paid:
        return
    key = os.environ.get('ZHIPU_API_KEY')
    if not key:
        raise RuntimeError('Missing OpenCode credential')
    # No repo tools, plugins, project config, shell, GitHub token or secret files.
    # Context is explicitly supplied by the trusted workflow as plain prompt data.
    prompt = Path(args.prompt).read_text()
    with tempfile.TemporaryDirectory(prefix='opencode-audit-') as temp:
        root = Path(temp)
        (root / 'opencode.json').write_text(json.dumps(cfg))
        env = {k: os.environ[k] for k in ('PATH', 'LANG') if k in os.environ}
        env.update(HOME=temp, XDG_CONFIG_HOME=f'{temp}/config',
                   XDG_DATA_HOME=f'{temp}/data', XDG_CACHE_HOME=f'{temp}/cache',
                   ZHIPU_API_KEY=key, OPENCODE_DISABLE_AUTOUPDATE='true')
        try:
            result = subprocess.run(['opencode', 'run', '--model', cfg['model'],
                                     '--format', 'json', prompt], cwd=temp, env=env,
                                    capture_output=True, text=True, timeout=600)
            # Never stream CLI diagnostics; redact before publishing the sole output.
            (out / 'events.jsonl').write_text(result.stdout.replace(key, '[REDACTED]'))
            report.write_text(report.read_text() + f'\nCLI exit: {result.returncode}. '
                              'No automatic retry. See events.jsonl; usage is subscription usage, not a $0 claim.\n')
            if result.returncode:
                raise RuntimeError('OpenCode failed; inspect artifact, do not retry automatically')
        except subprocess.TimeoutExpired:
            report.write_text(report.read_text() + '\nTimeout: outcome uncertain. Do not retry.\n')
            raise RuntimeError('OpenCode timeout; outcome uncertain') from None


if __name__ == '__main__':
    main()

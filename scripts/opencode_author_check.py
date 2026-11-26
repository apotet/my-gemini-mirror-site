"""Validate the working-tree changes made by the OpenCode author before any push.

Exit 0 and write the patch only if every change is an added/modified regular file
under an allowed prefix. Anything else (deletions, renames, modes, symlinks,
workflow/script/package edits, oversized diffs) fails the run.
"""
import argparse
import subprocess
import sys
from pathlib import PurePosixPath

ALLOWED_PREFIXES = ('src/', 'docs/', 'public/lesson-images/')
MAX_FILES = 40
MAX_PATCH_BYTES = 400_000


def git(repo, *args, text=True):
    return subprocess.run(['git', '-C', repo, *args], check=True, capture_output=True, text=text).stdout


def check_paths(entries):
    """entries: (status, mode, path) tuples from `git diff --cached --raw`."""
    errors = []
    if not entries:
        errors.append('No changes produced')
    if len(entries) > MAX_FILES:
        errors.append(f'Too many files: {len(entries)} > {MAX_FILES}')
    for status, mode, path in entries:
        parts = PurePosixPath(path).parts
        if path.startswith('/') or '..' in parts or '.git' in parts:
            errors.append(f'Unsafe path: {path}')
        elif not path.startswith(ALLOWED_PREFIXES):
            errors.append(f'Path outside allowed prefixes: {path}')
        if status not in ('A', 'M'):
            errors.append(f'Only add/modify allowed, got {status}: {path}')
        if mode != '100644':
            errors.append(f'Only regular non-executable files allowed ({mode}): {path}')
    return errors


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--repo', required=True)
    p.add_argument('--patch', required=True)
    args = p.parse_args()
    git(args.repo, 'add', '-A')
    raw = git(args.repo, 'diff', '--cached', '--raw', '--no-renames', '-z')
    fields = raw.split('\0')
    entries = []
    for meta, path in zip(fields[0::2], fields[1::2]):
        if not meta:
            continue
        _, new_mode, _, _, status = meta.lstrip(':').split()[:5]
        entries.append((status[0], new_mode, path))
    errors = check_paths(entries)
    patch = git(args.repo, 'diff', '--cached', '--binary', '--no-renames', text=False)
    if len(patch) > MAX_PATCH_BYTES:
        errors.append(f'Patch too large: {len(patch)} bytes')
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        sys.exit(1)
    with open(args.patch, 'wb') as f:
        f.write(patch)
    print(f'OK: {len(entries)} file(s), {len(patch)} bytes')
    for status, _, path in entries:
        print(f'{status} {path}')


if __name__ == '__main__':
    main()

"""Require a complete model response before publishing an author patch."""
import sys
from pathlib import Path

from opencode_audit import audit_result


def main():
    report = Path(sys.argv[1])
    exit_line = (report / 'exit.txt').read_text().strip()
    if not exit_line.startswith('exit='):
        raise ValueError('Missing model exit status')
    returncode = int(exit_line.removeprefix('exit='))
    result = audit_result(
        (report / 'events.jsonl').read_text(), returncode=returncode,
        timed_out=returncode == 124, status_prefix='DEV_STATUS',
    )
    (report / 'summary.txt').write_text(result['summary'])
    if result['status'] != 'completed':
        raise SystemExit(f"Model outcome {result['status']}: {result['reason']}; no automatic retry")


if __name__ == '__main__':
    main()

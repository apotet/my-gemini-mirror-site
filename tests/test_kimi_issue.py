"""Compatibility test command: v1 caps/text-only gates were replaced by v2 invariants."""
from pathlib import Path
import subprocess
import sys
root=Path(__file__).resolve().parents[1]
raise SystemExit(subprocess.run([sys.executable,str(root/'tests/test_agent_runtime.py')],cwd=root).returncode)

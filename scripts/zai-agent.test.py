"""Compatibility test command for the active shared runtime (no paid calls)."""
from pathlib import Path
import subprocess
import sys
root=Path(__file__).resolve().parents[1]
raise SystemExit(subprocess.run([sys.executable,str(root/'tests/test_agent_runtime.py')],cwd=root).returncode)

"""Fail closed before any input reaches file IO or API."""
import os
import re
from pathlib import Path


def validate_path(value, prefix, suffix):
    path = Path(value)
    if not re.fullmatch(re.escape(prefix) + r"[a-zA-Z0-9_-]+" + re.escape(suffix), value):
        raise ValueError("Path outside allowed flat directory")
    if path.is_symlink() or any(x.is_symlink() for x in path.parents) or not path.is_file():
        raise ValueError("Expected regular existing file without symlink parents")
    return path


def main():
    validate_path(os.environ["TASK_FILE"], ".github/agent-tasks/", ".md")
    targets = os.environ["TARGET_FILES"].splitlines()
    if not 1 <= len(targets) <= 4 or len(set(targets)) != len(targets):
        raise ValueError("Expected 1..4 unique lessons")
    for target in targets:
        validate_path(target, "src/data/lessons/", ".ts")
    if os.environ["MODE"] not in ("audit-only", "edit"):
        raise ValueError("Unknown mode")
    tokens = os.environ["MAX_TOKENS"]
    if not tokens.isdecimal() or not 1024 <= int(tokens) <= 16384:
        raise ValueError("Completion budget must be 1024..16384")
    branch = os.environ["BRANCH"]
    if not re.fullmatch(r"kimi/agent-run-[a-zA-Z0-9_-]+", branch):
        raise ValueError("Only new kimi/agent-run-* branches allowed")

if __name__ == "__main__":
    main()

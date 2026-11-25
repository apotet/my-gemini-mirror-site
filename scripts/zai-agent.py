"""Compatibility entry point. The shared runtime owns all active ZAI tasks."""
from pathlib import Path
import os
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'.github'))
from agent_runtime.cli import main

if __name__=='__main__':
    os.environ['AGENT_PROVIDER']='zai'
    if sys.argv[1]=='run':sys.argv[1]='work'
    main()

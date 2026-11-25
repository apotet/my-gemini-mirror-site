"""Compatibility entry point. Active implementation is shared with ZAI."""
from pathlib import Path
import os
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from agent_runtime.cli import main

if __name__=='__main__':
    os.environ['AGENT_PROVIDER']='kimi'
    aliases={'run':'work','deliver-edit':'publish'}
    sys.argv[1]=aliases.get(sys.argv[1],sys.argv[1])
    main()

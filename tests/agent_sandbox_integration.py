"""Real complete mandatory check pipeline on the immutable baseline; no model."""
import json
from pathlib import Path
import subprocess
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'.github'))
from agent_runtime import core,sandbox
from agent_runtime.storage import Repository
repo=Repository('.',subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip())
task=core.normalize({'task':'Offline sandbox integration of unchanged baseline','mode':'edit','write_paths':['docs/']},'kimi')
state=core.initial(task,repo,'kimi','issue-999999',999999)
result=sandbox.validate(repo,state,Path('node_modules'))
print(json.dumps(result,ensure_ascii=False))
if not result['passed']:raise SystemExit(1)
print('PASS: isolated dependencies/typecheck/build/questions, model calls=0')

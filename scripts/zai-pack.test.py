"""Real #356 source coverage in v2: no fixed byte or monetary limit, no model calls."""
import json
from pathlib import Path
import subprocess
import sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.github'))
from agent_runtime import core, providers
from agent_runtime.storage import Repository

task=json.loads((ROOT/'scripts/zai-runtime/issue-356.fixture.json').read_text())
definition=json.loads(subprocess.check_output(['node','scripts/zai-lesson-resolver.mjs',task['lesson']],text=True))
task['files']=list(dict.fromkeys([definition['path'],*task['files'],'docs/DEVELOPMENT_WORKFLOW.md','src/data/questions.json']))
repo=Repository(ROOT,subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip())
state=core.initial(core.normalize(task,'zai'),repo,'zai','issue-356',356)
context=json.loads(state['messages'][-1]['content'])['files']
files={f['path']:f['content'] for f in context}
for path in task['files']:assert files[path]==repo.read(path).decode(),path
questions={q['id']:q for q in json.loads(files['src/data/questions.json'])}
assert len(definition['questionIds'])==7 and set(definition['questionIds'])<=questions.keys()
assert providers.payload(state['task'],state['messages'])['max_tokens']==131072
size=len(json.dumps(state['messages'],ensure_ascii=False).encode())
assert size>200000
print(f'PASS #356 v2: full container, full etalon, all mandatory context, 7/7 full questions; messages={size} UTF-8 bytes; native output=131072; fixed financial ceiling=none; model calls=0')

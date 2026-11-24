import os
import subprocess
import sys
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
base = dict(os.environ, TASK_FILE='.github/agent-tasks/http-status-audit.md',
            TARGET_FILES='src/data/lessons/l7-http-status-basics.ts', MODE='audit-only',
            MAX_TOKENS='16384', BRANCH='kimi/agent-run-1')
def check(changes, ok):
    result = subprocess.run([sys.executable, '.github/scripts/validate_inputs.py'],
                            cwd=root, env=dict(base, **changes), capture_output=True)
    assert (result.returncode == 0) == ok, changes
check({}, True)
for target in ['.github/workflows/ci.yml', '../x.ts', 'src/data/lessons/../../x.ts',
               'src/data/lessons/$(id).ts', '/etc/passwd']:
    check({'TARGET_FILES': target}, False)
for value in ['0', '16385', '999999999', '$(id)']:
    check({'MAX_TOKENS': value}, False)
check({'BRANCH': 'main'}, False)
check({'TASK_FILE': '.git/config'}, False)
with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)
    import json
    sse = tmp/'sse'
    sse.write_text('data: '+json.dumps({'choices':[{'delta':{'content':'Содержательный аудит. '*60}, 'finish_reason':'stop'}], 'usage':{'total_tokens':100}})+'\n\ndata: [DONE]\n')
    result = subprocess.run([sys.executable, str(root/'.github/scripts/parse_sse.py'), str(sse), str(tmp), 'unused'], env=base, capture_output=True)
    assert result.returncode == 0, result.stderr
    assert (tmp/'report.md').exists() and not (tmp/'candidate.ts').exists()
print('PASS security validation and audit-only parser')

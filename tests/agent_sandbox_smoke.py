"""Real Docker isolation check; no provider credentials and no model transport."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'.github'))
from agent_runtime.sandbox import docker_args

with tempfile.TemporaryDirectory() as tmp:
    work=Path(tmp)/'work';tools=Path(tmp)/'tools';work.mkdir();tools.mkdir()
    if os.getuid()==0:work.chmod(0o777)
    script='''const fs=require('fs');
if(process.getuid()===0)throw Error('root');
if(process.env.GH_TOKEN||process.env.PROVIDER_API_KEY||process.env.MOONSHOT_API_KEY)throw Error('credential exposed');
if(fs.existsSync('/var/run/docker.sock'))throw Error('host socket exposed');
try{fs.writeFileSync('/tools/node_modules/escape','x');throw Error('toolchain writable')}catch(e){if(e.message==='toolchain writable')throw e;}
try{fs.writeFileSync('/host-escape','x');throw Error('root writable')}catch(e){if(e.message==='root writable')throw e;}
console.log(JSON.stringify({nonroot:true,secrets:false,docker_socket:false,tools_readonly:true,root_readonly:true}));'''
    (work/'probe.cjs').write_text(script)
    result=subprocess.run(docker_args(str(work),str(tools),['node','probe.cjs']),
        env={'PATH':os.environ.get('PATH',os.defpath),'LANG':'C.UTF-8'},capture_output=True,text=True,check=True,timeout=60)
    print(result.stdout.strip())
print('PASS: real sandbox, model calls=0')

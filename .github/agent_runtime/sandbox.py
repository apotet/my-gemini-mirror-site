"""Candidate execution is confined to a credential-free, non-root container."""
import base64
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from . import policy

IMAGE = 'netops-agent-checks:local'


def docker_args(work, tools, command, network='none'):
    return ['docker','run','--rm','--network',network,'--read-only','--cap-drop','ALL',
            '--security-opt','no-new-privileges','--pids-limit','256','--memory','4g','--cpus','2',
            '--user',str(os.getuid() or 1000)+':'+str(os.getgid() or 1000),'--tmpfs','/tmp:rw,nosuid,nodev,size=512m',
            '--mount',f'type=bind,src={work},dst=/work',
            '--mount',f'type=bind,src={tools},dst=/tools/node_modules,readonly',
            '--workdir','/work','--env','CI=true','--env','npm_config_cache=/tmp/npm',
            '--env','npm_config_registry=https://registry.npmjs.org','--env','npm_config_ignore_scripts=true',IMAGE,*command]


def check_lock(work):
    lock=work/'package-lock.json'
    if not lock.exists(): raise ValueError('A reviewed lockfile is required for dependency installation')
    data=json.loads(lock.read_text())
    for package in data.get('packages',{}).values():
        resolved=package.get('resolved','')
        if resolved and not resolved.startswith('https://registry.npmjs.org/'):
            raise ValueError('Dependency source must be the npm registry; no git/file/custom credential endpoints')


def validate(repo, state, tools, runner=subprocess.run):
    logs=[]
    with tempfile.TemporaryDirectory(prefix='agent-checks-') as temp:
        work=Path(temp)
        if os.getuid()==0:work.chmod(0o777)
        # Read only validated Git blobs; never copy .git, host env, credentials or hooks.
        for name in state['source_files']:
            try: policy.path(name)
            except ValueError: continue
            data=repo.read(name)
            try: policy.safe_text(data.decode())
            except UnicodeDecodeError: pass
            target=work/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data);target.chmod(int(repo.entries[name]['mode'],8)&0o777)
        clean_env={'PATH':os.environ.get('PATH',os.defpath),'LANG':'C.UTF-8'}
        for args in [('init','-q'),('add','.'),('-c','core.hooksPath=/dev/null','-c','user.name=agent-checks','-c','user.email=checks@example.invalid','commit','-qm','sanitized baseline')]:
            runner(['git',*args],cwd=work,env=clean_env,check=True,capture_output=True,text=True)
        for name,encoded in state['overlay'].items():
            policy.scoped(name,state['task']['write_paths'])
            target=work/name
            if encoded is None:
                target.unlink(missing_ok=True)
            else:
                target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(base64.b64decode(encoded));target.chmod(int(state.get('file_modes',{}).get(name,'100644'),8)&0o777)
        clean_env={'PATH':os.environ.get('PATH',os.defpath),'LANG':'C.UTF-8'}
        runner(['git','diff','--check'],cwd=work,env=clean_env,check=True,capture_output=True,text=True)
        check_lock(work)
        commands=[('dependencies',['npm','ci','--ignore-scripts','--no-audit','--no-fund'],'bridge'),
                  ('typecheck',['node','/tools/node_modules/typescript/bin/tsc','--noEmit'],'none'),
                  ('build',['node','/tools/node_modules/vite/bin/vite.js','build','--configLoader','runner'],'none'),
                  ('questions',['node','scripts/validate-questions.mjs'],'none')]
        for name in state['task'].get('checks',[]):
            policy.path(name)
            if not name.startswith(('tests/','scripts/')) or not name.endswith(('.py','.mjs','.js')):
                raise ValueError('Extra check must be a project test file, never a host shell command')
            commands.append((name,['python3' if name.endswith('.py') else 'node',name],'none'))
        for name in state['overlay']:
            if name.startswith(('tests/','scripts/')) and (name.endswith(('.test.mjs','.test.js')) or Path(name).name.startswith('test_') and name.endswith('.py')) and state['overlay'][name] is not None:
                if name not in state['task'].get('checks',[]):
                    commands.append((name,['python3' if name.endswith('.py') else 'node',name],'none'))
        for name,argv,network in commands:
            result=runner(docker_args(str(work),str(Path(tools).resolve()),argv,network),env=clean_env,
                          capture_output=True,text=True,timeout=1800)
            logs.append({'check':name,'exit_code':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
            if result.returncode: return {'passed':False,'logs':logs}
        return {'passed':True,'logs':logs}

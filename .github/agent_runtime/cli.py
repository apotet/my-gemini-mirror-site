"""Trusted orchestration. No model-controlled host commands, checkout or endpoints."""
import copy
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
import tempfile
from . import budget, core, policy, providers, sandbox
from .storage import GitHub, Ledger, Repository, REPOSITORY, APIError

OUT=Path(os.environ.get('AGENT_OUTPUT_DIR',str(Path(os.environ.get('RUNNER_TEMP','/tmp'))/'netops-agent-output')))


def save(name,data):
    if name=='state.json':policy.check_state(data)
    else:policy.safe_value(data)
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/name).write_text(data if isinstance(data,str) else json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')


def output(name,value):
    if os.environ.get('GITHUB_OUTPUT'):
        with open(os.environ['GITHUB_OUTPUT'],'a') as f:f.write(f'{name}={value}\n')


def authorize(provider):
    if provider not in providers.DEFAULT:raise ValueError('Unknown enabled provider')
    if (os.environ.get('GITHUB_REPOSITORY')!=REPOSITORY or os.environ.get('GITHUB_ACTOR')!='apotet' or
        os.environ.get('GITHUB_REF')!='refs/heads/main' or os.environ.get('GITHUB_RUN_ATTEMPT')!='1'):
        raise ValueError('Owner/main/first activation only; use explicit continuation, not Actions rerun')
    event=json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    kind=os.environ['GITHUB_EVENT_NAME']
    if kind=='workflow_dispatch':
        if provider=='gemini':raise ValueError('Gemini developer requires an owner Issue command')
        if provider=='kimi' and str(event.get('inputs',{}).get('confirm_paid_api','')).lower()!='true':
            raise ValueError('Explicit owner paid API confirmation required')
        return event,None
    issue=event['issue'];sender=event['sender']
    if issue.get('pull_request') or issue['user']['login']!='apotet' or sender['login']!='apotet' or sender['type']!='User':
        raise ValueError('Unauthorized Issue event')
    if not issue['title'].startswith({'kimi':'[KIMI] ','zai':'[ZAI] ','gemini':'[GEMINI DEV] '}[provider]):raise ValueError('Provider prefix mismatch')
    if kind=='issues' and event.get('action')=='opened' and provider=='zai':return event,issue
    if kind=='issue_comment' and event.get('action')=='created':
        comment=event['comment']
        if comment['user']['login']!='apotet' or comment['user']['type']!='User':raise ValueError('Only coordinator may continue')
        return event,issue
    raise ValueError('Only initial creation or explicit owner continuation is supported')


def source_repo(source):
    # Fetch only the pinned source commit, never a contributor's branch/ref.
    exists=subprocess.run(['git','cat-file','-e',source+'^{commit}'],capture_output=True).returncode==0
    if not exists:subprocess.run(['git','fetch','--no-tags','origin',source],check=True,capture_output=True)
    return Repository('.',source)


def resolve_lesson(repo,selector):
    # Only the trusted main parser executes. The source commit contributes blobs,
    # never its scripts, configuration, node_modules or checkout hooks.
    parser=str(Path('scripts/zai-lesson-resolver.mjs').resolve())
    with tempfile.TemporaryDirectory(prefix='agent-lesson-source-') as temp:
        for name in repo.entries:
            if re.fullmatch(r'src/data/lessons/[^/]+\.ts',name) or name=='src/data/expertCases177.ts':
                target=Path(temp)/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(repo.read(name))
        result=subprocess.run(['node',parser,selector],cwd=temp,capture_output=True,text=True,check=True,
            env={'PATH':os.environ.get('PATH',os.defpath)})
        return json.loads(result.stdout)


def manual_task(event,provider,repo):
    inputs=event.get('inputs',{})
    if inputs.get('spec'):return core.strict_json(inputs['spec'])
    task_file=inputs.get('task_file','.github/agent-tasks/poe-injectors-fix.md')
    if not re.fullmatch(r'\.github/agent-tasks/[A-Za-z0-9_-]+\.md',task_file):raise ValueError('Invalid manual task file')
    targets=[p for p in inputs.get('target_files','src/data/lessons/l1-poe-injectors-splitters.ts').splitlines() if p]
    task={'task':policy.safe_text(repo.read(task_file).decode()),'mode':inputs.get('mode','audit-only'),
          'target_files':targets,'max_calls':int(inputs.get('max_calls','8'))}
    if inputs.get('max_tokens'):task['max_output_tokens']=int(inputs['max_tokens'])
    if inputs.get('verification')=='poe-full':task['checks']=['scripts/poe-injectors-lesson.test.mjs']
    return task


def persist(ledger,state,plan):
    plan['head']=ledger.save(state)
    save('state.json',state);save('plan.json',plan)
    save('accounting.json',core.totals(state))
    save('report.md','\n\n'.join(state['reports']))


def owned_pr(api,state):
    if state.get('published_head'):
        branch=core.work_branch(state)
        if api.ref(branch)!=state['published_head']:raise ValueError('Work branch moved; do not spend or overwrite')
        core.existing_draft(api,state,branch,state['published_head'])
    elif state.get('pr_number'):
        raise ValueError('PR checkpoint has no published head')


def prepare(provider,api=None):
    api=api or GitHub()
    event,issue=authorize(provider)
    trusted_repo=source_repo(os.environ['GITHUB_SHA'])
    repo=trusted_repo
    action='work';resume=None
    is_explicit_start=(provider in ('kimi','gemini') and os.environ['GITHUB_EVENT_NAME']=='issue_comment' and
                       event['comment']['body']=='/agent start confirm-paid-api')
    if os.environ['GITHUB_EVENT_NAME']=='issue_comment' and not is_explicit_start:
        match=re.fullmatch(r'/agent (continue|validate|publish)\s+(\{.*\})\s*',event['comment']['body'],re.S)
        if not match:raise ValueError('Expected /agent continue|validate|publish with structured JSON')
        action={'continue':'work','validate':'validate','publish':'publish'}[match[1]]
        resume=core.strict_json(match[2]);key='issue-'+str(issue['number']);grant_id=str(event['comment']['id'])
    else:
        raw=core.strict_json(issue['body']) if issue else manual_task(event,provider,repo)
        if isinstance(raw,dict) and set(raw)=={'resume'}:
            if issue is not None:raise ValueError('Issue continuations require an explicit checkpoint command')
            resume=raw['resume'];key=resume.get('task_id','');grant_id='manual-'+os.environ['GITHUB_RUN_ID']
            action=resume.get('action','work')
            if action not in ('work','validate','publish'):raise ValueError('Invalid manual continuation action')
        else:
            task=core.normalize(raw,provider)
            policy.safe_text(task['task'])
            if task.get('source_sha'):
                # Fixed repository API scope proves membership before any durable claim.
                if api.request('GET','/commits/'+task['source_sha'])['sha']!=task['source_sha']:
                    raise ValueError('Source commit did not resolve exactly in this repository')
                repo=source_repo(task['source_sha'])
            if task.get('lesson'):
                # Keep the proven Compiler API resolver, but include the FULL source file.
                if task.get('source_sha'):
                    definition=resolve_lesson(repo,task['lesson'])
                else:
                    resolved=subprocess.run(['node','scripts/zai-lesson-resolver.mjs',task['lesson']],capture_output=True,text=True,check=True,
                        env={'PATH':os.environ.get('PATH',os.defpath)})
                    definition=json.loads(resolved.stdout)
                task['context_files']=list(dict.fromkeys([definition['path'],*task['context_files'],
                    'docs/LEARNING_CONTENT_STANDARD.md','docs/DEVELOPMENT_WORKFLOW.md','src/data/questions.json']))
            key='issue-'+str(issue['number']) if issue else 'manual-'+hashlib.sha256((repo.source+json.dumps(task,sort_keys=True,ensure_ascii=False)).encode()).hexdigest()[:24]
    ledger=Ledger(api,provider,key)
    state=ledger.load()
    if resume is None:
        if state is not None:raise ValueError('Task already durably claimed; only explicit continuation is allowed')
        if issue:
            if any(any(marker in c.get('body','') for marker in (core.MARKER,*core.LEGACY_MARKERS)) for c in api.comments(issue['number'])):
                raise ValueError('Existing durable/legacy claim; never start another paid task implicitly')
        state=core.initial(task,repo,provider,key,issue['number'] if issue else None,trusted_repo)
        plan={'provider':provider,'key':key,'action':action,'sourceSHA':repo.source}
        state['active_run']=os.environ['GITHUB_RUN_ID']
        persist(ledger,state,plan) # atomic create precedes claim comment and every model call
        if issue:
            api.request('POST',f'/issues/{issue["number"]}/comments',{'body':core.MARKER+f'\nTask `{provider}/{key}` claimed. Checkpoint `{ledger.head}`. Calls granted: {task["max_calls"]}. Explicit checkpoint continuation only; no merge/deploy.'})
    else:
        if not isinstance(resume,dict) or set(resume)-{'checkpoint','calls','acknowledge_uncertain','reset_response','task_id','action','instruction','limits'}:
            raise ValueError('Invalid continuation fields')
        if state is None:raise ValueError('No v2 checkpoint; old paid tasks are not replayed')
        if state['issue']!=(issue['number'] if issue else None):raise ValueError('Task identity mismatch')
        expected=resume.get('checkpoint')
        if not isinstance(expected,str) or not re.fullmatch('[a-f0-9]{40}',expected) or expected!=ledger.head:
            raise ValueError('Stale checkpoint; grant has already been used or another writer progressed')
        if state.get('active_run') and api.request('GET','/actions/runs/'+state['active_run'])['status']!='completed':
            raise ValueError('Previous activation is still running; do not grant concurrent calls')
        owned_pr(api,state)
        for flag in ('acknowledge_uncertain','reset_response'):
            if flag in resume and type(resume[flag]) is not bool:raise ValueError('Continuation acknowledgement must be boolean')
        if 'limits' in resume:
            if action!='work':raise ValueError('Limit changes require an owner continuation')
            state=copy.deepcopy(state)
            core.update_kimi_limits(state,resume['limits'],grant_id)
        if action=='work':
            core.continue_task(state,expected,ledger.head,grant_id,resume.get('calls',0),resume.get('acknowledge_uncertain',False),resume.get('reset_response',False))
        else:
            if resume.get('calls',0)!=0:raise ValueError('Metadata continuation cannot grant/spend calls')
            if grant_id in state['consumed_grants']:raise ValueError('Continuation already consumed')
            state['consumed_grants'].append(grant_id)
            if action=='publish' and state['status'] not in ('ready_for_review','published_draft'):
                raise ValueError('Publish requires completed mandatory checks')
            if action=='publish':state['status']='ready_for_review'
        if resume.get('instruction'):
            if not isinstance(resume['instruction'],str):raise ValueError('Coordinator instruction must be text')
            state['messages'].append({'role':'user','content':policy.safe_text(resume['instruction'])})
        state['active_run']=os.environ['GITHUB_RUN_ID']
        plan={'provider':provider,'key':key,'action':action,'sourceSHA':state['sourceSHA']}
        persist(ledger,state,plan)
    output('action',action);output('mode',state['task']['mode']);output('source_sha',state['sourceSHA'])
    output('output_dir',str(OUT))


def load_activation(api):
    plan=json.loads((OUT/'plan.json').read_text());ledger=Ledger(api,plan['provider'],plan['key']);state=ledger.load()
    if ledger.head!=plan['head']:raise ValueError('Activation checkpoint changed; do not execute')
    return plan,ledger,state


def run_loop(provider,api=None,infer=providers.infer,validator=None,clock=time.monotonic):
    authorize(provider)
    api=api or GitHub();plan,ledger,state=load_activation(api)
    if plan['action']!='work':raise ValueError('This activation cannot call a model')
    if not os.environ.get('PROVIDER_API_KEY'):raise ValueError('Missing provider credential; no attempt made')
    repo=source_repo(state['sourceSHA'])
    trusted_repo=source_repo(state.get('trustedSHA',state['sourceSHA']))
    validator=validator or (lambda r,s:sandbox.validate(r,s,Path.cwd()/'node_modules'))
    deadline=clock()+21000 # GitHub 6h job limit minus artifact/report reserve, not a token/budget cap
    try:
        while state['status'] in ('working','processing_response','paused'):
            pending=state['calls'] and state['calls'][-1]['status']=='answered' and not state['calls'][-1].get('processed')
            if pending:
                updated=copy.deepcopy(state)
                try:core.process(updated,repo,validator,trusted_repo)
                except Exception as exc:
                    # Preserve only checked response/overlay; never repeat a paid request automatically.
                    updated['status']='paused_response_or_validation'
                    updated['problem']=type(exc).__name__
                    state=updated;persist(ledger,state,plan);break
                state=updated;persist(ledger,state,plan)
                continue
            if state['remaining_calls']<1 or deadline-clock()<300:
                state['status']='paused';persist(ledger,state,plan);break
            owned_pr(api,state)
            if provider=='kimi':
                try:
                    estimate=budget.estimate(state)
                    reservation=budget.reserve_daily(api,state,estimate)
                except budget.BudgetExceeded as exc:
                    state['status']='paused_budget'
                    state['budget_problem']=str(exc)
                    persist(ledger,state,plan)
                    break
            core.reserve(state)
            if provider=='kimi':
                state['calls'][-1]['budget_reservation']=reservation
            persist(ledger,state,plan) # irrevocable spent-attempt reservation BEFORE HTTP
            try:
                with tempfile.TemporaryDirectory(prefix='agent-call-') as call_dir:
                    response=infer(state['task'],state['messages'],Path(call_dir),max(1,int(deadline-clock()-180)))
                    policy.check_response(state,response)
            except Exception as exc:
                state['status']='uncertain'
                state['calls'][-1]['problem']=type(exc).__name__
                if isinstance(exc,providers.GeminiHTTPError):
                    state['calls'][-1]['http_status']=exc.status
                persist(ledger,state,plan);break
            core.answered(state,response);persist(ledger,state,plan)
            if provider=='kimi':
                budget.settle_daily(api,reservation,state['calls'][-1].get('cost'))
    finally:
        save('state.json',state);save('plan.json',plan);save('accounting.json',core.totals(state))
        save('report.md','\n\n'.join(state['reports']))


def validate_only(provider,api=None):
    authorize(provider)
    api=api or GitHub();plan,ledger,state=load_activation(api)
    if plan['action']!='validate' or state['incomplete_files'] or not state['overlay']:
        raise ValueError('No complete candidate for validation-only activation')
    if provider=='gemini' and not state.get('candidate_complete'):
        raise ValueError('Gemini candidate has not reached a complete response')
    repo=source_repo(state['sourceSHA'])
    result=sandbox.validate(repo,state,Path.cwd()/'node_modules')
    state.setdefault('validations',[]).append(result)
    state['status']='ready_for_review' if result['passed'] else 'paused_validation'
    persist(ledger,state,plan)


def publish(provider,api=None):
    authorize(provider)
    api=api or GitHub();plan,ledger,state=load_activation(api)
    try:
        if provider=='gemini' and plan['action']=='validate':
            raise ValueError('Gemini validation-only activation cannot publish')
        if state['status']=='ready_for_review':core.publish_candidate(api,ledger,state)
    finally:
        plan['head']=ledger.head
        save('state.json',state);save('plan.json',plan);save('accounting.json',core.totals(state))
        save('report.md','\n\n'.join(state['reports']))


def export(provider,api=None):
    authorize(provider)
    api=api or GitHub()
    if not (OUT/'state.json').exists():return
    state=json.loads((OUT/'state.json').read_text())
    Ledger(api,provider,state['key']).materialize(state,OUT)


def report(provider,api=None):
    authorize(provider)
    api=api or GitHub()
    if not (OUT/'state.json').exists():return
    state=json.loads((OUT/'state.json').read_text());plan=json.loads((OUT/'plan.json').read_text())
    # Rehydrate sidecars from older activations before artifact export/reporting.
    # State JSON always includes their immutable Git blob references as well.
    Ledger(api,provider,plan['key']).materialize(state,OUT)
    metrics=core.totals(state)
    if provider=='kimi':
        metrics['daily_budget']=budget.daily_status(api)
    gemini_status=''
    if provider=='gemini' and state['calls']:
        http=state['calls'][-1].get('http_status')
        if http==429:gemini_status='Gemini HTTP 429 (quota or rate limit). No automatic retry.\n'
        elif http is not None:gemini_status=f'Gemini HTTP {http}. No automatic retry.\n'
    failures=[json.loads(p.read_text()) for p in sorted(OUT.glob('failure-*.json'))]
    run='https://github.com/'+REPOSITORY+'/actions/runs/'+os.environ['GITHUB_RUN_ID']
    artifact=os.environ.get('ARTIFACT_URL') or run+'#artifacts'
    body=f'''## {provider.upper()} — {state['status']}
Task `{state['key']}`, source `{state['sourceSHA']}`.
Trusted standards `{state.get('trustedSHA',state['sourceSHA'])}`.
Checkpoint `{plan['head']}`; remaining authorized calls: {state['remaining_calls']}.
Phase failures: {json.dumps(failures,ensure_ascii=False)}.
Budget status: {state.get('budget_problem','not blocked')}.
{gemini_status}Independent review by another agent and owner acceptance: **PENDING**. Draft PR: {state.get('pr_url','none')}.

Usage/calls/spend (before tax; unknown calls are NOT zero):
```json
{json.dumps(metrics,ensure_ascii=False,indent=2)}
```
Checked report, responses, code and checkpoints: [artifacts]({artifact}), [run]({run}).
Unverified or unsafe responses are discarded; this comment is an index, not an excerpt.
Continue only with an owner `/agent continue` command naming this exact checkpoint and a finite call grant.
'''
    save('summary.md',body)
    if state['issue']:api.request('POST',f'/issues/{state["issue"]}/comments',{'body':body})
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as f:f.write(body)


def main():
    provider=os.environ['AGENT_PROVIDER'];phase=sys.argv[1]
    functions={'prepare':prepare,'work':run_loop,'validate':validate_only,'publish':publish,'export':export,'report':report}
    try:functions[phase](provider)
    except Exception as exc:
        # Never echo command args, provider bodies, headers, secret values or model code.
        save('failure-'+phase+'.json',{'phase':phase,'error_type':type(exc).__name__,
            **({'http_status':exc.status,'reason':exc.reason,'endpoint':exc.endpoint} if isinstance(exc,APIError) else {})})
        print('Agent phase failed:',phase,type(exc).__name__)
        sys.exit(1)


if __name__=='__main__':main()

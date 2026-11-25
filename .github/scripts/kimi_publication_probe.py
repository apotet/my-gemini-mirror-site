"""Zero-model diagnostic: attempt the original POST for an already-open PR.

GitHub rejects a second open PR for the same head/base. This distinguishes the
Actions PR-creation policy (403) from duplicate validation (422), without editing
PR #361, changing branches or calling a model. Run only on the trusted fix branch.
"""
import json
import os
from pathlib import Path
import kimi_issue as k


def create_smoke():
    """Create/close a docs-only disposable Draft; never clone the lesson edit."""
    run_id = os.environ['GITHUB_RUN_ID']
    if not run_id.isdecimal():
        raise ValueError('Invalid diagnostic run ID')
    branch = 'kimi/publication-smoke-'+run_id
    source = k.github('GET','/git/ref/heads/main')['object']['sha']
    tree = k.github('GET','/git/commits/'+source)['tree']['sha']
    path = 'docs/audits/kimi-publication-smoke-'+run_id+'.txt'
    blob = k.github('POST','/git/blobs',{'encoding':'utf-8','content':'Disposable PR publication check. No model calls or lesson changes. Run '+run_id+'\n'})['sha']
    new_tree = k.github('POST','/git/trees',{'base_tree':tree,'tree':[{'path':path,'mode':'100644','type':'blob','sha':blob}]})['sha']
    commit = k.github('POST','/git/commits',{'message':'diagnostic: verify GitHub Actions Draft publication','tree':new_tree,'parents':[source]})['sha']
    evidence = {'model_calls':0,'branch':branch,'source_sha':source,'commit_sha':commit,'fixture':path}
    number = None
    k.github('POST','/git/refs',{'ref':'refs/heads/'+branch,'sha':commit})
    try:
        diff = k.github('GET',f'/compare/{source}...{commit}')
        if diff.get('total_commits')!=1 or [f['filename'] for f in diff.get('files',[])] != [path]:
            raise ValueError('Diagnostic branch differs from the single docs fixture')
        status, pr = k.github('POST','/pulls',{'title':'[diagnostic] Kimi Actions PR publication (no model)',
            'head':branch,'base':'main','draft':True,
            'body':'Disposable docs-only publication diagnostic. No Kimi calls. No lesson changes. PR #361 stays untouched. This diagnostic Draft is closed automatically.'},with_status=True)
        number = pr['number']
        if number==361 or pr['head']['ref']!=branch:
            number = None  # never close a response that is not our diagnostic Draft
            raise ValueError('Unexpected diagnostic PR; do not change it')
        evidence.update(http_status=status,draft_created=pr['draft'],pr_number=number,pr_url=pr['html_url'])
        if status!=201 or not pr['draft'] or pr['state']!='open':
            raise ValueError('Draft creation was not confirmed')
    finally:
        if number is not None and number!=361:
            closed = k.github('PATCH',f'/pulls/{number}',{'state':'closed'})
            evidence['diagnostic_closed'] = closed['state']=='closed'
        k.github('DELETE','/git/refs/heads/'+branch)
        evidence['diagnostic_branch_deleted'] = True
        k.save('publication-probe.json',evidence)
    preserved = k.github('GET','/pulls/361')
    if not preserved['draft'] or preserved['state']!='open' or preserved['head']['sha']!='3bf2cfc010de1d95171b1a882a8cc581a219aa89':
        raise ValueError('PR #361 changed during the diagnostic')
    evidence['existing_361_unchanged'] = True
    k.save('publication-probe.json',evidence)
    print(json.dumps(evidence))


def main():
    if (os.environ.get('GITHUB_EVENT_NAME') != 'workflow_dispatch' or
        os.environ.get('GITHUB_ACTOR') != 'apotet' or
        os.environ.get('GITHUB_REPOSITORY') != 'apotet/my-gemini-mirror-site' or
        os.environ.get('GITHUB_REF') != 'refs/heads/fix/kimi-pr-publication'):
        raise ValueError('Unauthorized diagnostic')
    pr = k.github('GET','/pulls/361')
    branch = 'kimi/agent-run-issue-360-45524251479'
    if (pr['state'] != 'open' or not pr['draft'] or pr['head']['ref'] != branch or
        pr['head']['sha'] != '3bf2cfc010de1d95171b1a882a8cc581a219aa89' or pr['base']['ref'] != 'main'):
        raise ValueError('Verified Draft PR changed; do not probe')
    mode = os.environ.get('PROBE_MODE','diagnose')
    if mode == 'create':
        create_smoke()
        return
    if mode == 'reuse':
        existing = k.ensure_draft_pr(branch,pr['head']['sha'],'bd92795f7a49f488cccc2bbea5a4b2570c471fb5',360,'')
        if existing['number'] != 361:
            raise ValueError('Unexpected existing Draft')
        evidence = {'model_calls':0,'existing_pr_reused':361,'head_sha':existing['head']['sha'],
                    'draft':existing['draft'],'write_calls':0}
        k.save('publication-probe.json',evidence)
        print(json.dumps(evidence))
        return
    if mode != 'diagnose':
        raise ValueError('Unknown diagnostic mode')
    try:
        result = k.github('POST','/pulls',{'title':'Kimi publication diagnostic (duplicate expected)',
            'head':branch,'base':'main','draft':True,'body':'Zero-model publication diagnostic. Existing Draft PR #361 must stay unchanged.'})
    except k.GitHubAPIError as exc:
        evidence = {'model_calls':0,'existing_pr':361,'existing_head_sha':pr['head']['sha'],**exc.details()}
        k.save('publication-probe.json',evidence)
        print(json.dumps(evidence))
        if exc.status not in (403,422):
            raise
    else:
        # Possible only if the owner closed the existing PR during the probe.
        k.save('publication-probe.json',{'model_calls':0,'unexpected_new_draft':result['html_url']})
        raise ValueError('PR state raced; inspect unexpected Draft (never merge)')


if __name__=='__main__':
    main()

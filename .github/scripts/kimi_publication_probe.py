"""Zero-model diagnostic: attempt the original POST for an already-open PR.

GitHub rejects a second open PR for the same head/base. This distinguishes the
Actions PR-creation policy (403) from duplicate validation (422), without editing
PR #361, changing branches or calling a model. Run only on the trusted fix branch.
"""
import json
import os
from pathlib import Path
import kimi_issue as k


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

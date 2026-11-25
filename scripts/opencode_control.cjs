// Exact command authorization for the existing workflow; never execute comment text.
const COMMANDS = new Map([
  ['/opencode run zai glm-5.3 accept-budget-risk', {provider: 'zai', model: 'glm-5.3', risk: true, terms: false}],
  ['/opencode run zai-coding-plan glm-5.3 confirm-ci-terms', {provider: 'zai-coding-plan', model: 'glm-5.3', risk: false, terms: true}],
  ['/opencode run zai-coding-plan glm-5.4 confirm-ci-terms', {provider: 'zai-coding-plan', model: 'glm-5.4', risk: false, terms: true}],
]);
const MARKER = '<!-- opencode-paid-attempt-v1 -->';

function resolveRequest(context, inputs = {}, attempt = 1, triggeringActor = context.actor) {
  const {owner, repo} = context.repo;
  if (owner !== 'apotet' || repo !== 'my-gemini-mirror-site' ||
      context.actor !== 'apotet' || triggeringActor !== 'apotet' ||
      context.ref !== 'refs/heads/main' || attempt !== 1) return null;
  const p = context.payload;
  let request;
  if (context.eventName === 'workflow_dispatch') {
    request = {provider: inputs.provider || 'zai-coding-plan', model: inputs.model || 'glm-5.4',
      paid: inputs.paid === true, risk: inputs.api_budget_risk_accepted === true,
      terms: inputs.ci_terms_confirmed === true, issue: String(inputs.issue || '')};
  } else {
    if (p.sender?.type !== 'User' || p.issue?.user?.login !== 'apotet' ||
        p.issue?.pull_request || !p.issue?.title?.startsWith('[OPENCODE] ')) return null;
    if (context.eventName === 'issues' && p.action === 'opened') {
      request = {provider: 'zai-coding-plan', model: 'glm-5.4', paid: false,
        risk: false, terms: false, issue: String(p.issue.number)};
    } else if (context.eventName === 'issue_comment' && p.action === 'created' &&
               p.comment?.user?.login === 'apotet' && p.comment?.user?.type === 'User') {
      const command = COMMANDS.get(p.comment.body); // Exact match: no trim, split, eval or shell.
      if (!command) return null;
      request = {...command, paid: true, issue: String(p.issue.number)};
    } else return null;
  }
  if (!/^[1-9][0-9]*$/.test(request.issue)) throw new Error('Invalid Issue number');
  if (!['zai', 'zai-coding-plan'].includes(request.provider) ||
      !['glm-5.3', 'glm-5.4'].includes(request.model) ||
      (request.provider === 'zai' && request.model !== 'glm-5.3')) throw new Error('Unsupported provider/model');
  if (request.paid && request.provider === 'zai' && !request.risk)
    throw new Error('Owner must accept risk of exceeding $0.20 target and $1 planning budget (no hard cap)');
  if (request.paid && request.provider === 'zai-coding-plan' && !request.terms)
    throw new Error('CI terms confirmation required');
  return request;
}

async function reserveAttempt(github, params, paid, runUrl) {
  if (!paid) return;
  const comments = await github.paginate(github.rest.issues.listComments, params);
  if (comments.some(c => c.user?.type === 'Bot' && c.body?.includes(MARKER)))
    throw new Error('Paid attempt already reserved; uncertain/failure is never retried');
  await github.rest.issues.createComment({...params,
    body: `${MARKER}\nOpenCode paid audit reserved by apotet. No retry, merge or deploy. Run: ${runUrl}`});
}
module.exports = {resolveRequest, reserveAttempt};

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

function auditTarget(body, mainSha) {
  const values = name => (body || '').split(/\r?\n/)
    .filter(line => new RegExp('^\\s*' + name + '\\b', 'i').test(line));
  const shas = values('Audit-SHA'), sources = values('Audit-Source');
  if (!shas.length && !sources.length) {
    if (/\bpinned\s+SHA\b/i.test(body || '')) throw new Error('Use explicit Audit-SHA and Audit-Source metadata');
    return {sha: mainSha, source: ''};
  }
  const sha = shas.length === 1 && /^Audit-SHA: ([a-f0-9]{40})$/.exec(shas[0]);
  const source = sources.length === 1 && /^Audit-Source: ((?:[\w-]+\/)*[\w.-]+\.json)$/.exec(sources[0]);
  if (!sha || !source) throw new Error('Invalid or missing Audit-SHA / Audit-Source metadata');
  return {sha: sha[1], source: source[1]};
}

async function reserveAttempt(github, params, paid, runUrl) {
  if (!paid) return;
  const comments = await github.paginate(github.rest.issues.listComments, params);
  if (comments.some(c => c.user?.type === 'Bot' && c.body?.includes(MARKER)))
    throw new Error('Paid attempt already reserved; uncertain/failure is never retried');
  await github.rest.issues.createComment({...params,
    body: `${MARKER}\nOpenCode paid audit reserved by apotet. No retry, merge or deploy. Run: ${runUrl}`});
}
async function publishAuditResult(github, params, result, usage, artifactUrl, runUrl) {
  const statuses = new Set(['completed', 'incomplete', 'interrupted', 'failed', 'dry_run']);
  const status = statuses.has(result?.status) ? result.status : 'incomplete';
  const summary = typeof result?.summary === 'string' ? result.summary.slice(0, 4000) : 'No audit result available; not a completed audit.';
  // The runner redacts the loaded key before writing result/usage. No stderr, prompt,
  // environment, config or raw event archive is copied into the Issue comment.
  const numbers = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
  const tokens = usage?.tokens;
  const safeUsage = {provider: ['zai', 'zai-coding-plan'].includes(usage?.provider) ? usage.provider : 'unknown',
    tokens: tokens ? Object.fromEntries(['input', 'output', 'reasoning', 'cache_read', 'cache_write'].map(k => [k, numbers(tokens[k])])) : null,
    opencode_cost_usd: numbers(usage?.opencode_cost_usd),
    budget_usd: numbers(usage?.budget_usd), target_usd: numbers(usage?.target_usd), budget_is_hard_cap: false};
  const archive = /^https:\/\/github\.com\//.test(artifactUrl || '') ? artifactUrl : runUrl;
  const body = `OpenCode audit outcome: **${status}**\n\n${summary}\n\nUsage (OpenCode estimate; missing/partial usage unknown; reconcile provider bill; $1 is not a hard cap):\n\n` +
    '```json\n' + JSON.stringify(safeUsage, null, 2) + '\n```\n\n' +
    `Archive: ${archive}\nRun: ${runUrl}\nCompletion is model-declared, not independent validation. Incomplete/failed/interrupted results must not be treated as a completed audit. No automatic retry.`;
  await github.rest.issues.createComment({...params, body});
}
module.exports = {resolveRequest, auditTarget, reserveAttempt, publishAuditResult};

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {resolveRequest, reserveAttempt} = require('../scripts/opencode_control.cjs');
const api = '/opencode run zai glm-5.3 accept-budget-risk';
function context(body = api) {
  return {repo: {owner: 'apotet', repo: 'my-gemini-mirror-site'}, actor: 'apotet',
    ref: 'refs/heads/main', eventName: 'issue_comment', payload: {action: 'created',
      sender: {type: 'User'}, issue: {number: 388, title: '[OPENCODE] Audit', user: {login: 'apotet'}},
      comment: {body, user: {login: 'apotet', type: 'User'}}}};
}
test('exact owner API command explicitly accepts risk, never a hard cap', () => {
  assert.deepEqual(resolveRequest(context()), {provider: 'zai', model: 'glm-5.3', risk: true,
    terms: false, paid: true, issue: '388'});
});
test('both Coding Plan commands explicitly confirm CI terms', () => {
  for (const model of ['glm-5.3', 'glm-5.4']) {
    const result = resolveRequest(context(`/opencode run zai-coding-plan ${model} confirm-ci-terms`));
    assert.equal(result.provider, 'zai-coding-plan');
    assert.equal(result.terms, true); assert.equal(result.paid, true); assert.equal(result.risk, false);
  }
});
test('unauthorized actor, author, sender, Issue, PR, fork, ref, action and rerun ignored', () => {
  const mutations = [c => c.actor = 'other', c => c.payload.comment.user.login = 'other',
    c => c.payload.comment.user.type = 'Bot', c => c.payload.sender.type = 'Bot',
    c => c.payload.issue.user.login = 'other', c => c.payload.issue.title = 'Other',
    c => c.payload.issue.pull_request = {}, c => c.repo.owner = 'other',
    c => c.ref = 'refs/pull/388/head', c => c.payload.action = 'edited'];
  for (const mutate of mutations) {const c = context(); mutate(c); assert.equal(resolveRequest(c), null);}
  assert.equal(resolveRequest(context(), {}, 2), null);
  assert.equal(resolveRequest(context(), {}, 1, 'other'), null);
});
test('ordinary comments, malformed commands and shell payloads ignored exactly', () => {
  for (const body of ['hello', api + '\n', ' ' + api, api + ' extra', api + '; echo injected',
    api + '\n$(id)', '/opencode run zai glm-5.4 accept-budget-risk',
    '/opencode run zai glm-5.3', '/opencode run zai-coding-plan glm-5.4',
    '/OPENCODE run zai glm-5.3 accept-budget-risk']) assert.equal(resolveRequest(context(body)), null);
});
test('owner Issue opened and workflow_dispatch dry-runs stay free', async () => {
  const c = context(); c.eventName = 'issues'; c.payload.action = 'opened';
  assert.equal(resolveRequest(c).paid, false);
  c.eventName = 'workflow_dispatch';
  assert.equal(resolveRequest(c, {issue: '388', provider: 'zai', model: 'glm-5.3'}).paid, false);
  // A free dry-run must not even touch GitHub, much less a model or credential.
  await reserveAttempt({}, {}, false, 'mock-run');
});
test('dispatch paid confirmations are still required', () => {
  const c = context(); c.eventName = 'workflow_dispatch';
  assert.throws(() => resolveRequest(c, {issue: '388', provider: 'zai', model: 'glm-5.3', paid: true}), /risk/);
  assert.equal(resolveRequest(c, {issue: '388', provider: 'zai', model: 'glm-5.3', paid: true,
    api_budget_risk_accepted: true}).paid, true);
  assert.throws(() => resolveRequest(c, {issue: '388', paid: true}), /terms/);
  assert.throws(() => resolveRequest(c, {issue: '388', provider: 'zai', model: 'glm-5.4'}), /Unsupported/);
});
test('durable reservation prevents duplicate comment or dispatch, including uncertain outcome', async () => {
  const comments = []; let writes = 0;
  const github = {paginate: async () => comments,
    rest: {issues: {listComments() {}, async createComment({body}) {
      writes++; comments.push({user: {type: 'Bot'}, body});
    }}}};
  const params = {owner: 'apotet', repo: 'my-gemini-mirror-site', issue_number: 388};
  await reserveAttempt(github, params, true, 'mock-run');
  await assert.rejects(reserveAttempt(github, params, true, 'duplicate-run'), /already reserved/);
  assert.equal(writes, 1);
});

test('Issue result publication includes safe summary and usage with archive, not raw fields', async () => {
  const {publishAuditResult} = require('../scripts/opencode_control.cjs');
  const comments = [];
  const github = {rest: {issues: {async createComment(c) { comments.push(c); }}}};
  await publishAuditResult(github, {owner: 'apotet', repo: 'my-gemini-mirror-site', issue_number: 388},
    {status: 'completed', summary: 'Findings with file:line evidence.', final_response: 'RAW_NOT_FOR_ISSUE'},
    {provider: 'zai', tokens: {input: 100, output: 20}, opencode_cost_usd: 0.08,
      budget_usd: 1, target_usd: 0.20, env: 'SECRET_NOT_FOR_ISSUE'},
    'https://github.com/owner/repo/actions/runs/1/artifacts/2', 'https://github.com/owner/repo/actions/runs/1');
  assert.match(comments[0].body, /completed/);
  assert.match(comments[0].body, /Findings with file:line/);
  assert.match(comments[0].body, /0.08/);
  assert.match(comments[0].body, /artifacts\/2/);
  assert.doesNotMatch(comments[0].body, /RAW_NOT_FOR_ISSUE|SECRET_NOT_FOR_ISSUE/);
});
test('missing, interrupted and incomplete output is never published as completed', async () => {
  const {publishAuditResult} = require('../scripts/opencode_control.cjs');
  for (const result of [null, {status: 'interrupted', summary: 'Partial'}, {status: 'incomplete', summary: 'Missing scope'}]) {
    let body;
    await publishAuditResult({rest: {issues: {async createComment(c) {body = c.body;}}}}, {}, result, null, '', 'run-link');
    assert.doesNotMatch(body, /outcome: \*\*completed\*\*/);
    assert.match(body, /"tokens": null/);
    assert.match(body, /Archive: run-link/);
  }
});

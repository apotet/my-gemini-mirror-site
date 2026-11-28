'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { authorize, reserveSmoke, PROBE, SMOKE, ATTEST, REVOKE, CLAIM } =
  require('../scripts/gemini_designer_comment.cjs');

const owner = { login: 'apotet', id: 332418397, type: 'User' };
const outsider = { login: 'different', id: 123, type: 'User' };
const bot = { login: 'github-actions[bot]', id: 41898282, type: 'Bot' };
function comment(id, body, user = owner, second = '00') {
  const iso = `2026-11-28T10:00:${second}Z`;
  return { id, body, user: { ...user }, created_at: iso, updated_at: iso };
}
function context(body = SMOKE) {
  return {
    eventName: 'issue_comment', ref: 'refs/heads/main', actor: 'apotet',
    payload: {
      action: 'created', repository: { full_name: 'apotet/my-gemini-mirror-site' },
      sender: { ...owner }, comment: comment(20, body, owner, '20'),
      issue: { number: 591, id: 6662809692, state: 'open', user: { ...owner } }
    }
  };
}
function api(c, comments, issue = c.payload.issue, claimAuthor = bot) {
  let writes = 0;
  const fixed = { owner: 'apotet', repo: 'my-gemini-mirror-site', issue_number: 591 };
  const rest = { issues: {
    get: async p => { assert.deepEqual(p, fixed); return { data: issue }; },
    listComments: Symbol('pagination method'),
    createComment: async p => {
      assert.deepEqual(p, { ...fixed, body: CLAIM });
      writes++;
      const data = comment(99, p.body, claimAuthor, '35');
      comments.push(data);
      return { data };
    }
  } };
  return { rest, writeCount: () => writes, paginate: async (fn, p) => {
    assert.equal(fn, rest.issues.listComments);
    assert.deepEqual(p, { ...fixed, per_page: 100 });
    return comments;
  } };
}

test('only exact owner commands in issue 591 on main, first attempt', () => {
  assert.equal(authorize(context(), '1', 'apotet'), 'smoke');
  assert.equal(authorize(context(PROBE), '1', 'apotet'), 'probe');
  for (const body of [SMOKE.toUpperCase(), SMOKE + '\n', SMOKE + ' pilot', '>' + SMOKE,
      ATTEST, REVOKE, '/gennady pilot', 'regular comment']) {
    assert.equal(authorize(context(body), '1', 'apotet'), null, body);
  }
  for (const mutate of [
    c => c.eventName = 'workflow_dispatch', c => c.ref = 'refs/heads/topic',
    c => c.actor = 'other', c => c.payload.action = 'edited',
    c => c.payload.repository.full_name = 'other/my-gemini-mirror-site',
    c => c.payload.issue.number = 590, c => c.payload.issue.id = 1,
    c => c.payload.issue.state = 'closed', c => c.payload.issue.pull_request = {},
    c => c.payload.issue.user = outsider, c => c.payload.sender = outsider,
    c => c.payload.comment.user.id = 123, c => c.payload.comment.user.type = 'Bot',
    c => c.payload.comment.updated_at = '2026-11-28T10:00:21Z',
    c => c.payload.comment.id = 0]) {
    const c = context();
    mutate(c);
    assert.equal(authorize(c, '1', 'apotet'), null, String(mutate));
  }
  assert.equal(authorize(context(), '2', 'apotet'), null);
  assert.equal(authorize(context(), '1', 'other'), null);
});

test('probe does not contact any GitHub endpoint in the reservation function', async () => {
  assert.equal(await reserveSmoke(null, context(PROBE), '1', 'apotet'), false);
});

test('reserve one smoke on explicit prior attestation; bot claim blocks repeated commands', async () => {
  const c = context();
  const comments = [comment(10, ATTEST), comment(11, CLAIM, outsider), c.payload.comment];
  const g = api(c, comments);
  assert.equal(await reserveSmoke(g, c, '1', 'apotet'), true);
  assert.equal(await reserveSmoke(g, c, '1', 'apotet'), false);
  const later = context();
  later.payload.comment = comment(30, SMOKE, owner, '30');
  comments.push(later.payload.comment);
  assert.equal(await reserveSmoke(g, later, '1', 'apotet'), false);
  assert.equal(g.writeCount(), 1);
});

test('no launch on missing, edited, forged, later, or revoked attestation', async () => {
  const c = context();
  const edited = comment(10, ATTEST);
  edited.updated_at = '2026-11-28T10:00:21Z';
  for (const signals of [
    [], [edited], [comment(10, ATTEST, outsider)], [comment(30, ATTEST, owner, '21')],
    [comment(30, ATTEST, owner, '20')], [comment(10, ATTEST), comment(11, REVOKE)],
    [comment(10, ATTEST), comment(30, REVOKE, owner, '25')],
  ]) {
    const g = api(c, [...signals, c.payload.comment]);
    assert.equal(await reserveSmoke(g, c, '1', 'apotet'), false);
    assert.equal(g.writeCount(), 0);
  }
});

test('re-fetch blocks closed issue, and deleted, forged or edited command', async () => {
  const c = context();
  const p = c.payload;
  for (const [issue, cmd] of [
    [{ ...p.issue, state: 'closed' }, p.comment],
    [p.issue, null], [p.issue, { ...p.comment, user: outsider }],
    [p.issue, { ...p.comment, updated_at: '2026-11-28T10:00:21Z' }],
    [p.issue, { ...p.comment, body: PROBE }],
  ]) {
    const g = api(c, [comment(10, ATTEST), ...(cmd ? [cmd] : [])], issue);
    assert.equal(await reserveSmoke(g, c, '1', 'apotet'), false);
    assert.equal(g.writeCount(), 0);
  }
});

test('unexpected identity or uncertain claim write never authorizes provider', async () => {
  const c = context();
  const g = api(c, [comment(10, ATTEST), c.payload.comment], undefined, outsider);
  await assert.rejects(reserveSmoke(g, c, '1', 'apotet'), /Unexpected reservation identity/);
  g.rest.issues.createComment = async () => { throw new Error('transport failed'); };
  await assert.rejects(reserveSmoke(g, c, '1', 'apotet'), /transport failed/);
});

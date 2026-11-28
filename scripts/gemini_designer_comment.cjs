'use strict';

const REPO = 'apotet/my-gemini-mirror-site';
const OWNER = 'apotet';
const OWNER_ID = 332418397;
const ISSUE = 591;
const ISSUE_ID = 6662809692;
const PROBE = '/gennady check';
const SMOKE = '/gennady smoke';
const ATTEST = '/gennady attest same-key-project-is-free-tier';
const REVOKE = '/gennady revoke';
const CLAIM = '<!-- gemini-designer-free:arp-smoke-v1:reserved -->';

function owner(user) {
  return user?.login === OWNER && user.id === OWNER_ID && user.type === 'User';
}

function original(comment) {
  return Number.isSafeInteger(comment?.id) && comment.id > 0 &&
    typeof comment.created_at === 'string' &&
    Number.isFinite(Date.parse(comment.created_at)) &&
    comment.created_at === comment.updated_at;
}

function authorize(context, attempt, triggeringActor) {
  const p = context.payload;
  const i = p?.issue;
  const c = p?.comment;
  if (context.eventName !== 'issue_comment' || context.ref !== 'refs/heads/main' ||
      context.actor !== OWNER || triggeringActor !== OWNER || attempt !== '1' ||
      p?.action !== 'created' || p?.repository?.full_name !== REPO ||
      i?.number !== ISSUE || i.id !== ISSUE_ID || i.state !== 'open' || i.pull_request ||
      !owner(i.user) || !owner(p.sender) || !owner(c?.user) || !original(c)) return null;
  if (c.body === PROBE) return 'probe';
  if (c.body === SMOKE) return 'smoke';
  return null;
}

async function reserveSmoke(github, context, attempt, triggeringActor) {
  if (authorize(context, attempt, triggeringActor) !== 'smoke') return false;
  const c = context.payload.comment;
  const params = { owner: OWNER, repo: 'my-gemini-mirror-site', issue_number: ISSUE };
  const { data: issue } = await github.rest.issues.get(params);
  if (issue.id !== ISSUE_ID || issue.number !== ISSUE || !owner(issue.user) ||
      issue.state !== 'open' || issue.pull_request) return false;
  const comments = await github.paginate(github.rest.issues.listComments, { ...params, per_page: 100 });
  const matching = comments.find(entry => entry.id === c.id);
  if (!owner(matching?.user) || !original(matching) || matching.body !== SMOKE ||
      matching.created_at !== c.created_at) return false;
  if (comments.some(entry => entry.user?.login === 'github-actions[bot]' &&
      entry.user.id === 41898282 && entry.user.type === 'Bot' && entry.body === CLAIM)) return false;
  const ownerSignals = comments.filter(entry => owner(entry.user) && original(entry) &&
    (entry.body === ATTEST || entry.body === REVOKE))
    .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id);
  const last = ownerSignals.at(-1);
  // Check current consent as well as that it predates the command. Revoke never launches Actions.
  if (last?.body !== ATTEST || last.created_at > c.created_at ||
      (last.created_at === c.created_at && last.id >= c.id)) return false;
  // The workflow serializes this job. Never remove the claim or retry after uncertain writes.
  const { data: claim } = await github.rest.issues.createComment({ ...params, body: CLAIM });
  if (claim.body !== CLAIM || claim.user?.login !== 'github-actions[bot]' ||
      claim.user.id !== 41898282 || claim.user.type !== 'Bot') {
    throw new Error('Unexpected reservation identity');
  }
  return true;
}

module.exports = { authorize, reserveSmoke, PROBE, SMOKE, ATTEST, REVOKE, CLAIM };

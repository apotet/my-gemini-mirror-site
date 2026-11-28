'use strict';

const REPO = 'apotet/my-gemini-mirror-site';
const OWNER = 'apotet';
const OWNER_ID = 332418397;
const ISSUE = 591;
const ISSUE_ID = 6662809692;
const PROBE = '/gennady check';
const SMOKE = '/gennady smoke';
const RETRY = '/gennady retry-503';
const PILOT = '/gennady pilot-tcpip';
const ATTEST = '/gennady attest same-key-project-is-free-tier';
const REVOKE = '/gennady revoke';
const PROOF_MAX_AGE_MS = 30 * 60 * 1000;
const CLAIM = '<!-- gemini-designer-free:arp-smoke-v1:reserved -->';
const PILOT_CLAIM = '<!-- gemini-designer-free:tcpip-pilot-v2:reserved -->';
const RETRY_CLAIM = '<!-- gemini-designer-free:arp-retry-503-v1:reserved -->';

function botClaim(entry, body) {
  return entry.user?.login === 'github-actions[bot]' && entry.user.id === 41898282 &&
    entry.user.type === 'Bot' && entry.body === body;
}

function owner(user) {
  return user?.login === OWNER && user.id === OWNER_ID && user.type === 'User';
}

function dated(comment, field) {
  return Number.isSafeInteger(comment?.id) && comment.id > 0 &&
    typeof comment[field] === 'string' && Number.isFinite(Date.parse(comment[field]));
}

function original(comment) {
  return dated(comment, 'created_at') && comment.created_at === comment.updated_at;
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
  if (c.body === RETRY) return 'retry-503';
  if (c.body === PILOT) return 'pilot';
  return null;
}

async function reserveSmoke(github, context, attempt, triggeringActor, now = Date.now()) {
  const mode = authorize(context, attempt, triggeringActor);
  if (!['smoke', 'retry-503', 'pilot'].includes(mode)) return false;
  const retry = mode === 'retry-503';
  const pilot = mode === 'pilot';
  const marker = pilot ? PILOT_CLAIM : retry ? RETRY_CLAIM : CLAIM;
  const c = context.payload.comment;
  const params = { owner: OWNER, repo: 'my-gemini-mirror-site', issue_number: ISSUE };
  const { data: issue } = await github.rest.issues.get(params);
  if (issue.id !== ISSUE_ID || issue.number !== ISSUE || !owner(issue.user) ||
      issue.state !== 'open' || issue.pull_request) return false;
  const comments = await github.paginate(github.rest.issues.listComments, { ...params, per_page: 100 });
  const matching = comments.find(entry => entry.id === c.id);
  if (!owner(matching?.user) || !original(matching) || matching.body !== (pilot ? PILOT : retry ? RETRY : SMOKE) ||
      matching.created_at !== c.created_at) return false;
  if (comments.some(entry => botClaim(entry, marker))) return false;
  // This explicit recovery slot is for the one reviewed original 503 attempt only.
  if (retry && !comments.some(entry => entry.id === 7237486212 && botClaim(entry, CLAIM))) return false;
  if (pilot && (!comments.some(entry => entry.id === 7237579922 && botClaim(entry, RETRY_CLAIM)) ||
      !comments.some(entry => entry.id === 7237606629 && owner(entry.user) &&
        original(entry) && entry.body.startsWith('<!-- fedot-gemini-recovery-result:v1:46132875247 -->\n')))) return false;
  const ownerSignals = comments.filter(entry => owner(entry.user)).flatMap(entry => {
    if (entry.body === REVOKE && dated(entry, 'updated_at')) return [{ ...entry, at: entry.updated_at }];
    if (entry.body === ATTEST && original(entry)) return [{ ...entry, at: entry.created_at }];
    return [];
  }).sort((a, b) => a.at.localeCompare(b.at) ||
    Number(a.body === REVOKE) - Number(b.body === REVOKE) || a.id - b.id);
  const last = ownerSignals.at(-1);
  // A valid signal must precede this request and still be current. An edited revoke can only deny.
  const proofAge = now - Date.parse(last?.at);
  if (last?.body !== ATTEST || !Number.isFinite(proofAge) || proofAge < 0 ||
      proofAge > PROOF_MAX_AGE_MS || last.at > c.created_at ||
      (last.at === c.created_at && last.id >= c.id)) return false;
  // The workflow serializes this job. Never remove the claim or retry after uncertain writes.
  const { data: claim } = await github.rest.issues.createComment({ ...params, body: marker });
  if (!botClaim(claim, marker)) {
    throw new Error('Unexpected reservation identity');
  }
  return true;
}

module.exports = { authorize, reserveSmoke, PROBE, SMOKE, ATTEST, REVOKE, CLAIM, RETRY, RETRY_CLAIM, PILOT, PILOT_CLAIM };

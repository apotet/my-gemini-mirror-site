import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const CLOSEOUT_POLICY_BASIS = 'NETOPS-L2-CLOSEOUT-2026-11-22';
export const CLOSEOUT_REGISTRY_SHA256 = 'c4b4e7a1fc09dc8e9de37e445385b09e7cf0d1af719c6d86e7da39ec2cd27ca0';
export const DIRECT_AUDIT_IDS = Object.freeze([
  'l7-new-03', 'l4-d05', 'l3-d05', 'review-slaac-4',
  'stp-new-04', 'review-qos-22', 'review-poe-30',
]);

// Explicit owner-approved closeout, separate from the unchanged historical
// REVIEW ledger. A dated registry is immutable; later approval needs a new
// version, never an in-place rewrite of these accepted rows.
export function evaluateCloseoutAcceptancePolicy(currentRows, registryText) {
  const errors = [];
  let registry;
  try { registry = JSON.parse(registryText); }
  catch { errors.push('Missing or invalid closeout registry JSON'); }
  const accepted = Array.isArray(registry?.rows) ? registry.rows : [];
  const current = Array.isArray(currentRows) ? currentRows : [];
  if (registry?.schemaVersion !== 1) errors.push('Invalid registry schemaVersion');
  if (registry?.policyBasis !== CLOSEOUT_POLICY_BASIS) errors.push('Invalid registry policyBasis');
  if (!/^[a-f0-9]{40}$/.test(registry?.sourceCommit ?? '')) errors.push('Missing frozen sourceCommit');
  if (accepted.length !== 164) errors.push('Registry must contain exactly 164 rows');
  if (!Array.isArray(currentRows) || current.length !== 164) errors.push('Current pool must contain exactly 164 rows');
  const hashPattern = /^[a-f0-9]{64}$/;
  const direct = new Set(DIRECT_AUDIT_IDS);
  const validId = row => typeof row?.id === 'string' && row.id.trim() === row.id && row.id.length > 0;
  for (const row of current) {
    if (!validId(row) || !hashPattern.test(row?.currentHash ?? '')) errors.push('Invalid current ID/hash');
  }
  for (const row of accepted) {
    if (!validId(row) || !hashPattern.test(row?.materialHash ?? '')) errors.push('Invalid acceptance ID/hash');
    if (row?.policyBasis !== CLOSEOUT_POLICY_BASIS) errors.push('Invalid row policyBasis');
    const status = direct.has(row?.id) ? 'PASS_DIRECT_AUDIT' : 'ACCEPTED_BY_CLOSEOUT_POLICY';
    if (row?.status !== status) errors.push('Invalid acceptance status: ' + row?.id);
    if (typeof row?.evidenceRef !== 'string' || !/^docs\/audits\/in-depth\/[\w-]+\.md(?:#[\w-]+)?$/.test(row.evidenceRef)) {
      errors.push('Missing or invalid evidenceRef: ' + row?.id);
    }
  }
  const currentMap = new Map(current.map(row => [row?.id, row]));
  const acceptedMap = new Map(accepted.map(row => [row?.id, row]));
  if (currentMap.size !== current.length) errors.push('Duplicate current ID');
  if (acceptedMap.size !== accepted.length) errors.push('Duplicate acceptance ID');
  const newIds = current.filter(row => !acceptedMap.has(row?.id)).map(row => row?.id);
  const missingIds = accepted.filter(row => !currentMap.has(row?.id)).map(row => row?.id);
  const changedIds = current.filter(row => acceptedMap.has(row?.id) && row?.currentHash !== acceptedMap.get(row?.id)?.materialHash).map(row => row?.id);
  // Pin every original byte, including status/evidence. Changing both material
  // and its accepted hash cannot silently rebaseline the guard.
  const registryDigest = typeof registryText === 'string'
    ? createHash('sha256').update(registryText).digest('hex') : null;
  if (registryDigest !== CLOSEOUT_REGISTRY_SHA256) errors.push('Immutable registry byte hash differs');
  const pass = errors.length === 0 && newIds.length === 0 && missingIds.length === 0 && changedIds.length === 0;
  return {
    pass, status: pass ? 'PASS' : 'BLOCK', mode: 'OWNER_APPROVED_CLOSEOUT',
    policyBasis: CLOSEOUT_POLICY_BASIS, errors, newIds, missingIds, changedIds,
    counts: { current: current.length, accepted: accepted.length,
      directAudit: accepted.filter(row => row?.status === 'PASS_DIRECT_AUDIT').length,
      closeoutPolicy: accepted.filter(row => row?.status === 'ACCEPTED_BY_CLOSEOUT_POLICY').length },
    registryDigest,
    note: 'Seven direct routes and 157 owner-approved policy acceptances bound to exact material hashes; historical REVIEW is unchanged. Not 164 new direct audits.',
  };
}

// Strict data-provenance gate, not a proof of educational correctness.
// A historic semanticStatus=PASS does not override status=REVIEW.
export function evaluateInDepthFingerprintPolicy(currentRows, historicalRows) {
  assert.ok(Array.isArray(currentRows) && Array.isArray(historicalRows), 'Expected arrays of current and historical rows');
  assert.equal(new Set(currentRows.map(row => row.id)).size, currentRows.length, 'Duplicate current question ID');
  assert.equal(new Set(historicalRows.map(row => row.id)).size, historicalRows.length, 'Duplicate independent-review ID');
  for (const row of currentRows) {
    assert.ok(typeof row.id === 'string' && row.id, 'Current ID is required');
    assert.match(row.currentHash ?? '', /^[a-f0-9]{64}$/, 'Missing current hash: ' + row.id);
  }
  for (const row of historicalRows) {
    assert.ok(typeof row.id === 'string' && row.id, 'Historical ID is required');
    assert.match(row.materialHash ?? '', /^[a-f0-9]{64}$/, 'Missing historical hash: ' + row.id);
  }
  const historic = new Map(historicalRows.map(row => [row.id, row]));
  const current = new Map(currentRows.map(row => [row.id, row]));
  const newlyUnreviewedIds = currentRows.filter(row => !historic.has(row.id)).map(row => row.id);
  const missingHistoricalIds = historicalRows.filter(row => !current.has(row.id)).map(row => row.id);
  const changedIds = currentRows.filter(row => historic.has(row.id) && row.currentHash !== historic.get(row.id).materialHash).map(row => row.id);
  const unresolvedStatusIds = currentRows.filter(row => historic.has(row.id) && historic.get(row.id).status !== 'PASS').map(row => ({id: row.id, status: historic.get(row.id).status ?? 'UNVERIFIED'}));
  const blocked = newlyUnreviewedIds.length > 0 || missingHistoricalIds.length > 0 || changedIds.length > 0 || unresolvedStatusIds.length > 0;
  return {
    pass: !blocked, status: blocked ? 'BLOCK' : 'PASS',
    counts: {current: currentRows.length, historical: historicalRows.length,
      newlyUnreviewed: newlyUnreviewedIds.length, missingHistorical: missingHistoricalIds.length,
      changed: changedIds.length, unresolvedStatus: unresolvedStatusIds.length},
    newlyUnreviewedIds, missingHistoricalIds, changedIds, unresolvedStatusIds,
    note: 'Only independent status=PASS with identical SHA256 is recognized. A matching hash or semanticStatus=PASS inside status=REVIEW is not an independent PASS. This policy is distinct from the approved seven-route release decision.'
  };
}

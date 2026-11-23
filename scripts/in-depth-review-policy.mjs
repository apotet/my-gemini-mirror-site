import assert from 'node:assert/strict';

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

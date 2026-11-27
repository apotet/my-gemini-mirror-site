import { bankBeforeCopperPhotoChanges, registryBeforePvcRetirement } from './copper-photo-history-fixtures.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';
import { restoreGate06HistoricalTeachingFields } from './gate06-targeted-bank-fields.mjs';

// Reviewed GATE-06 migration: exact Git blob identities for three changed
// protected teaching sources. All other protected sources retain the old SHA256.
const gate06ProtectedBlobs = Object.freeze({
  'src/components/LessonView.tsx': 'a909fd805752cf5c1c7ef51a351405f5d5db3dff',
  'src/components/TheoryRazbory.tsx': '7129fd35cd2bbede0be8710b33d2784c9e6e4be4',
  'src/data/wifiCases.ts': '54f5bd45354b75d62bed1aa4f0aad0929b16b94c',
  'src/data/lessons/l7-monitoring-snmp-syslog.ts': '944d24e1c7851d049029736aa5e781a3d7634dd8',
  'src/data/lessons/ts-zabbix-monitoring.ts': '6a932f2aa3c23293f3025dd2ef44234b311c1f50',
});
const gitBlobSha1 = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

export const sha256 = value => createHash('sha256').update(value).digest('hex');

/** Versioned stage-2 boundary: future content migrations must update it explicitly. */
export function verifyLearningLevelBaseline(bank, registry) {
  const baseline = JSON.parse(readFileSync(new URL('../docs/audits/issue-171-baseline.json', import.meta.url), 'utf8'));
  assert.equal(bank.length, 860);
  assert.equal(new Set(bank.map(q => q.id)).size, 860);
  // One ID per line is the reviewable registry format; JSON.parse alone hides duplicate keys.
  const source = readFileSync(new URL('../src/data/questionLearningLevels.json', import.meta.url), 'utf8');
  const keys = [...source.matchAll(/^  ("(?:[^"\\]|\\.)*"):/gm)].map(match => JSON.parse(match[1]));
  assert.equal(keys.length, bank.length, 'registry must contain one ID entry per line');
  assert.equal(new Set(keys).size, keys.length, 'duplicate registry ID');
  // Restore only the approved copper-photo changes and five reviewed teaching
  // fields before comparing with the immutable historical bank.
  const historicalProjection = restoreGate06HistoricalTeachingFields(bankBeforeCopperPhotoChanges(bank));
  assert.equal(sha256(JSON.stringify(historicalProjection)), baseline.bankSHA256, 'unapproved bank content/order/difficulty/answers drifted');
  for (const [path, hash] of Object.entries(baseline.protectedFiles)) {
    const bytes = readFileSync(new URL('../' + path, import.meta.url));
    if (Object.hasOwn(gate06ProtectedBlobs, path)) {
      assert.equal(gitBlobSha1(bytes), gate06ProtectedBlobs[path], `unapproved GATE-06 protected source change: ${path}`);
    } else {
      assert.equal(sha256(bytes), hash, `stage-2 protected source changed: ${path}`);
    }
  }
  const historicalRegistry = registryBeforePvcRetirement(registry);
  const projection = historicalProjection.map(q => {
    const entry = historicalRegistry[q.id];
    return { id: q.id, action: entry.auditAction,
      level: entry.status === 'ASSIGNED' ? entry.learningLevel : entry.auditProposedLevel,
      confidence: entry.confidence, rationale: entry.auditRationale };
  });
  assert.equal(sha256(JSON.stringify(projection)), baseline.auditProjectionSHA256, 'mapping differs from the approved audit baseline');
}

const { ALL_QUESTIONS, QUESTION_LEARNING_LEVELS, getLearningLevelStatistics } =
  await bundleEntry('scripts/learning-levels-entry.ts', 'learning-levels.mjs');
verifyLearningLevelBaseline(ALL_QUESTIONS, QUESTION_LEARNING_LEVELS);
export const statistics = getLearningLevelStatistics();
console.log(JSON.stringify(statistics, null, 2));
console.log('OK: learning levels cover every bank ID; approved audit baseline and protected source/content verified');

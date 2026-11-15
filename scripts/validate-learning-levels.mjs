import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';

export const sha256 = value => createHash('sha256').update(value).digest('hex');

/** Versioned stage-2 boundary: future content migrations must update it explicitly. */
export function verifyLearningLevelBaseline(bank, registry) {
  const baseline = JSON.parse(readFileSync(new URL('../docs/audits/issue-171-baseline.json', import.meta.url), 'utf8'));
  assert.equal(bank.length, 799);
  assert.equal(new Set(bank.map(q => q.id)).size, 799);
  // One ID per line is the reviewable registry format; JSON.parse alone hides duplicate keys.
  const source = readFileSync(new URL('../src/data/questionLearningLevels.json', import.meta.url), 'utf8');
  const keys = [...source.matchAll(/^  ("(?:[^"\\]|\\.)*"):/gm)].map(match => JSON.parse(match[1]));
  assert.equal(keys.length, bank.length, 'registry must contain one ID entry per line');
  assert.equal(new Set(keys).size, keys.length, 'duplicate registry ID');
  assert.equal(sha256(JSON.stringify(bank)), baseline.bankSHA256, 'bank content/order/difficulty/answers drifted');
  for (const [path, hash] of Object.entries(baseline.protectedFiles)) {
    assert.equal(sha256(readFileSync(new URL('../' + path, import.meta.url))), hash, `stage-2 protected source changed: ${path}`);
  }
  const projection = bank.map(q => {
    const entry = registry[q.id];
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

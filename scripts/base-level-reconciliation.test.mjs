import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const {
  ALL_QUESTIONS, QUIZ_MODES, getExamPool, getTestingPool, getTestingQuestions, getTestingEligibleQuestions,
  getTrialExamQuestions, getLearningLevelMetadata, isBeginnerPhoto,
  prepareAttemptQuestions, restoreSession,
} = await bundleEntry('scripts/base-level-reconciliation-entry.ts', 'base-level-reconciliation.mjs');

const seeded = initial => {
  let seed = initial;
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
};
const family = q => q.family || q.id;
const before = JSON.stringify(ALL_QUESTIONS);
const level = id => getLearningLevelMetadata(id).learningLevel;
const legacy = getExamPool('mixed', 'beginner');
const base = getTestingPool('mixed', 'beginner');
const legacyIds = new Set(legacy.map(q => q.id));
const baseIds = new Set(base.map(q => q.id));

// Exact published bank snapshot. No question, answer, key or registry is reclassified.
assert.equal(ALL_QUESTIONS.length, 861);
assert.equal(legacy.length, 252, 'one retired photo removed from new legacy-mode selections');
assert.equal(base.length, 215, 'the new Base is exactly the approved L1 Foundations pool');
assert.deepEqual([1, 2, 3].map(l => legacy.filter(q => level(q.id) === l).length), [151, 40, 61]);
assert.equal(legacy.filter(q => !baseIds.has(q.id)).length, 101, 'remove 101 L2/L3 from new Base');
assert.equal(base.filter(q => !legacyIds.has(q.id)).length, 64, 'restore 64 current L1 absent from legacy beginner');
assert.ok(base.every(q => level(q.id) === 1), 'new Base never includes L2+');

for (const { id: mode } of QUIZ_MODES) {
  const pool = getTestingPool(mode, 'beginner');
  const expected = ALL_QUESTIONS.filter(q => (mode === 'mixed' || q.group === mode) && level(q.id) === 1);
  assert.deepEqual(pool, expected, `Base mode ${mode} is exactly L1`);
  for (const count of [1, 5, 10, 15, 20, 30]) for (const seed of [1, 2, 17, 171, 1000]) {
    const questions = getTestingQuestions(mode, count, seeded(seed), 'beginner');
    const wanted = Math.min(count, pool.length);
    assert.equal(questions.length, wanted, `Base count ${mode}/${count}`);
    assert.equal(new Set(questions.map(q => q.id)).size, wanted, 'no duplicate IDs');
    assert.ok(questions.every(q => pool.includes(q)), 'no topics or higher levels leak into Base');
    assert.equal(new Set(questions.map(family)).size,
      Math.min(wanted, new Set(pool.map(family)).size), 'distinct families first');
    if (wanted >= 2 && pool.some(isBeginnerPhoto)) {
      assert.ok(questions.some(isBeginnerPhoto), 'photo guarantee for eligible selected topic');
    }
    assert.deepEqual(questions, getTestingQuestions(mode, count, seeded(seed), 'beginner'),
      'same seed gives the same questions');
  }
}

const a = base[0], b = base[1], hard = legacy.find(q => level(q.id) === 3);
assert.ok(a && b && hard);
const custom = [hard, a, b];
const customBefore = JSON.stringify(custom);
const picked = getTestingQuestions('mixed', 20, seeded(3), 'beginner', custom);
assert.equal(picked.length, 2, 'closed custom pools are not replenished');
assert.deepEqual(new Set(picked.map(q => q.id)), new Set([a.id, b.id]));
assert.deepEqual(getTestingQuestions('mixed', 20, seeded(3), 'beginner', []), []);
assert.equal(JSON.stringify(custom), customBefore, 'custom selection does not mutate input');
 
// Independent reviewer blocker: radar must count only mistakes eligible for selected difficulty.
const allExcludedMistakes = [hard];
for (const difficulty of ['beginner', 'in-depth', 'applied', 'mixed']) {
  const eligible = getTestingEligibleQuestions(allExcludedMistakes, difficulty);
  const started = getTestingQuestions('mixed', 5, seeded(15), difficulty, allExcludedMistakes);
  assert.equal(started.length, Math.min(5, eligible.length), `radar eligibility equals started mistakes for ${difficulty}`);
  assert.deepEqual(started.map(q => q.id), eligible.slice(0, 5).map(q => q.id));
}
assert.deepEqual(getTestingEligibleQuestions(allExcludedMistakes, 'beginner'), [],
  'the Base radar must show zero when all mistakes are L2/L3');
assert.deepEqual(getTestingQuestions('mixed', 5, seeded(15), 'beginner', allExcludedMistakes), [],
  'do not open an empty Base mistake test with a positive counter');
const mixedMistakes = [a, hard, b];
for (const difficulty of ['beginner', 'in-depth', 'applied', 'mixed']) {
  const eligible = getTestingEligibleQuestions(mixedMistakes, difficulty);
  const started = getTestingQuestions('mixed', 10, seeded(15), difficulty, mixedMistakes);
  assert.deepEqual(new Set(started.map(q => q.id)), new Set(eligible.map(q => q.id)),
    `selected level mistakes are counted and started from the same eligible pool: ${difficulty}`);
}


// Unrelated current modes continue using their existing approved selectors.
assert.equal(getTestingPool('mixed', 'in-depth').length, 164);
assert.deepEqual(getTestingPool('mixed', 'applied'), getExamPool('mixed', 'applied'));
assert.deepEqual(getTestingPool('mixed', 'mixed'), getExamPool('mixed', 'mixed'));
assert.ok(getTrialExamQuestions('basic', seeded(7)).every(q => level(q.id) === 1));

// A saved old Base attempt with a now-excluded L3 question is restored by ID, not resampled.
const now = 1_800_000_000_000;
const prepared = prepareAttemptQuestions([hard, a], seeded(23));
const oldSession = {
  ...prepared, currentIndex: 0, userAnswers: {}, submittedQuestions: {},
  startTime: now - 1000, isCompleted: false, mode: 'mixed',
  feedbackMode: 'exam', difficulty: 'beginner', requestedCount: 2,
};
const serialized = JSON.stringify(oldSession);
const restored = restoreSession(serialized, ALL_QUESTIONS, now);
assert.ok(restored, 'previously saved Base session still restores');
for (const key of Object.keys(oldSession)) {
  assert.deepEqual(restored[key], oldSession[key], `restored legacy field ${key}`);
}
assert.equal(restored.questions[0].id, hard.id, 'do not replace an old question');
assert.equal(JSON.stringify(oldSession), serialized, 'saved attempt is not modified');
assert.equal(JSON.stringify(ALL_QUESTIONS), before, 'bank is not mutated');

console.log('PASS: Base uses exactly 215 L1; remove 101 L2/L3, add 64 L1; all topics/sizes/photo/families, custom pools and saved legacy sessions');

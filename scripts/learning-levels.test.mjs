import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';
import { verifyLearningLevelBaseline, statistics } from './validate-learning-levels.mjs';

const { ALL_QUESTIONS, QUESTION_LEARNING_LEVELS: registry, getLearningLevelMetadata,
  validateLearningLevelRegistry, getLearningLevelStatistics, LEARNING_LEVELS,
  QUIZ_MODES, getExamPool, getRandomQuestions, filterExamDifficulty,
  prepareAttemptQuestions, restoreSession } =
  await bundleEntry('scripts/learning-levels-entry.ts', 'learning-level-tests.mjs');

const bankBefore = JSON.stringify(ALL_QUESTIONS);
verifyLearningLevelBaseline(ALL_QUESTIONS, registry);
assert.deepEqual(Object.keys(LEARNING_LEVELS), ['1', '2', '3', '4', '5']);
assert.deepEqual(statistics, getLearningLevelStatistics());
assert.equal(statistics.total, 787);
assert.equal(statistics.assigned, 778);
assert.deepEqual(statistics.levels, { 1: 218, 2: 145, 3: 359, 4: 53, 5: 3 });
assert.deepEqual(statistics.auditProposals, { 1: 220, 2: 151, 3: 360, 4: 53, 5: 3 });
assert.deepEqual(statistics.auditActions, { KEEP: 426, RELABEL: 352, REVIEW: 9 });
assert.deepEqual([...statistics.reviewIds].sort(), ['gap-pack2-29',
  'tcpip-x03', 'l4-x05', 'ts-x02', 'ts-x09', 'tcpip-d01', 'ts-d05', 'l3-vrrp02', 'l4-d04'].sort());

for (const id of statistics.reviewIds) {
  const entry = getLearningLevelMetadata(id);
  assert.equal(entry.status, 'REVIEW');
  assert.equal(Object.hasOwn(entry, 'learningLevel'), false, 'REVIEW is not an assigned level');
}
assert.equal(getLearningLevelMetadata('l1v2-a-contact-solid').learningLevel, 1);
for (const id of ['absent-id', 'toString', '__proto__', 'constructor']) {
  assert.throws(() => getLearningLevelMetadata(id), /unknown ID/);
}
assert.throws(() => { registry['l1-01'].learningLevel = 5; }, TypeError);
assert.throws(() => { registry['absent-id'] = registry['l1-01']; }, TypeError);

// Exercise actual validation with corrupt metadata, not only the current fixture.
const copy = () => structuredClone(registry);
const invalid = (change, pattern) => { const value = copy(); change(value); assert.throws(() =>
  validateLearningLevelRegistry(value, ALL_QUESTIONS), pattern); };
invalid(r => delete r['l1-01'], /missing ID/);
invalid(r => { r.extra = r['l1-01']; }, /unknown ID/);
for (const level of [0, 6, 1.5, '3', null]) {
  invalid(r => { r['l1-01'].learningLevel = level; }, /invalid assigned/);
  invalid(r => { r['ts-x09'].auditProposedLevel = level; }, /invalid REVIEW/);
}
invalid(r => { r['l1-01'].status = 'unknown'; }, /invalid status/);
invalid(r => { r['l1-01'].auditAction = 'REVIEW'; }, /invalid assigned/);
invalid(r => { r['l1-01'].confidence = 'low'; }, /invalid audit evidence/);
invalid(r => { r['l1-01'].auditRationale = ''; }, /invalid audit evidence/);
invalid(r => { r['ts-x09'].learningLevel = 1; }, /invalid REVIEW/);
invalid(r => { delete r['ts-x09'].reviewReason; }, /invalid REVIEW/);
invalid(r => { delete r['ts-x09'].followUp; }, /invalid REVIEW/);
assert.throws(() => validateLearningLevelRegistry(registry, [...ALL_QUESTIONS, ALL_QUESTIONS[0]]), /duplicate bank ID/);
assert.throws(() => validateLearningLevelRegistry(null, ALL_QUESTIONS), /expected an ID registry/);

// A valid-looking but unapproved level must also fail the approved-baseline fingerprint.
const fabricated = copy(); fabricated['l1-01'].learningLevel = 5;
assert.throws(() => verifyLearningLevelBaseline(ALL_QUESTIONS, fabricated), /approved audit baseline/);
const drifted = structuredClone(ALL_QUESTIONS); drifted[0].correct = [1];
assert.throws(() => verifyLearningLevelBaseline(drifted, registry), /bank content/);

function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

// Legacy topic and difficulty pools: metadata lookup has no filtering side effects.
for (const { id: mode } of QUIZ_MODES) {
  for (const difficulty of ['beginner', 'mixed']) {
    const expected = ALL_QUESTIONS.filter(q => (difficulty === 'mixed' || q.difficulty === 'beginner') &&
      (mode === 'mixed' ? difficulty === 'beginner' || q.group !== 'visual-l1' : q.group === mode));
    assert.deepEqual(getExamPool(mode, difficulty), expected);
    assert.deepEqual(filterExamDifficulty(ALL_QUESTIONS, difficulty), ALL_QUESTIONS.filter(q =>
      difficulty === 'mixed' || q.difficulty === 'beginner'));
    for (const count of [1, 5, 10, 15, 20, 30]) {
      const before = getRandomQuestions(mode, count, seeded(171), difficulty);
      for (const q of ALL_QUESTIONS) getLearningLevelMetadata(q.id);
      assert.deepEqual(getRandomQuestions(mode, count, seeded(171), difficulty), before);
    }
  }
}
assert.equal(getExamPool('mixed', 'beginner').length, 244);
assert.ok(getExamPool('mixed', 'beginner').some(q => getLearningLevelMetadata(q.id).learningLevel === 3),
  'new Application metadata does not exclude a legacy beginner question');

// Restore by ID, with and without legacy difficulty / shuffled answerOrders.
// Include REVIEW and a new-level-3 legacy beginner; preserve duplicate family in old attempts.
const source = ['ts-x09', 'l1v2-a-contact-solid', 'l1-01'].map(id => ALL_QUESTIONS.find(q => q.id === id));
const families = new Map();
for (const q of ALL_QUESTIONS) { const key = q.family || q.id; const list = families.get(key) || []; list.push(q); families.set(key, list); }
source.push(...[...families.values()].find(list => list.length > 1 && list.every(q => !source.includes(q))).slice(0, 2));
const now = 1_800_000_000_000;
for (const difficulty of [undefined, 'beginner', 'mixed']) {
  for (const shuffled of [false, true]) {
    const prepared = shuffled ? prepareAttemptQuestions(source, seeded(171)) : { questions: source };
    const saved = { ...prepared, currentIndex: 1,
      userAnswers: { [source[0].id]: prepared.questions[0].correct }, submittedQuestions: { [source[0].id]: true },
      startTime: now - 1000, isCompleted: false, mode: 'mixed', feedbackMode: 'exam',
      attemptId: 'old-attempt', progressEpoch: 'old-epoch',
      ...(difficulty ? { difficulty, requestedCount: 10 } : {}) };
    const raw = JSON.stringify(saved);
    const restored = restoreSession(raw, ALL_QUESTIONS, now);
    assert.ok(restored);
    for (const key of Object.keys(saved)) assert.deepEqual(restored[key], saved[key], `restore ${key}`);
    assert.equal(restored.difficulty, difficulty);
    assert.equal(restored.requestedCount, difficulty ? 10 : undefined);
    assert.deepEqual(restored.questions.map(q => q.id), source.map(q => q.id));
    assert.ok(restored.questions.every(q => !Object.hasOwn(q, 'learningLevel')));
    assert.equal(JSON.stringify(saved), raw, 'saved snapshot is not mutated');
  }
}
assert.equal(JSON.stringify(ALL_QUESTIONS), bankBefore, 'metadata and restore never mutate the bank');

// Legacy samplers remain independent; the new five-level selector consumes metadata separately.
for (const path of ['src/data/questionsData.ts', 'src/data/mixedExam.ts', 'src/data/beginnerExam.ts']) {
  assert.doesNotMatch(readFileSync(new URL('../' + path, import.meta.url), 'utf8'), /from\s+['"][^'"]*(?:learningLevels|questionLearningLevels|types\/learningLevel)['"]/);
}
console.log('OK: five-level coverage, validation failures, exact audit mapping, legacy pools/selections and six saved-session variants');

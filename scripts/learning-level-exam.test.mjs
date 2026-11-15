import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';
const { ALL_QUESTIONS, QUIZ_MODES, QUESTION_LEARNING_LEVELS: registry, filterLearningLevel,
  getLearningLevelPool, getLearningLevelQuestions, getExamLevelLabel, LEARNING_LEVEL_REVIEW_COUNT,
  prepareAttemptQuestions, restoreSession, confirmAnswer, recordConfirmedAnswers,
  serializeReview, restoreReview, reviewRows } =
  await bundleEntry('scripts/learning-level-exam-entry.ts', 'learning-level-exam-tests.mjs');
const seeded = seed => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
const originalBank = JSON.stringify(ALL_QUESTIONS);
const originalRegistry = JSON.stringify(registry);
const totals = [216, 144, 357, 53, 3];
const review = ALL_QUESTIONS.filter(q => registry[q.id].status === 'REVIEW');
assert.equal(review.length, 14);
assert.equal(LEARNING_LEVEL_REVIEW_COUNT, 14);
const assigned = [];
for (const level of [1, 2, 3, 4, 5]) {
  const all = getLearningLevelPool('mixed', level);
  assert.equal(all.length, totals[level - 1]);
  assigned.push(...all.map(q => q.id));
  assert.deepEqual(filterLearningLevel(review, level), []);
  assert.deepEqual(getLearningLevelQuestions('mixed', 10, seeded(1), level, review), []);
  for (const { id: mode } of QUIZ_MODES) {
    const expected = ALL_QUESTIONS.filter(q => (mode === 'mixed' || q.group === mode) &&
      registry[q.id].status === 'ASSIGNED' && registry[q.id].learningLevel === level);
    assert.deepEqual(getLearningLevelPool(mode, level), expected, 'counts and topic scope match registry exactly');
    for (const count of [1, 5, 10, 15, 20, 30]) for (let seed = 1; seed <= 20; seed++) {
      const selected = getLearningLevelQuestions(mode, count, seeded(seed), level);
      assert.equal(selected.length, Math.min(count, expected.length));
      assert.equal(new Set(selected.map(q => q.id)).size, selected.length);
      assert.ok(selected.every(q => expected.includes(q)));
      assert.deepEqual(selected, getLearningLevelQuestions(mode, count, seeded(seed), level));
    }
  }
}
assert.equal(assigned.length, 773);
assert.equal(new Set(assigned).size, 773);
assert.equal(getLearningLevelQuestions('mixed', 30, seeded(1), 5).length, 3, 'no top-up of Expert');
assert.equal(getLearningLevelQuestions('visual-l1', 10, seeded(1), 5).length, 0, 'no foreign topic/level');
const appliedWithBeginner = getLearningLevelPool('mixed', 3).find(q => q.difficulty === 'beginner');
const fundamentalsWithAdvanced = getLearningLevelPool('mixed', 1).find(q => q.difficulty === 'advanced');
assert.ok(appliedWithBeginner && fundamentalsWithAdvanced, 'registry wins over legacy difficulty');
for (let seed = 1; seed <= 1000; seed++) {
  const selected = getLearningLevelQuestions('mixed', 10, seeded(seed), 1);
  assert.equal(new Set(selected.map(q => q.family || q.id)).size, 10);
  assert.ok(selected.some(q => q.image), 'shared photo/family guarantees still apply');
}
const custom = [review[0], appliedWithBeginner, fundamentalsWithAdvanced, appliedWithBeginner];
assert.deepEqual(getLearningLevelQuestions('mixed', 10, seeded(2), 3, custom), [appliedWithBeginner]);
assert.deepEqual(getLearningLevelQuestions('mixed', 10, seeded(2), 1, custom), [fundamentalsWithAdvanced]);
assert.deepEqual(getLearningLevelQuestions('mixed', 10, seeded(2), 4, custom), []);
assert.deepEqual(getLearningLevelQuestions('mixed', 10, seeded(2), 1, []), []);
assert.throws(() => filterLearningLevel([{ ...appliedWithBeginner, id: 'unknown' }], 3), /unknown ID/);
for (const value of [0, 6, '3', null, 1.5]) assert.throws(() => filterLearningLevel([], value), RangeError);

// New snapshots and legacy ones restore by ID without applying the current registry filter.
const now = Date.now();
for (const marker of [{}, { difficulty: 'beginner' }, { difficulty: 'mixed' }, ...[1, 2, 3, 4, 5].map(learningLevel => ({ learningLevel }))]) {
  for (const shuffled of [false, true]) {
    const source = marker.learningLevel ? getLearningLevelPool('mixed', marker.learningLevel).slice(0, 3) : [review[0], appliedWithBeginner, fundamentalsWithAdvanced];
    let saved = { ...(shuffled ? prepareAttemptQuestions(source, seeded(1)) : { questions: source }),
      currentIndex: 0, userAnswers: {}, submittedQuestions: {}, startTime: now - 1000,
      isCompleted: false, mode: 'mixed', feedbackMode: 'instant', attemptId: 'levels-compat', progressEpoch: 'level-epoch',
      requestedCount: 10, ...marker };
    saved = confirmAnswer(saved, saved.questions[0].correct, now);
    const raw = JSON.stringify(saved);
    const restored = restoreSession(raw, ALL_QUESTIONS, now);
    assert.ok(restored);
    for (const key of Object.keys(saved)) assert.deepEqual(restored[key], saved[key], key);
    // Switching a UI preference / querying another pool must never rewrite a running attempt.
    for (const level of [1, 2, 3, 4, 5]) getLearningLevelQuestions('mixed', 10, seeded(2), level);
    assert.equal(JSON.stringify(saved), raw);
    const events = [];
    recordConfirmedAnswers(restored, (...args) => events.push(args));
    assert.equal(events.length, 1);
    assert.equal(events[0][2], `levels-compat:${source[0].id}`);
    assert.equal(events[0][3], 'level-epoch');
    const completed = { ...restored, isCompleted: true };
    const reviewed = restoreReview(serializeReview(completed), 'level-epoch');
    assert.deepEqual(reviewed.questions, completed.questions);
    assert.equal(reviewed.learningLevel, marker.learningLevel);
    assert.equal(reviewRows(reviewed)[0].status, 'correct');
    for (const value of [0, 6, '3', null, 1.5]) {
      assert.equal(restoreSession(JSON.stringify({ ...saved, learningLevel: value }), ALL_QUESTIONS, now), null);
      assert.equal(restoreReview(serializeReview({ ...completed, learningLevel: value }), 'level-epoch'), null);
    }
  }
}
assert.equal(getExamLevelLabel({ learningLevel: 5 }), 'Эксперт');
assert.match(getExamLevelLabel({ difficulty: 'beginner' }), /База/);
assert.match(getExamLevelLabel({}), /Смешанный/);
assert.equal(JSON.stringify(ALL_QUESTIONS), originalBank);
assert.equal(JSON.stringify(registry), originalRegistry);
console.log('PASS: five registry levels, 14 REVIEW excluded, all topics/counts, 1000 samples, shortages, custom mistakes and 16 old/new session variants');

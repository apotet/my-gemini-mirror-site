import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';
const { ALL_QUESTIONS, QUIZ_MODES, QUESTION_LEARNING_LEVELS: registry, filterLearningLevel,
  getLearningLevelPool, getLearningLevelQuestions, getTestingPool, getTestingQuestions, getExamLevelLabel, LEARNING_LEVEL_REVIEW_COUNT,
  prepareAttemptQuestions, restoreSession, confirmAnswer, recordConfirmedAnswers,
  expireTrial, TRIAL_MINUTES, TRIAL_QUESTION_COUNT,
  serializeReview, restoreReview, reviewRows } =
  await bundleEntry('scripts/learning-level-exam-entry.ts', 'learning-level-exam-tests.mjs');
const seeded = seed => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
const originalBank = JSON.stringify(ALL_QUESTIONS);
const originalRegistry = JSON.stringify(registry);
// Independent acceptance oracle: read the source JSON, not the selector's derived pools.
const sourceRegistry = JSON.parse(readFileSync(new URL('../src/data/questionLearningLevels.json', import.meta.url), 'utf8'));
const totals = [218, 145, 359, 53, 3];
const review = ALL_QUESTIONS.filter(q => registry[q.id].status === 'REVIEW');
assert.equal(review.length, 9);
assert.equal(LEARNING_LEVEL_REVIEW_COUNT, 9);
const understanding = ALL_QUESTIONS.filter(({ id }) =>
  sourceRegistry[id].status === 'ASSIGNED' && sourceRegistry[id].learningLevel === 2);
assert.equal(understanding.length, 145);
for (const { id: mode } of QUIZ_MODES) {
  const pool = understanding.filter(q => mode === 'mixed' || q.group === mode);
  assert.deepEqual(getTestingPool(mode, 'in-depth'), pool);
  const questions = getTestingQuestions(mode, 30, seeded(17), 'in-depth');
  assert.equal(questions.length, Math.min(pool.length, 30));
  assert.ok(questions.every(q => pool.includes(q)));
}
const understandingCustom = [...understanding.slice(0, 3), ...review];
assert.deepEqual(new Set(getTestingQuestions('mixed', 10, seeded(17), 'in-depth', understandingCustom)),
  new Set(understanding.slice(0, 3)));
assert.deepEqual(getTestingQuestions('mixed', 10, seeded(17), 'in-depth', review), []);
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
assert.equal(assigned.length, 778);
assert.equal(new Set(assigned).size, 778);
assert.equal(getLearningLevelQuestions('mixed', 30, seeded(1), 5).length, 3, 'no top-up of Expert');
assert.equal(getLearningLevelQuestions('visual-l1', 10, seeded(1), 5).length, 0, 'no foreign topic/level');
const appliedWithBeginner = getLearningLevelPool('mixed', 3).find(q => q.difficulty === 'beginner');
const fundamentalsWithAdvanced = getLearningLevelPool('mixed', 1).find(q => q.difficulty === 'advanced');
assert.ok(appliedWithBeginner && fundamentalsWithAdvanced, 'registry wins over legacy difficulty');
for (const level of [1, 2, 3, 4, 5]) {
  const expectedIds = ALL_QUESTIONS.filter(q => sourceRegistry[q.id].status === 'ASSIGNED' &&
    sourceRegistry[q.id].learningLevel === level).map(q => q.id);
  assert.deepEqual(getLearningLevelPool('mixed', level).map(q => q.id), expectedIds);
  // Even if every legacy difficulty claims beginner/advanced, registry membership wins.
  for (const difficulty of ['beginner', 'advanced', undefined]) {
    const altered = ALL_QUESTIONS.map(q => ({ ...q, difficulty }));
    assert.deepEqual(filterLearningLevel(altered, level).map(q => q.id), expectedIds);
  }
  for (let seed = 1; seed <= 1000; seed++) {
    const selected = getLearningLevelQuestions('mixed', 10, seeded(seed), level);
    assert.equal(selected.length, Math.min(10, expectedIds.length));
    assert.equal(new Set(selected.map(q => q.id)).size, selected.length);
    for (const q of selected) {
      assert.equal(sourceRegistry[q.id].status, 'ASSIGNED', `REVIEW leaked into L${level}: ${q.id}`);
      assert.equal(sourceRegistry[q.id].learningLevel, level, `foreign level leaked into L${level}: ${q.id}`);
    }
    if (level === 1) {
      assert.equal(new Set(selected.map(q => q.family || q.id)).size, 10);
      assert.ok(selected.some(q => q.image), 'shared photo/family guarantees still apply');
    }
  }
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
console.log('PASS: direct JSON oracle, 1000 samples per level (5000 total), no foreign levels/REVIEW/duplicate IDs, legacy-difficulty independence, counts and 16 old/new session variants');

const trialStart = Date.now();
const trialDeadline = trialStart + 15 * 60_000;
assert.equal(TRIAL_MINUTES, 15);
assert.equal(TRIAL_QUESTION_COUNT, 20);
const trialQuestions = getTestingQuestions('mixed', TRIAL_QUESTION_COUNT, seeded(29), 'mixed');
assert.equal(new Set(trialQuestions.map(q => q.id)).size, 20);
const trial = { ...prepareAttemptQuestions(trialQuestions, seeded(29)), trialDeadline,
  currentIndex: 0, userAnswers: {}, submittedQuestions: {}, isCompleted: false, startTime: trialStart,
  difficulty: 'mixed', mode: 'mixed', feedbackMode: 'exam', progressEpoch: 'trial-epoch', attemptId: 'trial-1' };
const confirmedTrial = confirmAnswer(trial, trial.questions[0].correct, trialDeadline - 1);
assert.notEqual(confirmedTrial, trial);
assert.equal(confirmAnswer(trial, trial.questions[0].correct, trialDeadline), trial);
assert.equal(expireTrial(confirmedTrial, trialDeadline - 1), confirmedTrial);
assert.equal(restoreSession(JSON.stringify({ ...confirmedTrial, feedbackMode: 'instant' }), ALL_QUESTIONS, trialDeadline), null);
const restoredTrial = restoreSession(JSON.stringify(confirmedTrial), ALL_QUESTIONS, trialDeadline);
assert.equal(restoredTrial.trialDeadline, trialDeadline);
let writes = 0;
const record = () => { writes++; return true; };
recordConfirmedAnswers(restoredTrial, record);
assert.equal(writes, 0);
const expiredTrial = expireTrial(restoredTrial, trialDeadline + 1000);
assert.equal(expiredTrial.endTime, trialDeadline);
assert.equal(expireTrial(expiredTrial, trialDeadline + 2000), expiredTrial);
recordConfirmedAnswers(expiredTrial, record);
assert.equal(writes, 1);
const timedReview = restoreReview(serializeReview(expiredTrial), 'trial-epoch');
assert.equal(timedReview.trialDeadline, trialDeadline);
const reviewedRows = reviewRows(timedReview);
assert.equal(reviewedRows.filter(row => row.status === 'correct').length, 1);
assert.equal(reviewedRows.filter(row => row.status === 'unanswered').length, 19);
console.log('PASS: trial deadline survives restore, no late answers or early score, timeout reviews confirmed answers');

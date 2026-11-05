import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';
const { prepareAttemptQuestions, restoreSession, confirmAnswer, recordConfirmedAnswers,
  createProgressStore, reviewRows, serializeReview, restoreReview, ALL_QUESTIONS,
  getRandomQuestions } = await bundleEntry('scripts/answer-order-entry.ts', 'answer-order-tests.mjs');

let seed = 0x12345678;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const single = { id: 'single', group: 'l1-l2', topic: 'test', text: 'Single',
  answers: ['correct', 'wrong-1', 'wrong-2', 'wrong-3'], correct: [0], explanation: 'test' };
const multi = { ...single, id: 'multi', text: 'Multi', correct: [0, 2] };
const bank = [single, multi];
const original = JSON.stringify(bank);

const deterministic = prepareAttemptQuestions(bank, () => 0);
assert.deepEqual(deterministic.answerOrders.single, [1, 2, 3, 0]);
assert.deepEqual(deterministic.questions[0].correct, [3]);
assert.deepEqual(deterministic.questions[1].correct, [1, 3]);
for (const q of deterministic.questions) {
  const source = bank.find(item => item.id === q.id);
  assert.deepEqual(q.correct.map(i => q.answers[i]).sort(), source.correct.map(i => source.answers[i]).sort());
}

// Identity and non-identity permutations are both valid; duplicate answer text cannot identify indices.
assert.deepEqual(prepareAttemptQuestions([single], () => 0.999).questions[0], single);
const duplicate = { ...single, answers: ['same', 'same', 'other', 'last'], correct: [1] };
const now = Date.now();
const make = (questions = bank, mode = 'mixed', feedbackMode = 'instant') => ({
  ...prepareAttemptQuestions(questions, random), mode, feedbackMode, currentIndex: 0,
  userAnswers: {}, submittedQuestions: {}, startTime: now, isCompleted: false,
  attemptId: `attempt-${seed}`, progressEpoch: 'test-epoch', legacySubmittedIds: [] });
const restore = (s, source = bank) => restoreSession(JSON.stringify(s), source, now);
assert.deepEqual(restore(make([duplicate]), [duplicate]).questions[0].correct.length, 1);
for (const mode of ['mixed', 'l1-l2', 'l3', 'l4', 'l5-l7', 'tcpip', 'troubleshooting', 'visual-l1']) {
  for (const feedback of ['instant', 'exam']) {
    // Selection remains the existing implementation; preparation retains IDs and question order.
    const selected = getRandomQuestions(mode, 10, random);
    const prepared = make(selected, mode, feedback);
    assert.deepEqual(prepared.questions.map(q => q.id), selected.map(q => q.id));
    assert.deepEqual(restore(prepared, ALL_QUESTIONS), prepared);
  }
}
for (const feedback of ['instant', 'exam']) {
  let s = make(bank, 'mixed', feedback);
  s.userAnswers.single = [1]; // unconfirmed draft survives reload
  assert.deepEqual(restore(s), s);
  s = confirmAnswer(restore(s), s.questions[0].correct, now);
  assert.deepEqual(restore(s), s, 'reload after confirmation');
  assert.equal(confirmAnswer(s, [1]), s, 'cannot reconfirm');
  s = { ...restore(s), currentIndex: 1 };
  const q = s.questions[1];
  const partial = confirmAnswer(s, [q.correct[0]], now);
  assert.equal(reviewRows({ ...partial, isCompleted: true })[1].status, 'wrong');
  s = confirmAnswer(s, [...q.correct].reverse(), now);
  const completed = { ...s, isCompleted: true };
  const saved = restoreReview(serializeReview(completed), s.progressEpoch);
  for (const row of reviewRows(saved)) {
    assert.equal(row.status, 'correct');
    assert.deepEqual(row.chosen.map(i => row.question.answers[i]).sort(),
      bank.find(q => q.id === row.question.id).correct.map(i => bank.find(q => q.id === row.question.id).answers[i]).sort());
  }
  assert.deepEqual(saved.questions, completed.questions);
}
// Legacy attempt retains the original order and both confirmed/draft selections.
const legacy = { ...make(), questions: bank, userAnswers: { single: [0], multi: [2] }, submittedQuestions: { single: true } };
delete legacy.answerOrderVersion; delete legacy.answerOrders;
assert.deepEqual(restore(legacy), legacy);
const oldest = { ...legacy }; delete oldest.attemptId; delete oldest.progressEpoch;
delete oldest.legacySubmittedIds;
const migrated = restore(oldest);
assert.deepEqual(migrated.questions, bank);
assert.deepEqual(migrated.userAnswers, oldest.userAnswers);
assert.deepEqual(migrated.legacySubmittedIds, ['single']);
// Corrupt or incompatible order metadata must never silently regrade a chosen index.
for (const patch of [
  { answerOrderVersion: 2 }, { answerOrders: {} }, { answerOrders: { single: [0, 0, 2, 3] } },
  { answerOrders: { single: [0, 1, 2, 9] } }, { answerOrders: { single: [0, 1] } },
  { answerOrders: { single: [0, 1, 2, '3'] } },
]) assert.equal(restore({ ...make(), ...patch }), null);
const tampered = make(); tampered.questions[0].correct = [0, 1, 2, 3];
assert.equal(restore(tampered), null);
const changed = make();
assert.equal(restore(changed, [{ ...single, answers: ['changed', ...single.answers.slice(1)] }, multi]), null);
const unversioned = { ...legacy, answerOrders: {} }; assert.equal(restore(unversioned), null);

// Mistakes pool, two successive successes, receipt deduplication, interrupted save recovery.
const data = new Map();
const storage = { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) };
let progress = createProgressStore(bank, () => storage, () => now);
progress.record(single.id, false, 'initial-error', progress.load().epoch, now);
for (let pass = 1; pass <= 2; pass++) {
  const pool = progress.mistakes();
  assert.deepEqual(pool.map(q => q.id), ['single']);
  let s = { ...make(pool), attemptId: `mistakes-${pass}`, progressEpoch: progress.load().epoch };
  s = confirmAnswer(s, s.questions[0].correct, now);
  // Session is saved first; a fresh store repairs the missed record once.
  s = restore(s);
  progress = createProgressStore(bank, () => storage, () => now);
  recordConfirmedAnswers(s, progress.record);
  const before = progress.export();
  recordConfirmedAnswers(restore(s), progress.record);
  assert.equal(progress.export(), before);
  assert.equal(progress.load().questions.single.streak, pass);
  for (let i = 0; i < 3; i++) {
    const review = restoreReview(serializeReview({ ...s, isCompleted: true }), s.progressEpoch);
    reviewRows(review); recordConfirmedAnswers(review, progress.record);
  }
  assert.equal(progress.export(), before, 'reopening review/replay never charges twice');
}
assert.equal(progress.mistakes().length, 0);
assert.equal(progress.summary().answeredCount, 3);
assert.equal(progress.summary().correctCount, 2);
// A missing/corrupt progress model can migrate a saved shuffled confirmation too.
const recoveryData = new Map();
const recoveryStorage = { getItem: k => recoveryData.get(k) ?? null, setItem: (k, v) => recoveryData.set(k, v), removeItem: k => recoveryData.delete(k) };
const recoveryAttempt = { ...make([single]), ...prepareAttemptQuestions([single], () => 0) };
const recoveryConfirmed = confirmAnswer(recoveryAttempt, recoveryAttempt.questions[0].correct, now);
recoveryStorage.setItem('osi_active_session', JSON.stringify(recoveryConfirmed));
const recovery = createProgressStore(bank, () => recoveryStorage, () => now);
assert.equal(recovery.summary().correctCount, 1, 'migration scores displayed indices, not bank indices');
assert.equal(recovery.summary().answeredCount, 1);
recordConfirmedAnswers(recoveryConfirmed, recovery.record);
assert.equal(recovery.summary().answeredCount, 1, 'old epoch cannot replay migrated answer');
assert.equal(JSON.stringify(bank), original, 'preparing attempts never mutates the bank');
assert.equal(ALL_QUESTIONS.length, 617);
assert.equal(ALL_QUESTIONS.filter(q => q.group !== 'visual-l1').length, 416);
console.log('OK: answer order, every mode, single/multi, reload, legacy, corruption, review, mistakes streak and receipts');

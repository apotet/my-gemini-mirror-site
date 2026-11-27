import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';
import {
  bankBeforeWiremapLimitRetirement, registryBeforeWiremapLimitRetirement, retiredWiremapLimitPhoto as retired,
} from './copper-photo-history-fixtures.mjs';

const m = await bundleEntry('scripts/learning-level-exam-entry.ts', 'wiremap-retirement-runtime.mjs');
const { LESSONS, QUESTION_SECTION_LINKS } = await bundleEntry('scripts/lesson-section-links-entry.ts', 'wiremap-retirement-lessons.mjs');
const { createProgressStore, PROGRESS_KEY } = await bundleEntry('src/utils/userProgress.ts', 'wiremap-retirement-storage.mjs');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const read = relative => JSON.parse(readFileSync(new URL('../' + relative, import.meta.url), 'utf8'));
const questions = read('src/data/questions.json'), registry = read('src/data/questionLearningLevels.json');
const { id } = retired;

// Frozen exact source snapshots independently projected from 3a80d362 (prior to retirement).
assert.equal(hash(bankBeforeWiremapLimitRetirement(questions)), 'ac58c76620f03f74858f3d2c015c142f85508abdb4b7ba17aa1a418bc55f64df');
assert.equal(hash(registryBeforeWiremapLimitRetirement(registry)), '7947d3faf8b94d7f4ad1074d8be01d8ecc1d0290da67720e33c5ddc0902ff5a6');
assert.deepEqual(retired.correct, [3]);
assert.equal(m.ALL_QUESTIONS.length, 860);
assert.ok(!m.ALL_QUESTIONS.some(q => q.id === id));
assert.ok(!Object.hasOwn(m.QUESTION_LEARNING_LEVELS, id));
assert.equal(m.getLessonForQuestion(id), undefined);
assert.ok(!LESSONS.some(lesson => lesson.relatedQuestionIds.includes(id)));
assert.ok(!QUESTION_SECTION_LINKS.some(link => link.questionIds.includes(id)));
assert.deepEqual(m.ALL_QUESTIONS.filter(q => q.image === retired.image).map(q => q.id), ['l1v2-a-tester','l1v2-a-tester-safe']);
assert.equal(m.resolveImageUrl(retired.image),
  'https://raw.githubusercontent.com/apotet/osi-tcpip-exam-public/1c52fa81222167dc4377fe4788de86f3e36ad444/assets/photos/copper-tester.webp');

const absent = items => assert.ok(items.every(q => q.id !== id), 'retired item cannot be sampled');
const seeded = seed => () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32;
for (const { id: mode } of m.QUIZ_MODES) {
  for (const level of [1, 2, 3, 4, 5]) absent(m.getLearningLevelPool(mode, level));
  for (const difficulty of ['beginner', 'in-depth', 'applied', 'mixed']) absent(m.getTestingPool(mode, difficulty));
}
for (const difficulty of ['basic', 'advanced', 'mixed']) for (let seed = 1; seed <= 50; seed++) {
  const picked = m.getTrialExamQuestions(difficulty, seeded(seed));
  assert.equal(picked.length, 20);
  absent(picked);
}

function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)};
}
const now = 1_800_000_000_000;
const startTime = now - 10_000, seenAt = now - 5_000;
const local = storage(), create = (bank, target, retiredIds) => createProgressStore(bank, () => target, () => now, retiredIds);
const old = create(bankBeforeWiremapLimitRetirement(m.ALL_QUESTIONS), local);
const progressEpoch = old.load().epoch;
assert.ok(old.record(id, false, 'old-wiremap-receipt', progressEpoch, seenAt));
const existingProgress = local.getItem(PROGRESS_KEY);
const makeAttempt = (prepared, n) => {
  const confirmed = prepared.questions[0].correct;
  return { ...prepared, currentIndex: 0, startTime, mode: 'visual-l1', feedbackMode: 'instant', isCompleted: false,
    progressEpoch, attemptId: 'frozen-wiremap-' + n, userAnswers: {[id]: confirmed}, submittedQuestions: {[id]: true},
    answerTimes: {[id]: seenAt} };
};
const shuffled = m.prepareAttemptQuestions([retired], () => 0.5);
assert.notDeepEqual(shuffled.questions[0].correct, retired.correct, 'displayed key must differ from bank key');
const after = create(m.ALL_QUESTIONS, local, [retired]);
assert.equal(after.summary().answeredCount, 1);
assert.equal(after.summary().levels['visual-l1'].total, 1);
assert.equal(after.summary().visualTotal, 191);
assert.equal(local.getItem(PROGRESS_KEY), existingProgress, 'startup never rewrites previous scores');
assert.deepEqual(after.mistakes(), []);
for (const [n, prepared] of [ {questions:[retired]}, shuffled ].entries()) {
  const attempt = makeAttempt(prepared, n);
  const raw = JSON.stringify(attempt);
  const parsed = m.restoreSession(raw, m.ALL_QUESTIONS, now);
  assert.deepEqual(parsed.questions, attempt.questions);
  assert.deepEqual(parsed.userAnswers, attempt.userAnswers);
  assert.deepEqual(parsed.answerOrders, attempt.answerOrders);
  const last = m.restoreReview(m.serializeReview({...parsed, isCompleted:true, endTime:now}), progressEpoch);
  assert.deepEqual(last.questions, attempt.questions);
  assert.equal(m.reviewRows(last)[0].status, 'correct');
  assert.equal(m.reviewRows(last)[0].lesson, undefined);
  const migrated = create(m.ALL_QUESTIONS, storage({osi_active_session:raw}), [retired]);
  assert.equal(migrated.summary().correctCount, 1, 'use the historic displayed answer key on cold migration');
  m.recordConfirmedAnswers(parsed, after.record);
  m.recordConfirmedAnswers(parsed, after.record);
}
assert.equal(after.summary().answeredCount, 3);
assert.equal(after.summary().correctCount, 2);
assert.ok(after.load().receipts['old-wiremap-receipt']);
assert.deepEqual(after.mistakes(), []);
for (const mutate of [
  a => { a.questions[0].text += '!'; },
  a => { a.questions[0].image = 'assets/photos/not-tester.webp'; },
  a => { a.questions[0].answers[0] += '!'; },
  a => { a.questions[0].correct = [3]; },
  a => { delete a.answerOrders[id]; },
  a => { a.answerOrders[id] = [0, 0, 1, 2]; },
]) {
  const attempt = makeAttempt(structuredClone(shuffled), 'bad');
  mutate(attempt);
  const raw = JSON.stringify(attempt);
  assert.equal(m.restoreSession(raw, m.ALL_QUESTIONS, now), null);
  assert.equal(create(m.ALL_QUESTIONS, storage({osi_active_session:raw}), [retired]).summary().answeredCount, 0);
}
// Archived reviews with and without shuffle metadata accept all 24 exact historical permutations.
const permutations = items => items.length < 2 ? [items] : items.flatMap((item, index) =>
  permutations(items.filter((_, i) => i !== index)).map(rest => [item, ...rest]));
for (const order of permutations([0,1,2,3])) {
  const questions = [{...retired, answers:order.map(i=>retired.answers[i]), correct:[order.indexOf(retired.correct[0])]}];
  for (const explicitOrder of [false,true]) {
    const archived = {...makeAttempt({questions}, 'review'), isCompleted:true, endTime:now,
      ...(explicitOrder ? {answerOrders:{[id]:order}} : {})};
    assert.deepEqual(m.restoreReview(m.serializeReview(archived), progressEpoch).questions, questions);
    for (const mutate of [
      a => { a.questions[0].text += '!'; },
      a => { a.questions[0].image = 'assets/photos/not-tester.webp'; },
      a => { a.questions[0].imageAlt += '!'; },
      a => { a.questions[0].answers[0] += '!'; },
      a => { a.questions[0].answers[0] = a.questions[0].answers[1]; },
      a => { a.questions[0].correct = [(questions[0].correct[0] + 1) % 4]; },
      a => { a.answerOrders = {}; },
      a => { a.answerOrders = {[id]:[order[1], order[0], order[2], order[3]]}; },
    ]) {
      const bad = structuredClone(archived);
      mutate(bad);
      assert.equal(m.restoreReview(m.serializeReview(bad), progressEpoch), null);
    }
  }
}
console.log('PASS: only wiremap screen item retired; asset/sibling tickets, frozen bank/registry, old attempt/review/migration/receipts preserved');

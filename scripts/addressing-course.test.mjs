import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const {
  COURSE_BUCKETS, COURSE_LESSON_IDS, COURSE_PASS_SCORE, COURSE_QUESTION_COUNT, COURSE_STORAGE_KEY,
  emptyCourseState, makeCourseAttempt, startCourseAttempt, answerCourseQuestion, scoreCourseAttempt,
  courseAttemptPassed, readCourseStorage, writeCourseStorage,
} = await bundleEntry('src/data/addressingCourse.ts', 'addressing-course-test.mjs');
const { ALL_QUESTIONS } = await bundleEntry('scripts/data-entry.ts', 'addressing-course-bank-test.mjs');

const seededRandom = seed => () => ((seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 2 ** 32);
const lessonIds = ['l3-masks', 'l3-private-ipv4', 'l3-subnets', 'l3-ipv6'];
const approvedIds = [
  ['l3-12', 'l3-06', 'gen-bin-dec-128', 'gen-bin-dec-252', 'gen-mask-30'],
  ['gen-bc-25-2', 'gen-bc-26-1', 'gen-hosts-27', 'l3-11', 'gen-net-29-0', 'l3-d02', 'new-l3-23', 'gap-pack1-06', 'gen-block-28'],
  ['review-ndp-1', 'review-ndp-2', 'review-ndp-3', 'review-slaac-4', 'review-slaac-5', 'l3-d06'],
];

assert.deepEqual(COURSE_LESSON_IDS, lessonIds);
assert.equal(COURSE_PASS_SCORE, 16);
assert.equal(COURSE_QUESTION_COUNT, 20);
assert.deepEqual(COURSE_BUCKETS.map(bucket => bucket.quota), [5, 9, 6]);
assert.deepEqual(COURSE_BUCKETS.map(bucket => bucket.questionIds), approvedIds);
const bank = new Map(ALL_QUESTIONS.map(question => [question.id, question]));
const optionPositions = new Set();

for (let seed = 1; seed <= 32; seed++) {
  const attempt = makeCourseAttempt(`seed-${seed}`, seededRandom(seed));
  assert.ok(attempt);
  assert.equal(new Set(attempt.questions.map(question => question.family)).size, 20);
  assert.deepEqual(
    COURSE_BUCKETS.map(bucket => attempt.questions.filter(question => question.bucketId === bucket.id).map(question => question.id).sort()),
    approvedIds.map(ids => [...ids].sort()),
  );
  assert.deepEqual(attempt, makeCourseAttempt(`seed-${seed}`, seededRandom(seed)));
  assert.notDeepEqual(attempt.questions.map(question => question.id), approvedIds.flat(), 'display should not use blueprint order');
  for (const question of attempt.questions) {
    const source = bank.get(question.id);
    assert.equal(question.family, source.family || source.id);
    assert.equal(question.text, source.text);
    assert.equal(question.explanation, source.explanation);
    assert.deepEqual([...question.options].sort(), [...source.answers].sort());
    assert.equal(question.options[question.correct[0]], source.answers[source.correct[0]]);
    optionPositions.add(question.correct[0]);
  }

  const byId = Object.fromEntries(attempt.questions.map(question => [question.id, question]));
  assert.equal(byId['gen-bc-25-2'].sectionId, 'ipv4-on-link-different-masks');
  assert.equal(byId['review-ndp-3'].sectionId, 'ipv6-dad-tentative-na-duplicate');
  assert.equal(byId['l3-12'].lessonId, 'l3-private-ipv4');
  assert.equal(byId['l3-12'].sectionId, undefined);
  assert.equal(byId['gen-bin-dec-252'].skill, 'Полная маска → префикс');
  assert.equal(attempt.questions.filter(question => question.skill === 'Перевод двоичного октета').length, 1);
  assert.ok(new Set(attempt.questions.map(question => question.skill)).size < 20, 'not all families represent distinct skills');
}
assert.equal(optionPositions.size, 4);

const id = approvedIds[0][0];
const duplicateFamily = bank.get('l3-06').family;
const withEdit = (patch) => ALL_QUESTIONS.map(question => question.id === id ? { ...question, ...patch } : question);
assert.equal(makeCourseAttempt('missing', seededRandom(1), ALL_QUESTIONS.filter(question => question.id !== id)), null);
assert.equal(makeCourseAttempt('duplicate-id', seededRandom(1), [...ALL_QUESTIONS, bank.get(id)]), null);
assert.equal(makeCourseAttempt('duplicate-family', seededRandom(1), withEdit({ family: duplicateFamily })), null);
assert.equal(makeCourseAttempt('multi-answer', seededRandom(1), withEdit({ correct: [0, 1] })), null);
assert.equal(makeCourseAttempt('photo', seededRandom(1), withEdit({ image: 'asset' })), null);
assert.equal(makeCourseAttempt('no-answers', seededRandom(1), withEdit({ answers: [] })), null);

// Fake Storage models only the isolated data boundary. Browser races are integration coverage.
const old = new Map([
  ['osi_active_session', '{"old":"legacy attempt"}'],
  ['osi_active_session_netops_n5', '{"old":"production slot"}'],
  ['osi_user_progress_v4', '{"old":"statistics"}'],
  ['osi_last_exam_review_v1', '{"old":"last review"}'],
]);
const store = new Map(old);
const oldKeys = [...old.keys()];
const expectLegacyIntact = () => assert.deepEqual(new Map(oldKeys.map(key => [key, store.get(key)])), old);
const touched = new Set();
let deniedRead = false;
let deniedWrite = false;
const storage = {
  getItem: key => {
    touched.add(key);
    if (deniedRead) throw new Error('storage read denied');
    return store.get(key) ?? null;
  },
  setItem: (key, value) => {
    touched.add(key);
    if (deniedWrite) throw new Error('storage write denied');
    store.set(key, value);
  },
};

const persist = (next) => {
  const previous = readCourseStorage(storage);
  assert.equal(previous.status, 'ready');
  const result = writeCourseStorage(storage, previous.raw, next);
  assert.equal(result.status, 'saved');
  const existing = readCourseStorage(storage);
  assert.equal(existing.status, 'ready');
  assert.equal(existing.raw, result.raw);
  assert.deepEqual(existing.state, JSON.parse(JSON.stringify(next)));
  return existing.state;
};
assert.deepEqual(readCourseStorage(storage), { status: 'ready', raw: null, state: emptyCourseState() });
assert.equal(store.has(COURSE_STORAGE_KEY), false, 'reading must not create a course record');

const attemptId = 'first-fail';
let state = persist(startCourseAttempt(emptyCourseState(), attemptId, seededRandom(351)));
assert.equal(state.cursor.screen, 'attempt');
assert.equal(state.cursor.attemptId, attemptId);
assert.ok(state.active);
assert.equal(startCourseAttempt(state, 'cannot-erase'), null);
const currentQuestion = state.active.questions[0];
const invalidAnswer = currentQuestion.options.length;
assert.equal(answerCourseQuestion(state, invalidAnswer), null);
assert.equal(answerCourseQuestion(state, -1), null);
assert.equal(answerCourseQuestion(state, 1.5), null);

function choose(state, isCorrect) {
  const question = state.active.questions[state.active.answers.length];
  const right = question.correct[0];
  return answerCourseQuestion(state, isCorrect ? right : (right + 1) % question.options.length);
}

for (let i = 0; i < 10; i++) state = persist(choose(state, true));
assert.equal(state.active.answers.length, 10);
assert.equal(scoreCourseAttempt(state.active), 10);
assert.equal(courseAttemptPassed(state.active), false);
const stale = readCourseStorage(storage);
const losingWrite = choose(state, false);
state = persist(choose(state, true));
assert.equal(writeCourseStorage(storage, stale.raw, losingWrite).status, 'conflict');
assert.equal(readCourseStorage(storage).state.active.answers.length, 11);
assert.equal(scoreCourseAttempt(readCourseStorage(storage).state.active), 11);
for (let i = 11; i < 20; i++) state = persist(choose(state, i < 15));

assert.equal(state.active, null);
assert.equal(state.cursor.screen, 'review');
assert.equal(state.cursor.attemptId, attemptId);
assert.equal(state.history.length, 1);
assert.equal(scoreCourseAttempt(state.history[0]), 15);
assert.equal(courseAttemptPassed(state.history[0]), false);
assert.deepEqual(state.studied, []);
assert.deepEqual(state.ipv6, { compress: false, expand: false });
assert.equal(answerCourseQuestion(state, 0), null);
assert.equal(startCourseAttempt(state, attemptId), null);
const archivedFailure = structuredClone(state.history[0]);

// Studying all four steps and the separate IPv6 practice do not affect the 15/20 result.
state = persist({ ...state, studied: [...COURSE_LESSON_IDS], ipv6: { compress: true, expand: false } });
assert.equal(courseAttemptPassed(state.history[0]), false);
assert.deepEqual(state.ipv6, { compress: true, expand: false });
state = persist({ ...state, ipv6: { compress: true, expand: true } });
assert.equal(courseAttemptPassed(state.history[0]), false);

// Conversely, 16/20 is passing with no lessons marked and no writing practice, independent of both.
let independent = startCourseAttempt(emptyCourseState(), 'second-pass', seededRandom(758));
for (let i = 0; i < 20; i++) independent = choose(independent, i < 16);
assert.deepEqual(independent.studied, []);
assert.deepEqual(independent.ipv6, { compress: false, expand: false });
assert.equal(scoreCourseAttempt(independent.history[0]), 16);
assert.equal(courseAttemptPassed(independent.history[0]), true);

state = persist(startCourseAttempt(state, 'normal-retry', seededRandom(758)));
for (let i = 0; i < 20; i++) state = persist(choose(state, i < 16));
assert.deepEqual(state.history[0], archivedFailure);
assert.equal(courseAttemptPassed(state.history[1]), true);

// The reader only consumes the stored snapshot: a historic question remains displayable and scored
// with its own text and option index, not regraded by the current bank or reshuffled on reload.
const snapshot = structuredClone(state);
const historicalQuestion = snapshot.history[1].questions[0];
const liveText = bank.get(historicalQuestion.id).text;
historicalQuestion.text = 'Историческая редакция условия';
historicalQuestion.options[historicalQuestion.correct[0]] = 'Историческая подпись ответа';
const oldSnapshot = persist(snapshot);
assert.notEqual(oldSnapshot.history[1].questions[0].text, liveText);
assert.equal(scoreCourseAttempt(oldSnapshot.history[1]), 16);

const attempt = oldSnapshot.history[1];
const q = attempt.questions.find(question => question.id === 'review-ndp-3');
state = persist({ ...oldSnapshot, cursor: { screen: 'lesson', lessonId: q.lessonId, sectionId: q.sectionId, questionId: q.id, attemptId: attempt.id, mode: 'professional' } });
assert.equal(readCourseStorage(storage).state.cursor.sectionId, 'ipv6-dad-tentative-na-duplicate');
assert.equal(readCourseStorage(storage).state.cursor.mode, 'professional');

deniedRead = true;
assert.deepEqual(readCourseStorage(storage), { status: 'blocked' });
assert.deepEqual(writeCourseStorage(storage, null, emptyCourseState()), { status: 'blocked' });
deniedRead = false;
const beforeQuota = readCourseStorage(storage);
deniedWrite = true;
assert.equal(writeCourseStorage(storage, beforeQuota.raw, { ...state, cursor: { screen: 'overview' } }).status, 'blocked');
assert.deepEqual(readCourseStorage(storage), beforeQuota);
deniedWrite = false;
const invalidCursor = { ...state, cursor: { screen: 'review', attemptId: 'unknown' } };
assert.equal(writeCourseStorage(storage, beforeQuota.raw, invalidCursor).status, 'blocked');
assert.deepEqual(readCourseStorage(storage), beforeQuota);

for (const corrupt of ['{', JSON.stringify({ ...state, version: 2 }), JSON.stringify({ ...state, studied: ['not-an-addressing-lesson'] })]) {
  store.set(COURSE_STORAGE_KEY, corrupt);
  assert.deepEqual(readCourseStorage(storage), { status: 'invalid' });
  assert.deepEqual(writeCourseStorage(storage, corrupt, emptyCourseState()), { status: 'blocked' });
  assert.equal(store.get(COURSE_STORAGE_KEY), corrupt, 'do not replace invalid unknown state');
}
expectLegacyIntact();
assert.deepEqual([...touched], [COURSE_STORAGE_KEY]);
console.log('Addressing course PASS: 5/9/6, 20 distinct families, 32 seeds, snapshot/history, 15/20 and 16/20, independent statuses, stale/denied/invalid storage');

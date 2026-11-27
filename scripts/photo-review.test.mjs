import { bankBeforeCopperPhotoChanges, registryBeforePvcRetirement } from './copper-photo-history-fixtures.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';

const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fixture = read('scripts/fixtures/photo-review-baseline.json');
const questions = read('src/data/questions.json');
const registry = read('src/data/questionLearningLevels.json');
const levels = { 'photo-cable-colors': 3, 'l1v2-a-contact-solid': 1, 'l1v2-b-strip-hole': 1,
  'l1v2-b-cleave-sequence': 3, 'l1v2-c-closure-service': 2 };
const changed = fixture.originalQuestions.map(q => q.id);
const questionsAtPhotoReview = bankBeforeCopperPhotoChanges(questions).map(question => {
  if (question.id !== 'l4-08') return question;
  // This later audit assigned a family to the TCP RST ticket. Preserve the photo-era content snapshot.
  const { family, ...original } = question;
  assert.equal(family, 'tcp-rst-meaning');
  return original;
});
const { PREVIOUS_IN_DEPTH_QUESTIONS } = await bundleEntry('src/data/inDepth/previousQuestions.ts', 'photo-l2-history.mjs');
const photoEraQuestions=questionsAtPhotoReview.map(q =>
  (q.id==='tr-03'||q.id==='tr-10') ? {...q,answers:PREVIOUS_IN_DEPTH_QUESTIONS[q.id].answers} : q);
assert.equal(hash(photoEraQuestions.filter(q => !changed.includes(q.id))), fixture.unchangedQuestionsSHA256,
  'all other questions, including the three PASS and photo-cable-terminate, remain unchanged');
const baseline = read('docs/audits/issue-171-baseline.json');
const { previousRegistryEntries } = baseline.technicalReviewClosure;
// Restore only the four independently reviewed 2026-11-19 classifications to the
// previous photo-era snapshot, while asserting the exact approved current metadata.
const sixReviewLevelChanges = {
  'l3-d05': {
    previous: 'Распознать (L3 · NAT): Комбинации адресов и портов (и протокола)',
    current: 'L2: требуется понимание many-to-one NAT/PAT — различение сессий по адресам, портам и протоколу.',
  },
  'l4-d03': {
    previous: 'Распознать (L4 · TCP): Корректно обработать запоздалые сегменты и обеспечить надежность закрытия',
    current: 'L2: TIME-WAIT и обработка запоздалых сегментов — концепция FSM закрытия TCP, выше чистой базы.',
  },
  'l4-d05': {
    previous: 'Распознать (L4 · TCP): Подтверждать несмежные блоки и эффективнее догонять потери',
    current: 'L2: SACK — подтверждение несмежных блоков TCP, требует понимания потерь и восстановления.',
  },
  'tcpip-d05': {
    previous: 'Распознать (TCP/IP · ECN): Сигнализировать перегрузку без обязательного drop (CE mark)',
    current: 'L2: ECN — сигнализация перегрузки без обязательного drop; выше начального уровня.',
  },
};
const registryAtPhotoReview = Object.fromEntries(Object.entries(registryBeforePvcRetirement(registry))
  .filter(([id]) => !Object.hasOwn(levels, id) && !baseline.diagnosticPack177.added.includes(id) && !baseline.monitoringPack.added.includes(id) && !baseline.wifiPack.added.includes(id) && !baseline.expertPack225.added.includes(id) && !baseline.expertPack177.added.includes(id))
  .map(([id, entry]) => {
    // Issue #257: only these four previously L1 assignments were independently moved to L2.
    // Reconstruct the photo-era registry for the original unchanged-scope fingerprint;
    // every other ID and metadata field remains protected by the original hash.
    const reviewed = sixReviewLevelChanges[id];
    if (reviewed) {
      assert.equal(entry.status, 'ASSIGNED', id);
      assert.equal(entry.learningLevel, 2, id + ': approved L1->L2 migration');
      assert.equal(entry.auditRationale, reviewed.current, id + ': approved explanation for L2');
      return [id, { ...entry, learningLevel: 1, auditRationale: reviewed.previous }];
    }
    return [id, previousRegistryEntries[id] ?? entry];
  }));
assert.equal(hash(registryAtPhotoReview),
  fixture.unchangedRegistrySHA256, 'all other metadata, including nine technical REVIEW, remain unchanged');
const byId = Object.fromEntries(questions.map(q => [q.id, q]));
for (const [id, level] of Object.entries(levels)) {
  const q = byId[id], entry = registry[id];
  assert.equal(q.answers.length, 4);
  assert.equal(q.correct.length, 1);
  assert.ok(Number.isInteger(q.correct[0]) && q.correct[0] >= 0 && q.correct[0] < 4);
  assert.equal(new Set(q.answers).size, 4);
  assert.ok(!q.text.includes(q.answers[q.correct[0]]), 'condition does not quote the correct option');
  assert.equal(entry.status, 'ASSIGNED');
  assert.equal(entry.learningLevel, level);
}
const contactBefore = fixture.originalQuestions.find(q => q.id === 'l1v2-a-contact-solid');
assert.deepEqual({ ...byId[contactBefore.id], imageAlt: contactBefore.imageAlt }, contactBefore,
  'contact question changes only its alt description');
const stripBefore = fixture.originalQuestions.find(q => q.id === 'l1v2-b-strip-hole');
assert.doesNotMatch(`${byId[stripBefore.id].text} ${byId[stripBefore.id].imageAlt}`,
  /раскрыт|развед|сомкнут|волокна между|слева/i,
  'condition and alt must not disclose the observed jaw/fibre state or its position');
for (const field of ['id', 'group', 'topic', 'image', 'template', 'family', 'difficulty']) {
  assert.deepEqual(byId[stripBefore.id][field], stripBefore[field]);
}

const { ALL_QUESTIONS, getLearningLevelQuestions, prepareAttemptQuestions, restoreSession,
  serializeReview, restoreReview } =
  await bundleEntry('scripts/learning-level-exam-entry.ts', 'photo-review-tests.mjs');
assert.equal(byId['photo-cable-colors'].family, byId['photo-cable-terminate'].family);
for (let seed = 1; seed <= 100; seed++) {
  let state = seed;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2 ** 32; };
  const selected = getLearningLevelQuestions('visual-l1', 10, random, 3);
  assert.ok(selected.filter(q => q.family === byId['photo-cable-colors'].family).length <= 1,
    'sufficient photo pool does not repeat the cable family');
}
// The existing guard rejects an active shuffled attempt with a changed key;
// it must never silently grade old options against the new content.
const now = 1_800_000_000_000;
const snapshot = { ...prepareAttemptQuestions([stripBefore], () => 0.5), currentIndex: 0,
  userAnswers: {}, submittedQuestions: {}, startTime: now - 1000, isCompleted: false,
  mode: 'visual-l1', feedbackMode: 'instant', attemptId: 'pre-photo-review', progressEpoch: 'old-epoch' };
const restored = restoreSession(JSON.stringify(snapshot), ALL_QUESTIONS, now);
assert.equal(restored, null);
const completed = { ...snapshot, isCompleted: true };
const review = restoreReview(serializeReview(completed), snapshot.progressEpoch);
assert.ok(review);
assert.deepEqual(review.questions, snapshot.questions, 'completed review keeps the historical content/key');
console.log('PASS: five photo levels, four options/one key, unchanged photo review scope, cable family sampling, safe old-attempt rejection and historical review');

// Figure 13 replacement is exactly one question; keys, families, and all earlier
// question history remain intact. Verify photos independently of any live CDN.
const { previousFiberEndFace, bankBeforeFiberEndFaceChange } = await import('./copper-photo-history-fixtures.mjs');
const { createProgressStore } = await bundleEntry('src/utils/userProgress.ts', 'fiber-photo-progress.mjs');
const { reviewRows } = await bundleEntry('src/utils/examReview.ts', 'fiber-photo-review.mjs');
const activeFiber = byId['photo-cleaning'];
assert.equal(ALL_QUESTIONS.length, 861);
assert.equal(hash(questions.filter(q => q.id !== activeFiber.id)), '95e547b43249034fe0e41f4d90df794100ff62a5b4b579a189a7a8303fcbea24');
assert.equal(hash(bankBeforeFiberEndFaceChange(questions)), '481e9eb3fc7ca890727689810b25b686eb26a853d5133571c19a913e9a759a2f');
assert.deepEqual(questions.filter(q => q.image === previousFiberEndFace.image).map(q => q.id),
  ['photo-dirty-end', 'photo-dirty-safety', 'l1v2-b-ferrule-dirty']);
for (const field of ['id', 'group', 'topic', 'template', 'family', 'difficulty', 'correct']) {
  assert.deepEqual(activeFiber[field], previousFiberEndFace[field]);
}
assert.deepEqual(activeFiber.correct, [1]);
assert.doesNotMatch(activeFiber.text + activeFiber.imageAlt, /след|царапин|ядро|сердцевин/i);
assert.match(activeFiber.answers[1], /несколько тонких вытянутых следов/);
assert.doesNotMatch(activeFiber.explanation, /пересека(?:ет|ют)|сердцевин|однозначн/i);
assert.equal(createHash('sha256').update(readFileSync('public/' + activeFiber.image)).digest('hex'),
  '1cdc61555016dde64802a077ea10dabd20d99fb3925615ad780844778762e177');
assert.match(readFileSync('src/components/PhotoCredits.tsx', 'utf8'), /Shuang Mei, Yudan Wang, Guojun Wen, Yang Hu/);
assert.match(readFileSync('docs/LOCAL-PHOTO-CREDITS.md', 'utf8'), /10\.3390\/s18051408/);
for (const fiber of [previousFiberEndFace, activeFiber]) {
  for (const saved of [{ questions: [fiber] }, prepareAttemptQuestions([fiber], () => 0.25)]) {
    const id = fiber.id;
    const { correct } = saved.questions[0];
    const session = { ...snapshot, ...saved, userAnswers: { [id]: correct }, submittedQuestions: { [id]: true } };
    if (!saved.answerOrders) delete session.answerOrders;
    const restoredFiber = restoreSession(JSON.stringify(session), ALL_QUESTIONS, now);
    assert.deepEqual(restoredFiber?.questions, saved.questions);
    assert.deepEqual(restoredFiber?.userAnswers, session.userAnswers);
    const completedFiber = { ...restoredFiber, isCompleted: true, endTime: now };
    const reviewFiber = restoreReview(serializeReview(completedFiber), session.progressEpoch);
    assert.deepEqual(reviewFiber?.questions, saved.questions);
    assert.equal(reviewRows(reviewFiber)[0].status, 'correct');
    const raw = JSON.stringify(session);
    const storage = { getItem: key => key === 'osi_active_session' ? raw : null, setItem: () => {} };
    const progress = createProgressStore(ALL_QUESTIONS, () => storage, () => now);
    assert.equal(progress.summary().answeredCount, 1);
    assert.equal(progress.summary().correctCount, 1);
  }
}
for (const corrupted of [
  { ...previousFiberEndFace, image: activeFiber.image },
  { ...previousFiberEndFace, text: activeFiber.text },
  { ...previousFiberEndFace, correct: [2] },
  { ...activeFiber, image: previousFiberEndFace.image },
  { ...activeFiber, answers: previousFiberEndFace.answers },
]) {
  const session = { ...snapshot, answerOrders: undefined, questions: [corrupted] };
  assert.equal(restoreSession(JSON.stringify(session), ALL_QUESTIONS, now), null);
}
console.log('PASS: exact one-ticket fiber photo scope, unchanged old URL and grading, old/current unshuffled + shuffled snapshots, review and progress');

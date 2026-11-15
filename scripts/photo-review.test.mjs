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
assert.equal(hash(questions.filter(q => !changed.includes(q.id))), fixture.unchangedQuestionsSHA256,
  'all other questions, including the three PASS and photo-cable-terminate, remain unchanged');
assert.equal(hash(Object.fromEntries(Object.entries(registry).filter(([id]) => !Object.hasOwn(levels, id)))),
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
console.log('PASS: five photo levels, four options/one key, unchanged scope and nine technical REVIEW, cable family sampling, safe old-attempt rejection and historical review');

import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const { ALL_QUESTIONS, QUESTION_LEARNING_LEVELS, getLessonForQuestion, LESSONS,
  FOUNDATION_EXISTING_LESSON_LINKS, FOUNDATION_ADDITIONAL_LESSONS } =
  await bundleEntry('scripts/foundation-lessons-entry.ts', 'foundation-lessons-coverage.mjs');

const foundations = ALL_QUESTIONS.filter(q => {
  const meta = QUESTION_LEARNING_LEVELS[q.id];
  return meta.status === 'ASSIGNED' && meta.learningLevel === 1;
});
assert.equal(ALL_QUESTIONS.length, 862, 'question bank must not change');
assert.equal(foundations.length, 220, 'L1 set must not change');
const lessonsById = new Map(LESSONS.map(lesson => [lesson.id, lesson]));
assert.equal(lessonsById.size, LESSONS.length, 'lesson IDs must remain unique');

const newLinks = new Map();
for (const lesson of FOUNDATION_ADDITIONAL_LESSONS) {
  assert.ok(lessonsById.has(lesson.id), lesson.id);
  assert.ok(lesson.blocks.length >= 2 && lesson.professional?.blocks?.length >= 2, 'two authored reading modes: ' + lesson.id);
  for (const id of lesson.relatedQuestionIds) {
    assert.ok(!newLinks.has(id), 'duplicate newly assigned question: ' + id);
    newLinks.set(id, lesson.id);
  }
}
for (const [lessonId, questionIds] of Object.entries(FOUNDATION_EXISTING_LESSON_LINKS)) {
  const lesson = lessonsById.get(lessonId);
  assert.ok(lesson && lesson.blocks?.length && lesson.professional?.blocks?.length, 'existing two-style lesson: ' + lessonId);
  for (const id of questionIds) {
    assert.ok(!newLinks.has(id), 'duplicate newly assigned question: ' + id);
    newLinks.set(id, lessonId);
  }
}
assert.equal(newLinks.size, 78, '75 approved foundation links plus three precise L2 lesson-section links');
for (const [id, lessonId] of newLinks) {
  const question = ALL_QUESTIONS.find(q => q.id === id);
  assert.ok(question, 'only bank IDs permitted: ' + id);
  const resolved = getLessonForQuestion(id);
  assert.equal(resolved?.id, lessonId, 'resolver must link exact material for ' + id);
  assert.ok(resolved.relatedQuestionIds.includes(id), 'lesson must display related ID ' + id);
}
const uncovered = foundations.filter(q => !getLessonForQuestion(q.id)).map(q => q.id);
assert.deepEqual(uncovered, [], 'all 220 basic learning-level questions must have linked lessons');
const incompleteLessonStyles = foundations
  .map(q => ({ id: q.id, lesson: getLessonForQuestion(q.id) }))
  .filter(({lesson}) => lesson && (!lesson.blocks?.length || !lesson.professional?.blocks?.length))
  .map(({id,lesson}) => id + ' -> ' + lesson.id);
assert.deepEqual(incompleteLessonStyles, [], 'all linked foundational lessons need plain and pro content');

assert.equal(getLessonForQuestion('l57-x11')?.id, 'l7-mail-mx', 'MX record lesson');
assert.equal(getLessonForQuestion('ts-x12')?.id, 'ts-cli-network-basics', 'ss -tulpn lesson');
assert.equal(getLessonForQuestion('gen-osi-a-1')?.id, 'l1-phy-symbol-rate', 'symbol/baud lesson');
assert.equal(getLessonForQuestion('tcpip-x24')?.id, 'l7-dhcp', 'DHCP belongs to TCP/IP application layer; mapped lesson explicitly teaches it');
assert.equal(getLessonForQuestion('tcpip-x22')?.id, 'l4-tcp', 'TCP connection-oriented handshake covered by TCP lesson');
assert.equal(getLessonForQuestion('l1v2-a-mark-frequency')?.id, 'l1-copper-mark-frequency', 'MHz reading tutorial');
assert.equal(getLessonForQuestion('photo-patch-caps')?.id, 'l1-optical-panel-photo', 'optical endface caps tutorial');
assert.equal(getLessonForQuestion('l4-d05')?.id, 'l4-tcp-sack', 'SACK selective acknowledgment gets dedicated dual-style lesson');
assert.equal(getLessonForQuestion('this-question-does-not-exist'), undefined, 'never infer a lesson for unknown ID');
console.log('PASS: all 220 foundation questions have a two-style lesson link; 75 explicit new links verified');

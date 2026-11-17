import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const { ALL_QUESTIONS, getLesson, getLessonForQuestion, LESSONS,
  QUESTION_SECTION_LINKS, getLessonBlocksWithSections, getLessonSectionForQuestion } =
  await bundleEntry('scripts/lesson-section-links-entry.ts', 'lesson-section-links.mjs');

assert.equal(ALL_QUESTIONS.length, 862, 'existing question bank is unchanged');
assert.equal(QUESTION_SECTION_LINKS.length, 3, 'three initial spotlights');
const expected = [
  ['photo-otdr-end', 'l1-otdr-trace-interpretation', 'otdr-end-of-fiber', 'шум'],
  ['gen-osi-a-19', 'l7-dns', 'dns-nxdomain-application', 'NXDOMAIN'],
  ['tcp-06', 'tcpip-model', 'tcpip-end-to-end-fields', 'MAC'],
];
for (const [questionId, lessonId, anchor, concept] of expected) {
  assert.ok(ALL_QUESTIONS.some(q => q.id === questionId), questionId + ': must be in the real bank');
  const lesson = getLesson(lessonId);
  assert.ok(lesson?.professional?.blocks?.length, lessonId + ': two-mode lesson already exists');
  assert.equal(getLessonForQuestion(questionId)?.id, lessonId, questionId + ': correct resolved lesson');
  assert.equal(lesson.relatedQuestionIds.filter(id => id === questionId).length, 1, questionId + ': do not duplicate related ID');
  assert.equal(getLessonSectionForQuestion(lessonId, questionId), anchor, questionId + ': exact paragraph');
  assert.equal(getLessonSectionForQuestion('other-lesson', questionId), undefined, 'never target an unrelated lesson');
  const before = JSON.stringify(lesson);
  for (const mode of ['plain', 'professional']) {
    const blocks = getLessonBlocksWithSections(lesson, mode);
    const matching = blocks.filter(b => b.anchorId === anchor);
    assert.equal(matching.length, 1, questionId + ': one stable anchor in ' + mode);
    assert.ok(matching[0].heading.length >= 14 && matching[0].body.length >= 200, 'substantial section: ' + questionId + '/' + mode);
    assert.ok(matching[0].body.includes(concept), 'mechanism covered: ' + questionId + '/' + mode);
    assert.ok(blocks.findIndex(b => b.anchorId === anchor) > 0, 'section inserted after relevant existing paragraph');
  }
  assert.equal(JSON.stringify(lesson), before, 'original authored lesson must not be mutated');
}
const anchors = QUESTION_SECTION_LINKS.map(row => row.anchorId);
assert.equal(new Set(anchors).size, anchors.length, 'anchors are unique');
assert.equal(getLessonSectionForQuestion('l7-dns', 'nonexistent-id'), undefined, 'unknown question has no fake target');
assert.equal(getLessonSectionForQuestion('l7-dns', null), undefined);
for (const lesson of LESSONS) {
  if (!expected.some(([, lid]) => lid === lesson.id)) {
    assert.deepEqual(getLessonBlocksWithSections(lesson, 'plain'), lesson.blocks, 'unrelated lesson remains unchanged: ' + lesson.id);
  }
}
console.log('PASS: three real questions link to an exact paragraph in both modes; other lessons and bank unchanged');

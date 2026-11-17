import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion } =
  await bundleEntry('scripts/explanations-test-entry.ts', 'base-foundations-batch2.mjs');
const { BASE_FOUNDATION_UPGRADES } =
  await bundleEntry('src/data/baseFoundations.ts', 'base-foundations-upgrades.mjs');

const expected = {
  "l3-12": "l3-private-ipv4",
  "l4-08": "l4-tcp",
  "l5-01": "osi-session-presentation",
  "l6-02": "osi-session-presentation",
  "tcp-04": "osi-pdu",
  "tcp-07": "l3-icmp-basics",
  "tcp-08": "tcpip-model",
  "tcp-09": "tcpip-encapsulation",
  "gen-osi-a-7": "osi-pdu",
  "gen-osi-a-9": "l3-icmp-basics",
  "gen-osi-a-11": "osi-pdu",
  "gen-osi-a-12": "osi-pdu",
  "tcpip-x01": "tcpip-model",
  "tcpip-x02": "tcpip-model",
  "tcpip-x04": "tcpip-encapsulation",
  "tcpip-x05": "tcpip-model",
  "tcpip-x07": "osi-pdu",
  "tcpip-x08": null,
  "tcpip-x10": null,
  "tcpip-x12": "tcpip-model"
};
assert.deepEqual(Object.keys(BASE_FOUNDATION_UPGRADES).sort(), Object.keys(expected).sort(), 'fixed batch ID list');
assert.equal(ALL_QUESTIONS.length, 862, 'question bank size unchanged');
assert.equal(new Set(ALL_QUESTIONS.map(q => q.id)).size, 862, 'all question IDs remain unique');

for (const [id, expectedLesson] of Object.entries(expected)) {
  const q = ALL_QUESTIONS.find(item => item.id === id);
  assert.ok(q, id + ': question present');
  assert.equal(q.difficulty, 'beginner', id + ': baseline difficulty preserved');
  assert.ok(q.correct.every(index => index >= 0 && index < q.answers.length), id + ': valid key');
  const dive = getQuestionDeepDive(q);
  assert.equal(dive.hasIndividualDeep, true, id + ': individual explanation');
  assert.ok(dive.briefAnswer.length > 20, id + ': specific why');
  assert.ok(dive.deepAnalysis.length > 150, id + ': meaningful plain explanation');
  assert.ok(dive.deepAnalysis.split(/\n\s*\n/).length >= 3, id + ': plain mechanism in paragraphs');
  assert.ok(dive.pro?.length > 150, id + ': substantial professional explanation');
  assert.equal(dive.professional?.deep, dive.pro, id + ': active pro resolver');
  assert.notEqual(dive.pro, dive.deepAnalysis, id + ': independent layers');
  const lesson = getLessonForQuestion(id);
  assert.ok(lesson, id + ': actual lesson link');
  if (expectedLesson) assert.equal(lesson.id, expectedLesson, id + ': exact lesson');
  assert.ok(lesson.relatedQuestionIds.includes(id), id + ': reverse lesson association');
  assert.ok(lesson.blocks?.length >= 2, id + ': plain lesson content');
  assert.ok(lesson.professional?.blocks?.length >= 2, id + ': pro lesson content');
  assert.ok(lesson.professional.blocks.some(b => b.body.length > 150), id + ': professional lesson is not stub');
}
console.log('PASS: base foundations batch2: 20 tickets, two meaningful ticket layers and both lesson layers');

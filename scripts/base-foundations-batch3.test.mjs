import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion, getLesson } =
  await bundleEntry('scripts/explanations-test-entry.ts', 'base-foundations-batch3.mjs');
const { BASE_FOUNDATIONS_BATCH3 } =
  await bundleEntry('src/data/baseFoundationsBatch3.ts', 'base-foundations-batch3-entries.mjs');
const { GLOSSARY } = await bundleEntry('src/data/glossary.ts', 'base-foundations-batch3-glossary.mjs');
const { PRACTICE_DESTINATIONS } = await bundleEntry('src/data/practiceLinks.ts', 'base-foundations-batch3-practice.mjs');

const exactLesson = {
  'tcpip-x13': 'l4-tcp',
  'tcpip-x15': 'tcpip-encapsulation',
  'tcpip-x16': 'l4-tcp',
  'tcpip-x17': 'l3-route-selection',
  'tcpip-x19': 'tcpip-model',
  'tcpip-x21': 'l4-service-ports',
  'tcpip-x29': 'l4-service-ports',
  'l3-02': 'l3-route-selection',
  'k-06': 'tcpip-encapsulation',
  'k-08': 'osi-pdu',
  'new-l6-format': 'osi-session-presentation',
  'new-tcpip-payload': 'tcpip-encapsulation',
  'gen-port-0': 'l4-service-ports',
  'gen-port-1': 'l4-service-ports',
  'gen-port-2': 'l4-service-ports',
  'gen-port-3': 'l4-service-ports',
  'gen-port-4': 'l4-service-ports',
  'gen-port-5': 'l4-service-ports',
  'gen-port-10': 'l4-service-ports',
  'gen-port-12': 'l4-service-ports',
};
const ids = Object.keys(exactLesson);
assert.equal(ids.length, 20, 'exact batch scope');
assert.deepEqual(Object.keys(BASE_FOUNDATIONS_BATCH3).sort(), ids.sort(), 'no unreviewed content outside batch');
assert.equal(ALL_QUESTIONS.length, 862, 'original bank count');
assert.equal(new Set(ALL_QUESTIONS.map(q => q.id)).size, 862, 'bank IDs are unique');

for (const id of ids) {
  const question = ALL_QUESTIONS.find(q => q.id === id);
  assert.ok(question, id + ' question exists');
  assert.equal(question.difficulty, 'beginner', id + ' beginner difficulty unchanged');
  assert.ok(question.correct.length && question.correct.every(c => c >= 0 && c < question.answers.length), id + ' valid key');
  const upgrade = BASE_FOUNDATIONS_BATCH3[id];
  const dive = getQuestionDeepDive(question);
  assert.equal(dive.hasIndividualDeep, true, id + ' individual explanation');
  if (id === 'tcpip-x13' || id === 'tcpip-x15') {
    // Approved audited brief takes precedence; preserve it instead of overwriting it.
    assert.ok(dive.briefAnswer.length > 110, id + ' approved audited why retained');
    assert.notEqual(dive.briefAnswer, upgrade.brief, id + ' audited why not overridden by new batch');
  } else {
    assert.equal(dive.briefAnswer, upgrade.brief, id + ' authored specific why');
  }
  assert.equal(dive.plain, upgrade.plain, id + ' active authored plain');
  assert.equal(dive.deepAnalysis, upgrade.plain, id + ' plain is default detailed view');
  assert.equal(dive.pro, upgrade.pro, id + ' active authored pro');
  assert.equal(dive.professional.deep, upgrade.pro, id + ' active professional resolver');
  assert.equal(dive.commonTrap, upgrade.trap, id + ' specific misconception');
  assert.notEqual(dive.pro, dive.plain, id + ' independent engineering style');
  assert.equal(dive.plain.split(/\n\s*\n/).length, 3, id + ' exactly three natural plain paragraphs');
  assert.ok(upgrade.brief.length > 32 && upgrade.pro.length > 180, id + ' substantive explanation');
  assert.equal(dive.practiceLink, upgrade.practiceLink, id + ' only real appropriate practice links');
  if (upgrade.practiceLink) assert.ok(PRACTICE_DESTINATIONS[upgrade.practiceLink], id + ' linked practice destination exists');
  const lesson = getLessonForQuestion(id);
  assert.ok(lesson, id + ' linked lesson exists');
  assert.equal(lesson.id, exactLesson[id], id + ' lesson matches mechanism');
  assert.ok(lesson.relatedQuestionIds.includes(id), id + ' reverse association');
  assert.ok(lesson.blocks.length >= 2 && lesson.professional?.blocks?.length >= 2, id + ' two lesson modes');
}

const portKeys = {
  'gen-port-0': '80', 'gen-port-1': '443', 'gen-port-2': '22', 'gen-port-3': '23',
  'gen-port-4': '21', 'gen-port-5': '25', 'gen-port-10': '110', 'gen-port-12': '143',
};
for (const [id, expected] of Object.entries(portKeys)) {
  const q = ALL_QUESTIONS.find(q => q.id === id);
  assert.deepEqual(q.correct.map(i => q.answers[i]), [expected], id + ' source-of-truth port mapping');
  assert.match(BASE_FOUNDATIONS_BATCH3[id].brief, new RegExp('\\b' + expected + '\\b'), id + ' why matches key');
}
const route = ALL_QUESTIONS.find(q => q.id === 'l3-02');
assert.deepEqual(route.correct.map(i => route.answers[i]), ['eth1'], 'LPM boundary: .128 picks /24, not /25');
for (const lessonId of ['l3-route-selection', 'l4-service-ports']) {
  const lesson = getLesson(lessonId);
  assert.ok(lesson, lessonId + ' registered in catalog');
  for (const [style, terms] of [['plain', lesson.terms], ['professional', lesson.professional.terms]]) {
    for (const term of terms) {
      const entry = GLOSSARY[term];
      assert.ok(entry?.description?.length > 25 && entry?.relatesTo?.length > 12, lessonId + ' ' + style + ' glossary: ' + term);
    }
  }
  assert.ok(lesson.professional.blocks.some(b => b.body.length > 200), lessonId + ' engineering lesson not stub');
}
const service = getLesson('l4-service-ports');
assert.ok(service.blocks.some(b => b.practiceLink === 'tcp'), 'service lesson offers actual TCP ports exercise');
assert.ok(service.professional.blocks.some(b => b.practiceLink === 'tcp'), 'pro service lesson offers actual TCP exercise');
assert.equal(PRACTICE_DESTINATIONS.tcp.protocol, 'tcp', 'TCP practice is a real simulator');
console.log('PASS: 20 beginner batch3 tickets, explicit answer key + both text layers + exact lessons + valid practice/glossary');

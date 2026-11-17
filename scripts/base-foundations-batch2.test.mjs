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
  "gen-osi-a-11": "l4-tcp",
  "gen-osi-a-12": "osi-pdu",
  "tcpip-x01": "tcpip-model",
  "tcpip-x02": "tcpip-model",
  "tcpip-x04": "tcpip-encapsulation",
  "tcpip-x05": "tcpip-model",
  "tcpip-x07": "osi-pdu",
  "tcpip-x08": "l4-tcp",
  "tcpip-x10": "l3-arp",
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
  if (id === 'tcp-09') {
    // Existing approved structured MTU/MSS walkthrough is a numbered list, not three prose paragraphs.
    assert.match(dive.deepAnalysis, /12 байтах опций TCP останется до 1448/, id + ': approved calculation preserved');
  } else {
    assert.ok(dive.deepAnalysis.split(/\n\s*\n/).length >= 3, id + ': plain mechanism in paragraphs');
  }
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


const { GLOSSARY } = await bundleEntry('src/data/glossary.ts', 'foundation-glossary.mjs');
const { PRACTICE_DESTINATIONS } = await bundleEntry('src/data/practiceLinks.ts', 'foundation-practice.mjs');

for (const id of ['l5-01', 'tcp-07', 'tcp-09']) {
  const lesson = getLessonForQuestion(id);
  for (const [style, terms] of [['plain', lesson.terms], ['professional', lesson.professional.terms]]) {
    for (const term of terms) {
      assert.ok(GLOSSARY[term]?.description?.length > 25, lesson.id + ': ' + style + ' term ' + term + ' has a useful definition');
    }
  }
}

const icmp = getLessonForQuestion('tcp-07');
assert.ok(icmp.blocks.some(b => b.practiceLink === 'packet'), 'ICMP plain links actual packet practice');
assert.ok(icmp.professional.blocks.some(b => b.practiceLink === 'packet'), 'ICMP professional links actual packet practice');
assert.equal(PRACTICE_DESTINATIONS.packet.simulator, 'journey', 'ICMP practice exists');

const portsQuestion = ALL_QUESTIONS.find(q => q.id === 'gen-osi-a-11');
const udpQuestion = ALL_QUESTIONS.find(q => q.id === 'gen-osi-a-12');
assert.equal(getQuestionDeepDive(portsQuestion).practiceLink, 'tcp', 'ports ticket links TCP port simulator');
assert.equal(PRACTICE_DESTINATIONS.tcp.protocol, 'tcp', 'transport practice exists');
assert.equal(getQuestionDeepDive(udpQuestion).practiceLink, undefined, 'no fake UDP practice link');

const encap = getLessonForQuestion('tcp-09');
const mssBlock = encap.professional.blocks.find(b => b.heading.includes('MSS'));
assert.ok(mssBlock, 'MTU/MSS professional block exists');
assert.match(mssBlock.body, /IHL=5 \(5×4=20 B\)/, 'IPv4 IHL contains field value, not byte count');
assert.match(mssBlock.body, /Data Offset=5 \(5×4=20 B\)/, 'TCP offset contains field value, not byte count');
assert.doesNotMatch(mssBlock.body, /IHL=20 B|Data Offset=20 B/, 'never present header sizes as field values');
assert.match(mssBlock.body, /1500−20−20=1460 B/, 'unchanged RFC-compliant calculation');
console.log('PASS: four Codex P2 regressions: fields, glossary, L4 destinations, ICMP lesson links');

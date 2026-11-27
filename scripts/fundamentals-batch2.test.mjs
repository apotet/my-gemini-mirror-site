import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion } =
  await bundleEntry('scripts/explanations-test-entry.ts', 'fundamentals-batch2.mjs');
const { BASE_FOUNDATION_UPGRADES } =
  await bundleEntry('src/data/baseFoundations.ts', 'fundamentals-batch2-entries.mjs');

const ids = [
  'l3-12', 'l4-08', 'l5-01', 'l6-02', 'tcp-04', 'tcp-07',
  'tcp-08', 'tcp-09', 'gen-osi-a-7', 'gen-osi-a-9',
  'gen-osi-a-11', 'gen-osi-a-12', 'tcpip-x01', 'tcpip-x02',
  'tcpip-x04', 'tcpip-x05', 'tcpip-x07', 'tcpip-x08',
  'tcpip-x10', 'tcpip-x12',
];
assert.deepEqual(Object.keys(BASE_FOUNDATION_UPGRADES).sort(), [...ids].sort(), 'batch is precisely scoped');
assert.equal(ALL_QUESTIONS.length, 861, 'bank size unchanged');
assert.equal(new Set(ALL_QUESTIONS.map(q => q.id)).size, 861, 'unique IDs');
const exactLesson = {
  'l3-12': 'l3-private-ipv4',
  'l5-01': 'osi-session-presentation',
  'l6-02': 'osi-session-presentation',
  'tcp-08': 'tcpip-model',
  'gen-osi-a-9': 'l3-icmp-basics',
  'gen-osi-a-12': 'osi-pdu',
  'tcpip-x12': 'tcpip-model',
};
for (const id of ids) {
  const q = ALL_QUESTIONS.find(item => item.id === id);
  assert.ok(q, id + ' question exists');
  assert.equal(q.difficulty, 'beginner', id + ' baseline difficulty');
  assert.ok(q.answers && q.correct.length, id + ' answer key exists');
  assert.ok(q.correct.every(index => index >= 0 && index < q.answers.length), id + ' correct indices valid');
  const dive = getQuestionDeepDive(q);
  assert.equal(dive.hasIndividualDeep, true, id + ' individual');
  assert.ok((dive.briefAnswer || '').length >= 30, id + ' why');
  assert.ok((dive.deepAnalysis || '').length >= 180, id + ' plain, no generic fallback');
  assert.ok((dive.pro || '').length >= 170, id + ' professional, no placeholder');
  assert.notEqual(dive.deepAnalysis, dive.pro, id + ' independent learning layers');
  assert.ok(!/пока не подготовлен/i.test(dive.pro), id + ' no fake pro');

  const upgrade = BASE_FOUNDATION_UPGRADES[id];
  if (upgrade.plain) {
    assert.equal(upgrade.plain.split(/\n\s*\n/).length, 3, id + ' 3 plain paragraphs');
    assert.equal(dive.plain, upgrade.plain, id + ' authored plain preserved');
  } else {
    assert.equal(dive.deepAnalysis.includes('Правильный ответ:'), false, id + ' original plain retained, not a key dump');
  }
  if (upgrade.practiceLink) assert.equal(dive.practiceLink, upgrade.practiceLink, id + ' real linked practice');

  const lesson = getLessonForQuestion(id);
  assert.ok(lesson, id + ' real lesson link');
  if (exactLesson[id]) assert.equal(lesson.id, exactLesson[id], id + ' exact lesson');
  assert.ok(lesson.relatedQuestionIds.includes(id), id + ' forward lesson relation');
  assert.ok(lesson.blocks?.length, id + ' plain lesson');
  assert.ok(lesson.professional?.blocks?.length, id + ' professional lesson');
  assert.ok(lesson.blocks.some(b => (b.body || '').length > 100), id + ' meaningful plain');
  assert.ok(lesson.professional.blocks.some(b => (b.body || '').length > 100), id + ' meaningful professional');
  console.log(id, 'PASS', 'lesson:', lesson.id);
}
console.log('PASS: 20 beginner OSI/TCP-IP tickets, independent layers and two-layer lessons');

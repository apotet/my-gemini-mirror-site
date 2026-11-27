import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const m = await bundleEntry('scripts/in-depth-entry.ts', 'l3-packet4-cidr-mtu.mjs');
const bank = new Map(m.ALL_QUESTIONS.map(question => [question.id, question]));
const cases = [
  { id: 'gen-net-25-4', lesson: 'l3-subnets', key: [2], anchor: 'cidr-contiguous-mask-validation',
    headings: ['Как распознать недопустимую маску CIDR', 'Проверка непрерывности маски IPv4 (RFC 4632)'],
    concepts: [/255\.255\.254\.128/, /11111110/, /10000000/, /\/23|\/24/] },
  { id: 'ts-pack1-15', lesson: 'l3-mtu-mss-fragmentation', key: [1], anchor: 'mtu-local-pmtu-cache',
    headings: ['Локальный кэш PMTU: какое ограничение срабатывает ещё до выхода кадра',
      'Локальный route/PMTU cache стека и порядок срабатывания ограничений'],
    concepts: [/1380/, /1400/, /1500/, /1300/, /\bDF\b/, /локальн|на самом Linux-хосте/i] },
];
for (const row of cases) {
  const question = bank.get(row.id);
  assert.deepEqual(question?.correct, row.key);
  assert.equal(m.QUESTION_LEARNING_LEVELS[row.id]?.learningLevel, 3);
  const explanation = m.getQuestionDeepDive(question);
  assert.equal(explanation.deepAnalysis, explanation.plain);
  assert.equal(explanation.professional?.deep, explanation.pro);
  assert.notEqual(explanation.plain, explanation.pro);
  for (const concept of row.concepts) {
    assert.match(explanation.plain, concept);
    assert.match(explanation.pro, concept);
  }
  const lesson = m.getLessonForQuestion(row.id);
  assert.equal(lesson?.id, row.lesson);
  assert.deepEqual(m.LESSONS.filter(l => l.relatedQuestionIds.includes(row.id)).map(l => l.id), [row.lesson]);
  assert.equal(m.getLessonSectionForQuestion(row.lesson, row.id), row.anchor);
  assert.deepEqual(m.QUESTION_SECTION_LINKS.filter(r => r.questionIds.includes(row.id)).map(r => r.anchorId), [row.anchor]);
  for (const [i, mode] of ['plain', 'professional'].entries()) {
    const target = m.getLessonBlocksWithSections(lesson, mode).filter(block => block.anchorId === row.anchor);
    assert.equal(target.length, 1);
    assert.equal(target[0].heading, row.headings[i]);
    for (const concept of row.concepts) assert.match(target[0].body, concept);
  }
}

const cidr = bank.get('gen-net-25-4');
assert.equal(cidr.answers[cidr.correct[0]], '255.255.254.128');
const binary = mask => mask.split('.').map(byte => Number(byte).toString(2).padStart(8, '0')).join('');
assert.deepEqual(cidr.answers.map(mask => {
  const bits = binary(mask);
  return /^1*0*$/.test(bits) ? bits.replaceAll('0', '').length : null;
}), [25, 23, null, 26]);

const mtu = m.getQuestionDeepDive(bank.get('ts-pack1-15'));
assert.match(mtu.pro, /может сразу вернуть EMSGSIZE/);
assert.match(mtu.practicalTip, /маршрут.*локальную PMTU.*полной длиной IPv4-пакета.*DF.*EMSGSIZE.*1380/);
assert.match(mtu.pro, /ICMP Fragmentation Needed.*RFC 1191/);
const block = m.getLessonBlocksWithSections(m.getLesson('l3-mtu-mss-fragmentation'), 'professional')
  .find(item => item.anchorId === 'mtu-local-pmtu-cache');
assert.match(block.body, /может синхронно вернуть EMSGSIZE/);
assert.match(block.body, /IP_PMTUDISC_PROBE.*DF установлен, но сохранённая PMTU не применяется/);
assert.doesNotMatch(mtu.pro + mtu.practicalTip + block.body, /mtu_expires|expires|\b600\b/);
console.log('PASS: two authored plain/pro pairs, CIDR mask oracle, local UDP MTU diagnosis and unchanged keys/PMTU anchor');

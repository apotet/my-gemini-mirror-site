import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const m = await bundleEntry('scripts/in-depth-entry.ts', 'l3-packet4-vlan-links.mjs');
const lessonId = 'l2-vlan';
const lesson = m.getLesson(lessonId);
const sections = ['plain', 'professional'].map(mode => m.getLessonBlocksWithSections(lesson, mode));
const modeNames = ['plain', 'professional'];

const routes = [
  { q: 'l2-07', correct: [0], anchor: 'vlan-native-untagged-ingress',
    headings: ['Как принимают кадр без метки', 'Native VLAN'],
    evidence: [
      [/классифицирует принятый кадр как VLAN 20/, /явным VID 10 и VLAN 10 разрешена/, /не заменяет allowed list/],
      [/нетегированные кадры относятся к native VLAN принимающей стороны/, /не заменяет список allowed VLAN/],
    ] },
  { q: 'l2-08', correct: [0, 1], anchor: 'vlan-access-frame-ingress-egress',
    headings: ['Что видит компьютер на обычном порту', 'Access-порт: принадлежность кадра на входе и тег на выходе'],
    evidence: [
      [/нетегированный кадр на входе относится к VLAN 20/, /на выходе к компьютеру тег этой VLAN не передаётся/, /не меняет access VLAN/],
      [/Нетегированный кадр от ПК коммутатор относит к VLAN 20/, /кадр передаётся без тега/, /Native VLAN 10 на соседнем trunk не влияет/, /без voice VLAN/],
    ] },
];

for (const { q, correct, anchor, headings, evidence } of routes) {
  assert.equal(m.QUESTION_LEARNING_LEVELS[q]?.learningLevel, 3);
  assert.deepEqual(m.ALL_QUESTIONS.find(item => item.id === q)?.correct, correct);
  assert.equal(m.getLessonForQuestion(q)?.id, lessonId);
  assert.deepEqual(m.LESSONS.filter(item => item.relatedQuestionIds.includes(q)).map(item => item.id), [lessonId]);
  assert.equal(m.getLessonSectionForQuestion(lessonId, q), anchor);
  assert.deepEqual(m.QUESTION_SECTION_LINKS.filter(item => item.questionIds.includes(q)).map(item => item.anchorId), [anchor]);
  for (const [i, blocks] of sections.entries()) {
    const matches = blocks.filter(block => block.anchorId === anchor);
    assert.equal(matches.length, 1, `${q}/${modeNames[i]}`);
    assert.equal(matches[0].heading, headings[i], `${q}/${modeNames[i]}`);
    for (const phrase of evidence[i]) assert.match(matches[0].body, phrase, `${q}/${modeNames[i]}`);
  }
}

const old = [
  ['new-ts-vlan', 'in-depth-existing-new-ts-vlan', ['Куда дойдёт сообщение для всех и кто ответит за шлюз', 'Access и trunk']],
  ['ts-x07', 'indepth-same-prefix-vlan-migration', ['Одинаковая подсеть после миграции не объединяет VLAN', 'Миграция: сначала L2-домен, затем SVI и ACL']],
  ['ts-d02', 'indepth-same-prefix-vlan-migration', ['Одинаковая подсеть после миграции не объединяет VLAN', 'Миграция: сначала L2-домен, затем SVI и ACL']],
];
for (const [q, anchor, headings] of old) {
  assert.equal(m.getLessonForQuestion(q)?.id, lessonId);
  assert.equal(m.getLessonSectionForQuestion(lessonId, q), anchor);
  assert.deepEqual(sections.map(blocks => blocks.filter(block => block.anchorId === anchor).map(block => block.heading)),
    headings.map(heading => [heading]), `${q}: existing VLAN routes remain exact`);
}

console.log('PASS: two exact VLAN routes in both modes; three existing VLAN routes and bank keys unchanged');

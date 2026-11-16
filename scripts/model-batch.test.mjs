import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion } =
  await bundleEntry('scripts/explanations-test-entry.ts', 'model-batch.mjs');

const expected = {
  'l6-02': { lesson: 'tcpip-model', practice: undefined, answer: 'L6' },
  'tcp-08': { lesson: 'tcpip-model', practice: 'packet', answer: 'Ethernet; Wi‑Fi; ARP' },
  'l7-05': { lesson: undefined, practice: undefined, answer: 'Сервер не нашёл запрошенный ресурс либо не раскрывает его существование' },
  'l3-12': { lesson: undefined, practice: undefined, answer: '10.0.0.0/8; 172.16.0.0/12; 192.168.0.0/16' },
  'tcp-04': { lesson: 'osi-pdu', practice: 'packet', answer: 'L2 — MAC; L3 — IP; L4 — порт' },
};

for (const [id, want] of Object.entries(expected)) {
  const q = ALL_QUESTIONS.find(item => item.id === id);
  assert.ok(q, id);
  assert.equal(q.correct.map(i => q.answers[i]).join('; '), want.answer, id);
  const dive = getQuestionDeepDive(q);
  assert.ok(dive.briefAnswer.length > 20, id + ' why');
  assert.ok(dive.plain && dive.plain.length > 80, id + ' plain');
  assert.ok(dive.pro && dive.pro.length > 80, id + ' pro');
  assert.notEqual(dive.plain, dive.pro, id + ' layers differ');
  assert.equal(getLessonForQuestion(id)?.id, want.lesson, id + ' lesson');
  assert.equal(dive.practiceLink, want.practice, id + ' practice');
}

console.log('model batch: 5 tickets covered');

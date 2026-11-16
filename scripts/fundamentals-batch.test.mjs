import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion } =
  await bundleEntry('scripts/explanations-test-entry.ts', 'fundamentals-batch.mjs');

const expected = {
  'l2-03': { lesson: 'l2-ethernet', practice: 'packet', answer: 'Source MAC и входной порт' },
  'l2-05': { lesson: 'l2-ethernet', practice: 'packet', answer: 'FF:FF:FF:FF:FF:FF' },
  'l3-01': { lesson: 'osi-pdu', practice: 'packet', answer: 'Пакет' },
  'l4-02': { lesson: 'l4-tcp', practice: 'tcp', answer: 'SYN → SYN-ACK → ACK' },
  'tcp-02': { lesson: 'tcpip-model', practice: undefined, answer: 'L5, L6 и L7' },
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

console.log('fundamentals batch: 5 tickets covered');

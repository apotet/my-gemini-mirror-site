import assert from 'node:assert/strict';
import { bundleEntry, loadBankWithExplanations } from './load-bank.mjs';

const { ALL_QUESTIONS, getQuestionDeepDive } = await loadBankWithExplanations();
const { IPV6_CONCEPT_EXERCISES, getIpv6QuestionPractice } = await bundleEntry('src/data/ipv6Practice.ts', 'ipv6-question-practice.mjs');
const expected = {
  'review-ndp-1': 'ndp-multicast',
  'review-ndp-2': 'ra-router-lifetime',
  'review-ndp-3': 'dad-duplicate',
  'review-slaac-4': 'slaac-compose',
  'review-slaac-5': 'slaac-prefix-flags',
  'review-slaac-6': 'slaac-invalid-lifetime',
};
assert.deepEqual(Object.keys(IPV6_CONCEPT_EXERCISES).sort(), Object.values(expected).sort());
const seen = [];
for (const question of ALL_QUESTIONS) {
  const target = getQuestionDeepDive(question).ipv6Practice;
  assert.deepEqual(target, getIpv6QuestionPractice(question.id));
  if (!target) continue;
  seen.push(question.id);
  if (question.id === 'l3-d06') {
    assert.deepEqual(target, { targetMode: 'type' });
    continue;
  }
  assert.deepEqual(target, { targetMode: 'concept', exercise: expected[question.id] });
  const drill = IPV6_CONCEPT_EXERCISES[target.exercise];
  assert.notEqual(drill.q, question.text, 'use a different scene');
  assert.equal(new Set(drill.opts).size, drill.opts.length, 'distinct alternatives');
  assert.equal(drill.opts.filter(answer => answer === drill.answer).length, 1);
  assert.match(drill.e, /RFC (4291|4861|4862)/);
}
assert.deepEqual(seen.sort(), [...Object.keys(expected), 'l3-d06'].sort());
for (const unknown of ['toString', 'constructor', '__proto__', 'gen-diag-4']) assert.equal(getIpv6QuestionPractice(unknown), undefined);
console.log('PASS: six exact concept scenes, existing IPv6 Type link, and no unrelated links from the active bank');

import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion, APPLIED_INDIVIDUAL_DEEP } =
  await bundleEntry('scripts/explanations-test-entry.ts', 'l3-12-individual.mjs');

const entry = APPLIED_INDIVIDUAL_DEEP['l3-12'];
assert.ok(entry, 'l3-12 must have an individual entry in APPLIED_INDIVIDUAL_DEEP');
assert.ok(entry.plain && entry.pro, 'individual entry must define both plain and pro');
assert.notEqual(entry.plain, entry.pro, 'pro must not be a copy of plain');
assert.match(entry.pro, /RFC 1918/);
assert.match(entry.pro, /10\.0\.0\.0\/8/);
assert.match(entry.pro, /172\.16\.0\.0\/12/);
assert.match(entry.pro, /192\.168\.0\.0\/16/);
assert.match(entry.pro, /172\.16\.0\.0–172\.31\.255\.255/);
assert.match(entry.pro, /RFC 3927/);
assert.match(entry.pro, /RFC 6598/);
assert.doesNotMatch(entry.pro, /пока не подготовлен|общий текст|шаблон/);

const q = ALL_QUESTIONS.find(item => item.id === 'l3-12');
assert.ok(q);
assert.equal(q.correct.map(i => q.answers[i]).join('; '), '10.0.0.0/8; 172.16.0.0/12; 192.168.0.0/16');

const dive = getQuestionDeepDive(q);
assert.equal(dive.hasIndividualDeep, true);
assert.equal(dive.plain, entry.plain, 'resolved plain must come from the individual entry');
assert.equal(dive.pro, entry.pro, 'resolved pro must come from the individual entry');
assert.equal(dive.professional?.deep, entry.pro);
assert.equal(getLessonForQuestion('l3-12'), undefined, 'no suitable lesson exists');
assert.equal(dive.practiceLink, undefined, 'no suitable practice stand exists');

console.log('l3-12 individual explanation: confirmed from APPLIED_INDIVIDUAL_DEEP');

import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Load the real bank, resolver and review components, without a test-only bank.
const outfile = resolve('scripts/.cache/stp-questions.mjs');
mkdirSync(resolve('scripts/.cache'), { recursive: true });
await build({ stdin: { contents: `
  export { ALL_QUESTIONS, getExamPool } from './src/data/questionsData';
  export { APPLIED_INDIVIDUAL_DEEP } from './src/data/questionExplanationsApplied';
  export { getQuestionDeepDive } from './src/data/questionExplanations';
  export { TheoryRazbory } from './src/components/TheoryRazbory';
  export { ExamReview } from './src/components/ExamReview';
`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'esm', outfile,
  external: ['react', 'react-dom', 'react-dom/server', 'lucide-react'], logLevel: 'silent' });
const { ALL_QUESTIONS, getExamPool, APPLIED_INDIVIDUAL_DEEP, getQuestionDeepDive, TheoryRazbory, ExamReview } =
  await import(pathToFileURL(outfile).href);

const ids = Array.from({ length: 15 }, (_, i) => `stp-new-${String(i + 1).padStart(2, '0')}`);
const applied = new Set([1, 5, 7, 10, 14]);
const raw = JSON.parse(readFileSync('src/data/questions.json', 'utf8'));
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));
const beginner = new Set(getExamPool('mixed', 'beginner').map(q => q.id));
const mixed = new Set(getExamPool('mixed', 'mixed').map(q => q.id));
const keys = [2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 1, 2, 3];
assert.equal(new Set(ALL_QUESTIONS.map(q => q.id)).size, ALL_QUESTIONS.length);
assert.deepEqual(ALL_QUESTIONS.filter(q => q.id.startsWith('stp-new-')).map(q => q.id), ids);

for (const [index, id] of ids.entries()) {
  const q = ALL_QUESTIONS.find(q => q.id === id);
  assert.equal(raw.filter(q => q.id === id).length, 1, id + ': unique JSON record');
  assert.equal(q.group, 'l1-l2');
  assert.equal(q.difficulty, applied.has(index + 1) ? 'applied' : 'advanced');
  assert.equal(q.answers.length, 4);
  assert.equal(new Set(q.answers).size, 4);
  assert.deepEqual(q.correct, [keys[index]], id + ': reviewed answer key');
  assert.ok(q.text.trim() && q.explanation.trim());
  assert.ok(!q.image && !q.template, id + ': individual text scenario');
  assert.ok(mixed.has(id) && !beginner.has(id), id + ': existing difficulty rules retained');
  const entry = APPLIED_INDIVIDUAL_DEEP[id], deep = getQuestionDeepDive(q);
  for (const field of ['brief', 'trap', 'plain', 'pro']) assert.ok(entry[field]?.trim(), id + ': ' + field);
  assert.equal(entry.plain.split(/\n\s*\n/).length, 4, id + ': four plain paragraphs');
  assert.equal(entry.pro.split(/\n\s*\n/).length, 3, id + ': three technical paragraphs');
  assert.notEqual(entry.plain, entry.pro);
  assert.equal(deep.deepAnalysis, entry.plain);
  assert.equal(deep.professional.deep, entry.pro);
  assert.equal(deep.professional.sourceCommit, undefined, 'no unrelated historical attribution');
  assert.ok(deep.hasIndividualDeep && !deep.practiceLink);
  assert.equal(deep.briefAnswer, entry.brief);
  assert.equal(deep.commonTrap, entry.trap);
  const theory = render(TheoryRazbory, { initialQuestionId: id, onNavigateToIpv4() {}, onNavigateToIpv6() {} });
  const session = { questions: [q], userAnswers: { [id]: q.correct }, submittedQuestions: { [id]: true },
    currentIndex: 0, startTime: 1, isCompleted: true, mode: 'mixed', difficulty: 'mixed', feedbackMode: 'exam' };
  const review = render(ExamReview, { session, onExit() {} });
  // Theory opens the detailed panel in an effect (verified in a browser).
  // SSR can verify focus and brief; ExamReview renders its toggle immediately.
  assert.ok(theory.includes(q.text) && theory.replace(/<[^>]*>/g, '').includes(entry.brief), id + ': focused theory entry');
  assert.ok(review.includes('Стиль объяснения') && review.includes('Смысл') && review.includes('По делу'), id + ': review toggle');
  assert.ok(review.replace(/<[^>]*>/g, '').includes(entry.brief), id + ': default plain brief');
}

// Independent calculations for the numeric keys: priority vector order is
// lexicographic, with local receiving port used only after sender port ties.
assert.ok(28672 + 100 < 32768 + 100);
assert.match(ALL_QUESTIONS.find(q => q.id === ids[0]).answers[keys[0]], /28772/);
const vectors = [
  ['P1', [1, 30, 10, 128, 7, 128, 9]],
  ['P2', [1, 30, 10, 128, 7, 128, 5]],
  ['P3', [1, 30, 10, 128, 8, 128, 1]],
  ['P4', [1, 30, 11, 64, 1, 128, 2]],
];
const compare = (a, b) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
};
assert.equal(vectors.sort((a, b) => compare(a[1], b[1]))[0][0], 'P2');
assert.ok(20 + 20 < 10 + 50, 'changed local cost selects P2');
assert.ok(5 + 20 > 10 && 5 < 10, 'P2 loses Root but N wins Designated');
assert.ok(0 + 10 < 0 + 20, 'boundary CIST root path uses P1');

console.log('PASS: 15 STP scenarios; 5 applied/10 advanced; unique IDs, four answers/one key, plain/pro, real loader, 15 rendered review toggles and focused theory entries; beginner/mixed unchanged');

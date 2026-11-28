import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { reviewMaterialFixtures } from './review-material-fixtures.mjs';

mkdirSync('scripts/.cache', { recursive: true });
const outfile = resolve('scripts/.cache/review-navigation-tests.mjs');
await build({ stdin: { contents: `
  import React from 'react';
  import { renderToStaticMarkup } from 'react-dom/server';
  import { TheoryRazbory } from './src/components/TheoryRazbory';
  import { EngineeringReview, ExplanationLesson } from './src/components/EngineeringReview';
  export { ALL_QUESTIONS } from './src/data/questionsData';
  export { getQuestionDeepDive } from './src/data/questionExplanations';
  export { getLessonForQuestion, getLesson } from './src/data/lessons';
  export const render = question => renderToStaticMarkup(React.createElement(EngineeringReview,
    {question, onOpenLesson() {}, onNavigateToIpv4() {}, onNavigateToIpv6() {}}));
  export const renderTheory = question => renderToStaticMarkup(React.createElement(TheoryRazbory,
    {initialQuestionId: question.id, onOpenLesson() {}, onNavigateToIpv4() {}, onNavigateToIpv6() {}}));
  // Invoke the actual stateless button's event prop, not a duplicated mapping or HTML string.
  export const lessonButton = ExplanationLesson;
`, resolveDir: process.cwd(), sourcefile: 'review-navigation-tests.tsx' },
  bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent',
  external: ['react', 'react-dom', 'react-dom/server', 'lucide-react'] });
const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion, getLesson, render, renderTheory, lessonButton } =
  await import(pathToFileURL(outfile).href);
const missingLessonIds = [], missingProfessionalIds = [];
const materialCombinations = new Set();
const conceptsByQuestion = {
  'review-ndp-1': 'ndp-multicast', 'review-ndp-2': 'ra-router-lifetime',
  'review-ndp-3': 'dad-duplicate', 'review-slaac-4': 'slaac-compose',
  'review-slaac-5': 'slaac-prefix-flags', 'review-slaac-6': 'slaac-invalid-lifetime',
};
const escape = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#x27;');
for (const q of ALL_QUESTIONS) {
  const before = JSON.stringify(q), lesson = getLessonForQuestion(q.id), deep = getQuestionDeepDive(q);
  const exercise = conceptsByQuestion[q.id];
  const ipv6 = q.id === 'l3-d06' ? { targetMode: 'type' }
    : exercise ? { targetMode: 'concept', exercise } : undefined;
  assert.deepEqual(deep.ipv6Practice, ipv6, q.id + ': exact IPv6 practice context');
  const calls = [];
  const button = lessonButton({questionId: q.id, onOpenLesson: (...args) => calls.push(args)});
  if (lesson) {
    assert.equal(button.type, 'button', q.id);
    button.props.onClick();
    assert.deepEqual(calls, [[lesson.id, q.id]], q.id + ': exact handler payload');
    assert.equal(lessonButton({questionId:q.id}).props.disabled, true);
  } else {
    assert.notEqual(button.type, 'button', q.id);
    assert.deepEqual(calls, []);
  }
  for (const renderSurface of [render, renderTheory]) {
    const html = renderSurface(q);
    assert.equal(html.includes('Открыть IPv6-тренажёр'), Boolean(ipv6), q.id);
    materialCombinations.add(`${Boolean(lesson)}:${Boolean(deep.professional?.deep.trim())}`);
    if (lesson) {
      assert.equal(getLesson(lesson.id)?.id, lesson.id);
      assert.ok(html.includes(`aria-label="Перейти к уроку: ${escape(lesson.title)}"`), q.id);
      assert.ok(!html.includes('Урок по этой теме пока не подготовлен'), q.id);
    } else {
      if (renderSurface === render) missingLessonIds.push(q.id);
      assert.ok(html.includes('Урок по этой теме пока не подготовлен'), q.id);
      assert.ok(!html.includes('Перейти к уроку'), q.id);
    }
    if (deep.professional?.deep.trim()) {
      assert.ok(html.includes('aria-label="Стиль объяснения"'), q.id);
      assert.ok(!html.includes('Профессиональный разбор пока не подготовлен'), q.id);
    } else {
      if (renderSurface === render) missingProfessionalIds.push(q.id);
      assert.ok(!html.includes('aria-label="Стиль объяснения"'), q.id);
      assert.ok(html.includes('Профессиональный разбор пока не подготовлен'), q.id);
    }
  }
  assert.equal(JSON.stringify(q), before, 'rendering never mutates saved question content');
}
assert.equal(materialCombinations.size, 4, 'all lesson/pro availability combinations are exercised');
assert.ok(missingLessonIds.length && missingLessonIds.length < ALL_QUESTIONS.length);
assert.ok(missingProfessionalIds.length && missingProfessionalIds.length < ALL_QUESTIONS.length);
for (const fixture of reviewMaterialFixtures) {
  const q = ALL_QUESTIONS.find(question => question.id === fixture.id);
  assert.ok(q, fixture.id);
  assert.equal(getLessonForQuestion(q.id)?.id ?? null, fixture.lessonId, q.id);
  assert.equal(Boolean(getQuestionDeepDive(q).professional?.deep.trim()), fixture.professional, q.id);
  const calls = [];
  const button = lessonButton({questionId:q.id, onOpenLesson: (...args) => calls.push(args)});
  if (fixture.lessonId) button.props.onClick();
  assert.deepEqual(calls, fixture.lessonId ? [[fixture.lessonId, q.id]] : [], q.id + ': independently specified lesson ID');
}
assert.equal(new Set(reviewMaterialFixtures.map(f => `${Boolean(f.lessonId)}:${f.professional}`)).size, 4);
const find = id => {
  const q = ALL_QUESTIONS.find(x => x.id === id);
  assert.ok(q, id);
  return { question: q, deep: getQuestionDeepDive(q) };
};
for (const [id, prefix, address] of [
  ['l3-06', 24, undefined],
  ['l3-08', 26, '192.168.10.70'],
  ['l3-11', 28, '10.0.0.32'],
  ['new-l3-23', 23, '192.168.10.0'],
  ['gen-bin-dec-252', 22, '172.20.6.14'],
  ['gen-bc-26-4', 26, '10.60.0.128'],
  ['gen-hosts-27', 26, undefined],
]) {
  const { question, deep: { ipv4Practice: route } } = find(id);
  for (const surface of [render, renderTheory]) assert.ok(surface(question).includes('Открыть IPv4-тренажёр'), id);
  assert.deepEqual([route?.targetMode, route?.targetPrefix, route?.targetAddress], ['calc', prefix, address], id);
}
for (const id of ['gen-bc-25-3', 'gen-bc-25-4', 'gen-net-25-3', 'l3-15', 'review-ndp-1']) {
  const { question, deep } = find(id);
  assert.equal(deep.ipv4Practice, undefined, id);
  for (const surface of [render, renderTheory]) assert.ok(!surface(question).includes('Открыть IPv4-тренажёр'), id);
}
for (const id of ['gen-bc-25-3', 'gen-bc-25-4', 'gen-net-25-3']) {
  assert.equal(getLessonForQuestion(id)?.id, 'l3-subnets', 'practice filtering must not remove lesson links');
}
const audit = { baseCommit: '0eb8f5b11b62f949b48554236664ab33f2de3957', totalQuestions: ALL_QUESTIONS.length,
  lessonCoverage: ALL_QUESTIONS.length - missingLessonIds.length,
  professionalCoverage: ALL_QUESTIONS.length - missingProfessionalIds.length,
  note: 'Missing materials are coverage gaps, not automatic technical errors in questions. Lesson coverage uses the live getLessonForQuestion resolver, including approved calculation mappings.',
  missingLessonIds, missingProfessionalIds };
writeFileSync('scripts/.cache/review-material-coverage.json', JSON.stringify(audit, null, 2) + '\n');
if (process.argv.includes('--write-audit')) {
  writeFileSync('docs/audits/review-material-coverage.json', JSON.stringify(audit, null, 2) + '\n');
}
console.log(`PASS: all ${audit.totalQuestions} question renders in EngineeringReview and TheoryRazbory, exact callback payloads; ${audit.lessonCoverage} lesson links / ${missingLessonIds.length} lesson gaps; ${audit.professionalCoverage} pro / ${missingProfessionalIds.length} pro gaps`);

import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';

mkdirSync('scripts/.cache', { recursive: true });
const outfile = resolve('scripts/.cache/review-navigation-tests.mjs');
await build({ stdin: { contents: `
  import React from 'react';
  import { renderToStaticMarkup } from 'react-dom/server';
  import { EngineeringReview } from './src/components/EngineeringReview';
  export { ALL_QUESTIONS } from './src/data/questionsData';
  export { getQuestionDeepDive } from './src/data/questionExplanations';
  export { getLessonForQuestion, getLesson } from './src/data/lessons';
  export const render = question => renderToStaticMarkup(React.createElement(EngineeringReview,
    {question, onOpenLesson() {}}));
`, resolveDir: process.cwd(), sourcefile: 'review-navigation-tests.tsx' },
  bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent',
  external: ['react', 'react-dom', 'react-dom/server', 'lucide-react'] });
const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion, getLesson, render } =
  await import(pathToFileURL(outfile).href);
const missingLessonIds = [], missingProfessionalIds = [];
const materialCombinations = new Set();
const escape = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#x27;');
for (const q of ALL_QUESTIONS) {
  const before = JSON.stringify(q), lesson = getLessonForQuestion(q.id), deep = getQuestionDeepDive(q);
  const html = render(q);
  materialCombinations.add(`${Boolean(lesson)}:${Boolean(deep.professional?.deep.trim())}`);
  if (lesson) {
    assert.equal(getLesson(lesson.id)?.id, lesson.id);
    assert.ok(html.includes(`aria-label="Перейти к уроку: ${escape(lesson.title)}"`), q.id);
    assert.ok(!html.includes('Урок по этой теме пока не подготовлен'), q.id);
  } else {
    missingLessonIds.push(q.id);
    assert.ok(html.includes('Урок по этой теме пока не подготовлен'), q.id);
    assert.ok(!html.includes('Перейти к уроку'), q.id);
  }
  if (deep.professional?.deep.trim()) {
    assert.ok(html.includes('aria-label="Стиль объяснения"'), q.id);
    assert.ok(!html.includes('Профессиональный разбор пока не подготовлен'), q.id);
  } else {
    missingProfessionalIds.push(q.id);
    assert.ok(!html.includes('aria-label="Стиль объяснения"'), q.id);
    assert.ok(html.includes('Профессиональный разбор пока не подготовлен'), q.id);
  }
  assert.equal(JSON.stringify(q), before, 'rendering never mutates saved question content');
}
assert.equal(materialCombinations.size, 4, 'all lesson/pro availability combinations are exercised');
assert.ok(missingLessonIds.length && missingLessonIds.length < ALL_QUESTIONS.length);
assert.ok(missingProfessionalIds.length && missingProfessionalIds.length < ALL_QUESTIONS.length);
const audit = { baseCommit: '0eb8f5b11b62f949b48554236664ab33f2de3957', totalQuestions: ALL_QUESTIONS.length,
  lessonCoverage: ALL_QUESTIONS.length - missingLessonIds.length,
  professionalCoverage: ALL_QUESTIONS.length - missingProfessionalIds.length,
  note: 'Missing materials are coverage gaps, not automatic technical errors in questions. Lesson coverage uses the live getLessonForQuestion resolver, including approved calculation mappings.',
  missingLessonIds, missingProfessionalIds };
writeFileSync('scripts/.cache/review-material-coverage.json', JSON.stringify(audit, null, 2) + '\n');
if (process.argv.includes('--write-audit')) {
  writeFileSync('docs/audits/review-material-coverage.json', JSON.stringify(audit, null, 2) + '\n');
}
console.log(`PASS: all ${audit.totalQuestions} question renders; ${audit.lessonCoverage} lesson links / ${missingLessonIds.length} lesson gaps; ${audit.professionalCoverage} pro / ${missingProfessionalIds.length} pro gaps`);

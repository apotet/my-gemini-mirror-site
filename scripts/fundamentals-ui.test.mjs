import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';

mkdirSync('scripts/.cache', { recursive: true });
const outfile = resolve('scripts/.cache/fundamentals-ui.mjs');
await build({ stdin: { contents: `
  import React from 'react';
  import { renderToStaticMarkup } from 'react-dom/server';
  import { EngineeringReview } from './src/components/EngineeringReview';
  import { TheoryRazbory } from './src/components/TheoryRazbory';
  export { ALL_QUESTIONS } from './src/data/questionsData';
  export { getLessonForQuestion } from './src/data/lessons';
  export const renderReview = (question, calls) => renderToStaticMarkup(React.createElement(EngineeringReview, {
    question,
    onOpenLesson: (...args) => calls.lesson.push(args),
    onOpenPractice: (...args) => calls.practice.push(args),
  }));
  export const renderTheory = question => renderToStaticMarkup(React.createElement(TheoryRazbory, {
    initialQuestionId: question.id,
    onOpenLesson() {},
    onNavigateToIpv4() {},
    onNavigateToIpv6() {},
    onOpenPractice() {},
  }));
`, resolveDir: process.cwd(), sourcefile: 'fundamentals-ui.tsx' },
  bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent',
  external: ['react', 'react-dom', 'react-dom/server', 'lucide-react'] });
const { ALL_QUESTIONS, getLessonForQuestion, renderReview, renderTheory } = await import(pathToFileURL(outfile).href);

const expected = {
  'l2-03': { lesson: 'Ethernet: кадр, MAC и таблица коммутатора', practice: 'packet' },
  'l2-05': { lesson: 'Ethernet: кадр, MAC и таблица коммутатора', practice: 'packet' },
  'l3-01': { lesson: 'OSI: уровни и единицы данных', practice: 'packet' },
  'l4-02': { lesson: 'TCP: handshake и зачем три шага', practice: 'tcp' },
  'tcp-02': { lesson: 'TCP/IP: четыре уровня и инкапсуляция', practice: null },
};

for (const [id, want] of Object.entries(expected)) {
  const q = ALL_QUESTIONS.find(item => item.id === id);
  const calls = { lesson: [], practice: [] };
  const html = renderReview(q, calls);
  assert.ok(html.includes('Почему так') || html.includes('почему'), id + ' why label');
  assert.ok(html.includes('Простыми словами'), id + ' plain');
  assert.ok(html.includes('По делу') || html.includes('Инженерный разбор') || html.includes('Стиль объяснения'), id + ' pro control');
  assert.ok(html.includes('Перейти к уроку'), id + ' lesson link');
  assert.ok(html.includes(want.lesson), id + ' lesson title');
  if (want.practice) assert.ok(html.includes('Открыть стенд'), id + ' practice');
  else assert.ok(!calls.practice.length, id + ' no invented practice');
  const theory = renderTheory(q);
  assert.ok(theory.includes('Простыми словами') || theory.includes('По делу') || theory.includes('Перейти к уроку'), id + ' theory surface');
  console.log(id, 'review+theory ok', 'lesson', getLessonForQuestion(id)?.id);
}
console.log('interface layers, lessons and practice verified');

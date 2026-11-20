import assert from 'node:assert/strict';
import { existsSync, statSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

// Validate the same lesson data and glossary-backed markup used by the site.
mkdirSync(resolve('scripts/.cache'), { recursive: true });
const outfile = resolve('scripts/.cache/copper-cheatsheet-glossary.mjs');
await build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import { FormattedExplanation } from './src/components/FormattedExplanation';
      import { getLesson } from './src/data/lessons';
      import { GLOSSARY, GLOSSARY_TOOLTIPS } from './src/data/glossary';
      export const lesson = getLesson('l1-copper-fault-poe');
      export const glossary = GLOSSARY;
      export const tooltips = GLOSSARY_TOOLTIPS;
      export const renderBlock = text => renderToStaticMarkup(React.createElement(FormattedExplanation, { text }));
    `,
    resolveDir: process.cwd(),
    sourcefile: 'copper-cheatsheet-glossary-entry.tsx',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  external: ['react', 'react-dom', 'react-dom/server', 'lucide-react'],
  logLevel: 'silent',
});
const { lesson, glossary, tooltips, renderBlock } = await import(pathToFileURL(outfile).href);
assert.ok(lesson, 'existing lesson ID must remain valid');
assert.equal(lesson.relatedQuestionIds.length, 16, 'preserve 16 related question links');
assert.equal(new Set(lesson.relatedQuestionIds).size, 16, 'do not duplicate question links');

const schemeBlock = lesson.blocks.find(block => block.heading.startsWith('T568A, T568B и Auto MDI-X'));
assert.equal(lesson.blocks.length, 11, 'redundant pinout bridge removed without losing actual content');
assert.ok(!lesson.blocks.some(block => block.heading.startsWith('Раскладка жил:')), 'no separate text-only pinout bridge');
const crimpBlock = lesson.blocks.find(block => block.heading.startsWith('Обычный обжим 8P8C'));
const practiceBlock = lesson.blocks.find(block => block.heading.startsWith('Практический случай'));
const testBlock = lesson.blocks.find(block => block.heading.startsWith('Проверка после обжима'));
assert.ok(schemeBlock && crimpBlock && practiceBlock && testBlock, 'all core blocks preserved');
assert.equal(schemeBlock.cheatsheet?.file, 'copper-pinout-four-wires.webp',
  'visible pinout image is directly beneath the shortened T568 explanation');
assert.equal(schemeBlock.cheatsheetJump, undefined, 'do not show redundant jump to already open diagram');
assert.ok(schemeBlock.body.includes('Схема раскладки — на изображении ниже.'),
  'short one-line image reference replaces whole explanatory bridge');
assert.ok(schemeBlock.body.length < 1050, 'T568 explanation remains concise');
assert.equal(crimpBlock.cheatsheet?.file, 'copper-termination-checklist.webp',
  'the closed-plug crimp cheatsheet is right next to the main crimp sequence');
assert.equal(crimpBlock.cheatsheetJump?.file, 'copper-termination-checklist.webp',
  'the primary crimp sheet opens directly from the lesson');
assert.equal(testBlock.cheatsheet, undefined, 'avoid duplicating the crimp sequence at test summary');
assert.equal(lesson.blocks.at(-1), testBlock, 'wiremap and link testing conclude the lesson');
assert.equal(lesson.blocks.indexOf(practiceBlock), lesson.blocks.indexOf(crimpBlock) + 1,
  'practical bad-crimp case immediately follows the correct crimp walkthrough');
const optionalPhotos = lesson.blocks.filter(block => block.imageCollapsible);
assert.equal(optionalPhotos.length, 1, 'only special pass-through crimper remains collapsed');
const comparison = lesson.blocks.find(block => block.heading.startsWith('Обычный 8P8C и pass-through'));
assert.ok(comparison?.image && !comparison.imageCollapsible,
  'connector comparison image is visible immediately without extra clicks');
assert.ok(comparison.image.caption.includes('Для сравнения:'), 'pass-through comparison is clearly labelled as alternative');
assert.equal(schemeBlock.cheatsheetInitiallyOpen, true, 'T568A/B wiring chart shown on first visit');
assert.equal(crimpBlock.cheatsheetInitiallyOpen, true, 'ordinary closed 8P8C walkthrough shown on first visit');
const categoriesBlock = lesson.blocks.find(block => block.cheatsheet?.file === 'copper-categories.webp');
assert.ok(categoriesBlock && !categoriesBlock.cheatsheetInitiallyOpen, 'secondary categories reference stays collapsed');
for (const key of ['Практический случай', 'Надрезанная', 'Потемнение контактов']) {
  const photoBlock = lesson.blocks.find(block => block.heading.startsWith(key));
  assert.ok(photoBlock?.image && !photoBlock.imageCollapsible, key + ' defect photo visible immediately');
}
assert.ok(optionalPhotos.every(block => block.image?.sprite === 'copper-ethernet-lesson.webp'
  && block.imageDisclosureLabel?.includes('Показать')), 'all optional photos retain real source images and labelled disclosures');
assert.equal(lesson.blocks.some(block => block.pinout === 't568'), false,
  'do not render an extra pinout table when the existing cheatsheet covers it');
assert.equal(lesson.blocks.filter(block => block.cheatsheet?.file === 'copper-pinout-four-wires.webp').length, 1,
  'no duplicated pinout cheat sheets');
const viewSource = readFileSync(resolve('src/components/LessonView.tsx'), 'utf8');
assert.match(viewSource, /details\.open = true/, 'reveal handler opens the in-page details element');
assert.match(viewSource, /open=\{b\.cheatsheetInitiallyOpen\}/,
  'details uses author-selected initial visibility for essential diagrams');
assert.match(viewSource, /data-cheatsheet-reveal=\{b\.cheatsheetJump\.file\}/, 'a real button is rendered for cheatsheet jump');
assert.match(viewSource, /data-lesson-secondary-photo/, 'secondary pass-through photos are shown by user disclosure');
assert.match(viewSource, /aria-controls=\{cheatsheetId\(b\.cheatsheetJump\.file\)\}/,
  'reveal buttons identify their target details to assistive tech');
for (const file of ['copper-pinout-four-wires.webp', 'copper-categories.webp', 'copper-termination-checklist.webp']) {
  assert.equal(lesson.blocks.filter(block => block.cheatsheet?.file === file).length, 1, file + ' remains linked');
  const path = resolve('public/lesson-images', file);
  assert.ok(existsSync(path) && statSync(path).size > 10000, file + ' exists and is not empty');
}

const explanation = lesson.blocks.find(block => block.heading.startsWith('T568A, T568B и Auto MDI-X'));
assert.ok(explanation?.body.includes('ANSI/TIA-568.2-E'), 'full current cabling standard explained');
assert.ok(explanation.body.includes('Automatic Medium Dependent Interface Crossover'),
  'Auto MDI-X is expanded in the lesson');
assert.ok(explanation.body.includes('четыре пары'), 'gigabit needs four pairs');
assert.ok(explanation.body.includes('двум парам'), '10/100 use two pairs');
const html = renderBlock(explanation.body);
const expected = ['T568A', 'T568B', 'Auto MDI-X', '10BASE-T', '100BASE-TX', '1000BASE-T'];
for (const term of expected) {
  assert.ok(lesson.terms.includes(term), term + ' listed in lesson terms');
  assert.ok(glossary[term]?.description?.length > 60, term + ' has substantive glossary text');
  assert.equal(glossary[term]?.lessonId, lesson.id, term + ' glossary points to actual lesson');
  assert.ok(tooltips[term]?.summary, term + ' has an inline tooltip entry');
  assert.ok(html.includes('data-glossary-term="' + term + '"'), term + ' has real rendered tooltip trigger');
}
assert.ok(!html.includes('data-glossary-term="A"'), 'do not show irrelevant DNS A-record tooltip for wiring A');
const pairHtml = renderBlock('A–A, B–B, A–B, B–A, A-A, A-B, A — B');
assert.ok(!pairHtml.includes('data-glossary-term="A"'),
  'wiring pair notation never opens irrelevant DNS A-record tooltip');
const dnsHtml = renderBlock('DNS-запись A содержит IPv4-адрес');
assert.ok(dnsHtml.includes('data-glossary-term="A"'),
  'standalone DNS A-record remains clickable outside T568 pair notation');
console.log('PASS: redundant block removed; T568 chart shown immediately, glossary, three cheat sheets and 16 question links preserved');

import assert from 'node:assert/strict';
import { existsSync, statSync, mkdirSync } from 'node:fs';
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

const pinoutBlock = lesson.blocks.find(block => block.heading.startsWith('Раскладка жил:'));
assert.ok(pinoutBlock, 'pinout lesson section exists');
assert.equal(pinoutBlock.cheatsheet?.file, 'copper-pinout-four-wires.webp',
  'the already-published pinout cheatsheet is reused beside the explanation');
assert.ok(pinoutBlock.body.includes('см. иллюстрированную шпаргалку'),
  'pinout prose refers readers to its neighboring cheatsheet');
assert.equal(lesson.blocks.some(block => block.pinout === 't568'), false,
  'do not render an extra pinout table when the existing cheatsheet covers it');
assert.equal(lesson.blocks.filter(block => block.cheatsheet?.file === 'copper-pinout-four-wires.webp').length, 1,
  'no duplicated pinout cheat sheets');
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
console.log('PASS: 16 question links, three existing cheat sheets, no repeated pinout, six live glossary tooltips, no DNS A misfire');

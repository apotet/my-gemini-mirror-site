// Scoped regression: the short PoE introduction stays plain, while lesson details retain definitions.
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

mkdirSync(resolve('scripts/.cache'), { recursive: true });
const outfile = resolve('scripts/.cache/poe-summary-glossary.mjs');
await build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import { FormattedExplanation } from './src/components/FormattedExplanation';
      import { getLesson } from './src/data/lessons';
      export const lesson = getLesson('l1-poe-budget');
      export const render = (text, options = {}) => renderToStaticMarkup(React.createElement(FormattedExplanation, { text, ...options }));
    `,
    resolveDir: process.cwd(),
    sourcefile: 'poe-summary-glossary-entry.tsx',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  external: ['react', 'react-dom', 'react-dom/server', 'lucide-react'],
  logLevel: 'silent',
});
const { lesson, render } = await import(pathToFileURL(outfile).href);
assert.ok(lesson && lesson.professional);
assert.ok(lesson.professional.summary.includes('IEEE 802.3af/at/bt'));
const professionalSummary = render(lesson.professional.summary, { plainGlossaryTerms: ['802.3af'] });
assert.ok(!professionalSummary.includes('data-glossary-term="802.3af"'), 'no isolated 802.3af popup in summary');
assert.ok(professionalSummary.includes('data-glossary-term="PSE"'), 'PSE hint retained in summary');
for (const term of ['802.3af', '802.3at', '802.3bt']) {
  for (const [mode, block] of [['plain', lesson.blocks[0]], ['professional', lesson.professional.blocks[0]]]) {
    assert.ok(render(block.body).includes('data-glossary-term="' + term + '"'), term + ' hint retained in ' + mode + ' body');
  }
}
console.log('PASS: PoE summary plain, all detailed standard tooltips retained');

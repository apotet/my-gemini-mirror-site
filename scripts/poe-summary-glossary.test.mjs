// Regression: PoE lesson hashtags resolve to glossary cards in both reading modes.
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
      import { GLOSSARY, GLOSSARY_TOOLTIPS } from './src/data/glossary';
      import { splitGlossaryText } from './src/utils/glossaryText';
      export { getLesson, GLOSSARY, GLOSSARY_TOOLTIPS, splitGlossaryText };
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
const { getLesson, GLOSSARY, GLOSSARY_TOOLTIPS, splitGlossaryText, render } = await import(pathToFileURL(outfile).href);
const budget = getLesson('l1-poe-budget');
assert.ok(budget && budget.professional);
assert.ok(budget.professional.summary.includes('PSE') && budget.professional.summary.includes('PD'));
const professionalSummary = render(budget.professional.summary);
assert.ok(!professionalSummary.includes('data-glossary-term="802.3af"'), 'summary must not show isolated standard tooltip');
assert.ok(professionalSummary.includes('data-glossary-term="PSE"'), 'PSE hint retained in summary');
for (const term of ['802.3af', '802.3at', '802.3bt']) {
  assert.ok(render(budget.blocks[0].body).includes('data-glossary-term="' + term + '"'), term + ' hint in plain explanation');
  assert.ok(budget.professional.blocks[0].cheatsheet?.alt.includes(term), term + ' in professional cheat sheet');
}
assert.ok(render(budget.professional.blocks[0].body).includes('data-glossary-term="802.3af"'), '802.3af hint in professional explanation');

assert.ok(GLOSSARY.LLDP?.description.includes('Link Layer Discovery Protocol'), 'LLDP hashtag must resolve to an explicit protocol definition');
assert.ok(GLOSSARY.LLDP?.relatesTo.includes('питания'), 'LLDP glossary must have useful PoE context');

const requiredTags = {
  'l1-poe-budget': {
    plain: ['802.3af', '802.3at', '802.3bt'],
    professional: ['802.3af', '802.3at', '802.3bt', 'PoE-тестер', 'Allocated', 'Remaining'],
  },
  'l1-poe-injectors-splitters': {
    plain: ['DC-выход', 'полярность'],
    professional: ['DC-выход', 'Class', 'Type', 'полярность'],
  },
  'cli-poe-diagnostics': {
    plain: ['Available', 'Used', 'Remaining'],
    professional: ['Available', 'Used', 'Remaining', 'Allocated', 'Utilized', 'Measured', 'LLDP Power-via-MDI', 'power-deny'],
  },
  'l1-poe-screen-reading': {
    plain: ['802.3af', '802.3at', '802.3bt', 'PoE-тестер'],
    professional: ['802.3af', '802.3at', '802.3bt', 'PoE-тестер'],
  },
};

for (const [id, modes] of Object.entries(requiredTags)) {
  const lesson = getLesson(id);
  assert.ok(lesson, 'missing PoE lesson: ' + id);
  for (const [mode, required] of Object.entries(modes)) {
    const terms = mode === 'plain' ? lesson.terms : lesson.professional?.terms;
    assert.ok(terms, id + ' lacks ' + mode + ' terms');
    assert.equal(new Set(terms).size, terms.length, id + ' duplicate hashtag in ' + mode);
    for (const term of required) assert.ok(terms.includes(term), id + ' missing hashtag: ' + term + ' (' + mode + ')');
    for (const term of terms) {
      const entry = GLOSSARY[term];
      assert.ok(entry, id + ' has non-clickable hashtag: ' + term + ' (' + mode + ')');
      assert.ok(entry.description?.trim().length > 20, id + ' empty hashtag description: ' + term);
      assert.ok(entry.relatesTo?.trim().length > 10, id + ' empty hashtag relation: ' + term);
    }
  }
}
const injectors = getLesson('l1-poe-injectors-splitters');
const passiveChecklist = injectors.blocks.find(block => block.heading.includes('Проверка перед подключением'));
assert.ok(passiveChecklist?.body.includes('passive PoE'), 'passive PoE should occur in the injector checklist');
assert.ok(render(passiveChecklist.body, { glossaryScope: 'poe' }).includes('data-glossary-term="passive PoE"'),
  'passive PoE must open a glossary tooltip in the checklist');
assert.ok(render(budget.professional.blocks.find(b => b.heading.includes('Когда в цепи есть инжектор')).body, { glossaryScope: 'poe' })
  .includes('data-glossary-term="passive PoE"'), 'passive PoE must also be clickable in the budget lesson');

const reboot = budget.professional.blocks.find(block => block.heading.includes('Кейс: камера перезагружается'));
assert.ok(reboot?.body.includes('ΔU = I × R'), 'voltage drop formula must be present');
assert.ok(reboot?.body.includes('Pпотерь = I² × R'), 'power loss formula must name its result');
const formula = render(reboot.body, { glossaryScope: 'poe' });
for (const symbol of ['ΔU', 'I', 'R', 'I²', 'Pпотерь']) {
  assert.ok(formula.includes('data-glossary-term="' + symbol + '"'), symbol + ' should have inline hover/tap tooltip');
  assert.ok(GLOSSARY_TOOLTIPS[symbol]?.summary.length > 35, symbol + ' needs an explanation');
}
assert.ok(GLOSSARY_TOOLTIPS.R.summary.includes('обратный проводники'), 'R must represent the full current loop');
assert.ok(!render('I × R', { glossaryScope: 'poe' }).includes('data-glossary-term="I"'),
  'bare I and R outside exact formula should never be hotlinked');
assert.ok(!splitGlossaryText('I × R').some(part => part.term === 'I' || part.term === 'R'),
  'single-letter symbols should never be activated in general text');
assert.ok(!render('ΔU = I × R').includes('data-glossary-term="I"'),
  'formula hints must not leak into unrelated lessons');
console.log('PASS: four PoE lessons, passive PoE tooltip, scoped ΔU/I/R/I²/Pпотерь formula hints');

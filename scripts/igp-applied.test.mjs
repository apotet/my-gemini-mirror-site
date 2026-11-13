import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Protocol references for the intentionally limited scenarios:
// RFC 7868 (EIGRP/DUAL and authentication), RFC 2328 (OSPFv2), RFC 3101 (NSSA).
// Do not infer a universal E1 > E2 > N1 > N2 ordering from Cisco route codes.
mkdirSync('scripts/.cache', { recursive: true });
const outfile = resolve('scripts/.cache/igp-applied.mjs');
await build({ stdin: { contents: `
export { ALL_QUESTIONS } from './src/data/questionsData';
export { APPLIED_INDIVIDUAL_DEEP } from './src/data/questionExplanationsApplied';
export { getQuestionDeepDive } from './src/data/questionExplanations';
export { GLOSSARY, GLOSSARY_TOOLTIPS } from './src/data/glossary';
export { splitGlossaryText } from './src/utils/glossaryText';
`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent' });
const data = await import(pathToFileURL(outfile).href);
const raw = JSON.parse(readFileSync('src/data/questions.json', 'utf8'));
const source = readFileSync('src/data/questionExplanationsApplied.ts', 'utf8');
const ids = ['eigrp', 'ospf'].flatMap(protocol => Array.from({ length: 5 }, (_, i) => `l3-${protocol}-${String(i + 1).padStart(2, '0')}`));
for (const id of ids) {
  const matches = data.ALL_QUESTIONS.filter(q => q.id === id);
  assert.equal(matches.length, 1, id + ': real bank registration');
  const q = raw.find(q => q.id === id);
  assert.ok(q, id + ': raw bank entry');
  assert.equal(q.difficulty, 'applied');
  assert.equal(q.group, 'l3');
  assert.equal(q.answers.length, 4);
  assert.equal(new Set(q.answers).size, 4);
  assert.equal(q.correct.length, 1);
  assert.ok(Number.isInteger(q.correct[0]) && q.answers[q.correct[0]]);
  const sentences = q.explanation.match(/[.!?](?:\s|$)/g) ?? [];
  assert.ok(sentences.length >= 1 && sentences.length <= 2, id + ': concise explanation');
  assert.match(source, new RegExp(`"${id}": layeredExplanation\\(`));
  const entry = data.APPLIED_INDIVIDUAL_DEEP[id];
  assert.ok(entry.brief.trim() && entry.trap.trim() && entry.pro.trim());
  assert.equal(entry.plain.split(/\n\s*\n/).filter(p => p.trim()).length, 3);
  assert.equal(entry.deep, entry.plain);
  const view = data.getQuestionDeepDive(q);
  assert.ok(view.hasIndividualDeep, id + ': individual text selected by application');
  assert.equal(view.plain, entry.plain);
  assert.equal(view.professional.deep, entry.pro, id + ': professional mode receives technical text');
  assert.equal(view.practiceLink, undefined, id + ': no unsupported EIGRP/OSPF lab link');
}
for (const term of ['EIGRP', 'Variance', 'Offset-list', 'Successor', 'Feasible Successor', 'Feasibility Condition', 'FD', 'RD', 'DUAL', 'unequal-cost load balancing', 'maximum-paths', 'next hop', 'Administrative Distance', 'AD', 'RIB', 'Null0', 'longest-prefix match', 'MD5', 'key-chain', 'key ID', 'key-string', 'K-values', 'HMAC-SHA-256', 'null authentication', 'plain-text authentication', 'O', 'O IA', 'E1', 'E2', 'N1', 'N2', 'NSSA', 'ASBR', 'redistribution', 'Forwarding Address', 'Network LSA', 'Router LSA', 'Hello Interval', 'Dead Interval', 'NBMA', 'P2P', 'Full', 'DR', 'BDR', 'DROTHER', 'LSDB']) {
  assert.ok(data.GLOSSARY[term]?.description?.trim(), term + ': description');
  assert.ok(data.GLOSSARY[term]?.relatesTo?.trim(), term + ': relatesTo');
  assert.ok(data.GLOSSARY_TOOLTIPS[term]?.summary, term + ': tooltip metadata');
  assert.ok(data.splitGlossaryText(`Проверка ${term}.`).some(p => p.term === term), term + ': matched by actual UI tokenizer');
}
console.log('PASS: 10 applied IGP questions, single keys, layered plain/pro UI mapping, glossary tooltips and no unsupported labs');

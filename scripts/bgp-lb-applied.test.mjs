import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Protocol references: RFC 4271 (BGP FSM and path attributes), RFC 4456 (Route Reflection).
// Load-balancer expectations follow the explicit health/persistence policies in each scenario.
mkdirSync('scripts/.cache', { recursive: true });
const outfile = resolve('scripts/.cache/bgp-lb-applied.mjs');
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
const ids = [...Array.from({ length: 7 }, (_, i) => `l3-bgp-${String(i + 1).padStart(2, '0')}`), ...Array.from({ length: 3 }, (_, i) => `l4-lb-${String(i + 1).padStart(2, '0')}`)];
for (const id of ids) {
  const matches = data.ALL_QUESTIONS.filter(q => q.id === id);
  assert.equal(matches.length, 1, id + ': real bank registration');
  const q = raw.find(q => q.id === id);
  assert.ok(q, id + ': raw bank entry');
  assert.equal(q.difficulty, 'applied');
  assert.equal(q.group, id.startsWith('l3-') ? 'l3' : 'l4');
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
  assert.equal(view.practiceLink, undefined, id + ': no invented BGP/LB lab link');
}
for (const term of ["BGP", "iBGP", "eBGP", "Idle", "Connect", "Active", "OpenSent", "OpenConfirm", "Established", "FSM", "OPEN", "KEEPALIVE", "UPDATE", "Route Reflector", "RR", "Route Reflection", "full mesh", "non-client", "confederation", "AS_PATH", "AS_SEQUENCE", "ORIGINATOR_ID", "CLUSTER_LIST", "NEXT_HOP", "next-hop-self", "Local Preference", "Weight", "best path", "eBGP multihop", "ebgp-multihop", "TTL security", "update-source", "allowas-in", "AS override", "send-community", "communities", "NLRI", "Load Balancing", "backend", "Health Check", "unhealthy", "fail-open", "draining", "Least Connections", "Round Robin", "Persistence", "sticky session", "affinity", "cookie", "session store"]) {
  assert.ok(data.GLOSSARY[term]?.description?.trim(), term + ': description');
  assert.ok(data.GLOSSARY[term]?.relatesTo?.trim(), term + ': relatesTo');
  assert.ok(data.GLOSSARY_TOOLTIPS[term]?.summary, term + ': tooltip metadata');
  assert.ok(data.splitGlossaryText(`Проверка ${term}.`).some(p => p.term === term), term + ': matched by actual UI tokenizer');
}
console.log('PASS: 10 applied BGP/LB questions, single keys, layered plain/pro UI mapping, glossary tooltips and no unsupported labs');

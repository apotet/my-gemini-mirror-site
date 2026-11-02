#!/usr/bin/env node
/**
 * Structural quality checks for the question bank.
 * Does NOT claim semantic expertise — flags data integrity issues only.
 *
 * Usage: node scripts/validate-questions.mjs
 * Exit 1 on hard failures.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWED_DIFF = new Set(['basic', 'beginner', 'applied', 'advanced']);
const ALLOWED_GROUPS = new Set([
  'l1-l2',
  'l3',
  'l4',
  'l5-l7',
  'tcpip',
  'troubleshooting',
  'visual-l1',
]);

function loadJsonQuestions() {
  const p = join(root, 'src/data/questions.json');
  return JSON.parse(readFileSync(p, 'utf8'));
}

/** Naive extract of Question-like objects from TS array modules. */
function extractFromTsModule(relPath) {
  const p = join(root, relPath);
  if (!existsSync(p)) return [];
  const src = readFileSync(p, 'utf8');
  const out = [];
  const re =
    /\{\s*id:\s*'([^']+)'[\s\S]*?group:\s*'([^']+)'[\s\S]*?text:\s*'((?:\\'|[^'])*)'[\s\S]*?answers:\s*\[([\s\S]*?)\]\s*,\s*correct:\s*\[([^\]]*)\][\s\S]*?explanation:\s*'((?:\\'|[^'])*)'[\s\S]*?difficulty:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) {
    const answersRaw = m[4];
    const answers = [...answersRaw.matchAll(/'((?:\\'|[^'])*)'/g)].map((x) => x[1]);
    const correct = m[5]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s));
    out.push({
      id: m[1],
      group: m[2],
      text: m[3],
      answers,
      correct,
      explanation: m[6],
      difficulty: m[7],
      _src: relPath,
    });
  }
  return out;
}

const jsonQ = loadJsonQuestions().map((q) => ({ ...q, _src: 'questions.json' }));
const extra = extractFromTsModule('src/data/questionsExtra.ts');
const diff = extractFromTsModule('src/data/questionsExtraDifficulty.ts');
const all = [...jsonQ, ...extra, ...diff];

const errors = [];
const warnings = [];
const seen = new Map();

for (const q of all) {
  if (!q.id) errors.push(`[${q._src}] missing id`);
  if (seen.has(q.id)) errors.push(`Duplicate id: ${q.id} (${seen.get(q.id)} and ${q._src})`);
  else seen.set(q.id, q._src);

  if (!q.text || !String(q.text).trim()) errors.push(`${q.id}: empty text`);
  if (!Array.isArray(q.answers) || q.answers.length < 2)
    errors.push(`${q.id}: answers must have ≥2 options`);
  if (!Array.isArray(q.correct) || q.correct.length === 0)
    errors.push(`${q.id}: correct[] empty`);
  for (const c of q.correct || []) {
    if (!Number.isInteger(c) || c < 0 || c >= (q.answers?.length || 0))
      errors.push(`${q.id}: correct index ${c} out of range`);
  }
  if (!q.explanation || !String(q.explanation).trim())
    warnings.push(`${q.id}: empty explanation`);
  if (q.difficulty && !ALLOWED_DIFF.has(q.difficulty))
    errors.push(`${q.id}: unknown difficulty '${q.difficulty}'`);
  if (q.group && !ALLOWED_GROUPS.has(q.group))
    warnings.push(`${q.id}: unexpected group '${q.group}'`);
  if (q.image) {
    const img = String(q.image);
    if (!img.startsWith('http') && !img.startsWith('assets/'))
      warnings.push(`${q.id}: unusual image path ${img}`);
  }
}

// Near-duplicate heuristic (same text normalized)
const byText = new Map();
for (const q of all) {
  const key = String(q.text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  if (!key) continue;
  if (!byText.has(key)) byText.set(key, []);
  byText.get(key).push(q.id);
}
const textDups = [...byText.entries()].filter(([, ids]) => ids.length > 1);

console.log('=== Question bank validation ===');
console.log(`Total objects scanned: ${all.length}`);
console.log(`Unique ids: ${seen.size}`);
console.log(`From json: ${jsonQ.length}, extra: ${extra.length}, difficulty: ${diff.length}`);
if (extra.length === 0) warnings.push('TS extract for questionsExtra.ts returned 0 — regex may need update');
if (diff.length === 0) warnings.push('TS extract for questionsExtraDifficulty.ts returned 0');

if (textDups.length) {
  console.log('\nPossible exact-text duplicates (heuristic):');
  for (const [, ids] of textDups.slice(0, 20)) console.log(' ', ids.join(', '));
}

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings.slice(0, 40)) console.log(' -', w);
}
if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  for (const e of errors) console.log(' !', e);
  process.exit(1);
}

console.log('\nOK: no hard structural errors.');
process.exit(0);

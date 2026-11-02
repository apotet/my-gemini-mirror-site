#!/usr/bin/env node
/**
 * Structural quality checks for the question bank actually used by the app.
 * Sources mirror questionsData.ts: questions.json + questionsExtra.ts + questionsExtraDifficulty.ts
 *
 * Usage: node scripts/validate-questions.mjs
 * Exit 1 on critical errors.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
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

const errors = [];
const warnings = [];

function loadJson(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    errors.push(`Missing file: ${rel}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    errors.push(`JSON parse failed ${rel}: ${e.message}`);
    return null;
  }
}

/**
 * Extract top-level object literals that look like Question entries from a TS module.
 * Brace-balanced scan after first '=' array start — more robust than a single regex.
 */
function extractQuestionsFromTs(relPath) {
  const p = join(root, relPath);
  if (!existsSync(p)) {
    warnings.push(`TS module missing: ${relPath}`);
    return [];
  }
  const src = readFileSync(p, 'utf8');
  const out = [];
  // Find each occurrence of id: '...' as anchor, then parse surrounding object
  const idRe = /\bid:\s*'([^']+)'/g;
  let m;
  while ((m = idRe.exec(src))) {
    const id = m[1];
    // Walk backward to nearest '{'
    let start = m.index;
    while (start > 0 && src[start] !== '{') start--;
    if (src[start] !== '{') continue;
    // Brace balance forward
    let depth = 0;
    let end = start;
    let inStr = false;
    let strCh = '';
    let escaped = false;
    for (; end < src.length; end++) {
      const ch = src[end];
      if (inStr) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === strCh) inStr = false;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') {
        inStr = true;
        strCh = ch;
        continue;
      }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          end++;
          break;
        }
      }
    }
    const block = src.slice(start, end);
    if (!block.includes('answers:') || !block.includes('correct:')) continue;

    const group = (block.match(/group:\s*'([^']+)'/) || [])[1];
    const difficulty = (block.match(/difficulty:\s*'([^']+)'/) || [])[1];
    const textM = block.match(/text:\s*'((?:\\'|[^'])*)'/);
    const explM = block.match(/explanation:\s*'((?:\\'|[^'])*)'/);
    const answersBlock = (block.match(/answers:\s*\[([\s\S]*?)\]/) || [])[1] || '';
    const answers = [...answersBlock.matchAll(/'((?:\\'|[^'])*)'/g)].map((x) =>
      x[1].replace(/\\'/g, "'")
    );
    const correctRaw = (block.match(/correct:\s*\[([^\]]*)\]/) || [])[1] || '';
    const correct = correctRaw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length)
      .map((s) => Number(s));
    const image = (block.match(/image:\s*'([^']+)'/) || [])[1];

    out.push({
      id,
      group,
      text: textM ? textM[1].replace(/\\'/g, "'") : '',
      answers,
      correct,
      explanation: explM ? explM[1].replace(/\\'/g, "'") : '',
      difficulty,
      image,
      _src: relPath,
    });
  }
  return out;
}

function extractDeepIds(relPath) {
  const p = join(root, relPath);
  if (!existsSync(p)) return new Set();
  const src = readFileSync(p, 'utf8');
  const ids = new Set();
  const re = /['"]([a-z0-9][\w-]*)['"]\s*:\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    // skip non-id-looking keys
    if (m[1].includes('_') || m[1].includes('-') || /^[a-z]+\d/.test(m[1]) || m[1].includes('d0'))
      ids.add(m[1]);
    else if (/^(l\d|tcpip|ts|review|gen|photo|k-|new-)/.test(m[1])) ids.add(m[1]);
  }
  // broader: any key that looks like question id
  const re2 = /['"]((?:l\d{1,2}|tcpip|ts|l57|review|gen|photo|k-|new-|visual)[\w-]*)['"]\s*:/g;
  while ((m = re2.exec(src))) ids.add(m[1]);
  return ids;
}

const jsonRaw = loadJson('src/data/questions.json');
const jsonQ = Array.isArray(jsonRaw)
  ? jsonRaw.map((q) => ({ ...q, _src: 'questions.json' }))
  : [];
const extra = extractQuestionsFromTs('src/data/questionsExtra.ts');
const diff = extractQuestionsFromTs('src/data/questionsExtraDifficulty.ts');
const all = [...jsonQ, ...extra, ...diff];

if (extra.length === 0) errors.push('CRITICAL: extracted 0 questions from questionsExtra.ts');
if (diff.length === 0) errors.push('CRITICAL: extracted 0 questions from questionsExtraDifficulty.ts');
if (jsonQ.length === 0) errors.push('CRITICAL: questions.json empty or unreadable');

const seen = new Map();
const byDiff = { beginner: 0, basic: 0, applied: 0, advanced: 0, other: 0 };
const appliedIds = [];
const advancedIds = [];

for (const q of all) {
  if (!q.id) {
    errors.push(`[${q._src}] missing id`);
    continue;
  }
  if (seen.has(q.id)) errors.push(`Duplicate id: ${q.id} (${seen.get(q.id)} vs ${q._src})`);
  else seen.set(q.id, q._src);

  if (!q.text || !String(q.text).trim()) errors.push(`${q.id}: empty text`);
  if (!Array.isArray(q.answers) || q.answers.length < 2)
    errors.push(`${q.id}: answers must have ≥2 options (got ${q.answers?.length})`);
  if (!Array.isArray(q.correct) || q.correct.length === 0)
    errors.push(`${q.id}: correct[] empty`);
  for (const c of q.correct || []) {
    if (!Number.isInteger(c) || c < 0 || c >= (q.answers?.length || 0))
      errors.push(`${q.id}: correct index ${c} out of range (answers=${q.answers?.length})`);
  }
  // duplicate correct indices
  if (Array.isArray(q.correct)) {
    const cs = new Set(q.correct);
    if (cs.size !== q.correct.length) errors.push(`${q.id}: duplicate entries in correct[]`);
  }
  // duplicate answer texts
  if (Array.isArray(q.answers)) {
    const norm = q.answers.map((a) => String(a).trim().toLowerCase());
    if (new Set(norm).size !== norm.length)
      warnings.push(`${q.id}: duplicate answer option texts`);
  }
  if (!q.explanation || !String(q.explanation).trim())
    warnings.push(`${q.id}: empty explanation`);
  // replacement character / mojibake
  if (q.explanation && /\uFFFD|��/.test(q.explanation))
    errors.push(`${q.id}: corrupted characters in explanation`);

  if (q.difficulty && !ALLOWED_DIFF.has(q.difficulty))
    errors.push(`${q.id}: unknown difficulty '${q.difficulty}'`);
  if (q.group && !ALLOWED_GROUPS.has(q.group))
    warnings.push(`${q.id}: unexpected group '${q.group}'`);

  const d = q.difficulty || 'other';
  if (byDiff[d] !== undefined) byDiff[d]++;
  else byDiff.other++;
  if (d === 'applied') appliedIds.push(q.id);
  if (d === 'advanced') advancedIds.push(q.id);

  if (q.image) {
    const img = String(q.image);
    if (!img.startsWith('http') && !img.startsWith('assets/'))
      warnings.push(`${q.id}: unusual image path ${img}`);
    else if (img.startsWith('assets/')) {
      const local = join(root, 'public', img);
      const local2 = join(root, img);
      if (!existsSync(local) && !existsSync(local2))
        warnings.push(`${q.id}: image file not found locally (${img})`);
    }
  }
}

// Exact text duplicates
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

// Individual deep coverage
const deepIds = new Set([
  ...extractDeepIds('src/data/questionExplanations.ts'),
  ...extractDeepIds('src/data/questionExplanationsApplied.ts'),
]);
const appliedMissingDeep = appliedIds.filter((id) => !deepIds.has(id));
const advancedMissingDeep = advancedIds.filter((id) => !deepIds.has(id));
const orphanDeep = [...deepIds].filter((id) => !seen.has(id));

console.log('=== Question bank validation ===');
console.log(`Sources: json=${jsonQ.length}, extra=${extra.length}, difficulty=${diff.length}`);
console.log(`Total objects: ${all.length}`);
console.log(`Unique ids: ${seen.size}`);
console.log(
  `Difficulty: beginner=${byDiff.beginner} basic=${byDiff.basic} applied=${byDiff.applied} advanced=${byDiff.advanced} other=${byDiff.other}`
);
console.log(`Individual deep keys found: ${deepIds.size}`);
console.log(`Applied with deep: ${appliedIds.length - appliedMissingDeep.length}/${appliedIds.length}`);
console.log(`Advanced with deep: ${advancedIds.length - advancedMissingDeep.length}/${advancedIds.length}`);

if (appliedMissingDeep.length) {
  console.log(`\nApplied WITHOUT individual deep (${appliedMissingDeep.length}):`);
  console.log(' ', appliedMissingDeep.slice(0, 80).join(', '));
  if (appliedMissingDeep.length > 80) console.log('  …');
}
if (advancedMissingDeep.length) {
  console.log(`\nAdvanced WITHOUT individual deep (${advancedMissingDeep.length}):`);
  console.log(' ', advancedMissingDeep.slice(0, 80).join(', '));
}
if (orphanDeep.length) {
  warnings.push(`Deep keys without question: ${orphanDeep.slice(0, 20).join(', ')}`);
}

if (textDups.length) {
  console.log(`\nExact-text duplicate groups (heuristic, ${textDups.length}):`);
  for (const [, ids] of textDups.slice(0, 15)) console.log(' ', ids.join(', '));
  warnings.push(`${textDups.length} exact-text duplicate groups — expert review`);
}

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings.slice(0, 50)) console.log(' -', w);
}
if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  for (const e of errors) console.log(' !', e);
  process.exit(1);
}

console.log('\nOK: no critical structural errors.');
// Soft policy: do not fail build solely on missing deep coverage (report only)
process.exit(0);

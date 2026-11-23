/**
 * Independent diagnostic implementation: Reconstruct_Gate06_Fingerprints.txt
 * was not available in the supplied attachments/workspace when this was written.
 * This file does not claim to validate that absent script or grant semantic PASS.
 * Material serialization mirrors scripts/in-depth-report.mjs, including insertion order.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

export const CONTROL_SHA = 'b22984cc3746d35b2b2c990af59055dfe467778c';
export const CANDIDATES = [
  '188c6938ecb2c6563ba228fd31b5fa4fc74b94e4',
  '6e9fd840ef91f65430a032b5ece02ef056e08a2b',
  'd08d24c814c4a60731d42addeb7ef7b4b3a16cef',
];
export const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const strings = value => typeof value === 'string' ? [value]
  : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
export function materialFor(m, question) {
  const deep = m.getQuestionDeepDive(question);
  const lesson = m.getLessonForQuestion(question.id);
  const expanded = lesson ? {
    ...lesson, blocks: m.getLessonBlocksWithSections(lesson, 'plain'),
    professional: lesson.professional ? {
      ...lesson.professional, blocks: m.getLessonBlocksWithSections(lesson, 'professional'),
    } : undefined,
  } : null;
  const glossaryTerms = [...new Set(strings({ question, deep, lesson: expanded })
    .flatMap(text => m.splitGlossaryText(text).flatMap(s => s.term ? [s.term] : []))
    .concat(expanded?.terms ?? [], expanded?.professional?.terms ?? []))].sort();
  const definitions = Object.fromEntries(glossaryTerms.map(term => [term, {
    entry: m.GLOSSARY[term], tooltip: m.GLOSSARY_TOOLTIPS[term],
  }]));
  return {
    id: question.id,
    materialHash: hash({ question, deep, lesson: expanded, definitions }),
    questionDeepHash: hash({ question, deep }),
    sharedContextHash: hash({ lesson: expanded, definitions }),
    lessonId: lesson?.id ?? null,
  };
}
export function compare(expected, actual) {
  const map = new Map(actual.map(row => [row.id, row]));
  if (map.size !== actual.length) throw new Error('Duplicate resolved question IDs');
  const matched = [], mismatched = [], missing = [];
  for (const row of expected) {
    const found = map.get(row.id);
    if (!found) missing.push(row.id);
    else (found.materialHash === row.materialHash ? matched : mismatched).push(row.id);
  }
  return { found: matched.length + mismatched.length, matched: matched.length,
    mismatched: mismatched.length, missing: missing.length,
    matchedIds: matched, mismatchedIds: mismatched, missingIds: missing };
}
const entry = `export {getTestingPool} from '../src/data/learningLevelExam';
export {getQuestionDeepDive} from '../src/data/questionExplanations';
export {getLessonForQuestion} from '../src/data/lessons';
export {getLessonBlocksWithSections} from '../src/data/lessons/lessonSectionLinks';
export {GLOSSARY,GLOSSARY_TOOLTIPS} from '../src/data/glossary';
export {splitGlossaryText} from '../src/utils/glossaryText';\n`;
const requiredFunctions = ['getTestingPool', 'getQuestionDeepDive', 'getLessonForQuestion',
  'getLessonBlocksWithSections', 'splitGlossaryText'];

async function snapshot(repo, sha, expected) {
  let temporary, stage = 'resolve-commit';
  const result = { sha, status: 'EXECUTION_FAILED', stage, pool: null, found: null,
    matched: null, mismatched: null, missing: null };
  try {
    if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Expected full 40-character Git SHA');
    const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).trim();
    result.resolvedSha = git('rev-parse', `${sha}^{commit}`);
    if (result.resolvedSha !== sha) throw new Error('Commit resolution differs from requested SHA');
    result.sourceTreeSha = git('rev-parse', `${sha}:src`);
    result.loaderHash = createHash('sha256').update(git('show', `${sha}:scripts/load-bank.mjs`) + '\n').digest('hex');
    result.packageLockHash = createHash('sha256').update(git('show', `${sha}:package-lock.json`) + '\n').digest('hex');
    stage = 'extract-historical-source';
    temporary = mkdtempSync(join(tmpdir(), 'netops-gate06-'));
    const archive = join(temporary, 'source.tar'), tree = join(temporary, 'tree');
    mkdirSync(tree);
    // Archive goes to disk: source trees exceed execFileSync's default stdout buffer.
    git('archive', `--output=${archive}`, sha, 'src', 'scripts', 'package.json');
    execFileSync('tar', ['-xf', archive, '-C', tree]);
    symlinkSync(join(repo, 'node_modules'), join(tree, 'node_modules'), 'dir');
    stage = 'import-historical-loader';
    const loader = await import(pathToFileURL(join(tree, 'scripts/load-bank.mjs')).href);
    if (typeof loader.bundleEntry !== 'function') throw new Error('Historical bundleEntry unavailable');
    stage = 'bundle-historical-entry';
    const historicalEntry = existsSync(join(tree, 'scripts/in-depth-entry.ts'));
    result.entryKind = historicalEntry ? 'historical-in-depth-entry' : 'diagnostic-exports-of-historical-modules';
    const entryPath = historicalEntry ? 'scripts/in-depth-entry.ts' : 'scripts/gate06-diagnostic-entry.ts';
    if (!historicalEntry) writeFileSync(join(tree, entryPath), entry);
    const m = await loader.bundleEntry(entryPath, 'gate06-reconstruction-bundle.mjs');
    stage = 'validate-resolver-exports';
    for (const name of requiredFunctions) if (typeof m[name] !== 'function') throw new Error(`Missing historical function: ${name}`);
    if (!m.GLOSSARY || !m.GLOSSARY_TOOLTIPS) throw new Error('Historical glossary exports unavailable');
    stage = 'resolve-materials';
    const pool = m.getTestingPool('mixed', 'in-depth');
    if (!Array.isArray(pool) || !pool.length) throw new Error('Historical pool is empty or not an array');
    const rows = pool.map(question => materialFor(m, question));
    Object.assign(result, { pool: pool.length, ...compare(expected, rows), rows, stage: 'complete' });
    result.status = result.matched === expected.length && result.missing === 0 ? 'REPRODUCED' : 'NOT_REPRODUCED';
  } catch (error) {
    result.stage = stage;
    result.error = { name: error.name, message: error.message, stack: error.stack,
      stderr: error.stderr?.toString() ?? null, code: error.code ?? null };
  } finally {
    if (temporary) rmSync(temporary, { recursive: true, force: true });
  }
  return result;
}

async function main() {
  const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const args = process.argv.slice(2);
  let output = resolve(repo, 'scripts/.cache/gate06-reconstruction');
  const extra = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) output = resolve(args[++i]);
    else if (args[i] === '--candidate' && args[i + 1]) extra.push(args[++i]);
    else throw new Error(`Unknown/incomplete argument: ${args[i]}`);
  }
  if (extra.length > 5) throw new Error('At most five explicitly justified additional candidates');
  mkdirSync(output, { recursive: true });
  const baselineFiles = ['final-review-1.json', 'final-review-4.json'];
  // Read the immutable historical ledgers from the frozen control commit, never the PR working tree.
  const ledgers = baselineFiles.map(name => {
    const raw = execFileSync('git', ['-C', repo, 'show', `${CONTROL_SHA}:docs/audits/in-depth/${name}`], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
    const json = JSON.parse(raw);
    if (!Array.isArray(json.rows)) throw new Error(`Missing rows in ${name}`);
    return { name, sha256: createHash('sha256').update(raw).digest('hex'), rows: json.rows };
  });
  const expected = ledgers.flatMap(item => item.rows);
  if (expected.length !== 160 || new Set(expected.map(r => r.id)).size !== 160 || expected.some(r => !/^[a-f0-9]{64}$/.test(r.materialHash))) throw new Error('Invalid historical 160-ID fingerprint ledger');
  const result = { schemaVersion: 1, purpose: 'PROVENANCE_DIAGNOSTIC_NOT_SEMANTIC_ACCEPTANCE',
    implementationOrigin: 'Independent implementation; supplied TXT unavailable',
    controlSha: CONTROL_SHA, executionSha: execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    node: process.version, esbuildVersion: createRequire(import.meta.url)('esbuild/package.json').version,
    formula: 'sha256(JSON.stringify({question,deep,lesson:expanded,definitions}))',
    expectedCount: expected.length,
    ledgers: ledgers.map(({ name, sha256 }) => ({ name, sha256 })), candidates: [] };
  console.log(JSON.stringify({ event: 'start', executionSha: result.executionSha, controlSha: CONTROL_SHA, expectedCount: expected.length, node: result.node, esbuildVersion: result.esbuildVersion }));
  const write = () => writeFileSync(join(output, 'reconstruction.json'), JSON.stringify(result, null, 2) + '\n');
  for (const sha of [...new Set([...CANDIDATES, ...extra])]) {
    const candidate = await snapshot(repo, sha, expected);
    result.candidates.push(candidate); write();
    console.log(JSON.stringify({ ...candidate, rows: undefined, matchedIds: undefined, mismatchedIds: undefined }));
  }
  result.current = await snapshot(repo, CONTROL_SHA, expected);
  const reproduced = result.candidates.filter(c => c.status === 'REPRODUCED');
  result.status = result.candidates.some(c => c.status === 'EXECUTION_FAILED') || result.current.status === 'EXECUTION_FAILED'
    ? 'EXECUTION_FAILED' : reproduced.length ? 'REPRODUCED' : 'NOT_REPRODUCED';
  result.provenance = reproduced.length ? 'HISTORICAL_FINGERPRINTS_REPRODUCED' : 'PROVENANCE_UNVERIFIED';
  if (reproduced.length && result.current.rows) {
    const old = new Map(reproduced[0].rows.map(row => [row.id, row]));
    result.classification = { referenceSha: reproduced[0].sha, currentSha: CONTROL_SHA, A: [], B: [], CE: [], D: [] };
    for (const row of result.current.rows) {
      const previous = old.get(row.id);
      const group = !previous ? 'D' : row.materialHash === previous.materialHash ? 'A'
        : row.questionDeepHash === previous.questionDeepHash ? 'B' : 'CE';
      result.classification[group].push(row.id);
    }
    result.classification.semanticAcceptance = 'NOT_INFERRED; CE and D require version-bound external evidence';
  }
  write();
  console.log(JSON.stringify({ status: result.status, provenance: result.provenance, currentPool: result.current.pool, currentMatched: result.current.matched, output: join(output, 'reconstruction.json') }));
  if (result.status === 'EXECUTION_FAILED') process.exitCode = 2;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.stack);
    const args = process.argv.slice(2), index = args.indexOf('--output');
    const output = index >= 0 && args[index + 1] ? resolve(args[index + 1])
      : resolve(dirname(fileURLToPath(import.meta.url)), '.cache/gate06-reconstruction');
    mkdirSync(output, { recursive: true });
    writeFileSync(join(output, 'reconstruction.json'), JSON.stringify({ schemaVersion: 1,
      status: 'EXECUTION_FAILED', provenance: 'PROVENANCE_UNVERIFIED', controlSha: CONTROL_SHA,
      error: { name: error.name, message: error.message, stack: error.stack },
    }, null, 2) + '\n');
    process.exitCode = 2;
  });
}

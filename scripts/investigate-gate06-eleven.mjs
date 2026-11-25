/** Targeted diagnostics only: the eleven unresolved final-review-4 hashes.
 * Uses the first-stage artifact; never reruns the six historical pools or grants PASS.
 * Optional surviving local bundles are evidence identified by byte hash, not Git provenance.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CONTROL_SHA, hash, materialFor } from './reconstruct-gate06-fingerprints.mjs';

export const IDS = ['tcp-05', 'review-ptp-17', 'mon-snmp-01', 'mon-syslog-01', 'mon-syslog-05',
  'mon-zabbix-01', 'wifi-std-01', 'wifi-std-04', 'wifi-roam-01', 'wifi-sec-01', 'wifi-sec-05'];
export const REFERENCE_SHA = '188c6938ecb2c6563ba228fd31b5fa4fc74b94e4';
const strings = value => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
const byteHash = value => createHash('sha256').update(value).digest('hex');
export const normalized = value => JSON.parse(JSON.stringify(value));
export function keyOrderPaths(before, after, path = '') {
  if (!before || !after || typeof before !== 'object' || typeof after !== 'object') return [];
  const a = Object.keys(before), b = Object.keys(after), changes = [];
  if (a.length === b.length && a.every(k => b.includes(k)) && JSON.stringify(a) !== JSON.stringify(b)) changes.push(path);
  for (const key of a) if (key in after) changes.push(...keyOrderPaths(before[key], after[key], path ? `${path}.${key}` : key));
  return changes;
}
export function differencePaths(before, after, path = '') {
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  if (!before || !after || typeof before !== 'object' || typeof after !== 'object') return [path];
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  const changes = keys.flatMap(key => differencePaths(before[key], after[key], path ? `${path}.${key}` : key));
  // Key order alone affects fingerprints, even when all corresponding values agree.
  if (!changes.length && JSON.stringify(Object.keys(before)) !== JSON.stringify(Object.keys(after))) changes.push(`${path}.[key-order]`);
  return changes;
}
export function capture(m, question) {
  const deep = m.getQuestionDeepDive(question), lesson = m.getLessonForQuestion(question.id);
  const expanded = lesson ? { ...lesson, blocks: m.getLessonBlocksWithSections(lesson, 'plain'),
    professional: lesson.professional ? { ...lesson.professional, blocks: m.getLessonBlocksWithSections(lesson, 'professional') } : undefined } : null;
  const terms = [...new Set(strings({ question, deep, lesson: expanded })
    .flatMap(text => m.splitGlossaryText(text).flatMap(part => part.term ? [part.term] : []))
    .concat(expanded?.terms ?? [], expanded?.professional?.terms ?? []))].sort();
  const definitions = Object.fromEntries(terms.map(term => [term, { entry: m.GLOSSARY[term], tooltip: m.GLOSSARY_TOOLTIPS[term] }]));
  const payload = { question, deep, lesson: expanded, definitions };
  const result = { id: question.id, materialHash: hash(payload), questionDeepHash: hash({ question, deep }),
    sharedContextHash: hash({ lesson: expanded, definitions }), lessonId: lesson?.id ?? null,
    questionHash: hash(question), deepHash: hash(deep), lessonHash: hash(expanded), definitionsHash: hash(definitions), terms };
  if (materialFor(m, question).materialHash !== result.materialHash) throw new Error(`Formula drift: ${question.id}`);
  return { ...result, payload };
}
function addressed(m) {
  const questions = m.getTestingPool('mixed', 'in-depth');
  // Resolve deep/lesson/definitions only for these eleven IDs.
  return IDS.map(id => {
    const matching = questions.filter(q => q.id === id);
    if (matching.length !== 1) throw new Error(`Expected exactly one ${id}, got ${matching.length}`);
    return capture(m, matching[0]);
  });
}
const publicRow = ({ payload, ...row }) => row;
async function historical(repo, sha) {
  const temporary = mkdtempSync(join(tmpdir(), 'gate06-eleven-'));
  try {
    const tree = join(temporary, 'tree'), archive = join(temporary, 'source.tar'); mkdirSync(tree);
    execFileSync('git', ['-C', repo, 'archive', `--output=${archive}`, sha, 'src', 'scripts', 'package.json']);
    execFileSync('tar', ['-xf', archive, '-C', tree]); symlinkSync(join(repo, 'node_modules'), join(tree, 'node_modules'), 'dir');
    const { bundleEntry } = await import(pathToFileURL(join(tree, 'scripts/load-bank.mjs')).href);
    const m = await bundleEntry('scripts/in-depth-entry.ts', 'gate06-eleven.mjs');
    return addressed(m);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
}
async function main() {
  const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..'), args = process.argv.slice(2);
  const options = { output: join(repo, 'scripts/.cache/gate06-eleven.json') }, bundles = [];
  for (let i = 0; i < args.length; i++) {
    const option = args[i], value = args[++i];
    if (!value) throw new Error(`Missing value: ${option}`);
    if (option === '--bundle') bundles.push(resolve(value));
    else if (['--artifact', '--output', '--cache', '--recovered'].includes(option)) options[option.slice(2)] = resolve(value);
    else throw new Error(`Unknown argument: ${option}`);
  }
  if (!options.artifact) throw new Error('--artifact first-stage reconstruction.json is required');
  const bytes = readFileSync(options.artifact), artifact = JSON.parse(bytes);
  if (artifact.controlSha !== CONTROL_SHA) throw new Error('Wrong first-stage control SHA');
  const oldEvidence = artifact.candidates.find(c => c.sha === REFERENCE_SHA);
  if (!oldEvidence || oldEvidence.matched !== 149 || oldEvidence.missing !== 0) throw new Error('Unexpected first-stage reference');
  const expected = JSON.parse(execFileSync('git', ['-C', repo, 'show', `${CONTROL_SHA}:docs/audits/in-depth/final-review-4.json`], { encoding: 'utf8' })).rows;
  const old = await historical(repo, REFERENCE_SHA), current = await historical(repo, CONTROL_SHA);
  const result = { schemaVersion: 1, purpose: 'ELEVEN_ID_DIAGNOSTIC_NOT_SEMANTIC_ACCEPTANCE',
    controlSha: CONTROL_SHA, referenceSha: REFERENCE_SHA, firstStageArtifactSha256: byteHash(bytes),
    node: process.version, addressedCount: IDS.length, rows: [], localBundles: [] };
  for (let i = 0; i < IDS.length; i++) {
    const a = old[i], b = current[i], evidence = oldEvidence.rows.find(r => r.id === a.id), currentEvidence = artifact.current.rows.find(r => r.id === a.id);
    for (const key of ['materialHash', 'questionDeepHash', 'sharedContextHash']) {
      if (a[key] !== evidence[key] || b[key] !== currentEvidence[key]) throw new Error(`First-stage artifact disagreement: ${a.id}/${key}`);
    }
    result.rows.push({ id: a.id, historicalHash: expected.find(r => r.id === a.id).materialHash,
      reference: publicRow(a), current: publicRow(b),
      referenceToCurrent: { questionChanged: a.questionHash !== b.questionHash, deepChanged: a.deepHash !== b.deepHash,
        lessonChanged: a.lessonHash !== b.lessonHash, definitionsChanged: a.definitionsHash !== b.definitionsHash,
        termListChanged: JSON.stringify(a.terms) !== JSON.stringify(b.terms),
        paths: differencePaths(normalized(a.payload), normalized(b.payload)) } });
  }
  if (options.cache) {
    const cacheBytes = readFileSync(options.cache), cache = JSON.parse(cacheBytes);
    result.localCache = { sha256: byteHash(cacheBytes), isGitProvenance: false, rows: IDS.map(id => {
      const row = cache.rows.find(r => r.id === id), lesson = cache.lessons.find(l => l.id === row.lessonId);
      const definitions = Object.fromEntries(row.glossaryTerms.map(term => [term, { entry: cache.glossary[term], tooltip: cache.tooltips[term] }]));
      const rebuiltHash = hash({ question: row.question, deep: row.deep, lesson, definitions });
      return { id, rebuiltHash, storedHash: row.materialHash, storedHashReproduced: rebuiltHash === row.materialHash,
        historicalHashReproduced: rebuiltHash === expected.find(r => r.id === id).materialHash };
    }) };
  }
  for (const path of bundles) {
    const raw = readFileSync(path), m = await import(pathToFileURL(path).href), rows = addressed(m);
    result.localBundles.push({ path, sha256: byteHash(raw), isGitProvenance: false,
      rows: rows.map((row, i) => ({ ...publicRow(row), historicalHashReproduced: row.materialHash === expected.find(r => r.id === row.id).materialHash,
        toReferencePaths: differencePaths(normalized(row.payload), normalized(old[i].payload)),
        payload: normalized(row.payload) })),
      // An evidence-backed component probe, not a claim that this composite was a Git tree.
      referenceMaterialWithBundleGlossary: old.map(reference => {
        const { question, deep, lesson } = reference.payload;
        const composite = capture({ ...m, getQuestionDeepDive: () => deep,
          getLessonForQuestion: () => lesson,
          getLessonBlocksWithSections: (value, style) => style === 'plain' ? value.blocks : value.professional.blocks,
        }, question);
        return { ...publicRow(composite), source: { questionDeepAndExpandedLesson: REFERENCE_SHA,
          glossaryProviderBundleSha256: byteHash(raw), singleGitFreeze: false },
          historicalHashReproduced: composite.materialHash === expected.find(r => r.id === composite.id).materialHash,
          toReferencePaths: differencePaths(normalized(composite.payload), normalized(reference.payload)),
          payload: normalized(composite.payload) };
      }) });
  }
  mkdirSync(dirname(options.output), { recursive: true }); writeFileSync(options.output, JSON.stringify(result, null, 2) + '\n');
  if (options.recovered) {
    const materials = [];
    for (const comparison of result.rows) {
      let chosen, provider, direct;
      for (const bundle of result.localBundles) {
        const row = bundle.rows.find(r => r.id === comparison.id && r.historicalHashReproduced);
        const composite = bundle.referenceMaterialWithBundleGlossary.find(r => r.id === comparison.id && r.historicalHashReproduced);
        if (row || composite) { chosen = row ?? composite; provider = bundle; direct = Boolean(row); break; }
      }
      if (!chosen) continue;
      materials.push({ id: chosen.id, materialHash: chosen.materialHash, questionDeepHash: chosen.questionDeepHash,
        sharedContextHash: chosen.sharedContextHash, sourceComponents: {
          recipe: direct ? 'ACTUAL_LOCAL_BUNDLE_ALL_COMPONENTS' : 'GIT_188C_QUESTION_DEEP_EXPANDED_LESSON_PLUS_ACTUAL_LOCAL_BUNDLE_GLOSSARY',
          questionDeepAndExpandedLessonSha: direct ? null : REFERENCE_SHA,
          glossaryProviderBundleSha256: provider.sha256, singleGitFreeze: false,
        }, historicalToCurrent: {
          questionDeepChanged: chosen.questionDeepHash !== comparison.current.questionDeepHash,
          sharedContextChanged: chosen.sharedContextHash !== comparison.current.sharedContextHash,
        }, to188cPaths: chosen.toReferencePaths,
        to188cKeyOrderPaths: keyOrderPaths(chosen.payload, normalized(old.find(r => r.id === chosen.id).payload)),
        definitionsKeysMatch188c: JSON.stringify(Object.keys(chosen.payload.definitions)) === JSON.stringify(comparison.reference.terms),
        payload: chosen.payload });
    }
    const recovered = { schemaVersion: 1, purpose: 'FORENSIC_COMPONENT_RECONSTRUCTION_NOT_GIT_FREEZE',
      semanticAcceptance: 'NOT_INFERRED',
      sourceBundles: result.localBundles.map(b => ({ path: b.path, sha256: b.sha256, gitCommit: null })),
      limitations: 'Byte-identified surviving local resolver evidence, combined with explicitly identified Git components. Not proof of a single reviewed Git commit.',
      historicalLedger: { sourceCommit: CONTROL_SHA, path: 'docs/audits/in-depth/final-review-4.json', statusesRemain: 'REVIEW' }, materials };
    mkdirSync(dirname(options.recovered), { recursive: true }); writeFileSync(options.recovered, JSON.stringify(recovered, null, 2) + '\n');
  }
  console.log(JSON.stringify({ addressed: IDS.length, referenceSha: REFERENCE_SHA, controlSha: CONTROL_SHA,
    localBundleMatches: result.localBundles.map(b => ({ sha256: b.sha256,
      wholeBundleIds: b.rows.filter(r => r.historicalHashReproduced).map(r => r.id),
      referencePlusBundleGlossaryIds: b.referenceMaterialWithBundleGlossary.filter(r => r.historicalHashReproduced).map(r => r.id) })),
    output: options.output, semanticAcceptance: 'NOT_INFERRED' }, null, 2));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.stack); process.exitCode = 2; });

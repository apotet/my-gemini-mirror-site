#!/usr/bin/env node
// Read-only snapshot generator. Runs ONLY in a job with no Gemini key or write token.
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const [rootArg, idsArg, outputArg] = process.argv.slice(2);
if (!rootArg || !idsArg || !outputArg) throw new Error('Usage: node gemini-audit-pack.mjs <checkout> <comma-separated-ids|auto:1..40> <output.json>');
const root = resolve(rootArg);
const sha = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const esbuild = createRequire(join(root, 'package.json'))('esbuild');
const outfile = join(root, 'scripts/.cache/gemini-audit-data.mjs');
mkdirSync(dirname(outfile), { recursive: true });
await esbuild.build({
  entryPoints: [join(root, 'scripts/in-depth-entry.ts')],
  bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'warning',
  loader: { '.ts': 'ts', '.tsx': 'tsx', '.json': 'json' },
});
const m = await import(pathToFileURL(outfile).href);

// Fixed 164-question Understanding snapshot: first four are already audited at
// this PR HEAD by Gemini API. No AI approval is inferred for the remaining IDs.
// The deterministic queue is tied to the target checkout and cannot drift silently.
const firstFourReviewed = new Set(['gap-pack2-27','gap-pack3-15','stp-new-09','l4-new-05']);
const auto = /^auto:([1-9][0-9]?)$/.exec(idsArg);
let ids;
if (auto) {
  const approvedQueueSHA = '5df2a0b46116323201a6ae933a4c650e78b105db';
  if (sha !== approvedQueueSHA) {
    throw new Error('Auto batch queue requires frozen PR #264 SHA '+approvedQueueSHA+
      '; target PR changed, refresh review manifest before continuing');
  }
  const pool = m.getTestingPool('mixed','in-depth').map(q => q.id);
  if (pool.length !== 164 || new Set(pool).size !== 164 ||
      ![...firstFourReviewed].every(id => pool.includes(id))) {
    throw new Error('Understanding pool changed: 164 IDs and four reviewed seed IDs must match; re-audit the queue plan');
  }
  const queue = pool.filter(id => !firstFourReviewed.has(id)).sort();
  if (queue.length !== 160) throw new Error('Expected precisely 160 unaudited Understanding questions');
  const index = Number(auto[1]);
  if (index < 1 || index > 40) throw new Error('Auto batch must be 1..40');
  ids = queue.slice((index - 1) * 4, index * 4);
  if (ids.length !== 4) throw new Error('Auto batch failed to select exactly four IDs');
} else {
  if (idsArg.startsWith('auto:')) throw new Error('Auto batch must be auto:1 through auto:40');
  ids = idsArg.split(',').map(s => s.trim());
  if (ids.length < 1 || ids.length > 10 || new Set(ids).size !== ids.length ||
      !ids.every(id => /^[A-Za-z0-9_-]{2,80}$/.test(id))) {
    throw new Error('Provide 1..10 unique question IDs (letters/digits/hyphens/underscores only)');
  }
}
const bank = new Map(m.ALL_QUESTIONS.map(q => [q.id, q]));
const groupSources = ['group1.ts','group2.ts','group3.ts','group4.ts','group5.ts'].map(name => ({
  path: 'src/data/inDepth/' + name,
  text: readFileSync(join(root,'src/data/inDepth',name),'utf8'),
}));
const hash = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const records = ids.map(id => {
  const q = bank.get(id);
  if (!q) throw new Error('Unknown question ID: ' + id);
  const lesson = m.getLessonForQuestion(id);
  if (!lesson) throw new Error('Missing linked lesson: ' + id);
  const anchor = m.getLessonSectionForQuestion(lesson.id,id);
  if (!anchor) throw new Error('Missing exact lesson anchor: ' + id);
  const linkedSections = {};
  for (const mode of ['plain','professional']) {
    const blocks = m.getLessonBlocksWithSections(lesson,mode).filter(b => b.anchorId === anchor);
    if (blocks.length !== 1 || !blocks[0].body) throw new Error('Bad exact '+mode+' anchor for '+id);
    linkedSections[mode] = { heading:blocks[0].heading, body:blocks[0].body };
  }
  const d = m.getQuestionDeepDive(q);
  const sources = groupSources.filter(f => f.text.includes('"anchorId": "'+anchor+'"') && f.text.includes('"'+id+'"')).map(f=>f.path);
  const material = {
    id, question:{text:q.text,answers:q.answers,correct:q.correct,topic:q.topic,difficulty:q.difficulty},
    explanation:{
      brief:d?.briefAnswer??null,plain:d?.deepAnalysis??null,professional:d?.professional?.deep??null,
      commonTrap:d?.commonTrap??null,practicalTip:d?.practicalTip??null,practiceLink:d?.practiceLink??null,
    },
    lesson:{id:lesson.id,title:lesson.title,anchorId:anchor,sections:linkedSections},
    sourcePaths:['src/data/questions.json','src/data/inDepth/index.ts','src/data/lessons/lessonSectionLinks.ts',...sources],
  };
  return {...material,materialHash:hash(material)};
});
const pack = { schemaVersion:1,sha,ids,records,scope:'CI-resolved material snapshot. Raw TS and live-browser navigation require separate verification.' };
const path = resolve(outputArg);
mkdirSync(dirname(path),{recursive:true});
writeFileSync(path, JSON.stringify(pack,null,2)+'\n','utf8');
console.log('Prepared '+records.length+' read-only materials from '+sha);

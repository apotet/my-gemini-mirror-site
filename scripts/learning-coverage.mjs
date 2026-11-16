#!/usr/bin/env node
import { readFileSync,mkdirSync,writeFileSync,existsSync } from 'node:fs';
import { resolve,dirname } from 'node:path';
import { scanRoot,scanRef } from './learning-quality/runtime.mjs';
import { gate } from './learning-quality/model.mjs';
const args=process.argv.slice(2),arg=k=>{const i=args.indexOf(k);return i<0?null:args[i+1];};
const root=resolve(arg('--root')??'.');
const receiptPath=resolve(root,'docs/learning-quality/reviews.json');
const receipts=existsSync(receiptPath)?JSON.parse(readFileSync(receiptPath,'utf8')):[];
const report=await scanRoot(root,receipts);
const output=resolve(arg('--out')??'docs/audits/learning-coverage-latest.json');
mkdirSync(dirname(output),{recursive:true});
if(args.includes('--gate')) {
  const base=arg('--base');
  if(!base) throw new Error('--gate requires --base COMMIT; no fail-open default');
  report.gate=gate(report,await scanRef(root,base),receipts);
}
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
const lines=['# Learning quality registry','',`Questions: ${report.summary.questions}; lessons: ${report.summary.lessons}; glossary: ${report.summary.glossary}; practice destinations: ${report.summary.practice}.`,
`Structural errors: ${report.summary.technicalErrors}; raw terminology candidates: ${report.summary.candidateOccurrences}; whole-material semantic PASS: ${report.summary.semanticPass}.`,'',
'Candidates are observations, not confirmed errors. Every material remains REVIEW until an independent, fingerprint-bound review is recorded.','',
'| Category | Occurrences |','| --- | ---: |',...Object.entries(report.summary.categories).sort().map(([k,v])=>`| ${k} | ${v} |`),'',
'Per-ID details, source paths, context, dependency fingerprints and review status are in the adjacent JSON. Re-run `npm run quality:scan`; use `npm run quality:packet -- question:ID` for reproducible review packets.','',...report.limits.map(l=>`- ${l}`)];
if(report.gate) lines.push('',`Differential gate: **${report.gate.status}**; changed materials: ${report.gate.changed.length}; failures: ${report.gate.failures.length}.`);
writeFileSync(output.replace(/\.json$/,'.md'),lines.join('\n')+'\n');
console.log(JSON.stringify({summary:report.summary,gate:report.gate},null,2));
if(report.gate?.status==='FAIL') process.exitCode=1;

import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { bundleEntry } from './load-bank.mjs';
import { evaluateInDepthFingerprintPolicy, evaluateCloseoutAcceptancePolicy } from './in-depth-review-policy.mjs';
const args=process.argv.slice(2);
assert.ok(args.length===0 || (args.length===1&&args[0]==='--report-only'),'Only --report-only is supported');
// Owner decision: fingerprint drift is diagnostic, not a release gate.
const reportOnly=true;

const m=await bundleEntry('scripts/in-depth-entry.ts','in-depth-review-fingerprint.mjs');
const audits=[
  JSON.parse(readFileSync('docs/audits/in-depth/final-review-1.json','utf8')),
  JSON.parse(readFileSync('docs/audits/in-depth/final-review-4.json','utf8')),
];
const audited=audits.flatMap(doc=>doc.rows);
assert.equal(audited.length,160,'160 prior independent rows');
assert.equal(new Set(audited.map(r=>r.id)).size,160,'Independent ID uniqueness');
const expected=new Map(audited.map(row=>[row.id,row]));
const current=m.getTestingPool('mixed','in-depth');
const strings=value=>typeof value==='string'?[value]:value&&typeof value==='object'?Object.values(value).flatMap(strings):[];
const expand=lesson=>lesson?({...lesson,blocks:m.getLessonBlocksWithSections(lesson,'plain'),professional:lesson.professional?{...lesson.professional,blocks:m.getLessonBlocksWithSections(lesson,'professional')}:undefined}):null;
const rows=current.map(question=>{
  const deep=m.getQuestionDeepDive(question),lesson=m.getLessonForQuestion(question.id),expanded=expand(lesson);
  const terms=[...new Set(strings({question,deep,lesson:expanded}).flatMap(text=>m.splitGlossaryText(text).flatMap(x=>x.term?[x.term]:[])).concat(expanded?.terms??[],expanded?.professional?.terms??[]))].sort();
  const definitions=Object.fromEntries(terms.map(term=>[term,{entry:m.GLOSSARY[term],tooltip:m.GLOSSARY_TOOLTIPS[term]}]));
  const hash=createHash('sha256').update(JSON.stringify({question,deep,lesson:expanded,definitions})).digest('hex');
  return {id:question.id,currentHash:hash,priorHash:expected.get(question.id)?.materialHash??null,matchesReviewed:hash===expected.get(question.id)?.materialHash,reviewer:expected.get(question.id)?.reviewer??'NEW - independent review required'};
});
const mismatch=rows.filter(r=>r.priorHash&&!r.matchesReviewed),newIds=rows.filter(r=>!r.priorHash);
const match=rows.filter(r=>r.matchesReviewed);
// Historical diagnostics stay truthful; the separately approved registry is
// the release decision. Missing/invalid registry never falls back to old rows.
let historicalPolicy;
try { historicalPolicy=evaluateInDepthFingerprintPolicy(rows,audited); }
catch(error) {
  historicalPolicy={status:'BLOCK',pass:false,errors:[error.message],
    missingHistoricalIds:[],unresolvedStatusIds:[],counts:{unresolvedStatus:audited.filter(r=>r.status!=='PASS').length}};
}
let registryText='';
try { registryText=readFileSync('docs/audits/in-depth/closeout-acceptance-20261124.json','utf8'); }
catch { /* The evaluator returns BLOCK for missing/invalid JSON. */ }
const policy=evaluateCloseoutAcceptancePolicy(rows,registryText);
if(policy.pass) {
  for(const row of JSON.parse(registryText).rows) {
    try { readFileSync(row.evidenceRef.split('#')[0]); }
    catch { policy.errors.push('Missing evidence file: '+row.evidenceRef); }
  }
  if(policy.errors.length) {policy.pass=false;policy.status='BLOCK';}
}
const summary={fingerprintGate:policy.status,acceptanceMode:policy.mode,acceptedRows:policy.counts.accepted,directAuditRows:policy.counts.directAudit,policyAcceptedRows:policy.counts.closeoutPolicy,changedAcceptedIds:policy.changedIds,newUnacceptedIds:policy.newIds,missingAcceptedIds:policy.missingIds,errors:policy.errors,historicalFingerprintGate:historicalPolicy.status,missingHistoricalIds:historicalPolicy.missingHistoricalIds,unresolvedStatusIds:historicalPolicy.unresolvedStatusIds,reviewedRows:audited.length,latestPool:current.length,unchangedPriorFingerprints:match.length,changedSinceReview:mismatch.length,newSinceReview:newIds.length,mismatchIds:mismatch.map(x=>x.id),newIds:newIds.map(x=>x.id),note:policy.note};
mkdirSync('scripts/.cache/in-depth',{recursive:true});
writeFileSync('scripts/.cache/in-depth/semantic-freeze-report.json',JSON.stringify({summary,policy,historicalPolicy,rows},null,2)+'\n');
console.log(JSON.stringify({...summary,unresolvedStatusIds:historicalPolicy.counts.unresolvedStatus,mismatchIds:mismatch.length},null,2));
if(!policy.pass){
  console.error('FINGERPRINT_GUARD_WARNING: '+policy.note);
  if(!reportOnly)process.exitCode=1;
}

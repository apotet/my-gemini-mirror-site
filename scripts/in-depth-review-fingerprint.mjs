import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { bundleEntry } from './load-bank.mjs';

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
assert.equal(current.length,164,'Four transferred questions added in main');
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
const summary={reviewedRows:audited.length,latestPool:current.length,unchangedPriorFingerprints:match.length,changedSinceReview:mismatch.length,newSinceReview:newIds.length,mismatchIds:mismatch.map(x=>x.id),newIds:newIds.map(x=>x.id),note:'Changed fingerprints cannot be promoted to semantic PASS without actual content-delta review; browser green is not content acceptance'};
mkdirSync('scripts/.cache/in-depth',{recursive:true});
writeFileSync('scripts/.cache/in-depth/semantic-freeze-report.json',JSON.stringify({summary,rows},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if(mismatch.length) process.exitCode=1;

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';

const m=await bundleEntry('scripts/in-depth-entry.ts','in-depth-four-new-audit-bundle.mjs');
const ids=['l3-d05','l4-d03','l4-d05','tcpip-d05'];
const pool=m.getTestingPool('mixed','in-depth');
assert.equal(pool.length,164,'Original Understanding contract must have 164 questions');
const rows=ids.map(id=>{
 const q=pool.find(x=>x.id===id);
 assert.ok(q,'Missing transferred ID '+id);
 const deep=m.getQuestionDeepDive(q);
 const lesson=m.getLessonForQuestion(id);
 assert.ok(lesson,'Missing lesson '+id);
 const anchor=m.getLessonSectionForQuestion(lesson.id,id);
 assert.ok(anchor,'Missing exact anchor '+id);
 const blocks={};
 for(const mode of ['plain','professional']){
   const all=m.getLessonBlocksWithSections(lesson,mode);
   const found=all.filter(x=>x.anchorId===anchor);
   assert.equal(found.length,1,id+': precisely one '+mode+' section');
   blocks[mode]={
     heading:found[0].heading,
     body:found[0].body,
     practiceLink:found[0].practiceLink??null,
     priorHeading:all[all.findIndex(x=>x.anchorId===anchor)-1]?.heading??null,
     nextHeading:all[all.findIndex(x=>x.anchorId===anchor)+1]?.heading??null
   };
 }
 const reviewedMaterial={question:q,deep,lesson:{id:lesson.id,title:lesson.title,anchor,blocks}};
 const digest=createHash('sha256').update(JSON.stringify(reviewedMaterial)).digest('hex');
 return {id,sha256:digest,...reviewedMaterial};
});
mkdirSync('scripts/.cache/in-depth',{recursive:true});
writeFileSync('scripts/.cache/in-depth/four-new-independent-audit.json',JSON.stringify({scope:'four transferred questions only, current source material',rows},null,2)+'\n');
for(const row of rows) console.log('AUDIT4_JSON '+JSON.stringify(row));
console.log('AUDIT4_SUMMARY '+JSON.stringify({count:rows.length,ids:rows.map(r=>r.id),hashes:rows.map(r=>r.sha256)}));

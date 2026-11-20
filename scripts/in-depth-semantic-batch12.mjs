import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';
const m=await bundleEntry('scripts/in-depth-entry.ts','in-depth-semantic-batch12-bundle.mjs');
const ids=[
  'review-syslog-25','review-slaac-4','review-qos-22','tr-03','tr-10',
  'gap-pack2-05','gap-pack2-10','gap-pack2-11','l4-03','l4-new-05',
  'review-poe-30','tcp-06'
];
assert.equal(new Set(ids).size,12,'Twelve unique audit targets');
const pool=m.getTestingPool('mixed','in-depth');
assert.equal(pool.length,164,'The 164-ID Understanding pool');
const rows=[];
for(const id of ids){
 const q=pool.find(x=>x.id===id);
 assert.ok(q,'Missing L2 ID '+id);
 const deep=m.getQuestionDeepDive(q);
 const lesson=m.getLessonForQuestion(id);
 const anchor=lesson?m.getLessonSectionForQuestion(lesson.id,id):null;
 const lessonSections={};
 for(const mode of ['plain','professional']){
   const blocks=lesson?m.getLessonBlocksWithSections(lesson,mode):[];
   const matched=anchor?blocks.filter(b=>b.anchorId===anchor):[];
   lessonSections[mode]={matchedCount:matched.length,heading:matched[0]?.heading??null,body:matched[0]?.body??null,
     precedingHeading:matched.length?blocks[blocks.findIndex(b=>b.anchorId===anchor)-1]?.heading??null:null,
     followingHeading:matched.length?blocks[blocks.findIndex(b=>b.anchorId===anchor)+1]?.heading??null:null};
 }
 const row={id,question:{text:q.text,answers:q.answers,correct:q.correct,difficulty:q.difficulty,explanation:q.explanation},
   explanation:{brief:deep.briefAnswer,plain:deep.deepAnalysis,professional:deep.professional?.deep??null,trap:deep.commonTrap,tip:deep.practicalTip,
      practiceLink:deep.practiceLink??null},
   lesson:{id:lesson?.id??null,title:lesson?.title??null,anchor:anchor??null,sections:lessonSections}};
 row.digest=createHash('sha256').update(JSON.stringify(row)).digest('hex');
 rows.push(row);
 console.log('AUDIT12_JSON '+JSON.stringify(row));
}
const folder='scripts/.cache/in-depth/semantic-batch12';
mkdirSync(folder,{recursive:true});
writeFileSync(folder+'/evidence.json',JSON.stringify({totalL2:pool.length,ids,rows},null,2)+'\n');
console.log('AUDIT12_SUMMARY '+JSON.stringify({count:rows.length,ids,invalidRoutes:rows.filter(x=>!x.lesson.id||!x.lesson.anchor||x.lesson.sections.plain.matchedCount!==1||x.lesson.sections.professional.matchedCount!==1).map(x=>x.id),hashes:rows.map(x=>({id:x.id,digest:x.digest}))}));

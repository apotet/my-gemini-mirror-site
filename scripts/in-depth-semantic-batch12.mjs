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
// Automated invariants support the manual content review; they do not create semantic PASS on their own.
const reviewedKeys={
 'review-syslog-25':[0],'review-slaac-4':[0],'review-qos-22':[0],
 'tr-03':[0],'tr-10':[0],'gap-pack2-05':[0],'gap-pack2-10':[1],
 'gap-pack2-11':[0],'l4-03':[2],'l4-new-05':[1],'review-poe-30':[0],
 'tcp-06':[0,1,2],
};
for(const row of rows){
 assert.deepEqual(row.question.correct,reviewedKeys[row.id],row.id+': original key unchanged');
 assert.ok(row.question.answers.length>=4,row.id+': distractors must remain present');
 assert.ok(row.explanation.brief?.trim()&&row.explanation.plain?.trim()&&row.explanation.professional?.trim(),row.id+': both authored explanations');
 assert.ok(row.lesson.id&&row.lesson.anchor,row.id+': exact lesson and section expected');
 for(const mode of ['plain','professional']){
  assert.equal(row.lesson.sections[mode].matchedCount,1,row.id+': exactly one '+mode+' exact anchor');
  assert.ok(row.lesson.sections[mode].body?.trim(),row.id+': '+mode+' section content required');
 }
}
assert.equal(rows.find(r=>r.id==='tcp-06').question.answers.length,5,'retain historical fifth answer');
const qos=rows.find(row=>row.id==='review-qos-22');
assert.match(qos.explanation.tip||'',/DSCP.*egress queue.*drops[/]marks/,'QoS tip must diagnose actual egress queue and drops');
assert.doesNotMatch(qos.explanation.tip||'',/Сначала линк|маршруты и DNS/,'Do not use unrelated generic link/routes/DNS troubleshooting');
console.log('PASS batch12 structural regression: 12 keys, 12 paired exact lesson anchors, individual modes and fixed QoS practical tip');

const folder='scripts/.cache/in-depth/semantic-batch12';
mkdirSync(folder,{recursive:true});
writeFileSync(folder+'/evidence.json',JSON.stringify({totalL2:pool.length,ids,rows},null,2)+'\n');
console.log('AUDIT12_SUMMARY '+JSON.stringify({count:rows.length,ids,invalidRoutes:rows.filter(x=>!x.lesson.id||!x.lesson.anchor||x.lesson.sections.plain.matchedCount!==1||x.lesson.sections.professional.matchedCount!==1).map(x=>x.id),hashes:rows.map(x=>({id:x.id,digest:x.digest}))}));

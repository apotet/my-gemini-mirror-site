import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {bundleEntry} from './load-bank.mjs';
const m=await bundleEntry('scripts/in-depth-entry.ts','in-depth-six-generic-bundle.mjs');
const ids=['l3-16','new-ts-photo-panel','review-dot1x-20','review-ospf-27','l7-new-04','l3-d07'];
assert.equal(m.getTestingPool('mixed','in-depth').length,164);
const pool=m.getTestingPool('mixed','in-depth');
const results=ids.map(id=>{
 const q=pool.find(row=>row.id===id);assert.ok(q,id+': must exist');
 const d=m.getQuestionDeepDive(q);const lesson=m.getLessonForQuestion(id);
 const anchor=lesson?m.getLessonSectionForQuestion(lesson.id,id):null;
 const sections={};
 for(const mode of ['plain','professional']){
 const blocks=lesson?m.getLessonBlocksWithSections(lesson,mode):[];
 const match=blocks.filter(block=>block.anchorId===anchor);
 sections[mode]=match.map(x=>({heading:x.heading,body:x.body}));
 }
 const row={id,question:{text:q.text,answers:q.answers,correct:q.correct,explanation:q.explanation},
   deep:{brief:d.briefAnswer,plain:d.deepAnalysis,pro:d.professional?.deep??null,tip:d.practicalTip,trap:d.commonTrap,practiceLink:d.practiceLink??null},
   lesson:{id:lesson?.id??null,title:lesson?.title??null,anchor,sections}};
 row.auditHash=createHash('sha256').update(JSON.stringify(row)).digest('hex');
 console.log('GENERIC6_JSON '+JSON.stringify(row));
 return row;
});
mkdirSync('scripts/.cache/in-depth',{recursive:true});
writeFileSync('scripts/.cache/in-depth/six-generic-source.json',JSON.stringify({source:'current runtime resolver, unreviewed semantics',results},null,2)+'\n');
console.log('GENERIC6_SUMMARY '+JSON.stringify({count:results.length,ids,missingLesson:results.filter(x=>!x.lesson.id).map(x=>x.id),missingSection:results.filter(x=>!x.lesson.sections.plain.length||!x.lesson.sections.professional.length).map(x=>x.id)}));

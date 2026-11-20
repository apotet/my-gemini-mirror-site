import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const root='scripts/.cache/in-depth';
const ref=JSON.parse(readFileSync(root+'/reference-materials-exact.json','utf8'));
const now=JSON.parse(readFileSync(root+'/current-materials-exact.json','utf8'));
const audits=[
 ...JSON.parse(readFileSync('docs/audits/in-depth/final-review-1.json','utf8')).rows,
 ...JSON.parse(readFileSync('docs/audits/in-depth/final-review-4.json','utf8')).rows
];
assert.equal(ref.items.length,160);assert.equal(now.items.length,164);
const old=new Map(ref.items.map(x=>[x.id,x]));
const rev=new Map(audits.map(x=>[x.id,x]));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function localBlock(row,mode){
 const arr=mode==='plain'?row.material.lesson?.blocks:row.material.lesson?.professional?.blocks;
 return row.anchor ? (arr||[]).find(x=>x.anchorId===row.anchor)??null : null;
}
const rows=now.items.map(current=>{
 const baseline=old.get(current.id);
 const review=rev.get(current.id);
 if(!baseline)return {id:current.id,category:'new',changed:true,baselineMatchesReview:false};
 const delta={
  question:!eq(baseline.material.question,current.material.question),
  explanation:!eq(baseline.material.deep,current.material.deep),
  lessonRoute:!eq({id:baseline.lessonId,anchor:baseline.anchor},{id:current.lessonId,anchor:current.anchor}),
  linkedPlain:!eq(localBlock(baseline,'plain'),localBlock(current,'plain')),
  linkedProfessional:!eq(localBlock(baseline,'professional'),localBlock(current,'professional')),
  wholeLessonPlain:!eq(baseline.material.lesson?.blocks,current.material.lesson?.blocks),
  wholeLessonProfessional:!eq(baseline.material.lesson?.professional,current.material.lesson?.professional),
  glossary:!eq(baseline.material.definitions,current.material.definitions)
 };
 const direct=delta.question||delta.explanation||delta.lessonRoute||delta.linkedPlain||delta.linkedProfessional;
 const full=baseline.materialHash!==current.materialHash;
 const category=direct?'directContentOrExactSection':full?'sharedLessonOrGlossaryOnly':'identicalToReference';
 return {id:current.id,category,baselineMatchesReview:review?.materialHash===baseline.materialHash,currentMatchesReview:review?.materialHash===current.materialHash,
  lessonId:current.lessonId,oldAnchor:baseline.anchor,currentAnchor:current.anchor,delta};
});
const counts=rows.reduce((acc,row)=>(acc[row.category]=(acc[row.category]||0)+1,acc),{});
const reviewedBaseline=rows.filter(row=>row.baselineMatchesReview);
const summary={
 total:rows.length,counts,
 verifiedReviewBaseline:reviewedBaseline.length,
 fromVerifiedReviewBaseline:{
  directlyChanged:reviewedBaseline.filter(x=>x.category==='directContentOrExactSection').length,
  sharedOnly:reviewedBaseline.filter(x=>x.category==='sharedLessonOrGlossaryOnly').length,
  fullyIdentical:reviewedBaseline.filter(x=>x.category==='identicalToReference').length,
 },
 warning:'Shared-only is NOT semantic PASS: entire lesson/global glossary may have changed. Review shared material once for all affected IDs, then verify per-ID links. A mismatched historical baseline is never promoted.'
};
mkdirSync(root,{recursive:true});
writeFileSync(root+'/local-impact-triage.json',JSON.stringify({summary,rows},null,2)+'\n');
console.log('IMPACT_SUMMARY '+JSON.stringify(summary));
console.log('IMPACT_SHARED_SAMPLE '+JSON.stringify(rows.filter(row=>row.category==='sharedLessonOrGlossaryOnly').slice(0,40).map(row=>({id:row.id,lessonId:row.lessonId,delta:row.delta,baselineMatchesReview:row.baselineMatchesReview}))));
console.log('IMPACT_ROUTE_CHANGES '+JSON.stringify(rows.filter(row=>row.delta?.lessonRoute).map(row=>({id:row.id,oldAnchor:row.oldAnchor,currentAnchor:row.currentAnchor}))));

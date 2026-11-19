import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const [referencePath,currentPath,outPath='scripts/.cache/in-depth/semantic-material-delta.json']=process.argv.slice(2);
assert(referencePath&&currentPath,'Usage: node scripts/in-depth-material-delta.mjs REFERENCE.json CURRENT.json [OUTPUT.json]');
const oldSnapshot=JSON.parse(readFileSync(referencePath,'utf8'));
const newSnapshot=JSON.parse(readFileSync(currentPath,'utf8'));
const audits=['docs/audits/in-depth/final-review-1.json','docs/audits/in-depth/final-review-4.json'].flatMap(file=>JSON.parse(readFileSync(file,'utf8')).rows);
const review=new Map(audits.map(row=>[row.id,row]));
const reference=new Map(oldSnapshot.items.map(row=>[row.id,row]));
const current=new Map(newSnapshot.items.map(row=>[row.id,row]));
assert.equal(new Set(review.keys()).size,160,'160 unique prior independent review IDs');
assert.equal(current.size,164,'164 current Understanding IDs');
const isObj=x=>x!==null&&typeof x==='object';
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function trim(x){if(x===undefined)return '<missing>';const s=JSON.stringify(x);return s.length>360?s.slice(0,360)+'… [length='+s.length+']':s;}
function changes(a,b,p='',result=[]){
  if(eq(a,b))return result;
  if(isObj(a)&&isObj(b)&&Array.isArray(a)===Array.isArray(b)){
    const keys=Array.isArray(a)?Array.from({length:Math.max(a.length,b.length)},(_,i)=>i):[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
    for(const key of keys){changes(a[key],b[key],p+(Array.isArray(a)?'['+key+']':(p?'.':'')+key),result);}
  }else result.push({path:p||'$',before:trim(a),after:trim(b)});
  return result;
}
const grokReview=JSON.parse(readFileSync('docs/audits/in-depth/semantic-review-grok-batch-01.json','utf8'));
const grok=new Map(grokReview.entries.map(q=>[q.id,q]));
const ids=[...current.keys()].filter(id=>!review.has(id)||current.get(id).materialHash!==review.get(id).materialHash);
const rows=ids.map(id=>{
  const before=reference.get(id),after=current.get(id),prior=review.get(id),grokRow=grok.get(id);
  const m1=before?.material,m2=after.material;
  const differences=before?{
    question:changes(m1.question,m2.question),
    explanation:changes(m1.deep,m2.deep),
    lessonPlain:changes(m1.lesson?.blocks,m2.lesson?.blocks),
    lessonProfessional:changes(m1.lesson?.professional,m2.lesson?.professional),
    lessonMetadata:changes(m1.lesson?Object.fromEntries(Object.entries(m1.lesson).filter(([k])=>k!=='blocks'&&k!=='professional')):null,m2.lesson?Object.fromEntries(Object.entries(m2.lesson).filter(([k])=>k!=='blocks'&&k!=='professional')):null),
    glossaryDefinitions:changes(m1.definitions,m2.definitions),
    lessonRoute:changes({lessonId:before.lessonId,anchor:before.anchor},{lessonId:after.lessonId,anchor:after.anchor})
  }:null;
  const counts=Object.fromEntries(Object.entries(differences||{}).map(([k,v])=>[k,v.length]));
  return {id,priorReviewHash:prior?.materialHash??null,referenceCommitHash:before?.materialHash??null,currentHash:after.materialHash,
    referenceMatchesIndependentReview:prior?before?.materialHash===prior.materialHash:null,
    reviewedMaterialUnchanged:prior?after.materialHash===prior.materialHash:false,
    grokClaimedCurrentHash:grokRow?.currentHash??null,
    grokHashVerified:grokRow?grokRow.currentHash===after.materialHash:null,
    currentLessonRoute:{lessonId:after.lessonId,anchor:after.anchor},
    changeCounts:counts,changes:differences,reviewStatus:'REVIEW — semantic inspection required'};
});
const baselineMatches=audits.filter(row=>reference.get(row.id)?.materialHash===row.materialHash);
const summary={referenceLabel:'Codex PR #263 last saved commit — candidate for historical reviewer snapshot, NOT presumed authoritative',
  referenceSha:'188c6938ecb2c6563ba228fd31b5fa4fc74b94e4',
  previousReviews:audits.length,referenceReviewHashMatches:baselineMatches.length,referenceReviewHashMismatches:audits.length-baselineMatches.length,
  currentPool:current.size,changedOrNew:rows.length,newQuestions:rows.filter(x=>!x.priorReviewHash).map(x=>x.id),
  grokBatch01Reported:10,grokBatch01CurrentHashMatches:rows.filter(x=>x.grokHashVerified===true).length,
  warning:'Reference SHA is an exact review baseline only for rows referenceMatchesIndependentReview=true. Other rows require locating an earlier historical snapshot. Diff counts are not semantic PASS.'};
const out=resolve(outPath);mkdirSync(dirname(out),{recursive:true});
writeFileSync(out,JSON.stringify({schemaVersion:1,summary,rows},null,2)+'\n');
const batch=rows.filter(row=>grok.has(row.id));
const bp=resolve('scripts/.cache/in-depth/semantic-delta-batch-01.json');
writeFileSync(bp,JSON.stringify({schemaVersion:1,summary,batch},null,2)+'\n');
console.log(JSON.stringify({summary,batch01:batch.map(x=>({id:x.id,referenceMatches:x.referenceMatchesIndependentReview,grokHashVerified:x.grokHashVerified,counts:x.changeCounts}))},null,2));

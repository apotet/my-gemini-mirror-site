import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const root='scripts/.cache/in-depth';
const old=JSON.parse(readFileSync(root+'/reference-materials-exact.json','utf8'));
const now=JSON.parse(readFileSync(root+'/current-materials-exact.json','utf8'));
const reviews=[
 ...JSON.parse(readFileSync('docs/audits/in-depth/final-review-1.json','utf8')).rows,
 ...JSON.parse(readFileSync('docs/audits/in-depth/final-review-4.json','utf8')).rows
];
const previous=new Map(old.items.map(row=>[row.id,row]));
const latest=new Map(now.items.map(row=>[row.id,row]));
const review=new Map(reviews.map(row=>[row.id,row]));
assert.equal(previous.size,160,'160 Codex source questions');
assert.equal(latest.size,164,'164 Understanding questions');
assert.equal(review.size,160,'160 independent reviewer rows');
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const signatures=[
 ['genericNetworkTroubleshoot',/Сначала линк \(L1\/L2\)|затем маршруты и DNS/i],
 ['genericSocketListening',/ss -tulpn.*слушающ/i],
 ['genericRouting',/ip route.*route print.*шлюз/i],
 ['genericTrap',/Смотрите точные формулировки стандартов и исключения/i],
 ['genericLayerOrder',/сначала проверь физику, затем IP|проверь физику.*DNS/i],
];
const rows=[...latest.values()].map(curr=>{
 const prior=previous.get(curr.id),reviewed=review.get(curr.id);
 const a=prior?.material,b=curr.material;
 const changes=!a?['new']:[
  !eq(a.question,b.question)?'question':null,
  !eq(a.deep,b.deep)?'explanation':null,
  !eq(a.lesson?.blocks,b.lesson?.blocks)?'lessonPlain':null,
  !eq(a.lesson?.professional,b.lesson?.professional)?'lessonProfessional':null,
  !eq(a.lesson?.id,b.lesson?.id)?'lessonRoute':null,
  !eq(a.definitions,b.definitions)?'glossary':null,
  !eq(a.lesson?Object.fromEntries(Object.entries(a.lesson).filter(([key])=>!['blocks','professional'].includes(key))):null,b.lesson?Object.fromEntries(Object.entries(b.lesson).filter(([key])=>!['blocks','professional'].includes(key))):null)?'lessonOther':null,
 ].filter(Boolean);
 const currentTip=b.deep?.practicalTip??'';
 const currentTrap=b.deep?.commonTrap??'';
 const currentExplanation=JSON.stringify(b.deep??{});
 const genericFlags=signatures.flatMap(([name,regex])=>[...[currentTip,currentTrap].filter(v=>regex.test(v))].length?[name]:[]);
 const score=(changes.includes('new')?10:0)+(changes.includes('question')?9:0)+(changes.includes('explanation')?6:0)+(changes.includes('lessonRoute')?7:0)+(changes.includes('lessonPlain')?3:0)+(changes.includes('lessonProfessional')?3:0)+(changes.includes('lessonOther')?2:0)+(changes.includes('glossary')?1:0)+(genericFlags.length*10)+(reviewed&&!eq(curr.materialHash,reviewed.materialHash)?2:0);
 return {id:curr.id,lessonId:curr.lessonId,anchor:curr.anchor,score,changes,previousHash:prior?.materialHash??null,currentHash:curr.materialHash,
  historicalReviewHash:reviewed?.materialHash??null,baselineMatchesReview:!!prior&&!!reviewed&&prior.materialHash===reviewed.materialHash,
  currentMatchesReview:!!reviewed&&curr.materialHash===reviewed.materialHash,
  genericFlags,tip:genericFlags.length?currentTip:null,trap:genericFlags.length?currentTrap:null};
});
const groups={};
for(const row of rows){
 const key=row.changes.length===0?'unchangedVsReference':row.changes.join('+');
 groups[key]=(groups[key]||0)+1;
}
const countKey=k=>rows.filter(row=>row.changes.includes(k)).length;
const flagRows=rows.filter(row=>row.genericFlags.length);
const priority=rows.filter(row=>row.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
const summary={
 current:rows.length,baseline:previous.size,historicalReviews:review.size,
 reviewerHashMatchesCurrent:rows.filter(row=>row.currentMatchesReview).length,
 reviewerHashMismatchCurrent:rows.filter(row=>row.historicalReviewHash&&!row.currentMatchesReview).length,
 newSinceHistoricalReview:rows.filter(row=>!row.historicalReviewHash).map(row=>row.id),
 referenceMatchesHistoricalReview:rows.filter(row=>row.baselineMatchesReview).length,
 changedVsReference:rows.filter(row=>row.changes.length>0).length,
 questionDelta:countKey('question'),explanationDelta:countKey('explanation'),
 lessonPlainDelta:countKey('lessonPlain'),lessonProfessionalDelta:countKey('lessonProfessional'),
 glossaryDelta:countKey('glossary'),lessonRouteDelta:countKey('lessonRoute'),
 genericFlagCount:flagRows.length,changeProfiles:groups,
 warning:'Prior REVIEW, equality of hashes and absence of regex flags are not semantic PASS; generic matching is prioritization only'
};
mkdirSync(root,{recursive:true});
writeFileSync(root+'/fingerprint-triage.json',JSON.stringify({baselineSha:'188c6938ecb2c6563ba228fd31b5fa4fc74b94e4',summary,priority,rows},null,2)+'\n');
console.log('TRIAGE_SUMMARY '+JSON.stringify(summary));
console.log('TRIAGE_GENERIC '+JSON.stringify(flagRows.map(r=>({id:r.id,flags:r.genericFlags,tip:r.tip,trap:r.trap}))));
console.log('TRIAGE_TOP30 '+JSON.stringify(priority.slice(0,30).map(r=>({id:r.id,score:r.score,changes:r.changes,baselineMatchesReview:r.baselineMatchesReview,lessonId:r.lessonId,genericFlags:r.genericFlags}))));

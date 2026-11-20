import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';

const oldSHA='1f273787370a64cf39732974b60c1706e538f5bb';
const newSHA='835a2e09c6760e065783a33cd72814958822b0c1';
const ids=['gen-diag-0','gen-transport-14','gen-transport-16','gen-transport-17','gen-transport-5','gen-transport-7','l12-storm01','new-ts-duplex','new-ts-vlan','tcpip-d01'];
const hash=b=>createHash('sha256').update(b).digest('hex');
const old=[],now=[],packs=[];
const root='output';
for(let i=0;i<2;i++){
 const name='pack_'+String(i+1).padStart(2,'0')+'.json';
 const expected=ids.slice(i*5,i*5+5);
 for(const side of ['old','new']){
  const file=side+'/'+name,raw=readFileSync(join(root,file)),data=JSON.parse(raw);
  assert.equal(data.sha,side==='old'?oldSHA:newSHA,'source SHA changed '+file);
  assert.deepEqual(data.ids,expected,'wrong source IDs '+file);
  assert.equal(data.records.length,5,'five questions expected');
  for(let j=0;j<5;j++){
   const r=data.records[j];
   assert.equal(r.id,expected[j]);
   assert.equal(r.question.answers.length,4,'four options per selected ID');
   assert.ok(r.question.correct.length);
   assert.ok(r.explanation.brief&&r.explanation.plain&&r.explanation.professional);
   assert.ok(r.lesson?.id&&r.lesson?.anchorId);
   assert.deepEqual(r.lesson.coverageIssues,[]);
   assert.ok(r.lesson.sections.plain?.body&&r.lesson.sections.professional?.body);
   (side==='old'?old:now).push(r);
  }
  packs.push({file,ids:expected,sha256:hash(raw)});
 }
}
assert.equal(old.length,10);assert.equal(now.length,10);
mkdirSync(join(root,'questions'),{recursive:true});
const paths=['explanation.brief','explanation.plain','explanation.professional','explanation.commonTrap','explanation.practicalTip','explanation.practiceLink','lesson.title','lesson.id','lesson.anchorId','lesson.sections.plain.heading','lesson.sections.plain.body','lesson.sections.professional.heading','lesson.sections.professional.body','lesson.coverageIssues'];
const get=(r,path)=>path.split('.').reduce((v,k)=>v?.[k],r);
const changes=[];
for(let i=0;i<10;i++){
 const a=old[i],b=now[i],id=ids[i];
 assert.equal(a.id,id);assert.equal(b.id,id);
 assert.deepEqual(a.question,b.question,id+': original question/options/keys changed');
 assert.deepEqual(a.lesson,b.lesson,id+': original linked lesson changed');
 assert.deepEqual(a.sourcePaths,b.sourcePaths,id+': source paths changed');
 const delta=paths.filter(p=>JSON.stringify(get(a,p))!==JSON.stringify(get(b,p))).map(field=>({field,before:get(a,field),after:get(b,field)}));
 assert.equal(delta.length,1,id+': exactly one targeted text field must change');
 assert.equal(delta[0].field,id==='tcpip-d01'?'explanation.commonTrap':'explanation.practicalTip');
 assert.notEqual(a.materialHash,b.materialHash,id+': new material hash expected');
 if(id==='tcpip-d01')assert.equal(delta[0].before,'Смотрите точные формулировки стандартов и исключения.');
 else assert.ok(delta[0].before==='Сначала линк (L1/L2), затем маршруты и DNS.'||delta[0].before===String.fromCharCode(96)+'ss -tulpn'+String.fromCharCode(96)+' — слушающие сокеты.',id+': source placeholder differs');
 changes.push({id,oldMaterialHash:a.materialHash,newMaterialHash:b.materialHash,key:b.question.correct,lessonId:b.lesson.id,anchorId:b.lesson.anchorId,fields:delta});
 const out=['# '+(i+1)+' / 10 — '+id,'','Frozen OLD: '+oldSHA,'Draft NEW: '+newSHA,'',
  '## Question',b.question.text,'','## Options',
  ...b.question.answers.map((text,j)=>'['+j+']'+(b.question.correct.includes(j)?' [SOURCE KEY]':'')+' '+text),
  '','## NEW individual review material','BRIEF:',String(b.explanation.brief),'PLAIN:',String(b.explanation.plain),'PROFESSIONAL:',String(b.explanation.professional),
  'COMMON TRAP:',String(b.explanation.commonTrap),'PRACTICAL TIP:',String(b.explanation.practicalTip),'',
  '## Linked lesson: '+b.lesson.id+'#'+b.lesson.anchorId,
  'PLAIN LESSON:',String(b.lesson.sections.plain.body),'PROFESSIONAL LESSON:',String(b.lesson.sections.professional.body),'',
  '## Source-authenticated change '+delta[0].field,'BEFORE:',String(delta[0].before),'AFTER:',String(delta[0].after),'',
  'Review the correct key, all distractors and both full lesson modes. No browser acceptance inferred.',''].join('\n');
 writeFileSync(join(root,'questions',String(i+1).padStart(2,'0')+'_'+id+'.md'),out);
}
const manifest={sourceRepository:'apotet/my-gemini-mirror-site',originalPR:264,parentDraftPR:282,newDraftPR:289,oldSHA,newSHA,ids,packs,count:10,changes,status:'UNREVIEWED_PROPOSED_SHA; not semantic accepted'};
writeFileSync(join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
writeFileSync(join(root,'LEARNING_CONTENT_STANDARD.md'),readFileSync('trusted/docs/LEARNING_CONTENT_STANDARD.md'));
writeFileSync(join(root,'01_GEMINI_WORK_TASK.md'),readFileSync('handoff-tools/handoff/GEMINI_BATCH03_FIX10_TASK.md'));
writeFileSync(join(root,'00_README.md'),'NetOps Gemini Work third-batch corrective delta: 10 old/new questions. Read 01_GEMINI_WORK_TASK.md and manifest.json. No keys, live website, merging or publishing.\n');
const files=['00_README.md','01_GEMINI_WORK_TASK.md','LEARNING_CONTENT_STANDARD.md','manifest.json',...packs.map(p=>p.file),...readdirSync(join(root,'questions')).map(n=>'questions/'+n)];
writeFileSync(join(root,'SHA256SUMS.txt'),files.map(f=>hash(readFileSync(join(root,f)))+'  '+f).join('\n')+'\n');
console.log('DELTA_EXPORT_OK',JSON.stringify({idCount:ids.length,changedFields:changes.reduce((n,r)=>n+r.fields.length,0),files:files.length,packCount:packs.length,manifestSHA256:hash(readFileSync(join(root,'manifest.json'))),sourceSHA:oldSHA,proposedSHA:newSHA}));

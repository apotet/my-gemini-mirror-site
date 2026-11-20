import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';

const sourceSha='1f273787370a64cf39732974b60c1706e538f5bb';
const ids=["l2-04","l2-12","l2-sec-05","l2-sec-08","l2-sec-13","l2-sec-18","stp-new-04","stp-new-09","ts-d02","ts-d03","ts-d05","ts-linux01","ts-pfc01","ts-x01","ts-x02","ts-x03","mon-snmp-01","mon-syslog-01","mon-syslog-05","mon-zabbix-01","review-dot1x-20","review-igmp-9","review-osi-34","review-ospf-27","review-poe-30","review-ptp-17","review-qos-22","review-slaac-4","review-syslog-25","wifi-roam-01"];
const hash=(buf)=>createHash('sha256').update(buf).digest('hex');
const root='output';
const packs=[];
const records=[];
assert.equal(ids.length,30);
assert.equal(new Set(ids).size,30);
for(let i=0;i<6;i++){
  const name='pack_'+String(i+1).padStart(2,'0')+'.json';
  const filename=join(root,'packs',name);
  const raw=readFileSync(filename);
  const data=JSON.parse(raw.toString('utf8'));
  const expected=ids.slice(i*5,i*5+5);
  assert.equal(data.sha,sourceSha,'wrong source SHA');
  assert.deepEqual(data.ids,expected,'wrong pack IDs');
  assert.equal(data.records.length,5,'wrong pack length');
  packs.push({file:'packs/'+name,ids:expected,sha256:hash(raw)});
  for(let j=0;j<5;j++){
    const r=data.records[j];
    assert.equal(r.id,expected[j]);
    assert.equal(typeof r.question.text,'string','missing stem');
    assert.equal(r.question.answers.length,4,'four choices required');
    assert.doesNotMatch(r.question.text,/на фото|на снимке|в кадре|на изображении|на рисунке|на фотографи|показанном штекере|на этом экране|на таком экране/i,'Visual-only question without image is not a self-contained archive');
    assert.ok(Array.isArray(r.question.correct)&&r.question.correct.length>=1,'missing answer key');
    assert.equal(typeof r.materialHash,'string','missing material hash');
    assert.ok(Array.isArray(r.lesson.coverageIssues),'missing coverage metadata');
    records.push(r);
  }
}
assert.deepEqual(records.map(x=>x.id),ids,'question order');
mkdirSync(join(root,'questions'),{recursive:true});
const sourceStandard=readFileSync('trusted/docs/LEARNING_CONTENT_STANDARD.md','utf8');
writeFileSync(join(root,'LEARNING_CONTENT_STANDARD.md'),sourceStandard,'utf8');
const workTask=readFileSync('handoff-tools/handoff/GEMINI_WORK_TASK_30.md','utf8');
writeFileSync(join(root,'01_TASK_FOR_GEMINI_WORK.md'),workTask,'utf8');

const readme=[
'# NetOps: archive for Gemini Work — 30 independent technical reviews',
'',
'One source commit: '+sourceSha+'. Source: staging Draft PR #264 (NOT published).',
'Start with 01_TASK_FOR_GEMINI_WORK.md, LEARNING_CONTENT_STANDARD.md and manifest.json.',
'Gemini Work should analyze SIX internal packs of FIVE IDs each and return 30 detailed verdicts in files: verdicts.json, REPORT.md, FIX_PROPOSALS.md.',
'Inside packs/*.json are original verbatim stems, four options, answer indices, briefs, individual plain/pro, contextual lesson sections in both styles, real lesson IDs/anchors and deterministic coverageIssues.',
'Inside questions/*.md are readable transcriptions of these SAME records; JSON packs are the machine-readable source of truth.',
'No API keys, user sessions, production access or repository write credentials.',
'Do not infer that lesson links actually work in a live browser; no UI, old sessions or published staging verified here.',
'No merge, deploy, baseline changes or final PASS to NetOps without later independent ChatGPT acceptance.',
'',
'Operator: upload this ZIP to Gemini app in Work mode and say: “Read 01_TASK_FOR_GEMINI_WORK.md and conduct all 30 reviews; return three final files or results ZIP.”',
'',
].join('\n');
writeFileSync(join(root,'00_READ_ME_FIRST.md'),readme,'utf8');

const idx=['# NetOps — 30 frozen Understanding questions','','Source SHA: '+sourceSha,'','| No. | ID | Topic | Lesson ID | Anchor | coverageIssues |','| ---: | --- | --- | --- | --- | --- |'];
const missing=[];
const questionHashes=[];
for(let i=0;i<records.length;i++){
  const r=records[i];
  const q=r.question,e=r.explanation,l=r.lesson;
  const issues=l.coverageIssues;
  if(issues.length)missing.push({id:r.id,issues});
  idx.push('| '+(i+1)+' | '+r.id+' | '+String(q.topic||'').replaceAll('|','\\|')+' | '+String(l.id||'MISSING')+' | '+String(l.anchorId||'MISSING')+' | '+(issues.join(', ')||'—')+' |');
  const page=[
    '# Question '+(i+1)+' of 30 — '+r.id,
    '',
    'FROZEN SOURCE SHA: '+sourceSha,
    'SNAPSHOT MATERIAL HASH: '+r.materialHash,
    'LESSON ANCHOR: '+String(l.id||'MISSING')+'#'+String(l.anchorId||'MISSING'),
    '',
    '## Question exact text',q.text,'',
    '## All answer options, preserving indices',
    ...q.answers.map((s,index)=>'Index '+index+': '+s),'',
    'Given source correct indices: '+JSON.stringify(q.correct),'',
    '## Individual answer explanations',
    'Brief (Почему так): '+String(e.brief??'MISSING'),'',
    'Plain (Смысл): '+String(e.plain??'MISSING'),'',
    'Professional (По делу): '+String(e.professional??'MISSING'),'',
    'Common trap: '+String(e.commonTrap??'MISSING'),'',
    'Practical tip: '+String(e.practicalTip??'MISSING'),'',
    'Practice link (unverified): '+JSON.stringify(e.practiceLink??null),'',
    '## Linked lesson in BOTH exact contextual styles',
    'Lesson title: '+String(l.title??'MISSING'),
    'Coverage issues: '+JSON.stringify(issues),'',
    '### Exact plain lesson section',
    'Heading: '+String(l.sections?.plain?.heading??'MISSING'),
    String(l.sections?.plain?.body??'MISSING'),'',
    '### Exact professional lesson section',
    'Heading: '+String(l.sections?.professional?.heading??'MISSING'),
    String(l.sections?.professional?.body??'MISSING'),'',
    '## Exporter-declared source paths (NOT live browser evidence)',
    ...(r.sourcePaths||[]).map(path=>'- '+path),'',
    'IMPORTANT: Independent reviewer must assess each incorrect answer separately and compare BOTH lesson modes before PASS.',''
  ];
  const mdPath=join(root,'questions',String(i+1).padStart(2,'0')+'_'+r.id+'.md');
  writeFileSync(mdPath,page.join('\n'),'utf8');
  questionHashes.push({id:r.id,materialHash:r.materialHash,lessonId:l.id||null,anchorId:l.anchorId||null,coverageIssues:issues});
}
writeFileSync(join(root,'02_INDEX.md'),idx.join('\n')+'\n','utf8');
const manifest={
  schemaVersion:1,sourceRepository:'apotet/my-gemini-mirror-site',sourcePR:264,
  sourceSHA:sourceSha,level:'Углублённый / in-depth',type:'Offline Gemini Work review handoff, NOT verified verdict',
  date:'2026-11-20',count:30,ids,packs,questionHashes,
  coverageIssues:missing,exporter:'trusted main scripts/gemini-audit-pack.mjs',
  security:'No API key, tokens, production files or GitHub write permission included'
};
writeFileSync(join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
const schema={
 note:'Template only. Not actual Gemini review. Replace with 30 individual entries.',
 sourceSHA:sourceSha,
 verdicts:[{
  id:'REPLACE',status:'PASS|FIX|REVIEW',correctKeyEvidence:'...',
  answersReview:[{index:0,verdict:'...',evidence:'...'},{index:1,verdict:'...',evidence:'...'},{index:2,verdict:'...',evidence:'...'},{index:3,verdict:'...',evidence:'...'}],
  briefReview:'...',plainReview:'...',professionalReview:'...',
  lessonId:'...',anchorId:'...',lessonPlainReview:'...',lessonProfessionalReview:'...',
  commonTrapReview:'...',practicalTipReview:'...',coverageIssues:[],issues:[],exactFixes:[],externalSources:[],
  verificationLimits:['Browser/CI/history not checked from offline archive']
 }]
};
writeFileSync(join(root,'result-template.json'),JSON.stringify(schema,null,2)+'\n','utf8');

const ordered=[
 '00_READ_ME_FIRST.md','01_TASK_FOR_GEMINI_WORK.md','02_INDEX.md',
 'LEARNING_CONTENT_STANDARD.md','manifest.json','result-template.json',
 ...packs.map(p=>p.file),
 ...readdirSync(join(root,'questions')).map(name=>'questions/'+name)
];
const lines=ordered.map(f=>hash(readFileSync(join(root,f)))+'  '+f);
writeFileSync(join(root,'SHA256SUMS.txt'),lines.join('\n')+'\n','utf8');
console.log('EXPORT_OK files='+ordered.length+' questions='+records.length+' packs='+packs.length+' source='+sourceSha);
console.log('MISSING_COVERAGE',JSON.stringify(missing));
console.log('MANIFEST_SHA256 '+hash(readFileSync(join(root,'manifest.json'))));
console.log('BYTES '+ordered.reduce((a,f)=>a+statSync(join(root,f)).size,0));

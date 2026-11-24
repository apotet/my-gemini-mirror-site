// Manual documentation export. No CI gate, API calls, acceptance pins or content mutation.
import {readFileSync,writeFileSync} from 'node:fs';
import {bundleEntry} from './load-bank.mjs';
const m=await bundleEntry('scripts/applied-l3-inventory-entry.ts','applied-l3-inventory.mjs');
const registry=JSON.parse(readFileSync('src/data/questionLearningLevels.json'));
const sourceSHA=process.env.AUDIT_SOURCE_SHA;
const dir='docs/audits/applied-l3-20261124/';
const write=(name,data)=>writeFileSync(dir+name,JSON.stringify(data,null,2)+'\n');
const ids=Object.keys(registry).filter(id=>registry[id].status==='ASSIGNED'&&registry[id].learningLevel===3);
if(ids.length!==376) throw Error('Expected 376 L3 IDs; inspect changed registry');
const rows=ids.map(id=>{
 const q=m.ALL_QUESTIONS.find(q=>q.id===id); if(!q)throw Error('Missing '+id);
 const d=m.getQuestionDeepDive(q),lesson=m.getLessonForQuestion(id);
 const anchor=lesson&&m.getLessonSectionForQuestion(lesson.id,id);
 const blocks=lesson?{plain:m.getLessonBlocksWithSections(lesson,'plain'),professional:m.getLessonBlocksWithSections(lesson,'professional')}:null;
 const plain=d.plain||d.deepAnalysis,pro=d.pro||d.professional?.deep;
 return {id,correctAnswers:q.correct.map(i=>({index:i,text:q.answers[i]})),wrongOptions:q.answers.flatMap((text,index)=>q.correct.includes(index)?[]:[{index,text,explanationQuality:'UNVERIFIED',evidence:'Читайте полный explanation/plain/pro; автоматическое соответствие отдельному варианту не установлено'}]),glossaryTerms:Object.keys(m.GLOSSARY).filter(term=>JSON.stringify({q,plain,pro}).toLowerCase().includes(term.toLowerCase())),hashtags:{status:'UNVERIFIED',evidence:'Отдельного поля hashtags в Question нет; семантические метки и UI не проверены'},topic:q.topic,group:q.group,status:'UNVERIFIED',question:q,assignment:registry[id],deepDive:d,plain,pro:pro||null,
 lesson:lesson?{id:lesson.id,title:lesson.title,anchor:anchor||null,anchorExistsInBothModes:!!anchor&&Object.values(blocks).every(bs=>bs.some(b=>b.anchorId===anchor)),link:lesson.id+(anchor?'#'+anchor:'')}:null,
 practice:{link:d.practiceLink||null,destination:m.PRACTICE_DESTINATIONS[d.practiceLink]||null,ipv4:d.ipv4Practice||null,ipv6:d.ipv6Practice||null,applicability:'UNVERIFIED'},
 checks:{technicalCorrectness:'UNVERIFIED',levelFit:'UNVERIFIED',individualPlain:d.hasIndividualDeep?'UNVERIFIED':'FIX',independentPro:pro?(pro===plain?'FIX':'UNVERIFIED'):'FIX',wrongOptions:'UNVERIFIED',practicalTip:'UNVERIFIED',commonTrap:'UNVERIFIED',glossary:'UNVERIFIED',hashtags:'UNVERIFIED',lessonRelevance:'UNVERIFIED',exactSection:!lesson||!anchor?'FIX':Object.values(blocks).every(bs=>bs.some(b=>b.anchorId===anchor))?'UNVERIFIED':'FIX',practice:'UNVERIFIED',templates:'UNVERIFIED'},findings:[]};
});
for(const field of ['plain','pro']){const groups=new Map();for(const r of rows){if(!r[field])continue;const key=r[field].replace(/\s+/g,' ').trim();groups.set(key,[...(groups.get(key)||[]),r.id]);}for(const r of rows){const peers=groups.get(r[field]?.replace(/\s+/g,' ').trim())||[];if(peers.length>1){r.findings.push({code:'REPEATED_'+field.toUpperCase(),peers:peers.filter(id=>id!==r.id)});r.checks.templates='REVIEW';}}}
for(const r of rows){for(const [criterion,status]of Object.entries(r.checks))if(status==='FIX')r.findings.push({code:criterion,reason:criterion==='exactSection'?'Нет подтверждённого точного перехода в оба режима урока':criterion==='independentPro'?'Нет отдельного pro либо текст совпадает с plain':'Runtime не подтверждает индивидуальный plain'});r.status=Object.values(r.checks).includes('FIX')?'FIX':r.findings.length?'REVIEW':'UNVERIFIED';}
for(const field of ['practicalTip','commonTrap']){const counts=new Map();for(const r of rows){const t=r.deepDive[field];if(t)counts.set(t,(counts.get(t)||0)+1);}for(const r of rows){const n=counts.get(r.deepDive[field])||0;r[field+'Occurrences']=n;if(n>1){r.findings.push({code:'REPEATED_'+field,count:n,reason:'Сигнал для предметной проверки; повтор сам по себе не доказывает ошибку'});r.checks[field]='REVIEW';if(r.status==='UNVERIFIED')r.status='REVIEW';}}}
// Broad engineering domains; keep service exchanges and their existing PR #254 context first.
const domain=r=>{
 const t=(r.id+' '+r.topic).toLowerCase();
 if (/gen-(transport|port)-|l4|l5_l7|dns|dhcp|http|snmp|ntp|syslog|tls|tcp|udp/.test(t)&&!/^tcpip/.test(r.group)) return 'Сервисные обмены и транспорт';
 if(/wifi|wi-fi|802\.11/.test(t))return 'Физическая среда и Wi-Fi';
 if(/cli|troubleshooting/.test(r.group))return 'Маршрутизация, CLI и диагностика';
 if(/bgp|ospf|eigrp|rpki|route|маршрут|vrrp/.test(t))return 'Маршрутизация, CLI и диагностика';
 if(r.group==='visual-l1'||/^l1[ ·–]/i.test(r.topic))return 'Физическая среда и Wi-Fi';
 if(/l3/.test(r.group))return 'IP-адресация и пересылка';
 if(/l1-l2|l2/.test(r.group))return 'Коммутация, VLAN и защита L2';
 return 'Модели и сквозная доставка';
};
const domains=new Map();for(const r of rows){const key=domain(r);domains.set(key,[...(domains.get(key)||[]),r]);}
const batches=[];
for(const [theme,list] of [...domains].sort(([a],[b])=>a==='Сервисные обмены и транспорт'?-1:b==='Сервисные обмены и транспорт'?1:a.localeCompare(b,'ru'))){
 list.sort((a,b)=>Number(/^gen-(transport|port)-/.test(b.id))-Number(/^gen-(transport|port)-/.test(a.id))||a.topic.localeCompare(b.topic,'ru')||a.id.localeCompare(b.id));
 const count=Math.max(1,Math.round(list.length/30));
 for(let i=0,start=0;i<count;i++){const size=Math.ceil((list.length-start)/(count-i)),slice=list.slice(start,start+size);start+=size;batches.push({id:`L3-${String(batches.length+1).padStart(2,'0')}`,theme,topics:[...new Set(slice.map(r=>r.topic))],ids:slice.map(r=>r.id),reviewers:['Заяц','Геннадий'],state:'PREPARED_NOT_DISPATCHED'});}
}
for(const b of batches)for(const id of b.ids)rows.find(r=>r.id===id).batch=b.id;
const stats={total:rows.length,statuses:Object.fromEntries(['PASS','FIX','REVIEW','UNVERIFIED'].map(s=>[s,rows.filter(r=>r.status===s).length])),missingPro:rows.filter(r=>!r.pro).length,identicalPlainPro:rows.filter(r=>r.pro&&r.pro===r.plain).length,withoutIndividualPlainFlag:rows.filter(r=>!r.deepDive.hasIndividualDeep).length,withoutLesson:rows.filter(r=>!r.lesson).length,withoutExactAnchor:rows.filter(r=>!r.lesson?.anchor).length,brokenAnchor:rows.filter(r=>r.lesson?.anchor&&!r.lesson.anchorExistsInBothModes).length,repeatedPlain:rows.filter(r=>r.findings.some(f=>f.code==='REPEATED_PLAIN')).length,repeatedPro:rows.filter(r=>r.findings.some(f=>f.code==='REPEATED_PRO')).length,repeatedTip:rows.filter(r=>r.practicalTipOccurrences>1).length,repeatedTrap:rows.filter(r=>r.commonTrapOccurrences>1).length,withPractice:rows.filter(r=>r.practice.link||r.practice.ipv4||r.practice.ipv6).length,subjectAuditCompleted:0,batches:batches.map(b=>({id:b.id,count:b.ids.length}))};
write('inventory.json',{sourceSHA,scope:'runtime inventory; not independent subject audit',rows});write('statistics.json',stats);write('batches.json',batches);
const first=rows.filter(r=>batches[0].ids.includes(r.id));const lessons=[...new Set(first.map(r=>r.lesson?.id).filter(Boolean))].map(id=>m.LESSONS.find(l=>l.id===id));
const text=JSON.stringify({first,lessons}).toLowerCase();const glossary=Object.fromEntries(Object.entries(m.GLOSSARY).filter(([term])=>text.includes(term.toLowerCase())));
write('batch-01-source.json',{sourceSHA,batch:batches[0],questions:first,lessons:lessons.map(l=>({...l,resolvedBlocks:{plain:m.getLessonBlocksWithSections(l,'plain'),professional:m.getLessonBlocksWithSections(l,'professional')}})),glossary,practiceDestinations:m.PRACTICE_DESTINATIONS});
writeFileSync(dir+'registry.md','# Поимённый реестр L3\n\nСтатусы предварительные; критерии и доказательства — inventory.json. PASS требует предметного аудита.\n\n| ID | Тема | Партия | Статус | Наблюдения |\n|---|---|---|---|---|\n'+rows.map(r=>`| ${r.id} | ${r.topic.replaceAll('|','/')} | ${r.batch} | ${r.status} | ${r.findings.map(f=>f.code).join(', ')} |`).join('\n')+'\n');
console.log(JSON.stringify(stats,null,2));

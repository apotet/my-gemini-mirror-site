import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';
const { ALL_QUESTIONS,getQuestionDeepDive,getLessonForQuestion }=await bundleEntry('scripts/explanations-test-entry.ts','base-foundations-batch7-live.mjs');
const { BASE_FOUNDATIONS_BATCH7 }=await bundleEntry('src/data/baseFoundationsBatch7.ts','base-foundations-batch7-data.mjs');
const { GLOSSARY }=await bundleEntry('src/data/glossary.ts','base-foundations-batch7-glossary.mjs');
const expected={
  "gen-port-15": [
    "389",
    null,
    "l4-directory-remote-industrial-ports"
  ],
  "gen-port-16": [
    "3389",
    null,
    "l4-directory-remote-industrial-ports"
  ],
  "gen-port-17": [
    "502",
    null,
    "l4-directory-remote-industrial-ports"
  ],
  "photo-gbic-size": [
    "SFP занимает меньше места на передней панели, чем GBIC",
    "gbic-sfp.webp",
    "l1-fiber-hardware"
  ],
  "photo-blue-upc": [
    "UPC на одномодовом шнуре",
    "sm-mm-cords.webp",
    "l1-fiber-hardware"
  ],
  "review-hsr-14": [
    "В двух направлениях кольца",
    null,
    "l2-hsr-redundancy"
  ],
  "review-poe-29": [
    "Коммутатор — PSE, камера — PD",
    null,
    "l1-poe-screen-reading"
  ],
  "l1v2-a-nick-view": [
    "Сделан глубокий надрез металлического стержня",
    "copper-wire-nick.webp",
    "l1-copper-fault-poe"
  ],
  "l1v2-a-pass-view": [
    "Сквозной штекер pass-through 8P8C",
    "copper-pass-through.webp",
    "l1-copper-fault-poe"
  ],
  "l1v2-a-corrosion-view": [
    "Неоднородные потемневшие контактные поверхности",
    "copper-corroded-jack.webp",
    "l1-copper-fault-poe"
  ],
  "l1v2-a-poe-connection": [
    "Через гнездо LAN 8P8C",
    "copper-poe-port.jpg",
    "l1-poe-screen-reading"
  ],
  "l1v2-a-poe-unloaded": [
    "54,6 В без нагрузки",
    "copper-poe-result.png",
    "l1-poe-screen-reading"
  ],
  "l1v2-a-mark-cat6a": [
    "Cat6A",
    "copper-mark-cat6a.webp",
    "l1-copper-fault-poe"
  ],
  "l57-x03": [
    "Постоянный редирект",
    null,
    "l7-http-status-basics"
  ],
  "l57-x17": [
    "Ресурс не найден",
    null,
    "l7-http-status-basics"
  ]
};
const ids=Object.keys(expected);
assert.equal(ids.length,15,'final gap scope exactly 15');
assert.deepEqual(Object.keys(BASE_FOUNDATIONS_BATCH7).sort(),ids.sort(),'no other question overridden');
assert.equal(ALL_QUESTIONS.length,862,'original bank size unchanged');
assert.equal(new Set(ALL_QUESTIONS.map(x=>x.id)).size,862,'no duplicate IDs');
for(const id of ids){
 const [answer,image,lessonId]=expected[id];
 const q=ALL_QUESTIONS.find(x=>x.id===id);
 assert.ok(q,id+' in real bank');
 assert.equal(q.difficulty,'beginner',id+' original difficulty');
 assert.deepEqual(q.correct.map(n=>q.answers[n]),[answer],id+' exact source answer');
 assert.equal(q.image,image?'assets/photos/'+image:undefined,id+' original image unchanged');
 const patch=BASE_FOUNDATIONS_BATCH7[id],d=getQuestionDeepDive(q);
 assert.equal(d.hasIndividualDeep,true,id+' individual active');
 assert.equal(d.briefAnswer,patch.brief,id+' why is individual');
 assert.equal(d.plain,patch.plain,id+' plain resolver');
 assert.equal(d.pro,patch.pro,id+' professional resolver');
 assert.equal(d.deepAnalysis,patch.plain,id+' default plain');
 assert.equal(d.professional?.deep,patch.pro,id+' pro live display');
 assert.equal(d.commonTrap,patch.trap,id+' individual misconception');
 assert.equal(d.practiceLink,undefined,id+' no imaginary practice');
 const auditedTip='В документации коммутатора ищи бюджет PoE на стороне PSE. В паспорте камеры сверяй её требования как PD.';
 assert.equal(d.practicalTip,id==='review-poe-29'?auditedTip:patch.practicalTip,id+' exact practical tip with approved audit precedence');
 assert.equal(patch.plain.split(/\n\s*\n/).length,3,id+' 3-paragraph plain');
 assert.ok(patch.brief.length>55 && patch.plain.length>260 && patch.pro.length>320 && patch.trap.length>50 && patch.practicalTip.length>80,id+' substantive content');
 assert.notEqual(patch.plain,patch.pro,id+' independent pro');
 const l=getLessonForQuestion(id);
 assert.ok(l,id+' linked lesson exists');
 assert.equal(l.id,lessonId,id+' exact topic lesson');
 assert.ok(l.relatedQuestionIds.includes(id),id+' reverse lesson link');
 assert.ok(l.blocks.length>=4,id+' substantial plain blocks');
 if(l.id!=='l1-copper-fault-poe') assert.ok(l.professional?.blocks?.length>=4,id+' required professional blocks');
}
for(const lessonId of ['l4-directory-remote-industrial-ports','l2-hsr-redundancy','l1-poe-screen-reading','l7-http-status-basics']){
 const id=ids.find(x=>expected[x][2]===lessonId),l=getLessonForQuestion(id);
 assert.equal(l.id,lessonId);
 const mainPlain = l.blocks;
 assert.ok(mainPlain.length>=4 && mainPlain.every(x=>x.body.length>200),l.id+' substantial plain');
 const mainPro = l.professional.blocks;
 assert.ok(mainPro.length>=4 && mainPro.every(x=>x.body.length>(l.id==='l1-poe-screen-reading' && x.heading==='Кейс: камера перезагружается при включении ИК' ? 250 : 300)),l.id+' substantial professional; exact PoE case exception');
 for(const term of new Set([...l.terms,...l.professional.terms])){
   assert.ok(GLOSSARY[term]?.description?.length>40 && GLOSSARY[term]?.relatesTo?.length>20,l.id+' glossary '+term);
 }
}
const copper=getLessonForQuestion('l1v2-a-corrosion-view');
assert.equal(copper.id,'l1-copper-fault-poe');
assert.ok(copper.blocks.length>=4 && copper.blocks.every(x=>x.body.length>200),'copper plain substantial; professional not required on accepted lesson');
const gbic=getLessonForQuestion('photo-gbic-size'),upc=getLessonForQuestion('photo-blue-upc');
assert.equal(gbic.id,'l1-fiber-hardware');
assert.equal(upc.id,'l1-fiber-hardware');
assert.ok(gbic.relatedQuestionIds.includes('photo-gbic-sfp') && gbic.relatedQuestionIds.includes('photo-apc'),'legacy optics links preserved');
const hsr=getQuestionDeepDive(ALL_QUESTIONS.find(x=>x.id==='review-hsr-14'));
assert.ok(hsr.pro.includes('в противоположных направлениях') && hsr.pro.includes('duplicate'),'HSR two-direction duplicate distinction');
const poe=getQuestionDeepDive(ALL_QUESTIONS.find(x=>x.id==='l1v2-a-poe-unloaded'));
assert.ok(poe.pro.includes('54.6 V') && poe.pro.includes('13.00 W'),'no-load voltage vs power distinction');
const http=getQuestionDeepDive(ALL_QUESTIONS.find(x=>x.id==='l57-x17'));
assert.ok(http.pro.includes('410 Gone'),'404 not automatically permanent');
const old=getQuestionDeepDive(ALL_QUESTIONS.find(x=>x.id==='l1v2-a-futp'));
assert.ok(old.practicalTip.includes('медной линии'),'batch5 copper fix preserved');
const fusion=getQuestionDeepDive(ALL_QUESTIONS.find(x=>x.id==='l1v2-b-screen-loss-read'));
assert.ok(fusion.practicalTip.includes('0,01 dB'),'batch6 optical practice preserved');
console.log('PASS: final 15 exact beginner keys and original images, 15 authored two-style explanations, 4 new + 1 reused lessons, approved PSE tip, glossary, copper/optics regression, 862 unchanged');

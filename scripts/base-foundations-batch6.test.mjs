import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';
const { ALL_QUESTIONS,getQuestionDeepDive,getLessonForQuestion } = await bundleEntry('scripts/explanations-test-entry.ts','base-foundations-batch6-live.mjs');
const { BASE_FOUNDATIONS_BATCH6 } = await bundleEntry('src/data/baseFoundationsBatch6.ts','base-foundations-batch6-data.mjs');
const { GLOSSARY } = await bundleEntry('src/data/glossary.ts','base-foundations-batch6-glossary.mjs');
const expected = {
  "l1v2-b-coating-tool": [
    "Снять покрытие с волокна",
    "fiber-coating-stripper.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-b-buffer-tool": [
    "Удалять предусмотренный буфер или покрытие",
    "fiber-buffer-stripper.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-b-cleaver-name": [
    "Формирует торец сколом",
    "fiber-cleaver.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-b-screen-before": [
    "Позиционирование концов перед сплавлением",
    "fiber-before-fusion.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-b-screen-loss-read": [
    "0,01 dB",
    "fiber-after-fusion.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-b-protect-next": [
    "Усадить защитную гильзу над стыком",
    "fiber-sleeve-heater.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-b-sleeve-purpose": [
    "Защитить уже выполненный стык механически",
    "fiber-sleeves-tray.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-b-tray-role": [
    "Разместить защиты сварок и запас волокна",
    "fiber-splice-cassette.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-b-kevlar-purpose": [
    "Укорачивать арамидные армирующие нити",
    "fiber-kevlar-shears.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-b-om3-real-label": [
    "OM3",
    "fiber-om3-marking.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-b-simplex-real": [
    "Simplex: одно оптическое окончание",
    "fiber-lc-simplex.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-b-tray-real-retainer": [
    "Подходящие по размеру защиты сварок",
    "fiber-tray-routing-field.webp",
    "l1-fiber-splicing"
  ],
  "l1v2-c-vfl-task": [
    "Для просветки и поиска видимой утечки света",
    "measure-vfl.webp",
    "l1-optical-testing-equipment"
  ],
  "l1v2-c-power-read": [
    "−15,88 dBm",
    "measure-power-reading.webp",
    "l1-optical-testing-equipment"
  ],
  "l1v2-c-inspection-tool": [
    "Осматривают поверхность торца",
    "measure-inspection.webp",
    "l1-optical-testing-equipment"
  ],
  "l1v2-c-trace-units": [
    "В футах (ft)",
    "measure-otdr-traces.webp",
    "l1-optical-testing-equipment"
  ],
  "l1v2-c-closure-purpose": [
    "Стыки и запас волокон внутри соединительной муфты",
    "passive-splice-closure.webp",
    "l1-optical-testing-equipment"
  ],
  "l1v2-c-converter-path": [
    "100BASE-TX и 100BASE-FX",
    "passive-media-converter.webp",
    "l1-optical-testing-equipment"
  ],
  "l1v2-c-poe-marked-ports": [
    "Порты 1–4",
    "power-switch-ports.webp",
    "l1-optical-testing-equipment"
  ],
  "photo-cable-colors": [
    "Свободные волокна без коннекторов; подготовить нужные волокна к сварке с совместимыми LC-пигтейлами",
    "fiber-cable-12.webp",
    "l1-fiber-splicing"
  ]
};
const ids=Object.keys(expected);
assert.equal(ids.length,20,'scope 20 items');
assert.deepEqual(Object.keys(BASE_FOUNDATIONS_BATCH6).sort(),ids.sort(),'exact authored scope');
assert.equal(ALL_QUESTIONS.length,862,'bank unchanged');
assert.equal(new Set(ALL_QUESTIONS.map(x=>x.id)).size,862,'unique IDs');
for(const id of ids){
 const [answer,image,lessonId] = expected[id];
 const question=ALL_QUESTIONS.find(x=>x.id===id);
 assert.ok(question,id+' source exists');
 assert.equal(question.group,'visual-l1',id+' original group');
 assert.equal(question.difficulty,'beginner',id+' original difficulty');
 assert.deepEqual(question.correct.map(i=>question.answers[i]),[answer],id+' exact source answer');
 assert.equal(question.image,'assets/photos/'+image,id+' exact original photo');
 assert.ok(question.explanation.length>65,id+' original why kept');
 const patch=BASE_FOUNDATIONS_BATCH6[id],d=getQuestionDeepDive(question);
 assert.equal(d.hasIndividualDeep,true,id+' individual content activated');
 assert.equal(d.briefAnswer,patch.brief,id+' authored why');
 assert.equal(d.plain,patch.plain,id+' authored plain');
 assert.equal(d.pro,patch.pro,id+' authored pro');
 assert.equal(d.deepAnalysis,patch.plain,id+' plain is actual default');
 assert.equal(d.professional?.deep,patch.pro,id+' pro resolver');
 assert.equal(d.commonTrap,patch.trap,id+' authored trap');
 assert.equal(d.practicalTip,patch.practicalTip,id+' exact practice guidance, no wrong fallback');
 assert.equal(d.practiceLink,undefined,id+' no imaginary practice link');
 assert.equal(patch.plain.split(/\n\s*\n/).length,3,id+' three paragraphs');
 assert.ok(patch.brief.length>55&&patch.plain.length>260&&patch.pro.length>300&&patch.trap.length>45&&patch.practicalTip.length>90,id+' substantive levels');
 assert.notEqual(patch.plain,patch.pro,id+' no copy as pro');
 const lesson=getLessonForQuestion(id);
 assert.ok(lesson,id+' lesson exists');
 assert.equal(lesson.id,lessonId,id+' exact linked lesson');
 assert.ok(lesson.relatedQuestionIds.includes(id),id+' reverse link');
 assert.ok(lesson.blocks.length>=5&&lesson.professional?.blocks?.length>=5,id+' both lesson styles available');
}
const lessons=['l1-fiber-splicing','l1-optical-testing-equipment'].map(id=>getLessonForQuestion(ids.find(q=>expected[q][2]===id)));
assert.deepEqual(lessons.map(x=>x.id),['l1-fiber-splicing','l1-optical-testing-equipment']);
for(const l of lessons){
 assert.ok(l.blocks.every(x=>x.body.length>250),l.id+' substantive plain blocks');
 assert.ok(l.professional.blocks.every(x=>x.body.length>300),l.id+' substantive engineering blocks');
 for(const term of new Set([...l.terms,...l.professional.terms])){
   assert.ok(GLOSSARY[term]?.description?.length>40&&GLOSSARY[term]?.relatesTo?.length>20,'glossary '+term+' in '+l.id);
 }
}
const fusion=getQuestionDeepDive(ALL_QUESTIONS.find(x=>x.id==='l1v2-b-screen-loss-read'));
assert.ok(fusion.pro.includes('estimated splice loss') && fusion.pro.includes('dBm'),'screen estimate not confused with measurement');
assert.ok(getQuestionDeepDive(ALL_QUESTIONS.find(x=>x.id==='l1v2-c-trace-units')).pro.includes('200000 ft'),'OTDR ft explicitly accounted for');
assert.ok(getQuestionDeepDive(ALL_QUESTIONS.find(x=>x.id==='l1v2-c-poe-marked-ports')).practicalTip.includes('PoE'),'PoE no optical fallback');
assert.ok(getQuestionDeepDive(ALL_QUESTIONS.find(x=>x.id==='l1v2-c-converter-path')).practicalTip.includes('100BASE-TX'),'converter no optical fallback');
const oldCopper=getQuestionDeepDive(ALL_QUESTIONS.find(x=>x.id==='l1v2-a-futp'));
assert.ok(oldCopper.practicalTip.includes('медной линии'),'batch5 copper practice unaffected');
console.log('PASS: batch6 20 original photo keys/images, 20 individual why/plain/pro/trap/practicalTips, 2 lessons, glossary, unchanged previous copper logic');

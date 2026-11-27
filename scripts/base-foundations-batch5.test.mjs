import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';
const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion } = await bundleEntry('scripts/explanations-test-entry.ts','base-foundations-batch5-live.mjs');
const { BASE_FOUNDATIONS_BATCH5 } = await bundleEntry('src/data/baseFoundationsBatch5.ts','base-foundations-batch5-data.mjs');
const { GLOSSARY } = await bundleEntry('src/data/glossary.ts','base-foundations-batch5-glossary.mjs');
const expected = {
  "l1v2-a-8p8c": [
    "8P8C, обычно называемый RJ-45",
    "copper-cat5e.webp",
    "l1-copper-installation"
  ],
  "l1v2-a-uutp": [
    "U/UTP",
    "copper-utp-section.webp",
    "l1-copper-cable"
  ],
  "l1v2-a-stranded": [
    "Пучки тонких проволок под общей изоляцией",
    "copper-utp-section.webp",
    "l1-copper-cable"
  ],
  "l1v2-a-futp": [
    "F/UTP",
    "copper-screen-section.webp",
    "l1-copper-cable"
  ],
  "l1v2-a-pair-foil": [
    "Фольга вокруг отдельных пар",
    "copper-sftp.webp",
    "l1-copper-cable"
  ],
  "l1v2-a-keystone": [
    "Модуль формата Keystone",
    "copper-keystone.webp",
    "l1-copper-installation"
  ],
  "l1v2-a-panel-passive": [
    "Оконцевать линии и соединять их патч-кордами",
    "copper-keystone-panel.webp",
    "l1-copper-installation"
  ],
  "l1v2-a-wall-port": [
    "Среднее прямоугольное гнездо",
    "copper-wall-plate.webp",
    "l1-copper-installation"
  ],
  "l1v2-a-stripper": [
    "Снимать внешнюю оболочку кабеля",
    "copper-stripper.webp",
    "l1-copper-installation"
  ],
  "l1v2-a-cutters": [
    "Бокорезы",
    "copper-cutters.webp",
    "l1-copper-installation"
  ],
  "l1v2-a-punchdown": [
    "Заделывать изолированные жилы в IDC",
    "copper-punchdown.webp",
    "l1-copper-installation"
  ],
  "l1v2-a-crimper": [
    "Обжимать контактные ножи модульного штекера",
    "copper-crimper.webp",
    "l1-copper-installation"
  ],
  "l1v2-a-label-category": [
    "Category 7A",
    "copper-jacket-marking.webp",
    "l1-copper-cable"
  ],
  "l1v2-a-label-lshf": [
    "Малое дымовыделение и отсутствие галогенов",
    "copper-jacket-marking.webp",
    "l1-copper-cable"
  ],
  "l1v2-a-label-four-pairs": [
    "Четыре пары, восемь проводников",
    "copper-jacket-marking.webp",
    "l1-copper-cable"
  ],
  "l1v2-a-tone": [
    "Тональный генератор и поисковый щуп",
    "copper-tone.webp",
    "l1-copper-installation"
  ],
  "l1v2-a-mark-cat5e": [
    "5e",
    "copper-mark-cat5e.webp",
    "l1-copper-cable"
  ],
  "l1v2-a-mark-cat6": [
    "Cat6",
    "copper-mark-cat6.webp",
    "l1-copper-cable"
  ],
  "l1v2-a-solid-view": [
    "Один сплошной проводник в каждой жиле",
    "copper-wire-solid.webp",
    "l1-copper-cable"
  ]
};
const ids=Object.keys(expected);
assert.equal(ids.length,19,'exact remaining scope');
assert.deepEqual(Object.keys(BASE_FOUNDATIONS_BATCH5).sort(),ids.sort(),'19 remaining authored keys only');
assert.equal(ALL_QUESTIONS.length,860,'860 active questions after two approved retirements');
assert.equal(new Set(ALL_QUESTIONS.map(q=>q.id)).size,860,'no ID collision');
for(const id of ids){
 const [correct,image,lessonId]=expected[id];
 const q=ALL_QUESTIONS.find(q=>q.id===id);
 assert.ok(q,id+' source question exists');
 assert.equal(q.group,'visual-l1',id+' photo group unchanged');
 assert.equal(q.difficulty,'beginner',id+' difficulty unchanged');
 assert.deepEqual(q.correct.map(n=>q.answers[n]),[correct],id+' exact original key');
 assert.equal(q.image,'assets/photos/'+image,id+' pinned photo path unchanged');
 assert.ok(q.text.length>20&&q.explanation.length>40,id+' existing source question intact');
 const patch=BASE_FOUNDATIONS_BATCH5[id],dive=getQuestionDeepDive(q);
 assert.ok(patch,id+' new authored patch');
 assert.equal(dive.briefAnswer,patch.brief,id+' actual why is authored');
 assert.equal(dive.plain,patch.plain,id+' actual plain');
 assert.equal(dive.pro,patch.pro,id+' actual pro');
 assert.equal(dive.deepAnalysis,patch.plain,id+' simple analysis default');
 assert.equal(dive.professional?.deep,patch.pro,id+' professional resolver');
 assert.equal(dive.commonTrap,patch.trap,id+' authored misconception');
 assert.equal(dive.hasIndividualDeep,true,id+' author coverage');
 assert.equal(dive.practiceLink,undefined,id+' no fictional lab');
 assert.ok(dive.practicalTip?.includes('медной линии') && dive.practicalTip?.includes('wiremap'),id+' copper-specific practical guidance');
 assert.ok(!/волокн|оптик|очистк.*торц|измерение потерь/i.test(dive.practicalTip),id+' no optical fallback on copper question');
 assert.equal(patch.plain.split(/\n\s*\n/).length,3,id+' three readable paragraphs');
 assert.ok(patch.brief.length>50&&patch.plain.length>240&&patch.pro.length>280&&patch.trap.length>35,id+' substantive content');
 assert.notEqual(patch.pro,patch.plain,id+' independent professional layer');
 const lesson=getLessonForQuestion(id);
 assert.ok(lesson,id+' exact lesson exists');
 assert.equal(lesson.id,lessonId,id+' chooses expected specific lesson');
 assert.ok(lesson.relatedQuestionIds.includes(id),id+' reverse lesson→question');
 assert.ok(lesson.professional?.blocks.length>=4&&lesson.blocks.length>=5,id+' two complete lesson styles');
}
const lessons=['l1-copper-cable','l1-copper-installation'].map(id=>getLessonForQuestion(ids.find(x=>expected[x][2]===id)));
assert.deepEqual(lessons.map(l=>l.id),['l1-copper-cable','l1-copper-installation']);
for(const lesson of lessons){
 assert.ok(lesson.blocks.every(b=>b.body.length>180),'substantive plain lesson blocks '+lesson.id);
 assert.ok(lesson.professional.blocks.every(b=>b.body.length>250),'substantive pro lesson blocks '+lesson.id);
 for(const term of new Set([...lesson.terms,...lesson.professional.terms])){
   assert.ok(GLOSSARY[term]?.description?.length>40&&GLOSSARY[term]?.relatesTo?.length>20,'missing glossary '+term);
 }
}
console.log('PASS: 19 original beginner photo keys, 19 exact source images, 19 individual why/plain/pro/trap; two complete lessons and glossary; one photo question retired separately');

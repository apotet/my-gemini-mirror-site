import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';
const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion } = await bundleEntry('scripts/explanations-test-entry.ts','base-foundations-batch4-live.mjs');
const { BASE_FOUNDATIONS_BATCH4 } = await bundleEntry('src/data/baseFoundationsBatch4.ts','base-foundations-batch4-data.mjs');
const { GLOSSARY } = await bundleEntry('src/data/glossary.ts','base-foundations-batch4-glossary.mjs');
const expectedKeys = {
  "photo-lc": "Duplex LC",
  "photo-sc": "SC",
  "photo-st": "ST",
  "photo-fc": "FC",
  "photo-lc-sc-order": "Слева LC, справа SC",
  "photo-sfp": "SFP",
  "photo-gbic-sfp": "Слева GBIC со снятым корпусом, справа SFP",
  "photo-sm-mm-colors": "Левый — одномодовый; правый — многомодовый",
  "photo-patchcord": "Два парных оконцевания SC, по два коннектора слева и справа",
  "photo-apc": "Угловую полировку APC",
  "photo-otdr": "Расстояние вдоль волокна",
  "photo-cable": "Оптический кабель с несколькими цветными волокнами",
  "photo-panel": "Оптическая кроссовая панель (кросс)",
  "photo-lc-latch": "Пластиковой защёлкой с рычажком, как у RJ-45",
  "photo-sc-push": "Вдвигается прямо в гнездо до щелчка (push-pull)",
  "photo-sc-color": "Многомодовый шнур (OM1/OM2 по традиционной окраске)",
  "photo-st-bayonet": "Поворотом байонетного кольца на четверть оборота",
  "photo-st-usage": "В старых многомодовых и специализированных установках",
  "photo-lcsc-size": "LC, показанные слева",
  "photo-sfp-contacts": "Справа: контактные площадки на краю открытой платы"
};
const ids = Object.keys(expectedKeys);
assert.equal(ids.length,20,'exact agreed scope of 20 photo questions');
assert.deepEqual(Object.keys(BASE_FOUNDATIONS_BATCH4).sort(),ids.sort(),'no hidden extra materials');
assert.equal(ALL_QUESTIONS.length,861,'bank count unchanged');
assert.equal(new Set(ALL_QUESTIONS.map(q=>q.id)).size,861,'unique source question ids');
for(const id of ids){
  const question=ALL_QUESTIONS.find(q=>q.id===id);
  assert.ok(question,id+' exists in live bank');
  assert.equal(question.difficulty,'beginner',id+' unchanged legacy difficulty');
  assert.equal(question.group,'visual-l1',id+' original photo group');
  assert.deepEqual(question.correct.map(i=>question.answers[i]),[expectedKeys[id]],id+' exact answer text and key');
  assert.ok(typeof question.image==='string' && question.image.startsWith('assets/photos/') && question.image.endsWith('.webp'),id+' published photo reference retained');
  const patch=BASE_FOUNDATIONS_BATCH4[id];
  const dive=getQuestionDeepDive(question);
  assert.equal(dive.hasIndividualDeep,true,id+' individual content activated');
  assert.equal(dive.briefAnswer,patch.brief,id+' authored why');
  assert.equal(dive.deepAnalysis,patch.plain,id+' authored simple explanation');
  assert.equal(dive.plain,patch.plain,id+' plain selected');
  assert.equal(dive.pro,patch.pro,id+' technical selected');
  assert.equal(dive.professional?.deep,patch.pro,id+' technical engine resolver');
  assert.equal(dive.commonTrap,patch.trap,id+' individual error trap');
  assert.equal(dive.practiceLink,undefined,id+' no invented lab');
  assert.equal(patch.plain.split(/\n\s*\n/).length,3,id+' three distinct paragraphs');
  assert.ok(patch.brief.length>40 && patch.plain.length>250 && patch.pro.length>220 && patch.trap.length>35,id+' content completeness');
  assert.notEqual(patch.plain,patch.pro,id+' no recycled professional text');
  const lesson=getLessonForQuestion(id);
  assert.ok(lesson,id+' lesson exists');
  assert.equal(lesson.id,'l1-fiber-hardware',id+' exact optics hardware lesson');
  assert.ok(lesson.relatedQuestionIds.includes(id),id+' reverse link');
  assert.ok(lesson.blocks.length>=5 && lesson.professional?.blocks?.length>=4,id+' two substantial styles');
}
const lesson=getLessonForQuestion('photo-lc');
assert.ok(lesson);
for (const term of new Set([...lesson.terms,...lesson.professional.terms])){
  assert.ok(GLOSSARY[term]?.description?.length>25 && GLOSSARY[term]?.relatesTo?.length>15,'glossary for term '+term);
}
assert.ok(lesson.blocks.every(b=>b.body.length>180) && lesson.professional.blocks.every(b=>b.body.length>240),'real authored lesson blocks');
console.log('PASS: 20 untouched beginner photo keys and original images, 20 authored plain/pro, one exact two-style lesson, glossary and no fictional practice');

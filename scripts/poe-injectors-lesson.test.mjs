import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';

const { getLesson, getLessonForQuestion }=await bundleEntry('scripts/in-depth-entry.ts','poe-injectors-lesson-check.mjs');
const lesson=getLesson('l1-poe-injectors-splitters');
assert.ok(lesson,'PoE injector-splitter lesson registered');
assert.ok(lesson.professional?.blocks?.length>=8,'Enough professional blocks');
assert.ok(lesson.blocks.length>=5,'Enough beginner blocks');
assert.deepEqual(lesson.relatedQuestionIds,['l1v2-c-injector-direction']);
assert.equal(getLessonForQuestion('l1v2-c-injector-direction')?.id,lesson.id);

const expected={plain:['B','A','C'],pro:['B','C','D','A','C']};
for(const [kind,group] of [['plain',lesson.plainKnowledgeCheck],['pro',lesson.knowledgeCheck]]){
  assert.equal(group.questions.length,expected[kind].length,`${kind}: question count unchanged`);
  const ids=group.questions.map(q=>q.id);
  assert.equal(new Set(ids).size,ids.length,`${kind}: unique question IDs`);
  assert.deepEqual(group.questions.map(q=>q.correctChoiceId),expected[kind],`${kind}: answer keys unchanged`);
  for(const q of group.questions){
    assert.equal(q.choices.length,4,`${q.id}: four options`);
    assert.ok(q.choices.some(c=>c.id===q.correctChoiceId),q.id);
    assert.ok(q.explanation.trim().length>35,q.id);
    assert.ok(q.prompt.trim().length>25,q.id);
  }
}
const allPlain=lesson.blocks.map(b=>b.body).join(' ');
const allPro=lesson.professional.blocks.map(b=>b.body).join(' ');
for(const term of ['Data IN','Data + Power OUT','сплиттер','пассив','12 В','18 Вт','RJ-45'])
  assert.ok(allPlain.includes(term),`Plain must teach ${term}`);
for(const term of ['Alternative A','Alternative B','802.3at','DC/DC','Midspan','show power inline','пусков'])
  assert.ok(allPro.includes(term),`Pro must teach ${term}`);
const linked=[...lesson.blocks,...lesson.professional.blocks].map(b=>b.relatedLesson?.id).filter(Boolean);
for(const id of ['l1-poe-budget','l1-poe-screen-reading','cli-poe-diagnostics']){
  assert.ok(linked.includes(id),`missing lesson link ${id}`);
  assert.ok(getLesson(id),`broken lesson link ${id}`);
}
const images=[...lesson.blocks,...lesson.professional.blocks].map(b=>b.cheatsheet?.file).filter(Boolean);
for(const file of new Set(images)){
  const p='public/lesson-images/'+file;
  assert.ok(existsSync(p),`Missing actual schematic: ${p}`);
  const svg=readFileSync(p,'utf8');
  assert.ok(svg.startsWith('<svg'),p);
  assert.match(svg,/<title[^>]*>[^<]+<\/title>/,`${p}: accessible title`);
  assert.match(svg,/<desc[^>]*>[^<]+<\/desc>/,`${p}: accessible description`);
  assert.doesNotMatch(svg,/<script|foreignObject|http:\/\/|href=/i,`${p}: no scripts/external loads`);
}
assert.ok(images.includes('poe-injector-splitter-chains.svg'));
assert.ok(images.includes('poe-ieee-vs-passive-compare.svg'));
assert.match(allPlain,/не (?:подключай|подавай)|НЕ подключай/i,'Passive safety notice');
assert.match(allPro,/18 Вт/,'Professional DC calculation');
console.log('PASS: PoE accessory two-mode teaching, 3+5 question keys, link destinations, SVG assets and passive safety');

import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {bundleEntry} from './load-bank.mjs';
const m=await bundleEntry('scripts/lesson-section-links-entry.ts','tcpip-visual.mjs');
const lesson=m.getLesson('tcpip-model');
const authored=readFileSync('src/data/lessons/tcpip-model.ts','utf8');
const original=execFileSync('git',['show','origin/main:src/data/lessons/tcpip-model.ts'],{encoding:'utf8'});
const parse=s=>JSON.parse(s.slice(s.indexOf('{',s.indexOf('= ')),s.lastIndexOf('}')+1));
assert.deepEqual(parse(authored).professional,parse(original).professional,'professional mode is unchanged');
assert.deepEqual(parse(authored).relatedQuestionIds,parse(original).relatedQuestionIds,'authored question IDs preserved');
assert.equal(lesson.plainKnowledgeCheck.questions.length,7);
for(const q of lesson.plainKnowledgeCheck.questions){assert(q.choices.some(c=>c.id===q.correctChoiceId));assert(q.explanation.length>60)}
for(const b of lesson.blocks){
 for(const v of [b.visual,b.cheatsheet].filter(Boolean)){
  assert(existsSync(`public/lesson-images/${v.file}`));
  const svg=readFileSync(`public/lesson-images/${v.file}`,'utf8');
  assert(!/<(?:script|animate|foreignObject)\b/.test(svg));
  assert(svg.includes('<title'));assert(svg.includes('viewBox="0 0 320 '));
 }
}
const routes=m.ALL_QUESTIONS.map(q=>({id:q.id,lesson:m.getLessonForQuestion(q.id)?.id,anchor:m.getLessonSectionForQuestion('tcpip-model',q.id)??null})).filter(q=>q.lesson==='tcpip-model');
assert(routes.some(q=>q.id==='tcp-06'&&q.anchor==='tcpip-end-to-end-fields'));
assert.equal(m.getLessonForQuestion('tcpip-x15').id,'tcpip-encapsulation');
for(const r of routes.filter(r=>r.anchor))for(const mode of ['plain','professional'])assert.equal(m.getLessonBlocksWithSections(lesson,mode).filter(b=>b.anchorId===r.anchor).length,1,r.id+'/'+mode);
for(const mode of ['plain','professional'])assert.equal(m.getLessonBlocksWithSections(lesson,mode).filter(b=>b.anchorId==='tcpip-end-to-end-fields').length,1);
mkdirSync('artifacts/tcpip-556',{recursive:true});
writeFileSync('artifacts/tcpip-556/routes.json',JSON.stringify(routes,null,2)+'\n');
console.log('PASS: professional content, related IDs, real routes, exact anchors in both modes, seven checks, static SVG assets');
writeFileSync('artifacts/tcpip-556/sections.json',JSON.stringify(m.getLessonBlocksWithSections(lesson,'plain').map((b,i)=>({index:i+1,heading:b.heading,anchor:b.anchorId??null})),null,2)+'\n');
console.table(routes);

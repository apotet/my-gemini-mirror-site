import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdirSync,writeFileSync,mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {bundleEntry} from './load-bank.mjs';
const m=await bundleEntry('scripts/lesson-section-links-entry.ts','tcpip-visual.mjs');
const lesson=m.getLesson('tcpip-model');
const authored=readFileSync('src/data/lessons/tcpip-model.ts','utf8');
const baseRef=process.env.TCPIP_BASE_REF || 'origin/main';
const original=execFileSync('git',['show',`${baseRef}:src/data/lessons/tcpip-model.ts`],{encoding:'utf8'});
const parse=s=>JSON.parse(s.slice(s.indexOf('{',s.indexOf('= ')),s.lastIndexOf('}')+1));
const before=parse(original), after=parse(authored);
assert.deepEqual(after.professional,before.professional,'professional mode is unchanged');
assert.deepEqual(after.relatedQuestionIds,before.relatedQuestionIds,'authored question IDs preserved');
assert.deepEqual(after.plainKnowledgeCheck,before.plainKnowledgeCheck,'self-check keys and wording unchanged');
assert.deepEqual(after.blocks.map(b=>b.heading),before.blocks.map(b=>b.heading),'all section headings stay stable');
const lab = l => l.blocks.find(b => b.heading.startsWith('Wireshark:'));
assert.deepEqual(lab(after),lab(before),'Wireshark exercise unchanged');
assert.equal(lesson.plainKnowledgeCheck.questions.length,7);
for(const q of lesson.plainKnowledgeCheck.questions){assert(q.choices.some(c=>c.id===q.correctChoiceId));assert(q.explanation.length>60)}
const art = after.blocks.flatMap(b=>[b.visual,b.cheatsheet].filter(Boolean));
assert.equal(art.length,13);
const assetNames = new Set();
for(const v of art){
 const counterpart=before.blocks.flatMap(b=>[b.visual,b.cheatsheet].filter(Boolean)).find(old=>old.file===v.file);
 assert(counterpart);
 assert.equal(v.alt,counterpart.alt);
 assert.deepEqual(v.textEquivalent.slice(0,counterpart.textEquivalent.length).map(text=>text.replace(/уровень [1-4]\. /,'')
  .replace(/^([^:]+): ([А-ЯЁ])/u,(_,a,b)=>a+': '+b.toLowerCase())),
 counterpart.textEquivalent.map(text=>text.replace(/^([^:]+): ([А-ЯЁ])/u,(_,a,b)=>a+': '+b.toLowerCase())));
 const additional=v.textEquivalent.slice(counterpart.textEquivalent.length);
 assert.deepEqual(additional,v.file==='tcpip-layers.svg'?['Отправка: 4 → 3 → 2 → 1. Приём: 1 → 2 → 3 → 4.']:[]);
 for(const [file,width] of [[v.file,320],[v.file.replace(/\.svg$/,'-wide.svg'),640]]){
  assert(existsSync(`public/lesson-images/${file}`));
  const svg=readFileSync(`public/lesson-images/${file}`,'utf8');
  assert(!/<(?:script|animate|foreignObject)\b/.test(svg));
  assert(svg.includes('<title'));assert(svg.includes(`viewBox="0 0 ${width} `));
  for(const found of svg.matchAll(/font-size="(\d+)"/g))assert(+found[1]>=16,file);
  assetNames.add(file);
 }
}
const renderScratch=mkdtempSync(join(tmpdir(),'netops-tcpip-art-'));
try {
 const output=join(renderScratch,'public','lesson-images');
 mkdirSync(output,{recursive:true});
 execFileSync('python3',[resolve('scripts/lesson-art/tcpip.py')],{cwd:renderScratch});
 assert.deepEqual(new Set(readdirSync(output)),assetNames,'only the 26 supplied art variants are generated');
 for(const file of assetNames)assert.deepEqual(readFileSync(join(output,file)),readFileSync(`public/lesson-images/${file}`),file);
} finally { rmSync(renderScratch,{recursive:true,force:true}); }
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

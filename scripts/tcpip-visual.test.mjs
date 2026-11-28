import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdirSync,writeFileSync,mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {bundleEntry} from './load-bank.mjs';
const m=await bundleEntry('scripts/lesson-section-links-entry.ts','tcpip-visual.mjs');
const lesson=m.getLesson('tcpip-model');
const authored=readFileSync('src/data/lessons/tcpip-model.ts','utf8');
// Compare against the exact pre-rewrite lesson, not a moving post-merge origin/main.
const baseRef=process.env.TCPIP_BASE_REF || '16541b24c5ca4d2d2762db71e11634a774ed8577';
// Gitless archive checks can supply the same immutable source as an external file.
const original=process.env.TCPIP_BASE_SOURCE
 ? readFileSync(process.env.TCPIP_BASE_SOURCE,'utf8')
 : execFileSync('git',['show',`${baseRef}:src/data/lessons/tcpip-model.ts`],{encoding:'utf8'});
const parse=s=>JSON.parse(s.slice(s.indexOf('{',s.indexOf('= ')),s.lastIndexOf('}')+1));
const before=parse(original), after=parse(authored);
for (const key of ['id','title','category','osiLayers','difficulty','relatedQuestionIds']) assert.deepEqual(after[key],before[key],key);
const plain=m.getLessonBlocksWithSections(lesson,'plain');
const professional=m.getLessonBlocksWithSections(lesson,'professional');
assert.ok(!plain.some(b=>b.cheatsheet || b.heading.startsWith('Wireshark:')),
 'the plain learning path does not render the field references or Packet Details mock');
assert.deepEqual(professional.flatMap(b=>b.cheatsheet?[b.cheatsheet.file]:[]),
 ['tcpip-tcp.svg','tcpip-udp.svg','tcpip-ipv4.svg','tcpip-ethernet.svg']);
const mock=professional.filter(b=>b.heading==='Wireshark: как увидеть вложения');
assert.equal(mock.length,1,'keep the Packet Details exercise in professional mode only');
assert.match(mock[0].body,/учебный макет Packet Details, а не скриншот или файл захвата/);
assert.match(mock[0].body,/до маршрутизатора/);
assert.ok([...plain,...professional].every(b=>!b.body.includes('CAP_NET_RAW')),'no capability setup in learner-facing prose');

const oldChecks=new Map(before.plainKnowledgeCheck.questions.map(q=>[q.id,q]));
const plainIds=['roles','osi','pack','gateway','unpack'].map(id=>'tcpip-visual-'+id);
assert.deepEqual(lesson.plainKnowledgeCheck.questions.map(q=>q.id),plainIds);
for(const q of lesson.plainKnowledgeCheck.questions)assert.deepEqual(q,oldChecks.get(q.id),
 'original correct choice, distractors and explanation of '+q.id);
const professionalQuestions=lesson.knowledgeCheck.questions;
assert.deepEqual(professionalQuestions.map(q=>q.id),['hop','loss','packet-details'].map(id=>'tcpip-visual-'+id));
for(const q of professionalQuestions){
 assert.ok(q.choices.some(c=>c.id===q.correctChoiceId));
 assert.ok(q.explanation.length>60);
 if(q.id==='tcpip-visual-hop'){
  const { explanation: oldExplanation, ...oldChoices }=oldChecks.get(q.id);
  const { explanation, ...choices }=q;
  assert.deepEqual(choices,oldChoices,'the moved question retains its exact prompt, choices and key');
  assert.match(explanation,/IP и TCP-порты не меняются/);
  assert.match(explanation,/TTL уменьшается, сумма IPv4-заголовка обновляется/);
  assert.match(explanation,/новые MAC и заново вычисляется FCS/);
 }else if(oldChecks.has(q.id)){
  assert.deepEqual(q,oldChecks.get(q.id),'move the existing question without changing its key or content');
 }
}
const packetDetails=professionalQuestions.find(q=>q.id==='tcpip-visual-packet-details');
assert.equal(packetDetails.choices.find(c=>c.id===packetDetails.correctChoiceId).label,'EtherType 0x0800 и IPv4 Protocol = 6');

const collectArt=l=>[...l.blocks,...l.professional.blocks].flatMap(b=>[b.visual,b.cheatsheet].filter(Boolean));
const oldArt=new Map(collectArt(before).map(v=>[v.file,v]));
const art=collectArt(after);
assert.equal(art.length,13);
assert.deepEqual(new Set(art.map(v=>v.file)),new Set(oldArt.keys()),'the same set of art is still used across both modes');
const assetNames=new Set();
const direction='Отправка: 4 → 3 → 2 → 1. Приём: 1 → 2 → 3 → 4.';
for(const v of art){
 const counterpart=oldArt.get(v.file);
 assert.ok(counterpart);
 assert.equal(v.alt,counterpart.alt);
 assert.ok(v.alt.trim()&&v.textEquivalent.length&&v.textEquivalent.every(line=>line.trim()));
 if(v.file==='tcpip-route.svg'){
  // The expanded equivalent distinguishes both links and the routed IPv4 changes.
  const semantic=v.textEquivalent.join(' ');
  for (const invariant of [/MAC входного интерфейса/,/выходного MAC (?:шлюза )?к MAC непосредственно подключённого сервера/,/TTL 64/,/TTL 63/,
    /192\.0\.2\.10 → 198\.51\.100\.20/,/51514 → 80/,/Контрольная сумма заголовка IPv4 обновляется/]) assert.match(semantic,invariant);
 }else{
  assert.deepEqual(v.textEquivalent,counterpart.textEquivalent,`text equivalent retained for ${v.file}`);
 }
 assert.equal(v.textEquivalent.filter(line=>line===direction).length,v.file==='tcpip-layers.svg'?1:0);
 for(const [file,width] of [[v.file,320],[v.file.replace(/\.svg$/,'-wide.svg'),640]]){
  assert(existsSync(`public/lesson-images/${file}`));
  const svg=readFileSync(`public/lesson-images/${file}`,'utf8');
  assert(!/<(?:script|animate|foreignObject)\b|@import|url\(/i.test(svg));
  assert.match(svg,/<svg[^>]*role="img" aria-labelledby="t"><title id="t">[^<]+<\/title>/);
  assert(svg.includes(`viewBox="0 0 ${width} `));
  assert.match(svg,/<style>:root\{--tcpip-ink:.*@media \(prefers-color-scheme: dark\)/);
  assert(!/<\/style><rect\b/.test(svg),'no opaque second canvas behind the drawing');
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
assert.equal(routes.length,16,'all existing canonical question routes retained');
assert(routes.some(q=>q.id==='tcp-06'&&q.anchor==='tcpip-end-to-end-fields'));
assert.equal(m.getLessonForQuestion('tcpip-x15').id,'tcpip-encapsulation');
for(const r of routes.filter(r=>r.anchor))for(const mode of ['plain','professional'])assert.equal(m.getLessonBlocksWithSections(lesson,mode).filter(b=>b.anchorId===r.anchor).length,1,r.id+'/'+mode);
for(const mode of ['plain','professional'])assert.equal(m.getLessonBlocksWithSections(lesson,mode).filter(b=>b.anchorId==='tcpip-end-to-end-fields').length,1);
const out=process.env.TCPIP_TEST_ARTIFACTS || 'artifacts/tcpip-556';
mkdirSync(out,{recursive:true});
writeFileSync(join(out,'routes.json'),JSON.stringify(routes,null,2)+'\n');
console.log('PASS: plain/pro scope, unchanged related IDs and five plain checks, professional mock and field sheets, 16 canonical routes, exact anchors in both modes and 26 generated SVG variants');
writeFileSync(join(out,'sections.json'),JSON.stringify(m.getLessonBlocksWithSections(lesson,'plain').map((b,i)=>({index:i+1,heading:b.heading,anchor:b.anchorId??null})),null,2)+'\n');
console.table(routes);

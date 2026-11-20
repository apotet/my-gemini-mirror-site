import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {bundleEntry} from './load-bank.mjs';
const m=await bundleEntry('scripts/in-depth-entry.ts','in-depth-six-generic-bundle.mjs');
const ids=['l3-16','new-ts-photo-panel','review-dot1x-20','review-ospf-27','l7-new-04','l3-d07'];
assert.equal(m.getTestingPool('mixed','in-depth').length,164);
const pool=m.getTestingPool('mixed','in-depth');
const results=ids.map(id=>{
 const q=pool.find(row=>row.id===id);assert.ok(q,id+': must exist');
 const d=m.getQuestionDeepDive(q);const lesson=m.getLessonForQuestion(id);
 const anchor=lesson?m.getLessonSectionForQuestion(lesson.id,id):null;
 const sections={};
 for(const mode of ['plain','professional']){
 const blocks=lesson?m.getLessonBlocksWithSections(lesson,mode):[];
 const match=blocks.filter(block=>block.anchorId===anchor);
 sections[mode]=match.map(x=>({heading:x.heading,body:x.body}));
 }
 const row={id,question:{text:q.text,answers:q.answers,correct:q.correct,explanation:q.explanation},
   deep:{brief:d.briefAnswer,plain:d.deepAnalysis,pro:d.professional?.deep??null,tip:d.practicalTip,trap:d.commonTrap,practiceLink:d.practiceLink??null},
   lesson:{id:lesson?.id??null,title:lesson?.title??null,anchor,sections}};
 row.auditHash=createHash('sha256').update(JSON.stringify(row)).digest('hex');
 console.log('GENERIC6_JSON '+JSON.stringify(row));
 return row;
});
mkdirSync('scripts/.cache/in-depth',{recursive:true});
writeFileSync('scripts/.cache/in-depth/six-generic-source.json',JSON.stringify({source:'current runtime resolver, unreviewed semantics',results},null,2)+'\n');
// Repeatable source assertions; manual engineering semantics reviewed separately.
const expected={
 'l3-16':{correct:[0],lesson:'l3-route-selection',anchor:'in-depth-connected-vs-default-only',tip:/ip route get.*default gateway.*ARP/i},
 'new-ts-photo-panel':{correct:[0],lesson:'l1-fiber-hardware',anchor:'optical-path-and-polarity',tip:/TX→RX.*DOM[/]DDM/i},
 'review-dot1x-20':{correct:[0],lesson:'l2-access-auth',anchor:'in-depth-existing-review-dot1x-20',tip:/EAPOL.*RADIUS.*Access-Accept/i},
 'review-ospf-27':{correct:[0],lesson:'l3-ospf',anchor:'in-depth-existing-review-ospf-27',tip:/OSPF cost.*show ip ospf interface/i},
 'l7-new-04':{correct:[3],lesson:'l7-http-status-basics',anchor:'http11-persistent-reuse',tip:/Content-Length: 1200.*Connection: close/i,trap:/Connection: keep-alive.*pipelining.*keepalive-probe/i},
 'l3-d07':{correct:[0],lesson:'l3-arp',anchor:'proxy-arp-masks-network-error',tip:/ip route get.*ARP.*proxy ARP/i},
};
for(const row of results){
 const exp=expected[row.id];assert.ok(exp,'Unexpected six-ID audit item: '+row.id);
 assert.deepEqual(row.question.correct,exp.correct,row.id+': stable correct answer');
 assert.equal(row.question.answers.length,4,row.id+': all four original alternatives');
 assert.equal(row.lesson.id,exp.lesson,row.id+': original target lesson');
 assert.equal(row.lesson.anchor,exp.anchor,row.id+': correct question-specific lesson anchor');
 for(const mode of ['plain','professional']){
  assert.equal(row.lesson.sections[mode].length,1,row.id+': one exact '+mode+' anchor');
  assert.ok(row.lesson.sections[mode][0].body?.trim(),row.id+': nonempty '+mode+' lesson section');
 }
 assert.ok(row.deep.brief?.trim()&&row.deep.plain?.trim()&&row.deep.pro?.trim(),row.id+': all explanation layers');
 assert.match(row.deep.tip||'',exp.tip,row.id+': contextual diagnostic advice');
 assert.doesNotMatch(row.deep.tip||'',/Сначала линк \(L1[/]L2\)|затем маршруты и DNS|быстрый взгляд на шлюзы/,row.id+': no generic hint');
 assert.doesNotMatch(row.deep.trap||'',/Смотрите точные формулировки стандартов и исключения/,row.id+': no generic trap');
 if(exp.trap)assert.match(row.deep.trap||'',exp.trap,row.id+': contextual persistent-connection misconception');
 if(row.id==='l3-16'){
  assert.match(row.lesson.sections.plain[0].body,/только маршрут подключённой локальной подсети и default route/,row.id+': exact two-route premise in linked lesson');
  const routes=m.QUESTION_SECTION_LINKS.filter(link=>link.questionIds.includes(row.id));
  assert.equal(routes.length,1,row.id+': precisely one active linked section, no conflicting legacy mapping');
  assert.equal(routes[0].anchorId,'in-depth-connected-vs-default-only',row.id+': link to precise section');
  const lesson=m.getLesson(row.lesson.id);
  for(const mode of ['plain','professional']){
    const old=m.getLessonBlocksWithSections(lesson,mode).filter(block=>block.anchorId==='in-depth-existing-l3-16');
    assert.equal(old.length,1,row.id+': old bookmarked teaching paragraph remains reachable in '+mode);
  }
 }
}
console.log('GENERIC6_REGRESSION_PASS 6 source keys, answer alternatives, live hints/trap, question-specific two-mode sections');
console.log('GENERIC6_SUMMARY '+JSON.stringify({count:results.length,ids,missingLesson:results.filter(x=>!x.lesson.id).map(x=>x.id),missingSection:results.filter(x=>!x.lesson.sections.plain.length||!x.lesson.sections.professional.length).map(x=>x.id)}));

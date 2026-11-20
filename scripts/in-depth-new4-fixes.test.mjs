import assert from 'node:assert/strict';
import {bundleEntry} from './load-bank.mjs';

const m=await bundleEntry('scripts/in-depth-entry.ts','in-depth-new4-review-test.mjs');
const pool=m.getTestingPool('mixed','in-depth');
assert.equal(pool.length,164,'preserve the current 164-ID Understanding pool');
const expected=[
 ['l3-d05','Many-to-one PAT (NAT overload) различает сессии в основном по…',
  ['Комбинации адресов и портов (и протокола)','Только MAC клиента','Только VLAN ID','Только DSCP'],
  'l3-nat','in-depth-pat-session-key',/show ip nat translations.*conntrack.*обратный пакет/,'nat'],
 ['l4-d03','TIME-WAIT на стороне, закрывшей соединение, нужен чтобы…',
  ['Корректно обработать запоздалые сегменты и обеспечить надежность закрытия','Ускорить только SYN-flood','Заменить keepalive HTTP','Отключить seq numbers'],
  'l4-tcp-connection-closing','in-depth-tcp-time-wait',/FIN[/]ACK.*4-tuple.*ss -tan state time-wait/,null],
 ['l4-d05','Selective ACK (SACK) помогает…',
  ['Подтверждать несмежные блоки и эффективнее догонять потери','Выбирать VLAN на trunk','Шифровать payload как TLS','Назначать IP из DHCP'],
  'l4-tcp-sack','in-depth-tcp-sack-blocks',/SACK-Permitted.*cumulative ACK.*tcp\.options\.sack\.count.*tcp\.options\.sack_le.*tcp\.options\.sack_re/,null],
 ['tcpip-d05','ECN (если согласован) позволяет…',
  ['Сигнализировать перегрузку без обязательного drop (CE mark)','Заменить IP-адреса','Отключить TCP','Назначить native VLAN'],
  'qos-basics','in-depth-ecn-congestion',/ECT[/]CE.*ECE[/]CWR/,null]
];
for (const [id,question,answers,lessonId,anchor,tipPattern,practiceLink] of expected){
 const q=pool.find(x=>x.id===id);
 assert.ok(q,id+': in exact target pool');
 assert.equal(q.text,question,id+': original question untouched');
 assert.deepEqual(q.answers,answers,id+': all original distractors untouched');
 assert.deepEqual(q.correct,[0],id+': original correct key untouched');
 const d=m.getQuestionDeepDive(q);
 assert.ok(d.briefAnswer?.trim()&&d.deepAnalysis?.trim()&&d.professional?.deep?.trim(),id+': both distinct explanatory layers');
 assert.notEqual(d.deepAnalysis,d.professional.deep,id+': plain/pro must not collapse');
 assert.match(d.practicalTip||'',tipPattern,id+': precisely targeted diagnostic advice');
 assert.doesNotMatch(d.practicalTip||'',/ss -tulpn|быстрый взгляд на шлюзы|Сначала линк \(L1\/L2\)/,id+': reject generic placeholders');
 const lesson=m.getLessonForQuestion(id);
 assert.equal(lesson?.id,lessonId,id+': original lesson intact');
 assert.equal(m.getLessonSectionForQuestion(lessonId,id),anchor,id+': precise original anchor');
 for(const mode of ['plain','professional']) {
  const blocks=m.getLessonBlocksWithSections(lesson,mode).filter(b=>b.anchorId===anchor);
  assert.equal(blocks.length,1,id+': exactly one section in '+mode);
  assert.ok(blocks[0].body.trim(),id+': target '+mode+' section must have content');
 }
 assert.equal(d.practiceLink??null,practiceLink,id+': keep existing practice destination; never invent a trainer');
 if(id==='l4-d05'){
  // Current Wireshark SACK fields; the bare tcp.options.sack display field is historical.
  const pro=d.professional.deep;
  const lessonPro=m.getLessonBlocksWithSections(lesson,'professional').find(b=>b.anchorId===anchor).body;
  for(const [kind,body] of [['practicalTip',d.practicalTip],['professional',pro],['linkedLessonProfessional',lessonPro]]){
    for(const field of ['tcp.options.sack.count','tcp.options.sack_le','tcp.options.sack_re']){
      assert.ok(body.includes(field),id+': '+kind+' must use current field '+field);
    }
    assert.doesNotMatch(body,/tcp\.options\.sack(?![._\w])/,id+': '+kind+' must not use obsolete bare SACK field');
  }
 }
 if(id==='l4-d03'){
  assert.match(d.commonTrap||'',/TIME-WAIT.*SYN flood.*CLOSE-WAIT/,id+': accurate active-close pitfall');
  assert.doesNotMatch(d.commonTrap||'',/Смотрите точные формулировки стандартов и исключения/,id+': reject generic trap');
 }
 console.log('PASS AUTHOR structural checks '+id+' (not independent semantic acceptance)');
}
console.log('PASS: four transferred IDs, exact answer key/options, two-style lesson anchors and targeted hints; independent re-review still mandatory');

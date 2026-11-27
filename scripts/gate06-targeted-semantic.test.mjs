import {bankBeforeCopperPhotoChanges} from './copper-photo-history-fixtures.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {bundleEntry} from './load-bank.mjs';
import {restoreGate06HistoricalTeachingFields,GATE06_TEACHING_FIELDS} from './gate06-targeted-bank-fields.mjs';
const m=await bundleEntry('scripts/in-depth-entry.ts','gate06-targeted-semantic.mjs');
const ids=['mon-snmp-01','mon-syslog-01','mon-syslog-05','mon-zabbix-01','wifi-std-01','wifi-std-04','wifi-roam-01','wifi-sec-01','wifi-sec-05','tcp-05','review-ptp-17'];
const q=id=>m.ALL_QUESTIONS.find(q=>q.id===id);
const blocks=(id,style)=>m.getLessonBlocksWithSections(m.getLessonForQuestion(id),style);
const tokens=text=>m.splitGlossaryText(text).flatMap(p=>p.term?[p.term]:[]);
for(const id of ids){
 const question=q(id),lesson=m.getLessonForQuestion(id),anchor=m.getLessonSectionForQuestion(lesson.id,id);
 assert.ok(anchor,`${id}: exact target`);
 for(const style of ['plain','professional'])assert.equal(blocks(id,style).filter(b=>b.anchorId===anchor).length,1,`${id}/${style}: unique anchor`);
}
for(const id of ['wifi-std-01','wifi-std-04']){
 const question=q(id),deep=m.getQuestionDeepDive(question);
 for(const [field,value]of Object.entries(GATE06_TEACHING_FIELDS[id]))assert.equal(question[field],value.after);
 assert.equal(deep.memorizationRule,question.remember);
}
assert.match(m.getQuestionDeepDive(q('mon-snmp-01')).practicalTip,/engineID.*snmpget/);
assert.match(m.getQuestionDeepDive(q('mon-syslog-01')).practicalTip,/show logging.*notifications/);
assert.deepEqual(q('wifi-std-01').correct,[2]);assert.deepEqual(q('wifi-std-04').correct,[3]);
assert.ok(!tokens(m.getQuestionDeepDive(q('wifi-roam-01')).keyTakeaways.join(' ')).includes('sticky'));
const ppp=blocks('tcp-05','professional').find(b=>b.anchorId==='in-depth-ppp-ipcp-first-ipv4-packet').body;
assert.match(ppp,/Protocol заголовка IPv4, где 17 означает UDP/);assert.ok(!tokens(ppp).includes('NEXT'));assert.ok(tokens(ppp).includes('next-hop'));
for(const style of ['plain','professional']){
 const trap=blocks('mon-snmp-01',style).find(b=>b.heading==='Trap и Inform: кто посылает и кто подтверждает').body;
 for(const wrong of ['GET','Request','retransmission'])assert.ok(!tokens(trap).includes(wrong),`${style}: no unrelated ${wrong}`);
}
const aliases=['Probe Request','Password-Authenticated Key Exchange','retry rate','Tx Power Symmetry','Sticky clients','Zabbix agent (active)','Active agent','Passive agent','Active Zabbix agent','Passive Zabbix agent','nodata()','nodata(60s)','update interval'];
for(const alias of aliases){assert.deepEqual(tokens(alias),[alias],`${alias}: entire contextual phrase`);assert.ok(m.GLOSSARY[alias]?.description);assert.ok(m.GLOSSARY_TOOLTIPS[alias]?.summary);}
// Existing meanings remain valid in their original domains.
assert.ok(tokens('HTTP GET').includes('GET'));assert.match(m.GLOSSARY_TOOLTIPS.Request.summary,/DHCP/);assert.match(m.GLOSSARY_TOOLTIPS.NEXT.summary,/перекрёстной наводке/i);
const baseline=JSON.parse(readFileSync('docs/audits/in-depth/invariants-baseline.json'));
const oldAnswers=bankBeforeCopperPhotoChanges(m.ALL_QUESTIONS).map(question=>m.PREVIOUS_IN_DEPTH_QUESTIONS[question.id]?{...question,answers:m.PREVIOUS_IN_DEPTH_QUESTIONS[question.id].answers}:question);
const restored=restoreGate06HistoricalTeachingFields(oldAnswers);
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
assert.equal(sha(restored),baseline.bankSHA256,'Unchanged historical bank baseline; only explicit teaching fields/options normalized');
assert.throws(()=>restoreGate06HistoricalTeachingFields(oldAnswers.map(question=>question.id==='wifi-std-01'?{...question,explanation:'unexpected edit'}:question)),/exact reviewed correction/);
mkdirSync('scripts/.cache/gate06-targeted',{recursive:true});
writeFileSync('scripts/.cache/gate06-targeted/structural-tests.json',JSON.stringify({ids,passed:true,semanticAcceptance:'NOT_INFERRED_FROM_TESTS'},null,2));
console.log('PASS: eleven targeted routes, five exact teaching fields, contextual glossary regressions and immutable bank checksum');

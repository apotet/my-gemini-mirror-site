import { restoreGate06HistoricalTeachingFields } from './gate06-targeted-bank-fields.mjs';
import { bankBeforeCopperPhotoChanges, registryBeforePvcRetirement } from './copper-photo-history-fixtures.mjs';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { bundleEntry } from './load-bank.mjs';
const m=await bundleEntry('scripts/in-depth-entry.ts','in-depth-tests.mjs');
const baseline=JSON.parse(readFileSync('docs/audits/in-depth/invariants-baseline.json','utf8'));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const registry=JSON.parse(readFileSync('src/data/questionLearningLevels.json','utf8'));
const assignedIds=Object.entries(registry).filter(([,r])=>r.status==='ASSIGNED'&&r.learningLevel===2).map(([id])=>id).sort();
const pool=m.getTestingPool('mixed','in-depth');
// The same generic "A" denotes a DNS IPv4 record elsewhere, but the RA PIO
// Autonomous flag in the accepted Understanding SLAAC route. Never mix them.
const ipv6Flags=m.splitGlossaryText('SLAAC: A=1, L=1, флаг A и флаги A/L.', 'ipv6');
for (const term of ['A=1','L=1','A flag','A/L']) {
  assert.ok(ipv6Flags.some(part=>part.term===term),term+': IPv6 scope must display correct RA flag tooltip');
  assert.ok(m.GLOSSARY_TOOLTIPS[term]?.summary,term+': tooltip text must exist');
}
assert.ok(!ipv6Flags.some(part=>part.term==='A'),'SLAAC must not show DNS A-record');
assert.ok(m.splitGlossaryText('DNS A и AAAA').some(part=>part.term==='A'),'generic DNS A remains available');
assert.ok(m.splitGlossaryText('DNS A и AAAA','ipv6').some(part=>part.term==='A'),'explicit DNS A stays DNS inside IPv6 lesson');
assert.ok(!m.splitGlossaryText('A=1').some(part=>part.term==='A' || part.term==='A=1'),'IPv6-specific syntax cannot leak into general text');
assert.match(m.GLOSSARY['A=1'].description,/SLAAC/,'Autonomous A flag definition');
assert.match(m.GLOSSARY['A/L'].description,/независимых/,'A and L are separate RA PIO flags');
for(const id of ['review-slaac-4','stp-new-04']) {
  const q=pool.find(q=>q.id===id),lesson=m.getLessonForQuestion(id);
  assert.ok(q&&lesson,id+': authentic question and linked lesson');
  assert.equal(q.correct.length,1,id+': single key');
  assert.equal(q.correct[0],0,id+': confirmed correct answer');
  const deep=m.getQuestionDeepDive(q);
  assert.ok(deep.briefAnswer&&deep.deepAnalysis&&deep.professional.deep,id+': individual explanation in all modes');
  const anchor=m.getLessonSectionForQuestion(lesson.id,id);
  assert.ok(anchor,id+': exact topical anchor');
  for (const mode of ['plain','professional']) {
    const block=m.getLessonBlocksWithSections(lesson,mode).find(b=>b.anchorId===anchor);
    assert.ok(block?.body?.length>200,id+'/'+mode+': targeted teaching text exists');
  }
}
assert.equal(m.getLessonForQuestion('review-slaac-4').id,'l3-ipv6','SLAAC lesson exact');
assert.equal(m.getLessonSectionForQuestion('l3-ipv6','review-slaac-4'),'in-depth-slaac-ra-address-formation','SLAAC exact section');
assert.equal(m.getLessonForQuestion('stp-new-04').id,'l2-rstp-convergence','RSTP lesson exact');
assert.equal(m.getLessonSectionForQuestion('l2-rstp-convergence','stp-new-04'),'indepth-rstp-root-failure','RSTP exact section');
assert.match(m.getQuestionDeepDive(pool.find(q=>q.id==='stp-new-04')).practicalTip,/Cisco IOS\/IOS XE/,
  'Cisco RSTP show command cannot be presented as vendor-neutral');


/** Independent audit of Gemini's 23 Nov PoE closeout archive: only two confirmed
 * code defects were present on the frozen main. The claimed Cyrillic MAC typo
 * and missing DC resistance unbalance distinction are NOT present in main. */
const closeoutPoeQuestion=pool.find(q=>q.id==='review-poe-30');
assert.ok(closeoutPoeQuestion,'review-poe-30 remains in the Understanding pool');
const closeoutPoeDive=m.getQuestionDeepDive(closeoutPoeQuestion);
assert.match(closeoutPoeDive.deepAnalysis,/MAC-таблице/,'PoE plain uses Latin MAC');
assert.doesNotMatch(closeoutPoeDive.deepAnalysis,/МАС-таблице/,'PoE plain must not use Cyrillic МАС');
assert.match(closeoutPoeDive.professional.deep,/IEEE 802\.3 LLDP Power-via-MDI/,'Explain standard IEEE power negotiation TLV');
assert.match(closeoutPoeDive.professional.deep,/Cisco IOS\/IOS XE/,'Cisco PoE CLI must be platform scoped');
assert.match(closeoutPoeDive.professional.deep,/доступна на данной модели/,'Detailed PoE CLI is device-dependent');
assert.match(closeoutPoeDive.practicalTip,/Cisco IOS\/IOS XE/,'Practical CLI advice is Cisco-specific');
assert.match(closeoutPoeDive.practicalTip,/PoE-тестером/,'Keep independent under-load test when PD reboots');
assert.ok(pool.some(q=>q.id==='mon-zabbix-01'),'actual 164-ID pool includes monitoring question');
assert.ok(!pool.some(q=>q.id==='l1-d04'),'audit archive ghost ID must not enter the Understanding pool');

// Gemini independent material review: typography must remain legible in BOTH lesson modes.
// Pin the exact question section instead of checking arbitrary lesson text or a CI extract.
for(const {id,prohibited} of [
  {id:'gap-pack2-27',prohibited:/(?:равно|результатом|включает|Length|вернуть)\d/},
  {id:'gap-pack3-15',prohibited:/(?:HEAD|Content-Length|читать)\d|Nбайт/},
  {id:'l4-new-05',prohibited:/как0x[0-9a-f]+/i},
  {id:'gap-pack2-21',prohibited:/gap-pack2-21|window0|ss listener/i},
  {id:'gap-pack3-08',prohibited:/checksum0|поля0/},
]) {
  const lesson=m.getLessonForQuestion(id), anchor=m.getLessonSectionForQuestion(lesson.id,id);
  assert.ok(anchor,`${id}: contextual anchor exists`);
  for(const mode of ['plain','professional']) {
    const section=m.getLessonBlocksWithSections(lesson,mode).find(b=>b.anchorId===anchor);
    assert.ok(section?.body,`${id}: ${mode} exact lesson paragraph exists`);
    assert.doesNotMatch(section.body,prohibited,`${id}: no glued words/numbers in ${mode} lesson section`);
  }
}

// Gemini 10-ID review: TCP zero-window advice must be an actionable packet check, not UI jargon.
const persistQuestion=pool.find(q=>q.id==='gap-pack2-21');
assert.ok(persistQuestion,'gap-pack2-21 exists in Understanding');
const persistTip=m.getQuestionDeepDive(persistQuestion)?.practicalTip;
assert.match(persistTip,/TCP Window=0.*zero-window probes/,'TCP persist tip distinguishes zero window and probes');
assert.doesNotMatch(persistTip,/window0|ss listener|gap-pack2-21/i,'No glued tokens, internal IDs or irrelevant ss listener in learner tip');

// Gemini 10-ID batch 2: no generic OSI-layer fallback in ARP collision or cached gateway advice.
for (const {id,rule} of [
  {id:'gen-diag-6',rule:/ARP-ответы.*Source MAC.*DHCP-аренды/},
  {id:'gen-diag-9',rule:/ARP-записи шлюза.*маршрут/},
]) {
  const question=pool.find(item=>item.id===id);
  assert.ok(question,id+': Understanding pool membership');
  const tip=m.getQuestionDeepDive(question)?.practicalTip;
  assert.match(tip,rule,id+': question-specific actionable practical tip');
  assert.doesNotMatch(tip,/Сначала линк \(L1\/L2\), затем маршруты и DNS\./,id+': no mismatched inherited fallback');
}
// Both lesson reading modes must keep machine-relevant numbers visually separated from words.
for (const {id,prohibited} of [
  {id:'gen-diag-7',prohibited:/IPv4-источник0\.0\.0\.0|назначение255\.255\.255\.255|выбрать169\.254|DHCPDISCOVER0\.0\.0\.0|диапазон169\.254/},
  {id:'gen-osi-a-2',prohibited:/диапазон0,7|номинальный1/},
  {id:'gen-port-14',prohibited:/наUDP162|port162/},
]) {
  const lesson=m.getLessonForQuestion(id), anchor=lesson&&m.getLessonSectionForQuestion(lesson.id,id);
  assert.ok(lesson&&anchor,id+': contextual lesson anchor present');
  for (const mode of ['plain','professional']) {
    const section=m.getLessonBlocksWithSections(lesson,mode).find(block=>block.anchorId===anchor);
    assert.ok(section?.body,id+'/'+mode+': actual contextual section text exists');
    assert.doesNotMatch(section.heading+' '+section.body,prohibited,id+'/'+mode+': no glued words and numeric/port values');
  }
}

// ChatGPT source audit, Gemini batch3 unavailable (Google 503/headers timeout):
// keys, exact lesson anchors, and readable port/protocol/OSI notation for ten questions.
for (const [id,key,lessonId,anchorId,badText] of [
  ['gen-transport-1',1,'l4-service-ports','in-depth-http2-http3-port443',/TCP\/ 443|UDP\/ 443|TLS1\.3|обычно443/],
  ['gen-transport-14',2,'l7-monitoring-snmp-syslog','in-depth-snmp-trap-inform-roles',/на161/],
  ['gen-transport-16',0,'l4-directory-remote-industrial-ports','in-depth-rdp-udp-fallback',/TCP\/ 3389|UDP\/ 3389|на3389/],
  ['gen-transport-17',1,'l4-directory-remote-industrial-ports','in-depth-modbus-mbap-vs-rtu',/серверному502|клиентский502|порту502|равен0|TCP\/ 502/],
  ['gen-transport-5',1,'l7-mail-mx','in-depth-smtp-mx-delivery-port25',/серверA|принимающемуB|на25|Порты587|и465|кsubmission|destination25|обычным587\/465|поMX/],
  ['gen-transport-7',1,'l7-dhcp','in-depth-dhcp-init-and-apipa',/DHCPDISCOVER0\.0\.0\.0|выбрать169\.254/],
  ['k-01',1,'tcpip-model','in-depth-application-protocol-semantics',/Согласно условию k-01/],
  ['k-02',2,'tcpip-encapsulation','in-depth-tcp-ip-encapsulation-boundary',/Согласно условию k-02/],
  ['k-03',0,'l4-tcp','in-depth-tcp-byte-stream-service',/иWi-Fi/],
  ['k-04',3,'osi-session-presentation','in-depth-l6-identical-bytes-encoding',/представленияL6|модульL6/]
]) {
  const q=pool.find(x=>x.id===id);
  assert.ok(q,id+': exact registered Understanding question exists');
  assert.deepEqual(q.correct,[key],id+': unique expected answer key');
  const lesson=m.getLessonForQuestion(id);
  assert.equal(lesson?.id,lessonId,id+': exact lesson id');
  assert.equal(m.getLessonSectionForQuestion(lesson.id,id),anchorId,id+': exact lesson section anchor');
  for(const mode of ['plain','professional']) {
    const section=m.getLessonBlocksWithSections(lesson,mode).find(x=>x.anchorId===anchorId);
    assert.ok(section?.body?.trim(),id+'/'+mode+': actual lesson content');
    assert.doesNotMatch(section.heading+' '+section.body,badText,id+'/'+mode+': no glued terms in learner-facing lesson');
  }
  const deep=m.getQuestionDeepDive(q);
  assert.ok(deep?.briefAnswer && deep?.deepAnalysis && deep?.professional?.deep,id+': individual explanation in both modes');
  assert.doesNotMatch(deep.deepAnalysis+' '+deep.professional.deep,badText,id+': no glued protocol/numeric tokens in deep dive');
}

// Four audited structural gaps: route to an exact contextual subsection, not lesson top.
for(const {id,lessonId,anchor,plainRule,proRule} of [
  {id:'gap-pack2-05',lessonId:'tcpip-encapsulation',anchor:'in-depth-fcs-ipv4-header-payload-scope',plainRule:/новую корректную FCS/,proRule:/Контрольная сумма заголовка IPv4|IPv4 payload/},
  {id:'gap-pack2-10',lessonId:'tcpip-encapsulation',anchor:'in-depth-ppp-ipcp-first-ipv4-packet',plainRule:/IPCP не повторяют/,proRule:/0x0021/},
  {id:'gap-pack2-11',lessonId:'l7-dns',anchor:'in-depth-dns-aaaa-noerror-nodata',plainRule:/NOERROR/,proRule:/RFC 2308/},
  {id:'gap-pack2-16',lessonId:'l7-services',anchor:'in-depth-ntp-source-validity-rate',plainRule:/RATE/,proRule:/KoD[^.]*RATE|Reference ID RATE/i},
]) {
  const question=pool.find(q=>q.id===id);
  assert.ok(question, id+': registered Understanding question');
  const lesson=m.getLessonForQuestion(id);
  assert.equal(lesson?.id,lessonId,id+': reviewed lesson link, not a guessed generic lesson');
  assert.equal(m.getLessonSectionForQuestion(lessonId,id),anchor,id+': exact section');
  const simple=m.getLessonBlocksWithSections(lesson,'plain').filter(b=>b.anchorId===anchor);
  const detailed=m.getLessonBlocksWithSections(lesson,'professional').filter(b=>b.anchorId===anchor);
  assert.equal(simple.length,1,id+': one plain section');
  assert.equal(detailed.length,1,id+': one pro section');
  assert.ok(simple[0].body&&simple[0].heading,id+': readable plain section');
  assert.ok(detailed[0].body&&detailed[0].heading,id+': readable pro section');
  assert.match(simple[0].body,plainRule,id+': topical plain meaning');
  assert.match(detailed[0].body,proRule,id+': topical engineering meaning');
}
// Both PPP and FCS sections must be separately addressable in the same lesson.
assert.notEqual(m.getLessonSectionForQuestion('tcpip-encapsulation','gap-pack2-05'),
                m.getLessonSectionForQuestion('tcpip-encapsulation','gap-pack2-10'));

// Reporting only: make the real 164-question exact-section debt visible to reviewers.
// Never convert absence of a section into an asserted independent semantic PASS.
const exactAnchorInventory=pool.map(q=>{
  const lesson=m.getLessonForQuestion(q.id);
  const anchor=lesson?m.getLessonSectionForQuestion(lesson.id,q.id):undefined;
  const plain=lesson&&anchor?m.getLessonBlocksWithSections(lesson,'plain').filter(b=>b.anchorId===anchor):[];
  const professional=lesson&&anchor?m.getLessonBlocksWithSections(lesson,'professional').filter(b=>b.anchorId===anchor):[];
  const issue=!lesson?'MISSING_LESSON':!anchor?'MISSING_EXACT_ANCHOR':plain.length!==1||professional.length!==1?'INVALID_CONTEXTUAL_SECTION':null;
  return {id:q.id,lessonId:lesson?.id??null,anchor:anchor??null,issue};
});
const missingExact=exactAnchorInventory.filter(row=>row.issue);
mkdirSync('scripts/.cache/in-depth',{recursive:true});
writeFileSync('scripts/.cache/in-depth/anchor-inventory.json',
  JSON.stringify({sha:'runtime CI checkout',total:exactAnchorInventory.length,missing:missingExact.length,rows:exactAnchorInventory},null,2)+'\n');
console.log('IN_DEPTH_ANCHOR_INVENTORY '+JSON.stringify({
  total:exactAnchorInventory.length,missing:missingExact.length,
  byIssue:missingExact.reduce((a,r)=>(a[r.issue]=(a[r.issue]??0)+1,a),{}),
  ids:missingExact.map(r=>r.id)
}));

assert.equal(missingExact.length,0,'Every Understanding ticket needs an exact topical lesson paragraph in both reading modes');
for(const id of ['l2-04','l3-16','l7-05','new-tcpip-router','new-ts-vlan','new-ts-dns',
 'review-dot1x-20','review-ospf-27','l1v2-b-transfer','l1v2-c-bidi-wrong-pair',
 'l2-sec-05','l2-sec-08','l2-sec-13','l2-sec-18','l3-bgp-06','l4-lb-01',
 'l12-x02','l12-d05','l4-d04','l57-d02','l3-vrrp02','l3-vrrp04',
 'l12-copp01','l12-storm01','mon-snmp-01','mon-syslog-01','mon-syslog-05','mon-zabbix-01']) {
  const lesson=m.getLessonForQuestion(id);
  const anchor=m.getLessonSectionForQuestion(lesson.id,id);
  assert.ok(anchor,id+': section anchor');
  for(const mode of ['plain','professional']) {
    const matches=m.getLessonBlocksWithSections(lesson,mode).filter(b=>b.anchorId===anchor);
    assert.equal(matches.length,1,id+'/'+mode+': exactly one real paragraph');
    assert.ok(matches[0].body?.trim().length>80,id+'/'+mode+': meaningful authored lesson text');
  }
}
for(const mode of ['plain','professional']){
  const lesson=m.getLessonForQuestion('mon-syslog-05');
  const block=m.getLessonBlocksWithSections(lesson,mode).find(b=>b.anchorId==='in-depth-syslog-monitor-vty');
  assert.match(block.body,/terminal monitor/,'Syslog VTY must explain exact missing CLI toggle');
}

const genericTipIds=pool.filter(q=>m.getQuestionDeepDive(q)?.practicalTip==='Не смешивайте симптомы разных слоёв модели.').map(q=>q.id);
assert.deepEqual(genericTipIds,[],'Understanding must not expose a generic OSI fallback as individual practical advice');
assert.match(m.GLOSSARY.recvfrom.description,/вернуть 0/,'recvfrom glossary also keeps the zero-length result readable');
// Batch-04 semantic corrections: a topic-specific practice hint, not the inherited OSI-layer slogan.
for (const {id,rule} of [
  {id:'gap-pack3-08',rule:/UDP Checksum.*IPv6|UDP\/IPv6.*Checksum/},
  {id:'gap-pack3-15',rule:/HEAD.*Content-Length/},
  {id:'l57-x19',rule:/Projects.*IMAP.*Seen/},
]) {
  const q=pool.find(item=>item.id===id);
  assert.ok(q,`${id}: Understanding question exists`);
  const dive=m.getQuestionDeepDive(q);
  assert.match(dive.practicalTip,rule,`${id}: topic-specific practice tip required`);
  assert.notEqual(dive.practicalTip,'Не смешивайте симптомы разных слоёв модели.',`${id}: no unrelated fallback`);
}
const udpChecksumDive=m.getQuestionDeepDive(pool.find(item=>item.id==='l4-new-05'));
assert.match(udpChecksumDive.commonTrap,/Ошибочно объявлять оба пакета повреждёнными/,'l4-new-05: trap must describe a misconception, not restate a correct fact');
const transferred=['l3-d05','l4-d03','l4-d05','tcpip-d05'];
const expectedIds=[...new Set([...baseline.ids,...transferred])].sort();
assert.equal(pool.length,164);assert.deepEqual(pool.map(q=>q.id).sort(),assignedIds);assert.deepEqual(assignedIds,expectedIds);
assert.ok(transferred.every(id=>assignedIds.includes(id)),'All four moved Fundamentals questions belong to the current pool');
assert.deepEqual(m.getLearningLevelPool('mixed',2).map(q=>q.id),pool.map(q=>q.id));
const registryRaw=readFileSync('src/data/questionLearningLevels.json','utf8');
assert.equal(registryRaw,JSON.stringify(registry,null,2)+'\n','active registry serialization is protected');
const historicalRegistryRaw=JSON.stringify(registryBeforePvcRetirement(registry),null,2)+'\n';
const gitRegistryBlob=createHash('sha1').update('blob '+Buffer.byteLength(historicalRegistryRaw)+'\0').update(historicalRegistryRaw).digest('hex');
assert.equal(gitRegistryBlob,'aa4682284e7803f1fbd4e930a6e154d71acc96af','Exact approved post-#258 registry; no reclassification');
assert.deepEqual(m.QUESTION_LEARNING_LEVELS,registry);
assert.equal(m.ALL_QUESTIONS.length,860);
const reconstructed=bankBeforeCopperPhotoChanges(m.ALL_QUESTIONS).map(q=>m.PREVIOUS_IN_DEPTH_QUESTIONS[q.id]?{...q,answers:m.PREVIOUS_IN_DEPTH_QUESTIONS[q.id].answers}:q);
assert.equal(hash(restoreGate06HistoricalTeachingFields(reconstructed)),baseline.bankSHA256,'Only previously reviewed options and five exact GATE-06 teaching fields changed; stems, keys, order and all other records preserved');
assert.equal(new Set(m.IN_DEPTH_IDS).size,164);assert.equal(m.IN_DEPTH_IDS.length,164);assert.deepEqual([...m.IN_DEPTH_IDS].sort(),assignedIds,'Every ID has exactly one repair/review batch');
for(const batch of m.IN_DEPTH_BATCHES) {assert.ok(batch.questionIds.length>0&&batch.questionIds.length<=20,`Small batch ${batch.id}`);}
const approvedMainDrift=JSON.parse(readFileSync('docs/audits/in-depth/approved-main-outside-drift.json','utf8'));
assert.equal(approvedMainDrift.approvedMainCommit,'ddd8682cd7db71e994ae2ac29e08f4b1bc8c6f6f','Pinned current-main baseline');
const expectedDriftIds=approvedMainDrift.reasons.flatMap(reason=>reason.ids);
assert.deepEqual(new Set(expectedDriftIds).size,14,'Exactly twelve approved Applied and two photo fixes');
const expectedDrift=new Map(approvedMainDrift.changes.map(item=>[item.id,item]));
assert.deepEqual([...expectedDrift.keys()].sort(),[...expectedDriftIds].sort(),'No undocumented pre-existing main changes');
const historicalOutsideDrift=[];
const currentOutsideDrift=[];
let outsideLevelCount=0;
for(const q of m.ALL_QUESTIONS.filter(q=>!assignedIds.includes(q.id))) {
  outsideLevelCount++;
  const dive=m.getQuestionDeepDive(q);
  const actual=hash(dive);
  const originalSnapshot=baseline.outsideLevelDeep[q.id];
  const expected=expectedDrift.get(q.id);
  assert.strictEqual(m.applyInDepthExplanation(q.id,dive,q),dive,`${q.id}: patch must preserve the identical object outside Understanding`);
  if(expected) {
    assert.equal(originalSnapshot,expected.previous,`${q.id}: provenance still matches frozen original Codex snapshot`);
    historicalOutsideDrift.push(q.id);
  }
  // NETOPS-LIGHT-CI-2026-11-24: historical fingerprints report drift;
  // they are not an acceptance verdict. The L2 overlay isolation above
  // remains strict, independently of changes made directly in other levels.
  const reference=expected?.current??originalSnapshot;
  if(actual!==reference) currentOutsideDrift.push({id:q.id,reference:reference??null,actual});
}
assert.deepEqual(historicalOutsideDrift.sort(),[...expectedDrift.keys()].sort(),'All archived #254/#258 records still refer to out-of-level questions');
console.log('INFO Understanding historical outside-level fingerprints (not an acceptance verdict):',JSON.stringify({
  compared:outsideLevelCount,
  unchanged:outsideLevelCount-currentOutsideDrift.length,
  differences:currentOutsideDrift.sort((a,b)=>a.id.localeCompare(b.id)),
}));
for(const id of Object.keys(m.IN_DEPTH_PATCHES))assert.ok(assignedIds.includes(id),`No content patches outside L2 ${id}`);
for(const id of Object.keys(m.IN_DEPTH_LESSON_LINKS))assert.ok(assignedIds.includes(id),`No links outside L2 ${id}`);
const rows=[];
const missingLessonTerms=new Set();
for(const q of pool) {
  const d=m.getQuestionDeepDive(q),lesson=m.getLessonForQuestion(q.id);
  assert.ok(d.hasIndividualDeep,`${q.id}: no generated fallback`);
  for(const [name,value] of [['why',d.briefAnswer],['plain',d.deepAnalysis],['pro',d.professional?.deep]])assert.ok(typeof value==='string'&&value.trim(),`${q.id}: missing ${name}`);
  assert.notEqual(d.deepAnalysis.trim(),d.briefAnswer.trim(),`${q.id}: plain not a brief duplicate`);
  assert.notEqual(d.professional.deep.trim(),d.deepAnalysis.trim(),`${q.id}: pro not a plain duplicate`);
  assert.equal(d.glossaryInProfessional,true,`${q.id}: professional glossary available`);
  assert.ok(lesson?.blocks.length&&lesson.professional?.blocks.length,`${q.id}: real two-style lesson`);
  assert.equal(m.getLesson(lesson.id),lesson);
  assert.ok(lesson.relatedQuestionIds.includes(q.id),`${q.id}: return/backlink`);
  if(d.practiceLink)assert.ok(Object.hasOwn(m.PRACTICE_DESTINATIONS,d.practiceLink),`${q.id}: actual practice key`);
  const anchor=m.getLessonSectionForQuestion(lesson.id,q.id);
  const mappings=m.QUESTION_SECTION_LINKS.filter(r=>r.questionIds.includes(q.id));
  assert.ok(mappings.length<=1,`${q.id}: no conflicting section routes`);
  for(const mode of ['plain','professional']) {
    const blocks=m.getLessonBlocksWithSections(lesson,mode);
    if(anchor)assert.equal(blocks.filter(b=>b.anchorId===anchor).length,1,`${q.id}: ${mode} exact section`);
    for(const term of (mode==='plain'?lesson.terms:lesson.professional.terms)) if(!m.GLOSSARY[term]?.description?.trim()) missingLessonTerms.add(`${lesson.id}/${mode}: ${term}`);
  }
  rows.push({id:q.id,lessonId:lesson.id,anchor:anchor??null,individual:true,plain:true,professional:true,semantic:'REQUIRES_INDEPENDENT_REVIEW'});
}
assert.deepEqual([...missingLessonTerms].sort(),[], 'Every term in every referenced lesson has a live glossary entry');
for(const [term] of Object.entries(m.IN_DEPTH_TERMS)) {
  assert.ok(m.GLOSSARY[term]?.description&&m.GLOSSARY[term]?.relatesTo,`Useful definition/context: ${term}`);
  assert.ok(m.GLOSSARY_TOOLTIPS[term]?.english&&m.GLOSSARY_TOOLTIPS[term]?.russian&&m.GLOSSARY_TOOLTIPS[term]?.summary,`Tooltip metadata ${term}`);
  // PoE-specific and one-letter formula tokens intentionally require a scope.
  // A bare generic text match must not reactivate wrong cross-domain tooltips.
  const recognized = [undefined, 'poe', 'poe-formula'].some(scope =>
    m.splitGlossaryText(term,scope).some(s=>s.term===term ||
      (term.toLowerCase()==='sack-permitted' && s.term?.toLowerCase()===term.toLowerCase())));
  assert.ok(recognized,`Actual matcher recognizes ${term} in an allowed glossary scope`);
  if(m.GLOSSARY[term].lessonId)assert.ok(m.getLesson(m.GLOSSARY[term].lessonId),`Existing glossary lesson ${term}`);
}
for(const section of m.IN_DEPTH_SECTIONS) {
  const lesson=m.getLesson(section.lessonId);assert.ok(lesson?.professional,section.lessonId);
  for(const mode of ['plain','professional'])assert.ok((mode==='plain'?lesson.blocks:lesson.professional.blocks).some(b=>b.heading===section.afterHeading[mode]),`Exact insertion heading ${section.anchorId}/${mode}`);
}
// Provenance is retained for untouched professional content, cleared for semantic edits.
for(const [id,patch] of Object.entries(m.IN_DEPTH_LESSON_PATCHES)) if(patch.professional||patch.professionalSummary!==undefined||Object.keys(patch.professionalBlocks??{}).length||patch.professionalTerms?.length) assert.equal(m.getLesson(id).professional?.sourceCommit,undefined,`${id}: no stale professional provenance`);
const fixture=structuredClone(m.getLesson('l2-ethernet'));fixture.id='__l2-provenance-plain-only';fixture.professional.sourceCommit='fixture-original';const fixtureBefore=JSON.stringify(fixture);
m.IN_DEPTH_LESSON_PATCHES[fixture.id]={plainBlocks:{[fixture.blocks[0].heading]:'Unit fixture plain correction'}};
try {const changed=m.applyInDepthLesson(fixture);assert.equal(changed.professional.sourceCommit,'fixture-original');assert.equal(changed.blocks[0].body,'Unit fixture plain correction');assert.equal(JSON.stringify(fixture),fixtureBefore,'No lesson source mutation');} finally {delete m.IN_DEPTH_LESSON_PATCHES[fixture.id];}
assert.equal(m.splitGlossaryText('next-hop').find(s=>s.term)?.term,'next-hop','NEXT crosstalk must not capture routing next-hop');
assert.equal(m.splitGlossaryText('incomplete').find(s=>s.term)?.term,'incomplete','Retain established case-insensitive canonical key');
assert.equal(m.getQuestionDeepDive(pool.find(q=>q.id==='l2-sec-13')).practiceLink,undefined,'No native VLAN capability promised by allowed-list-only trainer');
assert.equal(m.getLessonForQuestion('unknown-l2-question'),undefined,'No invented fallback lesson');

// Batch 03 evidence-gated routing: every concrete question opens its real two-mode section.
// In particular syslog-25 must NOT be attached to the NTP KoD RATE-only section.
const batch03Links=[
  {
    "id": "review-syslog-25",
    "lessonId": "l7-services",
    "anchorId": "in-depth-event-time-sync-timezone",
    "plainExpected": "Как сопоставить события нескольких устройств по времени",
    "proExpected": "Корреляция Syslog: NTP status, offset, UTC и event timestamp"
  },
  {
    "id": "l1v2-a-category-limit",
    "lessonId": "l1-copper-cable",
    "anchorId": "in-depth-copper-assembly-category-rating",
    "plainExpected": "Категорию сборки не видно по одному штекеру",
    "proExpected": "Категория сборки: компонентные характеристики и проверка Channel"
  },
  {
    "id": "l1v2-a-jacket-limit",
    "lessonId": "l1-copper-cable",
    "anchorId": "in-depth-copper-pvc-lszh-jacket-evidence",
    "plainExpected": "PVC или LSZH: искать маркировку оболочки, а не категорию",
    "proExpected": "Материал jacket отдельно от CAT, AWG и shielding"
  },
  {
    "id": "l1v2-a-label-sftp",
    "lessonId": "l1-copper-cable",
    "anchorId": "in-depth-sftp-braid-foil-cable-marking",
    "plainExpected": "S/FTP на оболочке: общий экран плюс фольга каждой пары",
    "proExpected": "ISO/IEC x/yTP: S/FTP versus F/UTP and U/FTP"
  },
  {
    "id": "l1v2-a-solid-use",
    "lessonId": "l1-copper-cable",
    "anchorId": "in-depth-copper-solid-permanent-link",
    "plainExpected": "Solid-жилы: для неподвижной линии, а не подвижного шнура",
    "proExpected": "Solid/stranded: permanent link versus repeatedly flexed patch cord"
  },
  {
    "id": "review-poe-30",
    "lessonId": "l1-poe-screen-reading",
    "anchorId": "in-depth-poe-class-budget-camera",
    "plainExpected": "PoE-порт поддерживается, а камера не включается: класс и запас мощности",
    "proExpected": "PoE troubleshooting: PSE/PD classification и оставшийся power budget"
  },
  {
    "id": "gap-pack2-21",
    "lessonId": "tcp-window-retransmit",
    "anchorId": "in-depth-tcp-zero-window-persist-recovery",
    "plainExpected": "Получатель объявил окно 0: зачем нужны пробы persist",
    "proExpected": "RFC 9293: zero receive window, persist probe, lost window update"
  }
];
for (const {id,lessonId,anchorId,plainExpected,proExpected} of batch03Links) {
 const lesson=m.getLessonForQuestion(id);
 assert.equal(lesson?.id,lessonId,`${id}: correct actual lesson`);
 assert.equal(m.getLessonSectionForQuestion(lessonId,id),anchorId,`${id}: precise topical anchor`);
 for(const [mode,heading] of [['plain',plainExpected],['professional',proExpected]]) {
   const matches=m.getLessonBlocksWithSections(lesson,mode).filter(b=>b.anchorId===anchorId);
   assert.equal(matches.length,1,`${id}/${mode}: exactly one anchor`);
   assert.equal(matches[0].heading,heading,`${id}/${mode}: correct section heading`);
 }
}
assert.notEqual(m.getLessonSectionForQuestion('l7-services','review-syslog-25'),'in-depth-ntp-source-validity-rate','Syslog time-correlation must not link to NTP RATE section');


// Grok batch-02 FIX: exact semantic routes, not a misleading nearby NS or ECN topic.
for (const {id,lessonId,anchorId,plainKeyword,professionalKeyword} of [
  {id:'review-slaac-4',lessonId:'l3-ipv6',anchorId:'in-depth-slaac-ra-address-formation',plainKeyword:/RA|префикс/,professionalKeyword:/2001:db8:120::\/64/},
  {id:'review-qos-22',lessonId:'qos-basics',anchorId:'in-depth-dscp-classification-queue-congestion',plainKeyword:/DSCP/,professionalKeyword:/DSCP-to-class\/queue mapping/}
]) {
  const lesson=m.getLessonForQuestion(id);
  assert.equal(lesson?.id,lessonId,`${id} correct existing lesson`);
  assert.equal(m.getLessonSectionForQuestion(lessonId,id),anchorId,`${id} exact topical paragraph`);
  for(const [mode,check] of [['plain',plainKeyword],['professional',professionalKeyword]]) {
    const found=m.getLessonBlocksWithSections(lesson,mode).filter(block=>block.anchorId===anchorId);
    assert.equal(found.length,1,`${id} ${mode} exactly one anchor`);
    assert.match(found[0].body,check,`${id} ${mode} addresses actual question mechanism`);
  }
}
const slaacPlain=m.getLessonBlocksWithSections(m.getLesson('l3-ipv6'),'plain').find(x=>x.anchorId==='in-depth-slaac-ra-address-formation')?.body;
const qosPro=m.getLessonBlocksWithSections(m.getLesson('qos-basics'),'professional').find(x=>x.anchorId==='in-depth-dscp-classification-queue-congestion')?.body;
assert.match(slaacPlain,/не получает свой адрес из Neighbor Advertisement/,'SLAAC not confused with NS/NA address allocation');
assert.match(qosPro,/ECN\/CE относится к отдельному механизму/,'DSCP queues not confused with ECN signaling');

assert.equal(m.getLessonSectionForQuestion('l4-tcp','l4-03'),'in-depth-tcp-stream-record-framing','l4-03 links to its actual record-framing section');
const l403=m.getLesson('l4-tcp');
for(const mode of ['plain','professional']) {
  const block=m.getLessonBlocksWithSections(l403,mode).find(item=>item.anchorId==='in-depth-tcp-stream-record-framing');
  assert.ok(block,'l4-03 exact two-mode section exists');
  assert.match(block.body,/поток|stream/i,'l4-03 explains stream framing');
}
assert.equal(m.getLessonSectionForQuestion('ts-method','tr-03'),'indepth-dns-name-vs-address','tr-03 retains shared DNS/HTTP anchor');
const dnsPro=m.getLessonBlocksWithSections(m.getLesson('ts-method'),'professional').find(block=>block.anchorId==='indepth-dns-name-vs-address')?.body;
assert.ok(dnsPro,'tr-03 DNS pro section present');
assert.match(dnsPro,/HTTP по IP открывается/,'HTTP-by-IP observation is stated accurately');
assert.match(dnsPro,/ping по IP проходит/,'Separate ping-only observation preserved');
assert.doesNotMatch(dnsPro,/в данном билете исходный симптом — ping/,'Do not misdescribe HTTP question as a ping-only scenario');

// Real attempt selection must retain only assigned L2 IDs for all seeds.
for(let seed=1;seed<=100;seed++){let state=seed;const selected=m.getTestingQuestions('mixed',30,()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;},'in-depth');assert.equal(selected.length,30);assert.ok(selected.every(q=>assignedIds.includes(q.id)));}
mkdirSync('scripts/.cache/in-depth',{recursive:true});writeFileSync('scripts/.cache/in-depth/structural-verification.json',JSON.stringify({count:rows.length,rows,semanticPASS:false},null,2)+'\n');
// User-supplied Gemini Work 30-ID report + ChatGPT independent recheck (2026-11-20):
// Preserve source keys, replace generic filler, assert exact TWO-MODE lesson sections.
// These checks do NOT assert live browser navigation or approve semantic DONE.
for(const [id,expectedKey,lessonId,sectionId] of [
 ['l3-d08',0,'l3-route-selection','ecmp-flow-hash-order'],
 ['l4-03',2,'l4-tcp','in-depth-tcp-stream-record-framing'],
 ['l4-04',0,'l4-tcp','real-time-udp-delay-budget'],
 ['l4-d04',0,'l7-dns','in-depth-dns-tc-tcp-axfr-transport'],
 ['l4-lb-01',2,'l4-lb','in-depth-existing-l4-lb-01'],
 ['l4-x03',0,'l4-tcp','udp-latency-and-delivery'],
 ['l7-05',2,'l7-http-status-basics','in-depth-existing-l7-05'],
 ['l7-new-02',2,'l7-dns','edns-size-is-not-pmtu'],
 ['l7-new-03',0,'l7-dns','dnssec-signed-rrset'],
]) {
 const question=pool.find(q=>q.id===id);
 assert.ok(question,id+': Understanding membership retained');
 assert.deepEqual(question.correct,[expectedKey],id+': original correct key preserved');
 const lesson=m.getLessonForQuestion(id);
 assert.equal(lesson.id,lessonId,id+': lesson ID preserved');
 assert.equal(m.getLessonSectionForQuestion(lesson.id,id),sectionId,id+': exact section anchor preserved');
 for(const mode of ['plain','professional']){
   const section=m.getLessonBlocksWithSections(lesson,mode).find(x=>x.anchorId===sectionId);
   assert.ok(section?.body?.trim(),id+': exact '+mode+' section exists');
 }
}
for(const [id,tipMustMatch] of [
 ['l3-d08',/next hops.*счётчики/],
 ['l4-03',/TCP-трассу.*Seq[/]ACK/],
 ['l4-04',/RTP.*loss.*jitter/],
 ['l4-d04',/TC=1.*TCP[/]53/],
 ['l4-lb-01',/health-check.*503.*A[/]C/],
 ['l4-x03',/UDP.*RTP sequence/],
]) {
 const question=pool.find(q=>q.id===id);
 const tip=m.getQuestionDeepDive(question)?.practicalTip??'';
 assert.match(tip,tipMustMatch,id+': actionable topic-specific packet or configuration check');
 assert.doesNotMatch(tip,/^\x60ss -tulpn\x60|^Сначала линк|быстрый взгляд на шлюзы/,id+': no inherited generic filler');
}
for(const [id,trapMustMatch] of [
 ['l3-d08',/per-flow.*ECMP/],
 ['l4-x03',/UDP/],
 ['l7-new-02',/EDNS.*PMTU/],
 ['l7-new-03',/bogus.*insecure/],
]) {
 const q=pool.find(x=>x.id===id);
 const trap=m.getQuestionDeepDive(q)?.commonTrap??'';
 assert.match(trap,trapMustMatch,id+': question-specific misconception, not placeholder');
 assert.doesNotMatch(trap,/Смотрите точные формулировки стандартов и исключения/,id+': no generic template');
}
const httpLesson=m.getLesson('l7-http-status-basics');
const httpPro=m.getLessonBlocksWithSections(httpLesson,'professional').find(b=>b.anchorId==='in-depth-existing-l7-05')?.body??'';
assert.match(httpPro,/404 Not Found означает отсутствие текущего представления ресурса/,'HTTP 404 pro is Russian-language instruction');
assert.match(httpPro,/410 Gone/,'404 vs 410 meaning retained');
assert.doesNotMatch(httpPro,/404 Not Found conveys|Do not infer a server-wide failure/,'No untranslated original pro section');
const ednsPlain=m.getLessonBlocksWithSections(m.getLesson('l7-dns'),'plain').find(b=>b.anchorId==='edns-size-is-not-pmtu')?.body??'';
assert.match(ednsPlain,/UDP payload size=1232/,'EDNS buffer figure remains readable');
assert.doesNotMatch(ednsPlain,/size1232/,'No fused EDNS size');

// Six non-blocking typos from Gemini's other 25 PASS rows are also corrected.
for(const [id,mode,prohibited] of [
 ['l3-d04','professional',/входное TTL1/],
 ['l3-ospf-03','plain',/Type1|Type2/],
 ['l3-ospf-03','professional',/Type1|Type2/],
 ['l3-vrrp02','professional',/использует255/],
 ['l6-01','professional',/какD0 AF/],
 ['l7-01','professional',/RFC9110[/]9111/],
]) {
 const lesson=m.getLessonForQuestion(id);
 const anchor=m.getLessonSectionForQuestion(lesson.id,id);
 const section=m.getLessonBlocksWithSections(lesson,mode).find(b=>b.anchorId===anchor);
 assert.ok(section?.body,id+': exact lesson mode exists for typo test');
 assert.doesNotMatch(section.body,prohibited,id+': fixed Gemini-noted spacing');
}
assert.doesNotMatch(m.getQuestionDeepDive(pool.find(q=>q.id==='l4-lb-01'))?.briefAnswer??'',/HTTP503/,'HTTP 503 formatted properly');
const rtpTip=m.getQuestionDeepDive(pool.find(q=>q.id==='l4-04'))?.practicalTip??'';
assert.match(rtpTip,/межпакетные интервалы прихода \(Delta\)/,'Wireshark RTP Analysis measures interarrival delta');
assert.match(rtpTip,/воспроизведения.*отдельно на приёмнике/,'receiver playout not measurable in RTP pcap');
assert.doesNotMatch(rtpTip,/измерь.*интервалы воспроизведения/,'do not conflate Wireshark Delta with audio playout');


// Gemini App Work batch03 (50 questions): independent follow-up of 10 exact source defects.
// Original review SHA 1f273787370a64cf39732974b60c1706e538f5bb; these are
// source-content regression checks, NOT UI/browser or independent semantic DONE.
for(const [id,key,lessonId,sectionId,tipPattern] of [
 ['gen-diag-0',0,'l2-ethernet','in-depth-source-learning-observation',/VLAN[/]PVID.*Rx.*Source MAC/],
 ['gen-transport-14',2,'l7-monitoring-snmp-syslog','in-depth-snmp-trap-inform-roles',/SNMPv2-Trap.*UDP destination port 162/],
 ['gen-transport-16',0,'l4-directory-remote-industrial-ports','in-depth-rdp-udp-fallback',/TCP[/]3389.*UDP[/]3389/],
 ['gen-transport-17',1,'l4-directory-remote-industrial-ports','in-depth-modbus-mbap-vs-rtu',/Modbus TCP.*TCP[/]502.*MBAP/],
 ['gen-transport-5',1,'l7-mail-mx','in-depth-smtp-mx-delivery-port25',/MX.*TCP[/]25.*220/],
 ['gen-transport-7',1,'l7-dhcp','in-depth-dhcp-init-and-apipa',/DHCPDISCOVER.*UDP 68→67/],
 ['l12-storm01',0,'ts-copp-storm','in-depth-existing-l12-storm01',/storm-control.*счётчики подавления/],
 ['new-ts-duplex',0,'l2-ethernet','legacy-duplex-diagnosis',/speed[/]duplex.*CRC[/]FCS/],
 ['new-ts-vlan',0,'l2-vlan','in-depth-existing-new-ts-vlan',/VLAN[/]PVID.*ARP/],
]) {
 const q=pool.find(row=>row.id===id);
 assert.ok(q,id+': still present in exact Understanding level');
 assert.deepEqual(q.correct,[key],id+': original answer key untouched');
 const lesson=m.getLessonForQuestion(id);
 assert.equal(lesson?.id,lessonId,id+': original linked lesson intact');
 assert.equal(m.getLessonSectionForQuestion(lessonId,id),sectionId,id+': original exact section anchor intact');
 for(const mode of ['plain','professional']){
   const block=m.getLessonBlocksWithSections(lesson,mode).filter(b=>b.anchorId===sectionId);
   assert.equal(block.length,1,id+': exactly one linked '+mode+' lesson section');
   assert.ok(block[0].body.trim(),id+': '+mode+' section must be nonempty');
 }
 const dive=m.getQuestionDeepDive(q);
 assert.ok(dive?.briefAnswer && dive?.deepAnalysis && dive?.professional?.deep,id+': two individual explanation modes intact');
 assert.match(dive.practicalTip||'',tipPattern,id+': diagnostic tip must mention question-specific evidence');
 assert.doesNotMatch(dive.practicalTip||'',/Сначала линк \(L1[/]L2\), затем маршруты и DNS|ss -tulpn — слушающие сокеты/ ,id+': not inherited generic filler');
}
const ipv4Hop=pool.find(q=>q.id==='tcpip-d01');
assert.ok(ipv4Hop,'tcpip-d01: source question still present');
assert.deepEqual(ipv4Hop.correct,[0],'tcpip-d01: source answer key unchanged');
const ipv4Lesson=m.getLessonForQuestion('tcpip-d01');
assert.equal(ipv4Lesson?.id,'tcpip-encapsulation');
assert.equal(m.getLessonSectionForQuestion('tcpip-encapsulation','tcpip-d01'),'indepth-ipv4-router-rewrite');
for(const mode of ['plain','professional']) {
 assert.ok(m.getLessonBlocksWithSections(ipv4Lesson,mode).some(x=>x.anchorId==='indepth-ipv4-router-rewrite' && x.body?.trim()),'tcpip-d01 '+mode+' actual section');
}
const ipv4Dive=m.getQuestionDeepDive(ipv4Hop);
assert.match(ipv4Dive?.commonTrap||'',/TTL.*контрольную сумму.*MAC.*NAT/,'tcpip-d01: exact real IPv4 versus L2 and NAT trap');
assert.doesNotMatch(ipv4Dive?.commonTrap||'',/Смотрите точные формулировки стандартов и исключения/,'tcpip-d01: reject placeholder trap');
// Batch03 original tcp-06 has five answer choices; never truncate distractor evidence.
const fiveOption=pool.find(q=>q.id==='tcp-06');
assert.equal(fiveOption?.answers?.length,5,'tcp-06: preserve fifth original answer');

// Keep the addressed semantic regressions in the existing CI entry point.
await import('./gate06-targeted-semantic.test.mjs');
console.log('PASS: actual 164-ID Understanding pool; two-style lessons, links, active glossary and outside-level overlay isolation; independent semantic PASS still pending');

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
const gitRegistryBlob=createHash('sha1').update('blob '+Buffer.byteLength(registryRaw)+'\0').update(registryRaw).digest('hex');
assert.equal(gitRegistryBlob,'aa4682284e7803f1fbd4e930a6e154d71acc96af','Exact approved post-#258 registry; no reclassification');
assert.deepEqual(m.QUESTION_LEARNING_LEVELS,registry);
assert.equal(m.ALL_QUESTIONS.length,862);
const reconstructed=m.ALL_QUESTIONS.map(q=>m.PREVIOUS_IN_DEPTH_QUESTIONS[q.id]?{...q,answers:m.PREVIOUS_IN_DEPTH_QUESTIONS[q.id].answers}:q);
assert.equal(hash(reconstructed),baseline.bankSHA256,'Only four reviewed distractors and one corrected Wi-Fi option changed; stems, keys, order and all other records preserved');
assert.equal(new Set(m.IN_DEPTH_IDS).size,164);assert.equal(m.IN_DEPTH_IDS.length,164);assert.deepEqual([...m.IN_DEPTH_IDS].sort(),assignedIds,'Every ID has exactly one repair/review batch');
for(const batch of m.IN_DEPTH_BATCHES) {assert.ok(batch.questionIds.length>0&&batch.questionIds.length<=20,`Small batch ${batch.id}`);}
const approvedMainDrift=JSON.parse(readFileSync('docs/audits/in-depth/approved-main-outside-drift.json','utf8'));
assert.equal(approvedMainDrift.approvedMainCommit,'ddd8682cd7db71e994ae2ac29e08f4b1bc8c6f6f','Pinned current-main baseline');
const expectedDriftIds=approvedMainDrift.reasons.flatMap(reason=>reason.ids);
assert.deepEqual(new Set(expectedDriftIds).size,14,'Exactly twelve approved Applied and two photo fixes');
const expectedDrift=new Map(approvedMainDrift.changes.map(item=>[item.id,item]));
assert.deepEqual([...expectedDrift.keys()].sort(),[...expectedDriftIds].sort(),'No undocumented pre-existing main changes');
const historicalOutsideDrift=[];
for(const q of m.ALL_QUESTIONS.filter(q=>!assignedIds.includes(q.id))) {
  const dive=m.getQuestionDeepDive(q);
  const actual=hash(dive);
  const originalSnapshot=baseline.outsideLevelDeep[q.id];
  const expected=expectedDrift.get(q.id);
  assert.strictEqual(m.applyInDepthExplanation(q.id,dive,q),dive,`${q.id}: patch must preserve the identical object outside Understanding`);
  if(expected) {
    assert.equal(originalSnapshot,expected.previous,`${q.id}: provenance still matches frozen original Codex snapshot`);
    assert.equal(actual,expected.current,`${q.id}: post-#254/#258 approved main result changed unexpectedly`);
    historicalOutsideDrift.push(q.id);
  } else {
    assert.equal(actual,originalSnapshot,`${q.id}: unrelated levels must not regress`);
  }
}
assert.deepEqual(historicalOutsideDrift.sort(),[...expectedDrift.keys()].sort(),'No more out-of-level drifts than #254/#258');
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
  assert.ok(m.splitGlossaryText(term).some(s=>s.term===term || (term.toLowerCase()==='sack-permitted' && s.term?.toLowerCase()===term.toLowerCase())),`Actual matcher recognizes ${term} (IEC/TCP option case variants normalize)`);
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
console.log('PASS: actual164-ID Understanding pool; structural two-style lessons, links, active glossary, and 698 other-level deep dives unchanged; independent semantic PASS still pending');

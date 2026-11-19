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
assert.equal(pool.length,160);assert.deepEqual(pool.map(q=>q.id).sort(),assignedIds);assert.deepEqual(assignedIds,baseline.ids);
assert.deepEqual(m.getLearningLevelPool('mixed',2).map(q=>q.id),pool.map(q=>q.id));
assert.equal(hash(m.QUESTION_LEARNING_LEVELS),baseline.registrySHA256,'No reclassification or registry changes');
assert.equal(m.ALL_QUESTIONS.length,862);
const reconstructed=m.ALL_QUESTIONS.map(q=>m.PREVIOUS_IN_DEPTH_QUESTIONS[q.id]?{...q,answers:m.PREVIOUS_IN_DEPTH_QUESTIONS[q.id].answers}:q);
assert.equal(hash(reconstructed),baseline.bankSHA256,'Only four reviewed distractors and one corrected Wi-Fi option changed; stems, keys, order and all other records preserved');
assert.equal(new Set(m.IN_DEPTH_IDS).size,160);assert.equal(m.IN_DEPTH_IDS.length,160);assert.deepEqual([...m.IN_DEPTH_IDS].sort(),assignedIds,'Every ID has exactly one repair/review batch');
for(const batch of m.IN_DEPTH_BATCHES) {assert.ok(batch.questionIds.length>0&&batch.questionIds.length<=20,`Small batch ${batch.id}`);}
for(const q of m.ALL_QUESTIONS.filter(q=>!assignedIds.includes(q.id))) assert.equal(hash(m.getQuestionDeepDive(q)),baseline.outsideLevelDeep[q.id],`Do not rework other levels: ${q.id}`);
for(const id of Object.keys(m.IN_DEPTH_PATCHES))assert.ok(assignedIds.includes(id),`No content patches outside L2 ${id}`);
for(const id of Object.keys(m.IN_DEPTH_LESSON_LINKS))assert.ok(assignedIds.includes(id),`No links outside L2 ${id}`);
const rows=[];
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
    for(const term of (mode==='plain'?lesson.terms:lesson.professional.terms)) assert.ok(m.GLOSSARY[term]?.description?.trim(),`${lesson.id}/${mode}: active tag ${term}`);
  }
  rows.push({id:q.id,lessonId:lesson.id,anchor:anchor??null,individual:true,plain:true,professional:true,semantic:'REQUIRES_INDEPENDENT_REVIEW'});
}
for(const [term] of Object.entries(m.IN_DEPTH_TERMS)) {
  assert.ok(m.GLOSSARY[term]?.description&&m.GLOSSARY[term]?.relatesTo,`Useful definition/context: ${term}`);
  assert.ok(m.GLOSSARY_TOOLTIPS[term]?.english&&m.GLOSSARY_TOOLTIPS[term]?.russian&&m.GLOSSARY_TOOLTIPS[term]?.summary,`Tooltip metadata ${term}`);
  assert.ok(m.splitGlossaryText(term).some(s=>s.term===term),`Actual matcher recognizes ${term}`);
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
// Real attempt selection must retain only assigned L2 IDs for all seeds.
for(let seed=1;seed<=100;seed++){let state=seed;const selected=m.getTestingQuestions('mixed',30,()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;},'in-depth');assert.equal(selected.length,30);assert.ok(selected.every(q=>assignedIds.includes(q.id)));}
mkdirSync('scripts/.cache/in-depth',{recursive:true});writeFileSync('scripts/.cache/in-depth/structural-verification.json',JSON.stringify({count:rows.length,rows,semanticPASS:false},null,2)+'\n');
console.log('PASS: actual160-ID L2 pool; full individual pack and two-style lesson resolver; exact anchors; active glossary; all702 other-level deep dives unchanged; no semantic PASS inferred');

import assert from 'node:assert/strict';
import { scan,gate } from './learning-quality/model.mjs';
const plain='A useful, individual explanation sufficiently detailed to distinguish two concepts and explain why this answer follows.';
const seed={questions:[{id:'q1',text:'Choose the correct Ethernet behaviour',answers:['Correct','Wrong'],correct:[0],deep:{briefAnswer:plain,deepAnalysis:plain,hasIndividualDeep:true,professional:{deep:plain+' Advanced constraints.'}},lessonId:'l1'}],lessons:[{id:'l1',title:'Ethernet',summary:plain,terms:['Ethernet'],blocks:[{heading:'Ethernet',body:plain,practiceLink:'cli'}],relatedQuestionIds:['q1'],professional:{summary:plain+' Professional',terms:['Ethernet'],blocks:[{heading:'Ethernet',body:plain+' Pro'}]}}],glossary:{Ethernet:{description:plain,relatesTo:'Layer 2',lessonId:'l1'}},tooltips:{Ethernet:{summary:plain,english:'Ethernet',russian:'Ethernet'}},practice:{cli:{simulator:'cli',scenarioId:'s1'}},scenarios:['s1']};
const split=text=>text.split(/(Ethernet)/g).filter(Boolean).map(text=>({text,...(text==='Ethernet'?{term:'Ethernet'}:{})}));
const baseline=scan(seed,split);
function review(row){return {id:'independent-'+row.id,materialId:row.id,contentHash:row.contentHash,dependencyHash:row.dependencyHash,candidateDigest:row.candidateDigest,scope:'whole-material',result:'PASS',author:'author',reviewer:'independent',evidence:['test fixture only'],criteria:Object.fromEntries(['technical','beginner','answerConsistency','lessonRelevance','terminology'].map(k=>[k,'Fixture reviewed'])),candidateDecisions:row.candidates.map(c=>({token:c.token,path:c.path,decision:'not-a-learning-term',reason:'Synthetic fixture prose only'}))};}
const check=(name,mutate,expected)=>{const data=structuredClone(seed);mutate(data);const report=scan(data,split);const result=gate(report,baseline,report.rows.map(review));assert.ok(result.failures.some(f=>f.code===expected),`${name}: ${JSON.stringify(result)}`);console.log('PASS mutation:',name);};
assert.equal(gate(baseline,baseline).status,'PASS','Unrelated UI/CLI does not block on legacy review');
assert.throws(()=>gate(baseline,null),/valid base/);
check('invalid answer index',d=>d.questions[0].correct=[20],'ANSWER_KEY');
check('missing pro',d=>delete d.questions[0].deep.professional,'MISSING_PRO');
check('missing plain',d=>d.questions[0].deep.deepAnalysis='','MISSING_PLAIN');
check('missing why',d=>d.questions[0].deep.briefAnswer='','MISSING_WHY');
check('bad lesson ID',d=>d.questions[0].lessonId='absent','BROKEN_LESSON');
check('prototype name is not a glossary tag',d=>d.lessons[0].terms.push('constructor'),'BROKEN_TAG');
check('prototype name is not a practice destination',d=>d.lessons[0].blocks[0].practiceLink='toString','BROKEN_PRACTICE');
check('broken raw hashtag',d=>d.lessons[0].terms.push('Absent'),'BROKEN_TAG');
check('missing translation metadata',d=>delete d.tooltips.Ethernet.russian,'MISSING_TOOLTIP');
check('missing glossary context',d=>delete d.glossary.Ethernet.relatesTo,'MISSING_GLOSSARY_CONTEXT');
check('broken trainer',d=>d.lessons[0].trainers=[{label:'x',target:'broken'}],'BROKEN_TRAINER');
check('missing tooltip',d=>delete d.tooltips.Ethernet,'MISSING_TOOLTIP');
check('broken practice link',d=>d.lessons[0].blocks[0].practiceLink='absent','BROKEN_PRACTICE');
check('broken CLI scenario',d=>d.practice.cli.scenarioId='absent','BROKEN_SCENARIO');
check('deletion cannot evade gate',d=>d.questions=[],'DELETED_MATERIAL_REQUIRES_REVIEW');
check('duplicate ID',d=>d.questions.push(d.questions[0]),'DUPLICATE_ID');
const dead=scan(seed,t=>[{text:t}]);assert.ok(dead.rows.find(r=>r.id==='glossary:Ethernet').diagnostics.some(d=>d.code==='DEAD_TOOLTIP'));assert.equal(gate(dead,baseline).status,'FAIL','Dependency-only matcher regression blocks');
const altered=structuredClone(seed);altered.lessons[0].title='PSK PMKID UnregisteredTerm';
const report=scan(altered,split);assert.ok(report.rows.find(r=>r.id==='lesson:l1').candidates.some(c=>c.path==='title'&&c.token==='PSK'));
assert.ok(report.rows.find(r=>r.id==='lesson:l1').candidates.some(c=>c.token==='UnregisteredTerm'));
assert.equal(gate(report,baseline).status,'FAIL','Raw title change requires independent review');
const receipts=report.rows.map(review);assert.equal(gate(report,baseline,receipts).status,'PASS');
for(const tweak of [r=>r.reviewer=r.author,r=>r.contentHash='stale',r=>r.dependencyHash='stale',r=>r.candidateDigest='stale',r=>r.scope='changed-claims',r=>r.evidence=[],r=>r.candidateDecisions=[]]) {
  const invalid=structuredClone(receipts);invalid.forEach(tweak);assert.equal(gate(report,baseline,invalid).status,'FAIL','No stale/self/partial reviews');
}
const glossaryChange=structuredClone(seed);glossaryChange.glossary.Ethernet.description+=' Updated.';
const dependency=scan(glossaryChange,split,baseline.rows.map(review));
assert.equal(dependency.rows.find(r=>r.id==='lesson:l1').semantic,'REVIEW','Dependency changes invalidate prior semantic review');
const trivial=structuredClone(seed);delete trivial.questions[0].deep.professional;trivial.questions[0].lessonId=null;
const trivialReport=scan(trivial,split),trivialReceipts=trivialReport.rows.map(review);
Object.assign(trivialReceipts.find(r=>r.materialId==='question:q1'),{triviality:'obvious-fact',exceptionReason:'Synthetic fixture explicit independent determination',exceptions:['MISSING_PRO','MISSING_LESSON']});
assert.equal(gate(trivialReport,baseline,trivialReceipts).status,'PASS','Only exact-ID independently reviewed trivial exceptions');
for(const exceptions of ['MISSING_PRO,MISSING_LESSON',['MISSING_PRO','ANSWER_KEY'],['MISSING_PRO','MISSING_PRO']]) {const malformed=structuredClone(trivialReceipts);malformed.find(r=>r.materialId==='question:q1').exceptions=exceptions;assert.equal(gate(trivialReport,baseline,malformed).status,'FAIL','Exception schema fails closed');}
const dangerous=structuredClone(trivial);dangerous.questions[0].correct=[999];const bad=scan(dangerous,split),badReceipts=bad.rows.map(review);Object.assign(badReceipts.find(r=>r.materialId==='question:q1'),{triviality:'photo-identification',exceptionReason:'Cannot waive answer key',exceptions:['ANSWER_KEY']});assert.ok(gate(bad,baseline,badReceipts).failures.some(f=>f.code==='ANSWER_KEY'));
assert.equal(scan(dangerous,split,badReceipts).rows.find(r=>r.id==='question:q1').semantic,'REVIEW','Unresolved structural failure never receives semantic PASS');
console.log('PASS: raw discovery, differential scope, destructive changes, independent review schema and dependency invalidation');
// Real exit-code contract used by CI, without corrupting production fixtures.
if(process.argv.includes('--broken-fixture')) {
  const broken=structuredClone(seed);broken.questions[0].correct=[999];
  const result=gate(scan(broken,split),baseline);
  console.error(JSON.stringify(result));process.exit(result.status==='FAIL'?1:0);
}

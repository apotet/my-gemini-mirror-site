import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';
import { readFileSync } from 'node:fs';
const {ALL_QUESTIONS,prepareAttemptQuestions,restoreSession,previousInDepthSnapshot,PREVIOUS_IN_DEPTH_QUESTIONS,serializeReview,restoreReview,reviewRows,getQuestionDeepDive}=await bundleEntry('scripts/in-depth-history-entry.ts','in-depth-history.mjs');
const before=JSON.stringify(ALL_QUESTIONS);
const fixture=(questions,extra={})=>({questions,mode:'mixed',difficulty:'in-depth',learningLevel:2,feedbackMode:'exam',currentIndex:0,isCompleted:false,startTime:1000,attemptId:'l2-old-attempt',progressEpoch:'l2-history',userAnswers:Object.fromEntries(questions.map(q=>[q.id,[q.correct[0]]])),submittedQuestions:Object.fromEntries(questions.map(q=>[q.id,true])),...extra});
for(const previous of Object.values(PREVIOUS_IN_DEPTH_QUESTIONS)) {
  const current=ALL_QUESTIONS.find(q=>q.id===previous.id);if(previous.id==='wifi-std-04'){assert.ok(getQuestionDeepDive(previous).briefAnswer.includes('Сохранены прежняя'));assert.ok(!getQuestionDeepDive(current).briefAnswer.includes('Сохранены прежняя'));}assert.deepEqual(current.correct,previous.correct);if(previous.id!=='wifi-std-04')assert.deepEqual(current.correct.map(i=>current.answers[i]),previous.correct.map(i=>previous.answers[i]));assert.equal(current.text,previous.text);
  for(const shuffled of [false,true]) {
    const prepared=shuffled?prepareAttemptQuestions([previous],()=>0.2):{questions:[previous]};
    const saved=fixture(prepared.questions,shuffled?{answerOrders:prepared.answerOrders}:{});
    const snapshot=JSON.stringify(saved),restored=restoreSession(snapshot,ALL_QUESTIONS,2000);
    assert.ok(restored,`${previous.id}: old ${shuffled?'shuffled':'legacy'} restores`);
    assert.deepEqual(restored.questions,prepared.questions,`${previous.id}: historical option labels/keys retained`);
    assert.deepEqual(restored.userAnswers,saved.userAnswers);assert.equal(JSON.stringify(saved),snapshot,'No snapshot mutation');
    const completed={...restored,isCompleted:true,endTime:1900};const serialized=serializeReview(completed);const review=restoreReview(serialized,'l2-history');assert.ok(review);assert.equal(reviewRows(review)[0].status,'correct','Past score remains correct');assert.equal(serializeReview(review),serialized,'Completed review is byte-stable');
    if(shuffled) {const bad=structuredClone(saved);bad.questions[0].answers[1]+=' INVALID';assert.equal(restoreSession(JSON.stringify(bad),ALL_QUESTIONS,2000),null,'Unknown shuffled bank drift still rejected');}
  }
  const fresh=prepareAttemptQuestions([current],()=>0.2),freshSession=fixture(fresh.questions,{answerOrders:fresh.answerOrders});
  const restoredFresh=restoreSession(JSON.stringify(freshSession),ALL_QUESTIONS,2000);assert.deepEqual(restoredFresh.questions,fresh.questions,'New options not mistaken for historical ones');
  assert.equal(previousInDepthSnapshot(current,{...previous,correct:[1]}),undefined,'Never accept a fabricated historical key');
}
assert.equal(JSON.stringify(ALL_QUESTIONS),before,'Bank and answer keys not mutated');
console.log('PASS: three exact historical option sets, legacy/shuffled/current attempts and completed reviews; strict unknown-drift rejection; no correct-index/score migration');

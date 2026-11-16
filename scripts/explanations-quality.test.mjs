import { ALL_QUESTIONS } from '../src/data/questionsData.ts';
import { getQuestionDeepDive } from '../src/data/questionExplanations.ts';

let failed = 0;
const errors = [];

for (const q of ALL_QUESTIONS) {
  const expl = (q.explanation || '').trim();
  if (expl.length === 0) {
    failed++;
    errors.push(`${q.id}: empty explanation`);
  }
  if (expl.length > 0 && expl.length < 30) {
    failed++;
    errors.push(`${q.id}: explanation too short (${expl.length})`);
  }
  // crude template check: explanation almost equals correct answer
  const correct = q.answers?.[q.correct?.[0]] || '';
  if (expl && correct && expl.toLowerCase().includes(correct.toLowerCase().slice(0, 25)) && expl.length < 80) {
    failed++;
    errors.push(`${q.id}: explanation largely restates the answer`);
  }
}

if (failed > 0) {
  console.error(`FAILED: ${failed} issues`);
  console.error(errors.slice(0, 20).join('\n'));
  process.exit(1);
}
console.log(`PASS: ${ALL_QUESTIONS.length} questions checked, no empty/short/restating explanations`);

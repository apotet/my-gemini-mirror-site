import { ALL_QUESTIONS } from '../src/data/questionsData.ts';
import { getQuestionDeepDive } from '../src/data/questionExplanations.ts';

let failed = 0;
const errors = [];
const warnings = [];

for (const q of ALL_QUESTIONS) {
  const expl = (q.explanation || '').trim();
  if (expl.length === 0) {
    failed++;
    errors.push(`${q.id}: empty explanation`);
  }
  if (expl.length > 0 && expl.length < 20) {
    failed++;
    errors.push(`${q.id}: extremely short (${expl.length})`);
  }
  const correct = q.answers?.[q.correct?.[0]] || '';
  if (expl && correct && expl.length < 60 && expl.toLowerCase().includes(correct.toLowerCase().slice(0, 18))) {
    warnings.push(`${q.id}: possibly restates answer`);
  }
  const dd = getQuestionDeepDive(q);
  if (dd.hasIndividualDeep && (!dd.briefAnswer || !dd.deepAnalysis)) {
    failed++;
    errors.push(`${q.id}: hasIndividualDeep but missing brief/deep`);
  }
}

if (warnings.length) {
  console.log(`WARNINGS (${warnings.length}):`);
  console.log(warnings.slice(0, 15).join('\n'));
}

if (failed > 0) {
  console.error(`FAILED: ${failed} issues`);
  console.error(errors.slice(0, 30).join('\n'));
  process.exit(1);
}
console.log(`PASS: ${ALL_QUESTIONS.length} questions checked (hard fails: empty/short/missing deep; warnings: ${warnings.length})`);

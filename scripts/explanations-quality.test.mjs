import { ALL_QUESTIONS } from '../src/data/questionsData.ts';

let failed = 0;
const errors = [];

for (const q of ALL_QUESTIONS) {
  const expl = (q.explanation || '').trim();
  if (expl.length === 0) {
    failed++;
    errors.push(`${q.id}: empty explanation`);
  }
  if (expl.length > 0 && expl.length < 20) {
    failed++;
    errors.push(`${q.id}: explanation extremely short (${expl.length})`);
  }
}

if (failed > 0) {
  console.error(`FAILED: ${failed} issues`);
  console.error(errors.slice(0, 30).join('\n'));
  process.exit(1);
}
console.log(`PASS: ${ALL_QUESTIONS.length} questions checked — no empty or extremely short explanations`);

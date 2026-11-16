import { bundleEntry, writeJson } from './load-bank.mjs';
const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion, GLOSSARY } = await bundleEntry('scripts/learning-coverage-entry.ts', 'learning-coverage.mjs');
const glossary = new Set(Object.keys(GLOSSARY).map(s => s.toUpperCase()));
const candidates = text => [...new Set((String(text ?? '').match(/\b[A-Z][A-Z0-9-]{2,}\b/g) ?? []).filter(s => !glossary.has(s)))];
const rows = ALL_QUESTIONS.map(q => {
  const d = getQuestionDeepDive(q);
  const lesson = getLessonForQuestion(q.id);
  const texts = [q.question ?? q.text, ...(q.answers ?? []), d.briefAnswer, d.deepAnalysis, d.professional?.deep];
  return { id: q.id, why: !!d.briefAnswer?.trim(), plain: !!d.deepAnalysis?.trim(),
    pro: !!d.professional?.deep?.trim(), lessonId: lesson?.id ?? null,
    candidateTerms: [...new Set(texts.flatMap(candidates))] };
});
if (new Set(rows.map(r => r.id)).size !== rows.length) throw new Error('Duplicate IDs');
const summary = { questions: rows.length, why: rows.filter(r=>r.why).length,
  plain: rows.filter(r=>r.plain).length, pro: rows.filter(r=>r.pro).length,
  lessons: rows.filter(r=>r.lessonId).length, withCandidateTerms: rows.filter(r=>r.candidateTerms.length).length };
writeJson('docs/audits/learning-coverage-latest.json', { summary, rows, caveats: [
  'Candidates are NOT confirmed errors; context review required.',
  'Lesson text, hashtags, tooltip rendering and semantic links NOT checked yet.',
  'Inventory only; not a required merge check.' ] });
console.log(summary);

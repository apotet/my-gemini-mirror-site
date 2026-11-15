import { writeFileSync, mkdirSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';
const { ALL_QUESTIONS, QUESTION_LEARNING_LEVELS, LESSONS, GLOSSARY, getQuestionDeepDive } = await bundleEntry('scripts/lesson-coverage-entry.ts', 'lesson-coverage-bundle.mjs');
const byQuestion = new Map();
for (const lesson of LESSONS) for (const id of lesson.relatedQuestionIds) {
  if (!byQuestion.has(id)) byQuestion.set(id, []);
  byQuestion.get(id).push(lesson);
}
const bankIds = new Set(ALL_QUESTIONS.map(q => q.id));
const glossaryKeys = new Set(Object.keys(GLOSSARY));
const rows = ALL_QUESTIONS.map(question => {
  const lessons = byQuestion.get(question.id) || [];
  const dive = getQuestionDeepDive(question);
  const metadata = QUESTION_LEARNING_LEVELS[question.id];
  const plain = Boolean(dive.plain?.trim() || dive.deepAnalysis?.trim());
  const pro = Boolean(dive.pro?.trim() || dive.professional?.deep?.trim());
  const missingTerms = [...new Set(lessons.flatMap(l => [...l.terms, ...(l.professional?.terms || [])]))].filter(term => !glossaryKeys.has(term));
  const missingLessonPro = lessons.filter(l => !l.professional).map(l => l.id);
  const status = !lessons.length ? 'NEW_LESSON_OR_LINK' : (!plain || !pro || missingLessonPro.length || missingTerms.length ? 'FIX' : 'PASS');
  return { questionId: question.id, level: metadata?.learningLevel ?? null, review: metadata?.status === 'REVIEW', lessonIds: lessons.map(l => l.id), plain, pro, missingLessonPro, missingTerms, practice: Boolean(dive.practiceLink || lessons.some(l => l.trainers?.length || l.blocks.some(b => b.practiceLink))), status };
});
const dangling = LESSONS.flatMap(l => l.relatedQuestionIds.filter(id => !bankIds.has(id)).map(id => ({ lessonId:l.id, questionId:id })));
const summary = { questions: rows.length, lessons: LESSONS.length, status: Object.fromEntries(['PASS','FIX','NEW_LESSON_OR_LINK'].map(s=>[s,rows.filter(r=>r.status===s).length])), highLevels: rows.filter(r=>r.level>=4), review:rows.filter(r=>r.review), dangling };
mkdirSync('docs/audits/generated',{recursive:true});
writeFileSync('docs/audits/generated/lesson-coverage.json', JSON.stringify({summary:{...summary,highLevels:undefined,review:undefined},rows},null,2)+'\n');
writeFileSync('docs/audits/generated/lesson-coverage.md', ['# Аудит покрытия билетов уроками','', 'Автоматический структурный отчёт. PASS не означает ручную проверку качества содержания. Отсутствие практики само по себе не ошибка.','',...Object.entries(summary.status).map(([k,v])=>'- '+k+': '+v),'- Уроков: '+LESSONS.length,'- Билетов L4/L5: '+summary.highLevels.length,'- REVIEW: '+summary.review.length,'- Битых ссылок урок → билет: '+dangling.length,'','## Сложные вопросы с пробелами','', '| ID | Уровень | Статус | Уроки | Plain/Pro |','|---|---|---|---|---|',...summary.highLevels.filter(r=>r.status!=='PASS').map(r=>'| '+r.questionId+' | '+r.level+' | '+r.status+' | '+(r.lessonIds.join(', ')||'—')+' | '+r.plain+'/'+r.pro+' |'),'','## Ограничения','- Наличие plain/pro проверено структурно, без оценки правильности и полноты.','- Урок может покрывать билет по ID, но не по смыслу: требуется ручной аудит.','- Словарь проверяется по списку terms урока; все аббревиатуры в свободном тексте не извлекаются.','- Экспертные кейсы как отдельный тип пока не моделируются.',''].join('\n'));
console.log(JSON.stringify({counts:summary.status,highLevelGaps:summary.highLevels.filter(r=>r.status!=='PASS').length,dangling:dangling.length},null,2));

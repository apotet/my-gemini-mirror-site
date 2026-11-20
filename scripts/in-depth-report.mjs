import { bundleEntry, writeJson } from './load-bank.mjs';
import { createHash } from 'node:crypto';
const m=await bundleEntry('scripts/in-depth-entry.ts','in-depth-report.mjs');
const expand=lesson=>lesson?({...lesson,blocks:m.getLessonBlocksWithSections(lesson,'plain'),professional:lesson.professional?{...lesson.professional,blocks:m.getLessonBlocksWithSections(lesson,'professional')}:undefined}):null;
const rows=m.getTestingPool('mixed','in-depth').map(question=>{
  const deep=m.getQuestionDeepDive(question),lesson=m.getLessonForQuestion(question.id),expanded=expand(lesson);
  const strings=value=>typeof value==='string'?[value]:value&&typeof value==='object'?Object.values(value).flatMap(strings):[];
  const glossaryTerms=[...new Set(strings({question,deep,lesson:expanded}).flatMap(text=>m.splitGlossaryText(text).flatMap(s=>s.term?[s.term]:[])).concat(expanded?.terms??[],expanded?.professional?.terms??[]))].sort();
  const definitions=Object.fromEntries(glossaryTerms.map(term=>[term,{entry:m.GLOSSARY[term],tooltip:m.GLOSSARY_TOOLTIPS[term]}]));
  return {id:question.id,question,deep,lessonId:lesson?.id??null,anchor:m.getLessonSectionForQuestion(lesson?.id??'',question.id)??null,
    hasIndividual:deep.hasIndividualDeep,hasPro:Boolean(deep.professional?.deep?.trim()),
    lessonHasBothStyles:Boolean(lesson?.blocks?.length&&lesson?.professional?.blocks?.length),glossaryTerms,
    materialHash:createHash('sha256').update(JSON.stringify({question,deep,lesson:expanded,definitions})).digest('hex')};
});
const lessonIds=new Set(rows.map(r=>r.lessonId));
const lessons=m.LESSONS.filter(l=>lessonIds.has(l.id)).map(l=>({...l,blocks:m.getLessonBlocksWithSections(l,'plain'),professional:l.professional?{...l.professional,blocks:m.getLessonBlocksWithSections(l,'professional')}:undefined}));
const summary={questions:rows.length,individual:rows.filter(r=>r.hasIndividual).length,professional:rows.filter(r=>r.hasPro).length,linked:rows.filter(r=>r.lessonId).length,twoStyleLesson:rows.filter(r=>r.lessonHasBothStyles).length,anchors:rows.filter(r=>r.anchor).length,batches:m.IN_DEPTH_BATCHES.map(b=>({id:b.id,title:b.title,count:b.questionIds.length})),semanticAcceptance:'NOT_INFERRED_FROM_STRUCTURE'};
writeJson('scripts/.cache/in-depth/current-materials.json',{summary,rows,lessons,glossary:m.GLOSSARY,tooltips:m.GLOSSARY_TOOLTIPS});
console.log(JSON.stringify(summary,null,2));

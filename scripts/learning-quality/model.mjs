import { createHash } from 'node:crypto';
export const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const present = s => typeof s === 'string' && s.trim().length > 0;
export function strings(value, path = '') {
  if (typeof value === 'string') return [{ path, text: value }];
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, v]) => strings(v, path ? `${path}.${key}` : key));
}
export function snapshot(m, scenarioIds = []) {
  return { questions: m.ALL_QUESTIONS.map(q => ({ ...q, deep: m.getQuestionDeepDive(q), lessonId: m.getLessonForQuestion(q.id)?.id ?? null })),
    lessons: m.LESSONS, glossary: m.GLOSSARY, tooltips: m.GLOSSARY_TOOLTIPS, practice: m.PRACTICE_DESTINATIONS,
    scenarios: scenarioIds };
}
export function scan(data, splitText, receipts = []) {
  const rows = [], occurrences = new Map();
  const questionIds = new Set(data.questions.map(q => q.id)), lessonIds = new Set(data.lessons.map(l => l.id));
  const glossaryKeys = Object.keys(data.glossary);
  const canonical = new Map(glossaryKeys.map(k => [k.toLowerCase(), k]));
  const add = (kind, id, value) => {
    const row = { id: `${kind}:${id}`, kind, contentHash: hash(value), diagnostics: [], candidates: [], dependencies: [], semantic: 'REVIEW' };
    row.error = (code, path, message) => row.diagnostics.push({code, path, message, severity:'ERROR'});
    row.observe = (code, path, message) => row.diagnostics.push({code, path, message, severity:'REVIEW'});
    rows.push(row); return row;
  };
  const raw = (row, value) => {
    for (const {path,text} of strings(value)) {
      // Scan source prose, including headings/answers; IDs, URLs and code are retained as
      // low-confidence candidates, never promoted to confirmed terminology errors.
      const tokens = [...text.matchAll(/(?<![\p{L}\p{N}_])[A-Za-z][A-Za-z0-9]*(?:[-/+.][A-Za-z0-9]+)*(?![\p{L}\p{N}_])/gu)];
      const segments = splitText(text);
      for (const match of tokens) {
        const token = match[0];
        if (token.length < 2) continue;
        const known = canonical.get(token.toLowerCase());
        let offset = 0;
        const covered = segments.some(s => {const start = offset; offset += s.text.length; return s.term && match.index >= start && match.index + token.length <= offset;});
        if (!known && !covered) row.candidates.push({ token, path, kind: /^[A-Z][A-Z0-9/-]+$/.test(token) ? 'acronym' : 'english', context: text.slice(Math.max(0, match.index-45),match.index+token.length+65) });
        if (known && !covered && !/(?:\.cmd$|sources(?:\.|$)|sourceCommit$)/.test(path)) row.observe('TERM_MATCHER_GAP',path,token);
      }
      for (const part of segments.filter(s => s.term)) {
        row.dependencies.push(`glossary:${part.term}`);
        occurrences.set(part.term,(occurrences.get(part.term) ?? 0)+1);
      }
      for (const match of text.matchAll(/#lesson-([A-Za-z0-9_-]+)/g)) { if (!lessonIds.has(match[1])) row.error('BROKEN_ANCHOR',path,match[0]); }
      for (const match of text.matchAll(/https?:\/\/[^\s)<>"\]]+/g)) {
        try { new URL(match[0]); } catch {row.error('INVALID_URL',path,match[0]);}
      }
    }
  };
  const practice = (row, value, path) => {
    if (value && !data.practice[value]) row.error('BROKEN_PRACTICE',path,value);
    if (value && data.practice[value]) row.dependencies.push(`practice:${value}`);
  };
  const counts = new Map();
  for (const q of data.questions) {
    const row = add('question',q.id,q);
    counts.set(row.id,(counts.get(row.id) ?? 0)+1);
    if (!present(q.id) || !present(q.text) || !Array.isArray(q.answers) || q.answers.length < 2 || q.answers.some(a => !present(a))) row.error('QUESTION_STRUCTURE','question','Missing ID, stem or answers');
    if (!Array.isArray(q.correct) || !q.correct.length || new Set(q.correct).size !== q.correct.length || q.correct.some(i => !Number.isInteger(i) || i < 0 || i >= (q.answers?.length ?? 0))) row.error('ANSWER_KEY','correct','Invalid answer indices');
    for (const [name,text] of [['WHY',q.deep?.briefAnswer],['PLAIN',q.deep?.deepAnalysis],['PRO',q.deep?.professional?.deep]]) {
      if (!present(text)) row.error(`MISSING_${name}`,`deep.${name}`,'Required explanation missing');
      else if (text.trim().length < 60) row.observe(`SHORT_${name}`,`deep.${name}`,'Content needs contextual review; length is not proof of quality');
    }
    if (!q.deep?.hasIndividualDeep) row.observe('GENERATED_EXPLANATION','deep','Generic explanation needs independent review');
    if (present(q.deep?.professional?.deep) && q.deep.professional.deep.trim() === q.deep.deepAnalysis?.trim()) row.error('DUPLICATE_LEVELS','deep','Plain and pro are identical');
    if (!q.lessonId) row.error('MISSING_LESSON','lessonId','Relevant lesson required unless ID-specific reviewed exception');
    else if (!lessonIds.has(q.lessonId)) row.error('BROKEN_LESSON','lessonId',q.lessonId);
    else row.dependencies.push(`lesson:${q.lessonId}`);
    raw(row,{text:q.text,answers:q.answers,explanation:q.explanation,remember:q.remember,imageAlt:q.imageAlt,deep:Object.fromEntries(Object.entries(q.deep ?? {}).filter(([key])=>!['category','hasIndividualDeep','source','sourceCommit'].includes(key)))});
    practice(row,q.deep?.practiceLink,'deep.practiceLink');
  }
  for (const lesson of data.lessons) {
    const row = add('lesson',lesson.id,lesson); counts.set(row.id,(counts.get(row.id) ?? 0)+1);
    if (!present(lesson.id) || !present(lesson.title)) row.error('LESSON_STRUCTURE','title','Missing ID/title');
    for (const [mode,content] of [['plain',lesson],['pro',lesson.professional]]) {
      if (!content || !present(content.summary) || !content.blocks?.length || content.blocks.some(b => !present(b.heading) || !present(b.body))) row.error(`MISSING_${mode.toUpperCase()}_BLOCKS`,mode,'Summary and nonempty blocks required');
      for (const term of content?.terms ?? []) {
        if (!data.glossary[term]) row.error('BROKEN_TAG',`${mode}.terms`,term);
        else {row.dependencies.push(`glossary:${term}`); occurrences.set(term,(occurrences.get(term) ?? 0)+1);}
      }
      for (const [i,b] of (content?.blocks ?? []).entries()) practice(row,b.practiceLink,`${mode}.blocks.${i}.practiceLink`);
    }
    if (lesson.professional && lesson.summary === lesson.professional.summary && hash(lesson.blocks) === hash(lesson.professional.blocks)) row.error('DUPLICATE_LEVELS','professional','Plain/pro content identical');
    for (const id of lesson.relatedQuestionIds ?? []) {
      if (!questionIds.has(id)) row.error('BROKEN_QUESTION','relatedQuestionIds',id);
    }
    if (!lesson.relatedQuestionIds?.length) row.observe('NO_QUESTION_BACKLINK','relatedQuestionIds','Review relevance/entry points');
    if (!(lesson.blocks ?? []).some(b=>b.practiceLink) && !lesson.trainers?.length && !(lesson.professional?.blocks ?? []).some(b=>b.practiceLink)) row.observe('NO_PRACTICE','blocks','Review whether relevant practice exists; not required automatically');
    for (const trainer of lesson.trainers ?? []) if (!['ipv4','cli','practice'].includes(trainer.target)) row.error('BROKEN_TRAINER','trainers',trainer.target);
    raw(row,{title:lesson.title,summary:lesson.summary,terms:lesson.terms,blocks:lesson.blocks,commands:lesson.commands,sources:lesson.sources,professional:lesson.professional});
  }
  for (const [term,entry] of Object.entries(data.glossary)) {
    const row = add('glossary',term,{entry,tooltip:data.tooltips[term]});
    if (!present(entry.relatesTo)) row.error('MISSING_GLOSSARY_CONTEXT','relatesTo',term);
    if (!present(entry.description)) row.error('EMPTY_GLOSSARY','description',term);
    if (!['summary','english','russian'].every(k=>present(data.tooltips[term]?.[k]))) row.error('MISSING_TOOLTIP','tooltip',term);
    if (!splitText(term).some(s=>s.term?.toLowerCase()===term.toLowerCase())) row.error('DEAD_TOOLTIP','tooltip',term);
    if (!occurrences.has(term)) row.observe('UNUSED_GLOSSARY','usage',term);
    if (entry.lessonId && !lessonIds.has(entry.lessonId)) row.error('BROKEN_LESSON','lessonId',entry.lessonId);
    if (entry.lessonId && lessonIds.has(entry.lessonId)) row.dependencies.push(`lesson:${entry.lessonId}`);
    raw(row,{description:entry.description,relatesTo:entry.relatesTo});
  }
  for (const [id,destination] of Object.entries(data.practice)) {
    const row=add('practice',id,destination);
    if (!['journey','vlan','protocols','cli'].includes(destination.simulator)) row.error('INVALID_SIMULATOR','simulator',destination.simulator);
    if (destination.simulator === 'cli' && !data.scenarios.includes(destination.scenarioId)) row.error('BROKEN_SCENARIO','scenarioId',destination.scenarioId);
    if (destination.simulator === 'protocols' && !['dhcp','nat','tcp'].includes(destination.protocol)) row.error('INVALID_PROTOCOL','protocol',destination.protocol);
  }
  const byId = new Map(rows.map(r=>[r.id,r]));
  for (const row of rows) {
    if ((counts.get(row.id) ?? 0)>1) row.error('DUPLICATE_ID','id',row.id);
    row.dependencies=[...new Set(row.dependencies)].sort();
    row.candidates=[...new Map(row.candidates.map(c=>[JSON.stringify(c),c])).values()];
    row.candidateDigest=hash(row.candidates);
    const reachable=new Set(),pending=[...row.dependencies];
    while(pending.length) {const id=pending.pop();if(id===row.id || reachable.has(id)) continue;reachable.add(id);pending.push(...(byId.get(id)?.dependencies ?? []));}
    row.dependencyHash=hash([...reachable].sort().map(id=>[id,byId.get(id)?.contentHash ?? null]));
    row.technical=row.diagnostics.some(d=>d.severity==='ERROR')?'FAIL':'CHECKED';
    const receipt=receipts.find(r=>validReceipt(r,row));
    if(receipt) row.semantic=receipt.scope==='whole-material'?'PASS':'REVIEW';
    row.reviewReceipt=receipt?.id ?? null;
    delete row.error; delete row.observe;
  }
  const categories={};
  for(const row of rows) for(const d of row.diagnostics) categories[d.code]=(categories[d.code]??0)+1;
  return { schemaVersion:1, summary:{questions:data.questions.length,lessons:data.lessons.length,glossary:Object.keys(data.glossary).length,practice:Object.keys(data.practice).length,technicalErrors:rows.flatMap(r=>r.diagnostics).filter(d=>d.severity==='ERROR').length,candidateOccurrences:rows.reduce((n,r)=>n+r.candidates.length,0),semanticPass:rows.filter(r=>r.semantic==='PASS').length,categories},rows,
    limits:['CHECKED means structural checks executed, never semantic correctness.','Raw terminology candidates include code/English ordinary words: independent contextual disposition required. TERM_MATCHER_GAP is a candidate, not proof of broken rendered UI.','External HTTP reachability is not checked; URL syntax only.','Navigation/tooltip behavior requires browser suite; inventory is not browser evidence.'] };
}
export function validReceipt(receipt,row) {
  return receipt?.id && receipt.materialId===row.id && receipt.contentHash===row.contentHash && receipt.dependencyHash===row.dependencyHash && receipt.candidateDigest===row.candidateDigest && receipt.author && receipt.reviewer && receipt.author!==receipt.reviewer && receipt.scope==='whole-material' && receipt.result==='PASS' && Array.isArray(receipt.evidence) && receipt.evidence.length>0 && receipt.evidence.every(present) && ['technical','beginner','answerConsistency','lessonRelevance','terminology'].every(k=>present(receipt.criteria?.[k])) && Array.isArray(receipt.candidateDecisions) && receipt.candidateDecisions.length===row.candidates.length && receipt.candidateDecisions.every((d,i)=>d.path===row.candidates[i].path && d.token===row.candidates[i].token && ['defined-in-context','not-a-learning-term','defined-interactively'].includes(d.decision) && present(d.reason));
}
const signature=d=>JSON.stringify(d);
export function gate(head,base,receipts=[]) {
  if(!base?.rows) throw new Error('A valid base snapshot is required; gate fails closed');
  const previous=new Map(base.rows.map(r=>[r.id,r])), current=new Map(head.rows.map(r=>[r.id,r]));
  const failures=[],changed=[];
  for(const row of head.rows) {
    const old=previous.get(row.id),direct=!old || old.contentHash!==row.contentHash;
    if(direct) {
      changed.push(row.id);
      for(const d of row.diagnostics.filter(d=>d.severity==='ERROR')) failures.push({id:row.id,code:d.code,path:d.path});
      if(!receipts.some(r=>validReceipt(r,row))) failures.push({id:row.id,code:'INDEPENDENT_REVIEW_REQUIRED'});
    } else {
      const oldErrors=new Set(old.diagnostics.filter(d=>d.severity==='ERROR').map(signature));
      for(const d of row.diagnostics.filter(d=>d.severity==='ERROR' && !oldErrors.has(signature(d)))) failures.push({id:row.id,code:d.code,path:d.path});
    }
  }
  for(const row of base.rows) if(!current.has(row.id)) {
    // Destructive learning deletions need review too; cannot evade the gate by deleting an ID.
    failures.push({id:row.id,code:'DELETED_MATERIAL_REQUIRES_REVIEW'});
  }
  return {status:failures.length?'FAIL':'PASS',changed,failures,scope:'Directly changed content: complete pack and current whole-material independent review. Unchanged legacy: only new structural regressions block. Dependency changes invalidate semantic receipts.'};
}

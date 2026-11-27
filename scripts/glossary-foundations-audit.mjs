/** Reproducible lexical census, not a semantic approval of authored prose. */
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { build } from 'esbuild';

mkdirSync('scripts/.cache', { recursive: true });
await build({
  stdin: { contents: `
    export * from './scripts/in-depth-entry';
    export * from './src/utils/explanationFormat';
    export * from './src/utils/lessonGlossaryScope';
  `, resolveDir: process.cwd() },
  outfile: 'scripts/.cache/glossary-foundations-audit.mjs',
  platform: 'node', format: 'esm', bundle: true,
});
const {
  ALL_QUESTIONS, LESSONS, QUESTION_LEARNING_LEVELS, GLOSSARY_TOOLTIPS, getQuestionDeepDive, getLessonForQuestion,
  getLessonGlossaryScope, getLessonBlocksWithSections, splitGlossaryText, formatExplanation, formatInlineExplanation,
} = await import('./.cache/glossary-foundations-audit.mjs');

const questions = ALL_QUESTIONS.filter(q => QUESTION_LEARNING_LEVELS[q.id]?.learningLevel === 1);
const linkedLessonIds = new Set(questions.flatMap(q => getLessonForQuestion(q.id)?.id ?? []));
const counts = {
  questions: questions.length, questionsWithProfessional: 0, questionSegments: 0,
  linkedLessons: linkedLessonIds.size, linkedLessonSegments: 0, otherLessonSegments: 0,
  allLessons: LESSONS.length, lessonsWithProfessional: 0, codeSegmentsNotMatched: 0, injectedLessonBlocks: 0,
  formulaSegments: 0, tooltipTokens: 0, definitions: Object.keys(GLOSSARY_TOOLTIPS).length,
};
const sightings = {};
const equation = /^(?:ΔU = I × R|Pпотерь = I² × R)$/;
const splitEquation = /(ΔU = I × R|Pпотерь = I² × R)/g;
const plainHeadingIds = new Set(['l1-poe-injectors-splitters', 'l7-http-status-basics', 'l1-poe-screen-reading']);

function inspect(text, bucket, scope, origin) {
  if (!text?.trim()) return;
  counts[bucket]++;
  if (scope === 'poe-formula') counts.formulaSegments++;
  const parts = splitGlossaryText(text, scope);
  assert.equal(parts.map(part => part.text).join(''), text, origin + ': round-trip');
  for (const part of parts) {
    if (!part.term) continue;
    counts.tooltipTokens++;
    assert.ok(GLOSSARY_TOOLTIPS[part.term]?.summary, origin + ': ' + part.term);
    if (/^(?:passive )?power over ethernet|^power sourcing equipment$|^powered device$/iu.test(part.text)) {
      const key = part.term + ':' + part.text;
      (sightings[key] ??= new Set()).add(origin);
    }
  }
}
function formatted(text, bucket, scope, origin) {
  if (!text?.trim()) return;
  for (const block of formatExplanation(text)) {
    if (block.kind === 'code') { counts.codeSegmentsNotMatched++; continue; }
    for (const syntaxText of block.kind === 'list' ? block.items : [block.text]) {
      for (const segment of formatInlineExplanation(syntaxText)) {
        if (segment.code) { counts.codeSegmentsNotMatched++; continue; }
        const segments = scope === 'poe' ? segment.text.split(splitEquation) : [segment.text];
        for (const part of segments) inspect(part, bucket, scope === 'poe' && equation.test(part) ? 'poe-formula' : scope, origin);
      }
    }
  }
}

for (const q of questions) {
  const explanation = getQuestionDeepDive(q);
  const scope = getLessonGlossaryScope(getLessonForQuestion(q.id)?.id);
  const bucket = 'questionSegments';
  formatted(explanation.briefAnswer, bucket, scope, q.id + '/brief');
  formatted(explanation.deepAnalysis, bucket, scope, q.id + '/plain');
  if (explanation.professional?.deep?.trim()) {
    counts.questionsWithProfessional++;
    formatted(explanation.professional.deep, bucket, scope, q.id + '/professional');
    formatted(explanation.professional.notice, bucket, scope, q.id + '/notice');
    if (explanation.glossaryInProfessional) inspect(explanation.professional.trap, bucket, scope, q.id + '/professional-trap');
  }
  inspect(explanation.commonTrap, bucket, scope, q.id + '/plain-trap');
  inspect(explanation.practicalTip, bucket, undefined, q.id + '/practical-tip');
  for (const tip of explanation.keyTakeaways) inspect(tip, bucket, undefined, q.id + '/takeaway');
}

for (const lesson of LESSONS) {
  const bucket = linkedLessonIds.has(lesson.id) ? 'linkedLessonSegments' : 'otherLessonSegments';
  const scope = getLessonGlossaryScope(lesson.id);
  if (!plainHeadingIds.has(lesson.id)) inspect(lesson.title, bucket, scope, lesson.id + '/title');
  if (lesson.professional) counts.lessonsWithProfessional++;
  for (const [mode, content] of [['plain', lesson], ['professional', lesson.professional]]) {
    if (!content) continue;
    const origin = lesson.id + '/' + mode;
    if (lesson.id === 'l1-poe-budget' && content === lesson.professional && content.summary.includes('IEEE 802.3af/at/bt')) {
      for (const text of content.summary.split('IEEE 802.3af/at/bt')) inspect(text, bucket, undefined, origin + '/summary');
    } else if (lesson.id !== 'l1-poe-injectors-splitters') formatted(content.summary, bucket, scope, origin + '/summary');
    const renderedBlocks = getLessonBlocksWithSections(lesson, mode);
    counts.injectedLessonBlocks += Math.max(0, renderedBlocks.length - content.blocks.length);
    for (const [i, block] of renderedBlocks.entries()) {
      if (!plainHeadingIds.has(lesson.id)) inspect(block.heading, bucket, scope, origin + '/heading-' + i);
      formatted(block.body, bucket, scope, origin + '/body-' + i);
    }
    for (const command of content.commands ?? []) {
      counts.codeSegmentsNotMatched++;
      inspect(command.note, bucket, scope, origin + '/command-note');
    }
    const check = mode === 'plain' ? lesson.plainKnowledgeCheck ?? lesson.knowledgeCheck : lesson.knowledgeCheck;
    if (scope) for (const q of check?.questions ?? []) inspect(q.explanation, bucket, scope, origin + '/feedback-' + q.id);
  }
}
assert.ok(questions.length && counts.linkedLessonSegments && counts.otherLessonSegments);
console.log(JSON.stringify({ ...counts, confirmedExpansions: Object.fromEntries(Object.entries(sightings).map(([k, sites]) => [k, [...sites]])) }, null, 2));

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';

const m = await bundleEntry('scripts/in-depth-entry.ts', 'l3-tcp-options-integration.mjs');
const id = 'l4-tcp-options-keepalive';
const file = 'l3-tcp-wscale-keepalive.svg';
const routes = [
  ['l4-new-06', 'tcp-window-scale-negotiation', [2], [/1000 байт/, /SYN-ACK/, /не масштабируется|множитель не применяется/i]],
  ['l4-new-08', 'tcp-keepalive-idle-peer', [3], [/один пропуск ответа|один неотвеченный зонд/i, /HTTP\/2 PING/, /Health Checking/]],
];
const lesson = m.getLesson(id);
assert.equal(lesson.difficulty, 'applied');
assert.deepEqual(lesson.relatedQuestionIds, routes.map(([qid]) => qid));
assert.equal(m.LESSONS.filter(l => l.id === id).length, 1);

for (const [qid, anchor, correct, concepts] of routes) {
  const question = m.ALL_QUESTIONS.find(q => q.id === qid);
  assert.equal(m.QUESTION_LEARNING_LEVELS[qid]?.learningLevel, 3);
  assert.deepEqual(question.correct, correct, `${qid}: bank answer preserved`);
  assert.equal(m.getLessonForQuestion(qid)?.id, id, `${qid}: exact routed lesson`);
  assert.deepEqual(m.LESSONS.filter(l => l.relatedQuestionIds.includes(qid)).map(l => l.id), [id], `${qid}: single owner`);
  assert.equal(m.getLessonSectionForQuestion(id, qid), anchor);
  for (const mode of ['plain', 'professional']) {
    const matching = m.getLessonBlocksWithSections(lesson, mode).filter(block => block.anchorId === anchor);
    assert.equal(matching.length, 1, `${qid}/${mode}: one real anchor`);
    for (const concept of concepts) assert.match(matching[0].body, concept, `${qid}/${mode}: relevant evidence`);
  }
}

for (const [term, owner] of [['Window Scale', 'tcp-window-retransmit'], ['TCP Keepalive', id]]) {
  assert.equal(m.GLOSSARY[term]?.lessonId, owner);
  assert.deepEqual(m.splitGlossaryText(term), [{ text: term, term }]);
  assert.ok(m.GLOSSARY_TOOLTIPS[term]?.summary);
  const normalized = term.toLowerCase().replace(/[\s-]/g, '');
  const matches = obj => Object.keys(obj).filter(key => key.toLowerCase().replace(/[\s-]/g, '') === normalized);
  assert.deepEqual(matches(m.GLOSSARY), [term]);
  assert.deepEqual(matches(m.GLOSSARY_TOOLTIPS), [term]);
}
assert.match(m.GLOSSARY_TOOLTIPS['Window Scale'].summary, /сдвиг/i);

for (const section of [lesson, lesson.professional]) {
  for (const block of section.blocks) {
    if (block.relatedLesson) assert.ok(m.getLesson(block.relatedLesson.id));
  }
  const matching = section.blocks.filter(block => block.cheatsheet?.file === file);
  assert.equal(matching.length, 1);
  assert.ok(matching[0].cheatsheet.alt.trim());
}
const svg = readFileSync(new URL(`../public/lesson-images/${file}`, import.meta.url), 'utf8');
assert.match(svg, /<svg\b/);
assert.match(svg, /Window в SYN и SYN-ACK читается без масштаба/);
assert.match(svg, /Один пропущенный ответ не доказывает обрыв/);
assert.doesNotMatch(svg, /<script\b|<foreignObject\b|\bon\w+\s*=|(?:xlink:)?href\s*=/i);

assert.equal(lesson.plainKnowledgeCheck.questions.length, 3);
assert.equal(lesson.knowledgeCheck.questions.length, 6);
const ids = new Set();
for (const item of [...lesson.plainKnowledgeCheck.questions, ...lesson.knowledgeCheck.questions]) {
  assert.ok(!ids.has(item.id), `${item.id}: unique self-check ID`);
  ids.add(item.id);
  const choices = item.choices.map(choice => choice.id);
  assert.equal(choices.length, 4);
  assert.equal(new Set(choices).size, 4);
  assert.ok(choices.includes(item.correctChoiceId));
  assert.ok(item.explanation.trim());
  assert.ok(!m.ALL_QUESTIONS.some(question => question.id === item.id), 'not in the exam bank');
}
console.log('PASS: 2 exact Applied anchors × 2 modes, canonical Window Scale, 1 static diagram, 9 unscored self-checks');

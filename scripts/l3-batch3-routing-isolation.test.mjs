import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';

const m = await bundleEntry('scripts/in-depth-entry.ts', 'l3-batch3-routing-isolation.mjs');
const pbr = 'l3-linux-policy-routing';
const pvlan = 'l2-port-isolation-pvlan';
const routes = [
  ['ts-pack1-11', pbr, 'linux-ip-route-get-from', /ip route get 198\.51\.100\.20 from 192\.0\.2\.10/],
  ['ts-pack1-13', pbr, 'linux-ip-rule-table-priority', /default dev eth1/],
  ['ts-pack1-12', pvlan, 'l2-port-isolation-matrix', /рол(?:ь|ями) порт(?:а|ов)/],
];

for (const [question, id, anchor, topic] of routes) {
  assert.ok(m.ALL_QUESTIONS.some(q => q.id === question), question);
  assert.equal(m.getLessonForQuestion(question)?.id, id, question);
  assert.deepEqual(m.LESSONS.filter(l => l.relatedQuestionIds.includes(question)).map(l => l.id), [id], question);
  assert.equal(m.getLessonSectionForQuestion(id, question), anchor, question);
  for (const mode of ['plain', 'professional']) {
    const blocks = m.getLessonBlocksWithSections(m.getLesson(id), mode).filter(b => b.anchorId === anchor);
    assert.equal(blocks.length, 1, `${question}/${mode}`);
    assert.match(blocks[0].body, topic);
  }
}

const files = { [pbr]: 'l3-linux-pbr-ip-rule.svg', [pvlan]: 'l3-port-isolation-pvlan.svg' };
const checkIds = new Set();
for (const [id, file] of Object.entries(files)) {
  const lesson = m.getLesson(id);
  assert.equal(lesson.difficulty, 'applied');
  for (const mode of [lesson, lesson.professional]) {
    assert.ok(mode.blocks.some(b => b.cheatsheet?.file === file && b.cheatsheet.alt.length > 0));
  }
  assert.match(readFileSync(`public/lesson-images/${file}`, 'utf8'), /<svg\b/);
  for (const q of [...lesson.plainKnowledgeCheck.questions, ...lesson.knowledgeCheck.questions]) {
    assert.ok(!checkIds.has(q.id), q.id);
    checkIds.add(q.id);
    assert.equal(q.choices.length, 4);
    assert.equal(new Set(q.choices.map(c => c.id)).size, 4);
    assert.ok(q.choices.some(c => c.id === q.correctChoiceId));
    assert.ok(q.explanation.trim());
  }
}
assert.equal(checkIds.size, 12);
for (const [term, id] of Object.entries({ PBR: pbr, 'Policy Routing': pbr, 'Port Isolation': pvlan, 'Private VLAN': pvlan })) {
  assert.equal(m.GLOSSARY[term]?.lessonId, id);
  assert.deepEqual(m.splitGlossaryText(term), [{ text: term, term }]);
  assert.ok(m.GLOSSARY_TOOLTIPS[term]?.summary);
}
console.log('PASS: 3 canonical routes × 2 modes, 4 glossary entries, 2 diagrams and 12 self-checks');

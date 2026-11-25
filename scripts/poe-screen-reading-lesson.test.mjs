import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const { getLesson } = await bundleEntry('scripts/in-depth-entry.ts', 'poe-screen-reading-lesson-check.mjs');
const lesson = getLesson('l1-poe-screen-reading');
assert.ok(lesson, 'PoE screen-reading lesson is registered');
assert.ok(lesson.professional, 'Professional reading mode exists');
assert.notEqual(lesson.summary, lesson.professional.summary, 'Reading modes have distinct summaries');
assert.deepEqual(lesson.osiLayers, ['L1'], 'Lesson scope matches the physical powering content');

assert.deepEqual(lesson.blocks.map(block => block.heading), [
  'PSE предлагает питание, PD его принимает',
  'Что можно узнать по наклейке и дисплею',
  'Класс задаёт предел, а не текущий расход',
  'Как проверить питание под нагрузкой',
  'Как избежать ложного вывода',
], 'Plain mode keeps existing anchors and adds class/load diagnostics');
assert.deepEqual(lesson.professional.blocks.map(block => block.heading), [
  'PoE detection/classification',
  'Измерение и диагностика',
  'Кейс: камера перезагружается при включении ИК',
  'Passive PoE и безопасность измерения',
], 'Professional mode keeps existing anchors and adds load/passive-PoE diagnostics');

const plainText = lesson.blocks.map(block => block.body).join('\n');
const proText = lesson.professional.blocks.map(block => block.body).join('\n');
for (const text of [plainText, proText]) {
  for (const concept of ['Requested Class', 'Received Class', 'Unloaded Voltage', 'TruePower', 'PSE Type 1/2']) {
    assert.ok(text.includes(concept), `Both reading modes explain ${concept}`);
  }
}
for (const concept of ['коротком заведомо исправном восьмижильном', 'пассивного PoE', 'неизвестный источник']) {
  assert.ok(plainText.toLowerCase().includes(concept.toLowerCase()), `Plain mode covers ${concept}`);
}
for (const concept of ['ΔU = I × R', 'allocated/remaining', 'power-deny', 'passive-источник']) {
  assert.ok(proText.includes(concept), `Professional mode covers ${concept}`);
}

const allBlocks = [...lesson.blocks, ...lesson.professional.blocks];
const linkedIds = allBlocks.map(block => block.relatedLesson?.id).filter(Boolean);
for (const id of ['l1-poe-budget', 'cli-poe-diagnostics', 'l1-poe-injectors-splitters']) {
  assert.ok(linkedIds.includes(id), `Missing outgoing lesson link: ${id}`);
  assert.ok(getLesson(id), `Outgoing lesson link resolves: ${id}`);
}
assert.ok(allBlocks.every(block => !block.cheatsheet || block.cheatsheet.file === 'poe-standards-cheatsheet.svg'),
  'Lesson reuses the existing responsive PoE standards chart');

const expectedKeys = {
  plain: ['B', 'A', 'C'],
  pro: ['B', 'C', 'A', 'D', 'B'],
};
for (const [mode, check] of [['plain', lesson.plainKnowledgeCheck], ['pro', lesson.knowledgeCheck]]) {
  assert.ok(check, `${mode} self-check exists`);
  assert.equal(check.questions.length, expectedKeys[mode].length, `${mode} self-check question count`);
  const ids = check.questions.map(question => question.id);
  assert.equal(new Set(ids).size, ids.length, `${mode} self-check IDs are unique`);
  assert.deepEqual(check.questions.map(question => question.correctChoiceId), expectedKeys[mode], `${mode} answer keys`);
  for (const question of check.questions) {
    assert.equal(question.choices.length, 4, `${question.id}: four choices`);
    assert.equal(new Set(question.choices.map(choice => choice.id)).size, 4, `${question.id}: unique choice IDs`);
    assert.ok(question.choices.some(choice => choice.id === question.correctChoiceId), `${question.id}: valid answer key`);
    assert.ok(question.prompt.trim().length > 25, `${question.id}: substantive prompt`);
    assert.ok(question.explanation.trim().length > 35, `${question.id}: substantive explanation`);
  }
}

assert.deepEqual(lesson.relatedQuestionIds, [
  'l1v2-a-poe-class',
  'l1v2-a-poe-limit',
  'l1v2-a-poe-purpose',
  'l1v2-c-poe-standard',
  'review-poe-29',
  'l1v2-a-poe-connection',
  'l1v2-a-poe-unloaded',
  'l1v2-c-splitter-role',
  'review-poe-30',
], 'Original seven exam links and both in-depth links remain unchanged');
assert.ok(lesson.sources.some(source => source.includes('NetAlly')), 'Instrument-specific fields cite the NetAlly guide');
assert.ok(lesson.professional.sources.some(source => source.includes('NetAlly')), 'Professional mode retains the instrument source');

console.log('PASS: PoE screen-reading two modes, 3+5 self-check, safe diagnostics, links and exam mapping');

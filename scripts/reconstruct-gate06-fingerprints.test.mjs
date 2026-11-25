import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { materialFor, compare } from './reconstruct-gate06-fingerprints.mjs';

const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function fixture() {
  const question = { id: 'diagnostic-fixture', text: 'Z A', answers: ['one', 'two'], correct: [0] };
  const deep = { plain: 'A', professional: { deep: 'Z' } };
  const lesson = { id: 'fixture-lesson', blocks: ['raw'], terms: ['Z', 'missing'], professional: { blocks: ['raw-pro'], terms: ['A'] } };
  const m = { getQuestionDeepDive: () => deep, getLessonForQuestion: () => lesson,
    getLessonBlocksWithSections: (_, mode) => mode === 'plain' ? ['expanded'] : ['expanded-pro'],
    splitGlossaryText: text => ['A', 'Z'].filter(t => text.includes(t)).map(term => ({ term })),
    GLOSSARY: { A: { definition: 'Alpha' }, Z: { definition: 'Zeta' } }, GLOSSARY_TOOLTIPS: { Z: 'tooltip Z' } };
  return { question, deep, lesson, m };
}

test('serialization exactly mirrors original in-depth-report formula, expanded modes and sorted deduplicated terms', () => {
  const { question, deep, lesson, m } = fixture();
  const expanded = { ...lesson, blocks: ['expanded'], professional: { ...lesson.professional, blocks: ['expanded-pro'] } };
  const definitions = {
    A: { entry: m.GLOSSARY.A, tooltip: undefined },
    Z: { entry: m.GLOSSARY.Z, tooltip: 'tooltip Z' },
    missing: { entry: undefined, tooltip: undefined },
  };
  const actual = materialFor(m, question);
  assert.equal(actual.materialHash, sha({ question, deep, lesson: expanded, definitions }));
  assert.equal(actual.questionDeepHash, sha({ question, deep }));
  assert.equal(actual.sharedContextHash, sha({ lesson: expanded, definitions }));
});

test('missing lesson is null and absent professional is omitted rather than normalized', () => {
  const { question, deep, m } = fixture();
  m.getLessonForQuestion = () => undefined;
  assert.equal(materialFor(m, question).materialHash, sha({ question, deep, lesson: null,
    definitions: { A: { entry: m.GLOSSARY.A, tooltip: undefined }, Z: { entry: m.GLOSSARY.Z, tooltip: 'tooltip Z' } } }));
});

test('shared-context changes do not contaminate questionDeepHash', () => {
  const { question, m } = fixture();
  const before = materialFor(m, question);
  m.GLOSSARY.A.definition = 'Changed definition';
  const after = materialFor(m, question);
  assert.equal(before.questionDeepHash, after.questionDeepHash);
  assert.notEqual(before.sharedContextHash, after.sharedContextHash);
  assert.notEqual(before.materialHash, after.materialHash);
});

test('direct changes alter questionDeepHash independently of unchanged shared context', () => {
  const { question, deep, m } = fixture();
  const before = materialFor(m, question);
  deep.plain = 'A revised';
  const after = materialFor(m, question);
  assert.notEqual(before.questionDeepHash, after.questionDeepHash);
  assert.equal(before.sharedContextHash, after.sharedContextHash);
});

test('comparison records absent IDs separately and tolerates historical pools other than164', () => {
  const result = compare([{ id: 'a', materialHash: '1' }, { id: 'b', materialHash: '2' }, { id: 'c', materialHash: '3' }],
    [{ id: 'a', materialHash: '1' }, { id: 'b', materialHash: 'changed' }, { id: 'new', materialHash: '4' }]);
  assert.equal(result.matched, 1); assert.equal(result.mismatched, 1); assert.equal(result.missing, 1);
  assert.equal(result.found, 2); assert.deepEqual(result.missingIds, ['c']);
});

test('duplicate resolved IDs fail closed', () => {
  assert.throws(() => compare([], [{ id: 'a' }, { id: 'a' }]), /Duplicate/);
});

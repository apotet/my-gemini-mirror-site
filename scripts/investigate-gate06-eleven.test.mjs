import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hash } from './reconstruct-gate06-fingerprints.mjs';
import { IDS, differencePaths, keyOrderPaths, normalized } from './investigate-gate06-eleven.mjs';

test('addressed scope is exactly the eleven unresolved IDs, without duplicates', () => {
  assert.equal(IDS.length, 11); assert.equal(new Set(IDS).size, 11);
  assert.deepEqual(IDS.slice(-5), ['wifi-std-01', 'wifi-std-04', 'wifi-roam-01', 'wifi-sec-01', 'wifi-sec-05']);
});
test('diagnostic differences distinguish changed values from JSON key order', () => {
  assert.deepEqual(differencePaths({ a: 1, b: 2 }, { b: 2, a: 1 }), ['.[key-order]']);
  assert.deepEqual(differencePaths({ deep: { plain: 'before' } }, { deep: { plain: 'after' } }), ['deep.plain']);
  assert.deepEqual(differencePaths(normalized({ deep: { a: undefined } }), { deep: {} }), []);
  assert.deepEqual(keyOrderPaths({ a: 1, b: 2 }, { b: 3, a: 4 }), ['']);
});
test('recovered actual payloads reproduce immutable REVIEW hashes and all component hashes', () => {
  const recovered = JSON.parse(readFileSync(new URL('../docs/audits/in-depth/gate06-eleven-recovered-materials-20261123.json', import.meta.url)));
  const ledger = JSON.parse(readFileSync(new URL('../docs/audits/in-depth/final-review-4.json', import.meta.url)));
  assert.equal(recovered.purpose, 'FORENSIC_COMPONENT_RECONSTRUCTION_NOT_GIT_FREEZE');
  for (const bundle of recovered.sourceBundles) assert.equal(bundle.gitCommit, null);
  assert.equal(recovered.materials.length, 11);
  assert.deepEqual(recovered.materials.map(row => row.id), IDS);
  for (const row of recovered.materials) {
    const historical = ledger.rows.find(r => r.id === row.id);
    assert.ok(IDS.includes(row.id)); assert.equal(historical.status, 'REVIEW');
    assert.deepEqual(row.to188cKeyOrderPaths, []); assert.equal(row.definitionsKeysMatch188c, true);
    assert.equal(hash(row.payload), historical.materialHash); assert.equal(row.materialHash, historical.materialHash);
    const { question, deep, lesson, definitions } = row.payload;
    assert.equal(hash({ question, deep }), row.questionDeepHash);
    assert.equal(hash({ lesson, definitions }), row.sharedContextHash);
    const altered = structuredClone(row.payload);
    altered.deep.deepAnalysis = `${altered.deep.deepAnalysis ?? ''} diagnostic mutation`;
    assert.notEqual(hash(altered), historical.materialHash);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateInDepthFingerprintPolicy } from './in-depth-review-policy.mjs';
const H='a'.repeat(64), J='b'.repeat(64);
const current=(id,hash=H)=>({id,currentHash:hash});
const audited=(id,status='PASS',hash=H,semanticStatus='PASS')=>({id,status,materialHash:hash,semanticStatus});

test('exact independently accepted material can pass',()=>{
  const p=evaluateInDepthFingerprintPolicy([current('one')],[audited('one')]);
  assert.equal(p.status,'PASS'); assert.equal(p.pass,true);
});
test('new unreviewed ID blocks even when existing material matches',()=>{
  const p=evaluateInDepthFingerprintPolicy([current('one'),current('two')],[audited('one')]);
  assert.equal(p.status,'BLOCK'); assert.deepEqual(p.newlyUnreviewedIds,['two']);
});
test('changed reviewed material blocks even with historical PASS',()=>{
  const p=evaluateInDepthFingerprintPolicy([current('one',J)],[audited('one')]);
  assert.equal(p.status,'BLOCK'); assert.deepEqual(p.changedIds,['one']);
});
test('historical REVIEW cannot be silently promoted by semanticStatus or hash equality',()=>{
  const p=evaluateInDepthFingerprintPolicy([current('one')],[audited('one','REVIEW',H,'PASS')]);
  assert.equal(p.status,'BLOCK'); assert.deepEqual(p.unresolvedStatusIds,[{id:'one',status:'REVIEW'}]);
});
test('missing or failed review statuses block',()=>{
  const p=evaluateInDepthFingerprintPolicy([current('one'),current('two')],[audited('one','FIX'),{id:'two',materialHash:H,semanticStatus:'PASS'}]);
  assert.equal(p.status,'BLOCK'); assert.equal(p.unresolvedStatusIds.length,2);
});
test('disappeared audited ID cannot be replaced by a new ID unnoticed',()=>{
  const p=evaluateInDepthFingerprintPolicy([current('two')],[audited('one')]);
  assert.equal(p.status,'BLOCK'); assert.deepEqual(p.missingHistoricalIds,['one']); assert.deepEqual(p.newlyUnreviewedIds,['two']);
});
test('duplicate IDs or missing hash are hard errors',()=>{
  assert.throws(()=>evaluateInDepthFingerprintPolicy([current('one'),current('one')],[audited('one')]));
  assert.throws(()=>evaluateInDepthFingerprintPolicy([current('one','')],[audited('one')]));
});

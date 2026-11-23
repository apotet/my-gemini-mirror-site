import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateInDepthFingerprintPolicy } from './in-depth-review-policy.mjs';
import { readFileSync } from 'node:fs';
import { evaluateCloseoutAcceptancePolicy, DIRECT_AUDIT_IDS } from './in-depth-review-policy.mjs';
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

const registryText=readFileSync(new URL('../docs/audits/in-depth/closeout-acceptance-20261124.json',import.meta.url),'utf8');
const acceptance=JSON.parse(registryText);
const acceptedCurrent=()=>acceptance.rows.map(row=>({id:row.id,currentHash:row.materialHash}));
const editRegistry=edit=>{const copy=structuredClone(acceptance);edit(copy);return JSON.stringify(copy,null,2)+'\n';};
const check=(rows=acceptedCurrent(),text=registryText)=>evaluateCloseoutAcceptancePolicy(rows,text);
const blocked=result=>{assert.equal(result.status,'BLOCK');assert.equal(result.pass,false);};

test('owner-approved immutable registry accepts exactly 164 IDs: seven direct and 157 policy',()=>{
  const p=check();assert.equal(p.status,'PASS');assert.equal(p.pass,true);
  assert.deepEqual(p.counts,{current:164,accepted:164,directAudit:7,closeoutPolicy:157});
  assert.deepEqual(acceptance.rows.filter(r=>r.status==='PASS_DIRECT_AUDIT').map(r=>r.id).sort(),[...DIRECT_AUDIT_IDS].sort());
});
test('one future material change blocks',()=>{
  const rows=acceptedCurrent();rows[0].currentHash=rows[0].currentHash===H?J:H;
  const p=check(rows);blocked(p);assert.deepEqual(p.changedIds,[rows[0].id]);
});
test('new current ID blocks',()=>{
  const p=check([...acceptedCurrent(),current('unaccepted-new-id')]);blocked(p);assert.deepEqual(p.newIds,['unaccepted-new-id']);
});
test('missing current ID blocks',()=>{
  const rows=acceptedCurrent(),missing=rows.pop().id;const p=check(rows);blocked(p);assert.deepEqual(p.missingIds,[missing]);
});
test('same-size replacement cannot hide a missing and a new ID',()=>{
  const rows=acceptedCurrent(),missing=rows[0].id;rows[0]=current('replacement-id');
  const p=check(rows);blocked(p);assert.deepEqual(p.newIds,['replacement-id']);assert.deepEqual(p.missingIds,[missing]);
});
test('duplicate current and registry IDs block',()=>{
  const rows=acceptedCurrent();rows[1]={...rows[0]};blocked(check(rows));
  blocked(check(undefined,editRegistry(d=>{d.rows[1]={...d.rows[0]};})));
});
test('invalid acceptance status blocks',()=>{
  const p=check(undefined,editRegistry(d=>{d.rows[0].status='PASS';}));blocked(p);
  assert.ok(p.errors.some(e=>e.startsWith('Invalid acceptance status')));
});
test('valid status used for the wrong scope also blocks',()=>{
  blocked(check(undefined,editRegistry(d=>{d.rows.find(r=>r.status==='ACCEPTED_BY_CLOSEOUT_POLICY').status='PASS_DIRECT_AUDIT';})));
  blocked(check(undefined,editRegistry(d=>{d.rows.find(r=>r.status==='PASS_DIRECT_AUDIT').status='ACCEPTED_BY_CLOSEOUT_POLICY';})));
});
test('registry rows cannot be removed or appended',()=>{
  blocked(check(undefined,editRegistry(d=>{d.rows.pop();})));
  blocked(check(undefined,editRegistry(d=>{d.rows.push({...d.rows[0],id:'new-registry-id'});})));
});
test('missing registry, malformed JSON and schema fail closed without historical fallback',()=>{
  for(const raw of ['', '{', 'null', '{}', editRegistry(d=>{d.schemaVersion=2;})])blocked(check(undefined,raw));
  blocked(evaluateCloseoutAcceptancePolicy(null,registryText));
});
test('bad hashes and policy basis block',()=>{
  const rows=acceptedCurrent();rows[0].currentHash='';blocked(check(rows));
  blocked(check(undefined,editRegistry(d=>{d.rows[0].materialHash='not-sha256';})));
  blocked(check(undefined,editRegistry(d=>{d.rows[0].policyBasis='other-policy';})));
  blocked(check(undefined,editRegistry(d=>{d.policyBasis='other-policy';})));
});
test('missing evidence blocks',()=>{
  blocked(check(undefined,editRegistry(d=>{delete d.rows[0].evidenceRef;})));
});
test('rewriting registry with the changed material is not an allowed rebaseline',()=>{
  const rows=acceptedCurrent();rows[0].currentHash=H;
  const text=editRegistry(d=>{d.rows[0].materialHash=H;});
  const p=check(rows,text);blocked(p);assert.ok(p.errors.includes('Immutable registry byte hash differs'));
});
test('even whitespace-only registry rewrites are detected by the immutable byte pin',()=>{
  blocked(check(undefined,registryText+'\n'));
});

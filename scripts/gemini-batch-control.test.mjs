#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const script='scripts/gemini-batch-control.mjs';
const invoke=(...args)=>spawnSync(process.execPath,[script,...args],{encoding:'utf8'});
assert.equal(invoke('next','auto:1').stdout.trim(),'auto:2');
assert.equal(invoke('next','auto:39').stdout.trim(),'auto:40');
for(const invalid of ['auto:0','auto:40','auto:41','auto:1,auto:2','gap-pack2-05','auto:2;echo bad']) {
  assert.notEqual(invoke('next',invalid).status,0,invalid);
}
const dir=mkdtempSync(join(tmpdir(),'gemini-batch-gate-'));
const file=join(dir,'report.json');
const sha='5df2a0b46116323201a6ae933a4c650e78b105db';
const makeRows=()=>Array.from({length:4},(_,i)=>({
  id:'q-'+i,status:'PASS',keyEvidence:'Correct evidence',
  distractorEvidence:'Wrong answers explained',
  lessonEvidence:'Plain and pro match',issues:[]
}));
const check=(data)=>{writeFileSync(file,JSON.stringify(data));return invoke('all-pass',file)};
const good={sha,reviews:makeRows()};
assert.equal(check(good).status,0);
const fix={...good,reviews:makeRows()};fix.reviews[0].status='FIX';
assert.notEqual(check(fix).status,0,'Stop on FIX');
const review={...good,reviews:makeRows()};review.reviews[1].status='REVIEW';
assert.notEqual(check(review).status,0,'Stop on REVIEW');
const claimedPassIssue={...good,reviews:makeRows()};claimedPassIssue.reviews[0].issues=['This is actually wrong'];
assert.notEqual(check(claimedPassIssue).status,0,'Stop on issues even if AI said PASS');
const emptyEvidence={...good,reviews:makeRows()};emptyEvidence.reviews[2].lessonEvidence='';
assert.notEqual(check(emptyEvidence).status,0,'Stop on insufficient evidence');
assert.notEqual(check({...good,sha:'0'.repeat(40)}).status,0,'Reject stale review SHA');
assert.notEqual(check({...good,reviews:makeRows().slice(0,3)}).status,0,'Four reviews mandatory');
const duplicate={...good,reviews:makeRows()};duplicate.reviews[3].id='q-1';
assert.notEqual(check(duplicate).status,0,'Reject duplicate review IDs');
console.log('Gemini two-batch gate: PASS (all pass only, no duplicate or stale SHA)');

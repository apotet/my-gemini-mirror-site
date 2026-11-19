#!/usr/bin/env node
// No real Google calls. Exercise the review CLI through a mocked global fetch.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const dir=mkdtempSync(join(tmpdir(),'gemini-review-test-'));
const packPath=join(dir,'pack.json'), reportPath=join(dir,'report.md'),jsonPath=join(dir,'report.json');
const pack={
  schemaVersion:1,sha:'a'.repeat(40),ids:['l4-new-05'],
  records:[{id:'l4-new-05',materialHash:'b'.repeat(64),
    question:{text:'UDP checksum 0?',answers:['A','B','C','D'],correct:[1]},
    explanation:{brief:'Because IPv6 requires it',plain:'...',professional:'...'},
    lesson:{id:'l4-tcp',anchorId:'udp-checksum-ipv4-ipv6',coverageIssues:[],
      sections:{plain:{body:'Plain lesson'},professional:{body:'Professional lesson'}}}}]
};
writeFileSync(packPath,JSON.stringify(pack),'utf8');
const mockPath=join(dir,'mock-fetch.mjs');
writeFileSync(mockPath,`
globalThis.fetch = async (url,options) => {
  if (!String(url).endsWith('/models/gemini-4-hydrogen:generateContent')) throw Error('Unexpected model endpoint: '+String(url));
  if (options.headers['x-goog-api-key'] !== 'fake-secret-not-real') throw Error('Missing mock secret');
  if (process.env.MOCK_MODE==='error') return new Response(JSON.stringify({error:{
    status:'NOT_FOUND',message:'The model is not available to this project. key=fake-secret-not-real'
  }}),{status:404,headers:{'Content-Type':'application/json'}});
  if (process.env.MOCK_MODE==='success') return new Response(JSON.stringify({
    candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({reviews:[{
      id:'l4-new-05',status:'PASS',keyEvidence:'IPv4 optional, IPv6 requires',
      distractorEvidence:'Every other option conflicts',lessonAnchor:'l4-tcp#udp-checksum-ipv6-wrong',
      lessonEvidence:'Two modes checked',issues:[],limitations:'No browser checked'
    }]})}]}}],
    usageMetadata:{promptTokenCount:12,candidatesTokenCount:99,totalTokenCount:111}
  }),{status:200,headers:{'Content-Type':'application/json'}});
  throw Error('Unsupported MOCK_MODE');
};
`,'utf8');
const script=resolve('scripts/gemini-audit-review.mjs');
const run=(mode,key='fake-secret-not-real')=>spawnSync(process.execPath,
  ['--import',mockPath,script,packPath,reportPath,jsonPath],
  {cwd:process.cwd(),encoding:'utf8',env:{...process.env,MOCK_MODE:mode,GEMINI_MODEL:'gemini-4-hydrogen',GEMINI_API_KEY:key}});
const missing=run('error','');
assert.notEqual(missing.status,0);
assert.match(missing.stderr,/Missing GitHub Actions secret GEMINI_API_KEY/);
const fail=run('error');
assert.notEqual(fail.status,0);
assert.match(fail.stderr,/HTTP 404 \(NOT_FOUND\)/);
assert.match(fail.stderr,/model is not available/);
assert.doesNotMatch(fail.stderr,/fake-secret-not-real/,'Never leak Gemini key in logs');
assert.doesNotMatch(fail.stderr,/\n[^\n]*AIza/);
const success=run('success');
assert.equal(success.status,0,success.stderr);
const data=JSON.parse(readFileSync(jsonPath,'utf8'));
assert.equal(data.model,'gemini-4-hydrogen');
assert.equal(data.reviews.length,1);
assert.equal(data.reviews[0].status,'REVIEW','Wrong anchor cannot be PASS');
assert.match(readFileSync(reportPath,'utf8'),/read-only, advisory/);
// Missing exact lesson anchor MUST be classified as FIX even if Gemini claims PASS.
pack.records[0].lesson.anchorId=null;
pack.records[0].lesson.coverageIssues=['MISSING_EXACT_ANCHOR'];
pack.records[0].lesson.sections={plain:null,professional:null};
writeFileSync(packPath,JSON.stringify(pack),'utf8');
const absent=run('success');
assert.equal(absent.status,0,absent.stderr);
const missingReview=JSON.parse(readFileSync(jsonPath,'utf8')).reviews[0];
assert.equal(missingReview.status,'FIX','Missing source material overrides any AI PASS');
assert.match(missingReview.issues.join(' '),/MISSING_EXACT_ANCHOR/);
console.log('Gemini API mock: key safety, 404, wrong anchor, missing source => FIX: PASS');

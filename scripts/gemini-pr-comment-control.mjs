#!/usr/bin/env node
// Trusted staging-only GitHub Action dispatcher: never executes data from audited PR.
import {readFileSync,writeFileSync} from 'node:fs';
import {appendFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const [command,...args]=process.argv.slice(2);
const canonical=/^\/audit-gemini-264 sha=([a-f0-9]{40}) batch=([1-9]|[1-3][0-9]|4[01]) count=([12])$/;
if(command==='parse'){
  const raw=process.env.REVIEW_COMMENT||'';
  const match=canonical.exec(raw.trim());
  if(!match) throw new Error('Invalid command; exactly /audit-gemini-264 sha=<40hex> batch=1..41 count=1|2');
  const [_,sha,batchText,countText]=match;
  const batch=Number(batchText),count=Number(countText);
  if(batch+count-1>41) throw new Error('Batch range exceeds 41 groups of four.');
  if(!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required.');
  appendFileSync(process.env.GITHUB_OUTPUT,'sha='+sha+'\nstart='+batch+'\ncount='+count+'\n','utf8');
  console.log('Validated PR264 audit request: batch '+batch+', at most '+count+' Gemini calls (each four IDs).');
} else if(command==='queue'){
  const [root,indexText]=args;
  if(!root||!/^(?:[1-9]|[1-3][0-9]|4[01])$/.test(indexText||'')) throw new Error('Queue index must be 1..41');
  const data=JSON.parse(readFileSync(root+'/src/data/questionLearningLevels.json','utf8'));
  const ids=Object.entries(data).filter(([id,v])=>v?.status==='ASSIGNED'&&v?.learningLevel===2).map(([id])=>id).sort();
  if(ids.length!==164||new Set(ids).size!==164) throw new Error('Understanding bank changed from frozen 164 (fail closed)');
  const selected=ids.slice((Number(indexText)-1)*4,Number(indexText)*4);
  if(selected.length!==4||!selected.every(id=>/^[A-Za-z0-9_-]{2,80}$/.test(id))) throw new Error('Bad four-ID selection');
  process.stdout.write(selected.join(',')+'\n');
} else if(command==='all-pass'){
  const [path,sha]=args;
  if(!/^[a-f0-9]{40}$/.test(sha||'')) throw new Error('Missing frozen SHA');
  const report=JSON.parse(readFileSync(path,'utf8'));
  const rows=report?.reviews;
  if(report.sha!==sha||!Array.isArray(rows)||rows.length!==4||new Set(rows.map(r=>r?.id)).size!==4)
    throw new Error('Incorrect SHA, count, or duplicate IDs');
  if(!rows.every(r=>r.status==='PASS'&&Array.isArray(r.issues)&&r.issues.length===0&&
    ['keyEvidence','distractorEvidence','lessonEvidence'].every(k=>typeof r[k]==='string'&&r[k].trim())))
    throw new Error('FIX/REVIEW/issues or missing semantic evidence; second call prohibited');
  console.log('All four source-specific PASS: second API call may proceed.');
} else{
  throw new Error('Usage: parse | queue <checkout> <batch> | all-pass <report.json> <sha>');
}

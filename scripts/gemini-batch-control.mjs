#!/usr/bin/env node
// Deterministic local gate only. No network, no keys, no write permissions.
import { readFileSync } from 'node:fs';

const [command, value] = process.argv.slice(2);
if (command === 'next') {
  // The optional second batch must be within the frozen 40-batch queue.
  // Never derive additional calls from arbitrary comma-separated IDs.
  const parsed = /^auto:([1-9]|[1-3][0-9])$/.exec(value || '');
  if (!parsed) {
    console.error('Second consecutive batch requires auto:1 through auto:39; refusing call.');
    process.exit(2);
  }
  console.log('auto:'+(Number(parsed[1])+1));
} else if (command === 'all-pass') {
  let report;
  try { report=JSON.parse(readFileSync(value,'utf8')); } catch {
    console.error('Cannot parse first semantic-review report; second API call prohibited.');
    process.exit(2);
  }
  const rows=report?.reviews;
  if (report.sha !== '5df2a0b46116323201a6ae933a4c650e78b105db' ||
      !Array.isArray(rows) || rows.length!==4 || new Set(rows.map(r=>r?.id)).size!==4) {
    console.error('Review SHA/count mismatch. Second batch prohibited.');
    process.exit(2);
  }
  if (rows.every(r=>r.status==='PASS' && Array.isArray(r.issues) && r.issues.length===0 &&
    typeof r.keyEvidence==='string' && r.keyEvidence.trim() &&
    typeof r.lessonEvidence==='string' && r.lessonEvidence.trim() &&
    typeof r.distractorEvidence==='string' && r.distractorEvidence.trim())) {
    console.log('Four source-reviewed PASS with evidence; optional second batch is allowed.');
  } else {
    console.error('At least one FIX/REVIEW/issue/insufficient evidence; stop before next API call.');
    process.exit(1);
  }
} else {
  console.error('Usage: node gemini-batch-control.mjs next auto:N | all-pass report.json');
  process.exit(2);
}

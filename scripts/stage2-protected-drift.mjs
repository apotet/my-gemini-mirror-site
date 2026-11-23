// Diagnostic only: inspect approved SHA256 baseline without changing it.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const baseline = JSON.parse(readFileSync(new URL('../docs/audits/issue-171-baseline.json', import.meta.url), 'utf8'));
const mismatches = [];
const sha = content => createHash('sha256').update(content).digest('hex');
for (const [file, expected] of Object.entries(baseline.protectedFiles)) {
  try {
    const actual = sha(readFileSync(new URL('../' + file, import.meta.url)));
    if (actual !== expected) mismatches.push({file, expected, actual});
  } catch (error) {
    mismatches.push({file, expected, error: String(error)});
  }
}
console.log(JSON.stringify({
  diagnostic: 'stage2-protected-source-drift',
  protectedFileCount: Object.keys(baseline.protectedFiles).length,
  mismatchCount: mismatches.length,
  mismatches,
}, null, 2));
// Deliberately no rebaseline, suppression, or mutation.

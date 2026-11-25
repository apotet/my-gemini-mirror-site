#!/usr/bin/env node
/**
 * Regression tests for the ZAI lesson resolver.
 * Invokes the Python resolver and asserts unique resolution for known lessons
 * and failure for missing / non-lesson selectors.
 */
import { spawnSync } from 'child_process';

function resolve(selector) {
  const code = `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('zai', 'scripts/zai-agent.py')
z = importlib.util.module_from_spec(spec)
spec.loader.exec_module(z)
try:
    path, obj, lid = z.resolve_lesson(sys.argv[1])
    print(json.dumps({'ok': True, 'path': str(path), 'id': lid, 'len': len(obj), 'hasTitle': 'title' in obj.lower()}))
except Exception as e:
    print(json.dumps({'ok': False, 'error': str(e)}))
`;
  const r = spawnSync('python3', ['-c', code, selector], { encoding: 'utf8' });
  if (!r.stdout.trim()) return { ok: false, error: r.stderr || 'no output' };
  return JSON.parse(r.stdout.trim());
}

const expectedOk = [
  'l1-poe-screen-reading',
  'l1-poe-budget',
  'l1-poe-injectors-splitters',
  'l2-hsr-redundancy',
];
const expectedFail = [
  'does-not-exist-xyz',
  'cli-poe-q1',
];

let pass = 0, fail = 0;
for (const sel of expectedOk) {
  const res = resolve(sel);
  const ok = res.ok && res.hasTitle;
  console.log(ok ? 'PASS' : 'FAIL', sel, res.ok ? `${res.path} (${res.len})` : res.error);
  if (ok) pass++; else fail++;
}
for (const sel of expectedFail) {
  const res = resolve(sel);
  const ok = !res.ok;
  console.log(ok ? 'PASS' : 'FAIL', sel, res.ok ? 'unexpectedly resolved' : res.error);
  if (ok) pass++; else fail++;
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

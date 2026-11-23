// One shared glossary policy protects lesson and engineering review rendering.
import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';
const { getLessonGlossaryScope } = await bundleEntry('src/utils/lessonGlossaryScope.ts','lesson-glossary-scope-test.mjs');
assert.equal(getLessonGlossaryScope('l3-ipv6'),'ipv6');
for(const id of ['l1-poe-budget','l1-poe-screen-reading','cli-poe-diagnostics','l1-poe-injectors-splitters','l1-copper-fault-poe'])
  assert.equal(getLessonGlossaryScope(id),'poe',id);
for(const id of ['l7-dns','l4-tcp-sack',undefined,'l3-nat'])
  assert.equal(getLessonGlossaryScope(id),undefined,'No IPv6 or PoE tooltip leakage: '+id);
console.log('PASS: shared lesson and EngineeringReview glossary scope (IPv6/PoE/negative cases)');

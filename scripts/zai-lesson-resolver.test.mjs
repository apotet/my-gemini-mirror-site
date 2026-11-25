import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from './zai-runtime/node_modules/typescript/lib/typescript.js';
import { parseLessons, indexLessons, resolveLesson, validateIndex } from './zai-lesson-resolver.mjs';
const lesson = `id:'target', title:'Title', blocks:[], relatedQuestionIds:['q1','q2']`;
function parse(s) { return parseLessons(s, 'fixture.ts'); }
test('direct properties, exact source, quoting, Unicode, nested braces, assertions', () => {
  const obj = `{ nested:{a:'}'}, "id":'target', 'title':\`Заголовок\`, blocks:[{body:\`x ${'${1 + 2}'}\`}], relatedQuestionIds:['q1'] }`;
  const [r] = parse(`const x = (${obj} as const) satisfies Lesson;`);
  assert.equal(r.content, obj); assert.equal(r.title,'Заголовок'); assert.deepEqual(r.questionIds,['q1']);
});
for (const [name, source] of Object.entries({
  strings: `const x = "{id:'target',title:'Title'}";`,
  comments: `/* const x = {${lesson}} */ // id:'target'`,
  nestedTitle: `const x = {id:'target', nested:{title:'Title'}, blocks:[], relatedQuestionIds:[]};`,
  nestedId: `const x = {title:'Title', nested:{id:'target'}, blocks:[], relatedQuestionIds:[]};`,
  reference: `const x = {id:'target', title:'Title'};`,
  template: 'const x = `id:"target", title:"Title" ${"{"}`;',
})) test(`reject false positive: ${name}`, () => assert.equal(parse(source).length,0));
test('multiple definitions in one container and case insensitive exact selection', () => {
  const all = parse(`const x = [{${lesson}}, {${lesson.replace("'target'","'other'")}}];`);
  assert.equal(resolveLesson('TARGET',all).id,'target');
  assert.throws(()=>resolveLesson('tar',all));
  assert.throws(()=>resolveLesson('target',[...all,all[0]]));
});
test('malformed source, duplicate keys and dynamic question IDs fail closed', () => {
  assert.throws(()=>parse('const x = {'));
  assert.throws(()=>parse(`const x = {${lesson}, id:'other'};`));
  assert.throws(()=>parse(`const x = {${lesson.replace("['q1','q2']",'[someVariable]')}};`));
  assert.throws(()=>parse(`const x = {${lesson}, ...other};`));
});
test('full actual runtime registry equals AST inventory, no duplicates or omissions', async () => {
  // Independent registry execution is confined to this offline test, never the resolver.
  const dir = mkdtempSync(join(tmpdir(),'zai-registry-'));
  try {
    const { build } = await import('./zai-runtime/node_modules/esbuild/lib/main.js');
    const output = join(dir,'registry.mjs');
    await build({entryPoints:['src/data/lessons/index.ts'],bundle:true,platform:'node',format:'esm',outfile:output});
    const { LESSONS } = await import(output);
    const definitions = indexLessons();
    const actual = LESSONS.map(l=>l.id).sort();
    assert.equal(new Set(actual).size,actual.length);
    assert.deepEqual(definitions.map(l=>l.id).sort(),actual);
    for (const l of LESSONS) assert.equal(resolveLesson(l.id,definitions).id,l.id);
    console.log(`REGISTRY ${actual.length}/${actual.length}; missing=0 extra=0 duplicates=0`);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
test('Python pack, Issue 356, size gates, authorization and no paid/network calls', () => {
  const result = spawnSync('python3',['scripts/zai-pack.test.py'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);
  console.log(result.stdout.trim());
});

test('global duplicate IDs fail even when selecting a different lesson', () => {
  const all = parse(`const x = [{${lesson}}, {${lesson.replace("'target'","'TARGET'")}}];`);
  assert.throws(() => validateIndex(all), /Duplicate lesson ID/);
  assert.throws(() => validateIndex([all[0], {...all[0],path:'different.ts'}]), /Duplicate lesson ID/);
});

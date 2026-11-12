import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
mkdirSync(resolve('scripts/.cache'), { recursive: true });
const outfile=resolve('scripts/.cache/svi-lesson.mjs');
await build({stdin:{contents:`
export { getLesson } from './src/data/lessons/index';
export { PRACTICE_DESTINATIONS } from './src/data/practiceLinks';
export { GLOSSARY, GLOSSARY_TOOLTIPS } from './src/data/glossary';
export { splitGlossaryText } from './src/utils/glossaryText';
export { ciscoTwoSwitchSviScenario } from './src/cli-lab/scenarios/cisco-two-switch-svi';
`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile,logLevel:'silent'});
const {getLesson,PRACTICE_DESTINATIONS,GLOSSARY,GLOSSARY_TOOLTIPS,splitGlossaryText,ciscoTwoSwitchSviScenario}=await import(pathToFileURL(outfile).href);
const lesson=getLesson('l2-svi');
assert.ok(lesson,'SVI registered in lessons catalog');
assert.ok(lesson.professional,'SVI has expert explanation');
assert.ok(lesson.blocks.length>=5 && lesson.professional.blocks.length>=4);
assert.equal(PRACTICE_DESTINATIONS['cli-svi'].scenarioId,ciscoTwoSwitchSviScenario.id,'practice link opens exact live scenario');
for(const mode of [lesson,lesson.professional]){
 for(const term of mode.terms){
  assert.ok(GLOSSARY[term]?.description,term+': tag description');
  assert.ok(GLOSSARY_TOOLTIPS[term],term+': inline tooltip');
  assert.ok(splitGlossaryText(' '+term+' ').some(t=>t.term===term),term+': term recognized');
 }
}
assert.equal(GLOSSARY.SVI.lessonId,'l2-svi');
assert.ok(lesson.blocks.some(b=>b.practiceLink==='cli-svi'));
assert.ok(lesson.professional.blocks.some(b=>b.practiceLink==='cli-svi'));
assert.match(lesson.blocks.map(b=>b.body).join(' '),/config-vlan.*config-if/s);
assert.match(lesson.blocks.map(b=>b.body).join(' '),/255\.255\.255\.0/);
console.log('PASS: SVI lesson, glossary, plain/pro and direct CLI lab link');

import { build } from 'esbuild';
import { readdirSync,readFileSync,mkdtempSync,rmSync,mkdirSync,writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join,resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { snapshot,scan } from './model.mjs';
export async function loadRuntime(root) {
  const cache=mkdtempSync(join(tmpdir(),'netops-bundle-'));
  try {
    // Use the registry consumed by the shell, not every scenario file on disk.
    // This deliberately fails closed if the registry syntax changes.
    const shell=readFileSync(join(root,'src/cli-lab/CliLabShell.tsx'),'utf8');
    const registry=shell.match(/const SCENARIOS: Scenario\[\] = \[([\s\S]*?)\]\.map\(withPcEndpoints\)/)?.[1];
    if(!registry) throw new Error('Cannot resolve actual CliLabShell SCENARIOS registry');
    const names=registry.split(',').map(s=>s.trim()).filter(Boolean);
    if(!names.every(n=>/^\w+$/.test(n))) throw new Error('Unsupported scenario registry expression');
    const imports=[],ids=[];
    for(const [i,name] of names.entries()) {
      const source=[...shell.matchAll(/import \{ (\w+) \} from '(\.\/scenarios\/[^']+)';/g)].find(m=>m[1]===name)?.[2];
      if(!source) throw new Error(`Unresolved registered scenario ${name}`);
      imports.push(`import { ${name} as s${i} } from ${JSON.stringify(resolve(root,'src/cli-lab',source))};`);
      ids.push(`s${i}.id`);
    }
    const input=`export { ALL_QUESTIONS } from ${JSON.stringify(join(root,'src/data/questionsData.ts'))};
export { getQuestionDeepDive } from ${JSON.stringify(join(root,'src/data/questionExplanations.ts'))};
export { LESSONS,getLessonForQuestion } from ${JSON.stringify(join(root,'src/data/lessons/index.ts'))};
export { GLOSSARY,GLOSSARY_TOOLTIPS } from ${JSON.stringify(join(root,'src/data/glossary.ts'))};
export { splitGlossaryText } from ${JSON.stringify(join(root,'src/utils/glossaryText.ts'))};
export { PRACTICE_DESTINATIONS } from ${JSON.stringify(join(root,'src/data/practiceLinks.ts'))};
${imports.join('\n')} export const scenarioIds=[${ids.join(',')}];`;
    const outfile=join(cache,'runtime.mjs');
    await build({stdin:{contents:input,resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile,logLevel:'silent'});
    const m=await import(pathToFileURL(outfile).href);
    return {data:snapshot(m,m.scenarioIds),splitText:m.splitGlossaryText};
  } finally {rmSync(cache,{recursive:true,force:true});}
}
export async function scanRoot(root,receipts=[]) {
  const {data,splitText}=await loadRuntime(resolve(root)); return scan(data,splitText,receipts);
}
export async function scanRef(root,ref) {
  // Never accept a path, an absent ref or a shallow-clone fallback to HEAD.
  const sha=execFileSync('git',['rev-parse','--verify',`${ref}^{commit}`],{cwd:root,encoding:'utf8'}).trim();
  const temporary=mkdtempSync(join(tmpdir(),'netops-base-'));
  try {
    const archive=execFileSync('git',['archive',sha,'src'],{cwd:root,maxBuffer:64*1024*1024});
    execFileSync('tar',['-x','-C',temporary],{input:archive});
    return await scanRoot(temporary);
  } finally {rmSync(temporary,{recursive:true,force:true});}
}

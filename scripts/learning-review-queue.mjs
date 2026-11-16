// Deterministic bounded batches for independent reviewers; never auto-approves prose.
import { loadRuntime } from './learning-quality/runtime.mjs';
import { dirname } from 'node:path';
import { scan } from './learning-quality/model.mjs';
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
const args=process.argv.slice(2),arg=k=>{const i=args.indexOf(k);return i<0?null:args[i+1];};
const limit=Number(arg('--limit')??10);if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('--limit must be 1..100');
const receipts=JSON.parse(readFileSync('docs/learning-quality/reviews.json','utf8'));
const {data,splitText}=await loadRuntime(process.cwd()),report=scan(data,splitText,receipts);
const pending=report.rows.filter(row=>row.semantic!=='PASS'&&!receipts.some(r=>r.materialId===row.id&&r.contentHash===row.contentHash&&r.dependencyHash===row.dependencyHash&&r.candidateDigest===row.candidateDigest&&r.scope==='whole-material'&&['FIX','REVIEW'].includes(r.result)&&r.author&&r.reviewer&&r.author!==r.reviewer&&Array.isArray(r.evidence)&&r.evidence.length&&r.evidence.every(v=>typeof v==='string'&&v.trim())));
const kind=arg('--kind'),rows=pending.filter(r=>!kind||r.kind===kind).sort((a,b)=>a.id.localeCompare(b.id,'en')).slice(0,limit);
const materials={question:Object.fromEntries(data.questions.map(q=>[q.id,q])),lesson:Object.fromEntries(data.lessons.map(l=>[l.id,l])),glossary:data.glossary,practice:data.practice};
const lookup=id=>{const n=id.indexOf(':');return materials[id.slice(0,n)]?.[id.slice(n+1)];};
const packets=rows.map(row=>({row,material:lookup(row.id),...(row.kind==='glossary'?{tooltip:data.tooltips[row.id.slice(9)]}:{}),dependencies:row.dependencies.map(id=>({id,material:lookup(id)}))}));
const output=arg('--out')??'scripts/.cache/learning-quality/review-batch.json';mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify({pending:pending.length,selected:packets.length,packets,instructions:'Independent reviewer reads each full packet. Record PASS only after complete verified review. FIX/REVIEW receipts with exact hashes and evidence prevent repeatedly re-reviewing an unchanged unresolved material; repair queue remains visible in full registry. Never create mass template PASS decisions.'},null,2)+'\n');
console.log(JSON.stringify({pending:pending.length,selected:rows.map(r=>r.id),output}));

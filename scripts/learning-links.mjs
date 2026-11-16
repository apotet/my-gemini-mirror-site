// External references are checked separately: transient access failures are never
// promoted into confirmed content defects or allowed to block unrelated changes.
import { loadRuntime } from './learning-quality/runtime.mjs';
import { strings } from './learning-quality/model.mjs';
import { mkdirSync,writeFileSync } from 'node:fs';
const {data}=await loadRuntime(process.cwd()),refs=new Map();
for(const [kind,materials] of [['question',data.questions],['lesson',data.lessons]]) for(const material of materials) {
 for(const {path,text} of strings(material).filter(v=>/(?:^|\.)sources(?:\.|$)/.test(v.path))) for(const m of text.matchAll(/https?:\/\/[^\s)<>"\]]+/g)) {
  const original=m[0],url=new URL(original);url.hash='';
  const key=url.href;if(!refs.has(key))refs.set(key,{url:key,references:[]});
  refs.get(key).references.push({materialId:`${kind}:${material.id}`,path,original});
 }
}
const pending=[...refs.values()];
await Promise.all(Array.from({length:6},async()=>{
 while(pending.length) {
  const row=pending.shift();
  try {
   let url=row.url;
   for(let redirect=0;redirect<6;redirect++) {
    const parsed=new URL(url);
    if(parsed.protocol!=='https:' || !parsed.hostname.includes('.') || /^(?:localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(parsed.hostname) || /\.(?:local|example|invalid|test)$/.test(parsed.hostname)) throw new Error('Not an external HTTPS reference');
    const response=await fetch(url,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(6000),headers:{'User-Agent':'NetOps-learning-reference-check/1.0'}});
    await response.body?.cancel();
    if(response.status>=300 && response.status<400 && response.headers.get('location')) {url=new URL(response.headers.get('location'),url).href;continue;}
    row.httpStatus=response.status;row.finalUrl=url;
    row.status=response.ok?'REACHABLE':[404,410].includes(response.status)?'BROKEN_HTTP':'UNVERIFIED';break;
   }
   row.status??='UNVERIFIED';
  }catch(error){row.status='UNVERIFIED';row.reason=error.message;}
 }
}));
const rows=[...refs.values()],summary=Object.fromEntries(['REACHABLE','BROKEN_HTTP','UNVERIFIED'].map(k=>[k,rows.filter(r=>r.status===k).length]));
mkdirSync('scripts/.cache/learning-quality',{recursive:true});
writeFileSync('scripts/.cache/learning-quality/external-links.json',JSON.stringify({summary,rows,limits:['HTTP status is not semantic relevance or validity of URL fragment.','403/429/timeouts remain UNVERIFIED, never PASS or confirmed broken.']},null,2)+'\n');
console.log(JSON.stringify(summary));

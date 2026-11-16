import { loadRuntime } from './learning-quality/runtime.mjs';
import { scan } from './learning-quality/model.mjs';
const {data,splitText}=await loadRuntime(process.cwd());
const report=scan(data,splitText),id=process.argv[2];
const row=report.rows.find(r=>r.id===id);
if(!row) throw new Error('Supply an exact material ID: question:ID / lesson:ID / glossary:TERM / practice:ID');
const separator=id.indexOf(':'),kind=id.slice(0,separator),key=id.slice(separator+1);
const material=kind==='question'?data.questions.find(q=>q.id===key):kind==='lesson'?data.lessons.find(l=>l.id===key):data[kind]?.[key];
console.log(JSON.stringify({row,material,...(kind==='glossary'?{tooltip:data.tooltips[key]}:{}),dependencies:row.dependencies.map(id=>{const [kind,...rest]=id.split(':'),key=rest.join(':');return {id,material:kind==='lesson'?data.lessons.find(l=>l.id===key):data[kind]?.[key]};}),instructions:'Read full material and dependencies. Record technical/beginner/answerConsistency/lessonRelevance/terminology evidence and disposition every candidate. Author and reviewer must differ. REVIEW/FIX is not PASS. Never reuse historical audit blanket PASS.'},null,2));

import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {expectedL3Routes} from './l3-batch1-integration.test.mjs';
import {bundleEntry} from './load-bank.mjs';
const m=await bundleEntry('scripts/in-depth-entry.ts','l3-batch1-browser-data.mjs');
const {chromium}=await import(process.env.NETOPS_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.NETOPS_BASE_URL||'http://127.0.0.1:5428/my-gemini-mirror-site/';
const output='scripts/.cache/in-depth/l3-batch1';mkdirSync(output,{recursive:true});
const evidence=[],errors=[];
const browser=await chromium.launch(process.env.NETOPS_CHROMIUM_PATH?{executablePath:process.env.NETOPS_CHROMIUM_PATH}:{});
try{
 for(const width of [375,1440]){
  const page=await browser.newPage({viewport:{width,height:1000},isMobile:width===375,hasTouch:width===375,reducedMotion:'reduce'});
  page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  for(const [id,lessonId,anchor] of expectedL3Routes){
   await page.goto(base);
   await page.getByRole('button',{name:width===375?'Теория':'Теория и разборы',exact:true}).click();
   await page.getByPlaceholder('Поиск по тексту, теме, id...').fill(id);
   await page.getByRole('button',{name:new RegExp('^#'+id+' ·')}).click();
   await page.locator(`[data-explanation-question-id="${id}"]`).waitFor({state:'visible'});
   const lesson=m.getLesson(lessonId);
   await page.getByRole('button',{name:'Перейти к уроку: '+lesson.title,exact:true}).click();
   await page.getByRole('heading',{name:lesson.title,exact:true}).waitFor({state:'visible'});
   for(const [mode,label] of [['plain','Простыми словами'],['professional','По делу']]){
    const toggle=page.getByRole('button',{name:label,exact:true});
    if(await toggle.getAttribute('aria-pressed')!=='true')await toggle.click();
    const target=page.locator(`[data-lesson-section-anchor="${anchor}"]`);
    assert.equal(await target.count(),1,`${id}/${mode}: unique actual anchor`);
    try {
     await page.waitForFunction(anchor=>{const r=document.querySelector(`[data-lesson-section-anchor="${anchor}"]`)?.getBoundingClientRect();return r&&r.bottom>0&&r.top<innerHeight;},anchor);
    } catch(error) {
     await page.screenshot({path:`${output}/failure-${id}-${width}-${mode}.png`});
     throw new Error(`${id}/${width}/${mode}: anchor not in viewport: ${error.message}`);
    }
    const expected=m.getLessonBlocksWithSections(lesson,mode).find(b=>b.anchorId===anchor);
    assert.equal(await target.locator('h3').innerText(),expected.heading);
    if(id==='gap-pack2-02')assert.match(await target.innerText(),/1444/);
    if(id==='gap-pack1-03')assert.match(await target.innerText(),/10\.60\.4\.20/);
    const dimensions=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
    assert.ok(dimensions[0]<=dimensions[1]+1,`${id}/${mode}/${width}: no page overflow`);
    await target.screenshot({path:`${output}/${id}-${width}-${mode}.png`});
    evidence.push({id,lessonId,anchor,mode,width,heading:expected.heading});
   }
   await page.getByRole('button',{name:'Вернуться к вопросу '+id,exact:true}).click();
   await page.locator(`[data-explanation-question-id="${id}"]`).waitFor({state:'visible'});
   console.log(`PASS ${width} ${id} -> ${lessonId}#${anchor}: both modes and exact return`);
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);assert.equal(evidence.length,36);
}finally{await browser.close();writeFileSync(`${output}/evidence.json`,JSON.stringify({base,evidence,errors},null,2)+'\n');}
console.log('PASS: 9 real question-to-lesson anchors x 375/1440 x both modes (36 checks)');

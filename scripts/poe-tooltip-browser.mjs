// Addressed UI verification, runnable against local preview or published staging.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync}from'node:fs';
import {bundleEntry}from'./load-bank.mjs';
const m=await bundleEntry('scripts/in-depth-entry.ts','poe345-tooltip-entry.mjs');
const lesson=m.getLesson('l1-poe-injectors-splitters');
const required=['AP','MPS','DC','DC OUT','Data IN','Data + Power OUT','LED','КПД','ИК-подсветка','БП','upstream','IEEE','DC IN','пусковой ток'];
const {chromium}=await import(process.env.NETOPS_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({...(process.env.NETOPS_CHROMIUM_PATH?{executablePath:process.env.NETOPS_CHROMIUM_PATH}:{}),args:['--no-sandbox']});
const base=process.env.NETOPS_BASE_URL||'http://127.0.0.1:5445/my-gemini-mirror-site/';
const out=process.env.NETOPS_TOOLTIP_OUTPUT||'scripts/.cache/poe345-tooltip-local';mkdirSync(out,{recursive:true});
const evidence=[];const norm=s=>s.replace(/\s+/g,' ').trim();
try{
 for(const width of[375,1440]){
  const mobile=width===375,page=await browser.newPage({viewport:{width,height:950},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});page.setDefaultTimeout(15000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:mobile?'Теория':'Теория и разборы',exact:true}).click();
  await page.getByPlaceholder('Поиск по тексту, теме, id...').fill('l1v2-c-injector-direction');
  await page.getByRole('button',{name:/^#l1v2-c-injector-direction ·/}).click();
  await page.locator('[data-explanation-question-id="l1v2-c-injector-direction"]').getByRole('button',{name:`Перейти к уроку: ${lesson.title}`}).click();
  const article=page.locator('article').filter({has:page.getByRole('heading',{name:lesson.title,exact:true})});await article.waitFor();
  const seen=new Set();
  for(const mode of['plain','professional']){
   await article.getByRole('button',{name:mode==='plain'?'Простыми словами':'По делу',exact:true}).click();
   assert.equal(await article.locator('h1 [data-glossary-term],h2 [data-glossary-term],h3 [data-glossary-term],summary [data-glossary-term],nav [data-glossary-term]').count(),0,'No glossary in headings/contents');
   await article.locator('img').evaluateAll(images=>Promise.all(images.map(async image=>{image.loading='eager';await image.decode();})));
   const expected=mode==='plain'?lesson:lesson.professional;
   const sections=article.locator(':scope > div.space-y-4 > section');assert.equal(await sections.count(),expected.blocks.length,`${mode}: all blocks rendered`);
   for(let i=0;i<expected.blocks.length;i++){
    const section=sections.nth(i);assert.ok(norm(await section.innerText()).includes(norm(expected.blocks[i].heading)),`${mode}/${i}: heading rendered`);
    const start=norm(expected.blocks[i].body.split('\n')[0].replace(/^\d+[.)]\s*/, '')).slice(0,65);assert.ok(norm(await section.innerText()).includes(start),`${mode}/${i}: complete block is mounted`);
   }
   const buttons=article.locator('section [data-glossary-term]');
   const terms=[...new Set(await buttons.evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length).map(n=>n.dataset.glossaryTerm)))];
   // Exercise every distinct visible inline term, including existing terms and new ones.
   for(const term of terms){
    const button=buttons.filter({visible:true}).and(article.locator(`[data-glossary-term=${JSON.stringify(term)}]`)).first();
    await page.keyboard.press('Escape');await button.scrollIntoViewIfNeeded();
    await button.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    if(mobile)await button.tap();else{await page.mouse.move(0,0);await button.hover();}
    const popup=page.getByRole('tooltip');await popup.waitFor({state:'visible'});
    const state=await popup.evaluate(el=>{const r=el.getBoundingClientRect();return {text:el.innerText,x:r.x,width:r.width};});
    const actual=norm(state.text),expectedTip=m.GLOSSARY_TOOLTIPS[term];assert.ok(expectedTip,term);
    for(const field of['english','russian','summary'])assert.ok(actual.includes(norm(expectedTip[field])),`${term}: real ${field}`);
    assert.ok(state.x>=0&&state.x+state.width<=width+1,`${term}: tooltip on screen`);
    seen.add(term);
   }
   await page.keyboard.press('Escape');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=5,`No horizontal overflow ${overflow}`);
   await page.screenshot({path:`${out}/${mode}-${width}.png`});
   evidence.push({width,mode,blockCount:expected.blocks.length,headingsWithoutTooltips:true,allInlineTermsExercised:terms,interaction:mobile?'tap':'hover',overflow,jsErrors:errors});
  }
  for(const term of required)assert.ok(seen.has(term),`${width}: requested inline term ${term} actually exercised`);
  assert.deepEqual(errors,[]);await page.close();
 }
}finally{await browser.close();writeFileSync(`${out}/evidence.json`,JSON.stringify({base,required,checks:evidence,success:evidence.length===4},null,2)+'\n');}
console.log(`PASS: all 14 requested/additional hints and every existing inline term, hover/tap, full plain/pro blocks, headings and layout at ${base}`);

import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';
const {getTestingPool,getQuestionDeepDive,getLessonForQuestion,getLessonSectionForQuestion,IN_DEPTH_BATCHES,PREVIOUS_IN_DEPTH_QUESTIONS,prepareAttemptQuestions}=await bundleEntry('scripts/in-depth-entry.ts','in-depth-browser-data.mjs');
const {chromium}=await import(process.env.NETOPS_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.NETOPS_BASE_URL||'http://127.0.0.1:5428/my-gemini-mirror-site/';
const allQuestions=getTestingPool('mixed','in-depth');
assert.equal(allQuestions.length,164,'Frozen Understanding pool must cover all 164 IDs');
const requested=process.env.NETOPS_L2_IDS?.split(',');
const candidates=allQuestions.filter(q=>!requested||requested.includes(q.id));
const shardIndex=Number(process.env.NETOPS_L2_SHARD_INDEX||0);
const shardCount=Number(process.env.NETOPS_L2_SHARD_COUNT||1);
assert.ok(Number.isInteger(shardIndex)&&Number.isInteger(shardCount)&&shardCount>0&&shardIndex>=0&&shardIndex<shardCount,'Valid browser shard index and count');
const questions=candidates.filter((_,index)=>index%shardCount===shardIndex);
assert.ok(questions.length);
const output=`scripts/.cache/in-depth/browser/shard-${shardIndex}-of-${shardCount}`;mkdirSync(output,{recursive:true});
const evidence=[],screenshots=new Set(),errors=[];
const normalize=s=>s.replace(/\s+/g,' ').trim();
const browser=await chromium.launch({...process.env.NETOPS_CHROMIUM_PATH?{executablePath:process.env.NETOPS_CHROMIUM_PATH}:{}});
try {
 for(const width of [375,1440]) {
  const mobile=width===375,page=await browser.newPage({viewport:{width,height:1000},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce',ignoreHTTPSErrors:process.env.NETOPS_IGNORE_HTTPS_ERRORS==='1'});
  page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push({width,message:e.message}));
  const now=Date.now(),progress=JSON.stringify({version:4,epoch:'l2-browser',questions:{},receipts:{},dates:[],backup:{},migrationNotice:false});
  const historical=prepareAttemptQuestions(Object.values(PREVIOUS_IN_DEPTH_QUESTIONS),()=>0.2);
  const savedSession={...historical,mode:'mixed',difficulty:'in-depth',learningLevel:2,feedbackMode:'exam',currentIndex:0,isCompleted:true,startTime:now-3000,endTime:now-1000,attemptId:'l2-browser-history',progressEpoch:'l2-browser',userAnswers:Object.fromEntries(historical.questions.map(q=>[q.id,[q.correct[0]]])),submittedQuestions:Object.fromEntries(historical.questions.map(q=>[q.id,true]))};
  const saved=JSON.stringify({version:1,session:savedSession});
  await page.addInitScript(({saved,progress})=>{localStorage.setItem('osi_last_exam_review_v1',saved);localStorage.setItem('osi_user_progress_v4',progress);sessionStorage.setItem('osi_study_text_mode_v1','meaning');}, {saved,progress});
  await page.goto(base);
  const button=(name,root=page)=>root.getByRole('button',{name,exact:typeof name==='string'});
  await button('Посмотреть разбор последней попытки').click();
  await page.getByText(`${historical.questions.length} из ${historical.questions.length} верно`,{exact:true}).waitFor();
  for(const q of historical.questions) {
    const card=page.locator('.review-question').filter({hasText:q.text});
    await card.locator(':scope > summary').click();
    const answerNodes=card.locator('.review-answers .review-answer-text');
    await answerNodes.first().waitFor({state:'visible'});
    const actualAnswers=(await answerNodes.allTextContents()).map(text=>normalize(text.replace(/^\s*\d+\.\s*(?:Правильный ответ:\s*)?/,'')));
    assert.deepEqual(actualAnswers,q.answers.map(normalize),`${q.id}: full historical answer texts and order must survive restore`);
    const actualCorrect=await card.locator('.review-answers .review-answer').evaluateAll(nodes=>nodes.flatMap((el,i)=>el.classList.contains('review-answer-correct')?[i]:[]));
    assert.deepEqual(actualCorrect,q.correct,`${q.id}: historical correct indexes must survive restore`);
    if(q.id==='wifi-std-04')await card.getByText(/Сохранены прежняя формулировка/).first().waitFor();
  }
  await button(mobile?'Теория':'Теория и разборы').click();
  for(const q of questions) {
    const deep=getQuestionDeepDive(q),lesson=getLessonForQuestion(q.id),anchor=getLessonSectionForQuestion(lesson.id,q.id);
    console.log(`CHECK ${width} ${q.id} -> ${lesson.id}#${anchor??'-'}`);
    const search=page.getByPlaceholder('Поиск по тексту, теме, id...');
    // Returning from a lesson intentionally shows the source question, not the theory index.
    // Re-enter the index explicitly before opening the next independent case.
    if(!(await search.isVisible())) await button(mobile?'Теория':'Теория и разборы').click();
    await search.waitFor({state:'visible'});
    const all=button('Все');if(await all.count())await all.click();
    await search.fill(q.id);
    const rowButton=button(new RegExp(`^#${q.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')} ·`));
    await rowButton.click();
    const review=page.locator(`[data-explanation-question-id="${q.id}"]`);await review.waitFor({state:'visible'});
    const why=review.locator('[data-explanation-brief]');assert.ok(normalize(await why.innerText()).includes(normalize(deep.briefAnswer)),q.id+': actual why');
    const detail=review.locator('[data-explanation-detail]'),expand=button('Подробный разбор',detail);
    if(await expand.getAttribute('aria-expanded')==='false')await expand.click();
    await button('Простыми словами',detail).click();const plain=await detail.innerText();
    await button('По делу',detail).click();assert.notEqual(await detail.innerText(),plain,q.id+': question style changes');
    assert.ok(normalize(await detail.innerText()).includes(normalize(deep.professional.deep).slice(0,90)),q.id+': actual authored pro');
    const term=detail.locator('[data-glossary-term]').first();
    if(await term.count()) {
      // A tooltip deliberately closes on scroll/Escape. If the pointer already
      // rests on this term, hover() alone need not emit a new pointerenter.
      // Start outside the content for both inputs: earlier mouse clicks on a
      // mobile page must not leave a hover that opens before the touch gesture
      // or reopens the tooltip after Escape.
      await page.mouse.move(0,0);
      // A minimally visible inline term can remain under the fixed mobile
      // navigation or at the viewport edge. Center it before the real gesture.
      await term.evaluate(element=>element.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
      // scrollIntoView can return before the resulting scroll event is delivered.
      // GlossaryText closes on that event; wait for actual geometry to settle
      // before entering, rather than opening during an unfinished scroll.
      await term.evaluate(element=>new Promise((resolve,reject)=>{
        let previous='',stableSince=performance.now();
        const deadline=performance.now()+5000;
        const frame=()=>{
          const r=element.getBoundingClientRect();
          const current=[r.x,r.y,r.width,r.height,window.scrollX,window.scrollY].join(',');
          if(current!==previous){previous=current;stableSince=performance.now();}
          if(performance.now()-stableSince>=100){resolve(null);return;}
          if(performance.now()>deadline){reject(new Error('Glossary trigger did not stop moving'));return;}
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }));
      if(mobile) await term.tap(); else await term.hover();
      const tooltip=page.getByRole('tooltip');
      try {await tooltip.waitFor({state:'visible'});} catch(error) {
        const state=await term.evaluate(element=>{
          const r=element.getBoundingClientRect();
          return {term:element.dataset.glossaryTerm,html:element.outerHTML,
            rect:{x:r.x,y:r.y,width:r.width,height:r.height},scrollY,
            hovered:[...document.querySelectorAll(':hover')].map(e=>e.tagName+'.'+e.className),
            tooltip:document.querySelector('[role="tooltip"]')?.outerHTML??null};
        });
        await page.screenshot({path:`${output}/tooltip-failure-${q.id}-${width}.png`});
        console.error('TOOLTIP_FAILURE',q.id,width,JSON.stringify(state));
        throw error;
      }
      assert.equal(await term.getAttribute('aria-describedby'),await tooltip.getAttribute('id'),q.id+': tooltip belongs to the tested term');
      if(!mobile) {
        await page.keyboard.press('Escape');
        await tooltip.waitFor({state:'hidden'});
        // Re-enter with the pointer still at the previous hover coordinates.
        // This guards the stationary-pointer failure mode explicitly.
        await page.mouse.move(0,0);
        await term.hover();
        await tooltip.waitFor({state:'visible'});
        await page.keyboard.press('Escape');
        await tooltip.waitFor({state:'hidden'});
        await term.focus();
        await tooltip.waitFor({state:'visible'});
      }
      await page.keyboard.press('Escape');
      await tooltip.waitFor({state:'hidden'});
    }
    await button(`Перейти к уроку: ${lesson.title}`,review).click();
    await page.getByRole('heading',{name:lesson.title,exact:true}).waitFor();
    const verifyAnchor=async(stage)=>{
      if(!anchor)return;
      try {
        await page.waitForFunction(id=>{
          const e=document.querySelector(`[data-lesson-section-anchor="${id}"]`);
          if(!e)return false;
          const rect=e.getBoundingClientRect();
          return rect.bottom>0&&rect.top<innerHeight;
        },anchor);
      } catch(error) {
        const state=await page.evaluate(id=>{
          const element=document.querySelector(`[data-lesson-section-anchor="${id}"]`);
          const rect=element?.getBoundingClientRect();
          return {found:!!element,rect:rect?{top:rect.top,bottom:rect.bottom,height:rect.height}:null,
            scrollY:window.scrollY,viewport:window.innerHeight,scrollHeight:document.documentElement.scrollHeight};
        },anchor);
        throw new Error(`${q.id} ${width} anchor ${anchor} not visible at ${stage}: ${JSON.stringify(state)}; ${error.message}`);
      }
    };
    await verifyAnchor('open lesson');
    const content=anchor?page.locator(`[data-lesson-section-anchor="${anchor}"]`):page.locator('article').last();
    await button('Простыми словами').click();await verifyAnchor('switch to plain');const lessonPlain=await content.innerText();
    await button('По делу').click();await verifyAnchor('switch to professional');assert.notEqual(await content.innerText(),lessonPlain,q.id+': lesson styles differ');
    const dimensions=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,headings:[...document.querySelectorAll('article h3')].map(e=>({text:e.textContent,width:e.scrollWidth,client:e.clientWidth}))}));
    assert.ok(dimensions.page<=dimensions.viewport+1,q.id+': page overflow');
    for(const h of dimensions.headings)assert.ok(h.width<=h.client+1,`${q.id}: heading clipped ${h.text}`);
    const batch=IN_DEPTH_BATCHES.find(b=>b.questionIds.includes(q.id));
    if(!screenshots.has(`${batch.id}-${width}`)){await page.screenshot({path:`${output}/${batch.id}-${width}.png`});screenshots.add(`${batch.id}-${width}`);}
    await button(`Вернуться к вопросу ${q.id}`).click();await review.waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>localStorage.getItem('osi_last_exam_review_v1')),saved,q.id+': saved review immutable');
    assert.equal(await page.evaluate(()=>localStorage.getItem('osi_user_progress_v4')),progress,q.id+': no statistics writes');
    await button('К каталогу').click();
    await search.waitFor({state:'visible'});
    evidence.push({id:q.id,width,lessonId:lesson.id,anchor:anchor??null,questionStyles:true,lessonStyles:true,returnToQuestion:true,historicalSnapshot:true,layout:true});
    console.log(`PASS ${width} ${q.id} -> ${lesson.id}${anchor?'#'+anchor:''} -> exact return`);
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'No browser runtime errors');
}finally{await browser.close();writeFileSync(`${output}/evidence.json`,JSON.stringify({base,questions:questions.length,checks:evidence.length,evidence,errors},null,2)+'\n');}
assert.equal(evidence.length,questions.length*2);
console.log(`PASS real Chromium: ${questions.length} L2 IDs × mobile/desktop, both question/lesson styles, exact anchors/return, saved history and layout`);

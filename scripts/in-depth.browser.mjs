import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';
const {getTestingPool,getQuestionDeepDive,getLessonForQuestion,getLessonSectionForQuestion,IN_DEPTH_BATCHES,PREVIOUS_IN_DEPTH_QUESTIONS,prepareAttemptQuestions}=await bundleEntry('scripts/in-depth-entry.ts','in-depth-browser-data.mjs');
const {chromium}=await import(process.env.NETOPS_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.NETOPS_BASE_URL||'http://127.0.0.1:5428/my-gemini-mirror-site/';
const requested=process.env.NETOPS_L2_IDS?.split(',');
const questions=getTestingPool('mixed','in-depth').filter(q=>!requested||requested.includes(q.id));
assert.ok(questions.length);
const output='scripts/.cache/in-depth/browser';mkdirSync(output,{recursive:true});
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
  for(const q of historical.questions) {const card=page.locator('.review-question').filter({hasText:q.text});await card.locator(':scope > summary').click();for(const text of q.answers)await card.getByText(text,{exact:true}).first().waitFor();if(q.id==='wifi-std-04')await card.getByText(/Сохранены прежняя формулировка/).first().waitFor();}
  await button(mobile?'Теория':'Теория и разборы').click();
  for(const q of questions) {
    const deep=getQuestionDeepDive(q),lesson=getLessonForQuestion(q.id),anchor=getLessonSectionForQuestion(lesson.id,q.id);
    const all=button('Все');if(await all.count())await all.click();
    await page.getByPlaceholder('Поиск по тексту, теме, id...').fill(q.id);
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
    if(await term.count()) {await term.scrollIntoViewIfNeeded();if(mobile)await term.tap();else await term.hover();await page.getByRole('tooltip').waitFor();if(!mobile){await page.keyboard.press('Escape');await term.focus();await page.getByRole('tooltip').waitFor();}await page.keyboard.press('Escape');}
    await button(`Перейти к уроку: ${lesson.title}`,review).click();
    await page.getByRole('heading',{name:lesson.title,exact:true}).waitFor();
    const verifyAnchor=async()=>{if(!anchor)return;await page.waitForFunction(id=>{const e=document.querySelector(`[data-lesson-section-anchor="${id}"]`);if(!e)return false;const r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;},anchor);};
    await verifyAnchor();
    const content=anchor?page.locator(`[data-lesson-section-anchor="${anchor}"]`):page.locator('article').last();
    await button('Простыми словами').click();await verifyAnchor();const lessonPlain=await content.innerText();
    await button('По делу').click();await verifyAnchor();assert.notEqual(await content.innerText(),lessonPlain,q.id+': lesson styles differ');
    const dimensions=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,headings:[...document.querySelectorAll('article h3')].map(e=>({text:e.textContent,width:e.scrollWidth,client:e.clientWidth}))}));
    assert.ok(dimensions.page<=dimensions.viewport+1,q.id+': page overflow');
    for(const h of dimensions.headings)assert.ok(h.width<=h.client+1,`${q.id}: heading clipped ${h.text}`);
    const batch=IN_DEPTH_BATCHES.find(b=>b.questionIds.includes(q.id));
    if(!screenshots.has(`${batch.id}-${width}`)){await page.screenshot({path:`${output}/${batch.id}-${width}.png`});screenshots.add(`${batch.id}-${width}`);}
    await button(`Вернуться к вопросу ${q.id}`).click();await review.waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>localStorage.getItem('osi_last_exam_review_v1')),saved,q.id+': saved review immutable');
    assert.equal(await page.evaluate(()=>localStorage.getItem('osi_user_progress_v4')),progress,q.id+': no statistics writes');
    evidence.push({id:q.id,width,lessonId:lesson.id,anchor:anchor??null,questionStyles:true,lessonStyles:true,returnToQuestion:true,historicalSnapshot:true,layout:true});
    console.log(`PASS ${width} ${q.id} -> ${lesson.id}${anchor?'#'+anchor:''} -> exact return`);
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'No browser runtime errors');
}finally{await browser.close();writeFileSync(`${output}/evidence.json`,JSON.stringify({base,questions:questions.length,checks:evidence.length,evidence,errors},null,2)+'\n');}
assert.equal(evidence.length,questions.length*2);
console.log(`PASS real Chromium: ${questions.length} L2 IDs × mobile/desktop, both question/lesson styles, exact anchors/return, saved history and layout`);

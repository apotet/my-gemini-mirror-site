// PLAYWRIGHT_MODULE=/tmp/tcpip-browser/node_modules/playwright/index.mjs node scripts/tcpip-visual.browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='artifacts/tcpip-556';fs.mkdirSync(out,{recursive:true});
const raw=fs.readFileSync('src/data/lessons/tcpip-model.ts','utf8');
const lesson=JSON.parse(raw.slice(raw.indexOf('{',raw.indexOf('= ')),raw.lastIndexOf('}')+1));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const results=process.env.ROUTES_ONLY?JSON.parse(fs.readFileSync(`${out}/browser-results.json`,'utf8')).filter(r=>r.width):[];
async function open(p){await p.goto(process.env.LESSON_URL||'http://localhost:3000/my-gemini-mirror-site/');await p.getByRole('button',{name:/^Теория(?: и разборы)?$/}).click();await p.getByRole('button',{name:'База знаний',exact:true}).click();await p.getByText(lesson.title,{exact:true}).click();}
async function loadImages(p){await p.locator('article img').evaluateAll(async imgs=>{for(const i of imgs){i.loading='eager';await i.decode()}});}
for(const width of (process.env.ROUTES_ONLY?[]:[375,1440]))for(const theme of ['light','dark']){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===375,isMobile:width===375});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(t=>localStorage.setItem('osi_theme_dark',t==='dark'?'1':'0'),theme);
 await open(p);await loadImages(p);
 assert.equal(await p.locator('[data-lesson-visual]').count(),9);
 assert.equal(await p.locator('[data-lesson-cheatsheet]').count(),4);
 // Actual touch tooltip, then outside dismissal.
 const term=p.locator('article [data-glossary-term="TCP"]').first();await term.scrollIntoViewIfNeeded();if(width===375)await term.tap();else await term.click();await p.getByRole('tooltip').waitFor();
 const bounds=await p.getByRole('tooltip').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width);await p.keyboard.press('Escape');assert.equal(await p.getByRole('tooltip').count(),0);
 for(const d of await p.locator('[data-lesson-cheatsheet]').all()){
  assert.equal(await d.getAttribute('open'),null);await d.locator('summary').click();assert.notEqual(await d.getAttribute('open'),null);
 }
 await loadImages(p);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
 // Real section screenshots. Height expands for tall diagrams so fixed navigation cannot cover labels.
 const evidenceStyle=await p.addStyleTag({content:'nav.fixed { display: none !important; }'});
 const sections=await p.locator('article > div.space-y-4 > section').all();let index=0;
 for(const section of sections){
  const height=Math.ceil((await section.boundingBox()).height);await p.setViewportSize({width,height:Math.max(900,height+220)});await section.scrollIntoViewIfNeeded();await section.screenshot({style:'nav.fixed { visibility: hidden !important; }',path:`${out}/${width}-${theme}-${String(++index).padStart(2,'0')}.png`});
 }
 await evidenceStyle.evaluate(e=>e.remove());
 await p.setViewportSize({width,height:900});
 const check=p.locator('[data-lesson-knowledge-check]');
 for(const q of lesson.plainKnowledgeCheck.questions){const choice=q.choices.find(c=>c.id===q.correctChoiceId);await check.getByRole('button',{name:`${choice.id}.`+choice.label,exact:true}).click();await check.getByText('Верно',{exact:true}).waitFor();await check.getByRole('button',{name:/Следующий вопрос|Посмотреть результат/}).click();}
 await check.getByText('Результат: 7 из 7',{exact:true}).waitFor();await check.screenshot({path:`${out}/${width}-${theme}-check.png`});
 await check.getByRole('button',{name:'Пройти ещё раз'}).click();await check.getByText('Вопрос 1 из 7',{exact:true}).waitFor();
 // Existing zoom, close with Escape.
 await p.locator('[data-lesson-visual]').first().locator('button').click();await p.keyboard.press('Escape');
 // Existing style switch must restore ordinary professional content, then visual plain mode.
 await p.getByRole('button',{name:'По делу',exact:true}).click();assert.equal(await p.locator('[data-lesson-visual]').count(),0);
 await p.getByRole('button',{name:'Простыми словами',exact:true}).click();assert.equal(await p.locator('[data-lesson-visual]').count(),9);
 assert.deepEqual(errors,[]);results.push({width,theme,sections:index,checks:'7/7, restart, tooltip, disclosure, zoom, styles, no overflow, no page errors'});await context.close();
 console.log('PASS',width,theme);
}
if(!process.env.SKIP_ROUTES){
const routes=JSON.parse(fs.readFileSync(`${out}/routes.json`,'utf8'));
const p=await browser.newPage({viewport:{width:375,height:900},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await open(p);
for(const mode of ['Простыми словами','По делу']){
 await p.getByRole('button',{name:mode,exact:true}).click();
 for(const route of routes){
  console.log('route',mode,route.id);
  await p.getByRole('button',{name:route.id,exact:true}).click();
  const link=p.getByRole('button',{name:/^Перейти к уроку/});await link.evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));await link.click();
  await p.getByRole('heading',{name:lesson.title,exact:true}).waitFor();
  await p.getByRole('button',{name:`Вернуться к вопросу ${route.id}`,exact:true}).waitFor();
  if(route.anchor){const section=p.locator(`[data-lesson-section-anchor="${route.anchor}"]`);await section.waitFor();await p.waitForTimeout(450);const r=await section.boundingBox();assert(r.y<900&&r.y+r.height>0,'exact arrival '+route.id);}
  await p.getByRole('button',{name:`Вернуться к вопросу ${route.id}`,exact:true}).click();
  const backLink=p.getByRole('button',{name:/^Перейти к уроку/});await backLink.evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));await backLink.click();
 }
 console.log('PASS real routes',mode,routes.length);
}
const favorite=p.getByRole('button',{name:`Избранное: ${lesson.title}`,exact:true});await favorite.click();assert.equal(await favorite.getAttribute('aria-pressed'),'true');await favorite.click();assert.equal(await favorite.getAttribute('aria-pressed'),'false');
results.push({routes:routes.length,modes:2,roundTrips:routes.length*2,favorite:'toggle on/off'});
await p.close();
}
if(process.env.SKIP_ROUTES){const prior=JSON.parse(fs.readFileSync(`${out}/browser-results.json`,'utf8'));results.push(...prior.filter(r=>r.routes));}
await browser.close();fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify(results,null,2)+'\n');

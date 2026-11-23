// Targeted owner-review smoke: actual PoE accessory lesson on 375/1440 px.
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';
const {getLesson,getLessonForQuestion}=await bundleEntry('scripts/in-depth-entry.ts','poe-accessory-browser-entry.mjs');
const lesson=getLesson('l1-poe-injectors-splitters');
const qid='l1v2-c-injector-direction';
assert.equal(getLessonForQuestion(qid)?.id,lesson?.id);
const {chromium}=await import(process.env.NETOPS_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch();
const base=process.env.NETOPS_BASE_URL||'http://127.0.0.1:5428/my-gemini-mirror-site/';
const out='scripts/.cache/poe-accessory-browser';mkdirSync(out,{recursive:true});
try {
  for(const width of [375,1440]){
    const mobile=width===375;
    const page=await browser.newPage({viewport:{width,height:900},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
    page.setDefaultTimeout(15000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);
    await page.getByRole('button',{name:mobile?'Теория':'Теория и разборы',exact:true}).click();
    await page.getByPlaceholder('Поиск по тексту, теме, id...').fill(qid);
    await page.getByRole('button',{name:/^#l1v2-c-injector-direction ·/}).click();
    const review=page.locator(`[data-explanation-question-id="${qid}"]`);
    await review.waitFor({state:'visible'});
    await review.getByRole('button',{name:`Перейти к уроку: ${lesson.title}`}).click();
    await page.getByRole('heading',{name:lesson.title,exact:true}).waitFor();

    const schematic=page.locator('[data-lesson-cheatsheet="poe-hardware-recognition-card.svg"]');
    await schematic.waitFor({state:'visible'});
    assert.equal(await schematic.locator('img').count(),1,`${width}: hardware recognition illustration visible`);
    assert.ok(await schematic.locator('img').isVisible(),`${width}: hardware card SVG expanded`);
    const opener=schematic.getByRole('button',{name:/Открыть .* на весь экран/});
    if(mobile)await opener.tap();else await opener.click();
    const viewer=page.getByRole('dialog');
    await viewer.waitFor({state:'visible'});
    assert.ok(await viewer.locator('[data-photo-viewer-image]').isVisible(),`${width}: zoomable card in fullscreen`);
    await viewer.getByRole('button',{name:'Закрыть'}).click();
    await viewer.waitFor({state:'hidden'});
    await page.screenshot({path:`${out}/poe-accessory-plain-${width}.png`,fullPage:true});

    await page.getByRole('button',{name:'По делу',exact:true}).click();
    const proChains=page.locator('[data-lesson-cheatsheet="poe-injector-splitter-chains.svg"]');
    await proChains.waitFor({state:'visible'});
    assert.ok(await proChains.locator('img').isVisible(),`${width}: professional flows remain expanded`);
    assert.equal(await page.locator('[data-lesson-cheatsheet="poe-hardware-recognition-card.svg"]').count(),0,`${width}: plain card not duplicated in Pro`);
    const compare=page.locator('[data-lesson-cheatsheet="poe-ieee-vs-passive-compare.svg"]');
    await compare.waitFor({state:'visible'});
    assert.ok(await compare.locator('img').isVisible(),`${width}: comparison SVG expanded in pro`);
    await page.screenshot({path:`${out}/poe-accessory-pro-${width}.png`,fullPage:true});

    const term=page.locator('[data-glossary-term="Alternative A"]').first();
    await term.waitFor({state:'visible'});
    if(mobile)await term.tap();else await term.hover();
    await page.getByRole('tooltip').waitFor({state:'visible'});
    await page.keyboard.press('Escape');
    await page.getByRole('tooltip').waitFor({state:'hidden'});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(overflow<=5,`${width}: unexpected horizontal document overflow ${overflow}px`);
    assert.deepEqual(errors,[],`${width}: no browser JS errors`);
    console.log(`PASS PoE accessory lesson: ${width}px, linked question, both teaching modes, two inline SVG, scoped glossary, no overflow`);
    await page.close();
  }
}finally{await browser.close();}

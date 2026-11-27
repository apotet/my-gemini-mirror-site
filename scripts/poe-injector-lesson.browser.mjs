// Targeted owner-review smoke: actual PoE accessory lesson on 375/1440 px.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { bundleEntry } from './load-bank.mjs';
const {getLesson,getLessonForQuestion}=await bundleEntry('scripts/in-depth-entry.ts','poe-accessory-browser-entry.mjs');
const lesson=getLesson('l1-poe-injectors-splitters');
const qid='l1v2-c-injector-direction';
assert.equal(getLessonForQuestion(qid)?.id,lesson?.id);
const {chromium}=await import(process.env.NETOPS_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({...process.env.NETOPS_CHROMIUM_PATH?{executablePath:process.env.NETOPS_CHROMIUM_PATH}:{}});
const base=process.env.NETOPS_BASE_URL||'http://127.0.0.1:5428/my-gemini-mirror-site/';
const out='scripts/.cache/poe-accessory-browser';mkdirSync(out,{recursive:true});
const evidence=[];
const approved='poe-injectors-splitters-approved.png';
const assertLoaded=async(img,label)=>{await img.evaluate(async el=>{await el.decode();});assert.ok(await img.evaluate(el=>el.complete&&el.naturalWidth>0&&el.naturalHeight>0),`${label}: decoded image`);};
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

    const schematic=page.locator('[data-lesson-cheatsheet="poe-injectors-splitters-approved.png"]');
    await schematic.waitFor({state:'visible'});
    assert.equal(await schematic.locator('img').count(),1,`${width}: hardware recognition illustration visible`);
    assert.ok(await schematic.locator('img').isVisible(),`${width}: approved PNG expanded`);
    await assertLoaded(schematic.locator('img'),`${width}: approved inline PNG`);
    const response=await page.request.get(new URL(`lesson-images/${approved}`,base).href);
    assert.equal(response.status(),200,`${width}: PNG HTTP 200`);
    assert.match(response.headers()['content-type'],/image\/png/);
    assert.equal(createHash('sha256').update(await response.body()).digest('hex'),'1bd10cfa3d788a9af1d30b8e96e5b1858f1ac0ebbe4e45b333966dfec6d7b57f',`${width}: served exact attachment bytes`);
    assert.match(await schematic.innerText(),/сгенерировано ИИ/);
    const opener=schematic.getByRole('button',{name:/Открыть .* на весь экран/});
    if(mobile)await opener.tap();else await opener.click();
    const viewer=page.getByRole('dialog');
    await viewer.waitFor({state:'visible'});
    assert.ok(await viewer.locator('[data-photo-viewer-image]').isVisible(),`${width}: zoomable card in fullscreen`);
    const zoomImage=viewer.locator('[data-photo-viewer-image]');
    await assertLoaded(zoomImage,`${width}: fullscreen PNG`);
    const transform=await zoomImage.evaluate(el=>el.style.transform);
    await viewer.getByRole('button',{name:'Увеличить фото',exact:true}).click();
    await page.waitForFunction(before=>document.querySelector('[data-photo-viewer-image]')?.style.transform!==before,transform);
    await page.screenshot({path:`${out}/poe-accessory-zoom-${width}.png`});
    await viewer.getByRole('button',{name:'Закрыть'}).click();
    await viewer.waitFor({state:'hidden'});
    await page.screenshot({path:`${out}/poe-accessory-plain-${width}.png`,fullPage:true});

    await page.getByRole('button',{name:'По делу',exact:true}).click();
    const proChains=page.locator('[data-lesson-cheatsheet="poe-injector-splitter-chains.svg"]');
    await proChains.waitFor({state:'visible'});
    if (!(await proChains.locator('img').isVisible())) {
      const isOpen=await proChains.evaluate(el=>el.open);
      console.log(`PRO_DIAGRAM_DIAGNOSTIC width=${width} initiallyOpen=${isOpen}`);
      if (!isOpen) await proChains.locator('summary').click();
      await proChains.locator('img').waitFor({state:'visible'});
    }
    assert.ok(await proChains.locator('img').isVisible(),`${width}: professional flow diagram can be opened`);
    await assertLoaded(proChains.locator('img'),`${width}: original Pro chains SVG`);
    assert.equal(await page.locator('[data-lesson-cheatsheet="poe-injectors-splitters-approved.png"]').count(),0,`${width}: plain card not duplicated in Pro`);
    const compare=page.locator('[data-lesson-cheatsheet="poe-ieee-vs-passive-compare.svg"]');
    await compare.waitFor({state:'visible'});
    assert.ok(await compare.locator('img').isVisible(),`${width}: comparison SVG expanded in pro`);
    await assertLoaded(compare.locator('img'),`${width}: original Pro comparison SVG`);
    for(const file of ['poe-injector-splitter-chains.svg','poe-ieee-vs-passive-compare.svg'])assert.equal((await page.request.get(new URL(`lesson-images/${file}`,base).href)).status(),200,`${width}: Pro SVG HTTP 200`);
    await page.screenshot({path:`${out}/poe-accessory-pro-${width}.png`,fullPage:true});

    if (!mobile) await page.getByRole('switch', { name: 'Подсказки при наведении' }).click();
    const term=page.locator('[data-glossary-term="Alternative A"]').first();
    await term.waitFor({state:'visible'});
    await term.scrollIntoViewIfNeeded();
    await term.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.keyboard.press('Escape');
    if(mobile)await term.tap();else {await page.mouse.move(0,0);await term.hover();}
    await page.getByRole('tooltip').waitFor({state:'visible'});
    await page.keyboard.press('Escape');
    await page.getByRole('tooltip').waitFor({state:'hidden'});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(overflow<=5,`${width}: unexpected horizontal document overflow ${overflow}px`);
    assert.deepEqual(errors,[],`${width}: no browser JS errors`);
    await page.getByRole('button',{name:'Простыми словами',exact:true}).click();
    await schematic.waitFor({state:'visible'});
    await assertLoaded(schematic.locator('img'),`${width}: PNG after mode round trip`);
    assert.ok(await schematic.locator('img').isVisible(),`${width}: PNG visible after mode round trip`);
    assert.equal(await page.locator('[data-lesson-cheatsheet="poe-injector-splitter-chains.svg"]').count(),0,`${width}: Pro diagram not duplicated in Plain`);
    evidence.push({width,plainPNG:approved,httpStatus:200,exactAttachment:true,decoded:true,fullscreen:mobile?'tap':'click',zoomControl:true,professionalSVGs:2,modeRoundTrip:true,overflow,jsErrors:errors});
    console.log(`PASS PoE accessory lesson: ${width}px, exact PNG HTTP 200, fullscreen/zoom, both original Pro SVGs, mode round trip, no overflow`);
    await page.close();
  }
}finally{await browser.close();writeFileSync(`${out}/issue-331-evidence.json`,JSON.stringify(evidence,null,2)+'\n');}

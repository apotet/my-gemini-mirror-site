// Browser regression: the A flag inside IPv6 SLAAC is not the DNS A RR.
// Run against the actual lesson through the review-to-lesson navigation.
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';
const { getLessonForQuestion, getLessonSectionForQuestion } =
  await bundleEntry('scripts/in-depth-entry.ts','in-depth-ipv6-ra-lesson.mjs');
const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const id='review-slaac-4',lesson=getLessonForQuestion(id);
assert.equal(lesson?.id,'l3-ipv6');
assert.equal(getLessonSectionForQuestion(lesson.id,id),'in-depth-slaac-ra-address-formation');
const base=process.env.NETOPS_BASE_URL||'http://127.0.0.1:5428/my-gemini-mirror-site/';
const output='scripts/.cache/in-depth/ipv6-ra-glossary';
mkdirSync(output,{recursive:true});
const browser=await chromium.launch();
try {
  for (const width of [375,1440]) {
    const mobile=width===375, page=await browser.newPage({
      viewport:{width,height:900},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'
    });
    page.setDefaultTimeout(15000);
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);
    const button=(name,root=page)=>root.getByRole('button',{name,exact:typeof name==='string'});
    await button(mobile?'Теория':'Теория и разборы').click();
    await page.getByPlaceholder('Поиск по тексту, теме, id...').fill(id);
    await button(/^#review-slaac-4 ·/).click();
    const review=page.locator('[data-explanation-question-id="review-slaac-4"]');
    await review.waitFor({state:'visible'});
    // The question review itself must show the RA PIO Autonomous flag, not DNS A.
    await review.getByRole('button',{name:'Подробный разбор'}).click();
    for (const mode of ['Простыми словами','По делу']) {
      await button(mode,review).click();
      const term=review.locator('[data-glossary-term="A=1"]').first();
      await term.waitFor({state:'visible'});
      await term.scrollIntoViewIfNeeded();
      if(mobile) await term.tap(); else await term.hover();
      const tooltip=page.getByRole('tooltip');
      await tooltip.waitFor({state:'visible'});
      const content=await tooltip.innerText();
      assert.match(content,/SLAAC|автоном/i,`${width}/${mode}: RA flag tooltip in question review`);
      assert.doesNotMatch(content,/Address Record|Адресная запись IPv4/i,
        `${width}/${mode}: DNS A tooltip must not leak into question review`);
      await page.keyboard.press('Escape');
      await tooltip.waitFor({state:'hidden'});
    }
    await button(`Перейти к уроку: ${lesson.title}`,review).click();
    await page.getByRole('heading',{name:lesson.title,exact:true}).waitFor();
    for (const mode of ['Простыми словами','По делу']) {
      await button(mode).click();
      const term=page.locator('[data-glossary-term="A=1"]').first();
      await term.waitFor({state:'visible'});
      await term.scrollIntoViewIfNeeded();
      if(mobile) await term.tap(); else await term.hover();
      const tooltip=page.getByRole('tooltip');
      await tooltip.waitFor({state:'visible'});
      const content=await tooltip.innerText();
      assert.match(content,/SLAAC|автоном/i,`${width}/${mode}: real RA Autonomous flag tooltip`);
      assert.doesNotMatch(content,/Address Record|Адресная запись IPv4/i,
        `${width}/${mode}: DNS A must not leak into IPv6 lesson`);
      await page.keyboard.press('Escape');
      await tooltip.waitFor({state:'hidden'});
    }
    assert.deepEqual(errors,[],`${width}: no JS page errors`);
    await page.screenshot({path:`${output}/ipv6-ra-${width}.png`});
    await button(`Вернуться к вопросу ${id}`).click();
    await review.waitFor({state:'visible'});
    await page.close();
    console.log(`PASS: ${width}px real hover/tap, two teaching styles, exact lesson and return`);
  }
} finally { await browser.close(); }

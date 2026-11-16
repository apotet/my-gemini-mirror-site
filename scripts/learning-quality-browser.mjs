import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync } from 'node:fs';
const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.NETOPS_BASE_URL??'http://127.0.0.1:5428/my-gemini-mirror-site/';
const output='scripts/.cache/quality-browser';mkdirSync(output,{recursive:true});
const browser=await chromium.launch({...(process.env.NETOPS_CHROMIUM_PATH?{executablePath:process.env.NETOPS_CHROMIUM_PATH}:{})}),evidence=[];
try {
 for(const width of [375,1440]) {
  const page=await browser.newPage({viewport:{width,height:900},isMobile:width===375,hasTouch:width===375});
  page.setDefaultTimeout(12000);
  await page.goto(base);
  await page.getByRole('button',{name:width===375?'Теория':'Теория и разборы',exact:true}).click();
  await page.getByRole('button',{name:'База знаний',exact:true}).click();
  // Select actual lesson via the existing catalog, without injecting teaching data.
  const lesson=page.getByRole('button').filter({hasText:/Wi.Fi.*безопасност|Безопасност.*Wi.Fi/i});
  await lesson.first().click();
  const heading=page.getByRole('heading',{level:2}).filter({hasText:/Wi.Fi/i}).first();
  await heading.waitFor();
  const psk=page.getByRole('heading').filter({hasText:/WPA2-PSK/}).first().locator('[data-glossary-term="PSK"]');
  await psk.scrollIntoViewIfNeeded();
  if(width===375) await psk.tap(); else await psk.hover();
  const popup=page.getByRole('tooltip');await popup.waitFor();
  assert.match(await popup.innerText(),/Pre.Shared Key|предварительно/i);
  if(width===1440) {await page.keyboard.press('Escape');await popup.waitFor({state:'hidden'});await psk.focus();await popup.waitFor();}
  const rect=await popup.boundingBox();assert.ok(rect.x>=0 && rect.x+rect.width<=width+1);
  await page.screenshot({path:`${output}/psk-${width}.png`});
  assert.ok(await heading.locator('[data-glossary-term]').count()>0,'Actual lesson title contains interactive terms');
  await page.keyboard.press('Escape');
  const headings=await page.locator('h3').evaluateAll(elements=>elements.map(e=>({text:e.textContent,scroll:e.scrollWidth,client:e.clientWidth})));
  for(const item of headings) assert.ok(item.scroll<=item.client+1,`Heading clipped: ${JSON.stringify(item)}`);
  evidence.push({width,tooltip:'PSK in raw WPA2-PSK heading',actions:width===375?['tap']:['hover','keyboard focus'],titleInteractive:true,headingsContained:true});
  await page.close();
 }
} finally {await browser.close();writeFileSync(`${output}/evidence.json`,JSON.stringify(evidence,null,2));}
console.log('PASS',JSON.stringify(evidence));

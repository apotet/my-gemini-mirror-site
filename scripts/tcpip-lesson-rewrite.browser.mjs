// Run against a built preview. For comparison screenshots, use TCPIP_BASELINE_URL and TCPIP_EVIDENCE_PATH.
// Baseline may be the published mirror; no state-changing network methods are allowed in either context.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const curl = promisify(execFile);
const replay = process.env.TCPIP_REPLAY_PUBLISHED;
const snapshots = new Map();
if (replay) await mkdir(replay,{recursive:true});
function replayFromHttps(url) {
  if (!snapshots.has(url)) snapshots.set(url,(async () => {
    const file=join(replay,createHash('sha256').update(url).digest('hex'));
    const path=new URL(url).pathname;
    const known=path.endsWith('/')?'text/html':path.endsWith('.js')?'text/javascript':path.endsWith('.css')||path==='/css2'?'text/css':
      path.endsWith('.svg')?'image/svg+xml':path.endsWith('.woff2')?'font/woff2':path.endsWith('.ttf')?'font/ttf':null;
    let body=null, contentType=known;
    if (known) { try { body=await readFile(file); } catch { /* first verified fetch */ } }
    if (!body) {
      const {stdout} = await curl('curl',['-fsSL','--retry','1','--max-time','20','-o',file,'-w','%{content_type}',url]);
      body=await readFile(file);
      contentType=stdout || known || 'application/octet-stream';
    }
    return {body,contentType,sha256:createHash('sha256').update(body).digest('hex')};
  })());
  return snapshots.get(url);
}

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const candidate = process.env.TCPIP_BASELINE_ONLY ? null : process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5694/my-gemini-mirror-site/';
const baseline = process.env.TCPIP_BASELINE_URL;
const evidence = process.env.TCPIP_EVIDENCE_PATH;
const widths = (process.env.TCPIP_WIDTHS || '375,768,1440').split(',').map(Number);
const title = 'TCP/IP: четыре уровня и инкапсуляция';
const layouts = [
  { id: 'plain', label: 'Простыми словами', stored: 'meaning' },
  { id: 'pro', label: 'По делу', stored: 'professional' },
];
const matchedVisuals = ['layers', 'osi', 'pack', 'unpack', 'addresses'];
const matchedAnchors = ['in-depth-four-five-layer-link', 'in-depth-application-protocol-semantics', 'tcpip-end-to-end-fields'];
assert(candidate || baseline, 'A local candidate or read-only published baseline is required');
for (const address of [candidate, baseline].filter(Boolean)) {
  const u = new URL(address);
  assert(['127.0.0.1', 'localhost', '[::1]'].includes(u.hostname)
    || (address === baseline && u.origin === 'https://apotet.github.io' && u.pathname === '/my-gemini-mirror-site/'),
  'Use a loopback build or the read-only published NetOps mirror');
}

const browser = await chromium.launch({
  executablePath: process.env.NETOPS_CHROMIUM_PATH || undefined,
  args: ['--disable-dev-shm-usage'],
});
const all = {};
const openButton = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
const byHeading = page => page.getByRole('heading', { name: title, exact: true, level: 2 });
const article = page => page.locator('article').filter({ has: byHeading(page) });
const keyVisual = (lesson, name) => lesson.locator(`[data-lesson-visual="tcpip-${name}.svg"]`);
const exactLessonUrl = address => {
  const url = new URL(address);
  url.searchParams.set('lesson', 'tcpip-model');
  return url.href;
};
const settle = element => element.evaluate(el => {
  el.scrollIntoView({ behavior: 'instant', block: 'center' });
  return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
});
async function loadImages(scope) {
  await scope.locator('img').evaluateAll(async images => {
    const exposed = images.filter(image => !image.closest('details:not([open]), [hidden]'));
    for (const image of exposed) image.loading = 'eager';
    await Promise.all(exposed.map(image => image.decode()));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}
async function selectMode(lesson, mode) {
  const control = openButton(lesson, mode.label);
  if (await control.getAttribute('aria-pressed') !== 'true') await control.click();
  assert.equal(await control.getAttribute('aria-pressed'), 'true', `active ${mode.label}`);
}
async function contextFor(name, url, width, theme) {
  const mobile = width < 500;
  const context = await browser.newContext({
    viewport: { width, height: mobile ? 667 : 900 }, isMobile: mobile, hasTouch: mobile,
    reducedMotion: 'reduce', colorScheme: theme,
  });
  await context.addInitScript(theme => localStorage.setItem('osi_theme_dark', theme === 'dark' ? '1' : '0'), theme);
  const origin = new URL(url).origin;
  const fonts = new Set(['https://fonts.googleapis.com', 'https://fonts.gstatic.com']);
  const scripts = new Set();
  await context.route('**/*', async route => {
    const request = route.request();
    const target = new URL(request.url()).origin;
    if (request.method() !== 'GET' || (target !== origin && !fonts.has(target))) return route.abort();
    if (target === origin && request.resourceType() === 'script') scripts.add(new URL(request.url()).pathname);
    if (replay && (fonts.has(target) || (name === 'before' && target === 'https://apotet.github.io'))) {
      try {
        const {body,contentType}=await replayFromHttps(request.url());
        return route.fulfill({status:200,body,contentType,headers:{'Access-Control-Allow-Origin':'*'}});
      } catch (error) {
        console.error('Read-only asset replay failed',new URL(request.url()).pathname,error.message);
        return route.abort();
      }
    }
    if (fonts.has(target) && name !== 'before') return route.abort();
    return route.continue();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  return {context,page,errors,scripts};
}
async function measure(lesson) {
  return lesson.evaluate(root => {
    const box = node => {
      const r = node.getBoundingClientRect();
      return { left: r.left, right: r.right, w: Math.round(r.width), h: Math.round(r.height) };
    };
    const visuals = [...root.querySelectorAll('[data-lesson-visual], [data-lesson-cheatsheet][open]')]
      .filter(node => node.getClientRects().length)
      .map(node => {
        const image = node.querySelector('img');
        const alt = image?.alt ?? '';
        const preview = image ? box(image) : null;
        return {
          name: node.dataset.lessonVisual ?? node.dataset.lessonCheatsheet,
          src: image ? new URL(image.currentSrc || image.src).pathname : null,
          alt, preview,
          intrinsic: image ? [image.naturalWidth, image.naturalHeight] : null,
        };
      });
    return {
      pageWidth: document.documentElement.scrollWidth,
      articleHeight: Math.round(root.getBoundingClientRect().height),
      pageHeight: document.documentElement.scrollHeight,
      reviewStatus: root.querySelector('[data-lesson-review-status]')?.dataset.lessonReviewStatus ?? null,
      anchors: [...root.querySelectorAll('[data-lesson-section-anchor]')].map(node => node.dataset.lessonSectionAnchor),
      images: visuals,
      sheets: [...root.querySelectorAll('[data-lesson-cheatsheet]')].map(node=>({
        file: node.dataset.lessonCheatsheet, visible: !!node.getClientRects().length, open: node.open,
      })),
    };
  });
}
async function capture(page, lesson, folder, prefix) {
  if (!folder) return;
  const save = (suffix, options = {}) => page.screenshot({
    path: join(folder, `${prefix}-${suffix}.png`), animations: 'disabled', timeout: 60000, ...options,
  });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await save('entry');
  await save('full', { fullPage: true });
  const crop = async (selector, suffix) => {
    if (await selector.count() !== 1) return;
    // Landmark top is fixed 80px below the viewport top, except when document end clamps it.
    await selector.evaluate(node => window.scrollTo({
      top: window.scrollY + node.getBoundingClientRect().top - 80, behavior: 'instant',
    }));
    await save(suffix);
  };
  for (const name of matchedVisuals) await crop(keyVisual(lesson,name), `diagram-${name}`);
  for (const id of matchedAnchors) await crop(lesson.locator(`[data-lesson-section-anchor="${id}"]`),`anchor-${id}`);
}

async function inspect(name, address) {
  const folder = evidence ? join(evidence, name) : null;
  if (folder) await mkdir(folder, { recursive: true });
  all[name] = [];
  for (const width of widths) for (const theme of ['light','dark']) {
    const {context,page,errors,scripts}=await contextFor(name,address,width,theme);
    try {
      const response = await page.goto(exactLessonUrl(address), {waitUntil:'domcontentloaded', timeout:90000});
      assert(response?.ok(), `response ${response?.status()} for ${address}`);
      const lesson = article(page);
      await byHeading(page).waitFor();
      assert.equal(await page.locator('html').evaluate(node=>node.classList.contains('dark')), theme==='dark');
      await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve=>setTimeout(resolve,3000))]));
      const modes = [];
      for (const mode of layouts) {
        await selectMode(lesson,mode);
        await loadImages(lesson);
        const reading = await measure(lesson);
        assert(reading.pageWidth <= width+1);
        const prefix=`${width}-${theme}-${mode.id}`;
        await capture(page,lesson,folder,prefix);
        if (name === 'after') await validateReading(page,lesson,mode,reading,width,folder,prefix);
        modes.push({mode:mode.id,...reading});
      }
      assert.deepEqual(errors, []);
      all[name].push({width,theme,modes,scripts:[...scripts].sort(),url:page.url()});
      console.log('PASS',name,width,theme,modes.map(m=>`${m.mode}:${m.articleHeight}px/${m.images.length} figures`).join(', '));
    } finally {
      await context.close();
    }
  }
}

function fit(image, width) {
  assert(image.preview && image.intrinsic && image.alt, JSON.stringify(image));
  const [w,h]=image.intrinsic;
  assert(w>0&&h>0&&image.preview.w>0&&image.preview.h>0, JSON.stringify(image));
  assert(image.preview.left>=-1&&image.preview.right<=width+1, JSON.stringify(image));
  assert(Math.abs(image.preview.w/image.preview.h/(w/h)-1)<0.03,'retain diagram aspect ratio: '+JSON.stringify(image));
}
async function zoom(page, figure, path) {
  const trigger = openButton(figure,/на весь экран/);
  await trigger.waitFor();
  const preview=await figure.locator('img:visible').first().evaluate(node=>node.currentSrc);
  await settle(trigger);
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog=page.getByRole('dialog');
  await dialog.waitFor();
  const expanded = dialog.locator('[data-photo-viewer-image]');
  await expanded.waitFor();
  await expanded.evaluate(node=>node.decode());
  assert.equal(await expanded.evaluate(node=>node.currentSrc),preview,'fullscreen uses the visible diagram variant');
  const zoomIn=openButton(dialog,'Увеличить фото');
  const before=await expanded.boundingBox();
  await zoomIn.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(oldWidth=>document.querySelector('[data-photo-viewer-image]').getBoundingClientRect().width>oldWidth*1.15,before.width);
  if(path)await page.screenshot({path,animations:'disabled'});
  await page.keyboard.press('Escape');
  await dialog.waitFor({state:'hidden'});
  await page.waitForFunction(el=>document.activeElement===el,await trigger.elementHandle());
}
async function verifyTooltip(page, lesson) {
  const terms=lesson.locator('[data-tcpip-terms]');
  assert.equal(await terms.count(),1,'one scoped terms group');
  if(await terms.getAttribute('open')===null) await terms.locator('summary').press('Enter');
  const control=lesson.getByRole('switch',{name:'Подсказки при наведении'});
  await control.waitFor();
  if(await control.getAttribute('aria-checked')==='true')await control.click();
  const term=lesson.locator('[data-glossary-term="TCP"]:visible').first();
  await settle(term);
  assert.equal(await term.getAttribute('data-glossary-hover'),null);
  await term.focus();
  await page.keyboard.press('Enter');
  const popup=page.getByRole('tooltip');
  await popup.waitFor();
  const bounds=await popup.boundingBox();
  assert(bounds.x>=0&&bounds.x+bounds.width<=await page.evaluate(()=>innerWidth));
  await page.keyboard.press('Escape');
  await popup.waitFor({state:'hidden'});
  await control.click();
  assert.equal(await term.getAttribute('data-glossary-hover'),'on');
  await control.click();
  assert.equal(await term.getAttribute('data-glossary-hover'),null);
}
const packetTree = lesson=>lesson.locator('[data-tcpip-packet-details]');
const exercise = lesson=>lesson.locator('[data-tcpip-prediction]');
const protectedStorage = page=>page.evaluate(() => Object.fromEntries(Object.entries(localStorage)
  .filter(([key])=>/^osi_/.test(key)&&!/^osi_theme/.test(key)).sort(([a],[b])=>a.localeCompare(b))));

async function preparePrediction(page, lesson, folder, prefix) {
  const task=exercise(lesson);
  await task.waitFor();
  const condition=await task.innerText();
  assert.match(condition,/напрямую/);
  assert.match(condition,/NAT и прокси нет/);
  const radios=task.getByRole('radio');
  assert.equal(await radios.count(),3);
  assert.equal(await task.locator('input:checked').count(),0);
  const result=task.locator('[data-tcpip-prediction-result]');
  assert.equal(await result.count(),0,'no answer data in the DOM before attempting');
  assert.doesNotMatch(await task.ariaSnapshot(),/TTL: 64 → 63|Выходной кадр.*MAC сервера/);
  const submit=openButton(task,'Проверить ответ');
  await radios.first().focus();
  await page.keyboard.press('Space');
  assert(await radios.first().isChecked());
  await submit.press('Enter');
  await task.getByRole('status').getByText(/не меняет адрес конечного сервера/).waitFor();
  assert.equal(await result.count(),0,'wrong prediction does not expose full comparison');
  await radios.first().focus();
  await page.keyboard.press('ArrowDown');
  assert(await radios.nth(1).isChecked());
  await submit.press('Enter');
  await result.waitFor();
  const comparison=await result.innerText();
  assert.match(comparison,/Входной кадр\s*MAC клиента → MAC входного интерфейса/);
  assert.match(comparison,/Выходной кадр\s*MAC выходного интерфейса → MAC сервера/);
  assert.match(comparison,/TTL: 64 → 63.+Контрольная сумма заголовка IPv4 пересчитывается/);
  assert.match(comparison,/IP-адреса клиента и сервера и порты\s*51514 → 80\s*не меняются/);
  if(folder) {
    await result.evaluate(node=>window.scrollTo({top:window.scrollY+node.getBoundingClientRect().top-80,behavior:'instant'}));
    await page.screenshot({path:join(folder,`${prefix}-inspector-result.png`),animations:'disabled'});
  }
  return result;
}

async function validateReading(page,lesson,mode,reading,width,folder,prefix) {
  assert.equal(await lesson.getAttribute('data-lesson-reading'),'tcpip');
  assert.equal(reading.reviewStatus,'needs-review','owner status remains pending');
  assert.equal(await page.locator('[data-theory-catalog-header]:visible').count(),0,'catalog chrome hidden only inside TCP/IP');
  for(const image of reading.images)fit(image,width);
  const visibleText=await lesson.innerText();
  assert.doesNotMatch(visibleText,/CAP_NET_RAW|В этой среде недоступен захват/);
  for(const id of matchedAnchors)assert(reading.anchors.includes(id),`exact anchor preserved: ${id}`);
  assert.equal(new Set(reading.anchors).size,reading.anchors.length,'no duplicate DOM anchors');
  const lessonCheck=lesson.locator('[data-lesson-knowledge-check]');
  await lessonCheck.waitFor();
  if(mode.id==='plain'){
    assert(reading.images.length>=4,'plain retains illustrated mental models');
    assert.equal(reading.sheets.filter(sheet=>sheet.visible).length,0,'bitfield sheets absent from the simple visual flow');
    assert.equal(await packetTree(lesson).count(),0,'packet details belongs to professional mode');
    assert.doesNotMatch(visibleText,/Начни захват|Decode As|Wireshark.*системные права/);
    for(const id of matchedVisuals)await keyVisual(lesson,id).waitFor();
    await zoom(page,keyVisual(lesson,'layers'),folder&&join(folder,`${prefix}-zoom.png`));
    await verifyTooltip(page,lesson);
    const before=await protectedStorage(page);
    const result=await preparePrediction(page,lesson,folder,prefix);
    assert.deepEqual(await protectedStorage(page),before,'lesson prediction cannot change a persisted record');
    const practice=openButton(result,'Попробовать в „Пути пакета“');
    if(await practice.count()) {
      await practice.click();
      await page.getByRole('region',{name:'Путь пакета',exact:true}).waitFor();
      await openButton(page,'Вернуться к уроку').click();
      await result.waitFor();
      await page.waitForFunction(el=>document.activeElement===el,await practice.elementHandle());
      assert.equal(await openButton(lesson,mode.label).getAttribute('aria-pressed'),'true');
    }
    const deepLink=lesson.locator('[data-tcpip-open-packet-details]');
    await deepLink.press('Enter');
    const tree=packetTree(lesson);
    await tree.waitFor();
    assert.equal(await openButton(lesson,'По делу').getAttribute('aria-pressed'),'true');
    await page.waitForFunction(element=>{const rect=element.getBoundingClientRect();return rect.top<innerHeight&&rect.bottom>0;},await tree.elementHandle());
    assert(await tree.isVisible(),'simple-to-pro link lands at the teaching mock');
    await selectMode(lesson,mode);
  } else {
    assert.equal(await exercise(lesson).count(),0,'no repeated prediction in professional mode');
    const tree=packetTree(lesson);
    await tree.waitFor();
    assert.match(await tree.innerText(),/учебный макет.*не скриншот.*не реальный захват/s);
    const rows=tree.locator('details');
    assert.equal(await rows.count(),4);
    const labels=['Ethernet II','Internet Protocol Version 4','Transmission Control Protocol','Hypertext Transfer Protocol'];
    for(const [i,item] of (await rows.all()).entries()){
      assert.equal(await item.getAttribute('open'),null);
      assert.equal((await item.locator('summary').innerText()).trim(),labels[i]);
      await item.locator('summary').press('Enter');
      assert.equal(await item.getAttribute('open'),'');
      if(i===2)await item.getByText(/Src Port: 51514 · Dst Port: 80/).waitFor();
    }
    if(folder) {
      await settle(tree);
      await page.screenshot({path:join(folder,`${prefix}-packet-details.png`),animations:'disabled'});
    }
    const sheets=lesson.locator('[data-lesson-cheatsheet]:visible');
    assert.equal(await sheets.count(),4,'four existing Ethernet/IPv4/TCP/UDP sheets in professional mode');
    for(const sheet of await sheets.all()){
      const outer=sheet.locator(':scope > summary');
      assert.equal(await sheet.getAttribute('open'),null);
      await outer.press('Enter');
      assert.equal(await sheet.getAttribute('open'),'');
      await loadImages(sheet);
      const description=sheet.locator('[data-lesson-visual-description] details');
      await description.locator('summary').press('Enter');
      assert.equal(await description.getAttribute('open'),'');
      assert((await description.ariaSnapshot()).length > 100,'text equivalent accessible when requested');
      const name=await sheet.getAttribute('data-lesson-cheatsheet');
      const size=(await measure(lesson)).images.find(image=>image.name===name);
      fit(size,width);
      await zoom(page,sheet);
      await outer.press('Enter');
      assert.equal(await sheet.getAttribute('open'),null);
    }
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
}

async function validateRoutes(address) {
  const routes=JSON.parse(await readFile(new URL('../artifacts/tcpip-556/routes.json',import.meta.url),'utf8'));
  for(const width of [375,1440].filter(value=>widths.includes(value))){
    const {context,page,errors}=await contextFor('after',address,width,'light');
    try {
      const lesson=article(page);
      const mobile=width<500;
      await page.goto(exactLessonUrl(address));
      await byHeading(page).waitFor();
      const linked=['tcp-08','tcpip-x12','tcp-01','tcp-02','tcp-03','tcpip-x01','tcpip-x02','tcpip-x05','tcpip-x06','tcpip-x15'];
      for(const id of linked)await openButton(lesson,id).waitFor();
      for(const [i,{id,anchor}] of routes.entries()){
        // Exercise all 16 known linked routes in both modes across the two
        // widths; each same selected mode is checked after returning to review.
        for(const mode of layouts){
          await page.goto(exactLessonUrl(address));
          await byHeading(page).waitFor();
          await selectMode(lesson,mode);
          await openButton(lesson,'К каталогу уроков').click();
          if(await openButton(page,'Разборы вопросов').count())await openButton(page,'Разборы вопросов').click();
          else await openButton(page,mobile?'Теория':'Теория и разборы').click();
          await page.getByPlaceholder('Поиск по тексту, теме, id...').fill(id);
          await openButton(page,new RegExp('^#'+id+' ·')).click();
          const review=page.locator(`[data-explanation-question-id="${id}"]`);
          await openButton(review,'Перейти к уроку: '+title).click();
          await byHeading(page).waitFor();
          assert.equal(await openButton(lesson,mode.label).getAttribute('aria-pressed'),'true');
          if(anchor){
            const target=lesson.locator(`[data-lesson-section-anchor="${anchor}"]`);
            await target.waitFor();
            await page.waitForFunction(el=>document.activeElement===el,await target.elementHandle());
            assert(await target.evaluate(el=>{const box=el.getBoundingClientRect();return box.top<innerHeight&&box.bottom>0;}));
          }
          await openButton(lesson,'Вернуться к вопросу '+id).click();
          await review.waitFor();
        }
        console.log('PASS exact question round trip',width,i+1,id,anchor??'lesson entry','both modes');
      }
      assert.deepEqual(errors,[]);
    } finally { await context.close(); }
  }
}

async function validateProgress(address) {
  const {context,page,errors}=await contextFor('after',address,1440,'light');
  try {
    await page.goto(address);
    await openButton(page,'Начать тестирование').first().click();
    await page.getByText(/^Вопрос 1 из /).waitFor();
    const active=await page.evaluate(()=>localStorage.getItem('osi_active_session'));
    assert(active,'a real exam attempt exists before TCP/IP');
    await openButton(page,'Теория и разборы').click();
    await openButton(page,'База знаний').click();
    await openButton(page,'База').click();
    await openButton(page,'По порядку изучения').click();
    await page.locator('[data-catalog-lesson="l3-arp"]').click();
    const arpTitle='ARP: чей MAC нужен для IP';
    await page.getByRole('heading',{name:arpTitle,exact:true,level:2}).waitFor();
    await openButton(page,'Избранное: '+arpTitle).click();
    const before=await protectedStorage(page);
    assert.equal(before.osi_knowledge_beginner_resume_v1,'l3-arp');
    assert(before.osi_knowledge_favorites_v1.includes('l3-arp'));
    assert.equal(before.osi_active_session,active);
    await page.goto(exactLessonUrl(address));
    const lesson=article(page);
    await byHeading(page).waitFor();
    await selectMode(lesson,layouts[1]);
    await page.reload({waitUntil:'domcontentloaded'});
    await byHeading(page).waitFor();
    assert.equal(await openButton(lesson,'По делу').getAttribute('aria-pressed'),'true');
    await packetTree(lesson).waitFor();
    assert.deepEqual(await protectedStorage(page),before,'reload and routing preserve genuine exam/resume/favorite data');
    await openButton(page,'К каталогу уроков').click();
    await page.locator('[data-theory-catalog-header]:visible').waitFor();
    await openButton(page,'Избранное').click();
    await page.locator('[data-catalog-lesson="l3-arp"]').waitFor();
    assert.deepEqual(errors,[]);
    console.log('PASS F5 mode, exam active attempt, authored Beginner resume and saved favorite');
  } finally { await context.close(); }
}

try {
  if (baseline) await inspect('before', baseline);
  if (candidate) {
    if (!process.env.TCPIP_ROUTES_ONLY) await inspect('after', candidate);
    if (!process.env.TCPIP_SKIP_ROUTES) await validateRoutes(candidate);
    if (!process.env.TCPIP_SKIP_PROGRESS) await validateProgress(candidate);
  }
} finally {
  await browser.close();
  if (evidence) {
    await mkdir(evidence,{recursive:true});
    const file=join(evidence,candidate?'candidate.json':'baseline.json');
    await writeFile(file,JSON.stringify(all,null,2)+'\n');
    if(replay) {
      const hashes = {};
      for(const [url,result] of snapshots) {
        try { hashes[url] = (await result).sha256; } catch { hashes[url] = null; }
      }
      await writeFile(join(evidence,candidate?'candidate-asset-hashes.json':'baseline-asset-hashes.json'),JSON.stringify(hashes,null,2)+'\n');
    }
  }
}

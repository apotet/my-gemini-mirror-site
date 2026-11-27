import assert from 'node:assert/strict';
const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5497/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const title = 'ARP: чей MAC нужен для IP';
const anchors = [
  'arp-local-or-gateway-mac', 'proxy-arp-masks-network-error',
  'in-depth-arp-evidence-and-duplicate', 'indepth-arp-local-delivery',
];
const button = (root, name) => root.getByRole('button', {name, exact: typeof name === 'string'});
try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const context = await browser.newContext({viewport:{width,height:820},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.setDefaultTimeout(10000);
    await page.goto(base);
    await button(page, mobile ? 'Теория' : 'Теория и разборы').click();
    await button(page, 'База знаний').click();
    await page.getByPlaceholder('Поиск: SNI, TLS, сертификат…').fill(title);
    await page.getByText(title, {exact:true}).click();
    await page.getByRole('heading',{name:title,level:2,exact:true}).waitFor();
    for (const [mode, checkName, correct] of [
      ['Простыми словами','Самопроверка: чей MAC нужен?',/Цель запроса — шлюз.*MAC кадра принадлежит шлюзу/],
      ['По делу','Самопроверка: что доказывает ARP-ответ?',/Есть ARP-ответ в локальном сегменте/],
    ]) {
      await button(page, mode).click();
      for (const a of anchors) assert.equal(await page.locator(`[data-lesson-section-anchor="${a}"]`).count(), 1, mode + ':' + a);
      const check=page.getByRole('region',{name:checkName,exact:true});
      await check.waitFor();
      if (mode === 'Простыми словами') await check.getByText(/Пригодной записи для шлюза ещё нет/).waitFor();
      else await check.getByText(/В захвате есть ARP Reply/).waitFor();
      await button(check,correct).click();
      await check.getByText('Верно',{exact:true}).waitFor();
      await button(check,'Посмотреть результат').click();
      await check.getByText('Результат: 1 из 1',{exact:true}).waitFor();
    }
    const terms = button(page, 'next hop');
    await terms.click();
    const card=page.getByRole('region',{name:'next hop',exact:true});
    await card.getByText(/Следующий узел, которому передаётся пакет/).waitFor();
    await button(card,'Закрыть карточку термина').click();
    const stand = button(page.getByRole('region',{name:'Что дальше',exact:true}), 'Открыть стенд');
    await stand.click();
    await button(page,'Вернуться к уроку').click();
    await stand.waitFor();
    await page.waitForFunction(el => el === document.activeElement,await stand.elementHandle());
    assert.equal(await button(page,'По делу').getAttribute('aria-pressed'),'true');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1));
    assert.deepEqual(errors,[]);
    console.log(`PASS ${width}: both ARP self-checks, four anchored sections in each mode, next-hop card and stand round trip`);
    await context.close();
  }
} finally { await browser.close(); }

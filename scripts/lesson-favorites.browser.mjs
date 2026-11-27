import assert from 'node:assert/strict';
const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5572/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const arp = 'ARP: чей MAC нужен для IP';
const key = 'osi_knowledge_favorites_v1';

try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    const b = name => page.getByRole('button', { name, exact: true });
    const search = page.getByPlaceholder('Поиск: SNI, TLS, сертификат…');
    const card = page.locator('[data-catalog-lesson="l3-arp"]');
    const section = page.getByRole('region', { name: 'Избранные уроки' });
    const heading = page.getByRole('heading', { name: arp, exact: true, level: 2 });
    const star = b('Избранное: ' + arp);
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.setDefaultTimeout(10000);
    const catalog = async () => {
      await b(mobile ? 'Теория' : 'Теория и разборы').click();
      await b('База знаний').click();
    };
    await page.goto(base);
    await catalog();
    await b('Избранное').click();
    await section.getByText(/Пока пусто/).waitFor();
    await b('Уроки').click();
    await search.fill(arp);
    const before = await card.innerText();
    await star.click();
    assert.equal(await star.getAttribute('aria-pressed'), 'true');
    assert.equal(await heading.count(), 0);
    assert.equal(await card.innerText(), before);
    await b('Избранное').click();
    assert.equal(await section.locator('[data-catalog-lesson]').count(), 1);
    await card.click();
    await heading.waitFor();
    assert.equal(await star.getAttribute('aria-pressed'), 'true');
    await star.click();
    assert.equal(await star.getAttribute('aria-pressed'), 'false');
    await star.click();
    await b('К каталогу уроков').click();
    await section.getByText('Сохранено уроков: 1').waitFor();
    await page.reload();
    await catalog();
    await b('Избранное').click();
    await section.getByText('Сохранено уроков: 1').waitFor();
    await star.click();
    await section.getByText(/Пока пусто/).waitFor();
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Избранное');
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key), []);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`PASS ${width}: add/remove from catalog and lesson, persistence, unchanged card/status, focus fallback`);
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(key => {
    localStorage.setItem(key, 'not json');
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('Test blocked storage', 'QuotaExceededError');
      return set.call(this, name, value);
    };
  }, key);
  const page = await context.newPage();
  await page.goto(base);
  await page.getByRole('button', { name: 'Теория и разборы', exact: true }).click();
  await page.getByRole('button', { name: 'База знаний', exact: true }).click();
  await page.getByPlaceholder('Поиск: SNI, TLS, сертификат…').fill(arp);
  await page.getByRole('button', { name: 'Избранное: ' + arp, exact: true }).click();
  await page.getByRole('button', { name: 'Избранное', exact: true }).click();
  await page.getByRole('region', { name: 'Избранные уроки' }).getByText('Сохранено уроков: 1').waitFor();
  assert.equal(await page.evaluate(key => localStorage.getItem(key), key), 'not json');
  await context.close();
  console.log('PASS: invalid or unwritable storage remains usable in the current tab');
} finally {
  await browser.close();
}

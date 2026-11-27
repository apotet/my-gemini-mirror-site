import assert from 'node:assert/strict';
const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5571/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const arp = 'ARP: чей MAC нужен для IP';
const route = 'L3: маршрут к назначению и самая длинная маска';
const search = 'Поиск: SNI, TLS, сертификат…';

try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    const b = name => page.getByRole('button', { name, exact: typeof name === 'string' });
    const heading = name => page.getByRole('heading', { name, level: 2, exact: true });
    const catalog = async () => {
      await b(mobile ? 'Теория' : 'Теория и разборы').click();
      await b('База знаний').click();
      await page.getByPlaceholder(search).waitFor();
    };
    const cards = page.locator('[data-catalog-lesson]');
    const ids = () => cards.evaluateAll(elements => elements.map(el => el.getAttribute('data-catalog-lesson')));
    const card = id => page.locator(`[data-catalog-lesson="${id}"]`);
    const nav = page.getByRole('navigation', { name: 'Учебный маршрут' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(10000);
    await page.goto(base);
    await catalog();
    await b('База').click();
    const original = await ids();
    assert.equal(original.length, 30);
    await b('А–Я').click();
    const alphabet = await ids();
    assert.notDeepEqual(alphabet, original);
    assert.deepEqual([...alphabet].sort(), [...original].sort());
    const titles = await cards.locator('.font-semibold.text-slate-900').allTextContents();
    const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });
    assert.equal(titles.length, 30);
    assert(titles.every((title, index) => !index || collator.compare(titles[index - 1], title) <= 0));
    await b('Как сейчас').click();
    assert.deepEqual(await ids(), original);
    await b('По порядку изучения').click();
    const study = await ids();
    assert.equal(new Set(study).size, 30);
    assert.deepEqual([...study].sort(), [...original].sort());
    assert.deepEqual(study.slice(0, 4), ['tcpip-model', 'osi-pdu', 'l1-copper-cable', 'l2-ethernet']);
    assert.equal(study[17], 'ts-cli-network-basics');

    for (const sort of ['По порядку изучения', 'А–Я', 'Как сейчас']) {
      await b(sort).click();
      await b('L5–L7').click();
      assert.equal((await ids()).length, 9);
      await card('osi-session-presentation').waitFor();
      await b('L7').click();
      assert.equal((await ids()).length, 8);
      await b('Все темы').click();
    }

    await b('По порядку изучения').click();
    await card('tcpip-model').click();
    assert.equal(await nav.getByRole('button', { name: /^Предыдущий:/ }).count(), 0);
    await b('К каталогу уроков').click();
    await card('ts-cli-network-basics').click();
    assert.equal(await nav.getByRole('button', { name: /^Следующий:/ }).count(), 0);
    await b('К каталогу уроков').click();
    await card('l1-poe-budget').click();
    await nav.getByText('Дополнительный урок').waitFor();
    await nav.getByRole('button', { name: /^Следующий:.*сплиттеры/i }).waitFor();
    await b('К каталогу уроков').click();
    await page.getByPlaceholder(search).fill(arp);
    assert.deepEqual(await ids(), ['l3-arp']);
    await card('l3-arp').click();
    await b('По делу').click();
    await nav.getByText('Шаг 8 из 18').waitFor();
    const previous = nav.getByRole('button', { name: 'Предыдущий: ' + route, exact: true });
    for (let i = 0; i < 9; i++) {
      await previous.click();
      await heading(route).waitFor();
      assert.equal(await b('Читать урок: ' + arp).count(), 0);
      await nav.getByRole('button', { name: 'Следующий: ' + arp, exact: true }).click();
      await heading(arp).waitFor();
    }
    await page.waitForFunction(title => document.activeElement?.getAttribute('aria-label') === title, arp);
    assert.equal(await b('Вернуться к предыдущему уроку').count(), 0);
    const practice = page.getByRole('region', { name: 'Что дальше', exact: true }).getByRole('button', { name: 'Открыть стенд', exact: true });
    await practice.click();
    await page.getByRole('region', { name: 'Путь пакета', exact: true }).waitFor();
    await b('Вернуться к уроку').click();
    await nav.getByText('Шаг 8 из 18').waitFor();
    assert.equal(await b('По делу').getAttribute('aria-pressed'), 'true');
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Открыть стенд');
    await b('К каталогу уроков').click();
    assert.equal(await page.getByPlaceholder(search).inputValue(), arp);
    assert.equal(await b('По порядку изучения').getAttribute('aria-pressed'), 'true');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`PASS ${width}: all three orders, upper-layer filter, independent course neighbors, practice return and mode`);
  }
} finally {
  await browser.close();
}

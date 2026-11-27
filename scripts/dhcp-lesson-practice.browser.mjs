import assert from 'node:assert/strict';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL ?? 'http://127.0.0.1:5442/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH
  ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const button = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
const lessonName = 'DHCP: как клиент получает адрес';

try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const context = await browser.newContext({
      viewport: { width, height: 820 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce',
    });
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin
      ? route.continue() : route.abort());
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.setDefaultTimeout(6000);
    await page.goto(base);
    const activate = locator => mobile ? locator.tap() : locator.press('Enter');
    const back = button(page, 'Вернуться к уроку');
    const open = button(page.getByRole('region', { name: 'Что дальше', exact: true }), 'Открыть практику DHCP');

    await button(page, mobile ? 'Теория' : 'Теория и разборы').click();
    await button(page, 'База знаний').click();
    await page.getByPlaceholder('Поиск: SNI, TLS, сертификат…').fill(lessonName);
    await page.getByText(lessonName, { exact: true }).click();
    const heading = page.getByRole('heading', { name: lessonName, level: 2, exact: true });
    await heading.waitFor();
    const mode = mobile ? 'Простыми словами' : 'По делу';
    await button(page, mode).click();
    await open.waitFor();
    await open.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const box = await open.boundingBox();
    assert.ok(box.height >= 44);
    await activate(open);
    await back.waitFor();
    assert.equal(await heading.count(), 0);
    assert.equal(await back.evaluate(el => el === document.activeElement), true);
    const dhcp = page.getByRole('region', { name: 'Практика DHCP', exact: true });
    await dhcp.waitFor();
    assert.equal(await button(page, 'NAT/PAT').count(), 0);
    assert.equal(await button(page, 'TCP').count(), 0);
    assert.equal(await button(dhcp, 'Исправить').count(), 0);
    assert.equal(await page.getByRole('heading', { name: 'Сетевая практика и симуляторы' }).count(), 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));

    const next = button(dhcp, 'Следующий шаг');
    await dhcp.getByText(/Клиент ещё без IP/).waitFor();
    await next.click();
    await next.click();
    await dhcp.getByText('Сервер предлагает 192.168.10.100. Это ещё не аренда.', { exact: true }).waitFor();
    await next.click();
    await next.click();
    await dhcp.getByText('Клиент выбирает это предложение и просит именно его.', { exact: true }).waitFor();
    await next.click();
    await next.click();
    await next.click();
    await dhcp.getByText('Клиент получает ACK и применяет IP, маску, шлюз и DNS.', { exact: true }).waitFor();

    const selfCheck = dhcp.getByRole('region', { name: 'Самопроверка: аренда IPv4', exact: true });
    const explanation = selfCheck.getByText(/Offer от сервера только предлагает параметры/);
    assert.equal(await explanation.count(), 0);
    await activate(button(selfCheck, /DHCP Offer/));
    await selfCheck.getByText('Не совсем', { exact: true }).waitFor();
    await explanation.waitFor();
    await activate(button(selfCheck, 'Посмотреть результат'));
    await activate(button(selfCheck, 'Пройти ещё раз'));
    await activate(button(selfCheck, /DHCP ACK/));
    await selfCheck.getByText('Верно', { exact: true }).waitFor();

    await back.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await activate(back);
    await heading.waitFor();
    await page.waitForFunction(el => document.activeElement === el, await open.elementHandle());
    await page.waitForTimeout(470);
    assert.ok(Math.abs((await open.boundingBox()).y - box.y) <= 12);
    assert.equal(await button(page, mode).getAttribute('aria-pressed'), 'true');
    // The established DHCP link in the APIPA section is a different entry.
    const inline = button(page, 'Открыть стенд');
    await inline.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await activate(inline);
    await button(page, 'NAT/PAT').waitFor();
    assert.equal(await dhcp.count(), 0);
    await activate(back);
    await page.waitForFunction(el => document.activeElement === el, await inline.elementHandle());
    await button(page, 'Практика').click();
    await button(page, /^DHCP \/ NAT \/ TCP/).click();
    await button(page, 'NAT/PAT').click();
    assert.equal(await button(page, 'NAT/PAT').getAttribute('aria-pressed'), 'true');
    assert.equal(await back.count(), 0);
    assert.equal(await dhcp.count(), 0);
    assert.deepEqual(pageErrors, []);
    console.log(`PASS ${width}: isolated DHCP lesson route, real DORA, Offer rejected/ACK accepted, exact CTA and mode restored, general practice unchanged`);
    await context.close();
  }
} finally {
  await browser.close();
}

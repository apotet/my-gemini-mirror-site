import assert from 'node:assert/strict';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5437/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH
  ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const lesson = 'Почему один VLAN проходит по trunk, а другой нет';
const drill = 'Два коммутатора · частичная потеря связи';
const button = (scope, name) => scope.getByRole('button', { name, exact: true });

try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const mode = mobile ? 'Простыми словами' : 'По делу';
    const context = await browser.newContext({
      viewport: { width, height: 820 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce',
    });
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin
      ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(6000);
    await page.goto(base);
    await button(page, mobile ? 'Теория' : 'Теория и разборы').click();
    await button(page, 'База знаний').click();
    await page.getByPlaceholder('Поиск: SNI, TLS, сертификат…').fill(lesson);
    await page.getByText(lesson, { exact: true }).click();
    await button(page, mode).click();
    const heading = page.getByRole('heading', { name: lesson, level: 2, exact: true });
    await heading.waitFor();
    const card = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Практика в CLI Lab: частичная потеря связи', exact: true }),
    }).filter({ has: page.getByRole('button', { name: 'Открыть стенд', exact: true }) });
    const open = button(card, 'Открыть стенд');
    await open.waitFor();
    await open.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const y = (await open.boundingBox()).y;
    if (mobile) await open.tap();
    else await open.press('Enter');

    const back = button(page, 'Вернуться к уроку');
    await back.waitFor();
    assert.equal(await heading.count(), 0);
    await page.waitForFunction(title => Array.from(document.querySelectorAll('button[aria-pressed="true"]'))
      .some(el => el.textContent.trim() === title), drill);
    assert.equal(await button(page, 'SW1').getAttribute('aria-pressed'), 'true');
    const cmd = page.getByPlaceholder('command… (Tab · ↑↓ · ?)');
    const terminal = page.getByLabel('История CLI', { exact: true });
    const execute = async command => { await cmd.fill(command); await cmd.press('Enter'); };
    const success = page.getByText(/По модели L2-конфигурации обе VLAN проходят/);
    await execute('enable');
    await execute('show interfaces trunk');
    await terminal.getByText(/FastEthernet0\/24\s+10,20/).first().waitFor();
    await button(page, 'SW2').click();
    await execute('enable');
    await execute('show interfaces trunk');
    await terminal.getByText(/FastEthernet0\/24\s+10(?:\s|$)/).last().waitFor();
    assert.equal(await success.count(), 0);
    for (const command of ['configure terminal', 'interface fa0/24', 'switchport trunk allowed vlan add 20', 'end']) {
      await execute(command);
    }
    assert.equal(await success.count(), 0, 'repair alone must not pass without saving');
    await execute('write memory');
    await success.first().waitFor();
    if (mobile) await back.tap();
    else await back.press('Enter');
    await heading.waitFor();
    await page.waitForFunction(el => document.activeElement === el, await open.elementHandle());
    await page.waitForTimeout(470);
    assert.ok(Math.abs((await open.boundingBox()).y - y) <= 4, 'originating CTA returns to the same viewport position');
    assert.equal(await button(page, mode).getAttribute('aria-pressed'), 'true');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}: exact CLI scenario, compared both switches, restored both paths, saved, exact CTA return`);
    await context.close();
  }
} finally {
  await browser.close();
}

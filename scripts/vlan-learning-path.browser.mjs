import assert from 'node:assert/strict';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5428/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH
  ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const button = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
const lessonName = 'VLAN и 802.1Q';
const returnName = 'Вернуться к уроку';

async function activate(page, element, mobile) {
  await element.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const box = await element.boundingBox();
  assert.ok(box && box.height >= 44, 'transition button must have a usable touch target');
  if (mobile) await element.tap();
  else {
    await element.focus();
    await page.keyboard.press('Enter');
  }
  return box.y;
}

async function returned(page, trigger, beforeY, mode) {
  await trigger.waitFor();
  await page.waitForFunction(el => document.activeElement === el, await trigger.elementHandle());
  await page.waitForTimeout(470);
  assert.equal(await trigger.evaluate(el => document.activeElement === el), true);
  assert.ok(Math.abs((await trigger.boundingBox()).y - beforeY) <= 4, 'exact originating control and viewport position restored');
  assert.equal(await button(page, mode).getAttribute('aria-pressed'), 'true');
}

try {
  for (const width of [390, 1440]) {
    const mobile = width < 500;
    const context = await browser.newContext({
      viewport: { width, height: 820 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce',
    });
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin
      ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(10000);
    await page.goto(base);
    await button(page, mobile ? 'Теория' : 'Теория и разборы').click();
    await button(page, 'База знаний').click();
    await page.getByPlaceholder('Поиск: SNI, TLS, сертификат…').fill(lessonName);
    await page.getByText(lessonName, { exact: true }).click();
    const lesson = page.getByRole('heading', { name: lessonName, level: 2, exact: true });
    await lesson.waitFor();
    const footer = page.getByRole('region', { name: 'Что дальше', exact: true });
    const vlan = button(footer, 'Открыть стенд VLAN & Trunk');
    const cli = button(footer, 'Открыть CLI: Access VLAN на порту');
    const back = button(page, returnName);
    await vlan.waitFor();
    assert.equal(await footer.getByRole('button').count(), 2);

    await button(page, 'Простыми словами').click();
    const vlanY = await activate(page, vlan, mobile);
    await back.waitFor();
    assert.equal(await lesson.count(), 0, 'hidden lesson must not appear in the accessibility tree');
    await page.getByText('PC-02 VLAN 20 → PC-04 VLAN 20', { exact: true }).waitFor();
    await page.getByText(/Дело 4: PC-02 и PC-04/).waitFor();
    assert.equal(await button(page, /^VLAN & Trunk/).getAttribute('aria-pressed'), 'true');
    await button(page, /^Настройки стенда/).click();
    const settings = side => page.getByText('Trunk ' + side + ' Gi0/1', { exact: true }).locator('..');
    const switchSide = side => button(settings(side), 'VLAN 20');
    await button(page, 'Запустить').click();
    await page.getByText('SW1: тег 802.1Q VID 20', { exact: true }).waitFor();
    await page.getByText('SW2: VLAN 20 не принят', { exact: true }).waitFor();
    await switchSide('SW2').click();
    await button(page, 'Запустить').click();
    await page.getByText('PC-04: кадр принят', { exact: true }).waitFor();
    await page.getByText('Связь восстановлена.', { exact: true }).waitFor();
    await activate(page, back, mobile);
    await lesson.waitFor();
    await returned(page, vlan, vlanY, 'Простыми словами');

    await button(page, 'По делу').click();
    assert.equal(await footer.getByRole('button').count(), 2);
    const cliY = await activate(page, cli, mobile);
    await back.waitFor();
    const access = button(page, /^Access VLAN на порту/);
    await access.waitFor();
    assert.equal(await access.getAttribute('aria-pressed'), 'true', 'existing scenario selected on entry');
    const command = page.getByPlaceholder('command… (Tab · ↑↓ · ?)');
    await command.fill('enable');
    await command.press('Enter');
    await page.getByRole('form', { name: 'Командная строка CLI' }).getByText('Switch#', { exact: true }).waitFor();
    assert.equal(await command.inputValue(), '', 'the real CLI accepted a command');
    await activate(page, back, mobile);
    await lesson.waitFor();
    await returned(page, cli, cliY, 'По делу');

    await button(page, 'Практика').click();
    await button(page, /^VLAN & Trunk/).click();
    await page.getByText('PC-01 VLAN 10 → PC-03 VLAN 10', { exact: true }).waitFor();
    assert.equal(await page.getByText(/Дело 4: PC-02 и PC-04/).count(), 0);
    assert.equal(await back.count(), 0);

    // The original generic VLAN route from a question still opens the free simulator.
    await button(page, mobile ? 'Теория' : 'Теория и разборы').click();
    await page.getByPlaceholder('Поиск по тексту, теме, id...').fill('l2-06');
    await button(page, /^#l2-06 ·/).click();
    const review = page.locator('[data-explanation-question-id="l2-06"]');
    await button(review, 'Открыть стенд').click();
    await page.getByText('PC-01 VLAN 10 → PC-03 VLAN 10', { exact: true }).waitFor();
    assert.equal(await page.getByText(/Дело 4: PC-02 и PC-04/).count(), 0);
    assert.equal(await back.count(), 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}: exact VLAN and working CLI targets; both focus/position/mode returns; direct practice stays free`);
    await context.close();
  }
} finally {
  await browser.close();
}

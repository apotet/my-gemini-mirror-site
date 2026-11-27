import assert from 'node:assert/strict';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5428/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const b = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
const languageName = 'Язык интерфейса: RU / ENG';
const searchTitle = 'Поиск и командная строка (Cmd+K / Ctrl+K)';
const errors = [];
try {
  for (const width of [320, 390, 768, 1024, 1279, 1280, 1440]) {
    const touch = width <= 390;
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: touch, hasTouch: touch, reducedMotion: 'reduce' });
    await context.addInitScript(() => {
      localStorage.setItem('osi_sound', '1'); // Older, formerly opted-in device.
      window.audioContextsMade = 0;
      window.AudioContext = window.webkitAudioContext = class { constructor() { window.audioContextsMade++; } };
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    page.setDefaultTimeout(9000);
    const header = page.getByRole('banner');
    const button = b(header, languageName);
    const search = header.getByTitle(searchTitle);
    await button.waitFor();
    assert.equal(await button.count(), 1);
    assert.equal(await b(header, /(?:звука|звук)/i).count(), 0);
    assert.match(await button.innerText(), /RU\s*\/\s*ENG/);
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
    const panel = page.locator('[id=' + JSON.stringify(await button.getAttribute('aria-controls')) + ']');
    assert.equal(await panel.isVisible(), false);
    const frame = await button.boundingBox();
    assert.ok(frame.x >= 0 && frame.x + frame.width <= width && frame.height >= 44, JSON.stringify({ width, frame }));
    for (const control of await header.getByRole('button').all()) {
      const r = await control.boundingBox();
      assert.ok(r && r.x >= 0 && r.x + r.width <= width + 1, `Control outside header at ${width}px: ${await control.textContent()}`);
    }

    if (touch) {
      await button.tap();
    } else {
      await search.focus();
      await page.keyboard.press('Tab');
      assert.equal(await button.evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Enter');
    }
    await panel.waitFor();
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    assert.match(await panel.innerText(), /Русский.*текущий язык/s);
    assert.match(await panel.innerText(), /English.*материалы пока недоступны/s);
    assert.equal(await panel.getByRole('button').count(), 0, 'no pretend English switch');
    assert.equal(await page.locator('html').getAttribute('lang'), 'ru');
    assert.equal(await page.evaluate(() => localStorage.getItem('osi_sound')), '1');
    const box = await panel.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= width);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    if (touch) {
      const menu = b(header, 'Открыть меню');
      await menu.tap();
      assert.equal(await button.getAttribute('aria-expanded'), 'false', 'tap outside closes language panel');
      assert.equal(await button.count(), 1, 'hamburger does not duplicate language control');
      assert.equal(await b(header, /зву/i).count(), 0);
      await b(header, 'Тёмная').tap();
      assert.equal(await page.locator('html').evaluate(el => el.classList.contains('dark')), false);
      await b(header, 'Закрыть меню').tap();
      await button.tap();
      await button.tap();
      assert.equal(await panel.isVisible(), false);
    } else {
      await page.keyboard.press('Escape');
      assert.equal(await button.getAttribute('aria-expanded'), 'false');
      assert.equal(await button.evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Space');
      await panel.waitFor();
      await page.keyboard.press('Tab');
      assert.equal(await button.getAttribute('aria-expanded'), 'false');
      assert.equal(await b(header, 'Включить светлую тему').evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('html').evaluate(el => el.classList.contains('dark')), false);
      await page.keyboard.press('Control+k');
      const palette = page.getByPlaceholder(/Быстрый поиск команд/);
      await palette.waitFor();
      await page.waitForFunction(() => document.activeElement?.matches('input[placeholder^="Быстрый поиск команд"]'));
      await page.keyboard.press('Escape');
      await palette.waitFor({ state: 'hidden' });
    }
    await search.click();
    const palette = page.getByPlaceholder(/Быстрый поиск команд/);
    await palette.waitFor();
    await b(page, 'Esc').click();
    await palette.waitFor({ state: 'hidden' });

    // Behavioral check through the current public entry point, not just a source-text grep.
    if (width === 390 || width === 1440) {
      await b(page, 'Начать тестирование').last().click();
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('osi_active_session') || 'null')?.questions?.length);
      const question = await page.evaluate(() => JSON.parse(localStorage.getItem('osi_active_session')).questions[0]);
      for (const choice of question.correct) await page.getByText(question.answers[choice], { exact: true }).first().click();
      await b(page, 'Подтвердить').click();
      await b(page, 'Следующий вопрос').waitFor();
      await b(page, touch ? 'IPv4' : 'IPv4 Тренажёр').click();
      const ipv4Option = page.getByRole('button').filter({ hasText: /^\s*\d+\.\d+\.\d+\.\d+\s*$/ }).first();
      await ipv4Option.click();
      await b(page, 'Проверить ответ').click();
      await b(page, 'Следующее задание').waitFor();
      for (const hub of ['Практика', 'Макет практики']) {
        if (touch && hub === 'Макет практики') await b(header, 'Открыть меню').tap();
        await b(page, hub).click();
        await b(page, /^VLAN & Trunk /).click();
        await b(page, /^Дело 3/).click();
        await b(page, 'Запустить').click();
        await page.waitForFunction(() => [...document.querySelectorAll('span')].some(node => {
          const m = /^Шаг (\d+) \/ (\d+)$/.exec(node.textContent || '');
          return m && m[1] === m[2];
        }));
      }
      assert.equal(await page.evaluate(() => window.audioContextsMade), 0, 'legacy opt-in and both VLAN modes stay silent');
      assert.equal(await page.evaluate(() => localStorage.getItem('osi_sound')), '1', 'legacy preference was not overwritten');
    }
    await context.close();
    console.log(`PASS ${width}px: one language disclosure, layout, ${touch ? 'touch and mobile menu' : 'keyboard and focus'}, theme and search`);
  }
  assert.deepEqual(errors, []);
  console.log('PASS: real exam, IPv4 trainer and both VLAN modes remained functional and silent with old audio opt-in');
} finally {
  await browser.close();
}

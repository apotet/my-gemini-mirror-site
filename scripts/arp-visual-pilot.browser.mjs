import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5591/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const title = 'ARP: чей MAC нужен для IP';
const label = 'Визуальный разбор ARP';
const shots = process.env.NETOPS_ARP_SCREENSHOT_DIR;
if (shots) await mkdir(shots, { recursive: true });

try {
  for (const [width, height] of [[375, 667], [390, 844], [1440, 900]]) for (const theme of ['light', 'dark']) {
    const mobile = width < 500;
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce', colorScheme: theme });
    await context.addInitScript(value => localStorage.setItem('osi_theme_dark', value === 'dark' ? '1' : '0'), theme);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.setDefaultTimeout(10000);
    const b = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
    const pilot = page.getByRole('region', { name: label, exact: true });
    const visibleText = (name, scope = pilot) => scope.getByText(name, { exact: typeof name === 'string' }).filter({ visible: true });
    const diagram = pilot.locator('[data-arp-network-figure]:visible');
    const select = async name => {
      const button = b(pilot, name);
      if (mobile) await button.tap();
      else await button.press('Enter');
    };
    const shot = async name => {
      if (shots) await page.screenshot({ path: join(shots, `arp-${width}-${theme}-${name}.png`), animations: 'disabled' });
    };
    const atScene = async (index, name, maxButtons, primaryExpected = true) => {
      const heading = pilot.getByRole('heading', { name, level: 4 });
      await heading.waitFor();
      await page.waitForFunction(() => document.activeElement?.matches('h4[tabindex="-1"]'));
      assert.equal(await heading.evaluate(el => el === document.activeElement), true);
      await pilot.getByRole('img', { name: `Шаг ${index} из 4`, exact: true }).waitFor();
      assert.equal(await pilot.getByRole('navigation').count(), 0, 'no navigation button row');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      const controls = pilot.getByRole('button');
      assert((await controls.count()) <= maxButtons, 'number of visible controls');
      assert.equal(await pilot.locator('button:disabled:visible').count(), 0, 'no inactive controls shown');
      assert.equal(await b(pilot, 'Закрыть разбор').count(), 1);
      assert.equal(await pilot.locator('[data-arp-main-action]:visible').count(), primaryExpected ? 1 : 0);
      const nav = mobile ? await b(page, 'Теория').locator('xpath=ancestor::nav[1]').boundingBox() : null;
      const bottom = nav?.y ?? height;
      if (mobile) assert(nav && nav.y < height, 'mobile navbar boundary is measurable');
      const fig = await diagram.boundingBox();
      const action = primaryExpected && await pilot.locator('[data-arp-main-action]:visible').boundingBox();
      assert(fig && fig.y >= 0 && fig.y + fig.height < bottom, 'actual diagram wholly above the navbar: ' + JSON.stringify({ fig, bottom }));
      if (action) assert(action.y >= fig.y && action.y + action.height < bottom && action.height >= 44,
        'primary action wholly above the navbar and touch-sized: ' + JSON.stringify({ action, fig, bottom }));
      const head = await heading.boundingBox();
      assert(head && head.y >= 0 && head.y + head.height < fig.y, 'heading above diagram in viewport');
    };

    await page.goto(base);
    await b(page, mobile ? 'Теория' : 'Теория и разборы').click();
    await b(page, 'База знаний').click();
    await page.getByPlaceholder('Поиск: SNI, TLS, сертификат…').fill(title);
    await page.getByText(title, { exact: true }).click();
    await pilot.waitFor();
    assert.equal(await diagram.count(), 0);
    await select('Открыть визуальный разбор');
    const predict = async ip => {
      await pilot.getByRole('img', { name: 'Шаг 1 из 4', exact: true }).waitFor();
      const question = pilot.getByRole('heading', { level: 5, name: /Чей MAC поставить/ });
      await question.waitFor();
      await visibleText('MAC: ?').waitFor();
      await visibleText('IP: ' + ip).waitFor();
      assert.doesNotMatch(await pilot.ariaSnapshot(), /02:00:00:00:01:(?:20|01)/, 'no MAC answer in accessibility tree before choice');
      assert.doesNotMatch(await diagram.innerText(), /(?:к шлюзу|к соседу|поиск MAC шлюза|:01:20|:01:01)/i, 'no matching path or MAC revealed in prediction diagram');
      assert.equal(await pilot.locator('[data-arp-main-action]:visible').count(), 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      const controls = pilot.getByRole('button', { name: /^MAC / });
      assert.equal(await controls.count(), 3);
      const box = await controls.last().boundingBox();
      const fig = await diagram.boundingBox();
      const nav = mobile ? await b(page, 'Теория').locator('xpath=ancestor::nav[1]').boundingBox() : null;
      assert(box && fig && box.y + box.height < fig.y, 'make choices available before the longer diagram');
      if (mobile) assert(nav && box.y + box.height < nav.y, 'all choices appear above the bottom nav when the scene opens');
      if (mobile) assert(box.height >= 44, 'touch target');
    };
    await predict('192.168.2.20');
    await shot('predict-remote');
    await select('MAC сервера 192.168.2.20');
    await visibleText(/Сервер в другой сети/).waitFor();
    await visibleText('MAC: ?').waitFor();
    await select('MAC шлюза 192.168.1.1');
    await visibleText('MAC: 02:00:00:00:01:01').waitFor();
    await visibleText('IP: 192.168.2.20').waitFor();
    await visibleText('Шлюз переслал пакет →', diagram).waitFor();
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Далее: отправить соседу');
    await shot('remote');
    await select('Далее: отправить соседу');
    await predict('192.168.1.20');
    await page.waitForFunction(() => document.activeElement?.matches('h5[tabindex="-1"]'));
    await select('MAC шлюза 192.168.1.1');
    await visibleText(/Не шлюз/).waitFor();
    await visibleText('MAC: ?').waitFor();
    await select('MAC соседа 192.168.1.20');
    await visibleText('MAC: 02:00:00:00:01:20').waitFor();
    await visibleText('IP: 192.168.1.20').waitFor();
    await shot('local');
    await select('Далее: кэш соседей');
    await atScene(2, 'Один запрос на два пакета', 3);
    await visibleText('ARP-запросов: 0').waitFor();
    await visibleText('Сервер A', diagram).waitFor();
    await visibleText('Сервер B', diagram).waitFor();
    await shot('cache-entry');
    await select('Отправить пакет №1');
    await visibleText('Пакет №1 ждёт', diagram).waitFor();
    await visibleText(/отдельный ARP Request/).waitFor();
    await shot('cache-request');
    await select('Получить ARP Reply');
    await visibleText('192.168.1.1 → 02:00:00:00:01:01').waitFor();
    await select('Отправить пакет №2');
    await visibleText('Новый ARP Request не нужен.').waitFor();
    await visibleText('ARP-запросов: 1').waitFor();
    await visibleText(/192\.168\.3\.30/, diagram).first().waitFor();
    await select('Далее: диагностика');
    await atScene(3, 'Диагностика по захвату', 3);
    await shot('diagnosis-entry');
    await select('Запустить прогон A');
    await visibleText(/кадр с Echo Request не ушёл с ПК/i, diagram).waitFor();
    await select('Проверить веб-сервер');
    await visibleText(/Сначала выясни/).waitFor();
    await select('Проверить VLAN, L2-путь и шлюз');
    await visibleText(/порт ПК в VLAN 99, а шлюз в VLAN 10/).waitFor();
    await shot('diagnosis-a');
    await select('Перейти к прогону B');
    await visibleText(/Кэш пуст. Запусти ping/).waitFor();
    await select('Запустить прогон B');
    await visibleText(/Echo Reply не виден на ПК/, diagram).waitFor();
    await shot('diagnosis-b-capture');
    await select('Заменить патч-корд');
    await visibleText(/Не назначай причину/).waitFor();
    await select('Проверить шлюз, маршрут, фильтры и обратный путь');
    await visibleText(/Где потерялся пакет, этот захват не показывает/).waitFor();
    await shot('diagnosis-b');
    await select('Далее: две таблицы');
    await atScene(4, 'Две таблицы, два поиска', 3);
    await pilot.getByRole('table', { name: 'Таблица соседей ПК', exact: true }).waitFor();
    await pilot.getByRole('table', { name: 'MAC-таблица коммутатора', exact: true }).waitFor();
    await select('Проследить кадр к соседу');
    await visibleText(/Для 192\.168\.1\.20 ПК выбирает MAC/).waitFor();
    await select('Проверить себя');
    await page.waitForFunction(() => document.activeElement?.textContent?.startsWith('Какой IP ПК ищет через ARP'));
    await select('192.168.2.20');
    await visibleText(/Не этот IP/).waitFor();
    await select('192.168.1.1');
    await visibleText(/ПК ищет MAC шлюза 192\.168\.1\.1/).waitFor();
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Начать заново и сбросить ответы');
    await select('Назад к сцене');
    await pilot.getByRole('heading', { name: 'Диагностика по захвату', level: 4 }).waitFor();
    await visibleText(/Где потерялся пакет, этот захват не показывает/).waitFor();
    await select('Далее: две таблицы');
    await select('Начать заново и сбросить ответы');
    await predict('192.168.2.20');
    await select('Закрыть разбор');
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Открыть визуальный разбор');
    assert.equal(await b(pilot, 'Открыть визуальный разбор').getAttribute('aria-expanded'), 'false');
    assert.equal(await diagram.count(), 0);
    for (const [question, anchor] of [
      ['l3-03', 'arp-local-or-gateway-mac'],
      ['l3-d07', 'proxy-arp-masks-network-error'],
      ['gen-diag-6', 'in-depth-arp-evidence-and-duplicate'],
      ['tr-05', 'indepth-arp-local-delivery'],
    ]) {
      await page.goto(base);
      await b(page, mobile ? 'Теория' : 'Теория и разборы').click();
      await page.getByPlaceholder('Поиск по тексту, теме, id...').fill(question);
      await b(page, new RegExp('^#' + question + ' ·')).click();
      const review = page.locator('[data-explanation-question-id="' + question + '"]');
      await b(review, 'Перейти к уроку: ' + title).click();
      const initialMode = await b(page, 'Простыми словами').getAttribute('aria-pressed') === 'true' ? 'Простыми словами' : 'По делу';
      for (const mode of [initialMode, initialMode === 'Простыми словами' ? 'По делу' : 'Простыми словами']) {
        if (mode !== initialMode) await b(page, mode).click();
        await page.waitForFunction(id => {
          const section = document.querySelector('[data-lesson-section-anchor="' + id + '"]');
          const rect = section?.getBoundingClientRect();
          return !!rect && rect.top < innerHeight && rect.bottom > 0 && document.activeElement === section;
        }, anchor);
        assert.equal(await pilot.count(), 0, 'exact bank arrivals use the normal lesson');
      }
      await b(page, 'Вернуться к вопросу ' + question).click();
      await review.waitFor();
      console.log(`PASS ${width}: ${question} → ${anchor}, visible and focused in both reading modes`);
    }
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`PASS ${width}: all ARP scenes, evidence-limited diagnosis, reset, navigation focus and layout`);
  }
} finally {
  await browser.close();
}

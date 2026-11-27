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
  for (const [width, height] of [[375, 667], [390, 844], [1440, 900]]) {
    const mobile = width < 500;
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce', colorScheme: 'dark' });
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
      if (shots) await page.screenshot({ path: join(shots, `arp-${width}-${name}.png`), animations: 'disabled' });
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
    await atScene(1, 'Чей MAC нужен?', 2);
    for (const line of ['Твой ПК', 'Коммутатор', 'Сосед', 'Шлюз (L3)', 'Сервер A', /Локальная подсеть.*область ARP/, /Удалённая сеть.*ARP сюда не доходит/])
      await visibleText(line, diagram).waitFor();
    await visibleText('Кадр L2 · внешняя наклейка').waitFor();
    await visibleText('Пакет L3 · письмо внутри').waitFor();
    await shot('entry');
    await select('Отправить соседу');
    await visibleText('MAC: 02:00:00:00:01:20').waitFor();
    await visibleText('IP: 192.168.1.20').waitFor();
    await visibleText('Шлюз (L3)', diagram).waitFor();
    await select('Сравнить: отправить серверу');
    await visibleText('MAC: 02:00:00:00:01:01').waitFor();
    await visibleText('IP: 192.168.2.20').waitFor();
    await visibleText('Сосед', diagram).waitFor();
    await visibleText('Шлюз переслал пакет →', diagram).waitFor();
    await shot('remote');
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
    await select('192.168.2.20');
    await visibleText(/Не этот IP/).waitFor();
    await select('192.168.1.1');
    await visibleText(/ПК ищет MAC шлюза 192\.168\.1\.1/).waitFor();
    await select('Назад к сцене');
    await pilot.getByRole('heading', { name: 'Диагностика по захвату', level: 4 }).waitFor();
    await visibleText(/Где потерялся пакет, этот захват не показывает/).waitFor();
    await select('Далее: две таблицы');
    await select('Начать заново и сбросить ответы');
    await atScene(1, 'Чей MAC нужен?', 2);
    await visibleText('MAC: Кого искать?').waitFor();
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

import assert from 'node:assert/strict';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5589/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const title = 'ARP: чей MAC нужен для IP';
const label = 'Визуальный разбор ARP';

try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const context = await browser.newContext({ viewport: { width, height: 820 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.setDefaultTimeout(10000);
    const b = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
    const pilot = page.getByRole('region', { name: label, exact: true });
    const select = async name => {
      const button = b(pilot, name);
      if (mobile) await button.tap();
      else await button.press('Enter');
    };
    const atScene = async (index, title) => {
      const heading = pilot.getByRole('heading', { name: title, level: 4 });
      await heading.waitFor();
      await page.waitForFunction(() => document.activeElement?.matches('h4[tabindex="-1"]'));
      assert.equal(await heading.evaluate(el => el === document.activeElement), true);
      const rect = await heading.boundingBox();
      assert.ok(rect && rect.y >= 0 && rect.y + rect.height <= 820, JSON.stringify(rect));
      assert.equal(await pilot.locator('button[aria-current="step"]').innerText(), index);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    };

    await page.goto(base);
    await b(page, mobile ? 'Теория' : 'Теория и разборы').click();
    await b(page, 'База знаний').click();
    await page.getByPlaceholder('Поиск: SNI, TLS, сертификат…').fill(title);
    await page.getByText(title, { exact: true }).click();
    await pilot.waitFor();
    assert.equal(await pilot.getByRole('navigation').count(), 0);
    await select('Открыть визуальный разбор');
    await atScene('1. Выбор MAC', /Чей MAC/);
    await select(/Отправить соседу/);
    await pilot.getByText('02:00:00:00:01:20', { exact: true }).filter({ visible: true }).waitFor();
    await select(/Отправить серверу/);
    await pilot.getByText('02:00:00:00:01:01', { exact: true }).filter({ visible: true }).waitFor();
    await pilot.getByText(/IP-пакет всё ещё адресован серверу/).filter({ visible: true }).waitFor();
    await select('Следующая сцена');
    await atScene('2. Кэш соседей', /Два пакета/);
    assert.equal(await b(pilot, /Пакет №2/).isDisabled(), true);
    await select(/Пакет №1/);
    await pilot.getByText(/Пакет №1.*ждёт на ПК/).filter({ visible: true }).waitFor();
    await select('Получить ARP Reply');
    await pilot.getByText(/dev eth0 lladdr 02:00:00:00:01:01/).filter({ visible: true }).waitFor();
    await select(/Пакет №2/);
    await pilot.getByText(/Новый ARP Request не нужен/).filter({ visible: true }).waitFor();
    await pilot.getByText('ARP-запросов: 1', { exact: true }).filter({ visible: true }).waitFor();
    await select('Следующая сцена');
    await atScene('3. Диагностика', /Два прогона/);
    await select(/Запустить прогон A/);
    await pilot.getByText(/кадр с Echo Request не отправлен/).filter({ visible: true }).waitFor();
    await select('Проверить веб-сервер');
    await pilot.getByText(/Не лучший первый шаг/).filter({ visible: true }).waitFor();
    await select(/Проверить VLAN на порту/);
    await pilot.getByText(/порт ПК в VLAN 99, а шлюз в VLAN 10/).filter({ visible: true }).waitFor();
    await select('Прогон B');
    await pilot.getByText('Кэш пуст. Захват ещё не запущен.', { exact: true }).filter({ visible: true }).waitFor();
    await select(/Запустить прогон B/);
    await pilot.getByText(/Echo Reply не наблюдался/).filter({ visible: true }).waitFor();
    await select(/Проверить прохождение пакета на шлюзе/);
    await pilot.getByText(/Где потерялся пакет, этот захват не показывает/).filter({ visible: true }).waitFor();
    await select('Следующая сцена');
    await atScene('4. Две таблицы', /Таблица соседей ПК/);
    await select(/192\.168\.1\.20 →/);
    assert.equal(await b(pilot, /192\.168\.1\.20 →/).getAttribute('aria-pressed'), 'true');
    await pilot.getByText(/коммутатор находит: Порт 2/).filter({ visible: true }).waitFor();
    await select('192.168.1.1');
    await pilot.getByText(/Верно: ПК ищет MAC шлюза/).filter({ visible: true }).waitFor();
    await select('Назад к сцене');
    await atScene('3. Диагностика', /Два прогона/);
    await pilot.getByText(/Где потерялся пакет, этот захват не показывает/).filter({ visible: true }).waitFor();
    await select('Начать заново и сбросить ответы');
    await atScene('1. Выбор MAC', /Чей MAC/);
    assert.equal(await pilot.getByRole('status').innerText(), '');
    await select('2. Кэш соседей');
    await atScene('2. Кэш соседей', /Два пакета/);
    await pilot.getByText('ARP-запросов: 0', { exact: true }).filter({ visible: true }).waitFor();
    await select('3. Диагностика');
    await atScene('3. Диагностика', /Два прогона/);
    await pilot.getByText('Кэш пуст. Захват ещё не запущен.', { exact: true }).filter({ visible: true }).waitFor();
    await select('4. Две таблицы');
    await atScene('4. Две таблицы', /Таблица соседей ПК/);
    assert.equal(await b(pilot, '192.168.1.1').getAttribute('aria-pressed'), 'false');
    await select('Закрыть разбор');
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Открыть визуальный разбор');
    assert.equal(await b(pilot, 'Открыть визуальный разбор').getAttribute('aria-expanded'), 'false');
    assert.equal(await pilot.getByRole('navigation').count(), 0);
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

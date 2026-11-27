import assert from 'node:assert/strict';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5428/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH
  ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const b = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
const title = (page, name) => page.getByRole('heading', { name, level: 2, exact: true });
const footer = page => page.getByRole('region', { name: 'Что дальше', exact: true });
const route = 'L3: маршрут к назначению и самая длинная маска';
const arp = 'ARP: чей MAC нужен для IP';
const backToPracticeSource = 'Вернуться к уроку';
const backToPrevious = 'Вернуться к предыдущему уроку';
const catalog = 'Поиск: SNI, TLS, сертификат…';

async function openSourceButton(page, button, mobile) {
  await button.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const rect = await button.boundingBox();
  assert.ok(rect);
  if (mobile) await button.tap();
  else {
    await button.focus();
    await page.keyboard.press('Enter');
  }
  return rect.y;
}

async function assertRestored(page, button, priorY) {
  await button.waitFor();
  await page.waitForFunction(() => document.activeElement?.matches('button, a'));
  assert.equal(await button.evaluate(el => document.activeElement === el), true, 'focus restores to the exact originating control');
  await page.waitForTimeout(450); // Old question anchor must not pull the view away after the return.
  assert.equal(await button.evaluate(el => document.activeElement === el), true);
  const rect = await button.boundingBox();
  assert.ok(rect && Math.abs(rect.y - priorY) <= 4, 'source control returns to the previous viewport position');
}

async function openCatalog(page, mobile, search) {
  await page.goto(base);
  await b(page, mobile ? 'Теория' : 'Теория и разборы').click();
  await b(page, 'База знаний').click();
  await page.getByPlaceholder(catalog).fill(search);
  await page.getByText(search, { exact: true }).click();
  await title(page, search).waitFor();
}

async function openQuestion(page, mobile, id) {
  await page.goto(base);
  await b(page, mobile ? 'Теория' : 'Теория и разборы').click();
  await page.getByPlaceholder('Поиск по тексту, теме, id...').fill(id);
  await b(page, new RegExp('^#' + id + ' ·')).click();
  const review = page.locator('[data-explanation-question-id="' + id + '"]');
  await review.waitFor();
  return review;
}

try {
  for (const width of [390, 1440]) {
    const mobile = width < 500;
    const context = await browser.newContext({
      viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce',
    });
    await context.route('**/*', r => new URL(r.request().url()).origin === new URL(base).origin ? r.continue() : r.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(10000);
    const review = await openQuestion(page, mobile, 'l3-05');
    await b(review, 'Перейти к уроку: ' + route).click();
    await title(page, route).waitFor();
    assert.equal(await b(page, backToPrevious).count(), 0, 'no previous lesson on question-to-lesson entry');
    await b(page, 'По делу').click();
    const lessonTrigger = b(footer(page), 'Читать урок: ' + arp);
    const routeY = await openSourceButton(page, lessonTrigger, mobile);
    await title(page, arp).waitFor();
    await page.waitForFunction(name => document.activeElement?.getAttribute('aria-label') === name, arp);
    assert.equal(await title(page, route).count(), 0, 'origin is not exposed to interactive/accessibility queries while away');

    // Reading mode can change in the linked lesson and must survive its practice trip.
    await b(page, 'Простыми словами').click();
    const practiceTrigger = b(footer(page), 'Открыть стенд');
    const arpY = await openSourceButton(page, practiceTrigger, mobile);
    const practiceBack = b(page, backToPracticeSource);
    await practiceBack.waitFor();
    assert.equal(await practiceBack.evaluate(el => document.activeElement === el), true, 'practice return is keyboard discoverable');
    assert.equal(await title(page, arp).count(), 0);

    const journey = page.getByRole('region', { name: 'Путь пакета', exact: true });
    await journey.getByRole('heading', { name: 'Ping на сервер' }).waitFor();
    const step = journey.getByRole('slider', { name: 'Выбор шага' });
    await step.fill('1');
    await journey.getByText('ARP 192.168.1.10 → 192.168.1.1', { exact: true }).waitFor();
    await step.fill('6');
    await journey.getByText('IP 192.168.1.10 → 192.168.2.20', { exact: true }).waitFor();
    if (mobile) await practiceBack.tap();
    else {
      await practiceBack.focus();
      await page.keyboard.press('Enter');
    }
    await title(page, arp).waitFor();
    assert.equal(await b(page, 'Простыми словами').getAttribute('aria-pressed'), 'true');
    await assertRestored(page, practiceTrigger, arpY);
    await b(page, backToPrevious).click();
    await title(page, route).waitFor();
    assert.equal(await b(page, 'По делу').getAttribute('aria-pressed'), 'true');
    await assertRestored(page, lessonTrigger, routeY);
    await b(page, 'Вернуться к вопросу l3-05').click();
    await review.waitFor();

    // Direct catalog lesson, ordinary inline practice, exact catalog context on return.
    const inlineTitle = 'TCP/UDP-порты: как найти нужную службу';
    await openCatalog(page, mobile, inlineTitle);
    assert.equal(await b(page, backToPrevious).count(), 0);
    const inlineStand = b(page, 'Открыть стенд');
    const inlineY = await openSourceButton(page, inlineStand, mobile);
    await page.getByRole('button', { name: /^DHCP \/ NAT \/ TCP/ }).waitFor();
    assert.equal(await page.getByRole('button', { name: /^DHCP \/ NAT \/ TCP/ }).getAttribute('aria-pressed'), 'true');
    await b(page, backToPracticeSource).click();
    await title(page, inlineTitle).waitFor();
    await assertRestored(page, inlineStand, inlineY);
    const chip = b(page, 'Telnet').and(page.locator('button[aria-expanded]'));
    await chip.click();
    const glossaryLink = page.getByRole('link', { name: /^разобрать в теме/ });
    const termY = await openSourceButton(page, glossaryLink, mobile);
    await b(page, backToPrevious).click();
    await title(page, inlineTitle).waitFor();
    assert.equal(await chip.getAttribute('aria-expanded'), 'true');
    await assertRestored(page, glossaryLink, termY);
    await b(page, 'К каталогу уроков').click();
    assert.equal(await page.getByPlaceholder(catalog).inputValue(), inlineTitle);

    const http = 'HTTP/1.1: конец chunked-ответа, докачка и ETag';
    await openCatalog(page, mobile, http);
    const related = b(page, 'Перейти к основному разбору HTTP 206 и Content-Range');
    const relatedY = await openSourceButton(page, related, mobile);
    await title(page, 'Прикладные сервисы: части файла, доверие и порядок обмена').waitFor();
    await b(page, backToPrevious).click();
    await title(page, http).waitFor();
    await assertRestored(page, related, relatedY);

    // Manual navigation abandons the return context. Question review practice never claims a lesson origin.
    await openCatalog(page, mobile, arp);
    await b(footer(page), 'Открыть стенд').click();
    await b(page, backToPracticeSource).waitFor();
    await b(page, mobile ? 'Тесты' : 'Тестирование').click();
    await b(page, 'Практика').click();
    await page.getByRole('heading', { name: 'Сетевая практика и симуляторы' }).waitFor();
    assert.equal(await b(page, backToPracticeSource).count(), 0);

    await openCatalog(page, mobile, arp);
    await b(footer(page), 'Открыть стенд').click();
    await b(page, backToPracticeSource).waitFor();
    await b(page, mobile ? 'Теория' : 'Теория и разборы').click();
    await page.getByPlaceholder('Поиск по тексту, теме, id...').waitFor();
    assert.equal(await title(page, arp).count(), 0, 'direct theory is not an implicit lesson resume');

    const practiceReview = await openQuestion(page, mobile, 'tcpip-d01');
    await b(practiceReview, 'Открыть стенд').click();
    await journey.waitFor();
    assert.equal(await b(page, backToPracticeSource).count(), 0);

    assert.deepEqual(errors, []);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    console.log('PASS ' + width + ': stacked question/lesson/stand round-trip, exact focus and scroll, mode/catalog, direct navigation');
    await context.close();
  }
} finally {
  await browser.close();
}

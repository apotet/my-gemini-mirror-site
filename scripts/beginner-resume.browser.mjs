import assert from 'node:assert/strict';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5606/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const key = 'osi_knowledge_beginner_resume_v1';
const route = 'L3: маршрут к назначению и самая длинная маска';
const arp = 'ARP: чей MAC нужен для IP';
const icmp = 'ICMP и ping: где живёт служебное сообщение';

function ui(page, mobile) {
  const b = (name, scope = page) => scope.getByRole('button', { name, exact: typeof name === 'string' });
  const search = page.getByPlaceholder('Поиск: SNI, TLS, сертификат…');
  const nav = page.getByRole('navigation', { name: 'Учебный маршрут' });
  return {
    b, nav, search,
    card: id => page.locator(`[data-catalog-lesson="${id}"]`),
    heading: name => page.getByRole('heading', { name, exact: true, level: 2 }),
    resume: name => b('Продолжить: ' + name),
    anyResume: () => b(/^Продолжить:/),
    stored: () => page.evaluate(key => localStorage.getItem(key), key),
    openKnowledge: async () => {
      await b(mobile ? 'Теория' : 'Теория и разборы').click();
      await b('База знаний').click();
      await search.waitFor();
    },
    study: async () => {
      await b('База').click();
      await b('По порядку изучения').click();
    },
  };
}

try {
  for (const width of [375, 1440]) {
    const mobile = width < 500;
    const context = await browser.newContext({ viewport: { width, height: mobile ? 667 : 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    const { b, search, nav, card, heading, resume, anyResume, openKnowledge, study, stored } = ui(page, mobile);
    await page.goto(base);
    await openKnowledge();
    await study();
    assert.equal(await anyResume().count(), 0, 'no proposed checkpoint when nothing was opened');
    await card('l3-route-selection').click();
    await heading(route).waitFor();
    assert.equal(await stored(), 'l3-route-selection');
    await b('Следующий: ' + arp, nav).click();
    await heading(arp).waitFor();
    assert.equal(await stored(), 'l3-arp');
    await b('Предыдущий: ' + route, nav).click();
    await heading(route).waitFor();
    assert.equal(await stored(), 'l3-route-selection', 'a deliberate backward step also changes the checkpoint');
    await b('Следующий: ' + arp, nav).click();
    await heading(arp).waitFor();
    const practice = page.getByRole('region', { name: 'Что дальше', exact: true });
    await b('Открыть стенд', practice).click();
    await b('Вернуться к уроку').click();
    await heading(arp).waitFor();
    assert.equal(await stored(), 'l3-arp');
    await b('К каталогу уроков').click();
    await resume(arp).waitFor();

    await card('osi-session-presentation').click();
    await nav.getByText('Дополнительный урок', { exact: true }).waitFor();
    assert.equal(await stored(), 'l3-arp');
    await b(/^Предыдущий:/, nav).click();
    await nav.getByText('Шаг 2 из 18', { exact: true }).waitFor();
    assert.equal(await stored(), 'l3-arp', 'leaving a bonus branch does not move the checkpoint');
    await b('К каталогу уроков').click();

    await b('А–Я').click();
    assert.equal(await anyResume().count(), 0);
    await search.fill(icmp);
    await card('l3-icmp-basics').click();
    await heading(icmp).waitFor();
    assert.equal(await nav.count(), 0);
    assert.equal(await stored(), 'l3-arp', 'alphabetic/search entry is not route entry');
    await b('Избранное: ' + icmp).click();
    await b('К каталогу уроков').click();
    await b('Избранное').click();
    assert.equal(await anyResume().count(), 0);
    await card('l3-icmp-basics').click();
    await heading(icmp).waitFor();
    assert.equal(await nav.count(), 0);
    assert.equal(await stored(), 'l3-arp', 'favorite entry is not route entry');
    await b('К каталогу уроков').click();
    await b('Уроки').click();
    await b('По порядку изучения').click();
    await resume(arp).waitFor();
    await card('l3-icmp-basics').click();
    await heading(icmp).waitFor();
    await nav.getByText('Шаг 9 из 18', { exact: true }).waitFor();
    assert.equal(await stored(), 'l3-arp', 'filtered study search does not overwrite resume');
    await b(/^Следующий:/, nav).click();
    await nav.getByText('Шаг 10 из 18', { exact: true }).waitFor();
    assert.equal(await stored(), 'l3-arp', 'neighbor from a filtered entry does not overwrite resume');
    await b('К каталогу уроков').click();
    await search.fill('');
    await b('L3').click();
    await card('l3-route-selection').click();
    await heading(route).waitFor();
    assert.equal(await stored(), 'l3-arp', 'filtered layer entry does not overwrite resume');
    await b('К каталогу уроков').click();
    await b('Все темы').click();
    await search.fill('отсутствующий-урок');
    await resume(arp).waitFor();
    assert.equal(await page.locator('[data-catalog-lesson]').count(), 0);

    await page.reload();
    await openKnowledge();
    const cta = resume(arp);
    await cta.waitFor();
    assert.equal(await anyResume().count(), 1);
    const box = await cta.boundingBox();
    assert(box && box.height >= 44, 'resume control is touch-sized');
    if (mobile) {
      const fixedNav = await b('Теория').locator('xpath=ancestor::nav[1]').boundingBox();
      assert(fixedNav && box.y >= 0 && box.y + box.height < fixedNav.y,
        `resume must be entirely above the first viewport’s mobile navigation: ${JSON.stringify({ box, fixedNav })}`);
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal overflow');
    await cta.click();
    await heading(arp).waitFor();
    await page.waitForFunction(title => document.activeElement?.getAttribute('aria-label') === title, arp);
    await nav.getByText('Шаг 8 из 18').waitFor();
    assert.equal(await stored(), 'l3-arp');

    await page.goto(base);
    await b(mobile ? 'Теория' : 'Теория и разборы').click();
    await page.getByPlaceholder('Поиск по тексту, теме, id...').fill('l3-05');
    await b(/^#l3-05 ·/).click();
    const review = page.locator('[data-explanation-question-id="l3-05"]');
    await b('Перейти к уроку: ' + route, review).click();
    const exact = page.locator('[data-lesson-section-anchor="in-depth-existing-l3-16"]');
    await exact.waitFor();
    assert.equal(await nav.count(), 0);
    assert.equal(await stored(), 'l3-arp', 'question route must not overwrite resume');
    await b('Вернуться к вопросу l3-05').click();
    await review.waitFor();
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`PASS ${width}: resume follows the authored route, survives reload, does not change after extra/search/favorite/question/practice`);
  }

  for (const stale of ['no-such-lesson', 'lan-applied-non-core', 'osi-session-presentation']) {
    const context = await browser.newContext();
    await context.addInitScript(({ key, stale }) => localStorage.setItem(key, stale), { key, stale });
    const page = await context.newPage();
    const { anyResume, openKnowledge, study } = ui(page, false);
    await page.goto(base);
    await openKnowledge();
    await study();
    assert.equal(await anyResume().count(), 0);
    await context.close();
  }
  console.log('PASS: stale, unknown and additional lesson IDs do not show a resume button');

  const context = await browser.newContext();
  await context.addInitScript(key => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (name) {
      if (name === key) throw new DOMException('Storage denied', 'SecurityError');
      return get.call(this, name);
    };
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('Storage denied', 'QuotaExceededError');
      return set.call(this, name, value);
    };
  }, key);
  const page = await context.newPage();
  const { b, card, heading, resume, anyResume, openKnowledge, study } = ui(page, false);
  await page.goto(base);
  await openKnowledge();
  await study();
  assert.equal(await anyResume().count(), 0);
  await card('l3-arp').click();
  await heading(arp).waitFor();
  await b('К каталогу уроков').click();
  await resume(arp).click();
  await heading(arp).waitFor();
  await page.reload();
  await openKnowledge();
  if (await b('База').getAttribute('aria-pressed') !== 'true') await study();
  assert.equal(await anyResume().count(), 0, 'blocked storage must not claim to persist across reload');
  await context.close();
  console.log('PASS: unavailable storage does not break the route, fallback survives while current app instance lives');
} finally {
  await browser.close();
}

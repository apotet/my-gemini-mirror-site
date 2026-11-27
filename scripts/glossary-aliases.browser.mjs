import assert from 'node:assert/strict';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5428/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const phrase = 'Power over Ethernet';
const id = 'review-poe-29';
const button = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
const setting = scope => scope.getByRole('switch', { name: 'Подсказки при наведении', exact: true });
const glossaryTerm = (scope, term) => scope.locator('[data-glossary-term=' + JSON.stringify(term) + ']').filter({ visible: true });
const popup = page => page.getByRole('tooltip');
async function position(trigger) {
  await trigger.waitFor();
  await trigger.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await trigger.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
}
async function checkPopup(page, trigger, pattern) {
  const tip = popup(page);
  await tip.waitFor();
  assert.equal(await trigger.getAttribute('aria-describedby'), await tip.getAttribute('id'));
  assert.match(await tip.innerText(), pattern);
}
async function close(page) {
  await page.keyboard.press('Escape');
  await popup(page).waitFor({ state: 'hidden' });
}
try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(10000);
    await page.goto(base);
    await button(page, mobile ? 'Теория' : 'Теория и разборы').click();
    await page.getByPlaceholder('Поиск по тексту, теме, id...').fill(id);
    await button(page, new RegExp('^#' + id + ' ·')).click();
    const review = page.locator('[data-explanation-question-id="' + id + '"]');
    const detail = review.locator('[data-explanation-detail]');
    const open = button(detail, 'Подробный разбор');
    if (await open.getAttribute('aria-expanded') !== 'true') await open.click();
    await button(detail, 'Простыми словами').click();
    const wholePhrase = glossaryTerm(detail, 'PoE').filter({ hasText: /^Power over Ethernet$/ });
    assert.equal(await wholePhrase.count(), 1, 'whole phrase has only one PoE trigger');
    assert.equal(await glossaryTerm(wholePhrase, 'Ethernet').count(), 0, 'no embedded Ethernet trigger in the actual Base explanation');
    assert.equal(await setting(detail).getAttribute('aria-checked'), 'false');
    await position(wholePhrase);
    if (!mobile) {
      await wholePhrase.hover();
      assert.equal(await popup(page).count(), 0);
    }
    if (mobile) await wholePhrase.tap(); else await wholePhrase.click();
    await checkPopup(page, wholePhrase, /Power over Ethernet.*питан/is);
    await close(page);
    for (const [abbr, expansion, definition] of [
      ['PSE', 'Power Sourcing Equipment', /подающ/i],
      ['PD', 'Powered Device', /получающ/i],
    ]) {
      const target = glossaryTerm(detail, abbr).filter({ hasText: new RegExp('^' + expansion + '$') });
      assert.equal(await target.count(), 1);
      await position(target);
      if (mobile) await target.tap(); else await target.press('Enter');
      await checkPopup(page, target, definition);
      await close(page);
    }
    await button(detail, 'По делу').click();
    for (const abbr of ['PSE', 'PD']) await glossaryTerm(detail, abbr).first().waitFor();
    await setting(detail).click();
    assert.equal(await setting(detail).getAttribute('aria-checked'), 'true');
    if (!mobile) {
      const target = glossaryTerm(detail, 'PSE').first();
      await page.mouse.move(0, 0);
      await position(target);
      await target.hover();
      await checkPopup(page, target, /Power Sourcing Equipment/i);
      await close(page);
    }
    await button(review, /^Перейти к уроку:/).click();
    const lesson = page.locator('article').filter({ has: setting(page) });
    await setting(lesson).waitFor();
    assert.equal(await setting(lesson).getAttribute('aria-checked'), 'true');
    const realTerm = lesson.locator('section [data-glossary-term="PSE"]').filter({ visible: true }).first();
    await position(realTerm);
    if (mobile) await realTerm.tap(); else await realTerm.hover();
    await checkPopup(page, realTerm, /Power Sourcing Equipment.*подающ/is);
    await close(page);
    const technology = lesson.locator('section [data-glossary-term="Ethernet"]').filter({ visible: true }).first();
    await position(technology);
    if (mobile) await technology.tap(); else await technology.click();
    await checkPopup(page, technology, /Технология локальных сетей|Семейство технологий/i);
    assert.doesNotMatch(await popup(page).innerText(), /Power over Ethernet/);
    await close(page);
    await page.reload();
    await button(page, mobile ? 'Теория' : 'Теория и разборы').click();
    await page.getByPlaceholder('Поиск по тексту, теме, id...').fill('l7-04');
    await button(page, /^#l7-04 ·/).click();
    const dnsReview = page.locator('[data-explanation-question-id="l7-04"]');
    const dnsDetail = dnsReview.locator('[data-explanation-detail]');
    const dnsOpen = button(dnsDetail, 'Подробный разбор');
    if (await dnsOpen.getAttribute('aria-expanded') !== 'true') await dnsOpen.click();
    await button(dnsDetail, 'По делу').click();
    const dnsRow = dnsDetail.locator('p').filter({ hasText: 'web.example.test A 192.0.2.40' });
    const dnsTrigger = glossaryTerm(dnsRow, 'A').first();
    await position(dnsTrigger);
    if (mobile) await dnsTrigger.tap(); else await dnsTrigger.click();
    await checkPopup(page, dnsTrigger, /запис[ьи] DNS.*IPv4|Адресная запись IPv4/is);
    await close(page);
    await button(dnsReview, /^Перейти к уроку:/).click();
    await button(page, 'Простыми словами').click();
    const dnsLesson = page.locator('article').filter({ has: setting(page) });
    const dnsParagraph = dnsLesson.locator('section p').filter({ hasText: 'A содержит IPv4-адрес, AAAA' });
    const dnsLessonTrigger = glossaryTerm(dnsParagraph, 'A').first();
    await position(dnsLessonTrigger);
    if (mobile) await dnsLessonTrigger.tap(); else await dnsLessonTrigger.click();
    await checkPopup(page, dnsLessonTrigger, /запис[ьи] DNS.*IPv4|Адресная запись IPv4/is);
    await close(page);
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`PASS ${width}px: exact PoE expansion, PSE/PD, opt-in, two review modes and actual PoE and DNS lessons`);
  }
} finally {
  await browser.close();
}

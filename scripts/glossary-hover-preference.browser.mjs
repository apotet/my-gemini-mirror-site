import assert from 'node:assert/strict';
import { loadBankWithExplanations } from './load-bank.mjs';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5428/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const key = 'netops_glossary_hover_v1';
const questionId = 'gen-net-25-4';
const same = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
const setting = scope => scope.getByRole('switch', { name: 'Подсказки при наведении', exact: true });
const tooltip = page => page.getByRole('tooltip');
const { ALL_QUESTIONS } = await loadBankWithExplanations();
const question = ALL_QUESTIONS.find(q => q.id === questionId);
const epoch = 'glossary-browser-v1';
const snapshot = {
  questions: [question], currentIndex: 0, mode: 'mixed', feedbackMode: 'instant',
  isCompleted: false, startTime: Date.now() - 1000, progressEpoch: epoch,
  attemptId: 'glossary-instant', userAnswers: {}, submittedQuestions: {},
};
const lastReview = { version: 1, session: {
  ...snapshot, feedbackMode: 'exam', isCompleted: true, endTime: Date.now(), attemptId: 'glossary-review',
  userAnswers: { [questionId]: question.correct }, submittedQuestions: { [questionId]: true },
} };
const progress = { version: 4, epoch, questions: {}, receipts: {}, dates: [], backup: {}, migrationNotice: false };
async function context(width, storage = 'fresh') {
  const mobile = width < 500;
  const c = await browser.newContext({
    viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce',
  });
  await c.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin
    ? route.continue() : route.abort());
  await c.addInitScript(({ key, storage, snapshot, lastReview, progress }) => {
    if (!sessionStorage.getItem('glossary-fixture')) {
      sessionStorage.setItem('glossary-fixture', '1');
      localStorage.setItem('osi_user_progress_v4', JSON.stringify(progress));
      localStorage.setItem('osi_active_session', JSON.stringify(snapshot));
      localStorage.setItem('osi_last_exam_review_v1', JSON.stringify(lastReview));
      localStorage.setItem('glossary-unrelated-setting', 'untouched');
      if (storage === 'invalid') localStorage.setItem(key, 'unexpected');
    }
    if (storage === 'blocked' || storage === 'readonly') {
      const proto = Storage.prototype;
      const get = proto.getItem, set = proto.setItem;
      proto.getItem = function (name) {
        if (storage === 'blocked' && name === key) throw new DOMException('Storage blocked', 'SecurityError');
        return get.apply(this, arguments);
      };
      proto.setItem = function (name) {
        if (name === key) throw new DOMException('Storage blocked', 'QuotaExceededError');
        return set.apply(this, arguments);
      };
    }
  }, { key, storage, snapshot, lastReview, progress });
  return c;
}
async function openTheory(page, mobile) {
  await same(page, mobile ? 'Теория' : 'Теория и разборы').click();
  await page.getByPlaceholder('Поиск по тексту, теме, id...').fill(questionId);
  await same(page, new RegExp('^#' + questionId + ' ·')).click();
  const review = page.locator('[data-explanation-question-id="' + questionId + '"]');
  const detail = review.locator('[data-explanation-detail]');
  const expander = same(detail, 'Подробный разбор');
  if (await expander.getAttribute('aria-expanded') === 'false') await expander.click();
  await setting(detail).waitFor();
  return { review, detail };
}
async function state(control, desired) {
  await control.waitFor();
  assert.equal(await control.getAttribute('aria-checked'), String(desired));
}
async function termIn(scope) {
  const term = scope.locator('[data-glossary-term]').filter({ visible: true }).first();
  await term.waitFor();
  await term.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await term.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
  return term;
}
const noTooltip = async page => {
  assert.equal(await tooltip(page).count(), 0, 'disabled automatic interaction opened a popup');
};
async function shown(page, term) {
  const popup = tooltip(page);
  await popup.waitFor();
  assert.equal(await popup.count(), 1);
  assert.equal(await popup.getAttribute('id'), await term.getAttribute('aria-describedby'));
  assert.ok((await popup.innerText()).trim().length > 15);
  const viewport = page.viewportSize();
  const tip = await popup.boundingBox();
  const anchor = await term.boundingBox();
  assert.ok(tip.x >= 0 && tip.y >= 0 && tip.x + tip.width <= viewport.width + 1 &&
    tip.y + tip.height <= viewport.height + 1, 'tooltip fits in the viewport');
  const roomBelow = anchor.y + anchor.height + 8 + tip.height <= viewport.height - 12;
  const roomAbove = anchor.y - 8 - tip.height >= 12;
  if (roomBelow || roomAbove) assert.ok(tip.y >= anchor.y + anchor.height || tip.y + tip.height <= anchor.y,
    'tooltip does not cover the triggering term when room exists');
}
const dismiss = async page => {
  await page.keyboard.press('Escape');
  await tooltip(page).waitFor({ state: 'hidden' });
};

try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const c = await context(width, mobile ? 'invalid' : 'fresh');
    const page = await c.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    page.setDefaultTimeout(10000);
    const { review, detail } = await openTheory(page, mobile);
    const toggle = setting(detail);
    await state(toggle, false);
    const box = await toggle.boundingBox();
    assert.ok(box.height >= 44 && box.x >= 0 && box.x + box.width <= width);
    const term = await termIn(detail);
    if (mobile) {
      await term.tap();
      await shown(page, term);
      await term.tap();
      await noTooltip(page);
      await term.tap();
      await shown(page, term);
      await page.touchscreen.tap(1, 1);
      await noTooltip(page);
    } else {
      await term.hover();
      await noTooltip(page);
      await page.keyboard.press('Tab');
      await term.focus();
      await noTooltip(page);
      await term.press('Enter');
      await shown(page, term);
      await dismiss(page);
      await term.press('Space');
      await shown(page, term);
      await page.mouse.click(1, 1);
      await noTooltip(page);
      await term.click();
      await shown(page, term);
      await dismiss(page);
    }
    await toggle.click();
    await state(toggle, true);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), key), '1');
    await termIn(detail);
    await page.mouse.move(0, 0);
    if (!mobile) {
      await term.hover();
      await shown(page, term);
      await page.mouse.move(0, 0);
      await tooltip(page).waitFor({ state: 'hidden' });
      await term.hover();
      await shown(page, term);
      // Hit the switch through a separate DOM focus-neutral invocation: this
      // exercises the preference update itself, not merely outside-click.
      await toggle.evaluate(node => node.click());
      await state(toggle, false);
      await noTooltip(page);
      await toggle.click();
      await state(toggle, true);
      await termIn(detail);
      await dismiss(page);
      await term.dispatchEvent('pointerover', { pointerType: 'pen', bubbles: true });
      await shown(page, term);
      await dismiss(page);
      await page.keyboard.press('Tab');
      await term.focus();
      await shown(page, term);
      await dismiss(page);
    }
    await same(review, /^Перейти к уроку:/).click();
    await state(setting(page), true);
    const lessonTerm = await termIn(page.locator('article').filter({ has: setting(page) }));
    if (mobile) await lessonTerm.tap(); else await lessonTerm.click();
    await shown(page, lessonTerm);
    await dismiss(page);
    await page.reload();
    const afterReload = await openTheory(page, mobile);
    await state(setting(afterReload.detail), true);
    await setting(afterReload.detail).click();
    await state(setting(afterReload.detail), false);
    const after = await termIn(afterReload.detail);
    if (!mobile) {
      await after.hover();
      await noTooltip(page);
    }
    assert.equal(await page.evaluate(key => localStorage.getItem(key), key), '0');

    if (mobile) await same(page, 'Открыть меню').click();
    await same(page, 'Тестирование').first().click();
    await same(page, /Продолжить/).first().click();
    await same(page, new RegExp('^C ' + question.answers[2].replaceAll('.', '\\.'))).click();
    await same(page, 'Подтвердить').click();
    const examDetail = page.locator('[data-explanation-question-id="' + questionId + '"] [data-explanation-detail]');
    await examDetail.locator('summary').click();
    await state(setting(examDetail), false);
    await setting(examDetail).click();
    await state(setting(examDetail), true);
    await same(page, 'Выйти в меню').click();
    await same(page, 'Посмотреть разбор последней попытки').click();
    const card = page.locator('.review-question').filter({ hasText: question.text });
    await card.locator(':scope > summary').click();
    const savedDetail = card.locator('[data-explanation-detail]');
    await savedDetail.locator('summary').click();
    await state(setting(savedDetail), true);
    await setting(savedDetail).click();
    await state(setting(savedDetail), false);
    assert.equal(await page.evaluate(() => localStorage.getItem('glossary-unrelated-setting')), 'untouched');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []);
    await c.close();
    console.log(`PASS: ${width}px default OFF, manual interactions, opt-in, shared across theory/lesson/live+saved exam, reload`);
  }
  {
    const c = await context(1440);
    const first = await c.newPage();
    const second = await c.newPage();
    for (const page of [first, second]) await page.goto(base);
    const firstDetail = (await openTheory(first, false)).detail;
    const secondDetail = (await openTheory(second, false)).detail;
    await setting(firstDetail).click();
    await second.waitForFunction(() => document.querySelector('[role="switch"]')?.getAttribute('aria-checked') === 'true');
    const term = await termIn(secondDetail);
    await term.hover();
    await shown(second, term);
    await setting(firstDetail).evaluate(node => node.click());
    await second.waitForFunction(() => document.querySelector('[role="switch"]')?.getAttribute('aria-checked') === 'false');
    await noTooltip(second);
    await c.close();
    console.log('PASS: another tab receives the setting and dismisses its open automatic tooltip');
  }
  for (const storage of ['blocked', 'readonly']) {
    const c = await context(1440, storage);
    const page = await c.newPage();
    await page.goto(base);
    const { review, detail } = await openTheory(page, false);
    await state(setting(detail), false);
    const term = await termIn(detail);
    await term.click();
    await shown(page, term);
    await dismiss(page);
    await setting(detail).click();
    await state(setting(detail), true);
    await same(review, /^Перейти к уроку:/).click();
    await state(setting(page), true);
    await page.reload();
    await state(setting((await openTheory(page, false)).detail), false);
    await c.close();
    console.log(`PASS: ${storage} storage defaults to OFF; a user can opt in for the current tab`);
  }
} finally {
  await browser.close();
}

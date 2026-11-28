import assert from 'node:assert/strict';
import { loadBankWithExplanations } from './load-bank.mjs';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5428/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH
  ? { executablePath: process.env.NETOPS_CHROMIUM_PATH, args: ['--disable-dev-shm-usage'] } : {});
const b = (page, name) => page.getByRole('button', { name, exact: typeof name === 'string' });
const fixtures = [
  ['review-ndp-1', 'NDP: адрес multicast для NS', 'ff02::1:ffab:cdef', /младшие 24 бита/],
  ['review-ndp-2', 'RA: выбор маршрутизатора по умолчанию', 'Только fe80::9', /у префиксов свои сроки/],
  ['review-ndp-3', 'DAD: дубликат предварительного адреса', 'Не назначать его: обнаружен дубликат', /адрес не уникален/],
  ['review-slaac-4', 'SLAAC: собрать адрес из префикса и IID', '2001:db8:224:8::42', /последние 64/],
  ['review-slaac-5', 'RA: разные задачи флагов L и A', 'Можно сформировать SLAAC-адрес; опция не объявляет префикс on-link', /не объявляет префикс off-link/],
  ['review-slaac-6', 'SLAAC: найти причину по срокам в RA', 'Preferred Lifetime не может превышать Valid Lifetime', /игнорирует для SLAAC опцию/],
];
const { ALL_QUESTIONS } = await loadBankWithExplanations();
const epoch = 'ipv6-context-browser';
const question = ALL_QUESTIONS.find(q => q.id === 'review-ndp-3');
const lastReview = { version: 1, session: {
  questions: [question], currentIndex: 0, mode: 'mixed', feedbackMode: 'exam',
  isCompleted: true, startTime: Date.now() - 2000, endTime: Date.now(),
  progressEpoch: epoch, attemptId: 'ipv6-concepts-last-review',
  userAnswers: { [question.id]: question.correct }, submittedQuestions: { [question.id]: true },
} };
const progress = { version: 4, epoch, questions: {}, receipts: {}, dates: [], backup: {}, migrationNotice: false };

async function openQuestion(page, mobile, id) {
  await b(page, mobile ? 'Теория' : 'Теория и разборы').click();
  await page.getByPlaceholder('Поиск по тексту, теме, id...').fill(id);
  await b(page, new RegExp('^#' + id + ' ·')).click();
  const review = page.locator('[data-explanation-question-id="' + id + '"]');
  await review.waitFor();
  return review;
}

async function solve(page, [id, title, answer, explanation]) {
  const heading = page.getByRole('heading', { name: title, exact: true });
  await heading.waitFor();
  assert.equal(await heading.evaluate(el => document.activeElement === el), true, id + ' focuses the relevant drill');
  assert.equal(await b(page, 'Понятия').getAttribute('aria-pressed'), 'true');
  assert.ok(await heading.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return rect.top >= 64 && rect.bottom < innerHeight - 55;
  }), id + ' exercise is visible on arrival');
  await page.getByText('Задание 1 из 1', { exact: true }).waitFor();
  await b(page, answer).click();
  await b(page, 'Проверить').click();
  await page.getByText('Верно', { exact: true }).waitFor();
  await page.getByText(explanation).waitFor();
  await b(page, 'Дальше').click();
  await page.getByText('Подход завершён', { exact: true }).waitFor();
  await page.getByText('1 из 1', { exact: true }).waitFor();
  await b(page, 'Повторить задание').click();
  await b(page, answer).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
}

try {
  for (const width of [375, 1440]) {
    const mobile = width < 500;
    const context = await browser.newContext({
      viewport: { width, height: mobile ? 667 : 900 },
      isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce',
    });
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin
      ? route.continue() : route.abort());
    await context.addInitScript(({ progress, lastReview }) => {
      localStorage.setItem('osi_user_progress_v4', JSON.stringify(progress));
      localStorage.setItem('osi_last_exam_review_v1', JSON.stringify(lastReview));
    }, { progress, lastReview });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(10000);
    await page.goto(base);
    for (const fixture of fixtures) {
      const review = await openQuestion(page, mobile, fixture[0]);
      const go = b(review, 'Открыть IPv6-тренажёр');
      if (mobile) await go.tap(); else await go.press('Enter');
      await solve(page, fixture);
    }
    await b(page, 'Понятия').click();
    await page.getByText('Задание 1 из 10', { exact: true }).waitFor();
    await page.getByRole('heading', { name: 'Закрепим без зубрёжки', exact: true }).waitFor();

    const typeReview = await openQuestion(page, mobile, 'l3-d06');
    await b(typeReview, 'Открыть IPv6-тренажёр').click();
    await page.getByText(/^Какой это тип адреса\?/).waitFor();
    assert.equal(await b(page, 'Тип').getAttribute('aria-pressed'), 'true');
    await page.getByText('Задание 1 из 10', { exact: true }).waitFor();

    await b(page, mobile ? 'IPv6' : 'IPv6 Тренажёр').click();
    await page.getByText(/^Запиши адрес в канонической сокращённой форме/).waitFor();
    assert.equal(await b(page, 'Сжать').getAttribute('aria-pressed'), 'true');

    if (mobile) await b(page, 'Тесты').click();
    else await b(page, 'Тестирование').first().click();
    await b(page, 'Посмотреть разбор последней попытки').click();
    const card = page.locator('.review-question').filter({ hasText: question.text });
    await card.locator(':scope > summary').click();
    await b(card, 'Открыть IPv6-тренажёр').click();
    await solve(page, fixtures[2]);

    const unrelated = await openQuestion(page, mobile, 'gen-diag-4');
    assert.equal(await b(unrelated, 'Открыть IPv6-тренажёр').count(), 0);
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`PASS ${width}: six exact Theory drills, saved Review DAD, Type, direct/generic trainer and no unrelated link`);
  }
} finally {
  await browser.close();
}

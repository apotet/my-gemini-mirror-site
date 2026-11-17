#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { loadBankWithExplanations } from './load-bank.mjs';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const { ALL_QUESTIONS } = await loadBankWithExplanations();
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5428/my-gemini-mirror-site/';
const get = id => ALL_QUESTIONS.find(question => question.id === id);
const fixture = {
  questions: ['ts-x12', 'ts-x05', 'l3-d01', 'review-slaac-4', 'l57-d02'].map(get),
  mode: 'mixed', feedbackMode: 'exam', currentIndex: 4, isCompleted: true, startTime: Date.now() - 3000,
  attemptId: 'explanation-browser-fixture', progressEpoch: 'fixture',
};
fixture.submittedQuestions = Object.fromEntries(fixture.questions.map(q => [q.id, true]));
fixture.userAnswers = Object.fromEntries(fixture.questions.map(q => [q.id, q.correct]));
const lastSnapshot = JSON.stringify({ version: 1, session: fixture });
const progressSnapshot = JSON.stringify({
  version: 4, epoch: fixture.progressEpoch, questions: {}, receipts: {}, dates: [], backup: {}, migrationNotice: false,
});
const activeSnapshot = JSON.stringify({
  ...fixture, questions: [get('ts-x12'), get('ts-x05')], currentIndex: 0, feedbackMode: 'instant', isCompleted: false,
  attemptId: 'explanation-instant-fixture', submittedQuestions: {}, userAnswers: {},
});

mkdirSync('scripts/.cache/review-browser', { recursive: true });
const browser = await chromium.launch({
  ...(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {}),
});
try {
  for (const width of [375, 1440]) {
    const mobile = width < 500;
    const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile, ignoreHTTPSErrors: process.env.NETOPS_IGNORE_HTTPS_ERRORS === '1' });
    page.setDefaultTimeout(12000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({ lastSnapshot, progressSnapshot, activeSnapshot }) => {
      localStorage.setItem('osi_last_exam_review_v1', lastSnapshot);
      localStorage.setItem('osi_user_progress_v4', progressSnapshot);
      localStorage.setItem('osi_active_session', activeSnapshot);
      localStorage.setItem('netops_mock_testing_settings', JSON.stringify({ mode: 'mistakes' }));
      localStorage.setItem('netops_mock_testing_active_v1', JSON.stringify({
        ids: ['ts-x05'], index: 0, answers: {}, submitted: false,
      }));
    }, { lastSnapshot, progressSnapshot, activeSnapshot });
    await page.goto(base);
    const button = (name, root = page) => root.getByRole('button', { name, exact: typeof name === 'string' });
    const noPageOverflow = async () => {
      const size = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      assert.ok(size[0] <= size[1] + 1, 'document is horizontally contained: ' + size);
    };
    const openReview = () => button('Посмотреть разбор последней попытки').click();
    const openDetail = root => root.locator('summary').filter({ hasText: /^Подробный разбор$/ }).click();
    const row = title => page.locator('.review-question').filter({ hasText: title });
    const openRow = async title => {
      const card = row(title);
      if ((await card.getAttribute('open')) === null) await card.locator(':scope > summary').click();
      return card;
    };
    const home = async () => {
      if (mobile) await button('Тесты').click();
      else await button('Тестирование').click();
    };

    await openReview();
    await page.getByText('5 из 5 верно').waitFor();
    const socket = await openRow('ss -tulpn или netstat -tulpn');
    await openDetail(socket);
    await socket.getByRole('button', {name: 'Перейти к уроку: CLI диагностика сети: ipconfig, nslookup, traceroute, ip route и ss'}).waitFor();
    assert.equal(await socket.getByText('Урок по этой теме пока не подготовлен', {exact:true}).count(), 0);
    await socket.getByText('Профессиональный разбор пока не подготовлен', {exact:true}).waitFor();
    assert.equal(await socket.getByRole('group', {name:'Стиль объяснения'}).count(), 0);
    await socket.locator('pre code').filter({ hasText: /udp\s+UNCONN/ }).waitFor();
    assert.equal(await socket.locator('pre [data-glossary-term]').count(), 0);
    const term = socket.locator('[data-glossary-term]').first();
    if (mobile) await term.tap();
    else await term.hover();
    await page.getByRole('tooltip').waitFor();
    assert.equal(await socket.locator('details ul li').count(), 3);
    const pre = await socket.locator('pre').last().evaluate(el => [el.clientWidth, el.scrollWidth, getComputedStyle(el).overflowX]);
    assert.equal(pre[2], 'auto');
    if (mobile) assert.ok(pre[1] > pre[0], 'wide terminal output scrolls inside the pre');
    await noPageOverflow();

    const layered = await openRow(get('l57-d02').text);
    await openDetail(layered);
    const shortBefore = await layered.locator('h4').locator('..').innerText();
    const plainBefore = await layered.locator('details').innerText();
    await button('По делу', layered).click();
    assert.equal(await layered.locator('h4').locator('..').innerText(), shortBefore, 'short explanation is independent of detail style');
    assert.notEqual(await layered.locator('details').innerText(), plainBefore, 'professional body actually changes');
    assert.equal(await button('По делу', socket).count(), 0, 'global pro preference cannot invent pro on another question');
    await socket.getByText('Профессиональный разбор пока не подготовлен', {exact:true}).waitFor();
    assert.equal(await button('По делу', layered).getAttribute('aria-pressed'), 'true');
    await button('Простыми словами', layered).click();
    assert.equal(await button('Простыми словами', layered).getAttribute('aria-pressed'), 'true');

    await page.screenshot({ path: `scripts/.cache/review-browser/review-${width}.png`, fullPage: true });

    const cidr = await openRow(get('l3-d01').text);
    await button('Открыть IPv4-тренажёр', cidr).click();
    await page.getByText(/Префикс маски: \/30/).waitFor();
    await home();
    await openReview();
    const v6 = await openRow(get('review-slaac-4').text);
    await button('Открыть IPv6-тренажёр', v6).click();
    assert.equal(await button('Понятия').getAttribute('aria-pressed'), 'true');
    await home();
    await openReview();
    const cisco = await openRow(get('ts-x05').text);
    await button(/^Перейти к уроку:/, cisco).click();
    await page.locator('pre code').filter({ hasText: /^show ip interface brief$/ }).waitFor();
    await noPageOverflow();

    await home();
    await button('Продолжить тестирование').click();
    await button(new RegExp(get('ts-x12').answers[0])).click();
    await button('Подтвердить').click();
    await openDetail(page);
    await page.locator('pre code').filter({ hasText: /UNCONN/ }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('osi_last_exam_review_v1')), lastSnapshot);
    await noPageOverflow();
    await button('Следующий вопрос').click();
    const wrong = get('ts-x05').answers.find((_, index) => !get('ts-x05').correct.includes(index));
    await button(new RegExp(wrong)).click();
    await button('Подтвердить').click();
    await button(/^Перейти к уроку:/).click();
    await page.getByRole('heading', {name:'Cisco IOS: show, TAB и ? — диагностика без угадайки', exact:true}).waitFor();
    await home();

    if (mobile) await button('Открыть меню').click();
    await button('Макет тестирования').click();
    await button('Продолжить').click();
    await button(get('ts-x05').answers[0]).click();
    await button('Ответить').click();
    await openDetail(page);
    await page.locator('pre code').filter({ hasText: /show ip interface brief/ }).waitFor();
    await page.getByText('Профессиональный разбор пока не подготовлен', {exact:true}).waitFor();
    await button(/^Перейти к уроку:/).click();
    await page.getByRole('heading', {name:'Cisco IOS: show, TAB и ? — диагностика без угадайки', exact:true}).waitFor();
    if (mobile) await button('Открыть меню').click();
    await button('Макет тестирования').click();
    await button('Продолжить').click();
    await button('Завершить').click();
    await button('Посмотреть ответы').click();
    const mock = await openRow(get('ts-x05').text);
    await openDetail(mock);
    await mock.locator('pre code').filter({ hasText: /show ip interface brief/ }).waitFor();
    await noPageOverflow();
    await button(/^Перейти к уроку:/, mock).click();
    await page.getByRole('heading', {name:'Cisco IOS: show, TAB и ? — диагностика без угадайки', exact:true}).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('osi_last_exam_review_v1')), lastSnapshot, 'saved completed attempt remains byte-identical');
    await home();
    await button(/Работа над ошибками/).click();
    if (await button('Заменить попытку').isVisible()) await button('Заменить попытку').click();
    await button(new RegExp(get('ts-x05').answers[get('ts-x05').correct[0]])).click();
    await button('Подтвердить').click();
    await button(/^Перейти к уроку:/).click();
    await page.getByRole('heading', {name:'Cisco IOS: show, TAB и ? — диагностика без угадайки', exact:true}).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('osi_last_exam_review_v1')), lastSnapshot);
    await home();
    await button('Продолжить тестирование').click();
    await button('Завершить').click();
    const fresh = await openRow(get('ts-x05').text);
    await button(/^Перейти к уроку:/, fresh).click();
    await page.getByRole('heading', {name:'Cisco IOS: show, TAB и ? — диагностика без угадайки', exact:true}).waitFor();
    await noPageOverflow();
    await page.screenshot({ path: `scripts/.cache/review-browser/lesson-${width}.png`, fullPage: true });

    // Isolate the paragraph-link smoke from previous active/retried attempts.
    // A fresh browser context must read exactly this completed saved attempt.
    const targetCases = [
      ['photo-otdr-end', 'otdr-end-of-fiber'],
      ['gen-osi-a-19', 'dns-nxdomain-application'],
      ['tcp-06', 'tcpip-end-to-end-fields'],
    ];
    const targetQuestions = targetCases.map(([id]) => get(id));
    const targetedSession = {
      ...fixture,
      questions: targetQuestions,
      currentIndex: targetQuestions.length - 1,
      attemptId: 'lesson-section-links-browser-fixture',
      submittedQuestions: Object.fromEntries(targetQuestions.map(q => [q.id, true])),
      userAnswers: Object.fromEntries(targetQuestions.map(q => [q.id, q.correct])),
    };
    const focusedPage = await browser.newPage({
      viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile,
      ignoreHTTPSErrors: process.env.NETOPS_IGNORE_HTTPS_ERRORS === '1',
    });
    try {
      focusedPage.setDefaultTimeout(12000);
      const focusedErrors = [];
      focusedPage.on('pageerror', error => focusedErrors.push(error.message));
      await focusedPage.addInitScript(({ review, progress }) => {
        localStorage.setItem('osi_last_exam_review_v1', review);
        localStorage.setItem('osi_user_progress_v4', progress);
      }, { review: JSON.stringify({ version: 1, session: targetedSession }), progress: progressSnapshot });
      await focusedPage.goto(base);
      await button('Посмотреть разбор последней попытки', focusedPage).click();

      for (const [id, anchorId] of targetCases) {
        const targetReview = focusedPage.locator('.review-question').filter({ hasText: get(id).text });
        if (await targetReview.getAttribute('open') === null) {
          await targetReview.locator(':scope > summary').click();
        }
        await button(/^Перейти к уроку:/, targetReview).click();
        const section = focusedPage.locator(`[data-lesson-section-anchor="${anchorId}"]`);
        await section.waitFor({ state: 'visible' });
        await focusedPage.waitForFunction(id => {
          const node = document.querySelector(`[data-lesson-section-anchor="${id}"]`);
          if (!node) return false;
          const rect = node.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.bottom > 0 &&
            node.className.includes('ring-cyan-400');
        }, anchorId);
        const plainButton = button('Простыми словами', focusedPage);
        if (await plainButton.getAttribute('aria-pressed') !== 'true') await plainButton.click();
        const plain = await section.innerText();
        await button('По делу', focusedPage).click();
        await section.waitFor({ state: 'visible' });
        await focusedPage.waitForFunction(id => {
          const node = document.querySelector(`[data-lesson-section-anchor="${id}"]`);
          if (!node) return false;
          const rect = node.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.bottom > 0;
        }, anchorId);
        const professional = await section.innerText();
        assert.notEqual(professional, plain, id + ': professional explanation differs at exact anchor');
        await button('Простыми словами', focusedPage).click();
        assert.equal(await section.innerText(), plain, id + ': same paragraph after style toggle');
        const widths = await focusedPage.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        assert.ok(widths[0] <= widths[1] + 1, 'anchored view has no horizontal overflow: ' + widths);
        await button(`Вернуться к вопросу ${id}`, focusedPage).click();
        await focusedPage.getByText(get(id).text).first().waitFor();
        await button(mobile ? 'Тесты' : 'Тестирование', focusedPage).click();
        await button('Посмотреть разбор последней попытки', focusedPage).click();
      }
      assert.equal(await focusedPage.evaluate(() => localStorage.getItem('osi_user_progress_v4')),
        progressSnapshot, 'paragraph links do not modify saved progress');
      assert.deepEqual(focusedErrors, []);
    } finally {
      await focusedPage.close();
    }
    assert.deepEqual(errors, []);
    console.log(`PASS Chromium ${width}px: last and instant review, plain/pro, glossary, IPv4 and IPv6, direct lesson in instant/final/last/mistake and mock feedback/results, material gaps and immutable historical review`);
    await page.close();
  }
} finally {
  await browser.close();
}

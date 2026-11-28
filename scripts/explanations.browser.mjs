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

    // The question-count picker must be compact and readable in dark mode, on mobile and desktop.
    const countTrigger = button(/^Вопросов в тесте:/);
    await countTrigger.click();
    const countMenu = page.getByRole('menu', { name: 'Количество вопросов в тесте' });
    await countMenu.waitFor();
    // The restore effect may normalize the fixture before any picker interaction.
    const storedAttemptBeforeCountChange = await page.evaluate(() => localStorage.getItem('osi_active_session'));
    assert.equal(await countMenu.getByRole('menuitemradio').count(), 5, 'five fixed question counts');
    assert.equal(await countMenu.getByRole('menuitemradio', { name: '10 вопросов', exact: true }).getAttribute('aria-checked'), 'true');
    const countAppearance = await countMenu.evaluate(node => ({
      width: node.getBoundingClientRect().width,
      background: getComputedStyle(node).backgroundColor,
    }));
    assert.ok(countAppearance.width <= 200, 'popup is compact rather than full-width');
    assert.ok(countAppearance.background !== 'rgba(0, 0, 0, 0)', 'popup is opaque');
    await countMenu.getByRole('menuitemradio', { name: '5 вопросов', exact: true }).click();
    assert.equal(await countTrigger.getAttribute('aria-label'), 'Вопросов в тесте: 5');
    assert.equal(await countMenu.count(), 0, 'picker closes after choosing a count');
    await countTrigger.click();
    await countMenu.getByRole('menuitemradio', { name: '15 вопросов', exact: true }).focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(await countMenu.getByRole('menuitemradio', { name: '20 вопросов', exact: true })
      .evaluate(node => document.activeElement === node), true, 'arrow-key menu navigation');
    await page.keyboard.press('Escape');
    assert.equal(await countMenu.count(), 0, 'Escape closes picker');
    await countTrigger.click();
    await page.keyboard.press('End');
    assert.equal(await countMenu.getByRole('menuitemradio', { name: '30 вопросов', exact: true })
      .evaluate(node => document.activeElement === node), true, 'End focuses last choice');
    await page.keyboard.press('Home');
    assert.equal(await countMenu.getByRole('menuitemradio', { name: '5 вопросов', exact: true })
      .evaluate(node => document.activeElement === node), true, 'Home focuses first choice');
    await page.keyboard.press('ArrowUp');
    assert.equal(await countMenu.getByRole('menuitemradio', { name: '30 вопросов', exact: true })
      .evaluate(node => document.activeElement === node), true, 'ArrowUp wraps to last choice');
    await page.keyboard.press('Enter');
    assert.equal(await countTrigger.getAttribute('aria-label'), 'Вопросов в тесте: 30');
    assert.equal(await countMenu.count(), 0, 'Enter chooses and closes the menu');
    await countTrigger.click();
    const themeStyles = await countMenu.evaluate(node => {
      const root = document.documentElement;
      const originalDark = root.classList.contains('dark');
      const item = node.querySelector('[role="menuitemradio"][aria-checked="false"]');
      // Tailwind v4 computes modern OKLCH colors; draw them to canvas for actual sRGB pixels.
      const toRgb = color => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext('2d');
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
      };
      const read = dark => {
        root.classList.toggle('dark', dark);
        return [toRgb(getComputedStyle(node).backgroundColor), toRgb(getComputedStyle(item).color)];
      };
      const dark = read(true);
      const light = read(false);
      root.classList.toggle('dark', originalDark);
      return { dark, light };
    });
    assert.notDeepEqual(themeStyles.dark, themeStyles.light, 'menu adapts to both color schemes');
    const luminance = channels => channels.map(value => value / 255)
      .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
      .reduce((sum, c, index) => sum + c * [0.2126, 0.7152, 0.0722][index], 0);
    for (const [theme, [background, foreground]] of Object.entries(themeStyles)) {
      const a = luminance(background), b = luminance(foreground);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      assert.ok(ratio >= 4.5, theme + ' menu text contrast: ' + ratio);
    }
    await page.mouse.click(2, 2);
    assert.equal(await countMenu.count(), 0, 'outside pointer closes the menu');
    assert.equal(await page.evaluate(() => localStorage.getItem('osi_active_session')),
      storedAttemptBeforeCountChange, 'changing count does not mutate an existing attempt');
    await noPageOverflow();

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
    if (!mobile) await socket.getByRole('switch', { name: 'Подсказки при наведении' }).click();
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

    // Retired testing mock is replaced by courses-prototypes.browser.mjs.
    // This cross-level fixture intentionally replays a diagnostic L2/L3 mistake.
    // The new Base must exclude it, so choose the mixed level for the all-level replay.
    if (mobile) await page.getByRole('combobox', { name: /Выбери свой уровень/ }).selectOption('mixed');
    else await button(/^Смешанный/).click();
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
      ['photo-otdr-end', 'otdr-end-of-fiber', 'Рефлектометр OTDR: импульс, трассы и отражения'],
      ['gen-osi-a-19', 'dns-nxdomain-application', 'DNS: как имя становится адресом'],
      ['tcp-06', 'tcpip-end-to-end-fields', 'TCP/IP: четыре уровня и инкапсуляция'],
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
      const originalReview = await focusedPage.evaluate(() => localStorage.getItem('osi_last_exam_review_v1'));
      await button('Посмотреть разбор последней попытки', focusedPage).click();

      for (const [id, anchorId, lessonTitle] of targetCases) {
        const targetReview = focusedPage.locator('.review-question').filter({ hasText: get(id).text });
        if (await targetReview.getAttribute('open') === null) {
          await targetReview.locator(':scope > summary').click();
        }
        await button(/^Перейти к уроку:/, targetReview).click();
        await focusedPage.getByRole('heading', { name: lessonTitle, exact: true }).waitFor();
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
        await focusedPage.waitForFunction(() => Array.from(document.querySelectorAll('button'))
          .some(node => node.textContent?.trim() === 'Простыми словами' &&
            node.getAttribute('aria-pressed') === 'true'));
        const plain = await section.innerText();
        await button('По делу', focusedPage).click();
        await focusedPage.waitForFunction(() => Array.from(document.querySelectorAll('button'))
          .some(node => node.textContent?.trim() === 'По делу' && node.getAttribute('aria-pressed') === 'true'));
        await focusedPage.waitForFunction(({ anchorId, plain }) => {
          const node = document.querySelector(`[data-lesson-section-anchor="${anchorId}"]`);
          return node !== null && node.innerText !== plain;
        }, { anchorId, plain });
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
        await focusedPage.waitForFunction(({ anchorId, plain }) => {
          const node = document.querySelector(`[data-lesson-section-anchor="${anchorId}"]`);
          return node !== null && node.innerText === plain;
        }, { anchorId, plain });
        assert.equal(await section.innerText(), plain, id + ': same paragraph after style toggle');
        const widths = await focusedPage.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        assert.ok(widths[0] <= widths[1] + 1, 'anchored view has no horizontal overflow: ' + widths);
        await button(`Вернуться к вопросу ${id}`, focusedPage).click();
        await focusedPage.getByRole('heading', { name: get(id).text, exact: true }).first().waitFor();
        await focusedPage.locator(`[data-explanation-question-id="${id}"]`).first().waitFor({ state: 'visible' });
        await button(mobile ? 'Тесты' : 'Тестирование', focusedPage).click();
        await button('Посмотреть разбор последней попытки', focusedPage).click();
      }
      assert.equal(await focusedPage.evaluate(() => localStorage.getItem('osi_user_progress_v4')),
        progressSnapshot, 'paragraph links do not modify saved progress');
      assert.equal(await focusedPage.evaluate(() => localStorage.getItem('osi_last_exam_review_v1')),
        originalReview, 'paragraph links do not overwrite the completed attempt');
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

#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewMaterialFixtures } from './review-material-fixtures.mjs';
// The preceding unit test bundles the real data and components for both test layers.
const { ALL_QUESTIONS, getLesson } = await import('./.cache/review-navigation-tests.mjs');
const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5428/my-gemini-mirror-site/';
const output = 'scripts/.cache/review-browser';
mkdirSync(output, { recursive: true });
const evidence = [];
let activePage;
const browser = await chromium.launch({
  ...(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {}),
});
try {
  for (const width of [375, 1440]) {
    for (const fixture of reviewMaterialFixtures) {
      const q = ALL_QUESTIONS.find(q => q.id === fixture.id);
      const wrongIndex = q.answers.findIndex((_, i) => !q.correct.includes(i));
      assert.ok(wrongIndex >= 0);
      const session = { questions: [q], mode: 'mixed', feedbackMode: 'instant', currentIndex: 0,
        isCompleted: false, startTime: Date.now() - 3000, attemptId: `matrix-${q.id}`,
        progressEpoch: 'matrix', submittedQuestions: {}, userAnswers: {} };
      const saved = JSON.stringify({version:1, session:{...session, isCompleted:true,
        attemptId:`historical-${q.id}`, feedbackMode:'exam',
        questions:[{...q, explanation:`Сохранённая версия: ${q.explanation}`}],
        submittedQuestions:{[q.id]:true}, userAnswers:{[q.id]:[wrongIndex]}}});
      const page = await browser.newPage({viewport:{width,height:900}, isMobile:width===375, hasTouch:width===375,
        ignoreHTTPSErrors:process.env.NETOPS_IGNORE_HTTPS_ERRORS === '1'});
      activePage = page;
      page.setDefaultTimeout(12000);
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(({session,saved}) => {
        sessionStorage.setItem('osi_study_text_mode_v1', 'professional');
        localStorage.setItem('osi_active_session', JSON.stringify(session));
        localStorage.setItem('osi_last_exam_review_v1', saved);
        localStorage.setItem('osi_user_progress_v4', JSON.stringify({version:4,epoch:'matrix',questions:{},receipts:{},dates:[],backup:{},migrationNotice:false}));
        localStorage.setItem('netops_mock_testing_settings', JSON.stringify({mode:'learn'}));
        localStorage.setItem('netops_mock_testing_active_v1', JSON.stringify({ids:[session.questions[0].id],index:0,answers:{},submitted:false}));
      }, {session,saved});
      const button = (name, root=page) => root.getByRole('button', {name,exact:typeof name==='string'});
      const home = () => button(width===375 ? 'Тесты' : 'Тестирование').click();
      const root = () => page.locator(`[data-explanation-question-id="${q.id}"]`);
      const openReviewCard = async () => {
        const card = page.locator('.review-question').filter({hasText:q.text});
        if (await card.getAttribute('open') === null) await card.locator(':scope > summary').click();
      };
      const verify = async surface => {
        const review = root();
        await review.waitFor();
        const brief = review.locator('[data-explanation-brief]');
        assert.match(await brief.innerText(), /Почему так/i);
        const before = await brief.innerText();
        const detail = review.locator('[data-explanation-detail]');
        if (await detail.count()) {
          if (await detail.evaluate(el => el.tagName) === 'DETAILS') {
            if (await detail.getAttribute('open') === null) await detail.locator('summary').click();
          } else if (await button('Подробный разбор', detail).getAttribute('aria-expanded') === 'false') {
            await button('Подробный разбор', detail).click();
          }
        }
        assert.equal(await review.getByRole('group',{name:'Стиль объяснения'}).count(), Number(fixture.professional), `${surface} ${q.id}: real styles`);
        if (fixture.professional) {
          await button('Простыми словами',review).click();
          const plain = await detail.innerText();
          await button('По делу',review).click();
          assert.notEqual(await detail.innerText(),plain, `${surface} ${q.id}: professional text changes`);
          assert.equal(await brief.innerText(),before, `${surface} ${q.id}: stable short answer`);
          assert.equal(await review.getByText('Профессиональный разбор пока не подготовлен',{exact:true}).count(),0);
          // Leave pro selected across navigation; missing-pro cards must still stay honest.
        } else {
          await review.getByText('Профессиональный разбор пока не подготовлен',{exact:true}).waitFor();
        }
        if (fixture.lessonId) {
          const lesson = getLesson(fixture.lessonId);
          const link = button(`Перейти к уроку: ${lesson.title}`,review);
          assert.equal(await link.isEnabled(),true);
          assert.equal(await review.getByText('Урок по этой теме пока не подготовлен',{exact:true}).count(),0);
        } else {
          assert.equal(await button(/^Перейти к уроку:/,review).count(),0);
          await review.getByText('Урок по этой теме пока не подготовлен',{exact:true}).waitFor();
        }
        const size = await page.evaluate(() => [document.documentElement.scrollWidth,document.documentElement.clientWidth]);
        assert.ok(size[0]<=size[1]+1,`${surface} ${q.id}: no page overflow ${size}`);
        const screenshot = `${surface}-${q.id}-${width}.png`;
        await review.screenshot({path:`${output}/${screenshot}`});
        let lessonScreenshot;
        if (fixture.lessonId) {
          const lesson = getLesson(fixture.lessonId);
          await button(`Перейти к уроку: ${lesson.title}`,review).click();
          await page.getByRole('heading',{name:lesson.title,exact:true}).waitFor();
          // Return label independently checks originating question, not only lesson title.
          await button(`Вернуться к вопросу ${q.id}`).waitFor();
          lessonScreenshot = `lesson-${surface}-${q.id}-${width}.png`;
          await page.screenshot({path:`${output}/${lessonScreenshot}`,fullPage:true});
        }
        evidence.push({surface,questionId:q.id,width,lessonId:fixture.lessonId,professional:fixture.professional,screenshot,lessonScreenshot});
      };
      const openTheory = async () => {
        if (fixture.lessonId) {
          await button(`Вернуться к вопросу ${q.id}`).click();
        } else {
          await button(width===375 ? 'Теория' : 'Теория и разборы').click();
          await page.getByPlaceholder('Поиск по тексту, теме, id...').fill(q.id);
          await button(new RegExp(`#${q.id} ·`)).click();
        }
      };
      const wrongAnswer = () => page.getByRole('button').filter({has:page.getByText(q.answers[wrongIndex],{exact:true})});
      const submitWrong = async () => {
        await wrongAnswer().click();
        await button('Подтвердить').click();
      };
      await page.goto(base);
      // Historical completed attempts are read-only even after styles and lesson navigation.
      await button('Посмотреть разбор последней попытки').click();
      await openReviewCard();
      await verify('last-attempt');
      assert.equal(await page.evaluate(() => localStorage.getItem('osi_last_exam_review_v1')),saved);
      await home();
      await button('Продолжить тестирование').click();
      await submitWrong();
      await verify('instant');
      assert.equal(await page.evaluate(() => localStorage.getItem('osi_last_exam_review_v1')),saved);
      await openTheory();
      await verify('theory');
      assert.equal(await page.evaluate(() => localStorage.getItem('osi_last_exam_review_v1')),saved);
      await home();
      await button('Продолжить тестирование').click();
      await button('Завершить').click();
      await openReviewCard();
      const completed = await page.evaluate(() => localStorage.getItem('osi_last_exam_review_v1'));
      await verify('final-result');
      assert.equal(await page.evaluate(() => localStorage.getItem('osi_last_exam_review_v1')),completed);
      await home();
      if (width===375) await page.getByRole('combobox', {name:/Выбери свой уровень/}).selectOption('mixed');
      else await button(/^Смешанный/).click();
      await button(/Работа над ошибками/).click();
      if (await button('Заменить попытку').isVisible()) await button('Заменить попытку').click();
      await submitWrong();
      await verify('mistakes');
      assert.equal(await page.evaluate(() => localStorage.getItem('osi_last_exam_review_v1')),completed);
      // Retired mock coverage lives in courses-prototypes.browser.mjs.
      assert.deepEqual(errors,[]);
      console.log(`PASS matrix ${width}px ${q.id}: five screens, stable brief, styles, exact lesson and immutable snapshots`);
      await page.close();
    }
  }
} catch (error) {
  if (activePage && !activePage.isClosed()) {
    await activePage.screenshot({path:`${output}/matrix-failure.png`,fullPage:true});
    console.error(await activePage.getByRole('button').allTextContents());
  }
  throw error;
} finally {
  writeFileSync(`${output}/matrix-evidence.json`,JSON.stringify(evidence,null,2)+'\n');
  await browser.close();
}
assert.equal(evidence.length, reviewMaterialFixtures.length*2*5);

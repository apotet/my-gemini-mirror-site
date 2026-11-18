#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync } from 'node:fs';
import { loadBankWithExplanations } from './load-bank.mjs';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const { ALL_QUESTIONS } = await loadBankWithExplanations();
const registry = JSON.parse(readFileSync(new URL('../src/data/questionLearningLevels.json', import.meta.url), 'utf8'));
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5428/my-gemini-mirror-site/';
const browser = await chromium.launch({
  ...(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {}),
});
const output = 'scripts/.cache/review-browser';
mkdirSync(output, { recursive: true });
const question = ALL_QUESTIONS.find(q => q.id === 'l3-02');
assert.equal(question?.difficulty, 'beginner');
assert.equal(registry[question.id].learningLevel, 3);
const issues = [];
try {
  for (const width of [375, 1440]) {
    for (const count of [5, 10, 30]) {
      const mobile = width === 375;
      const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile });
      page.setDefaultTimeout(15000);
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(base);
      await page.getByRole('button', { name: mobile ? 'Тесты' : 'Тестирование', exact: true }).click();
      await page.getByText(/Доступно по выбранной теме: 220/).waitFor();
      if (count !== 10) {
        await page.getByRole('button', { name: /^Вопросов в тесте:/ }).click();
        await page.getByRole('menuitemradio', { name: `${count} вопросов`, exact: true }).click();
      }
      if (count === 10) await page.screenshot({path:`${output}/base-L1-220-${width}.png`});
      await page.getByRole('button', { name: 'Начать тестирование', exact: true }).last().click();
      await page.waitForFunction((expected) => {
        const raw = localStorage.getItem('osi_active_session');
        if (!raw) return false;
        try { return JSON.parse(raw).questions?.length === expected; } catch { return false; }
      }, count);
      const snapshot = JSON.parse(await page.evaluate(() => localStorage.getItem('osi_active_session')));
      assert.equal(snapshot.difficulty, 'beginner');
      assert.equal(snapshot.questions.length, count);
      assert.ok(snapshot.questions.every(q => registry[q.id]?.learningLevel === 1),
        `Base ${width}/${count} has only L1`);
      assert.equal(new Set(snapshot.questions.map(q => q.id)).size, count, 'no repeated IDs');
      assert.deepEqual(errors, [], `browser errors on ${width}/${count}`);
      const sizes = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      assert.ok(sizes[0] <= sizes[1] + 1, `no horizontal overflow ${width}/${count}: ${sizes}`);
      await page.close();
    }

    // A pre-release Base session containing a now-excluded L3 item must not be re-sampled.
    const oldSession = {
      questions: [question], currentIndex: 0, userAnswers: {}, submittedQuestions: {},
      startTime: Date.now() - 5000, isCompleted: false, mode: 'mixed',
      feedbackMode: 'instant', difficulty: 'beginner', requestedCount: 1,
    };
    const page = await browser.newPage({viewport:{width,height:900},isMobile:width===375,hasTouch:width===375});
    page.setDefaultTimeout(15000);
    await page.addInitScript(raw => localStorage.setItem('osi_active_session', raw), JSON.stringify(oldSession));
    await page.goto(base);
    await page.getByRole('button', { name: width===375 ? 'Тесты' : 'Тестирование', exact: true }).click();
    await page.getByText(/Текущая попытка: База, 1 вопр/).waitFor();
    const saved = JSON.parse(await page.evaluate(() => localStorage.getItem('osi_active_session')));
    assert.deepEqual(saved.questions.map(q => q.id), [question.id], `legacy L3 Base remains in unfinished session ${width}`);
    assert.deepEqual(saved.questions[0].correct, question.correct, 'legacy answer key unchanged');
    await page.close();
  }
} catch (err) {
  issues.push(String(err.stack || err));
} finally {
  await browser.close();
}
if (issues.length) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS: 375/1440px Base UI=220, new 5/10/30 all-L1 sessions, saved legacy L3 resumes without resampling');
}

import assert from 'node:assert/strict';
const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5497/my-gemini-mirror-site/';
const browser = await chromium.launch({ ...(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {}), args: ['--disable-dev-shm-usage'] });
const courseKey = 'osi_netops_mirror_addressing_course_v1';
const legacyKey = 'osi_active_session';
const button = (root, name) => root.getByRole('button', { name, exact: typeof name === 'string' });
const course = p => p.getByRole('region', {name:'Курсы NetOps',exact:true});
const read = (p, key = courseKey) => p.evaluate(key => localStorage.getItem(key), key);
const stored = async p => JSON.parse(await read(p));
const heading = (p, name) => p.getByRole('heading', {name,exact:true});
const openCourse = async (p, mobile) => {
  if (mobile) await button(p, 'Открыть меню').click();
  await button(p, 'Курсы').click();
  await course(p).waitFor();
};
const gotoResult = async (p, score) => p.locator('[data-course-score]').filter({hasText:new RegExp('^'+score+' из 20')}).waitFor();
const assertNoOverflow = async p => assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
async function submitQuestion(p, expectedIndex, isRight) {
  const before = await stored(p);
  assert.equal(before.active.answers.length, expectedIndex);
  const q = before.active.questions[expectedIndex];
  const rendered = course(p).locator(`[data-course-question="${q.id}"]`);
  await rendered.waitFor();
  assert.equal(await rendered.getAttribute('data-course-question'), q.id);
  assert.equal(await rendered.locator('legend').textContent(), q.text);
  assert.deepEqual(await rendered.locator('label > span').allTextContents(), q.options);
  const answer = isRight ? q.correct[0] : (q.correct[0] + 1) % q.options.length;
  await rendered.getByRole('radio').nth(answer).check();
  await button(p, expectedIndex === 19 ? 'Завершить итог' : 'Сохранить ответ').click();
  await p.waitForFunction(({key,n}) => {
    const s = JSON.parse(localStorage.getItem(key));
    return n === 19 ? s.active === null && s.history.at(-1)?.answers.length === 20 : s.active?.answers.length === n + 1;
  }, {key:courseKey,n:expectedIndex});
}
try {
  for (const width of [375, 1440]) {
    const mobile = width === 375;
    const context = await browser.newContext({viewport:{width,height:mobile?667:900},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
    await context.route('**/*', r => new URL(r.request().url()).origin === new URL(base).origin ? r.continue() : r.abort());
    const p = await context.newPage();
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    p.setDefaultTimeout(10000);
    await p.goto(base);
    await button(p,'Начать тестирование').first().click();
    await p.getByText(/^Вопрос 1 из /).waitFor();
    const oldAttempt = await read(p,legacyKey);
    assert.ok(oldAttempt);
    assert.equal(await read(p), null);

    await openCourse(p,mobile);
    await heading(p,'IP-адресация').waitFor();
    assert.equal(new URL(p.url()).searchParams.get('course'),'addressing');
    await assertNoOverflow(p);
    assert.equal(await course(p).getByRole('region',{name:'Оглавление курса'}).getByRole('button').count(),4);
    if (mobile) assert.equal(await p.locator('nav.fixed.bottom-0 button').count(),5);
    await button(p,'Начать обучение').click();
    await course(p).getByText('Шаг 1 из 4',{exact:true}).waitFor();
    await button(p,'По делу').click();
    await button(p,'По делу').and(p.locator('[aria-pressed=true]')).waitFor();
    await p.reload();
    await course(p).getByText('Шаг 1 из 4',{exact:true}).waitFor();
    await button(p,'По делу').and(p.locator('[aria-pressed=true]')).waitFor();
    await button(p,'Отметить урок изученным').click();
    await button(p,'Урок изучен').waitFor();
    await button(p,'Следующий урок').click();
    await course(p).getByText('Шаг 2 из 4',{exact:true}).waitFor();
    await button(p,'Предыдущий урок').click();
    await course(p).getByText('Шаг 1 из 4',{exact:true}).waitFor();
    await button(p,'Следующий урок').click();
    await course(p).getByText('Шаг 2 из 4',{exact:true}).waitFor();
    await button(p,'Следующий урок').click();
    await course(p).getByText('Шаг 3 из 4',{exact:true}).waitFor();
    const openIpv4 = button(p,'Открыть тренажёр IPv4');
    await openIpv4.click();
    await heading(p,'Практика IPv4').waitFor();
    await p.getByText('192.168.60.191',{exact:true}).waitFor();
    await p.getByText('192.168.60.129 — 192.168.60.190',{exact:true}).waitFor();
    await p.reload();
    await p.getByText('192.168.60.191',{exact:true}).waitFor();
    await button(p,'Вернуться к уроку').click();
    await openIpv4.waitFor();
    assert.equal(await openIpv4.evaluate(el => document.activeElement === el),true);
    await button(p,'По делу').and(p.locator('[aria-pressed=true]')).waitFor();
    await button(p,'Следующий урок').click();
    await course(p).getByText('Шаг 4 из 4',{exact:true}).waitFor();
    for (const [verb, wrong, right, prefix, stateName] of [
      ['Сжать','2001::42','2001:db8::42','Запиши адрес','compress'],
      ['Развернуть','2001:db8:1234::2','2001:0db8:1234:0000:0000:0000:0000:0001','Разверни до восьми групп','expand'],
    ]){
      await button(p,verb+' IPv6').click();
      await p.getByText(new RegExp('^'+prefix)).waitFor();
      assert.equal(await p.getByText(right,{exact:true}).count(),0,'training hint must not expose answer before input');
      assert.equal((await stored(p)).ipv6[stateName], false);
      const input = p.getByRole('textbox',{name:'Ответ IPv6'});
      await input.fill(wrong);
      await button(p,'Проверить').click();
      await p.getByText('Не совсем',{exact:true}).waitFor();
      assert.equal((await stored(p)).ipv6[stateName], false);
      await button(p,'Попробовать снова').click();
      await input.fill(right);
      await button(p,'Проверить').click();
      await p.getByText('Верно',{exact:true}).waitFor();
      assert.equal((await stored(p)).ipv6[stateName], true);
      await button(p,'Вернуться к уроку').click();
      const marked = button(p,verb+' IPv6 · Верно');
      await marked.waitFor();
      assert.equal(await marked.evaluate(el => document.activeElement === el),true);
      if(stateName==='compress'){
        await p.reload();
        await course(p).getByText('Шаг 4 из 4',{exact:true}).waitFor();
        assert.deepEqual((await stored(p)).ipv6,{compress:true,expand:false});
      }
    }
    await button(p,'К оглавлению курса').click();
    await heading(p,'IP-адресация').waitFor();
    await course(p).getByText('Проверена',{exact:true}).waitFor();
    await button(p,'Начать итог').click();
    await heading(p,'Итоговый тест').waitFor();
    const first = (await stored(p)).active;
    let wrong = new Set(['review-ndp-3','gen-bc-25-2', ...first.questions.filter(x=>!['review-ndp-3','gen-bc-25-2'].includes(x.id)).slice(0,3).map(x=>x.id)]);
    for(let n=0;n<20;n++){
      if(n===1) await context.setOffline(true);
      await submitQuestion(p,n,!wrong.has(first.questions[n].id));
      if(n===1) await context.setOffline(false);
      if(n===6){
        await p.reload();
        await course(p).getByText('Вопрос 8 из 20',{exact:true}).waitFor();
        assert.deepEqual((await stored(p)).active.questions,first.questions);
      }
    }
    await gotoResult(p,15);
    const failed = (await stored(p)).history[0];
    await button(p.locator('[data-course-error="review-ndp-3"]'),/^К разделу урока/).click();
    const dad = p.locator('[data-lesson-section-anchor="ipv6-dad-tentative-na-duplicate"]');
    await dad.waitFor();
    await p.waitForFunction(() => document.activeElement?.getAttribute('data-lesson-section-anchor')==='ipv6-dad-tentative-na-duplicate');
    await p.reload();
    await dad.waitFor();
    await button(p,'Вернуться к разбору ошибок').first().click();
    await gotoResult(p,15);
    assert.equal(await p.locator('[data-course-focus="error-review-ndp-3"]').evaluate(el=>document.activeElement===el),true);
    await button(p,'Новая попытка').click();
    await heading(p,'Итоговый тест').waitFor();
    for(let n=0;n<20;n++) await submitQuestion(p,n,n<16);
    await gotoResult(p,16);
    await p.reload();
    await gotoResult(p,16);
    assert.deepEqual((await stored(p)).history[0],failed);
    assert.deepEqual((await stored(p)).ipv6,{compress:true,expand:true});
    assert.equal((await stored(p)).history.at(-1).answers.length,20);
    assert.equal((await stored(p)).studied.length,1);
    await button(p,'К оглавлению курса').click();
    await course(p).getByText('Нет · 1/4 урока',{exact:true}).waitFor();
    await course(p).getByText('Да',{exact:true}).waitFor();
    await assertNoOverflow(p);
    assert.equal(await read(p,legacyKey),oldAttempt);
    await button(p,mobile?'Тесты':'Тестирование').click();
    await course(p).waitFor({state:'hidden'});
    assert.equal(new URL(p.url()).searchParams.has('course'),false);
    await button(p,'Продолжить тестирование').click();
    await p.getByText(/^Вопрос 1 из /).waitFor();
    const restored=JSON.parse(await read(p,legacyKey));
    assert.deepEqual(restored,{...JSON.parse(oldAttempt),legacySubmittedIds:[]},'ordinary restore adds only its already-existing empty compatibility field');
    await button(p,mobile?'IPv6':'IPv6 Тренажёр').click();
    await p.getByText('Задание 1 из 10',{exact:true}).waitFor();
    await p.getByRole('button',{name:'Сжать',exact:true}).waitFor();
    for(let n=1;n<=10;n++){
      await p.getByText(`Задание ${n} из 10`,{exact:true}).waitFor();
      await p.getByPlaceholder('введи ответ').fill('::');
      await button(p,'Проверить').click();
      await p.getByText('Не совсем',{exact:true}).waitFor();
      await button(p,'Дальше').click();
    }
    await p.getByText('Подход завершён',{exact:true}).waitFor();
    await button(p,'Ещё 10').waitFor();
    assert.equal((await stored(p)).history.length,2);
    assert.deepEqual(errors,[]);
    console.log(width,'PASS navbar, old attempt isolation, 4 lessons & mode, F5, IPv4/IPv6 feedback & return, snapshots, 15 fail/16 pass, anchored review, study independent');
    await context.close();
  }

  const context = await browser.newContext({viewport:{width:375,height:667}, isMobile:true, hasTouch:true});
  await context.route('**/*', r => new URL(r.request().url()).origin === new URL(base).origin ? r.continue() : r.abort());
  const p = await context.newPage();
  await p.addInitScript(k => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === k && window.denyCourse) throw new DOMException('mock', 'QuotaExceededError');
      return write.call(this,key,value);
    };
  },courseKey);
  await p.goto(base+'?course=addressing');
  await heading(p,'IP-адресация').waitFor();
  await p.evaluate(() => window.denyCourse = true);
  await button(p,'Начать итог').click();
  await p.getByRole('alert').filter({hasText:'не дал сохранить'}).waitFor();
  assert.equal(await read(p),null);
  await p.evaluate(() => window.denyCourse = false);
  await button(p,'Начать итог').click();
  await heading(p,'Итоговый тест').waitFor();
  const attempt = await read(p);
  await p.evaluate(() => window.denyCourse = true);
  await p.getByRole('radio').first().check();
  await button(p,'Сохранить ответ').click();
  await p.getByRole('alert').filter({hasText:'не дал сохранить'}).waitFor();
  assert.equal(await read(p),attempt);
  await p.reload();
  await course(p).getByText('Вопрос 1 из 20',{exact:true}).waitFor();
  await p.evaluate(k => localStorage.setItem(k,'{wrong'),courseKey);
  await p.reload();
  await p.getByRole('alert').filter({hasText:'не удалось прочитать'}).waitFor();
  assert.equal(await read(p),'{wrong');
  assert.equal(await button(p,'Начать итог').isDisabled(),true);
  console.log('PASS direct URL, storage write denial, recovery after reload, invalid payload preserved');
  await context.close();

  const concurrent = await browser.newContext();
  await concurrent.route('**/*', r => new URL(r.request().url()).origin === new URL(base).origin ? r.continue() : r.abort());
  const a = await concurrent.newPage();
  const b = await concurrent.newPage();
  await a.goto(base+'?course=addressing');
  await button(a,'Начать итог').click();
  await heading(a,'Итоговый тест').waitFor();
  await b.goto(base+'?course=addressing');
  await heading(b,'Итоговый тест').waitFor();
  await a.getByRole('radio').nth(0).check();
  await b.getByRole('radio').nth(1).check();
  await a.evaluate(k => {
    void navigator.locks.request(k, () => new Promise(resolve => { window.releaseCourseLock = resolve; }));
  }, courseKey);
  await a.waitForFunction(() => !!window.releaseCourseLock);
  await Promise.all([button(a,'Сохранить ответ').click(),button(b,'Сохранить ответ').click()]);
  assert.deepEqual((await stored(a)).active.answers,[]);
  await a.evaluate(() => window.releaseCourseLock());
  for (const p of [a,b]) await course(p).getByText('Вопрос 2 из 20',{exact:true}).waitFor();
  assert.equal((await stored(a)).active.answers.length,1);
  assert.ok([0,1].includes((await stored(a)).active.answers[0]));
  assert.equal(await read(a),await read(b));
  console.log('PASS simultaneous same-course writes: one stale answer rejected, both views show one recorded answer');
  await concurrent.close();
} finally {
  await browser.close();
}

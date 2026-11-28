import assert from 'node:assert/strict';
const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5497/my-gemini-mirror-site/';
const browser = await chromium.launch({ ...(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {}), args: ['--disable-dev-shm-usage'] });
const key = 'osi_netops_mirror_addressing_course_v1';
const legacyKey = 'osi_active_session';
const warn = p => p.locator('[data-course-lock-warning]');
const button = (p, name) => p.getByRole('button', { name, exact: typeof name === 'string' });
const read = (p, k = key) => p.evaluate(k => localStorage.getItem(k), k);
async function makeContext() {
  const ctx = await browser.newContext({ viewport:{width:1440,height:900}, reducedMotion:'reduce' });
  await ctx.route('**/*', r => new URL(r.request().url()).origin === new URL(base).origin ? r.continue() : r.abort());
  return ctx;
}
async function instrument(ctx, fault) {
  await ctx.addInitScript(({key,fault}) => {
    const native = Storage.prototype.setItem;
    window.courseWrites = 0;
    window.courseLockRequests = 0;
    Storage.prototype.setItem = function(k, value) {
      if (k === key) window.courseWrites++;
      return native.call(this, k, value);
    };
    Object.defineProperty(Navigator.prototype,'locks',{
      configurable:true,
      get() {
        if (fault === 'missing') return undefined;
        if (fault === 'getter') throw new DOMException('test lock getter','SecurityError');
        return {request() {
          window.courseLockRequests++;
          const error = new DOMException('test lock refusal','SecurityError');
          if (fault === 'throw') throw error;
          return Promise.reject(error);
        }};
      },
    });
  },{key,fault});
}
try {
  for (const fault of ['missing','getter']) {
    const ctx=await makeContext();
    const a=await ctx.newPage();
    await a.goto(base);
    await button(a,'Начать тестирование').first().click();
    await a.getByText(/^Вопрос 1 из /).waitFor();
    const legacy=await read(a,legacyKey);
    await button(a,'Курсы').click();
    await button(a,'Начать итог').click();
    await a.getByText('Вопрос 1 из 20',{exact:true}).waitFor();
    const saved=await read(a);
    assert.deepEqual(JSON.parse(saved).active.answers,[]);

    await instrument(ctx,fault);
    const b=await ctx.newPage();
    await Promise.all([a.reload(), b.goto(base+'?course=addressing')]);
    for(const p of [a,b]){
      await warn(p).waitFor();
      assert.match(await warn(p).textContent(),/только для просмотра/);
      await p.getByText('Вопрос 1 из 20',{exact:true}).waitFor();
      assert.equal(await p.getByRole('radio').first().isDisabled(),true);
      assert.equal(await button(p,'Сохранить ответ').isDisabled(),true);
      await button(p,'К оглавлению курса').click();
      await button(p,'Продолжить итог').waitFor();
      await button(p,/^1\./).click();
      await button(p,'Отметить урок изученным').waitFor();
      assert.equal(await button(p,'Отметить урок изученным').isDisabled(),true);
      assert.equal(await warn(p).isVisible(),true);
    }
    for(const p of [a,b]){
      assert.equal(await read(p),saved);
      assert.equal(await read(p,legacyKey),legacy);
      assert.equal(await p.evaluate(()=>window.courseWrites),0);
    }
    await button(a,'Тестирование').click();
    await button(a,'Продолжить тестирование').click();
    await a.getByText(/^Вопрос 1 из /).waitFor();
    assert.deepEqual(JSON.parse(await read(a,legacyKey)),{...JSON.parse(legacy),legacySubmittedIds:[]});
    assert.equal(await read(a),saved);
    console.log(fault,'PASS two live tabs read saved course/ordinary attempt, no course writes or credits; preview still opens');
    await ctx.close();
  }

  for (const fault of ['reject','throw']) {
    const ctx=await makeContext();
    const p=await ctx.newPage();
    await p.goto(base+'?course=addressing');
    await button(p,/^4\./).click();
    await button(p,'Сжать IPv6').click();
    await p.getByRole('heading',{name:'Сжатая запись IPv6'}).first().waitFor();
    const saved=await read(p);
    assert.equal(JSON.parse(saved).ipv6.compress,false);

    await instrument(ctx,fault);
    await p.reload();
    const input=p.getByRole('textbox',{name:'Ответ IPv6'});
    await input.fill('2001:db8::42');
    await button(p,'Проверить').click();
    await warn(p).waitFor();
    assert.equal(await p.getByText('Верно',{exact:true}).count(),0);
    assert.equal(await button(p,'Проверить').isDisabled(),true);
    assert.equal(await p.getByRole('alert').filter({hasText:'не дал сохранить'}).count(),0);
    await button(p,'Вернуться к уроку').click();
    await button(p,'Сжать IPv6').waitFor();
    assert.equal(await warn(p).isVisible(),true);
    await button(p,'К оглавлению курса').click();
    assert.equal(await button(p,'Начать итог').isDisabled(),true);
    await button(p,'Тестирование').click();
    await button(p,'Курсы').click();
    await warn(p).waitFor();
    assert.equal(await read(p),saved);
    assert.deepEqual(await p.evaluate(()=>[window.courseLockRequests,window.courseWrites]),[1,0]);
    console.log(fault,'PASS real correct IPv6 answer not credited after lock failure; permanent visible read-only notice, no writes or false quota error');
    await ctx.close();
  }
} finally { await browser.close(); }

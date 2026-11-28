import assert from 'node:assert/strict';
const {chromium} = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://localhost:3000/my-gemini-mirror-site/';
const browser = await chromium.launch({executablePath:process.env.NETOPS_CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const button=(p,name)=>p.getByRole('button',{name,exact:true});
const errors=[];
try {
  const p=await browser.newPage({viewport:{width:1440,height:1000}});
  p.setDefaultTimeout(10000);
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base);
  const before=await p.evaluate(()=>{localStorage.setItem('osi_netops_mirror_addressing_course_v1','{"sentinel":true}');return {...localStorage};});
  await button(p,'Макет Курсы').click();
  assert.equal(new URL(p.url()).searchParams.get('mock'),'courses');
  assert.equal(await button(p,'Макет тестирования').count(),0);
  const f=p.frameLocator('iframe');
  await f.getByRole('navigation',{name:'Выбор дизайн-концепции'}).waitFor();
  const parentTheme=await p.locator('html').getAttribute('class');
  const screens=f.getByRole('navigation',{name:'Экраны прототипа'});
  for (const concept of [/Студия/,/Инженерная академия/,/Интерактивный учебник/]) {
    console.log('Checking',String(concept));
    await f.getByRole('navigation',{name:'Выбор дизайн-концепции'}).getByRole('button',{name:concept}).click();
    for (const theme of ['light','dark']) {
      const dark=await f.locator('html').evaluate(e=>e.classList.contains('dark'));
      if(dark!==(theme==='dark')) await f.getByRole('button',{name:/Включить .* тему/}).click();
      assert.equal(await p.locator('html').getAttribute('class'),parentTheme);
      for(const profile of ['Новичок 0%','В процессе 60%']) {
        await button(f,profile).click();
        for(const screen of ['Каталог','Курс IP','Урок','Тест']) {
          await button(screens,screen).click();
          assert.ok((await f.locator('main').first().innerText()).length>100);
          assert.ok(await f.locator('html').evaluate(e=>e.scrollWidth<=innerWidth+1));
        }
      }
    }
    for(const result of ['Сдан · 85%','Не сдан · 65%','Интерактивный тест']) await f.getByRole('tab',{name:result,exact:true}).click();
    const answers=f.getByRole('button').filter({hasText:/^A/});
    for(let i=0;i<await answers.count();i++) await answers.nth(i).click();
    await button(f,'Завершить и показать результат').click();
    await f.getByRole('tab',{name:'Интерактивный тест',exact:true}).click();
    await button(screens,'Каталог').click();
    await button(screens,'Курс IP').click();
    const images=f.locator('img');await images.first().waitFor();
    assert.ok(await images.evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)));
    await f.getByTitle('Мобильная версия 390px').click();
    assert.ok(await f.locator('html').evaluate(e=>e.scrollWidth<=innerWidth+1));
    await f.getByTitle('Компьютерная версия').click();
  }
  await f.getByRole('navigation',{name:'Выбор дизайн-концепции'}).getByRole('button',{name:/Студия/}).click();
  await button(screens,'Курс IP').click();
  await f.getByRole('button',{name:/Тренажёр IPv4 · Маски и подсети/}).click();
  assert.ok((await f.locator('body').innerText()).includes('Вернуться'));
  const zip=await p.request.get(new URL('netops-courses-prototypes.zip',base).href);assert.equal(zip.status(),200);assert.equal((await zip.body()).length,2145339);
  const after=await p.evaluate(()=>({...localStorage}));
  for(const [k,v] of Object.entries(before)) assert.equal(after[k],v,`unchanged storage ${k}`);
  await button(p,'Тестирование').click();assert.equal(new URL(p.url()).searchParams.get('mock'),null);
  await button(p,'Курсы').click();await p.getByRole('region',{name:'Курсы NetOps',exact:true}).waitFor();
  for(const width of [390,768]) {
    await p.setViewportSize({width,height:844});await p.goto(base+'?mock=courses');
    await button(f,'Параметры прототипа').waitFor();
    for(const concept of ['Студия','Академия','Учебник']) {
      await button(f,concept).click();
      for(const screen of ['Каталог','Курс IP','Урок','Тест']) {
        await button(f,'Параметры прототипа').click();
        await button(f,screen).click();
        assert.ok(await f.locator('html').evaluate(e=>e.scrollWidth<=innerWidth+1));
      }
      await button(f,'Сменить тему').click();
    }
  }
  assert.deepEqual(errors,[]);console.log('PASS: 3 concepts × 4 screens × 2 profiles × 2 themes; 390px and tablet; exam answers/results; resource bridge; original images/ZIP; main navigation, theme and storage isolation');
} finally { await browser.close(); }

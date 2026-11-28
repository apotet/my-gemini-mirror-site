import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({entryPoints:['src/courses-prototypes/data/academyTopologyData.ts'],bundle:true,platform:'node',format:'esm',outfile:'scripts/.cache/academy-browser-data.mjs'});
const {ACADEMY_NODES:nodes,CAREER_ROLES:roles}=await import('./.cache/academy-browser-data.mjs');
const {chromium}=await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.NETOPS_BASE_URL || 'http://localhost:3000/my-gemini-mirror-site/';
const browser=await chromium.launch({executablePath:process.env.NETOPS_CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const btn=(p,name)=>p.getByRole('button',{name,exact:true});
const errors=[];
try {
  for(const width of [1440,390]) {
    const p=await browser.newPage({viewport:{width,height:1000}});p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
    await p.goto(base+'?mock=courses&v=academy-18-directions');
    const f=p.frameLocator('iframe');
    const title=f.getByRole('heading',{name:'Топология компетенций и профессиональной эволюции',exact:true});await title.waitFor();
    await f.getByRole('note').filter({hasText:'демонстрационные данные'}).waitFor();
    const before=await p.evaluate(()=>({...localStorage}));
    const outerTheme=await p.locator('html').getAttribute('class');
    const selector=f.getByRole('region',{name:'Выбор персонального пути по роли'});
    const map=f.getByRole('img',{name:'Интерактивная топология компетенций NetOps Academy и развилка профессий'});
    const screen=async name=>{if(width<1024)await btn(f,'Параметры прототипа').click();await f.locator('header').first().getByRole('button',{name,exact:true}).click();};
    const profile=async active=>{if(width<1024)await btn(f,'Параметры прототипа').click();await btn(f,width<1024?(active?'В процессе · 60%':'Новичок · 0%'):(active?'В процессе 60%':'Новичок 0%')).click();};
    for(const dark of [false,true]) {
      const current=await f.locator('html').evaluate(e=>e.classList.contains('dark'));
      if(current!==dark)await f.locator('header').first().getByRole('button',{name:width<1024?'Сменить тему':dark?'Включить тёмную тему':'Включить светлую тему',exact:true}).click();
      assert.equal(await p.locator('html').getAttribute('class'),outerTheme);
      assert.equal(await selector.getByRole('button').count(),9);
      if(width>=1024) {
        for(const n of nodes)assert.equal(await map.getByText(n.shortTitle,{exact:true}).count(),1,`SVG node ${n.id}`);
        for(const role of roles)assert.equal(await map.getByText(role.title,{exact:true}).count(),1);
      }
      for(const role of roles) {
        await selector.getByRole('button',{name:new RegExp('^'+(width<1024?role.shortTitle:role.title).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).click();
        if(width>=1024) {
          assert.ok((await f.locator('body').innerText()).includes(`Подсвечены ${role.criticalNodeIds.length} критичных узлов`));
          assert.ok(await map.locator('g').evaluateAll(gs=>gs.some(g=>g.style.opacity==='0.2')));
          assert.ok(await map.locator('path').evaluateAll(ps=>ps.some(p=>Number(p.style.opacity)<0.2)));
          const beforeSupporting=await map.locator('g').evaluateAll(gs=>gs.filter(g=>g.style.opacity==='0.62').length);
          await btn(f,'+ Смежные навыки').click();
          assert.ok(await map.locator('g').evaluateAll((gs,before)=>gs.filter(g=>g.style.opacity==='0.62').length>=before,beforeSupporting));
          await btn(f,'Смежные показаны').click();
        } else {
          const visibleCodes=async()=>{let count=0;for(const n of nodes)count+=await f.getByRole('button').filter({has:f.getByText(n.code,{exact:true})}).count();return count;};
          assert.equal(await visibleCodes(),18);
          await btn(f,'Только мой путь').click();assert.equal(await visibleCodes(),role.criticalNodeIds.length);
          await btn(f,'Показать все').click();assert.equal(await visibleCodes(),18);
        }
        await btn(f,'Сбросить').click();
      }
      if(width>=1024) {
        await map.getByText('BGP и WAN',{exact:true}).click();await f.getByRole('heading',{name:'BGP, WAN и резервирование',exact:true}).waitFor();
        const initial=await map.getAttribute('viewBox');await btn(f,'Развилка профессий').click();assert.notEqual(await map.getAttribute('viewBox'),initial);await btn(f,'Вся экосистема').click();
        await btn(f,'Увеличить карту').click();assert.ok((await f.locator('body').innerText()).includes('115%'));await btn(f,'Уменьшить карту').click();
      }
      assert.ok(await f.locator('html').evaluate(e=>e.scrollWidth<=innerWidth+1));
      await profile(false);
      if(width>=1024)await map.getByText('NET-05 · Не начато',{exact:true}).waitFor();
      await screen('Тест');
      const answers=f.getByRole('button').filter({hasText:/^[ABCD]/}).filter({hasNot:f.locator('header button')});
      // The source mini-exam has five questions and four answer buttons per question.
      const choices=f.locator('button').filter({hasText:/^[ABCD](?:255|Адрес|Клиент|Интерфейс|Шлюз|\/|192|Через|Из|Только)/});
      assert.equal(await choices.count(),20);
      for(const [q,index] of [0,1,1,0,1].entries())await choices.nth(q*4+index).click();
      await btn(f,'Завершить и показать результат').click();
      await screen('Каталог');
      if(width>=1024)await map.getByText('NET-05 · Подтверждено',{exact:true}).waitFor();
      for(const role of roles){const b=selector.getByRole('button',{name:new RegExp('^'+(width<1024?role.shortTitle:role.title).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))});assert.ok((await b.innerText()).includes('1/'+role.criticalNodeIds.length));}
      await profile(true);
    }
    const after=await p.evaluate(()=>({...localStorage}));for(const [k,v] of Object.entries(before))if(k!=='netops_courses_theme')assert.equal(after[k],v);
    assert.deepEqual(Object.keys(after).filter(k=>k!=='netops_courses_theme').sort(),Object.keys(before).filter(k=>k!=='netops_courses_theme').sort());
    if(process.env.NETOPS_SCREENSHOT_DIR){await f.locator('html').evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:`${process.env.NETOPS_SCREENSHOT_DIR}/academy-expanded-${width}.png`});}
    await p.close();console.log(`PASS ${width}px × light/dark: academy default; 18 nodes/8 roles; personal routes; highlights; scope/zoom or only-my-path; demo labels; verified competence transfer after interactive exam; NetOps isolation`);
  }
  assert.deepEqual(errors,[]);
} finally {await browser.close();}

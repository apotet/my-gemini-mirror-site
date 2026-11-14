#!/usr/bin/env node
// Optional browser regression: see docs/cli-lab/FULLSCREEN.md for setup.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.CLI_PLAYWRIGHT_MODULE || 'playwright');
const output=process.env.CLI_ARTIFACT_DIR || '/tmp/netops-fullscreen';
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],
  ...(process.env.CLI_CHROMIUM_PATH?{executablePath:process.env.CLI_CHROMIUM_PATH}:{})});
const base=process.env.CLI_BASE_URL || 'http://127.0.0.1:5416/my-gemini-mirror-site/';
const results=[];
try{
for(const mobile of [false,true]){
 const name=mobile?'mobile':'desktop', viewport=mobile?{width:375,height:812}:{width:1440,height:900};
 const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 const save=async suffix=>page.screenshot({path:path.join(output,`${name}-${suffix}.png`)});
 try{
 await page.goto(base);await page.getByRole('button',{name:'Практика',exact:true}).click();
 await page.getByRole('button',{name:/CLI Lab 2.0 Cisco IOS/}).click();
 await page.getByRole('button',{name:/^Прикладной/}).click();
 await page.getByRole('button',{name:'С нуля: два Cisco, VLAN и IP управления',exact:true}).click();
 const root=page.locator('[data-cli-shell]'),input=root.locator('input[placeholder^="command"]');
 const form=root.getByRole('form',{name:'Командная строка CLI'}),history=root.getByLabel('История CLI',{exact:true});
 const task=root.getByRole('region',{name:'Задание CLI',exact:true}),topo=root.getByRole('region',{name:'Схема сети',exact:true});
 const send=async line=>{const n=await history.evaluate(el=>el.children.length);await input.fill(line);await input.press('Enter');return history.evaluate((el,n)=>Array.from(el.children).slice(n).map(x=>x.textContent).join('\n'),n);};
 for(const line of ['en','conf t','hostname EDGE-SW1','end','write memory'])await send(line);
 await topo.getByRole('button',{name:'Показать схему',exact:true}).click();
 const host=topo.getByRole('button',{name:/^Компьютер PC1,/});await host.focus();await host.press('Enter');
 const pc=topo.getByRole('region',{name:'Учебный ping PC1',exact:true});await pc.getByRole('textbox').fill('ping 192.168.10.12');await pc.getByRole('button',{name:'Выполнить ping'}).click();
 const pcResult=await pc.getByRole('status').innerText();
 await input.fill('show running-config');
 const beforeHistory=await history.innerText();
 await input.evaluate(el=>window.__fullscreenInput=el);
 const svg=topo.getByRole('img',{name:'Интерактивная сетевая топология'});
 await svg.evaluate(el=>window.__fullscreenSvg=el);
 const fullButton=root.getByRole('button',{name:'Полный экран',exact:true});await fullButton.scrollIntoViewIfNeeded();
 const originalScroll=await page.evaluate(()=>({x:scrollX,y:scrollY}));
 const originalOverflow=await page.evaluate(()=>document.body.style.overflow);
 await fullButton.click();await page.waitForFunction(()=>document.querySelector('[data-cli-shell]')?.dataset.cliShell==='fullscreen');
 const toolbar=root.getByRole('toolbar',{name:'Полноэкранный CLI'});
 const box=async locator=>locator.boundingBox();
 const geometry=async panel=>{
   const r=await box(root),t=await box(root.locator('.cli-fullscreen-terminal')),f=await box(form),bar=await box(toolbar);
   const v=page.viewportSize();assert.ok(Math.abs(r.x)<1&&Math.abs(r.y)<1);assert.ok(Math.abs(r.width-v.width)<1&&Math.abs(r.height-v.height)<1);
   assert.ok(Math.abs(f.y+f.height-(r.y+r.height))<=12,'input pinned to bottom');assert.ok(t.y>=bar.y+bar.height,'toolbar separate from terminal');
   if(panel){const p=await box(panel);assert.ok(p.x>=t.x+t.width-1,'panel never overlays terminal');assert.ok(p.width<r.width*.6);assert.ok(t.width>v.width*.4);}
   assert.deepEqual(await page.evaluate(()=>({x:scrollX,y:scrollY})),originalScroll,'no document scroll');
   return {root:r,terminal:t,input:f,toolbar:bar};
 };
 const closed=await geometry();assert.equal(await input.inputValue(),'show running-config');assert.equal(await history.innerText(),beforeHistory);
 assert.equal(await input.evaluate(el=>el===window.__fullscreenInput),true);
 await save('closed');await toolbar.getByRole('button',{name:'Показать задание',exact:true}).click();const taskGeometry=await geometry(task);
 assert.equal(await task.getByRole('button',{name:'Сброс',exact:true}).count(),1);
 await task.getByRole('button',{name:'Команды Cisco',exact:true}).click();
 await task.getByRole('searchbox',{name:'Поиск команды'}).fill('vlan');
 await toolbar.getByRole('button',{name:'Схема',exact:true}).click();
 await toolbar.getByRole('button',{name:'Показать задание',exact:true}).click();
 assert.equal(await task.getByRole('searchbox',{name:'Поиск команды'}).inputValue(),'vlan');
 await task.getByRole('button',{name:'Скрыть команды',exact:true}).click();
 assert.equal(await input.inputValue(),'show running-config');
 await task.getByText('Шаг 1 / 6',{exact:true}).scrollIntoViewIfNeeded();await task.getByRole('button',{name:'Подсказка',exact:true}).click();
 await task.getByRole('button',{name:'Скрыть подсказку',exact:true}).scrollIntoViewIfNeeded();
 await save('task');await toolbar.getByRole('button',{name:'Схема',exact:true}).click();await geometry(topo);
 assert.equal(await svg.evaluate(el=>el===window.__fullscreenSvg),true,'one persistent SVG across fullscreen/panel switches');
 assert.equal(await pc.getByRole('textbox').inputValue(),'ping 192.168.10.12');assert.equal(await pc.getByRole('status').innerText(),pcResult);
 const canvas=topo.locator('[data-topology-scroll]');await canvas.evaluate(el=>el.scrollLeft=120);
 const canvasScroll=await canvas.evaluate(el=>el.scrollLeft);assert.ok(canvasScroll>0,'horizontal diagram scroll is available');
 await toolbar.getByRole('button',{name:'Показать задание',exact:true}).click();assert.equal(await task.getByRole('button',{name:'Скрыть подсказку',exact:true}).count(),1);
 await toolbar.getByRole('button',{name:'Схема',exact:true}).click();assert.equal(await canvas.evaluate(el=>el.scrollLeft),canvasScroll,'diagram scroll retained');
 await topo.getByRole('button',{name:'Скрыть',exact:true}).click();assert.ok((await geometry()).terminal.width>taskGeometry.terminal.width+100);
 assert.equal(await toolbar.getByRole('button',{name:'Схема',exact:true}).evaluate(el=>document.activeElement===el),true);
 // Work while tasks stay open; real commands advance Learn, not panel toggles.
 await toolbar.getByRole('button',{name:'Показать задание',exact:true}).click();
 for(const line of ['conf t','int fa0/1','sw mo a','sw acc vl 10','no sh','ex','int fa0/24','sw mo tr','sw tr al vl 10','no sh','end'])await send(line);
 await task.getByText('Шаг 2 / 6',{exact:true}).scrollIntoViewIfNeeded();await geometry(task);
 const read=task.getByRole('button',{name:/^Читать:/}).first();await read.click();
 await root.getByRole('button',{name:'Вернуться в CLI',exact:true}).click();await geometry(task);
 const config=await send('show running-config');assert.match(config,/hostname EDGE-SW1/);assert.match(config,/switchport access vlan 10/);
 await send('write memory');const startup=await send('show startup-config');assert.match(startup,/hostname EDGE-SW1/);
 await toolbar.getByRole('button',{name:'SW2',exact:true}).click();await send('en');assert.match(await send('show running-config'),/hostname SW2/);
 await toolbar.getByRole('button',{name:'EDGE-SW1',exact:true}).click();assert.match(await send('show running-config'),/switchport access vlan 10/);
 await send('reload');await send('en');assert.match(await send('show running-config'),/hostname EDGE-SW1/);
 for(let i=0;i<18;i++)await send('show vlan brief');
 const historyScroll=await history.evaluate(el=>({client:el.clientHeight,scroll:el.scrollHeight,top:el.scrollTop}));assert.ok(historyScroll.scroll>historyScroll.client);assert.ok(historyScroll.top>0);
 await history.evaluate(el=>el.scrollTop=0);const fixedY=(await box(form)).y;await history.evaluate(el=>el.scrollTop=el.scrollHeight);assert.equal((await box(form)).y,fixedY);
 await geometry(task);
 if(mobile){await page.setViewportSize({width:375,height:480});await page.waitForFunction(()=>Math.abs(document.querySelector('[data-cli-shell]').getBoundingClientRect().height-innerHeight)<1);await geometry(task);await save('short-viewport');await page.setViewportSize(viewport);}
 // Esc and button exits; both retain input/history/config and the old page position.
 await input.fill('show running-config');const text=await history.innerText();
 await task.getByRole('button',{name:/^Читать:/}).first().click();await page.keyboard.press('Escape');
 await page.waitForFunction(()=>document.querySelector('[data-cli-shell]')?.dataset.cliShell==='windowed');
 assert.equal(await input.inputValue(),'show running-config');assert.equal(await history.innerText(),text);
 assert.equal(await page.getByRole('dialog',{name:/^Теория:/}).count(),0);
 assert.equal(await svg.evaluate(el=>el===window.__fullscreenSvg),true,'same topology after exit');
 assert.deepEqual(await page.evaluate(()=>({x:scrollX,y:scrollY})),originalScroll);assert.equal(await page.evaluate(()=>document.body.style.overflow),originalOverflow);
 await fullButton.click();await toolbar.getByRole('button',{name:'Выход',exact:true}).click();assert.equal(await root.getAttribute('data-cli-shell'),'windowed');
 assert.equal(await input.inputValue(),'show running-config');
 // Larger ring: complete natural-size SVG bounds and labels are reachable by scrolling.
 await root.getByRole('button',{name:/^Продвинутый/}).click();await root.getByRole('button',{name:'Кольцо: 4 Cisco, 8 ПК, VLAN 10/20 и STP',exact:true}).click();
 await fullButton.click();await toolbar.getByRole('button',{name:'Схема',exact:true}).click();
 await page.waitForFunction(()=>{const svg=document.querySelector('[data-panel="topology"] [role="img"]');if(!svg)return false;const g=svg.querySelector('g[transform]');if(!g)return false;const b=g.getBBox(),m=g.transform.baseVal.consolidate()?.matrix;if(!m)return false;return m.a>0.8&&b.width>0;});
 const diagram=await svg.evaluate(el=>{const g=el.querySelector('g[transform]'),b=g.getBBox(),m=g.transform.baseVal.consolidate().matrix;return {scale:m.a,left:b.x*m.a+m.e,top:b.y*m.d+m.f,right:(b.x+b.width)*m.a+m.e,bottom:(b.y+b.height)*m.d+m.f,width:el.clientWidth,height:el.clientHeight};});
 assert.ok(diagram.left>=0&&diagram.top>=0&&diagram.right<=diagram.width+1&&diagram.bottom<=diagram.height+1,'no intrinsic device/port/label clipping');
 const ringCanvas=topo.locator('[data-topology-scroll]');await ringCanvas.evaluate(el=>el.scrollLeft=(el.scrollWidth-el.clientWidth)/2);
 if(mobile){
   const cdp=await context.newCDPSession(page);
   const swipe=async(x,y,dx,dy)=>{
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
     for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/8,y:y+dy*i/8}]});await page.waitForTimeout(20);}
     await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(150);
   };
   await ringCanvas.evaluate(el=>el.scrollLeft=0);await topo.evaluate(el=>el.scrollTop=0);
   const r=await ringCanvas.boundingBox(),pageY=await page.evaluate(()=>scrollY);
   await swipe(r.x+r.width-20,r.y+100,-85,0);
   assert.ok(await ringCanvas.evaluate(el=>el.scrollLeft)>10,'native touch horizontal scrolling');
   await swipe(r.x+r.width/2,r.y+240,0,-140);
   assert.ok(await topo.evaluate(el=>el.scrollTop)>10,'native touch reaches lower diagram/inspector');
   assert.equal(await page.evaluate(()=>scrollY),pageY,'touch never scrolls underlying page');await cdp.detach();
 }
 await save('topology-ring');await page.keyboard.press('Escape');
 // Single-switch exercise without physical topology gets no empty scheme control.
 await root.getByRole('button',{name:/^Начальный/}).click();await root.getByRole('button',{name:'Режимы Cisco IOS и сохранение',exact:true}).click();await fullButton.click();assert.equal(await toolbar.getByRole('button',{name:'Схема',exact:true}).count(),0);await page.keyboard.press('Escape');
 assert.deepEqual(errors,[]);results.push({viewport,closed,task:taskGeometry,diagram,historyScroll,errors,status:'PASS'});
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));await context.close();
 }catch(error){await save('failure');throw error;}
}
console.log('PASS fullscreen desktop/mobile: pane geometry, state/DOM persistence, input/history, SW switching, Learn/hints/theory, save/reload, escape/exit, ring bounds and page-scroll isolation.');
}finally{await browser.close();}

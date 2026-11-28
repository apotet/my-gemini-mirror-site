import assert from 'node:assert/strict';
const {chromium}=await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.NETOPS_BASE_URL || 'http://localhost:3000/my-gemini-mirror-site/';
const browser=await chromium.launch({executablePath:process.env.NETOPS_CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
try {
  const p=await browser.newPage();
  for(const width of [320,390,768,1023,1024,1100,1280,1366,1440,1536,1600,1920,2560]) {
    await p.setViewportSize({width,height:1000});
    await p.goto(base+'?mock=courses');
    const f=p.frameLocator('iframe');
    await f.getByRole('button',{name:/Студия/}).waitFor();
    for(const dark of [false,true]) {
      await f.locator('html').evaluate((e,dark)=>e.classList.toggle('dark',dark),dark);
      const rects=await f.locator('header').first().locator('button, a').evaluateAll(nodes=>nodes.map(e=>({text:e.textContent.trim()||e.getAttribute('aria-label')||e.title,rect:e.getBoundingClientRect().toJSON()})).filter(e=>e.rect.width>0 && e.rect.height>0));
      if(width>=1280) {
        const centers=rects.map(e=>e.rect.y+e.rect.height/2);
        assert.ok(Math.max(...centers)-Math.min(...centers)<2,`${width}px controls must fit one row`);
      }
      for(let i=0;i<rects.length;i++) for(let j=i+1;j<rects.length;j++) {
        const a=rects[i],b=rects[j];
        assert.ok(Math.min(a.rect.right,b.rect.right)-Math.max(a.rect.left,b.rect.left)<=1 || Math.min(a.rect.bottom,b.rect.bottom)-Math.max(a.rect.top,b.rect.top)<=1,`${width}px overlap: ${a.text} / ${b.text}`);
      }
      assert.ok(await f.locator('html').evaluate(e=>e.scrollWidth<=innerWidth+1),`${width}px overflow`);
      const concepts=width<1024 ? ['Студия','Академия','Учебник'] : ['Студия NetOps','Инженерная академия','Интерактивный учебник'];
      for(const name of concepts) {
        const btn=f.getByRole('button',{name,exact:true});
        assert.ok(!/^\d/.test(await btn.innerText()));
        await btn.click();
      }
    }
    if(process.env.NETOPS_SCREENSHOT_DIR && [390,1440,1920].includes(width)) await p.screenshot({path:`${process.env.NETOPS_SCREENSHOT_DIR}/courses-toolbar-${width}.png`});
    console.log(`PASS ${width}px: no overlapping controls, no overflow, concept buttons work without numbers, both themes`);
  }
} finally {await browser.close();}

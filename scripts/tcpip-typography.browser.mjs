// Real before/after on the direct lesson URL; TCPIP_BASELINE_URL and TCPIP_EVIDENCE_PATH are optional.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const current = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5661/my-gemini-mirror-site/';
const baseline = process.env.TCPIP_BASELINE_URL;
const output = process.env.TCPIP_EVIDENCE_PATH;
if (output) await mkdir(output, { recursive: true });
for (const url of [current, baseline].filter(Boolean)) {
  assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(url).hostname), 'use a local build only');
}
const widthOptions = process.env.TCPIP_WIDTHS?.split(',').map(Number) ?? [375, 390, 768, 1280, 1440];
const title = 'TCP/IP: четыре уровня и инкапсуляция';
const browser = await chromium.launch({ executablePath: process.env.NETOPS_CHROMIUM_PATH || undefined, args: ['--disable-dev-shm-usage'] });
const results = {};
const snapshots = new Map();
const core = ['layers', 'osi', 'pack', 'unpack', 'addresses'];

function typography(sectionRoot) {
  return sectionRoot.evaluate(root => {
    const main = root.querySelector('.tcpip-reading__prose > div > p');
    const caption = root.querySelector('[data-lesson-visual-description]');
    const style = node => {
      const css = getComputedStyle(node);
      return { px: parseFloat(css.fontSize), linePx: parseFloat(css.lineHeight), color: css.color };
    };
    const visuals = [...root.querySelectorAll('[data-lesson-visual]')].map(figure => {
      const image = figure.querySelector('img');
      const box = image.getBoundingClientRect();
      const fig = figure.getBoundingClientRect();
      return {
        id: figure.dataset.lessonVisual, asset: new URL(image.currentSrc).pathname.split('/').at(-1),
        width: Math.round(box.width), height: Math.round(box.height),
        fits: box.width > 0 && box.height > 0 && box.left >= fig.left && box.right <= fig.right
          && box.left >= 0 && box.right <= innerWidth + 1
          && Math.abs((box.width / box.height) / (image.naturalWidth / image.naturalHeight) - 1) < 0.015,
      };
    });
    return {
      body: style(main), caption: style(caption), sectionHeight: Math.round(root.getBoundingClientRect().height),
      pageWidth: document.scrollingElement.scrollWidth,
      visibleText: [...root.querySelectorAll('p, li')].filter(el => !el.closest('details:not([open])') && el.getClientRects().length).map(el => el.textContent.trim()).join('').length,
      visuals,
    };
  });
}

async function loadImages(loc) {
  await loc.evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
}
async function sectionContent(sections) {
  return sections.locator('section').evaluateAll(sections => sections.map(section => ({
    heading: section.querySelector('h3')?.textContent.trim(),
    paragraphs: [...section.querySelectorAll('p, li')].filter(p => !p.closest('details')).map(p => p.textContent.trim()),
    anchor: section.dataset.lessonSectionAnchor ?? null,
  })));
}
const identifiers = rows => rows.map(({ heading, anchor }) => ({heading, anchor}));

try {
  for (const [name, url] of [['before', baseline], ['after', current]]) {
    if (!url) continue;
    results[name] = [];
    for (const width of widthOptions) for (const theme of ['light', 'dark']) {
      const mobile = width < 500;
      const context = await browser.newContext({ viewport: { width, height: mobile ? 667 : 900 },
        hasTouch: mobile, isMobile: mobile, reducedMotion: 'reduce' });
      await context.addInitScript(t => localStorage.setItem('osi_theme_dark', t === 'dark' ? '1' : '0'), theme);
      await context.route('**/*', route => new URL(route.request().url()).origin === new URL(url).origin ? route.continue() : route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.setDefaultTimeout(8000);
      const button = (name, container = page) => container.getByRole('button', { name, exact: typeof name === 'string' });
      await page.goto(url + '?lesson=tcpip-model');
      const heading = page.getByRole('heading', { name: title, exact: true });
      await heading.waitFor();
      assert.equal(await page.locator('html').evaluate(html => html.classList.contains('dark')), theme === 'dark');
      const sections = page.locator('article').filter({ has: heading }).locator(':scope > div.space-y-4').first();
      const visuals = sections.locator('[data-lesson-visual]');
      const sheets = sections.locator('[data-lesson-cheatsheet]');
      const findVisual = key => visuals.and(page.locator(`[data-lesson-visual="tcpip-${key}.svg"]`));
      assert.equal(await visuals.count(), 9);
      assert.equal(await sheets.count(), 4);
      await loadImages(visuals.locator('img'));
      const measure = await typography(sections);
      const plain = await sectionContent(sections);
      const key = `${width}-${theme}`;
      assert(measure.pageWidth <= width + 1, 'no horizontal page scrolling');
      if (output && width !== 768 && theme === 'light') {
        await page.screenshot({ path: join(output, `${name}-${key}-entry.png`) });
        // Hide the application chrome only for cropped cards, not for full viewport or zoom evidence.
        const chrome = await page.addStyleTag({content:'nav.fixed, header.sticky {display:none!important}'});
        for (const part of core) {
          const card = sections.locator(':scope > section').filter({ has: page.locator(`[data-lesson-visual="tcpip-${part}.svg"]`) });
          await card.screenshot({path:join(output,`${name}-${key}-${part}.png`)});
        }
        await chrome.evaluate(node=>node.remove());
      }
      if (name === 'after') {
        assert(measure.body.px >= 16 && measure.body.px <= 18);
        assert(measure.body.linePx / measure.body.px >= 1.5 && measure.body.linePx / measure.body.px <= 1.65);
        assert(measure.caption.px >= 15 && measure.caption.color !== measure.body.color);
        assert(measure.visuals.every(img => img.fits && img.asset.endsWith(width >= 896 ? '-wide.svg' : '.svg')
          && (width >= 896 || !img.asset.endsWith('-wide.svg'))), JSON.stringify(measure.visuals));
        if (baseline) {
          const original = snapshots.get(key);
          assert.deepEqual(identifiers(plain), identifiers(original.plain), 'exact plain headings and anchors');
          assert(measure.visibleText < original.measure.visibleText * .8, 'default prose is meaningfully less repetitive');
          assert(measure.sectionHeight < original.measure.sectionHeight * .85, 'compact article without hiding the primary art');
          for (const part of core) {
            const before = original.measure.visuals.find(v => v.id === `tcpip-${part}.svg`);
            const after = measure.visuals.find(v => v.id === before.id);
            assert(after.height < before.height * .8, `compact ${part} at ${width}`);
          }
        }
        const description = findVisual('layers').locator('figcaption details');
        const summary = description.locator('summary');
        assert.equal(await description.getAttribute('open'), null);
        assert(!(await description.ariaSnapshot()).includes('Программы обмениваются'));
        await summary.press('Enter');
        const accessible = await description.ariaSnapshot();
        for (const role of ['Прикладной', 'Транспортный', 'Межсетевой', 'Сетевой доступ']) {
          assert(accessible.includes(role), 'expanded text equivalent readable via accessibility tree');
        }
        assert.equal(await description.locator('[data-tcpip-level]').count(), 4);
        await summary.press('Enter');
        for (const part of ['layers', 'pack']) {
          const visual = findVisual(part);
          const preview = await visual.locator('img').evaluate(img => img.currentSrc);
          await button(/на весь экран/, visual).click();
          const dialog = page.getByRole('dialog');
          await dialog.waitFor();
          const modalImage = dialog.locator('[data-photo-viewer-image]');
          await modalImage.evaluate(img => img.decode());
          assert.equal(await modalImage.evaluate(img => img.currentSrc), preview);
          const initial = await modalImage.boundingBox();
          await button('Увеличить фото', dialog).click();
          assert((await modalImage.boundingBox()).width > initial.width * 1.18);
          if (output && theme === 'light' && width !== 768 && part === 'pack')
            await page.screenshot({ path: join(output, `${name}-${key}-zoom.png`) });
          await page.keyboard.press('Escape');
          await dialog.waitFor({ state: 'hidden' });
        }
        for (const sheet of await sheets.all()) {
          assert.equal(await sheet.getAttribute('open'), null);
          await sheet.locator(':scope > summary').click();
        }
        await loadImages(sheets.locator('img'));
        assert.equal(await sheets.locator('[data-lesson-visual-description]').filter({visible:true}).count(), 4);
        for (const sheet of await sheets.all()) {
          const text = sheet.locator('figcaption details');
          await text.locator('summary').press('Enter');
          assert((await text.ariaSnapshot()).includes('бит') || (await text.ariaSnapshot()).includes('байт'));
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        if (output && theme === 'light' && width !== 768) {
          const sheetCard=sections.locator(':scope > section').filter({has:page.locator('[data-lesson-cheatsheet="tcpip-tcp.svg"]')});
          await sheetCard.screenshot({style:'nav.fixed, header.sticky {visibility:hidden!important}',path:join(output,`${name}-${key}-tcp.png`)});
        }
        const term = sections.locator('[data-glossary-term="TCP"]').first();
        const center = () => term.evaluate(el => {
          el.scrollIntoView({ behavior: 'instant', block: 'center' });
          return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        assert.equal(await term.getAttribute('data-glossary-hover'), null);
        await center();
        await (mobile ? term.tap() : term.click());
        await page.getByRole('tooltip').waitFor();
        await page.keyboard.press('Escape');
        await page.getByRole('tooltip').waitFor({state:'hidden'});
        const glossary = page.getByRole('switch', { name: 'Подсказки при наведении' });
        await glossary.click();
        assert.equal(await term.getAttribute('data-glossary-hover'), 'on');
        await glossary.click();
        assert.equal(await term.getAttribute('data-glossary-hover'), null);
      }
      await button('По делу').click();
      assert.equal(await visuals.count(), 0);
      const pro = await sectionContent(sections);
      assert(pro.length >= 5);
      if (name === 'before') snapshots.set(key, { plain, pro, measure });
      else if (baseline) assert.deepEqual(pro, snapshots.get(key).pro, 'professional text and anchors unchanged');
      await button('Простыми словами').click();
      assert.equal(await visuals.count(), 9);
      if (name === 'after' && width === 1440 && theme === 'dark') {
        await button('К каталогу уроков').click();
        await page.locator('[data-catalog-lesson="l3-arp"]').click();
        await page.getByRole('heading', { name: 'ARP: чей MAC нужен для IP', exact: true }).waitFor();
        assert.equal(await page.locator('[data-lesson-reading="tcpip"], .tcpip-reading__prose').count(), 0);
      }
      assert.deepEqual(errors, []);
      results[name].push({width, theme, ...measure});
      await context.close();
      console.log('PASS', name, width, theme, JSON.stringify(measure));
    }
  }
} finally {
  await browser.close();
  if (output) await writeFile(join(output, 'typography-metrics.json'), JSON.stringify(results, null, 2) + '\n');
}

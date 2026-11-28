// TCPIP_BASELINE_URL is optional; if set, compare the exact prior preview.
// NETOPS_BASE_URL must point to the TCP/IP typography candidate running locally.
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
const title = 'TCP/IP: четыре уровня и инкапсуляция';
const browser = await chromium.launch({
  executablePath: process.env.NETOPS_CHROMIUM_PATH || undefined,
  args: ['--disable-dev-shm-usage'],
});
const results = {};
const captures = {};

const typography = sectionRoot => sectionRoot.evaluate(root => {
  const main = root.querySelector('.tcpip-reading__prose > div > p, section > div > div > div > p');
  const caption = root.querySelector('[data-lesson-visual-description] p');
  const length = element => {
    const lines = new Map();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (let i = 0; i < node.length; i++) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const box = range.getBoundingClientRect();
        if (box.width) {
          const center = box.top + box.height / 2;
          const row = [...lines.keys()].find(y => Math.abs(y - center) < 4) ?? center;
          lines.set(row, (lines.get(row) ?? '') + node.textContent[i]);
        }
      }
    }
    return [...lines.values()].map(line => line.trim().length);
  };
  const paragraphs = root.querySelectorAll('.tcpip-reading__prose > div > p, section > div > div > div > p');
  const lineLengths = [...paragraphs].flatMap(element => length(element).slice(0, -1)).sort((a, b) => a - b);
  const style = node => {
    const css = getComputedStyle(node);
    return { px: parseFloat(css.fontSize), linePx: parseFloat(css.lineHeight), color: css.color,
      width: Math.round(node.getBoundingClientRect().width) };
  };
  const roles = root.querySelector('[data-lesson-visual="tcpip-layers.svg"]');
  const picture = roles.querySelector('img').getBoundingClientRect();
  const panel = roles.querySelector('.tcpip-reading__prose, figcaption').getBoundingClientRect();
  return {
    body: style(main), caption: style(caption), sectionHeight: Math.round(root.getBoundingClientRect().height),
    scrollHeight: document.scrollingElement.scrollHeight, pageWidth: document.scrollingElement.scrollWidth,
    cardHeights: [...root.children].map(card => Math.round(card.getBoundingClientRect().height)),
    columns: picture.right < panel.left ? 2 : 1,
    lineMedian: lineLengths[Math.floor(lineLengths.length / 2)] ?? null,
    lineP90: lineLengths[Math.floor(lineLengths.length * 0.9)] ?? null,
    maxLine: lineLengths.at(-1) ?? null,
  };
});

try {
  for (const [name, url] of [['before', baseline], ['after', current]]) {
    if (!url) continue;
    results[name] = [];
    for (const width of [375, 768, 1440]) for (const theme of ['light', 'dark']) {
      const height = width === 375 ? 667 : 900;
      const context = await browser.newContext({ viewport: { width, height },
        hasTouch: width === 375, isMobile: width === 375, reducedMotion: 'reduce' });
      await context.addInitScript(t => localStorage.setItem('osi_theme_dark', t === 'dark' ? '1' : '0'), theme);
      await context.route('**/*', route => new URL(route.request().url()).origin === new URL(url).origin ? route.continue() : route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.setDefaultTimeout(8000);
      const button = name => page.getByRole('button', { name, exact: true });
      await page.goto(url + '?lesson=tcpip-model');
      const heading = page.getByRole('heading', { name: title, exact: true });
      await heading.waitFor();
      assert.equal(await page.locator('html').evaluate(html => html.classList.contains('dark')), theme === 'dark');
      const article = page.locator('article').filter({ has: heading });
      const sections = article.locator(':scope > div.space-y-4').first();
      const visuals = sections.locator('[data-lesson-visual]');
      const sheets = sections.locator('[data-lesson-cheatsheet]');
      assert.equal(await visuals.count(), 9);
      assert.equal(await sheets.count(), 4);
      await visuals.locator('img').evaluateAll(async images => {
        await Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); }));
      });
      const measure = await typography(sections);
      assert(measure.pageWidth <= width, 'no horizontal page scrolling');
      if (name === 'after') {
        assert(measure.body.px >= 16 && measure.body.px <= 18);
        assert(measure.body.linePx / measure.body.px >= 1.5 && measure.body.linePx / measure.body.px <= 1.65);
        assert(measure.caption.px >= 15 && measure.caption.color !== measure.body.color);
        assert.equal(measure.columns, width === 1440 ? 2 : 1);
        if (width === 1440) assert(measure.lineP90 >= 60 && measure.lineP90 <= 82, JSON.stringify(measure));
        assert.equal(await sections.locator('p.tcpip-reading__takeaway').count(), 15);
        assert.equal(await sections.locator('[data-tcpip-level]').count(), 4);
        const diagramsFit = await visuals.locator('img').evaluateAll(images => images.every(image => {
          const picture = image.getBoundingClientRect();
          const figure = image.closest('figure').getBoundingClientRect();
          return picture.width > 0 && picture.height > 0 && picture.left >= figure.left && picture.right <= figure.right
            && picture.left >= 0 && picture.right <= innerWidth
            && Math.abs(picture.width / picture.height - image.naturalWidth / image.naturalHeight) < 0.01;
        }));
        assert(diagramsFit, 'primary diagrams fit the card and viewport, preserving full aspect ratio');
      }
      if (output) {
        const key = `${name}-${width}-${theme}`;
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: join(output, key + '-entry.png') });
        const themeCard = sections.locator('section').filter({ has: page.locator('[data-lesson-visual="tcpip-layers.svg"]') });
        await themeCard.screenshot({ path: join(output, key + '-roles.png') });
      }
      const panelContent = async () => {
        const paragraphs = await sections.locator('section').evaluateAll(cards => cards.map(card => ({
          heading: card.querySelector('h3').textContent.trim(),
          paragraphs: [...card.querySelectorAll(':scope p, :scope li')]
            .filter(p => !p.closest('details')).map(p => p.textContent.trim()),
          anchor: card.getAttribute('data-lesson-section-anchor'),
        })));
        return paragraphs;
      };
      const plain = await panelContent();
      if (name === 'after') {
        const visual = visuals.first();
        const zoom = visual.getByRole('button', { name: /на весь экран/ });
        await zoom.click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        await dialog.getByRole('button', { name: 'Увеличить фото' }).click();
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
        const sheet = sheets.first();
        assert.equal(await sheet.getAttribute('open'), null);
        await sheet.locator('summary').click();
        assert.equal(await sheet.getAttribute('open'), '');
        await sheet.locator('[data-lesson-visual-description]').waitFor();
        const term = sections.locator('[data-glossary-term="TCP"]').first();
        const centerTerm = () => term.evaluate(element => {
          element.scrollIntoView({ block: 'center', behavior: 'instant' });
          return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        assert.equal(await term.getAttribute('data-glossary-hover'), null);
        await centerTerm();
        await term.click();
        await page.getByRole('tooltip').waitFor();
        await page.keyboard.press('Escape');
        await page.getByRole('tooltip').waitFor({ state: 'hidden' });
        const glossary = page.getByRole('switch', { name: 'Подсказки при наведении' });
        await glossary.click();
        assert.equal(await term.getAttribute('data-glossary-hover'), 'on');
        await centerTerm();
        await term.click();
        await page.getByRole('tooltip').waitFor();
        await page.keyboard.press('Escape');
        await glossary.click();
        assert.equal(await term.getAttribute('data-glossary-hover'), null);
      }
      await button('По делу').click();
      assert.equal(await visuals.count(), 0);
      const pro = await panelContent();
      assert(pro.length >= 5);
      const saveKey = `${width}-${theme}`;
      if (name === 'before') captures[saveKey] = { plain, pro };
      else if (baseline) {
        const native = rows => rows.map(({ paragraphs, ...row }) => ({ ...row, paragraphs: [...paragraphs].sort() }));
        assert.deepEqual(native(plain), native(captures[saveKey].plain), 'same plain text and exact anchors (layout order may differ)');
        assert.deepEqual(pro, captures[saveKey].pro, 'all professional text and anchors unchanged');
      }
      await button('Простыми словами').click();
      assert.equal(await visuals.count(), 9);
      if (name === 'after' && width === 1440 && theme === 'dark') {
        await button('К каталогу уроков').click();
        await page.locator('[data-catalog-lesson="l3-arp"]').click();
        await page.getByRole('heading', { name: 'ARP: чей MAC нужен для IP', exact: true }).waitFor();
        assert.equal(await page.locator('[data-lesson-reading="tcpip"], .tcpip-reading__prose').count(), 0);
      }
      assert.deepEqual(errors, []);
      results[name].push({ width, theme, ...measure });
      await context.close();
      console.log('PASS', name, width, theme, JSON.stringify(measure));
    }
  }
} finally {
  await browser.close();
  if (output) await writeFile(join(output, 'typography-metrics.json'), JSON.stringify(results, null, 2) + '\n');
}

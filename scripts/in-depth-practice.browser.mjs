import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { bundleEntry } from './load-bank.mjs';

const { getTestingPool, getQuestionDeepDive } = await bundleEntry('scripts/in-depth-entry.ts', 'in-depth-practice-data.mjs');
const pool = getTestingPool('mixed', 'in-depth');
assert.equal(pool.length, 164, 'Must test the full Understanding pool');
const cases = [
  { id: 'gen-transport-7', practiceLink: 'dhcp', card: /^DHCP \/ NAT \/ TCP/, section: 'DHCP NAT TCP' },
  { id: 'new-ts-vlan', practiceLink: 'cli-vlan', card: /^CLI Lab 2\.0/, scenario: 'Access VLAN на порту' },
  { id: 'tcpip-d01', practiceLink: 'packet', card: /^Путь пакета/, section: 'Путь пакета' },
];
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5428/my-gemini-mirror-site/';
const output = 'scripts/.cache/in-depth/practice-live';
mkdirSync(output, { recursive: true });
const evidence = [];
const errors = [];
const browser = await chromium.launch();
try {
  for (const width of [375, 1440]) {
    const mobile = width === 375;
    const page = await browser.newPage({ viewport: { width, height: 1000 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' });
    page.setDefaultTimeout(16000);
    page.on('pageerror', error => errors.push({ width, message: error.message }));
    await page.goto(base);
    const theoryTab = () => page.getByRole('button', { name: mobile ? 'Теория' : 'Теория и разборы', exact: true });
    await theoryTab().click();
    for (const testCase of cases) {
      const question = pool.find(q => q.id === testCase.id);
      assert.ok(question, 'Missing question: ' + testCase.id);
      assert.equal(getQuestionDeepDive(question).practiceLink, testCase.practiceLink, testCase.id + ': practiceLink drift');
      const search = page.getByPlaceholder('Поиск по тексту, теме, id...');
      await search.waitFor({ state: 'visible' });
      const all = page.getByRole('button', { name: 'Все', exact: true });
      if (await all.count()) await all.click();
      await search.fill(testCase.id);
      await page.getByRole('button', { name: new RegExp('^#' + testCase.id + ' ·') }).click();
      const review = page.locator('[data-explanation-question-id="' + testCase.id + '"]');
      await review.waitFor({ state: 'visible' });
      const launch = review.getByRole('button', { name: 'Открыть стенд', exact: true });
      await launch.waitFor({ state: 'visible' });
      await launch.click();
      await page.getByRole('heading', { name: 'Сетевая практика и симуляторы', exact: true }).waitFor();
      const selected = page.getByRole('button', { name: testCase.card }).first();
      await selected.waitFor({ state: 'visible' });
      assert.equal(await selected.getAttribute('aria-pressed'), 'true', testCase.id + ': intended simulator not selected');
      if (testCase.section) await page.locator('section[aria-label="' + testCase.section + '"]').waitFor({ state: 'visible' });
      if (testCase.practiceLink === 'dhcp') {
        const dhcpTab = page.locator('section[aria-label="DHCP NAT TCP"]').getByRole('button', { name: 'DHCP', exact: true });
        assert.equal(await dhcpTab.getAttribute('aria-pressed'), 'true', 'DHCP lab must be active');
      }
      if (testCase.scenario) await page.getByText(testCase.scenario, { exact: true }).first().waitFor({ state: 'visible' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, testCase.id + '/' + width + ': horizontal overflow ' + overflow);
      await page.screenshot({ path: output + '/' + testCase.id + '-' + width + '.png', fullPage: false });
      evidence.push({ id: testCase.id, width, practiceLink: testCase.practiceLink, targetVisible: true, selected: true, overflow });
      console.log('PASS practice: ' + testCase.id + ' (' + testCase.practiceLink + ') at ' + width + 'px');
      await theoryTab().click();
    }
    await page.close();
  }
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  assert.equal(evidence.length, 6);
} finally {
  await browser.close();
  writeFileSync(output + '/evidence.json', JSON.stringify({ base, evidence, errors }, null, 2) + '\n');
}
console.log('PASS: 3 real practice links x 375/1440, exact simulator and scenario, no horizontal overflow');

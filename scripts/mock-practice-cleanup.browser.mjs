import assert from 'node:assert/strict';
const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH
  ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const base = process.env.NETOPS_BASE_URL ?? 'http://127.0.0.1:5496/my-gemini-mirror-site/';
const button = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const page = await browser.newPage({ viewport: { width, height: 820 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(8000);
    await page.goto(base);
    if (mobile) await button(page, 'Открыть меню').click();
    await button(page, 'Макет практики').click();
    await page.getByRole('heading', { name: 'Макет практики · песочница' }).waitFor();
    assert.equal(await button(page, /Темы и режимы|Схема UX v2/).count(), 0);
    for (const name of [/^Путь пакета/, /^VLAN & Trunk/, /^DHCP \/ NAT \/ TCP/, /^CLI Lab 2\.0/]) {
      const tile = button(page, name);
      assert.equal(await tile.count(), 1);
      if (mobile) await tile.tap();
      else await tile.press('Enter');
    }
    const field = page.getByPlaceholder('command… (Tab · ↑↓ · ?)');
    await field.waitFor();
    await button(page, 'Практика').click();
    await page.getByRole('heading', { name: 'Сетевая практика и симуляторы' }).waitFor();
    assert.equal(await button(page, /Темы и режимы|Схема UX v2/).count(), 0);
    await button(page, /^CLI Lab 2\.0/).click();
    await page.getByRole('region', { name: 'Уровень сложности и сценарий CLI' }).waitFor();
    await button(page, 'learn').waitFor();
    await button(page, 'Команды Cisco').waitFor();
    await field.fill('enable');
    await field.press('Enter');
    await page.getByRole('form', { name: 'Командная строка CLI' }).getByText('Switch#', { exact: true }).waitFor();
    await button(page, /^Прикладной/).click();
    await button(page, 'Два коммутатора · VLAN 10').click();
    await button(page, 'Полный экран').click();
    const fullscreen = page.getByRole('dialog', { name: 'Полноэкранная консоль CLI' });
    await fullscreen.waitFor();
    await button(fullscreen, 'GUI').click();
    await fullscreen.getByRole('region', { name: 'Схема сети' }).waitFor();
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}: both mock tiles absent; four mock controls and regular CLI plus fullscreen topology retained`);
    await page.close();
  }
} finally {
  await browser.close();
}

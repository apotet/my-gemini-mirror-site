import assert from 'node:assert/strict';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL ?? 'http://127.0.0.1:5492/my-gemini-mirror-site/';
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH
  ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const button = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
try {
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const context = await browser.newContext({ viewport: { width, height: 820 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(9000);
    const activate = item => mobile ? item.tap() : item.press('Enter');
    const tab = async name => {
      if (mobile && await button(page, name).count() === 0) await button(page, 'Открыть меню').click();
      await activate(button(page, name));
    };
    await page.goto(base);
    await tab('Макет практики');
    await activate(button(page, /CLI · Темы и режимы/));
    const panel = page.getByRole('region', { name: 'Темы и режимы CLI', exact: true });
    const scenario = panel.getByRole('region', { name: 'Задание CLI', exact: true });
    const picker = panel.getByRole('region', { name: 'Выбранный сценарий', exact: true });
    const radio = name => panel.getByRole('radio', { name });
    const open = button(picker, 'Открыть сценарий');
    const back = button(panel, 'К выбору сценария');
    const cmd = page.getByPlaceholder('command… (Tab · ↑↓ · ?)');
    const exec = async (...lines) => { for (const line of lines) { await cmd.fill(line); await cmd.press('Enter'); } };
    const noOverflows = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));

    await picker.getByRole('heading', { name: 'Access VLAN на порту', exact: true }).waitFor();
    await activate(open);
    await scenario.waitFor();
    assert.equal(await button(panel, 'Вернуться к уроку').count(), 0);
    await button(scenario, 'Подсказка').waitFor();
    await exec('enable', 'configure terminal', 'vlan 10', 'name Users', 'exit', 'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'no shutdown', 'end');
    await scenario.getByText(/Порт Fa0\/1|VLAN 10/, { exact: false }).first().waitFor();
    await noOverflows();
    await activate(back);
    await page.waitForFunction(el => document.activeElement === el, await open.elementHandle());

    await radio(/^Тренировка/).check();
    await activate(open);
    await scenario.getByText('Access VLAN на порту', { exact: true }).waitFor();
    assert.equal(await button(scenario, 'Подсказка').count(), 0);
    await button(scenario, 'Проверить').waitFor();
    await activate(back);

    await radio(/^Прикладной/).check();
    await picker.getByRole('heading', { name: 'Два коммутатора · VLAN 10', exact: true }).waitFor();
    await activate(open);
    await scenario.getByText('Два коммутатора · VLAN 10', { exact: true }).waitFor();
    assert.equal(await button(panel, 'SW1').getAttribute('aria-pressed'), 'true');
    await activate(button(panel, 'SW2'));
    assert.equal(await button(panel, 'SW2').getAttribute('aria-pressed'), 'true');
    await activate(back);

    await radio(/^Продвинутый/).check();
    await radio(/^Задание/).check();
    await activate(open);
    await scenario.getByText('Два коммутатора · частичная потеря связи', { exact: true }).waitFor();
    assert.equal(await button(scenario, 'Подсказка').count(), 0);
    assert.equal(await button(panel, 'Команды Cisco').count(), 0);
    assert.equal(await scenario.getByText('Теория по заданию', { exact: true }).count(), 0);
    assert.doesNotMatch(await scenario.innerText(), /switchport trunk allowed vlan add/i);
    await activate(button(scenario, 'Проверить'));
    await panel.getByLabel('История CLI', { exact: true }).getByText(/Проверка: [12]\/3/).waitFor();
    await activate(button(panel, 'SW2'));
    await exec('enable', 'configure terminal', 'interface fa0/24', 'switchport trunk allowed vlan add 20', 'end', 'write memory');
    await scenario.getByText(/По модели L2-конфигурации обе VLAN проходят/).waitFor();
    await activate(back);

    await activate(button(picker, /^Связанный урок:/));
    const lesson = panel.getByRole('region', { name: 'Связанный урок в макете' });
    await lesson.waitFor();
    await activate(button(lesson, 'По делу'));
    const fromLesson = button(lesson, 'Открыть сценарий из урока');
    await fromLesson.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const box = await fromLesson.boundingBox();
    await activate(fromLesson);
    await scenario.getByText('Два коммутатора · частичная потеря связи', { exact: true }).waitFor();
    assert.equal(await lesson.count(), 0);
    await activate(button(panel, 'Вернуться к уроку'));
    await page.waitForFunction(el => document.activeElement === el, await fromLesson.elementHandle());
    assert.equal(await button(lesson, 'По делу').getAttribute('aria-pressed'), 'true');
    assert.ok(Math.abs((await fromLesson.boundingBox()).y - box.y) <= 12);
    await noOverflows();

    await tab('Практика');
    assert.equal(await panel.count(), 0);
    await activate(button(page, /^CLI Lab 2\.0/));
    await page.getByRole('region', { name: 'Уровень сложности и сценарий CLI' }).waitFor();
    await button(page, 'learn').waitFor();
    await button(page, 'Команды Cisco').waitFor();
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}: mock-only access, three real scenarios and modes, state-based repair, exact lesson return, regular Practice unchanged`);
    await context.close();
  }
} finally {
  await browser.close();
}

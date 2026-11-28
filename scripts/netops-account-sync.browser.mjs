import assert from 'node:assert/strict';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5615/my-gemini-mirror-site/';
assert(new Set(['127.0.0.1', 'localhost', '[::1]']).has(new URL(base).hostname), 'Browser test requires loopback only');
const browser = await chromium.launch(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {});
const optInKey = 'osi_netops_account_sync_opt_in_v1';
const favoriteKey = 'osi_knowledge_favorites_v1';
const resumeKey = 'osi_knowledge_beginner_resume_v1';
const sortKey = 'osi_knowledge_beginner_sort_v1';

// Use the production lazy-import boundary, but replace only the backend module.
// The route below disallows all requests to other origins.
const fake = `
  export function createFirebaseAccountBackend() {
    const STORAGE = '__netops_sync_browser_fixture';
    const seed = { uid: null, favorites: { 'l3-route-selection': true, 'l3-masks': false }, resumeId: 'l3-route-selection' };
    const read = () => JSON.parse(localStorage.getItem(STORAGE) || JSON.stringify(seed));
    const save = (fn) => localStorage.setItem(STORAGE, JSON.stringify(fn(read())));
    const favoriteListeners = new Set();
    const resumeListeners = new Set();
    const identity = { uid: 'fixture-a', label: 'test@example.invalid' };
    const OFFLINE = '__netops_sync_browser_offline';
    let confirmed = sessionStorage.getItem(OFFLINE) !== '1';
    const send = () => {
      for (const next of favoriteListeners) next({ confirmed, value: Object.entries(read().favorites).filter(([, active]) => active).map(([id]) => id) });
      for (const next of resumeListeners) next({ confirmed, value: read().resumeId });
    };
    globalThis.netopsFakeSync = {
      get: read,
      setConfirmed: value => {
        if (value) sessionStorage.removeItem(OFFLINE);
        else sessionStorage.setItem(OFFLINE, '1');
        confirmed = value;
        send();
      },
    };
    const guard = (uid, current) => {
      if (uid !== read().uid || !current() || !confirmed) throw new Error('blocked fixture request');
    };
    return {
      observeAuth(next) { queueMicrotask(() => next(read().uid ? identity : null)); return () => {}; },
      async signIn() { save(s => ({ ...s, uid: identity.uid })); return identity; },
      async signOut() { save(s => ({ ...s, uid: null })); },
      watchFavorites(uid, next) { favoriteListeners.add(next); queueMicrotask(send); return () => favoriteListeners.delete(next); },
      watchResume(uid, next) { resumeListeners.add(next); queueMicrotask(send); return () => resumeListeners.delete(next); },
      async setFavorite(uid, id, active, current) {
        guard(uid, current);
        save(s => ({ ...s, favorites: { ...s.favorites, [id]: active } }));
        send();
      },
      async setResume(uid, id, current) {
        guard(uid, current);
        save(s => ({ ...s, resumeId: id }));
        send();
      },
      async importMissing(uid, data, current) {
        guard(uid, current);
        save(s => {
          for (const id of data.favorites) if (!(id in s.favorites)) s.favorites[id] = true;
          if (s.resumeId === null && data.resumeId) s.resumeId = data.resumeId;
          return s;
        });
        send();
      },
    };
  }
`;

try {
  for (const width of [375, 1440]) {
    const mobile = width < 500;
    const context = await browser.newContext({ viewport: { width, height: mobile ? 667 : 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' });
    await context.addInitScript(({ favoriteKey, resumeKey, sortKey }) => {
      if (sessionStorage.getItem('__netops_guest_fixture')) return;
      localStorage.setItem(favoriteKey, JSON.stringify(['l3-arp', 'l3-masks']));
      localStorage.setItem(resumeKey, 'l3-masks');
      localStorage.setItem(sortKey, 'study');
      sessionStorage.setItem('__netops_guest_fixture', '1');
    }, { favoriteKey, resumeKey, sortKey });
    let backendLoads = 0;
    const external = [];
    await context.route('**/*', request => {
      const url = new URL(request.request().url());
      if (url.origin !== new URL(base).origin) {
        external.push(url.origin);
        return request.abort();
      }
      if (/\/firebaseAccountBackend(?:\.ts|-[a-z0-9_-]+\.js)$/i.test(url.pathname)) {
        backendLoads++;
        return request.fulfill({ status: 200, contentType: 'application/javascript', body: fake });
      }
      return request.continue();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.setDefaultTimeout(10000);
    const panel = page.getByRole('region', { name: 'Синхронизация уроков', exact: true });
    const b = (name, scope = page) => scope.getByRole('button', { name, exact: typeof name === 'string' });
    const fav = page.getByRole('region', { name: 'Избранные уроки' });
    const favIds = () => fav.locator('[data-catalog-lesson]').evaluateAll(cards => cards.map(card => card.dataset.catalogLesson).sort());
    const cloud = () => page.evaluate(() => globalThis.netopsFakeSync.get());
    const catalog = async () => {
      await b(mobile ? 'Теория' : 'Теория и разборы').click();
      await b('База знаний').click();
      await panel.waitFor();
      await b('База').click();
    };

    await page.goto(base);
    await catalog();
    assert.equal(backendLoads, 0);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), optInKey), null);
    const guestContinue = b(/^Продолжить:.*маск/i);
    await guestContinue.waitFor();
    await page.evaluate(() => window.scrollTo(0, 0));
    const continueBounds = await guestContinue.boundingBox();
    const panelBounds = await panel.boundingBox();
    assert(continueBounds && panelBounds && continueBounds.y + continueBounds.height < panelBounds.y,
      'Continue must be above account controls');
    if (mobile) {
      const modeNav = await b('Теория').locator('xpath=ancestor::nav[1]').boundingBox();
      assert(modeNav && continueBounds.y + continueBounds.height < modeNav.y,
        'Continue must be completely above mobile bottom navigation without scrolling');
    }
    await b('Избранное').click();
    assert.deepEqual(await favIds(), ['l3-arp', 'l3-masks']);
    await b('Подключить синхронизацию', panel).click();
    await b('Войти через Google', panel).waitFor();
    assert.equal(await page.evaluate(key => localStorage.getItem(key), optInKey), null);
    assert.deepEqual(await favIds(), ['l3-arp', 'l3-masks']);
    await b('Войти через Google', panel).click();
    await panel.getByText('Подключено', { exact: true }).waitFor();
    assert.equal(backendLoads, 1);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), optInKey), '1');
    assert.deepEqual(await favIds(), ['l3-route-selection']);
    await b('Импортировать локальные', panel).click();
    await panel.getByText(/Импорт подтверждён сервером/).waitFor();
    assert.deepEqual(await favIds(), ['l3-arp', 'l3-route-selection']);
    assert.equal((await cloud()).favorites['l3-masks'], false, 'must not revive tombstone');
    assert.equal((await cloud()).resumeId, 'l3-route-selection', 'import must not replace account resume');

    await b('Уроки').click();
    await b('Продолжить: L3: маршрут к назначению и самая длинная маска').click();
    const nav = page.getByRole('navigation', { name: 'Учебный маршрут' });
    await b('Следующий: ARP: чей MAC нужен для IP', nav).click();
    await page.waitForFunction(() => globalThis.netopsFakeSync.get().resumeId === 'l3-arp');
    await b('К каталогу уроков').click();
    await b('Избранное').click();
    const arpFavorite = b('Избранное: ARP: чей MAC нужен для IP', fav);
    await arpFavorite.click();
    await arpFavorite.waitFor({ state: 'detached' });
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Избранное');
    assert.equal((await cloud()).favorites['l3-arp'], false);

    await page.evaluate(() => globalThis.netopsFakeSync.setConfirmed(false));
    await panel.getByText(/Нет подтверждения от сервера/).waitFor();
    assert(await b('Импортировать локальные', panel).count() === 0, 'import state is retained until logout');
    assert(await b(/^Избранное: L3/, fav).isDisabled(), 'writes are paused while offline');
    assert.deepEqual(await favIds(), ['l3-route-selection']);
    await page.reload();
    await catalog();
    await panel.getByText(/Нет подтверждения от сервера/).waitFor();
    assert.equal(backendLoads, 2, 'one lazy reload follows explicit opt-in');
    const continueArp = b('Продолжить: ARP: чей MAC нужен для IP');
    await page.getByText(/Пока не удалось загрузить место остановки/).waitFor();
    assert.equal(await b(/^Продолжить:/).count(), 0, 'no invented checkpoint and no guest substitution');
    await b('Избранное').click();
    await fav.getByText(/Пока не удалось загрузить избранное/).waitFor();
    assert.equal(await fav.getByText(/Сохранено уроков:|Пока пусто/).count(), 0,
      'no empty account assertion before a server result');
    assert.deepEqual(await favIds(), [], 'do not display guest or cached account favorites');

    await page.evaluate(() => globalThis.netopsFakeSync.setConfirmed(true));
    await panel.getByText('Подключено', { exact: true }).waitFor();
    await fav.getByText('Сохранено уроков: 1', { exact: true }).waitFor();
    assert.deepEqual(await favIds(), ['l3-route-selection'], 'recovery shows original server favorites');
    await b('Уроки').click();
    await continueArp.waitFor();
    assert.equal(await page.getByText(/Пока не удалось загрузить место остановки/).count(), 0);

    await b('Выйти', panel).click();
    await b('Подключить синхронизацию', panel).waitFor();
    assert.equal(await page.evaluate(key => localStorage.getItem(key), optInKey), null);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), resumeKey), 'l3-masks');
    await b('Избранное').click();
    assert.deepEqual(await favIds(), ['l3-arp', 'l3-masks']);
    await page.reload();
    await catalog();
    assert.equal(backendLoads, 2, 'logout disables SDK reload');
    // NetOps' existing font stylesheet may be requested; all external requests
    // are still blocked, and the account flow must not cause external requests.
    assert.deepEqual(external.filter(origin => origin !== 'https://fonts.googleapis.com'), []);
    assert.deepEqual(errors, []);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await context.close();
    console.log(`PASS ${width}: guest without SDK, sign-in, separate import, no tombstone revival, resume across reload, offline warning and logout`);
  }
} finally { await browser.close(); }

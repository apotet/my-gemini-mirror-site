import assert from 'node:assert/strict';
import { build } from 'esbuild';

const [{ text }] = (await build({
  entryPoints: ['src/utils/accountSyncStore.ts'], bundle: true, write: false, format: 'esm', platform: 'node',
})).outputFiles;
const { createAccountSyncStore } = await import('data:text/javascript;base64,' + Buffer.from(text).toString('base64'));
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

function fixture(opt = false) {
  const fav = new Map([['a', { removed: false, online: true }], ['b', { other: true }]]);
  const resumes = new Map([['a', 'step-2'], ['b', 'step-3']]);
  let auth = opt ? { uid: 'a', label: 'A' } : null;
  let observer;
  let loads = 0;
  let offline = false;
  let favoriteDelay;
  let resumeDelay;
  const resumeCalls = [];
  const watchers = [];
  function confirm(uid, { confirmed = true, injectFavorites, injectResume } = {}) {
    for (const { uid: who, kind, next, stopped } of watchers) {
      if (who !== uid || stopped) continue;
      if (kind === 'favorites') next({
        value: injectFavorites ?? Object.keys(fav.get(uid) ?? {}).filter(id => fav.get(uid)?.[id]),
        confirmed,
      });
      else next({ value: injectResume ?? resumes.get(uid) ?? null, confirmed });
    }
  }
  const guard = (uid, current) => {
    if (!current() || auth?.uid !== uid) throw new Error('changed account');
    if (offline) throw new Error('offline');
  };
  const watch = (kind, uid, next, failed) => {
    const item = { kind, uid, next, failed, stopped: false };
    watchers.push(item);
    queueMicrotask(() => { if (!item.stopped) confirm(uid, { confirmed: !offline }); });
    return () => { item.stopped = true; };
  };
  const backend = {
    observeAuth(next) {
      observer = next;
      queueMicrotask(() => { if (observer === next) next(auth); });
      return () => { observer = undefined; };
    },
    async signIn() { auth = { uid: 'a', label: 'A' }; return auth; },
    async signOut() { auth = null; },
    watchFavorites: (...args) => watch('favorites', ...args),
    watchResume: (...args) => watch('resume', ...args),
    async setFavorite(uid, id, active, current) {
      guard(uid, current);
      if (favoriteDelay) await favoriteDelay;
      guard(uid, current);
      fav.set(uid, { ...fav.get(uid), [id]: active });
      confirm(uid);
    },
    async setResume(uid, id, current) {
      guard(uid, current);
      resumeCalls.push([uid, id]);
      if (resumeDelay) await resumeDelay;
      guard(uid, current);
      resumes.set(uid, id);
      confirm(uid);
    },
    async importMissing(uid, data, current) {
      guard(uid, current);
      const bucket = { ...fav.get(uid) };
      for (const id of data.favorites) if (!(id in bucket)) bucket[id] = true;
      fav.set(uid, bucket);
      if (data.resumeId && !resumes.has(uid)) resumes.set(uid, data.resumeId);
      confirm(uid);
    },
  };
  const store = createAccountSyncStore({
    load: async () => { loads++; return backend; },
    optedIn: () => opt,
    setOptIn: value => { opt = value; },
    validFavorite: id => ['local', 'online', 'removed', 'other'].includes(id),
    validResume: id => /^step-[1-3]$/.test(id),
  });
  return {
    store, fav, resumes, watchers, confirm, resumeCalls,
    optIn: () => opt, loads: () => loads,
    setOffline: value => { offline = value; },
    switchTo: uid => { auth = uid ? { uid, label: uid.toUpperCase() } : null; observer?.(auth); },
    holdFavorite: () => { let release; favoriteDelay = new Promise(r => { release = r; }); return release; },
    holdResume: () => { let release; resumeDelay = new Promise(r => { release = r; }); return release; },
  };
}

{
  const f = fixture();
  const s = f.store;
  await s.restore();
  assert.equal(f.loads(), 0, 'guest must not load backend');
  await s.prepareSignIn();
  assert.equal(s.getSnapshot().stage, 'ready');
  assert.equal(f.optIn(), false, 'preparing the SDK is not enough to persist opt-in');
  await s.signIn(); await flush();
  assert(f.optIn());
  assert.deepEqual(s.getSnapshot().favorites, ['online']);
  assert.equal(s.getSnapshot().resumeId, 'step-2', 'use remote checkpoint, not guest');
  assert.equal(s.getSnapshot().confirmed, true);
  assert.deepEqual(f.fav.get('a'), { removed: false, online: true }, 'sign-in alone performs no import');
  await s.importGuest({ favorites: ['removed', 'local', 'local', '../secret'], resumeId: 'step-1' });
  assert.deepEqual(f.fav.get('a'), { removed: false, online: true, local: true });
  assert.equal(f.resumes.get('a'), 'step-2', 'existing remote checkpoint wins');
  assert.equal(s.getSnapshot().importStatus, 'done');
  await s.toggleFavorite('online');
  assert.deepEqual(f.fav.get('a'), { removed: false, online: false, local: true });
  assert.deepEqual(f.fav.get('b'), { other: true });
  const release = f.holdResume();
  const first = s.saveResume('step-3');
  await flush();
  await s.saveResume('step-2');
  release();
  await first;
  assert.deepEqual(f.resumeCalls, [['a', 'step-3'], ['a', 'step-2']]);
  assert.equal(f.resumes.get('a'), 'step-2', 'latest deliberate navigation wins for this device');
  f.confirm('a', { confirmed: false, injectFavorites: ['other'], injectResume: 'step-1' });
  assert.equal(s.getSnapshot().confirmed, false);
  assert.equal(s.getSnapshot().favoritesLoaded, true, 'warm list remains known');
  assert.equal(s.getSnapshot().resumeLoaded, true, 'warm checkpoint remains known');
  assert.deepEqual(s.getSnapshot().favorites, ['local'], 'cached snapshot is not accepted as server state');
  assert.equal(s.getSnapshot().resumeId, 'step-2');
  await s.toggleFavorite('local');
  assert.match(s.getSnapshot().error, /не подтвердил/);
  assert.equal(f.fav.get('a').local, true);
  f.confirm('a');
  f.setOffline(true);
  await s.toggleFavorite('local');
  assert.match(s.getSnapshot().error, /не подтвердил/);
  assert.equal(f.fav.get('a').local, true);
  f.setOffline(false);
  await s.signOut();
  assert.equal(f.optIn(), false);
  assert.equal(s.getSnapshot().stage, 'guest');
  assert.deepEqual(s.getSnapshot().favorites, []);
  assert.equal(s.getSnapshot().resumeId, null);
}
{
  const f = fixture(true);
  const s = f.store;
  assert.equal(f.loads(), 0);
  await s.restore(); await flush();
  assert.equal(f.loads(), 1, 'prior explicit opt-in permits restore');
  const release = f.holdFavorite();
  const write = s.toggleFavorite('online');
  await flush();
  f.switchTo('b');
  release();
  await write; await flush();
  assert.equal(f.fav.get('a').online, true, 'delayed operation cannot write after an account switch');
  assert.deepEqual(s.getSnapshot().favorites, ['other']);
  for (const watch of f.watchers.filter(x => x.uid === 'a')) {
    assert(watch.stopped);
    watch.next({ confirmed: true, value: ['local'] });
  }
  assert.deepEqual(s.getSnapshot().favorites, ['other'], 'old subscription callbacks cannot leak onto new account');
  f.switchTo(null);
  assert.equal(s.getSnapshot().stage, 'guest');
  f.switchTo('a');
  assert.equal(s.getSnapshot().stage, 'guest', 'login in a different tab cannot reactivate a detached guest session');
}
{
  const f = fixture();
  const s = f.store;
  f.resumes.delete('a');
  await s.prepareSignIn();
  assert.equal(s.getSnapshot().stage, 'ready');
  assert.equal(f.optIn(), false, 'preparing the SDK is not enough to persist opt-in');
  await s.signIn(); await flush();
  assert.equal(s.getSnapshot().resumeId, null);
  await s.importGuest({ favorites: [], resumeId: 'step-1' });
  assert.equal(s.getSnapshot().resumeId, 'step-1', 'explicit import initializes a missing checkpoint');
}
{
  const f = fixture(true);
  const s = f.store;
  f.setOffline(true);
  await s.restore(); await flush();
  assert.equal(s.getSnapshot().stage, 'account');
  assert.equal(s.getSnapshot().confirmed, false);
  assert.equal(s.getSnapshot().favoritesLoaded, false, 'cold offline list is unknown, not empty');
  assert.equal(s.getSnapshot().resumeLoaded, false, 'cold offline checkpoint is unknown, not absent');
  const [favorites, resume] = f.watchers;
  favorites.next({ confirmed: true, value: ['online'] });
  assert.equal(s.getSnapshot().favoritesLoaded, true, 'independently confirmed favorites can be displayed');
  assert.equal(s.getSnapshot().resumeLoaded, false);
  assert.equal(s.getSnapshot().confirmed, false, 'partial read does not enable writes');
  resume.next({ confirmed: true, value: 'step-2' });
  assert.equal(s.getSnapshot().resumeLoaded, true);
  assert.equal(s.getSnapshot().confirmed, true);
  await s.retry();
  await flush();
  assert.equal(s.getSnapshot().favoritesLoaded, true, 'retry does not erase previously known favorite state');
  assert.deepEqual(s.getSnapshot().favorites, ['online']);
  assert.equal(s.getSnapshot().resumeLoaded, true, 'retry does not erase previously known checkpoint');
  assert.equal(s.getSnapshot().resumeId, 'step-2');
  f.confirm('a', { injectFavorites: [] });
  assert.deepEqual(s.getSnapshot().favorites, [], 'confirmed empty results still replace the old list');
  f.switchTo('b');
  await flush();
  assert.equal(s.getSnapshot().favoritesLoaded, false, 'warm data cannot cross account boundaries');
  assert.equal(s.getSnapshot().resumeLoaded, false);
  assert.deepEqual(s.getSnapshot().favorites, []);
  assert.equal(s.getSnapshot().resumeId, null);
}
console.log('PASS: guest lazy load, opt-in/reload, scoped favorites and tombstones, import policy, server confirmation, ordered resume and stale-account guards');

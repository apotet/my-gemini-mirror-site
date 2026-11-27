// This module is SDK-free. It can run in the guest bundle and in offline tests.
export interface SyncIdentity { uid: string; label: string }
export interface SyncValue<T> { value: T; confirmed: boolean }
type Stop = () => void;
type Guard = () => boolean;

export interface AccountSyncBackend {
  observeAuth(next: (identity: SyncIdentity | null) => void, failed: () => void): Stop;
  signIn(): Promise<SyncIdentity>;
  signOut(): Promise<void>;
  watchFavorites(uid: string, next: (value: SyncValue<string[]>) => void, failed: () => void): Stop;
  watchResume(uid: string, next: (value: SyncValue<string | null>) => void, failed: () => void): Stop;
  setFavorite(uid: string, lessonId: string, active: boolean, current: Guard): Promise<void>;
  setResume(uid: string, lessonId: string, current: Guard): Promise<void>;
  importMissing(uid: string, data: GuestStudyData, current: Guard): Promise<void>;
}

export interface GuestStudyData { favorites: readonly string[]; resumeId: string | null }
export interface AccountSyncOptions {
  load: () => Promise<AccountSyncBackend>;
  optedIn: () => boolean;
  setOptIn: (optedIn: boolean) => void;
  validFavorite: (id: string) => boolean;
  validResume: (id: string) => boolean;
}
export interface AccountSyncSnapshot {
  stage: 'guest' | 'preparing' | 'ready' | 'connecting' | 'signing-out' | 'account';
  identity: SyncIdentity | null;
  favorites: readonly string[];
  resumeId: string | null;
  // These mean a server value was received in this account session, even if
  // connectivity was lost later. An empty result and an unread result differ.
  favoritesLoaded: boolean;
  resumeLoaded: boolean;
  confirmed: boolean;
  busy: boolean;
  error: string | null;
  importStatus: 'idle' | 'running' | 'done';
}

interface Session {
  identity: SyncIdentity;
  favorites: string[];
  resumeId: string | null;
  favoritesLoaded: boolean;
  resumeLoaded: boolean;
  favoritesConfirmed: boolean;
  resumeConfirmed: boolean;
  importing: boolean;
  imported: boolean;
  busyFavorites: Set<string>;
  pendingResume: string | null;
  writingResume: boolean;
  stops: Stop[];
}

export const guestAccountSnapshot: AccountSyncSnapshot = {
  stage: 'guest', identity: null, favorites: [], resumeId: null, favoritesLoaded: false, resumeLoaded: false,
  confirmed: false, busy: false, error: null, importStatus: 'idle',
};
const cloudReadError = 'Не удалось прочитать данные аккаунта. Проверьте подключение или повторите загрузку.';
const cloudWriteError = 'Сервер не подтвердил сохранение. Проверьте подключение и повторите действие.';

export function createAccountSyncStore(options: AccountSyncOptions) {
  let current = options.optedIn() ? { ...guestAccountSnapshot, stage: 'connecting' as const } : guestAccountSnapshot;
  let backendPromise: Promise<AccountSyncBackend> | undefined;
  let preparedBackend: AccountSyncBackend | undefined;
  let started = false;
  let authGeneration = 0;
  let authStop: Stop | undefined;
  let session: Session | undefined;
  const listeners = new Set<() => void>();

  function update(next: AccountSyncSnapshot) {
    current = next;
    for (const listener of listeners) listener();
  }
  function load() {
    backendPromise ??= options.load().catch(error => {
      backendPromise = undefined;
      throw error;
    });
    return backendPromise;
  }
  function clearSession() {
    const previous = session;
    session = undefined;
    for (const stop of previous?.stops ?? []) stop();
  }
  function publish(s: Session, error = current.error) {
    if (session !== s) return;
    update({
      stage: 'account', identity: s.identity, favorites: s.favorites, resumeId: s.resumeId,
      favoritesLoaded: s.favoritesLoaded, resumeLoaded: s.resumeLoaded,
      confirmed: s.favoritesConfirmed && s.resumeConfirmed,
      busy: s.importing || s.busyFavorites.size > 0 || s.writingResume,
      error, importStatus: s.importing ? 'running' : s.imported ? 'done' : 'idle',
    });
  }
  function watch(s: Session, backend: AccountSyncBackend) {
    // Invalidate late callbacks from listeners replaced by a manual retry.
    for (const stop of s.stops) stop();
    const stops: Stop[] = [];
    s.stops = stops;
    s.favoritesConfirmed = false;
    s.resumeConfirmed = false;
    const alive = () => session === s && s.stops === stops;
    publish(s, null);
    function failed() {
      if (!alive()) return;
      s.favoritesConfirmed = false;
      s.resumeConfirmed = false;
      publish(s, cloudReadError);
    }
    stops.push(backend.watchFavorites(s.identity.uid, result => {
      if (!alive()) return;
      s.favoritesConfirmed = result.confirmed;
      if (result.confirmed) {
        s.favorites = [...new Set(result.value.filter(options.validFavorite))];
        s.favoritesLoaded = true;
      }
      publish(s, s.favoritesConfirmed && s.resumeConfirmed && current.error === cloudReadError ? null : current.error);
    }, failed));
    stops.push(backend.watchResume(s.identity.uid, result => {
      if (!alive()) return;
      s.resumeConfirmed = result.confirmed;
      if (result.confirmed) {
        s.resumeId = result.value && options.validResume(result.value) ? result.value : null;
        s.resumeLoaded = true;
      }
      publish(s, s.favoritesConfirmed && s.resumeConfirmed && current.error === cloudReadError ? null : current.error);
    }, failed));
  }
  function forgetAuth() {
    authGeneration++;
    authStop?.();
    authStop = undefined;
    options.setOptIn(false);
    clearSession();
  }
  function bind(identity: SyncIdentity | null, backend: AccountSyncBackend) {
    if (identity && session?.identity.uid === identity.uid) return;
    if (!identity) {
      forgetAuth();
      update(guestAccountSnapshot);
      return;
    }
    clearSession();
    const next: Session = {
      identity, favorites: [], resumeId: null, favoritesLoaded: false, resumeLoaded: false,
      favoritesConfirmed: false, resumeConfirmed: false,
      importing: false, imported: false, busyFavorites: new Set(), pendingResume: null, writingResume: false, stops: [],
    };
    session = next;
    watch(next, backend);
  }
  function observe(backend: AccountSyncBackend, generation: number) {
    authStop?.();
    const stop = backend.observeAuth(
      identity => { if (authGeneration === generation) bind(identity, backend); },
      () => {
        if (authGeneration !== generation) return;
        forgetAuth();
        update({ ...guestAccountSnapshot, error: 'Не удалось восстановить вход. Войдите ещё раз.' });
      },
    );
    if (authGeneration === generation) authStop = stop;
    else stop();
  }
  async function restore() {
    if (started) return;
    started = true;
    if (!options.optedIn()) {
      if (current.stage === 'connecting') update(guestAccountSnapshot);
      return;
    }
    const generation = ++authGeneration;
    try {
      const backend = await load();
      if (authGeneration === generation) observe(backend, generation);
    } catch {
      if (authGeneration !== generation) return;
      options.setOptIn(false);
      update({ ...guestAccountSnapshot, error: 'Не удалось загрузить синхронизацию. Войдите ещё раз.' });
    }
  }
  async function prepareSignIn() {
    if (current.stage !== 'guest') return;
    started = true;
    const generation = ++authGeneration;
    update({ ...guestAccountSnapshot, stage: 'preparing' });
    try {
      preparedBackend = await load();
      if (authGeneration === generation) update({ ...guestAccountSnapshot, stage: 'ready' });
    } catch {
      if (authGeneration === generation)
        update({ ...guestAccountSnapshot, error: 'Не удалось загрузить синхронизацию. Проверьте подключение и повторите попытку.' });
    }
  }
  function cancelSignIn() {
    if (current.stage !== 'ready') return;
    update(guestAccountSnapshot);
  }
  async function signIn() {
    const backend = preparedBackend;
    if (current.stage !== 'ready' || !backend) return;
    const generation = ++authGeneration;
    update({ ...guestAccountSnapshot, stage: 'connecting' });
    try {
      // No pending SDK import before signInWithPopup: invoke the backend while
      // handling the actual Google button gesture, even on a slow connection.
      const identity = await backend.signIn();
      if (authGeneration !== generation) return;
      options.setOptIn(true);
      bind(identity, backend);
      observe(backend, generation);
    } catch (error) {
      if (authGeneration !== generation) return;
      forgetAuth();
      const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
      const message = code === 'auth/popup-blocked' ? 'Браузер заблокировал окно входа. Разрешите всплывающие окна и повторите попытку.'
        : code === 'auth/popup-closed-by-user' ? 'Вход отменён. Локальные данные не изменены.'
          : code === 'auth/unauthorized-domain' ? 'Текущий домен не разрешён для входа в настройках Firebase.'
            : 'Не удалось войти через Google. Проверьте подключение и повторите попытку.';
      update({ ...guestAccountSnapshot, stage: 'ready', error: message });
    }
  }
  async function signOut() {
    if (current.stage !== 'account') return;
    const generation = ++authGeneration;
    authStop?.();
    authStop = undefined;
    options.setOptIn(false);
    clearSession();
    update({ ...guestAccountSnapshot, stage: 'signing-out' });
    try {
      const backend = await load();
      if (authGeneration !== generation) return;
      await backend.signOut();
      if (authGeneration === generation) update(guestAccountSnapshot);
    } catch {
      if (authGeneration === generation) update({ ...guestAccountSnapshot, error: 'Синхронизация остановлена, но Google не подтвердил выход.' });
    }
  }
  function ready(s: Session) { return s.favoritesConfirmed && s.resumeConfirmed; }

  async function retry() {
    const s = session;
    if (!s || current.busy) return;
    try {
      const backend = await load();
      if (session === s) watch(s, backend);
    } catch { publish(s, cloudReadError); }
  }
  async function toggleFavorite(id: string) {
    const s = session;
    if (!s || !options.validFavorite(id) || s.busyFavorites.has(id) || s.importing) return;
    if (!ready(s)) { publish(s, cloudWriteError); return; }
    s.busyFavorites.add(id);
    const active = !s.favorites.includes(id);
    publish(s, null);
    try {
      const backend = await load();
      if (session === s) await backend.setFavorite(s.identity.uid, id, active, () => session === s);
    } catch { publish(s, cloudWriteError); }
    finally {
      s.busyFavorites.delete(id);
      publish(s);
    }
  }
  async function saveResume(id: string) {
    const s = session;
    if (!s || !options.validResume(id)) return;
    if (s.importing || !ready(s)) { publish(s, cloudWriteError); return; }
    s.pendingResume = id;
    if (s.writingResume) return;
    s.writingResume = true;
    publish(s, null);
    try {
      const backend = await load();
      while (session === s && s.pendingResume) {
        if (!ready(s)) throw new Error('Connection unconfirmed');
        const next = s.pendingResume;
        s.pendingResume = null;
        await backend.setResume(s.identity.uid, next, () => session === s);
      }
    } catch { s.pendingResume = null; publish(s, cloudWriteError); }
    finally { s.writingResume = false; publish(s); }
  }
  async function importGuest(data: GuestStudyData) {
    const s = session;
    if (!s || current.busy || s.imported) return;
    if (!ready(s)) { publish(s, cloudWriteError); return; }
    s.importing = true;
    publish(s, null);
    try {
      const backend = await load();
      if (session === s) {
        await backend.importMissing(s.identity.uid, {
          favorites: [...new Set(data.favorites.filter(options.validFavorite))],
          resumeId: data.resumeId && options.validResume(data.resumeId) ? data.resumeId : null,
        }, () => session === s);
        s.imported = true;
      }
    } catch {
      publish(s, 'Не все данные удалось импортировать. Уже сохранённые записи не будут перезаписаны при повторе.');
    } finally { s.importing = false; publish(s); }
  }

  return {
    getSnapshot: () => current,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    restore, prepareSignIn, cancelSignIn, signIn, signOut, retry, toggleFavorite, saveResume, importGuest,
  };
}

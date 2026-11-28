import { useEffect, useSyncExternalStore } from 'react';
import { getLesson } from '../data/lessons';
import { BEGINNER_CORE_IDS } from '../data/lessons/beginnerOrder';
import { createAccountSyncStore, guestAccountSnapshot } from './accountSyncStore';

const config = {
  apiKey: import.meta.env.VITE_NETOPS_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_NETOPS_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_NETOPS_FIREBASE_PROJECT_ID?.trim(),
  appId: import.meta.env.VITE_NETOPS_FIREBASE_APP_ID?.trim(),
};
const OPT_IN_KEY = 'osi_netops_account_sync_opt_in_v1';
let optedInMemory = false;
let optInWriteBlocked = false;
export const accountSyncEnabled = Object.values(config).every(Boolean);

const validLessonId = (id: string) => /^[a-z0-9][a-z0-9-]{0,95}$/.test(id) && !!getLesson(id);
export const accountSync = createAccountSyncStore({
  load: async () => {
    if (!accountSyncEnabled) throw new Error('Sync not configured');
    const { createFirebaseAccountBackend } = await import('./firebaseAccountBackend');
    return createFirebaseAccountBackend(config);
  },
  optedIn: () => {
    if (!accountSyncEnabled || typeof window === 'undefined') return false;
    if (optInWriteBlocked) return optedInMemory;
    try { return window.localStorage.getItem(OPT_IN_KEY) === '1'; }
    catch { return optedInMemory; }
  },
  setOptIn: optedIn => {
    optedInMemory = optedIn;
    try {
      if (optedIn) window.localStorage.setItem(OPT_IN_KEY, '1');
      else window.localStorage.removeItem(OPT_IN_KEY);
      optInWriteBlocked = false;
    } catch { optInWriteBlocked = true; }
  },
  validFavorite: validLessonId,
  validResume: id => BEGINNER_CORE_IDS.includes(id) && getLesson(id)?.difficulty === 'beginner',
});

export function useNetopsAccountSync() {
  const snapshot = useSyncExternalStore(accountSync.subscribe, accountSync.getSnapshot, () => guestAccountSnapshot);
  useEffect(() => { if (accountSyncEnabled) void accountSync.restore(); }, []);
  return snapshot;
}

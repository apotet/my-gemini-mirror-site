import { useSyncExternalStore } from 'react';

export const LESSON_FAVORITES_KEY = 'osi_knowledge_favorites_v1';
const CHANGE_EVENT = 'osi-knowledge-favorites-change';
const empty: readonly string[] = [];
let snapshot: readonly string[] = empty;
let lastRaw: string | null | undefined;
let memoryOnly = false;

export function getLessonFavorites(): readonly string[] {
  if (typeof window === 'undefined' || memoryOnly) return snapshot;
  try {
    const raw = window.localStorage.getItem(LESSON_FAVORITES_KEY);
    if (raw === lastRaw) return snapshot;
    lastRaw = raw;
    const value: unknown = raw ? JSON.parse(raw) : empty;
    snapshot = Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && id.length > 0))] : empty;
  } catch { snapshot = empty; }
  return snapshot;
}

export function toggleLessonFavorite(id: string) {
  const current = getLessonFavorites();
  const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
  const raw = JSON.stringify(next);
  try {
    window.localStorage.setItem(LESSON_FAVORITES_KEY, raw);
    memoryOnly = false;
  } catch { memoryOnly = true; }
  snapshot = next;
  lastRaw = raw;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === LESSON_FAVORITES_KEY || event.key === null) listener();
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useLessonFavorites() {
  return useSyncExternalStore(subscribe, getLessonFavorites, () => empty);
}

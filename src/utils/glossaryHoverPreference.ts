import { useSyncExternalStore } from 'react';

const KEY = 'netops_glossary_hover_v1';
const listeners = new Set<() => void>();
let initialized = false;
let enabled = false;
let inMemoryOnly = false;

function readPreference() {
  try { return window.localStorage.getItem(KEY) === '1'; }
  catch { return false; }
}

function getPreference() {
  if (!initialized && typeof window !== 'undefined') {
    enabled = readPreference();
    initialized = true;
  }
  return enabled;
}

function publish(value: boolean) {
  if (enabled === value) return;
  enabled = value;
  listeners.forEach(listener => listener());
}

function onStorage(event: StorageEvent) {
  if (inMemoryOnly) return;
  if (event.key !== KEY && event.key !== null) return;
  try {
    if (event.storageArea === window.localStorage) publish(readPreference());
  } catch { /* Storage can be unavailable; retain the current tab's choice. */ }
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    window.addEventListener('storage', onStorage);
    // Pick up changes made while no tooltip or switch was mounted.
    if (!inMemoryOnly) enabled = readPreference();
    initialized = true;
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

export function toggleGlossaryHover() {
  const next = !getPreference();
  try {
    window.localStorage.setItem(KEY, next ? '1' : '0');
    inMemoryOnly = false;
  } catch { inMemoryOnly = true; }
  publish(next);
}

export function useGlossaryHover() {
  return useSyncExternalStore(subscribe, getPreference, () => false);
}

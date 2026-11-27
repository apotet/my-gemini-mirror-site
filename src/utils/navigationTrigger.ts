export interface NavigationTrigger {
  element: HTMLElement;
  viewportTop: number;
}

export function captureNavigationTrigger(element: HTMLElement): NavigationTrigger {
  return { element, viewportTop: element.getBoundingClientRect().top };
}

/** Called after the destination's original DOM is visible again. */
export function restoreNavigationTrigger({ element, viewportTop }: NavigationTrigger) {
  if (!element.isConnected || !element.getClientRects().length) return;
  // On reflow/rotation the previous viewport position may now be offscreen.
  const inset = Math.max(72, Math.min(viewportTop, window.innerHeight - element.offsetHeight - 88));
  const delta = element.getBoundingClientRect().top - inset;
  window.scrollBy({ top: delta, behavior: 'instant' });
  element.focus({ preventScroll: true });
}

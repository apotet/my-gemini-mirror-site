import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GLOSSARY_TOOLTIPS } from '../data/glossary';
import { splitGlossaryText } from '../utils/glossaryText';
import { useGlossaryHover } from '../utils/glossaryHoverPreference';
import './GlossaryText.css';

const OPEN_EVENT = 'glossary-tooltip-open';

export function GlossaryText({ children, enabled = true, plainTerms = [], scope }: { children: string; enabled?: boolean; plainTerms?: string[]; scope?: "poe" | "poe-formula" | "ipv6" | "http" }) {
  const id = useId();
  const hoverEnabled = useGlossaryHover();
  const [shown, setShown] = useState<{ term: string; anchor: HTMLButtonElement; automatic: boolean } | null>(null);
  const active = shown && (hoverEnabled || !shown.automatic) ? shown : null;
  const popup = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelClose = () => clearTimeout(timer.current);
  const close = () => { cancelClose(); setShown(null); };
  const deferClose = () => {
    if (!active?.automatic) return;
    cancelClose();
    timer.current = setTimeout(() => setShown(null), 180);
  };
  const show = (term: string, anchor: HTMLButtonElement, automatic: boolean) => {
    cancelClose();
    if (automatic && active?.anchor === anchor && !active.automatic) return;
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
    setShown({ term, anchor, automatic });
  };

  useEffect(() => () => clearTimeout(timer.current), []);
  useLayoutEffect(() => {
    if (!hoverEnabled && shown?.automatic) close();
  }, [hoverEnabled, shown]);
  useLayoutEffect(() => {
    if (!active || !enabled || !popup.current) return;
    const element = popup.current;
    const anchor = active.anchor.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    element.style.width = `${width}px`;
    const height = element.getBoundingClientRect().height;
    element.style.left = `${Math.max(12, Math.min(anchor.left, window.innerWidth - width - 12))}px`;
    const top = anchor.bottom + 8 + height <= window.innerHeight - 12
      ? anchor.bottom + 8 : anchor.top - height - 8;
    element.style.top = `${Math.max(12, Math.min(top, window.innerHeight - height - 12))}px`;
    element.style.visibility = 'visible';

    const dismiss = (event: PointerEvent) => {
      if (!element.contains(event.target as Node) && !active.anchor.contains(event.target as Node)) close();
    };
    const keyboard = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    const otherTooltip = (event: Event) => { if ((event as CustomEvent).detail !== id) close(); };
    const scroll = (event: Event) => { if (!element.contains(event.target as Node)) close(); };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', keyboard);
    window.addEventListener(OPEN_EVENT, otherTooltip);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', scroll, true);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', keyboard);
      window.removeEventListener(OPEN_EVENT, otherTooltip);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', scroll, true);
    };
  }, [active, enabled, id]);

  if (!enabled) return <>{children}</>;
  const tooltip = active && GLOSSARY_TOOLTIPS[active.term];
  return <>
    {splitGlossaryText(children, scope).map((part, index) => part.term && !plainTerms.includes(part.term) ? (
      <button
        key={index}
        type="button"
        className="glossary-trigger"
        data-glossary-term={part.term}
        data-glossary-hover={hoverEnabled ? 'on' : undefined}
        aria-describedby={active?.anchor.dataset.glossaryIndex === `${index}` ? id : undefined}
        data-glossary-index={index}
        onPointerEnter={event => {
          if (hoverEnabled && (event.pointerType === 'mouse' || event.pointerType === 'pen') && event.buttons === 0) {
            show(part.term!, event.currentTarget, true);
          }
        }}
        onPointerLeave={event => {
          if (event.pointerType !== 'touch' && active?.anchor === event.currentTarget) deferClose();
        }}
        onFocus={event => {
          if (hoverEnabled && event.currentTarget.matches(':focus-visible')) show(part.term!, event.currentTarget, true);
        }}
        onBlur={close}
        onClick={event => {
          if (active?.anchor === event.currentTarget && !active.automatic) close();
          else show(part.term!, event.currentTarget, false);
        }}
      >{part.text}</button>
    ) : part.text)}
    {tooltip && createPortal(
      <div ref={popup} id={id} role="tooltip" className="glossary-tooltip"
        onPointerEnter={cancelClose} onPointerLeave={deferClose}>
        <strong lang="en">{tooltip.english}</strong>
        <span>{tooltip.russian}</span>
        <p>{tooltip.summary}</p>
      </div>, document.body,
    )}
  </>;
}

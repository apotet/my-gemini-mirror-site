import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LEVEL_NOTES } from '../data/levelNotes';
import { ZoomableImage } from './ZoomableImage';

const sectionId = (level: number) => `cheatsheet-l${level}`;

export const TheoryCheatsheets: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState(LEVEL_NOTES[0].level);
  const slotRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef(new Map<number, HTMLElement>());
  const navigationRef = useRef(0);
  const [panel, setPanel] = useState({ docked: false, top: 0, left: 0, width: 0, height: 52 });
  const [viewportHeight, setViewportHeight] = useState(0);
  const anchorOffset = panel.top + panel.height + 12;

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const nav = navRef.current;
    if (!slot || !nav) return;
    const header = document.querySelector('header');
    let frame = 0;
    const measure = () => {
      const rect = slot.getBoundingClientRect();
      const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom ?? 0);
      const top = Math.min(headerBottom, window.innerHeight - nav.offsetHeight);
      const next = {
        docked: rect.top <= top,
        top: Math.max(0, top),
        left: rect.left,
        width: rect.width,
        height: nav.offsetHeight,
      };
      setPanel(previous => Object.keys(next).every(key =>
        previous[key as keyof typeof next] === next[key as keyof typeof next]) ? previous : next);
      setViewportHeight(window.innerHeight);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; measure(); });
    };
    // Fixed positioning also works inside the app's overflow-x-hidden wrapper.
    const resize = new ResizeObserver(schedule);
    resize.observe(slot);
    resize.observe(nav);
    if (header) resize.observe(header);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    if (!viewportHeight) return;
    const top = Math.min(anchorOffset, viewportHeight - 1);
    const bandHeight = Math.max(1, (viewportHeight - top) * 0.35);
    const visible = new Set<number>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const level = Number((entry.target as HTMLElement).dataset.level);
        if (entry.isIntersecting) visible.add(level);
        else visible.delete(level);
      }
      const current = LEVEL_NOTES.filter(note => visible.has(note.level)).sort((a, b) =>
        Math.abs((sectionRefs.current.get(a.level)?.getBoundingClientRect().top ?? 0) - top) -
        Math.abs((sectionRefs.current.get(b.level)?.getBoundingClientRect().top ?? 0) - top))[0];
      if (current) setActiveLevel(current.level);
    }, {
      rootMargin: `-${top}px 0px -${Math.max(0, viewportHeight - top - bandHeight)}px 0px`,
      threshold: 0,
    });
    sectionRefs.current.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [anchorOffset, viewportHeight]);

  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>(`[href="#${sectionId(activeLevel)}"]`);
    if (!nav || !link) return;
    // Reveal the active link horizontally without moving the document vertically.
    if (link.offsetLeft < nav.scrollLeft || link.offsetLeft + link.offsetWidth > nav.scrollLeft + nav.clientWidth) {
      nav.scrollTo({ left: Math.max(0, link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }, [activeLevel, panel.width]);

  useEffect(() => {
    const cancelNavigation = () => { navigationRef.current++; };
    window.addEventListener('wheel', cancelNavigation, { passive: true });
    window.addEventListener('touchstart', cancelNavigation, { passive: true });
    window.addEventListener('keydown', cancelNavigation);
    return () => {
      cancelNavigation();
      window.removeEventListener('wheel', cancelNavigation);
      window.removeEventListener('touchstart', cancelNavigation);
      window.removeEventListener('keydown', cancelNavigation);
    };
  }, []);

  const scrollToLevel = (level: number) => {
    const navigation = ++navigationRef.current;
    const align = () => sectionRefs.current.get(level)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
    // Lazy posters above the target can change its position during the jump.
    const images = LEVEL_NOTES.filter(note => note.level <= level).flatMap(note => {
      const image = sectionRefs.current.get(note.level)?.querySelector('img');
      return image ? [image] : [];
    });
    images.forEach(image => { image.loading = 'eager'; });
    align();
    void Promise.all(images.map(image => image.decode().catch(() => undefined))).then(() => {
      if (navigationRef.current === navigation) {
        requestAnimationFrame(() => { if (navigationRef.current === navigation) align(); });
      }
    });
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      <div ref={slotRef} style={{ height: panel.height }}>
        <nav
          ref={navRef}
          aria-label="Навигация по шпаргалкам L1–L7"
          className="relative z-30 flex flex-nowrap gap-1.5 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-2 backdrop-blur-xl"
          style={panel.docked ? { position: 'fixed', top: panel.top, left: panel.left, width: panel.width } : undefined}
        >
          {LEVEL_NOTES.map(note => (
            <a
              key={note.level}
              href={`#${sectionId(note.level)}`}
              aria-current={activeLevel === note.level ? 'location' : undefined}
              onClick={event => { event.preventDefault(); scrollToLevel(note.level); }}
              className={`shrink-0 min-w-12 px-3 py-2 rounded-lg text-sm font-semibold text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-cyan-500 focus-visible:outline-offset-2 ${
                activeLevel === note.level
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              L{note.level}
            </a>
          ))}
        </nav>
      </div>

      {LEVEL_NOTES.map(note => (
        <section
          key={note.level}
          id={sectionId(note.level)}
          data-level={note.level}
          ref={element => {
            if (element) sectionRefs.current.set(note.level, element);
            else sectionRefs.current.delete(note.level);
          }}
          aria-labelledby={`${sectionId(note.level)}-heading`}
          style={{ scrollMarginTop: anchorOffset }}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 sm:p-5 space-y-4"
        >
          <h2 id={`${sectionId(note.level)}-heading`} className="text-lg font-bold text-slate-900 dark:text-white">{note.title}</h2>
          <ZoomableImage
            src={note.cheatWebp}
            alt={`Шпаргалка ${note.title}`}
            caption="Нажмите на картинку — откроется на весь экран с зумом"
            imgClassName="!max-h-none h-auto"
            fullscreenOnClick
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {note.sections.map(section => (
              <div
                key={section.title}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 space-y-1"
              >
                <div className="text-xs font-bold text-amber-700 dark:text-amber-300">{section.title}</div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{section.text}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

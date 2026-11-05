import React, { useEffect, useState } from 'react';
import { LEVEL_NOTES } from '../data/levelNotes';
import { ZoomableImage } from './ZoomableImage';

const sectionId = (level: number) => `cheatsheet-l${level}`;

export const TheoryCheatsheets: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState(LEVEL_NOTES[0].level);

  useEffect(() => {
    const nodes = LEVEL_NOTES.map((n) => document.getElementById(sectionId(n.level))).filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target as HTMLElement | undefined;
        const level = Number(top?.dataset.level);
        if (level) setActiveLevel(level);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.35, 0.6] }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const scrollToLevel = (level: number) => {
    setActiveLevel(level);
    document.getElementById(sectionId(level))?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-1 mb-6">
        <nav
          aria-label="Навигация по шпаргалкам L1–L7"
          className="flex gap-1.5 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#07111f]/95 p-2 backdrop-blur-xl"
        >
          {LEVEL_NOTES.map((note) => (
            <a
              key={note.level}
              href={`#${sectionId(note.level)}`}
              aria-current={activeLevel === note.level ? 'location' : undefined}
              onClick={(event) => {
                event.preventDefault();
                scrollToLevel(note.level);
              }}
              className={`shrink-0 min-w-12 px-3 py-2 rounded-lg text-sm font-semibold text-center transition-colors ${
                activeLevel === note.level
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              L{note.level}
            </a>
          ))}
        </nav>
      </div>

      <div className="space-y-16 sm:space-y-20">
        {LEVEL_NOTES.map((note) => (
          <section
            key={note.level}
            id={sectionId(note.level)}
            data-level={note.level}
            aria-labelledby={`${sectionId(note.level)}-heading`}
            style={{ scrollMarginTop: 132 }}
            className="scroll-mt-32"
          >
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-cyan-400 leading-none">
                L{note.level}
              </span>
              <h2
                id={`${sectionId(note.level)}-heading`}
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white pb-1"
              >
                {note.title.replace(/^L\d\s·\s/, '')}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/40 p-3 sm:p-5 space-y-4">
              <div className="mx-auto max-w-3xl">
                <ZoomableImage
                  src={note.cheatWebp}
                  alt={`Шпаргалка ${note.title}`}
                  caption="Нажмите на картинку — откроется на весь экран"
                  imgClassName="!max-h-none h-auto w-full"
                  fullscreenOnClick
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {note.sections.map((section) => (
                  <div
                    key={section.title}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-950/50"
                  >
                    <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-1">{section.title}</div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{section.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

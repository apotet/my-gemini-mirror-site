import { useEffect, useId, useRef, useState } from 'react';

/** Language status while the Russian interface is the only available locale. */
export function LanguageControl() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const statusId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  return (
    <div
      ref={root}
      className="relative"
      onBlur={event => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={event => {
        if (open && event.key === 'Escape') {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-describedby={open ? statusId : undefined}
        aria-label="Язык интерфейса: RU / ENG"
        className="inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-xl px-2 text-xs font-semibold text-slate-600 transition-colors cursor-pointer hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:text-slate-300 dark:hover:bg-white/10 dark:focus-visible:outline-cyan-400"
      >
        <span className="rounded-md bg-cyan-100 px-1 py-0.5 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200">RU</span>
        <span aria-hidden="true">/</span>
        <span lang="en">ENG</span>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 top-full z-10 mt-2 w-52 max-w-[calc(100vw-4rem)] space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <p><strong>Русский</strong> · текущий язык</p>
        <p id={statusId}><strong lang="en">English</strong> · материалы пока недоступны.</p>
      </div>
    </div>
  );
}

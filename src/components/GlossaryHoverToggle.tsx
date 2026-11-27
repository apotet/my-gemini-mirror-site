import { useId } from 'react';
import { toggleGlossaryHover, useGlossaryHover } from '../utils/glossaryHoverPreference';

export function GlossaryHoverToggle() {
  const enabled = useGlossaryHover();
  const hint = useId();
  return (
    <>
      <button type="button" role="switch" aria-checked={enabled} aria-describedby={hint} onClick={toggleGlossaryHover}
        className="inline-flex min-h-11 max-w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:outline-cyan-400">
        <span aria-hidden="true" className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 ${enabled ? 'justify-end bg-cyan-700 dark:bg-cyan-600' : 'justify-start bg-slate-500 dark:bg-slate-600'}`}>
          <span className="h-4 w-4 rounded-full bg-white" />
        </span>
        <span>Подсказки при наведении</span>
      </button>
      <span id={hint} className="sr-only">Автоматически при наведении или фокусе. Нажатие открывает подсказку при любой настройке.</span>
    </>
  );
}

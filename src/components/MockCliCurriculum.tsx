import { useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Terminal } from 'lucide-react';
import { CliLabShell } from '../cli-lab/CliLabShell';
import type { LabMode } from '../cli-lab/engine/types';
import { ciscoVlanAccessScenario } from '../cli-lab/scenarios/cisco-vlan-access';
import { ciscoTwoSwitchVlanScenario } from '../cli-lab/scenarios/cisco-two-switch-vlan';
import { ciscoTwoSwitchTrunkDiagnosticScenario } from '../cli-lab/scenarios/cisco-two-switch-trunk-diagnostics';
import { getLesson } from '../data/lessons';
import { captureNavigationTrigger, restoreNavigationTrigger, type NavigationTrigger } from '../utils/navigationTrigger';
import { LessonView } from './LessonView';

const levels = [
  { label: 'Начальный', scenario: ciscoVlanAccessScenario, lesson: 'l2-vlan', detail: 'Один коммутатор. Настройте access-порт и проверьте его VLAN.' },
  { label: 'Прикладной', scenario: ciscoTwoSwitchVlanScenario, lesson: 'cli-vlan-trunk', detail: 'Два коммутатора. Настройте передачу VLAN через trunk.' },
  { label: 'Продвинутый', scenario: ciscoTwoSwitchTrunkDiagnosticScenario, lesson: 'cli-trunk-vlan-diagnostics', detail: 'VLAN 10 работает, VLAN 20 нет. Найдите причину и устраните сбой.' },
] as const;

const modes: { id: LabMode; title: string; detail: string }[] = [
  { id: 'learn', title: 'С подсказками', detail: 'Шаги, цели и подсказки по запросу.' },
  { id: 'drill', title: 'Тренировка', detail: 'Условия и критерии. Порядок команд выбираете сами.' },
  { id: 'task', title: 'Задание', detail: 'Самостоятельная проверка. Без шагов и подсказок к решению.' },
];

const action = 'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-left text-sm font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600';
const primary = action + ' bg-cyan-700 text-white dark:bg-cyan-400 dark:text-slate-950';
const secondary = action + ' border border-slate-300 text-slate-800 dark:border-slate-600 dark:text-slate-200';

export function MockCliCurriculum() {
  const titleId = useId();
  const [level, setLevel] = useState(0);
  const [mode, setMode] = useState<LabMode>('learn');
  const [screen, setScreen] = useState<'catalog' | 'lesson' | 'scenario'>('catalog');
  const [fromLesson, setFromLesson] = useState(false);
  const catalogOrigin = useRef<NavigationTrigger | null>(null);
  const lessonOrigin = useRef<NavigationTrigger | null>(null);
  const pendingReturn = useRef<NavigationTrigger | null>(null);
  const selection = levels[level];
  const lesson = getLesson(selection.lesson);
  const modeChoice = modes.find(item => item.id === mode)!;

  useLayoutEffect(() => {
    if (pendingReturn.current) {
      restoreNavigationTrigger(pendingReturn.current);
      pendingReturn.current = null;
    }
  }, [screen]);

  const advance = (target: 'lesson' | 'scenario', trigger: HTMLButtonElement) => {
    const from = screen === 'lesson';
    if (from) lessonOrigin.current = captureNavigationTrigger(trigger);
    else catalogOrigin.current = captureNavigationTrigger(trigger);
    setFromLesson(from);
    setScreen(target);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const goBack = (target: 'lesson' | 'catalog') => {
    pendingReturn.current = target === 'lesson' ? lessonOrigin.current : catalogOrigin.current;
    setScreen(target);
  };

  return (
    <section aria-labelledby={titleId} className="mx-auto max-w-5xl space-y-4">
      <header className="rounded-2xl border border-cyan-500/35 bg-cyan-50 p-4 dark:bg-cyan-950/30 sm:p-5">
        <div className="text-xs font-semibold text-cyan-800 dark:text-cyan-200">Макет · CLI Lab 2.0</div>
        <h2 id={titleId} className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Темы и режимы CLI</h2>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Сложность меняет сценарий, режим меняет объём помощи. Команды и проверка целей работают на движке NetOps.</p>
      </header>

      <div hidden={screen !== 'catalog'} inert={screen !== 'catalog'} className="space-y-4">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:p-5" aria-label="Тема CLI">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Тема пилота</div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">VLAN и trunk</h3>
        </section>

        <fieldset className="min-w-0 space-y-2">
          <legend className="mb-2 font-semibold text-slate-900 dark:text-white">Сложность</legend>
          <div className="grid gap-2 md:grid-cols-3">
            {levels.map((item, index) => (
              <label key={item.scenario.id} className="flex min-h-11 cursor-pointer items-start gap-2 rounded-xl border border-slate-300 p-3 has-[:checked]:border-cyan-600 has-[:checked]:bg-cyan-50 dark:border-slate-700 dark:has-[:checked]:bg-cyan-950/30">
                <input className="mt-1 accent-cyan-600" type="radio" name={titleId + '-level'} checked={level === index}
                  onChange={() => {
                    setLevel(index);
                    if (!item.scenario.modesAllowed.includes(mode)) setMode(item.scenario.modesAllowed[0]);
                  }} />
                <span><strong className="block text-sm">{item.label}</strong><span className="block text-sm text-slate-600 dark:text-slate-300">{item.detail}</span></span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="min-w-0 space-y-2">
          <legend className="mb-2 font-semibold text-slate-900 dark:text-white">Режим</legend>
          <div className="grid gap-2 md:grid-cols-3">
            {modes.filter(item => selection.scenario.modesAllowed.includes(item.id)).map(item => (
              <label key={item.id} className="flex min-h-11 cursor-pointer items-start gap-2 rounded-xl border border-slate-300 p-3 has-[:checked]:border-cyan-600 has-[:checked]:bg-cyan-50 dark:border-slate-700 dark:has-[:checked]:bg-cyan-950/30">
                <input className="mt-1 accent-cyan-600" type="radio" name={titleId + '-mode'} checked={mode === item.id} onChange={() => setMode(item.id)} />
                <span><strong className="block text-sm">{item.title}</strong><span className="block text-sm text-slate-600 dark:text-slate-300">{item.detail}</span></span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className="space-y-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:p-5" aria-label="Выбранный сценарий">
          <h3 className="font-bold text-slate-900 dark:text-white">{selection.scenario.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{selection.label} · {modeChoice.title}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primary} onClick={event => advance('scenario', event.currentTarget)}>
              <Terminal className="size-4 shrink-0" aria-hidden="true" /> Открыть сценарий
            </button>
            {lesson && <button type="button" className={secondary} onClick={event => advance('lesson', event.currentTarget)}>
              <BookOpen className="size-4 shrink-0" aria-hidden="true" /> Связанный урок: {lesson.title}
            </button>}
          </div>
        </section>
      </div>

      {lesson && (screen === 'lesson' || (screen === 'scenario' && fromLesson)) && (
        <section hidden={screen !== 'lesson'} inert={screen !== 'lesson'} className="space-y-3" aria-label="Связанный урок в макете">
          <button type="button" className={secondary} onClick={() => goBack('catalog')}>
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" /> К выбору сценария
          </button>
          <LessonView lesson={lesson} onBack={() => goBack('catalog')} focusPathHeading />
          <button type="button" className={primary} onClick={event => advance('scenario', event.currentTarget)}>
            <Terminal className="size-4 shrink-0" aria-hidden="true" /> Открыть сценарий из урока
          </button>
        </section>
      )}

      {screen === 'scenario' && (
        <div className="space-y-3">
          <button type="button" className={secondary} onClick={() => goBack(fromLesson ? 'lesson' : 'catalog')}>
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" /> {fromLesson ? 'Вернуться к уроку' : 'К выбору сценария'}
          </button>
          <p className="text-sm text-slate-600 dark:text-slate-300">{selection.label} · {modeChoice.title}</p>
          <CliLabShell initialScenarioId={selection.scenario.id} curriculumPreviewMode={mode} />
        </div>
      )}
    </section>
  );
}

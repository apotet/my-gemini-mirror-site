import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TopologyPanel } from './components/TopologyPanel';
import { ExperimentalTopology } from './components/ExperimentalTopology';
import { resolveTopologyLayer, type TopologyLayerChoice } from './topologyLayers';
import { LabEngine } from './engine/LabEngine';
import { scenarioTheoryIds } from './scenarioTheory';
import { commandCatalogForScenario } from './vendors/cisco-ios/commandCatalog';
import { getLesson } from '../data/lessons';
import { LessonView } from '../components/LessonView';
import { evaluateGoals } from './engine/GoalEvaluator';
import { shouldShowCompletion } from './engine/completionStatus';
import { LabMode, Scenario } from './engine/types';
import { ciscoIosProfile } from './vendors/cisco-ios/profile';
import { ciscoIosCommands } from './vendors/cisco-ios/commands';
import { ciscoVlanAccessScenario } from './scenarios/cisco-vlan-access';
import { ciscoAccessSviFollowupScenario } from './scenarios/cisco-access-svi-followup';
import { ciscoIosModesScenario } from './scenarios/cisco-ios-modes';
import { ciscoL3GatewayScenario } from './scenarios/cisco-l3-gateway';
import { ciscoTrunkScenario } from './scenarios/cisco-trunk';
import { ciscoTwoSwitchVlanScenario } from './scenarios/cisco-two-switch-vlan';
import { ciscoTwoSwitchSviScenario } from './scenarios/cisco-two-switch-svi';
import { ciscoThreeSwitchMissingVlanScenario } from './scenarios/cisco-three-switch-missing-vlan';
import { ciscoTwoSwitchTrunkDiagnosticScenario } from './scenarios/cisco-two-switch-trunk-diagnostics';
import { ciscoFourSwitchHostRingScenario } from './scenarios/cisco-four-switch-host-ring';
import { ciscoShowDiagnosticScenario } from './scenarios/cisco-show-diagnostic';
import {
  Terminal as TerminalIcon,
  RotateCcw,
  CheckCircle2,
  Circle,
  HelpCircle,
  ChevronRight,
  Cpu,
  BookOpen,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface HistoryLine {
  type: 'input' | 'output' | 'system';
  prompt?: string;
  text: string;
  error?: boolean;
}

const SCENARIOS: Scenario[] = [
  ciscoIosModesScenario,
  ciscoShowDiagnosticScenario,
  ciscoVlanAccessScenario,
  ciscoAccessSviFollowupScenario,
  ciscoTrunkScenario,
  ciscoL3GatewayScenario,
  ciscoTwoSwitchVlanScenario,
  ciscoTwoSwitchSviScenario,
  ciscoThreeSwitchMissingVlanScenario,
  ciscoTwoSwitchTrunkDiagnosticScenario,
  ciscoFourSwitchHostRingScenario,
];

function goalLabel(g: Scenario['goals'][number]): string {
  switch (g.type) {
    case 'ipv4.hostReachable':
      return `ПК ${g.fromHost} ↔ ${g.toHost}: IP/VLAN/L2-доступность`;
    case 'stp.bridgePriority':
      return `${g.device.toUpperCase()}: CST приоритет ${g.priority}`;
    case 'ipv4.sviReachable':
      return `${g.device.toUpperCase()}: SVI IPv4-путь к ${g.destination}`;
    case 'l2.vlanReachable':
      return `VLAN ${g.vlanId}: ${g.fromDevice} ${g.fromIf} ↔ ${g.toDevice} ${g.toIf} (L2-путь)`;
    case 'config.saved':
      return `${g.device.toUpperCase()}: конфигурация сохранена`;
    case 'vlan.exists':
      return `VLAN ${g.vlanId}${g.name ? ` (${g.name})` : ''}`;
    case 'if.accessVlan':
      return `${g.ifName} access VLAN ${g.vlanId}`;
    case 'if.switchportMode':
      return `${g.ifName} mode ${g.mode}`;
    case 'if.admin':
      return `${g.ifName} admin ${g.up ? 'up' : 'down'}`;
    case 'if.ipv4':
      return `${g.ifName} ${g.address}/${g.prefix}`;
    case 'hostname':
      return `hostname ${g.hostname}`;
    case 'route.exists':
      return `route ${g.prefix}/${g.prefixLen}${g.nextHop ? ` via ${g.nextHop}` : ''}`;
    case 'if.trunkAllowed':
      return `${g.ifName} trunk allowed ${g.vlans.join(',')}`;
    case 'mode':
      return `режим: ${g.modes.join('|')}`;
    case 'privilege':
      return `privilege ≥ ${g.min}`;
    default:
      return 'goal';
  }
}

export const CliLabShell: React.FC<{ initialScenarioId?: string; experimentalTopology?: boolean }> = ({ initialScenarioId, experimentalTopology = true }) => {
  const [scenarioId, setScenarioId] = useState(() =>
    SCENARIOS.find(scenario => scenario.id === initialScenarioId)?.id ?? SCENARIOS[0].id
  );
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const [labMode, setLabMode] = useState<LabMode>('learn');
  const [history, setHistory] = useState<HistoryLine[]>([]);
  const [input, setInput] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [theoryLessonId, setTheoryLessonId] = useState<string | null>(null);
  const [commandCatalogOpen, setCommandCatalogOpen] = useState(false);
  const [commandCatalogQuery, setCommandCatalogQuery] = useState('');
  const [completed, setCompleted] = useState(false);
  const [goalResults, setGoalResults] = useState<ReturnType<typeof evaluateGoals> | null>(null);
  const [tick, setTick] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(scenario.initialState.activeDeviceId);
  const [fullscreen, setFullscreen] = useState(false);
  const [topologyCollapsed, setTopologyCollapsed] = useState(false);
  const [topologyLayerChoice, setTopologyLayerChoice] = useState<TopologyLayerChoice>('auto');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const stepIndexRef = useRef(0);
  const completedRef = useRef(false);

  // Toolbar buttons take DOM focus; return it to the CLI input after layout updates.
  // Keep the existing input text and caret intact when only changing layout.
  const focusCliInput = () => {
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  const engine = useMemo(() => {
    return new LabEngine(ciscoIosProfile, ciscoIosCommands, structuredClone(scenario.initialState));
  }, [scenario]);

  const refreshGoals = () => {
    const result = evaluateGoals(engine.getState(), scenario.goals);
    setGoalResults(result);
    return result;
  };

  const resetLab = () => {
    engine.reset(structuredClone(scenario.initialState));
    const first = scenario.steps?.[0];
    const intro = `${scenario.title}\n${scenario.description}\n\nVendor: ${ciscoIosProfile.displayName} (documented subset).\nType ? for commands. Tab completes. ↑↓ — history. Mode: ${labMode}`;
    const stepLine =
      labMode === 'learn' && first
        ? `\n—— Шаг 1 / ${scenario.steps!.length} ——\n${first.instruction}`
        : '';
    setHistory([{ type: 'system', text: intro + stepLine }]);
    setStepIndex(0);
    stepIndexRef.current = 0;
    setHintOpen(false);
    setCompleted(false);
    completedRef.current = false;
    setGoalResults(null);
    setInput('');
    setHistIndex(null);
    setTick((t) => t + 1);
    setSelectedDeviceId(scenario.initialState.activeDeviceId);
    // Do not focus the offscreen CLI on entry or mode/scenario switch:
    // browsers scroll the entire page down to reveal its caret.
  };

  useEffect(() => {
    resetLab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labMode, scenarioId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) setFullscreen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [fullscreen]);

  const toggleCable = (index: number) => {
    if (!scenario.allowLinkToggle) return;
    const link = engine.getState().links[index];
    if (!link || !engine.setLinkState(index, !link.up)) return;
    setTick(t => t + 1);
    setGoalResults(null);
    setCompleted(false);
    completedRef.current = false;
    setHistory(h => [...h, { type: 'system', text: `Кабель ${index + 1}: ${link.up ? 'отключён' : 'восстановлен'}. Пересчитай CST и проверь пути.` }]);
  };
  const switchConsole = (id: string) => {
    if (!engine.selectDevice(id)) return;
    setSelectedDeviceId(id);
    setInput('');
    setHistIndex(null);
    setHistory((h) => [...h, { type: 'system', text: `— Консоль ${engine.getState().devices[id].hostname} —` }]);
    focusCliInput();
  };

  const steps = scenario.steps ?? [];

  const tryAdvanceLearnStep = () => {
    if (labMode !== 'learn') return;
    const idx = stepIndexRef.current;
    const current = steps[idx];
    if (!current?.accept?.length) return;

    const state = engine.getState();
    const { allPassed } = evaluateGoals(state, current.accept);
    if (!allPassed) return;

    const next = idx + 1;
    setHintOpen(false);

    if (next >= steps.length) {
      stepIndexRef.current = next;
      setStepIndex(next);
      setHistory((h) => [
        ...h,
        {
          type: 'system',
          text: `✓ Шаг выполнен. ${current.explanation || ''}`,
        },
      ]);
      return;
    }

    const nextStep = steps[next];
    const nextLine = nextStep
      ? `\n—— Шаг ${next + 1} / ${steps.length} ——\n${nextStep.instruction}`
      : '';
    stepIndexRef.current = next;
    setStepIndex(next);
    setHistory((h) => [
      ...h,
      {
        type: 'system',
        text: `✓ Шаг выполнен. ${current.explanation || ''}${nextLine}`,
      },
    ]);
  };

  const runCheck = () => {
    const result = refreshGoals();
    const prev = completedRef.current;
    const now = shouldShowCompletion(labMode, stepIndexRef.current, steps.length, result.allPassed);
    setCompleted(now);
    completedRef.current = now;
    setHistory((h) => [
      ...h,
      {
        type: 'system',
        text: now
          ? `✓ ${scenario.successMessage}`
          : prev
            ? `Статус завершения снят: цели больше не выполнены.\nПроверка: ${result.results.filter((r) => r.passed).length}/${result.results.length} целей.`
            : scenario.diagnostic
              ? `Проверка: ${result.results.filter((r) => r.passed).length}/${result.results.length} целей. Продолжайте диагностику по всем узлам: статус портов, VLAN, trunk и сохранение изменений.`
              : `Проверка: ${result.results.filter((r) => r.passed).length}/${result.results.length} целей.\n` +
                result.results.map((r) => `${r.passed ? '✓' : '✗'} ${r.detail}`).join('\n'),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '?') {
      // Cisco contextual help appears immediately without Enter and does not
      // modify the input line, running configuration, or command history.
      e.preventDefault();
      const prompt = engine.getPrompt();
      const help = engine.help(input + '?');
      setHistory((h) => [...h,
        { type: 'input', prompt, text: input + '?' },
        { type: 'output', text: help },
      ]);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const result = engine.complete(input);
      if (result.completed != null) {
        setInput(result.completed);
        return;
      }
      if (result.candidates.length > 1) {
        setHistory((h) => [
          ...h,
          {
            type: 'system',
            text: result.candidates.join('  '),
          },
        ]);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const next =
        histIndex === null ? cmdHistory.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(next);
      setInput(cmdHistory[next] ?? '');
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIndex === null) return;
      if (histIndex >= cmdHistory.length - 1) {
        setHistIndex(null);
        setInput('');
        return;
      }
      const next = histIndex + 1;
      setHistIndex(next);
      setInput(cmdHistory[next] ?? '');
      return;
    }
  };

  const submitLine = () => {
    const line = input;
    if (!line.trim()) return;
    const prompt = engine.getPrompt();
    const result = engine.execute(line);
    setHistory((h) => [
      ...h,
      { type: 'input', prompt, text: line },
      ...(result.output
        ? [{ type: 'output' as const, text: result.output, error: result.error }]
        : []),
    ]);
    if (line.trim().endsWith('?')) {
      requestAnimationFrame(() => inputRef.current?.focus());
      setInput(line.slice(0, -1));
      return;
    }
    setCmdHistory((prev) => {
      if (prev[prev.length - 1] === line) return prev;
      return [...prev, line].slice(-80);
    });
    setHistIndex(null);
    setInput('');
    setTick((t) => t + 1);

    refreshGoals();

    tryAdvanceLearnStep();

    // Success status in every mode is driven exclusively by overall goals.
    // A later command that breaks any goal immediately clears it; restoring goals re-shows it.
    {
      const g = engine.checkGoals(scenario.goals);
      const now = shouldShowCompletion(labMode, stepIndexRef.current, steps.length, g.allPassed);
      const prev = completedRef.current;
      if (now !== prev) {
        setCompleted(now);
        completedRef.current = now;
        setGoalResults(g);
        if (now) {
          setHistory((h) => [...h, { type: 'system', text: `✓ ${scenario.successMessage}` }]);
        } else if (prev) {
          setHistory((h) => [...h, { type: 'system', text: 'Статус завершения снят: цели больше не выполнены.' }]);
        }
      } else {
        setGoalResults(g);
      }
    }

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const modes: LabMode[] = ['learn', 'drill', 'task'];
  void tick;
  const currentStep = steps[stepIndex];
  const effectiveTopologyLayer = resolveTopologyLayer(topologyLayerChoice, scenario);
  const lessonChoices = scenarioTheoryIds(scenario.id, labMode === 'learn' && currentStep ? stepIndex : undefined)
    .map(id => getLesson(id))
    .filter((lesson): lesson is NonNullable<typeof lesson> => !!lesson);
  const allLessonChoices = scenarioTheoryIds(scenario.id).map(id => getLesson(id))
    .filter((lesson): lesson is NonNullable<typeof lesson> => !!lesson);
  const activeTheoryLesson = theoryLessonId ? getLesson(theoryLessonId) : undefined;
  const commandGroups = commandCatalogForScenario(scenario);
  const openTheory = (id: string) => {
    if (!getLesson(id)) return;
    setTheoryLessonId(id);
  };
  const closeTheory = () => {
    setTheoryLessonId(null);
    focusCliInput();
  };

  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[60] h-[100dvh] w-screen bg-slate-950 p-3 sm:p-4 overflow-hidden flex flex-col gap-3'
          : 'space-y-4 max-w-5xl mx-auto'
      }
    >
      {activeTheoryLesson && (
        <div className="fixed inset-0 z-[90] bg-slate-950/85 p-2 sm:p-5 flex items-center justify-center" role="presentation">
          <section role="dialog" aria-modal="true" aria-label={`Теория: ${activeTheoryLesson.title}`}
            className="w-full max-w-3xl max-h-[92dvh] flex flex-col rounded-2xl border border-cyan-500/30 bg-white dark:bg-[#091524] shadow-2xl overflow-hidden">
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3 gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-cyan-600 dark:text-cyan-300 uppercase">Теория к заданию</div>
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{scenario.title}</div>
              </div>
              <button type="button" onClick={closeTheory}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 cursor-pointer">
                <X className="w-4 h-4" /> Вернуться в CLI
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
              <LessonView key={activeTheoryLesson.id} lesson={activeTheoryLesson}
                onBack={closeTheory} onOpenLesson={openTheory} />
            </div>
          </section>
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-500" />
            CLI Lab 2.0
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {ciscoIosProfile.displayName} · проверка по состоянию · Tab · ↑↓ history
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => setCommandCatalogOpen(v => !v)}
            aria-expanded={commandCatalogOpen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
            <TerminalIcon className="w-3.5 h-3.5" /> {commandCatalogOpen ? 'Скрыть команды' : 'Команды Cisco'}
          </button>
          {allLessonChoices.length > 0 && (
            <button type="button" onClick={() => openTheory(lessonChoices[0]?.id ?? allLessonChoices[0].id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/50 px-2.5 py-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-300 cursor-pointer"
              title="Читать теорию без выхода из лаборатории">
              <BookOpen className="w-3.5 h-3.5" /> Теория по заданию
            </button>
          )}
          {fullscreen && (
            <button
              type="button"
              onClick={() => { setSidebarCollapsed((v) => !v); focusCliInput(); }}
              aria-pressed={sidebarCollapsed}
              className="rounded-lg border border-cyan-600/60 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-900/40"
            >
              {sidebarCollapsed ? 'Показать задание' : 'Скрыть задание'}
            </button>
          )}
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setLabMode(m); focusCliInput(); }}
              className={
                labMode === m
                  ? 'px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide cursor-pointer bg-cyan-500 text-slate-950'
                  : 'px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {commandCatalogOpen && (
        <section aria-label="Справочник доступных команд Cisco CLI Lab"
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 p-3 space-y-2 text-xs text-slate-700 dark:text-slate-200">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <strong>Исполняемые команды нашего Cisco IOS Lab</strong>
            <input type="search" aria-label="Поиск команды" value={commandCatalogQuery}
              onChange={event => setCommandCatalogQuery(event.target.value)}
              placeholder="Поиск: show, vlan, trunk, stp…"
              className="min-w-[180px] flex-1 max-w-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1.5" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Это не полный Cisco IOS. Синтаксис показывает основу команды; аргументы смотри через ? в консоли.
            Рекомендации связаны только с общей темой задания, не подсказывают скрытую неисправность.
          </p>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {([
              ['По теме', commandGroups.recommended],
              ['Другие диагностические', commandGroups.otherDiagnostics],
              ['Другие команды', commandGroups.otherCommands],
            ] as const).map(([name, commands]) => {
              const query = commandCatalogQuery.trim().toLowerCase();
              const visible = commands.filter(item => !query ||
                [item.syntax, item.explanation, ...item.topics].join(' ').toLowerCase().includes(query));
              return visible.length ? (
                <div key={name} className="space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wide text-cyan-700 dark:text-cyan-300">{name}</div>
                  {visible.map(item => (
                    <div key={item.id} className="flex flex-wrap gap-x-3 gap-y-0.5 border-b border-slate-100 dark:border-slate-800 py-1">
                      <code className="font-mono font-semibold text-slate-900 dark:text-white">{item.syntax}</code>
                      <span>{item.explanation}</span>
                      <span className="text-slate-500 dark:text-slate-400">[{item.modes.join(', ')}]</span>
                    </div>
                  ))}
                </div>
              ) : null;
            })}
          </div>
        </section>
      )}

      <div className={fullscreen ? 'flex shrink-0 flex-nowrap gap-2 max-h-[12dvh] overflow-x-auto overflow-y-hidden' : 'flex flex-wrap gap-2'}>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={scenarioId === s.id}
            onClick={() => { setScenarioId(s.id); focusCliInput(); }}
            className={
              scenarioId === s.id
                ? 'px-3 py-1.5 rounded-xl text-xs font-semibold border border-cyan-500 bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 cursor-pointer'
                : 'px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer'
            }
          >
            {s.title}
          </button>
        ))}
      </div>

      {Object.values(engine.getState().devices).filter(d => d.vendor === 'cisco-ios').length > 1 && (
        <div className={fullscreen ? 'flex shrink-0 flex-nowrap items-center gap-2 overflow-x-auto max-h-[9dvh]' : 'flex flex-wrap items-center gap-2'} aria-label="Выбор консоли устройства">
          <span className="text-xs text-slate-500 dark:text-slate-400">Консоль:</span>
          {Object.values(engine.getState().devices).filter(d => d.vendor === 'cisco-ios').map((device) => (
            <button key={device.id} type="button" onClick={() => switchConsole(device.id)}
              aria-pressed={selectedDeviceId === device.id}
              className={selectedDeviceId === device.id
                ? 'rounded-lg border border-cyan-500 bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-200'
                : 'rounded-lg border border-slate-400/40 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300'}>
              {device.hostname}
            </button>
          ))}
          <span className="text-xs text-slate-500 dark:text-slate-400">{engine.getState().links.map((link) => `${link.a.toUpperCase()} ${link.aIf.replace('FastEthernet', 'Fa')} ↔ ${link.b.toUpperCase()} ${link.bIf.replace('FastEthernet', 'Fa')}`).join(' · ')} · модель конфигурации L2</span>
        </div>
      )}

      {!fullscreen && engine.getState().links.length > 0 && Object.keys(engine.getState().devices).length > 1 && (
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center gap-1.5 pb-2" role="group" aria-label="Слой сетевой топологии">
          {([
            ['auto', 'Авто'],
            ['phy', 'Физика'],
            ['vlan', 'VLAN'],
            ['stp', 'STP'],
            ['ip', 'IP'],
          ] as const).map(([value, label]) => (
            <button key={value} type="button"
              aria-pressed={topologyLayerChoice === value}
              onClick={() => setTopologyLayerChoice(value)}
              className={topologyLayerChoice === value
                ? 'rounded-lg bg-cyan-500 px-2 py-1 text-[11px] font-semibold text-slate-950'
                : 'rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300'}>
              {label}
            </button>
          ))}
          {topologyLayerChoice === 'auto' && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {effectiveTopologyLayer.toUpperCase()}
            </span>
          )}
        </div>
        {experimentalTopology ? (
          <ExperimentalTopology
            layer={effectiveTopologyLayer}
            state={engine.getState()}
            activeDeviceId={selectedDeviceId}
            onSelectDevice={switchConsole}
            onToggleLink={scenario.allowLinkToggle ? toggleCable : undefined}
            collapsed={topologyCollapsed}
            onToggleCollapse={() => { setTopologyCollapsed(v => !v); focusCliInput(); }}
          />
        ) : (
          <TopologyPanel
            layer={effectiveTopologyLayer}
            state={engine.getState()}
            activeDeviceId={selectedDeviceId}
            onSelectDevice={switchConsole}
            onToggleLink={scenario.allowLinkToggle ? toggleCable : undefined}
            collapsed={topologyCollapsed}
            onToggleCollapse={() => { setTopologyCollapsed(v => !v); focusCliInput(); }}
          />
        )}
        </div>
      )}

      <div
        className={
          fullscreen
            ? sidebarCollapsed
              ? 'grid flex-1 min-h-0 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-3 w-full overflow-hidden'
              : 'relative grid flex-1 min-h-0 grid-cols-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[minmax(0,4fr)_minmax(240px,1fr)] gap-3 w-full overflow-hidden'
            : 'grid grid-cols-1 lg:grid-cols-3 gap-4'
        }
      >
        <div className={fullscreen ? 'min-w-0 min-h-0 h-full flex flex-col' : 'lg:col-span-2 flex flex-col gap-3'}>

          <div
            className={
              fullscreen
                ? 'min-w-0 min-h-0 h-full rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 overflow-hidden shadow-xl flex flex-col'
                : 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-950 text-slate-100 overflow-hidden shadow-xl flex flex-col min-h-[420px] flex-1'
            }
          >
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <TerminalIcon className="w-3.5 h-3.5" />
              {scenario.id}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setFullscreen((v) => !v); setSidebarCollapsed(true); focusCliInput(); }}
                className="inline-flex text-xs text-slate-400 hover:text-white items-center gap-1 cursor-pointer"
                title={fullscreen ? 'Выйти из полного экрана (Esc)' : 'Полный экран'}
              >
                {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                {fullscreen ? 'Окно' : 'Полный экран'}
              </button>
              <button
                type="button"
                onClick={resetLab}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Сброс
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className={`flex-1 min-h-0 overflow-y-auto p-3 font-mono leading-relaxed space-y-1 ${fullscreen ? 'text-[14px] sm:text-base' : 'text-[12px]'}`}
          >
            {history.map((h, i) => (
              <div
                key={i}
                className={
                  h.error
                    ? 'text-rose-300 whitespace-pre-wrap'
                    : h.type === 'system'
                      ? 'text-amber-200/90 whitespace-pre-wrap'
                      : 'whitespace-pre-wrap'
                }
              >
                {h.type === 'input' ? (
                  <span>
                    <span className="text-emerald-400">{h.prompt} </span>
                    <span className="text-white">{h.text}</span>
                  </span>
                ) : (
                  h.text
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitLine();
            }}
            className="min-w-0 border-t border-slate-800 bg-slate-900/90 px-2 sm:px-3 py-2 flex items-center gap-1.5 sm:gap-2"
          >
            <span className="font-mono text-[11px] sm:text-[12px] text-emerald-400 shrink-0 max-w-[42%] truncate">
              {engine.getPrompt()}
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-0 bg-transparent border-0 outline-none font-mono text-[12px] text-white placeholder:text-slate-600"
              placeholder="command… (Tab · ↑↓ · ?)"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="shrink-0 text-cyan-400 hover:text-cyan-300 cursor-pointer"
              aria-label="Submit"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
          </div>
        </div>

        {(!fullscreen || !sidebarCollapsed) && <div className={fullscreen ? 'absolute inset-0 z-10 min-w-0 space-y-3 overflow-y-auto rounded-xl bg-slate-950 p-2 lg:static lg:p-0 lg:pr-1 lg:bg-transparent lg:overflow-y-auto lg:min-h-0' : 'space-y-3'}>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Сценарий
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">{scenario.title}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {scenario.description}
            </p>
            {allLessonChoices.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Не получается? Открой тему — прогресс сохранится:</p>
                <div className="flex flex-wrap gap-1.5">
                  {allLessonChoices.map(lesson => (
                    <button key={lesson.id} type="button" onClick={() => openTheory(lesson.id)}
                      className="rounded-lg border border-cyan-500/30 px-2 py-1 text-left text-[11px] text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10 cursor-pointer">
                      {lesson.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {labMode === 'learn' && currentStep && !completed && (
            <div className="rounded-2xl border border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/30 p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-mono">
                Шаг {stepIndex + 1} / {steps.length}
              </div>
              <p className="text-sm text-slate-900 dark:text-white leading-relaxed">
                {currentStep.instruction}
              </p>
              {lessonChoices.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lessonChoices.map(lesson => (
                    <button key={lesson.id} type="button" onClick={() => openTheory(lesson.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 px-2 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 cursor-pointer">
                      <BookOpen className="w-3.5 h-3.5" /> Читать: {lesson.title}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => { setHintOpen((v) => !v); focusCliInput(); }}
                className="text-xs text-cyan-700 dark:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {hintOpen ? 'Скрыть подсказку' : 'Подсказка'}
              </button>
              {hintOpen && currentStep.hint && (
                <p className="text-xs font-mono text-cyan-800 dark:text-cyan-200 bg-white/50 dark:bg-black/30 rounded-lg px-2 py-1.5">
                  {currentStep.hint}
                </p>
              )}
            </div>
          )}

          {labMode === 'learn' && stepIndex >= steps.length && !completed && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-2" role="status">
              <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
                Шаги пройдены, но не все цели выполнены
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200">
                Проверьте конфигурацию, исправьте невыполненные цели и повторите проверку.
                Последний шаг не означает завершение задания.
              </p>
              <button type="button" onClick={runCheck}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 cursor-pointer">
                Проверить цели
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Цели
              </div>
              {(labMode === 'task' || labMode === 'drill' || (labMode === 'learn' && stepIndex >= steps.length && !completed)) && (
                <button
                  type="button"
                  onClick={runCheck}
                  className="text-[11px] font-bold px-2 py-1 rounded-lg bg-cyan-500 text-slate-950 cursor-pointer"
                >
                  Проверить
                </button>
              )}
            </div>
            <ul className="space-y-1.5">
              {(goalResults?.results ?? scenario.goals.map((g) => ({
                predicate: g,
                passed: false,
                detail: goalLabel(g),
              }))).map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                >
                  {r.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <span>{scenario.diagnostic && scenario.publicGoalLabels?.[i] ? scenario.publicGoalLabels[i] : r.detail}</span>
                </li>
              ))}
            </ul>
            {completed && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                  {scenario.successMessage}
                </p>
                {scenario.nextScenarioId && SCENARIOS.some(s => s.id === scenario.nextScenarioId) && (
                  <button
                    type="button"
                    onClick={() => { setScenarioId(scenario.nextScenarioId!); focusCliInput(); }}
                    className="w-full rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 cursor-pointer hover:bg-cyan-400"
                  >
                    Следующее задание: {SCENARIOS.find(s => s.id === scenario.nextScenarioId)?.title}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Режимы</p>
            <p>
              <span className="font-mono text-cyan-600 dark:text-cyan-400">learn</span> — пошагово с
              подсказками · <span className="font-mono text-cyan-600 dark:text-cyan-400">drill</span> —
              свободная практика · <span className="font-mono text-cyan-600 dark:text-cyan-400">task</span> — только цели,
              проверка по кнопке или автоматически.
            </p>
            <p className="mt-2">
              Сокращения интерфейсов: <span className="font-mono">fa0/1</span>,{' '}
              <span className="font-mono">gi0/0</span>. Из config: <span className="font-mono">do show …</span>
            </p>
          </div>
        </div>}
      </div>
    </div>
  );
};

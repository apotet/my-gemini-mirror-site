import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LabEngine } from './engine/LabEngine';
import { evaluateGoals } from './engine/GoalEvaluator';
import { LabMode, Scenario } from './engine/types';
import { ciscoIosProfile } from './vendors/cisco-ios/profile';
import { ciscoIosCommands } from './vendors/cisco-ios/commands';
import { ciscoVlanAccessScenario } from './scenarios/cisco-vlan-access';
import {
  Terminal as TerminalIcon,
  RotateCcw,
  CheckCircle2,
  Circle,
  HelpCircle,
  ChevronRight,
  Cpu,
} from 'lucide-react';

interface HistoryLine {
  type: 'input' | 'output' | 'system';
  prompt?: string;
  text: string;
  error?: boolean;
}

const SCENARIOS: Scenario[] = [ciscoVlanAccessScenario];

export const CliLabShell: React.FC = () => {
  const scenario = SCENARIOS[0];
  const [labMode, setLabMode] = useState<LabMode>('learn');
  const [history, setHistory] = useState<HistoryLine[]>([]);
  const [input, setInput] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [goalResults, setGoalResults] = useState<ReturnType<typeof evaluateGoals> | null>(null);

  const engineRef = useRef<LabEngine | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const engine = useMemo(() => {
    const e = new LabEngine(ciscoIosProfile, ciscoIosCommands, structuredClone(scenario.initialState));
    engineRef.current = e;
    return e;
  }, [scenario]);

  const resetLab = () => {
    engine.reset(structuredClone(scenario.initialState));
    setHistory([
      {
        type: 'system',
        text: `${scenario.title}\n${scenario.description}\n\nVendor: ${ciscoIosProfile.displayName} (documented subset only). Type ? for commands. Mode: ${labMode}`,
      },
    ]);
    setStepIndex(0);
    setHintOpen(false);
    setCompleted(false);
    setGoalResults(null);
    setInput('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    resetLab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const steps = scenario.steps ?? [];
  const currentStep = steps[stepIndex];

  const tryAdvanceLearnStep = () => {
    if (labMode !== 'learn' || !currentStep) return;
    const state = engine.getState();
    const device = state.devices[state.activeDeviceId];

    // Mode-aware early steps
    if (currentStep.id === 's1') {
      if (device.privilege >= 15 && device.modeCtx.mode === 'privileged') {
        setStepIndex((i) => i + 1);
        setHintOpen(false);
        setHistory((h) => [
          ...h,
          { type: 'system', text: `✓ Шаг выполнен. ${currentStep.explanation || ''}` },
        ]);
      }
      return;
    }
    if (currentStep.id === 's2') {
      if (device.modeCtx.mode === 'config' || device.modeCtx.mode === 'config-if' || device.modeCtx.mode === 'config-vlan') {
        setStepIndex((i) => i + 1);
        setHintOpen(false);
        setHistory((h) => [
          ...h,
          { type: 'system', text: `✓ Шаг выполнен. ${currentStep.explanation || ''}` },
        ]);
      }
      return;
    }

    if (currentStep.accept.length === 0) return;
    const { allPassed } = evaluateGoals(state, currentStep.accept);
    if (allPassed) {
      const next = stepIndex + 1;
      setHintOpen(false);
      setHistory((h) => [
        ...h,
        { type: 'system', text: `✓ Шаг выполнен. ${currentStep.explanation || ''}` },
      ]);
      if (next >= steps.length) {
        setCompleted(true);
        setGoalResults(evaluateGoals(state, scenario.goals));
      } else {
        setStepIndex(next);
      }
    }
  };

  const runCheck = () => {
    const result = engine.checkGoals(scenario.goals);
    setGoalResults(result);
    setCompleted(result.allPassed);
    setHistory((h) => [
      ...h,
      {
        type: 'system',
        text: result.allPassed
          ? `✓ ${scenario.successMessage}`
          : `Проверка: ${result.results.filter((r) => r.passed).length}/${result.results.length} целей.\n` +
            result.results.map((r) => `${r.passed ? '✓' : '✗'} ${r.detail}`).join('\n'),
      },
    ]);
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
    setInput('');
    tryAdvanceLearnStep();

    // Auto-check goals in task/exam after each command
    if (labMode === 'task' || labMode === 'exam') {
      const g = engine.checkGoals(scenario.goals);
      if (g.allPassed) {
        setCompleted(true);
        setGoalResults(g);
        setHistory((h) => [...h, { type: 'system', text: `✓ ${scenario.successMessage}` }]);
      }
    }
  };

  const modes: LabMode[] = ['learn', 'drill', 'task', 'exam'];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-500" />
            CLI Lab 2.0
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {ciscoIosProfile.displayName} · только документированный subset команд · проверка по состоянию устройства
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setLabMode(m)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide cursor-pointer ${
                labMode === m
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Terminal */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-950 text-slate-100 overflow-hidden shadow-xl flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <TerminalIcon className="w-3.5 h-3.5" />
              {scenario.id}
            </div>
            <button
              type="button"
              onClick={resetLab}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Сброс
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed space-y-1">
            {history.map((h, i) => (
              <div key={i} className={h.error ? 'text-rose-300' : h.type === 'system' ? 'text-amber-200/90 whitespace-pre-wrap' : 'whitespace-pre-wrap'}>
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
            className="border-t border-slate-800 bg-slate-900/90 px-3 py-2 flex items-center gap-2"
          >
            <span className="font-mono text-[12px] text-emerald-400 shrink-0">{engine.getPrompt()}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none font-mono text-[12px] text-white placeholder:text-slate-600"
              placeholder="command…"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="text-cyan-400 hover:text-cyan-300 cursor-pointer" aria-label="Submit">
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Coach / goals */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Сценарий</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">{scenario.title}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{scenario.description}</p>
          </div>

          {labMode === 'learn' && currentStep && !completed && (
            <div className="rounded-2xl border border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/30 p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-mono">
                Шаг {stepIndex + 1} / {steps.length}
              </div>
              <p className="text-sm text-slate-900 dark:text-white leading-relaxed">{currentStep.instruction}</p>
              {labMode !== 'exam' && (
                <button
                  type="button"
                  onClick={() => setHintOpen((v) => !v)}
                  className="text-xs text-cyan-700 dark:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {hintOpen ? 'Скрыть подсказку' : 'Подсказка'}
                </button>
              )}
              {hintOpen && currentStep.hint && (
                <p className="text-xs font-mono text-cyan-800 dark:text-cyan-200 bg-white/50 dark:bg-black/30 rounded-lg px-2 py-1.5">
                  {currentStep.hint}
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Цели</div>
              {(labMode === 'task' || labMode === 'exam' || labMode === 'drill') && (
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
              {(goalResults?.results ??
                scenario.goals.map((g) => ({
                  predicate: g,
                  passed: false,
                  detail:
                    g.type === 'vlan.exists'
                      ? `VLAN ${g.vlanId}${g.name ? ` (${g.name})` : ''}`
                      : g.type === 'if.accessVlan'
                        ? `${g.ifName} access VLAN ${g.vlanId}`
                        : g.type === 'if.switchportMode'
                          ? `${g.ifName} mode ${g.mode}`
                          : g.type === 'if.admin'
                            ? `${g.ifName} admin up`
                            : g.type,
                }))).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  {r.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <span>{r.detail}</span>
                </li>
              ))}
            </ul>
            {completed && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 pt-1">{scenario.successMessage}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed">
            Поддерживается: enable, conf t, hostname, vlan, name, interface Fa0/1,
            switchport mode access, switchport access vlan, shutdown / no shutdown,
            show vlan brief, show ip interface brief, show running-config, exit, end, ?
          </div>
        </div>
      </div>
    </div>
  );
};

export default CliLabShell;

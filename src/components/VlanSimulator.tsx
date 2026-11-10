import React, { useState } from 'react';
import { Layers, RotateCcw, ShieldCheck, AlertTriangle, ArrowRight, ArrowLeft, Cable, Info, ChevronDown, ChevronUp } from 'lucide-react';

type Vlan = 10 | 20;
type HostId = 'pc1' | 'pc2' | 'pc3' | 'pc4';
type TrunkConfig = { left: Vlan[]; right: Vlan[] };
type L3Role = 'none' | 'SW1' | 'SW2';
type CaseId = 'explore' | 'access' | 'trunk';
type Result = { delivered: boolean; message: string; explanation: string; tagged: boolean; crossed: boolean };
type TraceStep = { title: string; detail: string; x: number; y: number; tagged: boolean; dropped?: boolean };
type Trace = { steps: TraceStep[]; outcome: Result; vlan: Vlan };

const HOSTS: { id: HostId; name: string; switchId: 'SW1' | 'SW2'; port: string; x: number; y: number }[] = [
  { id: 'pc1', name: 'PC-01', switchId: 'SW1', port: 'Fa0/1', x: 10, y: 16 },
  { id: 'pc2', name: 'PC-02', switchId: 'SW1', port: 'Fa0/2', x: 10, y: 122 },
  { id: 'pc3', name: 'PC-03', switchId: 'SW2', port: 'Fa0/1', x: 522, y: 16 },
  { id: 'pc4', name: 'PC-04', switchId: 'SW2', port: 'Fa0/2', x: 522, y: 122 },
];
const INITIAL_VLANS: Record<HostId, Vlan> = { pc1: 10, pc2: 20, pc3: 10, pc4: 20 };
const INITIAL_TRUNKS: TrunkConfig = { left: [10, 20], right: [10, 20] };

function evaluate(source: HostId, target: HostId, vlans: Record<HostId, Vlan>, trunks: TrunkConfig, l3: L3Role): Result {
  if (source === target) return {
    delivered: false, crossed: false, tagged: false,
    message: 'Выбран один и тот же конечный узел',
    explanation: 'Выбери два разных ПК. На этом стенде моделируем пересылку между различными конечными узлами.',
  };
  const a = HOSTS.find(host => host.id === source)!;
  const b = HOSTS.find(host => host.id === target)!;
  const vlan = vlans[source];
  const crossed = a.switchId !== b.switchId;
  if (vlan !== vlans[target]) {
    if (l3 === 'none') return {
      delivered: false, crossed, tagged: false,
      message: 'Между VLAN нет маршрутизации',
      explanation: `VLAN ${vlan} и VLAN ${vlans[target]} — разные широковещательные домены. В этой топологии нет L3-шлюза с SVI и ip routing.`,
    };
    const sourceRemote = a.switchId !== l3;
    const targetRemote = b.switchId !== l3;
    const badVlans = ([sourceRemote ? vlan : null, targetRemote ? vlans[target] : null] as (Vlan | null)[])
      .filter((v): v is Vlan => v !== null && (!trunks.left.includes(v) || !trunks.right.includes(v)));
    if (badVlans.length) return {
      delivered: false, crossed: true, tagged: true,
      message: `Маршрутизация прервана: VLAN ${badVlans.join(', ')} не проходит trunk`,
      explanation: `Для связи через SVI на ${l3} VLAN источника должна доходить до L3-шлюза, а VLAN получателя — до его access-порта. На обоих концах trunk должны быть разрешены VLAN, которые фактически проходят линк. Заблокированы: ${badVlans.join(', ')}.`,
    };
    return {
      delivered: true, crossed: sourceRemote || targetRemote, tagged: sourceRemote || targetRemote,
      message: `Между VLAN ${vlan} и ${vlans[target]} выполнена L3-маршрутизация на ${l3}`,
      explanation: `Хост передаёт IP-пакет своему шлюзу SVI VLAN ${vlan} на ${l3}. Коммутатор L3 маршрутизирует пакет в VLAN ${vlans[target]}, уменьшает TTL, формирует новый Ethernet-кадр и доставляет его получателю. Для простоты IP-шлюзы, ARP и маршруты уже настроены.`,
    };
  }
  if (crossed && (!trunks.left.includes(vlan) || !trunks.right.includes(vlan))) return {
    delivered: false, crossed, tagged: true,
    message: `VLAN ${vlan} не разрешена на всём trunk-пути`,
    explanation: `SW1 и SW2 должны оба пропускать VLAN ${vlan} на своих trunk-портах. SW1: [${trunks.left.join(', ') || 'нет'}], SW2: [${trunks.right.join(', ') || 'нет'}]. На каком-то участке кадр будет отфильтрован. Проверь allowed VLAN на обоих концах.`,
  };
  return {
    delivered: true, crossed, tagged: crossed,
    message: crossed ? `Кадр VLAN ${vlan} доставлен через trunk` : `Кадр доставлен внутри VLAN ${vlan}`,
    explanation: crossed
      ? `Кадр принят untagged на access-порту SW1/SW2, внутри коммутатора отнесён к VLAN ${vlan} и передан по trunk с тегом 802.1Q (VID=${vlan}). На выходном access-порту другого коммутатора тег удаляется. Здесь моделируем известный unicast-адрес назначения; MAC learning и flooding не симулируются.`
      : `Оба access-порта находятся на ${a.switchId} в VLAN ${vlan}. Тег 802.1Q не нужен на проводе к конечным ПК. Здесь предполагается известный MAC назначения.`,
  };
}
function buildTrace(source: HostId, target: HostId, vlans: Record<HostId, Vlan>, trunks: TrunkConfig, l3: L3Role): Trace {
  const outcome = evaluate(source, target, vlans, trunks, l3);
  const a = HOSTS.find(host => host.id === source)!;
  const b = HOSTS.find(host => host.id === target)!;
  const sourceSwitch = a.switchId === 'SW1' ? { x: 254, y: 98 } : { x: 396, y: 98 };
  const targetSwitch = b.switchId === 'SW1' ? { x: 254, y: 98 } : { x: 396, y: 98 };
  const vlan = vlans[source];
  const steps: TraceStep[] = [
    { title: `${a.name} формирует Ethernet-кадр`, detail: `ПК отправляет обычный нетегированный Ethernet-кадр через ${a.port}. При связи между VLAN MAC назначения — шлюз SVI; IP назначения остаётся адресом конечного ПК.`, x: a.x + 45, y: a.y + 30, tagged: false },
    { title: `${a.switchId} принимает кадр на access-порту`, detail: `Кадр пришёл на ${a.port}. Access VLAN порта — ${vlan}. Коммутатор относит кадр к VLAN ${vlan} и определяет следующий узел по MAC назначения.`, ...sourceSwitch, tagged: false },
  ];
  if (source === target) {
    steps.push({ title: 'Передача отменена', detail: outcome.explanation, ...sourceSwitch, tagged: false, dropped: true });
    return { steps, outcome, vlan };
  }
  if (vlans[source] !== vlans[target]) {
    if (l3 === 'none') {
      steps.push({ title: 'Нет маршрутизатора между VLAN', detail: 'У ПК разные IP-подсети. Шлюза SVI в топологии нет, поэтому трафик между VLAN не маршрутизируется.', ...sourceSwitch, tagged: false, dropped: true });
      return { steps, outcome, vlan };
    }
    const l3Point = l3 === 'SW1' ? { x: 254, y: 98 } : { x: 396, y: 98 };
    const dstVlan = vlans[target];
    const bridge = (id: Vlan, from: 'SW1' | 'SW2', to: 'SW1' | 'SW2'): boolean => {
      const startPoint = from === 'SW1' ? { x: 254, y: 98 } : { x: 396, y: 98 };
      const endPoint = to === 'SW1' ? { x: 254, y: 98 } : { x: 396, y: 98 };
      const startSide = from === 'SW1' ? 'left' : 'right';
      const endSide = to === 'SW1' ? 'left' : 'right';
      if (!trunks[startSide].includes(id)) {
        steps.push({ title: 'VLAN заблокирована на исходящем trunk', detail: `На ${from} порт Gi0/1 не разрешает VLAN ${id}. Кадр не выйдет в trunk.`, ...startPoint, tagged: false, dropped: true });
        return false;
      }
      steps.push({ title: `По trunk передаётся VLAN ${id}`, detail: `Внешний Ethernet-кадр идёт с тегом IEEE 802.1Q VID=${id}. IP-пакет внутри сохраняет адреса источника и назначения.`, x: 325, y: 98, tagged: true });
      if (!trunks[endSide].includes(id)) {
        steps.push({ title: 'VLAN заблокирована на входящем trunk', detail: `На ${to} Gi0/1 не разрешает VLAN ${id}; кадр отбрасывается при приёме.`, ...endPoint, tagged: true, dropped: true });
        return false;
      }
      steps.push({ title: `${to} получает кадр VLAN ${id}`, detail: `Trunk принимает кадр VID ${id} и сохраняет его VLAN-контекст.`, ...endPoint, tagged: true });
      return true;
    };
    if (a.switchId !== l3 && !bridge(vlan, a.switchId, l3)) return { steps, outcome, vlan };
    steps.push({ title: `${l3}: маршрутизация через SVI`, detail: `IP-пакет адресован другому VLAN. Шлюз SVI VLAN ${vlan} на ${l3} принимает Ethernet-кадр, проверяет маршрут, уменьшает TTL и создаёт новый Ethernet-кадр для VLAN ${dstVlan}. MAC-адреса новой оболочки отличаются.`, ...l3Point, tagged: false });
    if (b.switchId !== l3 && !bridge(dstVlan, l3, b.switchId)) return { steps, outcome, vlan };
    steps.push({ title: 'Выходной access-порт: кадр без тега', detail: `На ${b.switchId} порт ${b.port} относится к VLAN ${dstVlan}. После L3-маршрутизации конечный ПК получает кадр без 802.1Q.`, ...targetSwitch, tagged: false });
    steps.push({ title: `IP-пакет доставлен на ${b.name}`, detail: outcome.explanation, x: b.x + 45, y: b.y + 30, tagged: false });
    return { steps, outcome, vlan };
  }
  if (a.switchId !== b.switchId) {
    const firstSide = a.switchId === 'SW1' ? 'left' : 'right';
    const otherSide = firstSide === 'left' ? 'right' : 'left';
    if (!trunks[firstSide].includes(vlan)) {
      steps.push({ title: 'Отброшен на исходящем trunk', detail: `На ${a.switchId} VLAN ${vlan} отсутствует в allowed VLAN порта Gi0/1. Кадр не отправляется по trunk.`, ...sourceSwitch, tagged: false, dropped: true });
      return { steps, outcome, vlan };
    }
    steps.push({ title: 'Добавлен тег IEEE 802.1Q', detail: `На исходящем trunk Gi0/1 коммутатор передаёт кадр с тегом: TPID 0x8100, VID ${vlan}, PCP 0, DEI 0. На access-порту этого тега не было.`, x: 325, y: 98, tagged: true });
    if (!trunks[otherSide].includes(vlan)) {
      steps.push({ title: 'Отброшен на входящем trunk', detail: `Кадр дошёл до Gi0/1 коммутатора ${b.switchId}, но VLAN ${vlan} не разрешена на его trunk-порту. До конечного ПК кадр не дойдёт.`, ...targetSwitch, tagged: true, dropped: true });
      return { steps, outcome, vlan };
    }
    steps.push({ title: `${b.switchId} принимает тегированный кадр`, detail: `Входящий Gi0/1 пропускает VLAN ${vlan}. Коммутатор сохраняет VLAN-контекст и определяет выходной access-порт ${b.port}.`, ...targetSwitch, tagged: true });
    steps.push({ title: '802.1Q тег удалён перед access-портом', detail: `При выходе из ${b.port} кадр отправляется к ПК без тега. VLAN ${vlan} существует внутри L2-сегмента, но обычный конечный ПК получает untagged Ethernet.`, x: (targetSwitch.x + b.x + 45) / 2, y: (targetSwitch.y + b.y + 30) / 2, tagged: false });
  } else {
    steps.push({ title: 'Коммутатор выбирает выходной access-порт', detail: `Оба ПК подключены к ${a.switchId}, их порты принадлежат VLAN ${vlan}. Trunk между коммутаторами не используется, тег 802.1Q на кабеле к ПК не нужен.`, ...sourceSwitch, tagged: false });
  }
  steps.push({ title: `Кадр доставлен на ${b.name}`, detail: outcome.explanation, x: b.x + 45, y: b.y + 30, tagged: false });
  return { steps, outcome, vlan };
}

const frameClass = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1929] p-4 sm:p-5 shadow-sm';
const activeButton = 'bg-cyan-500 text-slate-950 border-cyan-500';
const idleButton = 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-cyan-400';

export const VlanSimulator: React.FC = () => {
  const [mode, setMode] = useState<CaseId>('explore');
  const [vlans, setVlans] = useState<Record<HostId, Vlan>>(INITIAL_VLANS);
  const [trunks, setTrunks] = useState<TrunkConfig>(INITIAL_TRUNKS);
  const [l3Role, setL3Role] = useState<L3Role>('none');
  const [source, setSource] = useState<HostId>('pc1');
  const [target, setTarget] = useState<HostId>('pc3');
  const [result, setResult] = useState<Result | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [trace, setTrace] = useState<Trace | null>(null);
  const [traceStep, setTraceStep] = useState(0);

  const reset = (nextMode: CaseId = mode) => {
    setMode(nextMode);
    setVlans({ ...INITIAL_VLANS });
    setL3Role('none');
    setTrunks(nextMode === 'trunk' ? { left: [10, 20], right: [10] } : { left: [10, 20], right: [10, 20] });
    setSource(nextMode === 'access' ? 'pc1' : nextMode === 'trunk' ? 'pc2' : 'pc1');
    setTarget(nextMode === 'access' ? 'pc2' : nextMode === 'trunk' ? 'pc4' : 'pc3');
    setResult(null); setAttempts(0); setCompleted(false); setTrace(null); setTraceStep(0); setShowSettings(false);
  };
  const changeVlan = (host: HostId, vlan: Vlan) => {
    setVlans(previous => ({ ...previous, [host]: vlan }));
    setResult(null); setTrace(null); setCompleted(false);
  };
  const toggleAllowed = (side: 'left' | 'right', vlan: Vlan) => {
    setTrunks(previous => ({
      ...previous,
      [side]: previous[side].includes(vlan)
        ? previous[side].filter(item => item !== vlan)
        : [...previous[side], vlan].sort((a, b) => a - b),
    }));
    setResult(null); setTrace(null); setCompleted(false);
  };
  const simulate = () => {
    const next = buildTrace(source, target, vlans, trunks, l3Role);
    setTrace(next);
    setTraceStep(0);
    setResult(null);
    setCompleted(false);
    setAttempts(n => n + 1);
  };
  const changeStep = (step: number) => {
    if (!trace) return;
    const next = Math.max(0, Math.min(trace.steps.length - 1, step));
    setTraceStep(next);
    if (next === trace.steps.length - 1) {
      setResult(trace.outcome);
      if (trace.outcome.delivered && mode !== 'explore') setCompleted(true);
    } else {
      setResult(null);
      setCompleted(false);
    }
  };
  const sourceData = HOSTS.find(host => host.id === source)!;
  const targetData = HOSTS.find(host => host.id === target)!;
  const sourceVlan = vlans[source];
  const activeTraceStep = trace?.steps[traceStep];

  return (
    <section className="mx-auto max-w-6xl space-y-4" aria-label="Лаборатория VLAN и Trunk">
      <div className={frameClass}>
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">Практика · L2 / L3 · 802.1Q</span>
        <h2 className="text-xl sm:text-2xl font-black mt-1 text-slate-900 dark:text-white">VLAN & Trunk: лаборатория передачи кадров</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Два коммутатора, четыре ПК, trunk и переключаемая роль L3. Исследуй передачу кадров внутри VLAN и маршрутизацию между VLAN через SVI.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {([
            ['explore', 'Свободная практика'],
            ['access', 'Дело №3 · Чужая VLAN'],
            ['trunk', 'Дело №4 · Пропавший trunk'],
          ] as const).map(([id, name]) => (
            <button key={id} type="button" onClick={() => reset(id)} aria-pressed={mode === id}
              className={`min-h-10 rounded-lg border px-3 py-2 text-xs sm:text-sm font-semibold ${mode === id ? activeButton : idleButton}`}>{name}</button>
          ))}
        </div>
      </div>

      {mode !== 'explore' && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-600/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-slate-800 dark:text-amber-100">
          <div className="font-bold flex gap-2 items-center"><AlertTriangle className="w-4 h-4" /> {mode === 'access' ? 'Дело №3 · Чужая VLAN' : 'Дело №4 · Пропавший trunk'}</div>
          <p className="mt-2">{mode === 'access'
            ? 'PC-01 не может обмениваться кадрами с PC-02, хотя оба подключены к SW1. Изучи access VLAN портов и восстанови передачу.'
            : 'PC-02 (SW1) не может связаться с PC-04 (SW2), оба работают в VLAN 20. На первый взгляд линк между коммутаторами есть. Найди ошибку в разрешённых VLAN.'}</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-amber-200">Найди причину по параметрам портов. Схема не отмечает ошибочный участок до диагностики.</p>
        </div>
      )}

      <div className={frameClass}>
        <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
          <h3 className="font-bold text-slate-900 dark:text-white">Карта сети</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Нажми на ПК в карточках ниже, чтобы выбрать участников передачи</span>
        </div>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 650 198" className="w-full min-w-[550px] h-auto" role="img" aria-label="PC-01 и PC-02 подключены к SW1; PC-03 и PC-04 к SW2; коммутаторы соединены trunk 802.1Q">
            <rect x="2" y="4" width="306" height="188" rx="13" className="fill-cyan-50 dark:fill-cyan-950/25 stroke-cyan-300 dark:stroke-cyan-700/70" strokeDasharray="5 4"/>
            <rect x="342" y="4" width="306" height="188" rx="13" className="fill-indigo-50 dark:fill-blue-950/25 stroke-indigo-300 dark:stroke-blue-700/70" strokeDasharray="5 4"/>
            <text x="14" y="18" fontSize="11" className="fill-slate-600 dark:fill-slate-300">SW1 · сеть доступа</text>
            <text x="354" y="18" fontSize="11" className="fill-slate-600 dark:fill-slate-300">SW2 · сеть доступа</text>
            <path d="M100 43 L204 88 M100 149 L204 108 M446 88 L522 43 M446 108 L522 149" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2.5" fill="none"/>
            <path d="M304 98 H346" strokeWidth="5" className="stroke-amber-500 dark:stroke-amber-400"/>
            <text x="325" y="80" textAnchor="middle" fontSize="10" fontWeight="bold" className="fill-amber-700 dark:fill-amber-300">802.1Q</text>
            <defs>
              <linearGradient id="netops-device-blue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#38bdf8"/>
                <stop offset="1" stopColor="#2563eb"/>
              </linearGradient>
              <linearGradient id="netops-device-slate" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#64748b"/>
                <stop offset="1" stopColor="#1e293b"/>
              </linearGradient>
            </defs>
            {[{ id: 'SW1', x: 254 }, { id: 'SW2', x: 396 }].map(sw => (
              <g key={sw.id} transform={`translate(${sw.x}, 88)`}>
                {/* Equipment-shaped switch chassis, visible RJ45 ports and uplink LEDs. */}
                <path d="M-38 -12 L26 -12 L39 -3 L39 18 L-38 18 Z" fill="url(#netops-device-slate)" stroke="#94a3b8" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M26 -12 L39 -3 L26 1 L-38 1 L-38 -12 Z" fill="#64748b" opacity=".7"/>
                {[-28, -15, -2, 11].map(x => <g key={x}>
                  <rect x={x} y="6" width="9" height="7" rx="1" fill="#0f172a" stroke="#7dd3fc" strokeWidth=".8"/>
                  <path d={`M${x+2} 8 V11 M${x+5} 8 V11`} stroke="#bae6fd" strokeWidth=".8"/>
                </g>)}
                <circle cx="28" cy="9" r="2.5" fill="#4ade80"/>
                <circle cx="34" cy="9" r="1.7" fill="#fbbf24"/>
                {l3Role === sw.id && <g>
                  <circle cx="0" cy="-5" r="10" fill="#0e7490" stroke="#a5f3fc" strokeWidth="1.5"/>
                  <path d="M-6 -5 H6 M2 -9 L6 -5 L2 -1 M-2 -1 L-6 -5 L-2 -9" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </g>}
                <text x="0" y="35" textAnchor="middle" fontSize="13" fontWeight="bold" className="fill-slate-900 dark:fill-white">{sw.id}</text>
                <text x="0" y="47" textAnchor="middle" fontSize="10" className="fill-slate-600 dark:fill-slate-300">{l3Role === sw.id ? 'L3 · SVI 10/20' : 'L2 switch'}</text>
              </g>
            ))}
            {HOSTS.map(host => (
              <g key={host.id} transform={`translate(${host.x + 45}, ${host.y + 26})`}>
                {/* Desktop workstation silhouette: monitor, stand and keyboard. */}
                <path d="M-21 -17 H21 Q24 -17 24 -14 V8 Q24 11 21 11 H-21 Q-24 11 -24 8 V-14 Q-24 -17 -21 -17 Z"
                  fill="url(#netops-device-blue)" stroke="#0e7490" strokeWidth="1.5"/>
                <path d="M-19 -13 H19 V5 H-19 Z" fill="#dbeafe" stroke="#0284c7" strokeWidth="1"/>
                <path d="M-18 3 H18 V5 H-18 Z" fill="#7dd3fc"/>
                <path d="M-4 11 V17 M4 11 V17 M-12 18 H12" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M-20 21 H20 L24 25 H-24 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1"/>
                <text x="0" y="39" textAnchor="middle" fontSize="12" fontWeight="bold" className="fill-slate-900 dark:fill-white">{host.name}</text>
                <text x="0" y="51" textAnchor="middle" fontSize="10" className="fill-slate-600 dark:fill-slate-300">VLAN {vlans[host.id]}</text>
                {(source === host.id || target === host.id) && (
                  <circle cx="27" cy="-15" r="5" fill={source === host.id ? '#0891b2' : '#8b5cf6'} stroke="white" strokeWidth="1.5"/>
                )}
              </g>
            ))}
            <text x="325" y="151" textAnchor="middle" fontSize="10" className="fill-slate-600 dark:fill-slate-300">Gi0/1 ↔ Gi0/1</text>
            {activeTraceStep && (
              <g key={traceStep} transform={`translate(${activeTraceStep.x} ${activeTraceStep.y})`} aria-label={`Шаг ${traceStep + 1}: ${activeTraceStep.title}`}>
                <circle r="16" fill={activeTraceStep.dropped ? '#e11d48' : '#0891b2'} stroke="white" strokeWidth="2.5"/>
                <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{activeTraceStep.dropped ? '×' : activeTraceStep.tagged ? 'TAG' : 'L2'}</text>
              </g>
            )}
          </svg>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Цвет подсети обозначает область схемы, не VLAN или состояние линка. VLAN определяются настройками access-портов.</p>
      </div>

      <div className={frameClass + ' space-y-3'}>
        <button type="button" aria-expanded={showSettings} onClick={() => setShowSettings(v => !v)}
          className="flex w-full items-center justify-between gap-3 text-left min-h-10">
          <span className="font-bold text-slate-900 dark:text-white">Настройки стенда · L2/L3, access VLAN и trunk</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
            {showSettings ? 'Свернуть' : 'Настроить'} {showSettings ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
          </span>
        </button>
        <p className="text-xs text-slate-600 dark:text-slate-300">Источник: {sourceData.name} · Получатель: {targetData.name}. Настройки доступны в любой момент; при изменении текущая трассировка сбрасывается.</p>
        {showSettings && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/60">
            <p className="font-bold text-sm text-slate-900 dark:text-white">Роль коммутаторов</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {([['none', 'Оба L2'], ['SW1', 'SW1 = L3'], ['SW2', 'SW2 = L3']] as const).map(([role, label]) => (
                <button key={role} type="button" aria-pressed={l3Role === role}
                  onClick={() => { setL3Role(role); setTrace(null); setResult(null); setCompleted(false); }}
                  className={`rounded-lg px-3 min-h-10 text-xs sm:text-sm font-semibold border ${l3Role === role ? activeButton : idleButton}`}>{label}</button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Режим L3: выбранный коммутатор имеет SVI для VLAN 10/20 и включённый ip routing. Для учебного упрощения шлюзы на ПК, маршруты и ARP заранее настроены. Между SW1 и SW2 остаётся trunk L2; одновременно активен один L3-шлюз.</p>
          </div>
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
        <div className={frameClass + ' space-y-3'}>
          <h3 className="font-bold text-slate-900 dark:text-white">Access-порты и конечные устройства</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {HOSTS.map(host => (
              <div key={host.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm text-slate-900 dark:text-white">{host.name}</strong>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{host.switchId} · {host.port}</span>
                </div>
                <div className="flex gap-2">
                  {([10, 20] as const).map(vlan => (
                    <button key={vlan} type="button" onClick={() => changeVlan(host.id, vlan)}
                      aria-pressed={vlans[host.id] === vlan}
                      className={`flex-1 min-h-9 rounded-lg border text-xs font-bold ${vlans[host.id] === vlan ? activeButton : idleButton}`}>VLAN {vlan}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setSource(host.id); setResult(null); setTrace(null); setCompleted(false); }} aria-pressed={source === host.id}
                    className={`flex-1 rounded-md border min-h-9 text-xs font-semibold ${source === host.id ? activeButton : idleButton}`}>Источник</button>
                  <button type="button" onClick={() => { setTarget(host.id); setResult(null); setTrace(null); setCompleted(false); }} aria-pressed={target === host.id}
                    className={`flex-1 rounded-md border min-h-9 text-xs font-semibold ${target === host.id ? activeButton : idleButton}`}>Получатель</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={frameClass + ' space-y-3'}>
          <div className="flex gap-2 items-center"><Cable className="w-4 h-4 text-amber-600 dark:text-amber-300"/><h3 className="font-bold text-slate-900 dark:text-white">Trunk Gi0/1 · allowed VLAN</h3></div>
          <p className="text-xs text-slate-600 dark:text-slate-300">Разрешённые VLAN на каждом конце линка. Для передачи между SW1 и SW2 VLAN должна быть разрешена с обеих сторон.</p>
          {(['left', 'right'] as const).map(side => (
            <div key={side} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3">
              <strong className="text-sm text-slate-900 dark:text-white">{side === 'left' ? 'SW1 · Gi0/1' : 'SW2 · Gi0/1'}</strong>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {([10, 20] as const).map(vlan => (
                  <label key={vlan} className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer min-h-9">
                    <input type="checkbox" checked={trunks[side].includes(vlan)} onChange={() => toggleAllowed(side, vlan)}
                      className="accent-cyan-600 w-4 h-4"/> VLAN {vlan}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 p-3">
            <p>switchport mode trunk</p>
            <p>switchport trunk allowed vlan {trunks.left.join(',') || 'none'} <span className="font-sans opacity-70">· SW1</span></p>
            <p>switchport trunk allowed vlan {trunks.right.join(',') || 'none'} <span className="font-sans opacity-70">· SW2</span></p>
          </div>
        </div>
          </div>
        </div>
        )}
      </div>

      <div className={frameClass + ' space-y-3'}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Пошаговая передача кадра</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{sourceData.name} (VLAN {sourceVlan}) <ArrowRight className="inline w-4 h-4"/> {targetData.name} (VLAN {vlans[target]})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => reset()} className={`rounded-lg border min-h-11 px-3 font-semibold text-sm inline-flex items-center gap-2 ${idleButton}`}><RotateCcw className="w-4 h-4"/> Сброс</button>
            <button type="button" onClick={simulate} className="rounded-lg min-h-11 px-4 font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 inline-flex items-center gap-2"><Layers className="w-4 h-4"/> Начать передачу</button>
          </div>
        </div>
        {trace && activeTraceStep && (
          <div className="rounded-xl border border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 p-4 space-y-3" aria-live="polite">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-cyan-800 dark:text-cyan-200">Шаг {traceStep + 1} из {trace.steps.length}</span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{activeTraceStep.tagged ? `802.1Q · VID ${trace.vlan}` : 'Untagged Ethernet'}</span>
            </div>
            <input type="range" min="0" max={trace.steps.length - 1} step="1" value={traceStep} onChange={event => changeStep(Number(event.target.value))}
              className="w-full accent-cyan-600" aria-label="Шаг передачи кадра"/>
            <h4 className="font-bold text-slate-900 dark:text-white">{activeTraceStep.title}</h4>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{activeTraceStep.detail}</p>
            <div className="flex items-center justify-between gap-2">
              <button type="button" disabled={traceStep === 0} onClick={() => changeStep(traceStep - 1)}
                className={`min-h-11 px-3 rounded-lg border text-sm font-semibold disabled:opacity-40 inline-flex gap-1 items-center ${idleButton}`}><ArrowLeft className="w-4 h-4"/> Назад</button>
              <button type="button" disabled={traceStep === trace.steps.length - 1} onClick={() => changeStep(traceStep + 1)}
                className="min-h-11 px-4 rounded-lg bg-cyan-500 text-slate-950 font-bold text-sm disabled:opacity-40 inline-flex gap-1 items-center">Следующий шаг <ArrowRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}
        {result && (
          <div role="status" className={`rounded-xl border p-4 ${result.delivered
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
            : 'border-rose-400 bg-rose-50 dark:bg-rose-950/30'}`}>
            <div className="flex gap-2 items-start">
              {result.delivered ? <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-300 shrink-0"/> : <AlertTriangle className="w-5 h-5 text-rose-700 dark:text-rose-300 shrink-0"/>}
              <div>
                <strong className="text-sm text-slate-900 dark:text-white">{result.message}</strong>
                <p className="text-xs sm:text-sm mt-2 leading-relaxed text-slate-700 dark:text-slate-200">{result.explanation}</p>
                {result.tagged && <p className="text-xs mt-2 font-mono text-slate-700 dark:text-cyan-200">802.1Q: TPID 0x8100 · PCP 0 · DEI 0 · VID {sourceVlan} (учебный кадр)</p>}
              </div>
            </div>
          </div>
        )}
        {completed && mode !== 'explore' && <p role="status" className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">Дело раскрыто! Кадр успешно доставлен. Попыток передачи: {attempts}.</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">Учебная модель: порты активны, MAC и ARP считаются известными, native VLAN и STP не моделируются. В режиме L3 включены SVI VLAN 10/20, ip routing и настроенные шлюзы ПК; TTL уменьшается при маршрутизации.</p>
      </div>

      <div className={frameClass}>
        <button type="button" onClick={() => setShowTheory(p => !p)} aria-expanded={showTheory}
          className="w-full flex items-center justify-between gap-3 text-left">
          <span className="inline-flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Info className="w-4 h-4"/> Справка: что находится внутри 802.1Q</span>
          <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">{showTheory ? 'Свернуть' : 'Показать'}</span>
        </button>
        {showTheory && <div className="grid sm:grid-cols-4 grid-cols-2 gap-2 mt-4">
          {[
            ['TPID · 16 бит', '0x8100'],
            ['PCP · 3 бита', 'Приоритет'],
            ['DEI · 1 бит', 'Drop eligible'],
            ['VID · 12 бит', 'VLAN ID: 1–4094'],
          ].map(([name, value]) => <div key={name} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-xs">
            <p className="font-bold text-cyan-700 dark:text-cyan-300">{name}</p><p className="mt-1 text-slate-700 dark:text-slate-300">{value}</p>
          </div>)}
        </div>}
      </div>
    </section>
  );
};

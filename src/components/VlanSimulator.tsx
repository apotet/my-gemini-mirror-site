import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Settings2 } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playClickSound, playErrorSound, playSuccessSound } from '../utils/sound';

export type Vlan = 10 | 20;
export type HostId = 'pc1' | 'pc2' | 'pc3' | 'pc4';
export type TrunkConfig = { left: Vlan[]; right: Vlan[] };
export type L3Role = 'none' | 'SW1' | 'SW2';
export type CaseId = 'explore' | 'access' | 'trunk';

export interface HostInfo {
  id: HostId;
  name: string;
  label: string;
  switchId: 'SW1' | 'SW2';
  port: string;
  ip: string;
  mac: string;
  x: number;
  y: number;
}

export interface Result {
  delivered: boolean;
  message: string;
  explanation: string;
  tagged: boolean;
  crossed: boolean;
  ruleCitation?: string;
}

export interface TracePdu {
  isTagged: boolean;
  vlanId: Vlan;
  ethType: string;
  srcMac: string;
  dstMac: string;
  srcIp: string;
  dstIp: string;
  ttl: number;
  status: 'moving' | 'routing' | 'dropped' | 'delivered';
}

export interface TraceStep {
  title: string;
  detail: string;
  rule: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  activeDeviceId?: HostId | 'SW1' | 'SW2';
  activeLinkId?: 'pc1-sw1' | 'pc2-sw1' | 'sw1-sw2-trunk' | 'sw2-pc3' | 'sw2-pc4';
  pdu: TracePdu;
  actionType: 'tx' | 'access_ingress' | 'l3_svi_route' | 'trunk_tag' | 'trunk_transit' | 'trunk_egress' | 'access_egress' | 'rx_delivery' | 'drop';
  dropped?: boolean;
}

export interface Trace {
  steps: TraceStep[];
  outcome: Result;
  initialVlan: Vlan;
  finalVlan: Vlan;
}

export const HOSTS: HostInfo[] = [
  { id: 'pc1', name: 'PC-01', label: 'Бухгалтерия', switchId: 'SW1', port: 'Fa0/1', ip: '192.168.10.11', mac: '00:50:79:66:68:01', x: 78, y: 92 },
  { id: 'pc2', name: 'PC-02', label: 'Финансы', switchId: 'SW1', port: 'Fa0/2', ip: '192.168.20.12', mac: '00:50:79:66:68:02', x: 78, y: 208 },
  { id: 'pc3', name: 'PC-03', label: 'Склад', switchId: 'SW2', port: 'Fa0/1', ip: '192.168.10.13', mac: '00:50:79:66:68:03', x: 682, y: 92 },
  { id: 'pc4', name: 'PC-04', label: 'Отдел кадров', switchId: 'SW2', port: 'Fa0/2', ip: '192.168.20.14', mac: '00:50:79:66:68:04', x: 682, y: 208 },
];

export const INITIAL_VLANS: Record<HostId, Vlan> = { pc1: 10, pc2: 20, pc3: 10, pc4: 20 };
export const INITIAL_TRUNKS: TrunkConfig = { left: [10, 20], right: [10, 20] };

const SW1 = { x: 250, y: 150 };
const SW2 = { x: 510, y: 150 };

function evaluateNetwork(source: HostId, target: HostId, vlans: Record<HostId, Vlan>, trunks: TrunkConfig, l3: L3Role): Result {
  const a = HOSTS.find((h) => h.id === source)!;
  const b = HOSTS.find((h) => h.id === target)!;
  const srcVlan = vlans[source];
  const dstVlan = vlans[target];
  const crossed = a.switchId !== b.switchId;
  if (srcVlan !== dstVlan) {
    if (l3 === 'none') {
      return {
        delivered: false,
        tagged: crossed,
        crossed,
        message: 'Разные VLAN, шлюза нет',
        explanation: `${a.name} в VLAN ${srcVlan}, ${b.name} в VLAN ${dstVlan}. L2 не пересылает кадр между broadcast-доменами. Нужен SVI или маршрутизатор.`,
        ruleCitation: 'VLAN isolation: no inter-VLAN without L3',
      };
    }
    const bad = [crossed && a.switchId !== l3 ? srcVlan : null, crossed && b.switchId !== l3 ? dstVlan : null].some(
      (v) => v !== null && (!trunks.left.includes(v) || !trunks.right.includes(v)),
    );
    if (bad) {
      return {
        delivered: false,
        tagged: true,
        crossed,
        message: 'SVI есть, но trunk режет нужный VLAN',
        explanation: `Чтобы дойти до SVI на ${l3} и вернуться в VLAN ${dstVlan}, оба VLAN должны быть разрешены на trunk.`,
        ruleCitation: 'trunk allowed vlan must include transit VLANs',
      };
    }
    return {
      delivered: true,
      tagged: crossed,
      crossed,
      message: `Маршрутизация VLAN ${srcVlan} → ${dstVlan} на ${l3}`,
      explanation: `Кадр приходит на SVI ${srcVlan}, L3 снимает Ethernet, TTL 64→63, новый кадр в VLAN ${dstVlan}.`,
      ruleCitation: 'Inter-VLAN routing via SVI',
    };
  }
  if (crossed && (!trunks.left.includes(srcVlan) || !trunks.right.includes(srcVlan))) {
    return {
      delivered: false,
      tagged: true,
      crossed,
      message: `VLAN ${srcVlan} не разрешён на trunk`,
      explanation: `Оба хоста в VLAN ${srcVlan}, но на одном из концов Gi0/1 этот VLAN отсутствует в allowed.`,
      ruleCitation: 'switchport trunk allowed vlan',
    };
  }
  return {
    delivered: true,
    tagged: crossed,
    crossed,
    message: crossed ? `Кадр дошёл по trunk VLAN ${srcVlan}` : `Кадр дошёл внутри SW, VLAN ${srcVlan}`,
    explanation: crossed
      ? `Access → тег 802.1Q VID ${srcVlan} на trunk → снятие тега на access получателя.`
      : `Один коммутатор, одна VLAN. Тег на access не нужен.`,
    ruleCitation: crossed ? '802.1Q trunk transit' : 'same-switch same-VLAN forwarding',
  };
}

function step(
  partial: Omit<TraceStep, 'pdu'> & { pdu: TracePdu },
): TraceStep {
  return partial;
}

function generateDetailedTrace(source: HostId, target: HostId, vlans: Record<HostId, Vlan>, trunks: TrunkConfig, l3: L3Role): Trace {
  const outcome = evaluateNetwork(source, target, vlans, trunks, l3);
  const a = HOSTS.find((h) => h.id === source)!;
  const b = HOSTS.find((h) => h.id === target)!;
  const srcVlan = vlans[source];
  const dstVlan = vlans[target];
  const steps: TraceStep[] = [];
  const srcSw = a.switchId === 'SW1' ? SW1 : SW2;
  const dstSw = b.switchId === 'SW1' ? SW1 : SW2;
  const srcLink = a.id === 'pc1' || a.id === 'pc2' ? (a.id === 'pc1' ? 'pc1-sw1' : 'pc2-sw1') : a.id === 'pc3' ? 'sw2-pc3' : 'sw2-pc4';
  const dstLink = b.id === 'pc1' || b.id === 'pc2' ? (b.id === 'pc1' ? 'pc1-sw1' : 'pc2-sw1') : b.id === 'pc3' ? 'sw2-pc3' : 'sw2-pc4';
  const basePdu = (over: Partial<TracePdu> = {}): TracePdu => ({
    isTagged: false,
    vlanId: srcVlan,
    ethType: '0x0800',
    srcMac: a.mac,
    dstMac: b.mac,
    srcIp: a.ip,
    dstIp: b.ip,
    ttl: 64,
    status: 'moving',
    ...over,
  });

  steps.push(
    step({
      title: `${a.name} формирует кадр`,
      detail: `Untagged Ethernet с ${a.port}. Dst IP — ${b.ip}. Если хост в другой подсети, dst MAC будет MAC шлюза.`,
      rule: 'Access-порт не добавляет тег.',
      from: { x: a.x, y: a.y },
      to: { x: srcSw.x, y: srcSw.y },
      activeDeviceId: a.id,
      activeLinkId: srcLink,
      actionType: 'tx',
      pdu: basePdu(),
    }),
  );

  if (srcVlan !== dstVlan && l3 === 'none') {
    steps.push(
      step({
        title: 'Кадр отброшен: разные VLAN',
        detail: outcome.explanation,
        rule: 'L2 не маршрутизирует.',
        from: { x: srcSw.x, y: srcSw.y },
        to: { x: srcSw.x, y: srcSw.y },
        activeDeviceId: a.switchId,
        actionType: 'drop',
        dropped: true,
        pdu: basePdu({ status: 'dropped' }),
      }),
    );
    return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
  }

  if (a.switchId !== b.switchId || (srcVlan !== dstVlan && l3 !== 'none' && a.switchId !== l3)) {
    const side = a.switchId === 'SW1' ? 'left' : 'right';
    if (!trunks[side].includes(srcVlan)) {
      steps.push(
        step({
          title: `Trunk ${a.switchId} не пускает VLAN ${srcVlan}`,
          detail: `Gi0/1 ${a.switchId} не содержит VLAN ${srcVlan} в allowed.`,
          rule: 'switchport trunk allowed vlan',
          from: { x: srcSw.x, y: srcSw.y },
          to: { x: srcSw.x, y: srcSw.y },
          activeDeviceId: a.switchId,
          activeLinkId: 'sw1-sw2-trunk',
          actionType: 'drop',
          dropped: true,
          pdu: basePdu({ isTagged: true, status: 'dropped' }),
        }),
      );
      return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
    }
    steps.push(
      step({
        title: `Тег 802.1Q VID ${srcVlan}`,
        detail: `На исходящем trunk Gi0/1 добавляется тег TPID 0x8100, VID ${srcVlan}. IP не меняется.`,
        rule: '802.1Q tag on trunk egress',
        from: { x: srcSw.x, y: srcSw.y },
        to: { x: (SW1.x + SW2.x) / 2, y: 150 },
        activeDeviceId: a.switchId,
        activeLinkId: 'sw1-sw2-trunk',
        actionType: 'trunk_tag',
        pdu: basePdu({ isTagged: true }),
      }),
    );
    const far = a.switchId === 'SW1' ? SW2 : SW1;
    const farSide = a.switchId === 'SW1' ? 'right' : 'left';
    if (!trunks[farSide].includes(srcVlan)) {
      steps.push(
        step({
          title: `Входящий trunk не принимает VLAN ${srcVlan}`,
          detail: `Кадр дошёл по кабелю, но allowed на дальнем конце не содержит VLAN ${srcVlan}.`,
          rule: 'ingress trunk filter',
          from: { x: (SW1.x + SW2.x) / 2, y: 150 },
          to: { x: far.x, y: far.y },
          activeDeviceId: far === SW1 ? 'SW1' : 'SW2',
          activeLinkId: 'sw1-sw2-trunk',
          actionType: 'drop',
          dropped: true,
          pdu: basePdu({ isTagged: true, status: 'dropped' }),
        }),
      );
      return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
    }
    steps.push(
      step({
        title: 'Кадр идёт по trunk',
        detail: `Тегированный кадр VID ${srcVlan} между SW1 и SW2.`,
        rule: 'trunk transit',
        from: { x: (SW1.x + SW2.x) / 2, y: 150 },
        to: { x: far.x, y: far.y },
        activeLinkId: 'sw1-sw2-trunk',
        actionType: 'trunk_transit',
        pdu: basePdu({ isTagged: true }),
      }),
    );
  }

  if (srcVlan !== dstVlan && l3 !== 'none') {
    const l3Pos = l3 === 'SW1' ? SW1 : SW2;
    steps.push(
      step({
        title: `${l3}: маршрутизация SVI ${srcVlan} → ${dstVlan}`,
        detail: `SVI ${srcVlan} принимает пакет. Новый Ethernet: MAC шлюза → MAC ${b.name}. TTL 64→63. IP src/dst те же.`,
        rule: 'SVI inter-VLAN: rewrite L2, decrement TTL',
        from: { x: l3Pos.x, y: l3Pos.y },
        to: { x: l3Pos.x, y: l3Pos.y },
        activeDeviceId: l3,
        actionType: 'l3_svi_route',
        pdu: basePdu({
          isTagged: false,
          vlanId: dstVlan,
          srcMac: `00:00:5E:00:01:0${dstVlan === 10 ? 'A' : 'B'}`,
          ttl: 63,
          status: 'routing',
        }),
      }),
    );
    if (b.switchId !== l3) {
      const side = l3 === 'SW1' ? 'left' : 'right';
      if (!trunks[side].includes(dstVlan) || !trunks[l3 === 'SW1' ? 'right' : 'left'].includes(dstVlan)) {
        steps.push(
          step({
            title: `После SVI trunk режет VLAN ${dstVlan}`,
            detail: 'Новый кадр создан, но VLAN получателя не разрешён на trunk.',
            rule: 'return path must be allowed',
            from: { x: l3Pos.x, y: l3Pos.y },
            to: { x: l3Pos.x, y: l3Pos.y },
            activeDeviceId: l3,
            activeLinkId: 'sw1-sw2-trunk',
            actionType: 'drop',
            dropped: true,
            pdu: basePdu({ isTagged: true, vlanId: dstVlan, ttl: 63, status: 'dropped' }),
          }),
        );
        return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
      }
      steps.push(
        step({
          title: `Тег VID ${dstVlan} на обратном trunk`,
          detail: `Новый кадр VLAN ${dstVlan} идёт к коммутатору получателя.`,
          rule: 'tagged egress after routing',
          from: { x: l3Pos.x, y: l3Pos.y },
          to: { x: dstSw.x, y: dstSw.y },
          activeLinkId: 'sw1-sw2-trunk',
          actionType: 'trunk_tag',
          pdu: basePdu({ isTagged: true, vlanId: dstVlan, srcMac: `00:00:5E:00:01:0${dstVlan === 10 ? 'A' : 'B'}`, ttl: 63 }),
        }),
      );
    }
  }

  steps.push(
    step({
      title: `${b.switchId}: снятие тега, выход в ${b.port}`,
      detail: `Access-порт VLAN ${dstVlan} отдаёт untagged кадр на ${b.name}.`,
      rule: 'untag on access egress',
      from: { x: dstSw.x, y: dstSw.y },
      to: { x: b.x, y: b.y },
      activeDeviceId: b.switchId,
      activeLinkId: dstLink,
      actionType: 'access_egress',
      pdu: basePdu({
        isTagged: false,
        vlanId: dstVlan,
        srcMac: srcVlan === dstVlan ? a.mac : `00:00:5E:00:01:0${dstVlan === 10 ? 'A' : 'B'}`,
        ttl: srcVlan === dstVlan ? 64 : 63,
        status: 'delivered',
      }),
    }),
  );
  steps.push(
    step({
      title: outcome.delivered ? `${b.name} принял кадр` : 'Доставка не состоялась',
      detail: outcome.explanation,
      rule: outcome.ruleCitation || '',
      from: { x: b.x, y: b.y },
      to: { x: b.x, y: b.y },
      activeDeviceId: b.id,
      actionType: outcome.delivered ? 'rx_delivery' : 'drop',
      dropped: !outcome.delivered,
      pdu: basePdu({
        isTagged: false,
        vlanId: dstVlan,
        srcMac: srcVlan === dstVlan ? a.mac : `00:00:5E:00:01:0${dstVlan === 10 ? 'A' : 'B'}`,
        ttl: srcVlan === dstVlan ? 64 : 63,
        status: outcome.delivered ? 'delivered' : 'dropped',
      }),
    }),
  );
  return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
}

const MODES: { id: CaseId; label: string }[] = [
  { id: 'explore', label: 'Свободная' },
  { id: 'access', label: 'Дело 3 · Чужая VLAN' },
  { id: 'trunk', label: 'Дело 4 · Trunk' },
];

export const VlanSimulator: React.FC = () => {
  const [mode, setMode] = useState<CaseId>('explore');
  const [vlans, setVlans] = useState<Record<HostId, Vlan>>(INITIAL_VLANS);
  const [trunks, setTrunks] = useState<TrunkConfig>(INITIAL_TRUNKS);
  const [l3Role, setL3Role] = useState<L3Role>('none');
  const [source, setSource] = useState<HostId>('pc1');
  const [target, setTarget] = useState<HostId>('pc3');
  const [showSettings, setShowSettings] = useState(false);
  const [trace, setTrace] = useState<Trace | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const active = trace?.steps[stepIndex];

  const reset = (next: CaseId = mode) => {
    setMode(next);
    setL3Role('none');
    setTrace(null);
    setStepIndex(0);
    setPlaying(false);
    setCompleted(false);
    if (next === 'access') {
      setVlans({ pc1: 10, pc2: 20, pc3: 10, pc4: 20 });
      setTrunks({ left: [10, 20], right: [10, 20] });
      setSource('pc1');
      setTarget('pc2');
    } else if (next === 'trunk') {
      setVlans({ pc1: 10, pc2: 20, pc3: 10, pc4: 20 });
      setTrunks({ left: [10, 20], right: [10] });
      setSource('pc2');
      setTarget('pc4');
    } else {
      setVlans({ ...INITIAL_VLANS });
      setTrunks({ left: [10, 20], right: [10, 20] });
      setSource('pc1');
      setTarget('pc3');
    }
    triggerHaptic('light');
    playClickSound();
  };

  const start = () => {
    const next = generateDetailedTrace(source, target, vlans, trunks, l3Role);
    setTrace(next);
    setStepIndex(0);
    setPlaying(true);
    setCompleted(false);
    triggerHaptic('medium');
  };

  useEffect(() => {
    if (!playing || !trace) return;
    if (stepIndex >= trace.steps.length - 1) {
      setPlaying(false);
      if (trace.outcome.delivered && mode !== 'explore') {
        setCompleted(true);
        playSuccessSound();
      } else if (!trace.outcome.delivered) playErrorSound();
      return;
    }
    const t = window.setTimeout(() => setStepIndex((s) => s + 1), 1600);
    return () => window.clearTimeout(t);
  }, [playing, stepIndex, trace, mode]);

  const changeVlan = (host: HostId, vlan: Vlan) => {
    setVlans((prev) => ({ ...prev, [host]: vlan }));
    setTrace(null);
    setPlaying(false);
    triggerHaptic('selection');
  };
  const toggleTrunk = (side: 'left' | 'right', vlan: Vlan) => {
    setTrunks((prev) => ({
      ...prev,
      [side]: prev[side].includes(vlan) ? prev[side].filter((v) => v !== vlan) : [...prev[side], vlan].sort(),
    }));
    setTrace(null);
    setPlaying(false);
    triggerHaptic('selection');
  };
  const pickHost = (id: HostId) => {
    if (id === source) return;
    if (id === target) {
      setSource(id);
      setTarget(source);
    } else setTarget(id);
    setTrace(null);
    setPlaying(false);
    triggerHaptic('selection');
  };

  const checkGoal = useCallback(() => {
    if (mode === 'explore') return;
    const outcome = evaluateNetwork(source, target, vlans, trunks, l3Role);
    if (outcome.delivered) setCompleted(true);
  }, [mode, source, target, vlans, trunks, l3Role]);

  useEffect(() => {
    checkGoal();
  }, [checkGoal]);

  const linkClass = (id: NonNullable<TraceStep['activeLinkId']>) =>
    active?.activeLinkId === id ? 'stroke-cyan-500 dark:stroke-cyan-300' : 'stroke-slate-300 dark:stroke-slate-600';

  return (
    <div className="space-y-3 max-w-6xl mx-auto pb-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Макет · VLAN</div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">VLAN & Trunk</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {HOSTS.find((h) => h.id === source)?.name} VLAN {vlans[source]} → {HOSTS.find((h) => h.id === target)?.name} VLAN {vlans[target]}
            {l3Role !== 'none' ? ` · L3 на ${l3Role}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => reset(m.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                mode === m.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-500'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode !== 'explore' && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
          {mode === 'access'
            ? 'Дело 3: PC-01 не говорит с PC-02 на одном коммутаторе. Сверь access VLAN или включи L3.'
            : 'Дело 4: PC-02 и PC-04 в VLAN 20, но кадр не проходит trunk. Проверь allowed на обоих концах.'}
          {completed && <span className="ml-2 font-bold text-emerald-700 dark:text-emerald-300">Связь восстановлена.</span>}
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2">
          <svg viewBox="0 0 760 280" className="w-full h-auto" role="img" aria-label="Два коммутатора, четыре ПК, trunk 802.1Q">
            <rect x="6" y="8" width="360" height="264" rx="14" className="fill-cyan-50 dark:fill-cyan-950/20 stroke-cyan-300 dark:stroke-cyan-800" strokeDasharray="5 4" />
            <rect x="394" y="8" width="360" height="264" rx="14" className="fill-indigo-50 dark:fill-indigo-950/20 stroke-indigo-300 dark:stroke-indigo-800" strokeDasharray="5 4" />
            <text x="16" y="26" className="fill-cyan-800 dark:fill-cyan-300" fontSize="11">SW1 · access</text>
            <text x="404" y="26" className="fill-indigo-800 dark:fill-indigo-300" fontSize="11">SW2 · access</text>

            <path d="M78 92 L250 150" className={linkClass('pc1-sw1')} fill="none" strokeWidth="2.5" />
            <path d="M78 208 L250 150" className={linkClass('pc2-sw1')} fill="none" strokeWidth="2.5" />
            <path d="M510 150 L682 92" className={linkClass('sw2-pc3')} fill="none" strokeWidth="2.5" />
            <path d="M510 150 L682 208" className={linkClass('sw2-pc4')} fill="none" strokeWidth="2.5" />
            <path
              d="M310 150 L450 150"
              className={active?.activeLinkId === 'sw1-sw2-trunk' ? 'stroke-amber-500' : 'stroke-amber-400/70'}
              fill="none"
              strokeWidth="4"
            />
            <text x="380" y="140" textAnchor="middle" className="fill-amber-700 dark:fill-amber-300" fontSize="10" fontWeight="700">
              802.1Q
            </text>
            <text x="380" y="168" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="9">
              L {trunks.left.join(',') || '—'} · R {trunks.right.join(',') || '—'}
            </text>

            {HOSTS.map((host) => {
              const vlan = vlans[host.id];
              const isSrc = host.id === source;
              const isDst = host.id === target;
              return (
                <g key={host.id} transform={`translate(${host.x} ${host.y})`} onClick={() => pickHost(host.id)} style={{ cursor: 'pointer' }}>
                  <rect x="-22" y="-16" width="44" height="30" rx="4" className={isSrc || isDst ? 'fill-cyan-100 dark:fill-cyan-900 stroke-cyan-500' : 'fill-white dark:fill-slate-900 stroke-slate-400 dark:stroke-slate-600'} strokeWidth="1.5" />
                  <text y="34" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100" fontSize="11" fontWeight="700">{host.name}</text>
                  <text y="47" textAnchor="middle" className={vlan === 10 ? 'fill-cyan-700 dark:fill-cyan-300' : 'fill-violet-700 dark:fill-violet-300'} fontSize="10">VLAN {vlan}</text>
                  {isSrc && <text y="-24" textAnchor="middle" className="fill-cyan-700 dark:fill-cyan-300" fontSize="9">TX</text>}
                  {isDst && <text y="-24" textAnchor="middle" className="fill-violet-700 dark:fill-violet-300" fontSize="9">RX</text>}
                </g>
              );
            })}

            {(['SW1', 'SW2'] as const).map((id) => {
              const pos = id === 'SW1' ? SW1 : SW2;
              const isL3 = l3Role === id;
              const activeSw = active?.activeDeviceId === id;
              return (
                <g key={id} transform={`translate(${pos.x} ${pos.y})`}>
                  <rect x="-36" y="-18" width="72" height="36" rx="6" className={activeSw ? 'fill-cyan-100 dark:fill-cyan-900 stroke-cyan-500' : 'fill-white dark:fill-slate-900 stroke-slate-400 dark:stroke-slate-600'} strokeWidth="1.5" />
                  <text y="4" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100" fontSize="12" fontWeight="700">{id}</text>
                  {isL3 && <text y="28" textAnchor="middle" className="fill-cyan-700 dark:fill-cyan-300" fontSize="9">SVI .10.1 / .20.1</text>}
                </g>
              );
            })}

            {active && (
              <motion.g key={stepIndex} initial={{ x: active.from.x, y: active.from.y }} animate={{ x: active.to.x, y: active.to.y }} transition={{ duration: 0.7, ease: 'easeInOut' }}>
                <rect x="-28" y="-11" width="56" height="22" rx={active.pdu.isTagged ? 4 : 11} className={active.dropped ? 'fill-rose-500' : active.pdu.isTagged ? 'fill-amber-400' : 'fill-cyan-400'} />
                <text y="4" textAnchor="middle" className="fill-slate-950" fontSize="9" fontWeight="800">
                  {active.dropped ? 'DROP' : active.actionType === 'l3_svi_route' ? 'SVI' : active.pdu.isTagged ? `VID ${active.pdu.vlanId}` : 'untag'}
                </text>
              </motion.g>
            )}
          </svg>
          <div className="flex flex-wrap gap-2 px-2 pb-1 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="text-cyan-700 dark:text-cyan-300">VLAN 10</span>
            <span className="text-violet-700 dark:text-violet-300">VLAN 20</span>
            <span className="text-amber-700 dark:text-amber-300">тег 802.1Q</span>
            <span>нажми ПК, чтобы сменить получателя</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 space-y-2 lg:sticky lg:top-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{trace ? `Шаг ${stepIndex + 1} / ${trace.steps.length}` : 'Ожидание'}</span>
            <span className="font-mono">{active?.pdu.isTagged ? `802.1Q · VID ${active.pdu.vlanId}` : 'Untagged'}</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">{active?.title || 'Запусти передачу'}</div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{active?.detail || 'Выбери отправителя и получателя, затем смотри путь кадра.'}</p>
          {active && (
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-2">MAC {active.pdu.srcMac.slice(-8)} → {active.pdu.dstMac.slice(-8)}</div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-2">IP {active.pdu.srcIp.split('.').slice(2).join('.')} → {active.pdu.dstIp.split('.').slice(2).join('.')}</div>
              <div className={`rounded-lg p-2 ${active.pdu.isTagged ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200' : 'bg-slate-50 dark:bg-slate-900'}`}>
                {active.pdu.isTagged ? `тег VID ${active.pdu.vlanId}` : 'без тега'}
              </div>
              <div className={`rounded-lg p-2 ${active.pdu.ttl === 63 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200' : 'bg-slate-50 dark:bg-slate-900'}`}>
                TTL {active.pdu.ttl}
              </div>
            </div>
          )}
          {active && (
            <details className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 [&::-webkit-details-marker]:hidden">
                <span>Подробнее о кадре · Ethernet II / 802.1Q</span>
                <span className="shrink-0 text-cyan-700 dark:text-cyan-300 group-open:hidden">Показать</span>
                <span className="hidden shrink-0 text-cyan-700 dark:text-cyan-300 group-open:inline">Скрыть</span>
              </summary>
              <div className="border-t border-slate-200 dark:border-slate-800 px-3 pb-3 pt-2 space-y-2 text-[11px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Преамбула + SFD · 8 байт на линии</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200">7 B preamble + 1 B SFD</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Destination MAC · 6 байт</div>
                    <div className="font-mono break-all text-slate-800 dark:text-slate-200">{active.pdu.dstMac}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Source MAC · 6 байт</div>
                    <div className="font-mono break-all text-slate-800 dark:text-slate-200">{active.pdu.srcMac}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Тег 802.1Q · 4 байта при наличии</div>
                    <div className={`font-mono ${active.pdu.isTagged ? 'text-amber-700 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {active.pdu.isTagged ? `TPID 0x8100 · PCP 0 · DEI 0 · VID ${active.pdu.vlanId}` : 'Отсутствует · untagged'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">EtherType · 2 байта</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200">{active.pdu.ethType} · IPv4</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">IP пакет · Src / Dst · TTL</div>
                    <div className="font-mono break-all text-slate-800 dark:text-slate-200">{active.pdu.srcIp} → {active.pdu.dstIp} · TTL {active.pdu.ttl}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">FCS · 4 байта</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200">CRC-32 · значение не вычисляется</div>
                  </div>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Это учебная структура кадра, не дамп Wireshark. Размер зависит от полезной нагрузки; преамбула и SFD в длину Ethernet-кадра не входят. FCS показан как поле, без имитации проверки CRC.
                </p>
              </div>
            </details>
          )}
          {active?.rule && <p className="text-[11px] text-slate-500 dark:text-slate-400">{active.rule}</p>}
          <div className="flex gap-1.5">
            {!playing ? (
              <button type="button" onClick={start} className="flex-1 rounded-xl bg-cyan-500 text-slate-950 text-sm font-semibold py-2 cursor-pointer">
                <Play className="w-4 h-4 inline" /> Запустить
              </button>
            ) : (
              <button type="button" onClick={() => setPlaying(false)} className="flex-1 rounded-xl bg-amber-400 text-slate-950 text-sm font-semibold py-2 cursor-pointer">
                <Pause className="w-4 h-4 inline" /> Пауза
              </button>
            )}
            <button type="button" onClick={() => { setPlaying(false); setStepIndex((s) => Math.max(0, s - 1)); }} className="px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => { setPlaying(false); setStepIndex((s) => Math.min((trace?.steps.length || 1) - 1, s + 1)); }} className="px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => reset()} className="px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer" title="Сброс">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <button type="button" onClick={() => setShowSettings((v) => !v)} className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer">
          <span className="flex items-center gap-2"><Settings2 className="w-4 h-4" /> Настройки стенда</span>
          <span className="text-xs text-slate-500">{showSettings ? 'скрыть' : 'показать'}</span>
        </button>
        {showSettings && (
          <div className="px-3 pb-3 space-y-3 text-xs">
            <div>
              <div className="mb-1 text-slate-500">Роль L3 / SVI</div>
              <div className="flex gap-1">
                {(['none', 'SW1', 'SW2'] as L3Role[]).map((role) => (
                  <button key={role} type="button" onClick={() => { setL3Role(role); setTrace(null); }} className={`px-2 py-1 rounded-lg border cursor-pointer ${l3Role === role ? 'bg-cyan-500 text-slate-950 border-cyan-500' : 'border-slate-200 dark:border-slate-700'}`}>
                    {role === 'none' ? 'только L2' : role}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {HOSTS.map((host) => (
                <div key={host.id} className="flex items-center justify-between gap-2">
                  <span>{host.name} · {host.port}</span>
                  <div className="flex gap-1">
                    {([10, 20] as Vlan[]).map((vlan) => (
                      <button key={vlan} type="button" onClick={() => changeVlan(host.id, vlan)} className={`px-2 py-1 rounded-lg border cursor-pointer ${vlans[host.id] === vlan ? (vlan === 10 ? 'bg-cyan-500 text-slate-950 border-cyan-500' : 'bg-violet-500 text-white border-violet-500') : 'border-slate-200 dark:border-slate-700'}`}>
                        {vlan}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {(['left', 'right'] as const).map((side) => (
                <div key={side}>
                  <div className="mb-1 text-slate-500">Trunk {side === 'left' ? 'SW1 Gi0/1' : 'SW2 Gi0/1'}</div>
                  <div className="flex gap-1">
                    {([10, 20] as Vlan[]).map((vlan) => (
                      <button key={vlan} type="button" onClick={() => toggleTrunk(side, vlan)} className={`px-2 py-1 rounded-lg border cursor-pointer ${trunks[side].includes(vlan) ? 'bg-amber-400 text-slate-950 border-amber-400' : 'border-slate-200 dark:border-slate-700'}`}>
                        VLAN {vlan}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

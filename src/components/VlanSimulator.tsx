import React, { useState } from 'react';
import { Layers, RotateCcw, ShieldCheck, AlertTriangle, ArrowRight, Cable, Info } from 'lucide-react';

type Vlan = 10 | 20;
type HostId = 'pc1' | 'pc2' | 'pc3' | 'pc4';
type TrunkConfig = { left: Vlan[]; right: Vlan[] };
type CaseId = 'explore' | 'access' | 'trunk';
type Result = { delivered: boolean; message: string; explanation: string; tagged: boolean; crossed: boolean };

const HOSTS: { id: HostId; name: string; switchId: 'SW1' | 'SW2'; port: string; x: number; y: number }[] = [
  { id: 'pc1', name: 'PC-01', switchId: 'SW1', port: 'Fa0/1', x: 10, y: 16 },
  { id: 'pc2', name: 'PC-02', switchId: 'SW1', port: 'Fa0/2', x: 10, y: 122 },
  { id: 'pc3', name: 'PC-03', switchId: 'SW2', port: 'Fa0/1', x: 522, y: 16 },
  { id: 'pc4', name: 'PC-04', switchId: 'SW2', port: 'Fa0/2', x: 522, y: 122 },
];
const INITIAL_VLANS: Record<HostId, Vlan> = { pc1: 10, pc2: 20, pc3: 10, pc4: 20 };
const INITIAL_TRUNKS: TrunkConfig = { left: [10, 20], right: [10, 20] };

function evaluate(source: HostId, target: HostId, vlans: Record<HostId, Vlan>, trunks: TrunkConfig): Result {
  if (source === target) return {
    delivered: false, crossed: false, tagged: false,
    message: 'Выбран один и тот же конечный узел',
    explanation: 'Выбери два разных ПК. На этом стенде моделируем пересылку между различными конечными узлами.',
  };
  const a = HOSTS.find(host => host.id === source)!;
  const b = HOSTS.find(host => host.id === target)!;
  const vlan = vlans[source];
  const crossed = a.switchId !== b.switchId;
  if (vlan !== vlans[target]) return {
    delivered: false, crossed, tagged: false,
    message: 'Кадр не доставлен: получатель в другой VLAN',
    explanation: `На access-порту ${a.port} коммутатора ${a.switchId} кадр относится к VLAN ${vlan}. Порт получателя назначен в VLAN ${vlans[target]}. L2-коммутаторы не маршрутизируют кадры между VLAN — нужен L3 и корректная IP-конфигурация.`,
  };
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
const frameClass = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1929] p-4 sm:p-5 shadow-sm';
const activeButton = 'bg-cyan-500 text-slate-950 border-cyan-500';
const idleButton = 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-cyan-400';

export const VlanSimulator: React.FC = () => {
  const [mode, setMode] = useState<CaseId>('explore');
  const [vlans, setVlans] = useState<Record<HostId, Vlan>>(INITIAL_VLANS);
  const [trunks, setTrunks] = useState<TrunkConfig>(INITIAL_TRUNKS);
  const [source, setSource] = useState<HostId>('pc1');
  const [target, setTarget] = useState<HostId>('pc3');
  const [result, setResult] = useState<Result | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showTheory, setShowTheory] = useState(false);

  const reset = (nextMode: CaseId = mode) => {
    setMode(nextMode);
    setVlans({ ...INITIAL_VLANS });
    setTrunks(nextMode === 'trunk' ? { left: [10, 20], right: [10] } : { left: [10, 20], right: [10, 20] });
    setSource(nextMode === 'access' ? 'pc1' : nextMode === 'trunk' ? 'pc2' : 'pc1');
    setTarget(nextMode === 'access' ? 'pc2' : nextMode === 'trunk' ? 'pc4' : 'pc3');
    setResult(null); setAttempts(0); setCompleted(false);
  };
  const changeVlan = (host: HostId, vlan: Vlan) => {
    setVlans(previous => ({ ...previous, [host]: vlan }));
    setResult(null);
  };
  const toggleAllowed = (side: 'left' | 'right', vlan: Vlan) => {
    setTrunks(previous => ({
      ...previous,
      [side]: previous[side].includes(vlan)
        ? previous[side].filter(item => item !== vlan)
        : [...previous[side], vlan].sort((a, b) => a - b),
    }));
    setResult(null);
  };
  const simulate = () => {
    const next = evaluate(source, target, vlans, trunks);
    setResult(next);
    setAttempts(n => n + 1);
    if (next.delivered && mode !== 'explore') setCompleted(true);
  };
  const sourceData = HOSTS.find(host => host.id === source)!;
  const targetData = HOSTS.find(host => host.id === target)!;
  const isCrossing = sourceData.switchId !== targetData.switchId;
  const sourceVlan = vlans[source];
  const sourceColor = sourceVlan === 10 ? 'text-cyan-700 dark:text-cyan-300' : 'text-violet-700 dark:text-violet-300';

  return (
    <section className="mx-auto max-w-6xl space-y-4" aria-label="Лаборатория VLAN и Trunk">
      <div className={frameClass}>
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">Практика · L2 · 802.1Q</span>
        <h2 className="text-xl sm:text-2xl font-black mt-1 text-slate-900 dark:text-white">VLAN & Trunk: лаборатория передачи кадров</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Два коммутатора, четыре ПК и один trunk. Назначай VLAN, разрешай их на trunk и выясняй, почему кадр проходит или теряется.</p>
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
            <path d="M304 98 H346" strokeWidth="5" className={result && isCrossing ? result.delivered ? 'stroke-emerald-500' : 'stroke-rose-500' : 'stroke-amber-500 dark:stroke-amber-400'}/>
            <text x="325" y="80" textAnchor="middle" fontSize="10" fontWeight="bold" className="fill-amber-700 dark:fill-amber-300">802.1Q</text>
            {[{ id: 'SW1', x: 204 }, { id: 'SW2', x: 346 }].map(sw => (
              <g key={sw.id}>
                <rect x={sw.x} y="75" width="100" height="46" rx="9" className="fill-white dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-500" strokeWidth="2"/>
                <text x={sw.x + 50} y="94" textAnchor="middle" fontSize="13" fontWeight="bold" className="fill-slate-900 dark:fill-white">{sw.id}</text>
                <text x={sw.x + 50} y="110" textAnchor="middle" fontSize="10" className="fill-slate-600 dark:fill-slate-300">L2 switch</text>
              </g>
            ))}
            {HOSTS.map(host => (
              <g key={host.id}>
                <rect x={host.x} y={host.y + 10} width="90" height="41" rx="8"
                  className={source === host.id || target === host.id
                    ? 'fill-cyan-100 dark:fill-cyan-900 stroke-cyan-600 dark:stroke-cyan-300'
                    : 'fill-white dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-500'}
                  strokeWidth="2"/>
                <text x={host.x + 45} y={host.y + 28} textAnchor="middle" fontSize="12" fontWeight="bold" className="fill-slate-900 dark:fill-white">{host.name}</text>
                <text x={host.x + 45} y={host.y + 42} textAnchor="middle" fontSize="10" className="fill-slate-600 dark:fill-slate-300">VLAN {vlans[host.id]}</text>
                {(source === host.id || target === host.id) && <circle cx={host.x + 82} cy={host.y + 14} r="5" fill={source === host.id ? '#0891b2' : '#8b5cf6'}/>}
              </g>
            ))}
            <text x="325" y="151" textAnchor="middle" fontSize="10" className="fill-slate-600 dark:fill-slate-300">Gi0/1 ↔ Gi0/1</text>
          </svg>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Цвет подсети обозначает область схемы, не VLAN или состояние линка. VLAN определяются настройками access-портов.</p>
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
                  <button type="button" onClick={() => { setSource(host.id); setResult(null); }} aria-pressed={source === host.id}
                    className={`flex-1 rounded-md border min-h-9 text-xs font-semibold ${source === host.id ? activeButton : idleButton}`}>Источник</button>
                  <button type="button" onClick={() => { setTarget(host.id); setResult(null); }} aria-pressed={target === host.id}
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

      <div className={frameClass + ' space-y-3'}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Передать тестовый кадр</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{sourceData.name} (VLAN {sourceVlan}) <ArrowRight className="inline w-4 h-4"/> {targetData.name} (VLAN {vlans[target]})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => reset()} className={`rounded-lg border min-h-11 px-3 font-semibold text-sm inline-flex items-center gap-2 ${idleButton}`}><RotateCcw className="w-4 h-4"/> Сброс</button>
            <button type="button" onClick={simulate} className="rounded-lg min-h-11 px-4 font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 inline-flex items-center gap-2"><Layers className="w-4 h-4"/> Отправить кадр</button>
          </div>
        </div>
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
        <p className="text-xs text-slate-500 dark:text-slate-400">Учебная модель L2: порты активны, MAC назначения известен, native VLAN не используется, IP и STP не моделируются.</p>
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

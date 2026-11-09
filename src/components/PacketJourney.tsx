import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';

const mac = {
  pc: '02:00:00:00:01:10',
  lan: '02:00:00:00:01:01',
  wan: '02:00:00:00:02:01',
  server: '02:00:00:00:02:20',
  broadcast: 'ff:ff:ff:ff:ff:ff',
};
const ip = { pc: '192.168.1.10', lan: '192.168.1.1', wan: '192.168.2.1', server: '192.168.2.20' };

type NodeId = 'pc' | 'switch' | 'router' | 'server';
type Frame = {
  Ethernet: { source: string; destination: string; type: string };
  ARP: { operation: string; senderIP: string; senderMAC: string; targetIP: string; targetMAC: string } | null;
  IP: { source: string; destination: string; TTL: number } | null;
  ICMP: { type: number } | null;
};

function arp(src: keyof typeof mac, dst: keyof typeof mac, target: keyof typeof ip, reply = false): Frame {
  return {
    Ethernet: { source: mac[src], destination: reply ? mac[dst] : mac.broadcast, type: '0x0806' },
    ARP: {
      operation: reply ? 'Reply' : 'Request',
      senderIP: ip[src as keyof typeof ip],
      senderMAC: mac[src],
      targetIP: ip[target],
      targetMAC: reply ? mac[dst] : '00:00:00:00:00:00',
    },
    IP: null,
    ICMP: null,
  };
}
function echo(src: keyof typeof mac, dst: keyof typeof mac, reverse = false, routed = false): Frame {
  return {
    Ethernet: { source: mac[src], destination: mac[dst], type: '0x0800' },
    ARP: null,
    IP: {
      source: reverse ? ip.server : ip.pc,
      destination: reverse ? ip.pc : ip.server,
      TTL: routed ? 63 : 64,
    },
    ICMP: { type: reverse ? 0 : 8 },
  };
}

const icons = {
  pc: 'M-25-22h50v32h-50z M0 10v12 M-15 23h30',
  switch: 'M-29-12h58v28h-58z M-20 0h8 M-5 0h8 M10 0h8 M-20 8h8 M-5 8h8 M10 8h8',
  router: 'M-27-17h54v36h-54z M-17-6h34 M-12-11l-5 5 5 5 M12 1l5-7-5-5 M-17 10h34',
  server: 'M-22-28h44v55h-44z M-16-16h32 M-16-4h32 M-16 8h32 M12 19h4',
};

interface Step {
  title: string;
  text: string;
  frame: Frame | null;
  active: NodeId;
  say: string[];
  route: NodeId[];
  question?: { prompt: string; nodes: Partial<Record<NodeId, number>>; correct: number };
  cache?: string;
  changed?: Array<'srcMac' | 'dstMac' | 'ttl'>;
}

const STEPS: Step[] = [
  {
    title: 'Выбор маршрута',
    text: 'ПК сравнивает /24: сервер вне 192.168.1.0/24. Следующий узел — шлюз 192.168.1.1. ARP-кэши пусты.',
    frame: null,
    active: 'pc',
    say: ['Сервер в другой подсети.', 'Нужен MAC шлюза.'],
    route: [],
  },
  {
    title: 'Кто знает шлюз?',
    text: 'ПК запрашивает MAC шлюза, а не сервера. Коммутатор раздаёт broadcast в LAN; маршрутизатор не передаёт ARP в другую подсеть.',
    frame: arp('pc', 'lan', 'lan'),
    active: 'pc',
    say: ['Кто знает MAC шлюза?', 'ARP-запрос всем в LAN.'],
    route: ['pc', 'switch', 'router'],
    cache: 'ARP ПК → 02:00:00:00:01:10',
    question: { prompt: 'Чей MAC нужно узнать? Нажми устройство.', nodes: { router: 0, server: 1 }, correct: 0 },
  },
  {
    title: 'ARP-ответ шлюза',
    text: 'Шлюз изучил отправителя запроса. ПК принимает unicast-ответ и сохраняет MAC шлюза.',
    frame: arp('lan', 'pc', 'pc', true),
    active: 'router',
    say: ['Я — шлюз. Вот мой MAC.'],
    route: ['router', 'switch', 'pc'],
  },
  {
    title: 'Echo Request до шлюза',
    text: 'Ethernet адресован следующему узлу. IP назначения остаётся адресом сервера. Коммутатор передаёт кадр без изменения TTL.',
    frame: echo('pc', 'lan'),
    active: 'pc',
    say: ['Кадр шлюзу.', 'IP-пакет — серверу.'],
    route: ['pc', 'switch', 'router'],
    question: { prompt: 'Кому отправить кадр? Нажми устройство.', nodes: { router: 0, server: 1 }, correct: 0 },
  },
  {
    title: 'Маршрутизатор ищет сервер',
    text: 'Входной Ethernet снят. Есть connected маршрут 192.168.2.0/24; TTL пакета уменьшается 64 → 63. Для нового кадра нужен MAC сервера.',
    frame: arp('wan', 'server', 'server'),
    active: 'router',
    say: ['Снимаю Ethernet. TTL 64 → 63.', 'Теперь нужен MAC сервера.'],
    route: ['router', 'server'],
  },
  {
    title: 'ARP-ответ сервера',
    text: 'Сервер изучил MAC своего шлюза из ARP-запроса. Маршрутизатор сохраняет MAC сервера.',
    frame: arp('server', 'wan', 'wan', true),
    active: 'server',
    say: ['Это мой IP. Вот мой MAC.'],
    route: ['server', 'router'],
  },
  {
    title: 'Доставка запроса',
    text: 'Новый Ethernet: MAC выходного интерфейса → MAC сервера. IP source/destination сохранены: NAT нет. TTL 63.',
    frame: echo('wan', 'server', false, true),
    active: 'router',
    say: ['Новый Ethernet, те же IP.', 'Отправляю серверу: TTL 63.'],
    route: ['router', 'server'],
    changed: ['srcMac', 'dstMac', 'ttl'],
    question: { prompt: 'Какой TTL получит сервер?', nodes: {}, correct: 0 },
  },
  {
    title: 'Echo Reply к шлюзу',
    text: 'Сервер создаёт новый ответ с TTL 64, type 0. Обратный default маршрут через 192.168.2.1; MAC уже известен.',
    frame: echo('server', 'wan', true),
    active: 'server',
    say: ['Ping получен. Ответ шлюзу.', 'Новый пакет: TTL 64.'],
    route: ['server', 'router'],
    changed: ['srcMac', 'dstMac'],
  },
  {
    title: 'Ответ через коммутатор к ПК',
    text: 'Connected маршрут 192.168.1.0/24. Новый Ethernet к ПК, TTL ответа 63. ARP ПК уже известен. ПК получает Echo Reply.',
    frame: echo('lan', 'pc', true, true),
    active: 'pc',
    say: ['Ответ в LAN. TTL 64 → 63.', 'ПК получает Echo Reply.'],
    route: ['router', 'switch', 'pc'],
    changed: ['srcMac', 'dstMac', 'ttl'],
  },
];

const TERMS: Record<string, string> = {
  ARP: 'ARP узнаёт MAC локального следующего узла по его IPv4. Запрос не проходит через маршрутизатор.',
  MAC: 'MAC — адрес интерфейса в Ethernet-кадре. На каждом маршрутизируемом участке заголовок создаётся заново.',
  TTL: 'TTL — оставшееся число переходов. Маршрутизатор уменьшает его на 1; коммутатор — нет.',
  Подсеть: 'При /24 первые три октета — сетевая часть. 192.168.1 и 192.168.2 различаются: нужен шлюз.',
  Ethernet: 'Ethernet-кадр несёт пакет по одному L2-сегменту к MAC следующего узла.',
};

const desktop = { pc: [100, 145], switch: [350, 145], router: [625, 145], server: [890, 145] } as const;
const mobile = { pc: [70, 70], switch: [70, 175], router: [70, 280], server: [70, 400] } as const;
const names = { pc: 'ПК', switch: 'Коммутатор', router: 'Маршрутизатор', server: 'Сервер' };
const subs: Record<NodeId, string[]> = {
  pc: ['192.168.1.10 /24', 'шлюз 192.168.1.1'],
  switch: ['Одна VLAN · L2'],
  router: ['LAN 192.168.1.1 /24', 'WAN 192.168.2.1 /24'],
  server: ['192.168.2.20 /24', 'шлюз 192.168.2.1'],
};

function useNarrow() {
  const [narrow, setNarrow] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth < 640);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return narrow;
}

const FAULTS = {
  mask: {
    title: 'Случай 1 · маска',
    text: 'Ping не доходит. ПК фактически 192.168.1.10/16, по плану /24. Сервер ошибочно считается on-link, ARP сервера без ответа.',
    stop: 'pc' as NodeId,
    fix: 'Исправить маску на /24',
    explain: 'После /24 сервер вне подсети, next-hop — шлюз.',
  },
  gateway: {
    title: 'Случай 2 · шлюз',
    text: 'Маска верная, но шлюз не задан. Маршрута к 192.168.2.20 нет, кадр не уходит.',
    stop: 'pc' as NodeId,
    fix: 'Задать шлюз 192.168.1.1',
    explain: 'Default gateway указывает next-hop для чужой подсети.',
  },
};

export const PacketJourney: React.FC = () => {
  const narrow = useNarrow();
  const points = narrow ? mobile : desktop;
  const [mode, setMode] = useState<'learn' | 'fix'>('learn');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [term, setTerm] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [fault, setFault] = useState<'mask' | 'gateway'>('mask');
  const [fixed, setFixed] = useState<string[]>([]);
  const [fixMsg, setFixMsg] = useState('');
  const current = STEPS[step];
  const hasNodeQuestion = current.question && Object.keys(current.question.nodes).length > 0;
  const answered = playing || !current.question || answers[step] !== undefined;
  const choice = answers[step];

  const packetLabel = useMemo(() => {
    const f = current.frame;
    if (!f) return null;
    if (f.ARP?.operation === 'Request') return 'ARP ?';
    if (f.ARP?.operation === 'Reply') return 'ARP ✓';
    if (f.ICMP?.type === 8) return 'ping →';
    return 'reply ←';
  }, [current]);

  const motionPath = current.route.map((id) => points[id]).map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ');
  const bubbleAt = points[current.active];

  useEffect(() => {
    const t = window.setTimeout(() => setPlaying(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!playing || mode !== 'learn') return;
    if (step >= STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 2200);
    return () => window.clearTimeout(t);
  }, [playing, step, mode]);

  const startPing = () => {
    setAnswers({});
    setStep(0);
    setPlaying(true);
    setMode('learn');
  };
  const pause = () => setPlaying(false);

  return (
    <div className="space-y-3 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">Обучение</div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Отправь ping на сервер</h2>
        </div>
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 self-start">
          {(
            [
              ['learn', 'Разобраться'],
              ['fix', 'Исправить'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                mode === id ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'learn' && (
        <>
          <div className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 font-mono text-xs space-y-0.5">
            <div className="text-slate-500">PC</div>
            <div className="text-slate-200">{"PC>"} ping 192.168.2.20</div>
            {step > 0 && <div className="text-slate-400">{current.title}</div>}
            {step === STEPS.length - 1 && !playing && (
              <div className="text-emerald-300">Reply from 192.168.2.20: time=12ms</div>
            )}
            {playing && <div className="text-cyan-300">идёт… можно остановить и разобрать</div>}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0d1b2b] p-2 sm:p-3">
            <svg
              viewBox={narrow ? '0 0 330 470' : '0 0 1000 300'}
              className="w-full h-auto"
              role="img"
              aria-label="ПК — коммутатор — маршрутизатор — сервер"
            >
              <rect
                x="5"
                y="5"
                width={narrow ? 320 : 622}
                height={narrow ? 250 : 282}
                rx="18"
                fill="#35d0c80a"
                stroke="#35d0c855"
                strokeDasharray="5 5"
              />
              <rect
                x={narrow ? 5 : 638}
                y={narrow ? 260 : 5}
                width={narrow ? 320 : 357}
                height={narrow ? 200 : 282}
                rx="18"
                fill="#5da9ff0a"
                stroke="#5da9ff55"
                strokeDasharray="5 5"
              />
              <text x="18" y="25" fill="#7ce8d4" fontSize="12">
                LAN · 192.168.1.0/24
              </text>
              <text x={narrow ? 18 : 700} y={narrow ? 280 : 25} fill="#7ce8d4" fontSize="12">
                192.168.2.0/24
              </text>

              {(['pc', 'switch', 'router'] as const).map((id, i) => {
                const to = (['switch', 'router', 'server'] as const)[i];
                const a = points[id];
                const b = points[to];
                const active = current.route.includes(id) && current.route.includes(to);
                return (
                  <path
                    key={id}
                    d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`}
                    fill="none"
                    stroke={active ? '#35d0c8' : '#41617d'}
                    strokeWidth="3"
                  />
                );
              })}

              {(Object.keys(points) as NodeId[]).map((id) => {
                const [x, y] = points[id];
                const active = current.active === id;
                const clickable = hasNodeQuestion && current.question?.nodes[id] !== undefined && choice === undefined;
                const picked = choice !== undefined && current.question?.nodes[id] === choice;
                const ok = current.question?.nodes[id] === current.question?.correct;
                return (
                  <g
                    key={id}
                    transform={`translate(${x} ${y})`}
                    onClick={() => {
                      if (playing) setPlaying(false);
                      if (clickable && current.question?.nodes[id] !== undefined) {
                        setAnswers((prev) => ({ ...prev, [step]: current.question!.nodes[id]! }));
                      }
                    }}
                    style={{ cursor: clickable ? 'pointer' : 'default' }}
                  >
                    <path
                      d={icons[id]}
                      fill={active ? '#16494e' : '#102b40'}
                      stroke={clickable ? '#fbbf24' : active ? '#35d0c8' : '#a4bed4'}
                      strokeWidth="2"
                      strokeDasharray={clickable ? '4 3' : undefined}
                    />
                    <text x={narrow ? 43 : 0} y={narrow ? -16 : 52} textAnchor={narrow ? 'start' : 'middle'} fill="#e7f2fc" fontSize="13">
                      {names[id]}
                    </text>
                    {subs[id].map((line, i) => (
                      <text
                        key={line}
                        x={narrow ? 43 : 0}
                        y={narrow ? 2 + i * 13 : 68 + i * 13}
                        textAnchor={narrow ? 'start' : 'middle'}
                        fill="#a8b7c7"
                        fontSize="11"
                      >
                        {line}
                      </text>
                    ))}
                    {picked && (
                      <text y="-40" textAnchor="middle" fill={ok ? '#4ade80' : '#fb7185'} fontSize="12" fontWeight="700">
                        {ok ? 'верно' : 'нет'}
                      </text>
                    )}
                  </g>
                );
              })}

              {current.cache && !narrow && (
                <text x={points.router[0]} y={points.router[1] + 100} textAnchor="middle" fill="#a6e4c8" fontSize="10">
                  {current.cache}
                </text>
              )}

              {step === 0 && (
                <text x={narrow ? 18 : 280} y={narrow ? 230 : 275} fill="#fbbf24" fontSize="12">
                  192.168.1 ≠ 192.168.2 → шлюз
                </text>
              )}

              {step > 0 && (
                <g>
                  <rect
                    x={narrow ? 110 : Math.max(8, bubbleAt[0] - 110)}
                    y={narrow ? Math.max(30, bubbleAt[1] - 70) : 40}
                    width="200"
                    height={current.say.length * 17 + 14}
                    rx="9"
                    fill="#153d43"
                    stroke="#35d0c8"
                  />
                  {current.say.map((t, i) => (
                    <text
                      key={t}
                      x={(narrow ? 110 : Math.max(8, bubbleAt[0] - 110)) + 8}
                      y={(narrow ? Math.max(30, bubbleAt[1] - 70) : 40) + 19 + i * 17}
                      fill="#e6fffc"
                      fontSize="12"
                    >
                      {t}
                    </text>
                  ))}
                </g>
              )}

              {packetLabel && motionPath && (
                <g>
                  <path id="pkt-path" d={motionPath} fill="none" stroke="none" />
                  <g>
                    <rect
                      x="-32"
                      y="-12"
                      width="64"
                      height="24"
                      rx={packetLabel.startsWith('ARP ?') ? 3 : 12}
                      fill={packetLabel.startsWith('ARP ?') ? '#fbbf24' : packetLabel.startsWith('ARP') ? '#a5a2ff' : '#35d0c8'}
                      stroke="#07111f"
                      strokeWidth="2"
                    />
                    <text x="0" y="4" textAnchor="middle" fill="#07111f" fontSize="10" fontWeight="800">
                      {packetLabel}
                    </text>
                    <animateMotion key={`${step}-${narrow ? 'm' : 'd'}`} dur="0.9s" fill="freeze" path={motionPath} />
                  </g>
                </g>
              )}
            </svg>

            <div className="flex flex-wrap items-center gap-2 mt-2 px-1">
              {!playing ? (
                <button type="button" onClick={startPing} className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 text-sm font-semibold cursor-pointer">
                  <Play className="w-4 h-4 inline" /> Запустить ping
                </button>
              ) : (
                <button type="button" onClick={pause} className="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-sm font-semibold cursor-pointer">
                  <Pause className="w-4 h-4 inline" /> Остановить и разобрать
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  pause();
                  setStep((s) => Math.max(0, s - 1));
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-sm cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 inline" /> Назад
              </button>
              <button
                type="button"
                disabled={!answered}
                onClick={() => {
                  pause();
                  setStep((s) => Math.min(STEPS.length - 1, s + 1));
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-sm cursor-pointer disabled:opacity-40"
              >
                Следующий шаг <ChevronRight className="w-4 h-4 inline" />
              </button>
              <button
                type="button"
                onClick={() => {
                  pause();
                  setStep(0);
                  setAnswers({});
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 inline" /> Начать заново
              </button>
              <span className="sm:ml-auto text-xs text-slate-400 font-mono">
                {playing ? 'авто' : 'вручную'} · {step + 1} / {STEPS.length} · {current.title}
              </span>
            </div>
          </div>

          {current.question && !hasNodeQuestion && (
            <div className="rounded-xl border-l-4 border-amber-400 bg-amber-400/5 p-3 space-y-2">
              <div className="text-sm font-semibold">{current.question.prompt}</div>
              <div className="flex gap-1.5">
                {['63', '64', '62'].map((opt, i) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [step]: i }))}
                    className={`px-3 py-1.5 rounded-lg text-xs border cursor-pointer ${
                      choice === i && i === 0
                        ? 'border-emerald-400 bg-emerald-950/40'
                        : choice === i
                          ? 'border-rose-400 bg-rose-950/40'
                          : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasNodeQuestion && choice === undefined && (
            <p className="text-sm text-amber-300 px-1">{current.question!.prompt}</p>
          )}

          {current.frame && (
            <div className="rounded-2xl border border-slate-800 p-3 sm:p-4 space-y-3">
              <h3 className="text-sm font-bold">
                {current.frame.ARP
                  ? `ARP · ${current.frame.ARP.operation === 'Request' ? 'запрос · broadcast' : 'ответ · unicast'}`
                  : `ICMP · ${current.frame.ICMP?.type === 8 ? 'Echo Request' : 'Echo Reply'}`}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {(
                  [
                    ['MAC откуда', current.frame.Ethernet.source, current.changed?.includes('srcMac')],
                    ['MAC куда', current.frame.Ethernet.destination, current.changed?.includes('dstMac')],
                    ['IP откуда', current.frame.IP?.source ?? '— (ARP без IP)', false],
                    ['IP куда', current.frame.IP?.destination ?? '— (ARP без IP)', false],
                    ['TTL', String(current.frame.IP?.TTL ?? '— (ARP без IP)'), current.changed?.includes('ttl')],
                  ] as const
                ).map(([label, value, changed]) => (
                  <div key={label}>
                    <div className="text-slate-500 mb-1">{label}</div>
                    <div className={`font-mono break-all ${changed ? 'text-amber-300' : 'text-slate-100'}`}>{value}</div>
                    {changed && <div className="text-[10px] text-amber-400">изменилось</div>}
                    {!changed && current.frame?.IP && label.startsWith('IP') && (
                      <div className="text-[10px] text-emerald-400">без изменений</div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-300">{current.text}</p>
            </div>
          )}
          {!current.frame && <p className="text-sm text-slate-300 px-1">{current.text}</p>}
        </>
      )}

      {mode === 'fix' && (
        <div className="rounded-2xl border border-slate-800 bg-[#0d1b2b] p-3 sm:p-4 space-y-3">
          <div className="flex gap-1.5">
            {(Object.keys(FAULTS) as Array<keyof typeof FAULTS>).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setFault(id);
                  setFixMsg('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                  fault === id ? 'bg-cyan-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {FAULTS[id].title}
                {fixed.includes(id) ? ' ✓' : ''}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-300">{FAULTS[fault].text}</p>
          <p className="text-xs text-rose-300">Остановка: {names[FAULTS[fault].stop]}</p>
          <button
            type="button"
            onClick={() => {
              if (!fixed.includes(fault)) setFixed((prev) => [...prev, fault]);
              setFixMsg(FAULTS[fault].explain);
            }}
            className="px-3 py-2 rounded-xl bg-cyan-600 text-white text-sm font-semibold cursor-pointer"
          >
            {FAULTS[fault].fix}
          </button>
          {fixMsg && <p className="text-sm text-emerald-300">{fixMsg}</p>}
          {fixed.includes(fault) && (
            <button
              type="button"
              onClick={() => {
                setMode('learn');
                setStep(0);
              }}
              className="text-xs text-cyan-300 underline cursor-pointer"
            >
              Проиграть исправный обмен
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {Object.keys(TERMS).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTerm(term === t ? null : t)}
            className={`px-2 py-1 rounded-lg text-[11px] border cursor-pointer ${
              term === t ? 'border-cyan-400 text-cyan-200' : 'border-slate-700 text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {term && <p className="text-xs text-slate-300">{TERMS[term]}</p>}
    </div>
  );
};

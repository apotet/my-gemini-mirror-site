import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const mac = {
  pc: '02:00:00:00:01:10',
  lan: '02:00:00:00:01:01',
  wan: '02:00:00:00:02:01',
  server: '02:00:00:00:02:20',
  broadcast: 'ff:ff:ff:ff:ff:ff',
};
const ip = { pc: '192.168.1.10', lan: '192.168.1.1', wan: '192.168.2.1', server: '192.168.2.20' };

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
  path: string;
  text: string;
  frame: Frame | null;
  active: 'pc' | 'switch' | 'router' | 'server';
  say: string[];
  route: Array<'pc' | 'switch' | 'router' | 'server'>;
  question?: { prompt: string; options: string[]; correct: number };
  cache?: string;
}

const STEPS: Step[] = [
  {
    title: 'Выбор маршрута',
    path: 'ПК',
    text: 'ПК сравнивает /24: сервер вне 192.168.1.0/24. Следующий узел — шлюз 192.168.1.1. ARP-кэши пусты.',
    frame: null,
    active: 'pc',
    say: ['Сервер в другой подсети.', 'Нужен MAC шлюза.'],
    route: [],
  },
  {
    title: 'Кто знает шлюз?',
    path: 'ПК → Коммутатор → Маршрутизатор',
    text: 'ПК запрашивает MAC шлюза, а не сервера. Коммутатор раздаёт broadcast в LAN; маршрутизатор не передаёт ARP в другую подсеть.',
    frame: arp('pc', 'lan', 'lan'),
    active: 'pc',
    say: ['Кто знает MAC шлюза?', 'ARP-запрос всем в LAN.'],
    route: ['pc', 'switch', 'router'],
    cache: 'ARP ПК → 02:00:00:00:01:10',
    question: { prompt: 'Чей MAC нужно узнать?', options: ['Шлюза 192.168.1.1', 'Сервера 192.168.2.20'], correct: 0 },
  },
  {
    title: 'ARP-ответ шлюза',
    path: 'Маршрутизатор → Коммутатор → ПК',
    text: 'Шлюз изучил отправителя запроса. ПК принимает unicast-ответ и сохраняет MAC шлюза.',
    frame: arp('lan', 'pc', 'pc', true),
    active: 'router',
    say: ['Я — шлюз. Вот мой MAC.'],
    route: ['router', 'switch', 'pc'],
  },
  {
    title: 'Echo Request до шлюза',
    path: 'ПК → Коммутатор → Маршрутизатор',
    text: 'Ethernet адресован следующему узлу. IP назначения остаётся адресом сервера. Коммутатор передаёт кадр без изменения TTL.',
    frame: echo('pc', 'lan'),
    active: 'pc',
    say: ['Кадр шлюзу.', 'IP-пакет — серверу.'],
    route: ['pc', 'switch', 'router'],
    question: { prompt: 'Какой Ethernet destination?', options: [mac.lan, mac.server], correct: 0 },
  },
  {
    title: 'Маршрутизатор ищет сервер',
    path: 'Маршрутизатор → Сервер',
    text: 'Входной Ethernet снят. Есть connected маршрут 192.168.2.0/24; TTL пакета уменьшается 64 → 63. Для нового кадра нужен MAC сервера.',
    frame: arp('wan', 'server', 'server'),
    active: 'router',
    say: ['Снимаю Ethernet. TTL 64 → 63.', 'Теперь нужен MAC сервера.'],
    route: ['router', 'server'],
  },
  {
    title: 'ARP-ответ сервера',
    path: 'Сервер → Маршрутизатор',
    text: 'Сервер изучил MAC своего шлюза из ARP-запроса. Маршрутизатор сохраняет MAC сервера.',
    frame: arp('server', 'wan', 'wan', true),
    active: 'server',
    say: ['Это мой IP. Вот мой MAC.'],
    route: ['server', 'router'],
  },
  {
    title: 'Доставка запроса',
    path: 'Маршрутизатор → Сервер',
    text: 'Новый Ethernet: MAC выходного интерфейса → MAC сервера. IP source/destination сохранены: NAT нет. TTL 63.',
    frame: echo('wan', 'server', false, true),
    active: 'router',
    say: ['Новый Ethernet, те же IP.', 'Отправляю серверу: TTL 63.'],
    route: ['router', 'server'],
    question: { prompt: 'Какой TTL получит сервер?', options: ['63', '64', '62'], correct: 0 },
  },
  {
    title: 'Echo Reply к шлюзу',
    path: 'Сервер → Маршрутизатор',
    text: 'Сервер создаёт новый ответ с TTL 64, type 0. Обратный default маршрут через 192.168.2.1; MAC уже известен.',
    frame: echo('server', 'wan', true),
    active: 'server',
    say: ['Ping получен. Ответ шлюзу.', 'Новый пакет: TTL 64.'],
    route: ['server', 'router'],
  },
  {
    title: 'Ответ через коммутатор к ПК',
    path: 'Маршрутизатор → Коммутатор → ПК',
    text: 'Connected маршрут 192.168.1.0/24. Новый Ethernet к ПК, TTL ответа 63. ARP ПК уже известен. ПК получает Echo Reply.',
    frame: echo('lan', 'pc', true, true),
    active: 'pc',
    say: ['Ответ в LAN. TTL 64 → 63.', 'ПК получает Echo Reply.'],
    route: ['router', 'switch', 'pc'],
  },
];

const TERMS: Record<string, string> = {
  ARP: 'ARP узнаёт MAC локального следующего узла по его IPv4. Запрос не проходит через маршрутизатор.',
  MAC: 'MAC — адрес интерфейса в Ethernet-кадре. На каждом маршрутизируемом участке заголовок создаётся заново.',
  TTL: 'TTL — оставшееся число переходов. Маршрутизатор уменьшает его на 1; коммутатор — нет.',
  Подсеть: 'При /24 первые три октета — сетевая часть. 192.168.1 и 192.168.2 различаются: нужен шлюз.',
  Ethernet: 'Ethernet-кадр несёт пакет по одному L2-сегменту к MAC следующего узла.',
};

const points = { pc: [100, 145], switch: [350, 145], router: [625, 145], server: [890, 145] } as const;
const names = { pc: 'ПК', switch: 'Коммутатор', router: 'Маршрутизатор', server: 'Сервер' };
const subs: Record<string, string[]> = {
  pc: ['192.168.1.10 /24', 'шлюз 192.168.1.1'],
  switch: ['Одна VLAN · L2'],
  router: ['LAN 192.168.1.1 /24', 'WAN 192.168.2.1 /24'],
  server: ['192.168.2.20 /24', 'шлюз 192.168.2.1'],
};

export const PacketJourney: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [term, setTerm] = useState<string | null>(null);
  const current = STEPS[step];
  const answered = current.question ? answers[step] !== undefined : true;
  const choice = answers[step];

  const packetLabel = useMemo(() => {
    const f = current.frame;
    if (!f) return null;
    if (f.ARP?.operation === 'Request') return 'ARP ?';
    if (f.ARP?.operation === 'Reply') return 'ARP ✓';
    if (f.ICMP?.type === 8) return 'ping →';
    return 'reply ←';
  }, [current]);

  const end = current.route.at(-1);
  const bubbleAt = points[current.active];

  return (
    <div className="space-y-3 max-w-5xl mx-auto">
      <div>
        <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">Обучение</div>
        <h2 className="text-lg sm:text-xl font-bold text-white">Отправь ping на сервер</h2>
        <p className="text-xs text-slate-400">Доставь ping от ПК к серверу</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1b2b] p-2 sm:p-3">
        <svg viewBox="0 0 1000 300" className="w-full h-auto" role="img" aria-label="ПК — коммутатор — маршрутизатор — сервер">
          <rect x="5" y="5" width="622" height="282" rx="18" fill="#35d0c80a" stroke="#35d0c855" strokeDasharray="5 5" />
          <rect x="638" y="5" width="357" height="282" rx="18" fill="#5da9ff0a" stroke="#5da9ff55" strokeDasharray="5 5" />
          <text x="18" y="25" fill="#7ce8d4" fontSize="12">LAN · 192.168.1.0/24</text>
          <text x="700" y="25" fill="#7ce8d4" fontSize="12">192.168.2.0/24</text>

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

          {(Object.keys(points) as Array<keyof typeof points>).map((id) => {
            const [x, y] = points[id];
            const active = current.active === id;
            return (
              <g key={id} transform={`translate(${x} ${y})`}>
                <path d={icons[id]} fill={active ? '#16494e' : '#102b40'} stroke={active ? '#35d0c8' : '#a4bed4'} strokeWidth="2" />
                <text x="0" y="52" textAnchor="middle" fill="#e7f2fc" fontSize="13">
                  {names[id]}
                </text>
                {subs[id].map((line, i) => (
                  <text key={line} x="0" y={68 + i * 13} textAnchor="middle" fill="#a8b7c7" fontSize="11">
                    {line}
                  </text>
                ))}
              </g>
            );
          })}

          {current.cache && (
            <text x={points.router[0]} y={points.router[1] + 100} textAnchor="middle" fill="#a6e4c8" fontSize="10">
              {current.cache}
            </text>
          )}

          {step === 0 && (
            <text x="280" y="275" fill="#fbbf24" fontSize="12">
              192.168.1 ≠ 192.168.2 → шлюз
            </text>
          )}

          {step > 0 && (
            <g>
              <rect
                x={Math.max(8, bubbleAt[0] - 110)}
                y="40"
                width="230"
                height={current.say.length * 17 + 14}
                rx="9"
                fill="#153d43"
                stroke="#35d0c8"
              />
              {current.say.map((t, i) => (
                <text key={t} x={Math.max(8, bubbleAt[0] - 110) + 8} y={59 + i * 17} fill="#e6fffc" fontSize="12">
                  {t}
                </text>
              ))}
            </g>
          )}

          {packetLabel && end && (
            <g transform={`translate(${points[end][0]} ${points[end][1]})`}>
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
            </g>
          )}
        </svg>

        <div className="flex flex-wrap items-center gap-2 mt-2 px-1">
          <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-sm cursor-pointer">
            <ChevronLeft className="w-4 h-4 inline" /> Назад
          </button>
          <button
            type="button"
            disabled={!answered}
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="px-3 py-2 rounded-xl bg-cyan-600 text-white text-sm font-semibold cursor-pointer disabled:opacity-40"
          >
            Следующий шаг <ChevronRight className="w-4 h-4 inline" />
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setAnswers({});
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 inline" /> Начать заново
          </button>
          <span className="ml-auto text-xs text-slate-400 font-mono">
            {step + 1} / {STEPS.length} · {current.title}
          </span>
        </div>
      </div>

      {current.question && (
        <div className="rounded-xl border-l-4 border-amber-400 bg-amber-400/5 p-3 space-y-2">
          <div className="text-sm font-semibold">{current.question.prompt}</div>
          <div className="flex flex-wrap gap-1.5">
            {current.question.options.map((opt, i) => {
              const picked = choice === i;
              const ok = i === current.question!.correct;
              const show = choice !== undefined;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [step]: i }))}
                  className={`px-3 py-1.5 rounded-lg text-xs border cursor-pointer ${
                    show && picked && ok
                      ? 'border-emerald-400 bg-emerald-950/40'
                      : show && picked && !ok
                        ? 'border-rose-400 bg-rose-950/40'
                        : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {current.frame && (
        <div className="rounded-2xl border border-slate-800 p-3 sm:p-4 space-y-3">
          <h3 className="text-sm font-bold">
            {current.frame.ARP
              ? `ARP · ${current.frame.ARP.operation === 'Request' ? 'запрос · broadcast' : 'ответ · unicast'}`
              : `ICMP · ${current.frame.ICMP?.type === 8 ? 'Echo Request' : 'Echo Reply'}`}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <div className="text-slate-500 mb-1">MAC откуда</div>
              <div className="font-mono break-all">{current.frame.Ethernet.source}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">MAC куда</div>
              <div className="font-mono break-all">{current.frame.Ethernet.destination}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">IP откуда</div>
              <div className="font-mono">{current.frame.IP?.source ?? '— (ARP без IP)'}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">IP куда</div>
              <div className="font-mono">{current.frame.IP?.destination ?? '— (ARP без IP)'}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">TTL</div>
              <div className="font-mono">{current.frame.IP?.TTL ?? '— (ARP без IP)'}</div>
            </div>
          </div>
          <p className="text-sm text-slate-300">{current.text}</p>
        </div>
      )}

      {!current.frame && <p className="text-sm text-slate-300 px-1">{current.text}</p>}

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

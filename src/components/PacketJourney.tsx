import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const mac = {
  pc: '02:00:00:00:01:10',
  lan: '02:00:00:00:01:01',
  wan: '02:00:00:00:02:01',
  server: '02:00:00:00:02:20',
  broadcast: 'ff:ff:ff:ff:ff:ff',
};
const ip = {
  pc: '192.168.1.10',
  lan: '192.168.1.1',
  wan: '192.168.2.1',
  server: '192.168.2.20',
};

type Frame = {
  Ethernet: { source: string; destination: string; type: string };
  ARP: {
    operation: string;
    senderIP: string;
    senderMAC: string;
    targetIP: string;
    targetMAC: string;
  } | null;
  IP: { source: string; destination: string; TTL: number; protocol: number } | null;
  ICMP: { type: number; code: number } | null;
};

function arp(src: keyof typeof mac, dst: keyof typeof mac, target: keyof typeof ip, reply = false): Frame {
  return {
    Ethernet: {
      source: mac[src],
      destination: reply ? mac[dst] : mac.broadcast,
      type: '0x0806',
    },
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
      protocol: 1,
    },
    ICMP: { type: reverse ? 0 : 8, code: 0 },
  };
}

interface Step {
  title: string;
  path: string;
  text: string;
  frame: Frame | null;
  question?: { prompt: string; options: string[]; correct: number };
  active: 'pc' | 'sw' | 'r1' | 'srv';
}

const STEPS: Step[] = [
  {
    title: 'Выбор маршрута',
    path: 'ПК',
    text: 'ПК сравнивает /24: сервер вне 192.168.1.0/24. Следующий узел — шлюз 192.168.1.1. ARP-кэши пусты.',
    frame: null,
    active: 'pc',
  },
  {
    title: 'Кто знает шлюз?',
    path: 'ПК → Коммутатор → Маршрутизатор',
    text: 'ПК запрашивает MAC шлюза, а не сервера. Коммутатор раздаёт broadcast в LAN; маршрутизатор не передаёт ARP в другую подсеть.',
    frame: arp('pc', 'lan', 'lan'),
    question: { prompt: 'Чей MAC нужно узнать?', options: ['Шлюза 192.168.1.1', 'Сервера 192.168.2.20'], correct: 0 },
    active: 'pc',
  },
  {
    title: 'ARP-ответ шлюза',
    path: 'Маршрутизатор → Коммутатор → ПК',
    text: 'Шлюз изучил отправителя запроса. ПК принимает unicast-ответ и сохраняет MAC шлюза.',
    frame: arp('lan', 'pc', 'pc', true),
    active: 'r1',
  },
  {
    title: 'Echo Request до шлюза',
    path: 'ПК → Коммутатор → Маршрутизатор',
    text: 'Ethernet адресован следующему узлу. IP назначения остаётся адресом сервера. Коммутатор передаёт кадр без изменения TTL.',
    frame: echo('pc', 'lan'),
    question: { prompt: 'Какой Ethernet destination?', options: [mac.lan, mac.server], correct: 0 },
    active: 'pc',
  },
  {
    title: 'Маршрутизатор ищет сервер',
    path: 'Маршрутизатор → Сервер',
    text: 'Входной Ethernet снят. Есть connected маршрут 192.168.2.0/24; TTL пакета уменьшается 64 → 63. Для нового кадра нужен MAC сервера.',
    frame: arp('wan', 'server', 'server'),
    active: 'r1',
  },
  {
    title: 'ARP-ответ сервера',
    path: 'Сервер → Маршрутизатор',
    text: 'Сервер изучил MAC своего шлюза из ARP-запроса. Маршрутизатор сохраняет MAC сервера.',
    frame: arp('server', 'wan', 'wan', true),
    active: 'srv',
  },
  {
    title: 'Доставка запроса',
    path: 'Маршрутизатор → Сервер',
    text: 'Новый Ethernet: MAC выходного интерфейса → MAC сервера. IP source/destination сохранены: NAT нет. TTL 63.',
    frame: echo('wan', 'server', false, true),
    question: { prompt: 'Какой TTL получит сервер?', options: ['63', '64', '62'], correct: 0 },
    active: 'r1',
  },
  {
    title: 'Echo Reply к шлюзу',
    path: 'Сервер → Маршрутизатор',
    text: 'Сервер создаёт новый ответ с TTL 64, type 0. Обратный default маршрут через 192.168.2.1; MAC уже известен.',
    frame: echo('server', 'wan', true),
    active: 'srv',
  },
  {
    title: 'Ответ через коммутатор к ПК',
    path: 'Маршрутизатор → Коммутатор → ПК',
    text: 'Connected маршрут 192.168.1.0/24. Новый Ethernet к ПК, TTL ответа 63. ARP ПК уже известен. ПК получает Echo Reply.',
    frame: echo('lan', 'pc', true, true),
    active: 'pc',
  },
];

const TERMS: Record<string, string> = {
  ARP: 'ARP узнаёт MAC локального следующего узла по его IPv4. Запрос не проходит через маршрутизатор.',
  MAC: 'MAC — адрес интерфейса в Ethernet-кадре. На каждом маршрутизируемом участке заголовок создаётся заново.',
  TTL: 'TTL — оставшееся число переходов. Маршрутизатор уменьшает его на 1; коммутатор — нет.',
  Подсеть: 'При /24 первые три октета — сетевая часть. 192.168.1 и 192.168.2 различаются: нужен шлюз.',
  Ethernet: 'Ethernet-кадр несёт пакет по одному L2-сегменту к MAC следующего узла.',
};

const NODES = [
  { id: 'pc', title: 'ПК', lines: ['192.168.1.10 /24', 'шлюз 192.168.1.1'] },
  { id: 'sw', title: 'Коммутатор', lines: ['Одна VLAN · L2'] },
  { id: 'r1', title: 'Маршрутизатор', lines: ['LAN 192.168.1.1 /24', 'WAN 192.168.2.1 /24'] },
  { id: 'srv', title: 'Сервер', lines: ['192.168.2.20 /24', 'шлюз 192.168.2.1'] },
] as const;

export const PacketJourney: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [term, setTerm] = useState<string | null>(null);
  const current = STEPS[step];
  const answered = current.question ? answers[step] !== undefined : true;
  const choice = answers[step];

  const frameLines = useMemo(() => {
    const f = current.frame;
    if (!f) return null;
    const lines = [
      `Ethernet ${f.Ethernet.type}`,
      `src ${f.Ethernet.source}`,
      `dst ${f.Ethernet.destination}`,
    ];
    if (f.ARP) {
      lines.push(`ARP ${f.ARP.operation}`);
      lines.push(`${f.ARP.senderIP} → ${f.ARP.targetIP}`);
    }
    if (f.IP) {
      lines.push(`IP ${f.IP.source} → ${f.IP.destination}`);
      lines.push(`TTL ${f.IP.TTL}`);
    }
    if (f.ICMP) lines.push(`ICMP type ${f.ICMP.type}`);
    return lines;
  }, [current]);

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">Обучение</div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Путь пакета</h2>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {step + 1} / {STEPS.length} · {current.title}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3 sm:p-4 space-y-3">
        <div className="text-sm font-semibold text-white">Отправь ping на сервер</div>
        <p className="text-xs text-slate-400">Доставь ping от ПК к серверу. 192.168.1 ≠ 192.168.2 → шлюз.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {NODES.map((n) => (
            <div
              key={n.id}
              className={`p-2 rounded-xl border text-[11px] ${
                current.active === n.id ? 'border-cyan-400 bg-slate-900' : 'border-slate-700 bg-slate-900/50'
              }`}
            >
              <div className="font-semibold text-slate-100">{n.title}</div>
              {n.lines.map((l) => (
                <div key={l} className="text-slate-400">
                  {l}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 space-y-1">
          <div className="text-[11px] font-mono text-cyan-300">{current.path}</div>
          <div className="text-sm font-semibold text-white">{current.title}</div>
          <p className="text-sm text-slate-300 leading-relaxed">{current.text}</p>
        </div>

        {frameLines && (
          <div className="rounded-xl bg-blue-950/30 border border-blue-500/30 p-3 font-mono text-[11px] text-slate-200 space-y-0.5">
            {frameLines.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        )}

        {current.question && (
          <div className="space-y-2">
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
                        ? 'border-emerald-400 bg-emerald-950/40 text-emerald-100'
                        : show && picked && !ok
                          ? 'border-rose-400 bg-rose-950/40 text-rose-100'
                          : 'border-slate-700 bg-slate-900 text-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {choice !== undefined && (
              <div className={`text-xs ${choice === current.question.correct ? 'text-emerald-300' : 'text-rose-300'}`}>
                {choice === current.question.correct ? 'Верно.' : 'Неверно. Правильный вариант отмечен после выбора.'}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 inline" /> Назад
          </button>
          <button
            type="button"
            disabled={!answered}
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-semibold cursor-pointer disabled:opacity-40"
          >
            Дальше <ChevronRight className="w-3.5 h-3.5 inline" />
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setAnswers({});
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 inline" /> Заново
          </button>
        </div>

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
    </div>
  );
};

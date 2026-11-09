import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

type ViewId = 'scheme' | 'hops' | 'node';
type DeviceId = 'pc' | 'sw' | 'r1' | 'srv';

interface Frame {
  srcMac: string;
  dstMac: string;
  srcIp: string;
  dstIp: string;
  ttl: number;
  payload: string;
}

interface Hop {
  id: string;
  device: DeviceId;
  label: string;
  title: string;
  what: string;
  note: string;
  frame: Frame;
  changed?: string[];
}

const PC = {
  ip: '192.168.1.10',
  mask: '255.255.255.0',
  prefix: 24,
  gw: '192.168.1.1',
  mac: '00:11:22:AA:BB:10',
};
const GW_MAC = '00:11:22:GW:01:01';
const SRV = { ip: '192.168.2.20', mac: '00:11:22:SR:20:20' };
const LOCAL = { ip: '192.168.1.50', mac: '00:11:22:PC:50:50' };

const VIEW_KEY = 'packet-journey-view';

function inSubnet(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;
  return parts[0] === 192 && parts[1] === 168 && parts[2] === 1;
}

function isIp(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  return parts.length === 4 && parts.every((n) => !Number.isNaN(n) && n >= 0 && n <= 255);
}

function buildHops(dest: string): Hop[] | null {
  if (!isIp(dest)) return null;

  if (dest === PC.ip) {
    return [
      {
        id: 'self',
        device: 'pc',
        label: 'PC',
        title: 'Локальный адрес',
        what: 'Пакет не покидает хост. ОС отвечает сама.',
        note: 'Ping на свой IP не идёт в сеть.',
        frame: {
          srcMac: PC.mac,
          dstMac: PC.mac,
          srcIp: PC.ip,
          dstIp: dest,
          ttl: 64,
          payload: 'ICMP Echo Request (local)',
        },
      },
    ];
  }

  if (inSubnet(dest)) {
    const dstMac = dest === LOCAL.ip ? LOCAL.mac : '??:??:??:??:??:??';
    return [
      {
        id: 'pc-onlink',
        device: 'pc',
        label: 'PC',
        title: 'Та же подсеть',
        what: `${dest} в 192.168.1.0/24. Next-hop не нужен, ARP за MAC получателя.`,
        note: 'Dst IP и Dst MAC оба принадлежат целевому хосту. Шлюз не используется.',
        frame: {
          srcMac: PC.mac,
          dstMac,
          srcIp: PC.ip,
          dstIp: dest,
          ttl: 64,
          payload: 'ICMP Echo Request',
        },
        changed: ['Dst MAC = MAC получателя, не шлюза'],
      },
      {
        id: 'sw-onlink',
        device: 'sw',
        label: 'SW',
        title: 'Коммутация L2',
        what: 'Коммутатор учит Src MAC и форвардит по CAM. Заголовки не меняет.',
        note: 'L2 не смотрит IP.',
        frame: {
          srcMac: PC.mac,
          dstMac,
          srcIp: PC.ip,
          dstIp: dest,
          ttl: 64,
          payload: 'ICMP Echo Request',
        },
        changed: ['ничего'],
      },
      {
        id: 'host',
        device: 'srv',
        label: 'Host',
        title: 'Ответ',
        what: 'Хост принимает кадр, отвечает Echo Reply. Обратный путь симметричный.',
        note: 'На обратном пути Src/Dst IP и MAC меняются местами.',
        frame: {
          srcMac: dstMac,
          dstMac: PC.mac,
          srcIp: dest,
          dstIp: PC.ip,
          ttl: 64,
          payload: 'ICMP Echo Reply',
        },
        changed: ['Src/Dst IP и MAC поменялись местами'],
      },
    ];
  }

  if (dest === SRV.ip || dest.startsWith('192.168.2.') || dest === '10.0.0.1') {
    const unreachable = dest === '10.0.0.1';
    const hops: Hop[] = [
      {
        id: 'pc',
        device: 'pc',
        label: 'PC',
        title: 'Другая подсеть',
        what: `${dest} не в /24. Next-hop = шлюз ${PC.gw}. ARP за MAC шлюза.`,
        note: 'Dst IP — цель. Dst MAC — шлюз.',
        frame: {
          srcMac: PC.mac,
          dstMac: GW_MAC,
          srcIp: PC.ip,
          dstIp: dest,
          ttl: 64,
          payload: 'ICMP Echo Request',
        },
        changed: ['Dst MAC = MAC шлюза'],
      },
      {
        id: 'sw',
        device: 'sw',
        label: 'SW',
        title: 'Коммутация к шлюзу',
        what: 'SW учит MAC ПК и форвардит кадр на порт роутера. Заголовки те же.',
        note: 'Коммутатор не меняет IP и MAC.',
        frame: {
          srcMac: PC.mac,
          dstMac: GW_MAC,
          srcIp: PC.ip,
          dstIp: dest,
          ttl: 64,
          payload: 'ICMP Echo Request',
        },
        changed: ['ничего'],
      },
      {
        id: 'r1',
        device: 'r1',
        label: 'R1',
        title: unreachable ? 'Нет маршрута' : 'Маршрутизация',
        what: unreachable
          ? 'R1 снимает L2, смотрит таблицу: маршрута к 10.0.0.1 нет. ICMP Network Unreachable.'
          : 'R1 снимает L2, TTL−1, longest prefix match, новая L2 к серверу.',
        note: unreachable
          ? 'Пакет дальше не идёт.'
          : 'IP получателя не менялся. MAC уже сервера.',
        frame: {
          srcMac: unreachable ? GW_MAC : '00:11:22:R1:02:01',
          dstMac: unreachable ? PC.mac : SRV.mac,
          srcIp: unreachable ? PC.gw : PC.ip,
          dstIp: dest,
          ttl: unreachable ? 64 : 63,
          payload: unreachable ? 'ICMP Network Unreachable' : 'ICMP Echo Request',
        },
        changed: unreachable ? ['ответ Unreachable с GW'] : ['TTL 64→63', 'новый Dst MAC сервера'],
      },
    ];
    if (!unreachable) {
      hops.push({
        id: 'srv',
        device: 'srv',
        label: 'Srv',
        title: 'Сервер',
        what: 'Сервер принимает кадр, отвечает Echo Reply. Обратный путь через тот же шлюз.',
        note: 'Reply: Src IP сервера, Dst IP ПК.',
        frame: {
          srcMac: SRV.mac,
          dstMac: '00:11:22:R1:02:01',
          srcIp: SRV.ip,
          dstIp: PC.ip,
          ttl: 64,
          payload: 'ICMP Echo Reply',
        },
        changed: ['Src/Dst IP поменялись'],
      });
    }
    return hops;
  }

  return [
    {
      id: 'noroute',
      device: 'pc',
      label: 'PC',
      title: 'Нет маршрута',
      what: `ПК не знает, куда слать ${dest}. Нет on-link и нет default route match в этой модели.`,
      note: 'Destination host unreachable.',
      frame: {
        srcMac: PC.mac,
        dstMac: '—',
        srcIp: PC.ip,
        dstIp: dest,
        ttl: 64,
        payload: 'не отправлен',
      },
    },
  ];
}

function loadView(): ViewId {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === 'scheme' || v === 'hops' || v === 'node') return v;
  } catch {
    /* ignore */
  }
  return 'scheme';
}

export const PacketJourney: React.FC = () => {
  const [view, setView] = useState<ViewId>(loadView);
  const [lines, setLines] = useState<string[]>([
    'Введите ping <ip>. Пример: ping 192.168.2.20',
    'Также: arp -a · ipconfig · help',
  ]);
  const [input, setInput] = useState('');
  const [hops, setHops] = useState<Hop[] | null>(null);
  const [hopIndex, setHopIndex] = useState(0);
  const [node, setNode] = useState<DeviceId>('pc');
  const [arp, setArp] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* ignore */
    }
  }, [view]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [lines]);

  const hop = hops?.[hopIndex] ?? null;

  const push = (text: string) => setLines((prev) => [...prev, text]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    push(`PC> ${cmd}`);
    const [head, arg] = cmd.split(/\s+/);
    const h = head.toLowerCase();

    if (h === 'help' || h === '?') {
      push('ping <ip> · arp -a · ipconfig · clear');
      return;
    }
    if (h === 'clear') {
      setLines([]);
      setHops(null);
      setHopIndex(0);
      return;
    }
    if (h === 'ipconfig' || h === 'ifconfig') {
      push(`IP ${PC.ip}/${PC.prefix}  mask ${PC.mask}`);
      push(`GW ${PC.gw}  MAC ${PC.mac}`);
      return;
    }
    if (h === 'arp') {
      const entries = Object.entries(arp);
      if (entries.length === 0) push('ARP cache empty');
      else entries.forEach(([ip, mac]) => push(`${ip}  ${mac}`));
      return;
    }
    if (h === 'ping') {
      if (!arg || !isIp(arg)) {
        push('Usage: ping <ipv4>');
        return;
      }
      const next = buildHops(arg);
      if (!next) {
        push('Некорректный адрес');
        return;
      }
      if (inSubnet(arg) && arg !== PC.ip) setArp((prev) => ({ ...prev, [arg]: LOCAL.mac }));
      else if (!inSubnet(arg)) setArp((prev) => ({ ...prev, [PC.gw]: GW_MAC }));
      setHops(next);
      setHopIndex(0);
      setNode(next[0].device);
      const last = next[next.length - 1];
      if (last.frame.payload.includes('Unreachable') || last.frame.payload === 'не отправлен') {
        push(`Reply from ${PC.gw}: Destination host unreachable`);
      } else if (arg === PC.ip) {
        push(`Reply from ${PC.ip}: time<1ms`);
      } else {
        push(`Reply from ${arg}: time=12ms`);
      }
      return;
    }
    push(`Unknown command: ${head}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(input);
    setInput('');
    inputRef.current?.focus();
  };

  const devices: { id: DeviceId; title: string; sub: string }[] = useMemo(
    () => [
      { id: 'pc', title: 'PC', sub: PC.ip },
      { id: 'sw', title: 'SW', sub: 'L2' },
      { id: 'r1', title: 'R1', sub: '.1.1 / .2.1' },
      { id: 'srv', title: 'Srv', sub: SRV.ip },
    ],
    [],
  );

  const topology = (
    <div className="flex items-center justify-between gap-1 text-[11px]">
      {devices.map((d, i) => (
        <React.Fragment key={d.id}>
          <button
            type="button"
            onClick={() => setNode(d.id)}
            className={`flex-1 p-2 rounded-xl border text-center cursor-pointer ${
              hop?.device === d.id
                ? 'border-cyan-400 bg-slate-900'
                : 'border-slate-700 bg-slate-900/60'
            }`}
          >
            <div className="font-semibold">{d.title}</div>
            <div className="text-slate-400">{d.sub}</div>
          </button>
          {i < devices.length - 1 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const terminal = (
    <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col min-h-[180px]">
      <div className="px-3 py-1.5 text-[10px] font-mono text-slate-500 border-b border-slate-800">PC</div>
      <div ref={logRef} className="flex-1 p-3 text-xs font-mono space-y-0.5 overflow-auto max-h-48">
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith('PC>')
                ? 'text-slate-200'
                : line.startsWith('Reply')
                  ? 'text-emerald-300'
                  : 'text-slate-400'
            }
          >
            {line}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex items-center gap-1 px-3 py-2 border-t border-slate-800">
        <span className="text-slate-500 text-xs font-mono">{'PC>'}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ping 192.168.2.20"
          className="flex-1 bg-transparent text-xs font-mono text-slate-100 outline-none"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </form>
    </div>
  );

  const inspector = hop ? (
    <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 text-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-white">{hop.title}</div>
        <div className="text-[10px] font-mono text-slate-500">
          {hopIndex + 1}/{hops?.length ?? 1}
        </div>
      </div>
      <p className="text-slate-300 leading-relaxed">{hop.what}</p>
      <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/30 font-mono text-[11px] space-y-0.5">
        <div>Src MAC: {hop.frame.srcMac}</div>
        <div>Dst MAC: <span className="text-cyan-300">{hop.frame.dstMac}</span></div>
        <div>Src IP: {hop.frame.srcIp}</div>
        <div>Dst IP: {hop.frame.dstIp}</div>
        <div>TTL: <span className="text-amber-300">{hop.frame.ttl}</span></div>
        <div>{hop.frame.payload}</div>
      </div>
      {hop.changed && hop.changed.length > 0 && (
        <div className="text-slate-400">Изменилось: {hop.changed.join(' · ')}</div>
      )}
      <div className="text-slate-400">{hop.note}</div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setHopIndex((i) => Math.max(0, i - 1))}
          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 text-[11px] cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5 inline" /> назад
        </button>
        <button
          type="button"
          onClick={() => setHopIndex((i) => Math.min((hops?.length ?? 1) - 1, i + 1))}
          className="px-2 py-1 rounded-lg bg-cyan-500 text-slate-950 text-[11px] font-semibold cursor-pointer"
        >
          дальше <ChevronRight className="w-3.5 h-3.5 inline" />
        </button>
      </div>
    </div>
  ) : (
    <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 text-xs text-slate-400">
      Введите ping, чтобы увидеть путь. Попробуйте:
      <div className="mt-2 space-y-1 font-mono text-cyan-300">
        <button type="button" onClick={() => run('ping 192.168.2.20')} className="block cursor-pointer">
          ping 192.168.2.20
        </button>
        <button type="button" onClick={() => run('ping 192.168.1.50')} className="block cursor-pointer">
          ping 192.168.1.50
        </button>
        <button type="button" onClick={() => run('ping 10.0.0.1')} className="block cursor-pointer">
          ping 10.0.0.1
        </button>
      </div>
    </div>
  );

  const hopsView = (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-cyan-500 text-slate-950 font-semibold text-[10px]">пакет</span>
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400"
            style={{ width: hops ? `${((hopIndex + 1) / hops.length) * 100}%` : '0%' }}
          />
        </div>
        <span className="text-slate-400">{hop ? `${hop.label}` : '—'}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-center">
        {(hops ?? [{ id: 'wait', label: 'ожидание', device: 'pc' as DeviceId }]).map((h, i) => (
          <button
            key={h.id}
            type="button"
            onClick={() => hops && setHopIndex(i)}
            className={`p-2 rounded-lg border ${
              i === hopIndex ? 'border-cyan-400 bg-slate-900' : 'border-slate-700 bg-slate-900/50'
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {terminal}
        {inspector}
      </div>
    </div>
  );

  const nodeHop = hops?.find((h) => h.device === node) ?? hop;
  const nodeView = (
    <div className="space-y-3">
      <div className="flex gap-1.5 text-xs overflow-x-auto">
        {devices.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setNode(d.id)}
            className={`px-3 py-1.5 rounded-lg shrink-0 cursor-pointer ${
              node === d.id ? 'bg-cyan-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {d.title}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {terminal}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 text-xs space-y-2">
          <div className="font-semibold">На {node.toUpperCase()}</div>
          {nodeHop && nodeHop.device === node ? (
            <>
              <p className="text-slate-300">{nodeHop.what}</p>
              <div className="font-mono text-[11px] text-slate-300">
                Dst MAC: {nodeHop.frame.dstMac}
                <br />
                Dst IP: {nodeHop.frame.dstIp}
                <br />
                TTL: {nodeHop.frame.ttl}
              </div>
            </>
          ) : (
            <p className="text-slate-400">На этом узле в текущем ping нет события. Смените адрес или вид.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">Интерактивная симуляция</div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Путь пакета</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 self-start">
            {(
              [
                ['scheme', 'Схема'],
                ['hops', 'Хопы'],
                ['node', 'Узел'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  view === id ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setHops(null);
              setHopIndex(0);
              setLines(['Введите ping <ip>.']);
            }}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
            title="Сброс"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3 sm:p-4 space-y-3">
        {view === 'scheme' && (
          <>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Топология</span>
              <span className="text-cyan-300">{hop ? `пакет на ${hop.label}` : 'ожидание команды'}</span>
            </div>
            {topology}
            <div className="grid sm:grid-cols-2 gap-3">
              {terminal}
              {inspector}
            </div>
          </>
        )}
        {view === 'hops' && hopsView}
        {view === 'node' && nodeView}
      </div>
    </div>
  );
};

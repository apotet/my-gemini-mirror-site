import React, { useState } from 'react';
import type { ConceptId } from '../types';

interface SubnetBitVisualizerProps {
  mode: 'ipv4-mask' | 'ipv4-ranges' | 'ipv4-subnet' | 'ipv6-slaac';
  concept: ConceptId;
  isMobile: boolean;
}

const IPV4_SPECIAL_RANGES = [
  {
    cidr: '10.0.0.0/8',
    name: 'Частная сеть класса A (RFC 1918)',
    range: '10.0.0.0 — 10.255.255.255',
    internet: 'Не маршрутизируется в Интернете',
    usage: 'Крупные корпоративные сети, филиалы, ЦОД и облачные VPC.',
  },
  {
    cidr: '172.16.0.0/12',
    name: 'Частная сеть (RFC 1918)',
    range: '172.16.0.0 — 172.31.255.255',
    internet: 'Не маршрутизируется в Интернете',
    usage: 'Корпоративные сегменты и контейнеры Docker. Внимание: 172.32.0.1 — уже публичный адрес.',
  },
  {
    cidr: '192.168.0.0/16',
    name: 'Частная сеть (RFC 1918)',
    range: '192.168.0.0 — 192.168.255.255',
    internet: 'Не маршрутизируется в Интернете',
    usage: 'Малые офисы, домашние роутеры, лабораторные стенды.',
  },
  {
    cidr: '169.254.0.0/16',
    name: 'Link-Local / APIPA (RFC 3927)',
    range: '169.254.0.1 — 169.254.255.254',
    internet: 'Только локальный L2-сегмент',
    usage: 'Сигнал диагностики: хост не получил ответ от DHCP-сервера. Проверьте VLAN и DHCP Relay.',
  },
  {
    cidr: '100.64.0.0/10',
    name: 'Операторский CGNAT (RFC 6598)',
    range: '100.64.0.0 — 100.127.255.255',
    internet: 'Внутренняя сеть провайдера',
    usage: 'WAN-интерфейс роутера за операторским NAT; проброс портов снаружи без белого IP не сработает.',
  },
  {
    cidr: '127.0.0.0/8',
    name: 'Loopback (RFC 1122)',
    range: '127.0.0.1 — 127.255.255.254',
    internet: 'Только внутри самого хоста',
    usage: 'Проверка исправности локального TCP/IP-стека (ping 127.0.0.1) без выхода в кабель.',
  },
];

const IPV6_EXAMPLES = [
  {
    id: 'gua',
    label: 'Global Unicast (GUA)',
    prefix: '2001:db8:42:10::',
    interfaceId: '1a2b:3cff:fe4d:5e6f',
    prefixLen: '/64',
    scope: 'Глобальная маршрутизация в Интернете',
    source: 'Префикс приходит от маршрутизатора в ICMPv6 Router Advertisement (SLAAC).',
  },
  {
    id: 'll',
    label: 'Link-Local',
    prefix: 'fe80::',
    interfaceId: '1a2b:3cff:fe4d:5e6f',
    prefixLen: '/10 (подсеть /64)',
    scope: 'Строго один L2-сегмент (не пересылается роутером)',
    source: 'Формируется автоматически на каждом интерфейсе; используется как next-hop и для Neighbor Discovery.',
  },
  {
    id: 'ula',
    label: 'Unique Local (ULA)',
    prefix: 'fd12:3456:789a:1::',
    interfaceId: '0000:0000:0000:0010',
    prefixLen: '/48 → /64',
    scope: 'Внутренняя маршрутизация организации',
    source: 'Аналог RFC 1918 в мире IPv6: стабильная внутренняя адресация без привязки к провайдеру.',
  },
];

function computeSubnet(prefix: number) {
  const hostBits = 32 - prefix;
  const blockSize = Math.pow(2, hostBits);
  const usableHosts = Math.max(0, blockSize - 2);
  const lastOctetMask = 256 - blockSize;
  const mask = `255.255.255.${lastOctetMask}`;
  const network = '192.168.10.0';
  const firstHost = '192.168.10.1';
  const lastHost = `192.168.10.${blockSize - 2}`;
  const broadcast = `192.168.10.${blockSize - 1}`;
  const nextSubnet = blockSize < 256 ? `192.168.10.${blockSize}/${prefix}` : `192.168.11.0/${prefix}`;
  const fourthOctetBits = Array.from({ length: 8 }, (_, idx) => idx < prefix - 24);
  return {
    hostBits,
    blockSize,
    usableHosts,
    mask,
    network,
    firstHost,
    lastHost,
    broadcast,
    nextSubnet,
    fourthOctetBits,
  };
}

export const SubnetBitVisualizer: React.FC<SubnetBitVisualizerProps> = ({
  mode,
  concept,
  isMobile,
}) => {
  const [prefix, setPrefix] = useState<number>(mode === 'ipv4-subnet' ? 27 : 26);
  const [selectedRangeIdx, setSelectedRangeIdx] = useState<number>(3);
  const [selectedV6Idx, setSelectedV6Idx] = useState<number>(0);

  const shellClass =
    concept === 'textbook'
      ? 'border border-stone-200 dark:border-stone-800 bg-[#f6f3ec] dark:bg-[#1a1815] rounded-lg'
      : concept === 'academy'
        ? 'border border-slate-300 dark:border-slate-700/90 bg-slate-50 dark:bg-[#0e1726] rounded-lg'
        : 'border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/70 rounded-xl';

  const accentText =
    concept === 'textbook'
      ? 'text-[#1e40af] dark:text-blue-400'
      : concept === 'academy'
        ? 'text-blue-700 dark:text-sky-400'
        : 'text-sky-700 dark:text-sky-400';

  if (mode === 'ipv4-ranges') {
    const active = IPV4_SPECIAL_RANGES[selectedRangeIdx];
    return (
      <div className={`${shellClass} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Интерактивная карта диапазонов IPv4
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Выберите блок для проверки назначения
          </div>
        </div>

        <div className={`mt-3 grid gap-1.5 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {IPV4_SPECIAL_RANGES.map((item, idx) => {
            const isSelected = idx === selectedRangeIdx;
            return (
              <button
                key={item.cidr}
                type="button"
                onClick={() => setSelectedRangeIdx(idx)}
                className={`min-h-[42px] px-3 py-2 text-left rounded-lg border transition-colors font-mono-tech text-xs font-medium whitespace-nowrap ${
                  isSelected
                    ? concept === 'textbook'
                      ? 'bg-[#1e40af] text-white border-[#1e40af] dark:bg-blue-500 dark:border-blue-500 dark:text-slate-950'
                      : 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:border-sky-500 dark:text-slate-950'
                    : 'bg-white dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                {item.cidr}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{active.name}</div>
            <div className={`font-mono-tech text-xs font-semibold ${accentText}`}>{active.range}</div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Область действия: <span className="text-slate-800 dark:text-slate-200 font-medium">{active.internet}</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{active.usage}</p>
        </div>
      </div>
    );
  }

  if (mode === 'ipv6-slaac') {
    const active = IPV6_EXAMPLES[selectedV6Idx];
    return (
      <div className={`${shellClass} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Анатомия 128-битного адреса IPv6
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            64 бита сети + 64 бита интерфейса
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {IPV6_EXAMPLES.map((item, idx) => {
            const isSelected = idx === selectedV6Idx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedV6Idx(idx)}
                className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? concept === 'textbook'
                      ? 'bg-[#1e40af] text-white border-[#1e40af] dark:bg-blue-500 dark:border-blue-500 dark:text-slate-950'
                      : 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:border-sky-500 dark:text-slate-950'
                    : 'bg-white dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className={`mt-4 grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <div className="p-3 rounded-lg bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/70">
            <div className="text-xs text-sky-800 dark:text-sky-300 font-medium">
              Сетевой префикс · 64 бита ({active.prefixLen})
            </div>
            <div className="mt-1 font-mono-tech text-sm font-semibold text-slate-900 dark:text-slate-100 break-all">
              {active.prefix}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Идентификатор интерфейса · 64 бита
            </div>
            <div className="mt-1 font-mono-tech text-sm font-semibold text-slate-900 dark:text-slate-100 break-all">
              {active.interfaceId}
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Область действия: </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{active.scope}</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{active.source}</p>
        </div>
      </div>
    );
  }

  const info = computeSubnet(prefix);

  return (
    <div className={`${shellClass} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {mode === 'ipv4-subnet'
              ? 'Живой расчёт границ подсети IPv4'
              : 'Интерактивная граница маски IPv4'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Сдвиньте ползунок и посмотрите, как меняется четвёртый октет и число хостов
          </div>
        </div>
        <div className={`font-mono-tech text-lg font-bold ${accentText}`}>
          /{prefix}
        </div>
      </div>

      {/* Labeled slider */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
          <label htmlFor={`prefix-slider-${concept}-${mode}`} className="font-medium">
            Длина префикса CIDR: <span className="font-mono-tech font-semibold text-slate-900 dark:text-slate-100">/{prefix}</span> ({prefix} бит сети · {info.hostBits} бит хоста)
          </label>
          <span className="font-mono-tech text-slate-500 dark:text-slate-400">шаг {info.blockSize}</span>
        </div>
        <input
          id={`prefix-slider-${concept}-${mode}`}
          type="range"
          min={24}
          max={30}
          step={1}
          value={prefix}
          onChange={(e) => setPrefix(Number(e.target.value))}
          className="w-full h-2 rounded-lg accent-sky-600 dark:accent-sky-400 cursor-pointer"
        />
        <div className="flex justify-between font-mono-tech text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          {[24, 25, 26, 27, 28, 29, 30].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrefix(p)}
              className={`px-1 py-0.5 rounded transition-colors ${
                p === prefix ? 'text-slate-900 dark:text-slate-100 font-semibold' : 'hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              /{p}
            </button>
          ))}
        </div>
      </div>

      {/* 4th octet 8-bit visual strip */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span>Четвёртый октет маски (биты 25–32)</span>
          <span className="font-mono-tech">1 = сеть · 0 = хост</span>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {info.fourthOctetBits.map((isNet, i) => {
            const weight = Math.pow(2, 7 - i);
            return (
              <div
                key={weight}
                className={`py-2 px-1 rounded-md text-center border transition-colors ${
                  isNet
                    ? concept === 'textbook'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200'
                      : 'bg-sky-100/90 dark:bg-sky-950/70 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-200'
                    : 'bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-mono-tech text-sm font-bold leading-none">{isNet ? '1' : '0'}</div>
                <div className="font-mono-tech text-[10px] opacity-75 mt-1">{weight}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Numeric breakdown grid */}
      <div className={`mt-4 grid gap-2.5 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Десятичная маска</div>
          <div className="mt-0.5 font-mono-tech text-xs font-semibold text-slate-900 dark:text-slate-100">
            {info.mask}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Полезных хостов</div>
          <div className="mt-0.5 font-mono-tech text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {info.usableHosts} (из {info.blockSize})
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Диапазон хостов</div>
          <div className="mt-0.5 font-mono-tech text-xs font-semibold text-slate-900 dark:text-slate-100">
            .1 — .{info.blockSize - 2}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Broadcast / след.</div>
          <div className="mt-0.5 font-mono-tech text-xs font-semibold text-slate-900 dark:text-slate-100">
            .{info.blockSize - 1} · {info.nextSubnet.split('.').pop()}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Cable,
  Info,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  Network,
  Cpu,
  Terminal,
  Activity,
  Laptop,
  Check,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playClickSound, playSuccessSound, playErrorSound } from '../utils/sound';

// -------------------------------------------------------------
// TYPES & DEFINITIONS
// -------------------------------------------------------------
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
  wireX: number;
  wireY: number;
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
  tpid?: string;
  pcp?: number;
  dei?: number;
  frameSizeBytes: number;
  status: 'moving' | 'routing' | 'dropped' | 'delivered';
}

export interface TraceStep {
  stepIndex: number;
  title: string;
  detail: string;
  rule: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  activeDeviceId?: 'pc1' | 'pc2' | 'pc3' | 'pc4' | 'SW1' | 'SW2';
  activeLinkId?: 'pc1-sw1' | 'pc2-sw1' | 'sw1-sw2-trunk' | 'sw2-pc3' | 'sw2-pc4';
  pdu: TracePdu;
  actionType: 'tx' | 'access_ingress' | 'l3_svi_route' | 'trunk_tag' | 'trunk_transit' | 'trunk_egress' | 'access_egress' | 'rx_delivery' | 'drop';
  dropped?: boolean;
  dropReason?: string;
}

export interface Trace {
  steps: TraceStep[];
  outcome: Result;
  initialVlan: Vlan;
  finalVlan: Vlan;
}

export const HOSTS: HostInfo[] = [
  {
    id: 'pc1',
    name: 'PC-01',
    label: 'Бухгалтерия',
    switchId: 'SW1',
    port: 'Fa0/1',
    ip: '192.168.10.11',
    mac: '00:50:79:66:68:01',
    x: 100,
    y: 85,
    wireX: 148,
    wireY: 85,
  },
  {
    id: 'pc2',
    name: 'PC-02',
    label: 'Финансы',
    switchId: 'SW1',
    port: 'Fa0/2',
    ip: '192.168.20.12',
    mac: '00:50:79:66:68:02',
    x: 100,
    y: 275,
    wireX: 148,
    wireY: 275,
  },
  {
    id: 'pc3',
    name: 'PC-03',
    label: 'Инженеры',
    switchId: 'SW2',
    port: 'Fa0/1',
    ip: '192.168.10.13',
    mac: '00:50:79:66:68:03',
    x: 700,
    y: 85,
    wireX: 652,
    wireY: 85,
  },
  {
    id: 'pc4',
    name: 'PC-04',
    label: 'Разработка',
    switchId: 'SW2',
    port: 'Fa0/2',
    ip: '192.168.20.14',
    mac: '00:50:79:66:68:04',
    x: 700,
    y: 275,
    wireX: 652,
    wireY: 275,
  },
];

export const INITIAL_VLANS: Record<HostId, Vlan> = { pc1: 10, pc2: 20, pc3: 10, pc4: 20 };
export const INITIAL_TRUNKS: TrunkConfig = { left: [10, 20], right: [10, 20] };

// Switch Coordinates in ViewBox (800 x 360)
const SW1_POS = { x: 290, y: 180, fa1: { x: 228, y: 145 }, fa2: { x: 228, y: 215 }, gi1: { x: 352, y: 180 } };
const SW2_POS = { x: 510, y: 180, gi1: { x: 448, y: 180 }, fa1: { x: 572, y: 145 }, fa2: { x: 572, y: 215 } };

// -------------------------------------------------------------
// EVALUATION LOGIC
// -------------------------------------------------------------
function evaluateNetwork(
  source: HostId,
  target: HostId,
  vlans: Record<HostId, Vlan>,
  trunks: TrunkConfig,
  l3: L3Role
): Result {
  if (source === target) {
    return {
      delivered: false,
      crossed: false,
      tagged: false,
      message: 'Выбран один и тот же узел (петля на себя)',
      explanation: 'Хост не отправляет кадры самому себе через сетевой интерфейс. Выберите разные хосты источника и получателя.',
      ruleCitation: 'Split Horizon / L2 Loop Avoidance',
    };
  }

  const a = HOSTS.find((h) => h.id === source)!;
  const b = HOSTS.find((h) => h.id === target)!;
  const srcVlan = vlans[source];
  const dstVlan = vlans[target];
  const crossed = a.switchId !== b.switchId;

  // Case 1: Inter-VLAN Routing required
  if (srcVlan !== dstVlan) {
    if (l3 === 'none') {
      return {
        delivered: false,
        crossed,
        tagged: false,
        message: 'Аппаратная изоляция: между разными VLAN нет L3-маршрутизатора',
        explanation: `Хост ${a.name} находится в VLAN ${srcVlan}, а ${b.name} — в VLAN ${dstVlan}. На 2-м уровне OSI широковещательные домены изолированы. Без шлюза SVI (Switch Virtual Interface) или маршрутизатора кадр отбрасывается ASIC коммутатора.`,
        ruleCitation: 'IEEE 802.1Q Clause 5.1 (Traffic Isolation)',
      };
    }

    const sourceRemote = a.switchId !== l3;
    const targetRemote = b.switchId !== l3;
    const badVlans = (
      [sourceRemote ? srcVlan : null, targetRemote ? dstVlan : null] as (Vlan | null)[]
    ).filter(
      (v): v is Vlan =>
        v !== null && (!trunks.left.includes(v) || !trunks.right.includes(v))
    );

    if (badVlans.length > 0) {
      return {
        delivered: false,
        crossed: true,
        tagged: true,
        message: `Межсегментная маршрутизация прервана: VLAN ${badVlans.join(', ')} заблокирован на Trunk Gi0/1`,
        explanation: `Для работы маршрутизации через SVI на ${l3} входящий VLAN источника должен дойти до SVI, а VLAN получателя — дойти до удалённого коммутатора. На одном из транк-портов Gi0/1 отсутствует VLAN ${badVlans.join(', ')} в allowed-списке.`,
        ruleCitation: 'IEEE 802.1Q Clause 9.3 (VLAN Filtering by Port Ingress/Egress List)',
      };
    }

    return {
      delivered: true,
      crossed: sourceRemote || targetRemote,
      tagged: sourceRemote || targetRemote,
      message: `Успех! Выполнена L3-маршрутизация между VLAN ${srcVlan} и VLAN ${dstVlan} на ${l3}`,
      explanation: `Хост передал IP-пакет своему шлюзу SVI VLAN ${srcVlan} на ${l3}. Коммутатор 3-го уровня распаковал пакет, уменьшил TTL (64 ➔ 63), перезаписал MAC-заголовки и инкапсулировал пакет в кадр VLAN ${dstVlan}.`,
      ruleCitation: 'RFC 1812 (Requirements for IP Version 4 Routers) & Multilayer Switching',
    };
  }

  // Case 2: Intra-VLAN across Trunk
  if (crossed) {
    if (!trunks.left.includes(srcVlan) || !trunks.right.includes(srcVlan)) {
      return {
        delivered: false,
        crossed: true,
        tagged: true,
        message: `VLAN ${srcVlan} не разрешена в списке allowed vlan на магистрали Trunk`,
        explanation: `Коммутаторы SW1 и SW2 должны оба пропускать VLAN ${srcVlan} на портах Gi0/1. SW1: [${trunks.left.join(', ') || 'пусто'}], SW2: [${trunks.right.join(', ') || 'пусто'}]. Кадр отфильтрован аппаратным фильтром порта при выходе или входе.`,
        ruleCitation: 'Cisco IOS switchport trunk allowed vlan verification',
      };
    }

    return {
      delivered: true,
      crossed: true,
      tagged: true,
      message: `Кадр VLAN ${srcVlan} успешно доставлен через магистральный Trunk 802.1Q`,
      explanation: `Кадр вошёл как Untagged на access-порт, получил 4-байтный тег IEEE 802.1Q (VID=${srcVlan}) при выходе в Trunk Gi0/1, успешно пересёк магистраль, тег был срезан на выходе, и получатель принял чистый кадр Ethernet II.`,
      ruleCitation: 'IEEE 802.1Q Tagged Frame Format (TPID 0x8100 + TCI)',
    };
  }

  // Case 3: Intra-VLAN on Single Switch
  return {
    delivered: true,
    crossed: false,
    tagged: false,
    message: `Прямая L2-коммутация внутри VLAN ${srcVlan} на коммутаторе ${a.switchId}`,
    explanation: `Оба хоста (${a.name} и ${b.name}) подключены к одному и тому же коммутатору ${a.switchId} и принадлежат одному широковещательному домену (VLAN ${srcVlan}). Кадр передаётся напрямую между access-портами без добавления тега 802.1Q.`,
    ruleCitation: 'IEEE 802.1D MAC Bridging & TCAM Forwarding',
  };
}

// -------------------------------------------------------------
// TRACE GENERATION (Realistic, Physics-Accurate Vector Trajectory)
// -------------------------------------------------------------
function generateDetailedTrace(
  source: HostId,
  target: HostId,
  vlans: Record<HostId, Vlan>,
  trunks: TrunkConfig,
  l3: L3Role
): Trace {
  const outcome = evaluateNetwork(source, target, vlans, trunks, l3);
  const a = HOSTS.find((h) => h.id === source)!;
  const b = HOSTS.find((h) => h.id === target)!;
  const srcVlan = vlans[source];
  const dstVlan = vlans[target];

  const sw1AccessIn = a.port === 'Fa0/1' ? SW1_POS.fa1 : SW1_POS.fa2;
  const sw2AccessIn = a.port === 'Fa0/1' ? SW2_POS.fa1 : SW2_POS.fa2;
  const srcSwAccessCoord = a.switchId === 'SW1' ? sw1AccessIn : sw2AccessIn;

  const steps: TraceStep[] = [];

  // Step 0: Transmission initiation from Source Host
  steps.push({
    stepIndex: 0,
    title: `${a.name} (${a.label}): формирование Ethernet-кадра`,
    detail: `Сетевой стек хоста формирует стандартный нетегированный Ethernet II кадр (1518 байт). Сетевая карта ПК ничего не знает о VLAN и отправляет кадр через access-кабель на порт ${a.port}.`,
    rule: 'Хосты на Access-портах всегда генерируют чистые Untagged-кадры без тега 802.1Q.',
    from: { x: a.wireX, y: a.wireY },
    to: { x: srcSwAccessCoord.x, y: srcSwAccessCoord.y },
    activeDeviceId: a.id,
    activeLinkId: a.id === 'pc1' ? 'pc1-sw1' : a.id === 'pc2' ? 'pc2-sw1' : a.id === 'pc3' ? 'sw2-pc3' : 'sw2-pc4',
    actionType: 'tx',
    pdu: {
      isTagged: false,
      vlanId: srcVlan,
      ethType: '0x0800 (IPv4)',
      srcMac: a.mac,
      dstMac: srcVlan === dstVlan ? b.mac : `00:00:5E:00:01:0${srcVlan}`, // Gateway SVI MAC
      srcIp: a.ip,
      dstIp: b.ip,
      ttl: 64,
      frameSizeBytes: 1518,
      status: 'moving',
    },
  });

  // Step 1: Switch receives frame at Access port & classifies VLAN
  const srcSwPos = a.switchId === 'SW1' ? SW1_POS : SW2_POS;
  steps.push({
    stepIndex: 1,
    title: `${a.switchId}: приём на порту ${a.port} и классификация VLAN ${srcVlan}`,
    detail: `Кадр входит в порт ${a.port}. Коммутатор по таблице портов (PVID) сопоставляет входящий порт с VLAN ${srcVlan}. Внутренний ASIC коммутатора прикрепляет внутренний мета-дескриптор VID=${srcVlan} и ищет MAC назначения в таблице коммутации (MAC Address Table).`,
    rule: 'PVID (Port VLAN ID): каждый access-порт сопоставляет нетегированный трафик с назначенным VLAN.',
    from: { x: srcSwAccessCoord.x, y: srcSwAccessCoord.y },
    to: { x: srcSwPos.x, y: srcSwPos.y },
    activeDeviceId: a.switchId,
    actionType: 'access_ingress',
    pdu: {
      isTagged: false,
      vlanId: srcVlan,
      ethType: '0x0800 (IPv4)',
      srcMac: a.mac,
      dstMac: srcVlan === dstVlan ? b.mac : `00:00:5E:00:01:0${srcVlan}`,
      srcIp: a.ip,
      dstIp: b.ip,
      ttl: 64,
      frameSizeBytes: 1518,
      status: 'moving',
    },
  });

  // Check if self-loop
  if (source === target) {
    steps.push({
      stepIndex: 2,
      title: 'Ошибка: кадр адресован тому же хосту',
      detail: outcome.explanation,
      rule: outcome.ruleCitation || 'Split Horizon',
      from: { x: srcSwPos.x, y: srcSwPos.y },
      to: { x: srcSwPos.x, y: srcSwPos.y },
      activeDeviceId: a.switchId,
      actionType: 'drop',
      dropped: true,
      dropReason: 'Self-addressed loop dropped by hardware',
      pdu: {
        isTagged: false,
        vlanId: srcVlan,
        ethType: '0x0800 (IPv4)',
        srcMac: a.mac,
        dstMac: a.mac,
        srcIp: a.ip,
        dstIp: a.ip,
        ttl: 64,
        frameSizeBytes: 1518,
        status: 'dropped',
      },
    });
    return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
  }

  // Branch 1: Inter-VLAN Routing (Different VLANs)
  if (srcVlan !== dstVlan) {
    if (l3 === 'none') {
      steps.push({
        stepIndex: 2,
        title: `${a.switchId}: отбрасывание кадра (нет L3-маршрутизатора)`,
        detail: `Хост назначения ${b.name} находится в другом широковещательном домене (VLAN ${dstVlan}). Так как ни SW1, ни SW2 не переведены в режим L3 и в сети нет внешнего шлюза, коммутатор не имеет права пересылать L2-кадр между несовпадающими VLAN.`,
        rule: 'L2-изоляция: кадры никогда не покидают свой broadcast-домен без участия L3-шлюза.',
        from: { x: srcSwPos.x, y: srcSwPos.y },
        to: { x: srcSwPos.x, y: srcSwPos.y },
        activeDeviceId: a.switchId,
        actionType: 'drop',
        dropped: true,
        dropReason: `Broadcast Domain Isolation: VLAN ${srcVlan} ≠ VLAN ${dstVlan}`,
        pdu: {
          isTagged: false,
          vlanId: srcVlan,
          ethType: '0x0800 (IPv4)',
          srcMac: a.mac,
          dstMac: b.mac,
          srcIp: a.ip,
          dstIp: b.ip,
          ttl: 64,
          frameSizeBytes: 1518,
          status: 'dropped',
        },
      });
      return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
    }

    // L3 Router is present (either SW1 or SW2)
    const l3SwPos = l3 === 'SW1' ? SW1_POS : SW2_POS;

    // Sub-case: Source is on a different switch than the L3 engine
    if (a.switchId !== l3) {
      const srcSide = a.switchId === 'SW1' ? 'left' : 'right';
      const dstSide = a.switchId === 'SW1' ? 'right' : 'left';
      const outGi = a.switchId === 'SW1' ? SW1_POS.gi1 : SW2_POS.gi1;
      const inGi = a.switchId === 'SW1' ? SW2_POS.gi1 : SW1_POS.gi1;

      // Check if trunk allows srcVlan to reach L3 engine
      if (!trunks[srcSide].includes(srcVlan)) {
        steps.push({
          stepIndex: steps.length,
          title: `${a.switchId}: отброшен на исходящем Trunk Gi0/1`,
          detail: `Кадру нужно добраться до L3-шлюза на ${l3}, но порт Gi0/1 коммутатора ${a.switchId} не содержит VLAN ${srcVlan} в allowed-списке. Кадр не может выйти в trunk.`,
          rule: 'switchport trunk allowed vlan фильтрует кадры на выходе из транка.',
          from: { x: srcSwPos.x, y: srcSwPos.y },
          to: { x: outGi.x, y: outGi.y },
          activeDeviceId: a.switchId,
          activeLinkId: 'sw1-sw2-trunk',
          actionType: 'drop',
          dropped: true,
          dropReason: `Trunk Ingress filter: VLAN ${srcVlan} not allowed on ${a.switchId} Gi0/1`,
          pdu: {
            isTagged: false,
            vlanId: srcVlan,
            ethType: '0x0800 (IPv4)',
            srcMac: a.mac,
            dstMac: `00:00:5E:00:01:0${srcVlan}`,
            srcIp: a.ip,
            dstIp: b.ip,
            ttl: 64,
            frameSizeBytes: 1518,
            status: 'dropped',
          },
        });
        return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
      }

      // Add 802.1Q tag for transit to L3 switch
      steps.push({
        stepIndex: steps.length,
        title: `${a.switchId}: добавление тега 802.1Q (VID ${srcVlan}) в Trunk`,
        detail: `Коммутатор ${a.switchId} упаковывает кадр в магистральный формат 802.1Q: внедряется 4-байтный тег с TPID=0x8100 и VID=${srcVlan}. Размер кадра увеличивается до 1522 байт.`,
        rule: 'IEEE 802.1Q: в транк-канал кадры выходят строго с 4-байтным тегом VID.',
        from: { x: srcSwPos.x, y: srcSwPos.y },
        to: { x: outGi.x, y: outGi.y },
        activeDeviceId: a.switchId,
        activeLinkId: 'sw1-sw2-trunk',
        actionType: 'trunk_tag',
        pdu: {
          isTagged: true,
          vlanId: srcVlan,
          ethType: '0x8100 (802.1Q)',
          tpid: '0x8100',
          pcp: 0,
          dei: 0,
          srcMac: a.mac,
          dstMac: `00:00:5E:00:01:0${srcVlan}`,
          srcIp: a.ip,
          dstIp: b.ip,
          ttl: 64,
          frameSizeBytes: 1522,
          status: 'moving',
        },
      });

      // Transit along Trunk
      steps.push({
        stepIndex: steps.length,
        title: `Транк Gi0/1 ↔ Gi0/1: передача тегированного кадра [VID ${srcVlan}]`,
        detail: `Тегированный кадр IEEE 802.1Q перемещается по физической оптической/медной магистрали со скоростью 1 Гбит/с к коммутатору ${l3}.`,
        rule: '802.1Q Trunk мультиплексирует изолированные виртуальные сети в один физический канал.',
        from: { x: outGi.x, y: outGi.y },
        to: { x: inGi.x, y: inGi.y },
        activeLinkId: 'sw1-sw2-trunk',
        actionType: 'trunk_transit',
        pdu: {
          isTagged: true,
          vlanId: srcVlan,
          ethType: '0x8100 (802.1Q)',
          tpid: '0x8100',
          pcp: 0,
          dei: 0,
          srcMac: a.mac,
          dstMac: `00:00:5E:00:01:0${srcVlan}`,
          srcIp: a.ip,
          dstIp: b.ip,
          ttl: 64,
          frameSizeBytes: 1522,
          status: 'moving',
        },
      });

      // Check if trunk allows on ingress of L3 switch
      if (!trunks[dstSide].includes(srcVlan)) {
        steps.push({
          stepIndex: steps.length,
          title: `${l3}: отброшен на входящем Trunk Gi0/1`,
          detail: `Кадр достиг порта Gi0/1 коммутатора ${l3}, но в его локальной конфигурации allowed vlan отсутствует VLAN ${srcVlan}. Аппаратный входной фильтр порта уничтожает кадр!`,
          rule: 'Транк должен разрешать соответствующий VLAN на ОБОИХ концах соединения.',
          from: { x: inGi.x, y: inGi.y },
          to: { x: inGi.x, y: inGi.y },
          activeDeviceId: l3,
          activeLinkId: 'sw1-sw2-trunk',
          actionType: 'drop',
          dropped: true,
          dropReason: `Trunk Egress/Ingress mismatch: VLAN ${srcVlan} missing on ${l3} Gi0/1`,
          pdu: {
            isTagged: true,
            vlanId: srcVlan,
            ethType: '0x8100 (802.1Q)',
            srcMac: a.mac,
            dstMac: `00:00:5E:00:01:0${srcVlan}`,
            srcIp: a.ip,
            dstIp: b.ip,
            ttl: 64,
            frameSizeBytes: 1522,
            status: 'dropped',
          },
        });
        return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
      }
    }

    // L3 SVI Routing Execution on l3 switch
    steps.push({
      stepIndex: steps.length,
      title: `${l3} L3 Engine: маршрутизация через SVI ${srcVlan} ➔ SVI ${dstVlan}`,
      detail: `L3-ядро коммутатора принимает кадр на интерфейсе SVI ${srcVlan} (шлюз 192.168.${srcVlan}.1). Выполняется де-инкапсуляция L2-заголовка, проверка контрольной суммы IP, декремент TTL (64 ➔ 63), поиск в таблице FIB/CEF и упаковка в НОВЫЙ Ethernet-кадр для подсети VLAN ${dstVlan}!`,
      rule: 'RFC 1812: Маршрутизатор пересобирает заголовок L2, изменяет MAC источника/назначения и уменьшает TTL.',
      from: { x: l3SwPos.x, y: l3SwPos.y },
      to: { x: l3SwPos.x, y: l3SwPos.y },
      activeDeviceId: l3,
      actionType: 'l3_svi_route',
      pdu: {
        isTagged: false,
        vlanId: dstVlan,
        ethType: '0x0800 (IPv4)',
        srcMac: `00:00:5E:00:01:0${dstVlan}`, // Gateway SVI MAC for new VLAN
        dstMac: b.mac,
        srcIp: a.ip,
        dstIp: b.ip,
        ttl: 63, // Decremented TTL!
        frameSizeBytes: 1518,
        status: 'routing',
      },
    });

    // Sub-case: Destination is on a different switch than the L3 engine
    if (b.switchId !== l3) {
      const srcSide = l3 === 'SW1' ? 'left' : 'right';
      const dstSide = l3 === 'SW1' ? 'right' : 'left';
      const outGi = l3 === 'SW1' ? SW1_POS.gi1 : SW2_POS.gi1;
      const inGi = l3 === 'SW1' ? SW2_POS.gi1 : SW1_POS.gi1;

      // Check if trunk allows dstVlan
      if (!trunks[srcSide].includes(dstVlan)) {
        steps.push({
          stepIndex: steps.length,
          title: `${l3}: отброшен на исходящем Trunk Gi0/1 (VLAN ${dstVlan} не разрешен)`,
          detail: `Маршрутизация выполнена, но новый кадр VLAN ${dstVlan} не может выйти в trunk обратно к ${b.switchId}, так как на ${l3} порт Gi0/1 запрещает VLAN ${dstVlan}.`,
          rule: 'Все транзитные VLAN обязаны быть разрешены в switchport trunk allowed vlan.',
          from: { x: l3SwPos.x, y: l3SwPos.y },
          to: { x: outGi.x, y: outGi.y },
          activeDeviceId: l3,
          activeLinkId: 'sw1-sw2-trunk',
          actionType: 'drop',
          dropped: true,
          dropReason: `Trunk filter: target VLAN ${dstVlan} blocked on ${l3} Gi0/1`,
          pdu: {
            isTagged: false,
            vlanId: dstVlan,
            ethType: '0x0800 (IPv4)',
            srcMac: `00:00:5E:00:01:0${dstVlan}`,
            dstMac: b.mac,
            srcIp: a.ip,
            dstIp: b.ip,
            ttl: 63,
            frameSizeBytes: 1518,
            status: 'dropped',
          },
        });
        return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
      }

      // Tag for transit in dstVlan
      steps.push({
        stepIndex: steps.length,
        title: `${l3}: инкапсуляция с новым тегом 802.1Q [VID ${dstVlan}]`,
        detail: `Новый кадр упаковывается с тегом IEEE 802.1Q (VID=${dstVlan}) и направляется в порт Gi0/1 для передачи к ${b.switchId}.`,
        rule: 'IEEE 802.1Q: кадр маршрутизированного потока маркируется тегом целевого VLAN.',
        from: { x: l3SwPos.x, y: l3SwPos.y },
        to: { x: outGi.x, y: outGi.y },
        activeDeviceId: l3,
        activeLinkId: 'sw1-sw2-trunk',
        actionType: 'trunk_tag',
        pdu: {
          isTagged: true,
          vlanId: dstVlan,
          ethType: '0x8100 (802.1Q)',
          tpid: '0x8100',
          pcp: 0,
          dei: 0,
          srcMac: `00:00:5E:00:01:0${dstVlan}`,
          dstMac: b.mac,
          srcIp: a.ip,
          dstIp: b.ip,
          ttl: 63,
          frameSizeBytes: 1522,
          status: 'moving',
        },
      });

      // Transit trunk
      steps.push({
        stepIndex: steps.length,
        title: `Транк Gi0/1: доставка кадра [VID ${dstVlan}] на ${b.switchId}`,
        detail: `Тегированный кадр перемещается по транку к целевому коммутатору доступа ${b.switchId}.`,
        rule: 'Транк обеспечивает прозрачную транспортировку кадров нужного VLAN ID.',
        from: { x: outGi.x, y: outGi.y },
        to: { x: inGi.x, y: inGi.y },
        activeLinkId: 'sw1-sw2-trunk',
        actionType: 'trunk_transit',
        pdu: {
          isTagged: true,
          vlanId: dstVlan,
          ethType: '0x8100 (802.1Q)',
          tpid: '0x8100',
          pcp: 0,
          dei: 0,
          srcMac: `00:00:5E:00:01:0${dstVlan}`,
          dstMac: b.mac,
          srcIp: a.ip,
          dstIp: b.ip,
          ttl: 63,
          frameSizeBytes: 1522,
          status: 'moving',
        },
      });

      if (!trunks[dstSide].includes(dstVlan)) {
        steps.push({
          stepIndex: steps.length,
          title: `${b.switchId}: отброшен на входящем Trunk Gi0/1`,
          detail: `Порт Gi0/1 коммутатора ${b.switchId} не разрешает VLAN ${dstVlan}. Кадр отфильтрован прямо перед выдачей клиенту.`,
          rule: 'Отсутствие VLAN в списке allowed vlan на приёмной стороне блокирует трафик.',
          from: { x: inGi.x, y: inGi.y },
          to: { x: inGi.x, y: inGi.y },
          activeDeviceId: b.switchId,
          activeLinkId: 'sw1-sw2-trunk',
          actionType: 'drop',
          dropped: true,
          dropReason: `Trunk Ingress filter: VLAN ${dstVlan} blocked on ${b.switchId}`,
          pdu: {
            isTagged: true,
            vlanId: dstVlan,
            ethType: '0x8100 (802.1Q)',
            srcMac: `00:00:5E:00:01:0${dstVlan}`,
            dstMac: b.mac,
            srcIp: a.ip,
            dstIp: b.ip,
            ttl: 63,
            frameSizeBytes: 1522,
            status: 'dropped',
          },
        });
        return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
      }
    }

    // Stripping tag before delivery to target Access Port
    const dstSwPos = b.switchId === 'SW1' ? SW1_POS : SW2_POS;
    const dstSwAccessOut =
      b.switchId === 'SW1'
        ? b.port === 'Fa0/1'
          ? SW1_POS.fa1
          : SW1_POS.fa2
        : b.port === 'Fa0/1'
        ? SW2_POS.fa1
        : SW2_POS.fa2;

    steps.push({
      stepIndex: steps.length,
      title: `${b.switchId}: снятие тега 802.1Q перед портом ${b.port}`,
      detail: `Коммутатор ${b.switchId} определяет, что порт получателя ${b.port} является Access-портом VLAN ${dstVlan}. Тег 802.1Q удаляется (срез 4 байт), восстанавливается стандартный Untagged Ethernet II кадр (1518 байт).`,
      rule: 'Access-порты коммутатора всегда выдают конечному узлу нетегированный (Untagged) кадр.',
      from: { x: dstSwPos.x, y: dstSwPos.y },
      to: { x: dstSwAccessOut.x, y: dstSwAccessOut.y },
      activeDeviceId: b.switchId,
      actionType: 'access_egress',
      pdu: {
        isTagged: false,
        vlanId: dstVlan,
        ethType: '0x0800 (IPv4)',
        srcMac: `00:00:5E:00:01:0${dstVlan}`,
        dstMac: b.mac,
        srcIp: a.ip,
        dstIp: b.ip,
        ttl: 63,
        frameSizeBytes: 1518,
        status: 'moving',
      },
    });

    // Final Delivery to Destination Host
    steps.push({
      stepIndex: steps.length,
      title: `${b.name} (${b.label}): успешный приём IP-пакета (TTL 63)`,
      detail: `Конечный хост ${b.name} успешно принимает нетегированный кадр через порт ${b.port}. Сетевой стек извлекает IP-пакет от ${a.ip} с обновлённым значением TTL=63. Межсетевое взаимодействие завершено!`,
      rule: 'Конечный ПК обрабатывает входящий кадр обычным образом, не подозревая о пройденных транках и тегах.',
      from: { x: dstSwAccessOut.x, y: dstSwAccessOut.y },
      to: { x: b.wireX, y: b.wireY },
      activeDeviceId: b.id,
      activeLinkId: b.id === 'pc1' ? 'pc1-sw1' : b.id === 'pc2' ? 'pc2-sw1' : b.id === 'pc3' ? 'sw2-pc3' : 'sw2-pc4',
      actionType: 'rx_delivery',
      pdu: {
        isTagged: false,
        vlanId: dstVlan,
        ethType: '0x0800 (IPv4)',
        srcMac: `00:00:5E:00:01:0${dstVlan}`,
        dstMac: b.mac,
        srcIp: a.ip,
        dstIp: b.ip,
        ttl: 63,
        frameSizeBytes: 1518,
        status: 'delivered',
      },
    });

    return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
  }

  // Branch 2: Intra-VLAN across Trunk (Same VLAN, Different Switches)
  if (a.switchId !== b.switchId) {
    const srcSide = a.switchId === 'SW1' ? 'left' : 'right';
    const dstSide = a.switchId === 'SW1' ? 'right' : 'left';
    const outGi = a.switchId === 'SW1' ? SW1_POS.gi1 : SW2_POS.gi1;
    const inGi = a.switchId === 'SW1' ? SW2_POS.gi1 : SW1_POS.gi1;

    // Check allowed on transmitter side
    if (!trunks[srcSide].includes(srcVlan)) {
      steps.push({
        stepIndex: steps.length,
        title: `${a.switchId}: отброшен на исходящем Trunk Gi0/1 (VLAN ${srcVlan} не разрешен)`,
        detail: `На коммутаторе ${a.switchId} в конфигурации 'switchport trunk allowed vlan' отсутствует VLAN ${srcVlan}. Кадр отбрасывается фильтром порта и не попадает в магистраль.`,
        rule: 'Кадры не разрешенного VLAN блокируются на исходящем транк-интерфейсе.',
        from: { x: srcSwPos.x, y: srcSwPos.y },
        to: { x: outGi.x, y: outGi.y },
        activeDeviceId: a.switchId,
        activeLinkId: 'sw1-sw2-trunk',
        actionType: 'drop',
        dropped: true,
        dropReason: `Outgoing Trunk Filter: VLAN ${srcVlan} not allowed on ${a.switchId} Gi0/1`,
        pdu: {
          isTagged: false,
          vlanId: srcVlan,
          ethType: '0x0800 (IPv4)',
          srcMac: a.mac,
          dstMac: b.mac,
          srcIp: a.ip,
          dstIp: b.ip,
          ttl: 64,
          frameSizeBytes: 1518,
          status: 'dropped',
        },
      });
      return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
    }

    // Add 802.1Q tag
    steps.push({
      stepIndex: steps.length,
      title: `${a.switchId}: добавление тега IEEE 802.1Q [VID ${srcVlan}]`,
      detail: `При выводе в транк Gi0/1 коммутатор вставляет в Ethernet-заголовок 4-байтный тег 802.1Q: TPID=0x8100, Priority=0, Drop Eligible=0, VID=${srcVlan}. Размер кадра вырастает до 1522 байт.`,
      rule: 'IEEE 802.1Q Tagged Frame: TPID (16 бит) + TCI (PCP 3 бита + DEI 1 бит + VID 12 бит).',
      from: { x: srcSwPos.x, y: srcSwPos.y },
      to: { x: outGi.x, y: outGi.y },
      activeDeviceId: a.switchId,
      activeLinkId: 'sw1-sw2-trunk',
      actionType: 'trunk_tag',
      pdu: {
        isTagged: true,
        vlanId: srcVlan,
        ethType: '0x8100 (802.1Q)',
        tpid: '0x8100',
        pcp: 0,
        dei: 0,
        srcMac: a.mac,
        dstMac: b.mac,
        srcIp: a.ip,
        dstIp: b.ip,
        ttl: 64,
        frameSizeBytes: 1522,
        status: 'moving',
      },
    });

    // Transit along trunk cable
    steps.push({
      stepIndex: steps.length,
      title: `Транк Gi0/1 ↔ Gi0/1: передача кадра [VID ${srcVlan}] через магистраль`,
      detail: `Кадр с биркой [VID ${srcVlan}] передаётся по физической линии связи между коммутаторами ${a.switchId} и ${b.switchId}.`,
      rule: 'Магистраль 802.1Q гарантирует перенос признака VLAN между физическими коммутаторами.',
      from: { x: outGi.x, y: outGi.y },
      to: { x: inGi.x, y: inGi.y },
      activeLinkId: 'sw1-sw2-trunk',
      actionType: 'trunk_transit',
      pdu: {
        isTagged: true,
        vlanId: srcVlan,
        ethType: '0x8100 (802.1Q)',
        tpid: '0x8100',
        pcp: 0,
        dei: 0,
        srcMac: a.mac,
        dstMac: b.mac,
        srcIp: a.ip,
        dstIp: b.ip,
        ttl: 64,
        frameSizeBytes: 1522,
        status: 'moving',
      },
    });

    // Check allowed on receiver side
    if (!trunks[dstSide].includes(srcVlan)) {
      steps.push({
        stepIndex: steps.length,
        title: `${b.switchId}: отброшен на входящем Trunk Gi0/1 (VLAN ${srcVlan} не разрешен)`,
        detail: `Кадр успешно долетел до порта Gi0/1 коммутатора ${b.switchId}, но на ${b.switchId} порт Gi0/1 не имеет VLAN ${srcVlan} в allowed-списке! Аппаратный фильтр отбрасывает кадр.`,
        rule: 'Несовпадение allowed VLAN на концах транка приводит к асимметричной потере пакетов.',
        from: { x: inGi.x, y: inGi.y },
        to: { x: inGi.x, y: inGi.y },
        activeDeviceId: b.switchId,
        activeLinkId: 'sw1-sw2-trunk',
        actionType: 'drop',
        dropped: true,
        dropReason: `Incoming Trunk Filter: VLAN ${srcVlan} blocked on ${b.switchId} Gi0/1`,
        pdu: {
          isTagged: true,
          vlanId: srcVlan,
          ethType: '0x8100 (802.1Q)',
          srcMac: a.mac,
          dstMac: b.mac,
          srcIp: a.ip,
          dstIp: b.ip,
          ttl: 64,
          frameSizeBytes: 1522,
          status: 'dropped',
        },
      });
      return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
    }

    // Strip tag on destination switch
    const dstSwPos = b.switchId === 'SW1' ? SW1_POS : SW2_POS;
    const dstSwAccessOut =
      b.switchId === 'SW1'
        ? b.port === 'Fa0/1'
          ? SW1_POS.fa1
          : SW1_POS.fa2
        : b.port === 'Fa0/1'
        ? SW2_POS.fa1
        : SW2_POS.fa2;

    steps.push({
      stepIndex: steps.length,
      title: `${b.switchId}: снятие тега 802.1Q перед выдачей в access-порт ${b.port}`,
      detail: `Коммутатор ${b.switchId} принимает тегированный кадр, сопоставляет VID=${srcVlan} с целевым access-портом ${b.port}, срезает 4 байта тега и подготавливает нетегированный Ethernet-кадр.`,
      rule: 'Access-порт всегда срезает тег 802.1Q при отправке кадра к конечному оборудованию.',
      from: { x: dstSwPos.x, y: dstSwPos.y },
      to: { x: dstSwAccessOut.x, y: dstSwAccessOut.y },
      activeDeviceId: b.switchId,
      actionType: 'access_egress',
      pdu: {
        isTagged: false,
        vlanId: srcVlan,
        ethType: '0x0800 (IPv4)',
        srcMac: a.mac,
        dstMac: b.mac,
        srcIp: a.ip,
        dstIp: b.ip,
        ttl: 64,
        frameSizeBytes: 1518,
        status: 'moving',
      },
    });

    // Deliver to Destination Host
    steps.push({
      stepIndex: steps.length,
      title: `${b.name} (${b.label}): успешный приём кадра в VLAN ${srcVlan}`,
      detail: `Хост ${b.name} принимает стандартный нетегированный Ethernet-кадр. Данные успешно доставлены в едином широковещательном домене VLAN ${srcVlan} через магистральный Trunk!`,
      rule: 'L2-связность внутри одного VLAN полностью обеспечена через 802.1Q Trunk.',
      from: { x: dstSwAccessOut.x, y: dstSwAccessOut.y },
      to: { x: b.wireX, y: b.wireY },
      activeDeviceId: b.id,
      activeLinkId: b.id === 'pc1' ? 'pc1-sw1' : b.id === 'pc2' ? 'pc2-sw1' : b.id === 'pc3' ? 'sw2-pc3' : 'sw2-pc4',
      actionType: 'rx_delivery',
      pdu: {
        isTagged: false,
        vlanId: srcVlan,
        ethType: '0x0800 (IPv4)',
        srcMac: a.mac,
        dstMac: b.mac,
        srcIp: a.ip,
        dstIp: b.ip,
        ttl: 64,
        frameSizeBytes: 1518,
        status: 'delivered',
      },
    });

    return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
  }

  // Branch 3: Intra-VLAN on Single Switch (Same VLAN, Same Switch)
  const swAccessOut =
    a.switchId === 'SW1'
      ? b.port === 'Fa0/1'
        ? SW1_POS.fa1
        : SW1_POS.fa2
      : b.port === 'Fa0/1'
      ? SW2_POS.fa1
      : SW2_POS.fa2;

  steps.push({
    stepIndex: steps.length,
    title: `${a.switchId}: внутренняя L2-коммутация в порт ${b.port}`,
    detail: `Оба хоста (${a.name} и ${b.name}) находятся на одном физическом коммутаторе ${a.switchId} и в одном VLAN ${srcVlan}. Кадр пересылается через матрицу коммутации напрямую между портами без использования Trunk и без добавления тега 802.1Q.`,
    rule: 'Локальная L2-коммутация на одном шасси не требует тегирования 802.1Q.',
    from: { x: srcSwPos.x, y: srcSwPos.y },
    to: { x: swAccessOut.x, y: swAccessOut.y },
    activeDeviceId: a.switchId,
    actionType: 'access_egress',
    pdu: {
      isTagged: false,
      vlanId: srcVlan,
      ethType: '0x0800 (IPv4)',
      srcMac: a.mac,
      dstMac: b.mac,
      srcIp: a.ip,
      dstIp: b.ip,
      ttl: 64,
      frameSizeBytes: 1518,
      status: 'moving',
    },
  });

  steps.push({
    stepIndex: steps.length,
    title: `${b.name} (${b.label}): кадр получен внутри локального VLAN ${srcVlan}`,
    detail: `Кадр доставлен на сетевой интерфейс ${b.name}. Никаких задержек и изменений заголовков — чистый локальный Ethernet-обмен.`,
    rule: 'Внутри одного VLAN на одном коммутаторе задержка минимальна (Microsecond latency).',
    from: { x: swAccessOut.x, y: swAccessOut.y },
    to: { x: b.wireX, y: b.wireY },
    activeDeviceId: b.id,
    activeLinkId: b.id === 'pc1' ? 'pc1-sw1' : b.id === 'pc2' ? 'pc2-sw1' : b.id === 'pc3' ? 'sw2-pc3' : 'sw2-pc4',
    actionType: 'rx_delivery',
    pdu: {
      isTagged: false,
      vlanId: srcVlan,
      ethType: '0x0800 (IPv4)',
      srcMac: a.mac,
      dstMac: b.mac,
      srcIp: a.ip,
      dstIp: b.ip,
      ttl: 64,
      frameSizeBytes: 1518,
      status: 'delivered',
    },
  });

  return { steps, outcome, initialVlan: srcVlan, finalVlan: dstVlan };
}

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export const MockVlanSimulator: React.FC = () => {
  const [mode, setMode] = useState<CaseId>('explore');
  const [vlans, setVlans] = useState<Record<HostId, Vlan>>(INITIAL_VLANS);
  const [trunks, setTrunks] = useState<TrunkConfig>(INITIAL_TRUNKS);
  const [l3Role, setL3Role] = useState<L3Role>('none');
  const [source, setSource] = useState<HostId>('pc1');
  const [target, setTarget] = useState<HostId>('pc3');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showTheory, setShowTheory] = useState<boolean>(false);

  // Playback & Step state
  const [trace, setTrace] = useState<Trace | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [attempts, setAttempts] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  // Active step calculation
  const totalSteps = trace ? trace.steps.length : 0;
  const activeStep: TraceStep | undefined = trace ? trace.steps[currentStepIndex] : undefined;

  // Selected hosts data
  const sourceData = HOSTS.find((h) => h.id === source)!;
  const targetData = HOSTS.find((h) => h.id === target)!;

  // Reset function with mode switching
  const handleReset = (nextMode: CaseId = mode) => {
    setMode(nextMode);
    setL3Role('none');
    setTrace(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setCompleted(false);
    setAttempts(0);

    if (nextMode === 'access') {
      // Case #3: PC-01 (VLAN 10) vs PC-02 (VLAN 20) on SW1
      setVlans({ pc1: 10, pc2: 20, pc3: 10, pc4: 20 });
      setTrunks({ left: [10, 20], right: [10, 20] });
      setSource('pc1');
      setTarget('pc2');
    } else if (nextMode === 'trunk') {
      // Case #4: PC-02 (SW1, VLAN 20) vs PC-04 (SW2, VLAN 20) - right trunk misses VLAN 20!
      setVlans({ pc1: 10, pc2: 20, pc3: 10, pc4: 20 });
      setTrunks({ left: [10, 20], right: [10] }); // SW2 only allows 10!
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

  // Run simulation & generate trace
  const handleStartSimulation = () => {
    const nextTrace = generateDetailedTrace(source, target, vlans, trunks, l3Role);
    setTrace(nextTrace);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setAttempts((prev) => prev + 1);
    triggerHaptic('selection');
    playClickSound();
  };

  // Step Controls
  const handleStepNext = useCallback(() => {
    if (!trace) return;
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      triggerHaptic('selection');
      playClickSound();
    } else {
      setIsPlaying(false);
      if (trace.outcome.delivered) {
        setCompleted(true);
        triggerHaptic('success');
        playSuccessSound();
      } else {
        triggerHaptic('error');
        playErrorSound();
      }
    }
  }, [trace, currentStepIndex, totalSteps]);

  const handleStepPrev = useCallback(() => {
    if (!trace) return;
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      triggerHaptic('selection');
      playClickSound();
    }
  }, [trace, currentStepIndex]);

  const handleGoToStep = (index: number) => {
    if (!trace) return;
    const bounded = Math.max(0, Math.min(totalSteps - 1, index));
    setCurrentStepIndex(bounded);
    triggerHaptic('light');
  };

  // Speed cycle
  const handleCycleSpeed = () => {
    const speeds = [0.5, 1, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
    triggerHaptic('light');
  };

  // Autoplay ticker
  useEffect(() => {
    if (!isPlaying || !trace) return;

    const interval = Math.max(1200, 2600 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          if (trace.outcome.delivered) {
            setCompleted(true);
            playSuccessSound();
          } else {
            playErrorSound();
          }
          return prev;
        }
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, trace, totalSteps, playbackSpeed]);

  // Check case success condition upon settings change
  const checkCaseGoal = useCallback(
    (curVlans: Record<HostId, Vlan>, curTrunks: TrunkConfig, curL3: L3Role) => {
      const curOutcome = evaluateNetwork(source, target, curVlans, curTrunks, curL3);
      if (curOutcome.delivered && mode !== 'explore') {
        setCompleted(true);
      }
    },
    [source, target, mode]
  );

  // Parameter modifiers
  const handleVlanChange = (host: HostId, newVlan: Vlan) => {
    const next = { ...vlans, [host]: newVlan };
    setVlans(next);
    setTrace(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    triggerHaptic('selection');
    checkCaseGoal(next, trunks, l3Role);
  };

  const handleTrunkToggle = (side: 'left' | 'right', vlan: Vlan) => {
    const nextTrunks: TrunkConfig = {
      ...trunks,
      [side]: trunks[side].includes(vlan)
        ? trunks[side].filter((v) => v !== vlan)
        : [...trunks[side], vlan].sort((a, b) => a - b),
    };
    setTrunks(nextTrunks);
    setTrace(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    triggerHaptic('selection');
    checkCaseGoal(vlans, nextTrunks, l3Role);
  };

  const handleL3RoleChange = (role: L3Role) => {
    setL3Role(role);
    setTrace(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    triggerHaptic('selection');
    checkCaseGoal(vlans, trunks, role);
  };

  // Quick host selection by click
  const handleHostClick = (hostId: HostId) => {
    if (source === hostId) return;
    if (target === hostId) {
      setSource(hostId);
      setTarget(source);
    } else {
      setTarget(hostId);
    }
    setTrace(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    triggerHaptic('selection');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleStepNext();
      } else if (e.key === 'ArrowLeft') {
        handleStepPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStepNext, handleStepPrev]);

  return (
    <section className="mx-auto max-w-6xl space-y-4" aria-label="Макет лаборатории VLAN и Trunk">
      {/* 1. Header & Lab Case Mode Switcher */}
      <div className="rounded-3xl border border-slate-200 dark:border-cyan-500/25 bg-white/90 dark:bg-slate-950/85 p-4 sm:p-6 shadow-xl backdrop-blur-md transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-700 dark:text-cyan-300 text-[11px] font-mono font-bold uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Макет практики · L2/L3 Simulation 2.0</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              VLAN & Trunk: интерактивная лаборатория передачи кадров
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Высокоточная векторная симуляция Ethernet-кадров, тегирования IEEE 802.1Q и межсегментной маршрутизации через SVI.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto shrink-0">
            {([
              ['explore', 'Свободная практика'],
              ['access', 'Дело №3 · Чужая VLAN'],
              ['trunk', 'Дело №4 · Пропавший trunk'],
            ] as const).map(([id, label]) => {
              const isActive = mode === id;
              return (
                <button
                  key={id}
                  onClick={() => handleReset(id)}
                  type="button"
                  aria-pressed={isActive}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white dark:text-slate-950 shadow-md shadow-cyan-500/20 font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Case Mission Briefing if in Case 3 or Case 4 */}
        {mode !== 'explore' && (
          <div className="mt-4 p-3.5 rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30 text-slate-800 dark:text-amber-100 space-y-1.5">
            <div className="font-bold flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                {mode === 'access' ? 'Дело №3: не совпадает Access VLAN на портах' : 'Дело №4: блокировка VLAN на магистрали Trunk'}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300">
                Попыток проверки: {attempts}
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-amber-200/90">
              {mode === 'access'
                ? 'PC-01 не может связаться с PC-02 через коммутатор SW1. Исследуй параметры access-портов Fa0/1 и Fa0/2 и восстанови связность в пределах одного VLAN (или включи L3).'
                : 'PC-02 (VLAN 20 на SW1) не может пинговать PC-04 (VLAN 20 на SW2). Физический линк активен, но кадры теряются на магистрали. Найди ошибку в настройке allowed VLAN.'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 Схема намеренно не раскрывает неисправность заранее цветом кабелей: запустите передачу и найдите место сбоя по поведению кадра.
            </p>
          </div>
        )}
      </div>

      {/* 2. Professional Vector Topology Board */}
      <div className="rounded-3xl border border-slate-200 dark:border-cyan-500/20 bg-white dark:bg-[#071322] p-4 sm:p-6 shadow-xl relative overflow-hidden transition-colors">
        {/* Topology Header & Role Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Топология корпоративной сети L2 / L3
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Нажмите на хост на схеме, чтобы назначить получателя или источник
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>VLAN 10</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-500/30 text-purple-800 dark:text-purple-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>VLAN 20</span>
            </div>
          </div>
        </div>

        {/* SVG Viewport */}
        <div className="w-full overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-2 sm:p-4">
          <svg
            viewBox="0 0 800 360"
            className="w-full min-w-[620px] h-auto select-none"
            role="img"
            aria-label="Векторная схема топологии VLAN и Trunk"
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="vlan-sw-body" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="vlan-sw-face" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="vlan-sw-l3-badge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="pc-body-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="trunk-glow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* Drop Shadows */}
              <filter id="pdu-drop-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.4" />
              </filter>
              <filter id="pdu-error-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#f43f5e" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Switch Domain Boundary Halos */}
            <rect
              x="25"
              y="20"
              width="360"
              height="320"
              rx="18"
              className="fill-cyan-500/[0.03] dark:fill-cyan-500/[0.04] stroke-cyan-500/20 dark:stroke-cyan-500/30"
              strokeDasharray="6 4"
            />
            <text x="45" y="44" className="text-[11px] font-mono fill-cyan-700 dark:fill-cyan-400 font-bold">
              SW1 · Сегмент доступа A
            </text>

            <rect
              x="415"
              y="20"
              width="360"
              height="320"
              rx="18"
              className="fill-blue-500/[0.03] dark:fill-blue-500/[0.04] stroke-blue-500/20 dark:stroke-blue-500/30"
              strokeDasharray="6 4"
            />
            <text x="435" y="44" className="text-[11px] font-mono fill-blue-700 dark:fill-blue-400 font-bold">
              SW2 · Сегмент доступа B
            </text>

            {/* Physical Cabling */}
            {/* Cable PC1 -> SW1 Fa0/1 */}
            <path
              d="M 148 85 C 190 85, 195 145, 228 145"
              className={`fill-none transition-all duration-300 ${
                activeStep?.activeLinkId === 'pc1-sw1'
                  ? 'stroke-cyan-400 stroke-[3.5px]'
                  : 'stroke-slate-300 dark:stroke-slate-700 stroke-[2.5px]'
              }`}
            />
            {/* Cable PC2 -> SW1 Fa0/2 */}
            <path
              d="M 148 275 C 190 275, 195 215, 228 215"
              className={`fill-none transition-all duration-300 ${
                activeStep?.activeLinkId === 'pc2-sw1'
                  ? 'stroke-purple-400 stroke-[3.5px]'
                  : 'stroke-slate-300 dark:stroke-slate-700 stroke-[2.5px]'
              }`}
            />
            {/* Cable SW2 Fa0/1 -> PC3 */}
            <path
              d="M 572 145 C 605 145, 610 85, 652 85"
              className={`fill-none transition-all duration-300 ${
                activeStep?.activeLinkId === 'sw2-pc3'
                  ? 'stroke-cyan-400 stroke-[3.5px]'
                  : 'stroke-slate-300 dark:stroke-slate-700 stroke-[2.5px]'
              }`}
            />
            {/* Cable SW2 Fa0/2 -> PC4 */}
            <path
              d="M 572 215 C 605 215, 610 275, 652 275"
              className={`fill-none transition-all duration-300 ${
                activeStep?.activeLinkId === 'sw2-pc4'
                  ? 'stroke-purple-400 stroke-[3.5px]'
                  : 'stroke-slate-300 dark:stroke-slate-700 stroke-[2.5px]'
              }`}
            />

            {/* TRUNK CABLE: SW1:Gi0/1 <-> SW2:Gi0/1 */}
            <g>
              <line
                x1={SW1_POS.gi1.x}
                y1={SW1_POS.gi1.y}
                x2={SW2_POS.gi1.x}
                y2={SW2_POS.gi1.y}
                strokeWidth="6"
                className={`transition-all duration-300 ${
                  activeStep?.activeLinkId === 'sw1-sw2-trunk'
                    ? 'stroke-amber-400'
                    : 'stroke-amber-500/60 dark:stroke-amber-500/50'
                }`}
              />
              <line
                x1={SW1_POS.gi1.x}
                y1={SW1_POS.gi1.y}
                x2={SW2_POS.gi1.x}
                y2={SW2_POS.gi1.y}
                strokeWidth="2"
                strokeDasharray="4 4"
                className="stroke-amber-200 dark:stroke-amber-300"
              />
              {/* Trunk Badge Pill in middle */}
              <rect x="360" y="160" width="80" height="22" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="400" y="175" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                802.1Q TRUNK
              </text>
              <text x="400" y="196" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="9">
                Gi0/1 ↔ Gi0/1
              </text>
            </g>

            {/* SWITCH 1 GRAPHIC */}
            <g transform={`translate(${SW1_POS.x}, ${SW1_POS.y})`}>
              {/* Chassis 1U */}
              <rect
                x="-65"
                y="-32"
                width="130"
                height="64"
                rx="6"
                fill="url(#vlan-sw-body)"
                stroke={activeStep?.activeDeviceId === 'SW1' ? '#38bdf8' : '#475569'}
                strokeWidth={activeStep?.activeDeviceId === 'SW1' ? '2.5' : '1.5'}
              />
              {/* Rack Mount Ears */}
              <rect x="-70" y="-30" width="5" height="60" rx="1" fill="#334155" />
              <rect x="65" y="-30" width="5" height="60" rx="1" fill="#334155" />

              {/* Front Faceplate */}
              <rect x="-60" y="-26" width="120" height="52" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />

              {/* Port Bank: Left (Fa0/1, Fa0/2) */}
              <g transform="translate(-48, -12)">
                <rect x="0" y="0" width="12" height="10" rx="1" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
                <circle cx="6" cy="-4" r="1.5" fill="#22c55e" />
                <text x="6" y="20" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  Fa0/1
                </text>
              </g>
              <g transform="translate(-48, 6)">
                <rect x="0" y="0" width="12" height="10" rx="1" fill="#1e293b" stroke="#a855f7" strokeWidth="1" />
                <circle cx="6" cy="-4" r="1.5" fill="#22c55e" />
                <text x="6" y="20" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  Fa0/2
                </text>
              </g>

              {/* Trunk Port: Right (Gi0/1) */}
              <g transform="translate(36, -3)">
                <rect x="0" y="0" width="14" height="12" rx="1" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.2" />
                <circle cx="7" cy="-4" r="1.5" fill="#f59e0b" />
                <text x="7" y="22" textAnchor="middle" fill="#fbbf24" fontSize="8" fontFamily="monospace">
                  Gi0/1
                </text>
              </g>

              {/* Switch Name & Type */}
              <text x="0" y="-6" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold">
                SW1
              </text>
              <text x="0" y="9" textAnchor="middle" fill="#94a3b8" fontSize="9">
                {l3Role === 'SW1' ? 'L3 Core / SVI' : 'L2 Access'}
              </text>

              {/* L3 Routing Badge if active */}
              {l3Role === 'SW1' && (
                <g transform="translate(0, -32)">
                  <circle cx="0" cy="0" r="11" fill="url(#vlan-sw-l3-badge)" stroke="#ffffff" strokeWidth="1.5" />
                  <path
                    d="M -5 0 H 5 M 2 -3 L 5 0 L 2 3 M -2 3 L -5 0 L -2 -3"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <rect x="-36" y="-22" width="72" height="14" rx="4" fill="#0e7490" stroke="#38bdf8" strokeWidth="1" />
                  <text x="0" y="-12" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                    L3 MLS ROUTER
                  </text>
                </g>
              )}

              {/* Port allowed label */}
              <text x="35" y="32" textAnchor="middle" fill="#fbbf24" fontSize="8" fontFamily="monospace">
                [{trunks.left.join(',') || 'none'}]
              </text>
            </g>

            {/* SWITCH 2 GRAPHIC */}
            <g transform={`translate(${SW2_POS.x}, ${SW2_POS.y})`}>
              {/* Chassis 1U */}
              <rect
                x="-65"
                y="-32"
                width="130"
                height="64"
                rx="6"
                fill="url(#vlan-sw-body)"
                stroke={activeStep?.activeDeviceId === 'SW2' ? '#38bdf8' : '#475569'}
                strokeWidth={activeStep?.activeDeviceId === 'SW2' ? '2.5' : '1.5'}
              />
              <rect x="-70" y="-30" width="5" height="60" rx="1" fill="#334155" />
              <rect x="65" y="-30" width="5" height="60" rx="1" fill="#334155" />

              <rect x="-60" y="-26" width="120" height="52" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />

              {/* Trunk Port: Left (Gi0/1) */}
              <g transform="translate(-50, -3)">
                <rect x="0" y="0" width="14" height="12" rx="1" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.2" />
                <circle cx="7" cy="-4" r="1.5" fill="#f59e0b" />
                <text x="7" y="22" textAnchor="middle" fill="#fbbf24" fontSize="8" fontFamily="monospace">
                  Gi0/1
                </text>
              </g>

              {/* Port Bank: Right (Fa0/1, Fa0/2) */}
              <g transform="translate(36, -12)">
                <rect x="0" y="0" width="12" height="10" rx="1" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
                <circle cx="6" cy="-4" r="1.5" fill="#22c55e" />
                <text x="6" y="20" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  Fa0/1
                </text>
              </g>
              <g transform="translate(36, 6)">
                <rect x="0" y="0" width="12" height="10" rx="1" fill="#1e293b" stroke="#a855f7" strokeWidth="1" />
                <circle cx="6" cy="-4" r="1.5" fill="#22c55e" />
                <text x="6" y="20" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  Fa0/2
                </text>
              </g>

              <text x="0" y="-6" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold">
                SW2
              </text>
              <text x="0" y="9" textAnchor="middle" fill="#94a3b8" fontSize="9">
                {l3Role === 'SW2' ? 'L3 Core / SVI' : 'L2 Access'}
              </text>

              {/* L3 Routing Badge if active */}
              {l3Role === 'SW2' && (
                <g transform="translate(0, -32)">
                  <circle cx="0" cy="0" r="11" fill="url(#vlan-sw-l3-badge)" stroke="#ffffff" strokeWidth="1.5" />
                  <path
                    d="M -5 0 H 5 M 2 -3 L 5 0 L 2 3 M -2 3 L -5 0 L -2 -3"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <rect x="-36" y="-22" width="72" height="14" rx="4" fill="#0e7490" stroke="#38bdf8" strokeWidth="1" />
                  <text x="0" y="-12" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                    L3 MLS ROUTER
                  </text>
                </g>
              )}

              <text x="-43" y="32" textAnchor="middle" fill="#fbbf24" fontSize="8" fontFamily="monospace">
                [{trunks.right.join(',') || 'none'}]
              </text>
            </g>

            {/* WORKSTATIONS (PC-01, PC-02, PC-03, PC-04) */}
            {HOSTS.map((host) => {
              const hostVlan = vlans[host.id];
              const isSource = source === host.id;
              const isTarget = target === host.id;
              const isActiveNode = activeStep?.activeDeviceId === host.id;
              const isVlan10 = hostVlan === 10;

              return (
                <g
                  key={host.id}
                  transform={`translate(${host.x}, ${host.y})`}
                  onClick={() => handleHostClick(host.id)}
                  className="cursor-pointer group"
                >
                  {/* Active Highlight Aura */}
                  {(isSource || isTarget || isActiveNode) && (
                    <circle
                      cx="0"
                      cy="0"
                      r="46"
                      className={`transition-all duration-300 ${
                        isSource
                          ? 'fill-cyan-500/15 stroke-cyan-400 stroke-2 animate-pulse'
                          : isTarget
                          ? 'fill-purple-500/15 stroke-purple-400 stroke-2'
                          : 'fill-blue-500/10 stroke-blue-400/50 stroke-1'
                      }`}
                    />
                  )}

                  {/* Monitor Bezel */}
                  <rect
                    x="-28"
                    y="-24"
                    width="56"
                    height="38"
                    rx="4"
                    fill="#1e293b"
                    stroke={isVlan10 ? '#06b6d4' : '#a855f7'}
                    strokeWidth="1.8"
                    className="group-hover:stroke-white transition-colors"
                  />
                  {/* Screen Glass */}
                  <rect
                    x="-24"
                    y="-20"
                    width="48"
                    height="30"
                    rx="2"
                    fill={isVlan10 ? '#083344' : '#2e1065'}
                  />
                  {/* Screen Content Graphic */}
                  <rect x="-18" y="-14" width="22" height="3" rx="1" fill="#38bdf8" opacity="0.8" />
                  <rect x="-18" y="-7" width="14" height="2" rx="1" fill="#94a3b8" opacity="0.6" />
                  <rect x="-18" y="-2" width="30" height="2" rx="1" fill="#94a3b8" opacity="0.4" />
                  <rect x="-18" y="3" width="24" height="2" rx="1" fill="#94a3b8" opacity="0.4" />

                  {/* Monitor Stand */}
                  <path d="M -5 14 L -8 24 H 8 L 5 14 Z" fill="#334155" />
                  <rect x="-14" y="24" width="28" height="3" rx="1" fill="#475569" />

                  {/* Role Tags: ИСТОЧНИК / ПОЛУЧАТЕЛЬ */}
                  {isSource && (
                    <g transform="translate(0, -34)">
                      <rect x="-35" y="-10" width="70" height="15" rx="4" fill="#0891b2" stroke="#ffffff" strokeWidth="1" />
                      <text x="0" y="1" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                        ИСТОЧНИК (TX)
                      </text>
                    </g>
                  )}
                  {isTarget && (
                    <g transform="translate(0, -34)">
                      <rect x="-38" y="-10" width="76" height="15" rx="4" fill="#7c3aed" stroke="#ffffff" strokeWidth="1" />
                      <text x="0" y="1" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                        ПОЛУЧАТЕЛЬ (RX)
                      </text>
                    </g>
                  )}

                  {/* Host Name & VLAN badge */}
                  <text x="0" y="38" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">
                    {host.name}
                  </text>
                  <g transform="translate(0, 48)">
                    <rect
                      x="-25"
                      y="-7"
                      width="50"
                      height="14"
                      rx="4"
                      fill={isVlan10 ? '#0e7490' : '#6b21a8'}
                      stroke={isVlan10 ? '#38bdf8' : '#c084fc'}
                      strokeWidth="1"
                    />
                    <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      VLAN {hostVlan}
                    </text>
                  </g>

                  {/* IP and Port Subtext */}
                  <text x="0" y="67" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                    {host.ip}
                  </text>
                  <text x="0" y="77" textAnchor="middle" fill="#64748b" fontSize="8">
                    Порт: {host.port}
                  </text>
                </g>
              );
            })}

            {/* ANIMATED PDU CAPSULE (Interpolated along physical wires) */}
            {activeStep && (
              <g>
                {/* Movement Track with Motion */}
                <motion.g
                  key={currentStepIndex}
                  initial={{ x: activeStep.from.x, y: activeStep.from.y }}
                  animate={{ x: activeStep.to.x, y: activeStep.to.y }}
                  transition={{ duration: 0.6 / playbackSpeed, ease: 'easeInOut' }}
                >
                  {/* Dropped Explosion / Barrier */}
                  {activeStep.dropped ? (
                    <g filter="url(#pdu-error-shadow)">
                      <circle cx="0" cy="0" r="18" fill="#e11d48" stroke="#ffffff" strokeWidth="2.5" />
                      <path d="M -7 -7 L 7 7 M 7 -7 L -7 7" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                      {/* Pulsing shock ring */}
                      <circle cx="0" cy="0" r="28" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" />
                      <rect x="-35" y="-36" width="70" height="15" rx="4" fill="#881337" stroke="#fb7185" strokeWidth="1" />
                      <text x="0" y="-25" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                        DROP / БАРЬЕР
                      </text>
                    </g>
                  ) : activeStep.actionType === 'l3_svi_route' ? (
                    /* L3 SVI Routing Core Process */
                    <g filter="url(#pdu-drop-shadow)">
                      <circle cx="0" cy="0" r="22" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
                      <path
                        d="M -7 0 H 7 M 3 -4 L 7 0 L 3 4 M -3 4 L -7 0 L -3 -4"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <rect x="-42" y="-38" width="84" height="16" rx="4" fill="#0369a1" stroke="#7dd3fc" strokeWidth="1" />
                      <text x="0" y="-27" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                        SVI L3 ROUTE: TTL-1
                      </text>
                    </g>
                  ) : (
                    /* Standard In-Flight Ethernet Frame Capsule */
                    <g filter="url(#pdu-drop-shadow)">
                      {/* Frame Body Pill */}
                      <rect
                        x="-30"
                        y="-14"
                        width="60"
                        height="28"
                        rx="14"
                        fill={activeStep.pdu.isTagged ? '#78350f' : '#0f172a'}
                        stroke={activeStep.pdu.isTagged ? '#f59e0b' : '#38bdf8'}
                        strokeWidth="2"
                      />
                      {/* Pulse Glow Center */}
                      <circle cx="-16" cy="0" r="4" fill={activeStep.pdu.isTagged ? '#fbbf24' : '#38bdf8'} />
                      <text
                        x="2"
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {activeStep.pdu.isTagged ? '802.1Q' : 'ETH-II'}
                      </text>

                      {/* Tag Ribbon attachment if Tagged */}
                      {activeStep.pdu.isTagged && (
                        <g transform="translate(0, -26)">
                          <rect
                            x="-32"
                            y="-9"
                            width="64"
                            height="16"
                            rx="4"
                            fill="#b45309"
                            stroke="#fef08a"
                            strokeWidth="1.2"
                          />
                          <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                            VID: {activeStep.pdu.vlanId} (4B)
                          </text>
                        </g>
                      )}
                    </g>
                  )}
                </motion.g>
              </g>
            )}
          </svg>
        </div>

        {/* Legend beneath canvas */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center flex-wrap gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>Access VLAN 10 (1518 B)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Access VLAN 20 (1518 B)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>802.1Q Trunk (+4B Tag, 1522 B)</span>
            </span>
          </div>

          <div className="text-right">
            <span>Маршрутизация SVI: </span>
            <strong className="text-slate-800 dark:text-slate-200 font-mono">
              {l3Role === 'none' ? 'Выключена (L2)' : l3Role === 'SW1' ? 'Активна на SW1' : 'Активна на SW2'}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Interactive Step-by-Step Playback Controls */}
      <div className="rounded-3xl border border-slate-200 dark:border-cyan-500/25 bg-white/95 dark:bg-[#071322]/95 p-4 sm:p-6 shadow-xl space-y-4 transition-colors">
        {/* Transmission Target Info & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Маршрут тестирования передачи
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30">
                {sourceData.name} ({sourceData.label}, VLAN {vlans[source]})
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-400/30">
                {targetData.name} ({targetData.label}, VLAN {vlans[target]})
              </span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => handleReset(mode)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer min-h-[40px]"
              title="Сбросить состояние"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сброс</span>
            </button>

            <button
              onClick={handleStartSimulation}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white dark:text-slate-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-md shadow-cyan-500/20 cursor-pointer min-h-[40px]"
            >
              <Activity className="w-4 h-4" />
              <span>Запустить передачу кадра</span>
            </button>
          </div>
        </div>

        {/* Active Step Details & Timeline Scrubber if Trace Active */}
        {trace && activeStep && (
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Scrubber Header */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-cyan-700 dark:text-cyan-400">
                ЭТАП {currentStepIndex + 1} ИЗ {totalSteps}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Кадр: {activeStep.pdu.isTagged ? `802.1Q (VID ${activeStep.pdu.vlanId}, 1522 B)` : `Ethernet II Untagged (1518 B)`}
              </span>
            </div>

            {/* Range Slider Scrubber */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={totalSteps - 1}
                value={currentStepIndex}
                onChange={(e) => handleGoToStep(Number(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                aria-label="Перемотка этапов передачи кадра"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>TX: {sourceData.name}</span>
                <span>ASIC коммутации</span>
                <span>RX: {targetData.name}</span>
              </div>
            </div>

            {/* Current Step Description Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                activeStep.dropped
                  ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-400/60 text-rose-950 dark:text-rose-100'
                  : 'bg-cyan-50/70 dark:bg-cyan-950/30 border-cyan-400/40 text-slate-900 dark:text-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {activeStep.dropped ? (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    )}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {activeStep.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 pl-7">
                    {activeStep.detail}
                  </p>
                </div>

                <div className="shrink-0 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  TTL: {activeStep.pdu.ttl}
                </div>
              </div>

              {/* Engineering Standard Rule Callout */}
              <div className="mt-3 pt-2.5 border-t border-slate-300/60 dark:border-slate-800/80 pl-7 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                <span className="font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider shrink-0">
                  Правило:
                </span>
                <span>{activeStep.rule}</span>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStepPrev}
                  disabled={currentStepIndex === 0}
                  type="button"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 disabled:opacity-40 transition-all cursor-pointer min-h-[38px] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Назад</span>
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  type="button"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer min-h-[38px] flex items-center gap-1.5"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-500" />
                      <span>Пауза</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Автоплей</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleStepNext}
                  disabled={currentStepIndex === totalSteps - 1}
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40 transition-all cursor-pointer min-h-[38px] flex items-center gap-1.5"
                >
                  <span>Следующий шаг</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Speed Switcher */}
              <button
                onClick={handleCycleSpeed}
                type="button"
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-400 transition-colors self-start sm:self-auto cursor-pointer"
                title="Скорость анимации"
              >
                Скорость: {playbackSpeed}x
              </button>
            </div>
          </div>
        )}

        {/* Result Verdict Card */}
        {trace && currentStepIndex === totalSteps - 1 && (
          <div
            className={`p-4 rounded-2xl border ${
              trace.outcome.delivered
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-950 dark:text-emerald-100'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-950 dark:text-rose-100'
            }`}
          >
            <div className="flex items-start gap-3">
              {trace.outcome.delivered ? (
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="text-base font-bold">{trace.outcome.message}</h4>
                <p className="text-xs sm:text-sm leading-relaxed">{trace.outcome.explanation}</p>
                {trace.outcome.tagged && (
                  <p className="text-[11px] font-mono opacity-90 pt-1">
                    802.1Q Заголовок: TPID 0x8100 · PCP 0 · DEI 0 · VID {trace.initialVlan} ➔ {trace.finalVlan}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Case Success Banner */}
        {completed && mode !== 'explore' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-cyan-950/70 border border-emerald-400 text-emerald-200 flex items-center justify-between gap-3 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-sm text-white">Дело раскрыто! Связность успешно восстановлена.</span>
                <p className="text-xs text-emerald-300">
                  Вы правильно настроили параметры портов/транка за {attempts} {attempts === 1 ? 'попытку' : 'попытки'}.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleReset('explore')}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer shrink-0"
            >
              В свободный режим
            </button>
          </div>
        )}
      </div>

      {/* 4. Live Frame Anatomy Inspector (PDU Analyzer) */}
      {trace && activeStep && (
        <div className="rounded-3xl border border-slate-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#071322]/95 p-4 sm:p-6 shadow-xl space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-cyan-500" />
              <span>Анатомия передаваемого кадра (Live PDU Inspector)</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Размер: {activeStep.pdu.frameSizeBytes} байт
            </span>
          </div>

          {/* Interactive Frame Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
            {/* Block 1: Preamble */}
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">Преамбула</span>
              <strong className="text-slate-700 dark:text-slate-300 text-[11px]">8 Байт</strong>
              <span className="text-[9px] text-slate-400 block truncate">10101011</span>
            </div>

            {/* Block 2: MAC Headers */}
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center sm:col-span-2">
              <span className="text-[10px] text-slate-500 block">MAC назначения & источника</span>
              <strong className="text-cyan-700 dark:text-cyan-300 text-[11px] block truncate">
                {activeStep.pdu.dstMac.slice(0, 11)}..
              </strong>
              <span className="text-[9px] text-slate-400 block truncate">От: {activeStep.pdu.srcMac.slice(0, 11)}..</span>
            </div>

            {/* Block 3: 802.1Q Tag (Dynamic) */}
            <div
              className={`p-2 rounded-xl border text-center transition-all ${
                activeStep.pdu.isTagged
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400/40'
                  : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-40'
              }`}
            >
              <span className="text-[10px] block font-bold">802.1Q Тег (4B)</span>
              <strong className="text-[11px] block">
                {activeStep.pdu.isTagged ? `VID: ${activeStep.pdu.vlanId}` : 'Отсутствует'}
              </strong>
              <span className="text-[9px] block">
                {activeStep.pdu.isTagged ? 'TPID 0x8100' : 'Access (Untagged)'}
              </span>
            </div>

            {/* Block 4: EtherType & IP Payload */}
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">EtherType / IP</span>
              <strong className="text-purple-700 dark:text-purple-300 text-[11px] block">0x0800 IPv4</strong>
              <span className="text-[9px] text-slate-400 block">TTL={activeStep.pdu.ttl}</span>
            </div>

            {/* Block 5: FCS CRC */}
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">FCS / CRC</span>
              <strong className="text-emerald-700 dark:text-emerald-300 text-[11px]">4 Байта</strong>
              <span className="text-[9px] text-slate-400 block">CRC32 OK</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Collapsible Stand Settings Panel (L2/L3, Access VLAN, Trunk) - Collapsed by default */}
      <div className="rounded-3xl border border-slate-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#071322]/95 p-4 sm:p-6 shadow-xl space-y-4 transition-colors">
        <button
          type="button"
          aria-expanded={showSettings}
          onClick={() => {
            setShowSettings(!showSettings);
            triggerHaptic('light');
          }}
          className="w-full flex items-center justify-between text-left cursor-pointer min-h-[40px]"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <div>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white block">
                Панель конфигурации стенда (L2/L3, Access VLAN, Trunk)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Настройте принадлежность портов, списки allowed VLAN и включите SVI-маршрутизатор
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 dark:text-cyan-400 shrink-0">
            <span>{showSettings ? 'Свернуть' : 'Развернуть настройки'}</span>
            {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showSettings && (
          <div className="space-y-5 pt-3 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
            {/* L2/L3 Engine Role Switcher */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                    Режим коммутаторов: L2 Switch против Multilayer L3 (SVI)
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    В режиме L3 на выбранном коммутаторе активируются SVI VLAN 10/20 и команда <code>ip routing</code>.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {([
                    ['none', 'Оба L2 (Только свитчинг)'],
                    ['SW1', 'SW1 = L3 Router (SVI)'],
                    ['SW2', 'SW2 = L3 Router (SVI)'],
                  ] as const).map(([role, label]) => {
                    const isSelected = l3Role === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleL3RoleChange(role)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-cyan-400'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Access Port VLAN Assignment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {HOSTS.map((host) => {
                const curVlan = vlans[host.id];
                return (
                  <div
                    key={host.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {host.name} ({host.switchId}:{host.port})
                      </span>
                      <span className="text-[10px] text-slate-400">{host.label}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleVlanChange(host.id, 10)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          curVlan === 10
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        VLAN 10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVlanChange(host.id, 20)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          curVlan === 20
                            ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        VLAN 20
                      </button>
                    </div>

                    <p className="text-[10px] font-mono text-slate-500">switchport access vlan {curVlan}</p>
                  </div>
                );
              })}
            </div>

            {/* Trunk Allowed VLAN Configuration & Cisco IOS Syntax */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SW1 Gi0/1 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cable className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      SW1 · Trunk Gi0/1 (allowed list)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                    [{trunks.left.join(',') || 'none'}]
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {([10, 20] as const).map((vid) => (
                    <label key={vid} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trunks.left.includes(vid)}
                        onChange={() => handleTrunkToggle('left', vid)}
                        className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                      />
                      <span>Разрешить VLAN {vid}</span>
                    </label>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5">
                  <p className="text-slate-500">interface GigabitEthernet0/1</p>
                  <p>switchport mode trunk</p>
                  <p className="text-cyan-700 dark:text-cyan-300">
                    switchport trunk allowed vlan {trunks.left.join(',') || 'none'}
                  </p>
                </div>
              </div>

              {/* SW2 Gi0/1 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cable className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      SW2 · Trunk Gi0/1 (allowed list)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                    [{trunks.right.join(',') || 'none'}]
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {([10, 20] as const).map((vid) => (
                    <label key={vid} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trunks.right.includes(vid)}
                        onChange={() => handleTrunkToggle('right', vid)}
                        className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                      />
                      <span>Разрешить VLAN {vid}</span>
                    </label>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5">
                  <p className="text-slate-500">interface GigabitEthernet0/1</p>
                  <p>switchport mode trunk</p>
                  <p className="text-cyan-700 dark:text-cyan-300">
                    switchport trunk allowed vlan {trunks.right.join(',') || 'none'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Educational 802.1Q Reference Guide Accordion */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 p-4 sm:p-5 shadow-sm transition-colors">
        <button
          type="button"
          aria-expanded={showTheory}
          onClick={() => {
            setShowTheory(!showTheory);
            triggerHaptic('light');
          }}
          className="w-full flex items-center justify-between text-left cursor-pointer min-h-[36px]"
        >
          <span className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            <Info className="w-4 h-4 text-cyan-500" />
            <span>Инженерный справочник: поля 4-байтного заголовка IEEE 802.1Q</span>
          </span>
          <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">
            {showTheory ? 'Свернуть' : 'Показать справку'}
          </span>
        </button>

        {showTheory && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 animate-fade-in text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold block">TPID · 16 бит</span>
              <strong className="text-sm text-slate-900 dark:text-white block mt-0.5 font-mono">0x8100</strong>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Tag Protocol Identifier. Обозначает наличие тега 802.1Q в кадре.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold block">PCP · 3 бита</span>
              <strong className="text-sm text-slate-900 dark:text-white block mt-0.5">Priority Code (0-7)</strong>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Приоритет QoS (CoS) для очередей коммутатора (Voice, Video, Best Effort).
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold block">DEI · 1 бит</span>
              <strong className="text-sm text-slate-900 dark:text-white block mt-0.5">Drop Eligible</strong>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Флаг готовности к отбрасыванию пакета при перегрузке интерфейса.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold block">VID · 12 бит</span>
              <strong className="text-sm text-slate-900 dark:text-white block mt-0.5 font-mono">1–4094</strong>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                VLAN Identifier. До 4094 виртуальных сетей на одном физическом канале.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

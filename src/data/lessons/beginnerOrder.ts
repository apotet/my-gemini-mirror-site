import type { Lesson } from './types';

export const BEGINNER_STAGES = [
  { title: 'Как устроена сеть', ids: ['tcpip-model', 'osi-pdu'] },
  { title: 'Локальная сеть и Ethernet', ids: ['l1-copper-cable', 'l2-ethernet'] },
  { title: 'IPv4 и доставка пакета', ids: ['l3-masks', 'l3-private-ipv4', 'l3-route-selection', 'l3-arp', 'l3-icmp-basics'] },
  { title: 'Порты и сетевые службы', ids: ['l4-service-ports', 'l7-dhcp', 'l7-http-status-basics', 'l7-mail-mx'] },
  { title: 'CLI и диагностика', ids: ['cli-console-ssh-telnet', 'cli-ios-modes', 'cli-show-help-tab', 'cli-save-config', 'ts-cli-network-basics'] },
] as const;

export const BEGINNER_EXTRAS = [
  { title: 'Дополнительно: модели сети', after: 'osi-pdu', ids: ['osi-session-presentation'] },
  { title: 'Дополнительно: доставка пакета', after: 'l3-icmp-basics', ids: ['tcpip-end-to-end-principle'] },
  { title: 'Дополнительно: медь и монтаж', after: 'l1-copper-cable', ids: ['l1-copper-mark-frequency', 'l1-copper-installation', 'l1-copper-termination-quality', 'l1-copper-cabinet-labeling'] },
  { title: 'Дополнительно: питание PoE', after: 'l2-ethernet', ids: ['l1-copper-fault-poe', 'l1-poe-budget', 'l1-poe-injectors-splitters'] },
  { title: 'Дополнительно: панели и оптика', after: 'l2-ethernet', ids: ['l1-switch-panel-identification', 'l1-fiber-hardware', 'l1-optical-panel-photo'] },
] as const;

export const BEGINNER_CORE_IDS = BEGINNER_STAGES.flatMap<string>(group => group.ids);
const rank = new Map([...BEGINNER_CORE_IDS, ...BEGINNER_EXTRAS.flatMap<string>(group => group.ids)]
  .map((id, index) => [id, index]));
const titleOrder = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

export function compareBeginnerTitles(a: Lesson, b: Lesson) {
  return titleOrder.compare(a.title, b.title) || a.id.localeCompare(b.id);
}

export function compareBeginnerOrder(a: Lesson, b: Lesson) {
  return (rank.get(a.id) ?? rank.size) - (rank.get(b.id) ?? rank.size) || compareBeginnerTitles(a, b);
}

export function beginnerNeighbors(id: string): { previous?: string; next?: string; position?: number } {
  const index = BEGINNER_CORE_IDS.indexOf(id);
  if (index >= 0) return { previous: BEGINNER_CORE_IDS[index - 1], next: BEGINNER_CORE_IDS[index + 1], position: index + 1 };
  for (const branch of BEGINNER_EXTRAS) {
    const ids: readonly string[] = branch.ids;
    const index = ids.indexOf(id);
    if (index >= 0) return { previous: ids[index - 1] ?? branch.after, next: ids[index + 1] };
  }
  return {};
}

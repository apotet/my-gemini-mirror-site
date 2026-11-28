export type MasteryStatus = 'verified' | 'practiced' | 'studied' | 'unstarted';

export type AcademyTierId = 'foundation' | 'core' | 'routing_services' | 'advanced' | 'crosscutting';

export type AccessFormat = 'open' | 'pro_lab';

export interface AcademyNode {
  id: string;
  code: string;
  tier: AcademyTierId;
  tierLabel: string;
  title: string;
  shortTitle: string;
  summary: string;
  whyItMatters: string;
  difficulty: 'Базовый' | 'Углублённый' | 'Прикладной' | 'Архитектурный';
  durationLabel: string;
  accessFormat: AccessFormat;
  accessLabel: string;
  prerequisites: string[];
  outcomes: string[];
  /** Demonstration mastery state in the 'active' learner profile (60% progress) */
  activeMastery: MasteryStatus;
  /** Optional cross-cutting stage annotations for Security & Diagnostics */
  crosscuttingStages?: string[];
  /** Node center position in the 1180x610 SVG blueprint coordinate system */
  mapPos: { x: number; y: number };
  /** True when this node maps directly to the full interactive IP-Addressing course */
  hasInteractiveCourse?: boolean;
  /** True when this node was newly added in the expanded NetOps Academy ecosystem */
  isNewDomain?: boolean;
}

export interface CareerRolePath {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  evolutionKind: 'deepening' | 'transition';
  evolutionLabel: string;
  tagline: string;
  description: string;
  /** Nodes strictly critical for this role — highlighted at 100% when role is selected */
  criticalNodeIds: string[];
  /** Optional supporting nodes — shown softly when requested */
  supportingNodeIds: string[];
  /** Additional role-specific bridge modules beyond the core network graph */
  bridgeSkills: string[];
  /** Y-coordinate in the right-hand Career Evolution Fork column (x = 1045) */
  forkY: number;
  accentHexLight: string;
  accentHexDark: string;
}

export const ACADEMY_NODES: AcademyNode[] = [
  /* ---------------------- TIER 1: FOUNDATION (x = 95) ---------------------- */
  {
    id: 'net-basics',
    code: 'NET-01',
    tier: 'foundation',
    tierLabel: 'Фундамент',
    title: 'Основы компьютерных сетей',
    shortTitle: 'Основы сетей',
    summary: 'Узлы, среды передачи, локальные и распределённые сети, логика обмена между клиентом и сервером.',
    whyItMatters: 'Формирует ментальную модель сети: без неё любая настройка коммутатора или облачного VPC превращается в угадывание.',
    difficulty: 'Базовый',
    durationLabel: '1,5 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто',
    prerequisites: [],
    outcomes: [
      'Отличать локальный L2-обмен от маршрутизируемого трафика',
      'Определять роли коммутатора, маршрутизатора и шлюза по умолчанию',
      'Читать типовую логическую схему корпоративной сети',
    ],
    activeMastery: 'verified',
    mapPos: { x: 96, y: 120 },
  },
  {
    id: 'cables-optics-poe',
    code: 'NET-02',
    tier: 'foundation',
    tierLabel: 'Фундамент',
    title: 'Кабели, оптика и PoE',
    shortTitle: 'Кабели, оптика, PoE',
    summary: 'Витая пара, одномодовое и многомодовое волокно, оптический бюджет, SFP/QSFP и питание PoE.',
    whyItMatters: 'Около трети инцидентов на доступе начинаются на физическом уровне: неверный тип волокна, грязный коннектор или дефицит бюджета PoE.',
    difficulty: 'Базовый',
    durationLabel: '2 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто',
    prerequisites: ['net-basics'],
    outcomes: [
      'Подбирать тип оптического трансивера и патч-корда под дистанцию',
      'Рассчитывать бюджет мощности PoE 802.3af/at/bt на коммутатор',
      'Интерпретировать затухание, CRC-ошибки и деградацию линка',
    ],
    activeMastery: 'verified',
    mapPos: { x: 96, y: 245 },
  },
  {
    id: 'linux-net',
    code: 'SYS-01',
    tier: 'foundation',
    tierLabel: 'Фундамент',
    title: 'Linux для сетевого инженера',
    shortTitle: 'Linux для сетей',
    summary: 'Сетевой стек ядра Linux, iproute2, namespaces, systemd-networkd, nftables, ss и tcpdump.',
    whyItMatters: 'Современные сетевые ОС, контейнеры, облачные шлюзы и серверы автоматизации работают на Linux — это главный мост к DevOps, SRE и Cloud.',
    difficulty: 'Базовый',
    durationLabel: '3 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто',
    prerequisites: ['net-basics'],
    outcomes: [
      'Настраивать интерфейсы, VLAN и маршруты через iproute2',
      'Диагностировать сокеты и пакеты с помощью ss, tcpdump и conntrack',
      'Понимать network namespaces, veth-пары и Linux bridge',
    ],
    activeMastery: 'practiced',
    mapPos: { x: 96, y: 375 },
    isNewDomain: true,
  },

  /* ---------------------- TIER 2: CORE L2/L3 (x = 285) ---------------------- */
  {
    id: 'osi-tcpip',
    code: 'NET-03',
    tier: 'core',
    tierLabel: 'Ядро L2–L4',
    title: 'Модели OSI и TCP/IP',
    shortTitle: 'OSI и TCP/IP',
    summary: 'Инкапсуляция, структура заголовков L2–L4, границы уровней и сквозной путь пакета.',
    whyItMatters: 'Позволяет системно сужать поиск неисправности по уровням вместо хаотичной перезагрузки оборудования.',
    difficulty: 'Базовый',
    durationLabel: '2 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто',
    prerequisites: ['net-basics'],
    outcomes: [
      'Прослеживать смену MAC-адресов и сохранность IP по маршруту',
      'Сопоставлять протоколы и симптомы сбоев с уровнями стека',
      'Читать дампы заголовков Ethernet, IP и TCP/UDP',
    ],
    activeMastery: 'verified',
    mapPos: { x: 286, y: 112 },
  },
  {
    id: 'switching',
    code: 'NET-04',
    tier: 'core',
    tierLabel: 'Ядро L2–L4',
    title: 'Коммутация',
    shortTitle: 'Коммутация',
    summary: 'Таблица MAC, VLAN и 802.1Q trunk, защита от петель STP/RSTP, LACP и сегментация L2.',
    whyItMatters: 'Ошибки в VLAN или STP способны мгновенно положить целый кампус или промышленный цех из-за широковещательного шторма.',
    difficulty: 'Углублённый',
    durationLabel: '3 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто',
    prerequisites: ['osi-tcpip', 'cables-optics-poe'],
    outcomes: [
      'Проектировать access- и trunk-порты без утечек native VLAN',
      'Рассчитывать корневой мост и заблокированные порты RSTP',
      'Объединять каналы через LACP и ловить MAC-flapping',
    ],
    activeMastery: 'verified',
    mapPos: { x: 286, y: 210 },
  },
  {
    id: 'ip-addressing',
    code: 'NET-05',
    tier: 'core',
    tierLabel: 'Ядро L2–L4',
    title: 'IP-адресация',
    shortTitle: 'IP-адресация',
    summary: 'Маски CIDR, частные диапазоны RFC 1918, расчёт подсетей и хостов, IPv6 и SLAAC.',
    whyItMatters: 'Базовый язык всех сетевых и облачных технологий: от офисных VLAN до планирования CIDR-блоков в AWS/Kubernetes.',
    difficulty: 'Углублённый',
    durationLabel: '2,5 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто',
    prerequisites: ['osi-tcpip'],
    outcomes: [
      'Мгновенно определять сеть, broadcast и число хостов для /24–/30',
      'Отличать частные, служебные (APIPA, CGNAT) и публичные адреса',
      'Проектировать адресный план без пересечений и настраивать IPv6 SLAAC',
    ],
    activeMastery: 'studied',
    mapPos: { x: 286, y: 310 },
    hasInteractiveCourse: true,
  },
  {
    id: 'transport-protocols',
    code: 'NET-06',
    tier: 'core',
    tierLabel: 'Ядро L2–L4',
    title: 'Транспортные протоколы',
    shortTitle: 'TCP, UDP и QUIC',
    summary: 'Рукопожатие TCP, окно перегрузки, таймеры ретрансмиссий, MTU/MSS, UDP и QUIC.',
    whyItMatters: 'Критично для SRE, DevOps и сетевой диагностики: объясняет, почему «пинг есть, а приложение тормозит».',
    difficulty: 'Углублённый',
    durationLabel: '2,5 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто',
    prerequisites: ['osi-tcpip', 'ip-addressing'],
    outcomes: [
      'Находить причины TCP-ретрансмиссий, zero window и PMTUD blackhole',
      'Различать сценарии TCP, UDP и QUIC под нагрузкой',
      'Читать флаги SYN/ACK/FIN/RST и состояния сокетов',
    ],
    activeMastery: 'studied',
    mapPos: { x: 286, y: 408 },
  },

  /* ---------------- TIER 3: ROUTING, SERVICES & MEDIA (x = 485) ---------------- */
  {
    id: 'routing',
    code: 'NET-07',
    tier: 'routing_services',
    tierLabel: 'Маршруты и сервисы',
    title: 'Маршрутизация',
    shortTitle: 'Маршрутизация',
    summary: 'Longest Prefix Match, статические маршруты, OSPF, FHRP (VRRP/HSRP) и NAT/PAT.',
    whyItMatters: 'Связывает изолированные сегменты в единую отказоустойчивую инфраструктуру предприятия.',
    difficulty: 'Углублённый',
    durationLabel: '3,5 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто',
    prerequisites: ['ip-addressing', 'switching'],
    outcomes: [
      'Читать таблицу маршрутизации с учётом метрик и AD',
      'Строить отказоустойчивые области OSPF и резервирование шлюза VRRP',
      'Устранять асимметричную маршрутизацию и ошибки NAT',
    ],
    activeMastery: 'practiced',
    mapPos: { x: 486, y: 112 },
  },
  {
    id: 'bgp-wan',
    code: 'NET-08',
    tier: 'routing_services',
    tierLabel: 'Маршруты и сервисы',
    title: 'BGP, WAN и резервирование',
    shortTitle: 'BGP и WAN',
    summary: 'Автономные системы, атрибуты BGP (LocalPref, AS-Path, MED), multihoming, SD-WAN и IPSec-туннели.',
    whyItMatters: 'Недостающее звено между корпоративной сетью и архитектурой ЦОД, облаков и операторов связи.',
    difficulty: 'Архитектурный',
    durationLabel: '4 ч',
    accessFormat: 'pro_lab',
    accessLabel: 'Pro-стенд',
    prerequisites: ['routing'],
    outcomes: [
      'Управлять входящим и исходящим трафиком между двумя провайдерами',
      'Проектировать eBGP/iBGP-связность и фильтрацию префиксов (RPKI)',
      'Выбирать между MPLS, IPSec и SD-WAN для филиальной сети',
    ],
    activeMastery: 'unstarted',
    mapPos: { x: 486, y: 202 },
    isNewDomain: true,
  },
  {
    id: 'network-services',
    code: 'NET-09',
    tier: 'routing_services',
    tierLabel: 'Маршруты и сервисы',
    title: 'Сетевые сервисы',
    shortTitle: 'DNS, DHCP, NTP',
    summary: 'Иерархия DNS, DHCP/Relay, точное время NTP, балансировка L4/L7, обратные прокси и HTTP/TLS.',
    whyItMatters: '90% обращений «сеть не работает» упираются в сбой DNS, исчерпанный пул DHCP или рассинхрон времени для сертификатов.',
    difficulty: 'Углублённый',
    durationLabel: '2,5 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто',
    prerequisites: ['ip-addressing', 'transport-protocols'],
    outcomes: [
      'Диагностировать цепочку DNS-резолвинга и выдачу адресов через DHCP Relay',
      'Настраивать отказоустойчивый NTP и проверять рукопожатие TLS',
      'Понимать принципы L4/L7-балансировки нагрузки',
    ],
    activeMastery: 'verified',
    mapPos: { x: 486, y: 292 },
  },
  {
    id: 'wireless',
    code: 'NET-10',
    tier: 'routing_services',
    tierLabel: 'Маршруты и сервисы',
    title: 'Беспроводные сети',
    shortTitle: 'Беспроводные сети',
    summary: 'Радиопланирование Wi-Fi 6/7, каналы 2,4/5/6 ГГц, контроллеры, роуминг 802.11r/k/v и WPA3-Enterprise.',
    whyItMatters: 'В современных офисах и на складах Wi-Fi стал основной сетью доступа, требующей грамотного радиоплана и 802.1X.',
    difficulty: 'Прикладной',
    durationLabel: '2 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто',
    prerequisites: ['switching', 'network-services'],
    outcomes: [
      'Составлять частотный план без взаимной интерференции каналов',
      'Настраивать бесшовный роуминг и авторизацию через RADIUS/802.1X',
      'Выявлять проблемы SNR, скрытых узлов и перегрузки эфира',
    ],
    activeMastery: 'studied',
    mapPos: { x: 486, y: 378 },
  },
  {
    id: 'ip-telephony',
    code: 'NET-11',
    tier: 'routing_services',
    tierLabel: 'Маршруты и сервисы',
    title: 'IP-телефония',
    shortTitle: 'IP-телефония',
    summary: 'Сигнализация SIP, медиапотоки RTP/SRTP, кодеки, прохождение NAT (STUN/ICE), Voice VLAN и QoS.',
    whyItMatters: 'Голос мгновенно выявляет джиттер и потери пакетов; знание SIP/QoS необходимо корпоративным и телеком-инженерам.',
    difficulty: 'Прикладной',
    durationLabel: '2 ч',
    accessFormat: 'pro_lab',
    accessLabel: 'Pro-стенд',
    prerequisites: ['transport-protocols', 'network-services'],
    outcomes: [
      'Читать SIP-диалоги INVITE/200 OK/BYE и выявлять одностороннюю слышимость',
      'Выделять Voice VLAN и настраивать приоритезацию DSCP EF (QoS)',
      'Устранять проблемы SIP ALG и обрывы RTP за NAT',
    ],
    activeMastery: 'unstarted',
    mapPos: { x: 486, y: 458 },
    isNewDomain: true,
  },

  /* ---------- TIER 4: DESIGN, CLOUD, AUTOMATION & OT (x = 695) ---------- */
  {
    id: 'network-design',
    code: 'ARC-01',
    tier: 'advanced',
    tierLabel: 'Архитектура и среды',
    title: 'Проектирование сетей',
    shortTitle: 'Проектирование сетей',
    summary: 'Топологии Spine-Leaf и 3-tier, домены отказов, расчёт пропускной способности, HLD/LLD-документация.',
    whyItMatters: 'Переводит инженера от настройки отдельных устройств к созданию масштабируемых отказоустойчивых архитектур.',
    difficulty: 'Архитектурный',
    durationLabel: '4 ч',
    accessFormat: 'pro_lab',
    accessLabel: 'Pro-стенд',
    prerequisites: ['switching', 'routing', 'bgp-wan'],
    outcomes: [
      'Проектировать кампусные сети и фабрики ЦОД (Spine-Leaf)',
      'Закладывать резервирование N+1 и оценивать домены отказа',
      'Готовить инженерные HLD/LLD-спецификации и план миграции',
    ],
    activeMastery: 'unstarted',
    mapPos: { x: 696, y: 122 },
    isNewDomain: true,
  },
  {
    id: 'cloud-virtual-net',
    code: 'CLD-01',
    tier: 'advanced',
    tierLabel: 'Архитектура и среды',
    title: 'Виртуальные и облачные сети',
    shortTitle: 'Облачные сети',
    summary: 'VPC, подсети и таблицы маршрутов в облаке, VXLAN/EVPN, Transit Gateway, CNI в Kubernetes и Ingress.',
    whyItMatters: 'Объединяет классическую сетевую инженерию с облаками и Kubernetes — главный трамплин в Cloud, DevOps и SRE.',
    difficulty: 'Архитектурный',
    durationLabel: '3,5 ч',
    accessFormat: 'pro_lab',
    accessLabel: 'Pro-стенд',
    prerequisites: ['bgp-wan', 'network-services', 'linux-net'],
    outcomes: [
      'Проектировать мульти-VPC топологии, пиринг и гибридные каналы в ЦОД',
      'Понимать оверлейные сети VXLAN/EVPN и сетевую модель Kubernetes CNI',
      'Управлять Security Groups, NACL и облачными балансировщиками',
    ],
    activeMastery: 'unstarted',
    mapPos: { x: 696, y: 230 },
    isNewDomain: true,
  },
  {
    id: 'net-automation',
    code: 'AUT-01',
    tier: 'advanced',
    tierLabel: 'Архитектура и среды',
    title: 'Автоматизация сетевой инфраструктуры',
    shortTitle: 'Автоматизация сетей',
    summary: 'Python (Netmiko/Nornir), Ansible, NETCONF/RESTCONF, NetBox как Source of Truth и GitOps-пайплайны.',
    whyItMatters: 'Убирает ручную рутину CLI, снижает число человеческих ошибок и открывает путь в NetDevOps, DevOps и SRE.',
    difficulty: 'Углублённый',
    durationLabel: '4 ч',
    accessFormat: 'pro_lab',
    accessLabel: 'Pro-стенд',
    prerequisites: ['linux-net', 'routing'],
    outcomes: [
      'Описывать конфигурации устройств как код через Jinja2 и Ansible',
      'Валидировать изменения в CI/CD перед выкаткой в продакшен',
      'Интегрировать NetBox и телеметрию в единый контур управления',
    ],
    activeMastery: 'studied',
    mapPos: { x: 696, y: 338 },
    isNewDomain: true,
  },
  {
    id: 'industrial-networks',
    code: 'OT-01',
    tier: 'advanced',
    tierLabel: 'Архитектура и среды',
    title: 'Промышленные сети',
    shortTitle: 'Промышленные сети',
    summary: 'Кольца MRP и HSR/PRP, точное время PTP (IEEE 1588), Modbus TCP, PROFINET и модель Пердью (IEC 62443).',
    whyItMatters: 'Критическая инфраструктура и производство требуют миллисекундного восстановления и строгой изоляции OT от корпоративной сети.',
    difficulty: 'Прикладной',
    durationLabel: '3 ч',
    accessFormat: 'pro_lab',
    accessLabel: 'Pro-стенд',
    prerequisites: ['cables-optics-poe', 'switching', 'routing'],
    outcomes: [
      'Выбирать между RSTP, MRP и бесшовным HSR/PRP по времени переключения',
      'Настраивать демилитаризованную зону (IDMZ) между IT и OT',
      'Обеспечивать детерминизм трафика и синхронизацию PTP',
    ],
    activeMastery: 'unstarted',
    mapPos: { x: 696, y: 446 },
  },

  /* ---------- CROSS-CUTTING CONTINUOUS LAYERS (Spanning entire career) ---------- */
  {
    id: 'network-security',
    code: 'SEC-X',
    tier: 'crosscutting',
    tierLabel: 'Сквозной трек',
    title: 'Сетевая безопасность',
    shortTitle: 'Сетевая безопасность',
    summary: 'Сопровождает каждый уровень: от Port Security и DHCP Snooping на L2 до NGFW, IPSec, 802.1X и Zero Trust.',
    whyItMatters: 'Безопасность нельзя «прикрутить в конце» — она встраивается на каждом этапе от первого порта коммутатора до облачного периметра.',
    difficulty: 'Углублённый',
    durationLabel: 'Сквозной · 4 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто + Pro-стенд',
    prerequisites: ['osi-tcpip', 'switching', 'ip-addressing'],
    outcomes: [
      'Защищать L2 от ARP-spoofing, rogue DHCP и подмены коммутатора',
      'Проектировать зоны NGFW, ACL, IPSec/WireGuard VPN и микросегментацию',
      'Внедрять контроль доступа 802.1X и принципы Zero Trust',
    ],
    activeMastery: 'practiced',
    crosscuttingStages: [
      'L2: Port Security, DHCP Snooping, DAI',
      'L3/WAN: ACL, Stateful Firewall, IPSec/TLS',
      'Cloud/OT: Zero Trust, 802.1X, IDMZ (IEC 62443)',
    ],
    mapPos: { x: 392, y: 42 },
  },
  {
    id: 'monitoring-diagnostics',
    code: 'OPS-X',
    tier: 'crosscutting',
    tierLabel: 'Сквозной трек',
    title: 'Мониторинг и диагностика',
    shortTitle: 'Мониторинг и диагностика',
    summary: 'Сквозная инженерная дисциплина: от ping/traceroute и Wireshark до SNMP, NetFlow, Streaming Telemetry и SLO.',
    whyItMatters: 'Диагностика развивается вместе с инженером: на старте вы ищете обрыв линка, а на уровне архитектора и SRE строите наблюдаемость всей сети.',
    difficulty: 'Углублённый',
    durationLabel: 'Сквозной · 3,5 ч',
    accessFormat: 'open',
    accessLabel: 'Открыто + Pro-стенд',
    prerequisites: ['net-basics', 'osi-tcpip'],
    outcomes: [
      'Проводить методичный траблшутинг с Wireshark, mtr и tcpdump',
      'Собирать метрики интерфейсов и потоков через SNMP, NetFlow и gNMI',
      'Строить алерты без шума и расследовать деградацию по SLO',
    ],
    activeMastery: 'verified',
    crosscuttingStages: [
      'База: ping, traceroute, ARP/MAC-таблицы',
      'Ядро: Wireshark, tcpdump, Syslog, NetFlow',
      'Прод: Prometheus/gNMI Telemetry, RCA и SLO',
    ],
    mapPos: { x: 392, y: 538 },
  },
];

export const ACADEMY_EDGES: Array<{ from: string; to: string }> = ACADEMY_NODES.filter(
  (n) => n.tier !== 'crosscutting'
).flatMap((node) =>
  node.prerequisites
    .filter((pre) => {
      const target = ACADEMY_NODES.find((x) => x.id === pre);
      return target && target.tier !== 'crosscutting';
    })
    .map((pre) => ({ from: pre, to: node.id }))
);

/* -------------------------------------------------------------------------- */
/* CAREER EVOLUTION FORK (8 target IT roles built on NetOps competencies)     */
/* -------------------------------------------------------------------------- */
export const CAREER_ROLES: CareerRolePath[] = [
  {
    id: 'network-architect',
    code: 'ROLE-ARC',
    title: 'Сетевой архитектор',
    shortTitle: 'Сетевой архитектор',
    evolutionKind: 'deepening',
    evolutionLabel: 'Развитие в профессии',
    tagline: 'Проектирование отказоустойчивых сетей предприятий, ЦОД и мультиоблака',
    description:
      'Углубление без смены профессии: переход от эксплуатации отдельных устройств к архитектуре Spine-Leaf, BGP multihoming, безопасности периметра и долгосрочному планированию.',
    criticalNodeIds: [
      'net-basics',
      'osi-tcpip',
      'switching',
      'ip-addressing',
      'routing',
      'bgp-wan',
      'network-design',
      'cloud-virtual-net',
      'network-security',
      'monitoring-diagnostics',
    ],
    supportingNodeIds: ['cables-optics-poe', 'net-automation'],
    bridgeSkills: [
      'Методика HLD / LLD и защита архитектурных решений (ADR)',
      'Экономика каналов, SLA провайдеров и планирование ёмкости на 3–5 лет',
    ],
    forkY: 84,
    accentHexLight: '#1d4ed8',
    accentHexDark: '#38bdf8',
  },
  {
    id: 'net-automation-eng',
    code: 'ROLE-AUT',
    title: 'Инженер по автоматизации сетей',
    shortTitle: 'Автоматизация сетей',
    evolutionKind: 'deepening',
    evolutionLabel: 'Развитие в профессии',
    tagline: 'NetDevOps: сети как код, CI/CD-валидация и Source of Truth',
    description:
      'Эволюция сетевого инженера в NetDevOps: перенос сетевых знаний в Python, Ansible, NETCONF/gNMI и автоматическое тестирование топологий перед изменениями.',
    criticalNodeIds: [
      'net-basics',
      'linux-net',
      'osi-tcpip',
      'switching',
      'ip-addressing',
      'routing',
      'bgp-wan',
      'net-automation',
      'cloud-virtual-net',
      'monitoring-diagnostics',
    ],
    supportingNodeIds: ['network-design', 'network-security'],
    bridgeSkills: [
      'Git-workflow, CI/CD-пайплайны и тестирование в Containerlab/Batfish',
      'API-интеграция NetBox, телеметрии и систем тикетов',
    ],
    forkY: 152,
    accentHexLight: '#0f766e',
    accentHexDark: '#2dd4bf',
  },
  {
    id: 'netsec',
    code: 'ROLE-SEC',
    title: 'Network Security Engineer',
    shortTitle: 'Network Security',
    evolutionKind: 'transition',
    evolutionLabel: 'Смежная специализация',
    tagline: 'Защита периметра, микросегментация, Zero Trust и расследование атак',
    description:
      'Ваша база по L2/L3, маршрутизации и TCP/UDP закрывает половину профессии: остаётся усилить криптографию VPN, политики NGFW, 802.1X и анализ сетевых аномалий.',
    criticalNodeIds: [
      'net-basics',
      'linux-net',
      'osi-tcpip',
      'switching',
      'ip-addressing',
      'routing',
      'transport-protocols',
      'network-services',
      'cloud-virtual-net',
      'network-security',
      'monitoring-diagnostics',
    ],
    supportingNodeIds: ['wireless', 'net-automation'],
    bridgeSkills: [
      'NGFW, IDS/IPS (Suricata/Zeek) и корреляция сетевых событий в SIEM',
      'Архитектура Zero Trust, PKI и реагирование на сетевые инциденты',
    ],
    forkY: 220,
    accentHexLight: '#be123c',
    accentHexDark: '#fb7185',
  },
  {
    id: 'cloud-engineer',
    code: 'ROLE-CLD',
    title: 'Cloud Engineer',
    shortTitle: 'Cloud Engineer',
    evolutionKind: 'transition',
    evolutionLabel: 'Переход в облака',
    tagline: 'Гибридные облака, VPC-архитектура, Kubernetes и Infrastructure as Code',
    description:
      'Сетевые инженеры в облаке на вес золота: понимание CIDR, BGP и DNS сразу даёт преимущество — остаётся добрать VPC/Transit Gateway, Linux и Terraform.',
    criticalNodeIds: [
      'net-basics',
      'linux-net',
      'osi-tcpip',
      'ip-addressing',
      'routing',
      'bgp-wan',
      'network-services',
      'cloud-virtual-net',
      'net-automation',
      'network-security',
    ],
    supportingNodeIds: ['network-design', 'monitoring-diagnostics'],
    bridgeSkills: [
      'Terraform / OpenTofu и управление мультиаккаунтными облачными сетями',
      'IAM, частные эндпоинты и FinOps-контроль трафика',
    ],
    forkY: 288,
    accentHexLight: '#0369a1',
    accentHexDark: '#60a5fa',
  },
  {
    id: 'devops',
    code: 'ROLE-DVO',
    title: 'DevOps-инженер',
    shortTitle: 'DevOps-инженер',
    evolutionKind: 'transition',
    evolutionLabel: 'Смежная IT-профессия',
    tagline: 'Автоматизация доставки, контейнеры, Linux-сети и облачная инфраструктура',
    description:
      'Переход не с нуля: IP-адресация, TCP/TLS, DNS и Linux уже работают на вас. Фокус добора — облачные сети Kubernetes, автоматизация и наблюдаемость.',
    criticalNodeIds: [
      'net-basics',
      'linux-net',
      'osi-tcpip',
      'ip-addressing',
      'transport-protocols',
      'network-services',
      'cloud-virtual-net',
      'net-automation',
      'network-security',
      'monitoring-diagnostics',
    ],
    supportingNodeIds: ['routing'],
    bridgeSkills: [
      'Docker, Kubernetes Networking (Services, Ingress, CNI) и Helm',
      'CI/CD-конвейеры, GitOps и управление секретами',
    ],
    forkY: 356,
    accentHexLight: '#6d28d9',
    accentHexDark: '#a78bfa',
  },
  {
    id: 'sre',
    code: 'ROLE-SRE',
    title: 'SRE-инженер',
    shortTitle: 'SRE-инженер',
    evolutionKind: 'transition',
    evolutionLabel: 'Смежная IT-профессия',
    tagline: 'Надёжность распределённых систем, производительность TCP и observability',
    description:
      'Сильная сетевая диагностика и понимание TCP/BGP — фундамент SRE. Дополните их облачной инфраструктурой, автоматизацией и практиками SLO/постмортемов.',
    criticalNodeIds: [
      'net-basics',
      'linux-net',
      'osi-tcpip',
      'ip-addressing',
      'routing',
      'bgp-wan',
      'transport-protocols',
      'network-services',
      'cloud-virtual-net',
      'net-automation',
      'monitoring-diagnostics',
    ],
    supportingNodeIds: ['network-design', 'network-security'],
    bridgeSkills: [
      'Error Budgets, SLO/SLI, хаос-инжиниринг и разбор инцидентов (RCA)',
      'Глубокий профилинг Linux-стека (eBPF) и глобальная балансировка',
    ],
    forkY: 424,
    accentHexLight: '#b45309',
    accentHexDark: '#fbbf24',
  },
  {
    id: 'sysadmin',
    code: 'ROLE-SYS',
    title: 'Системный администратор',
    shortTitle: 'Системный админ',
    evolutionKind: 'transition',
    evolutionLabel: 'Инфраструктурный профиль',
    tagline: 'Серверы, корпоративные сервисы, Wi-Fi, телефония и поддержка офиса',
    description:
      'Оптимальный профиль для универсального инфраструктурного инженера: сочетание сетей доступа, Linux, DNS/DHCP, Wi-Fi, IP-телефонии и базовой безопасности.',
    criticalNodeIds: [
      'net-basics',
      'linux-net',
      'osi-tcpip',
      'switching',
      'ip-addressing',
      'network-services',
      'wireless',
      'ip-telephony',
      'network-security',
      'monitoring-diagnostics',
    ],
    supportingNodeIds: ['routing', 'net-automation'],
    bridgeSkills: [
      'Каталоги пользователей (AD / FreeIPA), виртуализация и резервное копирование',
      'Управление рабочими станциями и инвентаризация активов',
    ],
    forkY: 492,
    accentHexLight: '#334155',
    accentHexDark: '#94a3b8',
  },
  {
    id: 'ot-engineer',
    code: 'ROLE-OT',
    title: 'Инженер промышленных сетей / OT',
    shortTitle: 'Пром. сети / OT',
    evolutionKind: 'deepening',
    evolutionLabel: 'Индустриальная ветка',
    tagline: 'Заводы, энергетика, детерминированные кольца и защита АСУ ТП',
    description:
      'Специализированное развитие сетевого инженера: физика оптики и PoE, отказоустойчивые кольца MRP/HSR, синхронизация PTP и строгая кибербезопасность OT.',
    criticalNodeIds: [
      'net-basics',
      'cables-optics-poe',
      'osi-tcpip',
      'switching',
      'ip-addressing',
      'routing',
      'industrial-networks',
      'network-security',
      'monitoring-diagnostics',
    ],
    supportingNodeIds: ['wireless'],
    bridgeSkills: [
      'Модель Пердью, стандарт IEC 62443 и аудит промышленных протоколов',
      'ПНР на объектах, ЭМС-требования и резервирование ПЛК',
    ],
    forkY: 560,
    accentHexLight: '#c2410c',
    accentHexDark: '#fb923c',
  },
];

/* -------------------------------------------------------------------------- */
/* MASTERY & ROLE TRANSITION HELPERS                                          */
/* -------------------------------------------------------------------------- */
export function resolveNodeMastery(
  node: AcademyNode,
  profile: 'newcomer' | 'active',
  ipCompletedModulesCount: number,
  ipHasPracticeDone: boolean,
  ipExamPassed: boolean
): MasteryStatus {
  if (node.id === 'ip-addressing') {
    if (ipExamPassed) return 'verified';
    if (ipHasPracticeDone) return 'practiced';
    if (ipCompletedModulesCount > 0) return 'studied';
    return 'unstarted';
  }
  if (profile === 'newcomer') return 'unstarted';
  return node.activeMastery;
}

export function masteryToPercent(status: MasteryStatus): number {
  switch (status) {
    case 'verified':
      return 100;
    case 'practiced':
      return 70;
    case 'studied':
      return 35;
    default:
      return 0;
  }
}

export function masteryLabel(status: MasteryStatus): string {
  switch (status) {
    case 'verified':
      return 'Подтверждено';
    case 'practiced':
      return 'Практика';
    case 'studied':
      return 'Только теория';
    default:
      return 'Не начато';
  }
}

export function getRolesUsingNode(nodeId: string): CareerRolePath[] {
  return CAREER_ROLES.filter((role) => role.criticalNodeIds.includes(nodeId));
}

export interface RoleReadinessSummary {
  role: CareerRolePath;
  totalCritical: number;
  verifiedCount: number;
  practicedCount: number;
  studiedCount: number;
  unstartedCount: number;
  /** Verified-only readiness % (strict — never inflated by theory reading alone) */
  verifiedPercent: number;
  /** Including practiced + studied exposure % */
  exposurePercent: number;
  nextRecommendedNode: AcademyNode | null;
}

export function computeRoleReadiness(
  role: CareerRolePath,
  masteryByNodeId: Record<string, MasteryStatus>
): RoleReadinessSummary {
  let verifiedCount = 0;
  let practicedCount = 0;
  let studiedCount = 0;
  let unstartedCount = 0;

  const criticalNodes = role.criticalNodeIds
    .map((id) => ACADEMY_NODES.find((n) => n.id === id))
    .filter((n): n is AcademyNode => Boolean(n));

  for (const node of criticalNodes) {
    const status = masteryByNodeId[node.id] ?? 'unstarted';
    if (status === 'verified') verifiedCount++;
    else if (status === 'practiced') practicedCount++;
    else if (status === 'studied') studiedCount++;
    else unstartedCount++;
  }

  const totalCritical = criticalNodes.length;
  const verifiedPercent = totalCritical > 0 ? Math.round((verifiedCount / totalCritical) * 100) : 0;
  const exposurePercent =
    totalCritical > 0
      ? Math.round(((verifiedCount + practicedCount * 0.65 + studiedCount * 0.25) / totalCritical) * 100)
      : 0;

  // Next recommended critical node: prefer studied/practiced (closest to confirmation), then first unstarted whose prerequisites are mostly done
  const inProgress = criticalNodes.find((n) => {
    const st = masteryByNodeId[n.id];
    return st === 'practiced' || st === 'studied';
  });
  const firstUnstarted = criticalNodes.find((n) => (masteryByNodeId[n.id] ?? 'unstarted') === 'unstarted');
  const nextRecommendedNode = inProgress ?? firstUnstarted ?? null;

  return {
    role,
    totalCritical,
    verifiedCount,
    practicedCount,
    studiedCount,
    unstartedCount,
    verifiedPercent,
    exposurePercent,
    nextRecommendedNode,
  };
}

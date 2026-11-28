import type {
  CourseItem,
  CourseModule,
  CourseStageId,
  ExamQuestion,
  ExternalResource,
  ExternalResourceId,
  LearnerProfile,
  TopicResult,
} from '../types';

export const COURSE_STAGES: { id: CourseStageId; title: string; subtitle: string }[] = [
  {
    id: 'foundation',
    title: 'Фундамент и физика передачи',
    subtitle: 'Как сигнал становится кадром и доходит до соседа',
  },
  {
    id: 'core',
    title: 'Коммутация, адресация и маршруты',
    subtitle: 'Как сеть делится на сегменты и находит путь между ними',
  },
  {
    id: 'services',
    title: 'Транспорт, сервисы и Wi‑Fi',
    subtitle: 'Надёжная доставка, имена, выдача адресов и беспроводной доступ',
  },
  {
    id: 'operations',
    title: 'Безопасность, диагностика и промышленные сети',
    subtitle: 'Защита периметра, поиск неисправностей и отказоустойчивость',
  },
];

export const COURSES_CATALOG: CourseItem[] = [
  {
    id: 'net-basics',
    order: 1,
    code: 'NET-01',
    stage: 'foundation',
    stageLabel: 'Фундамент',
    title: 'Основы компьютерных сетей',
    shortTitle: 'Основы сетей',
    summary: 'Узлы, среды передачи, локальные и распределённые сети, базовая логика обмена данными.',
    difficulty: 'Базовый',
    durationLabel: '1,5 ч',
    modulesCount: 5,
    lessonsCount: 4,
    trainersCount: 1,
    prerequisites: [],
    outcomes: [
      'Отличать локальный обмен от маршрутизируемого',
      'Понимать роли клиента, сервера, коммутатора и шлюза',
      'Читать базовую схему офисной сети',
    ],
    activeProgress: 100,
    mapPos: { x: 105, y: 120 },
  },
  {
    id: 'cables-optics-poe',
    order: 2,
    code: 'NET-02',
    stage: 'foundation',
    stageLabel: 'Фундамент',
    title: 'Кабели, оптика и PoE',
    shortTitle: 'Кабели и оптика',
    summary: 'Витая пара, одномодовое и многомодовое волокно, бюджет оптики и питание устройств по Ethernet.',
    difficulty: 'Базовый',
    durationLabel: '2 ч',
    modulesCount: 6,
    lessonsCount: 5,
    trainersCount: 1,
    prerequisites: ['net-basics'],
    outcomes: [
      'Выбирать категорию меди и тип оптического трансивера под задачу',
      'Интерпретировать затухание и типовые дефекты разъёмов',
      'Рассчитывать бюджет мощности PoE (802.3af/at/bt)',
    ],
    activeProgress: 100,
    mapPos: { x: 105, y: 265 },
  },
  {
    id: 'osi-tcpip',
    order: 3,
    code: 'NET-03',
    stage: 'foundation',
    stageLabel: 'Фундамент',
    title: 'Модели OSI и TCP/IP',
    shortTitle: 'OSI и TCP/IP',
    summary: 'Инкапсуляция, заголовки L2–L4, границы ответственности уровней и путь пакета от браузера до кабеля.',
    difficulty: 'Базовый',
    durationLabel: '2 ч',
    modulesCount: 5,
    lessonsCount: 4,
    trainersCount: 2,
    prerequisites: ['net-basics'],
    outcomes: [
      'Сопоставлять протоколы и заголовки с уровнями OSI и TCP/IP',
      'Прослеживать смену MAC и неизменность IP по пути пакета',
      'Сужать область поиска неисправности по слоям модели',
    ],
    activeProgress: 100,
    mapPos: { x: 285, y: 190 },
  },
  {
    id: 'switching',
    order: 4,
    code: 'NET-04',
    stage: 'core',
    stageLabel: 'Ядро сети',
    title: 'Коммутация',
    shortTitle: 'Коммутация',
    summary: 'Таблица MAC, VLAN и 802.1Q trunk, защита от петель STP/RSTP и агрегация каналов LACP.',
    difficulty: 'Углублённый',
    durationLabel: '3 ч',
    modulesCount: 7,
    lessonsCount: 5,
    trainersCount: 3,
    prerequisites: ['osi-tcpip', 'cables-optics-poe'],
    outcomes: [
      'Проектировать access- и trunk-порты с корректным native VLAN',
      'Выбирать корневой мост и предсказывать заблокированный порт в RSTP',
      'Диагностировать широковещательные петли и MAC-flapping',
    ],
    activeProgress: 100,
    mapPos: { x: 460, y: 105 },
  },
  {
    id: 'ip-addressing',
    order: 5,
    code: 'NET-05',
    stage: 'core',
    stageLabel: 'Ядро сети',
    title: 'IP-адресация',
    shortTitle: 'IP-адресация',
    summary: 'Маски и префиксы CIDR, частные диапазоны RFC 1918, деление на подсети и адресация IPv6 со SLAAC.',
    difficulty: 'Углублённый',
    durationLabel: '2,5 ч',
    modulesCount: 6,
    lessonsCount: 4,
    trainersCount: 3,
    prerequisites: ['osi-tcpip'],
    outcomes: [
      'Мгновенно определять сеть, broadcast и число хостов для масок /24–/30',
      'Различать частные, служебные, link-local и публичные адреса IPv4/IPv6',
      'Проектировать адресный план без пересечений подсетей',
      'Объяснять автонастройку IPv6 (SLAAC) и работу Neighbor Discovery',
    ],
    featured: true,
    activeProgress: 60,
    mapPos: { x: 460, y: 270 },
  },
  {
    id: 'routing',
    order: 6,
    code: 'NET-06',
    stage: 'core',
    stageLabel: 'Ядро сети',
    title: 'Маршрутизация',
    shortTitle: 'Маршрутизация',
    summary: 'Правило самого длинного префикса (LPM), статические маршруты, OSPF, BGP и отказоустойчивость шлюза VRRP.',
    difficulty: 'Углублённый',
    durationLabel: '3,5 ч',
    modulesCount: 7,
    lessonsCount: 5,
    trainersCount: 2,
    prerequisites: ['ip-addressing', 'switching'],
    outcomes: [
      'Читать таблицу маршрутизации и прогнозировать выбор next-hop по LPM',
      'Настраивать шлюз по умолчанию и проверять обратный маршрут',
      'Понимать соседство OSPF и основы анонсирования префиксов в BGP',
    ],
    activeProgress: 0,
    mapPos: { x: 645, y: 190 },
  },
  {
    id: 'transport',
    order: 7,
    code: 'NET-07',
    stage: 'services',
    stageLabel: 'Транспорт и сервисы',
    title: 'Транспортные протоколы',
    shortTitle: 'Транспорт (TCP/UDP)',
    summary: 'Рукопожатие TCP, скользящее окно, повторы при потерях, PMTUD и сценарии применения UDP.',
    difficulty: 'Углублённый',
    durationLabel: '2,5 ч',
    modulesCount: 6,
    lessonsCount: 4,
    trainersCount: 2,
    prerequisites: ['ip-addressing'],
    outcomes: [
      'Отличать потерю пакетов от ограничения окна приёма в TCP',
      'Интерпретировать флаги SYN, ACK, FIN и RST при разборе дампа',
      'Понимать, когда UDP предпочтительнее TCP (голос, DNS, телеметрия)',
    ],
    activeProgress: 0,
    mapPos: { x: 645, y: 345 },
  },
  {
    id: 'network-services',
    order: 8,
    code: 'NET-08',
    stage: 'services',
    stageLabel: 'Транспорт и сервисы',
    title: 'Сетевые сервисы',
    shortTitle: 'Сетевые сервисы',
    summary: 'DHCP DORA и Relay, иерархия и кэширование DNS, NAT/PAT, синхронизация времени NTP и TLS/SNI.',
    difficulty: 'Углублённый',
    durationLabel: '3 ч',
    modulesCount: 6,
    lessonsCount: 5,
    trainersCount: 2,
    prerequisites: ['routing', 'transport'],
    outcomes: [
      'Находить сбой на конкретном шаге обмена DHCP или DNS-резолвинга',
      'Прослеживать трансляции адресов и портов в PAT',
      'Связывать сбой TLS/SNI с заголовками и сертификатами',
    ],
    activeProgress: 0,
    mapPos: { x: 825, y: 265 },
  },
  {
    id: 'wireless',
    order: 9,
    code: 'NET-09',
    stage: 'services',
    stageLabel: 'Транспорт и сервисы',
    title: 'Беспроводные сети',
    shortTitle: 'Wi‑Fi и роуминг',
    summary: 'Стандарты 802.11ax/be, частотный план 2,4/5/6 ГГц, DFS, роуминг 802.11r/k/v и WPA3-Enterprise.',
    difficulty: 'Прикладной',
    durationLabel: '2,5 ч',
    modulesCount: 5,
    lessonsCount: 4,
    trainersCount: 1,
    prerequisites: ['switching', 'network-services'],
    outcomes: [
      'Составлять частотный план без взаимных помех соседних точек доступа',
      'Диагностировать обрывы при роуминге и низкий SNR',
      'Различать WPA3-Personal и 802.1X/RADIUS Enterprise',
    ],
    activeProgress: 0,
    mapPos: { x: 825, y: 115 },
  },
  {
    id: 'security',
    order: 10,
    code: 'NET-10',
    stage: 'operations',
    stageLabel: 'Эксплуатация',
    title: 'Сетевая безопасность',
    shortTitle: 'Безопасность',
    summary: 'Защита L2 (DHCP Snooping, DAI, 802.1X), ACL, stateful firewall, uRPF и контроль плоскости управления.',
    difficulty: 'Прикладной',
    durationLabel: '3 ч',
    modulesCount: 6,
    lessonsCount: 5,
    trainersCount: 1,
    prerequisites: ['switching', 'routing'],
    outcomes: [
      'Блокировать подмену шлюза и ARP-спуфинг средствами коммутатора доступа',
      'Проверять порядок правил ACL и влияние stateful-сессий',
      'Защищать CPU сетевых устройств через CoPP и Storm Control',
    ],
    activeProgress: 0,
    mapPos: { x: 645, y: 65 },
  },
  {
    id: 'monitoring-diagnostics',
    order: 11,
    code: 'NET-11',
    stage: 'operations',
    stageLabel: 'Эксплуатация',
    title: 'Мониторинг и диагностика',
    shortTitle: 'Мониторинг и траблшутинг',
    summary: 'Методика поиска неисправностей, SNMPv3, Syslog, Zabbix, чтение счётчиков и корреляция событий.',
    difficulty: 'Прикладной',
    durationLabel: '3 ч',
    modulesCount: 6,
    lessonsCount: 5,
    trainersCount: 2,
    prerequisites: ['routing', 'network-services'],
    outcomes: [
      'Локализовать инцидент за 3–4 проверки вместо хаотичного перебора',
      'Отличать проблему мониторинга от реального отказа канала',
      'Сопоставлять Syslog, SNMP-счётчики и состояние портов',
    ],
    activeProgress: 0,
    mapPos: { x: 825, y: 400 },
  },
  {
    id: 'industrial-networks',
    order: 12,
    code: 'NET-12',
    stage: 'operations',
    stageLabel: 'Эксплуатация',
    title: 'Промышленные сети',
    shortTitle: 'Промышленные сети',
    summary: 'Кольцевое резервирование MRP и HSR, точная синхронизация времени PTP (IEEE 1588) и Modbus TCP.',
    difficulty: 'Прикладной',
    durationLabel: '2 ч',
    modulesCount: 5,
    lessonsCount: 4,
    trainersCount: 1,
    prerequisites: ['switching', 'cables-optics-poe'],
    outcomes: [
      'Сравнивать время восстановления RSTP, MRP и бесшовного HSR',
      'Понимать требования PTP к аппаратным меткам времени',
      'Сегментировать промышленный трафик от корпоративной сети',
    ],
    activeProgress: 0,
    mapPos: { x: 285, y: 375 },
  },
];

export const IP_ADDRESSING_MODULES: CourseModule[] = [
  {
    id: 'mod-mask-prefix',
    index: 1,
    title: 'Маска и префикс',
    shortTitle: 'Маска и префикс',
    kind: 'theory',
    durationLabel: '20 мин',
    lead: 'Как одно число после слэша отделяет общую часть сети от адреса конкретного устройства.',
    keyIdea:
      'Маска подсети — это не «второй IP-адрес», а двоичный трафарет из единиц слева и нулей справа. Единицы фиксируют префикс сети, нули задают пространство для узлов.',
    paragraphs: [
      'Когда хост отправляет пакет, его сетевой стек первым делом сравнивает свой IP и IP получателя через собственную маску. Если сетевые части совпадают — адресат находится в том же L2-сегменте, и можно искать его MAC через ARP. Если отличаются — пакет сразу уходит на шлюз по умолчанию.',
      'Префиксная запись CIDR (например, /24 или /26) показывает ровно количество ведущих единиц в маске. Каждое увеличение префикса на один бит делит прежнюю сеть ровно пополам — и ровно вдвое сокращает размер адресного блока.',
    ],
    practicalRule:
      'Для масок от /24 до /30 держите в голове «шаг блока» в последнем октете: 256 − последний октет маски. Для /26 (255.255.255.192) шаг равен 64: подсети начинаются на .0, .64, .128 и .192.',
    marginNotes: [
      {
        label: 'Почему маска непрерывна',
        text: 'В стандарте CIDR единицы всегда идут подряд слева. Смешанная маска вроде 255.255.0.255 недопустима в маршрутизации IPv4.',
      },
      {
        label: 'Точка самопроверки',
        text: 'Если два хоста в одном VLAN не видят друг друга без маршрутизатора, первым делом сверьте совпадение их масок.',
      },
    ],
    resources: [
      {
        resourceId: 'lesson-masks',
        kind: 'lesson',
        title: 'Урок «Маски подсети и CIDR»',
        subtitle: 'Самостоятельный урок из базы знаний NetOps · Plain / Pro',
        duration: '12 мин',
      },
      {
        resourceId: 'trainer-ipv4',
        kind: 'trainer',
        title: 'Тренажёр IPv4 · Режим масок',
        subtitle: 'Отработка перевода /24–/30 в десятичную маску',
        duration: 'Практика',
      },
    ],
    visualizerMode: 'ipv4-mask',
  },
  {
    id: 'mod-private-special',
    index: 2,
    title: 'Частные и специальные IPv4-адреса',
    shortTitle: 'Частные и спец. IPv4',
    kind: 'theory',
    durationLabel: '20 мин',
    lead: 'Какие диапазоны живут только внутри локальных сетей и о чём сразу говорит адрес 169.254.x.x.',
    keyIdea:
      'Часть адресного пространства IPv4 намеренно выведена из глобальной маршрутизации Интернета, чтобы компании могли свободно строить внутренние сети и диагностировать сбои.',
    paragraphs: [
      'Три блока RFC 1918 — 10.0.0.0/8, 172.16.0.0/12 и 192.168.0.0/16 — используют внутри офисов, ЦОД и домашних сетей. Для выхода в Интернет маршрутизатор на границе переводит их в публичный адрес через NAT/PAT.',
      'Служебные диапазоны дают мгновенную подсказку при траблшутинге: 127.0.0.0/8 проверяет локальный стек без выхода в кабель, 169.254.0.0/16 (APIPA) означает, что клиент не получил ответ от DHCP-сервера, а 100.64.0.0/10 указывает на операторский CGNAT.',
    ],
    practicalRule:
      'Увидев на рабочей станции адрес 169.254.x.x, не проверяйте маршруты в Интернет — проверьте VLAN на порту, доступность DHCP-сервера и наличие DHCP Relay.',
    marginNotes: [
      {
        label: 'Граница 172.16.0.0/12',
        text: 'Частая ошибка — считать частным весь 172.x.x.x. На самом деле частный диапазон заканчивается на 172.31.255.255; адрес 172.32.0.1 уже публичный.',
      },
      {
        label: 'Операторский CGNAT',
        text: 'Диапазон 100.64.0.0/10 (RFC 6598) не пересекается с RFC 1918, чтобы провайдер и клиент не конфликтовали адресами.',
      },
    ],
    resources: [
      {
        resourceId: 'lesson-private-ipv4',
        kind: 'lesson',
        title: 'Урок «Частные и специальные адреса IPv4»',
        subtitle: 'Самостоятельный урок из базы знаний NetOps · RFC 1918 / 3927 / 6598',
        duration: '10 мин',
      },
      {
        resourceId: 'trainer-packet',
        kind: 'trainer',
        title: 'Симулятор «Путь пакета»',
        subtitle: 'Посмотрите, как частный адрес проходит через шлюз',
        duration: 'Стенд',
      },
    ],
    visualizerMode: 'ipv4-ranges',
  },
  {
    id: 'mod-subnets-hosts',
    index: 3,
    title: 'Подсети и расчёт количества хостов',
    shortTitle: 'Подсети и хосты',
    kind: 'theory',
    durationLabel: '30 мин',
    lead: 'Как быстро определить адрес сети, широковещательный адрес и выбрать компактную маску под число устройств.',
    keyIdea:
      'В обычной подсети IPv4 два адреса всегда зарезервированы: самый первый обозначает саму сеть, самый последний — широковещательную рассылку. Полезных адресов для узлов остаётся 2ⁿ − 2.',
    paragraphs: [
      'При проектировании сети инженеру редко нужно делить адрес на равные части — обычно требуется выделить подсеть под конкретное число хостов (например, 25 рабочих мест + шлюз = 26 адресов). Подбираем ближайшую степень двойки с запасом: 2⁵ − 2 = 30 полезных адресов, значит нужно 5 бит под хост и префикс 32 − 5 = /27.',
      'Исключение из правила «минус 2» — линки точка-точка /31 (RFC 3021), где оба адреса используются для интерфейсов двух маршрутизаторов, и маршруты на один узел /32 (loopback).',
    ],
    practicalRule:
      'Всегда проверяйте, не попал ли адрес хоста на границу блока: у /26 адреса .63 (broadcast первой подсети) и .64 (адрес второй сети) нельзя назначать на порт компьютера.',
    marginNotes: [
      {
        label: 'Быстрая таблица /24–/30',
        text: '/24 → 254 · /25 → 126 · /26 → 62 · /27 → 30 · /28 → 14 · /29 → 6 · /30 → 2 хоста.',
      },
      {
        label: 'Шлюз тоже занимает адрес',
        text: 'Если в отделе 14 ПК и нужен 1 шлюз, маска /28 (14 полезных адресов) уже мала — берите /27.',
      },
    ],
    resources: [
      {
        resourceId: 'lesson-subnets',
        kind: 'lesson',
        title: 'Урок «Деление на подсети и расчёт границ»',
        subtitle: 'Самостоятельный урок из базы знаний NetOps · Пошаговый алгоритм',
        duration: '15 мин',
      },
      {
        resourceId: 'trainer-ipv4',
        kind: 'trainer',
        title: 'Тренажёр IPv4 · Расчёт подсетей',
        subtitle: 'Самостоятельный интерактивный калькулятор и задачи',
        duration: 'Практика',
      },
    ],
    visualizerMode: 'ipv4-subnet',
  },
  {
    id: 'mod-ipv6-slaac',
    index: 4,
    title: 'IPv6, SLAAC и локальный сегмент',
    shortTitle: 'IPv6 и SLAAC',
    kind: 'theory',
    durationLabel: '25 мин',
    lead: 'Как интерфейс получает адрес без DHCP, зачем нужен fe80::/10 и почему в IPv6 нет broadcast.',
    keyIdea:
      'В IPv6 стандартная подсеть всегда имеет префикс /64, каждый интерфейс обязан иметь локальный адрес fe80::/10, а маршрутизатор сам объявляет сетевой префикс через Router Advertisement (SLAAC).',
    paragraphs: [
      '128-битный адрес IPv6 записывают восемью группами по 4 шестнадцатеричных символа. Ведущие нули внутри группы опускают, а самую длинную серию нулевых групп заменяют на двойное двоеточие :: — но строго один раз на адрес.',
      'Вместо широковещательного ARP в IPv6 работает Neighbor Discovery (ICMPv6) с адресной групповой рассылкой (solicited-node multicast). Получив Router Advertisement с префиксом /64 и флагом A, хост формирует свой глобальный адрес самостоятельно без центрального DHCPv6-сервера.',
    ],
    practicalRule:
      'Если у интерфейса есть только адрес fe80::…, связь в локальном VLAN возможна, но в Интернет пакеты не пойдут: проверьте, приходят ли от маршрутизатора пакеты Router Advertisement (RA).',
    marginNotes: [
      {
        label: 'Link-local обязателен',
        text: 'Маршрутизаторы IPv6 почти всегда используют именно fe80::… соседа в качестве next-hop, даже если на интерфейсах есть глобальные адреса.',
      },
      {
        label: 'Сокращение ::',
        text: 'Запись 2001:db8::1::5 некорректна: компилятор не сможет однозначно восстановить число пропущенных нулей в двух местах.',
      },
    ],
    resources: [
      {
        resourceId: 'lesson-ipv6',
        kind: 'lesson',
        title: 'Урок «IPv6: структура, сокращение и SLAAC»',
        subtitle: 'Самостоятельный урок из базы знаний NetOps · RFC 4291 / 4862',
        duration: '15 мин',
      },
      {
        resourceId: 'trainer-ipv6',
        kind: 'trainer',
        title: 'Тренажёр IPv6',
        subtitle: 'Определение типов адресов (GUA, ULA, Link-Local) и сокращение',
        duration: 'Практика',
      },
    ],
    visualizerMode: 'ipv6-slaac',
  },
  {
    id: 'mod-practice-hub',
    index: 5,
    title: 'Практические тренажёры',
    shortTitle: 'Практические тренажёры',
    kind: 'practice',
    durationLabel: '30 мин',
    lead: 'Закрепите расчёт масок, определение типов IPv6 и логику локальной доставки на самостоятельных стендах NetOps.',
    keyIdea:
      'Тренажёры не дублируются внутри курса — вы открываете действующие стенды NetOps, решаете серию практических задач и в один клик возвращаетесь прямо на этот шаг.',
    paragraphs: [
      'Перед итоговым тестированием рекомендуем выполнить три коротких практических подхода. Каждый стенд открывается с закреплённой закладкой возврата, поэтому вы не потеряете место в курсе.',
    ],
    practicalRule:
      'Цель практики перед экзаменом — уверенно находить сеть, broadcast и число хостов для /25–/30 без калькулятора за 15–20 секунд.',
    marginNotes: [
      {
        label: 'Почему стенды вынесены',
        text: 'Тренажёры NetOps обновляются и доступны отдельно в любое время. Курс лишь задаёт порядок упражнений и помнит, куда вас вернуть.',
      },
    ],
    resources: [
      {
        resourceId: 'trainer-ipv4',
        kind: 'trainer',
        title: 'Тренажёр IPv4 · Подсети и CIDR',
        subtitle: 'Задача: решить 5 примеров на определение адреса сети и broadcast (/25–/29)',
        duration: '10 мин',
      },
      {
        resourceId: 'trainer-ipv6',
        kind: 'trainer',
        title: 'Тренажёр IPv6 · Типы адресов и SLAAC',
        subtitle: 'Задача: безошибочно отличить Link-Local, ULA, Multicast и GUA',
        duration: '10 мин',
      },
      {
        resourceId: 'trainer-packet',
        kind: 'trainer',
        title: 'Симулятор «Путь пакета»',
        subtitle: 'Задача: проследить выбор «локальный сегмент vs шлюз по умолчанию»',
        duration: '10 мин',
      },
    ],
  },
  {
    id: 'mod-final-exam',
    index: 6,
    title: 'Итоговое тестирование',
    shortTitle: 'Итоговое тестирование',
    kind: 'exam',
    durationLabel: '20 вопросов · ≥80%',
    lead: 'Проверка уверенного владения IP-адресацией без таймера и без ограничения попыток.',
    keyIdea:
      'Итоговый тест состоит из 20 вопросов по всем четырём темам курса. Проходной балл — 80% (16 из 20). При ошибке платформа покажет, какой именно раздел стоит повторить.',
    paragraphs: [
      'Вы можете сдавать итоговый тест в спокойном темпе: таймер отключён, количество попыток не ограничено. После успешной сдачи курс отмечается завершённым, а следующим рекомендуемым шагом открывается «Маршрутизация».',
    ],
    practicalRule:
      'Не угадывайте префиксы на глаз — используйте правило шага блока и проверяйте крайние адреса подсети перед выбором ответа.',
    marginNotes: [
      {
        label: 'Формат зачёта',
        text: 'Минимум 20 вопросов · Проходной балл 80% · Без таймера · Без лимита попыток.',
      },
    ],
    resources: [],
  },
];

export const EXTERNAL_RESOURCES: Record<ExternalResourceId, ExternalResource> = {
  'lesson-masks': {
    id: 'lesson-masks',
    kind: 'lesson',
    sectionName: 'База знаний · Урок',
    title: 'Маски подсети и префиксная запись CIDR',
    subtitle: 'Самостоятельный ресурс раздела «Теория» · Режимы «Просто» и «Инженерно»',
    summary:
      'Подробный разбор двоичного представления маски IPv4, операции побитового И (AND) при определении принадлежности к локальной подсети и таблицы соответствия /24–/32.',
    highlights: [
      'Двоичная граница между Network ID и Host ID',
      'Почему /24 соответствует 255.255.255.0, а /26 — 255.255.255.192',
      'Что происходит, если на двух соседних узлах указаны разные маски',
    ],
    interactivePrompt: 'Проверьте понимание прямо в самостоятельном уроке:',
    quickCheck: {
      prompt: 'Какой десятичной маске соответствует префикс /27?',
      options: ['255.255.255.192', '255.255.255.224', '255.255.255.240'],
      correctIndex: 1,
      explanation: '27 единиц = 24 бита в первых трёх октетах и 3 старших бита в четвёртом: 128 + 64 + 32 = 224.',
    },
  },
  'lesson-private-ipv4': {
    id: 'lesson-private-ipv4',
    kind: 'lesson',
    sectionName: 'База знаний · Урок',
    title: 'Частные и специальные диапазоны IPv4',
    subtitle: 'Самостоятельный ресурс раздела «Теория» · RFC 1918, RFC 3927, RFC 6598',
    summary:
      'Систематизация непубличных блоков адресов IPv4 и диагностика типичных инцидентов: появление APIPA, ошибки перекрытия RFC 1918 в VPN и провайдерский CGNAT.',
    highlights: [
      'RFC 1918: 10.0.0.0/8, 172.16.0.0/12 (до 172.31.255.255), 192.168.0.0/16',
      'APIPA 169.254.0.0/16 — признак отсутствия ответа от DHCP',
      'Loopback 127.0.0.0/8 и CGNAT 100.64.0.0/10',
    ],
    interactivePrompt: 'Быстрая проверка из урока:',
    quickCheck: {
      prompt: 'Какой из перечисленных адресов является публичным (не входит в RFC 1918)?',
      options: ['172.24.10.5', '172.32.10.5', '10.200.1.1'],
      correctIndex: 1,
      explanation: 'Частный блок 172.16.0.0/12 заканчивается адресом 172.31.255.255. Адрес 172.32.10.5 — публичный.',
    },
  },
  'lesson-subnets': {
    id: 'lesson-subnets',
    kind: 'lesson',
    sectionName: 'База знаний · Урок',
    title: 'Подсети, границы блоков и VLSM',
    subtitle: 'Самостоятельный ресурс раздела «Теория»',
    summary:
      'Пошаговая методика расчёта адреса сети, первого/последнего хоста и широковещательного адреса без перевода всех 32 бит в двоичный вид.',
    highlights: [
      'Шаг блока = 256 − значимый октет маски',
      'Полезные адреса = 2^(32 − prefix) − 2 (кроме /31 и /32)',
      'Планирование подсетей разного размера (VLSM) от крупных к мелким',
    ],
    interactivePrompt: 'Контрольная задача урока:',
    quickCheck: {
      prompt: 'Какой broadcast-адрес у подсети 192.168.10.64/26?',
      options: ['192.168.10.127', '192.168.10.128', '192.168.10.191'],
      correctIndex: 0,
      explanation: 'Шаг /26 равен 64. Следующая подсеть начинается на .128, значит broadcast текущей — .127.',
    },
  },
  'lesson-ipv6': {
    id: 'lesson-ipv6',
    kind: 'lesson',
    sectionName: 'База знаний · Урок',
    title: 'IPv6, типы адресов и автонастройка SLAAC',
    subtitle: 'Самостоятельный ресурс раздела «Теория» · RFC 4291 / 4861 / 4862',
    summary:
      'Как устроены 128-битные адреса IPv6, правила сокращения записи, обязательность link-local fe80::/10 и обмен Router Solicitation / Router Advertisement.',
    highlights: [
      'Link-Local (fe80::/10), ULA (fc00::/7), Global Unicast (2000::/3), Multicast (ff00::/8)',
      'Отсутствие broadcast и замена ARP на Neighbor Discovery (ICMPv6)',
      'SLAAC: префикс /64 из RA + 64-битный Interface ID',
    ],
    interactivePrompt: 'Проверьте правило сокращения IPv6:',
    quickCheck: {
      prompt: 'Как корректно сократить адрес 2001:0db8:0000:0000:0000:0000:0000:0042?',
      options: ['2001:db8::42', '2001:db8::0042', '2001:0db8::42'],
      correctIndex: 0,
      explanation: 'По канонической записи RFC 5952 ведущие нули в группах убирают (0db8 → db8, 0042 → 42), а серию нулевых групп заменяют на ::.',
    },
  },
  'trainer-ipv4': {
    id: 'trainer-ipv4',
    kind: 'trainer',
    sectionName: 'Интерактивный стенд NetOps',
    title: 'Тренажёр IPv4 · Калькулятор и задачи на подсети',
    subtitle: 'Самостоятельный тренажёр платформы NetOps (не дублируется в курсе)',
    summary:
      'Живая тренировка расчёта сети, маски, диапазона хостов и broadcast-адреса. После решения задачи вы можете вернуться в курс одной кнопкой сверху.',
    highlights: [
      'Режимы: Расчёт подсети · Поиск маски под число хостов · Проверка принадлежности к одной сети',
      'Пошаговый разбор каждой ошибки с двоичной раскладкой',
    ],
    interactivePrompt: 'Мини-задача стенда IPv4:',
    sampleCommands: ['Адрес узла: 10.20.30.77/28', 'Маска: 255.255.255.240 (шаг 16)'],
    quickCheck: {
      prompt: 'К какой подсети принадлежит узел 10.20.30.77/28?',
      options: ['10.20.30.64/28', '10.20.30.72/28', '10.20.30.80/28'],
      correctIndex: 0,
      explanation: 'При шаге 16 границы блоков: .0, .16, .32, .48, .64, .80. Число 77 лежит между 64 и 79, значит сеть — 10.20.30.64/28.',
    },
  },
  'trainer-ipv6': {
    id: 'trainer-ipv6',
    kind: 'trainer',
    sectionName: 'Интерактивный стенд NetOps',
    title: 'Тренажёр IPv6 · Классификатор адресов и SLAAC',
    subtitle: 'Самостоятельный тренажёр платформы NetOps',
    summary:
      'Отработка распознавания префиксов IPv6, сжатия/развёртывания адресов и анализа сценариев Router Advertisement.',
    highlights: [
      'Мгновенная классификация: GUA, Link-Local, ULA, Loopback (::1), Multicast',
      'Разбор ошибок двойного :: и некорректных префиксов SLAAC',
    ],
    interactivePrompt: 'Мини-задача стенда IPv6:',
    sampleCommands: ['Интерфейс eth0: fe80::1a2b:3cff:fe4d:5e6f/64'],
    quickCheck: {
      prompt: 'К какому типу относится адрес fe80::1a2b:3cff:fe4d:5e6f и маршрутизируется ли он за пределы сегмента?',
      options: [
        'Link-Local, действует только внутри одного L2-сегмента',
        'Unique Local (ULA), маршрутизируется внутри корпоративной сети',
        'Global Unicast, маршрутизируется в Интернете',
      ],
      correctIndex: 0,
      explanation: 'Префикс fe80::/10 — Link-Local. Маршрутизаторы никогда не пересылают пакеты с таким адресом в другую подсеть.',
    },
  },
  'trainer-packet': {
    id: 'trainer-packet',
    kind: 'trainer',
    sectionName: 'Интерактивный стенд NetOps',
    title: 'Симулятор «Путь пакета»',
    subtitle: 'Самостоятельный визуализатор L2/L3-пересылки',
    summary:
      'Пошаговая анимация решения хоста: сравнить адрес получателя через свою маску и выбрать прямую ARP-доставку либо отправку кадра на MAC шлюза по умолчанию.',
    highlights: [
      'Сценарий 1: оба узла в 192.168.10.0/24 — прямой обмен',
      'Сценарий 2: получатель в 10.0.50.0/24 — инкапсуляция на MAC шлюза',
    ],
    interactivePrompt: 'Проверка логики хоста на стенде:',
    sampleCommands: ['Хост A: 192.168.10.15/26 · Получатель B: 192.168.10.70/26'],
    quickCheck: {
      prompt: 'Куда хост A (192.168.10.15/26) отправит Ethernet-кадр для узла 192.168.10.70?',
      options: [
        'Напрямую на MAC-адрес узла B',
        'На MAC-адрес своего шлюза по умолчанию',
        'Широковещательно на ff:ff:ff:ff:ff:ff',
      ],
      correctIndex: 1,
      explanation: 'При маске /26 хост A в сети .0–.63, а узел B (.70) уже в соседней подсети .64–.127. Пакет идёт через шлюз.',
    },
  },
};

export const FINAL_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q1',
    topicId: 'masks',
    topicLabel: 'Маска и префикс',
    moduleId: 'mod-mask-prefix',
    text: 'Какая десятичная маска соответствует префиксу /26 и сколько адресов содержит один блок?',
    options: [
      '255.255.255.192 · блок из 64 адресов (62 полезных хоста)',
      '255.255.255.224 · блок из 32 адресов (30 полезных хостов)',
      '255.255.255.128 · блок из 128 адресов (126 полезных хостов)',
      '255.255.255.240 · блок из 16 адресов (14 полезных хостов)',
    ],
    correctIndex: 0,
    explanation: '/26 занимает 2 бита четвёртого октета (128 + 64 = 192). Размер блока 2⁶ = 64, полезных хостов 64 − 2 = 62.',
  },
  {
    id: 'q2',
    topicId: 'private',
    topicLabel: 'Частные и специальные адреса',
    moduleId: 'mod-private-special',
    text: 'Рабочая станция после подключения кабеля получила IPv4-адрес 169.254.48.19/16. О чём это говорит в первую очередь?',
    options: [
      'Адрес выдан провайдером через операторский CGNAT',
      'Клиент не получил ответ от DHCP-сервера и назначил link-local адрес (APIPA)',
      'Интерфейс работает в режиме локальной петли loopback',
      'Шлюз по умолчанию переключил порт в гостевой VLAN',
    ],
    correctIndex: 1,
    explanation: 'Диапазон 169.254.0.0/16 (RFC 3927, APIPA) назначается ОС автоматически, когда DHCP-запросы остались без ответа.',
  },
  {
    id: 'q3',
    topicId: 'subnets',
    topicLabel: 'Подсети и расчёт хостов',
    moduleId: 'mod-subnets-hosts',
    text: 'В новом сегменте нужно разместить 25 компьютеров и 1 интерфейс маршрутизатора (шлюз). Какую самую компактную маску IPv4 выбрать?',
    context: 'Требуется: 26 полезных адресов в одной подсети.',
    options: ['/28 (до 14 хостов)', '/27 (до 30 хостов)', '/26 (до 62 хостов)', '/29 (до 6 хостов)'],
    correctIndex: 1,
    explanation: '26 адресов не помещаются в /28 (14), но с запасом помещаются в /27 (2⁵ − 2 = 30 полезных адресов). /26 тратит лишние адреса.',
  },
  {
    id: 'q4',
    topicId: 'subnets',
    topicLabel: 'Подсети и расчёт хостов',
    moduleId: 'mod-subnets-hosts',
    text: 'Узел имеет адрес 192.168.50.135/27. Какой адрес является широковещательным (broadcast) для его подсети?',
    options: ['192.168.50.159', '192.168.50.160', '192.168.50.191', '192.168.50.255'],
    correctIndex: 0,
    explanation: 'Шаг /27 равен 32. Подсети: .0, .32, .64, .96, .128, .160. Адрес .135 входит в .128/27, чей последний (broadcast) адрес — .159.',
  },
  {
    id: 'q5',
    topicId: 'ipv6',
    topicLabel: 'IPv6 и SLAAC',
    moduleId: 'mod-ipv6-slaac',
    text: 'Как хост IPv6 получает префикс подсети и адрес шлюза по умолчанию при автонастройке SLAAC без DHCPv6?',
    options: [
      'Через широковещательный ARP-запрос на ff:ff:ff:ff:ff:ff',
      'Из сообщения ICMPv6 Router Advertisement (RA) от локального маршрутизатора',
      'Из DNS AAAA-записи корпоративного контроллера домена',
      'Только вручную — SLAAC назначает исключительно адрес fe80::/10',
    ],
    correctIndex: 1,
    explanation: 'При SLAAC маршрутизатор рассылает ICMPv6 Router Advertisement с префиксом /64 и своим link-local адресом в качестве шлюза.',
  },
];

export const EXAM_PRESET_PASSED: {
  percent: number;
  correct20: number;
  total20: number;
  passed: boolean;
  topics: TopicResult[];
} = {
  percent: 85,
  correct20: 17,
  total20: 20,
  passed: true,
  topics: [
    {
      topicId: 'masks',
      topicLabel: 'Маска и префикс',
      moduleId: 'mod-mask-prefix',
      correct: 5,
      total: 5,
      resourceId: 'lesson-masks',
      advice: 'Отлично: уверенный перевод между CIDR и десятичной маской.',
    },
    {
      topicId: 'private',
      topicLabel: 'Частные и специальные IPv4',
      moduleId: 'mod-private-special',
      correct: 4,
      total: 5,
      resourceId: 'lesson-private-ipv4',
      advice: 'Обратите внимание на верхнюю границу 172.16.0.0/12 (до 172.31.255.255).',
    },
    {
      topicId: 'subnets',
      topicLabel: 'Подсети и расчёт хостов',
      moduleId: 'mod-subnets-hosts',
      correct: 4,
      total: 5,
      resourceId: 'trainer-ipv4',
      advice: 'Решите ещё 3–4 примера на маски /27–/29 для полного автоматизма.',
    },
    {
      topicId: 'ipv6',
      topicLabel: 'IPv6 и SLAAC',
      moduleId: 'mod-ipv6-slaac',
      correct: 4,
      total: 5,
      resourceId: 'trainer-ipv6',
      advice: 'Хорошая база по fe80::/10 и Router Advertisement.',
    },
  ],
};

export const EXAM_PRESET_FAILED: {
  percent: number;
  correct20: number;
  total20: number;
  passed: boolean;
  topics: TopicResult[];
} = {
  percent: 65,
  correct20: 13,
  total20: 20,
  passed: false,
  topics: [
    {
      topicId: 'masks',
      topicLabel: 'Маска и префикс',
      moduleId: 'mod-mask-prefix',
      correct: 4,
      total: 5,
      resourceId: 'lesson-masks',
      advice: 'База освоена хорошо — достаточно быстро повторить шаг /28 и /29.',
    },
    {
      topicId: 'private',
      topicLabel: 'Частные и специальные IPv4',
      moduleId: 'mod-private-special',
      correct: 4,
      total: 5,
      resourceId: 'lesson-private-ipv4',
      advice: 'Уверенный результат по RFC 1918 и APIPA.',
    },
    {
      topicId: 'subnets',
      topicLabel: 'Подсети и расчёт хостов',
      moduleId: 'mod-subnets-hosts',
      correct: 3,
      total: 5,
      resourceId: 'trainer-ipv4',
      advice: 'Главная зона роста: ошибки на границе сети/broadcast. Повторите шаг 3 и тренажёр IPv4.',
    },
    {
      topicId: 'ipv6',
      topicLabel: 'IPv6 и SLAAC',
      moduleId: 'mod-ipv6-slaac',
      correct: 2,
      total: 5,
      resourceId: 'trainer-ipv6',
      advice: 'Повторите различие fe80::/10, ULA и роль Router Advertisement в шаге 4.',
    },
  ],
};

export function getCourseProgress(
  course: CourseItem,
  profile: LearnerProfile,
  ipCompletedModulesCount: number,
  ipExamPassed: boolean
): number {
  if (course.id === 'ip-addressing') {
    if (ipExamPassed) return 100;
    return Math.round((ipCompletedModulesCount / IP_ADDRESSING_MODULES.length) * 100);
  }
  if (profile === 'newcomer') return 0;
  return course.activeProgress;
}

export function getRecommendedCourseId(
  profile: LearnerProfile,
  ipExamPassed: boolean
): string {
  if (profile === 'newcomer') return 'net-basics';
  if (ipExamPassed) return 'routing';
  return 'ip-addressing';
}

export const COURSE_EDGES: Array<{ from: string; to: string }> = COURSES_CATALOG.flatMap((course) =>
  course.prerequisites.map((pre) => ({ from: pre, to: course.id }))
);

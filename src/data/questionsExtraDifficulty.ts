import { Question } from '../types/quiz';

/**
 * Difficulty-focused pack: mostly advanced + hard applied.
 * Appended to ALL_QUESTIONS; never removes base bank items.
 */
export const EXTRA_DIFFICULTY_QUESTIONS: Question[] = [
  // ─── L1–L2 advanced / hard applied ─────────────────────────
  {
    id: 'l12-d01',
    group: 'l1-l2',
    topic: 'L2 · STP',
    text: 'После включения RSTP один access-порт долго не пропускает трафик при подключении ПК. Что проверить в первую очередь?',
    answers: [
      'PortFast / edge port и наличие BPDUguard политики',
      'Только OSPF hello timer',
      'Только размер TCP window на ПК',
      'Только MX-запись домена',
    ],
    correct: [0],
    explanation:
      'В RSTP порт без edge-конфигурации проходит negotiation/learning before forwarding (роли Root/Designated/Alternate и состояния Discarding/Learning/Forwarding). Для портов к эндпоинтам включают edge/PortFast, чтобы сразу форвардить; BPDUguard защищает от случайного свитча на access.',
    difficulty: 'advanced',
  },
  {
    id: 'l12-d02',
    group: 'l1-l2',
    topic: 'L2 · VLAN',
    text: 'Trunk разрешает VLAN 10,20. Access-порт в VLAN 30. ПК на access не видит сервер в VLAN 10 на соседнем коммутаторе. Почему?',
    answers: [
      'Разные VLAN — нужен L3 (SVI/router), одного trunk недостаточно для inter-VLAN на access',
      'Trunk всегда тегирует access-порты автоматически в VLAN 10',
      'STP запрещает любые access-порты',
      'Нужен только одинаковый native VLAN без маршрутизации',
    ],
    correct: [0],
    explanation: 'Связь между VLAN — маршрутизация, не «магия» trunk.',
    difficulty: 'advanced',
  },
  {
    id: 'l12-d03',
    group: 'l1-l2',
    topic: 'L2 · Native VLAN',
    text: 'На двух концах trunk native VLAN различается (10 vs 20). Какой риск?',
    answers: [
      'Утечка/смешение untagged-трафика и трудноуловимые L2-проблемы',
      'Автоматическое выключение всех SFP',
      'Обязательный отказ DHCP во всей AS',
      'Блокировка только IPv6 RA',
    ],
    correct: [0],
    explanation: 'Native VLAN mismatch — классическая ошибка проектирования транков.',
    difficulty: 'advanced',
  },
  {
    id: 'l12-d04',
    group: 'l1-l2',
    topic: 'L1 · Оптика',
    text: 'Rx на SFP −28 dBm при чувствительности модуля −18 dBm. Линк нестабилен. Что верно?',
    answers: [
      'Мощность на приёмнике слишком низкая — потери линии/стыков или дальность/тип волокна',
      'Это перегрузка приёмника (too hot)',
      'Нужно только увеличить TCP MSS',
      'Проблема только в DNS TTL',
    ],
    correct: [0],
    explanation: 'Слишком слабый Rx — бюджет потерь; overloading бывает при слишком высоком Rx.',
    difficulty: 'advanced',
  },
  {
    id: 'l12-d05',
    group: 'l1-l2',
    topic: 'L2 · Storm',
    text: 'Broadcast storm в L2-кольце без STP. Какие утверждения верны? Выберите все подходящие.',
    answers: [
      'Кадры могут размножаться и перегружать каналы',
      'TTL IP гарантированно остановит Ethernet broadcast',
      'Коммутаторы без защиты зациклят unknown/broadcast',
      'Поможет только смена DNS-сервера',
    ],
    correct: [0, 2],
    explanation: 'Ethernet broadcast не использует IP TTL; без STP петля губит домен.',
    difficulty: 'advanced',
  },
  {
    id: 'l12-d06',
    group: 'l1-l2',
    topic: 'L2 · CAM',
    text: 'При переполнении MAC-таблицы коммутатор часто…',
    answers: [
      'Начинает заливать unknown unicast шире (как flood), пока не вытеснит записи',
      'Переходит в L3-only режим',
      'Отключает все trunk',
      'Автоматически включает BGP',
    ],
    correct: [0],
    explanation: 'CAM exhaustion → больше flooding; есть и атаки mac flooding.',
    difficulty: 'advanced',
  },

  // ─── L3 ────────────────────────────────────────────────────
  {
    id: 'l3-d01',
    group: 'l3',
    topic: 'L3 · Подсети',
    text: 'Сеть 10.10.10.0/30. Сколько usable host-адресов?',
    answers: ['2', '4', '6', '14'],
    correct: [0],
    explanation: '/30 → 4 адреса всего, 2 usable (point-to-point).',
    difficulty: 'applied',
  },
  {
    id: 'l3-d02',
    group: 'l3',
    topic: 'L3 · Подсети',
    text: 'Какой broadcast у 192.168.5.64/27?',
    answers: ['192.168.5.95', '192.168.5.127', '192.168.5.64', '192.168.5.255'],
    correct: [0],
    explanation: '/27 шаг 32: 64–95, broadcast 95.',
    difficulty: 'advanced',
  },
  {
    id: 'l3-d03',
    group: 'l3',
    topic: 'L3 · Маршрутизация',
    text: 'Два маршрута к одной сети: /24 metric 10 и /25 metric 100. Куда пойдёт пакет в хост из /25?',
    answers: [
      'В более specific /25 (longest prefix match), metric вторичен',
      'Всегда в /24 из-за лучшей metric',
      'Пакет будет дропнут',
      'Решает только ARP',
    ],
    correct: [0],
    explanation:
      'Longest prefix match важнее administrative distance/metric при выборе среди подходящих префиксов (AD сравнивают для одинаковой специфичности — здесь разная длина).',
    difficulty: 'advanced',
  },
  {
    id: 'l3-d04',
    group: 'l3',
    topic: 'L3 · TTL',
    text: 'Пакет с TTL=1 приходит на маршрутизатор, которому нужно форвардить дальше. Что произойдёт?',
    answers: [
      'Пакет не форвардится; часто ICMP Time Exceeded источнику',
      'TTL станет 255 автоматически',
      'Пакет всегда уйдёт с TTL=1 дальше',
      'Коммутатор L2 уменьшит TTL',
    ],
    correct: [0],
    explanation: 'При TTL≤1 после декремента форвардинг не выполняют.',
    difficulty: 'applied',
  },
  {
    id: 'l3-d05',
    group: 'l3',
    topic: 'L3 · NAT',
    text: 'Many-to-one PAT (NAT overload) различает сессии в основном по…',
    answers: [
      'Комбинации адресов и портов (и протокола)',
      'Только MAC клиента',
      'Только VLAN ID',
      'Только DSCP',
    ],
    correct: [0],
    explanation: 'PAT multiplexes by port numbers on the shared public IP.',
    difficulty: 'advanced',
  },
  {
    id: 'l3-d06',
    group: 'l3',
    topic: 'L3 · IPv6',
    text: 'fe80::/10 — это…',
    answers: [
      'Link-local адреса (не маршрутизируются между линками)',
      'Глобальные unicast как 2001::/3',
      'Multicast all-nodes only FF02::1 как unicast',
      'Зарезервировано только под DHCP',
    ],
    correct: [0],
    explanation: 'IPv6 link-local обязателен на интерфейсах, scope — линк.',
    difficulty: 'applied',
  },
  {
    id: 'l3-d07',
    group: 'l3',
    topic: 'L3 · ARP',
    text: 'Proxy ARP на шлюзе может маскировать…',
    answers: [
      'Неправильные маски/ожидание «плоской» сети у хостов',
      'Полный отказ STP',
      'Отсутствие TCP',
      'Слом DNSSEC обязательно',
    ],
    correct: [0],
    explanation: 'Proxy ARP отвечает своим MAC за удалённые IP — иногда скрывает design-ошибки.',
    difficulty: 'advanced',
  },
  {
    id: 'l3-d08',
    group: 'l3',
    topic: 'L3 · ECMP',
    text: 'ECMP между двумя равными маршрутами обычно балансирует…',
    answers: [
      'Потоки (hash по адресам/портам), а не каждый пакет случайно на всех платформах',
      'Строго по кругу каждый кадр L2',
      'Только broadcast',
      'Только ICMP echo',
    ],
    correct: [0],
    explanation: 'Типичный CEF/ECMP — per-flow hashing, чтобы не переупорядочивать TCP.',
    difficulty: 'advanced',
  },

  // ─── L4 ────────────────────────────────────────────────────
  {
    id: 'l4-d01',
    group: 'l4',
    topic: 'L4 · TCP',
    text: 'Виден SYN, нет SYN+ACK. Какие причины правдоподобны? Выберите все подходящие.',
    answers: [
      'Фильтр/ACL на пути или на сервере',
      'Сервис не слушает порт',
      'Асимметричный path + strict stateful firewall',
      'Обязательно только half-duplex на клиенте как единственная причина',
    ],
    correct: [0, 1, 2],
    explanation: 'Нет ответа на SYN — фильтрация, down-сервис, routing/policy; не сводить всё к duplex.',
    difficulty: 'advanced',
  },
  {
    id: 'l4-d02',
    group: 'l4',
    topic: 'L4 · TCP',
    text: 'Retransmissions растут, RTT большой. Window scaling согласован. Что ещё смотреть?',
    answers: [
      'Потери на пути, bufferbloat, policing, MTU/PMTUD',
      'Только native VLAN',
      'Только цвет индикатора SFP',
      'Только PTR DNS',
    ],
    correct: [0],
    explanation: 'TCP ретрансмиты — сигнал потерь/задержек/ограничений пути.',
    difficulty: 'advanced',
  },
  {
    id: 'l4-d03',
    group: 'l4',
    topic: 'L4 · TCP',
    text: 'TIME-WAIT на стороне, закрывшей соединение, нужен чтобы…',
    answers: [
      'Корректно обработать запоздалые сегменты и обеспечить надежность закрытия',
      'Ускорить только SYN-flood',
      'Заменить keepalive HTTP',
      'Отключить seq numbers',
    ],
    correct: [0],
    explanation: 'TIME-WAIT — часть graceful close FSM.',
    difficulty: 'advanced',
  },
  {
    id: 'l4-d04',
    group: 'l4',
    topic: 'L4 · UDP',
    text: 'UDP DNS иногда переходит на TCP. Когда?',
    answers: [
      'Большой ответ / truncated (TC) или zone transfer',
      'Всегда для любых A-записей',
      'Только при использовании HTTP/3',
      'Никогда по стандарту',
    ],
    correct: [0],
    explanation: 'TC-бит и AXFR/IXFR — типичные причины DNS over TCP.',
    difficulty: 'applied',
  },
  {
    id: 'l4-d05',
    group: 'l4',
    topic: 'L4 · TCP',
    text: 'Selective ACK (SACK) помогает…',
    answers: [
      'Подтверждать несмежные блоки и эффективнее догонять потери',
      'Выбирать VLAN на trunk',
      'Шифровать payload как TLS',
      'Назначать IP из DHCP',
    ],
    correct: [0],
    explanation: 'SACK улучшает восстановление при множественных потерях.',
    difficulty: 'advanced',
  },
  {
    id: 'l4-d06',
    group: 'l4',
    topic: 'L4 · QoS',
    text: 'Полисинг на TCP-потоке часто приводит к…',
    answers: [
      'Потерям → ретрансмитам и падению throughput',
      'Гарантированному росту window без потерь',
      'Отключению ARP',
      'Автоматическому OSPF max-metric',
    ],
    correct: [0],
    explanation: 'Drop → congestion signals для TCP.',
    difficulty: 'advanced',
  },

  // ─── L5–L7 ─────────────────────────────────────────────────
  {
    id: 'l57-d01',
    group: 'l5-l7',
    topic: 'L7 · TLS',
    text: 'Сертификат выписан на www.example.com, клиент идёт на example.com без SAN. Типичный результат?',
    answers: [
      'Ошибка проверки имени (name mismatch), если нет подходящего SAN/CN',
      'Всегда успех из-за TTL DNS',
      'Проблема только L2',
      'Обязательный fallback на HTTP cleartext в браузере',
    ],
    correct: [0],
    explanation: 'Hostname must match certificate identities.',
    difficulty: 'advanced',
  },
  {
    id: 'l57-d02',
    group: 'l5-l7',
    topic: 'L7 · TLS',
    text: 'На одном IP-адресе размещено несколько HTTPS-сайтов (разные домены). Клиент не отправляет SNI в TLS ClientHello. Что наиболее вероятно?',
    answers: [
      'Сервер может отдать сертификат по умолчанию для этого IP; если имя в нём не совпадает с запрошенным доменом — клиент увидит ошибку проверки имени',
      'DNS-запись сама выбирает нужный сертификат ещё до начала TLS-рукопожатия',
      'Сервер читает заголовок HTTP Host и только после этого выбирает сертификат',
      'Без SNI TLS-соединение всегда отклоняется с handshake failure, независимо от сертификата',
    ],
    correct: [0],
    explanation: 'SNI (Server Name Indication) в ClientHello позволяет серверу выбрать сертификат до HTTP. Без SNI часто отдаётся default cert; mismatch зависит от того, покрывает ли он запрошенное имя.',
    difficulty: 'advanced',
  },
  {
    id: 'l57-d03',
    group: 'l5-l7',
    topic: 'L7 · DNS',
    text: 'Split-horizon DNS означает…',
    answers: [
      'Разные ответы внутри/снаружи сети для одного имени',
      'Обязательный DNSSEC на всех зонах',
      'Только UDP запрещён',
      'Замену BGP communities',
    ],
    correct: [0],
    explanation: 'Внутренние и внешние view одной зоны.',
    difficulty: 'advanced',
  },
  {
    id: 'l57-d04',
    group: 'l5-l7',
    topic: 'L7 · HTTP',
    text: 'HTTP/2 multiplexing по одному TCP не спасает от…',
    answers: [
      'Head-of-line blocking на уровне TCP при потерях',
      'Любых задержек DNS навсегда',
      'Необходимости портов',
      'Использования IP',
    ],
    correct: [0],
    explanation: 'Потому HTTP/3/QUIC уходит на UDP с другим контролем потерь.',
    difficulty: 'advanced',
  },
  {
    id: 'l57-d05',
    group: 'l5-l7',
    topic: 'L7 · DHCP',
    text: 'Два DHCP-сервера в одном L2 без разделения ролей. Риск?',
    answers: [
      'Конфликт выдач/гонка Offer, непредсказуемые настройки клиентов',
      'Автоматический STP root guard',
      'Отключение всех trunk',
      'Только рост optical RX',
    ],
    correct: [0],
    explanation: 'Нужны split scopes, DHCP failover или фильтрация.',
    difficulty: 'advanced',
  },
  {
    id: 'l57-d06',
    group: 'l5-l7',
    topic: 'L7 · Безопасность',
    text: 'HSTS preload полезен, но ошибочный долгий max-age…',
    answers: [
      'Может надолго «прибить» HTTPS-only и усложнить откат при проблемах с TLS',
      'Отключает Ethernet',
      'Ломает только ARP',
      'Заменяет SPF',
    ],
    correct: [0],
    explanation: 'HSTS — мощный и опасный при misconfig.',
    difficulty: 'advanced',
  },

  // ─── TCP/IP ────────────────────────────────────────────────
  {
    id: 'tcpip-d01',
    group: 'tcpip',
    topic: 'TCP/IP · Инкапсуляция',
    text: 'Маршрутизатор при форварде IPv4 (без NAT) обычно сохраняет… и переписывает…',
    answers: [
      'IP src/dst (обычно) · L2 MAC под следующий hop',
      'TCP ports всегда · IP src клиента',
      'Только HTTP Host · VLAN на access',
      'DNS QNAME · STP priority',
    ],
    correct: [0],
    explanation: 'L3 адреса end-to-end (без NAT); L2 меняется на каждом сегменте.',
    difficulty: 'advanced',
  },
  {
    id: 'tcpip-d02',
    group: 'tcpip',
    topic: 'TCP/IP · PMTUD',
    text: 'PMTUD black hole часто связан с…',
    answers: [
      'Фильтрацией ICMP Fragmentation Needed при DF=1',
      'Отключением SSH only',
      'Слишком большим MAC aging',
      'Отсутствием MX',
    ],
    correct: [0],
    explanation: 'Без ICMP PTB/Frag Needed отправитель не узнаёт о меньшем MTU.',
    difficulty: 'advanced',
  },
  {
    id: 'tcpip-d03',
    group: 'tcpip',
    topic: 'TCP/IP · Модель',
    text: 'Почему «сетевой инженер думает OSI, а пакеты живут в TCP/IP» — рабочая формула?',
    answers: [
      'OSI удобна для ролей/диагностики; TCP/IP описывает реальные протоколы стека',
      'OSI запрещена в RFC',
      'TCP/IP имеет ровно 7 уровней как OSI',
      'Ethernet не входит ни в одну модель',
    ],
    correct: [0],
    explanation: 'Две модели дополняют друг друга в практике.',
    difficulty: 'applied',
  },
  {
    id: 'tcpip-d04',
    group: 'tcpip',
    topic: 'TCP/IP · Middleboxes',
    text: 'Stateful firewall ломает приложение при асимметричной маршрутизации, потому что…',
    answers: [
      'Не видит полный bidirectional state на одном box',
      'Не поддерживает IP',
      'Работает только на L1',
      'Требует STP',
    ],
    correct: [0],
    explanation: 'State создаётся на одном пути; ответ другим путём может дропаться.',
    difficulty: 'advanced',
  },
  {
    id: 'tcpip-d05',
    group: 'tcpip',
    topic: 'TCP/IP · ECN',
    text: 'ECN (если согласован) позволяет…',
    answers: [
      'Сигнализировать перегрузку без обязательного drop (CE mark)',
      'Заменить IP-адреса',
      'Отключить TCP',
      'Назначить native VLAN',
    ],
    correct: [0],
    explanation: 'Explicit Congestion Notification — mark instead of only drop.',
    difficulty: 'advanced',
  },

  // ─── Troubleshooting advanced ──────────────────────────────
  {
    id: 'ts-d01',
    group: 'troubleshooting',
    topic: 'Диагностика · Сценарий',
    text: 'ПК получает IP, шлюз пингуется, сайты по имени открываются, корпоративный HTTPS — нет. Что проверить?',
    answers: [
      'Прокси/PAC, MITM-SSL inspection, ACL по портам 443, split DNS, сертификаты',
      'Только замену патч-корда без дальнейших шагов',
      'Только STP priority core',
      'Только длину оптики магистрали',
    ],
    correct: [0],
    explanation: 'База сети жива — смотрим app path, policy, TLS middlebox.',
    difficulty: 'advanced',
  },
  {
    id: 'ts-d02',
    group: 'troubleshooting',
    topic: 'Диагностика · Сценарий',
    text: 'После миграции VLAN пользователи «в той же подсети» не видят друг друга. Линки up. Первый фокус?',
    answers: [
      'Фактический access VLAN / SVI / inter-VLAN ACL и одинаковость L2-домена',
      'Только увеличение TCP window',
      'Только смена hostname коммутатора',
      'Только отключение NTP',
    ],
    correct: [0],
    explanation: 'Часто «забыли» VLAN на access или режут ACL между сегментами.',
    difficulty: 'advanced',
  },
  {
    id: 'ts-d03',
    group: 'troubleshooting',
    topic: 'Диагностика · Сценарий',
    text: 'traceroute до сервера обрывается на корпоративном edge, tcp/443 снаружи работает. Вероятно?',
    answers: [
      'Фильтрация ICMP/UDP traceroute при живом data path',
      'Полный physical down на всём пути',
      'Обязательный native VLAN mismatch everywhere',
      'Отсутствие MAC у сервера глобально',
    ],
    correct: [0],
    explanation: 'Нельзя равнять «traceroute пуст» с «сервис мёртв».',
    difficulty: 'advanced',
  },
  {
    id: 'ts-d04',
    group: 'troubleshooting',
    topic: 'Диагностика · Сценарий',
    text: 'Один поток TCP медленный, iperf UDP примерно ок. Куда копать?',
    answers: [
      'Потери/reordering для TCP, policing, bufferbloat, window, middlebox',
      'Только RX optical dBm на всех порах core',
      'Только DHCP pool',
      'Только цвет патч-корда',
    ],
    correct: [0],
    explanation: 'TCP чувствителен к loss/RTT; UDP iperf не равен поведению TCP.',
    difficulty: 'advanced',
  },
  {
    id: 'ts-d05',
    group: 'troubleshooting',
    topic: 'Диагностика · Сценарий',
    text: 'После включения uRPF на интерфейсе «пропала» часть легитимного трафика. Почему?',
    answers: [
      'Асимметричная маршрутизация: ответный/входящий path не совпадает с ожиданием uRPF',
      'uRPF всегда ломает только DNS',
      'uRPF отключает STP',
      'uRPF меняет MAC OUI',
    ],
    correct: [0],
    explanation: 'Strict uRPF и asymmetry — частый конфликт.',
    difficulty: 'advanced',
  },
  {
    id: 'ts-d06',
    group: 'troubleshooting',
    topic: 'Диагностика · Сценарий',
    text: 'Какой порядок разумнее при «интернет есть / телефония SIP нет»?',
    answers: [
      'Проверить DNS, ALG/NAT, ACL по SIP/RTP портам, ALG, одностороннее аудио (NAT)',
      'Сразу перепрошить все коммутаторы',
      'Отключить все VLAN',
      'Удалить default route',
    ],
    correct: [0],
    explanation: 'Сервис-специфичные порты и NAT/ALG для VoIP.',
    difficulty: 'advanced',
  },
  {
    id: 'ts-d07',
    group: 'troubleshooting',
    topic: 'Диагностика · CLI',
    text: 'На Linux packet arrives on wrong interface path. Что поможет увидеть правила политики?',
    answers: [
      'ip rule / ip route show table … (policy routing)',
      'только show vlan brief',
      'только dig +trace',
      'только ethtool --blink',
    ],
    correct: [0],
    explanation: 'Policy routing смотрят через ip rule и таблицы.',
    difficulty: 'advanced',
  },
  {
    id: 'ts-d08',
    group: 'troubleshooting',
    topic: 'Диагностика · Сценарий',
    text: 'Симптом: «отваливается через ~5 минут». Какие гипотезы рациональны? Выберите все подходящие.',
    answers: [
      'ARP/MAC aging и silent hosts',
      'DHCP lease/renewal сбой',
      'Firewall session timeout',
      'Обязательно только температура SFP как единственная причина',
    ],
    correct: [0, 1, 2],
    explanation: 'Тайм-ауты state/ARP/DHCP — частые «через N минут».',
    difficulty: 'advanced',
  },

  // ─── L2 · Port Security + DHCP Snooping (channel pack) ─────
  {
    id: 'l12-ps01',
    group: 'l1-l2',
    topic: 'L2 · Port Security',
    text: 'На access-порту включён port-security с violation shutdown. Подключили устройство со вторым MAC. Что обычно происходит?',
    answers: [
      'Порт переходит в err-disabled',
      'Порт молча отбрасывает только broadcast',
      'Коммутатор перезагружается',
      'VLAN порта автоматически меняется на native',
    ],
    correct: [0],
    explanation: 'В режиме shutdown нарушение лимита MAC переводит порт в err-disabled. Protect только блокирует, restrict ещё считает.',
    difficulty: 'applied',
    family: 'port-security',
  },
  {
    id: 'l12-ps02',
    group: 'l1-l2',
    topic: 'L2 · Port Security',
    text: 'Чем режим restrict отличается от protect в port-security?',
    answers: [
      'Тоже блокирует неизвестный MAC, но ещё считает нарушения и может слать syslog/SNMP',
      'Сразу переводит порт в err-disabled',
      'Разрешает любые MAC без ограничений',
      'Меняет native VLAN на порту',
    ],
    correct: [0],
    explanation: 'Protect отбрасывает кадры неизвестного MAC. Restrict делает то же и увеличивает счётчик нарушений, часто с уведомлениями.',
    difficulty: 'applied',
    family: 'port-security',
  },
  {
    id: 'l12-ps03',
    group: 'l1-l2',
    topic: 'L2 · Port Security',
    text: 'Что делает sticky в port-security?',
    answers: [
      'Изучает MAC и записывает его в running-config',
      'Требует вводить каждый MAC только вручную',
      'Навсегда выключает порт после первого кадра',
      'Работает только на trunk-портах',
    ],
    correct: [0],
    explanation: 'Sticky учит MAC на порту и добавляет его в текущую конфигурацию, чтобы не задавать адрес руками.',
    difficulty: 'beginner',
    family: 'port-security',
  },
  {
    id: 'l12-ds01',
    group: 'l1-l2',
    topic: 'L2 · DHCP Snooping',
    text: 'После включения DHCP Snooping клиенты перестали получать адреса. Что чаще всего забыли?',
    answers: [
      'Пометить uplink к DHCP-серверу или relay как trusted',
      'Выключить STP на всех портах',
      'Сменить native VLAN на 1',
      'Отключить LLDP',
    ],
    correct: [0],
    explanation: 'После включения порты по умолчанию untrusted: ответы сервера режутся. Uplink к серверу или relay нужно пометить trusted.',
    difficulty: 'applied',
    family: 'dhcp-snooping',
  },
  {
    id: 'l12-ds02',
    group: 'l1-l2',
    topic: 'L2 · DHCP Snooping',
    text: 'Что хранит binding-таблица DHCP Snooping?',
    answers: [
      'MAC, IP, VLAN и порт',
      'Только DNS-имя клиента',
      'Только список ACL',
      'Только скорость порта',
    ],
    correct: [0],
    explanation: 'Binding связывает MAC, выданный IP, VLAN и интерфейс. Эту таблицу используют DAI и IP Source Guard.',
    difficulty: 'beginner',
    family: 'dhcp-snooping',
  },
  {
    id: 'l12-ds03',
    group: 'l1-l2',
    topic: 'L2 · DHCP Snooping',
    text: 'Зачем включать DHCP Snooping на пользовательском VLAN?',
    answers: [
      'Чтобы клиенты не получили шлюз и DNS от чужого DHCP-сервера',
      'Чтобы ускорить сходимость STP',
      'Чтобы отключить ARP',
      'Чтобы увеличить MTU на порту',
    ],
    correct: [0],
    explanation: 'DHCP Snooping блокирует ответы DHCP на untrusted-портах и защищает от rogue DHCP.',
    difficulty: 'applied',
    family: 'dhcp-snooping',
  },
  {
    id: 'l12-ds04',
    group: 'l1-l2',
    topic: 'L2 · DHCP Snooping',
    text: 'На клиентском порту стоит слишком низкий ip dhcp snooping limit rate. Чем это грозит?',
    answers: [
      'Легитимные Discover и Request могут отбрасываться',
      'Порт всегда станет trunk',
      'Отключится OSPF на ядре',
      'Сменится MAC самого коммутатора',
    ],
    correct: [0],
    explanation: 'Rate limit защищает от шторма DHCP, но слишком низкий порог режет и обычные запросы клиентов.',
    difficulty: 'advanced',
    family: 'dhcp-snooping',
  },

  // ─── L3 · VRRP ─────────────────────────────────────────────
  {
    id: 'l3-vrrp01',
    group: 'l3',
    topic: 'L3 · VRRP',
    text: 'Зачем клиентам VRRP?',
    answers: [
      'Несколько маршрутизаторов делят один виртуальный IP шлюза',
      'Чтобы заменить DNS',
      'Чтобы отключить ARP',
      'Чтобы сделать порт trunk',
    ],
    correct: [0],
    explanation: 'Клиенты указывают один VIP. При отказе Master роль берёт Backup, шлюз для клиентов не меняется.',
    difficulty: 'beginner',
    family: 'vrrp',
  },
  {
    id: 'l3-vrrp02',
    group: 'l3',
    topic: 'L3 · VRRP',
    text: 'Кто станет Master при одинаковом виртуальном IP?',
    answers: [
      'Маршрутизатор с более высоким Priority',
      'Всегда с меньшим MAC',
      'Всегда с большим uptime',
      'Случайно при каждом hello',
    ],
    correct: [0],
    explanation: 'Чем выше Priority, тем предпочтительнее роль Master. По умолчанию 100, 255 — у владельца VIP.',
    difficulty: 'applied',
    family: 'vrrp',
  },
  {
    id: 'l3-vrrp03',
    group: 'l3',
    topic: 'L3 · VRRP',
    text: 'Поверх чего передаётся VRRP?',
    answers: [
      'IP, протокол 112, без TCP и UDP',
      'TCP 179',
      'UDP 123',
      'Только ICMP',
    ],
    correct: [0],
    explanation: 'VRRP идёт напрямую по IP (протокол 112), multicast 224.0.0.18. Это не TCP и не UDP.',
    difficulty: 'applied',
    family: 'vrrp',
  },
  {
    id: 'l3-vrrp04',
    group: 'l3',
    topic: 'L3 · VRRP',
    text: 'Что делает preemption в VRRP?',
    answers: [
      'Позволяет маршрутизатору с большим приоритетом снова стать Master',
      'Навсегда фиксирует текущего Master',
      'Отключает виртуальный IP',
      'Меняет VRID на обоих устройствах',
    ],
    correct: [0],
    explanation: 'При включённом preemption восстановившийся маршрутизатор с более высоким Priority забирает роль Master.',
    difficulty: 'applied',
    family: 'vrrp',
  },
  {
    id: 'l12-copp01',
    group: 'troubleshooting',
    topic: 'Диагностика · CoPP',
    text: 'Маршрутизатор не отвечает на ping, SSH тормозит, транзитный трафик идёт. Что проверить в первую очередь?',
    answers: [
      'CoPP / защиту control plane',
      'CRC на всех портах сразу',
      'DNS на клиентах',
      'отсутствие default route',
    ],
    correct: [0],
    explanation: 'CoPP ограничивает пакеты к самому устройству. Потери до маршрутизатора не означают потери через него.',
    difficulty: 'advanced',
    family: 'copp',
  },
  {
    id: 'l12-storm01',
    group: 'troubleshooting',
    topic: 'Диагностика · Storm Control',
    text: 'Порт UP, CRC нет, но часть устройств теряет связь после подключения нового оборудования. Что проверить?',
    answers: [
      'Storm Control на broadcast/multicast/unknown unicast',
      'только кабель',
      'только DNS TTL',
      'только размер TCP window',
    ],
    correct: [0],
    explanation: 'Storm Control режет превышение порога без CRC. Слишком низкий порог может резать ARP и DHCP Discover.',
    difficulty: 'applied',
    family: 'storm-control',
  },
  {
    id: 'l12-dot1x01',
    group: 'l1-l2',
    topic: 'L2 · 802.1X',
    text: 'Что проходит на порту до успешной аутентификации?',
    answers: ['EAPOL', 'весь IP-трафик', 'только BGP', 'только DHCP всегда'],
    correct: [0],
    explanation: 'До Access-Accept обычный трафик блокируется, EAPOL между клиентом и коммутатором проходит.',
    difficulty: 'applied',
    family: 'dot1x',
  },
  {
    id: 'l12-lldp01',
    group: 'l1-l2',
    topic: 'L2 · LLDP-MED',
    text: 'IP-телефон сам ушёл в Voice VLAN, порт access для ПК. Как?',
    answers: [
      'Коммутатор передал политику через LLDP-MED',
      'STP назначил VLAN',
      'DHCP Option 82 создал VLAN',
      'телефон всегда игнорирует VLAN',
    ],
    correct: [0],
    explanation: 'LLDP-MED передаёт Voice VLAN, 802.1p и DSCP. VLAN должен уже существовать, IP телефон не получает.',
    difficulty: 'applied',
    family: 'lldp-med',
  },
  {
    "id": "l3-rpki01",
    "group": "l3",
    "topic": "L3 · RPKI",
    "difficulty": "advanced",
    "family": "rpki",
    "text": "BGP Established, но часть соседей не принимает префикс. Почему?",
    "answers": [
      "RPKI Invalid: ASN или длина префикса не совпадает с ROA",
      "нет LLDP",
      "native VLAN mismatch",
      "отключён STP"
    ],
    "correct": [
      0
    ],
    "explanation": "Сессия BGP Established не гарантирует принятие каждого маршрута: сосед может отклонять RPKI Invalid своей импортной политикой. При наличии покрывающего ROA маршрут Invalid, если ни одна соответствующая авторизация не разрешает origin ASN и длину анонса в пределах maxLength."
  },
  {
    "id": "ts-pfc01",
    "group": "troubleshooting",
    "topic": "Диагностика · PFC",
    "difficulty": "advanced",
    "family": "pfc",
    "text": "Один перегруженный сервер тормозит чужие потоки того же приоритета. Что подозревать?",
    "answers": [
      "Priority Flow Control и congestion spreading",
      "только ошибку DNS",
      "неверный MTU на клиенте",
      "отсутствие ARP"
    ],
    "correct": [
      0
    ],
    "explanation": "PFC приостанавливает передачу целого приоритета на линке, а не отдельного потока. При распространении обратного давления перегрузка может задерживать и другие потоки того же приоритета."
  },
  {
    "id": "l4-fr01",
    "group": "l4",
    "topic": "L4 · TCP",
    "difficulty": "applied",
    "family": "tcp-retransmit",
    "text": "Какой механизм TCP пересылает потерянный сегмент, не дожидаясь RTO?",
    "answers": [
      "Fast Retransmit по дублирующим ACK",
      "Delayed ACK",
      "Nagle",
      "Window Scaling"
    ],
    "correct": [
      0
    ],
    "explanation": "В классическом TCP Fast Retransmit запускает повторную передачу после трёх дублирующих ACK, не дожидаясь истечения RTO. Delayed ACK, Nagle и Window Scaling решают другие задачи."
  },
  {
    "id": "tcpip-ntp01",
    "group": "tcpip",
    "topic": "TCP/IP · NTP",
    "difficulty": "applied",
    "family": "ntp",
    "text": "Почему NTP важен не только для часов на экране?",
    "answers": [
      "Иначе логи с разных устройств расходятся по времени",
      "он выдаёт IP",
      "он строит STP",
      "он заменяет DNS"
    ],
    "correct": [
      0
    ],
    "explanation": "NTP синхронизирует часы устройств, чтобы события в логах можно было сопоставлять по времени. Выдачу IP, построение дерева STP и разрешение DNS-имён он не выполняет."
  },
  {
    "id": "ts-linux01",
    "group": "troubleshooting",
    "topic": "Диагностика · Linux",
    "difficulty": "applied",
    "family": "linux-net",
    "text": "ip addr add сработал, после перезагрузки адрес пропал. Почему?",
    "answers": [
      "Команда меняет только текущую конфигурацию ядра",
      "IP всегда временный",
      "DHCP обязателен",
      "ARP не сохранился"
    ],
    "correct": [
      0
    ],
    "explanation": "ip addr add добавляет адрес в текущую конфигурацию интерфейса в ядре, но сам по себе не сохраняет настройку для следующей загрузки. Постоянный адрес задают через сетевой менеджер или конфигурацию, используемую дистрибутивом."
  },
  // ─── Diagnostics pack 1: evidence before configuration changes ───
  {
    "id": "ts-pack1-01",
    "group": "troubleshooting",
    "topic": "Диагностика · Методика",
    "text": "После обслуживания сервер не получает Link на прежнем порту, но работает через резервный с тем же кабелем. Номер разъёма проверен. Какую проверку исходного порта выполнить первой, не меняя конфигурацию?",
    "answers": [
      "Сопоставить административное и рабочее состояния порта",
      "Сопоставить лимит MAC и счётчики нарушений port-security",
      "Сопоставить время работ с журналом изменений конфигурации",
      "Сопоставить состояние разъёма порта и контактов кабеля"
    ],
    "correct": [
      0
    ],
    "explanation": "Сначала нужно установить, разрешено ли порту работать и какое состояние он сообщает фактически. Административное отключение требует выяснить причину и разрешение на включение, а не сразу менять среду передачи. Журнал изменений помогает найти происхождение настройки, но не заменяет проверку текущего состояния; работа через резервный порт уже проверила часть физического тракта.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-02",
    "group": "troubleshooting",
    "topic": "Диагностика · Ping",
    "text": "B получает одиночные unicast-пробы ping от A, но не отвечает; на такие же пробы от C отвечает. Оба отправителя находятся с B в одном IP-сегменте, их записи соседей на B корректны. На B net.ipv4.icmp_echo_ignore_all=0. Что проверить дальше?",
    "answers": [
      "Глобальный запрет Echo Reply через параметры ядра",
      "Политику обработки широковещательных Echo Request",
      "Правила endpoint firewall для адреса отправителя",
      "Ограничение частоты генерации ответов ICMP ядром"
    ],
    "correct": [
      2
    ],
    "explanation": "Различие зависит от отправителя, поэтому следующая проверка — локальные правила firewall, сопоставляющие его адрес и ICMP. Глобальное игнорирование Echo отключено и не объясняет успешные ответы другому узлу. Редкие unicast-пробы также не указывают на политику broadcast или ограничение частоты ответов; прохождение запроса уже подтверждено захватом.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-03",
    "group": "troubleshooting",
    "topic": "Диагностика · TCP",
    "text": "Клиент обращается к 10.20.0.8:8443 и получает RST. На сервере ss показывает LISTEN 127.0.0.1:8443; процесс не перезапускался во время теста, а трассировка пакетных правил показывает ACCEPT в обоих направлениях. Какое объяснение согласуется с данными?",
    "answers": [
      "Процесс службы остановлен до получения запроса",
      "Сокет принимает соединения лишь на loopback-адресе",
      "Пакетные правила активно сбрасывают соединение",
      "Служба ожидает соединения на другом номере порта"
    ],
    "correct": [
      1
    ],
    "explanation": "Сокет существует, но привязан к loopback и не обслуживает обращение к сетевому адресу сервера. Нужен listener на предназначенном для клиентов адресе или подходящем wildcard-адресе. Гипотеза остановленной службы противоречит наблюдаемому LISTEN, а активный reset правилами не согласуется с трассировкой ACCEPT.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-04",
    "group": "troubleshooting",
    "topic": "Диагностика · ARP",
    "text": "После замены контроллера один ПК теряет с ним связь. В кадрах этого ПК адрес назначения M1, а контроллер сообщает для своего IP адрес M2; повторные запросы к этому IP дают единственный ответ M2. Таблица коммутатора правильно связывает M2 с портом контроллера. Что проверить первым?",
    "answers": [
      "Стабильность CAM-записи M2 на коммутаторе доступа",
      "Наличие второго устройства с тем же IP в сегменте",
      "Ответы proxy ARP от маршрутизатора этого сегмента",
      "Соответствие IP и MAC в ARP-кэше проблемного ПК"
    ],
    "correct": [
      3
    ],
    "explanation": "Адрес назначения Ethernet выбирает отправляющий ПК, поэтому сначала сверяют его ARP-кэш с текущим MAC контроллера. Корректная CAM-запись не заставит ПК заменить M1 на M2 в заголовке кадра. Единственный повторяемый ответ M2 не поддерживает версию конфликта IP, хотя при появлении ответов с разными MAC её нужно проверить отдельно.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-05",
    "group": "troubleshooting",
    "topic": "Диагностика · DNS",
    "text": "На Linux приложение и getent ahostsv4 возвращают прежний IP имени inventory.example. dig к настроенному резолверу и getent -s dns ahostsv4 возвращают новый адрес. Служб nscd и systemd-resolved нет, имя не совпадает с именем узла, mDNS отключён. Где искать различие первым?",
    "answers": [
      "В записи /etc/hosts и порядке её использования NSS",
      "В кэше nscd и сроке хранения положительного ответа",
      "В источнике myhostname и синтезируемых им адресах",
      "В источнике mDNS и выборе multicast-интерфейса"
    ],
    "correct": [
      0
    ],
    "explanation": "Прямой DNS и источник dns в NSS согласны, а полный поиск даёт другой результат. Нужно проверить локальную запись /etc/hosts и место этого источника в порядке NSS. Проверка кэша nscd не подходит для узла без этой службы; myhostname и mDNS также не объясняют указанное имя и конфигурацию.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-06",
    "group": "troubleshooting",
    "topic": "Диагностика · DNS",
    "text": "В 12:00 клиент без собственного хранилища ответов получает от рабочего резолвера прежний A-адрес со значением TTL 420; в 12:01 значение стало 360. Сервер зоны уже отдаёт новый адрес с TTL 30, SOA содержит 300. Какой срок определяет обычное обновление сохранённого положительного ответа?",
    "answers": [
      "TTL 30 из новой записи авторитетного сервера",
      "Срок 300 из SOA для отрицательных результатов",
      "Остаток TTL положительной записи у резолвера",
      "Локальный срок хранения результата приложением"
    ],
    "correct": [
      2
    ],
    "explanation": "Резолвер ещё использует положительный ответ, срок которого убывает независимо от нового TTL в зоне. При обычном кэшировании без принудительной очистки его обновление ожидается после истечения оставшегося срока этой записи. Новое значение 30 не сокращает задним числом сохранённый ответ, а отрицательное кэширование не относится к успешному A-ответу.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-07",
    "group": "troubleshooting",
    "topic": "Диагностика · Duplex",
    "text": "После согласования full-duplex на обоих концах соединения мониторинг всё ещё показывает много CRC за неделю. Нужно определить, появляются ли повреждения сейчас, не сбрасывая статистику и не меняя параметры линии. Как получить подходящую оценку?",
    "answers": [
      "Разделить накопленные CRC на всё время работы порта",
      "Вычесть два снимка CRC за известный интервал нагрузки",
      "Сравнить накопленные CRC двух концов соединения",
      "Разделить итог CRC на итог кадров с запуска порта"
    ],
    "correct": [
      1
    ],
    "explanation": "Два снимка одного счётчика позволяют выделить новые ошибки за интервал после исправления. Измерение выполняют при известной нагрузке и без перезапуска или переполнения счётчика между снимками. Среднее за всё время и отношение накопленных итогов смешивают старую неисправность с текущим состоянием, а итоги разных концов описывают разные направления приёма.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-08",
    "group": "troubleshooting",
    "topic": "Диагностика · STP",
    "text": "После подключения резервной линии трафик VLAN 40 идёт по менее желательному uplink, а второй не передаёт пользовательские кадры. Состояние устойчиво, потерь связи нет. Что сопоставить с проектом прежде, чем считать это неисправностью?",
    "answers": [
      "Интервал Hello и число принятых BPDU на обоих uplink",
      "Срок хранения MAC и интервал Forward Delay этой VLAN",
      "Число topology change и время последнего уведомления",
      "Фактический root bridge и cost путей через оба uplink"
    ],
    "correct": [
      3
    ],
    "explanation": "Устойчивый выбор одного из резервирующих путей сначала сверяют с расположением root bridge и стоимостью путей. Такая проверка объясняет роли портов и позволяет отделить ожидаемую блокировку от неверного предпочтения пути. Число topology change полезно при нестабильности, но само по себе не определяет, какой из устойчивых путей должен стать активным.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-09",
    "group": "troubleshooting",
    "topic": "Диагностика · ACL",
    "text": "ACL обрабатывается по первому совпадению: 10 deny tcp CLIENTS APP; 20 permit tcp CLIENTS APP eq 443; 30 permit ip CLIENTS any. CLIENTS и APP — заданные группы источников и назначения, eq относится к порту назначения. Нужно открыть HTTPS к APP, оставив прочий TCP к APP закрытым и сохранив остальные разрешения. Какова минимальная правка?",
    "answers": [
      "Переставить строку 20 перед строкой 10",
      "Переставить строку 20 после строки 30",
      "Заменить строку 10 на deny tcp CLIENTS APP eq 443",
      "Удалить строку 10, оставив строки 20 и 30"
    ],
    "correct": [
      0
    ],
    "explanation": "Узкое разрешение HTTPS должно проверяться раньше общего запрета TCP к APP. Перестановка строки 20 перед 10 открывает нужный порт и сохраняет запрет остальных TCP-портов к этому назначению. Удаление строки 10 откроет их через permit ip, а перенос разрешения ниже не устранит его перекрытие.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-10",
    "group": "troubleshooting",
    "topic": "Диагностика · TCP",
    "text": "Reverse proxy возвращает клиенту HTTP 503. Из его окружения имя узла назначения разрешается в ожидаемый адрес, TCP и проверка сертификата проходят, GET /api даёт 200. Плановая проба GET /ready даёт 401; условие допуска в пул — код 200. Что проверить первым?",
    "answers": [
      "Сертификат и SNI при TLS-сеансе с backend",
      "DNS-имя и адрес выбранного узла backend",
      "Параметры и авторизацию health check backend",
      "Номер порта и привязку сокета службы backend"
    ],
    "correct": [
      2
    ],
    "explanation": "Обычный запрос к backend работает, но проба допуска в пул не удовлетворяет требуемому коду ответа. Сначала проверяют её авторизацию и параметры health check, сопоставляя их с политикой /ready. Повторная проверка TLS не объясняет именно 401 после успешного защищённого обмена; порт и разрешение имени тоже уже проверены.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-11",
    "group": "troubleshooting",
    "topic": "Диагностика · Маршрут",
    "text": "На Linux два внешних интерфейса; локальное приложение использует адрес 192.0.2.10 и обращается к 198.51.100.20. Соединение не устанавливается, правила отбора таблиц могут различаться по отправителю. Какой запрос покажет решение ядра для этой пары без изменения настроек?",
    "answers": [
      "ip rule show — вывести приоритеты и селекторы правил",
      "ip route get 198.51.100.20 from 192.0.2.10",
      "ip route show table all — вывести записи всех таблиц",
      "ip route get 192.0.2.10 from 198.51.100.20"
    ],
    "correct": [
      1
    ],
    "explanation": "Нужно выполнить поиск для фактических адресов назначения и источника исходящего пакета. ip route get с указанным from показывает результат применения правил и выбранный следующий переход для этой пары. ip rule show перечисляет правила, но не выполняет полный поиск, а перестановка адресов проверяет другой пакет.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-12",
    "group": "troubleshooting",
    "topic": "Диагностика · VLAN",
    "text": "Два ПК на одном коммутаторе достигают шлюза, но их широковещательные запросы друг до друга не доходят. Оба порта forwarding, VLAN в выводе имеет тип normal без secondary VLAN; адресных правил фильтрации на портах нет. Какую настройку доступа проверить следующей?",
    "answers": [
      "Ассоциацию primary и secondary VLAN для этих портов",
      "PACL с фильтрацией по адресам и протоколам на входе",
      "MAC-фильтр с запрещёнными адресами обоих получателей",
      "Изоляцию портов абонентов при доступном общем uplink"
    ],
    "correct": [
      3
    ],
    "explanation": "Изоляция портов может запрещать обмен между абонентами, сохраняя доступ через общий uplink. Её проверяют отдельно от принадлежности обычной VLAN и состояния STP. Версия с PVLAN не согласуется с отсутствием secondary VLAN, а PACL и адресные MAC-фильтры исключены проверенной конфигурацией.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-13",
    "group": "troubleshooting",
    "topic": "Диагностика · Маршрут",
    "text": "Linux отправляет пакет от 192.0.2.10 к 203.0.113.7. ip rule: 0 lookup local; 100 from 192.0.2.10 lookup 100; 200 from 192.0.2.10 lookup 200; 32766 lookup main. В local назначения нет. Таблица 100: default dev eth1; таблица 200: 203.0.113.7/32 dev eth2; main: 203.0.113.0/24 dev eth0. Как будет отправлен пакет?",
    "answers": [
      "Через eth1 по результату поиска в таблице 100",
      "Через eth0 по маршруту из основной таблицы",
      "Через eth2 по самому длинному префиксу из всех таблиц",
      "Пакет отбросят из-за отсутствия записи в local"
    ],
    "correct": [
      0
    ],
    "explanation": "Правила проверяются по приоритету, и поиск в local без результата позволяет перейти дальше. Таблица 100 содержит подходящий default, поэтому её результат выбирает eth1 и до следующего правила поиск не доходит. Более длинный префикс из другой таблицы не сравнивается с уже найденным результатом глобально.",
    "difficulty": "advanced"
  },
  {
    "id": "ts-pack1-14",
    "group": "troubleshooting",
    "topic": "Диагностика · Маршрут",
    "text": "Firewall переводит публичное назначение в адрес сервера, не изменяя отправителя. В записи conntrack есть исходный SYN и статус UNREPLIED; на сервере захват показывает получение SYN и формирование SYN-ACK, на внутреннем интерфейсе firewall этот SYN-ACK не появляется. Что проверить на сервере до изменения трансляции?",
    "answers": [
      "Выделение SNAT-портов для данного адреса клиента",
      "Доставку SYN к уже созданной записи conntrack",
      "Выходной маршрут и next hop к исходному клиенту",
      "Соответствие публичного порта порту назначения DNAT"
    ],
    "correct": [
      2
    ],
    "explanation": "Запрос дошёл до сервера, а ответ сформирован, поэтому следующий участок проверки начинается с решения сервера о его отправке. При сохранённом адресе клиента нужно проверить маршрут именно к нему и выяснить, ведёт ли он через устройство с состоянием DNAT. Статус UNREPLIED не доказывает сбой conntrack, а поиск исчерпания SNAT-портов не подходит к обмену без изменения источника.",
    "difficulty": "advanced"
  },
  {
    "id": "ts-pack1-15",
    "group": "troubleshooting",
    "topic": "Диагностика · MTU",
    "text": "На Linux интерфейс допускает IP-пакеты до 1500 байт. Для назначения в локально сохранённых сведениях о пути осталось значение 1380; дальше за первым узлом есть канал с пределом 1300. Приложение передаёт UDP: полный IPv4-пакет имеет размер 1400 байт, DF установлен, фрагментация запрещена. Какое ограничение сработает ещё до передачи первого кадра?",
    "answers": [
      "Предел 1500 байт физического выходного интерфейса",
      "Предел 1380 байт из сведений ядра о данном пути",
      "Предел 1300 байт канала за первым промежуточным узлом",
      "Предел 1472 байта полезных данных UDP при Ethernet MTU 1500"
    ],
    "correct": [
      1
    ],
    "explanation": "Локальный стек уже располагает ограничением пути 1380, и IP-пакет 1400 с запретом фрагментации его превышает. Поэтому сначала проверяют сохранённую PMTU и параметры выбранного маршрута, а не ищут этот пакет на удалённом канале. Предел 1300 может потребовать дальнейшего уменьшения размера после обновления сведений, но не является первым локально применяемым ограничением в условии.",
    "difficulty": "advanced"
  },
  {
    "id": "ts-pack1-16",
    "group": "troubleshooting",
    "topic": "Диагностика · MTU",
    "text": "TCP использует ECMP: передача крупных сегментов с DF зависает лишь у части соединений. На одном пути известен меньший MTU; обычный ping может попасть на другой путь. Как проверить гипотезу без изменения MTU всей сети?",
    "answers": [
      "Сравнить средний RTT множества мелких ping",
      "Увеличить число параллельных TCP-подключений",
      "Сравнить traceroute с последовательным изменением UDP-портов",
      "Зафиксировать путь тестового потока и менять размер"
    ],
    "correct": [
      3
    ],
    "explanation": "При ECMP разные потоки могут попасть на разные каналы с разным ограничением размера. Проверка должна сохранять путь проблемного потока и сопоставлять результат с размером пакета и DF. Обычный мелкий ping или traceroute с меняющимися портами может проверить другой канал и не опровергает проблему MTU на исходном пути.",
    "difficulty": "advanced"
  },
  {
    "id": "ts-pack1-17",
    "group": "troubleshooting",
    "topic": "Диагностика · ACL",
    "text": "Статическая ACL разрешает запрос клиента к TCP/443. SYN-ACK сервера попадает в deny на обратном интерфейсе: у разрешающего правила там тоже destination port 443. Что проверить первым?",
    "answers": [
      "Source port 443 и destination port клиента в ответе",
      "Source port клиента и destination port 443 в ответе",
      "Применение той же ACL к прямому интерфейсу клиента",
      "Счётчик разрешающего правила прямого направления"
    ],
    "correct": [
      0
    ],
    "explanation": "В ответном SYN-ACK серверный порт 443 находится в поле source, а destination содержит клиентский порт. Статическая ACL не создаёт автоматическое разрешение обратного направления по факту пропущенного SYN. Проверка только destination port 443 повторяет условие запроса и не сопоставляет поля ответного пакета.",
    "difficulty": "advanced"
  },
  {
    "id": "ts-pack1-18",
    "group": "troubleshooting",
    "topic": "Диагностика · STP",
    "text": "На Cisco с PVST после изменения соединения A—B физическая связь есть, но STP удерживает порт от передачи данных. A: switchport mode trunk; switchport trunk native vlan 10; switchport trunk allowed vlan 10,20. B: switchport mode trunk; switchport trunk native vlan 20; switchport trunk allowed vlan 10,20. Какую согласованность восстановить первой?",
    "answers": [
      "Одинаковую стоимость обоих направлений в экземпляре STP",
      "Одинаковый приоритет мостов по обе стороны соединения",
      "Одинаковую VLAN для нетегированных кадров обоих концов",
      "Одинаковый интервал Hello на обоих физических портах"
    ],
    "correct": [
      2
    ],
    "explanation": "Оба конца переносят одинаковый набор VLAN, но по-разному относят нетегированные кадры к VLAN. Сначала нужно согласовать native VLAN и затем проверить снятие защитного состояния STP. Равенство cost или приоритета мостов не исправляет эту несогласованность и не является общим требованием для trunk.",
    "difficulty": "advanced"
  },
  {
    "id": "ts-pack1-19",
    "group": "troubleshooting",
    "topic": "Диагностика · TCP",
    "text": "Публикация 8443→8080 доставляет SYN на адрес контейнера и порт 8080, откуда возвращается RST. На хосте ss показывает 0.0.0.0:8080 у PID 700; /proc/700/ns/net и /proc/<container-pid>/ns/net имеют разные inode. Какая проверка первой объяснит, относится ли найденный сокет к получателю пакета?",
    "answers": [
      "Сверить DNAT-назначение с адресом и портом контейнера",
      "Сверить сетевые контексты службы и входящего соединения",
      "Сверить bind службы со всеми адресами интерфейсов хоста",
      "Сверить опубликованный порт с внешним портом клиента"
    ],
    "correct": [
      1
    ],
    "explanation": "Разные сетевые пространства имеют отдельные наборы сокетов, поэтому найденный на хосте listener не подтверждает приём в контейнере. Сначала проверяют контекст службы и наличие нужного listener там, куда доставлен SYN. Корректное DNAT-назначение уже наблюдается в захвате, а изменение bind внутри другого пространства не перенесёт сокет к получателю.",
    "difficulty": "advanced"
  },
  {
    "id": "ts-pack1-20",
    "group": "troubleshooting",
    "topic": "Диагностика · DNS",
    "text": "Приложение обращается к сайту по имени и безуспешно подключается к 2001:db8::30. По паспорту сервиса его второй адрес — 2001:db8::20; запрос к этому адресу с тем же именем в TLS проходит, как и принудительный IPv4-запрос. Что проверить прежде, чем менять приложение?",
    "answers": [
      "Маршрут IPv6 к подтверждённому адресу 2001:db8::20",
      "Разрешение TCP на IPv6-firewall узла 2001:db8::20",
      "Наличие IPv6-listener на узле сервиса 2001:db8::20",
      "Соответствие AAAA фактическому IPv6-адресу сервиса"
    ],
    "correct": [
      3
    ],
    "explanation": "При обращении по имени выбран адрес, отличный от проверенного адреса сервиса. Сначала сопоставляют AAAA с предназначенным узлом и выясняют источник неверного результата, включая кэш. Маршрут, firewall и listener проверенного адреса уже обеспечили успешный IPv6-запрос; их изменение не направит клиента с ошибочного адреса на нужный.",
    "difficulty": "advanced"
  },
];

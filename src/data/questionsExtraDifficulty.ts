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
    "text": "После обслуживания сервер не получает Link. На коммутаторе порт отмечен administratively down, сетевой адаптер сервера включён. С чего начать до проверки IP?",
    "answers": [
      "Уточнить причину shutdown и разрешение включить порт",
      "Задать одинаковую скорость на порту и сетевом адаптере сервера",
      "Увеличить интервал подавления событий link flap",
      "Заменить патч-корд между сервером и розеткой"
    ],
    "correct": [
      0
    ],
    "explanation": "Administratively down означает административное отключение порта, поэтому сначала выясняют причину shutdown и допустимость его включения. Замена кабеля не отменит административный запрет. После разрешённого включения проверяют физический Link и лишь затем адресацию.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-02",
    "group": "troubleshooting",
    "topic": "Диагностика · Ping",
    "text": "У двух узлов в одной VLAN работает обмен ARP. Захват на втором узле показывает входящий Echo Request, но исходящего Echo Reply нет. Что проверить первым на втором узле?",
    "answers": [
      "Список разрешённых VLAN на соединительном trunk",
      "Порядок выбора шлюзов для удалённых сетей",
      "Правило локального firewall для ICMP Echo",
      "Сходимость STP на резервном соединении"
    ],
    "correct": [
      2
    ],
    "explanation": "Запрос уже дошёл до сетевого стека получателя, а ответ не сформирован, поэтому первым проверяют локальную обработку ICMP, включая firewall. Изменение trunk не объясняет отсутствие ответа на уже доставленный запрос. Обмен ARP сам по себе не доказывает, что локальная политика разрешает Echo Reply.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-03",
    "group": "troubleshooting",
    "topic": "Диагностика · TCP",
    "text": "Ping сервера проходит. На его интерфейсе захвачен SYN к TCP/8443 и немедленный RST в ответ; журнал firewall подтверждает разрешение этого обмена. Что проверить первым?",
    "answers": [
      "Выбор маршрута клиента до соседнего шлюза и его метрику",
      "Слушающий сокет и адрес привязки сервиса",
      "Таймер ожидания повторной передачи SYN",
      "Размер MSS в настройках клиента"
    ],
    "correct": [
      1
    ],
    "explanation": "Сервер получил SYN и явно сбросил попытку, поэтому сначала проверяют наличие слушающего сокета на нужном адресе и порту. Увеличение таймера SYN не откроет закрытый порт. Захват и разрешающая политика локализуют следующую проверку в состоянии службы, хотя сам RST без этих данных мог бы иметь и другую причину.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-04",
    "group": "troubleshooting",
    "topic": "Диагностика · ARP",
    "text": "После замены контроллера его IP сохранился, MAC изменился. Один ПК продолжает отправлять кадры старому MAC; остальные уже обмениваются с новым контроллером. Что сделать первым?",
    "answers": [
      "Перенести порт контроллера в другую VLAN",
      "Очистить динамические MAC-записи на всех коммутаторах пути",
      "Добавить статический маршрут на всех клиентах",
      "Проверить и обновить ARP-запись на проблемном ПК"
    ],
    "correct": [
      3
    ],
    "explanation": "Кадры проблемного ПК адресованы прежнему MAC, поэтому сначала сверяют и обновляют его запись соседа для IP контроллера. Очистка MAC-таблицы коммутатора не исправит адрес назначения, который выбирает сам ПК. Перед обновлением нужно подтвердить новый MAC и отсутствие второго устройства с тем же IP.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-05",
    "group": "troubleshooting",
    "topic": "Диагностика · DNS",
    "text": "На Linux приложение получает старый IP имени. dig к настроенному DNS возвращает новый IP, а getent hosts — старый; в nsswitch.conf источником перед DNS указан files. Что проверить первым?",
    "answers": [
      "Наличие локальной записи имени в /etc/hosts",
      "Срок хранения записи на авторитетном DNS",
      "Маршрут от рекурсивного DNS к авторитетному",
      "Разрешение TCP/53 на внешнем firewall"
    ],
    "correct": [
      0
    ],
    "explanation": "Приложение использует системный механизм разрешения имён, где локальный файл может иметь приоритет над DNS. dig обращается к DNS напрямую и не подтверждает результат поиска через все источники NSS. Поэтому сначала проверяют совпадение имени в /etc/hosts, а не меняют уже корректную запись на DNS-сервере.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-06",
    "group": "troubleshooting",
    "topic": "Диагностика · DNS",
    "text": "Авторитетный DNS уже отдаёт новый A-адрес. Рабочий рекурсивный резолвер возвращает прежний адрес с положительным уменьшающимся TTL, и приложение получает его же. Что проверить перед повторной правкой зоны?",
    "answers": [
      "Доступность нового адреса по пути от резолвера к серверу",
      "Состояние trunk до DNS-сервера",
      "Оставшийся срок записи в кэше резолвера",
      "TCP-окно соединения с DNS-сервером"
    ],
    "correct": [
      2
    ],
    "explanation": "Положительный уменьшающийся TTL согласуется с ещё действующей кэшированной записью. Сначала проверяют срок её хранения и ожидаемое обновление после истечения TTL. Повторная правка авторитетной зоны не заставит резолвер немедленно забыть уже сохранённый ответ.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-07",
    "group": "troubleshooting",
    "topic": "Диагностика · Duplex",
    "text": "Duplex mismatch уже устранён: оба конца показывают full-duplex. В выводе остался большой суммарный счётчик ошибок за неделю. Как сначала проверить, продолжается ли проблема?",
    "answers": [
      "Снизить скорость обоих концов и повторить замер нагрузки",
      "Сравнить прирост ошибок за интервал с нагрузкой",
      "Вернуть прежние параметры duplex для сравнения",
      "Заменить кабель по накопленному числу ошибок"
    ],
    "correct": [
      1
    ],
    "explanation": "Накопленный счётчик включает период до исправления и не доказывает текущую неисправность. Нужно сохранить исходное значение и измерить прирост за известный интервал под контролируемой нагрузкой. Немедленная замена кабеля по старому итогу смешивает историю ошибок с состоянием линии после исправления.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-08",
    "group": "troubleshooting",
    "topic": "Диагностика · STP",
    "text": "У коммутатора два резервирующих uplink. Для VLAN 40 один порт RSTP Alternate/Discarding, другой Root/Forwarding; обмен пользователей работает. Что проверить перед попыткой снять блокировку?",
    "answers": [
      "Возможность включить edge на обоих uplink",
      "Возможность отключить BPDU на резервном порту",
      "Возможность принудительно открыть оба порта",
      "Соответствие активного пути и ролей проекту"
    ],
    "correct": [
      3
    ],
    "explanation": "Alternate/Discarding на резервном пути может быть штатной защитой от петли. При работающем основном пути сначала сверяют роли портов и топологию с проектом. Принудительное открытие второго пути или подавление BPDU может убрать защиту, а не устранить неисправность.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-09",
    "group": "troubleshooting",
    "topic": "Диагностика · ACL",
    "text": "В ACL сверху стоит deny TCP от клиентской сети к серверу, ниже — permit TCP к его порту 443. При тесте HTTPS растёт счётчик верхнего deny. Что проверить первым?",
    "answers": [
      "Порядок правил и область совпадения deny",
      "Таймер простоя разрешённых соединений HTTPS на firewall",
      "Размер сегмента в разрешающем правиле",
      "Запись ARP для интерфейса сервера"
    ],
    "correct": [
      0
    ],
    "explanation": "В ACL с обработкой по первому совпадению верхний deny завершает проверку пакета раньше нижнего permit. Рост его счётчика при контролируемом тесте указывает, какое правило нужно разобрать первым. Изменение таймера сессии не поможет пакету, который отклонён ещё на этапе сопоставления ACL.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-10",
    "group": "troubleshooting",
    "topic": "Диагностика · TCP",
    "text": "Клиент устанавливает TCP-соединение с reverse proxy и получает HTTP 503. В журнале proxy для этого запроса отмечено отсутствие доступных upstream. Что проверить первым?",
    "answers": [
      "MSS клиентского TCP-соединения с proxy",
      "Интервал отправки keepalive между клиентом и reverse proxy",
      "Состояние backend и результаты health check",
      "Размер окна приёма TCP на клиенте"
    ],
    "correct": [
      2
    ],
    "explanation": "Клиент уже получил корректный HTTP-ответ, а журнал привязывает отказ к пулу upstream. Сначала проверяют работоспособность backend и причину проваленных health check. Настройка окна или MSS клиентского соединения не вернёт недоступный upstream в пул.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-11",
    "group": "troubleshooting",
    "topic": "Диагностика · Маршрут",
    "text": "Linux-хост подключён к двум сетям. После изменения маршрутов SYN к известному IP сервера стал выходить через второй интерфейс, хотя по схеме нужен первый. Что проверить до изменения firewall?",
    "answers": [
      "Таймер устаревания MAC на первом коммутаторе",
      "Результат выбора маршрута к этому IP на хосте",
      "Список слушающих TCP-портов на локальном хосте",
      "Порядок записей DNS для имени этого сервера"
    ],
    "correct": [
      1
    ],
    "explanation": "Захват показывает неожиданное решение о выходном интерфейсе ещё до оценки удалённого сервиса. Сначала проверяют выбранный маршрут и исходный адрес для конкретного IP назначения. Изменение firewall не исправляет ошибочный выбор пути, а локальный список слушающих портов не определяет маршрут исходящего SYN.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-12",
    "group": "troubleshooting",
    "topic": "Диагностика · VLAN",
    "text": "Два ПК на одном коммутаторе находятся в одной VLAN и достигают шлюза через uplink. Между собой ARP не проходит; оба access-порта помечены protected, STP forwarding. Что проверить первым?",
    "answers": [
      "Сходимость маршрутов на внешнем шлюзе",
      "Наличие общего разрешения ICMP на uplink",
      "Скорость согласования двух access-портов",
      "Изоляцию protected-портов друг от друга"
    ],
    "correct": [
      3
    ],
    "explanation": "Protected-порты на поддерживающем эту функцию коммутаторе могут быть изолированы друг от друга при сохранённой связи с незащищённым uplink. Это соответствует доступному шлюзу и отсутствию прямого ARP между ПК. Изменение маршрутов шлюза не восстановит локальный обмен, который отсекается внутри коммутатора.",
    "difficulty": "applied"
  },
  {
    "id": "ts-pack1-13",
    "group": "troubleshooting",
    "topic": "Диагностика · Маршрут",
    "text": "У сервера два выхода. Основная таблица направляет клиентский IP через A, но SYN-ACK приложения с его рабочего source IP захвачен на B; есть правила маршрутизации по источнику. Что проверить первым?",
    "answers": [
      "Выбор policy rule и таблицы для рабочего source IP",
      "Приоритет и метрику маршрута основной таблицы без source IP",
      "Таймер повторов SYN-ACK на приложении",
      "Срок записи MAC клиента на выходе A"
    ],
    "correct": [
      0
    ],
    "explanation": "Для ответа важен маршрут с тем исходным адресом, который действительно использует приложение. Правило по источнику может выбрать другую таблицу раньше основной и объяснить выход через B. Изменение метрики только в основной таблице не повлияет на пакет, если он обслуживается другой таблицей.",
    "difficulty": "advanced"
  },
  {
    "id": "ts-pack1-14",
    "group": "troubleshooting",
    "topic": "Диагностика · Маршрут",
    "text": "Firewall выполняет DNAT публичного адреса на backend, сохраняя IP клиента. SYN дошёл до backend, но SYN-ACK уходит через другой шлюз и не возвращается на устройство DNAT; клиент не получает ответ от публичного IP. Что проверить первым?",
    "answers": [
      "Таймер хранения DNS-записи публичного адреса",
      "Диапазон слушающих портов на backend",
      "Обратный маршрут backend к адресу клиента",
      "Длину очереди SYN на frontend-интерфейсе"
    ],
    "correct": [
      2
    ],
    "explanation": "Ответ должен пройти через устройство с состоянием этой трансляции, чтобы клиент получил ожидаемый обратный пакет. Сохранённый IP клиента заставляет backend выбирать обратный маршрут именно к нему, поэтому проверяют шлюз и путь ответа. Изменение таймера SYN не вернёт ответ через DNAT, если он уже ушёл другим путём.",
    "difficulty": "advanced"
  },
  {
    "id": "ts-pack1-15",
    "group": "troubleshooting",
    "topic": "Диагностика · MTU",
    "text": "IPv4-проба с DF на Linux сразу завершается локальным Message too long и указанием MTU. Захват на выходном интерфейсе не видит этой пробы. Что проверить первым?",
    "answers": [
      "Фильтрацию ICMP на удалённом firewall",
      "Локальный MTU и MTU выбранного маршрута",
      "Таймер ответа ICMP на целевом сервере",
      "Потери крупных кадров на дальнем uplink"
    ],
    "correct": [
      1
    ],
    "explanation": "Проба не покинула хост, а ошибку вернул локальный стек при проверке допустимого размера. Сначала смотрят MTU выходного интерфейса и ограничения выбранного маршрута, включая сохранённые сведения о PMTU. Поиск потерь этой пробы на удалённом uplink преждевременен: в захвате подтверждено, что её туда не отправили.",
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
    "text": "После перенастройки trunk порт заблокирован с причиной PVID inconsistency. Физический Link поднят, CRC не растут. Что проверить до снятия защитной блокировки?",
    "answers": [
      "Скорость и duplex двух концов trunk",
      "Таймер устаревания записей MAC в VLAN",
      "Native VLAN/PVID и режим портов на обоих концах",
      "Приоритет root bridge и стоимость альтернативного пути"
    ],
    "correct": [
      2
    ],
    "explanation": "Причина блокировки указывает на несогласованность трактовки VLAN в служебном обмене STP. Сначала сверяют native VLAN/PVID и режимы обоих концов соединения. Смена root priority или отключение защиты не исправляет несовпадение тегированного и нетегированного обмена.",
    "difficulty": "advanced"
  },
  {
    "id": "ts-pack1-19",
    "group": "troubleshooting",
    "topic": "Диагностика · TCP",
    "text": "SYN приходит в контейнер, но возвращается RST. Внутри его network namespace нужного listener нет, тогда как ss на хосте показывает сервис на 0.0.0.0 с тем же портом. Что проверить первым?",
    "answers": [
      "Привязку сервиса к дополнительным IP хоста",
      "Запуск listener в нужном network namespace",
      "Таймер хранения записи ARP контейнера",
      "Порог очереди входящих SYN на хосте"
    ],
    "correct": [
      1
    ],
    "explanation": "Network namespace имеет собственный сетевой стек и набор сокетов. Listener на 0.0.0.0 в пространстве хоста не означает наличие listener в контейнере. Поэтому сначала проверяют размещение и запуск службы в нужном namespace, а не увеличивают очередь сокета, которого там нет.",
    "difficulty": "advanced"
  },
  {
    "id": "ts-pack1-20",
    "group": "troubleshooting",
    "topic": "Диагностика · DNS",
    "text": "У сайта есть A и AAAA. IPv4 ping проходит, приложение выбирает AAAA и получает тайм-аут TCP; принудительный IPv4-доступ к тому же сервису работает. Что проверить до правки приложения?",
    "answers": [
      "TTL записи A в кэше IPv4-резолвера",
      "Маршрут IPv4 до уже проверенного адреса",
      "TCP keepalive рабочего IPv4-соединения",
      "Адрес AAAA и IPv6-путь до него"
    ],
    "correct": [
      3
    ],
    "explanation": "IPv4 ping проверил другую семью адресов, чем неудачное TCP-подключение приложения. Сначала проверяют, верен ли AAAA и доступен ли этот адрес по IPv6 на нужном порту. Изменение IPv4-маршрута или keepalive рабочего IPv4-сеанса не объясняет отказ отдельного IPv6-пути.",
    "difficulty": "advanced"
  },
];

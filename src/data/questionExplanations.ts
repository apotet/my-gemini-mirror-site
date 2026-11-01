import { Question } from '../types/quiz';

export interface QuestionDeepDive {
  questionId: string;
  category: 'l1' | 'l2' | 'l3' | 'l4' | 'l5_l7' | 'tcpip' | 'cli' | 'visual';
  categoryLabel: string;
  categoryColor: string;
  coreConcept: string;
  deepAnalysis: string;
  commonTrap: string;
  practicalTip?: string;
  memorizationRule?: string;
  visualDiagram?: string;
  ipv4Practice?: {
    enabled: boolean;
    reason: string;
    targetPrefix?: number;
    targetMode?: 'calc' | 'trainer';
  };
  keyTakeaways: string[];
}

// Hand-crafted deep dives for critical architectural questions
const CURATED_DEEP_DIVES: Record<string, Partial<QuestionDeepDive>> = {
  // L1 Physical
  'l1-01': {
    category: 'l1',
    categoryLabel: 'L1 · Физический уровень · PDU',
    categoryColor: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30',
    coreConcept: 'Физический уровень (L1) оперирует исключительно неструктурированным потоком битов (0 и 1) в виде физических сигналов.',
    deepAnalysis: 'Анализатор физического уровня или осциллограф видит лишь уровни напряжения, оптические импульсы или радиочастотные колебания. На L1 нет концепции заголовков, адресов отправителя/получателя или контрольных сумм. Структурирование битов в кадры с преамбулой и MAC-адресами происходит только уровнем выше — на L2 (Data Link).',
    commonTrap: 'Часто путают с кадром (Frame). Кадр появляется только тогда, когда поток битов разбивается на порции с проверкой FCS (Frame Check Sequence) и MAC-адресацией.',
    memorizationRule: 'L1 = Биты (сигналы) → L2 = Кадры (MAC) → L3 = Пакеты (IP) → L4 = Сегменты (TCP) / Датаграммы (UDP) → L7 = Данные.',
    visualDiagram: `+-------------------------------------------------------+
| Уровень       | PDU (Единица данных) | Адресация       |
+---------------+----------------------+-----------------+
| L4 Транспорт  | Сегмент / Датаграмма | Порты (0-65535) |
| L3 Сетевой    | Пакет (Packet)       | IP-адреса       |
| L2 Канальный  | Кадр (Frame)         | MAC-адреса      |
| L1 Физический | Бит (Bit / Signal)   | Напряжение/Свет |
+-------------------------------------------------------+`,
    keyTakeaways: [
      'L1 не знает про IP, MAC или протоколы — только импульсы и частоты',
      'Хабы и репитеры работают на L1, поэтому они ретранслируют каждый бит во все порты без разбора',
    ],
  },

  'l1-02': {
    category: 'l1',
    categoryLabel: 'L1 · Устройства физического уровня',
    categoryColor: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30',
    coreConcept: 'Повторители (Repeaters) и концентраторы (Hubs) работают на L1, так как они просто усиливают электрический/оптический сигнал.',
    deepAnalysis: 'Концентратор (hub) не имеет процессора для парсинга Ethernet-кадров и не содержит памяти для MAC-таблицы (CAM). Получив сигнал на один порт, он физически дублирует его на все остальные порты. Это делает всю сеть единым доменом коллизий (Collision Domain), где одновременная передача двумя узлами приводит к наложению сигналов.',
    commonTrap: 'Путаница между Hub (L1, глупый размножитель сигнала) и Switch (L2, умный коммутатор, разделяющий домены коллизий по MAC-адресам).',
    practicalTip: 'В современных сетях хабы полностью вытеснены L2-коммутаторами. Для зеркалирования трафика вместо хабов используют SPAN/Port Mirroring или сетевые TAP-ответвители.',
    keyTakeaways: [
      'Hub = единый домен коллизий на все порты',
      'Switch = каждый порт является отдельным изолированным доменом коллизий',
    ],
  },

  // L2 Data Link
  'l2-01': {
    category: 'l2',
    categoryLabel: 'L2 · Канальный уровень · PDU',
    categoryColor: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
    coreConcept: 'Единицей данных канального уровня (Data Link Layer) является Кадр (Frame).',
    deepAnalysis: 'Кадр Ethernet обрамляет сетевой пакет IP заголовком (MAC получателя, MAC отправителя, EtherType) и завершающей контрольной суммой FCS (CRC-32). Если контрольная сумма в трейлере не сходится с вычисленной, сетевая карта отбрасывает поврежденный кадр еще до передачи в ОС.',
    commonTrap: 'Смешение терминов «пакет» и «кадр». Пакет — это L3 (IP), а кадр — это L2 (Ethernet/Wi-Fi).',
    visualDiagram: `+---------------- Ethernet Frame (Кадр L2) ----------------+
| Dst MAC (6B) | Src MAC (6B) | 802.1Q (опц.) | EtherType (2B) |
+-------------------------------------------------------------+
|               PAYLOAD (L3 IP-пакет, 46-1500B)               |
+-------------------------------------------------------------+
|                      FCS / CRC32 (4B)                       |
+-------------------------------------------------------------+`,
    keyTakeaways: [
      'Минимальный размер кадра Ethernet — 64 байта (с преамбулой 72 байта)',
      'Максимальный размер стандартного payload — 1500 байт (MTU)',
    ],
  },

  'l2-03': {
    category: 'l2',
    categoryLabel: 'L2 · Коммутация и CAM-таблица',
    categoryColor: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
    coreConcept: 'Коммутатор изучает MAC-адреса исключительно по полю Source MAC входящих кадров.',
    deepAnalysis: 'Когда кадр приходит на порт коммутатора, микросхема ASIC смотрит на Source MAC и связывает его с этим входящим портом в CAM-таблице (Content Addressable Memory). Затем коммутатор смотрит на Destination MAC: если он известен в таблице — кадр отправляется строго в нужный порт (Unicast). Если неизвестен — выполняется Unknown Unicast Flooding (рассылка во все порты, кроме входящего).',
    commonTrap: 'Ошибочно полагать, что коммутатор изучает адреса по Destination MAC. Destination MAC используется только для принятия решения о пересылке (Forwarding), а не для обучения.',
    practicalTip: 'В CLI Cisco/Linux используйте `show mac address-table` или `bridge fdb show` для просмотра изученных пар порт-MAC.',
    keyTakeaways: [
      'Обучение: по адресу отправителя (Source MAC)',
      'Пересылка: по адресу получателя (Destination MAC)',
    ],
  },

  'l2-07': {
    category: 'l2',
    categoryLabel: 'L2 · Виртуальные сети VLAN (802.1Q)',
    categoryColor: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
    coreConcept: 'VLAN делит один физический коммутатор на изолированные широковещательные домены на канальном уровне.',
    deepAnalysis: 'Без маршрутизатора (или L3-коммутатора) хосты в разных VLAN не могут общаться, даже если у них адреса из одной подсети. Стандарт IEEE 802.1Q добавляет в заголовок кадра 4-байтный тег: 2 байта TPID (0x8100) и 2 байта TCI (3 бита приоритета PCP, 1 бит DEI и 12 бит VLAN ID, что дает от 1 до 4094 доступных VLAN).',
    commonTrap: 'Полагать, что VLAN работает на L3. VLAN — это чистый L2 механизм сегментации трафика и разграничения broadcast-доменов.',
    visualDiagram: `802.1Q Tag (4 байта):
[ TPID: 0x8100 (16 бит) ] 
[ PCP: Priority (3b) | DEI: Drop (1b) | VID: VLAN ID (12 бит, 1-4094) ]`,
    keyTakeaways: [
      'Access-порт: передает нетегированные кадры конечному хосту',
      'Trunk-порт: передает кадры нескольких VLAN с 802.1Q тегами между свитчами',
    ],
  },

  // L3 Network
  'l3-01': {
    category: 'l3',
    categoryLabel: 'L3 · Сетевой уровень · TTL и ICMP',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'При получении пакета с TTL=1 маршрутизатор уменьшает его до 0, уничтожает пакет и отправляет источнику ICMP Time Exceeded (Type 11).',
    deepAnalysis: 'Поле TTL (Time to Live) размером 8 бит предотвращает бесконечное блуждание пакетов по сети при петлях маршрутизации. Каждый транзитный маршрутизатор обязан уменьшить TTL минимум на 1 (декремент). Если TTL становится равным 0, пакет дальше не передается. На этом же механизме построена работа утилиты `traceroute`, которая отправляет пакеты с TTL=1, 2, 3...',
    commonTrap: 'Думать, что пакет дойдет до получателя, если у него TTL=1. Маршрутизатор декрементирует TTL ДО пересылки в следующий интерфейс!',
    practicalTip: 'Если пинг возвращает «Time to live exceeded», проверьте таблицу маршрутизации на наличие взаимной петли между соседними узлами.',
    memorizationRule: 'TTL декрементируется роутером. TTL=0 → DROP + ICMP Type 11 (Time Exceeded).',
    keyTakeaways: [
      'Предотвращает зацикливание пакетов в топологии',
      'Основа алгоритма работы traceroute / mtr',
    ],
  },

  'l3-02': {
    category: 'l3',
    categoryLabel: 'L3 · Заголовок IPv4 · Поле Protocol',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'В заголовке IPv4 номер протокола указывает, какому протоколу L4 передать полезную нагрузку: 1 = ICMP, 6 = TCP, 17 = UDP, 89 = OSPF.',
    deepAnalysis: 'Поле Protocol (8 бит) в заголовке IPv4 необходимо стеку TCP/IP на принимающем хосте для демультиплексирования. Увидев число 6, ядро ОС отдает данные модулю TCP; увидев 17 — модулю UDP; увидев 1 — модулю ICMP.',
    commonTrap: 'Путать номер протокола в IP-заголовке (Protocol Number) и номера портов TCP/UDP (Port Numbers). Номер протокола — это поле IP (L3), а порты живут внутри заголовков L4.',
    memorizationRule: 'ICMP = 1 | TCP = 6 | UDP = 17 | GRE = 47 | ESP = 50 | OSPF = 89.',
    keyTakeaways: [
      'TCP = 6',
      'UDP = 17',
      'ICMP = 1',
    ],
  },

  'l3-04': {
    category: 'l3',
    categoryLabel: 'L3 · Маршрутизация · Маршрут по умолчанию',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Маршрут 0.0.0.0/0 (Default Gateway / Шлюз последней надежды) совпадает с любым IPv4-адресом и используется, если более точного маршрута нет.',
    deepAnalysis: 'Префикс /0 означает, что для совпадения проверяется 0 бит IP-адреса, то есть любой возможный адрес назначения подойдет. Согласно правилу Longest Prefix Match, маршрутизатор сначала ищет более длинные префиксы (/32 хостовой, /24 подсеть, /16 агрегат). Если совпадений нет — пакет уходит на шлюз 0.0.0.0/0.',
    commonTrap: 'Считать 0.0.0.0/0 широковещательным адресом. 0.0.0.0/0 — это обозначение "любой сети" в правилах маршрутизации и фаерволах.',
    practicalTip: 'В Linux проверяется командой `ip route show` (строка начинается со слова `default via ...`).',
    keyTakeaways: [
      'Шлюз по умолчанию имеет наименьший приоритет длины маски (/0)',
      'Если нет шлюза по умолчанию и нет точного маршрута, роутер шлет ICMP Destination Net Unreachable',
    ],
  },

  'l3-05': {
    category: 'l3',
    categoryLabel: 'L3 · Маршрутизация · Longest Prefix Match',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Маршрутизатор ВСЕГДА выбирает маршрут с наиболее длинной маской (наиболее специфичный префикс).',
    deepAnalysis: 'Если в таблице маршрутизации для адреса 10.0.5.20 есть варианты 10.0.0.0/16 via A и 10.0.5.0/24 via B, пакет пойдет через B, потому что маска /24 длиннее (24 совпадающих бита против 16). Метрика и административная дистанция учитываются только между маршрутами с ОДИНАКОВОЙ длиной префикса!',
    commonTrap: 'Ошибочно смотреть на метрику до длины маски. Длина маски превалирует над метрикой.',
    memorizationRule: 'Longest Prefix Match (наибольшее число бит маски) всегда побеждает.',
    keyTakeaways: [
      '/32 (хост) бьет /24 (подсеть), /24 бьет /16, /16 бьет default /0',
      'Специфичность — главный критерий выбора маршрута в FIB',
    ],
  },

  // Subnet Calculation Questions - LINKED TO IPv4 TRAINER!
  'l3-06': {
    category: 'l3',
    categoryLabel: 'L3 · Маски подсети IPv4',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Маска /24 содержит 24 единичных бита подряд, что соответствует десятичному виду 255.255.255.0.',
    deepAnalysis: 'IPv4-адрес состоит из 32 бит. Первые 24 бита отданы под адрес сети (3 октета по 8 единиц: 11111111.11111111.11111111.00000000), а последние 8 бит — под адреса хостов ($2^8 = 256$ адресов всего, 254 доступно для назначения хостам).',
    commonTrap: 'Путать количество хостов (254) и общее число адресов с учетом сети и broadcast (256).',
    ipv4Practice: {
      enabled: true,
      reason: 'Маска /24 — базовый стандарт. Попробуйте рассчитать диапазон хостов и маску в тренажёре.',
      targetPrefix: 24,
      targetMode: 'calc',
    },
    keyTakeaways: [
      '/24 = 255.255.255.0',
      'Всего адресов: 256, доступных хостов: 254',
    ],
  },

  'l3-07': {
    category: 'l3',
    categoryLabel: 'L3 · Двоичный расчет октетов маски',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Октет 11111100 в двоичной системе равен 252 в десятичной (128 + 64 + 32 + 16 + 8 + 4 = 252).',
    deepAnalysis: 'Позиционные веса 8 бит октета: 128, 64, 32, 16, 8, 4, 2, 1. Для 11111100 сложим первые 6 степеней двойки: $255 - 2 - 1 = 252$. Это соответствует маске /30 (24 + 6 = 30 бит). Шаг такой подсети равен $256 - 252 = 4$ адреса.',
    commonTrap: 'Арифметическая ошибка при сложении степеней двойки. Проще вычитать нулевые биты: $255 - (2 + 1) = 252$.',
    memorizationRule: '128 → 192 → 224 → 240 → 248 → 252 → 254 → 255 (шаги: 128, 64, 32, 16, 8, 4, 2, 1).',
    ipv4Practice: {
      enabled: true,
      reason: 'Отработайте перевод октетов между двоичной и десятичной системами в интерактивном режиме.',
      targetPrefix: 30,
      targetMode: 'trainer',
    },
    keyTakeaways: [
      '11111100 = 252',
      'В подсети /30 доступно всего 2 хоста (линки точка-точка)',
    ],
  },

  'l3-08': {
    category: 'l3',
    categoryLabel: 'L3 · Расчет адреса подсети (/26)',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Для IP 192.168.10.70/26 адрес сети равен 192.168.10.64.',
    deepAnalysis: 'Префикс /26 означает, что в 4-м октете маски занято 2 бита (11000000 = 192). Шаг подсети (Magic Number) равен $256 - 192 = 64$. Подсети идут с шагом 64: .0, .64, .128, .192. Адрес 70 попадает в диапазон от 64 до 127. Следовательно, адрес сети — 192.168.10.64.',
    commonTrap: 'Ошибочно считать адресом сети .0. В разбитой на подсети сети .0 — лишь первая из четырех подсетей.',
    memorizationRule: 'Magic Number = 256 - Маска интересного октета. Для /26: 256 - 192 = 64. Сетки: 0, 64, 128, 192.',
    ipv4Practice: {
      enabled: true,
      reason: 'Проверьте расчет адреса сети, первого хоста и broadcast для маски /26 в калькуляторе.',
      targetPrefix: 26,
      targetMode: 'calc',
    },
    keyTakeaways: [
      'Маска /26 = 255.255.255.192 (шаг 64)',
      'Сеть для .70: 192.168.10.64, первый хост: .65, последний: .126, broadcast: .127',
    ],
  },

  'l3-09': {
    category: 'l3',
    categoryLabel: 'L3 · Расчет Broadcast-адреса (/26)',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Для подсети 192.168.10.64/26 широковещательный адрес (Broadcast) равен 192.168.10.127.',
    deepAnalysis: 'Broadcast — это последний адрес в диапазоне подсети, где все биты хостовой части равны единицам. Поскольку шаг подсети равен 64, следующая подсеть начнется с адреса 192.168.10.128. Адрес прямо перед ней (128 - 1 = 127) и является широковещательным.',
    commonTrap: 'Путаница между последним адресом хоста (.126) и широковещательным адресом (.127). Хост не может иметь broadcast-адрес!',
    ipv4Practice: {
      enabled: true,
      reason: 'Закрепите навык мгновенного нахождения broadcast-адреса по шагу подсети.',
      targetPrefix: 26,
      targetMode: 'calc',
    },
    keyTakeaways: [
      'Broadcast = Адрес следующей сети - 1',
      'Для сети .64/26 broadcast равен 192.168.10.127',
    ],
  },

  'l3-10': {
    category: 'l3',
    categoryLabel: 'L3 · Количество пригодных хостов (/27)',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Подсеть /27 содержит 30 пригодных для назначения адресов хостов ($2^{32-27} - 2 = 32 - 2 = 30$).',
    deepAnalysis: 'Всего в IPv4 32 бита. При маске /27 на хостовую часть остается $32 - 27 = 5$ бит. Число возможных комбинаций: $2^5 = 32$. Вычитаем 2 зарезервированных адреса (адрес самой сети, где все биты 0, и broadcast, где все биты 1). Итого: $32 - 2 = 30$ хостов.',
    commonTrap: 'Забыть вычесть 2 адреса (сеть и broadcast) и ответить 32.',
    memorizationRule: 'Формула хостов: 2^(32 - Prefix) - 2. Для /27: 2^5 - 2 = 32 - 2 = 30 хостов.',
    ipv4Practice: {
      enabled: true,
      reason: 'Потренируйте быстрый расчет хостов для масок от /24 до /30 в тренажёре.',
      targetPrefix: 27,
      targetMode: 'trainer',
    },
    keyTakeaways: [
      '/27: 32 всего, 30 полезных',
      '/28: 16 всего, 14 полезных',
      '/29: 8 всего, 6 полезных',
      '/30: 4 всего, 2 полезных',
    ],
  },

  // L4 Transport
  'l4-02': {
    category: 'l4',
    categoryLabel: 'L4 · Транспортный уровень · 3-Way Handshake TCP',
    categoryColor: 'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30',
    coreConcept: 'Установка TCP-соединения происходит строго в 3 шага: SYN → SYN+ACK → ACK.',
    deepAnalysis: 'Клиент отправляет пакет с флагом SYN и случайным начальным номером последовательности ISN (Initial Sequence Number). Сервер подтверждает получение флагом ACK (увеличивая номер на 1) и синхронизирует свой поток флагом SYN со своим ISN. Клиент завершает рукопожатие отправкой ACK. Соединение переходит в состояние ESTABLISHED.',
    commonTrap: 'Путать порядок флагов. Сервер отвечает не просто ACK, а ОБЯЗАТЕЛЬНО комбинацией SYN+ACK!',
    memorizationRule: '1) Привет, давай свяжемся (SYN) 2) Привет, согласен, а ты готов? (SYN-ACK) 3) Да, готов, погнали (ACK).',
    visualDiagram: `Client                               Server
  |                                     |
  | -------- 1. [SYN, Seq=x] ---------> | (LISTEN -> SYN_RCVD)
  |                                     |
  | <--- 2. [SYN+ACK, Seq=y, Ack=x+1] - |
  |                                     |
  | ------- 3. [ACK, Ack=y+1] --------> |
  v                                     v
(ESTABLISHED)                       (ESTABLISHED)`,
    keyTakeaways: [
      'SYN расходует 1 номер в пространстве Sequence Number',
      'Защищает от дублирования старых пакетов из прошлых сессий',
    ],
  },

  'l4-03': {
    category: 'l4',
    categoryLabel: 'L4 · TCP vs UDP · Контроль перегрузок',
    categoryColor: 'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30',
    coreConcept: 'TCP обеспечивает гарантированную доставку, упорядочивание и контроль перегрузки; UDP передает дейтаграммы без гарантий и без задержек на подтверждения.',
    deepAnalysis: 'UDP имеет фиксированный минимальный заголовок всего 8 байт (Source Port, Dest Port, Length, Checksum) против минимум 20 байт у TCP. В UDP нет механизма повторных передач (Retransmission) и нет окна перегрузки (Congestion Window), поэтому он идеален для real-time трафика (VoIP, видеостриминг, онлайн-игры, DNS), где потеря пакета лучше, чем задержка очереди.',
    commonTrap: 'Считать UDP «плохим или ненадежным». UDP спроектирован для минимизации задержек; надежность при необходимости реализуется на прикладном уровне (как в QUIC/HTTP3).',
    visualDiagram: `+-----------------------+-----------------------+
| Свойство             | TCP                   | UDP                   |
+-----------------------+-----------------------+-----------------------+
| Соединение            | Connection-Oriented   | Connectionless        |
| Надежность            | Гарантия ACK + Retran | Без подтверждений     |
| Размер заголовка      | 20-60 байт            | 8 байт (фиксированно) |
| Порядок доставки      | Строго по Seq Number  | Не гарантируется      |
+-----------------------+-----------------------+-----------------------+`,
    keyTakeaways: [
      'TCP: надёжно, медленнее, контролирует поток',
      'UDP: быстро, без оверхеда, без состояний рукопожатия',
    ],
  },

  // L5-L7 Application
  'l7-02': {
    category: 'l5_l7',
    categoryLabel: 'L7 · Протокол DHCP · Процесс DORA',
    categoryColor: 'from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30',
    coreConcept: 'Получение адреса по DHCP происходит по алгоритму DORA: Discover → Offer → Request → Acknowledge.',
    deepAnalysis: '1) Discover: клиент шлет broadcast на L2 и L3 (Dst IP 255.255.255.255, UDP port 67) в поисках серверов. 2) Offer: DHCP-сервер предлагает IP-адрес. 3) Request: клиент подтверждает broadcast-запросом, что выбрал именно этот сервер. 4) Acknowledge (ACK): сервер подтверждает аренду (Lease Time) и передает маску, шлюз и DNS.',
    commonTrap: 'Забыть мнемонику DORA или перепутать порядок Offer и Request.',
    memorizationRule: 'D - Discover | O - Offer | R - Request | A - Acknowledge (D-O-R-A).',
    visualDiagram: `Client (0.0.0.0:68)                 DHCP Server (Port 67)
  |                                          |
  | -- 1. DHCP Discover (Broadcast) -------> |
  |                                          |
  | <---- 2. DHCP Offer (Unicast/Bcast) ---- |
  |                                          |
  | -- 3. DHCP Request (Broadcast) --------> |
  |                                          |
  | <---- 4. DHCP ACK (Unicast/Bcast) ------ |
  v                                          v`,
    keyTakeaways: [
      'DHCP работает поверх UDP (порт 67 сервер, порт 68 клиент)',
      'Client шлет Discover с IP 0.0.0.0 на broadcast 255.255.255.255',
    ],
  },

  'l7-04': {
    category: 'l5_l7',
    categoryLabel: 'L7 · DNS · Рекурсия и типы записей',
    categoryColor: 'from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30',
    coreConcept: 'DNS преобразует человекочитаемые доменные имена в IP-адреса. Запись A хранит IPv4, AAAA — IPv6, CNAME — канонический псевдоним.',
    deepAnalysis: 'DNS-запросы стандартно отправляются по UDP на порт 53 для скорости. Однако, если размер ответа превышает 512 байт (или при трансфере зон AXFR), DNS переключается на TCP порт 53. В рекурсивном запросе локальный резолвер берет на себя обход корневых серверов (Root .), серверов зоны (TLD .ru) и авторитативных серверов домена.',
    commonTrap: 'Считать, что DNS работает ТОЛЬКО по UDP. При ответах > 512 байт или DNSSEC/AXFR используется TCP 53!',
    practicalTip: 'В терминале проверяйте командой `dig domain.com +trace` или `nslookup -type=any domain.com`.',
    keyTakeaways: [
      'A = IPv4, AAAA = IPv6, CNAME = Alias, MX = Mail, PTR = Reverse IP-to-Domain',
      'Порт 53 UDP (для обычных запросов) и TCP (для больших ответов и AXFR)',
    ],
  },
};

// Intelligent generator for question deep dive analysis
export function getQuestionDeepDive(question: Question): QuestionDeepDive {
  if (CURATED_DEEP_DIVES[question.id]) {
    const curated = CURATED_DEEP_DIVES[question.id];
    return {
      questionId: question.id,
      category: curated.category || detectCategory(question),
      categoryLabel: curated.categoryLabel || question.topic,
      categoryColor: curated.categoryColor || getCategoryColor(detectCategory(question)),
      coreConcept: curated.coreConcept || extractCoreConcept(question),
      deepAnalysis: curated.deepAnalysis || question.explanation,
      commonTrap: curated.commonTrap || detectCommonTrap(question),
      practicalTip: curated.practicalTip || question.remember,
      memorizationRule: curated.memorizationRule || question.remember,
      visualDiagram: curated.visualDiagram,
      ipv4Practice: curated.ipv4Practice || detectIpv4Practice(question),
      keyTakeaways: curated.keyTakeaways || [
        question.explanation.slice(0, 80) + '...',
        'Проверьте правильный ответ перед повторным тестированием',
      ],
    };
  }

  // Automated smart analysis for all other 490+ questions
  const category = detectCategory(question);
  const ipv4Practice = detectIpv4Practice(question);
  const trap = detectCommonTrap(question);
  const diagram = generateDiagramForQuestion(question, category);

  return {
    questionId: question.id,
    category,
    categoryLabel: question.topic,
    categoryColor: getCategoryColor(category),
    coreConcept: extractCoreConcept(question),
    deepAnalysis: enrichExplanation(question, category),
    commonTrap: trap,
    practicalTip: question.remember || getPracticalTip(question, category),
    memorizationRule: question.remember,
    visualDiagram: diagram,
    ipv4Practice,
    keyTakeaways: generateKeyTakeaways(question, category),
  };
}

function detectCategory(q: Question): QuestionDeepDive['category'] {
  if (q.group === 'visual-l1') return 'visual';
  if (q.group === 'troubleshooting' || q.topic.includes('Диагностика')) return 'cli';
  if (q.group === 'tcpip' || q.topic.includes('TCP/IP') || q.topic.includes('Инкапсуляция')) return 'tcpip';
  if (q.group === 'l4' || q.topic.includes('L4') || q.topic.includes('TCP') || q.topic.includes('UDP')) return 'l4';
  if (q.group === 'l5-l7' || q.topic.includes('L5') || q.topic.includes('L7') || q.topic.includes('DNS') || q.topic.includes('DHCP') || q.topic.includes('HTTP')) return 'l5_l7';
  if (q.group === 'l3' || q.topic.includes('L3') || q.topic.includes('IPv4') || q.topic.includes('Маски') || q.topic.includes('Подсети')) return 'l3';
  if (q.group === 'l1-l2') {
    if (q.topic.includes('L1') || q.topic.includes('Оптика') || q.topic.includes('Физический')) return 'l1';
    return 'l2';
  }
  return 'l3';
}

function getCategoryColor(category: QuestionDeepDive['category']): string {
  switch (category) {
    case 'l1':
      return 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30';
    case 'l2':
      return 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30';
    case 'l3':
      return 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30';
    case 'l4':
      return 'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30';
    case 'l5_l7':
      return 'from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30';
    case 'tcpip':
      return 'from-violet-500/20 to-purple-500/10 text-violet-300 border-violet-500/30';
    case 'cli':
      return 'from-lime-500/20 to-emerald-500/10 text-lime-300 border-lime-500/30';
    case 'visual':
      return 'from-fuchsia-500/20 to-indigo-500/10 text-fuchsia-300 border-fuchsia-500/30';
    default:
      return 'from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/30';
  }
}

// Selective linking to IPv4 trainer: only where subnet math is actually beneficial!
function detectIpv4Practice(q: Question): QuestionDeepDive['ipv4Practice'] | undefined {
  const isSubnetMath =
    q.topic.includes('Маски') ||
    q.topic.includes('Подсети') ||
    q.topic.includes('Биты маски') ||
    q.family?.startsWith('subnet-') ||
    q.family?.startsWith('gen-bin-dec') ||
    q.family?.startsWith('gen-dec-bin') ||
    q.text.includes('пригодных адресов') ||
    q.text.includes('broadcast') ||
    q.text.includes('адрес сети у');

  // Skip conceptual questions like TTL, NAT, Protocol number 6, Default route concept
  const isPureTheory =
    q.text.includes('TTL') ||
    q.text.includes('NAT') ||
    q.text.includes('протокол имеет номер') ||
    q.text.includes('шлюз по умолчанию') ||
    q.text.includes('0.0.0.0/0') ||
    q.text.includes('ICMP');

  if (isSubnetMath && !isPureTheory) {
    let targetPrefix = 24;
    const match = q.text.match(/\/(\d{2})/);
    if (match) {
      targetPrefix = parseInt(match[1], 10);
    } else if (q.family?.includes('26')) targetPrefix = 26;
    else if (q.family?.includes('27')) targetPrefix = 27;
    else if (q.family?.includes('28')) targetPrefix = 28;
    else if (q.family?.includes('29')) targetPrefix = 29;
    else if (q.family?.includes('30')) targetPrefix = 30;

    return {
      enabled: true,
      reason: `В этом вопросе проверяется навык расчёта маски /${targetPrefix}. Отработайте математику подсетей в интерактивном тренажёре.`,
      targetPrefix,
      targetMode: q.text.includes('двоич') || q.text.includes('октет') ? 'trainer' : 'calc',
    };
  }

  return undefined;
}

function extractCoreConcept(q: Question): string {
  const correctAnswersText = q.correct.map((idx) => q.answers[idx]).join('; ');
  return `Правильный ответ: «${correctAnswersText}». Ключевой принцип темы «${q.topic}».`;
}

function enrichExplanation(q: Question, category: QuestionDeepDive['category']): string {
  if (q.explanation && q.explanation.length > 80) {
    return q.explanation;
  }

  switch (category) {
    case 'l1':
      return `${q.explanation} Физический уровень отвечает за передачу неструктурированного битового потока через физическую среду передачи (медь, оптику, радиоканал), характеристики сигналов и типы разъемов.`;
    case 'l2':
      return `${q.explanation} Канальный уровень обеспечивает адресацию внутри одного локального сегмента по MAC-адресам, проверку целостности кадров (FCS CRC-32) и разграничение broadcast-доменов через VLAN.`;
    case 'l3':
      return `${q.explanation} Сетевой уровень выполняет сквозную маршрутизацию пакетов между различными сегментами сетей с помощью логических IP-адресов и таблиц пересылки (FIB/RIB).`;
    case 'l4':
      return `${q.explanation} Транспортный уровень отвечает за взаимодействие между конкретными процессами операционной системы через номера портов (0–65535) и управление потоком данных.`;
    case 'l5_l7':
      return `${q.explanation} Прикладной уровень предоставляет стандартизированные протоколы и интерфейсы для взаимодействия пользовательских приложений и сетевых сервисов.`;
    case 'cli':
      return `${q.explanation} Для надежной сетевой диагностики всегда важно локализовать уровень неисправности по модели OSI: от физики кабеля до L7-приложений.`;
    case 'visual':
      return `${q.explanation} Внимание к маркировке, типу волокна (SMF 9/125 vs MMF 50/125) и типу полировки коннекторов (UPC синий vs APC зеленый) критично при монтаже ВОЛС и СКС.`;
    default:
      return q.explanation;
  }
}

function detectCommonTrap(q: Question): string {
  if (q.text.includes('маск') || q.text.includes('хост')) {
    return 'Частая ошибка: забывают вычесть 2 зарезервированных адреса (адрес подсети и broadcast) или путают шаг подсети с количеством хостов.';
  }
  if (q.text.includes('кадр') || q.text.includes('пакет') || q.text.includes('сегмент')) {
    return 'Типичная путаница терминов PDU: кадр (L2 Ethernet) часто ошибочно называют пакетом (L3 IP), а сегмент (L4 TCP) — датаграммой.';
  }
  if (q.text.includes('коммутатор') || q.text.includes('switch')) {
    return 'Распространенное заблуждение: коммутатор обучается по Destination MAC, хотя на самом деле он смотрит только на Source MAC входящего кадра.';
  }
  if (q.text.includes('TTL')) {
    return 'Ошибочно полагают, что при TTL=1 пакет дойдет до получателя. Маршрутизатор декрементирует TTL ПЕРЕД пересылкой, поэтому пакет отбрасывается.';
  }
  if (q.text.includes('TCP') || q.text.includes('UDP')) {
    return 'Путаница между флагами и надежностью: думают, что UDP вообще не проверяет ошибки (хотя у него есть контрольная сумма Checksum) или забывают про SYN+ACK.';
  }
  if (q.group === 'visual-l1' || q.topic.includes('Оптика')) {
    return 'Опасная ошибка в монтаже: соединение коннекторов UPC (синий, прямой торец) и APC (зеленый, скос 8 градусов) приводит к сколу оптического волокна!';
  }
  return 'Обратите внимание на точные формулировки стандартов и исключения из общих правил.';
}

function getPracticalTip(q: Question, category: QuestionDeepDive['category']): string {
  switch (category) {
    case 'cli':
      return 'В боевых условиях всегда проверяйте статус линка (L1/L2) перед диагностикой маршрутов или DNS.';
    case 'l3':
      return 'Команда `ip route show` в Linux или `route print` в Windows быстро отображает порядок метрик и активные шлюзы.';
    case 'l4':
      return 'Утилита `ss -tulpn` моментально показывает слушающие сокеты, PID процессов и связанные порты.';
    case 'l2':
      return 'Таблица CAM очищается по тайм-ауту (обычно 300 секунд), если узел долго не отправляет кадры.';
    default:
      return 'Запомните фундаментальный принцип: каждый уровень модели OSI решает строго свою задачу и инкапсулирует вышележащий PDU.';
  }
}

function generateDiagramForQuestion(q: Question, category: QuestionDeepDive['category']): string | undefined {
  if (q.topic.includes('Подсети') || q.topic.includes('Маски')) {
    return `+-------------------------------------------------------------+
| Формула подсетей: Шаг (Magic Number) = 256 - Маска октета   |
| Хостов в подсети = 2^(32 - Префикс) - 2                     |
+-------------------------------------------------------------+`;
  }
  if (q.topic.includes('TCP') || q.topic.includes('Handshake')) {
    return `Client                  Server
  | ----- 1. [SYN] ------> |
  | <--- 2. [SYN+ACK] ---- |
  | ----- 3. [ACK] ------> |`;
  }
  if (q.topic.includes('Единицы данных') || q.topic.includes('PDU')) {
    return `[ L7 Данные ] -> [ L4 Сегмент TCP/UDP ] -> [ L3 IP-пакет ] -> [ L2 Кадр Ethernet ] -> [ L1 Биты ]`;
  }
  return undefined;
}

function generateKeyTakeaways(q: Question, category: QuestionDeepDive['category']): string[] {
  const correctAnswersText = q.correct.map((idx) => q.answers[idx]).join(', ');
  return [
    `Правильный ответ: ${correctAnswersText}`,
    `Тематический блок: ${q.topic}`,
    category === 'l3' && q.text.includes('/')
      ? 'Расчёт маски и хостов автоматизирован в разделе IPv4-тренажёра'
      : 'Внимательно проверяйте модель OSI и соответствие стандартам',
  ];
}

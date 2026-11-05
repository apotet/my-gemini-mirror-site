/** Individual deep dives for applied-level items in EXTRA packs + critical base overrides. */
export const APPLIED_INDIVIDUAL_DEEP: Record<
  string,
  { brief: string; deep: string; trap?: string; next?: string }
> = {
  // Override corrupted / weak base explanations
  'review-osi-34': {
    brief:
      'В TCP/IP нет отдельного сеансового (L5) модуля: его функции выполняет само приложение и прикладные протоколы.',
    deep: `Суть. Модель OSI для учёбы выделяет L5 (сеанс), L6 (представление), L7 (прикладной). Стек TCP/IP pragmatic: поверх Transport сразу Application.

Как это работает. Диалог, «сессия», кодировки, прикладная логика живут в коде приложения (или в HTTP/SSH/SMTP и т.п.), а не в отдельном системном L5-слое.

Пример. Браузер и веб-сервер ведут HTTPS-сессию средствами TLS+HTTP, без отдельного «Session Layer daemon».

Типичная ошибка. Считать, что в TCP/IP L5 «совпадает с транспортом» или что маршрутизаторы делают сеансы на каждом hop.

Проверка. В дампе видны TCP/UDP и сразу прикладной протокол — промежуточного «L5 header» нет.`,
    trap: 'Путать учебное деление OSI с реальным TCP/IP stack.',
    next: 'Теория: OSI & TCP/IP',
  },
  'tcpip-x18': {
    brief:
      'End-to-end principle: сложную надёжность и смысл данных обеспечивают конечные узлы; сеть в основном доставляет пакеты.',
    deep: `Суть. Интернет спроектирован так, что ядро сети остаётся относительно простым (forwarding), а интеллект — на концах (хостах и приложениях).

Как это работает. IP не гарантирует доставку и порядок. Если нужна надёжность — её даёт TCP (или приложение поверх UDP): повторы, порядок, контроль потока. Маршрутизаторы по пути обычно не восстанавливают ваш byte-stream.

Практический пример. Файл по TCP: потеря пакета на магистрали → ретрансмит делают конечные стеки TCP, а не «каждый роутер заново собирает файл».

Что это НЕ значит. Не запрет middlebox (NAT, firewall) — но базовая модель именно end-to-end.

Типичная ошибка. Путать с Ethernet cut-through/store-and-forward (это про коммутацию кадра на L2) или со split horizon (маршрутизация).

Запомнить. Сеть двигает пакеты; смысл и надёжность сессии — на концах.`,
    trap: 'Сводить ответ к cut-through или store-and-forward — это не end-to-end principle.',
    next: 'Теория: TCP reliability; troubleshooting retransmits',
  },

  'tcpip-x06': {
    brief: 'Приём: сначала L2 (Ethernet), затем IP, затем TCP/UDP, потом приложение.',
    deep: `Механизм. Декапсуляция снизу вверх: FCS/MAC → ethertype → IP → protocol → ports.
Пример. Кадр на NIC → драйвер/L2 → IP stack → сокет.
Диагностика. tcpdump -e -n; слои в Wireshark.
Ошибка. Думать, что HTTP «сразу» виден без L2/L3.`,
    next: 'Теория: инкапсуляция TCP/IP',
  },
  'tcpip-x09': {
    brief: 'ICMP — Internet Layer рядом с IP (не Transport).',
    deep: `Механизм. ICMP в IP (proto 1): unreachable, echo, time exceeded.
Диагностика. ping/traceroute; фильтр icmp.
Ошибка. Относить ICMP к TCP/UDP.`,
  },
  'tcpip-x14': {
    brief: 'DF=1 и размер > MTU → drop, часто ICMP Fragmentation Needed/PTB.',
    deep: `Пример. VPN снижает MTU; PMTUD ломается при filter ICMP.
Диагностика. ping с DF; проверка ICMP type 3 code 4.
Ошибка. «Всегда фрагментируется» при DF=1.`,
    next: 'troubleshooting PMTUD',
  },
  'tcpip-x20': {
    brief: 'Минимальный IPv4 header без опций — 20 байт.',
    deep: `IHL≥5 → 20 bytes. TCP min 20; UDP 8; Ethernet 14 (+FCS).
Ошибка. Путать с IPv6 fixed 40.`,
  },
  'tcpip-x23': {
    brief: 'IP — best-effort: без гарантий доставки, порядка и уникальности.',
    deep: `Потери компенсирует TCP/app, не сам IP.
Ошибка. Приписывать IP семантику TCP.`,
  },
  'tcpip-x24': {
    brief: 'DHCP — Application поверх UDP 67/68, не замена IP.',
    deep: `Клиент/сервер UDP; опции конфигурации.
Ошибка. Считать DHCP «сетевым уровнем вместо IP».`,
  },
  'tcpip-x26': {
    brief: 'На hop: TTL−1 и новая L2-инкапсуляция; IP src/dst обычно те же (без NAT).',
    deep: `Router rewrite MAC to next-hop.
Ошибка. Думать, что TCP ports меняет каждый роутер.`,
  },
  'tcpip-x27': {
    brief: 'NAT — стык private/public (часто L3+L4 ports).',
    deep: `Перепись адресов/портов, state table. PAT overload на edge.
Ошибка. Сводить NAT только к VLAN tagging.`,
  },
  'tcpip-x28': {
    brief: 'TCP/IP — pragmatic стек интернета; OSI — эталонная модель ролей.',
    deep: `Инженер диагностирует «по OSI», пакеты живут в TCP/IP.
Ошибка. Требовать «строго 7 уровней» у TCP/IP.`,
  },
  'l57-x02': {
    brief: 'Рекурсивный резолвер сам обходит цепочку NS от имени клиента.',
    deep: `Root → TLD → authoritative; кэш. Не путать с authoritative-only.`,
  },
  'l57-x04': {
    brief: 'GET безопасный; не должен менять состояние при повторе (в идеале).',
    deep: `Safe methods RFC; idempotent PUT/DELETE отдельно.
Ошибка. Считать POST «всегда безопасным».`,
  },
  'l57-x07': {
    brief: 'DHCP client UDP/68, server UDP/67.',
    deep: `DORA на L2 broadcast domain (или relay). Не путать с DNS/53.`,
  },
  'l57-x08': {
    brief: 'Клиент подтверждает offer через DHCPREQUEST.',
    deep: `DORA: Discover→Offer→Request→Ack.`,
  },
  'l57-x12': {
    brief: 'Host header выбирает vhost на одном IP (HTTP/1.1).',
    deep: `Связка с SNI в TLS для HTTPS.`,
  },
  'l57-x14': {
    brief: 'HSTS заставляет браузер использовать только HTTPS заданный срок.',
    deep: `Не «чинит» неверный сертификат.`,
  },
  'l57-x18': {
    brief: 'SNI в ClientHello выбирает сертификат/сайт на shared IP.',
    deep: `Без SNI — default vhost cert. openssl s_client -servername …`,
  },
  'l57-x19': {
    brief: 'IMAP — работа с ящиком на сервере; POP чаще забирает локально.',
    deep: `Не путать с SMTP (отправка).`,
  },
  'ts-x01': {
    brief: 'Нет link → кабель/SFP/admin-oper status, не traceroute.',
    deep: `Bottom-up: L1/L2 до L3. show interface; ethtool; DOM.`,
  },
  'ts-x02': {
    brief: 'Ping gateway OK, internet fail → default route / NAT / edge FW.',
    deep: `ip route; NAT translations; policy.`,
  },
  'ts-x03': {
    brief: 'IP ping OK, имя нет → DNS.',
    deep: `dig/nslookup; resolvers; split DNS.`,
  },
  'ts-x06': {
    brief: 'Duplex mismatch → errors/collisions/деградация.',
    deep: `Hardcode vs autoneg; CRC errors.`,
  },
  'ts-x07': {
    brief: 'Одинаковая IP-подсеть не значит один L2: проверьте VLAN.',
    deep: `Access VLAN, trunk allowed, SVI.`,
  },
  'ts-x08': {
    brief: 'Traceroute * * * ≠ обязательно обрыв: ICMP/UDP могут фильтроваться.',
    deep: `Проверяйте application path (TCP/443).`,
  },
  'ts-x09': {
    brief: 'Incomplete ARP → нет L2-ответа шлюза (VLAN/кабель/IP).',
    deep: `ARP who-has в дампе; VLAN; correct GW IP.`,
  },
  'ts-x10': {
    brief: 'Ping OK, сервис нет после ACL → порты/протокол сервиса в ACL.',
    deep: `Implicit deny; order of entries.`,
  },
  'ts-x11': {
    brief: 'Мелкий ping OK, крупный нет → MTU/PMTUD (ICMP PTB filtered).',
    deep: `DF tests; path MTU; MSS clamp.`,
  },
  'ts-x13': {
    brief: 'Сначала зафиксировать симптомы и baseline, потом менять конфиг.',
    deep: `Иначе нет отката и доказательства улучшения.`,
  },
  'l12-x02': {
    brief: 'Blocking/Discarding не форвардит data plane, но участвует в STP (BPDU).',
    deep: `Не путать с administratively down.`,
  },
  'l12-x05': {
    brief: 'MAC aging удаляет устаревшие MAC→port привязки.',
    deep: `Не путать с DHCP lease.`,
  },
  'l12-x08': {
    brief: 'VLAN (и L3 между ними) дробит broadcast domain.',
    deep: `Router/SVI для inter-VLAN.`,
  },
  'l4-x03': {
    brief: 'UDP — когда важны задержка и простота (DNS/RTP/games).',
    deep: `Нет handshake/retransmit в транспорте.`,
  },
  'l3-d01': {
    brief: '/30 → 4 адреса, 2 usable host.',
    deep: `Point-to-point: network + broadcast + 2 hosts.`,
    next: 'IPv4-тренажёр /30',
  },
  'l3-d04': {
    brief: 'TTL=1 на вход форварда → не форвардить; часто ICMP Time Exceeded.',
    deep: `L2-коммутатор TTL не уменьшает.`,
  },
  'l3-d06': {
    brief: 'fe80::/10 — link-local, не маршрутизируется между линками.',
    deep: `Не глобальный unicast.`,
  },
  'l4-d04': {
    brief: 'DNS→TCP при TC/truncated или zone transfer.',
    deep: `UDP first; TCP 53 for large/AXFR.`,
  },
  'tcpip-d03': {
    brief: 'OSI — роли/диагностика; TCP/IP — реальные протоколы стека.',
    deep: `Не запрет OSI и не «7 уровней у TCP/IP».`,
  },

  'l12-ps01': {
    brief: 'Violation shutdown переводит порт в err-disabled при лишнем MAC.',
    deep: `Суть. Port-security ограничивает, какие MAC допустимы на access-порту. Режим violation говорит, что делать при нарушении.

Shutdown. Порт уходит в err-disabled и перестаёт передавать трафик, пока его не восстановят (обычно shutdown / no shutdown после устранения причины).

Protect и restrict порт не выключают: они отбрасывают кадры неизвестного MAC. Restrict ещё увеличивает счётчик и может слать уведомления.

Пример. На порту maximum 1 и sticky. Подключили IP-телефон или второй ПК — второй MAC, порт в err-disabled.

Ловушка. Искать обрыв кабеля или CRC, хотя порт просто защитился.`,
    trap: 'Считать любой «мёртвый» порт физической неисправностью.',
    next: 'Урок: Port Security и DHCP Snooping',
  },
  'l12-ps02': {
    brief: 'Restrict блокирует неизвестный MAC и считает нарушения; protect только блокирует.',
    deep: `Protect отбрасывает кадры с MAC вне списка, порт остаётся up, счётчик обычно не растёт.

Restrict делает то же, но фиксирует нарушение: растёт security violation count, возможны syslog и SNMP.

Shutdown — отдельный режим: порт в err-disabled.

На практике restrict удобен, когда нужно видеть попытки подключения чужих устройств, не роняя порт.`,
    trap: 'Путать restrict с shutdown.',
    next: 'Урок: Port Security и DHCP Snooping',
  },
  'l12-ps03': {
    brief: 'Sticky сам изучает MAC и пишет его в running-config.',
    deep: `Без sticky MAC либо задают руками (static), либо он динамический и пропадает после перезагрузки или старения.

Sticky учит первый допустимый MAC и добавляет команду в текущую конфигурацию. После write memory адрес сохранится.

Это удобно на рабочих местах: не вбивать MAC вручную и всё же ограничить порт одним устройством.`,
    trap: 'Думать, что sticky работает только на trunk.',
    next: 'Урок: Port Security и DHCP Snooping',
  },
  'l12-ds01': {
    brief: 'Без trusted на uplink ответы DHCP режутся: порты по умолчанию untrusted.',
    deep: `После ip dhcp snooping и включения на VLAN клиентские порты считаются untrusted. На них блокируются ответы сервера (Offer/Ack).

Uplink к настоящему DHCP-серверу или к relay нужно пометить ip dhcp snooping trust. Иначе клиенты не получат адрес, хотя сервер жив.

Проверка: show ip dhcp snooping — какой VLAN включён и какие порты trusted.`,
    trap: 'Искать проблему на сервере, не проверив trusted.',
    next: 'Урок: Port Security и DHCP Snooping',
  },
  'l12-ds02': {
    brief: 'Binding хранит MAC, IP, VLAN и порт выданной аренды.',
    deep: `Когда клиент получает адрес через доверенный путь, коммутатор пишет привязку: MAC ↔ IP ↔ VLAN ↔ interface.

Эта таблица — основа для Dynamic ARP Inspection и IP Source Guard: можно пускать только трафик, который совпадает с арендой.

Смотреть: show ip dhcp snooping binding.`,
    trap: 'Считать binding просто списком ACL.',
    next: 'Урок: Port Security и DHCP Snooping',
  },
  'l12-ds03': {
    brief: 'DHCP Snooping не даёт rogue-серверу раздать клиентам свой шлюз и DNS.',
    deep: `Чужой DHCP в пользовательском VLAN может выдать «правильный» адрес, но свой шлюз или DNS. Трафик уйдёт к атакующему.

Snooping пускает ответы сервера только с trusted-портов. На untrusted Offer/Ack отбрасываются.

Это защита L2-доступа, не замена фильтрации на маршрутизаторе.`,
    trap: 'Думать, что snooping ускоряет STP или меняет MTU.',
    next: 'Урок: Port Security и DHCP Snooping',
  },
  'l12-ds04': {
    brief: 'Слишком низкий rate limit режет и легитимные Discover/Request.',
    deep: `ip dhcp snooping limit rate ограничивает частоту DHCP-пакетов с клиентского порта. Это защита от DHCP-шторма.

Если порог слишком мал, обычный ПК или несколько устройств за портом (телефон + ПК, или перезагрузка этажа) не получают адрес: пакеты дропаются до сервера.

Симптом похож на «DHCP не работает», хотя сервер и trusted в порядке. Смотреть счётчики и rate на порту.`,
    trap: 'Сразу винить сервер или VLAN, не проверив limit rate.',
    next: 'Урок: Port Security и DHCP Snooping',
  },

  'l3-vrrp01': {
    brief: 'VRRP даёт клиентам один виртуальный IP шлюза на несколько маршрутизаторов.',
    deep: `Клиенты не должны знать, какой физический маршрутизатор жив. Они шлюзом ставят VIP, например 192.168.1.1.

Master отвечает на ARP за этот адрес и форвардит трафик. Backup слушает advertisement. Если Master пропал, Backup берёт VIP.

Для пользователя шлюз не меняется — меняется только устройство за ним.`,
    trap: 'Думать, что VRRP заменяет DNS или делает порт trunk.',
    next: 'Урок: VRRP',
  },
  'l3-vrrp02': {
    brief: 'Master выбирается по Priority: выше — предпочтительнее.',
    deep: `Priority от 1 до 254 настраивается. 100 — значение по умолчанию. 255 обычно у владельца виртуального IP.

При равном приоритете платформы используют дополнительный тай-брейк, но для экзамена важно: выше Priority — выше шанс стать Master.

VRID и VIP на обоих маршрутизаторах должны совпадать, иначе это разные группы.`,
    trap: 'Считать, что Master всегда устройство с меньшим MAC.',
    next: 'Урок: VRRP',
  },
  'l3-vrrp03': {
    brief: 'VRRP — IP protocol 112, multicast 224.0.0.18, без TCP/UDP.',
    deep: `Advertisement идут напрямую по IP. Поэтому в ACL и на firewall нужно разрешать протокол 112 и multicast 224.0.0.18, а не «открыть TCP».

Если VRRP не сходится, проверяй VRID, VIP, Priority, доступность multicast и состояние интерфейсов.

Интервал advertisement обычно 1 секунда.`,
    trap: 'Искать VRRP на TCP 179 или UDP 123.',
    next: 'Урок: VRRP',
  },
  'l3-vrrp04': {
    brief: 'Preemption возвращает роль Master более приоритетному после восстановления.',
    deep: `По умолчанию preemption включён. Упал R1 с priority 120, R2 (100) стал Master. Когда R1 вернулся, он снова забирает VIP.

Если preemption выключить, текущий Master останется, пока сам не откажет — даже если сосед приоритетнее.

Это важно при плановых работах: внезапный возврат Master может кратковременно дёрнуть трафик.`,
    trap: 'Думать, что preemption навсегда фиксирует текущего Master.',
    next: 'Урок: VRRP',
  },
  'l12-copp01': {
    brief: 'Проверь CoPP и счётчики control plane: доступ к самому маршрутизатору может ограничиваться при исправном транзите.',
    deep: `CoPP защищает процессор маршрутизатора, ограничивая классы пакетов, направленных в control plane.
Полисер может отбрасывать ICMP к устройству и пакеты SSH при превышении настроенного порога, тогда как аппаратная пересылка транзитного трафика продолжается.
Например, поток запросов к маршрутизатору исчерпывает лимит класса: ping теряется, управление замедляется, но передача между клиентами работает.
Проверь show policy-map control-plane, прирост счётчиков превышения и отбрасывания в нужном классе, а также загрузку CPU.
Ловушка — считать потери до адреса маршрутизатора доказательством потерь через него или объявлять CoPP причиной без проверки политики и счётчиков.`,
    trap: 'Приравнивать потери ping до устройства к потерям транзитного трафика.',
    next: 'Урок: CoPP и Storm Control',
  },
  'l12-storm01': {
    brief: 'Проверь Storm Control и его пороги: он может отбрасывать исправные кадры при UP-порте и нулевых CRC.',
    deep: `Storm Control ограничивает интенсивность broadcast, multicast и unknown unicast на порту в зависимости от возможностей платформы и конфигурации.
При превышении порога соответствующий трафик может отбрасываться без повреждения кадров, поэтому CRC остаётся нулевым.
Например, после подключения нового оборудования всплеск broadcast достигает порога и мешает прохождению ARP и DHCP Discover.
Проверь show storm-control, настроенные классы и пороги, действия при превышении и доступные на платформе счётчики отбрасывания.
Ловушка — считать нулевой CRC доказательством отсутствия потерь или сразу повышать порог, не исключив петлю и реальный шторм.`,
    trap: 'Считать UP и нулевой CRC гарантией доставки или маскировать шторм повышением порога.',
    next: 'Урок: CoPP и Storm Control',
  },
};

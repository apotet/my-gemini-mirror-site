/** Individual deep dives for applied-level items in EXTRA packs. */
export const APPLIED_INDIVIDUAL_DEEP: Record<
  string,
  { brief: string; deep: string; trap?: string; next?: string }
> = {
  'tcpip-x06': {
    brief: 'Приём: сначала L2 (Ethernet), затем IP, затем TCP/UDP, потом приложение.',
    deep: `Механизм. Декапсуляция снизу вверх: FCS/MAC → ethertype → IP → protocol → ports.
Пример. Кадр на NIC → драйвер/L2 → IP stack → сокет.
Диагностика. tcpdump -e -n; смотрите слои в Wireshark.
Ошибка. Думать, что HTTP «сразу» виден без L2/L3.
Проверка. В дампе видна полная вложенность заголовков.`,
    next: 'Теория: инкапсуляция TCP/IP',
  },
  'tcpip-x09': {
    brief: 'ICMP — Internet Layer рядом с IP (не Transport).',
    deep: `Механизм. ICMP сообщения инкапсулируются в IP (proto 1).
Пример. Destination Unreachable, Echo, Time Exceeded.
Диагностика. ping/traceroute; фильтр icmp в дампе.
Ошибка. Относить ICMP к TCP/UDP только потому что «диагностика».`,
  },
  'tcpip-x14': {
    brief: 'DF=1 и размер > MTU → drop, часто ICMP Fragmentation Needed/PTB.',
    deep: `Механизм. Без фрагментации маршрутизатор не может ужать пакет.
Пример. VPN снижает effective MTU; PMTUD ломается при filter ICMP.
Диагностика. ping -M do -s; проверка ICMP type 3 code 4 / PTB.
Ошибка. «Всегда фрагментируется» — не при DF.`,
    next: 'troubleshooting PMTUD',
  },
  'tcpip-x18': {
    brief: 'End-to-end principle: сложная надёжность на концах, ядро — доставка.',
    deep: `Механизм. IP best-effort; TCP/app восстанавливают потери.
Пример. Интернет-маршрутизаторы не хранят byte-stream state приложения.
Ошибка. Путать с Ethernet store-and-forward как «end-to-end».`,
  },
  'tcpip-x20': {
    brief: 'Минимальный IPv4 header без опций — 20 байт.',
    deep: `Механизм. Version/IHL/…/checksum; IHL≥5 → 20 bytes.
Сравнение. TCP min 20; UDP 8; Ethernet 14 (+FCS 4).
Ошибка. Путать с IPv6 fixed 40.`,
  },
  'tcpip-x23': {
    brief: 'IP — best-effort: без гарантий доставки, порядка и уникальности.',
    deep: `Механизм. Нет встроенного retransmit на IP.
Пример. Потери на Wi-Fi компенсирует TCP, не IP.
Ошибка. Приписывать IP семантику TCP.`,
  },
  'tcpip-x24': {
    brief: 'DHCP — Application поверх UDP 67/68, не замена IP.',
    deep: `Механизм. Клиент/сервер UDP; опции конфигурации.
Диагностика. dhcpdump; show ip dhcp; journal NetworkManager.
Ошибка. Считать DHCP «сетевым уровнем вместо IP».`,
  },
  'tcpip-x26': {
    brief: 'На hop: TTL−1 и новая L2-инкапсуляция; IP src/dst обычно те же (без NAT).',
    deep: `Пример. Router rewrite MAC to next-hop; TTL guard loops.
Диагностика. traceroute; compare L2 headers per hop in lab.
Ошибка. Думать, что TCP ports меняет каждый роутер.`,
  },
  'tcpip-x27': {
    brief: 'NAT — стык private/public (часто L3+L4 ports).',
    deep: `Механизм. Перепись адресов/портов, state table.
Пример. PAT overload на edge.
Ошибка. Сводить NAT только к «VLAN tagging».`,
  },
  'tcpip-x28': {
    brief: 'TCP/IP — pragmatic стек интернета; OSI — эталонная модель ролей.',
    deep: `Практика. Инженер диагностирует «по OSI», пакеты живут в TCP/IP.
Ошибка. Требовать «строго 7 уровней» у TCP/IP RFC stack.`,
  },
  'l57-x02': {
    brief: 'Рекурсивный резолвер сам обходит цепочку NS от имени клиента.',
    deep: `Механизм. Root → TLD → authoritative; кэш.
Пример. 1.1.1.1 как recursive.
Диагностика. dig +trace; проверить recursion available.
Ошибка. Путать с authoritative-only.`,
  },
  'l57-x04': {
    brief: 'GET безопасный; не должен менять состояние при повторе (в идеале).',
    deep: `Семантика RFC. Safe methods; idempotent PUT/DELETE отдельно.
Ошибка. Считать POST «всегда безопасным» из-за UI кнопок.`,
  },
  'l57-x07': {
    brief: 'DHCP client UDP/68, server UDP/67.',
    deep: `DORA на L2 broadcast domain (или relay).
Диагностика. tcpdump port 67 or 68.
Ошибка. Путать с DNS/53.`,
  },
  'l57-x08': {
    brief: 'Клиент подтверждает offer через DHCPREQUEST.',
    deep: `DORA: Discover→Offer→Request→Ack.
Диагностика. Смотреть transaction id и requested IP option.
Ошибка. Путать REQUEST с ACK от сервера.`,
  },
  'l57-x12': {
    brief: 'Host header выбирает vhost на одном IP (HTTP/1.1).',
    deep: `Связка с SNI в TLS для HTTPS.
Ошибка. Думать, что Host задаёт MAC шлюза.`,
  },
  'l57-x14': {
    brief: 'HSTS заставляет браузер использовать только HTTPS заданный срок.',
    deep: `Strict-Transport-Security; preload осторожно.
Ошибка. Считать, что HSTS «чинит» неверный сертификат.`,
  },
  'l57-x18': {
    brief: 'SNI в ClientHello выбирает сертификат/сайт на shared IP.',
    deep: `Без SNI — default vhost cert.
Диагностика. openssl s_client -servername …
Ошибка. Путать SNI с DNS AAAA.`,
  },
  'l57-x19': {
    brief: 'IMAP — работа с ящиком на сервере; POP чаще забирает локально.',
    deep: `Папки, флаги, multi-device sync — сильная сторона IMAP.
Ошибка. Путать с SMTP (отправка).`,
  },
  'ts-x01': {
    brief: 'Нет link → кабель/SFP/admin-oper status, не traceroute.',
    deep: `Bottom-up: L1/L2 до L3.
Команды: show interface; ethtool; DOM optical.
Ошибка. Сразу чистить ARP core.`,
  },
  'ts-x02': {
    brief: 'Ping gateway OK, internet fail → default route / NAT / edge FW.',
    deep: `ip route; проверка NAT translations; policy.
Ошибка. Менять только duplex к ПК.`,
  },
  'ts-x03': {
    brief: 'IP ping OK, имя нет → DNS.',
    deep: `dig/nslookup; проверить resolvers и split DNS.
Ошибка. Искать native VLAN mismatch как первую гипотезу.`,
  },
  'ts-x06': {
    brief: 'Duplex mismatch → errors/collisions/деградация.',
    deep: `Hardcode vs autoneg; CRC/align errors.
Команды: show interface counters; ethtool -s.
Ошибка. Лечить DNS.`,
  },
  'ts-x07': {
    brief: 'Одинаковая IP-подсеть не значит один L2: проверьте VLAN.',
    deep: `Access VLAN, trunk allowed, SVI.
show vlan; show interfaces switchport.
Ошибка. Сразу OSPF SPF.`,
  },
  'ts-x08': {
    brief: 'Traceroute * * * ≠ обязательно обрыв: ICMP/UDP могут фильтроваться.',
    deep: `Проверяйте application path (TCP/443), не только probes.
Ошибка. Объявлять down весь core по звёздочкам.`,
  },
  'ts-x09': {
    brief: 'Incomplete ARP → нет L2-ответа шлюза (VLAN/кабель/IP).',
    deep: `Проверка: ARP who-has в дампе; VLAN; correct GW IP.
Ошибка. Крутить TCP window.`,
  },
  'ts-x10': {
    brief: 'Ping OK, сервис нет после ACL → порты/протокол сервиса в ACL.',
    deep: `Сверить implicit deny; order of entries.
Ошибка. Смотреть только duplex.`,
  },
  'ts-x11': {
    brief: 'Мелкий ping OK, крупный нет → MTU/PMTUD (ICMP PTB filtered).',
    deep: `DF bit tests; path MTU; MSS clamp.
Ошибка. Считать «только DHCP pool».`,
    trap: 'Сводить всё к DHCP без проверки размеров пакетов.',
  },
  'ts-x13': {
    brief: 'Сначала зафиксировать симптомы и baseline, потом менять конфиг.',
    deep: `Иначе нет отката и доказательства улучшения.
Ошибка. Reboot «на всякий случай» без сбора фактов.`,
  },
  'l12-x02': {
    brief: 'Blocking/Discarding не форвардит data plane, но участвует в STP (BPDU).',
    deep: `Роль Alternate/Backup; не путать с administratively down.
show spanning-tree.
Ошибка. Считать, что порт «маршрутизирует».`,
  },
  'l12-x05': {
    brief: 'MAC aging удаляет устаревшие MAC→port привязки.',
    deep: `Подвижные клиенты; иначе sticky wrong port.
Ошибка. Путать с DHCP lease.`,
  },
  'l12-x08': {
    brief: 'VLAN (и L3 между ними) дробит broadcast domain.',
    deep: `Один VLAN — один BD; router/SVI для inter-VLAN.
Ошибка. Думать, что длинный кабель «рвёт» BD.`,
  },
  'l4-x03': {
    brief: 'UDP — когда важны задержка и простота (DNS/RTP/games).',
    deep: `Нет handshake/retransmit в транспорте.
Ошибка. Требовать 3-way у UDP.`,
  },
  'l3-d01': {
    brief: '/30 → 4 адреса, 2 usable host.',
    deep: `Point-to-point links; network + broadcast + 2 hosts.
Проверка: 10.10.10.0/30 → .1 и .2.`,
    next: 'IPv4-тренажёр /30',
  },
  'l3-d04': {
    brief: 'TTL=1 на вход форварда → не форвардить; часто ICMP Time Exceeded.',
    deep: `После декремента TTL≤0 drop.
Ошибка. «Коммутатор L2 уменьшает TTL» — нет.`,
  },
  'l3-d06': {
    brief: 'fe80::/10 — link-local, не маршрутизируется между линками.',
    deep: `Обязателен на IPv6 интерфейсах; scope link.
Ошибка. Считать fe80 глобальным unicast.`,
  },
  'l4-d04': {
    brief: 'DNS→TCP при TC/truncated или zone transfer.',
    deep: `UDP first; TCP 53 for large/AXFR.
Ошибка. «Всегда TCP для A-записей».`,
  },
  'tcpip-d03': {
    brief: 'OSI — роли/диагностика; TCP/IP — реальные протоколы стека.',
    deep: `Рабочая формула инженера, не запрет OSI.
Ошибка. Требовать 7 уровней у TCP/IP model.`,
  },
};

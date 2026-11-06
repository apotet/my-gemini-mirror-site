import { Question } from '../types/quiz';
import { APPLIED_INDIVIDUAL_DEEP, type ProfessionalExplanation } from './questionExplanationsApplied';

export interface QuestionDeepDive {
  questionId: string;
  category: 'l1' | 'l2' | 'l3' | 'l4' | 'l5_l7' | 'tcpip' | 'cli' | 'visual';
  categoryLabel: string;
  categoryColor: string;
  briefAnswer: string;
  coreConcept: string;
  deepAnalysis: string;
  engineeringDeep?: string;
  professional?: ProfessionalExplanation;
  hasIndividualDeep: boolean;
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
  ipv6Practice?: { enabled: boolean };
  keyTakeaways: string[];
  nextStudy?: string;
}

/** Hand-authored deep dives for advanced IDs (no generic L1–L7 paste). */
const ADVANCED_INDIVIDUAL_DEEP: Record<
  string,
  { brief: string; deep: string; trap?: string; next?: string; professional?: ProfessionalExplanation }
> = {
  'l12-d01': {
    "brief": "Сначала проверьте, распознаётся ли подключение компьютера как конечное и настроена ли защита от появления другого коммутатора.",
    "deep": "Компьютер подключается как конечный узел, но порт сначала проходит этапы ожидания, как будто за ним может находиться продолжение сети. Отсюда задержка первых кадров при каждом подключении. Сначала нужно проверить, действительно ли порт работает в режиме для конечного устройства, а не менять параметры резервных связей между коммутаторами.\n\nВ RSTP такой режим называется edge; у Cisco для него используют настройку PortFast. Фактическое состояние operational edge позволяет быстро перейти к Forwarding, не ожидая обычной процедуры включения межкоммутаторного пути. BPDU Guard — отдельная защита: если на защищённом порту появляются служебные сообщения BPDU от подключённого коммутатора, она отключает порт; на Catalyst это обычно err-disabled. В выводе show spanning-tree interface … detail проверяют именно действующее edge-состояние, а в журнале — события защиты.\n\nТаймер восстановления после BPDU Guard важен при уже случившемся защитном отключении, но не объясняет сам по себе показанную последовательность перехода к передаче. Alternate, Bridge ID и стоимость пути к корню относятся к выбору путей в топологии, а не к первому ожиданию на каждом порту компьютера. Сам Guard переход не ускоряет: быстрый старт обеспечивает edge, а защита ограничивает риск подключения коммутатора вместо конечного узла.",
    "trap": "Приписывать быстрый старт защите BPDU Guard или включать режим конечного порта на межкоммутаторных связях без проверки назначения.",
    "next": "CLI Lab: VLAN/trunk; теория STP/RSTP",
    "professional": {
      "brief": "Проверить edge/PortFast на access и политику BPDU Guard: без edge RSTP не форвардит сразу.",
      "deep": "Суть. Access к ПК не должен ждать полной сходимости как uplink.\n\nМеханизм RSTP. Роли Root/Designated/Alternate/Backup; состояния Discarding → Learning → Forwarding. Edge-порт (PortFast) сразу переходит к forwarding для data plane, продолжая слушать BPDU.\n\nПочему «долго». Без edge порт ведёт себя как часть топологии: negotiation и learning задерживают пользовательский трафик на секунды.\n\nДиагностика. show spanning-tree interface … detail; edge/portfast status; нет ли BPDU с access (тогда Guard ошибёт порт — это правильно).\n\nЛовушка. Путать состояния classic STP (Listening/Learning 15s) с RSTP: цифры и термины другие, идея edge — та же.\n\nПроверка. После edge+guard ПК получает DHCP/ARP сразу; при подключении свитча на access — errdisable/guard.",
      "trap": "Описывать RSTP исключительно терминами classic STP Listening 15s без edge.",
      "next": "CLI Lab: VLAN/trunk; теория STP/RSTP",
      "sourceCommit": "c60b93022f9d47d9d09e3f525bbb8cb177887c14"
    }
  },
  'l12-d02': {
    brief: "S1 маршрутизирует из VLAN 30 в VLAN 10; к S2 кадр идёт в VLAN 10, без обязательного переноса VLAN 30.",
    deep: `Шлюз ПК расположен на S1 в SVI 30. Поэтому пакет сначала попадает к этому L3-интерфейсу, а затем S1 выбирает сеть сервера, подключённую через SVI 10.

После маршрутизации кадр к серверу относится к VLAN 10 и проходит trunk S1—S2 в этой VLAN. VLAN 30 заканчивает нужный для данного обмена участок на S1, поэтому её отсутствие в allowed list этого trunk не нарушает описанный путь.

S2 выполняет L2-пересылку в VLAN 10 к access-порту сервера. Он не переносит кадр из VLAN 30 в VLAN 10 заменой тега и не выбирает VLAN по IP назначения: межсетевой переход уже выполнен на S1.

Проверьте шлюзы конечных узлов, маршрут и соседство сервера на S1, а на trunk — перенос и forwarding VLAN 10. Для обратного обмена сервер также использует SVI 10 на S1; расширять allowed list VLAN 30 только из-за номера VLAN ПК здесь не требуется.`,
    trap: "Считать, что VLAN исходного ПК должна проходить каждый trunk после маршрутизации на его шлюзе.",
  },
  'l12-d03': {
    brief: "Нетегированный кадр с A классифицируется на B в VLAN 20; после добавления VID 10 на A — в VLAN 10.",
    deep: `В исходной настройке A отправляет пользовательский кадр своей native VLAN 10 без тега. На линии в этом кадре нет VID 10, который мог бы сообщить принимающей стороне исходную принадлежность.

B относит нетегированный кадр к собственной native VLAN 20. Поэтому первая часть ответа — VLAN 20, несмотря на то что на A этот трафик принадлежал VLAN 10.

После включения тегирования native VLAN на A кадр приходит с VID 10. Эта VLAN разрешена на trunk B и не является его native VLAN, поэтому для данного тегированного кадра выбирается VLAN 10, а не прежняя классификация по отсутствующему тегу.

Сверьте native VLAN, разрешённые VLAN и режим тегирования на обоих концах, затем сравните кадры до и после изменения. Билет рассматривает классификацию принятого кадра; состояние защитных механизмов и работоспособность всего соединения проверяют отдельно.`,
    trap: "Сохранять исходный номер VLAN у нетегированного кадра или применять native VLAN к кадру с явным VID 10.",
  },
  'l12-d04': {
    brief: "Потери 8 dB дают Rx от −13 до −9 dBm; минимальный запас 2 dB, проектному резерву не хватает 1 dB.",
    deep: `Сначала складывают потери волокна и соединений: 6 + 2 = 8 dB. Их вычитают из обоих пределов Tx: −5 − 8 = −13 dBm и −1 − 8 = −9 dBm, получая ожидаемый диапазон Rx.

Для проверки чувствительности берут слабейший сигнал −13 dBm. До порога −15 dBm остаётся 2 dB: физический минимум соблюдён, но требуемые проектом 3 dB не набраны, дефицит составляет 1 dB.

Перегрузку проверяют по самому сильному ожидаемому сигналу −9 dBm. Он ниже верхнего допустимого уровня −3 dBm, поэтому проблема не в избытке мощности; диапазон −11…−7 получился бы при пропуске потерь соединений, а −7…−3 — при пропуске потерь волокна.

Сверьте паспортный диапазон Tx, оба порога Rx и полный состав потерь, затем сопоставьте расчёт с измерениями. Не подменяйте худший случай максимальной мощностью передатчика: нормальный текущий Rx не доказывает наличие требуемого резерва во всём заданном диапазоне.`,
    trap: "Путать соблюдение чувствительности с достаточным проектным запасом или забывать часть потерь при расчёте Rx.",
  },
  'l12-d05': {
    "brief": "Две независимые передающие линии образуют петлю: копии широковещательного запроса продолжают возвращаться и занимать каналы.",
    "deep": "Коммутатор получает запрос для всех соседей и отправляет его по обеим линиям. На другой стороне каждая копия пересылается через оставшуюся линию и возвращается обратно. Пока все порты продолжают передавать данные, копии совершают новые обходы и создают лишнюю нагрузку вместо однократной доставки.\n\nЭто петля Ethernet: широковещательный ARP Request распространяется обычной рассылкой flooding через остальные передающие порты той же VLAN. У Ethernet-кадра нет уменьшаемого при каждом таком переходе счётчика, который остановил бы обход; IP TTL к этой пересылке не применяется. Протокол STP/RSTP мог бы оставить одну связь резервной, но в билете все четыре порта продолжают пересылку.\n\nFCS проверяет целостность кадра, а не хранит историю уже полученных копий, поэтому совпадение контрольной суммы не устраняет петлю. Обучение MAC источника не ограничивает рассылку широковещательного кадра одним выходом. Распределение по хэшу относится к настроенному агрегату, например согласованному через LACP; две независимые линии из условия таким агрегатом не являются.",
    "trap": "Ожидать подавления дублей по контрольной сумме или поведения агрегата от двух независимо работающих линий.",
    "professional": {
      "brief": "Без STP broadcast/unknown unicast зацикливаются; IP TTL Ethernet storm не останавливает.",
      "deep": "Ethernet не декрементирует TTL. Петля размножает flood до насыщения каналов.\nНужны STP/RSTP/MSTP, storm-control, разумный дизайн без L2-колец без защиты.",
      "sourceCommit": "c60b93022f9d47d9d09e3f525bbb8cb177887c14"
    }
  },
  'l12-d06': {
    brief: 'CAM full → больше unknown unicast flood (и риск mac-flooding атак).',
    deep: `Таблица MAC ограничена. При переполнении новые адреса не учат стабильно → flood как hub для unknown.
Защита: port-security, ограничение MAC на access, контроль uplink.`,
  },
  'l3-d02': {
    brief: '192.168.5.64/27 → блок 64–95, broadcast 192.168.5.95.',
    deep: `/27 = шаг 32. Подсети …0, 32, 64, 96…
Диапазон 64–95: network 64, hosts 65–94, broadcast 95.`,
  },
  'l3-d03': {
    brief: 'Longest prefix match: /25 побеждает /24; metric сравнивают при равной специфичности.',
    deep: `Сначала выбирают наиболее specific prefix. AD/metric — среди равных по длине префикса.
Пакет в хост из /25 идёт в /25, даже если metric хуже.`,
  },
  'l3-d05': {
    brief: 'PAT различает сессии по 5-tuple (ip/port/proto), разделяя один public IP.',
    deep: `Many-to-one: разные internal:ephemeral → один public с разными source port.
Исчерпание портов и ALG — типичные пределы.`,
  },
  'l3-d07': {
    brief: 'Proxy ARP маскирует неверные маски/«плоскую» сеть: шлюз отвечает своим MAC за чужие IP.',
    deep: `Хост считает, что цель on-link, шлёт ARP; router отвечает своим MAC и маршрутизирует дальше.
Удобно временно, опасно как постоянный костыль — скрывает design-ошибки.`,
  },
  'l3-d08': {
    brief: 'ECMP обычно per-flow (hash), не per-packet — чтобы не ломать порядок TCP.',
    deep: `Hash по адресам/портам держит поток на одном path. Per-packet ECMP редок из-за reordering.`,
  },
  'l4-d01': {
    brief: 'Нет SYN-ACK: ACL/firewall, сервис down, asymmetry+stateful FW — не «только duplex».',
    deep: `Проверка: ss/netstat listen; ACL/security groups; traceroute/path; stateful на обоих направлениях.
Half-duplex возможен, но не единственная и не первая гипотеза при чистом отсутствии SYN-ACK.`,
  },
  'l4-d02': {
    brief: 'Рост retransmits при большом RTT: loss, bufferbloat, police, PMTUD.',
    deep: `Смотрите interface drops, queueing, policers, ICMP frag-needed, TCP graphs (window/rtt).`,
  },
  'l4-d03': {
    brief: 'TIME-WAIT гасит запоздалые сегменты старой incarnции сокета.',
    deep: `2MSL после active close. Нужен для reliability RFC793 FSM, не «ускорение SYN-flood».`,
  },
  'l4-d05': {
    brief: 'SACK подтверждает несмежные блоки — быстрее восстановление при множественных потерях.',
    deep: `Без SACK — чаще большой rollback; с SACK — selective retransmit.`,
  },
  'l4-d06': {
    brief: 'Policing режет TCP → loss → cwnd down → низкий throughput.',
    deep: `Лучше shaping с очередями, чем жёсткий police на интерактивных TCP, если политика позволяет.`,
  },
  'l57-d01': {
    brief: 'Имя в URL/SNI должно совпадать с CN/SAN сертификата.',
    deep: `example.com ≠ www.example.com без SAN. Браузер даст name mismatch.`,
  },
  'l57-d02': {
    brief:
      'SNI (Server Name Indication) — расширение TLS: клиент указывает имя сервера уже в ClientHello. Без SNI сервер на общем IP часто отдаёт сертификат по умолчанию; ошибка имени возникает, только если этот сертификат не покрывает запрошенный домен.',
    deep: `Что это такое?
SNI = Server Name Indication. Это расширение протокола TLS (RFC 6066): клиент сообщает серверу доменное имя уже в ClientHello, до выбора сертификата.

Зачем это придумали?
На одном IP часто живут несколько HTTPS-сайтов. Сертификат нужно выбрать до HTTP-запроса — заголовок Host приходит уже после установления TLS. Без SNI сервер отдаёт сертификат по умолчанию для IP.

Как это работает?
Клиент кладёт server_name в ClientHello. Сервер выбирает виртуальный хост и сертификат. Клиент проверяет SAN/CN. Подробная схема и диагностика — в уроке «TLS и SNI» в базе знаний.

Почему правильный ответ верный?
Без SNI сервер не знает нужный хост и отдаёт default cert. Если он не содержит запрошенное имя — клиент увидит ошибку проверки имени. Если default/wildcard покрывает имя — ошибки может не быть.

Почему другие варианты неверны?
DNS выбирает IP, не сертификат. HTTP Host приходит после TLS. Без SNI соединение не обязано падать с handshake failure.

Как диагностировать?
openssl s_client -connect 203.0.113.10:443 -servername shop.example.test
openssl s_client -connect 203.0.113.10:443 -noservername
Смотреть Subject и SAN. Успешный TLS сам по себе не доказывает правильную проверку имени.

Что запомнить?
SNI нужен для нескольких HTTPS-сайтов на одном IP. Имя передаётся в ClientHello. Ошибка зависит от того, покрывает ли сертификат по умолчанию запрошенный домен.`,
    trap: 'Считать, что DNS или HTTP Host выбирают сертификат, или что без SNI соединение всегда падает.',
    next: 'Урок базы знаний: TLS и SNI',
  },
  'l57-d03': {
    brief: 'Split-horizon: разные DNS-ответы internal vs external для одного имени.',
    deep: `Внутри — private IP, снаружи — public. Ошибки view дают «резолвится не туда».`,
  },
  'l57-d04': {
    brief: 'HTTP/2 multiplex не убирает TCP HOL blocking при потерях; HTTP/3/QUIC — другой путь.',
    deep: `Один потерянный TCP-сегмент тормозит все потоки на соединении.`,
  },
  'l57-d05': {
    brief: 'Два DHCP в одном L2 без split/failover → гонка Offer и хаос настроек.',
    deep: `Split scope, DHCP failover, или ACL/port isolation для серверов.`,
  },
  'l57-d06': {
    brief: 'Долгий HSTS max-age / preload усложняет откат при аварии TLS.',
    deep: `Планируйте короткий max-age на время обкатки; preload — только при уверенности.`,
  },
  'tcpip-d01': {
    brief: 'Без NAT IP src/dst end-to-end; на каждом hop переписываются MAC под next-hop.',
    deep: `Декапсуляция L2 → lookup L3 → новая L2-инкапсуляция. TTL−1.`,
  },
  'tcpip-d02': {
    brief: 'PMTUD black hole: DF=1 и нет ICMP Fragmentation Needed/PTB.',
    deep: `Разрешите ICMP PTB на path или чините MTU/MSS clamp осознанно.`,
  },
  'tcpip-d04': {
    brief: 'Stateful FW на асимметричном path не видит full duplex state → drop.',
    deep: `Симметрия через FW, state sync кластера, или policy-routing осторожно.`,
  },
  'tcpip-d05': {
    brief: 'ECN маркирует перегрузку (CE), не обязательно drop.',
    deep: `Нужна поддержка на концах и в очереди (AQM). Иначе mark бесполезен.`,
  },
  'ts-d01': {
    brief: 'Сеть жива → смотреть proxy/PAC, SSL inspection, ACL 443, split DNS, cert.',
    deep: `Сверка curl -v, сертификат цепочки, PAC URL, firewall app-id.`,
  },
  'ts-d02': {
    brief: 'После VLAN-миграции сверьте access VLAN, SVI, ACL и реальный L2-домен.',
    deep: `show vlan, show interfaces switchport, ping SVI, одинаковый mask/gateway.`,
  },
  'ts-d03': {
    brief: 'Пустой traceroute ≠ down: часто режут ICMP/UDP probe при живом 443.',
    deep: `Проверяйте application path (TCP/TLS), не только traceroute.`,
  },
  'ts-d04': {
    brief: 'TCP slow / UDP iperf ok → loss-sensitive path, police, bufferbloat, window.',
    deep: `Смотрите retransmits, pacing, policers, BQL/CoDel, middlebox.`,
  },
  'ts-d05': {
    brief: 'Strict uRPF + asymmetry дропает легитимный ingress.',
    deep: `Feasible paths, loose mode, или убрать asymmetry на том интерфейсе.`,
  },
  'ts-d06': {
    brief: 'SIP/RTP: DNS, NAT/ALG, ACL портов, одностороннее аудио.',
    deep: `Проверьте signalling 5060/TLS и RTP range, helper-address, fixup/ALG осторожно.`,
  },
  'ts-d07': {
    brief: 'Policy routing: ip rule и таблицы ip route show table …',
    deep: `Не путать с main table only; смотрите priority rules.`,
  },
  'ts-d08': {
    brief: '«Падает через ~5 мин»: ARP/MAC aging, DHCP renew, FW session timeout.',
    deep: `Сверьте lease timers, idle timeouts, silent host behavior.`,
  },

  'l1-04': {
    brief: "В этом билете два источника дополнительного затухания: загрязнённый торец и недопустимый изгиб волокна.",
    deep: `Мощность передатчика осталась прежней, а Rx уменьшился на 6 дБ после работы с патч-кордом. Это указывает на увеличение потерь тракта, но одно измерение не выбирает единственную причину из двух подходящих вариантов.

Загрязнение торца ухудшает передачу света через соединение. Недопустимый изгиб также может добавить оптические потери, поэтому оба изменения согласуются с наблюдением и должны быть выбраны.

Перегрузка приёмника связана с избытком входной мощности и сама не создаёт дополнительного затухания линии. Порог чувствительности определяет допустимый минимум сигнала, но его изменение не уменьшает мощность, которую тракт доставляет к приёмнику.

Осмотрите и очистите торцы, проверьте укладку и допустимый радиус изгиба, затем повторите измерение Rx при сопоставимом Tx. Изменяйте проверяемый участок последовательно, чтобы понять, какое действие вернуло уровень, а не объявлять все 6 дБ следствием одной заранее выбранной причины.`,
    trap: "Выбирать одну из двух подходящих причин или считать изменение чувствительности изменением потерь линии.",
    next: 'Теория L1: оптика и бюджет',
  },
  'tr-04': {
    brief: 'Два ПК в одной IP-подсети на разных коммутаторах не видят друг друга — проверяй L2-путь: access VLAN, членство VLAN на аплинках, состояние линков и STP forwarding. DNS и default route к прямой L2-связности не относятся.',
    deep: `Краткий ответ. Нужны совпадающие access VLAN, перенос этой VLAN по trunk, живые линки и forwarding STP.

Как это работает. В одной подсети устройства общаются через L2 (ARP + Ethernet). Кадр должен пройти access → trunk с нужной VLAN → access. Любой разрыв на этом пути ломает связность.

Практический пример. Два ПК в 192.168.10.0/24 на разных коммутаторах не пингуются, потому что VLAN 10 нет в allowed list trunk.

Диагностика. show interfaces trunk; show vlan brief; show spanning-tree vlan …; MAC/ARP таблицы.

Типичные ловушки. Искать причину в DNS или default route. Забывать STP blocking.

Проверка. MAC видны в нужном VLAN, ARP успешен, ping по IP стабилен.`,
    trap: 'Искать причину в DNS или default route при одной подсети на L2.',
    next: 'CLI Lab: VLAN/trunk',
  },
  'tr-08': {
    brief: 'Много TCP Retransmission в захвате чаще всего указывает на потерю сегментов или ACK. Это метка анализатора, а не окончательный диагноз: учитывай полноту захвата и переупорядочивание.',
    deep: `Краткий ответ. TCP Retransmission — отправитель повторил сегмент, потому что не получил своевременный ACK.

Как это работает. Потеря сегмента или ACK запускает ретрансмит. Wireshark ставит метку по анализу последовательности. Неполный захват или reordering могут исказить картину.

Практический пример. Медленный доступ к файловому серверу, много ретрансмитов на клиенте; на сервере часть сегментов не доходит — дальше смотреть потери на линке или firewall.

Диагностика. Expert Info, TCP stream, RTT, сравнение захватов с двух сторон, счётчики ошибок интерфейсов.

Типичные ловушки. Считать каждую метку доказательством «плохой сети» без проверки полноты захвата.`,
    trap: 'Воспринимать метку TCP Retransmission как окончательный диагноз.',
    next: 'Теория TCP; практика Wireshark',
  },
  'tr-09': {
    brief: 'При duplex mismatch типичны late collisions на half-duplex стороне, CRC/FCS на full-duplex стороне и нормальный ping при низкой скорости под нагрузкой.',
    deep: `Краткий ответ. Duplex mismatch даёт late collisions (HD), FCS/CRC (FD) и деградацию под нагрузкой при живом ping.

Как это работает. Full-duplex не слушает коллизии, half-duplex отступает. Когда оба передают, HD видит late collision, FD — повреждённые кадры. Маленький ping часто проходит.

Практический пример. Сервер full, коммутатор согласовал half. show interfaces показывает late collisions с одной стороны и CRC с другой.

Диагностика. Счётчики ошибок и duplex/speed на обоих концах. Проверка под нагрузкой.

Типичные ловушки. Считать любой CRC доказательством mismatch. Ожидать, что link падает на каждый FCS.`,
    trap: 'Считать, что duplex mismatch всегда роняет Link или сам исправляется.',
    next: 'CLI: show interfaces counters',
  },
  'new-ts-mtu': {
    brief: 'Маленький IPv4 ping проходит, большие файлы зависают при DF=1 — классический PMTUD black hole: пакет больше MTU с DF отбрасывается, а ICMP Fragmentation Needed не доходит.',
    deep: `Краткий ответ. Проверить MTU по пути и доставку ICMP Type 3 Code 4.

Как это работает. При DF=1 роутер не фрагментирует и должен послать ICMP Fragmentation Needed с Next-Hop MTU (RFC 1191). Если ICMP фильтруется — black hole. В IPv6 промежуточные узлы не фрагментируют; аналогично шлётся ICMPv6 Packet Too Big.

Практический пример. VPN снижает MTU до 1400, firewall режет ICMP type 3 code 4. Ping 56 байт работает, файл зависает.

Диагностика. ping с DF и растущим размером. tcpdump на ICMP. Проверка ACL. Для IPv6 — Packet Too Big.

Типичные ловушки. Думать, что сеть всегда фрагментирует. Игнорировать разницу IPv4 и IPv6.`,
    trap: 'Считать, что при DF=1 роутер всё равно фрагментирует.',
    next: 'Теория IP/ICMP; практика ping -f',
  },
  'l1v2-a-poe-limit': {
    brief: '54,6 В без нагрузки и Class 0 не подтверждают, что линия отдаст 60 Вт. Нужно проверить стандарт/тип PoE, класс, бюджет PSE и работу под нагрузкой.',
    deep: `Краткий ответ. Напряжение холостого хода и Class 0 не равны бюджету 60 Вт.

Как это работает. 802.3af — до ~15,4 Вт на PSE / ~12,95 на PD. 802.3at — 30/25,5. 802.3bt Type 3 — 60/51, Type 4 — 90/71,3. Class 0 — это Type 1, не 60 Вт. Напряжение без нагрузки не гарантирует ток под нагрузкой.

Практический пример. Тестер показывает 54,6 В и Class 0. Устройство на 60 Вт не стартует на порту только 802.3at.

Диагностика. Требуемая мощность PD, show power inline, класс, бюджет, длина кабеля, нагрузочный тест.

Типичные ловушки. Принимать «больше 50 В» за любую мощность. Считать Class 0 достаточным для 60 Вт.`,
    trap: 'Выводить пригодность для 60 Вт только из напряжения или Class 0.',
    next: 'Теория L1: PoE стандарты и классы',
  },
  'l1v2-c-otdr-pulse': {
    brief: 'При импульсе 100 нс два близких события сливаются. Если динамического диапазона хватает, разумно уменьшить длительность импульса: короткий импульс улучшает разрешение и уменьшает мёртвые зоны.',
    deep: `Краткий ответ. Уменьшить длительность импульса.

Как это работает. Пространственное разрешение и мёртвые зоны OTDR растут с длительностью импульса. 100 нс даёт импульс порядка десятков метров — близкие события сливаются. Короткий импульс разделяет их, но снижает динамический диапазон. IOR меняет шкалу расстояния, а не способность разделить события. Усреднение помогает шуму, не разрешению.

Практический пример. На трассе 2 км при 100 нс два коннектора в 5 м видны как один пик. Переход на 10–30 нс разделяет их.

Диагностика. Текущая ширина импульса, длина волны, чистота торцов, launch cable. При необходимости два замера: короткий для ближней зоны, длинный для дальней.

Типичные ловушки. Увеличивать импульс «чтобы лучше видно». Менять только IOR.`,
    trap: 'Увеличивать импульс или менять только IOR в надежде разделить близкие события.',
    next: 'Теория/практика OTDR',
  },
  'l1v2-c-ring-evidence': {
    brief: 'Положение переключателя RING и Link на двух портах не доказывают работающее резервированное кольцо. Нужно сверить схему и настройки протокола, затем проверить поведение при контролируемом отказе пути.',
    deep: `Краткий ответ. Подтверждают соединения, роли и настройки протокола (MRP, RSTP и др.) и реакцию на разрыв.

Как это работает. Кольцо требует согласованной конфигурации: менеджер/root, клиенты, ring-порты. Протокол блокирует один порт в норме и открывает его при отказе. Link и положение переключателя показывают только физику или разрешение режима, не сходимость.

Практический пример. RING включён, оба порта Link Up, но domain MRP не совпадает. При обрыве волокна трафик пропадает. После выставления ролей и теста обрыва кольцо сходится в пределах профиля.

Диагностика. Схема, роли, статус blocking/forwarding, контролируемый обрыв, отсутствие неуправляемых устройств на пути.

Типичные ловушки. Принимать два Link или положение RING за доказательство. Не тестировать отказ.`,
    trap: 'Считать кольцо работающим только по RING или по Link на двух портах.',
    next: 'Теория STP/RSTP и промышленных колец',
  },
};

const INDIVIDUAL_DEEP: Record<
  string,
  { brief: string; deep: string; trap?: string; next?: string; ipv6Practice?: boolean; professional?: ProfessionalExplanation }
> = {
  ...ADVANCED_INDIVIDUAL_DEEP,
  ...APPLIED_INDIVIDUAL_DEEP,
};

export function getQuestionDeepDive(question: Question): QuestionDeepDive {
  const category = detectCategory(question);
  const correctText = question.correct.map((idx) => question.answers[idx]).join('; ');
  const individual = INDIVIDUAL_DEEP[question.id];
  const baseExpl = (question.explanation || '').trim();

  const briefAnswer =
    individual?.brief ||
    (baseExpl.length > 0 && baseExpl.length <= 220
      ? baseExpl
      : `Правильный ответ: «${correctText}».`);

  const deepAnalysis = individual
    ? individual.deep
    : enrichExplanation(question, category, baseExpl);

  const engineeringDeep =
    question.difficulty === 'advanced' || question.difficulty === 'applied'
      ? individual?.deep || (baseExpl.length > 80 ? baseExpl : undefined)
      : individual?.deep;

  return {
    questionId: question.id,
    category,
    categoryLabel: question.topic,
    categoryColor: getCategoryColor(category),
    briefAnswer,
    coreConcept: `Правильный ответ: «${correctText}». Тема: ${question.topic}.`,
    deepAnalysis,
    engineeringDeep,
    professional: individual?.professional,
    hasIndividualDeep: Boolean(individual),
    commonTrap: individual?.trap || detectCommonTrap(question),
    practicalTip: question.remember || getPracticalTip(category),
    memorizationRule: question.remember,
    visualDiagram: generateDiagramForQuestion(question),
    ipv4Practice: detectIpv4Practice(question),
    ipv6Practice: individual?.ipv6Practice ? { enabled: true } : undefined,
    keyTakeaways: generateKeyTakeaways(question, category, correctText),
    nextStudy: individual?.next,
  };
}

function detectCategory(q: Question): QuestionDeepDive['category'] {
  if (q.group === 'visual-l1') return 'visual';
  if (q.group === 'troubleshooting' || q.topic.includes('Диагностика')) return 'cli';
  if (q.group === 'tcpip' || q.topic.includes('TCP/IP') || q.topic.includes('Инкапсуляция')) return 'tcpip';
  if (q.group === 'l4' || q.topic.includes('L4') || q.topic.includes('TCP') || q.topic.includes('UDP')) return 'l4';
  if (
    q.group === 'l5-l7' ||
    q.topic.includes('L5') ||
    q.topic.includes('L7') ||
    q.topic.includes('DNS') ||
    q.topic.includes('DHCP') ||
    q.topic.includes('HTTP')
  )
    return 'l5_l7';
  if (
    q.group === 'l3' ||
    q.topic.includes('L3') ||
    q.topic.includes('IPv4') ||
    q.topic.includes('Маски') ||
    q.topic.includes('Подсети')
  )
    return 'l3';
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
      return 'from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/30';
    case 'l4':
      return 'from-violet-500/20 to-purple-500/10 text-violet-300 border-violet-500/30';
    case 'l5_l7':
      return 'from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30';
    case 'tcpip':
      return 'from-sky-500/20 to-indigo-500/10 text-sky-300 border-sky-500/30';
    case 'cli':
      return 'from-slate-500/20 to-zinc-500/10 text-slate-300 border-slate-500/30';
    case 'visual':
      return 'from-orange-500/20 to-amber-500/10 text-orange-300 border-orange-500/30';
    default:
      return 'from-slate-500/20 to-slate-500/10 text-slate-300 border-slate-500/30';
  }
}

/** Only real subnet/mask math — not ARP/routing mentions alone. */
function detectIpv4Practice(q: Question): QuestionDeepDive['ipv4Practice'] | undefined {
  const text = `${q.text} ${q.topic} ${q.explanation || ''}`.toLowerCase();
  const hasPrefix = /\/(8|9|[12]\d|30)\b/.test(text);
  const hasMaskWords =
    text.includes('маск') ||
    text.includes('подсет') ||
    text.includes('cidr') ||
    text.includes('usable host') ||
    text.includes('broadcast у');
  if (!hasPrefix && !hasMaskWords) return undefined;
  // Avoid false positives: pure ARP/NAT without calculation
  if (text.includes('arp') && !hasPrefix && !hasMaskWords) return undefined;

  let targetPrefix: number | undefined;
  const m = text.match(/\/(\d{1,2})/);
  if (m) {
    const n = Number(m[1]);
    if (n >= 8 && n <= 30) targetPrefix = n;
  }

  return {
    enabled: true,
    reason: 'Вопрос опирается на расчёт маски или границ подсети.',
    targetPrefix,
    targetMode: 'trainer',
  };
}

function enrichExplanation(
  q: Question,
  category: QuestionDeepDive['category'],
  base: string
): string {
  if (category === 'visual') {
    const extra =
      'На практике сверяйте маркировку, тип волокна и полировку торца. Грязь/неверный тип дают потери.';
    return base ? `${base}\n\n${extra}` : extra;
  }
  if (base.length > 40) return base;
  if (category === 'cli') {
    return `${base} Диагностику начинают с L1/L2, затем L3/L4 и сервисы.`.trim();
  }
  return base || 'Сверьте формулировку с стандартами темы.';
}

function detectCommonTrap(q: Question): string {
  const t = (q.text + ' ' + (q.explanation || '')).toLowerCase();
  if (t.includes('маск') || t.includes('хост')) {
    return 'Частая ошибка: забывают сеть/broadcast или путают шаг с числом хостов.';
  }
  if (t.includes('syn') || t.includes('handshake')) {
    return 'Часто путают порядок флагов handshake.';
  }
  if (q.group === 'visual-l1' || t.includes('оптик')) {
    return 'Сверяйте маркировку и тип разъёма, не только «на глаз».';
  }
  return 'Смотрите точные формулировки стандартов и исключения.';
}

function getPracticalTip(category: QuestionDeepDive['category']): string {
  switch (category) {
    case 'cli':
      return 'Сначала линк (L1/L2), затем маршруты и DNS.';
    case 'l3':
      return '`ip route` / `route print` — быстрый взгляд на шлюзы.';
    case 'l4':
      return '`ss -tulpn` — слушающие сокеты.';
    case 'l2':
      return 'MAC/CAM устаревает по aging, если узел молчит.';
    case 'visual':
      return 'Осмотр/чистка торца, сверка типа, затем измерение потерь.';
    default:
      return 'Не смешивайте симптомы разных слоёв модели.';
  }
}

function generateDiagramForQuestion(q: Question): string | undefined {
  if (q.topic.includes('Подсети') || q.topic.includes('Маски')) {
    return 'Шаг октета = 256 − маска; хостов = 2^(32 − prefix) − 2';
  }
  if (q.topic.includes('TCP') || q.topic.includes('Handshake')) {
    return 'Client → SYN → Server → SYN+ACK → Client → ACK';
  }
  return undefined;
}

function generateKeyTakeaways(
  q: Question,
  category: QuestionDeepDive['category'],
  correctText: string
): string[] {
  const tips = [`Правильный ответ: ${correctText}`, `Тема: ${q.topic}`];
  if (category === 'l3' && /\/\d+/.test(q.text)) {
    tips.push('Расчёт маски можно закрепить в IPv4-тренажёре');
  }
  return tips;
}

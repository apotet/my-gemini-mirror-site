# Аудит качества разборов

Всего вопросов: 862 (уникальных ID: 862)

## Автоматический скрининг PR #227

| Статус | Количество |
|--------|------------|
| PASS | 677 |
| FIX | 125 |
| REVIEW | 60 |
| UI | 0 |
| LINK | 0 |

## Пакет правок PR #227 (14 заявленных ID)

- ts-x12
- ts-x01
- ts-x03
- ts-x04
- ts-x05
- ts-x06
- ts-x07
- ts-x08
- ts-x10
- ts-x11
- ts-x13
- tr-07
- ts-d07
- l57-x17

## Проверка и исправления PR #228

Предыдущий реестр сохранён как срез PR #227. Метки PASS, FIX и REVIEW в нём рассчитывались эвристически. Длина пояснения сама по себе не показывает, понял ли читатель причину.

| Билеты | Что подтверждено | Исправление |
|---|---|---|
| `ts-x05` | В исходнике Cisco IOS объяснялся командой Linux `ip addr`. | Вывод `show ip interface brief`, разница между Status и Protocol, команда для проверки маски и ссылка на урок по show. |
| `ts-x12` | Запасное пояснение приписывало TCP-состояние LISTEN также UDP. | Разделены TCP LISTEN и UDP UNCONN в выводе `ss`. Добавлены значения флагов, ограничения по правам и примеры привязки к локальным адресам. |
| `l3-d01` | В двух строках сообщалось число пригодных адресов без вывода. | Показано, откуда берутся четыре адреса и какие два можно назначить узлам. |
| `l3-d02` | Был указан готовый шаг 32 без формулы. | Добавлены расчёт размера блока и способ найти broadcast через начало следующей сети. |
| `gen-mask-25` … `gen-mask-30` | Пояснения повторяли правильный вариант. | Общий вывод маски из количества битов, двоичный октет и проверка десятичного результата по ключу каждого билета. |

Контрольные примеры `l3-06` … `l3-10` и упражнения на адрес сети, broadcast, размер блока и число узлов проверены по механизму расчёта. Вопросы `l3-05`, `l3-16` и `l3-d03` проверяют выбор маршрута и не ведут в калькулятор масок. Ссылки IPv4 ведут сразу к расчёту нужного префикса для 84 билетов. IPv6 открывается на вкладке понятий для `review-ndp-1` и `review-slaac-4` … `review-slaac-6`, на вкладке типов адресов для `l3-d06`. Фильтрацию захвата, DAD и выбор маршрутизатора разбирают в материалах соответствующей темы без ссылки на упражнения, которых нет в IPv6-тренажёре.

Прогон по 862 записям проверяет наличие объяснения и структурирование текста форматтером. У 529 билетов есть индивидуальный подробный разбор, у 402 доступен профессиональный слой. Снимки попыток проверены отдельно. Зафиксирован хэш исходного банка после двух правок поля `explanation`. Обратная подстановка двух исходных текстов восстанавливает прежний хэш полного банка, включая все ключи, сложность и порядок вопросов.

Браузерная регрессия проверяет сборку в Chromium при 375 и 1440 px: последнюю попытку, мгновенный разбор, работу над ошибками и итог в макете, оба стиля текста, подсказки словаря, урок Cisco, переходы в IPv4/IPv6 и прокрутку длинного вывода внутри терминального блока.

Два старых скрипта вне CI воспроизводят прежние сбои на исходном HEAD PR #228. `study-text.test.mjs` ожидает старый набор ID профессиональных разборов, `practice-links.test.mjs` ожидает ранее снятую связь `l2-07` с CLI trunk. Эти расхождения не отражают новые маршруты обучения. Скрининг PR #227 остаётся очередью для содержательной проверки.

Сверка технических деталей проведена по [Cisco IOS Command Reference](https://www.cisco.com/en/US/docs/ios/security/command/reference/sec_s4.pdf), [ss(8)](https://man7.org/linux/man-pages/man8/ss.8.html), [netstat(8)](https://man7.org/linux/man-pages/man8/netstat.8.html) и [RFC 1878](https://www.rfc-editor.org/rfc/rfc1878).

## Содержательный аудит — пачка №1

База проверки — `0a25d652378ac7b60f6e362de06064901331696b` (main после PR #228). До правок зафиксированы 30 ID в порядке таблицы. Приоритет получили нетиповые сетевые вопросы и диагностический расчёт OTDR. Внутри сетевой группы сохранён порядок исходного реестра. Фото и повторяющиеся расчётные шаблоны оставлены в очереди.

По каждому ID проверены условие, варианты и ключ, базовое и отображаемое краткое пояснение, отдельный подробный и профессиональный текст при наличии, тематические ссылки и подсказки словаря. Отсутствие дополнительного слоя не меняло вердикт, если объяснения хватало для поставленного вопроса. Правки пояснений применены через общий разбор. Банк, формулировки, варианты, ключи, сложности и снимки попыток не редактировались.

| ID | Старый статус | Новый статус | Причина | Исправление |
|---|---|---|---|---|
| l3-04 | FIX | PASS | Правило выбора верное. Подсказка про расчёт маски у маршрута по умолчанию уводила в другую тему. | Убрана подсказка, добавлен урок о статических маршрутах. |
| l3-13 | FIX | PASS | Пара Echo Request/Echo Reply описана верно. В билете отсутствовал переход к разбору того, что подтверждает ping. | Связь с уроком по диагностике. |
| l3-14 | FIX | PASS | Фраза про ограничение петель не уточняла, что ограничивается жизнь отдельного пакета. | Уточнены действие TTL при пересылке и результат исчерпания. Добавлен урок по OSI и PDU. |
| l4-01 | FIX | PASS | Термин «сегмент» верный. Подсказка про слушающие сокеты не помогает различить заголовки в захвате. | Подсказка про границы сегмента, пакета и кадра. Связь с уроком по PDU. |
| tcp-01 | FIX | PASS | Функции IP и маршрутизации обосновывают примерное соответствие Internet Layer и L3. | — |
| tcp-02 | FIX | PASS | Слова «обычно» и «в практической модели» задают границы сопоставления Application и L5–L7. | — |
| tcp-04 | FIX | PASS | Порт ошибочно назван адресом приложения. Подсказка про расчёт подсетей была нерелевантна. | Показаны роли MAC, IP и транспортного порта, уточнена роль VLAN ID. Добавлен урок по PDU. |
| tcp-07 | FIX | PASS | Protocol 1 и отсутствие TCP/UDP-портов описаны верно. Не было перехода к уроку про разбор поля Protocol. | Связь с уроком по инкапсуляции. |
| tcp-09 | FIX | PASS | Пример 1500/1460 не объяснял границы MTU и MSS и не учитывал влияние TCP-опций на данные конкретного сегмента. | Определения, расчёт без опций и расчёт при 12 байтах опций TCP. Добавлен урок по инкапсуляции. |
| gen-port-0 | FIX | PASS | Для HTTP/1.1 без TLS порт по умолчанию 80. Пояснение уточняет TCP. | — |
| gen-port-1 | FIX | PASS | Для HTTPS с HTTP/1.1 или HTTP/2 порт по умолчанию 443. Пояснение уточняет TCP, HTTP/3 исключён условием. | — |
| gen-port-4 | FIX | PASS | Порт 21/TCP относится к управляющему соединению FTP. Условие явно задаёт управление. | — |
| gen-port-15 | FIX | PASS | Стандартный порт LDAP поверх TCP — 389. Условие задаёт соединение без TLS. | — |
| gen-port-16 | FIX | PASS | Microsoft указывает 3389/TCP для прямого RDP. UDP исключён условием. | — |
| gen-osi-a-7 | FIX | PASS | Пояснение повторяло назначение L3 из условия без механизма выбора пути. | Показан выбор по IP-префиксу и роль MAC на текущем канале. Добавлен урок по PDU. |
| gen-osi-a-11 | FIX | PASS | Пояснение пересказывало условие. Подсказка про подсети не относилась к портам. | Показана доставка к сокету по протоколу и порту. Добавлен урок по TCP. |
| gen-osi-a-13 | FIX | PASS | Оба слоя верно объясняют подтверждения и повторную передачу. Упомянутый урок TCP был доступен только как текст. | Добавлена двусторонняя связь с уроком TCP. |
| new-l3-23 | FIX | PASS | Последний адрес блока из 512 адресов вычислен правильно. Не было прямого перехода в обещанный тренажёр. | IPv4-калькулятор открывается с /23. |
| new-tcpip-payload | FIX | PASS | Инкапсуляция объяснена корректно. Не было перехода к уроку, в котором показана граница TCP и IP. | Связь с уроком по инкапсуляции. |
| review-poe-29 | FIX | PASS | Роли PSE и PD названы правильно. Практическая подсказка была про MAC-таблицу, а терминов не было в словаре. | Подсказка о бюджете PoE и требованиях камеры. Добавлены подсказки PSE и PD. |
| tcpip-x01 | FIX | PASS | Пояснение перечисляет четыре слоя именно классической модели TCP/IP. | — |
| tcpip-x02 | FIX | PASS | Формулировка про «объединение» могла восприниматься как точное архитектурное соответствие. | Объяснено, что сопоставляются функции в учебных моделях. |
| tcpip-x04 | FIX | PASS | Пояснение повторяло название PDU, не показывая его место в инкапсуляции. | Показаны границы сегмента, пакета и кадра. Добавлен урок по инкапсуляции. |
| tcpip-x05 | FIX | PASS | Вопрос просит ближайшее учебное соответствие Link/Network Access уровням L1–L2. Пояснение раскрывает роль среды и канального уровня. | — |
| tcpip-x07 | FIX | PASS | Пояснение повторяло ключ без уточнения роли IP-адреса назначения. | Показан поиск по префиксу назначения. Добавлен урок по PDU. |
| tcpip-x08 | FIX | PASS | Пояснение сводило назначение портов к соединениям. Подсказка про подсети была нерелевантна. | Показано, как TCP и UDP доставляют данные сокетам. Добавлен урок по TCP. |
| tcpip-x10 | FIX | PASS | Разбор ARP привязывает MAC к следующему получателю в локальном сегменте. Урок и стенд уже соответствуют теме. | — |
| tcpip-x13 | FIX | PASS | Пояснение ставило знак равенства между уровнями и не называло общую транспортную функцию. | Показана доставка между конечными точками через порты и роль IP. Добавлен урок по TCP. |
| tcpip-x15 | FIX | PASS | Перечень слоёв повторял порядок и не показывал, что добавляется на каждом шаге. | Показано вложение заголовков и полезной нагрузки до Ethernet-кадра. |
| diag177-otdr-bidirectional | FIX | PASS | Обе отметки относятся к одному стыку, среднее со знаками составляет 0,14 дБ. Оба слоя и урок объясняют метод. | — |

**Итог пачки.** 11 ложных FIX, 19 билетов исправлены, 0 оставлено REVIEW. В очереди исходных FIX остаётся **83** ID: из 125 исключены 30 из этой пачки и 12 поимённо проверенных в PR #228 (`l3-06`, `l3-08`, `l3-09`, `l3-10`, `l3-d01`, `l3-d02`, `gen-mask-25`…`gen-mask-30`). Исходные 60 меток REVIEW находятся в отдельной очереди. Срез PR #227 ниже оставлен для истории, текущие вердикты проверенных билетов учитываются по результатам пачек.

Технические источники:

- IPv4: выбор маршрута и TTL — [RFC 1812, §§ 5.2.4.3 и 5.3.1](https://www.rfc-editor.org/rfc/rfc1812.html); Echo Request/Reply и номер протокола — [RFC 792](https://www.rfc-editor.org/rfc/rfc792.html); размер /23 — [RFC 4632, § 3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1); ARP в Ethernet — [RFC 826](https://www.rfc-editor.org/rfc/rfc826.html).
- Уровни, вложение, порты и размеры: [RFC 1122, § 1.1.3](https://www.rfc-editor.org/rfc/rfc1122.html#section-1.1.3), [RFC 791, § 3.1](https://www.rfc-editor.org/rfc/rfc791.html#section-3.1), [RFC 894](https://www.rfc-editor.org/rfc/rfc894.html), [RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html), [RFC 768](https://www.rfc-editor.org/rfc/rfc768.html), [RFC 6691, §§ 2–3](https://www.rfc-editor.org/rfc/rfc6691.html#section-2).
- Порты: [HTTP/HTTPS — RFC 9110, § 4.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-4.2), [HTTP/2 — RFC 9113, § 3](https://www.rfc-editor.org/rfc/rfc9113.html#section-3), [FTP — RFC 959, § 8](https://www.rfc-editor.org/rfc/rfc959.html#section-8), [LDAP — RFC 4511, § 5.2](https://www.rfc-editor.org/rfc/rfc4511.html#section-5.2), [RDP — Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/remote/ports-used-by-rds).
- Физический уровень: [подача питания Ethernet — Cisco](https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/infra/poe/poe-configuration-guide/g-poe/c-poe-and-switch.html), [двустороннее усреднение OTDR — EXFO, Application Note 385](https://www.exfo.com/contentassets/3d776ed03c01451d8e1d0cdb83370c4b/exfo_anote385_understanding-mitigating-otdr-gainers_en.pdf) и [FOA](https://www.foa.org/tech/ref/testing/OTDR/OTDR.html).

## Полный реестр PR #227

| ID | Group | Status | hasDeep | Reasons |
|----|-------|--------|---------|---------|
| l1-01 | l1-l2 | PASS | true | ok |
| l1-02 | l1-l2 | PASS | true | ok |
| l1-03 | l1-l2 | PASS | true | ok |
| l1-04 | l1-l2 | PASS | true | ok |
| l1-05 | l1-l2 | PASS | true | ok |
| l1-06 | l1-l2 | PASS | true | ok |
| l2-01 | l1-l2 | PASS | true | ok |
| l2-02 | l1-l2 | PASS | true | ok |
| l2-03 | l1-l2 | PASS | true | ok |
| l2-04 | l1-l2 | PASS | true | ok |
| l2-05 | l1-l2 | PASS | true | ok |
| l2-06 | l1-l2 | PASS | true | ok |
| l2-07 | l1-l2 | PASS | true | ok |
| l2-08 | l1-l2 | PASS | true | ok |
| l2-09 | l1-l2 | PASS | true | ok |
| l2-10 | l1-l2 | PASS | true | ok |
| l2-11 | l1-l2 | PASS | true | ok |
| l2-12 | l1-l2 | PASS | true | ok |
| l3-01 | l3 | REVIEW | false | no deep, medium length |
| l3-02 | l3 | PASS | false | ok |
| l3-03 | l3 | PASS | true | ok |
| l3-04 | l3 | FIX | false | short + no deep |
| l3-05 | l3 | PASS | true | ok |
| l3-06 | l3 | FIX | false | short + no deep |
| l3-07 | l3 | REVIEW | false | no deep, medium length |
| l3-08 | l3 | FIX | false | short + no deep |
| l3-09 | l3 | FIX | false | short + no deep |
| l3-10 | l3 | FIX | false | short + no deep |
| l3-11 | l3 | PASS | true | ok |
| l3-12 | l3 | PASS | true | ok |
| l3-13 | l3 | FIX | false | short + no deep |
| l3-14 | l3 | FIX | false | short + no deep |
| l3-15 | l3 | PASS | true | ok |
| l3-16 | l3 | PASS | true | ok |
| l4-01 | l4 | FIX | false | short + no deep |
| l4-02 | l4 | PASS | true | ok |
| l4-03 | l4 | PASS | true | ok |
| l4-04 | l4 | PASS | true | ok |
| l4-05 | l4 | PASS | true | ok |
| l4-07 | l4 | PASS | true | ok |
| l4-08 | l4 | PASS | true | ok |
| l4-09 | l4 | PASS | true | ok |
| l4-10 | l4 | PASS | true | ok |
| l5-01 | l5-l7 | PASS | false | ok |
| l5-02 | l5-l7 | PASS | true | ok |
| l6-01 | l5-l7 | PASS | true | ok |
| l6-02 | l5-l7 | REVIEW | false | no deep, medium length |
| l7-01 | l5-l7 | PASS | true | ok |
| l7-02 | l5-l7 | PASS | true | ok |
| l7-03 | l5-l7 | PASS | true | ok |
| l7-04 | l5-l7 | PASS | true | ok |
| l7-05 | l5-l7 | PASS | true | ok |
| l7-06 | l5-l7 | PASS | true | ok |
| tcp-01 | tcpip | FIX | false | short + no deep |
| tcp-02 | tcpip | FIX | false | short + no deep |
| tcp-03 | tcpip | PASS | true | ok |
| tcp-04 | tcpip | FIX | false | short + no deep |
| tcp-05 | tcpip | PASS | true | ok |
| tcp-06 | tcpip | PASS | true | ok |
| tcp-07 | tcpip | FIX | false | short + no deep |
| tcp-08 | tcpip | PASS | false | ok |
| tcp-09 | tcpip | FIX | false | short + no deep |
| tcp-10 | tcpip | PASS | true | ok |
| tr-01 | troubleshooting | PASS | true | ok |
| tr-02 | troubleshooting | PASS | true | ok |
| tr-03 | troubleshooting | PASS | true | ok |
| tr-04 | troubleshooting | PASS | true | ok |
| tr-05 | troubleshooting | PASS | true | ok |
| tr-06 | troubleshooting | PASS | true | ok |
| tr-07 | troubleshooting | PASS | true | ok |
| tr-08 | troubleshooting | PASS | true | ok |
| tr-09 | troubleshooting | PASS | true | ok |
| tr-10 | troubleshooting | PASS | true | ok |
| tr-11 | troubleshooting | PASS | true | ok |
| tr-12 | troubleshooting | PASS | true | ok |
| gen-net-25-0 | l3 | FIX | false | short + no deep |
| gen-bc-25-0 | l3 | FIX | false | short + no deep |
| gen-net-25-1 | l3 | FIX | false | short + no deep |
| gen-bc-25-1 | l3 | FIX | false | short + no deep |
| gen-net-25-2 | l3 | PASS | true | ok |
| gen-bc-25-2 | l3 | PASS | true | ok |
| gen-net-25-3 | l3 | PASS | true | ok |
| gen-bc-25-3 | l3 | PASS | true | ok |
| gen-net-25-4 | l3 | PASS | true | ok |
| gen-bc-25-4 | l3 | PASS | true | ok |
| gen-mask-25 | l3 | FIX | false | very short |
| gen-hosts-25 | l3 | FIX | false | short + no deep |
| gen-block-25 | l3 | FIX | false | very short |
| gen-net-26-0 | l3 | FIX | false | short + no deep |
| gen-bc-26-0 | l3 | FIX | false | short + no deep |
| gen-net-26-1 | l3 | PASS | true | ok |
| gen-bc-26-1 | l3 | PASS | true | ok |
| gen-net-26-2 | l3 | FIX | false | short + no deep |
| gen-bc-26-2 | l3 | FIX | false | short + no deep |
| gen-net-26-3 | l3 | FIX | false | short + no deep |
| gen-bc-26-3 | l3 | FIX | false | short + no deep |
| gen-net-26-4 | l3 | PASS | true | ok |
| gen-bc-26-4 | l3 | PASS | true | ok |
| gen-mask-26 | l3 | FIX | false | very short |
| gen-hosts-26 | l3 | FIX | false | short + no deep |
| gen-block-26 | l3 | FIX | false | very short |
| gen-net-27-0 | l3 | FIX | false | short + no deep |
| gen-bc-27-0 | l3 | FIX | false | short + no deep |
| gen-net-27-1 | l3 | FIX | false | short + no deep |
| gen-bc-27-1 | l3 | FIX | false | short + no deep |
| gen-net-27-2 | l3 | FIX | false | short + no deep |
| gen-bc-27-2 | l3 | FIX | false | short + no deep |
| gen-net-27-3 | l3 | FIX | false | short + no deep |
| gen-bc-27-3 | l3 | FIX | false | short + no deep |
| gen-net-27-4 | l3 | FIX | false | short + no deep |
| gen-bc-27-4 | l3 | FIX | false | short + no deep |
| gen-mask-27 | l3 | FIX | false | very short |
| gen-hosts-27 | l3 | PASS | true | ok |
| gen-block-27 | l3 | FIX | false | very short |
| gen-net-28-0 | l3 | FIX | false | short + no deep |
| gen-bc-28-0 | l3 | FIX | false | short + no deep |
| gen-net-28-1 | l3 | FIX | false | short + no deep |
| gen-bc-28-1 | l3 | FIX | false | short + no deep |
| gen-net-28-2 | l3 | FIX | false | short + no deep |
| gen-bc-28-2 | l3 | FIX | false | short + no deep |
| gen-net-28-3 | l3 | FIX | false | short + no deep |
| gen-bc-28-3 | l3 | FIX | false | short + no deep |
| gen-net-28-4 | l3 | FIX | false | short + no deep |
| gen-bc-28-4 | l3 | FIX | false | short + no deep |
| gen-mask-28 | l3 | FIX | false | very short |
| gen-hosts-28 | l3 | FIX | false | short + no deep |
| gen-block-28 | l3 | FIX | false | very short |
| gen-net-29-0 | l3 | FIX | false | short + no deep |
| gen-bc-29-0 | l3 | FIX | false | short + no deep |
| gen-net-29-1 | l3 | FIX | false | short + no deep |
| gen-bc-29-1 | l3 | FIX | false | short + no deep |
| gen-net-29-2 | l3 | FIX | false | short + no deep |
| gen-bc-29-2 | l3 | FIX | false | short + no deep |
| gen-net-29-3 | l3 | FIX | false | short + no deep |
| gen-bc-29-3 | l3 | FIX | false | short + no deep |
| gen-net-29-4 | l3 | FIX | false | short + no deep |
| gen-bc-29-4 | l3 | FIX | false | short + no deep |
| gen-mask-29 | l3 | FIX | false | very short |
| gen-hosts-29 | l3 | FIX | false | short + no deep |
| gen-block-29 | l3 | FIX | false | very short |
| gen-net-30-0 | l3 | FIX | false | short + no deep |
| gen-bc-30-0 | l3 | FIX | false | short + no deep |
| gen-net-30-1 | l3 | FIX | false | short + no deep |
| gen-bc-30-1 | l3 | FIX | false | short + no deep |
| gen-net-30-2 | l3 | FIX | false | short + no deep |
| gen-bc-30-2 | l3 | FIX | false | short + no deep |
| gen-net-30-3 | l3 | FIX | false | short + no deep |
| gen-bc-30-3 | l3 | FIX | false | short + no deep |
| gen-net-30-4 | l3 | FIX | false | short + no deep |
| gen-bc-30-4 | l3 | FIX | false | short + no deep |
| gen-mask-30 | l3 | FIX | false | very short |
| gen-hosts-30 | l3 | FIX | false | short + no deep |
| gen-block-30 | l3 | FIX | false | very short |
| gen-bin-dec-0 | l3 | REVIEW | false | no deep, medium length |
| gen-dec-bin-0 | l3 | REVIEW | false | no deep, medium length |
| gen-bin-dec-128 | l3 | REVIEW | false | no deep, medium length |
| gen-dec-bin-128 | l3 | REVIEW | false | no deep, medium length |
| gen-bin-dec-192 | l3 | REVIEW | false | no deep, medium length |
| gen-dec-bin-192 | l3 | REVIEW | false | no deep, medium length |
| gen-bin-dec-224 | l3 | REVIEW | false | no deep, medium length |
| gen-dec-bin-224 | l3 | REVIEW | false | no deep, medium length |
| gen-bin-dec-240 | l3 | REVIEW | false | no deep, medium length |
| gen-dec-bin-240 | l3 | REVIEW | false | no deep, medium length |
| gen-bin-dec-248 | l3 | REVIEW | false | no deep, medium length |
| gen-dec-bin-248 | l3 | REVIEW | false | no deep, medium length |
| gen-bin-dec-252 | l3 | PASS | true | ok |
| gen-dec-bin-252 | l3 | REVIEW | false | no deep, medium length |
| gen-bin-dec-254 | l3 | REVIEW | false | no deep, medium length |
| gen-dec-bin-254 | l3 | REVIEW | false | no deep, medium length |
| gen-port-0 | l4 | FIX | false | very short |
| gen-transport-0 | l4 | PASS | true | ok |
| gen-port-1 | l4 | FIX | false | short + no deep |
| gen-transport-1 | l4 | PASS | true | ok |
| gen-port-2 | l4 | REVIEW | false | no deep, medium length |
| gen-transport-2 | l4 | PASS | true | ok |
| gen-port-3 | l4 | PASS | false | ok |
| gen-transport-3 | l4 | PASS | true | ok |
| gen-port-4 | l4 | FIX | false | very short |
| gen-transport-4 | l4 | PASS | true | ok |
| gen-port-5 | l4 | PASS | false | ok |
| gen-transport-5 | l4 | PASS | true | ok |
| gen-port-6 | l5-l7 | PASS | true | ok |
| gen-transport-6 | l4 | PASS | true | ok |
| gen-port-7 | l5-l7 | PASS | true | ok |
| gen-transport-7 | l4 | PASS | true | ok |
| gen-port-8 | l5-l7 | PASS | true | ok |
| gen-transport-8 | l4 | PASS | true | ok |
| gen-port-9 | l5-l7 | PASS | true | ok |
| gen-transport-9 | l4 | PASS | true | ok |
| gen-port-10 | l4 | PASS | false | ok |
| gen-transport-10 | l4 | PASS | true | ok |
| gen-port-11 | l5-l7 | PASS | true | ok |
| gen-transport-11 | l4 | PASS | true | ok |
| gen-port-12 | l4 | REVIEW | false | no deep, medium length |
| gen-transport-12 | l4 | PASS | true | ok |
| gen-port-13 | l5-l7 | PASS | true | ok |
| gen-transport-13 | l4 | PASS | true | ok |
| gen-port-14 | l5-l7 | PASS | true | ok |
| gen-transport-14 | l4 | PASS | true | ok |
| gen-port-15 | l4 | FIX | false | short + no deep |
| gen-transport-15 | l4 | PASS | true | ok |
| gen-port-16 | l4 | FIX | false | short + no deep |
| gen-transport-16 | l4 | PASS | true | ok |
| gen-port-17 | l4 | PASS | false | ok |
| gen-transport-17 | l4 | PASS | true | ok |
| gen-osi-a-0 | l1-l2 | PASS | true | ok |
| gen-osi-a-1 | l1-l2 | PASS | true | ok |
| gen-osi-a-2 | l1-l2 | PASS | true | ok |
| gen-osi-a-3 | l1-l2 | PASS | true | ok |
| gen-osi-a-4 | l1-l2 | PASS | true | ok |
| gen-osi-a-5 | l1-l2 | PASS | true | ok |
| gen-osi-a-6 | l1-l2 | PASS | true | ok |
| gen-osi-a-7 | l3 | FIX | false | short + no deep |
| gen-osi-a-8 | l3 | PASS | true | ok |
| gen-osi-a-9 | l3 | REVIEW | false | no deep, medium length |
| gen-osi-a-10 | l3 | PASS | true | ok |
| gen-osi-a-11 | l4 | FIX | false | short + no deep |
| gen-osi-a-12 | l4 | PASS | false | ok |
| gen-osi-a-13 | l4 | FIX | true | very short |
| gen-osi-a-18 | l5-l7 | PASS | true | ok |
| gen-osi-a-19 | l5-l7 | PASS | true | ok |
| gen-diag-0 | troubleshooting | PASS | true | ok |
| gen-diag-2 | troubleshooting | PASS | true | ok |
| gen-diag-3 | troubleshooting | PASS | true | ok |
| gen-diag-4 | troubleshooting | PASS | true | ok |
| gen-diag-5 | troubleshooting | PASS | true | ok |
| gen-diag-6 | troubleshooting | PASS | true | ok |
| gen-diag-7 | troubleshooting | PASS | true | ok |
| gen-diag-8 | troubleshooting | PASS | true | ok |
| gen-diag-9 | troubleshooting | PASS | true | ok |
| gen-diag-10 | troubleshooting | PASS | true | ok |
| gen-diag-11 | troubleshooting | PASS | true | ok |
| gen-diag-12 | troubleshooting | PASS | true | ok |
| gen-diag-13 | troubleshooting | PASS | true | ok |
| k-01 | tcpip | PASS | true | ok |
| k-02 | tcpip | PASS | true | ok |
| k-03 | tcpip | PASS | true | ok |
| k-04 | tcpip | PASS | true | ok |
| k-05 | tcpip | PASS | true | ok |
| k-06 | tcpip | REVIEW | false | no deep, medium length |
| k-07 | tcpip | PASS | true | ok |
| k-08 | tcpip | REVIEW | false | no deep, medium length |
| k-09 | l4 | PASS | true | ok |
| k-10 | l3 | PASS | true | ok |
| k-11 | l1-l2 | PASS | true | ok |
| new-l2-switch-photo | l1-l2 | PASS | false | ok |
| new-l2-patch-passive | l1-l2 | PASS | true | ok |
| new-l2-full-duplex | l1-l2 | PASS | true | ok |
| new-l3-23 | l3 | FIX | false | short + no deep |
| new-l3-next-hop | l3 | PASS | true | ok |
| new-l3-arp-scope | l3 | PASS | true | ok |
| new-l4-udp-pdu | l4 | PASS | true | ok |
| new-l4-retransmit | l4 | PASS | true | ok |
| new-l7-tls | l5-l7 | PASS | true | ok |
| new-l7-dns | l5-l7 | PASS | true | ok |
| new-l7-dhcp | l5-l7 | PASS | true | ok |
| new-l6-format | l5-l7 | PASS | false | ok |
| new-tcpip-payload | tcpip | FIX | false | short + no deep |
| new-tcpip-trailer | tcpip | PASS | true | ok |
| new-tcpip-router | tcpip | PASS | true | ok |
| new-ts-photo-panel | troubleshooting | PASS | true | ok |
| new-ts-vlan | troubleshooting | PASS | true | ok |
| new-ts-mtu | troubleshooting | PASS | true | ok |
| new-ts-duplex | troubleshooting | PASS | true | ok |
| new-ts-dns | troubleshooting | PASS | true | ok |
| photo-lc | visual-l1 | FIX | false | short + no deep |
| photo-sc | visual-l1 | FIX | false | short + no deep |
| photo-st | visual-l1 | REVIEW | false | no deep, medium length |
| photo-fc | visual-l1 | FIX | false | short + no deep |
| photo-lc-sc-order | visual-l1 | FIX | false | short + no deep |
| photo-polarity | visual-l1 | PASS | true | ok |
| photo-sfp | visual-l1 | PASS | false | ok |
| photo-sfp-appearance | visual-l1 | PASS | false | ok |
| photo-formfactor-compat | visual-l1 | PASS | true | ok |
| photo-gbic-sfp | visual-l1 | REVIEW | false | no deep, medium length |
| photo-sm-mm-colors | visual-l1 | PASS | false | ok |
| photo-hybrid | visual-l1 | PASS | false | ok |
| photo-patchcord | visual-l1 | PASS | false | ok |
| photo-apc | visual-l1 | REVIEW | false | no deep, medium length |
| photo-dirty-end | visual-l1 | PASS | true | ok |
| photo-cleaning | visual-l1 | PASS | false | ok |
| photo-otdr | visual-l1 | REVIEW | false | no deep, medium length |
| photo-otdr-use | visual-l1 | PASS | true | ok |
| photo-cable | visual-l1 | REVIEW | false | no deep, medium length |
| photo-panel | visual-l1 | FIX | false | short + no deep |
| photo-lc-duplex | visual-l1 | PASS | false | ok |
| photo-lc-latch | visual-l1 | REVIEW | false | no deep, medium length |
| photo-sc-push | visual-l1 | PASS | false | ok |
| photo-sc-color | visual-l1 | PASS | false | ok |
| photo-st-bayonet | visual-l1 | REVIEW | false | no deep, medium length |
| photo-st-usage | visual-l1 | PASS | false | ok |
| photo-fc-usage | visual-l1 | PASS | false | ok |
| photo-fc-apc-mix | visual-l1 | PASS | false | ok |
| photo-lcsc-size | visual-l1 | REVIEW | false | no deep, medium length |
| photo-txrx-link | visual-l1 | PASS | false | ok |
| photo-txrx-safety | visual-l1 | PASS | false | ok |
| photo-sfp-contacts | visual-l1 | PASS | false | ok |
| photo-xfp-label | visual-l1 | PASS | false | ok |
| photo-sfpplus-label | visual-l1 | PASS | false | ok |
| photo-gbic-size | visual-l1 | PASS | false | ok |
| photo-blue-upc | visual-l1 | PASS | false | ok |
| photo-patch-caps | visual-l1 | PASS | false | ok |
| photo-dirty-safety | visual-l1 | PASS | false | ok |
| photo-otdr-slope | visual-l1 | REVIEW | false | no deep, medium length |
| photo-otdr-end | visual-l1 | REVIEW | false | no deep, medium length |
| photo-cable-colors | visual-l1 | PASS | false | ok |
| photo-cable-terminate | visual-l1 | PASS | false | ok |
| photo-panel-role | visual-l1 | PASS | false | ok |
| photo-panel-bend | visual-l1 | PASS | false | ok |
| photo-switch-combo | visual-l1 | REVIEW | false | no deep, medium length |
| photo-switch-led | visual-l1 | PASS | false | ok |
| photo-switch-sfp | visual-l1 | PASS | false | ok |
| eth-std-8023 | l1-l2 | PASS | true | ok |
| eth-min-frame | l1-l2 | PASS | true | ok |
| eth-collision | l1-l2 | PASS | true | ok |
| eth-vlan-benefits | l1-l2 | PASS | true | ok |
| eth-lacp | l1-l2 | PASS | true | ok |
| review-ndp-1 | l3 | PASS | true | ok |
| review-ndp-2 | l3 | PASS | true | ok |
| review-ndp-3 | l3 | PASS | true | ok |
| review-slaac-4 | l3 | PASS | true | ok |
| review-slaac-5 | l3 | PASS | true | ok |
| review-slaac-6 | troubleshooting | PASS | true | ok |
| review-lldp-7 | l1-l2 | PASS | true | ok |
| review-lldp-8 | troubleshooting | PASS | true | ok |
| review-igmp-9 | l1-l2 | PASS | true | ok |
| review-igmp-10 | l3 | PASS | true | ok |
| review-prp-12 | l1-l2 | PASS | true | ok |
| review-prp-13 | l1-l2 | PASS | true | ok |
| review-hsr-14 | l1-l2 | REVIEW | false | no deep, medium length |
| review-hsr-15 | l1-l2 | PASS | true | ok |
| review-ptp-16 | l5-l7 | PASS | true | ok |
| review-ptp-17 | l5-l7 | PASS | true | ok |
| review-ptp-18 | l5-l7 | PASS | true | ok |
| review-dot1x-19 | l1-l2 | PASS | true | ok |
| review-dot1x-20 | troubleshooting | PASS | true | ok |
| review-qos-21 | l3 | PASS | true | ok |
| review-qos-22 | troubleshooting | PASS | true | ok |
| review-syslog-23 | l5-l7 | PASS | true | ok |
| review-syslog-24 | l5-l7 | PASS | true | ok |
| review-syslog-25 | troubleshooting | PASS | true | ok |
| review-ospf-26 | l3 | PASS | true | ok |
| review-ospf-27 | l3 | PASS | true | ok |
| review-ospf-28 | troubleshooting | PASS | true | ok |
| review-poe-29 | l1-l2 | FIX | false | short + no deep |
| review-poe-30 | troubleshooting | PASS | true | ok |
| review-osi-34 | l5-l7 | PASS | true | ok |
| review-osi-35 | l5-l7 | PASS | true | ok |
| l1v2-a-8p8c | visual-l1 | REVIEW | false | no deep, medium length |
| l1v2-a-category-limit | visual-l1 | REVIEW | false | no deep, medium length |
| l1v2-a-patch-role | visual-l1 | PASS | false | ok |
| l1v2-a-pairs | visual-l1 | PASS | false | ok |
| l1v2-a-untwist | visual-l1 | PASS | false | ok |
| l1v2-a-uutp | visual-l1 | PASS | false | ok |
| l1v2-a-stranded | visual-l1 | PASS | false | ok |
| l1v2-a-jacket-limit | visual-l1 | PASS | false | ok |
| l1v2-a-futp | visual-l1 | PASS | false | ok |
| l1v2-a-screen-action | visual-l1 | PASS | false | ok |
| l1v2-a-pair-foil | visual-l1 | PASS | false | ok |
| l1v2-a-contact-solid | visual-l1 | PASS | false | ok |
| l1v2-a-contact-damage | visual-l1 | PASS | false | ok |
| l1v2-a-contacts-compare | visual-l1 | PASS | false | ok |
| l1v2-a-keystone | visual-l1 | REVIEW | false | no deep, medium length |
| l1v2-a-idc-no-strip | visual-l1 | PASS | false | ok |
| l1v2-a-panel-passive | visual-l1 | REVIEW | false | no deep, medium length |
| l1v2-a-panel-label | visual-l1 | PASS | false | ok |
| l1v2-a-wall-port | visual-l1 | REVIEW | false | no deep, medium length |
| l1v2-a-panel-untwist | visual-l1 | PASS | false | ok |
| l1v2-a-panel-rating | visual-l1 | PASS | false | ok |
| l1v2-a-panel-stranded | visual-l1 | REVIEW | false | no deep, medium length |
| l1v2-a-rack-management | visual-l1 | PASS | false | ok |
| l1v2-a-rack-trace | visual-l1 | PASS | false | ok |
| l1v2-a-t568b | visual-l1 | PASS | false | ok |
| l1v2-a-crimp-inspect | visual-l1 | PASS | false | ok |
| l1v2-a-stripper | visual-l1 | PASS | false | ok |
| l1v2-a-stripper-depth | visual-l1 | PASS | false | ok |
| l1v2-a-cutters | visual-l1 | REVIEW | false | no deep, medium length |
| l1v2-a-cutters-error | visual-l1 | PASS | false | ok |
| l1v2-a-punchdown | visual-l1 | PASS | false | ok |
| l1v2-a-punchdown-side | visual-l1 | PASS | false | ok |
| l1v2-a-tester | visual-l1 | PASS | false | ok |
| l1v2-a-wiremap-limit | visual-l1 | PASS | false | ok |
| l1v2-a-tester-safe | visual-l1 | PASS | false | ok |
| l1v2-a-crimper | visual-l1 | REVIEW | false | no deep, medium length |
| l1v2-a-crimper-mismatch | visual-l1 | PASS | false | ok |
| l1v2-a-crimper-incomplete | visual-l1 | PASS | false | ok |
| l1v2-a-label-category | visual-l1 | PASS | false | ok |
| l1v2-a-label-sftp | visual-l1 | PASS | false | ok |
| l1v2-a-label-lshf | visual-l1 | PASS | false | ok |
| l1v2-a-label-four-pairs | visual-l1 | PASS | false | ok |
| l1v2-a-tone | visual-l1 | PASS | false | ok |
| l1v2-a-tone-use | visual-l1 | PASS | false | ok |
| l1v2-a-tone-error | visual-l1 | PASS | true | ok |
| l1v2-a-outlet-b | visual-l1 | PASS | false | ok |
| l1v2-a-outlet-a | visual-l1 | PASS | false | ok |
| l1v2-a-mark-cat5e | visual-l1 | PASS | false | ok |
| l1v2-a-mark-cat6 | visual-l1 | PASS | false | ok |
| l1v2-a-mark-frequency | visual-l1 | PASS | false | ok |
| l1v2-a-pvc-read | visual-l1 | PASS | false | ok |
| l1v2-a-solid-view | visual-l1 | PASS | false | ok |
| l1v2-a-solid-use | visual-l1 | PASS | false | ok |
| l1v2-a-nick-view | visual-l1 | PASS | false | ok |
| l1v2-a-nick-fix | visual-l1 | PASS | false | ok |
| l1v2-a-pass-view | visual-l1 | PASS | false | ok |
| l1v2-a-pass-finish | visual-l1 | REVIEW | false | no deep, medium length |
| l1v2-a-pass-offcut | visual-l1 | PASS | false | ok |
| l1v2-a-strain-view | visual-l1 | PASS | false | ok |
| l1v2-a-strain-fix | visual-l1 | PASS | false | ok |
| l1v2-a-precrimp | visual-l1 | PASS | false | ok |
| l1v2-a-dest-label | visual-l1 | PASS | false | ok |
| l1v2-a-device-label | visual-l1 | PASS | false | ok |
| l1v2-a-corrosion-view | visual-l1 | PASS | false | ok |
| l1v2-a-corrosion-action | visual-l1 | PASS | false | ok |
| l1v2-a-poe-purpose | visual-l1 | PASS | false | ok |
| l1v2-a-poe-connection | visual-l1 | PASS | false | ok |
| l1v2-a-poe-unloaded | visual-l1 | PASS | false | ok |
| l1v2-a-poe-class | visual-l1 | PASS | false | ok |
| l1v2-a-poe-limit | visual-l1 | PASS | true | ok |
| l1v2-a-mark-cat6a | visual-l1 | PASS | false | ok |
| l1v2-a-mark-channel | visual-l1 | PASS | false | ok |
| l1v2-a-pass-crimper-view | visual-l1 | PASS | false | ok |
| l1v2-a-pass-crimper-blade | visual-l1 | PASS | true | ok |
| l1v2-a-jacket-kink | visual-l1 | PASS | false | ok |
| l1v2-a-jacket-kink-action | visual-l1 | PASS | false | ok |
| l1v2-b-coating-tool | visual-l1 | PASS | false | ok |
| l1v2-b-strip-hole | visual-l1 | PASS | false | ok |
| l1v2-b-buffer-tool | visual-l1 | PASS | false | ok |
| l1v2-b-strip-damage | visual-l1 | PASS | false | ok |
| l1v2-b-cleaver-name | visual-l1 | PASS | false | ok |
| l1v2-b-cleave-sequence | visual-l1 | PASS | false | ok |
| l1v2-b-glass-scraps | visual-l1 | PASS | false | ok |
| l1v2-b-cleaner | visual-l1 | PASS | false | ok |
| l1v2-b-clean-again | visual-l1 | PASS | false | ok |
| l1v2-b-loading | visual-l1 | PASS | false | ok |
| l1v2-b-screen-before | visual-l1 | PASS | false | ok |
| l1v2-b-screen-xy | visual-l1 | PASS | false | ok |
| l1v2-b-screen-loss-read | visual-l1 | PASS | false | ok |
| l1v2-b-loss-estimate | visual-l1 | PASS | false | ok |
| l1v2-b-splice-angle-limit | visual-l1 | PASS | false | ok |
| l1v2-b-splice-loss-limit | visual-l1 | PASS | false | ok |
| l1v2-b-protect-next | visual-l1 | PASS | false | ok |
| l1v2-b-sleeve-cool | visual-l1 | PASS | false | ok |
| l1v2-b-transfer | visual-l1 | PASS | false | ok |
| l1v2-b-sleeve-purpose | visual-l1 | PASS | false | ok |
| l1v2-b-tray-role | visual-l1 | PASS | false | ok |
| l1v2-b-tray-service | visual-l1 | PASS | false | ok |
| l1v2-b-bend-loss | visual-l1 | PASS | false | ok |
| l1v2-b-apc-upc | visual-l1 | PASS | false | ok |
| l1v2-b-caps | visual-l1 | PASS | false | ok |
| l1v2-b-ferrule-dirty | visual-l1 | PASS | false | ok |
| l1v2-b-kevlar-purpose | visual-l1 | PASS | false | ok |
| l1v2-b-kevlar-glass | visual-l1 | PASS | false | ok |
| l1v2-b-position-message | visual-l1 | PASS | false | ok |
| l1v2-b-position-cause | visual-l1 | PASS | false | ok |
| l1v2-b-om3-real-label | visual-l1 | PASS | false | ok |
| l1v2-b-om3-length-label | visual-l1 | PASS | false | ok |
| l1v2-b-om3-outdoor | visual-l1 | PASS | false | ok |
| l1v2-b-simplex-real | visual-l1 | PASS | false | ok |
| l1v2-b-installed-pigtail | visual-l1 | PASS | false | ok |
| l1v2-b-installed-sleeves | visual-l1 | PASS | false | ok |
| l1v2-b-routing-risk | visual-l1 | PASS | false | ok |
| l1v2-b-routing-ferrule-limit | visual-l1 | PASS | false | ok |
| l1v2-b-tray-real-retainer | visual-l1 | PASS | false | ok |
| l1v2-c-vfl-task | visual-l1 | PASS | false | ok |
| l1v2-c-vfl-safe | visual-l1 | PASS | false | ok |
| l1v2-c-power-read | visual-l1 | PASS | false | ok |
| l1v2-c-power-reference | visual-l1 | PASS | false | ok |
| l1v2-c-power-wavelength | visual-l1 | PASS | false | ok |
| l1v2-c-source-reference | visual-l1 | PASS | false | ok |
| l1v2-c-loss-calculate | visual-l1 | REVIEW | false | no deep, medium length |
| l1v2-c-inspection-tool | visual-l1 | PASS | false | ok |
| l1v2-c-inspection-recheck | visual-l1 | PASS | false | ok |
| l1v2-c-otdr-parameters | visual-l1 | PASS | false | ok |
| l1v2-c-otdr-pulse | visual-l1 | PASS | true | ok |
| l1v2-c-trace-reflection | visual-l1 | PASS | false | ok |
| l1v2-c-trace-units | visual-l1 | PASS | false | ok |
| l1v2-c-trace-stacked | visual-l1 | PASS | false | ok |
| l1v2-c-qsfp-sm | visual-l1 | PASS | false | ok |
| l1v2-c-qsfp-cage | visual-l1 | PASS | true | ok |
| l1v2-c-qsfp-mm | visual-l1 | PASS | false | ok |
| l1v2-c-bidi-pair | visual-l1 | PASS | false | ok |
| l1v2-c-bidi-wrong-pair | visual-l1 | PASS | false | ok |
| l1v2-c-bidi-range | visual-l1 | PASS | false | ok |
| l1v2-c-adapter-purpose | visual-l1 | REVIEW | false | no deep, medium length |
| l1v2-c-closure-purpose | visual-l1 | PASS | false | ok |
| l1v2-c-closure-service | visual-l1 | PASS | false | ok |
| l1v2-c-converter-path | visual-l1 | PASS | false | ok |
| l1v2-c-converter-polarity | visual-l1 | PASS | true | ok |
| l1v2-c-injector-direction | visual-l1 | PASS | false | ok |
| l1v2-c-splitter-role | visual-l1 | PASS | false | ok |
| l1v2-c-poe-marked-ports | visual-l1 | PASS | false | ok |
| l1v2-c-poe-budget | visual-l1 | PASS | true | ok |
| l1v2-c-poe-standard | visual-l1 | PASS | false | ok |
| l1v2-c-industrial-fiber-ports | visual-l1 | PASS | false | ok |
| gap-pack1-01 | l3 | PASS | true | ok |
| gap-pack1-02 | l3 | PASS | true | ok |
| gap-pack1-03 | l3 | PASS | true | ok |
| gap-pack1-04 | l1-l2 | PASS | true | ok |
| gap-pack1-05 | l4 | PASS | true | ok |
| gap-pack1-06 | l3 | PASS | true | ok |
| gap-pack1-07 | l3 | PASS | true | ok |
| gap-pack1-08 | troubleshooting | PASS | true | ok |
| gap-pack2-01 | tcpip | PASS | true | ok |
| gap-pack2-02 | tcpip | PASS | true | ok |
| gap-pack2-03 | tcpip | PASS | true | ok |
| gap-pack2-04 | tcpip | PASS | true | ok |
| gap-pack2-05 | tcpip | PASS | true | ok |
| gap-pack2-06 | tcpip | PASS | true | ok |
| gap-pack2-07 | tcpip | PASS | true | ok |
| gap-pack2-08 | tcpip | PASS | true | ok |
| gap-pack2-09 | tcpip | PASS | true | ok |
| gap-pack2-10 | tcpip | PASS | true | ok |
| gap-pack2-11 | l5-l7 | PASS | true | ok |
| gap-pack2-12 | l5-l7 | PASS | true | ok |
| gap-pack2-13 | l5-l7 | PASS | true | ok |
| gap-pack2-14 | l5-l7 | PASS | true | ok |
| gap-pack2-15 | l5-l7 | PASS | true | ok |
| gap-pack2-16 | l5-l7 | PASS | true | ok |
| gap-pack2-17 | l5-l7 | PASS | true | ok |
| gap-pack2-18 | l5-l7 | PASS | true | ok |
| gap-pack2-19 | l5-l7 | PASS | true | ok |
| gap-pack2-20 | l5-l7 | PASS | true | ok |
| gap-pack2-21 | l4 | PASS | true | ok |
| gap-pack2-22 | l4 | PASS | true | ok |
| gap-pack2-23 | l4 | PASS | true | ok |
| gap-pack2-24 | l4 | PASS | true | ok |
| gap-pack2-25 | l4 | PASS | true | ok |
| gap-pack2-26 | l4 | PASS | true | ok |
| gap-pack2-27 | l4 | PASS | true | ok |
| gap-pack2-28 | l4 | PASS | true | ok |
| gap-pack2-29 | l4 | PASS | true | ok |
| gap-pack2-30 | l4 | PASS | true | ok |
| gap-pack3-01 | tcpip | PASS | true | ok |
| gap-pack3-02 | tcpip | PASS | true | ok |
| gap-pack3-03 | tcpip | PASS | true | ok |
| gap-pack3-04 | tcpip | PASS | true | ok |
| gap-pack3-05 | tcpip | PASS | true | ok |
| gap-pack3-06 | tcpip | PASS | true | ok |
| gap-pack3-07 | tcpip | PASS | true | ok |
| gap-pack3-08 | tcpip | PASS | true | ok |
| gap-pack3-09 | tcpip | PASS | true | ok |
| gap-pack3-10 | tcpip | PASS | true | ok |
| gap-pack3-11 | l5-l7 | PASS | true | ok |
| gap-pack3-12 | l5-l7 | PASS | true | ok |
| gap-pack3-13 | l5-l7 | PASS | true | ok |
| gap-pack3-14 | l5-l7 | PASS | true | ok |
| gap-pack3-15 | l5-l7 | PASS | true | ok |
| gap-pack3-16 | l5-l7 | PASS | true | ok |
| gap-pack3-17 | l5-l7 | PASS | true | ok |
| gap-pack3-18 | l5-l7 | PASS | true | ok |
| gap-pack3-19 | l5-l7 | PASS | true | ok |
| gap-pack3-20 | l5-l7 | PASS | true | ok |
| gap-pack3-21 | l4 | PASS | true | ok |
| gap-pack3-22 | l4 | PASS | true | ok |
| gap-pack3-23 | l4 | PASS | true | ok |
| gap-pack3-24 | l4 | PASS | true | ok |
| gap-pack3-25 | l4 | PASS | true | ok |
| gap-pack3-26 | l4 | PASS | true | ok |
| gap-pack3-27 | l4 | PASS | true | ok |
| gap-pack3-28 | l4 | PASS | true | ok |
| gap-pack3-29 | l4 | PASS | true | ok |
| gap-pack3-30 | l4 | PASS | true | ok |
| stp-new-01 | l1-l2 | PASS | true | ok |
| stp-new-02 | l1-l2 | PASS | true | ok |
| stp-new-03 | l1-l2 | PASS | true | ok |
| stp-new-04 | l1-l2 | PASS | true | ok |
| stp-new-05 | l1-l2 | PASS | true | ok |
| stp-new-06 | l1-l2 | PASS | true | ok |
| stp-new-07 | l1-l2 | PASS | true | ok |
| stp-new-08 | l1-l2 | PASS | true | ok |
| stp-new-09 | l1-l2 | PASS | true | ok |
| stp-new-10 | l1-l2 | PASS | true | ok |
| stp-new-11 | l1-l2 | PASS | true | ok |
| stp-new-12 | l1-l2 | PASS | true | ok |
| stp-new-13 | l1-l2 | PASS | true | ok |
| stp-new-14 | l1-l2 | PASS | true | ok |
| stp-new-15 | l1-l2 | PASS | true | ok |
| l2-sec-01 | l1-l2 | PASS | true | ok |
| l2-sec-02 | l1-l2 | PASS | true | ok |
| l2-sec-03 | l1-l2 | PASS | true | ok |
| l2-sec-04 | l1-l2 | PASS | true | ok |
| l2-sec-05 | l1-l2 | PASS | true | ok |
| l2-sec-06 | l1-l2 | PASS | true | ok |
| l2-sec-07 | l1-l2 | PASS | true | ok |
| l2-sec-08 | l1-l2 | PASS | true | ok |
| l2-sec-09 | l1-l2 | PASS | true | ok |
| l2-sec-10 | l1-l2 | PASS | true | ok |
| l2-sec-11 | l1-l2 | PASS | true | ok |
| l2-sec-12 | l1-l2 | PASS | true | ok |
| l2-sec-13 | l1-l2 | PASS | true | ok |
| l2-sec-14 | l1-l2 | PASS | true | ok |
| l2-sec-15 | l1-l2 | PASS | true | ok |
| l2-sec-16 | l1-l2 | PASS | true | ok |
| l2-sec-17 | l1-l2 | PASS | true | ok |
| l2-sec-18 | l1-l2 | PASS | true | ok |
| l2-sec-19 | l1-l2 | PASS | true | ok |
| l2-sec-20 | l1-l2 | PASS | true | ok |
| l3-eigrp-01 | l3 | PASS | true | ok |
| l3-eigrp-02 | l3 | PASS | true | ok |
| l3-eigrp-03 | l3 | PASS | true | ok |
| l3-eigrp-04 | l3 | PASS | true | ok |
| l3-eigrp-05 | l3 | PASS | true | ok |
| l3-ospf-01 | l3 | PASS | true | ok |
| l3-ospf-02 | l3 | PASS | true | ok |
| l3-ospf-03 | l3 | PASS | true | ok |
| l3-ospf-04 | l3 | PASS | true | ok |
| l3-ospf-05 | l3 | PASS | true | ok |
| l3-bgp-01 | l3 | PASS | true | ok |
| l3-bgp-02 | l3 | PASS | true | ok |
| l3-bgp-03 | l3 | PASS | true | ok |
| l3-bgp-04 | l3 | PASS | true | ok |
| l3-bgp-05 | l3 | PASS | true | ok |
| l3-bgp-06 | l3 | PASS | true | ok |
| l3-bgp-07 | l3 | PASS | true | ok |
| l4-lb-01 | l4 | PASS | true | ok |
| l4-lb-02 | l4 | PASS | true | ok |
| l4-lb-03 | l4 | PASS | true | ok |
| l4-new-01 | l4 | REVIEW | false | no deep, medium length |
| l4-new-02 | l4 | REVIEW | false | no deep, medium length |
| l4-new-03 | l4 | REVIEW | false | no deep, medium length |
| l4-new-04 | l4 | PASS | true | ok |
| l4-new-05 | l4 | REVIEW | false | no deep, medium length |
| l4-new-06 | l4 | REVIEW | false | no deep, medium length |
| l4-new-07 | l4 | REVIEW | false | no deep, medium length |
| l4-new-08 | l4 | REVIEW | false | no deep, medium length |
| l7-new-01 | l5-l7 | PASS | true | ok |
| l7-new-02 | l5-l7 | REVIEW | false | no deep, medium length |
| l7-new-03 | l5-l7 | REVIEW | false | no deep, medium length |
| l7-new-04 | l5-l7 | REVIEW | false | no deep, medium length |
| l7-new-05 | l5-l7 | REVIEW | false | no deep, medium length |
| l7-new-06 | l5-l7 | REVIEW | false | no deep, medium length |
| l7-new-07 | l5-l7 | PASS | true | ok |
| tcpip-x01 | tcpip | FIX | false | short + no deep |
| tcpip-x02 | tcpip | FIX | false | short + no deep |
| tcpip-x03 | tcpip | PASS | true | ok |
| tcpip-x04 | tcpip | FIX | false | very short |
| tcpip-x05 | tcpip | FIX | false | short + no deep |
| tcpip-x06 | tcpip | PASS | true | ok |
| tcpip-x07 | tcpip | FIX | false | very short |
| tcpip-x08 | tcpip | FIX | false | short + no deep |
| tcpip-x09 | tcpip | PASS | true | ok |
| tcpip-x10 | tcpip | FIX | true | very short |
| tcpip-x11 | tcpip | PASS | true | ok |
| tcpip-x12 | tcpip | PASS | true | ok |
| tcpip-x13 | tcpip | FIX | false | very short |
| tcpip-x14 | tcpip | PASS | true | ok |
| tcpip-x15 | tcpip | FIX | false | very short |
| tcpip-x16 | tcpip | FIX | false | short + no deep |
| tcpip-x17 | tcpip | FIX | false | very short |
| tcpip-x18 | tcpip | PASS | true | ok |
| tcpip-x19 | tcpip | FIX | false | very short |
| tcpip-x20 | tcpip | PASS | true | ok |
| tcpip-x21 | tcpip | FIX | false | short + no deep |
| tcpip-x22 | tcpip | FIX | true | very short |
| tcpip-x23 | tcpip | PASS | true | ok |
| tcpip-x24 | tcpip | FIX | true | very short |
| tcpip-x25 | tcpip | PASS | true | ok |
| tcpip-x26 | tcpip | PASS | true | ok |
| tcpip-x27 | tcpip | PASS | true | ok |
| tcpip-x28 | tcpip | PASS | true | ok |
| tcpip-x29 | tcpip | FIX | false | short + no deep |
| l57-x01 | l5-l7 | FIX | true | very short |
| l57-x02 | l5-l7 | PASS | true | ok |
| l57-x03 | l5-l7 | FIX | false | very short |
| l57-x04 | l5-l7 | PASS | true | ok |
| l57-x05 | l5-l7 | PASS | true | ok |
| l57-x06 | l5-l7 | PASS | true | ok |
| l57-x07 | l5-l7 | PASS | true | ok |
| l57-x08 | l5-l7 | PASS | true | ok |
| l57-x09 | l5-l7 | PASS | true | ok |
| l57-x10 | l5-l7 | PASS | true | ok |
| l57-x11 | l5-l7 | FIX | true | very short |
| l57-x12 | l5-l7 | PASS | true | ok |
| l57-x13 | l5-l7 | FIX | true | very short |
| l57-x14 | l5-l7 | PASS | true | ok |
| l57-x15 | l5-l7 | PASS | true | ok |
| l57-x16 | l5-l7 | PASS | true | ok |
| l57-x17 | l5-l7 | REVIEW | false | no deep, medium length |
| l57-x18 | l5-l7 | PASS | true | ok |
| l57-x19 | l5-l7 | PASS | true | ok |
| l57-x20 | l5-l7 | PASS | true | ok |
| ts-x01 | troubleshooting | PASS | true | ok |
| ts-x02 | troubleshooting | PASS | true | ok |
| ts-x03 | troubleshooting | PASS | true | ok |
| ts-x04 | troubleshooting | PASS | true | ok |
| ts-x05 | troubleshooting | REVIEW | false | no deep, medium length |
| ts-x06 | troubleshooting | PASS | true | ok |
| ts-x07 | troubleshooting | PASS | true | ok |
| ts-x08 | troubleshooting | PASS | true | ok |
| ts-x09 | troubleshooting | PASS | true | ok |
| ts-x10 | troubleshooting | PASS | true | ok |
| ts-x11 | troubleshooting | PASS | true | ok |
| ts-x12 | troubleshooting | PASS | true | ok |
| ts-x13 | troubleshooting | PASS | true | ok |
| l12-x01 | l1-l2 | PASS | true | ok |
| l12-x02 | l1-l2 | PASS | true | ok |
| l12-x03 | l1-l2 | PASS | true | ok |
| l12-x04 | l1-l2 | PASS | true | ok |
| l12-x05 | l1-l2 | PASS | true | ok |
| l12-x06 | l1-l2 | PASS | true | ok |
| l12-x07 | l1-l2 | PASS | true | ok |
| l12-x08 | l1-l2 | PASS | true | ok |
| l4-x01 | l4 | FIX | true | very short |
| l4-x02 | l4 | PASS | true | ok |
| l4-x03 | l4 | FIX | true | very short |
| l4-x04 | l4 | PASS | true | ok |
| l4-x05 | l4 | PASS | true | ok |
| l4-x06 | l4 | FIX | true | very short |
| l12-d01 | l1-l2 | PASS | true | ok |
| l12-d02 | l1-l2 | PASS | true | ok |
| l12-d03 | l1-l2 | PASS | true | ok |
| l12-d04 | l1-l2 | PASS | true | ok |
| l12-d05 | l1-l2 | PASS | true | ok |
| l12-d06 | l1-l2 | PASS | true | ok |
| l3-d01 | l3 | FIX | true | very short |
| l3-d02 | l3 | FIX | true | very short |
| l3-d03 | l3 | PASS | true | ok |
| l3-d04 | l3 | PASS | true | ok |
| l3-d05 | l3 | PASS | true | ok |
| l3-d06 | l3 | PASS | true | ok |
| l3-d07 | l3 | PASS | true | ok |
| l3-d08 | l3 | PASS | true | ok |
| l4-d01 | l4 | PASS | true | ok |
| l4-d02 | l4 | PASS | true | ok |
| l4-d03 | l4 | FIX | true | very short |
| l4-d04 | l4 | PASS | true | ok |
| l4-d05 | l4 | PASS | true | ok |
| l4-d06 | l4 | FIX | true | very short |
| l57-d01 | l5-l7 | PASS | true | ok |
| l57-d02 | l5-l7 | PASS | true | ok |
| l57-d03 | l5-l7 | PASS | true | ok |
| l57-d04 | l5-l7 | PASS | true | ok |
| l57-d05 | l5-l7 | PASS | true | ok |
| l57-d06 | l5-l7 | PASS | true | ok |
| tcpip-d01 | tcpip | PASS | true | ok |
| tcpip-d02 | tcpip | PASS | true | ok |
| tcpip-d03 | tcpip | FIX | true | very short |
| tcpip-d04 | tcpip | PASS | true | ok |
| tcpip-d05 | tcpip | PASS | true | ok |
| ts-d01 | troubleshooting | PASS | true | ok |
| ts-d02 | troubleshooting | PASS | true | ok |
| ts-d03 | troubleshooting | PASS | true | ok |
| ts-d04 | troubleshooting | PASS | true | ok |
| ts-d05 | troubleshooting | PASS | true | ok |
| ts-d06 | troubleshooting | PASS | true | ok |
| ts-d07 | troubleshooting | PASS | true | ok |
| ts-d08 | troubleshooting | PASS | true | ok |
| l12-ps01 | l1-l2 | PASS | true | ok |
| l12-ps02 | l1-l2 | PASS | true | ok |
| l12-ps03 | l1-l2 | PASS | true | ok |
| l12-ds01 | l1-l2 | PASS | true | ok |
| l12-ds02 | l1-l2 | PASS | true | ok |
| l12-ds03 | l1-l2 | PASS | true | ok |
| l12-ds04 | l1-l2 | PASS | true | ok |
| l3-vrrp01 | l3 | PASS | true | ok |
| l3-vrrp02 | l3 | PASS | true | ok |
| l3-vrrp03 | l3 | PASS | true | ok |
| l3-vrrp04 | l3 | PASS | true | ok |
| l12-copp01 | troubleshooting | PASS | true | ok |
| l12-storm01 | troubleshooting | PASS | true | ok |
| l12-dot1x01 | l1-l2 | PASS | true | ok |
| l12-lldp01 | l1-l2 | PASS | true | ok |
| l3-rpki01 | l3 | PASS | true | ok |
| ts-pfc01 | troubleshooting | PASS | true | ok |
| l4-fr01 | l4 | PASS | true | ok |
| tcpip-ntp01 | tcpip | PASS | true | ok |
| ts-linux01 | troubleshooting | PASS | true | ok |
| ts-pack1-01 | troubleshooting | PASS | true | ok |
| ts-pack1-02 | troubleshooting | PASS | false | ok |
| ts-pack1-03 | troubleshooting | PASS | true | ok |
| ts-pack1-04 | troubleshooting | PASS | true | ok |
| ts-pack1-05 | troubleshooting | PASS | true | ok |
| ts-pack1-06 | troubleshooting | PASS | true | ok |
| ts-pack1-07 | troubleshooting | PASS | false | ok |
| ts-pack1-08 | troubleshooting | PASS | true | ok |
| ts-pack1-09 | troubleshooting | PASS | true | ok |
| ts-pack1-10 | troubleshooting | PASS | true | ok |
| ts-pack1-11 | troubleshooting | PASS | false | ok |
| ts-pack1-12 | troubleshooting | PASS | false | ok |
| ts-pack1-13 | troubleshooting | PASS | false | ok |
| ts-pack1-14 | troubleshooting | PASS | true | ok |
| ts-pack1-15 | troubleshooting | PASS | false | ok |
| ts-pack1-16 | troubleshooting | PASS | true | ok |
| ts-pack1-17 | troubleshooting | PASS | true | ok |
| ts-pack1-18 | troubleshooting | PASS | true | ok |
| ts-pack1-19 | troubleshooting | PASS | true | ok |
| ts-pack1-20 | troubleshooting | PASS | true | ok |
| diag177-optical-direction | l1-l2 | PASS | true | ok |
| diag177-otdr-bidirectional | l1-l2 | FIX | true | very short |
| diag177-mrp-domain | troubleshooting | PASS | true | ok |
| diag177-lag-hash | l1-l2 | PASS | true | ok |
| diag177-igmp-querier | l1-l2 | PASS | true | ok |
| diag177-ipv4-onlink-return | l3 | PASS | true | ok |
| diag177-ra-default-lifetime | l3 | PASS | true | ok |
| diag177-dhcp-renew-rebind | l5-l7 | PASS | true | ok |
| diag177-dns-secondary-serial | l5-l7 | PASS | true | ok |
| diag177-tcp-checksum-offload | l4 | PASS | true | ok |
| diag177-nat-return-path | l3 | PASS | true | ok |
| diag177-qos-marking | l3 | PASS | true | ok |
| mon-snmp-01 | l5-l7 | PASS | true | ok |
| mon-snmp-02 | l5-l7 | PASS | true | ok |
| mon-snmp-03 | l5-l7 | PASS | true | ok |
| mon-snmp-04 | l5-l7 | PASS | true | ok |
| mon-snmp-05 | troubleshooting | PASS | true | ok |
| mon-syslog-01 | l5-l7 | PASS | true | ok |
| mon-syslog-02 | l5-l7 | PASS | true | ok |
| mon-syslog-03 | troubleshooting | PASS | true | ok |
| mon-syslog-04 | troubleshooting | PASS | true | ok |
| mon-syslog-05 | l5-l7 | PASS | true | ok |
| mon-zabbix-01 | l5-l7 | PASS | true | ok |
| mon-zabbix-02 | l5-l7 | PASS | true | ok |
| mon-zabbix-03 | l5-l7 | PASS | true | ok |
| mon-zabbix-04 | troubleshooting | PASS | true | ok |
| mon-zabbix-05 | l5-l7 | PASS | true | ok |
| mon-diag-01 | troubleshooting | PASS | true | ok |
| mon-diag-02 | troubleshooting | PASS | true | ok |
| mon-diag-03 | troubleshooting | PASS | true | ok |
| mon-diag-04 | troubleshooting | PASS | true | ok |
| mon-diag-05 | troubleshooting | PASS | true | ok |
| wifi-std-01 | l1-l2 | PASS | true | ok |
| wifi-std-02 | l1-l2 | PASS | true | ok |
| wifi-std-03 | l1-l2 | PASS | true | ok |
| wifi-std-04 | l1-l2 | PASS | true | ok |
| wifi-std-05 | l1-l2 | PASS | true | ok |
| wifi-roam-01 | l1-l2 | PASS | true | ok |
| wifi-roam-02 | l1-l2 | PASS | true | ok |
| wifi-roam-03 | l1-l2 | PASS | true | ok |
| wifi-roam-04 | troubleshooting | PASS | true | ok |
| wifi-roam-05 | l1-l2 | PASS | true | ok |
| wifi-sec-01 | l5-l7 | PASS | true | ok |
| wifi-sec-02 | l1-l2 | PASS | true | ok |
| wifi-sec-03 | l1-l2 | PASS | true | ok |
| wifi-sec-04 | troubleshooting | PASS | true | ok |
| wifi-sec-05 | l1-l2 | PASS | true | ok |
| wifi-diag-01 | troubleshooting | PASS | true | ok |
| wifi-diag-02 | troubleshooting | PASS | true | ok |
| wifi-diag-03 | troubleshooting | PASS | true | ok |
| wifi-diag-04 | troubleshooting | PASS | true | ok |
| wifi-diag-05 | troubleshooting | PASS | true | ok |
| exp225-l2-macflap-01 | l1-l2 | PASS | true | ok |
| exp225-l2-trunk-pruning-02 | troubleshooting | PASS | true | ok |
| exp225-l2-stp-udld-loop-03 | l1-l2 | PASS | true | ok |
| exp225-l2-mstp-digest-04 | l1-l2 | PASS | true | ok |
| exp225-l2-storm-copp-vs-stp-05 | troubleshooting | PASS | true | ok |
| exp225-l3-lpm-summary-06 | l3 | PASS | true | ok |
| exp225-l3-vrrp-split-07 | l3 | PASS | true | ok |
| exp225-l3-asym-ecmp-nat-08 | troubleshooting | PASS | true | ok |
| exp225-l3-arp-garp-proxy-09 | l3 | PASS | true | ok |
| exp225-l3-acl-urpf-order-10 | troubleshooting | PASS | true | ok |
| exp225-mon-ifindex-shift-11 | l5-l7 | PASS | true | ok |
| exp225-mon-counter-12 | troubleshooting | PASS | true | ok |
| exp225-mon-poller-saturation-13 | troubleshooting | PASS | true | ok |
| exp225-mon-syslog-clock-correlation-14 | troubleshooting | PASS | true | ok |
| exp225-mon-snmp-rootcause-15 | l5-l7 | PASS | true | ok |
| exp225-wifi-roam-pmf-ft-16 | l1-l2 | PASS | true | ok |
| exp225-wifi-dfs-channel-plan-17 | l1-l2 | PASS | true | ok |
| exp225-wifi-interference-snr-18 | troubleshooting | PASS | true | ok |
| exp225-wifi-radius-roaming-mixed-19 | troubleshooting | PASS | true | ok |
| exp225-wifi-mixed-switch-ap-20 | troubleshooting | PASS | true | ok |
| expert177-mrp-vlan-failover | troubleshooting | PASS | true | ok |
| expert177-dnat-reply-policy | l3 | PASS | true | ok |
| expert177-optical-reserve-margin | l1-l2 | PASS | true | ok |
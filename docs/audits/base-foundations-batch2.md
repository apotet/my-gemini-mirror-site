# NetOps — базовый учебный пакет №2 (OSI и TCP/IP)

**Целевая ветка:** `feat/base-foundations-batch2`, от staging main `88ca8a896ead46901dca16f57d985c9d49f77b66`.
**Банк:** 862 неизменённых вопроса. Ни ключи, ни варианты, ни уровень, ни структура попыток не менялись.
**Контракт:** `docs/LEARNING_CONTENT_STANDARD.md`. Production `apotet/netops` вне изменений.

## Объём пакета

20 ранее недостающих профессиональных разборов. Для 16 ID дополнительно подготовлены отдельные трёхабзацные объяснения «Простыми словами»; для четырёх уже качественных текстов (`l3-12`, `l4-08`, `tcpip-x10`, `tcpip-x12`) **существующий простой текст не переписан**, добавлен только слой «По делу».
Переиспользованы существующие двуслойные уроки OSI и TCP/IP. Добавлен полноценный профессиональный слой существующему уроку `tcpip-encapsulation` и два самостоятельных двустильных урока `osi-session-presentation`, `l3-icmp-basics`; к первоначальным 9 записям словаря добавлены ещё 9 терминов, недостающих интерактивным тегам (существующие определения остальных терминов переиспользованы).

## Матрица содержательной приёмки

| ID | Фокус механизма и ключа | Урок | Практика | Статус |
| --- | --- | --- | --- | --- |
| `l3-12` | RFC 1918 /12 границы, исключение shared/link-local | l3-private-ipv4 | — | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `l4-08` | TCP RST против FIN; причина сброса не выводится из флага | l4-tcp | — | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `l5-01` | L4 транспорт против L5 сеансовой организации | osi-session-presentation | — | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `l6-02` | L6 представление и кодировка, роль Application TCP/IP | osi-session-presentation | — | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcp-04` | Три соответствия L2 MAC / L3 IP / L4 порт | osi-pdu | packet | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcp-07` | ICMP напрямую внутри IP; Protocol=1 | l3-icmp-basics | packet | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcp-08` | Ethernet/Wi-Fi/ARP на Link; отличие от ICMP/UDP | tcpip-model | packet | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcp-09` | IP MTU и TCP MSS, расчёт 1500−20−20 | tcpip-encapsulation | — | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `gen-osi-a-7` | Адресация L3 и MAC следующего перехода | osi-pdu | packet | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `gen-osi-a-9` | ICMP как L3 / Internet, ICMP Type не порт | l3-icmp-basics | packet | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `gen-osi-a-11` | Номера портов и транспортные endpoints L4 | l4-tcp | tcp | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `gen-osi-a-12` | UDP datagram L4 и IP packet L3 | osi-pdu | — (отдельного UDP-стенда нет) | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcpip-x01` | Четыре уровня классической TCP/IP / RFC 1122 | tcpip-model | — | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcpip-x02` | Application = OSI L5–L7 по функциям | tcpip-model | — | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcpip-x04` | IP-packet PDU Internet, Protocol field | tcpip-encapsulation | — | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcpip-x05` | Link = OSI L1 и L2 | tcpip-model | — | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcpip-x07` | IP destination, LPM, MAC next-hop | osi-pdu | packet | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcpip-x08` | L4 порты и демультиплексирование | l4-tcp | — | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcpip-x10` | ARP IPv4→MAC после выбора next-hop | l3-arp | packet | PASS — ключ, brief/plain/pro, урок и практика проверены |
| `tcpip-x12` | HTTP/DNS/SSH — Application при разном транспорте | tcpip-model | — | PASS — ключ, brief/plain/pro, урок и практика проверены |

**Приёмка 17.11.2026: 20/20 PASS по выполненной поимённой проверке.** Для каждого ID сопоставлены фактический вопрос/варианты/ключ (`questions.json` или `questionsExtra.ts`), индивидуальные «Почему так», `plain` и `pro`, активный резолвер, назначенный и обратный урок, действующие `practiceLink` либо его честное отсутствие. Разборы сверены по смыслу: RFC 1918 (/12, 169.254/16, 100.64/10), RST/FIN, L5/L6, 4-уровневая TCP/IP, MAC/IP/port, ICMPv4=1/Type 8/0, Link ARP, MTU/MSS=1460, UDP=L4/Protocol 17, TCP-порты, IP-PDU, ARP next-hop, Application HTTP/DNS/SSH. Исходные условия и правильные ответы сохранены.

**Независимый контроль:** GitHub Codex на SHA `b59bcaa` нашёл 4 содержательных P2, после исправлений перепроверил SHA `b4da2705519f39db87f9d2aab245a590138139a5`: `code_review.status=completed`, `has_any_findings=false`, `has_unresolved_findings=false`. Отдельную поимённую матрицу Codex не публиковал; 20 строк выше — поимённая проверка исполнителя, а не приписанная Codex таблица. Это два дополняющих друг друга вида проверки.

**CI:** [run #43990507588](https://github.com/apotet/my-gemini-mirror-site/actions/runs/43990507588) — PASS (TypeScript, production build, explanations quality, обе проверки 20 ID и Chromium responsive), исходник `b4da2705`. CI на документальном коммите также должен пройти до merge.

## Исправления после независимого код-ревью Codex (P2 × 4)

Ревью на SHA `b59bcaa` выявило четыре подтверждённых дефекта. В последующих коммитах исправлены:

1. В профессиональном уроке `tcpip-encapsulation`: значение поля IPv4 `IHL=5` и TCP `Data Offset=5` отделены от вычисленных длин `20 B`; `MSS=1460 B` сохранён.
2. Добавлены девять недостающих фактических терминов в `GLOSSARY` для обоих стилей двух новых уроков: сеанс, кодировка, UTF-8, порт, сериализация, Wireshark, ICMPv4, Protocol, Time Exceeded.
3. `gen-osi-a-11` ссылается на действующий TCP-стенд с портами, а `gen-osi-a-12` больше не предлагает ARP/ICMP-стенд как будто это упражнение по UDP.
4. В `l3-icmp-basics` практика `packet` указана в простом и профессиональном блоках, включая открытие урока из каталога.

Регрессионные проверки добавлены в `scripts/base-foundations-batch2.test.mjs`: поля, определённость терминов, фактический маршрут практики и кнопки урока. Контрольная сумма двух одобренных к исправлению защищённых файлов обновлена в `docs/audits/issue-171-baseline.json`; хэши банка заданий и проекции уровней сохранены.

**Четыре P2 исправлены и подтверждены независимым повторным код-ревью Codex без новых замечаний. Поимённая проверка исполнителя — 20/20 PASS.**

## Регрессии

- `scripts/base-foundations-batch2.test.mjs`: точные 20 ID; неизменный размер и уникальность банка; сохранение difficulty и ответов; отдельный содержательный plain/pro; связь с реально существующим уроком, оба наполненных уровня урока.
- Включено в `.github/workflows/ci.yml`; применимы существующие TypeScript, build, reviewer links, glossary, базовый и browser tests 375/1440px.
- Соответствие опубликованному staging **проверяется отдельно после merge и Pages deploy**; поимённая матрица 20/20 приведена выше, независимый Codex-ревью на исправленном SHA без замечаний.

## Контроль перед выпуском

1. CI и контент-GATE-01…10; проверить, что нет регрессий на мобильном и десктопе, во всех режимах разбора и в старых попытках.
2. Поимённая матрица 20/20 проверена исполнителем; независимый ревизор Codex завершил повторный код-ревью исправлений без замечаний. Для выпуска требуется успешный CI финального SHA и все GATE-01…10.
3. Только после соблюдения регламента разрешён merge в staging; затем проверить опубликованный сайт. Production только по отдельной команде владельца.

## Нормативные источники по темам

RFC 1122, RFC 1918, RFC 792, RFC 826, RFC 9293, RFC 768, RFC 791, RFC 3927, RFC 6598, RFC 2784, RFC 1661, IEEE 802.3, ISO/IEC 7498-1.

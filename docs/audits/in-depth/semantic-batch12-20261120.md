# NetOps «Углублённый»: предметная проверка 12 повышенно-рисковых вопросов, 20.11.2026

**Проверка:** самостоятельная ручная инженерная рецензия ассистента; это не внешний независимый отзыв. В отличие от структурного CI, каждый вердикт получен после чтения полного вопроса и всех вариантов, действующего `getQuestionDeepDive`, режима plain/pro, `practicalTip`/`commonTrap` и текста точных разделов урока в обоих режимах. Источник данных — выгрузка реально исполняемого кода через [Actions #44670910525](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44670910525) (исходный снимок текущей ветки до QoS-FIX) и скрипт `scripts/in-depth-semantic-batch12.mjs`.

## Поимённые вердикты исходного снимка

| ID | Исходный вердикт | Предметное доказательство |
| --- | --- | --- |
| `review-syslog-25` | PASS | Проверены NTP offset, timezone/UTC, timestamp события против времени приёма; исправленная точная секция `l7-services#in-depth-event-time-sync-timezone` относится к Syslog, а не к NTP KoD RATE |
| `review-slaac-4` | PASS | PIO /64, A=1, самостоятельный IID, DAD, раздельные Valid/Preferred Lifetime; `l3-ipv6#in-depth-slaac-ra-address-formation` |
| `review-qos-22` | **FIX** | Правильный ключ «Классификация и очереди», оба разбора и `qos-basics#in-depth-dscp-classification-queue-congestion` технически верны, но активный `practicalTip` ошибочно утверждал «Сначала линк (L1/L2), затем маршруты и DNS» — никак не относится к DSCP и выходной очереди |
| `tr-03` | PASS | HTTP по IPv4 открыт, по DNS-имени нет — сначала фактический A/AAAA ответ; при корректном DNS проверить выбранный IP и HTTP Host. Не смешаны ping/HTTP и HTTPS/TLS; `ts-method#indepth-dns-name-vs-address` |
| `tr-10` | PASS | Off-subnet path, gateway, next-hop, обратный маршрут, фильтрация; локальное соединение не доказывает весь L1/L2; `ts-method#indepth-local-success-remote-path` |
| `gap-pack2-05` | PASS | Пересчитанная FCS кадра может пройти при изменившемся payload; IPv4 checksum охватывает только заголовок; `tcpip-encapsulation#in-depth-fcs-ipv4-header-payload-scope` |
| `gap-pack2-10` | PASS | В PPP после IPCP Opened IPv4 идёт в PPP Protocol=0x0021, не IPv4 Protocol=17/UDP, ARP/MAC не нужны на этом канале; `tcpip-encapsulation#in-depth-ppp-ipcp-first-ipv4-packet` |
| `gap-pack2-11` | PASS | Авторитетное NOERROR + пустая AAAA Answer + SOA Authority + TC=0 при существующем A = NODATA, не NXDOMAIN/SERVFAIL; `l7-dns#in-depth-dns-aaaa-noerror-nodata` |
| `l4-03` | PASS | TCP — ordered byte stream с ACK/ретрансляциями, нет границ app-record и гарантированного дедлайна; key [2], `l4-tcp#in-depth-tcp-stream-record-framing` |
| `l4-new-05` | PASS | UDP/IPv4 checksum=0 означает отсутствие UDP-checksum, обычный UDP/IPv6 запрещает ноль; tunnel-исключения и host capture offload исключены условием; key [1], `l4-tcp#udp-checksum-ipv4-ipv6` |
| `review-poe-30` | PASS | Портовый IEEE PoE класс и общий бюджет PSE до IP/MAC, конкретный `show power inline`; `l1-poe-screen-reading#in-depth-poe-class-budget-camera` |
| `tcp-06` | PASS | 5 исходных вариантов, 3 правильных [0,1,2]; сквозные IP и L4 destination port, изменяемые MAC и TTL; `tcpip-model#tcpip-end-to-end-fields` |

**Исходный результат: 11 PASS / 1 FIX / 0 REVIEW.** Все 12 ID имеют уникальные точные `lessonId#anchorId` в обоих режимах, индивидуальный plain/pro, исходные ключи и варианты на момент выгрузки.

## Исправление подтверждённого дефекта QoS

В `src/data/inDepth/specificPracticalTips.ts` отдельно добавлен `review-qos-22`:
- Входные trust/remarking и фактический DSCP.
- Действующее сопоставление DSCP → traffic-class → egress queue.
- Планировщик и счётчики очереди/drops/marks в условиях конкуренции.
- Команда `show policy-map interface` **только при применимой политике/платформе**; на других устройствах — специфичные аппаратные QoS counters.

Предметная сверка с официальными Cisco QoS guides: https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/qos/b-quality-of-service/m_qos-mrkg.html и https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960xr/software/15-2_2_e/consolidated_guide/configuration_guide/b_1522e_consolidated_2960xr_cg/b_1522e_consolidated_2960xr_cg_chapter_011011.html. Они показывают, почему `show policy-map interface` нельзя объявить универсальным для всех Catalyst.

**Регрессия:** `scripts/in-depth-semantic-batch12.mjs` фиксирует все 12 наборов correct indices, наличие четырёх/пяти вариантов, индивидуальные оба стиля и точные два якоря. Отдельно требует QoS-специфичный совет и запрещает исходный generic DNS шаблон. CI включает историю попыток, `lint`, `build` и реальный Chromium 375/1440 для `review-qos-22`.

**Публикационный статус:** самостоятельный PASS по содержанию 11 исходных и адресный FIX — не закрывает ни все 164 независимых fingerprint, ни GATE-01…10. До полного релизного регламента — Draft/BLOCK, не сливать и не выкладывать staging/production.

# GATE-06 — финальная адресная семантическая приёмка, 23.11.2026

**Issue:** [#333](https://github.com/apotet/my-gemini-mirror-site/issues/333). **Forensic evidence:** Draft [#334](https://github.com/apotet/my-gemini-mirror-site/pull/334), HEAD `f3500c29fb0c2b38f8d99fda4d9d4837787a7647`. **Отдельный Draft исправлений:** [#335](https://github.com/apotet/my-gemini-mirror-site/pull/335), ветка `fix/gate06-targeted-semantic` от staging `b22984cc3746d35b2b2c990af59055dfe467778c`.

**Проверенный исправленный content SHA: `3983019649ac671b6436b0d2df388a1578ddd27c`.** Последующие изменения — отчёты, evidence JSON и подключение уже прошедшего адресного теста к существующему CI entry point; учебные исходники относительно этого SHA не меняются.

**Итог содержательной проверки: 9 полных ID-scoped пакетов PASS + 2 ограниченные дельты PASS; 0 незакрытых FIX/REVIEW в этом объёме. GATE-06 остаётся BLOCK.** CI не целиком зелёный: неизменённая stage-2 защита банка отклоняет пять намеренно исправленных учебных полей. Это отдельный выпускной блокер, а не подмена семантического вердикта.

## Независимость и метод

Автор содержательных исправлений — `/root`. Проверяющие Codex-субагенты `/root/final_monitoring`, `/root/final_wifi`, `/root/final_tcp_ptp` не редактировали учебные исходники или тесты. Они читали реальные resolver-пакеты, инженерные первоисточники и конкретные исправления; каждый заново выполнил адресный resolver на исправленном SHA, сверил material/component hashes и clean-src состояние. Это независимость от автора внутри Codex-команды, **не отчёт внешнего Gemini/Grok и не личная приёмка уроков владельцем**.

До исправления прочитаны question, все варианты/ключ, why, full plain/pro, PracticalTip/CommonTrap, оба стиля связанных expanded lessons и соответствующие определения/подсказки. Общие уроки/термины читались один раз на группу с проверкой применимости каждому ID. После исправления независимо проверены фактически изменённые поля и текущие пакеты. Синтаксис/хеши/CI не использованы вместо содержательного суждения.

Подробные свидетельства, критерии, исходные цитаты, первоисточники и финальные hashes:

- [Monitoring: четыре полных пакета](gate06-targeted-monitoring-review-20261123.md) — SNMP USM/authPriv и алгоритмы, Syslog severity/направления, Zabbix agentd/Agent2/направления соединений; два общих урока и 93 уникальных определения.
- [Wi-Fi: пять полных пакетов](gate06-targeted-wifi-review-20261123.md) — план каналов, OFDMA/RU/6E/7, клиентский roaming, SAE/PAKE/PMF/Transition и пределы защиты; два общих урока и 90 определений.
- [TCP/PTP: только дельты](gate06-targeted-tcp-ptp-review-20261123.md) — новые PPP/FCS материалы, изменённые термины, новый PTP tip и общий Monitoring-контекст. Старое чтение первого TCP/PTP-рецензента атрибутировано; финальный reviewer лично проверил исправленный resolver.

## Поимённые итоговые вердикты

Все строки ниже проверены на **`3983019649ac671b6436b0d2df388a1578ddd27c`**. PASS относится к указанному ID-пакету либо явно ограниченной дельте, не к всему L2.

| ID | Проверенный SHA | Вердикт | Найденные проблемы на b229 | Исправления | Независимая приёмка |
| --- | --- | --- | --- | --- | --- |
| `mon-snmp-01` | `3983019649ac671b6436b0d2df388a1578ddd27c` | PASS, полный пакет | Общий SNMP-текст вызывал HTTP/DHCP/TCP подсказки; PracticalTip повторял мнемонику | Уточнены слова SNMP-операций; добавлена конкретная проверка authPriv, HMAC/AES, engineID/snmpget | `/root/final_monitoring`: ключ [2], варианты, why/plain/pro, CommonTrap, точная секция и словарь приняты |
| `mon-syslog-01` | `3983019649ac671b6436b0d2df388a1578ddd27c` | PASS, полный пакет | Общие подсказки; PracticalTip не давал проверки пропавшего события; заголовок конфигурации необоснованно обещал UTC | Совет сравнить severity 5 с show logging и порогом; локализованы SNMP-слова; исправлен заголовок | `/root/final_monitoring`: ключ [0], порог warnings 0–4, диагностика и оба стиля согласованы |
| `mon-syslog-05` | `3983019649ac671b6436b0d2df388a1578ddd27c` | PASS, полный пакет | Ошибки общего Monitoring-контекста, собственный core корректен | Исправлен общий контекст; buffered/console/monitor/host и terminal monitor сохранены | `/root/final_monitoring`: ключ [1], механизм VTY, обе целевые секции и operational tip приняты |
| `mon-zabbix-01` | `3983019649ac671b6436b0d2df388a1578ddd27c` | PASS, полный пакет | active/nodata/update порождали BGP/DNS подсказки | Добавлены целые Zabbix-фразы/функции; локализован краткий prose и уточнена запись nodata() | `/root/final_monitoring`: ключ [0], TCP10050/10051, ServerActive/Hostname, agentd/Agent2 и ограничения FW/NAT верны |
| `wifi-std-01` | `3983019649ac671b6436b0d2df388a1578ddd27c` | PASS, полный пакет | Explanation/remember учили универсальному «только 1/6/11»; общие ложные подсказки | Два поля ограничены данным офисным кейсом, PHY/регионом; whole-phrase термины вместо чужих значений | `/root/final_wifi`: ключ [2], ACI, дистракторы, оба стиля и ограничения проверены |
| `wifi-std-04` | `3983019649ac671b6436b0d2df388a1578ddd27c` | PASS, полный пакет | Explanation/remember смешивали 6E/7 и обещали «чистый» 6 ГГц | Разделены RU, расширение 6E, возможности 7 и ограничения оборудования/регулятора; помехи не исключаются | `/root/final_wifi`: ключ [3], OFDMA/RU, 320/MLO и 6E/7 согласованы |
| `wifi-roam-01` | `3983019649ac671b6436b0d2df388a1578ddd27c` | PASS, полный пакет | Sticky/Sticky clients давали Port Security подсказку, включая derived keyTakeaways | Topic называет целое Sticky client; добавлен plural whole-phrase термин | `/root/final_wifi`: ключ [1], клиентское решение, помощь 802.11k/v/r и её пределы верны |
| `wifi-sec-01` | `3983019649ac671b6436b0d2df388a1578ddd27c` | PASS, полный пакет | Exchange в PAKE и Request в Probe Request получали MX/OSPF/DHCP смысл | Добавлены целые Wi-Fi/PAKE фразы с полезными определениями; прежние сетевые определения сохранены | `/root/final_wifi`: ключ [2], SAE/PAKE, PMF и Transition ограничения проверены |
| `wifi-sec-05` | `3983019649ac671b6436b0d2df388a1578ddd27c` | PASS, полный пакет | Probe Request имел чужую DHCP-подсказку в общем контексте | Полное определение Probe Request различает specific/wildcard SSID, не противопоставляя их MAC broadcast | `/root/final_wifi`: ключ [0], скрытый SSID/MAC, границы L2/верхнего шифрования верны |
| `tcp-05` | `3983019649ac671b6436b0d2df388a1578ddd27c` | PASS, только ограниченная дельта | Новый PPP-блок ошибочно называл поле IPv4 Next Protocol и показывал медную NEXT-подсказку | Точное имя IPv4 Protocol; PPP Protocol 0x0021 и реальный next-hop сохранены | `/root/final_tcp_ptp`: новые PPP/FCS plain/pro, терминология и обе target anchors приняты |
| `review-ptp-17` | `3983019649ac671b6436b0d2df388a1578ddd27c` | PASS, только ограниченная дельта | Новый tip корректен; общий Monitoring-контекст имел ошибки | Tip не переписывался; исправленный общий контекст принят Monitoring-рецензентом на том же SHA | `/root/final_tcp_ptp`: upstream/downstream Boundary Clock совет и новая общая дельта приняты |

## Что исправлено и где

Точные исходники на проверенном SHA:

- [wifiCases.ts](https://github.com/apotet/my-gemini-mirror-site/blob/3983019649ac671b6436b0d2df388a1578ddd27c/src/data/wifiCases.ts): только explanation/remember двух целевых вопросов и topic одного roaming-вопроса — **пять полей**, ни одного stem/варианта/ключа.
- [group1.ts](https://github.com/apotet/my-gemini-mirror-site/blob/3983019649ac671b6436b0d2df388a1578ddd27c/src/data/inDepth/group1.ts): PPP Protocol и три SNMP prose-термина заменены корректной предметной формулировкой.
- [group3.ts](https://github.com/apotet/my-gemini-mirror-site/blob/3983019649ac671b6436b0d2df388a1578ddd27c/src/data/inDepth/group3.ts): два адресных PracticalTip, восемь whole-phrase Zabbix терминов и точная запись nodata().
- [group4.ts](https://github.com/apotet/my-gemini-mirror-site/blob/3983019649ac671b6436b0d2df388a1578ddd27c/src/data/inDepth/group4.ts): пять whole-phrase Wi-Fi/PAKE терминов. Существующий longest-first tokenizer распознаёт их целиком; архитектура/компоненты не переписывались.
- [Monitoring lesson](https://github.com/apotet/my-gemini-mirror-site/blob/3983019649ac671b6436b0d2df388a1578ddd27c/src/data/lessons/l7-monitoring-snmp-syslog.ts): заголовок соответствует команде, которая показывает timezone, а не устанавливает UTC.
- [Zabbix lesson](https://github.com/apotet/my-gemini-mirror-site/blob/3983019649ac671b6436b0d2df388a1578ddd27c/src/data/lessons/ts-zabbix-monitoring.ts): ограниченные prose-уточнения для контекста glossary. Реальные настройки и типы элементов не переименованы.

Полные **materialHash, questionDeepHash, sharedContextHash**, lessonId и anchor для каждого ID приложены в [semantic hashes JSON](gate06-targeted-semantic-hashes-20261123.json), совпадают с независимыми таблицами трёх reviewer reports. Это evidence для конкретной версии, **не реестр closeout-acceptance** и не вход для release policy.

## Какие уже принятые материалы не проверялись заново

- `tcp-05`: question/deep и неизменные target-section bodies ранее независимо приняты на `e833593dc2cb34303bd6f884eb346d18cfd1dc1f`; их component identity подтверждена предыдущим этапом. Здесь не повторялся их полный семантический аудит. Текущий questionDeepHash остаётся `681237c1b56844501829b1c7771e6061f12f5be1f3a0aa7b4f2c87155b8c119d`.
- `review-ptp-17`: core и target bodies, принятые на `3c769601aa3627ca9c700982f1a170fc6c3352cb`, не переаудировались целиком; рассмотрены новый practicalTip и поздняя общая дельта. QuestionDeepHash текущего tip-носителя `741abd89535afb80ea866027f7904618cc70c7ecdfcf1a1ba4f7e0f95a69ebe5` не менялся при этом исправлении.
- Историческая реконструкция не повторялась; оставшиеся 153 L2 вопроса не получали нового семантического аудита. Ранее принятые качественные тексты девяти core не переписывались ради единообразия. Приёмка отдельных уроков владельцем не объявляется.

## Реально выполненные проверки и CI

- `node scripts/gate06-targeted-semantic.test.mjs` — PASS: 11 точных anchors в обоих стилях, исправленные teaching fields и tips, контекстные aliases/подсказки, отсутствие чужого NEXT, прежние доменные значения glossary сохранены. Тест подключён также к существующему `test:in-depth`; конфигурация Actions не переписывается.
- `npm run test:in-depth-history` — PASS: legacy/shuffled/current attempts, прежние варианты и correct indices, история и оценки совместимы.
- `npm run test:in-depth` — PASS: существующий структурный regression плюс адресные assertions. Его проход всех structural IDs не является новым полным семантическим аудитом.
- `npm run lint` и `npm run build` — PASS. Существующее предупреждение размера JS chunk не скрывается и не относится к этим содержательным исправлениям.
- Настоящий Chromium **156.0.8078.79**, локальный production build, **только 11 указанных ID × 375/1440 px = 22 успешных сценария**: оба стиля разбора/урока, точный target в видимой области, glossary interaction, возврат к исходному вопросу, сохранённая история/статистика не изменились, горизонтального overflow и JS-ошибок нет. [Browser evidence JSON](gate06-targeted-browser-evidence-20261123.json). Это не проверка опубликованного сайта и не Safari/iPhone.
- [Fast PR CI #45257238306](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45257238306) — SUCCESS на content SHA `3983019`.
- [Understanding regression CI #45257238333](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45257238333) — **FAIL** на последнем `Verify five-level registry is stable`: `verifyLearningLevelBaseline` отклоняет изменившийся bank checksum. Предыдущие steps content/history/drift-report прошли. Это не замалчивается как «CI PASS».
- Автоматический [four-state surfaces #45257238322](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45257238322) — SUCCESS. Существующий [browser shards #45257238332](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45257238332) на момент фиксации отчёта ещё IN_PROGRESS; его итог не заявляется как PASS. Оба запустились по штатным PR path triggers; локальный адресный PASS выше не приписывается этим CI. Нового полного семантического аудита не запускалось.

Отчётный follow-up коммит использует `[skip ci]`: его `src/` побайтно совпадает с уже исполненным и независимо принятым `3983019`, повторять штатные полные browser shards из-за публикации evidence не требуется. Дополнительный импорт адресного теста в существующий entry point проверен локально, но выполнение именно этого нового импорта в GitHub CI не заявляется. Исходный красный CI и его причина сохранены явными ссылками, а не скрыты обещанием зелёного нового HEAD.

### Точный оставшийся bank-guard блокер

Неизменённый `docs/audits/issue-171-baseline.json` требует bank hash:

`c7cc71535f4b06adcaf55c4e60f4fa6e5c4d275f9cf895883d759073ce11c00f`.

Исправленный банк имеет:

`7c55d16f7b6d7741b9f2a174ee971fd3062b09083fefb4217f37583a2f4939b9`.

Возврат **ровно пяти перечисленных explanation/remember/topic полей** к прежним значениям даёт исходный `c7cc…`, что проверено реальным банком. Все остальные записи/поля, условия, порядок, ответы, difficulty и ключи совпадают. Новые точные значения этих пяти полей проверяются адресным regression; неожиданная правка отвергается. Отдельный более ранний `invariants-baseline.json` также сохранён: его тест нормализует только эти точные teaching corrections и ранее одобренные answer snapshots, не переснимает baseline.

Однако stage-2 validator дополнительно фиксирует raw protected sources. Его контракт **не ослаблялся**, `issue-171-baseline.json`/protected fingerprints не обновлялись и проход не обходился. Минимальный следующий шаг интегратора — отдельное явное решение, как зарегистрировать независимо принятые содержательные изменения в versioned stage-2 migration/защитном контракте без фиктивного rebaseline. До такого решения CI остаётся блокирующим. Нельзя вернуть доказанно неверные teaching fields только ради зелёного hash.

## Остаточные блокеры и запреты

1. **Технический выпуск:** stage-2 bank/protected-source contract не согласован с пятью принятыми содержательными поправками; CI не полностью PASS. Нужен отдельный разрешённый переход защитного контракта, не самовольный bypass.
2. **GATE-06:** исторические 160 REVIEW не переписаны; единый frozen Git SHA не установлен. Адресные independent verdicts этого отчёта — новые доказательства для интегратора, не автоматическая приёмка остальных материалов или изменение release policy. Финальное решение остаётся отдельным.
3. **Публикация:** PR остаётся Draft; merge/deploy/live acceptance отсутствуют и в этой задаче запрещены.

В пределах 9+2 содержательной проверки незакрытых FIX/REVIEW нет. Блокеры выше относятся к выпуску/политике доказательств, а не к ложному «непроверенному» материалу. Production `apotet/netops`, исторические final-review JSON, исходные baselines, release policy не изменялись. Forensic-скрипты #334 не переносились в content PR. **GATE-06 = BLOCK. Остановка и передача ChatGPT для независимого решения; merge/deploy не выполняются.**

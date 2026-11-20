## 20.11.2026 — «Углублённый»: шесть шаблонных исправлений и приоритетный разбор 164 fingerprint

- **Отдельная предметная ручная проверка:** read-only source pack текущего runtime на [Actions #44672331430](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44672331430) обнаружил 6/6 подтверждённых дефектов дополнительного контента, где основа условия/ключ/дистракторы и plain/pro были корректны: пять шаблонных `practicalTip` (`l3-16`, `new-ts-photo-panel`, `review-dot1x-20`, `review-ospf-27`, `l3-d07`) и одна бессодержательная `commonTrap` (`l7-new-04`, HTTP/1.1). Исправлены предметно, без изменения исходных вопросов, ответов и practice links. Подробный доказательный отчёт: [`docs/audits/in-depth/remaining-six-generic-20261120.md`](audits/in-depth/remaining-six-generic-20261120.md).
- **Зависимость урока `l3-16`:** старый точный переход вёл в LPM-пример с несколькими маршрутами, хотя билет задаёт только connected и default. Создан точный раздел `l3-route-selection#in-depth-connected-vs-default-only` в plain/pro. Первый CI [#44672773193](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44672773193) выявил конфликт двух QUESTION_SECTION_LINKS для `l3-16`; исправлено: старый `in-depth-existing-l3-16` **сохранён как действующий якорь на исходном уроке**, но из старой route записи убран questionId. Теперь активная привязка одна. Проверка сохранения старого якоря, 6 исходных ключей, 12 mode×question и 6×2 Chromium — [Actions #44672987398](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44672987398) **SUCCESS**; вся 164-ID структура, исторические попытки, lint, build PASS. Публикаций и merge нет.
- **Аудит глобальных 164 semantic fingerprints, [Actions #44673257276](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44673257276) SUCCESS:** сравнение с Codex PR #263 SHA `188c6938`: 160 старых + 4 перенесённых; **25** идентичны reference, **34** изменены только из-за другого содержимого общих уроков/словаря, **101** имеют дельту самого вопроса/разбора/точного целевого раздела, ещё **4** не существовали в source snapshot. Статусы пересекаются в категориях изменения, но **25+34+101+4 = 164**. Из 160 historical review baseline **149** совпадали с историческими материалами Codex PR #263, 11 не совпадали — их нельзя честно сравнивать как один и тот же freeze. Текущий hash совпадает с историческим у **20 из 160**; это не равнозначно 20 независимым текущим semantic PASS, потому что старые reviewer rows отмечены REVIEW до публикационного freeze.
- Изменения по отдельным видам исходного материала относительно reference (пересекаются): **2 question** (условие/варианты), **68 explanation**, **105 linked whole lesson plain**, **124 whole lesson professional**, **91 glossary**; **1** изменение прямого `lessonId` (подсчитано отдельно от изменений `anchorId`). Новая ручная классификация сравнивает **точный связанный block** с прежним, поэтому 34 shared-only нельзя считать прямым изменением конкретного ответа, но обязательно проверить актуальные общие уроки/определения.
- Сигнатуры известного шаблонного контента после исправления: **0 совпадений в 164 активных разборах** на [#44673257276](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44673257276). Это не исключает новых, ещё не известных шаблонов и технических ошибок.
- **Дальше:** закрывать приоритетные **101 direct delta** по точным ID и shared lesson/glossary audit для **34** с доказательствами на frozen SHA; не восстанавливать зелёный fingerprint простым rebaseline и не подменять REVIEW на PASS. Текущая работа — только self-review для затронутых партий; 164-ID независимый semantic/GATE-01…10, все UI states и published staging smoke остаются **BLOCK**. PR #264 → #282 → #289 → #291 по-прежнему Draft, production `apotet/netops` не трогать.

---

## 20.11.2026 — Углублённый / самостоятельная предметная партия 12: 11 PASS + 1 адресный FIX

- В точной read-only выгрузке из активного L2 resolver **12/12** вопросов просмотрены по условию, всем альтернативам/ключам, brief/plain/pro, ловушкам, советам и точным `lessonId#anchorId` обоих стилей: [снимок и логи #44670910525](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44670910525). Первичная предметная самопроверка: **11 PASS / 1 FIX**. Подробный поимённый отчёт — [`docs/audits/in-depth/semantic-batch12-20261120.md`](audits/in-depth/semantic-batch12-20261120.md).
- FIX `review-qos-22`: вместо несвязанного «Сначала линк (L1/L2), затем маршруты и DNS» активный `practicalTip` теперь проверяет QoS trust/remarking DSCP, DSCP→class→egress queue, scheduling и queue drops/marks на правильном выходном интерфейсе, с оговоркой о платформенных командах/counters. Ключи, опции, соответствующий профессиональный и простой разбор, якорь `qos-basics#in-depth-dscp-classification-queue-congestion` не изменены.
- Новая регрессия `scripts/in-depth-semantic-batch12.mjs` контролирует все 12 original correct indices, оба стиля точного якоря, 5 вариантов `tcp-06`, предметный QoS-tip и запрет прежней общей заглушки. Actions [#44671153211](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44671153211): 164-ID structural/history, lint, build и локальный реальный Chromium 375/1440 на `review-qos-22`. Дополнительная ретестовая цепочка [#44671153233](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44671153233).
- **Межевой статус:** содержательный self-review 11, QoS адресно исправлен, но глобальная независимая приёмка 164 ID / semantic-fingerprints / GATE-01…10 всё ещё BLOCK. Draft PR #264 → #282 → #289 → #291 не сливать, опубликованный staging/production не менять.

---

## 20.11.2026 — Самостоятельная повторная инженерная проверка PR #291 (3 FIX) — PASS с дополнительным исправлением

- **Проверен живой дифф PR #291 и активный исходный текст для `l3-d05`, `l4-d03`, `l4-d05`, `tcpip-d05`.** При повторной ручной проверке ответов, двух режимов, уроков и диагностических советов PAT и TIME-WAIT соответствуют условиям; ECN `tcpip-d05` без изменений и корректен по содержанию.
- **Дополнительный подтверждённый дефект в SACK:** в трёх местах (`l4-d05` `practicalTip`, профессиональный разбор, профессиональная секция урока) использовалось устаревшее поле Wireshark `tcp.options.sack`, указанное официальной справкой Wireshark только для версии до 2.2.17. Заменено на актуальные `tcp.options.sack.count`, `tcp.options.sack_le`, `tcp.options.sack_re`. Сверено с RFC 2018 (согласование SACK-Permitted в SYN, блоки в ACK). Регрессионный тест теперь проверяет все три места и отсутствие устаревшего bare-поля.
- **PAT:** сверены internal/external endpoint, NAT translation table и зависимость mapping от реализации (RFC 4787); `show ip nat translations` и `conntrack -L` относятся к предмету вопроса.
- **TIME-WAIT:** проверены фактическое активное закрытие, повторный ACK на FIN, отличие CLOSE-WAIT, диагностические команды и RFC 9293.
- **Контроль:** самопроверка авторского исправления и structural/browser CI — это не внешний независимый отзыв. Конкретную исправленную четвёрку можно принять как **SELF-REVIEW CONTENT PASS** после успешного CI на финальном HEAD; остальные 164-ID semantic-fingerprint и GATE-01…10 сохраняют BLOCK. Не делать merge/deploy только по этому узкому результату.

---

## 20.11.2026 — Углублённый: отдельный аудит четырёх перенесённых вопросов (после PR #289)

- **Исходная точка:** дочерняя ветка от PR #289 HEAD `a474fd22e3f34dc0dd8c9c60936d243410b6e0ee`. Сформирован read-only source pack актуальных вопроса/ответов, двух слоёв разбора, точных plain/pro разделов уроков; [Actions #44668791486](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44668791486) — PASS.
- **Авторская первичная предметная рецензия (не независимая финальная приёмка):** `l3-d05` PAT — FIX (ошибочный общий `ip route` вместо NAT translations); `l4-d03` TIME-WAIT — FIX (общие заглушки `ss -tulpn` и `commonTrap`); `l4-d05` TCP SACK — FIX (`ss -tulpn` вместо проверки SACK option); `tcpip-d05` ECN — PASS по исходному смыслу и совету. **1 PASS / 3 FIX / 0 REVIEW в исходном снимке.**
- **Точечный авторский ремонт:** только три записи `SPECIFIC_PRACTICAL_TIPS` и один `GROUP5_PATCHES['l4-d03'].trap`. Новые советы основаны на наблюдаемых проверках PAT (Cisco `show ip nat translations`, Linux `conntrack`), TCP FIN/ACK и TIME-WAIT, TCP SACK-Permitted / cumulative ACK / SACK blocks. Исходные условия, дистракторы, ключи, уровни, уроки и ссылки не изменяются.
- **Контроль:** `scripts/in-depth-new4-fixes.test.mjs` проверяет исходные четыре ответа, ключи, двойные стили и точные якоря, отсутствие заглушек и существующий `nat` practiceLink. Изолированный workflow прогоняет full 164-ID structural, history, lint, build и Chromium 4 вопроса × 375/1440 на локальном preview; публикует pack для повторного независимого Gemini Work review.
- **Решение:** после авторского исправления **три FIX требуют новой независимой семантической оценки на финальном SHA**. Старый авторский PASS не означает разрешения на merge. Все PR #264/#282/#289 и дочерний PR остаются Draft/BLOCK до последующих независимых fingerprint и GATE-01…10; production запрещено менять.

---

## 20.11.2026 — Batch03 / PR #289: 10 FIX приняты по содержанию, реальный Chromium PASS; полная интеграция ещё BLOCK

- **Gemini Work повторная независимая рецензия:** 10/10 PASS, 0 FIX, 0 REVIEW на frozen content SHA `835a2e09c6760e065783a33cd72814958822b0c1`: 9 отдельных `practicalTip` + `tcpip-d01` `commonTrap`. Вся цепочка PR #264 → #282 → #289 остаётся **Draft**, без merge/deploy.
- **Прямая GitHub-сверка:** 10 точных новых полей проверены в diff #289; ключи/варианты не менялись этим PR. Изменения после исходного semantic ACCEPT `835a2e09` ограничены только read-only CI/workflow и новым browser-test script, без правок учебного кода. Ранее CI #44663421079 прошёл `test:in-depth`, `test:in-depth-history`, `lint`, `build`.
- **Живой browser matrix, тестовая локальная сборка из PR (не опубликованный staging):** [Actions #44665876363](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44665876363) — все **4/4 shard SUCCESS**, каждый 41 ID × 375/1440px; всего 164 ID / 328 ID×viewport проверок. Оба режима вопроса и урока, точный `lessonId#anchorId`, возврат «К каталогу», сохранённая история и отсутствие horizontal overflow; screenshots/evidence в `batch03-browser-shard-0..3`.
- **Живые кнопки practiceLink, отдельно:** [Actions #44667825761](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44667825761) — **6/6 PASS** для `gen-transport-7 → dhcp`, `new-ts-vlan → cli-vlan` (сценарий `Access VLAN на порту`), `tcpip-d01 → packet`; обе ширины 375/1440, реальный клик из разбора, целевой стенд/сценарий, без pageerror и горизонтального переполнения.
- **Решение:** закрыт именно Batch03 10-FIX semantic и его браузерная регрессия на тестовом билде. **НЕ DONE** полная 164-ID независимая семантическая приёмка и fingerprint gate; у PR #264 сохраняется отсутствие GATE-01…10 в публикационном чеклисте, а также отдельные требования проверки остальных изменённых материалов, старых состояний UI и финального опубликованного smoke. Зеленый browser и пакетный CI не разрешают merge исходных PR и не означают выпуск уровня. Production `apotet/netops` не трогать.

---

## CURRENT · NetOps / «Углублённый» — распределение ответственности и реальные блокеры, 19.11.2026

**Главный активный учебный PR:** [#264](https://github.com/apotet/my-gemini-mirror-site/pull/264), snapshot `5df2a0b46116323201a6ae933a4c650e78b105db`, статус **Draft / BLOCK**. По состоянию на проверку из GitHub Actions: `In-depth Understanding Chromium` shards 0–3 **PASS**, основной CI **FAIL** на `Compare 160 independent semantic-review fingerprints to current material`, `Merge readiness checklist` **FAIL** на `Validate content checklist only for learning-content PRs`. Отчёт Gemini `gemini-4-hydrogen` даёт **4/4 предметных PASS** на точных вопросах и SHA; ещё **160** вопросов требуют предметной приёмки. Модель сама не проверяла живой интерфейс.

**Ответственность и этапы:**
1. **ChatGPT / инженерная подготовка:** инвентаризация всех 164 ID по ключам, урокам, якорям, двум слоям, ссылкам и регрессионным требованиям. По `gap-pack2-05` [подтверждён дефект точной секции](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7006899500); не считать его PASS. Для проверки следующих вопросов сначала использовать замороженный SHA; структурные изменения готовить отдельно, чтобы сохранить доказательность текущих снимков.
2. **Gemini / тяжёлая независимая семантика:** `auto:1…40`, по 4 вопроса, сверка RFC/протоколов, всех дистракторов, условий задачи, конкретных plain/pro и ссылок. Только read-only advisory в PR; ни правок, ни merge, ни deploy. Вызовы API ограничены `max_batches<=2` на один **ручной** запуск; при FIX/REVIEW второй вызов прекращается. Нет cron и автоматического расходования квоты.
3. **ChatGPT / вторичная приёмка и исправления:** независимо воспроизводить замечания на точном исходном SHA, делать доказанные FIX и регрессионные тесты. Если исходный SHA меняется, старые модельные PASS не переносятся автоматически.
4. **ChatGPT / публикационные барьеры:** подтвердить semantic-fingerprint актуального кода (без фиктивного rebaseline), GATE-01…10, чеклист, четыре состояния урока/профессионального слоя, старые попытки и tr-03/tr-10, браузерные переходы по точным разделам, адаптивность мобильного/десктопа. Только после этого merge в staging и проверка уже опубликованной версии.
5. **Владелец / production:** перенос в `apotet/netops` исключительно после отдельной явной команды.

**Не DONE:** PR #264, вся 164-ID приёмка, исторические сценарии, staging публикация учебного уровня. **DONE:** инфраструктура read-only Gemini и ручной ограниченный двухпартийный запуск (PR #265–268).

---

## P0 · Gemini: последовательная приёмка максимум двух партий по четыре вопроса — 19.11.2026

В [Draft PR #268](https://github.com/apotet/my-gemini-mirror-site/pull/268) внедрён **дополнительный выбор** `max_batches=1/2` в ручном GitHub Actions запуске (по умолчанию **1**), без фонового расписания. `dry_run=true` по умолчанию остаётся. Если пользователь вручную задаёт `max_batches=2` и `ids=auto:N` (N=1…39), первый вызов Gemini отправляет отчёт в PR; **второй API-вызов по `auto:N+1` возможен только после 4/4 PASS с корректным SHA, индивидуальными доказательствами, без FIX/REVIEW/замечаний**. Любой спорный результат, ошибка запроса, изменение SHA или неправильные ID останавливают цепочку. При запуске с обычным списком ID или `auto:40` двухпартийный режим блокируется до API. Всего максимум два запроса, без повторов и без auto-merge. Автономный тест: `scripts/gemini-batch-control.test.mjs`; отчёт остаётся advisory; Gemini не меняет код. **Ожидает полную CI/merge-проверку; production без изменений.**

---

## DONE · Прямая независимая проверка NetOps через Gemini API и GitHub Actions — 19.11.2026

**Достижение: рабочая цепочка без компьютера, ручных загрузок в Google Диск и копирования исходников.** В staging-репозитории `apotet/my-gemini-mirror-site` установлена интеграция GitHub Actions → разрешённый секрет `GEMINI_API_KEY` → Gemini API → read-only отчёт-комментарий в целевой PR. [Инфраструктура PR #265](https://github.com/apotet/my-gemini-mirror-site/pull/265), [исправление API модели PR #266](https://github.com/apotet/my-gemini-mirror-site/pull/266), [очередь PR #267](https://github.com/apotet/my-gemini-mirror-site/pull/267) — **все три смержены в staging main**.

- **Первый настоящий успешный аудит:** `gemini-4-hydrogen`, входные 4 вопроса из PR #264 на зафиксированном SHA `5df2a0b46116323201a6ae933a4c650e78b105db`; **4 предметных PASS из 4**, правильные ключи и `lessonId#anchorId`, индивидуальные объяснения и обе секции уроков; [полный отчёт Gemini](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7006606671). В отчёте учтены ограничения: проверка по собранным исходным материалам, **не** подтверждение UI-переходов или полного независимого приёмочного регламента.
- **Реальная работа API подтверждена:** 4 792 входных и 1 523 выходных токена, API вернул `totalTokenCount=8950` с учётом собственной метрики Google. Точные условия бесплатной квоты зависят от проекта; отдельная платёжная подписка на Gemini в приложении не требуется для чтения отчёта.
- **Удобство на iPhone:** workflow вызывается вручную в GitHub Actions, не требует настольного интерфейса Gemini. `ids=auto:1…auto:40` распределяет **оставшиеся 160 вопросов на 40 четвёрок**, при этом старая ручная передача ID сохраняется; режим привязан к зафиксированному SHA, при изменении материала останавливается вместо принятия старого PASS.
- **Защитные границы:** Gemini не изменяет файлы, не делает merge и deploy; за исправления, проверку CI и **staging merge отвечает ChatGPT**. По умолчанию `dry_run=true`, новых платных вызовов нет без явного запуска; пользовательский ключ хранится в GitHub Secret, значение в ROADMAP не записывать. Production `apotet/netops` не трогать.
- **Оставшиеся задачи:** PR #264 остаётся **Draft/BLOCK**. Новый запуск по `auto:1` обнаружил `gap-pack2-05` без точного якоря урока — [доказательство](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7006899500). Это FIX, а не PASS. Нужно независимо проверить остальные материалы, исправить подтверждённые дефекты, закрыть семантические fingerprint, GATE-01…10, браузер и исторические попытки до merge. Последовательный ограниченный автозапуск нескольких партий **ещё не внедрён**; существующая очередь выбирается вручную.

---

## P0 · Gemini semantic review — очередь 160 непроверенных материалов, 19.11.2026

После подтверждённого ручного запуска `gemini-4-hydrogen` (4/4 предметных PASS, snapshot `5df2a0b46116323201a6ae933a4c650e78b105db`, [комментарий в PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7006606671)) в [смёрженном PR #267](https://github.com/apotet/my-gemini-mirror-site/pull/267) внедрено упрощение: `ids=auto:1`…`auto:40` — ровно **160** ещё не рецензированных ID, группы по четыре, без дубликатов и без ручного ввода длинных списков. В `scripts/gemini-audit-pack.mjs` автоочередь жёстко прикреплена к текущему head PR #264, к 164-ID пулу и к четырём известным уже проверенным ID. Изменение HEAD прерывает автоочередь до независимой переоценки. Ручные ID сохранены.

**Gemini только рецензирует** (предметная проверка ключей, вариантов, plain/pro, точной секции урока). Авторский контроль и merge остаются за ChatGPT после GATE-01…10, CI, исторических попыток, реальной навигации и семантической приёмки актуального материала. Ни один PASS Gemini не становится разрешением на merge автоматически. По умолчанию dry-run: true; **API без ручного разрешения не вызывается**, максимум один `generateContent` на запуск, без повторов. Дополнительных ключей или платежей не нужно. Только staging, production не трогать.

---

## P0 · Gemini GitHub Actions auditor: fix API model 404 — 19.11.2026

Первый ручной запуск после успешного dry-run: `Gemini read-only NetOps reviewer 4` → этап `One bounded Gemini API call` вернул **HTTP 404**, поэтому **модель не проверяла вопросы и отчёт не публиковался**. Старый workflow запрашивал `gemini-2.5-flash`, доступ к которой Google ограничил для новых API-проектов. Google официально выпустил `gemini-4-hydrogen` 12.11.2026; она поддерживает GenerateContent и бесплатный тариф. Исправление в отдельном PR `fix/gemini-hydrogen-api-model-20261119`: новое значение по умолчанию `gemini-4-hydrogen`, резервный **ручной** вариант `gemini-3.8-flash`, диагностический код/сообщение API c маскированием ключа, автономные мок-тесты 404, отсутствующего секрета и отказа в неверном якоре. Не запускать платных автоматических повторов, не делать auto-merge; Gemini — только рецензент, ChatGPT принимает решение о staging merge после CI. PR #264 этим исправлением не разблокируется автоматически.

---

## IN PROGRESS / BLOCK — Understanding 164: точные ссылки на уроки (19.11.2026)

**PR #264, новый код после независимого snapshot `5df2a0b`.** После выявленного отсутствия якоря `gap-pack2-05` привязаны четыре билета к тематическим разделам существующих уроков, не изменяя вопросы и правильные ответы:
- `gap-pack2-05` → `tcpip-encapsulation#in-depth-fcs-ipv4-header-payload-scope` (FCS на текущем участке, IPv4 header checksum и изменившаяся payload);
- `gap-pack2-10` → `tcpip-encapsulation#in-depth-ppp-ipcp-first-ipv4-packet` (PPP Protocol=0x0021, IPCP уже согласован);
- `gap-pack2-11` → `l7-dns#in-depth-dns-aaaa-noerror-nodata` (NOERROR/NODATA, A существует, AAAA отсутствует, TC=0);
- `gap-pack2-16` → существующий `l7-services#in-depth-ntp-source-validity-rate` (KoD RATE; правки читабельности Stratum).

Добавлены строгие проверки обоих стилей уроков, точных якорей и инвентаризация 164-ID покрытия `scripts/.cache/in-depth/anchor-inventory.json`. **Ни один прежний Gemini PASS не переносится автоматически на новую версию материала.** До зелёного CI, независимого semantic-delta review, GATE-01…10, текущих fingerprint, проверки истории и опубликованного staging статус остаётся **DRAFT/BLOCK**. Production не менялся.

---

## P0 · Gemini source-pack audit 4 ID и реальные типографические FIX — 19.11.2026

**PR #264, авторская правка и проверка CI ещё открыты, публикация запрещена.** Gemini проверил пакет `NetOps_Gemini_4_questions_source_pack.md`, основанный на точном CI-снимке SHA `1bd3af7`, **не raw GitHub и не браузер**. В отличие от Grok, верно указал четыре связки `questionId → lessonId#anchorId`: `gap-pack2-27 → l4-tcp#in-depth-udp-empty-message`, `gap-pack3-15 → l7-services#in-depth-http-head-no-body`, `stp-new-09 → l2-stp-protection#indepth-udld-aggressive-neighbor`, `l4-new-05 → l4-tcp#udp-checksum-ipv4-ipv6`. Предметно подтвердил ключи и дистракторы, но навигацию, оригинальные TS-файлы и все GATE самостоятельно не проверял: **не считать полным независимым DONE**.

Его замечания о склейках оказались настоящими текстовыми ошибками исходных секций в `src/data/inDepth/group1.ts` и `group2.ts`, а не артефактом CI: `равно8`, `результатом0`, `включает8`, `Length8`, `вернуть0`, `HEAD200`, `Content-Length5000`, `читать5000`, `Nбайт`, `как0xFFFF`. Исправлены только пробелы / форма `Length=8`; кроме этого аналогичная склейка `вернуть0` устранена в глоссарной подсказке `recvfrom`. `scripts/in-depth-content.test.mjs` теперь проверяет текст точных секций *в обоих стилях* по их реальным якорям и словарь. Ни ключи, ни варианты, ни механизмы объяснений не менялись. Последний SHA фикса `b1769f5fafba0a6ab1b248928168eea3f58166a5`; CI/browser и независимое принятие нового отпечатка проверить отдельно.

---

## P0 · «Углублённый (Understanding)»: индивидуальные практические советы, 19.11.2026

**Статус AUTHOR FIX / CI SEMANTIC BLOCK / INDEPENDENT RECHECK PENDING.** PR [#264](https://github.com/apotet/my-gemini-mirror-site/pull/264) остаётся Draft. Учебный код поправлен, но уровень **не DONE**, merge и deploy не разрешены.

- Повторный аудит Grok `batch-03-fix-recheck` и `batch-04` нельзя автоматически считать независимой семантической приёмкой: из 10 новых строк batch-04 четыре классифицируют сам предмет неправильно (UDP как TCP, HTTP HEAD как service identification, UDLD как STP). Исходные вопросы/ключи корректны и не переписывались. Глубокая проверка исходного снимка `7a1ce5c` и машинной дельты: [Actions 44478490970](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44478490970), artifact `bank-coverage`.
- По фактическому снимку 164 «Углублённого» обнаружено **41** повторение чужой общей практической подсказки «Не смешивайте симптомы разных слоёв модели». В PR #264: 3 адресных исправления в `group1.ts/group3.ts`, одна корректировка ловушки `l4-new-05` в `group2.ts`, затем ещё **38** специальных советов в `src/data/inDepth/specificPracticalTips.ts` с приоритетом авторских `patch.practicalTip` и регрессионным тестом в `scripts/in-depth-content.test.mjs`.
- Результат машинной проверки из [CI run 44482406569](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44482406569), `bank-coverage` artifact `14508359257`: **0/164** прежних общих подсказок; последние 38 changed records имеют дельту **только `deep.practicalTip`**; тексты всех 164 вопросов и ключи ответов, оба режима всех связанных уроков не менялись. Для первых трёх и ловушки — дельта только заданных полей, подтверждена отдельным сравнением `17b970`.
- Регрессионный тест проверяет отсутствие общих заглушек для всех 164 и предметные советы для `gap-pack3-08`, `gap-pack3-15`, `l57-x19`; ловушка `l4-new-05` должна описывать ошибочное представление, а не повторять верное правило.
- **Не объявлять независимым PASS авторские исправления**: требуются предметная повторная рецензия 41 советов, дельта shared lessons/glossary по всем изменённым fingerprint, осмысленная проверка 164 вопросов, финальные CI/browser 375/1440, GATE-01…10 и только после их успешного завершения возможна staging-публикация. Fingerprint gate специально остаётся FAIL, пока изменения не независимо приняты. Production `apotet/netops` не менять.

---

## P0 · Интеграция «Углублённого (Understanding)», 164 вопроса — DRAFT (19.11.2026)

**Отдельная интеграционная ветка:** `integrate/in-depth-164-codex-gemini-20261119`, исходные Draft PR [#263](https://github.com/apotet/my-gemini-mirror-site/pull/263) и [#253](https://github.com/apotet/my-gemini-mirror-site/pull/253) не изменены. В актуальном main уже учтены #258 (216/164) и #262 (S/FTP), их изменения не откатывать. Четыре перенесённых ID: `l3-d05`, `l4-d03`, `l4-d05`, `tcpip-d05`; добавлены предметные `pro` и контекстные ссылки к существующим урокам в обоих стилях. Gemini `review-poe-30` — единственный непересекающийся патч, перенесён без перезаписи других 74; исторические варианты для `tr-03` и `tr-10` должны сохраняться. [Решения и проверяемая матрица](audits/in-depth/integration-164-20261119.md).

**Браузерный регрессионный фикс:** `TheoryView` сбрасывает локальный `focusQuestionId` при «К каталогу» после возврата из урока; Chromium проверяет полный цикл переходов. 164 вопроса × 375/1440 px исполняются в 4 параллельных shard по 41 ID. Независимый PASS всех 4 заданий обязателен.

**Уточнение browser-возврата:** на desktop при смене `По делу` → `Простыми словами` один якорь мог оказаться вне видимой области после рефлоу. Добавлена повторная проверка точного якоря в `LessonView` на 120/400 мс после отрисовки и подробный диагностикующий browser-assert. Проверять PASS всех четырёх shards повторно.

**Ремонт после независимой ревизии batch-01 (19.11):** исправлен смешанный профессиональный раздел `ts-method#indepth-dns-name-vs-address`, который трактовал HTTP-симптом `tr-03` как ping (раздел теперь различает `tr-03` и `ts-x03`); для `l4-03` добавлена адресная двухстилевая секция `l4-tcp#in-depth-tcp-stream-record-framing`. Добавлены регрессионные проверки обоих маршрутов и контекста. *Это авторские исправления; повторная независимая приёмка и CI ещё обязательны.*

**Ремонт после ревизии batch-02 (19.11):** два FIX от Грока устранены предметно: `review-slaac-4` привязан к `l3-ipv6#in-depth-slaac-ra-address-formation` (адрес через RA/A=1, не поиск NS); `review-qos-22` к `qos-basics#in-depth-dscp-classification-queue-congestion` (DSCP/classifier/egress queue, не ECN). Точные двустилевые секции добавлены в `group3.ts`, тесты в `in-depth-content.test.mjs`. Результаты не объявляются PASS до независимой повторной проверки.

**Ревизия batch-03 (19.11):** Grok поставил 10 PASS в `3f1a9a5`, но в `review-syslog-25` одновременно поставил `lesson=REVIEW` и ошибочно описал якорь как `null` — фактически вопрос был прикреплён к NTP RATE. Исправлена ложная привязка; добавлен адресный раздел корреляции Syslog/NTP/timezone. Ещё шесть вопросов (`review-poe-30`, `l1v2-a-category-limit`, `l1v2-a-jacket-limit`, `l1v2-a-label-sftp`, `l1v2-a-solid-use`, `gap-pack2-21`) получили собственные два стиля и адресные якоря внутри существующих уроков. Все семь изменений требуют свежей независимой приёмки и 164×2 browser CI; нельзя закрывать GATE по отчёту автора правок.

**Гейт:** независимая поимённая семантическая приёмка и CI/browser/staging smoke ещё не завершены. Не объявлять уровень DONE и не сливать Draft до полного PASS по регламенту. Production без изменений.

---

## CURRENT · Gemini Work партия №3 (50): проверено 40 PASS / 10 FIX, исправления PR #289 + готов delta ZIP (20.11.2026)

**Gemini App Work вернул документы** `verdicts(1).json`, `Report.md`, `netops_batch03_50_audit_results.zip` по пакету 50 реальных ID из staging Draft [PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264), **source SHA `1f273787370a64cf39732974b60c1706e538f5bb`**. Итог модели **40 PASS, 10 FIX, 0 REVIEW**. Эти статусы — **на старый SHA**, не publication DONE.

**ChatGPT проверил фактические файлы, не доверяя отчёту на слово:** все 50 ID совпадают с `manifest.json` в исходном [ZIP #14594629999](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44661394922/artifacts/14594629999), 50 SHA верны, **201/201** ответов по тексту, индексам и ключам соответствуют 49 вопросам на четыре варианта и одному на пять (`tcp-06`); 50 ссылок на урок и точный anchorId/coverage совпали, **66/66** SHA256 исходного ZIP и **10/10** pack hashes верны; ZIP с ответом Gemini читается без CRC-ошибок, отдельно присланные JSON и Markdown соответствуют файлам ответа внутри ZIP; **10/10 реальных `before` полей** для десяти предложенных исправлений дословно найдены в исходных снимках. Целостность подтверждена, но 40 исходных PASS не превращены в гарантию правильности всех RFC и UI.

**10 FIX подтверждены:** девять негодных generic `explanation.practicalTip` — `gen-diag-0`, `gen-transport-14`, `gen-transport-16`, `gen-transport-17`, `gen-transport-5`, `gen-transport-7`, `l12-storm01`, `new-ts-duplex`, `new-ts-vlan`; один placeholder `explanation.commonTrap` у `tcpip-d01`. **Ключи всех этих вопросов остались без изменений**. Технически узкие исправления в [Draft PR #289](https://github.com/apotet/my-gemini-mirror-site/pull/289), **HEAD `835a2e09c6760e065783a33cd72814958822b0c1`**, STACKED на ранее подготовленный [Draft PR #282](https://github.com/apotet/my-gemini-mirror-site/pull/282) HEAD `4798a61fd6d0dbfa6b15fe0f4ffbe61637a72cad` (тот на source PR #264). Изменены только `src/data/inDepth/specificPracticalTips.ts` (9 tips), `src/data/inDepth/group4.ts` (`tcpip-d01` trap), `scripts/in-depth-content.test.mjs` (регрессии) и отдельный read-only CI workflow. Новые советы проверяются на предметную относимость и риск действий в АСУ ТП. **Прочие косметические опечатки** (восьмёрка ID, часть перекрывается с десятью FIX; `VLAN20`, `номер443`, `IOSXE` и др.) **пока не правились** и остаются отдельным косметическим долгом.

**РЕАЛЬНЫЕ ТЕХНИЧЕСКИЕ ГЕЙТЫ:** [CI #44663421079](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44663421079) **SUCCESS** — структурные тесты 164 вопросов Understanding и 10 конкретных tips/trap, сохранённый пятый вариант `tcp-06`, lessonId#anchorId/plain/pro, историческая совместимость, `npm run lint` и `npm run build` (сборка без deploy). HEAD исходных PR #264 и #282 проверены до/после.

**ГОТОВА ДЕЛЬТА ДЛЯ GEMINI «РАБОТА» НА НОВЫЙ SHA:** [Actions #44663923054](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44663923054) SUCCESS, [artifact #14596612004](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44663923054/artifacts/14596612004) — **`NetOps-Gemini-Work-Batch03-10-Fixes-Delta-20261120.zip`** (73 325 bytes). ZIP фактически скачан в этот чат `/mnt/data/NetOps-Gemini-Work-Batch03-10-Fixes-Delta-20261120.zip`, проверен контейнером: 19 ZIP entries, CRC OK, 18/18 SHA256SUMS, 4/4 packs (OLD/NEW по два), 10/10 ID, каждая карточка изменена **РОВНО в одном предписанном поле**, ни один старый ключ/вопрос/anchor/режим урока не менялся. Source OLD = PR #264 `1f273787...`, NEW = PR #289 `835a2e09...`; `manifest SHA256=aad2d3478107131d65b105f459c5026060234f338267fccd9baeb7e22c919645`. Внутри `01_GEMINI_WORK_TASK.md` — задача на независимые **10 PASS/FIX/REVIEW** без действий в GitHub. Временный [Draft PR #290](https://github.com/apotet/my-gemini-mirror-site/pull/290) **закрыт без merge**. 

**ТЕКУЩИЙ СТАТУС:** исходные **40 PASS/10 FIX** подтверждены только как отчёт Gemini и полевая сверка; **10 исправленных материалов НЕ имеют нового независимого модельного вердикта**. Живые lesson anchors, practiceLink, историческая попытка в браузере, 375/1440, fingerprint baseline/delta и полный staging GATE-01…10 **НЕ ПРОВЕРЕНЫ**. Все PR #264, #282, #289 — **Draft/BLOCK**, ничего не мерджить/не публиковать до независимой приёмки и команды владельца; production `apotet/netops` untouched.

**Технические источники для новой дельты:** [RFC 3416](https://www.rfc-editor.org/rfc/rfc3416.html) — SNMP; [Modbus TCP Implementation Guide](https://www.modbus.org/docs/Modbus_Messaging_Implementation_Guide_V1_0b.pdf) — TCP/502 и MBAP; [Microsoft MS-RDPEUDP](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdpeudp/) — дополнительный UDP транспорт.

---
## CURRENT · Подготовлена партия №3 Gemini Work: 50 НОВЫХ «Углублённых» для независимого аудита (20.11.2026)

**Выполнено по прямой просьбе владельца:** вместо Gemini API создан автономный ZIP **`NetOps-Gemini-Work-Batch03-Text-50-Questions-20261120.zip`**, готовый для Gemini в режиме **«Работа»**. Содержит ровно **50 уникальных вопросов** frozen Draft PR #264 на SHA **`1f273787370a64cf39732974b60c1706e538f5bb`**, не пересекающихся с предыдущими двумя архивами Gemini Work (партия 01: 30/30, партия 02: 30 подготовленных) и с четырьмя ID первичного успешного API-аудита. Входной реестр «Углублённого» = **164**, исходная очередь initial-summary = 160 без четырёх первых; из этих 160 распределено **30 (batch01) + 30 (batch02) + 50 (batch03) = 110**, ещё **50** пока не попали в эти три отдельные партии. Это **охват упаковкой**, а не независимые PASS. Не объявлять, что новые 50 уже проверены Gemini.

**Состав выбранных 50 ID:** `gap-pack2-05`, `gap-pack2-10`, `gap-pack2-11`, `gap-pack2-16`, `gap-pack2-21`, `gap-pack3-08`, `gap-pack3-12`, `gen-diag-0`, `gen-diag-10`, `gen-diag-13`, `gen-diag-2`, `gen-diag-5`, `gen-diag-6`, `gen-diag-7`, `gen-diag-9`, `gen-osi-a-18`, `gen-osi-a-19`, `gen-osi-a-2`, `gen-port-11`, `gen-port-14`, `gen-transport-1`, `gen-transport-14`, `gen-transport-16`, `gen-transport-17`, `gen-transport-5`, `gen-transport-7`, `k-01`, `k-02`, `k-03`, `k-04`, `k-05`, `k-06`, `k-07`, `l1-02`, `l1-04`, `l12-copp01`, `l12-d05`, `l12-ds04`, `l12-storm01`, `l12-x02`, `l12-x03`, `new-ts-dns`, `new-ts-duplex`, `new-ts-vlan`, `tcp-05`, `tcp-06`, `tcp-10`, `tcpip-d01`, `tcpip-d02`, `tcpip-d04`. Семантическая направленность: L1/L2/L3, диагностические кейсы, TCP/IP, транспорт, CoPP, storm-control, TCP/DNS; намеренно исключены билеты с самостоятельной необходимой фотографией/скриншотом без самой картинки.

**Реальные доказательства экспорта:** [GitHub Actions #44661394922](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44661394922) SUCCESS; [скачать оригинальный GitHub artifact #14594629999](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44661394922/artifacts/14594629999), ZIP **252134 bytes** (на диске чата `/mnt/data/NetOps-Gemini-Work-Batch03-Text-50-Questions-20261120.zip`); внутренняя структура **50 Markdown cards + 10 immutable packs × 5**, исходный `LEARNING_CONTENT_STANDARD.md`, строгий `01_TASK_FOR_GEMINI_WORK.md`, `manifest.json`, индекс, пример схемы результата, `SHA256SUMS.txt`. Проверены по фактическим байтам ZIP: **CRC OK, 66/66 SHA256SUMS, 10/10 pack hashes, 50 уникальных IDs/keys/source SHA, 0 coverageIssues**, без фото-ссылок, которые требовали бы недостающего источника. `manifest SHA256=c457f1fa9328c94e5945d6367ebd4213e103c42bd83f3dd24926cc8648ea7ff8`. **Нюанс важен:** 49 билетов с **4** вариантами и **1** (`tcp-06`) с **5** вариантами; экспортёр исправлен, Gemini должен разобрать **все** варианты, не только первые четыре.

**Ошибка и устранение:** первый однократный [Actions #44661173187](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44661173187) остановил сборку, потому что старый паковщик принудительно требовал ровно четыре опции, хотя `tcp-06` имеет пять. Исправлены `handoff/assemble-gemini-work-50.mjs` и строгий task, повторная сборка [#44661394922](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44661394922) завершилась SUCCESS. Временный Draft [PR #288](https://github.com/apotet/my-gemini-mirror-site/pull/288) **CLOSED без merge**; **0 Gemini API calls, 0 writes** в исходные вопросы или уроки, 0 staging/production deploy, 0 новых независимых модельных verdicts. ZIP в приложении пользователь передаёт сам.

**Что делать Gemini App Work:** загрузить ZIP, попросить прочитать `01_TASK_FOR_GEMINI_WORK.md`, `manifest.json`, `LEARNING_CONTENT_STANDARD.md`; проверить **50/50 в десяти внутренних пятёрках** с ключами, каждым фактическим вариантом (включая пятый `tcp-06`), всеми индивидуальными why/plain/pro и связанными уроками plain/pro; вернуть `verdicts.json`, `REPORT.md`, `FIX_PROPOSALS.md` (по возможности ZIP). Ни один PASS не переносить на другой SHA без delta-review; не обещать live браузерный link/CI/history. После поступления результатов ChatGPT независимо сверяет **каждый** ID/поле/содержательный FIX и делает отдельный Draft без merge. Существующие [PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264) и [PR #282](https://github.com/apotet/my-gemini-mirror-site/pull/282) — DRAFT/BLOCK; **production `apotet/netops` не трогать**.

---
## CURRENT · Gemini Work delta 14/14: получен PASS-отчёт, плюс точная поправка RTP Delta (20.11.2026)

**Gemini App Work вернул материалы:** `DELTA_VERDICTS.json` и ZIP с `DELTA_REPORT.md` / `DELTA_FIXES.md` по пакету 14 вопросов (9 содержательных доработок + 5 прочих вопросов с типографикой; в одном из девяти одновременно исправлен пробел). Снимок исходного [Draft PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264) **OLD SHA `1f273787370a64cf39732974b60c1706e538f5bb`** → первоначально предложенный [Draft PR #282](https://github.com/apotet/my-gemini-mirror-site/pull/282) **NEW SHA `8e3f62246b5d9caea3814d8b455931ccb9f5c477`**. Исходный автономный [GitHub artifact #14593428866](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44657903702/artifacts/14593428866), подготовленный без Gemini API. **Gemini Verdict = 14 PASS / 0 FIX / 0 REVIEW, но строго ТОЛЬКО на SHA 8e3f622…**

**Независимая проверка полученных файлов ChatGPT:** входной и ответный ZIP имеют исправные CRC; возвращённый `DELTA_VERDICTS.json` побайтово совпадает с отдельно присланным JSON. 14 ID строго в порядке manifest и с правильной парой SHA; **все 19/19 изменённых полей BEFORE и AFTER дословно совпадают** с исходными old/new pack и `manifest.report` без пропущенных полей; **56/56 вариантов и их оценки** совпадают с источником и исходным правильным ключом; вопросы/ключи/lessonId#anchorId не менялись. **9/9 SHA256SUMS** пакета совпадают. В отчёте каждый changedField имеет PASS, нет заявленных issues/fixes. Это реальное подтверждение целостности и офлайн-предметной проверки дельты, а **не утверждение, что все 164 вопросов или живой сайт приняты**.

**Найдено одно упущение Gemini, исправлено отдельно в том же Draft:** для `l4-04` рекомендация прежде говорила измерить в Wireshark RTP Analysis «интервалы воспроизведения». По [официальному Wireshark User's Guide](https://www.wireshark.org/docs/wsug_html/) RTP Analysis измеряет **потери, jitter и межпакетные интервалы прихода Delta**, но не фактическое время вывода звука и настройки jitter buffer на конечном устройстве. На ветке Draft #282 изменена ровно эта фраза: явно `межпакетные интервалы прихода (Delta)` и проверка реального playout/PLC отдельно на приёмнике; добавлена регрессия против прежней неточности. **ТЕКУЩИЙ HEAD Draft PR #282 `4798a61fd6d0dbfa6b15fe0f4ffbe61637a72cad`**, последний точечный diff **ещё не проверен Gemini**. Предыдущие 14 PASS к новому SHA автоматически не переносить.

**Техпроверки текущего SHA:** [Actions #44659520312](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44659520312) **SUCCESS** — `npm run test:in-depth` по 164 вопросам, точные уроки plain/pro и все девять технических исправлений, `npm run test:in-depth-history`, `npm run lint`, `npm run build`, source PR #264 SHA до/после. Подробный [комментарий в PR #282](https://github.com/apotet/my-gemini-mirror-site/pull/282#issuecomment-7028262538). CI проверяет только заявленные тесты и сборку, не публикацию.

**ЧТО ОСТАЛОСЬ:** live browser lessonId#anchorId, практика `practiceLink:'dhcp'` у `l7-03`, реальная история сохранённых попыток, responsive 375/1440, fingerprint delta (без молчаливого rebaseline), GATE-01…10 staging и независимая приёмка всего уровня 164. [PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264) и [#282](https://github.com/apotet/my-gemini-mirror-site/pull/282) **оба DRAFT/BLOCK и НЕ MERGED**; staging deploy/production `apotet/netops` не трогать без явного разрешения владельца.

---
## CURRENT · Gemini Work batch 02: ГОТОВ НОВЫЙ текстовый архив 30/30, без отсутствующих фото (20.11.2026)

**Следующая пачка после независимо проверенного batch 01:** [GitHub Actions #44658612661](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44658612661) **SUCCESS**, одноразовый Draft [PR #287](https://github.com/apotet/my-gemini-mirror-site/pull/287) **CLOSED без merge**. Исходный Draft PR #264 SHA `1f273787370a64cf39732974b60c1706e538f5bb` проверен перед и после экспорта. **30 новых ID**, без пересечения с предыдущими 30: `l2-04,l2-12,l2-sec-05,l2-sec-08,l2-sec-13,l2-sec-18,stp-new-04,stp-new-09,ts-d02,ts-d03,ts-d05,ts-linux01,ts-pfc01,ts-x01,ts-x02,ts-x03,mon-snmp-01,mon-syslog-01,mon-syslog-05,mon-zabbix-01,review-dot1x-20,review-igmp-9,review-osi-34,review-ospf-27,review-poe-30,review-ptp-17,review-qos-22,review-slaac-4,review-syslog-25,wifi-roam-01`.

**Проверенный файл для приложения Gemini (режим «Работа»):** `NetOps-Gemini-Work-Batch02-Text-30-Questions-20261120.zip` **154983 байт**; [GitHub Actions artifact #14594562248](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44658612661/artifacts/14594562248) и отдельная sandbox-ссылка в чате пользователя. **6×5 JSON packs, 30 автономных Markdown-карточек, реальные ключи и объяснения why/plain/pro и контекстные уроки plain/pro, lesson anchors, официальный стандарт, подробный промпт, manifest и SHA256SUMS**. Автоматически проверены: 30 уникальных ID, 6 точных пакетов, нет ошибки ZIP CRC, **42/42 SHA256SUMS**, **coverageIssues=[]**, совпадение 6 pack hash/ID/source SHA; manifest SHA256 `14e585118360973084356a6a067c96ac89cf03f2b30687644f2c38a3835eeffb`; GitHub artifact ZIP digest `a05b557a3f8f77eb1fbbb535e2fafa477fb9dc46a68ddb0ae453b04407596e99`. Все условия осмотрены на ссылки к недостающим изображениям/снимкам: **нет** фото-зависимых вопросов. Нет LLM API вызовов, секретов, перезаписей ключей или изменений сайта. GitHub artifact хранится 90 дней до **18.02.2027**.

**Отбракован промежуточный неподходящий архив:** [PR #286 / Actions #44658225571](https://github.com/apotet/my-gemini-mirror-site/pull/286) — CRC и JSON были валидны, но там оказалось 16 photo-dependent вопросов без приложенных изображений; **не применять/не отправлять** его для независимой предметной приёмки. Этот PR **CLOSED без merge**, архив заменён проверенным **Text**-ZIP выше. Это важная регрессия: недостающий визуальный источник запрещает PASS. Исходные 30 фото-зависимых задач остаются на будущую пачку только вместе с реальными изображениями.

**Инструкция владельцу:** загрузить только файл с `Batch02-Text` в Gemini «Работа» и сказать прочитать `01_TASK_FOR_GEMINI_WORK.md` и `LEARNING_CONTENT_STANDARD.md` для всех 30/30 по 6×5. Вернуть `verdicts.json`, `REPORT.md`, `FIX_PROPOSALS.md`; затем ChatGPT независимо проверит и подготовит FIX. Любые PASS из приложения только advisory. Промежуточные PR #283 и #264 остаются Draft/BLOCK до браузерных GATE; **не merge/deploy**; production `apotet/netops` не трогать.

---

## CURRENT · ГОТОВ архив независимого повторного аудита 14 изменённых ID для Gemini App Work (20.11.2026)

**Создан и действительно проверен файл** `NetOps-Gemini-Work-14-Delta-PR282-20261120.zip` — [GitHub Actions run #44657903702](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44657903702) **SUCCESS**, [прямой GitHub artifact #14593428866](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44657903702/artifacts/14593428866). ZIP 65 466 байт, CRC OK, 9/9 SHA256SUMS внутри OK. Manifest SHA256 `83621cb68c726de04f393f2ebd92938841c4923a4b42152def8a372df04540f1`. В архиве **6 дословных JSON packs: 3×OLD и 3×NEW**, manifest с **14 уникальными ID и 19 изменёнными полями**, `LEARNING_CONTENT_STANDARD.md`, `01_GEMINI_DELTA_TASK.md`. Новый source по прежнему **только proposed Draft PR #282**.

**Почему 14, а не 9:** девять вопросов требуют содержательной правки; ещё шесть мелких исправлений типографики, одно (`l4-lb-01`) пересекается с девятью → 14 уникальных ID. Старый source SHA PR #264 `1f273787370a64cf39732974b60c1706e538f5bb`; новый предложенный SHA PR #282 `8e3f62246b5d9caea3814d8b455931ccb9f5c477`. Экспортёр **проверил дословное сохранение всех условий, четырёх вариантов, правильных индексов, lessonId#anchorId и исходных coverageIssues**, а также присутствие изменений и обеих форм урока. Source SHA обоих PR проверены до и после сборки; **Gemini API calls=0**, никаких секретов.

**Передача владельцу:** ZIP скачан и размещён в текущем чате как `sandbox:/mnt/data/NetOps-Gemini-Work-14-Delta-PR282-20261120.zip` (не превращать путь в ссылку без проверки container). Прикрепить файл к Gemini в режиме «Работа» и дать команду прочитать `01_GEMINI_DELTA_TASK.md`, сверить OLD→NEW по всем 14 ID, вернуть `DELTA_VERDICTS.json`, `DELTA_REPORT.md`, `DELTA_FIXES.md`. Выполнить независимую оценку, не переписывать историю/merge/production. Временный [Draft PR #285](https://github.com/apotet/my-gemini-mirror-site/pull/285) **CLOSED без merge**. Архив хранится в GitHub Actions 90 дней.

**ЗАПРЕТ:** нельзя заявить, что PR #282 уже предметно независимо принят; browser gates, old attempts UI, practiceLink dhcp, fingerprint delta-review и полный уровень 164 остаются BLOCK. [Стационарный отчёт PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7027945640), тестовый [run #44656881792](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44656881792) — лишь структурная/регрессионная техническая проверка. Production `apotet/netops` НЕ ТРОНУТ.

---
## CURRENT · Gemini App Work: партия 01 / 30 вопросов, независимая сверка + реальные исправления (20.11.2026)

**Получен полный комплект файлов от Gemini:** `netops_audit_results.zip` (`verdicts.json`, `REPORT.md`, `FIX_PROPOSALS.md`) и отдельный `verdicts.json`. **Заявленные Gemini итоги: 25 PASS / 5 FIX / 0 REVIEW** по «Углублённому» из [исходного ZIP #14592876757](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44654454027/artifacts/14592876757), PR #264 **HEAD `1f273787370a64cf39732974b60c1706e538f5bb`**. ChatGPT проверил независимость соответствия отчёта исходному immutable ZIP: **30/30 ID, 120/120 дословных ответов и индексов корректности, 30/30 SHA, lesson ID+anchor/coverage, 8/8 точных original FIX snippets совпали (0 расхождений)**. **Пять FIX реальны** (`l3-d08`, `l4-x03`, `l7-05`, `l7-new-02`, `l7-new-03`); среди 25 PASS дополнительно 6 вопросов с мелкими опечатками: `l3-d04`, `l3-ospf-03`, `l3-vrrp02`, `l4-lb-01`, `l6-01`, `l7-01`. **PASS исходной модели — предметная рекомендация, не окончательное разрешение на merge.**

**Реальная работа в коде:** отдельный [Draft PR #283](https://github.com/apotet/my-gemini-mirror-site/pull/283), основан **строго** на PR #264 SHA `1f273787...`, база PR — `integrate/in-depth-164-codex-gemini-20261119`, HEAD исправлений `fa3c20cfe4918e40086a24cc0be3b97b57852618`. Исправлены все 5 FIX (ECMP/UDP адресные traps+practicalTips, EDNS/DNSSEC точные traps, русский профессиональный урок HTTP 404 vs 410) и 6 мелких опечаток. Тронуты только `src/data/inDepth/group2.ts`, `group3.ts`, `src/data/lessons/l7-http-status-basics.ts`, `scripts/in-depth-content.test.mjs`; исходные условия/ключи/уровни/исторические тесты не тронуты. Ровно 11 ID закрыто **на уровне кода и структурных проверок**, но ещё **не публикационной приёмки**.

**Независимый GitHub Actions [#44657748046](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44657748046) = SUCCESS** на exact fix SHA: тест 164 in-depth + 11 адресных регрессий, старые попытки, validate:questions, якоря уроков, TypeScript, explanation quality, полноценная `npm run build` (без deploy). Временный PR #284 CLOSED без merge. [Детальная запись в PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7028038756).

**Критический блок:** браузерный переход к точным якорям plain/pro, старые пользовательские сессии в реальном UI, десктоп/мобайл, полный GATE-01…10/публикационные browser smoke — всё ещё НЕВЫПОЛНЕННЫЕ и не подменяются успешно пройденным CI. PR #283, PR #264 **DRAFT/BLOCK**, НЕ мержить, НЕ выполнять staging deploy; production `apotet/netops` не трогать. Следующую новую партию Gemini Work готовить отдельным ZIP по фиксированному HEAD, со статусом независимой проверки до приёмки.

---

## CURRENT · Gemini App Work 30 × «Углублённый» — получен отчёт, независимая перепроверка и отдельный Draft PR #282 (20.11.2026)

**Источник:** самостоятельно переданный пользователем обратно из Gemini App Work ZIP `netops_audit_results.zip` с `verdicts.json` (30 записей), `REPORT.md` и `FIX_PROPOSALS.md`. Проверяемый учебный источник — staging [Draft PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264) **HEAD `1f273787370a64cf39732974b60c1706e538f5bb`** (на момент сверки PR по-прежнему DRAFT/BLOCK). Отправленный прежде [архив 30 вопросов](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44654454027/artifacts/14592876757) имел 6 JSON ×5, 30 карточек, оригинальные уроки plain/pro и 42 SHA256SUMS.

**Факты приёмки файлов ChatGPT:** 30 уникальных ID в точном порядке manifest; все 30 SHA указаны правильно; **120/120 вариантов и CORRECT/INCORRECT индексов совпали с исходными ответами/ключами**, 30 lessonId#anchorId/coverageIssues совпали с исходным снимком; 42/42 контрольные суммы архива и 6 pack hashes валидны; возвращённый ZIP исправен, его `verdicts.json` совпал с отдельно вложенным. **Все восемь старых значений полей пяти предложенных Gemini FIX действительно совпали с source snapshot**. Сверка полей не является автоматической приёмкой смысловой корректности по RFC и не проверяет живой браузер.

**Gemini App Work: 25 PASS / 5 FIX:** `l3-d08` (ECMP generic trap/tip), `l4-x03` (UDP generic trap/tip), `l7-05` (English-only профессиональный раздел 404/410), `l7-new-02` (EDNS generic trap и `size1232`), `l7-new-03` (DNSSEC generic trap). Дополнительно замечены шесть неблокирующих опечаток в PASS: `l3-d04`, `l3-ospf-03`, `l3-vrrp02`, `l4-lb-01`, `l6-01`, `l7-01`.

**Независимая поправка ChatGPT к отчёту:** Gemini пропустил ЧЕТЫРЕ шаблонных практических совета, которые тоже нарушают стандарт индивидуальной диагностики: `l4-03` (`ss -tulpn` для TCP byte stream), `l4-04` (общий L1→маршруты→DNS вместо RTP loss/jitter), `l4-d04` (`ss -tulpn` вместо DNS TC=1/TCP/53/AXFR), `l4-lb-01` (`ss -tulpn` вместо статусов backend Health Check). **Более строгий промежуточный итог на старом source SHA: 21 PASS / 9 FIX**, шесть опечаток дополнительно. Это не итоговый DONE для 30 и тем более не для 164.

**Изменения подготовлены ИЗОЛИРОВАННО, без merge:** [Draft PR #282](https://github.com/apotet/my-gemini-mirror-site/pull/282), base = ветка текущего PR #264, источник точно `1f273787...`, предложенный HEAD **`8e3f62246b5d9caea3814d8b455931ccb9f5c477`**. Изменены ТОЛЬКО 6 файлов: `group2.ts`, `group3.ts`, `specificPracticalTips.ts`, `l7-http-status-basics.ts`, `in-depth-content.test.mjs` и одноразовый GitHub Actions workflow. Адресные trap/tip для девяти ID, русский профессиональный раздел 404, шесть маленьких пробелов/типографика, тест исходных правильных ключей, точных lesson anchors и двух режимов. **Не переписаны вопросы и ответы и нет изменений других уровней/истории/production.**

**Технические проверки:** [GitHub Actions #44656881792](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44656881792) **SUCCESS**: 164-ID structural + question/key/lesson/plain/pro regression, сохранённые исторические попытки, `npm run lint`, `npm run build` (сборка, НЕ деплой), PR #264 SHA проверен до/после. Ранее первая попытка упала из-за ошибочного порядка слов в новом тестовом regex, затем исправлена **только регулярка** и повторный запуск прошёл. [Доказательства и замечания в PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7027945640).

**НЕ ЗАКРЫТО:** независимый delta-review 9 исправленных вопросов по новому SHA PR #282 (старые Gemini PASS нельзя переносить без повторной проверки); policy fingerprint diff без silent rebaseline, точная браузерная навигация уроков, `practiceLink:'dhcp'` для `l7-03`, history UI, браузерные 375/1440 и staging GATE-01…10; полная семантическая приёмка остальных вопросов уровня (всего 164) тоже открыта. PR #264 и #282 **DRAFT/BLOCK**, никакого merge или staging deploy. Production `apotet/netops` НЕ МЕНЯТЬ без явного разрешения владельца.

---
## CURRENT · ГОТОВ ZIP для Gemini App Work: 30 вопросов / шесть пакетов / проверенная целостность (20.11.2026)

**Выполнено по прямому пожеланию владельца:** собран и проверен автономный **NetOps-Gemini-Work-30-Questions-20261120.zip** с **30 вопросами «Углублённого»**, 6 JSON pack × 5, 30 индивидуальных Markdown-карточек со всеми четырьмя ответами и индексами правильных ключей, why/plain/pro, точными разделами уроков plain/pro и реальными lessonId#anchorId, исходным утверждённым учебным стандартом, задачей для приложения Gemini «Работа», индексом, manifest.json и 42 SHA256 контрольными суммами. **Исходный HEAD PR #264** `1f273787370a64cf39732974b60c1706e538f5bb`, проверен GitHub Actions ДО и ПОСЛЕ экспорта. Все 30 уникальных ID найдены; **6/6 по 5** source exports, **30/30** карт, **coverageIssues=[]**. Это структурная полнота исходного export, **не оценка технической истинности**.

**Реальные доказательства:** [Actions run #44654454027](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44654454027) **SUCCESS**; [скачать готовый ZIP с GitHub Actions, artifact #14592876757](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44654454027/artifacts/14592876757). ZIP **151621 bytes**, **43 файла**, содержимое 457336 bytes (не сжато), **manifest SHA256** `2bc9d2a7b0d7fac64b5076c76ff4fcef9b30c70b59dd3ffa4909b8d62aaf0ada`, artifact SHA256 из GitHub Actions log `475346411af18a541d7af768186d0b6cf1736155da1d26848b423de679b2b887`. Архив из GitHub connector также скачан прямо в этот чат как `/mnt/data/NetOps-Gemini-Work-30-Questions-20261120.zip`, файловая структура проверена Python zipfile (CRC=OK, 42/42 SHA256SUMS совпали, 6 pack hashes и ID/SHA совпали). Github artifact retention 90 дней (до **18.02.2027**), однако файл данного чата доступен по sandbox-ссылке. Одноразовый [Draft PR #281](https://github.com/apotet/my-gemini-mirror-site/pull/281) **CLOSED БЕЗ MERGE**, исходные ветки не изменялись; **Gemini API вызовов и квот = 0** для этой операции.

**Передача в Gemini:** пользователь вручную прикладывает ZIP к **Gemini в режиме «Работа»** и даёт команду «Внутри архива открой `01_TASK_FOR_GEMINI_WORK.md`, `LEARNING_CONTENT_STANDARD.md` и `manifest.json`, выполни 30 независимых рецензий (внутренне 6×5), верни `verdicts.json`, `REPORT.md` и `FIX_PROPOSALS.md`, не изменяй репозиторий». После возвращения результата **ChatGPT независимо проверяет** 30 индивидуальных PASS/FIX/REVIEW и только после инженерной приёмки, CI/browser/GATE и явного разрешения возможен staging merge. Запрещён фиктивный PASS по автоматически выданному Lite или вере в работоспособность браузера. Production `apotet/netops` не трогать.

**Важно:** предыдущая запись ниже говорит «архив ещё не создан» — это историческое состояние ДО текущего выполнения; **заменено этой записью ГОТОВ**.

---

## CURRENT · Передача большой независимой проверки в Gemini App / «Работа»: офлайн-архив 30 вопросов (20.11.2026)

**Решение владельца:** вместо недоступного Google Gemini API через GitHub Actions попробовать **обычное приложение Gemini, режим «Работа»**, передав собственноручно архив. Подготовить **30 настоящих вопросов из «Углублённого» (Understanding)** на source **PR #264 HEAD `1f273787370a64cf39732974b60c1706e538f5bb`**, 6 внутренних подгрупп по 5 — без необходимости шести отдельных вводов/ответов в чате. Выбранные ещё не получившие новый независимый Gemini API-аудит по актуальному SHA вопросы: `l3-16`, `l3-bgp-06`, `l3-d04`, `l3-d07`, `l3-d08`, `l3-ospf-03`, `l3-vrrp02`, `l3-vrrp04`, `l4-03`, `l4-04`, `l4-d04`, `l4-d06`, `l4-lb-01`, `l4-new-07`, `l4-x03`, `l4-x04`, `l5-02`, `l57-d02`, `l57-d04`, `l57-x04`, `l57-x05`, `l57-x06`, `l57-x19`, `l6-01`, `l7-01`, `l7-02`, `l7-03`, `l7-05`, `l7-new-02`, `l7-new-03`. Темы L3/BGP/OSPF/VRRP, L4/TCP/QoS, L5–L7; без фото, требующих вложенных изображений.

**Содержимое Handoff ZIP:** точные JSON снимки из trusted `scripts/gemini-audit-pack.mjs` на target SHA — условие, все 4 варианта, правильный ключ, индивидуальные why/plain/pro, ловушка, практический совет, связанный урок, `lessonId#anchorId`, реальные plain/pro секции и coverageIssues; 30 отдельных читаемых файлов, six JSON packs, manifest c SHA256, копия стандарта `docs/LEARNING_CONTENT_STANDARD.md`, инструкция для Gemini Work, шаблон результатов/критерии. Ничего не заменять догадками, не заявлять об успешном browser click по офлайн-снимку. Передаём только материалы, без исходных API secret, рабочего профиля, текущих личных данных и git credential.

**Для Gemini «Работа»:** по 5 внутренних вопросов самостоятельно, но **одним заданием 30/30**; инженерная проверка каждого ключа/всех трёх неверных вариантов, обоих индивидуальных стилей и обоих разделов урока, точных якорей и исключений; PASS/FIX/REVIEW по каждому с цитируемыми фактическими полями исходного снимка, конкретный набор правок предложением, сводный JSON+Markdown. Проверять именно заданный SHA, не создавать PR/не менять файлы GitHub/не публиковать сайт без отдельного решения. Выполненную работу Gemini после возврата файла **независимо проверить ChatGPT** и только затем готовить отдельные изменения.

**Состояние:** пока архив не создан и не проверен GitHub Actions — НЕ помечать как готовый. Создавать/выгружать из отдельного одноразового Draft PR в staging, закрыть без merge; весь PR #264 остаётся DRAFT/BLOCK и production `apotet/netops` не трогать. Ссылку на фактически созданный bundle, workflow run, sha256 и способ скачать добавить после проверки.

---

## CURRENT · Gemini 3.5 Flash Lite: предметная проба ×4 с успешным API, но слишком кратким аудитом (20.11.2026)

**РЕАЛЬНЫЙ ЗАПУСК**: [GitHub Actions #44652640818](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44652640818) **SUCCESS**, [одноразовый Draft PR #280](https://github.com/apotet/my-gemini-mirror-site/pull/280) **CLOSED без merge**. Отправлен ровно **один** API-запрос `gemini-3.5-flash-lite` (ранее PONG работал, сейчас проверена реальная предметная генерация) по зафиксированному HEAD учебного PR #264 `1f273787370a64cf39732974b60c1706e538f5bb`. Состав `k-05,l12-copp01,l12-storm01,l12-x02`: реальные условия, 4 ответа, ключ, индивидуальные brief/plain/pro, точные якоря уроков и обе contextual plain/pro секции. Доверенные скрипты `main`, разрешение Lite только **runner-local**; timeout 420s, output cap 16384, 0 retry. Все пакеты и 4-строчный JSON проверены, source SHA до/после без дрейфа. **Реальные Google API usage**: вход **4637**, выход **748**, всего **5385** токенов. **Результат самой модели 4/4 PASS**, [полный исходный отчёт](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7027350572).

**НЕ ПУТАТЬ АВТОМАТИЧЕСКИЙ PASS МОДЕЛИ С ГЛУБОКОЙ ПРИЁМКОЙ.** ChatGPT отдельно прочитал оригинальные вопросы/варианты/ключи и связанные тематические уроки: `k-05` ключ [1] — Link TCP/IP в 4-уровневой модели охватывает L2/L1; `l12-copp01` ключ [0] — проверка CoPP при ограничении access к control plane и работающем транзите; `l12-storm01` [0] — storm-control подозрение без CRC при добавлении оборудования, не доказательство причины; `l12-x02` [0] — RSTP Alternate/Discarding, BPDU участвуют, MAC/пользовательские кадры не передаются. Ошибочного ключа в четырёх не найдено. **Но исходный ответ Lite слишком поверхностный**: всего 748 выходных токенов на 4 технических случая; сгруппировал три неверных варианта в общие объяснения без полноценного разбора каждого, лишь кратко пересказал plain/pro, поставил `limitations=None` без настоящей browser-проверки. Поэтому **Lite = API успешен, 4 advisory PASS, предметная глубина НЕ подтверждена / нужен строгий review**. [Подробный независимый разбор / ограничения](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7027390135). Автоматически распространять Lite PASS на 164 вопросов и менять основного аудитора нельзя. Квалификационный следующий этап — ужесточить проверку по каждому дистрактору и реальным урокам, а не принимать короткий AI PASS как готовый результат; **пока никаких новых API calls без решения владельца**.

**Безопасность:** основной PR #264 **DRAFT/BLOCK**, ни merge, ни staging deploy, ни fingerprint rebaseline; production `apotet/netops` не менялся. Все лимиты Lite зафиксированы в предыдущем CURRENT: 15 RPM/250K input TPM/500 RPD, 28-day peaks не равны сегодняшнему остатку.

---

## CURRENT · Пробная предметная проверка Gemini 3.5 Flash Lite, 20.11.2026

**Команда владельца:** «Давай проверим Лайт» после фактических 503 у Hydrogen и 3.8 на больших учебных запросах. **Временный исследовательский тест, не автоматическое назначение Lite главным независимым аудитором NetOps.** Контрольный запрос `PONG` у `gemini-3.5-flash-lite` ранее сработал (HTTP 200, 8 токенов; Actions #44650479901), но не подтверждал инженерную квалификацию.

**Эксперимент:** один `generateContent` API-вызов модели `gemini-3.5-flash-lite` через существующий GitHub Actions secret, реальный материал из PR #264 на зафиксированном HEAD `1f273787370a64cf39732974b60c1706e538f5bb`, **4 сложных/разнотипных вопроса** `k-05,l12-copp01,l12-storm01,l12-x02`. Для каждого обязательны точный ключ и объяснение неверных вариантов, индивидуальное объяснение, точный якорь урока и обе формы plain/pro. Использовать доверенные инструменты `main`; runner-only разрешить Lite в allowlist, **не менять постоянную политику для Hydrogen/3.8**. Ограничить одним вызовом без retry/cron, 420s timeout, maxOutputTokens 16384, проверять 4 записи, правильность SHA до/после и полноту JSON; 429/503/timeout/truncation = INCONCLUSIVE. Только исходный JSON-отчёт и независимая инженерная сверка позволяют оценивать модель; даже полученные Lite PASS **не равны финальному DONE**.

**Лимиты Lite по собственным скринам Google AI Studio:** **15 RPM, 250K входных TPM, 500 RPD**; 28-дневные пики (1/15, 3.57K/250K, 2/500) **не равны текущим остаткам**. Временный Draft PR-триггер закрыть **без merge**; по результату дописать ссылку на GitHub Actions и статусы в ROADMAP и PR #264. Любой мердж, staging deploy, fingerprint baseline, production `apotet/netops` **запрещены** без отдельной команды владельца.

---

## CURRENT · Временный Gemini 3.8 Flash: первый полноценный аудит ×10 не удался, Google 503 (20.11.2026)

**Запуск по явному решению владельца «Давай использовать 3.8»:** временный Draft [PR #279](https://github.com/apotet/my-gemini-mirror-site/pull/279) **CLOSED без merge**, [GitHub Actions #44651253640](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44651253640), `GEMINI_MODEL=gemini-3.8-flash` через существующий secret GitHub Actions. Зафиксированный HEAD учебного Draft PR #264 `1f273787370a64cf39732974b60c1706e538f5bb`. Десятка новых ID: `k-05,k-06,k-07,l1-02,l1-04,l12-copp01,l12-d05,l12-ds04,l12-storm01,l12-x02`. Подготовка исходного checkout, **всех 10 пакетов**, точных lesson/plain/pro, token/timeout patch (runner-only 420s/16384), SHA-check **SUCCESS**. Единственный запрос `generateContent` **спустя около 98 с вернул HTTP 503 UNAVAILABLE / high demand**. **0 Gemini 3.8 PASS/FIX/REVIEW, валидного JSON и usageMetadata нет**; расход backend Google неизвестен. В этом запуске **не** было ответа `HTTP 429`, но проектные лимиты 3.8 (5 RPM, 250K input TPM, 20 RPD) и 28-дневные пики `5/5, 144.21K/250K, 19/20` не позволяют вычислить остаток на сегодня.

**Режим STOP, не делать повторно самовольно:** альтернативный 3.8 так же не сумел обслужить именно **полный 10-ID запрос**, как ранее Hydrogen; нельзя без отдельного теста считать маленький `PONG` на 3.8 недоступным, а всю Google-инфраструктуру полностью неисправной. Контроль `gemini-3.5-flash-lite` ранее отвечал на `PONG`, но его качество по инженерным 10-ID аудитам **не проверено** и владелец разрешил именно **3.8**, а не Lite. Не подменять без отдельного решения. Следующая допустимая работа без API: ChatGPT source-review по 10 материалам с честной пометкой, **не** Gemini PASS. Подробные логи/предметная граница: [комментарий PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7027215893). PR #264 остаётся **DRAFT/BLOCK**, никакого merge/deploy/rebaseline, production `apotet/netops` не трогать.

---

## CURRENT · Решение владельца: временно Gemini 3.8 Flash вместо Hydrogen для независимой приёмки (20.11.2026)

**Явная команда пользователя 20.11.2026:** «Давай использовать 3.8». На время фактической недоступности `gemini-4-hydrogen` **разрешён** `gemini-3.8-flash` как отдельный независимый API-аудитор материала `Углублённый (Understanding)` для staging PR #264. **Это не перенос старых Hydrogen PASS и не утверждение, что модель эквивалентна Hydrogen**; каждый отчёт должен содержать действительное имя модели, snapshot SHA, 10 ID и status PASS/FIX/REVIEW, а затем инженерную проверку. Hydrogen можно вернуть после подтверждённой доступности, не менять модели бесконтрольно.

**Реальные ограничения 3.8 Flash по Google AI Studio скринам от 20.11:** **5 RPM, 250,000 input TPM, 20 RPD**; отображённые `5/5 RPM`, `144.21K/250K TPM`, `19/20 RPD` являются *максимальными наблюдениями за 28 дней*, а **НЕ числом использованных запросов именно сегодня**. Красное предупреждение по этой модели означает, что в части истории возникало достижение/превышение rate-limit; **текущее доступное количество запросов не известно**. Никакого обхода лимитов, смены ключей, платёжных действий или бесконтрольных повторов. При 429/503/timeout = INCONCLUSIVE и STOP.

**Первый контролируемый тест полноценного аудита 3.8:** один API-вызов на 10 вопросов из ранее подготовленной **четвёртой десятки** `k-05,k-06,k-07,l1-02,l1-04,l12-copp01,l12-d05,l12-ds04,l12-storm01,l12-x02` при проверенном PR #264 SHA `1f273787370a64cf39732974b60c1706e538f5bb`. Тот же доверенный script/prompt, обе формы объяснений, без ретраев, runner-local timeout 420 секунд и output cap 16384, result posting только по valid JSON/10 rows с неизменным HEAD. Временный Draft PR trigger без merge; ни staging deploy, ни production `apotet/netops`. Сначала фиксируем эту политику, потом запускаем тест; реальный результат обновить здесь отдельной верхней записью и в PR #264.

---

## CURRENT · Диагноз Hydrogen API подтверждён: GET metadata 200, Flash Lite POST 200, Hydrogen POST 503 (20.11.2026)

**ЧТО РЕАЛЬНО ПРОВЕРЕНО (тот же `GEMINI_API_KEY`, GitHub Actions, домен `generativelanguage.googleapis.com`, `v1beta`):** [GET-only диагностический run #44650282029](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44650282029): `GET /models/gemini-4-hydrogen` **200 / 285 ms**, модель существует и `generateContent=true`, входной контекст **1,048,576** токенов, максимальный вывод **65,536**; `GET /models/gemini-3.8-flash` 200 / 71 ms; `GET /models?pageSize=1000` 200 / 68 ms, каталог 66 моделей, Hydrogen, 3.8 Flash и 3.5 Flash Lite перечислены как поддерживающие генерацию. Ни одного вызова генерации в этом run.

**Контрольный единственный вызов:** [Flash Lite Actions #44650479901](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44650479901): `POST gemini-3.5-flash-lite:generateContent` с запросом `PONG`, max output 128, **200 за 3508 мс, ответ PONG, STOP, расход 6 входных + 2 выходных = 8 токенов**, 0 retry. Значит **API-ключ, DNS/HTTPS, GitHub secret и сам метод генерации работают** на другой модели.

**Проблема именно во время обработки Hydrogen:** предыдущая проверка минимального `PONG` на `gemini-4-hydrogen`, [run #44649909454](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44649909454), дала **503 UNAVAILABLE / high demand за 1821 мс**. Реальный 10-ID пакет тоже дал 503 ([run #44649063943](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44649063943)). Следовательно, **неверный ID модели, отсутствие доступа к metadata или размер учебного пакета — не основная причина**. Объяснение Google: [официальный пост о 429/503](https://discuss.ai.google.dev/t/handling-429-503-errors-from-the-gemini-api/124640): 503 означает перегрузку backend, отличается от 429 (quota). [Публичное сообщение 19.11.2026 о 503 нескольких моделей, включая Hydrogen](https://discuss.ai.google.dev/t/severe-latency-infinite-thinking-state-and-503-service-unavailable-errors-across-multiple-models-on-google-ai-studio/202730). Это **не подтверждает глобальный outage** и не даёт ETA восстановления.

**Что сделано и ограничения:** пробные одноразовые [Draft PR #277](https://github.com/apotet/my-gemini-mirror-site/pull/277) и [#278](https://github.com/apotet/my-gemini-mirror-site/pull/278) закрыты без merge, изменения учебного контента/production не производились. Подробный протокол на основном [PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7027085141). **Повторно не дергать Hydrogen по расписанию, не менять Gemini-модель аудитора молча, не покупать тариф, не сбрасывать смысловые fingerprint.** Пока Hydrogen возвращает 503, честный статус = INCONCLUSIVE, никакой DONE. Если владелец одобрит временную альтернативу, запускать её отдельно с маркировкой модели и независимым инженерным контролем; Flash Lite проверен только на `PONG`, не на инженерной глубине.

---

## CURRENT · Hydrogen: независимый минимальный smoke-test, 20.11.2026 — HTTP 503 даже на PONG

**По прямой команде владельца** проведён отдельный **один** минимальный POST к `gemini-4-hydrogen:generateContent` через уже авторизованный GitHub Actions `GEMINI_API_KEY`. Никаких вопросов NetOps не передавали; prompt только `Return exactly the single word PONG. Do not explain.`, `maxOutputTokens=256`, `temperature=0`, timeout 75 секунд, **без повторов**. [Actions run #44649909454](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44649909454) завершился FAIL: через **1821 мс** получен `HTTP 503 UNAVAILABLE`, точное сообщение Google `This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.`. **Нет ответа модели, нет usageMetadata; сколько внутренней квоты потрачено, неизвестно.** Временный [Draft PR #276](https://github.com/apotet/my-gemini-mirror-site/pull/276) **CLOSED без merge**; staging PR #264 **DRAFT/BLOCK**, production не тронут.

**Технический вывод:** гипотеза о слишком большом размере 10-вопросного запроса как единственной причине этих сбоев **опровергнута**: даже минимальный запрос получил 503. Это свидетельствует о недоступности `gemini-4-hydrogen` **для данного запроса/проекта в момент проверки**, но **не доказывает глобальный outage** или исчерпание суточного лимита. Не делать автоматические повторы, не подменять модель и не называть четвёртую десятку проверенной. Лимиты от Google AI Studio и политика одноразового аудита — ниже в ROADMAP и [runbook](docs/runbooks/GEMINI_API_AUDIT.md).

---

## CURRENT · Gemini партия 4 ×10 — API 503 после одного контролируемого вызова (20.11.2026)

**Попытка после записи подтверждённых Google AI Studio лимитов в ROADMAP:** [GitHub Actions #44649063943](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44649063943), одноразовый [Draft PR #275](https://github.com/apotet/my-gemini-mirror-site/pull/275), **CLOSED без merge**. Frozen учебный HEAD PR #264 `1f273787370a64cf39732974b60c1706e538f5bb`. Десять новых ID `k-05,k-06,k-07,l1-02,l1-04,l12-copp01,l12-d05,l12-ds04,l12-storm01,l12-x02`. Все десять данных и две формы уроков были **успешно собраны**, HEAD, состав, количество проверены. **Ровно один** `gemini-4-hydrogen` API-запрос с timeout 420s/output cap 16384, **без retry** вернул **HTTP 503 (UNAVAILABLE): модель испытывает high demand**. **Gemini PASS/FIX/REVIEW для этой десятки = 0**; JSON-отчёта и usageMetadata нет, расход внутри Google неизвестен. Запуск не означает прохождение предметной проверки. [Точный протокол в PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7026860429).

**Решение:** не жечь RPD автоматическими/частыми повторами, не менять модель на другой тариф без решения владельца. Реальная ошибка 503 **не доказывает** достижение 5 RPM/250K TPM/20 RPD Hydrogen; эти значения и 28-дневные пики документированы ниже. Десятку оставить в очереди независимого Gemini-review для более позднего отдельного разрешённого запуска; при желании отдельно выполнять ChatGPT source review (не считать Gemini PASS). PR #264 **DRAFT/BLOCK**, ни staging merge/deploy, ни production изменений.

---

## CURRENT · Нормы API Gemini подтверждены Google AI Studio (скриншоты владельца, 20.11.2026) — обязательный регламент запуска

**Источник:** показания авторизованного Google AI Studio → Rate limits by model, переданные владельцем проекта 20.11.2026. Таблица сравнивает **ПИКОВОЕ** потребление с лимитами **за последние 28 дней** и НЕ показывает текущий остаток квоты (текущий RPD/RPM нельзя вычислить вычитанием). Порядок строк сверен по колонкам названий, RPM, TPM и RPD на последовательных скриншотах; эти числа относятся к видимому проекту Google AI Studio, не к лимитам GitHub/Codespaces/ChatGPT.

| Модель | Пиковый RPM / лимит | Пиковый входной TPM / лимит | Пиковый RPD / лимит | Статус в таблице |
| --- | --- | --- | --- | --- |
| `gemini-4-hydrogen` (наш независимый аудит) | **1 / 5** | **17.99K / 250K** | **6 / 20** | зелёная галочка; превышение на снимке НЕ показано |
| Gemini 3.8 Flash | 5 / 5 | 144.21K / 250K | 19 / 20 | красное предупреждение |
| Gemini 3.5 Flash Lite | 1 / 15 | 3.57K / 250K | 2 / 500 | зелёная галочка |

**Вывод, без ложной уверенности:** сообщение `You have reached a rate limit` относится к общему проекту, не означает, что `gemini-4-hydrogen` превысил свой лимит. На отдельных графиках Usage были и 429, и 503; общие графики сами по себе не привязывают каждую ошибку к Hydrogen. Наши две конкретные неудачные попытки третьей партии имели **503 high demand** и **HeadersTimeoutError**, а не полученный из этих запусков 429. У Hydrogen лимит не отмечен превышенным за показанный период, но это не гарантия доступности API сейчас.

**Политика следующего аудита (сохранить в каждом новом чате):**
1. Использовать только staging `apotet/my-gemini-mirror-site`, Draft PR #264 на его **фактическом текущем SHA** и доверенные `scripts/gemini-audit-pack.mjs` / `scripts/gemini-audit-review.mjs` из staging `main`; авторизация через уже существующий **GitHub Actions secret** `GEMINI_API_KEY` (секрет никогда не выводить). Не требовать ручной вход в Google или использования Browser Use, TinyFish, Codex, Work, Codespaces.
2. Ровно **10 ранее не подтверждённых независимым Gemini ID** в одном исходном snapshot; **один вызов** `gemini-4-hydrogen` на пакет, `RPM ≤ 5`, входной `TPM ≤ 250000`, `RPD ≤ 20` по опубликованным лимитам. Фактические текущие значения RPD неизвестны; не заявлять, что есть ещё 14 запросов. Для консервативной экономии не делать очередь из многих calls; проверять результат каждого вызова перед следующей партией, не обходить лимит заменой ключа.
3. Только **одноразовый workflow** `on: pull_request: [opened]` на новой временной ветке и Draft PR; никакой cron, retry, re-run, матричного распараллеливания или автоповтора в runner. Локальный timeout ≤420 секунд, output token cap ≤16384; API call ≤1. После результата закрыть временный Draft PR без merge. 503/429/timeout = **INCONCLUSIVE**, ноль Gemini PASS для этой попытки, автоматически не повторять, возможное потребление квоты не считать нулевым.
4. Результат считать только при валидном полном отчёте с тем же source SHA после выполнения; независимая инженерная проверка и полный браузер/CI gate до публикации отдельно. Нельзя переносить исторические PASS на изменённый SHA без delta-review, подменять Gemini своим PASS или перебивать content fingerprint baseline без приёмки.
5. После каждой попытки писать **реальные ID, SHA, URL GitHub Actions, расход API из ответа (если был), PASS/FIX/REVIEW или точную ошибку** в PR #264 и ROADMAP. PR #264 остаётся **DRAFT/BLOCK**, без merge, без staging deploy. Production `apotet/netops` без нового явного указания владельца не менять.

**Актуальное продолжение на эту дату:** после успешных первой и второй десяток (20 отдельных ID с результатом Gemini) третья десятка была только ChatGPT source-review (Gemini дважды без ответа); следующую четвёртую десятку выбирать из ещё не рассмотренных в этих трёх пакетах. Третью десятку не считать независимо подписанной Gemini и при необходимости вернуться к ней после восстановления модели.

---

## CURRENT · «Углублённый» — третья десятка, Gemini недоступен, собственная проверка и реальные исправления, 20.11.2026

**Проверяемая партия (10 НОВЫХ ID):** `gen-transport-1,gen-transport-14,gen-transport-16,gen-transport-17,gen-transport-5,gen-transport-7,k-01,k-02,k-03,k-04`. Gemini **не выдал результата**: [run 44637270612](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44637270612) — Google `HTTP 503 UNAVAILABLE` (перегрузка), [одна контролируемая попытка run 44637499856](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44637499856) — `HeadersTimeoutError` после ~5 минут. **Gemini PASS = 0, другие API вызовы не делали.** Временные Draft PR #273 и #274 **закрыты, не влиты**, production не трогали. Секрет GitHub Actions исправно использовался, сбой произошёл на стороне ответа Google, не при авторизации.

**ChatGPT собственная поисточниковая проверка**: прочитаны все десять условий, четыре варианта каждого, верные индексы; в `group1.ts` прочитаны **оба точных урока plain/pro** для всех десяти. Технических ошибок в десяти ответах/разделах не обнаружено, но **это не полный Gemini-аудит и не финальная browser приемка**. [Подробный поимённый технический отчёт в PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7025259027).

**Найдены и исправлены 31 реальных склейка/пробел/формат** в материалах именно этой десятки (`TCP/ 443`, `порту502`, `серверA`, `иWi-Fi`, `представленияL6`, `TLS1.3` и т.п.). Внесены только в `src/data/inDepth/group1.ts`; добавлены тесты точных ключей, якорей и обоих объяснений в `scripts/in-depth-content.test.mjs`. **Актуальный HEAD Draft PR #264 `1f273787370a64cf39732974b60c1706e538f5bb`.** Реальный CI [#44638702894](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44638702894): `test:in-depth` PASS, все **164/164** точных ссылки уроков, `test:in-depth-history` PASS, сохранены старые попытки; основной build всё ещё FAIL на **предметных review fingerprints** (137 изменённых, 4 новых) — не rebaseline без независимого review. Остальные браузерные шард-тесты выполняются отдельно, не приравнивать запуск к PASS.

**Для нового чата:** авторизация Gemini уже работает через GitHub Actions secret `GEMINI_API_KEY`; инструкция [docs/runbooks/GEMINI_API_AUDIT.md](docs/runbooks/GEMINI_API_AUDIT.md), публикационная карта — здесь. Если Gemini API недоступен, **не обещать его PASS и не делать бесконечные повторы**, можно независимо проверять и исправлять. Оставшиеся ID — по исходной 160-ID очереди, исключая уже проверенные старые 4 и первые три десятки; учитывать изменившийся SHA. Основной PR #264 остаётся **Draft/BLOCK**, не сливать/не выкладывать до регламента; production `apotet/netops` без отдельного разрешения запрещён.

---

## CURRENT · Gemini вторая партия ×10, предметная приёмка и исправление, 20.11.2026

**Подтверждено на настоящем GitHub Actions:** [run #44636056544](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44636056544) **SUCCESS**, [отчёт `gemini-4-hydrogen` в PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7024933965), SHA-источник **`1a3f684c7dbc6f6e1c8585b1f8c1155d3f84769d`**. Ровно **10 новых индивидуальных вопросов**, **9 PASS / 1 FIX**; input 11 512, output 4 058, total 21 550 API tokens. Новые ID: `gen-diag-2`, `gen-diag-5`, `gen-diag-6`, `gen-diag-7`, `gen-diag-9`, `gen-osi-a-18`, `gen-osi-a-19`, `gen-osi-a-2`, `gen-port-11`, `gen-port-14`. Один вызов API, без повторов, с проверкой frozen SHA и кардинальности отчёта. Одноразовый [Draft PR #272](https://github.com/apotet/my-gemini-mirror-site/pull/272) **закрыт без merge**. Независимое выполнение через секрет GitHub Actions `GEMINI_API_KEY`; инструкция [GEMINI_API_AUDIT.md](docs/runbooks/GEMINI_API_AUDIT.md).

**FIX `gen-diag-6`**: Gemini верно обнаружил чужой общий `practicalTip` («Сначала линк (L1/L2), затем маршруты и DNS.») при вопросе о дублирующемся IPv4 в одной подсети. Исходник проверен; в **Draft PR #264** добавлена индивидуальная диагностика ARP-ответов / Source MAC / статических адресов / DHCP-аренд / штатного виртуального IP, без изменения вопроса и ключа. Соседний `gen-diag-9` получил конкретную подсказку по ARP-таблице шлюза вместо размытого fallback.

**Дополнительный самостоятельный QA первоисточников той же пачки:** склеенные слова/числа в обоих режимах уроков `gen-diag-7` (DHCP/APIPA и IPv4-адреса), `gen-osi-a-2` (амплитуды) и `gen-port-14` (SNMP UDP/162). Все девять подтверждённых опечаток исправлены **в контекстных разделах**, без переписывания протокольного смысла. Добавлены регрессионные проверки темы подсказок и обоих режимов текста в `scripts/in-depth-content.test.mjs`. **Текущий после исправлений HEAD PR #264 `12dcc9223fc9cb0cb24c4ce539d011760330568a`.** Новый CI выполняется; исходные 9 Gemini PASS относятся к предыдущему SHA — на новом SHA нужна предметная delta-review, не подменять её чистым fingerprint.

**Блокирующие до публикации:** полный независимый current-SHA review всех 164; окончательные CI/Chromium mobile+desktop, старые попытки/GATE-01…10; staging smoke. PR #264 остаётся **Draft/BLOCK**; production `apotet/netops` **не трогали и не разрешено трогать**.

---

## CURRENT · Gemini 10 вопросов / авторизованный Actions-обход и исправления, 20.11.2026

**ЗАПУСК СОСТОЯЛСЯ БЕЗ РУЧНОГО ВХОДА:** [GitHub Actions run #44632284371](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44632284371), [read-only отчёт Gemini](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7024472642), `gemini-4-hydrogen`, один вызов на **ровно 10** отдельных ID, замороженный исходный SHA PR #264 `c7ca35f7c747f93f827089bc97464c4d965c6834`. **Результат: 8 PASS / 2 FIX** (не 10/10 PASS), входных токенов 11 187, выходных 3 142, всего в метрике API 20 189. Успешно подготовлены exact-source pack, обе секции plain/pro, отчёт с проверкой ключей и всех дистракторов; пользователь не запускал Actions вручную.

**Реальная схема авторизации, сохранить для следующих чатов:** не интерактивный логин Gemini! Используется существующий секрет `GEMINI_API_KEY` в GitHub Actions. Подключённый GitHub plugin может создавать ветки/PR, но не вызывает `workflow_dispatch`; браузер GitHub не был авторизован. Обход: отдельная точная ветка с одноразовым workflow `pull_request: opened`, затем открыть Draft PR на staging main. GitHub Actions сам запускает проверку из доверенных скриптов staging `main` для явно перечисленных десяти ID и зафиксированного HEAD #264. В этом запуске копии доверенного ревьюера **только внутри runner** увеличены ожидание ответа 160→420 секунд и предел вывода 8192→16384 токенов; исходный постоянный ревьюер не переписан. API **без повторов, без cron и без автоматического merge**, вывод только advisory comment после exact-SHA проверки. Одноразовый [PR #271](https://github.com/apotet/my-gemini-mirror-site/pull/271) **закрыт без слияния**. [Постоянная инструкция](docs/runbooks/GEMINI_API_AUDIT.md).

**Валидные новые замечания:** `gap-pack2-21` — внутренний ID в professional секции + слипшееся `window0` и неточная практическая подсказка `ss listener`; `gap-pack3-08` — `checksum0` в обоих заголовках и `поля0` в pro. Исправления проверены по реальному исходному коду, внесены **только в Draft PR #264**: `src/data/inDepth/group1.ts`, `group4.ts` и тесты `scripts/in-depth-content.test.mjs`. Актуальный после исправлений HEAD **`1a3f684c7dbc6f6e1c8585b1f8c1155d3f84769d`**. Условия, варианты и ключи не менялись. CI нового HEAD запущен, итог проверяется отдельно. **Gemini PASS на старом SHA не приравнивать к финальному PASS нового SHA без предметной delta-review.**

**Не DONE:** 164-ID независимая итоговая приёмка, неизменённый fingerprint на финальном SHA, полная браузерная приёмка 375/1440, GATE-01…10, staging публикация учебного уровня. Основной PR #264 остаётся **Draft/BLOCK**, production `apotet/netops` без отдельного разрешения **не трогать**.

---

## CURRENT · NetOps / «Углублённый» — распределение ответственности и реальные блокеры, 19.11.2026

**Главный активный учебный PR:** [#264](https://github.com/apotet/my-gemini-mirror-site/pull/264), snapshot `5df2a0b46116323201a6ae933a4c650e78b105db`, статус **Draft / BLOCK**. По состоянию на проверку из GitHub Actions: `In-depth Understanding Chromium` shards 0–3 **PASS**, основной CI **FAIL** на `Compare 160 independent semantic-review fingerprints to current material`, `Merge readiness checklist` **FAIL** на `Validate content checklist only for learning-content PRs`. Отчёт Gemini `gemini-4-hydrogen` даёт **4/4 предметных PASS** на точных вопросах и SHA; ещё **160** вопросов требуют предметной приёмки. Модель сама не проверяла живой интерфейс.

**Ответственность и этапы:**
1. **ChatGPT / инженерная подготовка:** инвентаризация всех 164 ID по ключам, урокам, якорям, двум слоям, ссылкам и регрессионным требованиям. По `gap-pack2-05` [подтверждён дефект точной секции](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7006899500); не считать его PASS. Для проверки следующих вопросов сначала использовать замороженный SHA; структурные изменения готовить отдельно, чтобы сохранить доказательность текущих снимков.
2. **Gemini / тяжёлая независимая семантика:** `auto:1…40`, по 4 вопроса, сверка RFC/протоколов, всех дистракторов, условий задачи, конкретных plain/pro и ссылок. Только read-only advisory в PR; ни правок, ни merge, ни deploy. Вызовы API ограничены `max_batches<=2` на один **ручной** запуск; при FIX/REVIEW второй вызов прекращается. Нет cron и автоматического расходования квоты.
3. **ChatGPT / вторичная приёмка и исправления:** независимо воспроизводить замечания на точном исходном SHA, делать доказанные FIX и регрессионные тесты. Если исходный SHA меняется, старые модельные PASS не переносятся автоматически.
4. **ChatGPT / публикационные барьеры:** подтвердить semantic-fingerprint актуального кода (без фиктивного rebaseline), GATE-01…10, чеклист, четыре состояния урока/профессионального слоя, старые попытки и tr-03/tr-10, браузерные переходы по точным разделам, адаптивность мобильного/десктопа. Только после этого merge в staging и проверка уже опубликованной версии.
5. **Владелец / production:** перенос в `apotet/netops` исключительно после отдельной явной команды.

**Не DONE:** PR #264, вся 164-ID приёмка, исторические сценарии, staging публикация учебного уровня. **DONE:** инфраструктура read-only Gemini и ручной ограниченный двухпартийный запуск (PR #265–268).

---

## P0 · Gemini: последовательная приёмка максимум двух партий по четыре вопроса — 19.11.2026

В [Draft PR #268](https://github.com/apotet/my-gemini-mirror-site/pull/268) внедрён **дополнительный выбор** `max_batches=1/2` в ручном GitHub Actions запуске (по умолчанию **1**), без фонового расписания. `dry_run=true` по умолчанию остаётся. Если пользователь вручную задаёт `max_batches=2` и `ids=auto:N` (N=1…39), первый вызов Gemini отправляет отчёт в PR; **второй API-вызов по `auto:N+1` возможен только после 4/4 PASS с корректным SHA, индивидуальными доказательствами, без FIX/REVIEW/замечаний**. Любой спорный результат, ошибка запроса, изменение SHA или неправильные ID останавливают цепочку. При запуске с обычным списком ID или `auto:40` двухпартийный режим блокируется до API. Всего максимум два запроса, без повторов и без auto-merge. Автономный тест: `scripts/gemini-batch-control.test.mjs`; отчёт остаётся advisory; Gemini не меняет код. **Ожидает полную CI/merge-проверку; production без изменений.**

---

## DONE · Прямая независимая проверка NetOps через Gemini API и GitHub Actions — 19.11.2026

**Достижение: рабочая цепочка без компьютера, ручных загрузок в Google Диск и копирования исходников.** В staging-репозитории `apotet/my-gemini-mirror-site` установлена интеграция GitHub Actions → разрешённый секрет `GEMINI_API_KEY` → Gemini API → read-only отчёт-комментарий в целевой PR. [Инфраструктура PR #265](https://github.com/apotet/my-gemini-mirror-site/pull/265), [исправление API модели PR #266](https://github.com/apotet/my-gemini-mirror-site/pull/266), [очередь PR #267](https://github.com/apotet/my-gemini-mirror-site/pull/267) — **все три смержены в staging main**.

- **Первый настоящий успешный аудит:** `gemini-4-hydrogen`, входные 4 вопроса из PR #264 на зафиксированном SHA `5df2a0b46116323201a6ae933a4c650e78b105db`; **4 предметных PASS из 4**, правильные ключи и `lessonId#anchorId`, индивидуальные объяснения и обе секции уроков; [полный отчёт Gemini](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7006606671). В отчёте учтены ограничения: проверка по собранным исходным материалам, **не** подтверждение UI-переходов или полного независимого приёмочного регламента.
- **Реальная работа API подтверждена:** 4 792 входных и 1 523 выходных токена, API вернул `totalTokenCount=8950` с учётом собственной метрики Google. Точные условия бесплатной квоты зависят от проекта; отдельная платёжная подписка на Gemini в приложении не требуется для чтения отчёта.
- **Удобство на iPhone:** workflow вызывается вручную в GitHub Actions, не требует настольного интерфейса Gemini. `ids=auto:1…auto:40` распределяет **оставшиеся 160 вопросов на 40 четвёрок**, при этом старая ручная передача ID сохраняется; режим привязан к зафиксированному SHA, при изменении материала останавливается вместо принятия старого PASS.
- **Защитные границы:** Gemini не изменяет файлы, не делает merge и deploy; за исправления, проверку CI и **staging merge отвечает ChatGPT**. По умолчанию `dry_run=true`, новых платных вызовов нет без явного запуска; пользовательский ключ хранится в GitHub Secret, значение в ROADMAP не записывать. Production `apotet/netops` не трогать.
- **Оставшиеся задачи:** PR #264 остаётся **Draft/BLOCK**. Новый запуск по `auto:1` обнаружил `gap-pack2-05` без точного якоря урока — [доказательство](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7006899500). Это FIX, а не PASS. Нужно независимо проверить остальные материалы, исправить подтверждённые дефекты, закрыть семантические fingerprint, GATE-01…10, браузер и исторические попытки до merge. Последовательный ограниченный автозапуск нескольких партий **ещё не внедрён**; существующая очередь выбирается вручную.

---

## P0 · Gemini semantic review — очередь 160 непроверенных материалов, 19.11.2026

После подтверждённого ручного запуска `gemini-4-hydrogen` (4/4 предметных PASS, snapshot `5df2a0b46116323201a6ae933a4c650e78b105db`, [комментарий в PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7006606671)) в [смёрженном PR #267](https://github.com/apotet/my-gemini-mirror-site/pull/267) внедрено упрощение: `ids=auto:1`…`auto:40` — ровно **160** ещё не рецензированных ID, группы по четыре, без дубликатов и без ручного ввода длинных списков. В `scripts/gemini-audit-pack.mjs` автоочередь жёстко прикреплена к текущему head PR #264, к 164-ID пулу и к четырём известным уже проверенным ID. Изменение HEAD прерывает автоочередь до независимой переоценки. Ручные ID сохранены.

**Gemini только рецензирует** (предметная проверка ключей, вариантов, plain/pro, точной секции урока). Авторский контроль и merge остаются за ChatGPT после GATE-01…10, CI, исторических попыток, реальной навигации и семантической приёмки актуального материала. Ни один PASS Gemini не становится разрешением на merge автоматически. По умолчанию dry-run: true; **API без ручного разрешения не вызывается**, максимум один `generateContent` на запуск, без повторов. Дополнительных ключей или платежей не нужно. Только staging, production не трогать.

---

## P0 · Gemini GitHub Actions auditor: fix API model 404 — 19.11.2026

Первый ручной запуск после успешного dry-run: `Gemini read-only NetOps reviewer 4` → этап `One bounded Gemini API call` вернул **HTTP 404**, поэтому **модель не проверяла вопросы и отчёт не публиковался**. Старый workflow запрашивал `gemini-2.5-flash`, доступ к которой Google ограничил для новых API-проектов. Google официально выпустил `gemini-4-hydrogen` 12.11.2026; она поддерживает GenerateContent и бесплатный тариф. Исправление в отдельном PR `fix/gemini-hydrogen-api-model-20261119`: новое значение по умолчанию `gemini-4-hydrogen`, резервный **ручной** вариант `gemini-3.8-flash`, диагностический код/сообщение API c маскированием ключа, автономные мок-тесты 404, отсутствующего секрета и отказа в неверном якоре. Не запускать платных автоматических повторов, не делать auto-merge; Gemini — только рецензент, ChatGPT принимает решение о staging merge после CI. PR #264 этим исправлением не разблокируется автоматически.

---

## P0 · Кабельное S/FTP ошибочно всплывает как File Transfer Protocol — FIX IN REVIEW (19.11.2026)

**Источник:** воспроизведённый пользователем экран «Основы (Fundamentals)» с вопросом об экране витой пары и правильным F/UTP: по наведению на `S/FTP` интерфейс выдавал глоссарий `FTP — File Transfer Protocol`, хотя речь о кабельном экранировании.

**Root cause:** в `src/data/glossary.ts` отдельный учебный словарь `GLOSSARY` уже имел правильные определения `U/UTP`, `F/UTP`, `U/FTP`, `S/FTP`, но интерактивный `TOOLTIP_NAMES` не содержал этих четырёх обозначений. `src/utils/glossaryText.ts` считал `/` границей слова и находил вложенное `FTP` после `/`.

**Изолированный фикс:** добавить четыре точные кабельные расшифровки во всплывающий словарь (длинное совпадение имеет приоритет), а для неизвестных конструкций вида `X/FTP` не выдавать подсказку файлового протокола на вложенном суффиксе `FTP`. Остальные сокращения с косой чертой, включая Wi‑Fi, сохраняют прежнее поведение. При этом сохранить самостоятельные подсказки `FTP` (File Transfer Protocol), `SFTP` (SSH File Transfer Protocol), `TFTP` и общие техсокращения. Объяснение и правильный вариант вопроса F/UTP не менять.

**Обязательная приёмка:** строгий `splitGlossaryText()` для всех четырёх кабельных обозначений, плюс обычные FTP/SFTP/TFTP и отсутствие ложной подсказки у неизвестного `X/FTP`; реальный SSR/DOM из `FormattedExplanation` и `GlossaryText` в обоих слоях; `advanced-glossary.test.mjs` и `applied-l3-glossary-dom.test.mjs`, CI build/logic/learning bank; пользовательские фото/история попыток не затронуты. Merge только после независимой проверки и всех обязательных CI gates в staging; production не трогать. После успешного деплоя обновить статус здесь с SHA и реальным Pages smoke.

---
## P0 · Фото в тестировании: вписывание в экран, 50–600%, панорамирование (19.11.2026)

**Статус: FIX / независимая и браузерная приёмка обязательна.** Жалоба владельца на реальном вопросе `l1v2-a-poe-limit`: большой вертикальный снимок PoE при «100%» обрезан по высоте; нельзя перетаскивать вверх-вниз или уменьшить до 75/50%. Это **общая ошибка** в `src/components/ZoomableImage.tsx`, который используется всеми фото-вопросами в `ExamView`, а не ошибка одного файла.

**Решение в отдельной ветке:** `fix/photo-viewer-fit-pan-zoom-20261119`. При открытии фото пропорционально вписывается по обеим осям (100% = целиком), масштаб ограничен 50–600%, явные кнопки 50% / 75% / 100%, +/- и колесо мыши / щипок телефона, перетаскивание увеличенного изображения по X/Y с ограничением края; 100% возвращает полный кадр. Полноэкранный выход, клавиши Esc, двойной клик и сохранение сессии остаются прежними.

**Acceptance:** для **портретных и альбомных** фотографий по одному и тому же компоненту: 375px iPhone и 1440px desktop, первоначальное полное вписывание и отсутствие обрезки при 50/75/100%, масштаб колесом и щипком, перемещение по двум осям в доступных направлениях после зума, mouse/touch drag, восстановление после закрытия, никакого изменения вопроса/ответов/прогресса. `scripts/photo-viewer.browser.mjs` включён в GitHub CI. Дополнительная проверка реальных привязок изображений и CI PASS; **без запуска общего редизайна #260, PR Codex #253 и production**.

**Содержимое вопроса `l1v2-a-poe-limit`:** по утверждённой независимой проверке #258 вопрос о прямом считывании `PSE Type 1/2`, `Positive 3,6`, `Negative 1,2` допустим в **Основы (Fundamentals)** как практика чтения экрана прибора; не смешивать его с вычислением бюджета PoE. Переоценка дидактической полезности — отдельно при следующей предметной вычитке, ключ и уровень сейчас не менять.

---
## Терминология пяти уровней сложности — утверждено владельцем 19.11.2026

**Обязательное правило для дальнейших обсуждений, задач Grok/Codex, ревизий, PR и новых записей ROADMAP:** писать название сложности **сначала по-русски, затем английское в скобках**. Не обозначать сложность сокращениями «L1», «L2», «L3» без пояснения: их легко спутать с уровнями OSI.

| Учебный уровень (`learningLevel` в коде) | Утверждённое название |
|---|---|
| 1 | **Основы (Fundamentals)** — в переключателе тестирования «База» |
| 2 | **Углублённый (Understanding)** |
| 3 | **Прикладной (Application)** |
| 4 | **Диагностика (Troubleshooting)** |
| 5 | **Эксперт (Expert)** |

**Не путать с OSI:** уровни сетевой модели писать как **OSI L1–L7** (например, OSI L2 — канальный, OSI L3 — сетевой). Уровни сложности обозначать полным названием из таблицы; техническая числовая запись `learningLevel=1…5` допустима в исходниках и тестах. Вопрос любого уровня сложности может относиться к любому уровню OSI.

**Граница изменения:** это правило именования в документации и коммуникациях, **не команда на массовое переименование в коде или UI**. В `src/types/learningLevel.ts` ещё используются исторические русские имена «Понимание» и «Применение», а действующие кнопки содержат «База», «Углублённый», «Прикладной»; изменение отображаемых подписей и метаданных — отдельная задача с проверкой совместимости. Старые записи ROADMAP остаются историческими снимками; приоритет у этого правила.

---
## «Прикладной» L3 — 12 сервисных обменов, отдельный Draft PR #254 (18.11.2026)

**Статус: DRAFT / INDEPENDENT REVIEW PENDING.** Ветка `feat/applied-l3-session-transport-batch1-20261118`, [PR #254](https://github.com/apotet/my-gemini-mirror-site/pull/254), без merge, staging и production.

- 12 вопросов с `learningLevel=3`: дополнен индивидуальный инженерный `pro`, сохранены исходные `brief/plain/trap`, правильные ответы, текст билетов и прежние попытки.
- Два тематических урока с `plain`/`professional` и двунаправленными ссылками: TCP/SSH/FTP/POP3/IMAP/LDAP (7 ID) и UDP/TFTP/NTP/SNMP (5 ID).
- Независимая проверка нашла отсутствие inline hover у 6 новых glossary entries; добавлены `TOOLTIP_NAMES`, scoped LDAP Bind/Search и обязательный SSR-тест двух режимов на `data-glossary-term`; реестр, L2 и банк вопросов не менялись.
- Для релиза: дождаться CI на финальном SHA, нового независимого PASS, GATE-01…10, затем merge в staging только по регламенту; после деплоя проверить публичную страницу. Production — только с разрешения владельца.
- Это параллельная ветка по явному поручению владельца; TODO по «Базе» ниже остаётся DEFERRED/OPEN и не считается закрытым.

---

## P0 · Аудит первых 6 сложных вопросов «Базы» (Grok → ChatGPT, 19.11.2026)

**SEMANTIC REVIEW PASS / FULL CI + GATE PENDING, ещё НЕ опубликовано:** Issue [#257](https://github.com/apotet/my-gemini-mirror-site/issues/257), Draft PR [#258](https://github.com/apotet/my-gemini-mirror-site/pull/258). Grok предложил оставить 2 простых фото-вопроса на L1 и перенести 4 механизма (PAT, TIME-WAIT, SACK, ECN) в L2; прогноз выборки 216 / 164 / 376 / 88 / 18. Независимая проверка выявила устаревшие CI фикстуры и не относящиеся к фактическому вопросу объяснения у двух фото-ID. [Поимённая матрица и причины BLOCK](audits/l1-suspicious-six-20261119.md). До исправления контента, полной CI- и браузерной приёмки — не merge; Codex PR #253 и production не трогать.

**Уже выпущено ранее:** новая «База» L1=220 через PR #256 (staging Pages подтверждён), поэтому числа 216/164 **не считать текущим опубликованным сайтом до merge PR #258**. После приемки обновить описание релиза, итоговые счётчики и факт live smoke.

---

## P0: «База» должна использовать L1, а не legacy beginner (обновлено 19.11.2026)

**Статус: STAGING RELEASED 19.11.2026 — PR #256 (`46f9ec11`) прошёл CI и GitHub Pages, на живом сайте подтверждены 220 L1; новый PR #258 (216 L1 / 164 L2) ещё на проверке.** Владелец потребовал исправить «Базу» первой, не дожидаясь окончания L2. Зафиксирован [точный аудит](audits/base-l1-reconciliation-20261119.md): из 253 legacy beginner — 152 L1, 40 L2, 61 L3; безопасный переход меняет только селектор новых Base на канонические 220 L1 (101 убрать из новых выборок, 68 добавить). Банк/реестр/старые попытки не менять; нужен CI, независимая приёмка и browser smoke. Production НЕ менять.

**Почему возникло:** первоначальный набор вопросов, в том числе созданных Grok, содержал слишком сложные билеты с legacy-меткой `beginner`. Владелец специально ввёл пять последовательных учебных уровней, чтобы простой стартовый режим не содержал неподходящей диагностики/сложной практики. В дальнейшем наполнялись две разные выборки, поэтому слова «База» и «Основы» стали обозначать разные пулы.

**Подтверждённое состояние исходников на момент записи:**
- Карточка **«База»** в `src/components/ExamView.tsx` использует `difficulty='beginner'`, а `getTestingPool` для неё обращается к legacy `getExamPool`. На опубликованном интерфейсе после PR #256 — **220** доступных вопросов по всем темам (216 только после принятия PR #258).
- Учебный уровень **«Основы» L1** из `src/data/questionLearningLevels.json` содержит **220** `ASSIGNED` вопросов. Это другая выборка, хотя для L1 подтверждено техническое покрытие 220/220 связями с уроками (PR #249).
- **«Углублённый»** (`in-depth`) использует `learningLevel=2`: **160** вопросов на текущем staging до PR #258, запланировано **164** после четырёх одобренных переносов.
- Карточка **«Прикладной»** пока использует legacy `difficulty='applied'`, что не равно автоматически `learningLevel=3` (**376** по реестру). Не приписывать число 376 текущей карточке без проверки UI.
- Фото-группа `visual-l1` — тематическая группа, а не учебный уровень L1. Разницу **253 − 220** нельзя объявлять списком «33 лишних фото»: пулы могут пересекаться не полностью.

**Уточнение контрактов и дальнейшая проверка:**
1. Снять поимённые множества ID для `difficulty=beginner`, `learningLevel=1`, `difficulty=applied`, `learningLevel=3`; построить матрицу пересечений и отдельно показать `group=visual-l1`. Проверить соответствие фактическим селекторам и цифрам на опубликованном staging.
2. Предметно проверить все вопросы, попадающие в legacy «Базу», но не в учебные «Основы», и обратное различие. Показать, не возвращает ли прежний фильтр сложные вопросы, от которых изначально решили отказаться. Учитывать уже проделанную работу с 253 individual `beginner` разборами — не терять её.
3. По прямой команде владельца «Базу» перевести на точный `learningLevel=1` в новом тестировании. Карточка «Прикладной» и полноценный пятиуровневый UX — отдельные последующие решения, их пока не менять.
4. **Явное решение владельца о селекторе «Базы» дано 19.11.2026.** Не переклассифицировать вопросы и не менять другие уровни. Сохранить открытые и завершённые попытки, прогресс, прежние ответы и работу с фото; провести CI, независимую проверку, мобильный/desktop smoke и staging deploy по регламенту. Production — отдельно.

**Очередь с 19.11.2026:** исправленный селектор «Базы» = L1 уже опубликован PR #256 → P0 содержательная проверка шести билетов PR #258 (без merge до всех gates) → отдельная работа Codex L2 PR #253 и оставшиеся уроки → L3/L4/L5 → отдельная классификация режимов. При передаче работы сохранять это решение.

---

## Контекстные переходы вопрос → абзац урока (17.11.2026)

**STAGING RELEASED:** PR [#250](https://github.com/apotet/my-gemini-mirror-site/pull/250), squash `5c6f0602`; [CI](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44044645786) PASS, [GitHub Pages](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44044645649) PASS, независимый review PASS. Preview-Playwright проверил точный скролл/подсветку/оба стиля на 375 и 1440 px; на опубликованном сайте подтверждены загрузка и переход к разбору, прямой live smoke на подсветку ограничен браузерным таймаутом. Production без изменений.** Реализован масштабируемый явный реестр точечных секций, без подбора по совпадению текста и без отдельного урока на каждый вопрос.

- `photo-otdr-end` → `l1-otdr-trace-interpretation` → `otdr-end-of-fiber`; `gen-osi-a-19` → `l7-dns` → `dns-nxdomain-application`; `tcp-06` → `tcpip-model` → `tcpip-end-to-end-fields`.
- В уже существующем уроке добавляются короткие предметные разделы в обоих стилях, рядом с соответствующим текстом. Рендер секций расширяется отдельно, без переписывания защищённых авторских файлов уроков.
- При переходе из вопроса открывается именно соответствующий блок, скролл устанавливается ПОСЛЕ его отрисовки, блок подсвечивается кратко, позиция восстанавливается при переключении «Простыми словами» / «По делу». Кнопка возврата к исходному вопросу остаётся.
- Если точечная секция для другого вопроса ещё не задана, действует прежний переход к началу урока — **без выдуманного якоря**. Сохранённые попытки/банк/правильные ответы не меняются.
- Gate: `scripts/lesson-section-links.test.mjs`, Playwright мобильный 375/desktop 1440, полный CI, независимая приёмка, только затем merge + live smoke. Production отдельно, не менять.

## «Основы» — закрытие переходов к урокам (17.11.2026)

**STAGING RELEASED:** PR [#249](https://github.com/apotet/my-gemini-mirror-site/pull/249), squash `45907f62`; CI и GitHub Pages PASS, независимый semantic review 75/75 PASS. Production не опубликован.

- Два уже связанных с `qos-basics` билета L1 (`review-qos-21`, `tcpip-d05`) обнаружились без инженерного стиля. Добавлен профессиональный QoS-слой на уровне реального урока, без подмены новыми ссылками; protected SHA256 намеренно обновлён только для этого файла. После проверки исходного resolver: 220 вопросов с learningLevel=1, из них 74 без программной связи «вопрос → урок». Отдельно в сохранённой попытке обнаружены `l57-x11` (MX), `ts-x12` (ss/netstat) и `gen-osi-a-1` (символьная скорость); первые два входят в 74, третий — дополнительный регрессионный кейс.

- 14 новых двустильных тематических уроков (по замечанию независимого ревизора добавлен отдельный TCP SACK, RFC 2018) (добавлены инструкции чтения MHz и визуальной проверки оптической панели; переназначен TCP-handshake на профильный урок), связи для 74 конкретных ID, 3 источника скриншотов закреплены тестом. 74 / 74 — **фактическое покрытие после мержа, подтверждённое CI и опубликованным staging**.
- Никакого fallback на произвольный урок, автоподстановки по теме, переписывания 862 исходных вопросов, вариантов, ключей и сохранённых попыток; прямая явная привязка только к объясняющему материалу.
- Реестр уроков `src/data/lessons/index.ts` входил в защищённые файлы stage-2 из Issue #171; его намеренное изменение по заданию владельца требует явного обновления **только** SHA256 этого файла в `docs/audits/issue-171-baseline.json`. Защита всех остальных 177 источников, банковский SHA и аудит классификации сохранены.
- Обновлена эталонная матрица `scripts/review-material-fixtures.mjs`: `ts-x12` теперь имеет урок, а состояние «без урока / без pro» проверяет `gen-transport-11` (четыре UI-комбинации сохранены).
- Проверка в `scripts/foundation-lessons.test.mjs`: 220/220 уровня «Основы» имеют существующий урок; все новые связи ведут к материалу с plain и pro; привязаны MX, ss/netstat и baud-rate; на пустом/неизвестном ID не подбирается чужой урок.
- **Стандарт учебных материалов соблюдён по структуре; независимая содержательная приёмка, CI и проверка опубликованного staging выполнены в PR #249.** Production — только по отдельному явному разрешению.

## «База» — партия №7: закрытие последних 15 beginner (17.11.2026)

**Статус: PR/CI/review PENDING.** Фактическое до партии покрытие 238/253. Недостающие `gen-port-15..17`, `photo-gbic-size`, `photo-blue-upc`, `review-hsr-14`, `review-poe-29`, шесть `l1v2-a-*` по повреждениям/PoE/Cat6A и `l57-x03/x17` обнаружены по resolver и источникам 198+55. `review-poe-29` имел approved `audited.practicalTip`, но не имел индивидуального deep; подсказку сохраняем приоритетной.

- 15 новых индивидуальных brief + 3 абзаца plain + самостоятельный pro + ловушка + практический совет; четыре реальных урока plain/pro: `l4-directory-remote-industrial-ports` (3), `l2-hsr-redundancy` (1), `l1-copper-fault-poe` (7), `l7-http-status-basics` (2); два фото включены в готовый `l1-fiber-hardware` без дублирования. Девять новых glossary terms, прежние определения не переписаны.
- Восемь исходных фото визуально сверены с pinned `apotet/osi-tcpip-exam-public@1c52fa8`: исключены догадки о химической коррозии, диапазоне оптики и категоризации всего канала по этикетке Cat6A; PoE 54,6 V без нагрузки не приравнивается 13 W. Исходные 862 билета/варианты/ключи/фото/статистика не менялись.
- Матрица: [docs/audits/base-foundations-batch7.md](audits/base-foundations-batch7.md). Тест 15 реальных ID: `scripts/base-foundations-batch7.test.mjs`. **Стандарт учебных материалов соблюдён**, источник `docs/LEARNING_CONTENT_STANDARD.md`. Staging publish только после CI, независимого Codex и GATE-01..10. Production `apotet/netops` без явного разрешения владельца не обновлять.

## «База» — партия №6: оптоволокно, сварка и измерения (17.11.2026)

**Статус: PR, независимая приёмка и CI PENDING.** После партии №5 стало 218/253 beginner individual; этот выпуск закрывает ещё 20 реальных пробелов. Банк 862 и все исходные key/варианты/images/attempts не изменены.

- Для каждого `l1v2-b-coating-tool`, `l1v2-b-buffer-tool`, `l1v2-b-cleaver-name`, `l1v2-b-screen-before`, `l1v2-b-screen-loss-read`, `l1v2-b-protect-next`, `l1v2-b-sleeve-purpose`, `l1v2-b-tray-role`, `l1v2-b-kevlar-purpose`, `l1v2-b-om3-real-label`, `l1v2-b-simplex-real`, `l1v2-b-tray-real-retainer`, `l1v2-c-vfl-task`, `l1v2-c-power-read`, `l1v2-c-inspection-tool`, `l1v2-c-trace-units`, `l1v2-c-closure-purpose`, `l1v2-c-converter-path`, `l1v2-c-poe-marked-ports`, `photo-cable-colors` — свой «Почему так», 3-абзацное «Простыми словами», самостоятельное «По делу», ловушка и **тематическая практика** вместо универсальной оптической заглушки.
- Два новых двустильных урока: `l1-fiber-splicing` (13 связанных вопросов) и `l1-optical-testing-equipment` (7); словарь пополнен на 15 отсутствовавших терминов, без переписывания существующих. Никаких вымышленных стендов.
- Все 20 исходных фото из pinned public repo `apotet/osi-tcpip-exam-public@1c52fa8` фактически просмотрены; числовые значения Loss/dBm, единицы OTDR ft и маркировки TX/FX/PoE сверены. У `OM3` надпись с бликом, у кассеты материал гильз не доказывается фото; в ответах не утверждаются скрытые параметры.
- Матрица: [docs/audits/base-foundations-batch6.md](audits/base-foundations-batch6.md), регрессия `scripts/base-foundations-batch6.test.mjs`. **Стандарт учебных материалов соблюдён**, условия `docs/LEARNING_CONTENT_STANDARD.md` без изменения.
- Публикация только после CI + независимого review + GATE-01…10. После Pages deploy — smoke на реальном staging, в том числе неверных fallback не должно быть. Production `apotet/netops` не трогать.

### Партия №5 — пострелизный hotfix практического совета (17.11.2026)
После merge PR #245 обнаружен смысловой дефект: медный фото-билет `l1v2-a-futp` показывал общий оптический совет «Осмотр/чистка торца...». Изолированное исправление для 20 `BASE_FOUNDATIONS_BATCH5` заменяет этот fallback медной инструкцией по маркировке, wiremap и измерениям категории. Добавлена обязательная регрессия на все 20 ID. Не изменяются вопросы/ключи/старые оптические билеты и уроки. **Стандарт учебных материалов соблюдён.** Требуются CI, независимое review, GATE и браузерная приёмка после публикации.

## База — партия №5: медная СКС и инструменты (17.11.2026)

**Статус: PR / независимая приёмка PENDING.** Фактический отчёт после #244: 198/253 beginner individual (78%), 55 без индивидуальных разборов. Закрываются ещё 20 реальных пробелов без переписывания уже готовых Ethernet/MAC/ARP или оптических материалов.

- Новые 20 photo brief + 3 абзаца plain + независимый pro + предметная ловушка: `l1v2-a-8p8c`, `l1v2-a-uutp`, `l1v2-a-stranded`, `l1v2-a-futp`, `l1v2-a-pair-foil`, `l1v2-a-keystone`, `l1v2-a-panel-passive`, `l1v2-a-wall-port`, `l1v2-a-stripper`, `l1v2-a-cutters`, `l1v2-a-punchdown`, `l1v2-a-crimper`, `l1v2-a-label-category`, `l1v2-a-label-lshf`, `l1v2-a-label-four-pairs`, `l1v2-a-tone`, `l1v2-a-mark-cat5e`, `l1v2-a-mark-cat6`, `l1v2-a-pvc-read`, `l1v2-a-solid-view`.
- Два настоящих двустильных урока: `l1-copper-cable` (11 связей) и `l1-copper-installation` (9 связей); добавлены 24 отсутствовавших словарных термина. Несуществующих практик нет.
- Изображения и правильные ответы в `questions.json`, банк 862, сложность и сохранённые результаты не менялись. Отдельный тест `scripts/base-foundations-batch5.test.mjs` проверяет exact keys/images/lessons/individual layers/glossary.
- 17 исходных изображений визуально сверены: 13 чистых PASS, 4 нуждаются в квалифицированном прочтении. Дополнительный просмотр оригиналов подтвердил F/UTP, обёртки отдельных пар, печать `CATEGORY 7A`/`4P`/`LSHF`, а также `CATEGORY 5E`. Вся экспертная интерпретация ограничена тем, что реально подтверждается фото.
- Авторская матрица и контроль: [base-foundations-batch5.md](audits/base-foundations-batch5.md). **Обязательные перед staging:** независимый Codex, CI, GATE-01…10, проверка источников и браузер после Pages deploy. Production `apotet/netops` не трогать без отдельной команды.

## База — партия №4: фотооптика и физическая инфраструктура (17.11.2026)

**Состояние: PR / CI / независимая проверка PENDING.** После аудита текущего beginner-банка обнаружено, что большинство билетов Ethernet/MAC/ARP уже имеют индивидуальные материалы, а непокрытая зона сосредоточена в фото-блоке. Поэтому не переписываем качественный существующий текст, а закрываем **20 реальных пропусков**: `photo-lc`, `photo-sc`, `photo-st`, `photo-fc`, `photo-lc-sc-order`, `photo-sfp`, `photo-gbic-sfp`, `photo-sm-mm-colors`, `photo-patchcord`, `photo-apc`, `photo-otdr`, `photo-cable`, `photo-panel`, `photo-lc-latch`, `photo-sc-push`, `photo-sc-color`, `photo-st-bayonet`, `photo-st-usage`, `photo-lcsc-size`, `photo-sfp-contacts`.

- Добавлены индивидуальные «Почему так», три абзаца «Простыми словами», отдельный «По делу» и ловушки для каждого фото. Исходные 862 билета, варианты, ключи, изображения и сохранённые попытки не менялись.
- Новый двустильный урок `l1-fiber-hardware`: LC/SC/ST/FC, SFP/GBIC, цвета SM/MM и UPC/APC, оптический кросс и OTDR. 20 точных question→lesson связей, двусторонняя навигация, словарь дополнен только отсутствующими терминами, выдуманные стенды не добавлялись.
- Предрелизная матрица: [base-foundations-batch4.md](audits/base-foundations-batch4.md). `scripts/base-foundations-batch4.test.mjs` подтверждает source keys/media refs/plain/pro/lesson/glossary, но не подменяет визуальную и независимую приёмку.
- **До staging merge:** независимый review + CI + GATE-01…10, особенно проверка изображений и обоих слоёв в браузере. Production `apotet/netops` не трогать без команды владельца.

## База — партия №3: TCP/IP, PDU, LPM, сервисные порты (17.11.2026)

**Состояние: 20/20 AUTHOR PASS + CI PASS (код SHA b1fc165), независимый Codex code review завершён без замечаний; staging release после финального CI/GATE.** Ветка `feat/base-foundations-batch3` от staging `main` после PR #242. Production не изменён.

- **20 ID:** `tcpip-x13`, `tcpip-x15`, `tcpip-x16`, `tcpip-x17`, `tcpip-x19`, `tcpip-x21`, `tcpip-x29`, `l3-02`, `k-06`, `k-08`, `new-l6-format`, `new-tcpip-payload`, `gen-port-0`, `gen-port-1`, `gen-port-2`, `gen-port-3`, `gen-port-4`, `gen-port-5`, `gen-port-10`, `gen-port-12`.
- Для каждого отдельные «Почему так», три смысловых абзаца «Простыми словами», самостоятельный «По делу», точный урок, только имеющиеся подходящие тренажёры. Вопросы, ключи, уровень и сохранённые попытки не меняются.
- Новые двустильные уроки: `l3-route-selection` (граничный LPM /25↔/24, ARP отдельно) и `l4-service-ports` (IANA, HTTP/HTTPS/SSH/Telnet, FTP control/data, SMTP, POP3, IMAP).
- **Приёмка:** [матрица 20 ID](audits/base-foundations-batch3.md): 20/20 AUTHOR PASS; CI #43998829977 зелёный (включая Chromium 375/1440), независимый Codex review завершён без замечаний на кодовом SHA b1fc165. Следующий merge только после независимого PASS, финального CI и GATE-01…10; затем smoke-test Pages.
- **Покрытие:** 178/253 beginner имеют индивидуальный подробный разбор (70%); 75 пока без него. Следующая партия следует утверждённому тематическому порядку.
- **Дальше:** по-прежнему только закрытие пробелов `beginner` и связанные уроки в порядке OSI/TCP/IP → Ethernet/MAC → ARP/IPv4 → VLAN. Отдельно доработать фото-вопросы, не выдавая общий fallback за индивидуальную pro-версию.

## База — партия №2: OSI и TCP/IP (17.11.2026)

**Состояние: DONE — PR #242 merged (`f6dcd7f`), staging Pages deployment PASS (#43993293257), публичный smoke-test desktop/mobile PASS; production не изменён.** Staging branch `feat/base-foundations-batch2` от `88ca8a8`; production не изменён. Набор зафиксирован до правок, 20 ID:

- `l3-12`, `l4-08`, `l5-01`, `l6-02`, `tcp-04`, `tcp-07`, `tcp-08`, `tcp-09`
- `gen-osi-a-7`, `gen-osi-a-9`, `gen-osi-a-11`, `gen-osi-a-12`
- `tcpip-x01`, `tcpip-x02`, `tcpip-x04`, `tcpip-x05`, `tcpip-x07`, `tcpip-x08`, `tcpip-x10`, `tcpip-x12`

**Изменения:** каждому билету подготовлен отдельный слой «По делу», 16 из них получили отдельный разбор «Простыми словами», а у четырёх уже существующие качественные plain-разборы сохранены. Два новых урока: `osi-session-presentation` (L5/L6) и `l3-icmp-basics` (ICMP). Исправлены связи с существующими уроками `tcpip-model` и `osi-pdu`. Уже существующие привязки не заменены выдуманными стендами. Реальные переходы: packet для ARP/ICMP и tcp для транспортных портов; фиктивная UDP-практика удалена.

**Приёмка:** 20/20 ID сверены по условию, ключу, индивидуальным plain/pro, уроку и практике; [матрица с доказательствами](audits/base-foundations-batch2.md). Codex независимо перепроверил исправления на SHA b4da2705 — новых замечаний нет. CI 43990507588 прошёл, включая 375/1440 px. Публикация в staging подтверждается только после merge и проверки Pages.

**Продолжение:** по приоритету OSI → TCP/IP → Ethernet → MAC → ARP → IPv4 → VLAN. Для завершения всей «Базы» повторить аудит оставшихся beginner ID и пройти тематические пачки 20–30; не считать старые технические долги закрытыми по одной этой партии.

## База: первая расширенная партия пробелов OSI/TCP-IP (17.11.2026, PR #242 — приёмка пройдена)

- **Партия №2:** `l3-12`, `l4-08`, `l5-01`, `l6-02`, `tcp-04`, `tcp-07`, `tcp-08`, `tcp-09`, `gen-osi-a-7`, `gen-osi-a-9`, `gen-osi-a-11`, `gen-osi-a-12`, `tcpip-x01`, `tcpip-x02`, `tcpip-x04`, `tcpip-x05`, `tcpip-x07`, `tcpip-x08`, `tcpip-x10`, `tcpip-x12`.
- Добавлены **20 профессиональных слоёв**, **16 трёхабзацных индивидуальных простых разборов**. У четырёх существовавших подробных простых разборов изменён **только** профессиональный текст, без переписывания одобренного plain. Ключи и 862 исходных вопроса неизменны.
- Дополнены связи с действующими уроками `osi-pdu`, `tcpip-model`; урок `tcpip-encapsulation` получил содержательный `professional`. В словарь добавлены 18 терминов в двух итерациях (остальные существующие определения переиспользованы) с назначениями; существующие практические стенды переиспользуются, новых нет.
- **Целевые цифры после принятия:** индивидуальные 553/862; профессиональные 432/862; связанные уроки 385/862. Эти цифры требуют подтверждения актуальным CI; предыдущий снимок покрытия 862 / 379 / 412 учитывал урок `l3-12` уже после основного реестра.
- Регламент: `docs/LEARNING_CONTENT_STANDARD.md`; [матрица 20 ID](audits/base-foundations-batch2.md), `scripts/base-foundations-batch2.test.mjs` и CI. **Код-ревью Codex завершено без замечаний; перед staging merge обязательны финальный зелёный CI и GATE-01…10**. Staging публикацию после merge проверять в браузере; production только по отдельному разрешению.
- **Дальше:** продолжаем базовые темы в порядке OSI → TCP/IP → Ethernet/MAC → ARP/IPv4 → VLAN и дальше, пачками по 20–30, выбирая непокрытые ID и переиспользуя полноценные уроки. Не переходить к CCNA, пока не завершён P0 и не поступила отдельная команда.


## Инвентаризация покрытия (16.11.2026)

Пересчёт по текущему main после PR #238, до партии фундаментальных билетов: 862 вопроса. Старый реестр 862 / 375 уроков / 402 профессиональных разбора не использовался как истина.

После партии фундаментальных билетов:

- 862 вопроса, 378 со связанным уроком, 412 с профессиональным слоем.
- Оба стиля урока отсутствуют у: tcp-window-retransmit, tcpip-encapsulation, l7-dns-dhcp, l7-services, qos-basics.
- Отсутствие отдельного урока не считается ошибкой, если общий урок уже покрывает тему.

Партия: `l2-03`, `l2-05`, `l3-01`, `l4-02`, `tcp-02`. Это базовые L2/L3/L4 и TCP/IP без полноценного профессионального слоя. После доработки все пять — PASS. Следующая рекомендуемая партия: `l6-02`, `tcp-08`, `l7-05`, `l3-12`, `tcp-04`.

## Дерево развития → учебный контент: обязательная приёмка всего банка (16.11.2026)

**Приоритет:** последовательный аудит существующих базовых билетов, а не точечная полировка отдельных продвинутых уроков. Порядок: OSI → TCP/IP → Ethernet → MAC → ARP → IPv4 → VLAN → остальные темы. Партии по 20–30 ID; до правок фиксировать точный список.

**Полный контракт каждого нетривиального билета:**
1. Корректные условие, варианты, ключ, дистракторы и уровень сложности; технические утверждения сверять с RFC/IEEE/документацией производителей при необходимости.
2. «Почему так» — краткое предметное объяснение ответа, без тавтологии.
3. «Смысл / Простыми словами» — самостоятельный понятный разбор механизма, с примером при необходимости.
4. «По делу / Инженерный разбор» — самостоятельный технический разбор с применением, ограничениями, диагностикой, командами/расчётами по необходимости. Не копия «Смысла».
5. **Связанный урок обязательно содержит ОБА полноценных уровня: «Смысл / Простыми словами» И «По делу».** Оба объясняют одну тему с разной глубиной; не формальная пара заголовков. Переиспользовать подходящие уроки для нескольких билетов, не создавать дубликаты.
6. Проверенная точная связь questionId → lessonId, переход к конкретному уроку и возврат к вопросу; если урока нет — честное временное сообщение, но для нового нетривиального билета это блокер выпуска.
7. Все существенные сокращения/термины в условии, вариантах, обоих разборах, уроке и заголовках имеют понятные определения и работающие hover/focus/tap подсказки. Искать неизвестные термины непосредственно в текстах, а не только по готовому словарю.
8. Тематические теги и смежные ссылки содержательны, ведут к правильному определению/теме, не декоративны; проверять возврат и отсутствие тупиков.
9. Если существует релевантный стенд, давать точный рабочий переход к практике; не выдумывать стенды.
10. Проверить переключение уровней **и в билете, и в уроке**, форматирование, мобильный/десктоп, сохранённые попытки и остальные затронутые экраны.
11. Независимая содержательная приёмка по каждому ID: PASS / FIX / REVIEW с доказательствами; машинный сканер и зелёный CI не заменяют ревизора. FIX/REVIEW для нового или изменённого нетривиального билета блокируют приёмку.

**Матрица партии:** ID → условие/ключ → «Почему так» → «Смысл» → «По делу» → урок («Смысл» + «По делу») → словарь/подсказки → точные ссылки/возврат → практика → PASS/FIX/REVIEW → доказательства.

**Правила:** не переписывать качественный текст ради объёма; для старых билетов неполное покрытие — планомерно устраняемый техдолг, а не ложный PASS; исключения для очевидных/фото-вопросов только индивидуально и обоснованно. Действующий норматив: [LEARNING_CONTENT_STANDARD.md](LEARNING_CONTENT_STANDARD.md). Staging — `apotet/my-gemini-mirror-site`; production — `apotet/netops` только по отдельному разрешению.


## Аудит качества разборов (16.11.2026)

Ветка `audit/explanations-quality`:
- Полный скрининг 862 вопросов.
- Исправлены слабые CLI/диагностические разборы (включая ts-x12 и пакет ts-x*).
- Добавлен отчёт `docs/audits/explanations-quality-audit.md`.
- Добавлен регрессионный скрипт `scripts/explanations-quality.test.mjs`.

Скрининг PR #227: PASS 677 / FIX 125 / REVIEW 60. Метки основаны на эвристиках длины и наличия отдельного разбора.

### Единое отображение разбора — PR #228

- Общий форматтер используется в «Почему так», подробном и итоговом разборе, теории, уроках и макете тестирования. Поддерживает абзацы, списки, флаги и вывод терминала с прокруткой внутри блока. Подсказки словаря работают в прозе обоих стилей.
- Точечно исправлены Cisco/Linux CLI и расчётные пояснения L3. Переходы ведут в существующий урок или на подходящую вкладку тренажёра. Снимки попыток, ключи и уровни защищены регрессионными проверками.
- [Отчёт и исходный реестр аудита](audits/explanations-quality-audit.md). Браузерная проверка сценариев добавлена в CI.

# NetOps — карта развития

## Разборы: прямые уроки и честное покрытие стилей (после PR #229)

- `EngineeringReview` во мгновенном разборе, итогах, последней попытке, работе над ошибками и макете использует действующий `getLessonForQuestion`. Кнопка «Перейти к уроку» передаёт ID урока и открывает именно его в базе знаний с привязкой к исходному вопросу. При отсутствии связи показано «Урок по этой теме пока не подготовлен»; фиктивных переходов нет.
- «Почему так» остаётся коротким объяснением. Переключатель «Простыми словами» / «По делу» находится внутри «Подробного разбора» и показывается только при наличии обоих текстов. При отсутствии pro отображается «Профессиональный разбор пока не подготовлен», в том числе при сохранённом предпочтении «По делу». Новые тексты и уроки не создавались.
- Аудит актуальных 862 вопросов: **375** со связанным уроком, **487** без связи; **402** с профессиональным разбором, **460** без него. Полные списки ID: [review-material-coverage.json](audits/review-material-coverage.json). Отсутствие учебного материала — пробел покрытия, а не автоматическая техническая ошибка вопроса. Аудит учитывает действующие связи, включая утверждённое сопоставление расчётных заданий с уроками масок/подсетей.
- Проверки: lint, build, профильные unit-тесты и Chromium 375/1440 px: наличие/отсутствие материала, реальное переключение стилей, прямой переход во всех перечисленных потоках, сохранение снимка завершённой попытки. Форматтер PR #228, банк, ключи, сложность и production не меняются.
- [Передача на повторную приёмку](audits/pr-230-followup.md). После независимого аудита PR #230 исправлен `TheoryRazbory`: стабильное «Почему так», простой и профессиональный тексты внутри подробного разбора, честное отсутствие pro/урока; кнопка урока общая с `EngineeringReview`. Тест вызывает реальный обработчик и проверяет `(lessonId, questionId)`; обе поверхности проверяются по всему банку. Браузерная матрица: 6 реальных вопросов (CLI, TCP, TLS, подсети, OTDR), 4 сочетания материалов × 7 сценариев × 375/1440 px; снимки и `matrix-evidence.json` сохраняются в CI.
- Изменения подаются одним PR; merge и публикация не выполняются. Дальнейшее наполнение материалов — отдельная задача по выявленным пробелам.

## Обязательный стандарт учебных материалов (16.11.2026)

**Утверждён владельцем и обязателен для ChatGPT, Work, Codex, Grok, Gemini:** [LEARNING_CONTENT_STANDARD.md](LEARNING_CONTENT_STANDARD.md). Сохранять «Почему так», «Смысл / Простыми словами», «По делу / Инженерный разбор», ссылки на уроки и практику. Если урока нет — показывать «Урок по этой теме пока не подготовлен». Если профессионального разбора нет — показывать соответствующее сообщение. **Нельзя молча удалять/переименовывать утверждённые части.**

**Реализация контракта:** подготовлена в PR #230, включая теорию, четыре комбинации наличия урока и профессионального слоя и мобильный/десктопный UI. Ожидает повторной независимой проверки; это не отметка о merge или публикации.


## Принцип взаимозаменяемости ИИ-исполнителей (16.11.2026)

**Решение владельца:** ChatGPT, ChatGPT Work, Codex, Grok и Gemini — взаимозаменяемые исполнители. Специализация допустима, но ни одна задача, ветка или знание не должны зависеть от одного инструмента.

- **GitHub — источник истины:** актуальный код, Issues, PR, ROADMAP, отчёты и принятые решения сохраняются в репозитории, а не только в чатах.
- **Передача работы:** каждый PR/задача фиксирует цель, базовую ветку и SHA, точные изменённые файлы, сделанное/недоделанное, результаты тестов и CI, известные риски и следующий шаг. Ссылки на артефакты обязательны.
- **Подхват любым исполнителем:** другой ИИ может продолжить существующую ветку после сверки с актуальным main; не начинать параллельную реализацию с нуля и не дублировать уже выполненное.
- **Параллельность:** задачи делить по независимым файлам/веткам; пересечения заранее согласовывать, конфликты разрешать перед merge.
- **Приёмка:** по возможности независимый исполнитель проверяет изменения. Зелёный CI не заменяет техническую и пользовательскую проверку.
- **Общие инструкции:** поддерживать единые правила разработки и передачи контекста в репозитории, пригодные для любого ИИ; не полагаться на закрытую память одного агента.
- **Граница публикации:** staging `apotet/my-gemini-mirror-site` — рабочая площадка; production `apotet/netops` изменять только по отдельной команде владельца.


## Приоритеты: качество банка → развитие CLI → CCNA Ready (16.11.2026)

**Решение владельца:** подготовку к CCNA отложить. Сначала довести до качества собственный банк NetOps: вопросы, короткие объяснения, индивидуальные разборы и отображение в интерфейсе. Развитие Cisco CLI вести **параллельно**, без блокировки на аудит банка. CCNA не начинать до отдельного решения владельца.

### P0 — привести в порядок существующие вопросы и объяснения (ACTIVE)

- Актуальный банк — **862 вопроса**. В очереди исходных FIX осталось **83 ID** после PR #228 и содержательной пачки №1 (30 проверено: 11 ложных FIX, 19 исправлено). Отдельно остаются **60 исходных REVIEW**. [Отчёт по всем ID пачки](audits/explanations-quality-audit.md#содержательный-аудит--пачка-1).
- Проверять техническую правильность условий, ключей, примеров и причинно-следственных объяснений. Исправлять только подтверждённые дефекты, **не переписывать хорошие разборы ради длины**.
- Единое форматирование: абзацы, списки, CLI-команды и вывод в моноширинных блоках, читаемость на мобильном/десктопе. Согласовать краткое «Почему так» и подробные «Простыми словами / По делу» во всех режимах и сохранённых попытках; не менять исторические ответы и оценки.
- Проверить содержательные связи с существующими уроками и словарём. Для соответствующих вопросов IPv4 **и** IPv6 — прямые рабочие ссылки на **уже существующие** тренажёры. Не создавать дубли или ссылки ради статистики.
- Регрессионные проверки, ручная выборочная техническая приёмка и зелёный CI обязательны. Системное форматирование вошло в main через [PR #228](https://github.com/apotet/my-gemini-mirror-site/pull/228). Содержательная проверка идёт отдельными пачками от main.
- **Критерий завершения:** проверенные FIX устранены, REVIEW разрешены или обоснованно отложены по ID; объяснения и ссылки работают в реальном интерфейсе, тесты и CI проходят.

### P1 — расширение Cisco CLI (PARALLEL)

- Параллельно развивать существующий CLI-тренажёр по [поэтапному плану](development/cli-learning.md): сценарии Beginner / Applied / Advanced, реальные команды, подсказки `?` и TAB, диагностика, конфигурация и сохранение, связанные уроки и практические топологии.
- Сначала проверять уже реализованное и стабильность схем/фокуса/сценариев; не плодить дубли и не ломать работающую практику. Новые возможности — отдельными проверяемыми пакетами.

### P2 — отдельный раздел «CCNA Ready — подготовка к сертификации» (BACKLOG / НЕ НАЧИНАТЬ)

- После завершения P0 и **отдельной команды владельца** рассмотреть независимый режим подготовки к Cisco CCNA 200-301 на базе собственных проверенных вопросов, уроков и CLI-практики.
- Сначала сверить актуальный официальный blueprint и покрытие шести доменов, затем спроектировать макет, тренировку по доменам, пробный экзамен и показатель готовности без обещаний гарантированной сдачи.
- Не копировать реальные экзаменационные вопросы, защищённые материалы или логотипы Cisco; явно обозначить независимый характер NetOps и отсутствие аффилиации. Не создавать отдельный дублирующий банк без необходимости.
- **Статус:** только запись в ROADMAP. Ни разработка, ни новые билеты CCNA, ни публикация не разрешены на этом этапе.


## История совместной разработки: Gemini + ChatGPT (16.11.2026)

**Роли:** Gemini — подготовка и реализация тематических пакетов в отдельных ветках; ChatGPT — постановка задач, проверка состава/разметки, исправления, создание/объединение PR и контроль staging. Авторство Gemini отмечено явно, чтобы история не терялась. Все изменения ниже — в тестовом репозитории `apotet/my-gemini-mirror-site`; production `apotet/netops` не менялся.

| Пакет | Исполнитель и участие | Результат | Публикация |
|---|---|---|---|
| Мониторинг: SNMP, Syslog, Zabbix | **Gemini** — 20 вопросов, 2 урока и словарь; **ChatGPT** — проверка и объединение | +20 вопросов; мониторинг и диагностика | [PR #223](https://github.com/apotet/my-gemini-mirror-site/pull/223), merged |
| Wi-Fi: радио, безопасность, роуминг | **Gemini** — 20 вопросов, 2 урока, 24 термина; **ChatGPT** — проверка, исправление ложной расшифровки Wi-Fi в glossary, объединение | +20 вопросов и 2 урока | [PR #224](https://github.com/apotet/my-gemini-mirror-site/pull/224), merged |
| Экспертные диагностические кейсы | **Gemini** — 20 новых вопросов, 12 терминов, связи с существующими уроками, тесты; **ChatGPT** — постановка [#225](https://github.com/apotet/my-gemini-mirror-site/issues/225), проверка ID/уровней/связей, создание PR и merge | 8 × L4 + 12 × L5; новых уроков не потребовалось | [PR #226](https://github.com/apotet/my-gemini-mirror-site/pull/226), [merge `18b1316`](https://github.com/apotet/my-gemini-mirror-site/commit/18b13168321d18614f7eb57f6858dc0cfa18f42d) |

**Итог после #226:** 859 вопросов; учебные уровни L1–L5: **220 / 160 / 376 / 88 / 15**, REVIEW = 0 по отчёту проверки. CI PR #226 — PASS (run #738).

**Фактическая проверка опубликованного интерфейса staging (16.11):** футер показывает **859 практических вопросов**. В рабочем «Тестировании» четыре селектора сложности (База, Углублённый, Прикладной, Смешанный), а не пять отдельных учебных уровней. Счётчики для «Все темы»: **253 / 160 / 470 / 666** соответственно; «Смешанный» исключает 193 фото-вопроса, поэтому 666 + 193 = 859. Отдельные видимые счётчики L4=88 и L5=15 отсутствуют; они относятся к реестру уровней, а не к четырём переключателям UI. Проверено браузером без запуска тестов.

**Граница работ:** #177 и PR #219 не затрагивались при создании экспертного пакета. Исторические планы в таблице «Расширение банка вопросов» ниже — целевые тематические этапы, а не перечень уже выпущенных пакетов; опубликованные мониторинг/Wi-Fi зафиксированы здесь отдельно.

## Выбор уровня в «Тестировании» (15.11.2026)

- В рабочем разделе тестового сайта доступны «База», «Углублённый», «Прикладной» и «Смешанный». На телефоне уровни открываются списком по нажатию на «Выбери свой уровень». На десктопе используются карточки. По умолчанию для новой попытки выбрана «База».
- «Углублённый» использует учебный уровень «Понимание» из реестра (145 вопросов по всем темам). «Прикладной» выбирает вопросы с меткой `applied`. Счётчик учитывает выбранную тему. Сохранённые попытки продолжаются со своим набором вопросов.

## Длина теста и пробный экзамен (15.11.2026)

- Количество вопросов в обычном тесте выбирается в верхней карточке рядом с уровнем. Доступно 5, 10, 15, 20 или 30, по умолчанию 10.
- Пробный экзамен запускается отдельной кнопкой. 20 вопросов, 15 минут, ответы и разбор после завершения. Перед стартом выбирается «Базовый» (20 по основам), «Продвинутый» (10 на понимание и 10 на применение) или «Смешанный» (6/7/7). Вопросы берутся из утверждённой разметки учебных уровней. Таймер сохраняет срок после перезагрузки, а по истечении времени учитываются подтверждённые ответы.
- В итогах пока показываются счёт, процент и разбор. Оценка готовности к профессии остаётся отдельным этапом.

## Действия и статус в «Тестировании» (15.11.2026)

- Разбор последней попытки выровнен по центру. Кнопка «Вернуться к тестам» есть в карточке итогов и в конце разбора. Действия «Продолжить тестирование» и «Начать заново» находятся над карточкой «Твой текущий статус».
- Рядом с индикатором серии отображается число верных подтверждённых ответов из общего числа. До первого ответа показано «Пока нет ответов».
- Сброс статистики доступен в карточке и требует подтверждения. Использует существующий сброс прогресса, серии, списка ошибок и сохранённых попыток.
- «Диагностика» и «Эксперт» пока остаются вне выбора уровня в рабочей вкладке.

## Макет тестирования — экспериментальный интерфейс (15.11.2026)

- **IN DEVELOPMENT / staging only.** Новый пункт меню «Макет тестирования» на `apotet/my-gemini-mirror-site`, рядом с «Макетом практики». Рабочая вкладка «Тестирование» не изменяется.
- Карточки выбора тренировки: Обучение, Проверка, Работа над ошибками, Все темы, По уровням OSI; настройки сложности, количества и темы спрятаны под раскрывающуюся панель. По умолчанию уровень «Основы».
- Новый режим OSI допускает выбор нескольких уровней. **Ограничение текущей разметки:** банк хранит группы L1–L2 и L5–L7; пока они выбираются целыми группами, без ложной точности L1 против L2 или L5 против L6/L7. Для полноценного разделения нужна независимая разметка вопрос→OSI layer с аудитом.
- Радар знаний и интерактивная схема OSI/TCP/IP переиспользуются без изменения исходных компонентов. Макет использует существующий банк и реестр назначенных учебных уровней, REVIEW исключаются.
- Тренировочные ответы в макете не записываются в основную историю; при перезагрузке незавершённая макетная сессия теряется. Параметры выбора сохраняются локально.
- **Критерии приёмки:** CI (TypeScript, build, тесты), мобильная/десктопная проверка, соответствие количества вопросов реальному пулу, проверка изоляции прогресса, проверка кнопок радара. Сравнить с рабочей вкладкой и переносить только по отдельной команде владельца.
- **Production boundary:** оба макета (`practice-mock`, `exam-mock`) исключать из релиза `apotet/netops`; никакого автоматического переноса. Действующий production не менять без отдельной команды.


## Развитие CLI

Подробный поэтапный план: [План развития обучающего раздела CLI](development/cli-learning.md).

Приоритет: сначала восстановить и стабилизировать схемы топологии и доступность заданий/подсказок в CLI; затем развивать сценарии по этапам 0–11, без дублирования уже реализованного.

## Расширение банка вопросов

| Этап | Тема | Объём | Статус |
|---|---|---|---|
| 1 | L4 + L5–L7 | +80–100 | pending |
| 2 | Безопасность (802.1X, ACL, VPN, threat) | +40–50 | pending |
| 3 | Автоматизация (Ansible, Python, API) | +30–40 | pending |
| 4 | Мониторинг (SNMP, NetFlow, логи) | +25–30 | pending |
| 5 | Беспроводка (Wi-Fi, контроллеры) | +20–25 | pending |
| 6 | Облако (VPC, overlay, BGP to cloud) | +20–25 | pending |

**Итого по плану:** +215–270 вопросов.

Статус `pending` означает, что этап запланирован, но ещё не подтверждён как выполненный. Перед каждой пачкой сверять темы и ID с существующим банком, чтобы не создавать дубликаты.


## Переразметка сложности экзамена и фото — Issue #167

Источник: [аудит всех вопросов, Issue #167](https://github.com/apotet/my-gemini-mirror-site/issues/167#issuecomment-6877144739). Снимок аудита: `1a56fdd284dc57959345f9c795356d209cfb94a3`; перед внедрением сверить с актуальным `main`. По отчёту: **787 уникальных ID, 0 дублей; 426 KEEP / 347 RELABEL / 14 REVIEW**. Это предложения аудита, не применённые изменения.

**Согласованная учебная шкала (русский + английский):** 1. Основы · Fundamentals; 2. Понимание · Understanding; 3. Применение · Application; 4. Диагностика · Troubleshooting; 5. Эксперт · Expert. Troubleshooting — тип деятельности, не автоматический признак большей сложности.

| Порядок | Задача | Статус и критерий завершения |
|---|---|---|
| 1 | REVIEW: уточнить 9 технически спорных вопросов (`gap-pack2-29`, `tcpip-x03`, `l4-x05`, `ts-x02`, `ts-x09`, `tcpip-d01`, `ts-d05`, `l3-vrrp02`, `l4-d04`). Отдельно оценить 5 фото-вопросов (`photo-cable-colors`, `l1v2-a-contact-solid`, `l1v2-b-strip-hole`, `l1v2-b-cleave-sequence`, `l1v2-c-closure-service`) без их изменения. | **DONE (technical 9) / PHOTO FOLLOW-UP**: [PR #168](https://github.com/apotet/my-gemini-mirror-site/pull/168) merged в staging main, merge SHA `765c319a0fcaa23a16826f0c2765e038b52a6ab3`. Девять технических правок приняты. [PR #170](https://github.com/apotet/my-gemini-mirror-site/pull/170) merged, SHA `90088dac0adc3ed50cffca304e978627773058a6`: три фото-вопроса переработаны, `l4-d04` уточнён. `l1v2-a-contact-solid` остаётся REVIEW до пригодного фото с маркировкой/datasheet; `l1v2-b-strip-hole` KEEP до достойной замены. Production не менялся. 6/50 тестовых скриптов ранее падали на base по отчёту Codex; отслеживать отдельно. |
| 2 | Переразметить 347 RELABEL по пяти уровням, проверить 426 KEEP и решения по REVIEW. | **DONE (metadata only)**: [PR #172](https://github.com/apotet/my-gemini-mirror-site/pull/172) merged, SHA `06e764bf2c7caa07a27ba30c44c3a91db896cc8a`. 347 RELABEL и 426 KEEP перенесены в независимый реестр; 14 REVIEW не назначены. Старые difficulty, UI, селекторы и сессии не изменены. |
| 3 | Исправить отбор «Базы»: фото при наличии подходящего фото в выбранной теме, уникальность ID и family, без подмешивания других сложностей; не ломать mixed/10 и customQuestions. | **PENDING**: тесты по Issue #167, включая 1/5/10/15/20/30, пустые пулы, тематические экзамены, повторы и старые попытки. |
| 4 | Подключить русские и английские названия пяти уровней в интерфейсе и фильтрации; сохранить различие уровня вопроса и режима экзамена. | **DONE**: [PR #180](https://github.com/apotet/my-gemini-mirror-site/pull/180), SHA `1f0fef5a19dbac0c2d4b11dbd64075765883a1db`. Строгая фильтрация по `questionLearningLevels.json` (только `status: ASSIGNED` + точный `learningLevel`). Счётчики: Основы 216, Понимание 144, Применение 357, Диагностика 53, Эксперт 3. Все 14 REVIEW исключены из новых попыток. Старое поле `question.difficulty` не используется для новых уровней. Старые сессии и прогресс совместимы (восстановление по ID). Production не затронут. Ручное решение 14 REVIEW остаётся отдельной задачей. |

### Пять уровней тестирования — подключены (PR #180)

- Реализован выбор пяти учебных уровней с живыми счётчиками.
- Новые попытки фильтруются исключительно по реестру `questionLearningLevels.json`.
- 14 вопросов со статусом REVIEW исключены до ручного разрешения.
- При нехватке вопросов других уровней не подмешиваются.
- Совместимость со старыми попытками сохранена.
- **Осталось:** ручное решение по 14 REVIEW (Issue #176), после чего можно будет пересмотреть их статус и при необходимости включить в пулы.

#### Приёмочное уточнение: «Основы» не равны legacy beginner

- Единственный источник L1–L5 — `src/data/questionLearningLevels.json`: только `status: "ASSIGNED"` и точный `learningLevel`. Старый `question.difficulty === 'beginner'` относится к legacy API, а не к «Основам» нового интерфейса.
- Для каждого уровня проверяется 1000 воспроизводимых выборок по независимому чтению исходного JSON: ни одного вопроса чужого уровня, REVIEW или дубликата ID. Подмена старого `difficulty` не меняет принадлежность к новым уровням.
- Приёмка включает соответствие экранных счётчиков реальному пулу и размеру попытки, честное сокращение при нехватке и восстановление старых попыток по сохранённым ID/answerOrders без повторного отбора. Банк и реестр не переклассифицируются; ограничения 14 REVIEW остаются в силе.
- Проверено: 5000 выборок (по 1000 на L1–L5), 16 вариантов старых/новых сессий и 30 браузерных сценариев (5 уровней × запрос 10/30 × ширины 360/390/1280 px). Чужих уровней, REVIEW, повторов ID и расхождений счётчиков не обнаружено. TypeScript, build, test:logic и test:learning-levels — PASS.


**Порядок работы:** каждый этап — отдельная ограниченная задача, PR → проверка → решение о merge. Не менять production `apotet/netops` без отдельного разрешения. Не смешивать с дорожной картой CLI и расширением банка.


### Будущий источник фото для NetOps
- Рабочий фотоархив пользователя (Google Drive): https://drive.google.com/drive/folders/18GN19tHHHUzfS_J-oXW4VOstrFo-dMhD
- Доступ к папке подтверждён; на первом просмотре обнаружено не менее 100 HEIC-файлов. **Содержимое кадров ещё не проверялось.**
- После стабилизации экзаменного алгоритма: визуальный отбор, оценка пригодности для честных практических фото-вопросов, проверка читаемости на мобильном, удаление/маскирование конфиденциальных сведений (IP, адреса, схемы, названия объекта и т. п.) и проверка права публикации. **Ничего не переносить на публичный сайт автоматически.**
- В первую очередь искать замену для `l1v2-a-contact-solid` при наличии читаемой маркировки и подтверждающего datasheet; остальные снимки — для новых задач по оптике/коммутации/монтажу/диагностике.
- Текущий следующий этап: [Issue #173](https://github.com/apotet/my-gemini-mirror-site/issues/173) — beginner photo/family selector, сохранить mixed/10 и старые сессии.


### Экзамен «База»: алгоритм отбора — выполнено
- [PR #174](https://github.com/apotet/my-gemini-mirror-site/pull/174) merged в staging main, SHA `b826657d6762305be6f942db235f1afdca305095`.
- Beginner: фото гарантировано при >=2 вопросах и наличии в разрешённом пуле; разные family в приоритете, при нехватке — добор уникальных ID без расширения пула.
- Отчёт: 1000 beginner/10 — 0 без фото, 0 повторов family; 1000 mixed/10 совпали с базой. Сохранённые попытки не пересэмплируются.
- Следующий этап: ручное решение 14 REVIEW по учебному уровню, затем проектирование пятиуровневого UI/фильтра с совместимостью старых экзаменов; фотоархив Drive — отдельный будущий отбор, без автоматической публикации.


### UX: «Тестирование» вместо «Экзамен», отдельные режимы и шуточные тесты (план)
- Переименовать текущий раздел «Экзамен» в **«Тестирование»** во всех пользовательских точках входа, **включая карточку/кнопку на главной**, навигацию, заголовки, подписи и мобильную версию. Сохранить внутренние ID, сохранённые попытки и маршруты совместимыми; не делать слепую замену технических названий.
- В будущем отдельный **«Экзамен»**: лимит времени, без подсказок, результаты только в конце, порог сдачи, история попыток; доступность по уровням после достаточного наполнения банка.
- Режимы развития: обучение; тестирование (5 независимых уровней); диагностика знаний; адаптивная «Прожарка»; экзамен; готовность к профессии; сквозной показатель мастерства; в перспективе соревнования.
- **Шуточные тесты**: отдельная развлекательная категория с забавными сценариями из жизни сетевика, юмористическими ответами и результатами. Не подмешивать в профессиональный банк, экзамены, мастерство, диагностику и статистику компетенций; без фальшивых сертификатов. Примеры: «Какой ты сетевик после ночной аварии?», «Сколько патч-кордов выдержит твоя психика?», «Твой тотемный сетевой протокол». Публиковать только после отдельного согласования содержания.
- Реализация поэтапно, маленькими PR с регрессионными тестами; сначала терминология и главная, потом 14 REVIEW и 5 уровней, затем диагностика/прожарка, после — полноценный экзамен и шуточные тесты. Production не трогать без отдельного разрешения.


### Этап UX-1 — стартовый экран и терминология тестирования (ветка `feat/testing-entry-labels`)
- Первый маленький PR: верхняя навигация «Тестирование», мобильная «Тесты», поиск «Тестирование — Проверка знаний», тексты стартовых параметров и подтверждения замены попытки, режим обратной связи «Разбор в конце».
- Не менять внутренний `exam` tab ID, `feedbackMode='exam'`, сохранённые сессии и механику выбора вопросов: совместимость важнее косметического переименования кода.
- Проверить на десктопе и мобильном, включая перенос/ширину навигации; после проверки — staging merge. Production только по отдельному разрешению.
- Идея для следующего этапа: единый экран выбора направления (обучение, тестирование, практика, диагностика, прожарка), но без заглушек вместо работающих кнопок. Перед реализацией согласовать компоновку, чтобы не дублировать навигацию.


### Постоянный процесс PR (утверждён)
- В staging `apotet/my-gemini-mirror-site`: исполнитель сам проверяет diff, доступные CI/тесты, регрессии и совместимость; чистые PR самостоятельно merge без отдельного напоминания пользователя. При блокерах — исправить/передать на доработку и явно сообщить; не заявлять о запуске тестов, которые не запускались.
- В production `apotet/netops`: merge/deploy только после отдельного явного согласования пользователя.
- Старые открытые PR — аудит на актуальность относительно текущего main; не вливать массово, особенно старые CLI ветки. Устаревшие закрывать только после проверки их замещения.
- UX-1: [PR #175](https://github.com/apotet/my-gemini-mirror-site/pull/175) merged в staging, SHA `1a7907d6442e19f16d594ce4a43689a7d7ba9f88`. Проверен diff; независимая локальная сборка в этом проходе не запускалась.


### Аудит 15 старых открытых PR — первичная инвентаризация (15.11.2026)
Сверены метаданные и состав изменённых файлов всех 15 PR, затем проверено наличие ключевых файлов и ряда интеграционных маркеров в текущем staging main. **Это не эквивалент построчной проверки реализации или запуска тестов**. Не вливать старые PR автоматически.
- **Уже присутствует функциональная основа в main — проверить полноту и закрыть как superseded при подтверждении:** #131 (портовые карточки: `portDetails` и `TopologyPanel`), #130 (слои топологии: `topologyLayers`), #128 (контекстная теория: `scenarioTheory` и LessonView), #126 (STP config commands), #125 (show interface commands), #123 (show spanning-tree), #120/#119 (STP визуализация и forwarding), #116 (TopologyPanel), #98 (D-007 в NETOPS_DECISIONS), #28 (Cisco command catalog).
- **Нужно отдельно проверить или принять решение:** #151 (мобильный zoom: конфликт с main, zoom-маркеров в CliLabShell не обнаружено; возможно реализовано иначе), #96 (шуточный девиз, нет прямого подтверждения), #22 (исторический docs-only аудит), #13 (исторический аудит 56 L1–L2: файл в main отсутствует).
- Следующий проход: сравнить конкретные acceptance criteria каждого PR с main, проверить тесты/регрессии, закрыть подтверждённые дубликаты с комментарием и ссылкой на актуальную реализацию. Оставшиеся оформить как конкретные задачи, не переносить старые конфликтные ветки без адаптации.
- UX дальше: 14 REVIEW learning levels → пять уровней тестирования; затем диагностика/«Прожарка», полноценный экзамен, развлекательные тесты. Учитывать уже внедрённые функции при планировании.


### Аудит старых PR — фактические действия (15.11.2026)
- Закрыты без merge как superseded, с объяснением в PR: #98 (D-007 в текущем NETOPS_DECISIONS), #116 (TopologyPanel уже в main), #28 (commandCatalog уже в main). **Это проверка наличия и архитектурного замещения, не полный прогон регрессионных тестов.**
- #151, #96, #22, #13: оставлены открытыми; добавлены комментарии о необходимой предметной проверке.
- #131, #130, #128, #126, #125, #123, #120, #119: ключевые файлы/функциональная основа есть в main; для закрытия проверить полноту требований и тесты. Старые stacked PR не вливать повторно.
- Открытых PR после трёх закрытий: ожидается 12, проверить по GitHub при следующем проходе.


### Ревизия PR — второй проход (15.11.2026)
- Закрыты как superseded без merge с комментариями: #131, #130, #128, #126, #125, #123, #120, #119 — текущий main содержит соответствующие интеграционные модули и связи; #22 — исторический Cisco-first аудит уже не отражает нынешнюю CLI архитектуру.
- Остались 3 открытых PR: #151 (новые кнопки мобильного zoom, нужен перенос на текущий main и проверка UI), #96 (не внедрённая шуточная пасхалка CLI, низкий приоритет), #13 (исторический аудит 56 L1–L2; не подменять свежую классификацию 787 билетов). По всем оставлены уточнённые комментарии.
- Следующий рабочий этап: 14 REVIEW и подключение пяти уровней в «Тестировании». Не смешивать learning levels с Beginner/Applied/Advanced режимами CLI.
- Внимание: закрытие старых PR означает устаревание веток, а не сертификацию функциональности; для актуального main необходимы отдельные CI/регрессионные тесты.

- **Мобильная топология — продуктовая приёмка 15.11.2026:** пользователь подтвердил, что схема, инспектор и перемещение на телефоне работают хорошо. Старый конфликтующий PR #151 закрыт без merge как не требующийся; не переделывать мобильную топологию без конкретной регрессии. Открытыми остаются #96 (пасхалка) и #13 (архивный аудит).


### Тестирование — старт этапа классификации (15.11.2026)
- Создан [Issue #176](https://github.com/apotet/my-gemini-mirror-site/issues/176) на предметную проверку 14 REVIEW, с конкретными ID, текущими критериями и регрессионными тестами. Само решение уровней пока не принято; не выдавать Issue за готовую реализацию.
- Реестр `src/data/questionLearningLevels.json` уже в main: 787 ID, 773 ASSIGNED и 14 REVIEW. Уровни: 216/144/357/53/3; текущий UI по-прежнему использует старые beginner/mixed. Пять уровней подключать после проверки REVIEW отдельным маленьким PR.
- Защита: не менять существующие сессии и отбор вопросов без тестов; Expert с тремя билетами не считать полноценным экзаменом.


### Тестирование — терминология и расширение банка (15.11.2026)
- Пользовательское название «Экзамен» в текущем режиме заменено на «Тестирование»: UX-1 PR #175, а оставшаяся карточка «Смешанный экзамен» → «Смешанное тестирование» — [PR #178](https://github.com/apotet/my-gemini-mirror-site/pull/178), merged SHA `052b7935c4016e295652f988f6231f0c8f956477`. Внутренние exam ID и старые сессии сохраняются.
- Слово «Экзамен» резервируется для будущего отдельного режима: таймер, без подсказок, итог в конце, проходной порог, история попыток. Не переименовывать существующий testing обратно.
- [Issue #177](https://github.com/apotet/my-gemini-mirror-site/issues/177): расширить L4 «Диагностика» (53 билета) и особенно L5 «Эксперт» (3 билета); ориентир для обсуждения 20–30 новых экспертных кейсов с проверкой качества, не искусственным relabel. Полноценный экзамен L5 до расширения не запускать.
- Порядок: #176 (14 REVIEW) → интерфейс 5 учебных уровней → расширение L4/L5 (#177) → отдельный режим экзамена. Production без разрешения не трогать.

### ПРОЕКТ ДЛЯ ОБСУЖДЕНИЯ — билет → разбор → урок → термины → практика (15.11.2026)
**Статус: предложения, не утверждённое ТЗ; код не менять до обсуждения.** Новые сложные вопросы должны иметь маршрут изучения.
**Аудит текущего main:** 50 уроков в src/data/lessons/index.ts. Lesson.difficulty = beginner/applied/advanced (не пять уровней билетов). getLessonForQuestion возвращает первый совпавший урок по relatedQuestionIds, а не все. LessonView содержит plain-блоки и professional, StudyTextToggle, LessonTermTags, обратные ссылки на билеты и практику. GlossaryText поддерживает hover/focus/touch. Ограничение словаря в профессиональном тексте ExamReview снято в PR #228. Подсказки работают вне кода. У новых plain/pro-разборов проверить корректность профессионального переключателя и покрытие сокращений.
**Предложения:**
1. Контракт нового вопроса: primaryLessonId, optional relatedLessonIds, индивидуальные «Смысл» и «По делу», термины и аббревиатуры с раскрытием, при необходимости практика, проверенные ключ/дистракторы. Новую тему создавать только при недостаточности существующей, не плодить урок на каждый билет.
2. Навигация в обе стороны: билет → изучить тему → урок → связанные вопросы → практика; возвращение в исходную попытку без потери состояния; до ответа не раскрывать ключ.
3. Разделить пять уровней сложности билетов и глубину уроков. Обсудить три ступени «База / Средний / Продвинутый» против четырёх с «Экспертными кейсами». «Смысл / По делу» — независимый переключатель стиля на каждой ступени.
4. Эталон урока: цель, предпосылки, наглядное объяснение, профессиональный механизм и ограничения, команды/диагностика, типовые ловушки, раскрываемые хештеги/сокращения, схемы по необходимости, практика и самопроверка. Ориентиры: SNI, STP, VLAN/SVI, оптика.
5. Автоматический CI gate для НОВЫХ билетов: есть реальный урок и двусторонняя связь, plain/pro, термины/аббревиатуры в glossary, валидные ссылки, нет битых PracticeLink. Для старых вопросов сначала отчёт о пробелах, без массового блокирования legacy.
6. Матрица покрытия questionId / level / lesson / plain / pro / glossary / practice / status; аудит L4/L5 и новых пакетов первым, затем весь банк. Проверка мобильного tap, hover, клавиатуры и ESC в обоих стилях.
7. Отдельный небольшой багфикс: профессиональные подсказки в ExamReview (enabled={!professional}) и аудит других мест отключения GlossaryText; без вмешательства в принятую мобильную топологию.
**Открытые решения:** три или четыре ступени глубины; расширять существующий урок или создавать отдельный; где показывать «Изучить тему» до ответа. После согласования внедрять малыми PR.

### Утверждено: экспертные кейсы внутри продвинутых уроков (15.11.2026)
- Три ступени учебного материала сохраняются: База / Средний / Продвинутый. **«Экспертные кейсы» — обязательный отдельный раздел/тип материала внутри продвинутой ступени, не четвёртая ступень**, с многошаговыми реальными сценариями, анализом наблюдений, альтернативными гипотезами, ограничениями и проверкой решений.
- Экспертные билеты L5 должны ссылаться на конкретный экспертный кейс или достаточный продвинутый урок; кейс связан обратно с вопросами, терминами, plain/pro объяснениями и CLI/практикой при применимости.
- В расширении банка #177 проверять покрытие экспертных кейсов одновременно с созданием новых L5 вопросов; не создавать голые вопросы без маршрута изучения. Три существующих L5 тоже включить в матрицу покрытия.
- Это утверждённое решение владельца; внедрение отдельными малыми PR после аудита покрытия.


### Макет тестирования — зафиксированный промежуточный UX (15.11.2026)
- В staging приняты как рабочий промежуточный вариант PR #184, #185, #186: компактные карточки режимов, выбор учебного уровня и количества вопросов в одной строке, режим вопросов по фото внутри выбора OSI, «Работа над ошибками» по 5 за сеанс и формулировка «На закреплении» с динамическим счётчиком.
- **Статус: оставить как есть до отдельной команды владельца.** Возможный следующий дизайнерский проход с Gemini — позже, после сравнения и согласования. Не переносить макет автоматически в действующее «Тестирование».
- «Путь пакета» — ключевая фишка страницы: сохранять идентичность с действующим разделом; **не менять код, поведение, анимацию, компоновку или интеграцию без прямого разрешения владельца**. Радар также не переделывать без запроса.
- Полноценный «Экзамен» — будущий отдельный режим, не смешивать с тренировкой; не возвращать устаревшие кнопки «Начать экзамен» в макет.
- Production `apotet/netops` — строго только по прямому разрешению.

### Следующий приоритет — заполнить пробелы банка и маршрутов обучения (после UX-макета)
- **Сначала инвентаризация покрытия**: матрица по учебным уровням L1–L5, OSI L1–L7, TCP/IP, темам, типу (фото/обычные), урокам, plain/pro разборам, glossary, связанным практикам и экспертным кейсам. Отдельно посчитать реально доступные вопросы на каждом пересечении, не считать объединённые группы L1–L2 и L5–L7 точной разметкой слоя.
- Текущая отправная точка классификации: 787 вопросов, 773 ASSIGNED, 14 REVIEW; L1=216, L2=144, L3=357, L4=53, L5=3. Цифры пересчитывать по реестру на актуальном HEAD; не считать объём равнозначным качеству.
- **Приоритет 1:** предметно разобрать 14 REVIEW (Issue #176) и устранить пробелы точной тематической разметки OSI/фото без ложного присвоения слоя.
- **Приоритет 2:** расширять слабо покрытые учебные уровни L4 «Диагностика» и L5 «Эксперт» (Issue #177), с упором на реальные сетевые инциденты, многошаговую диагностику, CLI, промышленные сети, оптику, L2/L3, TCP/IP. Для L5 ориентир 20–30 новых качественных кейсов на согласование, а не механическое переименование простых вопросов.
- **Приоритет 3:** закрывать выявленные пробелы L1–L3, по отдельным OSI-слоям и фото; расширять по матрице дефицита, а не равномерно «для цифры». Проверять наличие исходных изображений, недвусмысленный ключ и четыре адекватных варианта.
- **Каждый новый билет:** проверенный ответ и дистракторы; plain («Смысл») и pro («По делу»); связанный урок (3 учебные ступени: База / Средний / Продвинутый), раскрытые термины в glossary; для экспертных — экспертный кейс в продвинутом уроке; связь с CLI/практикой, когда применимо. Обратная навигация билет ↔ урок ↔ практика.
- Работать небольшими проверяемыми пачками и PR с отчётом PASS/FIX/REVIEW, регрессией отбора по уровням и запретом незаметно изменять существующие сессии. Сначала аудит/план пачек, затем наполнение. После достаточного покрытия вернуться к отдельному полноценному экзамену.

### Согласованная стратегия Grok + ChatGPT — аудит перед расширением банка (15.11.2026)
- Решение владельца: **не создавать отдельную runtime-матрицу или новую классификацию**. Отчёт по текущим `group × learningLevel` и тематическим пробелам; неоднозначные OSI L1–L2 и L5–L7 отмечать отдельно. Анализировать качество, а не только число билетов.
- Очерёдность: (1) рекомендации по 14 REVIEW (Issue #176; решения принимает владелец), (2) воспроизводимый аудит банка, дубликатов, тематического покрытия и связей, (3) пакет 12–15 качественных L4 диагностик, (4) первые 3 полноценных L5 кейса, (5) безопасность → мониторинг → Wi-Fi → облака, (6) повторный аудит. Объём пакетов — ориентир, корректируется по отчёту.
- L5 — многошаговые инциденты с несколькими источниками данных, конкурирующими гипотезами и обоснованием безопасного решения; не редкие вопросы на память. Для каждого нового билета качественный plain/pro разбор и корректный ключ; существующий урок переиспользовать, новый создавать только при реальном пробеле; практику привязывать там, где она проверяет навык.
- Первый этап для Codex **строго read-only**: текстовый Markdown-отчёт, без изменения файлов, коммитов, веток, PR, Issue, деплоя или публикации. В отчёте: commit SHA, источники и метод подсчёта, 14 REVIEW с доказательствами, `group × level`, фото/OSI неоднозначности, проверяемые тематические пробелы, точные и вероятные дубли с ID, реальное покрытие уроками/plain/pro/glossary/practiceLinks/CLI, приоритеты и предложения первого L4/L5 пакета. Отделять факт от гипотезы; не считать отсутствие прямой ссылки доказательством отсутствия учебного материала. Сравнивать актуальные данные с историческими цифрами 787/773/14.
- Проверяющий этап после создания новых пакетов — независимый второй проход с PASS/FIX/REVIEW, без автоматического принятия авторских ответов. Текущий UX тестирования, радар, «Путь пакета» и production не менять.
- Примечание: старое предложение «матрица по каждому OSI-слою × 5 уровней» выше в Roadmap заменено **аналитическим отчётом без новой архитектуры**; прежний ориентир 20–30 L5 кейсов — долгосрочная гипотеза, первый пакет — только 3.

### Результат read-only аудита Codex по HEAD `948cde613ee488f0b9b32e0876526756d34a1128` (15.11.2026)
- Источник: предоставленный владельцем текстовый отчёт Codex. **Числа и содержательные выводы пока не прошли повторную независимую проверку**; не маркировать весь банк PASS. Аудит не изменял код.
- Структура: 787 уникальных вопросов = 632 `questions.json` + 76 `questionsExtra.ts` + 79 `questionsExtraDifficulty.ts`; 773 ASSIGNED, 14 REVIEW; L1/L2/L3/L4/L5 = 216/144/357/53/3. Нормализованных точных дублей условий не найдено; выявлены семантические кандидаты `l4-08/l4-x01`, `tcp-02/tcpip-x02`.
- REVIEW: девять технических предложено перевести в ASSIGNED после утверждения владельцем (`gap-pack2-29` L3; `tcpip-x03`, `l4-x05` L1; `ts-x02`, `ts-x09`, `l4-d04`, `tcpip-d01`, `ts-d05`, `l3-vrrp02` L2). Пять фото-REVIEW остаются открыты до просмотра оригиналов; `l1v2-b-strip-hole` кандидат на переписывание. **Реестр пока не менять.**
- Обнаруженный долг: 20 L4 без отдельного pro-разбора (список ID — в отчёте Codex), отдельные рассогласования `l3-vrrp02`, `ts-d06`, `ts-d08`, `gap-pack2-29`; спорные дистракторы `l4-d02`, `ts-d04`, `ts-d06`, `ts-d08`. Наличие fallback не эквивалентно содержательному pro. Три L5 (`stp-new-13`, `l2-sec-07`, `l2-sec-12`) не являются многошаговыми кейсами; не понижать автоматически.
- Связи (по отчёту): 428 индивидуальных разборов, 202 вопроса через `relatedQuestionIds`, 26 прямых `practiceLink`; отсутствие прямой связи не доказывает отсутствие объяснения/практики. В `ExamReview.tsx` и `TheoryRazbory.tsx` pro tooltip отключён через `enabled={!professional}` — отдельная проверка/фикс с тестами; учебный ARP-MAC `00:11:22:gw:01:01` в `CliSimulator.tsx` некорректен.
- **Фотографии** разрешаются через внешний `apotet/osi-tcpip-exam-public/main`, поэтому для воспроизводимого визуального аудита требуется фиксировать и SHA фото-репозитория; фото не просмотрены.
- **Согласованный порядок после аудита:** (1) решение владельца по девяти REVIEW, визуальная проверка пяти фото; (2) небольшие отдельные исправления подтверждённых дефектов/разборов, без смешивания с новым контентом; (3) первая партия 12–15 L4 диагностик; (4) три L5 многошаговых кейса; (5) безопасность, мониторинг, Wi-Fi, облака; (6) повторный аудит.
- Для L4 брать темы с наблюдаемыми данными: ARP/DAI, VLAN/trunk, STP, FIB/uRPF, NAT, TCP/PMTUD, DNS/DHCP, оптика/OTDR, промышленные резервирования, мониторинг. Для L5 — (а) промышленное резервирование, (б) приложение через routing/NAT/firewall, (в) оптическая деградация под резервированием.
- **Никаких массовых правок, автоматического присвоения уровней, изменения UI, радара, «Пути пакета» или production без отдельного разрешения владельца.** Исправления и новые вопросы только после явной команды, с независимым PASS/FIX/REVIEW.

### Очередь работ по решению владельца — выполнять последовательно, без потери задач (15.11.2026)
**Порядок обязателен; завершение этапа подтверждать проверкой, затем переходить к следующему.** Staging — `apotet/my-gemini-mirror-site`; production `apotet/netops` не трогать без отдельной команды.
1. **Инвентаризация изображений**: собрать все используемые фото-URL/пути из всех трёх источников вопросов, определить их фактический источник в `apotet/osi-tcpip-exam-public`, проверить существование, форматы, размеры, лицензии/происхождение, дубли, битые ссылки и привязку к question ID. Зафиксировать SHA фото-репозитория и отчёт; не менять маршруты загрузки на этом шаге.
2. **Безопасный перенос фото в staging**: добавить оригинальные изображения в `public/images/questions/` без удаления исходников; учесть `base` GitHub Pages для staging и production, относительные/абсолютные URL, Vite, fallback. Отдельный минимальный PR после инвентаризации.
3. **Регрессия изображений**: автоматическая проверка ссылок и соответствия ID/файла, визуальная проверка репрезентативных фото, в том числе всех пяти REVIEW, мобильная/desktop проверка. Старый публичный фото-репозиторий не удалять, оставить резервом. Только после PASS переключать остальные пути; не публиковать в production автоматически.
4. **14 REVIEW**: девять технических — утвердить предложенные уровни владельцем, затем изменить реестр отдельным небольшим PR; пять фото — решить после проверки изображений, включая учебную цель `l1v2-b-strip-hole`. Не присваивать уровни автоматически.
5. **Качество старых вопросов**: проверить 20 L4 без отдельного pro, спорные объяснения и дистракторы, семантические дубли, некорректный MAC в CLI-демонстрации; делать маленькие независимые изменения с тестами, не менять интерфейс.
6. **Новые L4**: первый пакет 12–15 диагностических вопросов по аудиту с независимой PASS/FIX/REVIEW проверкой.
7. **Новые L5**: три многошаговых экспертных кейса (промышленное резервирование; NAT/маршрутизация/защита; оптика), затем независимая проверка.
8. **Следующие направления**: безопасность → мониторинг → Wi-Fi → облака; после — повторный аудит и обновление приоритетов.
**Ограничения:** «Путь пакета», радар, UI тестирования и production не менять без прямого разрешения; не смешивать миграцию картинок с контентными правками и расширением банка. Любой перенос с обратимым планом и проверкой.

### Решение владельца: единый фото-репозиторий, без дублирования (15.11.2026)
- **Это решение заменяет пункты 2–3 раздела «Очередь работ» о переносе фото в `public/images/questions/` staging и production.** Не копировать изображения в оба сайта.
- **Сейчас:** оставить существующий общий источник `apotet/osi-tcpip-exam-public` для staging `apotet/my-gemini-mirror-site` и production `apotet/netops`; не создавать новый репозиторий и не переносить фотографии без отдельной команды.
- **DONE — SHA-pinning staging (15.11.2026):** `apotet/my-gemini-mirror-site` использует единый `src/config/sharedAssets.ts` с закреплённым SHA `1c52fa81222167dc4377fe4788de86f3e36ad444`. Фото, credits.json и шпаргалки используют эту версию; Vite подставляет существующий `assets/cheatsheets/l3.webp` в og:image обоих HTML из той же конфигурации. Относительные пути вопросов сохранены, фотографии не копировались.
- **Production без изменений:** `apotet/netops` пока использует прежнюю схему ссылок через `main`; его переключение требует отдельной команды.
- **Следующий этап:** исправление и утверждение классификации 14 REVIEW по аудиту; в задачу SHA-pinning изменения вопросов, ответов, пяти фото-REVIEW и реестра уровней не входят.
- **На будущее (не сейчас):** возможно отдельное общее хранилище с названием вроде `netops-photos`. Если оно будет приватным, публичный GitHub Pages не сможет напрямую загружать оттуда изображения без отдельной безопасной схемы доставки; приватность исходного репозитория и публичная доступность опубликованных изображений — разные вещи.
- Старый общий фото-репозиторий не удалять, пока нет проверенной замены. Продолжить остальные этапы аудита/REVIEW/L4/L5 последовательно.

### Пять фото-REVIEW — визуальная проверка и назначения (15.11.2026)
- Проверены оригиналы на закреплённом SHA `1c52fa81222167dc4377fe4788de86f3e36ad444`; изображения, SHA-pinning и интерфейс не меняются.
- `photo-cable-colors` — **PASS → ASSIGNED L3**: выбрать подготовку окончания по видимому отсутствию коннекторов; условие, варианты, ключ и объяснение сохранены.
- `l1v2-a-contact-solid` — **FIX → PASS, ASSIGNED L1**: исправлен только imageAlt — контакт находится внутри прозрачного корпуса. Распознаётся профиль с тремя выступами; solid/stranded, AWG и допуски по фото не назначаются.
- `l1v2-b-strip-hole` — **FIX → PASS, ASSIGNED L1**: вместо цвета детали требуется выбрать подготовку к осмотру по видимому состоянию рабочей зоны. Четыре правдоподобных сочетания состояния губок/наличия волокна и действия, один ключ; новое объяснение не приписывает инструменту размеры или настройки. На фото губки разведены, волокна между кромками не видно; условие и imageAlt этого не сообщают. Это распознавание состояния, не диагностика неисправности.
- `l1v2-b-cleave-sequence` — **PASS → ASSIGNED L3**: применить заданные 15 мм к расположению отметок на фото; текст и ключ сохранены. 15 мм — условие карты работ, не универсальный допуск.
- `l1v2-c-closure-service` — **PASS → ASSIGNED L2**: связать видимое расположение вводов с доступом при обслуживании; текст и ключ сохранены. Фото не доказывает герметичность закрытой муфты.
- **Перекрытие подтверждено:** `photo-cable-colors` и `photo-cable-terminate` проверяют один навык. Минимальное решение — оставить как альтернативы в уже общей `family: photo-fiber-cable-12`, без искусственного усложнения или удаления существующего билета. Отбор при достаточном пуле не повторяет семейство; считать это одним навыком, а не двумя темами. При будущем сокращении дублей можно оставить `photo-cable-terminate`, но удаление сейчас не выполняется.
- Было 773 ASSIGNED / 14 REVIEW; стало **778 ASSIGNED / 9 REVIEW**, уровни **218 / 145 / 359 / 53 / 3**. Предварительный уровень пяти REVIEW был 1, назначенного уровня не было. Исторические auditRationale сохранены; новые решения и предыдущие контрольные суммы зафиксированы в baseline.
- Проверки: typecheck, production build, банк/уровни/семейства, четыре варианта и один ключ, SHA-pinning и ограничение области изменений. Пять точных ID проверены в Chromium desktop/mobile. Существующая защита не восстанавливает активную попытку со старыми вариантами изменённого стриппера; завершённые разборы сохраняют исторический снимок. Механизм восстановления не изменён.
- Фото-вопросов REVIEW не осталось. **Следующий этап — девять технических REVIEW**, без их автоматического утверждения в этой работе. Затем **независимая проверка Grok** пяти фото-вопросов и назначенных уровней; она ещё не выполнена. Production не менять.

### Закрытие девяти технических REVIEW

- Все девять получили проверенные учебные уровни. Реестр содержит 787 назначенных билетов и 0 REVIEW. По уровням 220 / 151 / 360 / 53 / 3.
- У всех девяти есть индивидуальное объяснение, профессиональный разбор и связанный урок. Для этих билетов доступны подсказки в обоих слоях. В пяти билетах добавлены связи с существующими уроками, в уроках дополнены карточки терминов.
- Уточнена формулировка диапазона IANA в `l4-x05`. Сохранённые попытки со старой формулировкой восстанавливаются с прежним ключом.

### Профессиональные разборы уровня «Диагностика»

- На `d9ea9f2` отдельного «По делу» не хватало у 17 из 53 билетов. Для всех 17 добавлены разборы с объяснением диагностического признака, проверкой и типичной ошибкой. Весь уровень теперь имеет 53 из 53 профессиональных разборов. Условия, варианты, ключи и уровни билетов сохранены.
- Исторические 20 относятся к прежнему аудиту.

### Дистракторы и смысловые дубли из аудита

- **FIX → PASS:** `l4-d02` (рост RTT и отбросов выходной очереди), `ts-d04` (нулевое окно приёма TCP), `ts-d06` (направление RTP при одностороннем звуке), `ts-d08` (наблюдаемые признаки потери состояния ARP, DHCP и UDP NAT при проверке по IP). Переписаны варианты, «Смысл» и «По делу». Привязаны существующие уроки про потери TCP, окно TCP и NAT. Добавлены подсказки PMTUD, SIP, RTP и SDP. Для уже начатой попытки восстанавливаются исходные условия, варианты и ключ.
- **Два смысловых дубля подтверждены.** `l4-08` / `l4-x01` → `tcp-rst-meaning`. `tcp-02` / `tcpip-x02` → `tcpip-application-mapping`. ID сохранены, обычный отбор отдаёт приоритет разным семействам для этих пар. При недостатке разных семейств добирает альтернативные формулировки до запрошенного размера. Повтор ошибок сохраняет заданный список.
- `l3-vrrp02` и `gap-pack2-29` перепроверены после закрытия девяти REVIEW. Разборы соответствуют условию VRRPv2 с включённым preemption и группировке встречных TCP-пакетов соответственно.
- В этапе качества старых вопросов остаётся отдельно проверить некорректный MAC в CLI-демонстрации перед пакетом новых L4.

### #177 — первый пакет «Диагностика»

- Подготовлены 12 новых L4 на вымышленных данных и открытых источниках. Оптика и OTDR, MRP, EtherChannel, IGMP, обратная маршрутизация IPv4, IPv6 RA, DHCP, DNS, захват TCP, NAT и QoS. После включения пакета банк содержит 799 билетов, из них 65 в «Диагностике» и 3 в «Эксперте».
- К каждому билету привязан профильный урок, два слоя разбора, подсказки к терминам и практическое упражнение. Для маршрутизации IPv4, DHCP и NAT есть переход в действующий тренажёр. Остальные упражнения работают по схеме, захвату или показаниям из билета.
- Независимое ревью PR #218. Первый проход дал 9 PASS, 3 FIX и 0 REVIEW. В обоих слоях урока об оптике добавлен двусторонний замер OTDR. В билете MRP теперь нужно выбрать первую проверку после замены коммутатора. IPv4 проверяет исправление маски и прогноз адреса ARP, упражнение ведёт к делу №1 в «Пути пакета». Повторная проверка дала 12 PASS, 0 FIX и 0 REVIEW.
- Следующая партия #177 содержит три многошаговых L5-кейса из согласованного плана.
- Источники для проверки условий и ключей. [SCALANCE MRP](https://docs.tia.siemens.cloud/r/en-us/v20/configuring-scalance-x/w/m/configuring-scalance-x/useful-information/redundancy-mode/mrp/mrp-media-redundancy-protocol), [Cisco CRC](https://www.cisco.com/c/en/us/support/docs/routers/asr-9000-series-aggregation-services-routers/225385-troubleshoot-interface-crc-errors-on.html), [Fluke Networks OTDR](https://www.flukenetworks.com/edocs/olts-otdr-complete-testing-strategy), [Cisco EtherChannel](https://www.cisco.com/c/en/us/support/docs/lan-switching/etherchannel/12023-4.html), [RFC 4541](https://www.rfc-editor.org/info/rfc4541/), [RFC 1122](https://www.rfc-editor.org/rfc/rfc1122.html), [RFC 4861](https://www.rfc-editor.org/rfc/rfc4861.html), [RFC 4862](https://www.rfc-editor.org/rfc/rfc4862.html), [RFC 2131](https://www.rfc-editor.org/rfc/rfc2131.html), [RFC 1034](https://www.rfc-editor.org/info/rfc1034/), [RFC 1982](https://www.rfc-editor.org/rfc/rfc1982.html), [Wireshark Offloading](https://wiki.wireshark.org/CaptureSetup/Offloading), [Cisco NAT](https://www.cisco.com/c/en/us/support/docs/ip/network-address-translation-nat/221481-8605-13.html), [Cisco QoS](https://www.cisco.com/c/en/us/td/docs/dcn/nx-os/nexus9000/106x/configuration/qos/cisco-nexus-9000-series-nx-os-quality-of-service-configuration-guide-106x/configuring-marking.pdf).

### #177 — пакет «Эксперт»

- [PR #219](https://github.com/apotet/my-gemini-mirror-site/pull/219) добавляет три многошаговых инцидента с отдельными продвинутыми уроками. Темы — MRP/VLAN на резервном пути, DNAT и асимметричный ответ, оптические потери и запас до возврата с резерва.
- Независимое ревью первого варианта дало 1 PASS и 2 FIX. Уточнены RM Status на SCALANCE и порядок проверки оптической линии. В кейсе DNAT добавлен явный откат временной маршрутизации. Повторная независимая проверка дала 3 PASS, 0 FIX и 0 REVIEW.
- Пакет перенесён поверх уже опубликованной работы Gemini. Существующие 859 билетов и их уровни сохранены. После добавления будет 862 билета, в том числе 88 «Диагностика» и 18 «Эксперт».

### Учебная база — IPv4 RFC 1918 (PR #241)

- Добавлен урок «IPv4: частные и специальные адреса» для билета `l3-12` с двумя независимыми стилями объяснения.
- Три диапазона RFC 1918, границы `/12`, сравнение с RFC 3927 и RFC 6598, диагностика Cisco/Linux.
- Связь билета с уроком зарегистрирована в реестре. Отдельный стенд не добавлен: подходящего упражнения пока нет.

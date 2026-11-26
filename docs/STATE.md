# NetOps — компактная карта состояния

## 26.11.2026 — Восстановление GLM-5.4 в OpenCode Coding Plan

[PR #435](https://github.com/apotet/my-gemini-mirror-site/pull/435), staging SHA `60f19d89565eeace8f21c32360cc8223c0cfaa8f`. Один каталог моделей используется в preflight и в окружении аудита. Контрольный запуск [#436](https://github.com/apotet/my-gemini-mirror-site/issues/436) нашёл GLM-5.4 в изоляции, подтвердил одинаковый SHA-256 `57f04a386a1edfce09e83ae211f266e58ffc681ae36b28c9c8aa9962035be9c5` и завершил один шаг модели с `stop`. [GitHub Actions](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45745128925) · [Исходный артефакт](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45745128925/artifacts/15083530928).

Исходный workflow отметил ответ как `incomplete` из-за вступления перед JSON. Обновлённый парсер принимает один однозначный JSON, в том числе в Markdown-блоке или после вступления, и сохраняет исходный ответ. Офлайн-повторная обработка подтвердила все 10 ожидаемых ID. Вердикты модели: 3 PASS, 2 FIX, 5 REVIEW, содержательная приёмка отдельно. Исходный расход: 9 037 входных, 720 выходных, 2 622 reasoning, 0 кэшированных токенов. Повторных вызовов модели не было.

## 2026-11-25 — Согласованный срез команды и подписок
Оценки субъективные по работе NetOps, не бенчмарк: Codex 9/10, Gemini 8.5, Kimi 8.5, ChatGPT 8, Grok 6, GLM-5.4 пока без оценки. Продлевать ChatGPT/Codex, Gemini, Kimi; Z.AI Coding Plan — испытательный месяц; Grok — кандидат на непродление, решение после повторной оценки перед окончанием оплаченного периода. Проверить Grok 4.7 Build BETA на изолированном прототипе сетевого тренажера, GLM-5.4 через подписочный OpenCode сначала на 10 вопросах L3, затем на разработке и аудите; оценивать качество, самостоятельность, переделки, время владельца и квоту. Не использовать обычный платный API. Роли: ChatGPT руководитель и техническая приемка, Gemini автор, Kimi независимый аудитор уроков, GLM аудитор вопросов, Codex интеграция/CI, Grok резерв и прототипы. Резерв при лимитах продолжает по SHA и отчету, не повторяет работу; независимый аудит не поручать автору. Владелец принимает содержание и публикацию. Перед интеграцией чистый main, один пакет — один PR, baseline отдельно, Drive для файлов, GitHub для заданий. Текущий приоритет #416/#417 затем #409; новые эксперименты после стабилизации. Повторный срез по фактическим результатам, дата пока не назначена.

**Состояние main при интеграции #418:** `40f96d81bb69d6cf9cec490c36effa64b8f9ecfc` (baseline PR #416 merged).
**Дата фиксации:** 2026-11-25.
**Источник истины по истории:** `docs/ROADMAP.md`.
Эта карта — оперативный снимок. Перед использованием сверять с main и открытыми PR/Issue.

**Координация:** Ромка (Grok), Issue #401. ChatGPT — окончательная приёмка уроков, не оперативное управление.

## Kimi-разработчик — подготовка 26.11.2026

Изменения существующего runtime готовятся в отдельном PR и не действуют до merge:
owner-команда для платного старта, расчётный бюджет $0.75/задача и $2/сутки UTC,
лимиты вызовов/токенов, ветка `kimi/*`, Draft PR и независимая приёмка. Оценка не
гарантирует стоимость провайдера и не включает другие Moonshot-клиенты. Пилот DNS
по #441: бюджет $0.25, платный запуск только после подтверждения владельца.

## Подтверждённое подключение Зайца — 25.11.2026

- Issue #414: https://github.com/apotet/my-gemini-mirror-site/issues/414 — completed, фактический ответ по tsconfig.json получен через zai-coding-plan/glm-5.4. Run https://github.com/apotet/my-gemini-mirror-site/actions/runs/45633970628; usage input 9295, output 32, reasoning 440, cache_read 8768, cache_write 0. Фактические кредиты и баланс сверить в кабинете Z.AI; стоимость OpenCode null не означает доказанный нулевой расход.
- Запуск: отдельный owner Issue [OPENCODE], точный комментарий `/opencode run zai-coding-plan glm-5.4 confirm-ci-terms`. Только Coding Plan, без обычного API, автоматических повторов и новых инфраструктурных изменений. Подтверждение владельца на CI получено; отдельного обязательного ответа поддержки нет.
- Заяц — независимый аудит вопросов уровня «Применение», первая партия 10 после завершения работы с Ромкой. Пока новых запусков не делать.

## Интеграция #418

PR #409 обновлён из main после baseline #416; все пять уроков сохранены. Девять anchors, glossary overlays и canonical owners проверяются в этой ветке; итоговый SHA и доказательства локального/Actions CI — в PR #409. Без merge/deploy и платных API; ветка #352 не изменяется.

## Приоритеты

1. PoE на приборе (`l1-poe-screen-reading`) — технически 9.5/10, #400 merged. Ждёт пользовательской приёмки опубликованного интерфейса. Не считать технический PASS за USER_APPROVED.
2. Первая пятёрка уроков L3 (LACP, LLDP, MTU/MSS, PTP, ACL) — интеграция в Draft PR feat/l3-batch1-integration-408 по исправленному пакету #406. Ждёт проверок и разрешения на merge. Не считать технический PASS за USER_APPROVED.
3. Следующая пятёрка — Issue #396 (Gemini). Готовится параллельно, интеграция только после проверки.
4. Уровень «Применение» — Draft PR #352, чужая ветка Геннадия. 376 вопросов; batch 28: 4 PASS / 4 FIX / 20 REVIEW. Не менять чужую ветку.
5. Избранное уроков — отдельная задача, не мешать контенту.

## Роли

| Кто | Задача |
|-----|--------|
| Ромка — Grok | Координация, интеграция, публикация |
| Геннадий — Gemini | Новые уроки L3 |
| Химик — Kimi | Независимая проверка уроков |
| Codex | Резерв для сложной разработки |
| Заяц — GLM-5.4 | Coding Plan работает; независимый аудит вопросов, старт после Ромки |
| Владелец | Окончательная приёмка уроков |

## Ограничения

- Не жечь деньги на фоновых API-агентах.
- Не устраивать повторные аудиты без конкретной причины.
- Для приборов и интерфейсов обязательна достоверная иллюстрация.
- Поддерживать ROADMAP и эту карту.
- Не выдавать технический PASS за USER_APPROVED.

## Открытые задачи

| Issue / PR | Суть | Статус |
|------------|------|--------|
| [#408](https://github.com/apotet/my-gemini-mirror-site/issues/408) | L3 batch 1 интеграция исправленного пакета #406 | OPEN, PR #409 обновляется по #418; без merge/deploy |
| [#401](https://github.com/apotet/my-gemini-mirror-site/issues/401) | Передача координации Ромке | OPEN, эта карта обновлена |
| [#400](https://github.com/apotet/my-gemini-mirror-site/pull/400) | PoE на приборе, 4 FIX | MERGED |
| [#395](https://github.com/apotet/my-gemini-mirror-site/issues/395) | Аудит первой пятёрки (Kimi) | OPEN, результатов пока нет |
| [#396](https://github.com/apotet/my-gemini-mirror-site/issues/396) | Следующая пятёрка (Gemini) | OPEN |
| [#352](https://github.com/apotet/my-gemini-mirror-site/pull/352) | L3 инвентаризация | Draft, чужая ветка |
| [#361](https://github.com/apotet/my-gemini-mirror-site/pull/361) | Kimi: порядок PoE под нагрузкой | Draft, не мержить автоматически |

---


## Исторический снимок (до передачи координации)

# NetOps — компактная карта состояния

**Состояние main перед этой записью:** `184f0d62a3370053d70af68e0bc615023d8f5c36`
Включает #365, Gemini recovery #378 и audit source SHA #381. Актуальный HEAD сверять в GitHub.
**Дата фиксации:** 2026-11-25
**Источник истины по истории решений:** `docs/ROADMAP.md` (полный журнал).
Эта карта — оперативный снимок. Полный ROADMAP читать только при необходимости.

**Обязанность поддерживать актуальность:** обновлять STATE при завершении существенных задач, изменении блокеров и принятии решений. Перед использованием сверять с актуальным main и статусами открытых PR/Issue. Устаревшая карта не является источником истины.

## Открытые задачи

| Issue / PR | Суть | Статус |
|------------|------|--------|
| [#368](https://github.com/apotet/my-gemini-mirror-site/issues/368) | Восстановление Gemini через [GEMINI] Issue | Смержен (#369/#371), audit-only; edit требует отдельной интеграции с опубликованным runtime |
| [#366](https://github.com/apotet/my-gemini-mirror-site/issues/366) | Компактный контекст агентов и журнал проблем | Смержен (#367) |
| [#364](https://github.com/apotet/my-gemini-mirror-site/issues/364) | Аудит расхода токенов | Отчёт опубликован |
| [#361](https://github.com/apotet/my-gemini-mirror-site/pull/361) | Kimi edit: порядок проверки PoE под нагрузкой | Draft, ожидает приёмки владельцем |
| [#365](https://github.com/apotet/my-gemini-mirror-site/pull/365) | Unified ZAI/Kimi tasks | Смержен после независимой приёмки; merge `ca8a88f`, [CI PASS](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45554453147) |
| [#376](https://github.com/apotet/my-gemini-mirror-site/issues/376) / [#382](https://github.com/apotet/my-gemini-mirror-site/issues/382) | Независимый аудит L3-01 Зайцем | Запущен, audit-only; отчёт/usage ожидаются в run 45557155832 |
| [#352](https://github.com/apotet/my-gemini-mirror-site/pull/352) | L3 инвентаризация | Ветка Геннадия, не трогать |
| [#358](https://github.com/apotet/my-gemini-mirror-site/issues/358) / [#356](https://github.com/apotet/my-gemini-mirror-site/issues/356) | ZAI аудит PoE на приборе | Выполнены, отчёты есть |

## Последние решения

- #391: OpenCode обоих провайдеров без искусственного steps=3, прежние timeout/read-only/owner commands/claim/no-retry сохранены. result.json и Issue-итог различают completed/incomplete/failed/interrupted, учитывают usage и ссылаются на архив. Платные вызовы при разработке не выполнялись; следующий тест — отдельный Issue по l1-poe-screen-reading, #388 не повторять.

- #389: точный owner comment `/opencode run zai glm-5.3 accept-budget-risk` и Coding Plan команды `confirm-ci-terms` в [OPENCODE] Issue. Trusted main, single-use claim/concurrency и запрет повторов сохранены; steps=3 у обоих провайдеров. Платный тест #388 не запускался.

- OpenCode: подготовлен отдельный PR для штатного `zai` (GLM-5.3, существующая ссылка на `ZAI_API_KEY`) наряду с Coding Plan. Токены/оценка стоимости в artifact и Job Summary; бюджет первого API теста $1, цель $0.20. Standard API GLM-5.4 ещё недоступна по документации. Provider-side hard cap не подтверждён и не требуется: для будущего API запуска нужно явное согласие владельца с риском превышения цели $0.20 и планового бюджета $1. Steps=3, учёт и запрет повторов сохранены; платный тест не запускался.

- #384: подготовлен отдельный OpenCode CLI 1.19.6 workflow (Draft), по умолчанию offline dry-run; первый этап audit-only с самостоятельным чтением/поиском в checkout репозитория; [CI smoke реальной установки/версии без модели PASS](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45567465538). Платный smoke не запускался. CI-допустимость подписки требует подтверждения владельца; инструкция `docs/OPENCODE_CODING_PLAN.md`. Существующие агенты не изменены.

- 25.11.2026: Gemini recovery (#378, SHA 9f2349cd). До 4 попыток на явные 503/429, backoff+jitter, Retry-After, после двух 503 на Hydrogen переход на Flash. Smoke #380: 4×503, генерации нет.

- #377 устранён: [PR #381](https://github.com/apotet/my-gemini-mirror-site/pull/381) merged `8cf3ece3035c490890d0f8766fd536edf4be46b4`. 54 runtime-регрессии, Gemini/resolver, Docker CI и Fast PR gate PASS. По уже выданному разрешению запущен ZAI L3-01: [Issue #382](https://github.com/apotet/my-gemini-mirror-site/issues/382), [Run 45557155832](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45557155832), исходное задание #376. Durable checkpoint проверен: source `491dfd894f229239eb54011f5970fd3b5b45263e`, trusted main `184f0d62a3370053d70af68e0bc615023d8f5c36`, audit-only, первая попытка reserved. Итог отчёта/usage ожидается в Issue; это не повторный запуск. Ветка Геннадия и #352 не изменялись.

- 25.11.2026: независимая приёмка #365 пройдена; по прямому разрешению владельца PR выведен из Draft и слит. Merge `ca8a88fb6eda6a1af1db65c4d7ec671bcee3b49d`, принятый head `50a7bdc11bd3423a548c36ae2c5003bfe32f8a07`. [Runtime CI](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45554453147) и [Fast PR gate](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45554453255) — SUCCESS: 49/49 runtime, 11/11 Gemini, 12/12 resolver, полный Docker pipeline. Платные вызовы не запускались и пока не разрешены. #361 остаётся Draft; ветка Геннадия не затронута.

- 25.11.2026: #365 финализирован по [замечаниям приёмки](https://github.com/apotet/my-gemini-mirror-site/pull/365#issuecomment-7153787056): partial SSE сохраняется durable без повтора; STATE/стандарты передаются всем новым задачам без дублей; decoded/assembled content проверяется до validation/publication; control plane Gemini и инструкции защищены от broad scope. На коде `89001e755fa8e8ede6d46445a14c4f450124feae` CI PASS: 49/49 runtime, 11/11 Gemini, 12/12 resolver, Docker isolation и полный sandbox pipeline; [Fast PR gate PASS](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45554268526). На этапе исправлений платных вызовов 0; последующее разрешённое слияние зафиксировано выше.
- Gemini #369/#371 сохранён без изменений: отдельный Interactions API audit-only агент. Этот PR не включает Gemini edit/publisher и не активирует платный запуск.

- 25.11.2026: Gemini Interactions API (#371, SHA 1a12583). generateContent 404 причина неизвестна; агент переведён на POST /v1beta/interactions, store:false, модель gemini-4-hydrogen. Платный тест Grok не запускал.
- 25.11.2026: Gemini [GEMINI] Issue агент смержен (#369, SHA da89b639). Аудит и публикация отчётов готовы; edit требует отдельной интеграции.
- 25.11.2026: разрешение Actions на создание PR включено; publisher Kimi исправлен и смержен (#362).
- 25.11.2026: первый Kimi edit (#360) выполнен, Draft PR #361 ожидает приёмки.
- 25.11.2026: аудит токенов (#364) зафиксировал избыточность полного чтения ROADMAP; согласована эта карта и журнал проблем (#366).
- Снятие потолка $0.25 согласовано и реализовано для ZAI/Kimi в #365; теперь опубликовано в main. Gemini сохраняет собственный текущий контракт.

## Блокеры

- Нет локальных логов Codex/Claude для 14-дневного baseline токенов (UNVERIFIED).
- Ветка L3 (`work/applied-l3-20261124`) остаётся чужой рабочей веткой; не изменять.
- Gemini: edit и Draft publisher остаются отключены; merge #365 сам по себе их не включает. Платный тест агента не запускался (проведёт ChatGPT).

## Роли (предварительно)

| Роль | Назначение |
|------|------------|
| Codex | Сложная разработка и инфраструктура |
| Gemini | Глубокий аудит и новые уроки |
| ZAI / Kimi | Реализация и редактирование по чёткому заданию |
| Grok | Вспомогательные проверки, поиск, отчёты |
| Скрипты / CI | Детерминированные проверки |

Роли ZAI/Kimi предварительные; пересмотреть по результатам повторного замера.

## Как использовать

1. Новая задача — новая сессия. Не продолжать длинный чат ради экономии.
2. Читать эту карту первой, **если её содержимое передано в контекст или доступно через инструмент**. API-агент без доступа к файлам не использует STATE по одной ссылке — обязательный контекст передаётся явно. ROADMAP — только если нужна история конкретного решения.
3. Обязательные стандарты качества (`docs/LEARNING_CONTENT_STANDARD.md`) и контур безопасности агентов сохраняются.
4. Передача состояния между этапами — структурированный handoff (SHA, прочитанные файлы, открытые вопросы), не полный чат.
5. Перед предложением новой проверки — убедиться, что существующая (offline-тесты, Fast PR gate, AST) не покрывает случай.


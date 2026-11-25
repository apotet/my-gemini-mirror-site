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

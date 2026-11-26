# NetOps — архив ROADMAP

[Текущая дорожная карта](ROADMAP.md) · [Регламент ведения](ROADMAP-MAINTENANCE.md)

## Снимок на 26.11.2026

[Исходный ROADMAP целиком](https://github.com/apotet/my-gemini-mirror-site/blob/d79778b462392b8a6a1b229c20083d96c8386023/docs/ROADMAP.md) закреплён за staging SHA `d79778b462392b8a6a1b229c20083d96c8386023`. Десять частей в таблице восстанавливают его побайтно в указанном порядке. Фрагменты лежат непосредственно в `docs/`, поэтому сохранён контекст относительных ссылок на отчёты, стандарты и планы.

[Предыдущая редакция ROADMAP до #457](https://github.com/apotet/my-gemini-mirror-site/blob/50e74e92fb38cbeb4bd5664549ef67f81326bd09/docs/ROADMAP.md) сохраняет заменённые формулировки и прежние номера строк.

Даты, статусы и вердикты внутри частей относятся к моменту записи. При сверке открытой задачи используйте актуальный GitHub Issue или PR. Действующий регламент — в [DEVELOPMENT_WORKFLOW](DEVELOPMENT_WORKFLOW.md), долговременные решения — в [журнале решений](../NETOPS_DECISIONS.md).

| Строки снимка | Часть | Поисковые ориентиры |
| --- | --- | --- |
| 1–200 | [Сверка 25–26 ноября](ROADMAP-history-2026-11-26-nov-and-integration.md) | Gemini-разработчик #457, Kimi checkpoint и DNS #451/#454, OpenCode GLM-5.4, PoE #440, первая пятёрка #409/#418, Gemini #378, #365 |
| 201–370 | [Runtime и публикация](ROADMAP-history-2026-11-agent-runtime-and-publication.md) | Общий runtime ZAI/Kimi, Gemini audit-only #369/#371, сокращение контекста #366, публикация Kimi #362 |
| 371–526 | [Аудиты Kimi и ZAI](ROADMAP-history-2026-11-kimi-and-zai-audits.md) | Первый Kimi edit #360/#361, подтверждение публикации, ZAI resolver и аудит PoE #358 |
| 527–688 | [Аудиты и регламент выпуска](ROADMAP-history-2026-11-review-and-release-policy.md) | #356/#357, избранное, HTTP 301/404, лёгкий CI #345, GATE-06, иллюстрация PoE #331 |
| 689–908 | [PoE и closeout](ROADMAP-history-2026-11-poe-and-understanding-closeout.md) | Инжекторы/сплиттеры, реальные аварии, staging #327, пользовательская приёмка бюджета PoE, решение closeout, партии вопросов |
| 909–1100 | [Интеграция «Углублённого (Understanding)»](ROADMAP-history-2026-11-understanding-integration.md) | 164 вопроса, карта блокеров, переходы к урокам, материалы Gemini Work, PR #282/#289 |
| 1101–1296 | [Доказательства аудитов Gemini](ROADMAP-history-2026-11-gemini-audit-evidence.md) | Пакеты Gemini App Work, исторические прогоны Flash/Hydrogen, HTTP 503, предметные партии |
| 1297–1526 | [«Основы (Fundamentals)» и качество банка](ROADMAP-history-2026-11-foundations-and-content-quality.md) | Именование сложностей, селектор «Базы» #256/#258, связи с уроками, партии «Основ», PR #228 |
| 1527–1713 | [Продуктовые и учебные планы](ROADMAP-history-2026-11-product-and-learning-plans.md) | Стандарт уроков, передача работы, приоритеты качества/CLI/CCNA, режимы тестирования |
| 1714–1885 | [Тестирование и общие ресурсы](ROADMAP-history-2026-11-testing-and-asset-history.md) | Ревизия PR, процесс приёмки, фото-репозиторий и SHA, закрытие REVIEW, #177 и #241, регламент результата 26.11 |

SHA-256 исходного и восстановленного снимка: `4a0fc94b5b6e6d80324905d2db1e4c08cd07d22a1b899636ee06267a1e0193ef`.

В исходных записях ссылка `docs/runbooks/GEMINI_API_AUDIT.md` встречается с лишним префиксом `docs/`. Действующий путь к [runbook аудита Gemini](runbooks/GEMINI_API_AUDIT.md).

## Действующие решения и правила

| Тема | Где читать |
| --- | --- |
| Архитектура тестирования и CLI Lab | [Журнал решений D-003–D-008](../NETOPS_DECISIONS.md#d-003-staging-и-production-строго-разделены). [Макет тестирования, «Путь пакета» и радар][testing-layout]. [Общий фото-репозиторий и SHA-pin staging][shared-assets]. |
| Качество обучения | [Учебный контракт и требования к визуализации](LEARNING_CONTENT_STANDARD.md#1-неизменяемый-учебный-контракт). [Три ступени уроков и экспертные кейсы][expert-cases]. [Терминология пяти уровней сложности][learning-levels]. |
| Независимая приёмка | [Действующий порядок проверок](DEVELOPMENT_WORKFLOW.md#публикация-и-приёмка) и [доказательства для ревизора](LEARNING_CONTENT_STANDARD.md#5-автономная-приёмка-без-микроменеджмента-владельца). Для небольших правок объём независимого предметного аудита определяется действующим регламентом. Личную приёмку фиксирует владелец. [Правила приёмки Draft PR агентского runtime](AGENT_RUNTIME.md#исполнение-и-приёмка). |
| Взаимодействие агентов | [Рабочие инструкции](../AGENT.md#контекст-и-сессии), [handoff по D-002](../NETOPS_DECISIONS.md#d-002-при-смене-исполнителя-сначала-восстанавливать-контекст), [решение о взаимозаменяемости][agent-handoff] и [регламент проверяемого результата][verified-result]. Автор передаёт SHA, открытые вопросы и доказательства. Независимая приёмка остаётся отдельной от отчёта автора. |
| Права и контуры запуска | [Контракт runtime](AGENT_RUNTIME.md), [Kimi](KIMI_ISSUE_AGENT.md), [ZAI](ZAI_ISSUE_AGENT.md), [OpenCode](OPENCODE_CODING_PLAN.md), [Gemini audit-only](GEMINI_ISSUE_AGENT.md) и [Gemini-разработчик](GEMINI_DEV_AGENT.md). Распределение текущих задач сверять в [STATE](STATE.md) и GitHub. |

[testing-layout]: ROADMAP-history-2026-11-testing-and-asset-history.md#макет-тестирования--зафиксированный-промежуточный-ux-15112026
[shared-assets]: ROADMAP-history-2026-11-testing-and-asset-history.md#решение-владельца-единый-фото-репозиторий-без-дублирования-15112026
[expert-cases]: ROADMAP-history-2026-11-testing-and-asset-history.md#утверждено-экспертные-кейсы-внутри-продвинутых-уроков-15112026
[learning-levels]: ROADMAP-history-2026-11-foundations-and-content-quality.md#терминология-пяти-уровней-сложности--утверждено-владельцем-19112026
[agent-handoff]: ROADMAP-history-2026-11-product-and-learning-plans.md#принцип-взаимозаменяемости-ии-исполнителей-16112026
[verified-result]: ROADMAP-history-2026-11-testing-and-asset-history.md#26112026--обязательный-регламент-результата

## Выпуски после снимка

Добавлять здесь ссылки на последующие выпуски с датой, темами и диапазоном записей. Перед переносом записи из дорожной карты убедиться, что выпуск содержит её источник и доказательства.

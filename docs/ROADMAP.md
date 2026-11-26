# NetOps — дорожная карта

Срез staging `main` на 26.11.2026 · [`ff3fe736`](https://github.com/apotet/my-gemini-mirror-site/commit/ff3fe73696aabbf53caf57c8a9aaf2b270bf48f8). Перед началом задачи сверить актуальный SHA и статус связанного Issue или PR. Оперативный контекст исполнителя — в [STATE](STATE.md).

## NETOPS-FEDOT-2026-11-26

- Федот — основной автономный руководитель и исполнитель NetOps. В согласованной глобальной задаче он разрабатывает контент, исправляет ошибки, делегирует, организует независимую приёмку, выполняет merge и deploy по регламенту. [Решение и границы полномочий](STATE.md#netops-fedot-2026-11-26).
- Основные дополнительные исполнители: Заяц (OpenCode / GLM-5.4 / Z.AI Coding Plan) и Геннадий (Gemini). Codex и Work — преимущественно сложные задачи для экономии агентных лимитов ChatGPT; Химик и Семёныч — резерв.
- Независимая приёмка обязательна, самоприёмка запрещена. Использовать возобновляемые квоты, не делать бессмысленных повторных запусков.
- **Глобальная разработка L3 на паузе.** Перенос завершён: N5 `3df2cb7a`, [PR #6](https://github.com/apotet/netops/pull/6), [deploy ✓](https://github.com/apotet/netops/actions/runs/45894920722). [PASS, проверка сайта и откат N4 `dc205a85`](STATE.md#выпуск-n5). Откат через отдельный revert PR, CI и разрешение владельца; хранилище браузера не очищать.

## Приоритеты

| Приоритет | Задача | Статус и следующий шаг |
| --- | --- | --- |
| 1 | PoE на приборе (`l1-poe-screen-reading`) | Правки по аудиту [#440][issue-440] вошли в `main` через [#449][pr-449] (`04aa250`). Требуется личная приёмка владельцем опубликованного урока. |
| 2 | Следующая пятёрка уроков «Прикладной (Application)» | Открыт [#396][issue-396]; глобальная работа по L3 на паузе. Первую пятёрку (LACP, LLDP, MTU/MSS, PTP, ACL) интегрировали через [#409][pr-409] (`3ce4599`). Проверить независимую приёмку следующей партии перед интеграцией. |
| 3 | Банк «Прикладной (Application)» | Открыт [PR #352][pr-352], рабочая ветка Геннадия. 376 вопросов в инвентаризации. Ход независимой приёмки первой партии — [#376][issue-376]. Сохранять существующую ветку и результаты проверок. |
| Сквозной приоритет | Качество банка и разборов | Исправлять подтверждённые дефекты и проверять связи вопрос → урок → практика. Очередь пересчитывать по актуальному банку и [аудиту разборов](audits/explanations-quality-audit.md). |
| Параллельно | Развитие Cisco CLI | Стабилизировать схемы, фокус, сценарии и подсказки. Этапы — в [плане CLI](development/cli-learning.md). |
| В очереди | Избранное уроков, реальные аварии, расширение банка | [Избранное][favorites] — отдельная задача с UX на согласование. [Реальные аварии](REAL_INCIDENTS_BACKLOG.md) — отдельная инициатива. [План расширения](QUESTION_BANK_EXPANSION.md) сверять с текущим банком перед каждой пачкой. |
| Отложено | CCNA Ready | После приоритетных работ по качеству банка и отдельного решения владельца. [Основание][ccna]. |

## Блокеры и точки приёмки

- Личная приёмка владельцем ожидается для урока «PoE на приборе» и отдельно для урока «PoE-инжекторы и сплиттеры» ([#328][issue-328]). В N5 оба `needs-review`; техническая и личная приёмка фиксируются отдельно.
- Уточнение порядка проверки PoE под нагрузкой остаётся в открытом [PR #361][pr-361] и ждёт приёмки владельцем.
- Маршрут Gemini-разработчика вошёл в `main` через [#457][pr-457]. Живой пилот заблокирован в коде и требует отдельного решения владельца. [Условия запуска](GEMINI_DEV_AGENT.md). Аудитор `[GEMINI]` работает по [своей инструкции](GEMINI_ISSUE_AGENT.md).
- Kimi-пилот DNS [#451][issue-451] остановился по лимиту вывода. Отчёт остаётся в отдельном [Draft PR #454][pr-454].

- [Техдолг N5 и критерии закрытия](STATE.md#технический-долг-n5): `l2-security.test.mjs`, `practice-links.test.mjs`, `study-text.test.mjs`.

## Действующие решения

- [Регламент разработки](DEVELOPMENT_WORKFLOW.md) определяет базовые и адресные проверки, ручные тяжёлые проверки и порядок публикации staging. Для production `apotet/netops` действует отдельное разрешение владельца.
- [Журнал решений](../NETOPS_DECISIONS.md) фиксирует архитектуру банка вопросов и CLI Lab, учебные связи и границы staging/production. [Стандарт учебных материалов](LEARNING_CONTENT_STANDARD.md) задаёт контракт уроков и разборов. [Именование уровней][levels] использует русское название сложности и английское в скобках. Уровни OSI обозначаются как OSI L1–L7.
- [Правила независимой приёмки и взаимодействия ИИ][contracts] указывают, где закреплены требования к ревизору, передаче задачи и проверяемым доказательствам.
- Расходы и допустимые команды конкретного агента описаны в его инструкции. Kimi запускается владельцем, изменения продолжения по checkpoint вошли в [#450][pr-450] и [#455][pr-455]. OpenCode-автор GLM-5.4 вошёл в [#446][pr-446]; автономная публикация пока не подтверждена, см. [#448](https://github.com/apotet/my-gemini-mirror-site/pull/448).
- [Общие ресурсы staging][assets] закреплены за SHA фото-репозитория. Перенос фото и переключение production требуют отдельного решения.

- [NETOPS-L2-CLOSEOUT-2026-11-22](IN_DEPTH_CLOSEOUT_DECISION_20261122.md) описывает приёмку «Углублённого (Understanding)». Для текущих изменений действует регламент разработки от 24.11.2026.

## История и ведение

[Указатель архива ROADMAP](ROADMAP-ARCHIVE.md) ведёт к исходным записям с PR, SHA, CI, вердиктами и артефактами. [Регламент ведения ROADMAP](ROADMAP-MAINTENANCE.md) описывает, как обновлять этот файл и архив.

[contracts]: ROADMAP-ARCHIVE.md#действующие-решения-и-правила
[pr-352]: https://github.com/apotet/my-gemini-mirror-site/pull/352
[pr-361]: https://github.com/apotet/my-gemini-mirror-site/pull/361
[pr-409]: https://github.com/apotet/my-gemini-mirror-site/pull/409
[pr-446]: https://github.com/apotet/my-gemini-mirror-site/pull/446
[pr-449]: https://github.com/apotet/my-gemini-mirror-site/pull/449
[pr-450]: https://github.com/apotet/my-gemini-mirror-site/pull/450
[pr-454]: https://github.com/apotet/my-gemini-mirror-site/pull/454
[pr-455]: https://github.com/apotet/my-gemini-mirror-site/pull/455
[pr-457]: https://github.com/apotet/my-gemini-mirror-site/pull/457
[issue-328]: https://github.com/apotet/my-gemini-mirror-site/issues/328
[issue-376]: https://github.com/apotet/my-gemini-mirror-site/issues/376
[issue-396]: https://github.com/apotet/my-gemini-mirror-site/issues/396
[issue-440]: https://github.com/apotet/my-gemini-mirror-site/issues/440
[issue-451]: https://github.com/apotet/my-gemini-mirror-site/issues/451
[favorites]: https://github.com/apotet/my-gemini-mirror-site/blob/d79778b462392b8a6a1b229c20083d96c8386023/docs/ROADMAP.md#L560-L568
[ccna]: https://github.com/apotet/my-gemini-mirror-site/blob/d79778b462392b8a6a1b229c20083d96c8386023/docs/ROADMAP.md#L1558-L1582
[levels]: https://github.com/apotet/my-gemini-mirror-site/blob/d79778b462392b8a6a1b229c20083d96c8386023/docs/ROADMAP.md#L1319-L1334
[assets]: https://github.com/apotet/my-gemini-mirror-site/blob/d79778b462392b8a6a1b229c20083d96c8386023/docs/ROADMAP.md#L1824-L1832

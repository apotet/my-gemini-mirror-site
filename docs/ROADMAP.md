# NetOps — дорожная карта

Срез staging от 27.11.2026 · [`e13e5b0c`](https://github.com/apotet/my-gemini-mirror-site/commit/e13e5b0c59603533ffcc64a0d9f42f9d7397946c). Перед работой сверить GitHub. Оперативный контекст: [STATE](STATE.md).

## NETOPS-FEDOT-2026-11-26

- Федот координирует проект. Нужна независимая приёмка, самоприёмка запрещена. Заяц в приоритете. Геннадий работает через выделенный маршрут Hydrogen в пределах настроенных лимитов. [Полномочия](STATE.md#netops-fedot-2026-11-26).
- **L3: только согласованные задачи на зеркале.** Без глобальной переработки и переноса в production. [Пакеты #464, #466, #471, #476 и доказательства](STATE.md#27112026--подтверждённые-изменения-на-зеркале).
- **N5:** [архив исходного выпуска и откат на N4](ROADMAP-history-2026-11-n5-production.md). Откат через отдельный PR, CI и разрешение владельца; хранилище браузера не очищать.

## Приоритеты

| Приоритет | Задача | Статус и следующий шаг |
| --- | --- | --- |
| 1 | PoE на приборе (`l1-poe-screen-reading`) | Правки по аудиту [#440][issue-440] вошли в `main` через [#449][pr-449] (`04aa250`). Требуется личная приёмка владельцем опубликованного урока. |
| 2 | Уроки и разборы Applied на зеркале | Пакеты #409, #464, #466, #471 и #476 опубликованы. Далее пакет 4: точные ссылки Native VLAN/access L2 (`l2-07`, `l2-08`); сверить маршруты next-hop/LPM (`new-l3-next-hop`, `gap-pack1-02`); затем примеры подсетей и pro-разборы в существующих разделах (`tr-07`, `ts-pack1-15`). Очередь [#396][issue-396] на паузе; #383 и #352 вне пакета. |
| 3 | Банк Applied | 376 вопросов. Draft [#352][pr-352] и рабочую ветку Геннадия не изменять; учитывать [результаты проверок][issue-376]. |
| Сквозной приоритет | Качество банка и разборов | Исправлять подтверждённые дефекты и проверять связи вопрос → урок → практика. Очередь пересчитывать по актуальному банку и [аудиту разборов](audits/explanations-quality-audit.md). |
| Параллельно | NetOps Courses [#558](https://github.com/apotet/my-gemini-mirror-site/issues/558) | Этап 1: [проект](NETOPS_COURSES_ARCHITECTURE.md), не релиз; ждёт согласования. |
| Параллельно | Развитие Cisco CLI | Стабилизировать схемы, фокус, сценарии и подсказки. Этапы — в [плане CLI](development/cli-learning.md). |
| В очереди | Избранное уроков, реальные аварии, расширение банка | [Избранное][favorites] — отдельная задача с UX на согласование. [Реальные аварии](REAL_INCIDENTS_BACKLOG.md) — отдельная инициатива. [План расширения](QUESTION_BANK_EXPANSION.md) сверять с текущим банком перед каждой пачкой. |
| Отложено | CCNA Ready | После приоритетных работ по качеству банка и отдельного решения владельца. [Основание][ccna]. |

## Блокеры и точки приёмки

- После [production #7](https://github.com/apotet/netops/pull/7) плашка PoE-инжекторов и сплиттеров `approved`. «PoE на приборе» остаётся `needs-review`. [Доказательства и исходный N5](STATE.md#выпуск-n5-и-статус-poe).
- Уточнение порядка проверки PoE под нагрузкой остаётся в открытом [PR #361][pr-361] и ждёт приёмки владельцем.
- Обычный `[GEMINI DEV]` заблокирован ([#457][pr-457]); условия и отдельный Hydrogen описаны в [регламенте](GEMINI_DEV_AGENT.md). [Draft #475](https://github.com/apotet/my-gemini-mirror-site/pull/475) подтвердил sandbox и Draft-публикацию Hydrogen, не итоговую приёмку или разрешение на production.
- Kimi-пилот DNS [#451][issue-451] остановился по лимиту вывода. Отчёт остаётся в отдельном [Draft PR #454][pr-454].

- [Техдолг N5 и критерии закрытия](STATE.md#технический-долг-n5): `l2-security.test.mjs`, `practice-links.test.mjs`, `study-text.test.mjs`.

## Действующие решения

- **27.11.2026 · решение владельца:** уроки сложности «Начальный» (Beginner, `difficulty: beginner`) возвращаются на доработку, кроме явно принятых владельцем. Исключения сверять с [реестром личной приёмки](../src/data/lessons/reviewStatus.ts); публикация, CI и технический аудит её не заменяют. Принятые уроки не менять и использовать как образцы. Решение касается только уроков: банк вопросов, назначения учебных уровней, плашки статуса и выпуски не менять.
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

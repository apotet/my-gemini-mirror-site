## 25.11.2026 — Kimi Issue Agent: проверка #359 и первый edit-тест #360

Перед merge [PR #359](https://github.com/apotet/my-gemini-mirror-site/pull/359)
проверены финансовый потолок, порядок durable claim/пагинация, запреты rerun и
повторной попытки, текстовые ограничения edit и изолированный publisher.
Найден и устранён блокер: прежний AST skeleton не учитывал унарные операторы и
некоторые flags. Новый canonical AST print сохраняет их; отрицательные регрессии
проверяют `-1/+1`, `~1/-1`, `++/--`, `import type/value`. Исправление:
`f94c15533c2971849df56af47335d59357481cde`.
Новый набор **25/25 PASS**, shared offline **25/25**, tools **17/17**, security PASS;
typecheck/Python compile/diff check PASS. [Kimi CI 45523886851](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45523886851)
и [Fast PR gate 45523886864](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45523886864)
SUCCESS; после Ready [Fast gate 45524092193](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45524092193)
также SUCCESS. PR переведён в Ready и merged:
**`bd92795f7a49f488cccc2bbea5a4b2570c471fb5`**.
Автоматический [Pages run 45524183186](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45524183186)
SUCCESS; ручного deploy не было.

По отдельному разрешению владельца создан **один** [Issue #360](https://github.com/apotet/my-gemini-mirror-site/issues/360),
`edit`, `kimi-k3.1-pro`, `verification=structure`. Небольшая правка по подтверждённому
П3 аудита #358: один абзац о порядке сравнения коротким исправным восьмижильным
кабелем, измерении напряжения на PD под нагрузкой и различии allocated/потребления
в `professional.blocks[].body` блока «Когда переходить к измерениям на линии»
`cli-poe-diagnostics.ts`. Это не полное устранение П3 в l1-poe-screen-reading.
Полный вход **22743 UTF-8 байта**, max output **8192** включая reasoning.
Preflight: `((22743+2048)*4+8192*10)/1000000 = $0.181084`, потолок **$0.25**.
Общий максимально допустимый пакет инфраструктуры по-прежнему ограничен $0.246112.

[Run **45524251479**](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45524251479),
**run_attempt=1**, **1 платный вызов**, без retry/fallback. [Claim](https://github.com/apotet/my-gemini-mirror-site/issues/360#issuecomment-7149353630)
создан до вызова после preflight и baseline. Worker **SUCCESS**: SSE `[DONE]`,
`finish_reason=stop`, corrupt chunks=0, usage, exact-target extraction, text-only
и shared AST, typecheck. Publisher повторил AST и создал отдельную ветку
`kimi/agent-run-issue-360-45524251479`, но при создании PR получил **HTTPError**.
Точный HTTP status не сохранён; разрешение Actions на создание PR проверить не
удалось read-only API (403), поэтому причина не объявляется доказанной.
**Итог workflow FAILURE**, автоматическая публикация PR полностью не прошла.

Без повторного вызова модели и без rerun кандидат независимо сверен: существующая
ветка = проверенный артефакт = точно заказанное изменение **одного поля**, остальные
поля и файлы не менялись. Через подключённый GitHub владельца создан
[**Draft PR #361**](https://github.com/apotet/my-gemini-mirror-site/pull/361),
SHA **`3bf2cfc010de1d95171b1a882a8cc581a219aa89`**.
[Fast PR gate 45524757322](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45524757322)
**SUCCESS**: typecheck, build, quiz/navigation и PoE-регрессии. PR остаётся
**OPEN / Draft / mergedAt=null**. Изменение урока **не слито в main**.
[Комментарий о восстановлении](https://github.com/apotet/my-gemini-mirror-site/issues/360#issuecomment-7149437320).

Фактический usage: input **5349**, output **4076** (reasoning **257**), total **9425**.
**Точная стоимость не подтверждена:** API не вернул `cached_tokens`,
`accounting.cost_usd=null`. Консервативная верхняя оценка по usage **$0.062156**.
Billing headers подтверждают write-5m **5120**, write-1h **0**; при неизвестном
read/miss-разделении оставшихся 229 input tokens опубликованные тарифы дают
диапазон до налогов **$0.0510458–$0.051458**. При нулевых cache hits было бы
$0.051458; отсутствующее поле не объявляется доказательством нуля. Это расчётный
диапазон, не подтверждение фактического списания. Платных повторов нет.

Сохранены оригинальные [accounting](audits/kimi-first-edit-20261125-accounting.json),
[CHANGES модели](audits/kimi-first-edit-20261125-changes.md) и
[проверенные metadata/TTL/hashes](audits/kimi-first-edit-20261125-evidence.json).
[Artifact 14981402449](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45524251479/artifacts/14981402449)
SHA-256 `bf705455da568562e78f5fd3e02aea5a4c7f33e440143313ba17f605491ba99a` проверен.
Остаются отдельные задачи инфраструктуры: определить причину отказа автоматического
создания PR, сохранять безопасный HTTP status и сверить контракт необязательных
полей cache usage. До этого не заявлять полностью успешный автоматический edit smoke.
Ветка Геннадия не изменялась; учебная правка хранится только в Draft PR #361.

---

## 25.11.2026 — Химик: Issue trigger [KIMI] (Draft, ожидает независимой приёмки)

В ветке `feat/kimi-issue-trigger` реализован `.github/workflows/kimi-issue.yml`:
owner-only (`apotet` author/sender/actor), только issues opened, JSON `task` +
`target_files`, режимы audit-only/edit, существующий `MOONSHOT_API_KEY`.
Переиспользованы payload/SSE/extraction/AST инструменты ручного Kimi Agent.
Ручной `kimi-agent.yml` и инфраструктура Зайца не изменены.

До claim: строгие параметры/пути (1–4 flat lessons, без symlinks), полный вход,
лимиты контекста/стоимости и baseline typecheck. Затем durable claim с пагинацией,
один streaming POST, no redirect/retry, локальный spent-attempt и запрет rerun.
Edit: только текстовые литералы; полный AST guard запрещает внедрение кода/смену ID,
включая унарные операторы и import type flags (дополнительная проверка перед merge),
shared AST + компиляция + выбранная регрессия обязательны. Только после ворот —
отдельный чистый job, новая `kimi/agent-run-issue-*` ветка и Draft PR.
Main/параллельные ветки агент не перезаписывает; при изменившемся main — отказ.
Итог, usage, стоимость/явная верхняя оценка и артефакты публикуются в Issue.

Финансовый потолок **$0.25/Issue**. Модель `kimi-k3.1-pro`, high; вход до **39000
UTF-8 bytes**, framing 2048, output до **8192** (reasoning + ответ); консервативный
максимум **$0.246112**. Тарифы проверены 25.11.2026: input $2, cache read $0.20,
write 5m $2 / 1h $4, output $10 за 1M; preflight считает весь input по $4 с учётом
кеш-записи, а не игнорирует её. При неизвестной cache/TTL детализации точная
стоимость не выдумывается. Большие задания отклоняются без усечения.
Источники и формат: [KIMI_ISSUE_AGENT.md](KIMI_ISSUE_AGENT.md).

Офлайн: **25/25** новых тестов, shared Kimi **25/25**, tools **17/17**, security PASS;
в том числе в изолированном окружении без root node_modules, как Kimi offline CI.
Проверяются полномочия, пути, бюджеты, пагинация claim, повторы, SSE/usage, ошибки
компиляции/AST, подмена кандидата, stale main, ограничение создаваемой ветки и Draft PR.
Платных вызовов **0**. Учебные материалы и ветка Геннадия не изменялись.
Реализация не merged, deploy и боевые `[KIMI]` Issue до приёмки не запускались.

---

## 25.11.2026 — ZAI resolver опубликован; аудит PoE #358 завершён

[PR #357](https://github.com/apotet/my-gemini-mirror-site/pull/357) прошёл независимую
приёмку, переведён Draft → Ready и merged. Причина `mergeable=false`: конфликт
двух новых записей в начале ROADMAP после обновления main до `6ba3dde`.
Обе записи сохранены, ветка синхронизирована merge-коммитом
`df89be4358bd104b180c8b11f1ffac244973b796`.
Повторно: **12/12 Node**, включая **11/11 Python**, реестр **90/90**, без пропусков,
лишних ID или дублей; Python compile/diff check PASS. Fast PR gate прошёл до Ready
([run 45518977826](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45518977826))
и после Ready ([run 45519104119](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45519104119)):
typecheck, production build, quiz/navigation и все PoE-регрессии gate — SUCCESS.
Merge SHA: `108226fc72885d50d08f7fd085224aba1617dbf0`.
Автоматическая публикация после merge —
[Pages 45519204370](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45519204370) SUCCESS;
ручной deploy не запускался.

После merge создан **один** новый [Issue #358](https://github.com/apotet/my-gemini-mirror-site/issues/358)
от `apotet`, тело — точная копия исходного задания #356. Модель **GLM-5.3**, audit-only.
[ZAI run 45519266897](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45519266897)
**SUCCESS**, источник — merge SHA выше; **1 API call**, `finish_reason=stop`, без повторов.
[Claim](https://github.com/apotet/my-gemini-mirror-site/issues/358#issuecomment-7148676700)
и [полный отчёт в Issue](https://github.com/apotet/my-gemini-mirror-site/issues/358#issuecomment-7148716517)
подтверждены. Telegram: `message_id=20`, `configured_chat_matches=true` в job logs.

Пакет: **140 252 UTF-8 байта JSON**, сообщения с полным заданием и system prompt —
**144 846 байт** при лимите 200 000; полный целевой объект, полный эталон
`l1-poe-budget`, обязательные files и **7/7 полных связанных вопросов** сохранены.
Максимальная предварительная стоимость **$0.2496516**; финансовый потолок **$0.25**.
**Фактический usage:** input **31 258**, output **8 470**, из них reasoning **4 520**,
cache **0**, total **39 728**. Стоимость по возвращённому usage и тарифам:
`(31258 × $1.40 + 8470 × $4.40) / 1000000 = $0.0810292`.
Это расчёт по usage API, а не независимая сверка банковского списания.

Вердикт **модели**: **FIX, 4,5/10**. Главные замечания: закрепление в обеих вкладках,
исходящие связи с соседними уроками, методика измерений под нагрузкой,
интерпретация классов/мощности, пассивное питание и сверка показаний с фото.
Замечания и предложенные технические формулировки требуют проверки координатором;
они не приняты автоматически и не применялись. Фото, опубликованный UI и
непредоставленные источники остаются **UNVERIFIED**. Это не независимая приёмка
учебного материала и не воспроизведение оригинального промпта Геннадия.

Сохранены исходные [отчёт модели](audits/zai-poe-screen-20261125.md) и
[accounting/usage](audits/zai-poe-screen-20261125-accounting.json), без редакторских правок.
[Artifact 14979716452](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45519266897/artifacts/14979716452)
(30 дней): SHA-256 ZIP `c060fd6b651a7414f8071341630a4cca596bcaacf4a0ae0d507452fcef45ae7d`
проверен при скачивании. SHA-256 отчёта:
`496b91981ba76d66bb16a6e612c8195d4391292e835e492f891b31dad6980d02`.
Учебные материалы и ветка Геннадия не изменялись. Дополнительных платных запусков нет.

---


## 26.11.2026 — Gemini-разработчик и сверка состояния

[Draft PR #457](https://github.com/apotet/my-gemini-mirror-site/pull/457) добавляет
`[GEMINI DEV] ` в общий runtime. Старт и последующие разрешения на вызовы
выдаёт `apotet`. Приёмка проверила блокировку повторов, сохранение статуса HTTP 429
в checkpoint, изоляцию `/agent validate` от публикации и отдельную
публикацию проверенного кандидата в Draft PR. Новый маршрут не активен до merge.
Генерация Gemini API для приёмки не запускалась. Старый `[GEMINI] ` audit-only
проверен автономными тестами. [Команды и пример пилота](GEMINI_DEV_AGENT.md).
Исправления по независимой приёмке: проверка секретов до checkpoint и передачи
бинарного контекста, неизменяемая опубликованная ветка, лимит попыток Gemini.
Неполные ответы и тела ошибок теперь отбрасываются; пилот ограничен одной попыткой
и 2048 выходными токенами. Финансовый лимит требуется настроить вне runtime.

На момент сверки staging `main` — `50e74e92`, GitHub Pages — SUCCESS для
этого SHA. L3 batch 1 смержен через [#409](https://github.com/apotet/my-gemini-mirror-site/pull/409)
(`3ce45998`). Правки урока «PoE на приборе» по #440 смержены через
[#449](https://github.com/apotet/my-gemini-mirror-site/pull/449) (`04aa2503`).
Production `apotet/netops/main` — `dc205a85`.

## 26.11.2026 — Kimi: явный запуск и продолжение с checkpoint

[#450](https://github.com/apotet/my-gemini-mirror-site/pull/450) и
[#455](https://github.com/apotet/my-gemini-mirror-site/pull/455) в `main`.
При продолжении владелец может явно изменить лимиты задачи, сохранив частичный
ответ, учтённый расход и область записи. Расчётные бюджеты $0.75 на задачу по
умолчанию и $2 в сутки UTC сохраняются. Пилот DNS
[#451](https://github.com/apotet/my-gemini-mirror-site/issues/451) остановился
по лимиту вывода после одного разрешённого вызова (22 441 входной и 5 120
выходных токенов, расчётный диапазон $0.0957778–$0.096082). Draft PR с
исправлением DNS не создан. Документирование результата остаётся в
[Draft PR #454](https://github.com/apotet/my-gemini-mirror-site/pull/454).

## 26.11.2026 — #440: `l1-poe-screen-reading` исправлен по аудиту (Заяц)

По независимому аудиту [#440](https://github.com/apotet/my-gemini-mirror-site/issues/440) (вердикт FIX) в `src/data/lessons/foundation-coverage.ts` исправлены три существенных замечания; ключи самопроверки (простой режим B, A, A; «По делу» B, C, A, D, B), `relatedQuestionIds`, заголовки существующих блоков и соседние уроки не менялись. S1: в оба режима добавлен блок «Какой прибор что докажет» со сравнением светодиода на порту, базового PoE-тестера, тестера с имитацией нагрузки PD и диагностики на коммутаторе (прибор / что измеряет / чего нельзя вывести) и новой учебной схемой `public/lesson-images/poe-instrument-compare.svg`; явно указано, что `show power inline` показывает выделенную, а не фактически потребляемую мощность и какие приборы нужны для кейса с ИК. S2: у фото LinkRunner G2 честная подпись (пресс-кадр, сводка AutoTest «54.6V Class 4 UPOE 51.00…», обрезанная краем экрана), текст больше не приписывает фото поля, которых на нём нет; вместо отсутствующего «развёрнутого теста» переход ведёт на учебную схему полей внутри урока. Замена на `copper-poe-result.png` не выполнялась: файл лежит вне `public/lesson-images/` и недоступен инструментам автора. S3: кейс «ИК → перезагрузка» объяснён по цепочке рост тока → просадка на линии или лимит порта → перезагрузка, с числовым примером (52 В, 20 Ом, 0,12 и 0,3 А); добавлена простая версия кейса в режим «Смысл». Косметические замечания C1–C5 и необязательные улучшения в задачу не входили. Автор только редактировал файлы: `tsc`, `build`, тесты и браузер не запускались. Отдельный старый тест `scripts/poe-screen-reading-lesson.test.mjs` не входит в npm-скрипты и до этой правки расходился с уроком (ключи, файлы шпаргалок, состав `relatedQuestionIds`); файл лежит вне области автора.

## 26.11.2026 — Заяц-автор: workflow Draft PR из GLM-5.4

Новый `opencode-author.yml` (Draft PR, ждёт приёмки владельца). GLM-5.4 через Coding Plan правит `src/`, `docs/`, `public/lesson-images/` в изолированной копии без shell; diff проверяется `scripts/opencode_author_check.py`, затем lint/build; отдельный job без ключа модели открывает Draft PR. Одна попытка на Issue, merge/deploy нет, `opencode-audit.yml` не изменён. Реальный запуск модели не выполнялся.

## 26.11.2026 — Восстановление GLM-5.4 в OpenCode Coding Plan

[PR #435](https://github.com/apotet/my-gemini-mirror-site/pull/435), staging SHA `60f19d89565eeace8f21c32360cc8223c0cfaa8f`. Один каталог моделей используется в preflight и в окружении аудита. Контрольный запуск [#436](https://github.com/apotet/my-gemini-mirror-site/issues/436) нашёл GLM-5.4 в изоляции, подтвердил одинаковый SHA-256 `57f04a386a1edfce09e83ae211f266e58ffc681ae36b28c9c8aa9962035be9c5` и завершил один шаг модели с `stop`. [GitHub Actions](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45745128925) · [Исходный артефакт](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45745128925/artifacts/15083530928).

Исходный workflow отметил ответ как `incomplete` из-за вступления перед JSON. Обновлённый парсер принимает один однозначный JSON, в том числе в Markdown-блоке или после вступления, и сохраняет исходный ответ. Офлайн-повторная обработка подтвердила все 10 ожидаемых ID. Вердикты модели: 3 PASS, 2 FIX, 5 REVIEW, содержательная приёмка отдельно. Исходный расход: 9 037 входных, 720 выходных, 2 622 reasoning, 0 кэшированных токенов. Повторных вызовов модели не было.

## 26.11.2026 — Kimi-разработчик: владелец подтверждает платный API

Подготовлены изменения существующего runtime Kimi: создание Issue больше не запускает API; запуск только по точному owner-комментарию или подтверждённому ручному dispatch. Новые задачи ведут собственную ветку `kimi/*` и Draft PR, без merge/deploy, с обязательной независимой приёмкой. Настроены расчётные бюджеты $0.75 на задачу по умолчанию и $2 в сутки UTC, лимиты вызовов и токенов, общий журнал резервов до запроса и учёт известного расхода. Эвристика входа и тарифы не гарантируют денежный потолок; другие клиенты Moonshot в дневной журнал не входят. Пилот #451 по ссылке DNS из аудита #441 запланирован с $0.25, без платного запуска до отдельного подтверждения владельца. Изменения находятся в PR и действуют только после merge.

## 25.11.2026 — #418: завершение интеграции L3 batch 1 в PR #409

В существующую ветку влит main 40f96d8 с baseline #416; конфликт ROADMAP разрешён с сохранением обеих записей и решений STATE. Пять уроков и SVG сохранены. Исправлены фактический anchor 1444 (отдельный расчёт в обоих режимах), адресный ACL-кейс X/Y по условию вопроса и владельцы lowercase PTP-терминов после IN_DEPTH overlays; определения не переписывались. Добавлены регрессии девяти точных маршрутов/единственных owners и Chromium 375/1440 обоих режимов. Результаты полного локального и Actions CI, проверенный SHA и jobs фиксируются в PR #409. Без merge/deploy, USER_APPROVED и платных API; #352 не изменяется.

## 25.11.2026 — L3 batch 1: интеграция исправленного пакета #406 в Draft PR

Интегрированы пять уроков (LACP, LLDP, MTU/MSS, PTP, ACL) из исправленного пакета Issue #406 (аудит #395). Добавлены файлы уроков, SVG, регистрация в index.ts, 9 индивидуальных heading-links, обновления глоссария (новые ключи + обогащение PMTUD/Boundary Clock, LACPDU lessonId перенесён в inDepth). Базовый main 4a44c53. Draft PR feat/l3-batch1-integration-408. Без merge/deploy. Ожидает tsc/lint/build, регрессий и разрешения владельца.

---

## 25.11.2026 — Заяц: Coding Plan smoke #414 подтверждён

## 2026-11-25 — Согласованный срез команды и подписок
Оценки субъективные по работе NetOps, не бенчмарк: Codex 9/10, Gemini 8.5, Kimi 8.5, ChatGPT 8, Grok 6, GLM-5.4 пока без оценки. Продлевать ChatGPT/Codex, Gemini, Kimi; Z.AI Coding Plan — испытательный месяц; Grok — кандидат на непродление, решение после повторной оценки перед окончанием оплаченного периода. Проверить Grok 4.7 Build BETA на изолированном прототипе сетевого тренажера, GLM-5.4 через подписочный OpenCode сначала на 10 вопросах L3, затем на разработке и аудите; оценивать качество, самостоятельность, переделки, время владельца и квоту. Не использовать обычный платный API. Роли: ChatGPT руководитель и техническая приемка, Gemini автор, Kimi независимый аудитор уроков, GLM аудитор вопросов, Codex интеграция/CI, Grok резерв и прототипы. Резерв при лимитах продолжает по SHA и отчету, не повторяет работу; независимый аудит не поручать автору. Владелец принимает содержание и публикацию. Перед интеграцией чистый main, один пакет — один PR, baseline отдельно, Drive для файлов, GitHub для заданий. Текущий приоритет #416/#417 затем #409; новые эксперименты после стабилизации. Повторный срез по фактическим результатам, дата пока не назначена.

[Issue #414](https://github.com/apotet/my-gemini-mirror-site/issues/414), [run 45633970628](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45633970628): completed, фактический ответ по tsconfig.json через zai-coding-plan/glm-5.4. Usage: input 9295, output 32, reasoning 440, cache_read 8768, cache_write 0; фактическое списание кредитов и баланс не сверены. Отдельный dry-run 45633956699 не обращался к модели. Владелец подтвердил CI; отдельного ответа поддержки нет. Рабочий маршрут: owner [OPENCODE] Issue и комментарий `/opencode run zai-coding-plan glm-5.4 confirm-ci-terms`. Обычный API и автоматические повторы запрещены. Заяц назначен на независимый аудит вопросов «Применение»; первая партия 10 после завершения работы с Ромкой. До этого новых запусков нет. Инфраструктуру не менять.

---

## 25.11.2026 — PoE на приборе: схема полей и фото тестера

В урок `l1-poe-screen-reading` добавлены открытая схема полей экрана и фото LinkRunner G2. Явно разобран пример Requested 4 / Received 0 как несовпадение класса, а не обрыв. Ключи и соседние уроки не менялись.

---

## 25.11.2026 — #391: OpenCode без искусственного лимита шагов

Для audit-only обоих native провайдеров удалён steps=3 без нового лимита. Сохранены timeout CLI 600 секунд/job 15 минут, узкий scope, read-only, бюджетный риск (не hard cap), owner commands, single-use claim и no retry. Результат completed требует финального stop, exit=0 и явного COMPLETE модели; interrupted/incomplete/failed не выдаются за завершённый аудит. Архив расширен result.json; после исполнения в Issue публикуются краткий итог и числовой usage со ссылкой на artifact/run, без stderr/credentials. Отсутствующие/частичные данные неизвестны, не $0. Бесплатные регрессии включают более трёх шагов, таймаут, partial, error, incomplete и safe Issue publication. После CI merge разрешён задачей #391. Платная модель не запускалась. Следующий тест — отдельный Issue: l1-poe-screen-reading в src/data/lessons/foundation-coverage.ts, GLM-5.3 Standard API, тот же предмет аудита, цель $0.20 без гарантии; #388 не повторять.

## 25.11.2026 — #389: OpenCode запускается точной командой владельца

Добавлен issue_comment.created с allowlist трёх точных команд API/Coding Plan и проверками actor/автора apotet, owner [OPENCODE] Issue, не PR, trusted main. Текст комментария не исполняется как shell. Сохранены workflow_dispatch, прежняя single-use durable отметка, concurrency и запрет rerun/повторной оплаты. steps=3 применяются к обоим native провайдерам; secrets/accounting/audit-only сохранены. Бесплатные регрессии проверяют owner/unauthorized/malformed/duplicate/dry-run без модели. Платный smoke и тест #388 не запускались. После успешного CI слияние разрешено владельцем в задаче #389.

## 25.11.2026 — OpenCode: обычный Z.AI API наряду с Coding Plan

Подготовлены native provider zai/glm-5.3 и выбор существующего ZAI_API_KEY, без удаления Coding Plan, нового брокера или прямого API клиента. Подтверждена ссылка на имя секрета в zai-issue.yml; значение/наличие через Settings не читалось. GLM-5.4 пока только Coding Plan по официальной странице. Добавлены step_finish accounting в artifact/Job Summary, unknown при отсутствующем учёте, budget $1/target $0.20, native agent steps=3 и явное согласие владельца с риском превышения цели $0.20 и планового бюджета $1 перед будущим API запуском; обязательное подтверждение provider-side hard cap снято. Публичная документация не подтверждает Standard API key hard cap; клиентские параметры не выдаются за денежную гарантию. Проверки только offline/CI smoke без модели. Платный тест не запускался. Подробности: docs/OPENCODE_CODING_PLAN.md.

## 25.11.2026 — #384: минимальный OpenCode Coding Plan (Draft)

Отдельный workflow: owner-only [OPENCODE] Issue → dry-run; ручной запуск с моделью и Issue. Платный audit требует двух явных подтверждений владельца, main, первой попытки и durable single-use отметки в Issue. Один workflow одновременно; повтор/uncertain не возобновляется. CLI 1.19.6, zai-coding-plan/glm-5.4 или glm-5.3, секрет передаётся только OpenCode как ZHIPU_API_KEY. Агент работает в checkout main со штатными read/glob/grep/list; edit/bash/task и остальные tools запрещены. Добавлен бесплатный PR CI smoke реальной установки CLI/версии без модели. Отчёт в artifact. Существующие агенты, merge/deploy не затронуты. Offline dry-run и регрессии проверены; локальная установка недоступна из-за сети, но реальная установка CLI/версия/run --help и обе dry-run конфигурации прошли в [CI smoke 45567465538](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45567465538) на `017ff30152139fa89759046a04ffa90d468ae38b`, без модели. Платного smoke не было. Подробности: `docs/OPENCODE_CODING_PLAN.md`.

## 25.11.2026 — #377 устранён, согласованный ZAI L3-01 запущен

[PR #381](https://github.com/apotet/my-gemini-mirror-site/pull/381) merged:
`8cf3ece3035c490890d0f8766fd536edf4be46b4`, принятый head
`1fd55f92764ec442107d2c83b701058b0b325311`.
[Runtime CI 45556720221](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45556720221)
и [Fast PR gate 45556720165](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45556720165)
— SUCCESS: 54 runtime-регрессии, Gemini/resolver и полный Docker pipeline.
Изменение ограничено audit-only source SHA; edit/publisher и чужие ветки не менялись.

По прямому, уже выданному разрешению владельца запущен аудит #376:
[trigger Issue #382](https://github.com/apotet/my-gemini-mirror-site/issues/382),
[Run 45557155832](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45557155832).
Фактический durable checkpoint подтверждает `sourceSHA=491dfd894f229239eb54011f5970fd3b5b45263e`,
`trustedSHA=184f0d62a3370053d70af68e0bc615023d8f5c36`, audit-only и первую reserved попытку.
Повторный run не создавался. В grant этой задачи максимум 3 последовательных шага,
без транспортных retry; uncertain не повторяется автоматически.

Контекст: 28 полных вопросов исторического batch-01-source.json и 17 полных файлов,
включая все 8 изменённых src/public файлов на актуальном source SHA. Остальные
src/public между snapshot пакета и целевым SHA неизменны по Git diff; это явно
сообщено модели, старые findings не выдаются за текущую приёмку. Mandatory standards
взяты из доверенного main. Офлайн-подготовленный размер messages: 2 739 214 UTF-8 байт
(на main 8cf3ece; фактический trusted snapshot закреплён выше).

Статус на момент записи: аудит выполняется, итоговый отчёт/usage/стоимость ещё
не получены и не считаются нулевыми. Ссылки на результат — в trigger Issue и исходном #376.
Платных вызовов при разработке исправления: 0. Аудит запущен только после merge.
Ветка Геннадия, учебные материалы и #352 не изменены; merge/deploy учебных правок нет.

## 25.11.2026 — Gemini: восстановление после 503/429 (#378)

Merge commit `9f2349cd1482ff7a3dd301a0168d9de1c58c5fa4`.
До 4 попыток на явные HTTP 503/429. Exponential backoff с jitter, учитывается Retry-After.
После двух 503 на hydrogen переход на gemini-3.8-flash. Успех останавливает повторы.
Неопределённый результат (таймаут, неполный ответ) не повторяется.
Smoke #380 / run 45556660328: 4 попытки, все 503, переход на Flash после двух 503 на Hydrogen сработал. Генерации нет — API high demand. Batch API и платный приоритет не внедрялись. L3 и #365 не затронуты.

---

## 25.11.2026 — #377: immutable source SHA для audit-only

Минимальное исправление блокера согласованного ZAI аудита #376: поле `source_sha`
принимается только для audit-only, как полный SHA существующего commit того же
репозитория. Доверенные workflow/parser остаются на main, исходники читаются Git
blobs без checkout/исполнения кода чужой ветки. Обязательные стандарты/STATE берутся
из доверенного main; оба SHA закреплены в checkpoint и сохранены при продолжении.
Edit/publisher не расширены. Ветка Геннадия и #352 не изменяются.

54 локальные runtime-регрессии PASS, включая 5 точечных сценариев source SHA,
принадлежность репозиторию до claim, стандарты main, отсутствие checkout, read-only
и сохранение pins при продолжении. После CI и разрешённого merge запускается уже
согласованный аудит L3-01 на `491dfd894f229239eb54011f5970fd3b5b45263e`, с актуальными
исходниками поверх старого batch-01-source.json. Повторное разрешение не требуется.
На этапе исправления платных вызовов 0. Результат запуска фиксируется отдельно.

## 25.11.2026 — PR #365 принят и слит в main

Независимая приёмка пройдена. По прямому разрешению владельца PR #365
переведён из Draft в Ready и выполнен merge.
Merge commit: `ca8a88fb6eda6a1af1db65c4d7ec671bcee3b49d`.
Принятый head: `50a7bdc11bd3423a548c36ae2c5003bfe32f8a07`.

- [Runtime CI 45554453147 — SUCCESS](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45554453147):
  49/49 runtime, 11/11 Gemini offline/mock, 12/12 resolver; реестр 90/90,
  полный пакет #356 с 7/7 вопросами, реальные Docker isolation и
  `npm ci → typecheck → build → questions` — PASS.
- [Fast PR gate 45554453255 — SUCCESS](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45554453255)
  на том же принятом head.
- Общая инфраструктура ZAI/Kimi теперь в main. STATE обновлён.
  Gemini #369/#371 сохранён; его edit/publisher не включается этим merge.
- PR #361 остаётся Draft. Учебные материалы и ветки Геннадия не изменялись.
- Платных API-вызовов в этой операции **0**, расходы **$0**.
  Новые платные запуски пока не разрешены; deploy вручную не запускался.

Ниже сохранён журнал этапов до приёмки; прежние отметки Draft относятся к истории.

## 25.11.2026 — PR #365: исправления независимой приёмки и синхронизация main

Исправлены только [замечания 7153787056](https://github.com/apotet/my-gemini-mirror-site/pull/365#issuecomment-7153787056),
без переработки архитектуры. Ветка синхронизирована с main
`b0a2325b2880148c6ce32e306fe76134727d8ed2`; конфликты инструкций/журнала разрешены
с сохранением компактного STATE и истории решений. Gemini #369/#371 (Interactions API,
workflow, скрипты и документация) сохранён без изменений, audit-only; edit не включён.

- Исправлен импорт base64 в partial-SSE exception path. Реальный путь транспорта
  с mock HTTP partial stream сохраняет uncertain checkpoint и исходные байты;
  повторный вход не делает второй запрос, продолжение требует явного подтверждения.
- STATE, полный LEARNING_CONTENT_STANDARD и DEVELOPMENT_WORKFLOW обязательны в
  initial context всех задач, включая explicit files и новый урок; пересечения
  файлов/каталогов дедуплицированы. Отсутствующий стандарт блокирует до claim.
- Проверяется decoded assembled content, включая base64 и границы чанков;
  проверка повторяется перед sandbox validation и публикацией старого checkpoint.
- Broad scripts/docs scopes не разрешают менять scripts/gemini* и управляющие
  инструкции/стандарты агентов. Добавлены негативные регрессии.

Проверенный код: `89001e755fa8e8ede6d46445a14c4f450124feae`.
[Run 45554268528 — SUCCESS](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45554268528):
**49/49 runtime**, **11/11 Gemini offline/mock**, **12/12 Compiler API resolver**,
реестр **90/90**, полный пакет #356 (7/7 вопросов); реальные Docker isolation и
`npm ci → typecheck → build → questions` — PASS.
[Fast PR gate 45554268526 — SUCCESS](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45554268526).
Конфликты устранены, GitHub `mergeable=true`; готов к merge по техническим проверкам.
Итоговый head с этой записью проверяется в [CI PR #365](https://github.com/apotet/my-gemini-mirror-site/pull/365/checks).
PR остаётся Draft; merge выполняет владелец.
STATE обновлён. Учебные материалы и ветки Геннадия не менялись.
Платных вызовов **0**, расходы **$0**, merge/deploy не выполнялись.


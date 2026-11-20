## Проверенный Gemini 3.5 Flash Lite: работает на 4 вопросах, но недостаточно глубокий без ручной приёмки (20.11.2026)

**Прямая команда пользователя** — протестировать Lite. [GitHub Actions #44652640818](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44652640818) **SUCCESS** с моделью **`gemini-3.5-flash-lite`**, ровно один `generateContent` вызов на четыре настоящих предметных ID `k-05,l12-copp01,l12-storm01,l12-x02` в учебном PR #264 (замороженный HEAD `1f273787370a64cf39732974b60c1706e538f5bb`). Результат валидирован по 4 ID, source SHA и структуре: Google вернул `4 PASS`; usage **4637 input, 748 output, 5385 total tokens**. [Оригинальные выводы Gemini](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7027350572). Одноразовый триггер [Draft PR #280](https://github.com/apotet/my-gemini-mirror-site/pull/280) **закрыт без merge**. **Реальная независимая проверка ChatGPT** фактических условий, ключей, дистракторов и тематических уроков: все 4 ключа корректны, но модельные обоснования чрезмерно короткие, не дают отдельно глубокие пояснения трёх дистракторов и заявляют `limitations=None` без браузерной проверки; [зафиксированные ограничения и предметный recheck](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7027390135).

**ВАЖНО ДЛЯ СЛЕДУЮЩЕГО ЧАТА:** Lite действительно отвечает на технический JSON-пакет, в отличие от наблюдаемых 503 Hydrogen/3.8, но это **НЕ** равнозначная замена глубокому независимому аудиту. Считать **4 advisory PASS**, **0 окончательных независимых DONE**. Нынешний валидатор проверяет наличие строк evidence, но не отдельную проработку каждого неверного варианта; следующее изменение должно *сначала* научить проверять per-distractor, полноту двух реальных секций и честные ограничения live-browser. Разрешение Lite в trusted reviewer было внесено **только локально в одноразовом Actions runner**, исходный постоянный allowlist скрипта `scripts/gemini-audit-review.mjs` **не изменён**. Если владелец разрешит постоянное применение Lite, менять только после инженерного качества и регрессионного теста.

**Лимиты по скриншотам владельца:** Lite 15 RPM, 250000 входных TPM, 500 RPD, исторические 28-day peaks 1/15, 3.57K/250K, 2/500 — не live balance. Нет cron/retry/multi-model fallback/беззвучного переноса PASS; PR #264 Draft/BLOCK, no merge/deploy/rebaseline, production нетронут.

---

## Временный выбор модели по команде владельца — Gemini 3.8 Flash (20.11.2026)

**Прямая команда владельца NetOps:** «Давай использовать 3.8». Разрешено временно использовать `gemini-3.8-flash` как независимого API-рецензента вместо дающего 503 `gemini-4-hydrogen`. **НЕ приравнивать** оценки разных моделей и не превращать старые Hydrogen PASS в проход текущего SHA. Каждая проверка явно указывает `model`, PR #264 frozen source SHA, IDs, rate limit и реальные AI verdicts. Конкретное решение заранее записано [в ROADMAP](../ROADMAP.md), commit `1fc90a7cd53f2bce745fdf422e0abed7307e4720`.

**Подтверждённый Google AI Studio лимит 3.8 Flash:** 5 RPM, 250K входных TPM, 20 RPD; за последние 28 дней пиковые `5/5 RPM`, `144.21K/250K TPM`, `19/20 RPD` — не текущий остаток. Риск 429 для 3.8 выше, чем Hydrogen; **один** осознанно запущенный API-вызов на фиксированные **10 ID**, без retry/cron/fallback/параллельной очереди. В случае 429/503/timeout, ошибочного JSON, неправильного SHA, не всех десяти review-строк — **INCONCLUSIVE** и остановиться; никакого фиктивного PASS. Ответ конкретной модели должен содержать точные evidence по каждому ключу, дистракторам, plain/pro и lesson anchor, а итоговую предметную приёмку даёт отдельный технический аудит.

**Первая попытка на этой модели:** staging Draft PR #264 HEAD `1f273787370a64cf39732974b60c1706e538f5bb`; десять ранее не получивших модельного аудита ID `k-05,k-06,k-07,l1-02,l1-04,l12-copp01,l12-d05,l12-ds04,l12-storm01,l12-x02`. One-shot Draft PR [#279](https://github.com/apotet/my-gemini-mirror-site/pull/279), Actions [#44651253640](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44651253640), 420-секундный client timeout, 16384 output cap, `GEMINI_MODEL=gemini-3.8-flash`. **Результат проверять в Actions/PR #264 отдельно**; не заявлять заранее. Закрыть trigger PR без merge. Никаких staging merge/deploy и production изменений.

---

## Что выяснили о 503 Hydrogen: исключены ключ, неправильный ID и общий сбой генерации (20.11.2026)

**Непосредственно проверено в GitHub Actions с настоящим неизменным `GEMINI_API_KEY`:**
- [GET-only run #44650282029](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44650282029): `GET /v1beta/models/gemini-4-hydrogen` **200**, есть `generateContent`, входной лимит 1048576, выходной 65536; `GET /v1beta/models?pageSize=1000` **200**, 66 моделей, Hydrogen присутствует; `GET /v1beta/models/gemini-3.8-flash` **200**. Без генерации.
- [Flash Lite generation control run #44650479901](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44650479901): *ровно один* `gemini-3.5-flash-lite:generateContent` с `PONG`, **HTTP 200**, за 3508 мс, ответ `PONG`, финиш `STOP`, ровно 8 API-reported токенов (prompt 6, candidates 2). Это контроль **API-ключа, инфраструктуры и endpoint**, **НЕ замена модели технического аудита**.
- [Hydrogen PONG run #44649909454](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44649909454) на том же ключе, домене и endpoint: **HTTP 503 `UNAVAILABLE`, `high demand`, 1821 мс**; также настоящий 10-ID пакет [#44649063943](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44649063943) **503**. Малый размер запроса проблему не решает.
- Временные [Draft PR #277](https://github.com/apotet/my-gemini-mirror-site/pull/277) и [#278](https://github.com/apotet/my-gemini-mirror-site/pull/278) **CLOSED unmerged**. [Полный протокол](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7027085141).

**Точное заключение:** Hydrogen корректно зарегистрирован и разрешён для `generateContent`, но его inference backend отказал 503 в момент вызовов; остальные модели могут отвечать. По [официальному Google AI Developer Forum](https://discuss.ai.google.dev/t/handling-429-503-errors-from-the-gemini-api/124640), 503 означает перегрузку backend, не quota 429. Сообщения 19 ноября также подтверждают чужие сбои Hydrogen. Это не означает подтверждённый глобальный отказ Google и не гарантирует время восстановления. **Нельзя «починить серверы Google» настройкой GitHub или сменой API-ключа.**

**Операционный режим:** не перезапускать по cron, без спама ретраями; не переписывать source SHA и не объявлять Gemini PASS без модели. Рабочий запасной `gemini-3.5-flash-lite` доказал только PONG, а не качество экспертного аудита; `gemini-3.8-flash` существует, но платная/квотная модель аудитора не меняется без разрешения. Если будет принято решение протестировать иной reviewer — отдельно фиксировать модель, исходный SHA, ID и результат. PR #264 остаётся Draft/BLOCK, production неприкосновенен.

---

## Регламент лимитов и неудачной четвёртой десятки (20.11.2026) — читать ПЕРЕД каждым запуском

**Подтверждено скриншотами авторизованного Google AI Studio → Rate limits by model:** `gemini-4-hydrogen`: лимиты 5 RPM, 250000 **входных** TPM, 20 RPD; отображённые значения пиков за последние **28 дней**: RPM 1/5, TPM 17.99K/250K, RPD 6/20, зелёный статус. Другие модели: `Gemini 3.8 Flash` 5/5 RPM, 144.21K/250K TPM, 19/20 RPD, красный статус; `Gemini 3.5 Flash Lite` 1/15 RPM, 3.57K/250K TPM, 2/500 RPD, зелёный. **НЕ интерпретировать 28-дневные пики как текущий остаток.** Общий `You have reached a rate limit` не означает блокировку Hydrogen.

**User decision:** одна строго ограниченная партия **10 ID / 1 API call / NO RETRY**, frozen exact PR #264 SHA, проверить репозиторий staging и идентичный SHA до/после, timeout 420s, cap 16384 выходных токенов, не выводить ключи, error 503/429/timeout = **INCONCLUSIVE** и остановка. Никаких cron/re-run/автоматического переоткрытия PR или запасных моделей.

**Реальный новый запуск:** [run #44649063943](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44649063943), отдельный одноразовый [Draft PR #275](https://github.com/apotet/my-gemini-mirror-site/pull/275) **закрыт без merge**. Точный проверенный PR #264 HEAD `1f273787370a64cf39732974b60c1706e538f5bb`, ID `k-05,k-06,k-07,l1-02,l1-04,l12-copp01,l12-d05,l12-ds04,l12-storm01,l12-x02`. Пакеты десяти valid, runner preparation SUCCESS, **единственный API вызов Gemini 4 Hydrogen HTTP 503 UNAVAILABLE / high demand** (не 429), **0 отчётов Gemini**, no retry. Ошибка и источник зафиксированы [PR #264 comment](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7026860429), roadmap `docs/ROADMAP.md` (верхние CURRENT). Не объявлять четвёртую десятку пройденной, не повторять самовольно. В третьей десятке также 0 Gemini results; её ChatGPT-review не равен Gemini.

**Область:** `apotet/my-gemini-mirror-site` PR #264 DRAFT/BLOCK; никакого merge/deploy, `apotet/netops` не менять. Авторизация модели уже есть через GitHub Actions secret; Browser Use, TinyFish, Codespaces, Work, Codex не нужны.

---

## Проверенный запуск третьей десятки: успешная авторизация, но Google 503 и тайм-аут (20.11.2026)

- Техническая схема запуска **НЕ изменилась**: подключённый GitHub plugin создаёт одноразовую ветку с `on: pull_request: types: [opened]`; открывает Draft PR из своей ветки в staging `main`; GitHub Actions читает `GEMINI_API_KEY` из Secrets, доверенные скрипты из `main` и зафиксированный точный SHA PR #264. Автоматическая авторизация GitHub/Gemini в ChatGPT **не требуется**. Репозиторий production не затрагивается. После работы одноразовый Draft PR **обязательно закрыть без merge**. Не возобновлять закрытый PR, не настраивать cron/автоповторы.
- [Третий запуск #44637270612](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44637270612) — API `gemini-4-hydrogen` ответил **HTTP 503 UNAVAILABLE, high demand**. [Одна контролируемая попытка #44637499856](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44637499856) — Google не дал заголовки HTTP за ~300 секунд: `HeadersTimeoutError`. **Оба вызова не вернули JSON-отчёт; 0 Gemini PASS/FIX/REVIEW.** Даже неудачный запрос может потреблять ресурс API — не утверждать нулевую стоимость.
- Не тратить квоту на автоматические повторные запросы. В случае недоступности Gemini можно самостоятельно проверять вопрос/ключ/дистракторы/оба точных раздела и публиковать как **ChatGPT source review**, не `Gemini PASS`. Этим способом в этой партии были разобраны `gen-transport-1,gen-transport-14,gen-transport-16,gen-transport-17,gen-transport-5,gen-transport-7,k-01,k-02,k-03,k-04`, устранена 31 дефектная склейка в `group1.ts`, добавлены тесты в `scripts/in-depth-content.test.mjs`. [Доказательства в PR #264](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7025259027). Новый HEAD `1f273787370a64cf39732974b60c1706e538f5bb`, статус Draft/BLOCK.
- Закрытые одноразовые Draft PR без merge: [#273](https://github.com/apotet/my-gemini-mirror-site/pull/273), [#274](https://github.com/apotet/my-gemini-mirror-site/pull/274). **Не терять эти доказательства между чатами.**

## Подтверждённая вторая партия из 10, 20.11.2026

- [GitHub Actions #44636056544](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44636056544) успешно отработал в staging без интерактивного входа, через GitHub secret `GEMINI_API_KEY`. Одноразовый [Draft PR #272](https://github.com/apotet/my-gemini-mirror-site/pull/272) закрыт **без merge**.
- [Gemini report](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7024933965): 10 отдельных вопросов, **9 PASS / 1 FIX**, SHA `1a3f684c7dbc6f6e1c8585b1f8c1155d3f84769d`. Input 11512, output 4058, total 21550 tokens. Один вызов `gemini-4-hydrogen`, никаких повторов и скрытой публикации.
- `gen-diag-6`: нерелевантная общая подсказка по уровням вместо диагностики дублирующегося IPv4. В целевом Draft PR #264 исправлена после отдельной проверки исходника. Дополнительные типографические дефекты уроков `gen-diag-7`, `gen-osi-a-2`, `gen-port-14` тоже исправлены, регрессии добавлены. Новая версия PR #264 HEAD `12dcc9223fc9cb0cb24c4ce539d011760330568a`. Первоначальные модельные PASS не становятся автоматически приёмкой нового SHA.
- **Инструкция для следующих партий:** создавать новую *одноразовую* ветку + `pull_request: opened` Draft PR, не переоткрывать старый, иначе возможен повторный расход квоты; в workflow pin текущего HEAD и строго отдельный список 10 ранее не проверенных ID, timeout 420 секунд/лимит 16384 выходных токенов только в runner, API один вызов/без retries; после отчёта закрыть Draft PR без merge. Публикацию по этапам контролирует ROADMAP. Никакого production.

## Подтверждённый результат режима 10 вопросов — 20.11.2026

- Одноразовый [Draft PR #271](https://github.com/apotet/my-gemini-mirror-site/pull/271) автоматически запустил [GitHub Actions run #44632284371](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44632284371), **SUCCESS**, без интерактивной авторизации GitHub/Gemini. PR #271 закрыт **без merge**.
- Один `gemini-4-hydrogen` API-запрос на ровно **10 вопросов** (SHA `c7ca35f7c747f93f827089bc97464c4d965c6834`) с ограничением 420 секунд и 16384 output tokens успешно завершился. [Предметный отчёт](https://github.com/apotet/my-gemini-mirror-site/pull/264#issuecomment-7024472642): **8 PASS, 2 FIX**. Указанные Google usage: input 11187, output 3142, total 20189.
- Два FIX (`gap-pack2-21`, `gap-pack3-08`) независимо подтверждены по исходникам и исправлены в Draft PR #264, файлы `src/data/inDepth/group1.ts`, `group4.ts`, `scripts/in-depth-content.test.mjs`, HEAD после этих исправлений `1a3f684c7dbc6f6e1c8585b1f8c1155d3f84769d`. Тест `test:in-depth` в GitHub Actions на новом HEAD PASS, 164/164 anchors, 0 missing. Сохраняется блокировка fingerprint и итоговой независимой приёмки.
- **Не превращать старые 8 PASS автоматически в новые PASS** после изменения SHA. Browser 375/1440, финальная delta-review, прочие GATE отдельно. Команда дальнейших партий требует точного нового SHA и своего ограниченного API-вызова.

# NetOps · Gemini API review запуск без интерактивного входа (20.11.2026)

## Что реально авторизовано

- В браузере ChatGPT **нет** активного входа GitHub; предыдущие попытки нажать `Run workflow` закончились экраном `Sign in`.
- **В аккаунт Gemini никто не логинился.** Доступ к модели выполняется **только внутри GitHub Actions** из существующего секрета репозитория `GEMINI_API_KEY`. Секрет не печатать, не копировать в комментарии, не переносить в код.
- Подключённый GitHub plugin позволяет создавать ветки/файлы/PR и читать Actions, **но не предоставляет `workflow_dispatch`**.
- Подтверждённый обход для запуска: GitHub plugin создаёт отдельную ветку с **одноразовым** workflow `on: pull_request: types: [opened]` и затем открывает из неё Draft PR на staging `main`. Событие GitHub запускает Actions **без browser GitHub login**. В workflow разрешить только PR из этого репозитория и точную ветку, читать код ревьюера из доверенного staging `main`, заморозить HEAD проверяемого PR #264, брать вопросы только из конкретного SHA и отправлять read-only результат комментариями в #264. **Никаких merge, auto-deploy, cron, повторов API.** После проверки закрыть одноразовый Draft PR без merge.
- Реально сработавший первый запуск: [GitHub Actions run 44629961341](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44629961341), временный [PR #270](https://github.com/apotet/my-gemini-mirror-site/pull/270), закрыт без слияния. Материалы SHA `c7ca35f7c747f93f827089bc97464c4d965c6834` собраны, секрет присутствовал, первый `gemini-4-hydrogen` запрос через API **прерван клиентским тайм-аутом через 160 секунд**, ни одного ответа/приёмки; второй вызов не выполнялся. Запрос на стороне Google мог потребить токены — **не утверждать, что бесплатно**.

## Следующая схема — 10 вопросов в одной партии

1. Проверить актуальный HEAD PR #264 и ровно 10 индивидуальных ID из уровня «Углублённый (Understanding)», исключить ранее проверенные по старому SHA. Фиксировать тот же SHA в учебном пакете и в проверке PR до/после API.
2. Создать временный workflow на отдельной ветке/PR. `on: pull_request: types: [opened]` — только для **одной** созданной ветки; при закрытии/повторном открытии не должно быть нового запуска. **Никогда не мерджить этот одноразовый PR.**
3. Собирать 10 материалов доверенным `scripts/gemini-audit-pack.mjs` из `main` с **явным перечнем ID**, не `auto:N`: в текущем `auto` встроен устаревший SHA `5df2a0b...`, а текущий PR HEAD иной; автоочередь обязана fail-closed.
4. Для 10 вопросов применять тот же доверенный `scripts/gemini-audit-review.mjs`, с отдельным ограничением ожидания до 420 сек и размером ответа до 16384 токенов **только в рамках временного runner**, не изменяя политику постоянных воркфлоу. Один вызов API, **без автоматических повторов**, не расходовать квоту за счёт CI повторов. Полные доказательства по каждому ключу, дистракторам, plain/pro, lessonId#anchor и оговорки.
5. Только при валидном завершённом JSON и неизменном HEAD публиковать отчёт `PASS/FIX/REVIEW` в PR #264. Наличие отклика Gemini не является финальным approval: инженерная перепроверка, браузер, CI и GATE-01…10 отдельно.
6. После фактического результата закрыть временный PR без merge; фиксировать точную ссылку на run, исходные ID, SHA, статус в ROADMAP. **Production `apotet/netops` никогда не трогать без отдельного явного разрешения.**

## Что нельзя путать

- Создание PR автоматически авторизует *GitHub Actions* на чтение закрытого `GEMINI_API_KEY` из Secrets внутри runner. Это **не** интерактивная авторизация Gemini в приложении, не доступ к ключу ChatGPT и не гарантированная бесплатная квота.
- CI/browser/lesson links `PASS` не подтверждают инженерную истину разборов; не принимать устаревшие semantic fingerprints за актуальные и не делать фиктивный rebaseline.
- Любой тайм-аут/ошибка/отсутствие подробного ответа = `INCONCLUSIVE`, не `PASS`. Секрет никогда не извлекать и не логировать.

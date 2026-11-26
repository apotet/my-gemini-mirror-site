# OpenCode Coding Plan — первый этап (#384)

Отдельный audit-only workflow, без изменения существующих ZAI/Kimi/Gemini агентов.
Никаких merge/deploy, коммитов модели, shell, MCP, plugins или subagents.
OpenCode работает в рабочей копии репозитория (checkout main). Разрешены штатные
read/glob/grep/list: агент сам находит исходники и изучает структуру. Остальные
инструменты по умолчанию запрещены, edit/bash/task/external_directory запрещены
явно. Merge/deploy недоступны; GitHub token не передаётся CLI. Конфигурация и
состояние CLI хранятся отдельно во временном каталоге, cwd остаётся репозиторием.
OPENCODE_PERMISSION применяет audit-only ограничения поверх проектных permissions.

## Сверено 25.11.2026

- https://opencode.ai/docs/cli/ — `opencode run` для автоматизации.
- https://docs.z.ai/llms.txt → `devpack/tool/others.md` →
  https://docs.z.ai/devpack/tool/opencode — официальный npm `opencode-ai`,
  выбирать **Z.AI Coding Plan**, а не обычный Z.AI.
- https://github.com/anomalyco/opencode/releases/tag/v1.19.6 — закреплённый CLI.
  Текущие страницы OpenCode описывают также новый формат конфигурации;
  здесь используется v1-совместимый формат, сверенный с исходниками тега:
  `packages/core/src/v1/config/{config,permission}.ts`.
- https://github.com/anomalyco/models.dev/blob/dev/providers/zai-coding-plan/provider.toml
  — документированная credential env **ZHIPU_API_KEY**.
- Каталог в `providers/zai-coding-plan/models/glm-5.4.toml` и `glm-5.3.toml`:
  **zai-coding-plan/glm-5.4**, **zai-coding-plan/glm-5.3**. 5.4 добавлен после
  выпуска CLI; установка проверяет наличие выбранной модели в актуальном каталоге.
- https://docs.z.ai/devpack/usage-policy.md — только владелец подписки и
  поддерживаемые инструменты. Интеграционная страница описывает GitHub Actions,
  но это не подтверждение допустимости конкретного CI сценария по вашей подписке.
  До платного запуска владелец должен отдельно проверить условия/получить
  подтверждение Z.ai. Сам этот PR не разрешает платные вызовы.

## Подготовка и запуск

1. После отдельной приёмки владельцем workflow должен оказаться в main.
   Этот PR остаётся Draft; слияние здесь не выполняется.
2. Создайте Issue от `apotet` с задачей и областью аудита; исходники агент читает сам.
   Для управления из ChatGPT создавайте новую Issue с названием
   `[OPENCODE] Аудит ...`: событие `opened` делает **только dry-run**.
   Редактирование, обычные комментарии, сторонние авторы и PR ничего не запускают; точные команды владельца описаны ниже.
3. Actions → **OpenCode Coding Plan audit** → Run workflow → branch **main**,
   `issue` = номер Issue без `#`, `model` = `glm-5.4` или `glm-5.3`.
   Оставьте `paid=false`, `ci_terms_confirmed=false` для dry-run.
   Dry-run не устанавливает/не запускает CLI, не читает secret, не вызывает модель.
4. Только после отдельного разрешения владельца на одну платную задачу и проверки
   CI условий: Settings → Secrets and variables → Actions → New repository secret →
   **ZAI_CODING_API_KEY**. Значение — ключ именно Coding Plan из Z.ai,
   не обычный pay-as-you-go key. Не вставляйте ключ в Issue/команду/чат.
5. Для согласованного платного аудита запустите вручную от `apotet` на main с
   `paid=true` и `ci_terms_confirmed=true`. Эти два поля являются явными
   подтверждениями владельца. Секрет доступен лишь шагу official OpenCode,
   как `ZHIPU_API_KEY`. GitHub token не передаётся CLI.
6. Результат: artifact `opencode-audit-<run_id>` (7 дней): безопасный config,
   статус и JSON events для платного аудита. Вывод CLI не стримится в логи,
   ключ удаляется из сохраняемого stdout; stderr/credential/session DB не публикуются.
   Каталог может показывать нулевую цену: это не означает нулевое потребление подписки.

Один глобальный concurrency group, без отмены текущего запуска. До установки/модели
платный запуск резервирует Issue через bot comment `opencode-paid-attempt-v1`.
Та же Issue не оплачивается повторно, включая другой dispatch, сбой/таймаут и
неопределённый ответ. Re-run запрещён (`run_attempt == 1`). Не удаляйте отметку;
при реальной новой задаче создайте новую Issue с новым явным разрешением.
Автоматических workflow retry нет; внутреннее поведение транспорта CLI — поведение
официального клиента, не гарантия ровно одного HTTP запроса.

## Бесплатный CI smoke (без модели)

`.github/workflows/opencode-smoke.yml` запускается на pull_request при изменении
OpenCode workflow/runner/tests, только для ветки того же репозитория. Выполняет
реальную `npm install --global opencode-ai@1.19.6`, проверяет `opencode --version`
и `opencode run --help`, offline-тесты и dry-run обеих моделей. Секреты не
передаются, `opencode run` с задачей не вызывается, модель не используется.
Audit workflow и его подтверждения платного запуска этим не активируются.

## Offline проверки

```
python3 -m unittest discover -s tests -p test_opencode_audit.py
python3 scripts/opencode_audit.py --model glm-5.4
python3 scripts/opencode_audit.py --model glm-5.3
```

CLI не нужен для этих проверок. Для машины с заранее скачанным npm cache:
`npm install --offline --global opencode-ai@1.19.6`, затем `opencode --version`
и `opencode run --help` — без credentials и model calls.
В локальной среде сеть к GitHub/npm недоступна и CLI в кеше нет. Реальная установка\nCLI 1.19.6, версия, run --help, четыре offline-теста и обе dry-run конфигурации\nпрошли в [CI smoke 45567465538](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45567465538)\nна коде `017ff30152139fa89759046a04ffa90d468ae38b`, без секрета и модели.
Платный smoke намеренно не запускался. Первый настоящий запуск требует проверки
версии и наличия выбранной модели до передачи ключа.

## Обычный Z.AI API (pay-as-you-go), 25.11.2026

В том же workflow выбирайте `provider=zai`, `model=glm-5.3`.
Coding Plan сохранён: `provider=zai-coding-plan`, модели GLM-5.3/5.4.
Неподдерживаемая пара zai + GLM-5.4 отклоняется до claim, установки и секрета.
Имя существующего секрета **ZAI_API_KEY** сверено по
`.github/workflows/zai-issue.yml`: `PROVIDER_API_KEY: secrets.ZAI_API_KEY`.
Это проверка ссылки в workflow, не чтение значения/проверка наличия секрета
в Settings: GitHub connector не предоставляет доступ к secrets API.
Новый секрет для обычного API создавать не требуется. Динамический выбор имени
секрета не подставляет Coding Plan key при отсутствующем ZAI_API_KEY.
Оба ключа передаются только официальному CLI как **ZHIPU_API_KEY**.

Источники:
- https://github.com/anomalyco/models.dev/blob/dev/providers/zai/provider.toml —
  штатный provider `zai`, стандартный endpoint, env ZHIPU_API_KEY.
- https://docs.z.ai/guides/llm/glm-5.4 — обычный Model API ещё ожидает security
  assessment; GLM-5.4 оставлена только в Coding Plan, без автоматического fallback.
- https://docs.z.ai/guides/overview/pricing — GLM-5.3: $1.40 input,
  $0.26 cached input, $4.40 output за 1M токенов (25.11.2026).
- https://docs.z.ai/devpack/notice/api-key-management — Standard и Coding Plan
  ключи имеют разные правила биллинга; смена endpoint не меняет тип нового ключа.

### Первый API тест: бюджет $1, цель до $0.20

Платный тест **не запускался и этим изменением не разрешается**.
Для будущего согласованного запуска: `provider=zai`, `model=glm-5.3`,
`paid=true`, `api_budget_risk_accepted=true`: владелец явно принимает риск
превышения цели $0.20 и планового бюджета $1. Это согласие на риск, а не
подтверждение hard cap провайдера; $1 технически не гарантируется. Для Coding Plan по-прежнему
требуется `ci_terms_confirmed=true`; оно не нужно для обычного API.

Проверка публичной документации не подтвердила произвольный hard cap $1 на
отдельный Standard API Key. `rate-limits` ограничивает частоту, не доллары;
ошибки monthly spend limit 1318–1321 относятся к overage подписки, а не служат
доказательством Standard API key cap:
https://docs.z.ai/api-reference/api-code .
FAQ предупреждает о задержке баланса и биллинга:
https://docs.z.ai/help/faq . Поэтому периодическая проверка баланса тоже не
гарантирует потолок $1. Настройки аккаунта/ключей не менялись. Отсутствие
provider-side hard cap не блокирует запуск, если владелец явно принимает риск
перерасхода через api_budget_risk_accepted. Флаг paid остаётся отдельным
разрешением конкретного платного запуска. Предоплата без
автопополнения может ограничить общий доступный баланс, но её точное применение
и задержки надо проверить у провайдера; существующий баланс не изменяется.

В runner фиксированы budget_usd=1 и target_usd=0.20. Для API используется
штатный агент OpenCode без искусственного ограничения шагов,
узкая область задачи и краткий ответ; сохранены timeout CLI 600 секунд и job 15 минут. Это снижение ожидаемого расхода, **не
денежный hard cap** и не гарантия расхода до $0.20. Внутренние запросы/повторы CLI
и уже отправленная генерация могут выйти за целевые значения. Нового брокера,
прямого HTTP-клиента и механизма автоматических платных retry нет.

### Учёт

В artifact: events.jsonl, usage.json, report.md. Числовая сводка также попадает в
Actions Job Summary. Суммируются только step_finish: input, output, reasoning,
cache read/write и cost; дубли text/message не суммируются. Стоимость — оценка
OpenCode по его каталогу, **не окончательный счёт Z.ai**; вспомогательные запросы,
невидимые в CLI events, могут в неё не попасть. Есть флаги превышения цели $0.20
и бюджета $1. Нет события/учёта → null (unknown), а не $0; частичный stdout при
таймауте сохраняется, outcome остаётся uncertain, повтор блокируется.
Для Coding Plan токены выводятся, долларовая стоимость null: используется квота.

Бесплатный CI smoke проверяет и dry-run `zai/glm-5.3`, не вызывая модель.

## Запуск точным комментарием владельца (#389)

После merge новую задачу можно запускать из GitHub connector одним комментарием
в owner Issue с заголовком `[OPENCODE] ...`. Разрешены только полные строки:

- `/opencode run zai glm-5.3 accept-budget-risk`
- `/opencode run zai-coding-plan glm-5.3 confirm-ci-terms`
- `/opencode run zai-coding-plan glm-5.4 confirm-ci-terms`

Первая команда явно разрешает один платный API аудит и принимает риск превышения
цели $0.20 и планового бюджета $1; это **не hard cap**. Команды Coding Plan явно
подтверждают допустимость CI по условиям подписки и разрешают один платный аудит.
Никакой автоматической отправки команды или платного smoke при реализации #389 нет.
Тест #388 этой задачей не запускается.

Проверяются actor, triggering_actor, автор комментария apotet (User), владелец Issue,
префикс, событие issue_comment.created, не PR, репозиторий, trusted main и run_attempt=1.
Пробелы/переносы/добавленный текст делают команду невалидной; обычные и чужие
комментарии игнорируются. Текст комментария сравнивается со статическим allowlist,
не исполняется как shell и не передаётся модели в качестве программы.

workflow_dispatch сохранён. Открытие owner [OPENCODE] Issue остаётся бесплатным
dry-run. Оба пути используют одну concurrency group и прежнюю durable single-use
отметку: второй комментарий, новый dispatch, failure или uncertain не дают второй
платной попытки по той же Issue. Искусственный лимит steps=3 снят для обоих провайдеров в #391; timeout сохранён.
Проверки команд/авторизации/duplicate/dry-run используют mocks, без GitHub/model calls.

## Полнота аудита и публикация результата (#391)

Для обоих провайдеров не задаются steps/maxSteps и не вводится иной лимит шагов.
Сохраняются timeout CLI 600 секунд / job 15 минут, узкая область Issue, read-only
permissions, owner commands, бюджетный риск, single-use claim и отсутствие rerun.
Больше шагов может повысить расход; цель $0.20 и план $1 не гарантируются.

Модель обязана закончить ответ отдельной строкой `AUDIT_STATUS: COMPLETE` только
после проверки всей заданной области; иначе `AUDIT_STATUS: INCOMPLETE` с недостающей
работой. Статус completed требует exit=0, step_finish.reason=stop, непустого финального
ответа и COMPLETE без испорченных events. Это декларация модели, не независимая
проверка качества. Без этих признаков — incomplete; CLI/error — failed; timeout —
interrupted с uncertain outcome. Нулевой exit сам по себе не означает полный аудит.
Промежуточный текст прежних шагов не подменяет финальный итог.

Архив сохраняет events.jsonl, usage.json, result.json с полным финальным ответом и
report.md. В Issue публикуются статус, краткий итог (до 4000 символов), токены,
оценка стоимости и ссылка на artifact/run. Raw stderr, prompt, credentials, config
и полный events архив не копируются в комментарий. Загруженный ключ редактируется
до сохранения stdout/result; неизвестный/частичный расход не объявляется нулевым.
Публикация выполняется и после сбоя/таймаута, если авторизация задачи пройдена;
если result отсутствует, комментарий явно сообщает incomplete. При жёсткой отмене
job публикация best-effort; durable claim по-прежнему не разрешает повтор модели.

#388 не повторяется. Следующий тест должен быть новым отдельным Issue:
`l1-poe-screen-reading` в `src/data/lessons/foundation-coverage.ts`, тот же предмет
аудита, GLM-5.3 Standard API, цель $0.20 без гарантированного потолка.
В разработке #391 платная модель не запускается.

## Заяц-автор: Draft PR из GLM-5.4 (`opencode-author.yml`)

Отдельный workflow, `opencode-audit.yml` не меняется. Запуск: owner Issue с заголовком
`[OPENCODE-DEV] ...` (описание задачи в теле) и точный комментарий
`/opencode author zai-coding-plan glm-5.4 confirm-ci-terms`. Одна попытка на Issue
(durable-отметка, без автоповтора); общая concurrency group с аудитом.

- Job `author`: ключ `ZAI_CODING_API_KEY` виден только шагу модели; токен записи не выдаётся.
  OpenCode 1.19.6, read/glob/grep/list и edit только в `src/**`, `docs/**`,
  `public/lesson-images/**`; bash, task, webfetch, внешние каталоги запрещены.
- `scripts/opencode_author_check.py` проверяет итоговый diff: только add/modify обычных
  файлов в разрешённых путях, до 40 файлов и 400 КБ. `.github/`, `scripts/`, package-файлы
  и удаления отклоняются. Затем `npm run lint` и `npm run build`.
- Job `publish` без ключа модели применяет патч, пушит `zai/issue-N-RUN` и открывает
  Draft PR; merge/deploy нет. Для PR нужна настройка «Allow GitHub Actions to create
  pull requests»; без неё ветка пушится, а Issue получает пояснение.
- PR от `GITHUB_TOKEN` не запускает CI автоматически; запускайте вручную. Независимую
  приёмку делает не автор (Kimi/Codex), содержание принимает владелец.

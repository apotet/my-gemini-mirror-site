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
   Редактирование, комментарии, сторонние авторы и PR ничего не запускают.
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
В среде разработки этой задачи сеть к GitHub/npm недоступна и CLI в кеше нет:
реальная установка и выполнение CLI **не проверены**. Проверены генерация
конфигурации, dry-run, ограничения workflow и runner через mocks.
Платный smoke намеренно не запускался. Первый настоящий запуск требует проверки
версии и наличия выбранной модели до передачи ключа.

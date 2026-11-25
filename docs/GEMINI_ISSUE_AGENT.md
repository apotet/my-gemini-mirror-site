# Геннадий: Gemini Agent через GitHub Issue

Изолированный агент для заданий через Issue с заголовком `[GEMINI]`.
Не дублирует общую инфраструктуру из незавершённого PR #365.

## Запуск

Создать Issue от `apotet` с заголовком, начинающимся на `[GEMINI] `, и телом JSON-объекта:

```json
{
  "task": "Проведи инженерный аудит урока. Укажи цитаты и приоритеты.",
  "model": "gemini-2.5-pro",
  "mode": "audit-only",
  "files": ["src/data/lessons/l1-poe-budget.ts"]
}
```

- `task` обязателен (строка 1–12000 символов).
- `model` по умолчанию и единственно разрешённый: `gemini-2.5-pro`. Актуальность по официальной документации: https://ai.google.dev/gemini-api/docs/models/gemini (проверено без платного вызова; модель присутствует в списке).
- `mode`: только `audit-only`. Режим `edit` **отключён** до интеграции с единым runtime (#365). Полноценное редактирование и Draft publisher не реализованы в этом агенте и не дублируются.
- `files`: до 8 путей. Только отслеживаемые git-файлы внутри checkout, без symlink и служебных файлов.

## Безопасность

- Только `issues: opened`, автор/sender/actor = `apotet`, `run_attempt == 1`.
- Durable claim `<!-- gemini-issue-agent:claimed:v1 -->` до любого платного вызова. Проверка по **всем страницам** комментариев.
- Один `generateContent` без retry. Redirects запрещены.
- Ключ передаётся заголовком `x-goog-api-key`, не в URL.
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent`.
- Секрет `GEMINI_API_KEY` только в paid step. Значение не читается и не логируется.
- Workflow не имеет `contents: write`. Автоматический merge/deploy отсутствует.
- `maxOutputTokens` установлен в технический предел API (65536). `finishReason=MAX_TOKENS` или пустой ответ трактуются как неполный результат, не успех.
- Обязательные стандарты NetOps передаются в контекст явно. STATE — как оперативный снимок.

## Диагностика предыдущей интеграции

- `gemini-issue.yml` (CLI по метке `gemini-run`): отдельный путь. Документация описывает условия активации; неактивность **не утверждается** только по старой документации. Сохранён как есть.
- `gemini-l3-issue.yml`: узкий L3-адаптер. Фактическая причина отказа prepare по логам run 45506829176: `AssertionError: Inventory stale: prepare a targeted source pack first` (diff src/public между pack.sourceSHA и task.sha). Не заменяет общий агент.

## Зависимости и блокеры

- Секрет `GEMINI_API_KEY` должен существовать (наличие не проверялось чтением значения).
- Реальный платный вызов — только после независимой приёмки.
- Edit и Draft publisher для изменений зависят от #365; до интеграции отключены. Общий runtime не дублируется.

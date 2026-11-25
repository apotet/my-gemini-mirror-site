# Геннадий: Gemini Agent через GitHub Issue

Изолированный агент для заданий через Issue с заголовком `[GEMINI]`.
Не дублирует общую инфраструктуру из незавершённого PR #365.
При появлении единого runtime агент может быть переведён на него отдельной задачей.

## Запуск

Создать Issue от `apotet` с заголовком, начинающимся на `[GEMINI] `, и телом JSON:

```json
{
  "task": "Проведи инженерный аудит урока. Укажи цитаты и приоритеты.",
  "model": "gemini-2.5-pro",
  "mode": "audit-only",
  "files": ["src/data/lessons/l1-poe-budget.ts"]
}
```

- `task` обязателен (1–12000 символов).
- `model` по умолчанию и единственно разрешённый: `gemini-2.5-pro` (официальный Gemini API).
- `mode`: `audit-only` (по умолчанию) или `edit`. В этой версии edit публикует отчёт; автоматическое применение правок и Draft PR для edit — после независимой приёмки и отдельного разрешения.
- `files`: до 8 существующих путей без traversal.

## Безопасность

- Только `issues: opened`, автор/sender/actor = `apotet`, `run_attempt == 1`.
- Durable claim `<!-- gemini-issue-agent:claimed:v1 -->` до любого платного вызова.
- Один `generateContent` без retry/redirect/fallback.
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent`.
- Секрет `GEMINI_API_KEY` только в paid step. Значение не читается и не логируется.
- Workflow не имеет `contents: write`. Автоматический merge/deploy отсутствует.
- Concurrency group по номеру Issue.

## Диагностика предыдущей интеграции

- `gemini-issue.yml` (CLI по метке `gemini-run`): документация указывает «not active until PR merged and secret configured». Не является целевым путём для `[GEMINI]` Issue.
- `gemini-l3-issue.yml`: узкий L3-адаптер с жёстким контрактом (`branch`/`sha`/`ids`/`model=gemini-4-hydrogen`). Недавние runs падали на prepare при несоответствии контракту. Не заменяет общий агент.

## Зависимости

- Секрет `GEMINI_API_KEY` должен существовать в Settings → Secrets (наличие не проверялось чтением значения).
- Реальный платный вызов — только после независимой приёмки этого PR.
- При мерже #365 общую инфраструктуру не дублировать; адаптировать отдельно.

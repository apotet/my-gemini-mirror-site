# Kimi Agent (v3.1) — универсальный агент заданий через GitHub Actions

## Что это

Универсальный механизм выполнения редактурных заданий моделью `kimi-k3.1-pro`
через GitHub Actions. Механизм отделён от заданий: специфика находится в
task-файлах (`.github/agent-tasks/`), механизм — в workflow и скриптах
(`.github/workflows/kimi-agent.yml`, `.github/scripts/`).

## Размещение (точные пути)

```
.github/workflows/kimi-agent.yml              # универсальный workflow
.github/agent/system-prompt.md                # системный промпт агента
.github/agent/context/renderer-format-rules.txt   # правила рендерера (sha-заверенная копия)
.github/agent/context/lessons-registry.txt        # реестр уроков (79 id)
.github/agent/context/netops-standard.txt         # фрагменты LEARNING_CONTENT_STANDARD.md
.github/agent-tasks/poe-injectors-fix.md      # ПИЛОТНОЕ задание (урок PoE)
.github/scripts/parse_sse.py                  # протокольный разбор SSE + целостность
.github/scripts/extract_candidates.py         # извлечение файлов из ответа по целевым путям
.github/scripts/build_payload.py              # сборка payload.json (без shell-интерполяции)
.github/scripts/structure_check.mjs           # AST-проверка структуры (typescript@5.9.3)
tests/test_offline.py                         # 25 офлайн-тестов (парсер + AST)
tests/test_agent_tools.py                     # 17 тестов инструментов агента
tests/README.md                               # как запускать тесты
```

Секрет: `MOONSHOT_API_KEY` в Settings → Secrets and variables → Actions.

## Запуск пилота

Actions → **Kimi Agent** → Run workflow → параметры по умолчанию
(task-файл пилота, цель — урок PoE, профиль `poe-full`, Draft PR — on).

## Универсальность: новое задание

1. Добавьте task-файл в `.github/agent-tasks/<имя>.md` (образец — пилотный файл:
   контекст, согласованные правки, явные структурные разрешения, какие проверки ожидать).
2. При запуске укажите `task_file`, `target_files` (по одному в строке), `verification`:
   - `tsc` — только компиляция;
   - `structure` — + AST-проверка структуры каждого целевого файла;
   - `poe-full` — + регрессионный тест `scripts/poe-injectors-lesson.test.mjs`
     (пилотный профиль; для будущих заданий с собственными тестами добавляйте
     профиль в workflow аналогично).
3. Проверки — ворота: любой отказ (протокол, извлечение, AST, tsc, регрессия)
   останавливает job до коммита. Артефакты выгружаются всегда.

## Контур безопасности (согласован ранее)

- ровно один платный API-запрос за запуск, без автоматических повторов;
- `stream: true`; `finish_reason` обязан быть `stop`; `[DONE]` обязателен;
- usage обязателен (учёт токенов); битые чанки и данные после `[DONE]` — отказ;
- кандидат, идентичный оригиналу, — отказ;
- извлечение строго по целевым путям (нецелевые файлы и пропуски — отказ);
- AST-проверка: привязка id вариантов ответов, `correctChoiceId` к вопросам,
  иллюстраций — к блокам; согласованные правки (relatedLesson, порядок блоков,
  body) пропускаются;
- diff оригинал/кандидат сохраняется до применения и компиляции;
- коммит и Draft PR — только после всех ворот; merge/deploy не выполняются.

## Параметры API (подтверждены официальной документацией)

Модель `kimi-k3.1-pro`: reasoning всегда включён (`thinking` не отправляется),
`reasoning_effort: high`, `max_completion_tokens: 49152` (обоснование бюджета:
вход ~14k токенов с контекстом, reasoning ≤ ~20k, эхо файла ~11k), `stream: true`.
Источники: platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart;
docs.platform.moonshot.ai (Thinking Models, Troubleshooting, Streaming).

## Installation safety limits (v3.1)
Default mode is audit-only; report is out/report.md in Actions artifacts. Edit steps
are skipped in audit-only. Allowed targets are existing flat src/data/lessons/*.ts
files without symlinks. Tasks must be flat .github/agent-tasks/*.md files.
One request, no retries, 600s timeout, at most 16384 completion tokens (including
reasoning), at most 120000 UTF-8 input bytes, at most four lessons per run.
These are per-run bounds, not an account-wide monetary quota. Parallel runs on
the same ref are serialized. New edit branches must use kimi/agent-run-*.

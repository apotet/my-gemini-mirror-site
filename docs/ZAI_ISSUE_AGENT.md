# Заяц: ZAI Agent через GitHub Issue

После установки workflow на default branch ChatGPT создаёт Issue через GitHub API,
без браузера, labels, workflow_dispatch или действий владельца.
Авторизованный аккаунт: `apotet` (и автор Issue, и sender). Другие пользователи и боты
не запускают запросы. OAuth GitHub connector должен создавать Issue именно от apotet.

POST /repos/apotet/my-gemini-mirror-site/issues
```json
{
  "title": "[ZAI] Независимый аудит HSR",
  "body": "{\"lesson\":\"l2-hsr-redundancy\",\"model\":\"glm-5.3\",\"mode\":\"audit-only\",\"task\":\"Проведи полный независимый инженерный аудит урока.\"}"
}
```

Body — JSON без Markdown fences. lesson: точный ID, название или путь flat lesson.
task: произвольное задание до 12000 символов. files: необязательный список до 12
существующих текстовых файлов src/, docs/, public/lesson-images/; пути без traversal/symlinks.
Ключи model и mode необязательны. По умолчанию glm-5.3 и audit-only.
Единственная явная облегчённая альтернатива: glm-5.3-flash. Fallback отсутствует.

Исходники берутся на SHA события default branch. Полный урок, учебный стандарт,
регламент и явные files; ссылки на урок автоматически найдены в src и передаются
как подписанные excerpts с номерами строк. Для полного связанного файла укажите files.
Оставшийся контекст и браузер — UNVERIFIED. Источники не исполняются, npm не нужен.
Никаких изменений уроков, PR, merge, deploy или production со стороны агента.

## Расходы и повторы

Используется существующий ZAI_API_KEY только в paid step. Один HTTP POST без SDK,
redirects, повторов, инструментов и других моделей. Issues opened — единственный trigger.
Comments/edited/labeled не запускают агент. run_attempt > 1 запрещён. До запроса
создаётся durable claim в Issue; удаление этого комментария нарушает защиту от повторов.
Новый Issue — новое оплачиваемое задание; ChatGPT не создаёт дубликат после timeout.
Это лимит на задание, не общий бюджет аккаунта $3.

Не более 100000 UTF-8 bytes содержимого messages, 2048 токенов резерва framing,
16384 output tokens включая reasoning. Консервативная оценка без cache <= $0.21529
для GLM-5.3; запрос блокируется при оценке > $0.25, контекст не обрезается молча.
Тарифы USD / 1M tokens, проверены 24.11.2026:
GLM-5.3 input 1.40 / cache .26 / output 4.40;
GLM-5.3-Flash .15 / .03 / .50.
Источники: https://docs.z.ai/guides/overview/pricing,
https://docs.z.ai/guides/llm/glm-5.3.
Тарифы следует перепроверять перед заданиями после изменения цен.

accounting.json содержит attempted calls, raw usage, cache, рассчитанную стоимость.
При timeout реальное списание неизвестно — не считать его нулём, не повторять.
Незавершённый ответ сохраняется как partial и job падает без второго запроса.
Artifacts 30 дней: полный ответ, source pack, payload, accounting, диагностический тип ошибки.
Issue получает краткий результат и прямую ссылку artifact; Telegram использует существующий
scripts/telegram-notify.py и секреты TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID.
Подтверждение доставки — message_id и совпадение chat в реальном API-ответе в job logs.

## Оригинальный промт и сравнение

Проверены main, все доступные git branches/history, Issue search. Старые ZAI smoke и PoE
найдены в ci/zai-api-smoke и ci/zai-poe-audit. Найдены краткий PoE-педагогический промт,
HTTP task и Gemini question-review PASS/FIX/REVIEW; это не исходный инженерный промт
Геннадия для полного урока. Оригинал и точные критерии его шкалы **недоступны**.
ROADMAP подтверждает только итоговые оценки /10. Новый полный инженерный system prompt
явно помечен как новый; его оценки нельзя выдавать за точный сравнительный повтор Геннадия.

Бесплатная проверка: python3 scripts/zai-agent.test.py.

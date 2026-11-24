# Gemini L3 через Issue

ChatGPT создаёт Issue от apotet с заголовком `[Gemini L3] Независимый аудит`.
Body — JSON без fences:

    {"branch":"work/applied-l3-20261124","sha":"965160fcfe141a645687a508ef5e97e841b7382f","ids":["gen-port-13","gen-port-6","gen-port-7","gen-port-8"],"model":"gemini-4-hydrogen"}

Только issues opened, автор и sender apotet, attempt=1, durable claim до оплаты.
Один generateContent POST, timeout 420 секунд, без retries, redirects, fallback или CLI.
Используется существующий GEMINI_API_KEY. Source только git show/diff: код ветки не исполняется.
Существующий batch-01-source.json используется только при неизменных src/public относительно
его sourceSHA; иначе бесплатная остановка до API. До четырёх явных ID из этого пакета.
Для следующих партий нужен адресный source pack; инвентаризация 376 не повторяется.
SHA должен соответствовать ветке в момент подготовки. Результат относится только к нему.

Полный source/payload/response/report и api-result в Actions artifacts (30 дней),
отчёт и диагностика также в комментариях Issue. HTTP 429/503/timeout = INCONCLUSIVE,
повторный Issue автоматически не создаётся. Ошибка может расходовать квоту.
Telegram через scripts/telegram-notify.py; доставка подтверждается message_id в logs.
Никаких новых глобальных checks, required gates, правок учебных материалов или production.

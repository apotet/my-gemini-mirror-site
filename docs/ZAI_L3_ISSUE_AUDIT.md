# ZAI L3 через существующий Issue Agent

Создать Issue от apotet: title `[ZAI] Независимый аудит L3`.
Body — JSON без Markdown fences; сначала получить актуальный HEAD указанной ветки:

    {"branch":"work/applied-l3-20261124","sha":"<CURRENT_40_HEX_BRANCH_SHA>","ids":["gen-port-13","gen-port-6","gen-port-7","gen-port-8"],"model":"glm-5.3"}

До четырёх уникальных ID из batch-01-source.json. Код целевой ветки не исполняется:
только git show/diff; пакет применим при неизменных src/public относительно sourceSHA.
Контекст содержит полные вопросы, plain/pro, индивидуальные поля, resolvedBlocks
связанных уроков в обоих режимах, определения найденных терминов и практические маршруты.
Дубли текстов удалены. При изменении учебных исходников нужен новый адресный source pack.

Один POST существующим ZAI_API_KEY, без retries/redirects/fallback; claim до оплаты.
Консервативная верхняя стоимость (UTF-8 bytes + framing, 16384 output tokens,
существующие тарифы $1.4/$0.26/$4.4 за миллион) проверяется до запроса: максимум $0.25.
Неизвестный cache считается uncached. Ошибка/обрезка не запускает повтор.
Исходный pack, payload, response, report.md, accounting.json — artifacts (30 дней),
полный отчёт также в Issue, Telegram через существующий notifier.
Аудит source-only: опубликованный UI и реальные переходы UNVERIFIED.
Режим аудита уроков не меняется. Никаких новых CI gates или изменений учебного контента.

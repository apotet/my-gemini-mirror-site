# Запуск офлайн-тестов

```bash
# из корня репозитория
npm i --prefix tests/vendor --no-save typescript@5.9.3   # нужен для AST-тестов
python3 tests/test_offline.py        # 25 тестов: парсер SSE + AST структуры
python3 tests/test_agent_tools.py    # 17 тестов: payload + извлечение кандидатов
```

Тесты не делают сетевых обращений и не тратят API-бюджет.
Если node/typescript недоступны — AST-блок честно помечается SKIP.

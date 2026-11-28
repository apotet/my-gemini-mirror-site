# Gemini Designer: публичный визуальный разбор на Free tier

Контур предназначен только для существующего ключа бесплатного проекта. Подходит **Gemini 4 Hydrogen**: [спецификация принимает изображения и выдаёт текст](https://aistudio.google.com/docs/models/gemini-4-hydrogen), [официальный Standard Free tier не тарифицирует вход и выход, включая thinking](https://aistudio.google.com/docs/pricing#gemini-4-hydrogen). Эта же модель на платном проекте тарифицируется. Два успешных штатных [List Models](https://github.com/apotet/my-gemini-mirror-site/actions/runs/46125450788) подтверждают, что `GEMINI_API_KEY` видит Hydrogen и его методы, но не подтверждают тариф конкретного проекта или наличие свободной квоты.

**Перед запуском один раз проверьте в [AI Studio](https://aistudio.google.com/projects), что именно проект существующего секрета `GEMINI_API_KEY` отображается как Free tier и не переведён на платный API.** Затем запустите `Gemini Designer Free tier` на `main` от владельца `apotet`: режим `smoke`, поле `free_project` = `same-key-project-is-free-tier`. Это подтверждение тарифа, не разрешение тратить деньги. Не переносить существующий ключ, не заводить новый и не менять платёжные настройки в рамках проверки. Если связка не подтверждается, не запускать. Для рабочего проекта Free tier не нужен денежный профиль, резерв или согласование бюджета.

Один явный новый запуск — один запрос к фиксированному Google `generateContent`. Используются только заранее просмотренные скриншоты общедоступного NetOps из `docs/design-evidence/gemini-public-lessons-v1`; путь, модель и URL не вводятся человеком. Официальные ограничения размера и доступная бесплатная квота действуют. Оба режима используют стандартные параметры модели без собственного потолка выхода или ограничения thinking. При 429, недоступности, неполном ответе или неопределённом результате маршрут останавливается, не повторяется и не производит платный fallback. При желании большей глубины после успешного smoke можно явно запустить `pilot`: он изучает опубликованный урок «TCP/IP: четыре уровня и инкапсуляция», мобильный и настольный в светлой и тёмной темах и обоих режимах чтения, схему инкапсуляции и три лично принятых эталона. В запрос также входят тексты уроков и стандарт; задача только дизайнерская, без правок урока. Произвольного лимита числа идей нет; новую итерацию запускает владелец, а не ответ модели.

В лог выводятся только статус, HTTP и белый список usage. При HTTP 200 без пригодного ответа сохраняются только разрешённые целочисленные счётчики, если они были в ответе, и однозначный положительный счётчик входных IMAGE-токенов при наличии. Эти счётчики не подтверждают, что модель поняла изображение. Фиксированный хост, ключ только в заголовке, без прокси/редиректа; тексты исключений и сырое тело не сохраняются. Артефакт содержит структурированные наблюдения о публичных материалах, не внутренние размышления, ссылки доступа, сырые изображения или ключ. Он не применяется автоматически. Человек сверяет наблюдение модели с исходным PNG — успех HTTP сам по себе не доказывает визуальное понимание. Стоимость `0` указывается для подтверждённого Free tier согласно тарифу, не как выписка Google. Старые маршруты и production не меняются.

`PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=.github python -m unittest discover -s tests -p 'test_gemini_designer*.py'` — только тесты с подставным ответом и учётными данными. Их успех не означает онлайн-тест.

### Owner command from the connected GitHub account

Issue [#591](https://github.com/apotet/my-gemini-mirror-site/issues/591) is the only
comment entry point. `/gennady check` verifies delivery and authorization without
any provider credential or request. The connector must post as the verified
repository owner. Edits, unrelated comments, PRs, forks and reruns cannot launch it.

Before the fixed ARP smoke, the owner must verify that the AI Studio project of the
currently stored `GEMINI_API_KEY` is Free tier. The exact owner attestation is
`/gennady attest same-key-project-is-free-tier`. This attestation is not an
independent billing check. If there is doubt or the key/project changes, post
`/gennady revoke` before running; never post a key or project credential.
After attestation, `/gennady smoke` reserves one attempt on the dedicated issue,
then runs the same fixed screenshot through the existing Free-only runner. A
failed, cancelled or uncertain request is not retried by posting again.
The reservation job has no Google secret; the runner has read-only permissions.
The separate owner-only manual dispatch is unchanged. Do not launch the same
smoke through both entry points. This comment route cannot start the full pilot.

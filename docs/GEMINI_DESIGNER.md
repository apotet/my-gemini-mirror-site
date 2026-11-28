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
independent billing check and expires after 30 minutes. If there is doubt or the key/project changes, post
`/gennady revoke` before running; never post a key or project credential.
After attestation, `/gennady smoke` reserves one attempt on the dedicated issue,
then runs the same fixed screenshot through the existing Free-only runner. A
failed, cancelled or uncertain request is not retried by posting again.
The reservation job has no Google secret; the runner has read-only permissions.
Do not edit or remove the attestation, revocation or reservation comments. To
withdraw consent, post a new revoke before reservation; once reserved, cancel
the workflow to stop queued work (a request already sent cannot be withdrawn).
The separate owner-only manual dispatch is unchanged. Do not launch the same
smoke through both entry points. The smoke command cannot start the full pilot.

For the reviewed ARP smoke HTTP 503 in run 46132217797, the owner separately
authorized one recovery window via `/gennady retry-503` and the same current
Free-tier attestation on #591. It requires the original bot reservation and
writes a separate single-use reservation. Only this fixed entry point may send
up to three sequential ARP requests: 15 and 45 seconds between retries, only
after a definite HTTP 503. A numeric Retry-After can extend a pause to at most
60 seconds; other or larger Retry-After values stop recovery. 429, invalid or
incomplete responses, uncertain transport, reruns, paid fallback and the full
pilot are not retried by this command. The original and manual paths remain
single-request.

The confirmed clean visual result of ARP recovery 46132875247 enables one
separate owner command, `/gennady pilot-tcpip`, on #591. It keeps that
same-project Free-tier attestation, checks the original recovery reservation
and published verified result, and consumes a separate one-use TCP/IP
reservation. Pilot never retries automatically and cannot edit any lesson.
The evidence includes actual 375, 768 and 1440 px views, both color themes and
reading modes, two extra diagram views and the three personally accepted
benchmarks. All observations and design suggestions are for review only.

After the first independent design report, a distinct owner command
`/gennady accept-tcpip` on #591 can assess one exact lesson candidate.
The attached package consists exclusively of fixed public-topic
candidate/baseline screenshots approved for transmission, not pull-request
code, event-supplied URLs, earlier verdicts or personal data. It requires
a current same-key Free-tier attestation, the existing pilot reservation
and a new one-time visual reservation. This command makes one request,
returns evidence and PASS/FIX, and cannot publish or edit the lesson.
Interactions and publication are verified separately.

The first exact candidate acceptance (46137942140) returned a definite HTTP
503 and no result. The one-use `/gennady retry-visual-503` command requires
that original bot reservation, fresh Free-tier attestation and the same pinned
candidate evidence. Only this recovery may retry 503 with the existing bounded
15/45-second strategy. It does not switch models, retry any other failure, or
publish. A successful response with visual FIX is not a release pass and is
never retried automatically.

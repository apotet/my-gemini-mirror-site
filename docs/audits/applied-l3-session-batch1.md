# NetOps — «Прикладной» L3, первая партия: 12 сервисных обменов

**Дата:** 2026-11-18. **Ветка:** `feat/applied-l3-session-transport-batch1-20261118`. **Статус:** подготовлено к CI и независимой приёмке; не staging DONE.

## Ограничение объёма и независимость от L2

- Источник выборки: `src/data/questionLearningLevels.json`, у всех перечисленных ID `status=ASSIGNED`, `learningLevel=3`.
- Только 12 из 376 вопросов L3. Разработка уровня «Углублённый» L2 (160 ID) выполняется отдельно; не изменять PR #253 и работу Codex.
- Банк вопросов, ключи, текст условий, `difficulty`, сохранённые ответы и фильтры режимов **не менялись**.
- Исходные индивидуальные `brief/deep/trap` в `APPLIED_INDIVIDUAL_DEEP` сохранены; добавлен только самостоятельный профессиональный слой `pro`.
- Практические ссылки не добавлены, поскольку подходящий новый стенд не создавался.

## Матрица исправления

| ID | Проверяемый механизм | Новый урок | Исходный ключ |
|---|---|---|---|
| gen-transport-0 | HTTP/1.1, обратная пара TCP-портов | l4-applied-tcp-session-flows | TCP 80 → 51000 |
| gen-transport-2 | независимые SSH session channels | l4-applied-tcp-session-flows | два канала поверх одного транспорта |
| gen-transport-3 | Telnet TCP на настроенном 2323 | l4-applied-tcp-session-flows | 52000 → 2323 |
| gen-transport-4 | FTP PASV control/data | l4-applied-tcp-session-flows | сервер data 50010, control 21 |
| gen-port-9 | TFTP Unknown TID, ERROR 5 | l7-udp-transactions-tftp-ntp-snmp | ошибка на чужой UDP 41000 |
| gen-transport-9 | TFTP RRQ 69, серверный TID | l7-udp-transactions-tftp-ntp-snmp | ACK на 40000 |
| gen-transport-10 | POP3 plain vs implicit TLS | l4-applied-tcp-session-flows | TCP 54000 → 110 |
| gen-transport-11 | NTP response endpoint | l7-udp-transactions-tftp-ntp-snmp | UDP 123 → 45000 |
| gen-transport-12 | IMAP STARTTLS vs implicit TLS | l4-applied-tcp-session-flows | TCP 143 |
| gen-port-13 | SNMP GetBulk: one repeater × 10 | l7-udp-transactions-tftp-ntp-snmp | non-repeaters=0; max-repetitions=10 |
| gen-transport-13 | SNMP Get Response vs Trap port | l7-udp-transactions-tftp-ntp-snmp | UDP 161 → 55000 |
| gen-transport-15 | LDAP Bind/Search same TCP flow | l4-applied-tcp-session-flows | TCP 389 |

## Реализация

- `src/data/appliedL3SessionPro.ts`: 12 предметных `pro`, без копирования `deep` и без шаблонных вставок.
- `src/data/questionExplanations.ts`: точечный runtime overlay, только для перечисленных ID; исходные `brief/deep/trap` сохраняются.
- Два новых урока `src/data/lessons/l4-applied-tcp-session-flows.ts` и `src/data/lessons/l7-udp-transactions-tftp-ntp-snmp.ts`: plain + professional, раздельные разделы протоколов, обратные связи `relatedQuestionIds`, ссылки на RFC.
- `src/data/lessons/index.ts`: регистрация уроков в действующем runtime resolver.
- `src/data/glossary.ts`: шесть определений (SFTP, PASV, STARTTLS, GetBulk, LDAP Bind, LDAP Search), реальные записи в `TOOLTIP_NAMES` для инлайн-подсказок в обоих стилях и адресные ссылки на уроки. `Bind`/`Search` намеренно ограничены префиксом `LDAP`, чтобы не помечать посторонний английский текст.
- `scripts/applied-l3-session-batch1.test.mjs`: проверяет точные ID, уровень, исходные ответы, независимость plain/pro, реальные связи в обоих направлениях, существование терминов glossary и неизменность 160 L2.
- `.github/workflows/ci.yml`: включает регрессионный скрипт и новый `scripts/applied-l3-glossary-dom.test.mjs`, проверяющий фактические `data-glossary-term` кнопки в HTML обоих режимов, в CI.
- `docs/audits/issue-171-baseline.json`: обновлены SHA256 трёх защищённых исходников (questionExplanations.ts, lessons/index.ts и glossary.ts); `bankSHA256` и `auditProjectionSHA256` сохранены.

## Приёмка

Разработка завершена в отдельной ветке. **Не считать тесты или независимую содержательную проверку пройденными, пока не получены реальные результаты на финальном SHA.** При ошибках CI устранить подтверждённые дефекты без изменения ключей и без ослабления защит.

После CI — независимая проверка источников, связей уроков, сохранённых попыток и браузерный smoke. До её прохождения PR остаётся Draft; merge, staging deploy и production запрещены.

**Следующий приоритет:** Codex заканчивает L2 независимо; после его приёмки возвращаемся к отложенному TODO про «Базу» (253 legacy vs 220 L1). Для L3 остаются ещё 364 вопроса вне этой партии.

### Независимая проверка и исправление (18.11.2026)

- Независимая приёмка на SHA `caa058f` обнаружила FIX GATE-05: новые словарные статьи не входили в `TOOLTIP_NAMES`, поэтому карточки терминов работали, а hover/focus в тексте отсутствовал. Проблему исправили добавлением реальных tooltip-метаданных и проверкой HTML через `FormattedExplanation`/`GlossaryText` на plain/pro.
- Для предотвращения ложных подсказок в посторонних текстах generic `Bind`/`Search` переименованы в точные `LDAP Bind`/`LDAP Search` и упомянуты в обоих стилях урока.
- **GATE-09 и GATE-10 оставлены открытыми** до новых CI, проверки всех новых кнопок и независимого PASS на обновлённой версии. Ни PR, ни ROADMAP не объявляют мердж/публикацию.

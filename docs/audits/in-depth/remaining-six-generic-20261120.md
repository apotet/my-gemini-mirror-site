# Углублённый — остаточные шаблонные советы / ловушки, 20.11.2026

**Тип:** инженерная ручная предметная проверка текущих resolved question packs. Это **самопроверка исполнителя**, а не внешнее независимое заключение и не общая 164-ID семантическая приёмка.

## Метод и исходное доказательство

- Снимок runtime content получен в [Actions #44672331430](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44672331430) через `scripts/in-depth-fingerprint-triage.mjs` и `scripts/in-depth-six-generic-audit.mjs`: извлечены реальные `text/answers/correct`, `brief/plain/pro`, `practicalTip/commonTrap` и exact `lessonId#anchor` с полным содержанием linked plain/pro секций. Флаг «generic» был **кандидатом**, не автоматическим вердиктом.
- Предметно прочитаны все шесть, подтверждены **6 FIX исходного снимка**: пять неконкретных `practicalTip` и одна бессодержательная `commonTrap`. У всех шести основной правильный ответ, все дистракторы и оба режима объяснения уже соответствовали условию.
- Во время проверки `l3-16` найдено дополнительное отклонение качества: текущая linked lesson section иллюстрировала longest-prefix-match через четыре маршрута, а билет явно допускает только connected + default. Правильный принцип тот же, но привязка была недостаточно предметной.

## Вердикты и целевые исправления

| ID | Исходный дефект | Содержание исправления |
| --- | --- | --- |
| `l3-16` | Подсказка «ip route / route print — быстрый взгляд на шлюзы» и слишком общая linked section | Сравнение `ip route get`, `route print -4`, connected-prefix против 0.0.0.0/0 и ARP следующего узла; новый точный двустилевой урок `l3-route-selection#in-depth-connected-vs-default-only` |
| `new-ts-photo-panel` | «Сначала линк, затем маршруты и DNS» при отсутствующем оптическом Link | Компоновка TX→RX, проверка SFP, безопасный inspect–clean–inspect, RX/DOM/DDM/измеритель и допустимый диапазон мощности; фото не подтверждает конкретный дефект |
| `review-dot1x-20` | Та же общая L1/DNS подсказка, хотя Link явно UP | EAPOL EtherType 0x888E, controlled port, status 802.1X, RADIUS Accept/Reject/timeout и журналы; platform-specific Cisco `show access-session` с оговоркой |
| `review-ospf-27` | Общий просмотр шлюзов не доказывает сумму OSPF cost | Стоимости исходящих интерфейсов, итоговая метрика, ручной/reference-bandwidth cost; команды OSPF для Cisco IOS/IOS-XE с оговоркой и ECMP |
| `l7-new-04` | Ловушка «Смотрите точные формулировки стандартов и исключения» | HTTP/1.1 persistence по умолчанию при полном Content-Length, отсутствии `Connection: close`; не требовать нового `Connection: keep-alive`, pipelining или TCP keepalive probe. При этом сервер способен закрыть соединение |
| `l3-d07` | Общий просмотр шлюзов без анализа proxy ARP | Проверка IP-маски, on-link маршрута, ARP Target Protocol Address и MAC фактического отвечающего маршрутизатора, proxy ARP policy и зависимых клиентов |

## Сопутствующая ссылка и реальная регрессия

Первая версия ремонта для `l3-16` добавила новый explicit `GROUP2_SECTIONS`, но **[Actions #44672773193](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44672773193) справедливо выявил FAIL**: у одного ID оказалось два конкурирующих `QUESTION_SECTION_LINKS` (новый explicit + прежний existing-heading).

**Устранено предметно, а не отключением теста:** `src/data/lessons/existingUnderstandingHeadings.ts` сохраняет старый `in-depth-existing-l3-16` anchor на прежнем материале для прямых/старых ссылок, но его `questionIds` теперь пуст: новый active resolver направляет `l3-16` **только** на `in-depth-connected-vs-default-only`. И новый `six-generic-audit.mjs`, и общий `in-depth-content.test.mjs` проверяют уникальность активного маршрута; новый test отдельно требует наличие старого anchor в обоих стилях.

## Приёмка

- `scripts/in-depth-six-generic-audit.mjs` теперь отклоняет старые общие подсказки, проверяет все шесть исходных ключей и варианты, target exact lesson sections в plain/pro, 1 активную маршрутную привязку у `l3-16` и сохранённый старый paragraph anchor.
- Read-only Actions [шесть вопросов и браузер 375/1440](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44672987398) — итог проверять по завершении; [остальные 164-ID regressions](https://github.com/apotet/my-gemini-mirror-site/actions/runs/44672987472).
- **Не DONE:** полная независимая семантическая проверка всех 164, согласование исторических fingerprint, GATE-01…10 и опубликованный staging smoke. PR Draft/BLOCK; ни merge, ни deploy, ни production изменений.

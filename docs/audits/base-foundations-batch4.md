# NetOps — «База», партия №4: 20 фото-вопросов по оптической инфраструктуре
**Основание:** `docs/LEARNING_CONTENT_STANDARD.md`; staging `apotet/my-gemini-mirror-site`. Production не менять без отдельного решения.

## Выбор приоритетов
Аудит актуального банка 862/253 beginner показал: основной набор Ethernet/MAC/ARP уже снабжён индивидуальными разбором и связью с большинством уроков; делать повторную стилистическую правку в ущерб пробелам нецелесообразно. Целевая зона пробела — beginner-фото с отсутствующим индивидуальным plain/pro. Зафиксированы ровно 20 ID до внесения правок. Условия, изображения, правильные ответы, варианты, difficulty, попытки и статистика не изменяются.

## Поимённая карта
| ID | Источник ответа / механизм | Фото | Урок | Изменения |
|---|---|---|---|---|
| `photo-lc` | LC duplex, защёлка | `assets/photos/lc-connector.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-sc` | SC push-pull | `assets/photos/sc-connector.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-st` | ST байонет | `assets/photos/st-connector.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-fc` | FC с резьбой | `assets/photos/fc-apc-patchcord.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-lc-sc-order` | LC слева, SC справа | `assets/photos/lc-sc-connectors.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-sfp` | SFP: форм-фактор, не скорость | `assets/photos/sfp-multimode.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-gbic-sfp` | Разобранный GBIC и SFP | `assets/photos/gbic-sfp.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-sm-mm-colors` | Жёлтый SM / оранжевый MM — условно | `assets/photos/sm-mm-cords.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-patchcord` | Пары SC по две с обеих сторон | `assets/photos/optical-patchcords.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-apc` | Зелёная маркировка APC | `assets/photos/fc-apc-patchcord.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-otdr` | X = расстояние в км | `assets/photos/otdr.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-cable` | Свободные волокна без коннекторов | `assets/photos/fiber-cable-12.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-panel` | Пассивный оптический кросс | `assets/photos/fiber-patch-panel.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-lc-latch` | Фиксатор LC | `assets/photos/lc-connector.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-sc-push` | Прямое подключение SC | `assets/photos/sc-connector.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-sc-color` | Оранжевый OM1/OM2 — предварительно | `assets/photos/sc-connector.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-st-bayonet` | Поворотный замок ST | `assets/photos/st-connector.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-st-usage` | Legacy multimode / промышленность | `assets/photos/st-connector.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-lcsc-size` | LC компактнее SC | `assets/photos/lc-sc-connectors.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |
| `photo-sfp-contacts` | Контакты SFP справа | `assets/photos/sfp-multimode.webp` | `l1-fiber-hardware` | Новый brief + 3-абзацный plain + самостоятельный pro + trap |

## Проверки перед merge
- [ ] 20/20: фактический source question correct и варианты ↔ индивидуальный brief/plain/pro; в `scripts/base-foundations-batch4.test.mjs` зафиксированы конкретные ответы и media refs. Автоматический тест — структурное доказательство, не замена ручной приёмки картинок.
- [ ] 20/20: проверенные фото действительно совпадают с буквальными признаками объяснения (особенно ориентация слева/справа; фото № `photo-sfp-contacts`). Если недоступны для независимого визуального просмотра — REVIEW, не merge.
- [ ] Урок `l1-fiber-hardware`: оба режима действительно разные и содержательные, есть обратные question IDs и определения терминов; нет выдуманных практических стендов.
- [ ] CI: typecheck, build, key invariants, explanations quality, glossary, Chromium desktop/mobile.
- [ ] Независимый Codex/reviewer: PASS / FIX / REVIEW по каждому затронутому ID, нет открытых FIX/REVIEW.
- [ ] GATE-01…10, контроль SHA `issue-171-baseline.json`, merge в staging только после PASS.
- [ ] После GitHub Pages: открыть опубликованные вопросы и оба стиля урока, проверить хотя бы репрезентативные фото на desktop/mobile; production не затронут.

**Утверждения о готовом выпуске добавлять только после фактического завершения этих проверок.**

Справочные источники терминов и механизмов: [FOA Fiber Optic Connector Identifier](https://www.foa.org/tech/connID.htm), [FOA OTDR](https://www.foa.org/tech/ref/testing/OTDR/OTDR.html). Фото и формулировки — из собственного банка NetOps, не из внешнего поиска.

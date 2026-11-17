# NetOps «База», финальная партия №7 — 15 индивидуальных пробелов

**Scope:** после merge #247 CI на `390581b5` показывает 238/253 beginner individual. Точные 15 missing ID установлены по исходному банку `ALL_QUESTIONS` (198 main + 55 из extra/monitoring/wifi), реальному resolver `INDIVIDUAL_DEEP`, явно пустым `audited.deep` у `review-poe-29`. Не путать наличие `audited.practicalTip` с индивидуальным разбором. Production не трогать.

## Поимённая приёмка оригинального банка

| ID | Точный правильный ответ | Фото (pinned `1c52fa8`) | Связанный урок | Специальный контроль |
|---|---|---|---|---|
| `gen-port-15` | 389 | — | `l4-directory-remote-industrial-ports` | LDAP 389/TCP StartTLS vs LDAPS 636 |
| `gen-port-16` | 3389 | — | `l4-directory-remote-industrial-ports` | RDP TCP 3389 vs UDP/HTTPS Gateway |
| `gen-port-17` | 502 | — | `l4-directory-remote-industrial-ports` | Modbus TCP 502 not HTTP and not encrypted |
| `photo-gbic-size` | SFP занимает меньше места на передней панели, чем GBIC | `assets/photos/gbic-sfp.webp` | `l1-fiber-hardware` | PASS — compare two chassis sizes, not speed/duplex |
| `photo-blue-upc` | UPC на одномодовом шнуре | `assets/photos/sm-mm-cords.webp` | `l1-fiber-hardware` | PASS with caveat — blue UPC/yellow SMF customary not certification |
| `review-hsr-14` | В двух направлениях кольца | — | `l2-hsr-redundancy` | HSR two copies, unlike STP/PRP |
| `review-poe-29` | Коммутатор — PSE, камера — PD | — | `l1-copper-fault-poe` | PSE vs PD, audited practicalTip preserved |
| `l1v2-a-nick-view` | Сделан глубокий надрез металлического стержня | `assets/photos/copper-wire-nick.webp` | `l1-copper-fault-poe` | PASS — notch in lower solid copper clearly visible |
| `l1v2-a-pass-view` | Сквозной штекер pass-through 8P8C | `assets/photos/copper-pass-through.webp` | `l1-copper-fault-poe` | PASS — eight tips extend past plug front |
| `l1v2-a-corrosion-view` | Неоднородные потемневшие контактные поверхности | `assets/photos/copper-corroded-jack.webp` | `l1-copper-fault-poe` | PASS — dark uneven contacts, exact chemical corrosion NOT proven |
| `l1v2-a-poe-connection` | Через гнездо LAN 8P8C | `assets/photos/copper-poe-port.jpg` | `l1-copper-fault-poe` | PASS — center LAN 8P8C vs BASE-X and USB |
| `l1v2-a-poe-unloaded` | 54,6 В без нагрузки | `assets/photos/copper-poe-result.png` | `l1-copper-fault-poe` | PASS — 54.6V Unloaded Voltage and 13.00W power |
| `l1v2-a-mark-cat6a` | Cat6A | `assets/photos/copper-mark-cat6a.webp` | `l1-copper-fault-poe` | PASS — CAT6A Premium RJ45 Connector on label |
| `l57-x03` | Постоянный редирект | — | `l7-http-status-basics` | HTTP 301 vs 308 method semantics |
| `l57-x17` | Ресурс не найден | — | `l7-http-status-basics` | HTTP 404 not necessarily permanent vs 410 |

## Реальный учебный контент
- 15 раздельно написанных brief («Почему так»), plain (по 3 содержательных абзаца), professional pro, trap и практический совет; **approved** `review-poe-29` practicalTip сохраняется приоритетным (его audited entry без deep объясняет последнюю дырку).
- 4 новых самостоятельных двухстильных урока: `l4-directory-remote-industrial-ports` (3), `l2-hsr-redundancy` (1), `l1-copper-fault-poe` (7), `l7-http-status-basics` (2).
- Два новых вопроса `photo-gbic-size` и `photo-blue-upc` связаны с **уже существующим** содержательным двустильным уроком `l1-fiber-hardware` (без дублирующего урока или переписывания его блоков).
- 9 новых glossary entries; использование существующих терминов из словаря повторное, без перезаписи утверждённых определений.
- 8 оригинальных изображений на 8 photo ID просмотрены по фактическим пикселям из pinned public repo. Для синего UPC и SMF — только распространённая маркировка, не доказательство по цвету; тёмный контакт не равен доказанной химической коррозии; PoE Unloaded 54,6 В не равно мощности 13,00 Вт или напряжению под нагрузкой; ярлык CAT6A — не сертификат готового канала.
- Банк 862 вопросов/ключей/фото/difficulty/попыток не редактируем. Отдельные тематические practicalTip, никакой оптической fallback у медного билета, у HSR/TCP/HTTP — собственная по смыслу рекомендация.

## Обязательные проверки перед staging merge
- [ ] CI `scripts/base-foundations-batch7.test.mjs`: all 15 source answer keys, images, original difficulty, why/plain/pro/trap/tip, links/reverse, glossary, approved `audited.review-poe-29` practicalTip precedence.
- [ ] Независимый Codex проверяет фактический HEAD, соответствие источникам, отсутствие незаметного изменения ранее опубликованных 6 партий и всех 862 вопросов.
- [ ] GATE-01…10, защищённые SHA256, roadmap, responsive browser CI — PASS без открытых FIX/REVIEW.
- [ ] Только staging merge + Pages SUCCESS, потом живой browser smoke в двух режимах по пяти темам: LDAP/RDP/Modbus, GBIC/UPC, HSR, copper/PoE, 301/404.
- [ ] Mobile live viewport обязательно честно маркировать как NOT TESTED, если окружение не позволяет проверить реальную ширину; автоматизированный CI не означает ручной PASS.
- [ ] Production `apotet/netops` не изменять без явной команды владельца.

**Релиз не принят до фактического выполнения критериев.**

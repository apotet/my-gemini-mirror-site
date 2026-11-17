# NetOps «База» — партия №5: медная СКС, монтаж и маркировка (20 фото-билетов)

**Область:** 20 existing beginner `visual-l1` из банка 862 вопросов на staging. Без изменения условий, ответов, картинок, порядка и результатов. Основание: `docs/LEARNING_CONTENT_STANDARD.md` (APPROVED 16.11.2026).

## Почему именно эти 20
После партии №4 отчёт рабочего CI показал **198/253 beginner individual** и **55 без индивидуального разбора**. Все ID из этой партии присутствуют среди непокрытых в `questions.json`. Материалы предыдущих партий не переписываются. Не использовали старую `review-material-coverage.json` как актуальную статистику: это зафиксированный исторический снимок.

## Поимённая сверка с исходным банком
| ID | Точный исходный ключ | Фото (закреплённый commit `1c52fa8`) | Реальный урок | Визуальный статус |
|---|---|---|---|---|
| `l1v2-a-8p8c` | 8P8C, обычно называемый RJ-45 | `assets/photos/copper-cat5e.webp` | `l1-copper-installation` | PASS |
| `l1v2-a-uutp` | U/UTP: экранов не видно | `assets/photos/copper-utp-section.webp` | `l1-copper-cable` | PASS |
| `l1v2-a-stranded` | Пучки тонких проволок под общей изоляцией | `assets/photos/copper-utp-section.webp` | `l1-copper-cable` | PASS |
| `l1v2-a-futp` | F/UTP | `assets/photos/copper-screen-section.webp` | `l1-copper-cable` | PASS с оговоркой: фольга общая, индивидуальные экраны не показаны |
| `l1v2-a-pair-foil` | Фольга вокруг отдельных пар | `assets/photos/copper-sftp.webp` | `l1-copper-cable` | PASS с оговоркой: общую конструкцию кабеля по одному фото не утверждаем |
| `l1v2-a-keystone` | Модуль формата Keystone | `assets/photos/copper-keystone.webp` | `l1-copper-installation` | PASS |
| `l1v2-a-panel-passive` | Оконцевать линии и соединять их патч-кордами | `assets/photos/copper-keystone-panel.webp` | `l1-copper-installation` | PASS |
| `l1v2-a-wall-port` | Среднее прямоугольное гнездо | `assets/photos/copper-wall-plate.webp` | `l1-copper-installation` | PASS |
| `l1v2-a-stripper` | Снимать внешнюю оболочку кабеля | `assets/photos/copper-stripper.webp` | `l1-copper-installation` | PASS |
| `l1v2-a-cutters` | Бокорезы | `assets/photos/copper-cutters.webp` | `l1-copper-installation` | PASS |
| `l1v2-a-punchdown` | Заделывать изолированные жилы в IDC | `assets/photos/copper-punchdown.webp` | `l1-copper-installation` | PASS |
| `l1v2-a-crimper` | Обжимать контактные ножи модульного штекера | `assets/photos/copper-crimper.webp` | `l1-copper-installation` | PASS |
| `l1v2-a-label-category` | Category 7A | `assets/photos/copper-jacket-marking.webp` | `l1-copper-cable` | PASS: печать CATEGORY 7A читаема |
| `l1v2-a-label-lshf` | Малое дымовыделение и отсутствие галогенов | `assets/photos/copper-jacket-marking.webp` | `l1-copper-cable` | PASS: LSHF читается, материал не проверяли испытанием |
| `l1v2-a-label-four-pairs` | Четыре пары, восемь проводников | `assets/photos/copper-jacket-marking.webp` | `l1-copper-cable` | PASS с оговоркой: 4P читается, 8 проводников выводятся из обозначения, не видны на фото |
| `l1v2-a-tone` | Тональный генератор и поисковый щуп | `assets/photos/copper-tone.webp` | `l1-copper-installation` | PASS |
| `l1v2-a-mark-cat5e` | 5e | `assets/photos/copper-mark-cat5e.webp` | `l1-copper-cable` | PASS после самостоятельного осмотра увеличенного снимка: CATEGORY 5E |
| `l1v2-a-mark-cat6` | Cat6 | `assets/photos/copper-mark-cat6.webp` | `l1-copper-cable` | PASS |
| `l1v2-a-pvc-read` | Поливинилхлорид (PVC) | `assets/photos/copper-pvc-label.webp` | `l1-copper-cable` | PASS: 600V PVC читается |
| `l1v2-a-solid-view` | Один сплошной проводник в каждой жиле | `assets/photos/copper-wire-solid.webp` | `l1-copper-cable` | PASS |

## Техническая приёмка
- [ ] Для 20/20: приоритет активного `getQuestionDeepDive` для краткого brief, 3-абзацного plain, самостоятельного pro и ловушки; исходный correct/options/image неизменны.
- [ ] Два двустильных урока с точными обратными связями и словарём: `l1-copper-cable` (11 ID) и `l1-copper-installation` (9 ID). Вымышленные CLI-стенды или практики не добавляются.
- [ ] Регрессии: банк 862 без дубликатов, 20 оригинальных ключей, изображения по точному относительному пути, 2 урока и glossary. CI typecheck/build, browser mobile/desktop, protected snapshot.
- [ ] Независимый reviewer/Codex проверяет кодовый HEAD PR, пояснения и источники, выдаёт замечания без права merge; устранить FIX/REVIEW.
- [ ] GATE-01…10 подтверждается только после фактических проверок. Staging merge только при зелёных обязательных checks; production строго отдельно.
- [ ] После Pages deploy — пользовательская цепочка каталог → один из новых уроков (2 режима) → реальный билет (2 режима) → возврат; desktop/mobile без переполнения.

## Визуальная оговорка
Независимый браузер открыл все **17 уникальных** исходных изображений. Первичный результат: 13 PASS, 4 REVIEW. Дополнительный прямой просмотр исходных пикселей уточнил сложные места:
1. `copper-screen-section.webp`: общий фольгированный слой виден, но термин F/UTP дополнительно сверяется по исходному условию и паспорту. Текст не утверждает, что фото подтверждает каждую характеристику.
2. `copper-sftp.webp`: вокруг отдельных пар видны металлические обёртки, общая оплётка не должна превращать ответ в F/UTP; билет спрашивает **только** индивидуальную фольгу.
3. `copper-jacket-marking.webp`: на печати реально видны `CATEGORY 7A`, `S/FTP`, `4P`, `LSHF`. Восемь жил не видны, но логически следуют из `4P` (4×2), именно это спрашивается.
4. `copper-mark-cat5e.webp`: на увеличенном оригинале видна надпись `CATEGORY 5E`; первичное замечание о размытости не является содержательной ошибкой ключа.

Отдельно: фото не доказывают категорию готовой линии, её сертификат, реальную пожарную стойкость или исправность контактов. Эти ограничения прямо включены в plain/pro.

**Состояние выпуска:** пока PR/CI/review не завершены — PENDING. Не объявлять ни merge, ни публикацию заранее.

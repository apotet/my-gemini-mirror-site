# NetOps «База», партия №6 — оптика: подготовка, сварка, измерения и порты

**Исходное состояние:** после #245/#246 текущий CI сообщает **218/253 beginner individual**. Эта партия закрывает **20 новых ID** из отсутствующих разборов, не меняя ни одного исходного ключа, условия, файла фотографии, количества 862 или сохранённых попыток. **Стандарт учебных материалов соблюдён** по `docs/LEARNING_CONTENT_STANDARD.md`.

## Поимённая матрица источников

| ID | Исходный правильный ответ | Photo (pinned SHA `1c52fa8`) | Точный урок | Визуальный аудит |
|---|---|---|---|---|
| `l1v2-b-coating-tool` | Снять покрытие с волокна | `assets/photos/fiber-coating-stripper.webp` | `l1-fiber-splicing` | PASS |
| `l1v2-b-buffer-tool` | Удалять предусмотренный буфер или покрытие | `assets/photos/fiber-buffer-stripper.webp` | `l1-fiber-splicing` | PASS |
| `l1v2-b-cleaver-name` | Формирует торец сколом | `assets/photos/fiber-cleaver.webp` | `l1-fiber-splicing` | PASS |
| `l1v2-b-screen-before` | Позиционирование концов перед сплавлением | `assets/photos/fiber-before-fusion.webp` | `l1-fiber-splicing` | PASS |
| `l1v2-b-screen-loss-read` | 0,01 dB | `assets/photos/fiber-after-fusion.webp` | `l1-fiber-splicing` | PASS |
| `l1v2-b-protect-next` | Усадить защитную гильзу над стыком | `assets/photos/fiber-sleeve-heater.webp` | `l1-fiber-splicing` | PASS |
| `l1v2-b-sleeve-purpose` | Защитить уже выполненный стык механически | `assets/photos/fiber-sleeves-tray.webp` | `l1-fiber-splicing` | REVIEW: назначение защит, внутренний материал по фото не доказан |
| `l1v2-b-tray-role` | Разместить защиты сварок и запас волокна | `assets/photos/fiber-splice-cassette.webp` | `l1-fiber-splicing` | PASS |
| `l1v2-b-kevlar-purpose` | Укорачивать арамидные армирующие нити | `assets/photos/fiber-kevlar-shears.webp` | `l1-fiber-splicing` | PASS: на фото надпись cutting KEVLAR |
| `l1v2-b-om3-real-label` | OM3 | `assets/photos/fiber-om3-marking.webp` | `l1-fiber-splicing` | REVIEW: надпись при блике слабо контрастна, исходный паспорт не заменяет |
| `l1v2-b-simplex-real` | Simplex: одно оптическое окончание | `assets/photos/fiber-lc-simplex.webp` | `l1-fiber-splicing` | PASS |
| `l1v2-b-tray-real-retainer` | Подходящие по размеру защиты сварок | `assets/photos/fiber-tray-routing-field.webp` | `l1-fiber-splicing` | PASS |
| `l1v2-c-vfl-task` | Для просветки и поиска видимой утечки света | `assets/photos/measure-vfl.webp` | `l1-optical-testing-equipment` | PASS: VFL, сама утечка не наблюдается |
| `l1v2-c-power-read` | −15,88 dBm | `assets/photos/measure-power-reading.webp` | `l1-optical-testing-equipment` | PASS: средняя строка −15.88 dBm |
| `l1v2-c-inspection-tool` | Осматривают поверхность торца | `assets/photos/measure-inspection.webp` | `l1-optical-testing-equipment` | PASS |
| `l1v2-c-trace-units` | В футах (ft) | `assets/photos/measure-otdr-traces.webp` | `l1-optical-testing-equipment` | PASS: ft на оси и Range |
| `l1v2-c-closure-purpose` | Стыки и запас волокон внутри соединительной муфты | `assets/photos/passive-splice-closure.webp` | `l1-optical-testing-equipment` | PASS: муфта, не вскрыта |
| `l1v2-c-converter-path` | 100BASE-TX и 100BASE-FX | `assets/photos/passive-media-converter.webp` | `l1-optical-testing-equipment` | PASS: обе надписи на панели |
| `l1v2-c-poe-marked-ports` | Порты 1–4 | `assets/photos/power-switch-ports.webp` | `l1-optical-testing-equipment` | PASS: скобка POE над 1–4 |
| `photo-cable-colors` | Свободные волокна без коннекторов; подготовить нужные волокна к сварке с совместимыми LC-пигтейлами | `assets/photos/fiber-cable-12.webp` | `l1-fiber-splicing` | PASS: нет корпусов LC/SC/FC |

## Новый учебный материал

- `src/data/baseFoundationsBatch6.ts`: для **каждого** из 20 реальные индивидуальные краткий «Почему так», 3 абзаца plain, отдельный инженерный pro, типичная ошибка и индивидуальная правильная практическая подсказка. Поля не повторяют вопрос и не подменяют отсутствующий стенд.
- `src/data/lessons/l1-fiber-splicing.ts`: 13 связей, подготовка волокна, Micro-Strip/скалыватель, до/после fusion, расчётный Loss, защита КДЗС и кассеты, OM3, simplex и LC-пигтейлы.
- `src/data/lessons/l1-optical-testing-equipment.ts`: 7 связей, VFL, измерение dBm/dB, OTDR/ft, осмотр торца, оптическая муфта, 100BASE-TX↔FX и портовая маркировка PoE. Оба урока имеют отдельные plain и professional.
- 15 отсутствовавших словарных терминов, старые glossary entries сохраняются.
- Регрессионный тест `scripts/base-foundations-batch6.test.mjs`: исходные key/image/difficulty, все 20 individual layers + tailored practicalTip, обе лекции и словарь, банк 862 unique. Особое внимание: `Loss 0,01 dB` является **оценкой сварочника**, а ft на OTDR — **футы**; не допустить повторения ошибочных советов оптики/меди.

## Зрительная сверка фото
Файлы взяты **не из поиска и не сгенерированы**, а открыты с реального pinned public источника `apotet/osi-tcpip-exam-public@1c52fa8`, **20/20 фактически просмотрены**. 18 хорошо различимых признаков соответствуют источнику. Две оговорки:
- `l1v2-b-sleeve-purpose`: кадр показывает кассету и зоны/держатели защит; свойства материала КДЗС и реальные потери стыка по пикселям не проверяются. Текст описывает принцип действия и не утверждает, что конкретная сварка измерена.
- `l1v2-b-om3-real-label`: маркировка на яркой оболочке слабо контрастна и читается не идеально; первоначальный банковский ключ OM3 не переписывается, а текст подчёркивает необходимость паспорта.
Для `measure-power-reading.webp`, `fiber-after-fusion.webp`, `measure-otdr-traces.webp`, `passive-media-converter.webp`, `power-switch-ports.webp` числовые значения и метки видны. Сам по себе снимок корпуса муфты не доказывает герметичность и исправность линии.

## Предрелизный регламент
- [ ] CI на фактическом HEAD: typecheck/build/questions integrity/20-ID test/browser responsive/4 states.
- [ ] Независимый Codex code review без открытых FIX/REVIEW. Утверждение о просмотре 20 фото не переносить на Codex без фактов.
- [ ] Согласовать две оговорки и отсутствие рисков по фото/ключам; если независимый reviewer оспорит, не мержить до исправления.
- [ ] GATE-01..10 = PASS с доказательствами (самоотметка недостаточна).
- [ ] Staging merge/Pages deploy только после CI и независимого review; production `apotet/netops` не изменять.
- [ ] После деплоя проверить живой UI: оба урока, 2 режима, `l1v2-b-screen-loss-read`, `l1v2-c-power-read`, `l1v2-c-poe-marked-ports`, разные практические подсказки, mobile 390px, старые 2–3 билета не ломаются.

**Не объявлять выпуск выполненным до фактического CI, независимого аудита и браузерной приёмки.**

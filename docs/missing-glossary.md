# Проверка подчёркнутых терминов и glossary

Дата проверки: 2026-11-14. Ветка: `main`.

## Итог

**Подтверждённых терминов, которые отображаются подчёркнутыми, но не имеют записи в итоговом `GLOSSARY`, не найдено в проверенных источниках.**

| Термин | Файл | Есть в glossary |
| --- | --- | --- |
| — (отсутствующих не выявлено) | — | — |

## Что проверено

- 50 зарегистрированных уроков из `src/data/lessons/index.ts` (включая основные и `professional.terms` массивы).
- `src/data/questionExplanations.ts` и `src/data/questionExplanationsApplied.ts`: явных `glossary-link`, `data-term` и `underline` в текстах нет.
- `src/components/LessonView.tsx`, `src/components/LessonTermTags.tsx`, `src/components/TheoryRazbory.tsx`, `src/components/ExamReview.tsx`, `src/components/GlossaryText.tsx`, `src/components/GlossaryText.css`, `src/utils/glossaryText.ts`.
- `src/data/glossary.ts`: проверены прямые записи `GLOSSARY` и имена из `TOOLTIP_NAMES`.

## Важное различие

`LessonTermTags` подчёркивает **все** элементы `lesson.terms` / `professional.terms` через класс `underline`. Карточка берёт описание из `GLOSSARY[term]`.

При этом в `glossary.ts` есть не только прямые записи `GLOSSARY`, но и `TOOLTIP_NAMES`: цикл `for (const [term, ...] of Object.entries(TOOLTIP_NAMES))` добавляет отсутствующие ключи с определениями в `GLOSSARY`. Поэтому поиск только по статическим ключам даёт ложные «пропуски». В частности, `Root Guard`, `Loop Guard`, `SFP`, `DTP`, `ACL`, `MSTP`, `MSTI`, `CIST`, `UDLD`, `SNAT`, `NAPT` и `NAT overload` получают определения через этот механизм.

`GlossaryText` вызывает `splitGlossaryText`, где шаблон строится **только** из ключей `GLOSSARY_TOOLTIPS`. Следовательно, текстовый термин, которого нет в этом наборе, не будет автоматически подчёркнут данным компонентом. `TheoryRazbory` и `ExamReview` отключают `GlossaryText` в профессиональном режиме.

## Ограничения

Это статическая проверка перечисленных файлов и зарегистрированных уроков, а не браузерный обход всех экранов приложения. Произвольные компоненты за пределами перечисленных не подтверждены как проверенные. Прямые ссылки и обычное подчёркивание интерфейса не приравнивались к терминам словаря. Код и данные словаря не менялись.

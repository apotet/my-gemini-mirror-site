## Closeout 20261124

**Действующее решение владельца:** закрыть GATE-06 по `NETOPS-L2-CLOSEOUT-2026-11-22` через отдельный immutable acceptance registry, без нового аудита 164, изменения материалов или переписывания исторических REVIEW. Это явное решение о приёмке по ограниченному регламенту, а не утверждение, что все 164 комплекта заново независимо прочитаны.

**Frozen учебный источник:** staging `main@b809540b3d1e988907c1c5d642a945d2fbcc28e6`, после разрешённого merge PR #335 (проверенный HEAD `43f33ebe29015c8dd571005e5bef815fdcdcf332`, все 7 выполненных CI checks SUCCESS). `src/` идентичен ранее проверенному коду 9b1397b и адресно принятому 3983019. Новый PR `fix/l2-gate06-closeout-20261124 -> main` меняет только guard/tests/CI/acceptance docs, не учебные исходники.

### Фактический один read-only прогон трёх кандидатов

На локальном клоне через три отдельных `git worktree` в `/tmp`, каждый SHA выполнен ровно один раз. Экспортированы реальные resolver/glossary функции соответствующей версии, без правок tracked-файлов. Формула: `sha256(JSON.stringify({question, deep, lesson: expanded, definitions}))`, expanded plain/pro, сортированный список используемых definitions. Лимита/assert на 164 в историческом пуле нет. Сравнение с неизменёнными 160 `materialHash` из final-review-1/4:

| SHA | Фактический пул | matched/160 | mismatch | missing |
| --- | ---: | ---: | ---: | ---: |
| `188c6938ecb2c6563ba228fd31b5fa4fc74b94e4` | 160 | **149/160** | 11 | 0 |
| `6e9fd840ef91f65430a032b5ece02ef056e08a2b` | 164 | **118/160** | 42 | 0 |
| `d08d24c814c4a60731d42addeb7ef7b4b3a16cef` | 160 | **0/160** | 160 | 0 |

Ни один кандидат не объявляется единым доказанным историческим freeze. Результат диагностики не препятствует явно утверждённой текущей приёмке по четырём этапам и не выдаётся за новый смысловой аудит.

### Действующие GATE-05/06 и основания приёмки

| Gate | Вердикт принятия | Основание |
| --- | --- | --- |
| **GATE-05** | **PASS** | 7/7 маршрутов: DNS `l7-new-03`, TCP SACK `l4-d05`, PAT `l3-d05`, SLAAC `review-slaac-4`, RSTP `stp-new-04`, QoS `review-qos-22`, PoE `review-poe-30`. Существующий [Gemini report + проверка FIX](gemini-seven-route-reconciliation-20261123.md): два MAJOR исправлены и проверены в main@b22984c; два MINOR не воспроизводились на frozen source. Принятие этих семи маршрутов подтверждено решением владельца; новый повторный аудит не запускался. |
| **GATE-06** | **PASS по closeout acceptance** | [Реестр 164 ID](closeout-acceptance-20261124.json): 7 `PASS_DIRECT_AUDIT`, остальные 157 `ACCEPTED_BY_CLOSEOUT_POLICY`, на четырёх этапах решения и GATE-01…04/07…09. Не подменяет исторические REVIEW на PASS и не называет 157 прямыми аудитами. Фактический executable strict PASS обязателен на финальном SHA нового PR. |

Общие доказательства: [четырёхэтапное решение](../../IN_DEPTH_CLOSEOUT_DECISION_20261122.md), [существующая реконсиляция](gate06-integrator-decision-20261124.md), [принятые 9 полных пакетов + 2 дельты](gate06-targeted-semantic-acceptance-20261123.md), [33 точных component hashes](gate06-targeted-semantic-hashes-20261123.json). Семь прямых маршрутов имеют указанную выше рецензию и адресную интеграторскую проверку; 157 принимаются **по явному решению владельца**, а не по выдуманным независимым рецензиям.

Технические GATE-01…04/07…09: существующие [Fast PR](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45287036373), [Understanding/history](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45287036421), [4 states / 7 surfaces](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45287036748), [164 × 2 Chromium](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45287036279) на HEAD #335. В новом PR обязательный workflow `Understanding strict closeout acceptance` выполняет один раз на финальном SHA unit guard, strict fingerprint **без --report-only**, content/history, lint/build. Его фактические результаты и SHA закрепляются в PR/Actions; старый CI не представляется новым запуском.

### Fail-closed и append-only контракт

- Старый `evaluateInDepthFingerprintPolicy` сохранён: исторические REVIEW по-прежнему дают исторический BLOCK. Этот отдельный диагностический статус сохраняется в `historicalPolicy`; он не подменяет действующее утверждённое closeout-решение.
- Новый evaluator требует ровно 164 уникальных ID с тем же множеством, валидными SHA256, policyBasis/evidence/status, полным `currentHash === materialHash`. Семь прямых ID строго определены; переименование policy acceptance в direct audit блокируется.
- Оригинальные **байты** датированного реестра закреплены SHA256 в guard. Переписывание/удаление/добавление существующих записей, даже одновременная правка accepted hash и материала, даёт BLOCK. Append-only означает новую отдельную версию при будущей явно разрешённой приёмке, а не редактирование этой датированной записи. Автоматического rebaseline нет.
- Недоступный/повреждённый реестр, пропавший evidence file, новый/пропавший ID или одно несовпадение хеша дают **BLOCK и exitCode=1** в strict CLI. `--report-only` остаётся исключительно диагностическим; обязательный CI вызывает strict CLI.
- Формула materialHash не менялась: любое будущее изменение вопроса/разбора/expanded урока/относящихся к нему определений, меняющее хотя бы один из 164 payload, блокирует приёмку.

**Исторические final-review-1.json/final-review-4.json, базовые snapshots и status=REVIEW не изменены.** Production `apotet/netops` не затрагивается. Урок `l1-poe-injectors-splitters` остаётся на staging до отдельного «ОК» владельца для переноса. Новый closeout PR не даёт такого разрешения. GATE-10 нового closeout PR — отдельный merge/Pages/live-smoke, здесь не объявляется выполненным.

---

## Предыдущие записи (исторические снимки, заменены решением выше)

## Актуальное интеграторское решение — 24.11.2026

Candidate #335 `c8f0434`, проверенный код `9b1397b` (после него только документы). [Точный итог и остаток](gate06-integrator-decision-20261124.md). Сверка существующих 9 полных ID-пакетов и 2 дельт: **33/33 hashes PASS**, история/защита банка PASS, семь CI SUCCESS. Новый полный семантический аудит не выполнялся.

**GATE-06 BLOCK / L2 CONTENT ACCEPTED NO / GATE-10 NOT STARTED.** Старые 160 REVIEW и текущие дельты требуют законченного доказательного переноса существующих заключений; адресные PASS не являются автоматическим принятием остальных материалов. Следующий шаг — реконсиляция имеющихся evidence, не новый круг переписывания кода. Старую таблицу ниже читать как исторический снимок #324, а не фактическое текущее состояние #335. Merge/deploy/production не выполнялись.

---

# NetOps — L2 GATE-01…10: explicit release matrix, 23 November 2026

**Candidate:** Draft PR #324 at content SHA `b2557f027b500bbe6ea030b49330c54254214904`, staging base `main@298a68f6`. **Authoritative policy:** `docs/IN_DEPTH_CLOSEOUT_DECISION_20261122.md` + `docs/LEARNING_CONTENT_STANDARD.md`.

**Important:** The prior policy requires GATE-01…10 but does not define their complete numbering or test mapping. This document proposes that missing operational mapping for the existing approved scope. It does not assert that ten previously defined gates were tested. PASS is scoped strictly to observed evidence for the frozen content SHA.

| Gate | Release acceptance condition | Evidence | State |
| --- | --- | --- | --- |
| **01 — Bank integrity** | Exactly 862 questions, 164 L2 IDs, unchanged approved answers/registry and stage-2 protected sources | `test:learning-levels`, `test:in-depth`; [reconciliation #45102392855](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45102392855) | **PASS** |
| **02 — Lesson mapping** | All 164 have individual why/plain/pro, exact two-mode section, linked glossary and only existing practice destinations | `test:in-depth`; [Understanding regression #45102392870](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45102392870) — **structural**, not semantic proof | **PASS (structural)** |
| **03 — History** | Saved/shuffled/legacy attempts including `tr-03` and `tr-10` | `test:in-depth-history`; [#45102392870](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45102392870) | **PASS** |
| **04 — Scoped terms** | IPv6 A=1/SLAAC not DNS A, PoE/LLDP terms and platform-scoped CLI, two-mode tooltips | [Fast PR #45102392931](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45102392931), [Chromium surfaces #45102392847](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45102392847) | **PASS (targeted)** |
| **05 — Independent semantic audit** | Gemini independently evaluates seven difficult DNS/TCP/NAT/IPv6/STP/QoS/PoE routes and changed fields; integrator verifies FIX/REVIEW | Hand-off in PR #324; no accepted final Gemini verdict | **BLOCK / UNVERIFIED** |
| **06 — Semantic fingerprints** | Exact 164-ID fingerprint report with no silent promotions of new IDs, modified content, missing old IDs or unresolved REVIEW/FIX/UNVERIFIED; provenance tied to frozen material | [standalone #326 diagnostic workflow #45109543282](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45109543282): 164 current, 160 prior; 10 equal, 150 changed, 4 new, historical 160 REVIEW; strict fingerprint release gate BLOCK | **BLOCK / UNVERIFIED** |
| **07 — Review states** | Four material states and seven surfaces, mobile 375 px / desktop 1440 px | [Chromium surfaces #45102392847](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45102392847) | **PASS** |
| **08 — Full browser paths** | All 164 question-to-section routes, both viewport sizes, functional return/navigation | [4 Chromium shards #45102392934](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45102392934) | **PASS (test fixture)** |
| **09 — Build/regressions** | TS, build, PoE regressions, no out-of-scope source/protection drift | [Fast PR #45102392931](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45102392931), [stage-2 #45102392855](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45102392855) | **PASS** |
| **10 — Staging release** | Only after other gates: staged merge, deployed GitHub Pages, fresh published-site smoke; production only with explicit owner approval | #324 still Draft, no deployment or live-site acceptance | **BLOCK / NOT STARTED** |

## How the two types of approval remain distinct

**Mechanical provenance gate:** `scripts/in-depth-review-fingerprint.mjs` must fail closed by default on new IDs, changed hashes, missing historical IDs and historical statuses other than `PASS`. `--report-only` is an explicitly diagnostic flag; its successful process exit must **never** be reported as content PASS. Current historical final-review files contain 160 `status=REVIEW` records. A subfield `semanticStatus=PASS` or equal hash is **not** a whole-record accepted independent verdict.

**Approved limited content closeout:** seven routes plus changed semantic fields (not a new full audit of 164) remain the scope under `NETOPS-L2-CLOSEOUT-2026-11-22`. To reconcile existing old REVIEW rows with that policy, record an explicit evidence-backed policy decision rather than rewriting historical statuses, removing a guard, or claiming 164 independent semantic PASS. New confirmed systematic defect must be checked across affected class. Any still-unverified mandatory gate means **no merge**.

**Release verdict at this snapshot:** GATE-05, 06 and 10 remain **BLOCK**; PR #324 not CONTENT ACCEPTED, staging merge and production deploy prohibited. This checklist by itself does not add approved evidence.

## Actual fingerprint evidence — GitHub Actions, 23 November 2026

- Diagnostic [Understanding fingerprint policy run #45109543282](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45109543282) completed **SUCCESS**, including seven independent policy tests and `--report-only` with actual `esbuild` bundle. `fingerprintGate=BLOCK`; 160 prior rows, 164 current IDs; **10 identical**, **150 mismatch**, **4 new**, **160 prior statuses REVIEW**. The workflow PASS proves the diagnostic and unit tests worked; it does **not** overrule the semantic block.
- [Fast PR #45109543242](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45109543242) **SUCCESS** for typecheck/build/PoE regressions. No browser rerun requested. Difference count can reflect updates in shared material, not necessarily 150 content bugs.
- New candidate code branch has **no** educational source modification relative to the frozen content of #324. Strict gate release acceptance remains pending independent review and explicit evidence-backed policy reconciliation, not hash rebaseline.

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

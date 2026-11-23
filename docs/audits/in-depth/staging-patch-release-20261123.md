# NetOps · 23.11.2026 · Staging patch release decision (NOT full L2 acceptance)

**Scope:** consolidate staged Draft PR #324 → #326 → #327 into one **technical bugfix patch** for existing staging site `apotet/my-gemini-mirror-site`. The approved 164-question Understanding material was already in staging main through #264. This document does **not** retroactively accept all of it.

**Authoritative:** `docs/IN_DEPTH_CLOSEOUT_DECISION_20261122.md`, `docs/LEARNING_CONTENT_STANDARD.md`, [L2 release gates](l2-release-gates-20261123.md). The owner confirmed progression to integration/staging after receiving full audit and verification report. No authorization for production.

## Factual technical release basis

- **Exact candidate content branch:** #327 at `d25483fa7e4e9c81801c99d71a1c0d3af0086a6d` before this release-document-only update. Source branch contains all #324, #326 and #327 commits from stage main `298a68f6ac5c11facbc77732625f7dd26918b63e`. Compare changed-file list before merging, keep version-control/provenance intact.
- **No new questions/answers/keys or changes in user-accepted PoE budget lesson:** all 862 items, 164 L2, archived history and stage-2 protected files verified by approved #324 runs [#45102392870](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45102392870), [#45102392855](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45102392855).
- **Independent seven-route audit** on #324 content SHA `b2557f0`: Gemini supplied 4 PASS, 3 FIX routes (2 real MAJOR). Integrator compared all alleged defects to source: two claimed MINOR already correct on frozen SHA (`MAC-таблице`, TCP SACK `[Left Edge, Right Edge)`). See [evidence and affected-surface analysis](gemini-seven-route-reconciliation-20261123.md).
- **Targeted source fixes** in #327: `EngineeringReview` + previously missed independent `TheoryRazbory` renderers receive IPv6/PoE scoped glossary; `LessonView` gains `l1-poe-screen-reading`. Plain/pro/review/lesson return, PoE and IPv6 context and touch/hover checked at 375/1440 on [#45114129410](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45114129410) **SUCCESS**.
- **Whole regression:** [164-ID Chromium #45114129394](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45114129394) **SUCCESS**, four shards; [Fast PR #45114129423](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45114129423) **SUCCESS**. These do not prove semantic quality for all 164.
- **Fingerprint diagnostic:** [#45109671995](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45109671995) **technical workflow success but strict gate BLOCK**: 160 historical status=REVIEW, only 10 hash matches, 150 changed, four absent from old 160 snapshot. No silent rebaseline, no historical PASS promotion and no override of strict script.

## Explicit separation of release scopes

**A — Limited staging technical bugfix patch:** This is a risk-reducing correction of confirmed defects already present on staging, with independent discovery, source reproduction and address-specific browser regressions. It **may be staged** if GitHub reports a mergeable, clean cumulative diff and all required technical PR CI on final release SHA succeed. This does not assert content review completion. After staging merge, GitHub Pages deploy and a smoke of **published** pages must succeed; otherwise technical release remains incomplete.

**B — L2 CONTENT ACCEPTED:** **NOT APPROVED.** GATE-05 remains limited to independent 7-route audit and code-fix integration rather than a statement covering 164; strict GATE-06 remains **BLOCK** (160 historical REVIEW and 150 current deltas). GATE-10 is NOT PASS until live Pages smoke after merge. Unreviewed 164-level semantic quality risks are not silently waived. The approved seven-route limited review plan remains, and the owner accepts individual lessons separately.

**Never** call CI PASS a semantic PASS, remove strict fingerprint checks, rewrite old reviewer records, close all previous audit history as 'content done', or touch production `apotet/netops`. If final PR CI fails, live Pages smoke fails, or changed-files/scope unexpectedly expands, STOP rather than merge.

## Patch-release acceptance

- [x] Existing user-accepted PoE budget lesson source unchanged by cumulative compare
- [x] Confirmed scope defects corrected; two outdated MINOR requests rejected with exact source evidence
- [x] Independent seven-route audit exists, real prior MAJORs source reproduced
- [x] Complete 164-ID Chromium, history, stage-2 checks, targeted mobile/desktop interactions PASS on scoped patch code
- [ ] Final release-doc-only SHA PR checks clean
- [ ] Staging main merge performed and SHA captured
- [ ] GitHub Pages deploy success and live published-page smoke
- [ ] Historical semantic fingerprint GATE-06 resolved for **full L2 content acceptance** (separate future acceptance, not relabeled by this patch)

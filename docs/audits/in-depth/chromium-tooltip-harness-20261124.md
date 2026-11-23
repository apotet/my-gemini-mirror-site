# PR #335 — Chromium tooltip test repair (2026-11-24)

Scope: browser harness only. Parent: `cc17873968a6c37a1ba70dc8486c280d10bc745d`.

## Confirmed original failure

[Job 138005489829](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45263870334/job/138005489829), shard 2, `photo-txrx-link`, 1440 px: timeout at `scripts/in-depth.browser.mjs:65:148`. This is the **first tooltip assertion in the question explanation**, before the lesson opens, not a tooltip inside the fiber lesson. Other browser shards passed.

## Diagnosis and limits

Five isolated, unmodified mobile/desktop runs of this ID passed. The immediately preceding `new-ts-duplex` → `photo-txrx-link` sequence also passed. The original CI failure therefore was not deterministically reproduced merely by opening this question.

A controlled stationary-pointer experiment reproduced the same timeout: hover the real `duplex` term, dismiss with Escape, then call `hover()` again without moving the pointer outside. No new pointer entry occurs, so the dismissed tooltip stays closed. The component also intentionally dismisses on scrolling. This establishes a test precondition problem; it does **not** prove which scroll/pointer ordering occurred in the original CI run (that run had no event trace).

## Change

Before desktop hover, move the pointer to (0, 0), outside question content, then scroll the term into view and perform a real hover. Retain real mobile tap and desktop keyboard-focus assertions. Add explicit Escape dismissal, fresh pointer re-entry and tooltip ownership (`aria-describedby` matches tooltip ID). No retry loop, skipped assertion, increased timeout, forced tooltip state, or synthetic pointer event.

No `src/`, content, answer key, historical snapshot, baseline, registry, or fingerprint policy is modified. Стандарт учебных материалов соблюдён.

## Validation

- TypeScript, build, 164-ID content contracts/anchors, targeted semantic regressions, saved-history compatibility, approved learning-level/protected-source checks, and review navigation: PASS locally.
- Real Chromium 143.0.7499.0, Playwright 1.57.0: `new-ts-duplex` and `photo-txrx-link`, 375/1440 px, both question and lesson styles, anchors/return/history/layout, hover/tap/focus, Escape and pointer re-entry: **3 consecutive runs PASS = 12 route/viewport scenarios**. Each run also checks historical saved-session recovery.
- New GitHub CI must be read on the pushed commit. A successful rerun of the parent is not CI for the repair commit.

GATE-06 remains BLOCK and L2 CONTENT ACCEPTED remains NO. This repair does not settle the separate provenance/semantic acceptance decision; no merge/deploy or production change is authorized by this report.

## Follow-up after real CI on 1034f2a

[Shard 2](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45268880339/job/138023048876) failed at the same first tooltip assertion for `photo-txrx-link`/1440. Pointer re-entry alone was insufficient. Fast PR, Understanding regression and four-state/seven-surface CI passed on that commit. The original unmodified 41-ID shard also passed locally (82 viewport scenarios), confirming that local success does not settle this CI failure.

The follow-up waits for the trigger rectangle and page scroll coordinates to remain stable for 100 ms after scrolling (bounded at 5 seconds), before hovering/tapping. This lets pending scroll events finish; it does not increase tooltip wait time or retry a failed assertion. It also captures a failure screenshot plus actual trigger/hover/tooltip DOM state. Pending-scroll ordering remains a hypothesis until the next CI result; no claim of a confirmed fix is made from local results alone.

## Final verified CI

Tested code SHA: `9b1397b68683b3788dd30387427884e0ec5e42eb`.

- [Fast PR #45270245018](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45270245018): SUCCESS.
- [Understanding regression #45270245004](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45270245004): SUCCESS.
- [Four material states / seven surfaces #45270245231](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45270245231): SUCCESS.
- [Chromium 164 IDs / 375+1440 px / four shards #45270244923](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45270244923): all four SUCCESS, **328 route/viewport scenarios**. Previously failing [shard 2](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45270244923/job/138027850947) finishes with 41 IDs × two viewports PASS.

All **seven executed checks** are SUCCESS; two unrelated conditional jobs are SKIPPED and are not counted as PASS. The current harness passed against a fresh lockfile build locally as well. An additional local desktop check served the exact pinned 1201×900 source photograph and passed; that check does not establish external image delivery in the user's browser.

The final report-only commit uses `[skip ci]` to avoid rerunning broad browser CI on unchanged product/test/workflow sources. These are explicitly CI results for `9b1397b`, not newly executed CI for the documentation commit. Product, scripts and workflows in the report commit are identical to that tested code SHA. Exact old-run event ordering remains unknown; the established result is that scroll settling plus fresh pointer entry passes full CI without weakening tooltip assertions.

Technical tooltip test repair: COMPLETE. **GATE-06 BLOCK / L2 CONTENT ACCEPTED=NO** remains a separate content/provenance decision. No merge, deploy or production changes.

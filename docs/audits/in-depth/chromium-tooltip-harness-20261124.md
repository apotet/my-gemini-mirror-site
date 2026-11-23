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

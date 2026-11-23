# Stage-2 protected-files: independent reconciliation, 23 Nov 2026

**Scope:** staging only, `apotet/my-gemini-mirror-site`. Main baseline under review: `5d0763401d75db68aa01468441b12439b1e0df8a`. Parent blocker: [Understanding PR #324](https://github.com/apotet/my-gemini-mirror-site/pull/324).

## Why this exists

`npm run test:learning-levels` failed on the first changed protected source file `src/components/GlossaryText.tsx`, because `docs/audits/issue-171-baseline.json` contains older SHA-256 values for **10 of 178** protected sources. This is an intentional all-files protection: **DO NOT** remove this assertion or wildcard the allowlist. [Read-only stage2 scanner](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45100507104) confirmed all 10 actual source hashes directly on CI runners; the audit only updates the exact 10 existing baseline values.

## Provenance of the changes since the protected snapshot

| File | Git history confirming source changes in merged staging main | Reason and review boundary |
|---|---|---|
| `src/components/GlossaryText.tsx` | `8d0a8ab`, `bfee0b1`, `a2e229d` (#318) | Existing mobile/touch glossary and PoE-scoped tooltip behavior |
| `src/components/KnowledgeBase.tsx` | `a7ae5e6` | 11 lessons moved to correct knowledge categories; remaining lessons marked pending, not auto-accepted |
| `src/components/LessonTermTags.tsx` | `32d9373` (#298) | Remove wrong "разобрать в теме" link in copper term tags |
| `src/components/LessonView.tsx` | `9c83706`, `44687d0` (#314), `c4793d1` (#319), `d3a73fd` (#321) | PoE reading modes, check answers, contextual glossary and neutral informative styling |
| `src/components/ZoomableImage.tsx` | `8df1d6b`, `81c7e1e` (#304) | Quiz/lesson image pan and pinch/wheel zoom |
| `src/data/glossary.ts` | `9c83706`, `44687d0` (#314), `a2e229d` (#318), `25d062c` (#320) | PoE terms, DC resistance unbalance, A/B vs DNS context, and other appended definitions |
| `src/data/lessons/index.ts` | `cc72f1f`, `ca2ecf2`, `9c8503e` | Registered PoE budget, PoE CLI diagnostics and injector/splitter lessons |
| `src/data/lessons/ts-method.ts` | `a7ae5e6` | Corrected lesson category / review status, not rewriting bank keys |
| `src/data/lessons/types.ts` | `66fe379` (#307), `9c83706` | Lesson case metadata and mode-synchronized PoE self-checks |
| `src/utils/glossaryText.ts` | `10ef676` (#302), `bfee0b1`, `a2e229d` (#318), `25d062c` (#320) | Avoid DNS A/FTP false positives and restrict PoE-only terms to their contexts |

The commit history establishes **provenance of code already on staging main**, not semantic acceptance of all affected lessons. In particular, this refresh does **not** grant USER ACCEPT to any unapproved lesson.

## Exact guardrail

- Retain **all 178 protected paths** and their validation.
- Replace **only these 10** SHA256 values, using the read-only runner-calculated actual hashes in [scan #45100507104](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45100507104).
- Add one traceable `contentMigrations` record with `previousSHA256`, `newSHA256` and origin notes for each.
- Keep `bankSHA256=c7cc71535f4b06adcaf55c4e60f4fa6e5c4d275f9cf895883d759073ce11c00f` and `auditProjectionSHA256=8360edd644a2c9f39a4ed5124e69c701d2d0c8335a31a4b5233e567b93f28fd7` **byte-for-byte unchanged**.
- Never change `questionLearningLevels.json`, `questions.json`, `correct`, `difficulty`, `learningLevel`, existing lessons, or old attempts as part of this baseline-only reconciliation.

## Required verification and disposition

The separate `stage2-source-reconciliation.yml` workflow must actually PASS `test:learning-levels`, `test:base-level`, `test:in-depth`, `test:in-depth-history`, `lint`, and `build` on **the final candidate SHA**. Standard Fast PR gate must PASS as well.

If any stage fails or the protected file hash still differs, leave this PR Draft/BLOCK. CI success means **protected-file evidence matches the accepted staging snapshot**, not the seven-route independent semantic review, not user approval of lessons, and not completion of Understanding closeout.

If the PR passes and is independently reviewed, merge into **staging only**. Rebase/recheck [PR #324](https://github.com/apotet/my-gemini-mirror-site/pull/324) afterwards and rerun all gates before its merge. No production deployment.

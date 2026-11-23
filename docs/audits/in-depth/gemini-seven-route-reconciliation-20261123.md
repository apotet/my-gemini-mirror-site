# Gemini seven-route audit — integrator verification, 23 November 2026

**Gemini source:** user-supplied ZIP `netops_pr324_7routes_audit_2026-11-23.zip` (REPORT.md, VERDICTS.json, FIXES.md, PATCHES). Original content checked: #324 frozen `b2557f027b500bbe6ea030b49330c54254214904`. Stacked release guard #326 `b67d9340ce4c10761dd81c6a0f922006349c2885`.

**Gemini verdict as supplied:** 4 PASS (DNS `l7-new-03`, PAT `l3-d05`, RSTP `stp-new-04`, QoS `review-qos-22`), 3 FIX routes (`review-slaac-4`, `review-poe-30`, `l4-d05`), no REVIEW/UNVERIFIED in its seven-route report.

## Independent source reconciliation, not blind patch application

| Gemini finding | Integrator source verification on #324 b2557f0 | Action |
| --- | --- | --- |
| FIX-IPV6-SCOPE-01 — review misses scoped RA A=1 | **CONFIRMED**: `EngineeringReview.tsx` calls 3 `FormattedExplanation` instances without `glossaryScope`; `splitGlossaryText` requires `scope==='ipv6'` for RA flags. Existing browser test asserted only inside the lesson. | Added shared scope resolver for review/lesson, passed to all three review blocks; extended 375/1440 browser test before opening lesson, in both explanation modes. |
| FIX-POE-SCOPE-02 — target lesson lacks PoE scope | **CONFIRMED**: `LessonView.tsx` has list omitting `l1-poe-screen-reading`. | Shared scope resolver includes target lesson; unit test checks all 5 PoE IDs and negative cases. |
| FIX-POE-TYPO-03 — Cyrillic МАС-таблице | **NOT REPRODUCED** on frozen b2557f0: `src/data/inDepth/group5.ts:12` already has Latin `MAC-таблице`. ZIP patch would be a redundant no-op; no change applied. | Preserve existing code, existing regression `in-depth-content.test.mjs` asserts Latin MAC and rejects Cyrillic. |
| FIX-SACK-NOTATION-04 — closed interval | **NOT REPRODUCED** on frozen b2557f0: `group5.ts` already has `[Left Edge, Right Edge)` at its SACK professional lesson block and `l4-d05.pro` says right edge excluded. ZIP patch would be a redundant no-op; no change applied. | Preserve existing correct half-open notation. |

**Important:** The two minor findings were valid suggestions but mismatched the GitHub source at the named frozen SHA. Reviewer's assertion of 4 outstanding corrections is not confirmed. Source inspection supports 2 actual MAJOR corrections, not rewriting accepted material.

## Release status
- **Never infer a seven-route full PASS from author's patch or green CI.** Confirmed fixes need targeted runtime/browser checks on this branch, then re-verification of exactly the impacted modes by a different independent reviewer if policy requires.
- #324 content freeze remains unchanged; this branch was based on #326 auxiliary safety guard.
- Existing historical 160 REVIEW and 150 changed fingerprints + 4 new remain outstanding on strict GATE-06. No rebaseline/forged PASS. GATE-10 staging publish/smoke not started.
- User approved lesson-specific acceptance remains independent. Production `apotet/netops` not touched.

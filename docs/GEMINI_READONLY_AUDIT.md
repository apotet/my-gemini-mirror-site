# Gemini read-only auditor for NetOps staging

**Owner decision (19 Nov 2026):** Gemini reviews only. **ChatGPT owns all fixes, verification, and staging merge.** No AI is allowed to auto-approve, auto-merge, deploy, edit source files, or touch `apotet/netops` production.

## One-time setup (works on iPhone)

1. In [Google AI Studio](https://aistudio.google.com/apikey), create a **Gemini API key** for a project with an enabled Gemini API and an appropriate quota/billing setting. The Gemini chat subscription and API are **different billing/quota products**.
2. In staging repo GitHub Settings → Secrets and variables → Actions → **New repository secret**, set name **`GEMINI_API_KEY`**, paste its value privately. Do not paste the key into chat or commit it.
3. In staging repo GitHub Actions, choose **Gemini read-only NetOps reviewer** → **Run workflow**:
   - `pr_number`: e.g. `264`
   - `ids`: default `auto:1` selects four first **not-yet-reviewed** Understanding IDs. For the next batch use `auto:2`, then `auto:3`, etc. through `auto:40`. You can still enter 1–10 comma-separated IDs manually.
   - `max_batches`: default **1**, optionally **2** to review two consecutive groups (8 questions max). The second request is made **only if the first 4/4 results are PASS with evidence and no issues**. Any FIX/REVIEW/error stops the run before another model call; batch 40 and manual ID lists cannot start a two-batch run.
   - `model`: `gemini-4-hydrogen` (new, free-tier eligible) or `gemini-3.8-flash` (older stable alternative); availability/quota depend on account
   - `dry_run`: **true** initially, then **false** to make one actual API call. Current verified API model codes are `gemini-4-hydrogen` (default, free-tier eligible) or `gemini-3.8-flash` (availability varies by key). Legacy `gemini-2.5-flash` can return 404 for newly active projects.
4. Open the action run. The pack artifact is attached to a successful collection; with `dry_run=false`, Gemini's advisory review is posted as one PR comment and archived as JSON/Markdown. Each `auto:N` with `max_batches=1` makes **one** API call maximum; with `max_batches=2` it MAY make a second sequential call for `auto:N+1`, but only after four unqualified PASS findings in the first. It never auto-starts a new workflow run or advances the cursor across separate runs. After reading and independently checking the report, choose the next batch.

**No charge-safe scheduling:** A manual `Run workflow` is still required; selecting two groups does not create a cron job, trigger itself later or bypass API quota. Actual free-tier limits depend on the Google AI Studio project and reset according to Google RPM/TPM/RPD windows. Never assume unlimited calls.\n\n**Queue invariant:** 164 Understanding questions, four already reviewed on PR #264 SHA `5df2a0b46116323201a6ae933a4c650e78b105db` (`gap-pack2-27`, `gap-pack3-15`, `stp-new-09`, `l4-new-05`); the remaining **160** are sorted into 40 disjoint batches of four. Auto mode **fails closed if the target SHA changes** (to avoid silently reusing stale approvals), and fails on invalid batch indices. If content changes, a new queue needs explicit review; manual IDs remain available. A prior PASS on the old snapshot never automatically passes a changed question.

This workflow only becomes manually runnable after it is present on staging **default main branch**, per GitHub Actions requirements. The feature PR itself performs static safe contract checks, **not** a real API call.

## Safety and correctness boundary

- Manual invocation only. No push/PR auto-triggered Gemini billing, no retries, at most **two** sequential Gemini generateContent calls per explicit run (default is **one**); only four question IDs per auto-batch. Manual comma-separated ID mode still allows 1–10 IDs in a single call.
- The collection job checks an open same-repo PR targeting staging main, freezes the exact SHA, validates the question IDs, and packs exact resolved question explanations and both lesson sections. The collection job receives **no Gemini secret** or PR write permission.
- The review job executes **only scripts checked out from trusted main** with an API secret. It treats PR-sourced material as JSON data; after inference it checks the same PR HEAD SHA before posting to prevent stale verdicts.
- A claimed `PASS` with a fabricated/wrong `lessonId#anchorId` is downgraded to `REVIEW`, but this is still only a machine-level check. Browser navigation and human technical review must be independently confirmed.
- Output is an advisory PR comment. **Not a replacement** for `docs/LEARNING_CONTENT_STANDARD.md`, independent current-SHA subject review or `GATE-01…10`; not an override for failed CI. No automatic updates of review fingerprint baselines.
- Gemini API requests transmit the selected private repo question/lesson text to Google's Gemini API. Keep batches focused; enable budget/quota controls in Google AI Studio/Cloud as appropriate.

## Limits and costs

The API key may require project setup, eligibility, free-tier availability or billing. The workflow does **not** use the Gemini mobile app's Premium quota/counter. Use the dry-run default to validate source selection at zero API spend, then begin with four IDs and `gemini-4-hydrogen`. The workflow reports input/output token usage when the API provides it.

## Prohibited assumptions

- The generated pack does not prove that links scroll correctly in a live iPhone browser.
- The model cannot itself edit/merge a GitHub PR through this workflow.
- The report must not claim direct raw-code or live-UI verification.
- An AI `PASS` is evidence to consider, not a merge permission. A merge is performed only by ChatGPT under the project's complete existing publication standard.

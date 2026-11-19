# Gemini read-only auditor for NetOps staging

**Owner decision (19 Nov 2026):** Gemini reviews only. **ChatGPT owns all fixes, verification, and staging merge.** No AI is allowed to auto-approve, auto-merge, deploy, edit source files, or touch `apotet/netops` production.

## One-time setup (works on iPhone)

1. In [Google AI Studio](https://aistudio.google.com/apikey), create a **Gemini API key** for a project with an enabled Gemini API and an appropriate quota/billing setting. The Gemini chat subscription and API are **different billing/quota products**.
2. In staging repo GitHub Settings → Secrets and variables → Actions → **New repository secret**, set name **`GEMINI_API_KEY`**, paste its value privately. Do not paste the key into chat or commit it.
3. In staging repo GitHub Actions, choose **Gemini read-only NetOps reviewer** → **Run workflow**:
   - `pr_number`: e.g. `264`
   - `ids`: 1–10 unique IDs separated by commas
   - `model`: `gemini-2.5-flash` (cheaper) or `gemini-2.5-pro` (more expensive/deeper); availability/quota depend on account
   - `dry_run`: **true** initially, then **false** to make one actual API call.
4. Open the action run. The pack artifact is attached to a successful collection; with `dry_run=false`, Gemini's advisory review is posted as one PR comment and archived as JSON/Markdown. Owner/operator may request another batch manually.

This workflow only becomes manually runnable after it is present on staging **default main branch**, per GitHub Actions requirements. The feature PR itself performs static safe contract checks, **not** a real API call.

## Safety and correctness boundary

- Manual invocation only. No push/PR auto-triggered Gemini billing, no retries, 10 question IDs maximum per run, one Gemini generateContent API call.
- The collection job checks an open same-repo PR targeting staging main, freezes the exact SHA, validates the question IDs, and packs exact resolved question explanations and both lesson sections. The collection job receives **no Gemini secret** or PR write permission.
- The review job executes **only scripts checked out from trusted main** with an API secret. It treats PR-sourced material as JSON data; after inference it checks the same PR HEAD SHA before posting to prevent stale verdicts.
- A claimed `PASS` with a fabricated/wrong `lessonId#anchorId` is downgraded to `REVIEW`, but this is still only a machine-level check. Browser navigation and human technical review must be independently confirmed.
- Output is an advisory PR comment. **Not a replacement** for `docs/LEARNING_CONTENT_STANDARD.md`, independent current-SHA subject review or `GATE-01…10`; not an override for failed CI. No automatic updates of review fingerprint baselines.
- Gemini API requests transmit the selected private repo question/lesson text to Google's Gemini API. Keep batches focused; enable budget/quota controls in Google AI Studio/Cloud as appropriate.

## Limits and costs

The API key may require project setup, eligibility, free-tier availability or billing. The workflow does **not** use the Gemini mobile app's Premium quota/counter. Use the dry-run default to validate source selection at zero API spend, then begin with four IDs and `gemini-2.5-flash`. The workflow reports input/output token usage when the API provides it.

## Prohibited assumptions

- The generated pack does not prove that links scroll correctly in a live iPhone browser.
- The model cannot itself edit/merge a GitHub PR through this workflow.
- The report must not claim direct raw-code or live-UI verification.
- An AI `PASS` is evidence to consider, not a merge permission. A merge is performed only by ChatGPT under the project's complete existing publication standard.

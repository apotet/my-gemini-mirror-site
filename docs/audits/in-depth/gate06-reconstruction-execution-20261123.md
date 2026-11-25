# GATE-06 historical fingerprint reconstruction — execution, 2026-11-23

**Decision:** `NETOPS-L2-CLOSEOUT-2026-11-22`. **Issue:** [#333](https://github.com/apotet/my-gemini-mirror-site/issues/333). **Single Draft PR:** [#334](https://github.com/apotet/my-gemini-mirror-site/pull/334).

**Result: NOT_REPRODUCED / PROVENANCE_UNVERIFIED. GATE-06 remains BLOCK.** Successful diagnostic execution is not semantic acceptance. No candidate reproduced all 160 historical hashes; no historical state is declared irretrievably lost.

## Frozen sources and executable evidence

- Staging `main` at the initial remote fetch and PR creation equals the supplied control SHA: **`b22984cc3746d35b2b2c990af59055dfe467778c`**. All current-material comparisons below use that exact commit, never a moving branch name.
- Diagnostic executable commit: **`762c18ac37f0c6284f2a9804d4bd24b95002dba7`**. Subsequent commit adds this report only; the executed scripts/workflow are unchanged.
- [GitHub Actions run #45171580957](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45171580957), attempt **1**, event `pull_request`, conclusion **SUCCESS**. [Job and full logs](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45171580957/job/137682181551).
- [JSON + execution.log artifact](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45171580957/artifacts/14817561252): `gate06-reconstruction-45171580957-1`, artifact ID `14817561252`, two files `reconstruction.json` and `execution.log`. Downloaded and parsed; every candidate's status/pool/found/matched/mismatched/missing was checked against its actual log event. Artifact expires **2026-12-23**; the committed workflow can reproduce it.
- Downloaded ZIP SHA256: `cd993182d8577febd13718adf5b0eda2491d245940b208532309444eaee26ca8`, identical to GitHub's artifact digest. JSON SHA256: `50fcae84d352619cf23188dce714ae9db24676028088a68f174b6b0bce0e1547`.
- Actual runner: **Node v22.23.5**, **esbuild 0.28.2**, Ubuntu 24.04. `npm ci --no-fund --no-audit` succeeded. Lockfile SHA256 is identical at all mandatory candidates and current source: `86c9f0a5d6e4b3ceb5b015e4ebf7a8fd7b0940ca431f0ab831260b4ef33fef20`.

## Required candidates — actual runtime results

`Matched` means an exact SHA256 string match to the immutable 160-row historical ledger. It does **not** change its REVIEW status. `Found` counts historical IDs found in the candidate's actual `getTestingPool('mixed', 'in-depth')` output.

| SHA | Pool | Found historical IDs | Matched / 160 | Mismatched | Missing | Status |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `188c6938ecb2c6563ba228fd31b5fa4fc74b94e4` | 160 | 160 | **149 / 160** | 11 | 0 | NOT_REPRODUCED |
| `6e9fd840ef91f65430a032b5ece02ef056e08a2b` | 164 | 160 | **118 / 160** | 42 | 0 | NOT_REPRODUCED |
| `d08d24c814c4a60731d42addeb7ef7b4b3a16cef` | 160 | 160 | **0 / 160** | 160 | 0 | NOT_REPRODUCED |

All three completed actual extraction, historical loader import, esbuild bundling, resolver execution and serialization. **No candidate had a loading/building error.** Their individual hashes and component hashes are in JSON `candidates[].rows`; exact mismatch/missing lists are also retained.

Three additional credible Git candidates identified from history/reflog were actually executed, not merely inferred from tree similarity:

| SHA | Pool | Found | Matched / 160 | Mismatched | Missing | Status |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `8165877dec44c5ad2f2265bd910cf80952d24cb0` | 160 | 160 | 0 / 160 | 160 | 0 | NOT_REPRODUCED |
| `2907bc67f24663a7723e70340be8c590de924d62` | 160 | 160 | 0 / 160 | 160 | 0 | NOT_REPRODUCED |
| `8134b34657b167fc2fe0f78f739d17c90f1693cd` | 160 | 160 | 0 / 160 | 160 | 0 | NOT_REPRODUCED |

Frozen current `b22984cc`: pool **164**, historical IDs found **160**, matching hashes **10**, mismatching **150**, missing **0**. Current-only IDs are `l3-d05`, `l4-d03`, `l4-d05`, `tcpip-d05`. This set difference is not an acceptance verdict or inferred review of those four materials.

## Provenance findings and unresolved scope

See [Git provenance evidence](gate06-git-provenance-20261123.md) for commands, introduction dates, report hashes and limitations. Both historical reports and the original hash-producing report script are byte-identical between `188c6938` and `6e9fd840`; their educational source trees differ. The original formula matches the required formula, with expanded plain/professional lesson blocks, recursively detected sorted glossary terms, `{entry, tooltip}` definitions and ordinary insertion-order `JSON.stringify` semantics:

```js
sha256(JSON.stringify({question, deep, lesson: expanded, definitions}))
sha256(JSON.stringify({question, deep}))
sha256(JSON.stringify({lesson: expanded, definitions}))
```

The nearest candidate `188c6938` does not reproduce these **11** historical hashes:

`tcp-05`, `review-ptp-17`, `mon-snmp-01`, `mon-syslog-01`, `mon-syslog-05`, `mon-zabbix-01`, `wifi-std-01`, `wifi-std-04`, `wifi-roam-01`, `wifi-sec-01`, `wifi-sec-05`.

These are **unresolved fingerprint provenance**, not 11 confirmed content defects or a proven direct-change group E. The first report's snapshot digest matches a surviving local cache; stored hashes match 80/80 first-report rows and 69/80 fourth-report rows. This is explicitly local, partial evidence, not an Actions artifact or a proven reviewed Git tree. The fourth report lacks a frozen commit and snapshot digest. A tracked fourth-report writer establishing a different original hash formula was not found.

**A/B/C-E/D classification: NOT ESTABLISHED.** The prerequisite of a single historical candidate reproducing 160/160 was not met. Therefore the exact remaining *direct semantic changes* and subset E are **UNVERIFIED**, and existing semantic reports / PRs #282, #289, #291, #324, #327 were not used to promote any row. No new full 164-question semantic audit or fabricated evidence-version mapping was performed. Further work requires the actual fourth-report source snapshot/generator or another credible source state; failure on these six candidates does not prove that recovery elsewhere is impossible.

## Diagnostic implementation and constraints

The named **`Reconstruct_Gate06_Fingerprints.txt` was not present** in the accessible attachments, workspace or issue links. Its location was requested; it had not been provided when this execution was completed. Inspection/validation of that particular supplied script is **UNVERIFIED**. The committed script is explicitly an independent implementation, not a claim to have checked an unavailable attachment.

`scripts/reconstruct-gate06-fingerprints.mjs` reads historical ledgers from the frozen control commit; it extracts each candidate's real Git source into a temporary directory and imports that candidate's own `load-bank.mjs` / `bundleEntry`. Existing historical entry modules are used when available. For `d08d24c8` and earlier candidates, which lack the entry file, a temporary diagnostic entry exports the actual historical resolver/glossary functions. The historical source content is not patched. There is no historical-pool assertion of 164.

The implementation records resolved commit/source-tree SHA, loader and lock hashes, runtime versions, actual pool size, per-ID full/component hashes and diagnostic error stage. It distinguishes **REPRODUCED**, **NOT_REPRODUCED**, **EXECUTION_FAILED**. A nonreproduction is a completed diagnostic result, not a process failure or semantic PASS. Execution errors return exit code 2 and a JSON error, including failures before candidate resolution.

The workflow has `workflow_dispatch`, checkout `fetch-depth: 0`, `persist-credentials: false`, explicit PR-head checkout, repository restriction and **only `permissions: contents: read`**. It has no production target, merge/deploy step, secrets-dependent execution or arbitrary ref input. JSON/log upload uses `if: always()`.

The actual dispatch request returned HTTP **404** because this new workflow was not registered in the default branch. The explicitly authorized `pull_request` fallback ran successfully. No merge was used to register it. PR fallback runs on opening/reopening; report-only synchronization does not rerun diagnostics. **One actual Actions execution, zero retries.**

## Verification and hand-off

- Syntax check: **PASS** locally and in Actions.
- Six diagnostic serialization/comparison tests: **PASS** locally and in Actions, including expanded styles, property order/undefined, shared/direct mutations, absent and duplicate IDs. These test the diagnostic algorithm, not educational correctness.
- Actual reconstruction: **completed** for six historical commits and one frozen current commit in Actions; runtime results above agree with the downloaded JSON/log.
- Existing [Fast PR CI #45171580616](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45171580616): **SUCCESS** on executable commit, including TypeScript/build and existing targeted PoE regressions. It is not GATE-06 acceptance. The later report-only commit may have its own ordinary Fast PR run; no second reconstruction is implied.
- Scope comparison against `b22984cc`: only the new diagnostic script/tests/workflow and two new evidence documents. **No `src` changes, no changes to either historical final-review JSON, no policy changes or baseline replacement.**
- **Production `apotet/netops` was not modified. No staging merge or deployment performed.** No historical REVIEW became PASS; no append-only acceptance mechanism was started.

**Hand-off to ChatGPT for independent acceptance of this diagnostic evidence. GATE-06 remains BLOCK / PROVENANCE_UNVERIFIED; work stops here.**

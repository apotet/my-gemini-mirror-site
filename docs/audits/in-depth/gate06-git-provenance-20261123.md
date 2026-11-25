# GATE-06: Git provenance evidence, 2026-11-23

Scope: read-only investigation of historical fingerprints. This document does not accept educational materials or change GATE-06. Current comparison target: `b22984cc3746d35b2b2c990af59055dfe467778c` in staging `apotet/my-gemini-mirror-site`.

## Historical objects and report introduction

All three mandatory SHA resolve to local commit objects (`git cat-file -t SHA`):

| Commit | Commit time UTC | Evidence |
| --- | --- | --- |
| `188c6938ecb2c6563ba228fd31b5fa4fc74b94e4` | 2026-11-19 03:29:12 | Saved WIP branch; adds both final-review files and diagnostic report/entry scripts. Parent `8165877dec44c5ad2f2265bd910cf80952d24cb0`. |
| `6e9fd840ef91f65430a032b5ece02ef056e08a2b` | 2026-11-19 04:08:46 | Reintroduces saved work into the main history. Parent `ddd8682cd7db71e994ae2ac29e08f4b1bc8c6f6f`. |
| `d08d24c814c4a60731d42addeb7ef7b4b3a16cef` | 2026-11-17 23:20:45 | Earlier main; historical `load-bank.mjs` exists, but `in-depth-report.mjs` and `in-depth-entry.ts` do not yet exist. |

Commands:

```sh
git log --all --format='%H %s' --diff-filter=A -- docs/audits/in-depth/final-review-1.json
git log --all --format='%H %s' --diff-filter=A -- docs/audits/in-depth/final-review-4.json
git show -s --format='%H%n%P%n%aI%n%cI%n%s' SHA
git ls-tree SHA scripts/load-bank.mjs scripts/in-depth-report.mjs scripts/in-depth-entry.ts
git diff --quiet 188c6938 6e9fd840 -- scripts/in-depth-report.mjs scripts/in-depth-entry.ts scripts/load-bank.mjs docs/audits/in-depth/final-review-1.json docs/audits/in-depth/final-review-4.json
```

The last command exits zero: all five checked files are byte-identical across the two introduction commits. Their educational sources are **not** identical: the corresponding `src` diff spans 22 files.

## Formula and missing freeze evidence

At both introduction commits, `scripts/in-depth-report.mjs` hashes exactly:

```js
sha256(JSON.stringify({question, deep, lesson: expanded, definitions}))
```

`expanded` spreads the lesson, replaces plain blocks with `getLessonBlocksWithSections(lesson, 'plain')`, and similarly expands the professional blocks when present. Glossary terms are collected recursively from question/deep/expanded lesson via `splitGlossaryText`, combined with both lesson term lists, deduplicated and sorted. `definitions` is constructed in that order as `{entry: GLOSSARY[term], tooltip: GLOSSARY_TOOLTIPS[term]}`. Ordinary `JSON.stringify` property order and omission of undefined fields apply; this is not sorted-key JSON.

The historical report-script SHA256 is `138322c8a115c4fbfc6041bc485ad43b67518fc5ae20b720529b805524cb2833` at both commits (`git show SHA:scripts/in-depth-report.mjs | sha256sum`). No separate tracked final-review writer was found in the saved commit's scripts tree. A surviving local `/tmp/save-final-review1.py` copies each existing snapshot row's `materialHash`; its `hashlib.sha256` computes the **file-level snapshot digest**, not a replacement material formula. This local helper is not Git provenance. No corresponding final-review-4 writer was found in the inspected local helper files, so its hashing origin is not independently established by a writer script.

The final reports each contain 80 rows, all with `status: REVIEW`. First-report header and rows have `reviewedCommit: null`; fourth-report header and rows have `frozenCommit: null`. The first header records a snapshot digest; the fourth does not. Identical report bytes in two Git commits do not prove either commit was the reviewed source snapshot.

## Surviving local cache: exact, limited evidence

Local file `scripts/.cache/in-depth/current-materials.json` survives with mtime `2026-11-18T22:08:52.712Z`. Its raw-byte SHA256 is:

`1110f5ec96835109323ec7b5424d24e49938a56cd7610218190624eaa2da8db9`

That equals `final-review-1.json`'s `snapshotSha256`. Joining cache rows to report rows **by ID**, and comparing their stored `materialHash` strings, gives:

| Report | Rows | Exact stored-hash matches |
| --- | --- | --- |
| final-review-1.json | 80 | 80 |
| final-review-4.json | 80 | 69 |
| Combined | 160 | 149 |

The 11 differences are `tcp-05`, `review-ptp-17`, `mon-snmp-01`, `mon-syslog-01`, `mon-syslog-05`, `mon-zabbix-01`, `wifi-std-01`, `wifi-std-04`, `wifi-roam-01`, `wifi-sec-01`, `wifi-sec-05`.

This is precisely **80 + 69 stored-hash matches**, not runtime reconstruction of 149 materials, and not a frozen Git-source claim. The cache stores question/deep and lesson collections but not each row's complete expanded lesson/definitions object. Neither file mtime nor this cache can assign a Git SHA to the fourth report or prove when its differing rows were produced.

## Additional credible commits and tree equivalence

Local reflog identifies:

- `2907bc67f24663a7723e70340be8c590de924d62`: initial read-only 160-question audit, parent `d08d24c814c4a60731d42addeb7ef7b4b3a16cef`.
- `8134b34657b167fc2fe0f78f739d17c90f1693cd`: main UI change after `d08d24c8`.
- `8165877dec44c5ad2f2265bd910cf80952d24cb0`: merge of `2907bc6` and `8134b34`, parent of saved `188c6938`.

`git diff --name-only d08d24c8 2907bc6 -- src` is empty. Against `8134b34` and `8165877`, the same command lists only `src/components/ExamView.tsx`. Their educational source modules are therefore equivalent to `d08d24c8`; this excludes them as distinct content candidates **provided the reconstruction module graph does not import ExamView**. No additional content snapshots between the local cache and `188c6938` were found in the local reflog. This is not proof that no other historical state exists elsewhere.

The lockfile Git blob is identical at all mandatory candidates and current target:

`6cd62d96533a96d7e2b7bc38b70094f92153fb18`

Reproduce with `git ls-tree SHA package-lock.json`. This removes lockfile drift as an identified dependency difference; successful execution still requires actual runtime verification.

## Conclusion

The provenance evidence establishes report introduction, the saved formula, a partial snapshot association, and credible earlier content-equivalent commits. It does not establish a single frozen source SHA reproducing all 160 hashes. Runtime candidate results belong in the reconstruction execution report. No historical REVIEW was rewritten, no baseline was replaced, and no acceptance or GATE-06 PASS follows from this investigation.

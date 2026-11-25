# GATE-06 eleven-record investigation: Git and surviving local artifacts

Date: 2026-11-23. Scope: only `tcp-05`, `review-ptp-17`, `mon-snmp-01`, `mon-syslog-01`, `mon-syslog-05`, `mon-zabbix-01`, `wifi-std-01`, `wifi-std-04`, `wifi-roam-01`, `wifi-sec-01`, `wifi-sec-05`. This is fingerprint provenance, not semantic acceptance.

Frozen comparison source: `b22984cc3746d35b2b2c990af59055dfe467778c`; nearest historical Git source: `188c6938ecb2c6563ba228fd31b5fa4fc74b94e4`. Existing executed evidence: [Actions #45171580957](https://github.com/apotet/my-gemini-mirror-site/actions/runs/45171580957), artifact `14817561252`. The six historical candidate reconstructions were **not rerun** for this investigation.

## Git boundaries and historical authoring evidence

Both final-review reports first enter the saved branch at `188c6938ecb2c6563ba228fd31b5fa4fc74b94e4` and the main lineage at `6e9fd840ef91f65430a032b5ece02ef056e08a2b`; their bytes are identical across those commits. `final-review-4.json` has `frozenCommit: null`, no snapshot digest, and all 80 row verdicts/criteria remain REVIEW. A generator for that report was not located among the inspected tracked scripts or surviving `/tmp/*.py` helpers. Literal searches of the eleven historical hashes in local helpers/caches found no other stored ledger containing them. This absence is not proof that no writer or source snapshot exists elsewhere.

The relevant baseline feature additions are the monitoring pack commit `861e988a40e4d9b401e316e2f2ae0cce9b9f7645` and Wi-Fi pack commit `79dfedcbb0553c24e14721b1dbc10801a62463a0`. Historical question-specific patches reside in `src/data/inDepth/group3.ts` / `group4.ts`; expansion is performed by `src/data/inDepth/index.ts` and `src/data/lessons/lessonSectionLinks.ts`; glossary patches also involve `sharedTerms.ts`. Those paths were read, not changed.

The local reflog has the read-only inventory commit `2907bc67f24663a7723e70340be8c590de924d62`, merge `8165877dec44c5ad2f2265bd910cf80952d24cb0`, and saved WIP `188c6938`; no additional committed content state between the surviving November 18 caches and that WIP was found. This limits Git provenance; it does not imply loss of all intermediate data.

Useful reproduction commands:

```sh
git log --all --diff-filter=A -- docs/audits/in-depth/final-review-4.json
git diff --quiet 188c6938 6e9fd840 -- docs/audits/in-depth/final-review-4.json
git reflog show --all --date=iso --format='%H %gd %gs'
git log --all -- src/data/monitoringCases.ts src/data/wifiCases.ts
```

## Actual surviving compiled snapshots

These are local artifacts, not newly discovered Git commits. Their filesystem mtimes are contextual evidence only and do not establish when the historical reviewer computed a hash.

| Local file | Observed mtime UTC | Raw byte SHA256 |
| --- | --- | --- |
| `scripts/.cache/in-depth-integration-independent.mjs` | 2026-11-18 10:36 | `95f17a97e592d6904e1151e63e928778630975a359c6ddc1e5622ee6d0b1e0a6` |
| `scripts/.cache/in-depth-report.mjs` | 2026-11-18 22:08 | `080633688f9d02a470a2e1b69a2a63ff83d6c63a6fd7600352c6d6cab6cde7ed` |
| `scripts/.cache/in-depth/current-materials.json` | 2026-11-18 22:08 | `1110f5ec96835109323ec7b5424d24e49938a56cd7610218190624eaa2da8db9` |
| `/tmp/l2_apply_final_fixes.py` | 2026-11-18 21:54 | `4d5ea460c391bb736aa2127c1d95ed3dd92a4139fa9d6ca125c1c7fbd70de30d` |

Both listed compiled bundles export the real question resolver, lesson resolver/section expansion, glossary tables and tokenizer. The bounded probe selected only the eleven IDs, using the original serialization formula and these actual exported values. It did not run a new full-pool audit. All eleven hashes from the later bundle were verified equal to the **188c6938 rows in the existing Actions JSON**, anchoring its relevant output to previously executed Git evidence.

### tcp-05: actual complete local payload found

The earlier compiled bundle directly reproduces historical hash:

`9e785265a0e75bb6d5ed1543fc9e8d0a92c441033809a42d7a8702b19a4a60b3`.

Its payload differs from the later bundle / 188c6938 only in:

- `deep.deepAnalysis` and `deep.engineeringDeep`: earlier wording `и обновляется его контрольная сумма`, later wording `и обновляется контрольная сумма IPv4-заголовка`.
- Earlier payload has no `deep.plain` property; the later payload contains the plain-layer alias.

The earlier bundle's actual `IN_DEPTH_PATCHES['tcp-05']` has `visualDiagram` and `practicalTip`, but **no `plain` patch**. The later patch adds that specific plain explanation; the resolver propagates it into the three fields above. The two payloads' question, expanded lesson and glossary definitions are unchanged. The omitted alias is therefore caused by the missing earlier question-specific patch, not an inferred change in JSON formatting or the hash algorithm.

This is exact recovery of a complete local material payload, not proof of a frozen Git commit or a semantic PASS for the current material.

### Other ten: exact component reconstruction, not a single frozen snapshot

A bounded eight-combination probe used question/deep, expanded lessons and glossary providers from the two actual bundles. For all remaining ten IDs, the following construction exactly equals each stored historical hash:

1. Keep the later bundle / 188c6938 `question` and `deep` unchanged.
2. Keep its expanded lesson unchanged, including current metadata and both lesson styles.
3. Derive terms and `{entry, tooltip}` definitions using the **earlier bundle's actual glossary provider**.
4. Compute the unchanged `sha256(JSON.stringify({question, deep, lesson: expanded, definitions}))` formula.

Thus the historical payloads for those ten can be reproduced from retained components. This identifies the differing hash component as glossary context relative to 188c6938; it does not establish that this exact combination existed at a committed source SHA, or explain the historical writer's process. The raw earlier bundle alone reproduces only tcp-05, so it must not be described as a recovered complete 160-question frozen snapshot.

An initial hypothesis that restoring `lesson.professional.sourceCommit` alone caused the ten differences is **not sufficient**. The matching component construction keeps the later lesson object, including its cleared provenance metadata. The surviving final-fix helper proves that metadata cleanup and the Wi-Fi answer correction happened during authoring, but its existence must not substitute for the actual matching glossary comparison.

## Limits and hand-off

Technical reconstruction does not resolve independent review of changed glossary definitions, the tcp-05 direct plain patch, or subsequent changes up to current staging. Independent evidence must be evaluated separately against the specific current component hashes. No historical REVIEW, source record, baseline, policy, production repository, merge or deployment was changed in this investigation. GATE-06 remains BLOCK until the approved independent process resolves the outstanding acceptance evidence.

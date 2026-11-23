# GATE-06 eleven fingerprints: technical evidence, 2026-11-23

Scope: only the eleven unresolved IDs from final-review-4, not a new 164-question audit. Current source is frozen at `b22984cc3746d35b2b2c990af59055dfe467778c`; reference Git source is `188c6938ecb2c6563ba228fd31b5fa4fc74b94e4`. This investigation does not accept content, change historical REVIEW, or establish one reviewed Git freeze.

## Exact reconstruction result

**All 11 historical hashes have now been reproduced from identifiable actual components.** One comes directly from a surviving earlier compiled resolver; ten use real Git `188c6938` question/deep/expanded-lesson objects with that earlier resolver's glossary provider. This is component reconstruction, **not** a newly discovered Git commit reproducing 160/160, and not a semantic PASS.

The actual earlier module is `scripts/.cache/in-depth-integration-independent.mjs`, byte SHA256 **`95f17a97e592d6904e1151e63e928778630975a359c6ddc1e5622ee6d0b1e0a6`**. The compiled source has no established complete original Git tree. Its filesystem timestamp is supplementary evidence, not proof of review time. The later cache JSON has SHA256 `1110f5ec96835109323ec7b5424d24e49938a56cd7610218190624eaa2da8db9`; its eleven stored fingerprints can also be reassembled exactly, but those are the later values, not the historical final-review-4 values.

The complete matched forensic payloads are preserved in [gate06-eleven-recovered-materials-20261123.json](gate06-eleven-recovered-materials-20261123.json), purpose **FORENSIC_COMPONENT_RECONSTRUCTION_NOT_GIT_FREEZE**. They are diagnostic evidence and are not imported by the fingerprint policy, application or acceptance process. Component recipe, bundle byte hash, immutable ledger source, full/questionDeep/shared hashes and all eleven actual serialized payloads are included. This keeps verification independent of the future availability of the untracked 11 MB module.

| ID | Exact reconstruction recipe | Confirmed difference from 188c | Reconstructed historical question/deep → current |
| --- | --- | --- | --- |
| tcp-05 | All components from earlier actual module | Three deep fields; same lesson and definitions | Changed |
| review-ptp-17 | Git188c material + earlier actual glossary | Five glossary entries | Changed: `deep.practicalTip` after188c |
| mon-snmp-01 | Git188c material + earlier actual glossary | Five glossary entries | Unchanged |
| mon-syslog-01 | Git188c material + earlier actual glossary | Five glossary entries | Unchanged |
| mon-syslog-05 | Git188c material + earlier actual glossary | Five glossary entries | Unchanged |
| mon-zabbix-01 | Git188c material + earlier actual glossary | Seven glossary entries | Unchanged |
| wifi-std-01 | Git188c material + earlier actual glossary | Eight glossary entries | Unchanged |
| wifi-std-04 | Git188c material + earlier actual glossary | Eight glossary entries | Unchanged |
| wifi-roam-01 | Git188c material + earlier actual glossary | Eight glossary entries | Unchanged |
| wifi-sec-01 | Git188c material + earlier actual glossary | Five glossary entries | Unchanged |
| wifi-sec-05 | Git188c material + earlier actual glossary | Five glossary entries | Unchanged |

Every exact historical hash, `188c` hash, current hash, component hash and precise changed path is retained in the recovered JSON and [technical-results JSON](gate06-eleven-technical-results-20261123.json). For this **eleven-ID subset only**, comparison with current source shows **2 changed question/deep components** (`tcp-05`, `review-ptp-17`) and **9 shared-context-only changes**. Every reconstructed shared-context hash differs from current. This neither classifies the entire bank nor resolves independent semantic acceptance of those shared changes.

## Concrete causes

### tcp-05: an actual explanation patch

The earlier actual resolver returns historical hash `9e785265a0e75bb6d5ed1543fc9e8d0a92c441033809a42d7a8702b19a4a60b3`. Compared with `188c`, its payload differs only in:

- `deep.deepAnalysis` and `deep.engineeringDeep`: earlier wording “и обновляется его контрольная сумма” becomes “и обновляется контрольная сумма IPv4-заголовка”.
- `deep.plain`: absent in the earlier payload, present as the explicit patched plain-layer alias later.

The earlier `IN_DEPTH_PATCHES['tcp-05']` lacks `plain`; `188c` includes it in `src/data/inDepth/group4.ts`. The alias difference follows the patch's conditional application and is not evidence that the historical resolver formula changed. The question, expanded lesson and definitions in the reconstructed earlier payload are unchanged relative to `188c`. The actual explanation delta is not a glossary cascade. After `188c`, question/deep stays equal to current, while the shared lesson/glossary changes further.

### Other ten: glossary values, not reordered JSON or altered answers

Using unchanged `188c` question/deep and expanded lesson, with the earlier actual `GLOSSARY`, `GLOSSARY_TOOLTIPS` and `splitGlossaryText`, reproduces each remaining historical hash exactly. Their sorted glossary term lists are identical to `188c`, and there are no order-only changes in objects with the same key set. The formula remains ordinary insertion-order `JSON.stringify({question, deep, lesson: expanded, definitions})`; no canonicalization, key permutations or invented values were used.

Differences are the following actual definition/tooltip values (`entry.description`, `entry.relatesTo`, `tooltip.summary`, with the listed Russian-label changes):

- Monitoring four (`review-ptp-17`, `mon-snmp-01`, `mon-syslog-01`, `mon-syslog-05`): **SNMP Trap, TCN, USM, VRF, ifHCInOctets**.
- Zabbix: **Flapping, Hysteresis, TCN, USM, VRF, ifHCInOctets, ifInErrors**; the `ifInErrors` tooltip Russian label also changes.
- Wi-Fi standards/roaming three: **802.11ax, 802.11r, 802.11v, DFS, MCS, PMF, WPA2, WPA3**.
- Wi-Fi security two: **KRACK, MCS, PMF, WPA2, WPA3**. `WPA2` and `WPA3` Russian tooltip labels also change in the Wi-Fi sets.

The union is **17 changed glossary terms**. This fully explains those ten discrepancies relative to `188c`; no question, answer, lesson, professional `sourceCommit` restoration or serializer-order workaround is necessary. Later changes between `188c` and current are separate: monitoring lessons/definitions change, the Zabbix lesson changes, and PTP's practical tip changes. The five Wi-Fi full payloads at `188c` are already byte-serialization-equivalent to current, so their discrepancy from the reconstructed historical payload remains exclusively those historical glossary changes.

## Reproduction and checks

The targeted script `scripts/investigate-gate06-eleven.mjs` imports the historical loader at only two fixed source states (`188c`, current). It obtains the test-pool IDs but resolves question/deep/lesson/definitions **only for the eleven addressed questions**. It asserts all baseline/current hashes against the already downloaded first-stage Actions artifact; it does not rerun the six-candidate full-pool investigation. Optional earlier local modules are byte-hashed and identified as non-Git-provenance inputs. Reconstructed payload export includes only exact historical matches, never a forced match.

Actual local execution used:

```sh
node --check scripts/investigate-gate06-eleven.mjs
node scripts/investigate-gate06-eleven.mjs \
  --artifact /tmp/gate06-actions-45171580957/reconstruction.json \
  --cache scripts/.cache/in-depth/current-materials.json \
  --bundle scripts/.cache/in-depth-integration-independent.mjs \
  --output /tmp/gate06-eleven-technical.json \
  --recovered docs/audits/in-depth/gate06-eleven-recovered-materials-20261123.json
node scripts/investigate-gate06-eleven.test.mjs
```

For future verification **without any surviving cache/bundle**, the final command is sufficient: three tests verify exact scope, distinguish changed values/order/undefined omissions, and recompute all eleven payload and component hashes against the immutable historical REVIEW ledger. A deliberately changed deep field fails to match for every reconstructed payload. Test execution is **PASS, 3/3**. The unit-test pass is proof of reproducible serialization, not educational correctness.

No new GitHub Actions investigation was needed or started. No tracked `src`, historical report, policy, baseline, production, merge or deploy change was performed. Independent current-material semantic acceptance is addressed separately; GATE-06 remains BLOCK pending that acceptance and the explicit provenance-policy decision.

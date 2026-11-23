# GATE-06 eleven-ID semantic evidence reconciliation — 2026-11-23

Scope is exclusively the eleven historical final-review-4 mismatches. This is evidence/version reconciliation, **not a new semantic audit**. Target source: `b22984cc3746d35b2b2c990af59055dfe467778c`; staging repository only. No PASS is inferred from CI, text presence or an ID appearing in an audit.

**Technical evidence update within the same investigation:** the [consolidated report](gate06-eleven-fingerprint-investigation-20261123.md) and [recovered materials](gate06-eleven-recovered-materials-20261123.json) now establish exact reserialization matches for all eleven historical hashes. One comes from a complete surviving earlier package; ten use evidenced question/deep/lesson components with the earlier glossary provider. Historical payload recovery is therefore no longer pending. A single historical frozen Git SHA / final-review writer run is still unverified, and recovery does not promote REVIEW or change the semantic evidence outcomes below. References below to an unknown historical source mean the unresolved Git/writer provenance, not absence of the recovered payload.

## Existing evidence actually inspected

- `final-review-4.json`: independent reviewer `/root/l2_final_review4`, `authorOfMaterial:false`; all eleven whole-row and criterion statuses are **REVIEW**, `frozenCommit:null`, with explicit pending frozen-source/runtime evidence. The report describes reading the full question packs and relevant lessons, and quotes concrete source excerpts. This is useful historical evidence, but not a version-bound final PASS.
- `initial-group-3.json`, `initial-group-4.json`, `initial-audit.md`: initial confirmed FIX findings. Author repair reports `author-group-3.json` / `author-group-4.json` are not independent acceptance.
- `semantic-review-grok-batch-01.json`: fresh independent **PASS for tcp-05**, reviewed SHA `e833593dc2cb34303bd6f884eb346d18cfd1dc1f`. It explicitly says `referenceMatchesIndependentReview:false` and performs a fresh content review instead of claiming the old fingerprint was recovered. Its currentHash is `801bfff761eddd54579043d697b26c3b0fa52634a7c09b055c20945bd6cbfeab`.
- `semantic-review-grok-batch-02.json`: fresh independent **PASS for review-ptp-17**, reviewed SHA `3c769601aa3627ca9c700982f1a170fc6c3352cb`. No per-entry hash is provided, so the named Git version was executed locally for that ID rather than assuming equivalence.
- Grok batches 03/04 contain none of these eleven IDs. `semantic-batch12-20261120.md` and `remaining-six-generic-20261120.md` also contain none of them and explicitly describe author self-review, not independent acceptance.
- `gemini-seven-route-reconciliation-20261123.md` covers `l7-new-03`, `l3-d05`, `stp-new-04`, `review-qos-22`, `review-slaac-4`, `review-poe-30`, `l4-d05`: **none of the eleven**. `gemini-closeout-verification-20261123.md` warns that the supplied 164-row matrix omitted `mon-zabbix-01`, contained 125 UNVERIFIED rows and 30 structural PASS_CODE_CONTRACT rows; it is not a replacement semantic PASS. `integration-164-20261119.md` records the tcp-05 fresh review but expressly keeps independent acceptance pending for later changes.

## Version-bound checks for the two actual independent PASS records

The existing stage-1 downloaded artifact `reconstruction.json` supplies all eleven component hashes at `188c6938` and the frozen current target. No stage-1 reconstruction was repeated. Two additional **local, ID-filtered** resolver probes executed the exact Grok-reviewed commits: only `tcp-05@e833593d` and `review-ptp-17@3c769601`, plus the same two current packs for source-level deltas. These use `git archive` temporary trees, each historical `load-bank.mjs` / `bundleEntry`, real exported modules, `ALL_QUESTIONS.find(id)` and the committed diagnostic `materialFor`; they do not map the 164-question pool or run Actions. The compact hash evidence is retained in [semantic version evidence JSON](gate06-eleven-semantic-version-evidence-20261123.json).

| ID | Independent reviewed source | Full hash at that source | Current question/deep equal? | Current full material equal? |
| --- | --- | --- | --- | --- |
| `tcp-05` | `e833593dc2cb34303bd6f884eb346d18cfd1dc1f` | `801bfff761eddd54579043d697b26c3b0fa52634a7c09b055c20945bd6cbfeab` | **Yes**, `681237c1b56844501829b1c7771e6061f12f5be1f3a0aa7b4f2c87155b8c119d` | **No**, current `c242bc8ae6c2b07acd10b3c5ad18c8c3fa10d73a659f116a2e85b27bcef667b0` |
| `review-ptp-17` | `3c769601aa3627ca9c700982f1a170fc6c3352cb` | `3621014daff9aaf383961d484e31f80c8265600e13f0ea9819ce6a6378062354` | **No**: question equal; only `deep.practicalTip` differs | **No**, current `14fd6f0d6a80ffe99c572593ce2a20db369d9ce25f23858ec55d982329bf64f5` |

### tcp-05: preserve reviewed core; inspect changed shared context

The audited and current question plus the **complete deep object** are byte-equivalent under the original serialization. In the expanded `tcpip-encapsulation` lesson, existing heading/body blocks are unchanged in both modes; two PPP and FCS/payload sections were added per mode, and existing first blocks acquired `in-depth-existing-new-tcpip-router` anchor metadata. The exact router-rewrite target section remains unchanged. The full shared-context hash changed, so the old PASS is confirmed only for the unchanged reviewed scope, **not the entire current full fingerprint**. Relevant glossary-definition differences are part of the remaining shared-context delta and must not be silently accepted.

### review-ptp-17: preserve reviewed core/target section; inspect new tip and shared context

The question is identical to the reviewed source. The only deep field changed is:

- Before: `Не смешивайте симптомы разных слоёв модели.`
- Current: `У boundary clock B отдельно проверь синхронизацию вышестоящего порта с grandmaster G и обмен PTP с C1/C2 на нижестоящих портах: B не просто пересылает исходные сообщения G.`

Git `log -S 'У boundary clock B отдельно' -- src/data` attributes this replacement to `810c2ed0fc445c8026dfd537ab2e4ecfb7b40d33` (`feat(in-depth): replace 38 generic tips with topic-specific checks`). This is an observed direct textual change, not a newly diagnosed semantic defect.

Matching lesson blocks **by heading**, rather than array position, establishes that the two `ptp-boundary-and-transparent-clock` target bodies are unchanged. Current `l7-monitoring-snmp-syslog` adds a Syslog/VTY block per mode, adds existing-heading anchor metadata to SNMP/Syslog blocks and repairs trap-port spacing/notation (`наUDP162` → `на UDP/162`, `port162` → `port 162`). Index shifts must not be counted as rewritten PTP explanations. Glossary/shared-context changes remain outside an automatically transferable full PASS.

## Per-ID evidence outcome and minimal next review scope

The equality columns below compare **known Git source `188c6938` to current `b22984cc`**, not the unknown source of each historical final-review-4 hash. They must not be used to invent a reconstructed historical provenance.

| ID | Available independent semantic evidence | Exact reviewed source | Question/deep vs 188c | Shared context vs 188c | Current full semantic disposition |
| --- | --- | --- | --- | --- | --- |
| `tcp-05` | Grok batch01 fresh PASS; reviewed hash reconstructed exactly | `e833593dc2cb34303bd6f884eb346d18cfd1dc1f` | Equal | Changed | **TARGETED_REVIEW_REQUIRED** for later shared-context delta only; existing core/target review is confirmed |
| `review-ptp-17` | Grok batch02 fresh PASS; source executed for this ID | `3c769601aa3627ca9c700982f1a170fc6c3352cb` | Changed: practicalTip | Changed | **TARGETED_REVIEW_REQUIRED** for new practicalTip and later shared-context delta; preserve reviewed core and unchanged PTP sections |
| `mon-snmp-01` | final-review-4 REVIEW; initial FIX and author repair are not PASS | Unknown (`frozenCommit:null`) | Equal | Changed | **TARGETED_REVIEW_REQUIRED**: authPriv/USM/key/distractors, plain/pro, precise SNMP target and glossary; reuse historical findings rather than audit unrelated lessons |
| `mon-syslog-01` | final-review-4 REVIEW; initial FIX and author repair are not PASS | Unknown (`frozenCommit:null`) | Equal | Changed | **TARGETED_REVIEW_REQUIRED**: warnings 0–4 threshold, alternatives, plain/pro, Syslog target and glossary |
| `mon-syslog-05` | final-review-4 REVIEW; initial FIX and author repair are not PASS | Unknown (`frozenCommit:null`) | Equal | Changed | **TARGETED_REVIEW_REQUIRED**: buffered/monitor/console/host distinction, terminal monitor condition, alternatives, both styles and relevant terms |
| `mon-zabbix-01` | final-review-4 REVIEW; Gemini matrix explicitly omitted this ID | Unknown (`frozenCommit:null`) | Equal | Changed | **TARGETED_REVIEW_REQUIRED**: active vs passive paths/ports, agentd vs Agent2 settings, alternatives, both styles, exact target and terms |
| `wifi-std-01` | final-review-4 REVIEW; initial FIX and author repair are not PASS | Unknown (`frozenCommit:null`) | Equal | Equal | **TARGETED_REVIEW_REQUIRED**: existing current pack only; no later Git delta since 188c to re-audit |
| `wifi-std-04` | final-review-4 REVIEW; initial FIX and author repair are not PASS | Unknown (`frozenCommit:null`) | Equal | Equal | **TARGETED_REVIEW_REQUIRED**: existing current pack, OFDMA/RU/6E/7 boundaries and exact sections/terms only |
| `wifi-roam-01` | final-review-4 REVIEW; initial FIX and author repair are not PASS | Unknown (`frozenCommit:null`) | Equal | Equal | **TARGETED_REVIEW_REQUIRED**: existing current pack, client roaming vs AP influence and limitations only |
| `wifi-sec-01` | final-review-4 REVIEW; initial FIX and author repair are not PASS | Unknown (`frozenCommit:null`) | Equal | Equal | **TARGETED_REVIEW_REQUIRED**: existing current pack, SAE/PAKE/key derivation/offline-attack boundaries and exact sections/terms only |
| `wifi-sec-05` | final-review-4 REVIEW; initial FIX and author repair are not PASS | Unknown (`frozenCommit:null`) | Equal | Equal | **TARGETED_REVIEW_REQUIRED**: existing current pack, hidden SSID/MAC spoofing/link vs upper-layer encryption boundaries only |

For the nine rows lacking a final independent PASS, a reviewer should issue a verdict on the current **nine ID-scoped packs**, grouping their shared lesson/terms once: SNMP/Syslog, Zabbix, Wi-Fi standards/roaming and Wi-Fi security. The two previously independently reviewed cores should not be rereviewed wholesale. This is **nine targeted packs + two bounded deltas**, not another 164-question audit. A later technical reconstruction may establish a historical row's source without itself converting REVIEW to semantic PASS.

No current full-material row receives **SEMANTIC_EVIDENCE_CONFIRMED** here: evidence confirms the stated two old-source review scopes, but does not establish whole-current-material acceptance for any of the eleven. Existing statuses and hashes remain immutable. No source, policy, production, merge/deploy or GitHub Actions changes were made by this investigation. GATE-06 remains **BLOCK** pending provenance resolution and/or the explicit independent addressed decisions above.

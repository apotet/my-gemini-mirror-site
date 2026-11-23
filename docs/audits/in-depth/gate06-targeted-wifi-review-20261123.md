# GATE-06: independent Wi-Fi semantic review, 2026-11-23

Reviewer: `/root/final_wifi`, a fresh Codex reviewer who did not author the educational material or its repairs. This is independent of the repair author, not a claim of an external Gemini review. Scope is exactly `wifi-std-01`, `wifi-std-04`, `wifi-roam-01`, `wifi-sec-01`, `wifi-sec-05`. Initial source: `b22984cc3746d35b2b2c990af59055dfe467778c`. No other question bank or historical reconstruction was audited.

## What was actually read

I read each actual resolved question (all alternatives and key), brief, complete plain and professional explanations, practical tip, common trap and memorization rule from the real resolver export `/tmp/gate06-acceptance-current.json`. I read the complete expanded plain/professional bodies, summaries, term lists and command examples of the two shared lessons once: `l12-wifi-standards-roaming` and `l2-wifi-security-diagnostics`. I read the union of 90 captured glossary entries and tooltip labels/summaries. Entries captured only because a command placeholder resembles a term were distinguished from visible prose; a command such as `aaaa.bbbb.cccc` is not being reported as a visible DNS AAAA error.

I checked the actual resolver-selected anchors against both expanded styles. This verifies mapping and subject correspondence, not a claim of personally executing browser navigation.

## Initial findings at the frozen source

| ID | Initial materialHash | Initial verdict | Confirmed issue |
| --- | --- | --- | --- |
| `wifi-std-01` | `4892ce8bd1c4cd3dfd22e308c0528c24036fa9e3c9bdcf71a7aeca2aeb88e234` | FIX | Raw question explanation/remember and resolved memorization rule universally claim that only 1/6/11 are nonoverlapping; the already-correct detailed text explicitly rejects that universal claim. Shared visible phrases also invoke unrelated tooltips. |
| `wifi-std-04` | `b3d9a57659c962e4ce2b3395704f64878d9e859ad3e8eaccf7036e4d52300f14` | FIX | Auxiliary explanation/remember conflate 6E/7 with a guaranteed clean 6-GHz band, contradicting the detailed regulatory/capability qualifications. Shared visible phrase tooltips also require repair. |
| `wifi-roam-01` | `dda03501d66a18c4298e6cbf4c4e3a9eabcd7e4daf70170735a79ed4c4645de0` | FIX | Main reasoning is correct; shared lesson summary `sticky clients`, `retry rate` and heading `Tx Power Symmetry` trigger unrelated Port Security/NTP/optics tooltips. |
| `wifi-sec-01` | `8a8096edab30ecd1daa575464fa8e466e8a8f0efffbcaf168295e38eb0345bb8` | FIX | Correct main SAE reasoning contains `Password-Authenticated Key Exchange`; generic `exchange` tooltip instead teaches DNS MX/OSPF. Shared radio-statistics prose also needs contextual matching. |
| `wifi-sec-05` | `cc7f83818db7ec73470bcf1fb9b0eb0ab6b4513d608624ebac2f95e4c5d28d03` | FIX | Correct Hidden-SSID reasoning contains `Probe Request`, whose generic `Request` tooltip instead teaches DHCP. |

Original problematic auxiliary excerpts were `полностью не перекрываются только каналы 1, 6 и 11` and `Wi-Fi 6E / 7 (802.11be) = чистый диапазон 6 ГГц`. The answer indexes **[2], [3], [1], [2], [0]** are unambiguous among their alternatives and do not need alteration. The issue is not a wrong key.

The five observed cross-domain matches are exact phrase/context defects, not incorrect definitions in the other domains: `Probe Request` → DHCP `Request`; `Password-Authenticated Key Exchange` → DNS/OSPF `exchange`; `retry rate` → NTP `RATE`; `Tx Power Symmetry` → optical `Tx power`; plural `Sticky clients` → Port Security `sticky`. The global definitions for those other protocols should remain intact. Whole-phrase Wi-Fi entries are an appropriate narrow repair with the existing longest-first matcher.

## Ten acceptance criteria: engineering assessment

1. **Question:** the office-channel scenario supports 1/6/11 among the presented choices without making that plan globally exclusive. OFDMA asks about resource-unit allocation, not security or radar coexistence. The roaming, SAE and Hidden-SSID scenarios have sufficient assumptions for their intended answer.
2. **Answer/distractors:** channel widening/max power/co-channel-for-roaming do not solve the stated overlap; SAE/PMF/DFS do not allocate OFDMA RU; DHCP/controller-forced-selection/duplicate-BSSID are not the stated roaming explanation; SSID hiding/MAC filtering/rate limiting do not provide SAE's password-exchange property; hiding SSID does not break DHCP/routes or disclose plaintext passwords automatically. Each supplied key is unique.
3. **Plain:** each resolved explanation teaches its mechanism with limitations. It distinguishes a useful channel plan from an interference guarantee, Wi-Fi 6E spectrum from Wi-Fi 7 capabilities, client selection from infrastructure assistance, and link protection from TLS/SSH/VPN.
4. **Professional:** the material explains RU versus spatial streams versus MLO; client-specific roaming thresholds and 11k/v/r roles; WPA2 PSK/PMK/PTK/GTK versus SAE; offline guesses versus forward secrecy; and robust-management protection versus jamming/pre-association attacks. It does not promise fixed latency, roaming time, universal radio power or a guaranteed MCS from SNR.
5. **PracticalTip:** checks name observable evidence: actual BSSID/client measurements, retry/channel-utilization/latency comparison, negotiated AKM, transition-mode behavior and AP/client capabilities. It does not invent a NetOps radio simulator or force risky deauth/basic-rate changes without measurements and rollback.
6. **CommonTrap:** all five traps are actual topic-specific misconceptions, not a generic OSI sentence. In particular the SAE text separates forward secrecy from offline-dictionary resistance; roaming text rejects an automatic LTE-like handoff analogy.
7. **Lesson:** standards/roaming and security lessons directly cover the questions; both styles contain adequate sections. Shared examples about DFS, noise, CCI/ACI and 802.1X consistently qualify scope and implementation effects.
8. **Navigation:** exact selected anchors are `indepth-wifi-channel-plan`, `indepth-wifi-ofdma-6ghz`, `indepth-wifi-client-roaming`, `indepth-wifi-sae-vs-psk`, `indepth-wifi-hidden-ssid`. Each occurs in both relevant expanded styles and points at the intended explanation, not an unrelated appended section.
9. **Glossary:** existing substantive Wi-Fi definitions (OFDMA/RU, OFDM/DSSS, MCS, MLO, DFS/CAC/PSC/RNR, EIRP, 11k/v/r, PMK/PTK/GTK, AKM/PAKE/OWE, WPA2/WPA3/PMF/KRACK and others) are technically consistent. The five matching errors above must be fixed; adding correct whole-phrase entries does not require corrupting unrelated definitions or changing tokenizer architecture.
10. **Consistency:** the four stale auxiliary fields must be aligned with the detailed text; main explanations already state the required caveats. After those repairs and correct phrase tooltips, no remaining contradictory key/plain/pro/lesson claim was identified in this scope.

## Primary engineering references consulted

- [RFC 7664, Dragonfly](https://www.rfc-editor.org/rfc/rfc7664): password-authenticated key exchange and offline-dictionary resistance; a successful guess requires active interaction. Implementation and online-guess limits are separate issues.
- [RFC 8110, OWE](https://www.rfc-editor.org/rfc/rfc8110): opportunistic wireless encryption is not an authentication mechanism. This supports the distinction between Enhanced Open and WPA3-Personal in the reviewed material.
- [Cisco: Configure and Verify Wi-Fi 6E WLAN Layer 2 Security](https://www.cisco.com/c/en/us/support/docs/wireless/catalyst-9800-series-wireless-controllers/220712-configure-and-verify-wi-fi-6e-wlan-layer.html): 6E extends 802.11ax into 6 GHz; WPA3/Enhanced Open and PMF requirements support the security qualifications in both lesson styles.
- [Cisco: 802.11 WLAN and Fast-Secure Roaming](https://www.cisco.com/c/en/us/support/docs/wireless-mobility/wireless-lan-wlan/116493-technote-technology-00.html): client AP choice and FT's reduction of repeated authentication agree with the distinction between client decision and infrastructure assistance.

No personal acceptance of all NetOps lessons, no 164-question semantic PASS and no GATE-06 PASS follows from this scoped review.

## Independent repair reacceptance

**Final reviewed content commit: `3983019649ac671b6436b0d2df388a1578ddd27c`.** The author is `/root`; I am a separate nonauthor reviewer. I verified the commit and an empty `git diff HEAD -- src`, loaded that worktree's actual `in-depth-entry.ts` through its real `load-bank.mjs`, resolved only these five questions, and independently checked the actual full/component hashes against the repaired snapshot. This was not a replay of historical fingerprints or a bank-wide semantic audit.

I read and accepted the five corrected auxiliary fields: `wifi-std-01` explanation/remember no longer teach an exclusive worldwide 1/6/11 rule; `wifi-std-04` explanation/remember separate 6E spectrum, Wi-Fi 7 capabilities and country/hardware limitations without promising clean spectrum; `wifi-roam-01` topic now names the complete `Sticky client` concept. That topic change is justified because derived `keyTakeaways` are rendered with term recognition, so bare `Sticky` previously produced a Port Security explanation even after fixing the lesson summary.

I read the actual five new phrase definitions. `Probe Request` now explicitly distinguishes a specific SSID from wildcard/empty SSID, without incorrectly contrasting it with a broadcast MAC destination. PAKE describes password-authenticated key agreement; retry-rate interpretation is platform-specific and does not diagnose interference on its own; Tx Power Symmetry describes the reverse radio link rather than optical power; plural Sticky clients correctly explains client-driven roaming and the limits of AP influence. Their existing longest-first matching covers each phrase as a whole. The unrelated DHCP, NTP, optical, Port Security and MX/OSPF definitions are preserved for their actual domains.

The final resolved payloads contain none of the five erroneous dictionary keys `Request`, `exchange`, `RATE`, `Tx power`, `sticky`. Each new whole phrase produced exactly its intended canonical term in the real matcher. The existing main plain/professional bodies, question stems, answer order and keys are unchanged. All five exact intended anchors still occur once in each lesson style. The freshly resolved hashes are:

| ID | Checked content SHA | Final verdict | materialHash | questionDeepHash | sharedContextHash |
| --- | --- | --- | --- | --- | --- |
| `wifi-std-01` | `3983019649ac671b6436b0d2df388a1578ddd27c` | **PASS** | `75312801d71c4cee49ab4b9aa0e529934beff0ce8a85dc328ccd35e8163f3828` | `c389f5ead6c22d76f53461eb4beb26c57a03ccc86a56edc0090f59e619f3c119` | `d04ab9dfb3dae8282f65d52c2a269b63d55811affc931da241e6d202e12ef2b4` |
| `wifi-std-04` | `3983019649ac671b6436b0d2df388a1578ddd27c` | **PASS** | `3d80fde6632d25454131e0380568348aaec14120598ba0031642bfe3b1a811c2` | `aa19e66d556f924ab3c5f6098ccbb2477a4d93c76c88170f4e10e8a24022fd79` | `5bb918a26c45d255f9f687adc84d57dfe532139667becd89e5f4b3dc7dbaaef5` |
| `wifi-roam-01` | `3983019649ac671b6436b0d2df388a1578ddd27c` | **PASS** | `4a44026b731db39d8b768a8f8c189db6686eb1fa5336ab1d1cc60232c2c85395` | `9330b5fc05cd208a1d9585ef3ed23eb41464eea8c8cf69962afee476ed75f2fe` | `d04ab9dfb3dae8282f65d52c2a269b63d55811affc931da241e6d202e12ef2b4` |
| `wifi-sec-01` | `3983019649ac671b6436b0d2df388a1578ddd27c` | **PASS** | `5a86b9d2c23f44c617b1f85e11787824f82c0e514a515e2fe61d21d2ea65e53c` | `d9f5dc6bfab22766ec89ed149f25437eb442d513072b72c66e40912a5152a5f1` | `ac51387c8ac18ac51d7dc62d8c56c6bce2524fb966fa5de036459b042d174d58` |
| `wifi-sec-05` | `3983019649ac671b6436b0d2df388a1578ddd27c` | **PASS** | `994d5c007e387d9ec6719c06aed2843d6a5d4a622f440d2a364d86b399739cc5` | `df8685a21768f5b968de3d57eb639a472912e41c11b8e0daa28b5bacd957ef4c` | `6dca9763b546fd0f57d8634ad6453d04d24350a5b80960fa7bee2217d4a01de5` |

The verdicts are independent engineering judgments after reading the material and exact repairs; the resolver/hash/token assertions support version identity and observed behavior, not semantic correctness by themselves. No remaining blocking FIX/REVIEW was identified for these five ID-scoped packs at this content commit. Browser execution and final CI are separate evidence owned by the integrator; I do not claim to have personally run them. This scoped PASS does not approve all lessons personally for the owner and does not set GATE-06 PASS. I edited only this review report, not educational source, tests, policy, branches or historical reports.

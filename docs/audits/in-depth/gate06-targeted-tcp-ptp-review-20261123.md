# Independent TCP/PTP delta review — 2026-11-23

Reviewer: `/root/final_tcp_ptp`, a Codex subagent independent of the repair author (`/root`). This reviewer has not edited educational source, regression tests, release policy or historical reports. This is an engineering review of the explicitly bounded deltas; it is not a full-bank audit, a Gemini verdict, owner acceptance of the entire lessons, or GATE-06 PASS.

## Scope and retained prior evidence

The initial educational source is `b22984cc3746d35b2b2c990af59055dfe467778c`. The prior `/root/accept_tcp_ptp` report is reused with attribution for its initial findings, not presented as work personally performed by this new reviewer. I separately read the actual four added PPP/FCS lesson blocks in both styles, the changed glossary entries, the new PTP practical tip and the added Syslog/VTY blocks from `/tmp/gate06-acceptance-current.json`, together with the old-version payloads in `/tmp/gate06-delta-review-old.json`.

The unchanged `tcp-05` question/deep and target section are retained from Grok's independent review at `e833593dc2cb34303bd6f884eb346d18cfd1dc1f`. The unchanged PTP question/main explanation/target sections are retained from Grok's review at `3c769601aa3627ca9c700982f1a170fc6c3352cb`. Their exact version correspondence is documented in PR #334's `gate06-eleven-semantic-version-evidence-20261123.json`; those core materials were not rereviewed wholesale here.

The monitoring reviewer reads the shared monitoring lesson and definitions once for all relevant IDs; this report references that independent shared assessment for the PTP package instead of repeating the entire lesson audit.

## Initial findings and direct engineering assessment

| ID | Initial SHA | Initial verdict | Reason |
| --- | --- | --- | --- |
| `tcp-05` | `b22984cc3746d35b2b2c990af59055dfe467778c` | FIX | New PPP professional text calls the IPv4 field `Next Protocol`, producing the unrelated copper `NEXT` tooltip. |
| `review-ptp-17` | `b22984cc3746d35b2b2c990af59055dfe467778c` | FIX in shared context; practical tip correct | Monitoring glossary collisions require repair; the boundary-clock tip itself correctly distinguishes upstream synchronization from downstream PTP sessions. |

### TCP changes

RFC 1332 §2.1 states that IPCP must reach **Opened** before IP datagrams are communicated, and that PPP uses protocol hexadecimal **0021** for an IP datagram. The new lesson correctly describes an already established point-to-point link, without renegotiating IPCP for each datagram and without mandatory Ethernet ARP on that PPP link. RFC 791 §3.1 names the eight-bit IPv4 header field **Protocol**; it does not name it “Next Protocol.” The initial incorrect phrase also causes the case-insensitive glossary tokenizer to select `NEXT` (Near-End Crosstalk), making this a concrete instructional defect rather than a preference about wording.

The FCS/checksum additions are technically correct within the stated condition: an intermediary changes payload and generates a new valid frame FCS, so the next recipient can accept that frame without knowing the earlier payload. IPv4 header checksum excludes payload. These statements do not claim that random corruption normally passes FCS or that the transport/application checks are irrelevant. RFC 791's explicit “A checksum on the header only” supports this boundary. The new `next-hop` definition correctly describes the selected next forwarding node and is distinct from copper `NEXT`.

Primary references actually checked: [RFC 1332 §2.1](https://www.rfc-editor.org/rfc/rfc1332#section-2.1), cached text `/tmp/gate06-rfc1332.txt`, and [RFC 791 §3.1](https://www.rfc-editor.org/rfc/rfc791#section-3.1), cached text `/tmp/gate06-rfc791.txt`.

### PTP changes

The new practical tip asks the learner to check boundary clock B's upstream synchronization with grandmaster G separately from its downstream exchanges with C1/C2, because B does not merely forward G's original messages. That is consistent with a boundary clock's upstream synchronized role and downstream time-distribution roles in the question's specified topology. The tip does not substitute transparent-clock forwarding for boundary-clock operation. It is concrete, applicable and consistent with the unchanged previously reviewed PTP explanation.

I fetched and read the official [Cisco IOS XE 17.12 PTP chapter, Boundary Clock](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-12/configuration_guide/lyr2/b_1712_lyr2_9300_cg/configuring_precision_time_protocol__ptp_.html). Its explicit statement is: “The master port synchronizes the clocks that are connected downstream, while the slave port synchronizes with the upstream master clock.” The locally retained text is `/tmp/gate06-cisco-ptp-review.txt`. This supports the bounded tip's role separation; platform-specific restrictions elsewhere in that chapter are not generalized to all IEEE 1588 devices.

The added Syslog/VTY blocks correctly distinguish `show logging`'s local buffered history from live output in a particular SSH/VTY session, require an applicable `logging monitor` severity and session `terminal monitor`, and do not conflate `logging console` with all SSH sessions. Definitions of `VTY` and `running-config` are correct. Removing the PoE-only `Class` tooltip from unscoped PTP clock-class text avoids a misleading cross-domain definition. Full monitoring-command and glossary acceptance is attached to the companion monitoring review, not assumed from this limited check.

Resolver targets `indepth-ipv4-router-rewrite` and `ptp-boundary-and-transparent-clock` exist in both lesson styles and point to the previously reviewed topics. Presence of an anchor is structural evidence; the independent content reasoning above is separate from that presence check. Browser execution is not claimed by this report.

## Exact repaired-version reacceptance

Frozen repair source: **`3983019649ac671b6436b0d2df388a1578ddd27c`**. The repair author is `/root`; this reviewer did not author any repair or test. I verified actual `git rev-parse HEAD`, an empty `git diff HEAD -- src`, and the repaired snapshot's matching `sourceSha`. I then ran a separate real `load-bank.bundleEntry` import from the repair worktree and resolved only these two IDs; the captured full/component hashes independently agreed with `/tmp/gate06-acceptance-repaired.json`.

| ID | materialHash | questionDeepHash | sharedContextHash | Verdict |
| --- | --- | --- | --- | --- |
| `tcp-05` | `738a643207cea8a344a64bd3619d9227c55861b626a9f86f2c1dccdfd7a63fcf` | `681237c1b56844501829b1c7771e6061f12f5be1f3a0aa7b4f2c87155b8c119d` | `c406a2a3d9ed002a73498aaeeb3ba9cd0ac7b1088ee6c3e093bf839946c6fe8b` | **PASS — bounded delta** |
| `review-ptp-17` | `610d2f9f4a19c84249fadab448ef31688f4b6b2d377b9c03e2ab4b47481664e5` | `741abd89535afb80ea866027f7904618cc70c7ecdfcf1a1ba4f7e0f95a69ebe5` | `5acbe05f4dea7f12047d04c9aaf618ca05703691c73998466bd08e3c1cc88ae8` | **PASS — bounded delta**, incorporating the companion shared-monitoring review |

The repaired PPP text now says `значение PPP Protocol не равно полю Protocol заголовка IPv4, где 17 означает UDP`. It accurately separates PPP's encapsulation discriminator from IPv4's upper-layer discriminator. Actual tokenization of the repaired full block no longer selects `NEXT`; it still selects the correct `next-hop` term. Comparing the initial `b229` TCP payload with the repaired payload shows only the professional PPP block body and removal of the inapplicable `definitions.NEXT` from this material. The question/deep component is exactly retained from the prior independently reviewed core. Neither unchanged target section nor the FCS material was rewritten by this repair.

For PTP, comparing initial and repaired payloads shows only the plain/professional Trap/Inform body wording, the Syslog professional command title, and removal of inapplicable `GET`, `Request` and `retransmission` definitions from the shared material. The revised SNMP wording preserves the application-layer distinction without showing HTTP/DHCP/TCP tooltips. The title now promises millisecond timestamps rather than UTC that the shown command does not configure. Actual tokenization was checked in both styles. The boundary-clock practical tip and its full current question/deep hash are unchanged by this repair; the two-mode PTP target anchor is still unique and correct.

Recheck script/evidence retained locally: `/tmp/gate06-tcp-ptp-final-recheck.mjs` and `/tmp/gate06-tcp-ptp-final-evidence.json`. The resolver assertions are technical evidence; semantic PASS comes from the separately stated engineering reading and source reasoning, not from these assertions or CI. No new full-bank reconstruction or semantic audit was run.

The separate nonauthor reviewer `/root/final_monitoring` independently accepted the shared monitoring lesson/definitions at the **same `3983019649ac671b6436b0d2df388a1578ddd27c` source**, with four full-package PASS, zero remaining FIX and zero REVIEW. I read the final companion report and checked its scope and SHA before incorporating it for PTP's shared context. See [Monitoring review](gate06-targeted-monitoring-review-20261123.md); it does not require rereading the same common lesson independently for every related ID.

Repaired source links: [PPP professional wording and SNMP shared sections](https://github.com/apotet/my-gemini-mirror-site/blob/3983019649ac671b6436b0d2df388a1578ddd27c/src/data/inDepth/group1.ts), [PTP practical tip](https://github.com/apotet/my-gemini-mirror-site/blob/3983019649ac671b6436b0d2df388a1578ddd27c/src/data/inDepth/specificPracticalTips.ts), [Syslog command title](https://github.com/apotet/my-gemini-mirror-site/blob/3983019649ac671b6436b0d2df388a1578ddd27c/src/data/lessons/l7-monitoring-snmp-syslog.ts#L170).

## Cross-review integration check

I read the final Monitoring and Wi-Fi reports without duplicating their full semantic reviews. All three reviewers identify the same frozen repair source; none is the source author. Monitoring covers **four full packs**, Wi-Fi covers **five full packs**, and this report covers **two bounded deltas** while retaining the explicitly unchanged prior independently reviewed cores. Thus the final addressed matrix has **9 full-pack PASS + 2 bounded-delta PASS, no remaining FIX or REVIEW within that scope**. The reports include actual material/component hashes and discriminate executed resolver checks from browser/CI evidence owned by the integrator. No report claims all 164 questions were newly independently reviewed, that historical REVIEW rows were rewritten, or that GATE-06 is PASS.

**Final result of this review: both bounded deltas PASS at the named repair source. GATE-06 remains BLOCK pending the separate provenance/policy closeout decision and other release requirements.** No source, tests, policy, historical report, production, merge or deploy was changed by this reviewer.

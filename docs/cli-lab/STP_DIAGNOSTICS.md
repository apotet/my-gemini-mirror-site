# Stage 3A: Cisco IOS CST diagnostics (#121)

## Dependencies and review base

Main remains `f0fe118598e2253380c3c5f23a25af56f35e6a61`. All dependencies were open
when this branch was created:

| PR | HEAD | Role |
|---|---|---|
| #116 | `69d8046afd5db41604cbbff4a45bd6609ae8c244` | physical topology UI |
| #118 | `3e9636ab17fff93644c093a8ff492b1b84ee3082` | pure CST engine |
| #119 | `57f19fa15531e60724365790e730761868f042c7` | CST forwarding and SVI integration |
| #120 | `cb3b319874304953710e850fca6b61328ddfe4cf` | visual CST projection, includes topology UI |

The diagnostic branch is stacked on **#119**, targeting `feat/cli-stp-forwarding`.
Its review diff therefore contains diagnostics only, not the engine/forwarding
changes again. Accept upstream #118/#119 independently first, then retarget this
PR to staging main and rebase if necessary after squash merges. No dependency was
merged by this work. #116/#120 are compatible visual consumers, not required by
the command module; no shell, topology or visualization files are changed here.

## Commands and grammar

- `show spanning-tree`: Bridge ID and component Root ID (priority and MAC), root
  path cost, root port/Port ID, explicit root marker, interface/role/state/cost/ID table.
- `show spanning-tree detail`: same display plus root device key, administrative
  and physical status, designated Bridge/Port IDs and configured PortFast metadata.
- `show spanning-tree summary` and `show spanning-tree vlan N` are recognized
  syntax solely to return an **unsupported capability error** explaining the
  one-CST model and pointing to the two supported displays. No fake summary,
  VLAN instance or PVST+ output. N uses the existing 1..4094 VLAN validator.
- EXEC and privileged EXEC are supported; configuration modes use `do show`.
  Commands have one canonical registry entry with typed suffixes. Enter, TAB,
  space/no-space `?`, case handling and unique abbreviations use the existing
  resolver without alias branches or parser changes.
- `sh sp` and `sh sp d` are valid. `sh s` in privileged EXEC is now genuinely
  ambiguous between spanning-tree and startup-config and correctly reports that;
  `sh start` retains its existing meaning. Unsupported suffixes and extra arguments
  are rejected before the handler. Help labels summary/vlan as unsupported.

## Data and scope

The handler calls existing `deriveSpanningTree(state)` on the current NetworkState
for each command. It formats only the active device's derived result, including
that device's component root. No election, cost calculation, STP cache, runtime
mutation or new source of truth is implemented in the vendor module.

A root has cost zero and root port `none`. Port ID is displayed as
`priority.number`. Roles use full names Root, Designated, Nondesignated and Disabled;
states are exactly the model's Forwarding/Blocking. Disabled ports retain the
engine's blocking state, while detail separately reports physical/admin down.
**Blocking never implies physical down**: a live blocked port displays Blocking
in the table and `Physical link: up` in detail, matching the separate physical
show interface and topology sources.

No timers, BPDU statistics, transition events or topology-change counters are
available. The output explicitly says converged model and describes the limit;
PortFast is configuration metadata, not a simulated fast transition. No IOS STP
configuration, RSTP, PVST+, MSTP or packet/ARP simulation is added. Synthetic
legacy MACs, path-cost defaults and point-to-point topology constraints are
inherited from the engine and documented in STP_ENGINE.md.

Routed-only devices report no modeled L2 bridge, rather than inventing a root.
Invalid STP input produces a diagnostic error, not partial fabricated output.
Running/startup configuration and save/reload behavior are unchanged.

## Test matrix

`node scripts/cli-spanning-tree.test.mjs` exercises **16 groups and 11 complete
exact-output golden fixtures**. Goldens are fixed expectations, not recomputed
from the STP engine by the tests. Every fixture is required to be exercised.

Coverage: two-switch Root/Non-root and root detail; triangle blocking/detail;
four-switch ring; cable failure/recovery; CLI shutdown/no shutdown; partitions
with roots A and B; bridge priority/MAC and receive-cost edits; parallel-link port
priority; console switches; exec/privileged/config/do modes; TAB and repeated TAB;
word/syntax help, ambiguity, abbreviation/case/whitespace; capability errors;
invalid arguments; no fake timers/counters; no mutations, unchanged running/startup;
router-only devices; malformed STP config; save/reload.

Tests observe the public command output and compare physical show output against
Blocking. A spy also proves that TAB and help do not invoke the diagnostic handler.

## Actual model outputs

Captured through LabEngine from the two-switch test fixture (configured MACs,
default priority/cost). These are actual simulator output, not hardware captures.

```text
A#show spanning-tree
CST - IEEE 802.1D (converged model)
Root ID    Priority 32768
           Address  02:00:00:00:00:01
Bridge ID  Priority 32768
           Address  02:00:00:00:00:01
Root Path Cost: 0
Root Port: none
This bridge is the root

Interface                 Role           State       Cost   Port ID
FastEthernet0/1           Designated     Forwarding  19     128.1

CLI Lab: one converged CST shared by all VLANs; no BPDU packets, counters or transition timers are simulated.
```

```text
B#show spanning-tree
CST - IEEE 802.1D (converged model)
Root ID    Priority 32768
           Address  02:00:00:00:00:01
Bridge ID  Priority 32768
           Address  02:00:00:00:00:02
Root Path Cost: 19
Root Port: FastEthernet0/1 (128.1)

Interface                 Role           State       Cost   Port ID
FastEthernet0/1           Root           Forwarding  19     128.1

CLI Lab: one converged CST shared by all VLANs; no BPDU packets, counters or transition timers are simulated.
```

## Actual verification (2026-11-13)

Local Node v24.22.1:

- All **23 CLI test files** passed (20 legacy, stage 2A/2B and this stage).
- New diagnostics: **16 groups, 11 exercised exact-output goldens** passed.
- `npm run lint`, `npm run build` including prebuild checks, and `npm run test:logic`
  passed. Existing chunk-size warning only; no question-bank/exam changes.
- The exact #120 diff applied without conflicts to an isolated #119 + diagnostics
  worktree. All 23 CLI files, TypeScript and build passed there too. This was a
  local validation overlay, not a GitHub merge. #120 includes the #116 panel.
- Chromium on that combined overlay, desktop 1440×900 and mobile 375×812: command
  Root/Non-root marker agrees with selected panel node; TAB/help work; shutdown
  partitions the two-switch scenario into two displayed roots; no shutdown restores
  one root; `do show` and unsupported VLAN scope errors work; no page errors.
  Four-switch diagnostics are tested in the engine/CLI suite, not a new UI scenario.
- Four external deliberately broken variants (wrong console, Blocking displayed
  as Down, all devices claiming root, fabricated Hello timer) failed assertions.
- `git diff --check` passed. No STP engine, forwarding, layout or UI changes.

The PR adds this test to CI and includes `feat/cli-stp-forwarding` in the CI PR
branch filter for stacked review. GitHub CI uses Node22; its actual run/result is
reported separately in the PR acceptance report. Deploy workflow is untouched.

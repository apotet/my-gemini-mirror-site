# Stage 3B: Cisco CLI configuration of the single CST (#124)

## Base and integration gate

Stacked on PR #123 at `2c97b1159be7210f4f9aa26bbf2faa2df0bde584`, branch
`feat/cli-stp-diagnostics`. Upstream #118 (`3e9636a`) and #119 (`57f19fa`) remain
open; main checked at `f0fe118598e2253380c3c5f23a25af56f35e6a61`.
Accept upstream changes independently, then retarget/rebase this PR to main.
Do not merge it into a feature base as an acceptance shortcut. No merges or
deployments are part of this stage.

Visual PRs #116/#120 and the approved product direction #122 are independent
consumers of NetworkState. No visual/layout/scenario files change here.
The exact #120 diff (`cb3b319874304953710e850fca6b61328ddfe4cf`, including #116)
is used only in a local compatibility overlay.

CI retains the temporary feature-base filters while PRs are stacked, adding
`feat/cli-stp-diagnostics` so this PR runs CI. **At final integration, restore
pull_request branches to `[main]`** after all feature-base review dependencies
have been accepted. This is a review/integration step, not authorization to merge.
The deployment workflow is untouched.

## Official Cisco reference and explicit differences

Checked the exact non-MST sections in the official Catalyst 2960 command reference,
Cisco IOS 15.0(2)SE and later, on 2026-11-13:

- [spanning-tree cost](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-0_2_se/command/reference/cr2960/cli3.html#70107): interface configuration;
  `spanning-tree [vlan vlan-id] cost cost`, `no spanning-tree [vlan vlan-id] cost`.
  Documented cost range 1..200000000 and bandwidth-based defaults (1 Gbit:4,
  100 Mbit:19, 10 Mbit:100).
- [spanning-tree port-priority](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-0_2_se/command/reference/cr2960/cli3.html#91880): interface configuration;
  `spanning-tree [vlan vlan-id] port-priority priority`, corresponding no form;
  0..240 in increments of16, default128.
- [spanning-tree vlan](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-0_2_se/command/reference/cr2960/cli3.html#32981): global configuration;
  `spanning-tree vlan vlan-id priority priority`, corresponding no form;
  bridge priority 0..61440 in increments of4096.

The simulator intentionally implements only this subset:

| Command | Model effect / limit |
|---|---|
| `spanning-tree vlan 1 priority N` | device.stp.priority; default32768; compatibility mapping to **ALL VLANs in one CST** |
| `no spanning-tree vlan 1 priority` | delete only bridge priority override |
| `spanning-tree cost N` | physical L2 interface.stp.pathCost, **1..65535**; default19 |
| `no spanning-tree cost` | delete only cost override |
| `spanning-tree port-priority N` | physical L2 interface.stp.priority, 0..240 step16; default128 |
| `no spanning-tree port-priority` | delete only port-priority override |

Real IOS VLAN-priority settings are per-VLAN. This lab's accepted VLAN1 syntax
is **not PVST**: set and no both print
`CLI Lab: CST-only: VLAN 1 priority sets the common tree priority for ALL VLANs, not PVST.`
Other VLANs, VLAN lists/ranges and per-VLAN interface variants are rejected before
execution. Invented global `spanning-tree priority N` is not registered.

Further differences inherited from the engine: fixed default cost19 without
bandwidth/media detection; a zero system-ID extension, not VLAN1 added to the
Bridge ID priority; synthetic legacy MACs/automatic port IDs when no explicit
model identity is configured; converged state only. Reset uses model defaults,
not detected hardware bandwidth. Explicitly setting a default stores an override
until `no`. RSTP/PVST+/MSTP, mode switching, BPDU packets/timers, root primary/secondary,
PortFast CLI and other IOS STP controls remain unsupported. No algorithm changes.

## Registry, validation and persistence

Six canonical command specs use the existing mode/privilege/abbreviation grammar.
Cost/priority arguments are strict unsigned decimal (no signs, fractions, exponent,
hex or leading zeroes). Invalid step/range/extra tokens do not reach a handler.

Two small opt-in registry contracts avoid ad hoc parsing branches:

- `CommandSpec.available(device)` gates physical L2 capabilities for Enter, TAB
  and help. Existing specs without a gate retain their behavior. SVI/routed ports
  and routed-only devices never advertise/execute these configurations.
- `CommandArgument.invalidMessage` lets a rejecting typed argument give a specific
  capability explanation. The VLAN argument accepts exactly `1`; other values
  produce a CST-only error in Enter/help, no `<cr>` and no TAB continuation.
  Existing argument validators without this optional field keep their messages.

Handlers update only existing `DeviceState.stp.priority` or `InterfaceState.stp`
fields. No root/role/cost derivation is duplicated. Subsequent show/L2/SVI queries
recalculate from current NetworkState, independent of UI. Configuring a shutdown
port is allowed; its cost takes effect when it is physically enabled again.

No forms remove only their field, deleting empty STP objects. MAC/port number/
PortFast metadata and other overrides survive. No new snapshot format is needed:
existing ConfigPersistence already saves these fields and restores/removes them.
Failed cables are never restored from startup config.

The shared running/startup formatter now emits the three supported overrides,
including explicit zero values. Comments identify the CST-only scope and VLAN1
mapping. Metadata without a corresponding implemented CLI command (MAC, explicit
port number, PortFast) remains model configuration, not invented IOS syntax.
A no reset removes the line from running; startup changes only on write/copy.

## Deterministic test matrix

`node scripts/cli-stp-configuration.test.mjs`: 17 groups.

- Two/three switches: priority command elects B, no returns A.
- Four-switch ring: VLAN10 filtered on the main tree cannot use a blocked backup;
  setting D priority4096 opens that path and restores both L2 and SVI.
- Cost10 on C's backup receive port changes root port and blocking, restoring
  L2/SVI; no cost restores cost19 and the original tree.
- Parallel links: upstream port-priority16 changes downstream root port; no resets.
- Configure cost while shutdown; no shutdown enables the new path.
- Zero priorities, all legal priority values and cost boundaries.
- Running/startup rendering, save/set/no/reload, saved no removal, cable failure.
- Preserve other STP metadata; no-op no on old defaults does not dirty config.
- Invalid values, invented/global/wrong-mode/wrong-interface commands, privileges,
  unsupported VLAN10 (including incomplete syntax), no silent CST mutation.
- TAB, space/no-space help, no `<cr>` for invalid input, abbreviations, do show,
  repeated TAB, and no mutation from help/completion.
- Replay supported STP config lines to reconstruct the same overrides.

The existing all-command argument test adds **four valid witnesses** for the new
argument-bearing specs. Its checks are unchanged: 310 Enter/help/TAB/state rows,
all43 registered commands and tail rejection. No old assertion was removed.

## Actual command output example

Captured through LabEngine on the four-switch integration fixture, with a VLAN10
filter on B–C. The physically live C–D backup starts blocked. After the priority
command, both L2 and SVI checks recover; these are simulator outputs, not hardware
captures. Full transcript is part of the implementation verification artifacts.

```text
D(config)#spanning-tree vlan 1 priority 4096
CLI Lab: CST-only: VLAN 1 priority sets the common tree priority for ALL VLANs, not PVST.
D(config)#interface fa0/21

D(config-if)#spanning-tree cost 10

D(config-if)#spanning-tree port-priority 16

```

Corresponding running-config STP lines (excerpt):

```text
! CLI Lab: CST-only STP configuration applies to ALL VLANs; no PVST.
! VLAN 1 priority is a compatibility mapping to the single common tree.
spanning-tree vlan 1 priority 4096
interface FastEthernet0/21
 spanning-tree cost 10
 spanning-tree port-priority 16
```

## Actual verification (2026-11-13)

Local Node v24.22.1:

- All **24 CLI test files** PASS; new configuration suite **17 groups** PASS.
- Existing registry argument matrix: **310 rows / 43 commands** PASS.
- TypeScript (`npm run lint`), production build with prebuild checks, and
  `npm run test:logic` PASS. Existing chunk-size warning only.
- Exact #120 patch on an isolated #123 + stage3B worktree: all24 CLI files,
  TypeScript and build PASS; no patch conflicts, no GitHub merge.
- Chromium 1440×900 and 375×812 on that overlay: configure the former nonroot to
  priority4096 and observe its visual Root marker; set cost/port-priority; save,
  no reset and reload restores settings/root; VLAN10 rejects with no help `<cr>`;
  TAB/help PASS; no page errors. Ring behavior is tested through CLI/engine, not
  a new browser scenario.
- Five deliberately broken external variants (ignore priority, accept other VLANs,
  no keeps override, omit running cost, ignore device capabilities) all fail
  assertions. No mutations are applied to this branch.
- `git diff --check` PASS. CST election/forwarding algorithms, ConfigPersistence,
  topology/visual code, scenarios, question bank and exams are unchanged.

The PR adds this suite to GitHub CI. CI uses Node22; its exact run/SHA/result is
reported separately in the PR and acceptance report.

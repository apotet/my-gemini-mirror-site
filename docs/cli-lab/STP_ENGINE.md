# Classic STP engine, stage 2A (#117)

Base: staging main `f0fe118598e2253380c3c5f23a25af56f35e6a61`.
Contract: #115. Independent of the open visualization PR #116; no shared changed files.

## API and source of truth

`deriveSpanningTree(network, { kind: 'cst' })` is a pure, synchronous calculation
of the **converged** common spanning tree over existing `NetworkState` links.
It returns `bridges[deviceId]` with Bridge ID, component root device/Bridge ID,
root path cost, root port, and per-port physical status, ID, cost, role, state,
designated Bridge ID and designated Port ID. There is a root **per component**,
not a fabricated global root when the network is partitioned.

No output is stored in `NetworkState`, config snapshots, React state or a cache.
There are no BPDU packets, transition timers, listening/learning transitions,
topology-change timers, MAC learning, forwarding database, RSTP, PVST+ or MSTP.
`nondesignated/blocking` is the classic STP role/state, not an RSTP alternate role.

`StpInstance` is a discriminated instance descriptor, currently **only** `cst`.
Unsupported kinds throw at runtime. Future protocols must add their own semantics;
passing a VLAN to the readiness helper does not create a per-VLAN STP election.

## Configuration and defaults

Optional serializable fields keep every existing scenario valid without migration:

- `DeviceState.stp`: `priority` (default 32768, 0..61440 in steps of 4096),
  `mac` (unique, nonzero unicast MAC, colon separated; case normalized).
  This uses the common priority granularity with a zero system-ID extension.
- `InterfaceState.stp`: `priority` (default 128, 0..240 in steps of 16),
  `number` (1..4095, optional explicit low 12 bits of Port ID),
  `pathCost` (default 19, integer 1..65535), `portfast` (optional metadata).
- Automatic port numbers use natural, locale-independent interface-name order,
  skipping reserved explicit numbers. Reordering objects never changes IDs.
  Adding/removing interface names can renumber automatic IDs; configure `number`
  if port identity must survive hardware inventory edits.
- There is no speed metadata in `NetworkState`: 19 is an explicitly synthetic
  100-Mbit-style cost for **all** ports, not a claim that Gi links run at 100 Mbit.
  Set `pathCost` explicitly when modeling unequal media/costs.
- Legacy devices without MACs use a locally administered unicast address `02:...`
  from 40 bits of FNV-1a over UTF-8 **device dictionary key**. It is independent of
  insertion order, hostname, active console, topology and other devices.
  Hash collisions are possible; duplicate effective MACs throw and require explicit
  unique MACs instead of silently adding a nonstandard device-name tie breaker.
- Every physical `switchport` participates, even if mode is `unset`. Routed ports
  and SVIs are excluded. A device with L2 ports or explicit bridge config is a
  bridge; a routed-only legacy router is not. Bridge-profile modeling is deferred.
- Port enablement uses existing `adminUp` and a live cable with enabled peer.
  Disabling the STP protocol independently of the port is deliberately not modeled:
  its loop-prone forwarding behavior needs a separate explicit contract.
  `portfast` changes no stable-state election and never suppresses BPDUs here.

STP config is included in running/startup **model snapshots** by
`ConfigPersistence`; reload restores it and discards unsaved changes. Existing
port config persists via `InterfaceConfig`. No IOS configuration or `show` commands
are added, so existing textual IOS config output does not yet display STP fields.
No roles or physical runtime are persisted, and cable state is never restored
from startup-config.

## Election algorithm

1. Initialize each bridge as its own root with cost zero.
2. Synchronously relax BPDU priority vectors across live L2–L2 segments. Compare:
   root Bridge ID (priority then MAC), candidate total receive-port cost, sending
   Bridge ID, sending Port ID (priority then number), receiving Port ID.
3. Positive costs guarantee winning simple root paths; at most N−1 rounds propagate
   the best root/path across N bridges. This is a stable-state model, **not** a
   claim that real hardware converges in N−1 time steps.
4. On each segment compare root ID, advertised root cost, bridge ID, port ID.
   The winner is designated; the other end is root if selected as the root port,
   otherwise nondesignated/blocking. Root and designated ports forward.
5. Administratively/physically down ports have disabled role, blocking state,
   physicalUp=false and null designated IDs. An enabled switchport connected to a
   non-bridge endpoint is designated/forwarding and cannot elect that endpoint root.

Supported topology is existing point-to-point `NetworkLink`, including parallel
links on **distinct** ports. Missing endpoints, multiple cables on one port,
duplicate MACs/port numbers and invalid STP configuration throw explicitly.
Shared LAN/hub segments are not represented by `NetworkState`; do not emulate
one by attaching multiple cables to the same port. The final receiving-port tie
breaker is in the comparator, but identical sending-port advertisements to two
local ports require such a shared segment; it is not an end-to-end fixture in
this point-to-point model.

## Physical status, VLAN readiness and integration

`isStpForwarding(state, tree, device, port, vlan)` checks **local** link-up,
forwarding state, active VLAN and local access/trunk membership.
`isStpLinkForwarding(state, tree, link, vlan)` additionally requires compatible
switchport modes and readiness on **both** endpoints. Derive `tree` from the same
snapshot as `state`; callers must not reuse stale trees after a command or failure.
A blocked port can be physically up. An allowed-list mismatch can break VLAN
connectivity even if CST itself has a valid spanning tree. CST does not elect
another per-VLAN tree to compensate.

**Historical stage 2A boundary:** the original engine PR did not change reachability or autostate:
`VlanPath`, `SviIpv4Reachability`, `OperationalState` and their current scenario
results were unchanged in stage 2A. Stage 2B now makes ping consult CST forwarding.
The following integration is implemented by the separate stage 2B change, documented in
[STP_FORWARDING.md](STP_FORWARDING.md):

1. Derive once per current immutable snapshot; extract shared local VLAN-membership
   predicates from `SviIpv4Reachability` into a neutral module (the new readiness
   helper currently reuses its existing predicate; avoid a future circular import).
2. Make the common neighbor traversal used by **both** VlanPath and SVI reachability
   accept a link only through `isStpLinkForwarding`.
3. Make local SVI autostate require an `isStpForwarding` local member. It must not
   require remote VLAN membership or an end-to-end ping success.
4. Keep physical show/TopologyPanel status on the physical source of truth;
   display derived STP separately in a later UI/IOS task.
5. Add ring/VLAN-filter regression where the physical alternate is STP-blocked,
   preventing false connectivity via that link; retest all existing scenarios.

Do not apply a single ad hoc blocking check only to ping: that would again diverge
from L2-path checking and local autostate.

## Test matrix

Run `node scripts/cli-stp.test.mjs` (also registered in PR CI).

| Fixture | Assertions |
|---|---|
| 2 switches, single cable | elected MAC root, cost19, designated/root forwarding |
| 3-switch triangle | exact nondesignated port, designated bridge/port, one blocked segment |
| 4-switch ring | cost38, upstream Bridge ID tie, one blocked segment |
| Changed priority / MAC | root reelects and blocking placement changes |
| Changed receiving cost / asymmetric costs | lowest-cost root path replaces old root port |
| Parallel cables | sending port number/priority tie breaks; local priority cannot override sender |
| Cable down/up / port shutdown/up | recalculated forest and exact restoration on recovery |
| Partition / isolated node | independent component roots, no false root port |
| VLAN filters / access / role types | local vs link readiness, active VLAN, no per-VLAN election |
| Portfast | does not bypass loop blocking |
| Object/link order, hostname, console | identical serialized result, no input mutation |
| Save/reload / legacy snapshots | config persists, unsaved edits discarded, runtime recalculated |
| Invalid model/config | explicit errors without state mutation |
| 100 seeded weighted graphs, 2–8 switches | independent shortest-path oracle; N−1 live forwarding edges per component; connected, acyclic forest; one root port per nonroot |

Full verification results and any environment limits are recorded in the PR.

## Local verification (2026-11-13)

Node v24.22.1. All 20 existing `scripts/cli-*.test.mjs` files and the new STP file
passed. STP output: `35 test groups passed (including 100 seeded graph cases)`.
`npm run lint`, `npm run build` (including prebuild checks), and `npm run test:logic`
passed. The build retains the existing >500 kB chunk-size warning.

Five deliberate mutations were tested in external temporary copies: ignoring
bridge priority, receiving path cost, blocking, upstream port ID, or cable failure.
Every mutated implementation failed the regression suite with an assertion;
none of those mutations was applied to the branch.

No browser checks were run for this engine-only change; it does not change rendered
UI or register the new engine in the shell. PR CI uses Node22 and is reported
separately from these local checks. No exam/question-bank files were changed.

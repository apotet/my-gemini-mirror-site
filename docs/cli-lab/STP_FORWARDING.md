# Stage 2B: CST-aware L2 and SVI forwarding

## Dependency and review base

Main checked at `f0fe118598e2253380c3c5f23a25af56f35e6a61`.
This is a **stacked change on PR #118**, branch `feat/cli-stp-cst-engine`,
HEAD `3e9636ab17fff93644c093a8ff492b1b84ee3082`. PR #118 is still open.
The stage 2B PR targets that branch to show only the integration diff. Before
merging stage 2B into staging, independently accept/merge #118 and then retarget
this PR to `main` (rebase onto the accepted engine if #118 is squash-merged).
Do not merge this integration into the engine branch as a substitute for that gate.

PR #116 is open at `69d8046afd5db41604cbbff4a45bd6609ae8c244`. It is not a
dependency: its shell/TopologyPanel files are untouched. TopologyPanel uses
`interfaceStatus` for physical ports; the physical branch remains unchanged.
A green physical link therefore still means PHY up, not CST forwarding.
No UI consumes/stores an independent STP state.

## Source of truth and shared checks

`NetworkState` remains canonical. Each synchronous L2 or IPv4 query constructs
`deriveVlanForwarding(state)`, deriving one CST tree for that query. The projection
is never cached or persisted; after a cable/configuration change the next query
recalculates it, including when the same state object was edited in place.
Do not retain a projection after mutating its input snapshot.

- `VlanMembership.ts`: extracted existing local VLAN membership predicate; no STP,
  no SVI dependency, no change to VLAN semantics.
- `SpanningTree.ts`: reuses that neutral predicate instead of importing SVI code;
  the stage 2A election algorithm is unchanged.
- `VlanForwarding.ts`: shared CST/VLAN readiness and neighbor projection.
- `VlanPath.ts` and `SviIpv4Reachability.ts`: traverse only links with **both**
  ends physically up, CST forwarding and VLAN/mode compatible.
- Local SVI autostate requires at least one physically up **local** CST-forwarding
  VLAN member. It still does not require the peer to carry the VLAN, a remote
  destination or a successful end-to-end ping.
- `OperationalState.ts` uses that shared local predicate for SVI. The PHY branch
  continues to depend only on link/admin/peer, not STP.
- Original exported membership/neighbor/autostate functions remain available from
  the SVI module for compatibility. Their implementation now lives below that layer,
  avoiding circular imports.

A CST-blocked port with a live cable remains physical up and cannot carry data.
Filtering VLAN10 on the forwarding branch cannot invent a VLAN-specific alternative
via a blocked branch. The same check is used for L2 goals, remote/local/conflict
IPv4 classification, SVI status and model ping.

## Preserved scope and deliberate limits

Legacy L2 goals model uncabled access ports as logical client attachment points:
PCs/cables for those clients do not exist in NetworkState. Their access/admin/VLAN
configuration is still checked, without claiming confirmed client PHY or packets.
If such an access endpoint **is explicitly cabled**, its physical/CST readiness is
required, so a blocked/down ingress cannot pass the goal via another uplink.

One steady-state CST, not per-VLAN trees. No CLI STP commands, new scenarios,
BPDU animation, convergence timers, RSTP/PVST+/MSTP, packet/ARP simulation or routing.
The inherited engine requires valid point-to-point topology and valid STP values;
ambiguous/malformed models fail explicitly, not by silently bypassing blocking.
STP parameters are presently changed through model configuration, not IOS syntax.

The existing `show interfaces trunk` remains a configured/physical-status table;
its footer now explicitly says it does not display STP forwarding/blocking.
No STP commands or columns are added. The two-switch SVI description/success text
was updated to remove the now-false claim that autostate ignores STP; its setup,
goals, steps and completion predicates are unchanged.

## Integration test matrix

Run `node scripts/cli-stp-forwarding.test.mjs` (registered in CI).

| Case | Expected observation |
|---|---|
| Four-switch ring, A root by election | C–D has computed blocking at C; A–C remains reachable via B |
| Filter VLAN10 on B–C, all PHY up | A–C L2 and ping fail; blocked C–D cannot be a fallback |
| Break B–C cable | CST opens C–D, both L2/ping recover |
| Restore B–C | C–D blocks again, VLAN10 filter again breaks both checks |
| shutdown/no shutdown on either B–C end | Same transitions through real LabEngine IOS handlers |
| D bridge priority/MAC change | Reelect root and open the required C–D path |
| C receiving-port cost change | New root port changes actual L2 and IPv4 availability |
| C only has VLAN10 on blocked member | SVI down and local ping unreachable while member PHY stays up |
| show interfaces / brief / trunk | SVI down agrees across views; PHY up/trunking remains distinct |
| Two failed cables and recovery | Independent component roots; no false connectivity; automatic reconvergence |
| VLAN20 vs filtered VLAN10 | Common CST, VLAN-specific readiness, no PVST shortcut |
| Duplicate IP beyond blocked path | No phantom conflict; conflict appears once owner becomes reachable |
| Access–access ring and cabled goal ingress | STP applies to access transit too; blocked ingress fails |
| Save/reload | Restores STP configuration, recalculates availability, leaves cable failure intact |
| Read-only checks / insertion reorder | State unchanged, answers deterministic |

Tests assert public L2/IPv4/goal/CLI results, not merely internal port labels. In
particular, a broken implementation that ignores blocking on transit or local
SVI members must fail these tests even though the physical ring stays connected.

## Actual verification (2026-11-13)

Local Node v24.22.1, using the installed repository dependencies:

- All **22** CLI test files passed: 20 pre-existing, stage 2A STP (35 groups,
  including 100 seeded graphs), stage 2B integration (16 groups).
- `npm run lint`, `npm run build` with all prebuild checks, and `npm run test:logic`
  passed. Build retains the existing chunk-size warning; no exam files changed.
- An isolated worktree with #118 + this change + the exact #116 patch applied
  without conflicts also passed all 22 CLI tests, TypeScript and build.
  This was a local validation overlay, not a GitHub merge or a dependency on #116.
- Chromium smoke checks of that combined overlay at 1440×900 and 375×812 passed:
  two-switch SVI scenario, topology console selection, link red/green transitions
  after shutdown/no shutdown, working model ping, no page errors. Four-switch
  ring behavior is covered by integration tests, not by a new UI scenario.
- Four deliberately broken implementations in external copies failed assertions:
  transit ignoring STP, autostate ignoring STP, cabled ingress ignoring STP and
  reuse of a stale tree. No mutations were applied to this branch.

CI additionally runs the new integration suite. Its PR branch filter includes
`feat/cli-stp-cst-engine` so the stacked PR is checked before retargeting to main;
production deployment configuration is unchanged.

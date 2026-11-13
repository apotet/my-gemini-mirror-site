# Modeled PC ping in CLI Lab 2.0

Base: staging main `21df9ece22a6bd0febf7b1cd094d7f1911258b9a`.
PR #144 is merged at that main and adds the current connected PC endpoints.
Reviewed HostIpv4Reachability, CliLabShell's endpoint attachment/selection/grading,
LabEngine's vendor-guarded console selection, VlanPath/VlanForwarding, and both
existing topology panels before implementing this change.

## User flow

Expand the topology, select a PC and use **Ping из <PC>** in its inspector:

```text
ping 192.168.10.12
```

Enter or the submit button runs the diagnostic from the **selected PC**, not the
active Cisco switch. The shared HostPingPanel is mounted in both ExperimentalTopology
(the current default) and the fallback TopologyPanel. Switching PC IDs resets its
input and last result. No autofocus, automatic probing or timed UI effects are added.

The panel labels results as the last run and asks the learner to repeat ping after
network edits. Each submit reads the latest NetworkState prop; no topology/path
cache or second network state is created. Old output is diagnostic history, not a
live green completion status.

## Model and isolation

`hostPing.ts` is a read-only UI adapter to existing
`checkHostIpv4Reachability(state, sourceId, targetId)` → VlanPath → CST/VLAN forwarding.
It does not contain another L2/STP algorithm. The IP-to-host lookup accepts only an
unambiguous existing linux-host address. It uses existing pure IPv4 validators to
check source/target unicast addresses and consistent prefix/mask before querying
the host path; malformed model input fails closed.

Success requires the existing model's active host NIC and cable, compatible
access VLANs, active VLAN, trunk membership/allowed lists, enabled ports, physical
links, CST forwarding and mutually on-link IPv4 subnets. No gateway or SVI target
is substituted for a missing PC destination. A blocked redundant link cannot
bypass a filtered forwarding path; after failure/recovery or CLI cost edits the
next probe uses the recalculated tree.

The adapter never exposes HostPathResult.detail, VLAN IDs, root/port diagnostics,
configuration hints or caught exceptions. For a given target all connectivity
failures produce the same four `Request timed out.` lines. Unknown IP, other VLAN,
IP/mask fault, administrative/physical failure and unavailable CST path do not
reveal different reasons through ping. Syntax errors explain only supported input.
Existing topology status annotations are unchanged.

No host is admitted to the Cisco command engine: LabEngine.selectDevice keeps its
vendor guard, and CliLabShell's grading/steps/completion pipeline is untouched.
The panel has no engine.execute/selectDevice/evaluateGoals callback. Cisco console
mode, history, commands, goals, scenario steps and scoring remain unchanged.
HostIpv4Reachability and all scenario/goal code are unchanged too.

## Honest output

```text
Учебная модель ПК → ПК. Настоящие ICMP-пакеты не отправляются.
PING 192.168.10.12 · 4 учебные пробы
Ответ от 192.168.10.12: учебный ответ 1/4.
Ответ от 192.168.10.12: учебный ответ 2/4.
Ответ от 192.168.10.12: учебный ответ 3/4.
Ответ от 192.168.10.12: учебный ответ 4/4.
Проб: 4; ответов: 4; timeout: 0.
```

Failure uses the same header and target, four `Request timed out.` lines, then
`Проб: 4; ответов: 0; timeout: 4.` There is no invented TTL, RTT, packet byte count
or real waiting period. These are immediate model queries, not ICMP exchanges.

## Deliberate scope

- Only `ping <IPv4>` between distinct existing PCs; no OS shell, Cisco commands,
  options, DNS, own-IP/loopback probes, SVI ping or inter-VLAN routing.
- One active configured IPv4 NIC, as in the existing host model. No PC address
  configuration is added. Invalid/ambiguous input cannot create a fake reply.
- Duplicate destination addresses anywhere among modeled PCs conservatively time
  out; there is no ARP ownership resolution across separate broadcast domains.
- No ARP, FDB, packet/latency simulation or outside network requests.
- No changes to quiz/question bank, scenario content or scoring.

## Actual verification

Local Node v24.22.1:

- **33 CLI test files**, TypeScript (`npm run lint`) and production build with
  prebuild checks: PASS. Existing chunk-size warning remains.
- `npm run test:logic`: PASS; no quiz edits.
- New `scripts/cli-host-ping.test.mjs`: **13 groups PASS**. Two/three/four switches,
  same/cross VLAN, same-switch PCs, positive/negative IP/mask cases, access/trunk
  faults, STP-blocked backup, actual Cisco CLI repairs/cost edits, NIC/cable failure,
  ring partition/recovery, current-state repeat probes, ambiguity, strict syntax,
  uniform non-spoiling timeout and unchanged engine/goal snapshots.
- Four external mutations (always reply, reveal VLAN failure, ignore mask/prefix,
  reuse stale state) fail assertions. None applied to the branch.
- Chromium default panel desktop1440×900/mobile375×812: diagnostic three-switch
  fault → timeout; actual CLI VLAN repair → four replies; shutdown/no shutdown →
  timeout/replies without replacing the selected-PC form. Source selection resets
  input/result; unsupported commands reject; console/history/goals unchanged by
  both failed and successful probes; no page errors or form overflow.
- React review: one shared component, hooks at top level, stable source key, real
  label/input association, submit semantics, polite result announcement, no state
  mutation/effect-driven probing/dependencies or new packages.
- `git diff --check`: PASS.

The legacy `cli-experimental-topology.test.mjs` hardcodes
`resolveDir: '/tmp/cli-topology-redesign'`; for the full local run a temporary
symlink at that path pointed to this exact worktree. No source was changed to
work around the test path, and no stale external checkout was tested.

The new pure adapter test is registered in GitHub CI. CI results are reported on
the PR for its exact SHA. Desktop/mobile checks exercised the default inspector;
the fallback uses the identical component and passes type/build/regression checks.
No merge, production modification or deployment is part of this change.

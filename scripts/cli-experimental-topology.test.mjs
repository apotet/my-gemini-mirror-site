#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const built = await build({
  stdin: {
    contents: `
      export { computeTopologyLayout, placePortLabels, computeGraphBounds, classifyDevice } from './src/cli-lab/components/topologyLayout';
      export { deriveSpanningTree } from './src/cli-lab/engine/SpanningTree';
            export { ciscoTwoSwitchVlanScenario } from './src/cli-lab/scenarios/cisco-two-switch-vlan';
      export { ciscoTwoSwitchSviScenario } from './src/cli-lab/scenarios/cisco-two-switch-svi';
      export { ciscoThreeSwitchMissingVlanScenario } from './src/cli-lab/scenarios/cisco-three-switch-missing-vlan';
      export { ciscoTwoSwitchTrunkDiagnosticScenario } from './src/cli-lab/scenarios/cisco-two-switch-trunk-diagnostics';
      export { ciscoFourSwitchHostRingScenario } from './src/cli-lab/scenarios/cisco-four-switch-host-ring';
    `,
    resolveDir: '/tmp/cli-topology-redesign',
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});

const mod = await import('data:text/javascript;base64,' + Buffer.from(built.outputFiles[0].contents).toString('base64'));

function overlaps(a, b, pad = 2) {
  return a.x1 > b.x0 - pad && a.x0 < b.x1 + pad && a.y1 > b.y0 - pad && a.y0 < b.y1 + pad;
}

function pointInRect(px, py, r) {
  return px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1;
}

function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const ccw = (p1x, p1y, p2x, p2y, p3x, p3y) =>
    (p3y - p1y) * (p2x - p1x) > (p2y - p1y) * (p3x - p1x);
  return ccw(ax, ay, cx, cy, dx, dy) !== ccw(bx, by, cx, cy, dx, dy) &&
    ccw(ax, ay, bx, by, cx, cy) !== ccw(ax, ay, bx, by, dx, dy);
}

function rectIntersectsSegment(r, x1, y1, x2, y2) {
  if (pointInRect(x1, y1, r) || pointInRect(x2, y2, r)) return true;
  if (Math.max(x1, x2) < r.x0 || Math.min(x1, x2) > r.x1 || Math.max(y1, y2) < r.y0 || Math.min(y1, y2) > r.y1) return false;
  return (
    segmentsIntersect(x1, y1, x2, y2, r.x0, r.y0, r.x1, r.y0) ||
    segmentsIntersect(x1, y1, x2, y2, r.x1, r.y0, r.x1, r.y1) ||
    segmentsIntersect(x1, y1, x2, y2, r.x1, r.y1, r.x0, r.y1) ||
    segmentsIntersect(x1, y1, x2, y2, r.x0, r.y1, r.x0, r.y0)
  );
}

const scenarios = [
  ['two-switch-vlan10', mod.ciscoTwoSwitchVlanScenario.initialState],
  ['two-switch-svi', mod.ciscoTwoSwitchSviScenario.initialState],
  ['three-switch-missing-vlan', mod.ciscoThreeSwitchMissingVlanScenario.initialState],
  ['two-switch-partial-loss', mod.ciscoTwoSwitchTrunkDiagnosticScenario.initialState],
  ['four-switch-host-ring', mod.ciscoFourSwitchHostRingScenario.initialState],
];

// Add a synthetic custom-ID 4-switch + router topology to guarantee non-hardcoded layout
const mkSw = (id, hostname) => ({
  id, hostname, vendor: 'cisco-ios', privilege: 15, modeCtx: { mode: 'priv' },
  vlans: { 1: { id: 1, name: 'default', active: true } }, routes: [],
  interfaces: {
    'GigabitEthernet0/1': { name: 'GigabitEthernet0/1', adminUp: true, operUp: true, switchport: { mode: 'trunk', allowedVlans: [1] } },
    'GigabitEthernet0/2': { name: 'GigabitEthernet0/2', adminUp: true, operUp: true, switchport: { mode: 'trunk', allowedVlans: [1] } },
    'GigabitEthernet0/3': { name: 'GigabitEthernet0/3', adminUp: true, operUp: true, switchport: { mode: 'trunk', allowedVlans: [1] } },
    'FastEthernet0/1': { name: 'FastEthernet0/1', adminUp: true, operUp: true, switchport: { mode: 'access', accessVlan: 10 } },
  },
});
const syntheticRing = {
  activeDeviceId: 'coreA',
  devices: {
    coreA: mkSw('coreA', 'Core-A'),
    coreB: mkSw('coreB', 'Core-B'),
    dist1: mkSw('dist1', 'Dist-1'),
    dist2: mkSw('dist2', 'Dist-2'),
    gwRtr: {
      id: 'gwRtr', hostname: 'R1-Edge', vendor: 'cisco-ios', privilege: 15, modeCtx: { mode: 'priv' }, vlans: {}, routes: [],
      interfaces: { 'GigabitEthernet0/0': { name: 'GigabitEthernet0/0', adminUp: true, operUp: true, ipv4: { address: '10.0.0.1', mask: '255.255.255.0', prefix: 24 } } },
    },
    srv01: {
      id: 'srv01', hostname: 'AppSrv-1', vendor: 'linux-host', privilege: 1, modeCtx: { mode: 'exec' }, vlans: {}, routes: [],
      interfaces: { Ethernet0: { name: 'Ethernet0', adminUp: true, operUp: true, ipv4: { address: '10.0.10.50', mask: '255.255.255.0', prefix: 24 } } },
    },
  },
  links: [
    { a: 'coreA', aIf: 'GigabitEthernet0/1', b: 'coreB', bIf: 'GigabitEthernet0/1', up: true },
    { a: 'coreB', aIf: 'GigabitEthernet0/2', b: 'dist2', bIf: 'GigabitEthernet0/1', up: true },
    { a: 'dist2', aIf: 'GigabitEthernet0/2', b: 'dist1', bIf: 'GigabitEthernet0/2', up: true },
    { a: 'dist1', aIf: 'GigabitEthernet0/1', b: 'coreA', bIf: 'GigabitEthernet0/2', up: true },
    { a: 'coreA', aIf: 'GigabitEthernet0/3', b: 'gwRtr', bIf: 'GigabitEthernet0/0', up: true },
    { a: 'dist1', aIf: 'FastEthernet0/1', b: 'srv01', bIf: 'Ethernet0', up: true },
  ],
};
scenarios.push(['synthetic-custom-ids', syntheticRing]);

const layers = ['phy', 'vlan', 'stp', 'ip'];
let totalLabelsChecked = 0;

for (const [name, state] of scenarios) {
  const snapshotBefore = JSON.stringify(state);
  const tree = mod.deriveSpanningTree(state, { kind: 'cst' });

  for (const layer of layers) {
    const graph = mod.computeTopologyLayout(state, layer === 'ip');
    assert.equal(graph.nodes.length, Object.keys(state.devices).length, `${name}: wrong device count`);
    assert.equal(graph.links.length, state.links.length, `${name}: wrong link count`);

    // Build realistic max-length label specs matching ExperimentalTopology
    const specs = {};
    for (const link of graph.links) {
      const aDev = state.devices[link.a.deviceId];
      const bDev = state.devices[link.b.deviceId];
      const aIf = aDev?.interfaces[link.a.ifaceName];
      const bIf = bDev?.interfaces[link.b.ifaceName];
      const aStp = tree.bridges[link.a.deviceId]?.ports[link.a.ifaceName];
      const bStp = tree.bridges[link.b.deviceId]?.ports[link.b.ifaceName];
      const fmt = (shortName, devKind, iface, stpPort) => {
        if (devKind === 'host') return shortName;
        if (!iface?.adminUp) return `${shortName} SHUT`;
        if (layer === 'vlan' && iface?.switchport) {
          return iface.switchport.mode === 'trunk' ? `${shortName} TRK` : `${shortName} A:${iface.switchport.accessVlan ?? 1}`;
        }
        if (layer === 'stp' && stpPort) {
          const role = stpPort.portRole === 'root' ? 'RP' : stpPort.portRole === 'designated' ? 'DP' : 'ND';
          return stpPort.portState === 'blocking' ? `${shortName} ${role} ⊘` : `${shortName} ${role}`;
        }
        return shortName;
      };
      specs[link.a.key] = { text: fmt(link.a.shortName, graph.nodeMap[link.a.deviceId].kind, aIf, aStp) };
      specs[link.b.key] = { text: fmt(link.b.shortName, graph.nodeMap[link.b.deviceId].kind, bIf, bStp) };
    }

    const labels = mod.placePortLabels(graph, specs);
    const bounds = mod.computeGraphBounds(graph, labels);
    assert.equal(labels.length, graph.links.length * 2, `${name}/${layer}: missing port labels`);

    const nodeRects = graph.nodes.map(n => ({
      id: n.id,
      x0: n.x - n.width / 2,
      y0: n.y - n.height / 2,
      x1: n.x + n.width / 2,
      y1: n.y + n.height / 2,
    }));

    // Node-to-node must never overlap
    for (let i = 0; i < nodeRects.length; i++) {
      for (let j = i + 1; j < nodeRects.length; j++) {
        assert.ok(!overlaps(nodeRects[i], nodeRects[j], 8), `${name}: nodes ${nodeRects[i].id} & ${nodeRects[j].id} overlap`);
      }
    }

    const allSegments = graph.links.flatMap(l => l.segments);
    const labelRects = labels.map(l => ({
      key: l.key,
      x0: l.x - l.width / 2,
      y0: l.y - l.height / 2,
      x1: l.x + l.width / 2,
      y1: l.y + l.height / 2,
      socketX: l.socketX,
      socketY: l.socketY,
      cx: l.x,
      cy: l.y,
    }));

    for (const lr of labelRects) {
      totalLabelsChecked += 1;
      assert.ok(lr.x0 >= bounds.minX && lr.x1 <= bounds.maxX && lr.y0 >= bounds.minY && lr.y1 <= bounds.maxY, `${name}/${layer} ${lr.key} outside bounds`);
      const dist = Math.hypot(lr.cx - lr.socketX, lr.cy - lr.socketY);
      assert.ok(dist <= 95, `${name}/${layer} ${lr.key} drifted too far (${dist.toFixed(1)}px) from socket`);
      for (const nr of nodeRects) {
        assert.ok(!overlaps(lr, nr, 1), `${name}/${layer} ${lr.key} overlaps device ${nr.id}`);
      }
      for (const seg of allSegments) {
        assert.ok(!rectIntersectsSegment(lr, seg.x1, seg.y1, seg.x2, seg.y2), `${name}/${layer} ${lr.key} overlaps cable segment`);
      }
    }

    for (let i = 0; i < labelRects.length; i++) {
      for (let j = i + 1; j < labelRects.length; j++) {
        assert.ok(!overlaps(labelRects[i], labelRects[j], 1), `${name}/${layer} ${labelRects[i].key} overlaps ${labelRects[j].key}`);
      }
    }
  }

  assert.equal(JSON.stringify(state), snapshotBefore, `${name}: layout mutated NetworkState`);
}

assert.equal(mod.classifyDevice(syntheticRing.devices.gwRtr), 'router');
assert.equal(mod.classifyDevice(syntheticRing.devices.coreA), 'switch');
assert.equal(mod.classifyDevice(syntheticRing.devices.srv01), 'host');

console.log(`PASS: checked ${totalLabelsChecked} placed port labels across ${scenarios.length} topologies × ${layers.length} layers with 0 collisions.`);

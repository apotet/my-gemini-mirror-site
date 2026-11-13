#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const built = await build({
  stdin: {
    contents: `export { defaultTopologyLayer, resolveTopologyLayer } from './src/cli-lab/topologyLayers';
export { ciscoIosModesScenario } from './src/cli-lab/scenarios/cisco-ios-modes';
export { ciscoShowDiagnosticScenario } from './src/cli-lab/scenarios/cisco-show-diagnostic';
export { ciscoVlanAccessScenario } from './src/cli-lab/scenarios/cisco-vlan-access';
export { ciscoAccessSviFollowupScenario } from './src/cli-lab/scenarios/cisco-access-svi-followup';
export { ciscoTrunkScenario } from './src/cli-lab/scenarios/cisco-trunk';
export { ciscoL3GatewayScenario } from './src/cli-lab/scenarios/cisco-l3-gateway';
export { ciscoTwoSwitchVlanScenario } from './src/cli-lab/scenarios/cisco-two-switch-vlan';
export { ciscoTwoSwitchSviScenario } from './src/cli-lab/scenarios/cisco-two-switch-svi';
export { ciscoThreeSwitchMissingVlanScenario } from './src/cli-lab/scenarios/cisco-three-switch-missing-vlan';
export { ciscoTwoSwitchTrunkDiagnosticScenario } from './src/cli-lab/scenarios/cisco-two-switch-trunk-diagnostics';
export { ciscoFourSwitchHostRingScenario } from './src/cli-lab/scenarios/cisco-four-switch-host-ring';`,
    resolveDir: process.cwd(), loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'esm', write: false,
});
const m=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].contents).toString('base64'));
const scenarios=[
  m.ciscoIosModesScenario, m.ciscoShowDiagnosticScenario, m.ciscoVlanAccessScenario,
  m.ciscoAccessSviFollowupScenario, m.ciscoTrunkScenario, m.ciscoL3GatewayScenario,
  m.ciscoTwoSwitchVlanScenario, m.ciscoTwoSwitchSviScenario,
  m.ciscoThreeSwitchMissingVlanScenario, m.ciscoTwoSwitchTrunkDiagnosticScenario,
  m.ciscoFourSwitchHostRingScenario,
];
assert.equal(scenarios.length, 11);
for(const scenario of scenarios){
  const original=structuredClone(scenario);
  const actual=m.defaultTopologyLayer(scenario);
  assert.ok(['phy','vlan','stp','ip'].includes(actual),scenario.id);
  assert.equal(m.resolveTopologyLayer('auto',scenario),actual,scenario.id);
  for(const manual of ['phy','vlan','stp','ip']) assert.equal(m.resolveTopologyLayer(manual,scenario),manual,scenario.id);
  assert.deepEqual(scenario,original,'layer calculation must not mutate scenario state');
  console.log('PASS '+scenario.id+': '+actual);
}
assert.equal(m.defaultTopologyLayer({concepts:['stp','vlan']}),'stp');
assert.equal(m.defaultTopologyLayer({concepts:['ipv4','vlan']}),'ip');
assert.equal(m.defaultTopologyLayer({concepts:['vlan','trunk']}),'vlan');
assert.equal(m.defaultTopologyLayer({concepts:['cisco-ios-modes']}),'phy');
assert.equal(m.defaultTopologyLayer({concepts:['diagnostics']}),'phy');
console.log('PASS: deterministic non-spoiler topology mode selection and manual override');

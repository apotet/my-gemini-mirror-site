#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const compiled = await build({
  stdin: {
    contents: `export { getPortDetails } from './src/cli-lab/portDetails';
export { deriveSpanningTree } from './src/cli-lab/engine/SpanningTree';
export { ciscoTwoSwitchSviScenario } from './src/cli-lab/scenarios/cisco-two-switch-svi';
export { ciscoTwoSwitchVlanScenario } from './src/cli-lab/scenarios/cisco-two-switch-vlan';`,
    resolveDir: process.cwd(), loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'esm', write: false,
});
const m = await import('data:text/javascript;base64,'+
  Buffer.from(compiled.outputFiles[0].contents).toString('base64'));
const state = structuredClone(m.ciscoTwoSwitchSviScenario.initialState);
const before = structuredClone(state);
for (const link of state.links) for (const [id, port] of [[link.a,link.aIf],[link.b,link.bIf]]) {
  const details=m.getPortDetails(state,id,port);
  assert.ok(details, id+'/'+port);
  assert.equal(details.interfaceName,port);
  assert.equal(details.deviceId,id);
  assert.equal(details.linkPresent,true);
  assert.ok(details.peer,'peer must be shown');
  assert.equal(details.admin,state.devices[id].interfaces[port].adminUp?'up':'down');
  assert.equal(details.switchport?.mode,state.devices[id].interfaces[port].switchport?.mode);
  const expected=m.deriveSpanningTree(state).bridges[id]?.ports[port];
  if (expected) {
    assert.equal(details.stp?.role,expected.portRole);
    assert.equal(details.stp?.state,expected.portState);
    assert.equal(details.stp?.pathCost,expected.pathCost);
  }
}
for(const [id,device] of Object.entries(state.devices)){
  for(const iface of Object.values(device.interfaces)){
    if (!iface.ipv4) continue;
    const d=m.getPortDetails(state,id,iface.name);
    assert.equal(d.ipv4.address,iface.ipv4.address);
    assert.equal(d.ipv4.mask,iface.ipv4.mask);
    assert.equal(d.stp,undefined,'SVI/routed interface must not show STP port role');
  }
}
assert.equal(m.getPortDetails(state,'missing','Fa0/1'),null);
assert.equal(m.getPortDetails(state,state.activeDeviceId,'nonexistent'),null);
assert.deepEqual(state,before,'read-only details mutated NetworkState');
const changed=structuredClone(state);
const link=changed.links[0];
const down=m.getPortDetails(changed,link.a,link.aIf);
link.up=false;
const newState=m.getPortDetails(changed,link.a,link.aIf);
assert.notEqual(newState.physical,down.physical,'PHY must track current link changes');
assert.equal(newState.stp?.state,'blocking','down port does not forward');
console.log('PASS: port details reflect PHY, exact VLAN/IP, STP, live link updates and never mutate state.');

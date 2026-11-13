#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const built=await build({
  stdin:{contents:`
export { ciscoFourSwitchHostRingScenario } from './src/cli-lab/scenarios/cisco-four-switch-host-ring';
export { checkHostIpv4Reachability } from './src/cli-lab/engine/HostIpv4Reachability';
export { deriveSpanningTree } from './src/cli-lab/engine/SpanningTree';
export { evaluateGoals } from './src/cli-lab/engine/GoalEvaluator';
export { LabEngine } from './src/cli-lab/engine/LabEngine';
export { ciscoIosCommands } from './src/cli-lab/vendors/cisco-ios/commands';
export { ciscoIosProfile } from './src/cli-lab/vendors/cisco-ios/profile';
`,loader:'ts',resolveDir:process.cwd()},
  bundle:true,platform:'node',format:'esm',write:false
});
const m=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].contents).toString('base64'));
const scenario=m.ciscoFourSwitchHostRingScenario;
const state=structuredClone(scenario.initialState);
const switches=Object.values(state.devices).filter(x=>x.vendor==='cisco-ios');
const pcs=Object.values(state.devices).filter(x=>x.vendor==='linux-host');
assert.equal(switches.length,4);
assert.equal(pcs.length,8);
assert.equal(state.links.length,12);
for(const pc of pcs) assert.ok(pc.interfaces.Ethernet0.ipv4,'host should have actual IPv4 state');
for(const [a,b] of [['pc1v10','pc3v10'],['pc2v10','pc4v10'],['pc1v20','pc3v20'],['pc2v20','pc4v20']]){
  assert.equal(m.checkHostIpv4Reachability(state,a,b).reachable,true,a+' -> '+b);
}
assert.equal(m.checkHostIpv4Reachability(state,'pc1v10','pc3v20').reachable,false,'VLAN isolation');
assert.equal(m.deriveSpanningTree(state).bridges.sw1.rootDevice!==undefined,true);
const blocked=m.deriveSpanningTree(state);
assert.ok(Object.values(blocked.bridges).some(b=>Object.values(b.ports).some(p=>p.portRole==='nondesignated')),'physical ring must block redundant path');
assert.equal(m.evaluateGoals(state,scenario.goals).allPassed,false,'root priority/save not yet done');
const engine=new m.LabEngine(m.ciscoIosProfile,m.ciscoIosCommands,state);
assert.equal(engine.selectDevice('pc1v10'),false,'PC cannot be treated as Cisco CLI');
assert.equal(engine.selectDevice('sw1'),true);
function execute(s){const r=engine.execute(s);assert.equal(r.error,undefined,s+': '+r.output);}
execute('enable');execute('configure terminal');
execute('spanning-tree vlan 1 priority 4096');execute('end');
assert.equal(m.evaluateGoals(engine.getState(),scenario.goals).allPassed,false,'unsaved root must not pass');
execute('copy running-config startup-config');
assert.equal(m.evaluateGoals(engine.getState(),scenario.goals).allPassed,true,'root priority, host paths and config saved');
assert.equal(m.deriveSpanningTree(engine.getState()).bridges.sw2.rootDevice,'sw1');

for(let i=0;i<4;i++){
  assert.equal(engine.setLinkState(i,false),true);
  assert.equal(m.checkHostIpv4Reachability(engine.getState(),'pc1v10','pc3v10').reachable,true,'VLAN10 reroutes after '+i);
  assert.equal(m.checkHostIpv4Reachability(engine.getState(),'pc1v20','pc3v20').reachable,true,'VLAN20 reroutes after '+i);
  assert.equal(engine.setLinkState(i,true),true);
}
assert.equal(engine.setLinkState(200,false),false);
assert.equal(engine.setLinkState(0,false),true);
assert.equal(engine.setLinkState(1,false),true);
assert.equal(m.checkHostIpv4Reachability(engine.getState(),'pc2v10','pc3v10').reachable,false,'two cuts isolate Switch2');
engine.setLinkState(0,true);engine.setLinkState(1,true);

const vlanFault=structuredClone(engine.getState());
vlanFault.devices.sw2.interfaces['FastEthernet0/1'].switchport.accessVlan=20;
assert.equal(m.checkHostIpv4Reachability(vlanFault,'pc1v10','pc2v10').reachable,false,'access VLAN mismatch isolates host');
const maskFault=structuredClone(engine.getState());
maskFault.devices.pc3v20.interfaces.Ethernet0.ipv4.prefix=30;
assert.equal(m.checkHostIpv4Reachability(maskFault,'pc1v20','pc3v20').reachable,false,'host mask mismatch');
const hostCut=structuredClone(engine.getState());
const hostLink=hostCut.links.find(l=>l.b==='pc3v10');
hostLink.up=false;
assert.equal(m.checkHostIpv4Reachability(hostCut,'pc1v10','pc3v10').reachable,false,'host cable down');
console.log('PASS 4 Cisco switches + 8 actual modeled PCs, vlan isolation, CST, live 1/2 failures, mask/access faults, CLI root and save.');

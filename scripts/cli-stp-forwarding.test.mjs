#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const compiled = await build({stdin:{contents:`
export {deriveSpanningTree} from './src/cli-lab/engine/SpanningTree';
export {deriveVlanForwarding} from './src/cli-lab/engine/VlanForwarding';
export {localSviPortUp,trunkNeighbors,checkSviIpv4Reachability} from './src/cli-lab/engine/SviIpv4Reachability';
export {checkVlanPath} from './src/cli-lab/engine/VlanPath';
export {interfaceStatus} from './src/cli-lab/engine/OperationalState';
export {evaluateGoals} from './src/cli-lab/engine/GoalEvaluator';
export {LabEngine} from './src/cli-lab/engine/LabEngine';
export {ciscoIosCommands} from './src/cli-lab/vendors/cisco-ios/commands';
export {ciscoIosProfile} from './src/cli-lab/vendors/cisco-ios/profile';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',write:false});
const {deriveSpanningTree,deriveVlanForwarding,localSviPortUp,trunkNeighbors,checkSviIpv4Reachability:ping,
  checkVlanPath,interfaceStatus,evaluateGoals,LabEngine,ciscoIosCommands,ciscoIosProfile}=
  await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].contents).toString('base64'));
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS '+name);};
const trunk=number=>({name:'FastEthernet0/'+number,adminUp:true,switchport:{mode:'trunk',trunkAllowed:[10,20]}});
function ring(){
  const devices=Object.fromEntries(['A','B','C','D'].map((id,i)=>[id,{
    id,hostname:id,vendor:'cisco-ios',privilege:15,modeCtx:{mode:'privileged'},
    stp:{mac:'02:00:00:00:00:0'+(i+1)},
    interfaces:{
      'FastEthernet0/1':{name:'FastEthernet0/1',adminUp:true,switchport:{mode:'access',accessVlan:10}},
      'FastEthernet0/21':trunk(21),'FastEthernet0/22':trunk(22),
      Vlan10:{name:'Vlan10',adminUp:true,ipv4:{address:'192.168.10.'+(i+1),prefix:24,mask:'255.255.255.0'}},
    },vlans:{10:{id:10,active:true},20:{id:20,active:true}},routes:[],
  }]));
  return {devices,activeDeviceId:'A',links:[
    {a:'A',aIf:'FastEthernet0/21',b:'B',bIf:'FastEthernet0/21',up:true},
    {a:'B',aIf:'FastEthernet0/22',b:'C',bIf:'FastEthernet0/21',up:true},
    {a:'C',aIf:'FastEthernet0/22',b:'D',bIf:'FastEthernet0/21',up:true},
    {a:'D',aIf:'FastEthernet0/22',b:'A',bIf:'FastEthernet0/22',up:true},
  ]};
}
const l2=s=>checkVlanPath(s,10,'A','FastEthernet0/1','C','FastEthernet0/1').reachable;
const reachable=(s,want)=>{assert.equal(l2(s),want,'L2 path');const r=ping(s,'A','192.168.10.3');assert.equal(r.reachable,want,'SVI reachability');assert.equal(r.kind,want?'remote':'unreachable');};
const blocked=s=>deriveSpanningTree(s).bridges.C.ports['FastEthernet0/22'];
const filter=s=>s.devices.B.interfaces['FastEthernet0/22'].switchport.trunkAllowed=[20];
const run=(e,line)=>{const r=e.execute(line);assert.equal(r.error,undefined,line+': '+r.output);return r.output;};
const goals=[{type:'l2.vlanReachable',vlanId:10,fromDevice:'A',fromIf:'FastEthernet0/1',toDevice:'C',toIf:'FastEthernet0/1'},
  {type:'ipv4.sviReachable',device:'A',destination:'192.168.10.3'}];

test('four-switch ring: one computed blocking end, full L2/SVI tree connectivity',()=>{
  const s=ring();reachable(s,true);assert.equal(blocked(s).portState,'blocking');assert.equal(blocked(s).physicalUp,true);
  assert.equal(interfaceStatus(s,s.devices.C,s.devices.C.interfaces['FastEthernet0/22']).operUp,true);
  assert.deepEqual(trunkNeighbors(s,'C',10),['B']);assert.deepEqual(trunkNeighbors(s,'D',10),['A']);
  assert.equal(evaluateGoals(s,goals).allPassed,true);
});
test('filtered main path cannot escape through physically up STP-blocked backup',()=>{
  const s=ring();filter(s);reachable(s,false);
  assert.equal(localSviPortUp(s,'C',10),true,'local autostate independent of peer allowed list');
  assert.equal(interfaceStatus(s,s.devices.C,s.devices.C.interfaces.Vlan10).operUp,true);
  assert.deepEqual(trunkNeighbors(s,'C',10),[]);assert.equal(evaluateGoals(s,goals).allPassed,false);
  for(const l of s.links){assert.equal(interfaceStatus(s,s.devices[l.a],s.devices[l.a].interfaces[l.aIf]).operUp,true);}
});
test('same state object: cable failure opens backup, restoration blocks it again',()=>{
  const s=ring();filter(s);reachable(s,false);s.links[1].up=false;reachable(s,true);
  assert.equal(blocked(s).portRole,'root');assert.equal(blocked(s).portState,'forwarding');
  s.links[1].up=true;reachable(s,false);assert.equal(blocked(s).portState,'blocking');
  s.devices.B.interfaces['FastEthernet0/22'].switchport.trunkAllowed=[10,20];reachable(s,true);
});
for(const peer of ['B','C'])test('CLI shutdown/no shutdown on '+peer+' reconverges both queries without stale cache',()=>{
  const s=ring();filter(s);const e=new LabEngine(ciscoIosProfile,ciscoIosCommands,s);e.selectDevice(peer);reachable(e.getState(),false);
  run(e,'conf t');run(e,'int '+(peer==='B'?'fa0/22':'fa0/21'));run(e,'shutdown');reachable(e.getState(),true);
  assert.equal(blocked(e.getState()).portState,'forwarding');run(e,'no shutdown');reachable(e.getState(),false);
  run(e,'end');assert.equal(e.checkGoals(goals).allPassed,false);
});
test('bridge priority edit opens needed backup and restoring priority restores blocking',()=>{
  const s=ring();filter(s);reachable(s,false);s.devices.D.stp.priority=0;reachable(s,true);
  assert.equal(deriveSpanningTree(s).bridges.C.rootDevice,'D');s.devices.D.stp.priority=32768;reachable(s,false);
});
test('receive cost edit changes root port and real forwarding path',()=>{
  const s=ring();filter(s);reachable(s,false);s.devices.C.interfaces['FastEthernet0/21'].stp={pathCost:100};reachable(s,true);
  assert.equal(blocked(s).portRole,'root');delete s.devices.C.interfaces['FastEthernet0/21'].stp;reachable(s,false);
});
test('MAC tie breaker edit recalculates path without console/scenario reset',()=>{
  const s=ring();filter(s);reachable(s,false);s.devices.D.stp.mac='02:00:00:00:00:00';reachable(s,true);
  assert.equal(deriveSpanningTree(s).bridges.A.rootDevice,'D');
});
test('only blocked VLAN member cannot raise SVI or confirm local ping',()=>{
  const s=ring();s.devices.C.interfaces['FastEthernet0/21'].switchport.trunkAllowed=[20];
  assert.equal(blocked(s).physicalUp,true);assert.equal(localSviPortUp(s,'C',10),false);
  assert.equal(interfaceStatus(s,s.devices.C,s.devices.C.interfaces.Vlan10).protocol,'down');
  assert.equal(ping(s,'C','192.168.10.3').kind,'unreachable');reachable(s,false);
  s.devices.C.interfaces['FastEthernet0/21'].stp={pathCost:100};assert.equal(localSviPortUp(s,'C',10),true);reachable(s,true);
});
test('show commands and model ping reflect autostate, while PHY/trunk remain physically up',()=>{
  const s=ring();s.devices.C.interfaces['FastEthernet0/21'].switchport.trunkAllowed=[20];
  const e=new LabEngine(ciscoIosProfile,ciscoIosCommands,s);e.selectDevice('C');
  assert.match(run(e,'show ip interface brief'),/Vlan10\s+192\.168\.10\.3\s+YES unset\s+down\s+down/);
  assert.match(run(e,'show interfaces Vlan10'),/Vlan10 is down, line protocol is down/);
  assert.match(run(e,'show interfaces fa0/22'),/FastEthernet0\/22 is up, line protocol is up/);
  assert.match(run(e,'show interfaces trunk'),/FastEthernet0\/22\s+on\s+802\.1q\s+trunking/);
  assert.match(run(e,'ping 192.168.10.3'),/UNREACHABLE/);
});
test('two cable failures partition both L2/SVI; recovery recomputes component roots',()=>{
  const s=ring();s.links[1].up=false;reachable(s,true);s.links[2].up=false;reachable(s,false);
  assert.equal(deriveSpanningTree(s).bridges.C.rootDevice,'C');assert.equal(localSviPortUp(s,'C',10),false);
  s.links[2].up=true;reachable(s,true);assert.equal(deriveSpanningTree(s).bridges.C.rootDevice,'A');
});
test('CST remains common: VLAN20 survives filtered VLAN10, no per-VLAN alternate tree',()=>{
  const s=ring();filter(s);reachable(s,false);const f=deriveVlanForwarding(s);
  assert.deepEqual(f.neighbors('C',20),['B']);assert.deepEqual(f.neighbors('C',10),[]);
  for(const id of ['A','C'])s.devices[id].interfaces['FastEthernet0/1'].switchport.accessVlan=20;
  assert.equal(checkVlanPath(s,20,'A','FastEthernet0/1','C','FastEthernet0/1').reachable,true);
});
test('duplicate owner beyond blocked path is not a phantom conflict, appears after reconvergence',()=>{
  const s=ring();filter(s);s.devices.C.interfaces.Vlan10.ipv4.address='192.168.10.1';
  assert.equal(ping(s,'A','192.168.10.1').kind,'local');s.links[1].up=false;
  assert.equal(ping(s,'A','192.168.10.1').kind,'conflict');
});
test('access-access transit obeys STP; explicitly cabled blocked goal ingress fails',()=>{
  const s=ring();for(const d of Object.values(s.devices))for(const n of [21,22])d.interfaces['FastEthernet0/'+n].switchport={mode:'access',accessVlan:10};
  reachable(s,true);assert.equal(checkVlanPath(s,10,'C','FastEthernet0/22','A','FastEthernet0/1').reachable,false);
  s.links[1].up=false;assert.equal(checkVlanPath(s,10,'C','FastEthernet0/22','A','FastEthernet0/1').reachable,true);
  s.links[2].up=false;assert.equal(checkVlanPath(s,10,'C','FastEthernet0/22','C','FastEthernet0/1').reachable,false);
});
test('save/reload recomputes forwarding, restores STP config, never cable runtime',()=>{
  const s=ring();filter(s);s.devices.D.stp.priority=0;const e=new LabEngine(ciscoIosProfile,ciscoIosCommands,s);e.selectDevice('D');
  run(e,'write memory');reachable(e.getState(),true);
  let next=structuredClone(e.getState());next.devices.D.stp.priority=32768;e.setState(next);reachable(e.getState(),false);
  run(e,'reload');reachable(e.getState(),true);
  next=structuredClone(e.getState());next.links[2].up=false;e.setState(next);reachable(e.getState(),false);
  run(e,'enable');run(e,'reload');reachable(e.getState(),false);assert.equal(e.getState().links[2].up,false);
});
test('read-only checks leave runtime/config untouched and insertion order cannot change answers',()=>{
  const s=ring();filter(s);const before=structuredClone(s);reachable(s,false);localSviPortUp(s,'C',10);trunkNeighbors(s,'C',10);evaluateGoals(s,goals);assert.deepEqual(s,before);
  s.devices=Object.fromEntries(Object.entries(s.devices).reverse());s.links.reverse();reachable(s,false);
});
console.log(`STP forwarding integration: ${count} test groups passed.`);

#!/usr/bin/env node
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const built=await build({stdin:{contents:`
export {runHostPing} from './src/cli-lab/hostPing';
export {ciscoFourSwitchHostRingScenario as scenario} from './src/cli-lab/scenarios/cisco-four-switch-host-ring';
export {LabEngine} from './src/cli-lab/engine/LabEngine';
export {ciscoIosProfile} from './src/cli-lab/vendors/cisco-ios/profile';
export {ciscoIosCommands} from './src/cli-lab/vendors/cisco-ios/commands';
export {evaluateGoals} from './src/cli-lab/engine/GoalEvaluator';
export {deriveSpanningTree} from './src/cli-lab/engine/SpanningTree';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',write:false});
const {runHostPing:probe,scenario,LabEngine,ciscoIosProfile,ciscoIosCommands,evaluateGoals,deriveSpanningTree}=
  await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].contents).toString('base64'));
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS '+name);};
const fixture=()=>{const s=structuredClone(scenario.initialState);for(let i=1;i<=4;i++)s.devices['sw'+i].stp.mac='02:00:00:00:00:0'+i;return s;};
const make=()=>new LabEngine(ciscoIosProfile,ciscoIosCommands,fixture());
const send=(e,line)=>{const r=e.execute(line);assert.equal(r.error,undefined,line+': '+r.output);return r.output;};
const cfg=(e,id,lines)=>{e.selectDevice(id);send(e,'enable');send(e,'conf t');for(const l of lines)send(e,l);send(e,'end');send(e,'disable');};
const target='192.168.10.13';
const ping=s=>probe(s,'pc1v10','ping '+target);
const expect=(s,status)=>{const r=ping(s);assert.equal(r.status,status);assert.match(r.output,/Настоящие ICMP-пакеты не отправляются/);
  assert.equal((r.output.match(/Request timed out\./g)||[]).length,status==='timeout'?4:0);
  assert.equal((r.output.match(/учебный ответ \d\/4/g)||[]).length,status==='reply'?4:0);return r.output;};

test('four-switch PCs: positive same VLAN, negative cross VLAN, strict output scope',()=>{
  const s=fixture();expect(s,'reply');assert.equal(probe(s,'pc1v10','ping 192.168.20.13').status,'timeout');
  assert.doesNotMatch(ping(s).output,/ttl=|time=|bytes=|RTT|VLAN|STP|Root|причин/i);
  assert.equal(probe(s,'pc1v10','  PING   '+target+'  ').status,'reply');
});
test('two-switch and triangle attachments use current forwarding graph',()=>{
  for(const n of [2,3]){
    const s=fixture(),keep=new Set(Array.from({length:n},(_,i)=>['sw'+(i+1),'pc'+(i+1)+'v10']).flat());
    s.devices=Object.fromEntries(Object.entries(s.devices).filter(([id])=>keep.has(id)));s.links=s.links.filter(l=>keep.has(l.a)&&keep.has(l.b));
    if(n===3)s.links.push({a:'sw3',aIf:'FastEthernet0/24',b:'sw1',bIf:'FastEthernet0/23',up:true});
    assert.equal(probe(s,'pc1v10','ping 192.168.10.1'+n).status,'reply');
    s.links.find(l=>l.b==='pc'+n+'v10').up=false;assert.equal(probe(s,'pc1v10','ping 192.168.10.1'+n).status,'timeout');
  }
});
test('STP-blocked backup never bypasses VLAN filtering; cable failure/recovery recalculates',()=>{
  const e=make();cfg(e,'sw2',['int fa0/24','sw tr al vl 20']);expect(e.getState(),'timeout');
  assert.equal(deriveSpanningTree(e.getState()).bridges.sw3.ports['FastEthernet0/24'].portState,'blocking');
  e.setLinkState(1,false);expect(e.getState(),'reply');e.setLinkState(1,true);expect(e.getState(),'timeout');
  cfg(e,'sw2',['int fa0/24','sw tr al vl 10,20']);expect(e.getState(),'reply');
});
test('real CLI cost and no cost change host ping immediately through CST',()=>{
  const e=make();cfg(e,'sw2',['int fa0/24','sw tr al vl 20']);expect(e.getState(),'timeout');
  cfg(e,'sw3',['int fa0/24','spanning-tree cost 10']);expect(e.getState(),'reply');
  cfg(e,'sw3',['int fa0/24','no spanning-tree cost']);expect(e.getState(),'timeout');
});
test('access VLAN and shutdown faults recover after actual CLI repair',()=>{
  const e=make();cfg(e,'sw3',['int fa0/1','sw acc vl 20']);expect(e.getState(),'timeout');
  cfg(e,'sw3',['int fa0/1','sw acc vl 10','shutdown']);expect(e.getState(),'timeout');
  cfg(e,'sw3',['int fa0/1','no shutdown']);expect(e.getState(),'reply');
});
test('host cable/NIC down, two ring cuts and restoration; same object never caches',()=>{
  const s=fixture();const cable=s.links.find(l=>l.b==='pc3v10');cable.up=false;expect(s,'timeout');cable.up=true;expect(s,'reply');
  s.devices.pc1v10.interfaces.Ethernet0.adminUp=false;expect(s,'timeout');s.devices.pc1v10.interfaces.Ethernet0.adminUp=true;expect(s,'reply');
  s.links[1].up=false;s.links[2].up=false;expect(s,'timeout');s.links[2].up=true;expect(s,'reply');
});
test('IP/subnet/mask validity is required; repair returns replies',()=>{
  const s=fixture(),ip=s.devices.pc3v10.interfaces.Ethernet0.ipv4,original=structuredClone(ip);
  for(const bad of [
    {address:'192.168.20.13'},{prefix:30,mask:'255.255.255.252'},
    {address:'192..10.13'},{address:'192.168.10.0'},{address:'192.168.10.255'},
    {prefix:24,mask:'255.255.0.0'},{prefix:NaN},{mask:'255.0.255.0'},
  ]){Object.assign(ip,original,bad);expect(s,'timeout');}
  Object.assign(ip,original);expect(s,'reply');
  s.devices.pc1v10.interfaces.Ethernet0.ipv4.address='invalid';expect(s,'timeout');
});
test('all network failures give identical timeout, never the model fault detail',()=>{
  const outputs=[];for(const fault of [
    s=>s.devices.pc3v10.interfaces.Ethernet0.adminUp=false,
    s=>s.devices.sw3.interfaces['FastEthernet0/1'].switchport.accessVlan=20,
    s=>s.devices.sw3.vlans[10].active=false,
    s=>s.links.find(l=>l.b==='pc3v10').up=false,
    s=>{s.links[1].up=false;s.links[2].up=false;},
    s=>delete s.devices.pc3v10,
  ]){const s=fixture();fault(s);outputs.push(expect(s,'timeout'));}
  assert.equal(new Set(outputs).size,1);assert.doesNotMatch(outputs[0],/VLAN|trunk|STP|mask|маск|shutdown|кабел|Root|ПК без IP/i);
});
test('unknown/SVI targets time out; duplicate target IP fails closed without explanation',()=>{
  const s=fixture();for(const ip of ['192.168.10.254','192.168.10.1'])assert.equal(probe(s,'pc1v10','ping '+ip).status,'timeout');
  s.devices.pc2v10.interfaces.Ethernet0.ipv4.address=target;expect(s,'timeout');
});
test('same-switch access PCs are supported without routing',()=>{
  const s=fixture();s.devices.sw1.interfaces['FastEthernet0/2'].switchport.accessVlan=10;
  s.devices.pc1v20.interfaces.Ethernet0.ipv4.address='192.168.10.99';
  assert.equal(probe(s,'pc1v10','ping 192.168.10.99').status,'reply');
});
test('only strict ping IPv4 syntax, no Cisco/OS commands or local-loopback claims',()=>{
  const s=fixture();for(const cmd of ['','ping','ping 1.2.3.999','ping 01.2.3.4','ping 1e1.2.3.4','ping 1.2.3.4 extra','ping -c 4 '+target,'show run','en','?','ping localhost','ping 192.168.10.11']){
    const before=structuredClone(s);assert.equal(probe(s,'pc1v10',cmd).status,'syntax',cmd);assert.deepEqual(s,before);
  }
  assert.equal(probe(s,'sw1','ping '+target).status,'syntax');assert.equal(probe(s,'missing','ping '+target).status,'syntax');
});
test('probes preserve Cisco console, commands, mode, state, startup and all goal results',()=>{
  const e=make();e.selectDevice('sw2');send(e,'en');send(e,'conf t');send(e,'int fa0/1');
  const s=e.getState(),before=structuredClone(s),goals=evaluateGoals(s,scenario.goals),prompt=e.getPrompt();
  assert.equal(e.selectDevice('pc1v10'),false);expect(s,'reply');probe(s,'pc1v10','ping 192.168.20.13');
  assert.deepEqual(e.getState(),before);assert.deepEqual(evaluateGoals(s,scenario.goals),goals);assert.equal(e.getPrompt(),prompt);
});
test('malformed STP model times out without exposing internal exceptions',()=>{
  const s=fixture();s.devices.sw2.stp.mac=s.devices.sw1.stp.mac;const output=expect(s,'timeout');assert.doesNotMatch(output,/Duplicate|derive|MAC|Error/);
});
console.log(`Modeled PC ping: ${count} test groups passed.`);

#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
const built=await build({stdin:{contents:`
export {LabEngine} from './src/cli-lab/engine/LabEngine';
export {ciscoIosCommands} from './src/cli-lab/vendors/cisco-ios/commands';
export {ciscoIosProfile} from './src/cli-lab/vendors/cisco-ios/profile';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',write:false});
const {LabEngine,ciscoIosCommands,ciscoIosProfile}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].contents).toString('base64'));
const golden=JSON.parse(readFileSync('scripts/fixtures/cli-spanning-tree.golden.json','utf8'));
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS '+name);};
function fixture(n,edges){
  const devices=Object.fromEntries(Array.from({length:n},(_,i)=>{const id=String.fromCharCode(65+i);return [id,{
    id,hostname:id,vendor:'cisco-ios',privilege:15,modeCtx:{mode:'privileged'},
    stp:{mac:'02:00:00:00:00:0'+(i+1)},interfaces:{},vlans:{10:{id:10,active:true}},routes:[],
  }];}));
  const links=edges.map(([a,b])=>{
    const aIf='FastEthernet0/'+(Object.keys(devices[a].interfaces).length+1),bIf='FastEthernet0/'+(Object.keys(devices[b].interfaces).length+1);
    for(const[id,p]of[[a,aIf],[b,bIf]])devices[id].interfaces[p]={name:p,adminUp:true,switchport:{mode:'trunk',trunkAllowed:[10]}};
    return {a,aIf,b,bIf,up:true};
  });return {devices,links,activeDeviceId:'A'};
}
const line=()=>fixture(2,[['A','B']]);
const triangle=()=>fixture(3,[['A','B'],['A','C'],['B','C']]);
const ring=()=>fixture(4,[['A','B'],['B','C'],['C','D'],['D','A']]);
const make=s=>new LabEngine(ciscoIosProfile,ciscoIosCommands,s);
const send=(e,line)=>{const r=e.execute(line);assert.equal(r.error,undefined,line+': '+r.output);return r.output;};
const consumed=new Set();
const expectGolden=(e,name,line='show spanning-tree')=>{assert.equal(send(e,line),golden[name],name);consumed.add(name);};
const set=(e,fn)=>{const s=structuredClone(e.getState());fn(s);e.setState(s);};

test('golden two-switch root and nonroot; console switch never reuses another bridge',()=>{
  const e=make(line());expectGolden(e,'two-root');expectGolden(e,'two-root-detail','show spanning-tree detail');e.selectDevice('B');expectGolden(e,'two-nonroot');e.selectDevice('A');expectGolden(e,'two-root');
});
test('golden triangle and ring: full labels, computed blocking, independent PHY',()=>{
  let e=make(triangle());e.selectDevice('C');expectGolden(e,'triangle-C');
  e=make(ring());e.selectDevice('C');expectGolden(e,'ring-C');
  assert.match(send(e,'show interfaces fa0/2'),/FastEthernet0\/2 is up, line protocol is up/);
  assert.match(send(e,'show spanning-tree'),/FastEthernet0\/2\s+Nondesignated\s+Blocking/);
});
test('golden physical cable failure/recovery recalculates root port without shutdown',()=>{
  const e=make(ring());e.selectDevice('C');set(e,s=>s.links[1].up=false);expectGolden(e,'failure-C');
  const detail=send(e,'show spanning-tree detail');assert.match(detail,/Interface: FastEthernet0\/1\n  Administrative: up\n  Physical link: down/);
  set(e,s=>s.links[1].up=true);expectGolden(e,'ring-C');
});
test('actual CLI shutdown/no shutdown, do show and preserved config context',()=>{
  const e=make(ring());e.selectDevice('C');send(e,'conf t');send(e,'int fa0/1');send(e,'shutdown');
  expectGolden(e,'failure-C','do sh sp');assert.equal(e.getState().devices.C.modeCtx.mode,'config-if');
  assert.match(send(e,'do sh sp d'),/Administrative: down\n  Physical link: down/);
  send(e,'no sh');expectGolden(e,'ring-C','do sh sp');
});
test('golden partition: C sees B root, D sees A root, both component roots are explicit',()=>{
  const e=make(ring());set(e,s=>{s.links[0].up=false;s.links[2].up=false;});e.selectDevice('C');expectGolden(e,'partition-C');
  e.selectDevice('B');assert.match(send(e,'show spanning-tree'),/This bridge is the root/);
  e.selectDevice('D');assert.match(send(e,'show spanning-tree'),/Root ID    Priority 32768\n           Address  02:00:00:00:00:01/);
  e.selectDevice('A');assert.match(send(e,'show spanning-tree'),/This bridge is the root/);
});
test('golden priority reelection and receive path-cost edit; no hardcoded root/port',()=>{
  const e=make(ring());e.selectDevice('C');set(e,s=>s.devices.D.stp.priority=0);expectGolden(e,'priority-C');
  e.selectDevice('D');assert.match(send(e,'show spanning-tree'),/This bridge is the root/);
  set(e,s=>{s.devices.D.stp.priority=32768;s.devices.C.interfaces['FastEthernet0/1'].stp={pathCost:100};});
  e.selectDevice('C');expectGolden(e,'cost-C');
});
test('golden parallel links and upstream port priority change',()=>{
  const e=make(fixture(2,[['A','B'],['A','B']]));e.selectDevice('B');expectGolden(e,'parallel-B');
  set(e,s=>s.devices.A.interfaces['FastEthernet0/2'].stp={priority:16});
  assert.match(send(e,'show spanning-tree'),/Root Port: FastEthernet0\/2 \(128\.2\)/);
  assert.match(send(e,'show spanning-tree detail'),/Designated Port: 16\.2/);
});
test('golden detail contains only actual model data, designated IDs and separate physical up',()=>{
  const e=make(triangle());e.selectDevice('C');expectGolden(e,'detail-C','show spanning-tree detail');
  const output=send(e,'show spanning-tree detail');
  assert.match(output,/Physical link: up\n  Role: Nondesignated\n  State: Blocking/);
  assert.doesNotMatch(output,/MaxAge|Max Age|Hello Time|Forward Delay|ForwardDelay|Topology Change Count|BPDU (?:sent|received)/i);
  set(e,s=>s.devices.C.interfaces['FastEthernet0/2'].stp={portfast:true});
  assert.match(send(e,'show spanning-tree detail'),/PortFast configured: yes/);
});
test('exec and privileged EXEC; all config modes require do and keep mode/privilege',()=>{
  const e=make(triangle());
  set(e,s=>{s.devices.A.modeCtx={mode:'exec'};s.devices.A.privilege=0;});assert.match(send(e,'sh sp d'),/Root ID/);
  send(e,'en');send(e,'conf t');
  for(const setup of [null,'int fa0/1','end']){
    if(setup==='end'){send(e,'end');send(e,'conf t');send(e,'vlan 10');}else if(setup)send(e,setup);
    const before=structuredClone(e.getState());assert.equal(e.execute('show spanning-tree').error,true);
    assert.match(send(e,'do sh sp d'),/CST - IEEE 802.1D/);assert.deepEqual(e.getState(),before);
  }
});
test('TAB and ? share canonical grammar with Enter; neither invokes handler',()=>{
  let calls=0;const specs=ciscoIosCommands.map(s=>s.id==='cisco.show_spanning_tree'?{...s,handler:(...args)=>{calls++;return s.handler(...args);}}:s);
  const e=new LabEngine(ciscoIosProfile,specs,line()),before=structuredClone(e.getState());
  assert.equal(e.complete('sh sp').completed,'sh spanning-tree ');
  assert.equal(e.complete('show spanning-tree d').completed,'show spanning-tree detail ');
  assert.equal(e.complete('show spanning-tree detail ').completed,undefined);
  const h=e.help('show spanning-tree ?');for(const w of ['detail','summary','vlan','<cr>'])assert.ok(h.includes(w));
  assert.match(e.help('show spanning-t?'),/spanning-tree/);assert.doesNotMatch(e.help('show spanning-tree?'),/<cr>/);
  assert.match(e.help('show spanning-tree detail ?'),/<cr>/);
  assert.doesNotMatch(e.help('show spanning-tree detail junk ?'),/<cr>/);
  assert.match(e.help('show spanning-tree vlan ?'),/<1-4094>/);assert.doesNotMatch(e.help('show spanning-tree vlan ?'),/<cr>/);
  assert.equal(calls,0);assert.deepEqual(e.getState(),before);
  expectGolden(e,'two-root','  SH   SP  ');assert.equal(calls,1);
});
test('real ambiguity among show s branches is reported by Enter, TAB and ?',()=>{
  const e=make(line());assert.match(e.execute('sh s').output,/% Ambiguous command/);
  assert.deepEqual(e.complete('sh s').candidates,['spanning-tree','startup-config']);
  assert.match(e.help('sh s ?'),/spanning-tree/);assert.match(e.help('sh s ?'),/startup-config/);
  expectGolden(e,'two-root','sh sp');
});
test('unsupported summary and per-VLAN STP give explicit errors, not PVST output',()=>{
  const e=make(line()),before=structuredClone(e.getState());
  for(const cmd of ['show spanning-tree summary','sh sp s','show spanning-tree vlan 10','sh sp v 4094']){
    const r=e.execute(cmd);assert.equal(r.error,true);assert.match(r.output,/Only one CST is modeled/);assert.match(r.output,/not implemented/);
    assert.doesNotMatch(r.output,/VLAN0010|Root ID|Rapid PVST|MST0/);
  }assert.deepEqual(e.getState(),before);
});
test('invalid suffixes, VLANs and excess arguments rejected consistently without mutation',()=>{
  const e=make(line()),before=structuredClone(e.getState());
  for(const cmd of ['show spanning-tree nonsense','show spanning-tree detail extra','show spanning-tree summary extra','show spanning-tree vlan 0','show spanning-tree vlan 4095','show spanning-tree vlan x','show spanning-tree vlan 10 extra']){
    assert.equal(e.execute(cmd).error,true,cmd);assert.doesNotMatch(e.help(cmd+' ?'),/<cr>/,cmd);assert.equal(e.complete(cmd+' x').completed,undefined);
  }
  assert.match(e.execute('show spanning-tree vlan').output,/% Incomplete command/);assert.deepEqual(e.getState(),before);
});
test('read-only diagnostics leave running/startup, CLI state and topology untouched',()=>{
  const e=make(ring()),before=structuredClone(e.getState()),run=send(e,'sh run'),start=send(e,'sh start');
  send(e,'show spanning-tree');send(e,'show spanning-tree detail');assert.deepEqual(e.getState(),before);
  assert.equal(send(e,'sh run'),run);assert.equal(send(e,'sh start'),start);send(e,'conf t');
  const config=structuredClone(e.getState());assert.equal(e.execute('spanning-tree priority 0').error,true);assert.deepEqual(e.getState(),config);
});
test('routed-only device does not invent a bridge; malformed model gives a diagnostic error',()=>{
  const s=line();delete s.devices.A.stp;delete s.devices.A.interfaces['FastEthernet0/1'].switchport;
  const e=make(s);assert.match(send(e,'show spanning-tree'),/No spanning-tree instance on this device/);
  const bad=make(line());set(bad,s=>s.devices.B.stp.mac=s.devices.A.stp.mac);const before=structuredClone(bad.getState());
  const r=bad.execute('show spanning-tree');assert.equal(r.error,true);assert.match(r.output,/% Cannot derive CST: Duplicate STP bridge MAC/);assert.deepEqual(bad.getState(),before);
});
test('save/reload and model edits are reflected immediately in diagnostics',()=>{
  const e=make(ring());e.selectDevice('D');send(e,'write mem');set(e,s=>s.devices.D.stp.priority=0);
  assert.match(send(e,'sh sp'),/This bridge is the root/);send(e,'reload');send(e,'en');assert.doesNotMatch(send(e,'sh sp'),/This bridge is the root/);
  set(e,s=>s.devices.D.stp.mac='02:00:00:00:00:00');assert.match(send(e,'sh sp'),/This bridge is the root/);
});
assert.deepEqual([...consumed].sort(),Object.keys(golden).sort(),'every golden fixture must actually be exercised');
console.log(`Cisco STP diagnostics: ${count} test groups passed; 11 exact golden outputs.`);

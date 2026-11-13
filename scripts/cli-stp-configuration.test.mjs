#!/usr/bin/env node
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const built=await build({stdin:{contents:`
export {LabEngine} from './src/cli-lab/engine/LabEngine';
export {ciscoIosCommands} from './src/cli-lab/vendors/cisco-ios/commands';
export {ciscoIosProfile} from './src/cli-lab/vendors/cisco-ios/profile';
export {deriveSpanningTree} from './src/cli-lab/engine/SpanningTree';
export {checkVlanPath} from './src/cli-lab/engine/VlanPath';
export {checkSviIpv4Reachability} from './src/cli-lab/engine/SviIpv4Reachability';
export {hasUnsavedChanges} from './src/cli-lab/engine/ConfigPersistence';
export {interfaceStatus} from './src/cli-lab/engine/OperationalState';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',write:false});
const {LabEngine,ciscoIosCommands,ciscoIosProfile,deriveSpanningTree:derive,checkVlanPath:l2,checkSviIpv4Reachability:ping,hasUnsavedChanges,interfaceStatus}=
  await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].contents).toString('base64'));
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS '+name);};
function fixture(n,edges){
  const devices=Object.fromEntries(Array.from({length:n},(_,i)=>{const id=String.fromCharCode(65+i);return [id,{
    id,hostname:id,vendor:'cisco-ios',privilege:15,modeCtx:{mode:'privileged'},stp:{mac:'02:00:00:00:00:0'+(i+1)},
    interfaces:{'FastEthernet0/1':{name:'FastEthernet0/1',adminUp:true,switchport:{mode:'access',accessVlan:10}},
      Vlan10:{name:'Vlan10',adminUp:true,ipv4:{address:'192.168.10.'+(i+1),prefix:24,mask:'255.255.255.0'}}},
    vlans:{10:{id:10,active:true},20:{id:20,active:true}},routes:[],
  }];}));
  const next=Object.fromEntries(Object.keys(devices).map(k=>[k,21]));
  const links=edges.map(([a,b])=>{
    const aIf='FastEthernet0/'+next[a]++,bIf='FastEthernet0/'+next[b]++;
    for(const[id,p]of[[a,aIf],[b,bIf]])devices[id].interfaces[p]={name:p,adminUp:true,switchport:{mode:'trunk',trunkAllowed:[10,20]}};
    return {a,aIf,b,bIf,up:true};
  });return {devices,links,activeDeviceId:'A'};
}
const ring=()=>fixture(4,[['A','B'],['B','C'],['C','D'],['D','A']]);
const make=s=>new LabEngine(ciscoIosProfile,ciscoIosCommands,s);
const send=(e,line)=>{const r=e.execute(line);assert.equal(r.error,undefined,line+': '+r.output);return r.output;};
const configure=(e,id,lines)=>{e.selectDevice(id);send(e,'conf t');for(const l of lines)send(e,l);send(e,'end');};
const root=e=>derive(e.getState()).bridges.A.rootDevice;
const ready=(e,want)=>{const s=e.getState();assert.equal(l2(s,10,'A','FastEthernet0/1','C','FastEthernet0/1').reachable,want);assert.equal(ping(s,'A','192.168.10.3').kind,want?'remote':'unreachable');};
const filtered=()=>{const e=make(ring());configure(e,'B',['int fa0/22','sw tr al vl 20']);return e;};
const failed=(e,line)=>{const before=structuredClone(e.getState());const r=e.execute(line);assert.equal(r.error,true,line);assert.deepEqual(e.getState(),before,line);return r.output;};

test('two and three switches: CLI bridge priority immediately reelects root, no restores defaults',()=>{
  for(const n of [2,3]){const e=make(fixture(n,n===2?[['A','B']]:[['A','B'],['A','C'],['B','C']]));
    e.selectDevice('B');send(e,'conf t');assert.match(send(e,'spanning-tree vlan 1 priority 4096'),/CST-only: VLAN 1 priority.*ALL VLANs, not PVST/);
    assert.equal(root(e),'B');assert.match(send(e,'do sh sp'),/This bridge is the root/);assert.equal(e.getState().devices.B.modeCtx.mode,'config');
    assert.match(send(e,'no spanning-tree vlan 1 priority'),/CST-only/);assert.equal(root(e),'A');assert.deepEqual(e.getState().devices.B.stp,{mac:'02:00:00:00:00:02'});
  }
});
test('four-switch ring: priority command moves Blocking and restores real L2/SVI path',()=>{
  const e=filtered();ready(e,false);const before=derive(e.getState());assert.equal(before.bridges.C.ports['FastEthernet0/22'].portState,'blocking');
  configure(e,'D',['sp v 1 pr 4096']);assert.equal(root(e),'D');ready(e,true);
  const after=derive(e.getState());assert.equal(after.bridges.C.ports['FastEthernet0/22'].portState,'forwarding');
  configure(e,'D',['no sp v 1 pr']);assert.equal(root(e),'A');ready(e,false);
});
test('four-switch ring: receive cost 10 changes root port, blocking and L2/SVI immediately',()=>{
  const e=filtered();ready(e,false);configure(e,'C',['int fa0/22','spanning-tree cost 10']);ready(e,true);
  const t=derive(e.getState());assert.equal(t.bridges.C.rootPort,'FastEthernet0/22');assert.equal(t.bridges.C.rootPathCost,29);
  assert.equal(t.bridges.C.ports['FastEthernet0/21'].portState,'blocking');
  e.selectDevice('C');assert.match(send(e,'sh sp'),/Root Path Cost: 29/);assert.match(send(e,'sh sp d'),/Physical link: up\n  Role: Nondesignated\n  State: Blocking/);
  assert.equal(interfaceStatus(e.getState(),e.getState().devices.C,e.getState().devices.C.interfaces['FastEthernet0/21']).operUp,true);
  configure(e,'C',['int fa0/22','no spanning-tree cost']);ready(e,false);assert.equal(derive(e.getState()).bridges.C.rootPort,'FastEthernet0/21');
});
test('port priority on parallel upstream links changes downstream root port; no resets it',()=>{
  const e=make(fixture(2,[['A','B'],['A','B']]));assert.equal(derive(e.getState()).bridges.B.rootPort,'FastEthernet0/21');
  configure(e,'A',['int fa0/22','spanning-tree port-priority 16']);assert.equal(derive(e.getState()).bridges.B.rootPort,'FastEthernet0/22');
  e.selectDevice('A');assert.match(send(e,'sh sp'),/FastEthernet0\/22\s+Designated\s+Forwarding\s+19\s+16\.3/);
  configure(e,'A',['int fa0/22','no spanning-tree port-priority']);assert.equal(derive(e.getState()).bridges.B.rootPort,'FastEthernet0/21');
});
test('configure an administratively down port; no shutdown applies its saved cost to forwarding',()=>{
  const e=filtered();configure(e,'C',['int fa0/22','shutdown','sp c 10']);ready(e,false);
  assert.equal(derive(e.getState()).bridges.C.ports['FastEthernet0/22'].physicalUp,false);
  configure(e,'C',['int fa0/22','no shutdown']);ready(e,true);
  assert.equal(derive(e.getState()).bridges.C.rootPathCost,29);
});
test('zero priorities survive formatting and persistence as real overrides',()=>{
  const e=make(ring());configure(e,'D',['sp v 1 pr 0','int fa0/21','sp p 0']);
  assert.match(send(e,'sh run'),/spanning-tree vlan 1 priority 0/);assert.match(send(e,'sh run'),/spanning-tree port-priority 0/);
  send(e,'write mem');configure(e,'D',['no sp v 1 pr','int fa0/21','no sp p']);send(e,'reload');send(e,'en');
  assert.equal(root(e),'D');assert.equal(e.getState().devices.D.stp.priority,0);assert.equal(e.getState().devices.D.interfaces['FastEthernet0/21'].stp.priority,0);
});
test('running/startup render all new settings and clearly label shared CST, not PVST',()=>{
  const e=make(ring());configure(e,'D',['sp v 1 pr 4096','int fa0/21','sp c 10','sp p 16']);
  const run=send(e,'show run');assert.match(run,/! CLI Lab: CST-only STP configuration applies to ALL VLANs; no PVST\./);
  assert.match(run,/spanning-tree vlan 1 priority 4096/);assert.match(run,/interface FastEthernet0\/21\n[^!]* spanning-tree cost 10\n spanning-tree port-priority 16/);
  assert.doesNotMatch(send(e,'sh start'),/spanning-tree (vlan|cost|port-priority)/);send(e,'write memory');
  assert.equal(send(e,'show startup-config').split('Using saved startup configuration:\n')[1],run.split('Current configuration:\n')[1]);
  assert.equal(hasUnsavedChanges(e.getState().devices.D),false);
});
test('write/reload restores set overrides, saved no forms, and leaves failed cables failed',()=>{
  const e=make(ring());configure(e,'D',['sp v 1 pr 4096','int fa0/21','sp c 10','sp p 16']);send(e,'write memory');
  configure(e,'D',['no sp v 1 pr','int fa0/21','no sp c','no sp p']);assert.equal(root(e),'A');
  assert.doesNotMatch(send(e,'show run'),/spanning-tree (vlan|cost|port-priority)/);assert.match(send(e,'show start'),/spanning-tree cost 10/);
  const s=structuredClone(e.getState());s.links[0].up=false;e.setState(s);send(e,'reload');send(e,'en');
  assert.equal(e.getState().links[0].up,false);assert.equal(root(e),'D');assert.equal(e.getState().devices.D.stp.priority,4096);
  assert.deepEqual(e.getState().devices.D.interfaces['FastEthernet0/21'].stp,{pathCost:10,priority:16});
  configure(e,'D',['no sp v 1 pr','int fa0/21','no sp c','no sp p']);send(e,'write memory');
  configure(e,'D',['sp v 1 pr 8192','int fa0/21','sp c 33','sp p 32']);send(e,'reload');send(e,'en');
  assert.equal(e.getState().devices.D.stp.priority,undefined);assert.equal(e.getState().devices.D.interfaces['FastEthernet0/21'].stp,undefined);
  assert.equal(hasUnsavedChanges(e.getState().devices.D),false);assert.doesNotMatch(send(e,'sh start'),/spanning-tree (vlan|cost|port-priority)/);
});
test('no deletes only its own override; preserves MAC, explicit port number and PortFast',()=>{
  const s=ring();s.devices.C.interfaces['FastEthernet0/22'].stp={number:300,portfast:true};const e=make(s);
  configure(e,'C',['sp v 1 pr 4096','int fa0/22','sp c 10','sp p 16','no sp c']);
  assert.deepEqual(e.getState().devices.C.interfaces['FastEthernet0/22'].stp,{number:300,portfast:true,priority:16});
  configure(e,'C',['no sp v 1 pr','int fa0/22','no sp p']);assert.deepEqual(e.getState().devices.C.interfaces['FastEthernet0/22'].stp,{number:300,portfast:true});
  assert.deepEqual(e.getState().devices.C.stp,{mac:'02:00:00:00:00:03'});assert.equal(hasUnsavedChanges(e.getState().devices.C),false);
});
test('idempotent no on legacy defaults introduces no empty config or dirty state',()=>{
  const s=ring();for(const d of Object.values(s.devices))delete d.stp;const e=make(s);
  configure(e,'A',['no sp v 1 pr','int fa0/21','no sp c','no sp p']);assert.equal(e.getState().devices.A.stp,undefined);
  assert.equal(e.getState().devices.A.interfaces['FastEthernet0/21'].stp,undefined);assert.equal(hasUnsavedChanges(e.getState().devices.A),false);
});
test('all legal bridge/port priorities and cost boundaries accepted',()=>{
  const e=make(ring());send(e,'conf t');for(let n=0;n<=61440;n+=4096)send(e,'sp v 1 pr '+n);
  send(e,'int fa0/21');for(let n=0;n<=240;n+=16)send(e,'sp p '+n);for(const n of [1,10,19,65535])send(e,'sp c '+n);
});
test('invalid bridge priorities, VLANs and invented global syntax cannot change CST',()=>{
  const e=make(ring());send(e,'conf t');const original=root(e);
  for(const n of ['-1','1','4097','65536','61441','1e4','0x1000','4096.0','+4096','04096']){
    const line='spanning-tree vlan 1 priority '+n;failed(e,line);assert.doesNotMatch(e.help(line+' ?'),/<cr>/);
  }
  for(const n of [2,10,20,4094]){assert.match(failed(e,'spanning-tree vlan '+n+' priority 4096'),/only VLAN 1.*CST/);assert.match(failed(e,'no spanning-tree vlan '+n+' priority'),/only VLAN 1.*CST/);}
  for(const line of ['spanning-tree vlan 10 priority','spanning-tree vlan 0 priority 4096','spanning-tree vlan 4095 priority 4096','spanning-tree vlan 1,10 priority 4096','spanning-tree priority 4096','no spanning-tree priority','spanning-tree cost 10','spanning-tree port-priority 16','spanning-tree vlan 1 priority 4096 extra','no spanning-tree vlan 1 priority 4096'])failed(e,line);
  assert.doesNotMatch(e.help('spanning-tree vlan 10 priority 4096 ?'),/<cr>/);
  assert.match(e.help('spanning-tree vlan 10 ?'),/only VLAN 1.*CST/);
  assert.equal(e.complete('spanning-tree vlan 10 pr').completed,undefined);
  assert.equal(root(e),original);assert.equal(e.getState().devices.A.stp.priority,undefined);
});
test('invalid port values, missing/excess args and unsupported per-VLAN port syntax rejected',()=>{
  const e=make(ring());send(e,'conf t');send(e,'int fa0/21');
  for(const [cmd,values]of [['cost',['0','65536','200000000','-1','10.5','1e1','0xa','010','+10']],['port-priority',['-16','1','15','17','241','256','1e1','16.0','016']]]){
    for(const n of values){const line='spanning-tree '+cmd+' '+n;failed(e,line);assert.doesNotMatch(e.help(line+' ?'),/<cr>/);}
  }
  for(const line of ['spanning-tree cost','spanning-tree port-priority','spanning-tree cost 10 extra','no spanning-tree cost 10','no spanning-tree port-priority 16','spanning-tree vlan 1 cost 10','spanning-tree vlan 1 port-priority 16','spanning-tree vlan 1 priority 4096','spanning-tree priority 4096'])failed(e,line);
});
test('device/type capability gate applies equally to Enter, TAB and help (SVI/routed/router)',()=>{
  const s=ring();s.devices.A.interfaces['GigabitEthernet0/0']={name:'GigabitEthernet0/0',adminUp:true};const e=make(s);send(e,'conf t');
  for(const name of ['Vlan10','Gi0/0']){send(e,'int '+name);for(const line of ['spanning-tree cost 10','spanning-tree port-priority 16','no spanning-tree cost','no spanning-tree port-priority']){
    failed(e,line);assert.doesNotMatch(e.help(line+' ?'),/<cr>/);
  }assert.deepEqual(e.complete('sp'),{candidates:[]});assert.doesNotMatch(e.help('sp?'),/spanning-tree/);send(e,'exit');}
  const router=fixture(1,[]);router.devices.A.interfaces={Gi0:{name:'Gi0',adminUp:true}};delete router.devices.A.stp;
  const r=make(router);send(r,'conf t');failed(r,'spanning-tree vlan 1 priority 4096');assert.doesNotMatch(r.help('sp?'),/spanning-tree/);
});
test('mode and privilege restrictions; no config commands through do',()=>{
  const e=make(ring());for(const line of ['spanning-tree vlan 1 priority 4096','spanning-tree cost 10','no spanning-tree cost'])failed(e,line);
  send(e,'conf t');send(e,'vlan 10');failed(e,'spanning-tree vlan 1 priority 4096');send(e,'exit');failed(e,'do spanning-tree vlan 1 priority 4096');
  const s=structuredClone(e.getState());s.devices.A.privilege=0;e.setState(s);failed(e,'spanning-tree vlan 1 priority 4096');assert.equal(e.complete('sp').completed,undefined);
});
test('TAB, ?, IOS abbreviations/case/spacing share grammar and never change state',()=>{
  const e=make(ring());send(e,'conf t');let before=structuredClone(e.getState());
  assert.equal(e.complete('sp').completed,'spanning-tree ');assert.equal(e.complete('spanning-tree v').completed,'spanning-tree vlan ');
  assert.equal(e.complete('sp v 1 pr').completed,'sp v 1 priority ');assert.match(e.help('sp v 1 pr ?'),/steps of 4096/);
  assert.match(e.help('sp v 1 pr 4096 ?'),/<cr>/);assert.doesNotMatch(e.help('sp v 1 pr 4097 ?'),/<cr>/);
  assert.match(e.help('spanning-t?'),/spanning-tree/);assert.deepEqual(e.getState(),before);
  assert.match(send(e,'  SP   V  1  PR  4096  '),/CST-only/);send(e,'int fa0/21');before=structuredClone(e.getState());
  assert.equal(e.complete('sp c').completed,'sp cost ');assert.equal(e.complete('sp p').completed,'sp port-priority ');
  assert.match(e.help('sp c ?'),/<1-65535>/);assert.match(e.help('sp p ?'),/steps of 16/);assert.match(e.help('no sp c ?'),/<cr>/);
  assert.equal(e.complete('sp cost ').completed,undefined);assert.deepEqual(e.getState(),before);
  send(e,'sp c 10');send(e,'sp p 16');assert.match(send(e,'do sh sp'),/Port ID/);assert.equal(e.getState().devices.A.modeCtx.mode,'config-if');send(e,'no sp c');send(e,'no sp p');
});
test('replay supported STP running-config lines recreates overrides, no hidden mutable state',()=>{
  const source=make(ring());configure(source,'D',['sp v 1 pr 4096','int fa0/21','sp c 10','sp p 16']);
  const text=send(source,'sh run'),target=make(ring());target.selectDevice('D');send(target,'conf t');
  for(const line of text.split('\n'))if(/^spanning-tree |^interface |^ spanning-tree /.test(line)){
    if(line.startsWith('interface ')&&target.getState().devices.D.modeCtx.mode==='config-if')send(target,'exit');send(target,line.trim());
  }
  assert.deepEqual(target.getState().devices.D.stp,source.getState().devices.D.stp);
  assert.deepEqual(target.getState().devices.D.interfaces['FastEthernet0/21'].stp,source.getState().devices.D.interfaces['FastEthernet0/21'].stp);
});
console.log(`CST CLI configuration: ${count} test groups passed.`);

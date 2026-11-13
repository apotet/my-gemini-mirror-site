#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readdirSync } from 'node:fs';
const legacyFiles = readdirSync('src/cli-lab/scenarios').filter(f => f.endsWith('.ts')).sort();
const legacyImports = legacyFiles.map((f,i) => `import * as legacy${i} from './src/cli-lab/scenarios/${f}';`).join('\n');
const legacyExport = `export const legacyScenarios = [${legacyFiles.map((_,i) => `...Object.values(legacy${i})`).join(',')}].filter(x => x && typeof x === 'object' && 'initialState' in x);`;
const compiled = await build({ stdin: { contents: legacyImports + '\n' + legacyExport + `
export * from './src/cli-lab/engine/SpanningTree';
export * from './src/cli-lab/engine/ConfigPersistence';
export {interfaceStatus} from './src/cli-lab/engine/OperationalState';
export {LabEngine} from './src/cli-lab/engine/LabEngine';
export {ciscoIosCommands} from './src/cli-lab/vendors/cisco-ios/commands';
export {ciscoIosProfile} from './src/cli-lab/vendors/cisco-ios/profile';`,
  resolveDir: process.cwd(), loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', write: false });
const { deriveSpanningTree: derive, isStpForwarding, isStpLinkForwarding, compareBridgeIds, comparePortIds,
  initializeStartupConfigs, hasUnsavedChanges, saveStartup, reloadFromStartup, interfaceStatus,
  LabEngine, ciscoIosCommands, ciscoIosProfile, legacyScenarios } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].contents).toString('base64'));
let count = 0;
const test = (name, fn) => { fn(); count++; console.log('PASS ' + name); };
function fixture(n, edges) {
  const devices = Object.fromEntries(Array.from({length:n}, (_, i) => {
    const id = String.fromCharCode(65 + i);
    return [id, { id, hostname: id, vendor: 'cisco-ios', privilege:15, modeCtx:{mode:'privileged'},
      stp:{mac:'02:00:00:00:00:' + (i+1).toString(16).padStart(2,'0')},
      interfaces:{}, vlans:{10:{id:10,active:true},20:{id:20,active:true}}, routes:[] }];
  }));
  const links = edges.map(([a,b]) => {
    const aIf = 'p' + (Object.keys(devices[a].interfaces).length+1), bIf = 'p' + (Object.keys(devices[b].interfaces).length+1);
    for (const [id,p] of [[a,aIf],[b,bIf]]) devices[id].interfaces[p] = {name:p,adminUp:true,switchport:{mode:'trunk',trunkAllowed:[10]}};
    return {a,aIf,b,bIf,up:true};
  });
  return {devices,links,activeDeviceId:'A'};
}
const line = () => fixture(2,[['A','B']]);
const triangle = () => fixture(3,[['A','B'],['A','C'],['B','C']]);
const ring = () => fixture(4,[['A','B'],['B','C'],['C','D'],['D','A']]);
const port = (t,id,p) => t.bridges[id].ports[p];
const blockCount = t => Object.values(t.bridges).flatMap(b=>Object.values(b.ports)).filter(p=>p.portRole==='nondesignated').length;
function invariants(s,t) {
  // Independently build physical components and Bellman-Ford distances from each
  // minimum Bridge ID, then check forwarding edges form a spanning tree.
  const unseen = new Set(Object.keys(s.devices));
  while (unseen.size) {
    const component = [unseen.values().next().value]; unseen.delete(component[0]);
    for (let i=0;i<component.length;i++) for (const l of s.links) {
      if (!l.up || !s.devices[l.a].interfaces[l.aIf].adminUp || !s.devices[l.b].interfaces[l.bIf].adminUp) continue;
      const peer = l.a===component[i]?l.b:l.b===component[i]?l.a:null;
      if (peer && unseen.delete(peer)) component.push(peer);
    }
    const root = component.reduce((a,b)=>compareBridgeIds(t.bridges[a].bridgeId,t.bridges[b].bridgeId)<0?a:b);
    const distances = Object.fromEntries(component.map(id=>[id,id===root?0:Infinity]));
    for (let i=0;i<component.length-1;i++) for (const l of s.links) {
      if (!l.up || !s.devices[l.a].interfaces[l.aIf].adminUp || !s.devices[l.b].interfaces[l.bIf].adminUp) continue;
      for(const [a,p,b] of [[l.a,l.aIf,l.b],[l.b,l.bIf,l.a]]) if(a in distances && b in distances) {
        distances[a] = Math.min(distances[a],distances[b]+(s.devices[a].interfaces[p].stp?.pathCost??19));
      }
    }
    for(const id of component) {
      assert.equal(t.bridges[id].rootDevice,root); assert.equal(t.bridges[id].rootPathCost,distances[id]);
      const roots = Object.values(t.bridges[id].ports).filter(p=>p.portRole==='root');
      assert.equal(roots.length,id===root?0:1);
    }
    const active=s.links.filter(l=>component.includes(l.a)&&component.includes(l.b)&&isStpLinkForwarding(s,t,l,10));
    assert.equal(active.length,component.length-1,'exactly n-1 forwarding segments');
    const reached=new Set([root]);for(let i=0;i<component.length;i++)for(const l of active){if(reached.has(l.a))reached.add(l.b);if(reached.has(l.b))reached.add(l.a);}
    assert.equal(reached.size,component.length,'forwarding tree stays connected');
  }
}

test('two switches: elected MAC root, receive-port cost and designated/root roles',()=>{
  const s=line(),t=derive(s);assert.equal(t.bridges.A.rootDevice,'A');assert.equal(t.bridges.B.rootPathCost,19);
  assert.equal(port(t,'A','p1').portRole,'designated');assert.equal(port(t,'B','p1').portRole,'root');invariants(s,t);
});
test('three switch triangle: exact roles, designated bridge and port',()=>{
  const s=triangle(),t=derive(s);assert.equal(blockCount(t),1);assert.equal(port(t,'C','p2').portRole,'nondesignated');
  assert.deepEqual(port(t,'C','p2').designatedBridge,t.bridges.B.bridgeId);assert.deepEqual(port(t,'C','p2').designatedPort,port(t,'B','p2').portId);invariants(s,t);
});
test('four switch ring: upstream bridge ID breaks equal cost tie',()=>{
  const s=ring(),t=derive(s);assert.equal(t.bridges.C.rootPathCost,38);assert.equal(t.bridges.C.rootPort,'p1');assert.equal(blockCount(t),1);invariants(s,t);
});
test('bridge priority change reelects root, no fixed blocked port',()=>{
  const s=triangle(),old=derive(s);s.devices.C.stp.priority=4096;const t=derive(s);
  assert.equal(t.bridges.A.rootDevice,'C');assert.notDeepEqual(t,old);assert.equal(port(t,'C','p2').portState,'forwarding');invariants(s,t);
});
test('MAC change wins tie without changing device key or hostname',()=>{
  const s=triangle();s.devices.C.stp.mac='02:00:00:00:00:00';const t=derive(s);assert.equal(t.bridges.A.rootDevice,'C');invariants(s,t);
});
test('local receiving cost changes root port',()=>{
  const s=triangle();s.devices.C.interfaces.p1.stp={pathCost:100};const t=derive(s);
  assert.equal(t.bridges.C.rootPort,'p2');assert.equal(t.bridges.C.rootPathCost,38);invariants(s,t);
});
test('priority dominates MAC; root path cost dominates upstream ID',()=>{
  const s=ring();s.devices.D.interfaces.p2.stp={pathCost:1};const t=derive(s);
  assert.equal(t.bridges.C.rootPort,'p2');assert.equal(t.bridges.C.rootPathCost,20);invariants(s,t);
});
test('parallel links: upstream port number then port priority break ties',()=>{
  const s=fixture(2,[['A','B'],['A','B']]);let t=derive(s);assert.equal(t.bridges.B.rootPort,'p1');
  s.devices.A.interfaces.p2.stp={priority:16};t=derive(s);assert.equal(t.bridges.B.rootPort,'p2');invariants(s,t);
});
test('upstream port ID beats local port priority',()=>{
  const s=fixture(2,[['A','B'],['A','B']]);s.devices.B.interfaces.p2.stp={priority:0};
  assert.equal(derive(s).bridges.B.rootPort,'p1');
  assert.ok(comparePortIds({priority:0,number:4095},{priority:16,number:1})<0);
  assert.ok(comparePortIds({priority:128,number:1},{priority:128,number:2})<0);
});
test('explicit port numbers reserve IDs and change parallel election',()=>{
  const s=fixture(2,[['A','B'],['A','B']]);s.devices.A.interfaces.p1.stp={number:10};
  const t=derive(s);assert.equal(port(t,'A','p2').portId.number,1);assert.equal(t.bridges.B.rootPort,'p2');
});
for(const change of ['link','admin'])test(change+' failure and recovery reconverge ring',()=>{
  const s=ring(),before=derive(s);
  if(change==='link')s.links[0].up=false;else s.devices.B.interfaces.p1.adminUp=false;
  const t=derive(s);assert.equal(port(t,'B','p1').portRole,'disabled');assert.equal(port(t,'B','p1').physicalUp,false);
  assert.equal(blockCount(t),0);invariants(s,t);
  s.links[0].up=true;s.devices.B.interfaces.p1.adminUp=true;assert.deepEqual(derive(s),before);
});
test('partition: each connected component elects own root',()=>{
  const s=fixture(4,[['A','B'],['C','D']]),t=derive(s);
  assert.equal(t.bridges.B.rootDevice,'A');assert.equal(t.bridges.D.rootDevice,'C');invariants(s,t);
});
test('isolated configured bridge is its own root',()=>{
  const t=derive(fixture(1,[]));assert.equal(t.bridges.A.rootPathCost,0);assert.equal(t.bridges.A.rootPort,null);
});
test('blocking is physically up; per-VLAN readiness is separate',()=>{
  const s=triangle(),t=derive(s),p=s.devices.C.interfaces.p2;
  assert.equal(interfaceStatus(s,s.devices.C,p).operUp,true);assert.equal(port(t,'C','p2').physicalUp,true);
  assert.equal(isStpForwarding(s,t,'C','p2',10),false);assert.equal(isStpForwarding(s,t,'A','p1',10),true);
  assert.equal(isStpForwarding(s,t,'A','p1',20),false);assert.equal(isStpLinkForwarding(s,t,s.links[2],10),false);
  s.devices.A.vlans[10].active=false;assert.equal(isStpForwarding(s,derive(s),'A','p1',10),false);
});
test('VLAN filtering does not turn CST into PVST or invent an alternate tree',()=>{
  const s=triangle();s.devices.A.interfaces.p2.switchport.trunkAllowed=[20];const t=derive(s);
  assert.equal(t.bridges.C.rootPort,'p1');assert.equal(isStpLinkForwarding(s,t,s.links[1],10),false);
  assert.equal(isStpLinkForwarding(s,t,s.links[2],10),false);
});
test('access-access forwards, mismatched access/trunk does not',()=>{
  const s=line();for(const d of Object.values(s.devices))d.interfaces.p1.switchport={mode:'access',accessVlan:10};
  assert.equal(isStpLinkForwarding(s,derive(s),s.links[0],10),true);
  s.devices.B.interfaces.p1.switchport={mode:'trunk'};assert.equal(isStpLinkForwarding(s,derive(s),s.links[0],10),false);
});
test('SVI and routed ports excluded; router endpoint is not a bridge',()=>{
  const s=line();delete s.devices.B.interfaces.p1.switchport;delete s.devices.B.stp;
  s.devices.A.interfaces.Vlan10={name:'Vlan10',adminUp:true};const t=derive(s);
  assert.equal(t.bridges.B,undefined);assert.equal(t.bridges.A.ports.Vlan10,undefined);assert.equal(port(t,'A','p1').portRole,'designated');
});
test('portfast does not suppress BPDUs or remove loop blocking',()=>{
  const s=triangle();for(const d of Object.values(s.devices))for(const p of Object.values(d.interfaces))p.stp={portfast:true};
  assert.equal(blockCount(derive(s)),1);
});
test('repeatable defaults independent of insertion, link direction, active console and hostname',()=>{
  const s=ring();for(const d of Object.values(s.devices))delete d.stp;const before=structuredClone(s),t=derive(s);
  assert.deepEqual(s,before,'pure derivation');assert.deepEqual(derive(s),t);
  const r=structuredClone(s);r.devices=Object.fromEntries(Object.entries(r.devices).reverse());
  for(const d of Object.values(r.devices)){d.interfaces=Object.fromEntries(Object.entries(d.interfaces).reverse());d.hostname='renamed';}
  r.activeDeviceId='D';r.links=r.links.reverse().map(l=>({a:l.b,aIf:l.bIf,b:l.a,bIf:l.aIf,up:l.up}));
  assert.equal(JSON.stringify(derive(r)),JSON.stringify(t));
  const extended=structuredClone(s);extended.devices.Z={...structuredClone(s.devices.A),id:'Z',interfaces:{}};
  extended.devices.Z.stp={};assert.deepEqual(derive(extended).bridges.A.bridgeId,t.bridges.A.bridgeId);
});
test('save/reload preserves bridge and port config, recomputes runtime from failed cable',()=>{
  const s=triangle();s.devices.C.stp.priority=4096;s.devices.A.interfaces.p1.stp={priority:16,pathCost:7,portfast:true};
  const engine=new LabEngine(ciscoIosProfile,ciscoIosCommands,s);
  assert.equal(engine.execute('write memory').error,undefined);
  const next=structuredClone(engine.getState());next.devices.A.stp.priority=0;next.devices.A.interfaces.p1.stp.pathCost=100;next.links[0].up=false;engine.setState(next);
  assert.equal(hasUnsavedChanges(engine.getState().devices.A),true);assert.equal(engine.execute('reload').error,undefined);
  const after=engine.getState();assert.deepEqual(after.devices.A.stp,s.devices.A.stp);assert.deepEqual(after.devices.A.interfaces.p1.stp,s.devices.A.interfaces.p1.stp);
  assert.equal(hasUnsavedChanges(after.devices.A),false);assert.equal(derive(after).bridges.A.ports.p1.physicalUp,false);
  assert.equal(JSON.stringify(after.devices.A.startupConfig).includes('rootBridge'),false);
});
test('legacy snapshots need no migration; reloading removes unsaved bridge STP config',()=>{
  const s=line();for(const d of Object.values(s.devices))delete d.stp;const initialized=initializeStartupConfigs(s),d=initialized.devices.A;
  assert.equal('stp' in d.startupConfig,false);d.stp={priority:0};assert.equal(hasUnsavedChanges(d),true);reloadFromStartup(d);
  assert.equal('stp' in d,false);assert.equal(hasUnsavedChanges(d),false);saveStartup(d);assert.ok(derive(initialized));
});
for(const [label,mutate]of [
  ['priority',s=>s.devices.A.stp.priority=1],['MAC',s=>s.devices.A.stp.mac='ff:00:00:00:00:01'],
  ['duplicate MAC',s=>s.devices.B.stp.mac=s.devices.A.stp.mac],['zero cost',s=>s.devices.A.interfaces.p1.stp={pathCost:0}],
  ['NaN cost',s=>s.devices.A.interfaces.p1.stp={pathCost:NaN}],['port priority',s=>s.devices.A.interfaces.p1.stp={priority:7}],
  ['duplicate port ID',s=>{s.devices.A.interfaces.p1.stp={number:1};s.devices.A.interfaces.p2.stp={number:1};}],
  ['missing endpoint',s=>s.links[0].bIf='missing'],['multiple cables per port',s=>s.links.push({...s.links[0]})],
])test('invalid '+label+' fails explicitly without mutating input',()=>{
  const s=triangle();mutate(s);const before=structuredClone(s);assert.throws(()=>derive(s));assert.deepEqual(s,before);
});
test('all current scenario snapshots derive without migration or mutation',()=>{
  assert.equal(legacyScenarios.length,11);
  for(const scenario of legacyScenarios){const s=structuredClone(scenario.initialState),before=structuredClone(s);assert.ok(derive(s));assert.deepEqual(s,before,scenario.id);}
});
test('frozen input accepted; mutable result cannot change config',()=>{
  const s=triangle();function freeze(x){Object.freeze(x);for(const v of Object.values(x))if(v&&typeof v==='object')freeze(v);}
  freeze(s);const t=derive(s);t.bridges.A.bridgeId.priority=4096;assert.equal(s.devices.A.stp.priority,undefined);
});
test('self-loop between distinct bridge ports blocks one end',()=>{
  const s=line();delete s.devices.B;s.devices.A.interfaces.p2=structuredClone(s.devices.A.interfaces.p1);s.devices.A.interfaces.p2.name='p2';
  s.links=[{a:'A',aIf:'p1',b:'A',bIf:'p2',up:true}];const t=derive(s);
  assert.equal(port(t,'A','p1').portRole,'designated');assert.equal(port(t,'A','p2').portRole,'nondesignated');assert.equal(t.bridges.A.rootPort,null);
});
// Reproducible graph exploration with an independent cost/tree oracle.
let seed=117;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
test('100 seeded weighted graphs: root, shortest cost, connected acyclic forwarding forest',()=>{
  for(let i=0;i<100;i++){
    const n=2+Math.floor(random()*7),edges=[];
    for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(random()<0.45)edges.push([String.fromCharCode(65+a),String.fromCharCode(65+b)]);
    const s=fixture(n,edges);for(const d of Object.values(s.devices)){d.stp.priority=Math.floor(random()*4)*4096;for(const p of Object.values(d.interfaces))p.stp={pathCost:1+Math.floor(random()*30)};}
    invariants(s,derive(s));
  }
});
console.log(`STP: ${count} test groups passed (including 100 seeded graph cases).`);

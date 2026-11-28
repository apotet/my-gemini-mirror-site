import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({entryPoints:['src/courses-prototypes/data/academyTopologyData.ts'],bundle:true,platform:'node',format:'esm',outfile:'scripts/.cache/academy-topology.mjs'});
const {ACADEMY_NODES:nodes,ACADEMY_EDGES:edges,CAREER_ROLES:roles,resolveNodeMastery,computeRoleReadiness}=await import('./.cache/academy-topology.mjs');
assert.equal(nodes.length,18);assert.equal(roles.length,8);
assert.equal(new Set(nodes.map(n=>n.id)).size,18);assert.equal(new Set(roles.map(r=>r.id)).size,8);
const valid=id=>nodes.some(n=>n.id===id);
for(const e of edges)assert.ok(valid(e.from)&&valid(e.to));
for(const role of roles){
  assert.ok(role.criticalNodeIds.length>0);
  for(const id of [...role.criticalNodeIds,...role.supportingNodeIds])assert.ok(valid(id));
  for(const status of ['unstarted','studied','practiced','verified']){
    const mastery=Object.fromEntries(nodes.map(n=>[n.id,status]));const result=computeRoleReadiness(role,mastery);
    assert.equal(result.verifiedPercent,status==='verified'?100:0);
    assert.equal(result.verifiedCount,status==='verified'?role.criticalNodeIds.length:0);
  }
}
for(const n of nodes) assert.equal(resolveNodeMastery(n,'newcomer',0,false,false),'unstarted');
const ip=nodes.find(n=>n.id==='ip-addressing');
assert.equal(resolveNodeMastery(ip,'newcomer',1,false,false),'studied');
assert.equal(resolveNodeMastery(ip,'newcomer',1,true,false),'practiced');
assert.equal(resolveNodeMastery(ip,'newcomer',1,true,true),'verified');
console.log('PASS: 18 unique nodes, 8 roles, valid edges/routes, verified-only readiness, theory/practice distinction, IP state transitions');

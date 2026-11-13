#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

// Use the source constants and the actual current scenario topology. Guard
// screen-space label rectangles, not just whether SVG text elements exist.
const source = readFileSync('src/cli-lab/components/TopologyPanel.tsx','utf8');
const outward = Number(source.match(/const outward = (\d+);/)?.[1]);
const perpendicular = Number(source.match(/const perpendicular = (\d+);/)?.[1]);
assert.ok(Number.isFinite(outward)&&Number.isFinite(perpendicular),'label offsets missing');
const built=await build({stdin:{contents:`export { ciscoFourSwitchHostRingScenario } from './src/cli-lab/scenarios/cisco-four-switch-host-ring';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',write:false});
const {ciscoFourSwitchHostRingScenario} = await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].contents).toString('base64'));
const state=ciscoFourSwitchHostRingScenario.initialState;
const nodes={};
for(const [id,device]of Object.entries(state.devices)){
  const slots={
    sw1:[300,225],sw2:[700,225],sw3:[700,520],sw4:[300,520],
    pc1v10:[100,120],pc1v20:[100,315],pc2v10:[900,120],pc2v20:[900,315],
    pc3v10:[900,430],pc3v20:[900,645],pc4v10:[100,430],pc4v20:[100,645],
  };
  assert.ok(slots[id],'unexpected fixture '+id);
  nodes[id]={x:slots[id][0],y:slots[id][1],w:device.vendor==='linux-host'?120:128,h:device.vendor==='linux-host'?76:72};
}
const edge=(a,b)=>{
  const p=nodes[a],q=nodes[b],dx=q.x-p.x,dy=q.y-p.y;
  const scale=Math.max(Math.abs(dx)/(p.w/2),Math.abs(dy)/(p.h/2));
  return {x:p.x+dx/scale,y:p.y+dy/scale};
};
const labels=[];
for(const [index,link] of state.links.entries()){
  for(const [device,peer,port] of [[link.a,link.b,link.aIf],[link.b,link.a,link.bIf]]){
    const p=nodes[device],e=edge(device,peer),dx=e.x-p.x,dy=e.y-p.y,len=Math.hypot(dx,dy);
    const text=port.replace('FastEthernet','Fa').replace('Ethernet','Et');
    // Conservative +5 characters for " RP ⊘", " TRK", VLAN label, etc.
    const w=(text.length+5)*9+8, h=20;
    const x=e.x+(dx/len)*outward-(dy/len)*perpendicular;
    const y=e.y+(dy/len)*outward+(dx/len)*perpendicular;
    const box={id:`${index}:${device}/${text}`,x0:x-w/2,x1:x+w/2,y0:y-h,y1:y};
    assert.ok(box.x0>=0&&box.x1<=1000&&box.y0>=0&&box.y1<=745,box.id+' clipped by canvas');
    labels.push(box);
  }
}
const overlaps=(a,b,pad=4)=>a.x1>b.x0-pad&&a.x0<b.x1+pad&&a.y1>b.y0-pad&&a.y0<b.y1+pad;
for(const label of labels){
  for(const [id,n] of Object.entries(nodes)){
    const body={x0:n.x-n.w/2,x1:n.x+n.w/2,y0:n.y-n.h/2,y1:n.y+n.h/2};
    assert.ok(!overlaps(label,body),`${label.id} overlaps chassis ${id}`);
  }
}
for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
  assert.ok(!overlaps(labels[i],labels[j],3),`${labels[i].id} collides with ${labels[j].id}`);
}
console.log(`PASS: ${labels.length} port labels clear all 12 node chassis, each other and canvas at actual SVG coordinates; offsets ${outward}/${perpendicular}.`);

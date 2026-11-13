#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const built = await build({
  stdin: { contents: `export { listCiscoCommands, commandCatalogForScenario } from './src/cli-lab/vendors/cisco-ios/commandCatalog.ts';
export { ciscoIosCommands } from './src/cli-lab/vendors/cisco-ios/commands.ts';
export { ciscoVlanAccessScenario } from './src/cli-lab/scenarios/cisco-vlan-access.ts';
export { ciscoTwoSwitchTrunkDiagnosticScenario } from './src/cli-lab/scenarios/cisco-two-switch-trunk-diagnostics.ts';`,
    resolveDir: process.cwd(), loader: 'ts', sourcefile: 'command-catalog-entry.ts' },
  bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'silent',
});
const m=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].contents).toString('base64'));
const catalog=m.listCiscoCommands();
assert.equal(catalog.length,m.ciscoIosCommands.length,'every executable command must be in catalog');
assert.equal(new Set(catalog.map(x=>x.id)).size,catalog.length,'command IDs unique');
assert.ok(catalog.every(x=>x.implemented===true&&x.syntax&&x.modes.length),'no fictitious commands');
for(const scenario of [m.ciscoVlanAccessScenario,m.ciscoTwoSwitchTrunkDiagnosticScenario]){
  const groups=m.commandCatalogForScenario(scenario);
  const all=[...groups.recommended,...groups.otherDiagnostics,...groups.otherCommands];
  assert.equal(all.length,catalog.length,scenario.id+' lost commands');
  assert.equal(new Set(all.map(x=>x.id)).size,catalog.length,scenario.id+' duplicates commands');
  assert.ok(groups.recommended.length>0,'every scenario has broadly relevant commands');
}
for(const id of ['cisco.show_running_config','cisco.show_ip_interface',
  'cisco.stp_bridge_priority','cisco.stp_cost','cisco.stp_port_priority']){
  assert.ok(catalog.some(x=>x.id===id),id+' missing');
}
const stp=m.commandCatalogForScenario({concepts:['stp']});
assert.ok(stp.recommended.some(x=>x.id==='cisco.stp_bridge_priority'));
assert.ok(stp.recommended.some(x=>x.id==='cisco.stp_port_priority'));
const vlans=m.commandCatalogForScenario({concepts:['trunk']});
assert.ok(vlans.recommended.some(x=>x.id==='cisco.switchport_trunk_allowed_vlan_add'));
assert.ok(vlans.recommended.some(x=>x.id==='cisco.switchport_trunk_allowed_vlan_remove'));
assert.ok(!vlans.recommended.some(x=>x.id==='cisco.stp_bridge_priority'),
  'generic trunk task must not imply STP is the hidden fault');
console.log('PASS CLI command catalog: '+catalog.length+' executable entries, no missing/duplicated specs, topical grouping.');

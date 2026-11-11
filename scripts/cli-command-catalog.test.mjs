#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const bundle = await build({
  stdin: {
    contents: `export { listCiscoCommands, commandCatalogForScenario } from './src/cli-lab/vendors/cisco-ios/commandCatalog.ts';
export { ciscoIosCommands } from './src/cli-lab/vendors/cisco-ios/commands.ts';
export { ciscoTwoSwitchVlanScenario } from './src/cli-lab/scenarios/cisco-two-switch-vlan.ts';
export { ciscoThreeSwitchMissingVlanScenario } from './src/cli-lab/scenarios/cisco-three-switch-missing-vlan.ts';`,
    resolveDir: process.cwd(), sourcefile: 'command-catalog-test-entry.ts', loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'silent',
});
const uri = 'data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].contents).toString('base64');
const lib = await import(uri);
const catalog = lib.listCiscoCommands();
assert.equal(catalog.length, lib.ciscoIosCommands.length, 'registry must reflect all executable command specs');
assert.equal(new Set(catalog.map(c => c.id)).size, catalog.length, 'command IDs unique');
assert.ok(catalog.every(c => c.implemented && c.syntax && c.modes.length), 'no fake unimplemented commands');
const base = lib.commandCatalogForScenario(lib.ciscoTwoSwitchVlanScenario);
const applied = lib.commandCatalogForScenario(lib.ciscoThreeSwitchMissingVlanScenario);
for (const context of [base, applied]) {
  const all = [...context.recommended, ...context.otherDiagnostics, ...context.otherCommands];
  assert.equal(all.length, catalog.length, 'scenario must never hide executable commands');
  assert.equal(new Set(all.map(c => c.id)).size, catalog.length);
  assert.ok(context.recommended.some(c => c.syntax === 'show interfaces trunk'));
  assert.ok(context.recommended.some(c => c.syntax === 'copy running-config startup-config'));
}
assert.ok(base.recommended.some(c => c.syntax === 'switchport mode trunk'));
assert.ok(applied.recommended.some(c => c.syntax === 'show vlan brief'));
assert.ok(catalog.some(c => c.syntax === 'show interfaces'));
assert.ok(catalog.some(c => c.syntax === 'show ?'));
assert.ok(catalog.some(c => c.syntax === 'show ip interface brief'));
assert.ok(catalog.some(c => c.syntax === 'reload'));
assert.ok(catalog.some(c => c.syntax === 'show startup-config'));
console.log('PASS: Cisco CLI catalog comes from handlers and preserves all commands across scenarios');

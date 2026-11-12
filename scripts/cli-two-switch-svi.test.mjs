import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

mkdirSync(resolve('scripts/.cache'), { recursive: true });
const outfile = resolve('scripts/.cache/cli-two-switch-svi.mjs');
await build({
  stdin: { contents: `
    export { LabEngine } from './src/cli-lab/engine/LabEngine';
    export { ciscoIosProfile } from './src/cli-lab/vendors/cisco-ios/profile';
    export { ciscoIosCommands } from './src/cli-lab/vendors/cisco-ios/commands';
    export { ciscoTwoSwitchSviScenario } from './src/cli-lab/scenarios/cisco-two-switch-svi';
  `, resolveDir: process.cwd() },
  bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent',
});
const { LabEngine, ciscoIosProfile, ciscoIosCommands, ciscoTwoSwitchSviScenario } =
  await import(pathToFileURL(outfile).href);
const scenario = ciscoTwoSwitchSviScenario;
const lab = new LabEngine(ciscoIosProfile, ciscoIosCommands, structuredClone(scenario.initialState));
function cmd(line) {
  const result = lab.execute(line);
  assert.equal(result.error, undefined, line + ': ' + result.output);
  return result;
}
assert.equal(scenario.goals.length, 17);
assert.equal(lab.checkGoals(scenario.goals).allPassed, false);
for (const [device, ip] of [['sw1','192.168.10.2'], ['sw2','192.168.10.3']]) {
  lab.selectDevice(device);
  for (const line of [
    'enable', 'configure terminal', 'vlan 10', 'exit',
    'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'no shutdown', 'exit',
    'interface fa0/24', 'switchport mode trunk', 'switchport trunk allowed vlan 10', 'no shutdown', 'exit',
    'interface vlan 10', 'ip address ' + ip + ' 255.255.255.0', 'no shutdown', 'end',
  ]) cmd(line);
  const state = lab.getState().devices[device];
  assert.equal(state.interfaces.Vlan10.ipv4.address, ip);
  assert.equal(state.interfaces.Vlan10.ipv4.prefix, 24);
  assert.ok(cmd('show ip interface brief').output.includes(ip));
}
assert.equal(lab.checkGoals(scenario.goals).allPassed, false, 'not saved yet');
lab.selectDevice('sw1');
cmd('copy running-config startup-config');
assert.equal(lab.checkGoals(scenario.goals).allPassed, false, 'SW2 not yet saved');
lab.selectDevice('sw2');
cmd('write memory');
assert.equal(lab.checkGoals(scenario.goals).allPassed, true, 'all config and L2 path checks passed');
cmd('configure terminal');
cmd('interface vlan 10');
cmd('shutdown');
assert.equal(lab.checkGoals(scenario.goals).allPassed, false, 'admin down invalidates completion');
cmd('no shutdown');
assert.equal(lab.checkGoals(scenario.goals).allPassed, true, 'restoring identical running config matches saved startup config');
cmd('end');
cmd('write memory');
assert.equal(lab.checkGoals(scenario.goals).allPassed, true, 'restored and saved');
console.log('PASS Cisco two-switch VLAN/SVI IPv4/trunk/L2 path/save/negative checks');

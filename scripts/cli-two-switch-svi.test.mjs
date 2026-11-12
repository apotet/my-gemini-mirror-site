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
assert.equal(scenario.goals.length, 19);
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
// Connectivity is available only after both SVI IPv4 endpoints and VLAN trunk are ready.
lab.selectDevice('sw1');
assert.match(cmd('ping 192.168.10.3').output, /REACHABLE/);
assert.ok(!cmd('ping 192.168.10.3').output.includes('UNREACHABLE'));
assert.match(cmd('show ip interface brief').output, /Vlan10.*up\\s+up/);
lab.selectDevice('sw2');
assert.match(cmd('ping 192.168.10.2').output, /REACHABLE/);
assert.match(cmd('ping 192.168.20.1').output, /UNREACHABLE/);

// Wrong mask: a configured IP without a common IPv4 subnet cannot pass.
cmd('configure terminal');
cmd('interface vlan 10');
cmd('ip address 192.168.10.3 255.255.255.255');
cmd('end');
assert.match(cmd('ping 192.168.10.2').output, /UNREACHABLE/);
assert.equal(lab.checkGoals(scenario.goals).results.find(r => r.predicate.type === 'ipv4.sviReachable' && r.predicate.device === 'sw1')?.passed, false);
cmd('configure terminal');
cmd('interface vlan 10');
cmd('ip address 192.168.10.3 255.255.255.0');
cmd('end');
assert.match(cmd('ping 192.168.10.2').output, /REACHABLE/);

// A missing VLAN from either trunk must break modeled IPv4 reachability and SVI autostate.
cmd('configure terminal');
cmd('interface fa0/24');
cmd('switchport trunk allowed vlan none');
cmd('end');
assert.match(cmd('ping 192.168.10.2').output, /UNREACHABLE/);
assert.equal(lab.checkGoals(scenario.goals).results.find(r => r.predicate.type === 'ipv4.sviReachable')?.passed, false);
assert.match(cmd('show ip interface brief').output, /Vlan10.*down\\s+down/);
cmd('configure terminal');
cmd('interface fa0/24');
cmd('switchport trunk allowed vlan 10');
cmd('end');
assert.match(cmd('ping 192.168.10.2').output, /REACHABLE/);

// Link-down should invalidate both the test command and state-based goal.
const prior = structuredClone(lab.getState());
const cut = structuredClone(prior);
cut.links[0].up = false;
lab.setState(cut);
assert.match(cmd('ping 192.168.10.2').output, /UNREACHABLE/);
assert.equal(lab.checkGoals(scenario.goals).results.find(r => r.predicate.type === 'ipv4.sviReachable')?.passed, false);
lab.setState(prior);
assert.match(cmd('ping 192.168.10.2').output, /REACHABLE/);

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
console.log('PASS Cisco two-switch SVI IPv4 modeled ping, autostate, mask/trunk/link-negative tests and persistence');

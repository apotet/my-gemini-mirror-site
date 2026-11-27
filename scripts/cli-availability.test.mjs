#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const compiled = await build({
  stdin: {
    contents: `export { LabEngine } from './src/cli-lab/engine/LabEngine.ts';
export { ciscoIosCommands } from './src/cli-lab/vendors/cisco-ios/commands.ts';
export { ciscoIosProfile } from './src/cli-lab/vendors/cisco-ios/profile.ts';
export { ciscoTwoSwitchVlanScenario } from './src/cli-lab/scenarios/cisco-two-switch-vlan.ts';`,
    resolveDir: process.cwd(),
    sourcefile: 'availability-entry.ts',
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  logLevel: 'silent',
});
const lib = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].contents).toString('base64'));

function engine(mutate) {
  const state = structuredClone(lib.ciscoTwoSwitchVlanScenario.initialState);
  if (mutate) mutate(state);
  return new lib.LabEngine(lib.ciscoIosProfile, lib.ciscoIosCommands, state);
}
function ok(e, cmd) {
  const r = e.execute(cmd);
  assert.equal(r.error, undefined, `${cmd}: ${r.output}`);
  return r;
}
function snap(e) { return JSON.stringify(e.getState()); }
function modeOf(e) { return e.getState().devices.sw1.modeCtx; }

{
  const e = engine();
  ok(e, 'enable');
  ok(e, 'conf t');
  ok(e, 'interface FastEthernet0/1');
  const before = snap(e);
  const tab = e.complete('i');
  assert.equal(tab.candidates.includes('ip'), false, 'L2 i offered ip');
  assert.notEqual(tab.completed, 'ip ');
  assert.doesNotMatch(e.help('ip ?'), /\baddress\b/, 'L2 ip ? offered address');
  assert.deepEqual(e.complete('no ip a').candidates, [], 'L2 Tab offered no ip address');
  assert.doesNotMatch(e.help('no ip ?'), /\baddress\b/, 'L2 no ip ? offered address');
  assert.doesNotMatch(e.help('no ip address ?'), /<cr>/, 'L2 no ip address offered Enter');
  const ip = e.execute('ip address 192.0.2.1 255.255.255.0');
  const noip = e.execute('no ip address');
  assert.equal(ip.error, true, 'L2 ip address accepted');
  assert.equal(noip.error, true, 'L2 no ip address accepted');
  assert.equal(snap(e), before, 'L2 ip commands changed port state');
}

{
  const e = engine(s => {
    s.devices.sw1.interfaces.Vlan10 = { name: 'Vlan10', adminUp: true };
    s.devices.sw1.interfaces['GigabitEthernet0/0'] = { name: 'GigabitEthernet0/0', adminUp: true };
  });
  ok(e, 'enable');
  ok(e, 'conf t');
  ok(e, 'interface vlan 10');
  assert.match(e.help('?'), /\bip\b/, 'SVI lost ip address');
  assert.match(e.help('ip ?'), /\baddress\b/);
  ok(e, 'ip address 192.0.2.1 255.255.255.0');
  ok(e, 'no ip address');
  ok(e, 'exit');
  ok(e, 'interface GigabitEthernet0/0');
  assert.doesNotMatch(e.help('?'), /switchport/, 'routed ? offered switchport');
  assert.equal(e.complete('sw').candidates.includes('switchport'), false, 'routed Tab offered switchport');
  const routedBefore = snap(e);
  for (const cmd of ['switchport mode access', 'switchport mode trunk', 'switchport trunk allowed vlan 10']) {
    assert.equal(e.execute(cmd).error, true, 'routed Enter incorrectly accepted ' + cmd);
    assert.equal(snap(e), routedBefore);
  }
  ok(e, 'exit');
  ok(e, 'interface FastEthernet0/1');
  assert.match(e.help('?'), /switchport/, 'L2 lost switchport');
  assert.equal(e.complete('sw').candidates.includes('switchport'), true);
}

for (const entry of [
  ['config', []],
  ['config-if', ['interface FastEthernet0/1']],
  ['config-vlan', ['vlan 10']],
]) {
  const e = engine();
  ok(e, 'enable');
  ok(e, 'conf t');
  for (const cmd of entry[1]) ok(e, cmd);
  const help = e.help('do ?');
  for (const word of ['reload', 'configure', 'disable', 'exit']) {
    assert.doesNotMatch(help, new RegExp('^  ' + word + '\\b', 'm'), `${entry[0]} do ? offered ${word}`);
    assert.equal(e.complete('do ' + word[0]).candidates.includes(word), false, `${entry[0]} Tab offered do ${word}`);
  }
  assert.doesNotMatch(e.help('do reload ?'), /<cr>/, `${entry[0]} do reload ? showed <cr>`);
  assert.doesNotMatch(e.help('do conf t ?'), /<cr>/, `${entry[0]} do conf t ? showed <cr>`);
  for (const cmd of ['do reload', 'do configure terminal', 'do conf t', 'do disable', 'do exit']) {
    const before = snap(e);
    const beforeMode = modeOf(e);
    const r = e.execute(cmd);
    assert.equal(r.error, true, `${entry[0]} ${cmd} accepted: ${r.output}`);
    assert.match(r.output, /not available|Invalid input/i, `${entry[0]} ${cmd} unclear: ${r.output}`);
    assert.equal(snap(e), before, `${entry[0]} ${cmd} changed config`);
    assert.deepEqual(modeOf(e), beforeMode, `${entry[0]} ${cmd} changed mode`);
  }
  assert.match(e.help('do ?'), /^  show\b/m, `${entry[0]} lost do show`);
  assert.equal(e.complete('do sh').completed, 'do show ', `${entry[0]} Tab lost do show`);
  ok(e, 'do show vlan');
}

{
  const e = engine();
  ok(e, 'enable');
  const before = snap(e);
  const inline = e.help('show?');
  const spaced = e.help('show ?');
  assert.notEqual(inline, spaced, 'show? and show ? collapsed');
  assert.match(inline, /show/);
  assert.match(spaced, /vlan|running-config|interfaces/);
  e.complete('sh');
  assert.equal(snap(e), before, 'help or Tab executed a command');
}

console.log('PASS: Enter, Tab and ? share interface and do availability');

#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const compiled = await build({
  stdin: {
    contents: `
export { LabEngine } from './src/cli-lab/engine/LabEngine';
export { ciscoIosCommands } from './src/cli-lab/vendors/cisco-ios/commands';
export { ciscoIosProfile } from './src/cli-lab/vendors/cisco-ios/profile';
`,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  platform: 'node', format: 'esm', bundle: true, write: false,
});
const { LabEngine, ciscoIosCommands, ciscoIosProfile } =
  await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].contents).toString('base64'));

const iface = { name: 'Vlan10', adminUp: true, ipv4: { address: '192.168.10.2', prefix: 24, mask: '255.255.255.0' } };
const state = {
  activeDeviceId: 'sw1', links: [],
  devices: {
    sw1: {
      id: 'sw1', hostname: 'Switch', vendor: 'cisco-ios', privilege: 15,
      modeCtx: { mode: 'privileged' },
      interfaces: { Vlan10: iface },
      vlans: { 1: { id: 1, active: true }, 10: { id: 10, active: true } },
      routes: [],
    },
  },
};
const engine = new LabEngine(ciscoIosProfile, ciscoIosCommands, state);
function run(command) {
  const r = engine.execute(command);
  assert.equal(r.error, undefined, command + ': ' + r.output);
  return r.output;
}
let count = 0;
function test(name, fn) { fn(); count++; console.log('PASS ' + name); }

test('targeted running config returns the actual SVI block and exact mask', () => {
  const result = run('show running-config interface vlan 10');
  assert.match(result, /^interface Vlan10\\n ip address 192\\.168\\.10\\.2 255\\.255\\.255\\.0\\n no shutdown$/);
  assert.ok(run('show running-config').includes(result));
});
test('short interface name, IP detail and existing brief still work', () => {
  assert.equal(run('sh run int Vlan10'), run('show running-config interface vlan 10'));
  assert.match(run('show ip interface Vlan10'), /Internet address is 192\\.168\\.10\\.2\\/24/);
  assert.match(run('show ip interface vlan 10'), /Subnet mask is 255\\.255\\.255\\.0/);
  assert.match(run('show ip interface brief'), /Vlan10\\s+192\\.168\\.10\\.2/);
});
test('contextual help and TAB offer interface names without executing', () => {
  assert.match(engine.help('show running-config ?'), /interface/);
  assert.match(engine.help('show running-config interface ?'), /INTERFACE/);
  assert.match(engine.help('show ip interface ?'), /INTERFACE/);
  assert.equal(engine.complete('show running-config int').completed, 'show running-config interface ');
});
test('invalid interfaces and trailing args are rejected', () => {
  for (const command of ['show running-config interface Vlan20', 'show ip interface Vlan20',
    'show running-config interface Vlan10 extra', 'show ip interface Vlan10 extra']) {
    assert.equal(engine.execute(command).error, true, command);
  }
});
test('do show in config-if does not change mode or IP configuration', () => {
  run('configure terminal'); run('interface vlan 10');
  const before = structuredClone(engine.getState());
  assert.match(run('do show running-config interface Vlan10'), /255\\.255\\.255\\.0/);
  assert.match(run('do show ip interface Vlan10'), /Subnet mask is 255\\.255\\.255\\.0/);
  assert.deepEqual(engine.getState(), before);
});
console.log(`Targeted SVI show: ${count} groups passed.`);

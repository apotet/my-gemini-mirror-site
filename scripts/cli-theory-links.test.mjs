#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const compiled = await build({
  stdin: {
    contents: `
export { CLI_SCENARIO_THEORY, scenarioTheoryIds } from './src/cli-lab/scenarioTheory';
export { getLesson } from './src/data/lessons';
export { ciscoIosModesScenario } from './src/cli-lab/scenarios/cisco-ios-modes';
export { ciscoShowDiagnosticScenario } from './src/cli-lab/scenarios/cisco-show-diagnostic';
export { ciscoVlanAccessScenario } from './src/cli-lab/scenarios/cisco-vlan-access';
export { ciscoAccessSviFollowupScenario } from './src/cli-lab/scenarios/cisco-access-svi-followup';
export { ciscoTrunkScenario } from './src/cli-lab/scenarios/cisco-trunk';
export { ciscoL3GatewayScenario } from './src/cli-lab/scenarios/cisco-l3-gateway';
export { ciscoTwoSwitchVlanScenario } from './src/cli-lab/scenarios/cisco-two-switch-vlan';
export { ciscoTwoSwitchSviScenario } from './src/cli-lab/scenarios/cisco-two-switch-svi';
export { ciscoThreeSwitchMissingVlanScenario } from './src/cli-lab/scenarios/cisco-three-switch-missing-vlan';
export { ciscoTwoSwitchTrunkDiagnosticScenario } from './src/cli-lab/scenarios/cisco-two-switch-trunk-diagnostics';
`,
    resolveDir: process.cwd(), loader: 'ts',
  },
  bundle: true, write: false, platform: 'node', format: 'esm',
});
const m = await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].contents).toString('base64'));
const all = [
  m.ciscoIosModesScenario, m.ciscoShowDiagnosticScenario, m.ciscoVlanAccessScenario,
  m.ciscoAccessSviFollowupScenario, m.ciscoTrunkScenario, m.ciscoL3GatewayScenario,
  m.ciscoTwoSwitchVlanScenario, m.ciscoTwoSwitchSviScenario,
  m.ciscoThreeSwitchMissingVlanScenario, m.ciscoTwoSwitchTrunkDiagnosticScenario,
];
assert.equal(all.length, 10);
assert.deepEqual(Object.keys(m.CLI_SCENARIO_THEORY).sort(), all.map(s=>s.id).sort());
for (const scenario of all) {
  const topics = m.scenarioTheoryIds(scenario.id);
  assert.ok(topics.length > 0, scenario.id);
  assert.equal(new Set(topics).size, topics.length, 'duplicate '+scenario.id);
  for (const id of topics) {
    const lesson = m.getLesson(id);
    assert.ok(lesson, scenario.id+' missing lesson '+id);
    assert.ok(lesson.blocks?.length >= 3, id+' should contain substantial theory');
    assert.ok(lesson.professional?.blocks?.length >= 2, id+' needs professional text');
  }
  const steps = scenario.steps ?? [];
  assert.equal(m.CLI_SCENARIO_THEORY[scenario.id].steps.length, steps.length,
    scenario.id+' has missing step mappings');
  for (let i=0; i<steps.length; i++) {
    const links = m.scenarioTheoryIds(scenario.id,i);
    assert.ok(links.length, scenario.id+' missing step '+(i+1));
    for (const id of links) assert.ok(m.getLesson(id), scenario.id+' invalid step link '+id);
  }
  console.log('PASS '+scenario.id+' ('+steps.length+' steps, '+topics.length+' lessons)');
}
for (const id of ['cli-vlan-trunk','cli-ip-static-route']) {
  const lesson=m.getLesson(id);
  assert.ok(lesson?.commands?.length > 0);
}
console.log('CLI theory mapping: 10 scenarios, all step links and 2 new lessons passed.');

import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

await build({
  stdin: {
    contents: `
      export * from './src/components/LessonLearningPath';
      export * from './src/components/PracticeHub';
      export * from './src/data/lessons/learningPaths';
      export * from './src/data/lessons';
      export * from './src/data/lessons/lessonSectionLinks';
      export * from './src/data/lessons/reviewStatus';
      export * from './src/data/practiceLinks';
      export * from './src/cli-lab/scenarios/cisco-vlan-access';
    `,
    loader: 'tsx', resolveDir: process.cwd(),
  },
  bundle: true, platform: 'node', jsx: 'automatic', packages: 'external', format: 'esm',
  loader: { '.css': 'empty' },
  outfile: 'scripts/.cache/lesson-learning-path.mjs', logLevel: 'silent',
});
const {
  LessonLearningPath, PILOT_LEARNING_PATHS, getLessonLearningPath, getLesson, LESSONS,
  getLessonBlocksWithSections, getLessonReviewStatus, PRACTICE_DESTINATIONS,
  PracticeHub, ciscoVlanAccessScenario,
} = await import('./.cache/lesson-learning-path.mjs');

const ids = ['l3-route-selection', 'l3-arp', 'l3-ospf', 'l2-vlan'];
assert.deepEqual(Object.keys(PILOT_LEARNING_PATHS), ids);
const available = [], planned = [], nextTargets = [];
for (const id of ids) {
  assert.ok(getLesson(id), 'known lesson: ' + id);
  assert.equal(getLessonReviewStatus(id), 'needs-review', 'only unapproved lessons opt in');
  const path = getLessonLearningPath(id);
  for (let cursor = id, visited = new Set(); cursor; cursor = getLessonLearningPath(cursor)?.next?.lessonId) {
    assert.ok(!visited.has(cursor), 'no learning path cycle: ' + id);
    visited.add(cursor);
  }
  if (path.next) {
    assert.ok(getLesson(path.next.lessonId), 'known next lesson');
    assert.ok(path.next.reason.trim());
    nextTargets.push(path.next.lessonId);
  }
  const practices = path.practice ?? [];
  const destinations = practices.map(practice => practice.kind === 'planned' ? practice.scenarioId : practice.link);
  assert.equal(new Set(destinations).size, destinations.length, 'no duplicate practice destinations');
  for (const practice of practices) {
    assert.ok(practice.title.trim() && practice.goal.trim(), 'purposeful practice has a title and a goal');
    if (practice.kind === 'available') {
      assert.ok(Object.hasOwn(PRACTICE_DESTINATIONS, practice.link), 'registered active destination');
      available.push(practice.link);
    } else {
      assert.equal(practice.kind, 'planned');
      assert.ok(!Object.hasOwn(practice, 'link'), 'planned is not a practice route');
      assert.ok(!Object.values(PRACTICE_DESTINATIONS).some(d => d.scenarioId === practice.scenarioId));
      assert.ok(readFileSync('docs/development/cli-learning.md', 'utf8').includes(practice.scenarioId));
      assert.ok(!readdirSync('src/cli-lab/scenarios').some(file =>
        file.endsWith('.ts') && readFileSync('src/cli-lab/scenarios/' + file, 'utf8').includes(practice.scenarioId)));
      planned.push(practice.scenarioId);
    }
  }
  for (const mode of ['plain', 'professional']) {
    for (const block of getLessonBlocksWithSections(getLesson(id), mode)) {
      assert.ok(!path.next || block.relatedLesson?.id !== path.next.lessonId, 'do not repeat an existing lesson button');
      assert.ok(practices.every(practice => practice.kind !== 'available' || block.practiceLink !== practice.link), 'do not repeat a live stand button');
    }
  }
}
assert.deepEqual(nextTargets, ['l3-arp']);
assert.deepEqual(available, ['packet', 'vlan-trunk-case', 'cli-vlan']);
assert.equal(PRACTICE_DESTINATIONS.packet.simulator, 'journey');
assert.deepEqual(planned, ['cisco-ospf-basic']);
assert.deepEqual(PRACTICE_DESTINATIONS.vlan, { simulator: 'vlan' }, 'generic route never activates a case');
assert.deepEqual(PRACTICE_DESTINATIONS['vlan-trunk-case'], { simulator: 'vlan', vlanCase: 'trunk' });
assert.equal(PRACTICE_DESTINATIONS['cli-vlan'].scenarioId, ciscoVlanAccessScenario.id);
assert.equal(ciscoVlanAccessScenario.title, 'Access VLAN на порту');

const render = (lessonId, props = {}) => renderToStaticMarkup(createElement(LessonLearningPath, { lessonId, ...props }));
const noop = () => {};
const nextView = render('l3-route-selection', { onOpenLesson: noop });
assert.match(nextView, /Что дальше/);
assert.match(nextView, /Для полноты понимания/);
assert.match(nextView, /Читать урок: ARP: чей MAC нужен для IP/);
assert.equal((nextView.match(/<button\b/g) ?? []).length, 1);
assert.equal(render('l3-route-selection'), '', 'modal/standalone without lesson callback has no dead CTA');
const practiceView = render('l3-arp', { onOpenPractice: noop });
assert.match(practiceView, /Путь пакета/);
assert.match(practiceView, /Открыть стенд/);
assert.equal((practiceView.match(/<button\b/g) ?? []).length, 1);
assert.equal(render('l3-arp'), '', 'modal/standalone without practice callback has no dead CTA');
const plannedView = render('l3-ospf', { onOpenLesson: noop, onOpenPractice: noop });
assert.match(plannedView, /В разработке/);
assert.match(plannedView, /OSPF на L3-коммутаторе/);
assert.doesNotMatch(plannedView, /<button\b|<a\b|href=|role="button"|tabindex=/i, 'no interaction for unavailable practice');
assert.ok(render('l3-ospf').includes('В разработке'), 'planned practice can still be read without callbacks');
const vlanFooter = render('l2-vlan', { onOpenPractice: noop });
assert.match(vlanFooter, /Открыть стенд VLAN &amp; Trunk/);
assert.match(vlanFooter, /Открыть CLI: Access VLAN на порту/);
assert.match(vlanFooter, /Дело 4 · Нет связи.*PC-02.*PC-04.*VLAN 20.*802\.1Q/);
assert.doesNotMatch(vlanFooter, /native VLAN/i);
assert.equal((vlanFooter.match(/<button\b/g) ?? []).length, 2);
assert.equal(render('l2-vlan'), '', 'VLAN footer must not render dead practice actions');
const hub = props => renderToStaticMarkup(createElement(PracticeHub, props));
const vlanCase = hub({ initialPracticeLink: 'vlan-trunk-case' });
assert.match(vlanCase, /aria-pressed="true"[^>]*>Дело 4 · Нет связи<\/button>/);
assert.match(vlanCase, /PC-02 VLAN 20 → PC-04 VLAN 20/);
assert.match(vlanCase, /L 10,20 · R 10</, 'VLAN 20 is absent on SW2 from first render, before effects');
for (const free of [hub({ initialPracticeLink: 'vlan' }), hub({ initialSimulator: 'vlan' })]) {
  assert.match(free, /aria-pressed="true"[^>]*>Свободная<\/button>/);
  assert.match(free, /PC-01 VLAN 10 → PC-03 VLAN 10/);
  assert.match(free, /L 10,20 · R 10,20</);
  assert.doesNotMatch(free, /Дело 4: PC-02/);
}
for (const lesson of LESSONS.filter(l => getLessonReviewStatus(l.id) === 'approved')) {
  assert.equal(getLessonLearningPath(lesson.id), undefined);
  assert.equal(render(lesson.id, { onOpenLesson: noop, onOpenPractice: noop }), '');
}
for (const id of ['l3-subnets', 'missing-lesson', 'constructor', '__proto__']) assert.equal(render(id, { onOpenLesson: noop, onOpenPractice: noop }), '');
console.log('PASS: four opt-in next-step examples, first-render real VLAN case, free routes unchanged, no duplicate/cycle, dead actions or approved-lesson change');

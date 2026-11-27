import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

await build({
  stdin: {
    contents: `
      export * from './src/components/LessonLearningPath';
      export * from './src/data/lessons/learningPaths';
      export * from './src/data/lessons';
      export * from './src/data/lessons/lessonSectionLinks';
      export * from './src/data/lessons/reviewStatus';
      export * from './src/data/practiceLinks';
    `,
    loader: 'tsx', resolveDir: process.cwd(),
  },
  bundle: true, platform: 'node', jsx: 'automatic', packages: 'external', format: 'esm',
  outfile: 'scripts/.cache/lesson-learning-path.mjs', logLevel: 'silent',
});
const {
  LessonLearningPath, PILOT_LEARNING_PATHS, getLessonLearningPath, getLesson, LESSONS,
  getLessonBlocksWithSections, getLessonReviewStatus, PRACTICE_DESTINATIONS,
} = await import('./.cache/lesson-learning-path.mjs');

const ids = ['l3-route-selection', 'l3-arp', 'l3-ospf'];
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
  if (path.practice) {
    assert.ok(path.practice.title.trim() && path.practice.goal.trim(), 'purposeful practice has a title and a goal');
    if (path.practice.kind === 'available') {
      assert.ok(Object.hasOwn(PRACTICE_DESTINATIONS, path.practice.link), 'registered active destination');
      available.push(path.practice.link);
    } else {
      assert.equal(path.practice.kind, 'planned');
      assert.ok(!Object.hasOwn(path.practice, 'link'), 'planned is not a practice route');
      assert.ok(!Object.values(PRACTICE_DESTINATIONS).some(d => d.scenarioId === path.practice.scenarioId));
      assert.ok(readFileSync('docs/development/cli-learning.md', 'utf8').includes(path.practice.scenarioId));
      assert.ok(!readdirSync('src/cli-lab/scenarios').some(file =>
        file.endsWith('.ts') && readFileSync('src/cli-lab/scenarios/' + file, 'utf8').includes(path.practice.scenarioId)));
      planned.push(path.practice.scenarioId);
    }
  }
  for (const mode of ['plain', 'professional']) {
    for (const block of getLessonBlocksWithSections(getLesson(id), mode)) {
      assert.ok(!path.next || block.relatedLesson?.id !== path.next.lessonId, 'do not repeat an existing lesson button');
      assert.ok(path.practice?.kind !== 'available' || block.practiceLink !== path.practice.link, 'do not repeat a live stand button');
    }
  }
}
assert.deepEqual(nextTargets, ['l3-arp']);
assert.deepEqual(available, ['packet']);
assert.equal(PRACTICE_DESTINATIONS.packet.simulator, 'journey');
assert.deepEqual(planned, ['cisco-ospf-basic']);

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
for (const lesson of LESSONS.filter(l => getLessonReviewStatus(l.id) === 'approved')) {
  assert.equal(getLessonLearningPath(lesson.id), undefined);
  assert.equal(render(lesson.id, { onOpenLesson: noop, onOpenPractice: noop }), '');
}
for (const id of ['l3-subnets', 'missing-lesson', 'constructor', '__proto__']) assert.equal(render(id, { onOpenLesson: noop, onOpenPractice: noop }), '');
console.log('PASS: three opt-in next-step examples, exact lesson and practice targets, no duplicate/cycle, no fake CTA or approved-lesson change');

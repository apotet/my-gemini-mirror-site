import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outfile = resolve(root, 'scripts/.cache/study-text-tests.mjs');
mkdirSync(dirname(outfile), { recursive: true });
await build({ stdin: { contents: `
  export { ALL_QUESTIONS } from './src/data/questionsData';
  export { LESSONS } from './src/data/lessons';
  export { getQuestionDeepDive } from './src/data/questionExplanations';
  export { getStudyTextMode, setStudyTextMode, STUDY_TEXT_MODE_KEY } from './src/utils/studyTextMode';
  export { LessonView } from './src/components/LessonView';
  export { TheoryRazbory } from './src/components/TheoryRazbory';
  export { ExamReview } from './src/components/ExamReview';
`, resolveDir: root, sourcefile: 'study-text-tests.ts' },
  bundle: true, platform: 'node', format: 'esm', outfile,
  external: ['react', 'react-dom/server', 'lucide-react'], logLevel: 'silent' });
const api = await import(pathToFileURL(outfile).href);
const { ALL_QUESTIONS, LESSONS, getQuestionDeepDive, getStudyTextMode, setStudyTextMode, STUDY_TEXT_MODE_KEY,
  LessonView, TheoryRazbory, ExamReview } = api;
const { default: React } = await import('react');
const { renderToStaticMarkup } = await import('react-dom/server');
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));

const ids = ['l12-lldp01', 'l12-dot1x01', 'l2-09', 'l12-x01', 'l12-x02', 'l12-d01', 'l12-d05',
  'l2-06', 'l2-07', 'l2-08', 'eth-vlan-benefits', 'l12-x08', 'l12-d03', 'gen-osi-a-5', 'gen-osi-a-6'];
assert.deepEqual(ALL_QUESTIONS.filter(q => getQuestionDeepDive(q).professional).map(q => q.id).sort(), [...ids].sort());
assert.deepEqual(LESSONS.filter(l => l.professional).map(l => l.id).sort(), ['l2-access-auth', 'l2-stp', 'l2-vlan']);
for (const id of ids) {
  const q = ALL_QUESTIONS.find(q => q.id === id), deep = getQuestionDeepDive(q);
  assert.ok(deep.professional.brief && deep.professional.deep);
  assert.match(deep.professional.sourceCommit, /^[a-f0-9]{40}$/);
  assert.equal(deep.deepAnalysis.split(/\n\s*\n/).length, 3, id + ': current plain wording retained');
  assert.notEqual(deep.professional.deep, deep.deepAnalysis);
}
assert.equal(getQuestionDeepDive(ALL_QUESTIONS.find(q => q.id === 'review-dot1x-19')).professional, undefined, 'MISSING history stays missing');

const theoryProps = { onNavigateToIpv4() {}, onNavigateToIpv6() {} };
for (const id of ['l2-access-auth', 'l2-stp', 'l2-vlan']) {
  const l = LESSONS.find(l => l.id === id), html = render(LessonView, { lesson: l, onBack() {} });
  assert.ok(html.includes('Стиль объяснения') && html.includes('По делу'));
  assert.ok(html.includes(l.blocks[0].heading), 'default is meaning, including base');
}
const otherLesson = LESSONS.find(l => !l.professional);
assert.ok(!render(LessonView, { lesson: otherLesson, onBack() {} }).includes('Стиль объяснения'));
const missingHtml = render(TheoryRazbory, { ...theoryProps, initialQuestionId: 'review-dot1x-19' });
assert.ok(!missingHtml.includes('Стиль объяснения'));
for (const id of [...ids, 'review-dot1x-19']) {
  const q = ALL_QUESTIONS.find(q => q.id === id);
  const session = { questions: [q], currentIndex: 0, userAnswers: { [id]: q.correct }, submittedQuestions: { [id]: true },
    startTime: Date.now(), isCompleted: true, mode: 'mixed', feedbackMode: 'exam', difficulty: 'beginner' };
  const html = render(ExamReview, { session, onExit() {} });
  assert.equal(html.includes('Стиль объяснения'), ids.includes(id));
  assert.ok(html.includes('Почему так') && html.includes('Ваш выбор'), 'review/scoring context retained');
}

// A shared tab-session preference survives component remounts and a reloaded module.
assert.equal(getStudyTextMode(), 'meaning', 'SSR/default is meaning');
const data = new Map();
const target = new EventTarget();
target.sessionStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
globalThis.window = target;
assert.equal(getStudyTextMode(), 'meaning');
let notified = 0;
target.addEventListener('osi-study-text-mode-change', () => notified++);
setStudyTextMode('professional');
assert.equal(data.get(STUDY_TEXT_MODE_KEY), 'professional');
assert.equal(getStudyTextMode(), 'professional');
assert.equal(notified, 1);
const reloaded = await import(pathToFileURL(outfile).href + '?reload=1');
assert.equal(reloaded.getStudyTextMode(), 'professional');
render(TheoryRazbory, { ...theoryProps, initialQuestionId: 'review-dot1x-19' });
assert.equal(getStudyTextMode(), 'professional', 'missing text does not reset the choice for the next pilot');
setStudyTextMode('meaning');
assert.equal(getStudyTextMode(), 'meaning');
target.sessionStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
setStudyTextMode('professional');
assert.equal(getStudyTextMode(), 'professional', 'storage-denied fallback still works in the tab');
delete globalThis.window;
console.log('PASS: three pilot lessons/fifteen deep dives, MISSING toggle hidden, default meaning, tab persistence, review UI preserved');

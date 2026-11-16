import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion, formatExplanation,
  formatInlineExplanation, serializeReview, restoreReview, reviewTotals } =
  await bundleEntry('scripts/explanations-test-entry.ts', 'explanations-test.mjs');

const all = new Map(ALL_QUESTIONS.map(question => [question.id, question]));
assert.equal(ALL_QUESTIONS.length, 862);
assert.equal(all.size, ALL_QUESTIONS.length);
const normalized = text => text.toLowerCase().replace(/[\p{P}\p{Z}\p{S}]+/gu, '');
for (const question of ALL_QUESTIONS) {
  const dive = getQuestionDeepDive(question);
  assert.ok(question.explanation?.trim(), question.id + ': missing fallback');
  assert.ok(dive.briefAnswer.trim() && dive.deepAnalysis.trim(), question.id + ': missing explanation');
  const key = normalized(question.correct.map(index => question.answers[index]).join(' '));
  if (key.length > 2) {
    assert.notEqual(normalized(dive.briefAnswer), key, question.id + ': brief repeats the key verbatim');
  }
  for (const text of [dive.briefAnswer, dive.deepAnalysis, dive.professional?.deep].filter(Boolean)) {
    assert.ok(formatExplanation(text).length, question.id + ': formatter dropped all content');
  }
}

const input = [
  'Первая строка\r\nВторая строка', '', '2. Найди IP', '3) Проверь TCP',
  '', '- Запусти команду', '* Сверь MTU', '', '```text', '', '   LISTEN 0 128 0.0.0.0:22', '```',
  'ss -tulpn', 'LISTEN 0 128 0.0.0.0:22', '', 'TCP принимает соединения.',
].join('\n');
assert.deepEqual(formatExplanation(input), [
  { kind: 'paragraph', text: 'Первая строка\nВторая строка' },
  { kind: 'list', ordered: true, start: 2, items: ['Найди IP', 'Проверь TCP'] },
  { kind: 'list', ordered: false, start: 1, items: ['Запусти команду', 'Сверь MTU'] },
  { kind: 'code', text: '\n   LISTEN 0 128 0.0.0.0:22' },
  { kind: 'code', text: 'ss -tulpn\nLISTEN 0 128 0.0.0.0:22' },
  { kind: 'paragraph', text: 'TCP принимает соединения.' },
]);
assert.deepEqual(formatInlineExplanation('-t — TCP, `show ip interface brief`, --help.'), [
  { text: '-t', code: true },
  { text: ' — TCP, ', code: false },
  { text: 'show ip interface brief', code: true },
  { text: ', ', code: false },
  { text: '--help', code: true },
  { text: '.', code: false },
]);

assert.deepEqual(formatExplanation('ip route показывает маршруты.\n\nПример: ip route show default\ndefault via 192.0.2.1 dev eth0'), [
  { kind: 'paragraph', text: 'ip route показывает маршруты.' },
  { kind: 'paragraph', text: 'Пример:' },
  { kind: 'code', text: 'ip route show default\ndefault via 192.0.2.1 dev eth0' },
]);
assert.deepEqual(formatExplanation('- Проверь интерфейс\n  Смотри счётчики\n- Сверь MTU'), [
  { kind: 'list', ordered: false, start: 1, items: ['Проверь интерфейс\nСмотри счётчики', 'Сверь MTU'] },
]);
assert.ok(formatInlineExplanation('Сигнал -15 dBm, ключ --family=inet').some(part => part.text === '--family=inet' && part.code));
assert.ok(formatInlineExplanation('Сигнал -15 dBm').every(part => !part.code));

const get = id => getQuestionDeepDive(all.get(id));
assert.match(get('ts-x05').deepAnalysis, /Status\s+Protocol/);
assert.doesNotMatch(all.get('ts-x05').explanation, /ifconfig/);
assert.equal(getLessonForQuestion('ts-x05').id, 'cli-show-help-tab');
assert.equal(formatExplanation(get('ts-x12').deepAnalysis).filter(block => block.kind === 'code').length, 2);
assert.match(get('ts-x12').deepAnalysis, /tcp\s+LISTEN[\s\S]*udp\s+UNCONN/);
assert.match(get('l3-d01').deepAnalysis, /10\.10\.10\.1 и 10\.10\.10\.2/);
assert.match(get('l3-d02').deepAnalysis, /\.64 \+ 32 = \.96/);
assert.equal(get('l3-16').ipv4Practice, undefined);
assert.equal(get('l3-d03').ipv4Practice, undefined);
assert.equal(get('gen-diag-4').ipv6Practice, undefined);
assert.equal(get('l3-d06').ipv6Practice.targetMode, 'type');
assert.equal(get('review-slaac-4').ipv6Practice.targetMode, 'concept');
assert.equal(get('l3-d01').ipv4Practice.targetPrefix, 30);
assert.equal(get('l3-d01').ipv4Practice.targetMode, 'calc');
assert.equal(getLessonForQuestion('l3-d01').id, 'l3-subnets');
for (let prefix = 25; prefix <= 30; prefix++) {
  const id = 'gen-mask-' + prefix;
  const question = all.get(id);
  const mask = question.answers[question.correct[0]];
  assert.ok(get(id).deepAnalysis.includes(mask), id);
  assert.equal(get(id).ipv4Practice.targetPrefix, prefix);
  assert.equal(getLessonForQuestion(id).id, 'l3-masks');
}

const savedQuestion = { ...all.get('ts-x05'), explanation: 'Старый снимок пояснения' };
const session = { questions: [savedQuestion], userAnswers: { 'ts-x05': [2] },
  submittedQuestions: { 'ts-x05': true }, mode: 'mixed', feedbackMode: 'exam', currentIndex: 0,
  startTime: 1, isCompleted: true, progressEpoch: 'fixture' };
const frozen = serializeReview(session);
const restored = restoreReview(frozen, session.progressEpoch);
getQuestionDeepDive(restored.questions[0]);
assert.equal(serializeReview(restored), frozen);
assert.deepEqual(reviewTotals(restored), { total: 1, correct: 0, wrong: 1, unanswered: 0, percentage: 0 });
console.log(`PASS: ${all.size} questions; formatting, CLI, CIDR, trainer/lesson links and immutable review snapshots`);

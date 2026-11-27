import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';
import { bankBeforeOpticalWordingChange } from './copper-photo-history-fixtures.mjs';

const m = await bundleEntry('scripts/in-depth-entry.ts', 'link-layer-wording.mjs');
const { confirmAnswer, recordConfirmedAnswers } = await bundleEntry('src/utils/examProgress.ts', 'link-layer-progress.mjs');
const { restoreReview, reviewRows, serializeReview } = await bundleEntry('src/utils/examReview.ts', 'link-layer-review.mjs');
const { createProgressStore } = await bundleEntry('src/utils/userProgress.ts', 'link-layer-stats.mjs');
const { PREVIOUS_LINK_LAYER_QUESTION } = await bundleEntry('src/data/inDepth/previousQuestions.ts', 'link-layer-previous.mjs');

const id = 'tcpip-x11';
const question = m.ALL_QUESTIONS.find(q => q.id === id);
const old = { ...question, ...PREVIOUS_LINK_LAYER_QUESTION };
const updatedText = 'Какие поля добавляет Ethernet при передаче IP-пакета?';
const oldText = 'Что добавляет уровень Link при отправке IP-пакета в Ethernet?';
const ethernet = 'Заголовок Ethernet (MAC src/dst) и FCS';
const ttl = 'Только IP TTL';
assert.equal(question.text, updatedText);
assert.equal(old.text, oldText);
assert.equal(bankBeforeOpticalWordingChange(m.ALL_QUESTIONS).find(q => q.id === id).text, oldText);
assert.deepEqual(question.answers, [ethernet, ttl, 'SYN-флаг', 'HTTP Cookie']);
assert.deepEqual(question.answers, old.answers);
assert.deepEqual(question.correct, [0]);
assert.equal(m.QUESTION_LEARNING_LEVELS[id]?.learningLevel, 1);
assert.ok(m.getTestingPool('tcpip', 'beginner').some(q => q.id === id));
assert.equal(m.getLessonForQuestion(id)?.id, 'tcpip-encapsulation');
assert.deepEqual(m.GLOSSARY_TOOLTIPS.Link, {
  english: 'Link Layer', russian: 'Канальный уровень',
  summary: 'В модели TCP/IP это обмен по локальному каналу, например Ethernet или Wi-Fi.',
});
assert.equal(m.GLOSSARY.Link.lessonId, 'tcpip-model');
for (const source of [question, old]) {
  const dive = m.getQuestionDeepDive(source);
  for (const copy of [dive.deepAnalysis, dive.professional.deep]) {
    assert.match(copy, /канальном уровне \(Link Layer\)/i);
    assert.match(copy, /заголовок.*MAC.*FCS/i);
    assert.match(copy, /TTL.*(?:поле|принадлежит) IP/);
    assert.doesNotMatch(copy, /уровень Link|уровне Link/i);
  }
}

const startTime = 1_800_000_000_000;
const now = startTime + 200;
const fixture = (prepared, userAnswers = {}, submittedQuestions = {}, progressEpoch = 'before-wording') => ({
  ...prepared, mode: 'tcpip', difficulty: 'beginner', learningLevel: 1, feedbackMode: 'instant',
  currentIndex: 0, isCompleted: false, startTime, attemptId: 'ethernet-exact', progressEpoch, userAnswers, submittedQuestions,
});
const storeWithActive = active => {
  const items = new Map([['osi_active_session', JSON.stringify(active)]]);
  const storage = { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
  return [createProgressStore(m.ALL_QUESTIONS, () => storage, () => now), items];
};
const answerOrders = new Set();
for (let a = 0; a < 4; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 2; c++) {
  for (const source of [old, question]) {
    const particular = [(a + 0.5) / 4, (b + 0.5) / 3, (c + 0.5) / 2];
    const prepared = m.prepareAttemptQuestions([source], () => particular.shift());
    answerOrders.add(prepared.answerOrders[id].join());
    const displayed = prepared.questions[0];
    const correct = displayed.answers.indexOf(ethernet);
    const wrong = displayed.answers.indexOf(ttl);
    assert.deepEqual(displayed.correct, [correct]);
    for (const index of [correct, wrong]) {
      const chosenRight = index === correct;
      const answered = confirmAnswer(fixture(prepared), [index], now - 1);
      assert.equal(answered.submittedQuestions[id], true);
      const restored = m.restoreSession(JSON.stringify(answered), m.ALL_QUESTIONS, now);
      assert.deepEqual(restored?.questions, prepared.questions);
      assert.deepEqual(restored?.userAnswers[id], [index]);
      const completed = { ...restored, isCompleted: true, endTime: now };
      const raw = serializeReview(completed);
      const review = restoreReview(raw, completed.progressEpoch);
      assert.equal(serializeReview(review), raw, 'finished review preserves its saved wording and order');
      const [row] = reviewRows(review);
      assert.deepEqual(row.question, displayed);
      assert.equal(row.status, chosenRight ? 'correct' : 'wrong');
      assert.equal(row.lesson?.id, 'tcpip-encapsulation');
      const [store, items] = storeWithActive(answered);
      assert.deepEqual([store.summary().answeredCount, store.summary().correctCount], [1, Number(chosenRight)],
        'cold import scores the displayed option even on a shuffled pre-edit attempt');
      const model = store.load();
      assert.equal(model.questions[id].seen, 1);
      const afterImport = items.get('osi_user_progress_v4');
      assert.equal(store.load().questions[id].seen, 1);
      assert.equal(items.get('osi_user_progress_v4'), afterImport, 'viewing does not rewrite imported statistics');
      const receipts = [];
      recordConfirmedAnswers(restored, (...args) => receipts.push(args));
      assert.equal(receipts[0][1], chosenRight);
    }
  }
}
assert.equal(answerOrders.size, 24, 'all four-option permutations exercised');
for (const source of [old, question]) for (const prepared of [
  { questions: [source] }, m.prepareAttemptQuestions([source], () => 0.2),
]) {
  const valid = fixture(prepared, { [id]: [prepared.questions[0].correct[0]] }, { [id]: true });
  assert.deepEqual(m.restoreSession(JSON.stringify(valid), m.ALL_QUESTIONS, now)?.questions, prepared.questions);
  for (const corrupt of [
    snapshot => { snapshot.questions[0].text = 'Неизвестная формулировка'; },
    snapshot => { snapshot.questions[0].answers[1] += ' X'; },
    snapshot => { snapshot.questions[0].correct = [(snapshot.questions[0].correct[0] + 1) % 4]; },
    snapshot => { snapshot.answerOrders = { [id]: [0, 0, 2, 3] }; },
  ]) {
    const invalid = structuredClone(valid);
    corrupt(invalid);
    assert.equal(m.restoreSession(JSON.stringify(invalid), m.ALL_QUESTIONS, now), null);
    assert.equal(storeWithActive(invalid)[0].summary().answeredCount, 0);
  }
}
console.log('PASS: exact old/new Ethernet stem, 24 shuffles × both stems × FCS/TTL scoring, historical review, cold stats and tooltip');

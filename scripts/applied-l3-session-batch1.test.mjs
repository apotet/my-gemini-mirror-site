import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';

const expected = {
  "gen-transport-0": {
    "answer": "TCP: сервер 80 → клиент 51000",
    "lesson": "l4-applied-tcp-session-flows"
  },
  "gen-transport-2": {
    "answer": "После аутентификации открыть отдельные каналы оболочки и SFTP в одном транспортном соединении; закрытие канала оболочки не закрывает канал SFTP",
    "lesson": "l4-applied-tcp-session-flows"
  },
  "gen-transport-3": {
    "answer": "TCP: клиент 52000 → сервер 2323",
    "lesson": "l4-applied-tcp-session-flows"
  },
  "gen-transport-4": {
    "answer": "Открыть второе TCP-соединение к серверу 50010 для файла, оставив управляющий обмен на TCP 21",
    "lesson": "l4-applied-tcp-session-flows"
  },
  "gen-port-9": {
    "answer": "Отбросить пакет и отправить ERROR с кодом 5 на порт 41000, не прекращая исходную передачу с 40000",
    "lesson": "l7-udp-transactions-tftp-ntp-snmp"
  },
  "gen-transport-9": {
    "answer": "Запрос — на сервер 69, подтверждение — на сервер 40000",
    "lesson": "l7-udp-transactions-tftp-ntp-snmp"
  },
  "gen-transport-10": {
    "answer": "TCP: клиент 54000 → сервер 110",
    "lesson": "l4-applied-tcp-session-flows"
  },
  "gen-transport-11": {
    "answer": "UDP: сервер 123 → клиент 45000",
    "lesson": "l7-udp-transactions-tftp-ntp-snmp"
  },
  "gen-transport-12": {
    "answer": "TCP-соединение к серверу 143",
    "lesson": "l4-applied-tcp-session-flows"
  },
  "gen-port-13": {
    "answer": "GetBulk с non-repeaters=0 и max-repetitions=10",
    "lesson": "l7-udp-transactions-tftp-ntp-snmp"
  },
  "gen-transport-13": {
    "answer": "С UDP 161 на порт менеджера 55000",
    "lesson": "l7-udp-transactions-tftp-ntp-snmp"
  },
  "gen-transport-15": {
    "answer": "TCP к серверу 389, с последовательными LDAP-операциями внутри соединения",
    "lesson": "l4-applied-tcp-session-flows"
  }
};
const ids = Object.keys(expected);
const registry = JSON.parse(readFileSync(new URL('../src/data/questionLearningLevels.json', import.meta.url), 'utf8'));
const { ALL_QUESTIONS, getQuestionDeepDive, getLessonForQuestion, GLOSSARY, GLOSSARY_TOOLTIPS, splitGlossaryText } =
  await bundleEntry('scripts/learning-level-exam-entry.ts', 'applied-l3-session-live.mjs');
const { APPLIED_L3_SESSION_PRO } =
  await bundleEntry('src/data/appliedL3SessionPro.ts', 'applied-l3-session-pro.mjs');
const { APPLIED_INDIVIDUAL_DEEP } =
  await bundleEntry('src/data/questionExplanationsApplied.ts', 'applied-l3-source-plain.mjs');

assert.equal(ids.length, 12, 'first L3 batch has exactly 12 ids');
assert.deepEqual(Object.keys(APPLIED_L3_SESSION_PRO).sort(), ids.slice().sort(),
  'no unrelated content overridden');
assert.equal(Object.values(registry).filter(x => x.status === 'ASSIGNED' && x.learningLevel === 3).length,
  376, 'registry maintains original 376 L3 questions');

const seen = new Set();
for (const id of ids) {
  const { answer, lesson: lessonId } = expected[id];
  assert.equal(registry[id]?.status, 'ASSIGNED', id + ' registered');
  assert.equal(registry[id]?.learningLevel, 3, id + ' is L3, not Codex L2');
  const q = ALL_QUESTIONS.find(item => item.id === id);
  assert.ok(q, id + ' exists in live bank');
  assert.deepEqual(q.correct.map(index => q.answers[index]), [answer], id + ' approved key unchanged');

  const source = APPLIED_INDIVIDUAL_DEEP[id];
  assert.ok(source?.brief && source.deep && source.trap, id + ' original curated plain preserved');
  assert.equal(source.pro, undefined, id + ' original lacks pro, no reviewed pro is overwritten');
  const pro = APPLIED_L3_SESSION_PRO[id];
  assert.ok(pro.length >= 480 && pro.includes('\n\n'), id + ' standalone technical pro');

  const deep = getQuestionDeepDive(q);
  assert.equal(deep.hasIndividualDeep, true, id + ' individual explanation active');
  assert.equal(deep.briefAnswer, source.brief, id + ' original why preserved');
  assert.equal(deep.deepAnalysis, source.deep, id + ' original plain preserved');
  assert.equal(deep.pro, pro, id + ' new professional resolver');
  assert.equal(deep.professional?.deep, pro, id + ' professional UI resolver');
  assert.equal(deep.commonTrap, source.trap, id + ' individual trap preserved');
  assert.deepEqual(deep.practiceLink, source.practiceLink, id + ' no invented practice');
  assert.notEqual(deep.deepAnalysis, deep.pro, id + ' professional is independent');

  const lesson = getLessonForQuestion(id);
  assert.equal(lesson?.id, lessonId, id + ' exact relevant linked lesson');
  assert.ok(lesson.relatedQuestionIds.includes(id), id + ' return link');
  assert.ok(lesson.blocks.length >= 4 && lesson.professional?.blocks?.length >= 4, id + ' two lesson styles');
  assert.ok(lesson.blocks.every(block => block.body.length > 280), id + ' plain teaches mechanisms');
  assert.ok(lesson.professional.blocks.every(block => block.body.length > 320), id + ' pro teaches mechanisms');
  for (const term of new Set([...lesson.terms, ...lesson.professional.terms])) {
    assert.ok(GLOSSARY[term]?.description, lesson.id + ' glossary term ' + term);
  }
  seen.add(lesson.id);
}
assert.deepEqual([...seen].sort(), ['l4-applied-tcp-session-flows','l7-udp-transactions-tftp-ntp-snmp']);
const newGlossaryTerms = {
  'SFTP': 'l4-applied-tcp-session-flows',
  'PASV': 'l4-applied-tcp-session-flows',
  'STARTTLS': 'l4-applied-tcp-session-flows',
  'GetBulk': 'l7-udp-transactions-tftp-ntp-snmp',
  'LDAP Bind': 'l4-applied-tcp-session-flows',
  'LDAP Search': 'l4-applied-tcp-session-flows',
};
for (const [term, lessonId] of Object.entries(newGlossaryTerms)) {
  assert.equal(GLOSSARY[term]?.lessonId, lessonId, term + ' glossary destination');
  const tooltip = GLOSSARY_TOOLTIPS[term];
  assert.ok(tooltip?.english && tooltip?.russian && tooltip?.summary, term + ' inline tooltip metadata');
  assert.ok(splitGlossaryText('Проверка: ' + term + '.').some(part => part.term === term), term + ' inline token');
  const lesson = [...seen].includes(lessonId) && [...ALL_QUESTIONS].some(q => expected[q.id]?.lesson === lessonId)
    ? getLessonForQuestion(Object.keys(expected).find(id => expected[id].lesson === lessonId)) : null;
  assert.equal(lesson?.id, lessonId, term + ' linked existing lesson');
  for (const mode of [lesson, lesson.professional]) {
    assert.ok(mode.terms.includes(term), lessonId + ' style exposes glossary tag ' + term);
    assert.ok(mode.blocks.some(b => splitGlossaryText(b.heading + ' ' + b.body).some(part => part.term === term)),
      lessonId + ' style has a working inline glossary token ' + term);
  }
}
assert.ok(!splitGlossaryText('Search and Bind are generic English words')
  .some(part => ['LDAP Bind', 'LDAP Search'].includes(part.term)), 'LDAP term scope does not leak to generic words');

const l2 = ALL_QUESTIONS.filter(q => registry[q.id]?.status === 'ASSIGNED' && registry[q.id]?.learningLevel === 2);
assert.equal(l2.length, 164, 'L2 grows only through the separate four-ID L1->L2 review');
for (const id of ['l3-d05', 'l4-d03', 'l4-d05', 'tcpip-d05']) {
  assert.ok(l2.some(question => question.id === id), id + ' moved to L2');
}
console.log('PASS: 12 L3 source keys unchanged; 12 individual pro + existing plain/trap; 2 two-style lessons and reverse links; 164 L2 after the separate semantic review');

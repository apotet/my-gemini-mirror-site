import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';

const { ALL_QUESTIONS, getLesson, getLessonForQuestion, LESSONS,
  QUESTION_SECTION_LINKS, getLessonBlocksWithSections, getLessonSectionForQuestion } =
  await bundleEntry('scripts/lesson-section-links-entry.ts', 'lesson-section-links.mjs');

assert.equal(ALL_QUESTIONS.length, 860, 'existing question bank is unchanged');
assert.ok(QUESTION_SECTION_LINKS.length >= 3, 'three approved spotlights remain alongside reviewed L2 sections');
const expectedTexts = {
  'photo-otdr-end': 'Что обычно означает резкий спад трассы с переходом в шум в конце линии на рефлектограмме?',
  'gen-osi-a-19': 'Перед подключением к files.example.test программа сформировала сообщение службе имён с этим именем и типом A. В ответ пришёл код NXDOMAIN, после чего попытка подключения по полученному адресу не началась. Какая функция сформировала запрос и определила смысл такого ответа?',
  'tcp-06': 'Какие поля обычно остаются сквозными от клиента до сервера без NAT и прокси? Выберите все подходящие.',
};
const expected = [
  ['photo-otdr-end', 'l1-otdr-trace-interpretation', 'otdr-end-of-fiber', 'шум'],
  ['gen-osi-a-19', 'l7-dns', 'dns-nxdomain-application', 'NXDOMAIN'],
  ['tcp-06', 'tcpip-model', 'tcpip-end-to-end-fields', 'MAC'],
];
for (const [questionId, lessonId, anchor, concept] of expected) {
  assert.ok(ALL_QUESTIONS.some(q => q.id === questionId), questionId + ': must be in the real bank');
  assert.equal(ALL_QUESTIONS.find(q => q.id === questionId)?.text, expectedTexts[questionId],
    questionId + ': original question wording is unchanged');
  const lesson = getLesson(lessonId);
  assert.ok(lesson?.professional?.blocks?.length, lessonId + ': two-mode lesson already exists');
  assert.equal(getLessonForQuestion(questionId)?.id, lessonId, questionId + ': correct resolved lesson');
  assert.equal(lesson.relatedQuestionIds.filter(id => id === questionId).length, 1, questionId + ': do not duplicate related ID');
  assert.equal(getLessonSectionForQuestion(lessonId, questionId), anchor, questionId + ': exact paragraph');
  assert.equal(getLessonSectionForQuestion('other-lesson', questionId), undefined, 'never target an unrelated lesson');
  const before = JSON.stringify(lesson);
  for (const mode of ['plain', 'professional']) {
    const blocks = getLessonBlocksWithSections(lesson, mode);
    const matching = blocks.filter(b => b.anchorId === anchor);
    assert.equal(matching.length, 1, questionId + ': one stable anchor in ' + mode);
    assert.ok(matching[0].heading.length >= 14 && matching[0].body.length >= 200, 'substantial section: ' + questionId + '/' + mode);
    assert.ok(matching[0].body.includes(concept), 'mechanism covered: ' + questionId + '/' + mode);
    const meta = QUESTION_SECTION_LINKS.find(row => row.anchorId === anchor);
    const intendedHeading = meta.afterHeading[mode];
    const originalBlocks = mode === 'professional' ? lesson.professional.blocks : lesson.blocks;
    assert.ok(originalBlocks.some(block => block.heading === intendedHeading),
      'expected exact source heading exists: ' + lessonId + '/' + mode);
    const beforeIndex = blocks.findIndex(block => block.heading === intendedHeading);
    assert.equal(blocks.findIndex(block => block.anchorId === anchor), beforeIndex + 1,
      'target paragraph must immediately follow reviewed heading: ' + questionId + '/' + mode);
  }
  assert.equal(JSON.stringify(lesson), before, 'original authored lesson must not be mutated');
}
const anchors = QUESTION_SECTION_LINKS.map(row => row.anchorId);
assert.equal(new Set(anchors).size, anchors.length, 'anchors are unique');
assert.equal(getLessonSectionForQuestion('l7-dns', 'nonexistent-id'), undefined, 'unknown question has no fake target');
assert.equal(getLessonSectionForQuestion('l7-dns', null), undefined);
for (const lesson of LESSONS) {
  if (!QUESTION_SECTION_LINKS.some(section => section.lessonId === lesson.id)) {
    assert.deepEqual(getLessonBlocksWithSections(lesson, 'plain'), lesson.blocks, 'unrelated lesson remains unchanged: ' + lesson.id);
  }
}
console.log('PASS: three real questions link to an exact paragraph in both modes; other lessons and bank unchanged');

// Worked IPv4 examples have one canonical target in each reading mode.
const routeExamples = [
  {
    q: 'gap-pack1-02', key: [1], lessonId: 'l3-route-selection', anchor: 'lpm-withdrawal-c-to-b',
    headings: ['Пример: почему путь к 10.44.6.180 меняется с C на B', 'LPM для 10.44.6.180: /25 через C, затем /24 через B'],
    plain: [/сначала пакеты идут через C/, /теперь пакеты идут через B/i, /установленных маршрутов/],
    professional: [/10\.44\.6\.180/, /\/25 via C/, /\/24 via B, а не \/16 via A/, /RFC 1812 §5\.2\.4\.3/,
      /разные источники предлагают один и тот же префикс/, /Метрика обычно сравнивает пути внутри одного протокола/],
  },
  {
    q: 'new-l3-next-hop', key: [0], lessonId: 'l3-route-selection', anchor: 'recursive-ipv4-next-hop-arp',
    headings: ['Пример: кому передать кадр для 203.0.113.77', 'Рекурсивное разрешение next hop: 10.0.0.9 → 192.0.2.2 на eth1'],
    plain: [/10\.0\.0\.9\/32/, /192\.0\.2\.0\/24 на eth1/, /ARP на eth1 именно про 192\.0\.2\.2/, /IP назначения.*останется 203\.0\.113\.77/s],
    professional: [/203\.0\.113\.0\/24 via 10\.0\.0\.9/, /10\.0\.0\.9\/32 via 192\.0\.2\.2/, /Отдельный шаг/,
      /ARP Request с Target Protocol Address 192\.0\.2\.2 \(RFC 826\)/, /IPv4 Destination Address остаётся 203\.0\.113\.77/],
  },
  {
    q: 'gen-bc-26-1', key: [0], lessonId: 'l3-subnets', anchor: 'ipv4-26-on-link-gateway',
    headings: ['Пример: подходит ли шлюз 192.168.60.190 для хоста с /26', '192.168.60.128/26: on-link шлюз и выбор MAC'],
    plain: [/192\.168\.60\.190 и хост 192\.168\.60\.130/, /\.129–\.190, широковещательный адрес \.191/,
      /Для удалённого.*если выбран маршрут.*MAC шлюза/, /не доказывает/],
    professional: [/255\.255\.255\.192/, /192\.168\.60\.128; broadcast — 192\.168\.60\.191/,
      /Для локального адресата next hop — его собственный IP, для off-link назначения по default — 192\.168\.60\.190/,
      /MAC самого получателя, во втором — MAC шлюза/, /не гарантирует доступность на L2/],
  },
];
const modes = ['plain', 'professional'];
const registry = JSON.parse(readFileSync('src/data/questionLearningLevels.json', 'utf8'));
for (const row of routeExamples) {
  const lesson = getLessonForQuestion(row.q);
  assert.equal(registry[row.q]?.learningLevel, 3);
  assert.deepEqual(ALL_QUESTIONS.find(q => q.id === row.q)?.correct, row.key);
  assert.equal(lesson?.id, row.lessonId);
  assert.deepEqual(LESSONS.filter(item => item.relatedQuestionIds.includes(row.q)).map(item => item.id), [row.lessonId]);
  assert.equal(getLessonSectionForQuestion(row.lessonId, row.q), row.anchor);
  assert.equal(getLessonSectionForQuestion(row.lessonId), undefined, 'direct lesson has no preselected question anchor');
  assert.deepEqual(QUESTION_SECTION_LINKS.filter(link => link.questionIds.includes(row.q)).map(link => link.anchorId), [row.anchor]);
  for (const [index, mode] of modes.entries()) {
    const blocks = getLessonBlocksWithSections(lesson, mode).filter(block => block.anchorId === row.anchor);
    assert.equal(blocks.length, 1, row.q + '/' + mode);
    assert.equal(blocks[0].heading, row.headings[index]);
    assert.doesNotMatch(blocks[0].body, /5\.2\.4\.4/, 'the example does not attribute platform recursion to that RFC section');
    for (const phrase of row[mode]) assert.match(blocks[0].body, phrase, row.q + '/' + mode);
  }
}

const routeLesson = getLesson('l3-route-selection');
const revised = 'Установленный default 0.0.0.0/0 совпадает с любым адресом, но выигрывает только при отсутствии пригодного более длинного совпадения.';
assert.ok(routeLesson.professional.blocks[0].body.includes(revised));
console.log('PASS: three worked IPv4 examples in both modes, unique ownership and exact anchors');

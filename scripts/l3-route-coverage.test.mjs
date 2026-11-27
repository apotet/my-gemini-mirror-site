import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const m = await bundleEntry('scripts/in-depth-entry.ts', 'l3-route-coverage.mjs');
const rows = [
  {
    id: 'l3-03', key: [1], lesson: 'l3-arp', anchor: 'arp-local-or-gateway-mac',
    headings: ['Для соседа и для далёкого узла нужны разные получатели', 'Локальный IP или удалённая сеть'],
    facts: [[/192\.0\.2\.20 \(L\)/, /192\.0\.2\.1 \(G\)/, /сервера 198\.51\.100\.20 через шлюз — G/, /обе записи пригодны/],
      [/192\.0\.2\.20 и Destination MAC L/, /198\.51\.100\.20.*192\.0\.2\.1.*Destination MAC G/, /новый ARP Request не требуется/]],
  },
  {
    id: 'l3-05', key: [0], lesson: 'l3-route-selection', anchor: 'in-depth-existing-l3-16',
    headings: ['Сначала совпадение, затем самая длинная маска', 'RIB/FIB, route selection и разрешение next hop'],
    facts: [[/10\.0\.5\.20.*10\.0\.0\.0\/16 через A.*10\.0\.5\.0\/24 через B/, /Выбирается \/24 через B/],
      [/10\.0\.5\.20.*10\.0\.0\.0\/16 via A.*10\.0\.5\.0\/24 via B/, /по LPM выбирается \/24 via B/]],
  },
  {
    id: 'gen-osi-a-8', key: [0], lesson: 'l3-route-selection', anchor: 'lpm-more-specific-despite-metric',
    headings: ['Пример: /25 выигрывает даже с большей метрикой', 'Установленные маршруты: /25 против /24, /16 и default'],
    facts: [[/уже установлены \/16, \/24, \/25 и маршрут по умолчанию/, /10\.40\.8\.128\/25 через 192\.0\.2\.3/, /метрика 200.*default с метрикой 1/, /записи остаются в таблице/],
      [/FIB: 10\.40\.8\.200.*10\.40\.8\.128\/25 и 0\.0\.0\.0\/0/, /next hop — 192\.0\.2\.3/, /Metric 200 у \/25.*metric 1 у default/, /без изменения таблицы/]],
  },
  {
    id: 'gap-pack1-01', key: [2], lesson: 'l3-route-selection', anchor: 'rib-ad-same-prefix',
    headings: ['Два источника предлагают маршрут к одной сети', 'Установка маршрута в RIB: административная дистанция для одного префикса'],
    facts: [[/одну и ту же сеть 10\.70\.8\.0\/24/, /через A административная дистанция 5.*OSPF через B — 110/, /устанавливается путь через A/, /Метрики 80 и 10.*не сравнивают/, /для пакета будет отдельным шагом/],
      [/одного префикса 10\.70\.8\.0\/24/, /заданной AD: 5 < 110/, /значения 80 и 10 из разных источников.*не сопоставимы/, /не создаёт ECMP/, /FIB использует LPM/]],
  },
];

for (const row of rows) {
  const question = m.ALL_QUESTIONS.find(q => q.id === row.id);
  assert.deepEqual(question?.correct, row.key);
  assert.equal(m.QUESTION_LEARNING_LEVELS[row.id]?.learningLevel, 3);
  const lesson = m.getLessonForQuestion(row.id);
  assert.equal(lesson?.id, row.lesson);
  assert.deepEqual(m.LESSONS.filter(l => l.relatedQuestionIds.includes(row.id)).map(l => l.id), [row.lesson]);
  assert.equal(m.getLessonSectionForQuestion(row.lesson, row.id), row.anchor);
  assert.deepEqual(m.QUESTION_SECTION_LINKS.filter(link => link.questionIds.includes(row.id)).map(link => link.anchorId), [row.anchor]);
  assert.equal(m.getLessonSectionForQuestion(row.lesson), undefined, 'catalog view has no selected question');
  for (const [index, mode] of ['plain', 'professional'].entries()) {
    const hits = m.getLessonBlocksWithSections(lesson, mode).filter(b => b.anchorId === row.anchor);
    assert.equal(hits.length, 1);
    assert.equal(hits[0].heading, row.headings[index]);
    for (const fact of row.facts[index]) assert.match(hits[0].body, fact, row.id + '/' + mode);
    if (row.id === 'gen-osi-a-8') assert.doesNotMatch(hits[0].body, /(?:удален|удалён|withdrawal)/i);
  }
}

for (const [id, lesson, anchor] of [
  ['l3-16', 'l3-route-selection', 'in-depth-connected-vs-default-only'],
  ['l3-d08', 'l3-route-selection', 'ecmp-flow-hash-order'],
  ['l3-d07', 'l3-arp', 'proxy-arp-masks-network-error'],
  ['gap-pack1-02', 'l3-route-selection', 'lpm-withdrawal-c-to-b'],
  ['new-l3-next-hop', 'l3-route-selection', 'recursive-ipv4-next-hop-arp'],
  ['gen-bc-26-1', 'l3-subnets', 'ipv4-26-on-link-gateway'],
  ['gen-net-25-4', 'l3-subnets', 'cidr-contiguous-mask-validation'],
  ['ts-pack1-15', 'l3-mtu-mss-fragmentation', 'mtu-local-pmtu-cache'],
]) {
  assert.equal(m.getLessonForQuestion(id)?.id, lesson);
  assert.equal(m.getLessonSectionForQuestion(lesson, id), anchor);
  for (const mode of ['plain', 'professional']) {
    assert.equal(m.getLessonBlocksWithSections(m.getLesson(lesson), mode).filter(b => b.anchorId === anchor).length, 1);
  }
}
console.log('PASS: four exact Applied IPv4 anchors in both modes; historical, /26, CIDR and PMTU anchors unchanged');

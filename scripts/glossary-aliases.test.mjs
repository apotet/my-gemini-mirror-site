import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const { GLOSSARY, GLOSSARY_TOOLTIPS, splitGlossaryText, ALL_QUESTIONS, LESSONS, QUESTION_LEARNING_LEVELS,
  getQuestionDeepDive, getLessonForQuestion, getLesson, getLessonBlocksWithSections } = await bundleEntry('scripts/in-depth-entry.ts', 'glossary-aliases.mjs');

const marked = (text, scope) => {
  const parts = splitGlossaryText(text, scope);
  assert.equal(parts.map(part => part.text).join(''), text, 'matcher preserves rendered text byte for byte');
  return parts.filter(part => part.term).map(part => [part.text, part.term]);
};

const phrase = 'Power over Ethernet';
for (const scope of [undefined, 'poe', 'poe-formula', 'ipv6', 'http']) {
  assert.deepEqual(marked(phrase, scope), [[phrase, 'PoE']]);
  assert.deepEqual(marked('Ethernet', scope), [['Ethernet', 'Ethernet']]);
  assert.deepEqual(marked('Passive Power over Ethernet; Power over Ethernet Plus; Power over Ethernet Plus (IEEE 802.3at)', scope), [
    ['Passive Power over Ethernet', 'passive PoE'],
    ['Power over Ethernet Plus', 'PoE+'],
    ['Power over Ethernet Plus (IEEE 802.3at)', 'PoE+'],
  ]);
}
assert.deepEqual(marked('**Power\u00a0over\r\nEthernet** — POWER  SOURCING EQUIPMENT; Powered\tDevice'), [
  ['Power\u00a0over\r\nEthernet', 'PoE'], ['POWER  SOURCING EQUIPMENT', 'PSE'], ['Powered\tDevice', 'PD'],
]);
for (const near of [
  'UltraPower over Ethernet', 'Power over Ethernets', 'Wireless-Power over Ethernet',
  'Power over Ethernet-like', 'Power over Ethernet2', 'Power over Ethernet\u0301',
  'Power over\r\n\r\nEthernet', 'power over Wi-Fi', 'PoE++', 'PoE-тестеромX',
]) assert.ok(!marked(near).some(([, term]) => term === 'PoE' || term === 'PoE+'), near);
for (const near of ['Powered DevicesX', 'Battery-Powered Device', 'Power Sourcing Equipments', 'PSE_X', 'xPD'])
  assert.ok(!marked(near).some(([, term]) => term === 'PSE' || term === 'PD'), near);
assert.deepEqual(marked('PoE/PSE/PD'), [['PoE', 'PoE'], ['PSE', 'PSE'], ['PD', 'PD']]);
assert.deepEqual(marked('PoE Tester, PoE-тестером'), [['PoE Tester', 'PoE-тестер'], ['PoE-тестером', 'PoE-тестером']]);
assert.deepEqual(marked('Visual Fault Locator; Solid conductor; Optical Power Meter; Insulation Displacement Contact'), [
  ['Visual Fault Locator', 'VFL'], ['Solid conductor', 'solid'], ['Optical Power Meter', 'оптический измеритель мощности'], ['Insulation Displacement Contact', 'IDC'],
]);
assert.deepEqual(marked('Link Layer Discovery Protocol, Link Layer, Transport Layer Security, Internet Protocol Version 4'), [
  ['Link Layer Discovery Protocol', 'LLDP'], ['Link Layer', 'Link'], ['Transport Layer Security', 'TLS'], ['Internet Protocol Version 4', 'IPv4'],
]);
assert.deepEqual(marked('Link Up, Permanent Link, link fault'), [['Link Up', 'Link Up']]);
assert.deepEqual(marked('Link Up', 'poe'), [['Link Up', 'link up']]);
assert.deepEqual(marked('U/UTP, F/UTP, U/FTP, S/FTP, X/FTP, X/SFTP; FTP/SFTP/TFTP').map(([, term]) => term),
  ['U/UTP', 'F/UTP', 'U/FTP', 'S/FTP', 'FTP', 'SFTP', 'TFTP']);
for (const text of ['В колонке A, контакт B', 'Cat6 без A', 'A connector', 'LAN A', 'A–B', 'S/FTP/A', 'Mode A', '5 A'])
  assert.ok(!marked(text).some(([, term]) => term === 'A' || term === 'A flag'), text);
assert.deepEqual(marked('Запись A; A и AAAA; DNS A.', 'ipv6').map(([, term]) => term), ['A', 'A', 'AAAA', 'DNS', 'A']);
assert.equal(marked('В DNS хранится запись A. Результат запроса типа A может содержать 192.0.2.10.').filter(([, term]) => term === 'A').length, 2);
assert.equal(marked('Сведения SPF публикуют в TXT, а IPv4-адрес — в A.').filter(([, term]) => term === 'A').length, 1);
const anchored = (text, fragment, scope) => {
  assert.ok(text?.includes(fragment), 'live source must contain: ' + fragment);
  const offset = text.indexOf(fragment) + fragment.match(/(?<![A-Z])A(?![A-Z])/u).index;
  let cursor = 0;
  const at = splitGlossaryText(text, scope).filter(part => {
    const hit = cursor === offset && part.text === 'A' && part.term === 'A';
    cursor += part.text.length;
    return hit;
  });
  assert.equal(at.length, 1, 'preserve genuine DNS A: ' + fragment);
};
const live = id => getQuestionDeepDive(ALL_QUESTIONS.find(q => q.id === id));
const outsideDns = (text, phrase, scope) => {
  assert.ok(text?.includes(phrase), 'live source must contain: ' + phrase);
  const offset = text.indexOf(phrase) + phrase.match(/(?<![A-Z])A(?![A-Z])/u).index;
  let cursor = 0;
  for (const part of splitGlossaryText(text, scope)) {
    if (cursor === offset) assert.ok(part.term !== 'A' && part.term !== 'A flag', phrase);
    cursor += part.text.length;
  }
};
outsideDns(live('l1v2-a-outlet-b').deepAnalysis, 'A — зелёным');
outsideDns(live('photo-txrx-link').professional.deep, 'TX(A)', undefined);
outsideDns(live('photo-txrx-link').professional.deep, 'RX(A)', undefined);
outsideDns(live('l1-05').professional.deep, '100 Full объявлен только A');
outsideDns(live('gen-transport-5').deepAnalysis, 'сервер A открывает TCP');

const lessonBody = (id, snippet) => {
  const lesson = getLesson(id);
  return [...lesson.blocks, ...(lesson.professional?.blocks ?? [])].find(block => block.body.includes(snippet))?.body;
};
anchored(live('l7-04').professional.deep, 'web.example.test A 192.0.2.40');
anchored(live('l7-04').commonTrap, 'Не путать A с AAAA');
anchored(lessonBody('l7-dns', 'A содержит IPv4-адрес, AAAA'), 'A содержит IPv4-адрес, AAAA');
anchored(lessonBody('l7-dns-dhcp', 'A для IPv4-адреса'), 'A для IPv4-адреса');
anchored(live('l57-d03').professional.deep, 'двумя A-записями');
anchored(live('l57-d03').commonTrap, 'двух A-записей');
anchored(live('diag177-dns-secondary-serial').professional.deep, 'Сравни A и SOA');
anchored(live('gen-osi-a-19').deepAnalysis, 'вопрос A для files.example.test');
anchored(live('gen-osi-a-19').commonTrap, 'с отсутствием только A');
anchored(live('new-l7-dns').professional.deep, 'origin.example.test A указан 192.0.2.80');
anchored(live('gap-pack2-11').practicalTip, 'Адресную запись A запрашивай');
anchored(live('gap-pack3-11').deepAnalysis, 'а его A в Additional');
anchored(live('gap-pack3-11').deepAnalysis, 'до получения конечной A');
anchored(live('gap-pack3-11').professional.deep, 'glue A=192.0.2.53');
anchored(live('gap-pack3-11').professional.deep, 'Glue A относится к NS');
anchored(live('gap-pack3-12').professional.deep, 'QTYPE=A');
anchored(live('gap-pack2-19').professional.deep, 'whose A=192.0.2.20');
anchored(live('gap-pack2-19').professional.deep, 'fallback на A самого example.test');
anchored(live('l57-x20').professional.deep, 'api.example.test, A, IN');
anchored(live('l57-x20').commonTrap, 'подменять A на AAAA');
anchored(live('l57-x20').professional.deep, 'завершения ожидающей транзакции A');
anchored(live('gap-pack3-12').commonTrap, 'успешным отсутствием A');
assert.ok(marked(live('review-slaac-5').commonTrap, 'ipv6').some(([label, term]) => label === 'A' && term === 'A flag'));
anchored(live('l57-x02').professional.deep, 'Положительная запись A');
anchored(live('l7-new-01').professional.deep, 'наличие A на первом при NXDOMAIN');
anchored(live('l7-new-03').practicalTip, 'При изменённом A RRset');
anchored(live('l7-04').keyTakeaways.join(' '), 'A задаёт IPv4-адрес');
anchored(live('gap-pack2-11').keyTakeaways.join(' '), 'адрес A остаётся отдельным результатом');
const activeDnsBlocks = ['plain', 'professional'].flatMap(mode => getLessonBlocksWithSections(getLesson('l7-dns'), mode));
for (const snippet of [
  'Запрос A и NXDOMAIN', 'DNS-запись типа A', 'QTYPE=A требует', 'QTYPE=A. DNS-ответ',
  'обычный A-запрос', 'Известная запись A с IPv4-адресом', 'RRset A', 'dig files.example.test A',
]) {
  const field = activeDnsBlocks.flatMap(block => [block.heading, block.body]).find(text => text.includes(snippet));
  anchored(field, snippet);
}
const flagLessonField = getLessonBlocksWithSections(getLesson('l3-ipv6'), 'professional')
  .find(block => block.body.includes('A регулирует autonomous address configuration'));
assert.ok(flagLessonField && marked(flagLessonField.body, 'ipv6').some(([label, term]) => label === 'A' && term === 'A flag'));
for (const row of ['test.example. 60 IN A 192.0.2.1', 'test.example IN 60 A 192.0.2.1', '@ IN A 192.0.2.1'])
  anchored(row, 'A 192.0.2.1');
for (const notRecord of [
  'DNS проверен. Выход через порт A на коммутаторе.',
  'A connector and a switch.', 'Запись старого варианта A не относится к DNS.',
  'A содержит адрес интерфейса, B содержит VLAN.', 'test.example A 192.0.2.999', '192.0.2.1 A 192.0.2.2',
  'test.example TXT A 192.0.2.1', 'DNS проверен. Запись A в журнале.', 'вариант A относится к DHCP',
]) assert.ok(!marked(notRecord).some(([, term]) => term === 'A'), notRecord);
assert.deepEqual(marked('Флаг A; A=1; L=0; A/L', 'ipv6').map(([, term]) => term), ['A flag', 'A=1', 'L=0', 'A/L']);
assert.deepEqual(marked('A=1; A flag; Used; Class'), []);
assert.deepEqual(marked('Used; Class', 'poe').map(([, term]) => term), ['Used', 'Class']);
assert.deepEqual(marked('ΔU = I × R', 'poe-formula').map(([, term]) => term), ['ΔU', 'I', 'R']);
assert.deepEqual(marked('ΔU = I × R', 'poe'), []);
for (const term of ['PoE', 'PSE', 'PD']) {
  assert.equal(GLOSSARY[term].lessonId, 'l1-poe-budget');
  assert.ok(LESSONS.some(lesson => lesson.id === GLOSSARY[term].lessonId));
  assert.match(GLOSSARY_TOOLTIPS[term].summary, /питан/i);
}
assert.match(GLOSSARY_TOOLTIPS.PSE.summary, /подающе/);
assert.match(GLOSSARY_TOOLTIPS.PD.summary, /получающе/);
assert.doesNotMatch(GLOSSARY_TOOLTIPS.Ethernet.summary, /питани/);

const byId = id => ALL_QUESTIONS.find(q => q.id === id);
const realQ = byId('review-poe-29');
assert.equal(QUESTION_LEARNING_LEVELS[realQ.id].learningLevel, 1);
assert.equal(getLessonForQuestion(realQ.id)?.id, 'l1-poe-screen-reading');
const explanation = getQuestionDeepDive(realQ).deepAnalysis;
assert.deepEqual(marked(explanation, 'poe').find(([text]) => text === phrase), [phrase, 'PoE']);
assert.deepEqual(marked(explanation.slice(explanation.indexOf(phrase), explanation.indexOf(phrase) + phrase.length), 'poe'), [[phrase, 'PoE']]);
for (const id of ['l1v2-a-outlet-a', 'l1v2-a-mark-cat6a']) {
  assert.ok(!marked(getQuestionDeepDive(byId(id)).deepAnalysis, 'poe').some(([, term]) => term === 'A'), id);
}
console.log('PASS: canonical longest aliases, exact PoE/PSE/PD, DNS/RA and PoE scopes, cable suffixes, whitespace and real Base review prose');

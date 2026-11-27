import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const m = await bundleEntry('scripts/in-depth-entry.ts', 'russian-professional-reviews.mjs');
const bank = new Map(m.ALL_QUESTIONS.map(q => [q.id, q]));
const rows = [
  ['photo-blue-upc', 0, 1, 'l1-fiber-hardware', [/UPC.*APC/, /OS1\/OS2/, /Цветовая маркировка не универсальна/, /Вносимые потери проверяют измерением/]],
  ['photo-cable-colors', 0, 3, 'l1-fiber-splicing', [/LC-адаптеры/, /LC-пигтейлы/, /UPC или APC/, /кассету оптического кросса \(ODF\)/, /радиусом изгиба/, /не подтверждает OS2/]],
  ['review-poe-29', 0, 1, 'l1-poe-screen-reading', [/Коммутатор.*PSE/, /Камера.*PD/, /IEEE 802\.3af\/at\/bt/, /общий бюджет PSE/, /направления Ethernet-трафика/]],
  ['l1v2-a-nick-view', 2, 1, 'l1-copper-fault-poe', [/Глубокий надрез на нижней цельной медной жиле/, /уменьшает сечение/, /AWG/, /Link Up не доказывают надёжность/]],
  ['l1v2-a-pass-view', 0, 1, 'l1-copper-fault-poe', [/pass-through 8P8C/, /T568A\/B/, /обрезает выступающие концы заподлицо/, /контакты IDC/]],
  ['l1v2-a-corrosion-view', 0, 1, 'l1-copper-fault-poe', [/контакты гнезда потемнели неравномерно/, /нельзя определить состав налёта/, /переходное сопротивление/, /измерьте параметры линии/]],
  ['l1v2-a-poe-connection', 1, 1, 'l1-poe-screen-reading', [/LAN 8P8C \(RJ-45\)/, /100\/1000BASE-X/, /по оптоволокну PoE не подаётся/, /режим теста и допустимую мощность/]],
  ['l1v2-a-poe-unloaded', 0, 1, 'l1-poe-screen-reading', [/LinkRunner G2/, /Unloaded Voltage показывает «54\.6 V»/, /54,6 В без нагрузки/, /13\.00 W/, /не гарантирует.*под нагрузкой/]],
  ['l1v2-a-mark-cat6a', 3, 1, 'l1-copper-fault-poe', [/CAT6A Premium RJ45 Connector/, /не результат испытания/, /TIA\/ISO/, /NEXT и возвратные потери/]],
  ['l1v2-c-poe-marked-ports', 0, 1, 'l1-optical-testing-equipment', [/Скобка POE/, /порты 1–4/, /нельзя считать порты 5–8/, /общий бюджет PSE/]],
  ['l57-x03', 0, 1, 'l7-http-status-basics', [/301 Moved Permanently/, /Location/, /POST на GET/, /308 Permanent Redirect/]],
  ['l57-x17', 0, 1, 'l7-http-status-basics', [/404 Not Found/, /не хочет раскрывать/, /не говорит, что ресурс исчез навсегда/, /410 Gone/]],
  ['ts-x11', 0, 4, undefined, [/IPv4-пробы с DF/, /ICMP Fragmentation Needed/, /«чёрная дыра» PMTUD/, /симптом не доказывает фильтрацию/, /MSS clamping.*не помогает UDP или ping/]],
];
const proBodies = new Set();
for (const [id, key, level, lesson, terms] of rows) {
  const question = bank.get(id);
  assert.ok(question, id);
  assert.deepEqual(question.correct, [key], id);
  assert.equal(m.QUESTION_LEARNING_LEVELS[id]?.learningLevel, level, id);
  assert.equal(m.getLessonForQuestion(id)?.id, lesson, id);
  const detail = m.getQuestionDeepDive(question);
  assert.match(detail.deepAnalysis, /[а-яё]{3,}/i, id + ': plain remains Russian');
  const pro = detail.professional?.deep;
  assert.ok(pro, id + ': professional detail exists');
  assert.match(pro, /[а-яё]{5,}/i, id + ': Russian prose is visible in professional mode');
  assert.notEqual(pro, detail.deepAnalysis, id + ': distinct authored detail, not plain fallback');
  for (const term of terms) assert.match(pro, term, id + ': keep the original technical facts');
  proBodies.add(pro);
}
assert.equal(proBodies.size, rows.length);
console.log('PASS: 13 authored Russian professional reviews, distinct plain/pro, exact keys, levels, lessons and diagnostic facts');

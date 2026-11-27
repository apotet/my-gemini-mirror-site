import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Reconstruct the exact pre-change order and wording for frozen historical hash checks.
// These projections are test-only and never feed active question selection.
export const retiredPvcPhoto = JSON.parse(readFileSync(new URL('../src/data/retiredPvcPhotoQuestion.json', import.meta.url), 'utf8'));
export const previousCopperUtp = JSON.parse(readFileSync(new URL('../src/data/previousCopperUtpPhotoQuestion.json', import.meta.url), 'utf8'));
export const previousOpticalInspection = JSON.parse(readFileSync(new URL('../src/data/previousOpticalInspectionQuestion.json', import.meta.url), 'utf8'));
export const previousFiberEndFace = JSON.parse(readFileSync(new URL('../src/data/previousFiberEndFaceQuestion.json', import.meta.url), 'utf8'));
export const retiredWiremapLimitPhoto = JSON.parse(readFileSync(new URL('../src/data/retiredWiremapLimitPhotoQuestion.json', import.meta.url), 'utf8'));
const retiredWiremapLimitLevel = {
  status: 'ASSIGNED', auditAction: 'RELABEL', learningLevel: 1, confidence: 'high',
  auditRationale: 'Распознать (L1 · Фото и практика): Результат не отображается: экран на фото пуст',
};
export const retiredPvcLevel = {
  status: 'ASSIGNED', auditAction: 'KEEP', learningLevel: 1, confidence: 'high',
  auditRationale: 'Распознать (L1 · Фото и практика): Поливинилхлорид (PVC)',
};
const position = 398;
const wiremapPosition = 381;

export function bankBeforeWiremapLimitRetirement(questions) {
  assert.ok(questions.every(q => q.id !== retiredWiremapLimitPhoto.id), 'retired wiremap question is not active');
  assert.equal(questions[wiremapPosition - 1]?.id, 'l1v2-a-tester');
  assert.equal(questions[wiremapPosition]?.id, 'l1v2-a-tester-safe');
  return [...questions.slice(0, wiremapPosition), structuredClone(retiredWiremapLimitPhoto), ...questions.slice(wiremapPosition)];
}
export function registryBeforeWiremapLimitRetirement(registry) {
  assert.ok(!Object.hasOwn(registry, retiredWiremapLimitPhoto.id), 'retired wiremap entry is not active');
  const rows = Object.entries(registry);
  assert.equal(rows[wiremapPosition - 1]?.[0], 'l1v2-a-tester');
  assert.equal(rows[wiremapPosition]?.[0], 'l1v2-a-tester-safe');
  return Object.fromEntries([...rows.slice(0, wiremapPosition), [retiredWiremapLimitPhoto.id, retiredWiremapLimitLevel], ...rows.slice(wiremapPosition)]);
}

export function bankBeforeFiberEndFaceChange(currentQuestions) {
  const questions = bankBeforeWiremapLimitRetirement(currentQuestions);
  const revised = questions.filter(q => q.id === previousFiberEndFace.id);
  assert.equal(revised.length, 1);
  assert.equal(revised[0].image, 'assets/photos/fiber-end-face-mei-2018-fig13-r1c2-v1.webp');
  return questions.map(q => q.id === previousFiberEndFace.id ? structuredClone(previousFiberEndFace) : q);
}

export function bankBeforeOpticalWordingChange(currentQuestions) {
  // Today's Ethernet stem is newer than all of these frozen bank snapshots.
  // This projection also accepts raw questions.json, which doesn't contain this extra-pack ID.
  const questions = bankBeforeFiberEndFaceChange(currentQuestions).map(q => {
    if (q.id !== 'tcpip-x11') return q;
    assert.equal(q.text, 'Какие поля добавляет Ethernet при передаче IP-пакета?');
    return { ...q, text: 'Что добавляет уровень Link при отправке IP-пакета в Ethernet?' };
  });
  const revised = questions.filter(q => q.id === previousOpticalInspection.id);
  assert.equal(revised.length, 1);
  assert.equal(revised[0].text, 'Какую проверку выполняют этим прибором перед подключением оптического патч-корда?');
  return questions.map(q => q.id === previousOpticalInspection.id ? { ...q, ...previousOpticalInspection } : q);
}
export function bankBeforeCopperPhotoChanges(currentQuestions) {
  const questions = bankBeforeOpticalWordingChange(currentQuestions);
  assert.ok(questions.every(q => q.id !== retiredPvcPhoto.id), 'retired question is not active');
  assert.equal(questions[position - 1]?.id, 'l1v2-a-mark-frequency');
  assert.equal(questions[position]?.id, 'l1v2-a-solid-view');
  const revised = questions.filter(q => q.id === previousCopperUtp.id);
  assert.equal(revised.length, 1);
  assert.equal(revised[0].text, 'Какое обозначение экранирования соответствует кабелю на этом срезе?');
  assert.deepEqual(revised[0].answers, ['F/UTP', 'S/FTP', 'F/FTP', 'U/UTP']);
  return [...questions.slice(0, position), structuredClone(retiredPvcPhoto), ...questions.slice(position)]
    .map(q => q.id === previousCopperUtp.id ? { ...q, ...previousCopperUtp } : q);
}
export function registryBeforePvcRetirement(registry) {
  assert.ok(!Object.hasOwn(registry, retiredPvcPhoto.id), 'retired ID is absent from the active registry');
  const rows = Object.entries(registryBeforeWiremapLimitRetirement(registry));
  assert.equal(rows[position - 1]?.[0], 'l1v2-a-mark-frequency');
  assert.equal(rows[position]?.[0], 'l1v2-a-solid-view');
  return Object.fromEntries([...rows.slice(0, position), [retiredPvcPhoto.id, retiredPvcLevel], ...rows.slice(position)]);
}

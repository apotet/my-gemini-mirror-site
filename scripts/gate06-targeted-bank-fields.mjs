import assert from 'node:assert/strict';
// Exact, independently reviewed explanatory corrections. Restore ONLY these five
// fields when comparing with the unchanged historical bank checksum. Stems,
// answers, keys, ordering and every other field remain protected by that digest.
export const GATE06_TEACHING_FIELDS = {
  'wifi-roam-01': { topic: { before: 'L1–L2 · Wi-Fi · Роуминг и Sticky', after: 'L1–L2 · Wi-Fi · Роуминг и Sticky client' } },
  'wifi-std-01': {
    explanation: {
      before: 'В диапазоне 2,4 ГГц при ширине 20 МГц полностью не перекрываются только каналы 1, 6 и 11.',
      after: 'Для трёх точек из условия подходит план 1, 6 и 11 при ширине 20 МГц: он устраняет перекрытие смежных каналов 1, 3 и 5. Это не единственный допустимый план для всех стран и вариантов PHY.',
    },
    remember: {
      before: 'В 2,4 ГГц только три канала не перекрываются по спектру: 1, 6 и 11 (шириной 20 МГц).',
      after: 'Для этого офиса подходит распространённый план 1, 6 и 11 при ширине 20 МГц. Допустимые каналы и альтернативные планы зависят от региона и используемого PHY.',
    },
  },
  'wifi-std-04': {
    explanation: {
      before: 'OFDMA в 802.11ax делит канал на частотные RU для параллельного обслуживания клиентов, а Wi-Fi 6E и 802.11be добавляют спектр 6 ГГц.',
      after: 'OFDMA в 802.11ax делит канал на RU. Wi-Fi 6E расширяет Wi-Fi 6 на разрешённую часть 6 ГГц; Wi-Fi 7 (802.11be) добавляет, в частности, каналы до 320 МГц и MLO при поддержке оборудования и разрешении регулятора.',
    },
    remember: {
      before: 'OFDMA (Wi-Fi 6 / 802.11ax) = деление канала на RU для коротких пакетов множества клиентов; Wi-Fi 6E / 7 (802.11be) = чистый диапазон 6 ГГц.',
      after: 'OFDMA делит канал на RU; Wi-Fi 6E добавляет разрешённую часть диапазона 6 ГГц; Wi-Fi 7 поддерживает, в частности, 320 МГц и MLO при подходящем оборудовании и разрешении регулятора. Свободный от помех эфир не гарантируется.',
    },
  },
};
export function restoreGate06HistoricalTeachingFields(questions) {
  const seen = new Set();
  const result = questions.map(q => {
    const fields = GATE06_TEACHING_FIELDS[q.id];
    if (!fields) return q;
    seen.add(q.id);const restored = { ...q };
    for (const [key, value] of Object.entries(fields)) {
      assert.equal(q[key], value.after, `${q.id}.${key}: only the exact reviewed correction is allowed`);
      restored[key] = value.before;
    }
    return restored;
  });
  assert.equal(seen.size, 3, 'All three explicitly reviewed Wi-Fi teaching corrections exist');
  return result;
}

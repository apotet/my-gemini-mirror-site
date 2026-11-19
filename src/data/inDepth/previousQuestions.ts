import type { Question } from '../../types/quiz';

/** Exact pre-L2 option snapshots. Correct indices are unchanged; the Wi-Fi answer wording is technically corrected. */
export const PREVIOUS_IN_DEPTH_QUESTIONS: Readonly<Record<string, Question>> = {
  "l4-x03": {
    "id": "l4-x03",
    "group": "l4",
    "topic": "L4 · UDP",
    "text": "UDP предпочитают, когда…",
    "answers": [
      "Важны низкая задержка и простота (DNS, RTP, игры)",
      "Нужна строгая доставка каждого байта как в файле",
      "Нужен обязательный 3-way handshake",
      "Нужен только RST"
    ],
    "correct": [
      0
    ],
    "explanation": "UDP — минимальный транспорт без соединения.",
    "difficulty": "applied"
  },
  "l4-x04": {
    "id": "l4-x04",
    "group": "l4",
    "topic": "L4 · TCP",
    "text": "TCP window size влияет на…",
    "answers": [
      "Сколько данных можно отправить без ACK (throughput на длинных RTT)",
      "Только VLAN ID",
      "Только ARP timeout",
      "Только цвет индикатора линка"
    ],
    "correct": [
      0
    ],
    "explanation": "Окно и bandwidth-delay product ограничивают скорость.",
    "difficulty": "applied"
  },
  "wifi-std-04": {
    "id": "wifi-std-04",
    "group": "l1-l2",
    "topic": "L1–L2 · Wi-Fi 6 / 6E / 7",
    "text": "В переговорной десятки ноутбуков и смартфонов непрерывно обмениваются короткими кадрами мессенджеров и голоса. Какая технология стандарта 802.11ax (Wi-Fi 6) позволяет точке доступа делить один радиоканал на небольшие частотные блоки RU и передавать данные сразу группе клиентов в одном кадре, и что к этому добавляет Wi-Fi 6E / 802.11be?",
    "answers": [
      "Технология SAE делит канал на временные слоты, а Wi-Fi 6E расширяет полосу 2,4 ГГц до 160 МГц",
      "Технология PMF объединяет кадры клиентов, а 802.11be переводит Wi-Fi на проводной Full-Duplex",
      "Технология DFS выделяет каждому клиенту отдельный радарный канал на 5 ГГц",
      "Технология OFDMA делит канал на частотные блоки Resource Units (RU), а Wi-Fi 6E и 802.11be открывают чистый диапазон 6 ГГц"
    ],
    "correct": [
      3
    ],
    "explanation": "OFDMA в 802.11ax делит канал на частотные RU для параллельного обслуживания клиентов, а Wi-Fi 6E и 802.11be добавляют спектр 6 ГГц.",
    "remember": "OFDMA (Wi-Fi 6 / 802.11ax) = деление канала на RU для коротких пакетов множества клиентов; Wi-Fi 6E / 7 (802.11be) = чистый диапазон 6 ГГц.",
    "difficulty": "beginner"
  }
};

/** Recognize only the reviewed historical option sets, never arbitrary bank drift. */
export function previousInDepthSnapshot(current: Question, saved: {text?: unknown;answers?: unknown;correct?: unknown}, order?: unknown): Question | undefined {
  const previous = PREVIOUS_IN_DEPTH_QUESTIONS[current.id];
  if (!previous || saved.text !== previous.text || !Array.isArray(saved.answers) || !Array.isArray(saved.correct)) return undefined;
  const indices = order === undefined ? previous.answers.map((_,index)=>index) : order;
  if (!Array.isArray(indices) || indices.length !== previous.answers.length || new Set(indices).size !== indices.length || indices.some(i=>!Number.isInteger(i)||i<0||i>=previous.answers.length)) return undefined;
  const answers=indices.map(i=>previous.answers[i]);
  const correct=indices.flatMap((i,displayed)=>previous.correct.includes(i)?[displayed]:[]);
  return JSON.stringify(saved.answers)===JSON.stringify(answers) && JSON.stringify(saved.correct)===JSON.stringify(correct) ? {...current,...previous} : undefined;
}

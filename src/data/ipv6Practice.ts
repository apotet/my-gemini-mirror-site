/** Fixed practice scenes, not copies of the bank questions. */
export const IPV6_CONCEPT_EXERCISES = {
  'ndp-multicast': {
    title: 'NDP: адрес multicast для NS',
    q: 'Адрес соседа на этом Ethernet-канале — 2001:db8:224::ab:cdef. Его MAC ещё неизвестен. Какой IPv6-адрес назначения будет у Neighbor Solicitation?',
    answer: 'ff02::1:ffab:cdef',
    opts: ['ff02::1:ffab:cdef', 'ff02::1', 'ff02::2', '2001:db8:224::ab:cdef'],
    e: 'К префиксу ff02::1:ff00:0/104 добавляются младшие 24 бита адреса цели: ab:cdef. Полный адрес соседа остаётся в поле Target Address сообщения NS (RFC 4291 §2.7.1, RFC 4861 §7.2.2).',
  },
  'ra-router-lifetime': {
    title: 'RA: выбор маршрутизатора по умолчанию',
    q: 'Хост получил два корректных Router Advertisement. У fe80::7 Router Lifetime равен 0, у fe80::9 — 900 с. Других настроек маршрута по умолчанию нет. Кто попадёт в список маршрутизаторов по умолчанию?',
    answer: 'Только fe80::9',
    opts: ['Только fe80::9', 'Только fe80::7', 'Оба маршрутизатора', 'Ни один без DHCPv6'],
    e: 'Ненулевой Router Lifetime позволяет занести отправителя RA в список маршрутизаторов по умолчанию. Ноль не делает недействительными остальные опции RA: у префиксов свои сроки (RFC 4861 §§4.2, 6.3.4).',
  },
  'dad-duplicate': {
    title: 'DAD: дубликат предварительного адреса',
    q: 'Адрес 2001:db8:224::35 ещё tentative. В ответ на проверку DAD хост получил корректное Neighbor Advertisement для этого адреса от другого узла. Что делать с tentative-адресом?',
    answer: 'Не назначать его: обнаружен дубликат',
    opts: ['Не назначать его: обнаружен дубликат', 'Назначить его: пришло подтверждение уникальности', 'Назначить его до истечения Router Lifetime', 'Подставить в адрес MAC ответившего узла'],
    e: 'Корректное NA с Target Address, совпадающим с tentative-адресом, означает, что адрес не уникален. DAD проверяет возможность использовать собственный адрес, а не ищет MAC для отправки пакета (RFC 4862 §§5.4.4–5.4.5).',
  },
  'slaac-compose': {
    title: 'SLAAC: собрать адрес из префикса и IID',
    q: 'На Ethernet получен пригодный для SLAAC префикс 2001:db8:224:8::/64 с A=1. ОС выбрала 64-битный IID 0000:0000:0000:0042. Какой предварительный адрес она сформирует до DAD?',
    answer: '2001:db8:224:8::42',
    opts: ['2001:db8:224:8::42', '2001:db8:224:42::8', '2001:db8:224:8::', 'fe80::42'],
    e: 'Первые 64 бита берутся из объявленного префикса, последние 64 — из выбранного ОС IID. Полученный адрес проверяется DAD перед обычным использованием (RFC 4862 §§5.4, 5.5.3).',
  },
  'slaac-prefix-flags': {
    title: 'RA: разные задачи флагов L и A',
    q: 'В корректном RA для нового 2001:db8:224::/64 указаны L=0 и A=1, сроки допустимы, SLAAC включён. Что следует именно из этой опции префикса?',
    answer: 'Можно сформировать SLAAC-адрес; опция не объявляет префикс on-link',
    opts: ['Можно сформировать SLAAC-адрес; опция не объявляет префикс on-link', 'Префикс объявлен on-link, но SLAAC запрещён', 'L=0 запрещает любой прямой обмен в префиксе', 'Для формирования адреса обязателен DHCPv6'],
    e: 'A разрешает автономно сформировать адрес. L сообщает, используется ли эта опция для определения on-link. L=0 не объявляет префикс off-link и не отменяет другую уже имеющуюся информацию о нём (RFC 4861 §4.6.2, RFC 4862 §5.5.3).',
  },
  'slaac-invalid-lifetime': {
    title: 'SLAAC: найти причину по срокам в RA',
    q: 'Хост должен впервые собрать адрес из 2001:db8:224::/64. В захвате есть RA с A=1, Valid Lifetime 600 с и Preferred Lifetime 900 с. Почему эта опция не даёт новый адрес?',
    answer: 'Preferred Lifetime не может превышать Valid Lifetime',
    opts: ['Preferred Lifetime не может превышать Valid Lifetime', 'A=1 запрещает автономную настройку', 'Для SLAAC нужен NA вместо RA', 'Префикс /64 на Ethernet слишком длинный для SLAAC'],
    e: 'Хост игнорирует для SLAAC опцию префикса, у которой Preferred Lifetime больше Valid Lifetime. Сначала сопоставьте значения в самом RA, а не ищите обязательный ответ DHCPv6 (RFC 4862 §5.5.3).',
  },
} as const;

export type Ipv6ConceptExerciseId = keyof typeof IPV6_CONCEPT_EXERCISES;
export type Ipv6PracticeTarget = { targetMode: 'type' } | { targetMode: 'concept'; exercise: Ipv6ConceptExerciseId };

const IPV6_EXERCISES_BY_QUESTION: Readonly<Record<string, Ipv6ConceptExerciseId>> = {
  'review-ndp-1': 'ndp-multicast',
  'review-ndp-2': 'ra-router-lifetime',
  'review-ndp-3': 'dad-duplicate',
  'review-slaac-4': 'slaac-compose',
  'review-slaac-5': 'slaac-prefix-flags',
  'review-slaac-6': 'slaac-invalid-lifetime',
};

export function getIpv6QuestionPractice(questionId: string): Ipv6PracticeTarget | undefined {
  if (questionId === 'l3-d06') return { targetMode: 'type' };
  if (!Object.hasOwn(IPV6_EXERCISES_BY_QUESTION, questionId)) return undefined;
  return { targetMode: 'concept', exercise: IPV6_EXERCISES_BY_QUESTION[questionId] };
}

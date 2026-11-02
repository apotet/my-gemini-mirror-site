import { Question } from '../types/quiz';

export interface QuestionDeepDive {
  questionId: string;
  category: 'l1' | 'l2' | 'l3' | 'l4' | 'l5_l7' | 'tcpip' | 'cli' | 'visual';
  categoryLabel: string;
  categoryColor: string;
  coreConcept: string;
  deepAnalysis: string;
  commonTrap: string;
  practicalTip?: string;
  memorizationRule?: string;
  visualDiagram?: string;
  ipv4Practice?: {
    enabled: boolean;
    reason: string;
    targetPrefix?: number;
    targetMode?: 'calc' | 'trainer';
  };
  keyTakeaways: string[];
}

// Hand-crafted deep dives for critical architectural questions
constions
const CURATED_DEEP_DIVES: Record<string, Partial<QuestionDeepDive>> = {
  'l1-01': {
    category: 'l1',
    categoryLabel: 'L1 · Физический уровень · PDU',
    categoryColor: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30',
    coreConcept:
      'Физический уровень (L1) оперирует исключительно неструктурированным потоком битов (0 и 1) в виде физических сигналов.',
    deepAnalysis:
      'Анализатор физического уровня или осциллограф видит лишь уровни напряжения, оптические импульсы или радиочастотные колебания. На L1 нет концепции заголовков, адресов отправителя/получателя или контрольных сумм. Структурирование битов в кадры с преамбулой и MAC-адресами происходит только уровнем выше — на L2 (Data Link).',
    commonTrap:
      'Часто путают с кадром (Frame). Кадр появляется только тогда, когда поток битов разбивается на порции с проверкой FCS (Frame Check Sequence) и MAC-адресацией.',
    memorizationRule:
      'L1 = Биты (сигналы) → L2 = Кадры (MAC) → L3 = Пакеты (IP) → L4 = Сегменты (TCP) / Датаграммы (UDP) → L7 = Данные.',
    keyTakeaways: [
      'На L1 нет MAC/IP — только сигнал',
      'PDU физического уровня — бит',
      'Кадр и FCS относятся к L2',
    ],
  },
};

export function getQuestionDeepDive(question: Question): QuestionDeepDive {
  const curated = CURATED_DEEP_DIVES[question.id];
  if (curated) {
    return {
      questionId: question.id,
      category: curated.category || detectCategory(question),
      categoryLabel: curated.categoryLabel || question.topic,
      categoryColor: curated.categoryColor || getCategoryColor(detectCategory(question)),
      coreConcept: curated.coreConcept || extractCoreConcept(question),
      deepAnalysis: curated.deepAnalysis || question.explanation,
      commonTrap: curated.commonTrap || detectCommonTrap(question),
      practicalTip: curated.practicalTip || question.remember,
      memorizationRule: curated.memorizationRule || question.remember,
      visualDiagram: curated.visualDiagram,
      ipv4Practice: curated.ipv4Practice || detectIpv4Practice(question),
      keyTakeaways:
        curated.keyTakeaways || [
          question.explanation.slice(0, 80) + '...',
          'Проверьте правильный ответ перед повторным тестированием',
        ],
    };
  }

  const category = detectCategory(question);
  const ipv4Practice = detectIpv4Practice(question);
  const trap = detectCommonTrap(question);
  const diagram = generateDiagramForQuestion(question, category);

  return {
    questionId: question.id,
    category,
    categoryLabel: question.topic,
    categoryColor: getCategoryColor(category),
    coreConcept: extractCoreConcept(question),
    deepAnalysis: enrichExplanation(question, category),
    commonTrap: trap,
    practicalTip: question.remember || getPracticalTip(question, category),
    memorizationRule: question.remember,
    visualDiagram: diagram,
    ipv4Practice,
    keyTakeaways: generateKeyTakeaways(question, category),
  };
}

function detectCategory(q: Question): QuestionDeepDive['category'] {
  if (q.group === 'visual-l1') return 'visual';
  if (q.group === 'troubleshooting' || q.topic.includes('Диагностика')) return 'cli';
  if (q.group === 'tcpip' || q.topic.includes('TCP/IP') || q.topic.includes('Инкапсуляция')) return 'tcpip';
  if (q.group === 'l4' || q.topic.includes('L4') || q.topic.includes('TCP') || q.topic.includes('UDP')) return 'l4';
  if (
    q.group === 'l5-l7' ||
    q.topic.includes('L5') ||
    q.topic.includes('L7') ||
    q.topic.includes('DNS') ||
    q.topic.includes('DHCP') ||
    q.topic.includes('HTTP')
  )
    return 'l5_l7';
  if (
    q.group === 'l3' ||
    q.topic.includes('L3') ||
    q.topic.includes('IPv4') ||
    q.topic.includes('Маски') ||
    q.topic.includes('Подсети')
  )
    return 'l3';
  if (q.group === 'l1-l2') {
    if (q.topic.includes('L1') || q.topic.includes('Оптика') || q.topic.includes('Физический')) return 'l1';
    return 'l2';
  }
  return 'l3';
}

function getCategoryColor(category: QuestionDeepDive['category']): string {
  switch (category) {
    case 'l1':
      return 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30';
    case 'l2':
      return 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30';
    case 'l3':
      return 'from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/30';
    case 'l4':
      return 'from-violet-500/20 to-purple-500/10 text-violet-300 border-violet-500/30';
    case 'l5_l7':
      return 'from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30';
    case 'tcpip':
      return 'from-sky-500/20 to-indigo-500/10 text-sky-300 border-sky-500/30';
    case 'cli':
      return 'from-slate-500/20 to-zinc-500/10 text-slate-300 border-slate-500/30';
    case 'visual':
      return 'from-orange-500/20 to-amber-500/10 text-orange-300 border-orange-500/30';
    default:
      return 'from-slate-500/20 to-slate-500/10 text-slate-300 border-slate-500/30';
  }
}

function detectIpv4Practice(q: Question): QuestionDeepDive['ipv4Practice'] | undefined {
  const text = (q.text + ' ' + q.topic + ' ' + (q.explanation || '')).toLowerCase();
  const needsCalc =
    text.includes('маск') ||
    text.includes('подсет') ||
    text.includes('cidr') ||
    text.includes('префикс') ||
    text.includes('/24') ||
    text.includes('/25') ||
    text.includes('/26') ||
    text.includes('/27') ||
    text.includes('/28') ||
    text.includes('/29') ||
    text.includes('/30') ||
    text.includes('host') ||
    text.includes('хост');

  if (!needsCalc) return undefined;

  let targetPrefix: number | undefined;
  const m = text.match(/\/(\d{1,2})/);
  if (m) {
    const n = Number(m[1]);
    if (n >= 8 && n <= 30) targetPrefix = n;
  }

  return {
    enabled: true,
    reason: 'Этот вопрос опирается на расчёт маски, числа хостов или границ подсети — удобно закрепить в тренажёре.',
    targetPrefix,
    targetMode: 'trainer',
  };
}

function extractCoreConcept(q: Question): string {
  const correctAnswersText = q.correct.map((idx) => q.answers[idx]).join('; ');
  return `Правильный ответ: «${correctAnswersText}». Ключевой принцип темы «${q.topic}».`;
}

function enrichExplanation(q: Question, category: QuestionDeepDive['category']): string {
  if (q.explanation && q.explanation.length > 80) {
    if (category === 'visual') {
      return `${q.explanation}\n\nНа практике важно сверять маркировку на корпусе/гильзе, тип волокна (SMF 9/125 или MMF 50/125) и полировку торца (UPC — синий, APC — зелёный). Ошибка в типе коннектора или загрязнение торца даёт потери и «мигающий» линк.`;
    }
    return q.explanation;
  }

  switch (category) {
    case 'l1':
      return `${q.explanation} Физический уровень отвечает за передачу неструктурированного битового потока через физическую среду передачи (медь, оптику, радиоканал), характеристики сигналов и типы разъемов.`;
    case 'l2':
      return `${q.explanation} Канальный уровень обеспечивает адресацию внутри одного локального сегмента по MAC-адресам, проверку целостности кадров (FCS CRC-32) и разграничение broadcast-доменов через VLAN.`;
    case 'l3':
      return `${q.explanation} Сетевой уровень выполняет сквозную маршрутизацию пакетов между различными сегментами сетей с помощью логических IP-адресов и таблиц пересылки (FIB/RIB).`;
    case 'l4':
      return `${q.explanation} Транспортный уровень отвечает за взаимодействие между конкретными процессами операционной системы через номера портов (0–65535) и управление потоком данных.`;
    case 'l5_l7':
      return `${q.explanation} Прикладной уровень предоставляет стандартизированные протоколы и интерфейсы для взаимодействия пользовательских приложений и сетевых сервисов.`;
    case 'cli':
      return `${q.explanation} Для надежной сетевой диагностики всегда важно локализовать уровень неисправности по модели OSI: от физики кабеля до L7-приложений.`;
    case 'visual':
      return q.explanation
        ? `${q.explanation}\n\nНа практике важно сверять маркировку на корпусе/гильзе, тип волокна (SMF 9/125 или MMF 50/125) и полировку торца (UPC — синий, APC — зелёный). Ошибка в типе коннектора или загрязнение торца даёт потери и «мигающий» линк.`
        : 'Опирайтесь на видимые признаки на фото: форма корпуса, цвет хвостовика, ключ/защёлка, маркировка. Затем сопоставьте с допустимыми вариантами монтажа и измерительной практики.';
    default:
      return q.explanation;
  }
}

function detectCommonTrap(q: Question): string {
  if (q.text.includes('маск') || q.text.includes('хост')) {
    return 'Частая ошибка: забывают вычесть 2 зарезервированных адреса (адрес подсети и broadcast) или путают шаг подсети с количеством хостов.';
  }
  if (q.text.includes('кадр') || q.text.includes('пакет') || q.text.includes('сегмент')) {
    return 'Типичная путаница терминов PDU: кадр (L2 Ethernet) часто ошибочно называют пакетом (L3 IP), а сегмент (L4 TCP) — датаграммой.';
  }
  if (q.text.includes('SYN') || q.text.includes('handshake') || q.text.includes('трёхкратное')) {
    return 'На экзамене часто путают порядок флагов (кто шлёт SYN+ACK) или забывают про третий ACK.';
  }
  if (q.group === 'visual-l1' || q.topic.includes('Оптика')) {
    const t = (q.text + ' ' + (q.explanation || '')).toLowerCase();
    if (t.includes('царапин') || t.includes('скол')) {
      return 'Царапина или скол на торце — не «косметика»: такой стык почти всегда переделывают (новый скол/зачистка или замена пигтейла). Нельзя «лечить» дефект увеличением дуги или сдвигом гильзы.';
    }
    if (t.includes('upc') || t.includes('apc') || t.includes('полир')) {
      return 'Опасная ошибка: стыковать UPC (синий, плоский торец) с APC (зелёный, скос ~8°). Риск скола волокна и высоких потерь.';
    }
    if (t.includes('гряз') || t.includes('чист') || t.includes('торец')) {
      return 'Большинство «необъяснимых» потерь на доступе — загрязнённый торец. Сначала осмотр/чистка, потом повтор измерения.';
    }
    return 'На фото легко перепутать похожие разъёмы и модули. Смотрите на форму, цвет хвостовика, защёлку и заводскую маркировку — не только на «общее впечатление».';
  }
  return 'Обратите внимание на точные формулировки стандартов и исключения из общих правил.';
}

function getPracticalTip(q: Question, category: QuestionDeepDive['category']): string {
  switch (category) {
    case 'cli':
      return 'В боевых условиях всегда проверяйте статус линка (L1/L2) перед диагностикой маршрутов или DNS.';
    case 'l3':
      return 'Команда `ip route show` в Linux или `route print` в Windows быстро отображает порядок метрик и активные шлюзы.';
    case 'l4':
      return 'Утилита `ss -tulpn` моментально показывает слушающие сокеты, PID процессов и связанные порты.';
    case 'l2':
      return 'Таблица CAM очищается по тайм-ауту (обычно 300 секунд), если узел долго не отправляет кадры.';
    case 'visual':
      return 'Перед сваркой/подключением: осмотрите торец, протрите чистящей кассетой, сверьте цвет и тип разъёма. После — измерьте потери, а не полагайтесь только на «линк up».';
    default:
      return 'Запомните фундаментальный принцип: каждый уровень модели OSI решает строго свою задачу и инкапсулирует вышележащий PDU.';
  }
}

function generateDiagramForQuestion(q: Question, category: QuestionDeepDive['category']): string | undefined {
  if (q.topic.includes('Подсети') || q.topic.includes('Маски')) {
    return `+-------------------------------------------------------------+\n| Формула подсетей: Шаг (Magic Number) = 256 - Маска октета   |\n| Хостов в подсети = 2^(32 - Префикс) - 2                     |\n+-------------------------------------------------------------+`;
  }
  if (q.topic.includes('TCP') || q.topic.includes('Handshake')) {
    return `Client                  Server\n  | ----- 1. [SYN] ------> |\n  | <--- 2. [SYN+ACK] ---- |\n  | ----- 3. [ACK] ------> |`;
  }
  if (q.topic.includes('Единицы данных') || q.topic.includes('PDU')) {
    return `[ L7 Данные ] -> [ L4 Сегмент TCP/UDP ] -> [ L3 IP-пакет ] -> [ L2 Кадр Ethernet ] -> [ L1 Биты ]`;
  }
  return undefined;
}

function generateKeyTakeaways(q: Question, category: QuestionDeepDive['category']): string[] {
  const correctAnswersText = q.correct.map((idx) => q.answers[idx]).join(', ');
  const tips: string[] = [`Правильный ответ: ${correctAnswersText}`, `Тема: ${q.topic}`];
  if (category === 'visual') {
    tips.push(
      'Сверяйте фото с маркировкой и типовыми признаками разъёма/модуля, а не только с формой «на глаз».'
    );
    if (q.explanation) {
      const short = q.explanation.length > 140 ? q.explanation.slice(0, 140).trim() + '…' : q.explanation;
      tips.push(short);
    }
  } else if (category === 'l3' && q.text.includes('/')) {
    tips.push('Расчёт маски и хостов удобно проверить в разделе IPv4-тренажёра');
  } else {
    tips.push('Проверьте соответствие уровню модели OSI и формулировке стандарта');
  }
  return tips;
}

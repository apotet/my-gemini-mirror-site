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

export function getQuestionDeepDive(question: Question): QuestionDeepDive {
  const category = detectCategory(question);
  const correctText = question.correct.map((idx) => question.answers[idx]).join('; ');

  return {
    questionId: question.id,
    category,
    categoryLabel: question.topic,
    categoryColor: getCategoryColor(category),
    coreConcept: `Правильный ответ: «${correctText}». Тема: ${question.topic}.`,
    deepAnalysis: enrichExplanation(question, category),
    commonTrap: detectCommonTrap(question),
    practicalTip: question.remember || getPracticalTip(category),
    memorizationRule: question.remember,
    visualDiagram: generateDiagramForQuestion(question),
    ipv4Practice: detectIpv4Practice(question),
    keyTakeaways: generateKeyTakeaways(question, category, correctText),
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
    text.includes('/30');

  if (!needsCalc) return undefined;

  let targetPrefix: number | undefined;
  const m = text.match(/\/(\d{1,2})/);
  if (m) {
    const n = Number(m[1]);
    if (n >= 8 && n <= 30) targetPrefix = n;
  }

  return {
    enabled: true,
    reason: 'Этот вопрос опирается на расчёт маски или границ подсети — удобно закрепить в тренажёре.',
    targetPrefix,
    targetMode: 'trainer',
  };
}

function enrichExplanation(q: Question, category: QuestionDeepDive['category']): string {
  const base = (q.explanation || '').trim();

  if (category === 'visual') {
    const extra =
      'На практике сверяйте маркировку на корпусе/гильзе, тип волокна (SMF 9/125 или MMF 50/125) и полировку торца (UPC — синий, APC — зелёный). Ошибка в типе коннектора или загрязнение торца даёт потери и нестабильный линк.';
    return base ? `${base}\n\n${extra}` : extra;
  }

  if (base.length > 40) return base;

  switch (category) {
    case 'l1':
      return `${base} Физический уровень передаёт битовый поток через среду (медь, оптика, радио) без разбора адресов.`;
    case 'l2':
      return `${base} Канальный уровень работает с кадрами, MAC-адресами и проверкой FCS/CRC.`;
    case 'l3':
      return `${base} Сетевой уровень маршрутизирует IP-пакеты между сетями по логическим адресам.`;
    case 'l4':
      return `${base} Транспортный уровень связывает процессы через порты и управляет доставкой (TCP/UDP).`;
    case 'l5_l7':
      return `${base} Прикладные протоколы (DNS, HTTP, DHCP, TLS) обслуживают пользовательские сервисы.`;
    case 'cli':
      return `${base} Диагностику начинают с L1/L2 (линк, ошибки), затем L3/L4 и сервисы.`;
    default:
      return base || 'Сверьте формулировку вопроса с моделью OSI и стандартами темы.';
  }
}

function detectCommonTrap(q: Question): string {
  const t = (q.text + ' ' + (q.explanation || '')).toLowerCase();

  if (t.includes('маск') || t.includes('хост')) {
    return 'Частая ошибка: забывают вычесть 2 адреса (сеть и broadcast) или путают шаг подсети с числом хостов.';
  }
  if (t.includes('кадр') || t.includes('пакет') || t.includes('сегмент')) {
    return 'Путаница PDU: кадр — L2, пакет — L3, сегмент/датаграмма — L4.';
  }
  if (t.includes('syn') || t.includes('handshake') || t.includes('трёхкратное')) {
    return 'Часто путают порядок флагов handshake (кто отправляет SYN+ACK).';
  }
  if (q.group === 'visual-l1' || t.includes('оптик')) {
    if (t.includes('царапин') || t.includes('скол')) {
      return 'Царапина или скол на торце — не косметика: стык переделывают (новый скол/зачистка или замена пигтейла). Нельзя «лечить» дефект увеличением дуги или сдвигом гильзы.';
    }
    if (t.includes('upc') || t.includes('apc') || t.includes('полир')) {
      return 'Нельзя стыковать UPC (синий, плоский торец) с APC (зелёный, скос ~8°): риск скола и высоких потерь.';
    }
    if (t.includes('гряз') || t.includes('чист') || t.includes('торец')) {
      return 'Многие «непонятные» потери — загрязнённый торец. Сначала осмотр и чистка, потом повтор измерения.';
    }
    return 'Похожие разъёмы и модули легко перепутать на фото. Смотрите форму, цвет хвостовика, защёлку и заводскую маркировку.';
  }
  return 'Смотрите точные формулировки стандартов и исключения из общих правил.';
}

function getPracticalTip(category: QuestionDeepDive['category']): string {
  switch (category) {
    case 'cli':
      return 'Сначала проверьте линк (L1/L2), затем маршруты и DNS.';
    case 'l3':
      return 'Команды `ip route` / `route print` быстро показывают шлюзы и метрики.';
    case 'l4':
      return '`ss -tulpn` показывает слушающие сокеты и порты.';
    case 'l2':
      return 'Таблица MAC/CAM устаревает по тайм-ауту, если узел молчит.';
    case 'visual':
      return 'Перед подключением: осмотр торца, чистка, сверка типа разъёма. После — измерение потерь, а не только «линк up».';
    default:
      return 'Каждый уровень OSI решает свою задачу и инкапсулирует PDU уровня выше.';
  }
}

function generateDiagramForQuestion(q: Question): string | undefined {
  if (q.topic.includes('Подсети') || q.topic.includes('Маски')) {
    return 'Шаг октета = 256 − значение маски; хостов = 2^(32 − prefix) − 2';
  }
  if (q.topic.includes('TCP') || q.topic.includes('Handshake')) {
    return 'Client → SYN → Server → SYN+ACK → Client → ACK';
  }
  if (q.topic.includes('Единицы данных') || q.topic.includes('PDU')) {
    return 'L7 данные → L4 сегмент → L3 пакет → L2 кадр → L1 биты';
  }
  return undefined;
}

function generateKeyTakeaways(
  q: Question,
  category: QuestionDeepDive['category'],
  correctText: string
): string[] {
  const tips = [`Правильный ответ: ${correctText}`, `Тема: ${q.topic}`];
  if (category === 'visual') {
    tips.push('Сверяйте фото с маркировкой и признаками разъёма/модуля, а не только «на глаз».');
    if (q.explanation) {
      tips.push(q.explanation.length > 140 ? q.explanation.slice(0, 140).trim() + '…' : q.explanation);
    }
  } else if (category === 'l3' && q.text.includes('/')) {
    tips.push('Расчёт маски удобно проверить в IPv4-тренажёре');
  } else {
    tips.push('Проверьте соответствие уровню модели OSI и формулировке стандарта');
  }
  return tips;
}

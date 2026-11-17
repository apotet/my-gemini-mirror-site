import type { Lesson, LessonBlock } from './types';

/** Explicit links from a reviewed question to the relevant paragraph inside an existing lesson.
 * A missing mapping deliberately keeps the ordinary lesson-at-top behavior: no guessed anchors.
 */
interface SectionLink {
  lessonId: string;
  questionIds: string[];
  anchorId: string;
  afterHeading: { plain: string; professional: string };
  plain: LessonBlock;
  professional: LessonBlock;
}
const SECTION_LINKS: readonly SectionLink[] = [
  {
    "lessonId": "l1-otdr-trace-interpretation",
    "questionIds": [
      "photo-otdr-end"
    ],
    "anchorId": "otdr-end-of-fiber",
    "afterHeading": {
      "plain": "Импульс и форма события",
      "professional": "Интерпретация рефлектограммы"
    },
    "plain": {
      "heading": "Конец волокна: почему трасса проваливается в шум",
      "body": "OTDR измеряет свет, возвращающийся из волокна. Пока волокно продолжается, прибор видит обратнорассеянный сигнал. После физического конца волокна или полного обрыва обратное рассеяние за событием практически исчезает: трасса резко падает и переходит к шумовому полу прибора.\n\nПеред спадом иногда виден пик отражения, но его отсутствие не исключает обрыв. Сильное затухание тоже может опустить сигнал ниже чувствительности OTDR, поэтому один график без шкалы и таблицы событий не всегда доказывает точную причину."
    },
    "professional": {
      "heading": "Конец трассы, noise floor и подтверждение события",
      "body": "На рефлектограмме конец волокна или полный обрыв часто проявляется резким прекращением измеримого Rayleigh backscatter с дальнейшим участком noise floor; при отражающем торце перед падением возможен Fresnel peak. Отсутствие пика не исключает физический конец: форма зависит от отражательной способности торца, длительности импульса и динамического диапазона.\n\nНе путай конец волокна с началом измерения у прибора, локальным изгибом или соединением, после которого уровень продолжается. В спорной ситуации сопоставь Event Table, дистанцию, launch fibre, pulse width и измерения на другой длине волны; сильная потеря способна скрыть последующую трассу под шумом."
    }
  },
  {
    "lessonId": "l7-dns",
    "questionIds": [
      "gen-osi-a-19"
    ],
    "anchorId": "dns-nxdomain-application",
    "afterHeading": {
      "plain": "Как разбирать ошибку поиска",
      "professional": "Если имя не резолвится"
    },
    "plain": {
      "heading": "Запрос A и NXDOMAIN — работа прикладного DNS",
      "body": "Программа хочет подключиться к files.example.test, поэтому её служба разрешения имён ищет DNS-запись типа A — IPv4-адрес этого имени. Если приходит NXDOMAIN, значит DNS ответил, что запрошенного доменного имени не существует. Полученного адреса нет, и подключение по нему начать невозможно.\n\nЗапрос DNS и понимание ответа — функция прикладного уровня (L7 в модели OSI). Транспорт доставляет данные сокету, но не решает, означает ли NXDOMAIN отсутствие имени. NXDOMAIN также отличается от ситуации, когда имя существует, но записи A у него нет."
    },
    "professional": {
      "heading": "DNS RCODE=3: интерпретация NXDOMAIN на уровне приложения",
      "body": "Клиентский resolver формирует запрос QNAME=files.example.test, QTYPE=A. DNS-ответ с RCODE=3 (NXDOMAIN) означает отрицательный результат для имени в контексте ответа, а не timeout и не успешный ответ NOERROR/NODATA без A-записи. Системный resolver/приложение интерпретирует результат на прикладном уровне и не может использовать этот поиск для получения IPv4-адреса назначения.\n\nСравни dig files.example.test A и dig files.example.test AAAA, статус, авторитетную зону и negative cache. Доставка DNS-датаграммы до UDP-сокета относится к транспортному уровню; понимание QTYPE и RCODE — к прикладной логике. Если адрес получен и соединение не стартует, расследование уже другое."
    }
  },
  {
    "lessonId": "tcpip-model",
    "questionIds": [
      "tcp-06"
    ],
    "anchorId": "tcpip-end-to-end-fields",
    "afterHeading": {
      "plain": "Кому доставлять на каждом шаге",
      "professional": "Четыре уровня DoD"
    },
    "plain": {
      "heading": "Что сохраняется от клиента до сервера без NAT и прокси",
      "body": "Когда пакет проходит обычные маршрутизаторы, IP-адрес отправителя, IP-адрес получателя и номер порта нужной службы остаются сквозными. Они нужны, чтобы в итоге доставить данные правильному серверу и приложению.\n\nНа каждом канальном участке Ethernet-кадр собирается заново, поэтому Source/Destination MAC меняются. IPv4 TTL уменьшается при маршрутизации. Значит, в вопросе выбираем Source IP, Destination IP и Destination TCP/UDP port — не Destination MAC и не TTL."
    },
    "professional": {
      "heading": "Сквозные L3/L4 поля и hop-by-hop L2/TTL",
      "body": "При обычной IPv4-пересылке без NAT и прикладных прокси маршрутизатор сохраняет конечные src/dst IP и TCP/UDP destination port, но уменьшает IPv4 TTL (и обновляет контрольную сумму IPv4-заголовка). Исходный Ethernet-кадр при маршрутизации снимается, на исходящий интерфейс формируется новый L2-заголовок с MAC следующего перехода.\n\nОтдельно учитывай границы условия: NAT/PAT способен менять адреса или порты, прокси создаёт новый сеанс, а туннель добавляет внешний пакет. Даже без NAT TCP/UDP checksum может перепроверяться на концах; не смешивай сквозную идентичность полей с гарантией доставки."
    }
  }
];

export interface AnchoredLessonBlock extends LessonBlock {
  anchorId?: string;
}

export function getLessonSectionForQuestion(lessonId: string, questionId: string | null | undefined): string | undefined {
  if (!questionId) return undefined;
  return SECTION_LINKS.find(item => item.lessonId === lessonId && item.questionIds.includes(questionId))?.anchorId;
}

/** Add concise sections to already-authored lessons without cloning entire protected lesson files.
 * Both reading modes receive an identically anchored section.
 */
export function getLessonBlocksWithSections(lesson: Lesson, mode: 'plain' | 'professional'): AnchoredLessonBlock[] {
  const base = mode === 'professional' && lesson.professional ? lesson.professional.blocks : lesson.blocks;
  const result: AnchoredLessonBlock[] = [...base];
  for (const section of SECTION_LINKS.filter(item => item.lessonId === lesson.id)) {
    const heading = mode === 'professional' ? section.afterHeading.professional : section.afterHeading.plain;
    const index = result.findIndex(block => block.heading === heading);
    // Fail closed: never place an unrelated-looking paragraph at the end of a changed lesson.
    // The strict contract test catches missing headings before publishing.
    if (index < 0) continue;
    result.splice(index + 1, 0, {
      ...(mode === 'professional' ? section.professional : section.plain),
      anchorId: section.anchorId,
    });
  }
  return result;
}

export const QUESTION_SECTION_LINKS = SECTION_LINKS.map(({lessonId,questionIds,anchorId,afterHeading}) => ({lessonId,questionIds,anchorId,afterHeading}));

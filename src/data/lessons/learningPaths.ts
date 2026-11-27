import type { PracticeLink } from '../practiceLinks';
import { getLessonReviewStatus } from './reviewStatus';

type LearningPathPractice =
  | { kind: 'available'; link: PracticeLink; title: string; goal: string }
  | { kind: 'planned'; scenarioId: string; title: string; goal: string };

interface LessonLearningPath {
  next?: { lessonId: string; reason: string };
  practice?: LearningPathPractice;
}

/** Pilot only: an authored next step, never a guess from category or keywords. */
export const PILOT_LEARNING_PATHS: Readonly<Record<string, LessonLearningPath>> = {
  'l3-route-selection': {
    next: {
      lessonId: 'l3-arp',
      reason: 'После выбора маршрута разберите, как узнать MAC ближайшего получателя и почему он не всегда принадлежит конечному адресату.',
    },
  },
  'l3-arp': {
    practice: {
      kind: 'available',
      link: 'packet',
      title: 'Путь пакета',
      goal: 'Найдите IP шлюза в ARP Request. Затем дойдите до ICMP Echo Request: MAC назначения кадра указывает на шлюз, а IP назначения пакета — на сервер.',
    },
  },
  'l3-ospf': {
    practice: {
      kind: 'planned',
      scenarioId: 'cisco-ospf-basic',
      title: 'OSPF на L3-коммутаторе',
      goal: 'В будущем сценарии можно будет настроить OSPF и проверить соседство и появление маршрутов.',
    },
  },
};

export function getLessonLearningPath(lessonId: string): LessonLearningPath | undefined {
  if (!Object.hasOwn(PILOT_LEARNING_PATHS, lessonId) || getLessonReviewStatus(lessonId) === 'approved') return undefined;
  return PILOT_LEARNING_PATHS[lessonId];
}

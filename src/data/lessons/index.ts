import { Lesson } from './types';
import { LESSON_TLS_SNI } from './tls-sni';
import { LESSON_L2_ACCESS_GUARD } from './l2-access-guard';
import { LESSON_L3_VRRP } from './l3-vrrp';
import { LESSON_TS_COPP_STORM } from './ts-copp-storm';
import { LESSON_L2_ACCESS_AUTH } from './l2-access-auth';
import { LESSON_L3_RPKI } from './l3-rpki';
import { LESSON_L4_TCP_LOSS } from './l4-tcp-loss';

export const LESSONS: Lesson[] = [LESSON_TLS_SNI, LESSON_L2_ACCESS_GUARD, LESSON_L3_VRRP, LESSON_TS_COPP_STORM, LESSON_L2_ACCESS_AUTH, LESSON_L3_RPKI, LESSON_L4_TCP_LOSS];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getLessonForQuestion(questionId: string): Lesson | undefined {
  return LESSONS.find((l) => l.relatedQuestionIds.includes(questionId));
}

export function searchLessons(query: string, layer?: string): Lesson[] {
  const q = query.trim().toLowerCase();
  return LESSONS.filter((l) => {
    if (layer && layer !== 'all' && !l.osiLayers.some((x) => x.toLowerCase().includes(layer.toLowerCase()))) {
      return false;
    }
    if (!q) return true;
    const hay = [l.title, l.summary, l.category, ...l.terms, ...l.osiLayers].join(' ').toLowerCase();
    return hay.includes(q);
  });
}

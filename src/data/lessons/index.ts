import { Lesson } from './types';
import { LESSON_TLS_SNI } from './tls-sni';
import { LESSON_L2_ACCESS_GUARD } from './l2-access-guard';
import { LESSON_L3_VRRP } from './l3-vrrp';

export const LESSONS: Lesson[] = [LESSON_TLS_SNI, LESSON_L2_ACCESS_GUARD, LESSON_L3_VRRP];

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

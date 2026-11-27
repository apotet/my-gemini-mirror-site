import type { Question } from '../types/quiz';
import retiredPvcPhoto from '../data/retiredPvcPhotoQuestion.json';
import retiredWiremapLimitPhoto from '../data/retiredWiremapLimitPhotoQuestion.json';
import previousCopperUtp from '../data/previousCopperUtpPhotoQuestion.json';
import previousOpticalInspection from '../data/previousOpticalInspectionQuestion.json';
import previousFiberEndFace from '../data/previousFiberEndFaceQuestion.json';

/** Allowlisted history only. Never use this snapshot for a new question selection. */
export const RETIRED_WIREMAP_LIMIT_PHOTO: Question = retiredWiremapLimitPhoto as Question;
export const RETIRED_PHOTO_QUESTIONS: readonly Question[] = [retiredPvcPhoto as Question, RETIRED_WIREMAP_LIMIT_PHOTO];
const retiredById = new Map(RETIRED_PHOTO_QUESTIONS.map(question => [question.id, question]));
export const getRetiredPhotoQuestion = (id: unknown) => typeof id === 'string' ? retiredById.get(id) : undefined;
export const PREVIOUS_FIBER_END_FACE = previousFiberEndFace as Question;

const previousById = new Map([
  [previousCopperUtp.id, previousCopperUtp],
  [previousOpticalInspection.id, previousOpticalInspection],
  [previousFiberEndFace.id, previousFiberEndFace],
]);

export function hasPhotoQuestionHistory(id: string): boolean {
  return retiredById.has(id) || previousById.has(id);
}

type SavedQuestion = { id?: unknown; text?: unknown; image?: unknown; answers?: unknown; correct?: unknown };

/** Only allowlisted photo questions reach this check. */
export function restoreHistoricalPhotoQuestion(saved: SavedQuestion | null | undefined, order: unknown, current: Question): Question | null {
  if (saved?.id !== current.id) return null;
  const previous = previousById.get(current.id);
  const original = previous && saved.text === previous.text ? { ...current, ...previous } : current;
  if (saved.text !== original.text || saved.image !== original.image) return null;
  if (order !== undefined && (!Array.isArray(order) || order.length !== original.answers.length ||
      new Set(order).size !== original.answers.length ||
      order.some(i => !Number.isInteger(i) || i < 0 || i >= original.answers.length))) return null;
  const answers = order === undefined ? original.answers : order.map(i => original.answers[i]);
  const correct = order === undefined ? original.correct :
    order.flatMap((i, displayed) => original.correct.includes(i) ? [displayed] : []);
  if (JSON.stringify(saved.answers) !== JSON.stringify(answers) || JSON.stringify(saved.correct) !== JSON.stringify(correct)) return null;
  return { ...original, answers: [...answers], correct: [...correct] };
}

/** Archived reviews can predate order metadata; infer an exact permutation of this ticket's unique labels. */
export function isRetiredWiremapReviewSnapshot(saved: Question, answerOrders: unknown): boolean {
  const original = RETIRED_WIREMAP_LIMIT_PHOTO;
  if (saved.imageAlt !== original.imageAlt) return false;
  if (answerOrders === undefined) {
    return Boolean(restoreHistoricalPhotoQuestion(saved, saved.answers.map(answer => original.answers.indexOf(answer)), original));
  }
  if (answerOrders === null || typeof answerOrders !== 'object' || Array.isArray(answerOrders)) return false;
  const order = (answerOrders as Record<string, unknown>)[original.id];
  return order !== undefined && Boolean(restoreHistoricalPhotoQuestion(saved, order, original));
}

import type { Question } from '../types/quiz';
import retiredPvcPhoto from '../data/retiredPvcPhotoQuestion.json';
import previousCopperUtp from '../data/previousCopperUtpPhotoQuestion.json';

/** Allowlisted history only. Never use this snapshot for a new question selection. */
export const RETIRED_PVC_PHOTO = retiredPvcPhoto as Question;
export const COPPER_UTP_PHOTO_ID = previousCopperUtp.id;

type SavedQuestion = { id?: unknown; text?: unknown; image?: unknown; answers?: unknown; correct?: unknown };

/** Only the retired PVC snapshot and the current/previous UTP wording reach this check. */
export function restoreCopperPhoto(saved: SavedQuestion | null | undefined, order: unknown, current: Question): Question | null {
  if (saved?.id !== current.id || saved.image !== current.image) return null;
  const original = current.id === COPPER_UTP_PHOTO_ID && saved.text === previousCopperUtp.text
    ? { ...current, ...previousCopperUtp } : current;
  if (saved.text !== original.text) return null;
  if (order !== undefined && (!Array.isArray(order) || order.length !== original.answers.length ||
      new Set(order).size !== original.answers.length ||
      order.some(i => !Number.isInteger(i) || i < 0 || i >= original.answers.length))) return null;
  const answers = order === undefined ? original.answers : order.map(i => original.answers[i]);
  const correct = order === undefined ? original.correct :
    order.flatMap((i, displayed) => original.correct.includes(i) ? [displayed] : []);
  if (JSON.stringify(saved.answers) !== JSON.stringify(answers) || JSON.stringify(saved.correct) !== JSON.stringify(correct)) return null;
  return { ...original, answers: [...answers], correct: [...correct] };
}

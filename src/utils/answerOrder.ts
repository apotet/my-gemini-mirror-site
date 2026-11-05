import type { Question } from '../types/quiz';

export interface AttemptAnswerOrder {
  answerOrderVersion: 1;
  /** Display index -> original bank index; identity permutations are valid. */
  answerOrders: Record<string, number[]>;
}

export function applyAnswerOrder(question: Question, order: number[]): Question {
  return { ...question, answers: order.map(index => question.answers[index]),
    correct: order.flatMap((index, displayIndex) => question.correct.includes(index) ? [displayIndex] : []) };
}

/** Called once, after question selection, for every new attempt (including mistakes). */
export function prepareAttemptQuestions(questions: readonly Question[], random: () => number = Math.random):
  AttemptAnswerOrder & { questions: Question[] } {
  const answerOrders: Record<string, number[]> = {};
  const shuffled = questions.map(question => {
    const order = question.answers.map((_, index) => index);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    answerOrders[question.id] = order;
    return applyAnswerOrder(question, order);
  });
  return { questions: shuffled, answerOrderVersion: 1, answerOrders };
}

/** Do not trust saved keys or infer permutations from answer text (which can repeat). */
export function restoreOrderedQuestion(question: Question, order: unknown, snapshot: Question): Question | null {
  if (!Array.isArray(order) || order.length !== question.answers.length || new Set(order).size !== order.length ||
      order.some(index => !Number.isInteger(index) || index < 0 || index >= question.answers.length)) return null;
  const restored = applyAnswerOrder(question, order);
  if (!Array.isArray(snapshot.answers) || !Array.isArray(snapshot.correct) ||
      snapshot.answers.length !== restored.answers.length || snapshot.correct.length !== restored.correct.length ||
      snapshot.answers.some((answer, index) => answer !== restored.answers[index]) ||
      new Set(snapshot.correct).size !== snapshot.correct.length ||
      snapshot.correct.some(index => !restored.correct.includes(index))) return null;
  return restored;
}

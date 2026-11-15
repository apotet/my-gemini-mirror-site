import type { ExamDifficulty, Question, QuizModeId, QuizSession } from '../types/quiz';
import { LEARNING_LEVELS, isLearningLevel, type LearningLevel } from '../types/learningLevel';
import { ALL_QUESTIONS, filterExamDifficulty, getExamPool, getRandomQuestions } from './questionsData';
import { getLearningLevelMetadata, getLearningLevelStatistics } from './learningLevels';
import { selectFamilyQuestions } from './beginnerExam';

export const LEARNING_LEVEL_REVIEW_COUNT = getLearningLevelStatistics().reviewIds.length;

/** REVIEW has no assigned level. Unknown IDs fail explicitly in the registry lookup. */
export function filterLearningLevel(questions: readonly Question[], level: LearningLevel): Question[] {
  if (!isLearningLevel(level)) throw new RangeError('Unknown learning level');
  return questions.filter(question => {
    const metadata = getLearningLevelMetadata(question.id);
    return metadata.status === 'ASSIGNED' && metadata.learningLevel === level;
  });
}

export function getLearningLevelPool(mode: QuizModeId, level: LearningLevel): Question[] {
  return filterLearningLevel(ALL_QUESTIONS.filter(q => mode === 'mixed' || q.group === mode), level);
}

/** Custom topics/mistakes are closed pools: never top up from the rest of the bank. */
export function getLearningLevelQuestions(
  mode: QuizModeId, count: number, random: () => number, level: LearningLevel,
  customQuestions?: readonly Question[],
): Question[] {
  const pool = customQuestions ? filterLearningLevel(customQuestions, level) : getLearningLevelPool(mode, level);
  return selectFamilyQuestions(pool, count, random);
}

const UNDERSTANDING_LEVEL = 2;

export function getTestingPool(mode: QuizModeId, difficulty: ExamDifficulty): Question[] {
  return difficulty === 'in-depth'
    ? getLearningLevelPool(mode, UNDERSTANDING_LEVEL)
    : getExamPool(mode, difficulty);
}

export function getTestingQuestions(
  mode: QuizModeId, count: number, random: () => number, difficulty: ExamDifficulty,
  customQuestions?: readonly Question[],
): Question[] {
  if (difficulty === 'in-depth') {
    return getLearningLevelQuestions(mode, count, random, UNDERSTANDING_LEVEL, customQuestions);
  }
  return customQuestions
    ? filterExamDifficulty(customQuestions, difficulty).slice(0, count)
    : getRandomQuestions(mode, count, random, difficulty);
}

export function getExamLevelLabel(session: Pick<QuizSession, 'learningLevel' | 'difficulty'>): string {
  if (isLearningLevel(session.learningLevel)) return LEARNING_LEVELS[session.learningLevel].ru;
  return session.difficulty === 'beginner' ? 'База (старый режим)' : 'Смешанный (старый режим)';
}

export const LEARNING_LEVEL_DESCRIPTIONS: Record<LearningLevel, string> = {
  1: 'Термины, базовые понятия и назначение оборудования',
  2: 'Принципы работы сетей, причины и следствия',
  3: 'Настройка, расчёты и выбор практических действий',
  4: 'Поиск неисправностей и анализ результатов команд',
  5: 'Многошаговые инженерные кейсы и обоснование решений',
};

import { QUESTION_LEARNING_LEVELS } from './learningLevels';
import { getLessonForQuestion } from './lessons';
import { getLessonSectionForQuestion } from './lessons/lessonSectionLinks';
import { ALL_QUESTIONS } from './questionsData';
import type { Question } from '../types/quiz';

export const COURSE_STORAGE_KEY = 'osi_netops_mirror_addressing_course_v1';
export const COURSE_LESSON_IDS = ['l3-masks', 'l3-private-ipv4', 'l3-subnets', 'l3-ipv6'] as const;
export const COURSE_QUESTION_COUNT = 20;
export const COURSE_PASS_SCORE = 16;
export type CourseLessonId = typeof COURSE_LESSON_IDS[number];

// The pilot uses one closed blueprint. Different registry families need not test different skills.
// Keep the approved ID order as data, not as the display order of an attempt.
export const COURSE_BUCKETS = [
  {
    id: 'masks', title: 'IPv4: маски и частные адреса', quota: 5, lessonIds: ['l3-masks', 'l3-private-ipv4'],
    questionIds: ['l3-12', 'l3-06', 'gen-bin-dec-128', 'gen-bin-dec-252', 'gen-mask-30'],
  },
  {
    id: 'subnets', title: 'IPv4: границы и подсети', quota: 9, lessonIds: ['l3-subnets'],
    questionIds: ['gen-bc-25-2', 'gen-bc-26-1', 'gen-hosts-27', 'l3-11', 'gen-net-29-0', 'l3-d02', 'new-l3-23', 'gap-pack1-06', 'gen-block-28'],
  },
  {
    id: 'ipv6', title: 'IPv6: локальная настройка', quota: 6, lessonIds: ['l3-ipv6'],
    questionIds: ['review-ndp-1', 'review-ndp-2', 'review-ndp-3', 'review-slaac-4', 'review-slaac-5', 'l3-d06'],
  },
] as const;
export type CourseBucketId = typeof COURSE_BUCKETS[number]['id'];
type CourseQuestionId = typeof COURSE_BUCKETS[number]['questionIds'][number];
const SKILLS: Record<CourseQuestionId, string> = {
  'l3-12': 'Частные диапазоны IPv4',
  'l3-06': 'Префикс → десятичная маска',
  'gen-bin-dec-128': 'Перевод двоичного октета',
  'gen-bin-dec-252': 'Полная маска → префикс',
  'gen-mask-30': 'Префикс → десятичная маска',
  'gen-bc-25-2': 'On-link с разными масками',
  'gen-bc-26-1': 'On-link адрес шлюза',
  'gen-hosts-27': 'Расчёт ёмкости подсети',
  'l3-11': 'Допустимые адреса хостов',
  'gen-net-29-0': 'Начало блока и адрес сети',
  'l3-d02': 'Широковещательный адрес',
  'new-l3-23': 'Границы блока в соседних октетах',
  'gap-pack1-06': 'Выделение подсетей и резерва',
  'gen-block-28': 'Шаг подсетей',
  'review-ndp-1': 'Поиск канального адреса через NDP',
  'review-ndp-2': 'RA и шлюз по умолчанию',
  'review-ndp-3': 'DAD и дубликат адреса',
  'review-slaac-4': 'Создание адреса через SLAAC',
  'review-slaac-5': 'Флаги L и A в RA',
  'l3-d06': 'Назначение link-local',
};

export interface CourseQuestion {
  id: string;
  family: string;
  bucketId: CourseBucketId;
  skill: string;
  topic: string;
  text: string;
  options: string[];
  correct: number[];
  explanation: string;
  lessonId: CourseLessonId;
  sectionId?: string;
}
export interface CourseAttempt {
  id: string;
  questions: CourseQuestion[];
  /** Prefix of confirmed options in display order, never a draft selection. */
  answers: number[];
}
export interface CourseCursor {
  screen: 'overview' | 'lesson' | 'ipv4' | 'ipv6-compress' | 'ipv6-expand' | 'attempt' | 'review';
  lessonId?: CourseLessonId;
  mode?: 'meaning' | 'professional';
  sectionId?: string;
  questionId?: string;
  attemptId?: string;
}
export interface CourseState {
  version: 1;
  cursor: CourseCursor;
  studied: CourseLessonId[];
  ipv6: { compress: boolean; expand: boolean };
  active: CourseAttempt | null;
  history: CourseAttempt[];
}

export function emptyCourseState(): CourseState {
  return {
    version: 1, cursor: { screen: 'overview' }, studied: [],
    ipv6: { compress: false, expand: false }, active: null, history: [],
  };
}

type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
type CourseRead =
  | { status: 'ready'; raw: string | null; state: CourseState }
  | { status: 'blocked' | 'invalid' };
type CourseWrite =
  | { status: 'saved'; raw: string }
  | { status: 'blocked' | 'conflict' };

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; --i) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isRecord(item: unknown): item is Record<string, unknown> {
  return typeof item === 'object' && item !== null && !Array.isArray(item);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOptionIndex(value: unknown, length: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < length;
}

function isCourseLessonId(value: unknown): value is CourseLessonId {
  return typeof value === 'string' && COURSE_LESSON_IDS.some(id => id === value);
}

function makeQuestion(id: CourseQuestionId, bucket: typeof COURSE_BUCKETS[number], bank: readonly Question[], random: () => number): CourseQuestion | null {
  const matches = bank.filter(question => question.id === id);
  if (matches.length !== 1) return null;

  const question = matches[0];
  const level = QUESTION_LEARNING_LEVELS[id];
  const lessonId = getLessonForQuestion(id)?.id;
  if (level?.status !== 'ASSIGNED' || ![1, 2, 3].includes(level.learningLevel) ||
      !isCourseLessonId(lessonId) || !bucket.lessonIds.some(lesson => lesson === lessonId) ||
      question.image || !isText(question.text) || !isText(question.topic) || !isText(question.explanation) ||
      !question.answers.every(isText) || new Set(question.answers).size !== question.answers.length ||
      question.answers.length !== 4 || question.correct.length !== 1 ||
      !isOptionIndex(question.correct[0], question.answers.length)) return null;

  const ordered = shuffled(question.answers.map((text, index) => ({ text, index })), random);
  const sectionId = getLessonSectionForQuestion(lessonId, id);
  return {
    id, family: question.family || id, bucketId: bucket.id, skill: SKILLS[id], topic: question.topic,
    text: question.text, options: ordered.map(option => option.text),
    correct: [ordered.findIndex(option => option.index === question.correct[0])],
    explanation: question.explanation, lessonId, ...(sectionId ? { sectionId } : {}),
  };
}

export function makeCourseAttempt(id: string, random = Math.random, bank: readonly Question[] = ALL_QUESTIONS): CourseAttempt | null {
  if (!isText(id)) return null;
  const questions: CourseQuestion[] = [];
  for (const bucket of COURSE_BUCKETS) {
    if (bucket.questionIds.length !== bucket.quota) return null;
    for (const questionId of bucket.questionIds) {
      const question = makeQuestion(questionId, bucket, bank, random);
      if (!question) return null;
      questions.push(question);
    }
  }

  const attempt = { id, questions: shuffled(questions, random), answers: [] };
  return isCourseAttempt(attempt, false) ? attempt : null;
}

export function startCourseAttempt(state: CourseState, id: string, random = Math.random): CourseState | null {
  if (state.active || state.history.some(attempt => attempt.id === id)) return null;
  const active = makeCourseAttempt(id, random);
  return active ? { ...state, active, cursor: { ...state.cursor, screen: 'attempt', attemptId: active.id, questionId: undefined, sectionId: undefined } } : null;
}

export function answerCourseQuestion(state: CourseState, selected: number): CourseState | null {
  const active = state.active;
  const pending = active?.questions[active.answers.length];
  if (!pending || !isOptionIndex(selected, pending.options.length)) return null;

  const attempt = { ...active, answers: [...active.answers, selected] };
  if (attempt.answers.length < COURSE_QUESTION_COUNT) return { ...state, active: attempt };
  return {
    ...state, active: null, history: [...state.history, attempt],
    cursor: { ...state.cursor, screen: 'review', attemptId: attempt.id, questionId: undefined, sectionId: undefined },
  };
}

export function scoreCourseAttempt(attempt: CourseAttempt): number {
  return attempt.answers.reduce((score, selected, index) =>
    score + Number(attempt.questions[index]?.correct[0] === selected), 0);
}

export function courseAttemptPassed(attempt: CourseAttempt): boolean {
  return attempt.answers.length === COURSE_QUESTION_COUNT && scoreCourseAttempt(attempt) >= COURSE_PASS_SCORE;
}

// Validate only the snapshot envelope and membership of this pilot revision. Do not compare stored
// text, options, families, resolved links or keys to the live bank when restoring a historical attempt.
function isCourseAttempt(value: unknown, completed: boolean): value is CourseAttempt {
  if (!isRecord(value) || !isText(value.id) ||
      !Array.isArray(value.questions) || value.questions.length !== COURSE_QUESTION_COUNT ||
      !Array.isArray(value.answers) || (completed
        ? value.answers.length !== COURSE_QUESTION_COUNT
        : value.answers.length >= COURSE_QUESTION_COUNT)) return false;

  const ids = new Set<string>();
  const families = new Set<string>();
  const bucketCounts = new Map<CourseBucketId, number>();
  for (const [index, question] of value.questions.entries()) {
    if (!isRecord(question) ||
        !isText(question.id) || ids.has(question.id) ||
        !isText(question.family) || families.has(question.family) ||
        !isText(question.skill) || !isText(question.topic) || !isText(question.text) || !isText(question.explanation) ||
        !Array.isArray(question.options) || question.options.length !== 4 ||
        !question.options.every(isText) || new Set(question.options).size !== question.options.length ||
        !Array.isArray(question.correct) || question.correct.length !== 1 ||
        !isOptionIndex(question.correct[0], question.options.length) ||
        !isCourseLessonId(question.lessonId) ||
        (question.sectionId !== undefined && !isText(question.sectionId))) return false;

    const bucket = COURSE_BUCKETS.find(entry => entry.id === question.bucketId);
    if (!bucket || !bucket.questionIds.some(id => id === question.id) ||
        !bucket.lessonIds.some(id => id === question.lessonId)) return false;
    if (index < value.answers.length && !isOptionIndex(value.answers[index], question.options.length)) return false;
    ids.add(question.id);
    families.add(question.family);
    bucketCounts.set(bucket.id, (bucketCounts.get(bucket.id) ?? 0) + 1);
  }
  return COURSE_BUCKETS.every(bucket => bucketCounts.get(bucket.id) === bucket.quota);
}

function isCourseState(value: unknown): value is CourseState {
  if (!isRecord(value) || value.version !== 1 ||
      !Array.isArray(value.studied) || !value.studied.every(isCourseLessonId) ||
      new Set(value.studied).size !== value.studied.length ||
      !isRecord(value.ipv6) || typeof value.ipv6.compress !== 'boolean' || typeof value.ipv6.expand !== 'boolean' ||
      (value.active !== null && !isCourseAttempt(value.active, false)) ||
      !Array.isArray(value.history) || !value.history.every(attempt => isCourseAttempt(attempt, true)) ||
      !isRecord(value.cursor)) return false;

  const active = value.active as CourseAttempt | null;
  const history = value.history as CourseAttempt[];
  const ids = new Set(history.map(attempt => attempt.id));
  if (ids.size !== history.length || (active && ids.has(active.id))) return false;

  const { screen, lessonId, mode, sectionId, questionId, attemptId } = value.cursor;
  if (typeof screen !== 'string' || !['overview', 'lesson', 'ipv4', 'ipv6-compress', 'ipv6-expand', 'attempt', 'review'].includes(screen) ||
      (lessonId !== undefined && !isCourseLessonId(lessonId)) ||
      (mode !== undefined && mode !== 'meaning' && mode !== 'professional') ||
      (sectionId !== undefined && !isText(sectionId)) ||
      (attemptId !== undefined && !isText(attemptId)) ||
      (questionId !== undefined && !isText(questionId))) return false;

  if (screen === 'lesson' && !lessonId) return false;
  if (screen === 'ipv4' && lessonId !== 'l3-subnets') return false;
  if ((screen === 'ipv6-compress' || screen === 'ipv6-expand') && lessonId !== 'l3-ipv6') return false;
  if (screen === 'attempt' && (!active || (attemptId !== undefined && attemptId !== active.id))) return false;
  if (screen === 'review' && !ids.has(attemptId as string)) return false;
  if (questionId !== undefined && (screen !== 'lesson' || !history.some(attempt =>
    attempt.id === attemptId && attempt.questions.some(question =>
      question.id === questionId && question.lessonId === lessonId)))) return false;
  return true;
}

export function readCourseStorage(storage: StoragePort): CourseRead {
  let raw: string | null;
  try {
    raw = storage.getItem(COURSE_STORAGE_KEY);
  } catch {
    return { status: 'blocked' };
  }

  if (raw === null) return { status: 'ready', raw, state: emptyCourseState() };
  try {
    const state: unknown = JSON.parse(raw);
    return isCourseState(state) ? { status: 'ready', raw, state } : { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}

/** Call while holding the course's Web Lock when supported. A stale snapshot is never written silently. */
export function writeCourseStorage(storage: StoragePort, expectedRaw: string | null, state: CourseState): CourseWrite {
  try {
    const current = readCourseStorage(storage);
    if (current.status !== 'ready') return { status: 'blocked' };
    if (current.raw !== expectedRaw) return { status: 'conflict' };
    if (!isCourseState(state)) return { status: 'blocked' };

    const raw = JSON.stringify(state);
    storage.setItem(COURSE_STORAGE_KEY, raw);
    return { status: 'saved', raw };
  } catch {
    return { status: 'blocked' };
  }
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Ipv4Trainer } from './Ipv4Trainer';
import { Ipv6Trainer } from './Ipv6Trainer';
import { LessonView } from './LessonView';
import { LESSONS } from '../data/lessons';
import {
  COURSE_BUCKETS, COURSE_LESSON_IDS, COURSE_PASS_SCORE, COURSE_QUESTION_COUNT, COURSE_STORAGE_KEY,
  answerCourseQuestion, courseAttemptPassed, readCourseStorage, scoreCourseAttempt, startCourseAttempt,
  writeCourseStorage,
  type CourseAttempt, type CourseCursor, type CourseLessonId, type CourseState,
} from '../data/addressingCourse';

const lessonById = new Map(LESSONS.map(lesson => [lesson.id, lesson]));
const browserStorage = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
};
const button = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800';
const primary = button + ' border-cyan-700 bg-cyan-700 text-white hover:bg-cyan-800 dark:border-cyan-300 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300';
const panel = 'space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50 sm:p-5';

type StorageRead = ReturnType<typeof readCourseStorage>;
type SaveStatus = 'saved' | 'blocked' | 'conflict' | 'invalid' | 'lock-unavailable';
const lockWarning = 'Курс открыт только для просмотра: браузер не может безопасно сохранять прогресс между вкладками. Уроки и сохранённые результаты доступны, новые ответы и отметки не сохраняются.';
let lockRequestFailed = false;
function courseLocks(): LockManager | undefined {
  if (lockRequestFailed) return;
  try {
    const locks = window.navigator.locks;
    return typeof locks?.request === 'function' ? locks : undefined;
  } catch {
    return undefined;
  }
}
const messages = {
  blocked: 'Браузер не дал сохранить данные курса. Проверьте настройки или место в хранилище и повторите. Ответ и отметка не засчитаны.',
  conflict: 'Курс изменился в другой вкладке. Показано сохранённое состояние. Проверьте его перед следующим действием.',
  invalid: 'Сохранённые данные курса не удалось прочитать или подготовить. Они не перезаписаны.',
};

const viewportPosition = (element: HTMLElement) => element.getBoundingClientRect().top;
type ReturnTarget = { control: string; top: number };
const practiceTitle = {
  ipv4: 'Практика IPv4',
  'ipv6-compress': 'Сжатая запись IPv6',
  'ipv6-expand': 'Полная запись IPv6',
} as const;
type PracticeScreen = keyof typeof practiceTitle;

function Result({
  attempt, busy, hasActive, canWrite, onLesson, onOverview, onRetry,
}: {
  attempt: CourseAttempt;
  busy: boolean;
  hasActive: boolean;
  canWrite: boolean;
  onLesson: (index: number, trigger: HTMLButtonElement) => void;
  onOverview: () => void;
  onRetry: () => void;
}) {
  const score = scoreCourseAttempt(attempt);
  const wrong = attempt.questions.flatMap((q, i) => attempt.answers[i] !== q.correct[0] ? [{ q, i }] : []);
  return <div className="space-y-4">
    <div className={panel}>
      <p data-course-score className="text-xl font-bold">{score} из {COURSE_QUESTION_COUNT} · {courseAttemptPassed(attempt) ? 'Итог пройден' : 'Итог не пройден'}</p>
      <p className="text-sm">Для прохождения нужно {COURSE_PASS_SCORE} из {COURSE_QUESTION_COUNT}. Этот результат не меняет отметки уроков и упражнения по записи IPv6.</p>
      <ul className="space-y-1 text-sm">
        {COURSE_BUCKETS.map(bucket => {
          const indexes = attempt.questions.flatMap((q, i) => q.bucketId === bucket.id ? [i] : []);
          return <li key={bucket.id}>{bucket.title}: {indexes.filter(i => attempt.answers[i] === attempt.questions[i].correct[0]).length}/{indexes.length}</li>;
        })}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={busy} onClick={onOverview}>К оглавлению курса</button>
        <button type="button" className={primary} disabled={busy || (!hasActive && !canWrite)} onClick={onRetry}>{hasActive ? 'Продолжить текущую попытку' : 'Новая попытка'}</button>
      </div>
    </div>
    <section aria-label="Разбор ошибок" className="space-y-2">
      <h3 className="font-bold">Разбор ошибок</h3>
      {!wrong.length && <p className="text-sm">Ошибок нет.</p>}
      {wrong.map(({ q, i }) => <article key={q.id} data-course-error={q.id} className={panel}>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{q.skill}</p>
        <h4 className="font-bold">{q.text}</h4>
        <dl className="space-y-1 text-sm">
          <div><dt className="inline font-bold">Ваш ответ: </dt><dd className="inline">{q.options[attempt.answers[i]]}</dd></div>
          <div><dt className="inline font-bold">Верный ответ: </dt><dd className="inline">{q.options[q.correct[0]]}</dd></div>
        </dl>
        {q.explanation && <p className="text-sm whitespace-pre-line">{q.explanation}</p>}
        <button type="button" className={button} data-course-focus={`error-${q.id}`} disabled={busy} onClick={e => onLesson(i, e.currentTarget)}>
          {q.sectionId ? 'К разделу урока' : 'К уроку'}: {lessonById.get(q.lessonId)?.title ?? q.lessonId}
        </button>
      </article>)}
    </section>
  </div>;
}

function CurrentQuestion({ attempt, busy, onAnswer }: {
  attempt: CourseAttempt;
  busy: boolean;
  onAnswer: (answer: number) => void;
}) {
  const [selected, setSelected] = useState<number>();
  const q = attempt.questions[attempt.answers.length];
  return <form className={panel} onSubmit={e => { e.preventDefault(); if (selected !== undefined && !busy) onAnswer(selected); }}>
    <p data-course-question-number className="text-sm font-semibold">Вопрос {attempt.answers.length + 1} из {COURSE_QUESTION_COUNT}</p>
    <fieldset className="min-w-0 space-y-2" disabled={busy} data-course-question={q.id}>
      <legend className="pb-3 font-bold">{q.text}</legend>
      {q.options.map((option, index) => <label key={index} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-2 has-checked:border-cyan-500 dark:border-slate-700">
        <input className="shrink-0" type="radio" name="addressing-option" checked={selected === index} onChange={() => setSelected(index)} />
        <span className="break-words min-w-0">{option}</span>
      </label>)}
    </fieldset>
    <button className={primary} type="submit" disabled={selected === undefined || busy}>
      {attempt.answers.length + 1 === COURSE_QUESTION_COUNT ? 'Завершить итог' : 'Сохранить ответ'}
    </button>
  </form>;
}

export function AddressingCourse() {
  const [record, setRecord] = useState(() => readCourseStorage(browserStorage));
  const latestRecord = useRef<StorageRead>(record);
  const [preview, setPreview] = useState<CourseCursor>();
  const [notice, setNotice] = useState<string | null>(() => record.status === 'ready' ? null : messages[record.status]);
  const busyMutation = useRef(false);
  const [busy, setBusy] = useState(false);
  const [lockAvailable, setLockAvailable] = useState(() => !!courseLocks());
  const heading = useRef<HTMLHeadingElement>(null);
  const alert = useRef<HTMLParagraphElement>(null);
  const root = useRef<HTMLElement>(null);
  const returnTarget = useRef<ReturnTarget | null>(null);
  const returnPending = useRef<string | null>(null);

  const adopt = (next: StorageRead) => {
    latestRecord.current = next;
    setRecord(next);
  };
  useEffect(() => {
    const update = (event: StorageEvent) => {
      if (event.key !== COURSE_STORAGE_KEY && event.key !== null) return;
      const next = readCourseStorage(browserStorage);
      if (next.status === 'ready' && latestRecord.current.status === 'ready' && next.raw === latestRecord.current.raw) return;
      adopt(next);
      setPreview(undefined);
      setNotice(next.status === 'ready' ? messages.conflict : messages[next.status]);
    };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);

  const commit = async (apply: (state: CourseState) => CourseState | null): Promise<SaveStatus> => {
    if (busyMutation.current) return 'conflict';
    const locks = lockAvailable ? courseLocks() : undefined;
    if (!locks) {
      setLockAvailable(false);
      return 'lock-unavailable';
    }
    const current = latestRecord.current;
    if (current.status !== 'ready') {
      setNotice(messages[current.status]);
      return current.status;
    }
    if (record.status !== 'ready' || record.raw !== current.raw) {
      setNotice(messages.conflict);
      return 'conflict';
    }
    const next = apply(current.state);
    if (!next) {
      setNotice(messages.invalid);
      return 'invalid';
    }
    busyMutation.current = true;
    setBusy(true);
    try {
      // Shared localStorage has no atomic compare-and-set. Never write without this lock.
      const result = await locks.request(COURSE_STORAGE_KEY, () => writeCourseStorage(browserStorage, current.raw, next));
      if (result.status === 'saved') {
        adopt({ status: 'ready', raw: result.raw, state: next });
        setPreview(undefined);
        setNotice(null);
        return 'saved';
      }
      if (result.status === 'conflict') {
        adopt(readCourseStorage(browserStorage));
        setPreview(undefined);
      }
      setNotice(messages[result.status]);
      return result.status;
    } catch {
      // Storage errors are returned by writeCourseStorage; a lock denial is a separate failure.
      lockRequestFailed = true;
      setLockAvailable(false);
      return 'lock-unavailable';
    } finally {
      busyMutation.current = false;
      setBusy(false);
    }
  };

  const refresh = () => {
    const next = readCourseStorage(browserStorage);
    adopt(next);
    setPreview(undefined);
    setNotice(next.status === 'ready' ? null : messages[next.status]);
  };

  const state = record.status === 'ready' ? record.state : undefined;
  const canWrite = !!state && lockAvailable;
  const cursor: CourseCursor = preview ?? state?.cursor ?? { screen: 'overview' };
  const mainLesson = cursor.lessonId ? lessonById.get(cursor.lessonId) : undefined;
  const lessonIndex = cursor.lessonId ? COURSE_LESSON_IDS.indexOf(cursor.lessonId) : -1;
  const selectedAttempt = cursor.attemptId ? state?.history.find(a => a.id === cursor.attemptId) : undefined;
  const headings = {
    overview: 'IP-адресация',
    lesson: 'Учебный шаг',
    ...practiceTitle,
    attempt: 'Итоговый тест',
    review: 'Результат итогового теста',
  };

  useLayoutEffect(() => {
    if (returnPending.current) {
      const id = returnPending.current;
      const button = root.current?.querySelector<HTMLElement>(`[data-course-focus="${id}"]`);
      returnPending.current = null;
      if (button) {
        const remembered = returnTarget.current?.control === id ? returnTarget.current.top : undefined;
        if (remembered !== undefined) {
          const offset = Math.max(80, Math.min(remembered, window.innerHeight - button.offsetHeight - 96));
          window.scrollBy({ top: button.getBoundingClientRect().top - offset, behavior: 'instant' });
        } else button.scrollIntoView({ block: 'center', behavior: 'instant' });
        button.focus({ preventScroll: true });
        returnTarget.current = null;
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    // LessonView places focus on the saved section, or on its heading if the section was moved.
    if (!cursor.questionId) heading.current?.focus({ preventScroll: true });
  }, [cursor.screen, cursor.lessonId, cursor.questionId, cursor.attemptId]);

  useLayoutEffect(() => {
    if (notice && notice !== messages.conflict && alert.current) {
      const { top, bottom } = alert.current.getBoundingClientRect();
      if (top < 72 || bottom > window.innerHeight - 85) alert.current.scrollIntoView({ block: 'center', behavior: 'instant' });
      alert.current.focus({ preventScroll: true });
    }
  }, [notice]);

  const move = async (next: CourseCursor) => {
    const status = await commit(s => ({ ...s, cursor: next }));
    if (status === 'blocked' || status === 'invalid' || status === 'lock-unavailable') {
      // Reading remains available, but no progress or grades are claimed on failed writes.
      setPreview(next);
    }
    return status;
  };
  const overview = () => { void move({ screen: 'overview' }); };
  const lesson = (lessonId: CourseLessonId) => {
    void move({ screen: 'lesson', lessonId, mode: cursor.mode ?? 'meaning' });
  };
  const saveMode = (mode: NonNullable<CourseCursor['mode']>) => {
    void move({ ...cursor, mode });
  };
  const startOrResume = () => {
    const id = window.crypto?.randomUUID?.() ?? `addressing-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    if (state?.active) {
      void move({ screen: 'attempt' });
    } else if (canWrite) {
      void commit(s => startCourseAttempt(s, id));
    }
  };

  const openPractice = (screen: PracticeScreen, trigger: HTMLButtonElement) => {
    returnTarget.current = { control: screen, top: viewportPosition(trigger) };
    void move({ ...cursor, screen });
  };
  const returnToLesson = (screen: PracticeScreen) => {
    returnPending.current = screen;
    void move({ ...cursor, screen: 'lesson' }).then(result => {
      if (result === 'conflict') returnPending.current = null;
    });
  };
  const openReviewLesson = (index: number, trigger: HTMLButtonElement) => {
    const q = selectedAttempt?.questions[index];
    if (!q || !selectedAttempt) return;
    returnTarget.current = { control: `error-${q.id}`, top: viewportPosition(trigger) };
    void move({ screen: 'lesson', mode: 'meaning', lessonId: q.lessonId, sectionId: q.sectionId, questionId: q.id, attemptId: selectedAttempt.id });
  };
  const returnToReview = () => {
    if (!selectedAttempt || !cursor.questionId) return;
    returnPending.current = `error-${cursor.questionId}`;
    void move({ screen: 'review', attemptId: selectedAttempt.id }).then(result => {
      if (result === 'conflict') returnPending.current = null;
    });
  };
  const saveWriting = async (mode: 'compress' | 'expand') => {
    if (!canWrite) return false;
    if (state?.ipv6[mode] && courseLocks()) return true;
    return await commit(s => ({ ...s, ipv6: { ...s.ipv6, [mode]: true } })) === 'saved';
  };
  const answer = (selection: number) => {
    const shown = state?.active;
    if (!shown) return;
    void commit(s => s.active?.id === shown.id && s.active.answers.length === shown.answers.length
      ? answerCourseQuestion(s, selection)
      : null);
  };
  const studied = state?.studied ?? [];
  const passed = state?.history.some(courseAttemptPassed) ?? false;
  const writingDone = state?.ipv6.compress && state.ipv6.expand;

  return <section ref={root} className="mx-auto max-w-4xl space-y-4" aria-label="Курсы NetOps" data-course-view={cursor.screen}>
    <header className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Курсы · локальный пилот</p>
      <h1 className="scroll-mt-24 text-2xl font-bold leading-tight sm:text-3xl" ref={heading} tabIndex={-1}>{headings[cursor.screen]}</h1>
      {!lockAvailable && <p role="alert" data-course-lock-warning className={panel + ' text-sm'}>{lockWarning}</p>}
      {notice && <div className={panel}>
        <p ref={alert} tabIndex={-1} role="alert" className="text-sm">{notice}</p>
        <button type="button" className={button} disabled={busy} onClick={refresh}>Проверить хранилище снова</button>
      </div>}
    </header>

    {cursor.screen === 'overview' && <>
      <div className={panel}>
        <p className="text-sm">Частные IPv4-адреса, маски, границы подсетей и локальная настройка IPv6. Прогресс хранится только в этом браузере, без аккаунта.</p>
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div><dt className="font-bold">Изучен</dt><dd>{studied.length === COURSE_LESSON_IDS.length ? 'Да' : `Нет · ${studied.length}/4 урока`}</dd></div>
          <div><dt className="font-bold">Пройден</dt><dd>{passed ? 'Да' : 'Нет'}</dd></div>
          <div><dt className="font-bold">Запись IPv6</dt><dd>{writingDone ? 'Проверена' : `Не завершена · ${Number(!!state?.ipv6.compress) + Number(!!state?.ipv6.expand)}/2`}</dd></div>
        </dl>
        <button type="button" className={primary} disabled={busy} onClick={() => lesson(COURSE_LESSON_IDS.find(id => !studied.includes(id)) ?? COURSE_LESSON_IDS[0])}>
          {studied.length ? 'Продолжить обучение' : 'Начать обучение'}
        </button>
      </div>
      <section aria-label="Оглавление курса" className={panel}>
        <h2 className="font-bold">Оглавление</h2>
        <ol className="space-y-1">
          {COURSE_LESSON_IDS.map((id, i) => <li key={id}>
            <button type="button" className={button + ' w-full justify-start'} disabled={busy} onClick={() => lesson(id)}>
              {i + 1}. {lessonById.get(id)?.title ?? id}{studied.includes(id) ? ' · Изучен' : ''}
            </button>
          </li>)}
        </ol>
      </section>
      <section aria-label="Итог курса" className={panel}>
        <h2 className="font-bold">Итог курса</h2>
        <p className="text-sm">20 вопросов, проходной балл 16/20. Нет таймера и ограничения числа попыток.</p>
        <button type="button" className={primary} disabled={busy || (!state?.active && !canWrite)} onClick={startOrResume}>
          {state?.active ? 'Продолжить итог' : 'Начать итог'}
        </button>
        {!!state?.history.length && <ul aria-label="История итоговых попыток" className="space-y-1">
          {state.history.slice().reverse().map((attempt, i) => <li key={attempt.id}>
            <button type="button" className={button} disabled={busy} onClick={() => { void move({ screen: 'review', attemptId: attempt.id }); }}>
              Попытка {state.history.length - i} · {scoreCourseAttempt(attempt)} из {COURSE_QUESTION_COUNT}
            </button>
          </li>)}
        </ul>}
      </section>
    </>}

    {cursor.screen === 'lesson' && mainLesson && <>
      {selectedAttempt && <button type="button" className={button} onClick={returnToReview} disabled={busy}>Вернуться к разбору ошибок</button>}
      <p className="text-sm">Шаг {lessonIndex + 1} из {COURSE_LESSON_IDS.length}</p>
      <LessonView key={mainLesson.id} lesson={mainLesson} onBack={overview}
        returnQuestionId={cursor.questionId} focusPathHeading={!!cursor.questionId}
        courseReading={{ mode: cursor.mode ?? 'meaning', onChange: saveMode, sectionId: cursor.sectionId }}
        studyNavigation={<section className={panel} aria-label="Навигация курса">
          {!selectedAttempt && <>
            {mainLesson.id === 'l3-subnets' && <div className="space-y-2">
              <p className="text-sm">Проверьте, может ли адрес 192.168.60.190 быть локальным шлюзом для 192.168.60.130/26.</p>
              <button type="button" data-course-focus="ipv4" className={button} disabled={busy} onClick={e => openPractice('ipv4', e.currentTarget)}>Открыть тренажёр IPv4</button>
            </div>}
            {mainLesson.id === 'l3-ipv6' && <div className="space-y-2">
              <p className="text-sm">Введите сокращённый и полный адреса. Оба задания проверяются отдельно от итогового теста.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" data-course-focus="ipv6-compress" className={button} disabled={busy} onClick={e => openPractice('ipv6-compress', e.currentTarget)}>Сжать IPv6{state?.ipv6.compress ? ' · Верно' : ''}</button>
                <button type="button" data-course-focus="ipv6-expand" className={button} disabled={busy} onClick={e => openPractice('ipv6-expand', e.currentTarget)}>Развернуть IPv6{state?.ipv6.expand ? ' · Верно' : ''}</button>
              </div>
            </div>}
            <button type="button" className={button} disabled={busy || !canWrite || studied.includes(mainLesson.id as CourseLessonId)} onClick={() => {
              const id = cursor.lessonId;
              if (id) void commit(s => ({ ...s, studied: s.studied.includes(id) ? s.studied : [...s.studied, id] }));
            }}>{studied.includes(mainLesson.id as CourseLessonId) ? 'Урок изучен' : 'Отметить урок изученным'}</button>
          </>}
          {selectedAttempt
            ? <button type="button" className={button} onClick={returnToReview} disabled={busy}>Вернуться к разбору ошибок</button>
            : <div className="flex flex-wrap gap-2">
              {lessonIndex > 0 && <button type="button" className={button} disabled={busy} onClick={() => lesson(COURSE_LESSON_IDS[lessonIndex - 1])}>Предыдущий урок</button>}
              {lessonIndex + 1 < COURSE_LESSON_IDS.length && <button type="button" className={primary} disabled={busy} onClick={() => lesson(COURSE_LESSON_IDS[lessonIndex + 1])}>Следующий урок</button>}
            </div>}
        </section>} />
    </>}

    {cursor.screen === 'ipv4' && <>
      <button type="button" className={button} disabled={busy} onClick={() => returnToLesson('ipv4')}>Вернуться к уроку</button>
      <p className="text-sm">Найдите границы 192.168.60.130/26 и проверьте, входит ли 192.168.60.190 в диапазон хостов.</p>
      <Ipv4Trainer initialSubTab="calculator" initialAddress="192.168.60.130" initialPrefix={26} />
    </>}
    {(cursor.screen === 'ipv6-compress' || cursor.screen === 'ipv6-expand') && <>
      <button type="button" className={button} disabled={busy} onClick={() => returnToLesson(cursor.screen as 'ipv6-compress' | 'ipv6-expand')}>Вернуться к уроку</button>
      <fieldset disabled={!lockAvailable} className="min-w-0">
        <Ipv6Trainer key={cursor.screen} courseWriting={{ mode: cursor.screen === 'ipv6-compress' ? 'compress' : 'expand', onCorrect: () => saveWriting(cursor.screen === 'ipv6-compress' ? 'compress' : 'expand') }} />
      </fieldset>
    </>}

    {cursor.screen === 'attempt' && state?.active && <>
      <button type="button" className={button} disabled={busy} onClick={overview}>К оглавлению курса</button>
      <CurrentQuestion key={`${state.active.id}:${state.active.answers.length}`} attempt={state.active} busy={busy || !canWrite} onAnswer={answer} />
    </>}
    {cursor.screen === 'review' && selectedAttempt &&
      <Result key={selectedAttempt.id} attempt={selectedAttempt} busy={busy} hasActive={!!state?.active} canWrite={canWrite} onLesson={openReviewLesson} onOverview={overview} onRetry={startOrResume} />}
  </section>;
}

import { useId } from 'react';
import { ArrowRight } from 'lucide-react';
import { getLesson } from '../data/lessons';
import { getLessonLearningPath } from '../data/lessons/learningPaths';
import { PRACTICE_DESTINATIONS } from '../data/practiceLinks';
import { PracticeLinkButton, type PracticeButtonAction } from './PracticeLinkButton';

interface Props {
  lessonId: string;
  onOpenLesson?: (lessonId: string, trigger: HTMLButtonElement) => void;
  onOpenPractice?: PracticeButtonAction;
}

export function LessonLearningPath({ lessonId, onOpenLesson, onOpenPractice }: Props) {
  const titleId = useId();
  const path = getLessonLearningPath(lessonId);
  const next = path?.next;
  const nextLesson = next && next.lessonId !== lessonId && onOpenLesson ? getLesson(next.lessonId) : undefined;
  const practice = path?.practice;
  const showPractice = practice?.kind === 'planned' ||
    (practice?.kind === 'available' && onOpenPractice && Object.hasOwn(PRACTICE_DESTINATIONS, practice.link));

  if (!nextLesson && !showPractice) return null;

  return (
    <section data-lesson-learning-path={lessonId} aria-labelledby={titleId}
      className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/60 sm:p-5">
      <h3 id={titleId} className="font-bold text-slate-900 dark:text-slate-100">Что дальше</h3>
      {next && nextLesson && onOpenLesson && (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">Для полноты понимания</h4>
          <p className="text-slate-700 dark:text-slate-300">{next.reason}</p>
          <button type="button" onClick={event => onOpenLesson(nextLesson.id, event.currentTarget)}
            className="inline-flex min-h-11 max-w-full cursor-pointer items-center gap-2 rounded-xl border border-cyan-500/40 px-3 py-2 text-left font-semibold text-cyan-800 hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:text-cyan-200 dark:hover:bg-cyan-950/50">
            <span className="min-w-0 break-words">Читать урок: {nextLesson.title}</span>
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      )}
      {practice && showPractice && (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">Практика</h4>
          <div className="flex flex-wrap items-center gap-2 text-slate-900 dark:text-slate-100">
            <strong>{practice.title}</strong>
            {practice.kind === 'planned' && (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">В разработке</span>
            )}
          </div>
          <p className="text-slate-700 dark:text-slate-300">{practice.goal}</p>
          {practice.kind === 'available' && (
            <PracticeLinkButton link={practice.link} onOpenPractice={onOpenPractice}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-cyan-700 px-3 py-2 font-semibold text-white hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300" />
          )}
        </div>
      )}
    </section>
  );
}

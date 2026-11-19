import { FormattedExplanation } from './FormattedExplanation';
import { GlossaryText } from './GlossaryText';
import { PracticeLinkButton } from './PracticeLinkButton';
import type { PracticeLink } from '../data/practiceLinks';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lesson } from '../data/lessons/types';
import { getLessonBlocksWithSections, getLessonSectionForQuestion } from '../data/lessons/lessonSectionLinks';
import { StudyTextToggle } from './StudyTextToggle';
import { useStudyTextMode } from '../utils/studyTextMode';
import { LessonTermTags } from './LessonTermTags';
import { SniDiagram } from './SniDiagram';
import { ArrowLeft, Copy, Check, BookOpen } from 'lucide-react';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onOpenLesson?: (lessonId: string) => void;
  onOpenQuestion?: (questionId: string) => void;
  onOpenPractice?: (link: PracticeLink) => void;
  returnQuestionId?: string | null;
}

export const LessonView: React.FC<LessonViewProps> = ({ lesson, onBack, onOpenLesson, onOpenQuestion, onOpenPractice, returnQuestionId }) => {
  const [textMode, setTextMode] = useStudyTextMode();
  const content = textMode === 'professional' && lesson.professional ? lesson.professional : lesson;
  const blocks = getLessonBlocksWithSections(lesson, textMode === 'professional' && lesson.professional ? 'professional' : 'plain');
  const targetAnchor = getLessonSectionForQuestion(lesson.id, returnQuestionId);
  const anchorElements = useRef<Record<string, HTMLElement | null>>({});
  const [highlightedAnchor, setHighlightedAnchor] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Run after the lesson and selected reading mode are rendered. The same stable anchor
  // is present in both plain and professional blocks, so changing mode keeps context.
  useEffect(() => {
    if (!targetAnchor) return;
    let disposed = false;
    const keepAnchorVisible = (initial = false) => {
      if (disposed) return;
      const section = anchorElements.current[targetAnchor];
      if (!section) return;
      const bounds = section.getBoundingClientRect();
      if (initial || bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
        section.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
      if (initial) section.focus({ preventScroll: true });
      setHighlightedAnchor(targetAnchor);
    };
    // After switching lesson styles, block height and glossary content can reflow.
    // Re-check visibility after layout settles, keeping the exact same anchor in view.
    const frame = window.requestAnimationFrame(() => keepAnchorVisible(true));
    const settle = window.setTimeout(() => keepAnchorVisible(), 120);
    const lateSettle = window.setTimeout(() => keepAnchorVisible(), 400);
    const timeout = window.setTimeout(() => setHighlightedAnchor(null), 2800);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.clearTimeout(lateSettle);
      window.clearTimeout(timeout);
    };
  }, [lesson.id, targetAnchor, textMode]);

  const copy = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(cmd);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  const related = useMemo(() => lesson.relatedQuestionIds, [lesson]);

  return (
    <article className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          К каталогу уроков
        </button>
        {returnQuestionId && onOpenQuestion && (
          <button
            type="button"
            onClick={() => onOpenQuestion(returnQuestionId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 cursor-pointer"
          >
            Вернуться к вопросу {returnQuestionId}
          </button>
        )}
      </div>

      <header className="space-y-2">
        <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-300">
          <span>{lesson.category}</span>
          <span>·</span>
          <span>{lesson.osiLayers.join(', ')}</span>
          <span>·</span>
          <span>{lesson.difficulty}</span>
        </div>
        <h2 aria-label={lesson.title} className="text-xl font-bold text-slate-900 dark:text-white"><GlossaryText>{lesson.title}</GlossaryText></h2>
        {lesson.professional && <StudyTextToggle value={textMode} onChange={setTextMode} />}
        <FormattedExplanation text={content.summary} />
        <LessonTermTags key={`${lesson.id}-${textMode}`} terms={content.terms} onOpenLesson={onOpenLesson} />
      </header>

      {lesson.diagram === 'sni' && <SniDiagram />}

      <div className="space-y-4">
        {blocks.map((b) => (
          <section
            key={b.anchorId ?? b.heading}
            ref={element => { if (b.anchorId) anchorElements.current[b.anchorId] = element; }}
            data-lesson-section-anchor={b.anchorId}
            tabIndex={b.anchorId === targetAnchor ? -1 : undefined}
            className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#091524] p-4 space-y-2 scroll-mt-24 motion-safe:transition-shadow motion-safe:duration-300 ${b.anchorId && highlightedAnchor === b.anchorId ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20' : ''}`}
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-500" />
              <span className="min-w-0"><GlossaryText key={textMode}>{b.heading}</GlossaryText></span>
            </h3>
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"><FormattedExplanation text={b.body} /></div>
            <PracticeLinkButton link={b.practiceLink} onOpenPractice={onOpenPractice} />
          </section>
        ))}
      </div>

      {content.commands && content.commands.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Команды диагностики</h3>
          {content.commands.map((c) => (
            <div key={c.cmd} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 space-y-2">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-200">{c.title}</div>
              <FormattedExplanation text={c.cmd} command />
              {c.note && <p className="text-[11px] text-slate-500 dark:text-slate-400"><GlossaryText key={textMode}>{c.note}</GlossaryText></p>}
              <button
                type="button"
                onClick={() => copy(c.cmd)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 cursor-pointer"
              >
                {copied === c.cmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === c.cmd ? 'Скопировано' : 'Копировать'}
              </button>
            </div>
          ))}
        </section>
      )}

      {related.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Связанные вопросы</h3>
          <div className="flex flex-wrap gap-2">
            {related.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onOpenQuestion?.(id)}
                className="px-3 py-1.5 rounded-xl text-xs font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 cursor-pointer"
              >
                {id}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
        <div className="font-semibold uppercase tracking-wider">Источники</div>
        <ul className="list-disc pl-4 space-y-0.5">
          {content.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
    </article>
  );
};

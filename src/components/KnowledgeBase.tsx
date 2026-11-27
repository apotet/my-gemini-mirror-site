import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LESSONS, searchLessons, getLesson } from '../data/lessons';
import type { Lesson } from '../data/lessons/types';
import type { PracticeButtonAction } from './PracticeLinkButton';
import { LessonView } from './LessonView';
import { LessonReviewBadge } from './LessonReviewBadge';
import { CliReference } from './CliReference';
import { Library, Search } from 'lucide-react';
import { getStudyTextMode, setStudyTextMode, type StudyTextMode } from '../utils/studyTextMode';
import { captureNavigationTrigger, restoreNavigationTrigger, type NavigationTrigger } from '../utils/navigationTrigger';

interface KnowledgeBaseProps {
  initialLessonId?: string | null;
  returnQuestionId?: string | null;
  onOpenQuestion?: (questionId: string) => void;
  onOpenPractice?: PracticeButtonAction;
  onClearLesson?: () => void;
}

const LAYERS = ['all', 'CLI', 'L1', 'L2', 'L3', 'L4', 'L5–L7', 'L7'];
type DifficultyFilter = 'all' | Lesson['difficulty'];
const DIFFICULTIES: { id: DifficultyFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'beginner', label: 'База' },
  { id: 'applied', label: 'Средний' },
  { id: 'advanced', label: 'Продвинутый' },
];
const DIFFICULTY_ORDER = { beginner: 0, applied: 1, advanced: 2 };
const FILTER_KEYS = {
  layer: 'osi_knowledge_layer_v1',
  difficulty: 'osi_knowledge_difficulty_v1',
};
const memoryFilters = { layer: 'all', difficulty: 'all' };
// Keep even repeated/cyclic lesson links usable without retaining an unbounded DOM.
const MAX_OPEN_LESSONS = 8;

interface LessonEntry {
  id: string;
  key: number;
  from?: NavigationTrigger;
  pausedTextMode?: StudyTextMode;
}

function readFilter(key: keyof typeof FILTER_KEYS, allowed: readonly string[]): string {
  if (typeof window === 'undefined') return 'all';
  let saved = memoryFilters[key];
  try { saved = window.sessionStorage.getItem(FILTER_KEYS[key]) ?? saved; } catch { /* Use the tab fallback. */ }
  return allowed.includes(saved) ? saved : 'all';
}

function saveFilter(key: keyof typeof FILTER_KEYS, value: string) {
  memoryFilters[key] = value;
  try { window.sessionStorage.setItem(FILTER_KEYS[key], value); } catch { /* Keep selection on remount when storage is blocked. */ }
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  initialLessonId,
  returnQuestionId,
  onOpenQuestion,
  onOpenPractice,
  onClearLesson,
}) => {
  const [section, setSection] = useState<'lessons' | 'cli-reference'>('lessons');
  const [query, setQuery] = useState('');
  const [layer, setLayer] = useState(() => readFilter('layer', LAYERS));
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(() =>
    readFilter('difficulty', DIFFICULTIES.map(item => item.id)) as DifficultyFilter);
  const [trail, setTrail] = useState<LessonEntry[]>(() => initialLessonId ? [{ id: initialLessonId, key: 0 }] : []);
  const nextKey = useRef(1);
  const pendingRestore = useRef<NavigationTrigger | null>(null);
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialLessonId) setTrail([{ id: initialLessonId, key: 0 }]);
  }, [initialLessonId]);

  const current = trail.at(-1);
  const openNewRoot = (id: string) => setTrail([{ id, key: nextKey.current++ }]);
  const openLinkedLesson = (id: string, trigger: HTMLElement) => {
    if (!current || id === current.id || !getLesson(id)) return;
    const next = { id, key: nextKey.current++, from: captureNavigationTrigger(trigger) };
    const pausedTextMode = getStudyTextMode();
    setTrail(previous => {
      if (previous.at(-1)?.key !== current.key) return previous;
      const retained = previous.slice(-MAX_OPEN_LESSONS + 1);
      if (retained.length < previous.length) retained[0] = { ...retained[0], from: undefined };
      return [...retained.slice(0, -1), { ...current, pausedTextMode }, next];
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const returnToLinkedLesson = () => {
    const parent = trail.at(-2);
    if (!current?.from || !parent) return;
    pendingRestore.current = current.from;
    if (parent.pausedTextMode && parent.pausedTextMode !== getStudyTextMode()) setStudyTextMode(parent.pausedTextMode);
    setTrail([...trail.slice(0, -2), { ...parent, pausedTextMode: undefined }]);
  };
  useLayoutEffect(() => {
    const trigger = pendingRestore.current;
    if (!trigger) return;
    pendingRestore.current = null;
    restoreNavigationTrigger(trigger);
  }, [current]);

  const list = useMemo(() => {
    const matches = searchLessons(query, layer === 'all' ? undefined : layer)
      .filter(item => difficulty === 'all' || item.difficulty === difficulty);
    if (layer !== 'all') {
      matches.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
    }
    return matches;
  }, [query, layer, difficulty]);

  if (current && getLesson(current.id)) {
    return (
      <>{trail.map(entry => {
        const lesson = getLesson(entry.id);
        if (!lesson) return null;
        const active = entry === current;
        return (
          <div key={entry.key} hidden={!active} inert={!active}>
            <LessonView
              lesson={lesson}
              onOpenLesson={openLinkedLesson}
              onOpenPathLesson={openLinkedLesson}
              onReturnToLesson={entry.from ? returnToLinkedLesson : undefined}
              focusPathHeading={!!entry.from}
              pausedTextMode={entry.pausedTextMode}
              returnQuestionId={returnQuestionId}
              onOpenQuestion={onOpenQuestion}
              onOpenPractice={onOpenPractice}
              onBack={() => {
                setTrail([]);
                onClearLesson?.();
              }}
            />
          </div>
        );
      })}</>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
        <Library className="w-4 h-4 text-cyan-500" />
        <h2 className="text-base font-semibold">База знаний</h2>
        <span className="text-[11px] font-mono text-slate-500">{LESSONS.length} урок</span>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Раздел базы знаний">
        <button type="button" aria-pressed={section === 'lessons'} onClick={() => setSection('lessons')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer ${section === 'lessons' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
          Уроки
        </button>
        <button type="button" aria-pressed={section === 'cli-reference'} onClick={() => setSection('cli-reference')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer ${section === 'cli-reference' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
          Справочник CLI
        </button>
      </div>

      {section === 'cli-reference' ? (
        <CliReference onOpenLesson={id => {
          openNewRoot(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      ) : (
      <>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: SNI, TLS, сертификат…"
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
        />
      </div>

      <div role="group" aria-label="Раздел базы знаний" className="flex flex-wrap gap-1.5">
        {LAYERS.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={layer === l}
            onClick={() => {
              setLayer(l);
              saveFilter('layer', l);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
              layer === l ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {l === 'all' ? 'Все темы' : l === 'CLI' ? 'CLI и управление' : l}
          </button>
        ))}
      </div>

      <div role="group" aria-label="Сложность урока" className="flex flex-wrap gap-1.5">
        {DIFFICULTIES.map(item => (
          <button
            key={item.id}
            type="button"
            aria-pressed={difficulty === item.id}
            onClick={() => {
              setDifficulty(item.id);
              saveFilter('difficulty', item.id);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
              difficulty === item.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-slate-500">Ничего не найдено. Пустые карточки не показываем — в каталоге только готовые уроки.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((l) => (
            <button
              key={l.id}
              title={l.summary}
              type="button"
              onClick={() => openNewRoot(l.id)}
              className="text-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#091524] p-4 space-y-2 cursor-pointer hover:border-cyan-500/40"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-300">
                {l.category} · {l.difficulty}
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">{l.title}</div>
              <LessonReviewBadge lessonId={l.id} />
              <p
                className={`text-xs text-slate-600 dark:text-slate-400${expandedSummaryId === l.id ? '' : ' line-clamp-3'}`}
                onClick={event => {
                  if (!window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
                  event.stopPropagation();
                  setExpandedSummaryId(current => current === l.id ? null : l.id);
                }}
              >{l.summary}</p>
              <div className="text-[11px] text-slate-500">Вопросов: {l.relatedQuestionIds.length}</div>
            </button>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
};

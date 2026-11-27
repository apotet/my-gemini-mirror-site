import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LESSONS, searchLessons, getLesson } from '../data/lessons';
import { BEGINNER_CORE_IDS, BEGINNER_EXTRAS, BEGINNER_STAGES, beginnerNeighbors, compareBeginnerOrder, compareBeginnerTitles } from '../data/lessons/beginnerOrder';
import type { Lesson } from '../data/lessons/types';
import type { PracticeButtonAction } from './PracticeLinkButton';
import { LessonView } from './LessonView';
import { LessonFavoriteButton } from './LessonFavoriteButton';
import { toggleLessonFavorite, useLessonFavorites } from '../utils/lessonFavorites';
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
const BEGINNER_SORTS = [
  { id: 'original', label: 'Как сейчас' },
  { id: 'alphabet', label: 'А–Я' },
  { id: 'study', label: 'По порядку изучения' },
] as const;
type BeginnerSort = typeof BEGINNER_SORTS[number]['id'];
const BEGINNER_SORT_KEY = 'osi_knowledge_beginner_sort_v1';
let memoryBeginnerSort: BeginnerSort = 'original';
function readBeginnerSort(): BeginnerSort {
  try {
    const id = window.localStorage.getItem(BEGINNER_SORT_KEY);
    return BEGINNER_SORTS.find(sort => sort.id === id)?.id ?? memoryBeginnerSort;
  } catch { return memoryBeginnerSort; }
}
// A resume checkpoint records an intentionally opened route step, not course progress.
const BEGINNER_RESUME_KEY = 'osi_knowledge_beginner_resume_v1';
let memoryBeginnerResume: string | null = null;
let resumeWriteBlocked = false;

function getBeginnerCoreLesson(id: string | null) {
  if (!id || !BEGINNER_CORE_IDS.includes(id)) return undefined;
  const lesson = getLesson(id);
  return lesson?.difficulty === 'beginner' ? lesson : undefined;
}

function readBeginnerResume(): string | null {
  if (typeof window === 'undefined') return null;
  if (resumeWriteBlocked) return memoryBeginnerResume;
  try {
    return getBeginnerCoreLesson(window.localStorage.getItem(BEGINNER_RESUME_KEY))?.id ?? null;
  } catch { return memoryBeginnerResume; }
}

function saveBeginnerResume(id: string) {
  memoryBeginnerResume = id;
  try {
    window.localStorage.setItem(BEGINNER_RESUME_KEY, id);
    resumeWriteBlocked = false;
  } catch { resumeWriteBlocked = true; }
}
const routeButton = 'min-h-11 cursor-pointer rounded-lg border border-cyan-500/40 px-3 py-2 text-left text-sm font-semibold text-cyan-800 dark:text-cyan-200 focus-visible:outline-2 focus-visible:outline-cyan-500';
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
  study?: boolean;
  trackStudy?: boolean;
  focusHeading?: boolean;
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
  const [section, setSection] = useState<'lessons' | 'favorites' | 'cli-reference'>('lessons');
  const [query, setQuery] = useState('');
  const favorites = useLessonFavorites().map(getLesson).filter((lesson): lesson is Lesson => !!lesson);
  const favoriteIds = new Set(favorites.map(lesson => lesson.id));
  const catalogFavoriteTab = useRef<HTMLButtonElement>(null);
  const favoriteFallback = useRef(false);
  useLayoutEffect(() => {
    if (favoriteFallback.current) {
      favoriteFallback.current = false;
      catalogFavoriteTab.current?.focus();
    }
  });
  const [layer, setLayer] = useState(() => readFilter('layer', LAYERS));
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(() =>
    readFilter('difficulty', DIFFICULTIES.map(item => item.id)) as DifficultyFilter);
  const [beginnerSort, setBeginnerSort] = useState(readBeginnerSort);
  const [beginnerResumeId, setBeginnerResumeId] = useState(readBeginnerResume);
  const resumeLesson = getBeginnerCoreLesson(beginnerResumeId);
  const studyCatalog = difficulty === 'beginner' && beginnerSort === 'study';
  const [trail, setTrail] = useState<LessonEntry[]>(() => initialLessonId ? [{ id: initialLessonId, key: 0 }] : []);
  const nextKey = useRef(1);
  const pendingRestore = useRef<NavigationTrigger | null>(null);
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialLessonId) setTrail([{ id: initialLessonId, key: 0 }]);
  }, [initialLessonId]);

  const current = trail.at(-1);
  const rememberStudyStep = (id: string) => {
    if (!getBeginnerCoreLesson(id)) return;
    saveBeginnerResume(id);
    setBeginnerResumeId(id);
  };
  const openNewRoot = (id: string, options: Pick<LessonEntry, 'study' | 'trackStudy' | 'focusHeading'> = {}) => {
    const { study, focusHeading } = options;
    const trackStudy = study && options.trackStudy && !!getBeginnerCoreLesson(id);
    if (trackStudy) rememberStudyStep(id);
    setTrail([{ id, key: nextKey.current++, study, trackStudy, focusHeading }]);
    if (focusHeading) window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const openStudyNeighbor = (id: string) => {
    if (!current?.study || !getLesson(id)) return;
    if (current.trackStudy) rememberStudyStep(id);
    const next = { ...current, id, key: nextKey.current++, focusHeading: true };
    setTrail(previous => previous.at(-1)?.key === current.key ? [...previous.slice(0, -1), next] : previous);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
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
    if (difficulty === 'beginner' && beginnerSort === 'alphabet') {
      matches.sort(compareBeginnerTitles);
    } else if (studyCatalog) {
      matches.sort(compareBeginnerOrder);
    } else if (layer !== 'all') {
      matches.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
    }
    return matches;
  }, [query, layer, difficulty, beginnerSort, studyCatalog]);

  if (current && getLesson(current.id)) {
    return (
      <>{trail.map(entry => {
        const lesson = getLesson(entry.id);
        if (!lesson) return null;
        const active = entry === current;
        const neighbors = beginnerNeighbors(lesson.id);
        const previous = neighbors.previous && getLesson(neighbors.previous);
        const next = neighbors.next && getLesson(neighbors.next);
        return (
          <div key={entry.key} hidden={!active} inert={!active}>
            <LessonView
              lesson={lesson}
              favoriteAction={<LessonFavoriteButton title={lesson.title} saved={favoriteIds.has(lesson.id)} onToggle={() => toggleLessonFavorite(lesson.id)} />}
              onOpenLesson={openLinkedLesson}
              onOpenPathLesson={openLinkedLesson}
              onReturnToLesson={entry.from ? returnToLinkedLesson : undefined}
              focusPathHeading={!!entry.from || entry.focusHeading}
              studyBefore={!entry.study && lesson.difficulty === 'beginner' && previous ? (
                <button type="button" className={routeButton} onClick={event => openLinkedLesson(previous.id, event.currentTarget)}>
                  Перед этим: {previous.title}
                </button>
              ) : undefined}
              studyNavigation={entry.study ? (
                <nav aria-label="Учебный маршрут" className="space-y-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-sm font-semibold">{neighbors.position ? `Шаг ${neighbors.position} из ${BEGINNER_CORE_IDS.length}` : 'Дополнительный урок'}</p>
                  <div className="flex flex-wrap gap-2">
                    {previous && <button type="button" className={routeButton} onClick={() => openStudyNeighbor(previous.id)}>Предыдущий: {previous.title}</button>}
                    {next && <button type="button" className={routeButton} onClick={() => openStudyNeighbor(next.id)}>Следующий: {next.title}</button>}
                  </div>
                </nav>
              ) : undefined}
              studyNextId={entry.study && next ? next.id : undefined}
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

  const card = (l: Lesson) => (
    <div key={l.id} className="relative min-w-0">
    <button
      data-catalog-lesson={l.id}
      title={l.summary}
      type="button"
      onClick={() => openNewRoot(l.id, {
        study: section === 'lessons' && studyCatalog,
        trackStudy: !query.trim() && layer === 'all',
      })}
      className="min-w-0 w-full h-full pr-16 text-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#091524] p-4 space-y-2 cursor-pointer hover:border-cyan-500/40"
    >
      <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-300">{l.category} · {l.difficulty}</div>
      <div className="font-semibold text-slate-900 dark:text-white">{l.title}</div>
      <LessonReviewBadge lessonId={l.id} />
      <p className={`text-xs text-slate-600 dark:text-slate-400${expandedSummaryId === l.id ? '' : ' line-clamp-3'}`}
        onClick={event => {
          if (!window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
          event.stopPropagation();
          setExpandedSummaryId(current => current === l.id ? null : l.id);
        }}>{l.summary}</p>
      <div className="text-[11px] text-slate-500">Вопросов: {l.relatedQuestionIds.length}</div>
    </button>
    <div className="absolute right-3 top-3">
      <LessonFavoriteButton title={l.title} saved={favoriteIds.has(l.id)} compact onToggle={() => {
        if (section === 'favorites') favoriteFallback.current = true;
        toggleLessonFavorite(l.id);
      }} />
    </div>
    </div>
  );
  const studyGroups = [...BEGINNER_STAGES, ...BEGINNER_EXTRAS];
  const knownIds = new Set<string>(studyGroups.flatMap(group => [...group.ids]));

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
        <button ref={catalogFavoriteTab} type="button" aria-pressed={section === 'favorites'} onClick={() => setSection('favorites')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer ${section === 'favorites' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
          Избранное
        </button>
        <button type="button" aria-pressed={section === 'cli-reference'} onClick={() => setSection('cli-reference')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer ${section === 'cli-reference' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
          Справочник CLI
        </button>
      </div>

      {section === 'favorites' ? (
        <section aria-label="Избранные уроки" className="space-y-3">
          <p className="text-xs text-slate-500" role="status">Сохранено уроков: {favorites.length}</p>
          {favorites.length ? <div className="grid gap-3 sm:grid-cols-2">{favorites.map(card)}</div> :
            <p className="text-sm text-slate-500">Пока пусто. Нажмите на закладку рядом с уроком или в самом уроке.</p>}
        </section>
      ) : section === 'cli-reference' ? (
        <CliReference onOpenLesson={id => {
          openNewRoot(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      ) : (
      <>
      {studyCatalog && resumeLesson && (
        <button type="button" aria-label={`Продолжить: ${resumeLesson.title}`}
          className={`w-full sm:w-auto ${routeButton}`}
          onClick={() => openNewRoot(resumeLesson.id, { study: true, trackStudy: true, focusHeading: true })}>
          <span className="block">Продолжить</span>
          <span className="block break-words text-xs font-normal">{resumeLesson.title}</span>
        </button>
      )}
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

      {difficulty === 'beginner' && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Порядок уроков «Базы»">
          {BEGINNER_SORTS.map(sort => (
            <button key={sort.id} type="button" aria-pressed={beginnerSort === sort.id}
              className={routeButton + (beginnerSort === sort.id ? ' bg-cyan-500/20' : '')}
              onClick={() => {
                setBeginnerSort(sort.id);
                memoryBeginnerSort = sort.id;
                try { window.localStorage.setItem(BEGINNER_SORT_KEY, sort.id); } catch { /* Keep the choice in this tab. */ }
              }}>
              {sort.label}
            </button>
          ))}
        </div>
      )}
      {difficulty === 'beginner' && <p className="text-xs text-slate-500" role="status">Найдено уроков: {list.length}</p>}
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">Ничего не найдено. Пустые карточки не показываем — в каталоге только готовые уроки.</p>
      ) : studyCatalog ? (
        <div className="space-y-5">
          {studyGroups.map(group => {
            const ids: readonly string[] = group.ids;
            const matches = list.filter(lesson => ids.includes(lesson.id));
            if (!matches.length) return null;
            return (
              <section key={group.title} aria-label={group.title} className="space-y-2">
                <h3 className="text-sm font-semibold">{group.title}</h3>
                {'after' in group && <p className="text-xs text-slate-500">После урока «{getLesson(group.after)?.title}»</p>}
                <div className="grid gap-3 sm:grid-cols-2">{matches.map(card)}</div>
              </section>
            );
          })}
          {list.some(lesson => !knownIds.has(lesson.id)) && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Вне маршрута</h3>
              <div className="grid gap-3 sm:grid-cols-2">{list.filter(lesson => !knownIds.has(lesson.id)).map(card)}</div>
            </section>
          )}
        </div>
      ) : <div className="grid gap-3 sm:grid-cols-2">{list.map(card)}</div>}

      </>
      )}
    </div>
  );
};

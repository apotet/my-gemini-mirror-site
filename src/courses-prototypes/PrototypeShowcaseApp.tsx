import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Monitor,
  Moon,
  SlidersHorizontal,
  Smartphone,
  Sun,
  X,
} from 'lucide-react';
import { ConceptAcademy } from './concepts/ConceptAcademy';
import { ConceptStudio } from './concepts/ConceptStudio';
import { ConceptTextbook } from './concepts/ConceptTextbook';
import { ExternalResourceBridge } from './components/ExternalResourceBridge';
import { IP_ADDRESSING_MODULES } from './data/coursesData';
import type {
  ConceptId,
  ConceptSharedProps,
  ExamViewMode,
  ExternalResourceId,
  LearnerProfile,
  ScreenId,
  ViewportMode,
} from './types';

const ACTIVE_DEFAULT_COMPLETED = [
  'mod-mask-prefix',
  'mod-private-special',
  'mod-subnets-hosts',
];

const CONCEPT_TABS: Array<{ id: ConceptId; number: string; label: string; shortLabel: string }> = [
  { id: 'studio', number: '1', label: 'Студия NetOps', shortLabel: '1. Студия' },
  { id: 'academy', number: '2', label: 'Инженерная академия', shortLabel: '2. Академия' },
  { id: 'textbook', number: '3', label: 'Интерактивный учебник', shortLabel: '3. Учебник' },
];

const SCREEN_TABS: Array<{ id: ScreenId; label: string; shortLabel: string }> = [
  { id: 'catalog', label: 'Каталог', shortLabel: 'Каталог' },
  { id: 'course', label: 'Курс «IP-адресация»', shortLabel: 'Курс IP' },
  { id: 'player', label: 'Прохождение', shortLabel: 'Урок' },
  { id: 'exam', label: 'Итоговый тест', shortLabel: 'Тест' },
];

export const PrototypeShowcaseApp: React.FC = () => {
  const [concept, setConcept] = useState<ConceptId>('studio');
  const [screen, setScreen] = useState<ScreenId>('catalog');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [isNarrowWindow, setIsNarrowWindow] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const [mobileControlsOpen, setMobileControlsOpen] = useState<boolean>(false);

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = window.localStorage.getItem('netops_courses_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch {
      // ignore storage errors
    }
    return false;
  });

  const [profile, setProfile] = useState<LearnerProfile>('active');
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>(ACTIVE_DEFAULT_COMPLETED);
  const [activeModuleId, setActiveModuleId] = useState<string>('mod-ipv6-slaac');
  const [selectedCoursePreviewId, setSelectedCoursePreviewId] = useState<string | null>(null);

  const [externalResource, setExternalResource] = useState<{
    resourceId: ExternalResourceId;
    fromModuleId: string;
  } | null>(null);
  const [completedResourceIds, setCompletedResourceIds] = useState<ExternalResourceId[]>([
    'lesson-masks',
    'lesson-private-ipv4',
  ]);

  const [examMode, setExamMode] = useState<ExamViewMode>('interactive');
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  const phoneScrollRef = useRef<HTMLDivElement | null>(null);

  // Sync Tailwind .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    try {
      window.localStorage.setItem('netops_courses_theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [isDark]);

  // Listen to browser window width for native responsive behavior
  useEffect(() => {
    const onResize = () => {
      setIsNarrowWindow(window.innerWidth < 1024);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Scroll stage back to top when changing concept, screen, or external resource
  useEffect(() => {
    if (viewport === 'mobile' && !isNarrowWindow && phoneScrollRef.current) {
      phoneScrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [concept, screen, externalResource, viewport, isNarrowWindow]);

  const isMobile = isNarrowWindow || viewport === 'mobile';
  const showPhoneFrame = !isNarrowWindow && viewport === 'mobile';

  const handleChangeProfile = (nextProfile: LearnerProfile) => {
    setProfile(nextProfile);
    setExternalResource(null);
    setExamSubmitted(false);
    setExamAnswers({});
    setExamMode('interactive');
    setSelectedCoursePreviewId(null);

    if (nextProfile === 'newcomer') {
      setCompletedModuleIds([]);
      setActiveModuleId('mod-mask-prefix');
      setCompletedResourceIds([]);
    } else {
      setCompletedModuleIds(ACTIVE_DEFAULT_COMPLETED);
      setActiveModuleId('mod-ipv6-slaac');
      setCompletedResourceIds(['lesson-masks', 'lesson-private-ipv4']);
    }
  };

  const handleNavigateScreen = (nextScreen: ScreenId) => {
    setExternalResource(null);
    setScreen(nextScreen);
    setMobileControlsOpen(false);
  };

  const handleOpenCourse = (courseId: string) => {
    setExternalResource(null);
    if (courseId === 'ip-addressing') {
      setScreen('course');
      setSelectedCoursePreviewId(null);
    } else {
      setSelectedCoursePreviewId(courseId);
      setScreen('catalog');
    }
  };

  const handleStartOrResumeModule = (moduleId?: string) => {
    setExternalResource(null);
    if (moduleId) {
      setActiveModuleId(moduleId);
      if (moduleId === 'mod-final-exam') {
        setScreen('exam');
      } else {
        setScreen('player');
      }
      return;
    }

    // Resume first incomplete non-exam module, or go to exam if all 5 done
    const nextIncomplete = IP_ADDRESSING_MODULES.find(
      (m) => m.kind !== 'exam' && !completedModuleIds.includes(m.id)
    );
    if (nextIncomplete) {
      setActiveModuleId(nextIncomplete.id);
      setScreen('player');
    } else {
      setActiveModuleId('mod-final-exam');
      setScreen('exam');
    }
  };

  const handleSelectModule = (moduleId: string) => {
    setExternalResource(null);
    setActiveModuleId(moduleId);
    if (moduleId === 'mod-final-exam') {
      setScreen('exam');
    } else {
      setScreen('player');
    }
  };

  const handleToggleModuleComplete = (moduleId: string) => {
    setCompletedModuleIds((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleOpenExternalResource = (
    resourceId: ExternalResourceId,
    fromModuleId: string
  ) => {
    setExternalResource({ resourceId, fromModuleId });
  };

  const handleReturnFromExternalResource = (markDone?: boolean) => {
    if (!externalResource) return;
    const { resourceId, fromModuleId } = externalResource;
    if (markDone) {
      setCompletedResourceIds((prev) =>
        prev.includes(resourceId) ? prev : [...prev, resourceId]
      );
    }
    setActiveModuleId(fromModuleId);
    setExternalResource(null);
    setScreen('player');
  };

  const handleAnswerExamQuestion = (questionId: string, optionIndex: number) => {
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitExam = () => {
    setExamSubmitted(true);
  };

  const handleResetExam = () => {
    setExamAnswers({});
    setExamSubmitted(false);
    setExamMode('interactive');
  };

  const sharedProps: ConceptSharedProps = {
    screen,
    isMobile,
    isDark,
    profile,
    completedModuleIds,
    activeModuleId,
    selectedCoursePreviewId,
    examMode,
    examAnswers,
    examSubmitted,
    completedResourceIds,
    onNavigateScreen: handleNavigateScreen,
    onOpenCourse: handleOpenCourse,
    onSelectCoursePreview: setSelectedCoursePreviewId,
    onStartOrResumeModule: handleStartOrResumeModule,
    onSelectModule: handleSelectModule,
    onToggleModuleComplete: handleToggleModuleComplete,
    onOpenExternalResource: handleOpenExternalResource,
    onChangeExamMode: setExamMode,
    onAnswerExamQuestion: handleAnswerExamQuestion,
    onSubmitExam: handleSubmitExam,
    onResetExam: handleResetExam,
  };

  const renderPrototypeContent = () => {
    if (externalResource) {
      return (
        <ExternalResourceBridge
          resourceId={externalResource.resourceId}
          fromModuleId={externalResource.fromModuleId}
          concept={concept}
          isMobile={isMobile}
          isResourceDone={completedResourceIds.includes(externalResource.resourceId)}
          onReturnToCourse={handleReturnFromExternalResource}
        />
      );
    }

    if (concept === 'academy') {
      return <ConceptAcademy {...sharedProps} />;
    }
    if (concept === 'textbook') {
      return <ConceptTextbook {...sharedProps} />;
    }
    return <ConceptStudio {...sharedProps} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#050912] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Showcase Control Bar — compact single bar on desktop, collapsible drawer on narrow mobile */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        {!isNarrowWindow ? (
          <div className="max-w-[1440px] mx-auto px-4 h-[56px] flex items-center justify-between gap-3">
            {/* Left: Identity + Concept Switcher */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-slate-200 dark:border-slate-800">
                <span className="font-mono-tech text-xs font-bold tracking-tight px-2 py-1 rounded bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950">
                  NetOps
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden xl:inline whitespace-nowrap">
                  Концепции «Курсы»
                </span>
              </div>

              <nav
                aria-label="Выбор дизайн-концепции"
                className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                {CONCEPT_TABS.map((tab) => {
                  const active = concept === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setConcept(tab.id);
                        setExternalResource(null);
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <span className="hidden 2xl:inline">
                        {tab.number}. {tab.label}
                      </span>
                      <span className="2xl:hidden">{tab.shortLabel}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Center: Screen Switcher */}
            <nav
              aria-label="Экраны прототипа"
              className="flex items-center gap-1"
            >
              {SCREEN_TABS.map((tab) => {
                const active = !externalResource && screen === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleNavigateScreen(tab.id)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="hidden 2xl:inline">{tab.label}</span>
                    <span className="2xl:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: State, Viewport & Theme Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Learner Profile Switcher */}
              <div
                role="group"
                aria-label="Состояние прогресса студента"
                className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <button
                  type="button"
                  onClick={() => handleChangeProfile('newcomer')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    profile === 'newcomer'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Новичок 0%
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeProfile('active')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    profile === 'active'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  В процессе 60%
                </button>
              </div>

              {/* Desktop / Mobile Viewport Toggle */}
              <div
                role="group"
                aria-label="Режим экрана"
                className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <button
                  type="button"
                  onClick={() => setViewport('desktop')}
                  title="Компьютерная версия"
                  className={`px-2 py-1 rounded-md inline-flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                    viewport === 'desktop'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">ПК</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  title="Мобильная версия 390px"
                  className={`px-2 py-1 rounded-md inline-flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                    viewport === 'mobile'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">390px</span>
                </button>
              </div>

              {/* Download Task ZIP */}
              <a
                href={`${import.meta.env.BASE_URL}netops-courses-prototypes.zip`}
                download="netops-courses-prototypes.zip"
                title="Скачать ZIP-архив с исходниками прототипов"
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ZIP</span>
              </a>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => setIsDark((prev) => !prev)}
                aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
                title={isDark ? 'Светлая тема' : 'Тёмная тема'}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          /* Compact Mobile Showcase Bar (strictly single-row 48px to respect mobile sticky budget) */
          <div className="px-3 h-12 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
              {CONCEPT_TABS.map((tab) => {
                const active = concept === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setConcept(tab.id);
                      setExternalResource(null);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                      active
                        ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {tab.shortLabel}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsDark((prev) => !prev)}
                aria-label="Сменить тему"
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setMobileControlsOpen((prev) => !prev)}
                aria-label="Параметры прототипа"
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
              >
                {mobileControlsOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <SlidersHorizontal className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Expandable Controls Sheet */}
        {isNarrowWindow && mobileControlsOpen && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] space-y-3">
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Экран прототипа
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {SCREEN_TABS.map((tab) => {
                  const active = !externalResource && screen === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleNavigateScreen(tab.id)}
                      className={`min-h-[38px] px-2 rounded-lg text-xs font-semibold ${
                        active
                          ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Прогресс студента
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleChangeProfile('newcomer');
                    setMobileControlsOpen(false);
                  }}
                  className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold ${
                    profile === 'newcomer'
                      ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Новичок · 0%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChangeProfile('active');
                    setMobileControlsOpen(false);
                  }}
                  className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold ${
                    profile === 'active'
                      ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  В процессе · 60%
                </button>
              </div>
            </div>

            <a
              href={`${import.meta.env.BASE_URL}netops-courses-prototypes.zip`}
              download="netops-courses-prototypes.zip"
              className="w-full min-h-[40px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать ZIP-архив исходников</span>
            </a>
          </div>
        )}
      </header>

      {/* Main Prototype Stage */}
      {showPhoneFrame ? (
        <main className="flex-1 flex flex-col items-center justify-start py-6 px-4 bg-slate-200/80 dark:bg-[#060a13]">
          <div className="w-[390px] max-w-full flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-3 px-1">
            <span className="font-medium">
              Мобильная версия · 390 × 844
            </span>
            <span className="font-mono-tech text-[11px]">
              {CONCEPT_TABS.find((t) => t.id === concept)?.label}
            </span>
          </div>

          <div className="w-[390px] h-[780px] max-h-[calc(100vh-124px)] rounded-[40px] border-[10px] border-slate-900 dark:border-slate-700 bg-white dark:bg-[#08101c] shadow-2xl overflow-hidden flex flex-col">
            {/* Realistic Minimal Phone Status Bar */}
            <div className="h-7 px-6 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between text-[11px] font-semibold shrink-0 select-none">
              <span className="font-mono-tech">9:41</span>
              <div className="w-20 h-3.5 rounded-full bg-black/70" aria-hidden="true" />
              <span className="font-mono-tech text-[10px] text-slate-300">5G · 94%</span>
            </div>

            {/* Scrollable Mobile Viewport */}
            <div
              ref={phoneScrollRef}
              className="flex-1 overflow-y-auto overflow-x-hidden relative"
            >
              {renderPrototypeContent()}
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col">
          {renderPrototypeContent()}
        </main>
      )}
    </div>
  );
};

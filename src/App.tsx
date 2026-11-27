import type { PracticeLink } from './data/practiceLinks';
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { ExamView, type ExamViewHandle } from './components/ExamView';
import { Ipv4Trainer, Ipv4SubTab } from './components/Ipv4Trainer';
import { Ipv6Trainer } from './components/Ipv6Trainer';
import { PracticeHub } from './components/PracticeHub';
import { MockPracticeHub } from './components/MockPracticeHub';
import { MockTestingHub } from './components/MockTestingHub';
import { TheoryView } from './components/TheoryView';
import { MobileTabBar } from './components/MobileTabBar';
import { CommandPalette } from './components/CommandPalette';
import { PhotoCredits } from './components/PhotoCredits';
import { TOTAL_QUESTION_COUNT } from './data/questionsData';
import { captureNavigationTrigger, restoreNavigationTrigger, type NavigationTrigger } from './utils/navigationTrigger';

function readStoredBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === '1' || v === 'true';
  } catch {
    return fallback;
  }
}

interface LessonPracticeOrigin {
  tab: 'theory' | 'osi';
  trigger: NavigationTrigger;
}

export function App() {
  const [practiceRequest, setPracticeRequest] = useState<{ link: PracticeLink; id: number; origin?: LessonPracticeOrigin } | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('exam');
  const pendingLessonReturn = useRef<LessonPracticeOrigin | null>(null);
  const [theoryInstance, setTheoryInstance] = useState(0);
  const isTheoryTab = activeTab === 'theory' || activeTab === 'osi';
  const lessonPracticeOrigin = activeTab === 'practice' ? practiceRequest?.origin : undefined;
  const examViewRef = useRef<ExamViewHandle>(null);
  const [isDark, setIsDark] = useState<boolean>(() => readStoredBool('osi_theme_dark', true));
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [showCredits, setShowCredits] = useState<boolean>(false);

  const [theoryQuestionId, setTheoryQuestionId] = useState<string | null>(null);
  const [theoryLessonId, setTheoryLessonId] = useState<string | null>(null);
  const [theoryFromExam, setTheoryFromExam] = useState<boolean>(false);
  const [ipv4InitialPrefix, setIpv4InitialPrefix] = useState<number | undefined>(undefined);
  const [ipv4InitialSubTab, setIpv4InitialSubTab] = useState<Ipv4SubTab | undefined>(undefined);

  useLayoutEffect(() => {
    const origin = pendingLessonReturn.current;
    if (!origin || activeTab !== origin.tab) return;
    pendingLessonReturn.current = null;
    restoreNavigationTrigger(origin.trigger);
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      localStorage.setItem('osi_theme_dark', isDark ? '1' : '0');
    } catch {
      // ignore
    }
  }, [isDark]);

  const handleNavigateToTheory = (questionId: string) => {
    setTheoryLessonId(null);
    setTheoryQuestionId(questionId);
    setTheoryFromExam(true);
    setActiveTab('theory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLesson = (lessonId: string, questionId?: string) => {
    setTheoryLessonId(lessonId);
    setTheoryQuestionId(questionId || null);
    setTheoryFromExam(true);
    setActiveTab('theory');
    // Do not race the paragraph-anchor scroll animation in LessonView.
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleOpenPractice = (link: PracticeLink) => {
    setTheoryLessonId(null);
    setPracticeRequest(previous => ({ link, id: (previous?.id ?? 0) + 1 }));
    setTheoryQuestionId(null);
    setTheoryFromExam(false);
    setActiveTab('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLessonPractice = (link: PracticeLink, trigger: HTMLButtonElement) => {
    if (activeTab !== 'theory' && activeTab !== 'osi') return;
    const origin = { tab: activeTab, trigger: captureNavigationTrigger(trigger) };
    setPracticeRequest(previous => ({ link, id: (previous?.id ?? 0) + 1, origin }));
    setActiveTab('practice');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleReturnToLesson = () => {
    if (!lessonPracticeOrigin) return;
    pendingLessonReturn.current = lessonPracticeOrigin;
    setActiveTab(lessonPracticeOrigin.tab);
    setPracticeRequest(null);
  };

  const discardLessonPracticeOrigin = (tab: NavTab) => {
    if (!lessonPracticeOrigin) return;
    setPracticeRequest(null);
    if (tab === 'theory' || tab === 'osi') {
      // A normal navigation entry is not the explicit lesson return.
      setTheoryInstance(instance => instance + 1);
      setTheoryLessonId(null);
      setTheoryQuestionId(null);
      setTheoryFromExam(false);
    }
  };

  const handleTabChange = (tab: NavTab) => {
    discardLessonPracticeOrigin(tab);
    setTheoryLessonId(null);
    if (tab === 'ipv6') setIpv6InitialMode(undefined);
    if (tab === 'practice') setPracticeRequest(null);
    if (tab === 'exam' && activeTab === 'exam') examViewRef.current?.returnToParameters();
    setActiveTab(tab);
    if (tab !== 'theory') {
      setTheoryQuestionId(null);
      setTheoryFromExam(false);
    }
  };

  const handleReturnToExam = () => {
    setTheoryLessonId(null);
    setTheoryQuestionId(null);
    setTheoryFromExam(false);
    setActiveTab('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [ipv6InitialMode, setIpv6InitialMode] = useState<'concept' | 'type'>();
  const handleNavigateToIpv6 = (mode: 'concept' | 'type') => {
    setIpv6InitialMode(mode);
    setActiveTab('ipv6');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToIpv4 = (prefix?: number, mode?: 'calc' | 'trainer') => {
    setIpv4InitialPrefix(prefix);
    setIpv4InitialSubTab(mode === 'calc' ? 'calculator' : mode === 'trainer' ? 'practice' : undefined);
    setActiveTab('ipv4');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 text-slate-900 dark:bg-[#07111f] dark:text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-150">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isDark={isDark}
        onToggleTheme={() => setIsDark((v) => !v)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-8">
        {activeTab === 'exam' && (
          <ExamView onOpenLesson={handleOpenLesson} onOpenPractice={handleOpenPractice} onNavigateToIpv4={handleNavigateToIpv4} onNavigateToIpv6={handleNavigateToIpv6} ref={examViewRef} onNavigateToTheory={handleNavigateToTheory} onNavigateToLearning={() => {
            setTheoryLessonId(null);
            setTheoryQuestionId(null);
            setTheoryFromExam(false);
            setActiveTab('theory');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        )}
        {(isTheoryTab || lessonPracticeOrigin) && (
          // Keep the lesson, its catalog filters and question context mounted only for this round trip.
          <div key={theoryInstance} hidden={!isTheoryTab} inert={!isTheoryTab}>
            <TheoryView
              initialLessonId={theoryLessonId}
              onOpenPractice={handleOpenPractice}
              onOpenLessonPractice={handleOpenLessonPractice}
              initialQuestionId={theoryQuestionId}
              fromExam={theoryFromExam}
              onReturnToExam={handleReturnToExam}
              onNavigateToIpv4={handleNavigateToIpv4}
              onNavigateToIpv6={handleNavigateToIpv6}
              onClearInitialQuestion={() => {
                setTheoryLessonId(null);
                setTheoryQuestionId(null);
                setTheoryFromExam(false);
              }}
            />
          </div>
        )}
        {activeTab === 'ipv6' && <Ipv6Trainer key={ipv6InitialMode} initialMode={ipv6InitialMode} />}
        {activeTab === 'ipv4' && (
          <Ipv4Trainer
            initialPrefix={ipv4InitialPrefix}
            initialSubTab={ipv4InitialSubTab}
          />
        )}
        {activeTab === 'practice' && <PracticeHub key={practiceRequest?.id ?? 'default'}
          initialPracticeLink={practiceRequest?.link}
          onReturnToLesson={lessonPracticeOrigin ? handleReturnToLesson : undefined} />}
        {activeTab === 'practice-mock' && <MockPracticeHub />}
        {activeTab === 'exam-mock' && <MockTestingHub onOpenLesson={handleOpenLesson} onNavigateToTheory={handleNavigateToTheory} onOpenPractice={handleOpenPractice} onNavigateToIpv4={handleNavigateToIpv4} onNavigateToIpv6={handleNavigateToIpv6} />}
      </main>

      <MobileTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          discardLessonPracticeOrigin(tab);
          if (tab === 'ipv6') setIpv6InitialMode(undefined);
          if (tab === 'practice') setPracticeRequest(null);
          setActiveTab(tab);
          if (tab !== 'theory') {
            setTheoryQuestionId(null);
            setTheoryFromExam(false);
          }
        }}
        onSelectLayer={() => {
          discardLessonPracticeOrigin('theory');
          setActiveTab('theory');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToggleTheme={() => setIsDark((v) => !v)}
        isDark={isDark}
      />

      <footer className="border-t border-slate-200 dark:border-cyan-500/20 py-8 px-4 bg-slate-100/90 dark:bg-[#050c17]/90 text-slate-500 dark:text-slate-400 text-xs mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-slate-800 dark:text-slate-200">
              NetOps
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {TOTAL_QUESTION_COUNT} практических вопросов, симуляции L2/L3 протоколов и CLI-терминал.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => setShowCredits(true)}
              className="text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              Источники фото и лицензии
            </button>
            <span>•</span>
            <a
              href="https://github.com/apotet/osi-tcpip-exam-public"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Исходный репозиторий
            </a>
          </div>
        </div>
      </footer>

      {showCredits && <PhotoCredits onClose={() => setShowCredits(false)} />}
    </div>
  );
}

export default App;

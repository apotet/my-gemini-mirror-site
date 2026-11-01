import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { ExamView } from './components/ExamView';
import { Ipv4Trainer, Ipv4SubTab } from './components/Ipv4Trainer';
import { PracticeHub } from './components/PracticeHub';
import { TheoryView } from './components/TheoryView';
import { DeployModal } from './components/DeployModal';
import { MobileTabBar } from './components/MobileTabBar';
import { CommandPalette } from './components/CommandPalette';
import { ExternalLink, Sparkles, Shield, GitBranch, ArrowUpRight } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('exam');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Deep linking state between Exam Mistakes, Theory, and IPv4 Trainer
  const [theoryQuestionId, setTheoryQuestionId] = useState<string | null>(null);
  const [ipv4InitialPrefix, setIpv4InitialPrefix] = useState<number | undefined>(undefined);
  const [ipv4InitialSubTab, setIpv4InitialSubTab] = useState<Ipv4SubTab | undefined>(undefined);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
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
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleNavigateToTheory = (questionId: string) => {
    setTheoryQuestionId(questionId);
    setActiveTab('theory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToIpv4 = (prefix?: number, mode?: 'calc' | 'trainer') => {
    if (prefix) setIpv4InitialPrefix(prefix);
    if (mode === 'calc') setIpv4InitialSubTab('calculator');
    else if (mode === 'trainer') setIpv4InitialSubTab('practice');
    setActiveTab('ipv4');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-[#07111f] dark:text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-150">
      {/* Top Banner comparing Original & Mirror */}
      <div className="w-full bg-slate-100 border-b border-slate-200 text-slate-700 dark:bg-gradient-to-r dark:from-cyan-950/90 dark:via-slate-900 dark:to-blue-950/90 dark:border-cyan-500/20 dark:text-slate-300 py-2 px-3 sm:px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse shrink-0" />
            <span className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs truncate">
              <strong className="text-cyan-700 dark:text-cyan-300 font-semibold">Резервное зеркало Gemini</strong> для тренажёра OSI/TCP-IP
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] min-w-0">
            <a
              href="https://apotet.github.io/osi-tcpip-exam-public/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono shrink-0"
              title="Оригинальный сайт тренажера от ChatGPT"
            >
              <span>Оригинал: osi-tcpip</span>
              <ArrowUpRight className="w-3 h-3 shrink-0" />
            </a>

            <a
              href="https://apotet.github.io/my-gemini-mirror-site/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:underline flex items-center gap-1 font-mono font-bold shrink-0"
              title="Зеркало тренажера от Gemini"
            >
              <span>Зеркало: my-gemini</span>
              <ArrowUpRight className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'theory') {
            setTheoryQuestionId(null);
          }
        }}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenDeploy={() => setIsDeployModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Content Area with extra padding at bottom on mobile for MobileTabBar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8">
        {activeTab === 'exam' && (
          <ExamView
            soundEnabled={soundEnabled}
            onNavigateToTheory={handleNavigateToTheory}
          />
        )}
        {(activeTab === 'theory' || activeTab === 'osi') && (
          <TheoryView
            initialQuestionId={theoryQuestionId}
            onNavigateToIpv4={handleNavigateToIpv4}
            onClearInitialQuestion={() => setTheoryQuestionId(null)}
          />
        )}
        {activeTab === 'ipv4' && (
          <Ipv4Trainer
            soundEnabled={soundEnabled}
            initialPrefix={ipv4InitialPrefix}
            initialSubTab={ipv4InitialSubTab}
          />
        )}
        {activeTab === 'practice' && <PracticeHub />}
      </main>

      {/* Mobile Bottom Tab Bar (Visible on mobile/tablet matching mockup IMG_2164) */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'theory') {
            setTheoryQuestionId(null);
          }
        }}
      />

      {/* Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'theory') setTheoryQuestionId(null);
        }}
        onSelectLayer={(layer) => {
          setActiveTab('theory');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenDeploy={() => setIsDeployModalOpen(true)}
        isDark={isDark}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-cyan-500/20 py-8 px-4 bg-slate-100/90 dark:bg-[#050c17]/90 text-slate-500 dark:text-slate-400 text-xs mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
              <span>OSI & TCP/IP Exam Trainer</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 font-mono font-bold">
                Gemini Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              502 практических вопроса, симуляции L2/L3 протоколов и CLI-терминал.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs font-mono">
            <a
              href="/osi-tcpip-trainer-source.zip"
              download="osi-tcpip-trainer-source.zip"
              className="text-emerald-400 hover:underline cursor-pointer font-bold flex items-center gap-1"
              title="Скачать полный ZIP архив проекта с исходным кодом"
            >
              <span>📦 Скачать ZIP исходник</span>
            </a>
            <span>•</span>
            <button
              onClick={() => setIsDeployModalOpen(true)}
              type="button"
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Синхронизировать с GitHub
            </button>
            <span>•</span>
            <a
              href="https://github.com/apotet/osi-tcpip-exam-public"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Исходный репозиторий
            </a>
          </div>
        </div>
      </footer>

      {/* Deploy & Sync Modal */}
      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  );
}

export default App;

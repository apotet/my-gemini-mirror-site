import React, { useState } from 'react';
import {
  Layers,
  Terminal,
  Activity,
  Cpu,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  UploadCloud,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  FlaskConical,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

export type NavTab = 'exam' | 'theory' | 'ipv4' | 'practice' | 'osi';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenDeploy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isDark,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenDeploy,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'exam', label: 'Экзамен', icon: <Layers className="w-4 h-4" /> },
    { id: 'theory', label: 'Теория и разборы', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
    { id: 'ipv4', label: 'IPv4 Тренажёр', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'practice', label: 'Практика', icon: <FlaskConical className="w-4 h-4 text-indigo-400" /> },
  ];

  const handleTabClick = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => handleTabClick('exam')}
            type="button"
            className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 font-mono shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
              7
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5 truncate">
                <span>OSI & TCP/IP</span>
                <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  Gemini Mirror
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block truncate">
                502 вопроса · визуализаторы · CLI
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id || (tab.id === 'theory' && activeTab === 'osi');
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                type="button"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Link to original ChatGPT site */}
          <a
            href="https://apotet.github.io/osi-tcpip-exam-public/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-300 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all min-h-[38px]"
            title="Открыть исходный сайт от ChatGPT"
          >
            <span>Оригинал</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          {/* GitHub Sync Button */}
          <button
            onClick={onOpenDeploy}
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-900/80 transition-all cursor-pointer min-h-[38px] shadow-sm shadow-cyan-500/20"
            title="Синхронизация зеркала с GitHub Pages"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="hidden sm:inline">Синхронизация</span>
          </button>

          {/* Reload / Refresh App Cache Button (Desktop / Tablet) */}
          <button
            onClick={() => {
              window.location.href = window.location.origin + window.location.pathname + '?reload=' + Date.now();
            }}
            type="button"
            className="hidden sm:flex p-2 text-slate-400 hover:text-cyan-300 rounded-xl hover:bg-white/5 transition-colors min-h-[38px] min-w-[38px] items-center justify-center cursor-pointer"
            aria-label="Обновить код приложения"
            title="Перезагрузить код приложения (сброс кэша)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sound Toggle (Desktop / Tablet) */}
          <button
            onClick={onToggleSound}
            type="button"
            className="hidden sm:flex p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors min-h-[38px] min-w-[38px] items-center justify-center cursor-pointer"
            aria-label={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            title={soundEnabled ? 'Звук включен' : 'Звук выключен'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Theme Toggle (Desktop / Tablet) */}
          <button
            onClick={onToggleTheme}
            type="button"
            className="hidden sm:flex p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors min-h-[38px] min-w-[38px] items-center justify-center cursor-pointer"
            aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
            aria-label="Открыть меню"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-4 border-t border-slate-800 bg-[#07111f]/98 backdrop-blur-2xl space-y-3 animate-fade-in shadow-2xl">
          <div className="space-y-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id || (tab.id === 'theory' && activeTab === 'osi');
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  type="button"
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all min-h-[44px] cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Quick Controls Toolbar */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 px-1">
              Быстрые настройки
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onToggleSound}
                type="button"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col items-center justify-center gap-1 hover:border-cyan-500/40 cursor-pointer"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-[10px]">{soundEnabled ? 'Звук вкл' : 'Без звука'}</span>
              </button>

              <button
                onClick={onToggleTheme}
                type="button"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col items-center justify-center gap-1 hover:border-cyan-500/40 cursor-pointer"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span className="text-[10px]">{isDark ? 'Тёмная' : 'Светлая'}</span>
              </button>

              <button
                onClick={() => {
                  window.location.href = window.location.origin + window.location.pathname + '?reload=' + Date.now();
                }}
                type="button"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col items-center justify-center gap-1 hover:border-cyan-500/40 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px]">Сброс кэша</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <a
              href="https://apotet.github.io/osi-tcpip-exam-public/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              <span>Оригинал ChatGPT</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDeploy();
              }}
              type="button"
              className="text-cyan-300 hover:underline flex items-center gap-1 font-mono text-[11px] font-bold cursor-pointer"
            >
              <UploadCloud className="w-3 h-3" />
              <span>Опубликовать</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

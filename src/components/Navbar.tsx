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
} from 'lucide-react';

export type NavTab = 'exam' | 'osi' | 'journey' | 'vlan' | 'cli';

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
    { id: 'osi', label: 'Модель OSI', icon: <Cpu className="w-4 h-4" /> },
    { id: 'journey', label: 'Путь пакета', icon: <Activity className="w-4 h-4" /> },
    { id: 'vlan', label: 'VLAN & Trunk', icon: <Layers className="w-4 h-4" /> },
    { id: 'cli', label: 'CLI-терминал', icon: <Terminal className="w-4 h-4" /> },
  ];

  const handleTabClick = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTabClick('exam')}
            type="button"
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 font-mono shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              7
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                <span>OSI & TCP/IP</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  Gemini Mirror
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                502 вопроса · визуализаторы · CLI
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
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
        <div className="flex items-center gap-2">
          {/* Link to original ChatGPT site */}
          <a
            href="https://apotet.github.io/osi-tcpip-exam-public/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-300 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all min-h-[40px]"
            title="Открыть исходный сайт от ChatGPT"
          >
            <span>Оригинал (ChatGPT)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          {/* GitHub Sync Button */}
          <button
            onClick={onOpenDeploy}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-900/80 transition-all cursor-pointer min-h-[40px] shadow-sm shadow-cyan-500/20"
            title="Синхронизация зеркала с GitHub Pages"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Синхронизировать</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            type="button"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            aria-label={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            title={soundEnabled ? 'Звук включен' : 'Звук выключен'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            type="button"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
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
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Открыть меню"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-4 border-t border-slate-800 bg-[#07111f]/95 backdrop-blur-2xl space-y-2 animate-fade-in">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                type="button"
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all min-h-[48px] cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800">
            <a
              href="https://apotet.github.io/osi-tcpip-exam-public/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 min-h-[48px]"
            >
              <span>Открыть оригинал (ChatGPT)</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

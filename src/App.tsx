import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { ExamView } from './components/ExamView';
import { Ipv4Trainer } from './components/Ipv4Trainer';
import { ProtocolSimulators } from './components/ProtocolSimulators';
import { OsiExplorer } from './components/OsiExplorer';
import { PacketJourney } from './components/PacketJourney';
import { VlanSimulator } from './components/VlanSimulator';
import { CliSimulator } from './components/CliSimulator';
import { DeployModal } from './components/DeployModal';
import { ExternalLink, Sparkles, Shield, GitBranch, ArrowUpRight } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('exam');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Banner comparing Original & Mirror */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border-b border-cyan-500/20 py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-300">
              <strong className="text-cyan-300">Резервное зеркало Gemini</strong> для учебного тренажёра OSI/TCP-IP
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://apotet.github.io/osi-tcpip-exam-public/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
            >
              Оригинал (ChatGPT): osi-tcpip-exam-public
              <ArrowUpRight className="w-3 h-3" />
            </a>

            <a
              href="https://apotet.github.io/my-gemini-mirror-site/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:underline flex items-center gap-1 font-mono font-bold"
            >
              Зеркало (Gemini): my-gemini-mirror-site
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenDeploy={() => setIsDeployModalOpen(true)}
      />

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'exam' && <ExamView soundEnabled={soundEnabled} />}
        {activeTab === 'ipv4' && <Ipv4Trainer soundEnabled={soundEnabled} />}
        {activeTab === 'journey' && <PacketJourney />}
        {activeTab === 'vlan' && <VlanSimulator />}
        {activeTab === 'protocols' && <ProtocolSimulators />}
        {activeTab === 'osi' && <OsiExplorer />}
        {activeTab === 'cli' && <CliSimulator />}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 py-8 px-4 bg-[#050c17]/90 text-slate-400 text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
              <span>OSI & TCP/IP Exam Trainer</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                Gemini Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              502 практических вопроса, симуляции L2/L3 протоколов и CLI-терминал.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
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

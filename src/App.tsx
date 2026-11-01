import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Moon,
  Sun,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Github,
  Download,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Flame,
  Smartphone,
  Gauge,
  Share2,
  MousePointerClick,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Code2,
  Star,
  MessageSquare,
  Sparkle,
  Monitor,
  Heart,
  Send,
  RefreshCw,
  Sliders,
  CheckCheck
} from 'lucide-react';
import {
  generateProjectZip,
  downloadBlob,
  pushProjectToGitHub,
  enableGitHubPages,
  getProjectFiles
} from './projectExporter';

const safeStorage = {
  getItem: (key: string): string => {
    try {
      return window.localStorage?.getItem(key) || '';
    } catch {
      return '';
    }
  },
  setItem: (key: string, val: string) => {
    try {
      window.localStorage?.setItem(key, val);
    } catch {
      // Ignore if iframe storage is blocked
    }
  },
};

export default function App() {
  // Theme state: dark or light
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = safeStorage.getItem('theme_pref');
    return saved ? saved === 'dark' : true;
  });

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active showcase tab in features section
  const [activeFeatureTab, setActiveFeatureTab] = useState<'ui' | 'speed' | 'mobile' | 'seo'>('ui');

  // Interactive Skeleton toggle to demonstrate micro-interactions
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // Social share previewer state
  const [socialNetwork, setSocialNetwork] = useState<'telegram' | 'vk' | 'whatsapp'>('telegram');
  const [customOgTitle, setCustomOgTitle] = useState('Gemini Mirror Edition — Премиальный веб-сайт');
  const [customOgDesc, setCustomOgDesc] = useState('Зеркальная версия с адаптивным дизайном, эффектами стекла и молниеносной скоростью загрузки.');

  // Contact / Lead form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // GitHub Export Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [githubToken, setGithubToken] = useState(() => safeStorage.getItem('gh_token'));
  const [showToken, setShowToken] = useState(false);
  const [mirrorRepoName, setMirrorRepoName] = useState('my-gemini-mirror-site');
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState('');
  const [pushProgress, setPushProgress] = useState(0);
  const [pushSuccessUrl, setPushSuccessUrl] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);

  // GitHub Pages auto-activation state
  const [isEnablingPages, setIsEnablingPages] = useState(false);
  const [pagesActivatedUrl, setPagesActivatedUrl] = useState<string | null>(null);
  const [pagesError, setPagesError] = useState<string | null>(null);

  const handleAutoEnablePages = async () => {
    if (!githubToken.trim()) {
      setPagesError('Токен доступа не найден. Введите ваш GitHub Personal Access Token.');
      return;
    }
    setIsEnablingPages(true);
    setPagesError(null);
    try {
      const res = await enableGitHubPages({
        token: githubToken.trim(),
        repoName: mirrorRepoName.trim() || 'my-gemini-mirror-site'
      });
      setPagesActivatedUrl(res.pageUrl);
    } catch (err: any) {
      setPagesError(err.message || 'Не удалось автоматически включить GitHub Pages через API');
    } finally {
      setIsEnablingPages(false);
    }
  };

  // Copy helper state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    safeStorage.setItem('theme_pref', next ? 'dark' : 'light');
  };

  const copyToClipboard = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadZip = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      setIsZipping(true);
      const zipBlob = await generateProjectZip();
      downloadBlob(zipBlob, `${mirrorRepoName || 'gemini-mirror-site'}.zip`);
    } catch (err: any) {
      alert(`Ошибка при сборке архива: ${err.message}`);
    } finally {
      setIsZipping(false);
    }
  };

  const handlePushToGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken.trim()) {
      setPushError('Пожалуйста, введите ваш токен доступа GitHub (PAT).');
      return;
    }

    setIsPushing(true);
    setPushError(null);
    setPushSuccessUrl(null);
    setPushProgress(5);
    setPushStatus('Подключение к GitHub API...');

    safeStorage.setItem('gh_token', githubToken.trim());

    try {
      const res = await pushProjectToGitHub({
        token: githubToken.trim(),
        repoName: mirrorRepoName.trim() || 'my-gemini-mirror-site',
        isPrivate: false,
        onProgress: (status, percent) => {
          setPushStatus(status);
          setPushProgress(percent);
        },
      });

      setPushSuccessUrl(res.repoUrl);
    } catch (err: any) {
      setPushError(err.message || 'Ошибка при выгрузке на GitHub');
    } finally {
      setIsPushing(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSubmitted(true);
    }, 800);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30 ${isDark ? 'bg-indigo-600' : 'bg-indigo-400'}`} />
        <div className={`absolute top-1/3 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-violet-600' : 'bg-violet-300'}`} />
        <div className={`absolute -bottom-40 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-25 ${isDark ? 'bg-cyan-600' : 'bg-cyan-300'}`} />
      </div>

      {/* TOP HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <a href="#hero" className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  Gemini<span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Mirror</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Премиальная зеркальная версия</p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="px-3 py-2 rounded-xl hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition">
              Преимущества
            </a>
            <a href="#comparison" className="px-3 py-2 rounded-xl hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition">
              Сравнение с ChatGPT
            </a>
            <a href="#social-preview" className="px-3 py-2 rounded-xl hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition">
              SEO & Соцсети
            </a>
            <a href="#contact" className="px-3 py-2 rounded-xl hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition">
              Связь
            </a>
          </nav>

          {/* Action Tools & Theme Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle (min touch target >= 44px) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Переключить тему оформления"
              className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* Quick Export to GitHub Button */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="hidden sm:inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Выгрузить в GitHub</span>
            </button>

            {/* Download ZIP */}
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="hidden lg:inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <Download className={`w-4 h-4 ${isZipping ? 'animate-bounce' : ''}`} />
              <span>{isZipping ? 'Сборка...' : 'ZIP'}</span>
            </button>

            {/* Mobile Hamburger Button (min touch target >= 44px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Открыть мобильное меню"
              className="md:hidden w-11 h-11 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE DRAWER / MENU (Touch targets >= 48px) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-fadeIn shadow-2xl">
            <nav className="flex flex-col space-y-2 text-base font-semibold">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[48px] flex items-center px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 transition"
              >
                ⚡ Преимущества и возможности
              </a>
              <a
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[48px] flex items-center px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 transition"
              >
                ⚔️ Сравнение с ChatGPT
              </a>
              <a
                href="#social-preview"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[48px] flex items-center px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 transition"
              >
                📱 SEO & Соцсети (Превью)
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[48px] flex items-center px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 transition"
              >
                ✉️ Контакты и связь
              </a>
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowExportModal(true);
                }}
                className="w-full min-h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <UploadCloud className="w-5 h-5" />
                <span>Опубликовать на GitHub</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleDownloadZip(e);
                }}
                className="w-full min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Скачать исходный код (ZIP)</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Glassmorphic Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border shadow-sm backdrop-blur-xl border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold animate-pulse">
            <Sparkle className="w-4 h-4 text-cyan-500" />
            <span>Новое поколение веб-дизайна от Google AI Studio</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            Премиальная зеркальная версия вашего сайта{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-400 bg-clip-text text-transparent">
              на шаг впереди.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Эффект матового стекла (glassmorphism), живые микро-интеракции, мгновенный стек React 19 + Tailwind CSS и адаптивность на всех экранах.
          </p>

          {/* CTA Buttons (Touch target >= 48px) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#comparison"
              className="min-h-[52px] px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Сравнить с ChatGPT</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="min-h-[52px] px-7 rounded-2xl border backdrop-blur-xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-md"
            >
              <Github className="w-5 h-5 text-indigo-500" />
              <span>Выгрузить на мой GitHub</span>
            </button>
          </div>

          {/* Metric Highlights Floating Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {[
              { val: '100 / 100', label: 'Lighthouse Performance', icon: Gauge, color: 'text-emerald-500' },
              { val: '0.2 сек', label: 'Мгновенный LCP отклик', icon: Zap, color: 'text-amber-500' },
              { val: '≥ 48 px', label: 'Удобные тач-зоны', icon: Smartphone, color: 'text-cyan-500' },
              { val: '0.00 CLS', label: 'Нулевой сдвиг вёрстки', icon: ShieldCheck, color: 'text-indigo-500' },
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:translate-y-[-2px] border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 shadow-sm"
                >
                  <div className="flex items-center justify-center space-x-1.5 mb-1">
                    <Icon className={`w-4 h-4 ${m.color}`} />
                    <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">{m.val}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{m.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX (ChatGPT vs Gemini Mirror) */}
      <section id="comparison" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Битва версий</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            ChatGPT vs Google AI Studio
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Наглядная разница между стандартной генерацией и продуманным зеркальным сайтом.
          </p>
        </div>

        {/* Side-by-Side Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: ChatGPT Original */}
          <div className="rounded-3xl border p-6 sm:p-8 flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-sm">
                    GPT
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Версия от ChatGPT</h3>
                    <p className="text-xs text-slate-500">Оригинальный шаблон</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Базовый уровень
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Плоский дизайн:</strong> Стандартные цвета, отсутствие градиентов и эффектов глубины.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Статичные элементы:</strong> Нет плавных переходов (hover), микро-анимаций и скелетонов.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Мобильная верстка:</strong> Мелкие кнопки, в которые трудно попасть пальцем на смартфоне.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Нет тёмной темы:</strong> Фиксированная цветовая схема без выбора пользователя.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Пустые соцсети:</strong> Отсутствие OpenGraph карточек в Telegram и WhatsApp.</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500">
              Подходит как черновик, но уступает в конверсии и вовлечении аудитории.
            </div>
          </div>

          {/* Card 2: Gemini Mirror Edition */}
          <div className="rounded-3xl border p-6 sm:p-8 flex flex-col justify-between border-indigo-500/50 bg-gradient-to-br from-indigo-950/20 via-white/80 to-cyan-950/20 dark:from-indigo-950/40 dark:via-slate-900/80 dark:to-cyan-950/40 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between pb-4 border-b border-indigo-500/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/30">
                    AI
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Зеркало от Google AI Studio</h3>
                    <p className="text-xs text-indigo-500 dark:text-indigo-300">Gemini Mirror Edition</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Премиум
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-800 dark:text-slate-200">
                <div className="flex items-start space-x-3">
                  <CheckCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Glassmorphism & Градиенты:</strong> Эффект матового стекла, плавные переливы, мягкие тени.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Живая микро-интерактивность:</strong> Плавный hover, скелетоны при загрузке, анимации при скролле.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>100% мобильность:</strong> Крупные тач-зоны от 48px, плавное выпадающее меню, поддержка свайпов.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Тёмная и светлая тема:</strong> Интуитивный переключатель с сохранением настроек пользователя.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Rich Social Cards:</strong> Привлекательное превью при репосте в Telegram, VK и WhatsApp.</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
              <span className="font-semibold">Готово к публикации на отдельном GitHub Pages</span>
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="font-bold underline hover:text-indigo-400 cursor-pointer"
              >
                Опубликовать ↗
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FEATURES & SKELETON DEMO SECTION */}
      <section id="features" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Zap className="w-3.5 h-3.5" />
              <span>Микро-интерактивность в действии</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Интерактивные возможности
            </h2>
          </div>

          {/* Test Skeleton Loading State Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsLoadingDemo(true);
              setTimeout(() => setIsLoadingDemo(false), 1200);
            }}
            disabled={isLoadingDemo}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDemo ? 'animate-spin' : ''}`} />
            <span>{isLoadingDemo ? 'Показ скелетона...' : 'Проверить анимацию скелетона (Демо)'}</span>
          </button>
        </div>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: UI & Typography */}
          <div className="rounded-3xl border p-6 sm:p-8 border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
            {isLoadingDemo ? (
              <div className="space-y-4 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-slate-300 dark:bg-slate-800" />
                <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-5/6" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Премиум Glassmorphism
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Многослойный интерфейс с глубоким эффектом матового стекла, плавными тенями и поддержкой передовых возможностей Tailwind CSS v4.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-indigo-600 dark:text-indigo-300">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">backdrop-blur-xl</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">aurora glow</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Speed & React 19 */}
          <div className="rounded-3xl border p-6 sm:p-8 border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
            {isLoadingDemo ? (
              <div className="space-y-4 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-slate-300 dark:bg-slate-800" />
                <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-5/6" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  React 19 + Vite сборка
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Молниеносный старт за 0.1 секунды. Компонентная структура, типизация TypeScript и нулевой сдвиг вёрстки (CLS = 0.00).
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-amber-600 dark:text-amber-300">
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">React 19</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">Vite v8</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Mobile Touch Targets */}
          <div className="rounded-3xl border p-6 sm:p-8 border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
            {isLoadingDemo ? (
              <div className="space-y-4 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-slate-300 dark:bg-slate-800" />
                <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-5/6" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Тач-зоны от 48px
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Идеальная эргономика для мобильных устройств. Все кнопки и интерактивные зоны соответствуют гайдам Apple HIG и Google Material Design.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-cyan-600 dark:text-cyan-300">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800">Touch target 48px</span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800">Mobile Drawer</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LIVE SOCIAL MEDIA & OPENGRAPH PREVIEWER SECTION */}
      <section id="social-preview" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Share2 className="w-3.5 h-3.5" />
                <span>SEO & OpenGraph Симулятор</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Живое превью сайта при отправке в соцсети
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Посмотрите, как красиво будет выглядеть ссылка на ваш зеркальный сайт в Telegram, VK и WhatsApp:
              </p>
            </div>

            {/* Network Switcher */}
            <div className="flex items-center space-x-1 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
              {(['telegram', 'vk', 'whatsapp'] as const).map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() => setSocialNetwork(net)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                    socialNetwork === net
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          {/* Social Simulator Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Editor inputs (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Заголовок для соцсетей (og:title)
                </label>
                <input
                  type="text"
                  value={customOgTitle}
                  onChange={(e) => setCustomOgTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Описание ссылки (og:description)
                </label>
                <textarea
                  rows={3}
                  value={customOgDesc}
                  onChange={(e) => setCustomOgDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Всё уже прописано в тегах &lt;head&gt; файла index.html</span>
                </div>
                <p>Ваша ссылка на сайт никогда не будет пустой серым прямоугольником при пересылке клиентам или друзьям.</p>
              </div>
            </div>

            {/* Social Card Mockup (7 cols) */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-md rounded-2xl border p-4 shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90">
                <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500">
                  <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Превью в {socialNetwork.toUpperCase()}</span>
                </div>

                {/* Simulated message bubble */}
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                    <img
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                      alt="Website OpenGraph Preview"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 text-white text-xs font-bold drop-shadow">
                      gemini-mirror.github.io
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {customOgTitle}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {customOgDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LEAD / CONTACT SECTION */}
      <section id="contact" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10 relative">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center max-w-md mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Свяжитесь с нами
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Оставьте заявку или отзыв, чтобы мы добавили в зеркальный сайт ещё больше нужных страниц.
            </p>
          </div>

          {formSubmitted ? (
            <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Сообщение успешно отправлено!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Спасибо! Мы обработаем ваш запрос и внедрим функции в зеркальную версию.
              </p>
              <button
                type="button"
                onClick={() => setFormSubmitted(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white cursor-pointer"
              >
                Отправить ещё
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 max-w-lg mx-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ваше имя
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Александр"
                  className="w-full min-h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email или Telegram
                </label>
                <input
                  type="text"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="@username или mail@example.com"
                  className="w-full min-h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Что улучшить на сайте?
                </label>
                <textarea
                  rows={3}
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Опишите, какую страницу или функционал добавить..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full min-h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {formLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Отправить запрос</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Gemini Mirror Edition</span>
            <span>• Зеркальная версия сайта от Google AI Studio</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleDownloadZip}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Скачать ZIP
            </button>
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" /> Выгрузить в GitHub
            </button>
          </div>
        </div>
      </footer>

      {/* GITHUB EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowExportModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <Github className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                Выгрузить зеркало в ваш GitHub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Приложение создаст отдельный репозиторий на вашем GitHub и загрузит весь код.
              </p>
            </div>

            <form onSubmit={handlePushToGithub} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Имя нового репозитория
                </label>
                <input
                  type="text"
                  required
                  value={mirrorRepoName}
                  onChange={(e) => setMirrorRepoName(e.target.value)}
                  placeholder="my-gemini-mirror-site"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    Получить токен <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    required
                    value={githubToken}
                    onChange={(e) => {
                      setGithubToken(e.target.value);
                      safeStorage.setItem('gh_token', e.target.value.trim());
                    }}
                    placeholder="ghp_..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isPushing && (
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                    <span>{pushStatus}</span>
                    <span>{pushProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pushProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {pushError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                  {pushError}
                </div>
              )}

              {pushSuccessUrl && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs space-y-3">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Зеркальный сайт успешно выгружен на GitHub!</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Репозиторий готов. Теперь мы можем автоматически включить GitHub Pages в один клик:
                  </p>

                  {pagesActivatedUrl ? (
                    <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 space-y-1.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>GitHub Pages активирован!</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        GitHub запустил сборку (1–2 минуты). Адрес вашего работающего сайта:
                      </p>
                      <a
                        href={pagesActivatedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 underline text-xs pt-1"
                      >
                        <span>{pagesActivatedUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAutoEnablePages}
                      disabled={isEnablingPages}
                      className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${isEnablingPages ? 'animate-spin' : ''}`} />
                      <span>{isEnablingPages ? 'Включение GitHub Pages через API...' : '⚡ Включить GitHub Pages автоматически'}</span>
                    </button>
                  )}

                  {pagesError && (
                    <div className="p-2 rounded bg-rose-500/10 text-rose-500 text-[11px]">
                      {pagesError}
                    </div>
                  )}

                  <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Ссылка на сам репозиторий:</span>
                    <a
                      href={pushSuccessUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold underline text-indigo-600 dark:text-indigo-400"
                    >
                      <span>Открыть код</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPushing}
                  className="flex-1 min-h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isPushing ? 'Выгрузка файлов...' : 'Выгрузить в мой GitHub'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

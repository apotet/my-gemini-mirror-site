import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { getInitialProgress, ProgressState, resetProgress, subscribeProgress } from '../utils/userProgress';
import {
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface KnowledgeRadarProps {
  onStartExam: (levelFilter?: string) => void;
  onReviewMistakes: () => void;
  onOpenVisualL1: () => void;
  mistakesCount: number;
  totalQuestionsCount?: number;
}

export const KnowledgeRadar: React.FC<KnowledgeRadarProps> = ({
  onStartExam,
  onReviewMistakes,
  onOpenVisualL1,
  mistakesCount,
  totalQuestionsCount = 502,
}) => {
  const [progress, setProgress] = useState<ProgressState>(getInitialProgress);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [migrationAcknowledged, setMigrationAcknowledged] = useState<boolean>(() => {
    try { return localStorage.getItem('osi_progress_migration_ack_v4') === '1'; }
    catch { return false; }
  });
  const acknowledgeMigration = () => {
    setMigrationAcknowledged(true);
    try { localStorage.setItem('osi_progress_migration_ack_v4', '1'); }
    catch { /* The notice remains dismissible for this session. */ }
  };

  useEffect(() => {
    const refresh = () => setProgress(getInitialProgress());
    const unsubscribe = subscribeProgress(refresh);
    window.addEventListener('focus', refresh);
    refresh();
    return () => { unsubscribe(); window.removeEventListener('focus', refresh); };
  }, []);

  // SVG Circular Gauge Math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((progress.readinessPercent ?? 0) / 100) * circumference;

  const handleLevelDrill = (level?: string) => {
    if (!level) return;
    triggerHaptic('medium');
    onStartExam(level);
  };

  const handleReset = () => {
    if (!window.confirm('Сбросить весь прогресс и сохранённую сессию? Удаление необратимо. Банк вопросов сохранится.')) return;
    triggerHaptic('heavy');
    const reset = resetProgress();
    setProgress(reset);
  };

  return (
    <div className="space-y-3 w-full">
      {progress.migrationNotice && !migrationAcknowledged && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/30 p-3 text-xs text-amber-600 dark:text-amber-300">
          <p className="flex-1 min-w-[200px]">Старый прогресс частично недостоверен: перенесены только проверяемые ответы и ID ошибок. Исходные данные сохранены в локальном резерве.</p>
          <button type="button" onClick={acknowledgeMigration} className="shrink-0 rounded-md border border-amber-500/50 px-3 py-1.5 font-semibold hover:bg-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">
            Понятно
          </button>
        </div>
      )}
      {progress.storageWarning && <p role="alert" className="text-xs text-rose-600">Хранилище недоступно: изменения доступны в этой вкладке и могут потеряться после перезагрузки.</p>}
      {/* Hero Readiness & Streak Card (Matching Mockup Bento Card) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#0c1c2e] dark:via-[#091524] dark:to-[#07111f] border border-slate-200 dark:border-cyan-500/30 shadow-lg dark:shadow-2xl relative overflow-hidden transition-colors">
        {/* Subtle radial glow in dark mode */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Circular Readiness Gauge & Text */}
          <div
            onClick={() => {
              triggerHaptic('selection');
              setShowBreakdown(!showBreakdown);
            }}
            className="flex items-center gap-4 cursor-pointer group"
            title="Точность подтверждённых ответов по учебным группам"
          >
            {/* Circular Gauge */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress Ring with Cyan Glow */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-cyan-500 dark:stroke-cyan-400 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.6))',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">
                  {progress.readinessPercent === null ? '—' : `${progress.readinessPercent}%`}
                </span>
              </div>
            </div>

            {/* Contextual Readiness Analysis */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                  Точность ответов
                </h2>
                {showBreakdown ? (
                  <ChevronUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" />
                )}
              </div>

              <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                <p>{progress.readinessPercent === null ? 'Недостаточно данных: нужно 10 подтверждённых ответов.' : 'Доля верных среди подтверждённых ответов, не прогноз готовности.'}</p>
                <p>Выборка: {progress.answeredCount} ответов, {progress.correctCount} верных.</p>
                {progress.weakSpot && <button type="button" onClick={e => { e.stopPropagation(); handleLevelDrill(progress.weakSpot?.level); }}>
                  Ниже точность: {progress.weakSpot.topic}
                </button>}
                {progress.strongSpot && <p>Выше точность: {progress.strongSpot.topic}</p>}
                <p>Сравнение групп — от 10 ответов в каждой из двух групп.</p>
              </div>
            </div>
          </div>

          {/* Streak indicator badge */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowStreakModal(!showStreakModal);
              }}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-cyan-950/80 dark:hover:bg-cyan-900 border border-slate-300 dark:border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              title="Ваша непрерывная серия дней"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>Серия {progress.streakDays} дн.</span>
            </button>
          </div>
        </div>

        {/* Streak Details Drawer */}
        {showStreakModal && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span>🔥 Непрерывные занятия</span>
              <span className="text-amber-500">{progress.streakDays} дней подряд</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              День засчитывается после одного подтверждённого ответа. Серия считается по локальным календарным датам; повтор в тот же день не добавляет дней.
            </p>
          </div>
        )}

        {/* Interactive 7-Layer Mastery Breakdown Drawer */}
        {showBreakdown && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-500" />
                Точность по учебным группам
              </span>
              <button
                onClick={handleReset}
                type="button"
                className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors font-mono flex items-center gap-1 cursor-pointer"
                title="Необратимый сброс после подтверждения"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сброс статистики</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(progress.levels).map((lvl) => {
                const isWeak = lvl.level === progress.weakSpot?.level;
                const isStrong = lvl.level === progress.strongSpot?.level;

                return (
                  <div
                    key={lvl.level}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      isWeak
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/40'
                        : isStrong
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                          {lvl.level} {lvl.name.split(' ')[0]}
                        </span>
                        <span className="font-mono font-bold text-[11px] text-cyan-600 dark:text-cyan-400">
                          {lvl.total >= 10 ? `${lvl.masteryPercent}%` : 'Мало данных'} · {lvl.total} отв.
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWeak ? 'bg-rose-500' : isStrong ? 'bg-emerald-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${lvl.total >= 10 ? lvl.masteryPercent : 0}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleLevelDrill(lvl.level)}
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold shrink-0 cursor-pointer transition-colors"
                      title={`Тренировать уровень ${lvl.level}`}
                    >
                      Тест
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bento Action Cards: Mistakes Drill + Visual L1 (Exactly as in mockup) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Mistakes Review Mini Card */}
        <div
          onClick={() => {
            triggerHaptic('medium');
            onReviewMistakes();
          }}
          className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#091524] border border-rose-300 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-400/60 hover:bg-rose-50/50 dark:hover:bg-[#0b1a2d] transition-all cursor-pointer flex flex-col justify-between min-h-[96px] shadow-sm dark:shadow-lg dark:shadow-rose-950/20 group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors block">
              Работа над ошибками
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              {mistakesCount}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            вопросов на повтор · по 20 за сеанс
          </span>
        </div>

        {/* Visual L1 Equipment Cards */}
        <div
          onClick={() => {
            triggerHaptic('light');
            onOpenVisualL1();
          }}
          className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#091524] border border-cyan-300 dark:border-cyan-500/30 hover:border-cyan-400 dark:hover:border-cyan-400/60 hover:bg-cyan-50/50 dark:hover:bg-[#0b1a2d] transition-all cursor-pointer flex flex-col justify-between min-h-[96px] shadow-sm dark:shadow-lg dark:shadow-cyan-950/20 group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-200 transition-colors block">
              Фото L1
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              {progress.visualAnswered}/{progress.visualTotal}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            разобрано
          </span>
        </div>
      </div>

      {/* Main Big Glow CTA Button: "Продолжить экзамен" */}
      <button
        onClick={() => {
          triggerHaptic('heavy');
          onStartExam();
        }}
        type="button"
        className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-400 text-slate-950 font-black text-sm sm:text-base hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(34,211,238,0.35)] cursor-pointer tracking-wide"
      >
        <Sparkles className="w-4 h-4 fill-slate-950" />
        <span>Продолжить экзамен</span>
      </button>
    </div>
  );
};

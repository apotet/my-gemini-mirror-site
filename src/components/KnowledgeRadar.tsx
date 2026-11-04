import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { getInitialProgress, ProgressState, resetProgress, subscribeProgress } from '../utils/userProgress';
import {
  Flame,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  RotateCcw,
} from 'lucide-react';

interface KnowledgeRadarProps {
  onStartExam: (levelFilter?: string) => void;
  onStartNewExam?: () => void;
  hasActiveSession?: boolean;
  onReviewMistakes: () => void;
  onOpenVisualL1?: () => void;
  mistakesCount: number;
  totalQuestionsCount?: number;
}

export const KnowledgeRadar: React.FC<KnowledgeRadarProps> = ({
  onStartExam,
  onStartNewExam,
  hasActiveSession = false,
  onReviewMistakes,
  mistakesCount,
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

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const hasAccuracy = progress.readinessPercent !== null;
  const towardAccuracy = Math.min(progress.answeredCount, 10);
  const gaugePercent = hasAccuracy
    ? progress.readinessPercent!
    : (towardAccuracy / 10) * 100;
  const strokeDashoffset = circumference - (gaugePercent / 100) * circumference;

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

  const helperLine = hasActiveSession
    ? 'Продолжи с того места, где остановился'
    : mistakesCount > 0
      ? `${mistakesCount} ошибок ждут разбора`
      : progress.streakDays > 0
        ? `Серия ${progress.streakDays} дн. · не прерывай`
        : '10 вопросов — и появится твоя точность';

  const statusTitle = hasAccuracy
    ? `Точность ${progress.readinessPercent}%`
    : towardAccuracy > 0
      ? `${towardAccuracy}/10 до точности`
      : 'Точность появится после 10 ответов';

  const statusSub = hasAccuracy
    ? `${progress.answeredCount} ответов · ${progress.correctCount} верных`
    : towardAccuracy > 0
      ? `Ещё ${10 - towardAccuracy} подтверждённых ответов`
      : 'Пройди короткую сессию';

  return (
    <div className="space-y-4 w-full">
      {progress.migrationNotice && !migrationAcknowledged && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/30 p-3 text-xs text-amber-600 dark:text-amber-300">
          <p className="flex-1 min-w-[200px]">Старый прогресс частично недостоверен: перенесены только проверяемые ответы и ID ошибок. Исходные данные сохранены в локальном резерве.</p>
          <button type="button" onClick={acknowledgeMigration} className="shrink-0 rounded-md border border-amber-500/50 px-3 py-1.5 font-semibold hover:bg-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">
            Понятно
          </button>
        </div>
      )}
      {progress.storageWarning && <p role="alert" className="text-xs text-rose-600">Хранилище недоступно: изменения доступны в этой вкладке и могут потеряться после перезагрузки.</p>}

      {/* Compact status strip */}
      <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/25 bg-white dark:bg-gradient-to-br dark:from-[#0c1c2e] dark:via-[#091524] dark:to-[#07111f] p-3.5 sm:p-4 shadow-lg dark:shadow-xl relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setShowBreakdown(!showBreakdown);
            }}
            className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group"
            title="Точность по учебным группам"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r={radius} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="7" fill="none" />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-cyan-500 dark:stroke-cyan-400 transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.55))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white leading-none">
                  {hasAccuracy ? `${progress.readinessPercent}%` : `${towardAccuracy}/10`}
                </span>
              </div>
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                  {statusTitle}
                </span>
                {showBreakdown ? (
                  <ChevronUp className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{statusSub}</p>
              {progress.weakSpot && hasAccuracy && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLevelDrill(progress.weakSpot?.level);
                  }}
                  className="text-[11px] text-rose-600 dark:text-rose-300 hover:underline"
                >
                  Слабее: {progress.weakSpot.topic}
                </button>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShowStreakModal(!showStreakModal);
            }}
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-cyan-950/70 border border-slate-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-[11px] font-mono font-bold"
            title="Непрерывная серия дней"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{progress.streakDays}</span>
          </button>
        </div>

        {showStreakModal && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span>Непрерывные занятия</span>
              <span className="text-amber-500">{progress.streakDays} дн.</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              День засчитывается после одного подтверждённого ответа. Повтор в тот же день не добавляет дней.
            </p>
          </div>
        )}

        {showBreakdown && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-500" />
                По группам
              </span>
              <button
                onClick={handleReset}
                type="button"
                className="text-[10px] text-slate-400 hover:text-rose-500 font-mono flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Сброс
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(progress.levels).map((lvl) => {
                const isWeak = lvl.level === progress.weakSpot?.level;
                const isStrong = lvl.level === progress.strongSpot?.level;
                return (
                  <div
                    key={lvl.level}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      isWeak
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/40'
                        : isStrong
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                          {lvl.level} {lvl.name.split(' ')[0]}
                        </span>
                        <span className="font-mono font-bold text-[11px] text-cyan-600 dark:text-cyan-400 shrink-0">
                          {lvl.total >= 10 ? `${lvl.masteryPercent}%` : 'Мало'} · {lvl.total}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isWeak ? 'bg-rose-500' : isStrong ? 'bg-emerald-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${lvl.total >= 10 ? lvl.masteryPercent : 0}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleLevelDrill(lvl.level)}
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold shrink-0"
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

      {/* Mistakes — only strong when there is work */}
      {mistakesCount > 0 ? (
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            onReviewMistakes();
          }}
          className="w-full p-3.5 rounded-2xl border border-rose-400/50 dark:border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-between gap-3 text-left"
        >
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Работа над ошибками</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">по 20 за сеанс</div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-300">{mistakesCount}</div>
        </button>
      ) : (
        <div className="px-1 text-[11px] text-slate-500 dark:text-slate-500">
          Ошибок на повтор пока нет
        </div>
      )}

      {/* Dominant CTA */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={() => {
            triggerHaptic('heavy');
            onStartExam();
          }}
          type="button"
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-400 text-slate-950 font-black text-base hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(34,211,238,0.4)] cursor-pointer tracking-wide"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{hasActiveSession ? 'Продолжить экзамен' : 'Начать экзамен'}</span>
        </button>

        {hasActiveSession && onStartNewExam && (
          <button
            type="button"
            onClick={onStartNewExam}
            className="w-full rounded-2xl border border-cyan-500/35 px-4 py-3 text-sm font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          >
            Начать новый экзамен
          </button>
        )}

        <p className="text-center text-[12px] text-slate-500 dark:text-slate-400">
          {helperLine}
        </p>
      </div>
    </div>
  );
};

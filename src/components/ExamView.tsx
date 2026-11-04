import React, { useState, useEffect, useRef } from 'react';
import {
  Question,
  QuizModeId,
} from '../types/quiz';
import {
  ALL_QUESTIONS,
  QUIZ_MODES,
  getRandomQuestions,
  resolveImageUrl,
} from '../data/questionsData';
import { playSuccessSound, playErrorSound, playClickSound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';
import { getInitialProgress, getMistakeQuestions, getProgressEpoch, subscribeProgress, retainProgressBackup } from '../utils/userProgress';
import { restoreSession, confirmAnswer, recordConfirmedAnswers, type ProgressSession } from '../utils/examProgress';
import { ExamReview } from './ExamReview';
import { getLessonForQuestion } from '../data/lessons';
import { LAST_REVIEW_KEY, serializeReview, restoreReview } from '../utils/examReview';
import { KnowledgeRadar } from './KnowledgeRadar';
import { LivingOsiStack } from './LivingOsiStack';
import { ZoomableImage } from './ZoomableImage';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  BookmarkCheck,
  Image as ImageIcon,
  BookOpen,
} from 'lucide-react';

interface ExamViewProps {
  soundEnabled: boolean;
  onNavigateToTheory?: (questionId: string) => void;
  onSelectLevel?: (level: string) => void;
}

export const ExamView: React.FC<ExamViewProps> = ({ soundEnabled, onNavigateToTheory }) => {
  const [session, setSession] = useState<ProgressSession | null>(null);
  const [selectedMode, setSelectedMode] = useState<QuizModeId>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [feedbackMode, setFeedbackMode] = useState<'instant' | 'exam'>('instant');
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const sessionRef = useRef<ProgressSession | null>(null);
  const [, refreshProgress] = useState(0);
  const [emptyMistakes, setEmptyMistakes] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [lastReview, setLastReview] = useState<ProgressSession | null>(null);
  const [reviewSession, setReviewSession] = useState<ProgressSession | null>(null);
  const [reviewWarning, setReviewWarning] = useState(false);
  const epochRef = useRef(getProgressEpoch());
  useEffect(() => subscribeProgress(() => {
    if (sessionRef.current && sessionRef.current.progressEpoch !== getProgressEpoch()) {
      sessionRef.current = null; setSession(null); setSelectedAnswers([]); setIsAnswerSubmitted(false);
    }
    const epoch = getProgressEpoch();
    if (epochRef.current !== epoch) {
      epochRef.current = epoch;
      setLastReview(null); setReviewSession(null);
      try { localStorage.removeItem(LAST_REVIEW_KEY); } catch { setReviewWarning(true); }
    }
    refreshProgress(value => value + 1);
  }), []);
  const saveSession = (next: ProgressSession) => {
    sessionRef.current = next;
    setSession(next);
    try { localStorage.setItem('osi_active_session', JSON.stringify(next)); setSessionWarning(false); }
    catch { setSessionWarning(true); }
    recordConfirmedAnswers(next);
    if (next.isCompleted) {
      setLastReview(next);
      try { localStorage.setItem(LAST_REVIEW_KEY, serializeReview(next)); setReviewWarning(false); }
      catch { setReviewWarning(true); }
    }
  };

  useEffect(() => {
    try {
      const last = localStorage.getItem(LAST_REVIEW_KEY);
      if (last) {
        const restored = restoreReview(last, getProgressEpoch());
        if (restored) setLastReview(restored);
        else setReviewWarning(true);
      }
      const saved = localStorage.getItem('osi_active_session');
      if (saved) {
        const completed = restoreReview(JSON.stringify({ version: 1, session: JSON.parse(saved) }), getProgressEpoch());
        if (completed) { setLastReview(completed); setReviewSession(completed); return; }
        const parsed = restoreSession(saved, ALL_QUESTIONS);
        if (!parsed) { retainProgressBackup('osi_active_session', saved); setSessionWarning(true); return; }
        if (parsed.progressEpoch !== getProgressEpoch()) return;
        if (!parsed.isCompleted && parsed.questions && parsed.questions.length > 0) {
          saveSession(parsed);
          setSelectedAnswers(parsed.userAnswers[parsed.questions[parsed.currentIndex]?.id] || []);
          setIsAnswerSubmitted(parsed.submittedQuestions[parsed.questions[parsed.currentIndex]?.id] || false);
        }
      }
    } catch {
      setReviewWarning(true);
    }
  }, []);

  const startNewQuiz = (customQuestions?: Question[]) => {
    setReviewSession(null);
    const questions = customQuestions || getRandomQuestions(selectedMode, questionCount);
    if (!questions.length) { setEmptyMistakes(true); return; }
    const newSession: ProgressSession = {
      attemptId: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      progressEpoch: getProgressEpoch(),
      questions,
      currentIndex: 0,
      userAnswers: {},
      submittedQuestions: {},
      startTime: Date.now(),
      isCompleted: false,
      mode: selectedMode,
      feedbackMode,
    };
    saveSession(newSession);
    setSelectedAnswers([]);
    setIsAnswerSubmitted(false);
    setEmptyMistakes(false);
  };

  const currentQuestion = session ? session.questions[session.currentIndex] : null;
  const isMultiSelect = currentQuestion ? currentQuestion.correct.length > 1 : false;

  const handleSelectAnswer = (index: number) => {
    if (isAnswerSubmitted) return;
    triggerHaptic('selection');
    if (soundEnabled) playClickSound();
    if (isMultiSelect) {
      setSelectedAnswers((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setSelectedAnswers([index]);
    }
  };

  const handleSubmitAnswer = () => {
    const current = sessionRef.current;
    if (!current) return;
    const updated = confirmAnswer(current, selectedAnswers);
    if (updated === current) return;
    const question = current.questions[current.currentIndex];
    const isCorrect = selectedAnswers.length === question.correct.length && selectedAnswers.every(a => question.correct.includes(a));
    triggerHaptic(isCorrect ? 'success' : 'error');
    if (soundEnabled) { if (isCorrect) playSuccessSound(); else playErrorSound(); }
    saveSession(updated);
    setIsAnswerSubmitted(true);
  };

  const handleNext = () => {
    if (!session || !currentQuestion || !session.submittedQuestions[currentQuestion.id]) return;
    const nextIndex = session.currentIndex + 1;
    if (nextIndex >= session.questions.length) {
      const completed: ProgressSession = { ...session, isCompleted: true };
      saveSession(completed);
      return;
    }
    const nextQ = session.questions[nextIndex];
    const updated: ProgressSession = { ...session, currentIndex: nextIndex };
    saveSession(updated);
    setSelectedAnswers(session.userAnswers[nextQ.id] || []);
    setIsAnswerSubmitted(session.submittedQuestions[nextQ.id] || false);

  };

  const handleExit = () => {
    sessionRef.current = null;
    setSession(null);
    setSelectedAnswers([]);
    setIsAnswerSubmitted(false);
    try {
      localStorage.removeItem('osi_active_session');
    } catch {
      // safe fallback
    }
  };

  const lastMistakes = getMistakeQuestions();
  const progressStatus = getInitialProgress();

  const availableReview = lastReview?.progressEpoch === getProgressEpoch() ? lastReview : null;
  if (reviewSession && reviewSession.progressEpoch === getProgressEpoch()) {
    return <ExamReview session={reviewSession} onExit={() => setReviewSession(null)} onRetry={session && !session.isCompleted ? undefined : () => startNewQuiz()} onNavigateToTheory={onNavigateToTheory} />;
  }

  if (!session || !currentQuestion) {
    return (
      <div className="space-y-5 max-w-3xl mx-auto pb-16 lg:pb-6">
        {sessionWarning && <p role="alert">Не удалось прочитать или сохранить сессию. Её продолжение может быть недоступно; скачайте экспорт.</p>}
        {reviewWarning && <p role="status">Последний разбор не удалось прочитать или сохранить. Он может быть недоступен после reload.</p>}
        {availableReview && <button type="button" onClick={() => setReviewSession(availableReview)} className="px-4 py-2 rounded-xl border border-cyan-500 text-sm">Посмотреть разбор последней попытки</button>}
        <KnowledgeRadar
          mistakesCount={lastMistakes.length}
          totalQuestionsCount={ALL_QUESTIONS.length}
          onStartExam={(levelFilter) => {
            if (levelFilter) {
              const matched = ALL_QUESTIONS.filter(q => q.group === levelFilter);
              startNewQuiz(matched.length > 0 ? matched.slice(0, 10) : undefined);
            } else {
              startNewQuiz();
            }
          }}
          onReviewMistakes={() => {
            const pool = getMistakeQuestions(20);
            if (!pool.length) { setEmptyMistakes(true); return; }
            startNewQuiz(pool);
          }}
          onOpenVisualL1={() => {
            setSelectedMode('visual-l1');
            const visualPool = ALL_QUESTIONS.filter((q) => q.group === 'visual-l1');
            startNewQuiz(visualPool.slice(0, questionCount));
          }}
        />
        {emptyMistakes && <p role="status" className="text-sm text-slate-500">Ошибок на повторение нет. Новые ошибки появятся здесь; для освоения нужны два верных ответа подряд.</p>}
        <LivingOsiStack />
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-500" />
            Параметры тестирования
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUIZ_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedMode(mode.id)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedMode === mode.id
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-cyan-400/50'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 dark:text-white">{mode.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{mode.subtitle}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">{mode.count} вопр.</div>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              Вопросов:
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
              >
                {[5, 10, 15, 20, 30].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              Режим:
              <select
                value={feedbackMode}
                onChange={(e) => setFeedbackMode(e.target.value as 'instant' | 'exam')}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
              >
                <option value="instant">Мгновенный разбор</option>
                <option value="exam">Как на экзамене</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => startNewQuiz()}
              className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              Начать экзамен
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (session.isCompleted) {
    return <div className="space-y-3">
      {reviewWarning && <p role="status">Разбор доступен сейчас, но его сохранение не удалось.</p>}
      <ExamReview session={session} onExit={handleExit} onRetry={() => startNewQuiz()} onNavigateToTheory={onNavigateToTheory} />
    </div>;
  }

  const progress = ((session.currentIndex + 1) / session.questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20">
      {(sessionWarning || progressStatus.storageWarning) && <p role="alert">Не удалось сохранить данные. Не закрывайте вкладку; экспорт прогресса доступен в меню экзамена.</p>}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <button type="button" onClick={handleExit} className="hover:text-cyan-500 cursor-pointer">
          Выйти в меню
        </button>
        {availableReview && <button type="button" onClick={() => setReviewSession(availableReview)} className="px-2 py-2 underline">Последний разбор</button>}
        <span className="font-mono">
          Вопрос {session.currentIndex + 1} из {session.questions.length}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
            {currentQuestion.topic}
          </span>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 font-mono">
            {isMultiSelect ? '✦ Выберите все подходящие ответы' : '✦ Выберите один правильный ответ'}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
          {currentQuestion.text}
        </h2>

        {currentQuestion.image && (
          <ZoomableImage
            src={resolveImageUrl(currentQuestion.image)}
            alt={currentQuestion.imageAlt || 'Фото оборудования к вопросу'}
            caption={currentQuestion.imageAlt}
          />
        )}

        <div className="space-y-2.5">
          {currentQuestion.answers.map((answerText, ansIdx) => {
            const isSelected = selectedAnswers.includes(ansIdx);
            const isCorrect = currentQuestion.correct.includes(ansIdx);
            let itemClass =
              'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-cyan-400 text-slate-800 dark:text-slate-200';
            if (isAnswerSubmitted && session.feedbackMode === 'instant') {
              if (isCorrect) {
                itemClass =
                  'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-medium shadow-md shadow-emerald-500/10';
              } else if (isSelected && !isCorrect) {
                itemClass = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200';
              }
            } else if (isSelected) {
              itemClass =
                'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-900 dark:text-cyan-100';
            }
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            return (
              <button
                key={ansIdx}
                type="button"
                onClick={() => handleSelectAnswer(ansIdx)}
                className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all text-sm cursor-pointer flex items-start gap-3 ${itemClass}`}
              >
                <span className="font-mono text-xs font-bold opacity-70 mt-0.5">{letters[ansIdx]}</span>
                <span className="flex-1">{answerText}</span>
                {isAnswerSubmitted && session.feedbackMode === 'instant' && isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
                {isAnswerSubmitted && session.feedbackMode === 'instant' && isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {isAnswerSubmitted && session.feedbackMode === 'instant' && currentQuestion.explanation && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-3.5 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
              <HelpCircle className="w-3.5 h-3.5" /> Разбор
            </div>
            {currentQuestion.explanation}
            {onNavigateToTheory && getLessonForQuestion(currentQuestion.id) && (
              <button
                type="button"
                onClick={() => onNavigateToTheory(currentQuestion.id)}
                className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" /> Открыть в теории
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          {!isAnswerSubmitted ? (
            <button
              type="button"
              disabled={selectedAnswers.length === 0}
              onClick={handleSubmitAnswer}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold disabled:opacity-40 cursor-pointer"
            >
              Ответить
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 text-sm font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>
                {session.currentIndex + 1 >= session.questions.length ? 'Завершить' : 'Следующий вопрос'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


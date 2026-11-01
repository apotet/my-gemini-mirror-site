import React, { useState, useEffect } from 'react';
import {
  Question,
  QuizModeId,
  QuizSession,
} from '../types/quiz';
import {
  ALL_QUESTIONS,
  QUIZ_MODES,
  getRandomQuestions,
  resolveImageUrl,
} from '../data/questionsData';
import { playSuccessSound, playErrorSound, playClickSound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';
import { recordQuestionResult } from '../utils/userProgress';
import { KnowledgeRadar } from './KnowledgeRadar';
import { LivingOsiStack } from './LivingOsiStack';
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
  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedMode, setSelectedMode] = useState<QuizModeId>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [feedbackMode, setFeedbackMode] = useState<'instant' | 'exam'>('instant');
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [mistakesOnlySession, setMistakesOnlySession] = useState<Question[] | null>(null);

  // Resume state if exists in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('osi_active_session');
      if (saved) {
        const parsed: QuizSession = JSON.parse(saved);
        if (!parsed.isCompleted && parsed.questions && parsed.questions.length > 0) {
          setSession(parsed);
          setSelectedAnswers(parsed.userAnswers[parsed.questions[parsed.currentIndex]?.id] || []);
          setIsAnswerSubmitted(parsed.submittedQuestions[parsed.questions[parsed.currentIndex]?.id] || false);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Sync mistakes to localStorage when session completes
  useEffect(() => {
    if (session?.isCompleted && session.questions) {
      const mistakeIds: string[] = [];
      session.questions.forEach((q) => {
        const userAns = session.userAnswers[q.id] || [];
        const isCorrect = userAns.length === q.correct.length && userAns.every((a) => q.correct.includes(a));
        if (!isCorrect) mistakeIds.push(q.id);
      });
      if (mistakeIds.length > 0) {
        try {
          localStorage.setItem('osi_last_mistakes', JSON.stringify(mistakeIds));
        } catch {
          // safe fallback
        }
      }
    }
  }, [session?.isCompleted]);

  const startNewQuiz = (customQuestions?: Question[]) => {
    const questions = customQuestions || getRandomQuestions(selectedMode, questionCount);
    const newSession: QuizSession = {
      questions,
      currentIndex: 0,
      userAnswers: {},
      submittedQuestions: {},
      startTime: Date.now(),
      isCompleted: false,
      mode: selectedMode,
      feedbackMode,
    };
    setSession(newSession);
    setSelectedAnswers([]);
    setIsAnswerSubmitted(false);
    setMistakesOnlySession(null);

    try {
      localStorage.setItem('osi_active_session', JSON.stringify(newSession));
    } catch {
      // safe fallback
    }
  };

  const currentQuestion = session ? session.questions[session.currentIndex] : null;
  const isMultiSelect = currentQuestion ? currentQuestion.correct.length > 1 : false;

  const handleSelectAnswer = (index: number) => {
    if (isAnswerSubmitted && session?.feedbackMode === 'instant') return;

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
    if (!session || !currentQuestion || selectedAnswers.length === 0) return;

    const isCorrect =
      selectedAnswers.length === currentQuestion.correct.length &&
      selectedAnswers.every((a) => currentQuestion.correct.includes(a));

    triggerHaptic(isCorrect ? 'success' : 'error');
    if (soundEnabled) {
      if (isCorrect) playSuccessSound();
      else playErrorSound();
    }

    // Immediately record result to dynamic user progress store
    recordQuestionResult(currentQuestion.id, currentQuestion.topic, currentQuestion.group, isCorrect);

    const updatedUserAnswers = {
      ...session.userAnswers,
      [currentQuestion.id]: selectedAnswers,
    };
    const updatedSubmitted = {
      ...session.submittedQuestions,
      [currentQuestion.id]: true,
    };

    setIsAnswerSubmitted(true);

    const updatedSession: QuizSession = {
      ...session,
      userAnswers: updatedUserAnswers,
      submittedQuestions: updatedSubmitted,
    };
    setSession(updatedSession);

    try {
      localStorage.setItem('osi_active_session', JSON.stringify(updatedSession));
    } catch {
      // safe fallback
    }

    // In exam mode, go immediately to next question
    if (session.feedbackMode === 'exam') {
      goToNextQuestion(updatedSession);
    }
  };

  const goToNextQuestion = (activeSession: QuizSession = session!) => {
    if (!activeSession) return;

    const nextIndex = activeSession.currentIndex + 1;
    if (nextIndex >= activeSession.questions.length) {
      // Quiz completed!
      const completedSession: QuizSession = {
        ...activeSession,
        isCompleted: true,
        endTime: Date.now(),
      };
      setSession(completedSession);
      try {
        localStorage.removeItem('osi_active_session');
      } catch {
        // safe fallback
      }
      return;
    }

    const nextQ = activeSession.questions[nextIndex];
    const nextAnswers = activeSession.userAnswers[nextQ.id] || [];
    const nextSubmitted = activeSession.submittedQuestions[nextQ.id] || false;

    setSession({
      ...activeSession,
      currentIndex: nextIndex,
    });
    setSelectedAnswers(nextAnswers);
    setIsAnswerSubmitted(nextSubmitted);
  };

  const exitQuiz = () => {
    setSession(null);
    setSelectedAnswers([]);
    setIsAnswerSubmitted(false);
    try {
      localStorage.removeItem('osi_active_session');
    } catch {
      // safe fallback
    }
  };

  const [lastMistakes, setLastMistakes] = useState<Question[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('osi_last_mistakes');
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        if (Array.isArray(ids)) {
          const matched = ALL_QUESTIONS.filter((q) => ids.includes(q.id));
          setLastMistakes(matched);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // If no active session, show Bento Dashboard + Living Stack
  if (!session || !currentQuestion) {
    return (
      <div className="space-y-5 max-w-3xl mx-auto pb-16 lg:pb-6 animate-fade-in">
        {/* Top Bento Card with Readiness Gauge & Quick Stats */}
        <KnowledgeRadar
          mistakesCount={lastMistakes.length}
          totalQuestionsCount={ALL_QUESTIONS.length}
          onStartExam={(levelFilter) => {
            if (levelFilter) {
              const matched = ALL_QUESTIONS.filter(
                (q) => q.topic.includes(levelFilter) || q.group.includes(levelFilter.toLowerCase())
              );
              startNewQuiz(matched.length > 0 ? matched.slice(0, 10) : undefined);
            } else {
              startNewQuiz();
            }
          }}
          onReviewMistakes={() => {
            const pool = lastMistakes.length > 0 ? lastMistakes : ALL_QUESTIONS.slice(0, 14);
            startNewQuiz(pool);
          }}
          onOpenVisualL1={() => {
            setSelectedMode('visual-l1');
            const visualPool = ALL_QUESTIONS.filter((q) => q.group === 'visual-l1').slice(0, 20);
            startNewQuiz(visualPool);
          }}
        />

        {/* Living OSI Stack (Путь пакета L7 -> L1) */}
        <LivingOsiStack
          onSelectLevel={(level) => {
            if (level === 'L1' || level === 'L2') setSelectedMode('l1-l2');
            else if (level === 'L3') setSelectedMode('l3');
            else if (level === 'L4') setSelectedMode('l4');
            else if (level === 'L5' || level === 'L6' || level === 'L7') setSelectedMode('l5-l7');
          }}
          onExploreTheory={(level) => {
            if (onNavigateToTheory) {
              const matchedQ = ALL_QUESTIONS.find((q) => q.topic.includes(level) || q.group.includes(level.toLowerCase()));
              onNavigateToTheory(matchedQ ? matchedQ.id : 'l3-01');
            }
          }}
          onStartExamForLevel={(level) => {
            let filterGroup = 'mixed';
            if (level === 'L1' || level === 'L2') filterGroup = 'l1-l2';
            else if (level === 'L3') filterGroup = 'l3';
            else if (level === 'L4') filterGroup = 'l4';
            else if (level === 'L5' || level === 'L6' || level === 'L7') filterGroup = 'l5-l7';
            setSelectedMode(filterGroup as QuizModeId);
            startNewQuiz(getRandomQuestions(filterGroup as QuizModeId, questionCount));
          }}
        />

        {/* Detailed Configuration Accordion / Panel */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#091524] border border-slate-200 dark:border-cyan-500/20 shadow-xl space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Параметры тестирования</span>
            </h2>
            <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
              {QUIZ_MODES.find((m) => m.id === selectedMode)?.count || 502} вопр. в пуле
            </span>
          </div>

          <div className="space-y-4">
            {/* Mode selection grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Выберите раздел знаний
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUIZ_MODES.map((mode) => {
                  const isSelected = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      type="button"
                      className={`p-4 rounded-2xl text-left border transition-all cursor-pointer min-h-[76px] flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{mode.title}</span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-black/40 text-cyan-700 dark:text-cyan-400">
                          {mode.count} вопр.
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{mode.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions count & Mode type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Количество вопросов
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setQuestionCount(cnt)}
                      type="button"
                      className={`py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer min-h-[44px] ${
                        questionCount === cnt
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Режим проверки
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFeedbackMode('instant')}
                    type="button"
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${
                      feedbackMode === 'instant'
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 dark:border-cyan-400 text-cyan-800 dark:text-cyan-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span>Тренажёр</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Объяснение сразу</span>
                  </button>

                  <button
                    onClick={() => setFeedbackMode('exam')}
                    type="button"
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${
                      feedbackMode === 'exam'
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 dark:border-cyan-400 text-cyan-800 dark:text-cyan-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span>Экзамен</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Результат в конце</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <button
                onClick={() => startNewQuiz()}
                type="button"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 font-black text-sm sm:text-base tracking-wide hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/25 cursor-pointer min-h-[52px]"
              >
                <span>Начать экзамен</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Completed: Results Screen
  if (session.isCompleted) {
    const totalQuestions = session.questions.length;
    let correctCount = 0;
    const mistakes: Question[] = [];

    session.questions.forEach((q) => {
      const userAns = session.userAnswers[q.id] || [];
      const isCorrect =
        userAns.length === q.correct.length && userAns.every((a) => q.correct.includes(a));
      if (isCorrect) {
        correctCount++;
      } else {
        mistakes.push(q);
      }
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = percentage >= 80;

    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        {/* Results Hero */}
        <div
          className={`p-8 rounded-3xl border shadow-2xl text-center space-y-4 ${
            isPassed
              ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500/40'
              : 'bg-gradient-to-b from-rose-950/60 to-slate-900 border-rose-500/40'
          }`}
        >
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-3xl shadow-xl ${
              isPassed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                : 'bg-rose-500/20 text-rose-300 border border-rose-400/50'
            }`}
          >
            {isPassed ? <Award className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
          </div>

          <div>
            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                isPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {isPassed ? 'Экзамен сдан (зачёт от 80%)' : 'Экзамен не сдан (порог 80%)'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              {correctCount} из {totalQuestions} правильных ответов
            </h2>
            <div className="text-4xl font-black font-mono text-cyan-300 mt-1">
              {percentage}%
            </div>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => startNewQuiz()}
              type="button"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 min-h-[48px] cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              Пройти заново
            </button>

            {mistakes.length > 0 && (
              <button
                onClick={() => startNewQuiz(mistakes)}
                type="button"
                className="py-3 px-6 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all flex items-center gap-2 min-h-[48px] cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4" />
                Повторить только ошибки ({mistakes.length})
              </button>
            )}

            <button
              onClick={exitQuiz}
              type="button"
              className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all min-h-[48px] cursor-pointer"
            >
              К выбору тем
            </button>
          </div>
        </div>

        {/* Mistakes Review section */}
        {mistakes.length > 0 && (
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Разбор ошибок ({mistakes.length})
            </h3>

            <div className="space-y-4">
              {mistakes.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-rose-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-mono">
                      {m.topic}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">#{m.id}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white">{m.text}</h4>

                  {/* Answers review */}
                  <div className="space-y-1.5 pt-1">
                    {m.answers.map((ans, ansIdx) => {
                      const isCorrect = m.correct.includes(ansIdx);
                      const isUserChoice = (session.userAnswers[m.id] || []).includes(ansIdx);

                      let borderClass = 'border-slate-800 text-slate-400';
                      if (isCorrect) borderClass = 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-semibold';
                      else if (isUserChoice) borderClass = 'border-rose-500/60 bg-rose-950/40 text-rose-300 line-through';

                      return (
                        <div
                          key={ansIdx}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${borderClass}`}
                        >
                          <span>{ans}</span>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase">
                              Правильно
                            </span>
                          )}
                          {isUserChoice && !isCorrect && (
                            <span className="text-[10px] font-bold text-rose-400 font-mono uppercase">
                              Ваш ответ
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="block text-cyan-300 mb-0.5">Пояснение:</strong>
                    {m.explanation}
                  </div>

                  {/* Link to Theory Deep Dive */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => onNavigateToTheory?.(m.id)}
                      type="button"
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-400/40 text-cyan-300 hover:text-white hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/20 transition-all text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>📖 Подробный разбор в Теории →</span>
                    </button>
                    <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                      Анализ темы «{m.topic}»
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Question Card View
  const progressPercent = Math.round(
    ((session.currentIndex + 1) / session.questions.length) * 100
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Quiz Top bar with generous touch targets & anti-pull-refresh protection */}
      <div className="pt-2 pb-1 flex items-center justify-between gap-2 text-xs font-mono">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            exitQuiz();
          }}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold min-h-[42px] cursor-pointer shadow-sm active:scale-95 touch-action-manipulation select-none transition-all"
          title="Вернуться к настройкам и статистике"
        >
          <span>← Выйти в меню</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-bold text-slate-800 dark:text-white px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
            Вопрос {session.currentIndex + 1} из {session.questions.length}
          </span>

          <span className="text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">{progressPercent}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-[#091524] border border-slate-200 dark:border-cyan-500/20 shadow-xl space-y-6 transition-colors">
        {/* Topic and Hints */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 font-bold text-xs font-mono">
            {currentQuestion.topic}
          </span>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 font-mono">
            {isMultiSelect ? '✦ Выберите все подходящие ответы' : '✦ Выберите один правильный ответ'}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* Visual photo if present */}
        {currentQuestion.image && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-black/60 p-2">
            <img
              src={resolveImageUrl(currentQuestion.image)}
              alt={currentQuestion.imageAlt || 'Фото оборудования к вопросу'}
              className="max-h-80 w-full object-contain rounded-xl mx-auto"
              loading="lazy"
              onError={(e) => {
                // hide on error
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {currentQuestion.imageAlt && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-1.5 font-mono">
                {currentQuestion.imageAlt}
              </p>
            )}
          </div>
        )}

        {/* Answer Options */}
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
                'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 dark:border-cyan-400 text-slate-950 dark:text-cyan-100 ring-1 ring-cyan-500 shadow-md shadow-cyan-500/10';
            }

            return (
              <button
                key={ansIdx}
                onClick={() => handleSelectAnswer(ansIdx)}
                type="button"
                className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center gap-3 cursor-pointer min-h-[56px] ${itemClass}`}
              >
                {/* Marker indicator */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-colors ${
                    isAnswerSubmitted && session.feedbackMode === 'instant'
                      ? isCorrect
                        ? 'bg-emerald-500 text-slate-950'
                        : isSelected
                        ? 'bg-rose-500 text-slate-950'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500'
                      : isSelected
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                  }`}
                >
                  {isAnswerSubmitted && session.feedbackMode === 'instant' ? (
                    isCorrect ? (
                      '✓'
                    ) : isSelected ? (
                      '✕'
                    ) : (
                      String.fromCharCode(65 + ansIdx)
                    )
                  ) : (
                    String.fromCharCode(65 + ansIdx)
                  )}
                </div>

                <span className="text-xs sm:text-sm leading-relaxed flex-1">{answerText}</span>
              </button>
            );
          })}
        </div>

        {/* Instant Feedback Panel */}
        {isAnswerSubmitted && session.feedbackMode === 'instant' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#091725] border border-slate-200 dark:border-cyan-500/30 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                Подробное объяснение
              </span>
              <button
                onClick={() => onNavigateToTheory?.(currentQuestion.id)}
                type="button"
                className="text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Разбор в Теории →</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentQuestion.explanation}
            </p>

            {currentQuestion.remember && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 text-xs text-amber-900 dark:text-amber-200">
                <strong className="block text-amber-800 dark:text-amber-300 font-bold mb-0.5">Важно запомнить:</strong>
                {currentQuestion.remember}
              </div>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
            Подсказка: клавиши A, B, C, D или клик мышью
          </div>

          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswers.length === 0}
              type="button"
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] disabled:opacity-40 transition-all min-h-[48px] cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Ответить
            </button>
          ) : (
            <button
              onClick={() => goToNextQuestion()}
              type="button"
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] transition-all min-h-[48px] cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <span>
                {session.currentIndex + 1 >= session.questions.length
                  ? 'Посмотреть результаты'
                  : 'Следующий вопрос'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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

    if (soundEnabled) {
      if (isCorrect) playSuccessSound();
      else playErrorSound();
    }

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

  // If no active session, show setup / start screen
  if (!session || !currentQuestion) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Intro Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Тренажёр нового поколения · 502 вопроса
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Интерактивный экзамен по OSI и TCP/IP
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Комплексная проверка знаний: от физических уровней, SFP-трансиверов и коммутации кадра
              до маршрутизации IP, флагов TCP и сетевого траблшутинга в CLI.
            </p>

            {/* Visual 7-layer stack preview */}
            <div className="pt-4 flex items-end gap-1.5 h-16 max-w-md">
              {['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'].map((layer, idx) => (
                <div
                  key={layer}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan-600/40 to-blue-500/60 border border-cyan-400/30 flex items-center justify-center font-mono font-bold text-xs text-white"
                  style={{ height: `${30 + idx * 5}px` }}
                >
                  {layer}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Настройка экзамена
          </h2>

          <div className="space-y-4">
            {/* Mode selection grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                          ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm text-white">{mode.title}</span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-cyan-400">
                          {mode.count} вопр.
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{mode.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions count & Mode type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                          : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Режим проверки
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFeedbackMode('instant')}
                    type="button"
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${
                      feedbackMode === 'instant'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>Тренажёр</span>
                    <span className="text-[10px] text-slate-400">Объяснение сразу</span>
                  </button>

                  <button
                    onClick={() => setFeedbackMode('exam')}
                    type="button"
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${
                      feedbackMode === 'exam'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>Экзамен</span>
                    <span className="text-[10px] text-slate-400">Результат в конце</span>
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
      {/* Quiz Top bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <button
          onClick={exitQuiz}
          type="button"
          className="hover:text-rose-400 transition-colors py-1 cursor-pointer"
        >
          ← Выйти в меню
        </button>

        <span className="font-bold text-white">
          Вопрос {session.currentIndex + 1} из {session.questions.length}
        </span>

        <span className="text-cyan-400 font-bold">{progressPercent}%</span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6">
        {/* Topic and Hints */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-bold text-xs font-mono">
            {currentQuestion.topic}
          </span>
          <span className="text-xs font-semibold text-amber-300 font-mono">
            {isMultiSelect ? '✦ Выберите все подходящие ответы' : '✦ Выберите один правильный ответ'}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* Visual photo if present */}
        {currentQuestion.image && (
          <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black/60 p-2">
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
              <p className="text-[11px] text-slate-400 text-center mt-1.5 font-mono">
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

            let itemClass = 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200';

            if (isAnswerSubmitted && session.feedbackMode === 'instant') {
              if (isCorrect) {
                itemClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium shadow-md shadow-emerald-500/10';
              } else if (isSelected && !isCorrect) {
                itemClass = 'bg-rose-950/60 border-rose-500 text-rose-200';
              }
            } else if (isSelected) {
              itemClass = 'bg-cyan-950/70 border-cyan-400 text-cyan-100 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10';
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
                        : 'bg-slate-800 text-slate-500'
                      : isSelected
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
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
          <div className="p-4 sm:p-5 rounded-2xl bg-[#091725] border border-cyan-500/30 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Подробное объяснение
              </span>
              <button
                onClick={() => onNavigateToTheory?.(currentQuestion.id)}
                type="button"
                className="text-xs font-bold text-cyan-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Разбор в Теории →</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentQuestion.explanation}
            </p>

            {currentQuestion.remember && (
              <div className="p-3 rounded-xl bg-amber-950/30 border-l-4 border-amber-400 text-xs text-amber-200">
                <strong className="block text-amber-300 font-bold mb-0.5">Важно запомнить:</strong>
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

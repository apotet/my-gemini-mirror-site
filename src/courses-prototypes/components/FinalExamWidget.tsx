import React from 'react';
import { ArrowRight, Award, CheckCircle2, RotateCcw, BookOpen, AlertCircle } from 'lucide-react';
import {
  EXAM_PRESET_FAILED,
  EXAM_PRESET_PASSED,
  FINAL_EXAM_QUESTIONS,
} from '../data/coursesData';
import type { ConceptId, ExamViewMode, ExternalResourceId, TopicResult } from '../types';

interface FinalExamWidgetProps {
  concept: ConceptId;
  isMobile: boolean;
  examMode: ExamViewMode;
  examAnswers: Record<string, number>;
  examSubmitted: boolean;
  onChangeExamMode: (mode: ExamViewMode) => void;
  onAnswerQuestion: (questionId: string, optionIndex: number) => void;
  onSubmitExam: () => void;
  onResetExam: () => void;
  onRepeatModule: (moduleId: string) => void;
  onOpenExternalResource: (resourceId: ExternalResourceId, fromModuleId: string) => void;
  onGoToNextCourse: () => void;
  onBackToCourse: () => void;
}

export const FinalExamWidget: React.FC<FinalExamWidgetProps> = ({
  concept,
  isMobile,
  examMode,
  examAnswers,
  examSubmitted,
  onChangeExamMode,
  onAnswerQuestion,
  onSubmitExam,
  onResetExam,
  onRepeatModule,
  onOpenExternalResource,
  onGoToNextCourse,
  onBackToCourse,
}) => {
  const answeredCount = Object.keys(examAnswers).length;
  const allAnswered = answeredCount === FINAL_EXAM_QUESTIONS.length;

  // Compute interactive scaled score (5 representative questions mapped cleanly to 20-question exam rubric)
  const computeInteractiveSummary = () => {
    const topicBuckets: Record<
      string,
      { label: string; moduleId: string; resourceId: ExternalResourceId; correct: number; total: number }
    > = {
      masks: {
        label: 'Маска и префикс',
        moduleId: 'mod-mask-prefix',
        resourceId: 'lesson-masks',
        correct: 0,
        total: 0,
      },
      private: {
        label: 'Частные и специальные IPv4',
        moduleId: 'mod-private-special',
        resourceId: 'lesson-private-ipv4',
        correct: 0,
        total: 0,
      },
      subnets: {
        label: 'Подсети и расчёт хостов',
        moduleId: 'mod-subnets-hosts',
        resourceId: 'trainer-ipv4',
        correct: 0,
        total: 0,
      },
      ipv6: {
        label: 'IPv6 и SLAAC',
        moduleId: 'mod-ipv6-slaac',
        resourceId: 'trainer-ipv6',
        correct: 0,
        total: 0,
      },
    };

    let rawCorrect = 0;
    for (const q of FINAL_EXAM_QUESTIONS) {
      const right = examAnswers[q.id] === q.correctIndex;
      if (right) rawCorrect += 1;
      topicBuckets[q.topicId].total += 1;
      if (right) topicBuckets[q.topicId].correct += 1;
    }

    const percent = Math.round((rawCorrect / FINAL_EXAM_QUESTIONS.length) * 100);
    const correct20 = Math.round((rawCorrect / FINAL_EXAM_QUESTIONS.length) * 20);
    const topics: TopicResult[] = Object.entries(topicBuckets).map(([topicId, b]) => {
      const scaledTotal = 5;
      const scaledCorrect = b.total > 0 ? Math.round((b.correct / b.total) * scaledTotal) : 0;
      return {
        topicId,
        topicLabel: b.label,
        moduleId: b.moduleId,
        correct: scaledCorrect,
        total: scaledTotal,
        resourceId: b.resourceId,
        advice:
          scaledCorrect >= 4
            ? 'Уверенный результат по теме — ошибок нет или они единичны.'
            : 'Есть пробелы в теме: вернитесь к модулю и закрепите на тренажёре.',
      };
    });

    return {
      percent,
      correct20,
      total20: 20,
      passed: percent >= 80,
      topics,
    };
  };

  const showingResults = examMode === 'passed' || examMode === 'failed' || examSubmitted;
  const result =
    examMode === 'passed'
      ? EXAM_PRESET_PASSED
      : examMode === 'failed'
        ? EXAM_PRESET_FAILED
        : computeInteractiveSummary();

  const surfaceClass =
    concept === 'textbook'
      ? 'bg-white dark:bg-[#1d1b18] border border-stone-200 dark:border-stone-800 rounded-lg'
      : concept === 'academy'
        ? 'bg-white dark:bg-[#111b2e] border border-slate-200 dark:border-slate-800 rounded-lg'
        : 'bg-white dark:bg-[#0e1a2b] border border-slate-200 dark:border-slate-800 rounded-xl';

  const headingFont =
    concept === 'textbook'
      ? 'font-serif-book'
      : concept === 'academy'
        ? 'font-display-academy'
        : '';

  const primaryBtn =
    concept === 'textbook'
      ? 'bg-[#1e40af] hover:bg-[#1d3a9c] text-white dark:bg-blue-400 dark:hover:bg-blue-300 dark:text-slate-950'
      : concept === 'academy'
        ? 'bg-blue-700 hover:bg-blue-600 text-white dark:bg-sky-400 dark:hover:bg-sky-300 dark:text-slate-950'
        : 'bg-sky-600 hover:bg-sky-500 text-white dark:bg-sky-400 dark:hover:bg-sky-300 dark:text-slate-950';

  return (
    <div className="space-y-6">
      {/* Mode switcher bar for instant prototype evaluation */}
      <div className={`${surfaceClass} p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3`}>
        <div className="text-xs text-slate-600 dark:text-slate-400">
          Итоговая аттестация · <span className="font-mono-tech font-medium text-slate-900 dark:text-slate-200">20 вопросов · порог 80% · без таймера · без лимита попыток</span>
        </div>
        <div
          className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800"
          role="tablist"
          aria-label="Сценарий итогового тестирования"
        >
          {(
            [
              { id: 'interactive', label: isMobile ? 'Мини-тест' : 'Интерактивный тест' },
              { id: 'passed', label: 'Сдан · 85%' },
              { id: 'failed', label: 'Не сдан · 65%' },
            ] as const
          ).map((tab) => {
            const active = examMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeExamMode(tab.id)}
                className={`min-h-[34px] px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {!showingResults ? (
        <div className="space-y-5">
          <div className={`${surfaceClass} p-5 sm:p-6`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-slate-200/80 dark:border-slate-800">
              <div>
                <h2 className={`text-xl font-bold text-slate-900 dark:text-slate-100 ${headingFont}`}>
                  Итоговый тест · «IP-адресация»
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Ответьте на 5 контрольных вопросов (демо-срез полного экзамена из 20 вопросов) — результат сразу рассчитается по порогу 80%.
                </p>
              </div>
              <div className="font-mono-tech text-sm font-semibold text-slate-700 dark:text-slate-300">
                {answeredCount} / {FINAL_EXAM_QUESTIONS.length}
              </div>
            </div>

            <div className="mt-5 space-y-6">
              {FINAL_EXAM_QUESTIONS.map((q, qIdx) => {
                const selected = examAnswers[q.id];
                return (
                  <div
                    key={q.id}
                    className="pb-6 border-b last:border-b-0 last:pb-0 border-slate-200/70 dark:border-slate-800/80 space-y-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono-tech font-semibold text-slate-800 dark:text-slate-200">
                        Вопрос {qIdx + 1} из {FINAL_EXAM_QUESTIONS.length}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{q.topicLabel}</span>
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {q.text}
                    </div>
                    {q.context && (
                      <div className="font-mono-tech text-xs text-slate-600 dark:text-slate-400">
                        {q.context}
                      </div>
                    )}
                    <div className="grid gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isPicked = selected === optIdx;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => onAnswerQuestion(q.id, optIdx)}
                            className={`w-full min-h-[44px] px-4 py-2.5 rounded-lg border text-left text-sm transition-colors flex items-center gap-3 ${
                              isPicked
                                ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-slate-900 dark:text-slate-100 font-medium'
                                : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-mono-tech ${
                                isPicked
                                  ? 'border-sky-600 bg-sky-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 text-slate-500'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackToCourse}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap"
              >
                Вернуться к материалам
              </button>
              <button
                type="button"
                disabled={!allAnswered}
                onClick={onSubmitExam}
                className={`min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity whitespace-nowrap ${primaryBtn} ${
                  !allAnswered ? 'opacity-45 cursor-not-allowed' : ''
                }`}
              >
                {allAnswered
                  ? 'Завершить и показать результат'
                  : `Ответьте ещё на ${FINAL_EXAM_QUESTIONS.length - answeredCount}`}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Completion / Result View */
        <div className="space-y-6">
          {/* Hero Result Card */}
          <div className={`${surfaceClass} p-6 sm:p-8`}>
            <div className={`grid gap-6 items-center ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
              <div className={isMobile ? '' : 'col-span-8 space-y-3'}>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  {result.passed ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <Award className="w-4 h-4" />
                      Курс «IP-адресация» пройден
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      До зачёта не хватило {Math.max(1, 16 - result.correct20)} верных ответов
                    </span>
                  )}
                  <span className="text-slate-400" aria-hidden="true">·</span>
                  <span className="text-slate-500 dark:text-slate-400 font-normal">
                    Порог зачёта: 80% (16 из 20)
                  </span>
                </div>

                <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight text-slate-900 dark:text-slate-100 ${headingFont}`}>
                  {result.passed
                    ? 'Уверенное владение IPv4-подсетями и IPv6 SLAAC'
                    : 'Хорошая основа — точечное повторение закроет пробелы за 20 минут'}
                </h2>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  {result.passed
                    ? 'Вы готовы проектировать адресные планы без пересечений и читать таблицы маршрутизации. Следующий логичный шаг в маршруте NetOps — курс «Маршрутизация».'
                    : 'Количество попыток не ограничено и таймера нет. Ниже отмечены конкретные темы, где возникли ошибки — перейдите прямо в нужный раздел или тренажёр, а затем повторите тест.'}
                </p>
              </div>

              {/* Crisp numeric score gauge */}
              <div className={`${isMobile ? '' : 'col-span-4'} flex flex-col items-start sm:items-end justify-center`}>
                <div className="w-full max-w-[220px] p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-baseline justify-between">
                    <span
                      className={`font-mono-tech text-4xl font-bold ${
                        result.passed
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {result.percent}%
                    </span>
                    <span className="font-mono-tech text-xs text-slate-500 dark:text-slate-400">
                      {result.correct20} / {result.total20}
                    </span>
                  </div>

                  {/* Bar with explicit 80% threshold notch */}
                  <div className="mt-3 relative h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-visible">
                    <div
                      className={`h-full rounded-full transition-all ${
                        result.passed ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'
                      }`}
                      style={{ width: `${result.percent}%` }}
                    />
                    <div
                      className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-slate-900 dark:bg-white"
                      style={{ left: '80%' }}
                      title="Проходной порог 80%"
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono-tech text-slate-500 dark:text-slate-400">
                    <span>0%</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Порог 80%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Topic Breakdown & Targeted Repeat Recommendations */}
          <div className={`${surfaceClass} p-5 sm:p-6 space-y-4`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <h3 className={`text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 ${headingFont}`}>
                Разбор по темам и рекомендации к повторению
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                4 ключевых блока курса
              </span>
            </div>

            <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
              {result.topics.map((topic) => {
                const topicPct = Math.round((topic.correct / topic.total) * 100);
                const needsWork = topicPct < 80;
                return (
                  <div
                    key={topic.topicId}
                    className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {topic.topicLabel}
                        </span>
                        <span className="text-slate-400" aria-hidden="true">·</span>
                        <span
                          className={`font-mono-tech text-xs font-semibold ${
                            needsWork
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {topic.correct}/{topic.total} ({topicPct}%)
                        </span>
                        <span className="text-slate-400" aria-hidden="true">·</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {needsWork ? 'Рекомендуется повторить' : 'Освоено'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {topic.advice}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onRepeatModule(topic.moduleId)}
                        className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        К шагу курса
                      </button>
                      {needsWork && (
                        <button
                          type="button"
                          onClick={() => onOpenExternalResource(topic.resourceId, topic.moduleId)}
                          className="min-h-[40px] px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Открыть тренажёр
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive answers review when user actually took the mini-test */}
          {examMode === 'interactive' && examSubmitted && (
            <div className={`${surfaceClass} p-5 sm:p-6 space-y-3`}>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Разбор ваших ответов в мини-тесте
              </div>
              <div className="space-y-3">
                {FINAL_EXAM_QUESTIONS.map((q, idx) => {
                  const picked = examAnswers[q.id];
                  const right = picked === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {idx + 1}. {q.topicLabel}
                        </span>
                        <span
                          className={`font-semibold ${
                            right
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {right ? 'Верно' : 'Ошибка'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Footer: Retry or Advance to Next Course */}
          <div className={`${surfaceClass} p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {result.passed ? 'Следующий курс по программе' : 'Следующий шаг'}
              </div>
              <div className={`text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 ${headingFont}`}>
                {result.passed
                  ? '06. Маршрутизация · LPM, OSPF, BGP и VRRP'
                  : 'Повторите слабые темы и сдайте снова в удобном темпе'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onResetExam}
                className="min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                Пройти ещё раз
              </button>
              <button
                type="button"
                onClick={result.passed ? onGoToNextCourse : () => onRepeatModule('mod-subnets-hosts')}
                className={`min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap ${primaryBtn}`}
              >
                {result.passed ? (
                  <>
                    <span>Перейти к «Маршрутизации»</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Повторить «Подсети и хосты»</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

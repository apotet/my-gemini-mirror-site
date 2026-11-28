import React, { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Cpu, ExternalLink } from 'lucide-react';
import { EXTERNAL_RESOURCES, IP_ADDRESSING_MODULES } from '../data/coursesData';
import type { ConceptId, ExternalResourceId } from '../types';

interface ExternalResourceBridgeProps {
  resourceId: ExternalResourceId;
  fromModuleId: string;
  concept: ConceptId;
  isMobile: boolean;
  isResourceDone: boolean;
  onReturnToCourse: (markDone?: boolean) => void;
}

export const ExternalResourceBridge: React.FC<ExternalResourceBridgeProps> = ({
  resourceId,
  fromModuleId,
  concept,
  isMobile,
  isResourceDone,
  onReturnToCourse,
}) => {
  const resource = EXTERNAL_RESOURCES[resourceId];
  const originModule = IP_ADDRESSING_MODULES.find((m) => m.id === fromModuleId) ?? IP_ADDRESSING_MODULES[0];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const isCorrect =
    resource.quickCheck !== undefined && selectedOption === resource.quickCheck.correctIndex;

  const pageBg =
    concept === 'textbook'
      ? 'bg-[#faf8f4] dark:bg-[#141311]'
      : concept === 'academy'
        ? 'bg-[#f3f5f8] dark:bg-[#0b1220]'
        : 'bg-[#f7f9fc] dark:bg-[#08101c]';

  const cardBg =
    concept === 'textbook'
      ? 'bg-white dark:bg-[#1d1b18] border-stone-200 dark:border-stone-800'
      : 'bg-white dark:bg-[#0f1a2b] border-slate-200 dark:border-slate-800';

  return (
    <div className={`${pageBg} min-h-full flex flex-col`}>
      {/* Persistent Return Context Bar — shows learner they stepped into a standalone NetOps resource */}
      <div className="sticky top-0 z-20 bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onReturnToCourse(isCorrect || isResourceDone)}
            className="min-h-[40px] inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white hover:text-sky-300 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>
              {isMobile
                ? `В курс · Шаг ${originModule.index}`
                : `Вернуться в курс «IP-адресация» · Шаг ${originModule.index}: ${originModule.shortTitle}`}
            </span>
          </button>

          <div className="flex items-center gap-3 shrink-0">
            {!isMobile && (
              <span className="text-xs text-slate-400 whitespace-nowrap">
                Самостоятельный ресурс NetOps
              </span>
            )}
            <button
              type="button"
              onClick={() => onReturnToCourse(true)}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              {isResourceDone ? 'Изучено · Вернуться' : 'Зачесть и вернуться'}
            </button>
          </div>
        </div>
      </div>

      {/* Standalone Resource Surface */}
      <div className={`max-w-4xl w-full mx-auto ${isMobile ? 'px-4 py-5' : 'px-6 py-8'} space-y-6 flex-1`}>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-medium text-sky-700 dark:text-sky-400">
              {resource.kind === 'trainer' ? <Cpu className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
              {resource.sectionName}
            </span>
            <span aria-hidden="true">·</span>
            <span>Открыт по ссылке из курса без дублирования</span>
          </div>
          <h1
            className={`${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'} font-bold tracking-tight text-slate-900 dark:text-slate-100 ${
              concept === 'textbook' ? 'font-serif-book' : ''
            }`}
          >
            {resource.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{resource.subtitle}</p>
        </div>

        <div className={`${cardBg} border rounded-xl p-5 space-y-4`}>
          <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {resource.summary}
          </p>

          {resource.sampleCommands && resource.sampleCommands.length > 0 && (
            <div className="p-3.5 rounded-lg bg-slate-950 text-slate-100 font-mono-tech text-xs space-y-1">
              {resource.sampleCommands.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ключевые точки материала
            </div>
            <ul className="space-y-2">
              {resource.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interactive quick-check inside the standalone resource */}
        {resource.quickCheck && (
          <div className={`${cardBg} border rounded-xl p-5 space-y-4`}>
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {resource.interactivePrompt}
              </div>
              <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {resource.quickCheck.prompt}
              </div>
            </div>

            <div className="space-y-2">
              {resource.quickCheck.options.map((opt, idx) => {
                const picked = selectedOption === idx;
                const right = idx === resource.quickCheck!.correctIndex;
                let btnStyle =
                  'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-sky-500';
                if (selectedOption !== null) {
                  if (right) {
                    btnStyle =
                      'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200';
                  } else if (picked) {
                    btnStyle =
                      'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200';
                  }
                }
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full min-h-[46px] px-4 py-3 rounded-lg border text-left text-sm font-medium transition-colors flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedOption !== null && right && (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                        Верно
                      </span>
                    )}
                    {selectedOption !== null && picked && !right && (
                      <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 whitespace-nowrap">
                        Ошибка
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <div className="p-3.5 rounded-lg bg-slate-100 dark:bg-slate-900/90 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Пояснение: </span>
                {resource.quickCheck.explanation}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-6">
          <div className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ваша позиция в курсе сохранена: Шаг {originModule.index} из 6</span>
          </div>
          <button
            type="button"
            onClick={() => onReturnToCourse(true)}
            className="min-h-[44px] px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Вернуться к курсу «IP-адресация»
          </button>
        </div>
      </div>
    </div>
  );
};

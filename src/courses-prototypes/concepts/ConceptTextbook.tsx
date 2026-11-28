import React, { useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ExternalLink,
} from 'lucide-react';
import textbookPlateImg from '../../assets/images/courses_textbook_monograph_plate_1795857307682.jpg';
import {
  COURSE_STAGES,
  COURSES_CATALOG,
  IP_ADDRESSING_MODULES,
  getCourseProgress,
  getRecommendedCourseId,
} from '../data/coursesData';
import { SubnetBitVisualizer } from '../components/SubnetBitVisualizer';
import { FinalExamWidget } from '../components/FinalExamWidget';
import type { ConceptSharedProps } from '../types';

const ROMAN_PARTS = ['I', 'II', 'III', 'IV'];

export const ConceptTextbook: React.FC<ConceptSharedProps> = ({
  screen,
  isMobile,
  profile,
  completedModuleIds,
  activeModuleId,
  selectedCoursePreviewId,
  examMode,
  examAnswers,
  examSubmitted,
  completedResourceIds,
  onNavigateScreen,
  onOpenCourse,
  onSelectCoursePreview,
  onStartOrResumeModule,
  onSelectModule,
  onToggleModuleComplete,
  onOpenExternalResource,
  onChangeExamMode,
  onAnswerExamQuestion,
  onSubmitExam,
  onResetExam,
}) => {
  const [plateFailed, setPlateFailed] = useState(false);
  const [mobileNotesOpen, setMobileNotesOpen] = useState(false);

  const ipExamPassed =
    examMode === 'passed' ||
    (examMode === 'interactive' &&
      examSubmitted &&
      Object.entries(examAnswers).filter(([id, idx]) => {
        const map: Record<string, number> = { q1: 0, q2: 1, q3: 1, q4: 0, q5: 1 };
        return map[id] === idx;
      }).length >= 4);

  const ipCourse = COURSES_CATALOG.find((c) => c.id === 'ip-addressing')!;
  const ipProgress = getCourseProgress(ipCourse, profile, completedModuleIds.length, ipExamPassed);
  const recommendedId = getRecommendedCourseId(profile, ipExamPassed);

  const activeModule =
    IP_ADDRESSING_MODULES.find((m) => m.id === activeModuleId) ?? IP_ADDRESSING_MODULES[0];
  const activeIdx = IP_ADDRESSING_MODULES.findIndex((m) => m.id === activeModule.id);
  const nextIncompleteModule =
    IP_ADDRESSING_MODULES.find((m) => !completedModuleIds.includes(m.id)) ?? IP_ADDRESSING_MODULES[0];

  const completedCoursesCount = COURSES_CATALOG.filter(
    (c) => getCourseProgress(c, profile, completedModuleIds.length, ipExamPassed) === 100
  ).length;

  /* -------------------------------------------------------------------------- */
  /* SCREEN 1: SEQUENTIAL CURRICULUM TABLE OF CONTENTS                          */
  /* -------------------------------------------------------------------------- */
  const renderCatalog = () => (
    <div className={`max-w-4xl mx-auto ${isMobile ? 'px-4 py-6 space-y-7' : 'px-8 py-12 space-y-10'}`}>
      {/* Editorial Masthead */}
      <header className="space-y-4 pb-8 border-b border-stone-300/80 dark:border-stone-800">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
          <span>NetOps · Последовательный курс сетевого инженера</span>
          <span className="font-mono-tech">
            Прочитано глав: {completedCoursesCount} из 12
          </span>
        </div>

        <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl sm:text-5xl'} font-serif-book font-semibold tracking-tight text-stone-900 dark:text-stone-100 leading-[1.12]`}>
          Учебник по компьютерным сетям
        </h1>

        <p className="text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl">
          Двенадцать последовательных глав без визуального шума. Читайте по порядку, проверяйте себя на интерактивных схемах и переходите к самостоятельным тренажёрам в нужный момент.
        </p>

        {/* Bookmark Strip: Resume unfinished reading or start Chapter 1 */}
        <div className="pt-2">
          <div className="bg-[#f2efe9] dark:bg-[#1d1b18] border border-stone-300/70 dark:border-stone-800 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Bookmark className="w-4 h-4 text-[#1e40af] dark:text-blue-400 shrink-0 mt-1" />
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  {profile === 'active' ? 'Текущая закладка' : 'Рекомендуемое начало'}
                </div>
                <div className="text-sm sm:text-base font-serif-book font-semibold text-stone-900 dark:text-stone-100">
                  {profile === 'active'
                    ? `Глава 05. IP-адресация — § 5.${nextIncompleteModule.index} «${nextIncompleteModule.title}»`
                    : 'Глава 01. Основы компьютерных сетей (и эталонная глава 05 «IP-адресация»)'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                profile === 'active'
                  ? onStartOrResumeModule(nextIncompleteModule.id)
                  : onOpenCourse('ip-addressing')
              }
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#1e40af] hover:bg-[#1a3696] dark:bg-blue-400 dark:hover:bg-blue-300 text-white dark:text-stone-950 text-sm font-medium transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>{profile === 'active' ? 'Вернуться к закладке' : 'Открыть главу 05'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Numbered Book Table of Contents by Parts */}
      <div className="space-y-9">
        {COURSE_STAGES.map((stage, sIdx) => {
          const stageCourses = COURSES_CATALOG.filter((c) => c.stage === stage.id);
          return (
            <section key={stage.id} className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2 border-b border-stone-300/80 dark:border-stone-800">
                <h2 className="font-serif-book text-lg font-semibold text-stone-900 dark:text-stone-100">
                  Часть {ROMAN_PARTS[sIdx]}. {stage.title}
                </h2>
                <span className="text-xs text-stone-500 dark:text-stone-400">{stage.subtitle}</span>
              </div>

              <div className="divide-y divide-stone-200/90 dark:divide-stone-800/80">
                {stageCourses.map((course) => {
                  const pct = getCourseProgress(
                    course,
                    profile,
                    completedModuleIds.length,
                    ipExamPassed
                  );
                  const isFeatured = course.id === 'ip-addressing';
                  const isRecommended = course.id === recommendedId;
                  const expanded = selectedCoursePreviewId === course.id;

                  return (
                    <div key={course.id}>
                      <button
                        type="button"
                        onClick={() =>
                          isFeatured
                            ? onOpenCourse(course.id)
                            : onSelectCoursePreview(expanded ? null : course.id)
                        }
                        className="w-full py-4 text-left group flex items-start justify-between gap-4 hover:bg-stone-200/35 dark:hover:bg-stone-800/35 px-2 -mx-2 rounded-md transition-colors"
                      >
                        <div className="flex items-baseline gap-4 min-w-0 flex-1">
                          <span className="font-mono-tech text-xs text-stone-400 dark:text-stone-500 w-6 shrink-0">
                            {String(course.order).padStart(2, '0')}
                          </span>
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <span
                                className={`font-serif-book text-base sm:text-lg font-medium transition-colors ${
                                  isFeatured
                                    ? 'text-[#1e40af] dark:text-blue-400'
                                    : 'text-stone-900 dark:text-stone-100 group-hover:text-[#1e40af] dark:group-hover:text-blue-400'
                                }`}
                              >
                                {course.title}
                              </span>
                              {isRecommended && (
                                <span className="text-xs font-medium text-[#1e40af] dark:text-blue-400">
                                  — далее по плану
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                              {course.summary}
                            </p>
                            <div className="text-xs text-stone-500 dark:text-stone-500 flex flex-wrap items-center gap-2 pt-0.5">
                              <span>{course.difficulty}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{course.modulesCount} разделов</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{course.durationLabel}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                          <span
                            className={`font-mono-tech text-xs ${
                              pct === 100
                                ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                                : pct > 0
                                  ? 'text-[#1e40af] dark:text-blue-400 font-semibold'
                                  : 'text-stone-400 dark:text-stone-500'
                            }`}
                          >
                            {pct === 100 ? 'Прочитано' : pct > 0 ? `${pct}%` : '—'}
                          </span>
                          <div className="w-16 h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                pct === 100
                                  ? 'bg-emerald-700 dark:bg-emerald-400'
                                  : 'bg-[#1e40af] dark:bg-blue-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </button>

                      {expanded && !isFeatured && (
                        <div className="pl-10 pr-2 pb-5 pt-1 space-y-2.5 text-sm text-stone-700 dark:text-stone-300">
                          <div className="text-xs text-stone-500 dark:text-stone-400">
                            Краткое содержание главы:
                          </div>
                          <ul className="space-y-1 list-disc pl-4 text-sm text-stone-600 dark:text-stone-300">
                            {course.outcomes.map((o) => (
                              <li key={o}>{o}</li>
                            ))}
                          </ul>
                          <button
                            type="button"
                            onClick={() => onOpenCourse('ip-addressing')}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e40af] dark:text-blue-400 hover:underline min-h-[36px]"
                          >
                            <span>Перейти к полностью интерактивной главе 05 «IP-адресация»</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );

  /* -------------------------------------------------------------------------- */
  /* SCREEN 2: MONOGRAPH CHAPTER TITLE SPREAD («IP-адресация»)                  */
  /* -------------------------------------------------------------------------- */
  const renderCoursePage = () => (
    <div className={`max-w-4xl mx-auto ${isMobile ? 'px-4 py-6 space-y-7' : 'px-8 py-11 space-y-10'}`}>
      <button
        type="button"
        onClick={() => onNavigateScreen('catalog')}
        className="min-h-[40px] inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Оглавление учебника</span>
      </button>

      {/* Title Spread */}
      <div className={`grid gap-8 pb-8 border-b border-stone-300/80 dark:border-stone-800 ${isMobile ? 'grid-cols-1' : 'grid-cols-12 items-center'}`}>
        <div className={`${isMobile ? '' : 'col-span-7'} space-y-4`}>
          <div className="text-xs text-stone-500 dark:text-stone-400 flex flex-wrap items-center gap-2">
            <span className="font-mono-tech text-[#1e40af] dark:text-blue-400 font-semibold">
              Глава 05
            </span>
            <span aria-hidden="true">·</span>
            <span>Углублённый</span>
            <span aria-hidden="true">·</span>
            <span>6 разделов · ~2,5 часа</span>
          </div>

          <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl sm:text-5xl'} font-serif-book font-semibold tracking-tight text-stone-900 dark:text-stone-100 leading-tight`}>
            IP-адресация
          </h1>

          <p className="text-base text-stone-600 dark:text-stone-300 leading-relaxed">
            Как устроена логическая адресация в IPv4 и IPv6, почему одна ошибка в маске разрывает связь в локальном сегменте и как быстро делить подсети без таблицы-подсказки.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onStartOrResumeModule(nextIncompleteModule.id)}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#1e40af] hover:bg-[#1a3696] dark:bg-blue-400 dark:hover:bg-blue-300 text-white dark:text-stone-950 text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span>
                {completedModuleIds.length > 0
                  ? `Продолжить с § 5.${nextIncompleteModule.index}`
                  : 'Начать чтение с § 5.1'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="font-mono-tech text-xs text-stone-500 dark:text-stone-400">
              Освоено {ipProgress}% ({completedModuleIds.length} из 6)
            </span>
          </div>
        </div>

        <figure className={`${isMobile ? '' : 'col-span-5'} space-y-2`}>
          <div className="rounded-lg overflow-hidden border border-stone-300/80 dark:border-stone-800 bg-[#f2efe9] dark:bg-[#1d1b18] aspect-[4/3]">
            {!plateFailed ? (
              <img
                src={textbookPlateImg}
                alt="Гравюра иерархического деления адресного пространства"
                referrerPolicy="no-referrer"
                onError={() => setPlateFailed(true)}
                className="w-full h-full object-cover dark:opacity-85"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                <BookOpen className="w-8 h-8" />
              </div>
            )}
          </div>
          <figcaption className="text-xs font-serif-book italic text-stone-500 dark:text-stone-400">
            Рис. 5.1 — Вложенная геометрия префиксов и маршрутов.
          </figcaption>
        </figure>
      </div>

      {/* Outcomes */}
      <section className="space-y-3">
        <h2 className="font-serif-book text-xl font-semibold text-stone-900 dark:text-stone-100">
          Что вы сможете делать после этой главы
        </h2>
        <ol className="space-y-2.5">
          {ipCourse.outcomes.map((out, idx) => (
            <li key={out} className="flex items-baseline gap-3 text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed">
              <span className="font-mono-tech text-xs text-stone-400 dark:text-stone-500 shrink-0">
                0{idx + 1}.
              </span>
              <span>{out}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Sections List (§ 5.1 – § 5.6) */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-2 pb-2 border-b border-stone-300/80 dark:border-stone-800">
          <h2 className="font-serif-book text-xl font-semibold text-stone-900 dark:text-stone-100">
            Разделы главы
          </h2>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Последовательное освоение
          </span>
        </div>

        <div className="divide-y divide-stone-200 dark:divide-stone-800/90">
          {IP_ADDRESSING_MODULES.map((mod) => {
            const done = completedModuleIds.includes(mod.id);
            const isNext = mod.id === nextIncompleteModule.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() =>
                  mod.kind === 'exam' ? onNavigateScreen('exam') : onStartOrResumeModule(mod.id)
                }
                className="w-full py-4 text-left flex items-start justify-between gap-4 hover:bg-stone-200/35 dark:hover:bg-stone-800/35 px-2 -mx-2 rounded-md transition-colors"
              >
                <div className="flex items-baseline gap-4 min-w-0">
                  <span className="font-mono-tech text-xs text-stone-500 dark:text-stone-400 shrink-0">
                    § 5.{mod.index}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-serif-book text-base sm:text-lg font-medium text-stone-900 dark:text-stone-100">
                        {mod.title}
                      </span>
                      {isNext && !done && (
                        <span className="text-xs font-medium text-[#1e40af] dark:text-blue-400">
                          — закладка
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      {mod.lead}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-1">
                  <span className="font-mono-tech text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">
                    {done ? 'Прочитано' : mod.durationLabel}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );

  /* -------------------------------------------------------------------------- */
  /* SCREEN 3: TUFTE-STYLE READING ROOM WITH MARGIN NOTES                       */
  /* -------------------------------------------------------------------------- */
  const renderPlayer = () => {
    const isDone = completedModuleIds.includes(activeModule.id);
    const prevMod = activeIdx > 0 ? IP_ADDRESSING_MODULES[activeIdx - 1] : null;
    const nextMod =
      activeIdx < IP_ADDRESSING_MODULES.length - 1 ? IP_ADDRESSING_MODULES[activeIdx + 1] : null;

    return (
      <div className="min-h-full flex flex-col">
        {/* Hairline reading progress bar */}
        <div className="h-0.5 bg-stone-200 dark:bg-stone-800 w-full">
          <div
            className="h-full bg-[#1e40af] dark:bg-blue-400 transition-all"
            style={{ width: `${Math.round(((activeIdx + 1) / IP_ADDRESSING_MODULES.length) * 100)}%` }}
          />
        </div>

        {/* Minimal chapter header */}
        <div className="border-b border-stone-200/90 dark:border-stone-800 px-4 sm:px-8 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onNavigateScreen('course')}
              className="min-h-[38px] inline-flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Глава 05 · IP-адресация</span>
            </button>
            <div className="font-mono-tech text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">
              § 5.{activeModule.index} из 6 · {ipProgress}%
            </div>
          </div>
        </div>

        {/* 70/30 Tufte Reading Layout */}
        <div
          className={`max-w-5xl w-full mx-auto flex-1 ${
            isMobile ? 'px-4 py-6 pb-24 space-y-6' : 'px-8 py-10 grid grid-cols-12 gap-10 items-start'
          }`}
        >
          {/* Main Prose Column (optimal 65-72ch reading measure) */}
          <article className={`${isMobile ? '' : 'col-span-8'} max-w-[68ch] space-y-6`}>
            <header className="space-y-2.5">
              <div className="font-mono-tech text-xs text-[#1e40af] dark:text-blue-400 font-semibold">
                § 5.{activeModule.index} · {activeModule.durationLabel}
              </div>
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl'} font-serif-book font-semibold tracking-tight text-stone-900 dark:text-stone-100 leading-tight`}>
                {activeModule.title}
              </h1>
              <p className="text-base text-stone-600 dark:text-stone-400 leading-relaxed">
                {activeModule.lead}
              </p>
            </header>

            {/* Editorial key thesis framed by delicate top/bottom hairlines (no left accent bar) */}
            <blockquote className="py-5 border-y border-stone-300/80 dark:border-stone-800 font-serif-book text-lg sm:text-xl italic text-stone-800 dark:text-stone-200 leading-relaxed">
              {activeModule.keyIdea}
            </blockquote>

            <div className="space-y-4">
              {activeModule.paragraphs.map((p) => (
                <p
                  key={p}
                  className="text-base text-stone-800 dark:text-stone-200 leading-[1.75]"
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Interactive Figure */}
            {activeModule.visualizerMode && (
              <figure className="space-y-2 pt-1">
                <SubnetBitVisualizer
                  mode={activeModule.visualizerMode}
                  concept="textbook"
                  isMobile={isMobile}
                />
                <figcaption className="text-xs font-serif-book italic text-stone-500 dark:text-stone-400">
                  Интерактивная схема 5.{activeModule.index} — проверьте зависимость границы сети и числа хостов вручную.
                </figcaption>
              </figure>
            )}

            {/* Practical Rule */}
            <div className="py-4 border-y border-stone-300/80 dark:border-stone-800 space-y-1.5">
              <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                Запомните на практике
              </div>
              <p className="text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed">
                {activeModule.practicalRule}
              </p>
            </div>

            {/* Mobile collapsible margin notes */}
            {isMobile && activeModule.marginNotes.length > 0 && (
              <div className="border border-stone-300/80 dark:border-stone-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileNotesOpen((v) => !v)}
                  className="w-full min-h-[44px] px-4 py-2.5 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between"
                >
                  <span>Заметки на полях ({activeModule.marginNotes.length})</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${mobileNotesOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {mobileNotesOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-stone-200 dark:border-stone-800 pt-3">
                    {activeModule.marginNotes.map((note) => (
                      <div key={note.label} className="space-y-0.5">
                        <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                          {note.label}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                          {note.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* External standalone resources */}
            {activeModule.resources.length > 0 && (
              <section className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  Переход к самостоятельным ресурсам NetOps (закладка § 5.{activeModule.index} сохранится)
                </div>
                <div className="divide-y divide-stone-200 dark:divide-stone-800 border-y border-stone-200 dark:border-stone-800">
                  {activeModule.resources.map((res) => {
                    const visited = completedResourceIds.includes(res.resourceId);
                    return (
                      <button
                        key={res.resourceId}
                        type="button"
                        onClick={() => onOpenExternalResource(res.resourceId, activeModule.id)}
                        className="w-full py-3.5 text-left flex items-center justify-between gap-4 hover:bg-stone-200/35 dark:hover:bg-stone-800/35 px-2 -mx-2 rounded-md transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {res.kind === 'trainer' ? (
                            <Cpu className="w-4 h-4 text-[#1e40af] dark:text-blue-400 shrink-0 mt-0.5" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-[#1e40af] dark:text-blue-400 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                              {res.title}
                              {visited && (
                                <span className="ml-2 text-xs text-emerald-700 dark:text-emerald-400">
                                  · Пройдено
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-500 dark:text-stone-400">
                              {res.subtitle}
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-stone-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Desktop Page-Turn Footer */}
            {!isMobile && (
              <div className="pt-6 border-t border-stone-300/80 dark:border-stone-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={!prevMod}
                  onClick={() => prevMod && onSelectModule(prevMod.id)}
                  className="min-h-[42px] px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-35 inline-flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{prevMod ? `§ 5.${prevMod.index}` : 'Начало'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleModuleComplete(activeModule.id)}
                  className="min-h-[42px] px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-200 inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Раздел прочитан' : 'Отметить прочитанным'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isDone) onToggleModuleComplete(activeModule.id);
                    if (!nextMod || nextMod.kind === 'exam') onNavigateScreen('exam');
                    else onSelectModule(nextMod.id);
                  }}
                  className="min-h-[42px] px-5 py-2 rounded-lg bg-[#1e40af] hover:bg-[#1a3696] dark:bg-blue-400 dark:hover:bg-blue-300 text-white dark:text-stone-950 text-sm font-medium inline-flex items-center gap-1.5"
                >
                  <span>
                    {!nextMod || nextMod.kind === 'exam'
                      ? 'Итоговая проверка'
                      : `§ 5.${nextMod.index} ${nextMod.shortTitle}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </article>

          {/* Desktop 30% Margin Rail: Tufte Margin Notes + Subtle Section List */}
          {!isMobile && (
            <aside className="col-span-4 sticky top-16 space-y-8 pt-2">
              <div className="space-y-4">
                <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 pb-2 border-b border-stone-200 dark:border-stone-800">
                  Заметки на полях
                </div>
                {activeModule.marginNotes.map((note, idx) => (
                  <div key={note.label} className="space-y-1">
                    <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      {idx + 1}. {note.label}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 pb-2 border-b border-stone-200 dark:border-stone-800">
                  Разделы главы 05
                </div>
                <nav className="space-y-1">
                  {IP_ADDRESSING_MODULES.map((m) => {
                    const active = m.id === activeModule.id;
                    const done = completedModuleIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          m.kind === 'exam' ? onNavigateScreen('exam') : onSelectModule(m.id)
                        }
                        className={`w-full py-1.5 text-left text-xs flex items-center justify-between gap-2 transition-colors ${
                          active
                            ? 'text-[#1e40af] dark:text-blue-400 font-semibold'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                        }`}
                      >
                        <span className="truncate">
                          § 5.{m.index} {m.shortTitle}
                        </span>
                        {done && <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>
          )}
        </div>

        {/* Mobile quiet page-turn bottom bar */}
        {isMobile && (
          <div className="sticky bottom-0 z-10 bg-[#faf8f4]/95 dark:bg-[#141311]/95 backdrop-blur-md border-t border-stone-300 dark:border-stone-800 px-3 py-2.5 flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={!prevMod}
              onClick={() => prevMod && onSelectModule(prevMod.id)}
              className="min-h-[44px] px-3 rounded-lg border border-stone-300 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 disabled:opacity-35 inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{prevMod ? `§ 5.${prevMod.index}` : '—'}</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleModuleComplete(activeModule.id)}
              className="min-h-[44px] px-3 rounded-lg border border-stone-300 dark:border-stone-800 text-xs font-medium text-stone-700 dark:text-stone-200"
            >
              {isDone ? 'Прочитано' : 'Отметить'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isDone) onToggleModuleComplete(activeModule.id);
                if (!nextMod || nextMod.kind === 'exam') onNavigateScreen('exam');
                else onSelectModule(nextMod.id);
              }}
              className="flex-1 min-h-[44px] px-3 rounded-lg bg-[#1e40af] dark:bg-blue-400 text-white dark:text-stone-950 text-xs font-medium inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span>{!nextMod || nextMod.kind === 'exam' ? 'Проверка' : `§ 5.${nextMod.index}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /* SCREEN 4: ARCHIVAL ASSESSMENT SHEET                                        */
  /* -------------------------------------------------------------------------- */
  const renderExam = () => (
    <div className={`max-w-4xl mx-auto ${isMobile ? 'px-4 py-6' : 'px-8 py-10'} space-y-6`}>
      <button
        type="button"
        onClick={() => onNavigateScreen('course')}
        className="min-h-[40px] inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>К главе 05 · IP-адресация</span>
      </button>

      <FinalExamWidget
        concept="textbook"
        isMobile={isMobile}
        examMode={examMode}
        examAnswers={examAnswers}
        examSubmitted={examSubmitted}
        onChangeExamMode={onChangeExamMode}
        onAnswerQuestion={onAnswerExamQuestion}
        onSubmitExam={onSubmitExam}
        onResetExam={onResetExam}
        onRepeatModule={(modId) => onStartOrResumeModule(modId)}
        onOpenExternalResource={onOpenExternalResource}
        onGoToNextCourse={() => {
          onSelectCoursePreview('routing');
          onNavigateScreen('catalog');
        }}
        onBackToCourse={() => onNavigateScreen('player')}
      />
    </div>
  );

  return (
    <div className="min-h-full bg-[#faf8f4] dark:bg-[#141311] text-stone-900 dark:text-stone-100 transition-colors">
      {screen === 'catalog' && renderCatalog()}
      {screen === 'course' && renderCoursePage()}
      {screen === 'player' && renderPlayer()}
      {screen === 'exam' && renderExam()}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ExternalLink,
  Layers,
  Play,
} from 'lucide-react';
import studioHeroImg from '../../assets/images/courses_studio_ipv4_hero_1795857307158.jpg';
import {
  COURSE_STAGES,
  COURSES_CATALOG,
  IP_ADDRESSING_MODULES,
  getCourseProgress,
  getRecommendedCourseId,
} from '../data/coursesData';
import { SubnetBitVisualizer } from '../components/SubnetBitVisualizer';
import { FinalExamWidget } from '../components/FinalExamWidget';
import type { ConceptSharedProps, DifficultyLevel } from '../types';

export const ConceptStudio: React.FC<ConceptSharedProps> = ({
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
  const [difficultyFilter, setDifficultyFilter] = useState<'Все' | DifficultyLevel>('Все');
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const ipExamPassed = examMode === 'passed' || (examMode === 'interactive' && examSubmitted && Object.keys(examAnswers).length === 5 && Object.entries(examAnswers).filter(([id, idx]) => {
    const map: Record<string, number> = { q1: 0, q2: 1, q3: 1, q4: 0, q5: 1 };
    return map[id] === idx;
  }).length >= 4);

  const ipCourse = COURSES_CATALOG.find((c) => c.id === 'ip-addressing')!;
  const ipProgress = getCourseProgress(ipCourse, profile, completedModuleIds.length, ipExamPassed);
  const recommendedId = getRecommendedCourseId(profile, ipExamPassed);
  const recommendedCourse = COURSES_CATALOG.find((c) => c.id === recommendedId) ?? ipCourse;

  const activeModule =
    IP_ADDRESSING_MODULES.find((m) => m.id === activeModuleId) ?? IP_ADDRESSING_MODULES[0];
  const activeIdx = IP_ADDRESSING_MODULES.findIndex((m) => m.id === activeModule.id);
  const nextIncompleteModule =
    IP_ADDRESSING_MODULES.find((m) => !completedModuleIds.includes(m.id)) ?? IP_ADDRESSING_MODULES[0];

  const completedCoursesCount = COURSES_CATALOG.filter(
    (c) => getCourseProgress(c, profile, completedModuleIds.length, ipExamPassed) === 100
  ).length;

  const previewCourse = selectedCoursePreviewId
    ? COURSES_CATALOG.find((c) => c.id === selectedCoursePreviewId) ?? null
    : null;

  /* -------------------------------------------------------------------------- */
  /* SCREEN 1: CATALOG                                                          */
  /* -------------------------------------------------------------------------- */
  const renderCatalog = () => {
    const filteredCourses =
      difficultyFilter === 'Все'
        ? COURSES_CATALOG
        : COURSES_CATALOG.filter((c) => c.difficulty === difficultyFilter);

    const focusCourse = profile === 'active' ? ipCourse : recommendedCourse;
    const focusProgress = getCourseProgress(
      focusCourse,
      profile,
      completedModuleIds.length,
      ipExamPassed
    );

    return (
      <div className={`max-w-6xl mx-auto ${isMobile ? 'px-4 py-5 space-y-6' : 'px-8 py-9 space-y-10'}`}>
        {/* Focal Anchor: Hero Focus Split */}
        <section
          className={`bg-white dark:bg-[#0e1a2b] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden grid ${
            isMobile ? 'grid-cols-1' : 'grid-cols-12 items-stretch'
          }`}
        >
          <div className={`${isMobile ? 'p-5' : 'col-span-7 p-8'} flex flex-col justify-between gap-6`}>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-sky-700 dark:text-sky-400">
                  {profile === 'active' ? 'Продолжить обучение' : 'Рекомендуемый старт'}
                </span>
                <span aria-hidden="true">·</span>
                <span>Курс {String(focusCourse.order).padStart(2, '0')} из 12</span>
                <span aria-hidden="true">·</span>
                <span>{focusCourse.difficulty}</span>
              </div>

              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'} font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight`}>
                {profile === 'active'
                  ? 'IP-адресация: от маски /24 к уверенному делению подсетей'
                  : 'Системный путь сетевого инженера — от физики кабеля до диагностики'}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                {profile === 'active'
                  ? `Вы уже освоили ${completedModuleIds.length} из 6 шагов. Следующая остановка — «${nextIncompleteModule.title}», затем практика на тренажёрах и итоговый тест.`
                  : '12 последовательных курсов без повторов и лишней теории. Каждый курс опирается на уроки и интерактивные тренажёры NetOps.'}
              </p>
            </div>

            <div className="space-y-4">
              {profile === 'active' && (
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Прогресс курса «IP-адресация»</span>
                    <span className="font-mono-tech font-semibold text-slate-900 dark:text-slate-100">
                      {focusProgress}% ({completedModuleIds.length}/6)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-600 dark:bg-sky-400 transition-all"
                      style={{ width: `${focusProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    profile === 'active'
                      ? onStartOrResumeModule(nextIncompleteModule.id)
                      : onOpenCourse('ip-addressing')
                  }
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white dark:bg-sky-400 dark:hover:bg-sky-300 dark:text-slate-950 text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {profile === 'active'
                      ? `Продолжить: ${nextIncompleteModule.shortTitle}`
                      : 'Открыть курс «IP-адресация»'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenCourse('ip-addressing')}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap"
                >
                  Программа курса
                </button>
              </div>
            </div>
          </div>

          {/* Architectural visual slot */}
          <div className={`${isMobile ? 'h-44' : 'col-span-5 min-h-[280px]'} relative bg-slate-900 overflow-hidden`}>
            {!heroImgFailed ? (
              <img
                src={studioHeroImg}
                alt="Геометрическая модель деления сетевого пространства на подсети"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-sky-950 flex items-center justify-center p-6">
                <Layers className="w-10 h-10 text-sky-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
              <div>
                <div className="text-xs text-slate-300">Эталонный курс прототипа</div>
                <div className="text-sm font-semibold">05 · IP-адресация · 6 шагов · ~2,5 ч</div>
              </div>
              <span className="font-mono-tech text-xs text-sky-300">/24 → /30</span>
            </div>
          </div>
        </section>

        {/* Compact Full-Width Rhythm Summary Strip */}
        <section
          className={`grid gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-4'
          }`}
        >
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Пройдено курсов</div>
            <div className="mt-1 font-mono-tech text-xl font-bold text-slate-900 dark:text-slate-100">
              {completedCoursesCount} / 12
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Активный курс</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {profile === 'active' ? `IP-адресация · ${ipProgress}%` : 'Ещё не начат'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Рекомендуемый следующий</div>
            <div className="mt-1 text-sm font-semibold text-sky-700 dark:text-sky-400 truncate">
              {recommendedCourse.title}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Формат зачёта</div>
            <div className="mt-1 font-mono-tech text-sm font-medium text-slate-800 dark:text-slate-200">
              ≥20 вопросов · 80%
            </div>
          </div>
        </section>

        {/* Filter Bar & Program Sequence */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Последовательность программы
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Четыре логических этапа от физического уровня до эксплуатации и промышленных сетей.
              </p>
            </div>

            <div
              className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              role="group"
              aria-label="Фильтр по сложности"
            >
              {(['Все', 'Базовый', 'Углублённый', 'Прикладной'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficultyFilter(lvl)}
                  className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    difficultyFilter === lvl
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Curated Stage Groups — crisp track rows, NOT 12 identical cards */}
          <div className="space-y-8">
            {COURSE_STAGES.map((stage, sIdx) => {
              const stageCourses = filteredCourses.filter((c) => c.stage === stage.id);
              if (stageCourses.length === 0) return null;
              return (
                <div key={stage.id} className="space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Этап {sIdx + 1}. {stage.title}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{stage.subtitle}</span>
                  </div>

                  <div className="bg-white dark:bg-[#0e1a2b] border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-200/80 dark:divide-slate-800 overflow-hidden">
                    {stageCourses.map((course) => {
                      const pct = getCourseProgress(
                        course,
                        profile,
                        completedModuleIds.length,
                        ipExamPassed
                      );
                      const isFeatured = course.id === 'ip-addressing';
                      const isRecommended = course.id === recommendedId;
                      const isPreviewOpen = previewCourse?.id === course.id;

                      return (
                        <div key={course.id}>
                          <button
                            type="button"
                            onClick={() =>
                              isFeatured
                                ? onOpenCourse(course.id)
                                : onSelectCoursePreview(isPreviewOpen ? null : course.id)
                            }
                            className={`w-full text-left ${isMobile ? 'p-4' : 'px-6 py-4'} transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 flex ${
                              isMobile ? 'flex-col gap-3' : 'items-center justify-between gap-6'
                            }`}
                          >
                            <div className="flex items-start gap-4 min-w-0 flex-1">
                              <span
                                className={`font-mono-tech text-xs font-semibold pt-1 shrink-0 ${
                                  pct === 100
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : isFeatured
                                      ? 'text-sky-600 dark:text-sky-400'
                                      : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {String(course.order).padStart(2, '0')}
                              </span>

                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {course.title}
                                  </span>
                                  {isRecommended && (
                                    <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                                      · Рекомендуется далее
                                    </span>
                                  )}
                                  {isFeatured && !isRecommended && (
                                    <span className="text-xs font-medium text-sky-700 dark:text-sky-400">
                                      · Полный прототип
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                                  {course.summary}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                                  <span>{course.difficulty}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="tabular-nums">{course.modulesCount} модулей</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="tabular-nums">{course.durationLabel}</span>
                                  {course.trainersCount > 0 && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="tabular-nums">{course.trainersCount} стенд.</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className={`flex items-center gap-4 shrink-0 ${isMobile ? 'justify-between pl-8' : ''}`}>
                              <div className="w-28 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span
                                    className={
                                      pct === 100
                                        ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                                        : pct > 0
                                          ? 'text-sky-700 dark:text-sky-400 font-medium'
                                          : 'text-slate-400 dark:text-slate-500'
                                    }
                                  >
                                    {pct === 100 ? 'Пройден' : pct > 0 ? 'В процессе' : 'Ожидает'}
                                  </span>
                                  <span className="font-mono-tech text-slate-600 dark:text-slate-300">
                                    {pct}%
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      pct === 100
                                        ? 'bg-emerald-600 dark:bg-emerald-400'
                                        : 'bg-sky-600 dark:bg-sky-400'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>

                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                {isFeatured ? (pct > 0 && pct < 100 ? 'Продолжить' : 'Открыть') : 'Обзор'}
                                <ChevronRight className="w-4 h-4" />
                              </span>
                            </div>
                          </button>

                          {/* Inline preview for non-featured courses */}
                          {isPreviewOpen && !isFeatured && (
                            <div className="px-6 pb-5 pt-2 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-200/70 dark:border-slate-800/80 space-y-3">
                              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Что вы освоите в курсе «{course.title}»
                              </div>
                              <ul className="space-y-1.5">
                                {course.outcomes.map((out) => (
                                  <li
                                    key={out}
                                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                                  >
                                    <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                                    <span>{out}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  Детальный кликабельный прототип прохождения подготовлен на примере курса «IP-адресация».
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onOpenCourse('ip-addressing')}
                                  className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-400 text-white dark:text-slate-950 text-xs font-semibold whitespace-nowrap"
                                >
                                  Открыть эталонный курс «IP-адресация»
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /* SCREEN 2: COURSE PAGE («IP-адресация»)                                     */
  /* -------------------------------------------------------------------------- */
  const renderCoursePage = () => (
    <div className={`max-w-6xl mx-auto ${isMobile ? 'px-4 py-5 space-y-6' : 'px-8 py-9 space-y-8'}`}>
      <button
        type="button"
        onClick={() => onNavigateScreen('catalog')}
        className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Все 12 курсов</span>
      </button>

      <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-12 items-start'}`}>
        {/* Main Column */}
        <div className={isMobile ? 'space-y-6' : 'col-span-8 space-y-8'}>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-sky-400">Курс 05 · Ядро сети</span>
              <span aria-hidden="true">·</span>
              <span>{ipCourse.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span>6 шагов · ~2,5 часа</span>
              <span aria-hidden="true">·</span>
              <span>Итоговый тест ≥20 вопросов (80%)</span>
            </div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold tracking-tight text-slate-900 dark:text-slate-50`}>
              IP-адресация
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Научитесь свободно читать префиксы CIDR, делить сети без ошибок на границах блоков и диагностировать IPv6 SLAAC в локальном сегменте.
            </p>
          </div>

          {/* Outcomes */}
          <div className="bg-white dark:bg-[#0e1a2b] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Чему вы научитесь после курса
            </h2>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {ipCourse.outcomes.map((outcome) => (
                <div key={outcome} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6-step Syllabus */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Программа курса
              </h2>
              <span className="font-mono-tech text-xs text-slate-500 dark:text-slate-400">
                Пройдено {completedModuleIds.length} из {IP_ADDRESSING_MODULES.length}
              </span>
            </div>

            <div className="bg-white dark:bg-[#0e1a2b] border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-200/80 dark:divide-slate-800 overflow-hidden">
              {IP_ADDRESSING_MODULES.map((mod) => {
                const done = completedModuleIds.includes(mod.id);
                const isNext = mod.id === nextIncompleteModule.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() =>
                      mod.kind === 'exam'
                        ? onNavigateScreen('exam')
                        : onStartOrResumeModule(mod.id)
                    }
                    className={`w-full text-left ${isMobile ? 'p-4' : 'px-6 py-4'} hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-mono-tech font-semibold mt-0.5 ${
                          done
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                            : isNext
                              ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {done ? <Check className="w-3.5 h-3.5" /> : mod.index}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                            {mod.title}
                          </span>
                          {isNext && !done && (
                            <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                              · Следующий шаг
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {mod.lead}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            {mod.kind === 'exam'
                              ? 'Итоговая проверка'
                              : mod.kind === 'practice'
                                ? 'Стенды NetOps'
                                : 'Урок и разбор'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{mod.durationLabel}</span>
                          {mod.resources.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{mod.resources.length} внешн. ресурса</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Action Rail */}
        <aside className={`${isMobile ? '' : 'col-span-4 sticky top-20'} space-y-4`}>
          <div className="bg-white dark:bg-[#0e1a2b] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="h-36 bg-slate-900 relative overflow-hidden">
              {!heroImgFailed ? (
                <img
                  src={studioHeroImg}
                  alt="Иллюстрация курса IP-адресация"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white font-mono-tech">
                <span>Прогресс</span>
                <span>{ipProgress}%</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-600 dark:bg-sky-400 transition-all"
                  style={{ width: `${ipProgress}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => onStartOrResumeModule(nextIncompleteModule.id)}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white dark:bg-sky-400 dark:hover:bg-sky-300 dark:text-slate-950 text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {completedModuleIds.length > 0
                    ? `Продолжить · Шаг ${nextIncompleteModule.index}`
                    : 'Начать с шага 1'}
                </span>
              </button>

              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Связанные уроки</span>
                  <span className="font-mono-tech font-semibold text-slate-900 dark:text-slate-100">4 урока</span>
                </div>
                <div className="flex justify-between">
                  <span>Самостоятельные тренажёры</span>
                  <span className="font-mono-tech font-semibold text-slate-900 dark:text-slate-100">IPv4 · IPv6 · Пакет</span>
                </div>
                <div className="flex justify-between">
                  <span>Итоговый тест</span>
                  <span className="font-mono-tech font-semibold text-slate-900 dark:text-slate-100">20 вопр. · 80%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Direct standalone trainer links */}
          <div className="bg-white dark:bg-[#0e1a2b] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Стенды NetOps для этого курса
            </div>
            {(
              [
                { id: 'trainer-ipv4', label: 'Тренажёр IPv4 · Маски и подсети' },
                { id: 'trainer-ipv6', label: 'Тренажёр IPv6 · Типы и SLAAC' },
                { id: 'trainer-packet', label: 'Симулятор «Путь пакета»' },
              ] as const
            ).map((tr) => (
              <button
                key={tr.id}
                type="button"
                onClick={() => onOpenExternalResource(tr.id, nextIncompleteModule.id)}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sky-500 text-left text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2 transition-colors"
              >
                <span className="truncate">{tr.label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );

  /* -------------------------------------------------------------------------- */
  /* SCREEN 3: COURSE PLAYER (Focused Studio Stage)                             */
  /* -------------------------------------------------------------------------- */
  const renderPlayer = () => {
    const isDone = completedModuleIds.includes(activeModule.id);
    const prevMod = activeIdx > 0 ? IP_ADDRESSING_MODULES[activeIdx - 1] : null;
    const nextMod =
      activeIdx < IP_ADDRESSING_MODULES.length - 1 ? IP_ADDRESSING_MODULES[activeIdx + 1] : null;

    return (
      <div className="min-h-full flex flex-col">
        {/* Compact step rail */}
        <div className="bg-white dark:bg-[#0e1a2b] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onNavigateScreen('course')}
              className="min-h-[38px] inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isMobile ? 'IP-адресация' : 'К программе курса «IP-адресация»'}</span>
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {IP_ADDRESSING_MODULES.map((m) => {
                const done = completedModuleIds.includes(m.id);
                const active = m.id === activeModule.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      m.kind === 'exam' ? onNavigateScreen('exam') : onSelectModule(m.id)
                    }
                    title={`${m.index}. ${m.title}`}
                    className={`min-h-[34px] px-2.5 rounded-lg text-xs font-mono-tech font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
                      active
                        ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950'
                        : done
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {done && !active && <Check className="w-3 h-3" />}
                    <span>{m.index}</span>
                    {!isMobile && active && <span className="font-sans font-medium ml-1">{m.shortTitle}</span>}
                  </button>
                );
              })}
            </div>

            {!isMobile && (
              <span className="font-mono-tech text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
                {ipProgress}% курса
              </span>
            )}
          </div>
        </div>

        {/* Focused Reading & Interactive Stage */}
        <div className={`max-w-3xl w-full mx-auto flex-1 ${isMobile ? 'px-4 py-5 pb-24' : 'px-6 py-9'} space-y-7`}>
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono-tech font-semibold text-sky-700 dark:text-sky-400">
                Шаг {activeModule.index} из 6
              </span>
              <span aria-hidden="true">·</span>
              <span>{activeModule.durationLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{isDone ? 'Отмечен пройденным' : 'В изучении'}</span>
            </div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight text-slate-900 dark:text-slate-50`}>
              {activeModule.title}
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeModule.lead}
            </p>
          </div>

          {/* Core Engineering Concept */}
          <div className="bg-white dark:bg-[#0e1a2b] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
              Главная мысль шага
            </div>
            <p className="text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
              {activeModule.keyIdea}
            </p>
            <div className="space-y-3 pt-2 border-t border-slate-200/70 dark:border-slate-800">
              {activeModule.paragraphs.map((p) => (
                <p key={p} className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Visual clarity widget */}
          {activeModule.visualizerMode && (
            <SubnetBitVisualizer
              mode={activeModule.visualizerMode}
              concept="studio"
              isMobile={isMobile}
            />
          )}

          {/* Practical engineering rule */}
          <div className="bg-sky-50/70 dark:bg-sky-950/25 border border-sky-200/80 dark:border-sky-900/70 rounded-2xl p-5 space-y-1.5">
            <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">
              Инженерное правило на практике
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {activeModule.practicalRule}
            </p>
          </div>

          {/* Standalone NetOps Resources (no duplication inside courses) */}
          {activeModule.resources.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Связанные уроки и тренажёры NetOps
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Открываются отдельно с закладкой возврата сюда
                </span>
              </div>

              <div className="space-y-2.5">
                {activeModule.resources.map((res) => {
                  const visited = completedResourceIds.includes(res.resourceId);
                  return (
                    <button
                      key={res.resourceId}
                      type="button"
                      onClick={() => onOpenExternalResource(res.resourceId, activeModule.id)}
                      className="w-full text-left bg-white dark:bg-[#0e1a2b] border border-slate-200 dark:border-slate-800 hover:border-sky-500 rounded-xl p-4 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sky-700 dark:text-sky-400 shrink-0">
                          {res.kind === 'trainer' ? (
                            <Cpu className="w-4 h-4" />
                          ) : (
                            <BookOpen className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {res.title}
                            </span>
                            {visited && (
                              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                · Выполнено
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {res.subtitle} · {res.duration}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Desktop Footer Navigation */}
          {!isMobile && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={!prevMod}
                onClick={() => prevMod && onSelectModule(prevMod.id)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800/60 disabled:opacity-35 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleModuleComplete(activeModule.id)}
                className={`min-h-[44px] px-4 py-2 rounded-xl border text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap ${
                  isDone
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800/60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isDone ? 'Шаг пройден' : 'Отметить пройденным'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isDone) onToggleModuleComplete(activeModule.id);
                  if (!nextMod || nextMod.kind === 'exam') {
                    onNavigateScreen('exam');
                  } else {
                    onSelectModule(nextMod.id);
                  }
                }}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white dark:bg-sky-400 dark:hover:bg-sky-300 dark:text-slate-950 text-sm font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>
                  {!nextMod || nextMod.kind === 'exam'
                    ? 'К итоговому тесту'
                    : `Далее: ${nextMod.shortTitle}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Thumb-Zone Bottom Bar (<= 15% viewport cap) */}
        {isMobile && (
          <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-[#0e1a2b]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2.5 flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={!prevMod}
              onClick={() => prevMod && onSelectModule(prevMod.id)}
              aria-label="Предыдущий шаг"
              className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-35"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onToggleModuleComplete(activeModule.id)}
              className={`min-h-[44px] px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap ${
                isDone
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isDone ? 'Пройдено' : 'Зачесть'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isDone) onToggleModuleComplete(activeModule.id);
                if (!nextMod || nextMod.kind === 'exam') onNavigateScreen('exam');
                else onSelectModule(nextMod.id);
              }}
              className="flex-1 min-h-[44px] px-3 rounded-xl bg-sky-600 dark:bg-sky-400 text-white dark:text-slate-950 text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span>{!nextMod || nextMod.kind === 'exam' ? 'Итоговый тест' : 'Следующий шаг'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /* SCREEN 4: EXAM & COMPLETION                                                */
  /* -------------------------------------------------------------------------- */
  const renderExam = () => (
    <div className={`max-w-5xl mx-auto ${isMobile ? 'px-4 py-5' : 'px-8 py-9'} space-y-6`}>
      <button
        type="button"
        onClick={() => onNavigateScreen('course')}
        className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>К курсу «IP-адресация»</span>
      </button>

      <FinalExamWidget
        concept="studio"
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
    <div className="min-h-full bg-[#f7f9fc] dark:bg-[#08101c] text-slate-900 dark:text-slate-100 transition-colors">
      {screen === 'catalog' && renderCatalog()}
      {screen === 'course' && renderCoursePage()}
      {screen === 'player' && renderPlayer()}
      {screen === 'exam' && renderExam()}
    </div>
  );
};

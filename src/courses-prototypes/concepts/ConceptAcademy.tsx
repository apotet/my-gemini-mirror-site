import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Cpu,
  ExternalLink,
  GitBranch,
  Play,
} from 'lucide-react';
import academyHeroImg from '../../assets/images/courses_academy_topology_hero_1795857308194.jpg';
import {
  COURSE_EDGES,
  COURSES_CATALOG,
  IP_ADDRESSING_MODULES,
  getCourseProgress,
  getRecommendedCourseId,
} from '../data/coursesData';
import { SubnetBitVisualizer } from '../components/SubnetBitVisualizer';
import { FinalExamWidget } from '../components/FinalExamWidget';
import type { ConceptSharedProps } from '../types';

const CIDR_QUICK_REF = [
  { prefix: '/24', mask: '.0', hosts: '254' },
  { prefix: '/25', mask: '.128', hosts: '126' },
  { prefix: '/26', mask: '.192', hosts: '62' },
  { prefix: '/27', mask: '.224', hosts: '30' },
  { prefix: '/28', mask: '.240', hosts: '14' },
  { prefix: '/29', mask: '.248', hosts: '6' },
  { prefix: '/30', mask: '.252', hosts: '2' },
];

export const ConceptAcademy: React.FC<ConceptSharedProps> = ({
  screen,
  isMobile,
  isDark,
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
  const [heroImgFailed, setHeroImgFailed] = useState(false);

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

  const inspectedId = selectedCoursePreviewId ?? recommendedId;
  const inspectedCourse = COURSES_CATALOG.find((c) => c.id === inspectedId) ?? ipCourse;
  const inspectedProgress = getCourseProgress(
    inspectedCourse,
    profile,
    completedModuleIds.length,
    ipExamPassed
  );

  const activeModule =
    IP_ADDRESSING_MODULES.find((m) => m.id === activeModuleId) ?? IP_ADDRESSING_MODULES[0];
  const activeIdx = IP_ADDRESSING_MODULES.findIndex((m) => m.id === activeModule.id);
  const nextIncompleteModule =
    IP_ADDRESSING_MODULES.find((m) => !completedModuleIds.includes(m.id)) ?? IP_ADDRESSING_MODULES[0];

  const completedCoursesCount = COURSES_CATALOG.filter(
    (c) => getCourseProgress(c, profile, completedModuleIds.length, ipExamPassed) === 100
  ).length;

  const gridBg = isDark ? 'academy-grid-dark' : 'academy-grid-light';

  /* -------------------------------------------------------------------------- */
  /* SCREEN 1: INTERACTIVE VISUAL SKILL TOPOLOGY MAP                            */
  /* -------------------------------------------------------------------------- */
  const renderCatalog = () => {
    const upstreamSet = new Set(inspectedCourse.prerequisites);
    const downstreamSet = new Set(
      COURSES_CATALOG.filter((c) => c.prerequisites.includes(inspectedCourse.id)).map((c) => c.id)
    );

    return (
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-5 space-y-5' : 'px-8 py-8 space-y-6'}`}>
        {/* Academy Header Bar */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-blue-700 dark:text-sky-400">
                Инженерная академия NetOps
              </span>
              <span aria-hidden="true">/</span>
              <span>Карта зависимостей · 12 модулей</span>
            </div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-display-academy font-bold tracking-tight text-slate-900 dark:text-slate-50`}>
              Топология маршрута сетевого инженера
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span>
              Освоено:{' '}
              <strong className="font-mono-tech text-slate-900 dark:text-slate-100">
                {completedCoursesCount}/12
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Рекомендуемый узел:{' '}
              <button
                type="button"
                onClick={() => onSelectCoursePreview(recommendedId)}
                className="font-semibold text-blue-700 dark:text-sky-400 hover:underline"
              >
                {COURSES_CATALOG.find((c) => c.id === recommendedId)?.title}
              </button>
            </span>
          </div>
        </div>

        {/* Interactive Topology Map + Inspector Split */}
        {!isMobile ? (
          <div className="grid grid-cols-12 gap-5 items-stretch">
            {/* Left 8 cols: Interactive SVG Skill Graph */}
            <div
              className={`col-span-8 bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col`}
            >
              {/* Tier column labels */}
              <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 text-[11px] font-mono-tech text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-[#0d1626]">
                <span>01 · Фундамент</span>
                <span>02 · Ядро и адресация</span>
                <span>03 · Маршрут и транспорт</span>
                <span>04 · Сервисы и эксплуатация</span>
              </div>

              {/* SVG Graph Canvas */}
              <div className={`relative flex-1 min-h-[450px] ${gridBg} p-3`}>
                <svg
                  viewBox="0 0 940 465"
                  className="w-full h-full select-none"
                  role="img"
                  aria-label="Интерактивная карта 12 курсов NetOps с зависимостями"
                >
                  {/* Dependency curves */}
                  {COURSE_EDGES.map((edge) => {
                    const from = COURSES_CATALOG.find((c) => c.id === edge.from);
                    const to = COURSES_CATALOG.find((c) => c.id === edge.to);
                    if (!from || !to) return null;
                    const x1 = from.mapPos.x + 68;
                    const y1 = from.mapPos.y;
                    const x2 = to.mapPos.x - 68;
                    const y2 = to.mapPos.y;
                    const cx1 = x1 + (x2 - x1) * 0.45;
                    const cx2 = x2 - (x2 - x1) * 0.45;

                    const isHighlighted =
                      edge.from === inspectedCourse.id || edge.to === inspectedCourse.id;
                    const fromDone =
                      getCourseProgress(from, profile, completedModuleIds.length, ipExamPassed) === 100;

                    return (
                      <path
                        key={`${edge.from}-${edge.to}`}
                        d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={
                          isHighlighted
                            ? isDark
                              ? '#38bdf8'
                              : '#1d4ed8'
                            : fromDone
                              ? isDark
                                ? '#10b981'
                                : '#059669'
                              : isDark
                                ? '#334155'
                                : '#cbd5e1'
                        }
                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                        strokeDasharray={isHighlighted ? undefined : fromDone ? undefined : '4 4'}
                        opacity={isHighlighted ? 1 : 0.72}
                      />
                    );
                  })}

                  {/* Interactive Course Nodes */}
                  {COURSES_CATALOG.map((course) => {
                    const pct = getCourseProgress(
                      course,
                      profile,
                      completedModuleIds.length,
                      ipExamPassed
                    );
                    const isSelected = course.id === inspectedCourse.id;
                    const isRecommended = course.id === recommendedId;
                    const isRelated =
                      upstreamSet.has(course.id) || downstreamSet.has(course.id);

                    const fillBg = isSelected
                      ? isDark
                        ? '#172a46'
                        : '#eff6ff'
                      : isDark
                        ? '#0e1729'
                        : '#ffffff';

                    const strokeColor = isSelected
                      ? isDark
                        ? '#38bdf8'
                        : '#1d4ed8'
                      : pct === 100
                        ? isDark
                          ? '#10b981'
                          : '#059669'
                        : isRecommended
                          ? isDark
                            ? '#f59e0b'
                            : '#d97706'
                          : isRelated
                            ? isDark
                              ? '#64748b'
                              : '#94a3b8'
                            : isDark
                              ? '#1e293b'
                              : '#cbd5e1';

                    const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
                    const textMuted = isDark ? '#94a3b8' : '#64748b';

                    return (
                      <g
                        key={course.id}
                        transform={`translate(${course.mapPos.x - 68}, ${course.mapPos.y - 30})`}
                        onClick={() => onSelectCoursePreview(course.id)}
                        onDoubleClick={() =>
                          course.id === 'ip-addressing' && onOpenCourse('ip-addressing')
                        }
                        className="cursor-pointer"
                      >
                        <rect
                          width="136"
                          height="60"
                          rx="8"
                          fill={fillBg}
                          stroke={strokeColor}
                          strokeWidth={isSelected ? 2.2 : 1.3}
                        />
                        {/* Top progress hairline inside node */}
                        <rect
                          x="1"
                          y="1"
                          width={Math.max(0, (134 * pct) / 100)}
                          height="3"
                          rx="1.5"
                          fill={
                            pct === 100
                              ? isDark
                                ? '#34d399'
                                : '#059669'
                              : isDark
                                ? '#38bdf8'
                                : '#1d4ed8'
                          }
                        />
                        <text
                          x="10"
                          y="20"
                          fontSize="9.5"
                          fontFamily="JetBrains Mono, monospace"
                          fill={
                            isRecommended
                              ? isDark
                                ? '#fbbf24'
                                : '#b45309'
                              : textMuted
                          }
                          fontWeight="600"
                        >
                          {course.code} · {pct}%
                        </text>
                        <text
                          x="10"
                          y="37"
                          fontSize="11.5"
                          fontFamily="Plus Jakarta Sans, sans-serif"
                          fill={textPrimary}
                          fontWeight="700"
                        >
                          {course.shortTitle}
                        </text>
                        <text
                          x="10"
                          y="51"
                          fontSize="9.5"
                          fontFamily="Plus Jakarta Sans, sans-serif"
                          fill={textMuted}
                        >
                          {course.difficulty} · {course.durationLabel}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend footer */}
                <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span>Кликните по любому узлу — подсветятся зависимости и программа</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono-tech">
                    <span className="text-emerald-700 dark:text-emerald-400">■ Пройден</span>
                    <span className="text-amber-700 dark:text-amber-400">■ Рекомендуем</span>
                    <span className="text-blue-700 dark:text-sky-400">■ Выбран</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 cols: Selected Course Inspector */}
            <aside className="col-span-4 bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 text-xs font-mono-tech">
                  <span className="text-blue-700 dark:text-sky-400 font-semibold">
                    {inspectedCourse.code} · {inspectedCourse.stageLabel}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {inspectedProgress}%
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-display-academy font-bold text-slate-900 dark:text-slate-50">
                    {inspectedCourse.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                    {inspectedCourse.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span>{inspectedCourse.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span>{inspectedCourse.modulesCount} модулей</span>
                  <span aria-hidden="true">·</span>
                  <span>{inspectedCourse.durationLabel}</span>
                </div>

                {/* Prerequisites & Unlocks */}
                <div className="space-y-2 text-xs">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">
                    Опирается на:
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-medium">
                    {inspectedCourse.prerequisites.length === 0
                      ? 'Входной курс (предварительная подготовка не нужна)'
                      : inspectedCourse.prerequisites
                          .map((pid) => COURSES_CATALOG.find((c) => c.id === pid)?.title)
                          .join(' · ')}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Инженерный результат
                  </div>
                  <ul className="space-y-2">
                    {inspectedCourse.outcomes.map((o) => (
                      <li
                        key={o}
                        className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-snug"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-700 dark:text-sky-400 shrink-0 mt-0.5" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                {inspectedCourse.id === 'ip-addressing' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenCourse('ip-addressing')}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 dark:bg-sky-400 dark:hover:bg-sky-300 text-white dark:text-slate-950 text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <span>Открыть паспорт курса</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartOrResumeModule(nextIncompleteModule.id)}
                      className="w-full min-h-[42px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      {completedModuleIds.length > 0
                        ? `Продолжить сразу · Шаг ${nextIncompleteModule.index}`
                        : 'Перейти сразу к Шагу 1'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Полный интерактивный разбор курса и прохождения показан на узле <strong className="text-slate-800 dark:text-slate-200">NET-05 · IP-адресация</strong>.
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenCourse('ip-addressing')}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 dark:bg-sky-400 dark:hover:bg-sky-300 text-white dark:text-slate-950 text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <span>Открыть NET-05 · IP-адресация</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </aside>
          </div>
        ) : (
          /* Mobile Vertical Metro-Route Topology */
          <div className="space-y-4">
            {/* Quick Focus Card */}
            <div className="bg-white dark:bg-[#111b2e] border border-slate-300 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-tech">
                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                  Рекомендуемый узел
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {ipProgress}% · NET-05
                </span>
              </div>
              <div className="text-lg font-display-academy font-bold text-slate-900 dark:text-slate-100">
                IP-адресация
              </div>
              <button
                type="button"
                onClick={() => onOpenCourse('ip-addressing')}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-blue-700 dark:bg-sky-400 text-white dark:text-slate-950 text-sm font-semibold inline-flex items-center justify-center gap-2"
              >
                <span>Открыть курс «IP-адресация»</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Vertical connected topology list */}
            <div className="relative pl-5 space-y-2.5">
              <div
                className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-300 dark:bg-slate-700"
                aria-hidden="true"
              />
              {COURSES_CATALOG.map((course) => {
                const pct = getCourseProgress(
                  course,
                  profile,
                  completedModuleIds.length,
                  ipExamPassed
                );
                const expanded = inspectedCourse.id === course.id;
                const isFeatured = course.id === 'ip-addressing';

                return (
                  <div key={course.id} className="relative">
                    <span
                      className={`absolute -left-[15px] top-4 w-3 h-3 rounded-full border-2 ${
                        pct === 100
                          ? 'bg-emerald-600 border-emerald-600'
                          : isFeatured
                            ? 'bg-blue-700 dark:bg-sky-400 border-blue-700 dark:border-sky-400'
                            : 'bg-white dark:bg-[#0b1220] border-slate-400 dark:border-slate-600'
                      }`}
                    />
                    <div className="bg-white dark:bg-[#111b2e] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          isFeatured
                            ? onOpenCourse('ip-addressing')
                            : onSelectCoursePreview(expanded ? null : course.id)
                        }
                        className="w-full min-h-[56px] p-3.5 text-left flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-mono-tech text-[11px] text-slate-500 dark:text-slate-400">
                            {course.code} · {course.difficulty} · {pct}%
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                            {course.title}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>

                      {expanded && !isFeatured && (
                        <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {course.summary}
                          </p>
                          <button
                            type="button"
                            onClick={() => onOpenCourse('ip-addressing')}
                            className="w-full min-h-[40px] rounded-lg bg-slate-900 dark:bg-sky-400 text-white dark:text-slate-950 text-xs font-semibold"
                          >
                            Перейти к NET-05 · IP-адресация
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /* SCREEN 2: COURSE PAGE (Engineering Route Passport)                         */
  /* -------------------------------------------------------------------------- */
  const renderCoursePage = () => (
    <div className={`max-w-6xl mx-auto ${isMobile ? 'px-4 py-5 space-y-5' : 'px-8 py-8 space-y-7'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigateScreen('catalog')}
          className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Назад к карте Академии</span>
        </button>

        {/* Dependency chain strip */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono-tech text-xs text-slate-500 dark:text-slate-400">
          <span>NET-03 OSI/TCP-IP</span>
          <ArrowRight className="w-3 h-3" />
          <span className="font-bold text-blue-700 dark:text-sky-400">NET-05 IP-адресация</span>
          <ArrowRight className="w-3 h-3" />
          <span>NET-06 Маршрутизация</span>
        </div>
      </div>

      {/* Passport Banner */}
      <div
        className={`bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl overflow-hidden grid ${
          isMobile ? 'grid-cols-1' : 'grid-cols-12 items-stretch'
        }`}
      >
        <div className={`${isMobile ? 'p-5' : 'col-span-7 p-7'} flex flex-col justify-between gap-5`}>
          <div className="space-y-2.5">
            <div className="font-mono-tech text-xs text-blue-700 dark:text-sky-400 font-semibold">
              Узел NET-05 · Углублённый · 6 контрольных точек · ~2,5 ч
            </div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'} font-display-academy font-bold tracking-tight text-slate-900 dark:text-slate-50`}>
              IP-адресация
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Ключевой узел перед маршрутизацией: маски CIDR, диапазоны RFC 1918 и APIPA, точный расчёт хостов и автонастройка IPv6 SLAAC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onStartOrResumeModule(nextIncompleteModule.id)}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 dark:bg-sky-400 dark:hover:bg-sky-300 text-white dark:text-slate-950 text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {completedModuleIds.length > 0
                  ? `Продолжить · Точка ${nextIncompleteModule.index}/6`
                  : 'Запустить маршрут с точки 1'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateScreen('exam')}
              className="min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 whitespace-nowrap"
            >
              Итоговый тест (20 вопр. · 80%)
            </button>
          </div>
        </div>

        <div className={`${isMobile ? 'h-40' : 'col-span-5 min-h-[240px]'} relative bg-slate-900 overflow-hidden`}>
          {!heroImgFailed ? (
            <img
              src={academyHeroImg}
              alt="Сетевой коммутатор и оптические соединения"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <GitBranch className="w-8 h-8 text-sky-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono-tech text-white">
            <span>Готовность узла NET-05</span>
            <span>{ipProgress}% ({completedModuleIds.length}/6)</span>
          </div>
        </div>
      </div>

      {/* Outcomes + Checkpoints Grid */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-12 items-start'}`}>
        <div className={`${isMobile ? '' : 'col-span-8'} space-y-3`}>
          <h2 className="text-lg font-display-academy font-bold text-slate-900 dark:text-slate-100">
            Контрольные точки маршрута
          </h2>
          <div className="bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800">
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
                  className="w-full text-left p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span
                      className={`font-mono-tech text-xs font-bold w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                        done
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                          : isNext
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {done ? <Check className="w-4 h-4" /> : `0${mod.index}`}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                        {mod.title}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {mod.lead}
                      </p>
                      <div className="font-mono-tech text-[11px] text-slate-500 dark:text-slate-400">
                        {mod.durationLabel}
                        {mod.resources.length > 0 && ` · ${mod.resources.map((r) => (r.kind === 'trainer' ? 'Стенд' : 'Урок')).join(' + ')}`}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                </button>
              );
            })}
          </div>
        </div>

        <aside className={`${isMobile ? '' : 'col-span-4'} space-y-4`}>
          <div className="bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Компетенции после аттестации
            </h3>
            <ul className="space-y-2.5">
              {ipCourse.outcomes.map((out) => (
                <li key={out} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{out}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl p-5 space-y-2.5">
            <div className="text-xs font-mono-tech text-slate-500 dark:text-slate-400">
              После зачёта (≥80%) откроются
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              NET-06 · Маршрутизация
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              NET-07 · Транспортные протоколы
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

  /* -------------------------------------------------------------------------- */
  /* SCREEN 3: 3-ZONE ENGINEERING WORKBENCH PLAYER                              */
  /* -------------------------------------------------------------------------- */
  const renderPlayer = () => {
    const isDone = completedModuleIds.includes(activeModule.id);
    const prevMod = activeIdx > 0 ? IP_ADDRESSING_MODULES[activeIdx - 1] : null;
    const nextMod =
      activeIdx < IP_ADDRESSING_MODULES.length - 1 ? IP_ADDRESSING_MODULES[activeIdx + 1] : null;

    return (
      <div className="min-h-full flex flex-col">
        {/* Compact workbench sub-header */}
        <div className="bg-white dark:bg-[#111b2e] border-b border-slate-300/80 dark:border-slate-800 px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onNavigateScreen('course')}
              className="min-h-[38px] inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>NET-05 · IP-адресация</span>
            </button>
            <div className="font-mono-tech text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Точка {activeModule.index}/6 · {ipProgress}%
            </div>
          </div>
        </div>

        <div
          className={`max-w-7xl w-full mx-auto flex-1 ${
            isMobile ? 'px-4 py-4 pb-24 space-y-5' : 'px-6 py-6 grid grid-cols-12 gap-6 items-start'
          }`}
        >
          {/* Left Rail: Route Navigator (Desktop) / Compact Horizontal Strip (Mobile) */}
          {!isMobile ? (
            <aside className="col-span-3 sticky top-16 bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono-tech text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                Маршрут NET-05
              </div>
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
                    className={`w-full min-h-[42px] px-3 py-2 rounded-lg text-left text-xs transition-colors flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-blue-700 text-white dark:bg-sky-400 dark:text-slate-950 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="truncate">
                      <span className="font-mono-tech mr-1.5">0{m.index}</span>
                      {m.shortTitle}
                    </span>
                    {done && (
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 ${
                          active ? 'text-white dark:text-slate-950' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </aside>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
                    className={`min-h-[38px] px-3 rounded-lg text-xs font-mono-tech font-semibold whitespace-nowrap shrink-0 border ${
                      active
                        ? 'bg-blue-700 dark:bg-sky-400 text-white dark:text-slate-950 border-blue-700 dark:border-sky-400'
                        : done
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-white dark:bg-[#111b2e] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    0{m.index} · {m.shortTitle}
                  </button>
                );
              })}
            </div>
          )}

          {/* Center 6 cols: Engineering Lesson Deck */}
          <main className={`${isMobile ? '' : 'col-span-6'} space-y-5`}>
            <div className="bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech text-slate-500 dark:text-slate-400">
                <span>Точка 0{activeModule.index} · {activeModule.durationLabel}</span>
                <span className={isDone ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : ''}>
                  {isDone ? 'Зачтено' : 'Активный шаг'}
                </span>
              </div>
              <h1 className="text-2xl font-display-academy font-bold text-slate-900 dark:text-slate-50">
                {activeModule.title}
              </h1>
              <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {activeModule.keyIdea}
              </p>
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                {activeModule.paragraphs.map((p) => (
                  <p key={p} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {activeModule.visualizerMode && (
              <SubnetBitVisualizer
                mode={activeModule.visualizerMode}
                concept="academy"
                isMobile={isMobile}
              />
            )}

            <div className="bg-amber-50/70 dark:bg-amber-950/25 border border-amber-300/70 dark:border-amber-800/70 rounded-xl p-4 space-y-1">
              <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Контрольное правило инженера
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {activeModule.practicalRule}
              </p>
            </div>

            {!isMobile && (
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={!prevMod}
                  onClick={() => prevMod && onSelectModule(prevMod.id)}
                  className="min-h-[42px] px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-35 inline-flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Предыдущая</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleModuleComplete(activeModule.id)}
                  className="min-h-[42px] px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  {isDone ? 'Снять отметку' : 'Отметить пройденной'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDone) onToggleModuleComplete(activeModule.id);
                    if (!nextMod || nextMod.kind === 'exam') onNavigateScreen('exam');
                    else onSelectModule(nextMod.id);
                  }}
                  className="min-h-[42px] px-5 rounded-lg bg-blue-700 hover:bg-blue-600 dark:bg-sky-400 dark:hover:bg-sky-300 text-white dark:text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <span>{!nextMod || nextMod.kind === 'exam' ? 'К аттестации' : 'Следующая точка'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>

          {/* Right 3 cols: Linked Standalone NetOps Resources + Quick CIDR Table */}
          <aside className={`${isMobile ? '' : 'col-span-3 sticky top-16'} space-y-4`}>
            <div className="bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-mono-tech font-semibold text-slate-500 dark:text-slate-400">
                Ресурсы NetOps (без дублирования)
              </div>
              {activeModule.resources.length > 0 ? (
                <div className="space-y-2">
                  {activeModule.resources.map((res) => {
                    const done = completedResourceIds.includes(res.resourceId);
                    return (
                      <button
                        key={res.resourceId}
                        type="button"
                        onClick={() => onOpenExternalResource(res.resourceId, activeModule.id)}
                        className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-sky-400 transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-sky-400">
                            {res.kind === 'trainer' ? (
                              <Cpu className="w-3.5 h-3.5" />
                            ) : (
                              <BookOpen className="w-3.5 h-3.5" />
                            )}
                            {res.kind === 'trainer' ? 'Стенд' : 'Урок'}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {res.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {done ? 'Выполнено · открыть снова' : 'Вернётесь прямо к этой точке'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Для этой точки внешние уроки не требуются — переходите к итоговому тестированию.
                </p>
              )}
            </div>

            {/* Compact tabular CIDR cheat-card */}
            <div className="bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono-tech text-slate-500 dark:text-slate-400">
                <span>Шпаргалка CIDR</span>
                <span>IPv4</span>
              </div>
              <table className="w-full font-mono-tech text-xs">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 text-left">
                    <th className="py-1 font-medium">Преф.</th>
                    <th className="py-1 font-medium">4-й окт.</th>
                    <th className="py-1 font-medium text-right">Хосты</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
                  {CIDR_QUICK_REF.map((r) => (
                    <tr key={r.prefix}>
                      <td className="py-1 font-semibold text-blue-700 dark:text-sky-400">{r.prefix}</td>
                      <td className="py-1">{r.mask}</td>
                      <td className="py-1 text-right">{r.hosts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </aside>
        </div>

        {/* Mobile Bottom Thumb Bar */}
        {isMobile && (
          <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-[#111b2e]/95 backdrop-blur-md border-t border-slate-300 dark:border-slate-800 px-3 py-2.5 flex items-center gap-2">
            <button
              type="button"
              disabled={!prevMod}
              onClick={() => prevMod && onSelectModule(prevMod.id)}
              aria-label="Предыдущая точка"
              className="min-h-[44px] min-w-[44px] rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center disabled:opacity-35"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onToggleModuleComplete(activeModule.id)}
              className="min-h-[44px] px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold whitespace-nowrap"
            >
              {isDone ? 'Зачтено' : 'Зачесть'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isDone) onToggleModuleComplete(activeModule.id);
                if (!nextMod || nextMod.kind === 'exam') onNavigateScreen('exam');
                else onSelectModule(nextMod.id);
              }}
              className="flex-1 min-h-[44px] px-3 rounded-lg bg-blue-700 dark:bg-sky-400 text-white dark:text-slate-950 text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span>{!nextMod || nextMod.kind === 'exam' ? 'К тесту' : 'Далее'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /* SCREEN 4: EXAM & NODE UNLOCK                                               */
  /* -------------------------------------------------------------------------- */
  const renderExam = () => (
    <div className={`max-w-5xl mx-auto ${isMobile ? 'px-4 py-5' : 'px-8 py-8'} space-y-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigateScreen('course')}
          className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>К паспорту NET-05</span>
        </button>
        <span className="font-mono-tech text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          Аттестация узла NET-05 → разблокировка NET-06
        </span>
      </div>

      <FinalExamWidget
        concept="academy"
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
    <div className="min-h-full bg-[#f3f5f8] dark:bg-[#0b1220] text-slate-900 dark:text-slate-100 transition-colors">
      {screen === 'catalog' && renderCatalog()}
      {screen === 'course' && renderCoursePage()}
      {screen === 'player' && renderPlayer()}
      {screen === 'exam' && renderExam()}
    </div>
  );
};

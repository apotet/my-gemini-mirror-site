import React, { useMemo, useState } from 'react';
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
  Eye,
  GitBranch,
  Layers,
  Play,
  RotateCcw,
  Shield,
  Activity,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import academyHeroImg from '../../assets/images/courses_academy_topology_hero_1795857308194.jpg';
import {
  ACADEMY_EDGES,
  ACADEMY_NODES,
  CAREER_ROLES,
  computeRoleReadiness,
  getRolesUsingNode,
  masteryLabel,
  masteryToPercent,
  resolveNodeMastery,
  type AcademyNode,
  type CareerRolePath,
  type MasteryStatus,
} from '../data/academyTopologyData';
import {
  COURSES_CATALOG,
  IP_ADDRESSING_MODULES,
  getCourseProgress,
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

type MapScope = 'full' | 'core' | 'evolution';
type InspectorTab = 'node' | 'role';

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

  // Personal Career Path highlighting state
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [showSupportingNodes, setShowSupportingNodes] = useState<boolean>(false);
  const [mobileOnlyRolePath, setMobileOnlyRolePath] = useState<boolean>(false);

  // Scalability: map scope + zoom + inspector tab
  const [mapScope, setMapScope] = useState<MapScope>('full');
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('node');

  const ipExamPassed =
    examMode === 'passed' ||
    (examMode === 'interactive' &&
      examSubmitted &&
      Object.entries(examAnswers).filter(([id, idx]) => {
        const map: Record<string, number> = { q1: 0, q2: 1, q3: 1, q4: 0, q5: 1 };
        return map[id] === idx;
      }).length >= 4);

  const ipHasPracticeDone =
    completedModuleIds.includes('mod-practice-hub') ||
    completedResourceIds.includes('trainer-ipv4') ||
    completedResourceIds.includes('trainer-ipv6');

  const ipCourse = COURSES_CATALOG.find((c) => c.id === 'ip-addressing')!;
  const ipProgress = getCourseProgress(ipCourse, profile, completedModuleIds.length, ipExamPassed);

  // Live mastery map across all 18 Academy competencies
  const masteryByNodeId = useMemo<Record<string, MasteryStatus>>(() => {
    const result: Record<string, MasteryStatus> = {};
    for (const node of ACADEMY_NODES) {
      result[node.id] = resolveNodeMastery(
        node,
        profile,
        completedModuleIds.length,
        ipHasPracticeDone,
        ipExamPassed
      );
    }
    return result;
  }, [profile, completedModuleIds.length, ipHasPracticeDone, ipExamPassed]);

  const selectedRole: CareerRolePath | null = useMemo(
    () => (selectedRoleId ? CAREER_ROLES.find((r) => r.id === selectedRoleId) ?? null : null),
    [selectedRoleId]
  );

  const roleReadiness = useMemo(
    () => (selectedRole ? computeRoleReadiness(selectedRole, masteryByNodeId) : null),
    [selectedRole, masteryByNodeId]
  );

  const recommendedNodeId = useMemo(() => {
    if (roleReadiness?.nextRecommendedNode) return roleReadiness.nextRecommendedNode.id;
    if (profile === 'newcomer') return 'net-basics';
    return ipExamPassed ? 'routing' : 'ip-addressing';
  }, [roleReadiness, profile, ipExamPassed]);

  const inspectedNode: AcademyNode = useMemo(() => {
    const match = selectedCoursePreviewId
      ? ACADEMY_NODES.find((n) => n.id === selectedCoursePreviewId)
      : null;
    if (match) return match;
    return ACADEMY_NODES.find((n) => n.id === recommendedNodeId) ?? ACADEMY_NODES[5];
  }, [selectedCoursePreviewId, recommendedNodeId]);

  const activeModule =
    IP_ADDRESSING_MODULES.find((m) => m.id === activeModuleId) ?? IP_ADDRESSING_MODULES[0];
  const activeIdx = IP_ADDRESSING_MODULES.findIndex((m) => m.id === activeModule.id);
  const nextIncompleteModule =
    IP_ADDRESSING_MODULES.find((m) => !completedModuleIds.includes(m.id)) ?? IP_ADDRESSING_MODULES[0];

  // Overall ecosystem mastery stats (strict separation: verified vs practiced vs studied)
  const ecosystemStats = useMemo(() => {
    let verified = 0;
    let practiced = 0;
    let studied = 0;
    for (const node of ACADEMY_NODES) {
      const st = masteryByNodeId[node.id];
      if (st === 'verified') verified++;
      else if (st === 'practiced') practiced++;
      else if (st === 'studied') studied++;
    }
    return { verified, practiced, studied, total: ACADEMY_NODES.length };
  }, [masteryByNodeId]);

  const handleToggleRole = (roleId: string | null) => {
    if (roleId === null || roleId === selectedRoleId) {
      setSelectedRoleId(null);
      setInspectorTab('node');
      setMobileOnlyRolePath(false);
    } else {
      setSelectedRoleId(roleId);
      setInspectorTab('role');
    }
  };

  const handleSelectNode = (nodeId: string) => {
    onSelectCoursePreview(nodeId);
    setInspectorTab('node');
  };

  const gridBg = isDark ? 'academy-grid-dark' : 'academy-grid-light';

  // Helper to compute visual styling for mastery status
  const getMasteryColor = (status: MasteryStatus) => {
    if (status === 'verified') return isDark ? '#34d399' : '#059669';
    if (status === 'practiced') return isDark ? '#38bdf8' : '#0284c7';
    if (status === 'studied') return isDark ? '#fbbf24' : '#d97706';
    return isDark ? '#475569' : '#94a3b8';
  };

  const getMasteryTextClass = (status: MasteryStatus) => {
    if (status === 'verified') return 'text-emerald-700 dark:text-emerald-400';
    if (status === 'practiced') return 'text-sky-700 dark:text-sky-400';
    if (status === 'studied') return 'text-amber-700 dark:text-amber-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  /* -------------------------------------------------------------------------- */
  /* SCREEN 1: INTERACTIVE NETOPS ACADEMY ECOSYSTEM & CAREER EVOLUTION MAP      */
  /* -------------------------------------------------------------------------- */
  const renderCatalog = () => {
    const upstreamSet = new Set(inspectedNode.prerequisites);
    const downstreamSet = new Set(
      ACADEMY_NODES.filter((n) => n.prerequisites.includes(inspectedNode.id)).map((n) => n.id)
    );

    const criticalSet = new Set(selectedRole?.criticalNodeIds ?? []);
    const supportingSet = new Set(selectedRole?.supportingNodeIds ?? []);
    const roleAccent = selectedRole
      ? isDark
        ? selectedRole.accentHexDark
        : selectedRole.accentHexLight
      : isDark
        ? '#38bdf8'
        : '#1d4ed8';

    const isNodeCriticalForRole = (nodeId: string) => !selectedRole || criticalSet.has(nodeId);
    const isNodeSupportingForRole = (nodeId: string) =>
      Boolean(selectedRole) && !criticalSet.has(nodeId) && supportingSet.has(nodeId);

    const getNodeOpacity = (nodeId: string) => {
      if (!selectedRole) return 1;
      if (criticalSet.has(nodeId)) return 1;
      if (showSupportingNodes && supportingSet.has(nodeId)) return 0.62;
      return 0.2;
    };

    const regularNodes = ACADEMY_NODES.filter((n) => n.tier !== 'crosscutting');
    const securityNode = ACADEMY_NODES.find((n) => n.id === 'network-security')!;
    const monitoringNode = ACADEMY_NODES.find((n) => n.id === 'monitoring-diagnostics')!;

    // Compute dynamic viewBox for scalability zoom/focus modes
    const svgViewBox =
      mapScope === 'core'
        ? '0 0 800 580'
        : mapScope === 'evolution'
          ? '370 0 810 580'
          : '0 0 1180 580';

    // Determine connector anchor nodes from Tier 4/3 into each career fork node
    const getRoleAnchorNodes = (role: CareerRolePath): AcademyNode[] => {
      const preferredOrder = [
        'network-design',
        'cloud-virtual-net',
        'net-automation',
        'industrial-networks',
        'bgp-wan',
        'ip-telephony',
        'wireless',
        'network-services',
      ];
      const anchors: AcademyNode[] = [];
      for (const id of preferredOrder) {
        if (role.criticalNodeIds.includes(id)) {
          const found = regularNodes.find((n) => n.id === id);
          if (found) anchors.push(found);
        }
        if (anchors.length >= 2) break;
      }
      return anchors;
    };

    const inspectedRoles = getRolesUsingNode(inspectedNode.id);
    const inspectedMastery = masteryByNodeId[inspectedNode.id];

    return (
      <div className={`max-w-[1440px] mx-auto ${isMobile ? 'px-4 py-4 space-y-4' : 'px-6 lg:px-8 py-6 space-y-5'}`}>
        {/* Top Academy Ecosystem Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-blue-700 dark:text-sky-400">
                NetOps Academy
              </span>
              <span aria-hidden="true">/</span>
              <span>Экосистема развития · 18 направлений · 8 профессий</span>
            </div>
            <h1
              className={`${
                isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'
              } font-display-academy font-bold tracking-tight text-slate-900 dark:text-slate-50`}
            >
              Топология компетенций и профессиональной эволюции
            </h1>
          </div>

          {/* Authentic Mastery Summary — strictly separates verified vs practiced vs theory */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-emerald-600 dark:bg-emerald-400 inline-block" />
              Подтверждено:{' '}
              <strong className="font-mono-tech text-slate-900 dark:text-slate-100">
                {ecosystemStats.verified}/{ecosystemStats.total}
              </strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-sky-600 dark:bg-sky-400 inline-block" />
              Практика:{' '}
              <strong className="font-mono-tech text-slate-900 dark:text-slate-100">
                {ecosystemStats.practiced}
              </strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-amber-500 dark:bg-amber-400 inline-block" />
              Только теория:{' '}
              <strong className="font-mono-tech text-slate-900 dark:text-slate-100">
                {ecosystemStats.studied}
              </strong>
            </span>
          </div>
        </div>

        {/* PERSONAL CAREER PATH SELECTOR BAR (Works on both Desktop & Mobile!) */}
        <section
          aria-label="Выбор персонального пути по роли"
          className="bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-2.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Compass className="w-4 h-4 text-blue-700 dark:text-sky-400 shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Персональный путь:
              </span>
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                выберите целевую роль — на карте останутся яркими только критичные для неё навыки
              </span>
            </div>

            {selectedRole && (
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <button
                    type="button"
                    onClick={() => setShowSupportingNodes((prev) => !prev)}
                    className={`min-h-[30px] px-2.5 rounded-md border text-[11px] font-medium transition-colors inline-flex items-center gap-1.5 ${
                      showSupportingNodes
                        ? 'border-blue-600 dark:border-sky-400 bg-blue-50 dark:bg-sky-950/50 text-blue-800 dark:text-sky-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{showSupportingNodes ? 'Смежные показаны' : '+ Смежные навыки'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleToggleRole(null)}
                  className="min-h-[30px] px-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Сбросить</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => handleToggleRole(null)}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                selectedRoleId === null
                  ? 'bg-slate-900 dark:bg-sky-400 text-white dark:text-slate-950 border-slate-900 dark:border-sky-400'
                  : 'bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              Все направления (18)
            </button>

            {CAREER_ROLES.map((role) => {
              const active = selectedRoleId === role.id;
              const readiness = computeRoleReadiness(role, masteryByNodeId);
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleToggleRole(role.id)}
                  className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-all inline-flex items-center gap-2 ${
                    active
                      ? 'text-white dark:text-slate-950 shadow-sm'
                      : 'bg-white dark:bg-[#0d1626] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                  style={
                    active
                      ? {
                          backgroundColor: isDark ? role.accentHexDark : role.accentHexLight,
                          borderColor: isDark ? role.accentHexDark : role.accentHexLight,
                        }
                      : undefined
                  }
                >
                  <span>{isMobile ? role.shortTitle : role.title}</span>
                  <span
                    className={`font-mono-tech text-[10px] ${
                      active ? 'opacity-90' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {readiness.verifiedCount}/{readiness.totalCritical}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Personal Route Live Strip */}
          {selectedRole && roleReadiness && (
            <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Маршрут «{selectedRole.title}»
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {selectedRole.evolutionLabel}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono-tech">
                  Зачтено {roleReadiness.verifiedCount} из {roleReadiness.totalCritical} ({roleReadiness.verifiedPercent}%)
                </span>
                {roleReadiness.practicedCount + roleReadiness.studiedCount > 0 && (
                  <span className="text-amber-700 dark:text-amber-400 font-mono-tech">
                    · в работе: {roleReadiness.practicedCount + roleReadiness.studiedCount}
                  </span>
                )}
                <span className="text-slate-600 dark:text-slate-300 font-mono-tech">
                  · добрать: {roleReadiness.unstartedCount}
                </span>
              </div>

              {roleReadiness.nextRecommendedNode && (
                <button
                  type="button"
                  onClick={() => {
                    if (roleReadiness.nextRecommendedNode!.hasInteractiveCourse) {
                      onOpenCourse('ip-addressing');
                    } else {
                      handleSelectNode(roleReadiness.nextRecommendedNode!.id);
                    }
                  }}
                  className="font-semibold inline-flex items-center gap-1 hover:underline"
                  style={{ color: roleAccent }}
                >
                  <span>Следующий шаг: {roleReadiness.nextRecommendedNode.shortTitle}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </section>

        {/* DESKTOP INTERACTIVE TOPOLOGY + CONTEXTUAL INSPECTOR */}
        {!isMobile ? (
          <div className="grid grid-cols-12 gap-5 items-stretch">
            {/* Left 8 cols: Scalable Interactive SVG Skill & Career Evolution Blueprint */}
            <div className="col-span-8 bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
              {/* Scalability Toolbar: Scope Switcher + Zoom Controls */}
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0d1626] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {(
                    [
                      { id: 'full', label: 'Вся экосистема' },
                      { id: 'core', label: 'Ядро сетей (L1–L7)' },
                      { id: 'evolution', label: 'Развилка профессий' },
                    ] as Array<{ id: MapScope; label: string }>
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMapScope(item.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        mapScope === item.id
                          ? 'bg-slate-900 dark:bg-sky-400 text-white dark:text-slate-950'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono-tech text-slate-500 dark:text-slate-400">
                  <span className="hidden xl:inline">Масштаб</span>
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-900">
                    <button
                      type="button"
                      aria-label="Уменьшить карту"
                      onClick={() => setZoomPercent((z) => Math.max(90, z - 15))}
                      className="px-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomPercent(100)}
                      className="px-2 py-1 border-x border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {zoomPercent}%
                    </button>
                    <button
                      type="button"
                      aria-label="Увеличить карту"
                      onClick={() => setZoomPercent((z) => Math.min(145, z + 15))}
                      className="px-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tier Column Header Labels */}
              {mapScope === 'full' && (
                <div className="grid grid-cols-12 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-1.5 text-[10px] font-mono-tech text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-[#0c1424]">
                  <span className="col-span-2">01 · Фундамент</span>
                  <span className="col-span-2">02 · Ядро L2–L4</span>
                  <span className="col-span-2">03 · Маршруты и сервисы</span>
                  <span className="col-span-3">04 · Архитектура, облака, OT</span>
                  <span className="col-span-3 text-right text-blue-700 dark:text-sky-400 font-semibold">
                    05 · Эволюция профессий
                  </span>
                </div>
              )}

              {/* Interactive SVG Blueprint Canvas */}
              <div className={`relative flex-1 min-h-[530px] overflow-auto ${gridBg} p-2.5`}>
                <div style={{ width: `${zoomPercent}%`, minWidth: '100%' }}>
                  <svg
                    viewBox={svgViewBox}
                    className="w-full h-auto select-none"
                    role="img"
                    aria-label="Интерактивная топология компетенций NetOps Academy и развилка профессий"
                  >
                    {/* Subtle vertical zone divider before Career Evolution Fork */}
                    <line
                      x1="846"
                      y1="14"
                      x2="846"
                      y2="568"
                      stroke={isDark ? '#1e293b' : '#cbd5e1'}
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />

                    {/* CROSS-CUTTING TOP RAIL: NETWORK SECURITY (SEC-X) */}
                    {(() => {
                      const op = getNodeOpacity(securityNode.id);
                      const status = masteryByNodeId[securityNode.id];
                      const selected = inspectedNode.id === securityNode.id && inspectorTab === 'node';
                      const highlightedByRole = Boolean(selectedRole) && criticalSet.has(securityNode.id);
                      const strokeCol = selected
                        ? isDark
                          ? '#38bdf8'
                          : '#1d4ed8'
                        : highlightedByRole
                          ? roleAccent
                          : getMasteryColor(status);

                      return (
                        <g
                          onClick={() => handleSelectNode(securityNode.id)}
                          className="cursor-pointer transition-opacity duration-300"
                          style={{ opacity: op }}
                        >
                          {/* Vertical subtle drop-lines showing security accompanies every tier */}
                          {[96, 286, 486, 696].map((tx) => (
                            <line
                              key={`sec-drop-${tx}`}
                              x1={tx}
                              y1={64}
                              x2={tx}
                              y2={84}
                              stroke={strokeCol}
                              strokeWidth="1"
                              strokeDasharray="2 3"
                              opacity={0.45}
                            />
                          ))}
                          <rect
                            x="24"
                            y="18"
                            width="748"
                            height="46"
                            rx="8"
                            fill={
                              selected
                                ? isDark
                                  ? '#172a46'
                                  : '#eff6ff'
                                : isDark
                                  ? '#0e1729'
                                  : '#ffffff'
                            }
                            stroke={strokeCol}
                            strokeWidth={selected || highlightedByRole ? 2.2 : 1.3}
                          />
                          <rect
                            x="25"
                            y="19"
                            width={Math.max(0, (746 * masteryToPercent(status)) / 100)}
                            height="3"
                            rx="1.5"
                            fill={getMasteryColor(status)}
                          />
                          <text
                            x="38"
                            y="37"
                            fontSize="10"
                            fontFamily="JetBrains Mono, monospace"
                            fontWeight="700"
                            fill={strokeCol}
                          >
                            SEC-X · СКВОЗНОЙ ТРЕК · {masteryLabel(status).toUpperCase()}
                          </text>
                          <text
                            x="38"
                            y="54"
                            fontSize="12"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                            fontWeight="700"
                            fill={isDark ? '#f1f5f9' : '#0f172a'}
                          >
                            Сетевая безопасность
                          </text>
                          <text
                            x="215"
                            y="53"
                            fontSize="10"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                            fill={isDark ? '#94a3b8' : '#64748b'}
                          >
                            L2 Port-Sec & DAI → L3 ACL & Firewall → IPSec / 802.1X → Zero Trust & OT IDMZ
                          </text>
                        </g>
                      );
                    })()}

                    {/* CROSS-CUTTING BOTTOM RAIL: MONITORING & DIAGNOSTICS (OPS-X) */}
                    {(() => {
                      const op = getNodeOpacity(monitoringNode.id);
                      const status = masteryByNodeId[monitoringNode.id];
                      const selected = inspectedNode.id === monitoringNode.id && inspectorTab === 'node';
                      const highlightedByRole = Boolean(selectedRole) && criticalSet.has(monitoringNode.id);
                      const strokeCol = selected
                        ? isDark
                          ? '#38bdf8'
                          : '#1d4ed8'
                        : highlightedByRole
                          ? roleAccent
                          : getMasteryColor(status);

                      return (
                        <g
                          onClick={() => handleSelectNode(monitoringNode.id)}
                          className="cursor-pointer transition-opacity duration-300"
                          style={{ opacity: op }}
                        >
                          {[96, 286, 486, 696].map((tx) => (
                            <line
                              key={`ops-rise-${tx}`}
                              x1={tx}
                              y1={496}
                              x2={tx}
                              y2={514}
                              stroke={strokeCol}
                              strokeWidth="1"
                              strokeDasharray="2 3"
                              opacity={0.45}
                            />
                          ))}
                          <rect
                            x="24"
                            y="514"
                            width="748"
                            height="46"
                            rx="8"
                            fill={
                              selected
                                ? isDark
                                  ? '#172a46'
                                  : '#eff6ff'
                                : isDark
                                  ? '#0e1729'
                                  : '#ffffff'
                            }
                            stroke={strokeCol}
                            strokeWidth={selected || highlightedByRole ? 2.2 : 1.3}
                          />
                          <rect
                            x="25"
                            y="515"
                            width={Math.max(0, (746 * masteryToPercent(status)) / 100)}
                            height="3"
                            rx="1.5"
                            fill={getMasteryColor(status)}
                          />
                          <text
                            x="38"
                            y="533"
                            fontSize="10"
                            fontFamily="JetBrains Mono, monospace"
                            fontWeight="700"
                            fill={strokeCol}
                          >
                            OPS-X · СКВОЗНОЙ ТРЕК · {masteryLabel(status).toUpperCase()}
                          </text>
                          <text
                            x="38"
                            y="550"
                            fontSize="12"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                            fontWeight="700"
                            fill={isDark ? '#f1f5f9' : '#0f172a'}
                          >
                            Мониторинг и диагностика
                          </text>
                          <text
                            x="232"
                            y="549"
                            fontSize="10"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                            fill={isDark ? '#94a3b8' : '#64748b'}
                          >
                            ping / ARP → Wireshark & tcpdump → SNMP / NetFlow → gNMI Telemetry & SLO
                          </text>
                        </g>
                      );
                    })()}

                    {/* DEPENDENCY CURVES BETWEEN CORE NETWORKING NODES */}
                    {ACADEMY_EDGES.map((edge) => {
                      const from = regularNodes.find((n) => n.id === edge.from);
                      const to = regularNodes.find((n) => n.id === edge.to);
                      if (!from || !to) return null;

                      const x1 = from.mapPos.x + 70;
                      const y1 = from.mapPos.y;
                      const x2 = to.mapPos.x - 70;
                      const y2 = to.mapPos.y;
                      const cx1 = x1 + (x2 - x1) * 0.46;
                      const cx2 = x2 - (x2 - x1) * 0.46;

                      const bothCritical =
                        Boolean(selectedRole) &&
                        criticalSet.has(edge.from) &&
                        criticalSet.has(edge.to);
                      const touchesSelectedNode =
                        !selectedRole &&
                        (edge.from === inspectedNode.id || edge.to === inspectedNode.id);
                      const fromVerified = masteryByNodeId[edge.from] === 'verified';

                      const edgeOpacity = selectedRole
                        ? bothCritical
                          ? 0.95
                          : 0.12
                        : touchesSelectedNode
                          ? 1
                          : 0.65;

                      const strokeColor = bothCritical
                        ? roleAccent
                        : touchesSelectedNode
                          ? isDark
                            ? '#38bdf8'
                            : '#1d4ed8'
                          : fromVerified
                            ? isDark
                              ? '#10b981'
                              : '#059669'
                            : isDark
                              ? '#334155'
                              : '#cbd5e1';

                      return (
                        <path
                          key={`${edge.from}-${edge.to}`}
                          d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={bothCritical || touchesSelectedNode ? 2.4 : 1.3}
                          strokeDasharray={
                            bothCritical || touchesSelectedNode || fromVerified ? undefined : '4 4'
                          }
                          className="transition-opacity duration-300"
                          style={{ opacity: edgeOpacity }}
                        />
                      );
                    })}

                    {/* EVOLUTION FORK CURVES (Connecting network graph to the 8 Career Roles) */}
                    {CAREER_ROLES.map((role) => {
                      const isRoleSelected = selectedRoleId === role.id;
                      const anchors = getRoleAnchorNodes(role);
                      const forkX = 880;
                      const forkY = role.forkY;
                      const accent = isDark ? role.accentHexDark : role.accentHexLight;

                      // When no role is selected, show subtle clean fan lines; when one role is selected, illuminate its links and dim others
                      const lineOpacity = selectedRoleId
                        ? isRoleSelected
                          ? 0.95
                          : 0.08
                        : 0.32;

                      return (
                        <g key={`fork-links-${role.id}`} className="transition-opacity duration-300" style={{ opacity: lineOpacity }}>
                          {anchors.map((anchor) => {
                            const x1 = anchor.mapPos.x + 70;
                            const y1 = anchor.mapPos.y;
                            const cx1 = x1 + (forkX - x1) * 0.45;
                            const cx2 = forkX - (forkX - x1) * 0.4;
                            return (
                              <path
                                key={`${anchor.id}-${role.id}`}
                                d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${forkY}, ${forkX} ${forkY}`}
                                fill="none"
                                stroke={isRoleSelected ? accent : isDark ? '#475569' : '#94a3b8'}
                                strokeWidth={isRoleSelected ? 2.4 : 1.2}
                                strokeDasharray={isRoleSelected ? undefined : '3 4'}
                              />
                            );
                          })}
                          {/* Also connect top/bottom cross-cutting spine subtly when role is active */}
                          {isRoleSelected && role.criticalNodeIds.includes('network-security') && (
                            <path
                              d={`M 772 41 C 830 41, 835 ${forkY}, ${forkX} ${forkY}`}
                              fill="none"
                              stroke={accent}
                              strokeWidth="1.8"
                              strokeDasharray="4 3"
                              opacity={0.75}
                            />
                          )}
                          {isRoleSelected && role.criticalNodeIds.includes('monitoring-diagnostics') && (
                            <path
                              d={`M 772 537 C 830 537, 835 ${forkY}, ${forkX} ${forkY}`}
                              fill="none"
                              stroke={accent}
                              strokeWidth="1.8"
                              strokeDasharray="4 3"
                              opacity={0.75}
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* INTERACTIVE NETWORK ENGINEERING NODES (16 core/advanced nodes) */}
                    {regularNodes.map((node) => {
                      const status = masteryByNodeId[node.id];
                      const pct = masteryToPercent(status);
                      const isSelectedNode = inspectedNode.id === node.id && inspectorTab === 'node';
                      const isRecommended = node.id === recommendedNodeId;
                      const isRelated = upstreamSet.has(node.id) || downstreamSet.has(node.id);
                      const nodeOpacity = getNodeOpacity(node.id);
                      const isCritical = isNodeCriticalForRole(node.id);
                      const isSupporting = isNodeSupportingForRole(node.id);

                      const fillBg = isSelectedNode
                        ? isDark
                          ? '#172a46'
                          : '#eff6ff'
                        : selectedRole && isCritical
                          ? isDark
                            ? '#122139'
                            : '#ffffff'
                          : isDark
                            ? '#0e1729'
                            : '#ffffff';

                      const strokeColor = isSelectedNode
                        ? isDark
                          ? '#38bdf8'
                          : '#1d4ed8'
                        : selectedRole && isCritical
                          ? roleAccent
                          : status === 'verified'
                            ? isDark
                              ? '#10b981'
                              : '#059669'
                            : isRecommended
                              ? isDark
                                ? '#f59e0b'
                                : '#d97706'
                              : isRelated && !selectedRole
                                ? isDark
                                  ? '#64748b'
                                  : '#94a3b8'
                                : isDark
                                  ? '#1e293b'
                                  : '#cbd5e1';

                      const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
                      const textMuted = isDark ? '#94a3b8' : '#64748b';
                      const masteryBarColor = getMasteryColor(status);

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.mapPos.x - 70}, ${node.mapPos.y - 31})`}
                          onClick={() => handleSelectNode(node.id)}
                          onDoubleClick={() =>
                            node.hasInteractiveCourse && onOpenCourse('ip-addressing')
                          }
                          className="cursor-pointer transition-opacity duration-300"
                          style={{ opacity: nodeOpacity }}
                        >
                          {/* Subtle crisp halo ring when node is critical on an active personal path */}
                          {selectedRole && isCritical && (
                            <rect
                              x="-3"
                              y="-3"
                              width="146"
                              height="68"
                              rx="10"
                              fill="none"
                              stroke={roleAccent}
                              strokeWidth="1.2"
                              opacity={0.35}
                            />
                          )}

                          <rect
                            width="140"
                            height="62"
                            rx="8"
                            fill={fillBg}
                            stroke={strokeColor}
                            strokeWidth={
                              isSelectedNode || (selectedRole && isCritical) ? 2.1 : 1.25
                            }
                            strokeDasharray={
                              isSupporting && showSupportingNodes
                                ? '4 3'
                                : status === 'studied' && !selectedRole
                                  ? '5 2'
                                  : undefined
                            }
                          />

                          {/* Top mastery progress hairline */}
                          <rect
                            x="1"
                            y="1"
                            width={Math.max(0, (138 * pct) / 100)}
                            height="3"
                            rx="1.5"
                            fill={masteryBarColor}
                          />

                          {/* Top code + mastery status dot/label */}
                          <text
                            x="9"
                            y="19"
                            fontSize="9"
                            fontFamily="JetBrains Mono, monospace"
                            fill={
                              status === 'verified'
                                ? isDark
                                  ? '#34d399'
                                  : '#059669'
                                : status === 'studied'
                                  ? isDark
                                    ? '#fbbf24'
                                    : '#b45309'
                                  : textMuted
                            }
                            fontWeight="600"
                          >
                            {node.code} · {masteryLabel(status)}
                          </text>

                          {/* Main short title */}
                          <text
                            x="9"
                            y="37"
                            fontSize="11"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                            fill={textPrimary}
                            fontWeight="700"
                          >
                            {node.shortTitle}
                          </text>

                          {/* Footer: difficulty + access format */}
                          <text
                            x="9"
                            y="52"
                            fontSize="9"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                            fill={textMuted}
                          >
                            {node.hasInteractiveCourse
                              ? 'Интерактивный курс · 6 шагов'
                              : `${node.difficulty} · ${node.accessLabel}`}
                          </text>
                        </g>
                      );
                    })}

                    {/* RIGHT COLUMN: CAREER EVOLUTION FORK (8 target professions) */}
                    {CAREER_ROLES.map((role) => {
                      const isActive = selectedRoleId === role.id;
                      const readiness = computeRoleReadiness(role, masteryByNodeId);
                      const accent = isDark ? role.accentHexDark : role.accentHexLight;
                      const opacity = selectedRoleId ? (isActive ? 1 : 0.24) : 1;

                      return (
                        <g
                          key={role.id}
                          transform={`translate(880, ${role.forkY - 26})`}
                          onClick={() => handleToggleRole(role.id)}
                          className="cursor-pointer transition-opacity duration-300"
                          style={{ opacity }}
                        >
                          <rect
                            width="274"
                            height="52"
                            rx="8"
                            fill={
                              isActive
                                ? isDark
                                  ? '#172943'
                                  : '#eff6ff'
                                : isDark
                                  ? '#0e1729'
                                  : '#ffffff'
                            }
                            stroke={isActive ? accent : isDark ? '#25354f' : '#cbd5e1'}
                            strokeWidth={isActive ? 2.2 : 1.2}
                          />
                          {/* Left accent bar inside role fork node (thin 3px integrated strip) */}
                          <rect
                            x="0.5"
                            y="6"
                            width="3"
                            height="40"
                            rx="1.5"
                            fill={accent}
                          />
                          <text
                            x="12"
                            y="20"
                            fontSize="11.5"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                            fontWeight="700"
                            fill={isDark ? '#f1f5f9' : '#0f172a'}
                          >
                            {role.title}
                          </text>
                          <text
                            x="12"
                            y="36"
                            fontSize="9.5"
                            fontFamily="JetBrains Mono, monospace"
                            fill={isDark ? '#94a3b8' : '#64748b'}
                          >
                            {role.evolutionLabel} · база {readiness.verifiedPercent}%
                          </text>
                          {/* Compact verified vs gap bar */}
                          <rect
                            x="12"
                            y="43"
                            width="248"
                            height="3"
                            rx="1.5"
                            fill={isDark ? '#1e293b' : '#e2e8f0'}
                          />
                          <rect
                            x="12"
                            y="43"
                            width={Math.max(0, (248 * readiness.exposurePercent) / 100)}
                            height="3"
                            rx="1.5"
                            fill={isDark ? '#f59e0b' : '#fbbf24'}
                            opacity={0.55}
                          />
                          <rect
                            x="12"
                            y="43"
                            width={Math.max(0, (248 * readiness.verifiedPercent) / 100)}
                            height="3"
                            rx="1.5"
                            fill={accent}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Legend & Verification Honesty Footer */}
              <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0d1626] flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                <span>
                  {selectedRole
                    ? `Подсвечены ${selectedRole.criticalNodeIds.length} критичных узлов роли «${selectedRole.title}» — остальные приглушены`
                    : 'Кликните по узлу для разбора компетенции или по роли справа — чтобы выделить персональный путь'}
                </span>
                <div className="flex flex-wrap items-center gap-3 font-mono-tech">
                  <span className="text-emerald-700 dark:text-emerald-400">■ Подтверждено</span>
                  <span className="text-sky-700 dark:text-sky-400">■ Практика</span>
                  <span className="text-amber-700 dark:text-amber-400">⬚ Только теория</span>
                  <span className="text-slate-500 dark:text-slate-400">□ Не начато</span>
                </div>
              </div>
            </div>

            {/* Right 4 cols: Dual-Mode Engineering Inspector (Node Dossier / Personal Role Route) */}
            <aside className="col-span-4 bg-white dark:bg-[#111b2e] border border-slate-300/90 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
              {/* Inspector Mode Switcher when a role is active */}
              {selectedRole && (
                <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setInspectorTab('role')}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${
                      inspectorTab === 'role'
                        ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Маршрут роли
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab('node')}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${
                      inspectorTab === 'node'
                        ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Узел · {inspectedNode.code}
                  </button>
                </div>
              )}

              {inspectorTab === 'role' && selectedRole && roleReadiness ? (
                /* ---------------- ROLE TRANSITION & PERSONAL PATH DOSSIER ---------------- */
                <div className="space-y-4 flex-1 overflow-y-auto">
                  <div className="space-y-1.5">
                    <div
                      className="text-xs font-mono-tech font-semibold"
                      style={{ color: roleAccent }}
                    >
                      {selectedRole.code} · {selectedRole.evolutionLabel}
                    </div>
                    <h2 className="text-2xl font-display-academy font-bold text-slate-900 dark:text-slate-50">
                      {selectedRole.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedRole.description}
                    </p>
                  </div>

                  {/* Verified vs Exposure Honest Progress Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0d1626] border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Переносимая подтверждённая база
                      </span>
                      <span
                        className="font-mono-tech text-lg font-bold"
                        style={{ color: roleAccent }}
                      >
                        {roleReadiness.verifiedPercent}%
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-600 dark:bg-emerald-400 transition-all"
                        style={{
                          width: `${(roleReadiness.verifiedCount / roleReadiness.totalCritical) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-sky-500 dark:bg-sky-400 transition-all"
                        style={{
                          width: `${(roleReadiness.practicedCount / roleReadiness.totalCritical) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-amber-400/80 transition-all"
                        style={{
                          width: `${(roleReadiness.studiedCount / roleReadiness.totalCritical) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono-tech">
                      <div>
                        <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                          {roleReadiness.verifiedCount} зачтено
                        </div>
                        <div className="text-slate-500">экзамен ≥80%</div>
                      </div>
                      <div>
                        <div className="text-amber-700 dark:text-amber-400 font-bold">
                          {roleReadiness.practicedCount + roleReadiness.studiedCount} в работе
                        </div>
                        <div className="text-slate-500">без аттестации</div>
                      </div>
                      <div>
                        <div className="text-slate-800 dark:text-slate-200 font-bold">
                          {roleReadiness.unstartedCount} добрать
                        </div>
                        <div className="text-slate-500">новые модули</div>
                      </div>
                    </div>

                    {roleReadiness.studiedCount > 0 && (
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 pt-1.5 border-t border-slate-200 dark:border-slate-800 leading-snug">
                        Прочитанные уроки без практики и аттестации не засчитываются в квалификацию роли.
                      </p>
                    )}
                  </div>

                  {/* Critical Competencies Checklist */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Критичные компетенции пути ({selectedRole.criticalNodeIds.length})
                    </div>
                    <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                      {selectedRole.criticalNodeIds.map((nid) => {
                        const node = ACADEMY_NODES.find((n) => n.id === nid);
                        if (!node) return null;
                        const st = masteryByNodeId[node.id];
                        return (
                          <button
                            key={node.id}
                            type="button"
                            onClick={() => handleSelectNode(node.id)}
                            className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-2"
                          >
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                              <span className="font-mono-tech text-[10px] text-slate-400 mr-1.5">
                                {node.code}
                              </span>
                              {node.shortTitle}
                            </span>
                            <span className={`font-mono-tech text-[10px] font-semibold shrink-0 ${getMasteryTextClass(st)}`}>
                              {masteryLabel(st)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Bridge Skills Beyond Core Networking */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Дополнительный мост в профессию
                    </div>
                    <ul className="space-y-1.5">
                      {selectedRole.bridgeSkills.map((skill) => (
                        <li
                          key={skill}
                          className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-snug"
                        >
                          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: roleAccent }} />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                /* ---------------- INDIVIDUAL NODE COMPETENCY DOSSIER ---------------- */
                <div className="space-y-4 flex-1 overflow-y-auto">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono-tech">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      {inspectedNode.code} · {inspectedNode.tierLabel}
                    </span>
                    <span className={`font-semibold ${getMasteryTextClass(inspectedMastery)}`}>
                      {masteryLabel(inspectedMastery)}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-display-academy font-bold text-slate-900 dark:text-slate-50">
                      {inspectedNode.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5">
                      {inspectedNode.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span>{inspectedNode.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>{inspectedNode.durationLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        inspectedNode.accessFormat === 'pro_lab'
                          ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'text-emerald-700 dark:text-emerald-400 font-medium'
                      }
                    >
                      {inspectedNode.accessLabel}
                    </span>
                  </div>

                  {/* Why It Matters */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0d1626] border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Зачем инженеру эта компетенция
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {inspectedNode.whyItMatters}
                    </p>
                  </div>

                  {/* Verification Honesty Indicator */}
                  {inspectedMastery === 'studied' && (
                    <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-snug">
                      <strong>Только теория:</strong> уроки просмотрены, но компетенция ещё не подтверждена на стенде и итоговом тесте (≥80%).
                    </div>
                  )}

                  {/* Cross-cutting progression stages for Security & Diagnostics */}
                  {inspectedNode.crosscuttingStages && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Как развивается на всех этапах карьеры
                      </div>
                      <ul className="space-y-1">
                        {inspectedNode.crosscuttingStages.map((stage) => (
                          <li
                            key={stage}
                            className="text-xs font-mono-tech text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 rounded border border-slate-200/80 dark:border-slate-800"
                          >
                            {stage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prerequisites (clickable!) */}
                  <div className="space-y-1.5 text-xs">
                    <div className="text-slate-500 dark:text-slate-400 font-medium">
                      Опирается на:
                    </div>
                    {inspectedNode.prerequisites.length === 0 ? (
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        Стартовая точка — предварительная подготовка не требуется
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {inspectedNode.prerequisites.map((pid) => {
                          const pre = ACADEMY_NODES.find((n) => n.id === pid);
                          if (!pre) return null;
                          return (
                            <button
                              key={pid}
                              type="button"
                              onClick={() => handleSelectNode(pid)}
                              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-blue-600 dark:hover:border-sky-400 transition-colors"
                            >
                              {pre.code} · {pre.shortTitle}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Shared Competencies Across Professions */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Востребовано в профессиях ({inspectedRoles.length} из {CAREER_ROLES.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectedRoles.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleToggleRole(r.id)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                            selectedRoleId === r.id
                              ? 'bg-slate-900 dark:bg-sky-400 text-white dark:text-slate-950 border-slate-900 dark:border-sky-400'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-600 dark:hover:border-sky-400'
                          }`}
                        >
                          {r.shortTitle}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Engineering Outcomes */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Подтверждаемый результат
                    </div>
                    <ul className="space-y-1.5">
                      {inspectedNode.outcomes.map((o) => (
                        <li
                          key={o}
                          className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-snug"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 dark:text-sky-400 shrink-0 mt-0.5" />
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Inspector Primary Actions */}
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                {inspectorTab === 'role' && selectedRole && roleReadiness ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenCourse('ip-addressing')}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-lg text-white dark:text-slate-950 text-sm font-semibold transition-opacity hover:opacity-90 inline-flex items-center justify-center gap-2"
                      style={{ backgroundColor: roleAccent }}
                    >
                      <span>Открыть ключевой узел NET-05 · IP-адресация</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleRole(null)}
                      className="w-full min-h-[38px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      Вернуться к полной карте экосистемы
                    </button>
                  </>
                ) : inspectedNode.hasInteractiveCourse ? (
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
                      className="w-full min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      {completedModuleIds.length > 0
                        ? `Продолжить сразу · Точка ${nextIncompleteModule.index}`
                        : 'Перейти сразу к Точке 1'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Демонстрационный узел экосистемы. Полное прохождение с тренажёрами и аттестацией открыто в <strong className="text-slate-800 dark:text-slate-200">NET-05 · IP-адресация</strong>.
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
          /* ================================================================== */
          /* MOBILE 390px ADAPTIVE METRO-ROUTE + PERSONAL PATH HIGHLIGHTING     */
          /* ================================================================== */
          <div className="space-y-4">
            {/* Active Personal Path Readiness Card on Mobile */}
            {selectedRole && roleReadiness ? (
              <div className="bg-white dark:bg-[#111b2e] border border-slate-300 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs font-mono-tech">
                  <span className="font-semibold" style={{ color: roleAccent }}>
                    {selectedRole.evolutionLabel}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Зачтено {roleReadiness.verifiedPercent}%
                  </span>
                </div>
                <div className="text-lg font-display-academy font-bold text-slate-900 dark:text-slate-100">
                  {selectedRole.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedRole.tagline}
                </p>

                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-600 dark:bg-emerald-400"
                    style={{
                      width: `${(roleReadiness.verifiedCount / roleReadiness.totalCritical) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-amber-400/80"
                    style={{
                      width: `${((roleReadiness.practicedCount + roleReadiness.studiedCount) / roleReadiness.totalCritical) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] font-mono-tech text-slate-600 dark:text-slate-400">
                  <span>Подтв.: {roleReadiness.verifiedCount}/{roleReadiness.totalCritical}</span>
                  <span>Добрать: {roleReadiness.unstartedCount}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setMobileOnlyRolePath((prev) => !prev)}
                    className="min-h-[42px] px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {mobileOnlyRolePath ? 'Показать все' : 'Только мой путь'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenCourse('ip-addressing')}
                    className="min-h-[42px] px-3 rounded-lg text-white dark:text-slate-950 text-xs font-semibold inline-flex items-center justify-center gap-1"
                    style={{ backgroundColor: roleAccent }}
                  >
                    <span>К NET-05</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Quick Focus Card when no career filter is active */
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
            )}

            {/* Cross-Cutting Tracks Mobile Strip */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono-tech font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Сквозные дисциплины (сопровождают каждый этап)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[securityNode, monitoringNode].map((track) => {
                  const st = masteryByNodeId[track.id];
                  const critical = isNodeCriticalForRole(track.id);
                  const dimmed = Boolean(selectedRole) && !critical;
                  if (mobileOnlyRolePath && dimmed) return null;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() =>
                        onSelectCoursePreview(inspectedNode.id === track.id ? null : track.id)
                      }
                      className={`p-3 rounded-xl border text-left transition-opacity duration-300 bg-white dark:bg-[#111b2e] ${
                        dimmed
                          ? 'opacity-30 border-slate-200 dark:border-slate-800'
                          : selectedRole && critical
                            ? 'border-blue-600 dark:border-sky-400'
                            : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 text-[10px] font-mono-tech">
                        <span className="text-slate-500 dark:text-slate-400">{track.code}</span>
                        {track.id === 'network-security' ? (
                          <Shield className="w-3.5 h-3.5 text-blue-700 dark:text-sky-400" />
                        ) : (
                          <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                        {track.shortTitle}
                      </div>
                      <div className={`text-[10px] font-mono-tech mt-1 font-semibold ${getMasteryTextClass(st)}`}>
                        {masteryLabel(st)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vertical Connected Metro-Route Topology */}
            <div className="relative pl-5 space-y-2.5">
              <div
                className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-300 dark:bg-slate-700"
                aria-hidden="true"
              />
              {regularNodes.map((node) => {
                const st = masteryByNodeId[node.id];
                const critical = isNodeCriticalForRole(node.id);
                const dimmed = Boolean(selectedRole) && !critical;
                if (mobileOnlyRolePath && dimmed) return null;

                const expanded = inspectedNode.id === node.id;
                const rolesCount = getRolesUsingNode(node.id).length;

                return (
                  <div
                    key={node.id}
                    className={`relative transition-opacity duration-300 ${dimmed ? 'opacity-30' : 'opacity-100'}`}
                  >
                    <span
                      className={`absolute -left-[15px] top-4 w-3 h-3 rounded-full border-2 ${
                        st === 'verified'
                          ? 'bg-emerald-600 border-emerald-600'
                          : st === 'practiced'
                            ? 'bg-sky-600 border-sky-600'
                            : st === 'studied'
                              ? 'bg-amber-400 border-amber-500'
                              : selectedRole && critical
                                ? 'bg-blue-700 dark:bg-sky-400 border-blue-700 dark:border-sky-400'
                                : 'bg-white dark:bg-[#0b1220] border-slate-400 dark:border-slate-600'
                      }`}
                    />

                    <div
                      className={`bg-white dark:bg-[#111b2e] border rounded-xl overflow-hidden ${
                        selectedRole && critical
                          ? 'border-blue-600/80 dark:border-sky-400/80'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          node.hasInteractiveCourse
                            ? onOpenCourse('ip-addressing')
                            : onSelectCoursePreview(expanded ? null : node.id)
                        }
                        className="w-full min-h-[58px] p-3.5 text-left flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-mono-tech text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span>{node.code}</span>
                            <span>·</span>
                            <span className={`font-semibold ${getMasteryTextClass(st)}`}>
                              {masteryLabel(st)}
                            </span>
                            <span>·</span>
                            <span>{node.accessLabel}</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                            {node.title}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>

                      {expanded && !node.hasInteractiveCourse && (
                        <div className="px-3.5 pb-3.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {node.whyItMatters}
                          </p>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Открывает доступ к <strong>{rolesCount}</strong> ролям из {CAREER_ROLES.length}
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenCourse('ip-addressing')}
                            className="w-full min-h-[42px] rounded-lg bg-slate-900 dark:bg-sky-400 text-white dark:text-slate-950 text-xs font-semibold"
                          >
                            Открыть интерактивный NET-05 · IP-адресация
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Career Evolution Fork Section */}
            <div className="pt-2 space-y-2.5">
              <div className="text-xs font-mono-tech font-semibold text-blue-700 dark:text-sky-400">
                05 · Развилка профессиональной эволюции
              </div>
              <div className="grid grid-cols-1 gap-2">
                {CAREER_ROLES.map((role) => {
                  const readiness = computeRoleReadiness(role, masteryByNodeId);
                  const active = selectedRoleId === role.id;
                  const accent = isDark ? role.accentHexDark : role.accentHexLight;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleToggleRole(role.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all bg-white dark:bg-[#111b2e] space-y-1.5 ${
                        active
                          ? 'border-blue-600 dark:border-sky-400'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {role.title}
                        </span>
                        <span className="font-mono-tech text-xs font-bold" style={{ color: accent }}>
                          {readiness.verifiedPercent}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {role.evolutionLabel} · зачтено {readiness.verifiedCount} из {readiness.totalCritical}
                      </div>
                    </button>
                  );
                })}
              </div>
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
          <span>Назад к топологии NetOps Academy</span>
        </button>

        {/* Dependency chain strip */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono-tech text-xs text-slate-500 dark:text-slate-400">
          <span>NET-03 OSI/TCP-IP</span>
          <ArrowRight className="w-3 h-3" />
          <span className="font-bold text-blue-700 dark:text-sky-400">NET-05 IP-адресация</span>
          <ArrowRight className="w-3 h-3" />
          <span>NET-07 Маршрутизация</span>
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
              Узел NET-05 · Углублённый · 6 контрольных точек · ~2,5 ч · Статус:{' '}
              {masteryLabel(masteryByNodeId['ip-addressing'])}
            </div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'} font-display-academy font-bold tracking-tight text-slate-900 dark:text-slate-50`}>
              IP-адресация
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Ключевой узел всех 8 профессий экосистемы: маски CIDR, диапазоны RFC 1918 и APIPA, точный расчёт хостов и автонастройка IPv6 SLAAC.
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
              Засчитывается сразу в 8 профессиях
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Сетевой архитектор · Cloud · DevOps · SRE · NetSec · OT
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Подтверждение узла (≥80%) автоматически засчитывается как выполненная компетенция во всех смежных маршрутах.
            </p>
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
          {/* Left Rail: Route Navigator */}
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
                  {isDone ? 'Изучено' : 'Активный шаг'}
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
              {isDone ? 'Изучено' : 'Отметить'}
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
  /* SCREEN 4: EXAM & NODE VERIFICATION                                         */
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
          Аттестация NET-05 → подтверждение в профиле всех 8 ролей
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

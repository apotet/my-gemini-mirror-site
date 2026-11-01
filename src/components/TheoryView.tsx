import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Question } from '../types/quiz';
import { ALL_QUESTIONS, resolveImageUrl } from '../data/questionsData';
import { getQuestionDeepDive, QuestionDeepDive } from '../data/questionExplanations';
import {
  BookOpen,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Hash,
  Terminal,
  Activity,
  Cpu,
  Globe,
  Repeat,
  Shield,
  HelpCircle,
  BookmarkCheck,
  Zap,
} from 'lucide-react';

interface TheoryViewProps {
  initialQuestionId?: string | null;
  onNavigateToIpv4: (prefix?: number, mode?: 'calc' | 'trainer') => void;
  onClearInitialQuestion?: () => void;
}

type TheorySection = 'questions' | 'handbook' | 'ports' | 'subnet-table';

export const TheoryView: React.FC<TheoryViewProps> = ({
  initialQuestionId,
  onNavigateToIpv4,
  onClearInitialQuestion,
}) => {
  const [activeSection, setActiveSection] = useState<TheorySection>('questions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [ipv4Only, setIpv4Only] = useState<boolean>(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [lastMistakeIds, setLastMistakeIds] = useState<string[]>([]);
  const targetCardRef = useRef<HTMLDivElement | null>(null);

  // Load last mistakes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('osi_last_mistakes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setLastMistakeIds(parsed);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // When initialQuestionId is provided from mistakes review
  useEffect(() => {
    if (initialQuestionId) {
      setActiveSection('questions');
      setSelectedCategory('all');
      setSearchQuery('');
      setExpandedQuestions((prev) => ({
        ...prev,
        [initialQuestionId]: true,
      }));

      // Smooth scroll to the question card
      setTimeout(() => {
        if (targetCardRef.current) {
          targetCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [initialQuestionId]);

  const toggleExpand = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    filteredQuestions.slice(0, 50).forEach((q) => {
      allIds[q.id] = true;
    });
    setExpandedQuestions(allIds);
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return ALL_QUESTIONS.filter((q) => {
      // Mistake filter
      if (selectedCategory === 'mistakes') {
        if (!lastMistakeIds.includes(q.id)) return false;
      } else if (selectedCategory !== 'all') {
        if (selectedCategory === 'l1' && !(q.group === 'l1-l2' && (q.topic.includes('L1') || q.topic.includes('Оптика')))) return false;
        if (selectedCategory === 'l2' && !(q.group === 'l1-l2' && !q.topic.includes('L1') && !q.topic.includes('Оптика'))) return false;
        if (selectedCategory === 'l3' && q.group !== 'l3') return false;
        if (selectedCategory === 'l4' && q.group !== 'l4') return false;
        if (selectedCategory === 'l5-l7' && q.group !== 'l5-l7') return false;
        if (selectedCategory === 'tcpip' && q.group !== 'tcpip') return false;
        if (selectedCategory === 'troubleshooting' && q.group !== 'troubleshooting') return false;
        if (selectedCategory === 'visual' && q.group !== 'visual-l1') return false;
      }

      // IPv4 trainer link only filter
      if (ipv4Only) {
        const deepDive = getQuestionDeepDive(q);
        if (!deepDive.ipv4Practice?.enabled) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inId = q.id.toLowerCase().includes(query);
        const inText = q.text.toLowerCase().includes(query);
        const inTopic = q.topic.toLowerCase().includes(query);
        const inAnswers = q.answers.some((a) => a.toLowerCase().includes(query));
        const inExpl = q.explanation.toLowerCase().includes(query);
        return inId || inText || inTopic || inAnswers || inExpl;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, ipv4Only, lastMistakeIds]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            Учебный раздел · Теория и разборы
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Теория сетевых моделей и разборы всех 502 вопросов
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Качественный разбор вопросов тренажёра: суть концепции, логика работы протокола под капотом,
            разбор типичных ошибок и интерактивная отработка расчетных задач в IPv4-тренажёре.
          </p>

          {/* Quick Stats & Action Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Всего вопросов</span>
              <span className="text-lg font-black text-cyan-400 font-mono">502</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Уровней OSI</span>
              <span className="text-lg font-black text-blue-400 font-mono">7 уровней</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Связка с IPv4</span>
              <span className="text-lg font-black text-emerald-400 font-mono">Тренажёр масок</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Ошибок в памяти</span>
              <span className="text-lg font-black text-amber-400 font-mono">
                {lastMistakeIds.length} вопр.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Question Highlight Banner if navigated from Mistakes */}
      {initialQuestionId && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-900 border border-cyan-400/50 shadow-lg shadow-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-mono font-bold text-xs shrink-0">
              #{initialQuestionId}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Фокус на вопросе из вашей работы над ошибками
              </span>
              <span className="text-[11px] text-slate-300">
                Карточка вопроса развернута ниже с подробным разбором сути и ловушек.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onClearInitialQuestion) onClearInitialQuestion();
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer shrink-0 transition-colors self-start sm:self-auto"
          >
            Показать весь каталог вопросов
          </button>
        </div>
      )}

      {/* Main Section Navigation (Questions Catalog vs Course Handbook vs Ports vs Subnet Table) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/70 border border-slate-800 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSection('questions')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeSection === 'questions'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Разборы вопросов ({filteredQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('handbook')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeSection === 'handbook'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>7 Уровней OSI и стек TCP/IP</span>
        </button>

        <button
          onClick={() => setActiveSection('ports')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeSection === 'ports'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>Таблица портов (Well-Known)</span>
        </button>

        <button
          onClick={() => setActiveSection('subnet-table')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeSection === 'subnet-table'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Шпаргалка масок и хостов IPv4</span>
        </button>
      </div>

      {/* SECTION 1: QUESTION DEEP DIVES CATALOG */}
      {activeSection === 'questions' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по номеру (#l3-08), тексту вопроса, термину (ARP, TTL, SYN, /26)..."
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                type="button"
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Все темы
              </button>

              {lastMistakeIds.length > 0 && (
                <button
                  onClick={() => setSelectedCategory('mistakes')}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'mistakes'
                      ? 'bg-rose-500 text-slate-950 font-black'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/40'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Мои ошибки ({lastMistakeIds.length})</span>
                </button>
              )}

              <button
                onClick={() => setSelectedCategory('l3')}
                type="button"
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'l3'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                L3 IPv4 & Маски
              </button>

              <button
                onClick={() => setSelectedCategory('l4')}
                type="button"
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'l4'
                    ? 'bg-blue-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                L4 TCP & UDP
              </button>

              <button
                onClick={() => setSelectedCategory('l2')}
                type="button"
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'l2'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                L2 Ethernet & VLAN
              </button>

              <button
                onClick={() => setSelectedCategory('l1')}
                type="button"
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'l1'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                L1 Физика & Оптика
              </button>

              <button
                onClick={() => setSelectedCategory('l5-l7')}
                type="button"
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'l5-l7'
                    ? 'bg-pink-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                L5–L7 DNS, DHCP, HTTP
              </button>

              <button
                onClick={() => setSelectedCategory('troubleshooting')}
                type="button"
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'troubleshooting'
                    ? 'bg-lime-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Диагностика & CLI
              </button>

              <button
                onClick={() => setSelectedCategory('visual')}
                type="button"
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'visual'
                    ? 'bg-indigo-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Фото оборудования (L1)
              </button>
            </div>

            {/* Subnet Practice toggle & Expand controls */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={ipv4Only}
                  onChange={(e) => setIpv4Only(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-cyan-300">
                  ⚡ Только с переходом в IPv4-тренажёр (расчет масок/хостов)
                </span>
              </label>

              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <button
                  onClick={expandAll}
                  type="button"
                  className="hover:text-cyan-400 cursor-pointer transition-colors"
                >
                  Развернуть первые 50
                </button>
                <span>•</span>
                <button
                  onClick={collapseAll}
                  type="button"
                  className="hover:text-cyan-400 cursor-pointer transition-colors"
                >
                  Свернуть все
                </button>
              </div>
            </div>
          </div>

          {/* Questions List */}
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel border border-slate-800 space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">Ничего не найдено</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Попробуйте изменить поисковый запрос или сбросить фильтры категорий.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setIpv4Only(false);
                }}
                type="button"
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer hover:brightness-110"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.slice(0, 100).map((q) => {
                const isExpanded = !!expandedQuestions[q.id];
                const isTarget = q.id === initialQuestionId;
                const isMistake = lastMistakeIds.includes(q.id);
                const deepDive = getQuestionDeepDive(q);

                return (
                  <div
                    key={q.id}
                    ref={isTarget ? targetCardRef : undefined}
                    className={`rounded-2xl transition-all duration-300 border overflow-hidden ${
                      isTarget
                        ? 'bg-slate-900/90 border-cyan-400 ring-2 ring-cyan-400/50 shadow-2xl shadow-cyan-500/20'
                        : isMistake
                        ? 'bg-slate-900/60 border-rose-500/30 hover:border-rose-400/50'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpand(q.id)}
                      className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/60 text-cyan-300 border border-cyan-500/30">
                            #{q.id}
                          </span>

                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {q.topic}
                          </span>

                          {isMistake && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-mono">
                              <AlertTriangle className="w-3 h-3" />
                              Ошибка в тесте
                            </span>
                          )}

                          {deepDive.ipv4Practice?.enabled && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1 font-mono">
                              <Zap className="w-3 h-3 text-cyan-400" />
                              IPv4-тренажёр (/{deepDive.ipv4Practice.targetPrefix})
                            </span>
                          )}
                        </div>

                        {/* Question Text */}
                        <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {q.text}
                        </h3>

                        {/* Quick preview if collapsed */}
                        {!isExpanded && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            🎯 {deepDive.coreConcept}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 transition-colors shrink-0 mt-1"
                        aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expanded Detail Body */}
                    {isExpanded && (
                      <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-5 animate-fade-in">
                        {/* Equipment Photo if present */}
                        {q.image && (
                          <div className="rounded-xl overflow-hidden border border-slate-700 bg-black/80 p-2 max-w-lg mx-auto">
                            <img
                              src={resolveImageUrl(q.image)}
                              alt={q.imageAlt || 'Фото оборудования'}
                              className="max-h-72 w-full object-contain rounded-lg"
                              loading="lazy"
                            />
                            {q.imageAlt && (
                              <p className="text-[11px] text-slate-400 text-center mt-1 font-mono">
                                {q.imageAlt}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Answer Options Overview */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                            Варианты ответов:
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {q.answers.map((ans, aIdx) => {
                              const isCorrect = q.correct.includes(aIdx);
                              return (
                                <div
                                  key={aIdx}
                                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                                    isCorrect
                                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold'
                                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                                        isCorrect
                                          ? 'bg-emerald-500 text-slate-950'
                                          : 'bg-slate-800 text-slate-400'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + aIdx)}
                                    </span>
                                    <span>{ans}</span>
                                  </div>
                                  {isCorrect && (
                                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase shrink-0">
                                      ✓ Правильный ответ
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Structured Deep Dive Blocks */}
                        <div className="grid grid-cols-1 gap-3.5 pt-1">
                          {/* 1. Core Concept */}
                          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                            <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs font-mono uppercase">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Суть концепции</span>
                            </div>
                            <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed">
                              {deepDive.coreConcept}
                            </p>
                          </div>

                          {/* 2. Deep Technical Breakdown */}
                          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs font-mono uppercase">
                              <Layers className="w-3.5 h-3.5 text-blue-400" />
                              <span>Как это устроено под капотом (Технический разбор)</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {deepDive.deepAnalysis}
                            </p>
                          </div>

                          {/* 3. Trap & Confusion */}
                          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs font-mono uppercase">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Типичная ловушка (Где чаще всего ошибаются)</span>
                            </div>
                            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                              {deepDive.commonTrap}
                            </p>
                          </div>

                          {/* 4. Mnemonic / Practical Tip */}
                          {deepDive.practicalTip && (
                            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs font-mono uppercase">
                                <Lightbulb className="w-3.5 h-3.5" />
                                <span>Шпаргалка / Практический совет</span>
                              </div>
                              <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-mono">
                                {deepDive.practicalTip}
                              </p>
                            </div>
                          )}

                          {/* 5. ASCII Diagram / Header Schema (if present) */}
                          {deepDive.visualDiagram && (
                            <div className="p-4 rounded-xl bg-black/70 border border-slate-800 space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                                Структура / Схема передачи:
                              </span>
                              <pre className="text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre p-2 bg-slate-950 rounded-lg border border-slate-800/80 leading-relaxed">
                                {deepDive.visualDiagram}
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* SELECTIVE LINK TO IPv4 TRAINER (Only when calculating masks/subnets adds practical value!) */}
                        {deepDive.ipv4Practice?.enabled && (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-cyan-500/10">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs font-mono">
                                <Zap className="w-4 h-4 text-cyan-400" />
                                <span>Практика расчёта в IPv4-тренажёре</span>
                              </div>
                              <p className="text-xs text-slate-300 max-w-xl">
                                {deepDive.ipv4Practice.reason}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                onNavigateToIpv4(
                                  deepDive.ipv4Practice?.targetPrefix,
                                  deepDive.ipv4Practice?.targetMode
                                );
                              }}
                              type="button"
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md shadow-cyan-500/20"
                            >
                              <span>Отработать маску /{deepDive.ipv4Practice.targetPrefix}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredQuestions.length > 100 && (
                <div className="p-4 text-center text-xs text-slate-400 font-mono">
                  Показано 100 из {filteredQuestions.length} вопросов. Уточните поиск для нахождения конкретной темы.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: 7 LAYERS OF OSI & TCP/IP ARCHITECTURE */}
      {activeSection === 'handbook' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>7 Уровней модели OSI и соответствие со стеком TCP/IP</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Модель OSI (Open Systems Interconnection) состоит из 7 логических уровней. В реальном
              Интернете используется стек протоколов TCP/IP, где уровни 5, 6 и 7 объединены в единый
              Прикладной уровень (Application Layer).
            </p>

            {/* Visual Architecture Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400 uppercase text-[11px]">
                    <th className="p-3">Уровень OSI</th>
                    <th className="p-3">Стек TCP/IP</th>
                    <th className="p-3">PDU (Данные)</th>
                    <th className="p-3">Адресация</th>
                    <th className="p-3">Ключевые протоколы</th>
                    <th className="p-3">Оборудование</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  <tr className="bg-pink-950/20 hover:bg-pink-950/30">
                    <td className="p-3 font-bold text-pink-300">L7 Прикладной</td>
                    <td className="p-3 font-semibold text-white" rowSpan={3}>
                      Прикладной (Application)
                    </td>
                    <td className="p-3 text-slate-300">Данные (Data)</td>
                    <td className="p-3 font-mono text-slate-400">URL, FQDN</td>
                    <td className="p-3 font-mono text-xs">HTTP, DNS, DHCP, SSH</td>
                    <td className="p-3 text-slate-400">WAF, L7-балансировщик</td>
                  </tr>
                  <tr className="bg-purple-950/20 hover:bg-purple-950/30">
                    <td className="p-3 font-bold text-purple-300">L6 Представительский</td>
                    <td className="p-3 text-slate-300">Данные (Data)</td>
                    <td className="p-3 font-mono text-slate-400">MIME, TLS-ID</td>
                    <td className="p-3 font-mono text-xs">TLS/SSL, JSON, GZIP</td>
                    <td className="p-3 text-slate-400">TLS Termination шлюз</td>
                  </tr>
                  <tr className="bg-indigo-950/20 hover:bg-indigo-950/30">
                    <td className="p-3 font-bold text-indigo-300">L5 Сеансовый</td>
                    <td className="p-3 text-slate-300">Данные (Data)</td>
                    <td className="p-3 font-mono text-slate-400">Session ID</td>
                    <td className="p-3 font-mono text-xs">RPC, NetBIOS, SOCKS5</td>
                    <td className="p-3 text-slate-400">Сеансовый прокси</td>
                  </tr>
                  <tr className="bg-blue-950/20 hover:bg-blue-950/30">
                    <td className="p-3 font-bold text-blue-300">L4 Транспортный</td>
                    <td className="p-3 font-semibold text-white">Транспортный</td>
                    <td className="p-3 text-cyan-300 font-semibold">Сегмент (TCP) / Датаграмма (UDP)</td>
                    <td className="p-3 font-mono text-cyan-300">Порты (0-65535)</td>
                    <td className="p-3 font-mono text-xs">TCP, UDP, QUIC, SCTP</td>
                    <td className="p-3 text-slate-400">L4 балансировщик, Firewall</td>
                  </tr>
                  <tr className="bg-cyan-950/20 hover:bg-cyan-950/30">
                    <td className="p-3 font-bold text-cyan-300">L3 Сетевой</td>
                    <td className="p-3 font-semibold text-white">Межсетевой (Internet)</td>
                    <td className="p-3 text-cyan-300 font-semibold">Пакет (Packet)</td>
                    <td className="p-3 font-mono text-cyan-300">IPv4, IPv6</td>
                    <td className="p-3 font-mono text-xs">IPv4, IPv6, ICMP, OSPF, BGP</td>
                    <td className="p-3 text-slate-400">Маршрутизатор, L3-Switch</td>
                  </tr>
                  <tr className="bg-emerald-950/20 hover:bg-emerald-950/30">
                    <td className="p-3 font-bold text-emerald-300">L2 Канальный</td>
                    <td className="p-3 font-semibold text-white" rowSpan={2}>
                      Сетевой доступ (Network Access)
                    </td>
                    <td className="p-3 text-emerald-300 font-semibold">Кадр (Frame)</td>
                    <td className="p-3 font-mono text-emerald-300">MAC (48 бит)</td>
                    <td className="p-3 font-mono text-xs">Ethernet, 802.1Q VLAN, ARP</td>
                    <td className="p-3 text-slate-400">L2 Коммутатор (Switch), Мост</td>
                  </tr>
                  <tr className="bg-amber-950/20 hover:bg-amber-950/30">
                    <td className="p-3 font-bold text-amber-300">L1 Физический</td>
                    <td className="p-3 text-amber-300 font-semibold">Биты (Bits)</td>
                    <td className="p-3 font-mono text-slate-400">Сигналы, частоты</td>
                    <td className="p-3 font-mono text-xs">1000BASE-T, 10GBASE-LR</td>
                    <td className="p-3 text-slate-400">Хаб (Hub), Повторитель, SFP</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Encapsulation Diagram */}
            <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Процесс инкапсуляции при отправке пакета</span>
              </h3>
              <p className="text-xs text-slate-300">
                При отправке данных каждый уровень добавляет свой служебный заголовок (Header), а канальный
                уровень L2 добавляет также завершающий трейлер с контрольной суммой (FCS CRC-32).
              </p>
              <pre className="text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre p-3 bg-slate-950 rounded-xl border border-slate-800 leading-relaxed">
{`[L7 Данные приложения: HTTP GET /index.html]
                  ↓
[L4 TCP Заголовок: Src Port=51234, Dst Port=80, Seq, Ack] + [L7 Данные] = СЕГМЕНТ
                  ↓
[L3 IP Заголовок: Src IP=192.168.1.10, Dst IP=93.184.216.34, TTL=64] + [L4+L7] = ПАКЕТ
                  ↓
[L2 MAC Заголовок: Src MAC, Dst MAC, EtherType=0x0800] + [L3+L4+L7] + [FCS CRC-32] = КАДР
                  ↓
[L1 Физический: Модуляция сигналов в витой паре или лазерных импульсов в оптоволокне] = БИТЫ`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: WELL-KNOWN PORTS REFERENCE */}
      {activeSection === 'ports' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-cyan-400" />
              <span>Таблица стандартных сетевых портов (Well-Known Ports)</span>
            </h2>
            <p className="text-xs text-slate-300">
              Порты от 0 до 1023 стандартизированы IANA и требуют привилегий суперпользователя. Они
              постоянно встречаются в вопросах экзамена.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { port: 20, proto: 'TCP', name: 'FTP-Data', desc: 'Передача файлов по FTP' },
                { port: 21, proto: 'TCP', name: 'FTP-Control', desc: 'Управление сессией FTP' },
                { port: 22, proto: 'TCP', name: 'SSH / SFTP', desc: 'Защищенный терминал и передача' },
                { port: 23, proto: 'TCP', name: 'Telnet', desc: 'Незащищенный текстовый терминал' },
                { port: 25, proto: 'TCP', name: 'SMTP', desc: 'Маршрутизация электронной почты' },
                { port: 53, proto: 'UDP/TCP', name: 'DNS', desc: 'Преобразование доменных имен' },
                { port: 67, proto: 'UDP', name: 'DHCP Server', desc: 'Прием запросов клиентов' },
                { port: 68, proto: 'UDP', name: 'DHCP Client', desc: 'Ответ сервера клиенту' },
                { port: 69, proto: 'UDP', name: 'TFTP', desc: 'Простой FTP без авторизации (PXE)' },
                { port: 80, proto: 'TCP', name: 'HTTP', desc: 'Веб-трафик без шифрования' },
                { port: 110, proto: 'TCP', name: 'POP3', desc: 'Получение почты из ящика' },
                { port: 123, proto: 'UDP', name: 'NTP', desc: 'Синхронизация точного времени' },
                { port: 143, proto: 'TCP', name: 'IMAP', desc: 'Синхронизация почтовых папок' },
                { port: 161, proto: 'UDP', name: 'SNMP', desc: 'Мониторинг сетевых устройств' },
                { port: 443, proto: 'TCP/UDP', name: 'HTTPS / QUIC', desc: 'Защищенный веб (TLS / HTTP3)' },
                { port: 514, proto: 'UDP', name: 'Syslog', desc: 'Централизованный сбор журналов' },
                { port: 3389, proto: 'TCP', name: 'RDP', desc: 'Удаленный рабочий стол Windows' },
              ].map((item) => (
                <div
                  key={item.port}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-cyan-300">
                      Порт {item.port}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {item.proto}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white">{item.name}</div>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SUBNET CHEAT SHEET & QUICK MATH */}
      {activeSection === 'subnet-table' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Шпаргалка масок, шагов и хостов IPv4</span>
                </h2>
                <p className="text-xs text-slate-300">
                  Мгновенный справочник для решения задач экзамена по CIDR-маскам /24–/32.
                </p>
              </div>

              <button
                onClick={() => onNavigateToIpv4(24, 'calc')}
                type="button"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer hover:brightness-110 shrink-0"
              >
                <span>Открыть полный тренажёр</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400 uppercase text-[11px]">
                    <th className="p-3">CIDR</th>
                    <th className="p-3">Десятичная маска</th>
                    <th className="p-3">Двоичный 4-й октет</th>
                    <th className="p-3">Шаг сети (Magic)</th>
                    <th className="p-3">Всего IP</th>
                    <th className="p-3">Полезных хостов</th>
                    <th className="p-3">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {[
                    { prefix: 24, mask: '255.255.255.0', bin: '00000000', step: 256, total: 256, hosts: 254 },
                    { prefix: 25, mask: '255.255.255.128', bin: '10000000', step: 128, total: 128, hosts: 126 },
                    { prefix: 26, mask: '255.255.255.192', bin: '11000000', step: 64, total: 64, hosts: 62 },
                    { prefix: 27, mask: '255.255.255.224', bin: '11100000', step: 32, total: 32, hosts: 30 },
                    { prefix: 28, mask: '255.255.255.240', bin: '11110000', step: 16, total: 16, hosts: 14 },
                    { prefix: 29, mask: '255.255.255.248', bin: '11111000', step: 8, total: 8, hosts: 6 },
                    { prefix: 30, mask: '255.255.255.252', bin: '11111100', step: 4, total: 4, hosts: 2 },
                    { prefix: 31, mask: '255.255.255.254', bin: '11111110', step: 2, total: 2, hosts: '2 (RFC 3021)' },
                    { prefix: 32, mask: '255.255.255.255', bin: '11111111', step: 1, total: 1, hosts: '1 (Хост)' },
                  ].map((row) => (
                    <tr key={row.prefix} className="hover:bg-cyan-950/20 transition-colors">
                      <td className="p-3 font-bold text-cyan-300">/{row.prefix}</td>
                      <td className="p-3 text-white">{row.mask}</td>
                      <td className="p-3 text-slate-400">{row.bin}</td>
                      <td className="p-3 text-amber-300 font-bold">{row.step}</td>
                      <td className="p-3 text-slate-300">{row.total}</td>
                      <td className="p-3 text-emerald-300 font-bold">{row.hosts}</td>
                      <td className="p-3">
                        <button
                          onClick={() => onNavigateToIpv4(row.prefix, 'calc')}
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 transition-colors text-[11px] font-sans font-bold cursor-pointer"
                        >
                          Калькулятор →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

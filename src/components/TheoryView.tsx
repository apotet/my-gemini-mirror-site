import React, { useEffect, useState } from 'react';
import { BookOpen, Layers, FileText, Table2 } from 'lucide-react';
import { TheoryModels } from './TheoryModels';
import { TheoryPorts } from './TheoryPorts';
import { TheoryCheatsheets } from './TheoryCheatsheets';
import { TheoryRazbory } from './TheoryRazbory';

interface TheoryViewProps {
  initialQuestionId?: string | null;
  fromExam?: boolean;
  onReturnToExam?: () => void;
  onNavigateToIpv4: (prefix?: number, mode?: 'calc' | 'trainer') => void;
  onClearInitialQuestion?: () => void;
}

type TheorySection = 'razbory' | 'models' | 'ports' | 'cheatsheets';

const SECTIONS: { id: TheorySection; label: string; icon: React.ReactNode }[] = [
  { id: 'razbory', label: 'Разборы', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'models', label: 'OSI & TCP/IP', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'ports', label: 'Порты', icon: <Table2 className="w-3.5 h-3.5" /> },
  { id: 'cheatsheets', label: 'Шпаргалки L1–L7', icon: <FileText className="w-3.5 h-3.5" /> },
];

export const TheoryView: React.FC<TheoryViewProps> = ({
  initialQuestionId,
  fromExam,
  onReturnToExam,
  onNavigateToIpv4,
  onClearInitialQuestion,
}) => {
  const [section, setSection] = useState<TheorySection>('razbory');

  useEffect(() => {
    if (initialQuestionId) setSection('razbory');
  }, [initialQuestionId]);

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-16">
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-cyan-500/20 bg-white dark:bg-[#091524] space-y-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-500" />
          Теория и разборы
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Модели OSI/TCP-IP, шпаргалки по уровням, таблица портов и подробные разборы вопросов экзамена.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                section === s.id
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {section === 'models' && <TheoryModels />}
      {section === 'ports' && <TheoryPorts />}
      {section === 'cheatsheets' && <TheoryCheatsheets />}
      {section === 'razbory' && (
        <TheoryRazbory
          initialQuestionId={initialQuestionId}
          fromExam={fromExam}
          onReturnToExam={onReturnToExam}
          onNavigateToIpv4={onNavigateToIpv4}
          onClearInitialQuestion={onClearInitialQuestion}
        />
      )}
    </div>
  );
};

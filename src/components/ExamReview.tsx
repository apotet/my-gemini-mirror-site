import React, { useState } from 'react';
import type { ProgressSession } from '../utils/examProgress';
import { filteredReview, reviewTotals, type ReviewFilter } from '../utils/examReview';
import { resolveImageUrl } from '../data/questionsData';

interface Props {
  session: ProgressSession;
  onExit: () => void;
  onRetry?: () => void;
  onNavigateToTheory?: (questionId: string) => void;
}
export function ExamReview({ session, onExit, onRetry, onNavigateToTheory }: Props) {
  const [filter, setFilter] = useState<ReviewFilter>('all');
  if (!session.isCompleted) return null;
  const totals = reviewTotals(session);
  const labels = { correct: 'Верно', wrong: 'Ошибка', unanswered: 'Без подтверждённого ответа' };
  return (
    <section aria-label="Разбор завершённого экзамена" className="max-w-2xl mx-auto space-y-4 pb-20 min-w-0">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <h2 className="text-xl font-bold">Итоги экзамена</h2>
        <p className="text-3xl font-black text-cyan-600">{totals.percentage}%</p>
        <p>{totals.correct} из {totals.total} верно · Ошибки: {totals.wrong} · Без ответа: {totals.unanswered}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onExit} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">Вернуться</button>
          {onRetry && <button type="button" onClick={onRetry} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950">Ещё раз</button>}
        </div>
      </div>
      <h3 className="text-lg font-bold">Посмотреть разбор</h3>
      <div role="group" aria-label="Фильтр разбора" className="flex flex-wrap gap-2">
        {([{ id: 'all', label: 'Все' }, { id: 'wrong', label: 'Ошибки' }, { id: 'correct', label: 'Верные' }] as const).map(item => (
          <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}
            className={`px-4 py-2 rounded-xl ${filter === item.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800'}`}>{item.label}</button>
        ))}
      </div>
      <p role="status" className="text-sm text-slate-500">Показано: {filteredReview(session, filter).length} из {totals.total}. Без ответа доступны в «Все».</p>
      {filteredReview(session, filter).map(row => (
        <details key={row.question.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 min-w-0">
          <summary className="cursor-pointer break-words leading-relaxed">
            <span className="text-xs font-bold">{row.index + 1}. {labels[row.status as keyof typeof labels]} · {row.question.topic}</span>
            <span className="block mt-1">{row.question.text}</span>
          </summary>
          <div className="space-y-3 pt-4 break-words">
            {row.question.image && <img src={resolveImageUrl(row.question.image)} alt={row.question.imageAlt || 'Иллюстрация к вопросу'} loading="lazy" className="max-w-full max-h-80 object-contain rounded-lg" />}
            <p className="text-sm">Ваш выбор{row.confirmed ? '' : ' (не подтверждён)'}: {row.chosen.length ? row.chosen.map(i => `${i + 1}. ${row.question.answers[i] ?? 'Недостоверный вариант'}`).join('; ') : 'Нет ответа'}</p>
            <p className="text-sm font-semibold">Правильный ответ: {row.question.correct.map(i => `${i + 1}. ${row.question.answers[i]}`).join('; ')}</p>
            <ul className="space-y-2 text-sm">
              {row.question.answers.map((answer, i) => <li key={i} className="rounded-lg bg-slate-50 dark:bg-slate-900 p-2">
                {i + 1}. {answer}{row.chosen.includes(i) && <strong> · Ваш выбор</strong>}{row.question.correct.includes(i) && <strong> · Правильно</strong>}
              </li>)}
            </ul>
            <p className="text-sm whitespace-pre-line">{row.explanation || 'Индивидуальное объяснение в сохранённом вопросе отсутствует.'}</p>
            {row.lesson && onNavigateToTheory && <button type="button" onClick={() => onNavigateToTheory(row.question.id)} className="text-sm text-cyan-600 underline py-2">
              Открыть связанный разбор: {row.lesson.title}
            </button>}
          </div>
        </details>
      ))}
      {!filteredReview(session, filter).length && <p>В этом фильтре вопросов нет.</p>}
    </section>
  );
}

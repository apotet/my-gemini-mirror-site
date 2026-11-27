import { FlaskConical } from 'lucide-react';
import type { PracticeLink } from '../data/practiceLinks';

export type PracticeButtonAction = (link: PracticeLink, trigger: HTMLButtonElement) => void;

interface Props {
  link?: PracticeLink;
  onOpenPractice?: PracticeButtonAction;
  className?: string;
  label?: string;
}

export function PracticeLinkButton({ link, onOpenPractice, className, label = 'Открыть стенд' }: Props) {
  if (!link || !onOpenPractice) return null;
  return (
    <button type="button" onClick={event => onOpenPractice(link, event.currentTarget)}
      className={className ?? 'inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 cursor-pointer'}>
      <FlaskConical className="w-4 h-4 shrink-0" aria-hidden="true" />
      {label}
    </button>
  );
}

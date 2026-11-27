import { Bookmark } from 'lucide-react';

interface Props {
  title: string;
  saved: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export function LessonFavoriteButton({ title, saved, onToggle, compact = false }: Props) {
  return (
    <button type="button" aria-pressed={saved} aria-label={`Избранное: ${title}`}
      title={saved ? 'Убрать из избранного' : 'Добавить в избранное'} onClick={onToggle}
      className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-cyan-500/40 px-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-500/10 focus-visible:outline-2 focus-visible:outline-cyan-500 dark:text-cyan-200">
      <Bookmark className={`size-4 shrink-0${saved ? ' fill-current' : ''}`} aria-hidden="true" />
      {!compact && (saved ? 'В избранном' : 'В избранное')}
    </button>
  );
}

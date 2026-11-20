import type { PracticeLink } from '../practiceLinks';

export interface LessonIllustration {
  /** Image in the site's public/lesson-images directory. */
  sprite: string;
  /** 3x2 contact sheet coordinates: 0-based column (0-2), row (0-1). */
  column: 0 | 1 | 2;
  row: 0 | 1;
  alt: string;
  caption: string;
}

export interface LessonBlock {
  image?: LessonIllustration;
  heading: string;
  body: string;
  practiceLink?: PracticeLink;
}

export interface LessonCommand {
  title: string;
  cmd: string;
  note?: string;
}

export interface LessonTrainerLink {
  label: string;
  target: 'ipv4' | 'cli' | 'practice';
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  osiLayers: string[];
  difficulty: 'beginner' | 'applied' | 'advanced';
  professional?: {
    summary: string;
    terms: string[];
    blocks: LessonBlock[];
    commands?: LessonCommand[];
    sources: string[];
    sourceCommit?: string;
  };
  summary: string;
  terms: string[];
  blocks: LessonBlock[];
  commands?: LessonCommand[];
  relatedQuestionIds: string[];
  trainers?: LessonTrainerLink[];
  sources: string[];
  diagram?: 'sni';
}

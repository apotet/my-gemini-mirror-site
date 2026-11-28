export type ConceptId = 'studio' | 'academy' | 'textbook';
export type ScreenId = 'catalog' | 'course' | 'player' | 'exam';
export type ViewportMode = 'desktop' | 'mobile';
export type LearnerProfile = 'newcomer' | 'active';
export type ExamViewMode = 'interactive' | 'passed' | 'failed';

export type DifficultyLevel = 'Базовый' | 'Углублённый' | 'Прикладной';

export type CourseStageId = 'foundation' | 'core' | 'services' | 'operations';

export type ExternalResourceId =
  | 'lesson-masks'
  | 'lesson-private-ipv4'
  | 'lesson-subnets'
  | 'lesson-ipv6'
  | 'trainer-ipv4'
  | 'trainer-ipv6'
  | 'trainer-packet';

export interface CourseItem {
  id: string;
  order: number;
  code: string;
  stage: CourseStageId;
  stageLabel: string;
  title: string;
  shortTitle: string;
  summary: string;
  difficulty: DifficultyLevel;
  durationLabel: string;
  modulesCount: number;
  lessonsCount: number;
  trainersCount: number;
  prerequisites: string[];
  outcomes: string[];
  featured?: boolean;
  /** Progress % when learner profile is 'active' */
  activeProgress: number;
  /** Coordinates in the 920x500 SVG graph for Concept 2 (Academy) */
  mapPos: { x: number; y: number };
}

export interface MarginNote {
  label: string;
  text: string;
}

export interface CourseModuleResourceLink {
  resourceId: ExternalResourceId;
  kind: 'lesson' | 'trainer';
  title: string;
  subtitle: string;
  duration: string;
}

export interface CourseModule {
  id: string;
  index: number;
  title: string;
  shortTitle: string;
  kind: 'theory' | 'practice' | 'exam';
  durationLabel: string;
  lead: string;
  keyIdea: string;
  paragraphs: string[];
  practicalRule: string;
  marginNotes: MarginNote[];
  resources: CourseModuleResourceLink[];
  visualizerMode?: 'ipv4-mask' | 'ipv4-ranges' | 'ipv4-subnet' | 'ipv6-slaac';
}

export interface ExternalResource {
  id: ExternalResourceId;
  kind: 'lesson' | 'trainer';
  sectionName: string;
  title: string;
  subtitle: string;
  summary: string;
  highlights: string[];
  interactivePrompt: string;
  sampleCommands?: string[];
  quickCheck?: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface ExamQuestion {
  id: string;
  topicId: string;
  topicLabel: string;
  moduleId: string;
  text: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicResult {
  topicId: string;
  topicLabel: string;
  moduleId: string;
  correct: number;
  total: number;
  resourceId: ExternalResourceId;
  advice: string;
}

export interface ConceptSharedProps {
  screen: ScreenId;
  isMobile: boolean;
  isDark: boolean;
  profile: LearnerProfile;
  completedModuleIds: string[];
  activeModuleId: string;
  selectedCoursePreviewId: string | null;
  examMode: ExamViewMode;
  examAnswers: Record<string, number>;
  examSubmitted: boolean;
  completedResourceIds: ExternalResourceId[];
  onNavigateScreen: (screen: ScreenId) => void;
  onOpenCourse: (courseId: string) => void;
  onSelectCoursePreview: (courseId: string | null) => void;
  onStartOrResumeModule: (moduleId?: string) => void;
  onSelectModule: (moduleId: string) => void;
  onToggleModuleComplete: (moduleId: string) => void;
  onOpenExternalResource: (resourceId: ExternalResourceId, fromModuleId: string) => void;
  onChangeExamMode: (mode: ExamViewMode) => void;
  onAnswerExamQuestion: (questionId: string, optionIndex: number) => void;
  onSubmitExam: () => void;
  onResetExam: () => void;
}

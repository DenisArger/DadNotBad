export type SubjectId = 'math';

export type GoalId = 'daily-5' | 'catch-up' | 'steady-practice';

export type ScreenId =
  | 'welcome'
  | 'parentAuth'
  | 'childProfile'
  | 'learningPreferences'
  | 'home'
  | 'topicDetails'
  | 'progress'
  | 'lessonError'
  | 'lesson';

export type ExerciseType = 'multiple-choice' | 'text-input' | 'matching';

export interface ParentProfile {
  emailOrPhone: string;
}

export interface ChildProfile {
  name: string;
  grade: string;
  age: string;
}

export interface GoalOption {
  id: GoalId;
  title: string;
  description: string;
}

export interface Subject {
  id: SubjectId;
  title: string;
  description: string;
}

export interface Topic {
  id: string;
  subjectId: SubjectId;
  grade: string;
  title: string;
  lessonCount: number;
}

export interface ExerciseOption {
  id: string;
  label: string;
}

export interface ExerciseMatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  hint: string;
  answer: string;
  options?: ExerciseOption[];
  pairs?: ExerciseMatchingPair[];
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  durationLabel: string;
  exercises: Exercise[];
}

export interface TopicProgress {
  topicId: string;
  completedLessons: number;
  totalLessons: number;
  lastCompletedAt: string | null;
  pointsEarned: number;
}

export interface ActiveLessonRef {
  topicId: string;
  lessonIndex: number;
}

export interface PracticeStreak {
  currentDays: number;
  bestDays: number;
  lastCompletedOn: string | null;
}

export interface LessonHistoryEntry {
  id: string;
  topicId: string;
  lessonId: string;
  completedAt: string;
  earnedPoints: number;
  mistakeCount: number;
}

export interface PersistedLessonSession {
  selectedTopicId: string | null;
  activeLessonRef: ActiveLessonRef | null;
  lessonStepIndex: number;
  lessonAnswer: string;
  lessonFeedback: string | null;
  lessonCompleted: boolean;
  lessonMistakes: number;
  lessonEarnedPoints: number;
  lastIncorrectExercise: Exercise | null;
  similarExercise: Exercise | null;
  isSimilarExerciseMode: boolean;
  currentScreen: Extract<ScreenId, 'lesson' | 'lessonError'>;
}

export interface AppState {
  currentScreen: ScreenId;
  parent: ParentProfile;
  child: ChildProfile;
  selectedSubjectId: SubjectId;
  selectedGoalId: GoalId;
  topicProgress: Record<string, TopicProgress>;
  practiceStreak: PracticeStreak;
  totalPoints: number;
  lessonHistory: LessonHistoryEntry[];
}

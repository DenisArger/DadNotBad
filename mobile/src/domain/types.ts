export type SubjectId = 'math';

export type GoalId = 'daily-5' | 'catch-up' | 'steady-practice';

export type ScreenId =
  | 'welcome'
  | 'parentAuth'
  | 'childProfile'
  | 'learningPreferences'
  | 'home'
  | 'lesson';

export type ExerciseType = 'multiple-choice' | 'text-input' | 'true-false';

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

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  hint: string;
  answer: string;
  options?: ExerciseOption[];
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  durationLabel: string;
  exercises: Exercise[];
}

export interface AppState {
  currentScreen: ScreenId;
  parent: ParentProfile;
  child: ChildProfile;
  selectedSubjectId: SubjectId;
  selectedGoalId: GoalId;
}

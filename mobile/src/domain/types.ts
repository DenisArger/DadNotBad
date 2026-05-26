export type SubjectId = 'math';

export type GoalId = 'daily-5' | 'catch-up' | 'steady-practice';

export type ScreenId = 'welcome' | 'parentAuth' | 'childProfile' | 'learningPreferences' | 'home';

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

export interface AppState {
  currentScreen: ScreenId;
  parent: ParentProfile;
  child: ChildProfile;
  selectedSubjectId: SubjectId;
  selectedGoalId: GoalId;
}

import { GoalOption, Subject, Topic } from './types';

export const subjects: Subject[] = [
  {
    id: 'math',
    title: 'Математика',
    description: 'Один предмет для первого релиза с короткими ежедневными занятиями.',
  },
];

export const goalOptions: GoalOption[] = [
  {
    id: 'daily-5',
    title: '5 минут в день',
    description: 'Лёгкий старт и быстрая привычка без перегруза.',
  },
  {
    id: 'catch-up',
    title: 'Подтянуть тему',
    description: 'Фокус на слабых местах и повторении трудных тем.',
  },
  {
    id: 'steady-practice',
    title: 'Регулярная практика',
    description: 'Ровный ритм занятий для стабильного прогресса.',
  },
];

export const starterTopics: Topic[] = [
  { id: 'math-1-counting', subjectId: 'math', grade: '1', title: 'Счёт до 20', lessonCount: 4 },
  { id: 'math-1-addition', subjectId: 'math', grade: '1', title: 'Сложение без перехода', lessonCount: 5 },
  { id: 'math-2-subtraction', subjectId: 'math', grade: '2', title: 'Вычитание в пределах 100', lessonCount: 6 },
  { id: 'math-3-multiplication', subjectId: 'math', grade: '3', title: 'Таблица умножения', lessonCount: 7 },
  { id: 'math-4-fractions', subjectId: 'math', grade: '4', title: 'Дроби и части целого', lessonCount: 5 },
];

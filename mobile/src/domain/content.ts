import { GoalOption, Lesson, Subject, Topic } from './types';

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

export const starterLessonByTopicId: Record<string, Lesson> = {
  'math-1-counting': {
    id: 'lesson-counting-1',
    topicId: 'math-1-counting',
    title: 'Первый урок: счёт до 20',
    durationLabel: '5-7 минут',
    exercises: [
      {
        id: 'counting-choice',
        type: 'multiple-choice',
        prompt: 'Какое число идёт после 9?',
        hint: 'Вспомни последовательность чисел по порядку.',
        answer: '10',
        options: [
          { id: '8', label: '8' },
          { id: '10', label: '10' },
          { id: '11', label: '11' },
        ],
      },
      {
        id: 'counting-input',
        type: 'text-input',
        prompt: 'Введи число, которое идёт перед 15.',
        hint: 'Оно на один меньше пятнадцати.',
        answer: '14',
      },
      {
        id: 'counting-true-false',
        type: 'true-false',
        prompt: 'Верно ли, что 18 больше 16?',
        hint: 'Сравни оба числа: какое из них больше?',
        answer: 'true',
        options: [
          { id: 'true', label: 'Верно' },
          { id: 'false', label: 'Неверно' },
        ],
      },
    ],
  },
  'math-1-addition': {
    id: 'lesson-addition-1',
    topicId: 'math-1-addition',
    title: 'Первый урок: сложение без перехода',
    durationLabel: '5-7 минут',
    exercises: [
      {
        id: 'addition-choice',
        type: 'multiple-choice',
        prompt: 'Сколько будет 4 + 3?',
        hint: 'Можно досчитать от четырёх ещё три шага.',
        answer: '7',
        options: [
          { id: '6', label: '6' },
          { id: '7', label: '7' },
          { id: '8', label: '8' },
        ],
      },
      {
        id: 'addition-input',
        type: 'text-input',
        prompt: 'Введи ответ: 6 + 2',
        hint: 'К шести нужно добавить ещё два.',
        answer: '8',
      },
      {
        id: 'addition-true-false',
        type: 'true-false',
        prompt: 'Верно ли, что 5 + 4 = 9?',
        hint: 'Посчитай сумму и сравни с девятью.',
        answer: 'true',
        options: [
          { id: 'true', label: 'Верно' },
          { id: 'false', label: 'Неверно' },
        ],
      },
    ],
  },
};

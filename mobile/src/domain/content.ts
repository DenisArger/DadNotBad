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

export const starterLessonsByTopicId: Record<string, Lesson[]> = {
  'math-1-counting': [
    {
      id: 'lesson-counting-1',
      topicId: 'math-1-counting',
      title: 'Урок 1: числа после и перед',
      durationLabel: '5 минут',
      exercises: [
        {
          id: 'counting-1-choice',
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
          id: 'counting-1-input',
          type: 'text-input',
          prompt: 'Введи число, которое идёт перед 15.',
          hint: 'Оно на один меньше пятнадцати.',
          answer: '14',
        },
        {
          id: 'counting-1-matching',
          type: 'matching',
          prompt: '??????? ????? ? ??? ????????? ???????.',
          hint: '??? ??????? ????? ????? ??, ??????? ???? ????? ????? ????.',
          answer: 'pair-1:19|pair-2:17',
          pairs: [
            { id: 'pair-1', left: '18', right: '19' },
            { id: 'pair-2', left: '16', right: '17' },
          ],
        },
      ],
    },
    {
      id: 'lesson-counting-2',
      topicId: 'math-1-counting',
      title: 'Урок 2: счёт вперёд',
      durationLabel: '5 минут',
      exercises: [
        {
          id: 'counting-2-choice',
          type: 'multiple-choice',
          prompt: 'Какое число идёт после 12?',
          hint: 'Попробуй сделать один шаг вперёд.',
          answer: '13',
          options: [
            { id: '11', label: '11' },
            { id: '13', label: '13' },
            { id: '14', label: '14' },
          ],
        },
        {
          id: 'counting-2-input',
          type: 'text-input',
          prompt: 'Введи число, которое идёт после 19.',
          hint: 'Это следующее число после девятнадцати.',
          answer: '20',
        },
        {
          id: 'counting-2-matching',
          type: 'matching',
          prompt: '??????? ????? ? ???, ??? ???? ????? ????.',
          hint: '?????? ???? ??? ?????? ??? ??????? ?????.',
          answer: 'pair-1:17|pair-2:20',
          pairs: [
            { id: 'pair-1', left: '16', right: '17' },
            { id: 'pair-2', left: '19', right: '20' },
          ],
        },
      ],
    },
    {
      id: 'lesson-counting-3',
      topicId: 'math-1-counting',
      title: 'Урок 3: счёт назад',
      durationLabel: '5 минут',
      exercises: [
        {
          id: 'counting-3-choice',
          type: 'multiple-choice',
          prompt: 'Какое число стоит перед 11?',
          hint: 'Сделай один шаг назад.',
          answer: '10',
          options: [
            { id: '9', label: '9' },
            { id: '10', label: '10' },
            { id: '12', label: '12' },
          ],
        },
        {
          id: 'counting-3-input',
          type: 'text-input',
          prompt: 'Введи число, которое идёт перед 20.',
          hint: 'Оно на один меньше двадцати.',
          answer: '19',
        },
        {
          id: 'counting-3-matching',
          type: 'matching',
          prompt: '??????? ????? ? ?????????? ??????.',
          hint: '??? ??????? ????? ?????? ???? ??? ?????.',
          answer: 'pair-1:7|pair-2:19',
          pairs: [
            { id: 'pair-1', left: '8', right: '7' },
            { id: 'pair-2', left: '20', right: '19' },
          ],
        },
      ],
    },
    {
      id: 'lesson-counting-4',
      topicId: 'math-1-counting',
      title: 'Урок 4: закрепление счёта до 20',
      durationLabel: '6 минут',
      exercises: [
        {
          id: 'counting-4-choice',
          type: 'multiple-choice',
          prompt: 'Какое число находится между 17 и 19?',
          hint: 'Это сосед обоих чисел.',
          answer: '18',
          options: [
            { id: '16', label: '16' },
            { id: '18', label: '18' },
            { id: '20', label: '20' },
          ],
        },
        {
          id: 'counting-4-input',
          type: 'text-input',
          prompt: 'Введи число, которое идёт после 18.',
          hint: 'Это следующее число после восемнадцати.',
          answer: '19',
        },
        {
          id: 'counting-4-matching',
          type: 'matching',
          prompt: '??????? ???????? ? ?????????? ??????.',
          hint: '???????, ????? ????? ???????? ? ??????? ????????.',
          answer: 'pair-1:18|pair-2:20',
          pairs: [
            { id: 'pair-1', left: '????? 17 ? 19', right: '18' },
            { id: 'pair-2', left: '????? 19', right: '20' },
          ],
        },
      ],
    },
  ],
  'math-1-addition': [
    {
      id: 'lesson-addition-1',
      topicId: 'math-1-addition',
      title: 'Урок 1: простое сложение',
      durationLabel: '5 минут',
      exercises: [
        {
          id: 'addition-1-choice',
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
          id: 'addition-1-input',
          type: 'text-input',
          prompt: 'Введи ответ: 6 + 2',
          hint: 'К шести нужно добавить ещё два.',
          answer: '8',
        },
        {
          id: 'addition-1-matching',
          type: 'matching',
          prompt: '??????? ?????? ? ???????.',
          hint: '??????? ???? ?????? ??????, ????? ????? ??? ?????.',
          answer: 'pair-1:9|pair-2:7',
          pairs: [
            { id: 'pair-1', left: '5 + 4', right: '9' },
            { id: 'pair-2', left: '3 + 4', right: '7' },
          ],
        },
      ],
    },
    {
      id: 'lesson-addition-2',
      topicId: 'math-1-addition',
      title: 'Урок 2: прибавляем один и два',
      durationLabel: '5 минут',
      exercises: [
        {
          id: 'addition-2-choice',
          type: 'multiple-choice',
          prompt: 'Сколько будет 7 + 1?',
          hint: 'Прибавить один значит назвать следующее число.',
          answer: '8',
          options: [
            { id: '6', label: '6' },
            { id: '8', label: '8' },
            { id: '9', label: '9' },
          ],
        },
        {
          id: 'addition-2-input',
          type: 'text-input',
          prompt: 'Введи ответ: 5 + 2',
          hint: 'После пяти идут шесть и семь.',
          answer: '7',
        },
        {
          id: 'addition-2-matching',
          type: 'matching',
          prompt: '??????? ????? ? ?????????? ???????.',
          hint: '???????? ??? ????? ? ??????? ??????.',
          answer: 'pair-1:5|pair-2:8',
          pairs: [
            { id: 'pair-1', left: '3 + 2', right: '5' },
            { id: 'pair-2', left: '6 + 2', right: '8' },
          ],
        },
      ],
    },
    {
      id: 'lesson-addition-3',
      topicId: 'math-1-addition',
      title: 'Урок 3: складываем в пределах 10',
      durationLabel: '6 минут',
      exercises: [
        {
          id: 'addition-3-choice',
          type: 'multiple-choice',
          prompt: 'Сколько будет 2 + 6?',
          hint: 'Досчитай от двух ещё шесть шагов.',
          answer: '8',
          options: [
            { id: '7', label: '7' },
            { id: '8', label: '8' },
            { id: '9', label: '9' },
          ],
        },
        {
          id: 'addition-3-input',
          type: 'text-input',
          prompt: 'Введи ответ: 4 + 5',
          hint: 'К четырём добавляем пять.',
          answer: '9',
        },
        {
          id: 'addition-3-matching',
          type: 'matching',
          prompt: '??????? ?????? ? ??? ?????????.',
          hint: '??? ??????? ??????? ????? ?????? ?????.',
          answer: 'pair-1:8|pair-2:10',
          pairs: [
            { id: 'pair-1', left: '1 + 7', right: '8' },
            { id: 'pair-2', left: '4 + 6', right: '10' },
          ],
        },
      ],
    },
    {
      id: 'lesson-addition-4',
      topicId: 'math-1-addition',
      title: 'Урок 4: закрепляем пары чисел',
      durationLabel: '6 минут',
      exercises: [
        {
          id: 'addition-4-choice',
          type: 'multiple-choice',
          prompt: 'Сколько будет 3 + 3?',
          hint: 'Это два одинаковых числа.',
          answer: '6',
          options: [
            { id: '5', label: '5' },
            { id: '6', label: '6' },
            { id: '7', label: '7' },
          ],
        },
        {
          id: 'addition-4-input',
          type: 'text-input',
          prompt: 'Введи ответ: 2 + 7',
          hint: 'После двух считаем ещё семь шагов.',
          answer: '9',
        },
        {
          id: 'addition-4-matching',
          type: 'matching',
          prompt: '??????? ??????? ? ????????.',
          hint: '??????? ??? ????? ???????????.',
          answer: 'pair-1:9|pair-2:6',
          pairs: [
            { id: 'pair-1', left: '6 + 3', right: '9' },
            { id: 'pair-2', left: '3 + 3', right: '6' },
          ],
        },
      ],
    },
    {
      id: 'lesson-addition-5',
      topicId: 'math-1-addition',
      title: 'Урок 5: итог по сложению',
      durationLabel: '6 минут',
      exercises: [
        {
          id: 'addition-5-choice',
          type: 'multiple-choice',
          prompt: 'Сколько будет 5 + 3?',
          hint: 'Прибавь к пяти ещё три.',
          answer: '8',
          options: [
            { id: '7', label: '7' },
            { id: '8', label: '8' },
            { id: '9', label: '9' },
          ],
        },
        {
          id: 'addition-5-input',
          type: 'text-input',
          prompt: 'Введи ответ: 1 + 8',
          hint: 'Следующее число после восьми.',
          answer: '9',
        },
        {
          id: 'addition-5-matching',
          type: 'matching',
          prompt: '??????? ?????? ????? ? ???????.',
          hint: '????? ????????? ??? ?????? ?????.',
          answer: 'pair-1:8|pair-2:10',
          pairs: [
            { id: 'pair-1', left: '4 + 4', right: '8' },
            { id: 'pair-2', left: '5 + 5', right: '10' },
          ],
        },
      ],
    },
  ],
};

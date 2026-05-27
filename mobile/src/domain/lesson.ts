import { Exercise, ExerciseMatchingPair, LessonHistoryEntry, PracticeStreak, Topic, TopicProgress } from './types';

export function getTopicProgressPercent(completedLessons: number, totalLessons: number) {
  if (totalLessons <= 0) {
    return 0;
  }

  return Math.round((Math.min(completedLessons, totalLessons) / totalLessons) * 100);
}

export function getTopicProgressLabel(topic: Topic, completedLessons: number) {
  const progressPercent = getTopicProgressPercent(completedLessons, topic.lessonCount);

  if (completedLessons >= topic.lessonCount) {
    return 'Прогресс: 100% (все уроки завершены)';
  }

  return `Прогресс: ${progressPercent}% (${completedLessons} из ${topic.lessonCount})`;
}

export function getNextLessonIndex(
  topicId: string,
  topicProgress: Record<string, TopicProgress>,
  lessonCount: number,
) {
  if (lessonCount <= 0) {
    return 0;
  }

  const completedLessons = topicProgress[topicId]?.completedLessons ?? 0;
  return Math.min(completedLessons, lessonCount - 1);
}

export function getNextLessonLabel(lessonCount: number, nextLessonIndex: number, completedLessons: number) {
  if (lessonCount <= 0) {
    return 'Уроки скоро появятся';
  }

  if (completedLessons >= lessonCount) {
    return 'Все уроки в теме уже пройдены';
  }

  return `Следующий урок: ${nextLessonIndex + 1} из ${lessonCount}`;
}

export function getProgressEntries(topicProgress: Record<string, TopicProgress>) {
  return Object.values(topicProgress).sort((left, right) => {
    const leftTime = left.lastCompletedAt ? Date.parse(left.lastCompletedAt) : 0;
    const rightTime = right.lastCompletedAt ? Date.parse(right.lastCompletedAt) : 0;

    return rightTime - leftTime;
  });
}

export function getWeeklySummary(
  lessonHistory: LessonHistoryEntry[],
  topics: Topic[],
  now = new Date(),
) {
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const recentLessons = lessonHistory.filter((entry) => new Date(entry.completedAt) >= weekStart);
  const totalMistakes = recentLessons.reduce((sum, entry) => sum + entry.mistakeCount, 0);
  const totalPoints = recentLessons.reduce((sum, entry) => sum + entry.earnedPoints, 0);
  const topicStats = recentLessons.reduce<Record<string, { lessonCount: number; mistakeCount: number }>>((acc, entry) => {
    const current = acc[entry.topicId] ?? { lessonCount: 0, mistakeCount: 0 };
    acc[entry.topicId] = {
      lessonCount: current.lessonCount + 1,
      mistakeCount: current.mistakeCount + entry.mistakeCount,
    };
    return acc;
  }, {});

  const studiedTopicIds = Object.keys(topicStats);
  const studiedTopics = studiedTopicIds
    .map((topicId) => ({
      topic: topics.find((topic) => topic.id === topicId),
      lessonCount: topicStats[topicId].lessonCount,
      mistakeCount: topicStats[topicId].mistakeCount,
    }))
    .filter((entry) => entry.topic);

  const hardestTopic = studiedTopics.sort((left, right) => right.mistakeCount - left.mistakeCount)[0] ?? null;
  const weakTopics = [...studiedTopics]
    .filter((entry) => entry.mistakeCount > 0)
    .sort((left, right) => {
      if (right.mistakeCount !== left.mistakeCount) {
        return right.mistakeCount - left.mistakeCount;
      }

      return right.lessonCount - left.lessonCount;
    })
    .slice(0, 3)
    .map((entry) => ({
      topicId: entry.topic!.id,
      title: entry.topic!.title,
      lessonCount: entry.lessonCount,
      mistakeCount: entry.mistakeCount,
    }));

  const recommendations = weakTopics.map((topic) => ({
    topicId: topic.topicId,
    title: topic.title,
    text:
      topic.mistakeCount >= 3
        ? `Повторить тему "${topic.title}" в спокойном темпе: ошибок ${topic.mistakeCount}.`
        : `Коротко вернуться к теме "${topic.title}", чтобы закрепить результат без перегруза.`,
  }));

  return {
    lessonCount: recentLessons.length,
    topicCount: studiedTopicIds.length,
    totalMistakes,
    totalPoints,
    studiedTopics: studiedTopics.map((entry) => ({
      topicId: entry.topic!.id,
      title: entry.topic!.title,
      lessonCount: entry.lessonCount,
      mistakeCount: entry.mistakeCount,
    })),
    hardestTopic: hardestTopic
      ? {
          topicId: hardestTopic.topic!.id,
          title: hardestTopic.topic!.title,
          lessonCount: hardestTopic.lessonCount,
          mistakeCount: hardestTopic.mistakeCount,
        }
      : null,
    weakTopics,
    recommendations,
  };
}

export function getRecentLessonActivity(
  lessonHistory: LessonHistoryEntry[],
  topics: Topic[],
  limit = 7,
) {
  return [...lessonHistory]
    .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt))
    .slice(0, limit)
    .map((entry) => {
      const topic = topics.find((item) => item.id === entry.topicId);

      return {
        id: entry.id,
        topicId: entry.topicId,
        topicTitle: topic?.title ?? 'Тема без названия',
        lessonId: entry.lessonId,
        completedAt: entry.completedAt,
        earnedPoints: entry.earnedPoints,
        mistakeCount: entry.mistakeCount,
      };
    });
}

export function calculateLessonPoints(exerciseCount: number, mistakeCount: number) {
  const basePoints = exerciseCount * 10;
  const penalty = mistakeCount * 3;
  return Math.max(5, basePoints - penalty);
}

export function createSimilarExercise(exercise: Exercise): Exercise {
  const numbers = getNumbersFromText(`${exercise.prompt} ${exercise.answer}`);

  if (exercise.type === 'text-input') {
    return createTextInputVariation(exercise, numbers);
  }

  if (exercise.type === 'matching') {
    return createMatchingVariation(exercise, numbers);
  }

  return createMultipleChoiceVariation(exercise, numbers);
}

export function normalizeExerciseAnswer(exercise: Exercise, value: string) {
  if (exercise.type !== 'matching') {
    return value.trim().toLowerCase();
  }

  try {
    const parsed = JSON.parse(value) as Record<string, string>;

    return Object.entries(parsed)
      .sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
      .map(([leftId, rightValue]) => `${leftId}:${String(rightValue).trim().toLowerCase()}`)
      .join('|');
  } catch {
    return value.trim().toLowerCase();
  }
}

export function getNextPracticeStreak(practiceStreak: PracticeStreak): PracticeStreak {
  const today = getCalendarDateKey(new Date());
  const lastCompletedOn = practiceStreak.lastCompletedOn;

  if (lastCompletedOn === today) {
    return practiceStreak;
  }

  const yesterday = getCalendarDateKey(getDateWithOffset(new Date(), -1));
  const nextCurrentDays = lastCompletedOn === yesterday ? practiceStreak.currentDays + 1 : 1;

  return {
    currentDays: nextCurrentDays,
    bestDays: Math.max(practiceStreak.bestDays, nextCurrentDays),
    lastCompletedOn: today,
  };
}

export function getAchievements(
  completedLessonsCount: number,
  completedTopicsCount: number,
  masteredTopicsCount: number,
  currentStreakDays: number,
) {
  const achievements = [];

  achievements.push({
    title: completedLessonsCount > 0 ? 'Первый шаг сделан' : 'Старт впереди',
    description:
      completedLessonsCount > 0
        ? 'Ребёнок уже прошёл хотя бы один урок и начал собирать свою траекторию.'
        : 'Как только будет завершён первый урок, здесь появится первая отметка прогресса.',
  });

  achievements.push({
    title: currentStreakDays >= 3 ? 'Серия держится' : 'Собираем streak',
    description:
      currentStreakDays >= 3
        ? 'Несколько дней подряд уже закрыты, значит привычка начинает закрепляться.'
        : 'Ежедневные короткие занятия помогут быстрее добраться до устойчивой серии.',
  });

  achievements.push({
    title: masteredTopicsCount > 0 ? 'Тема закрыта' : 'До первой закрытой темы',
    description:
      masteredTopicsCount > 0
        ? 'Есть хотя бы одна тема, в которой весь стартовый набор уроков уже пройден.'
        : 'Когда все уроки в теме будут завершены, здесь появится новое достижение.',
  });

  achievements.push({
    title: completedTopicsCount >= 2 ? 'Движение по темам' : 'Фокус на одной теме',
    description:
      completedTopicsCount >= 2
        ? 'Получается учиться сразу в нескольких направлениях без потери ритма.'
        : 'Сейчас обучение сосредоточено на небольшой зоне, и для MVP это хороший темп.',
  });

  return achievements;
}

export function getStreakMessage(practiceStreak: PracticeStreak, completedLessonsCount: number) {
  if (completedLessonsCount === 0) {
    return 'После первого завершённого урока здесь начнётся серия ежедневной практики.';
  }

  if (practiceStreak.currentDays <= 1) {
    return 'Серия уже запущена. Следующее занятие завтра поможет превратить старт в привычку.';
  }

  return `Серия держится уже ${practiceStreak.currentDays} дн. Ещё один день подряд укрепит ритм.`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function createTextInputVariation(exercise: Exercise, numbers: number[]): Exercise {
  if (numbers.length >= 2) {
    const [left, right] = numbers;
    const nextLeft = left + 1;
    const nextRight = right + 1;
    const answer = String(nextLeft + nextRight);

    return {
      ...exercise,
      id: `${exercise.id}-retry`,
      prompt: `Попробуй похожий пример: ${nextLeft} + ${nextRight}`,
      hint: 'Сложи два числа по порядку и проверь ответ ещё раз.',
      answer,
    };
  }

  if (numbers.length === 1) {
    const target = numbers[0] + 1;

    return {
      ...exercise,
      id: `${exercise.id}-retry`,
      prompt: `Попробуй похожее задание: какое число стоит перед ${target}?`,
      hint: 'Нужно назвать число на один меньше.',
      answer: String(target - 1),
    };
  }

  return {
    ...exercise,
    id: `${exercise.id}-retry`,
    prompt: `${exercise.prompt} Попробуем ещё раз с похожей задачей.`,
  };
}

function createMatchingVariation(exercise: Exercise, numbers: number[]): Exercise {
  if (numbers.length >= 2) {
    const [left, right] = numbers;
    const pairs = [
      { id: 'pair-1', left: `${left} + 1`, right: String(left + 1) },
      { id: 'pair-2', left: `${right} + 1`, right: String(right + 1) },
    ];

    return {
      ...exercise,
      id: `${exercise.id}-retry`,
      prompt: 'Соедини каждый пример с правильным ответом.',
      hint: 'Подбери ответ для каждой строки по порядку.',
      answer: serializeMatchingPairs(pairs),
      pairs,
    };
  }

  const fallbackPairs = [
    { id: 'pair-1', left: '2 + 2', right: '4' },
    { id: 'pair-2', left: '3 + 1', right: '4' },
  ];

  return {
    ...exercise,
    id: `${exercise.id}-retry`,
    prompt: 'Соедини каждый пример с правильным ответом.',
    hint: 'Сначала реши примеры, затем подбери одинаковые ответы.',
    answer: serializeMatchingPairs(fallbackPairs),
    pairs: fallbackPairs,
  };
}

function createMultipleChoiceVariation(exercise: Exercise, numbers: number[]): Exercise {
  if (numbers.length >= 2) {
    const [left, right] = numbers;
    const correctAnswer = left + right;
    const options = [correctAnswer - 1, correctAnswer, correctAnswer + 1].map((value) => ({
      id: String(value),
      label: String(value),
    }));

    return {
      ...exercise,
      id: `${exercise.id}-retry`,
      prompt: `Попробуй похожий пример: сколько будет ${left} + ${right}?`,
      hint: 'Посчитай сумму внимательно и выбери ближайший правильный ответ.',
      answer: String(correctAnswer),
      options,
    };
  }

  if (numbers.length === 1) {
    const base = numbers[0] + 1;
    const correctAnswer = base + 1;

    return {
      ...exercise,
      id: `${exercise.id}-retry`,
      prompt: `Какое число идет после ${base}?`,
      hint: 'Сделай один шаг вперед по числовому ряду.',
      answer: String(correctAnswer),
      options: [correctAnswer - 1, correctAnswer, correctAnswer + 1].map((value) => ({
        id: String(value),
        label: String(value),
      })),
    };
  }

  return {
    ...exercise,
    id: `${exercise.id}-retry`,
    prompt: `${exercise.prompt} Попробуем ещё раз.`,
  };
}

function getNumbersFromText(value: string) {
  return Array.from(value.matchAll(/\d+/g), (match) => Number(match[0]));
}

function getCalendarDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getDateWithOffset(value: Date, offsetDays: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + offsetDays);
  return next;
}

function serializeMatchingPairs(pairs: ExerciseMatchingPair[]) {
  return pairs
    .map((pair) => [pair.id, pair.right] as const)
    .sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
    .map(([leftId, rightValue]) => `${leftId}:${rightValue.trim().toLowerCase()}`)
    .join('|');
}

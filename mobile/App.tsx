import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { goalOptions, starterLessonsByTopicId, starterTopics, subjects } from './src/domain/content';
import { loadAppState, saveAppState } from './src/domain/storage';
import {
  ActiveLessonRef,
  AppState,
  Exercise,
  GoalId,
  PracticeStreak,
  ScreenId,
  SubjectId,
  Topic,
  TopicProgress,
} from './src/domain/types';

const initialState: AppState = {
  currentScreen: 'welcome',
  parent: {
    emailOrPhone: '',
  },
  child: {
    name: '',
    grade: '1',
    age: '7',
  },
  selectedSubjectId: 'math',
  selectedGoalId: 'daily-5',
  topicProgress: {},
  practiceStreak: {
    currentDays: 0,
    bestDays: 0,
    lastCompletedOn: null,
  },
  totalPoints: 0,
};

const screenOrder: ScreenId[] = [
  'welcome',
  'parentAuth',
  'childProfile',
  'learningPreferences',
  'home',
  'topicDetails',
  'progress',
  'lessonError',
  'lesson',
];

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [isHydrating, setIsHydrating] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeLessonRef, setActiveLessonRef] = useState<ActiveLessonRef | null>(null);
  const [lessonStepIndex, setLessonStepIndex] = useState(0);
  const [lessonAnswer, setLessonAnswer] = useState('');
  const [lessonFeedback, setLessonFeedback] = useState<string | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [lessonMistakes, setLessonMistakes] = useState(0);
  const [lessonEarnedPoints, setLessonEarnedPoints] = useState(0);
  const [lastIncorrectExercise, setLastIncorrectExercise] = useState<Exercise | null>(null);
  const [similarExercise, setSimilarExercise] = useState<Exercise | null>(null);
  const [isSimilarExerciseMode, setIsSimilarExerciseMode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrateState = async () => {
      try {
        const storedState = await loadAppState();

        if (storedState && !cancelled) {
          const normalizedTopicProgress = Object.fromEntries(
            Object.entries(storedState.topicProgress ?? {}).map(([topicId, progress]) => [
              topicId,
              {
                ...progress,
                pointsEarned: progress.pointsEarned ?? 0,
              },
            ]),
          );

          setState({
            ...initialState,
            ...storedState,
            topicProgress: normalizedTopicProgress,
            practiceStreak: storedState.practiceStreak ?? initialState.practiceStreak,
            totalPoints: storedState.totalPoints ?? 0,
          });
        }
      } catch (error) {
        console.warn('Failed to load app state', error);
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    };

    hydrateState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    saveAppState(state).catch((error) => {
      console.warn('Failed to save app state', error);
    });
  }, [isHydrating, state]);

  const activeStep = screenOrder.indexOf(state.currentScreen) + 1;
  const totalSteps = screenOrder.length;

  const filteredTopics = useMemo(
    () =>
      starterTopics.filter(
        (topic) => topic.subjectId === state.selectedSubjectId && topic.grade === state.child.grade,
      ),
    [state.child.grade, state.selectedSubjectId],
  );

  const selectedSubject = subjects.find((subject) => subject.id === state.selectedSubjectId);
  const selectedGoal = goalOptions.find((goal) => goal.id === state.selectedGoalId);
  const selectedTopic = selectedTopicId ? starterTopics.find((topic) => topic.id === selectedTopicId) ?? null : null;
  const selectedTopicLessons = selectedTopicId ? starterLessonsByTopicId[selectedTopicId] ?? [] : [];
  const activeLessonTopicId = activeLessonRef?.topicId ?? null;
  const activeLessonList = activeLessonTopicId ? starterLessonsByTopicId[activeLessonTopicId] ?? [] : [];
  const activeLesson =
    activeLessonRef && activeLessonList[activeLessonRef.lessonIndex]
      ? activeLessonList[activeLessonRef.lessonIndex]
      : null;
  const activeExercise = activeLesson?.exercises[lessonStepIndex] ?? null;
  const progressEntries = getProgressEntries(state.topicProgress);
  const completedTopicsCount = progressEntries.filter((progress) => progress.completedLessons > 0).length;
  const completedLessonsCount = progressEntries.reduce((sum, progress) => sum + progress.completedLessons, 0);
  const masteredTopicsCount = progressEntries.filter((progress) => progress.completedLessons >= progress.totalLessons).length;
  const totalAvailableLessons = filteredTopics.reduce((sum, topic) => sum + topic.lessonCount, 0);

  const goToScreen = (screen: ScreenId) => {
    setState((current) => ({ ...current, currentScreen: screen }));
  };

  const updateParentField = (value: string) => {
    setState((current) => ({
      ...current,
      parent: { emailOrPhone: value },
    }));
  };

  const updateChildField = (field: 'name' | 'grade' | 'age', value: string) => {
    setState((current) => ({
      ...current,
      child: { ...current.child, [field]: value },
    }));
  };

  const updateGoal = (goalId: GoalId) => {
    setState((current) => ({ ...current, selectedGoalId: goalId }));
  };

  const updateSubject = (subjectId: SubjectId) => {
    setState((current) => ({ ...current, selectedSubjectId: subjectId }));
  };

  const resetLessonState = () => {
    setActiveLessonRef(null);
    setLessonStepIndex(0);
    setLessonAnswer('');
    setLessonFeedback(null);
    setLessonCompleted(false);
    setLessonMistakes(0);
    setLessonEarnedPoints(0);
    setLastIncorrectExercise(null);
    setSimilarExercise(null);
    setIsSimilarExerciseMode(false);
  };

  const resetOnboarding = () => {
    setState(initialState);
    setSelectedTopicId(null);
    resetLessonState();
  };

  const openTopicDetails = (topicId: string) => {
    setSelectedTopicId(topicId);
    resetLessonState();
    goToScreen('topicDetails');
  };

  const startLesson = (topicId: string, lessonIndex?: number) => {
    const lessons = starterLessonsByTopicId[topicId];

    if (!lessons || lessons.length === 0) {
      return;
    }

    const safeLessonIndex = Math.min(
      typeof lessonIndex === 'number' ? lessonIndex : getNextLessonIndex(topicId, state.topicProgress, lessons.length),
      lessons.length - 1,
    );

    setSelectedTopicId(topicId);
    setActiveLessonRef({
      topicId,
      lessonIndex: safeLessonIndex,
    });
    setLessonStepIndex(0);
    setLessonAnswer('');
    setLessonFeedback(null);
    setLessonCompleted(false);
    setLastIncorrectExercise(null);
    setSimilarExercise(null);
    setIsSimilarExerciseMode(false);
    goToScreen('lesson');
  };

  const leaveLesson = () => {
    resetLessonState();
    if (selectedTopicId) {
      goToScreen('topicDetails');
      return;
    }

    goToScreen('home');
  };

  const returnToExerciseFromError = () => {
    setLessonAnswer('');
    goToScreen('lesson');
  };

  const startSimilarExercise = () => {
    if (!lastIncorrectExercise) {
      returnToExerciseFromError();
      return;
    }

    setSimilarExercise(createSimilarExercise(lastIncorrectExercise));
    setIsSimilarExerciseMode(true);
    setLessonAnswer('');
    setLessonFeedback('Попробуем ещё одно похожее задание, чтобы закрепить навык.');
    goToScreen('lesson');
  };

  const normalizeAnswer = (value: string) => value.trim().toLowerCase();

  const markTopicLessonCompleted = (topicId: string, earnedPoints: number) => {
    const lessons = starterLessonsByTopicId[topicId];

    if (!lessons) {
      return;
    }

    setState((current) => {
      const currentProgress = current.topicProgress[topicId];
      const nextCompletedLessons = Math.min((currentProgress?.completedLessons ?? 0) + 1, lessons.length);

      return {
        ...current,
        topicProgress: {
          ...current.topicProgress,
          [topicId]: {
            topicId,
            totalLessons: lessons.length,
            completedLessons: nextCompletedLessons,
            lastCompletedAt: new Date().toISOString(),
            pointsEarned: (currentProgress?.pointsEarned ?? 0) + earnedPoints,
          },
        },
        practiceStreak: getNextPracticeStreak(current.practiceStreak),
        totalPoints: current.totalPoints + earnedPoints,
      };
    });
  };

  const submitLessonAnswer = () => {
    const exerciseToCheck = isSimilarExerciseMode ? similarExercise : activeExercise;

    if (!exerciseToCheck) {
      return;
    }

    const expectedAnswer = normalizeAnswer(exerciseToCheck.answer);
    const currentAnswer = normalizeAnswer(lessonAnswer);

    if (!currentAnswer) {
      setLessonFeedback('Сначала выбери или введи ответ.');
      return;
    }

    if (currentAnswer === expectedAnswer) {
      if (isSimilarExerciseMode) {
        setIsSimilarExerciseMode(false);
        setSimilarExercise(null);
        setLessonAnswer('');
        setLessonFeedback('Отлично! Похожее задание получилось. Теперь можно вернуться к основному вопросу.');
        goToScreen('lessonError');
        return;
      }

      const nextStep = lessonStepIndex + 1;

      if (activeLesson && activeLessonTopicId && nextStep >= activeLesson.exercises.length) {
        const earnedPoints = calculateLessonPoints(activeLesson.exercises.length, lessonMistakes);
        markTopicLessonCompleted(activeLessonTopicId, earnedPoints);
        setLessonEarnedPoints(earnedPoints);
        setLessonCompleted(true);
        setLessonFeedback('Отлично! Урок завершён без ошибок.');
      } else {
        setLessonStepIndex(nextStep);
        setLessonAnswer('');
        setLessonFeedback('Верно! Переходим к следующему заданию.');
      }

      return;
    }

    setLessonMistakes((current) => current + 1);
    setLastIncorrectExercise(exerciseToCheck);
    setSimilarExercise(createSimilarExercise(exerciseToCheck));
    setLessonFeedback(`Пока мимо. Подсказка: ${exerciseToCheck.hint}`);
    setIsSimilarExerciseMode(false);
    goToScreen('lessonError');
  };

  const displayedExercise = isSimilarExerciseMode ? similarExercise : activeExercise;
  const canContinueFromAuth = state.parent.emailOrPhone.trim().length >= 5;
  const canContinueFromChild = state.child.name.trim().length >= 2;

  if (isHydrating) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingTitle}>Восстанавливаем прогресс</Text>
          <Text style={styles.loadingText}>
            Секунду, загружаем сохранённый онбординг, профиль ребёнка, уроки и streak.
          </Text>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroGlowTop} />
      <View style={styles.heroGlowBottom} />
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.kicker}>DadNotBad MVP</Text>
          <Text style={styles.progress}>
            Шаг {activeStep} из {totalSteps}
          </Text>
        </View>

        {state.currentScreen === 'welcome' ? (
          <>
            <Text style={styles.title}>Учебное приложение для детей и родителей</Text>
            <Text style={styles.subtitle}>
              Теперь в MVP есть маршрут по урокам внутри темы и streak по дням, чтобы приложение подталкивало
              возвращаться к занятиям.
            </Text>

            <View style={styles.pills}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Expo</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Lesson Picker</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Streak</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Что уже умеет приложение</Text>
              <Text style={styles.bullet}>Онбординг родителя и ребёнка</Text>
              <Text style={styles.bullet}>Выбор предмета и цели</Text>
              <Text style={styles.bullet}>Список тем и отдельных уроков</Text>
              <Text style={styles.bullet}>Прогресс, достижения и дневной streak</Text>
            </View>

            <Pressable style={styles.buttonPrimary} onPress={() => goToScreen('parentAuth')}>
              <Text style={styles.buttonPrimaryText}>Начать онбординг</Text>
            </Pressable>
          </>
        ) : null}

        {state.currentScreen === 'parentAuth' ? (
          <>
            <Text style={styles.title}>Вход для родителя</Text>
            <Text style={styles.subtitle}>
              Для MVP пока достаточно одного поля. Позже сюда можно подключить настоящую авторизацию.
            </Text>

            <View style={styles.section}>
              <Text style={styles.label}>Email или телефон</Text>
              <TextInput
                placeholder="parent@example.com"
                placeholderTextColor="#7c8aa5"
                style={styles.input}
                value={state.parent.emailOrPhone}
                onChangeText={updateParentField}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.buttonSecondary} onPress={() => goToScreen('welcome')}>
                <Text style={styles.buttonSecondaryText}>Назад</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonPrimary, !canContinueFromAuth && styles.buttonDisabled]}
                onPress={() => {
                  if (canContinueFromAuth) {
                    goToScreen('childProfile');
                  }
                }}
              >
                <Text style={styles.buttonPrimaryText}>Продолжить</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {state.currentScreen === 'childProfile' ? (
          <>
            <Text style={styles.title}>Профиль ребёнка</Text>
            <Text style={styles.subtitle}>
              Сохраняем только минимальные данные, которые нужны для персонализации первого релиза.
            </Text>

            <View style={styles.formGrid}>
              <View style={styles.section}>
                <Text style={styles.label}>Имя</Text>
                <TextInput
                  placeholder="Например, Миша"
                  placeholderTextColor="#7c8aa5"
                  style={styles.input}
                  value={state.child.name}
                  onChangeText={(value) => updateChildField('name', value)}
                />
              </View>

              <View style={styles.inlineFields}>
                <View style={styles.inlineField}>
                  <Text style={styles.label}>Класс</Text>
                  <TextInput
                    placeholder="1"
                    placeholderTextColor="#7c8aa5"
                    style={styles.input}
                    keyboardType="number-pad"
                    value={state.child.grade}
                    onChangeText={(value) => updateChildField('grade', value.replace(/[^1-4]/g, '') || '1')}
                  />
                </View>

                <View style={styles.inlineField}>
                  <Text style={styles.label}>Возраст</Text>
                  <TextInput
                    placeholder="7"
                    placeholderTextColor="#7c8aa5"
                    style={styles.input}
                    keyboardType="number-pad"
                    value={state.child.age}
                    onChangeText={(value) => updateChildField('age', value.replace(/\D/g, ''))}
                  />
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.buttonSecondary} onPress={() => goToScreen('parentAuth')}>
                <Text style={styles.buttonSecondaryText}>Назад</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonPrimary, !canContinueFromChild && styles.buttonDisabled]}
                onPress={() => {
                  if (canContinueFromChild) {
                    goToScreen('learningPreferences');
                  }
                }}
              >
                <Text style={styles.buttonPrimaryText}>Дальше</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {state.currentScreen === 'learningPreferences' ? (
          <>
            <Text style={styles.title}>Предмет и цель</Text>
            <Text style={styles.subtitle}>
              В MVP пока один предмет, но интерфейс уже готов к будущему расширению.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Предмет</Text>
              {subjects.map((subject) => {
                const selected = subject.id === state.selectedSubjectId;

                return (
                  <Pressable
                    key={subject.id}
                    style={[styles.choiceCard, selected && styles.choiceCardSelected]}
                    onPress={() => updateSubject(subject.id)}
                  >
                    <Text style={styles.choiceTitle}>{subject.title}</Text>
                    <Text style={styles.choiceText}>{subject.description}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Цель обучения</Text>
              {goalOptions.map((goal) => {
                const selected = goal.id === state.selectedGoalId;

                return (
                  <Pressable
                    key={goal.id}
                    style={[styles.choiceCard, selected && styles.choiceCardSelected]}
                    onPress={() => updateGoal(goal.id)}
                  >
                    <Text style={styles.choiceTitle}>{goal.title}</Text>
                    <Text style={styles.choiceText}>{goal.description}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.buttonSecondary} onPress={() => goToScreen('childProfile')}>
                <Text style={styles.buttonSecondaryText}>Назад</Text>
              </Pressable>
              <Pressable style={styles.buttonPrimary} onPress={() => goToScreen('home')}>
                <Text style={styles.buttonPrimaryText}>Завершить</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {state.currentScreen === 'home' ? (
          <>
            <Text style={styles.title}>Домашний экран Sprint 1</Text>
            <Text style={styles.subtitle}>
              Теперь можно открыть тему, увидеть весь список уроков и вернуться в приложение ради нового streak.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{state.child.name || 'Ребёнок'} готов к старту</Text>
              <Text style={styles.summaryText}>Родитель: {state.parent.emailOrPhone}</Text>
              <Text style={styles.summaryText}>Класс: {state.child.grade || '1'}</Text>
              <Text style={styles.summaryText}>Предмет: {selectedSubject?.title}</Text>
              <Text style={styles.summaryText}>Цель: {selectedGoal?.title}</Text>
            </View>

            <View style={styles.progressCard}>
              <Text style={styles.sectionTitle}>Ритм обучения</Text>
              <Text style={styles.choiceText}>Текущий streak: {state.practiceStreak.currentDays} дн.</Text>
              <Text style={styles.choiceText}>Лучший streak: {state.practiceStreak.bestDays} дн.</Text>
              <Text style={styles.choiceText}>Пройдено уроков: {completedLessonsCount}</Text>
              <Text style={styles.choiceText}>Баллы: {state.totalPoints}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.buttonSecondary} onPress={() => goToScreen('progress')}>
                <Text style={styles.buttonSecondaryText}>Открыть прогресс</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Стартовый каталог тем</Text>
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => {
                  const lessons = starterLessonsByTopicId[topic.id] ?? [];
                  const completedLessons = state.topicProgress[topic.id]?.completedLessons ?? 0;
                  const nextLessonIndex = getNextLessonIndex(topic.id, state.topicProgress, lessons.length);

                  return (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      hasLesson={lessons.length > 0}
                      progressLabel={getTopicProgressLabel(topic, completedLessons)}
                      nextLessonLabel={getNextLessonLabel(lessons.length, nextLessonIndex, completedLessons)}
                      onOpenTopic={() => openTopicDetails(topic.id)}
                    />
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.choiceTitle}>Контент для этого класса ещё готовится</Text>
                  <Text style={styles.choiceText}>
                    Это пустое состояние из Sprint 1: пользователь видит понятное сообщение, а не пустой экран.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.buttonSecondary} onPress={() => goToScreen('learningPreferences')}>
                <Text style={styles.buttonSecondaryText}>Изменить выбор</Text>
              </Pressable>
              <Pressable style={styles.buttonPrimary} onPress={resetOnboarding}>
                <Text style={styles.buttonPrimaryText}>Пройти заново</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {state.currentScreen === 'topicDetails' ? (
          <>
            <Text style={styles.title}>{selectedTopic?.title ?? 'Тема'}</Text>
            <Text style={styles.subtitle}>
              Здесь можно выбрать конкретный урок. Следующий непройденный открыт сразу, а будущие шаги видны
              целиком.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Маршрут по теме</Text>
              <Text style={styles.summaryText}>
                Пройдено: {state.topicProgress[selectedTopicId ?? '']?.completedLessons ?? 0} из{' '}
                {selectedTopicLessons.length}
              </Text>
              <Text style={styles.summaryText}>
                {getNextLessonLabel(
                  selectedTopicLessons.length,
                  getNextLessonIndex(selectedTopicId ?? '', state.topicProgress, selectedTopicLessons.length),
                  state.topicProgress[selectedTopicId ?? '']?.completedLessons ?? 0,
                )}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Уроки темы</Text>
              {selectedTopicLessons.map((lesson, index) => {
                const completedLessons = state.topicProgress[selectedTopicId ?? '']?.completedLessons ?? 0;
                const isCompleted = index < completedLessons;
                const isNext = index === completedLessons && completedLessons < selectedTopicLessons.length;
                const isLocked = index > completedLessons;

                return (
                  <LessonPickerCard
                    key={lesson.id}
                    index={index}
                    lessonTitle={lesson.title}
                    durationLabel={lesson.durationLabel}
                    isCompleted={isCompleted}
                    isNext={isNext}
                    isLocked={isLocked}
                    onPress={() => {
                      if (!selectedTopicId || isLocked) {
                        return;
                      }

                      startLesson(selectedTopicId, index);
                    }}
                  />
                );
              })}
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.buttonSecondary} onPress={() => goToScreen('home')}>
                <Text style={styles.buttonSecondaryText}>Назад к темам</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {state.currentScreen === 'progress' ? (
          <>
            <Text style={styles.title}>Прогресс ребёнка</Text>
            <Text style={styles.subtitle}>
              Здесь видно, сколько уроков уже завершено, какой streak сейчас идёт и какие темы уже почти
              закрыты.
            </Text>

            <View style={styles.progressGrid}>
              <MetricCard label="Текущий streak" value={`${state.practiceStreak.currentDays}`} accent="gold" />
              <MetricCard label="Лучший streak" value={`${state.practiceStreak.bestDays}`} accent="green" />
              <MetricCard label="Уроков завершено" value={`${completedLessonsCount}`} accent="blue" />
              <MetricCard label="Баллы" value={`${state.totalPoints}`} accent="slate" />
            </View>

            <View style={styles.streakBanner}>
              <Text style={styles.summaryTitle}>Ритм дня</Text>
              <Text style={styles.summaryText}>{getStreakMessage(state.practiceStreak, completedLessonsCount)}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Достижения</Text>
              {getAchievements(
                completedLessonsCount,
                completedTopicsCount,
                masteredTopicsCount,
                state.practiceStreak.currentDays,
              ).map((achievement) => (
                <View key={achievement.title} style={styles.achievementCard}>
                  <Text style={styles.choiceTitle}>{achievement.title}</Text>
                  <Text style={styles.choiceText}>{achievement.description}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>История по темам</Text>
              {filteredTopics.map((topic) => (
                <ProgressHistoryRow
                  key={topic.id}
                  topic={topic}
                  progress={state.topicProgress[topic.id]}
                  nextLessonLabel={getNextLessonLabel(
                    starterLessonsByTopicId[topic.id]?.length ?? 0,
                    getNextLessonIndex(topic.id, state.topicProgress, starterLessonsByTopicId[topic.id]?.length ?? 0),
                    state.topicProgress[topic.id]?.completedLessons ?? 0,
                  )}
                />
              ))}
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.buttonSecondary} onPress={() => goToScreen('home')}>
                <Text style={styles.buttonSecondaryText}>Назад домой</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {state.currentScreen === 'lessonError' ? (
          <>
            <Text style={styles.title}>Разберём ошибку</Text>
            <Text style={styles.subtitle}>
              Короткое объяснение помогает понять ответ, а потом можно сразу попробовать ещё раз.
            </Text>

            <View style={styles.errorCard}>
              <Text style={styles.summaryTitle}>Что пошло не так</Text>
              <Text style={styles.summaryText}>{lastIncorrectExercise?.prompt ?? 'Вернись к заданию и попробуй снова.'}</Text>
              <Text style={styles.errorHintTitle}>Подсказка</Text>
              <Text style={styles.summaryText}>{lastIncorrectExercise?.hint ?? 'Подумай ещё раз и выбери другой вариант.'}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.buttonSecondary} onPress={leaveLesson}>
                <Text style={styles.buttonSecondaryText}>К урокам темы</Text>
              </Pressable>
              <Pressable style={styles.buttonSecondary} onPress={startSimilarExercise}>
                <Text style={styles.buttonSecondaryText}>Ещё похожее задание</Text>
              </Pressable>
              <Pressable style={styles.buttonPrimary} onPress={returnToExerciseFromError}>
                <Text style={styles.buttonPrimaryText}>Попробовать снова</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {state.currentScreen === 'lesson' ? (
          <>
            <Text style={styles.title}>{activeLesson?.title ?? 'Урок'}</Text>
            <Text style={styles.subtitle}>
              {lessonCompleted
                ? 'Урок завершён. Можно вернуться к списку уроков и продолжить тему.'
                : `Урок ${activeLessonRef ? activeLessonRef.lessonIndex + 1 : 1} из ${activeLessonList.length || 1}. Короткая практика на ${
                    activeLesson?.durationLabel ?? '5 минут'
                  } с моментальной проверкой.`}
            </Text>

            {!lessonCompleted && displayedExercise ? (
              <>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>
                    Задание {lessonStepIndex + 1} из {activeLesson?.exercises.length ?? 0}
                  </Text>
                  <Text style={styles.summaryText}>{displayedExercise.prompt}</Text>
                </View>

                <LessonExercise exercise={displayedExercise} answer={lessonAnswer} onChangeAnswer={setLessonAnswer} />

                {lessonFeedback ? <Text style={styles.feedbackText}>{lessonFeedback}</Text> : null}

                <View style={styles.actions}>
                  <Pressable style={styles.buttonSecondary} onPress={leaveLesson}>
                    <Text style={styles.buttonSecondaryText}>К урокам темы</Text>
                  </Pressable>
                  <Pressable style={styles.buttonPrimary} onPress={submitLessonAnswer}>
                    <Text style={styles.buttonPrimaryText}>Проверить ответ</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {lessonCompleted ? (
              <>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Урок пройден</Text>
                  <Text style={styles.summaryText}>
                    {state.child.name || 'Ребёнок'} завершил этот шаг. Текущий streak: {state.practiceStreak.currentDays} дн.
                  </Text>
                  <Text style={styles.summaryText}>Получено баллов: {lessonEarnedPoints}</Text>
                  <Text style={styles.summaryText}>Всего баллов: {state.totalPoints}</Text>
                </View>

                {lessonFeedback ? <Text style={styles.feedbackText}>{lessonFeedback}</Text> : null}

                <View style={styles.actions}>
                  <Pressable
                    style={styles.buttonSecondary}
                    onPress={() => {
                      if (activeLessonTopicId && activeLessonRef) {
                        startLesson(activeLessonTopicId, activeLessonRef.lessonIndex);
                      }
                    }}
                  >
                    <Text style={styles.buttonSecondaryText}>Пройти ещё раз</Text>
                  </Pressable>
                  <Pressable style={styles.buttonPrimary} onPress={leaveLesson}>
                    <Text style={styles.buttonPrimaryText}>К списку уроков</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </>
        ) : null}
      </View>
      <StatusBar style="light" />
    </ScrollView>
  );
}

interface TopicCardProps {
  topic: Topic;
  hasLesson: boolean;
  progressLabel: string;
  nextLessonLabel: string;
  onOpenTopic: () => void;
}

function TopicCard({ topic, hasLesson, progressLabel, nextLessonLabel, onOpenTopic }: TopicCardProps) {
  return (
    <View style={styles.topicCard}>
      <Text style={styles.choiceTitle}>{topic.title}</Text>
      <Text style={styles.choiceText}>{topic.lessonCount} коротких уроков в стартовом наборе</Text>
      <Text style={styles.topicProgressText}>{progressLabel}</Text>
      <Text style={styles.topicMetaText}>{nextLessonLabel}</Text>
      {hasLesson ? (
        <Pressable style={styles.topicButton} onPress={onOpenTopic}>
          <Text style={styles.topicButtonText}>Открыть тему</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface LessonPickerCardProps {
  index: number;
  lessonTitle: string;
  durationLabel: string;
  isCompleted: boolean;
  isNext: boolean;
  isLocked: boolean;
  onPress: () => void;
}

function LessonPickerCard({
  index,
  lessonTitle,
  durationLabel,
  isCompleted,
  isNext,
  isLocked,
  onPress,
}: LessonPickerCardProps) {
  return (
    <Pressable
      style={[
        styles.lessonPickerCard,
        isCompleted && styles.lessonPickerCardCompleted,
        isNext && styles.lessonPickerCardNext,
        isLocked && styles.lessonPickerCardLocked,
      ]}
      onPress={onPress}
    >
      <Text style={styles.choiceTitle}>Урок {index + 1}</Text>
      <Text style={styles.choiceText}>{lessonTitle}</Text>
      <Text style={styles.topicMetaText}>Длительность: {durationLabel}</Text>
      <Text style={styles.lessonStatusText}>
        {isCompleted ? 'Уже пройден' : isNext ? 'Открыт сейчас' : isLocked ? 'Откроется после предыдущего' : 'Доступен'}
      </Text>
    </Pressable>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  accent: 'blue' | 'green' | 'gold' | 'slate';
}

function MetricCard({ label, value, accent }: MetricCardProps) {
  return (
    <View
      style={[
        styles.metricCard,
        accent === 'green' && styles.metricCardGreen,
        accent === 'gold' && styles.metricCardGold,
        accent === 'slate' && styles.metricCardSlate,
      ]}
    >
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

interface ProgressHistoryRowProps {
  topic: Topic;
  progress?: TopicProgress;
  nextLessonLabel: string;
}

function ProgressHistoryRow({ topic, progress, nextLessonLabel }: ProgressHistoryRowProps) {
  return (
    <View style={styles.historyRow}>
      <View style={styles.historyRowTop}>
        <Text style={styles.choiceTitle}>{topic.title}</Text>
        <Text style={styles.historyBadge}>
          {progress?.completedLessons ?? 0}/{topic.lessonCount}
        </Text>
      </View>
      <Text style={styles.choiceText}>{getTopicProgressLabel(topic, progress?.completedLessons ?? 0)}</Text>
      <Text style={styles.historyDateText}>Баллы по теме: {progress?.pointsEarned ?? 0}</Text>
      <Text style={styles.historyDateText}>{nextLessonLabel}</Text>
      <Text style={styles.historyDateText}>
        {progress?.lastCompletedAt
          ? `Последнее завершение: ${formatDate(progress.lastCompletedAt)}`
          : 'Завершённых уроков пока нет'}
      </Text>
    </View>
  );
}

interface LessonExerciseProps {
  exercise: Exercise;
  answer: string;
  onChangeAnswer: (value: string) => void;
}

function LessonExercise({ exercise, answer, onChangeAnswer }: LessonExerciseProps) {
  if (exercise.type === 'text-input') {
    return (
      <View style={styles.section}>
        <Text style={styles.label}>Ответ ребёнка</Text>
        <TextInput
          placeholder="Введи ответ"
          placeholderTextColor="#7c8aa5"
          style={styles.input}
          value={answer}
          onChangeText={onChangeAnswer}
          keyboardType="number-pad"
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Выбери ответ</Text>
      {exercise.options?.map((option) => {
        const selected = answer === option.id;

        return (
          <Pressable
            key={option.id}
            style={[styles.choiceCard, selected && styles.choiceCardSelected]}
            onPress={() => onChangeAnswer(option.id)}
          >
            <Text style={styles.choiceTitle}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function getTopicProgressLabel(topic: Topic, completedLessons: number) {
  if (completedLessons <= 0) {
    return `Прогресс: 0 из ${topic.lessonCount}`;
  }

  if (completedLessons >= topic.lessonCount) {
    return 'Прогресс: тема полностью пройдена';
  }

  return `Прогресс: ${completedLessons} из ${topic.lessonCount}`;
}

function getNextLessonIndex(topicId: string, topicProgress: Record<string, TopicProgress>, lessonCount: number) {
  if (lessonCount <= 0) {
    return 0;
  }

  const completedLessons = topicProgress[topicId]?.completedLessons ?? 0;
  return Math.min(completedLessons, lessonCount - 1);
}

function getNextLessonLabel(lessonCount: number, nextLessonIndex: number, completedLessons: number) {
  if (lessonCount <= 0) {
    return 'Уроки скоро появятся';
  }

  if (completedLessons >= lessonCount) {
    return 'Все уроки в теме уже пройдены';
  }

  return `Следующий урок: ${nextLessonIndex + 1} из ${lessonCount}`;
}

function getProgressEntries(topicProgress: Record<string, TopicProgress>) {
  return Object.values(topicProgress).sort((left, right) => {
    const leftTime = left.lastCompletedAt ? Date.parse(left.lastCompletedAt) : 0;
    const rightTime = right.lastCompletedAt ? Date.parse(right.lastCompletedAt) : 0;

    return rightTime - leftTime;
  });
}

function calculateLessonPoints(exerciseCount: number, mistakeCount: number) {
  const basePoints = exerciseCount * 10;
  const penalty = mistakeCount * 3;
  return Math.max(5, basePoints - penalty);
}

function getNextPracticeStreak(practiceStreak: PracticeStreak): PracticeStreak {
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

function getAchievements(
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

function getStreakMessage(practiceStreak: PracticeStreak, completedLessonsCount: number) {
  if (completedLessonsCount === 0) {
    return 'После первого завершённого урока здесь начнётся серия ежедневной практики.';
  }

  if (practiceStreak.currentDays <= 1) {
    return 'Серия уже запущена. Следующее занятие завтра поможет превратить старт в привычку.';
  }

  return `Серия держится уже ${practiceStreak.currentDays} дн. Ещё один день подряд укрепит ритм.`;
}

function getCalendarDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getDateWithOffset(value: Date, offsetDays: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + offsetDays);
  return next;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#07111f',
  },
  loadingCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: 'rgba(13, 20, 34, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    gap: 12,
    alignItems: 'center',
  },
  loadingTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  loadingText: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  container: {
    position: 'relative',
    flexGrow: 1,
    backgroundColor: '#07111f',
    padding: 24,
    justifyContent: 'center',
  },
  heroGlowTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(99, 179, 237, 0.18)',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
  },
  card: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: 'rgba(13, 20, 34, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  progress: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  kicker: {
    color: '#7dd3fc',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(59, 130, 246, 0.16)',
  },
  pillText: {
    color: '#dbeafe',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  bullet: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    color: '#dbeafe',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    color: '#f8fafc',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  formGrid: {
    gap: 16,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineField: {
    flex: 1,
    gap: 10,
  },
  choiceCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 6,
  },
  choiceCardSelected: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(8, 47, 73, 0.72)',
  },
  choiceTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  choiceText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: 'rgba(12, 74, 110, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.25)',
    gap: 6,
  },
  progressCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: 'rgba(20, 83, 45, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.18)',
    gap: 6,
  },
  streakBanner: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: 'rgba(133, 77, 14, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.24)',
    gap: 6,
  },
  errorCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: 'rgba(127, 29, 29, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.22)',
    gap: 8,
  },
  errorHintTitle: {
    color: '#fecaca',
    fontSize: 14,
    fontWeight: '800',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: '47%',
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(12, 74, 110, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.25)',
    gap: 8,
  },
  metricCardGreen: {
    backgroundColor: 'rgba(20, 83, 45, 0.28)',
    borderColor: 'rgba(74, 222, 128, 0.18)',
  },
  metricCardGold: {
    backgroundColor: 'rgba(133, 77, 14, 0.24)',
    borderColor: 'rgba(251, 191, 36, 0.24)',
  },
  metricCardSlate: {
    backgroundColor: 'rgba(51, 65, 85, 0.34)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  achievementCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 6,
  },
  summaryTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  summaryText: {
    color: '#dbeafe',
    fontSize: 14,
    lineHeight: 20,
  },
  topicCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    marginBottom: 10,
    gap: 10,
  },
  topicProgressText: {
    color: '#86efac',
    fontSize: 13,
    fontWeight: '700',
  },
  topicMetaText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  topicButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  topicButtonText: {
    color: '#dbeafe',
    fontSize: 14,
    fontWeight: '700',
  },
  lessonPickerCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 8,
  },
  lessonPickerCardCompleted: {
    borderColor: 'rgba(74, 222, 128, 0.28)',
    backgroundColor: 'rgba(20, 83, 45, 0.28)',
  },
  lessonPickerCardNext: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(8, 47, 73, 0.72)',
  },
  lessonPickerCardLocked: {
    opacity: 0.6,
  },
  lessonStatusText: {
    color: '#fcd34d',
    fontSize: 13,
    fontWeight: '700',
  },
  historyRow: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 8,
  },
  historyRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  historyBadge: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
  },
  historyDateText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 8,
  },
  feedbackText: {
    color: '#bae6fd',
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  buttonPrimary: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#38bdf8',
  },
  buttonPrimaryText: {
    color: '#082f49',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonSecondary: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  buttonSecondaryText: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});

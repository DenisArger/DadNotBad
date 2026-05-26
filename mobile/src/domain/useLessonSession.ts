import { useEffect, useMemo, useState } from 'react';

import { starterLessonsByTopicId } from './content';
import {
  calculateLessonPoints,
  createSimilarExercise,
  getNextLessonIndex,
  getNextPracticeStreak,
  normalizeExerciseAnswer,
} from './lesson';
import { clearLessonSession, loadLessonSession, saveLessonSession } from './storage';
import { ActiveLessonRef, AppState, Exercise, PersistedLessonSession, ScreenId } from './types';

interface UseLessonSessionOptions {
  currentScreen: ScreenId;
  isHydrating: boolean;
  topicProgress: AppState['topicProgress'];
  setCurrentScreen: (screen: ScreenId) => void;
  updateAppState: (updater: (current: AppState) => AppState) => void;
}

const initialLessonSession = {
  selectedTopicId: null as string | null,
  activeLessonRef: null as ActiveLessonRef | null,
  lessonStepIndex: 0,
  lessonAnswer: '',
  lessonFeedback: null as string | null,
  lessonCompleted: false,
  lessonMistakes: 0,
  lessonEarnedPoints: 0,
  lastIncorrectExercise: null as Exercise | null,
  similarExercise: null as Exercise | null,
  isSimilarExerciseMode: false,
};

export function useLessonSession({
  currentScreen,
  isHydrating,
  topicProgress,
  setCurrentScreen,
  updateAppState,
}: UseLessonSessionOptions) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(initialLessonSession.selectedTopicId);
  const [activeLessonRef, setActiveLessonRef] = useState<ActiveLessonRef | null>(initialLessonSession.activeLessonRef);
  const [lessonStepIndex, setLessonStepIndex] = useState(initialLessonSession.lessonStepIndex);
  const [lessonAnswer, setLessonAnswer] = useState(initialLessonSession.lessonAnswer);
  const [lessonFeedback, setLessonFeedback] = useState<string | null>(initialLessonSession.lessonFeedback);
  const [lessonCompleted, setLessonCompleted] = useState(initialLessonSession.lessonCompleted);
  const [lessonMistakes, setLessonMistakes] = useState(initialLessonSession.lessonMistakes);
  const [lessonEarnedPoints, setLessonEarnedPoints] = useState(initialLessonSession.lessonEarnedPoints);
  const [lastIncorrectExercise, setLastIncorrectExercise] = useState<Exercise | null>(
    initialLessonSession.lastIncorrectExercise,
  );
  const [similarExercise, setSimilarExercise] = useState<Exercise | null>(initialLessonSession.similarExercise);
  const [isSimilarExerciseMode, setIsSimilarExerciseMode] = useState(initialLessonSession.isSimilarExerciseMode);
  const [storedLessonSession, setStoredLessonSession] = useState<PersistedLessonSession | null>(null);

  const activeLessonTopicId = activeLessonRef?.topicId ?? null;
  const activeLessonList = useMemo(
    () => (activeLessonTopicId ? starterLessonsByTopicId[activeLessonTopicId] ?? [] : []),
    [activeLessonTopicId],
  );
  const activeLesson =
    activeLessonRef && activeLessonList[activeLessonRef.lessonIndex]
      ? activeLessonList[activeLessonRef.lessonIndex]
      : null;
  const activeExercise = activeLesson?.exercises[lessonStepIndex] ?? null;
  const displayedExercise = isSimilarExerciseMode ? similarExercise : activeExercise;
  const hasActiveLessonSession = Boolean(activeLessonRef) && !lessonCompleted;

  useEffect(() => {
    let cancelled = false;

    loadLessonSession()
      .then((session) => {
        if (!cancelled) {
          setStoredLessonSession(session);
        }
      })
      .catch((error) => {
        console.warn('Failed to load lesson session', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    if (!hasActiveLessonSession) {
      clearLessonSession().catch((error) => {
        console.warn('Failed to clear lesson session', error);
      });
      return;
    }

    saveLessonSession({
      selectedTopicId,
      activeLessonRef,
      lessonStepIndex,
      lessonAnswer,
      lessonFeedback,
      lessonCompleted,
      lessonMistakes,
      lessonEarnedPoints,
      lastIncorrectExercise,
      similarExercise,
      isSimilarExerciseMode,
      currentScreen: currentScreen === 'lessonError' ? 'lessonError' : 'lesson',
    }).catch((error) => {
      console.warn('Failed to save lesson session', error);
    });
  }, [
    activeLessonRef,
    currentScreen,
    hasActiveLessonSession,
    isHydrating,
    isSimilarExerciseMode,
    lastIncorrectExercise,
    lessonAnswer,
    lessonCompleted,
    lessonEarnedPoints,
    lessonFeedback,
    lessonMistakes,
    lessonStepIndex,
    selectedTopicId,
    similarExercise,
  ]);

  const restoreLessonSession = (session: PersistedLessonSession) => {
    setSelectedTopicId(session.selectedTopicId);
    setActiveLessonRef(session.activeLessonRef);
    setLessonStepIndex(session.lessonStepIndex);
    setLessonAnswer(session.lessonAnswer);
    setLessonFeedback(session.lessonFeedback);
    setLessonCompleted(session.lessonCompleted);
    setLessonMistakes(session.lessonMistakes);
    setLessonEarnedPoints(session.lessonEarnedPoints);
    setLastIncorrectExercise(session.lastIncorrectExercise);
    setSimilarExercise(session.similarExercise);
    setIsSimilarExerciseMode(session.isSimilarExerciseMode);
    setCurrentScreen(session.currentScreen);
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

  const openTopicDetails = (topicId: string) => {
    setSelectedTopicId(topicId);
    resetLessonState();
    setCurrentScreen('topicDetails');
  };

  const startLesson = (topicId: string, lessonIndex?: number) => {
    const lessons = starterLessonsByTopicId[topicId];

    if (!lessons || lessons.length === 0) {
      return;
    }

    const safeLessonIndex = Math.min(
      typeof lessonIndex === 'number' ? lessonIndex : getNextLessonIndex(topicId, topicProgress, lessons.length),
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
    setCurrentScreen('lesson');
  };

  const leaveLesson = () => {
    resetLessonState();
    setCurrentScreen(selectedTopicId ? 'topicDetails' : 'home');
  };

  const returnToExerciseFromError = () => {
    setLessonAnswer('');
    setCurrentScreen('lesson');
  };

  const startSimilarExercise = () => {
    if (!lastIncorrectExercise) {
      returnToExerciseFromError();
      return;
    }

    setSimilarExercise(createSimilarExercise(lastIncorrectExercise));
    setIsSimilarExerciseMode(true);
    setLessonAnswer('');
    setLessonFeedback('РџРѕРїСЂРѕР±СѓРµРј РµС‰С‘ РѕРґРЅРѕ РїРѕС…РѕР¶РµРµ Р·Р°РґР°РЅРёРµ, С‡С‚РѕР±С‹ Р·Р°РєСЂРµРїРёС‚СЊ РЅР°РІС‹Рє.');
    setCurrentScreen('lesson');
  };

  const markTopicLessonCompleted = (topicId: string, earnedPoints: number) => {
    const lessons = starterLessonsByTopicId[topicId];

    if (!lessons) {
      return;
    }

    updateAppState((current) => {
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
        lessonHistory: activeLesson
          ? [
              {
                id: `${activeLesson.id}-${Date.now()}`,
                topicId,
                lessonId: activeLesson.id,
                completedAt: new Date().toISOString(),
                earnedPoints,
                mistakeCount: lessonMistakes,
              },
              ...current.lessonHistory,
            ].slice(0, 200)
          : current.lessonHistory,
      };
    });
  };

  const submitLessonAnswer = () => {
    const exerciseToCheck = isSimilarExerciseMode ? similarExercise : activeExercise;

    if (!exerciseToCheck) {
      return;
    }

    const expectedAnswer = normalizeExerciseAnswer(exerciseToCheck, exerciseToCheck.answer);
    const currentAnswer = normalizeExerciseAnswer(exerciseToCheck, lessonAnswer);

    if (!currentAnswer) {
      setLessonFeedback('РЎРЅР°С‡Р°Р»Р° РІС‹Р±РµСЂРё РёР»Рё РІРІРµРґРё РѕС‚РІРµС‚.');
      return;
    }

    if (currentAnswer === expectedAnswer) {
      if (isSimilarExerciseMode) {
        setIsSimilarExerciseMode(false);
        setSimilarExercise(null);
        setLessonAnswer('');
        setLessonFeedback(
          'РћС‚Р»РёС‡РЅРѕ! РџРѕС…РѕР¶РµРµ Р·Р°РґР°РЅРёРµ РїРѕР»СѓС‡РёР»РѕСЃСЊ. РўРµРїРµСЂСЊ РјРѕР¶РЅРѕ РІРµСЂРЅСѓС‚СЊСЃСЏ Рє РѕСЃРЅРѕРІРЅРѕРјСѓ РІРѕРїСЂРѕСЃСѓ.',
        );
        setCurrentScreen('lessonError');
        return;
      }

      const nextStep = lessonStepIndex + 1;

      if (activeLesson && activeLessonTopicId && nextStep >= activeLesson.exercises.length) {
        const earnedPoints = calculateLessonPoints(activeLesson.exercises.length, lessonMistakes);
        markTopicLessonCompleted(activeLessonTopicId, earnedPoints);
        setLessonEarnedPoints(earnedPoints);
        setLessonCompleted(true);
        setLessonFeedback('РћС‚Р»РёС‡РЅРѕ! РЈСЂРѕРє Р·Р°РІРµСЂС€С‘РЅ Р±РµР· РѕС€РёР±РѕРє.');
      } else {
        setLessonStepIndex(nextStep);
        setLessonAnswer('');
        setLessonFeedback('Р’РµСЂРЅРѕ! РџРµСЂРµС…РѕРґРёРј Рє СЃР»РµРґСѓСЋС‰РµРјСѓ Р·Р°РґР°РЅРёСЋ.');
      }

      return;
    }

    setLessonMistakes((current) => current + 1);
    setLastIncorrectExercise(exerciseToCheck);
    setSimilarExercise(createSimilarExercise(exerciseToCheck));
    setLessonFeedback(`РџРѕРєР° РјРёРјРѕ. РџРѕРґСЃРєР°Р·РєР°: ${exerciseToCheck.hint}`);
    setIsSimilarExerciseMode(false);
    setCurrentScreen('lessonError');
  };

  return {
    activeExercise,
    activeLesson,
    activeLessonList,
    activeLessonRef,
    activeLessonTopicId,
    displayedExercise,
    isSimilarExerciseMode,
    lastIncorrectExercise,
    lessonAnswer,
    lessonCompleted,
    lessonEarnedPoints,
    lessonFeedback,
    lessonMistakes,
    lessonStepIndex,
    restoreStoredLessonSession: () => {
      if (storedLessonSession) {
        restoreLessonSession(storedLessonSession);
      }
    },
    selectedTopicId,
    setSelectedTopicId,
    setLessonAnswer,
    startLesson,
    startSimilarExercise,
    leaveLesson,
    openTopicDetails,
    resetLessonState,
    returnToExerciseFromError,
    submitLessonAnswer,
  };
}

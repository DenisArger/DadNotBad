import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppState, PersistedLessonSession } from './types';

const APP_STATE_STORAGE_KEY = 'dadnotbad.app-state.v1';
const LESSON_SESSION_STORAGE_KEY = 'dadnotbad.lesson-session.v1';

export async function loadAppState(): Promise<AppState | null> {
  const rawValue = await AsyncStorage.getItem(APP_STATE_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as AppState;
}

export async function saveAppState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
}

export async function loadLessonSession(): Promise<PersistedLessonSession | null> {
  const rawValue = await AsyncStorage.getItem(LESSON_SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as PersistedLessonSession;
}

export async function saveLessonSession(session: PersistedLessonSession): Promise<void> {
  await AsyncStorage.setItem(LESSON_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function clearLessonSession(): Promise<void> {
  await AsyncStorage.removeItem(LESSON_SESSION_STORAGE_KEY);
}

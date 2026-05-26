import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppState } from './types';

const APP_STATE_STORAGE_KEY = 'dadnotbad.app-state.v1';

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

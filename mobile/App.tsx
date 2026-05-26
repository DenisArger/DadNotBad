import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { goalOptions, starterTopics, subjects } from './src/domain/content';
import { loadAppState, saveAppState } from './src/domain/storage';
import { AppState, GoalId, ScreenId, SubjectId } from './src/domain/types';

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
};

const screenOrder: ScreenId[] = ['welcome', 'parentAuth', 'childProfile', 'learningPreferences', 'home'];

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const hydrateState = async () => {
      try {
        const storedState = await loadAppState();

        if (storedState && !cancelled) {
          setState(storedState);
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

  const resetOnboarding = () => {
    setState(initialState);
  };

  const canContinueFromAuth = state.parent.emailOrPhone.trim().length >= 5;
  const canContinueFromChild = state.child.name.trim().length >= 2;

  if (isHydrating) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingTitle}>Восстанавливаем прогресс</Text>
          <Text style={styles.loadingText}>Секунду, загружаем сохранённый онбординг и выбор ребёнка.</Text>
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
              Начинаем Sprint 1: собираем рабочий онбординг, профиль ребёнка и стартовый каталог тем для
              первого урока.
            </Text>

            <View style={styles.pills}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Expo</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Onboarding</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>MVP</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Что уже закладываем</Text>
              <Text style={styles.bullet}>Регистрация родителя</Text>
              <Text style={styles.bullet}>Профиль ребёнка</Text>
              <Text style={styles.bullet}>Выбор предмета и цели</Text>
              <Text style={styles.bullet}>Стартовый каталог тем</Text>
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
              В MVP оставляем один предмет, но интерфейс уже готов к будущему расширению.
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
              Онбординг завершён. Ниже уже показан стартовый контент для первого предмета и выбранного класса.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{state.child.name || 'Ребёнок'} готов к старту</Text>
              <Text style={styles.summaryText}>Родитель: {state.parent.emailOrPhone}</Text>
              <Text style={styles.summaryText}>Класс: {state.child.grade || '1'}</Text>
              <Text style={styles.summaryText}>Предмет: {selectedSubject?.title}</Text>
              <Text style={styles.summaryText}>Цель: {selectedGoal?.title}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Стартовый каталог тем</Text>
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <View key={topic.id} style={styles.topicCard}>
                    <Text style={styles.choiceTitle}>{topic.title}</Text>
                    <Text style={styles.choiceText}>{topic.lessonCount} коротких уроков в стартовом наборе</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.choiceTitle}>Контент для этого класса ещё готовится</Text>
                  <Text style={styles.choiceText}>
                    Это пустое состояние из Sprint 1: пользователь видит понятное сообщение, а не пустой
                    экран.
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
      </View>
      <StatusBar style="light" />
    </ScrollView>
  );
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
  },
  emptyState: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 8,
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

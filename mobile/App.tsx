import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroGlow} />
      <View style={styles.card}>
        <Text style={styles.kicker}>DadNotBad MVP</Text>
        <Text style={styles.title}>Учебное приложение для детей и родителей</Text>
        <Text style={styles.subtitle}>
          React Native + Expo как единая база для mobile и web. Следующий шаг -
          Sprint 1: онбординг, профили и первый учебный каталог.
        </Text>

        <View style={styles.pills}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Mobile</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Web</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Expo</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sprint 1 фокус</Text>
          <Text style={styles.bullet}>- Регистрация родителя</Text>
          <Text style={styles.bullet}>- Профиль ребёнка</Text>
          <Text style={styles.bullet}>- Выбор предмета и цели</Text>
          <Text style={styles.bullet}>- Стартовый каталог тем</Text>
        </View>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Начать Sprint 1</Text>
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#0b1220',
    padding: 24,
    justifyContent: 'center',
  },
  heroGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(99, 179, 237, 0.18)',
  },
  card: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: 'rgba(13, 20, 34, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  kicker: {
    color: '#7dd3fc',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
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
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  bullet: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#38bdf8',
  },
  buttonText: {
    color: '#082f49',
    fontSize: 15,
    fontWeight: '800',
  },
});

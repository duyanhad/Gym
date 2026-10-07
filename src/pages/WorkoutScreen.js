import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import AppLayout from '../layouts/AppLayout';

const exercises = [
  { name: 'Squat', detail: '3 hiệp  ·  12 lần' },
  { name: 'Chống đẩy', detail: '3 hiệp  ·  10 lần' },
  { name: 'Plank', detail: '3 hiệp  ·  30 giây' },
];

export default function WorkoutScreen() {
  return (
    <AppLayout style={styles.page}>
      <Text style={styles.eyebrow}>THỨ 2  ·  BUỔI TẬP 01</Text>
      <Text style={styles.title}>Toàn thân</Text>
      <Text style={styles.subtitle}>Hoàn thành từng bài, tiến gần hơn tới mục tiêu.</Text>

      <View style={styles.list}>
        {exercises.map((exercise, index) => (
          <View key={exercise.name} style={styles.exercise}>
            <Text style={styles.number}>0{index + 1}</Text>
            <View>
              <Text style={styles.name}>{exercise.name}</Text>
              <Text style={styles.detail}>{exercise.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 24,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    marginTop: 10,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  list: {
    gap: 12,
    marginTop: 32,
  },
  exercise: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: '#282F39',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 18,
  },
  number: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '800',
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  detail: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 5,
  },
});

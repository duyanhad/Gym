import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Card from '../components/Card';
import Chip from '../components/Chip';
import { colors, spacing } from '../constants/theme';
import { MUSCLE_GROUPS, useWorkout } from '../contexts/WorkoutContext';
import TabScreenLayout from '../layouts/TabScreenLayout';

const GROUP_ICONS = {
  Ngực: 'body-outline',
  Lưng: 'accessibility-outline',
  Chân: 'walk-outline',
  Vai: 'fitness-outline',
  Tay: 'hand-left-outline',
  Bụng: 'ellipse-outline',
  Cardio: 'heart-outline',
};

export default function ExercisesScreen({ navigation }) {
  const { exercises, removeExercise } = useWorkout();

  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('Tất cả');
  const [error, setError] = useState('');

  const handleDelete = async (exercise) => {
    setError('');

    try {
      await removeExercise(exercise.id);
    } catch (requestError) {
      setError(requestError.message ?? 'Không xoá được bài tập.');
    }
  };

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchGroup = group === 'Tất cả' || exercise.group === group;
      const matchKeyword = !keyword || exercise.name.toLowerCase().includes(keyword);

      return matchGroup && matchKeyword;
    });
  }, [exercises, group, search]);

  return (
    <TabScreenLayout testID="exercises-screen" style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={colors.icon} />
          <TextInput
            testID="exercise-search"
            accessibilityLabel="Tìm bài tập"
            onChangeText={setSearch}
            placeholder="Tìm bài tập..."
            placeholderTextColor="#5C6672"
            style={styles.searchInput}
            value={search}
          />
          {search ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Xoá từ khoá tìm kiếm"
              onPress={() => setSearch('')}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Ionicons name="close-circle" size={18} color={colors.icon} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={styles.filterRow}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {['Tất cả', ...MUSCLE_GROUPS].map((item) => (
            <Chip key={item} label={item} onPress={() => setGroup(item)} selected={group === item} />
          ))}
        </ScrollView>

        <Text testID="exercise-count" style={styles.count}>
          {filtered.length} BÀI TẬP
        </Text>

        {error ? (
          <View testID="exercise-error" style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#FF8F8F" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="barbell-outline" size={26} color={colors.dim} />
            <Text style={styles.emptyTitle}>Không tìm thấy bài tập nào</Text>
            <Text style={styles.emptyHint}>Thử từ khoá khác hoặc thêm bài tập mới.</Text>
          </Card>
        ) : (
          filtered.map((exercise) => (
            <Card key={exercise.id} style={styles.exerciseCard} testID={`exercise-${exercise.id}`}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseIcon}>
                  <Ionicons name={GROUP_ICONS[exercise.group] ?? 'barbell-outline'} size={18} color={colors.accent} />
                </View>

                <View style={styles.exerciseTitleBlock}>
                  <Text numberOfLines={1} style={styles.exerciseName}>
                    {exercise.name}
                  </Text>
                  <Text style={styles.exerciseGroup}>{exercise.group}</Text>
                </View>

                {exercise.isSystem ? (
                  <View testID={`system-${exercise.id}`} style={styles.systemBadge}>
                    <Text style={styles.systemBadgeText}>MẪU</Text>
                  </View>
                ) : (
                  <Pressable
                    testID={`delete-${exercise.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Xoá bài tập ${exercise.name}`}
                    onPress={() => handleDelete(exercise)}
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </Pressable>
                )}
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{exercise.sets}</Text>
                  <Text style={styles.metricLabel}>Hiệp</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{exercise.reps}</Text>
                  <Text style={styles.metricLabel}>Lần</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{exercise.restSeconds}s</Text>
                  <Text style={styles.metricLabel}>Nghỉ</Text>
                </View>
              </View>

              {exercise.note ? <Text style={styles.exerciseNote}>{exercise.note}</Text> : null}
            </Card>
          ))
        )}

        <Pressable
          testID="goto-add-exercise"
          accessibilityRole="button"
          accessibilityLabel="Thêm bài tập mới"
          onPress={() => navigation.navigate('AddExercise')}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={20} color={colors.background} />
          <Text style={styles.addButtonLabel}>THÊM BÀI TẬP MỚI</Text>
        </Pressable>
      </ScrollView>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: spacing.page,
  },
  content: {
    paddingBottom: 24,
    paddingTop: 12,
  },
  searchRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    outlineStyle: 'none',
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  filterScroll: {
    marginTop: 14,
  },
  filterRow: {
    gap: 8,
    paddingRight: 8,
  },
  count: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 12,
    marginTop: 18,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  emptyHint: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  exerciseCard: {
    marginBottom: 12,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  exerciseIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  exerciseTitleBlock: {
    flex: 1,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  exerciseGroup: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  systemBadge: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  systemBadgeText: {
    color: colors.dim,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(255, 91, 91, 0.35)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    padding: 12,
  },
  errorText: {
    color: '#FF8F8F',
    flex: 1,
    fontSize: 11,
  },
  metricRow: {
    borderTopColor: '#232A34',
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
  },
  metricValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 10,
  },
  exerciseNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 16,
  },
  addButtonLabel: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});

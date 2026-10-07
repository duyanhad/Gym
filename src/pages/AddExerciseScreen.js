import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Card from '../components/Card';
import Chip from '../components/Chip';
import { colors, spacing } from '../constants/theme';
import { MUSCLE_GROUPS, useWorkout } from '../contexts/WorkoutContext';
import TabScreenLayout from '../layouts/TabScreenLayout';

const EMPTY_DRAFT = {
  name: '',
  group: MUSCLE_GROUPS[0],
  sets: '4',
  reps: '10',
  restSeconds: '60',
  note: '',
};

export default function AddExerciseScreen({ navigation }) {
  const { addExercise } = useWorkout();

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [error, setError] = useState('');
  const [savedName, setSavedName] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (error) setError('');
    if (savedName) setSavedName('');
  };

  const handleSave = async () => {
    if (!draft.name.trim()) {
      setError('Vui lòng nhập tên bài tập.');
      return;
    }

    setSaving(true);

    try {
      const exercise = await addExercise(draft);

      setSavedName(exercise.name);
      setDraft({ ...EMPTY_DRAFT, group: draft.group });
    } catch (requestError) {
      setError(requestError.message ?? 'Không lưu được bài tập.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TabScreenLayout testID="add-exercise-screen" style={styles.page}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Text style={styles.eyebrow}>BÀI TẬP MỚI</Text>
            <Text style={styles.title}>Thêm vào giáo án của bạn</Text>

            <Text style={styles.label}>Tên bài tập</Text>
            <View style={styles.field}>
              <Ionicons name="barbell-outline" size={18} color={colors.icon} />
              <TextInput
                testID="exercise-name"
                accessibilityLabel="Tên bài tập"
                onChangeText={(value) => update('name', value)}
                placeholder="Ví dụ: Bench Press"
                placeholderTextColor="#5C6672"
                style={styles.input}
                value={draft.name}
              />
            </View>

            <Text style={styles.label}>Nhóm cơ</Text>
            <View style={styles.groupRow}>
              {MUSCLE_GROUPS.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  onPress={() => update('group', item)}
                  selected={draft.group === item}
                  testID={`exercise-group-${item}`}
                />
              ))}
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricField}>
                <Text style={styles.label}>Số hiệp</Text>
                <TextInput
                  testID="exercise-sets"
                  accessibilityLabel="Số hiệp"
                  keyboardType="number-pad"
                  onChangeText={(value) => update('sets', value.replace(/[^0-9]/g, ''))}
                  style={styles.metricInput}
                  value={draft.sets}
                />
              </View>

              <View style={styles.metricField}>
                <Text style={styles.label}>Số lần</Text>
                <TextInput
                  testID="exercise-reps"
                  accessibilityLabel="Số lần"
                  keyboardType="number-pad"
                  onChangeText={(value) => update('reps', value.replace(/[^0-9]/g, ''))}
                  style={styles.metricInput}
                  value={draft.reps}
                />
              </View>

              <View style={styles.metricField}>
                <Text style={styles.label}>Nghỉ (giây)</Text>
                <TextInput
                  testID="exercise-rest"
                  accessibilityLabel="Thời gian nghỉ"
                  keyboardType="number-pad"
                  onChangeText={(value) => update('restSeconds', value.replace(/[^0-9]/g, ''))}
                  style={styles.metricInput}
                  value={draft.restSeconds}
                />
              </View>
            </View>

            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              testID="exercise-note"
              accessibilityLabel="Ghi chú"
              multiline
              onChangeText={(value) => update('note', value)}
              placeholder="Kỹ thuật, mức tạ, lưu ý khi tập..."
              placeholderTextColor="#5C6672"
              style={[styles.input, styles.noteInput]}
              value={draft.note}
            />

            {error ? (
              <View testID="exercise-error" style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color="#FF8F8F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {savedName ? (
              <View testID="exercise-saved" style={styles.successBox}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                <Text style={styles.successText}>Đã thêm bài tập “{savedName}”.</Text>
              </View>
            ) : null}

            <Pressable
              testID="exercise-save"
              accessibilityRole="button"
              accessibilityLabel="Lưu bài tập"
              disabled={saving}
              onPress={handleSave}
              style={({ pressed }) => [styles.saveButton, (pressed || saving) && styles.pressed]}
            >
              <Ionicons name="save-outline" size={18} color={colors.background} />
              <Text style={styles.saveLabel}>{saving ? 'ĐANG LƯU...' : 'LƯU BÀI TẬP'}</Text>
            </Pressable>

            <Pressable
              testID="exercise-goto-list"
              accessibilityRole="button"
              accessibilityLabel="Xem danh sách bài tập"
              onPress={() => navigation.navigate('Exercises')}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryLabel}>Xem danh sách bài tập</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.accent} />
            </Pressable>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: spacing.page,
  },
  fill: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
    paddingTop: 12,
  },
  card: {
    marginBottom: 12,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
    marginTop: 8,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 18,
  },
  field: {
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
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 15,
    outlineStyle: 'none',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noteInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  groupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricField: {
    flex: 1,
  },
  metricInput: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    outlineStyle: 'none',
    paddingVertical: 13,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(255, 91, 91, 0.45)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: '#FF8F8F',
    flex: 1,
    fontSize: 13,
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderColor: 'rgba(74, 222, 128, 0.42)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  successText: {
    color: colors.success,
    flex: 1,
    fontSize: 13,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 22,
    paddingVertical: 16,
  },
  saveLabel: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.inputBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 14,
  },
  secondaryLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
    marginRight: 4,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { WEEK_ORDER } from '../constants/workoutTemplates';
import { useWorkout } from '../contexts/WorkoutContext';
import AppLayout from '../layouts/AppLayout';

export default function WeeklyPlanScreen({ navigation }) {
  const { plans, weekPlan, exercises, assignPlanToWeekday, planById, deletePlan, savePlan, stats, weekdayLabel } =
    useWorkout();

  const [openWeekday, setOpenWeekday] = useState(null);
  const [draft, setDraft] = useState({ name: '', focus: '', note: '' });
  const [picked, setPicked] = useState({});
  const [error, setError] = useState('');
  const [savedName, setSavedName] = useState('');

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (error) setError('');
    if (savedName) setSavedName('');
  };

  const togglePicked = (exercise) => {
    setPicked((current) => {
      if (current[exercise.id]) {
        const next = { ...current };
        delete next[exercise.id];

        return next;
      }

      return { ...current, [exercise.id]: { sets: String(exercise.sets), reps: String(exercise.reps) } };
    });

    if (error) setError('');
  };

  const updatePickedMetric = (exerciseId, field, value) => {
    setPicked((current) => ({
      ...current,
      [exerciseId]: { ...current[exerciseId], [field]: value.replace(/[^0-9]/g, '') },
    }));
  };

  const handleSavePlan = () => {
    const selectedIds = Object.keys(picked);

    if (!draft.name.trim()) {
      setError('Vui lòng nhập tên buổi tập.');
      return;
    }

    if (selectedIds.length === 0) {
      setError('Chọn ít nhất 1 bài tập cho buổi tập này.');
      return;
    }

    const plan = savePlan({
      name: draft.name,
      focus: draft.focus,
      note: draft.note,
      items: selectedIds.map((exerciseId) => {
        const exercise = exercises.find((item) => item.id === exerciseId);

        return {
          exerciseName: exercise.name,
          targetSets: picked[exerciseId].sets,
          targetReps: picked[exerciseId].reps,
        };
      }),
    });

    setSavedName(plan.name);
    setDraft({ name: '', focus: '', note: '' });
    setPicked({});
  };

  return (
    <AppLayout testID="weekly-plan-screen" style={styles.page}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Card tone="accent" style={styles.heroCard}>
            <Text style={styles.eyebrow}>LỊCH TẬP TUẦN</Text>
            <Text style={styles.heroTitle}>Tự lên lịch theo giáo án của bạn</Text>
            <Text style={styles.heroText}>
              Chọn buổi tập cho từng thứ trong tuần. Buổi tập lấy từ bộ tài liệu có sẵn bên dưới hoặc do bạn tự tạo.
            </Text>
            <Text testID="weekly-scheduled" style={styles.heroMeta}>
              Đang xếp {stats.scheduledWeekdays}/7 ngày tập mỗi tuần
            </Text>
          </Card>

          <Text style={styles.sectionHeading}>CHỌN BUỔI TẬP CHO TỪNG THỨ</Text>

          {WEEK_ORDER.map((weekday) => {
            const assignedPlan = planById(weekPlan[weekday]);
            const expanded = openWeekday === weekday;

            return (
              <Card key={weekday} style={styles.weekdayCard} testID={`weekday-row-${weekday}`}>
                <View style={styles.weekdayHeader}>
                  <View style={styles.weekdayIcon}>
                    <Ionicons
                      name={assignedPlan ? 'barbell-outline' : 'bed-outline'}
                      size={16}
                      color={assignedPlan ? colors.accent : colors.dim}
                    />
                  </View>

                  <View style={styles.weekdayText}>
                    <Text style={styles.weekdayName}>{weekdayLabel(weekday)}</Text>
                    <Text numberOfLines={1} style={[styles.weekdayPlan, !assignedPlan && styles.weekdayRest]}>
                      {assignedPlan ? assignedPlan.name : 'Nghỉ / chưa xếp buổi tập'}
                    </Text>
                  </View>

                  <Pressable
                    testID={`weekday-pick-${weekday}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Chọn buổi tập cho ${weekdayLabel(weekday)}`}
                    onPress={() => setOpenWeekday(expanded ? null : weekday)}
                    style={({ pressed }) => [styles.pickButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.pickLabel}>{expanded ? 'ĐÓNG' : 'CHỌN'}</Text>
                  </Pressable>
                </View>

                {expanded ? (
                  <View style={styles.optionBlock}>
                    <Pressable
                      testID={`weekday-option-${weekday}-none`}
                      accessibilityRole="button"
                      accessibilityLabel="Nghỉ"
                      onPress={() => {
                        assignPlanToWeekday(weekday, null);
                        setOpenWeekday(null);
                      }}
                      style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
                    >
                      <Ionicons name="remove-circle-outline" size={16} color={colors.muted} />
                      <Text style={styles.optionText}>Nghỉ (không tập)</Text>
                    </Pressable>

                    {plans.map((plan) => (
                      <Pressable
                        key={plan.id}
                        testID={`weekday-option-${weekday}-${plan.id}`}
                        accessibilityRole="button"
                        accessibilityLabel={plan.name}
                        onPress={() => {
                          assignPlanToWeekday(weekday, plan.id);
                          setOpenWeekday(null);
                        }}
                        style={({ pressed }) => [
                          styles.optionRow,
                          weekPlan[weekday] === plan.id && styles.optionRowActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name={weekPlan[weekday] === plan.id ? 'radio-button-on' : 'radio-button-off'}
                          size={16}
                          color={weekPlan[weekday] === plan.id ? colors.accent : colors.icon}
                        />
                        <View style={styles.optionTextBlock}>
                          <Text style={styles.optionText}>{plan.name}</Text>
                          {plan.focus ? <Text style={styles.optionMeta}>{plan.focus}</Text> : null}
                        </View>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </Card>
            );
          })}

          <Text style={styles.sectionHeading}>GIÁO ÁN CÓ SẴN ({plans.length})</Text>

          {plans.map((plan) => (
            <Card key={plan.id} style={styles.planCard} testID={`plan-${plan.id}`}>
              <View style={styles.planHeader}>
                <View style={styles.planTitleBlock}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.focus ? <Text style={styles.planFocus}>{plan.focus}</Text> : null}
                </View>

                <Pressable
                  testID={`plan-delete-${plan.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Xoá buổi tập ${plan.name}`}
                  onPress={() => deletePlan(plan.id)}
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </Pressable>
              </View>

              {plan.items.map((item) => (
                <View key={item.exerciseName} style={styles.planItemRow}>
                  <Ionicons name="fitness-outline" size={14} color={colors.accent} />
                  <Text style={styles.planItemName}>{item.exerciseName}</Text>
                  <Text style={styles.planItemTarget}>
                    {item.targetSets} × {item.targetReps}
                  </Text>
                </View>
              ))}

              {plan.note ? <Text style={styles.planNote}>{plan.note}</Text> : null}
            </Card>
          ))}

          <Card style={styles.createCard}>
            <Text style={styles.sectionTitle}>TẠO BUỔI TẬP MỚI</Text>

            <Text style={styles.label}>Tên buổi tập</Text>
            <TextInput
              testID="plan-name"
              accessibilityLabel="Tên buổi tập"
              onChangeText={(value) => updateDraft('name', value)}
              placeholder="Ví dụ: Buổi Push (Ngực - Vai - Tay sau)"
              placeholderTextColor="#5C6672"
              style={styles.input}
              value={draft.name}
            />

            <Text style={styles.label}>Nhóm cơ chính</Text>
            <TextInput
              testID="plan-focus"
              accessibilityLabel="Nhóm cơ chính"
              onChangeText={(value) => updateDraft('focus', value)}
              placeholder="Ngực · Vai · Tay"
              placeholderTextColor="#5C6672"
              style={styles.input}
              value={draft.focus}
            />

            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              testID="plan-note"
              accessibilityLabel="Ghi chú buổi tập"
              multiline
              onChangeText={(value) => updateDraft('note', value)}
              placeholder="Khởi động, mức tạ, lưu ý..."
              placeholderTextColor="#5C6672"
              style={[styles.input, styles.noteInput]}
              value={draft.note}
            />

            <Text style={styles.label}>Chọn bài tập & mục tiêu</Text>

            {exercises.map((exercise) => {
              const isPicked = Boolean(picked[exercise.id]);

              return (
                <View key={exercise.id} style={styles.pickRow}>
                  <Pressable
                    testID={`plan-pick-${exercise.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Chọn bài tập ${exercise.name}`}
                    accessibilityState={{ selected: isPicked }}
                    onPress={() => togglePicked(exercise)}
                    style={styles.pickExercise}
                  >
                    <Ionicons
                      name={isPicked ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={isPicked ? colors.accent : colors.icon}
                    />
                    <Text style={styles.pickExerciseName}>{exercise.name}</Text>
                    <Text style={styles.pickExerciseGroup}>{exercise.group}</Text>
                  </Pressable>

                  {isPicked ? (
                    <View style={styles.targetRow}>
                      <TextInput
                        testID={`plan-sets-${exercise.id}`}
                        accessibilityLabel={`Số hiệp cho ${exercise.name}`}
                        keyboardType="number-pad"
                        onChangeText={(value) => updatePickedMetric(exercise.id, 'sets', value)}
                        style={styles.targetInput}
                        value={picked[exercise.id].sets}
                      />
                      <Text style={styles.targetTimes}>hiệp ×</Text>
                      <TextInput
                        testID={`plan-reps-${exercise.id}`}
                        accessibilityLabel={`Số lần cho ${exercise.name}`}
                        keyboardType="number-pad"
                        onChangeText={(value) => updatePickedMetric(exercise.id, 'reps', value)}
                        style={styles.targetInput}
                        value={picked[exercise.id].reps}
                      />
                      <Text style={styles.targetTimes}>lần</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}

            {error ? (
              <View testID="plan-error" style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color="#FF8F8F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {savedName ? (
              <View testID="plan-saved" style={styles.successBox}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                <Text style={styles.successText}>Đã lưu buổi tập “{savedName}”.</Text>
              </View>
            ) : null}

            <Pressable
              testID="plan-save"
              accessibilityRole="button"
              accessibilityLabel="Lưu buổi tập"
              onPress={handleSavePlan}
              style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
            >
              <Ionicons name="save-outline" size={18} color={colors.background} />
              <Text style={styles.saveLabel}>LƯU BUỔI TẬP</Text>
            </Pressable>
          </Card>

          <Pressable
            testID="weekly-home"
            accessibilityRole="button"
            accessibilityLabel="Về trang chủ"
            onPress={() => navigation.popTo('Tabs', { screen: 'Dashboard' })}
            style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
          >
            <Ionicons name="home-outline" size={18} color={colors.accent} />
            <Text style={styles.ghostLabel}>VỀ TRANG CHỦ</Text>
          </Pressable>

          <Pressable
            testID="weekly-open-calendar"
            accessibilityRole="button"
            accessibilityLabel="Xem lịch tập"
            onPress={() => navigation.popTo('Tabs', { screen: 'Schedule' })}
            style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.accent} />
            <Text style={styles.ghostLabel}>XEM LỊCH TẬP</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
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
    paddingBottom: 28,
    paddingTop: 12,
  },
  heroCard: {
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 10,
  },
  heroText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  heroMeta: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 12,
  },
  sectionHeading: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  weekdayCard: {
    marginBottom: 10,
    padding: 14,
  },
  weekdayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  weekdayIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  weekdayText: {
    flex: 1,
  },
  weekdayName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  weekdayPlan: {
    color: colors.accent,
    fontSize: 12,
    marginTop: 3,
  },
  weekdayRest: {
    color: colors.dim,
  },
  pickButton: {
    borderColor: colors.inputBorder,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pickLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  optionBlock: {
    borderTopColor: '#232A34',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 8,
  },
  optionRow: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 11,
  },
  optionRowActive: {
    backgroundColor: colors.accentSoft,
  },
  optionTextBlock: {
    flex: 1,
  },
  optionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  optionMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.78,
  },
  planCard: {
    marginBottom: 10,
  },
  planHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  planTitleBlock: {
    flex: 1,
  },
  planName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  planFocus: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  planItemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  planItemName: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
  },
  planItemTarget: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  planNote: {
    color: colors.dim,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  createCard: {
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    outlineStyle: 'none',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  noteInput: {
    minHeight: 74,
    textAlignVertical: 'top',
  },
  pickRow: {
    borderBottomColor: '#232A34',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  pickExercise: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  pickExerciseName: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  pickExerciseGroup: {
    color: colors.muted,
    fontSize: 11,
  },
  targetRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  targetInput: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    outlineStyle: 'none',
    paddingVertical: 10,
    textAlign: 'center',
    width: 64,
  },
  targetTimes: {
    color: colors.muted,
    fontSize: 12,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(255, 91, 91, 0.45)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
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
    marginTop: 16,
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
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 15,
  },
  saveLabel: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  ghostButton: {
    alignItems: 'center',
    borderColor: colors.inputBorder,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 14,
  },
  ghostLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
});

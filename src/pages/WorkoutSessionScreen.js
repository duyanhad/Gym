import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { useWorkout } from '../contexts/WorkoutContext';
import AppLayout from '../layouts/AppLayout';
import { formatDateKey, toDateKey } from '../utils/date';
import { formatClock } from '../utils/time';

const toPositiveInt = (value, fallback) => {
  const parsed = Number(String(value).replace(/[^0-9]/g, ''));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Bước 1: chọn bài tập cho buổi hôm nay, sắp thứ tự và đặt mục tiêu hiệp/lần/nghỉ.
 * Buổi tập có thể lấy nhanh từ giáo án (buổi tập mẫu) hoặc tự chọn từng bài trong thư viện.
 */
function SessionSetup({ dateKey, plans, exercises, onStart, saving, error }) {
  const [items, setItems] = useState([]);
  const [planId, setPlanId] = useState(null);
  const [planName, setPlanName] = useState('');
  const [localError, setLocalError] = useState('');

  const applyPlan = (plan) => {
    setPlanId(plan.id);
    setPlanName(plan.name);
    setLocalError('');
    setItems(
      plan.items.map((item) => ({
        key: item.exerciseId ?? item.exerciseName,
        exerciseId: item.exerciseId,
        exerciseName: item.exerciseName,
        group: '',
        targetSets: String(item.targetSets),
        targetReps: String(item.targetReps),
        restSeconds: String(item.restSeconds),
      })),
    );
  };

  const toggleExercise = (exercise) => {
    setLocalError('');

    setItems((current) => {
      const existing = current.findIndex((item) => item.exerciseId === exercise.id);

      if (existing >= 0) {
        const next = [...current];
        next.splice(existing, 1);

        return next;
      }

      return [
        ...current,
        {
          key: exercise.id,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          group: exercise.group,
          targetSets: String(exercise.sets),
          targetReps: String(exercise.reps),
          restSeconds: String(exercise.restSeconds),
        },
      ];
    });
  };

  const move = (index, delta) => {
    setItems((current) => {
      const target = index + delta;

      if (target < 0 || target >= current.length) return current;

      const next = [...current];
      const [moved] = next.splice(index, 1);

      next.splice(target, 0, moved);

      return next;
    });
  };

  const updateField = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value.replace(/[^0-9]/g, '') } : item,
      ),
    );
  };

  const handleStart = () => {
    if (items.length === 0) {
      setLocalError('Chọn ít nhất 1 bài tập để bắt đầu buổi tập.');

      return;
    }

    onStart({
      planId,
      planName: planName || null,
      items: items.map((item) => ({
        exerciseId: item.exerciseId ?? null,
        exerciseName: item.exerciseName,
        group: item.group,
        targetSets: toPositiveInt(item.targetSets, 1),
        targetReps: toPositiveInt(item.targetReps, 1),
        restSeconds: Number(item.restSeconds) || 0,
      })),
    });
  };

  const message = localError || error;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card tone="accent">
        <Text style={styles.eyebrow}>CHUẨN BỊ BUỔI TẬP</Text>
        <Text style={styles.heroTitle}>{formatDateKey(dateKey)}</Text>
        <Text style={styles.heroText}>
          Chọn giáo án có sẵn hoặc tự tích từng bài, sắp thứ tự bài nào trước - bài nào sau rồi bấm
          BẮT ĐẦU BUỔI TẬP. Trong buổi tập bạn tự bấm đồng hồ cho từng hiệp và từng lần nghỉ.
        </Text>
      </Card>

      <Text style={styles.sectionHeading}>1. CHỌN NHANH THEO GIÁO ÁN</Text>

      <View style={styles.chipWrap}>
        {plans.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có giáo án nào. Tạo giáo án ở mục “Lịch tuần”.</Text>
        ) : (
          plans.map((plan) => (
            <Pressable
              key={plan.id}
              testID={`setup-plan-${plan.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Chọn giáo án ${plan.name}`}
              accessibilityState={{ selected: planId === plan.id }}
              onPress={() => applyPlan(plan)}
              style={({ pressed }) => [
                styles.planChip,
                planId === plan.id && styles.planChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.planChipText, planId === plan.id && styles.planChipTextActive]}>
                {plan.name}
              </Text>
              <Text style={styles.planChipMeta}>{plan.items.length} bài</Text>
            </Pressable>
          ))
        )}
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>2. TÍCH CHỌN BÀI TẬP ({items.length} bài)</Text>

        {items.length === 0 ? (
          <Text style={styles.emptyText}>Chưa chọn bài nào. Tích vào bài tập bên dưới.</Text>
        ) : (
          items.map((item, index) => (
            <View key={`${item.key}-${index}`} testID={`setup-item-${index}`} style={styles.setupRow}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderText}>{index + 1}</Text>
              </View>

              <View style={styles.setupMain}>
                <Text style={styles.setupName}>{item.exerciseName}</Text>

                <View style={styles.targetRow}>
                  <TextInput
                    testID={`setup-sets-${index}`}
                    accessibilityLabel={`Số hiệp cho ${item.exerciseName}`}
                    keyboardType="number-pad"
                    onChangeText={(value) => updateField(index, 'targetSets', value)}
                    style={styles.targetInput}
                    value={item.targetSets}
                  />
                  <Text style={styles.targetTimes}>hiệp ×</Text>
                  <TextInput
                    testID={`setup-reps-${index}`}
                    accessibilityLabel={`Số lần cho ${item.exerciseName}`}
                    keyboardType="number-pad"
                    onChangeText={(value) => updateField(index, 'targetReps', value)}
                    style={styles.targetInput}
                    value={item.targetReps}
                  />
                  <Text style={styles.targetTimes}>lần · nghỉ</Text>
                  <TextInput
                    testID={`setup-rest-${index}`}
                    accessibilityLabel={`Giây nghỉ cho ${item.exerciseName}`}
                    keyboardType="number-pad"
                    onChangeText={(value) => updateField(index, 'restSeconds', value)}
                    style={styles.targetInput}
                    value={item.restSeconds}
                  />
                  <Text style={styles.targetTimes}>giây</Text>
                </View>
              </View>

              <View style={styles.reorderColumn}>
                <Pressable
                  testID={`setup-up-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Đưa ${item.exerciseName} lên trước`}
                  disabled={index === 0}
                  onPress={() => move(index, -1)}
                  style={({ pressed }) => [styles.reorderButton, index === 0 && styles.disabled, pressed && styles.pressed]}
                >
                  <Ionicons name="chevron-up" size={14} color={colors.accent} />
                </Pressable>
                <Pressable
                  testID={`setup-down-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Đưa ${item.exerciseName} xuống sau`}
                  disabled={index === items.length - 1}
                  onPress={() => move(index, 1)}
                  style={({ pressed }) => [
                    styles.reorderButton,
                    index === items.length - 1 && styles.disabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="chevron-down" size={14} color={colors.accent} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>THƯ VIỆN BÀI TẬP</Text>

        {exercises.map((exercise) => {
          const picked = items.some((item) => item.exerciseId === exercise.id);

          return (
            <Pressable
              key={exercise.id}
              testID={`setup-pick-${exercise.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Chọn bài tập ${exercise.name}`}
              accessibilityState={{ selected: picked }}
              onPress={() => toggleExercise(exercise)}
              style={({ pressed }) => [styles.pickRow, pressed && styles.pressed]}
            >
              <Ionicons
                name={picked ? 'checkbox' : 'square-outline'}
                size={18}
                color={picked ? colors.accent : colors.icon}
              />
              <Text style={styles.pickName}>{exercise.name}</Text>
              <Text style={styles.pickGroup}>{exercise.group}</Text>
            </Pressable>
          );
        })}
      </Card>

      {message ? (
        <View testID="session-error" style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#FF8F8F" />
          <Text style={styles.errorText}>{message}</Text>
        </View>
      ) : null}

      <Pressable
        testID="session-start"
        accessibilityRole="button"
        accessibilityLabel="Bắt đầu buổi tập"
        disabled={saving}
        onPress={handleStart}
        style={({ pressed }) => [styles.primaryButton, (pressed || saving) && styles.pressed]}
      >
        <Ionicons name="play" size={18} color={colors.background} />
        <Text style={styles.primaryLabel}>{saving ? 'ĐANG BẮT ĐẦU...' : 'BẮT ĐẦU BUỔI TẬP'}</Text>
      </Pressable>
    </ScrollView>
  );
}

/** Một bài tập trong buổi tập trực tiếp: đồng hồ hiệp tập, đồng hồ nghỉ và danh sách hiệp đã ghi. */
function SessionExerciseCard({
  exercise,
  index,
  total,
  timer,
  clock,
  repsValue,
  onRepsChange,
  onStartWork,
  onStopWork,
  onSaveSet,
  onCancelTimer,
  onToggleCompleted,
  onMove,
  busy,
}) {
  const nextSetNumber = exercise.sets.length + 1;
  const runningSeconds = timer?.startedAt ? Math.floor((clock - timer.startedAt) / 1000) : 0;
  const phase = timer?.phase;

  return (
    <Card testID={`session-exercise-${index}`} style={styles.card}>
      <View style={styles.exerciseHeader}>
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{index + 1}</Text>
        </View>

        <View style={styles.exerciseTitleBlock}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseMeta}>
            {exercise.group || 'Bài tập'} · mục tiêu {exercise.targetSets} × {exercise.targetReps}
            {exercise.restSeconds > 0 ? ` · nghỉ ${exercise.restSeconds}s` : ''}
          </Text>
        </View>

        <View style={styles.reorderColumn}>
          <Pressable
            testID={`session-up-${index}`}
            accessibilityRole="button"
            accessibilityLabel={`Đưa ${exercise.name} lên trước`}
            disabled={index === 0 || busy}
            onPress={() => onMove(index, -1)}
            style={({ pressed }) => [styles.reorderButton, index === 0 && styles.disabled, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-up" size={14} color={colors.accent} />
          </Pressable>
          <Pressable
            testID={`session-down-${index}`}
            accessibilityRole="button"
            accessibilityLabel={`Đưa ${exercise.name} xuống sau`}
            disabled={index === total - 1 || busy}
            onPress={() => onMove(index, 1)}
            style={({ pressed }) => [
              styles.reorderButton,
              index === total - 1 && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-down" size={14} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      <View style={styles.totalsRow}>
        <Text testID={`session-exercise-total-${index}`} style={styles.totalsText}>
          Đã tập {formatClock(exercise.totalWorkSeconds)} · nghỉ {formatClock(exercise.totalRestSeconds)} ·{' '}
          {exercise.sets.length} hiệp
        </Text>
      </View>

      {exercise.sets.map((set) => (
        <View key={set.id} testID={`session-set-${index}-${set.setNumber}`} style={styles.setLogRow}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={styles.setLogText}>
            Hiệp {set.setNumber} · tập {formatClock(set.durationSeconds)} · nghỉ {formatClock(set.restSeconds)}
          </Text>
          <Text testID={`session-set-reps-${index}-${set.setNumber}`} style={styles.setLogText}>
            {set.reps ? `· ${set.reps} lần` : '· —'}
          </Text>
        </View>
      ))}

      {!phase ? (
        <View style={styles.timerIdle}>
          <Pressable
            testID={`session-start-set-${index}`}
            accessibilityRole="button"
            accessibilityLabel={`Bắt đầu hiệp ${nextSetNumber} của ${exercise.name}`}
            disabled={busy}
            onPress={() => onStartWork(exercise.id, nextSetNumber)}
            style={({ pressed }) => [styles.timerButton, pressed && styles.pressed]}
          >
            <Ionicons name="play" size={16} color={colors.background} />
            <Text style={styles.timerButtonLabel}>BẮT ĐẦU HIỆP {nextSetNumber}</Text>
          </Pressable>

          <View style={styles.repsRow}>
            <Text style={styles.repsLabel}>Số lần hiệp {nextSetNumber}</Text>
            <TextInput
              testID={`session-reps-${index}`}
              accessibilityLabel={`Số lần thực hiện ${exercise.name}`}
              keyboardType="number-pad"
              onChangeText={(value) => onRepsChange(exercise.id, value)}
              style={styles.repsInput}
              value={repsValue}
            />
          </View>
        </View>
      ) : null}

      {phase === 'work' ? (
        <View style={styles.timerPanel}>
          <Text style={styles.timerCaption}>HIỆP {timer.setNumber} · ĐANG TẬP</Text>
          <Text testID={`session-timer-${index}`} style={styles.timerValue}>
            {formatClock(runningSeconds)}
          </Text>

          <View style={styles.timerActions}>
            <Pressable
              testID={`session-stop-set-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Kết thúc hiệp ${timer.setNumber}`}
              onPress={() => onStopWork(exercise.id)}
              style={({ pressed }) => [styles.timerButton, pressed && styles.pressed]}
            >
              <Ionicons name="pause" size={16} color={colors.background} />
              <Text style={styles.timerButtonLabel}>DỪNG HIỆP</Text>
            </Pressable>

            <Pressable
              testID={`session-cancel-${index}`}
              accessibilityRole="button"
              accessibilityLabel="Huỷ đồng hồ"
              onPress={() => onCancelTimer(exercise.id)}
              style={({ pressed }) => [styles.ghostMiniButton, pressed && styles.pressed]}
            >
              <Text style={styles.ghostMiniLabel}>HUỶ</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {phase === 'rest' ? (
        <View style={[styles.timerPanel, styles.timerPanelRest]}>
          <Text style={styles.timerCaptionRest}>
            HIỆP {timer.setNumber} · ĐÃ TẬP {formatClock(timer.workSeconds)} · ĐANG NGHỈ
          </Text>
          <Text testID={`session-rest-timer-${index}`} style={styles.timerValueRest}>
            {formatClock(runningSeconds)}
          </Text>

          <View style={styles.timerActions}>
            <Pressable
              testID={`session-save-set-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Lưu hiệp ${timer.setNumber} kèm thời gian nghỉ`}
              disabled={busy}
              onPress={() => onSaveSet(exercise.id, runningSeconds)}
              style={({ pressed }) => [styles.timerButton, pressed && styles.pressed]}
            >
              <Ionicons name="save" size={16} color={colors.background} />
              <Text style={styles.timerButtonLabel}>
                {busy ? 'ĐANG LƯU...' : `LƯU (NGHỈ ${formatClock(runningSeconds)})`}
              </Text>
            </Pressable>

            <Pressable
              testID={`session-skip-rest-${index}`}
              accessibilityRole="button"
              accessibilityLabel="Bỏ qua thời gian nghỉ"
              disabled={busy}
              onPress={() => onSaveSet(exercise.id, 0)}
              style={({ pressed }) => [styles.ghostMiniButton, pressed && styles.pressed]}
            >
              <Text style={styles.ghostMiniLabel}>BỎ NGHỈ</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Pressable
        testID={`session-toggle-completed-${index}`}
        accessibilityRole="button"
        accessibilityLabel={exercise.isCompleted ? `Bỏ hoàn thành ${exercise.name}` : `Hoàn thành ${exercise.name}`}
        accessibilityState={{ selected: exercise.isCompleted }}
        disabled={busy}
        onPress={() => onToggleCompleted(exercise, !exercise.isCompleted)}
        style={({ pressed }) => [styles.completeRow, pressed && styles.pressed]}
      >
        <Ionicons
          name={exercise.isCompleted ? 'checkbox' : 'square-outline'}
          size={18}
          color={exercise.isCompleted ? colors.success : colors.icon}
        />
        <Text style={[styles.completeLabel, exercise.isCompleted && styles.completeLabelActive]}>
          {exercise.isCompleted ? 'ĐÃ HOÀN THÀNH BÀI NÀY' : 'ĐÁNH DẤU HOÀN THÀNH BÀI NÀY'}
        </Text>
      </Pressable>
    </Card>
  );
}

export default function WorkoutSessionScreen({ navigation, route }) {
  const dateKey = route.params?.dateKey ?? toDateKey(new Date());

  const {
    sessionForDate,
    loadSessionForDate,
    startSessionForDate,
    logSetForExercise,
    toggleExerciseCompleted,
    reorderSessionExercises,
    finishSessionForDate,
    removeSession,
    exercises,
    plans,
  } = useWorkout();

  const session = sessionForDate(dateKey);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [timers, setTimers] = useState({});
  const [repsDrafts, setRepsDrafts] = useState({});
  const [clock, setClock] = useState(() => Date.now());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setClock(Date.now()), 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    loadSessionForDate(dateKey)
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message ?? 'Không tải được buổi tập.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dateKey, loadSessionForDate]);

  const runningSeconds = useCallback(
    (exerciseId) => {
      const timer = timers[exerciseId];

      return timer?.startedAt ? Math.floor((clock - timer.startedAt) / 1000) : 0;
    },
    [timers, clock],
  );

  const liveSeconds = useMemo(
    () => Object.keys(timers).reduce((total, exerciseId) => total + runningSeconds(exerciseId), 0),
    [timers, runningSeconds],
  );

  const handleStartWork = (exerciseId, setNumber) => {
    setError('');
    setTimers((current) => ({
      ...current,
      [exerciseId]: { phase: 'work', startedAt: Date.now(), setNumber, workSeconds: 0 },
    }));
  };

  const handleStopWork = (exerciseId) => {
    setTimers((current) => {
      const timer = current[exerciseId];

      if (!timer) return current;

      const elapsed = Math.max(1, Math.floor((Date.now() - timer.startedAt) / 1000));

      return {
        ...current,
        [exerciseId]: { ...timer, phase: 'rest', startedAt: Date.now(), workSeconds: elapsed },
      };
    });
  };

  const handleCancelTimer = (exerciseId) => {
    setTimers((current) => {
      const next = { ...current };

      delete next[exerciseId];

      return next;
    });
  };

  const handleSaveSet = async (exerciseId, restSeconds) => {
    const timer = timers[exerciseId];

    if (!timer || !session) return;

    const exercise = session.exercises.find((item) => item.id === exerciseId);

    setBusy(true);
    setError('');

    try {
      await logSetForExercise(session.id, exerciseId, {
        setNumber: timer.setNumber,
        durationSeconds: Math.max(1, timer.workSeconds ?? runningSeconds(exerciseId)),
        restSeconds: Number(restSeconds) || 0,
        reps: toPositiveInt(repsDrafts[exerciseId] ?? exercise?.targetReps, 1),
      });

      handleCancelTimer(exerciseId);
    } catch (requestError) {
      setError(requestError.message ?? 'Không lưu được hiệp tập.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const handleToggleCompleted = async (exercise, isCompleted) => {
    setBusy(true);
    setError('');

    try {
      await toggleExerciseCompleted(exercise.id, isCompleted);
    } catch (requestError) {
      setError(requestError.message ?? 'Không cập nhật được trạng thái bài tập.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const handleMove = async (index, delta) => {
    if (!session) return;

    const target = index + delta;

    if (target < 0 || target >= session.exercises.length) return;

    const ordered = [...session.exercises];
    const [moved] = ordered.splice(index, 1);

    ordered.splice(target, 0, moved);
    setBusy(true);
    setError('');

    try {
      await reorderSessionExercises(session.id, ordered.map((item) => item.id));
    } catch (requestError) {
      setError(requestError.message ?? 'Không đổi được thứ tự bài tập.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const handleStartSession = async ({ planId, planName, items }) => {
    setSaving(true);
    setError('');

    try {
      await startSessionForDate({ dateKey, planId, planName, items });
      setTimers({});
    } catch (requestError) {
      setError(requestError.message ?? 'Không bắt đầu được buổi tập.');
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const handleFinish = async () => {
    if (!session) return;

    setBusy(true);
    setError('');

    try {
      await finishSessionForDate(session.id);
      setTimers({});
    } catch (requestError) {
      setError(requestError.message ?? 'Không kết thúc được buổi tập.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const handleRestart = async () => {
    if (!session) return;

    setBusy(true);
    setError('');

    try {
      await startSessionForDate({
        dateKey,
        planId: session.planId,
        planName: session.planName,
        restart: true,
        items: session.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          group: exercise.group,
          targetSets: exercise.targetSets,
          targetReps: exercise.targetReps,
          restSeconds: exercise.restSeconds,
        })),
      });

      setTimers({});
    } catch (requestError) {
      setError(requestError.message ?? 'Không bắt đầu lại được buổi tập.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!session) return;

    setBusy(true);

    try {
      await removeSession(session.id, dateKey);
      setTimers({});
    } catch (requestError) {
      setError(requestError.message ?? 'Không xoá được buổi tập.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const goToTab = (screen) => navigation.popTo('Tabs', { screen });

  const dayTotalSeconds = session ? session.totalDurationSeconds + session.totalRestSeconds : 0;
  const finished = session?.status === 'FINISHED';
  const backRow = (
    <View style={styles.backRow}>
      <Pressable
        testID="session-back-schedule"
        accessibilityRole="button"
        accessibilityLabel="Về lịch tập"
        onPress={() => goToTab('Schedule')}
        style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
      >
        <Ionicons name="calendar-outline" size={16} color={colors.accent} />
        <Text style={styles.ghostLabel}>VỀ LỊCH TẬP</Text>
      </Pressable>

      <Pressable
        testID="session-back-home"
        accessibilityRole="button"
        accessibilityLabel="Về trang chủ"
        onPress={() => goToTab('Dashboard')}
        style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
      >
        <Ionicons name="home-outline" size={16} color={colors.accent} />
        <Text style={styles.ghostLabel}>VỀ TRANG CHỦ</Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <AppLayout testID="session-screen" style={styles.page}>
        <Text style={styles.loadingText}>Đang tải buổi tập...</Text>
      </AppLayout>
    );
  }

  return (
    <AppLayout testID="session-screen" style={styles.page}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}
      >
        {!session ? (
          <View style={styles.fill}>
            <SessionSetup
              dateKey={dateKey}
              exercises={exercises}
              plans={plans}
              saving={saving}
              error={error}
              onStart={handleStartSession}
            />

            <View style={styles.setupBackRow}>{backRow}</View>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Card tone="accent">
              <Text style={styles.eyebrow}>{finished ? 'BUỔI TẬP ĐÃ KẾT THÚC' : 'BUỔI TẬP ĐANG DIỄN RA'}</Text>
              <Text style={styles.heroTitle}>{formatDateKey(dateKey)}</Text>
              <Text style={styles.heroText}>
                {session.planName ? `Giáo án: ${session.planName}` : 'Buổi tập tự chọn'}
              </Text>

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>TỔNG THỜI GIAN TẬP CẢ NGÀY</Text>
                <Text testID="session-day-total" style={styles.totalValue}>
                  {formatClock(dayTotalSeconds)}
                </Text>
                <Text style={styles.totalMeta}>
                  Tập {formatClock(session.totalDurationSeconds)} · nghỉ {formatClock(session.totalRestSeconds)}
                </Text>
                {liveSeconds > 0 ? (
                  <Text testID="session-live-total" style={styles.liveMeta}>
                    Đồng hồ đang chạy: {formatClock(liveSeconds)}
                  </Text>
                ) : null}
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${session.progressPercent}%` }]} />
              </View>
              <Text testID="session-progress" style={styles.progressText}>
                Hoàn thành {session.completedExercises}/{session.totalExercises} bài ·{' '}
                {session.progressPercent}%
              </Text>
            </Card>

            <Text style={styles.sectionHeading}>BÀI TẬP TRONG BUỔI ({session.exercises.length})</Text>

            {finished ? (
              <View testID="session-completed-banner" style={styles.successBox}>
                <Ionicons name="trophy-outline" size={18} color={colors.success} />
                <Text style={styles.successText}>
                  Buổi tập đã kết thúc. Tổng thời gian {formatClock(dayTotalSeconds)} — nghỉ ngơi và ăn đủ
                  protein nhé!
                </Text>
              </View>
            ) : null}

            {session.exercises.map((exercise, index) => (
              <SessionExerciseCard
                key={exercise.id}
                busy={busy}
                clock={clock}
                exercise={exercise}
                index={index}
                repsValue={repsDrafts[exercise.id] ?? String(exercise.targetReps)}
                timer={timers[exercise.id]}
                total={session.exercises.length}
                onCancelTimer={handleCancelTimer}
                onMove={handleMove}
                onRepsChange={(exerciseId, value) =>
                  setRepsDrafts((current) => ({ ...current, [exerciseId]: value.replace(/[^0-9]/g, '') }))
                }
                onSaveSet={handleSaveSet}
                onStartWork={handleStartWork}
                onStopWork={handleStopWork}
                onToggleCompleted={handleToggleCompleted}
              />
            ))}

            {error ? (
              <View testID="session-error" style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color="#FF8F8F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {finished ? (
              <Pressable
                testID="session-restart"
                accessibilityRole="button"
                accessibilityLabel="Bắt đầu lại buổi tập này"
                disabled={busy}
                onPress={handleRestart}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Ionicons name="refresh" size={18} color={colors.background} />
                <Text style={styles.primaryLabel}>BẮT ĐẦU LẠI BUỔI NÀY</Text>
              </Pressable>
            ) : (
              <Pressable
                testID="session-finish"
                accessibilityRole="button"
                accessibilityLabel="Kết thúc buổi tập"
                disabled={busy}
                onPress={handleFinish}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Ionicons name="flag" size={18} color={colors.background} />
                <Text style={styles.primaryLabel}>KẾT THÚC BUỔI TẬP</Text>
              </Pressable>
            )}

            <Pressable
              testID="session-delete"
              accessibilityRole="button"
              accessibilityLabel="Xoá buổi tập hôm nay"
              disabled={busy}
              onPress={handleDelete}
              style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}
            >
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <Text style={styles.dangerLabel}>XOÁ BUỔI TẬP HÔM NAY</Text>
            </Pressable>

            {backRow}

            <Text style={styles.footer}>TỪNG HIỆP MỘT, TỪNG NGÀY MỘT — BỀN BỈ LÀ SỨC MẠNH</Text>
          </ScrollView>
        )}
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
  loadingText: {
    color: colors.muted,
    marginTop: 24,
    textAlign: 'center',
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },
  heroText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  totalBox: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  totalLabel: {
    color: colors.dim,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  totalValue: {
    color: colors.accent,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
  },
  totalMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  liveMeta: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  progressTrack: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    height: 8,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.accent,
    height: '100%',
  },
  progressText: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 8,
  },
  sectionHeading: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 10,
    marginTop: 18,
  },
  card: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.dim,
    fontSize: 12,
    paddingVertical: 6,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  planChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  planChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  planChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 220,
  },
  planChipTextActive: {
    color: colors.accent,
  },
  planChipMeta: {
    color: colors.dim,
    fontSize: 10,
    marginTop: 2,
  },
  setupRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  setupMain: {
    flex: 1,
    gap: 6,
  },
  setupName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  orderBadge: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderRadius: 10,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  orderText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
  },
  targetRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  targetInput: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 12,
    minWidth: 44,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'center',
  },
  targetTimes: {
    color: colors.dim,
    fontSize: 10,
  },
  reorderColumn: {
    gap: 4,
  },
  reorderButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  disabled: {
    opacity: 0.35,
  },
  pickRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  pickName: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  pickGroup: {
    color: colors.dim,
    fontSize: 10,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  exerciseTitleBlock: {
    flex: 1,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  exerciseMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  totalsRow: {
    marginTop: 8,
  },
  totalsText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  setLogRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  setLogText: {
    color: colors.muted,
    fontSize: 11,
  },
  timerIdle: {
    marginTop: 12,
  },
  timerPanel: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  timerPanelRest: {
    backgroundColor: 'rgba(74, 222, 128, 0.10)',
    borderColor: 'rgba(74, 222, 128, 0.55)',
  },
  timerCaption: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  timerCaptionRest: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  timerValue: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '900',
    marginTop: 2,
  },
  timerValueRest: {
    color: colors.success,
    fontSize: 40,
    fontWeight: '900',
    marginTop: 2,
  },
  timerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  timerButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  timerButtonLabel: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '900',
  },
  ghostMiniButton: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ghostMiniLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  repsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  repsLabel: {
    color: colors.muted,
    fontSize: 11,
  },
  repsInput: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 12,
    minWidth: 56,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'center',
  },
  completeRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
  },
  completeLabel: {
    color: colors.icon,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  completeLabelActive: {
    color: colors.success,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 14,
  },
  primaryLabel: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ghostButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  ghostLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  backRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  setupBackRow: {
    paddingBottom: 16,
    paddingHorizontal: spacing.page,
  },
  dangerButton: {
    alignItems: 'center',
    borderColor: 'rgba(255, 91, 91, 0.4)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 12,
  },
  dangerLabel: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '800',
  },
  successBox: {
    backgroundColor: 'rgba(74, 222, 128, 0.10)',
    borderColor: 'rgba(74, 222, 128, 0.4)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    padding: 12,
  },
  successText: {
    color: colors.success,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(255, 91, 91, 0.35)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 12,
  },
  errorText: {
    color: '#FF8F8F',
    flex: 1,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.75,
  },
  footer: {
    color: colors.dim,
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 18,
    textAlign: 'center',
  },
});

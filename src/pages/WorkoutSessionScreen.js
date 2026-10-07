import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { useWorkout } from '../contexts/WorkoutContext';
import AppLayout from '../layouts/AppLayout';
import { formatDateKey } from '../utils/date';

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function formatClockTime(isoString) {
  const date = new Date(isoString);

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function WorkoutSessionScreen({ navigation, route }) {
  const { dateKey } = route.params;
  const {
    composePlanItemsForDate,
    completedForDate,
    setWorkoutItemCompleted,
    weekPlan,
    planById,
    toggleWorkoutDay,
    isWorkoutDay,
    weekdayLabel,
    sessionOf,
    startSession,
    finishSession,
    resetSession,
  } = useWorkout();

  const [nowTick, setNowTick] = useState(Date.now());

  const session = sessionOf(dateKey);
  const startedAt = session.startedAt ? new Date(session.startedAt) : null;
  const finishedAt = session.finishedAt ? new Date(session.finishedAt) : null;
  const inProgress = Boolean(startedAt && !finishedAt);

  // Đồng hồ đếm thời gian tập khi buổi tập đang diễn ra
  useEffect(() => {
    if (!inProgress) return undefined;

    const timer = setInterval(() => setNowTick(Date.now()), 1000);

    return () => clearInterval(timer);
  }, [inProgress]);

  const elapsedMs = startedAt
    ? (finishedAt ?? new Date(nowTick)).getTime() - startedAt.getTime()
    : 0;

  const weekday = new Date(`${dateKey}T00:00:00`).getDay();
  const primaryPlan = planById(weekPlan[weekday]);
  const items = composePlanItemsForDate(dateKey);
  const completed = completedForDate(dateKey);
  const doneCount = items.filter((item) => completed.includes(item.exerciseName)).length;
  const progressPercent = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;
  const isEnough = items.length > 0 && doneCount === items.length;

  const toggleItem = (exerciseName) => {
    const isDone = completed.includes(exerciseName);
    setWorkoutItemCompleted(dateKey, exerciseName, !isDone);
  };

  return (
    <AppLayout testID="session-screen" style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card tone="accent" style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerIcon}>
              <Ionicons name="barbell-outline" size={18} color={colors.accent} />
            </View>
            <View style={styles.headerText}>
              <Text testID="session-date" style={styles.headerDate}>
                {formatDateKey(dateKey).toUpperCase()}
              </Text>
              <Text style={styles.headerTitle}>{primaryPlan?.name ?? 'Ngày không có buổi tập'}</Text>
            </View>
          </View>

          {primaryPlan?.focus ? <Text style={styles.headerFocus}>Nhóm cơ: {primaryPlan.focus}</Text> : null}
          {primaryPlan?.note ? <Text style={styles.headerNote}>{primaryPlan.note}</Text> : null}
        </Card>

        <Card style={styles.clockCard}>
          <View style={styles.clockHeader}>
            <Text style={styles.sectionTitle}>THỜI GIAN TẬP</Text>
            <View
              style={[
                styles.statusPill,
                inProgress ? styles.statusLive : finishedAt ? styles.statusOk : styles.statusIdle,
              ]}
            >
              <Text
                testID="session-status"
                style={[
                  styles.statusText,
                  inProgress ? styles.statusTextLive : finishedAt ? styles.statusTextOk : styles.statusTextIdle,
                ]}
              >
                {inProgress ? 'ĐANG TẬP' : finishedAt ? 'ĐÃ KẾT THÚC' : 'CHƯA BẮT ĐẦU'}
              </Text>
            </View>
          </View>

          <Text testID="session-timer" style={styles.clockValue}>
            {formatDuration(elapsedMs)}
          </Text>

          <Text style={styles.clockMeta}>
            {startedAt ? `Bắt đầu ${formatClockTime(session.startedAt)}` : 'Bấm nút bên dưới để bắt đầu tính giờ'}
            {finishedAt ? ` · Kết thúc ${formatClockTime(session.finishedAt)}` : ''}
          </Text>

          {inProgress ? (
            <View style={styles.clockActions}>
              <Pressable
                testID="session-finish"
                accessibilityRole="button"
                accessibilityLabel="Kết thúc buổi tập"
                onPress={() => finishSession(dateKey)}
                style={({ pressed }) => [styles.finishButton, pressed && styles.pressed]}
              >
                <Ionicons name="stop" size={18} color={colors.background} />
                <Text style={styles.finishLabel}>KẾT THÚC BUỔI TẬP</Text>
              </Pressable>

              <Pressable
                testID="session-restart"
                accessibilityRole="button"
                accessibilityLabel="Bắt đầu lại buổi tập"
                onPress={() => {
                  resetSession(dateKey);
                  startSession(dateKey);
                }}
                style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
              >
                <Ionicons name="refresh-outline" size={18} color={colors.accent} />
                <Text style={styles.ghostLabel}>BẮT ĐẦU LẠI</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              testID="session-start"
              accessibilityRole="button"
              accessibilityLabel={finishedAt ? 'Bắt đầu buổi tập mới' : 'Bắt đầu buổi tập'}
              onPress={() => {
                resetSession(dateKey);
                startSession(dateKey);
                setNowTick(Date.now());
              }}
              style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
            >
              <Ionicons name="play" size={18} color={colors.background} />
              <Text style={styles.startLabel}>
                {finishedAt ? 'BẮT ĐẦU BUỔI TẬP MỚI' : 'BẮT ĐẦU BUỔI TẬP'}
              </Text>
            </Pressable>
          )}
        </Card>

        {items.length === 0 ? (
          <Card testID="session-empty" style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={26} color={colors.dim} />
            <Text style={styles.emptyTitle}>Hôm nay không có buổi tập nào</Text>
            <Text style={styles.emptyHint}>
              Bạn chưa thiết lập buổi tập cho {weekdayLabel(weekday)}. Hãy lên lịch tuần theo giáo án của bạn.
            </Text>

            <Pressable
              testID="session-setup-week"
              accessibilityRole="button"
              accessibilityLabel="Thiết lập lịch tuần"
              onPress={() => navigation.navigate('WeeklyPlan')}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Ionicons name="calendar-number-outline" size={18} color={colors.background} />
              <Text style={styles.primaryLabel}>THIẾT LẬP LỊCH TUẦN</Text>
            </Pressable>
          </Card>
        ) : (
          <>
            <Card style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.sectionTitle}>KẾT QUẢ BUỔI TẬP</Text>
                <View style={[styles.statusPill, isEnough ? styles.statusOk : styles.statusPending]}>
                  <Text style={[styles.statusText, isEnough ? styles.statusTextOk : styles.statusTextPending]}>
                    {isEnough ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐỦ YÊU CẦU'}
                  </Text>
                </View>
              </View>

              <Text testID="session-progress" style={styles.progressValue}>
                {doneCount}/{items.length} bài · {progressPercent}%
              </Text>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>

              <Text style={styles.progressHint}>
                {isEnough
                  ? 'Tuyệt vời! Bạn đã đạt đủ số hiệp và số lần của buổi tập hôm nay.'
                  : 'Chạm vào từng bài bên dưới để đánh dấu khi bạn đã đạt đủ số hiệp và số lần.'}
              </Text>
            </Card>

            <Text style={styles.sectionHeading}>CHI TIẾT BÀI TẬP ({items.length})</Text>

            {items.map((item) => {
              const isDone = completed.includes(item.exerciseName);

              return (
                <Card key={item.exerciseName} style={styles.itemCard} testID={`session-item-${item.exerciseName}`}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemTitleBlock}>
                      <Text numberOfLines={1} style={styles.itemName}>
                        {item.exerciseName}
                      </Text>
                      <Text style={styles.itemTarget}>
                        Mục tiêu: {item.targetSets} hiệp × {item.targetReps} lần
                      </Text>
                    </View>

                    <View style={[styles.itemBadge, isDone ? styles.itemBadgeDone : styles.itemBadgePending]}>
                      <Ionicons
                        name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={isDone ? colors.success : colors.warning}
                      />
                      <Text style={[styles.itemBadgeText, isDone ? styles.itemBadgeTextDone : styles.itemBadgeTextPending]}>
                        {isDone ? 'Đạt' : 'Chưa đạt'}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    testID={`session-toggle-${item.exerciseName}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${isDone ? 'Bỏ đánh dấu' : 'Đánh dấu đạt'} ${item.exerciseName}`}
                    onPress={() => toggleItem(item.exerciseName)}
                    style={({ pressed }) => [
                      styles.itemButton,
                      isDone && styles.itemButtonDone,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.itemButtonLabel, isDone && styles.itemButtonLabelDone]}>
                      {isDone ? 'ĐÃ ĐẠT · CHẠM ĐỂ BỎ' : 'ĐÁNH DẤU ĐÃ ĐẠT'}
                    </Text>
                  </Pressable>
                </Card>
              );
            })}

            <View style={styles.actionRow}>
              <Pressable
                testID="session-complete-all"
                accessibilityRole="button"
                accessibilityLabel="Đánh dấu hoàn thành tất cả"
                onPress={() => items.forEach((item) => setWorkoutItemCompleted(dateKey, item.exerciseName, true))}
                style={({ pressed }) => [styles.primaryButton, styles.actionButton, pressed && styles.pressed]}
              >
                <Ionicons name="checkmark-done-outline" size={18} color={colors.background} />
                <Text style={styles.primaryLabel}>HOÀN THÀNH TẤT CẢ</Text>
              </Pressable>

              <Pressable
                testID="session-reset"
                accessibilityRole="button"
                accessibilityLabel="Bỏ đánh dấu tất cả"
                onPress={() => items.forEach((item) => setWorkoutItemCompleted(dateKey, item.exerciseName, false))}
                style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
              >
                <Ionicons name="refresh-outline" size={18} color={colors.accent} />
                <Text style={styles.ghostLabel}>LÀM LẠI</Text>
              </Pressable>
            </View>

            <Pressable
              testID="session-toggle-day"
              accessibilityRole="button"
              accessibilityLabel={isWorkoutDay(dateKey) ? 'Bỏ đánh dấu ngày tập' : 'Đánh dấu đây là ngày tập'}
              onPress={() => toggleWorkoutDay(dateKey)}
              style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.accent} />
              <Text style={styles.ghostLabel}>
                {isWorkoutDay(dateKey) ? 'BỎ ĐÁNH DẤU NGÀY TẬP' : 'ĐÁNH DẤU ĐÂY LÀ NGÀY TẬP'}
              </Text>
            </Pressable>
          </>
        )}

        <Pressable
          testID="session-back-to-schedule"
          accessibilityRole="button"
          accessibilityLabel="Về lịch tập"
          onPress={() => navigation.popTo('Tabs', { screen: 'Schedule' })}
          style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.accent} />
          <Text style={styles.ghostLabel}>VỀ LỊCH TẬP</Text>
        </Pressable>

        <Pressable
          testID="session-home"
          accessibilityRole="button"
          accessibilityLabel="Về trang chủ"
          onPress={() => navigation.popTo('Tabs', { screen: 'Dashboard' })}
          style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
        >
          <Ionicons name="home-outline" size={18} color={colors.accent} />
          <Text style={styles.ghostLabel}>VỀ TRANG CHỦ</Text>
        </Pressable>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: spacing.page,
  },
  content: {
    paddingBottom: 28,
    paddingTop: 12,
  },
  headerCard: {
    marginBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  headerText: {
    flex: 1,
  },
  headerDate: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 6,
  },
  headerFocus: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 12,
  },
  headerNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  clockCard: {
    marginBottom: 14,
  },
  clockHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clockValue: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 10,
  },
  clockMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
  },
  clockActions: {
    gap: 4,
  },
  statusLive: {
    backgroundColor: colors.accentSoft,
    borderColor: 'rgba(198, 241, 53, 0.45)',
  },
  statusIdle: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
  },
  statusTextLive: {
    color: colors.accent,
  },
  statusTextIdle: {
    color: colors.dim,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 15,
  },
  startLabel: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  finishButton: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 15,
  },
  finishLabel: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusOk: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderColor: 'rgba(74, 222, 128, 0.42)',
  },
  statusPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: 'rgba(251, 191, 36, 0.42)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  statusTextOk: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.warning,
  },
  progressValue: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 14,
  },
  progressBar: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    height: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 8,
  },
  progressHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  sectionHeading: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  itemTitleBlock: {
    flex: 1,
  },
  itemName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  itemTarget: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  itemBadge: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  itemBadgeDone: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderColor: 'rgba(74, 222, 128, 0.42)',
  },
  itemBadgePending: {
    backgroundColor: 'rgba(251, 191, 36, 0.10)',
    borderColor: 'rgba(251, 191, 36, 0.38)',
  },
  itemBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  itemBadgeTextDone: {
    color: colors.success,
  },
  itemBadgeTextPending: {
    color: colors.warning,
  },
  itemButton: {
    alignItems: 'center',
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    paddingVertical: 12,
  },
  itemButtonDone: {
    backgroundColor: 'rgba(198, 241, 53, 0.10)',
    borderColor: 'rgba(198, 241, 53, 0.45)',
  },
  itemButtonLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  itemButtonLabelDone: {
    color: colors.accent,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginTop: 0,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 15,
  },
  primaryLabel: {
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
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ghostLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  pressed: {
    opacity: 0.78,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 26,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
});

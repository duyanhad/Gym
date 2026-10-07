import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { useWorkout } from '../contexts/WorkoutContext';
import TabScreenLayout from '../layouts/TabScreenLayout';
import { buildMonthMatrix, formatDateKey, monthTitle, shiftMonth, toDateKey, WEEKDAY_LABELS } from '../utils/date';
import { formatClock } from '../utils/time';

export default function WorkoutScheduleScreen({ navigation }) {
  const {
    stats,
    weekPlan,
    planById,
    scheduleForDay,
    dayMarks,
    refreshDayMarks,
    sessionForDate,
    loadSessionForDate,
  } = useWorkout();

  const today = new Date();
  const todayKey = toDateKey(today);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [loadingSession, setLoadingSession] = useState(false);

  const weeks = buildMonthMatrix(cursor.year, cursor.month);

  useEffect(() => {
    const from = toDateKey(new Date(cursor.year, cursor.month - 1, 1));
    const to = toDateKey(new Date(cursor.year, cursor.month, 0));

    refreshDayMarks(from, to).catch(() => {});
  }, [cursor, refreshDayMarks]);

  const selectDate = useCallback(
    async (dateKey) => {
      setSelectedDate(dateKey);
      setLoadingSession(true);

      await loadSessionForDate(dateKey).catch(() => {});
      setLoadingSession(false);
    },
    [loadSessionForDate],
  );

  const goToMonth = (delta) => setCursor((current) => shiftMonth(current.year, current.month, delta));

  const selectedWeekday = new Date(`${selectedDate}T00:00:00`).getDay();
  const selectedPlan = planById(weekPlan[selectedWeekday]);
  const selectedEntry = scheduleForDay(selectedWeekday);
  const selectedSession = sessionForDate(selectedDate);
  const selectedMark = dayMarks[selectedDate];

  const openSession = () =>
    navigation.navigate('WorkoutSession', {
      dateKey: selectedDate,
      title: selectedDate === todayKey ? 'Buổi tập hôm nay' : 'Buổi tập',
    });

  const summaryTiles = [
    { key: 'streak', label: 'Chuỗi ngày', value: stats.streak },
    { key: 'month', label: 'Buổi tháng này', value: stats.monthCount },
    { key: 'total', label: 'Tổng buổi', value: stats.totalCount, testID: 'schedule-total' },
    { key: 'weekly', label: 'Buổi/tuần', value: stats.scheduledWeekdays, testID: 'schedule-weekly-count' },
  ];

  return (
    <TabScreenLayout testID="schedule-screen" style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          {summaryTiles.map((tile, index) => (
            <View key={tile.key} style={styles.summaryItem}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.summaryValueBlock}>
                <Text testID={tile.testID} style={styles.summaryValue}>
                  {tile.value}
                </Text>
                <Text style={styles.summaryLabel}>{tile.label}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.calendarCard}>
          <View style={styles.monthRow}>
            <Pressable
              testID="schedule-prev"
              accessibilityRole="button"
              accessibilityLabel="Tháng trước"
              onPress={() => goToMonth(-1)}
              style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </Pressable>

            <Text testID="schedule-month" style={styles.monthTitle}>
              {monthTitle(cursor.year, cursor.month)}
            </Text>

            <Pressable
              testID="schedule-next"
              accessibilityRole="button"
              accessibilityLabel="Tháng sau"
              onPress={() => goToMonth(1)}
              style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label) => (
              <Text key={label} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.weekRow}>
              {week.map((cell, cellIndex) => {
                if (!cell) return <View key={`blank-${weekIndex}-${cellIndex}`} style={styles.dayCell} />;

                const mark = dayMarks[cell.key];
                const trained = Boolean(mark?.hasSession);
                const inProgress = trained && !mark?.isCompleted;
                const planned = Boolean(weekPlan[new Date(`${cell.key}T00:00:00`).getDay()]);
                const isToday = cell.key === todayKey;
                const isSelected = cell.key === selectedDate;

                return (
                  <Pressable
                    key={cell.key}
                    testID={`schedule-day-${cell.key}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${formatDateKey(cell.key)}${trained ? ' - đã tập' : ''}${planned && !trained ? ' - có buổi tập theo lịch' : ''}`}
                    onPress={() => selectDate(cell.key)}
                    style={styles.dayCell}
                  >
                    <View
                      style={[
                        styles.dayBadge,
                        trained && styles.dayBadgeTrained,
                        inProgress && styles.dayBadgeInProgress,
                        isToday && styles.dayBadgeToday,
                        isSelected && !trained && styles.dayBadgeSelected,
                      ]}
                    >
                      <Text style={[styles.dayText, trained && styles.dayTextTrained]}>{cell.day}</Text>
                    </View>
                    <View
                      style={[
                        styles.dot,
                        trained && styles.dotTrained,
                        !trained && planned && styles.dotPlanned,
                      ]}
                    />
                  </Pressable>
                );
              })}
            </View>
          ))}

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.dayBadge, styles.dayBadgeTrained, styles.legendBadge]} />
              <Text style={styles.legendText}>Đã tập</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dayBadge, styles.dayBadgeInProgress, styles.legendBadge]} />
              <Text style={styles.legendText}>Chưa xong</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dotPlanned]} />
              <Text style={styles.legendText}>Có buổi tập</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dayBadge, styles.dayBadgeToday, styles.legendBadge]} />
              <Text style={styles.legendText}>Hôm nay</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.selectedCard}>
          <Text style={styles.selectedLabel}>NGÀY ĐANG CHỌN</Text>
          <Text testID="schedule-selected" style={styles.selectedDate}>
            {formatDateKey(selectedDate)}
          </Text>

          <Text testID="schedule-selected-plan" style={styles.selectedPlan}>
            {selectedPlan
              ? `Buổi tập theo lịch: ${selectedPlan.name}`
              : selectedEntry?.planName
                ? `Buổi tập theo lịch: ${selectedEntry.planName}`
                : 'Ngày này chưa có buổi tập theo lịch tuần'}
          </Text>

          {selectedSession ? (
            <View testID="schedule-selected-session" style={styles.sessionBox}>
              <Text style={styles.sessionTitle}>
                {selectedSession.status === 'FINISHED' ? 'BUỔI TẬP ĐÃ KẾT THÚC' : 'BUỔI TẬP ĐANG DIỄN RA'}
              </Text>
              <Text style={styles.sessionMeta}>
                {selectedSession.planName ?? 'Buổi tập tự chọn'} · {selectedSession.completedExercises}/
                {selectedSession.totalExercises} bài · {selectedSession.progressPercent}%
              </Text>
              <Text style={styles.sessionMeta}>
                Tập {formatClock(selectedSession.totalDurationSeconds)} · nghỉ{' '}
                {formatClock(selectedSession.totalRestSeconds)} · tổng{' '}
                {formatClock(selectedSession.totalDurationSeconds + selectedSession.totalRestSeconds)}
              </Text>

              {selectedSession.exercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.sessionExerciseRow}>
                  <Ionicons
                    name={exercise.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={exercise.isCompleted ? colors.success : colors.icon}
                  />
                  <Text style={styles.sessionExerciseName}>
                    {index + 1}. {exercise.name}
                  </Text>
                  <Text style={styles.sessionExerciseMeta}>
                    {exercise.sets.length}/{exercise.targetSets} hiệp ·{' '}
                    {formatClock(exercise.totalWorkSeconds)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text testID="schedule-selected-empty" style={styles.selectedHint}>
              {selectedMark?.hasSession
                ? 'Đã có buổi tập trong ngày này.'
                : 'Chưa có buổi tập nào trong ngày này.'}{' '}
              {loadingSession ? 'Đang kiểm tra...' : ''}
            </Text>
          )}

          <Pressable
            testID="schedule-open-session"
            accessibilityRole="button"
            accessibilityLabel={selectedSession ? 'Xem chi tiết buổi tập' : 'Bắt đầu buổi tập'}
            onPress={openSession}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Ionicons name="barbell-outline" size={18} color={colors.background} />
            <Text style={styles.primaryLabel}>
              {selectedSession ? 'MỞ CHI TIẾT BUỘI TẬP' : 'BẮT ĐẦU BUỔI TẬP NGÀY NÀY'}
            </Text>
          </Pressable>

          <Pressable
            testID="schedule-open-weekly"
            accessibilityRole="button"
            accessibilityLabel="Thiết lập lịch tuần"
            onPress={() => navigation.navigate('WeeklyPlan')}
            style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
          >
            <Ionicons name="calendar-number-outline" size={18} color={colors.accent} />
            <Text style={styles.ghostLabel}>THIẾT LẬP LỊCH TUẦN</Text>
          </Pressable>

          <Pressable
            testID="schedule-home"
            accessibilityRole="button"
            accessibilityLabel="Về trang chủ"
            onPress={() => navigation.popTo('Tabs', { screen: 'Dashboard' })}
            style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
          >
            <Ionicons name="home-outline" size={18} color={colors.accent} />
            <Text style={styles.ghostLabel}>VỀ TRANG CHỦ</Text>
          </Pressable>
        </Card>

        <Text style={styles.footer}>MỖI NGÀY MỘT CHÚT, MỘT NĂM KHÁC NGAY</Text>
      </ScrollView>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: spacing.page,
  },
  content: {
    paddingBottom: 32,
    paddingTop: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
  },
  summaryValueBlock: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  summaryValue: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '900',
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 9,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: colors.border,
    width: 1,
  },
  calendarCard: {
    marginBottom: 14,
  },
  monthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  pressed: {
    opacity: 0.75,
  },
  monthTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  weekdayLabel: {
    color: colors.dim,
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  dayCell: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    paddingVertical: 4,
  },
  dayBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  dayBadgeTrained: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayBadgeInProgress: {
    backgroundColor: 'rgba(251, 191, 36, 0.18)',
    borderColor: colors.warning,
  },
  dayBadgeToday: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  dayBadgeSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  dayText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  dayTextTrained: {
    color: colors.background,
  },
  dot: {
    backgroundColor: 'transparent',
    borderRadius: 999,
    height: 4,
    width: 4,
  },
  dotTrained: {
    backgroundColor: colors.accent,
  },
  dotPlanned: {
    backgroundColor: colors.dim,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 14,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendBadge: {
    height: 16,
    width: 16,
    borderRadius: 6,
  },
  legendDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  legendText: {
    color: colors.muted,
    fontSize: 10,
  },
  selectedCard: {
    marginBottom: 14,
  },
  selectedLabel: {
    color: colors.dim,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  selectedDate: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  selectedPlan: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
  },
  selectedHint: {
    color: colors.dim,
    fontSize: 11,
    marginTop: 6,
  },
  sessionBox: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  sessionTitle: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  sessionMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  sessionExerciseRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
  },
  sessionExerciseName: {
    color: colors.text,
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
  },
  sessionExerciseMeta: {
    color: colors.dim,
    fontSize: 10,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 13,
  },
  primaryLabel: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ghostButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 12,
  },
  ghostLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  footer: {
    color: colors.dim,
    fontSize: 9,
    letterSpacing: 1.4,
    textAlign: 'center',
  },
});

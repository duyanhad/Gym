import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { useWorkout } from '../contexts/WorkoutContext';
import TabScreenLayout from '../layouts/TabScreenLayout';
import { buildMonthMatrix, formatDateKey, monthTitle, shiftMonth, toDateKey, WEEKDAY_LABELS } from '../utils/date';

export default function WorkoutScheduleScreen() {
  const { isWorkoutDay, toggleWorkoutDay, logWorkoutToday, stats } = useWorkout();

  const today = new Date();
  const todayKey = toDateKey(today);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const weeks = buildMonthMatrix(cursor.year, cursor.month);

  const goToMonth = (delta) => setCursor((current) => shiftMonth(current.year, current.month, delta));

  const handleDayPress = (dateKey) => {
    setSelectedDate(dateKey);
    toggleWorkoutDay(dateKey);
  };

  return (
    <TabScreenLayout testID="schedule-screen" style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.streak}</Text>
            <Text style={styles.summaryLabel}>Chuỗi ngày</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.monthCount}</Text>
            <Text style={styles.summaryLabel}>Buổi tháng này</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text testID="schedule-total" style={styles.summaryValue}>
              {stats.totalCount}
            </Text>
            <Text style={styles.summaryLabel}>Tổng buổi</Text>
          </View>
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

                const trained = isWorkoutDay(cell.key);
                const isToday = cell.key === todayKey;
                const isSelected = cell.key === selectedDate;

                return (
                  <Pressable
                    key={cell.key}
                    testID={`schedule-day-${cell.key}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${formatDateKey(cell.key)}${trained ? ' - đã tập' : ''}`}
                    accessibilityState={{ selected: trained }}
                    onPress={() => handleDayPress(cell.key)}
                    style={styles.dayCell}
                  >
                    <View
                      style={[
                        styles.dayBadge,
                        trained && styles.dayBadgeTrained,
                        isToday && styles.dayBadgeToday,
                        isSelected && !trained && styles.dayBadgeSelected,
                      ]}
                    >
                      <Text style={[styles.dayText, trained && styles.dayTextTrained]}>{cell.day}</Text>
                    </View>
                    <View style={[styles.dot, trained && styles.dotTrained]} />
                  </Pressable>
                );
              })}
            </View>
          ))}

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.dayBadge, styles.dayBadgeTrained, styles.legendBadge]} />
              <Text style={styles.legendText}>Ngày đã tập</Text>
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
          <Text style={styles.selectedHint}>
            {isWorkoutDay(selectedDate)
              ? 'Bạn đã đánh dấu ngày này là ngày tập. Chạm lại để bỏ đánh dấu.'
              : 'Chạm vào một ngày trên lịch để đánh dấu đó là ngày bạn đi tập.'}
          </Text>

          <Pressable
            testID="schedule-mark-today"
            accessibilityRole="button"
            accessibilityLabel="Đánh dấu hôm nay đã tập"
            onPress={() => {
              logWorkoutToday();
              setSelectedDate(todayKey);
            }}
            style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.background} />
            <Text style={styles.todayButtonLabel}>ĐÁNH DẤU HÔM NAY ĐÃ TẬP</Text>
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
    paddingBottom: 24,
    paddingTop: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  summaryValue: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '900',
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 10,
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
  dayBadgeToday: {
    borderColor: colors.text,
    borderWidth: 1.5,
  },
  dayBadgeSelected: {
    borderColor: colors.accent,
  },
  dayText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  dayTextTrained: {
    color: colors.background,
    fontWeight: '900',
  },
  dot: {
    borderRadius: 999,
    height: 4,
    width: 4,
  },
  dotTrained: {
    backgroundColor: colors.success,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 18,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  legendBadge: {
    height: 18,
    width: 18,
  },
  legendText: {
    color: colors.muted,
    fontSize: 11,
  },
  selectedCard: {
    marginBottom: 8,
  },
  selectedLabel: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  selectedDate: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },
  selectedHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  todayButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 14,
  },
  todayButtonLabel: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  footer: {
    color: colors.dim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.6,
    paddingTop: 14,
    textAlign: 'center',
  },
});

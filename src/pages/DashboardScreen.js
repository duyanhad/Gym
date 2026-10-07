import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useWorkout } from '../contexts/WorkoutContext';
import TabScreenLayout from '../layouts/TabScreenLayout';
import { formatDateKey, toDateKey, WEEKDAY_LABELS } from '../utils/date';

function initialsOf(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'GY';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** 28 ngày gần nhất, mỗi hàng 7 ngày (tuần bắt đầu từ Thứ hai). */
function buildRecentDays() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + (7 - ((today.getDay() + 6) % 7)) - 1);

  return Array.from({ length: 28 }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (27 - index));

    return toDateKey(date);
  });
}

export default function DashboardScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const {
    stats,
    isWorkoutDay,
    toggleWorkoutDay,
    logWorkoutToday,
    workoutDays,
    exercises,
    connections,
    upcomingDateKeys,
    composePlanItemsForDate,
    completedForDate,
    weekPlan,
    planById,
  } = useWorkout();

  const todayKey = toDateKey(new Date());
  const trainedToday = isWorkoutDay(todayKey);
  const recentDays = buildRecentDays();
  const recentWorkoutDays = [...workoutDays].sort().reverse().slice(0, 4);
  const upcomingSessions = upcomingDateKeys.slice(0, 3);

  const statTiles = [
    { key: 'streak', icon: 'flame-outline', label: 'Chuỗi ngày tập', value: `${stats.streak} ngày`, testID: 'stat-streak' },
    { key: 'month', icon: 'calendar-outline', label: 'Buổi tháng này', value: `${stats.monthCount}`, testID: 'stat-month' },
    { key: 'exercises', icon: 'barbell-outline', label: 'Bài tập', value: `${exercises.length}`, testID: 'stat-exercises' },
    { key: 'connections', icon: 'people-outline', label: 'Kết nối', value: `${connections.filter((item) => item.status === 'CONNECTED').length}`, testID: 'stat-connections' },
  ];

  return (
    <TabScreenLayout testID="dashboard-screen" style={styles.page} showSessionBar={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>XIN CHÀO,</Text>
            <Text numberOfLines={1} style={styles.name}>
              {user?.fullName ?? 'Hội viên'}
            </Text>
          </View>

          <Pressable
            testID="dashboard-logout"
            accessibilityRole="button"
            accessibilityLabel="Đăng xuất"
            onPress={signOut}
            style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
          >
            <Text style={styles.avatarText}>{initialsOf(user?.fullName)}</Text>
          </Pressable>
        </View>

        <Card tone="accent" style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View style={styles.todayIcon}>
              <Ionicons name={trainedToday ? 'checkmark' : 'flash-outline'} size={18} color={colors.background} />
            </View>
            <View style={styles.todayText}>
              <Text style={styles.todayLabel}>HÔM NAY · {formatDateKey(todayKey).toUpperCase()}</Text>
              <Text style={styles.todayTitle}>
                {trainedToday ? 'Bạn đã hoàn thành buổi tập 💪' : 'Sẵn sàng cho buổi tập hôm nay?'}
              </Text>
            </View>
          </View>

          <Pressable
            testID="dashboard-mark-today"
            accessibilityRole="button"
            accessibilityLabel={trainedToday ? 'Bỏ đánh dấu hôm nay' : 'Đánh dấu hôm nay đã tập'}
            onPress={() => (trainedToday ? toggleWorkoutDay(todayKey) : logWorkoutToday())}
            style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}
          >
            <Text style={styles.todayButtonLabel}>
              {trainedToday ? 'BỎ ĐÁNH DẤU HÔM NAY' : 'ĐÁNH DẤU ĐÃ TẬP HÔM NAY'}
            </Text>
          </Pressable>
        </Card>

        <View style={styles.statGrid}>
          {statTiles.map((tile) => (
            <Card key={tile.key} style={styles.statTile}>
              <Ionicons name={tile.icon} size={18} color={colors.accent} />
              <Text testID={tile.testID} style={styles.statValue}>
                {tile.value}
              </Text>
              <Text style={styles.statLabel}>{tile.label}</Text>
            </Card>
          ))}
        </View>

        <Card style={styles.calendarCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>28 NGÀY GẦN ĐÂY</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mở mục Lịch"
              onPress={() => navigation.navigate('Schedule')}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            >
              <Text style={styles.linkLabel}>Lịch</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.accent} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label) => (
              <Text key={label} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.heatmap}>
            {recentDays.map((dateKey) => {
              const trained = isWorkoutDay(dateKey);
              const isToday = dateKey === todayKey;
              const isFuture = dateKey > todayKey;

              return (
                <View key={dateKey} style={styles.heatCell}>
                  <View
                    style={[
                      styles.heatDot,
                      trained && styles.heatDotTrained,
                      isToday && styles.heatDotToday,
                      isFuture && styles.heatDotFuture,
                    ]}
                  >
                    <Text style={[styles.heatDay, trained && styles.heatDayTrained]}>{Number(dateKey.slice(8, 10))}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={styles.legend}>Chấm sáng = ngày bạn đã đánh dấu đi tập.</Text>
        </Card>

        <Card style={styles.recentCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BUỔI TẬP SẮP TỚI</Text>
            <Pressable
              testID="dashboard-open-weekly"
              accessibilityRole="button"
              accessibilityLabel="Thiết lập lịch tuần"
              onPress={() => navigation.navigate('WeeklyPlan')}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            >
              <Text style={styles.linkLabel}>Lịch tuần</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.accent} />
            </Pressable>
          </View>

          {upcomingSessions.length === 0 ? (
            <Text style={styles.empty}>Bạn chưa xếp buổi tập nào cho tuần này.</Text>
          ) : (
            upcomingSessions.map((dateKey) => {
              const items = composePlanItemsForDate(dateKey);
              const done = completedForDate(dateKey).length;
              const weekday = new Date(`${dateKey}T00:00:00`).getDay();
              const plan = planById(weekPlan[weekday]);

              return (
                <Pressable
                  key={dateKey}
                  testID={`dashboard-session-${dateKey}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Xem chi tiết buổi tập ${formatDateKey(dateKey)}`}
                  onPress={() => navigation.navigate('WorkoutSession', { dateKey, title: 'Chi tiết buổi tập' })}
                  style={({ pressed }) => [styles.upcomingRow, pressed && styles.pressed]}
                >
                  <View style={styles.recentIcon}>
                    <Ionicons name="barbell-outline" size={16} color={colors.accent} />
                  </View>

                  <View style={styles.upcomingText}>
                    <Text numberOfLines={1} style={styles.upcomingTitle}>
                      {plan?.name ?? 'Buổi tập'}
                    </Text>
                    <Text style={styles.upcomingMeta}>
                      {formatDateKey(dateKey)} · {done}/{items.length} bài
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color={colors.dim} />
                </Pressable>
              );
            })
          )}
        </Card>

        <Card style={styles.recentCard}>
          <Text style={styles.sectionTitle}>BUỔI TẬP GẦN ĐÂY</Text>

          {recentWorkoutDays.length === 0 ? (
            <Text style={styles.empty}>Chưa có buổi tập nào. Hãy đánh dấu buổi đầu tiên!</Text>
          ) : (
            recentWorkoutDays.map((dateKey) => (
              <View key={dateKey} style={styles.recentRow}>
                <View style={styles.recentIcon}>
                  <Ionicons name="barbell-outline" size={16} color={colors.accent} />
                </View>
                <Text style={styles.recentDate}>{formatDateKey(dateKey)}</Text>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              </View>
            ))
          )}
        </Card>

        <Text style={styles.footer}>KIÊN TRÌ TẠO NÊN KHÁC BIỆT</Text>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  avatarText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.75,
  },
  todayCard: {
    marginBottom: 16,
  },
  todayHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  todayIcon: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  todayText: {
    flex: 1,
  },
  todayLabel: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  todayTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 23,
    marginTop: 6,
  },
  todayButton: {
    alignItems: 'center',
    borderColor: colors.accent,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
    paddingVertical: 13,
  },
  todayButtonLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statTile: {
    flexBasis: '46%',
    flexGrow: 1,
    gap: 6,
    padding: 14,
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
  },
  calendarCard: {
    marginBottom: 16,
  },
  sectionHeader: {
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
  linkButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  linkLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  weekdayLabel: {
    color: colors.dim,
    flex: 1,
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  heatmap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  heatCell: {
    alignItems: 'center',
    flexBasis: `${100 / 7}%`,
    paddingVertical: 3,
  },
  heatDot: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  heatDotTrained: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  heatDotToday: {
    borderColor: colors.text,
  },
  heatDotFuture: {
    opacity: 0.35,
  },
  heatDay: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  heatDayTrained: {
    color: colors.background,
    fontWeight: '900',
  },
  legend: {
    color: colors.dim,
    fontSize: 10,
    marginTop: 12,
  },
  recentCard: {
    marginBottom: 8,
  },
  recentRow: {
    alignItems: 'center',
    borderTopColor: '#232A34',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  recentIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  recentDate: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  upcomingRow: {
    alignItems: 'center',
    borderTopColor: '#232A34',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  upcomingText: {
    flex: 1,
  },
  upcomingTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  upcomingMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  empty: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  footer: {
    color: colors.dim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    paddingTop: 14,
    textAlign: 'center',
  },
});

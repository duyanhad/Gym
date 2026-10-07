import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useWorkout } from '../contexts/WorkoutContext';
import TabScreenLayout from '../layouts/TabScreenLayout';
import { formatDateKey, toDateKey, WEEKDAY_LABELS } from '../utils/date';
import { formatClock } from '../utils/time';

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

/** Các ngày tập tiếp theo (tối đa `limit`) dựa trên lịch tuần đã thiết lập. */
function nextScheduledDays(weekPlan, limit = 3) {
  const today = new Date();
  const result = [];

  for (let offset = 0; offset <= 13 && result.length < limit; offset += 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const dateKey = toDateKey(date);

    if (weekPlan[date.getDay()]) result.push({ dateKey, weekday: date.getDay() });
  }

  return result;
}

export default function DashboardScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const {
    stats,
    dayMarks,
    history,
    exerciseCount,
    plans,
    weekPlan,
    planById,
    scheduleForDay,
    sessionForDate,
    loadSessionForDate,
  } = useWorkout();

  const todayKey = toDateKey(new Date());
  const todayWeekday = new Date().getDay();
  const todayPlan = planById(weekPlan[todayWeekday]);
  const todaySession = sessionForDate(todayKey);
  const recentDays = buildRecentDays();
  const upcoming = nextScheduledDays(weekPlan);
  const recentSessions = history.slice(0, 4);

  const openSession = async (dateKey) => {
    await loadSessionForDate(dateKey).catch(() => {});
    navigation.navigate('WorkoutSession', { dateKey, title: 'Buổi tập' });
  };

  const statTiles = [
    { key: 'streak', icon: 'flame-outline', label: 'Chuỗi ngày tập', value: `${stats.streak}`, testID: 'stat-streak' },
    { key: 'month', icon: 'calendar-outline', label: 'Buổi tháng này', value: `${stats.monthCount}`, testID: 'stat-month' },
    { key: 'exercises', icon: 'barbell-outline', label: 'Bài tập', value: `${exerciseCount}`, testID: 'stat-exercises' },
    {
      key: 'connections',
      icon: 'people-outline',
      label: 'Kết nối',
      value: `${stats.connectionCount}`,
      testID: 'stat-connections',
    },
  ];

  return (
    <TabScreenLayout testID="dashboard-screen" style={styles.page}>
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
              <Ionicons
                name={todaySession ? 'barbell' : 'flash-outline'}
                size={18}
                color={colors.background}
              />
            </View>
            <View style={styles.todayText}>
              <Text style={styles.todayLabel}>HÔM NAY · {formatDateKey(todayKey).toUpperCase()}</Text>
              <Text numberOfLines={2} style={styles.todayTitle}>
                {todaySession
                  ? `Buổi tập đang ${todaySession.status === 'FINISHED' ? 'hoàn thành' : 'diễn ra'}: ${todaySession.completedExercises}/${todaySession.totalExercises} bài`
                  : todayPlan
                    ? `Theo lịch: ${todayPlan.name}`
                    : 'Hôm nay chưa có buổi tập trong lịch tuần'}
              </Text>
            </View>
          </View>

          {todaySession ? (
            <Text testID="dashboard-today-total" style={styles.todayMeta}>
              Tổng thời gian tập: {formatClock(todaySession.totalDurationSeconds + todaySession.totalRestSeconds)}
            </Text>
          ) : (
            <Text style={styles.todayMeta}>
              Lịch tuần có {stats.scheduledWeekdays}/7 ngày tập · tỷ lệ hoàn thành {stats.completionRate}%
            </Text>
          )}

          <Pressable
            testID="dashboard-start-session"
            accessibilityRole="button"
            accessibilityLabel={todaySession ? 'Mở buổi tập hôm nay' : 'Bắt đầu buổi tập hôm nay'}
            onPress={() => openSession(todayKey)}
            style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}
          >
            <Ionicons name="play" size={16} color={colors.background} />
            <Text style={styles.todayButtonLabel}>
              {todaySession ? 'MỞ BUỔI TẬP HÔM NAY' : 'BẮT ĐẦU BUỔI TẬP'}
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
              testID="dashboard-open-schedule"
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
              const mark = dayMarks[dateKey];
              const trained = Boolean(mark?.hasSession);
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
                    <Text style={[styles.heatDay, trained && styles.heatDayTrained]}>
                      {Number(dateKey.slice(8, 10))}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={styles.legend}>
            Chấm sáng = ngày đã có buổi tập · tổng {stats.totalCount} buổi · {stats.totalMinutes} phút
          </Text>
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

          {upcoming.length === 0 ? (
            <Text style={styles.empty}>Bạn chưa xếp buổi tập nào cho tuần này.</Text>
          ) : (
            upcoming.map(({ dateKey, weekday }) => {
              const plan = planById(weekPlan[weekday]);
              const entry = scheduleForDay(weekday);

              return (
                <Pressable
                  key={dateKey}
                  testID={`dashboard-session-${dateKey}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Xem buổi tập ${formatDateKey(dateKey)}`}
                  onPress={() => openSession(dateKey)}
                  style={({ pressed }) => [styles.upcomingRow, pressed && styles.pressed]}
                >
                  <View style={styles.recentIcon}>
                    <Ionicons name="barbell-outline" size={16} color={colors.accent} />
                  </View>

                  <View style={styles.upcomingText}>
                    <Text numberOfLines={1} style={styles.upcomingTitle}>
                      {plan?.name ?? entry?.planName ?? 'Buổi tập'}
                    </Text>
                    <Text style={styles.upcomingMeta}>
                      {formatDateKey(dateKey)} · {entry?.itemsCount ?? plan?.items.length ?? 0} bài
                      {dateKey === todayKey ? ' · hôm nay' : ''}
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

          {recentSessions.length === 0 ? (
            <Text style={styles.empty}>Chưa có buổi tập nào. Hãy bắt đầu buổi đầu tiên!</Text>
          ) : (
            recentSessions.map((item) => (
              <Pressable
                key={item.workoutSessionId}
                testID={`dashboard-history-${item.dateKey}`}
                accessibilityRole="button"
                accessibilityLabel={`Xem buổi tập ${formatDateKey(item.dateKey)}`}
                onPress={() => openSession(item.dateKey)}
                style={({ pressed }) => [styles.recentRow, pressed && styles.pressed]}
              >
                <View style={styles.recentIcon}>
                  <Ionicons name="barbell-outline" size={16} color={colors.accent} />
                </View>

                <View style={styles.upcomingText}>
                  <Text style={styles.recentDate}>{formatDateKey(item.dateKey)}</Text>
                  <Text style={styles.upcomingMeta}>
                    {item.planName ?? 'Buổi tập tự chọn'} · {item.completedExercises}/{item.totalExercises} bài ·{' '}
                    {formatClock(item.totalDurationSeconds)} tập + {formatClock(item.totalRestSeconds)} nghỉ
                  </Text>
                </View>

                <Ionicons
                  name={item.status === 'FINISHED' ? 'checkmark-circle' : 'ellipsis-horizontal-circle'}
                  size={18}
                  color={item.status === 'FINISHED' ? colors.success : colors.warning}
                />
              </Pressable>
            ))
          )}
        </Card>

        <Card style={styles.recentCard}>
          <Text style={styles.sectionTitle}>ĐI NHANH</Text>

          <View style={styles.quickGrid}>
            {[
              { key: 'exercises', label: `Bài tập (${exerciseCount})`, icon: 'barbell-outline', screen: 'Exercises' },
              { key: 'plans', label: `Giáo án (${plans.length})`, icon: 'albums-outline', screen: 'WeeklyPlan' },
              { key: 'add', label: 'Thêm bài tập', icon: 'add-circle-outline', screen: 'AddExercise' },
              { key: 'share', label: 'Chia sẻ', icon: 'share-social-outline', screen: 'Share' },
              { key: 'settings', label: 'Cài đặt', icon: 'settings-outline', screen: 'Settings' },
            ].map((item) => (
              <Pressable
                key={item.key}
                testID={`dashboard-quick-${item.key}`}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => navigation.navigate(item.screen)}
                style={({ pressed }) => [styles.quickTile, pressed && styles.pressed]}
              >
                <Ionicons name={item.icon} size={18} color={colors.accent} />
                <Text style={styles.quickLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
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
    paddingBottom: 32,
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
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  todayText: {
    flex: 1,
  },
  todayLabel: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  todayTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  todayMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 10,
  },
  todayButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
  },
  todayButtonLabel: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statTile: {
    alignItems: 'center',
    flexGrow: 1,
    gap: 4,
    minWidth: '44%',
    paddingVertical: 16,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
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
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  linkButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  linkLabel: {
    color: colors.accent,
    fontSize: 11,
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
    marginTop: 6,
  },
  heatCell: {
    alignItems: 'center',
    paddingVertical: 3,
    width: `${100 / 7}%`,
  },
  heatDot: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  heatDotTrained: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  heatDotToday: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  heatDotFuture: {
    opacity: 0.45,
  },
  heatDay: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  heatDayTrained: {
    color: colors.background,
  },
  legend: {
    color: colors.dim,
    fontSize: 10,
    marginTop: 10,
  },
  recentCard: {
    marginBottom: 16,
  },
  empty: {
    color: colors.dim,
    fontSize: 12,
    marginTop: 10,
  },
  upcomingRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
  },
  recentRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
  },
  recentIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  upcomingText: {
    flex: 1,
  },
  upcomingTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  upcomingMeta: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
  recentDate: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  quickTile: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    color: colors.dim,
    fontSize: 9,
    letterSpacing: 1.4,
    textAlign: 'center',
  },
});

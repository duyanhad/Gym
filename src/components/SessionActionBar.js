import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import { useWorkout } from '../contexts/WorkoutContext';
import { toDateKey } from '../utils/date';

/**
 * Thanh "Buổi tập hôm nay" gọn ở đáy các màn hình chính:
 * bấm để bắt đầu (nếu chưa bắt đầu) và mở chi tiết buổi tập; có nút Kết thúc khi đang tập.
 */
export default function SessionActionBar({ testID = 'session-action-bar' }) {
  const navigation = useNavigation();
  const { sessionOf, startSession, finishSession, isWorkoutDay, logWorkoutToday } = useWorkout();

  const todayKey = toDateKey(new Date());
  const todaySession = sessionOf(todayKey);
  const inProgress = Boolean(todaySession.startedAt && !todaySession.finishedAt);
  const finished = Boolean(todaySession.finishedAt);
  const trainedToday = isWorkoutDay(todayKey);

  const openSession = () => {
    if (!todaySession.startedAt) {
      startSession(todayKey);
      logWorkoutToday();
    }

    navigation.navigate('WorkoutSession', { dateKey: todayKey, title: 'Buổi tập hôm nay' });
  };

  const statusText = inProgress
    ? 'Đang tập · bấm để xem chi tiết'
    : finished
      ? 'Đã kết thúc buổi tập hôm nay'
      : trainedToday
        ? 'Hôm nay đã tập · bấm để xem chi tiết'
        : 'Chưa bắt đầu · bấm để bắt đầu buổi tập';

  return (
    <View style={styles.wrap}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={statusText}
        onPress={openSession}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={[styles.icon, inProgress && styles.iconActive]}>
          <Ionicons
            name={inProgress ? 'timer-outline' : finished || trainedToday ? 'checkmark' : 'play'}
            size={18}
            color={inProgress ? colors.background : colors.accent}
          />
        </View>

        <View style={styles.text}>
          <Text style={styles.title}>BUỔI TẬP HÔM NAY</Text>
          <Text numberOfLines={1} style={styles.meta}>
            {statusText}
          </Text>
        </View>

        {inProgress ? null : <Ionicons name="chevron-forward" size={16} color={colors.dim} />}
      </Pressable>

      {inProgress ? (
        <Pressable
          testID={`${testID}-finish`}
          accessibilityRole="button"
          accessibilityLabel="Kết thúc buổi tập hôm nay"
          onPress={() => finishSession(todayKey)}
          style={({ pressed }) => [styles.stop, pressed && styles.pressed]}
        >
          <Ionicons name="stop" size={16} color={colors.background} />
          <Text style={styles.stopLabel}>KẾT THÚC</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    borderTopColor: '#232A34',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  main: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.78,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  iconActive: {
    backgroundColor: colors.accent,
  },
  text: {
    flex: 1,
  },
  title: {
    color: colors.dim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  meta: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  stop: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  stopLabel: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});

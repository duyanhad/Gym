import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import { useWorkout } from '../contexts/WorkoutContext';
import { toDateKey } from '../utils/date';

export const BOTTOM_TABS = [
  { name: 'Schedule', label: 'Lịch', icon: 'calendar-outline', activeIcon: 'calendar' },
  { name: 'Exercises', label: 'Bài tập', icon: 'barbell-outline', activeIcon: 'barbell' },
  { spacer: true, name: 'spacer' },
  { name: 'Share', label: 'Chia sẻ', icon: 'people-outline', activeIcon: 'people' },
  { name: 'Settings', label: 'Cài đặt', icon: 'settings-outline', activeIcon: 'settings' },
];

/** 4 hành động xếp quanh núm giữa, dàn thành hình quạt phía trên. */
const ACTIONS = [
  { key: 'session', label: 'Bắt đầu buổi tập', icon: 'play', angle: 150 },
  { key: 'add', label: 'Thêm bài tập', icon: 'add', angle: 110, route: 'AddExercise' },
  { key: 'share', label: 'Chia sẻ', icon: 'share-social-outline', angle: 70, route: 'Share' },
  { key: 'schedule', label: 'Lịch tuần', icon: 'calendar-number-outline', angle: 30, route: 'WeeklyPlan' },
];

const FAB_SIZE = 60;
const ACTION_SIZE = 58;
const RADIUS = 100;
const FAB_CENTER_BOTTOM = 76;

function polar(angleDeg, radius) {
  const radians = (angleDeg * Math.PI) / 180;

  return { x: Math.cos(radians) * radius, y: Math.sin(radians) * radius };
}

/**
 * Thanh điều hướng dưới cùng (5 mục) + núm giữa.
 * Bấm núm để mở 4 nút tròn xung quanh: Bắt đầu buổi tập / Thêm bài tập / Chia sẻ / Lịch tuần.
 * Đang tập thì núm giữa đổi thành "Kết thúc".
 */
export default function BottomNav({ state, navigation, insets }) {
  const { sessionOf, startSession, finishSession } = useWorkout();
  const [open, setOpen] = useState(false);

  const todayKey = toDateKey(new Date());
  const todaySession = sessionOf(todayKey);
  const inProgress = Boolean(todaySession.startedAt && !todaySession.finishedAt);
  const activeName = state.routes[state.index]?.name;

  useEffect(() => {
    setOpen(false);
  }, [activeName]);

  const bottomInset = insets?.bottom ?? 0;
  const openWorkoutSession = () =>
    navigation.getParent()?.navigate('WorkoutSession', { dateKey: todayKey, title: 'Buổi tập hôm nay' });

  const handlePrimary = () => {
    if (!open) {
      setOpen(true);
      return;
    }

    if (inProgress) {
      finishSession(todayKey);
      setOpen(false);
      return;
    }

    startSession(todayKey);
    setOpen(false);
    openWorkoutSession();
  };

  const handleAction = (action) => {
    setOpen(false);

    if (action.key === 'session') {
      if (!inProgress) startSession(todayKey);
      openWorkoutSession();
      return;
    }

    navigation.navigate(action.route);
  };

  return (
    <View style={styles.wrapper}>
      {open ? (
        <>
          <Pressable
            testID="quick-actions-backdrop"
            accessibilityRole="button"
            accessibilityLabel="Đóng menu nhanh"
            onPress={() => setOpen(false)}
            style={styles.backdrop}
          />

          <View pointerEvents="box-none" style={styles.actionLayer}>
            <Text style={styles.actionLayerTitle}>
              {inProgress ? 'BUỔI TẬP ĐANG DIỄN RA' : 'BẮT ĐẦU NHANH'}
            </Text>

            {ACTIONS.map((action) => {
              const offset = polar(action.angle, RADIUS);
              const isSession = action.key === 'session';
              const highlight = isSession && !inProgress;

              return (
                <Pressable
                  key={action.key}
                  testID={`quick-action-${action.key}`}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  onPress={() => handleAction(action)}
                  style={({ pressed }) => [
                    styles.actionSlot,
                    {
                      bottom: FAB_CENTER_BOTTOM + offset.y - ACTION_SIZE / 2,
                      marginLeft: offset.x - ACTION_SIZE / 2,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.actionCircle, highlight && styles.actionCircleHighlight]}>
                    <Ionicons
                      name={isSession && inProgress ? 'stop' : action.icon}
                      size={22}
                      color={highlight ? colors.background : colors.accent}
                    />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <View style={[styles.bar, { paddingBottom: Math.max(bottomInset, 10) }]}>
        {BOTTOM_TABS.map((tab) => {
          if (tab.spacer) return <View key="spacer" style={styles.spacer} />;

          const routeIndex = state.routes.findIndex((item) => item.name === tab.name);
          if (routeIndex === -1) return null;

          const route = state.routes[routeIndex];
          const active = state.index === routeIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!active && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={tab.name}
              testID={`bottom-tab-${tab.name}`}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
              onPress={onPress}
              style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
            >
              <Ionicons
                name={active ? tab.activeIcon : tab.icon}
                size={20}
                color={active ? colors.accent : colors.icon}
              />
              <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
              <View style={[styles.indicator, active && styles.indicatorActive]} />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        testID="quick-action-fab"
        accessibilityRole="button"
        accessibilityLabel={open ? (inProgress ? 'Kết thúc buổi tập' : 'Bắt đầu buổi tập') : 'Mở thao tác nhanh'}
        accessibilityState={{ expanded: open }}
        onPress={handlePrimary}
        style={({ pressed }) => [
          styles.fab,
          { bottom: Math.max(bottomInset, 10) + 18 },
          inProgress && styles.fabActive,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name={open ? (inProgress ? 'stop' : 'play') : 'ellipsis-horizontal'}
          size={open ? 24 : 26}
          color={colors.background}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  backdrop: {
    backgroundColor: 'rgba(6, 8, 12, 0.75)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: -900,
    zIndex: 1,
  },
  actionLayer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: -900,
    zIndex: 2,
  },
  actionLayerTitle: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    bottom: RADIUS + FAB_CENTER_BOTTOM + 86,
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 6,
    position: 'absolute',
    textAlign: 'center',
  },
  actionSlot: {
    alignItems: 'center',
    left: '50%',
    position: 'absolute',
    width: 96,
  },
  actionCircle: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: 'rgba(198, 241, 53, 0.45)',
    borderRadius: 999,
    borderWidth: 1,
    height: ACTION_SIZE,
    justifyContent: 'center',
    width: ACTION_SIZE,
  },
  actionCircleHighlight: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  bar: {
    alignItems: 'flex-end',
    backgroundColor: '#141922',
    borderTopColor: '#232A34',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  slot: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    paddingVertical: 4,
  },
  spacer: {
    flex: 1,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    color: colors.icon,
    fontSize: 10,
    fontWeight: '700',
  },
  activeLabel: {
    color: colors.accent,
  },
  indicator: {
    backgroundColor: 'transparent',
    borderRadius: 999,
    height: 3,
    width: 3,
  },
  indicatorActive: {
    backgroundColor: colors.accent,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderColor: '#141922',
    borderRadius: 999,
    borderWidth: 4,
    height: FAB_SIZE,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -FAB_SIZE / 2,
    position: 'absolute',
    width: FAB_SIZE,
    zIndex: 3,
  },
  fabActive: {
    backgroundColor: colors.success,
  },
});

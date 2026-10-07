import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import { toDateKey } from '../utils/date';

export const BOTTOM_TABS = [
  { name: 'Schedule', label: 'Lịch', icon: 'calendar-outline', activeIcon: 'calendar' },
  { name: 'Exercises', label: 'Bài tập', icon: 'barbell-outline', activeIcon: 'barbell' },
  { spacer: true, name: 'spacer' },
  { name: 'Share', label: 'Chia sẻ', icon: 'people-outline', activeIcon: 'people' },
  { name: 'Settings', label: 'Cài đặt', icon: 'settings-outline', activeIcon: 'settings' },
];

/**
 * 4 thao tác chính xếp thành vòng tròn quanh tâm màn hình.
 * Góc theo hệ toạ độ màn hình: 0° = phải, 90° = xuống.
 */
const ACTIONS = [
  { key: 'session', label: 'Bắt đầu buổi tập', icon: 'play', angle: 225, primary: true },
  { key: 'schedule', label: 'Lịch tuần', icon: 'calendar-number-outline', angle: 315, route: 'WeeklyPlan' },
  { key: 'add', label: 'Thêm bài tập', icon: 'add', angle: 135, route: 'AddExercise' },
  { key: 'share', label: 'Chia sẻ', icon: 'share-social-outline', angle: 45, route: 'Share' },
];

const FAB_SIZE = 60;
const ACTION_SIZE = 62;
const ACTION_SLOT_WIDTH = 92;
const ACTION_SLOT_HEIGHT = 100;
const HUB_SIZE = 116;
const RADIUS = 120;

function polar(angleDeg, radius) {
  const radians = (angleDeg * Math.PI) / 180;

  return { x: Math.cos(radians) * radius, y: Math.sin(radians) * radius };
}

/**
 * Thanh điều hướng dưới cùng + núm tròn ở giữa thanh.
 * Bấm núm giữa để mở vòng tròn thao tác ở **giữa màn hình**:
 * Bắt đầu buổi tập / Lịch tuần / Thêm bài tập / Chia sẻ.
 */
export default function BottomNav({ state, navigation, insets }) {
  const [open, setOpen] = useState(false);
  const activeName = state.routes[state.index]?.name;

  useEffect(() => {
    setOpen(false);
  }, [activeName]);

  const bottomInset = insets?.bottom ?? 0;
  const todayKey = toDateKey(new Date());

  const handleAction = (action) => {
    setOpen(false);

    if (action.key === 'session') {
      navigation
        .getParent()
        ?.navigate('WorkoutSession', { dateKey: todayKey, title: 'Buổi tập hôm nay' });
      return;
    }

    navigation.navigate(action.route);
  };

  return (
    <View style={styles.wrapper}>
      {open ? (
        <Modal animationType="fade" transparent visible onRequestClose={() => setOpen(false)}>
          <View testID="quick-actions-overlay" style={styles.overlay}>
            <Pressable
              testID="quick-actions-backdrop"
              accessibilityRole="button"
              accessibilityLabel="Đóng menu nhanh"
              onPress={() => setOpen(false)}
              style={StyleSheet.absoluteFill}
            />

            <View pointerEvents="box-none" style={styles.hub}>
              {ACTIONS.map((action) => {
                const offset = polar(action.angle, RADIUS);
                const primary = Boolean(action.primary);

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
                        marginLeft: offset.x - ACTION_SLOT_WIDTH / 2,
                        marginTop: offset.y - ACTION_SLOT_HEIGHT / 2,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={[styles.actionCircle, primary && styles.actionCirclePrimary]}>
                      <Ionicons
                        name={action.icon}
                        size={22}
                        color={primary ? colors.background : colors.accent}
                      />
                    </View>
                    <Text style={[styles.actionLabel, primary && styles.actionLabelPrimary]}>
                      {action.label}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                testID="quick-actions-close"
                accessibilityRole="button"
                accessibilityLabel="Đóng menu nhanh"
                onPress={() => setOpen(false)}
                style={({ pressed }) => [styles.hubCenter, pressed && styles.pressed]}
              >
                <View style={styles.hubRing}>
                  <Ionicons name="close" size={20} color={colors.accent} />
                  <Text style={styles.hubTitle}>THAO TÁC</Text>
                  <Text style={styles.hubHint}>Chạm ngoài để đóng</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </Modal>
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
        accessibilityLabel="Mở thao tác nhanh"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.fab,
          { bottom: Math.max(bottomInset, 10) + 18 },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="barbell" size={26} color={colors.background} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  overlay: {
    backgroundColor: 'rgba(6, 8, 12, 0.82)',
    flex: 1,
  },
  hub: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  hubCenter: {
    alignItems: 'center',
    height: HUB_SIZE,
    justifyContent: 'center',
    width: HUB_SIZE,
  },
  hubRing: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.accent,
    borderRadius: 999,
    borderWidth: 1,
    height: HUB_SIZE,
    justifyContent: 'center',
    width: HUB_SIZE,
  },
  hubTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: 4,
  },
  hubHint: {
    color: colors.dim,
    fontSize: 8,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  actionSlot: {
    alignItems: 'center',
    height: ACTION_SLOT_HEIGHT,
    left: '50%',
    position: 'absolute',
    top: '50%',
    width: ACTION_SLOT_WIDTH,
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
  actionCirclePrimary: {
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
  actionLabelPrimary: {
    color: colors.accent,
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
});

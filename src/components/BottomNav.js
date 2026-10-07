import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';

export const BOTTOM_TABS = [
  { name: 'Schedule', label: 'Lịch', icon: 'calendar-outline', activeIcon: 'calendar' },
  { name: 'Exercises', label: 'Bài tập', icon: 'barbell-outline', activeIcon: 'barbell' },
  { name: 'AddExercise', label: 'Thêm', icon: 'add', activeIcon: 'add', primary: true },
  { name: 'Share', label: 'Chia sẻ', icon: 'people-outline', activeIcon: 'people' },
  { name: 'Settings', label: 'Cài đặt', icon: 'settings-outline', activeIcon: 'settings' },
];

/**
 * Thanh điều hướng dưới cùng với 5 mục chính.
 * Mục "Thêm" ở giữa được làm nổi bật để dễ bấm.
 */
export default function BottomNav({ state, navigation, insets }) {
  const bottomInset = insets?.bottom ?? 0;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(bottomInset, 10) }]}>
      {state.routes.map((route, index) => {
        const tab = BOTTOM_TABS.find((item) => item.name === route.name);
        if (!tab) return null;

        const active = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!active && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (tab.primary) {
          return (
            <Pressable
              key={tab.name}
              testID={`bottom-tab-${tab.name}`}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              onPress={onPress}
              style={({ pressed }) => [styles.primarySlot, pressed && styles.pressed]}
            >
              <View style={styles.primaryButton}>
                <Ionicons name="add" size={26} color={colors.background} />
              </View>
              <Text style={[styles.label, styles.primaryLabel]}>{tab.label}</Text>
            </Pressable>
          );
        }

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
  );
}

const styles = StyleSheet.create({
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
  primarySlot: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    paddingVertical: 4,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 999,
    boxShadow: Platform.select({ web: '0 6px 16px rgba(198, 241, 53, 0.3)', default: undefined }),
    height: 44,
    justifyContent: 'center',
    marginTop: -16,
    width: 44,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: colors.icon,
    fontSize: 10,
    fontWeight: '700',
  },
  activeLabel: {
    color: colors.accent,
  },
  primaryLabel: {
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
});

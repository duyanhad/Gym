import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../constants/theme';

export default function PrimaryButton({ label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
});

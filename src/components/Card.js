import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../constants/theme';

/** Khung nền dùng chung cho các khối nội dung (surface + viền + bán kính). */
export default function Card({ children, style, tone = 'surface', testID }) {
  return (
    <View
      testID={testID}
      style={[styles.card, tone === 'accent' && styles.accent, tone === 'flat' && styles.flat, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderWidth: 1,
    padding: spacing.card,
  },
  accent: {
    borderColor: 'rgba(198, 241, 53, 0.35)',
  },
  flat: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 14,
  },
});

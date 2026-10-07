import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';

export const GYM_LOGO_LIGHT = require('../../assets/splash-icon.png');

/**
 * Logo GYM: dumbbell vẽ bằng View (không cần thư viện icon) + wordmark tuỳ chọn.
 *
 * @param size   chiều rộng vùng chứa, dumbbell chiếm ~62% chiều rộng này
 * @param showWordmark hiện chữ GYM bên dưới
 * @param color  màu mark (mặc định accent)
 */
export default function GymLogo({ size = 96, showWordmark = false, color = colors.accent }) {
  const barWidth = size * 0.62;
  const barHeight = Math.max(4, size * 0.105);
  const innerWidth = Math.max(3, size * 0.085);
  const innerHeight = Math.max(6, size * 0.235);
  const outerWidth = Math.max(3, size * 0.08);
  const outerHeight = Math.max(8, size * 0.375);
  const gap = Math.max(1, size * 0.012);
  const radius = outerHeight / 2.4;

  const plate = (width, height, offset) => (
    <View
      style={[
        styles.plate,
        { height, width, borderRadius: radius, [offset < 0 ? 'right' : 'left']: Math.abs(offset), backgroundColor: color },
      ]}
    />
  );

  return (
    <View style={styles.container} accessibilityRole="image" accessibilityLabel="GYM">
      <View style={[styles.dumbbell, { height: outerHeight, width: barWidth + 2 * (innerWidth + outerWidth + 2 * gap) }]}>
        <View style={[styles.bar, { backgroundColor: color, borderRadius: barHeight / 2, height: barHeight, width: barWidth }]} />

        {/* Bánh tạ bên trái: trong + ngoài */}
        {plate(innerWidth, innerHeight, -(barWidth / 2 + gap))}
        {plate(outerWidth, outerHeight, -(barWidth / 2 + gap + innerWidth + gap))}

        {/* Bánh tạ bên phải: trong + ngoài */}
        {plate(innerWidth, innerHeight, barWidth / 2 + gap)}
        {plate(outerWidth, outerHeight, barWidth / 2 + gap + innerWidth + gap)}
      </View>

      {showWordmark ? <Text style={[styles.wordmark, { color, fontSize: Math.max(12, size * 0.165) }]}>GYM</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dumbbell: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  bar: {
    position: 'absolute',
  },
  plate: {
    position: 'absolute',
  },
  wordmark: {
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 14,
  },
});

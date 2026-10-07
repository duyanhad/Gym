import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../constants/theme';

/** Logo trên header: chạm để quay về tab Tổng quan. */
export default function HeaderBrand() {
  const navigation = useNavigation();

  return (
    <Pressable
      testID="header-brand"
      accessibilityRole="button"
      accessibilityLabel="Về trang tổng quan"
      onPress={() => navigation.navigate('Tabs', { screen: 'Dashboard' })}
      style={({ pressed }) => [styles.brand, pressed && styles.pressed]}
    >
      <Text style={styles.text}>
        GYM<Text style={styles.dot}>.</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brand: {
    paddingRight: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  dot: {
    color: colors.accent,
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../layouts/AppLayout';

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();

  return (
    <AppLayout style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.brand}>GYM<Text style={styles.period}>.</Text></Text>
        <View style={styles.account}>
          <Text numberOfLines={1} style={styles.date}>
            {user?.fullName ? user.fullName.toUpperCase() : 'BẮT ĐẦU HÔM NAY'}
          </Text>
          <Pressable
            testID="logout-button"
            accessibilityRole="button"
            accessibilityLabel="Đăng xuất"
            onPress={signOut}
            style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
          >
            <Text style={styles.logoutLabel}>THOÁT</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>KẾ HOẠCH CỦA BẠN</Text>
        <Text style={styles.title}>Mạnh mẽ hơn,{'\n'}mỗi ngày.</Text>
        <Text style={styles.description}>
          Tập trung vào mục tiêu. Chúng tôi đồng hành cùng bạn trên từng chặng đường.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>BUỔI TẬP HÔM NAY</Text>
          <Text style={styles.workoutTitle}>Toàn thân</Text>
          <Text style={styles.workoutDetails}>45 phút  ·  6 bài tập</Text>
          <View style={styles.divider} />
          <Text style={styles.cardHint}>Sẵn sàng chinh phục mục tiêu tiếp theo?</Text>
          <PrimaryButton
            label="Bắt đầu tập"
            onPress={() => navigation.navigate('Workout')}
          />
        </View>
      </View>
      <Text style={styles.footer}>KIÊN TRÌ TẠO NÊN KHÁC BIỆT</Text>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
  },
  brand: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  period: {
    color: colors.accent,
  },
  date: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    maxWidth: 160,
    textAlign: 'right',
  },
  account: {
    alignItems: 'flex-end',
    gap: 6,
  },
  logout: {
    borderColor: '#2C3441',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  logoutPressed: {
    borderColor: colors.accent,
  },
  logoutLabel: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 48,
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 310,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: '#282F39',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 36,
    padding: 22,
  },
  cardLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  workoutTitle: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 10,
  },
  workoutDetails: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 6,
  },
  divider: {
    backgroundColor: '#303743',
    height: 1,
    marginVertical: 18,
  },
  cardHint: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 16,
  },
  footer: {
    color: '#67717D',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    paddingBottom: 16,
    textAlign: 'center',
  },
});

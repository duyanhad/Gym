import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import TabScreenLayout from '../layouts/TabScreenLayout';
import { API_BASE_URL } from '../services/apiClient';

function initialsOf(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'GY';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [autoShareWithTrainer, setAutoShareWithTrainer] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const infoRows = [
    { icon: 'at-outline', label: 'Tên đăng nhập', value: user?.username ?? '—' },
    { icon: 'mail-outline', label: 'Email', value: user?.email ?? '—' },
    { icon: 'shield-checkmark-outline', label: 'Vai trò', value: (user?.roles ?? []).join(', ') || '—' },
    { icon: 'business-outline', label: 'Chi nhánh', value: user?.defaultBranchName ?? 'Chưa gán' },
    { icon: 'pulse-outline', label: 'Trạng thái', value: user?.status ?? 'ACTIVE' },
  ];

  const preferences = [
    { key: 'reminder', icon: 'notifications-outline', label: 'Nhắc nhở tập luyện', value: workoutReminder, onChange: setWorkoutReminder },
    { key: 'share', icon: 'share-social-outline', label: 'Tự chia sẻ với HLV', value: autoShareWithTrainer, onChange: setAutoShareWithTrainer },
    { key: 'demo', icon: 'key-outline', label: 'Hiện tài khoản demo', value: showDemoAccounts, onChange: setShowDemoAccounts },
  ];

  return (
    <TabScreenLayout testID="settings-screen" style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card tone="accent" style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialsOf(user?.fullName)}</Text>
          </View>
          <View style={styles.profileText}>
            <Text numberOfLines={1} style={styles.profileName}>
              {user?.fullName ?? 'Người dùng GYM'}
            </Text>
            <Text style={styles.profileMeta}>@{user?.username ?? 'gym'}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>THÔNG TIN TÀI KHOẢN</Text>

          {infoRows.map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <Ionicons name={row.icon} size={16} color={colors.accent} />
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text numberOfLines={1} style={styles.infoValue}>
                {row.value}
              </Text>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>TUỲ CHỌN</Text>

          {preferences.map((item) => (
            <View key={item.key} style={styles.prefRow}>
              <Ionicons name={item.icon} size={16} color={colors.muted} />
              <Text style={styles.prefLabel}>{item.label}</Text>
              <Switch
                accessibilityLabel={item.label}
                onValueChange={item.onChange}
                thumbColor={item.value ? colors.background : '#8A939E'}
                trackColor={{ false: colors.inputBorder, true: colors.accent }}
                value={item.value}
              />
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>ỨNG DỤNG</Text>

          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
            <Text style={styles.infoLabel}>Phiên bản</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="server-outline" size={16} color={colors.accent} />
            <Text style={styles.infoLabel}>Máy chủ API</Text>
            <Text numberOfLines={1} style={styles.infoValue}>
              {API_BASE_URL}
            </Text>
          </View>
        </Card>

        <Pressable
          testID="settings-logout"
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất khỏi hệ thống"
          onPress={signOut}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutLabel}>ĐĂNG XUẤT</Text>
        </Pressable>

        <Text style={styles.footer}>GYM SYSTEM · QUẢN LÝ PHÒNG GYM</Text>
      </ScrollView>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: spacing.page,
  },
  content: {
    paddingBottom: 24,
    paddingTop: 12,
  },
  profileCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '900',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  profileMeta: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  card: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  infoRow: {
    alignItems: 'center',
    borderTopColor: '#232A34',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  infoValue: {
    color: colors.text,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  prefRow: {
    alignItems: 'center',
    borderTopColor: '#232A34',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  prefLabel: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.78,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(255, 91, 91, 0.42)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutLabel: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  footer: {
    color: colors.dim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.6,
    paddingTop: 18,
    textAlign: 'center',
  },
});

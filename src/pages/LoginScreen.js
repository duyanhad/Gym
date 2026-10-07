import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import GymLogo from '../components/GymLogo';
import { colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../layouts/AppLayout';
import { API_BASE_URL } from '../services/apiClient';

const DEMO_ACCOUNTS = [
  { label: 'Admin', username: 'admin', password: 'Admin@123', icon: 'shield-checkmark-outline' },
  { label: 'Quản lý', username: 'manager', password: 'Manager@123', icon: 'briefcase-outline' },
  { label: 'Lễ tân', username: 'reception', password: 'Reception@123', icon: 'headset-outline' },
  { label: 'PT', username: 'pt01', password: 'Trainer@123', icon: 'barbell-outline' },
];

export default function LoginScreen() {
  const { signIn, isSigningIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const fillDemoAccount = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
  };

  const handleSubmit = async () => {
    if (isSigningIn) return;

    if (!username.trim() || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    setError('');

    try {
      await signIn({ username, password });
    } catch (requestError) {
      setError(requestError.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  /** Khung bao input: viền + quầng accent khi đang nhập, viền đỏ khi có lỗi. */
  const fieldStyle = (field) => [
    styles.field,
    focusedField === field && styles.fieldFocused,
    error && styles.fieldHasError,
  ];

  const iconColor = (field) => (focusedField === field ? colors.accent : '#6C7683');

  return (
    <AppLayout style={styles.page}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <View style={styles.logoHalo} />
            <View style={styles.logoBadge}>
              <GymLogo size={74} />
            </View>
            <Text style={styles.brandName}>
              GYM<Text style={styles.brandAccent}>.</Text>
            </Text>
            <Text style={styles.brandTagline}>HỆ THỐNG QUẢN LÝ PHÒNG GYM</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardAccent} />

            <Text style={styles.eyebrow}>ĐĂNG NHẬP</Text>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Đăng nhập để quản lý hội viên, gói tập và doanh thu.</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, focusedField === 'username' && styles.labelFocused]}>
                Tên đăng nhập
              </Text>
              <View style={fieldStyle('username')}>
                <Ionicons name="person-outline" size={18} color={iconColor('username')} />
                <TextInput
                  testID="login-username"
                  accessibilityLabel="Tên đăng nhập"
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect={false}
                  editable={!isSigningIn}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(value) => {
                    setUsername(value);
                    if (error) setError('');
                  }}
                  onFocus={() => setFocusedField('username')}
                  onSubmitEditing={handleSubmit}
                  placeholder="Nhập tên đăng nhập"
                  placeholderTextColor="#5C6672"
                  returnKeyType="next"
                  style={styles.input}
                  value={username}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, focusedField === 'password' && styles.labelFocused]}>
                Mật khẩu
              </Text>
              <View style={fieldStyle('password')}>
                <Ionicons name="lock-closed-outline" size={18} color={iconColor('password')} />
                <TextInput
                  testID="login-password"
                  accessibilityLabel="Mật khẩu"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  editable={!isSigningIn}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (error) setError('');
                  }}
                  onFocus={() => setFocusedField('password')}
                  onSubmitEditing={handleSubmit}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#5C6672"
                  returnKeyType="go"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  hitSlop={8}
                  onPress={() => setShowPassword((visible) => !visible)}
                  style={({ pressed }) => [
                    styles.passwordToggle,
                    showPassword && styles.passwordToggleActive,
                    pressed && styles.passwordTogglePressed,
                  ]}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={showPassword ? colors.accent : '#8A939E'}
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <View testID="login-error" style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color="#FF8F8F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              testID="login-submit"
              accessibilityRole="button"
              accessibilityLabel="Đăng nhập"
              disabled={isSigningIn}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submit,
                (pressed || isSigningIn) && styles.submitPressed,
              ]}
            >
              {isSigningIn ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <>
                  <Text style={styles.submitLabel}>ĐĂNG NHẬP</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.background} />
                </>
              )}
            </Pressable>

            <View style={styles.demoBlock}>
              <Text style={styles.demoLabel}>TÀI KHOẢN DEMO (chạm để điền)</Text>
              <View style={styles.demoRow}>
                {DEMO_ACCOUNTS.map((account) => (
                  <Pressable
                    key={account.username}
                    accessibilityRole="button"
                    accessibilityLabel={`Điền tài khoản ${account.label}`}
                    onPress={() => fillDemoAccount(account)}
                    style={({ pressed }) => [styles.demoChip, pressed && styles.demoChipPressed]}
                  >
                    <Ionicons name={account.icon} size={14} color={colors.accent} />
                    <Text style={styles.demoChipText}>{account.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.footer}>KIÊN TRÌ TẠO NÊN KHÁC BIỆT</Text>
          <Text testID="login-api-hint" style={styles.apiHint}>
            API: {API_BASE_URL}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 24,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingVertical: 28,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 26,
    marginTop: 'auto',
  },
  logoHalo: {
    backgroundColor: 'rgba(198, 241, 53, 0.10)',
    borderRadius: 999,
    height: 148,
    position: 'absolute',
    top: -20,
    width: 148,
  },
  logoBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: '#2C3441',
    borderRadius: 26,
    borderWidth: 1,
    boxShadow: '0 12px 34px rgba(0, 0, 0, 0.45)',
    height: 104,
    justifyContent: 'center',
    width: 104,
  },
  brandName: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: 18,
  },
  brandAccent: {
    color: colors.accent,
  },
  brandTagline: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.4,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: '#282F39',
    borderRadius: 24,
    borderWidth: 1,
    boxShadow: '0 18px 46px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    padding: 22,
    paddingTop: 28,
  },
  cardAccent: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 3,
    left: 22,
    position: 'absolute',
    top: 0,
    width: 52,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 10,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  fieldGroup: {
    marginTop: 20,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  labelFocused: {
    color: colors.accent,
  },
  field: {
    alignItems: 'center',
    backgroundColor: '#12161D',
    borderColor: '#2C3441',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  fieldFocused: {
    backgroundColor: '#141A22',
    borderColor: colors.accent,
    boxShadow: '0 0 0 4px rgba(198, 241, 53, 0.12)',
  },
  fieldHasError: {
    borderColor: 'rgba(255, 91, 91, 0.55)',
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    outlineStyle: 'none',
    paddingVertical: 14,
  },
  passwordToggle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  passwordToggleActive: {
    backgroundColor: 'rgba(198, 241, 53, 0.14)',
  },
  passwordTogglePressed: {
    opacity: 0.7,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 91, 91, 0.12)',
    borderColor: 'rgba(255, 91, 91, 0.45)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: '#FF8F8F',
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
    boxShadow: '0 10px 24px rgba(198, 241, 53, 0.22)',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 56,
  },
  submitPressed: {
    opacity: 0.8,
  },
  submitLabel: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  demoBlock: {
    borderTopColor: '#2A313C',
    borderTopWidth: 1,
    marginTop: 24,
    paddingTop: 18,
  },
  demoLabel: {
    color: '#67717D',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  demoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  demoChip: {
    alignItems: 'center',
    backgroundColor: '#12161D',
    borderColor: '#2C3441',
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '48%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  demoChipPressed: {
    borderColor: colors.accent,
  },
  demoChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    color: '#67717D',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 'auto',
    paddingTop: 22,
    textAlign: 'center',
  },
  apiHint: {
    color: '#4E5761',
    fontSize: 9,
    letterSpacing: 0.6,
    marginTop: 8,
    textAlign: 'center',
  },
});

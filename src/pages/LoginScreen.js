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

const DEMO_ACCOUNTS = [
  { label: 'Admin', username: 'admin', password: 'Admin@123' },
  { label: 'Quản lý', username: 'manager', password: 'Manager@123' },
  { label: 'Lễ tân', username: 'reception', password: 'Reception@123' },
  { label: 'PT', username: 'pt01', password: 'Trainer@123' },
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

  const inputStyle = (field) => [styles.input, focusedField === field && styles.inputFocused];

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
            <View style={styles.logoBadge}>
              <GymLogo size={78} />
            </View>
            <Text style={styles.brandName}>
              GYM<Text style={styles.brandAccent}>.</Text>
            </Text>
            <Text style={styles.brandTagline}>HỆ THỐNG QUẢN LÝ PHÒNG GYM</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.eyebrow}>ĐĂNG NHẬP</Text>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Đăng nhập để quản lý hội viên, gói tập và doanh thu.</Text>

            <Text style={styles.label}>Tên đăng nhập</Text>
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
              placeholder="admin"
              placeholderTextColor="#5C6672"
              returnKeyType="next"
              style={inputStyle('username')}
              value={username}
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordRow}>
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
                placeholder="••••••••"
                placeholderTextColor="#5C6672"
                returnKeyType="go"
                secureTextEntry={!showPassword}
                style={[inputStyle('password'), styles.passwordInput]}
                value={password}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onPress={() => setShowPassword((visible) => !visible)}
                style={styles.passwordToggle}
              >
                <Text style={styles.passwordToggleText}>{showPassword ? 'ẨN' : 'HIỆN'}</Text>
              </Pressable>
            </View>

            {error ? (
              <View testID="login-error" style={styles.errorBox}>
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
                <Text style={styles.submitLabel}>ĐĂNG NHẬP</Text>
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
                    <Text style={styles.demoChipText}>{account.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.footer}>KIÊN TRÌ TẠO NÊN KHÁC BIỆT</Text>
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
    marginBottom: 28,
    marginTop: 'auto',
  },
  logoBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: '#282F39',
    borderRadius: 26,
    borderWidth: 1,
    height: 108,
    justifyContent: 'center',
    width: 108,
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
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
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
    marginBottom: 22,
    marginTop: 8,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#12161D',
    borderColor: '#2C3441',
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 74,
  },
  passwordToggle: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  passwordToggleText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 91, 91, 0.12)',
    borderColor: 'rgba(255, 91, 91, 0.45)',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: '#FF8F8F',
    fontSize: 13,
    lineHeight: 19,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 22,
    minHeight: 52,
  },
  submitPressed: {
    opacity: 0.75,
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
    marginTop: 22,
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
    backgroundColor: '#12161D',
    borderColor: '#2C3441',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
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
});

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { setAccessToken } from '../services/apiClient';
import { login as loginRequest } from '../services/authService';

const AuthContext = createContext(null);

/**
 * Quản lý phiên đăng nhập trong bộ nhớ ứng dụng.
 * Muốn giữ đăng nhập sau khi tắt app: cài `@react-native-async-storage/async-storage`
 * rồi lưu/đọc token trong `signIn` và lúc khởi tạo state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = useCallback(async ({ username, password }) => {
    setIsSigningIn(true);

    try {
      const session = await loginRequest({ username, password });

      setAccessToken(session.token);
      setToken(session.token);
      setUser(session.user);

      return session.user;
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setAccessToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token), isSigningIn, signIn, signOut }),
    [user, token, isSigningIn, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error('useAuth phải được dùng bên trong <AuthProvider>.');

  return context;
}

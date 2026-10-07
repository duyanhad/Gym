import { apiRequest } from './apiClient';

/** Đăng nhập - trả về { token, expiresAt, user }. */
export function login({ username, password }) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: { username: username.trim(), password },
  });
}

/** Lấy thông tin tài khoản đang đăng nhập (kèm role & permission). */
export function getCurrentUser() {
  return apiRequest('/api/account/me');
}

/** Đổi mật khẩu của tài khoản đang đăng nhập. */
export function changePassword({ currentPassword, newPassword, confirmPassword }) {
  return apiRequest('/api/account/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword, confirmPassword },
  });
}

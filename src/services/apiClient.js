import { Platform } from 'react-native';

/**
 * Địa chỉ backend GYM System.
 * - Android emulator: 10.0.2.2 trỏ vào localhost của máy host.
 * - iOS simulator / web: localhost.
 * - Thiết bị thật: đổi thành IP LAN của máy chạy backend (vd http://192.168.1.10:5100).
 */
const DEFAULT_HOST = Platform.select({
  android: 'http://10.0.2.2:5100',
  default: 'http://localhost:5100',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_HOST;

/** Lỗi trả về từ API (đã bóc tách message/errors để hiển thị thẳng lên UI). */
export class ApiError extends Error {
  constructor(message, { status = 0, errors = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token ?? null;
}

export function getAccessToken() {
  return accessToken;
}

/**
 * Gọi API theo format thống nhất của backend: { success, message, data, errors }.
 * Trả về `data` khi thành công, ném ApiError khi thất bại.
 */
export async function apiRequest(path, { method = 'GET', body, auth = true, signal } = {}) {
  const headers = { Accept: 'application/json' };

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      `Không kết nối được máy chủ API (${API_BASE_URL}). Hãy chắc chắn backend GYM System đang chạy.`,
    );
  }

  const raw = await response.text();
  let payload = null;

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
  }

  if (!response.ok || payload?.success === false) {
    const message =
      payload?.message ??
      (response.status === 401
        ? 'Tên đăng nhập hoặc mật khẩu không đúng.'
        : 'Có lỗi xảy ra, vui lòng thử lại.');

    throw new ApiError(message, { status: response.status, errors: payload?.errors ?? [] });
  }

  return payload?.data ?? payload;
}

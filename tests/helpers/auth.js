const { mockWorkoutApi } = require('./workoutApi');

const API_LOGIN = '**/api/auth/login';

const demoUser = {
  userId: '11111111-1111-1111-1111-111111111111',
  username: 'admin',
  fullName: 'Quản trị hệ thống',
  email: 'admin@gymsystem.local',
  status: 'ACTIVE',
  isActive: true,
  roles: ['Admin'],
  permissions: ['MEMBER_VIEW', 'DASHBOARD_VIEW', 'WORKOUT_VIEW', 'WORKOUT_MANAGE', 'WORKOUT_SHARE'],
};

/** Giả lập backend trả về đăng nhập thành công. */
async function mockLoginSuccess(page, user = demoUser) {
  await page.route(API_LOGIN, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: null,
        data: {
          token: 'test-token',
          expiresAt: new Date(Date.now() + 3600_000).toISOString(),
          user,
        },
        errors: [],
      }),
    }),
  );
}

/** Giả lập backend từ chối đăng nhập. */
async function mockLoginFailure(page, message = 'Tên đăng nhập hoặc mật khẩu không đúng.', status = 400) {
  await page.route(API_LOGIN, (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, message, data: null, errors: [message] }),
    }),
  );
}

/** Điền form và bấm đăng nhập. */
async function submitLogin(page, { username = 'admin', password = 'Admin@123' } = {}) {
  await page.getByTestId('login-username').fill(username);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
}

/**
 * Vào app với backend đã được giả lập thành công.
 * API tập luyện cũng được giả lập; đăng ký trước route login để route login được ưu tiên.
 */
async function loginAs(page, user = demoUser, workoutOptions) {
  await mockWorkoutApi(page, workoutOptions);
  await mockLoginSuccess(page, user);
  await page.goto('/');
  await submitLogin(page, { username: user.username, password: 'Admin@123' });
  await page.getByTestId('dashboard-screen').waitFor();
}

module.exports = {
  API_LOGIN,
  demoUser,
  loginAs,
  mockLoginFailure,
  mockLoginSuccess,
  submitLogin,
};

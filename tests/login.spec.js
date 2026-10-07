const { expect, test } = require('@playwright/test');

const { mockLoginFailure, mockLoginSuccess, submitLogin } = require('./helpers/auth');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('hiển thị trang đăng nhập với logo và form', async ({ page }) => {
  await expect(page.getByText('HỆ THỐNG QUẢN LÝ PHÒNG GYM')).toBeVisible();
  await expect(page.getByText('Chào mừng trở lại')).toBeVisible();
  await expect(page.getByTestId('login-username')).toBeVisible();
  await expect(page.getByTestId('login-password')).toBeVisible();
  await expect(page.getByTestId('login-submit')).toBeVisible();
});

test('báo lỗi khi bỏ trống tên đăng nhập và mật khẩu', async ({ page }) => {
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('login-error')).toContainText('Vui lòng nhập tên đăng nhập và mật khẩu.');
});

test('báo lỗi khi sai tài khoản', async ({ page }) => {
  await mockLoginFailure(page, 'Tên đăng nhập hoặc mật khẩu không đúng.');

  await submitLogin(page, { username: 'admin', password: 'sai-mat-khau' });

  await expect(page.getByTestId('login-error')).toContainText('Tên đăng nhập hoặc mật khẩu không đúng.');
});

test('điền nhanh tài khoản demo', async ({ page }) => {
  await page.getByRole('button', { name: 'Điền tài khoản Lễ tân' }).click();

  await expect(page.getByTestId('login-username')).toHaveValue('reception');
  await expect(page.getByTestId('login-password')).toHaveValue('Reception@123');
});

test('đăng nhập thành công thì vào trang chủ và đăng xuất được', async ({ page }) => {
  await mockLoginSuccess(page);

  await submitLogin(page);
  await expect(page.getByText('KẾ HOẠCH CỦA BẠN')).toBeVisible();
  await expect(page.getByText('QUẢN TRỊ HỆ THỐNG')).toBeVisible();

  await page.getByTestId('logout-button').click();
  await expect(page.getByTestId('login-submit')).toBeVisible();
});

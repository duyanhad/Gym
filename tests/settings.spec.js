const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

test.beforeEach(async ({ page }) => {
  await loginAs(page);
});

test('xem thông tin tài khoản và đăng xuất từ Cài đặt', async ({ page }) => {
  await page.getByTestId('bottom-tab-Settings').click();

  const settings = page.getByTestId('settings-screen');
  await expect(settings).toBeVisible();
  await expect(settings.getByText('THÔNG TIN TÀI KHOẢN')).toBeVisible();
  await expect(settings.getByText('Quản trị hệ thống')).toBeVisible();

  await page.getByTestId('settings-logout').click();
  await expect(page.getByTestId('login-submit')).toBeVisible();
});

test('logo trên header quay về trang tổng quan', async ({ page }) => {
  await page.getByTestId('bottom-tab-Settings').click();
  await expect(page.getByTestId('settings-screen')).toBeVisible();

  await page.getByTestId('header-brand').click();

  await expect(page.getByTestId('dashboard-screen').first()).toBeVisible();
});

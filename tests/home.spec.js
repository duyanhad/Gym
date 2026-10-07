const { expect, test } = require('@playwright/test');

const { mockLoginSuccess, submitLogin } = require('./helpers/auth');

test.beforeEach(async ({ page }) => {
  await mockLoginSuccess(page);
  await page.goto('/');
  await submitLogin(page);
});

test('shows the home screen and opens today\'s workout', async ({ page }) => {
  await expect(page.getByText('KẾ HOẠCH CỦA BẠN')).toBeVisible();
  await page.getByRole('button', { name: 'Bắt đầu tập' }).click();

  await expect(page.getByText('BUỔI TẬP 01')).toBeVisible();
  await expect(page.getByText('Squat')).toBeVisible();
});

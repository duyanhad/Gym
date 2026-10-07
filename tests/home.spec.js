const { expect, test } = require('@playwright/test');

test('shows the home screen and opens today\'s workout', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('KẾ HOẠCH CỦA BẠN')).toBeVisible();
  await page.getByRole('button', { name: 'Bắt đầu tập' }).click();

  await expect(page.getByText('BUỔI TẬP 01')).toBeVisible();
  await expect(page.getByText('Squat')).toBeVisible();
});

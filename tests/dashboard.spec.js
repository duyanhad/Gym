const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

test.beforeEach(async ({ page }) => {
  await loginAs(page);
});

test('hiển thị dashboard với thống kê và 5 mục điều hướng', async ({ page }) => {
  const dashboard = page.getByTestId('dashboard-screen');

  await expect(dashboard).toBeVisible();
  await expect(dashboard.getByText('XIN CHÀO,')).toBeVisible();

  await expect(page.getByTestId('stat-streak')).toBeVisible();
  await expect(page.getByTestId('stat-month')).toBeVisible();
  await expect(page.getByTestId('stat-exercises')).toBeVisible();
  await expect(page.getByTestId('stat-connections')).toBeVisible();

  for (const tab of ['Schedule', 'Exercises', 'AddExercise', 'Share', 'Settings']) {
    await expect(page.getByTestId(`bottom-tab-${tab}`)).toBeVisible();
  }
});

test('đánh dấu và bỏ đánh dấu buổi tập hôm nay', async ({ page }) => {
  const markButton = page.getByTestId('dashboard-mark-today');

  await markButton.click();
  await expect(page.getByText('Bạn đã hoàn thành buổi tập 💪')).toBeVisible();

  await markButton.click();
  await expect(page.getByText('Sẵn sàng cho buổi tập hôm nay?')).toBeVisible();
});

const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

test.beforeEach(async ({ page }) => {
  await loginAs(page);
});

test('núm giữa mở ra các nút tròn xung quanh', async ({ page }) => {
  await expect(page.getByTestId('quick-action-session')).toHaveCount(0);

  await page.getByTestId('quick-action-fab').click();

  await expect(page.getByTestId('quick-action-session')).toBeVisible();
  await expect(page.getByTestId('quick-action-add')).toBeVisible();
  await expect(page.getByTestId('quick-action-share')).toBeVisible();
  await expect(page.getByTestId('quick-action-schedule')).toBeVisible();

  // Chạm ra vùng tối bên ngoài để đóng
  await page.mouse.click(20, 60);
  await expect(page.getByTestId('quick-action-session')).toHaveCount(0);
});

test('thao tác nhanh mở được màn tương ứng', async ({ page }) => {
  await page.getByTestId('quick-action-fab').click();
  await page.getByTestId('quick-action-add').click();
  await expect(page.getByTestId('add-exercise-screen')).toBeVisible();

  await page.getByTestId('quick-action-fab').click();
  await page.getByTestId('quick-action-share').click();
  await expect(page.getByTestId('share-screen')).toBeVisible();

  await page.getByTestId('quick-action-fab').click();
  await page.getByTestId('quick-action-schedule').click();
  await expect(page.getByTestId('weekly-plan-screen')).toBeVisible();
});

test('bắt đầu buổi tập từ núm giữa: đồng hồ chạy và kết thúc được', async ({ page }) => {
  await page.getByTestId('quick-action-fab').click();
  await page.getByTestId('quick-action-session').click();

  await expect(page.getByTestId('session-screen')).toBeVisible();
  await expect(page.getByTestId('session-status')).toHaveText('ĐANG TẬP');

  const first = await page.getByTestId('session-timer').textContent();
  await page.waitForTimeout(2200);
  const second = await page.getByTestId('session-timer').textContent();

  expect(second).not.toBe(first);

  await page.getByTestId('session-finish').click();
  await expect(page.getByTestId('session-status')).toHaveText('ĐÃ KẾT THÚC');

  await page.getByTestId('session-back-to-schedule').click();
  await expect(page.getByTestId('schedule-screen')).toBeVisible();
});

test('thanh "Buổi tập hôm nay" ở các màn hình chính bắt đầu được buổi tập', async ({ page }) => {
  await page.getByTestId('bottom-tab-Exercises').click();

  const barOnExercises = page.getByTestId('exercises-screen-session-bar');
  await expect(barOnExercises).toContainText('Chưa bắt đầu');

  await barOnExercises.click();

  await expect(page.getByTestId('session-screen')).toBeVisible();
  await expect(page.getByTestId('session-status')).toHaveText('ĐANG TẬP');

  await page.getByTestId('session-back-to-schedule').click();
  await expect(page.getByTestId('schedule-screen')).toBeVisible();
  await expect(page.getByTestId('schedule-screen-session-bar')).toContainText('Đang tập');
});

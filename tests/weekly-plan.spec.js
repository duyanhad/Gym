const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

function todayWeekday() {
  return new Date().getDay();
}

test.beforeEach(async ({ page }) => {
  await loginAs(page);

  await page.getByTestId('quick-action-fab').click();
  await page.getByTestId('quick-action-schedule').click();
  await expect(page.getByTestId('weekly-plan-screen')).toBeVisible();
});

test('gán giáo án cho một thứ trong tuần', async ({ page }) => {
  const weekday = todayWeekday();
  const row = page.getByTestId(`weekday-row-${weekday}`);

  await expect(row).not.toContainText('Push');

  await page.getByTestId(`weekday-pick-${weekday}`).click();
  await page.getByTestId(`weekday-option-${weekday}-plan-2`).click();

  await expect(row).toContainText('Pull');
  await expect(page.getByTestId('weekly-scheduled')).toContainText('1/7');
});

test('bỏ buổi tập của một thứ (chọn Nghỉ)', async ({ page }) => {
  const weekday = todayWeekday();
  const row = page.getByTestId(`weekday-row-${weekday}`);

  await page.getByTestId(`weekday-pick-${weekday}`).click();
  await page.getByTestId(`weekday-option-${weekday}-plan-1`).click();
  await expect(row).toContainText('Push');

  await page.getByTestId(`weekday-pick-${weekday}`).click();
  await page.getByTestId(`weekday-option-${weekday}-none`).click();
  await expect(row).not.toContainText('Push');
});

test('tạo giáo án mới từ danh sách bài tập có sẵn', async ({ page }) => {
  await page.getByTestId('plan-save').click();
  await expect(page.getByTestId('plan-error')).toBeVisible();

  await page.getByTestId('plan-name').fill('Buổi Upper Body');
  await page.getByTestId('plan-focus').fill('Ngực · Lưng');
  await page.getByTestId('plan-save').click();
  await expect(page.getByTestId('plan-error')).toBeVisible();

  await page.getByTestId('plan-pick-ex-1').click();
  await page.getByTestId('plan-sets-ex-1').fill('5');
  await page.getByTestId('plan-reps-ex-1').fill('8');
  await page.getByTestId('plan-pick-ex-3').click();
  await page.getByTestId('plan-save').click();

  await expect(page.getByTestId('plan-saved')).toContainText('Buổi Upper Body');

  const newPlan = page.locator('[data-testid^="plan-plan-new"]').first();

  await expect(newPlan).toContainText('Buổi Upper Body');
  await expect(newPlan).toContainText('5 × 8');
  await expect(newPlan).toContainText('3km');
});

test('giáo án hệ thống thì không có nút xoá', async ({ page }) => {
  await expect(page.locator('[data-testid="plan-delete-plan-1"]')).toHaveCount(0);
  await expect(page.getByTestId('plan-plan-1')).toBeVisible();
});

test('nút về trang chủ trong màn thiết lập lịch', async ({ page }) => {
  await page.getByTestId('weekly-home').click();

  await expect(page.getByTestId('dashboard-screen').first()).toBeVisible();
});

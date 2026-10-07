const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

function todayWeekday() {
  return new Date().getDay();
}

test.beforeEach(async ({ page }) => {
  await loginAs(page);
  await page.getByTestId('bottom-tab-Schedule').click();
  await page.getByTestId('schedule-open-weekly').click();
  await expect(page.getByTestId('weekly-plan-screen')).toBeVisible();
});

test('gán buổi tập cho một thứ trong tuần', async ({ page }) => {
  const weekday = todayWeekday();

  await expect(page.getByTestId(`weekday-row-${weekday}`)).toContainText('Nghỉ / chưa xếp buổi tập');

  await page.getByTestId(`weekday-pick-${weekday}`).click();
  await page.getByTestId(`weekday-option-${weekday}-tpl-pull`).click();

  await expect(page.getByTestId(`weekday-row-${weekday}`)).toContainText('Buổi Pull');
});

test('bỏ buổi tập của một thứ (chọn Nghỉ)', async ({ page }) => {
  const weekday = todayWeekday();

  await page.getByTestId(`weekday-pick-${weekday}`).click();
  await page.getByTestId(`weekday-option-${weekday}-tpl-push`).click();
  await expect(page.getByTestId(`weekday-row-${weekday}`)).toContainText('Buổi Push');

  await page.getByTestId(`weekday-pick-${weekday}`).click();
  await page.getByTestId(`weekday-option-${weekday}-none`).click();
  await expect(page.getByTestId(`weekday-row-${weekday}`)).toContainText('Nghỉ');
});

test('tạo buổi tập mới từ danh sách bài tập có sẵn', async ({ page }) => {
  await page.getByTestId('plan-save').click();
  await expect(page.getByTestId('plan-error')).toContainText('Vui lòng nhập tên buổi tập.');

  await page.getByTestId('plan-name').fill('Buổi Upper Body');
  await page.getByTestId('plan-focus').fill('Ngực · Lưng');
  await page.getByTestId('plan-save').click();
  await expect(page.getByTestId('plan-error')).toContainText('Chọn ít nhất 1 bài tập');

  await page.getByTestId('plan-pick-ex-1').click();
  await page.getByTestId('plan-sets-ex-1').fill('5');
  await page.getByTestId('plan-reps-ex-1').fill('8');
  await page.getByTestId('plan-pick-ex-4').click();
  await page.getByTestId('plan-save').click();

  await expect(page.getByTestId('plan-saved')).toContainText('Buổi Upper Body');

  const newPlan = page.locator('[data-testid^="plan-plan-"]').first();
  await expect(newPlan).toContainText('Buổi Upper Body');
  await expect(newPlan).toContainText('5 × 8');
  await expect(newPlan).toContainText('Kéo xà');
});

test('nút về trang chủ trong màn thiết lập lịch', async ({ page }) => {
  await page.getByTestId('weekly-home').click();

  await expect(page.getByTestId('dashboard-screen').first()).toBeVisible();
});

const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

/** Khoá ngày hôm nay theo định dạng YYYY-MM-DD. */
function todayKey() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

test.beforeEach(async ({ page }) => {
  await loginAs(page);
  await page.getByTestId('bottom-tab-Schedule').click();
  await expect(page.getByTestId('schedule-screen')).toBeVisible();
});

test('xem lịch theo tháng và chuyển tháng', async ({ page }) => {
  const monthTitle = page.getByTestId('schedule-month');

  await expect(monthTitle).toContainText('Tháng');
  const firstMonth = await monthTitle.textContent();

  await page.getByTestId('schedule-next').click();
  await expect(monthTitle).not.toHaveText(firstMonth);
});

test('chạm một ngày để xem thông tin ngày đó', async ({ page }) => {
  const key = todayKey();
  const expected = `${key.slice(8, 10)}/${key.slice(5, 7)}/${key.slice(0, 4)}`;

  await page.getByTestId(`schedule-day-${key}`).click();

  await expect(page.getByTestId('schedule-selected')).toContainText(expected);
});

test('thống kê cho biết số buổi mỗi tuần theo lịch', async ({ page }) => {
  const weekly = Number(await page.getByTestId('schedule-weekly-count').textContent());
  const total = Number(await page.getByTestId('schedule-total').textContent());

  expect(weekly).toBeGreaterThan(0);
  expect(total).toBeGreaterThanOrEqual(weekly);
});

test('nút về trang chủ quay lại dashboard', async ({ page }) => {
  await page.getByTestId('schedule-home').click();

  await expect(page.getByTestId('dashboard-screen').first()).toBeVisible();
});

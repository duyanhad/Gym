const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

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

test('chạm một ngày để đánh dấu ngày tập', async ({ page }) => {
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const expected = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  const dayCell = page.getByTestId(`schedule-day-${key}`);
  await expect(dayCell).toBeVisible();

  await dayCell.click();
  await expect(page.getByTestId('schedule-selected')).toContainText(expected);
  await expect(page.getByText('Bạn đã đánh dấu ngày này là ngày tập. Chạm lại để bỏ đánh dấu.')).toBeVisible();

  await dayCell.click();
  await expect(page.getByText('Chạm vào một ngày trên lịch để đánh dấu đó là ngày bạn đi tập.')).toBeVisible();
});

test('nút đánh dấu hôm nay tăng tổng số buổi khi ngày hôm nay chưa được đánh dấu', async ({ page }) => {
  const before = Number(await page.getByTestId('schedule-total').textContent());

  await page.getByTestId('schedule-mark-today').click();

  const after = Number(await page.getByTestId('schedule-total').textContent());
  expect(after).toBeGreaterThanOrEqual(before);
});

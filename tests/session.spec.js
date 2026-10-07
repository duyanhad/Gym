const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

function todayKey() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function todayWeekday() {
  return new Date().getDay();
}

async function openTodaySession(page) {
  await page.getByTestId('bottom-tab-Schedule').click();
  await page.getByTestId(`schedule-day-${todayKey()}`).click();
  await page.getByTestId('schedule-open-session').click();
  await expect(page.getByTestId('session-screen')).toBeVisible();
}

/** Gán buổi tập cho hôm nay qua màn Thiết lập lịch tuần. */
async function assignPlanToToday(page, planId) {
  await page.getByTestId('bottom-tab-Schedule').click();
  await page.getByTestId('schedule-open-weekly').click();
  await expect(page.getByTestId('weekly-plan-screen')).toBeVisible();

  await page.getByTestId(`weekday-pick-${todayWeekday()}`).click();
  await page.getByTestId(`weekday-option-${todayWeekday()}-${planId}`).click();

  await expect(page.getByTestId(`weekday-row-${todayWeekday()}`)).toContainText('Buổi');

  // Quay lại tab Lịch để tiếp tục kiểm tra chi tiết buổi tập
  await page.getByTestId('weekly-open-calendar').click();
  await expect(page.getByTestId('schedule-screen')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await loginAs(page);
});

test('ngày chưa xếp buổi tập thì hiện thông báo và nút thiết lập lịch', async ({ page }) => {
  await openTodaySession(page);

  await expect(page.getByTestId('session-empty')).toBeVisible();
  await expect(page.getByTestId('session-setup-week')).toBeVisible();

  await page.getByTestId('session-home').click();
  await expect(page.getByTestId('dashboard-screen').first()).toBeVisible();
});

test('xem chi tiết buổi tập: mục tiêu, trạng thái đạt và % hoàn thành', async ({ page }) => {
  await assignPlanToToday(page, 'tpl-push');

  await openTodaySession(page);

  await expect(page.getByTestId('session-progress')).toContainText('0/3 bài');
  await expect(page.getByTestId('session-item-Bench Press')).toContainText('4 hiệp × 10 lần');
  await expect(page.getByTestId('session-item-Bench Press')).toContainText('Chưa đạt');
  await expect(page.getByText('CHƯA ĐỦ YÊU CẦU')).toBeVisible();

  await page.getByTestId('session-toggle-Bench Press').click();
  await expect(page.getByTestId('session-progress')).toContainText('1/3 bài');
  await expect(page.getByTestId('session-item-Bench Press')).toContainText('Đạt');

  await page.getByTestId('session-complete-all').click();
  await expect(page.getByTestId('session-progress')).toContainText('3/3 bài · 100%');
  await expect(page.getByText('ĐẠT YÊU CẦU')).toBeVisible();

  await page.getByTestId('session-reset').click();
  await expect(page.getByTestId('session-progress')).toContainText('0/3 bài');
});

test('hoàn thành bài tập thì ngày đó được đánh dấu là ngày tập', async ({ page }) => {
  await assignPlanToToday(page, 'tpl-legs');
  await openTodaySession(page);

  await page.getByTestId('session-toggle-Squat').click();

  await page.getByTestId('session-back-to-schedule').click();
  await expect(page.getByTestId('schedule-screen')).toBeVisible();
  await expect(page.getByTestId(`schedule-day-${todayKey()}`)).toHaveAttribute('aria-label', /đã tập/);
});

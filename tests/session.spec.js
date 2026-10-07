const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

function todayWeekday() {
  return new Date().getDay();
}

function todayKey() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/** Mở màn buổi tập hôm nay từ núm giữa. */
async function openTodaySession(page) {
  await page.getByTestId('quick-action-fab').click();
  await page.getByTestId('quick-action-session').click();
  await expect(page.getByTestId('session-screen')).toBeVisible();
}

test('chưa tập: màn chuẩn bị cho chọn giáo án, tích bài và sắp thứ tự', async ({ page }) => {
  await loginAs(page);
  await openTodaySession(page);

  await expect(page.getByTestId('setup-plan-plan-1')).toBeVisible();
  await expect(page.getByTestId('setup-pick-ex-1')).toBeVisible();

  // Bắt đầu khi chưa chọn gì thì báo lỗi
  await page.getByTestId('session-start').click();
  await expect(page.getByTestId('session-error')).toBeVisible();

  // Chọn nhanh theo giáo án
  await page.getByTestId('setup-plan-plan-1').click();
  await expect(page.getByTestId('setup-item-0')).toContainText('Bench Press');
  await expect(page.getByTestId('setup-item-1')).toContainText('Squat');

  // Đưa bài thứ 2 lên trước
  await page.getByTestId('setup-up-1').click();
  await expect(page.getByTestId('setup-item-0')).toContainText('Squat');

  // Tích thêm một bài nữa từ thư viện
  await page.getByTestId('setup-pick-ex-3').click();
  await expect(page.getByTestId('setup-item-2')).toContainText('3km');

  await page.getByTestId('session-start').click();

  await expect(page.getByTestId('session-progress')).toContainText(/0\/3/);
  await expect(page.getByTestId('session-exercise-0')).toContainText('Squat');
  await expect(page.getByTestId('session-exercise-1')).toContainText('Bench Press');
  await expect(page.getByTestId('session-exercise-2')).toContainText('3km');
});

test('đồng hồ hiệp tập, thời gian nghỉ do người dùng bấm và tổng cả ngày', async ({ page }) => {
  await loginAs(page);
  await openTodaySession(page);

  await page.getByTestId('setup-plan-plan-1').click();
  await page.getByTestId('session-start').click();

  await expect(page.getByTestId('session-day-total')).toHaveText('00:00');

  // Bắt đầu hiệp 1 -> đồng hồ tập chạy
  await page.getByTestId('session-start-set-0').click();
  await expect(page.getByTestId('session-timer-0')).toBeVisible();

  const firstTick = await page.getByTestId('session-timer-0').textContent();

  await page.waitForTimeout(2500);

  const secondTick = await page.getByTestId('session-timer-0').textContent();

  expect(secondTick).not.toBe(firstTick);
  await expect(page.getByTestId('session-live-total')).toBeVisible();

  // Dừng hiệp -> chuyển sang đồng hồ nghỉ
  await page.getByTestId('session-stop-set-0').click();
  await expect(page.getByTestId('session-rest-timer-0')).toBeVisible();

  await page.waitForTimeout(1200);

  // Lưu hiệp kèm thời gian nghỉ
  await page.getByTestId('session-save-set-0').click();

  await expect(page.getByTestId('session-set-0-1')).toBeVisible();
  await expect(page.getByTestId('session-set-0-1')).toContainText(/00:0/);
  await expect(page.getByTestId('session-set-reps-0-1')).toHaveText(/10/);
  await expect(page.getByTestId('session-start-set-0')).toBeVisible();
  await expect(page.getByTestId('session-day-total')).not.toHaveText('00:00');

  // Hiệp 2: bỏ qua thời gian nghỉ
  await page.getByTestId('session-start-set-0').click();
  await page.waitForTimeout(1200);
  await page.getByTestId('session-stop-set-0').click();
  await page.getByTestId('session-skip-rest-0').click();

  await expect(page.getByTestId('session-set-0-2')).toBeVisible();
});

test('đánh dấu hoàn thành bài tập thì tiến độ tăng', async ({ page }) => {
  await loginAs(page);
  await openTodaySession(page);

  await page.getByTestId('setup-plan-plan-1').click();
  await page.getByTestId('session-start').click();

  await page.getByTestId('session-toggle-completed-0').click();
  await expect(page.getByTestId('session-progress')).toContainText(/1\/2/);
  await expect(page.getByTestId('session-progress')).toContainText('50%');

  await page.getByTestId('session-toggle-completed-0').click();
  await expect(page.getByTestId('session-progress')).toContainText(/0\/2/);
  await expect(page.getByTestId('session-progress')).toContainText('0%');
});

test('đổi thứ tự bài tập ngay trong buổi tập', async ({ page }) => {
  await loginAs(page);
  await openTodaySession(page);

  await page.getByTestId('setup-plan-plan-1').click();
  await page.getByTestId('session-start').click();

  await expect(page.getByTestId('session-exercise-0')).toContainText('Bench Press');

  await page.getByTestId('session-down-0').click();

  await expect(page.getByTestId('session-exercise-0')).toContainText('Squat');
  await expect(page.getByTestId('session-exercise-1')).toContainText('Bench Press');
});

test('kết thúc buổi tập và bắt đầu lại được', async ({ page }) => {
  await loginAs(page);
  await openTodaySession(page);

  await page.getByTestId('setup-plan-plan-1').click();
  await page.getByTestId('session-start').click();

  await page.getByTestId('session-start-set-0').click();
  await page.waitForTimeout(1200);
  await page.getByTestId('session-stop-set-0').click();
  await page.getByTestId('session-save-set-0').click();
  await expect(page.getByTestId('session-set-0-1')).toBeVisible();

  await page.getByTestId('session-finish').click();

  await expect(page.getByTestId('session-completed-banner')).toBeVisible();
  await expect(page.getByTestId('session-restart')).toBeVisible();

  await page.getByTestId('session-restart').click();

  await expect(page.getByTestId('session-progress')).toContainText(/0\/2/);
  await expect(page.getByTestId('session-set-0-1')).toHaveCount(0);
});

test('quay về lịch tập và về trang chủ từ màn buổi tập', async ({ page }) => {
  await loginAs(page);
  await openTodaySession(page);

  await page.getByTestId('session-back-schedule').click();
  await expect(page.getByTestId('schedule-screen')).toBeVisible();

  await page.getByTestId('quick-action-fab').click();
  await page.getByTestId('quick-action-session').click();
  await page.getByTestId('session-back-home').click();

  await expect(page.getByTestId('dashboard-screen').first()).toBeVisible();
});

test('mở lại buổi tập đã có thì thấy đúng dữ liệu đã lưu', async ({ page }) => {
  await loginAs(page, undefined, { weekly: { [todayWeekday()]: 'plan-1' } });
  await openTodaySession(page);

  await page.getByTestId('setup-plan-plan-1').click();
  await page.getByTestId('session-start').click();
  await page.getByTestId('session-toggle-completed-0').click();
  await expect(page.getByTestId('session-progress')).toContainText(/1\/2/);

  await page.getByTestId('session-back-schedule').click();
  await page.getByTestId(`schedule-day-${todayKey()}`).click();
  await page.getByTestId('schedule-open-session').click();

  await expect(page.getByTestId('session-progress')).toContainText(/1\/2/);
});

const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');
const { sessionFixture, todayKey } = require('./helpers/workoutApi');

function todayWeekday() {
  return new Date().getDay();
}

function dateKeyAfter(days) {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

test.beforeEach(async ({ page }) => {
  await loginAs(page, undefined, { weekly: { [todayWeekday()]: 'plan-1' } });
  await page.getByTestId('bottom-tab-Schedule').click();
  await expect(page.getByTestId('schedule-screen')).toBeVisible();
});

test('xem lịch theo tháng và chuyển tháng', async ({ page }) => {
  const monthTitle = page.getByTestId('schedule-month');

  await expect(monthTitle).toContainText('Tháng');
  const firstMonth = await monthTitle.textContent();

  await page.getByTestId('schedule-next').click();
  await expect(monthTitle).not.toHaveText(firstMonth);

  await page.getByTestId('schedule-prev').click();
  await expect(monthTitle).toHaveText(firstMonth);
});

test('chạm một ngày để xem thông tin ngày đó', async ({ page }) => {
  const key = todayKey();
  const expected = `${key.slice(8, 10)}/${key.slice(5, 7)}/${key.slice(0, 4)}`;

  await page.getByTestId(`schedule-day-${key}`).click();

  await expect(page.getByTestId('schedule-selected')).toContainText(expected);
  await expect(page.getByTestId('schedule-selected-plan')).toContainText('Push');
});

test('ngày chưa có buổi tập thì hiện nút bắt đầu buổi tập', async ({ page }) => {
  await page.getByTestId(`schedule-day-${dateKeyAfter(1)}`).click();

  await expect(page.getByTestId('schedule-selected-empty')).toBeVisible();
  await expect(page.getByTestId('schedule-open-session')).toHaveAttribute('aria-label', /Bắt đầu/);
});

test('thống kê cho biết số buổi mỗi tuần theo lịch', async ({ page }) => {
  await expect(page.getByTestId('schedule-weekly-count')).toHaveText('1');
  await expect(page.getByTestId('schedule-total')).toBeVisible();
});

test('nút về trang chủ quay lại dashboard', async ({ page }) => {
  await page.getByTestId('schedule-home').click();

  await expect(page.getByTestId('dashboard-screen').first()).toBeVisible();
});

test('mở chi tiết buổi tập đã tập trong ngày', async ({ page }) => {
  await page.unroute('**/api/**');
  await loginAs(page, undefined, {
    session: sessionFixture({
      status: 'FINISHED',
      items: [
        {
          exerciseName: 'Bench Press',
          targetSets: 4,
          targetReps: 10,
          isCompleted: true,
          sets: [{ setNumber: 1, durationSeconds: 60, restSeconds: 30, reps: 10 }],
        },
      ],
    }),
  });

  await page.getByTestId('bottom-tab-Schedule').click();
  await page.getByTestId(`schedule-day-${todayKey()}`).click();

  const card = page.getByTestId('schedule-selected-session');

  await expect(card).toContainText(/01:00/);
  await expect(card).toContainText(/00:30/);
  await expect(card).toContainText('Bench Press');
  await expect(page.getByTestId('schedule-open-session')).toHaveAttribute('aria-label', /chi ti/);
});

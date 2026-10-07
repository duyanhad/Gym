const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');
const { sessionFixture, todayKey } = require('./helpers/workoutApi');

function todayWeekday() {
  return new Date().getDay();
}

test('hiển thị dashboard với thống kê và 5 mục điều hướng', async ({ page }) => {
  await loginAs(page);

  const dashboard = page.getByTestId('dashboard-screen');

  await expect(dashboard).toBeVisible();
  await expect(dashboard.getByText('XIN CHÀO,')).toBeVisible();

  await expect(page.getByTestId('stat-streak')).toBeVisible();
  await expect(page.getByTestId('stat-month')).toBeVisible();
  await expect(page.getByTestId('stat-exercises')).toHaveText('3');
  await expect(page.getByTestId('stat-connections')).toBeVisible();

  for (const tab of ['Schedule', 'Exercises', 'Share', 'Settings']) {
    await expect(page.getByTestId(`bottom-tab-${tab}`)).toBeVisible();
  }

  await expect(page.getByTestId('quick-action-fab')).toBeVisible();
});

test('dashboard dùng giáo án của lịch tuần cho buổi tập hôm nay', async ({ page }) => {
  await loginAs(page, undefined, { weekly: { [todayWeekday()]: 'plan-1' } });

  const upcoming = page.getByTestId(`dashboard-session-${todayKey()}`);

  await expect(upcoming).toContainText('Push');
  await expect(page.getByTestId('dashboard-start-session')).toBeVisible();

  await page.getByTestId('dashboard-start-session').click();

  await expect(page.getByTestId('session-screen')).toBeVisible();
  await expect(page.getByTestId('setup-plan-plan-1')).toBeVisible();
});

test('mở buổi tập từ danh sách buổi tập sắp tới', async ({ page }) => {
  await loginAs(page, undefined, { weekly: { [todayWeekday()]: 'plan-1' } });

  await page.getByTestId(`dashboard-session-${todayKey()}`).click();

  await expect(page.getByTestId('session-screen')).toBeVisible();
  await expect(page.getByTestId('setup-plan-plan-1')).toBeVisible();
});

test('hiển thị buổi tập gần đây kèm tổng thời gian', async ({ page }) => {
  await loginAs(page, undefined, {
    session: sessionFixture({
      status: 'FINISHED',
      items: [
        {
          exerciseName: 'Bench Press',
          targetSets: 4,
          targetReps: 10,
          isCompleted: true,
          sets: [
            { setNumber: 1, durationSeconds: 45, restSeconds: 30, reps: 10 },
            { setNumber: 2, durationSeconds: 40, restSeconds: 25, reps: 9 },
          ],
        },
      ],
    }),
  });

  const history = page.getByTestId(`dashboard-history-${todayKey()}`);

  await expect(history).toContainText('Push');
  await expect(history).toContainText(/01:25/);
  await expect(history).toContainText(/00:55/);
  await expect(page.getByTestId('dashboard-today-total')).toContainText(/02:20/);
});

test('đi nhanh từ dashboard sang các mục khác', async ({ page }) => {
  await loginAs(page);

  await page.getByTestId('dashboard-quick-add').click();
  await expect(page.getByTestId('add-exercise-screen')).toBeVisible();

  await page.getByTestId('header-brand').first().click();
  await expect(page.getByTestId('dashboard-screen').first()).toBeVisible();

  await page.getByTestId('dashboard-quick-share').click();
  await expect(page.getByTestId('share-screen')).toBeVisible();
});

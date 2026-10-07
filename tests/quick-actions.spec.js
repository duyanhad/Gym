const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

test('núm giữa mở ra các nút tròn thao tác ở giữa màn hình', async ({ page }) => {
  await loginAs(page);

  await expect(page.getByTestId('quick-action-session')).toHaveCount(0);

  await page.getByTestId('quick-action-fab').click();

  await expect(page.getByTestId('quick-actions-overlay')).toBeVisible();

  for (const action of ['session', 'schedule', 'add', 'share']) {
    await expect(page.getByTestId(`quick-action-${action}`)).toBeVisible();
  }

  const viewport = page.viewportSize();
  const hub = await page.getByTestId('quick-actions-close').boundingBox();

  expect(Math.abs(hub.x + hub.width / 2 - viewport.width / 2)).toBeLessThan(60);
  expect(Math.abs(hub.y + hub.height / 2 - viewport.height / 2)).toBeLessThan(90);

  // Chạm ra vùng tối bên ngoài để đóng
  await page.getByTestId('quick-actions-backdrop').click({ position: { x: 20, y: 20 } });
  await expect(page.getByTestId('quick-action-session')).toHaveCount(0);
});

test('các nút tròn mở được màn tương ứng', async ({ page }) => {
  await loginAs(page);

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

test('nút "Bắt đầu buổi tập" mở màn chuẩn bị buổi tập', async ({ page }) => {
  await loginAs(page);

  await page.getByTestId('quick-action-fab').click();
  await page.getByTestId('quick-action-session').click();

  await expect(page.getByTestId('session-screen')).toBeVisible();
  await expect(page.getByTestId('session-start')).toBeVisible();
  await expect(page.getByText('CHUẨN BỊ BUỔI TẬP')).toBeVisible();
});

test('nút giữa vẫn dùng được sau khi đóng menu (không che màn hình)', async ({ page }) => {
  await loginAs(page);

  await page.getByTestId('quick-action-fab').click();
  await page.getByTestId('quick-actions-close').click();
  await expect(page.getByTestId('quick-actions-overlay')).toHaveCount(0);

  await page.getByTestId('bottom-tab-Settings').click();
  await page.getByTestId('header-brand').first().click();
  await expect(page.getByTestId('dashboard-screen').first()).toBeVisible();

  await page.getByTestId('quick-action-fab').click();
  await expect(page.getByTestId('quick-action-session')).toBeVisible();
});

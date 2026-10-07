const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

test.beforeEach(async ({ page }) => {
  await loginAs(page);
  await page.getByTestId('bottom-tab-Share').click();
  await expect(page.getByTestId('share-screen')).toBeVisible();
});

test('gửi lời mời kết nối tới tài khoản khác', async ({ page }) => {
  await page.getByTestId('connection-input').fill('pt03');
  await page.getByTestId('connection-invite').click();

  await expect(page.getByTestId('share-feedback')).toContainText('Đã gửi lời mời kết nối');
  await expect(page.getByText('@pt03')).toBeVisible();
});

test('chấp nhận lời mời kết nối đang chờ', async ({ page }) => {
  const pending = page.getByTestId('connection-cn-3');
  await expect(pending).toContainText('Chờ xác nhận');

  await page.getByTestId('accept-cn-3').click();

  await expect(pending).toContainText('Đã kết nối');
});

test('chia sẻ một bài tập cho tài khoản đã kết nối', async ({ page }) => {
  await page.getByTestId('share-toggle-cn-1').click();
  await page.getByTestId('share-ex-2-cn-1').click();

  await expect(page.getByTestId('share-feedback')).toContainText('Đã chia sẻ bài tập');

  const history = page.getByTestId('share-history');
  await expect(history).toContainText('Squat');
  await expect(history).toContainText('Lê Văn Huấn Luyện');
});

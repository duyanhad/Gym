const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');
const { CONNECTED_PEER, PENDING_INVITE, planDto } = require('./helpers/workoutApi');

const connections = [CONNECTED_PEER, PENDING_INVITE];

test.beforeEach(async ({ page }) => {
  await loginAs(page, undefined, { connections });
  await page.getByTestId('bottom-tab-Share').click();
  await expect(page.getByTestId('share-screen')).toBeVisible();
});

test('gửi lời mời kết nối tới tài khoản khác', async ({ page }) => {
  await page.getByTestId('connection-input').fill('pt05');
  await page.getByTestId('connection-invite').click();

  await expect(page.getByTestId('share-feedback')).toBeVisible();
  await expect(page.getByText('@pt05')).toBeVisible();
});

test('chấp nhận lời mời kết nối đang chờ', async ({ page }) => {
  const pending = page.getByTestId('connection-cn-3');

  await expect(page.getByTestId('accept-cn-3')).toBeVisible();
  await expect(pending).toContainText('@pt03');

  await page.getByTestId('accept-cn-3').click();

  await expect(page.getByTestId('accept-cn-3')).toHaveCount(0);
  await expect(page.getByTestId('share-toggle-cn-3')).toBeVisible();
});

test('chia sẻ giáo án cho tài khoản đã kết nối', async ({ page }) => {
  await page.getByTestId('share-toggle-cn-1').click();
  await page.getByTestId('share-plan-1-cn-1').click();

  await expect(page.getByTestId('share-feedback')).toBeVisible();

  const sent = page.getByTestId('share-sent');

  await expect(sent).toContainText('Push');
});

test('nhận giáo án được chia sẻ và lưu vào danh sách của mình', async ({ page }) => {
  await page.unroute('**/api/**');
  await loginAs(page, undefined, {
    connections,
    plans: [planDto('plan-1', 'Buổi Push (Ngực - Vai - Tay sau)', 'Ngực · Vai · Tay', true)],
    received: [
      {
        workoutPlanShareId: 'share-1',
        workoutPlanId: 'plan-1',
        planName: 'Buổi Push (Ngực - Vai - Tay sau)',
        fromUserId: 'user-pt02',
        fromUserName: 'Lê Văn Huấn Luyện',
        toUserId: 'user-me',
        toUserName: 'Tôi',
        message: 'Tập theo giáo án này nhé!',
        sharedAt: new Date().toISOString(),
        isReceived: true,
      },
    ],
  });

  await page.getByTestId('bottom-tab-Share').click();

  const received = page.getByTestId('share-received');

  await expect(received).toContainText('Push');

  await page.getByTestId('import-share-1').click();

  await expect(page.getByTestId('share-feedback')).toBeVisible();
  await expect(page.getByTestId('import-share-1')).toBeDisabled();
});

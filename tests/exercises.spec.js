const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

test.beforeEach(async ({ page }) => {
  await loginAs(page);
  await page.getByTestId('bottom-tab-Exercises').click();
  await expect(page.getByTestId('exercises-screen')).toBeVisible();
});

test('liệt kê bài tập và tìm kiếm', async ({ page }) => {
  await expect(page.getByTestId('exercise-count')).toContainText('3');
  await expect(page.getByTestId('exercise-ex-1')).toBeVisible();

  await page.getByTestId('exercise-search').fill('squat');

  await expect(page.getByTestId('exercise-count')).toContainText('1');
  await expect(page.getByTestId('exercise-ex-2')).toBeVisible();
  await expect(page.getByTestId('exercise-ex-1')).toHaveCount(0);
});

test('lọc bài tập theo nhóm cơ', async ({ page }) => {
  await page.getByRole('button', { name: 'Cardio', exact: true }).click();

  await expect(page.getByTestId('exercise-ex-3')).toBeVisible();
  await expect(page.getByTestId('exercise-ex-1')).toHaveCount(0);
});

test('chỉ xoá được bài tập do mình tạo', async ({ page }) => {
  // Bài tập hệ thống chỉ có nhãn MẪU, không có nút xoá
  await expect(page.getByTestId('system-ex-1')).toBeVisible();
  await expect(page.getByTestId('delete-ex-1')).toHaveCount(0);

  await expect(page.getByTestId('exercise-ex-2')).toBeVisible();
  await page.getByTestId('delete-ex-2').click();

  await expect(page.getByTestId('exercise-ex-2')).toHaveCount(0);
});

test('thêm bài tập mới thì xuất hiện trong danh sách', async ({ page }) => {
  await page.getByTestId('quick-action-fab').click();
  await page.getByTestId('quick-action-add').click();
  await expect(page.getByTestId('add-exercise-screen')).toBeVisible();

  await page.getByTestId('exercise-save').click();
  await expect(page.getByTestId('exercise-error')).toContainText('Vui lòng nhập tên bài tập.');

  await page.getByTestId('exercise-name').fill('Kéo cáp vai sau');
  await page.getByTestId('exercise-group-Vai').click();
  await page.getByTestId('exercise-sets').fill('4');
  await page.getByTestId('exercise-reps').fill('12');
  await page.getByTestId('exercise-save').click();

  await expect(page.getByTestId('exercise-saved')).toBeVisible();

  await page.getByTestId('exercise-goto-list').click();
  await expect(page.getByTestId('exercises-screen').getByText('Kéo cáp vai sau')).toBeVisible();
});

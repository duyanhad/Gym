const { expect, test } = require('@playwright/test');

const { loginAs } = require('./helpers/auth');

test.beforeEach(async ({ page }) => {
  await loginAs(page);
  await page.getByTestId('bottom-tab-Exercises').click();
  await expect(page.getByTestId('exercises-screen')).toBeVisible();
});

test('liệt kê bài tập mặc định và tìm kiếm', async ({ page }) => {
  await expect(page.getByText('Bench Press')).toBeVisible();

  await page.getByTestId('exercise-search').fill('squat');
  await expect(page.getByText('Squat', { exact: true })).toBeVisible();
  await expect(page.getByText('Bench Press')).toHaveCount(0);
});

test('lọc bài tập theo nhóm cơ', async ({ page }) => {
  await page.getByRole('button', { name: 'Cardio', exact: true }).click();

  await expect(page.getByText('Chạy bộ 3km')).toBeVisible();
  await expect(page.getByText('Bench Press')).toHaveCount(0);
});

test('xoá một bài tập khỏi danh sách', async ({ page }) => {
  await expect(page.getByTestId('exercise-ex-1')).toBeVisible();

  await page.getByTestId('delete-ex-1').click();

  await expect(page.getByTestId('exercise-ex-1')).toHaveCount(0);
});

test('thêm bài tập mới thì xuất hiện trong danh sách', async ({ page }) => {
  await page.getByTestId('bottom-tab-AddExercise').click();
  await expect(page.getByTestId('add-exercise-screen')).toBeVisible();

  await page.getByTestId('exercise-save').click();
  await expect(page.getByTestId('exercise-error')).toContainText('Vui lòng nhập tên bài tập.');

  await page.getByTestId('exercise-name').fill('Kéo cáp vai sau');
  await page.getByTestId('exercise-group-Vai').click();
  await page.getByTestId('exercise-sets').fill('4');
  await page.getByTestId('exercise-reps').fill('12');
  await page.getByTestId('exercise-save').click();

  await expect(page.getByTestId('exercise-saved')).toContainText('Kéo cáp vai sau');

  await page.getByTestId('bottom-tab-Exercises').click();
  await expect(page.getByTestId('exercises-screen').getByText('Kéo cáp vai sau')).toBeVisible();
});

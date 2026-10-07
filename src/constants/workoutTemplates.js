/**
 * Thư viện buổi tập mẫu ("tài liệu" giáo án có sẵn) để người dùng chọn và tự lên lịch tuần.
 * Mỗi buổi tập gồm danh sách bài tập kèm số hiệp / số lần mục tiêu.
 */
export const WORKOUT_TEMPLATES = [
  {
    id: 'tpl-push',
    name: 'Buổi Push (Ngực - Vai - Tay sau)',
    focus: 'Ngực · Vai · Tay',
    note: 'Khởi động 5 phút, nghỉ 90 giây giữa các hiệp nặng.',
    items: [
      { exerciseName: 'Bench Press', targetSets: 4, targetReps: 10 },
      { exerciseName: 'Đẩy vai tạ đôi', targetSets: 4, targetReps: 12 },
      { exerciseName: 'Curl tạ tay', targetSets: 3, targetReps: 15 },
    ],
  },
  {
    id: 'tpl-pull',
    name: 'Buổi Pull (Lưng - Tay trước)',
    focus: 'Lưng · Tay',
    note: 'Tập trung cảm nhận cơ lưng, không dùng đà.',
    items: [
      { exerciseName: 'Deadlift', targetSets: 4, targetReps: 8 },
      { exerciseName: 'Kéo xà', targetSets: 4, targetReps: 8 },
      { exerciseName: 'Curl tạ tay', targetSets: 3, targetReps: 12 },
    ],
  },
  {
    id: 'tpl-legs',
    name: 'Buổi Legs (Chân - Mông)',
    focus: 'Chân · Bụng',
    note: 'Khởi động khớp gối kỹ trước khi vào hiệp nặng.',
    items: [
      { exerciseName: 'Squat', targetSets: 5, targetReps: 10 },
      { exerciseName: 'Plank', targetSets: 3, targetReps: 1 },
    ],
  },
  {
    id: 'tpl-cardio-core',
    name: 'Buổi Cardio + Core',
    focus: 'Cardio · Bụng',
    note: 'Buổi nhẹ, phù hợp ngày giữa tuần.',
    items: [
      { exerciseName: 'Chạy bộ 3km', targetSets: 1, targetReps: 1 },
      { exerciseName: 'Plank', targetSets: 4, targetReps: 1 },
    ],
  },
];

/** Lịch tuần mặc định: key = thứ trong tuần theo JS (0 = Chủ nhật ... 6 = Thứ bảy). */
export const DEFAULT_WEEK_PLAN = {
  0: null,
  1: 'plan-push',
  2: 'plan-cardio-core',
  3: 'plan-pull',
  4: null,
  5: 'plan-legs',
  6: null,
};

export const WEEKDAY_FULL_LABELS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

/** Thứ tự hiển thị lịch tuần: Thứ hai -> Chủ nhật. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const WEEKDAY_FULL = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

export const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

/** Chuyển Date -> 'YYYY-MM-DD' (khoá ngày dùng cho lịch tập). */
export function toDateKey(date) {
  const value = new Date(date);
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${value.getFullYear()}-${month}-${day}`;
}

/** 'YYYY-MM-DD' -> 'Thứ ba, 07/10/2026'. */
export function formatDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return `${WEEKDAY_FULL[date.getDay()]}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

/** 'YYYY-MM-DD' -> '07/10'. */
export function formatShortDate(dateKey) {
  const [, month, day] = dateKey.split('-');

  return `${day}/${month}`;
}

export function monthTitle(year, month) {
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

/**
 * Ma trận lịch của 1 tháng, tuần bắt đầu từ Thứ hai.
 * Mỗi ô là { day, key } hoặc null (ô trống để canh cột).
 */
export function buildMonthMatrix(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;

  const cells = Array.from({ length: leadingBlanks }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, key: toDateKey(new Date(year, month - 1, day)) });
  }

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];

  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
}

/** Tháng trước / tháng sau (month: 1-12). */
export function shiftMonth(year, month, delta) {
  const date = new Date(year, month - 1 + delta, 1);

  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

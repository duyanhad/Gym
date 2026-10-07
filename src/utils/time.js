/** Định dạng giây -> 'mm:ss' (hoặc 'h:mm:ss' khi từ 1 giờ trở lên). */
export function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(rest).padStart(2, '0');

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Định dạng giây -> '5 phút 30 giây' để hiển thị trong câu. */
export function formatDurationText(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  if (minutes === 0) return `${rest} giây`;
  if (rest === 0) return `${minutes} phút`;

  return `${minutes} phút ${rest} giây`;
}

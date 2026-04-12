const DAYS_JP = ['日', '月', '火', '水', '木', '金', '土'];

export { DAYS_JP };

export function formatDateJP(date) {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = DAYS_JP[d.getDay()];
  return `${m}月${day}日（${dow}）`;
}

export function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

export function toDateStr(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

export function getMondayOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  d.setDate(d.getDate() - ((dow + 6) % 7));
  return d;
}

/**
 * 開始日の曜日から、1日おき×3回のトレーニング曜日を自動生成
 * 例: 月曜開始 → [1, 3, 5] (月, 水, 金)
 *     火曜開始 → [2, 4, 6] (火, 木, 土)
 *     日曜開始 → [0, 2, 4] (日, 火, 木) → [1, 3, 5]に調整（月水金が一番バランス良い）
 */
export function generateTrainingDays(startDate) {
  const d = new Date(startDate + 'T00:00:00');
  const startDow = d.getDay();

  // 1日おきに3日選ぶ
  const day1 = startDow;
  const day2 = (startDow + 2) % 7;
  const day3 = (startDow + 4) % 7;

  return [day1, day2, day3].sort((a, b) => a - b);
}

/**
 * 今日がトレーニング日かどうか
 */
export function isTrainingDay(trainingDays) {
  const today = new Date();
  return trainingDays.includes(today.getDay());
}

/**
 * 次のトレーニング日を取得
 */
export function getNextTrainingDate(trainingDays) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 7; i++) {
    const next = new Date(today);
    next.setDate(today.getDate() + i);
    if (trainingDays.includes(next.getDay())) {
      return next;
    }
  }
  return null;
}

/**
 * 今週のトレーニング日の日付リスト（月曜始まり）
 */
export function getWeekTrainingDates(trainingDays) {
  const monday = getMondayOfWeek(new Date());
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (trainingDays.includes(d.getDay())) {
      dates.push(toDateStr(d));
    }
  }
  return dates;
}

/**
 * localStorage ラッパー
 */
const LOGS_KEY = 'gym_logs_v2';
const SETTINGS_KEY = 'gym_settings_v2';

// --- ログ ---
export function getLogs() {
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY)) || [];
  } catch {
    return [];
  }
}

export function deleteLog(logId) {
  const logs = getLogs().filter(l => l.id !== logId);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function saveLog(log) {
  const logs = getLogs();
  // 同日の同一IDがあれば上書き
  const idx = logs.findIndex(l => l.id === log.id);
  if (idx >= 0) {
    logs[idx] = log;
  } else {
    logs.push(log);
  }
  logs.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

/**
 * 指定種目の直近ログからセットデータを取得（前回記録表示用）
 */
export function getLastSetsForExercise(exerciseId) {
  const logs = getLogs();
  for (let i = logs.length - 1; i >= 0; i--) {
    const ex = logs[i].exercises?.find(e => e.exerciseId === exerciseId);
    if (ex && ex.sets?.length > 0) {
      return ex.sets;
    }
  }
  return null;
}

// --- 設定 ---
const DEFAULT_SETTINGS = {
  startDate: null,
  trainingDays: [], // 0=Sun, 1=Mon, ..., 6=Sat
  weeklyGoal: 3,
  restTimerSeconds: 90,
};

export function getSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// --- 統計ヘルパー ---

/**
 * 今週（月曜始まり）のログ数
 */
export function getWeekCount() {
  const logs = getLogs();
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dow + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const mondayStr = formatDate(monday);
  return logs.filter(l => l.date >= mondayStr).length;
}

/**
 * 連続週数（予定日ベースではなく「週に1回以上」ベース）
 */
export function getWeekStreak() {
  const logs = getLogs();
  if (logs.length === 0) return 0;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dow = now.getDay();

  // 今週の月曜日
  let monday = new Date(now);
  monday.setDate(now.getDate() - ((dow + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  let streak = 0;
  // 今週にログがあるかチェック
  const logDates = new Set(logs.map(l => l.date));

  for (let w = 0; w < 52; w++) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() - (w * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let hasLog = false;
    for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      if (logDates.has(formatDate(d))) {
        hasLog = true;
        break;
      }
    }

    if (hasLog) {
      streak++;
    } else {
      // 今週（w=0）にまだログがなくてもストリークは切らない
      if (w === 0) continue;
      break;
    }
  }

  return streak;
}

function formatDate(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

export { formatDate };

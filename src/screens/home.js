import { getSettings, getLogs, getWeekCount, deleteLog, saveSettings, formatDate } from '../lib/storage.js';
import { getPhaseFromStartDate, PHASES } from '../data/programs.js';
import { formatDateJP, todayStr, DAYS_JP, isTrainingDay, getNextTrainingDate, getWeekTrainingDates, toDateStr, getMondayOfWeek } from '../lib/date.js';

let selectedMode = 'full';

export function initHome(onStart) {
  // Mode selection
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMode = btn.dataset.mode;
    });
  });

  // Start button
  document.getElementById('btn-start').addEventListener('click', () => {
    onStart(selectedMode);
  });
}

export function renderHome() {
  const settings = getSettings();
  if (!settings.startDate) return;

  const phase = getPhaseFromStartDate(settings.startDate);
  const phaseData = PHASES[phase];
  const trainingDays = settings.trainingDays || [];

  // Phase badge + day counter
  const start = new Date(settings.startDate + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dayNum = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
  document.getElementById('phase-badge').textContent = `${phaseData.name} — DAY ${dayNum}`;

  // Full mode time
  const fullTime = phaseData.subtitle.match(/約\d+分/)?.[0] || '';
  document.getElementById('mode-full-time').textContent = fullTime;

  // Schedule indicator
  renderScheduleIndicator(trainingDays);

  // Week bar
  renderWeekBar(trainingDays);

  // Weekly goal
  const weekCount = getWeekCount();
  const goal = settings.weeklyGoal;
  const remaining = Math.max(0, goal - weekCount);

  document.getElementById('weekly-remaining').textContent = remaining;

  const goalEl = document.getElementById('weekly-goal');
  const fillPct = Math.min(100, (weekCount / goal) * 100);
  document.getElementById('weekly-fill').style.width = fillPct + '%';

  if (remaining === 0) {
    goalEl.classList.add('done');
    document.querySelector('.weekly-goal-label').textContent = '今週の目標達成！';
  } else {
    goalEl.classList.remove('done');
    document.querySelector('.weekly-goal-label').innerHTML =
      '今週あと<span>' + remaining + '</span>回';
  }

  // Check if already trained today
  const logs = getLogs();
  const today = todayStr();
  const trainedToday = logs.some(l => l.date === today);
  const startBtn = document.getElementById('btn-start');
  if (trainedToday) {
    startBtn.textContent = 'DONE ✓ （もう1回やる？）';
  } else {
    startBtn.textContent = 'START';
  }

  // Recent logs
  renderRecentLogs(logs);
}

function renderScheduleIndicator(trainingDays) {
  const el = document.getElementById('schedule-indicator');
  if (!el) return;

  const today = new Date();
  const isTDay = isTrainingDay(trainingDays);
  const logs = getLogs();
  const trainedToday = logs.some(l => l.date === todayStr());

  if (trainedToday) {
    el.className = 'schedule-indicator done';
    el.innerHTML = '<span class="schedule-icon">✓</span><span class="schedule-text">今日のトレーニング完了！</span>';
  } else if (isTDay) {
    el.className = 'schedule-indicator today';
    el.innerHTML = '<span class="schedule-icon">💪</span><span class="schedule-text">今日はトレーニング日！</span>';
  } else {
    const next = getNextTrainingDate(trainingDays);
    if (next) {
      const nextLabel = formatDateJP(next);
      el.className = 'schedule-indicator rest';
      el.innerHTML = `<span class="schedule-icon">😴</span><span class="schedule-text">次のトレーニング: ${nextLabel}</span>`;
    }
  }
}

function renderWeekBar(trainingDays) {
  const el = document.getElementById('week-bar');
  if (!el) return;

  const monday = getMondayOfWeek(new Date());
  const today = todayStr();
  const logs = getLogs();
  const logDates = new Set(logs.map(l => l.date));

  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const ds = toDateStr(d);
    const dow = d.getDay();
    const done = logDates.has(ds);
    const isToday = ds === today;
    const isScheduled = trainingDays.includes(dow);

    const classes = ['week-dot'];
    if (done) classes.push('done');
    if (isToday) classes.push('today');
    if (isScheduled && !done) classes.push('scheduled');

    html += `<div class="${classes.join(' ')}" onclick="window.__toggleTrainingDay(${dow})">
      <div class="dot">${done ? '✓' : isScheduled ? '●' : ''}</div>
      <span>${DAYS_JP[dow]}</span>
    </div>`;
  }
  el.innerHTML = html;
}

window.__toggleTrainingDay = function (dow) {
  const settings = getSettings();
  let days = [...(settings.trainingDays || [])];

  if (days.includes(dow)) {
    days = days.filter(d => d !== dow);
  } else {
    days.push(dow);
    days.sort((a, b) => a - b);
  }

  saveSettings({ ...settings, trainingDays: days, weeklyGoal: Math.max(1, days.length) });
  renderHome();
};

function renderRecentLogs(logs) {
  const container = document.getElementById('recent-logs');
  const recent = logs.slice(-5).reverse();

  if (recent.length === 0) {
    container.innerHTML = '<div class="empty-msg">まだ記録がありません</div>';
    return;
  }

  const modeLabels = { full: 'フル', light: 'ライト', minimum: '最低限' };

  container.innerHTML = recent.map(l => {
    const phaseData = PHASES[l.phase];
    const phaseName = phaseData ? phaseData.name : l.phase;
    const modeLabel = modeLabels[l.mode] || l.mode;
    const dateLabel = formatDateJP(l.date);

    return `<div class="log-item">
      <div>
        <div class="log-plan">${phaseName}</div>
        <div class="log-meta">
          <span class="log-date">${dateLabel}</span>
          <span class="log-mode-tag">${modeLabel}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div class="log-sets">${l.completedSets || l.totalSets || 0} SETS</div>
        <button class="log-delete-btn" onclick="window.__deleteLog('${l.id}')">&times;</button>
      </div>
    </div>`;
  }).join('');
}

window.__deleteLog = function (logId) {
  if (confirm('この記録を削除しますか？')) {
    deleteLog(logId);
    renderHome();
  }
};

export function getSelectedMode() {
  return selectedMode;
}

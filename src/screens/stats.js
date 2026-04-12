import { getLogs, getWeekCount, getWeekStreak } from '../lib/storage.js';
import { exercises } from '../data/exercises.js';
import { todayStr } from '../lib/date.js';

let calendarMonth = null; // Date object for displayed month

export function renderStats() {
  const logs = getLogs();

  // Basic stats
  document.getElementById('stat-total').textContent = logs.length;
  document.getElementById('stat-week-streak').textContent = getWeekStreak();
  document.getElementById('stat-week').textContent = getWeekCount();

  const totalSets = logs.reduce((s, l) => s + (l.completedSets || l.totalSets || 0), 0);
  document.getElementById('stat-sets').textContent = totalSets;

  // Calendar
  if (!calendarMonth) {
    calendarMonth = new Date();
    calendarMonth.setDate(1);
  }
  renderCalendar(logs);

  // Weight progress
  renderWeightProgress(logs);
}

function renderCalendar(logs) {
  const container = document.getElementById('calendar');
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const today = todayStr();

  const logDates = new Set(logs.map(l => l.date));

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'];

  let html = `<div class="cal-header">
    <button class="cal-nav" onclick="window.__calNav(-1)">◀</button>
    <span class="cal-title">${year}年 ${monthNames[month]}</span>
    <button class="cal-nav" onclick="window.__calNav(1)">▶</button>
  </div>`;

  html += '<div class="cal-grid">';

  // Day of week headers
  const dows = ['月', '火', '水', '木', '金', '土', '日'];
  dows.forEach(d => { html += `<div class="cal-dow">${d}</div>`; });

  // Empty cells before first day
  for (let i = 0; i < startDow; i++) {
    html += '<div class="cal-day empty"></div>';
  }

  // Days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const hasLog = logDates.has(dateStr);
    const isToday = dateStr === today;
    const classes = ['cal-day'];
    if (hasLog) classes.push('has-log');
    if (isToday) classes.push('today');
    html += `<div class="${classes.join(' ')}">${d}</div>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

window.__calNav = function (delta) {
  calendarMonth.setMonth(calendarMonth.getMonth() + delta);
  renderStats();
};

function renderWeightProgress(logs) {
  const container = document.getElementById('weight-progress');

  // Collect weight data per exercise (last 5 sessions)
  const exerciseWeights = {};

  logs.forEach(log => {
    if (!log.exercises) return;
    log.exercises.forEach(ex => {
      if (!ex.sets) return;
      const exDef = exercises[ex.exerciseId];
      if (!exDef || exDef.duration || exDef.timed) return; // skip cardio/timed

      const completedSets = ex.sets.filter(s => s.completed && s.weight > 0);
      if (completedSets.length === 0) return;

      const maxWeight = Math.max(...completedSets.map(s => s.weight));
      const maxReps = Math.max(...completedSets.map(s => s.reps));

      if (!exerciseWeights[ex.exerciseId]) {
        exerciseWeights[ex.exerciseId] = [];
      }
      exerciseWeights[ex.exerciseId].push({
        date: log.date,
        weight: maxWeight,
        reps: maxReps
      });
    });
  });

  if (Object.keys(exerciseWeights).length === 0) {
    container.innerHTML = '<div class="empty-msg">記録が増えると、ここに成長グラフが表示されます</div>';
    return;
  }

  let html = '';

  Object.entries(exerciseWeights).forEach(([exId, entries]) => {
    const ex = exercises[exId];
    if (!ex) return;
    const recent = entries.slice(-5);
    const maxW = Math.max(...recent.map(e => e.weight));

    html += `<div class="progress-card">
      <div class="progress-card-name">${ex.name}</div>
      <div class="progress-bars">
        ${recent.map(e => {
          const pct = maxW > 0 ? (e.weight / maxW * 100) : 0;
          const dateShort = e.date.slice(5); // MM-DD
          return `<div class="progress-entry">
            <span class="progress-date">${dateShort}</span>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" style="width:${pct}%"></div>
            </div>
            <span class="progress-val">${e.weight}kg × ${e.reps}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  });

  container.innerHTML = html;
}

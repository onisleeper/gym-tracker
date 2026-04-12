import './style.css';
import { getSettings, saveSettings } from './lib/storage.js';
import { todayStr, generateTrainingDays, DAYS_JP } from './lib/date.js';
import { initHome, renderHome } from './screens/home.js';
import { initTrain, startTraining } from './screens/train.js';
import { renderStats } from './screens/stats.js';

// ===== Screen Navigation =====
let currentScreen = null;

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');

  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  const navBtn = document.querySelector(`nav button[data-screen="${name}"]`);
  if (navBtn) navBtn.classList.add('active');

  currentScreen = name;

  if (name === 'home') renderHome();
  if (name === 'stats') renderStats();
}

// ===== Setup =====
function checkSetup() {
  const settings = getSettings();
  if (!settings.startDate) {
    showSetup();
    return false;
  }
  // Migrate: if trainingDays missing, generate from startDate
  if (!settings.trainingDays || settings.trainingDays.length === 0) {
    const trainingDays = generateTrainingDays(settings.startDate);
    saveSettings({ ...settings, trainingDays });
  }
  return true;
}

function showSetup() {
  document.getElementById('main-nav').style.display = 'none';
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-setup').classList.add('active');

  const dateInput = document.getElementById('setup-date');
  dateInput.value = todayStr();

  function updateSchedulePreview() {
    const date = dateInput.value;
    if (!date) return;
    const days = generateTrainingDays(date);
    const dayNames = days.map(d => DAYS_JP[d]).join('・');
    document.getElementById('setup-schedule').innerHTML =
      `<div style="margin:12px 0;padding:12px;background:#242424;border-radius:10px;text-align:center">
        <div style="color:#888;font-size:11px;margin-bottom:4px">トレーニング曜日（あとで変更OK）</div>
        <div style="color:#c8f135;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:0.08em">${dayNames}</div>
      </div>`;
  }

  dateInput.addEventListener('change', updateSchedulePreview);
  updateSchedulePreview();

  document.getElementById('setup-btn').addEventListener('click', () => {
    const date = dateInput.value;
    if (!date) return;
    const trainingDays = generateTrainingDays(date);
    saveSettings({ ...getSettings(), startDate: date, trainingDays });
    document.getElementById('main-nav').style.display = '';
    showScreen('home');
  });
}

// ===== Init =====
function init() {
  // Nav
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      const screen = btn.dataset.screen;
      if (screen === 'train') {
        // Train screen is entered via START button, not nav
        // But if there's an active session, show it
        showScreen('home');
        return;
      }
      showScreen(screen);
    });
  });

  // Home
  initHome((mode) => {
    startTraining(mode);
    showScreen('train');
  });

  // Train
  initTrain(() => {
    showScreen('home');
  });

  // Check if setup needed
  if (checkSetup()) {
    document.getElementById('main-nav').style.display = '';
    showScreen('home');
  }
}

// ===== PWA =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// ===== Start =====
init();

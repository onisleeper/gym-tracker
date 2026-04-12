/**
 * セット間休息タイマー
 */
let timerInterval = null;
let remaining = 0;
let onFinishCallback = null;

const timerEl = () => document.getElementById('rest-timer');
const timeEl = () => document.getElementById('rest-timer-time');
const skipEl = () => document.getElementById('rest-timer-skip');

export function initRestTimer() {
  skipEl().addEventListener('click', stopTimer);
}

export function startTimer(seconds, onFinish) {
  stopTimer();
  remaining = seconds;
  onFinishCallback = onFinish || null;
  timerEl().style.display = '';
  updateDisplay();

  timerInterval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      stopTimer();
      vibrate();
      if (onFinishCallback) onFinishCallback();
    } else {
      updateDisplay();
    }
  }, 1000);
}

export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  remaining = 0;
  timerEl().style.display = 'none';
}

export function isRunning() {
  return timerInterval !== null;
}

function updateDisplay() {
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  timeEl().textContent = min + ':' + String(sec).padStart(2, '0');
}

function vibrate() {
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
}

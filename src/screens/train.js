import { exercises } from '../data/exercises.js';
import { getMenuForMode, getPhaseFromStartDate, PHASES } from '../data/programs.js';
import { getSettings, saveLog, getLastSetsForExercise, formatDate } from '../lib/storage.js';
import { todayStr } from '../lib/date.js';
import { startTimer, stopTimer, initRestTimer } from '../components/rest-timer.js';

let currentPhase = null;
let currentMode = null;
let currentMenu = null;
let exerciseStates = []; // [{sets: [{weight, reps, completed, seconds}]}]
let startTime = null;

export function initTrain(onDone) {
  initRestTimer();

  document.getElementById('btn-back-train').addEventListener('click', () => {
    if (hasAnyCompleted()) {
      if (confirm('途中の記録を保存しますか？')) {
        doSave(onDone);
      } else {
        stopTimer();
        onDone();
      }
    } else {
      stopTimer();
      onDone();
    }
  });

  document.getElementById('btn-save-partial').addEventListener('click', () => {
    doSave(onDone);
  });

  document.getElementById('btn-save-complete').addEventListener('click', () => {
    doSave(onDone);
  });
}

export function startTraining(mode) {
  const settings = getSettings();
  currentPhase = getPhaseFromStartDate(settings.startDate);
  currentMode = mode;
  currentMenu = getMenuForMode(currentPhase, mode);
  startTime = Date.now();

  const phaseData = PHASES[currentPhase];
  document.getElementById('train-title').textContent = phaseData.name;
  const modeLabels = { full: 'FULL', light: 'LIGHT', minimum: 'MINIMUM' };
  document.getElementById('train-mode-badge').textContent = modeLabels[mode] || mode;

  // Initialize exercise states
  exerciseStates = currentMenu.map(item => {
    const ex = exercises[item.exerciseId];
    const prevSets = getLastSetsForExercise(item.exerciseId);

    if (ex.duration) {
      return {
        exerciseId: item.exerciseId,
        sets: [{ completed: false, minutes: item.minutes }]
      };
    }

    if (ex.timed) {
      return {
        exerciseId: item.exerciseId,
        sets: Array.from({ length: item.sets }, (_, i) => ({
          seconds: item.seconds || ex.defaultSeconds,
          completed: false
        }))
      };
    }

    return {
      exerciseId: item.exerciseId,
      sets: Array.from({ length: item.sets }, (_, i) => {
        const prev = prevSets?.[i];
        return {
          weight: prev?.weight ?? ex.defaultWeight ?? 0,
          reps: prev?.reps ?? item.reps ?? ex.defaultReps ?? 10,
          completed: false
        };
      })
    };
  });

  renderExercises();
}

function renderExercises() {
  const list = document.getElementById('exercise-list');
  let totalSets = 0;
  let doneSets = 0;

  exerciseStates.forEach(es => {
    totalSets += es.sets.length;
    doneSets += es.sets.filter(s => s.completed).length;
  });

  const allDone = doneSets === totalSets;
  const pct = totalSets > 0 ? (doneSets / totalSets * 100) : 0;
  document.getElementById('train-progress').style.width = pct + '%';

  list.innerHTML = exerciseStates.map((es, ei) => {
    const ex = exercises[es.exerciseId];
    const menuItem = currentMenu[ei];
    const allSetsDone = es.sets.every(s => s.completed);
    const prevSets = getLastSetsForExercise(es.exerciseId);

    let setsHTML = '';

    if (ex.duration) {
      setsHTML = renderDurationButton(ei, es.sets[0]);
    } else if (ex.timed) {
      setsHTML = renderTimedSets(ei, es);
    } else {
      setsHTML = renderWeightSets(ei, es, prevSets, ex);
    }

    const volumeText = getVolumeText(menuItem, ex);

    return `<div class="exercise-card${allSetsDone ? ' completed' : ''}">
      <div class="ex-header">
        <div>
          <div class="ex-name">${ex.name}</div>
          <div class="ex-volume">${volumeText}</div>
          ${ex.perSide ? '<div class="ex-per-side">左右それぞれ</div>' : ''}
        </div>
        <button class="howto-toggle" onclick="document.querySelector('#howto-${ei}').classList.toggle('open'); this.textContent = document.querySelector('#howto-${ei}').classList.contains('open') ? '閉じる' : 'HOW TO'">HOW TO</button>
      </div>
      <div class="howto-content" id="howto-${ei}">
        <div class="howto-step"><span class="howto-step-label">SETUP</span><br>${ex.howTo.setup}</div>
        <div class="howto-step"><span class="howto-step-label">MOTION</span><br>${ex.howTo.motion}</div>
        <div class="howto-step"><span class="howto-step-label">POINT</span><br>${ex.howTo.point}</div>
      </div>
      ${setsHTML}
    </div>`;
  }).join('');

  // Complete area
  document.getElementById('complete-area').style.display = allDone ? '' : 'none';
  document.getElementById('btn-save-partial').style.display = allDone ? 'none' : '';
}

function renderWeightSets(ei, es, prevSets, ex) {
  return `<div class="set-rows">
    ${es.sets.map((s, si) => {
      const prev = prevSets?.[si];
      const prevText = prev ? `前回: ${prev.weight}kg × ${prev.reps}` : '';
      return `<div class="set-row">
        <span class="set-num">${si + 1}</span>
        <input class="set-input" type="number" inputmode="decimal" value="${s.weight}" placeholder="kg"
          onchange="window.__updateSet(${ei}, ${si}, 'weight', this.value)">
        <span class="set-unit">kg</span>
        <input class="set-input" type="number" inputmode="numeric" value="${s.reps}" placeholder="回"
          onchange="window.__updateSet(${ei}, ${si}, 'reps', this.value)">
        <span class="set-unit">回</span>
        <button class="set-done-btn${s.completed ? ' done' : ''}" onclick="window.__toggleSet(${ei}, ${si})">
          ${s.completed ? '✓' : ''}
        </button>
        ${prevText ? `<span class="set-prev">${prevText}</span>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

function renderTimedSets(ei, es) {
  return `<div class="set-rows">
    ${es.sets.map((s, si) => {
      return `<div class="set-row">
        <span class="set-num">${si + 1}</span>
        <span class="duration-label">${s.seconds}秒</span>
        <button class="set-done-btn${s.completed ? ' done' : ''}" onclick="window.__toggleSet(${ei}, ${si})" style="margin-left:auto">
          ${s.completed ? '✓' : ''}
        </button>
      </div>`;
    }).join('')}
  </div>`;
}

function renderDurationButton(ei, setData) {
  return `<div class="duration-btn">
    <button class="set-done-btn${setData.completed ? ' done' : ''}" onclick="window.__toggleSet(${ei}, 0)">
      ${setData.completed ? '✓' : ''}
    </button>
    <span class="duration-label">${setData.minutes}分</span>
  </div>`;
}

function getVolumeText(menuItem, ex) {
  if (ex.duration) return menuItem.minutes + '分';
  if (ex.timed) return menuItem.sets + 'セット × ' + (menuItem.seconds || ex.defaultSeconds) + '秒';
  if (ex.repLabel) return menuItem.sets + 'セット × ' + ex.repLabel;
  return menuItem.sets + 'セット × ' + menuItem.reps + '回';
}

// --- Global handlers (called from inline onclick) ---

window.__updateSet = function (ei, si, field, value) {
  const numVal = parseFloat(value) || 0;
  exerciseStates[ei].sets[si][field] = numVal;
};

window.__toggleSet = function (ei, si) {
  const set = exerciseStates[ei].sets[si];
  set.completed = !set.completed;

  if (set.completed) {
    // Start rest timer (skip for warmup/cooldown/last set)
    const ex = exercises[exerciseStates[ei].exerciseId];
    const isLastSetOfExercise = si === exerciseStates[ei].sets.length - 1;
    const isWarmupCooldown = ex.category === 'warmup' || ex.category === 'cooldown';

    if (!isWarmupCooldown && !isLastSetOfLast(ei, si)) {
      const settings = getSettings();
      startTimer(settings.restTimerSeconds);
    }
  }

  renderExercises();
};

function isLastSetOfLast(ei, si) {
  // Check if this is the very last set of the very last exercise
  if (ei < exerciseStates.length - 1) return false;
  return si === exerciseStates[ei].sets.length - 1;
}

function hasAnyCompleted() {
  return exerciseStates.some(es => es.sets.some(s => s.completed));
}

function doSave(onDone) {
  stopTimer();

  let totalSets = 0;
  let completedSets = 0;

  const exerciseData = exerciseStates.map(es => {
    totalSets += es.sets.length;
    const completed = es.sets.filter(s => s.completed).length;
    completedSets += completed;
    return {
      exerciseId: es.exerciseId,
      sets: es.sets.map(s => ({ ...s }))
    };
  });

  const today = todayStr();
  const log = {
    id: today + '_' + Date.now(),
    date: today,
    phase: currentPhase,
    mode: currentMode,
    startTime: startTime,
    endTime: Date.now(),
    exercises: exerciseData,
    totalSets,
    completedSets
  };

  saveLog(log);
  onDone();
}

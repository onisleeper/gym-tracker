/**
 * フェーズ別プログラム定義
 *
 * - week1-2: 約20分。「行って、やって、帰る」を体に覚えさせる
 * - week3-4: 約30分。少しだけ種目追加
 * - month2:  約35-40分。懸垂導入、本格化への橋渡し
 */

// フルメニュー定義
const PHASES = {
  'week1-2': {
    name: 'WEEK 1-2',
    subtitle: '約20分 — まず行くことが勝ち',
    exercises: [
      { exerciseId: 'aerobike', sets: 1, minutes: 5 },
      { exerciseId: 'goblet-squat', sets: 2, reps: 10 },
      { exerciseId: 'db-bench-press', sets: 2, reps: 10 },
      { exerciseId: 'one-arm-row', sets: 2, reps: 10 },
      { exerciseId: 'plank', sets: 2, seconds: 20 },
      { exerciseId: 'stretch', sets: 1, minutes: 3 },
    ]
  },
  'week3-4': {
    name: 'WEEK 3-4',
    subtitle: '約30分 — 少し追加、成長を感じる',
    exercises: [
      { exerciseId: 'aerobike', sets: 1, minutes: 5 },
      { exerciseId: 'goblet-squat', sets: 3, reps: 10 },
      { exerciseId: 'db-bench-press', sets: 3, reps: 10 },
      { exerciseId: 'one-arm-row', sets: 3, reps: 10 },
      { exerciseId: 'db-shoulder-press', sets: 2, reps: 10 },
      { exerciseId: 'ab-roller', sets: 2, reps: 8 },
      { exerciseId: 'stretch', sets: 1, minutes: 3 },
    ]
  },
  'month2': {
    name: 'MONTH 2+',
    subtitle: '約35-40分 — 懸垂デビュー',
    exercises: [
      { exerciseId: 'aerobike', sets: 1, minutes: 5 },
      { exerciseId: 'goblet-squat', sets: 3, reps: 12 },
      { exerciseId: 'db-bench-press', sets: 3, reps: 10 },
      { exerciseId: 'chin-up', sets: 3, reps: 0 },
      { exerciseId: 'db-shoulder-press', sets: 3, reps: 10 },
      { exerciseId: 'db-curl', sets: 2, reps: 12 },
      { exerciseId: 'ab-roller', sets: 3, reps: 10 },
      { exerciseId: 'stretch', sets: 1, minutes: 3 },
    ]
  }
};

/**
 * モード定義
 * - full:    当該フェーズの全メニュー
 * - light:   エアロバイク + メイン3種目(2セットずつ) + ストレッチ
 * - minimum: エアロバイク + ゴブレットスクワット2セット + ストレッチ
 */
function getMenuForMode(phaseId, mode) {
  const phase = PHASES[phaseId];
  if (!phase) return null;

  if (mode === 'full') {
    return phase.exercises;
  }

  if (mode === 'light') {
    const aerobike = phase.exercises.find(e => e.exerciseId === 'aerobike');
    const stretch = phase.exercises.find(e => e.exerciseId === 'stretch');
    // メイン種目（warmup/cooldown以外）から先頭3つ、2セットに制限
    const mains = phase.exercises
      .filter(e => e.exerciseId !== 'aerobike' && e.exerciseId !== 'stretch')
      .slice(0, 3)
      .map(e => ({ ...e, sets: 2 }));
    return [aerobike, ...mains, stretch];
  }

  if (mode === 'minimum') {
    return [
      { exerciseId: 'aerobike', sets: 1, minutes: 5 },
      { exerciseId: 'goblet-squat', sets: 2, reps: 10 },
      { exerciseId: 'stretch', sets: 1, minutes: 3 },
    ];
  }

  return phase.exercises;
}

/**
 * 開始日からフェーズを自動計算
 */
function getPhaseFromStartDate(startDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);

  if (weeks < 2) return 'week1-2';
  if (weeks < 4) return 'week3-4';
  return 'month2';
}

export { PHASES, getMenuForMode, getPhaseFromStartDate };

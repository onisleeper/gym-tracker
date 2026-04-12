/**
 * 種目定義
 * 各種目にやり方ガイド（howTo）を内蔵 → ジムで調べる必要ゼロ
 */
export const exercises = {
  'aerobike': {
    name: 'エアロバイク',
    category: 'warmup',
    equipment: 'エアロバイク',
    duration: true, // セット制ではなく時間制
    defaultMinutes: 5,
    howTo: {
      setup: 'サドルの高さを腰骨あたりに合わせる。ペダルに足を乗せてベルトを締める。',
      motion: '軽いペースで漕ぐ。息が少し上がる程度でOK。',
      point: 'ウォームアップが目的。全力で漕がない。体を温めるだけ。'
    }
  },
  'goblet-squat': {
    name: 'ゴブレットスクワット',
    category: 'legs',
    equipment: 'ダンベル1個',
    defaultWeight: 8,
    defaultReps: 10,
    howTo: {
      setup: 'ダンベルの片側を両手で胸の前に持つ。足は肩幅に開く。',
      motion: 'お尻を後ろに引きながら、太ももが床と平行になるまでしゃがむ。立ち上がる。',
      point: '膝がつま先より前に出すぎないよう意識。背中は丸めない。最初は軽い重量（4-6kg）でOK。'
    }
  },
  'db-bench-press': {
    name: 'ダンベルベンチプレス',
    category: 'chest',
    equipment: 'ダンベル + ベンチ',
    defaultWeight: 8,
    defaultReps: 10,
    howTo: {
      setup: 'ベンチに仰向けに寝る。ダンベルを両手に持ち、胸の上に構える。',
      motion: 'ダンベルをゆっくり胸の横まで下ろす → 真上に押し上げる。',
      point: '肩甲骨を寄せて胸を張る。バーベルより安全（潰れても横に落とせる）。最初は5-8kgから。'
    }
  },
  'one-arm-row': {
    name: 'ワンハンドダンベルロウ',
    category: 'back',
    equipment: 'ダンベル + ベンチ',
    defaultWeight: 8,
    defaultReps: 10,
    perSide: true,
    howTo: {
      setup: 'ベンチに片手と片膝をつく。反対の手でダンベルを持ち、腕を下に垂らす。',
      motion: '肘を引き上げるようにダンベルを脇腹まで引く → ゆっくり下ろす。',
      point: '背中の筋肉で引く意識。腕だけで引かない。体はひねらない。左右同じ回数やる。'
    }
  },
  'plank': {
    name: 'プランク',
    category: 'core',
    equipment: 'ヨガマット',
    timed: true, // 秒数制
    defaultSeconds: 20,
    howTo: {
      setup: 'うつ伏せから肘とつま先で体を支える。肘は肩の真下。',
      motion: '体を一直線にキープ。そのまま静止。',
      point: '腰を落とさない・上げすぎない。きつくなったら膝をつけてOK。呼吸を止めない。'
    }
  },
  'db-shoulder-press': {
    name: 'ダンベルショルダープレス',
    category: 'shoulders',
    equipment: 'ダンベル + ベンチ',
    defaultWeight: 6,
    defaultReps: 10,
    howTo: {
      setup: 'ベンチに座る。ダンベルを両手に持ち、耳の横に構える。',
      motion: 'ダンベルを頭上に押し上げる → ゆっくり耳の横まで下ろす。',
      point: '真上に上げる。体を反らさない。最初は4-6kgから。'
    }
  },
  'ab-roller': {
    name: '腹筋ローラー',
    category: 'core',
    equipment: '腹筋ローラー + マット',
    defaultReps: 8,
    howTo: {
      setup: 'マットの上に膝をつく。腹筋ローラーのハンドルを両手で握る。',
      motion: 'ゆっくり前に転がしていく → 限界まで伸びたら腹筋で引き戻す。',
      point: '必ず膝つきで。腰を反らさない。最初は行ける範囲だけでOK。無理に伸ばしすぎない。'
    }
  },
  'chin-up': {
    name: '懸垂（チンアップ）',
    category: 'back',
    equipment: '懸垂バー',
    defaultReps: 0, // "できる回数"
    repLabel: 'できる回数',
    howTo: {
      setup: 'バーを肩幅くらいで握る（手のひらを自分に向ける逆手がやりやすい）。',
      motion: '肘を曲げて体を引き上げる → ゆっくり下ろす。',
      point: '最初は1回もできなくて普通。ぶら下がるだけでもOK。斜め懸垂（足を地面につけたまま）から始める。'
    }
  },
  'db-curl': {
    name: 'ダンベルカール',
    category: 'arms',
    equipment: 'ダンベル',
    defaultWeight: 6,
    defaultReps: 12,
    howTo: {
      setup: '立った状態でダンベルを両手に持つ。腕は体の横に。',
      motion: '肘を固定して、ダンベルを肩の方に巻き上げる → ゆっくり下ろす。',
      point: '肘を前後に動かさない。反動を使わない。最初は4-6kgから。'
    }
  },
  'stretch': {
    name: 'ストレッチ',
    category: 'cooldown',
    equipment: 'なし',
    duration: true,
    defaultMinutes: 3,
    howTo: {
      setup: 'マットの上で座るか立つ。',
      motion: '使った部位を中心に20-30秒ずつ伸ばす。',
      point: '深呼吸しながらリラックス。痛いほど伸ばさない。気持ちいい程度でOK。'
    }
  }
};

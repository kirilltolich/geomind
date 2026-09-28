/* GeoMind — система уровней.
 * Уровень определяется накопленным XP. Пороги растут по понятной
 * прогрессии: разница между соседними уровнями увеличивается на 50 XP:
 *
 *   Уровень 1 → 0 XP
 *   Уровень 2 → 100 XP   (шаг +100)
 *   Уровень 3 → 250 XP   (шаг +150)
 *   Уровень 4 → 450 XP   (шаг +200)
 *   Уровень 5 → 700 XP   (шаг +250)
 *   Уровень 6 → 1000 XP  (шаг +300)
 *   ...
 *
 * getInfo(xp) возвращает:
 *   level     — текущий уровень
 *   floor     — XP на старте уровня
 *   next      — XP, нужный для следующего уровня (null на максимуме)
 *   intoLevel — XP внутри текущего уровня (xp - floor)
 *   span      — размер уровня (next - floor)
 *   toNext    — XP до следующего уровня
 *   progress  — прогресс внутри уровня, 0..1
 *   isMax     — достигнут ли максимальный уровень
 */
window.GeoMind = window.GeoMind || {};

window.GeoMind.Levels = (function () {
  // Настройки прогрессии. Меняй их — пороги пересчитаются автоматически.
  const FIRST_STEP = 100; // разрыв между уровнями 1 и 2
  const STEP_GROWTH = 50; // на сколько растёт каждый следующий разрыв
  const MAX_LEVEL = 20;

  // Пороги: thresholds[level] = минимальный XP для этого уровня.
  const thresholds = [0]; // индекс 0 не используется (уровни с 1)
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const prev = thresholds[level - 1];
    // Разрыв level-1 -> level: 100, 150, 200, ...
    const gap = level === 1 ? 0 : FIRST_STEP + STEP_GROWTH * (level - 2);
    thresholds.push(prev + gap);
  }

  function clamp(xp) {
    return Math.max(0, Math.floor(Number(xp) || 0));
  }

  function getInfo(rawXp) {
    const xp = clamp(rawXp);
    let level = 1;
    for (let l = 1; l <= MAX_LEVEL; l++) {
      if (xp >= thresholds[l]) level = l;
    }
    const floor = thresholds[level];
    const isMax = level >= MAX_LEVEL;
    const next = isMax ? null : thresholds[level + 1];
    const span = isMax ? 1 : next - floor;
    const intoLevel = xp - floor;
    return {
      level: level,
      xp: xp,
      floor: floor,
      next: next,
      intoLevel: intoLevel,
      span: span,
      toNext: isMax ? 0 : next - xp,
      progress: isMax ? 1 : Math.min(1, intoLevel / span),
      isMax: isMax,
    };
  }

  return {
    MAX_LEVEL: MAX_LEVEL,
    thresholds: thresholds,
    getInfo: getInfo,
  };
})();

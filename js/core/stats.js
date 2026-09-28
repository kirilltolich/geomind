/* GeoMind — модель статистики пользователя.
 * Отвечает за накопление XP, точность, серии (дни подряд и серию
 * правильных ответов), историю тренировок, ошибки и адаптивные данные
 * по каждому вопросу, а также за сохранение в localStorage.
 *
 * Хранит:
 *   xp / totalQuestions / correct / wrong      — общие счётчики
 *   streak / lastTrainingDate                  — серия тренировочных дней
 *   bestTime / avgTime                         — время ответа
 *   maxStreak                                  — максимальная серия правильных ответов
 *   trainingsCount                             — количество завершённых тренировок
 *   history                                    — последние тренировки (дата, режим, счёт, XP…)
 *   categoryStats / difficultyStats            — агрегаты по категориям и сложности
 *   mistakes                                   — последние ошибки («Мои ошибки»)
 *   questionStats                              — статистика по каждому вопросу
 *                                               (основа для адаптивной сложности)
 */
(function () {
  const Config = window.GeoMind.Config;
  const Storage = window.GeoMind.Storage;

  const DEFAULT_STATS = {
    xp: 0,
    totalQuestions: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    lastTrainingDate: null,
    bestTime: null,
    avgTime: null,
    maxStreak: 0,           // лучшая серия правильных ответов подряд
    trainingsCount: 0,      // число завершённых тренировок
    history: [],
    categoryStats: {},
    difficultyStats: {},
    mistakes: [],
    questionStats: {},
  };

  const MISTAKES_LIMIT = 30;

  function todayStr() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function daysBetween(a, b) {
    const ms = new Date(b) - new Date(a);
    return Math.round(ms / 86400000);
  }

  // Загружаем сохранённое и защищаемся от битых/устаревших данных
  const stats = Object.assign({}, DEFAULT_STATS, Storage.load(Config.STORAGE_KEY, {}));
  stats.xp = Number(stats.xp) || 0;
  stats.totalQuestions = Number(stats.totalQuestions) || 0;
  stats.correct = Number(stats.correct) || 0;
  stats.wrong = Number(stats.wrong) || 0;
  stats.streak = Number(stats.streak) || 0;
  stats.maxStreak = Number(stats.maxStreak) || 0;
  stats.trainingsCount = Number(stats.trainingsCount) || 0;
  if (!Array.isArray(stats.history)) stats.history = [];
  if (!Array.isArray(stats.mistakes)) stats.mistakes = [];
  if (!stats.categoryStats || typeof stats.categoryStats !== "object") stats.categoryStats = {};
  if (!stats.difficultyStats || typeof stats.difficultyStats !== "object") stats.difficultyStats = {};
  if (!stats.questionStats || typeof stats.questionStats !== "object") stats.questionStats = {};

  /** Добавляет один отвеченный вопрос в агрегат (категория/сложность). */
  function accumulate(map, key, correct, elapsedSec) {
    if (!key) return;
    const rec = map[key] || (map[key] = { questions: 0, correct: 0, wrong: 0, totalSec: 0 });
    rec.questions += 1;
    if (correct) rec.correct += 1;
    else rec.wrong += 1;
    rec.totalSec += elapsedSec;
  }

  window.GeoMind.Stats = {
    /** Текущее состояние статистики (живой объект). */
    get() {
      return stats;
    },

    /** Точность в процентах, 0 если вопросов ещё не было. */
    accuracy() {
      if (!stats.totalQuestions) return 0;
      return Math.round((stats.correct / stats.totalQuestions) * 100);
    },

    /**
     * Итог по категории/сложности из агрегатов.
     * Возвращает { questions, correct, wrong, accuracy, avgTime }.
     */
    groupInfo(map, key) {
      const rec = map[key];
      if (!rec || !rec.questions) {
        return { questions: 0, correct: 0, wrong: 0, accuracy: null, avgTime: null };
      }
      const totalSec = rec.totalSec == null ? rec.totalMs : rec.totalSec; // совместимость со старыми данными
      return {
        questions: rec.questions,
        correct: rec.correct,
        wrong: rec.wrong,
        accuracy: Math.round((rec.correct / rec.questions) * 100),
        avgTime: totalSec / rec.questions,
      };
    },

    save() {
      Storage.save(Config.STORAGE_KEY, stats);
    },

    /**
     * Фиксирует завершённую тренировку.
     * result: { correct, wrong, total, avgTime, xpEarned, maxStreak,
     *           category, difficulty, mode, isMistakes, perQuestion, mistakes }
     */
    recordTraining(result) {
      const today = todayStr();

      // XP и общие счётчики
      stats.xp += result.xpEarned;
      stats.correct += result.correct;
      stats.wrong += result.wrong;
      stats.totalQuestions += result.total;
      stats.trainingsCount += 1;

      // Среднее время по всем вопросам (взвешенное)
      const oldTotal = stats.totalQuestions - result.total;
      const oldSeconds = stats.avgTime == null ? 0 : stats.avgTime * oldTotal;
      stats.avgTime = oldTotal + result.total > 0
        ? (oldSeconds + result.avgTime * result.total) / (oldTotal + result.total)
        : null;

      // Лучшее среднее время за тренировку
      if (stats.bestTime == null || result.avgTime < stats.bestTime) {
        stats.bestTime = result.avgTime;
      }

      // Лучшая серия правильных ответов
      if (result.maxStreak > stats.maxStreak) {
        stats.maxStreak = result.maxStreak;
      }

      // Серия тренировочных дней
      if (stats.lastTrainingDate !== today) {
        if (stats.lastTrainingDate === null || daysBetween(stats.lastTrainingDate, today) > 1) {
          stats.streak = 1;
        } else {
          stats.streak += 1;
        }
        stats.lastTrainingDate = today;
      }

      // Агрегаты и статистика по вопросам (по каждому отвеченному вопросу)
      const perQuestion = Array.isArray(result.perQuestion) ? result.perQuestion : [];
      for (const q of perQuestion) {
        if (!q) continue;
        accumulate(stats.categoryStats, q.category, q.correct, q.elapsedSec);
        accumulate(stats.difficultyStats, q.difficulty, q.correct, q.elapsedSec);
        const rec = stats.questionStats[q.id] || (stats.questionStats[q.id] = { seen: 0, correct: 0 });
        rec.seen += 1;
        if (q.correct) rec.correct += 1;
      }

      // Ошибки («Мои ошибки») — новые сверху, без дублей одного вопроса
      const newMistakes = Array.isArray(result.mistakes) ? result.mistakes : [];
      const existingIds = new Set(stats.mistakes.map((m) => m.id));
      for (const m of newMistakes) {
        if (!m || existingIds.has(m.id)) continue;
        existingIds.add(m.id);
        stats.mistakes.unshift(m);
      }
      if (stats.mistakes.length > MISTAKES_LIMIT) {
        stats.mistakes.length = MISTAKES_LIMIT;
      }

      // История тренировок
      stats.history.push({
        date: today,
        ts: new Date().toISOString(),
        mode: result.mode || "classic",
        category: result.category ? result.category.id : "capitals",
        difficulty: result.difficulty ? result.difficulty.id : null,
        correct: result.correct,
        wrong: result.wrong,
        total: result.total,
        avgTime: result.avgTime,
        xpEarned: result.xpEarned,
        maxStreak: result.maxStreak,
      });
      if (stats.history.length > Config.HISTORY_LIMIT) stats.history.shift();

      this.save();
      return stats;
    },
  };
})();
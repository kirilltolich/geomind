/* GeoMind — движок тренировки.
 * Одна тренировка = серия уникальных вопросов по выбранным категории
 * и сложности. Поддерживаются режимы:
 *   classic   — фиксированное число вопросов (10/20/50)
 *   infinite  — бесконечный режим: вопросы идут кругами по пулу,
 *               пока пользователь сам не завершит тренировку
 *   mistakes  — повторение сохранённых ошибок (вопросы смешанных
 *               категорий и сложностей)
 *
 * Движок отвечает за порядок вопросов, замер времени ответа, серию
 * правильных ответов, подсчёт правильных/неправильных и начисление XP
 * (награда берётся из сложности конкретного вопроса). Ничего не знает
 * про интерфейс.
 */
(function () {
  const Config = window.GeoMind.Config;
  const Questions = window.GeoMind.Questions;
  const Difficulties = window.GeoMind.Difficulties;

  function diffOf(id) {
    return Difficulties.find((d) => d.id === id);
  }

  /**
   * category   — объект категории (id, emoji, title)
   * difficulty — объект сложности (id, xpPerCorrect, title)
   * opts       — { mode: "classic"|"infinite"|"mistakes", count?: N, questions?: [...] }
   *              Для mistakes вопросы передаются готовыми (смешанные),
   *              category/difficulty используются только для заголовка.
   */
  function createSession(category, difficulty, opts) {
    const options = opts || {};
    const mode = options.mode || "classic";
    const isMistakes = mode === "mistakes";

    let deck = options.questions
      || (mode === "infinite"
        ? Questions.buildDeck(category.id, difficulty.id)
        : Questions.build(category.id, difficulty.id, options.count || Config.QUESTIONS_PER_TRAINING));

    let index = 0;
    let questionStart = null;
    let correctCount = 0;
    let wrongCount = 0;
    let xpEarned = 0;
    let totalTimeMs = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let finished = false;
    const perQuestion = [];
    const mistakes = [];

    function current() {
      if (index >= deck.length) {
        // Бесконечный режим: пул закончился — начинаем новый круг
        if (mode === "infinite") {
          deck = Questions.buildDeck(category.id, difficulty.id);
          index = 0;
        } else {
          return null;
        }
      }
      return deck[index];
    }

    return {
      get index() {
        return index;
      },
      get total() {
        // Классика — запланированное число вопросов; бесконечный — уже отвеченные
        return mode === "infinite" ? correctCount + wrongCount : deck.length;
      },
      get isLast() {
        return mode !== "infinite" && index === deck.length - 1;
      },
      get xpEarned() {
        return xpEarned;
      },
      get currentStreak() {
        return currentStreak;
      },
      get maxStreak() {
        return maxStreak;
      },
      get answeredCount() {
        return correctCount + wrongCount;
      },
      get correctCount() {
        return correctCount;
      },
      get avgTimeNow() {
        return answeredCount ? totalTimeMs / answeredCount / 1000 : null;
      },
      get mode() {
        return mode;
      },
      get category() {
        return category;
      },
      get difficulty() {
        return difficulty;
      },
      get isMistakes() {
        return isMistakes;
      },

      /** Текущий вопрос. */
      current: current,

      /** Запуск замера времени на текущий вопрос. */
      startTimer() {
        questionStart = performance.now();
      },

      /**
       * Фиксирует ответ. Возвращает null, если вопрос уже отвечен
       * (защита от повторного ответа и повторного начисления XP).
       */
      answer(optionIndex) {
        const q = current();
        if (!q || q.answered || finished) return null;

        const elapsedMs = performance.now() - questionStart;
        q.answered = true;

        const isCorrect = q.options[optionIndex] === q.correctText;
        const reward = isCorrect ? (diffOf(q.difficulty) || { xpPerCorrect: 0 }).xpPerCorrect : 0;

        totalTimeMs += elapsedMs;
        if (isCorrect) {
          correctCount += 1;
          xpEarned += reward;
          currentStreak += 1;
        } else {
          wrongCount += 1;
          currentStreak = 0;
          mistakes.push({
            category: q.category,
            difficulty: q.difficulty,
            country: q.country,
            flag: q.flag,
            promptText: q.promptText,
            correctText: q.correctText,
            correctLabel: q.correctLabel,
            wrongAnswer: q.options[optionIndex],
            ts: new Date().toISOString(),
          });
        }
        if (currentStreak > maxStreak) maxStreak = currentStreak;

        perQuestion.push({
          id: q.id,
          category: q.category,
          difficulty: q.difficulty,
          correct: isCorrect,
          elapsedSec: elapsedMs / 1000,
          reward: reward,
        });

        return {
          isCorrect: isCorrect,
          correctText: q.correctText,
          correctLabel: q.correctLabel,
          flag: q.flag,
          optionIndex: optionIndex,
          elapsedSec: elapsedMs / 1000,
          reward: reward,
        };
      },

      /** Переход к следующему вопросу (в бесконечном режиме — следующий круг при необходимости). */
      advance() {
        index += 1;
      },

      /** Итог тренировки для сохранения статистики (можно вызвать один раз). */
      finish() {
        if (finished) return null;
        finished = true;
        const answered = correctCount + wrongCount;
        return {
          correct: correctCount,
          wrong: wrongCount,
          total: answered,
          avgTime: answered ? totalTimeMs / answered / 1000 : 0,
          xpEarned: xpEarned,
          maxStreak: maxStreak,
          category: category,
          difficulty: difficulty,
          mode: mode,
          isMistakes: isMistakes,
          perQuestion: perQuestion,
          mistakes: mistakes,
        };
      },
    };
  }

  window.GeoMind.Training = { createSession: createSession };
})();
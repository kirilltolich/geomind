/* GeoMind — генератор вопросов.
 * Категория и сложность — независимые параметры. Для каждой категории
 * существует своя база записей с полем difficulty:
 *   capitals — страны/столицы (Data.CAPITALS)
 *   flags    — страны/флаги (Data.FLAGS)
 *
 * У каждого вопроса есть вариант (variant), чтобы тренировка не была
 * однообразной:
 *   capitals variant "a": «Какая столица у …?»       (варианты — столицы)
 *   capitals variant "b": «… — столица какой страны?» (варианты — страны)
 *   flags    variant "a": «Какой стране принадлежит этот флаг?»
 *                         (варианты — страны, показывается SVG-флаг)
 *   flags    variant "b": «Какой флаг принадлежит …?»
 *                         (варианты — страны, отображаются SVG-флагами)
 *
 * ВАЖНО: значения вариантов — всегда НАЗВАНИЯ стран или столиц.
 * Unicode-флаги не используются ни в данных, ни в вариантах ответа.
 * Флаг рисуется слоем отображения (js/lib/flag-image.js) из локального
 * SVG по ISO-коду страны.
 *
 * Структура вопроса (общая для всех категорий и режимов):
 *   { id, category, difficulty, variant, country, promptText,
 *     showFlag, optionType ("text"|"flag"), options,
 *     correctIndex, correctText, correctLabel }
 *
 *   showFlag   — показывать ли SVG-флаг в карточке вопроса. Он скрыт,
 *                когда флаг и есть правильный ответ (иначе вопрос был бы
 *                подсказан сам себе).
 *   optionType — как рисовать варианты: текстом или флагами.
 *
 * Отвлекающие варианты берутся из «зоны сложности» выбранного уровня:
 *   easy   — только лёгкие (самые очевидные)
 *   medium — только средние (похожие флаги/столицы-соседи)
 *   hard   — средние и сложные (редкие и легко перепутываемые)
 */
(function () {
  const Data = window.GeoMind.Data;
  const CAPITALS = Data.CAPITALS;
  const FLAGS = Data.FLAGS;

  const SCOPES = {
    capitals: { easy: ["easy"], medium: ["medium"], hard: ["medium", "hard"] },
    flags:    { easy: ["easy"], medium: ["medium"], hard: ["medium", "hard"] },
  };

  const BANKS = {
    capitals: { entries: CAPITALS },
    flags:    { entries: FLAGS },
  };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function scopeEntries(categoryId, difficultyId) {
    const bank = BANKS[categoryId];
    if (!bank) return [];
    const scope = SCOPES[categoryId][difficultyId] || [difficultyId];
    return bank.entries.filter((e) => scope.includes(e.difficulty));
  }

  function findEntry(categoryId, country) {
    const bank = BANKS[categoryId];
    if (!bank) return null;
    return bank.entries.find((e) => e.country === country) || null;
  }

  /** Уникальные значения-отвлекающие варианты из зоны сложности. */
  function pickValues(poolEntries, valueOf, exclude, count) {
    const seen = new Set();
    const out = [];
    for (const entry of shuffle(poolEntries)) {
      if (out.length >= count) break;
      const value = valueOf(entry);
      if (value === exclude || seen.has(value)) continue;
      seen.add(value);
      out.push(value);
    }
    return out;
  }

  /**
   * Собирает вопрос из записи базы. entry — запись, variant — "a"|"b".
   * Награда за вопрос не зашита в вопрос: она берётся из уровня сложности
   * (data/difficulties.js), что позволяет в будущем менять награды без
   * пересборки вопросов.
   */
  function buildQuestion(categoryId, entry, difficultyId, variant) {
    const isFlags = categoryId === "flags";

    if (isFlags) {
      if (variant === "b") {
        // Какой флаг принадлежит Германии?
        // Варианты — страны, но рисуются флагами (optionType: "flag").
        // Флаг в карточке вопроса скрыт: он и есть правильный ответ.
        const distractors = pickValues(
          scopeEntries(categoryId, difficultyId),
          (e) => e.country,
          entry.country,
          3,
        );
        const options = shuffle([entry.country, ...distractors]);
        return {
          id: `flags:${entry.country}`,
          category: "flags",
          difficulty: difficultyId,
          variant: "b",
          country: entry.country,
          code: entry.code,
          promptText: `Какой флаг принадлежит ${entry.gen}?`,
          showFlag: false,
          optionType: "flag",
          options: options,
          correctIndex: options.indexOf(entry.country),
          correctText: entry.country,
          correctLabel: entry.country,
        };
      }

      // Какой стране принадлежит этот флаг?
      // Варианты — страны текстом, в карточке вопроса — сам флаг.
      const distractors = pickValues(
        scopeEntries(categoryId, difficultyId),
        (e) => e.country,
        entry.country,
        3,
      );
      const options = shuffle([entry.country, ...distractors]);
      return {
        id: `flags:${entry.country}`,
        category: "flags",
        difficulty: difficultyId,
        variant: "a",
        country: entry.country,
        code: entry.code,
        promptText: "Какой стране принадлежит этот флаг?",
        showFlag: true,
        optionType: "text",
        options: options,
        correctIndex: options.indexOf(entry.country),
        correctText: entry.country,
        correctLabel: entry.country,
      };
    }

    if (variant === "b") {
      // Токио — столица какой страны?
      // вариант ответа — страна, поэтому флаг в карточке скрыт.
      const distractors = pickValues(
        scopeEntries(categoryId, difficultyId),
        (e) => e.country,
        entry.country,
        3,
      );
      const options = shuffle([entry.country, ...distractors]);
      return {
        id: `capitals:${entry.country}`,
        category: "capitals",
        difficulty: difficultyId,
        variant: "b",
        country: entry.country,
        code: entry.code,
        promptText: `${entry.capital} — столица какой страны?`,
        showFlag: false,
        optionType: "text",
        options: options,
        correctIndex: options.indexOf(entry.country),
        correctText: entry.country,
        correctLabel: entry.country,
      };
    }

    // Какая столица у …? — флаг страны показан как подсказка,
    // вариант ответа — сама столица.
    const distractors = pickValues(
      scopeEntries(categoryId, difficultyId),
      (e) => e.capital,
      entry.capital,
      3,
    );
    const options = shuffle([entry.capital, ...distractors]);
    return {
      id: `capitals:${entry.country}`,
      category: "capitals",
      difficulty: difficultyId,
      variant: "a",
      country: entry.country,
      code: entry.code,
      promptText: `Какая столица у ${entry.gen}?`,
      showFlag: true,
      optionType: "text",
      options: options,
      correctIndex: options.indexOf(entry.capital),
      correctText: entry.capital,
      correctLabel: entry.capital,
    };
  }

  function randomVariant() {
    return Math.random() < 0.5 ? "a" : "b";
  }

  window.GeoMind.Questions = {
    /**
     * Классическая тренировка: `count` уникальных вопросов
     * для категории и сложности, со случайными вариантами.
     */
    build(categoryId, difficultyId, count) {
      const bank = BANKS[categoryId];
      if (!bank) return [];
      const entries = shuffle(bank.entries.filter((e) => e.difficulty === difficultyId)).slice(0, count);
      return entries.map((e) => buildQuestion(categoryId, e, difficultyId, randomVariant()));
    },

    /**
     * Бесконечный режим: полный перемешанный «круг» вопросов уровня.
     * Когда круг закончится, движок попросит новый — так вопросы
     * повторяются только после прохождения всего доступного пула.
     */
    buildDeck(categoryId, difficultyId) {
      const bank = BANKS[categoryId];
      if (!bank) return [];
      const entries = shuffle(bank.entries.filter((e) => e.difficulty === difficultyId));
      return entries.map((e) => buildQuestion(categoryId, e, difficultyId, randomVariant()));
    },

    /**
     * Тренировка «Мои ошибки»: вопросы перестраиваются по сохранённым
     * записям об ошибках (у каждой ошибки свои категория и сложность,
     * поэтому варианты и порядок генерируются заново).
     */
    buildFromMistakes(mistakes) {
      const out = [];
      for (const m of mistakes) {
        if (!m || !m.category || !m.country) continue;
        const entry = findEntry(m.category, m.country);
        if (!entry) continue;
        out.push(buildQuestion(m.category, entry, m.difficulty || "medium", randomVariant()));
      }
      return out;
    },
  };
})();

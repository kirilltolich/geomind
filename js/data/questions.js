/* GeoMind — генератор вопросов.
 * Категория и сложность — независимые параметры. Для каждой категории
 * существует своя база записей с полем difficulty:
 *   capitals — страны/столицы (Data.CAPITALS)
 *   flags    — страны/флаги (Data.FLAGS)
 *
 * У каждого вопроса есть вариант (variant), чтобы тренировка не была
 * однообразной:
 *   capitals variant "a": «Какая столица у …?»      (варианты — столицы)
 *   capitals variant "b": «… — столица какой страны?» (варианты — страны)
 *   flags    variant "a": «Какой стране принадлежит этот флаг?» (варианты — страны)
 *   flags    variant "b": «Какой флаг принадлежит …?» (варианты — флаги)
 *
 * Структура вопроса (общая для всех категорий и режимов):
 *   { id, category, difficulty, variant, flag, country, promptText,
 *     optionType ("text"|"flag"), options, correctIndex, correctText, correctLabel }
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
        // Какой флаг принадлежит Германии? → варианты — флаги
        const distractors = pickValues(
          scopeEntries(categoryId, difficultyId),
          (e) => e.flag,
          entry.flag,
          3,
        );
        const options = shuffle([entry.flag, ...distractors]);
        return {
          id: `flags:${entry.country}`,
          category: "flags",
          difficulty: difficultyId,
          variant: "b",
          flag: entry.flag,
          country: entry.country,
          promptText: `Какой флаг принадлежит ${entry.country}?`,
          optionType: "flag",
          options: options,
          correctIndex: options.indexOf(entry.flag),
          correctText: entry.flag,
          correctLabel: `${entry.country} ${entry.flag}`,
        };
      }
      // Какой стране принадлежит этот флаг? → варианты — страны
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
        flag: entry.flag,
        country: entry.country,
        promptText: "Какой стране принадлежит этот флаг?",
        optionType: "text",
        options: options,
        correctIndex: options.indexOf(entry.country),
        correctText: entry.country,
        correctLabel: `${entry.country} ${entry.flag}`,
      };
    }

    if (variant === "b") {
      // Токио — столица какой страны? → варианты — страны
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
        flag: entry.flag,
        country: entry.country,
        promptText: `${entry.capital} — столица какой страны?`,
        optionType: "text",
        options: options,
        correctIndex: options.indexOf(entry.country),
        correctText: entry.country,
        correctLabel: `${entry.country} ${entry.flag}`,
      };
    }

    // Какая столица у …? → варианты — столицы
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
      flag: entry.flag,
      country: entry.country,
      promptText: `Какая столица у ${entry.gen}?`,
      optionType: "text",
      options: options,
      correctIndex: options.indexOf(entry.capital),
      correctText: entry.capital,
      correctLabel: `${entry.capital} ${entry.flag}`,
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
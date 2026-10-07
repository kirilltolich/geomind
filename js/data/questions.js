/* GeoMind — генератор вопросов.
 * Категория и сложность — независимые параметры. Для каждой категории
 * существует своя база записей с полем difficulty:
 *   capitals   — страны/столицы (Data.CAPITALS)
 *   flags      — страны/флаги (Data.FLAGS)
 *   currencies — страны/валюты (Data.CURRENCIES)
 *
 * У каждого вопроса есть вариант (variant), чтобы тренировка не была
 * однообразной:
 *   capitals   "a": «Какая столица у …?»       (варианты — столицы)
 *   capitals   "b": «… — столица какой страны?» (варианты — страны)
 *   flags      "a": «Какой стране принадлежит этот флаг?»
 *                   (варианты — страны, в карточке — SVG-флаг)
 *   flags      "b": «Какой флаг принадлежит …?»
 *                   (варианты — страны, отображаются SVG-флагами)
 *   currencies "a": «Какая валюта у …?»             (варианты — валюты)
 *   currencies "b": «Какая страна использует валюту «…»?» (варианты — страны)
 *   currencies "c": «Какой международный код у валюты …?» (варианты — коды)
 *
 * ВАЖНО: значения вариантов — всегда НАЗВАНИЯ (стран, столиц, валют) или
 * коды валют. Unicode-флаги не используются ни в данных, ни в вариантах
 * ответа: флаг рисуется слоем отображения (js/lib/flag-image.js) из
 * локального SVG по ISO-коду страны.
 *
 * Структура вопроса (общая для всех категорий и режимов):
 *   { id, category, difficulty, variant, country, flagCode, promptText,
 *     showFlag, showCountryName, currencyFacts, optionType ("text"|"flag"),
 *     options, correctIndex, correctText, correctLabel }
 *
 *   showFlag        — показывать ли SVG-флаг в карточке вопроса. Он скрыт,
 *                     когда флаг и есть правильный ответ.
 *   showCountryName — показывать ли название страны над вопросом.
 *   currencyFacts   — чипы «название / код / символ» в карточке вопроса.
 *                     Код или символ не показываются, если они выдают ответ.
 *
 * Отвлекающие варианты берутся из «зоны сложности» выбранного уровня,
 * причём сначала — из того же региона, что и страна вопроса: так варианты
 * получаются правдоподобными (валюты соседей), а не случайными.
 *   easy   — только лёгкие (самые очевидные)
 *   medium — только средние (похожие валюты/столицы-соседи)
 *   hard   — средние и сложные (редкие и легко перепутываемые)
 */
(function () {
  const Data = window.GeoMind.Data;
  const CAPITALS = Data.CAPITALS;
  const FLAGS = Data.FLAGS;
  const CURRENCIES = Data.CURRENCIES;

  const SCOPES = {
    capitals:   { easy: ["easy"], medium: ["medium"], hard: ["medium", "hard"] },
    flags:      { easy: ["easy"], medium: ["medium"], hard: ["medium", "hard"] },
    currencies: { easy: ["easy"], medium: ["medium"], hard: ["medium", "hard"] },
  };

  const BANKS = {
    capitals:   { entries: CAPITALS },
    flags:      { entries: FLAGS },
    currencies: { entries: CURRENCIES },
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

  /** Все коды валюты записи (у большинства стран один). */
  function codesOf(entry) {
    if (Array.isArray(entry.codes) && entry.codes.length) return entry.codes;
    return [entry.code];
  }

  /**
   * Страны базы, у которых отображаемое имя валюты совпадает с данным.
   *
   * Названия валют нейтральные («Доллар», «Песо», «Фунт»), поэтому одно имя
   * носит сразу много стран. Вопрос «какая страна использует валюту «…»?»
   * корректен, только если имя принадлежит ровно одной стране базы, — иначе
   * верных ответов было бы несколько.
   */
  function countriesWithName(name) {
    const set = new Set();
    for (const e of CURRENCIES) {
      if (e.currency === name) set.add(e.country);
    }
    return set;
  }

  /**
   * Правдоподобные варианты ответа.
   * Сначала берём записи того же региона, затем — остальные, чтобы всегда
   * набрать нужное количество вариантов.
   */
  function pickDistractors(pool, valueOf, excludeValue, count, preferRegion, filter) {
    const seen = new Set([excludeValue]);
    const out = [];
    const shuffled = shuffle(pool);
    const ordered = preferRegion
      ? shuffled.filter((e) => e.region === preferRegion).concat(shuffled.filter((e) => e.region !== preferRegion))
      : shuffled;
    for (const entry of ordered) {
      if (out.length >= count) break;
      if (filter && !filter(entry)) continue;
      const value = valueOf(entry);
      if (value == null || value === "" || seen.has(value)) continue;
      seen.add(value);
      out.push(value);
    }
    return out;
  }

  /* ── Подготовка данных валют один раз при загрузке ── */

  /** Символ валюты, который не выдаёт её код (например, «ZiG» выдаёт ZWG). */
  function symbolIsSafe(symbol) {
    if (!symbol) return false;
    return !/^[A-Za-z0-9]+$/.test(symbol.trim());
  }

  /**
   * Вопрос «Какая валюта у …?» — варианты: названия валют.
   *
   * Формулировка с «у» + родительным падежом выбрана намеренно:
   * родительный падеж уже есть у всех стран в данных, а «в …» потребовало
   * бы предложного падежа («в Парагвае»), которого в базе нет — иначе
   * получалось бы «в Парагвая». Так же построена категория «Столицы»
   * («Какая столица у Японии?»).
   */
  function currencyNameQuestion(entry, difficultyId) {
    const own = codesOf(entry);
    const distractors = pickDistractors(
      scopeEntries("currencies", difficultyId),
      (e) => e.currency,
      entry.currency,
      3,
      entry.region,
      // не предлагаем валюту, которая тоже ходит в этой стране
      (e) => !codesOf(e).some((c) => own.includes(c)),
    );
    const options = shuffle([entry.currency, ...distractors]);
    return {
      id: `currencies:${entry.country}`,
      category: "currencies",
      difficulty: difficultyId,
      variant: "a",
      country: entry.country,
      flagCode: null,
      promptText: `Какая валюта у ${entry.gen}?`,
      showFlag: true,
      showCountryName: true,
      currencyFacts: null,
      optionType: "text",
      options: options,
      correctIndex: options.indexOf(entry.currency),
      correctText: entry.currency,
      correctLabel: currencyLabel(entry),
    };
  }

  /**
   * Вопрос «Какая страна использует валюту «…»?» — варианты: страны.
   *
   * Спрашивается только про валюты с уникальным именем (см. pickCurrencyVariant),
   * иначе у вопроса было бы несколько правильных ответов.
   */
  function currencyCountryQuestion(entry, difficultyId) {
    // Название валюты — это уже подсказка, поэтому код и символ показываем,
    // а страну и её флаг — нет (они и есть ответ).
    const facts = [];
    facts.push({ kind: "code", value: entry.code });
    if (entry.symbol) facts.push({ kind: "symbol", value: entry.symbol });

    const distractors = pickDistractors(
      scopeEntries("currencies", difficultyId),
      (e) => e.country,
      entry.country,
      3,
      entry.region,
    );
    const options = shuffle([entry.country, ...distractors]);
    return {
      id: `currencies:${entry.country}`,
      category: "currencies",
      difficulty: difficultyId,
      variant: "b",
      country: entry.country,
      flagCode: null,
      promptText: `Какая страна использует валюту «${entry.currency}»?`,
      showFlag: false,
      showCountryName: false,
      currencyFacts: facts,
      optionType: "text",
      options: options,
      correctIndex: options.indexOf(entry.country),
      correctText: entry.country,
      correctLabel: currencyLabel(entry),
    };
  }

  /** Вопрос «Какой международный код у валюты …?» — варианты: коды. */
  function currencyCodeQuestion(entry, difficultyId) {
    // Название валюты показать можно, код — нельзя: он и есть ответ.
    // Символ показываем только если он не выдаёт код (₸ можно, ZiG — нет).
    const facts = [{ kind: "name", value: entry.currency }];
    if (symbolIsSafe(entry.symbol)) facts.push({ kind: "symbol", value: entry.symbol });

    const distractors = pickDistractors(
      scopeEntries("currencies", difficultyId),
      (e) => e.code,
      entry.code,
      3,
      entry.region,
      (e) => codesOf(e).length === 1,
    );
    const options = shuffle([entry.code, ...distractors]);
    return {
      id: `currencies:${entry.country}`,
      category: "currencies",
      difficulty: difficultyId,
      variant: "c",
      country: entry.country,
      flagCode: null,
      promptText: `Какой международный код у валюты ${entry.gen}?`,
      showFlag: true,
      showCountryName: true,
      currencyFacts: facts,
      optionType: "text",
      options: options,
      correctIndex: options.indexOf(entry.code),
      correctText: entry.code,
      correctLabel: currencyLabel(entry),
    };
  }

  /** «Япония — Японская иена (JPY)» */
  function currencyLabel(entry) {
    const codes = codesOf(entry);
    const codePart = codes.length > 1 ? ` (${codes.join(" / ")})` : ` (${entry.code})`;
    return `${entry.country} — ${entry.currency}${codePart}`;
  }

  /**
   * Выбирает тип вопроса для валюты.
   *   «b» — «какая страна использует валюту «…»?»: только если это имя валюты
   *         носит ровно одна страна базы (нейтральные «Доллар», «Песо»,
   *         «Евро» носят многие — такой вопрос имел бы несколько ответов);
   *   «c» — только если у страны один код валюты.
   */
  function pickCurrencyVariant(entry) {
    const codes = codesOf(entry);
    const pool = ["a", "a", "a"];

    const ownersByName = countriesWithName(entry.currency);
    if (codes.length === 1 && ownersByName.size === 1 && !entry.multiCountry) {
      pool.push("b", "b");
    }
    if (codes.length === 1) {
      pool.push("c", "c");
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Собирает вопрос из записи базы. entry — запись, variant — тип вопроса.
   */
  function buildQuestion(categoryId, entry, difficultyId, variant) {
    /* ————— Валюты ————— */
    if (categoryId === "currencies") {
      let q;
      if (variant === "b") q = currencyCountryQuestion(entry, difficultyId);
      else if (variant === "c") q = currencyCodeQuestion(entry, difficultyId);
      else q = currencyNameQuestion(entry, difficultyId);
      // Имя валюты отдельным полем: correctText для вариантов «b»/«c» —
      // это страна/код, а по имени проверяется однозначность вопроса.
      q.currencyName = entry.currency;
      return q;
    }

    /* ————— Флаги ————— */
    if (categoryId === "flags") {
      if (variant === "b") {
        // Какой флаг принадлежит Германии?
        // Варианты — страны, но рисуются флагами (optionType: "flag").
        const distractors = pickDistractors(
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
          flagCode: entry.code,
          promptText: `Какой флаг принадлежит ${entry.gen}?`,
          showFlag: false,
          showCountryName: false,
          currencyFacts: null,
          optionType: "flag",
          options: options,
          correctIndex: options.indexOf(entry.country),
          correctText: entry.country,
          correctLabel: entry.country,
        };
      }

      // Какой стране принадлежит этот флаг?
      const distractors = pickDistractors(
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
        flagCode: entry.code,
        promptText: "Какой стране принадлежит этот флаг?",
        showFlag: true,
        showCountryName: false,
        currencyFacts: null,
        optionType: "text",
        options: options,
        correctIndex: options.indexOf(entry.country),
        correctText: entry.country,
        correctLabel: entry.country,
      };
    }

    /* ————— Страны и столицы ————— */
    if (variant === "b") {
      // Токио — столица какой страны?
      const distractors = pickDistractors(
        scopeEntries("capitals", difficultyId),
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
        flagCode: entry.code,
        promptText: `${entry.capital} — столица какой страны?`,
        showFlag: false,
        showCountryName: false,
        currencyFacts: null,
        optionType: "text",
        options: options,
        correctIndex: options.indexOf(entry.country),
        correctText: entry.country,
        correctLabel: entry.country,
      };
    }

    // Какая столица у …?
    const distractors = pickDistractors(
      scopeEntries("capitals", difficultyId),
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
      flagCode: entry.code,
      promptText: `Какая столица у ${entry.gen}?`,
      showFlag: true,
      showCountryName: false,
      currencyFacts: null,
      optionType: "text",
      options: options,
      correctIndex: options.indexOf(entry.capital),
      correctText: entry.capital,
      correctLabel: entry.capital,
    };
  }

  function pickVariant(categoryId, entry) {
    if (categoryId === "currencies") return pickCurrencyVariant(entry);
    return Math.random() < 0.5 ? "a" : "b";
  }

  window.GeoMind.Questions = {
    /**
     * Классическая тренировка: `count` уникальных вопросов
     * для категории и сложности, со случайными типами.
     */
    build(categoryId, difficultyId, count) {
      const bank = BANKS[categoryId];
      if (!bank) return [];
      const entries = shuffle(bank.entries.filter((e) => e.difficulty === difficultyId)).slice(0, count);
      return entries.map((e) => buildQuestion(categoryId, e, difficultyId, pickVariant(categoryId, e)));
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
      return entries.map((e) => buildQuestion(categoryId, e, difficultyId, pickVariant(categoryId, e)));
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
        out.push(buildQuestion(m.category, entry, m.difficulty || "medium", pickVariant(m.category, entry)));
      }
      return out;
    },
  };
})();

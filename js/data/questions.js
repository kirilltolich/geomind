/* GeoMind — генератор вопросов.
 * Категория и сложность — независимые параметры. Для каждой категории
 * существует своя база записей с полем difficulty:
 *   capitals   — страны/столицы (Data.CAPITALS)
 *   flags      — страны/флаги (Data.FLAGS)
 *   currencies — страны/валюты (Data.CURRENCIES)
 *   autocodes  — регионы России/автомобильные коды (Data.AUTOCODES)
 *   russian-regions — субъекты РФ/административные центры (Data.RUSSIAN_REGIONS)
 *
 * «Автокоды» — единственная категория БЕЗ деления по сложности:
 *   все регионы одинаково сложны и дают одинаковую награду, поэтому вопросы
 *   собираются из всей базы, а в поле difficulty стоит единый уровень
 *   "uniform" (см. js/data/difficulties.js).
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
 *   autocodes  "a": «Какому региону принадлежит код «…»?»
 *                   (в карточке — номерной знак, варианты — регионы)
 *   autocodes  "b": «Какой код у региона «…»?»
 *                   (варианты — коды, отображаются номерными знаками)
 *   russian-regions "a": «Какой административный центр у …?»
 *                        (у республик — «Какая столица у …?»; варианты — центры)
 *   russian-regions "b": «У какого региона России административный центр — …?»
 *                        (варианты — субъекты Федерации)
 *
 * «Регионы России»: у городов федерального значения нет отдельного
 * административного центра (center совпадает с названием), поэтому они
 * остаются в справочнике, но не порождают вопросов. Вопрос «центр → регион»
 * строится только там, где центр однозначно принадлежит одному субъекту
 * (Москва — центр и Московской области, и города Москвы, поэтому такой
 * вопрос не задаётся).
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
 *   plate           — автомобильный код-номер в карточке вопроса (autocodes).
 *                     Как и флаг, скрыт, когда код и есть правильный ответ.
 *   optionType "plate" — варианты-коды рисуются маленькими номерными знаками.
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
  const AUTOCODES = Data.AUTOCODES || [];
  const REGIONS = Data.RUSSIAN_REGIONS || [];

  const SCOPES = {
    capitals:   { easy: ["easy"], medium: ["medium"], hard: ["medium", "hard"] },
    flags:      { easy: ["easy"], medium: ["medium"], hard: ["medium", "hard"] },
    currencies: { easy: ["easy"], medium: ["medium"], hard: ["medium", "hard"] },
    "russian-regions": { easy: ["easy"], medium: ["medium"], hard: ["medium", "hard"] },
    // autocodes — без уровней: вопросы берутся из всей базы (см. AUTOCODES)
  };

  /** Единый уровень для категорий без деления по сложности. */
  const UNIFORM_DIFFICULTY = "uniform";

  /** Категории, где нет уровней и всегда используется вся база. */
  const NO_LEVELS = new Set(["autocodes"]);

  /* key — поле записи, по которому она ищется в «Моих ошибках»:
     у всех стран это country, у регионов России — region. */
  const BANKS = {
    capitals:   { entries: CAPITALS, key: "country" },
    flags:      { entries: FLAGS, key: "country" },
    currencies: { entries: CURRENCIES, key: "country" },
    autocodes:  { entries: AUTOCODES, key: "region" },
    "russian-regions": { entries: REGIONS, key: "name" },
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
    // Категории без уровней используют всю базу сразу
    if (NO_LEVELS.has(categoryId)) return bank.entries;
    const scope = SCOPES[categoryId][difficultyId] || [difficultyId];
    return bank.entries.filter((e) => scope.includes(e.difficulty));
  }

  function findEntry(categoryId, country) {
    const bank = BANKS[categoryId];
    if (!bank) return null;
    const key = bank.key || "country";
    return bank.entries.find((e) => e[key] === country) || null;
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
  function pickDistractors(pool, valueOf, excludeValue, count, preferRegion, filter, regionField) {
    const seen = new Set([excludeValue]);
    const out = [];
    const shuffled = shuffle(pool);
    const rField = regionField || "region";
    const ordered = preferRegion
      ? shuffled.filter((e) => e[rField] === preferRegion).concat(shuffled.filter((e) => e[rField] !== preferRegion))
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

  /* ─────────────────────────────────────────
     Автомобильные коды регионов России.

     Запись базы: { region, codes: ["77", …], district, difficulty }.
     codes[0] — основной код региона (он и участвует в вопросах).
     ───────────────────────────────────────── */

  /**
   * Вопрос «Какому региону принадлежит код «77»?» — варианты: регионы.
   * Номерной знак с кодом — главный визуальный элемент (plate).
   */
  function autocodeRegionQuestion(entry) {
    const plate = entry.codes[0];
    const distractors = pickDistractors(
      scopeEntries("autocodes"),
      (e) => e.region,
      entry.region,
      3,
      entry.district,
      null,
      "district",
    );
    const options = shuffle([entry.region, ...distractors]);
    return {
      id: `autocodes:${entry.region}`,
      category: "autocodes",
      difficulty: UNIFORM_DIFFICULTY,
      variant: "a",
      country: entry.region,
      flagCode: null,
      code: plate,
      plate: plate,
      promptText: `Какому региону принадлежит код «${plate}»?`,
      showFlag: false,
      showCountryName: false,
      currencyFacts: null,
      optionType: "text",
      options: options,
      correctIndex: options.indexOf(entry.region),
      correctText: entry.region,
      correctLabel: `${entry.region} — ${plate}`,
    };
  }

  /**
   * Вопрос «Какой код у региона «Москва»?» — варианты: коды.
   *
   * У региона может быть несколько кодов, но среди вариантов ответа
   * оказывается ровно один его код: отвлекающие берутся только у других
   * регионов, поэтому вопрос имеет единственный верный ответ.
   */
  function autocodeCodeQuestion(entry) {
    const plate = entry.codes[0];
    const own = new Set(entry.codes);
    const distractors = pickDistractors(
      scopeEntries("autocodes"),
      (e) => e.codes[0],
      plate,
      3,
      entry.district,
      (e) => !e.codes.some((c) => own.has(c)),
      "district",
    );
    const options = shuffle([plate, ...distractors]);
    return {
      id: `autocodes:${entry.region}`,
      category: "autocodes",
      difficulty: UNIFORM_DIFFICULTY,
      variant: "b",
      country: entry.region,
      flagCode: null,
      code: plate,
      plate: null,
      promptText: `Какой код у региона «${entry.region}»?`,
      showFlag: false,
      showCountryName: false,
      currencyFacts: null,
      optionType: "plate",
      options: options,
      correctIndex: options.indexOf(plate),
      correctText: plate,
      correctLabel: `${entry.region} — ${plate}`,
    };
  }

  /** Случайный тип вопроса про автокод (оба типа равновероятны). */
  function pickAutocodeVariant() {
    return Math.random() < 0.5 ? "a" : "b";
  }

  /* ─────────────────────────────────────────
     Субъекты РФ и их административные центры.

     Запись базы:
       { id, name, gen, type, center, capital?, district, difficulty }

     Вопросы строятся не для всех записей:
       • города федерального значения (center === name) не имеют отдельного
         административного центра — центральные вопросы для них бессмысленны;
       • вопрос «центр → регион» задаётся только там, где центр однозначен:
         Москва и Санкт-Петербург — центры и городов, и областей, поэтому
         Московская и Ленинградская области участвуют только в вопросах
         «регион → центр».
     ───────────────────────────────────────── */

  /** Сколько субъектов имеют данный административный центр. */
  const centerOwners = new Map();
  for (const e of REGIONS) {
    centerOwners.set(e.center, (centerOwners.get(e.center) || 0) + 1);
  }
  const regionNames = new Set(REGIONS.map((e) => e.name));

  /** Уникален ли центр: ровно один субъект и это не название субъекта. */
  function hasUnambiguousCenter(entry) {
    return centerOwners.get(entry.center) === 1 && !regionNames.has(entry.center);
  }

  /** Порождает ли запись хотя бы один вопрос. */
  function isRegionQuizEntry(entry) {
    return entry.center !== entry.name || hasUnambiguousCenter(entry);
  }

  /** Случайный тип вопроса про регион, если доступны оба. */
  function pickRegionVariant(entry) {
    const canCenter = entry.center !== entry.name;
    const canRegion = hasUnambiguousCenter(entry);
    if (canCenter && canRegion) return Math.random() < 0.5 ? "a" : "b";
    return canCenter ? "a" : "b";
  }

  /**
   * Вопрос «Какой административный центр у …?» (у республик — столица).
   * Варианты — центры; сначала берём центры того же федерального округа.
   */
  function regionCenterQuestion(entry, difficultyId) {
    const pool = scopeEntries("russian-regions", difficultyId)
      .filter((e) => e.center !== e.name);
    const distractors = pickDistractors(
      pool,
      (e) => e.center,
      entry.center,
      3,
      entry.district,
      null,
      "district",
    );
    const options = shuffle([entry.center, ...distractors]);
    return {
      id: `russian-regions:${entry.id}`,
      category: "russian-regions",
      difficulty: difficultyId,
      variant: "a",
      country: entry.name,
      regionId: entry.id,
      regionType: entry.type,
      regionCenter: entry.center,
      flagCode: null,
      plate: null,
      promptText: entry.capital
        ? `Какая столица у ${entry.gen}?`
        : `Какой административный центр у ${entry.gen}?`,
      showFlag: false,
      showCountryName: false,
      currencyFacts: null,
      optionType: "text",
      options: options,
      correctIndex: options.indexOf(entry.center),
      correctText: entry.center,
      correctLabel: `${entry.name} — ${entry.center}`,
    };
  }

  /**
   * Вопрос «Какой регион России имеет административный центр …?».
   * Варианты — субъекты: сначала того же округа, затем того же типа.
   */
  function regionByCenterQuestion(entry, difficultyId) {
    const pool = scopeEntries("russian-regions", difficultyId);
    const shuffled = shuffle(pool);
    const buckets = [
      shuffled.filter((e) => entry.district && e.district === entry.district),
      shuffled.filter((e) => e.type === entry.type),
      shuffled,
    ];
    const seen = new Set([entry.name]);
    const distractors = [];
    for (const bucket of buckets) {
      for (const e of bucket) {
        if (distractors.length >= 3) break;
        if (seen.has(e.name)) continue;
        seen.add(e.name);
        distractors.push(e.name);
      }
    }
    const options = shuffle([entry.name, ...distractors]);
    return {
      id: `russian-regions:${entry.id}`,
      category: "russian-regions",
      difficulty: difficultyId,
      variant: "b",
      country: entry.name,
      regionId: entry.id,
      regionType: entry.type,
      regionCenter: entry.center,
      flagCode: null,
      plate: null,
      promptText: entry.capital
        ? `У какого региона России столица — ${entry.center}?`
        : `У какого региона России административный центр — ${entry.center}?`,
      showFlag: false,
      showCountryName: false,
      currencyFacts: null,
      optionType: "text",
      options: options,
      correctIndex: options.indexOf(entry.name),
      correctText: entry.name,
      correctLabel: `${entry.name} — ${entry.center}`,
    };
  }

  /**
   * Собирает вопрос из записи базы. entry — запись, variant — тип вопроса.
   */
  function buildQuestion(categoryId, entry, difficultyId, variant) {
    /* ————— Автомобильные коды регионов ————— */
    if (categoryId === "autocodes") {
      return variant === "b"
        ? autocodeCodeQuestion(entry)
        : autocodeRegionQuestion(entry);
    }

    /* ————— Субъекты РФ и административные центры ————— */
    if (categoryId === "russian-regions") {
      return variant === "b"
        ? regionByCenterQuestion(entry, difficultyId)
        : regionCenterQuestion(entry, difficultyId);
    }

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

  /**
   * Длинная тренировка по регионам (50 вопросов при небольшом пуле уровня).
   * Вопросы идут кругами по перемешанному пулу, а у одного и того же
   * субъекта тип вопроса чередуется — подряд одинаковых вопросов нет.
   */
  function buildRepeatedRegionQuestions(pool, difficultyId, count) {
    const out = [];
    const lastVariant = new Map();
    while (out.length < count) {
      for (const entry of shuffle(pool)) {
        if (out.length >= count) break;
        let variant = pickRegionVariant(entry);
        const bothAvailable = entry.center !== entry.name && hasUnambiguousCenter(entry);
        if (bothAvailable && lastVariant.get(entry.id) === variant) {
          variant = variant === "a" ? "b" : "a";
        }
        lastVariant.set(entry.id, variant);
        out.push(buildQuestion("russian-regions", entry, difficultyId, variant));
      }
    }
    return out;
  }

  function pickVariant(categoryId, entry) {
    if (categoryId === "currencies") return pickCurrencyVariant(entry);
    if (categoryId === "autocodes") return pickAutocodeVariant(entry);
    if (categoryId === "russian-regions") return pickRegionVariant(entry);
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
      // Без уровней — вся база, с уровнями — только записи выбранной сложности
      let pool = NO_LEVELS.has(categoryId)
        ? bank.entries
        : bank.entries.filter((e) => e.difficulty === difficultyId);
      if (categoryId === "russian-regions") pool = pool.filter(isRegionQuizEntry);
      // Регионов на уровне может быть меньше, чем вопросов в тренировке:
      // 50 вопросов добираются кругами по пулу (см. buildRepeatedRegionQuestions).
      if (categoryId === "russian-regions" && count > pool.length) {
        return buildRepeatedRegionQuestions(pool, difficultyId, count);
      }
      const entries = shuffle(pool).slice(0, count);
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
      let pool = NO_LEVELS.has(categoryId)
        ? bank.entries
        : bank.entries.filter((e) => e.difficulty === difficultyId);
      if (categoryId === "russian-regions") pool = pool.filter(isRegionQuizEntry);
      const entries = shuffle(pool);
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

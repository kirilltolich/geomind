/* GeoMind — профиль игрока.
 * Хранит имя и эмодзи-аватар отдельно от статистики (свой ключ localStorage),
 * поэтому смена имени или эмодзи никогда не трогает опыт, уровень, историю
 * тренировок и ошибки.
 *
 * Данные привязаны к браузеру и адресу сайта: localStorage у каждого
 * устройства свой, поэтому у друзей, открывших ссылку, будут собственные
 * профили. Синхронизации между устройствами нет — для неё нужен сервер.
 *
 * Безопасность:
 *   • имя — только текст: при выводе оно всегда попадает в textContent
 *     (см. js/ui/dom.js, h(..., { text })), а не в HTML;
 *   • длина ограничена 20 символами (считаем по Unicode-символам, чтобы
 *     не разрезать эмодзи пополам);
 *   • управляющие символы и переводы строк заменяются пробелами;
 *   • эмодзи принимается только из белого списка EMOJIS.
 */
window.GeoMind = window.GeoMind || {};

window.GeoMind.Profile = (function () {
  const Config = window.GeoMind.Config;
  const Storage = window.GeoMind.Storage;

  const KEY = Config.PROFILE_STORAGE_KEY;
  const DEFAULT_NAME = "Игрок";
  const DEFAULT_EMOJI = "🚀";
  const MAX_NAME = 20;

  /* Галерея доступных аватаров. Порядок — как в интерфейсе. */
  const EMOJIS = [
    "😀", "😎", "🧠", "🚀", "🌍", "🦊", "🐼", "🐱", "🐸", "🦁",
    "🐯", "🐵", "🐧", "🦉", "🦄", "👾", "🎮", "🏆", "⚡", "🔥",
    "🌟", "🎯", "💎", "🍀", "🐳", "🦋", "🌈", "☀️", "🍕", "🎸",
  ];

  /**
   * Приводит имя к безопасному виду: без управляющих символов,
   * без лишних пробелов по краям, не длиннее MAX_NAME символов.
   * Пустая строка означает «имени нет» — вызывающий код решает,
   * подставить значение по умолчанию или показать ошибку.
   */
  function sanitizeName(raw) {
    const text = String(raw == null ? "" : raw)
      // управляющие символы и переводы строк → пробел
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      // повторяющиеся пробелы → один
      .replace(/\s+/g, " ")
      .trim();
    // Array.from считает Unicode-символы целиком (эмодзи не разрезается)
    return Array.from(text).slice(0, MAX_NAME).join("").trim();
  }

  /** Принимает только эмодзи из галереи, иначе — значение по умолчанию. */
  function sanitizeEmoji(raw) {
    return EMOJIS.indexOf(raw) !== -1 ? raw : DEFAULT_EMOJI;
  }

  /** Полный профиль из произвольных данных: всегда валидный. */
  function normalize(raw) {
    const src = raw && typeof raw === "object" ? raw : {};
    const name = sanitizeName(src.name);
    return {
      name: name || DEFAULT_NAME,
      emoji: sanitizeEmoji(src.emoji),
    };
  }

  // Загружаем сохранённый профиль; битые данные не ломают приложение
  let current = normalize(Storage.load(KEY, null));

  function get() {
    return { name: current.name, emoji: current.emoji };
  }

  /**
   * Сохраняет профиль. Пустое имя не затирает текущее — возвращается
   * прежнее, а интерфейс настроек показывает ошибку до вызова save().
   */
  function save(next) {
    const src = next && typeof next === "object" ? next : {};
    const name = sanitizeName(src.name);
    const emoji = src.emoji === undefined ? current.emoji : sanitizeEmoji(src.emoji);
    current = {
      name: name || current.name || DEFAULT_NAME,
      emoji: emoji,
    };
    Storage.save(KEY, current);
    return get();
  }

  return {
    KEY: KEY,
    DEFAULT_NAME: DEFAULT_NAME,
    DEFAULT_EMOJI: DEFAULT_EMOJI,
    MAX_NAME: MAX_NAME,
    EMOJIS: EMOJIS,
    get: get,
    save: save,
    sanitizeName: sanitizeName,
    sanitizeEmoji: sanitizeEmoji,
  };
})();

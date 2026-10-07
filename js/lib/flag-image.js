/* ============================================================
   GeoMind — паблик-утилита для получения изображения флага из
   https://flag-gimn.ru/flags/ (RealFlagi / RealFlags).
   Ни один другой модуль не зависит от конкретного источника:
   чтобы перейти на SVG/PNG-хостинг, достаточно изменить эту
   функцию (или конфиг) — логика вопросов и экраны не трогать.
   ============================================================ */

(function () {
  "use strict";

  /* ──────────────────────────────────────────────────────────
     Словарь соответствия названй стран → ожидаемым именам файлов
     на flag-gimn.ru.
     В большинстве случаев ключ = названию файла, но для части
     стран файл называется иначе (ядра флага, "flag_of_…").
     ────────────────────────────────────────────────────────── */

  const FILE_MAP = {
    // Названия, которые отличаются от ключа-страны
    "США":          "United_States",
    "Великобритания":"United_Kingdom",
    "Северная Македония": "North_Macedonia",
    "ОАЭ":          "United_Arab_Emirates",
    "Уругвай":      "Uruguay",
    "Либерия":      "Liberia",
  };

  /* Мэппинг названия файла → файл на flag-gimn.ru.
     Некоторые страны на сайте хранятся под "flag_of_ИмяСтрани"
     (например, флаги территорий/организаций). Для обычных стран
     это не нужно, но оставляем для стабильности, если вдруг
     файл не найдётся. */

  const FILE_PREFIX = ""; // пусто — имена файлов используются напрямую,
                          // без "flag_of_" префикса (проверено: Финляндия, Япония, Великобритания и т.д. лежат как "Финляндия.png").
  const BASE = "https://flag-gimn.ru/flags/";

  /** Нормализует название страны в имя файла (без расширения).
   *   Россия → Россия
   *   США      → United_States
   *   ОАЭ      → United_Arab_Emirates
   */
  function fileNameFor(country) {
    if (FILE_MAP[country]) return FILE_MAP[country];
    // Напр. для "Республика К", "Королевство С" берём как есть,
    // если ключ нет — проверяем ниже.
    return country;
  }

  /** Возвращает изображение флага: тег <img> или null, если
   *   не удалось определить страну.
   *
   *   cards — { alt, country }
   *   Для адаптивности под другие источники: если источник пуст,
   *   возвращается эмодзи-флаг из данных (fallback).
   */
  function flagImageEl(card) {
    const country = card?.country;
    const alt = card?.alt || country;
    if (!country) return null;

    // 1) файл из мапы
    let name = fileNameFor(country);
    let url = BASE + encodeURIComponent(name) + ".png";

    // 2) fallback: эмодзи-флаг (если вдруг нет изображения)
    const fallbackEmoji = card?.emoji || null;

    const img = document.createElement("img");
    img.alt = alt;
    img.title = alt;
    img.src = url;
    img.className = "question-flag-img";
    img.loading = "lazy";
    img.decoding = "async";

    // Если изображение не загрузится — показать эмодзи (или ничего)
    const noImgFallback = () => {
      img.style.display = "none";
      if (fallbackEmoji) {
        const span = document.createElement("span");
        span.className = "question-flag-emoji-fallback";
        span.textContent = fallbackEmoji;
        // вставляем после img, чтобы эмодзи появился в том же блоке
        if (img.parentNode) img.parentNode.appendChild(span);
      }
    };
    img.onerror = noImgFallback;
    return img;
  }

  /* ──────────────────────────────────────────────────────────
     Безопасный режим загрузки: при первой загрузке страницы многие
     картинки могут быть ещё не закэшированы. Автоматически
     пытаемся предзагрузить флаги, если загрузился хотя бы один.
     (Это лишь оптимизация — не блокирует рендер.)
     ────────────────────────────────────────────────────────── */

  function preloadFlags(countryNames) {
    if (!Array.isArray(countryNames)) return;
    for (const c of countryNames) {
      const name = fileNameFor(c);
      const url = BASE + encodeURIComponent(name) + ".png";
      // предзагрузка «молча» — создаём new Image, но не добавляем в DOM
      const i = new Image();
      i.src = url;
    }
  }

  /* ──────────────────────────────────────────────────────────
     Экспорт
     ────────────────────────────────────────────────────────── */
  if (typeof window !== "undefined") {
    window.GeoMind.FlagImage = flagImageEl;
    window.GeoMind.FlagImagePreload = preloadFlags;
  }
})();

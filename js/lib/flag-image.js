/* ============================================================
   GeoMind — слой отображения флагов.

   Единственная точка, где приложение знает, откуда берётся
   изображение флага. Никакой другой модуль не строит пути сам.

   Схема:
       название страны  →  ISO-код  →  <base>/assets/flags/{code}.svg

   Все флаги лежат внутри проекта, внешние сайты не используются.

   Базовый путь вычисляется от document.baseURI, поэтому корректно
   работает и локально (file://), и на GitHub Pages в подпапке
   (https://kirilltolich.github.io/geomind/).

   Публичный интерфейс:
       FlagImage({ country, alt, code, variant })  →  HTMLElement
       FlagImage.urlFor(country | {country, code}) →  string
   ============================================================ */

(function () {
  "use strict";

  const Codes = window.GeoMind.FlagCodes || {};

  /* ──────────────────────────────────────────────────────────
     Базовый путь к локальным ресурсам.

     Используем document.baseURI — он учитывает:
       • тег <base href>, если он появится в index.html;
       • локальный запуск: file:///C:/.../GeoMind/index.html;
       • GitHub Pages в подпапке: /geomind/index.html.

     Относительный путь "assets/flags/" разрешается от baseURI,
     поэтому на Pages он превращается в /geomind/assets/flags/,
     а не в корневой /assets/flags/.
     ────────────────────────────────────────────────────────── */
  function resolveAssetBase() {
    if (window.GeoMind && window.GeoMind.ASSET_BASE) {
      return String(window.GeoMind.ASSET_BASE);
    }
    try {
      const base = document.baseURI
        || (window.location && window.location.href)
        || "";
      return new URL("assets/flags/", base).href; // гарантированно со слэшем
    } catch (e) {
      return "assets/flags/";
    }
  }

  const ASSET_BASE = resolveAssetBase();

  /** ISO-код страны по её названию. */
  function codeFor(country) {
    if (!country) return null;
    return Codes[country] || null;
  }

  /** Полный URL локального SVG-флага. */
  function urlFor(input) {
    const card = typeof input === "string" ? { country: input } : (input || {});
    const code = card.code || codeFor(card.country);
    if (!code) return null;
    return ASSET_BASE + code + ".svg";
  }

  /* ──────────────────────────────────────────────────────────
     Создание элемента флага.

     card:
       country — название страны из данных (обязательно, если нет code)
       code    — ISO-код (необязательно; берётся из карты по country)
       alt     — alt-текст (по умолчанию название страны)
       variant — "question" (по умолчанию) | "option" — управляет размером

     Возвращает <img> для существующего кода либо нейтральную
     заглушку (без Unicode-эмодзи), если код не найден.
     ────────────────────────────────────────────────────────── */
  function flagImageEl(card) {
    const c = card || {};
    const country = c.country || null;
    const code = c.code || codeFor(country);
    const alt = c.alt || country || "Флаг";
    const variant = c.variant === "option" ? "option" : "question";

    if (!code) return missingFlagEl(alt, variant);

    const img = document.createElement("img");
    img.className = variant === "option" ? "flag-option-img" : "question-flag-img";
    img.src = ASSET_BASE + code + ".svg";
    img.alt = alt;
    img.title = alt;
    img.loading = "lazy";
    img.decoding = "async";
    img.width = variant === "option" ? 72 : 200;
    img.height = variant === "option" ? 48 : 120;

    // Локальный фолбэк: не эмодзи, а нейтральная заглушка.
    img.onerror = function () {
      if (img.parentNode) {
        img.parentNode.replaceChild(missingFlagEl(alt, variant), img);
      }
    };

    return img;
  }

  /** Нейтральная заглушка вместо флага (без Unicode-флага). */
  function missingFlagEl(alt, variant) {
    const span = document.createElement("span");
    span.className = variant === "option" ? "flag-missing flag-missing-option" : "flag-missing";
    span.textContent = "?";
    span.title = alt;
    span.setAttribute("aria-label", alt);
    return span;
  }

  /* ──────────────────────────────────────────────────────────
     Предзагрузка (опционально): прогревает кэш локальных флагов.
     ────────────────────────────────────────────────────────── */
  function preloadFlags(countries) {
    if (!Array.isArray(countries)) return;
    for (const country of countries) {
      const url = urlFor(country);
      if (url) { const i = new Image(); i.src = url; }
    }
  }

  /* ──────────────────────────────────────────────────────────
     Экспорт
     ────────────────────────────────────────────────────────── */
  flagImageEl.urlFor = urlFor;
  flagImageEl.baseUrl = ASSET_BASE;
  flagImageEl.codeFor = codeFor;

  if (typeof window !== "undefined" && window.GeoMind) {
    window.GeoMind.FlagImage = flagImageEl;
    window.GeoMind.FlagImagePreload = preloadFlags;
  }
})();

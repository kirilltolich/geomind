/* GeoMind — небольшие хелперы для работы с DOM. */
window.GeoMind = window.GeoMind || {};

window.GeoMind.Dom = (function () {
  /**
   * Создаёт элемент:
   * h("button", { class: "btn", onclick: fn, disabled: true }, "Текст", childEl)
   */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        if (value == null || value === false) continue;
        if (key === "class") {
          el.className = value;
        } else if (key === "text") {
          el.textContent = value;
        } else if (key.startsWith("on") && typeof value === "function") {
          el.addEventListener(key.slice(2), value);
        } else {
          el.setAttribute(key, value === true ? "" : String(value));
        }
      }
    }
    for (const child of children.flat(Infinity)) {
      if (child == null || child === false) continue;
      el.append(child.nodeType ? child : document.createTextNode(String(child)));
    }
    return el;
  }

  /** Форматирует секунды: 2.84 -> "2.8 сек" */
  function fmtTime(sec) {
    return `${sec.toFixed(1)} сек`;
  }

  /**
   * Русские формы множественного числа: plural(5, "день", "дня", "дней") -> "дней".
   */
  function plural(n, one, few, many) {
    const x = Math.abs(Math.round(n));
    const mod10 = x % 10;
    const mod100 = x % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  const MONTHS_GEN = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];

  /**
   * Человеческая дата для записи истории: "Сегодня", "Вчера"
   * или "12 марта" (с годом, если он отличается).
   */
  function fmtDate(dateStr) {
    const parts = String(dateStr).split("-").map(Number);
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const date = new Date(y, m - 1, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((today - date) / 86400000);
    if (diff === 0) return "Сегодня";
    if (diff === 1) return "Вчера";
    let out = `${d} ${MONTHS_GEN[m - 1]}`;
    if (y !== now.getFullYear()) out += ` ${y}`;
    return out;
  }

  /** Время из ISO-строки: "18:42" (пустая строка, если дата битая). */
  function fmtClock(ts) {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  return { h: h, fmtTime: fmtTime, plural: plural, fmtDate: fmtDate, fmtClock: fmtClock };
})();
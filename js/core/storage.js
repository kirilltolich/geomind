/* GeoMind — безопасная работа с localStorage.
 * Обёртка с защитой от ошибок (приватный режим, битые данные).
 */
window.GeoMind = window.GeoMind || {};

window.GeoMind.Storage = (function () {
  return {
    load(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },

    save(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        // localStorage недоступен — молча пропускаем, статистика останется в памяти
      }
    },
  };
})();
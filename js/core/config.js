/* GeoMind — глобальные настройки приложения. */
window.GeoMind = window.GeoMind || {};

window.GeoMind.Config = {
  APP_NAME: "🌍 GeoMind",
  TAGLINE: "Тренируй географию. Запоминай страны.",

  // Классическая тренировка: доступные количества вопросов
  QUESTION_OPTIONS: [10, 20, 50],

  // Длина классической тренировки по умолчанию
  QUESTIONS_PER_TRAINING: 10,

  // Награда за правильный ответ задаётся уровнем сложности
  // (см. js/data/difficulties.js): лёгкая +10, средняя +20, сложная +30 XP.

  ANSWER_LABELS: ["A", "B", "C", "D"],

  // Ключ хранения статистики в localStorage
  STORAGE_KEY: "geomind:stats:v1",

  // Максимальное количество записей в истории тренировок
  HISTORY_LIMIT: 50,
};
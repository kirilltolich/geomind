/* GeoMind — категории тренировок.
 * Доступные сейчас: «Флаги стран» и «Страны и столицы».
 * Остальные помечены как будущие возможности (locked).
 * Категория и сложность — независимые параметры тренировки,
 * поэтому каждая доступная категория работает с любым уровнем сложности.
 */
window.GeoMind = window.GeoMind || {};

window.GeoMind.Categories = [
  {
    id: "flags",
    emoji: "🚩",
    title: "Флаги",
    desc: "Угадывай страны по флагам мира",
    locked: false,
  },
  {
    id: "capitals",
    emoji: "🌎",
    title: "Столицы",
    desc: "Проверь, насколько хорошо ты знаешь столицы мира",
    locked: false,
  },
  { id: "map",         emoji: "🗺️", title: "Карта",           desc: "Определяй страны и города на карте", locked: true },
  { id: "cities",      emoji: "🏙️", title: "Города",          desc: "Знаменитые города и достопримечательности", locked: true },
  { id: "mountains",   emoji: "🏔️", title: "Горы",            desc: "Вершины и горные системы планеты", locked: true },
  { id: "seas",        emoji: "🌊", title: "Моря и океаны",   desc: "Водные просторы Земли", locked: true },
  { id: "currencies",  emoji: "💰", title: "Валюты",          desc: "Деньги разных стран мира", locked: true },
];

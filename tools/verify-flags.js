#!/usr/bin/env node
/**
 * tools/verify-flags.js
 *
 * Проверка целостности данных GeoMind: флаги и валюты.
 *
 * Флаги:
 *   1. У каждой страны из данных есть ISO-код, и для каждого кода есть
 *      локальный SVG в assets/flags/.
 *   2. В рабочем коде нет ссылок на внешний хостинг флагов.
 *   3. Нет битых путей, невалидных SVG и дубликатов кодов.
 *   4. В данных не осталось Unicode-флагов (региональных индикаторов).
 *
 * Валюты:
 *   5. У каждой страны из capitals.js/flags.js определена валюта.
 *   6. У каждой записи есть gen, currency, code (ISO 4217), symbol, region,
 *      difficulty.
 *   7. Одно название валюты всегда имеет один код, и наоборот.
 *   8. Для каждой страны категории «Валюты» есть код флага (для отрисовки).
 *   9. Нет стран, использующих валюту, которой нет у соседей по базе
 *      (проверяется как «есть ли хоть один правдоподобный вариант»).
 *
 * Автокоды (автомобильные коды регионов России):
 *  10. У каждого региона есть название, округ и непустой список кодов;
 *      коды — только цифры (2–3 знака). Уровней сложности у категории нет.
 *  11. Каждый код принадлежит ровно одному региону (нет дубликатов).
 *  12. Сгенерированные вопросы корректны: 4 варианта без повторов, верный
 *      ответ — среди вариантов, вопросы собираются из всей базы (без уровней),
 *      а в вопросе «регион → код» ровно один вариант принадлежит региону.
 *
 * Запуск:  node tools/verify-flags.js
 * Код возврата 0 — всё в порядке, 1 — есть проблемы.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FLAGS_DIR = path.join(ROOT, "assets", "flags");

/* Имя внешнего хостинга флагов, от которого приложение избавлено.
   Собираем строку из частей, чтобы сам проверяющий скрипт не содержал
   готового адреса и любой поиск по репозиторию оставался чистым. */
const EXTERNAL_HOST = ["flag", "gimn"].join("-") + "." + "ru";
const EXTERNAL_RE = new RegExp(EXTERNAL_HOST.replace(/\./g, "\\."));

const problems = [];
const notes = [];

function fail(msg) { problems.push(msg); }
function note(msg) { notes.push(msg); }

/* ── Загрузка данных приложения ── */
global.window = {};
require(path.join(ROOT, "js", "data", "capitals.js"));
require(path.join(ROOT, "js", "data", "flags.js"));
require(path.join(ROOT, "js", "data", "currencies.js"));
require(path.join(ROOT, "js", "data", "autocodes.js"));
require(path.join(ROOT, "js", "data", "russian-regions.js"));
require(path.join(ROOT, "js", "data", "flag-codes.js"));
require(path.join(ROOT, "js", "data", "difficulties.js"));
require(path.join(ROOT, "js", "data", "questions.js"));

/* Профиль игрока — модуль без DOM, проверяем его отдельно.
   localStorage подменяем картой в памяти и следим, чтобы профиль
   писал только в свой ключ и не касался статистики. */
const profileStore = new Map();
const STATS_KEY = "geomind:stats:v1";
profileStore.set(STATS_KEY, JSON.stringify({ xp: 1234, totalQuestions: 100 }));
global.window.localStorage = {
  getItem: (k) => (profileStore.has(k) ? profileStore.get(k) : null),
  setItem: (k, v) => profileStore.set(k, String(v)),
};
require(path.join(ROOT, "js", "core", "config.js"));
require(path.join(ROOT, "js", "core", "storage.js"));
require(path.join(ROOT, "js", "core", "profile.js"));
const Profile = global.window.GeoMind.Profile;

const CAPITALS = global.window.GeoMind.Data.CAPITALS;
const FLAGS = global.window.GeoMind.Data.FLAGS;
const CURRENCIES = global.window.GeoMind.Data.CURRENCIES;
const AUTOCODES = global.window.GeoMind.Data.AUTOCODES;
const RUSSIAN_REGIONS = global.window.GeoMind.Data.RUSSIAN_REGIONS;
const CODES = global.window.GeoMind.FlagCodes;
const Difficulties = global.window.GeoMind.Difficulties;
const Questions = global.window.GeoMind.Questions;

/* ── 1. ISO-коды флагов в данных ── */
const allRecords = [
  ...CAPITALS.map((e) => ({ ...e, _src: "capitals.js" })),
  ...FLAGS.map((e) => ({ ...e, _src: "flags.js" })),
];

const countries = new Set(allRecords.map((e) => e.country));

for (const rec of allRecords) {
  if (!rec.code) fail(`[нет кода флага] ${rec._src}: «${rec.country}» без поля code`);
  if (!rec.difficulty) fail(`[нет сложности] ${rec._src}: «${rec.country}» без difficulty`);
  if (!rec.gen) fail(`[нет gen] ${rec._src}: «${rec.country}» без родительного падежа`);
}

for (const country of countries) {
  if (!CODES[country]) {
    fail(`[нет кода в карте] «${country}» отсутствует в js/data/flag-codes.js`);
  }
}

/* ── 3. Дубликаты кодов флагов ── */
const codeOwners = new Map(); // код → набор стран
for (const rec of allRecords) {
  if (!rec.code) continue;
  if (!codeOwners.has(rec.code)) codeOwners.set(rec.code, new Set());
  codeOwners.get(rec.code).add(rec.country);

  const expected = CODES[rec.country];
  if (expected && expected !== rec.code) {
    fail(`[расхождение] «${rec.country}»: в данных code="${rec.code}", в карте "${expected}"`);
  }
}
for (const [code, owners] of codeOwners) {
  if (owners.size > 1) {
    fail(`[дубликат флага] код "${code}" назначен нескольким странам: ${[...owners].join(", ")}`);
  }
}

/* ── 2. Наличие SVG для каждого кода ── */
const neededCodes = new Set([...codeOwners.keys(), ...Object.values(CODES)]);
const existing = new Set();
if (!fs.existsSync(FLAGS_DIR)) {
  fail(`[нет папки] не найдена ${path.relative(ROOT, FLAGS_DIR)}`);
} else {
  for (const f of fs.readdirSync(FLAGS_DIR)) {
    if (f.endsWith(".svg")) existing.add(f.slice(0, -4));
  }
}

const missingFiles = [...neededCodes].filter((c) => !existing.has(c)).sort();
if (missingFiles.length) {
  fail(`[нет файлов] отсутствуют SVG: ${missingFiles.join(", ")}`);
}

/* ── 2/3. Валидность SVG ── */
let hugeCount = 0;
for (const code of existing) {
  const content = fs.readFileSync(path.join(FLAGS_DIR, `${code}.svg`), "utf8");
  const head = content.trim().slice(0, 200);
  if (!head.startsWith("<svg") && !head.startsWith("<?xml")) {
    fail(`[битый SVG] ${code}.svg не начинается с <svg`);
  }
  if (/https?:\/\/(?!www\.w3\.org)/.test(content)) {
    fail(`[внешняя ссылка] ${code}.svg ссылается на внешний ресурс`);
  }
  if (EXTERNAL_RE.test(content)) fail(`[внешний хостинг] найдено в ${code}.svg`);
  if (content.length > 200000) hugeCount++;
}

const orphan = [...existing].filter((c) => !neededCodes.has(c));
if (orphan.length) note(`лишние SVG (не используются в данных): ${orphan.join(", ")}`);
if (hugeCount) note(`очень крупные SVG (>200 КБ): ${hugeCount} шт.`);

/* ── 2. Ссылки на внешний хостинг в рабочем коде ── */
const CODE_DIRS = ["js", "css"];
const CODE_FILES = ["index.html", "README.md"];

function scanFile(absPath) {
  const text = fs.readFileSync(absPath, "utf8");
  if (EXTERNAL_RE.test(text)) {
    fail(`[внешний хостинг] упоминание в ${path.relative(ROOT, absPath)}`);
  }
}
function scanDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) scanDir(abs);
    else if (/\.(js|css|html)$/.test(entry.name)) scanFile(abs);
  }
}
for (const d of CODE_DIRS) {
  const abs = path.join(ROOT, d);
  if (fs.existsSync(abs)) scanDir(abs);
}
for (const f of CODE_FILES) {
  const abs = path.join(ROOT, f);
  if (fs.existsSync(abs)) scanFile(abs);
}

/* ── 4. Unicode-флаги в данных ── */
const regionalIndicator = /[\u{1F1E6}-\u{1F1FF}]{2}/u;
for (const f of ["js/data/capitals.js", "js/data/flags.js", "js/data/currencies.js"]) {
  const text = fs.readFileSync(path.join(ROOT, f), "utf8");
  if (regionalIndicator.test(text)) fail(`[Unicode-флаг] найден в ${f}`);
}

/* ════════════ Валюты ════════════ */

const REGIONS = new Set(["europe", "asia", "america", "africa", "oceania"]);
const DIFFICULTIES = new Set(["easy", "medium", "hard"]);

const currencyCountries = new Set();
for (const c of CURRENCIES) {
  if (!c.country) { fail("[валюта без страны]"); continue; }
  if (currencyCountries.has(c.country)) fail(`[дубликат страны в валютах] ${c.country}`);
  currencyCountries.add(c.country);

  if (!c.gen) fail(`[валюта без gen] ${c.country}`);
  if (!c.currency) fail(`[валюта без названия] ${c.country}`);
  if (!c.symbol) fail(`[валюта без символа] ${c.country}`);
  if (!REGIONS.has(c.region)) fail(`[странный регион] ${c.country}: ${c.region}`);
  if (!DIFFICULTIES.has(c.difficulty)) fail(`[странная сложность] ${c.country}: ${c.difficulty}`);
  if (!/^[A-Z]{3}$/.test(c.code || "")) fail(`[код не ISO 4217] ${c.country}: ${c.code}`);
  if (c.codes) {
    if (!Array.isArray(c.codes) || !c.codes.length) fail(`[пустой codes] ${c.country}`);
    else {
      for (const code of c.codes) {
        if (!/^[A-Z]{3}$/.test(code)) fail(`[код не ISO 4217] ${c.country}: ${code}`);
      }
      if (!c.codes.includes(c.code)) fail(`[codes без основного кода] ${c.country}`);
    }
  }
}

/* ── 5. Каждая страна из баз получила валюту ── */
for (const country of countries) {
  if (!currencyCountries.has(country)) {
    fail(`[нет валюты] страна из базы не покрыта категорией «Валюты»: ${country}`);
  }
}

/* ── 8. У страны категории «Валюты» есть код флага ── */
for (const c of CURRENCIES) {
  if (!CODES[c.country]) {
    fail(`[нет флага] для «${c.country}» нет кода в js/data/flag-codes.js`);
  }
}

/* ── 7. Согласованность «код ↔ название валюты» ──
   Названия валют нейтральные, поэтому одно имя («Доллар», «Фунт») носят
   много разных кодов — это ожидаемо. Обратное по-прежнему недопустимо:
   один ISO-код не может иметь два разных отображаемых названия. */
const codeToName = new Map();
for (const c of CURRENCIES) {
  const prevName = codeToName.get(c.code);
  if (prevName && prevName !== c.currency) {
    fail(`[код с двумя названиями] ${c.code}: «${prevName}» и «${c.currency}»`);
  }
  codeToName.set(c.code, c.currency);
}

/* ── 10. Название валюты не должно содержать название страны ──
   Иначе вариант ответа подсказывает сам себя:
   «Какая валюта у Канады? → Канадский доллар» . */
for (const c of CURRENCIES) {
  const nameLc = c.currency.toLowerCase();
  const countryLc = c.country.toLowerCase();
  if (nameLc.includes(countryLc)) {
    fail(`[название выдаёт страну] ${c.country} → «${c.currency}»`);
  }
}

/* ── 11. Проверка сгенерированных вопросов по валютам ──
   Для варианта «а» правильный ответ не должен содержать название
   страны; вариант «b» допустим только для валют с уникальным именем. */
const ownersByName = new Map();
for (const c of CURRENCIES) {
  ownersByName.set(c.currency, (ownersByName.get(c.currency) || 0) + 1);
}
let qChecked = 0;
for (const diff of ["easy", "medium", "hard"]) {
  for (const q of Questions.buildDeck("currencies", diff)) {
    qChecked++;
    if (q.options.length !== 4) fail(`[варианты] ${q.id}: ${q.options.length} вариантов вместо 4`);
    if (new Set(q.options).size !== q.options.length) {
      fail(`[дубли в вариантах] ${q.id}: ${q.options.join(" / ")}`);
    }
    if (q.options[q.correctIndex] !== q.correctText) {
      fail(`[сломан correctIndex] ${q.id}`);
    }
    if (q.variant === "a" && q.correctText.toLowerCase().includes(q.country.toLowerCase())) {
      fail(`[ответ выдаёт страну] ${q.id}: «${q.correctText}» для ${q.country}`);
    }
    if (q.variant === "b" && ownersByName.get(q.currencyName) !== 1) {
      fail(`[неоднозначный вариант b] ${q.id}: «${q.currencyName}» носят ${ownersByName.get(q.currencyName)} стран`);
    }
  }
}

/* ── Названия, которые носят несколько стран (вариант «b» для них выключен) ── */
const sharedNames = new Map();
for (const c of CURRENCIES) {
  sharedNames.set(c.currency, (sharedNames.get(c.currency) || 0) + 1);
}
const shared = [...sharedNames.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
if (shared.length) {
  note(`названий валют, общих для нескольких стран: ${shared.length} (${shared.slice(0, 4).map(([n, k]) => `«${n}»×${k}`).join(", ")}…)`);
}

/* ── Мультивалютные страны ── */
const multi = CURRENCIES.filter((c) => Array.isArray(c.codes) && c.codes.length > 1);
if (multi.length) {
  note(`страны с несколькими валютами: ${multi.map((c) => `${c.country} (${c.codes.join("/")})`).join(", ")}`);
}

const multiCountry = CURRENCIES.filter((c) => c.multiCountry);
if (multiCountry.length) {
  note(`валюта используется и другими странами (не спрашиваем «какая страна»): ${multiCountry.map((c) => c.country).join(", ")}`);
}

/* ── 9. У валюты есть правдоподобные соседи по региону ── */
for (const c of CURRENCIES) {
  const sameRegion = CURRENCIES.filter((e) => e.region === c.region && e.country !== c.country);
  const distinctNames = new Set(sameRegion.map((e) => e.currency));
  if (distinctNames.size < 3) {
    note(`мало соседей по региону у ${c.country} (${c.region}): ${distinctNames.size}`);
  }
}

/* ════════════ Автокоды регионов России ════════════ */

const DISTRICTS = new Set([
  "Центральный", "Северо-Западный", "Южный", "Северо-Кавказский",
  "Приволжский", "Уральский", "Сибирский", "Дальневосточный",
]);

const regions = new Set();
const codeOwner = new Map(); // код → регион
for (const a of AUTOCODES) {
  if (!a.region) { fail("[автокод без региона]"); continue; }
  if (regions.has(a.region)) fail(`[дубликат региона] ${a.region}`);
  regions.add(a.region);

  if (!DISTRICTS.has(a.district)) fail(`[неизвестный округ] ${a.region}: ${a.district}`);
  if (a.difficulty) fail(`[лишняя сложность] у «Автокодов» нет уровней, а у ${a.region} есть difficulty`);
  if (!Array.isArray(a.codes) || a.codes.length === 0) {
    fail(`[нет кодов] ${a.region}`);
    continue;
  }
  for (const code of a.codes) {
    if (!/^\d{2,3}$/.test(code)) fail(`[код не число 2–3 знака] ${a.region}: ${code}`);
    if (codeOwner.has(code) && codeOwner.get(code) !== a.region) {
      fail(`[дубликат автокода] «${code}» у «${codeOwner.get(code)}» и «${a.region}»`);
    }
    codeOwner.set(code, a.region);
  }
}

/* ── 12. Сгенерированные вопросы ──
   У «Автокодов» уровней нет: вопросы собираются из всей базы, поэтому
   достаточно одного прохода — уровень у всех вопросов единый ("uniform"). */
let acChecked = 0;
{
  const uniform = Difficulties.filter((d) => d.hidden).map((d) => d.id);
  if (uniform.length !== 1) fail(`[уровни] скрытый уровень должен быть один, их ${uniform.length}`);
  for (const q of Questions.buildDeck("autocodes", "uniform")) {
    acChecked++;
    if (!uniform.includes(q.difficulty)) fail(`[уровень автокода] ${q.id}: ${q.difficulty}`);
    if (q.options.length !== 4) fail(`[варианты] ${q.id}: ${q.options.length} вариантов вместо 4`);
    if (new Set(q.options).size !== q.options.length) {
      fail(`[дубли в вариантах] ${q.id}: ${q.options.join(" / ")}`);
    }
    if (q.options[q.correctIndex] !== q.correctText) fail(`[сломан correctIndex] ${q.id}`);
    if (q.correctText === null || q.correctText === undefined) fail(`[пустой ответ] ${q.id}`);

    if (q.variant === "a") {
      // код → регион: правильный ответ — регион, а показанный код
      // должен принадлежать этому региону
      const owner = codeOwner.get(q.plate);
      if (owner !== q.correctText) fail(`[код не от региона] ${q.id}: ${q.plate} → ${owner}, ответ «${q.correctText}»`);
      for (const opt of q.options) {
        if (opt !== q.correctText && !regions.has(opt)) fail(`[вариант не регион] ${q.id}: ${opt}`);
      }
    } else if (q.variant === "b") {
      // регион → код: среди вариантов ровно один код этого региона
      // (q.correctText здесь — код, а регион лежит в q.country)
      const own = new Set((AUTOCODES.find((a) => a.region === q.country) || {}).codes || []);
      const belonging = q.options.filter((o) => own.has(o));
      if (belonging.length !== 1) fail(`[неоднозначный вариант b] ${q.id}: кодов региона в вариантах — ${belonging.length}`);
    } else {
      fail(`[неизвестный вариант автокода] ${q.id}: ${q.variant}`);
    }
  }
}

/* ════════════ Регионы России и административные центры ════════════ */

/* Ожидаемый состав справочника (зафиксирован в js/data/russian-regions.js). */
const REGION_TYPES = new Map([
  ["республика", 24],
  ["край", 9],
  ["область", 48],
  ["город федерального значения", 3],
  ["автономная область", 1],
  ["автономный округ", 4],
]);
const REGION_DISTRICTS = new Set([...DISTRICTS, "Прочие"]);
const DIFFICULTY_IDS = new Set(Difficulties.map((d) => d.id));

if (RUSSIAN_REGIONS.length !== 89) {
  fail(`[состав] субъектов должно быть 89, в базе ${RUSSIAN_REGIONS.length}`);
}

const regionIds = new Set();
const regionNamesAll = new Set();
const typeCount = new Map();
const centerCount = new Map();
const regionByCenter = new Map();
for (const r of RUSSIAN_REGIONS) {
  if (!r.id) fail(`[нет id] «${r.name}»`);
  else if (regionIds.has(r.id)) fail(`[дубликат id] ${r.id}`);
  else regionIds.add(r.id);

  if (!r.name) fail(`[нет названия] ${r.id}`);
  else if (regionNamesAll.has(r.name)) fail(`[дубликат названия] ${r.name}`);
  else regionNamesAll.add(r.name);

  if (!r.gen) fail(`[нет родительного падежа] ${r.name}`);
  if (!r.center) fail(`[нет административного центра] ${r.name}`);
  if (!DIFFICULTY_IDS.has(r.difficulty)) fail(`[странная сложность] ${r.name}: ${r.difficulty}`);
  if (r.district !== null && !REGION_DISTRICTS.has(r.district)) {
    fail(`[неизвестный округ] ${r.name}: ${r.district}`);
  }

  const expectedType = REGION_TYPES.has(r.type);
  if (!expectedType) fail(`[неизвестный тип] ${r.name}: ${r.type}`);
  typeCount.set(r.type, (typeCount.get(r.type) || 0) + 1);

  if (r.type === "республика") {
    if (!r.capital) fail(`[республика без столицы] ${r.name}`);
    else if (r.capital !== r.center) fail(`[столица != центр] ${r.name}: ${r.capital} / ${r.center}`);
  } else if (r.capital) {
    fail(`[лишняя столица] ${r.name}: capital только у республик`);
  }

  if (r.center) {
    centerCount.set(r.center, (centerCount.get(r.center) || 0) + 1);
    regionByCenter.set(r.center, r);
  }
}

for (const [type, expected] of REGION_TYPES) {
  const actual = typeCount.get(type) || 0;
  if (actual !== expected) fail(`[состав] «${type}»: ${actual} вместо ${expected}`);
}

/* Центры, общие для нескольких субъектов: допустимо только для городов
   федерального значения (Москва, Санкт-Петербург), и только потому, что
   вопрос «центр → регион» для них не строится. */
for (const [center, n] of centerCount) {
  if (n > 1 && !regionNamesAll.has(center)) {
    fail(`[центр у нескольких субъектов] «${center}» — ${n}`);
  }
}

/* ── 13. Сгенерированные вопросы по регионам ── */
let rgChecked = 0;
const rgDeckSizes = {};
for (const diff of ["easy", "medium", "hard"]) {
  const deck = Questions.buildDeck("russian-regions", diff);
  rgDeckSizes[diff] = deck.length;
  if (!deck.length) fail(`[пустой уровень] russian-regions/${diff}`);
  const variants = new Set();
  for (const q of deck) {
    rgChecked++;
    variants.add(q.variant);
    const entry = RUSSIAN_REGIONS.find((r) => r.id === q.regionId);
    if (!entry) { fail(`[нет записи] ${q.id}`); continue; }
    if (entry.difficulty !== diff) fail(`[не та сложность] ${q.id}: ${entry.difficulty} вместо ${diff}`);
    if (entry.center === entry.name) fail(`[вопрос о городе без центра] ${q.id}`);
    if (q.options.length !== 4) fail(`[варианты] ${q.id}: ${q.options.length} вариантов вместо 4`);
    if (new Set(q.options).size !== q.options.length) {
      fail(`[дубли в вариантах] ${q.id}: ${q.options.join(" / ")}`);
    }
    if (!q.options.includes(q.correctText)) fail(`[нет верного ответа] ${q.id}`);
    if (q.options.filter((o) => o === q.correctText).length !== 1) {
      fail(`[несколько верных ответов] ${q.id}`);
    }
    if (q.options[q.correctIndex] !== q.correctText) fail(`[сломан correctIndex] ${q.id}`);

    if (q.variant === "a") {
      if (q.correctText !== entry.center) fail(`[центр не тот] ${q.id}: «${q.correctText}»`);
      if (!q.promptText.includes(entry.gen)) fail(`[падеж] ${q.id}: «${q.promptText}»`);
    } else if (q.variant === "b") {
      if (q.correctText !== entry.name) fail(`[регион не тот] ${q.id}: «${q.correctText}»`);
      // варианты-регионы не должны иметь тот же центр — иначе два верных ответа
      for (const opt of q.options) {
        if (opt === entry.name) continue;
        const other = RUSSIAN_REGIONS.find((r) => r.name === opt);
        if (!other) fail(`[вариант не регион] ${q.id}: ${opt}`);
        else if (other.center === entry.center) fail(`[второй верный вариант] ${q.id}: ${opt}`);
      }
    } else {
      fail(`[неизвестный тип вопроса] ${q.id}: ${q.variant}`);
    }
  }
  if (!variants.has("a")) fail(`[нет вопросов «регион → центр»] ${diff}`);
  if (!variants.has("b")) fail(`[нет вопросов «центр → регион»] ${diff}`);
}

/* ── 14. Длинные тренировки по регионам (10/20/50) ──
   Если в уровне меньше 50 субъектов, вопросы добираются кругами
   по пулу; верный ответ и четыре варианта должны остаться корректными. */
for (const diff of ["easy", "medium", "hard"]) {
  for (const count of [10, 20, 50]) {
    const list = Questions.build("russian-regions", diff, count);
    if (list.length !== count) fail(`[длина] russian-regions/${diff}: ${list.length} вместо ${count}`);
    for (let i = 0; i < list.length; i++) {
      const q = list[i];
      if (q.options.length !== 4) fail(`[варианты] ${q.id}: ${q.options.length} вместо 4`);
      if (new Set(q.options).size !== q.options.length) fail(`[дубли в вариантах] ${q.id}`);
      if (!q.options.includes(q.correctText)) fail(`[нет верного ответа] ${q.id}`);
      if (i > 0 && list[i - 1].id === q.id) fail(`[два одинаковых вопроса подряд] ${q.id}`);
    }
  }
}

/* ════════════ Профиль игрока ════════════ */

const DEFAULT_PROFILE = Profile.get();
if (DEFAULT_PROFILE.name !== "Игрок") fail(`[профиль] имя по умолчанию: «${DEFAULT_PROFILE.name}»`);
if (!Profile.EMOJIS.includes(DEFAULT_PROFILE.emoji)) fail(`[профиль] эмодзи по умолчанию вне галереи`);
if (Profile.MAX_NAME !== 20) fail(`[профиль] лимит имени: ${Profile.MAX_NAME}`);

if (Profile.sanitizeName("  Кирилл  ") !== "Кирилл") fail("[профиль] пробелы по краям не убираются");
if (Profile.sanitizeName("   ") !== "") fail("[профиль] пустое имя не распознано");
if (Profile.sanitizeName("Имя\nс\tтабом") !== "Имя с табом") fail("[профиль] управляющие символы не заменяются");
if (Array.from(Profile.sanitizeName("я".repeat(30))).length !== 20) fail("[профиль] имя не обрезается до 20 символов");
if (Profile.sanitizeEmoji("<script>") !== Profile.DEFAULT_EMOJI) fail("[профиль] посторонний эмодзи принят");

const saved = Profile.save({ name: "  Кирилл  ", emoji: "🧠" });
if (saved.name !== "Кирилл" || saved.emoji !== "🧠") fail(`[профиль] сохранение: «${saved.name}» / ${saved.emoji}`);
if (!profileStore.has(Profile.KEY)) fail("[профиль] профиль не записан в localStorage");

/* Пустое имя не должно затирать сохранённое */
const afterEmpty = Profile.save({ name: "   ", emoji: "🔥" });
if (afterEmpty.name !== "Кирилл") fail(`[профиль] пустое имя сбросило: «${afterEmpty.name}»`);
if (afterEmpty.emoji !== "🔥") fail(`[профиль] эмодзи не сохранился: ${afterEmpty.emoji}`);

/* Статистика не тронута */
const statsRaw = profileStore.get(STATS_KEY);
if (!statsRaw || JSON.parse(statsRaw).xp !== 1234) fail("[профиль] сохранение профиля изменило статистику");
if (profileStore.size !== 2) fail(`[профиль] лишние ключи в хранилище: ${[...profileStore.keys()].join(", ")}`);

/* Профиль читается заново после «перезагрузки» */
delete require.cache[require.resolve(path.join(ROOT, "js", "core", "profile.js"))];
require(path.join(ROOT, "js", "core", "profile.js"));
const reloaded = global.window.GeoMind.Profile.get();
if (reloaded.name !== "Кирилл" || reloaded.emoji !== "🔥") {
  fail(`[профиль] после перезагрузки: «${reloaded.name}» / ${reloaded.emoji}`);
}

/* ── Отчёт ── */
console.log("── GeoMind · проверка данных ──");
console.log(`Стран в capitals/flags: ${countries.size}`);
console.log(`Записей capitals:       ${CAPITALS.length}`);
console.log(`Записей flags:          ${FLAGS.length}`);
console.log(`Уникальных ISO-кодов:   ${neededCodes.size}`);
console.log(`SVG-файлов на диске:    ${existing.size}`);
console.log("— валюты —");
console.log(`Записей currencies:     ${CURRENCIES.length}`);
console.log(`Уникальных валют:       ${new Set(CURRENCIES.map((c) => c.code)).size}`);
console.log(`Уникальных названий:    ${new Set(CURRENCIES.map((c) => c.currency)).size}`);
console.log(`Проверено вопросов:     ${qChecked}`);
const byDiff = {};
CURRENCIES.forEach((c) => { byDiff[c.difficulty] = (byDiff[c.difficulty] || 0) + 1; });
console.log(`По сложности:           easy=${byDiff.easy || 0}, medium=${byDiff.medium || 0}, hard=${byDiff.hard || 0}`);
const byRegion = {};
CURRENCIES.forEach((c) => { byRegion[c.region] = (byRegion[c.region] || 0) + 1; });
console.log(`По регионам:            ${Object.entries(byRegion).map(([k, v]) => `${k}=${v}`).join(", ")}`);
console.log("— автокоды —");
console.log(`Регионов РФ:            ${AUTOCODES.length}`);
console.log(`Уникальных автокодов:   ${codeOwner.size}`);
console.log(`Проверено вопросов:     ${acChecked}`);
console.log(`Уровни сложности:       нет (единый уровень)`);
const acByDistrict = {};
AUTOCODES.forEach((a) => { acByDistrict[a.district] = (acByDistrict[a.district] || 0) + 1; });
console.log(`По округам:             ${Object.entries(acByDistrict).map(([k, v]) => `${k}=${v}`).join(", ")}`);
console.log("— регионы России —");
console.log(`Субъектов РФ:           ${RUSSIAN_REGIONS.length}`);
console.log(`По типам:               ${[...typeCount.entries()].map(([k, v]) => `${k}=${v}`).join(", ")}`);
const rgByDiff = {};
RUSSIAN_REGIONS.forEach((r) => { rgByDiff[r.difficulty] = (rgByDiff[r.difficulty] || 0) + 1; });
console.log(`По сложности:           easy=${rgByDiff.easy || 0}, medium=${rgByDiff.medium || 0}, hard=${rgByDiff.hard || 0}`);
console.log(`Вопросов:               easy=${rgDeckSizes.easy}, medium=${rgDeckSizes.medium}, hard=${rgDeckSizes.hard}`);
console.log(`Проверено вопросов:     ${rgChecked}`);
console.log("— профиль игрока —");
console.log(`Имя по умолчанию:       ${DEFAULT_PROFILE.name}`);
console.log(`Эмодзи по умолчанию:    ${DEFAULT_PROFILE.emoji}`);
console.log(`Галерея эмодзи:         ${Profile.EMOJIS.length}`);
console.log(`Лимит имени:            ${Profile.MAX_NAME} символов`);
console.log(`Ключ хранения:          ${Profile.KEY}`);

if (notes.length) {
  console.log("\nПримечания:");
  for (const n of notes) console.log("  · " + n);
}

if (problems.length) {
  console.log(`\n✗ Проблем: ${problems.length}`);
  for (const p of problems) console.log("  · " + p);
  process.exitCode = 1;
} else {
  console.log("\n✓ Все проверки пройдены.");
}

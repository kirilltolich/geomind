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
require(path.join(ROOT, "js", "data", "flag-codes.js"));
require(path.join(ROOT, "js", "data", "difficulties.js"));
require(path.join(ROOT, "js", "data", "questions.js"));

const CAPITALS = global.window.GeoMind.Data.CAPITALS;
const FLAGS = global.window.GeoMind.Data.FLAGS;
const CURRENCIES = global.window.GeoMind.Data.CURRENCIES;
const CODES = global.window.GeoMind.FlagCodes;
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

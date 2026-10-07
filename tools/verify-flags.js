#!/usr/bin/env node
/**
 * tools/verify-flags.js
 *
 * Проверка целостности системы локальных флагов GeoMind.
 *
 * Что проверяется:
 *   1. У каждой страны из данных есть ISO-код.
 *   2. Для каждого ISO-кода есть локальный SVG в assets/flags/.
 *   3. В рабочем коде нет ссылок на внешний хостинг флагов (см. EXTERNAL_HOST).
 *   4. Нет сломанных путей и невалидных SVG.
 *   5. Нет дубликатов кодов (одной стране не может достаться чужой флаг)
 *      и нет двух стран с одинаковым флагом.
 *   6. В данных не осталось Unicode-флагов (региональных индикаторов).
 *   7. У записей flags.js есть gen — он нужен для формулировки вопроса.
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
require(path.join(ROOT, "js", "data", "flag-codes.js"));

const CAPITALS = global.window.GeoMind.Data.CAPITALS;
const FLAGS = global.window.GeoMind.Data.FLAGS;
const CODES = global.window.GeoMind.FlagCodes;

/* ── 1. ISO-коды в данных ── */
const allRecords = [
  ...CAPITALS.map((e) => ({ ...e, _src: "capitals.js" })),
  ...FLAGS.map((e) => ({ ...e, _src: "flags.js" })),
];

const countries = new Set(allRecords.map((e) => e.country));

for (const rec of allRecords) {
  if (!rec.code) fail(`[нет кода] ${rec._src}: «${rec.country}» без поля code`);
  if (!rec.difficulty) fail(`[нет сложности] ${rec._src}: «${rec.country}» без difficulty`);
}

/* ── 2. Код есть для каждой страны + нет расхождений с картой ── */
for (const country of countries) {
  if (!CODES[country]) {
    fail(`[нет кода в карте] «${country}» отсутствует в js/data/flag-codes.js`);
  }
}

/* ── 5. Дубликаты кодов ── */
const codeOwners = new Map(); // code -> [countries]
for (const rec of allRecords) {
  const code = rec.code;
  if (!code) continue;
  if (!codeOwners.has(code)) codeOwners.set(code, new Set());
  codeOwners.get(code).add(rec.country);

  const expected = CODES[rec.country];
  if (expected && expected !== code) {
    fail(`[расхождение] «${rec.country}»: в данных code="${code}", в карте "${expected}"`);
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

const missingFiles = [];
for (const code of [...neededCodes].sort()) {
  if (!existing.has(code)) missingFiles.push(code);
}
if (missingFiles.length) {
  fail(`[нет файлов] отсутствуют SVG: ${missingFiles.join(", ")}`);
}

/* ── 4. Валидность SVG и отсутствие внешних ссылок внутри них ── */
let hugeCount = 0;
for (const code of existing) {
  const file = path.join(FLAGS_DIR, `${code}.svg`);
  const content = fs.readFileSync(file, "utf8");
  const head = content.trim().slice(0, 200);
  if (!head.startsWith("<svg") && !head.startsWith("<?xml")) {
    fail(`[битый SVG] ${code}.svg не начинается с <svg`);
  }
  if (/https?:\/\/(?!www\.w3\.org)/.test(content)) {
    fail(`[внешняя ссылка] ${code}.svg ссылается на внешний ресурс`);
  }
  if (EXTERNAL_RE.test(content)) {
    fail(`[внешний хостинг] найдено в ${code}.svg`);
  }
  if (content.length > 200000) hugeCount++;
}

/* ── Лишние файлы ── */
const orphan = [...existing].filter((c) => !neededCodes.has(c));
if (orphan.length) note(`лишние SVG (не используются в данных): ${orphan.join(", ")}`);
if (hugeCount) note(`очень крупные SVG (>200 КБ): ${hugeCount} шт.`);

/* ── 3. Ссылки на внешний хостинг флагов в рабочем коде ── */
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

/* ── 6. Unicode-флаги в данных ── */
const regionalIndicator = /[\u{1F1E6}-\u{1F1FF}]{2}/u;
function scanForFlagsEmoji(absPath) {
  const text = fs.readFileSync(absPath, "utf8");
  if (regionalIndicator.test(text)) {
    fail(`[Unicode-флаг] найден в ${path.relative(ROOT, absPath)}`);
  }
}
for (const f of ["js/data/capitals.js", "js/data/flags.js"]) {
  scanForFlagsEmoji(path.join(ROOT, f));
}

/* ── 7. gen у записей flags.js ── */
for (const rec of FLAGS) {
  if (!rec.gen) fail(`[нет gen] flags.js: «${rec.country}» без родительного падежа`);
}

/* ── Отчёт ── */
console.log("── GeoMind · проверка флагов ──");
console.log(`Стран в данных:        ${countries.size}`);
console.log(`Записей capitals:      ${CAPITALS.length}`);
console.log(`Записей flags:         ${FLAGS.length}`);
console.log(`Уникальных ISO-кодов:  ${neededCodes.size}`);
console.log(`SVG-файлов на диске:   ${existing.size}`);
console.log(`Папка флагов:          ${path.relative(ROOT, FLAGS_DIR)}`);

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

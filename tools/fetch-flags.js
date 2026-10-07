#!/usr/bin/env node
/**
 * tools/fetch-flags.js
 *
 * Разовая загрузка SVG-флагов в assets/flags/{code}.svg.
 *
 * После выполнения этой команды приложение НЕ зависит от внешних сайтов:
 * все флаги лежат внутри проекта.
 *
 * Источник: flagcdn.com (открытые SVG-флаги, ISO 3166-1 alpha-2).
 * Скрипт нужен только на этапе разработки — в самом приложении он
 * не используется.
 *
 * Запуск:
 *   node tools/fetch-flags.js            # скачать отсутствующие
 *   node tools/fetch-flags.js --force    # перекачать все заново
 */

"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "assets", "flags");
const SOURCES = [
  (code) => `https://flagcdn.com/${code}.svg`,
  (code) => `https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${code}.svg`,
];

// Загружаем карту «страна → код» из самого приложения
global.window = {};
require(path.join(ROOT, "js", "data", "flag-codes.js"));
const CODES = global.window.GeoMind.FlagCodes;

const FORCE = process.argv.includes("--force");

function fetchUrl(url, redirectsLeft) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "GeoMind-build" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
        res.resume();
        return resolve(fetchUrl(res.headers.location, redirectsLeft - 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    }).on("error", reject);
  });
}

function isValidSvg(text) {
  const t = (text || "").trim();
  return t.startsWith("<svg") || t.startsWith("<?xml");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadOne(code) {
  for (const makeUrl of SOURCES) {
    const url = makeUrl(code);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const text = await fetchUrl(url, 5);
        if (!isValidSvg(text)) throw new Error("не SVG");
        return text;
      } catch (e) {
        if (attempt === 3) break;
        await sleep(400 * attempt);
      }
    }
  }
  return null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const codes = [...new Set(Object.values(CODES))].sort();
  let downloaded = 0;
  let skipped = 0;
  const failed = [];

  console.log(`Флагов к загрузке: ${codes.length} → ${OUT_DIR}`);

  for (const code of codes) {
    const file = path.join(OUT_DIR, `${code}.svg`);
    if (!FORCE && fs.existsSync(file) && fs.statSync(file).size > 50) {
      skipped++;
      continue;
    }
    const svg = await downloadOne(code);
    if (!svg) {
      failed.push(code);
      console.log(`  ✗ ${code}`);
      continue;
    }
    fs.writeFileSync(file, svg, "utf8");
    downloaded++;
    process.stdout.write(`  ✓ ${code} (${svg.length} b)\n`);
    await sleep(60); // мягко, чтобы не ловить rate limit
  }

  console.log(`\nСкачано: ${downloaded}, пропущено (уже есть): ${skipped}, ошибок: ${failed.length}`);
  if (failed.length) {
    console.log("Не удалось скачать:", failed.join(", "));
    process.exitCode = 1;
  }
}

main();

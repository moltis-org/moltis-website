#!/usr/bin/env node
/**
 * Validates structural parity between index.en.html and index.fr.html.
 * Checks: same number of sections, same IDs, same classes on key elements,
 * same interactive elements (buttons, links, inputs).
 */

import { readFileSync } from "fs";
import { JSDOM } from "jsdom";

const EN_FILE = "index.en.html";
const FR_FILE = "index.fr.html";

let exitCode = 0;

function fail(msg) {
  console.error(`  FAIL: ${msg}`);
  exitCode = 1;
}

function pass(msg) {
  console.log(`  OK: ${msg}`);
}

function loadDOM(file) {
  const html = readFileSync(file, "utf-8");
  return new JSDOM(html).window.document;
}

const enDoc = loadDOM(EN_FILE);
const frDoc = loadDOM(FR_FILE);

console.log("Validating i18n structural parity...\n");

// 1. Check <html lang>
const enLang = enDoc.documentElement.getAttribute("lang");
const frLang = frDoc.documentElement.getAttribute("lang");
if (enLang === "en") pass(`EN lang="${enLang}"`);
else fail(`EN lang should be "en", got "${enLang}"`);
if (frLang === "fr") pass(`FR lang="${frLang}"`);
else fail(`FR lang should be "fr", got "${frLang}"`);

// 2. Check og:locale
const enLocale = enDoc.querySelector('meta[property="og:locale"]')?.getAttribute("content");
const frLocale = frDoc.querySelector('meta[property="og:locale"]')?.getAttribute("content");
if (enLocale === "en_US") pass(`EN og:locale="${enLocale}"`);
else fail(`EN og:locale should be "en_US", got "${enLocale}"`);
if (frLocale === "fr_FR") pass(`FR og:locale="${frLocale}"`);
else fail(`FR og:locale should be "fr_FR", got "${frLocale}"`);

// 3. Compare element counts by selector
const selectors = [
  ".page-content",
  ".nav-tab",
  "table",
  "table tr",
  "table th",
  "table td",
  "img",
  "a[href]",
  "button",
  "svg",
  "[id]",
  "section, div.mb-8, div.mb-10",
];

for (const sel of selectors) {
  const enCount = enDoc.querySelectorAll(sel).length;
  const frCount = frDoc.querySelectorAll(sel).length;
  if (enCount === frCount) {
    pass(`${sel}: ${enCount} elements`);
  } else {
    fail(`${sel}: EN has ${enCount}, FR has ${frCount}`);
  }
}

// 4. Compare all IDs
const enIds = [...enDoc.querySelectorAll("[id]")].map((el) => el.id).sort();
const frIds = [...frDoc.querySelectorAll("[id]")].map((el) => el.id).sort();

const missingInFr = enIds.filter((id) => !frIds.includes(id));
const extraInFr = frIds.filter((id) => !enIds.includes(id));

if (missingInFr.length === 0) pass("All EN IDs present in FR");
else fail(`IDs missing in FR: ${missingInFr.join(", ")}`);

if (extraInFr.length === 0) pass("No extra IDs in FR");
else fail(`Extra IDs in FR: ${extraInFr.join(", ")}`);

// 5. Check data-page attributes match
const enPages = [...enDoc.querySelectorAll("[data-page]")]
  .map((el) => el.dataset.page)
  .sort();
const frPages = [...frDoc.querySelectorAll("[data-page]")]
  .map((el) => el.dataset.page)
  .sort();

if (JSON.stringify(enPages) === JSON.stringify(frPages)) {
  pass(`data-page attributes match (${enPages.length} elements)`);
} else {
  fail(`data-page mismatch: EN=[${enPages}] FR=[${frPages}]`);
}

// 6. Check data-tab attributes match
const enTabs = [...enDoc.querySelectorAll("[data-tab]")]
  .map((el) => el.dataset.tab)
  .sort();
const frTabs = [...frDoc.querySelectorAll("[data-tab]")]
  .map((el) => el.dataset.tab)
  .sort();

if (JSON.stringify(enTabs) === JSON.stringify(frTabs)) {
  pass(`data-tab attributes match (${enTabs.length} elements)`);
} else {
  fail(`data-tab mismatch: EN=[${enTabs}] FR=[${frTabs}]`);
}

// 7. Check external links match (hrefs)
const enHrefs = [...enDoc.querySelectorAll('a[href^="http"]')]
  .map((a) => a.href)
  .sort();
const frHrefs = [...frDoc.querySelectorAll('a[href^="http"]')]
  .map((a) => a.href)
  .sort();

if (JSON.stringify(enHrefs) === JSON.stringify(frHrefs)) {
  pass(`External links match (${enHrefs.length} links)`);
} else {
  const missingLinks = enHrefs.filter((h) => !frHrefs.includes(h));
  const extraLinks = frHrefs.filter((h) => !enHrefs.includes(h));
  if (missingLinks.length) fail(`Links missing in FR: ${missingLinks.join(", ")}`);
  if (extraLinks.length) fail(`Extra links in FR: ${extraLinks.join(", ")}`);
}

// Summary
console.log();
if (exitCode === 0) {
  console.log("All checks passed.");
} else {
  console.error("Some checks failed. Fix the issues above.");
}

process.exit(exitCode);

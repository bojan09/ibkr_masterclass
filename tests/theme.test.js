import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { applyTheme, normalizeTheme, resolveTheme } from "../js/theme.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function luminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/gi).map((value) => Number.parseInt(value, 16) / 255);
  const [red, green, blue] = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function themeToken(css, theme, token) {
  const block = theme === "light" ? css.match(/:root\[data-theme="light"\]\s*\{([\s\S]*?)\}/)[1] : css.match(/:root\s*\{([\s\S]*?)\}/)[1];
  return block.match(new RegExp(`${token}:\\s*(#[0-9a-f]{6})`, "i"))[1];
}

test("theme normalization accepts supported choices and rejects stale values", () => {
  assert.equal(normalizeTheme("dark"), "dark");
  assert.equal(normalizeTheme("light"), "light");
  assert.equal(normalizeTheme("system"), "system");
  assert.equal(normalizeTheme("sepia"), "system");
  assert.equal(normalizeTheme(undefined), "system");
});

test("system theme resolves from the operating system without changing explicit choices", () => {
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});

test("applying a theme exposes both selected and resolved values", () => {
  const root = { dataset: {}, style: { colorScheme: "" } };

  const resolved = applyTheme(root, "system", false);

  assert.equal(resolved, "light");
  assert.equal(root.dataset.theme, "light");
  assert.equal(root.dataset.themePreference, "system");
  assert.equal(root.style.colorScheme, "light");
});

test("theme text tiers retain readable contrast on panel surfaces", () => {
  const css = readFileSync(join(root, "css/variables.css"), "utf8");
  for (const theme of ["dark", "light"]) {
    const panel = themeToken(css, theme, "--color-panel");
    for (const token of ["--color-text", "--color-text-soft", "--color-muted", "--color-subtle"]) {
      assert.ok(contrast(themeToken(css, theme, token), panel) >= 4.5, `${theme} ${token} must meet 4.5:1 on panels`);
    }
  }
});

test("page heroes use a theme-aware surface instead of a dark-only endpoint", () => {
  const variables = readFileSync(join(root, "css/variables.css"), "utf8");
  const lessons = readFileSync(join(root, "css/lessons.css"), "utf8");
  assert.match(variables, /--gradient-page-hero:/);
  assert.match(variables, /:root\[data-theme="light"\][\s\S]*--gradient-page-hero:/);
  assert.match(lessons, /background:\s*var\(--gradient-page-hero\)/);
  assert.doesNotMatch(lessons, /#0d1117/i);
});

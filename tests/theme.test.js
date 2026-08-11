import test from "node:test";
import assert from "node:assert/strict";

import { applyTheme, normalizeTheme, resolveTheme } from "../js/theme.js";

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

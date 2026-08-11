import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("static shell provides security, accessibility, and responsive foundations", () => {
  const html = read("index.html");
  const components = read("css/components.css");
  const responsive = read("css/responsive.css");
  assert.match(html, /<html lang="en"[^>]*>/);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main[^>]+tabindex="-1"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /id="theme-select"/);
  assert.match(html, /data-theme-preference/);
  assert.match(html, /IBKR Platform Mastery/);
  assert.match(html, /not affiliated with, endorsed by, or connected to Interactive Brokers/i);
  assert.match(read("css/main.css"), /:focus-visible/);
  assert.match(read("css/responsive.css"), /prefers-reduced-motion/);
  assert.match(read("css/responsive.css"), /min-height: 44px/);
  assert.match(read("css/responsive.css"), /\.platform-compare \.page-hero[\s\S]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(read("css/responsive.css"), /\.topbar \.data-badge[\s\S]*display: none/);
  assert.match(html, /img-src 'self' data: https:\/\/www\.ibkrguides\.com https:\/\/ibkrguides\.com https:\/\/www\.interactivebrokers\.com https:\/\/interactivebrokers\.com/);
  assert.match(components, /\.mission-visual-card/);
  assert.match(components, /\.mission-visual-marker/);
  assert.match(components, /\.mission-visual-card\.is-image-error/);
  assert.match(components, /\.mission-visual-dialog::backdrop/);
  assert.match(responsive, /\.mission-visual-layout/);
});

test("every local stylesheet and script referenced by index exists", () => {
  const html = read("index.html");
  const references = [...html.matchAll(/(?:href|src)="\.\/([^"#?]+)"/g)].map((match) => match[1]);
  assert.ok(references.length >= 7);
  assert.deepEqual(references.filter((path) => !existsSync(join(root, path))), []);
});

test("all generated buttons declare a type and external tabs prevent referrer leakage", () => {
  const sources = ["index.html", ...readdirSync(join(root, "js")).filter((name) => name.endsWith(".js")).map((name) => `js/${name}`)].map(read).join("\n");
  assert.equal(/<button(?![^>]*\btype=)/.test(sources), false);
  const externalTabs = [...sources.matchAll(/<a[^>]+target="_blank"[^>]*>/g)].map((match) => match[0]);
  assert.ok(externalTabs.length >= 5);
  assert.ok(externalTabs.every((tag) => /rel="[^"]*noreferrer/.test(tag)));
});

test("localStorage remains centralized and repository contains no frontend secret assignment", () => {
  const jsFiles = readdirSync(join(root, "js")).filter((name) => name.endsWith(".js"));
  const directStorage = jsFiles.filter((name) => name !== "storage.js" && /\blocalStorage\b/.test(read(`js/${name}`)));
  assert.deepEqual(directStorage, []);
  const runtimeSource = [...jsFiles.map((name) => read(`js/${name}`)), ...readdirSync(join(root, "data")).filter((name) => name.endsWith(".js")).map((name) => read(`data/${name}`))].join("\n");
  assert.equal(/(?:api[_-]?key|secret|password|private[_-]?key)\s*[:=]\s*["'][^"']+/i.test(runtimeSource), false);
});

test("production runtime is dependency-free and remains within a static asset budget", () => {
  const packageData = JSON.parse(read("package.json"));
  assert.equal(packageData.version, "1.0.0");
  assert.equal(packageData.dependencies, undefined);
  const runtimeDirectories = ["css", "data", "js"];
  const runtimeBytes = runtimeDirectories.flatMap((directory) => readdirSync(join(root, directory)).map((name) => join(root, directory, name))).reduce((sum, path) => sum + statSync(path).size, statSync(join(root, "index.html")).size);
  assert.ok(runtimeBytes < 600_000, `Runtime is ${runtimeBytes} bytes`);
});

test("production identity never presents the removed imitation Desktop lab", () => {
  const runtime = [read("index.html"), ...readdirSync(join(root, "js")).filter((name) => name.endsWith(".js")).map((name) => read(`js/${name}`))].join("\n");
  assert.doesNotMatch(runtime, /IBKR Masterclass Desktop Lab/);
  assert.doesNotMatch(runtime, /IBKR Masterclass curriculum/);
  assert.match(read("README.md"), /^# IBKR Platform Mastery/m);
  assert.match(read("css/variables.css"), /:root\[data-theme="light"\]/);
});

test("documentation explains official screenshot provenance and privacy", () => {
  const readme = read("README.md");
  assert.match(readme, /official IBKR screenshots/i);
  assert.match(readme, /external image request/i);
  assert.match(readme, /screenshots[^\n]+source of truth/i);
  assert.match(readme, /no-referrer/i);
});

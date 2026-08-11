import test from "node:test";
import assert from "node:assert/strict";

import { CURRICULUM_MODULES } from "../data/courses.js";
import { LESSONS, getLessonById } from "../data/lessons.js";

test("IBKR fundamentals publishes four sourced lessons across phases two and three", () => {
  const ids = [
    "ibkr-overview",
    "ibkr-platform-ecosystem",
    "account-setup-permissions",
    "why-cant-i-trade-this",
  ];

  assert.equal(LESSONS.length, 7);
  assert.ok(ids.every((id) => getLessonById(id)));
  assert.deepEqual(CURRICULUM_MODULES[1].lessonIds, ids.slice(0, 2));
  assert.deepEqual(CURRICULUM_MODULES[2].lessonIds, ids.slice(2));
});

test("IBKR-specific lessons link to current official primary sources", () => {
  const lessons = LESSONS.slice(3);
  assert.equal(lessons.length, 4);
  for (const lesson of lessons) {
    assert.ok(lesson.sources.length >= 1, `${lesson.id} needs an official source`);
    assert.ok(
      lesson.sources.every(({ url }) => /^https:\/\/(www\.)?(interactivebrokers\.com|ibkrguides\.com)\//.test(url)),
      `${lesson.id} contains a non-IBKR source`,
    );
    assert.match(lesson.verifiedOn, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("platform ecosystem includes comparison-card data for five IBKR platforms", () => {
  const lesson = getLessonById("ibkr-platform-ecosystem");
  const comparison = lesson.sections.find((section) => section.type === "comparison");

  assert.equal(comparison.items.length, 5);
  assert.deepEqual(
    comparison.items.map((item) => item.name),
    ["IBKR Desktop", "Client Portal", "Trader Workstation", "IBKR Mobile", "GlobalTrader"],
  );
  assert.ok(comparison.items.every((item) => item.purpose && item.complexity && item.bestFor));
});

test("account troubleshooting lesson covers the required decision checklist", () => {
  const lesson = getLessonById("why-cant-i-trade-this");
  const checklist = lesson.sections.find((section) => section.type === "checklist");

  assert.deepEqual(checklist.items, [
    "Trading permission",
    "Account or regional restriction",
    "Product eligibility",
    "Available cash or margin",
    "Market session",
    "Contract identity",
    "Market-data status",
  ]);
});

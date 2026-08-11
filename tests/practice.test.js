import test from "node:test";
import assert from "node:assert/strict";

import { PAPER_CURRICULUM, PRACTICE_EXERCISES, TRADE_CHECKLIST } from "../data/practice.js";
import {
  createJournalEntry,
  derivePracticeStats,
  toggleChecklistItem,
  validateJournalDraft,
} from "../js/practice.js";

test("practice curriculum includes workflow, exercises, and a pre-trade checklist", () => {
  assert.ok(PAPER_CURRICULUM.length >= 5);
  assert.ok(PRACTICE_EXERCISES.length >= 4);
  assert.ok(TRADE_CHECKLIST.length >= 8);
  assert.ok(PRACTICE_EXERCISES.every((exercise) => exercise.successCriteria.length >= 2 && exercise.debrief.length >= 2));
});

test("checklist toggling is immutable and records booleans by stable id", () => {
  const original = {};
  const checked = toggleChecklistItem(original, TRADE_CHECKLIST[0].id);
  assert.equal(checked[TRADE_CHECKLIST[0].id], true);
  assert.deepEqual(original, {});
  assert.equal(toggleChecklistItem(checked, TRADE_CHECKLIST[0].id)[TRADE_CHECKLIST[0].id], false);
});

test("journal validation requires a thesis, risk plan, and review", () => {
  assert.deepEqual(validateJournalDraft({ thesis: "", riskPlan: "", review: "" }), ["Write the educational thesis or observation.", "Define the risk and invalidation plan.", "Record the post-exercise review."]);
  assert.deepEqual(validateJournalDraft({ thesis: "Observe spread", riskPlan: "No real order", review: "Limit waited" }), []);
});

test("journal entries are normalized and timestamped", () => {
  const entry = createJournalEntry({ symbol: " aapl ", thesis: " Observe spread ", riskPlan: " Simulated only ", result: "Working", review: " The limit waited " }, { id: "journal-1", now: "2026-08-11T12:00:00.000Z" });
  assert.equal(entry.id, "journal-1");
  assert.equal(entry.symbol, "AAPL");
  assert.equal(entry.thesis, "Observe spread");
  assert.equal(entry.createdAt, "2026-08-11T12:00:00.000Z");
});

test("practice statistics combine exercises, checklist, trades, and journal", () => {
  const stats = derivePracticeStats({ checklistCompletion: { "exercise:one": true, [TRADE_CHECKLIST[0].id]: true }, practiceTrades: [{ id: "t1" }], journalEntries: [{ id: "j1" }, { id: "j2" }] });
  assert.deepEqual(stats, { completedExercises: 1, checklistItems: 1, practiceTrades: 1, journalEntries: 2 });
});

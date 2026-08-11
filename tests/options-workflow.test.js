import test from "node:test";
import assert from "node:assert/strict";

import { OPTION_WORKFLOW_STEPS, POSITION_MANAGEMENT_ACTIONS } from "../data/options-workflow.js";
import { OPTION_CHAIN } from "../data/simulated-options-data.js";
import {
  calculateComboQuote,
  simulateComboLimit,
  validateOptionCombo,
} from "../js/options-workflow.js";

const longCall = OPTION_CHAIN.find((contract) => contract.expiration === "2026-09-18" && contract.strike === 225 && contract.right === "call");
const shortCall = OPTION_CHAIN.find((contract) => contract.expiration === "2026-09-18" && contract.strike === 230 && contract.right === "call");
const legs = [{ contract: longCall, side: "BUY", ratio: 1 }, { contract: shortCall, side: "SELL", ratio: 1 }];

test("IBKR options workflow covers selection through position management", () => {
  assert.deepEqual(OPTION_WORKFLOW_STEPS.map((step) => step.id), ["underlying", "chain", "contract", "legs", "ticket", "preview", "monitor", "manage"]);
  assert.ok(OPTION_WORKFLOW_STEPS.every((step) => step.verify.length >= 2 && step.mistake));
  assert.deepEqual(POSITION_MANAGEMENT_ACTIONS.map((action) => action.id), ["close", "roll", "exercise", "expire"]);
});

test("combo quote calculates natural debit, midpoint, and multiplier exposure", () => {
  const quote = calculateComboQuote(legs, 2);
  assert.ok(quote.naturalDebit >= quote.midDebit);
  assert.equal(quote.contracts, 2);
  assert.equal(quote.naturalCash, quote.naturalDebit * 2 * 100);
});

test("combo validation catches ratio, identity, and duplicate-side errors", () => {
  assert.deepEqual(validateOptionCombo(legs), []);
  assert.ok(validateOptionCombo([{ ...legs[0], ratio: 0 }]).some((message) => /ratio/i.test(message)));
  assert.ok(validateOptionCombo([{ ...legs[0] }, { ...legs[0] }]).some((message) => /duplicate/i.test(message)));
});

test("combo limit simulation distinguishes fill from working without promising execution", () => {
  const combo = calculateComboQuote(legs, 1);
  const filled = simulateComboLimit({ legs, quantity: 1, limitDebit: combo.naturalDebit });
  const working = simulateComboLimit({ legs, quantity: 1, limitDebit: combo.midDebit - 0.5 });
  assert.equal(filled.status, "filled");
  assert.equal(working.status, "working");
  assert.match(filled.explanation, /educational/i);
});

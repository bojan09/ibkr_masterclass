import test from "node:test";
import assert from "node:assert/strict";

import { OPTIONS_FUNDAMENTALS, OPTION_RIGHTS, EXPIRATION_WORKFLOW } from "../data/options.js";
import {
  calculateBreakeven,
  calculateIntrinsicValue,
  calculateOptionContractCost,
  calculateOptionPnlAtExpiration,
  calculateTimeValue,
} from "../js/options-fundamentals.js";

test("options curriculum covers calls, puts, contracts, premium, expiration, exercise, and assignment", () => {
  assert.deepEqual(OPTION_RIGHTS.map((item) => item.id), ["call", "put"]);
  assert.ok(OPTIONS_FUNDAMENTALS.length >= 7);
  assert.ok(OPTIONS_FUNDAMENTALS.every((topic) => topic.what && topic.why && topic.risks.length && topic.mistakes.length));
  assert.ok(EXPIRATION_WORKFLOW.length >= 5);
});

test("intrinsic value respects option right and never falls below zero", () => {
  assert.equal(calculateIntrinsicValue({ right: "call", stockPrice: 110, strike: 100 }), 10);
  assert.equal(calculateIntrinsicValue({ right: "call", stockPrice: 90, strike: 100 }), 0);
  assert.equal(calculateIntrinsicValue({ right: "put", stockPrice: 90, strike: 100 }), 10);
  assert.equal(calculateIntrinsicValue({ right: "put", stockPrice: 110, strike: 100 }), 0);
});

test("time value is premium minus intrinsic value with a zero floor", () => {
  assert.equal(calculateTimeValue({ premium: 13.5, intrinsicValue: 10 }), 3.5);
  assert.equal(calculateTimeValue({ premium: 8, intrinsicValue: 10 }), 0);
});

test("contract cost and long-option breakeven include the multiplier", () => {
  assert.equal(calculateOptionContractCost({ premium: 3.25, contracts: 2, multiplier: 100 }), 650);
  assert.equal(calculateBreakeven({ right: "call", strike: 100, premium: 3.25 }), 103.25);
  assert.equal(calculateBreakeven({ right: "put", strike: 100, premium: 3.25 }), 96.75);
});

test("long option expiration profit and loss distinguishes value from premium paid", () => {
  assert.equal(calculateOptionPnlAtExpiration({ right: "call", stockPrice: 110, strike: 100, premium: 3, contracts: 1, multiplier: 100 }), 700);
  assert.equal(calculateOptionPnlAtExpiration({ right: "put", stockPrice: 95, strike: 100, premium: 7, contracts: 1, multiplier: 100 }), -200);
  assert.equal(calculateOptionPnlAtExpiration({ right: "call", stockPrice: 90, strike: 100, premium: 3, contracts: 2, multiplier: 100 }), -600);
});

import test from "node:test";
import assert from "node:assert/strict";

import { ORDER_TYPES, TIME_IN_FORCE, TROUBLESHOOTING_STEPS } from "../data/orders.js";
import {
  calculateMidPrice,
  calculateOrderExposure,
  calculateSpread,
  simulateOrder,
  validateOrder,
} from "../js/order-simulator.js";

const quote = { symbol: "AAPL", bid: 100, ask: 100.1, last: 100.05 };

test("order academy defines behavior, use, risk, and mistakes for core order types", () => {
  assert.deepEqual(ORDER_TYPES.map((type) => type.id), ["market", "limit", "stop", "stop-limit", "trailing"]);
  assert.ok(ORDER_TYPES.every((type) => type.behavior && type.use && type.risk && type.mistake));
  assert.deepEqual(TIME_IN_FORCE.map((item) => item.id), ["DAY", "GTC", "IOC"]);
  assert.ok(TROUBLESHOOTING_STEPS.length >= 6);
});

test("quote calculations expose spread, midpoint, and order exposure", () => {
  assert.equal(calculateSpread(quote), 0.1);
  assert.equal(calculateMidPrice(quote), 100.05);
  assert.equal(calculateOrderExposure({ quantity: 10, referencePrice: 100.1, multiplier: 1 }), 1001);
  assert.equal(calculateOrderExposure({ quantity: 2, referencePrice: 3.5, multiplier: 100 }), 700);
});

test("order validation rejects incomplete or unsafe simulator instructions", () => {
  assert.deepEqual(validateOrder({ symbol: "AAPL", side: "BUY", quantity: 0, type: "market", timeInForce: "DAY" }), ["Quantity must be a positive whole number."]);
  assert.ok(validateOrder({ symbol: "AAPL", side: "BUY", quantity: 1, type: "limit", timeInForce: "DAY" }).includes("Limit price is required for this order type."));
  assert.ok(validateOrder({ symbol: "AAPL", side: "HOLD", quantity: 1, type: "market", timeInForce: "DAY" }).includes("Side must be BUY or SELL."));
});

test("market simulation fills at the displayed opposite side, not last", () => {
  const buy = simulateOrder({ symbol: "AAPL", side: "BUY", quantity: 10, type: "market", timeInForce: "DAY" }, quote);
  const sell = simulateOrder({ symbol: "AAPL", side: "SELL", quantity: 10, type: "market", timeInForce: "DAY" }, quote);
  assert.equal(buy.status, "filled");
  assert.equal(buy.fillPrice, quote.ask);
  assert.equal(sell.fillPrice, quote.bid);
  assert.match(buy.explanation, /available ask/i);
});

test("limit simulation distinguishes marketable and waiting orders", () => {
  const crossing = simulateOrder({ symbol: "AAPL", side: "BUY", quantity: 2, type: "limit", limitPrice: 100.1, timeInForce: "DAY" }, quote);
  const waiting = simulateOrder({ symbol: "AAPL", side: "BUY", quantity: 2, type: "limit", limitPrice: 99.5, timeInForce: "DAY" }, quote);
  assert.equal(crossing.status, "filled");
  assert.equal(waiting.status, "working");
  assert.equal(waiting.remainingQuantity, 2);
});

test("invalid instructions are rejected with no simulated exposure", () => {
  const result = simulateOrder({ symbol: "AAPL", side: "BUY", quantity: -2, type: "market", timeInForce: "DAY" }, quote);
  assert.equal(result.status, "rejected");
  assert.equal(result.fillPrice, undefined);
  assert.ok(result.messages.length);
});

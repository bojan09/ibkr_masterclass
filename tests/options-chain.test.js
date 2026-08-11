import test from "node:test";
import assert from "node:assert/strict";

import { OPTION_CHAIN, OPTION_CHAIN_COLUMNS, OPTION_EXPIRATIONS } from "../data/simulated-options-data.js";
import {
  assessOptionLiquidity,
  calculateOptionMid,
  classifyMoneyness,
  filterOptionChain,
} from "../js/options-chain.js";

test("simulated option chain has two expirations, both rights, and explicit identity", () => {
  assert.equal(OPTION_EXPIRATIONS.length, 2);
  assert.ok(OPTION_CHAIN.length >= 20);
  assert.deepEqual(new Set(OPTION_CHAIN.map((contract) => contract.right)), new Set(["call", "put"]));
  assert.ok(OPTION_CHAIN.every((contract) => contract.simulated && contract.expiration && contract.strike && contract.multiplier === 100));
  assert.ok(OPTION_CHAIN_COLUMNS.every((column) => column.explanation.length >= 30));
});

test("option midpoint and moneyness calculations are right-aware", () => {
  assert.equal(calculateOptionMid({ bid: 2.1, ask: 2.3 }), 2.2);
  assert.equal(classifyMoneyness({ right: "call", strike: 220, underlyingPrice: 227.16 }), "ITM");
  assert.equal(classifyMoneyness({ right: "put", strike: 220, underlyingPrice: 227.16 }), "OTM");
  assert.equal(classifyMoneyness({ right: "call", strike: 227.16, underlyingPrice: 227.16 }), "ATM");
});

test("chain filters expiration, right, and strike distance without mutation", () => {
  const originalLength = OPTION_CHAIN.length;
  const filtered = filterOptionChain(OPTION_CHAIN, { expiration: OPTION_EXPIRATIONS[0], right: "call", centerStrike: 225, strikeRange: 5 });
  assert.ok(filtered.length > 0);
  assert.ok(filtered.every((contract) => contract.expiration === OPTION_EXPIRATIONS[0] && contract.right === "call" && Math.abs(contract.strike - 225) <= 5));
  assert.equal(OPTION_CHAIN.length, originalLength);
});

test("liquidity assessment returns evidence and avoids execution guarantees", () => {
  const liquid = assessOptionLiquidity({ bid: 4.9, ask: 5.1, volume: 1200, openInterest: 6400 });
  const thin = assessOptionLiquidity({ bid: 0.1, ask: 0.6, volume: 2, openInterest: 8 });
  assert.equal(liquid.level, "stronger");
  assert.equal(thin.level, "weaker");
  assert.match(liquid.explanation, /do(?:es)? not guarantee/i);
});

import test from "node:test";
import assert from "node:assert/strict";

import { GREEK_GUIDE, VOLATILITY_GUIDE } from "../data/greeks.js";
import { calculateBlackScholes } from "../js/greeks-simulator.js";

function closeTo(actual, expected, tolerance) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} not within ${tolerance} of ${expected}`);
}

test("Greek education defines meaning, unit, limitations, and misuse", () => {
  assert.deepEqual(GREEK_GUIDE.map((greek) => greek.id), ["delta", "gamma", "theta", "vega", "rho"]);
  assert.ok(GREEK_GUIDE.every((greek) => greek.meaning && greek.unit && greek.limit && greek.misuse));
  assert.ok(VOLATILITY_GUIDE.length >= 3);
});

test("Black-Scholes call benchmark is calculated in documented units", () => {
  const result = calculateBlackScholes({ right: "call", stockPrice: 100, strike: 100, years: 1, rate: 0.05, volatility: 0.2 });
  closeTo(result.price, 10.4506, 0.01);
  closeTo(result.delta, 0.6368, 0.001);
  closeTo(result.gamma, 0.01876, 0.0001);
  closeTo(result.theta, -0.01757, 0.0002);
  closeTo(result.vega, 0.3752, 0.001);
  closeTo(result.rho, 0.5323, 0.002);
});

test("put benchmark has negative delta and rho while gamma and vega match the call", () => {
  const call = calculateBlackScholes({ right: "call", stockPrice: 100, strike: 100, years: 1, rate: 0.05, volatility: 0.2 });
  const put = calculateBlackScholes({ right: "put", stockPrice: 100, strike: 100, years: 1, rate: 0.05, volatility: 0.2 });
  closeTo(put.price, 5.5735, 0.01);
  closeTo(put.delta, -0.3632, 0.001);
  assert.equal(put.gamma, call.gamma);
  assert.equal(put.vega, call.vega);
  assert.ok(put.rho < 0);
});

test("model rejects impossible numeric inputs", () => {
  assert.throws(() => calculateBlackScholes({ right: "call", stockPrice: 0, strike: 100, years: 1, rate: 0.05, volatility: 0.2 }), /positive/);
  assert.throws(() => calculateBlackScholes({ right: "other", stockPrice: 100, strike: 100, years: 1, rate: 0.05, volatility: 0.2 }), /call or put/);
});

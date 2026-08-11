import test from "node:test";
import assert from "node:assert/strict";

import { OPTION_STRATEGIES } from "../data/strategies.js";
import {
  calculateDefinedRiskVertical,
  calculateLegPayoff,
  calculateStrategyPayoff,
  createPayoffSeries,
} from "../js/payoff-simulator.js";

test("strategy library includes single-leg, stock-plus-option, and vertical examples", () => {
  assert.ok(OPTION_STRATEGIES.length >= 6);
  assert.ok(OPTION_STRATEGIES.some((strategy) => strategy.legs.length === 1));
  assert.ok(OPTION_STRATEGIES.some((strategy) => strategy.legs.some((leg) => leg.instrument === "stock")));
  assert.ok(OPTION_STRATEGIES.some((strategy) => strategy.legs.length > 1));
  assert.ok(OPTION_STRATEGIES.every((strategy) => strategy.outlook && strategy.risk && strategy.exitQuestions.length));
});

test("leg payoff handles long and short calls, puts, and stock at expiration", () => {
  assert.equal(calculateLegPayoff({ instrument: "option", right: "call", side: "long", strike: 100, premium: 3, quantity: 1, multiplier: 100 }, 110), 700);
  assert.equal(calculateLegPayoff({ instrument: "option", right: "put", side: "short", strike: 100, premium: 4, quantity: 1, multiplier: 100 }, 90), -600);
  assert.equal(calculateLegPayoff({ instrument: "stock", side: "long", entryPrice: 100, quantity: 10, multiplier: 1 }, 105), 50);
});

test("strategy payoff sums every leg", () => {
  const bullCall = OPTION_STRATEGIES.find((strategy) => strategy.id === "bull-call-spread");
  assert.equal(calculateStrategyPayoff(bullCall.legs, 90), -250);
  assert.equal(calculateStrategyPayoff(bullCall.legs, 110), 250);
});

test("defined-risk vertical profile calculates debit, maximums, and breakeven", () => {
  const bullCall = OPTION_STRATEGIES.find((strategy) => strategy.id === "bull-call-spread");
  assert.deepEqual(calculateDefinedRiskVertical(bullCall.legs), { netDebit: 2.5, width: 5, maxLoss: 250, maxProfit: 250, breakeven: 102.5 });
  const bearPut = OPTION_STRATEGIES.find((strategy) => strategy.id === "bear-put-spread");
  assert.equal(calculateDefinedRiskVertical(bearPut.legs).breakeven, 97.2);
});

test("payoff series is ordered and includes all critical strikes", () => {
  const strategy = OPTION_STRATEGIES.find((item) => item.id === "bull-call-spread");
  const series = createPayoffSeries(strategy.legs, { minimum: 80, maximum: 120, step: 2 });
  assert.equal(series[0].underlyingPrice, 80);
  assert.equal(series.at(-1).underlyingPrice, 120);
  assert.ok(series.some((point) => point.underlyingPrice === 100));
  assert.ok(series.some((point) => point.underlyingPrice === 105));
});

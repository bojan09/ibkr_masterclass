import test from "node:test";
import assert from "node:assert/strict";

import { RISK_TOPICS, FEE_COMPONENTS, MARGIN_SAFETY_CHECKS } from "../data/risk.js";
import {
  calculateFeeImpact,
  calculateMarginBuffer,
  calculatePortfolioExposure,
  calculatePositionSize,
  convertCurrency,
} from "../js/risk-lab.js";

test("risk education covers margin, sizing, portfolio, currency, and fees without fixed rates", () => {
  assert.ok(RISK_TOPICS.length >= 6);
  assert.ok(RISK_TOPICS.every((topic) => topic.risk && topic.verify.length));
  assert.ok(FEE_COMPONENTS.length >= 5);
  assert.ok(MARGIN_SAFETY_CHECKS.length >= 5);
  assert.ok(FEE_COMPONENTS.every((component) => !/\d+\.\d+%/.test(component.body)));
});

test("position sizing converts a loss budget and stop distance into whole units", () => {
  assert.deepEqual(calculatePositionSize({ accountValue: 50000, riskPercent: 1, entryPrice: 100, stopPrice: 95, multiplier: 1 }), { riskBudget: 500, riskPerUnit: 5, units: 100, modeledRisk: 500 });
  assert.equal(calculatePositionSize({ accountValue: 50000, riskPercent: 1, entryPrice: 5, stopPrice: 4, multiplier: 100 }).units, 5);
  assert.throws(() => calculatePositionSize({ accountValue: 0, riskPercent: 1, entryPrice: 100, stopPrice: 95 }), /positive/);
});

test("margin buffer distinguishes cushion and utilization", () => {
  assert.deepEqual(calculateMarginBuffer({ netLiquidation: 100000, maintenanceMargin: 30000 }), { excessLiquidity: 70000, utilizationPercent: 30, cushionPercent: 70 });
  assert.equal(calculateMarginBuffer({ netLiquidation: 100000, maintenanceMargin: 120000 }).excessLiquidity, -20000);
});

test("portfolio exposure returns gross, net, and concentration", () => {
  const exposure = calculatePortfolioExposure([{ symbol: "A", marketValue: 6000 }, { symbol: "B", marketValue: -2000 }, { symbol: "C", marketValue: 2000 }]);
  assert.equal(exposure.gross, 10000);
  assert.equal(exposure.net, 6000);
  assert.equal(exposure.largestConcentrationPercent, 60);
});

test("fee impact and currency conversion make assumptions explicit", () => {
  assert.deepEqual(calculateFeeImpact({ totalFees: 4, tradeValue: 2000 }), { feePercent: 0.2, breakEvenMovePercent: 0.2 });
  assert.equal(convertCurrency({ amount: 1000, rate: 1.08 }), 1080);
});

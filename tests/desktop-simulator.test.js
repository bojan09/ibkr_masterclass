import test from "node:test";
import assert from "node:assert/strict";

import {
  CONTRACTS,
  DESKTOP_TOUR_STEPS,
  MARKET_COLUMNS,
  PORTFOLIO_POSITIONS,
  SIMULATED_QUOTES,
} from "../data/simulated-market-data.js";
import {
  addWatchlistSymbol,
  derivePortfolioRows,
  moveWatchlistSymbol,
  removeWatchlistSymbol,
  searchContracts,
  sortWatchlist,
} from "../js/desktop-simulator.js";

test("desktop simulation centralizes clearly simulated market content", () => {
  assert.equal(SIMULATED_QUOTES.length, 7);
  assert.ok(SIMULATED_QUOTES.every((quote) => quote.simulated === true));
  assert.ok(SIMULATED_QUOTES.every((quote) => quote.ask >= quote.bid));
  assert.ok(MARKET_COLUMNS.every((column) => column.explanation.length >= 30));
});

test("guided tour covers the eight required desktop workflow areas", () => {
  assert.deepEqual(
    DESKTOP_TOUR_STEPS.map((step) => step.id),
    ["search", "watchlist", "chart", "instrument", "order-ticket", "portfolio", "orders", "option-chain"],
  );
  assert.ok(DESKTOP_TOUR_STEPS.every((step) => step.what && step.why && step.mistake && step.bestPractice));
});

test("contract search distinguishes asset class, venue, currency, and contract identity", () => {
  const results = searchContracts("aapl");
  assert.equal(results.length, 4);
  assert.deepEqual(new Set(results.map((contract) => contract.assetClass)), new Set(["Stock", "Option", "CFD"]));
  assert.ok(CONTRACTS.every((contract) => contract.exchange && contract.currency && contract.multiplier));
});

test("watchlist helpers add, remove, reorder, and sort without mutating inputs", () => {
  const original = ["SPY", "AAPL", "MSFT"];
  assert.deepEqual(addWatchlistSymbol(original, "NVDA"), ["SPY", "AAPL", "MSFT", "NVDA"]);
  assert.deepEqual(addWatchlistSymbol(original, "spy"), original);
  assert.deepEqual(removeWatchlistSymbol(original, "AAPL"), ["SPY", "MSFT"]);
  assert.deepEqual(moveWatchlistSymbol(original, "MSFT", -1), ["SPY", "MSFT", "AAPL"]);
  assert.deepEqual(sortWatchlist(original, "last", "desc"), ["SPY", "MSFT", "AAPL"]);
  assert.deepEqual(original, ["SPY", "AAPL", "MSFT"]);
});

test("portfolio presentation derives market value and unrealized profit and loss", () => {
  const rows = derivePortfolioRows(PORTFOLIO_POSITIONS);
  assert.ok(rows.every((row) => Number.isFinite(row.marketValue) && Number.isFinite(row.unrealizedPnl)));
  assert.equal(rows[0].marketValue, rows[0].quantity * rows[0].last);
  assert.equal(rows[0].unrealizedPnl, rows[0].quantity * (rows[0].last - rows[0].averageCost));
});

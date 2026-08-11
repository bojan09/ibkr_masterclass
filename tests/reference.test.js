import test from "node:test";
import assert from "node:assert/strict";

import { GLOSSARY_TERMS, REFERENCE_TOPICS } from "../data/reference.js";

const REQUIRED_REFERENCE_ROUTES = [
  "ibkr-desktop/market-data", "ibkr-desktop/news-research", "ibkr-desktop/alerts", "ibkr-desktop/account-information", "ibkr-desktop/best-practices",
  "trading-basics/stocks", "trading-basics/etfs", "trading-basics/market-structure", "trading-basics/bid-ask", "trading-basics/spread", "trading-basics/liquidity", "trading-basics/trading-sessions", "trading-basics/extended-hours",
  "reference/quick-reference", "reference/beginner-mistakes", "reference/troubleshooting", "reference/best-practices",
];

test("production reference topics close every remaining mapped curriculum route", () => {
  assert.deepEqual(Object.keys(REFERENCE_TOPICS).sort(), REQUIRED_REFERENCE_ROUTES.sort());
  assert.ok(Object.values(REFERENCE_TOPICS).every((topic) => topic.summary.length >= 50 && topic.sections.length >= 3 && topic.sections.every((section) => section.body.length >= 50)));
});

test("glossary is searchable-quality, unique, and educational", () => {
  assert.ok(GLOSSARY_TERMS.length >= 30);
  assert.equal(new Set(GLOSSARY_TERMS.map((term) => term.term.toLowerCase())).size, GLOSSARY_TERMS.length);
  assert.ok(GLOSSARY_TERMS.every((term) => term.definition.length >= 40 && term.category));
});

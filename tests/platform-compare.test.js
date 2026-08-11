import test from "node:test";
import assert from "node:assert/strict";

import { PLATFORM_EQUIVALENTS, getComparisonCoverage, getEquivalentTask } from "../data/platform-equivalents.js";

test("comparison covers every core workflow with real locations in both applications", () => {
  assert.deepEqual(getComparisonCoverage().missing, []);
  assert.ok(PLATFORM_EQUIVALENTS.length >= 10);
  assert.ok(PLATFORM_EQUIVALENTS.every((item) => item.desktop.location && item.tws.location));
  assert.equal(getEquivalentTask("contract-search").task, "Find and verify a contract");
  assert.equal(getEquivalentTask("missing"), undefined);
});

test("comparison preserves important non-equivalences instead of inventing parity", () => {
  const differences = PLATFORM_EQUIVALENTS.filter((item) => item.kind === "non-equivalent");
  assert.ok(differences.length >= 2);
  assert.ok(differences.every((item) => item.explanation.length >= 40));
});

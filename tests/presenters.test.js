import test from "node:test";
import assert from "node:assert/strict";

import { getMetricDisplay, getPhaseProgress } from "../js/dashboard.js";
import { getPlannedRouteContext } from "../js/navigation.js";

test("metric display formats numbers, fractions, and percentages", () => {
  assert.equal(getMetricDisplay({ value: 0, format: "number" }), "0");
  assert.equal(getMetricDisplay({ value: 2, total: 13, format: "fraction" }), "2 / 13");
  assert.equal(getMetricDisplay({ value: 82, format: "percent" }), "82%");
});

test("phase progress clamps values to an accessible percentage", () => {
  assert.equal(getPhaseProgress(0, 13), 0);
  assert.equal(getPhaseProgress(6, 13), 46);
  assert.equal(getPhaseProgress(18, 13), 100);
  assert.equal(getPhaseProgress(1, 0), 0);
});

test("planned route context resolves navigation labels without inventing content", () => {
  assert.deepEqual(getPlannedRouteContext("options/greeks"), {
    title: "Greeks",
    section: "Options",
  });
  assert.deepEqual(getPlannedRouteContext("missing/route"), {
    title: "Page not found",
    section: "Unknown route",
  });
});

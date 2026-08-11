import test from "node:test";
import assert from "node:assert/strict";

import { PLATFORM_ORDER, PLATFORMS, getPlatform, getPlatformSourceStatus } from "../data/platforms.js";
import { getKnownRoutes } from "../data/navigation.js";
import { isStandaloneExperienceRoute } from "../data/route-manifest.js";

test("platform curriculum teaches current IBKR Desktop before TWS Mosaic", () => {
  assert.deepEqual(PLATFORM_ORDER, ["ibkr-desktop", "tws-mosaic"]);
  assert.equal(getPlatform("ibkr-desktop").level, "Beginner to intermediate");
  assert.equal(getPlatform("tws-mosaic").level, "Intermediate to advanced");
  assert.equal(getPlatform("missing"), undefined);
});

test("platform metadata uses dated official IBKR sources", () => {
  assert.equal(PLATFORMS.length, 2);
  for (const platform of PLATFORMS) {
    assert.match(platform.asOf, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(platform.reviewAfter, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(platform.sources.length >= 3);
    assert.ok(platform.sources.every((source) => {
      const hostname = new URL(source.url).hostname;
      return hostname.endsWith("interactivebrokers.com") || hostname.endsWith("ibkrguides.com");
    }));
  }
  assert.equal(getPlatformSourceStatus(getPlatform("ibkr-desktop"), new Date("2026-09-01")), "current");
  assert.equal(getPlatformSourceStatus(getPlatform("ibkr-desktop"), new Date("2027-03-01")), "review");
});

test("platform hub routes are published standalone experiences", () => {
  const routes = ["platforms", "platforms/desktop", "platforms/tws", "platforms/safety"];
  const known = getKnownRoutes();
  assert.ok(routes.every((route) => known.has(route)));
  assert.ok(routes.every((route) => isStandaloneExperienceRoute(route)));
});

import test from "node:test";
import assert from "node:assert/strict";

import { PLATFORM_WORKFLOWS } from "../data/platform-workflows.js";
import {
  ALLOWED_VISUAL_HOSTS,
  PLATFORM_VISUALS,
  getMissionVisuals,
  getWalkthroughVisuals,
  isAllowedOfficialVisualUrl,
  validatePlatformVisual,
} from "../data/platform-visuals.js";

test("every genuine-platform mission has an official visual", () => {
  assert.equal(PLATFORM_WORKFLOWS.length, 32);
  for (const mission of PLATFORM_WORKFLOWS) {
    const visuals = getMissionVisuals(mission.id);
    assert.ok(visuals.length >= 1, mission.id);
    assert.ok(visuals.every((visual) => visual.missionIds.includes(mission.id)));
  }
});

test("visuals have valid provenance, dates, alt text, and callouts", () => {
  assert.deepEqual(ALLOWED_VISUAL_HOSTS, [
    "interactivebrokers.com",
    "www.interactivebrokers.com",
    "ibkrguides.com",
    "www.ibkrguides.com",
  ]);
  assert.ok(PLATFORM_VISUALS.length >= 15);
  for (const visual of PLATFORM_VISUALS) {
    assert.equal(validatePlatformVisual(visual), true, visual.id);
    assert.equal(isAllowedOfficialVisualUrl(visual.imageUrl), true, visual.imageUrl);
    assert.equal(isAllowedOfficialVisualUrl(visual.sourceUrl), true, visual.sourceUrl);
    assert.match(visual.sourceUpdated, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(visual.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(visual.alt.length >= 30, visual.id);
    assert.equal(new Set(visual.callouts.map(({ id }) => id)).size, visual.callouts.length);
    assert.ok(visual.callouts.every(({ x, y }) => x >= 0 && x <= 100 && y >= 0 && y <= 100));
  }
});

test("visual URL validation rejects insecure and third-party assets", () => {
  assert.equal(isAllowedOfficialVisualUrl("http://www.ibkrguides.com/example.png"), false);
  assert.equal(isAllowedOfficialVisualUrl("https://example.com/ibkr.png"), false);
  assert.equal(isAllowedOfficialVisualUrl("not a url"), false);
  assert.equal(validatePlatformVisual({}), false);
});

test("the visual catalog is immutable", () => {
  assert.equal(Object.isFrozen(PLATFORM_VISUALS), true);
  assert.ok(PLATFORM_VISUALS.every((visual) => Object.isFrozen(visual) && Object.isFrozen(visual.missionIds) && Object.isFrozen(visual.callouts)));
});

test("walkthrough visuals resolve immutable valid practice-step links", () => {
  for (const workflow of PLATFORM_WORKFLOWS) {
    const linked = getWalkthroughVisuals(workflow.id);
    assert.ok(linked.length >= 1, workflow.id);
    for (const item of linked) {
      assert.equal(item.visual.missionIds.includes(workflow.id), true);
      assert.ok(item.steps.length >= 1);
      assert.ok(item.steps.every((step) => Number.isInteger(step) && step >= 1 && step <= workflow.steps.length));
      assert.ok(item.caption.length >= 20);
      assert.ok(Object.isFrozen(item));
      assert.ok(Object.isFrozen(item.steps));
    }
  }
});

test("visual step-link keys exactly match mapped workflows", () => {
  for (const visual of PLATFORM_VISUALS) {
    assert.deepEqual(Object.keys(visual.stepLinks).sort(), [...visual.missionIds].sort(), visual.id);
    assert.ok(Object.isFrozen(visual.stepLinks));
    assert.ok(Object.values(visual.stepLinks).every((link) => Object.isFrozen(link) && Object.isFrozen(link.steps)));
  }
});

test("TWS risk review uses the current official Performance Profile asset", () => {
  const [visual] = getMissionVisuals("tws-risk-review");
  assert.equal(visual.sourceUrl, "https://www.ibkrguides.com/traderworkstation/performance-profile.htm");
  assert.equal(visual.imageUrl, "https://www.ibkrguides.com/traderworkstation/resources/images/performanceprofile1.png");
});

test("TWS Mosaic overview callouts identify the panels shown in the official image", () => {
  const [visual] = getMissionVisuals("tws-mosaic-layout");
  assert.deepEqual(visual.callouts, [
    { id: "tws-monitor-panel", label: "Monitor panel", x: 78, y: 30 },
    { id: "tws-chart-panel", label: "Chart panel", x: 28, y: 50 },
    { id: "tws-order-entry-panel", label: "Order Entry panel", x: 26, y: 14 },
    { id: "tws-activity-panel", label: "Activity panel", x: 28, y: 82 },
  ]);
});

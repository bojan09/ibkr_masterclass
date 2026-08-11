import test from "node:test";
import assert from "node:assert/strict";

import { PLATFORM_WORKFLOWS } from "../data/platform-workflows.js";
import {
  ALLOWED_VISUAL_HOSTS,
  PLATFORM_VISUALS,
  getMissionVisuals,
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

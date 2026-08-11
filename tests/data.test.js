import test from "node:test";
import assert from "node:assert/strict";

import { NAVIGATION_GROUPS, getKnownRoutes } from "../data/navigation.js";
import {
  DASHBOARD_METRICS,
  KNOWLEDGE_AREAS,
  LEARNING_TRACKS,
  ROADMAP_PHASES,
} from "../data/dashboard.js";

test("navigation exposes unique, safe routes", () => {
  const items = NAVIGATION_GROUPS.flatMap((group) => group.items);
  const routes = items.map((item) => item.route);

  assert.equal(new Set(routes).size, routes.length);
  assert.ok(routes.length >= 70);
  assert.ok(
    routes.every((route) =>
      /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(route),
    ),
  );
  assert.ok(getKnownRoutes().has("dashboard"));
});

test("roadmap contains thirteen sequential phases with one current phase", () => {
  assert.equal(ROADMAP_PHASES.length, 13);
  assert.deepEqual(
    ROADMAP_PHASES.map((phase) => phase.number),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  );
  assert.equal(ROADMAP_PHASES.filter((phase) => phase.status === "current").length, 1);
  assert.equal(ROADMAP_PHASES[0].title, "Brokerage fundamentals");
  assert.equal(ROADMAP_PHASES.at(-1).title, "Final assessment");
});

test("learning tracks progress from active beginner to locked advanced", () => {
  assert.deepEqual(
    LEARNING_TRACKS.map(({ name, status }) => ({ name, status })),
    [
      { name: "Beginner", status: "active" },
      { name: "Intermediate", status: "locked" },
      { name: "Advanced", status: "locked" },
    ],
  );
});

test("foundation dashboard uses honest baseline scores", () => {
  assert.ok(DASHBOARD_METRICS.every((metric) => metric.value === 0));
  assert.ok(KNOWLEDGE_AREAS.every((area) => area.score === 0));
  assert.equal(KNOWLEDGE_AREAS.length, 4);
});

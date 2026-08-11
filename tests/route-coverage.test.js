import test from "node:test";
import assert from "node:assert/strict";

import { getKnownRoutes } from "../data/navigation.js";
import { LESSONS } from "../data/lessons.js";
import { isStandaloneExperienceRoute } from "../data/route-manifest.js";

test("every navigation route resolves to a published lesson or implemented experience", () => {
  const lessonRoutes = new Set(LESSONS.flatMap((lesson) => [lesson.route, lesson.navRoute]).filter(Boolean));
  const uncovered = [...getKnownRoutes()].filter((route) => !lessonRoutes.has(route) && !isStandaloneExperienceRoute(route));
  assert.deepEqual(uncovered, []);
});

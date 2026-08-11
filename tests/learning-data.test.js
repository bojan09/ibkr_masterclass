import test from "node:test";
import assert from "node:assert/strict";

import { CURRICULUM_MODULES } from "../data/courses.js";
import {
  LESSONS,
  getAdjacentLessons,
  getLessonById,
  getLessonByRoute,
  getLessonsForModule,
} from "../data/lessons.js";

const ALLOWED_SECTION_TYPES = new Set([
  "explanation",
  "why",
  "example",
  "important",
  "mistake",
  "best-practice",
  "warning",
  "try-it",
  "comparison",
  "checklist",
]);

test("curriculum defines thirteen sequential learner phases", () => {
  assert.equal(CURRICULUM_MODULES.length, 13);
  assert.deepEqual(
    CURRICULUM_MODULES.map((module) => module.phase),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  );
  assert.equal(new Set(CURRICULUM_MODULES.map((module) => module.id)).size, 13);
});

test("published lessons have unique identities and valid module references", () => {
  const moduleIds = new Set(CURRICULUM_MODULES.map((module) => module.id));

  assert.equal(LESSONS.length, 7);
  assert.equal(new Set(LESSONS.map((lesson) => lesson.id)).size, LESSONS.length);
  assert.equal(new Set(LESSONS.map((lesson) => lesson.route)).size, LESSONS.length);
  assert.ok(LESSONS.every((lesson) => moduleIds.has(lesson.moduleId)));
});

test("every published lesson is substantive and uses supported educational sections", () => {
  for (const lesson of LESSONS) {
    assert.ok(lesson.objectives.length >= 3, `${lesson.id} needs at least three objectives`);
    assert.ok(lesson.sections.length >= 5, `${lesson.id} needs at least five sections`);
    assert.ok(lesson.sections.every((section) => ALLOWED_SECTION_TYPES.has(section.type)));
    assert.ok(lesson.sections.every((section) => section.title && section.body.length >= 40));
  }
});

test("lesson lookup resolves IDs, routes, and module membership", () => {
  const first = LESSONS[0];

  assert.equal(getLessonById(first.id), first);
  assert.equal(getLessonByRoute(first.route), first);
  assert.deepEqual(getLessonsForModule("brokerage-fundamentals"), LESSONS.slice(0, 3));
  assert.equal(getLessonById("missing"), undefined);
});

test("adjacent lookup provides safe previous and next lesson boundaries", () => {
  assert.deepEqual(getAdjacentLessons(LESSONS[0].id), {
    previous: undefined,
    next: LESSONS[1],
  });
  assert.deepEqual(getAdjacentLessons(LESSONS[1].id), {
    previous: LESSONS[0],
    next: LESSONS[2],
  });
  assert.deepEqual(getAdjacentLessons(LESSONS[2].id), {
    previous: LESSONS[1],
    next: LESSONS[3],
  });
  assert.deepEqual(getAdjacentLessons(LESSONS.at(-1).id), {
    previous: LESSONS.at(-2),
    next: undefined,
  });
});

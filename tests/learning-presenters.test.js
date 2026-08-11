import test from "node:test";
import assert from "node:assert/strict";

import { LESSONS } from "../data/lessons.js";
import { getLessonViewModel } from "../js/lessons.js";
import { getRoadmapViewModel } from "../js/roadmap.js";
import { createStorage } from "../js/storage.js";

function createState(overrides = {}) {
  const storage = createStorage({
    backend: { getItem: () => null, setItem() {}, removeItem() {} },
    key: "presenter-state",
  });
  return { ...storage.get(), ...overrides };
}

test("lesson view model combines content, state, and adjacent navigation", () => {
  const lesson = LESSONS[1];
  const state = createState({
    completedLessons: [lesson.id],
    bookmarks: [lesson.id],
    notes: { [lesson.id]: { text: "My note", updatedAt: "2026-08-11T12:00:00.000Z" } },
  });
  const view = getLessonViewModel(lesson, state);

  assert.equal(view.isComplete, true);
  assert.equal(view.isBookmarked, true);
  assert.equal(view.noteText, "My note");
  assert.equal(view.position, 2);
  assert.equal(view.previous.id, LESSONS[0].id);
  assert.equal(view.next.id, LESSONS[2].id);
  assert.equal(view.sections[0].label, "Explanation");
});

test("roadmap view model exposes derived states and lesson progress", () => {
  const initial = getRoadmapViewModel(createState());
  assert.equal(initial.percent, 0);
  assert.equal(initial.modules[0].status, "current");
  assert.equal(initial.modules[0].lessonCount, 3);

  const complete = getRoadmapViewModel(
    createState({
      completedLessons: LESSONS.slice(0, 3).map((lesson) => lesson.id),
      completedModules: ["brokerage-fundamentals"],
    }),
  );
  assert.equal(complete.modules[0].status, "completed");
  assert.equal(complete.modules[1].status, "current");
});

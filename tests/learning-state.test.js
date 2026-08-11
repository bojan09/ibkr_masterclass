import test from "node:test";
import assert from "node:assert/strict";

import { LESSONS } from "../data/lessons.js";
import { toggleBookmark } from "../js/bookmarks.js";
import { saveLessonNote, searchNotes } from "../js/notes.js";
import {
  deriveLearningProgress,
  getNextLesson,
  isLessonUnlocked,
  recordRecentLesson,
  toggleLessonComplete,
} from "../js/progress.js";
import { createStorage } from "../js/storage.js";

function createMemoryBackend() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

function createTestStorage() {
  return createStorage({ backend: createMemoryBackend(), key: "phase-2-test" });
}

test("progress starts at zero with the first curriculum phase current", () => {
  const progress = deriveLearningProgress(createTestStorage().get());

  assert.equal(progress.completedLessons, 0);
  assert.equal(progress.totalLessons, LESSONS.length);
  assert.equal(progress.percent, 0);
  assert.equal(progress.modules[0].status, "current");
  assert.equal(progress.modules[1].status, "locked");
});

test("completion toggles lessons and synchronizes completed modules", () => {
  const storage = createTestStorage();

  const firstModuleLessons = LESSONS.slice(0, 3);
  for (const lesson of firstModuleLessons) toggleLessonComplete(storage, lesson.id);

  assert.deepEqual(storage.get("completedLessons"), firstModuleLessons.map((lesson) => lesson.id));
  assert.deepEqual(storage.get("completedModules"), ["brokerage-fundamentals"]);
  const progress = deriveLearningProgress(storage.get());
  assert.equal(progress.percent, Math.round((firstModuleLessons.length / LESSONS.length) * 100));
  assert.equal(progress.modules[0].status, "completed");
  assert.equal(progress.modules[1].status, "current");

  toggleLessonComplete(storage, LESSONS[0].id);
  assert.deepEqual(storage.get("completedModules"), []);
  assert.deepEqual(storage.get("completedLessons"), []);
});

test("learning state rejects unknown lesson identifiers", () => {
  const storage = createTestStorage();

  assert.throws(() => toggleLessonComplete(storage, "unknown"), /Unknown lesson/);
  assert.throws(() => recordRecentLesson(storage, "unknown"), /Unknown lesson/);
  assert.throws(() => toggleBookmark(storage, "unknown"), /Unknown lesson/);
  assert.throws(() => saveLessonNote(storage, "unknown", "text"), /Unknown lesson/);
});

test("next lesson selects the first incomplete lesson in curriculum order", () => {
  const storage = createTestStorage();
  assert.equal(getNextLesson(storage.get()), LESSONS[0]);

  toggleLessonComplete(storage, LESSONS[0].id);
  assert.equal(getNextLesson(storage.get()), LESSONS[1]);

  toggleLessonComplete(storage, LESSONS[1].id);
  toggleLessonComplete(storage, LESSONS[2].id);
  assert.equal(getNextLesson(storage.get()), LESSONS[3]);

  for (const lesson of LESSONS.slice(3)) toggleLessonComplete(storage, lesson.id);
  assert.equal(getNextLesson(storage.get()), undefined);
});

test("lessons unlock sequentially as prerequisites are completed", () => {
  const storage = createTestStorage();
  assert.equal(isLessonUnlocked(storage.get(), LESSONS[0].id), true);
  assert.equal(isLessonUnlocked(storage.get(), LESSONS[1].id), false);

  toggleLessonComplete(storage, LESSONS[0].id);
  assert.equal(isLessonUnlocked(storage.get(), LESSONS[1].id), true);
  assert.equal(isLessonUnlocked(storage.get(), LESSONS[2].id), false);
  assert.equal(isLessonUnlocked(storage.get(), "unknown"), false);
});

test("recent lessons are unique, newest first, and capped at five", () => {
  const storage = createTestStorage();
  recordRecentLesson(storage, LESSONS[0].id);
  recordRecentLesson(storage, LESSONS[1].id);
  recordRecentLesson(storage, LESSONS[0].id);

  assert.deepEqual(storage.get("recentLessons"), [LESSONS[0].id, LESSONS[1].id]);
});

test("notes save, search by lesson or content, and remove when blank", () => {
  const storage = createTestStorage();
  saveLessonNote(storage, LESSONS[0].id, "Remember the broker is not the venue.", {
    now: "2026-08-11T12:00:00.000Z",
  });
  saveLessonNote(storage, LESSONS[1].id, "Displayed liquidity can change.", {
    now: "2026-08-11T13:00:00.000Z",
  });

  assert.equal(searchNotes(storage.get(), "venue")[0].lesson.id, LESSONS[0].id);
  assert.equal(searchNotes(storage.get(), "broker, exchange")[0].lesson.id, LESSONS[1].id);
  assert.deepEqual(
    searchNotes(storage.get(), "").map((result) => result.lesson.id),
    [LESSONS[1].id, LESSONS[0].id],
  );

  saveLessonNote(storage, LESSONS[0].id, "   ");
  assert.equal(storage.get("notes")[LESSONS[0].id], undefined);
});

test("bookmark toggling keeps IDs unique and reports the new state", () => {
  const storage = createTestStorage();

  assert.equal(toggleBookmark(storage, LESSONS[0].id), true);
  assert.equal(toggleBookmark(storage, LESSONS[0].id), false);
  assert.deepEqual(storage.get("bookmarks"), []);
});

import test from "node:test";
import assert from "node:assert/strict";

import { APP_STORAGE_VERSION, createStorage } from "../js/storage.js";

function createMemoryBackend(initialValue = null) {
  const values = new Map();
  if (initialValue !== null) values.set("test-state", initialValue);

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("storage supplies the complete default foundation state", () => {
  const storage = createStorage({ backend: createMemoryBackend(), key: "test-state" });
  const state = storage.get();

  assert.equal(state.version, APP_STORAGE_VERSION);
  assert.deepEqual(state.settings, {
    sidebarCollapsed: false,
    reducedMotion: false,
  });
  assert.deepEqual(state.completedLessons, []);
  assert.deepEqual(state.quizScores, {});
  assert.deepEqual(state.practiceTrades, []);
  assert.deepEqual(state.journalEntries, []);
});

test("storage returns cloned values that callers cannot mutate", () => {
  const storage = createStorage({ backend: createMemoryBackend(), key: "test-state" });
  const settings = storage.get("settings");
  settings.sidebarCollapsed = true;

  assert.equal(storage.get("settings").sidebarCollapsed, false);
});

test("storage persists valid top-level updates", () => {
  const backend = createMemoryBackend();
  const storage = createStorage({ backend, key: "test-state" });

  const saved = storage.set("settings", {
    sidebarCollapsed: true,
    reducedMotion: false,
  });

  assert.equal(saved.sidebarCollapsed, true);
  assert.equal(createStorage({ backend, key: "test-state" }).get("settings").sidebarCollapsed, true);
});

test("storage rejects unknown keys and invalid value shapes", () => {
  const storage = createStorage({ backend: createMemoryBackend(), key: "test-state" });

  assert.throws(() => storage.set("secret", "value"), /Unknown storage key/);
  assert.throws(() => storage.set("completedLessons", {}), /Invalid value/);
  assert.throws(
    () => storage.set("settings", { sidebarCollapsed: "yes", reducedMotion: false }),
    /Invalid value/,
  );
  assert.throws(
    () => storage.set("learningStatistics", { totalMinutes: -1, currentStreak: 0, longestStreak: 0 }),
    /Invalid value/,
  );
});

test("storage recovers from malformed JSON and unsupported versions", () => {
  const malformed = createStorage({
    backend: createMemoryBackend("{broken"),
    key: "test-state",
  });
  const future = createStorage({
    backend: createMemoryBackend(JSON.stringify({ version: 999, settings: {} })),
    key: "test-state",
  });

  assert.equal(malformed.get().version, APP_STORAGE_VERSION);
  assert.equal(future.get().version, APP_STORAGE_VERSION);
});

test("remove restores a field default and reset restores all defaults", () => {
  const storage = createStorage({ backend: createMemoryBackend(), key: "test-state" });
  storage.set("settings", { sidebarCollapsed: true, reducedMotion: true });
  storage.set("recentLessons", ["brokerage-basics"]);

  storage.remove("settings");
  assert.equal(storage.get("settings").sidebarCollapsed, false);

  storage.reset();
  assert.deepEqual(storage.get("recentLessons"), []);
});

test("storage falls back to memory when the backend is unavailable", () => {
  const backend = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
    removeItem() {
      throw new Error("blocked");
    },
  };
  const storage = createStorage({ backend, key: "test-state" });

  storage.set("recentLessons", ["ibkr-overview"]);

  assert.deepEqual(storage.get("recentLessons"), ["ibkr-overview"]);
  assert.equal(storage.isPersistent(), false);
});

test("storage reports when durable browser persistence is available", () => {
  const storage = createStorage({ backend: createMemoryBackend(), key: "test-state" });

  assert.equal(storage.isPersistent(), true);
});

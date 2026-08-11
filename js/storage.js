export const APP_STORAGE_VERSION = 3;
export const APP_STORAGE_KEY = "ibkr-masterclass-state";

const DEFAULT_STATE = Object.freeze({
  version: APP_STORAGE_VERSION,
  lessonProgress: {},
  completedLessons: [],
  completedModules: [],
  quizScores: {},
  bookmarks: [],
  notes: {},
  settings: {
    sidebarCollapsed: false,
    reducedMotion: false,
    theme: "system",
  },
  recentLessons: [],
  practiceTrades: [],
  simulatorHistory: [],
  simulatorState: {},
  journalEntries: [],
  checklistCompletion: {},
  learningStatistics: {
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
  },
});

const ARRAY_KEYS = new Set([
  "completedLessons",
  "completedModules",
  "bookmarks",
  "recentLessons",
  "practiceTrades",
  "simulatorHistory",
  "journalEntries",
]);

const OBJECT_KEYS = new Set([
  "lessonProgress",
  "quizScores",
  "notes",
  "settings",
  "checklistCompletion",
  "learningStatistics",
  "simulatorState",
]);

function clone(value) {
  return globalThis.structuredClone
    ? globalThis.structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function createMemoryBackend() {
  const values = new Map();
  return {
    persistent: false,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

function getBrowserBackend() {
  try {
    return globalThis.localStorage ?? createMemoryBackend();
  } catch {
    return createMemoryBackend();
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonNegativeNumber(value) {
  return Number.isFinite(value) && value >= 0;
}

function isValidValue(key, value) {
  if (ARRAY_KEYS.has(key)) return Array.isArray(value);
  if (key === "settings") {
    return (
      isPlainObject(value) &&
      typeof value.sidebarCollapsed === "boolean" &&
      typeof value.reducedMotion === "boolean" &&
      ["dark", "light", "system"].includes(value.theme)
    );
  }
  if (key === "learningStatistics") {
    return (
      isPlainObject(value) &&
      isNonNegativeNumber(value.totalMinutes) &&
      isNonNegativeNumber(value.currentStreak) &&
      isNonNegativeNumber(value.longestStreak)
    );
  }
  if (OBJECT_KEYS.has(key)) return isPlainObject(value);
  return key === "version" && value === APP_STORAGE_VERSION;
}

function migrate(rawState) {
  if (!isPlainObject(rawState)) return clone(DEFAULT_STATE);
  const version = Number(rawState.version ?? 0);

  if (version > APP_STORAGE_VERSION || version < 0) return clone(DEFAULT_STATE);

  let migrated = clone(rawState);
  if (version === 0) migrated = { ...migrated, version: 1 };
  if (migrated.version === 1) migrated = { ...migrated, version: 2, simulatorState: {} };
  if (migrated.version === 2) {
    migrated = {
      ...migrated,
      version: 3,
      settings: { ...DEFAULT_STATE.settings, ...(isPlainObject(migrated.settings) ? migrated.settings : {}) },
    };
  }

  return migrated;
}

function validateAndMerge(rawState) {
  const candidate = migrate(rawState);
  const state = clone(DEFAULT_STATE);

  for (const key of Object.keys(DEFAULT_STATE)) {
    if (isValidValue(key, candidate[key])) state[key] = clone(candidate[key]);
  }

  state.settings = { ...DEFAULT_STATE.settings, ...state.settings };
  state.learningStatistics = {
    ...DEFAULT_STATE.learningStatistics,
    ...state.learningStatistics,
  };
  state.version = APP_STORAGE_VERSION;
  return state;
}

export function createStorage({ backend = getBrowserBackend(), key = APP_STORAGE_KEY } = {}) {
  const fallback = createMemoryBackend();
  let activeBackend = backend;
  let persistent = backend.persistent !== false;
  let state;

  try {
    const serialized = activeBackend.getItem(key);
    state = serialized ? validateAndMerge(JSON.parse(serialized)) : clone(DEFAULT_STATE);
  } catch {
    activeBackend = fallback;
    persistent = false;
    state = clone(DEFAULT_STATE);
  }

  const persist = () => {
    try {
      activeBackend.setItem(key, JSON.stringify(state));
    } catch {
      activeBackend = fallback;
      persistent = false;
      activeBackend.setItem(key, JSON.stringify(state));
    }
  };

  return {
    get(field) {
      if (field === undefined) return clone(state);
      if (!(field in DEFAULT_STATE)) throw new Error(`Unknown storage key: ${field}`);
      return clone(state[field]);
    },
    set(field, value) {
      if (!(field in DEFAULT_STATE) || field === "version") {
        throw new Error(`Unknown storage key: ${field}`);
      }
      if (!isValidValue(field, value)) throw new TypeError(`Invalid value for storage key: ${field}`);

      state[field] = clone(value);
      persist();
      return clone(state[field]);
    },
    remove(field) {
      if (!(field in DEFAULT_STATE) || field === "version") {
        throw new Error(`Unknown storage key: ${field}`);
      }

      state[field] = clone(DEFAULT_STATE[field]);
      persist();
    },
    reset() {
      state = clone(DEFAULT_STATE);
      try {
        activeBackend.removeItem(key);
      } catch {
        activeBackend = fallback;
        persistent = false;
      }
      return clone(state);
    },
    isPersistent() {
      return persistent;
    },
  };
}

# IBKR Masterclass Phase 2 Learning System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete local, data-driven lesson and progress system to the Phase 1 foundation.

**Architecture:** Curriculum and lesson records remain immutable data. Focused domain services derive and mutate progress, notes, bookmarks, and recent activity through the centralized storage adapter; route-specific presenters render lessons and learner-library pages.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES modules, localStorage, Node built-in test runner.

## Global Constraints

- Use only HTML5, CSS3, and vanilla JavaScript; add no runtime dependencies or build tooling.
- Implement only development Phase 2: course data, lessons, progress, notes, bookmarks, and roadmap.
- Keep educational examples clearly identified and do not present personalized investment advice.
- Keep all direct `localStorage` access inside `js/storage.js`.
- Preserve Phase 1 routes, responsive behavior, accessibility, and tests.
- Seed only enough brokerage content to prove the learning system; leave the full IBKR curriculum for Phase 3.

---

### Task 1: Curriculum and lesson contracts

**Files:**
- Create: `data/courses.js`
- Create: `data/lessons.js`
- Create: `tests/learning-data.test.js`

**Interfaces:**
- Produces: `CURRICULUM_MODULES`, `LESSONS`, `getLessonById(id)`, `getLessonByRoute(route)`, `getLessonsForModule(moduleId)`, `getAdjacentLessons(id)`.

- [ ] Write failing tests for thirteen ordered modules, unique lesson IDs/routes, valid section types, module references, and adjacent-lesson lookup.
- [ ] Run `node --test tests/learning-data.test.js` and confirm missing-module failures.
- [ ] Implement thirteen module records and three substantive Phase 1 lesson records.
- [ ] Run the focused test and confirm all data-contract assertions pass.

### Task 2: Learning-state services

**Files:**
- Create: `js/progress.js`
- Create: `js/notes.js`
- Create: `js/bookmarks.js`
- Create: `tests/learning-state.test.js`

**Interfaces:**
- Produces: `deriveLearningProgress(state)`, `toggleLessonComplete(storage, id)`, `recordRecentLesson(storage, id)`, `getNextLesson(state)`, `saveLessonNote(storage, id, text)`, `searchNotes(state, query)`, `toggleBookmark(storage, id)`.

- [ ] Write failing tests for derived totals/statuses, completion synchronization, next lesson, recent ordering, note deletion/search, and unique bookmark toggling.
- [ ] Run the focused test and confirm missing-module failures.
- [ ] Implement pure derivation plus narrow storage mutations that reject unknown lesson IDs.
- [ ] Run the focused test and full suite until green.

### Task 3: Lesson and roadmap presentation

**Files:**
- Create: `js/lessons.js`
- Create: `js/roadmap.js`
- Create: `css/lessons.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: curriculum data and state services from Tasks 1-2.
- Produces: `renderLesson(container, lesson, context)`, `renderRoadmapPage(container, state)`, and cleanup callbacks for route changes.

- [ ] Render lesson headers, objectives, typed educational sections, completion/bookmark controls, auto-saving notes, and previous/next navigation.
- [ ] Render the thirteen-phase roadmap with completed/current/available/locked status and available lesson links.
- [ ] Add focused desktop/mobile lesson, note-panel, and roadmap styling.
- [ ] Run JavaScript syntax checks and the full tests.

### Task 4: Notes, bookmarks, dashboard, and routing integration

**Files:**
- Modify: `js/notes.js`
- Modify: `js/bookmarks.js`
- Modify: `js/dashboard.js`
- Modify: `js/navigation.js`
- Modify: `js/app.js`
- Modify: `data/navigation.js`
- Modify: `data/dashboard.js`
- Modify: `css/components.css`
- Modify: `css/responsive.css`

**Interfaces:**
- Consumes: lesson lookup and derived progress.
- Produces: working `roadmap`, `my-notes`, `bookmarks`, and lesson routes plus dynamic dashboard progress and recent activity.

- [ ] Add Overview navigation destinations and include lesson/system routes in router recognition.
- [ ] Render searchable My Notes and Bookmarks pages with safe empty states.
- [ ] Replace dashboard baselines with derived progress, next lesson, recent lessons, notes, bookmarks, and roadmap statuses.
- [ ] Compose route cleanup and state-change rerendering in `app.js`.
- [ ] Run the full suite and static scope/storage scans.

### Task 5: Documentation and final Phase 2 verification

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-08-11-phase-2-learning-system.md`

**Interfaces:**
- Produces: current feature, storage behavior, test, and roadmap documentation.

- [ ] Update the README from Phase 1 to Phase 2 without claiming later curriculum or simulator work.
- [ ] Run `node --test` and confirm zero failures.
- [ ] Run syntax checks for every JavaScript module.
- [ ] Serve the site over HTTP and confirm every referenced resource returns 200.
- [ ] Check semantic hooks, storage isolation, forbidden frameworks, Phase 3 exclusions, and repository status.
- [ ] Stop before development Phase 3.

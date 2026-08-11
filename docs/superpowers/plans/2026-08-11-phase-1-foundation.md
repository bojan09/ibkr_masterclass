# IBKR Masterclass Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Phase 1 static application foundation and dashboard without implementing Phase 2 learning features.

**Architecture:** A no-build ES-module SPA uses hash routing, configuration-driven navigation/dashboard content, and one defensive localStorage adapter. Semantic HTML and focused CSS layers provide an original responsive financial-academy shell.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES modules, localStorage, Node built-in test runner.

## Global Constraints

- Use only HTML5, CSS3, and vanilla JavaScript; do not add a framework or build tool.
- All market or account values must be educational baseline values and must not imply live market data.
- Implement only Foundation: architecture, layout, sidebar, routing, theme, responsive shell, storage, and dashboard.
- Keep UI, content/data, storage, and routing concerns in separate focused files.
- Never place credentials, secrets, tokens, or passwords in frontend code.
- Preserve accessible semantics, keyboard navigation, visible focus, readable contrast, and reduced-motion behavior.

---

### Task 1: Routing and storage foundations

**Files:**
- Create: `js/router.js`
- Create: `js/storage.js`
- Create: `tests/router.test.js`
- Create: `tests/storage.test.js`

**Interfaces:**
- Produces: `normalizeRoute(hash): string`, `createRouter({ routes, onRoute }): Router`
- Produces: `createStorage({ backend?, key? }): StorageService` with `get`, `set`, `remove`, and `reset`

- [ ] Write tests asserting route normalization, route changes, storage defaults, immutable reads, corrupt-data recovery, and schema migration behavior.
- [ ] Run `node --test` and verify the missing modules fail.
- [ ] Implement the minimal router and versioned storage adapter.
- [ ] Run `node --test` and verify all foundation-unit tests pass.

### Task 2: Semantic shell and visual system

**Files:**
- Create: `index.html`
- Create: `css/variables.css`
- Create: `css/main.css`
- Create: `css/layout.css`
- Create: `css/components.css`
- Create: `css/responsive.css`

**Interfaces:**
- Consumes: element IDs `app-sidebar`, `sidebar-nav`, `app-main`, `page-content`, and `menu-toggle` from `app.js`.
- Produces: responsive application landmarks, navigation drawer, skip link, reusable panels, buttons, badges, cards, progress visuals, and empty states.

- [ ] Add the semantic HTML shell with stylesheet/module links, accessible navigation controls, and a no-script message.
- [ ] Add theme tokens and base typography with tabular numeric styles.
- [ ] Add desktop shell layout and reusable dashboard components.
- [ ] Add tablet/mobile drawer behavior styles plus reduced-motion and print-safe rules.
- [ ] Run static searches to verify there is no inline script, inline style, framework import, or remote binary asset.

### Task 3: Data-driven navigation and dashboard

**Files:**
- Create: `data/navigation.js`
- Create: `data/dashboard.js`
- Create: `js/navigation.js`
- Create: `js/dashboard.js`
- Create: `tests/data.test.js`

**Interfaces:**
- Consumes: normalized route strings and `AppState` from Tasks 1-2.
- Produces: `NAVIGATION_GROUPS`, `ROADMAP_PHASES`, `LEARNING_TRACKS`, `renderNavigation`, `setActiveNavigation`, and `renderDashboard`.

- [ ] Write data-integrity tests for unique routes, exactly 13 roadmap phases, track ordering, and valid baseline metrics.
- [ ] Run `node --test` and verify missing data modules fail.
- [ ] Define grouped navigation and Phase 1 dashboard metadata.
- [ ] Render the sidebar and the complete requested dashboard with honest zero/locked states for future systems.
- [ ] Run `node --test` and verify all tests pass.

### Task 4: Application composition and interactions

**Files:**
- Create: `js/app.js`
- Create: `js/ui.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: router, storage, navigation, and dashboard interfaces from Tasks 1-3.
- Produces: bootstrapped app, sidebar open/close behavior, Escape handling, focus management, active-route updates, planned-route rendering, and fatal-error fallback.

- [ ] Compose application initialization and route rendering.
- [ ] Implement mobile sidebar controls with `aria-expanded`, backdrop dismissal, focus restoration, and resize cleanup.
- [ ] Add planned-route and unknown-route states without implementing later-phase content.
- [ ] Persist only shell settings through `storage.js` and verify there are no direct `localStorage` calls elsewhere.
- [ ] Run `node --test` and a local static server smoke test.

### Task 5: Documentation and final verification

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Modify: `docs/superpowers/plans/2026-08-11-phase-1-foundation.md`

**Interfaces:**
- Consumes: the completed static site.
- Produces: local development, architecture, GitHub, Vercel, roadmap, and disclaimer documentation.

- [ ] Document project purpose, current Phase 1 features, structure, local HTTP serving, Git workflow, Vercel static deployment, roadmap, and educational disclaimer.
- [ ] Run the full automated test suite and record the result.
- [ ] Launch a local server and verify dashboard/navigation at desktop, tablet, and mobile widths with no console errors.
- [ ] Verify localStorage recovery and shell-setting persistence in a browser.
- [ ] Scan for accessibility basics, direct storage access, placeholder copy, secrets, and out-of-scope Phase 2 implementation.
- [ ] Update this checklist to reflect completed work and stop before Phase 2.

# IBKR Platform Mastery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current imitation-style IBKR learning lab into a sourced companion for genuine IBKR Desktop and TWS/Mosaic paper-trading practice, with persistent Dark, Light, and System themes.

**Architecture:** Keep the existing dependency-free hash-routed shell and calculation labs. Add immutable platform, workflow, and equivalence data modules plus focused presenters for the platform hub, real-app missions, and comparisons. Extend the single storage boundary for evidence-based mission progress and theme preference; remove the invented Desktop navigation shell from routing.

**Tech Stack:** HTML5, CSS3 custom properties, Vanilla JavaScript ES modules, browser `localStorage`, Node built-in test runner.

## Global Constraints

- Official Interactive Brokers pages, guides, release notes, and Campus materials are the primary platform sources.
- IBKR Desktop is taught before TWS/Mosaic.
- Navigation practice occurs in official paper-trading applications, never a purported browser copy.
- Do not request or persist brokerage credentials, account numbers, balances, positions, or exports.
- Existing market examples remain centralized and visibly labeled simulated.
- The production application remains dependency-free and statically deployable.
- Theme choices are exactly `dark`, `light`, and `system`.
- `js/storage.js` remains the only direct `localStorage` boundary.
- Each phase runs its focused tests and `npm.cmd test` before completion.

---

## File map

**Create**

- `data/platforms.js` — product metadata, source policy, track ordering, and helper lookups.
- `data/platform-workflows.js` — validated Desktop and TWS mission records.
- `data/platform-equivalents.js` — Desktop-to-TWS task mappings.
- `js/theme.js` — theme normalization, application, system synchronization, and control binding.
- `js/platform-hub.js` — platform selection and setup/safety presentation.
- `js/platform-missions.js` — mission filtering, evidence completion, stale-source state, and presenter.
- `js/platform-compare.js` — equivalence-table presenter.
- `tests/theme.test.js`, `tests/platform-data.test.js`, `tests/platform-missions.test.js`, `tests/platform-compare.test.js` — focused contracts.

**Modify**

- `index.html` — identity, early theme bootstrap, theme control, and affiliation language.
- `css/variables.css`, `css/layout.css`, `css/components.css`, `css/simulator.css`, `css/responsive.css` — dual-theme tokens and new platform views.
- `js/storage.js` — version 3 migration, theme setting, and platform evidence.
- `js/app.js` — new presenters and route dispatch; no Desktop imitation routing.
- `data/navigation.js`, `data/route-manifest.js`, `data/courses.js`, `data/dashboard.js` — revised route and curriculum model.
- `js/dashboard.js`, `js/roadmap.js`, `js/assessment.js`, `data/assessments.js` — dual-track progress and assessment evidence.
- `README.md`, `package.json` — updated identity, setup, verification, and user handoff.
- Existing tests — revised identity, route, storage, and regression contracts.

---

### Task 1: Preserve baseline and implement theme infrastructure (Phase 1)

**Files:**
- Create: `js/theme.js`
- Create: `tests/theme.test.js`
- Modify: `index.html`
- Modify: `js/storage.js`
- Modify: `js/app.js`
- Modify: `css/variables.css`
- Modify: `css/layout.css`
- Modify: `css/components.css`
- Test: `tests/storage.test.js`
- Test: `tests/production-contracts.test.js`

**Interfaces:**
- Produces: `THEME_VALUES`, `normalizeTheme(value)`, `resolveTheme(value, prefersDark)`, `applyTheme(documentElement, value, prefersDark)`, and `createThemeController({ select, storage, documentRef, windowRef })`.
- Storage `settings` becomes `{ sidebarCollapsed: boolean, reducedMotion: boolean, theme: "dark"|"light"|"system" }`.

- [ ] **Step 1: Write failing theme and storage migration tests**

```js
assert.equal(normalizeTheme("invalid"), "system");
assert.equal(resolveTheme("system", true), "dark");
assert.equal(resolveTheme("system", false), "light");
assert.equal(applyTheme(root, "light", true), "light");
assert.equal(root.dataset.theme, "light");
assert.equal(createStorage({ backend: legacyV2 }).get("settings").theme, "system");
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/theme.test.js tests/storage.test.js tests/production-contracts.test.js`

Expected: FAIL because `js/theme.js`, the v3 migration, and the shell theme control do not exist.

- [ ] **Step 3: Implement theme behavior and early application**

Add an inline head bootstrap that reads only the existing application storage key, validates `dark|light|system`, evaluates `matchMedia("(prefers-color-scheme: dark)")`, and sets `document.documentElement.dataset.theme` before styles render. Add a labeled `<select id="theme-select">` with the three values. Use semantic tokens in `variables.css`, define `:root[data-theme="light"]`, and remove hard-coded dark surfaces from shell components being touched.

- [ ] **Step 4: Run focused and full tests**

Run: `node --test tests/theme.test.js tests/storage.test.js tests/production-contracts.test.js`

Expected: PASS.

Run: `npm.cmd test`

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add index.html js/theme.js js/storage.js js/app.js css/variables.css css/layout.css css/components.css tests/theme.test.js tests/storage.test.js tests/production-contracts.test.js
git commit -m "feat: add persistent light and dark themes"
```

### Task 2: Reset identity and add the genuine-platform hub (Phase 1)

**Files:**
- Create: `data/platforms.js`
- Create: `js/platform-hub.js`
- Create: `tests/platform-data.test.js`
- Modify: `index.html`
- Modify: `package.json`
- Modify: `js/app.js`
- Modify: `data/navigation.js`
- Modify: `data/route-manifest.js`
- Modify: `data/courses.js`
- Modify: `data/dashboard.js`
- Modify: `js/dashboard.js`
- Modify: `js/roadmap.js`

**Interfaces:**
- Produces: `PLATFORMS`, `PLATFORM_ORDER`, `getPlatform(id)`, `getPlatformSourceStatus(platform, now)`, and `renderPlatformHub(container, { storage, initialPlatform })`.
- New routes: `platforms`, `platforms/desktop`, `platforms/tws`, and `platforms/safety`.

- [ ] **Step 1: Write failing metadata and route tests**

```js
assert.deepEqual(PLATFORM_ORDER, ["ibkr-desktop", "tws-mosaic"]);
assert.ok(PLATFORMS.every((item) => item.sources.every((source) => new URL(source.url).hostname.endsWith("interactivebrokers.com") || new URL(source.url).hostname.endsWith("ibkrguides.com"))));
assert.ok(getKnownRoutes().includes("platforms/desktop"));
assert.equal(isStandaloneExperienceRoute("platforms/tws"), true);
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/platform-data.test.js tests/route-coverage.test.js tests/data.test.js`

Expected: FAIL because platform metadata and routes do not exist.

- [ ] **Step 3: Implement metadata, new identity, and hub**

Use the current official Desktop download/user-guide pages and official TWS product/Mosaic guide/Campus course. Show “Official application required,” download/help links, verification dates, Paper Trading safety instructions, sequence, and independent-affiliation language. Rename visible `IBKR Masterclass` strings to `IBKR Platform Mastery`; do not rename the storage key so learner data survives.

- [ ] **Step 4: Remove imitation navigation entry points**

Route the former `desktop/*` navigation destinations to the appropriate Desktop mission list or safe migration page. Rename remaining browser simulators “Concept Labs.” No view may display “IBKR Masterclass Desktop Lab.”

- [ ] **Step 5: Run focused and full tests**

Run: `node --test tests/platform-data.test.js tests/route-coverage.test.js tests/data.test.js tests/ui.test.js`

Run: `npm.cmd test`

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```powershell
git add index.html package.json data/platforms.js data/navigation.js data/route-manifest.js data/courses.js data/dashboard.js js/platform-hub.js js/app.js js/dashboard.js js/roadmap.js tests/platform-data.test.js tests/route-coverage.test.js tests/data.test.js tests/ui.test.js
git commit -m "feat: reset product around genuine IBKR platforms"
```

### Task 3: Build evidence-based mission infrastructure (Phases 1–2)

**Files:**
- Create: `data/platform-workflows.js`
- Create: `js/platform-missions.js`
- Create: `tests/platform-missions.test.js`
- Modify: `js/storage.js`
- Modify: `js/app.js`
- Modify: `data/route-manifest.js`
- Modify: `css/components.css`
- Modify: `css/responsive.css`
- Test: `tests/storage.test.js`

**Interfaces:**
- Produces: `PLATFORM_WORKFLOWS`, `getPlatformWorkflows(platformId)`, `getWorkflow(id)`, `isWorkflowStale(workflow, now)`, `canCompleteWorkflow(workflow, evidence)`, `completeWorkflow(storage, workflowId, evidence, completedAt)`, and `renderPlatformMissions(container, { storage, platformId, workflowId })`.
- Storage adds `platformEvidence: Record<string, { completedAt: string, verifiedAsOf: string, evidence: string[] }>`.

- [ ] **Step 1: Write failing schema, safety, evidence, and migration tests**

```js
assert.ok(PLATFORM_WORKFLOWS.every((flow) => flow.safetyGate && flow.sources.length));
assert.equal(canCompleteWorkflow(flow, []), false);
assert.equal(canCompleteWorkflow(flow, flow.evidence.map((item) => item.id)), true);
assert.deepEqual(createStorage({ backend: legacyV2 }).get("platformEvidence"), {});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/platform-missions.test.js tests/storage.test.js`

Expected: FAIL because workflow APIs and storage state do not exist.

- [ ] **Step 3: Implement the mission engine and safe UI**

Render prerequisites, account-mode safety gate, steps, expected observations, mistakes, recovery, official links, evidence checkboxes, stale-source warning, and completion status. Escape user-controlled values and never request sensitive brokerage data.

- [ ] **Step 4: Run focused and full tests**

Run: `node --test tests/platform-missions.test.js tests/storage.test.js tests/route-coverage.test.js`

Run: `npm.cmd test`

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add data/platform-workflows.js js/platform-missions.js js/storage.js js/app.js data/route-manifest.js css/components.css css/responsive.css tests/platform-missions.test.js tests/storage.test.js tests/route-coverage.test.js
git commit -m "feat: add sourced real-app mission engine"
```

### Task 4: Complete IBKR Desktop orientation content (Phase 2)

**Files:**
- Modify: `data/platform-workflows.js`
- Modify: `data/navigation.js`
- Modify: `data/courses.js`
- Modify: `js/platform-hub.js`
- Test: `tests/platform-data.test.js`
- Test: `tests/platform-missions.test.js`

**Interfaces:**
- Adds Desktop workflow IDs: `desktop-install`, `desktop-paper-check`, `desktop-interface`, `desktop-portfolio`, `desktop-watchlist`, `desktop-contract-search`, `desktop-chart`, and `desktop-customize`.

- [ ] **Step 1: Add failing Desktop coverage tests**

```js
assert.deepEqual(getPlatformWorkflows("ibkr-desktop").map(({ id }) => id), [
  "desktop-install", "desktop-paper-check", "desktop-interface", "desktop-portfolio",
  "desktop-watchlist", "desktop-contract-search", "desktop-chart", "desktop-customize",
]);
```

Assert every workflow has at least three steps, one expected observation, one mistake, one recovery item, required evidence, `asOf`, `reviewAfter`, and direct official sources.

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/platform-data.test.js tests/platform-missions.test.js`

Expected: FAIL with missing Desktop workflow IDs.

- [ ] **Step 3: Add exact sourced Desktop orientation missions**

Use official Desktop product/download, interface, Watchlist, contract search, positions, chart, and column-customization materials. Avoid hard-coding fees or account-specific market-data behavior.

- [ ] **Step 4: Run focused and full tests, then commit**

Run: `node --test tests/platform-data.test.js tests/platform-missions.test.js`

Run: `npm.cmd test`

```powershell
git add data/platform-workflows.js data/navigation.js data/courses.js js/platform-hub.js tests/platform-data.test.js tests/platform-missions.test.js
git commit -m "feat: add IBKR Desktop orientation missions"
```

### Task 5: Complete IBKR Desktop order and options workflows (Phase 3)

**Files:**
- Modify: `data/platform-workflows.js`
- Modify: `data/options-workflow.js`
- Modify: `js/options-workflow.js`
- Modify: `data/assessments.js`
- Test: `tests/platform-missions.test.js`
- Test: `tests/options-workflow.test.js`

**Interfaces:**
- Adds Desktop workflow IDs: `desktop-rapid-order`, `desktop-preview`, `desktop-monitor-order`, `desktop-modify-cancel`, `desktop-option-chain`, `desktop-strategy-builder`, and `desktop-position-review`.

- [ ] **Step 1: Add failing workflow and safety tests**

Assert every submission-capable workflow requires `confirm-platform`, `confirm-paper`, `confirm-contract`, and `confirm-order` evidence, and that live submission language does not appear.

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/platform-missions.test.js tests/options-workflow.test.js`

- [ ] **Step 3: Add sourced Desktop order/options missions**

Include exact current Rapid Order Entry, preview, Orders & Trades, option-chain, Strategy Builder, modification/cancellation, and position-review sequences. Conceptual option math remains in existing labs and links back to the genuine-app mission.

- [ ] **Step 4: Run focused and full tests, then commit**

Run: `node --test tests/platform-missions.test.js tests/options-workflow.test.js tests/order-simulator.test.js tests/options-chain.test.js`

Run: `npm.cmd test`

```powershell
git add data/platform-workflows.js data/options-workflow.js js/options-workflow.js data/assessments.js tests/platform-missions.test.js tests/options-workflow.test.js
git commit -m "feat: add IBKR Desktop trading missions"
```

### Task 6: Add TWS/Mosaic orientation and paper workflow (Phase 4)

**Files:**
- Modify: `data/platform-workflows.js`
- Modify: `data/navigation.js`
- Modify: `data/courses.js`
- Modify: `js/platform-hub.js`
- Test: `tests/platform-missions.test.js`

**Interfaces:**
- Adds TWS IDs: `tws-install`, `tws-paper-check`, `tws-mosaic-layout`, `tws-window-grouping`, `tws-monitor`, `tws-quote`, `tws-chart`, `tws-portfolio`, `tws-activity`, and `tws-customize`.

- [ ] **Step 1: Add failing ordered-coverage tests**

Assert the TWS orientation list begins with install and PaperTrader checks, includes all named panels, and does not unlock before the Desktop core missions are complete.

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/platform-missions.test.js tests/learning-state.test.js`

- [ ] **Step 3: Add sourced TWS/Mosaic missions**

Base content on the official TWS product page, Mosaic Layout guide, TWS for Beginners course, and current panel guides. Teach color grouping as a TWS-specific concept and label Classic TWS as an advanced alternative, not the main track.

- [ ] **Step 4: Run focused and full tests, then commit**

Run: `node --test tests/platform-missions.test.js tests/learning-state.test.js tests/route-coverage.test.js`

Run: `npm.cmd test`

```powershell
git add data/platform-workflows.js data/navigation.js data/courses.js js/platform-hub.js tests/platform-missions.test.js tests/learning-state.test.js tests/route-coverage.test.js
git commit -m "feat: add TWS Mosaic orientation missions"
```

### Task 7: Add TWS order, options, and risk workflows (Phase 5)

**Files:**
- Modify: `data/platform-workflows.js`
- Modify: `data/orders.js`
- Modify: `data/options-workflow.js`
- Modify: `data/risk.js`
- Test: `tests/platform-missions.test.js`
- Test: `tests/order-simulator.test.js`
- Test: `tests/risk-lab.test.js`

**Interfaces:**
- Adds TWS IDs: `tws-order-entry`, `tws-order-preview`, `tws-order-monitor`, `tws-attached-orders`, `tws-option-chain`, `tws-combination`, and `tws-risk-review`.

- [ ] **Step 1: Add failing advanced-workflow safety tests**

Assert paper checks and critical order evidence are required; advanced workflows declare prerequisites; all changing margin/order availability claims link to official sources.

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/platform-missions.test.js tests/order-simulator.test.js tests/risk-lab.test.js`

- [ ] **Step 3: Add sourced TWS workflows**

Use current Mosaic Order Entry and Activity Panel guides. Explain advanced attributes, attached orders, combination construction, and margin-impact review without encouraging leverage or representing preview values as guaranteed outcomes.

- [ ] **Step 4: Run focused and full tests, then commit**

Run: `node --test tests/platform-missions.test.js tests/order-simulator.test.js tests/options-workflow.test.js tests/risk-lab.test.js`

Run: `npm.cmd test`

```powershell
git add data/platform-workflows.js data/orders.js data/options-workflow.js data/risk.js tests/platform-missions.test.js tests/order-simulator.test.js tests/risk-lab.test.js
git commit -m "feat: add TWS trading and risk missions"
```

### Task 8: Build cross-platform equivalence and repeated practice (Phase 6)

**Files:**
- Create: `data/platform-equivalents.js`
- Create: `js/platform-compare.js`
- Create: `tests/platform-compare.test.js`
- Modify: `js/app.js`
- Modify: `data/navigation.js`
- Modify: `data/route-manifest.js`
- Modify: `css/components.css`
- Modify: `css/responsive.css`

**Interfaces:**
- Produces: `PLATFORM_EQUIVALENTS`, `getEquivalentTask(id)`, `getComparisonCoverage()`, and `renderPlatformCompare(container)`.
- New route: `platforms/compare`.

- [ ] **Step 1: Write failing comparison coverage tests**

```js
assert.deepEqual(getComparisonCoverage().missing, []);
assert.ok(PLATFORM_EQUIVALENTS.every((item) => item.desktop.location && item.tws.location));
assert.ok(PLATFORM_EQUIVALENTS.some((item) => item.kind === "non-equivalent"));
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/platform-compare.test.js tests/route-coverage.test.js`

- [ ] **Step 3: Implement comparison data and accessible responsive table/cards**

Cover contract search, watchlists, portfolio, order entry, order state, charts, option chains, settings, and account information. Include TWS window grouping and Desktop left navigation as important non-equivalences.

- [ ] **Step 4: Run focused and full tests, then commit**

Run: `node --test tests/platform-compare.test.js tests/route-coverage.test.js tests/production-contracts.test.js`

Run: `npm.cmd test`

```powershell
git add data/platform-equivalents.js js/platform-compare.js js/app.js data/navigation.js data/route-manifest.js css/components.css css/responsive.css tests/platform-compare.test.js tests/route-coverage.test.js tests/production-contracts.test.js
git commit -m "feat: compare IBKR Desktop and TWS workflows"
```

### Task 9: Integrate mission evidence into assessment (Phase 7)

**Files:**
- Modify: `data/assessments.js`
- Modify: `js/assessment.js`
- Modify: `js/dashboard.js`
- Modify: `js/roadmap.js`
- Modify: `tests/assessment.test.js`
- Modify: `tests/presenters.test.js`

**Interfaces:**
- `deriveReadiness(state)` adds `desktop`, `tws`, and `crossPlatform` evidence domains while retaining knowledge, practice, process, reflection, overall, and status.

- [ ] **Step 1: Write failing evidence-based readiness tests**

Create states with quiz-only evidence and assert they cannot achieve platform mastery; create states with required mission evidence and passing scenarios and assert each platform domain is calculated independently.

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/assessment.test.js tests/presenters.test.js`

- [ ] **Step 3: Implement assessment integration**

Add Desktop, TWS, safety, order-verification, and cross-platform scenarios. Readiness language must say “curriculum evidence” and must not claim live-trading readiness, profitability, or elimination of risk.

- [ ] **Step 4: Run focused and full tests, then commit**

Run: `node --test tests/assessment.test.js tests/presenters.test.js tests/practice.test.js`

Run: `npm.cmd test`

```powershell
git add data/assessments.js js/assessment.js js/dashboard.js js/roadmap.js tests/assessment.test.js tests/presenters.test.js
git commit -m "feat: assess genuine-platform workflow evidence"
```

### Task 10: Production polish, source audit, and handoff docs (Phase 8)

**Files:**
- Modify: `css/variables.css`
- Modify: `css/main.css`
- Modify: `css/layout.css`
- Modify: `css/components.css`
- Modify: `css/lessons.css`
- Modify: `css/simulator.css`
- Modify: `css/responsive.css`
- Modify: `README.md`
- Modify: `tests/production-contracts.test.js`
- Modify: `tests/reference.test.js`

**Interfaces:**
- No new runtime API; this task closes accessibility, visual, source, documentation, and static-delivery contracts.

- [ ] **Step 1: Add failing production checks**

Assert the updated name and independent-affiliation statement exist, both theme token blocks exist, no `IBKR Masterclass Desktop Lab` copy remains, all platform sources use official domains, theme controls are labeled, and every new route is covered.

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/production-contracts.test.js tests/reference.test.js tests/route-coverage.test.js`

- [ ] **Step 3: Complete responsive, accessibility, and documentation polish**

Replace remaining hard-coded dark colors that fail Light mode, verify focus and non-color status cues, add source-review and official-app setup instructions, explain that paper behavior may differ from live execution, and document the eight-phase architecture and user actions.

- [ ] **Step 4: Run automated verification**

Run: `npm.cmd test`

Expected: all tests PASS with no skipped tests.

Run: `Get-ChildItem js,data -Filter *.js -Recurse | ForEach-Object { node --check $_.FullName }`

Expected: no syntax errors.

- [ ] **Step 5: Serve and perform manual smoke checks**

Run: `python -m http.server 4173`

Inspect `#/dashboard`, `#/platforms`, `#/platforms/desktop`, `#/platforms/tws`, `#/platforms/compare`, one Desktop mission, one TWS mission, an order lab, an options lab, and the assessment route at desktop and mobile widths in both themes. Confirm no console errors and stop the server.

- [ ] **Step 6: Commit**

```powershell
git add css README.md tests/production-contracts.test.js tests/reference.test.js
git commit -m "chore: polish and document IBKR Platform Mastery"
```

## Completion record

After Task 10, update this plan’s checkboxes, append exact automated test counts and manual verification results, then prepare the final user handoff with:

1. what was implemented by phase;
2. official applications and paper accounts the user must install/access;
3. tasks that require real-app visual confirmation;
4. GitHub/Vercel actions still requiring the user;
5. known limitations;
6. prioritized future improvements.

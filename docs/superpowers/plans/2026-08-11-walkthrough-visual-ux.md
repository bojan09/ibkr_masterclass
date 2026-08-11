# Walkthrough Visual UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace learner-facing missions with clearer Walkthroughs and expand the official IBKR screenshot experience into an accessible, step-linked gallery with at least 50 verified visual records.

**Architecture:** Keep workflow IDs, routes, storage, and completion evidence stable. Extend the immutable visual catalog with per-walkthrough step links, render those links through a one-at-a-time gallery, and reorganize the existing workflow page into Prepare, Recognize, Practice, and Confirm sections. Reuse the dependency-free ES-module, CSS-token, native-dialog, and official-host security patterns already in the repository.

**Tech Stack:** Static HTML, CSS, native browser JavaScript ES modules, Node.js built-in test runner, PowerShell verification commands, official IBKR guide assets.

## Global Constraints

- Learner-facing activity terminology is **Walkthrough** / **Walkthroughs**.
- Preserve existing workflow IDs, `/missions/` route paths, `platformEvidence`, and saved completion evidence.
- Maintain at least 50 distinct official screenshot records.
- Every non-setup walkthrough has at least two visuals; installation and paper-session checks have at least one.
- Show two to four curated visuals per walkthrough whenever official coverage allows; do not add decorative or near-duplicate images.
- Images remain unedited and remotely hosted on approved official IBKR HTTPS hosts; callouts remain separate HTML overlays.
- Do not add dependencies, broker connectivity, user uploads, video, generated interface replicas, gamification, or unrelated curriculum changes.
- Add only evidence-backed improvements discovered during implementation that directly strengthen Walkthrough accessibility, source durability, or usability; record each addition in the final Results section.
- Preserve Light, Dark, and System themes, mobile behavior, accessibility, `no-referrer`, source dates, review dates, enlargement, and error fallbacks.
- Use test-driven development: add a focused failing test, observe the expected failure, implement the smallest complete behavior, then rerun focused and full tests.

---

## File Responsibility Map

- `data/platform-visuals.js`: official screenshot records, approved-host validation, immutable step-link schema, and visual lookup helpers.
- `data/platform-workflows.js`: stable walkthrough content and learner-facing terminology; IDs/routes remain compatible.
- `js/platform-visuals.js`: accessible gallery markup, visual selection, dialog behavior, and isolated image-error handling.
- `js/platform-missions.js`: Walkthrough catalog, four-section detail layout, completion evidence, and stable storage integration.
- `js/app.js`, `js/dashboard.js`, `js/assessment.js`, `js/platform-compare.js`: route titles and learner-facing terminology outside the core page.
- `data/courses.js`, `data/navigation.js`, `data/assessments.js`: curriculum/navigation terminology while preserving route values.
- `css/components.css`, `css/responsive.css`: catalog grouping, section navigation, gallery presentation, themes, and mobile layout.
- `scripts/audit-platform-visuals.mjs`: reusable remote source/image availability and content-type audit.
- `tests/platform-visuals.test.js`: coverage, schema, validation, official-host, and immutability contracts.
- `tests/platform-visual-renderer.test.js`: gallery markup and escaped-data contracts.
- `tests/platform-missions.test.js`: Walkthrough catalog/detail structure, terminology, progress preservation, and evidence behavior.
- `tests/production-contracts.test.js`: CSS, documentation, security, and production-copy contracts.
- `README.md`: Walkthrough usage, official-source privacy, catalog maintenance, and audit instructions.

---

### Task 1: Add immutable step-linked visual data

**Files:**
- Modify: `data/platform-visuals.js`
- Modify: `tests/platform-visuals.test.js`

**Interfaces:**
- Consumes: `getWorkflow(id)` from `data/platform-workflows.js`.
- Produces: `getWalkthroughVisuals(walkthroughId) -> ReadonlyArray<{ visual, steps, caption }>`.
- Preserves: `getMissionVisuals(missionId) -> ReadonlyArray<visual>` as a compatibility helper during the transition.

- [ ] **Step 1: Write failing schema and coverage tests**

Add tests that require every visual to define a link for each mapped workflow and require resolved step links:

```js
test("walkthrough visuals resolve immutable valid practice-step links", () => {
  for (const workflow of PLATFORM_WORKFLOWS) {
    const linked = getWalkthroughVisuals(workflow.id);
    assert.ok(linked.length >= 1, workflow.id);
    for (const item of linked) {
      assert.equal(item.visual.missionIds.includes(workflow.id), true);
      assert.ok(item.steps.length >= 1);
      assert.ok(item.steps.every((step) => Number.isInteger(step) && step >= 1 && step <= workflow.steps.length));
      assert.ok(item.caption.length >= 20);
      assert.ok(Object.isFrozen(item));
      assert.ok(Object.isFrozen(item.steps));
    }
  }
});

test("visual step-link keys exactly match mapped workflows", () => {
  for (const visual of PLATFORM_VISUALS) {
    assert.deepEqual(Object.keys(visual.stepLinks).sort(), [...visual.missionIds].sort(), visual.id);
    assert.ok(Object.isFrozen(visual.stepLinks));
    assert.ok(Object.values(visual.stepLinks).every((link) => Object.isFrozen(link) && Object.isFrozen(link.steps)));
  }
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test tests/platform-visuals.test.js`

Expected: FAIL because `getWalkthroughVisuals` and `stepLinks` do not exist.

- [ ] **Step 3: Implement and freeze the step-link model**

Add a focused freezer and validation path:

```js
function freezeStepLinks(stepLinks = {}) {
  return Object.freeze(Object.fromEntries(Object.entries(stepLinks).map(([workflowId, link]) => [
    workflowId,
    Object.freeze({ steps: Object.freeze([...link.steps]), caption: link.caption }),
  ])));
}

function validStepLinks(visual) {
  if (!visual.stepLinks || Object.keys(visual.stepLinks).length !== visual.missionIds.length) return false;
  return visual.missionIds.every((workflowId) => {
    const workflow = getWorkflow(workflowId);
    const link = visual.stepLinks[workflowId];
    return workflow && link && typeof link.caption === "string" && link.caption.trim().length >= 20
      && Array.isArray(link.steps) && link.steps.length > 0
      && link.steps.every((step) => Number.isInteger(step) && step >= 1 && step <= workflow.steps.length);
  });
}

export function getWalkthroughVisuals(walkthroughId) {
  return Object.freeze(PLATFORM_VISUALS.flatMap((visual) => {
    const link = visual.stepLinks[walkthroughId];
    return link ? [Object.freeze({ visual, steps: link.steps, caption: link.caption })] : [];
  }));
}
```

Update `guideVisual` to accept and freeze `stepLinks`, update `validatePlatformVisual` to call `validStepLinks`, and author accurate links for all existing 22 records. Keep `getMissionVisuals` implemented by unwrapping `getWalkthroughVisuals` so current consumers remain green.

- [ ] **Step 4: Run focused and related tests**

Run: `node --test tests/platform-visuals.test.js tests/platform-visual-renderer.test.js tests/platform-missions.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the schema**

```powershell
git add data/platform-visuals.js tests/platform-visuals.test.js
git commit -m "feat: link official visuals to walkthrough steps"
```

---

### Task 2: Expand official IBKR Desktop visual coverage

**Files:**
- Modify: `data/platform-visuals.js`
- Modify: `tests/platform-visuals.test.js`

**Interfaces:**
- Consumes: `guideVisual(...)`, immutable `stepLinks`, and `getWalkthroughVisuals(...)` from Task 1.
- Produces: curated Desktop records that give every non-setup Desktop walkthrough at least two step-relevant visuals.

- [ ] **Step 1: Add a failing Desktop coverage test**

```js
const SETUP_WALKTHROUGHS = new Set(["desktop-install", "desktop-paper-check", "tws-install", "tws-paper-check"]);

test("hands-on walkthroughs have at least two curated official visuals", () => {
  for (const workflow of PLATFORM_WORKFLOWS) {
    const minimum = SETUP_WALKTHROUGHS.has(workflow.id) ? 1 : 2;
    assert.ok(getWalkthroughVisuals(workflow.id).length >= minimum, workflow.id);
  }
});
```

- [ ] **Step 2: Run the test and verify the expected coverage failure**

Run: `node --test tests/platform-visuals.test.js`

Expected: FAIL for the Desktop walkthroughs that currently resolve only one visual.

- [ ] **Step 3: Add the exact Desktop visual set**

Use the existing `https://www.ibkrguides.com/ibkrdesktop/resources/images/` base and add records for these distinct official images. Map each record only to walkthroughs whose steps it actually illustrates and provide a 20+ character learning caption per mapping.

| Record ID | Source page | Image path | Primary walkthrough/steps |
|---|---|---|---|
| `desktop-portfolio-sort` | `see-positions.htm` | `sortby.png` | `desktop-portfolio` 2; `desktop-position-review` 2 |
| `desktop-portfolio-orders-menu` | `see-positions.htm` | `orders.png` | `desktop-portfolio` 3; `desktop-position-review` 2 |
| `desktop-watchlist-create` | `watchlists.htm` | `watchlists1.png` | `desktop-watchlist` 2 |
| `desktop-watchlist-add-row` | `watchlists.htm` | `watchlists2.png` | `desktop-watchlist` 3 |
| `desktop-watchlist-contract-picker` | `watchlists.htm` | `watchlists3.png` | `desktop-watchlist` 3; `desktop-contract-search` 3 |
| `desktop-watchlist-view-menu` | `watchlists.htm` | `watchlists4.png` | `desktop-watchlist` 2; `desktop-customize` 2 |
| `desktop-watchlist-custom-view` | `watchlists.htm` | `watchlists5.png` | `desktop-customize` 3 |
| `desktop-contract-details` | `contract-search.htm` | `contract-search2.png` | `desktop-contract-search` 3 |
| `desktop-chart-periodicity` | `charts-summary.htm` | `charts3.png` | `desktop-chart` 2 |
| `desktop-chart-indicators` | `charts-summary.htm` | `chart-indicators.png` | `desktop-chart` 3 |
| `desktop-chart-drawing-tools` | `charts-summary.htm` | `chart-drawing-tools.png` | `desktop-chart` 3 |
| `desktop-chart-settings` | `charts-summary.htm` | `chart-custom1.png` | `desktop-chart` 3 |
| `desktop-columns-reorder` | `how-to-customize-columns.htm` | `columns1.png` | `desktop-customize` 3 |
| `desktop-rapid-order-context` | `rapid-order-entry.htm` | `rapid-order-entry_300x455.png` | `desktop-rapid-order` 1; `desktop-preview` 1 |
| `desktop-order-working-actions` | `orders-and-trades.htm` | `orders-and-trades1.png` | `desktop-monitor-order` 2; `desktop-modify-cancel` 2 |
| `desktop-order-state-filter` | `orders-and-trades.htm` | `orders-and-trades2.png` | `desktop-monitor-order` 2; `desktop-modify-cancel` 1 |
| `desktop-strategy-builder-open` | `strategy-builder.htm` | `ntws-v1.4-1.png` | `desktop-strategy-builder` 1 |
| `desktop-strategy-builder-select` | `strategy-builder.htm` | `ntws-v1.4-2.png` | `desktop-strategy-builder` 2 |
| `desktop-strategy-builder-legs` | `strategy-builder.htm` | `ntws-v1.4-3.png` | `desktop-strategy-builder` 2 |
| `desktop-strategy-builder-atm` | `strategy-builder.htm` | `ntws-v1.4-5.png` | `desktop-strategy-builder` 2 |
| `desktop-strategy-builder-order` | `strategy-builder.htm` | `ntws-v1.4-4.png` | `desktop-strategy-builder` 3 |

Use source date `2025-12-18` for `strategy-builder.htm` and verify the current update date shown by each other official page before committing. Set `reviewedAt` to `2026-08-11`. Retain only two to four authored visuals per walkthrough by narrowing mappings where the table would otherwise exceed four.

- [ ] **Step 4: Add representative regression assertions**

Assert the Watchlist walkthrough resolves creation, contract-picker, and view images in learning order; assert Strategy Builder resolves opening, legs, and order review; assert all Desktop image URLs remain unique within the catalog.

- [ ] **Step 5: Run focused tests**

Run: `node --test tests/platform-visuals.test.js`

Expected: Desktop coverage assertions PASS; TWS coverage may still fail and is completed in Task 3.

- [ ] **Step 6: Commit Desktop coverage**

```powershell
git add data/platform-visuals.js tests/platform-visuals.test.js
git commit -m "feat: expand official IBKR Desktop walkthrough visuals"
```

---

### Task 3: Expand official TWS/Mosaic visual coverage

**Files:**
- Modify: `data/platform-visuals.js`
- Modify: `tests/platform-visuals.test.js`

**Interfaces:**
- Consumes: Task 1 step-link schema and Task 2 global coverage test.
- Produces: at least 50 total records and two-to-four curated visuals for every non-setup TWS walkthrough.

- [ ] **Step 1: Add a failing catalog-size assertion**

```js
test("official catalog contains at least fifty distinct screenshot records", () => {
  assert.ok(PLATFORM_VISUALS.length >= 50);
  assert.equal(new Set(PLATFORM_VISUALS.map(({ imageUrl }) => imageUrl)).size, PLATFORM_VISUALS.length);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/platform-visuals.test.js`

Expected: FAIL because the current catalog has fewer than 50 distinct image URLs and TWS walkthroughs remain under-covered.

- [ ] **Step 3: Add the exact TWS/Mosaic visual set**

Use the existing `https://www.ibkrguides.com/traderworkstation/resources/images/` base and add these distinct official images with accurate callouts and step captions:

| Record ID | Source page | Image path | Primary walkthrough/steps |
|---|---|---|---|
| `tws-monitor-portfolio` | `monitor-panel.htm` | `portfolio.png` | `tws-portfolio` 1–2; `tws-monitor` 2 |
| `tws-monitor-watchlist-create` | `monitor-panel.htm` | `watchlist.png` | `tws-monitor` 2; `tws-window-grouping` 3 |
| `tws-monitor-watchlist-add` | `monitor-panel.htm` | `watchlist2.png` | `tws-monitor` 3; `tws-window-grouping` 3 |
| `tws-quote-details` | `quote-panel.htm` | `quotedetails.png` | `tws-quote` 3; `tws-window-grouping` 1 |
| `tws-quote-advanced` | `quote-panel.htm` | `quotedetails1.png` | `tws-quote` 3 |
| `tws-activity-orders` | `activity-panel.htm` | `orders.png` | `tws-activity` 2–3; `tws-order-monitor` 2 |
| `tws-activity-trades` | `activity-panel.htm` | `trades.png` | `tws-activity` 2–3; `tws-order-monitor` 3 |
| `tws-activity-summary` | `activity-panel.htm` | `summary.png` | `tws-activity` 2–3 |
| `tws-activity-pending-menu` | `activity-panel.htm` | `rightclick.png` | `tws-order-monitor` 2; `tws-attached-orders` 2 |
| `tws-order-advanced-menu` | `advanced-button.htm` | `advanced1.png` | `tws-order-entry` 3; `tws-order-preview` 2 |
| `tws-order-bracket` | `advanced-button.htm` | `advanced7.png` | `tws-attached-orders` 2–3 |
| `tws-order-margin-check` | `advanced-button.htm` | `advanced11.png` | `tws-order-preview` 2–3; `tws-risk-review` 1 |
| `tws-spread-template` | `option-chain.htm` | `spreadtemplate.jpg` | `tws-combination` 2 |
| `tws-strategy-loaded-spread` | `option-chain.htm` | `optionchain2.png` | `tws-combination` 2–3 |
| `tws-performance-scenarios` | `performance-profile.htm` | `performanceprofile.png` | `tws-risk-review` 2 |
| `tws-strategy-performance-graph` | `strategy-performance-graph.htm` | `strategyperformancegraph.png` | `tws-risk-review` 2–3 |

Use `2026-04-08` for the current Mosaic Order Entry page, `2025-10-08` for the listed TWS guide pages unless the implementation audit finds a newer date on the official page, and `reviewedAt: "2026-08-11"`. Reuse the Mosaic overview, Monitor, Chart, Quote, Order Entry, and Activity records across closely related walkthroughs so every non-setup TWS walkthrough reaches two visuals without exceeding four.

- [ ] **Step 4: Add high-risk regression assertions**

Assert that order preview resolves Order Entry plus Check Margin, attached orders resolves Advanced plus Bracket, Activity resolves Orders plus Trades plus Summary, and risk review resolves Check Margin plus both performance views.

- [ ] **Step 5: Run the complete catalog tests**

Run: `node --test tests/platform-visuals.test.js`

Expected: PASS, including at least 50 distinct records and the one/two visual coverage thresholds.

- [ ] **Step 6: Commit TWS coverage**

```powershell
git add data/platform-visuals.js tests/platform-visuals.test.js
git commit -m "feat: expand official TWS walkthrough visuals"
```

---

### Task 4: Replace stacked visual cards with a step-linked gallery

**Files:**
- Modify: `js/platform-visuals.js`
- Modify: `tests/platform-visual-renderer.test.js`

**Interfaces:**
- Consumes: `getWalkthroughVisuals(walkthroughId)` from Task 1.
- Produces: `renderWalkthroughVisuals(walkthroughId) -> string` and `bindWalkthroughVisuals(container) -> cleanup function`.
- Preserves: native `<dialog>`, official links, callouts, lazy loading, and isolated failure states.

- [ ] **Step 1: Write failing gallery markup tests**

Require a gallery region with one initially selected item, count, thumbnails, step badge, caption, previous/next controls, disclosure, and enlargement:

```js
test("walkthrough visuals render a selected step-linked gallery", () => {
  const html = renderWalkthroughVisuals("desktop-watchlist");
  assert.match(html, /data-walkthrough-gallery/);
  assert.match(html, /1 of [2-4]/);
  assert.match(html, /data-gallery-previous/);
  assert.match(html, /data-gallery-next/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /Supports steps?/);
  assert.match(html, /<details class="mission-visual-provenance">/);
  assert.match(html, /data-enlarge-visual/);
});
```

Also assert that only the first panel lacks `hidden`, titles/captions are escaped, every thumbnail points to a real panel, and an unknown workflow returns an empty string.

- [ ] **Step 2: Run renderer tests and verify failure**

Run: `node --test tests/platform-visual-renderer.test.js`

Expected: FAIL because the current renderer stacks figures and has no gallery controls or step links.

- [ ] **Step 3: Render the gallery shell and panels**

Implement `renderWalkthroughVisuals` using the resolved items. Use stable IDs derived from the walkthrough and visual IDs, render native buttons with `role="tab"`, render panels with `role="tabpanel"`, and put unselected panels behind `hidden`. Format one step as `Supports step 2` and multiple steps as `Supports steps 2–3`.

Each selected panel contains the existing image frame, markers, text legend, step caption, product-version note, `<details class="mission-visual-provenance">`, official guide link, and enlarge dialog. The first panel remains readable without interaction JavaScript.

- [ ] **Step 4: Write a failing interaction-state unit test**

Extract and export a pure helper:

```js
test("gallery selection clamps to available visual indexes", () => {
  assert.equal(nextGalleryIndex(0, -1, 3), 0);
  assert.equal(nextGalleryIndex(0, 1, 3), 1);
  assert.equal(nextGalleryIndex(2, 1, 3), 2);
  assert.equal(nextGalleryIndex(2, -1, 3), 1);
});
```

- [ ] **Step 5: Implement gallery interaction and cleanup**

Implement `nextGalleryIndex(index, delta, count)` with clamping. In `bindWalkthroughVisuals`, keep selected index per gallery, update `hidden`, `aria-selected`, `tabIndex`, the position label, and previous/next disabled states. Thumbnail selection uses its declared index. Do not move focus after selection; the button the learner activated retains focus.

Reuse existing dialog open/close and focus restoration. Change the error handler so it marks only the failed visual panel; gallery navigation must remain active.

- [ ] **Step 6: Run focused renderer and workflow tests**

Run: `node --test tests/platform-visual-renderer.test.js tests/platform-missions.test.js`

Expected: PASS.

- [ ] **Step 7: Commit the gallery**

```powershell
git add js/platform-visuals.js tests/platform-visual-renderer.test.js
git commit -m "feat: add step-linked official image gallery"
```

---

### Task 5: Redesign the catalog and pages as Walkthroughs

**Files:**
- Modify: `js/platform-missions.js`
- Modify: `data/platform-workflows.js`
- Modify: `js/app.js`
- Modify: `js/dashboard.js`
- Modify: `js/assessment.js`
- Modify: `js/platform-compare.js`
- Modify: `data/courses.js`
- Modify: `data/navigation.js`
- Modify: `data/assessments.js`
- Modify: `tests/platform-missions.test.js`
- Modify: `tests/platform-compare.test.js`
- Modify: `tests/production-contracts.test.js`

**Interfaces:**
- Consumes: `renderWalkthroughVisuals`, `bindWalkthroughVisuals`, existing workflow data, and existing `platformEvidence` records.
- Produces: grouped Walkthrough catalog and Prepare/Recognize/Practice/Confirm detail pages.
- Preserves: `renderPlatformMissions(...)`, `completeWorkflow(...)`, routes, workflow IDs, and stored evidence shape.

- [ ] **Step 1: Add failing catalog and page-structure tests**

Export `renderCatalog` for direct testing and require grouped, progress-aware output:

```js
test("catalog groups Walkthroughs and reports saved progress", () => {
  const storage = createStorage({ backend: memoryBackend(), key: "walkthrough-catalog" });
  const workflow = getPlatformWorkflows("ibkr-desktop")[0];
  completeWorkflow(storage, workflow.id, workflow.evidence.map(({ id }) => id), "2026-08-11T12:00:00.000Z");
  const html = renderCatalog("ibkr-desktop", storage);
  assert.match(html, /Official-app walkthroughs/);
  assert.match(html, /1 of 15 completed/);
  assert.match(html, />Orientation</);
  assert.match(html, />Trading</);
  assert.match(html, />Options</);
  assert.match(html, /official visuals/);
  assert.doesNotMatch(html, /\bmissions?\b/i);
});

test("walkthrough detail follows Prepare Recognize Practice Confirm order", () => {
  const html = renderWorkflow(getWorkflow("desktop-watchlist"), storage);
  const labels = ["Prepare", "Recognize", "Practice", "Confirm"];
  const indexes = labels.map((label) => html.indexOf(`>${label}<`));
  assert.ok(indexes.every((index) => index >= 0));
  assert.deepEqual(indexes, [...indexes].sort((a, b) => a - b));
  assert.doesNotMatch(html, /\bmission\b/i);
});
```

Add a persistence regression that seeds a pre-change `platformEvidence` record and proves the redesigned page renders it as completed without migration.

- [ ] **Step 2: Run tests and verify terminology/layout failures**

Run: `node --test tests/platform-missions.test.js tests/platform-compare.test.js tests/production-contracts.test.js`

Expected: FAIL on the old mission terminology, ungrouped catalog, and missing four-section landmarks.

- [ ] **Step 3: Implement the grouped catalog**

Map phase suffixes to `Orientation`, `Trading`, `Options`, and `Risk`, preserving workflow order. Render group headings, completed/total count, each objective, status, and `getWalkthroughVisuals(item.id).length` as the official visual count. Use “Official-app walkthroughs,” “Published walkthroughs,” and “Walkthroughs” in learner copy.

- [ ] **Step 4: Implement the four-section detail page**

Render an in-page anchor navigation and section IDs:

```html
<nav class="walkthrough-steps" aria-label="Walkthrough sections">
  <a href="#walkthrough-prepare">Prepare</a>
  <a href="#walkthrough-recognize">Recognize</a>
  <a href="#walkthrough-practice">Practice</a>
  <a href="#walkthrough-confirm">Confirm</a>
</nav>
```

Place objective/date/prerequisites/safety inside Prepare; gallery inside Recognize; genuine-application steps inside Practice; observations/mistakes/recovery/evidence inside Confirm. Keep sources after Confirm. Change completion copy to “Complete walkthrough,” “Walkthrough evidence saved locally,” and “Complete every evidence check before marking this walkthrough complete.”

- [ ] **Step 5: Replace remaining learner-facing terminology**

Update route breadcrumbs/document titles, dashboard copy, assessment labels and prompts, comparison links, course descriptions, navigation labels, challenge copy, workflow prerequisites/steps, and assessment question `s2`. Preserve route string values containing `/missions/`.

Do not rename internal exported functions, CSS classes, filenames, route segments, storage keys, or historical spec/plan files.

- [ ] **Step 6: Run focused and full tests**

Run: `node --test tests/platform-missions.test.js tests/platform-compare.test.js tests/assessment.test.js tests/production-contracts.test.js`

Then run: `npm.cmd test`

Expected: all tests PASS and existing progress behavior remains unchanged.

- [ ] **Step 7: Commit the Walkthrough UX**

```powershell
git add js/platform-missions.js data/platform-workflows.js js/app.js js/dashboard.js js/assessment.js js/platform-compare.js data/courses.js data/navigation.js data/assessments.js tests/platform-missions.test.js tests/platform-compare.test.js tests/production-contracts.test.js
git commit -m "feat: redesign platform learning as Walkthroughs"
```

---

### Task 6: Add responsive themed gallery presentation

**Files:**
- Modify: `css/components.css`
- Modify: `css/responsive.css`
- Modify: `tests/production-contracts.test.js`

**Interfaces:**
- Consumes: catalog group, four-section navigation, gallery, panel, thumbnail, disclosure, and controls markup from Tasks 4–5.
- Produces: responsive Light/Dark/System presentation without page-level overflow.

- [ ] **Step 1: Add failing production-style contracts**

Require selectors for `.walkthrough-group`, `.walkthrough-steps`, `.mission-visual-gallery`, `.mission-visual-thumbnails`, selected tabs, hidden panels, controls, provenance, mobile horizontal thumbnail scrolling, and minimum touch targets.

```js
assert.match(components, /\.walkthrough-steps/);
assert.match(components, /\.mission-visual-gallery/);
assert.match(components, /\.mission-visual-thumbnails/);
assert.match(components, /\[aria-selected="true"\]/);
assert.match(components, /\.mission-visual-panel\[hidden\]/);
assert.match(responsive, /overflow-x:\s*auto/);
assert.match(responsive, /min-height:\s*44px/);
```

- [ ] **Step 2: Run the contract test and verify failure**

Run: `node --test tests/production-contracts.test.js`

Expected: FAIL because the new selectors do not exist.

- [ ] **Step 3: Implement catalog, section, and gallery styles**

Reuse existing CSS variables and button styles. Add:

- group spacing and quiet headings;
- a compact four-column section navigator that remains readable in both themes;
- one selected gallery panel with a stable image area;
- previous/next controls and a position label;
- thumbnail tabs with selected, focus-visible, hover, loading, and failed states;
- compact step badge/caption and native provenance disclosure;
- original-color official screenshots on neutral image backing;
- existing dialog, marker, and legend compatibility.

Use `[hidden] { display: none; }` only within the panel selector so native hidden behavior is explicit and scoped.

- [ ] **Step 4: Implement mobile behavior**

At the existing mobile breakpoint, stack navigation labels as a compact grid, keep gallery actions at least 44px high, make thumbnails horizontally scrollable, keep the selected image full width, and prevent page-level horizontal overflow. Retain existing mobile dialog sizing.

- [ ] **Step 5: Run style contracts and the full suite**

Run: `node --test tests/production-contracts.test.js tests/platform-visual-renderer.test.js tests/platform-missions.test.js`

Then run: `npm.cmd test`

Expected: PASS.

- [ ] **Step 6: Commit responsive presentation**

```powershell
git add css/components.css css/responsive.css tests/production-contracts.test.js
git commit -m "feat: style responsive Walkthrough galleries"
```

---

### Task 7: Add source auditing, documentation, and final verification

**Files:**
- Create: `scripts/audit-platform-visuals.mjs`
- Modify: `README.md`
- Modify: `tests/production-contracts.test.js`
- Modify: `docs/superpowers/plans/2026-08-11-walkthrough-visual-ux.md`

**Interfaces:**
- Consumes: `PLATFORM_VISUALS` and `isAllowedOfficialVisualUrl` from `data/platform-visuals.js`.
- Produces: a reusable zero/nonzero remote audit command and current maintenance documentation.

- [ ] **Step 1: Write a failing audit contract test**

Require the audit script to exist, import the production catalog, issue `HEAD` with a `GET` fallback, require successful responses, require `image/*` content types for image URLs, and deduplicate source URLs before fetching.

Also update the documentation contract to require the terms “Walkthroughs,” “at least 50,” and `node scripts/audit-platform-visuals.mjs`.

- [ ] **Step 2: Run the production contract test and verify failure**

Run: `node --test tests/production-contracts.test.js`

Expected: FAIL because the audit script and updated documentation do not exist.

- [ ] **Step 3: Implement the audit script**

Use native `fetch` only. For every distinct image URL, require `response.ok` and `content-type` beginning with `image/`. For every distinct source URL, require `response.ok`. Print concise totals:

```js
console.log(`IMAGES_OK=${imageOk}/${imageUrls.length}`);
console.log(`SOURCES_OK=${sourceOk}/${sourceUrls.length}`);
```

Collect failures and set `process.exitCode = 1` after reporting each failed URL. Do not follow or accept a redirect to a non-approved host; validate the final response URL with `isAllowedOfficialVisualUrl`.

- [ ] **Step 4: Update README terminology and maintenance guidance**

Replace current learner-facing mission wording with Walkthroughs, describe the one-at-a-time step-linked gallery and 50+ official records, retain the privacy/source disclaimer, and document:

```powershell
node scripts/audit-platform-visuals.mjs
node --test tests/platform-visuals.test.js tests/platform-visual-renderer.test.js
```

Keep internal filename references unchanged where they are literal architecture paths.

- [ ] **Step 5: Run automated verification**

Run:

```powershell
npm.cmd test
$jsFiles = Get-ChildItem -Path . -Recurse -File -Filter '*.js'
foreach ($jsFile in $jsFiles) { node --check $jsFile.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
git diff --check
node scripts/audit-platform-visuals.mjs
```

Expected: full test suite PASS, every JavaScript file parses, no whitespace errors, at least 50/50 images pass, and every distinct source page passes.

- [ ] **Step 6: Perform local interaction and visual verification**

Serve with `python -m http.server 4173`. Inspect these routes:

- Desktop Watchlist walkthrough in Light mode at desktop width;
- Desktop Strategy Builder walkthrough in Dark mode at desktop width;
- TWS Activity walkthrough in Light mode at desktop width;
- TWS order preview or risk walkthrough in Dark mode at desktop width;
- Desktop Watchlist walkthrough at a mobile width.

Verify previous/next and thumbnail selection, position text, step badges, source disclosure, enlargement/close/focus restoration, one-image failure isolation, saved completion, themes, markers, touch targets, and absence of page-level horizontal overflow.

- [ ] **Step 7: Scan learner-facing terminology**

Run:

```powershell
rg -n -i "\bmissions?\b" README.md js data
```

Expected: matches are limited to internal identifiers, filenames/imports, route strings, stable IDs, and code-only class/data attributes. No rendered learner-facing string says mission or missions.

- [ ] **Step 8: Record results and commit verification**

Add a dated Results section to this plan with test count, JavaScript file count, visual/source audit totals, inspected routes/themes/widths, terminology scan conclusion, and any corrected source mappings.

```powershell
git add scripts/audit-platform-visuals.mjs README.md tests/production-contracts.test.js docs/superpowers/plans/2026-08-11-walkthrough-visual-ux.md
git commit -m "docs: verify Walkthrough visual UX"
```

- [ ] **Step 9: Merge locally and push the verified result**

Use the finishing-a-development-branch workflow. Fast-forward `codex/walkthrough-visual-ux` into `master`, rerun `npm.cmd test` on the merged tree, delete the feature branch only after a green post-merge suite, stop the temporary local server, and confirm `master` is clean.

Inspect `git remote -v`. Configure `origin` as `https://github.com/bojan09/ibkr_masterclass.git` if needed, then run:

```powershell
git push -u origin master
```

Expected: the verified local `master` is published to `bojan09/ibkr_masterclass.git`; local `master` and `origin/master` have zero commits ahead or behind. Authentication or repository-permission failure is an explicit stop condition and must be reported without attempting credential workarounds.

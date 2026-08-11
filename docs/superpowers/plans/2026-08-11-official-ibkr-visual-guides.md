# Official IBKR Visual Guides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add authentic, officially sourced IBKR screenshots with attribution, callouts, enlargement, and failure handling to every Desktop and TWS/Mosaic mission.

**Architecture:** Keep screenshot metadata in one immutable data catalog with strict official-host validation and mission lookup helpers. Render that trusted catalog through a focused visual component inserted into existing mission pages, with event binding isolated from evidence completion. Load official assets remotely under a narrow Content Security Policy and keep every text mission usable if an image fails.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript ES modules, native `<dialog>`, browser image events, Node built-in test runner.

## Global Constraints

- Every one of the 32 real-application missions resolves to at least one official visual reference.
- Image and source URLs must use HTTPS and one of: `interactivebrokers.com`, `www.interactivebrokers.com`, `ibkrguides.com`, `www.ibkrguides.com`.
- No official image file is committed to the repository.
- Every visual displays product identity, official-source attribution, source update date, mapping review date, alt text, and a direct guide link.
- The original screenshot is never recolored or edited; numbered markers are separate overlays.
- Broken images do not block steps, safety checks, evidence, or mission completion.
- The existing `no-referrer` policy and independent-affiliation language remain.
- Existing platform evidence behavior and storage format remain unchanged.
- Visuals work in Dark, Light, and System modes and at mobile widths.

---

## File map

**Create**

- `data/platform-visuals.js` — official visual catalog, host/date/callout validation, and mission lookup.
- `js/platform-visuals.js` — safe visual-card markup, dialog lifecycle, and image-failure behavior.
- `tests/platform-visuals.test.js` — catalog coverage and provenance contracts.
- `tests/platform-visual-renderer.test.js` — markup, attribution, and fallback contracts.

**Modify**

- `js/platform-missions.js` — insert mission visuals and compose cleanup handlers.
- `css/components.css` — visual card, marker, legend, dialog, skeleton, and error styles.
- `css/responsive.css` — mobile visual layout and full-size viewer constraints.
- `index.html` — allow only official IBKR image hosts in `img-src`.
- `tests/platform-missions.test.js` — preserve completion behavior with visual integration.
- `tests/production-contracts.test.js` — CSP, no-local-image, and responsive contracts.
- `README.md` — document embedded official requests, attribution, limitations, and source review.

---

### Task 1: Build the official visual catalog

**Files:**
- Create: `data/platform-visuals.js`
- Create: `tests/platform-visuals.test.js`
- Read: `data/platform-workflows.js`

**Interfaces:**
- Consumes: `PLATFORM_WORKFLOWS` and their stable `id` values.
- Produces: `ALLOWED_VISUAL_HOSTS`, `PLATFORM_VISUALS`, `isAllowedOfficialVisualUrl(url)`, `validatePlatformVisual(visual)`, `getMissionVisuals(missionId)`.

- [x] **Step 1: Write the failing provenance and coverage tests**

```js
import { PLATFORM_WORKFLOWS } from "../data/platform-workflows.js";
import {
  ALLOWED_VISUAL_HOSTS,
  PLATFORM_VISUALS,
  getMissionVisuals,
  isAllowedOfficialVisualUrl,
  validatePlatformVisual,
} from "../data/platform-visuals.js";

test("every genuine-platform mission has an official visual", () => {
  assert.equal(PLATFORM_WORKFLOWS.length, 32);
  for (const mission of PLATFORM_WORKFLOWS) {
    const visuals = getMissionVisuals(mission.id);
    assert.ok(visuals.length >= 1, mission.id);
    assert.ok(visuals.every((visual) => visual.missionIds.includes(mission.id)));
  }
});

test("visuals have valid provenance, dates, alt text, and callouts", () => {
  assert.deepEqual(ALLOWED_VISUAL_HOSTS, [
    "interactivebrokers.com", "www.interactivebrokers.com",
    "ibkrguides.com", "www.ibkrguides.com",
  ]);
  for (const visual of PLATFORM_VISUALS) {
    assert.equal(validatePlatformVisual(visual), true);
    assert.equal(isAllowedOfficialVisualUrl(visual.imageUrl), true);
    assert.equal(isAllowedOfficialVisualUrl(visual.sourceUrl), true);
    assert.match(visual.sourceUpdated, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(visual.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(visual.alt.length >= 30);
    assert.equal(new Set(visual.callouts.map(({ id }) => id)).size, visual.callouts.length);
    assert.ok(visual.callouts.every(({ x, y }) => x >= 0 && x <= 100 && y >= 0 && y <= 100));
  }
});
```

- [x] **Step 2: Run the focused test and confirm the missing-module failure**

Run: `node --test tests/platform-visuals.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `data/platform-visuals.js`.

- [x] **Step 3: Implement URL and schema validation**

```js
export const ALLOWED_VISUAL_HOSTS = Object.freeze([
  "interactivebrokers.com",
  "www.interactivebrokers.com",
  "ibkrguides.com",
  "www.ibkrguides.com",
]);

export function isAllowedOfficialVisualUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_VISUAL_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

export function validatePlatformVisual(visual) {
  const requiredStrings = ["id", "platformId", "title", "alt", "imageUrl", "sourceUrl", "sourceLabel", "sourceUpdated", "reviewedAt", "productVersionNote"];
  if (!requiredStrings.every((key) => typeof visual[key] === "string" && visual[key].trim())) return false;
  if (!isAllowedOfficialVisualUrl(visual.imageUrl) || !isAllowedOfficialVisualUrl(visual.sourceUrl)) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(visual.sourceUpdated) || !/^\d{4}-\d{2}-\d{2}$/.test(visual.reviewedAt)) return false;
  if (!Array.isArray(visual.missionIds) || !visual.missionIds.length || !Array.isArray(visual.callouts)) return false;
  const ids = visual.callouts.map(({ id }) => id);
  return new Set(ids).size === ids.length && visual.callouts.every(({ id, label, x, y }) => id && label && x >= 0 && x <= 100 && y >= 0 && y <= 100);
}
```

- [x] **Step 4: Add the complete official image inventory**

Create immutable records sourced from these official screen families:

| Platform | Official page | Mission coverage |
|---|---|---|
| Desktop | `ibkrdesktop/` and Desktop download | install, paper check, interface |
| Desktop | `ibkrdesktop/see-positions.htm`, `account-portfolio.htm`, `orders-and-trades.htm` | portfolio, monitoring, modify/cancel, position review |
| Desktop | `ibkrdesktop/watchlists.htm`, `contract-search.htm` | watchlist, contract search |
| Desktop | `ibkrdesktop/charts-summary.htm`, `how-to-customize-columns.htm` | chart, customize |
| Desktop | `ibkrdesktop/rapid-order-entry.htm`, `how-to-submit-order.htm` | rapid entry, preview |
| Desktop | `ibkrdesktop/option-chain.htm` | option chain, strategy builder |
| TWS | TWS product and beginner course | install, paper check |
| TWS | `traderworkstation/mosaic-layout.htm` | layout, grouping, customize |
| TWS | `monitor-panel.htm`, `quote-panel.htm`, `chart-panel.htm`, `activity-panel.htm` | monitor, quote, chart, portfolio, activity |
| TWS | `mosaic-order-entry-panel.htm` and Activity | order entry, preview, monitor, attached orders |
| TWS | `option-chain.htm`, `about-combination-orders.htm`, `tws/usersguidebook/mosaic/performanceprofile.htm` | option chain, combination, risk review |

Resolve relative guide assets against their page URL with `new URL(relativePath, sourceUrl).href`. Give every record at least one useful callout when the official image visibly contains the named region. For an overview image without a safe precise target, use an empty `callouts` array and an explicit `productVersionNote`.

- [x] **Step 5: Add mission lookup and freeze the catalog**

```js
export const PLATFORM_VISUALS = Object.freeze(RAW_VISUALS.map((visual) => {
  if (!validatePlatformVisual(visual)) throw new TypeError(`Invalid platform visual: ${visual.id}`);
  return Object.freeze({ ...visual, missionIds: Object.freeze([...visual.missionIds]), callouts: Object.freeze(visual.callouts.map(Object.freeze)) });
}));

export function getMissionVisuals(missionId) {
  return PLATFORM_VISUALS.filter((visual) => visual.missionIds.includes(missionId));
}
```

- [x] **Step 6: Run focused and full tests**

Run: `node --test tests/platform-visuals.test.js tests/platform-missions.test.js`

Expected: PASS.

Run: `npm.cmd test`

Expected: all tests PASS.

- [x] **Step 7: Commit the catalog**

```powershell
git add data/platform-visuals.js tests/platform-visuals.test.js
git commit -m "feat: catalog official IBKR platform screenshots"
```

### Task 2: Render accessible mission visuals

**Files:**
- Create: `js/platform-visuals.js`
- Create: `tests/platform-visual-renderer.test.js`
- Modify: `js/platform-missions.js`
- Modify: `tests/platform-missions.test.js`

**Interfaces:**
- Consumes: `getMissionVisuals(missionId)` from Task 1.
- Produces: `renderMissionVisuals(missionId): string`, `bindMissionVisuals(container): () => void`.

- [x] **Step 1: Write the failing renderer contract**

```js
import { renderMissionVisuals } from "../js/platform-visuals.js";

test("mission visual markup is attributed, accessible, enlargeable, and recoverable", () => {
  const html = renderMissionVisuals("desktop-watchlist");
  assert.match(html, /Recognize the real screen/);
  assert.match(html, /Official IBKR screenshot/);
  assert.match(html, /alt="[^"]{30,}"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /decoding="async"/);
  assert.match(html, /data-enlarge-visual/);
  assert.match(html, /<dialog[^>]+data-visual-dialog/);
  assert.match(html, /The official screenshot could not be loaded/);
  assert.match(html, /target="_blank" rel="noreferrer"/);
});
```

- [x] **Step 2: Run the renderer test and confirm the missing-module failure**

Run: `node --test tests/platform-visual-renderer.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `js/platform-visuals.js`.

- [x] **Step 3: Implement trusted HTML rendering**

Render a `<section class="mission-visuals">` with one `<figure>` per visual. Each figure includes the original `<img>`, marker buttons/spans positioned with `left: ${x}%` and `top: ${y}%`, an ordered legend, dates in `<time datetime>`, a safe source anchor, a hidden error fallback, and a paired `<dialog>`. Escape every text attribute and text node even though the catalog is validated.

```js
export function renderMissionVisuals(missionId) {
  const visuals = getMissionVisuals(missionId);
  return `<section class="mission-visuals" aria-labelledby="mission-visuals-title">
    <header><p class="eyebrow">Official visual reference</p><h2 id="mission-visuals-title">Recognize the real screen</h2></header>
    ${visuals.map(renderVisualCard).join("")}
  </section>`;
}
```

- [x] **Step 4: Implement dialog, focus restoration, and image failure**

`bindMissionVisuals(container)` installs one click handler, one close handler per active dialog through delegation, and one capturing `error` handler. Enlarge buttons copy the selected official image URL and alt text into the dialog, call `showModal()` when supported, and fall back to opening the official image anchor otherwise. Closing restores focus to the opener. An image error adds `is-image-error`, hides marker overlays, and reveals the source fallback. The returned cleanup removes every installed listener and closes any open dialog.

- [x] **Step 5: Integrate visuals before mission steps**

In `renderWorkflow`, insert `${renderMissionVisuals(workflow.id)}` immediately before the section titled **Perform in the genuine application**. In `renderPlatformMissions`, call `bindMissionVisuals(container)` for workflow routes and compose that cleanup with the evidence-form cleanup.

```js
const cleanupVisuals = workflow ? bindMissionVisuals(container) : () => {};
return () => {
  form?.removeEventListener("submit", handleSubmit);
  cleanupVisuals();
};
```

- [x] **Step 6: Run focused and full tests**

Run: `node --test tests/platform-visual-renderer.test.js tests/platform-missions.test.js tests/platform-visuals.test.js`

Expected: PASS.

Run: `npm.cmd test`

Expected: all tests PASS.

- [x] **Step 7: Commit the renderer**

```powershell
git add js/platform-visuals.js js/platform-missions.js tests/platform-visual-renderer.test.js tests/platform-missions.test.js
git commit -m "feat: show official screenshots in platform missions"
```

### Task 3: Add secure responsive presentation

**Files:**
- Modify: `index.html`
- Modify: `css/components.css`
- Modify: `css/responsive.css`
- Modify: `tests/production-contracts.test.js`

**Interfaces:**
- Consumes: class and data attributes emitted by `renderMissionVisuals`.
- Produces: secure image loading and responsive Dark/Light/System visual presentation.

- [x] **Step 1: Write failing CSP and presentation contracts**

```js
const html = read("index.html");
const components = read("css/components.css");
const responsive = read("css/responsive.css");
assert.match(html, /img-src 'self' data: https:\/\/www\.ibkrguides\.com https:\/\/ibkrguides\.com https:\/\/www\.interactivebrokers\.com https:\/\/interactivebrokers\.com/);
assert.match(components, /\.mission-visual-card/);
assert.match(components, /\.mission-visual-marker/);
assert.match(components, /\.mission-visual-card\.is-image-error/);
assert.match(components, /\.mission-visual-dialog::backdrop/);
assert.match(responsive, /\.mission-visual-layout/);
```

- [x] **Step 2: Run the production contract and confirm failure**

Run: `node --test tests/production-contracts.test.js`

Expected: FAIL because the official image hosts and visual styles are absent.

- [x] **Step 3: Narrowly extend Content Security Policy**

Change only `img-src` to:

```html
img-src 'self' data: https://www.ibkrguides.com https://ibkrguides.com https://www.interactivebrokers.com https://interactivebrokers.com;
```

Keep `connect-src 'none'`, `object-src 'none'`, `base-uri 'self'`, and `form-action 'self'` unchanged.

- [x] **Step 4: Implement theme-safe visual styles**

Add styles for `.mission-visuals`, `.mission-visual-card`, `.mission-visual-layout`, `.mission-visual-frame`, `.mission-visual-marker`, `.mission-visual-legend`, `.mission-visual-source`, `.mission-visual-error`, and `.mission-visual-dialog`. Use existing semantic color variables, `aspect-ratio`, `object-fit: contain`, visible focus rings, and no filters on images. Hide `.mission-visual-error` normally; on `.is-image-error`, hide image/markers/skeleton and reveal the error.

- [x] **Step 5: Add mobile and reduced-motion behavior**

At `max-width: 760px`, stack the image and legend, reduce dialog padding, cap the image to the viewport, and keep marker targets at least 28 CSS pixels. At `max-width: 480px`, make visual actions full width. Do not animate marker or dialog transforms when `prefers-reduced-motion: reduce` applies.

- [x] **Step 6: Run focused and full tests**

Run: `node --test tests/production-contracts.test.js tests/platform-visual-renderer.test.js`

Expected: PASS.

Run: `npm.cmd test`

Expected: all tests PASS.

- [x] **Step 7: Commit secure responsive presentation**

```powershell
git add index.html css/components.css css/responsive.css tests/production-contracts.test.js
git commit -m "feat: style secure responsive IBKR visual guides"
```

### Task 4: Document, audit, and visually verify the complete feature

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-08-11-official-ibkr-visual-guides.md`
- Test: all `tests/*.test.js`

**Interfaces:**
- Consumes: complete catalog, renderer, styles, and CSP.
- Produces: final source audit, verification record, and user-facing maintenance instructions.

- [ ] **Step 1: Add documentation contracts**

Extend the production contract to assert that README documents:

```js
assert.match(read("README.md"), /official IBKR screenshots/i);
assert.match(read("README.md"), /external image request/i);
assert.match(read("README.md"), /screenshots.*source of truth/i);
```

- [ ] **Step 2: Update user and maintenance documentation**

Document that mission pages load official screenshots from IBKR hosts, show source/update labels, and may differ from the installed application because of later releases, operating system, permissions, theme, or workspace customization. Explain the external image request and `no-referrer` policy. Add a maintenance procedure: review each source after a major Desktop/TWS release, update image URL/date/callouts, run `tests/platform-visuals.test.js`, and visually inspect the affected mission.

- [ ] **Step 3: Verify remote image availability**

Run a PowerShell audit that sends GET requests to every unique `imageUrl` and `sourceUrl` imported from `PLATFORM_VISUALS`, requiring a 2xx status and an image content type for image URLs. Record counts without downloading files into the repository.

- [ ] **Step 4: Run complete automated verification**

Run: `npm.cmd test`

Expected: all tests PASS, 0 failed, 0 skipped.

Run: `Get-ChildItem js,data -Filter *.js -Recurse | ForEach-Object { node --check $_.FullName }`

Expected: every module parses successfully.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 5: Perform visual and interaction smoke tests**

Serve with `python -m http.server 4173`. Inspect Desktop interface, Watchlist, Rapid Order Entry, Option Chain, TWS Mosaic, Order Entry, and TWS Option Chain missions in desktop/mobile sizes and Light/Dark modes. Confirm authentic images load, attribution matches, markers align approximately, dialog opens/closes with mouse and keyboard, focus returns, broken-image fallback works, and no horizontal overflow occurs.

- [ ] **Step 6: Record results and commit**

Mark plan checkboxes complete and append exact test, source-audit, syntax, and visual results.

```powershell
git add README.md tests/production-contracts.test.js docs/superpowers/plans/2026-08-11-official-ibkr-visual-guides.md
git commit -m "docs: verify official IBKR visual guides"
```

- [ ] **Step 7: Merge locally after final verification**

Use the finishing-a-development-branch workflow. Merge `codex/ibkr-official-visual-guides` into `master`, rerun `npm.cmd test` on the merged result, and delete the feature branch only after a green post-merge suite.

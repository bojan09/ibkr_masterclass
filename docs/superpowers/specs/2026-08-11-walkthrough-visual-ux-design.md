# Walkthrough Visual UX Design

**Date:** 2026-08-11  
**Status:** Approved design  
**Product:** IBKR Platform Mastery

## Purpose

Make the genuine-platform learning experience easier to follow and more visually representative of IBKR Desktop and Trader Workstation. Replace the militaristic learner-facing term “mission” with “walkthrough,” add substantially more official IBKR screenshots, and connect each screenshot to the exact action it helps the learner recognize.

The companion remains an independent educational aid. It does not imitate a broker connection, reproduce the IBKR interface, accept brokerage credentials, or replace the current official Paper Trading application.

## Decisions

1. The learner-facing name is **Walkthroughs**.
2. Existing workflow IDs, routes, storage keys, and saved completion evidence remain compatible. Internal identifiers such as `platformEvidence`, `/missions/`, and implementation class names may remain when changing them would create migration risk without learner benefit.
3. The visual catalog grows from 22 to at least **50 distinct official screenshot records**.
4. Every hands-on walkthrough other than installation and paper-session verification receives at least two relevant official screenshots. Installation and paper-session verification retain at least one screenshot and may receive more only when an official source provides a genuinely useful additional view.
5. A walkthrough presents two to four curated screenshots at a time. Additional images are included only when they explain a distinct step or state.
6. Screenshots remain unedited images served from official IBKR guide hosts. Numbered callouts continue to be separate HTML overlays.
7. The page uses a step-linked gallery rather than stacking every screenshot vertically.

## Scope

### Included

- Rename learner-visible “mission” language across platform pages, navigation, dashboards, assessments, status messages, accessibility labels, and current product documentation.
- Preserve existing learner progress without a storage migration.
- Expand official screenshot coverage for both IBKR Desktop and TWS/Mosaic.
- Add step associations to the visual catalog.
- Redesign the catalog and individual walkthrough pages.
- Add a responsive, keyboard-accessible screenshot gallery.
- Retain source dates, review dates, official guide links, callouts, enlargement, loading feedback, and image-error fallbacks.
- Verify current official source pages and image URLs during implementation.
- Support Light, Dark, and System theme choices at desktop and mobile widths.

### Not included

- Generated or recreated IBKR interface images.
- User uploads, screen recording, optical recognition, or brokerage-account integration.
- Automatic control of IBKR Desktop or TWS.
- Downloading or redistributing official screenshots into the repository.
- Changing curriculum phase count, lesson prerequisites, trading education, or completion-safety policy.
- Migrating internal route paths or storage keys solely to remove the word `mission` from developer-facing implementation details.

## Information Architecture

### Walkthrough catalog

The existing platform catalog becomes a **Walkthroughs** catalog grouped in curriculum order:

- Orientation
- Trading
- Options
- Risk, when present for that platform

Each row shows:

- sequence number;
- walkthrough title and short objective;
- completion state;
- number of official visual references;
- phase/group label.

The catalog header reports total walkthroughs and completed walkthroughs. The supporting text explains that the actions happen in the genuine Paper Trading application and that the companion stores learning evidence only.

### Individual walkthrough

Each page follows the same four-part mental model:

1. **Prepare** — objective, verified-as-of date, prerequisites, and the Paper Trading safety gate.
2. **Recognize** — the step-linked official screenshot gallery.
3. **Practice** — numbered actions in the genuine application.
4. **Confirm** — expected observations, common mistakes, recovery guidance, and completion evidence.

A compact in-page overview names these four sections and links to them. It is navigation, not a stateful wizard: learners may revisit any section without losing data or being forced through artificial locks.

Official sources remain at the end of the page. Per-image provenance is condensed into a native disclosure element so the image and learning callouts receive visual priority while source data remains one action away.

## Screenshot Content Model

The existing visual record remains the source of truth for image identity, official URL, source URL, source label, dates, product note, alternative text, and callouts.

Each record gains step associations for every walkthrough it supports. A step association identifies:

- the walkthrough ID;
- one or more one-based practice step numbers;
- a short learning caption explaining why the screenshot matters at that point.

Validation must prove that:

- every association references an existing walkthrough already listed by the visual;
- every referenced step number exists in that walkthrough;
- every learning caption is nonempty;
- all image and source URLs use HTTPS and an approved official host;
- source and review dates use strict ISO dates;
- callout identifiers and coordinates remain valid;
- visual data and nested association data are immutable.

The retrieval helper returns visuals in authored learning order with the association for the requested walkthrough resolved. Existing storage and completion functions do not depend on the gallery selection.

## Official Image Expansion

Implementation will audit current official guide pages and select images that represent distinct learner-visible states. High-value multi-image sources already identified include:

- IBKR Desktop Watchlists: creation, instrument selection, and view customization;
- IBKR Desktop Strategy Builder: opening the builder, selecting a strategy, adding legs, and reviewing parameters;
- TWS Activity Panel: Orders, Trades, Trade Summary, and pending-order actions;
- TWS Option Chain and Strategy Builder: option chain, builder, spread templates, and loaded strategies;
- TWS Advanced Order controls: attached orders and margin review.

The target is at least 50 distinct visual records across the 32 walkthroughs. Reusing one official screenshot across related walkthroughs is allowed when the callouts and step association remain accurate, but reuse does not count as a new distinct record.

Selection rules:

- prefer the current official guide image closest to the named action;
- avoid decorative marketing images when a product-guide screenshot exists;
- do not add near-duplicate images that fail to teach a new control or state;
- record the source page’s current published update date;
- use a review date of the implementation audit;
- inspect callout placement against the actual image before release.

## Gallery Interaction

Only one screenshot card is visually expanded at a time. The gallery provides:

- a position indicator such as “2 of 4”;
- previous and next buttons;
- a thumbnail/tab list with concise accessible labels;
- the selected screenshot, numbered markers, and matching text legend;
- a step badge such as “Supports steps 2–3”;
- the step-specific learning caption;
- an enlarge action using the existing native dialog behavior;
- compact source details and a direct official-guide link.

Selecting a thumbnail or previous/next control updates the displayed screenshot without navigating away. Focus stays on the control the learner used. The selected thumbnail exposes `aria-selected`; the image title/caption region is announced politely without announcing every decorative layout change.

Keyboard behavior uses native buttons. Tab reaches each control, Enter/Space selects a thumbnail, and the existing dialog closes through its close button or native Escape behavior. No custom arrow-key model is required.

On narrow screens, the selected image remains full width, previous/next controls remain at least touch-target size, and thumbnails scroll horizontally without creating page-level overflow.

## Error and Loading Behavior

- Each image keeps lazy loading, asynchronous decoding, and `no-referrer` requests.
- A failed selected image shows its existing “Official image unavailable” state plus the official guide link.
- One failed image does not disable the other gallery items.
- If JavaScript interaction is unavailable, the first official image and all written practice steps remain readable.
- If a walkthrough has no valid visual because of a catalog defect, the page remains usable and omits the Recognize section; automated tests prevent release in that state.
- A stale workflow continues to display its source-review warning before practice begins.

## Visual Presentation

The redesign reuses current tokens, buttons, panels, typography, and theme infrastructure. It adds no dependency and no second design system.

The main UX changes are:

- a clearer four-section page rhythm;
- reduced vertical repetition from one-at-a-time screenshot display;
- stronger visual connection between a screenshot and the corresponding practice step;
- compact provenance instead of an always-expanded metadata block;
- clearer catalog status and grouping.

Official screenshots retain their original colors in both application themes. Surrounding chrome adapts to Light or Dark mode.

## Terminology Migration

All current learner-facing production copy will use:

- “Walkthrough” / “Walkthroughs” for the activity;
- “Complete walkthrough” for the completion action;
- “Walkthrough evidence saved locally” for success;
- “Official-app walkthroughs” for the catalog label.

Current documentation is updated to match. Historical committed specifications and implementation plans are not rewritten. Internal functions such as `renderPlatformMissions`, CSS class names such as `.platform-mission`, and `/missions/` route segments may remain to preserve compatibility and limit unrelated refactoring.

Tests will scan production-rendered copy and current documentation for unintended learner-facing uses of “mission.”

## Testing and Verification

Implementation follows test-driven development.

### Data tests

- At least 50 distinct official visual records exist.
- Every non-setup walkthrough has at least two visuals; all walkthroughs have at least one.
- Step associations reference real walkthrough steps.
- Official hosts, HTTPS, dates, alternative text, callouts, and immutability remain valid.
- Representative high-risk URLs and mappings have regression assertions.

### Renderer tests

- Walkthrough copy replaces learner-facing mission copy.
- The four section landmarks render in order.
- Gallery markup exposes selection, position, thumbnails, step links, captions, provenance disclosure, enlargement, and error recovery.
- Catalog groups and progress counts are correct.
- Dynamic catalog text remains HTML-escaped.

### Interaction tests

- Previous, next, and thumbnail selection update the displayed visual.
- Focus behavior and dialog focus restoration remain correct.
- An image failure affects only its visual.
- Existing completion evidence saves and reloads unchanged.

### Production and visual verification

- Run the full automated suite and JavaScript syntax checks.
- Audit every distinct remote image and source URL for successful official-host responses and valid image content types.
- Inspect representative Desktop and TWS walkthroughs in Light and Dark modes.
- Inspect desktop and mobile layouts for overflow, touch targets, source disclosure, markers, gallery switching, and dialog behavior.
- Confirm a previously completed workflow still appears completed after the terminology and layout change.

## Acceptance Criteria

The feature is complete when:

1. Learners see “Walkthroughs,” not “missions,” throughout the current production experience.
2. Existing completion evidence remains readable with no migration or reset.
3. The catalog contains at least 50 distinct official screenshot records and meets the per-walkthrough coverage rule.
4. Screenshots are attached to valid practice steps and presented in a one-at-a-time accessible gallery.
5. Catalog grouping, progress, Prepare/Recognize/Practice/Confirm structure, provenance, enlargement, and failure recovery work at desktop and mobile widths.
6. Every image and source passes the official-host and availability audit at implementation time.
7. Light, Dark, and System themes remain supported.
8. The complete automated and visual verification gates pass before local merge.

## Delivery Boundary

Stop once the acceptance criteria pass. Do not add video, user-generated screenshots, broker connectivity, gamification, route migrations, or unrelated curriculum changes as part of this feature.

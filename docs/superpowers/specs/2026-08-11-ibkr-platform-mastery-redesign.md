# IBKR Platform Mastery — Genuine-Platform Redesign

## Purpose

Transform the existing IBKR Masterclass website into **IBKR Platform Mastery**, an independent learning companion for the genuine IBKR Desktop and Trader Workstation (TWS/Mosaic) applications.

The learner practices navigation in official IBKR software using paper trading. The website teaches concepts, supplies exact version-stamped missions, checks understanding, and explains financial mechanics. It does not present a browser reconstruction as IBKR, connect to a brokerage account, request credentials, or place orders.

## Product identity

- Name: **IBKR Platform Mastery**
- Subtitle: **Independent Training for IBKR Desktop and Trader Workstation**
- Affiliation statement: This independent educational project is not affiliated with, endorsed by, or connected to Interactive Brokers LLC or its affiliates.
- Product order: IBKR Desktop first, then TWS/Mosaic.
- Primary learning environment: official IBKR paper-trading applications.
- Supporting environment: clearly labeled educational calculators and fixed-data simulations in the website.

## Success criteria

A learner who completes the program can:

1. Distinguish IBKR Desktop from TWS and select the appropriate platform.
2. Confirm whether an official application is connected to paper or live trading before acting.
3. Locate portfolio, watchlist, contract search, charts, order entry, orders and trades, balances, option chains, and settings in each platform.
4. Verify contract identity, side, quantity, order type, price, time in force, estimated exposure, and account mode before submission.
5. Construct, preview, monitor, modify, and cancel paper orders in both platforms.
6. Navigate stock and option workflows without relying on an imitation interface.
7. Explain the important differences between IBKR Desktop and TWS/Mosaic.
8. Recognize when documentation may have become stale and return to current official IBKR guidance.

## Scope boundaries

### Included

- Current stable IBKR Desktop.
- Current stable TWS, with Mosaic as the primary beginner workspace.
- Paper-trading setup and repeated live-versus-paper verification.
- Official-app guided missions, knowledge checks, troubleshooting, and readiness evidence.
- Stocks, ETFs, options, basic and advanced orders, account monitoring, and risk education already within the curriculum.
- Existing educational order, options, payoff, Greeks, risk, and assessment tools where they remain accurate and useful.

### Excluded

- TradingView, Trading 212, other brokers, and other charting platforms.
- Broker authentication, credential storage, account APIs, live brokerage connections, and order transmission.
- A pixel-accurate clone of proprietary IBKR interfaces.
- Embedded copyrighted IBKR screenshots used as application interface assets.
- Personalized investment advice, trade recommendations, profit promises, or readiness claims based only on course completion.
- Classic TWS as a complete parallel curriculum. It may be introduced where an official workflow materially differs, but Mosaic is the main TWS track.

## Learning architecture

The application has four layers:

1. **Platform tracks** — separate IBKR Desktop and TWS/Mosaic curricula with explicit prerequisites.
2. **Mission companion** — version-stamped, step-by-step tasks performed in the official paper applications.
3. **Concept laboratories** — browser-based simulations for mechanics such as spreads, order states, option payoff, Greeks, and margin stress; these never teach invented menu placement.
4. **Evidence and assessment** — checklists, scenario questions, troubleshooting prompts, and local completion records.

Platform-specific content is data-driven. Each workflow record contains:

- platform and workspace;
- verification date;
- official source URL;
- prerequisites;
- safety gate;
- objective;
- exact current control labels and locations;
- expected observable result;
- common mistakes;
- troubleshooting steps;
- completion evidence;
- stale-content review date.

## User experience

### Product shell

The existing application shell remains. Branding, dashboard summaries, roadmap, navigation labels, and disclaimers are updated to the new identity. The dashboard leads with a two-track platform selector and makes the recommended sequence explicit.

Users can select **Dark**, **Light**, or **System** appearance from an accessible theme control. The choice is stored locally, respects the operating-system preference when set to System, and is applied before the main interface renders to avoid a visible theme flash. Neither theme relies on color alone to communicate profit, loss, warning, selection, or completion.

### Real-app mission pattern

Every navigation mission follows the same pattern:

1. Identify the target application and workspace.
2. Verify **Paper Trading** before continuing.
3. State the task and why it matters.
4. Give exact current navigation instructions sourced from official IBKR material.
5. Describe what the learner should observe.
6. Ask the learner to verify critical fields or explain the result.
7. Provide recovery instructions for common mismatches.
8. Record local completion only after the learner confirms the evidence checklist.

Missions that reach an order submission step stop at preview until the curriculum explicitly calls for a paper order. No mission instructs the learner to submit in a live account.

### Simulators

Existing simulators remain available under **Concept Labs**. The current invented `IBKR Masterclass Desktop Lab` is removed as a navigation-teaching experience. Reusable financial calculations and simulated data remain, but their styling and copy must distinguish them from official IBKR software.

### Cross-platform equivalence

After both tracks, an equivalence view maps each task to its current location in IBKR Desktop and TWS/Mosaic. It covers at least contract search, watchlists, portfolio, order entry, order status, charts, options chains, settings, and account information. Differences are explained rather than flattened into false equivalence.

## Components and module boundaries

- `data/platforms.js`: platform metadata, download and official-guide links, supported track order, and verification dates.
- `data/platform-workflows.js`: structured Desktop and TWS mission content.
- `data/platform-equivalents.js`: explicit task-to-location comparisons.
- `js/platform-hub.js`: track selection and platform overview presentation.
- `js/platform-missions.js`: mission state, evidence checklist, and completion presentation.
- `js/platform-compare.js`: cross-platform comparison presentation.
- `js/theme.js`: theme validation, persistence, system-preference synchronization, and control presentation.
- `js/desktop-simulator.js`: retained only for platform-neutral concept presentation or replaced by focused components; no invented navigation shell remains.
- `js/storage.js`: remains the only browser-storage boundary and gains a migration for the revised track state.
- `data/route-manifest.js`, `data/navigation.js`, `data/courses.js`, and `js/app.js`: updated to expose the new routes without breaking existing concept labs.

Each presenter receives storage and route dependencies explicitly. Platform data modules do not access the DOM or local storage.

## State and data flow

1. The router selects a platform hub, mission, comparison, lesson, or lab route.
2. The presenter reads immutable platform content from data modules.
3. The presenter reads learner state through `js/storage.js`.
4. A mission may be marked complete only when all required evidence checks are acknowledged.
5. The storage layer records platform, workflow ID, completion time, content verification date, and attempt history.
6. Dashboard and readiness presenters derive progress from stored evidence rather than from route visits.

No credentials, account numbers, balances, positions, brokerage exports, or other sensitive account data are requested or persisted.

## Accuracy and source policy

- Official Interactive Brokers product pages, user guides, release notes, and IBKR Campus materials are primary sources.
- Each platform workflow includes an `asOf` date and at least one direct official source.
- UI locations and labels are not invented. Unverified behavior is omitted or explicitly marked for re-verification.
- Version-sensitive content receives an on-screen review warning after its configured review date.
- Changeable fees, permissions, margin rules, market-data availability, and regulatory behavior link to current official pages rather than being presented as permanent constants.
- Automated tests enforce official-domain links and source metadata but do not claim that a passing test proves IBKR has not changed.

## Safety and error handling

- Every hands-on order mission begins with an account-mode check.
- Live-account warnings use text and iconography, never color alone.
- Invalid or unavailable theme preferences safely fall back to System.
- Broken or missing content records render a safe error card with a link to the official guide.
- Invalid routes fall back to the existing not-found handling.
- Corrupt learner state is normalized through the storage layer.
- A workflow whose review date has passed remains readable but is visibly labeled **Verify current interface before continuing**.
- Simulated market values remain centralized, dated, and visibly labeled.

## Testing strategy

### Automated

- Platform metadata, track order, source-domain, verification-date, and route-contract tests.
- Mission schema and safety-gate tests.
- Evidence-based completion and storage-migration tests.
- Cross-platform equivalence coverage tests.
- Regression tests for existing lessons, calculators, assessments, and routes.
- Static resource, accessibility-contract, and responsive-contract checks.
- Theme persistence, System preference, early application, and valid-value tests.

### Manual

- Serve locally and inspect representative Desktop, TWS, mission, comparison, and concept-lab routes.
- Verify keyboard navigation, focus order, responsive layout, and reduced-motion behavior.
- Verify contrast, focus visibility, charts, tables, warnings, and status indicators in Dark and Light modes.
- Compare every platform-specific instruction against the current official guide.
- Run representative missions in official IBKR Desktop paper trading and TWS PaperTrader when the user has installed and can access them.
- Confirm that no screen implies broker connectivity or requests confidential account information.

## Eight implementation phases

### Phase 1 — Accuracy foundation and product reset

- Rename the product and update affiliation and simulation boundaries.
- Add platform metadata, source registry, track hub, and revised roadmap.
- Add persistent Dark, Light, and System appearance controls.
- Remove the invented Desktop lab from navigation teaching.
- Introduce setup and paper-versus-live safety education.
- Preserve existing concept labs under explicit educational labels.

### Phase 2 — IBKR Desktop orientation

- Installation and login-mode guidance.
- Left navigation, Portfolio, Positions, Orders & Trades, Balances, Watchlists, contract search, charts, settings, columns, and views.
- Beginner missions and troubleshooting.

### Phase 3 — IBKR Desktop trading workflows

- Rapid Order Entry, preview, order types, order status, modification, cancellation, charts, option chains, Strategy Builder, and position management.
- Stock and options paper missions with safety gates.

### Phase 4 — TWS/Mosaic orientation

- Installation, PaperTrader, Mosaic layout, Monitor, Quote, charts, Portfolio, Activity, window grouping, and workspace customization.
- Beginner missions and troubleshooting.

### Phase 5 — TWS trading workflows

- Mosaic Order Entry, advanced attributes, order monitoring, attached orders, option chains, combinations, and relevant risk tools.
- Stock and options paper missions with safety gates.

### Phase 6 — Cross-platform mastery

- Task equivalence maps and important non-equivalences.
- Repeat-the-workflow missions in both platforms.
- Platform-selection guidance based on workflow needs, not investment recommendations.

### Phase 7 — Paper missions and assessment

- Integrated mission sequences, scenario checks, troubleshooting drills, final practical assessment, and evidence-based readiness reporting.

### Phase 8 — Production polish and maintenance

- Accessibility, Dark and Light contrast QA, responsive QA, source audit, content-expiry behavior, performance, documentation, deployment review, and final regression testing.

## Phase completion rule

Each phase must pass its focused tests and the full regression suite before the next phase begins. Since the user authorized all phases, work proceeds without routine approval pauses. External actions requiring the user—installing official applications, signing in, accessing paper accounts, visually confirming current screens, publishing to GitHub, or deploying to Vercel—are deferred to the final handoff.

## Final acceptance

The redesign is complete when all eight phases pass automated checks, the website consistently distinguishes official software from educational simulations, both platform tracks are navigable and sourced, and the user receives a concise handoff containing completed work, required user actions, known verification limits, and prioritized future improvements.

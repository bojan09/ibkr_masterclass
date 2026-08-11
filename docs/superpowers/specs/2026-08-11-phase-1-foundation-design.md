# IBKR Masterclass Phase 1 Foundation Design

## Scope

Phase 1 delivers the production-shaped application foundation only: architecture, responsive shell, sidebar navigation, hash routing, dark terminal-inspired theme, centralized versioned local storage, and a polished dashboard. Course lessons, real progress calculations, notes, bookmarks, quizzes, and simulators belong to later phases; Phase 1 represents them with honest empty, locked, or baseline states rather than fake functionality.

## Architecture

The application is a static HTML/CSS/JavaScript site with native ES modules and no build step. `index.html` owns semantic landmarks and loading fallbacks. `js/app.js` composes independent modules for routing, storage, navigation, and dashboard rendering. Navigation and roadmap metadata live in `data/` so later phases can extend the information model without rewriting the shell.

The hash router exposes one working dashboard route and renders a consistent “planned curriculum” state for future routes. This makes every sidebar item keyboard-accessible and linkable without claiming that later phases are implemented. A centralized storage service is the only module permitted to access `localStorage`; it validates the stored envelope, applies defaults, records a schema version, and recovers safely from malformed data or unavailable storage.

## Interface and visual system

The desktop layout uses a persistent left rail, compact top bar, and scrollable learning workspace. The visual language is an original dark financial-academy interface: charcoal surfaces, restrained crimson accents, tabular numbers, fine dividers, and calm motion. The dashboard contains the requested hero, overall progress, key learning metrics, recommended next lesson, phase roadmap, recent activity, bookmarks/notes states, knowledge scores, and Beginner/Intermediate/Advanced track cards.

At tablet widths the rail narrows; on mobile it becomes an off-canvas drawer with a backdrop, close control, and Escape-key support. Content stacks to one column, tables are avoided in the foundation dashboard, and interactive targets remain at least 44px high. Focus rings, landmarks, labels, reduced-motion support, and non-color status labels are included from the start.

## Data flow

1. `app.js` loads default application state through `storage.js`.
2. `router.js` normalizes the URL hash and emits route changes.
3. `navigation.js` renders grouped navigation from `data/navigation.js` and tracks the active route.
4. `dashboard.js` combines baseline state with `data/dashboard.js` to render dashboard sections.
5. User shell preferences, such as sidebar state, are persisted through the storage adapter.

## Error handling

Storage parsing, validation, quota, and security failures fall back to in-memory defaults and never prevent the page from rendering. Unknown routes render a planned-content state with a path back to the dashboard. The application exposes a visible fatal-error panel only if initial composition fails unexpectedly and logs technical detail to the console.

## Verification

Automated tests cover route normalization/matching, storage defaults/version recovery, and data integrity using Node's built-in test runner without production dependencies. Browser verification checks navigation, sidebar behavior, focus handling, absence of console errors, responsive widths, and localStorage persistence. HTML and CSS receive static sanity checks, and the page remains usable when JavaScript reports an initialization failure.


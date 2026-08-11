# IBKR Masterclass Phase 2 Learning System Design

## Scope

Phase 2 turns the Phase 1 shell into a functioning learning environment. It adds a data-driven curriculum model, reusable lesson presentation, progressive local progress, lesson notes with automatic saving and search, bookmarks, recent lessons, previous/next navigation, and a dedicated roadmap. Three substantive brokerage-fundamentals seed lessons prove the system end to end; the larger IBKR-specific curriculum remains Phase 3.

Quizzes, IBKR platform simulations, trading simulators, glossary functionality, and live or simulated market feeds remain out of scope.

## Architecture

`data/courses.js` defines the thirteen learner-facing curriculum phases and their lesson membership. `data/lessons.js` contains structured lesson records with objectives and typed educational sections. Presentation modules consume those records without embedding course prose in route logic.

`js/progress.js`, `js/notes.js`, and `js/bookmarks.js` own learning-state transitions and use the existing centralized storage adapter. `js/lessons.js` renders lesson pages and wires controls through callbacks. `js/roadmap.js` derives phase status from progress. `app.js` remains the composition root and selects dashboard, lesson, roadmap, notes, bookmark, or planned renderers by route.

## Lesson model

Each lesson has an immutable ID, route, title, module ID, difficulty, duration, summary, objectives, typed sections, and related lesson IDs. Section types map to reusable visual treatments such as explanation, why it matters, example, common mistake, best practice, warning, and try it yourself. Phase 2 does not include quiz content because quizzes belong to Phase 13 development.

## State and progression

Completed lesson IDs remain the source of truth. Module completion is derived from all lessons assigned to that module and synchronized to the existing `completedModules` field. The next incomplete available lesson becomes the dashboard recommendation. Opening a lesson records it in a five-item recent list. Notes are stored by lesson ID as `{ text, updatedAt }`; empty notes are removed. Bookmarks are a unique list of lesson IDs.

The roadmap exposes four explicit states: completed, current, available, and locked. Phase 1 is initially current. Completing all Phase 1 seed lessons completes the phase and makes Phase 2 available; phases after that remain locked because their lessons are not yet published.

## User experience

Lessons use a focused reading workspace with a compact curriculum rail, objectives, short typed sections, sticky personal tools, and bottom navigation. Completion and bookmark controls communicate their state with text and icons rather than color alone. Notes save after a short debounce and display a visible saved status.

Dedicated roadmap, My Notes, and Bookmarks destinations are added to the Overview navigation group. Notes search is case-insensitive across lesson title and note content. Empty states always provide a route back to an available lesson.

## Error handling and accessibility

Unknown lesson IDs fall through to the existing not-found state. State helpers normalize duplicate IDs and reject unknown lessons. Auto-save failures remain contained by the storage adapter's in-memory fallback and update the global persistence label. Lesson actions are native buttons, note fields have visible labels, status announcements use live regions, and the mobile layout preserves large touch targets.

## Verification

Test-first unit coverage protects course/lesson referential integrity, progression derivation, completion toggling, unique bookmarks, recent-history ordering, note removal and search, and route lookup. Final checks cover the complete test suite, JavaScript syntax, HTTP resource loading, centralized storage access, semantic markup, and Phase 3 scope exclusions.

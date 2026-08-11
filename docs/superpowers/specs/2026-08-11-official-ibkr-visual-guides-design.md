# Official IBKR Visual Guides Design

**Status:** Approved design, pending written-spec review  
**Date:** 2026-08-11  
**Product:** IBKR Platform Mastery

## Problem

The genuine-platform missions are sourced and operationally accurate, but they are text-first. A new learner cannot confidently recognize the real IBKR Desktop or TWS/Mosaic interface from written control names alone. The product needs authentic screenshots placed next to the actions they explain without recreating, impersonating, or obscuring the official applications.

## Outcome

Every IBKR Desktop and TWS/Mosaic mission will show at least one relevant screenshot published by Interactive Brokers in an official guide or product page. Visuals will be embedded beside the mission steps, enlarge in an accessible viewer, identify the product and source date, and link directly to the exact official page. The companion will continue to teach only in genuine Paper Trading applications.

## Source policy

- Accept images only from HTTPS pages and image assets hosted by `interactivebrokers.com`, `www.interactivebrokers.com`, `ibkrguides.com`, or `www.ibkrguides.com`.
- Do not use screenshots from blogs, social media, search-result thumbnails, brokers, affiliates, or other third parties.
- Reference official image assets remotely rather than committing copies to this repository. This preserves provenance and avoids silently presenting vendor material as project-owned content.
- Store the exact guide page, page title, published/updated date when available, and the date the image mapping was reviewed.
- Display “Official IBKR screenshot” and the relevant product name on every visual.
- Do not crop away application identity or context required to recognize the screen. Presentation may scale the image and add separate overlay callouts, but must not alter values or controls inside it.
- If an official source replaces or removes an image, show a visible fallback with a link to the source page. A broken image must never block the textual mission.
- The existing `no-referrer` policy remains in force. The Content Security Policy will allow images only from the listed official hosts in addition to local/data assets.

## Coverage

All 32 real-application missions receive a visual reference. Missions may share an official overview image when they operate within the same official screen, but their caption and callouts must explain the mission-specific region.

Required Desktop screen families:

1. Product/download and application identity
2. Paper-session/login context when officially published
3. Default interface and Left Navigation
4. Portfolio, Positions, Balances, Orders & Trades
5. Watchlists and contract selection
6. Contract Search and Quote
7. Advanced Charts
8. Preferences, columns, and custom views
9. Rapid Order Entry, review/preview, and order monitoring
10. Option Chain and Strategy Builder

Required TWS/Mosaic screen families:

1. Product/login and Mosaic identity
2. Mosaic layout and window grouping
3. Monitor, Portfolio, Quote, Chart, and Activity panels
4. Layout customization
5. Order Entry, preview/margin review, and order monitoring
6. Attached orders
7. Option Chain and Strategy Builder
8. Combination orders and Performance Profile

If no official screenshot exists for a precise state, the mission uses the nearest official parent-screen image and says what cannot be seen in that image. The product must not invent a replacement.

## Data model

Create a dedicated immutable visual catalog rather than embedding unvalidated image markup in mission records. Each record has this shape:

```js
{
  id: "desktop-watchlist-main",
  platformId: "ibkr-desktop",
  missionIds: ["desktop-watchlist", "desktop-contract-search"],
  title: "IBKR Desktop Watchlist",
  alt: "Official IBKR Desktop Watchlist showing the left navigation and instrument rows.",
  imageUrl: "https://www.ibkrguides.com/...",
  sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/watchlists.htm",
  sourceLabel: "IBKR Desktop User Guide — Watchlist",
  sourceUpdated: "2025-10-07",
  reviewedAt: "2026-08-11",
  productVersionNote: "Current guide image at review time",
  callouts: [
    { id: "left-navigation", label: "Watchlists icon", x: 6, y: 28 }
  ]
}
```

Coordinates are percentages relative to the unmodified image and are used only for optional numbered markers. Records are selected by mission ID through pure helper functions. Schema validation rejects unsupported hosts, insecure URLs, missing attribution, invalid dates, missing alt text, out-of-range coordinates, and mission IDs that do not exist.

## Mission presentation

The mission page places a **Recognize the real screen** section immediately before **Perform in the genuine application**.

Each visual card contains:

- product badge and “Official IBKR screenshot” label;
- screenshot with meaningful alternative text;
- numbered callout markers and a matching text legend;
- source title, source-update date, mapping-review date, and version note;
- **Enlarge screenshot** control;
- **Open official guide** link using `target="_blank"` and `rel="noreferrer"`;
- a short note that account permissions, operating system, theme, workspace customization, and later IBKR releases can change what the user sees.

The full-size viewer uses a native `<dialog>` where supported, restores focus to the opener, closes with Escape or an explicit button, and never traps a keyboard user without a close control. The image remains available as a normal official-source link if dialog support or loading fails.

On small screens, the image stays within the content width, the legend stacks below it, and callout targets remain large enough to distinguish. The visual viewer must work in Dark, Light, and System modes without recoloring the official screenshot.

## Image loading and failure behavior

- Use `loading="lazy"` and `decoding="async"` for mission images below the fold.
- Reserve an aspect-ratio box to reduce layout movement.
- While loading, show a neutral skeleton and source label.
- On image error, hide the broken image and markers, then show: “The official screenshot could not be loaded. Open the official guide to view the current image.”
- Text steps, safety gates, evidence controls, and completion remain fully usable during an image failure.
- Do not proxy, scrape at runtime, or cache external images through a service worker.

## Security, privacy, and affiliation

Loading an embedded official image sends a request to the official image host. The page-level no-referrer policy prevents the learning route from being included as a referrer. No cookies, credentials, account data, or IBKR API integration are added.

The existing independent-affiliation notice remains visible. Attribution must not imply that Interactive Brokers endorses IBKR Platform Mastery. Screenshots are reference material; the genuine installed application remains the source of truth for completing a mission.

## Testing and acceptance criteria

Automated checks must prove:

- every one of the 32 platform missions resolves to at least one visual;
- every visual uses an allowed official HTTPS host for both image and source URLs;
- all source labels, source dates, review dates, alternative text, product IDs, and mission IDs are valid;
- every callout coordinate is between 0 and 100 and callout IDs are unique within a visual;
- renderer output includes attribution, dates, alt text, enlarge control, fallback copy, and safe external-link attributes;
- Content Security Policy permits only the approved official image hosts;
- no official image is stored in the repository;
- existing mission evidence and completion behavior remain unchanged.

Manual verification covers representative Desktop and TWS missions at desktop and mobile sizes in Light and Dark modes. It confirms readable captions, accurate image-to-source mapping, usable callouts, keyboard dialog behavior, broken-image fallback, and no horizontal overflow.

## Delivery sequence

1. Inventory official guide images and verify direct asset URLs.
2. Add the validated visual catalog and mission lookup helpers.
3. Add tests for coverage, provenance, dates, and security.
4. Implement the responsive visual cards, callouts, dialog, and failure state.
5. Connect every Desktop mission, then every TWS/Mosaic mission.
6. Update CSP, documentation, source-review policy, and user handoff.
7. Run the complete automated and visual verification suite before merging locally to `master`.

## Out of scope

- Recreating the IBKR application as HTML or an interactive clone
- Screenshots from the user’s live or paper account
- Annotating or persisting account numbers, balances, positions, or orders
- Automatically controlling IBKR Desktop or TWS
- Downloading or redistributing a local archive of official screenshots
- TradingView, Trading 212, or other broker interfaces


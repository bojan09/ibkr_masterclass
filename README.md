# IBKR Platform Mastery

IBKR Platform Mastery is an independent, dependency-free learning companion for the genuine IBKR Desktop and Trader Workstation (TWS/Mosaic) applications. Learners perform version-stamped missions in official paper-trading software, while clearly separate Concept Labs explain brokerage mechanics, orders, options, margin, and risk.

This project is not affiliated with, endorsed by, or connected to Interactive Brokers LLC or its affiliates. It never connects to a brokerage account, requests credentials, places orders, or displays live market data.

> Educational use only. Nothing in this project is personalized investment advice, a recommendation, trading authorization, or a guarantee that an order will execute or a loss will be limited.

## Product capabilities

- Thirteen-phase curriculum roadmap with seven sourced foundation lessons
- Completion tracking, sequential lesson prerequisites, bookmarks, recent lessons, and searchable local notes
- Sourced IBKR Desktop track with 15 real-application missions
- Sourced TWS/Mosaic track with 17 real-application missions
- Embedded official IBKR screenshots with source dates, callouts, enlargement, and guide links
- Ten-task Desktop-versus-TWS equivalence map
- Persistent Dark, Light, and System appearance modes
- Paper-session safety gates and locally stored completion evidence
- Order academy and deterministic ticket simulator for market, limit, stop, stop-limit, and trailing orders
- Options fundamentals with multiplier, intrinsic/time value, breakeven, and expiration P&L calculations
- Filterable simulated options chain with contract details and liquidity evidence
- Black–Scholes learning model for delta, gamma, daily theta, vega per IV point, and rho per rate point
- Editable single- and multi-leg payoff builder with defined-risk vertical calculations
- Guided IBKR options workflow from underlying selection through position management
- Position-sizing and margin-stress labs with current official pricing and margin links
- Paper-practice curriculum, persistent checklist, exercises, and locally stored trading journal
- Topic quizzes, ten-question final scenario exam, practical platform and Concept Lab challenges, and readiness evidence dashboard
- Searchable glossary and reference guides for every navigation destination

All prices, quotes, positions, option chains, fills, and account values in the simulators are fixed educational examples labeled as simulated or hypothetical.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript with native ES modules
- Browser `localStorage`
- SVG for lightweight charts
- Node's built-in test runner for development verification

There is no framework, backend, package dependency, transpiler, bundler, or production build command.

## Architecture

```text
.
├── index.html                 # Semantic static application shell
├── css/
│   ├── variables.css          # Design tokens
│   ├── main.css               # Reset and global behavior
│   ├── layout.css             # Shell and dashboard layout
│   ├── components.css         # Shared interface components
│   ├── lessons.css            # Lessons, roadmap, notes, bookmarks
│   ├── simulator.css          # Interactive labs and reference views
│   └── responsive.css         # Shell breakpoints, print, reduced motion
├── data/
│   ├── courses.js             # Thirteen curriculum phases and lab links
│   ├── lessons.js             # Structured sourced lesson content
│   ├── navigation.js          # Complete sidebar model
│   ├── platforms.js           # Official-product metadata and source dates
│   ├── platform-workflows.js  # Desktop and TWS real-application missions
│   ├── platform-equivalents.js # Cross-platform workflow mapping
│   ├── platform-visuals.js    # Official screenshot provenance and mission mapping
│   ├── route-manifest.js      # Published route-to-experience contract
│   ├── simulated-*.js         # Centralized fake market and option data
│   └── *.js                   # Orders, options, risk, practice, assessments, reference
├── js/
│   ├── app.js                 # Composition and route presentation
│   ├── router.js              # Static-host-safe hash router
│   ├── storage.js             # Sole localStorage boundary and migration layer
│   ├── theme.js               # Dark, Light, and System appearance controller
│   ├── platform-*.js          # Platform hub, missions, and comparison views
│   ├── lessons.js             # Lesson presentation and interactions
│   ├── progress.js            # Completion, unlocking, and history
│   └── *-simulator.js / labs  # Pure calculations plus interactive presenters
├── tests/                     # Data contracts, formulas, state, routes, and regressions
└── docs/superpowers/          # Phase design and implementation records
```

Course content and simulated data are separated from presentation. Calculation functions are exported and tested independently. Direct `localStorage` access is confined to `js/storage.js`, making a future persistence adapter possible without rewriting every feature.

## Local development

The application uses native ES modules and must be served over HTTP. `file://` is intentionally unsupported.

From the project root, use VS Code Live Server or any static server, for example:

```powershell
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Genuine IBKR setup

1. Download the current stable **IBKR Desktop** installer from the [official IBKR Desktop download page](https://www.interactivebrokers.com/en/trading/ibkr-desktop-download.php).
2. Download the current stable **Trader Workstation (TWS)** installer from the [official TWS page](https://www.interactivebrokers.com/en/trading/tws.php).
3. Use only your authorized IBKR credentials and select **Paper Trading/PaperTrader** before practicing an order workflow.
4. Start with **Official IBKR Platforms → IBKR Desktop**, complete its missions in order, then continue with **TWS / Mosaic** and **Desktop vs TWS**.
5. Reconfirm the application name, account mode, contract, and order details whenever a mission asks for those evidence checks. Stop if any of them are uncertain.

The companion stores only learning progress in this browser. Do not paste credentials, account numbers, balances, positions, statements, or brokerage exports into its notes or journal.

## Official screenshot references

Every genuine-platform mission embeds one or more official IBKR screenshots published by Interactive Brokers. Each visual names the product, identifies its exact official guide, shows the guide's update date and this project's review date, and links back to the source. Numbered markers are separate overlays; the underlying screenshot is not recolored or edited.

Screenshots are recognition aids, while the current installed Paper Trading application remains the source of truth. Your interface can differ because of a later IBKR release, operating system, application theme, account permissions, market-data subscriptions, or workspace customization. If a control does not match, stop and open the linked official guide before continuing.

The screenshots remain on official IBKR hosts rather than being copied into this repository. Loading a mission therefore makes an external image request to `ibkrguides.com` or `interactivebrokers.com`. The page uses a `no-referrer` policy, so the current learning route is not sent as the request referrer. If an official image is moved or unavailable, the written mission remains usable and shows a direct source-page fallback.

To maintain the catalog after a major Desktop or TWS release:

1. Review the affected official guide page and its displayed update date.
2. Update the corresponding record in `data/platform-visuals.js`, including its image URL, source date, review date, version note, and callout coordinates.
3. Run `node --test tests/platform-visuals.test.js tests/platform-visual-renderer.test.js`.
4. Inspect the affected mission in desktop/mobile widths and Light/Dark modes before publishing.

## Verification

Node.js is needed only for development tests:

```powershell
npm.cmd test
```

Use `npm test` in shells that do not require the Windows `.cmd` launcher.

The suite covers storage recovery and migration, all navigation destinations, lesson integrity, progression, IBKR source metadata, watchlists, contract search, order outcomes, option math, Black–Scholes benchmarks, chain filters, payoff formulas, combo pricing, risk calculations, journal validation, assessment grading, readiness evidence, and responsive contracts.

For release QA, also parse every JavaScript module, verify every HTML resource, scan for direct storage access outside `storage.js`, serve the project locally, and inspect representative desktop and mobile routes.

## Privacy and security

- Learning state stays in the browser's local storage.
- Journal and notes content is escaped before display.
- External links open with `rel="noreferrer"`.
- No credentials, tokens, private keys, passwords, brokerage exports, or real account identifiers belong in this repository or its journal.
- The application has no IBKR API, authentication, broker login, Supabase, Firebase, or live-market integration.

## Accuracy policy

IBKR interfaces, permissions, margin requirements, rates, commissions, market-data products, and operational rules change. Platform-specific lessons include verification dates and link to official Interactive Brokers documentation. Changeable rates are not copied into calculators as permanent facts.

The options model uses simplified Black–Scholes assumptions for education. Payoff charts generally show expiration outcomes and exclude fees, tax, slippage, early exercise, assignment timing, liquidity, and changing implied volatility unless explicitly stated.

## Static deployment

The project is ready for GitHub and Vercel as a static site:

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Select the **Other** framework preset.
4. Leave the build command empty.
5. Use the repository root as the output directory.
6. Deploy.

Hash routing keeps application routes compatible with static hosting, so no `vercel.json` or rewrite rule is required.

## Git workflow

```powershell
git switch -c feature/short-description
git add .
git commit -m "feat: describe the change"
```

Keep changes testable and never commit secrets, real account data, generated dependency folders, or local deployment state.

## Implementation status

All eight delivery phases in the Platform Mastery redesign are complete: theme infrastructure, genuine-platform reset, sourced mission engine, full Desktop track, full TWS/Mosaic track, cross-platform mapping, evidence-based assessment, and production verification. The learner-facing curriculum remains a separate thirteen-phase educational roadmap.

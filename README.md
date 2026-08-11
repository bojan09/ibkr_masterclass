# IBKR Masterclass

IBKR Masterclass is a dependency-free educational web application for learning brokerage mechanics, Interactive Brokers workflows, IBKR Desktop concepts, order execution, options, margin, and risk. It combines structured lessons with deliberately simulated trading tools so learners must inspect contracts, predict state changes, calculate exposure, and explain outcomes.

The application never connects to a brokerage account, places a real order, or displays live market data.

> Educational use only. Nothing in this project is personalized investment advice, a recommendation, trading authorization, or a guarantee that an order will execute or a loss will be limited.

## Product capabilities

- Thirteen-phase curriculum roadmap with seven sourced foundation lessons
- Completion tracking, sequential lesson prerequisites, bookmarks, recent lessons, and searchable local notes
- Independent IBKR Desktop training workspace with an eight-step tour
- Persistent simulated watchlist, contract search, instrument details, chart context, and portfolio math
- Order academy and deterministic ticket simulator for market, limit, stop, stop-limit, and trailing orders
- Options fundamentals with multiplier, intrinsic/time value, breakeven, and expiration P&L calculations
- Filterable simulated options chain with contract details and liquidity evidence
- Black–Scholes learning model for delta, gamma, daily theta, vega per IV point, and rho per rate point
- Editable single- and multi-leg payoff builder with defined-risk vertical calculations
- Guided IBKR options workflow from underlying selection through position management
- Position-sizing and margin-stress labs with current official pricing and margin links
- Paper-practice curriculum, persistent checklist, exercises, and locally stored trading journal
- Topic quizzes, ten-question final scenario exam, simulator challenges, and readiness evidence dashboard
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
│   ├── route-manifest.js      # Published route-to-experience contract
│   ├── simulated-*.js         # Centralized fake market and option data
│   └── *.js                   # Orders, options, risk, practice, assessments, reference
├── js/
│   ├── app.js                 # Composition and route presentation
│   ├── router.js              # Static-host-safe hash router
│   ├── storage.js             # Sole localStorage boundary and migration layer
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

The fourteen implementation phases are represented in the product: foundation, learning system, IBKR fundamentals, Desktop lab, orders, options fundamentals, chain, Greeks and volatility, strategies, IBKR options workflow, risk, practice, assessment, and production polish. The learner-facing roadmap groups those capabilities into thirteen curriculum phases.

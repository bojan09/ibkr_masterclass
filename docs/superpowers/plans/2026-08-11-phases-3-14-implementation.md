# IBKR Masterclass — Phases 3–14 implementation record

## Scope

This record covers the autonomous continuation authorized after Phase 2. Each phase was implemented and regression-tested before the next phase began.

## Delivered phases

1. **Phase 3 — IBKR fundamentals:** sourced ecosystem, platform comparison, account configuration, and trading-troubleshooting lessons.
2. **Phase 4 — IBKR Desktop:** independent desktop lab, eight-step tour, persistent watchlist, contract search, instrument, chart context, and portfolio.
3. **Phase 5 — Orders:** order academy, ticket simulator, order-state engine, lifecycle, and troubleshooting.
4. **Phase 6 — Options fundamentals:** contract, call/put, multiplier, premium, value, expiration, exercise, and assignment education.
5. **Phase 7 — Options chain:** fixed simulated chain, filters, contract details, volume/open-interest distinctions, and liquidity signals.
6. **Phase 8 — Greeks and volatility:** benchmarked Black–Scholes education model and sensitivity lab.
7. **Phase 9 — Options strategies:** single-leg and multi-leg builder, payoff chart, and defined-risk vertical formulas.
8. **Phase 10 — IBKR options workflow:** underlying-to-management guided workflow and signed combination-order simulation.
9. **Phase 11 — Risk:** margin, buying power, sizing, portfolio, currency, and fee education with current official links.
10. **Phase 12 — Practice:** paper curriculum, exercises, persistent checklist, and local journal.
11. **Phase 13 — Assessment:** topical quizzes, scenario-based final exam, simulator challenges, and readiness evidence.
12. **Phase 14 — Production polish:** route completeness, glossary/reference layer, accessibility and responsive contracts, documentation, static deployment review, and final QA.

## Core boundaries

- No broker connection, real trading, authentication, live data, or frontend secret handling.
- Simulated values are centralized and visibly labeled.
- All local persistence goes through `js/storage.js`.
- Changeable IBKR facts use official sources and verification dates.
- Model outputs and expiration payoff calculations identify their assumptions and exclusions.

## Primary official references reviewed

- IBKR Desktop user guide and product pages
- IBKR Desktop Watchlist and Contract Search guides
- IBKR Desktop Option Chain and Strategy Builder guides
- Client Portal account settings, permissions, paper trading, and margin report guides
- Interactive Brokers margin requirements, financing, and commissions pages

## Deferred external actions

Publishing a GitHub repository and creating a production Vercel project require the user's external accounts and destination choices. The static project itself has no build step or rewrite requirement and is prepared for that handoff.

export const NAVIGATION_GROUPS = [
  {
    label: "Overview",
    shortLabel: "Home",
    items: [
      { label: "Dashboard", route: "dashboard", marker: "DB" },
      { label: "Learning roadmap", route: "roadmap" },
      { label: "My notes", route: "my-notes" },
      { label: "Bookmarks", route: "bookmarks" },
    ],
  },
  {
    label: "Official IBKR platforms",
    shortLabel: "Platforms",
    items: [
      { label: "Platform tracks", route: "platforms", marker: "IB" },
      { label: "IBKR Desktop", route: "platforms/desktop" },
      { label: "TWS / Mosaic", route: "platforms/tws" },
      { label: "Desktop vs TWS", route: "platforms/compare" },
      { label: "Paper-trading safety", route: "platforms/safety" },
    ],
  },
  {
    label: "Start here",
    shortLabel: "Start",
    items: [
      { label: "IBKR overview", route: "start-here/ibkr-overview" },
      { label: "Brokerage basics", route: "start-here/brokerage-basics" },
      { label: "Account setup", route: "start-here/account-setup" },
      { label: "Platform ecosystem", route: "start-here/platform-ecosystem" },
      { label: "IBKR Desktop tour", route: "start-here/desktop-tour" },
    ],
  },
  {
    label: "IBKR Desktop",
    shortLabel: "Desktop",
    items: [
      { label: "Navigation", route: "ibkr-desktop/navigation" },
      { label: "Watchlists", route: "ibkr-desktop/watchlists" },
      { label: "Search", route: "ibkr-desktop/search" },
      { label: "Instrument pages", route: "ibkr-desktop/instrument-pages" },
      { label: "Charts", route: "ibkr-desktop/charts" },
      { label: "Portfolio", route: "ibkr-desktop/portfolio" },
      { label: "Order ticket", route: "ibkr-desktop/order-ticket" },
      { label: "Orders", route: "ibkr-desktop/orders" },
      { label: "Trades", route: "ibkr-desktop/trades" },
      { label: "Market data", route: "ibkr-desktop/market-data" },
      { label: "News & research", route: "ibkr-desktop/news-research" },
      { label: "Alerts", route: "ibkr-desktop/alerts" },
      { label: "Account information", route: "ibkr-desktop/account-information" },
      { label: "Desktop best practices", route: "ibkr-desktop/best-practices" },
    ],
  },
  {
    label: "Trading basics",
    shortLabel: "Trading",
    items: [
      { label: "Stocks", route: "trading-basics/stocks" },
      { label: "ETFs", route: "trading-basics/etfs" },
      { label: "Market structure", route: "trading-basics/market-structure" },
      { label: "Bid / Ask", route: "trading-basics/bid-ask" },
      { label: "Spread", route: "trading-basics/spread" },
      { label: "Liquidity", route: "trading-basics/liquidity" },
      { label: "Order types", route: "trading-basics/order-types" },
      { label: "Time in force", route: "trading-basics/time-in-force" },
      { label: "Trading sessions", route: "trading-basics/trading-sessions" },
      { label: "Extended hours", route: "trading-basics/extended-hours" },
      { label: "Execution", route: "trading-basics/execution" },
    ],
  },
  {
    label: "Options",
    shortLabel: "Options",
    items: [
      { label: "Options fundamentals", route: "options/fundamentals" },
      { label: "Calls & puts", route: "options/calls-puts" },
      { label: "Option contracts", route: "options/contracts" },
      { label: "Option chain", route: "options/chain" },
      { label: "Strike prices", route: "options/strike-prices" },
      { label: "Expiration", route: "options/expiration" },
      { label: "Premium", route: "options/premium" },
      { label: "Intrinsic / extrinsic value", route: "options/intrinsic-extrinsic" },
      { label: "Greeks", route: "options/greeks" },
      { label: "Implied volatility", route: "options/implied-volatility" },
      { label: "Volume", route: "options/volume" },
      { label: "Open interest", route: "options/open-interest" },
      { label: "Exercise", route: "options/exercise" },
      { label: "Assignment", route: "options/assignment" },
      { label: "Multi-leg orders", route: "options/multi-leg-orders" },
      { label: "Options strategies", route: "options/strategies" },
      { label: "Options risk", route: "options/risk" },
      { label: "Options on IBKR Desktop", route: "options/ibkr-desktop" },
    ],
  },
  {
    label: "Account & risk",
    shortLabel: "Risk",
    items: [
      { label: "Cash vs margin", route: "account-risk/cash-vs-margin" },
      { label: "Buying power", route: "account-risk/buying-power" },
      { label: "Margin", route: "account-risk/margin" },
      { label: "Portfolio risk", route: "account-risk/portfolio-risk" },
      { label: "Position sizing", route: "account-risk/position-sizing" },
      { label: "Commissions", route: "account-risk/commissions" },
      { label: "Market data fees", route: "account-risk/market-data-fees" },
      { label: "Currency", route: "account-risk/currency" },
      { label: "Statements", route: "account-risk/statements" },
    ],
  },
  {
    label: "Practice",
    shortLabel: "Practice",
    items: [
      { label: "Platform mission companion", route: "practice/desktop-simulator" },
      { label: "Order simulator", route: "practice/order-simulator" },
      { label: "Options chain simulator", route: "practice/options-chain" },
      { label: "Payoff simulator", route: "practice/payoff-simulator" },
      { label: "Greeks simulator", route: "practice/greeks-simulator" },
      { label: "Paper trading", route: "practice/paper-trading" },
      { label: "Trade checklist", route: "practice/trade-checklist" },
      { label: "Trading journal", route: "practice/trading-journal" },
      { label: "Quizzes", route: "practice/quizzes" },
    ],
  },
  {
    label: "Reference",
    shortLabel: "Reference",
    items: [
      { label: "Glossary", route: "reference/glossary" },
      { label: "Quick reference", route: "reference/quick-reference" },
      { label: "Beginner mistakes", route: "reference/beginner-mistakes" },
      { label: "IBKR troubleshooting", route: "reference/troubleshooting" },
      { label: "Best practices", route: "reference/best-practices" },
    ],
  },
];

export function getKnownRoutes() {
  return new Set(NAVIGATION_GROUPS.flatMap((group) => group.items.map((item) => item.route)));
}

export function findNavigationItem(route) {
  return NAVIGATION_GROUPS.flatMap((group) => group.items).find((item) => item.route === route);
}

import { REFERENCE_TOPICS } from "./reference.js";

export const DESKTOP_MODES = {
  "start-here/desktop-tour": "tour", "practice/desktop-simulator": "workspace", "ibkr-desktop/navigation": "tour", "ibkr-desktop/watchlists": "watchlist", "ibkr-desktop/search": "search", "ibkr-desktop/instrument-pages": "instrument", "ibkr-desktop/charts": "instrument", "ibkr-desktop/portfolio": "portfolio",
};
export const ORDER_VIEWS = {
  "ibkr-desktop/order-ticket": "simulator", "ibkr-desktop/orders": "execution", "ibkr-desktop/trades": "execution", "trading-basics/order-types": "academy", "trading-basics/time-in-force": "academy", "trading-basics/execution": "execution", "practice/order-simulator": "simulator",
};
export const OPTION_FUNDAMENTAL_TOPICS = {
  "options/fundamentals": "contract", "options/calls-puts": "calls-puts", "options/contracts": "contract", "options/strike-prices": "strike", "options/expiration": "expiration", "options/premium": "premium", "options/intrinsic-extrinsic": "value", "options/exercise": "exercise-assignment", "options/assignment": "exercise-assignment",
};
export const OPTION_CHAIN_ROUTES = new Set(["options/chain", "options/volume", "options/open-interest", "practice/options-chain"]);
export const GREEKS_ROUTES = new Set(["options/greeks", "options/implied-volatility", "practice/greeks-simulator"]);
export const PAYOFF_ROUTES = new Set(["options/multi-leg-orders", "options/strategies", "practice/payoff-simulator"]);
export const PRACTICE_VIEWS = { "practice/paper-trading": "paper", "practice/trade-checklist": "checklist", "practice/trading-journal": "journal" };

const FOUNDATION_ROUTES = new Set(["dashboard", "roadmap", "my-notes", "bookmarks"]);
export function isStandaloneExperienceRoute(route) {
  return FOUNDATION_ROUTES.has(route) || route in DESKTOP_MODES || route in ORDER_VIEWS || route in OPTION_FUNDAMENTAL_TOPICS || OPTION_CHAIN_ROUTES.has(route) || GREEKS_ROUTES.has(route) || PAYOFF_ROUTES.has(route) || route === "options/ibkr-desktop" || route === "options/risk" || route.startsWith("account-risk/") || route in PRACTICE_VIEWS || route === "practice/quizzes" || route === "reference/glossary" || route in REFERENCE_TOPICS;
}

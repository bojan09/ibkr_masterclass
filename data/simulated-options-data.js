export const OPTION_UNDERLYING = { symbol: "AAPL", price: 227.16, asOf: "2026-08-11T14:30:00Z", simulated: true };
export const OPTION_EXPIRATIONS = ["2026-09-18", "2026-10-16"];

const strikes = [210, 215, 220, 225, 230, 235, 240];

function quoteFor(strike, right, expirationIndex) {
  const intrinsic = right === "call" ? Math.max(0, OPTION_UNDERLYING.price - strike) : Math.max(0, strike - OPTION_UNDERLYING.price);
  const distance = Math.abs(strike - OPTION_UNDERLYING.price);
  const timeValue = Math.max(0.65, 7.8 - distance * 0.22 + expirationIndex * 1.65);
  const mid = Math.round((intrinsic + timeValue) * 100) / 100;
  const width = distance > 12 ? 0.36 : distance > 6 ? 0.22 : 0.12;
  return { bid: Math.max(0.01, Math.round((mid - width / 2) * 100) / 100), ask: Math.round((mid + width / 2) * 100) / 100, last: Math.round((mid - 0.03) * 100) / 100 };
}

export const OPTION_CHAIN = OPTION_EXPIRATIONS.flatMap((expiration, expirationIndex) =>
  strikes.flatMap((strike, strikeIndex) => ["call", "put"].map((right) => {
    const quote = quoteFor(strike, right, expirationIndex);
    const distanceRank = Math.abs(strike - 225) / 5;
    return {
      id: `AAPL-${expiration}-${strike}-${right[0].toUpperCase()}`,
      symbol: "AAPL",
      expiration,
      strike,
      right,
      multiplier: 100,
      currency: "USD",
      exchange: "SMART",
      ...quote,
      volume: Math.max(3, Math.round(1480 - distanceRank * 245 - expirationIndex * 170 + (right === "call" ? 80 : 0))),
      openInterest: Math.max(18, Math.round(7200 - distanceRank * 970 - expirationIndex * 680 + strikeIndex * 31)),
      impliedVolatility: Math.round((0.27 + distanceRank * 0.009 + expirationIndex * 0.012) * 1000) / 1000,
      delta: Math.round((right === "call" ? Math.max(0.08, Math.min(0.92, 0.53 - (strike - 225) * 0.035)) : -Math.max(0.08, Math.min(0.92, 0.47 + (strike - 225) * 0.035))) * 100) / 100,
      simulated: true,
    };
  })),
);

export const OPTION_CHAIN_COLUMNS = [
  { id: "bid", label: "Bid", explanation: "Highest displayed simulated buyer price; size and execution priority are not represented here." },
  { id: "ask", label: "Ask", explanation: "Lowest displayed simulated seller price; it is not a guaranteed fill for any quantity." },
  { id: "last", label: "Last", explanation: "Most recent simulated trade price, which may be stale or outside the current bid and ask." },
  { id: "volume", label: "Volume", explanation: "Simulated contracts traded in the current session; it is activity, not available liquidity." },
  { id: "openInterest", label: "Open interest", explanation: "Simulated outstanding contracts from the prior reporting cycle, not today’s trade count." },
  { id: "impliedVolatility", label: "IV", explanation: "Model-implied volatility derived from price assumptions; it is not a directional forecast." },
  { id: "delta", label: "Delta", explanation: "A model sensitivity estimate for a small underlying move, not a fixed probability or hedge." },
];

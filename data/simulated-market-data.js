export const SIMULATION_AS_OF = "2026-08-11T14:30:00Z";

export const SIMULATED_QUOTES = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", assetClass: "ETF", exchange: "ARCA", currency: "USD", last: 552.84, bid: 552.81, ask: 552.86, change: 1.42, volume: 48312000, low: 548.91, high: 553.12, simulated: true },
  { symbol: "QQQ", name: "Invesco QQQ Trust", assetClass: "ETF", exchange: "NASDAQ", currency: "USD", last: 473.22, bid: 473.18, ask: 473.26, change: -0.88, volume: 31240500, low: 471.04, high: 475.63, simulated: true },
  { symbol: "AAPL", name: "Apple Inc.", assetClass: "Stock", exchange: "NASDAQ", currency: "USD", last: 227.16, bid: 227.12, ask: 227.19, change: 2.31, volume: 52510900, low: 223.44, high: 228.08, simulated: true },
  { symbol: "MSFT", name: "Microsoft Corporation", assetClass: "Stock", exchange: "NASDAQ", currency: "USD", last: 421.77, bid: 421.68, ask: 421.84, change: 0.54, volume: 19450200, low: 417.91, high: 423.02, simulated: true },
  { symbol: "NVDA", name: "NVIDIA Corporation", assetClass: "Stock", exchange: "NASDAQ", currency: "USD", last: 128.64, bid: 128.60, ask: 128.68, change: -1.12, volume: 284710000, low: 126.83, high: 131.06, simulated: true },
  { symbol: "AMD", name: "Advanced Micro Devices", assetClass: "Stock", exchange: "NASDAQ", currency: "USD", last: 154.08, bid: 154.01, ask: 154.13, change: 1.73, volume: 42660400, low: 150.29, high: 155.47, simulated: true },
  { symbol: "META", name: "Meta Platforms", assetClass: "Stock", exchange: "NASDAQ", currency: "USD", last: 518.34, bid: 518.21, ask: 518.47, change: -2.06, volume: 13680100, low: 515.02, high: 523.40, simulated: true },
];

export const MARKET_COLUMNS = [
  { id: "last", label: "Last", explanation: "The price of the most recently reported trade; it is not a guaranteed execution price." },
  { id: "bid", label: "Bid", explanation: "The highest displayed price a buyer is currently offering for the instrument." },
  { id: "ask", label: "Ask", explanation: "The lowest displayed price a seller is currently asking for the instrument." },
  { id: "change", label: "Change", explanation: "The simulated price difference from the prior regular-session close." },
  { id: "changePercent", label: "Change %", explanation: "The simulated change divided by the prior close, expressed as a percentage." },
  { id: "volume", label: "Volume", explanation: "The number of units reported traded during the simulated session, not available liquidity." },
  { id: "range", label: "Daily range", explanation: "The simulated low-to-high span reported so far in the current trading session." },
];

export const CONTRACTS = [
  { id: "AAPL-STK-US", symbol: "AAPL", description: "Apple Inc. — US Stock", assetClass: "Stock", exchange: "NASDAQ", currency: "USD", multiplier: 1 },
  { id: "AAPL-OPT-20260918-230-C", symbol: "AAPL", description: "AAPL 18 Sep 2026 230 Call", assetClass: "Option", exchange: "SMART", currency: "USD", expiration: "2026-09-18", strike: 230, right: "Call", multiplier: 100 },
  { id: "AAPL-CFD", symbol: "AAPL", description: "Apple Inc. — CFD", assetClass: "CFD", exchange: "IBCFD", currency: "USD", multiplier: 1 },
  { id: "APC-STK-DE", symbol: "AAPL", description: "Apple Inc. — European Listing", assetClass: "Stock", exchange: "IBIS", currency: "EUR", multiplier: 1 },
  { id: "SPY-STK-US", symbol: "SPY", description: "SPDR S&P 500 ETF Trust", assetClass: "ETF", exchange: "ARCA", currency: "USD", multiplier: 1 },
];

export const CONTRACT_CHECKLIST = ["Correct symbol", "Correct instrument", "Correct exchange", "Correct currency", "Correct expiration", "Correct strike", "Correct option type", "Correct multiplier"];

export const PORTFOLIO_POSITIONS = [
  { symbol: "SPY", quantity: 8, averageCost: 536.20 },
  { symbol: "AAPL", quantity: 12, averageCost: 219.40 },
  { symbol: "NVDA", quantity: -5, averageCost: 132.10 },
];

export const DESKTOP_TOUR_STEPS = [
  { id: "search", label: "Search", what: "A contract search entry point for symbols, companies, and product filters.", why: "Search is where contract identity begins; similar labels can represent materially different products.", mistake: "Selecting the first familiar ticker without verifying the asset class, venue, and currency.", bestPractice: "Open the result details and complete the contract verification checklist." },
  { id: "watchlist", label: "Watchlist", what: "A compact monitor for selected instruments and quote fields.", why: "A watchlist keeps a deliberate set of contracts visible without implying that they should be traded.", mistake: "Treating Last as the price guaranteed for the next order.", bestPractice: "Keep Bid and Ask visible and use only columns you can explain." },
  { id: "chart", label: "Chart", what: "A visual history of simulated prices and volume over a selected interval.", why: "Charts help inspect displayed history and context, but do not predict the next price.", mistake: "Ignoring timeframe or extended-hours settings when interpreting a bar.", bestPractice: "Confirm instrument, timeframe, session, and price scale before reading patterns." },
  { id: "instrument", label: "Instrument details", what: "The selected contract’s quote, identity, session range, and available tools.", why: "It is the last identity checkpoint before opening a trade workflow.", mistake: "Assuming a company name uniquely identifies a tradeable contract.", bestPractice: "Verify symbol, asset class, venue, currency, and contract-specific fields." },
  { id: "order-ticket", label: "Order ticket", what: "A workspace for expressing side, quantity, order type, limit, and duration.", why: "Each field changes what the broker is instructed to do and the risk accepted.", mistake: "Submitting before reviewing estimated exposure and order behavior.", bestPractice: "Preview the complete instruction and read warnings before any simulated submit." },
  { id: "portfolio", label: "Portfolio", what: "A view of positions, quantities, average costs, values, and unrealized P&L.", why: "It connects an execution to ongoing exposure rather than treating a fill as the end.", mistake: "Confusing unrealized P&L with cash or assuming average cost predicts risk.", bestPractice: "Review quantity sign, market value, currency, and concentration together." },
  { id: "orders", label: "Orders", what: "A status view for working, filled, canceled, and rejected instructions.", why: "An accepted order is not necessarily filled, and an open order can still create future exposure.", mistake: "Resubmitting because a fill is not immediate without checking the existing order.", bestPractice: "Verify status, filled quantity, remaining quantity, and messages first." },
  { id: "option-chain", label: "Option chain", what: "A contract matrix organized by expiration, strike, call, and put.", why: "It exposes many related but distinct contracts that must be verified individually.", mistake: "Choosing on premium alone while overlooking expiration, multiplier, and liquidity.", bestPractice: "Check expiration, strike, right, bid/ask, multiplier, and position impact." },
];

export function getSimulatedQuote(symbol) {
  return SIMULATED_QUOTES.find((quote) => quote.symbol === String(symbol).toUpperCase());
}

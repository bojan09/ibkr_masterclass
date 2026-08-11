export const ORDER_TYPES = [
  { id: "market", label: "Market", behavior: "Seeks an immediate execution at available prices without setting a maximum buy or minimum sell price.", use: "When execution urgency is more important than exact price and available liquidity has been assessed.", risk: "The fill may differ materially from Last or the displayed quote, especially in fast or thin markets.", mistake: "Reading Last as a promise and assuming a market order guarantees both execution and price." },
  { id: "limit", label: "Limit", behavior: "Sets the highest acceptable buy price or the lowest acceptable sell price.", use: "When price control matters and the learner accepts that the order may wait or never fill.", risk: "A limit controls price, not execution; a touched price may still have insufficient priority or liquidity.", mistake: "Placing a non-marketable limit and then assuming the platform is broken because it remains working." },
  { id: "stop", label: "Stop", behavior: "After the stop condition is reached, the instruction becomes a market-style order in this simulation.", use: "To demonstrate a conditional trigger when execution after activation matters more than exact fill price.", risk: "Triggering does not cap the eventual fill; gaps can create significant slippage.", mistake: "Treating the stop price as a guaranteed execution price." },
  { id: "stop-limit", label: "Stop limit", behavior: "After the stop is reached, the order becomes a limit order at the stated limit price.", use: "To demonstrate both a trigger condition and a post-trigger price boundary.", risk: "The price can move through the limit and leave the triggered order unfilled.", mistake: "Focusing on price control while overlooking non-execution risk." },
  { id: "trailing", label: "Trailing stop", behavior: "The trigger follows favorable movement by a stated amount and does not reverse when price moves unfavorably.", use: "To study a moving conditional trigger and the distinction between trail amount and fill price.", risk: "Normal volatility can trigger the order, after which market-order slippage remains possible.", mistake: "Choosing a trail mechanically without relating it to price scale and volatility." },
];

export const TIME_IN_FORCE = [
  { id: "DAY", label: "Day", explanation: "Active for the eligible trading day or session defined by the order settings." },
  { id: "GTC", label: "Good-til-canceled", explanation: "Remains eligible across sessions until canceled or until the broker’s applicable expiration rules." },
  { id: "IOC", label: "Immediate-or-cancel", explanation: "Attempts to execute immediately; any unfilled portion is canceled rather than left working." },
];

export const ORDER_LIFECYCLE = [
  { id: "draft", label: "Draft", explanation: "The ticket exists only in the simulator and has not been submitted." },
  { id: "submitted", label: "Submitted", explanation: "The instruction has left the ticket and is being evaluated." },
  { id: "working", label: "Working", explanation: "The valid unfilled instruction remains eligible under its conditions." },
  { id: "partial", label: "Partially filled", explanation: "Some quantity executed while a remainder is still open or canceled." },
  { id: "filled", label: "Filled", explanation: "The reported quantity executed; review the execution price and resulting position." },
  { id: "canceled", label: "Canceled", explanation: "The remaining instruction is no longer working; prior fills are not reversed." },
  { id: "rejected", label: "Rejected", explanation: "The instruction did not become an eligible working order; inspect the exact message." },
];

export const TROUBLESHOOTING_STEPS = [
  "Capture the exact status and message before changing the ticket.",
  "Verify symbol, asset class, exchange, currency, and contract details.",
  "Check side, quantity, order type, price fields, and time in force.",
  "Distinguish a valid working order from a rejected or canceled order.",
  "Review product permission, account resources, session, and regional eligibility.",
  "Check whether another open order already creates the intended exposure.",
  "Change only the factor supported by evidence; do not increase risk to test the interface.",
];

export const ORDER_SCENARIOS = [
  { id: "market-cross", title: "Crossing the spread", order: { symbol: "AAPL", side: "BUY", quantity: 10, type: "market", timeInForce: "DAY" }, lesson: "A market buy references available asks, not the historical Last value." },
  { id: "limit-wait", title: "Limit waits below the ask", order: { symbol: "AAPL", side: "BUY", quantity: 10, type: "limit", limitPrice: 225, timeInForce: "DAY" }, lesson: "Price control can mean no execution while the market remains above the limit." },
  { id: "stop-gap", title: "Stop is a trigger, not a guarantee", order: { symbol: "AAPL", side: "SELL", quantity: 10, type: "stop", stopPrice: 225, timeInForce: "DAY" }, lesson: "After activation, an execution can occur away from the trigger in a moving market." },
];

const q = (id, prompt, choices, correctIndex, explanation, scenario = false) => ({ id, prompt, choices, correctIndex, explanation, scenario });

export const ASSESSMENT_QUIZZES = [
  { id: "platform-check", title: "Platform & contract identity", domain: "IBKR Desktop", questions: [
    q("p1", "Where should an account-level trading permission normally be investigated?", ["Only by changing charts", "Account settings / Client Portal documentation", "By increasing order size"], 1, "Trading permissions are account-level controls; changing a chart or order size does not create eligibility."),
    q("p2", "AAPL search returns a stock, option, CFD, and European listing. What comes first?", ["Choose the cheapest result", "Verify asset class, venue, currency, and contract fields", "Choose the first ticker match"], 1, "A familiar symbol does not uniquely identify the intended contract; full identity must be verified.", true),
    q("p3", "What does a watchlist Last field guarantee?", ["The next fill price", "Nothing about the next execution", "A live entitlement"], 1, "Last is a historical reported trade and does not guarantee execution price, availability, or live data status."),
    q("p4", "Which label must appear on this project’s market examples?", ["Guaranteed", "Simulated data", "Real-time"], 1, "The application uses fixed educational values and must distinguish them clearly from real market data."),
  ]},
  { id: "orders-check", title: "Orders & execution", domain: "Execution", questions: [
    q("o1", "A buy limit is below the current ask. What is the honest expectation?", ["It must fill", "It may work without filling", "It becomes a market order"], 1, "A non-marketable limit preserves its price boundary but can remain working or never execute."),
    q("o2", "A sell stop triggers during a gap. Which price is guaranteed?", ["The stop price", "The previous Last", "No exact fill price"], 2, "A stop is a trigger; after activation a market-style instruction can fill away from the trigger."),
    q("o3", "An order is Submitted. What should the learner infer?", ["The position exists", "The order entered processing, not necessarily filled", "Settlement completed"], 1, "Submitted, working, partially filled, filled, and settled are distinct states."),
    q("o4", "A fill is delayed. What is the safest first action?", ["Resubmit immediately", "Increase quantity", "Inspect status, remaining quantity, and messages"], 2, "Evidence from the existing order prevents duplicate exposure and narrows the cause of non-execution.", true),
  ]},
  { id: "options-check", title: "Options contracts & chains", domain: "Options", questions: [
    q("x1", "A standard equity option quote is 3.25 with multiplier 100. What is one-contract premium before fees?", ["3.25", "32.50", "325"], 2, "Premium is commonly quoted per underlying unit; multiplying 3.25 by 100 gives 325."),
    q("x2", "A call is in the money at expiration but its intrinsic value is below premium paid. The long call is:", ["Necessarily profitable", "At a loss before fees", "Automatically assigned short"], 1, "Moneyness compares stock with strike; profitability also subtracts the premium paid."),
    q("x3", "Which field counts outstanding contracts from a reporting cycle?", ["Volume", "Open interest", "Last"], 1, "Open interest tracks outstanding contracts and differs from current-session trading volume."),
    q("x4", "What does delta guarantee?", ["Probability of profit", "Exact large-move P&L", "Neither; it is a local model sensitivity"], 2, "Delta is a local estimate under assumptions and changes as price, time, and volatility change."),
    q("x5", "A bull call spread debit is 2.50 and width is 5.00. Standard multiplier, one spread. Maximum modeled loss is:", ["250", "500", "750"], 0, "A debit spread’s modeled maximum loss is the 2.50 net debit multiplied by 100.", true),
  ]},
  { id: "risk-check", title: "Margin & risk", domain: "Risk", questions: [
    q("r1", "Buying power should be treated as:", ["A target", "A changing account constraint", "Guaranteed safe exposure"], 1, "Buying power can change with prices, requirements, concentration, and portfolio composition."),
    q("r2", "A stop is five points away and 100 shares are held. What loss does the simple model budget before slippage?", ["5", "100", "500"], 2, "Modeled price risk is 5 per share times 100 shares, while actual loss can be larger."),
    q("r3", "A portfolio has equal long and short dollar values. What is eliminated?", ["All risk", "Only net dollar exposure may be near zero", "Gross exposure"], 1, "Factor, basis, volatility, liquidity, gap, and gross exposure can remain despite low net dollars."),
    q("r4", "Excess liquidity is shrinking. What is appropriate?", ["Increase to maximum size", "Review current requirements and stress exposure", "Assume a personal stop prevents liquidation"], 1, "A declining cushion calls for current margin evidence and stress review, not more leverage.", true),
  ]},
  { id: "final-exam", title: "Final scenario exam", domain: "Integrated", questions: [
    q("f1", "A quote says Delayed. The first conclusion is:", ["Trading is impossible", "Quote entitlement and trading permission must be checked separately", "The contract is wrong"], 1, "Market-data status and trading permission are separate controls and require separate verification.", true),
    q("f2", "A contract’s bid is 2.00 and ask is 2.40. Which figure shows immediate displayed friction?", ["0.40 spread", "2.20 midpoint guarantees a fill", "Last, regardless of age"], 0, "The 0.40 spread is visible friction; midpoint is a reference and does not guarantee execution."),
    q("f3", "Clicking an option Ask in the documented Desktop chain concept normally begins which side?", ["Buy", "Sell", "Exercise"], 0, "Official IBKR Desktop education describes selecting Ask to populate a buy and Bid to populate a sell."),
    q("f4", "A two-leg ticket shows a positive signed net price in this lab. It represents:", ["Debit", "Credit", "Margin requirement"], 0, "The lab labels positive signed combination prices as debits and negative values as credits."),
    q("f5", "A short option is assigned. What matters next?", ["Only original premium", "Resulting underlying obligation and account resources", "The watchlist order"], 1, "Assignment can create a much larger stock or cash obligation that must be reconciled to the account."),
    q("f6", "A paper exercise made profit. What does that prove?", ["Future profitability", "The workflow was correct", "Neither; process evidence must be reviewed separately"], 2, "Paper P&L neither predicts live results nor proves contract, order, and risk decisions were correct."),
    q("f7", "Which action can preserve time value compared with exercise?", ["Selling to close, if an executable market exists", "Ignoring the position", "Increasing multiplier"], 0, "Selling the option can realize both intrinsic and remaining time value, subject to liquidity and execution."),
    q("f8", "A margin report and trading screen differ in timing. What should be done?", ["Use the larger number", "Verify timestamps and current official account information", "Average them"], 1, "Account values can use different cutoffs; timestamps and definitions must be reconciled before use."),
    q("f9", "An order partially fills. Canceling the remainder does what?", ["Reverses prior fills", "Stops only the remaining working quantity", "Closes the position"], 1, "Canceling an unfilled remainder does not undo executions that already created a position."),
    q("f10", "A readiness score of 100 means:", ["Authorized and safe to trade", "Strong evidence within this curriculum only", "Guaranteed returns"], 1, "Assessment evidence describes this curriculum’s tasks and never authorizes trading or removes financial risk."),
  ]},
];

export const SIMULATOR_CHALLENGES = [
  { id: "desktop", title: "Desktop verification run", route: "practice/desktop-simulator", goal: "Find, verify, watch, and inspect one simulated instrument without opening a real connection." },
  { id: "order", title: "Order-state prediction", route: "practice/order-simulator", goal: "Predict fill versus working state for three order types, then explain every result." },
  { id: "chain", title: "Chain liquidity comparison", route: "practice/options-chain", goal: "Compare two strikes using bid/ask, volume, open interest, identity, and quote limitations." },
  { id: "payoff", title: "Multi-leg risk reconstruction", route: "practice/payoff-simulator", goal: "Build a vertical, calculate its boundaries, then reverse one leg and identify the new risk." },
  { id: "greeks", title: "Sensitivity shock", route: "practice/greeks-simulator", goal: "Change one model input at a time and explain why the Greeks themselves move." },
];

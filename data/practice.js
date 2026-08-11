export const PAPER_CURRICULUM = [
  { id: "separate", title: "Separate paper from live", lesson: "Confirm the account mode, banner, account identifier, and absence of production intent before every exercise.", evidence: "Write down how the platform labels paper mode and where the account mode is visible." },
  { id: "observe", title: "Observe before submitting", lesson: "Record contract identity, quote status, bid, ask, spread, session, and intended order behavior before opening a ticket.", evidence: "Capture the variables without treating the simulated quote as market truth." },
  { id: "predict", title: "Predict the order state", lesson: "State whether the simulated instruction should fill, wait, trigger, cancel, or reject before previewing it.", evidence: "Compare the prediction with the execution report and explain any mismatch." },
  { id: "reconcile", title: "Reconcile order to position", lesson: "After a fill, verify filled quantity, average price, remaining order, cash effect, and resulting position.", evidence: "Trace the same contract through ticket, order, execution, and portfolio views." },
  { id: "debrief", title: "Debrief process, not profit", lesson: "Evaluate contract verification, risk framing, order construction, monitoring, and management instead of judging only P&L.", evidence: "Name one process success, one error, and one change for the next exercise." },
];

export const PRACTICE_EXERCISES = [
  { id: "contract-check", title: "Reject the wrong AAPL contract", difficulty: "Beginner", task: "Use contract search to distinguish the US stock, option, CFD, and European listing, then document why only one matches the prompt.", successCriteria: ["Names asset class, venue, and currency", "Completes all relevant contract checks"], debrief: ["Which label was easiest to overlook?", "What evidence ruled out each alternative?"] },
  { id: "limit-wait", title: "Make a limit order wait", difficulty: "Beginner", task: "Construct a simulated buy limit below the ask, predict the state, preview it, and explain why non-execution is valid behavior.", successCriteria: ["Predicts working state before preview", "Explains price control versus execution certainty"], debrief: ["What would make the order marketable?", "Why is repeated resubmission risky?"] },
  { id: "combo-sign", title: "Verify a spread’s net sign", difficulty: "Intermediate", task: "Build a bull call spread and verify every leg, ratio, multiplier, net debit, maximum modeled loss, and expiration breakeven.", successCriteria: ["All legs and sides are correct", "Debit and multiplier-adjusted risk are explained"], debrief: ["What would reversing one side create?", "What can happen near expiration?"] },
  { id: "margin-stress", title: "Stress the margin cushion", difficulty: "Intermediate", task: "Enter hypothetical net liquidation and maintenance margin, then explain the effect of lower equity and higher requirements.", successCriteria: ["Calculates excess liquidity and utilization", "Does not treat buying power as a target"], debrief: ["Which assumption changed the cushion most?", "Why might a personal stop not prevent liquidation?"] },
  { id: "full-workflow", title: "Complete the full paper workflow", difficulty: "Capstone", task: "Move from contract search to a simulated order, execution review, position check, management decision, and journal entry.", successCriteria: ["Uses the full checklist", "Records evidence at every state transition", "Completes a process-focused journal review"], debrief: ["Where did uncertainty remain?", "What must be verified in the real platform guide?"] },
];

export const TRADE_CHECKLIST = [
  { id: "check-mode", group: "Environment", label: "Paper/simulated mode is visibly confirmed" },
  { id: "check-contract", group: "Contract", label: "Symbol, asset class, venue, currency, and contract details are verified" },
  { id: "check-data", group: "Data", label: "Live, delayed, frozen, snapshot, or simulated quote status is understood" },
  { id: "check-thesis", group: "Decision", label: "The educational thesis, invalidation, and time horizon are written" },
  { id: "check-size", group: "Risk", label: "Quantity, multiplier, maximum modeled loss, and portfolio impact are reviewed" },
  { id: "check-order", group: "Order", label: "Side, order type, price fields, time in force, and session are verified" },
  { id: "check-existing", group: "Order", label: "Existing positions and open orders are checked for duplicate exposure" },
  { id: "check-preview", group: "Preview", label: "The complete preview and every warning are read before simulation" },
  { id: "check-monitor", group: "Monitoring", label: "Working, filled, remaining, canceled, or rejected status will be monitored" },
  { id: "check-exit", group: "Management", label: "Closing, expiration, assignment, and exercise plans are explicit" },
];

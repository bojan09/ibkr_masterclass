export const GREEK_GUIDE = [
  { id: "delta", label: "Delta", meaning: "Estimated option-price change for a small one-unit underlying move, holding model inputs otherwise constant.", unit: "Option price units per 1 underlying unit", limit: "Delta changes with price, time, and volatility and is not exact for a large move.", misuse: "Treating absolute delta as a guaranteed probability of expiring in the money." },
  { id: "gamma", label: "Gamma", meaning: "Estimated change in delta for a small one-unit underlying move.", unit: "Delta change per 1 underlying unit", limit: "Gamma is local and can change sharply near expiration and near the strike.", misuse: "Assuming a hedge based on current delta remains fixed after the underlying moves." },
  { id: "theta", label: "Theta", meaning: "Model-estimated option-price change from one day passing, with other inputs held constant.", unit: "Option price units per calendar day", limit: "Real time decay is not linear and price or volatility moves can dominate it.", misuse: "Calling theta guaranteed daily income for a short option." },
  { id: "vega", label: "Vega", meaning: "Estimated option-price change for a one-percentage-point change in implied volatility.", unit: "Option price units per 1 IV point", limit: "The volatility surface can change differently across strikes and expirations.", misuse: "Assuming every contract responds to an index-level IV change by exactly its displayed vega." },
  { id: "rho", label: "Rho", meaning: "Estimated option-price change for a one-percentage-point change in the model interest rate.", unit: "Option price units per 1 rate point", limit: "Rate, dividend, borrow, and American-exercise effects may require a different model.", misuse: "Ignoring unit conventions or treating rho as irrelevant for all durations." },
];

export const VOLATILITY_GUIDE = [
  { title: "Implied is model-derived", body: "Implied volatility is the volatility input that reconciles a model with an observed option price under assumptions. It is not directly observed future volatility." },
  { title: "Higher IV often means higher option value", body: "All else equal, more modeled dispersion generally increases both call and put value because the holder retains favorable outcomes while loss is limited to the premium." },
  { title: "One IV is not a surface", body: "Different strikes and expirations can carry different implied volatilities. Compare contracts on consistent terms and do not apply one number to an entire chain." },
  { title: "IV is not direction", body: "A high implied volatility does not say whether the underlying will rise or fall, and a low reading does not promise calm markets." },
];

export const MODEL_ASSUMPTIONS = ["European exercise", "Lognormal price process", "Constant volatility and interest rate", "No discrete dividends", "Frictionless continuous trading", "Inputs are estimates, not forecasts"];

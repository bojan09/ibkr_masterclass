import { FEE_COMPONENTS, MARGIN_SAFETY_CHECKS, RISK_TOPICS } from "../data/risk.js";

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculatePositionSize({ accountValue, riskPercent, entryPrice, stopPrice, multiplier = 1 }) {
  if (![accountValue, riskPercent, entryPrice, stopPrice, multiplier].every((value) => Number.isFinite(value) && value > 0)) throw new RangeError("Sizing inputs must be positive numbers.");
  const riskBudget = round(accountValue * riskPercent / 100);
  const riskPerUnit = round(Math.abs(entryPrice - stopPrice) * multiplier);
  if (riskPerUnit === 0) throw new RangeError("Entry and modeled exit must differ.");
  const units = Math.floor(riskBudget / riskPerUnit);
  return { riskBudget, riskPerUnit, units, modeledRisk: round(units * riskPerUnit) };
}

export function calculateMarginBuffer({ netLiquidation, maintenanceMargin }) {
  if (!Number.isFinite(netLiquidation) || netLiquidation <= 0 || !Number.isFinite(maintenanceMargin) || maintenanceMargin < 0) throw new RangeError("Margin values are invalid.");
  const excessLiquidity = round(netLiquidation - maintenanceMargin);
  const utilizationPercent = round(maintenanceMargin / netLiquidation * 100);
  return { excessLiquidity, utilizationPercent, cushionPercent: round(100 - utilizationPercent) };
}

export function calculatePortfolioExposure(positions) {
  const gross = round(positions.reduce((total, position) => total + Math.abs(position.marketValue), 0));
  const net = round(positions.reduce((total, position) => total + position.marketValue, 0));
  const largest = Math.max(0, ...positions.map((position) => Math.abs(position.marketValue)));
  return { gross, net, largestConcentrationPercent: gross ? round(largest / gross * 100) : 0 };
}

export function calculateFeeImpact({ totalFees, tradeValue }) {
  if (!Number.isFinite(totalFees) || totalFees < 0 || !Number.isFinite(tradeValue) || tradeValue <= 0) throw new RangeError("Fee inputs are invalid.");
  const feePercent = round(totalFees / tradeValue * 100);
  return { feePercent, breakEvenMovePercent: feePercent };
}

export function convertCurrency({ amount, rate }) {
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || rate <= 0) throw new RangeError("Currency inputs are invalid.");
  return round(amount * rate);
}

function money(value) {
  return Number(value).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function renderTopics(initialTopic) {
  const ordered = [...RISK_TOPICS].sort((a, b) => (a.id === initialTopic ? -1 : b.id === initialTopic ? 1 : 0));
  return `<section class="risk-topic-grid">${ordered.map((topic) => `<article class="${topic.id === initialTopic ? "is-featured" : ""}"><span>${topic.id}</span><h2>${topic.title}</h2><p>${topic.body}</p><div><strong>What can go wrong</strong><p>${topic.risk}</p></div><details><summary>What to verify</summary><ul>${topic.verify.map((item) => `<li>${item}</li>`).join("")}</ul></details></article>`).join("")}</section>`;
}

function renderSizing(state) {
  const result = calculatePositionSize(state.sizing);
  return `<section class="risk-calculator"><div><p class="eyebrow">Position sizing</p><h2>Budget loss before choosing units</h2><p>This stop-distance model does not cap actual loss. Gaps, slippage, nonlinear options, and failed exits can produce more.</p></div><form data-risk-form="sizing"><label>Account value<input name="accountValue" type="number" min="1" step="1000" value="${state.sizing.accountValue}"></label><label>Risk budget %<input name="riskPercent" type="number" min="0.1" max="100" step="0.1" value="${state.sizing.riskPercent}"></label><label>Entry price<input name="entryPrice" type="number" min="0.01" step="0.5" value="${state.sizing.entryPrice}"></label><label>Modeled exit<input name="stopPrice" type="number" min="0.01" step="0.5" value="${state.sizing.stopPrice}"></label><label>Multiplier<input name="multiplier" type="number" min="1" step="1" value="${state.sizing.multiplier}"></label></form><div class="risk-calculator__results"><span>Loss budget<strong>${money(result.riskBudget)}</strong></span><span>Risk / unit<strong>${money(result.riskPerUnit)}</strong></span><span>Whole units<strong>${result.units}</strong></span><span>Modeled risk<strong>${money(result.modeledRisk)}</strong></span></div></section>`;
}

function renderMargin(state) {
  const result = calculateMarginBuffer(state.margin);
  const stressed = calculateMarginBuffer({ netLiquidation: state.margin.netLiquidation * 0.85, maintenanceMargin: state.margin.maintenanceMargin * 1.2 });
  return `<section class="risk-calculator"><div><p class="eyebrow">Margin stress</p><h2>Measure cushion, then break the assumptions</h2><p>This is arithmetic on hypothetical inputs, not an IBKR margin calculation. Actual requirements are account- and portfolio-specific.</p></div><form data-risk-form="margin"><label>Net liquidation<input name="netLiquidation" type="number" min="1" step="1000" value="${state.margin.netLiquidation}"></label><label>Maintenance margin<input name="maintenanceMargin" type="number" min="0" step="1000" value="${state.margin.maintenanceMargin}"></label></form><div class="risk-calculator__results"><span>Excess liquidity<strong>${money(result.excessLiquidity)}</strong></span><span>Utilization<strong>${result.utilizationPercent}%</strong></span><span>Cushion<strong>${result.cushionPercent}%</strong></span><span>Stress cushion<strong>${stressed.cushionPercent}%</strong><small>NAV −15%, requirement +20%</small></span></div></section>`;
}

function renderFriction() {
  return `<section class="friction-reference"><header><p class="eyebrow">Fees and currency</p><h2>Price the complete workflow</h2><p>No rate is hard-coded here. Use the current schedule for the account, entity, product, market, and pricing plan.</p></header><div>${FEE_COMPONENTS.map((component) => `<article><h3>${component.title}</h3><p>${component.body}</p></article>`).join("")}</div><aside><strong>Official current schedules</strong><a href="https://www.interactivebrokers.com/en/pricing/commissions-home.php" target="_blank" rel="noreferrer">Commissions</a><a href="https://www.interactivebrokers.com/en/trading/margin-requirements.php" target="_blank" rel="noreferrer">Margin requirements</a><a href="https://www.interactivebrokers.com/en/trading/margin-rates.php" target="_blank" rel="noreferrer">Financing rates</a><span>Verified 2026-08-11</span></aside></section>`;
}

export function renderRiskLab(container, { initialTopic = "margin" } = {}) {
  let state = { sizing: { accountValue: 50000, riskPercent: 1, entryPrice: 100, stopPrice: 95, multiplier: 1 }, margin: { netLiquidation: 100000, maintenanceMargin: 30000 } };
  const render = () => {
    container.innerHTML = `<article class="risk-page"><header class="simulator-intro"><div><p class="eyebrow">Phase 11 · Margin and risk</p><h1>Capacity is not permission to maximize exposure</h1><p>Connect size, margin cushion, concentration, currency, and friction before asking whether an order fits.</p></div><span class="simulation-badge">HYPOTHETICAL VALUES</span></header>${renderTopics(initialTopic)}<div class="risk-calculator-grid">${renderSizing(state)}${renderMargin(state)}</div><section class="margin-safety"><div><p class="eyebrow">Margin safety</p><h2>Six checks before relying on buying power</h2></div><ol>${MARGIN_SAFETY_CHECKS.map((item) => `<li>${item}</li>`).join("")}</ol><aside><strong>Liquidation boundary</strong><p>A personal stop order does not control a broker’s margin process. Requirements can rise and positions can be liquidated without waiting for a chosen exit sequence.</p></aside></section>${renderFriction()}</article>`;
  };
  const handleChange = (event) => {
    const form = event.target.closest("[data-risk-form]");
    if (!form) return;
    const data = new FormData(form);
    if (form.dataset.riskForm === "sizing") state.sizing = { accountValue: Number(data.get("accountValue")), riskPercent: Number(data.get("riskPercent")), entryPrice: Number(data.get("entryPrice")), stopPrice: Number(data.get("stopPrice")), multiplier: Number(data.get("multiplier")) };
    else state.margin = { netLiquidation: Number(data.get("netLiquidation")), maintenanceMargin: Number(data.get("maintenanceMargin")) };
    try { render(); } catch { /* Keep the last valid view while a numeric field is temporarily incomplete. */ }
  };
  container.addEventListener("change", handleChange);
  render();
  return () => container.removeEventListener("change", handleChange);
}

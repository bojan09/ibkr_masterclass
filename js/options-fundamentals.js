import { EXPIRATION_WORKFLOW, OPTIONS_FUNDAMENTALS, OPTION_RIGHTS } from "../data/options.js";

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateIntrinsicValue({ right, stockPrice, strike }) {
  if (right === "call") return round(Math.max(0, stockPrice - strike));
  if (right === "put") return round(Math.max(0, strike - stockPrice));
  throw new TypeError("Option right must be call or put.");
}

export function calculateTimeValue({ premium, intrinsicValue }) {
  return round(Math.max(0, premium - intrinsicValue));
}

export function calculateOptionContractCost({ premium, contracts, multiplier = 100 }) {
  return round(premium * contracts * multiplier);
}

export function calculateBreakeven({ right, strike, premium }) {
  if (right === "call") return round(strike + premium);
  if (right === "put") return round(strike - premium);
  throw new TypeError("Option right must be call or put.");
}

export function calculateOptionPnlAtExpiration({ right, stockPrice, strike, premium, contracts, multiplier = 100 }) {
  const intrinsic = calculateIntrinsicValue({ right, stockPrice, strike });
  return round((intrinsic - premium) * contracts * multiplier);
}

function formatMoney(value) {
  return Number(value).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function renderTopic(topic) {
  return `<article class="option-topic"><div class="option-topic__marker">${topic.id.slice(0, 3).toUpperCase()}</div><div><h2>${topic.title}</h2><p>${topic.what}</p><section><strong>Why this matters</strong><p>${topic.why}</p></section><div class="option-topic__columns"><div><strong>Risks</strong><ul>${topic.risks.map((risk) => `<li>${risk}</li>`).join("")}</ul></div><div><strong>Common mistakes</strong><ul>${topic.mistakes.map((mistake) => `<li>${mistake}</li>`).join("")}</ul></div></div></div></article>`;
}

function renderRights() {
  return `<section class="option-rights"><div><p class="eyebrow">Rights and obligations</p><h2>Long is a right. Short is an obligation.</h2><p>Always name both the contract right and the position side.</p></div>${OPTION_RIGHTS.map((right) => `<article><span>${right.label}</span><dl><div><dt>Buyer’s right</dt><dd>${right.buyerRight}</dd></div><div><dt>Seller’s obligation</dt><dd>${right.sellerObligation}</dd></div><div><dt>All else equal</dt><dd>${right.directionalEffect}</dd></div></dl></article>`).join("")}</section>`;
}

function renderCalculator(state) {
  const intrinsic = calculateIntrinsicValue(state);
  const timeValue = calculateTimeValue({ premium: state.premium, intrinsicValue: intrinsic });
  const cost = calculateOptionContractCost(state);
  const breakeven = calculateBreakeven(state);
  const pnl = calculateOptionPnlAtExpiration(state);
  return `<section class="option-math-lab" aria-labelledby="option-math-title"><div class="option-math-lab__controls"><div><p class="eyebrow">Interactive example</p><h2 id="option-math-title">Decompose an option contract</h2><p>Move one input at a time. The P&amp;L result describes a long option held to expiration and excludes fees.</p></div><form data-option-math><label>Right<select name="right"><option value="call" ${state.right === "call" ? "selected" : ""}>Call</option><option value="put" ${state.right === "put" ? "selected" : ""}>Put</option></select></label><label>Underlying at expiration<input type="number" name="stockPrice" min="0" step="0.5" value="${state.stockPrice}"></label><label>Strike<input type="number" name="strike" min="0.01" step="0.5" value="${state.strike}"></label><label>Premium paid<input type="number" name="premium" min="0" step="0.05" value="${state.premium}"></label><label>Contracts<input type="number" name="contracts" min="1" step="1" value="${state.contracts}"></label><label>Multiplier<input type="number" name="multiplier" min="1" step="1" value="${state.multiplier}"></label></form></div><div class="option-math-results"><article><span>Intrinsic value / unit</span><strong>${formatMoney(intrinsic)}</strong><p>${state.right === "call" ? "max(0, stock − strike)" : "max(0, strike − stock)"}</p></article><article><span>Time value now</span><strong>${formatMoney(timeValue)}</strong><p>max(0, premium − intrinsic)</p></article><article><span>Premium cash amount</span><strong>${formatMoney(cost)}</strong><p>premium × contracts × multiplier</p></article><article><span>Expiration breakeven</span><strong>${formatMoney(breakeven)}</strong><p>Strike ${state.right === "call" ? "+" : "−"} premium</p></article><article class="${pnl >= 0 ? "is-profit" : "is-loss"}"><span>Long-option P&amp;L at expiration</span><strong>${formatMoney(pnl)}</strong><p>(intrinsic − premium) × contracts × multiplier</p></article></div></section>`;
}

function renderExpiration() {
  return `<section class="expiration-workflow"><div><p class="eyebrow">Expiration workflow</p><h2>A deadline needs an operational plan</h2><p>This is a reasoning checklist, not a prediction or broker-specific exercise instruction.</p></div><ol>${EXPIRATION_WORKFLOW.map((step) => `<li>${step}</li>`).join("")}</ol><div class="risk-boundary"><strong>Risk boundary</strong><p>Exercise, automatic exercise, contrary instructions, assignment timing, settlement, and deadlines vary by product, clearing process, broker policy, account, and jurisdiction. Verify current IBKR documentation and the exact contract before acting.</p></div></section>`;
}

export function renderOptionsFundamentals(container, { initialTopic } = {}) {
  let state = { right: "call", stockPrice: 105, strike: 100, premium: 7.5, contracts: 1, multiplier: 100 };
  const selected = OPTIONS_FUNDAMENTALS.find((topic) => topic.id === initialTopic);
  const render = () => {
    container.innerHTML = `<article class="options-foundation-page"><header class="simulator-intro"><div><p class="eyebrow">Phase 6 · Options fundamentals</p><h1>Options without the shortcuts</h1><p>Understand the contract, rights, obligations, premium, expiration, exercise, and assignment before opening a chain.</p></div><span class="simulation-badge">EDUCATIONAL EXAMPLES</span></header>${renderRights()}<nav class="option-topic-nav" aria-label="Options fundamentals topics">${OPTIONS_FUNDAMENTALS.map((topic) => `<a href="#option-topic-${topic.id}" class="${selected?.id === topic.id ? "is-active" : ""}">${topic.title}</a>`).join("")}</nav><section class="option-topic-list">${(selected ? [selected, ...OPTIONS_FUNDAMENTALS.filter((topic) => topic !== selected)] : OPTIONS_FUNDAMENTALS).map((topic) => `<div id="option-topic-${topic.id}">${renderTopic(topic)}</div>`).join("")}</section>${renderCalculator(state)}${renderExpiration()}</article>`;
  };
  const handleChange = (event) => {
    const form = event.target.closest("[data-option-math]");
    if (!form) return;
    const data = new FormData(form);
    state = { right: data.get("right"), stockPrice: Number(data.get("stockPrice")), strike: Number(data.get("strike")), premium: Number(data.get("premium")), contracts: Math.max(1, Math.trunc(Number(data.get("contracts")))), multiplier: Math.max(1, Number(data.get("multiplier"))) };
    render();
  };
  container.addEventListener("change", handleChange);
  render();
  return () => container.removeEventListener("change", handleChange);
}

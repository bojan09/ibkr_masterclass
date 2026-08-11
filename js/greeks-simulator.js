import { GREEK_GUIDE, MODEL_ASSUMPTIONS, VOLATILITY_GUIDE } from "../data/greeks.js";

function normalPdf(value) {
  return Math.exp(-0.5 * value ** 2) / Math.sqrt(2 * Math.PI);
}

function normalCdf(value) {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * x);
  const coefficients = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
  const erf = 1 - coefficients.reduceRight((sum, coefficient) => (sum + coefficient) * t, 0) * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

function round(value, places = 6) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateBlackScholes({ right, stockPrice, strike, years, rate, volatility }) {
  if (!["call", "put"].includes(right)) throw new TypeError("Option right must be call or put.");
  if (![stockPrice, strike, years, volatility].every((value) => Number.isFinite(value) && value > 0)) throw new RangeError("Stock price, strike, time, and volatility must be positive numbers.");
  if (!Number.isFinite(rate)) throw new RangeError("Rate must be finite.");

  const rootTime = Math.sqrt(years);
  const d1 = (Math.log(stockPrice / strike) + (rate + volatility ** 2 / 2) * years) / (volatility * rootTime);
  const d2 = d1 - volatility * rootTime;
  const discount = Math.exp(-rate * years);
  const pdf = normalPdf(d1);
  const isCall = right === "call";
  const price = isCall
    ? stockPrice * normalCdf(d1) - strike * discount * normalCdf(d2)
    : strike * discount * normalCdf(-d2) - stockPrice * normalCdf(-d1);
  const delta = isCall ? normalCdf(d1) : normalCdf(d1) - 1;
  const gamma = pdf / (stockPrice * volatility * rootTime);
  const annualTheta = isCall
    ? -(stockPrice * pdf * volatility) / (2 * rootTime) - rate * strike * discount * normalCdf(d2)
    : -(stockPrice * pdf * volatility) / (2 * rootTime) + rate * strike * discount * normalCdf(-d2);
  const vega = stockPrice * pdf * rootTime / 100;
  const rho = isCall
    ? strike * years * discount * normalCdf(d2) / 100
    : -strike * years * discount * normalCdf(-d2) / 100;
  return { price: round(price), delta: round(delta), gamma: round(gamma), theta: round(annualTheta / 365), vega: round(vega), rho: round(rho), d1: round(d1), d2: round(d2) };
}

function renderOutputCard(greek, value, max) {
  const width = Math.min(100, Math.max(3, (Math.abs(value) / max) * 100));
  return `<article><div><span>${greek.label}</span><strong class="tabular">${value.toFixed(greek.id === "gamma" ? 4 : 3)}</strong></div><div class="greek-bar"><i style="width:${width}%"></i></div><p>${greek.unit}</p></article>`;
}

function renderGreekGuide() {
  return `<section class="greek-guide"><header><p class="eyebrow">Five sensitivities</p><h2>Local estimates, not promises</h2><p>Each Greek answers a narrow “what if” question while pretending other inputs stay fixed.</p></header><div>${GREEK_GUIDE.map((greek) => `<article><span>${greek.label}</span><p>${greek.meaning}</p><dl><div><dt>Unit</dt><dd>${greek.unit}</dd></div><div><dt>Limit</dt><dd>${greek.limit}</dd></div><div><dt>Misuse</dt><dd>${greek.misuse}</dd></div></dl></article>`).join("")}</div></section>`;
}

export function renderGreeksSimulator(container) {
  let state = { right: "call", stockPrice: 100, strike: 100, days: 45, ratePercent: 4.5, volatilityPercent: 28 };
  const render = () => {
    const result = calculateBlackScholes({ right: state.right, stockPrice: state.stockPrice, strike: state.strike, years: state.days / 365, rate: state.ratePercent / 100, volatility: state.volatilityPercent / 100 });
    const shockedStock = state.stockPrice * 1.05;
    const shocked = calculateBlackScholes({ right: state.right, stockPrice: shockedStock, strike: state.strike, years: state.days / 365, rate: state.ratePercent / 100, volatility: state.volatilityPercent / 100 });
    container.innerHTML = `<article class="greeks-page"><header class="simulator-intro"><div><p class="eyebrow">Phase 8 · Greeks and volatility</p><h1>Change an input. Watch the model respond.</h1><p>A Black–Scholes educational model isolates sensitivities. It does not quote a market, predict a price, or represent IBKR’s production models.</p></div><span class="simulation-badge">MODEL OUTPUT · NOT MARKET DATA</span></header><section class="greeks-lab"><form data-greeks-form><div><p class="eyebrow">Model inputs</p><h2>Controlled assumptions</h2></div><label>Right<select name="right"><option value="call" ${state.right === "call" ? "selected" : ""}>Call</option><option value="put" ${state.right === "put" ? "selected" : ""}>Put</option></select></label><label>Underlying <output>${state.stockPrice.toFixed(2)}</output><input type="range" name="stockPrice" min="70" max="130" step="1" value="${state.stockPrice}"></label><label>Strike <output>${state.strike.toFixed(2)}</output><input type="range" name="strike" min="80" max="120" step="5" value="${state.strike}"></label><label>Days to expiration <output>${state.days}</output><input type="range" name="days" min="1" max="365" step="1" value="${state.days}"></label><label>Implied volatility <output>${state.volatilityPercent.toFixed(1)}%</output><input type="range" name="volatilityPercent" min="5" max="100" step="1" value="${state.volatilityPercent}"></label><label>Interest rate <output>${state.ratePercent.toFixed(1)}%</output><input type="range" name="ratePercent" min="0" max="10" step="0.1" value="${state.ratePercent}"></label></form><section class="greeks-output" aria-live="polite"><div class="model-price"><span>Modeled option value</span><strong>${result.price.toFixed(2)}</strong><p>Per underlying unit · before multiplier</p></div><div class="greek-output-grid">${renderOutputCard(GREEK_GUIDE[0], result.delta, 1)}${renderOutputCard(GREEK_GUIDE[1], result.gamma, 0.1)}${renderOutputCard(GREEK_GUIDE[2], result.theta, 0.2)}${renderOutputCard(GREEK_GUIDE[3], result.vega, 1)}${renderOutputCard(GREEK_GUIDE[4], result.rho, 1)}</div><div class="greek-shock"><span>Show me: underlying +5%</span><strong>${shocked.price.toFixed(2)}</strong><p>Exact model recalculation at ${shockedStock.toFixed(2)} versus delta-only estimate ${(result.price + result.delta * (shockedStock - state.stockPrice)).toFixed(2)}. Gamma helps explain why a large move differs.</p></div></section></section>${renderGreekGuide()}<section class="volatility-guide"><header><p class="eyebrow">Implied volatility</p><h2>A price input disguised as an expectation</h2></header><div>${VOLATILITY_GUIDE.map((item) => `<article><h3>${item.title}</h3><p>${item.body}</p></article>`).join("")}</div><aside><strong>Model assumptions</strong><ul>${MODEL_ASSUMPTIONS.map((assumption) => `<li>${assumption}</li>`).join("")}</ul></aside></section></article>`;
  };
  const handleInput = (event) => {
    const form = event.target.closest("[data-greeks-form]");
    if (!form) return;
    const data = new FormData(form);
    state = { right: data.get("right"), stockPrice: Number(data.get("stockPrice")), strike: Number(data.get("strike")), days: Number(data.get("days")), volatilityPercent: Number(data.get("volatilityPercent")), ratePercent: Number(data.get("ratePercent")) };
    render();
  };
  container.addEventListener("input", handleInput);
  container.addEventListener("change", handleInput);
  render();
  return () => { container.removeEventListener("input", handleInput); container.removeEventListener("change", handleInput); };
}

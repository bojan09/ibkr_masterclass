import { OPTION_STRATEGIES } from "../data/strategies.js";

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateLegPayoff(leg, underlyingPrice) {
  const direction = leg.side === "long" ? 1 : -1;
  if (leg.instrument === "stock") return round(direction * (underlyingPrice - leg.entryPrice) * leg.quantity * (leg.multiplier ?? 1));
  const intrinsic = leg.right === "call" ? Math.max(0, underlyingPrice - leg.strike) : Math.max(0, leg.strike - underlyingPrice);
  return round(direction * (intrinsic - leg.premium) * leg.quantity * (leg.multiplier ?? 100));
}

export function calculateStrategyPayoff(legs, underlyingPrice) {
  return round(legs.reduce((total, leg) => total + calculateLegPayoff(leg, underlyingPrice), 0));
}

export function calculateDefinedRiskVertical(legs) {
  if (legs.length !== 2 || legs.some((leg) => leg.instrument !== "option") || legs[0].right !== legs[1].right || legs[0].side === legs[1].side || legs[0].quantity !== legs[1].quantity) return undefined;
  const longLeg = legs.find((leg) => leg.side === "long");
  const shortLeg = legs.find((leg) => leg.side === "short");
  const multiplier = longLeg.multiplier ?? 100;
  const quantity = longLeg.quantity;
  const netDebit = round(longLeg.premium - shortLeg.premium);
  const width = Math.abs(longLeg.strike - shortLeg.strike);
  const maxLoss = round(netDebit * multiplier * quantity);
  const maxProfit = round((width - netDebit) * multiplier * quantity);
  const breakeven = round(longLeg.right === "call" ? longLeg.strike + netDebit : longLeg.strike - netDebit);
  return { netDebit, width, maxLoss, maxProfit, breakeven };
}

export function createPayoffSeries(legs, { minimum, maximum, step = 1 }) {
  const prices = new Set();
  for (let price = minimum; price <= maximum + Number.EPSILON; price += step) prices.add(round(price));
  for (const leg of legs) if (leg.instrument === "option" && leg.strike >= minimum && leg.strike <= maximum) prices.add(leg.strike);
  return [...prices].sort((a, b) => a - b).map((underlyingPrice) => ({ underlyingPrice, payoff: calculateStrategyPayoff(legs, underlyingPrice) }));
}

function cloneLegs(legs) {
  return legs.map((leg) => ({ ...leg }));
}

function formatMoney(value) {
  return Number(value).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function renderPayoffChart(series) {
  const width = 720;
  const height = 260;
  const padding = 30;
  const minPrice = series[0].underlyingPrice;
  const maxPrice = series.at(-1).underlyingPrice;
  const minPayoff = Math.min(...series.map((point) => point.payoff), 0);
  const maxPayoff = Math.max(...series.map((point) => point.payoff), 0);
  const payoffRange = maxPayoff - minPayoff || 1;
  const x = (price) => padding + ((price - minPrice) / (maxPrice - minPrice || 1)) * (width - padding * 2);
  const y = (payoff) => height - padding - ((payoff - minPayoff) / payoffRange) * (height - padding * 2);
  const points = series.map((point) => `${x(point.underlyingPrice).toFixed(1)},${y(point.payoff).toFixed(1)}`).join(" ");
  const zeroY = y(0);
  return `<svg class="payoff-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Expiration profit and loss chart from ${minPrice} to ${maxPrice}"><line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" class="payoff-chart__zero"></line><polyline points="${points}"></polyline><text x="${padding}" y="${height - 8}">${minPrice}</text><text x="${width - padding}" y="${height - 8}" text-anchor="end">${maxPrice}</text><text x="${padding}" y="${Math.max(12, y(maxPayoff) - 6)}">${formatMoney(maxPayoff)}</text><text x="${padding}" y="${Math.min(height - 34, y(minPayoff) + 14)}">${formatMoney(minPayoff)}</text></svg>`;
}

function renderLeg(leg, index) {
  if (leg.instrument === "stock") return `<div class="strategy-leg"><span>Leg ${index + 1}</span><label>Instrument<select name="instrument"><option value="stock" selected>Stock</option><option value="option">Option</option></select></label><label>Side<select name="side"><option value="long" ${leg.side === "long" ? "selected" : ""}>Long</option><option value="short" ${leg.side === "short" ? "selected" : ""}>Short</option></select></label><label>Entry<input name="entryPrice" type="number" min="0" step="0.5" value="${leg.entryPrice}"></label><label>Shares<input name="quantity" type="number" min="1" step="1" value="${leg.quantity}"></label><button type="button" data-remove-leg="${index}" aria-label="Remove leg ${index + 1}">Remove</button></div>`;
  return `<div class="strategy-leg"><span>Leg ${index + 1}</span><label>Instrument<select name="instrument"><option value="option" selected>Option</option><option value="stock">Stock</option></select></label><label>Side<select name="side"><option value="long" ${leg.side === "long" ? "selected" : ""}>Long</option><option value="short" ${leg.side === "short" ? "selected" : ""}>Short</option></select></label><label>Right<select name="right"><option value="call" ${leg.right === "call" ? "selected" : ""}>Call</option><option value="put" ${leg.right === "put" ? "selected" : ""}>Put</option></select></label><label>Strike<input name="strike" type="number" min="0" step="1" value="${leg.strike}"></label><label>Premium<input name="premium" type="number" min="0" step="0.1" value="${leg.premium}"></label><label>Contracts<input name="quantity" type="number" min="1" step="1" value="${leg.quantity}"></label><button type="button" data-remove-leg="${index}" aria-label="Remove leg ${index + 1}">Remove</button></div>`;
}

function readLeg(element) {
  const data = new FormData();
  for (const field of element.querySelectorAll("input, select")) data.set(field.name, field.value);
  if (data.get("instrument") === "stock") return { instrument: "stock", side: data.get("side"), entryPrice: Number(data.get("entryPrice")) || 100, quantity: Math.max(1, Math.trunc(Number(data.get("quantity")))), multiplier: 1 };
  return { instrument: "option", side: data.get("side"), right: data.get("right"), strike: Number(data.get("strike")) || 100, premium: Math.max(0, Number(data.get("premium"))), quantity: Math.max(1, Math.trunc(Number(data.get("quantity")))), multiplier: 100 };
}

export function renderPayoffSimulator(container) {
  let state = { strategyId: "bull-call-spread", legs: cloneLegs(OPTION_STRATEGIES.find((item) => item.id === "bull-call-spread").legs), scenarioPrice: 105 };
  const render = () => {
    const strategy = OPTION_STRATEGIES.find((item) => item.id === state.strategyId);
    const series = createPayoffSeries(state.legs, { minimum: 70, maximum: 130, step: 1 });
    const scenarioPayoff = calculateStrategyPayoff(state.legs, state.scenarioPrice);
    const profile = calculateDefinedRiskVertical(state.legs);
    container.innerHTML = `<article class="payoff-page"><header class="simulator-intro"><div><p class="eyebrow">Phase 9 · Options strategies</p><h1>Build the legs. See the combined obligation.</h1><p>Expiration payoff is only one dimension. Liquidity, early assignment, exercise, volatility, and time still matter before expiration.</p></div><span class="simulation-badge">EXPIRATION MODEL · EXCLUDES FEES</span></header><section class="strategy-library"><div><p class="eyebrow">Strategy library</p><h2>Start from structure, not a catchy name</h2></div>${OPTION_STRATEGIES.map((item) => `<button type="button" data-strategy="${item.id}" class="${state.strategyId === item.id ? "is-active" : ""}"><span>${item.category}</span><strong>${item.title}</strong><small>${item.outlook}</small></button>`).join("")}</section><section class="strategy-builder"><div class="strategy-builder__legs"><div class="strategy-builder__heading"><div><p class="eyebrow">Multi-leg builder</p><h2>${strategy?.title ?? "Custom strategy"}</h2></div><button type="button" data-add-leg ${state.legs.length >= 4 ? "disabled" : ""}>Add option leg</button></div><form data-strategy-form>${state.legs.map(renderLeg).join("")}</form><section class="strategy-context"><div><strong>Outlook</strong><p>${strategy?.outlook ?? "Custom payoff; define the thesis and management plan explicitly."}</p></div><div><strong>Risk</strong><p>${strategy?.risk ?? "Custom combinations can create undefined risk, assignment exposure, and unintended positions."}</p></div></section></div><div class="payoff-visual"><div class="payoff-visual__header"><div><span>Underlying at expiration</span><strong>${state.scenarioPrice.toFixed(2)}</strong></div><label><span>Scenario price</span><input type="range" min="70" max="130" step="1" value="${state.scenarioPrice}" data-scenario-price></label></div>${renderPayoffChart(series)}<div class="payoff-scenario ${scenarioPayoff >= 0 ? "is-profit" : "is-loss"}"><span>Modeled P&amp;L at ${state.scenarioPrice.toFixed(2)}</span><strong>${formatMoney(scenarioPayoff)}</strong></div>${profile ? `<div class="vertical-profile"><span>Net debit <strong>${profile.netDebit.toFixed(2)}</strong></span><span>Width <strong>${profile.width.toFixed(2)}</strong></span><span>Max loss <strong>${formatMoney(profile.maxLoss)}</strong></span><span>Max profit <strong>${formatMoney(profile.maxProfit)}</strong></span><span>Breakeven <strong>${profile.breakeven.toFixed(2)}</strong></span></div>` : `<div class="undefined-risk-warning"><strong>No simple defined-risk vertical detected</strong><p>Inspect each leg and extreme-price outcomes. A chart window does not prove risk is bounded outside the displayed range.</p></div>`}</div></section><section class="strategy-exit-plan"><div><p class="eyebrow">Position management</p><h2>An entry needs an exit and expiration plan</h2></div><ul>${(strategy?.exitQuestions ?? ["What invalidates the thesis?", "How will every leg be closed?", "What happens at assignment or exercise?"]).map((question) => `<li>${question}</li>`).join("")}</ul><aside><strong>Multi-leg execution risk</strong><p>A combination order can reduce legging risk but does not guarantee a fill. Editing or closing one leg can transform the risk profile. Verify the net price sign, ratios, rights, strikes, expiration, and resulting position before previewing.</p></aside></section></article>`;
  };
  const handleClick = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.strategy) {
      const strategy = OPTION_STRATEGIES.find((item) => item.id === button.dataset.strategy);
      state = { ...state, strategyId: strategy.id, legs: cloneLegs(strategy.legs) };
    } else if (button.hasAttribute("data-add-leg")) {
      state = { ...state, strategyId: "custom", legs: [...state.legs, { instrument: "option", side: "long", right: "call", strike: 100, premium: 2, quantity: 1, multiplier: 100 }] };
    } else if (button.dataset.removeLeg !== undefined) {
      state = { ...state, strategyId: "custom", legs: state.legs.filter((_, index) => index !== Number(button.dataset.removeLeg)) };
    } else return;
    render();
  };
  const handleChange = (event) => {
    if (!event.target.closest("[data-strategy-form]")) return;
    state = { ...state, strategyId: "custom", legs: [...container.querySelectorAll(".strategy-leg")].map(readLeg) };
    render();
  };
  const handleInput = (event) => {
    if (!event.target.matches("[data-scenario-price]")) return;
    state.scenarioPrice = Number(event.target.value);
    render();
  };
  container.addEventListener("click", handleClick);
  container.addEventListener("change", handleChange);
  container.addEventListener("input", handleInput);
  render();
  return () => { container.removeEventListener("click", handleClick); container.removeEventListener("change", handleChange); container.removeEventListener("input", handleInput); };
}

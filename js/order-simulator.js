import { ORDER_LIFECYCLE, ORDER_SCENARIOS, ORDER_TYPES, TIME_IN_FORCE, TROUBLESHOOTING_STEPS } from "../data/orders.js";
import { SIMULATED_QUOTES, getSimulatedQuote } from "../data/simulated-market-data.js";

function round(value, places = 4) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateSpread(quote) {
  return round(quote.ask - quote.bid);
}

export function calculateMidPrice(quote) {
  return round((quote.bid + quote.ask) / 2);
}

export function calculateOrderExposure({ quantity, referencePrice, multiplier = 1 }) {
  return round(Math.abs(quantity) * referencePrice * multiplier, 2);
}

export function validateOrder(order) {
  const messages = [];
  if (!getSimulatedQuote(order.symbol)) messages.push("Select a supported simulated symbol.");
  if (!["BUY", "SELL"].includes(order.side)) messages.push("Side must be BUY or SELL.");
  if (!Number.isInteger(order.quantity) || order.quantity <= 0) messages.push("Quantity must be a positive whole number.");
  if (!ORDER_TYPES.some((type) => type.id === order.type)) messages.push("Select a supported order type.");
  if (!TIME_IN_FORCE.some((item) => item.id === order.timeInForce)) messages.push("Select a supported time in force.");
  if (["limit", "stop-limit"].includes(order.type) && !(order.limitPrice > 0)) messages.push("Limit price is required for this order type.");
  if (["stop", "stop-limit"].includes(order.type) && !(order.stopPrice > 0)) messages.push("Stop price is required for this order type.");
  if (order.type === "trailing" && !(order.trailAmount > 0)) messages.push("A positive trail amount is required for a trailing stop.");
  return messages;
}

function waitingResult(order, explanation) {
  if (order.timeInForce === "IOC") {
    return { status: "canceled", filledQuantity: 0, remainingQuantity: 0, explanation: `${explanation} IOC canceled the unfilled quantity.`, messages: [] };
  }
  return { status: "working", filledQuantity: 0, remainingQuantity: order.quantity, explanation, messages: [] };
}

function fillResult(order, price, explanation) {
  return {
    status: "filled",
    fillPrice: round(price, 2),
    filledQuantity: order.quantity,
    remainingQuantity: 0,
    exposure: calculateOrderExposure({ quantity: order.quantity, referencePrice: price }),
    explanation,
    messages: [],
  };
}

export function simulateOrder(order, suppliedQuote) {
  const normalized = { ...order, symbol: String(order.symbol ?? "").toUpperCase() };
  const messages = validateOrder(normalized);
  if (messages.length) return { status: "rejected", filledQuantity: 0, remainingQuantity: 0, messages, explanation: "The simulator rejected the incomplete instruction." };

  const quote = suppliedQuote ?? getSimulatedQuote(normalized.symbol);
  const isBuy = normalized.side === "BUY";
  const marketPrice = isBuy ? quote.ask : quote.bid;

  if (normalized.type === "market") {
    return fillResult(normalized, marketPrice, `The educational market ${isBuy ? "buy" : "sell"} filled at the displayed available ${isBuy ? "ask" : "bid"}. Real fills can differ and are not guaranteed.`);
  }

  if (normalized.type === "limit") {
    const marketable = isBuy ? normalized.limitPrice >= quote.ask : normalized.limitPrice <= quote.bid;
    return marketable
      ? fillResult(normalized, isBuy ? Math.min(normalized.limitPrice, quote.ask) : Math.max(normalized.limitPrice, quote.bid), "The limit was marketable against the simulated quote and filled without violating its price boundary.")
      : waitingResult(normalized, "The limit protects the stated price but is not currently marketable, so it waits without a fill.");
  }

  if (normalized.type === "stop") {
    const triggered = isBuy ? quote.last >= normalized.stopPrice : quote.last <= normalized.stopPrice;
    return triggered
      ? fillResult(normalized, marketPrice, "The stop condition was met and became a market-style instruction. The trigger price did not guarantee the fill price.")
      : waitingResult(normalized, "The stop condition has not been met, so the order remains conditional and unfilled.");
  }

  if (normalized.type === "stop-limit") {
    const triggered = isBuy ? quote.last >= normalized.stopPrice : quote.last <= normalized.stopPrice;
    if (!triggered) return waitingResult(normalized, "The stop condition has not been met, so the limit instruction is not active.");
    const marketable = isBuy ? normalized.limitPrice >= quote.ask : normalized.limitPrice <= quote.bid;
    return marketable
      ? fillResult(normalized, isBuy ? Math.min(normalized.limitPrice, quote.ask) : Math.max(normalized.limitPrice, quote.bid), "The stop triggered and the resulting limit was marketable within its price boundary.")
      : waitingResult(normalized, "The stop triggered, but the limit is not marketable. Price control leaves execution uncertain.");
  }

  const syntheticTrigger = isBuy ? quote.last + normalized.trailAmount : quote.last - normalized.trailAmount;
  return waitingResult(normalized, `The simulated trailing trigger currently sits at ${syntheticTrigger.toFixed(2)}. It can move with favorable prices and does not guarantee a fill price after activation.`);
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function formatMoney(value) {
  return Number(value).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function renderAcademy() {
  return `<section class="order-academy" aria-labelledby="order-academy-title">
    <header><p class="eyebrow">Order academy</p><h2 id="order-academy-title">The instruction is the risk</h2><p>An order type changes price control, execution certainty, and what can happen after submission. No order type removes market risk.</p></header>
    <div class="order-type-grid">${ORDER_TYPES.map((type) => `<article><span>${type.label}</span><h3>${type.behavior}</h3><dl><div><dt>When used</dt><dd>${type.use}</dd></div><div><dt>Main risk</dt><dd>${type.risk}</dd></div><div><dt>Common mistake</dt><dd>${type.mistake}</dd></div></dl><button type="button" data-order-type="${type.id}">Load in ticket</button></article>`).join("")}</div>
    <section class="tif-reference"><div><p class="eyebrow">Time in force</p><h3>How long can the instruction work?</h3></div>${TIME_IN_FORCE.map((item) => `<article><strong>${item.label}</strong><p>${item.explanation}</p></article>`).join("")}</section>
  </section>`;
}

function renderTicket(state) {
  const quote = getSimulatedQuote(state.order.symbol);
  const type = ORDER_TYPES.find((item) => item.id === state.order.type);
  const referencePrice = state.order.side === "BUY" ? quote.ask : quote.bid;
  const exposure = calculateOrderExposure({ quantity: state.order.quantity || 0, referencePrice });
  return `<section class="order-ticket-lab" aria-labelledby="order-ticket-title">
    <div class="order-ticket-lab__ticket">
      <div class="order-ticket-heading"><div><p class="eyebrow">Educational order ticket</p><h2 id="order-ticket-title">Construct the instruction</h2></div><span class="simulation-badge">SIMULATED ONLY</span></div>
      <form data-order-form>
        <label>Symbol<select name="symbol">${SIMULATED_QUOTES.map((item) => `<option ${item.symbol === state.order.symbol ? "selected" : ""}>${item.symbol}</option>`).join("")}</select></label>
        <fieldset><legend>Side</legend><label><input type="radio" name="side" value="BUY" ${state.order.side === "BUY" ? "checked" : ""}> Buy</label><label><input type="radio" name="side" value="SELL" ${state.order.side === "SELL" ? "checked" : ""}> Sell</label></fieldset>
        <label>Quantity<input name="quantity" type="number" min="1" step="1" value="${state.order.quantity}"></label>
        <label>Order type<select name="type">${ORDER_TYPES.map((item) => `<option value="${item.id}" ${item.id === state.order.type ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
        <label class="${["limit", "stop-limit"].includes(state.order.type) ? "" : "is-field-inactive"}">Limit price<input name="limitPrice" type="number" min="0.01" step="0.01" value="${state.order.limitPrice ?? ""}" ${["limit", "stop-limit"].includes(state.order.type) ? "" : "disabled"}></label>
        <label class="${["stop", "stop-limit"].includes(state.order.type) ? "" : "is-field-inactive"}">Stop price<input name="stopPrice" type="number" min="0.01" step="0.01" value="${state.order.stopPrice ?? ""}" ${["stop", "stop-limit"].includes(state.order.type) ? "" : "disabled"}></label>
        <label class="${state.order.type === "trailing" ? "" : "is-field-inactive"}">Trail amount<input name="trailAmount" type="number" min="0.01" step="0.01" value="${state.order.trailAmount ?? ""}" ${state.order.type === "trailing" ? "" : "disabled"}></label>
        <label>Time in force<select name="timeInForce">${TIME_IN_FORCE.map((item) => `<option ${item.id === state.order.timeInForce ? "selected" : ""}>${item.id}</option>`).join("")}</select></label>
        <div class="ticket-quote"><span>Bid <strong>${quote.bid.toFixed(2)}</strong></span><span>Ask <strong>${quote.ask.toFixed(2)}</strong></span><span>Last <strong>${quote.last.toFixed(2)}</strong></span><span>Spread <strong>${calculateSpread(quote).toFixed(2)}</strong></span></div>
        <div class="ticket-preview"><span>Reference exposure</span><strong>${formatMoney(exposure)}</strong><p>Quantity × displayed ${state.order.side === "BUY" ? "ask" : "bid"}. This is not a buying-power or final-cost calculation.</p></div>
        <button class="button button--primary" type="submit">Preview simulated outcome</button>
      </form>
    </div>
    <aside class="order-ticket-guide"><p class="eyebrow">Current behavior</p><h3>${type.label}</h3><p>${type.behavior}</p><strong>Risk</strong><p>${type.risk}</p><strong>Before preview</strong><ul><li>Contract identity</li><li>Side and quantity</li><li>Price conditions</li><li>Time in force</li><li>Existing open orders</li></ul></aside>
  </section>`;
}

function renderOutcome(result) {
  if (!result) return `<section class="order-outcome order-outcome--empty"><p class="eyebrow">Execution report</p><h2>No instruction previewed</h2><p>Complete the ticket, then inspect why the simulator fills, waits, cancels, or rejects it.</p></section>`;
  return `<section class="order-outcome order-outcome--${result.status}" aria-live="polite"><div><p class="eyebrow">Simulated execution report</p><h2>${result.status}</h2></div><div class="order-outcome__metrics"><span>Filled<strong>${result.filledQuantity}</strong></span><span>Remaining<strong>${result.remainingQuantity}</strong></span><span>Fill price<strong>${result.fillPrice === undefined ? "—" : result.fillPrice.toFixed(2)}</strong></span><span>Exposure<strong>${result.exposure === undefined ? "—" : formatMoney(result.exposure)}</strong></span></div><p>${escapeHtml(result.explanation)}</p>${result.messages?.length ? `<ul>${result.messages.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>` : ""}<p class="order-outcome__warning">Simulation is simplified: it excludes queue position, partial fills, price improvement, venue latency, fees, permissions, margin, and real market movement.</p></section>`;
}

function renderExecutionReference() {
  return `<section class="execution-reference"><div><p class="eyebrow">Order lifecycle</p><h2>Submitted is not filled</h2></div><ol>${ORDER_LIFECYCLE.map((item) => `<li><strong>${item.label}</strong><p>${item.explanation}</p></li>`).join("")}</ol><div class="order-troubleshooting"><h3>Troubleshoot before resubmitting</h3><ol>${TROUBLESHOOTING_STEPS.map((step) => `<li>${step}</li>`).join("")}</ol></div></section>`;
}

export function renderOrderSimulator(container, { storage, initialView = "simulator" } = {}) {
  let state = {
    view: initialView,
    order: { symbol: "AAPL", side: "BUY", quantity: 10, type: "limit", limitPrice: 227.19, timeInForce: "DAY" },
    result: undefined,
  };

  const readForm = (form) => {
    const data = new FormData(form);
    return {
      symbol: data.get("symbol"), side: data.get("side"), quantity: Number(data.get("quantity")), type: data.get("type"),
      limitPrice: Number(data.get("limitPrice")) || undefined, stopPrice: Number(data.get("stopPrice")) || undefined,
      trailAmount: Number(data.get("trailAmount")) || undefined, timeInForce: data.get("timeInForce"),
    };
  };

  const render = () => {
    container.innerHTML = `<article class="orders-page"><header class="simulator-intro"><div><p class="eyebrow">Phase 5 · Orders and execution</p><h1>Order behavior lab</h1><p>Learn how an instruction becomes working, filled, canceled, or rejected. Outcomes use fixed educational quotes—not market data.</p></div><span class="simulation-badge">SIMULATED DATA</span></header><nav class="lab-tabs" aria-label="Order lab sections"><button type="button" data-view="academy" class="${state.view === "academy" ? "is-active" : ""}">Order academy</button><button type="button" data-view="simulator" class="${state.view === "simulator" ? "is-active" : ""}">Ticket simulator</button><button type="button" data-view="execution" class="${state.view === "execution" ? "is-active" : ""}">Execution & troubleshooting</button></nav>${state.view === "academy" ? renderAcademy() : state.view === "execution" ? renderExecutionReference() : `${renderTicket(state)}${renderOutcome(state.result)}<section class="show-me-scenarios"><div><p class="eyebrow">Show me</p><h2>Load a controlled scenario</h2></div>${ORDER_SCENARIOS.map((scenario) => `<button type="button" data-scenario="${scenario.id}"><strong>${scenario.title}</strong><span>${scenario.lesson}</span></button>`).join("")}</section>`}</article>`;
  };

  const handleChange = (event) => {
    if (!event.target.closest("[data-order-form]")) return;
    state.order = readForm(event.target.form);
    state.result = undefined;
    render();
  };
  const handleSubmit = (event) => {
    if (!event.target.matches("[data-order-form]")) return;
    event.preventDefault();
    state.order = readForm(event.target);
    state.result = simulateOrder(state.order);
    storage.set("simulatorHistory", [{ id: `order-${Date.now()}`, kind: "order", createdAt: new Date().toISOString(), order: state.order, result: state.result }, ...storage.get("simulatorHistory")].slice(0, 50));
    render();
  };
  const handleClick = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.view) state.view = button.dataset.view;
    else if (button.dataset.orderType) {
      state.view = "simulator";
      state.order = { ...state.order, type: button.dataset.orderType };
    } else if (button.dataset.scenario) {
      state.order = { ...ORDER_SCENARIOS.find((scenario) => scenario.id === button.dataset.scenario).order };
      state.result = simulateOrder(state.order);
    } else return;
    render();
  };

  container.addEventListener("change", handleChange);
  container.addEventListener("submit", handleSubmit);
  container.addEventListener("click", handleClick);
  render();
  return () => { container.removeEventListener("change", handleChange); container.removeEventListener("submit", handleSubmit); container.removeEventListener("click", handleClick); };
}

import { OPTION_WORKFLOW_STEPS, POSITION_MANAGEMENT_ACTIONS } from "../data/options-workflow.js";
import { OPTION_CHAIN, OPTION_UNDERLYING } from "../data/simulated-options-data.js";
import { calculateOptionMid } from "./options-chain.js";

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function validateOptionCombo(legs) {
  const messages = [];
  if (!Array.isArray(legs) || !legs.length) return ["Add at least one option leg."];
  if (legs.some((leg) => !leg.contract?.id)) messages.push("Every leg needs a complete contract identity.");
  if (legs.some((leg) => !["BUY", "SELL"].includes(leg.side))) messages.push("Every leg needs a BUY or SELL side.");
  if (legs.some((leg) => !Number.isInteger(leg.ratio) || leg.ratio <= 0)) messages.push("Every leg ratio must be a positive whole number.");
  const symbols = new Set(legs.map((leg) => leg.contract?.symbol));
  if (symbols.size > 1) messages.push("This simulator supports one underlying per combination.");
  const identities = legs.map((leg) => `${leg.contract?.id}:${leg.side}`);
  if (new Set(identities).size !== identities.length) messages.push("Remove duplicate contract sides from the combination.");
  return messages;
}

export function calculateComboQuote(legs, quantity = 1) {
  const errors = validateOptionCombo(legs);
  if (errors.length) throw new TypeError(errors.join(" "));
  const naturalDebit = round(legs.reduce((total, leg) => total + (leg.side === "BUY" ? leg.contract.ask : -leg.contract.bid) * leg.ratio, 0));
  const midDebit = round(legs.reduce((total, leg) => total + (leg.side === "BUY" ? 1 : -1) * calculateOptionMid(leg.contract) * leg.ratio, 0));
  const multiplier = legs[0].contract.multiplier;
  return { naturalDebit, midDebit, contracts: quantity, naturalCash: round(naturalDebit * quantity * multiplier), midCash: round(midDebit * quantity * multiplier), multiplier };
}

export function simulateComboLimit({ legs, quantity, limitDebit }) {
  const messages = validateOptionCombo(legs);
  if (!Number.isInteger(quantity) || quantity <= 0) messages.push("Combination quantity must be a positive whole number.");
  if (!Number.isFinite(limitDebit)) messages.push("Enter a signed net limit: positive debit or negative credit.");
  if (messages.length) return { status: "rejected", messages, explanation: "The educational combination was not eligible for simulation." };
  const quote = calculateComboQuote(legs, quantity);
  if (limitDebit >= quote.naturalDebit) return { status: "filled", fillDebit: quote.naturalDebit, cashAmount: quote.naturalCash, messages: [], explanation: "The educational net limit accepted the fixed natural combination price. Real multi-leg execution and price are never guaranteed." };
  return { status: "working", fillDebit: undefined, cashAmount: undefined, messages: [], explanation: "The educational net limit is more demanding than the fixed natural combination price, so the order waits without a fill." };
}

function contractLabel(contract) {
  return `${contract.expiration} · ${contract.strike} · ${contract.right.toUpperCase()} · ${contract.bid.toFixed(2)} / ${contract.ask.toFixed(2)}`;
}

function formatSignedPrice(value) {
  return `${value >= 0 ? "Debit" : "Credit"} ${Math.abs(value).toFixed(2)}`;
}

function renderSteps(activeStep) {
  return `<ol class="workflow-steps">${OPTION_WORKFLOW_STEPS.map((step, index) => `<li class="${index <= activeStep ? "is-reached" : ""}"><button type="button" data-workflow-step="${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${step.label}</strong></button></li>`).join("")}</ol>`;
}

function renderCoach(step) {
  return `<aside class="workflow-coach"><p class="eyebrow">Step guidance</p><h2>${step.label}</h2><p>${step.purpose}</p><strong>Verify</strong><ul>${step.verify.map((item) => `<li>${item}</li>`).join("")}</ul><div><strong>Common mistake</strong><p>${step.mistake}</p></div></aside>`;
}

function renderBuilder(state) {
  const combo = calculateComboQuote(state.legs, state.quantity);
  return `<section class="ibkr-combo-lab"><div class="combo-chain"><div><p class="eyebrow">Fixed educational chain</p><h2>${OPTION_UNDERLYING.symbol} options · ${OPTION_UNDERLYING.price.toFixed(2)}</h2><p>Click Ask to add a buy leg or Bid to add a sell leg. This mirrors the interaction concept documented for IBKR Desktop without copying its interface.</p></div><div class="combo-chain__rows">${OPTION_CHAIN.filter((contract) => contract.expiration === "2026-09-18" && [220, 225, 230, 235].includes(contract.strike)).map((contract) => `<article><span>${contract.strike} ${contract.right.toUpperCase()}</span><button type="button" data-add-contract="${contract.id}" data-side="SELL">Bid ${contract.bid.toFixed(2)}<small>Sell</small></button><button type="button" data-add-contract="${contract.id}" data-side="BUY">Ask ${contract.ask.toFixed(2)}<small>Buy</small></button></article>`).join("")}</div></div><div class="combo-builder"><div><p class="eyebrow">Strategy Builder concept</p><h2>Selected legs</h2></div><div class="combo-legs">${state.legs.map((leg, index) => `<article><span>${leg.side}</span><strong>${contractLabel(leg.contract)}</strong><label>Ratio<input type="number" min="1" max="10" step="1" value="${leg.ratio}" data-leg-ratio="${index}"></label><button type="button" data-remove-combo-leg="${index}">Remove</button></article>`).join("")}</div><div class="combo-quote"><span>Natural <strong>${formatSignedPrice(combo.naturalDebit)}</strong></span><span>Midpoint <strong>${formatSignedPrice(combo.midDebit)}</strong></span><span>Natural cash <strong>${combo.naturalCash.toLocaleString("en-US", { style: "currency", currency: "USD" })}</strong></span></div><form class="combo-ticket" data-combo-ticket><label>Combo quantity<input name="quantity" type="number" min="1" step="1" value="${state.quantity}"></label><label>Signed net limit<input name="limitDebit" type="number" step="0.01" value="${state.limitDebit}"><small>Positive debit · negative credit</small></label><label>Time in force<select name="timeInForce"><option>DAY</option><option>GTC</option></select></label><button class="button button--primary" type="submit">Preview educational order</button></form>${state.result ? `<section class="combo-result combo-result--${state.result.status}" aria-live="polite"><strong>${state.result.status}</strong><p>${state.result.explanation}</p>${state.result.messages?.length ? `<ul>${state.result.messages.map((message) => `<li>${message}</li>`).join("")}</ul>` : ""}</section>` : ""}</div></section>`;
}

function renderManagement() {
  return `<section class="position-management"><header><p class="eyebrow">After the fill</p><h2>A named strategy is still a set of positions</h2><p>Management actions change contracts and obligations. Compare the resulting position, not just the button label.</p></header><div>${POSITION_MANAGEMENT_ACTIONS.map((action) => `<article><span>${action.title}</span><p>${action.effect}</p><dl><div><dt>Verify</dt><dd>${action.verify}</dd></div><div><dt>Risk</dt><dd>${action.risk}</dd></div></dl></article>`).join("")}</div><aside><strong>Position review</strong><ul><li>Open orders and partial fills</li><li>Current quantities and average prices</li><li>Expiration, assignment, and exercise state</li><li>Buying power, cash, and resulting underlying exposure</li><li>Closing liquidity for every leg</li></ul></aside></section>`;
}

export function renderOptionsWorkflow(container, { storage } = {}) {
  const defaultLong = OPTION_CHAIN.find((contract) => contract.expiration === "2026-09-18" && contract.strike === 225 && contract.right === "call");
  const defaultShort = OPTION_CHAIN.find((contract) => contract.expiration === "2026-09-18" && contract.strike === 230 && contract.right === "call");
  let state = { activeStep: 0, legs: [{ contract: defaultLong, side: "BUY", ratio: 1 }, { contract: defaultShort, side: "SELL", ratio: 1 }], quantity: 1, limitDebit: 3.4, result: undefined };
  const render = () => {
    const step = OPTION_WORKFLOW_STEPS[state.activeStep];
    container.innerHTML = `<article class="options-workflow-page"><header class="simulator-intro"><div><p class="eyebrow">Phase 10 · IBKR options workflow</p><h1>From underlying to managed position</h1><p>A guided, independent reconstruction of the verification sequence around IBKR Desktop’s Option Chain and Strategy Builder concepts.</p></div><span class="simulation-badge">SIMULATED · NO BROKER CONNECTION</span></header>${renderSteps(state.activeStep)}<div class="workflow-learning-grid">${renderCoach(step)}<section class="workflow-detail"><span>Current focus</span><h2>${step.label}</h2><p>${step.purpose}</p><button type="button" data-next-workflow>${state.activeStep === OPTION_WORKFLOW_STEPS.length - 1 ? "Restart guided workflow" : "Complete step and continue"}</button></section></div>${renderBuilder(state)}${renderManagement()}<section class="desktop-source-note"><strong>Official reference</strong><p>Workflow concepts verified 2026-08-11. Current IBKR Desktop documentation says Option Chain access, display choices, bid/ask selection, and Strategy Builder behavior can evolve with releases.</p><a href="https://www.ibkrguides.com/ibkrdesktop/option-chain.htm" target="_blank" rel="noreferrer">IBKR Desktop Option Chain guide</a></section></article>`;
  };
  const handleClick = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.workflowStep !== undefined) state.activeStep = Number(button.dataset.workflowStep);
    else if (button.hasAttribute("data-next-workflow")) state.activeStep = state.activeStep === OPTION_WORKFLOW_STEPS.length - 1 ? 0 : state.activeStep + 1;
    else if (button.dataset.addContract) {
      const contract = OPTION_CHAIN.find((item) => item.id === button.dataset.addContract);
      if (state.legs.length < 4 && !state.legs.some((leg) => leg.contract.id === contract.id && leg.side === button.dataset.side)) state.legs = [...state.legs, { contract, side: button.dataset.side, ratio: 1 }];
    } else if (button.dataset.removeComboLeg !== undefined && state.legs.length > 1) state.legs = state.legs.filter((_, index) => index !== Number(button.dataset.removeComboLeg));
    else return;
    state.result = undefined;
    render();
  };
  const handleChange = (event) => {
    if (event.target.dataset.legRatio === undefined) return;
    const index = Number(event.target.dataset.legRatio);
    state.legs = state.legs.map((leg, legIndex) => legIndex === index ? { ...leg, ratio: Math.max(1, Math.trunc(Number(event.target.value))) } : leg);
    state.result = undefined;
    render();
  };
  const handleSubmit = (event) => {
    if (!event.target.matches("[data-combo-ticket]")) return;
    event.preventDefault();
    const data = new FormData(event.target);
    state.quantity = Math.max(1, Math.trunc(Number(data.get("quantity"))));
    state.limitDebit = Number(data.get("limitDebit"));
    state.result = simulateComboLimit({ legs: state.legs, quantity: state.quantity, limitDebit: state.limitDebit });
    storage.set("simulatorHistory", [{ id: `combo-${Date.now()}`, kind: "option-combo", createdAt: new Date().toISOString(), legs: state.legs.map((leg) => ({ contractId: leg.contract.id, side: leg.side, ratio: leg.ratio })), quantity: state.quantity, limitDebit: state.limitDebit, result: state.result }, ...storage.get("simulatorHistory")].slice(0, 50));
    render();
  };
  container.addEventListener("click", handleClick);
  container.addEventListener("change", handleChange);
  container.addEventListener("submit", handleSubmit);
  render();
  return () => { container.removeEventListener("click", handleClick); container.removeEventListener("change", handleChange); container.removeEventListener("submit", handleSubmit); };
}

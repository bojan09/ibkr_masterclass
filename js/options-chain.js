import { OPTION_CHAIN, OPTION_CHAIN_COLUMNS, OPTION_EXPIRATIONS, OPTION_UNDERLYING } from "../data/simulated-options-data.js";

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateOptionMid({ bid, ask }) {
  return round((bid + ask) / 2);
}

export function classifyMoneyness({ right, strike, underlyingPrice }) {
  if (Math.abs(strike - underlyingPrice) < 0.005) return "ATM";
  if (right === "call") return strike < underlyingPrice ? "ITM" : "OTM";
  return strike > underlyingPrice ? "ITM" : "OTM";
}

export function filterOptionChain(chain, { expiration, right = "both", centerStrike, strikeRange = Infinity } = {}) {
  return chain.filter((contract) =>
    (!expiration || contract.expiration === expiration) &&
    (right === "both" || contract.right === right) &&
    (centerStrike === undefined || Math.abs(contract.strike - centerStrike) <= strikeRange),
  );
}

export function assessOptionLiquidity({ bid, ask, volume, openInterest }) {
  const mid = calculateOptionMid({ bid, ask });
  const relativeSpread = mid > 0 ? (ask - bid) / mid : Infinity;
  let level = "mixed";
  if (relativeSpread <= 0.06 && volume >= 500 && openInterest >= 1000) level = "stronger";
  else if (relativeSpread > 0.2 || volume < 20 || openInterest < 50) level = "weaker";
  return {
    level,
    relativeSpread: round(relativeSpread * 100, 1),
    explanation: `These displayed spread, volume, and open-interest signals look ${level}, but they do not guarantee an execution, price, or available size.`,
  };
}

function formatValue(contract, column) {
  if (["bid", "ask", "last"].includes(column.id)) return contract[column.id].toFixed(2);
  if (column.id === "impliedVolatility") return `${(contract.impliedVolatility * 100).toFixed(1)}%`;
  return contract[column.id].toLocaleString("en-US");
}

function renderContractDetails(contract) {
  const liquidity = assessOptionLiquidity(contract);
  const moneyness = classifyMoneyness({ ...contract, underlyingPrice: OPTION_UNDERLYING.price });
  return `<aside class="chain-details" aria-live="polite"><div><p class="eyebrow">Selected contract</p><h2>${contract.symbol} ${contract.expiration} ${contract.strike} ${contract.right === "call" ? "Call" : "Put"}</h2><span class="simulation-badge">SIMULATED</span></div><dl><div><dt>Identity</dt><dd>${contract.exchange} · ${contract.currency} · multiplier ${contract.multiplier}</dd></div><div><dt>Moneyness</dt><dd>${moneyness} at underlying ${OPTION_UNDERLYING.price.toFixed(2)}</dd></div><div><dt>Bid / Ask</dt><dd>${contract.bid.toFixed(2)} / ${contract.ask.toFixed(2)} · midpoint ${calculateOptionMid(contract).toFixed(2)}</dd></div><div><dt>Session volume</dt><dd>${contract.volume.toLocaleString("en-US")} simulated contracts</dd></div><div><dt>Open interest</dt><dd>${contract.openInterest.toLocaleString("en-US")} simulated outstanding contracts</dd></div><div><dt>IV / Delta</dt><dd>${(contract.impliedVolatility * 100).toFixed(1)}% / ${contract.delta.toFixed(2)} model estimates</dd></div></dl><section class="liquidity-read liquidity-read--${liquidity.level}"><strong>${liquidity.level} displayed signals</strong><p>${liquidity.explanation}</p><span>Relative spread ${liquidity.relativeSpread}%</span></section><div class="contract-verify"><strong>Verify before order construction</strong><ul><li>Underlying and asset class</li><li>Expiration</li><li>Strike and right</li><li>Multiplier and currency</li><li>Bid/ask and quote status</li><li>Position side and quantity</li></ul></div></aside>`;
}

export function renderOptionsChain(container, { initialRight = "both" } = {}) {
  let state = { expiration: OPTION_EXPIRATIONS[0], right: initialRight, centerStrike: 225, strikeRange: 15, selectedId: OPTION_CHAIN.find((contract) => contract.expiration === OPTION_EXPIRATIONS[0] && contract.strike === 225 && contract.right === "call").id };
  const render = () => {
    const contracts = filterOptionChain(OPTION_CHAIN, state);
    const selected = OPTION_CHAIN.find((contract) => contract.id === state.selectedId) ?? contracts[0];
    container.innerHTML = `<article class="options-chain-page"><header class="simulator-intro"><div><p class="eyebrow">Phase 7 · Options chain mastery</p><h1>Read the contract before the premium</h1><p>Filter a fixed educational chain, inspect identity and liquidity signals, and distinguish session volume from open interest.</p></div><span class="simulation-badge">SIMULATED AAPL · ${OPTION_UNDERLYING.price.toFixed(2)}</span></header><section class="chain-controls"><form data-chain-filters><label>Expiration<select name="expiration">${OPTION_EXPIRATIONS.map((expiration) => `<option ${state.expiration === expiration ? "selected" : ""}>${expiration}</option>`).join("")}</select></label><label>Right<select name="right"><option value="both" ${state.right === "both" ? "selected" : ""}>Calls & puts</option><option value="call" ${state.right === "call" ? "selected" : ""}>Calls</option><option value="put" ${state.right === "put" ? "selected" : ""}>Puts</option></select></label><label>Center strike<input type="number" name="centerStrike" min="1" step="5" value="${state.centerStrike}"></label><label>Distance<select name="strikeRange"><option value="5" ${state.strikeRange === 5 ? "selected" : ""}>± 5</option><option value="10" ${state.strikeRange === 10 ? "selected" : ""}>± 10</option><option value="15" ${state.strikeRange === 15 ? "selected" : ""}>± 15</option></select></label></form><p>As of ${OPTION_UNDERLYING.asOf.slice(0, 10)} · fixed educational snapshot · no live connection</p></section><div class="chain-workspace"><section class="chain-table-panel"><div class="sim-table-wrap"><table class="sim-table option-chain-table"><caption>${contracts.length} simulated contracts</caption><thead><tr><th>Contract</th><th>Strike</th><th>Right</th><th>Moneyness</th>${OPTION_CHAIN_COLUMNS.map((column) => `<th title="${column.explanation}">${column.label}</th>`).join("")}</tr></thead><tbody>${contracts.map((contract) => `<tr class="${contract.id === selected?.id ? "is-selected" : ""}"><th><button type="button" data-option-contract="${contract.id}">${contract.symbol}<small>${contract.expiration}</small></button></th><td>${contract.strike.toFixed(2)}</td><td>${contract.right.toUpperCase()}</td><td>${classifyMoneyness({ ...contract, underlyingPrice: OPTION_UNDERLYING.price })}</td>${OPTION_CHAIN_COLUMNS.map((column) => `<td class="tabular">${formatValue(contract, column)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><div class="chain-column-guide">${OPTION_CHAIN_COLUMNS.map((column) => `<details><summary>${column.label}</summary><p>${column.explanation}</p></details>`).join("")}</div></section>${selected ? renderContractDetails(selected) : ""}</div><section class="volume-oi-lesson"><article><span>Today’s activity</span><h2>Volume</h2><p>Volume counts simulated contracts traded during this session. One trade may open, close, or transfer positions; volume does not reveal intent and does not guarantee the displayed market can absorb another order.</p></article><article><span>Outstanding contracts</span><h2>Open interest</h2><p>Open interest represents simulated outstanding contracts from a prior reporting cycle. It is not a live count, not today’s volume, and not a guarantee of tight spreads or execution.</p></article><article><span>Immediate friction</span><h2>Bid / ask spread</h2><p>The spread is visible price friction now. Evaluate it with quote status, displayed size, contract activity, and order behavior instead of relying on any single liquidity number.</p></article></section></article>`;
  };
  const handleChange = (event) => {
    const form = event.target.closest("[data-chain-filters]");
    if (!form) return;
    const data = new FormData(form);
    state = { ...state, expiration: data.get("expiration"), right: data.get("right"), centerStrike: Number(data.get("centerStrike")), strikeRange: Number(data.get("strikeRange")) };
    const filtered = filterOptionChain(OPTION_CHAIN, state);
    if (!filtered.some((contract) => contract.id === state.selectedId)) state.selectedId = filtered[0]?.id;
    render();
  };
  const handleClick = (event) => {
    const id = event.target.closest("[data-option-contract]")?.dataset.optionContract;
    if (!id) return;
    state.selectedId = id;
    render();
  };
  container.addEventListener("change", handleChange);
  container.addEventListener("click", handleClick);
  render();
  return () => { container.removeEventListener("change", handleChange); container.removeEventListener("click", handleClick); };
}

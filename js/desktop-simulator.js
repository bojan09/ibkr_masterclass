import {
  CONTRACTS,
  CONTRACT_CHECKLIST,
  DESKTOP_TOUR_STEPS,
  MARKET_COLUMNS,
  PORTFOLIO_POSITIONS,
  SIMULATED_QUOTES,
  SIMULATION_AS_OF,
  getSimulatedQuote,
} from "../data/simulated-market-data.js";

const DEFAULT_WATCHLIST = ["SPY", "QQQ", "AAPL", "MSFT", "NVDA"];
const DEFAULT_COLUMNS = ["last", "bid", "ask", "change", "changePercent", "volume"];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeSymbols(symbols) {
  return symbols.filter((symbol) => getSimulatedQuote(symbol));
}

export function addWatchlistSymbol(symbols, symbol) {
  const normalized = String(symbol).trim().toUpperCase();
  return !getSimulatedQuote(normalized) || symbols.includes(normalized) ? [...symbols] : [...symbols, normalized];
}

export function removeWatchlistSymbol(symbols, symbol) {
  return symbols.filter((candidate) => candidate !== symbol);
}

export function moveWatchlistSymbol(symbols, symbol, offset) {
  const result = [...symbols];
  const from = result.indexOf(symbol);
  const to = Math.max(0, Math.min(result.length - 1, from + offset));
  if (from < 0 || from === to) return result;
  [result[from], result[to]] = [result[to], result[from]];
  return result;
}

function quoteValue(quote, key) {
  if (key === "changePercent") return quote.change / (quote.last - quote.change);
  return quote[key] ?? 0;
}

export function sortWatchlist(symbols, key, direction = "asc") {
  const factor = direction === "desc" ? -1 : 1;
  return [...symbols].sort((left, right) => {
    const a = getSimulatedQuote(left);
    const b = getSimulatedQuote(right);
    const aValue = key === "symbol" ? left : quoteValue(a, key);
    const bValue = key === "symbol" ? right : quoteValue(b, key);
    return (typeof aValue === "string" ? aValue.localeCompare(bValue) : aValue - bValue) * factor;
  });
}

export function searchContracts(query) {
  const normalized = String(query).trim().toLowerCase();
  if (!normalized) return [];
  return CONTRACTS.filter((contract) =>
    [contract.symbol, contract.description, contract.assetClass, contract.exchange, contract.currency]
      .some((value) => String(value).toLowerCase().includes(normalized)),
  );
}

export function derivePortfolioRows(positions) {
  return positions.map((position) => {
    const quote = getSimulatedQuote(position.symbol);
    const marketValue = position.quantity * quote.last;
    const unrealizedPnl = position.quantity * (quote.last - position.averageCost);
    return { ...position, last: quote.last, marketValue, unrealizedPnl };
  });
}

function formatPrice(value) {
  return Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatColumn(quote, id) {
  if (["last", "bid", "ask", "change"].includes(id)) return formatPrice(quote[id]);
  if (id === "changePercent") return `${((quote.change / (quote.last - quote.change)) * 100).toFixed(2)}%`;
  if (id === "volume") return quote.volume.toLocaleString("en-US");
  if (id === "range") return `${formatPrice(quote.low)}–${formatPrice(quote.high)}`;
  return "—";
}

function renderWatchlist(state) {
  const columns = MARKET_COLUMNS.filter((column) => state.columns.includes(column.id));
  return `
    <section class="sim-panel sim-panel--watchlist" data-hotspot="watchlist" aria-labelledby="watchlist-title">
      <div class="sim-panel__header">
        <div><p class="sim-label">Monitor</p><h2 id="watchlist-title">Learning watchlist</h2></div>
        <button class="sim-icon-button" type="button" data-action="toggle-columns" aria-expanded="false" title="Customize and explain columns">Columns</button>
      </div>
      <form class="sim-add-symbol" data-watchlist-form>
        <label class="sr-only" for="watchlist-symbol">Add simulated symbol</label>
        <input id="watchlist-symbol" name="symbol" placeholder="Add SPY, AMD, META…" autocomplete="off">
        <button type="submit">Add</button>
      </form>
      <div class="sim-column-picker" data-column-picker hidden>
        <p>Visible columns</p>
        ${MARKET_COLUMNS.map((column) => `<label><input type="checkbox" name="column" value="${column.id}" ${state.columns.includes(column.id) ? "checked" : ""}> ${column.label}<small>${column.explanation}</small></label>`).join("")}
      </div>
      <div class="sim-table-wrap">
        <table class="sim-table">
          <thead><tr><th><button type="button" data-sort="symbol">Symbol</button></th>${columns.map((column) => `<th><button type="button" data-sort="${column.id}" title="${escapeHtml(column.explanation)}">${column.label}</button></th>`).join("")}<th><span class="sr-only">Reorder and remove</span></th></tr></thead>
          <tbody>${state.watchlist.map((symbol, index) => {
            const quote = getSimulatedQuote(symbol);
            return `<tr class="${state.selectedSymbol === symbol ? "is-selected" : ""}">
              <th><button class="sim-symbol" type="button" data-select-symbol="${symbol}">${symbol}<small>${quote.assetClass}</small></button></th>
              ${columns.map((column) => `<td class="tabular ${column.id === "change" || column.id === "changePercent" ? (quote.change >= 0 ? "is-positive" : "is-negative") : ""}">${formatColumn(quote, column.id)}</td>`).join("")}
              <td class="sim-row-actions"><button type="button" data-move="up" data-symbol="${symbol}" ${index === 0 ? "disabled" : ""} aria-label="Move ${symbol} up">↑</button><button type="button" data-move="down" data-symbol="${symbol}" ${index === state.watchlist.length - 1 ? "disabled" : ""} aria-label="Move ${symbol} down">↓</button><button type="button" data-remove-symbol="${symbol}" aria-label="Remove ${symbol}">×</button></td>
            </tr>`;
          }).join("")}</tbody>
        </table>
      </div>
    </section>`;
}

function renderMiniChart(quote) {
  const points = quote.change >= 0 ? "0,74 30,57 60,62 90,38 120,44 150,20 180,28 220,8" : "0,12 30,26 60,20 90,48 120,37 150,65 180,55 220,76";
  return `<svg class="sim-chart" viewBox="0 0 220 84" role="img" aria-label="Simulated intraday line for ${quote.symbol}"><polyline points="${points}"></polyline></svg>`;
}

function renderInstrument(state) {
  const quote = getSimulatedQuote(state.selectedSymbol) ?? SIMULATED_QUOTES[0];
  const spread = quote.ask - quote.bid;
  return `
    <section class="sim-panel sim-panel--instrument" data-hotspot="instrument" aria-labelledby="instrument-title">
      <div class="sim-panel__header">
        <div><p class="sim-label">${quote.assetClass} · ${quote.exchange} · ${quote.currency}</p><h2 id="instrument-title">${quote.symbol} <span>${quote.name}</span></h2></div>
        <strong class="sim-price tabular">${formatPrice(quote.last)} <small class="${quote.change >= 0 ? "is-positive" : "is-negative"}">${quote.change >= 0 ? "+" : ""}${formatPrice(quote.change)}</small></strong>
      </div>
      <div class="sim-quote-strip"><span>Bid <strong>${formatPrice(quote.bid)}</strong></span><span>Ask <strong>${formatPrice(quote.ask)}</strong></span><span>Spread <strong>${spread.toFixed(2)}</strong></span><span>Range <strong>${formatPrice(quote.low)}–${formatPrice(quote.high)}</strong></span></div>
      <div data-hotspot="chart">${renderMiniChart(quote)}<p class="sim-caption">Simulated intraday illustration · not a prediction</p></div>
      <div class="sim-instrument-actions"><button type="button" data-action="show-ticket" data-hotspot="order-ticket">Open educational ticket</button><button type="button" data-action="show-search">Verify another contract</button></div>
    </section>`;
}

function renderPortfolio() {
  const rows = derivePortfolioRows(PORTFOLIO_POSITIONS);
  return `
    <section class="sim-panel sim-panel--portfolio" data-hotspot="portfolio" aria-labelledby="portfolio-title">
      <div class="sim-panel__header"><div><p class="sim-label">Account monitor</p><h2 id="portfolio-title">Simulated portfolio</h2></div><span class="sim-state">Educational positions</span></div>
      <div class="sim-table-wrap"><table class="sim-table"><thead><tr><th>Symbol</th><th>Qty</th><th>Average cost</th><th>Last</th><th>Market value</th><th>Unrealized P&amp;L</th></tr></thead><tbody>
        ${rows.map((row) => `<tr><th>${row.symbol}</th><td>${row.quantity}</td><td>${formatPrice(row.averageCost)}</td><td>${formatPrice(row.last)}</td><td>${formatPrice(row.marketValue)}</td><td class="${row.unrealizedPnl >= 0 ? "is-positive" : "is-negative"}">${formatPrice(row.unrealizedPnl)}</td></tr>`).join("")}
      </tbody></table></div>
      <p class="sim-caption">Unrealized P&amp;L = quantity × (last − average cost). Short quantities reverse the direction.</p>
    </section>`;
}

function renderSearch(state) {
  const results = searchContracts(state.searchQuery);
  return `<section class="sim-panel sim-panel--search" data-hotspot="search" aria-labelledby="contract-search-title">
    <div class="sim-panel__header"><div><p class="sim-label">Contract identity</p><h2 id="contract-search-title">Contract search</h2></div></div>
    <form class="sim-search" data-contract-search><label for="contract-query">Symbol, company, venue, or currency</label><div><input id="contract-query" name="query" value="${escapeHtml(state.searchQuery)}" placeholder="Try AAPL"><button type="submit">Search</button></div></form>
    <div class="sim-search-results">${state.searchQuery && !results.length ? `<p>No simulated contracts match “${escapeHtml(state.searchQuery)}”.</p>` : results.map((contract) => `<button type="button" data-contract-id="${contract.id}"><strong>${contract.description}</strong><span>${contract.assetClass} · ${contract.exchange} · ${contract.currency} · Multiplier ${contract.multiplier}</span></button>`).join("")}</div>
    <div class="contract-checklist"><p class="sim-label">Contract verification checklist</p><ul>${CONTRACT_CHECKLIST.map((item) => `<li>${item}</li>`).join("")}</ul></div>
  </section>`;
}

function renderTour(state) {
  const step = DESKTOP_TOUR_STEPS[state.tourStep];
  return `<aside class="tour-coach" aria-live="polite" aria-labelledby="tour-step-title">
    <div class="tour-coach__progress"><span>Guided tour</span><strong>${state.tourStep + 1} / ${DESKTOP_TOUR_STEPS.length}</strong></div>
    <h2 id="tour-step-title">${step.label}</h2>
    <dl><div><dt>What is this?</dt><dd>${step.what}</dd></div><div><dt>Why it matters</dt><dd>${step.why}</dd></div><div><dt>Common mistake</dt><dd>${step.mistake}</dd></div><div><dt>Best practice</dt><dd>${step.bestPractice}</dd></div></dl>
    <div class="tour-coach__actions"><button type="button" data-tour="previous" ${state.tourStep === 0 ? "disabled" : ""}>Previous</button><button type="button" data-tour="next">${state.tourStep === DESKTOP_TOUR_STEPS.length - 1 ? "Finish tour" : "Next"}</button></div>
  </aside>`;
}

function initialState(storage, initialMode) {
  const saved = storage.get("simulatorState");
  return {
    watchlist: normalizeSymbols(saved.desktopWatchlist ?? DEFAULT_WATCHLIST),
    columns: saved.desktopColumns?.filter((id) => MARKET_COLUMNS.some((column) => column.id === id)) ?? DEFAULT_COLUMNS,
    selectedSymbol: getSimulatedQuote(saved.desktopSelectedSymbol) ? saved.desktopSelectedSymbol : "AAPL",
    sortKey: "symbol",
    sortDirection: "asc",
    searchQuery: initialMode === "search" ? "AAPL" : "",
    mode: initialMode,
    tourStep: 0,
    showTour: initialMode === "tour",
    showColumns: false,
  };
}

export function renderDesktopSimulator(container, { storage, initialMode = "workspace" } = {}) {
  let state = initialState(storage, initialMode);

  const persist = () => storage.set("simulatorState", {
    ...storage.get("simulatorState"),
    desktopWatchlist: state.watchlist,
    desktopColumns: state.columns,
    desktopSelectedSymbol: state.selectedSymbol,
  });

  const render = () => {
    container.innerHTML = `<section class="desktop-learning-page">
      <header class="simulator-intro"><div><p class="eyebrow">Phase 4 · IBKR Desktop mastery</p><h1>Desktop training workspace</h1><p>An independent educational reconstruction for learning workflow and contract verification. It is not connected to Interactive Brokers.</p></div><span class="simulation-badge">SIMULATED DATA · ${SIMULATION_AS_OF.slice(0, 10)}</span></header>
      <div class="desktop-simulator" data-tour-root>
        <header class="desktop-simulator__bar"><strong>IBKR Masterclass Desktop Lab</strong><button type="button" data-action="show-search" data-hotspot="search">Search contracts</button><span>Paper learning mode</span></header>
        <div class="desktop-simulator__body">
          <nav class="desktop-simulator__rail" aria-label="Simulator sections">
            <button type="button" data-view="workspace" class="${state.mode === "workspace" ? "is-active" : ""}">Home</button>
            <button type="button" data-view="watchlist" class="${state.mode === "watchlist" ? "is-active" : ""}" data-hotspot="watchlist">Watchlist</button>
            <button type="button" data-view="instrument" class="${state.mode === "instrument" ? "is-active" : ""}" data-hotspot="instrument">Instrument</button>
            <button type="button" data-view="portfolio" class="${state.mode === "portfolio" ? "is-active" : ""}" data-hotspot="portfolio">Portfolio</button>
            <button type="button" data-view="orders" data-hotspot="orders">Orders</button>
            <button type="button" data-view="options" data-hotspot="option-chain">Options</button>
          </nav>
          <main class="desktop-simulator__workspace">
            ${state.mode === "search" ? renderSearch(state) : state.mode === "portfolio" ? renderPortfolio() : state.mode === "instrument" ? renderInstrument(state) : `<div class="sim-workspace-grid">${renderWatchlist(state)}${renderInstrument(state)}</div>${renderPortfolio()}`}
          </main>
        </div>
        ${state.showTour ? renderTour(state) : ""}
      </div>
      <section class="desktop-source-note"><strong>Accuracy boundary</strong><p>Platform concepts were verified against official IBKR Desktop materials on 2026-08-11. Menus and supported features can change; use the current official guide for production actions.</p><a href="https://www.ibkrguides.com/ibkrdesktop/" target="_blank" rel="noreferrer">Open official IBKR Desktop guide</a></section>
    </section>`;

    if (state.showColumns) container.querySelector("[data-column-picker]")?.removeAttribute("hidden");
    const activeStep = state.showTour ? DESKTOP_TOUR_STEPS[state.tourStep] : undefined;
    container.querySelectorAll(".is-tour-target").forEach((element) => element.classList.remove("is-tour-target"));
    if (activeStep) container.querySelector(`[data-hotspot="${activeStep.id}"]`)?.classList.add("is-tour-target");
  };

  const handleSubmit = (event) => {
    if (event.target.matches("[data-watchlist-form]")) {
      event.preventDefault();
      const next = addWatchlistSymbol(state.watchlist, new FormData(event.target).get("symbol"));
      state.watchlist = next;
      persist();
      render();
    } else if (event.target.matches("[data-contract-search]")) {
      event.preventDefault();
      state.searchQuery = String(new FormData(event.target).get("query") ?? "");
      render();
    }
  };

  const handleChange = (event) => {
    if (event.target.name !== "column") return;
    state.columns = event.target.checked
      ? [...new Set([...state.columns, event.target.value])]
      : state.columns.filter((id) => id !== event.target.value);
    state.showColumns = true;
    persist();
    render();
  };

  const handleClick = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.view) {
      if (button.dataset.view === "orders" || button.dataset.view === "options") {
        state.showTour = true;
        state.tourStep = DESKTOP_TOUR_STEPS.findIndex((step) => step.id === (button.dataset.view === "orders" ? "orders" : "option-chain"));
      } else state.mode = button.dataset.view;
    } else if (button.dataset.action === "show-search") {
      state.mode = "search";
      state.searchQuery ||= "AAPL";
    } else if (button.dataset.action === "show-ticket") {
      state.showTour = true;
      state.tourStep = DESKTOP_TOUR_STEPS.findIndex((step) => step.id === "order-ticket");
    } else if (button.dataset.action === "toggle-columns") {
      state.showColumns = !state.showColumns;
    } else if (button.dataset.selectSymbol) {
      state.selectedSymbol = button.dataset.selectSymbol;
      state.mode = "instrument";
      persist();
    } else if (button.dataset.removeSymbol) {
      state.watchlist = removeWatchlistSymbol(state.watchlist, button.dataset.removeSymbol);
      persist();
    } else if (button.dataset.move) {
      state.watchlist = moveWatchlistSymbol(state.watchlist, button.dataset.symbol, button.dataset.move === "up" ? -1 : 1);
      persist();
    } else if (button.dataset.sort) {
      state.sortDirection = state.sortKey === button.dataset.sort && state.sortDirection === "asc" ? "desc" : "asc";
      state.sortKey = button.dataset.sort;
      state.watchlist = sortWatchlist(state.watchlist, state.sortKey, state.sortDirection);
    } else if (button.dataset.contractId) {
      const contract = CONTRACTS.find((candidate) => candidate.id === button.dataset.contractId);
      if (getSimulatedQuote(contract?.symbol)) {
        state.selectedSymbol = contract.symbol;
        state.mode = "instrument";
        persist();
      }
    } else if (button.dataset.tour === "previous") {
      state.tourStep = Math.max(0, state.tourStep - 1);
    } else if (button.dataset.tour === "next") {
      if (state.tourStep === DESKTOP_TOUR_STEPS.length - 1) state.showTour = false;
      else state.tourStep += 1;
    } else return;
    render();
  };

  container.addEventListener("submit", handleSubmit);
  container.addEventListener("change", handleChange);
  container.addEventListener("click", handleClick);
  render();

  return () => {
    container.removeEventListener("submit", handleSubmit);
    container.removeEventListener("change", handleChange);
    container.removeEventListener("click", handleClick);
  };
}

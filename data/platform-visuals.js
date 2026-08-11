import { getWorkflow } from "./platform-workflows.js";

const REVIEWED_AT = "2026-08-11";
const DESKTOP_GUIDE_UPDATED = "2025-10-07";
const DESKTOP_STRATEGY_UPDATED = "2025-12-18";
const TWS_GUIDE_UPDATED = "2025-10-08";

export const ALLOWED_VISUAL_HOSTS = Object.freeze([
  "interactivebrokers.com",
  "www.interactivebrokers.com",
  "ibkrguides.com",
  "www.ibkrguides.com",
]);

export function isAllowedOfficialVisualUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_VISUAL_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

function hasDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

function freezeStepLinks(stepLinks = {}) {
  return Object.freeze(Object.fromEntries(Object.entries(stepLinks).map(([workflowId, link]) => [
    workflowId,
    Object.freeze({ steps: Object.freeze([...link.steps]), caption: link.caption }),
  ])));
}

function hasValidStepLinks(visual) {
  if (!visual.stepLinks || Object.keys(visual.stepLinks).length !== visual.missionIds.length) return false;
  return visual.missionIds.every((missionId) => {
    const workflow = getWorkflow(missionId);
    const link = visual.stepLinks[missionId];
    return workflow && link
      && typeof link.caption === "string" && link.caption.trim().length >= 20
      && Array.isArray(link.steps) && link.steps.length > 0
      && link.steps.every((step) => Number.isInteger(step) && step >= 1 && step <= workflow.steps.length);
  });
}

export function validatePlatformVisual(visual) {
  if (!visual || typeof visual !== "object") return false;
  const requiredStrings = ["id", "platformId", "title", "alt", "imageUrl", "sourceUrl", "sourceLabel", "sourceUpdated", "reviewedAt", "productVersionNote"];
  if (!requiredStrings.every((key) => typeof visual[key] === "string" && visual[key].trim())) return false;
  if (!isAllowedOfficialVisualUrl(visual.imageUrl) || !isAllowedOfficialVisualUrl(visual.sourceUrl)) return false;
  if (!hasDate(visual.sourceUpdated) || !hasDate(visual.reviewedAt) || visual.alt.length < 30) return false;
  if (!Array.isArray(visual.missionIds) || !visual.missionIds.length || !Array.isArray(visual.callouts)) return false;
  if (!visual.missionIds.every((missionId) => getWorkflow(missionId)?.platformId === visual.platformId)) return false;
  if (!hasValidStepLinks(visual)) return false;
  const calloutIds = visual.callouts.map(({ id }) => id);
  return new Set(calloutIds).size === calloutIds.length && visual.callouts.every(({ id, label, x, y }) => (
    typeof id === "string" && id.length > 0
    && typeof label === "string" && label.length > 0
    && Number.isFinite(x) && x >= 0 && x <= 100
    && Number.isFinite(y) && y >= 0 && y <= 100
  ));
}

function guideVisual({ id, platformId, missionIds, stepLinks, title, alt, sourceUrl, imagePath, sourceLabel, sourceUpdated, productVersionNote, callouts = [] }) {
  return {
    id,
    platformId,
    missionIds,
    stepLinks: freezeStepLinks(stepLinks),
    title,
    alt,
    imageUrl: new URL(imagePath, sourceUrl).href,
    sourceUrl,
    sourceLabel,
    sourceUpdated,
    reviewedAt: REVIEWED_AT,
    productVersionNote,
    callouts,
  };
}

const RAW_VISUALS = [
  guideVisual({
    id: "desktop-interface-portfolio",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-install", "desktop-paper-check", "desktop-interface"],
    stepLinks: {
      "desktop-install": { steps: [3], caption: "Use the full workspace to distinguish IBKR Desktop from the denser TWS interface." },
      "desktop-paper-check": { steps: [3], caption: "Recognize the workspace first, then verify Paper Trading independently in the genuine session." },
      "desktop-interface": { steps: [1, 2, 3], caption: "Orient yourself to the main workspace, navigation rail, tabs, and activity areas." },
    },
    title: "IBKR Desktop main workspace",
    alt: "Official IBKR Desktop screenshot showing the Portfolio workspace, left navigation, tabs, and account summary region.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/see-positions.htm",
    imagePath: "resources/images/portfolio.png",
    sourceLabel: "IBKR Desktop User Guide — View Positions",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Use this overview to identify IBKR Desktop. The screenshot does not prove that your connected session is Paper Trading.",
    callouts: [
      { id: "desktop-left-navigation", label: "Left Navigation panel", x: 3, y: 35 },
      { id: "desktop-portfolio-tabs", label: "Portfolio workspace tabs", x: 34, y: 15 },
    ],
  }),
  guideVisual({
    id: "desktop-portfolio-positions",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-interface", "desktop-portfolio", "desktop-position-review"],
    stepLinks: {
      "desktop-interface": { steps: [1, 3], caption: "Use the Portfolio view to recognize the main content region and its account-context tabs." },
      "desktop-portfolio": { steps: [1, 2], caption: "Match the Portfolio table and its controls before interpreting any account-specific values." },
      "desktop-position-review": { steps: [1, 2], caption: "Locate the filled paper position and compare its displayed quantity and cost fields." },
    },
    title: "Portfolio and Positions",
    alt: "Official IBKR Desktop Portfolio screenshot showing position rows and portfolio controls in the main workspace.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/see-positions.htm",
    imagePath: "resources/images/portfolioview.png",
    sourceLabel: "IBKR Desktop User Guide — View Positions",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Columns and values depend on account state, permissions, and the selected view.",
    callouts: [
      { id: "desktop-position-table", label: "Positions table", x: 48, y: 50 },
    ],
  }),
  guideVisual({
    id: "desktop-balances",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-portfolio", "desktop-position-review"],
    stepLinks: {
      "desktop-portfolio": { steps: [3], caption: "Use the Balances tab to separate account totals from position and order information." },
      "desktop-position-review": { steps: [3], caption: "Compare the Balances view with the position and execution records without treating estimates as cash." },
    },
    title: "Portfolio Balances tab",
    alt: "Official IBKR Desktop screenshot showing the Balances tab within the Portfolio workspace.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/see-positions.htm",
    imagePath: "resources/images/balances.png",
    sourceLabel: "IBKR Desktop User Guide — View Positions",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Displayed balances are account-specific; use the screenshot only to recognize the screen structure.",
    callouts: [
      { id: "desktop-balances-tab", label: "Balances tab", x: 52, y: 13 },
    ],
  }),
  guideVisual({
    id: "desktop-watchlist",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-watchlist"],
    stepLinks: {
      "desktop-watchlist": { steps: [1, 2, 3], caption: "Recognize the Watchlist workspace, saved tabs, and instrument rows before adding a contract." },
    },
    title: "Watchlist workspace",
    alt: "Official IBKR Desktop Watchlist screenshot showing instrument rows, watchlist tabs, and the left navigation panel.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/watchlists.htm",
    imagePath: "resources/images/watchlists.png",
    sourceLabel: "IBKR Desktop User Guide — Watchlist",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Watchlist contents and columns vary with the saved view.",
    callouts: [
      { id: "desktop-watchlist-tabs", label: "Watchlist tabs", x: 34, y: 15 },
      { id: "desktop-watchlist-rows", label: "Verified instrument rows", x: 48, y: 48 },
    ],
  }),
  guideVisual({
    id: "desktop-contract-search",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-contract-search"],
    stepLinks: {
      "desktop-contract-search": { steps: [1, 2, 3], caption: "Use the search results layout to compare asset class, venue, currency, and contract identity." },
    },
    title: "Contract Search results",
    alt: "Official IBKR Desktop Contract Search screenshot showing search results separated by product and contract details.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/contract-search.htm",
    imagePath: "resources/images/contract-search.png",
    sourceLabel: "IBKR Desktop User Guide — Contract Search",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Result ordering changes with the query, region, and available product permissions.",
    callouts: [
      { id: "desktop-search-box", label: "Global contract search", x: 28, y: 12 },
      { id: "desktop-search-results", label: "Product-specific results", x: 43, y: 47 },
    ],
  }),
  guideVisual({
    id: "desktop-advanced-chart",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-chart"],
    stepLinks: {
      "desktop-chart": { steps: [1, 2], caption: "Locate the selected instrument and separate the displayed time range from chart periodicity." },
    },
    title: "Advanced Chart controls",
    alt: "Official IBKR Desktop Advanced Chart screenshot showing time controls and the chart workspace for a selected instrument.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/charts-summary.htm",
    imagePath: "resources/images/chart-time.png",
    sourceLabel: "IBKR Desktop User Guide — Charts Summary",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Available chart tools can change with chart updates and window size.",
    callouts: [
      { id: "desktop-chart-time", label: "Time period and periodicity controls", x: 24, y: 12 },
    ],
  }),
  guideVisual({
    id: "desktop-columns",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-customize"],
    stepLinks: {
      "desktop-customize": { steps: [1, 2, 3], caption: "Recognize the Columns preference page before adding or reordering fields in a custom view." },
    },
    title: "Column customization",
    alt: "Official IBKR Desktop Preferences screenshot showing the Columns customization page and available fields.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/how-to-customize-columns.htm",
    imagePath: "resources/images/columns.png",
    sourceLabel: "IBKR Desktop User Guide — Customize Columns",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Default and custom views may contain different fields from this guide image.",
    callouts: [
      { id: "desktop-column-views", label: "Saved column views", x: 25, y: 30 },
      { id: "desktop-available-columns", label: "Available columns", x: 65, y: 45 },
    ],
  }),
  guideVisual({
    id: "desktop-rapid-order-entry",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-rapid-order", "desktop-preview"],
    stepLinks: {
      "desktop-rapid-order": { steps: [1, 2, 3], caption: "Match the loaded contract, side, quantity, price, and time-in-force fields before stopping." },
      "desktop-preview": { steps: [1, 2, 3], caption: "Use the populated order ticket as the starting point for the complete preview verification." },
    },
    title: "Rapid Order Entry ticket",
    alt: "Official IBKR Desktop screenshot showing the Rapid Order Entry ticket on the right side of the Watchlist workspace.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/rapid-order-entry.htm",
    imagePath: "resources/images/rapid-order-entry1.png",
    sourceLabel: "IBKR Desktop User Guide — Rapid Order Entry",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Order fields vary by product and order type. Confirm Paper Trading before entering any values.",
    callouts: [
      { id: "desktop-order-ticket", label: "Rapid Order Entry ticket", x: 84, y: 48 },
    ],
  }),
  guideVisual({
    id: "desktop-orders-trades",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-monitor-order", "desktop-modify-cancel"],
    stepLinks: {
      "desktop-monitor-order": { steps: [2, 3], caption: "Locate the paper instruction by contract and state before comparing any resulting trade." },
      "desktop-modify-cancel": { steps: [1, 2, 3], caption: "Identify the exact working order and confirm its displayed state after any change or cancellation." },
    },
    title: "Orders & Trades workspace",
    alt: "Official IBKR Desktop screenshot showing the Orders and Trades workspace with order-state controls.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/orders-and-trades.htm",
    imagePath: "resources/images/orders-and-trades.png",
    sourceLabel: "IBKR Desktop User Guide — Orders & Trades",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "The available actions and displayed states depend on the selected paper order.",
    callouts: [
      { id: "desktop-order-state", label: "Order-state filters", x: 39, y: 18 },
      { id: "desktop-order-row", label: "Selected order row", x: 49, y: 47 },
    ],
  }),
  guideVisual({
    id: "desktop-option-chain",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-option-chain"],
    stepLinks: {
      "desktop-option-chain": { steps: [1, 2, 3], caption: "Use the chain layout to verify underlying, expiration, strike, right, and quote before selection." },
    },
    title: "Desktop Option Chain",
    alt: "Official IBKR Desktop screenshot showing calls, puts, strikes, expirations, and Option Chain view controls.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/option-chain.htm",
    imagePath: "resources/images/optionchain.png",
    sourceLabel: "IBKR Desktop User Guide — Option Chain",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Quotes and available expirations are dynamic and may be delayed or unavailable.",
    callouts: [
      { id: "desktop-chain-controls", label: "Chain filters and view controls", x: 48, y: 15 },
      { id: "desktop-chain-contracts", label: "Calls, strikes, and puts", x: 48, y: 53 },
    ],
  }),
  guideVisual({
    id: "desktop-strategy-builder",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-option-chain"],
    stepLinks: {
      "desktop-option-chain": { steps: [2, 3], caption: "Use the annotated chain controls to connect filters and contract selection with the populated order context." },
    },
    title: "Desktop Option Chain controls",
    alt: "Official annotated IBKR Desktop Option Chain screenshot identifying the Strategy Builder toggle and contract-selection regions.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/option-chain.htm",
    imagePath: "resources/images/option-chain.png",
    sourceLabel: "IBKR Desktop User Guide — Option Chain",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "This official guide image identifies controls; verify every generated leg in the current paper application.",
    callouts: [
      { id: "desktop-strategy-toggle", label: "Strategy Builder control", x: 50, y: 20 },
    ],
  }),
  guideVisual({
    id: "desktop-portfolio-sort",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-portfolio", "desktop-position-review"],
    stepLinks: {
      "desktop-portfolio": { steps: [2], caption: "Recognize the Sort by menu before changing how position rows are arranged." },
      "desktop-position-review": { steps: [2], caption: "Use the sort control to locate the intended paper position without changing its data." },
    },
    title: "Portfolio Sort by menu",
    alt: "Official IBKR Desktop screenshot showing the Portfolio Sort by menu and its available position ordering choices.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/see-positions.htm",
    imagePath: "resources/images/sortby.png",
    sourceLabel: "IBKR Desktop User Guide — View Positions",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Sorting changes row order only; displayed values remain account-specific.",
  }),
  guideVisual({
    id: "desktop-portfolio-orders-menu",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-portfolio", "desktop-position-review"],
    stepLinks: {
      "desktop-portfolio": { steps: [3], caption: "Use the Portfolio menu to move from positions into order and trade activity." },
      "desktop-position-review": { steps: [2], caption: "Open Orders and Trades from the same Portfolio context to compare the execution record." },
    },
    title: "Portfolio Orders & Trades menu",
    alt: "Official IBKR Desktop screenshot showing the Portfolio menu used to open Orders and Trades from the account workspace.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/see-positions.htm",
    imagePath: "resources/images/orders.png",
    sourceLabel: "IBKR Desktop User Guide — View Positions",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Menu labels can shift with releases; verify the destination before interpreting activity.",
  }),
  guideVisual({
    id: "desktop-watchlist-create",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-watchlist"],
    stepLinks: {
      "desktop-watchlist": { steps: [2], caption: "Recognize the New Watchlist choice after opening the plus menu." },
    },
    title: "Create a new Watchlist",
    alt: "Official IBKR Desktop screenshot showing the Watchlist plus menu and the New Watchlist choice used to create a list.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/watchlists.htm",
    imagePath: "resources/images/watchlists1.png",
    sourceLabel: "IBKR Desktop User Guide — Watchlist",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Saved watchlists can synchronize with other IBKR platforms connected to the same account.",
  }),
  guideVisual({
    id: "desktop-watchlist-contract-picker",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-watchlist", "desktop-contract-search"],
    stepLinks: {
      "desktop-watchlist": { steps: [3], caption: "Compare product type and exchange before adding the intended instrument to the list." },
      "desktop-contract-search": { steps: [3], caption: "Use the product picker to reject similarly named contracts with the wrong venue or asset class." },
    },
    title: "Watchlist contract picker",
    alt: "Official IBKR Desktop screenshot showing instrument choices separated by asset type and exchange while adding a Watchlist row.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/watchlists.htm",
    imagePath: "resources/images/watchlists3.png",
    sourceLabel: "IBKR Desktop User Guide — Watchlist",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Available choices depend on the query, region, and products shown by the current application.",
  }),
  guideVisual({
    id: "desktop-watchlist-view-menu",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-watchlist", "desktop-customize"],
    stepLinks: {
      "desktop-watchlist": { steps: [2], caption: "Locate the Watchlist View menu used to change the information shown in the list." },
      "desktop-customize": { steps: [2], caption: "Use the view menu to distinguish default views from the custom-view workflow." },
    },
    title: "Watchlist View menu",
    alt: "Official IBKR Desktop screenshot showing the Watchlist View menu with performance, dividend, fundamental, and custom choices.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/watchlists.htm",
    imagePath: "resources/images/watchlists4.png",
    sourceLabel: "IBKR Desktop User Guide — Watchlist",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Changing a view changes displayed fields, not the identity of instruments already saved.",
  }),
  guideVisual({
    id: "desktop-watchlist-custom-view",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-customize"],
    stepLinks: {
      "desktop-customize": { steps: [3], caption: "Recognize the Create New View choice before selecting fields for a custom layout." },
    },
    title: "Create a custom Watchlist view",
    alt: "Official IBKR Desktop screenshot showing the Create New View option used to start a custom Watchlist column layout.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/watchlists.htm",
    imagePath: "resources/images/watchlists5.png",
    sourceLabel: "IBKR Desktop User Guide — Watchlist",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Retain contract identity and quote fields when designing a custom information view.",
  }),
  guideVisual({
    id: "desktop-contract-details",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-contract-search"],
    stepLinks: {
      "desktop-contract-search": { steps: [3], caption: "Confirm the selected instrument on its detail view before treating the search result as verified." },
    },
    title: "Instrument contract details",
    alt: "Official IBKR Desktop screenshot showing instrument details after a contract has been selected from Contract Search results.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/contract-search.htm",
    imagePath: "resources/images/contract-search2.png",
    sourceLabel: "IBKR Desktop User Guide — Contract Search",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Verify asset class, exchange, and currency using the current detail view.",
  }),
  guideVisual({
    id: "desktop-chart-periodicity",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-chart"],
    stepLinks: {
      "desktop-chart": { steps: [2], caption: "Use the periodicity menu to change bar intervals separately from the overall time range." },
    },
    title: "Chart periodicity menu",
    alt: "Official IBKR Desktop screenshot showing the Advanced Chart periodicity menu with available bar interval choices.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/charts-summary.htm",
    imagePath: "resources/images/charts3.png",
    sourceLabel: "IBKR Desktop User Guide — Charts Summary",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Periodicity controls bar aggregation; it is distinct from the visible history range.",
  }),
  guideVisual({
    id: "desktop-chart-indicators",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-chart"],
    stepLinks: {
      "desktop-chart": { steps: [3], caption: "Recognize the Indicators browser before adding a study to the educational chart." },
    },
    title: "Chart Indicators browser",
    alt: "Official IBKR Desktop screenshot showing the Advanced Chart Indicators browser and its searchable study categories.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/charts-summary.htm",
    imagePath: "resources/images/chart-indicators.png",
    sourceLabel: "IBKR Desktop User Guide — Charts Summary",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Indicators transform historical data and do not predict future price movement.",
  }),
  guideVisual({
    id: "desktop-chart-settings",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-chart"],
    stepLinks: {
      "desktop-chart": { steps: [3], caption: "Use Chart Settings to inspect display options without enabling an order action." },
    },
    title: "Advanced Chart settings",
    alt: "Official IBKR Desktop screenshot showing the Advanced Chart settings panel and configurable chart display options.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/charts-summary.htm",
    imagePath: "resources/images/chart-custom1.png",
    sourceLabel: "IBKR Desktop User Guide — Charts Summary",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Available settings can change with chart-library and IBKR Desktop releases.",
  }),
  guideVisual({
    id: "desktop-columns-reorder",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-customize"],
    stepLinks: {
      "desktop-customize": { steps: [3], caption: "Recognize the selected-column list and drag handles before changing field order." },
    },
    title: "Reorder custom columns",
    alt: "Official IBKR Desktop screenshot showing selected custom-view columns and the controls used to reorder their display.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/how-to-customize-columns.htm",
    imagePath: "resources/images/columns1.png",
    sourceLabel: "IBKR Desktop User Guide — Customize Columns",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Keep identity and essential quote fields visible after reordering columns.",
  }),
  guideVisual({
    id: "desktop-rapid-order-context",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-rapid-order", "desktop-preview"],
    stepLinks: {
      "desktop-rapid-order": { steps: [1], caption: "Open the Watchlist context menu on the verified instrument before choosing Buy or Sell." },
      "desktop-preview": { steps: [1], caption: "Start the preview exercise from the verified instrument rather than an unconfirmed symbol." },
    },
    title: "Open Rapid Order Entry",
    alt: "Official IBKR Desktop screenshot showing the Watchlist right-click menu with Buy and Sell choices for Rapid Order Entry.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/rapid-order-entry.htm",
    imagePath: "resources/images/rapid-order-entry_300x455.png",
    sourceLabel: "IBKR Desktop User Guide — Rapid Order Entry",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Choosing Buy or Sell opens an instruction; it does not establish that the contract or session is safe.",
  }),
  guideVisual({
    id: "desktop-order-working-actions",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-monitor-order", "desktop-modify-cancel"],
    stepLinks: {
      "desktop-monitor-order": { steps: [2], caption: "Recognize the available actions only after locating the intended working paper order." },
      "desktop-modify-cancel": { steps: [2], caption: "Use the row menu to inspect modify and cancel choices for the selected working order." },
    },
    title: "Working order actions",
    alt: "Official IBKR Desktop screenshot showing the right-click actions available for a selected working order in Orders and Trades.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/orders-and-trades.htm",
    imagePath: "resources/images/orders-and-trades1.png",
    sourceLabel: "IBKR Desktop User Guide — Orders & Trades",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "Available actions depend on order state; cancellation is not complete until status confirms it.",
  }),
  guideVisual({
    id: "desktop-order-state-filter",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-monitor-order", "desktop-modify-cancel"],
    stepLinks: {
      "desktop-monitor-order": { steps: [2], caption: "Use the state filter to distinguish working, canceled, completed, and executed activity." },
      "desktop-modify-cancel": { steps: [1, 3], caption: "Filter to the working instruction, then verify its final state after the requested action." },
    },
    title: "Order-state filter",
    alt: "Official IBKR Desktop screenshot showing the Orders and Trades state filter with order-status choices.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/orders-and-trades.htm",
    imagePath: "resources/images/orders-and-trades2.png",
    sourceLabel: "IBKR Desktop User Guide — Orders & Trades",
    sourceUpdated: DESKTOP_GUIDE_UPDATED,
    productVersionNote: "A filter changes what is visible; it does not change the underlying order state.",
  }),
  guideVisual({
    id: "desktop-strategy-builder-open",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-strategy-builder"],
    stepLinks: {
      "desktop-strategy-builder": { steps: [1], caption: "Toggle Strategy Builder from the Option Chain and identify the panel that opens below it." },
    },
    title: "Open Strategy Builder",
    alt: "Official IBKR Desktop screenshot showing Strategy Builder opened below the Option Chain with its main control areas.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/strategy-builder.htm",
    imagePath: "resources/images/ntws-v1.4-1.png",
    sourceLabel: "IBKR Desktop User Guide — Strategy Builder",
    sourceUpdated: DESKTOP_STRATEGY_UPDATED,
    productVersionNote: "Opening the builder does not create a complete or suitable strategy.",
  }),
  guideVisual({
    id: "desktop-strategy-builder-select",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-strategy-builder"],
    stepLinks: {
      "desktop-strategy-builder": { steps: [2], caption: "Use the strategy menu deliberately before selecting any option legs from the chain." },
    },
    title: "Select a strategy template",
    alt: "Official IBKR Desktop screenshot showing the Strategy Builder strategy-selection menu and named strategy choices.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/strategy-builder.htm",
    imagePath: "resources/images/ntws-v1.4-2.png",
    sourceLabel: "IBKR Desktop User Guide — Strategy Builder",
    sourceUpdated: DESKTOP_STRATEGY_UPDATED,
    productVersionNote: "A named template still requires verification of every generated leg and ratio.",
  }),
  guideVisual({
    id: "desktop-strategy-builder-legs",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-strategy-builder"],
    stepLinks: {
      "desktop-strategy-builder": { steps: [2], caption: "Check each generated leg for action, expiration, strike, right, and ratio." },
    },
    title: "Select and verify strategy legs",
    alt: "Official IBKR Desktop screenshot showing selected option legs populated in Strategy Builder beneath the Option Chain.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/strategy-builder.htm",
    imagePath: "resources/images/ntws-v1.4-3.png",
    sourceLabel: "IBKR Desktop User Guide — Strategy Builder",
    sourceUpdated: DESKTOP_STRATEGY_UPDATED,
    productVersionNote: "Displayed quotes are dynamic; leg identity and action require separate verification.",
  }),
  guideVisual({
    id: "desktop-strategy-builder-order",
    platformId: "ibkr-desktop",
    missionIds: ["desktop-strategy-builder"],
    stepLinks: {
      "desktop-strategy-builder": { steps: [3], caption: "Review quantity, net price, debit or credit, and the complete leg set before preview." },
    },
    title: "Strategy order parameters",
    alt: "Official IBKR Desktop screenshot showing Strategy Builder order parameters beneath the selected multi-leg option strategy.",
    sourceUrl: "https://www.ibkrguides.com/ibkrdesktop/strategy-builder.htm",
    imagePath: "resources/images/ntws-v1.4-4.png",
    sourceLabel: "IBKR Desktop User Guide — Strategy Builder",
    sourceUpdated: DESKTOP_STRATEGY_UPDATED,
    productVersionNote: "Stop at preview until the net instruction and modeled exposure match the written plan.",
  }),
  guideVisual({
    id: "tws-product",
    platformId: "tws-mosaic",
    missionIds: ["tws-install", "tws-paper-check"],
    stepLinks: {
      "tws-install": { steps: [1, 2, 3], caption: "Use the official product view to distinguish Trader Workstation from IBKR Desktop." },
      "tws-paper-check": { steps: [1, 2, 3], caption: "Recognize genuine TWS, then verify the PaperTrader session separately before opening order tools." },
    },
    title: "Trader Workstation",
    alt: "Official Interactive Brokers Trader Workstation product image showing the multi-panel TWS trading workspace.",
    sourceUrl: "https://www.interactivebrokers.com/en/trading/tws.php",
    imagePath: "/images/dam/tws/hero-tws.jpg",
    sourceLabel: "Interactive Brokers — Trader Workstation",
    sourceUpdated: REVIEWED_AT,
    productVersionNote: "The product page does not publish an image update date. Reviewed on the mapping date; this image does not prove PaperTrader mode.",
  }),
  guideVisual({
    id: "tws-mosaic-layout",
    platformId: "tws-mosaic",
    missionIds: ["tws-mosaic-layout", "tws-window-grouping", "tws-customize"],
    stepLinks: {
      "tws-mosaic-layout": { steps: [1, 2], caption: "Map the default Mosaic panels and identify which areas select, prepare, and monitor activity." },
      "tws-window-grouping": { steps: [1, 2, 3], caption: "Use the overview to find grouping blocks and observe which panels share contract context." },
      "tws-customize": { steps: [1, 2, 3], caption: "Compare your layout with the default before moving panels or changing their grouping." },
    },
    title: "TWS Mosaic layout",
    alt: "Official TWS Mosaic screenshot showing Monitor, Quote, Chart, Order Entry, and Activity panels in one workspace.",
    sourceUrl: "https://www.ibkrguides.com/traderworkstation/mosaic-layout.htm",
    imagePath: "resources/images/mosaic.png",
    sourceLabel: "TWS User Guide — Mosaic Layout",
    sourceUpdated: TWS_GUIDE_UPDATED,
    productVersionNote: "Mosaic panels can be moved, resized, removed, and grouped differently from this default layout.",
    callouts: [
      { id: "tws-monitor-panel", label: "Monitor panel", x: 78, y: 30 },
      { id: "tws-chart-panel", label: "Chart panel", x: 28, y: 50 },
      { id: "tws-order-entry-panel", label: "Order Entry panel", x: 26, y: 14 },
      { id: "tws-activity-panel", label: "Activity panel", x: 28, y: 82 },
    ],
  }),
  guideVisual({
    id: "tws-monitor",
    platformId: "tws-mosaic",
    missionIds: ["tws-monitor", "tws-portfolio"],
    stepLinks: {
      "tws-monitor": { steps: [1, 2, 3], caption: "Recognize Monitor tabs and the instrument table before opening a watchlist or Portfolio view." },
      "tws-portfolio": { steps: [1, 2, 3], caption: "Use the Monitor context to locate Portfolio positions and account information without entering an order." },
    },
    title: "Mosaic Monitor Panel",
    alt: "Official TWS Mosaic screenshot showing the Monitor Panel with Portfolio and Watchlist tabs.",
    sourceUrl: "https://www.ibkrguides.com/traderworkstation/monitor-panel.htm",
    imagePath: "resources/images/monitorpanel_1001x466.png",
    sourceLabel: "TWS User Guide — Monitor Panel",
    sourceUpdated: TWS_GUIDE_UPDATED,
    productVersionNote: "Tabs, columns, scanners, and account values depend on workspace and account configuration.",
    callouts: [
      { id: "tws-monitor-tabs", label: "Portfolio and Watchlist tabs", x: 23, y: 14 },
      { id: "tws-monitor-table", label: "Monitor table", x: 48, y: 52 },
    ],
  }),
  guideVisual({
    id: "tws-quote",
    platformId: "tws-mosaic",
    missionIds: ["tws-quote"],
    stepLinks: {
      "tws-quote": { steps: [1, 2, 3], caption: "Verify the selected contract and find bid, ask, sizes, and quote settings in the Quote Panel." },
    },
    title: "Mosaic Quote Panel",
    alt: "Official TWS Mosaic screenshot showing the Quote Panel contract identity, quote fields, and panel controls.",
    sourceUrl: "https://www.ibkrguides.com/traderworkstation/quote-panel.htm",
    imagePath: "resources/images/quotepanel.png",
    sourceLabel: "TWS User Guide — Quote Panel",
    sourceUpdated: TWS_GUIDE_UPDATED,
    productVersionNote: "Market-data subscriptions and session state affect the quote values shown.",
    callouts: [
      { id: "tws-quote-identity", label: "Selected contract identity", x: 30, y: 18 },
      { id: "tws-bid-ask", label: "Bid and ask quote region", x: 50, y: 53 },
    ],
  }),
  guideVisual({
    id: "tws-chart",
    platformId: "tws-mosaic",
    missionIds: ["tws-chart"],
    stepLinks: {
      "tws-chart": { steps: [1, 2, 3], caption: "Locate chart menus, linked-symbol context, and range controls without enabling trading actions." },
    },
    title: "Mosaic Chart Panel",
    alt: "Official TWS Mosaic screenshot showing the Chart Panel toolbar, linked contract, and price chart.",
    sourceUrl: "https://www.ibkrguides.com/traderworkstation/chart-panel.htm",
    imagePath: "resources/images/chart.png",
    sourceLabel: "TWS User Guide — Chart Panel",
    sourceUpdated: TWS_GUIDE_UPDATED,
    productVersionNote: "Chart menus and optional trading controls depend on the installed TWS version and configuration.",
    callouts: [
      { id: "tws-chart-toolbar", label: "Chart toolbar", x: 45, y: 13 },
      { id: "tws-chart-range", label: "Price chart and range", x: 50, y: 55 },
    ],
  }),
  guideVisual({
    id: "tws-activity",
    platformId: "tws-mosaic",
    missionIds: ["tws-activity", "tws-order-monitor", "tws-attached-orders"],
    stepLinks: {
      "tws-activity": { steps: [1, 2, 3], caption: "Identify the Orders, Trades, and Summary areas and the different activity each contains." },
      "tws-order-monitor": { steps: [2, 3], caption: "Find the paper instruction in Orders and compare it with Trades only if an execution occurs." },
      "tws-attached-orders": { steps: [2], caption: "Use the selected Orders row as the entry point for inspecting available attached-order actions." },
    },
    title: "Mosaic Activity Panel",
    alt: "Official TWS Mosaic screenshot showing the Activity Panel and its Orders, Trades, and Summary tabs.",
    sourceUrl: "https://www.ibkrguides.com/traderworkstation/activity-panel.htm",
    imagePath: "resources/images/activitypanel.png",
    sourceLabel: "TWS User Guide — Activity Panel",
    sourceUpdated: TWS_GUIDE_UPDATED,
    productVersionNote: "Order rows and available actions depend on the selected paper instruction and current status.",
    callouts: [
      { id: "tws-activity-tabs", label: "Orders, Trades, and Summary tabs", x: 30, y: 15 },
      { id: "tws-activity-rows", label: "Activity rows", x: 48, y: 53 },
    ],
  }),
  guideVisual({
    id: "tws-order-entry",
    platformId: "tws-mosaic",
    missionIds: ["tws-order-entry", "tws-order-preview"],
    stepLinks: {
      "tws-order-entry": { steps: [1, 2, 3], caption: "Verify the loaded contract and every visible order parameter before stopping ahead of submission." },
      "tws-order-preview": { steps: [1, 2, 3], caption: "Use the complete Order Entry state as the basis for margin and instruction review." },
    },
    title: "Mosaic Order Entry Panel",
    alt: "Official TWS Mosaic screenshot showing the Order Entry Panel with contract, side, quantity, order type, price, and time in force.",
    sourceUrl: "https://www.ibkrguides.com/traderworkstation/mosaic-order-entry-panel.htm",
    imagePath: "resources/images/orderentry.png",
    sourceLabel: "TWS User Guide — Mosaic Order Entry Panel",
    sourceUpdated: TWS_GUIDE_UPDATED,
    productVersionNote: "Fields change with the selected product and order type. Confirm PaperTrader before entering parameters.",
    callouts: [
      { id: "tws-order-contract", label: "Selected contract", x: 30, y: 14 },
      { id: "tws-order-parameters", label: "Order parameters", x: 48, y: 50 },
      { id: "tws-order-submit", label: "Submit area — stop and verify first", x: 80, y: 82 },
    ],
  }),
  guideVisual({
    id: "tws-option-chain",
    platformId: "tws-mosaic",
    missionIds: ["tws-option-chain"],
    stepLinks: {
      "tws-option-chain": { steps: [1, 2, 3], caption: "Match the underlying, expiration controls, strikes, rights, and selected quote before Order Entry." },
    },
    title: "TWS Option Chain",
    alt: "Official TWS Option Chain screenshot showing calls, puts, strikes, expirations, and contract-selection controls.",
    sourceUrl: "https://www.ibkrguides.com/traderworkstation/option-chain.htm",
    imagePath: "resources/images/optionchain.png",
    sourceLabel: "TWS User Guide — Option Chain & Strategy Builder",
    sourceUpdated: TWS_GUIDE_UPDATED,
    productVersionNote: "Available contracts, quotes, expirations, trading classes, and exchanges are dynamic.",
    callouts: [
      { id: "tws-chain-controls", label: "Expiration and chain controls", x: 48, y: 14 },
      { id: "tws-chain-contracts", label: "Calls, strikes, and puts", x: 50, y: 53 },
    ],
  }),
  guideVisual({
    id: "tws-strategy-builder",
    platformId: "tws-mosaic",
    missionIds: ["tws-combination"],
    stepLinks: {
      "tws-combination": { steps: [1, 2, 3], caption: "Locate the Strategy Builder legs and confirm their actions, ratios, and contract details." },
    },
    title: "TWS Strategy Builder",
    alt: "Official TWS screenshot showing the Option Chain with Strategy Builder legs and combination controls.",
    sourceUrl: "https://www.ibkrguides.com/traderworkstation/option-chain.htm",
    imagePath: "resources/images/optionchain1.png",
    sourceLabel: "TWS User Guide — Option Chain & Strategy Builder",
    sourceUpdated: TWS_GUIDE_UPDATED,
    productVersionNote: "Verify every leg, ratio, action, expiration, strike, and net price in the current paper order.",
    callouts: [
      { id: "tws-strategy-legs", label: "Strategy Builder legs", x: 50, y: 78 },
    ],
  }),
  guideVisual({
    id: "tws-combination-order",
    platformId: "tws-mosaic",
    missionIds: ["tws-combination"],
    stepLinks: {
      "tws-combination": { steps: [2, 3], caption: "Review the assembled multi-leg instruction and its combined order price before preview." },
    },
    title: "TWS combination order",
    alt: "Official TWS screenshot showing a multi-leg combination order and its combined order details.",
    sourceUrl: "https://www.ibkrguides.com/traderworkstation/about-combination-orders.htm",
    imagePath: "resources/images/combo.jpg",
    sourceLabel: "TWS User Guide — Combination Orders",
    sourceUpdated: TWS_GUIDE_UPDATED,
    productVersionNote: "Combination routing and available fields depend on product, exchange, and account permissions.",
    callouts: [
      { id: "tws-combo-legs", label: "Combination legs", x: 45, y: 42 },
      { id: "tws-combo-price", label: "Combined order price", x: 72, y: 72 },
    ],
  }),
  guideVisual({
    id: "tws-performance-profile",
    platformId: "tws-mosaic",
    missionIds: ["tws-risk-review"],
    stepLinks: {
      "tws-risk-review": { steps: [2, 3], caption: "Interpret the modeled payoff and scenario metrics as estimates rather than guaranteed outcomes." },
    },
    title: "TWS Performance Profile",
    alt: "Official TWS Performance Profile screenshot showing modeled profit and loss, price scenarios, and strategy metrics.",
    sourceUrl: "https://www.ibkrguides.com/traderworkstation/performance-profile.htm",
    imagePath: "resources/images/performanceprofile1.png",
    sourceLabel: "TWS User Guide — Performance Profile",
    sourceUpdated: TWS_GUIDE_UPDATED,
    productVersionNote: "Performance Profile is a model, not a guarantee; assumptions and Greeks change with market inputs.",
    callouts: [
      { id: "tws-profile-chart", label: "Modeled profit and loss chart", x: 55, y: 48 },
      { id: "tws-profile-metrics", label: "Strategy and scenario metrics", x: 20, y: 45 },
    ],
  }),
];

export const PLATFORM_VISUALS = Object.freeze(RAW_VISUALS.map((visual) => {
  if (!validatePlatformVisual(visual)) throw new TypeError(`Invalid platform visual: ${visual.id}`);
  return Object.freeze({
    ...visual,
    missionIds: Object.freeze([...visual.missionIds]),
    stepLinks: visual.stepLinks,
    callouts: Object.freeze(visual.callouts.map((callout) => Object.freeze({ ...callout }))),
  });
}));

export function getWalkthroughVisuals(walkthroughId) {
  return Object.freeze(PLATFORM_VISUALS.flatMap((visual) => {
    const link = visual.stepLinks[walkthroughId];
    return link ? [Object.freeze({ visual, steps: link.steps, caption: link.caption })] : [];
  }));
}

export function getMissionVisuals(missionId) {
  return getWalkthroughVisuals(missionId).map(({ visual }) => visual);
}

const VERIFIED_AS_OF = "2026-08-11";
const REVIEW_AFTER = "2027-02-11";
const PAPER_SAFETY = "Confirm that the genuine IBKR application visibly identifies the session as Paper Trading before continuing. Stop if the account mode is uncertain.";

const SOURCES = Object.freeze({
  desktopGuide: { label: "IBKR Desktop User Guide", url: "https://www.ibkrguides.com/ibkrdesktop/" },
  desktopDownload: { label: "IBKR Desktop Download", url: "https://www.interactivebrokers.com/en/trading/ibkr-desktop-download.php" },
  twsProduct: { label: "Trader Workstation", url: "https://www.interactivebrokers.com/en/trading/tws.php" },
  twsCourse: { label: "TWS for Beginners", url: "https://www.interactivebrokers.com/campus/trading-course/tws-for-beginners/" },
});

function workflow(definition) {
  return Object.freeze({
    asOf: VERIFIED_AS_OF,
    reviewAfter: REVIEW_AFTER,
    safetyGate: PAPER_SAFETY,
    prerequisites: [],
    ...definition,
    route: `platforms/${definition.platformId === "ibkr-desktop" ? "desktop" : "tws"}/missions/${definition.id}`,
  });
}

export const PLATFORM_WORKFLOWS = Object.freeze([
  workflow({
    id: "desktop-paper-check",
    platformId: "ibkr-desktop",
    phase: "Desktop orientation",
    title: "Verify an IBKR Desktop paper session",
    objective: "Open the genuine application and positively identify paper mode before any order exercise.",
    steps: [
      "Install or update IBKR Desktop only from the official IBKR download page.",
      "At login, choose the paper-trading mode and use only your authorized paper credentials.",
      "After the workspace opens, inspect the application for its paper or simulated account identification before opening an order tool.",
    ],
    observations: ["The official application, not this website, identifies the connected account mode."],
    mistakes: ["Assuming a familiar workspace or a zero position count proves that the session is paper trading."],
    recovery: ["If the mode is unclear, sign out without creating an order and consult the current IBKR guide or Client Services."],
    evidence: [
      { id: "official-app", label: "I opened the application from an official IBKR installation." },
      { id: "paper-visible", label: "I found visible confirmation that this session is paper or simulated." },
    ],
    sources: [SOURCES.desktopDownload, SOURCES.desktopGuide],
  }),
  workflow({
    id: "tws-paper-check",
    platformId: "tws-mosaic",
    phase: "TWS orientation",
    title: "Verify a TWS PaperTrader session",
    objective: "Open genuine TWS and identify PaperTrader before using Mosaic order tools.",
    prerequisites: ["Complete the IBKR Desktop core orientation track."],
    steps: [
      "Install or update Trader Workstation only from the official IBKR product page.",
      "Select Paper Trading in the TWS login window and use your authorized paper credentials.",
      "After Mosaic opens, confirm the session is identified as simulated before opening Order Entry.",
    ],
    observations: ["PaperTrader uses the genuine TWS workspace while simulated executions can differ from live execution."],
    mistakes: ["Treating a familiar Mosaic layout as proof of the connected account mode."],
    recovery: ["If PaperTrader is not clearly identified, log out and restart with the paper-trading selection."],
    evidence: [
      { id: "official-app", label: "I opened TWS from an official IBKR installation." },
      { id: "paper-visible", label: "I found visible confirmation that this is PaperTrader." },
    ],
    sources: [SOURCES.twsProduct, SOURCES.twsCourse],
  }),
]);

export function getPlatformWorkflows(platformId) {
  return PLATFORM_WORKFLOWS.filter((item) => item.platformId === platformId);
}

export function getWorkflow(id) {
  return PLATFORM_WORKFLOWS.find((item) => item.id === id);
}

export function getWorkflowByRoute(route) {
  return PLATFORM_WORKFLOWS.find((item) => item.route === route);
}

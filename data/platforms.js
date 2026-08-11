export const PLATFORM_ORDER = Object.freeze(["ibkr-desktop", "tws-mosaic"]);

export const PLATFORMS = Object.freeze([
  {
    id: "ibkr-desktop",
    shortName: "IBKR Desktop",
    name: "IBKR Desktop",
    level: "Beginner to intermediate",
    sequence: 1,
    asOf: "2026-08-11",
    reviewAfter: "2027-02-11",
    summary: "IBKR's newer, streamlined desktop application. Learn this track first.",
    workspace: "Left-navigation application",
    officialDownload: "https://www.interactivebrokers.com/en/trading/ibkr-desktop-download.php",
    sources: [
      { label: "IBKR Desktop download and release information", url: "https://www.interactivebrokers.com/en/trading/ibkr-desktop-download.php" },
      { label: "IBKR Desktop user guide", url: "https://www.ibkrguides.com/ibkrdesktop/" },
      { label: "IBKR Desktop learning course", url: "https://www.interactivebrokers.com/campus/traders-academy/beginner-trading/" },
    ],
  },
  {
    id: "tws-mosaic",
    shortName: "TWS/Mosaic",
    name: "Trader Workstation — Mosaic",
    level: "Intermediate to advanced",
    sequence: 2,
    asOf: "2026-08-11",
    reviewAfter: "2027-02-11",
    summary: "IBKR's advanced flagship desktop platform. Study it after the Desktop core track.",
    workspace: "Customizable Mosaic panels",
    officialDownload: "https://www.interactivebrokers.com/en/trading/tws.php",
    sources: [
      { label: "Trader Workstation product page", url: "https://www.interactivebrokers.com/en/trading/tws.php" },
      { label: "Mosaic Layout guide", url: "https://www.ibkrguides.com/traderworkstation/mosaic-layout.htm" },
      { label: "TWS for Beginners course", url: "https://www.interactivebrokers.com/campus/trading-course/tws-for-beginners/" },
    ],
  },
]);

export function getPlatform(id) {
  return PLATFORMS.find((platform) => platform.id === id);
}

export function getPlatformSourceStatus(platform, now = new Date()) {
  if (!platform) return "missing";
  const reviewDate = new Date(`${platform.reviewAfter}T00:00:00Z`);
  return now.getTime() > reviewDate.getTime() ? "review" : "current";
}

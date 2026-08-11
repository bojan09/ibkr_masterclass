import { getMissionVisuals } from "../data/platform-visuals.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function renderMarkers(visual) {
  return visual.callouts.map((callout, index) => `<span class="mission-visual-marker" style="--marker-x: ${callout.x}%; --marker-y: ${callout.y}%" aria-hidden="true">${index + 1}</span>`).join("");
}

function renderLegend(visual) {
  if (!visual.callouts.length) return "";
  return `<ol class="mission-visual-legend" aria-label="Screenshot callouts">${visual.callouts.map((callout, index) => `<li><span>${index + 1}</span>${escapeHtml(callout.label)}</li>`).join("")}</ol>`;
}

function renderVisualCard(visual) {
  const id = escapeHtml(visual.id);
  const platformName = visual.platformId === "ibkr-desktop" ? "IBKR Desktop" : "TWS / Mosaic";
  return `<figure class="mission-visual-card" data-visual-card="${id}">
    <div class="mission-visual-card__heading">
      <div><p class="eyebrow">Official IBKR screenshot · ${platformName}</p><h3>${escapeHtml(visual.title)}</h3></div>
      <span class="status-chip status-chip--neutral">Official source</span>
    </div>
    <div class="mission-visual-layout">
      <div class="mission-visual-frame">
        <span class="mission-visual-skeleton" aria-hidden="true"></span>
        <img src="${escapeHtml(visual.imageUrl)}" alt="${escapeHtml(visual.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-mission-visual-image>
        ${renderMarkers(visual)}
        <div class="mission-visual-error" role="status">
          <strong>Official image unavailable</strong>
          <p>The official screenshot could not be loaded. Open the official guide to view the current image.</p>
        </div>
      </div>
      <figcaption>
        ${renderLegend(visual)}
        <p>${escapeHtml(visual.productVersionNote)}</p>
        <dl class="mission-visual-source">
          <div><dt>Source</dt><dd>${escapeHtml(visual.sourceLabel)}</dd></div>
          <div><dt>Source updated</dt><dd><time datetime="${visual.sourceUpdated}">${formatDate(visual.sourceUpdated)}</time></dd></div>
          <div><dt>Mapping reviewed</dt><dd><time datetime="${visual.reviewedAt}">${formatDate(visual.reviewedAt)}</time></dd></div>
        </dl>
        <div class="mission-visual-actions">
          <button class="button button--secondary" type="button" data-enlarge-visual="${id}">Enlarge screenshot</button>
          <a class="text-link" href="${escapeHtml(visual.sourceUrl)}" target="_blank" rel="noreferrer">Open official guide →</a>
        </div>
      </figcaption>
    </div>
    <dialog class="mission-visual-dialog" data-visual-dialog="${id}" aria-label="Enlarged official screenshot: ${escapeHtml(visual.title)}">
      <header><div><p class="eyebrow">Official IBKR screenshot</p><h2>${escapeHtml(visual.title)}</h2></div><button type="button" data-close-visual aria-label="Close enlarged screenshot">×</button></header>
      <div><img src="${escapeHtml(visual.imageUrl)}" alt="${escapeHtml(visual.alt)}" decoding="async" referrerpolicy="no-referrer"></div>
      <footer><p>${escapeHtml(visual.productVersionNote)}</p><a href="${escapeHtml(visual.sourceUrl)}" target="_blank" rel="noreferrer">Open ${escapeHtml(visual.sourceLabel)}</a></footer>
    </dialog>
  </figure>`;
}

export function renderMissionVisuals(missionId) {
  const visuals = getMissionVisuals(missionId);
  if (!visuals.length) return "";
  return `<section class="mission-visuals" aria-labelledby="mission-visuals-title-${escapeHtml(missionId)}">
    <header><p class="eyebrow">Official visual reference</p><h2 id="mission-visuals-title-${escapeHtml(missionId)}">Recognize the real screen</h2><p>Compare this official guide image with the genuine application before following the steps.</p></header>
    ${visuals.map(renderVisualCard).join("")}
  </section>`;
}

export function bindMissionVisuals(container) {
  const dialogs = [...container.querySelectorAll("[data-visual-dialog]")];
  const openers = new Map();

  const closeDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  };

  const handleClick = (event) => {
    const enlargeButton = event.target.closest?.("[data-enlarge-visual]");
    if (enlargeButton) {
      const dialog = dialogs.find((item) => item.dataset.visualDialog === enlargeButton.dataset.enlargeVisual);
      if (!dialog) return;
      openers.set(dialog, enlargeButton);
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      dialog.querySelector("[data-close-visual]")?.focus();
      return;
    }
    const closeButton = event.target.closest?.("[data-close-visual]");
    if (closeButton) closeDialog(closeButton.closest("[data-visual-dialog]"));
  };

  const handleImageError = (event) => {
    if (!event.target.matches?.("[data-mission-visual-image]")) return;
    event.target.closest("[data-visual-card]")?.classList.add("is-image-error");
  };

  const restoreFocus = (event) => openers.get(event.currentTarget)?.focus();
  dialogs.forEach((dialog) => dialog.addEventListener("close", restoreFocus));
  container.addEventListener("click", handleClick);
  container.addEventListener("error", handleImageError, true);

  return () => {
    container.removeEventListener("click", handleClick);
    container.removeEventListener("error", handleImageError, true);
    dialogs.forEach((dialog) => {
      dialog.removeEventListener("close", restoreFocus);
      closeDialog(dialog);
    });
  };
}

import { getWalkthroughVisuals } from "../data/platform-visuals.js";

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

function formatSteps(steps) {
  const label = steps.length === 1 ? "Supports step" : "Supports steps";
  const consecutive = steps.every((step, index) => index === 0 || step === steps[index - 1] + 1);
  const value = steps.length > 1 && consecutive ? `${steps[0]}–${steps.at(-1)}` : steps.join(", ");
  return `${label} ${value}`;
}

function renderMarkers(visual) {
  return visual.callouts.map((callout, index) => `<span class="mission-visual-marker" style="--marker-x: ${callout.x}%; --marker-y: ${callout.y}%" aria-hidden="true">${index + 1}</span>`).join("");
}

function renderLegend(visual) {
  if (!visual.callouts.length) return "";
  return `<ol class="mission-visual-legend" aria-label="Screenshot callouts">${visual.callouts.map((callout, index) => `<li><span>${index + 1}</span>${escapeHtml(callout.label)}</li>`).join("")}</ol>`;
}

function renderVisualPanel(item, walkthroughId, index) {
  const { visual, steps, caption } = item;
  const id = escapeHtml(visual.id);
  const panelId = `walkthrough-visual-${escapeHtml(walkthroughId)}-${id}`;
  const tabId = `${panelId}-tab`;
  const platformName = visual.platformId === "ibkr-desktop" ? "IBKR Desktop" : "TWS / Mosaic";
  return `<article class="mission-visual-panel" data-visual-panel="${index}" data-visual-card="${id}" role="tabpanel" id="${panelId}" aria-labelledby="${tabId}"${index === 0 ? "" : " hidden"}>
    <div class="mission-visual-card__heading">
      <div><p class="eyebrow">Official IBKR screenshot · ${platformName}</p><h3>${escapeHtml(visual.title)}</h3></div>
      <span class="status-chip status-chip--neutral">Official source</span>
    </div>
    <div class="mission-visual-layout">
      <figure class="mission-visual-frame">
        <span class="mission-visual-skeleton" aria-hidden="true"></span>
        <img src="${escapeHtml(visual.imageUrl)}" alt="${escapeHtml(visual.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-walkthrough-visual-image>
        ${renderMarkers(visual)}
        <figcaption class="mission-visual-error" role="status">
          <strong>Official image unavailable</strong>
          <p>The official screenshot could not be loaded. Open the official guide to view the current image.</p>
        </figcaption>
      </figure>
      <div class="mission-visual-copy" aria-live="polite">
        <span class="mission-visual-step">${formatSteps(steps)}</span>
        <p class="mission-visual-caption">${escapeHtml(caption)}</p>
        ${renderLegend(visual)}
        <p>${escapeHtml(visual.productVersionNote)}</p>
        <details class="mission-visual-provenance">
          <summary>Official source and review details</summary>
          <dl class="mission-visual-source">
            <div><dt>Source</dt><dd>${escapeHtml(visual.sourceLabel)}</dd></div>
            <div><dt>Source updated</dt><dd><time datetime="${visual.sourceUpdated}">${formatDate(visual.sourceUpdated)}</time></dd></div>
            <div><dt>Mapping reviewed</dt><dd><time datetime="${visual.reviewedAt}">${formatDate(visual.reviewedAt)}</time></dd></div>
          </dl>
        </details>
        <div class="mission-visual-actions">
          <button class="button button--secondary" type="button" data-enlarge-visual="${id}">Enlarge screenshot</button>
          <a class="text-link" href="${escapeHtml(visual.sourceUrl)}" target="_blank" rel="noreferrer">Open official guide →</a>
        </div>
      </div>
    </div>
    <dialog class="mission-visual-dialog" data-visual-dialog="${id}" aria-label="Enlarged official screenshot: ${escapeHtml(visual.title)}">
      <header><div><p class="eyebrow">Official IBKR screenshot</p><h2>${escapeHtml(visual.title)}</h2></div><button type="button" data-close-visual aria-label="Close enlarged screenshot">×</button></header>
      <div><img src="${escapeHtml(visual.imageUrl)}" alt="${escapeHtml(visual.alt)}" decoding="async" referrerpolicy="no-referrer"></div>
      <footer><p>${escapeHtml(visual.productVersionNote)}</p><a href="${escapeHtml(visual.sourceUrl)}" target="_blank" rel="noreferrer">Open ${escapeHtml(visual.sourceLabel)}</a></footer>
    </dialog>
  </article>`;
}

export function nextGalleryIndex(index, delta, count) {
  if (!Number.isInteger(count) || count <= 0) return 0;
  return Math.min(Math.max(index + delta, 0), count - 1);
}

export function renderWalkthroughVisuals(walkthroughId) {
  const items = getWalkthroughVisuals(walkthroughId);
  if (!items.length) return "";
  const safeId = escapeHtml(walkthroughId);
  const tabs = items.map(({ visual }, index) => {
    const panelId = `walkthrough-visual-${safeId}-${escapeHtml(visual.id)}`;
    return `<button type="button" role="tab" id="${panelId}-tab" aria-controls="${panelId}" aria-selected="${index === 0}" tabindex="${index === 0 ? "0" : "-1"}" data-gallery-select="${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(visual.title)}</strong></button>`;
  }).join("");
  return `<section class="mission-visuals" id="walkthrough-recognize" aria-labelledby="walkthrough-visuals-title-${safeId}">
    <header><p class="eyebrow">Official visual reference</p><h2 id="walkthrough-visuals-title-${safeId}">Recognize the real screen</h2><p>Compare these official guide images with the genuine application before following the steps.</p></header>
    <div class="mission-visual-gallery" data-walkthrough-gallery>
      <div class="mission-visual-gallery__controls">
        <button class="button button--secondary" type="button" data-gallery-previous disabled>Previous</button>
        <span data-gallery-position aria-live="polite">1 of ${items.length}</span>
        <button class="button button--secondary" type="button" data-gallery-next${items.length === 1 ? " disabled" : ""}>Next</button>
      </div>
      <div class="mission-visual-thumbnails" role="tablist" aria-label="Official screenshots">${tabs}</div>
      <div class="mission-visual-panels">${items.map((item, index) => renderVisualPanel(item, walkthroughId, index)).join("")}</div>
    </div>
  </section>`;
}

export function bindWalkthroughVisuals(container) {
  const dialogs = [...container.querySelectorAll("[data-visual-dialog]")];
  const openers = new Map();

  const closeDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  };

  const selectVisual = (gallery, requestedIndex) => {
    const panels = [...gallery.querySelectorAll("[data-visual-panel]")];
    const tabs = [...gallery.querySelectorAll("[data-gallery-select]")];
    const index = nextGalleryIndex(requestedIndex, 0, panels.length);
    panels.forEach((panel, panelIndex) => { panel.hidden = panelIndex !== index; });
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    const position = gallery.querySelector("[data-gallery-position]");
    if (position) position.textContent = `${index + 1} of ${panels.length}`;
    const previous = gallery.querySelector("[data-gallery-previous]");
    const next = gallery.querySelector("[data-gallery-next]");
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === panels.length - 1;
  };

  const handleClick = (event) => {
    const gallery = event.target.closest?.("[data-walkthrough-gallery]");
    if (gallery) {
      const panels = [...gallery.querySelectorAll("[data-visual-panel]")];
      const current = panels.findIndex((panel) => !panel.hidden);
      const selectButton = event.target.closest?.("[data-gallery-select]");
      if (selectButton) selectVisual(gallery, Number(selectButton.dataset.gallerySelect));
      else if (event.target.closest?.("[data-gallery-previous]")) selectVisual(gallery, nextGalleryIndex(current, -1, panels.length));
      else if (event.target.closest?.("[data-gallery-next]")) selectVisual(gallery, nextGalleryIndex(current, 1, panels.length));
    }

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
    if (!event.target.matches?.("[data-walkthrough-visual-image]")) return;
    event.target.closest("[data-visual-panel]")?.classList.add("is-image-error");
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

export const renderMissionVisuals = renderWalkthroughVisuals;
export const bindMissionVisuals = bindWalkthroughVisuals;

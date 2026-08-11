import { PLATFORMS, getPlatform, getPlatformSourceStatus } from "../data/platforms.js";

function renderSources(platform) {
  return platform.sources.map((source) => `<li><a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a></li>`).join("");
}

function renderPlatformCard(platform) {
  const status = getPlatformSourceStatus(platform);
  return `<article class="platform-card">
    <div class="platform-card__header"><span class="platform-order">Track 0${platform.sequence}</span><span class="status-chip status-chip--${status === "current" ? "active" : "neutral"}">${status === "current" ? `Verified ${platform.asOf}` : "Source review due"}</span></div>
    <h2>${platform.name}</h2>
    <p>${platform.summary}</p>
    <dl><div><dt>Level</dt><dd>${platform.level}</dd></div><div><dt>Workspace</dt><dd>${platform.workspace}</dd></div></dl>
    <div class="platform-card__actions"><a class="button button--primary" href="#/platforms/${platform.id === "ibkr-desktop" ? "desktop" : "tws"}">Open track</a><a class="button button--secondary" href="${platform.officialDownload}" target="_blank" rel="noreferrer">Official app</a></div>
  </article>`;
}

function renderSafety() {
  return `<section class="platform-safety" aria-labelledby="paper-safety-title">
    <div><p class="eyebrow">Mandatory safety gate</p><h1 id="paper-safety-title">Confirm Paper Trading before every exercise</h1><p>The website never connects to IBKR. Open the official application yourself and verify that the login or session is explicitly identified as paper or simulated before following an order walkthrough.</p></div>
    <ol><li>Use the official IBKR download.</li><li>Select the paper-trading login mode.</li><li>Confirm the application visibly identifies the session as simulated.</li><li>If you cannot confirm the mode, stop before previewing or submitting anything.</li></ol>
    <p class="risk-callout"><strong>Live-account boundary:</strong> No course completion, simulated result, or paper fill authorizes a live trade.</p>
  </section>`;
}

function renderDetail(platform) {
  return `<div class="platform-detail">
    <header class="page-hero"><div><p class="eyebrow">Official-app companion · Track 0${platform.sequence}</p><h1>${platform.name}</h1><p>${platform.summary} Navigation practice takes place in the genuine application, not in a browser copy.</p></div><div class="page-hero__stat"><strong>${platform.asOf}</strong><span>Instructions verified</span></div></header>
    <section class="platform-detail__grid"><article><h2>Start safely</h2><ol><li>Install from IBKR's official page.</li><li>Use your authorized paper-trading access.</li><li>Complete the account-mode check.</li><li>Follow each walkthrough and confirm its observable evidence.</li></ol><div class="platform-card__actions"><a class="button button--primary" href="#/platforms/${platform.id === "ibkr-desktop" ? "desktop" : "tws"}/missions">Open walkthroughs</a><a class="button button--secondary" href="#/platforms/safety">Safety gate</a></div></article><article><h2>Official references</h2><ul class="source-list">${renderSources(platform)}</ul><p>Interfaces change. If a label or location differs, stop and verify the current official guide.</p></article></section>
    <a class="text-link" href="#/platforms">← All platform tracks</a>
  </div>`;
}

export function renderPlatformHub(container, { initialPlatform = "all" } = {}) {
  if (initialPlatform === "safety") {
    container.innerHTML = renderSafety();
    return;
  }
  const platform = getPlatform(initialPlatform);
  if (platform) {
    container.innerHTML = renderDetail(platform);
    return;
  }
  container.innerHTML = `<div class="platform-hub"><header class="page-hero"><div><p class="eyebrow">Genuine-platform curriculum</p><h1>Learn the real IBKR applications</h1><p>Install and practice in official IBKR paper-trading software. Use this site for sourced Walkthroughs, explanations, checks, and platform comparisons.</p></div><div class="page-hero__stat"><strong>2</strong><span>Official platform tracks</span></div></header><section class="platform-grid">${PLATFORMS.map(renderPlatformCard).join("")}</section><aside class="affiliation-note"><strong>Independent educational project</strong><p>IBKR Platform Mastery is not affiliated with, endorsed by, or connected to Interactive Brokers LLC or its affiliates. No brokerage connection is provided.</p></aside></div>`;
}

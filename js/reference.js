import { GLOSSARY_TERMS, REFERENCE_TOPICS } from "../data/reference.js";

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function renderTopic(container, topic) {
  container.innerHTML = `<article class="reference-topic-page"><header class="page-hero"><div><p class="eyebrow">${topic.eyebrow}</p><h1>${topic.title}</h1><p>${topic.summary}</p></div><span class="simulation-badge">EDUCATIONAL REFERENCE</span></header><section class="reference-topic-sections">${topic.sections.map((item, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h2>${item.title}</h2><p>${item.body}</p></article>`).join("")}</section><aside class="reference-warning"><strong>Risk boundary</strong><p>${topic.warning}</p></aside>${topic.source ? `<section class="desktop-source-note"><strong>Current reference</strong><p>Platform-specific details can change. Verify the current official documentation before production action.</p><a href="${topic.source}" target="_blank" rel="noreferrer">Open official source</a></section>` : ""}<nav class="reference-next"><a href="#/reference/glossary">Search the glossary</a><a href="#/reference/quick-reference">Open quick reference</a><a href="#/practice/trade-checklist">Use the practice checklist</a></nav></article>`;
}

function filterGlossary(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return GLOSSARY_TERMS;
  return GLOSSARY_TERMS.filter((item) => `${item.term} ${item.category} ${item.definition}`.toLowerCase().includes(normalized));
}

function renderGlossary(container, query = "") {
  const results = filterGlossary(query);
  container.innerHTML = `<article class="glossary-page"><header class="page-hero"><div><p class="eyebrow">Reference desk</p><h1>Glossary</h1><p>Search brokerage, market structure, orders, options, Greeks, account, and risk terms. Definitions explain limits as well as meaning.</p></div><div class="page-hero__stat"><strong>${GLOSSARY_TERMS.length}</strong><span>Defined terms</span></div></header><form class="glossary-search" data-glossary-search><label for="glossary-query">Search terms and definitions</label><div><input id="glossary-query" name="query" value="${escapeHtml(query)}" placeholder="Try assignment, spread, or margin" autocomplete="off"><button type="submit">Search</button></div></form><div class="glossary-results"><p>${results.length} ${results.length === 1 ? "result" : "results"}</p>${results.length ? `<dl>${results.map((item) => `<div><dt>${item.term}<span>${item.category}</span></dt><dd>${item.definition}</dd></div>`).join("")}</dl>` : `<div class="library-empty"><div><strong>No matching term</strong><p>Try a broader concept such as order, option, account, or market.</p><button type="button" data-clear-glossary>Clear search</button></div></div>`}</div></article>`;
}

export function renderReferencePage(container, route) {
  if (route !== "reference/glossary") {
    renderTopic(container, REFERENCE_TOPICS[route]);
    return () => {};
  }
  const handleSubmit = (event) => {
    if (!event.target.matches("[data-glossary-search]")) return;
    event.preventDefault();
    renderGlossary(container, String(new FormData(event.target).get("query") ?? ""));
  };
  const handleClick = (event) => {
    if (!event.target.closest("[data-clear-glossary]")) return;
    renderGlossary(container);
  };
  container.addEventListener("submit", handleSubmit);
  container.addEventListener("click", handleClick);
  renderGlossary(container);
  return () => { container.removeEventListener("submit", handleSubmit); container.removeEventListener("click", handleClick); };
}

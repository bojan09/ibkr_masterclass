import { getPlatform } from "../data/platforms.js";
import { getWalkthroughVisuals } from "../data/platform-visuals.js";
import { getPlatformWorkflows, getWorkflow } from "../data/platform-workflows.js";
import { bindWalkthroughVisuals, renderWalkthroughVisuals } from "./platform-visuals.js";

export function isWorkflowStale(workflow, now = new Date()) {
  return now.getTime() > new Date(`${workflow.reviewAfter}T00:00:00Z`).getTime();
}

export function canCompleteWorkflow(workflow, evidence) {
  const selected = new Set(evidence);
  return workflow.evidence.every((item) => selected.has(item.id));
}

export function completeWorkflow(storage, workflowId, evidence, completedAt = new Date().toISOString()) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) throw new Error(`Unknown platform workflow: ${workflowId}`);
  if (!canCompleteWorkflow(workflow, evidence)) throw new Error("Complete every evidence check before marking this walkthrough complete.");
  const record = { completedAt, verifiedAsOf: workflow.asOf, evidence: [...evidence] };
  storage.set("platformEvidence", { ...storage.get("platformEvidence"), [workflowId]: record });
  return record;
}

function walkthroughGroup(phase) {
  const suffix = phase.trim().split(/\s+/).at(-1)?.toLowerCase();
  return ({ orientation: "Orientation", trading: "Trading", options: "Options", risk: "Risk" })[suffix] ?? "Practice";
}

export function renderCatalog(platformId, storage) {
  const platform = getPlatform(platformId);
  const completed = storage.get("platformEvidence");
  const workflows = getPlatformWorkflows(platformId);
  const groups = new Map();
  workflows.forEach((workflow, index) => {
    const label = walkthroughGroup(workflow.phase);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push({ workflow, index });
  });
  const completedCount = workflows.filter(({ id }) => completed[id]).length;
  const sections = [...groups.entries()].map(([label, entries]) => `<section class="walkthrough-group" aria-labelledby="walkthrough-group-${label.toLowerCase()}">
    <header><div><p class="eyebrow">${platform.name}</p><h2 id="walkthrough-group-${label.toLowerCase()}">${label}</h2></div><span>${entries.length} walkthroughs</span></header>
    <ol class="mission-list">${entries.map(({ workflow, index }) => {
      const visualCount = getWalkthroughVisuals(workflow.id).length;
      return `<li><a href="#/${workflow.route}"><span class="mission-list__number">${String(index + 1).padStart(2, "0")}</span><span><small>${workflow.phase}</small><strong>${workflow.title}</strong><p>${workflow.objective}</p><em>${completed[workflow.id] ? "Completed" : "Not completed"} · ${visualCount} official visuals</em></span></a></li>`;
    }).join("")}</ol>
  </section>`).join("");
  return `<div class="mission-catalog"><header class="page-hero"><div><p class="eyebrow">Official-app walkthroughs</p><h1>${platform.name}</h1><p>Follow these guided activities in the genuine Paper Trading application. This companion records learning evidence only.</p></div><div class="page-hero__stat"><strong>${workflows.length}</strong><span>Published walkthroughs</span><small>${completedCount} of ${workflows.length} completed</small></div></header>${sections}<a class="text-link" href="#/platforms/${platformId === "ibkr-desktop" ? "desktop" : "tws"}">← Platform overview</a></div>`;
}

function renderPrepare(workflow, stale) {
  return `<section id="walkthrough-prepare" class="walkthrough-section walkthrough-prepare"><header><p class="eyebrow">${workflow.phase} · Verified ${workflow.asOf}</p><h1>${workflow.title}</h1><p>${workflow.objective}</p>${stale ? '<p class="stale-warning"><strong>Verify the current interface before continuing.</strong> This walkthrough has passed its scheduled source-review date.</p>' : ""}</header><div class="mission-safety"><strong>Paper Trading check</strong><p>${workflow.safetyGate}</p></div>${workflow.prerequisites.length ? `<div class="walkthrough-prerequisites"><h2>Prerequisites</h2><ul>${workflow.prerequisites.map((item) => `<li>${item}</li>`).join("")}</ul></div>` : ""}</section>`;
}

function renderConfirm(workflow, completed) {
  return `<section id="walkthrough-confirm" class="walkthrough-section walkthrough-confirm"><header><p class="eyebrow">Confirm your understanding</p><h2>Confirm</h2><p>Compare what you observed, recover safely from differences, and save only non-sensitive learning evidence.</p></header><div class="mission-review-grid"><div><h3>Expected observation</h3><ul>${workflow.observations.map((item) => `<li>${item}</li>`).join("")}</ul></div><div><h3>Common mistake</h3><ul>${workflow.mistakes.map((item) => `<li>${item}</li>`).join("")}</ul></div><div><h3>Recovery</h3><ul>${workflow.recovery.map((item) => `<li>${item}</li>`).join("")}</ul></div></div><form data-mission-evidence><fieldset><legend>Completion evidence</legend>${workflow.evidence.map((item) => `<label><input type="checkbox" name="evidence" value="${item.id}" ${completed?.evidence.includes(item.id) ? "checked" : ""}> <span>${item.label}</span></label>`).join("")}</fieldset><button class="button button--primary" type="submit">${completed ? "Update evidence" : "Complete walkthrough"}</button><p data-mission-status role="status">${completed ? `Completed ${new Date(completed.completedAt).toLocaleDateString("en-US")}` : "All checks are required."}</p></form></section>`;
}

export function renderWorkflow(workflow, storage) {
  const completed = storage.get("platformEvidence")[workflow.id];
  const stale = isWorkflowStale(workflow);
  return `<article class="platform-mission" data-workflow-id="${workflow.id}"><nav class="walkthrough-steps" aria-label="Walkthrough sections"><a href="#walkthrough-prepare">Prepare</a><a href="#walkthrough-recognize">Recognize</a><a href="#walkthrough-practice">Practice</a><a href="#walkthrough-confirm">Confirm</a></nav>${renderPrepare(workflow, stale)}${renderWalkthroughVisuals(workflow.id)}<section id="walkthrough-practice" class="walkthrough-section walkthrough-practice"><header><p class="eyebrow">In the genuine application</p><h2>Practice</h2></header><ol>${workflow.steps.map((step) => `<li>${step}</li>`).join("")}</ol></section>${renderConfirm(workflow, completed)}<footer><h2>Official sources</h2><ul class="source-list">${workflow.sources.map((source) => `<li><a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a></li>`).join("")}</ul></footer></article>`;
}

export function renderPlatformMissions(container, { storage, platformId, workflowId } = {}) {
  const workflow = workflowId ? getWorkflow(workflowId) : undefined;
  container.innerHTML = workflow ? renderWorkflow(workflow, storage) : renderCatalog(platformId, storage);
  const cleanupVisuals = workflow ? bindWalkthroughVisuals(container) : () => {};
  const form = container.querySelector("[data-mission-evidence]");
  if (!form || !workflow) return cleanupVisuals;
  const handleSubmit = (event) => {
    event.preventDefault();
    const evidence = new FormData(form).getAll("evidence").map(String);
    const status = form.querySelector("[data-mission-status]");
    try {
      completeWorkflow(storage, workflow.id, evidence);
      status.textContent = "Walkthrough evidence saved locally.";
    } catch (error) {
      status.textContent = error.message;
    }
  };
  form.addEventListener("submit", handleSubmit);
  return () => {
    form.removeEventListener("submit", handleSubmit);
    cleanupVisuals();
  };
}

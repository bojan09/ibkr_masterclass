import { getPlatform } from "../data/platforms.js";
import { getPlatformWorkflows, getWorkflow } from "../data/platform-workflows.js";

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
  if (!canCompleteWorkflow(workflow, evidence)) throw new Error("Complete every evidence check before marking this mission complete.");
  const record = { completedAt, verifiedAsOf: workflow.asOf, evidence: [...evidence] };
  storage.set("platformEvidence", { ...storage.get("platformEvidence"), [workflowId]: record });
  return record;
}

function renderCatalog(platformId, storage) {
  const platform = getPlatform(platformId);
  const completed = storage.get("platformEvidence");
  const workflows = getPlatformWorkflows(platformId);
  return `<div class="mission-catalog"><header class="page-hero"><div><p class="eyebrow">Official-app missions</p><h1>${platform.name}</h1><p>Perform these tasks in the genuine paper-trading application. This website records learning evidence only.</p></div><div class="page-hero__stat"><strong>${workflows.length}</strong><span>Published missions</span></div></header><ol class="mission-list">${workflows.map((item, index) => `<li><a href="#/${item.route}"><span class="mission-list__number">${String(index + 1).padStart(2, "0")}</span><span><small>${item.phase}</small><strong>${item.title}</strong><em>${completed[item.id] ? "Completed" : "Not completed"}</em></span></a></li>`).join("")}</ol><a class="text-link" href="#/platforms/${platformId === "ibkr-desktop" ? "desktop" : "tws"}">← Platform overview</a></div>`;
}

function renderWorkflow(workflow, storage) {
  const completed = storage.get("platformEvidence")[workflow.id];
  const stale = isWorkflowStale(workflow);
  return `<article class="platform-mission" data-workflow-id="${workflow.id}"><header><p class="eyebrow">${workflow.phase} · Verified ${workflow.asOf}</p><h1>${workflow.title}</h1><p>${workflow.objective}</p>${stale ? '<p class="stale-warning"><strong>Verify current interface before continuing.</strong> This mission has passed its scheduled source-review date.</p>' : ""}</header><section class="mission-safety"><strong>Paper Trading check</strong><p>${workflow.safetyGate}</p></section>${workflow.prerequisites.length ? `<section><h2>Prerequisites</h2><ul>${workflow.prerequisites.map((item) => `<li>${item}</li>`).join("")}</ul></section>` : ""}<section><h2>Perform in the genuine application</h2><ol>${workflow.steps.map((step) => `<li>${step}</li>`).join("")}</ol></section><section class="mission-review-grid"><div><h2>Expected observation</h2><ul>${workflow.observations.map((item) => `<li>${item}</li>`).join("")}</ul></div><div><h2>Common mistake</h2><ul>${workflow.mistakes.map((item) => `<li>${item}</li>`).join("")}</ul></div><div><h2>Recovery</h2><ul>${workflow.recovery.map((item) => `<li>${item}</li>`).join("")}</ul></div></section><form data-mission-evidence><fieldset><legend>Completion evidence</legend>${workflow.evidence.map((item) => `<label><input type="checkbox" name="evidence" value="${item.id}" ${completed?.evidence.includes(item.id) ? "checked" : ""}> <span>${item.label}</span></label>`).join("")}</fieldset><button class="button button--primary" type="submit">${completed ? "Update evidence" : "Complete mission"}</button><p data-mission-status role="status">${completed ? `Completed ${new Date(completed.completedAt).toLocaleDateString("en-US")}` : "All checks are required."}</p></form><footer><h2>Official sources</h2><ul class="source-list">${workflow.sources.map((source) => `<li><a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a></li>`).join("")}</ul></footer></article>`;
}

export function renderPlatformMissions(container, { storage, platformId, workflowId } = {}) {
  const workflow = workflowId ? getWorkflow(workflowId) : undefined;
  container.innerHTML = workflow ? renderWorkflow(workflow, storage) : renderCatalog(platformId, storage);
  const form = container.querySelector("[data-mission-evidence]");
  if (!form || !workflow) return () => {};
  const handleSubmit = (event) => {
    event.preventDefault();
    const evidence = new FormData(form).getAll("evidence").map(String);
    const status = form.querySelector("[data-mission-status]");
    try {
      completeWorkflow(storage, workflow.id, evidence);
      status.textContent = "Mission evidence saved locally.";
    } catch (error) {
      status.textContent = error.message;
    }
  };
  form.addEventListener("submit", handleSubmit);
  return () => form.removeEventListener("submit", handleSubmit);
}

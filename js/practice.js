import { PAPER_CURRICULUM, PRACTICE_EXERCISES, TRADE_CHECKLIST } from "../data/practice.js";

export function toggleChecklistItem(completion, id) {
  return { ...completion, [id]: !completion[id] };
}

export function validateJournalDraft(draft) {
  const messages = [];
  if (!String(draft.thesis ?? "").trim()) messages.push("Write the educational thesis or observation.");
  if (!String(draft.riskPlan ?? "").trim()) messages.push("Define the risk and invalidation plan.");
  if (!String(draft.review ?? "").trim()) messages.push("Record the post-exercise review.");
  return messages;
}

export function createJournalEntry(draft, { id = `journal-${Date.now()}`, now = new Date().toISOString() } = {}) {
  const messages = validateJournalDraft(draft);
  if (messages.length) throw new TypeError(messages.join(" "));
  return { id, createdAt: now, symbol: String(draft.symbol ?? "").trim().toUpperCase(), thesis: String(draft.thesis).trim(), riskPlan: String(draft.riskPlan).trim(), result: String(draft.result ?? "").trim(), review: String(draft.review).trim() };
}

export function derivePracticeStats(state) {
  const completedKeys = Object.entries(state.checklistCompletion).filter(([, complete]) => complete).map(([id]) => id);
  return { completedExercises: completedKeys.filter((id) => id.startsWith("exercise:")).length, checklistItems: completedKeys.filter((id) => id.startsWith("check-")).length, practiceTrades: state.practiceTrades.length, journalEntries: state.journalEntries.length };
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function renderCurriculum() {
  return `<section class="paper-curriculum"><header><p class="eyebrow">Paper trading curriculum</p><h2>Practice the workflow, not imaginary profit</h2><p>Paper fills and platform behavior can differ from production. Use simulation to rehearse verification, decision-making, and state monitoring.</p></header><ol>${PAPER_CURRICULUM.map((item) => `<li><span>${item.title}</span><p>${item.lesson}</p><strong>Evidence</strong><p>${item.evidence}</p></li>`).join("")}</ol></section>`;
}

function renderExercises(state) {
  return `<section class="practice-exercises"><header><p class="eyebrow">Exercises</p><h2>Do, predict, verify, debrief</h2></header><div>${PRACTICE_EXERCISES.map((exercise) => { const complete = Boolean(state.checklistCompletion[`exercise:${exercise.id}`]); return `<article class="${complete ? "is-complete" : ""}"><div><span>${exercise.difficulty}</span><h3>${exercise.title}</h3></div><p>${exercise.task}</p><section><strong>Success criteria</strong><ul>${exercise.successCriteria.map((item) => `<li>${item}</li>`).join("")}</ul></section><details><summary>Debrief prompts</summary><ul>${exercise.debrief.map((item) => `<li>${item}</li>`).join("")}</ul></details><button type="button" data-exercise="${exercise.id}" aria-pressed="${complete}">${complete ? "Completed · mark incomplete" : "Mark exercise complete"}</button></article>`; }).join("")}</div></section>`;
}

function renderChecklist(state) {
  const completed = TRADE_CHECKLIST.filter((item) => state.checklistCompletion[item.id]).length;
  return `<section class="trade-checklist-page"><header><div><p class="eyebrow">Reusable checklist</p><h2>Pause before preview</h2><p>Completing boxes does not make a trade safe. Each check should be supported by evidence.</p></div><strong>${completed} / ${TRADE_CHECKLIST.length}</strong></header><div class="trade-checklist-items">${TRADE_CHECKLIST.map((item) => `<label class="${state.checklistCompletion[item.id] ? "is-checked" : ""}"><input type="checkbox" data-checklist-id="${item.id}" ${state.checklistCompletion[item.id] ? "checked" : ""}><span><small>${item.group}</small>${item.label}</span></label>`).join("")}</div></section>`;
}

function renderJournal(state, error = "") {
  return `<section class="journal-workspace"><div class="journal-form-card"><div><p class="eyebrow">Private · this device</p><h2>Practice journal</h2><p>Record process evidence. Never paste credentials, full account numbers, or private account exports.</p></div><form data-journal-form><label>Symbol or exercise<input name="symbol" maxlength="20" placeholder="AAPL or limit-wait"></label><label>Educational thesis / observation<textarea name="thesis" maxlength="1200" rows="4" required placeholder="What did you expect and why?"></textarea></label><label>Risk and invalidation plan<textarea name="riskPlan" maxlength="1200" rows="4" required placeholder="What could go wrong, and what outcome invalidates the idea?"></textarea></label><label>Simulated result<input name="result" maxlength="200" placeholder="Working, filled, rejected, or no order"></label><label>Post-exercise review<textarea name="review" maxlength="1600" rows="5" required placeholder="What did the evidence show, and what changes next time?"></textarea></label>${error ? `<p class="journal-error" role="alert">${escapeHtml(error)}</p>` : ""}<button class="button button--primary" type="submit">Save journal entry locally</button></form></div><div class="journal-entries"><div><p class="eyebrow">Saved reviews</p><h2>${state.journalEntries.length} journal ${state.journalEntries.length === 1 ? "entry" : "entries"}</h2></div>${state.journalEntries.length ? state.journalEntries.map((entry) => `<article><div><span>${escapeHtml(entry.symbol || "Practice")}</span><time datetime="${escapeHtml(entry.createdAt)}">${new Date(entry.createdAt).toLocaleDateString("en-GB")}</time></div><section><strong>Thesis</strong><p>${escapeHtml(entry.thesis)}</p></section><section><strong>Risk plan</strong><p>${escapeHtml(entry.riskPlan)}</p></section>${entry.result ? `<section><strong>Result</strong><p>${escapeHtml(entry.result)}</p></section>` : ""}<section><strong>Review</strong><p>${escapeHtml(entry.review)}</p></section><button type="button" data-delete-journal="${escapeHtml(entry.id)}">Delete entry</button></article>`).join("") : `<div class="library-empty"><div><strong>No journal entries yet</strong><p>Complete an exercise and capture what the platform state taught you.</p></div></div>`}</div></section>`;
}

export function renderPracticePage(container, { storage, initialView = "paper" } = {}) {
  let view = initialView;
  let journalError = "";
  const render = () => {
    const state = storage.get();
    const stats = derivePracticeStats(state);
    container.innerHTML = `<article class="practice-page"><header class="simulator-intro"><div><p class="eyebrow">Phase 12 · Paper trading and practice</p><h1>Rehearse evidence, not confidence</h1><p>Structured paper work connects contract selection, order behavior, risk review, position monitoring, and deliberate debrief.</p></div><div class="practice-stats"><span>Exercises<strong>${stats.completedExercises}/${PRACTICE_EXERCISES.length}</strong></span><span>Checklist<strong>${stats.checklistItems}/${TRADE_CHECKLIST.length}</strong></span><span>Journal<strong>${stats.journalEntries}</strong></span></div></header><nav class="lab-tabs" aria-label="Practice sections"><button type="button" data-practice-view="paper" class="${view === "paper" ? "is-active" : ""}">Paper curriculum</button><button type="button" data-practice-view="checklist" class="${view === "checklist" ? "is-active" : ""}">Trade checklist</button><button type="button" data-practice-view="journal" class="${view === "journal" ? "is-active" : ""}">Trading journal</button></nav>${view === "paper" ? `${renderCurriculum()}${renderExercises(state)}` : view === "checklist" ? renderChecklist(state) : renderJournal(state, journalError)}</article>`;
  };
  const handleClick = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.practiceView) view = button.dataset.practiceView;
    else if (button.dataset.exercise) { const state = storage.get("checklistCompletion"); storage.set("checklistCompletion", toggleChecklistItem(state, `exercise:${button.dataset.exercise}`)); }
    else if (button.dataset.deleteJournal) storage.set("journalEntries", storage.get("journalEntries").filter((entry) => entry.id !== button.dataset.deleteJournal));
    else return;
    journalError = "";
    render();
  };
  const handleChange = (event) => {
    if (!event.target.dataset.checklistId) return;
    storage.set("checklistCompletion", toggleChecklistItem(storage.get("checklistCompletion"), event.target.dataset.checklistId));
    render();
  };
  const handleSubmit = (event) => {
    if (!event.target.matches("[data-journal-form]")) return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    try {
      const entry = createJournalEntry(data);
      storage.set("journalEntries", [entry, ...storage.get("journalEntries")].slice(0, 200));
      journalError = "";
    } catch (error) { journalError = error.message; }
    render();
  };
  container.addEventListener("click", handleClick);
  container.addEventListener("change", handleChange);
  container.addEventListener("submit", handleSubmit);
  render();
  return () => { container.removeEventListener("click", handleClick); container.removeEventListener("change", handleChange); container.removeEventListener("submit", handleSubmit); };
}

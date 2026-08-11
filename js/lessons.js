import { getModuleById } from "../data/courses.js";
import { LESSONS, getAdjacentLessons } from "../data/lessons.js";
import { toggleBookmark } from "./bookmarks.js";
import { saveLessonNote } from "./notes.js";
import { recordRecentLesson, toggleLessonComplete } from "./progress.js";

const SECTION_META = {
  explanation: { label: "Explanation", code: "01" },
  why: { label: "Why this matters", code: "WHY" },
  example: { label: "Example", code: "EX" },
  important: { label: "Important", code: "!" },
  mistake: { label: "Common mistake", code: "×" },
  "best-practice": { label: "Best practice", code: "BP" },
  warning: { label: "Risk warning", code: "△" },
  "try-it": { label: "Try it yourself", code: "→" },
  comparison: { label: "Platform comparison", code: "CMP" },
  checklist: { label: "Checklist", code: "CHK" },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function getLessonViewModel(lesson, state) {
  const adjacent = getAdjacentLessons(lesson.id);
  return {
    ...lesson,
    module: getModuleById(lesson.moduleId),
    position: LESSONS.findIndex((candidate) => candidate.id === lesson.id) + 1,
    total: LESSONS.length,
    previous: adjacent.previous,
    next: adjacent.next,
    isComplete: state.completedLessons.includes(lesson.id),
    isBookmarked: state.bookmarks.includes(lesson.id),
    noteText: state.notes[lesson.id]?.text ?? "",
    sections: lesson.sections.map((section) => ({ ...section, ...SECTION_META[section.type] })),
  };
}

function renderSection(section, index) {
  const details = section.type === "comparison"
    ? `<div class="lesson-comparison-grid">${section.items.map((item) => `
        <article class="lesson-comparison-card">
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.purpose)}</p>
          <dl>
            <div><dt>Complexity</dt><dd>${escapeHtml(item.complexity)}</dd></div>
            <div><dt>Best for</dt><dd>${escapeHtml(item.bestFor)}</dd></div>
          </dl>
        </article>`).join("")}</div>`
    : section.type === "checklist"
      ? `<ul class="lesson-checklist">${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : "";

  return `
    <section class="lesson-section lesson-section--${section.type}" aria-labelledby="lesson-section-${index}">
      <div class="lesson-section__marker tabular" aria-hidden="true">${section.code}</div>
      <div class="lesson-section__content">
        <p class="lesson-section__label">${section.label}</p>
        <h2 id="lesson-section-${index}">${section.title}</h2>
        <p>${section.body}</p>
        ${details}
      </div>
    </section>
  `;
}

function renderLessonLink(lesson, direction) {
  if (!lesson) {
    return `<span class="lesson-nav__item lesson-nav__item--disabled"><small>${direction}</small><strong>${direction === "Previous" ? "Beginning of module" : "End of published lessons"}</strong></span>`;
  }
  return `<a class="lesson-nav__item" href="#/${lesson.route}"><small>${direction}</small><strong>${lesson.title}</strong></a>`;
}

export function renderLesson(container, lesson, { storage, onStateChange = () => {} }) {
  recordRecentLesson(storage, lesson.id);
  const view = getLessonViewModel(lesson, storage.get());

  container.innerHTML = `
    <article class="lesson-page" data-lesson-id="${view.id}">
      <header class="lesson-header">
        <div class="lesson-header__breadcrumbs">
          <a href="#/roadmap">Learning roadmap</a><span aria-hidden="true">/</span><span>Phase ${view.module.phase}</span>
        </div>
        <div class="lesson-header__grid">
          <div>
            <p class="eyebrow">${view.eyebrow}</p>
            <h1>${view.title}</h1>
            <p class="lesson-header__summary">${view.summary}</p>
            <ul class="meta-list" aria-label="Lesson details">
              <li>${view.difficulty}</li><li>${view.estimatedTime} min</li><li>Lesson ${view.position} / ${view.total}</li>
            </ul>
          </div>
          <div class="lesson-header__actions">
            <button class="lesson-action" type="button" data-action="bookmark" aria-pressed="${view.isBookmarked}">
              <span aria-hidden="true">${view.isBookmarked ? "◆" : "◇"}</span>
              ${view.isBookmarked ? "Bookmarked" : "Bookmark"}
            </button>
            <button class="lesson-action lesson-action--complete" type="button" data-action="complete" aria-pressed="${view.isComplete}">
              <span aria-hidden="true">${view.isComplete ? "✓" : "○"}</span>
              ${view.isComplete ? "Completed" : "Mark complete"}
            </button>
          </div>
        </div>
        <div class="lesson-progress" aria-label="Published lesson position">
          ${LESSONS.map((candidate, index) => `<span class="${index < view.position ? "is-reached" : ""}" title="${candidate.title}"></span>`).join("")}
        </div>
      </header>

      <div class="lesson-layout">
        <div class="lesson-main">
          <section class="lesson-objectives" aria-labelledby="objectives-heading">
            <div class="lesson-objectives__number tabular" aria-hidden="true">OBJ</div>
            <div>
              <p class="eyebrow">Learning objectives</p>
              <h2 id="objectives-heading">By the end of this lesson</h2>
              <ul>${view.objectives.map((objective) => `<li><span aria-hidden="true">✓</span>${objective}</li>`).join("")}</ul>
            </div>
          </section>

          <div class="lesson-sections">
            ${view.sections.map(renderSection).join("")}
          </div>

          <div class="lesson-disclaimer">
            <strong>Educational context</strong>
            <p>Examples explain platform and market mechanics. They are not recommendations to buy or sell a security.</p>
          </div>

          ${view.sources?.length ? `
            <section class="lesson-sources" aria-labelledby="lesson-sources-heading">
              <div>
                <p class="eyebrow">Primary documentation</p>
                <h2 id="lesson-sources-heading">Official sources</h2>
              </div>
              <p>Verified ${escapeHtml(view.verifiedOn)}</p>
              <ul>${view.sources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a></li>`).join("")}</ul>
            </section>` : ""}
        </div>

        <aside class="lesson-tools" aria-label="Lesson tools">
          <section class="lesson-tool-card">
            <div class="lesson-tool-card__heading">
              <div><p class="eyebrow">Private · this device</p><h2>My notes</h2></div>
              <span class="note-save-status" data-note-status role="status">${view.noteText ? "Saved locally" : "Ready"}</span>
            </div>
            <label class="sr-only" for="lesson-note">Notes for ${view.title}</label>
            <textarea id="lesson-note" data-lesson-note rows="10" maxlength="4000" placeholder="Capture a question, definition or connection…">${escapeHtml(view.noteText)}</textarea>
            <div class="note-meta"><span>Auto-saves locally</span><a href="#/my-notes">View all notes</a></div>
          </section>

          <section class="lesson-tool-card lesson-tool-card--progress">
            <p class="eyebrow">Lesson status</p>
            <strong data-completion-label>${view.isComplete ? "Completed" : "In progress"}</strong>
            <p>${view.isComplete ? "This lesson counts toward Phase 1 progress." : "Mark complete after you can explain the concepts in your own words."}</p>
            <button class="button ${view.isComplete ? "button--secondary" : "button--primary"}" type="button" data-action="complete">
              ${view.isComplete ? "Mark incomplete" : "Complete lesson"}
            </button>
          </section>
        </aside>
      </div>

      <nav class="lesson-nav" aria-label="Lesson navigation">
        ${renderLessonLink(view.previous, "Previous")}
        <a class="lesson-nav__roadmap" href="#/roadmap">Return to roadmap</a>
        ${renderLessonLink(view.next, "Next")}
      </nav>
    </article>
  `;

  const noteField = container.querySelector("[data-lesson-note]");
  const noteStatus = container.querySelector("[data-note-status]");
  let noteTimer;

  const refreshActionState = () => {
    const state = storage.get();
    const isComplete = state.completedLessons.includes(lesson.id);
    const isBookmarked = state.bookmarks.includes(lesson.id);
    const headerComplete = container.querySelector('.lesson-action[data-action="complete"]');
    const toolComplete = container.querySelector('.lesson-tool-card [data-action="complete"]');
    const bookmark = container.querySelector('[data-action="bookmark"]');
    const label = container.querySelector("[data-completion-label]");

    headerComplete.setAttribute("aria-pressed", String(isComplete));
    headerComplete.innerHTML = `<span aria-hidden="true">${isComplete ? "✓" : "○"}</span>${isComplete ? "Completed" : "Mark complete"}`;
    toolComplete.textContent = isComplete ? "Mark incomplete" : "Complete lesson";
    toolComplete.className = `button ${isComplete ? "button--secondary" : "button--primary"}`;
    bookmark.setAttribute("aria-pressed", String(isBookmarked));
    bookmark.innerHTML = `<span aria-hidden="true">${isBookmarked ? "◆" : "◇"}</span>${isBookmarked ? "Bookmarked" : "Bookmark"}`;
    label.textContent = isComplete ? "Completed" : "In progress";
  };

  const handleActions = (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "complete") toggleLessonComplete(storage, lesson.id);
    else if (action === "bookmark") toggleBookmark(storage, lesson.id);
    else return;
    refreshActionState();
    onStateChange();
  };

  const saveNote = () => {
    clearTimeout(noteTimer);
    noteTimer = undefined;
    saveLessonNote(storage, lesson.id, noteField.value);
    noteStatus.textContent = storage.isPersistent() ? "Saved locally" : "Saved for session";
    onStateChange();
  };
  const handleNoteInput = () => {
    noteStatus.textContent = "Saving…";
    clearTimeout(noteTimer);
    noteTimer = setTimeout(saveNote, 350);
  };

  container.addEventListener("click", handleActions);
  noteField.addEventListener("input", handleNoteInput);
  noteField.addEventListener("blur", saveNote);

  return () => {
    if (noteTimer) saveNote();
    container.removeEventListener("click", handleActions);
    noteField.removeEventListener("input", handleNoteInput);
    noteField.removeEventListener("blur", saveNote);
  };
}

export function renderLockedLesson(container, lesson) {
  const { previous } = getAdjacentLessons(lesson.id);
  container.innerHTML = `
    <section class="planned-page" aria-labelledby="planned-title">
      <div class="planned-page__signal" aria-hidden="true"><span>◇</span></div>
      <p class="eyebrow">Lesson prerequisite</p>
      <h1 id="planned-title">Complete the previous lesson first.</h1>
      <p class="planned-page__copy">${lesson.title} unlocks after you complete ${previous?.title ?? "the prerequisite"}. Sequential practice keeps the vocabulary and workflow connected.</p>
      <div class="planned-page__actions">
        <a class="button button--primary" href="#/${previous?.route ?? "roadmap"}">Open prerequisite</a>
        <a class="button button--secondary" href="#/roadmap">View roadmap</a>
      </div>
    </section>
  `;
}

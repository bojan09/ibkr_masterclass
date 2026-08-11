import { getLessonById } from "../data/lessons.js";

function requireLesson(id) {
  const lesson = getLessonById(id);
  if (!lesson) throw new Error(`Unknown lesson: ${id}`);
  return lesson;
}

export function saveLessonNote(storage, lessonId, text, { now = new Date().toISOString() } = {}) {
  requireLesson(lessonId);
  const notes = storage.get("notes");
  const normalizedText = String(text).trim();

  if (normalizedText) notes[lessonId] = { text: normalizedText, updatedAt: now };
  else delete notes[lessonId];

  storage.set("notes", notes);
  return notes[lessonId];
}

export function searchNotes(state, query = "") {
  const normalizedQuery = String(query).trim().toLowerCase();

  return Object.entries(state.notes)
    .map(([lessonId, note]) => ({ lesson: getLessonById(lessonId), note }))
    .filter(({ lesson, note }) => {
      if (!lesson || !note?.text) return false;
      if (!normalizedQuery) return true;
      return `${lesson.title} ${note.text}`.toLowerCase().includes(normalizedQuery);
    })
    .sort((a, b) => String(b.note.updatedAt).localeCompare(String(a.note.updatedAt)));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNoteDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function noteCards(results) {
  if (!results.length) {
    return `
      <div class="library-empty">
        <div><strong>No notes found</strong><p>Write notes beside a published lesson, or adjust your search.</p><a class="button button--primary" href="#/start-here/brokerage-basics">Open first lesson</a></div>
      </div>
    `;
  }

  return results
    .map(
      ({ lesson, note }) => `
        <article class="library-card">
          <div class="library-card__topline"><span>${escapeHtml(lesson.eyebrow)}</span><span>${formatNoteDate(note.updatedAt)}</span></div>
          <h2>${escapeHtml(lesson.title)}</h2>
          <p>${escapeHtml(note.text)}</p>
          <a class="text-link" href="#/${lesson.route}">Return to lesson <span aria-hidden="true">→</span></a>
        </article>
      `,
    )
    .join("");
}

export function renderNotesPage(container, state) {
  const initialResults = searchNotes(state);
  container.innerHTML = `
    <div class="library-page">
      <header class="page-hero">
        <div><p class="eyebrow">Personal learning workspace</p><h1>My notes</h1><p>Search the questions, definitions and observations you saved beside lessons. Notes remain on this device.</p></div>
        <div class="page-hero__stat"><strong class="tabular">${initialResults.length}</strong><span>Lessons with notes</span></div>
      </header>
      <div class="library-toolbar">
        <label class="library-search"><span aria-hidden="true">⌕</span><span class="sr-only">Search notes</span><input type="search" data-note-search placeholder="Search lesson titles or note text…" autocomplete="off"></label>
        <span class="library-count" data-library-count>${initialResults.length} notes</span>
      </div>
      <section class="library-list" data-note-results aria-label="Saved lesson notes">${noteCards(initialResults)}</section>
    </div>
  `;

  const search = container.querySelector("[data-note-search]");
  const resultsRoot = container.querySelector("[data-note-results]");
  const count = container.querySelector("[data-library-count]");
  const handleSearch = () => {
    const results = searchNotes(state, search.value);
    resultsRoot.innerHTML = noteCards(results);
    count.textContent = `${results.length} ${results.length === 1 ? "note" : "notes"}`;
  };
  search.addEventListener("input", handleSearch);
  return () => search.removeEventListener("input", handleSearch);
}

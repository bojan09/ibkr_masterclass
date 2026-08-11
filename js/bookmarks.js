import { getLessonById } from "../data/lessons.js";

export function toggleBookmark(storage, lessonId) {
  if (!getLessonById(lessonId)) throw new Error(`Unknown lesson: ${lessonId}`);
  const bookmarks = new Set(storage.get("bookmarks").filter((id) => getLessonById(id)));
  const isNowBookmarked = !bookmarks.has(lessonId);

  if (isNowBookmarked) bookmarks.add(lessonId);
  else bookmarks.delete(lessonId);

  storage.set("bookmarks", [...bookmarks]);
  return isNowBookmarked;
}

export function getBookmarkedLessons(state) {
  return state.bookmarks.map(getLessonById).filter(Boolean);
}

export function renderBookmarksPage(container, state) {
  const lessons = getBookmarkedLessons(state);
  container.innerHTML = `
    <div class="library-page">
      <header class="page-hero">
        <div><p class="eyebrow">Saved for review</p><h1>Bookmarked lessons</h1><p>Keep important lessons close while you build a reliable vocabulary and platform workflow.</p></div>
        <div class="page-hero__stat"><strong class="tabular">${lessons.length}</strong><span>Saved lessons</span></div>
      </header>
      <section class="library-list" aria-label="Bookmarked lessons">
        ${
          lessons.length
            ? lessons
                .map(
                  (lesson) => `
                    <article class="library-card">
                      <div class="library-card__topline"><span>${lesson.eyebrow}</span><span>${lesson.estimatedTime} min</span></div>
                      <h2>${lesson.title}</h2><p>${lesson.summary}</p>
                      <a class="text-link" href="#/${lesson.route}">Open lesson <span aria-hidden="true">→</span></a>
                    </article>
                  `,
                )
                .join("")
            : `<div class="library-empty"><div><strong>No bookmarks yet</strong><p>Bookmark a lesson when you want to return to it quickly.</p><a class="button button--primary" href="#/start-here/brokerage-basics">Open first lesson</a></div></div>`
        }
      </section>
    </div>
  `;
}

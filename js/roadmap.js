import { getLessonsForModule } from "../data/lessons.js";
import { deriveLearningProgress, isLessonUnlocked } from "./progress.js";

export function getRoadmapViewModel(state) {
  const progress = deriveLearningProgress(state);
  return {
    ...progress,
    modules: progress.modules.map((module) => ({
      ...module,
      lessons: getLessonsForModule(module.id).map((lesson) => ({
        ...lesson,
        unlocked: isLessonUnlocked(state, lesson.id),
      })),
    })),
  };
}

function statusLabel(status) {
  return {
    completed: "Completed",
    current: "Current phase",
    available: "Available next",
    locked: "Locked",
  }[status];
}

export function renderRoadmapPage(container, state) {
  const view = getRoadmapViewModel(state);
  const completed = new Set(state.completedLessons);

  container.innerHTML = `
    <div class="roadmap-page">
      <header class="page-hero page-hero--roadmap">
        <div>
          <p class="eyebrow">Thirteen-phase curriculum</p>
          <h1>Learning roadmap</h1>
          <p>Build platform fluency in sequence. Complete the published foundation lessons, then use the interactive labs and reference workflows for later phases.</p>
        </div>
        <div class="page-hero__stat">
          <strong class="tabular">${view.percent}%</strong>
          <span>Published lessons complete</span>
        </div>
      </header>

      <div class="roadmap-summary" aria-label="Roadmap progress">
        <span><strong class="tabular">${view.completedLessons}</strong> complete</span>
        <span><strong class="tabular">${view.totalLessons}</strong> published</span>
        <span><strong class="tabular">13</strong> curriculum phases</span>
      </div>

      <ol class="curriculum-roadmap">
        ${view.modules
          .map(
            (module) => `
              <li class="curriculum-module curriculum-module--${module.status}">
                <div class="curriculum-module__rail">
                  <span class="curriculum-module__phase tabular">${String(module.phase).padStart(2, "0")}</span>
                  <i aria-hidden="true"></i>
                </div>
                <article class="curriculum-module__card">
                  <div class="curriculum-module__header">
                    <div>
                      <p class="eyebrow">${module.code} · Phase ${module.phase}</p>
                      <h2>${module.title}</h2>
                    </div>
                    <span class="status-chip status-chip--${module.status === "current" || module.status === "completed" ? "active" : "neutral"}">${statusLabel(module.status)}</span>
                  </div>
                  <p>${module.description}</p>
                  ${
                    module.lessons.length
                      ? `<ul class="module-lessons">${module.lessons
                          .map(
                            (lesson) => `<li>${
                              lesson.unlocked
                                ? `<a href="#/${lesson.route}"><span aria-hidden="true">${completed.has(lesson.id) ? "✓" : "○"}</span><strong>${lesson.title}</strong><small>${lesson.estimatedTime} min</small></a>`
                                : `<span class="module-lessons__locked"><span aria-hidden="true">◇</span><strong>${lesson.title}</strong><small>Complete the previous lesson</small></span>`
                            }</li>`,
                          )
                          .join("")}</ul>`
                      : module.routes?.length
                        ? `<ul class="module-lessons">${module.routes.map((experience) => `<li><a href="#/${experience.route}"><span aria-hidden="true">→</span><strong>${experience.label}</strong><small>Interactive</small></a></li>`).join("")}</ul>`
                        : `<div class="module-coming-soon"><span aria-hidden="true">◇</span><p>No published activity is mapped to this phase.</p></div>`
                  }
                </article>
              </li>
            `,
          )
          .join("")}
      </ol>
    </div>
  `;
}

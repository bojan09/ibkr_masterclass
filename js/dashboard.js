import {
  DASHBOARD_METRICS,
  KNOWLEDGE_AREAS,
  LEARNING_TRACKS,
} from "../data/dashboard.js";
import { LESSONS, getLessonById } from "../data/lessons.js";
import { deriveLearningProgress, getNextLesson } from "./progress.js";
import { deriveReadiness } from "./assessment.js";
import { getModuleById } from "../data/courses.js";

export function getMetricDisplay({ value, total, format }) {
  if (format === "fraction") return `${value} / ${total}`;
  if (format === "percent") return `${value}%`;
  return String(value);
}

export function getPhaseProgress(completed, total) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.round(Math.min(1, Math.max(0, completed / total)) * 100);
}

function renderMetricCards(state, progress) {
  const readiness = deriveReadiness(state);
  const liveMetrics = DASHBOARD_METRICS.map((metric) => {
    if (metric.label === "Modules completed") return { ...metric, value: progress.completedModuleIds.length };
    if (metric.label === "Lessons completed") return { ...metric, value: progress.completedLessons, total: progress.totalLessons };
    if (metric.label === "Quiz average") return { ...metric, value: readiness.knowledge };
    return metric;
  });

  return liveMetrics
    .map(
      (metric, index) => `
        <article class="metric-card">
          <div class="metric-card__topline">
            <span class="metric-card__index">0${index + 1}</span>
            <span class="metric-card__trend">${metric.value > 0 ? "Updated" : "Baseline"}</span>
          </div>
          <strong class="metric-card__value tabular">${getMetricDisplay(metric)}</strong>
          <span class="metric-card__label">${metric.label}</span>
        </article>
      `,
    )
    .join("");
}

function renderRoadmap(progress) {
  return progress.modules.map(
    (phase) => `
      <li class="roadmap-phase roadmap-phase--${phase.status}">
        <div class="roadmap-phase__node" aria-hidden="true">${String(phase.phase).padStart(2, "0")}</div>
        <div class="roadmap-phase__body">
          <span class="roadmap-phase__code tabular">${phase.code}</span>
          <h3>${phase.title}</h3>
          <span class="roadmap-phase__status">${{ completed: "Completed", current: "Continue", available: "Available", locked: "Locked" }[phase.status]}</span>
        </div>
      </li>
    `,
  ).join("");
}

function renderKnowledgeScores(state) {
  const scoreIds = {
    "IBKR Desktop": "platform-check",
    Options: "options-check",
    "Order execution": "orders-check",
    "Risk management": "risk-check",
  };
  return KNOWLEDGE_AREAS.map(
    (area) => {
      const score = state.quizScores[scoreIds[area.name]]?.percent ?? 0;
      return `
      <li class="knowledge-row">
        <div class="knowledge-row__header">
          <div>
            <strong>${area.name}</strong>
            <span>${area.description}</span>
          </div>
          <span class="knowledge-row__score tabular">${score}<small>/100</small></span>
        </div>
        <div class="meter" role="progressbar" aria-label="${area.name} knowledge score" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score}">
          <span class="meter__fill ${score === 0 ? "meter__fill--zero" : ""}" style="width:${score}%"></span>
        </div>
      </li>
    `; },
  ).join("");
}

function renderTracks() {
  return LEARNING_TRACKS.map(
    (track) => `
      <article class="track-card track-card--${track.status}">
        <div class="track-card__header">
          <span class="eyebrow">${track.eyebrow}</span>
          <span class="status-chip ${track.status === "active" ? "status-chip--active" : "status-chip--neutral"}">
            <span aria-hidden="true">${track.status === "active" ? "●" : "◇"}</span>
            ${track.status === "active" ? "Current" : "Locked"}
          </span>
        </div>
        <h3>${track.name}</h3>
        <p>${track.description}</p>
        <span class="track-card__range tabular">${track.modules}</span>
      </article>
    `,
  ).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderActivityPanel(title, items, emptyCopy, route) {
  return `
    <article class="activity-card">
      <div class="panel-heading panel-heading--compact">
        <div>
          <p class="eyebrow">Personal workspace</p>
          <h3>${title}</h3>
        </div>
        <a class="counter tabular" href="#/${route}" aria-label="View ${items.length} ${title.toLowerCase()}">${String(items.length).padStart(2, "0")}</a>
      </div>
      ${
        items.length
          ? `<ul class="activity-list">${items
              .slice(0, 2)
              .map((item) => `<li><a href="#/${item.route}"><span>${item.kicker}</span><strong>${item.title}</strong></a></li>`)
              .join("")}</ul>`
          : `<div class="empty-state"><span class="empty-state__mark" aria-hidden="true">+</span><p>${emptyCopy}</p><a href="#/${route}">Open ${title.toLowerCase()}</a></div>`
      }
    </article>
  `;
}

export function renderDashboard(container, state) {
  const progress = deriveLearningProgress(state);
  const nextLesson = getNextLesson(state) ?? LESSONS[0];
  const nextModule = getModuleById(nextLesson.moduleId);
  const activeModule = progress.modules.find((module) => module.status === "current" || module.status === "available") ?? progress.modules.at(-1);
  const recentLessons = state.recentLessons.map(getLessonById).filter(Boolean).map((lesson) => ({ route: lesson.route, kicker: `${lesson.estimatedTime} min`, title: lesson.title }));
  const bookmarkedLessons = state.bookmarks.map(getLessonById).filter(Boolean).map((lesson) => ({ route: lesson.route, kicker: "Bookmarked", title: lesson.title }));
  const notedLessons = Object.entries(state.notes)
    .map(([id, note]) => ({ lesson: getLessonById(id), note }))
    .filter(({ lesson, note }) => lesson && note?.text)
    .map(({ lesson, note }) => ({ route: lesson.route, kicker: escapeHtml(note.text.slice(0, 34)), title: lesson.title }));

  container.innerHTML = `
    <div class="dashboard-page">
      <section class="hero" aria-labelledby="dashboard-title">
        <div class="hero__content">
          <div class="hero__kicker">
            <span class="live-dot" aria-hidden="true"></span>
            Learning system online
            <span class="hero__divider" aria-hidden="true"></span>
            Curriculum 01–13
          </div>
          <h1 id="dashboard-title">Master the genuine <span>IBKR platforms.</span></h1>
          <p class="hero__subtitle">Practice in official IBKR Desktop and TWS paper applications with sourced missions, then use Concept Labs for order, options, and risk mechanics.</p>
          <div class="hero__actions">
            <a class="button button--primary" href="#/platforms">Open platform tracks <span aria-hidden="true">→</span></a>
            <a class="button button--secondary" href="#/${nextLesson.route}">Continue foundations</a>
          </div>
          <p class="hero__disclaimer"><span aria-hidden="true">i</span> Educational environment · No live market data or trading</p>
        </div>
        <div class="hero__progress">
          <div class="progress-ring" role="progressbar" aria-label="Published lesson progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.percent}">
            <div class="progress-ring__inner">
              <strong class="tabular">${progress.percent}%</strong>
              <span>Overall</span>
            </div>
          </div>
          <div class="hero__phase">
            <span>Current learning phase</span>
            <strong>${String(activeModule.phase).padStart(2, "0")} · ${activeModule.title}</strong>
          </div>
        </div>
      </section>

      <section class="metric-grid" aria-label="Learning statistics">
        ${renderMetricCards(state, progress)}
        <article class="metric-card metric-card--accent">
          <div class="metric-card__topline">
            <span class="metric-card__index">04</span>
            <span class="metric-card__trend">Active</span>
          </div>
          <strong class="metric-card__phase">Phase ${String(activeModule.phase).padStart(2, "0")}</strong>
          <span class="metric-card__label">Current learning phase</span>
        </article>
      </section>

      <section class="dashboard-grid dashboard-grid--primary">
        <article class="panel recommended-card">
          <div class="recommended-card__number tabular" aria-hidden="true">01</div>
          <div class="recommended-card__content">
            <p class="eyebrow">${progress.percent === 100 ? "Recommended review" : "Recommended next lesson"}</p>
            <h2>${nextLesson.title}</h2>
            <p>${nextLesson.summary}</p>
            <ul class="meta-list" aria-label="Lesson details">
              <li>${nextLesson.difficulty}</li><li>${nextLesson.estimatedTime} min</li><li>Phase ${nextModule.phase}</li>
            </ul>
            <a class="text-link" href="#/${nextLesson.route}">${progress.percent === 100 ? "Review lesson" : "Open lesson"} <span aria-hidden="true">→</span></a>
          </div>
          <div class="recommended-card__diagram" aria-hidden="true">
            <span class="diagram-node">YOU</span><i></i><span class="diagram-node diagram-node--accent">BROKER</span><i></i><span class="diagram-node">MARKET</span>
          </div>
        </article>

        <article class="panel knowledge-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Competency map</p>
              <h2>Knowledge scores</h2>
            </div>
            <span class="status-chip status-chip--neutral">Baseline</span>
          </div>
          <ul class="knowledge-list">
            ${renderKnowledgeScores(state)}
          </ul>
        </article>
      </section>

      <section class="panel roadmap-panel" aria-labelledby="roadmap-heading">
        <div class="panel-heading roadmap-panel__heading">
          <div>
            <p class="eyebrow">Your route to platform fluency</p>
            <h2 id="roadmap-heading">Learning roadmap</h2>
          </div>
          <div class="roadmap-legend" aria-label="Roadmap status legend">
            <span><i class="legend-dot legend-dot--current"></i> Current</span>
            <span><i class="legend-dot"></i> Locked</span>
          </div>
        </div>
        <ol class="roadmap-list">
          ${renderRoadmap(progress)}
        </ol>
      </section>

      <section aria-labelledby="tracks-heading">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Progressive curriculum</p>
            <h2 id="tracks-heading">Learning tracks</h2>
          </div>
          <p>Advance only after the previous concepts are understood.</p>
        </div>
        <div class="track-grid">${renderTracks()}</div>
      </section>

      <section class="dashboard-grid dashboard-grid--activity" aria-label="Recent learning activity and workspace">
        <article class="activity-card activity-card--recent">
          <div class="panel-heading panel-heading--compact">
            <div>
              <p class="eyebrow">Pick up where you left off</p>
              <h3>Recent lessons</h3>
            </div>
            <span class="counter tabular">${String(recentLessons.length).padStart(2, "0")}</span>
          </div>
          ${
            recentLessons.length
              ? `<ul class="activity-list activity-list--recent">${recentLessons.slice(0, 3).map((item) => `<li><a href="#/${item.route}"><span>${item.kicker}</span><strong>${item.title}</strong></a></li>`).join("")}</ul>`
              : `<div class="empty-state empty-state--horizontal"><span class="empty-state__mark" aria-hidden="true">↗</span><div><p>Your learning history starts here.</p><span>Open your first lesson to begin.</span></div></div>`
          }
        </article>
        ${renderActivityPanel("Bookmarks", bookmarkedLessons, "Save important lessons for quick review.", "bookmarks")}
        ${renderActivityPanel("Personal notes", notedLessons, "Capture questions and observations beside lessons.", "my-notes")}
      </section>
    </div>
  `;

  container.querySelector(".progress-ring")?.style.setProperty("--ring-progress", `${progress.percent * 3.6}deg`);
}

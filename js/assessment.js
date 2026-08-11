import { ASSESSMENT_QUIZZES, SIMULATOR_CHALLENGES } from "../data/assessments.js";
import { PRACTICE_EXERCISES, TRADE_CHECKLIST } from "../data/practice.js";
import { PLATFORM_WORKFLOWS } from "../data/platform-workflows.js";
import { PLATFORM_EQUIVALENTS } from "../data/platform-equivalents.js";

function round(value) { return Math.round(value); }

export function gradeQuiz(quiz, answers) {
  const results = quiz.questions.map((question) => {
    const raw = answers[question.id];
    const answerIndex = raw === undefined ? undefined : Number(raw);
    return { questionId: question.id, answerIndex, correctIndex: question.correctIndex, isCorrect: answerIndex === question.correctIndex, explanation: question.explanation };
  });
  const correct = results.filter((result) => result.isCorrect).length;
  return { quizId: quiz.id, correct, total: quiz.questions.length, percent: round(correct / quiz.questions.length * 100), results };
}

export function deriveReadiness(state) {
  const scoreValues = Object.values(state.quizScores).map((score) => typeof score === "number" ? score : score?.percent).filter(Number.isFinite);
  const knowledge = scoreValues.length ? round(scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length) : 0;
  const completedKeys = Object.entries(state.checklistCompletion).filter(([, complete]) => complete).map(([id]) => id);
  const practice = round(Math.min(1, completedKeys.filter((id) => id.startsWith("exercise:")).length / PRACTICE_EXERCISES.length) * 100);
  const process = round(Math.min(1, completedKeys.filter((id) => id.startsWith("check-")).length / TRADE_CHECKLIST.length) * 100);
  const reflection = round(Math.min(1, state.journalEntries.length / 3) * 100);
  const platformEvidence = state.platformEvidence ?? {};
  const desktopWorkflows = PLATFORM_WORKFLOWS.filter((workflow) => workflow.platformId === "ibkr-desktop");
  const twsWorkflows = PLATFORM_WORKFLOWS.filter((workflow) => workflow.platformId === "tws-mosaic");
  const desktop = round(desktopWorkflows.filter((workflow) => platformEvidence[workflow.id]).length / desktopWorkflows.length * 100);
  const tws = round(twsWorkflows.filter((workflow) => platformEvidence[workflow.id]).length / twsWorkflows.length * 100);
  const paired = PLATFORM_EQUIVALENTS.filter((item) => platformEvidence[item.desktop.workflowId] && platformEvidence[item.tws.workflowId]).length;
  const crossPlatform = round(paired / PLATFORM_EQUIVALENTS.length * 100);
  const overall = round((knowledge + practice + process + reflection + desktop + tws + crossPlatform) / 7);
  const status = overall >= 85 ? "Strong curriculum evidence" : overall >= 60 ? "Developing consistency" : "Building foundations";
  return { knowledge, practice, process, reflection, desktop, tws, crossPlatform, overall, status };
}

function renderReadiness(readiness) {
  const domains = [{ label: "Knowledge", value: readiness.knowledge }, { label: "Practice", value: readiness.practice }, { label: "Process", value: readiness.process }, { label: "Reflection", value: readiness.reflection }, { label: "IBKR Desktop missions", value: readiness.desktop }, { label: "TWS missions", value: readiness.tws }, { label: "Cross-platform", value: readiness.crossPlatform }];
  return `<section class="readiness-dashboard"><div class="readiness-overall"><p class="eyebrow">Curriculum evidence</p><strong>${readiness.overall}</strong><span>/ 100</span><h2>${readiness.status}</h2><p>This score measures completed evidence inside IBKR Platform Mastery. It is not trading authorization, suitability, a prediction, or a guarantee of safety.</p></div><div class="readiness-domains">${domains.map((domain) => `<article><div><span>${domain.label}</span><strong>${domain.value}</strong></div><div class="meter" role="progressbar" aria-label="${domain.label} evidence" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${domain.value}"><i style="width:${domain.value}%"></i></div></article>`).join("")}</div></section>`;
}

function renderQuiz(quiz, result) {
  return `<section class="assessment-quiz"><header><div><p class="eyebrow">${quiz.domain}</p><h2>${quiz.title}</h2><p>${quiz.questions.length} questions · choose the best evidence-based answer</p></div>${result ? `<strong>${result.correct} / ${result.total}<small>${result.percent}%</small></strong>` : ""}</header><form data-quiz-form="${quiz.id}">${quiz.questions.map((question, index) => { const questionResult = result?.results.find((item) => item.questionId === question.id); return `<fieldset class="${questionResult ? (questionResult.isCorrect ? "is-correct" : "is-incorrect") : ""}"><legend><span>${String(index + 1).padStart(2, "0")}${question.scenario ? " · Scenario" : ""}</span>${question.prompt}</legend>${question.choices.map((choice, choiceIndex) => `<label><input type="radio" name="${question.id}" value="${choiceIndex}" ${questionResult?.answerIndex === choiceIndex ? "checked" : ""} ${result ? "disabled" : ""}><span>${choice}</span></label>`).join("")}${questionResult ? `<div class="answer-explanation"><strong>${questionResult.isCorrect ? "Correct reasoning" : `Best answer: ${question.choices[question.correctIndex]}`}</strong><p>${question.explanation}</p></div>` : ""}</fieldset>`; }).join("")}${result ? `<button class="button button--secondary" type="button" data-retry-quiz>Try this assessment again</button>` : `<button class="button button--primary" type="submit">Grade assessment</button>`}</form></section>`;
}

function renderChallenges() {
  return `<section class="assessment-challenges"><header><p class="eyebrow">Practical challenges</p><h2>Demonstrate the workflow</h2><p>Platform missions require observable evidence in genuine paper applications. Concept Labs test financial mechanics separately.</p></header><div>${SIMULATOR_CHALLENGES.map((challenge, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h3>${challenge.title}</h3><p>${challenge.goal}</p><a href="#/${challenge.route}">Open challenge →</a></article>`).join("")}</div></section>`;
}

export function renderAssessmentPage(container, { storage } = {}) {
  let selectedQuizId = "final-exam";
  let currentResult;
  const render = () => {
    const readiness = deriveReadiness(storage.get());
    const selected = ASSESSMENT_QUIZZES.find((quiz) => quiz.id === selectedQuizId);
    container.innerHTML = `<article class="assessment-page"><header class="simulator-intro"><div><p class="eyebrow">Phase 13 · Final assessment</p><h1>Explain the state before acting</h1><p>Quizzes, sourced platform missions, and Concept Labs test contract, order, options, and risk reasoning—not market prediction.</p></div><span class="simulation-badge">EDUCATIONAL ASSESSMENT</span></header>${renderReadiness(readiness)}<nav class="assessment-picker" aria-label="Assessments">${ASSESSMENT_QUIZZES.map((quiz) => `<button type="button" data-select-quiz="${quiz.id}" class="${quiz.id === selectedQuizId ? "is-active" : ""}"><span>${quiz.domain}</span><strong>${quiz.title}</strong><small>${storage.get("quizScores")[quiz.id]?.percent ?? "—"}% best</small></button>`).join("")}</nav>${renderQuiz(selected, currentResult)}${renderChallenges()}</article>`;
  };
  const handleClick = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.selectQuiz) { selectedQuizId = button.dataset.selectQuiz; currentResult = undefined; }
    else if (button.hasAttribute("data-retry-quiz")) currentResult = undefined;
    else return;
    render();
  };
  const handleSubmit = (event) => {
    if (!event.target.matches("[data-quiz-form]")) return;
    event.preventDefault();
    const quiz = ASSESSMENT_QUIZZES.find((item) => item.id === event.target.dataset.quizForm);
    currentResult = gradeQuiz(quiz, Object.fromEntries(new FormData(event.target)));
    const scores = storage.get("quizScores");
    const previous = scores[quiz.id];
    storage.set("quizScores", { ...scores, [quiz.id]: { percent: Math.max(previous?.percent ?? 0, currentResult.percent), lastPercent: currentResult.percent, correct: currentResult.correct, total: currentResult.total, attempts: (previous?.attempts ?? 0) + 1, lastAttemptAt: new Date().toISOString() } });
    render();
  };
  container.addEventListener("click", handleClick);
  container.addEventListener("submit", handleSubmit);
  render();
  return () => { container.removeEventListener("click", handleClick); container.removeEventListener("submit", handleSubmit); };
}

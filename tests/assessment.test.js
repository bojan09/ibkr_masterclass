import test from "node:test";
import assert from "node:assert/strict";

import { ASSESSMENT_QUIZZES, SIMULATOR_CHALLENGES } from "../data/assessments.js";
import { deriveReadiness, gradeQuiz } from "../js/assessment.js";

test("assessment bank has unique quizzes, valid answers, scenarios, and a final exam", () => {
  assert.ok(ASSESSMENT_QUIZZES.length >= 5);
  assert.equal(new Set(ASSESSMENT_QUIZZES.map((quiz) => quiz.id)).size, ASSESSMENT_QUIZZES.length);
  assert.ok(ASSESSMENT_QUIZZES.some((quiz) => quiz.id === "final-exam" && quiz.questions.length >= 10));
  assert.ok(ASSESSMENT_QUIZZES.flatMap((quiz) => quiz.questions).some((question) => question.scenario));
  assert.ok(ASSESSMENT_QUIZZES.flatMap((quiz) => quiz.questions).every((question) => question.correctIndex >= 0 && question.correctIndex < question.choices.length && question.explanation.length >= 30));
  assert.ok(SIMULATOR_CHALLENGES.length >= 4);
});

test("quiz grading reports unanswered questions and explanatory results", () => {
  const quiz = ASSESSMENT_QUIZZES[0];
  const answers = Object.fromEntries(quiz.questions.map((question) => [question.id, question.correctIndex]));
  const perfect = gradeQuiz(quiz, answers);
  assert.equal(perfect.percent, 100);
  assert.equal(perfect.correct, quiz.questions.length);
  assert.ok(perfect.results.every((result) => result.isCorrect && result.explanation));
  assert.ok(gradeQuiz(quiz, {}).results.every((result) => result.answerIndex === undefined));
});

test("readiness uses knowledge, practice, process, and reflection evidence", () => {
  const empty = deriveReadiness({ quizScores: {}, checklistCompletion: {}, journalEntries: [] });
  assert.deepEqual(empty, { knowledge: 0, practice: 0, process: 0, reflection: 0, overall: 0, status: "Building foundations" });
  const strong = deriveReadiness({ quizScores: { one: { percent: 90 }, two: { percent: 80 } }, checklistCompletion: { "exercise:a": true, "exercise:b": true, "exercise:c": true, "exercise:d": true, "exercise:e": true, "check-a": true, "check-b": true, "check-c": true, "check-d": true, "check-e": true, "check-f": true, "check-g": true, "check-h": true, "check-i": true, "check-j": true }, journalEntries: [{}, {}, {}] });
  assert.equal(strong.knowledge, 85);
  assert.equal(strong.practice, 100);
  assert.equal(strong.process, 100);
  assert.equal(strong.reflection, 100);
  assert.equal(strong.status, "Strong curriculum evidence");
});

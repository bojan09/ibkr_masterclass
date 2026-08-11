import test from "node:test";
import assert from "node:assert/strict";

import { PLATFORM_WORKFLOWS, getPlatformWorkflows, getWorkflow, getWorkflowByRoute } from "../data/platform-workflows.js";
import { canCompleteWorkflow, completeWorkflow, isWorkflowStale } from "../js/platform-missions.js";
import { createStorage } from "../js/storage.js";

function memoryBackend() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

test("every real-app mission carries safety, evidence, recovery, and official sources", () => {
  assert.ok(PLATFORM_WORKFLOWS.length >= 2);
  for (const workflow of PLATFORM_WORKFLOWS) {
    assert.ok(workflow.safetyGate.length >= 30);
    assert.ok(workflow.steps.length >= 3);
    assert.ok(workflow.observations.length >= 1);
    assert.ok(workflow.mistakes.length >= 1);
    assert.ok(workflow.recovery.length >= 1);
    assert.ok(workflow.evidence.length >= 2);
    assert.match(workflow.asOf, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(workflow.reviewAfter, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(workflow.sources.every((source) => /(?:interactivebrokers\.com|ibkrguides\.com)/.test(new URL(source.url).hostname)));
    assert.equal(getWorkflow(workflow.id), workflow);
    assert.equal(getWorkflowByRoute(workflow.route), workflow);
  }
});

test("mission completion requires every declared evidence item", () => {
  const workflow = PLATFORM_WORKFLOWS[0];
  const completeEvidence = workflow.evidence.map((item) => item.id);
  assert.equal(canCompleteWorkflow(workflow, []), false);
  assert.equal(canCompleteWorkflow(workflow, completeEvidence.slice(0, -1)), false);
  assert.equal(canCompleteWorkflow(workflow, completeEvidence), true);
});

test("completion stores auditable evidence and rejects incomplete claims", () => {
  const storage = createStorage({ backend: memoryBackend(), key: "mission-state" });
  const workflow = PLATFORM_WORKFLOWS[0];
  const evidence = workflow.evidence.map((item) => item.id);
  assert.throws(() => completeWorkflow(storage, workflow.id, [], "2026-08-11T12:00:00.000Z"), /Complete every evidence check/);

  const record = completeWorkflow(storage, workflow.id, evidence, "2026-08-11T12:00:00.000Z");
  assert.deepEqual(record, { completedAt: "2026-08-11T12:00:00.000Z", verifiedAsOf: workflow.asOf, evidence });
  assert.deepEqual(storage.get("platformEvidence")[workflow.id], record);
});

test("mission source review status changes after its review date", () => {
  const workflow = PLATFORM_WORKFLOWS[0];
  assert.equal(isWorkflowStale(workflow, new Date("2026-09-01")), false);
  assert.equal(isWorkflowStale(workflow, new Date("2027-03-01")), true);
  assert.equal(getPlatformWorkflows(workflow.platformId).includes(workflow), true);
});

test("Desktop and TWS tracks cover orientation, orders, options, and position review", () => {
  assert.deepEqual(getPlatformWorkflows("ibkr-desktop").map((item) => item.id), [
    "desktop-install", "desktop-paper-check", "desktop-interface", "desktop-portfolio",
    "desktop-watchlist", "desktop-contract-search", "desktop-chart", "desktop-customize",
    "desktop-rapid-order", "desktop-preview", "desktop-monitor-order", "desktop-modify-cancel",
    "desktop-option-chain", "desktop-strategy-builder", "desktop-position-review",
  ]);
  assert.deepEqual(getPlatformWorkflows("tws-mosaic").map((item) => item.id), [
    "tws-install", "tws-paper-check", "tws-mosaic-layout", "tws-window-grouping", "tws-monitor",
    "tws-quote", "tws-chart", "tws-portfolio", "tws-activity", "tws-customize",
    "tws-order-entry", "tws-order-preview", "tws-order-monitor", "tws-attached-orders",
    "tws-option-chain", "tws-combination", "tws-risk-review",
  ]);
});

test("submission-capable missions require four independent order safety checks", () => {
  const required = ["confirm-platform", "confirm-paper", "confirm-contract", "confirm-order"];
  const submissionMissions = PLATFORM_WORKFLOWS.filter((item) => item.submissionCapable);
  assert.ok(submissionMissions.length >= 8);
  for (const workflow of submissionMissions) {
    const evidence = workflow.evidence.map((item) => item.id);
    assert.ok(required.every((id) => evidence.includes(id)), workflow.id);
    assert.doesNotMatch(workflow.steps.join(" "), /live account|submit a live|real money/i);
  }
});

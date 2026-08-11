import { LESSONS } from "./lessons.js";

export const DASHBOARD_METRICS = [
  { label: "Modules completed", value: 0, total: 13, format: "fraction" },
  { label: "Lessons completed", value: 0, total: LESSONS.length, format: "fraction" },
  { label: "Quiz average", value: 0, total: 100, format: "percent" },
];

export const KNOWLEDGE_AREAS = [
  { name: "IBKR Desktop", score: 0, description: "Navigation and platform workflow" },
  { name: "Options", score: 0, description: "Contracts, chains, Greeks and strategies" },
  { name: "Order execution", score: 0, description: "Order behavior and trade lifecycle" },
  { name: "Risk management", score: 0, description: "Exposure, margin and position sizing" },
];

export const LEARNING_TRACKS = [
  {
    name: "Beginner",
    status: "active",
    eyebrow: "Track 01",
    description: "Build the vocabulary and platform habits that make every later lesson easier.",
    modules: "Phases 1–4",
  },
  {
    name: "Intermediate",
    status: "locked",
    eyebrow: "Track 02",
    description: "Move from market structure into deliberate order entry and options mechanics.",
    modules: "Phases 5–9",
  },
  {
    name: "Advanced",
    status: "locked",
    eyebrow: "Track 03",
    description: "Combine platform workflows, risk controls and repeatable paper-trading practice.",
    modules: "Phases 10–13",
  },
];

export const ROADMAP_PHASES = CURRICULUM_MODULES.map((module, index) => ({
  number: module.phase,
  title: module.title,
  status: index === 0 ? "current" : "locked",
  code: module.code,
}));
import { CURRICULUM_MODULES } from "./courses.js";

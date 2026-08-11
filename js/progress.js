import { CURRICULUM_MODULES } from "../data/courses.js";
import { LESSONS, getLessonById } from "../data/lessons.js";

function requireLesson(id) {
  const lesson = getLessonById(id);
  if (!lesson) throw new Error(`Unknown lesson: ${id}`);
  return lesson;
}

function validCompletedIds(state) {
  const lessonIds = new Set(LESSONS.map((lesson) => lesson.id));
  return [...new Set(state.completedLessons)].filter((id) => lessonIds.has(id));
}

export function deriveLearningProgress(state) {
  const completedIds = validCompletedIds(state);
  const completedSet = new Set(completedIds);
  const completedModuleIds = CURRICULUM_MODULES.filter(
    (module) => module.lessonIds.length > 0 && module.lessonIds.every((id) => completedSet.has(id)),
  ).map((module) => module.id);
  const completedModuleSet = new Set(completedModuleIds);

  const modules = CURRICULUM_MODULES.map((module, index) => {
    let status = "locked";
    if (completedModuleSet.has(module.id)) status = "completed";
    else if (index === 0 || completedModuleSet.has(CURRICULUM_MODULES[index - 1]?.id)) {
      status = module.lessonIds.length > 0 ? "current" : "available";
    } else if (module.routes?.length) status = "available";

    const completedLessonCount = module.lessonIds.filter((id) => completedSet.has(id)).length;
    return { ...module, status, completedLessonCount, lessonCount: module.lessonIds.length };
  });

  return {
    completedLessons: completedIds.length,
    totalLessons: LESSONS.length,
    percent: LESSONS.length ? Math.round((completedIds.length / LESSONS.length) * 100) : 0,
    completedModuleIds,
    modules,
  };
}

export function toggleLessonComplete(storage, id) {
  requireLesson(id);
  const completed = new Set(validCompletedIds(storage.get()));
  const isNowComplete = !completed.has(id);
  if (isNowComplete) completed.add(id);
  else {
    const lessonIndex = LESSONS.findIndex((lesson) => lesson.id === id);
    for (const lesson of LESSONS.slice(lessonIndex)) completed.delete(lesson.id);
  }

  storage.set("completedLessons", [...completed]);
  const progress = deriveLearningProgress(storage.get());
  storage.set("completedModules", progress.completedModuleIds);
  return isNowComplete;
}

export function getNextLesson(state) {
  const completed = new Set(validCompletedIds(state));
  return LESSONS.find((lesson) => !completed.has(lesson.id));
}

export function isLessonUnlocked(state, id) {
  const index = LESSONS.findIndex((lesson) => lesson.id === id);
  if (index < 0) return false;
  if (index === 0) return true;
  return validCompletedIds(state).includes(LESSONS[index - 1].id);
}

export function recordRecentLesson(storage, id) {
  requireLesson(id);
  const recent = storage.get("recentLessons").filter((lessonId) => lessonId !== id);
  storage.set("recentLessons", [id, ...recent].slice(0, 5));
  return storage.get("recentLessons");
}

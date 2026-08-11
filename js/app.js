import { renderDashboard } from "./dashboard.js";
import { renderBookmarksPage } from "./bookmarks.js";
import { getModuleById } from "../data/courses.js";
import { LESSONS, getLessonByRoute } from "../data/lessons.js";
import { renderLesson, renderLockedLesson } from "./lessons.js";
import { renderNotesPage } from "./notes.js";
import { deriveLearningProgress, isLessonUnlocked } from "./progress.js";
import { renderRoadmapPage } from "./roadmap.js";
import {
  getPlannedRouteContext,
  renderNavigation,
  renderPlannedPage,
  setActiveNavigation,
} from "./navigation.js";
import { createRouter } from "./router.js";
import { createStorage } from "./storage.js";
import { createSidebarController } from "./ui.js";
import { createThemeController } from "./theme.js";
import { renderDesktopSimulator } from "./desktop-simulator.js";
import { renderPlatformHub } from "./platform-hub.js";
import { renderPlatformMissions } from "./platform-missions.js";
import { PLATFORM_WORKFLOWS, getWorkflowByRoute } from "../data/platform-workflows.js";
import { renderOrderSimulator } from "./order-simulator.js";
import { renderOptionsFundamentals } from "./options-fundamentals.js";
import { renderOptionsChain } from "./options-chain.js";
import { renderGreeksSimulator } from "./greeks-simulator.js";
import { renderPayoffSimulator } from "./payoff-simulator.js";
import { renderOptionsWorkflow } from "./options-workflow.js";
import { renderRiskLab } from "./risk-lab.js";
import { renderPracticePage } from "./practice.js";
import { renderAssessmentPage } from "./assessment.js";
import { REFERENCE_TOPICS } from "../data/reference.js";
import { renderReferencePage } from "./reference.js";
import { getKnownRoutes } from "../data/navigation.js";
import {
  DESKTOP_MODES,
  PLATFORM_HUB_ROUTES,
  GREEKS_ROUTES,
  OPTION_CHAIN_ROUTES,
  OPTION_FUNDAMENTAL_TOPICS,
  ORDER_VIEWS,
  PAYOFF_ROUTES,
  PRACTICE_VIEWS,
} from "../data/route-manifest.js";

function getRequiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Required application element is missing: #${id}`);
  return element;
}

function showFatalError(error) {
  const main = document.getElementById("page-content") ?? document.body;
  main.innerHTML = `
    <section class="fatal-error" role="alert">
      <p class="eyebrow">Application error</p>
      <h1>The learning environment could not start.</h1>
      <p>Refresh the page to try again. Your locally saved learning data has not been sent anywhere.</p>
    </section>
  `;
  console.error("IBKR Platform Mastery initialization failed", error);
}

function updateShellProgress(storage) {
  const progress = deriveLearningProgress(storage.get());
  const activeModule = progress.modules.find((module) => module.status === "current" || module.status === "available");
  const meter = getRequiredElement("app-sidebar").querySelector("[data-shell-progress]");
  meter.setAttribute("aria-valuenow", String(progress.percent));
  meter.querySelector(".meter__fill").style.width = `${progress.percent}%`;
  document.querySelector("[data-shell-progress-value]").textContent = `${progress.percent}%`;
  document.querySelector("[data-shell-phase]").textContent = `Phase ${String(activeModule?.phase ?? 13).padStart(2, "0")}`;
  document.querySelector("[data-shell-completion]").textContent = `${progress.completedLessons} / ${progress.totalLessons} lessons`;
}

function startApplication() {
  const navigationRoot = getRequiredElement("sidebar-nav");
  const pageContent = getRequiredElement("page-content");
  const appMain = getRequiredElement("app-main");
  const breadcrumbSection = getRequiredElement("breadcrumb-section");
  const breadcrumbPage = getRequiredElement("breadcrumb-page");
  const syncStatus = getRequiredElement("sync-status");
  const storage = createStorage();
  const state = storage.get();
  const themeController = createThemeController({
    select: getRequiredElement("theme-select"),
    storage,
  });

  storage.set("settings", state.settings);
  syncStatus.innerHTML = storage.isPersistent()
    ? '<span aria-hidden="true">◇</span> Saved locally'
    : '<span aria-hidden="true">△</span> Session only';
  renderNavigation(navigationRoot);
  updateShellProgress(storage);

  const sidebarController = createSidebarController({
    sidebar: getRequiredElement("app-sidebar"),
    toggle: getRequiredElement("menu-toggle"),
    closeButton: getRequiredElement("sidebar-close"),
    backdrop: getRequiredElement("sidebar-backdrop"),
  });

  let hasRendered = false;
  let pageCleanup = () => {};
  const knownRoutes = new Set([...getKnownRoutes(), ...LESSONS.map((lesson) => lesson.route), "platforms/desktop/missions", "platforms/tws/missions", ...PLATFORM_WORKFLOWS.map((workflow) => workflow.route)]);
  const handleLearningStateChange = () => {
    updateShellProgress(storage);
    syncStatus.innerHTML = storage.isPersistent()
      ? '<span aria-hidden="true">◇</span> Saved locally'
      : '<span aria-hidden="true">△</span> Session only';
  };
  const renderRoute = ({ name, known }) => {
    pageCleanup();
    pageCleanup = () => {};
    const lesson = getLessonByRoute(name);
    const platformWorkflow = getWorkflowByRoute(name);
    setActiveNavigation(navigationRoot, lesson?.navRoute ?? name);

    if (name === "dashboard") {
      breadcrumbSection.textContent = "Learning center";
      breadcrumbPage.textContent = "Dashboard";
      document.title = "Dashboard · IBKR Platform Mastery";
      renderDashboard(pageContent, storage.get());
    } else if (name === "roadmap") {
      breadcrumbSection.textContent = "Learning center";
      breadcrumbPage.textContent = "Roadmap";
      document.title = "Learning roadmap · IBKR Platform Mastery";
      renderRoadmapPage(pageContent, storage.get());
    } else if (name === "my-notes") {
      breadcrumbSection.textContent = "Personal workspace";
      breadcrumbPage.textContent = "My notes";
      document.title = "My notes · IBKR Platform Mastery";
      pageCleanup = renderNotesPage(pageContent, storage.get());
    } else if (name === "bookmarks") {
      breadcrumbSection.textContent = "Personal workspace";
      breadcrumbPage.textContent = "Bookmarks";
      document.title = "Bookmarks · IBKR Platform Mastery";
      renderBookmarksPage(pageContent, storage.get());
    } else if (name === "platforms/desktop/missions" || name === "platforms/tws/missions") {
      const platformId = name.includes("/desktop/") ? "ibkr-desktop" : "tws-mosaic";
      breadcrumbSection.textContent = "Official-app missions";
      breadcrumbPage.textContent = platformId === "ibkr-desktop" ? "IBKR Desktop" : "TWS / Mosaic";
      document.title = `${breadcrumbPage.textContent} missions · IBKR Platform Mastery`;
      renderPlatformMissions(pageContent, { storage, platformId });
    } else if (platformWorkflow) {
      breadcrumbSection.textContent = "Official-app mission";
      breadcrumbPage.textContent = platformWorkflow.title;
      document.title = `${platformWorkflow.title} · IBKR Platform Mastery`;
      pageCleanup = renderPlatformMissions(pageContent, { storage, platformId: platformWorkflow.platformId, workflowId: platformWorkflow.id });
    } else if (PLATFORM_HUB_ROUTES[name]) {
      breadcrumbSection.textContent = "Official IBKR platforms";
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Platform Mastery`;
      renderPlatformHub(pageContent, { storage, initialPlatform: PLATFORM_HUB_ROUTES[name] });
    } else if (DESKTOP_MODES[name]) {
      breadcrumbSection.textContent = "Concept lab";
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Platform Mastery`;
      pageCleanup = renderDesktopSimulator(pageContent, { storage, initialMode: DESKTOP_MODES[name] });
    } else if (ORDER_VIEWS[name]) {
      breadcrumbSection.textContent = "Orders & execution";
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Masterclass`;
      pageCleanup = renderOrderSimulator(pageContent, { storage, initialView: ORDER_VIEWS[name] });
    } else if (OPTION_FUNDAMENTAL_TOPICS[name]) {
      breadcrumbSection.textContent = "Options fundamentals";
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Masterclass`;
      pageCleanup = renderOptionsFundamentals(pageContent, { initialTopic: OPTION_FUNDAMENTAL_TOPICS[name] });
    } else if (OPTION_CHAIN_ROUTES.has(name)) {
      breadcrumbSection.textContent = "Options chain lab";
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Masterclass`;
      pageCleanup = renderOptionsChain(pageContent);
    } else if (GREEKS_ROUTES.has(name)) {
      breadcrumbSection.textContent = "Greeks & volatility lab";
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Masterclass`;
      pageCleanup = renderGreeksSimulator(pageContent);
    } else if (PAYOFF_ROUTES.has(name)) {
      breadcrumbSection.textContent = "Options strategy lab";
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Masterclass`;
      pageCleanup = renderPayoffSimulator(pageContent);
    } else if (name === "options/ibkr-desktop") {
      breadcrumbSection.textContent = "IBKR options workflow";
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Masterclass`;
      pageCleanup = renderOptionsWorkflow(pageContent, { storage });
    } else if (name === "options/risk" || name.startsWith("account-risk/")) {
      breadcrumbSection.textContent = "Account & risk";
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Masterclass`;
      pageCleanup = renderRiskLab(pageContent, { initialTopic: name.split("/").at(-1) });
    } else if (PRACTICE_VIEWS[name]) {
      breadcrumbSection.textContent = "Practice workspace";
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Masterclass`;
      pageCleanup = renderPracticePage(pageContent, { storage, initialView: PRACTICE_VIEWS[name] });
    } else if (name === "practice/quizzes") {
      breadcrumbSection.textContent = "Assessment center";
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Masterclass`;
      pageCleanup = renderAssessmentPage(pageContent, { storage });
    } else if (name === "reference/glossary" || REFERENCE_TOPICS[name]) {
      breadcrumbSection.textContent = name.startsWith("reference/") ? "Reference desk" : getPlannedRouteContext(name).section;
      breadcrumbPage.textContent = getPlannedRouteContext(name).title;
      document.title = `${getPlannedRouteContext(name).title} · IBKR Masterclass`;
      pageCleanup = renderReferencePage(pageContent, name);
    } else if (lesson && !isLessonUnlocked(storage.get(), lesson.id)) {
      breadcrumbSection.textContent = "Lesson locked";
      breadcrumbPage.textContent = lesson.title;
      document.title = `Lesson locked · IBKR Masterclass`;
      renderLockedLesson(pageContent, lesson);
    } else if (lesson) {
      breadcrumbSection.textContent = `Phase ${getModuleById(lesson.moduleId).phase}`;
      breadcrumbPage.textContent = lesson.title;
      document.title = `${lesson.title} · IBKR Masterclass`;
      pageCleanup = renderLesson(pageContent, lesson, {
        storage,
        onStateChange: handleLearningStateChange,
      });
    } else {
      const context = getPlannedRouteContext(name);
      breadcrumbSection.textContent = known ? context.section : "Not found";
      breadcrumbPage.textContent = context.title;
      document.title = `${context.title} · IBKR Masterclass`;
      renderPlannedPage(pageContent, name);
    }

    sidebarController.close({ restoreFocus: false });
    if (hasRendered) appMain.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
    hasRendered = true;
  };

  const router = createRouter({ routes: knownRoutes, onRoute: renderRoute });
  router.start();

  window.addEventListener(
    "pagehide",
    () => {
      router.stop();
      pageCleanup();
      sidebarController.destroy();
      themeController.destroy();
    },
    { once: true },
  );
}

try {
  startApplication();
} catch (error) {
  showFatalError(error);
}

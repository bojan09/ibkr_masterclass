const SAFE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeRoute(hash = "") {
  let route = String(hash).trim().replace(/^#/, "").split(/[?#]/, 1)[0];

  try {
    route = decodeURIComponent(route);
  } catch {
    return "not-found";
  }

  const segments = route
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.toLowerCase());

  if (segments.length === 0) return "dashboard";
  if (segments.some((segment) => !SAFE_SEGMENT.test(segment))) return "not-found";

  return segments.join("/");
}

export function resolveRoute(hash, routes) {
  const name = normalizeRoute(hash);
  return {
    name,
    known: routes.has(name),
  };
}

export function createRouter({ routes, onRoute, windowRef = globalThis.window }) {
  if (!(routes instanceof Set)) throw new TypeError("Router routes must be a Set");
  if (typeof onRoute !== "function") throw new TypeError("Router onRoute must be a function");
  if (!windowRef) throw new Error("Router requires a browser window");

  const handleRoute = () => onRoute(resolveRoute(windowRef.location.hash, routes));

  return {
    start() {
      windowRef.addEventListener("hashchange", handleRoute);
      handleRoute();
    },
    navigate(route) {
      windowRef.location.hash = `#/${normalizeRoute(route)}`;
    },
    stop() {
      windowRef.removeEventListener("hashchange", handleRoute);
    },
  };
}
